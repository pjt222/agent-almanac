---
name: fit-drift-diffusion-model
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Fit cognitive drift-diffusion models (Ratcliff DDM) to reaction time and
  accuracy data with parameter estimation (drift rate, boundary separation,
  non-decision time), model comparison, and parameter recovery validation.
  Use when modeling binary decision-making with reaction time data, estimating
  cognitive parameters from experimental data, comparing sequential sampling
  model variants, or decomposing speed-accuracy tradeoff effects into
  latent cognitive components.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: diffusion
  complexity: advanced
  language: multi
  tags: diffusion, ddm, drift-diffusion, cognitive, reaction-time, estimation
---

# Fit a Drift-Diffusion Model

Estimate DDM params from RT + accuracy, eval fit vs observed quantiles, compare variants, validate via parameter recovery.

## Use When

- Binary decision-making w/ RT data
- Estimate cognitive params (drift, boundary, non-decision) from exp
- Compare sequential sampling variants
- Validate DDM pipeline recovers known params
- Decompose speed-accuracy tradeoff → latent cognitive components

## In

- **Required**: RT data w/ accuracy (correct/error) per trial
- **Required**: Subject + condition IDs
- **Required**: DDM variant (basic 3-param, full 7-param, hierarchical)
- **Optional**: Prior distributions Bayesian (default weakly informative)
- **Optional**: N simulated datasets for recovery (default 100)
- **Optional**: RT filter bounds s (default 0.1 to 5.0)

## Do

### Step 1: Prepare Data

Clean + format raw behavioral for DDM.

1. Load + inspect columns:

```python
import pandas as pd

data = pd.read_csv("behavioral_data.csv")
required_columns = ["subject_id", "condition", "rt", "accuracy"]
assert all(col in data.columns for col in required_columns), \
    f"Missing columns: {set(required_columns) - set(data.columns)}"
```

2. Filter outlier RTs:

```python
rt_lower = 0.1  # seconds
rt_upper = 5.0  # seconds

n_before = len(data)
data = data[(data["rt"] >= rt_lower) & (data["rt"] <= rt_upper)]
n_removed = n_before - len(data)
print(f"Removed {n_removed} trials ({100*n_removed/n_before:.1f}%) outside [{rt_lower}, {rt_upper}]s")
```

3. Summary stats per subject + condition:

```python
summary = data.groupby(["subject_id", "condition"]).agg(
    n_trials=("rt", "count"),
    mean_rt=("rt", "mean"),
    accuracy=("accuracy", "mean")
).reset_index()
print(summary.describe())
```

4. Verify min trial counts (DDM needs data per cell):

```python
min_trials = summary["n_trials"].min()
assert min_trials >= 40, f"Minimum trials per cell is {min_trials}; need at least 40 for stable estimation"
```

→ Cleaned df, no outliers, ≥40 trials/cell, accuracy 0.50-0.99.

If err: low trial counts → collapse conditions or remove subjects w/ excessive missing. Accuracy ceiling (>0.99) or floor (<0.55) → DDM may not be identifiable, check task difficulty.

### Step 2: Select Variant

Complexity based on research q.

1. Candidate variants:

```python
model_variants = {
    "basic": {
        "params": ["v", "a", "t"],
        "description": "Drift rate, boundary separation, non-decision time",
        "free_params": 3
    },
    "full": {
        "params": ["v", "a", "t", "z", "sv", "sz", "st"],
        "description": "Basic + starting point bias, cross-trial variability",
        "free_params": 7
    },
    "hddm": {
        "params": ["v", "a", "t", "z"],
        "description": "Hierarchical with group-level and subject-level parameters",
        "free_params": "4 per subject + 8 group-level"
    }
}
```

2. Select on data chars:

| Criterion | Basic (3-param) | Full (7-param) | Hierarchical |
|-----------|-----------------|-----------------|--------------|
| Trials per cell | 40-100 | 200+ | 40+ (pooled) |
| Subjects | Any | Any | 10+ |
| Research goal | Group effects | Individual fits | Both levels |
| Error RT shape | Symmetric | Asymmetric | Either |

3. Configure:

```python
selected_variant = "basic"  # adjust based on criteria above
model_config = model_variants[selected_variant]
print(f"Selected: {selected_variant} ({model_config['free_params']} free parameters)")
print(f"Parameters: {', '.join(model_config['params'])}")
```

→ Variant selected w/ justification based trial counts, subjects, research q.

If err: unsure → start basic, add complexity only if residual diagnostics indicate misfit (err RT distribution mismatch).

### Step 3: Estimate

Fit via MLE or Bayesian.

1. MLE via `fast-dm` or Python `pyddm`:

