---
name: fit-drift-diffusion-model
locale: caveman
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

Estimate params of drift-diffusion model (DDM) from reaction time and accuracy data, check model fit vs observed quantiles, compare candidate model variants, and check estimation quality through param recovery sim.

## When Use

- Modeling binary decision-making with reaction time data
- Estimating cognitive params (drift rate, boundary separation, non-decision time) from experimental data
- Comparing sequential sampling model variants for decision task
- Check DDM fitting pipeline recovers known param values
- Break speed-accuracy tradeoff effects into latent cognitive bits

## Inputs

- **Required**: Reaction time data with accuracy labels (correct/error) per trial
- **Required**: Subject and condition IDs for each trial
- **Required**: Pick of DDM variant (basic 3-param, full 7-param, or hierarchical)
- **Optional**: Prior distributions for Bayesian estimation (default: weakly informative)
- **Optional**: Count of simulated datasets for param recovery (default: 100)
- **Optional**: RT filter bounds in seconds (default: 0.1 to 5.0)

## Steps

### Step 1: Prepare Reaction Time Data

Clean and format raw behavior data for DDM fitting.

1. Load dataset and check cols for subject ID, condition, RT, and accuracy:

```python
import pandas as pd

data = pd.read_csv("behavioral_data.csv")
required_columns = ["subject_id", "condition", "rt", "accuracy"]
assert all(col in data.columns for col in required_columns), \
    f"Missing columns: {set(required_columns) - set(data.columns)}"
```

2. Filter outlier RTs with tunable bounds:

```python
rt_lower = 0.1  # seconds
rt_upper = 5.0  # seconds

n_before = len(data)
data = data[(data["rt"] >= rt_lower) & (data["rt"] <= rt_upper)]
n_removed = n_before - len(data)
print(f"Removed {n_removed} trials ({100*n_removed/n_before:.1f}%) outside [{rt_lower}, {rt_upper}]s")
```

3. Compute summary stats per subject and condition:

```python
summary = data.groupby(["subject_id", "condition"]).agg(
    n_trials=("rt", "count"),
    mean_rt=("rt", "mean"),
    accuracy=("accuracy", "mean")
).reset_index()
print(summary.describe())
```

4. Check min trial counts (DDM needs enough data per cell):

```python
min_trials = summary["n_trials"].min()
assert min_trials >= 40, f"Minimum trials per cell is {min_trials}; need at least 40 for stable estimation"
```

**Got:** Cleaned dataframe with no RT outliers, at least 40 trials per subject-condition cell, and accuracy rates between 0.50 and 0.99.

**If fail:** Trial counts too low? Think collapse conditions or remove subjects with much missing data. Accuracy at ceiling (>0.99) or floor (<0.55)? DDM may not be identifiable -- check task difficulty.

### Step 2: Select DDM Variant

Pick right model complex based on research question.

1. Set candidate model variants:

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

2. Pick by data traits:

| Criterion | Basic (3-param) | Full (7-param) | Hierarchical |
|-----------|-----------------|-----------------|--------------|
| Trials per cell | 40-100 | 200+ | 40+ (pooled) |
| Subjects | Any | Any | 10+ |
| Research goal | Group effects | Individual fits | Both levels |
| Error RT shape | Symmetric | Asymmetric | Either |

3. Config picked variant:

```python
selected_variant = "basic"  # adjust based on criteria above
model_config = model_variants[selected_variant]
print(f"Selected: {selected_variant} ({model_config['free_params']} free parameters)")
print(f"Parameters: {', '.join(model_config['params'])}")
```

**Got:** Model variant picked with reason based on trial counts, subject count, research question.

**If fail:** Unsure between variants? Start with basic model and add complex only if residual diagnostics show systematic misfit (e.g., error RT distribution mismatch).

### Step 3: Estimate Parameters

Fit DDM to data with max likelihood or Bayesian estimation.

1. For MLE fitting using `fast-dm` or Python `pyddm` way:

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

2. For Bayesian estimation using HDDM:

```python
import hddm

hddm_model = hddm.HDDM(data, depends_on={"v": "condition"})
hddm_model.find_starting_values()
hddm_model.sample(5000, burn=1000, thin=2, dbname="traces.db", db="pickle")
```

3. Pull and store estimated params:

```python
params = hddm_model.get_group_estimates()
print("Group-level parameter estimates:")
for param_name, stats in params.items():
    print(f"  {param_name}: {stats['mean']:.3f} [{stats['2.5q']:.3f}, {stats['97.5q']:.3f}]")
```

4. Check convergence (Bayesian only):

```python
from kabuki.analyze import gelman_rubin

convergence = gelman_rubin(hddm_model)
max_rhat = max(convergence.values())
print(f"Max Gelman-Rubin R-hat: {max_rhat:.3f}")
assert max_rhat < 1.1, f"Chains have not converged (R-hat = {max_rhat:.3f})"
```

**Got:** Param estimates with standard errors or credible intervals. For Bayesian fits, Gelman-Rubin R-hat < 1.1 for all params. Drift rate usually 0.5-4.0, boundary 0.5-2.5, non-decision time 0.15-0.50s.

**If fail:** Estimation fails to converge? Try: (a) tighter param bounds, (b) better start values via grid search, (c) longer chains with more burn-in. MLE hits boundary values? Model may be misspec.

### Step 4: Evaluate Model Fit

Compare predicted and observed RT distributions with quantile-based diagnostics.

1. Make predicted RT quantiles from fitted model:

```python
import numpy as np

quantiles = [0.1, 0.3, 0.5, 0.7, 0.9]

predicted_rts = model.simulate(n_trials=10000)
pred_quantiles = np.quantile(predicted_rts[predicted_rts > 0], quantiles)  # correct
pred_quantiles_err = np.quantile(np.abs(predicted_rts[predicted_rts < 0]), quantiles)  # error
```

2. Compute observed RT quantiles:

```python
obs_correct = data[data["accuracy"] == 1]["rt"]
obs_error = data[data["accuracy"] == 0]["rt"]

obs_quantiles = np.quantile(obs_correct, quantiles)
obs_quantiles_err = np.quantile(obs_error, quantiles) if len(obs_error) > 10 else None
```

3. Make quantile-probability plot (QP plot):

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

4. Compute fit stat (chi-square on quantile bins):

```python
from scipy.stats import chisquare

observed_proportions = np.diff(np.concatenate([[0], quantiles, [1]]))
predicted_proportions = np.diff(np.concatenate([[0], quantiles, [1]]))
chi2, p_value = chisquare(observed_proportions, predicted_proportions)
print(f"Chi-square fit: chi2={chi2:.3f}, p={p_value:.3f}")
```

**Got:** QP plot shows predicted quantiles close tracking observed quantiles for both correct and error RTs. Chi-square test is non-significant (p > 0.05), showing OK fit.

**If fail:** Model systematic misses fast or slow quantiles? Think add cross-trial variability params (sv, st). Error RT shape wrong? Add starting point variability (sz). Refit with extended model.

### Step 5: Compare Models

Use info criteria to pick among candidate DDM variants.

1. Fit each candidate model and grab fit stats:

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

2. Compute and compare BIC values:

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

3. Read BIC differences with standard guides:

```python
# BIC difference interpretation (Kass & Raftery, 1995):
# 0-2:   Not worth mentioning
# 2-6:   Positive evidence
# 6-10:  Strong evidence
# >10:   Very strong evidence
```

4. For Bayesian models, use DIC or WAIC:

```python
dic = hddm_model.dic
print(f"DIC: {dic:.1f}")
```

**Got:** Clear winner among models with BIC difference > 6, or backed pick to keep simpler model when diff < 2.

**If fail:** Models indistinguishable (BIC diff < 2)? Prefer simpler model (parsimony). Full model wins by big margin? Make sure basic model not misspec due to data issues.

### Step 6: Validate with Parameter Recovery Simulation

Check estimation pipeline recovers known param values from simulated data.

1. Set ground-truth param grid:

```python
true_params = {
    "v": [0.5, 1.0, 2.0, 3.0],
    "a": [0.6, 1.0, 1.5, 2.0],
    "t": [0.2, 0.3, 0.4]
}
```

2. Simulate datasets and re-estimate for each combo:

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

3. Compute recovery stats:

```python
recovery_df = pd.DataFrame(recovery_results)
for param in ["v", "a", "t"]:
    correlation = recovery_df[f"{param}_true"].corr(recovery_df[f"{param}_est"])
    bias = (recovery_df[f"{param}_est"] - recovery_df[f"{param}_true"]).mean()
    rmse = np.sqrt(((recovery_df[f"{param}_est"] - recovery_df[f"{param}_true"])**2).mean())
    print(f"{param}: r={correlation:.3f}, bias={bias:.4f}, RMSE={rmse:.4f}")
```

4. Make recovery scatter plots:

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

**Got:** Recovery correlations r > 0.85 for all params, bias close to zero (< 5% of param range), RMSE within OK bounds for app.

**If fail:** Low recovery for specific param usually means: (a) not enough trials -- bump n_simulated_trials, (b) param tradeoffs -- drift rate and boundary can trade off; fix one to test recoverability, (c) flat likelihood surface -- think reparameter or Bayesian estimation with informative priors.

## Validation

- [ ] Input data has RT and accuracy cols with right types
- [ ] Outlier filter removed fewer than 10% of trials
- [ ] Every subject-condition cell has at least 40 trials
- [ ] Param estimates are in plausible ranges (v: 0-5, a: 0.3-3.0, t: 0.1-0.6)
- [ ] Convergence diagnostics pass (R-hat < 1.1 for Bayesian, gradient near zero for MLE)
- [ ] QP plot shows predicted quantiles within 50ms of observed quantiles
- [ ] Model compare gives clear rank or backed parsimony pick
- [ ] Param recovery correlations exceed r = 0.85 for all free params
- [ ] Recovery bias is less than 5% of param range

## Pitfalls

- **Not enough trial counts**: DDM estimation is data-hungry. Fewer than 40 trials per cell gives unstable estimates and poor recovery. Always check trial counts before fit.
- **Ignore error RTs**: DDM jointly models correct and error RT distributions. Drop error trials throws away info about boundary separation and starting point bias.
- **No filter fast guesses**: RTs below 100ms are likely contaminants (anticipatory responses). Include them and they distort non-decision time estimates.
- **Mix DDM variants**: Basic model assumes no cross-trial variability. If error RTs are systematically faster than correct RTs, you need full model with sv and sz params.
- **Overfit with full model**: 7-param DDM can overfit sparse data. Use BIC (which penalizes complex) rather than AIC for model pick with DDMs.
- **Skip param recovery**: Without recovery check, you cannot tell estimation bias from true experimental effects. Always run recovery before reading condition differences.

## See Also

- `analyze-diffusion-dynamics` - math analysis of diffusion process under DDM
- `implement-diffusion-network` - generative diffusion models that share forward-process frame
- `design-experiment` - experimental design picks for collecting DDM-quality data
- `write-testthat-tests` - testing param estimation pipelines in R