```python
import pyddm

model = pyddm.Model(
    drift=pyddm.DriftConstant(drift=pyddm.Fittable(minval=0, maxval=5)),
    bound=pyddm.BoundConstant(B=pyddm.Fittable(minval=0.3, maxval=3.0)),
    nondecision=pyddm.NonDecisionConstant(t=pyddm.Fittable(minval=0.1, maxval=0.5)),
    overlay=pyddm.OverlayNonDecision(nondectime=pyddm.Fittable(minval=0.1, maxval=0.5)),
    T_dur=5.0,
    dt=0.001,
    dx=0.001
)
```

2. Bayesian via HDDM:

```python
import hddm

hddm_model = hddm.HDDM(data, depends_on={"v": "condition"})
hddm_model.find_starting_values()
hddm_model.sample(5000, burn=1000, thin=2, dbname="traces.db", db="pickle")
```

3. Extract + store:

```python
params = hddm_model.get_group_estimates()
print("Group-level parameter estimates:")
for param_name, stats in params.items():
    print(f"  {param_name}: {stats['mean']:.3f} [{stats['2.5q']:.3f}, {stats['97.5q']:.3f}]")
```

4. Convergence (Bayesian only):

```python
from kabuki.analyze import gelman_rubin

convergence = gelman_rubin(hddm_model)
max_rhat = max(convergence.values())
print(f"Max Gelman-Rubin R-hat: {max_rhat:.3f}")
assert max_rhat < 1.1, f"Chains have not converged (R-hat = {max_rhat:.3f})"
```

→ Param estimates w/ SE or CI. Bayesian: R-hat < 1.1 all params. Drift typ 0.5-4.0, boundary 0.5-2.5, non-decision 0.15-0.50s.

If err: no convergence → (a) tighter bounds, (b) better starting via grid search, (c) longer chains + more burn-in. MLE hits boundary → misspecified.

### Step 4: Evaluate Fit

Compare predicted + observed RT via quantile.

1. Predicted RT quantiles:

```python
import numpy as np

quantiles = [0.1, 0.3, 0.5, 0.7, 0.9]

predicted_rts = model.simulate(n_trials=10000)
pred_quantiles = np.quantile(predicted_rts[predicted_rts > 0], quantiles)  # correct
pred_quantiles_err = np.quantile(np.abs(predicted_rts[predicted_rts < 0]), quantiles)  # error
```

2. Observed:

```python
obs_correct = data[data["accuracy"] == 1]["rt"]
obs_error = data[data["accuracy"] == 0]["rt"]

obs_quantiles = np.quantile(obs_correct, quantiles)
obs_quantiles_err = np.quantile(obs_error, quantiles) if len(obs_error) > 10 else None
```

3. QP plot:

```python
import matplotlib.pyplot as plt

fig, ax = plt.subplots(1, 1, figsize=(8, 6))
ax.scatter(obs_quantiles, quantiles, marker="o", label="Observed (correct)")
ax.scatter(pred_quantiles, quantiles, marker="x", label="Predicted (correct)")
if obs_quantiles_err is not None:
    ax.scatter(obs_quantiles_err, quantiles, marker="o", facecolors="none", label="Observed (error)")
    ax.scatter(pred_quantiles_err, quantiles, marker="x", label="Predicted (error)")
ax.set_xlabel("RT (s)")
ax.set_ylabel("Quantile")
ax.legend()
ax.set_title("Quantile-Probability Plot")
fig.savefig("qp_plot.png", dpi=150)
```

4. Fit statistic (chi-square quantile bins):

```python
from scipy.stats import chisquare

observed_proportions = np.diff(np.concatenate([[0], quantiles, [1]]))
predicted_proportions = np.diff(np.concatenate([[0], quantiles, [1]]))
chi2, p_value = chisquare(observed_proportions, predicted_proportions)
print(f"Chi-square fit: chi2={chi2:.3f}, p={p_value:.3f}")
```

→ QP shows predicted closely tracking observed for both correct + error. Chi-square non-sig (p > 0.05).

If err: systematically misses fast/slow quantiles → add cross-trial variability (sv, st). Err RT shape wrong → add starting point variability (sz). Refit extended.

### Step 5: Compare Models

Information criteria for variant selection.

1. Fit each + collect stats:

```python
model_results = {}
for variant_name in ["basic", "full"]:
    fitted_model = fit_ddm(data, variant=variant_name)
    model_results[variant_name] = {
        "log_likelihood": fitted_model.log_likelihood,
        "n_params": fitted_model.n_free_params,
        "bic": fitted_model.bic,
        "aic": fitted_model.aic
    }
```

2. Compute + compare BIC:

```python
print("Model Comparison (BIC):")
print(f"{'Model':<15} {'LL':>10} {'k':>5} {'BIC':>12} {'delta_BIC':>12}")
print("-" * 55)

best_bic = min(r["bic"] for r in model_results.values())
for name, result in sorted(model_results.items(), key=lambda x: x[1]["bic"]):
    delta = result["bic"] - best_bic
    print(f"{name:<15} {result['log_likelihood']:>10.1f} {result['n_params']:>5} "
          f"{result['bic']:>12.1f} {delta:>12.1f}")
```

3. Interpret BIC (Kass & Raftery, 1995):

```python
# BIC difference interpretation (Kass & Raftery, 1995):
# 0-2:   Not worth mentioning
# 2-6:   Positive evidence
# 6-10:  Strong evidence
# >10:   Very strong evidence
```

4. Bayesian → DIC or WAIC:

```python
dic = hddm_model.dic
print(f"DIC: {dic:.1f}")
```

→ Clear winner w/ BIC diff >6, or justified retain simpler when <2.

If err: indistinguishable (BIC diff <2) → simpler model (parsimony). Full wins big → ensure basic not misspecified due to data issues.

### Step 6: Parameter Recovery

Verify pipeline recovers known params from simulated.

1. Ground-truth grid:

```python
true_params = {
    "v": [0.5, 1.0, 2.0, 3.0],
    "a": [0.6, 1.0, 1.5, 2.0],
    "t": [0.2, 0.3, 0.4]
}
```

2. Simulate + re-estimate:

```python
from itertools import product

recovery_results = []
n_simulated_trials = 500  # match empirical trial count

for v_true, a_true, t_true in product(true_params["v"], true_params["a"], true_params["t"]):
    simulated_data = simulate_ddm(v=v_true, a=a_true, t=t_true, n=n_simulated_trials)
    fitted = fit_ddm(simulated_data, variant="basic")
    recovery_results.append({
        "v_true": v_true, "v_est": fitted.params["v"],
        "a_true": a_true, "a_est": fitted.params["a"],
        "t_true": t_true, "t_est": fitted.params["t"]
    })
```

3. Recovery stats:

```python
recovery_df = pd.DataFrame(recovery_results)
for param in ["v", "a", "t"]:
    correlation = recovery_df[f"{param}_true"].corr(recovery_df[f"{param}_est"])
    bias = (recovery_df[f"{param}_est"] - recovery_df[f"{param}_true"]).mean()
    rmse = np.sqrt(((recovery_df[f"{param}_est"] - recovery_df[f"{param}_true"])**2).mean())
    print(f"{param}: r={correlation:.3f}, bias={bias:.4f}, RMSE={rmse:.4f}")
```

4. Recovery scatter plots:

```python
fig, axes = plt.subplots(1, 3, figsize=(15, 5))
for idx, param in enumerate(["v", "a", "t"]):
    ax = axes[idx]
    ax.scatter(recovery_df[f"{param}_true"], recovery_df[f"{param}_est"], alpha=0.5)
    lims = [recovery_df[f"{param}_true"].min(), recovery_df[f"{param}_true"].max()]
    ax.plot(lims, lims, "k--", label="Identity")
    ax.set_xlabel(f"True {param}")
    ax.set_ylabel(f"Estimated {param}")
    ax.set_title(f"Recovery: {param} (r={recovery_df[f'{param}_true'].corr(recovery_df[f'{param}_est']):.3f})")
    ax.legend()
fig.tight_layout()
fig.savefig("parameter_recovery.png", dpi=150)
```

→ Recovery correlations r > 0.85 all, bias near zero (< 5% range), RMSE acceptable.

If err: low recovery specific param → (a) insufficient trials → increase n_simulated_trials, (b) param tradeoffs — drift + boundary can trade off, fix one to test recoverability, (c) flat likelihood surface → reparameterize or Bayesian w/ informative priors.

## Check

- [ ] Input has RT + accuracy correct types
- [ ] Outlier filter removed <10%
- [ ] Every subject-condition cell ≥40 trials
- [ ] Param estimates plausible (v: 0-5, a: 0.3-3.0, t: 0.1-0.6)
- [ ] Convergence pass (R-hat < 1.1 Bayesian, gradient ~0 MLE)
- [ ] QP within 50ms of observed
- [ ] Comparison clear rank or justified parsimony
- [ ] Recovery correlations > 0.85 all free
- [ ] Recovery bias < 5% range

## Traps

- **Insufficient trials**: DDM data-hungry. <40 per cell → unstable + poor recovery. Always verify before fitting.
- **Ignore error RTs**: DDM jointly models correct + error. Discard err trials throws away boundary + starting point bias info.
- **No filter fast guesses**: <100ms likely anticipatory contaminants. Include → distort non-decision time.
- **Confuse variants**: Basic assumes no cross-trial variability. Err RTs systematically faster than correct → need full w/ sv + sz.
- **Overfit full**: 7-param can overfit sparse. Use BIC (penalizes complexity) not AIC for DDM selection.
- **Skip recovery**: W/o recovery validation → can't distinguish estimation bias from true exp effects. Always run before interpreting condition diffs.

## →

- `analyze-diffusion-dynamics` — mathematical analysis diffusion process
- `implement-diffusion-network` — generative diffusion sharing forward-process framework
- `design-experiment` — experimental design for DDM-quality data
- `write-testthat-tests` — testing estimation pipelines in R
