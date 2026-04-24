---
name: fit-drift-diffusion-model
locale: wenyan
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

# 擬漂移擴散模

自反應時與準之數估漂移擴散模（DDM）之參，以觀分位評擬合，較候模變，以參回復模擬驗估之質。

## 用時

- 以反應時數建二元決之模
- 自試數估認知參（漂率、界距、非決時）
- 較某決任之序抽樣模變
- 驗 DDM 擬合流可回已知參值
- 分速準權衡為潛認知部

## 入

- **必要**：反應時數附各試之準籤（正/誤）
- **必要**：各試之主體與條件標識
- **必要**：DDM 變擇（基三參、全七參、或階層）
- **可選**：貝葉斯估之先分（默：弱指）
- **可選**：參回復擬數據集數（默 100）
- **可選**：RT 過濾界（默 0.1 至 5.0 秒）

## 法

### 第一步：備反應時數

清並格原行數以供 DDM 擬合。

1. 載數集，察列（主體 ID、條件、RT、準）：

```python
import pandas as pd

data = pd.read_csv("behavioral_data.csv")
required_columns = ["subject_id", "condition", "rt", "accuracy"]
assert all(col in data.columns for col in required_columns), \
    f"Missing columns: {set(required_columns) - set(data.columns)}"
```

2. 以可配界濾異 RT：

```python
rt_lower = 0.1  # seconds
rt_upper = 5.0  # seconds

n_before = len(data)
data = data[(data["rt"] >= rt_lower) & (data["rt"] <= rt_upper)]
n_removed = n_before - len(data)
print(f"Removed {n_removed} trials ({100*n_removed/n_before:.1f}%) outside [{rt_lower}, {rt_upper}]s")
```

3. 算各主體與條件之摘統：

```python
summary = data.groupby(["subject_id", "condition"]).agg(
    n_trials=("rt", "count"),
    mean_rt=("rt", "mean"),
    accuracy=("accuracy", "mean")
).reset_index()
print(summary.describe())
```

4. 驗最少試計（DDM 各格需足數）：

```python
min_trials = summary["n_trials"].min()
assert min_trials >= 40, f"Minimum trials per cell is {min_trials}; need at least 40 for stable estimation"
```

**得：** 清後數表無 RT 異，各主體—條件格至少 40 試，準於 0.50 至 0.99 間。

**敗則：** 若試計過少，考合條件或去過多缺數之主體。若準至頂（>0.99）或底（<0.55），DDM 或不可辨——察任難。

### 第二步：擇 DDM 變

依研問擇宜繁之模。

1. 定候模變：

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

2. 依數特擇：

| Criterion | Basic (3-param) | Full (7-param) | Hierarchical |
|-----------|-----------------|-----------------|--------------|
| Trials per cell | 40-100 | 200+ | 40+ (pooled) |
| Subjects | Any | Any | 10+ |
| Research goal | Group effects | Individual fits | Both levels |
| Error RT shape | Symmetric | Asymmetric | Either |

3. 配擇之變：

```python
selected_variant = "basic"  # adjust based on criteria above
model_config = model_variants[selected_variant]
print(f"Selected: {selected_variant} ({model_config['free_params']} free parameters)")
print(f"Parameters: {', '.join(model_config['params'])}")
```

**得：** 模變已擇附依試計、主數、研問之理。

**敗則：** 若變間不決，自基模始，唯殘診示系失擬（如誤 RT 分不合）時加繁。

### 第三步：估參

以最大似然或貝葉斯估擬 DDM 於數。

1. 用 `fast-dm` 或 Python `pyddm` 之 MLE 擬：

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

2. 用 HDDM 作貝葉斯估：

```python
import hddm

hddm_model = hddm.HDDM(data, depends_on={"v": "condition"})
hddm_model.find_starting_values()
hddm_model.sample(5000, burn=1000, thin=2, dbname="traces.db", db="pickle")
```

3. 取並存估參：

```python
params = hddm_model.get_group_estimates()
print("Group-level parameter estimates:")
for param_name, stats in params.items():
    print(f"  {param_name}: {stats['mean']:.3f} [{stats['2.5q']:.3f}, {stats['97.5q']:.3f}]")
```

4. 察收斂（唯貝葉斯）：

```python
from kabuki.analyze import gelman_rubin

convergence = gelman_rubin(hddm_model)
max_rhat = max(convergence.values())
print(f"Max Gelman-Rubin R-hat: {max_rhat:.3f}")
assert max_rhat < 1.1, f"Chains have not converged (R-hat = {max_rhat:.3f})"
```

**得：** 參估附標誤或可信區。貝葉斯擬時諸參 Gelman-Rubin R-hat < 1.1。漂率通 0.5-4.0、界 0.5-2.5、非決時 0.15-0.50 秒。

**敗則：** 若估不收斂，試：（甲）緊參界、（乙）以格搜佳起值、（丙）長鏈與更多燒入。若 MLE 至界值，模或誤定。

### 第四步：評擬合

以分位之診較預與觀 RT 分。

1. 自擬模生預 RT 分位：

```python
import numpy as np

quantiles = [0.1, 0.3, 0.5, 0.7, 0.9]

predicted_rts = model.simulate(n_trials=10000)
pred_quantiles = np.quantile(predicted_rts[predicted_rts > 0], quantiles)  # correct
pred_quantiles_err = np.quantile(np.abs(predicted_rts[predicted_rts < 0]), quantiles)  # error
```

2. 算觀 RT 分位：

```python
obs_correct = data[data["accuracy"] == 1]["rt"]
obs_error = data[data["accuracy"] == 0]["rt"]

obs_quantiles = np.quantile(obs_correct, quantiles)
obs_quantiles_err = np.quantile(obs_error, quantiles) if len(obs_error) > 10 else None
```

3. 造分位—機率圖（QP 圖）：

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

4. 算擬合統（於分位箱之卡方）：

```python
from scipy.stats import chisquare

observed_proportions = np.diff(np.concatenate([[0], quantiles, [1]]))
predicted_proportions = np.diff(np.concatenate([[0], quantiles, [1]]))
chi2, p_value = chisquare(observed_proportions, predicted_proportions)
print(f"Chi-square fit: chi2={chi2:.3f}, p={p_value:.3f}")
```

**得：** QP 圖示預分位於正誤 RT 皆緊隨觀分位。卡方試不顯（p > 0.05），示擬合足。

**敗則：** 若模系失速或慢分位，考加試間變參（sv、st）。若誤 RT 形誤，加起點變（sz）。以擴模重擬。

### 第五步：較模

以信息準擇候 DDM 變。

1. 擬各候並集擬合統：

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

2. 算並較 BIC 值：

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

3. 以標則釋 BIC 差：

```python
# BIC difference interpretation (Kass & Raftery, 1995):
# 0-2:   Not worth mentioning
# 2-6:   Positive evidence
# 6-10:  Strong evidence
# >10:   Very strong evidence
```

4. 貝葉斯模用 DIC 或 WAIC：

```python
dic = hddm_model.dic
print(f"DIC: {dic:.1f}")
```

**得：** 諸模中明勝者附 BIC 差 > 6，或差 < 2 時留簡模之理。

**敗則：** 若諸模不可辨（BIC 差 < 2），偏簡模（簡約）。若全模大勝，確基模非因數問誤定。

### 第六步：以參回復模擬驗

驗估流可自擬數回復已知參值。

1. 定真值參格：

```python
true_params = {
    "v": [0.5, 1.0, 2.0, 3.0],
    "a": [0.6, 1.0, 1.5, 2.0],
    "t": [0.2, 0.3, 0.4]
}
```

2. 各組合擬數集並重估：

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

3. 算回復統：

```python
recovery_df = pd.DataFrame(recovery_results)
for param in ["v", "a", "t"]:
    correlation = recovery_df[f"{param}_true"].corr(recovery_df[f"{param}_est"])
    bias = (recovery_df[f"{param}_est"] - recovery_df[f"{param}_true"]).mean()
    rmse = np.sqrt(((recovery_df[f"{param}_est"] - recovery_df[f"{param}_true"])**2).mean())
    print(f"{param}: r={correlation:.3f}, bias={bias:.4f}, RMSE={rmse:.4f}")
```

4. 生回復散點圖：

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

**得：** 諸參回復相關 r > 0.85，偏近零（<5% 參域），RMSE 於應用可接域。

**敗則：** 某參回復低常意：（甲）試不足——增 n_simulated_trials、（乙）參權衡——漂率與界可權衡；定一以試可回復、（丙）平似然面——考重參或附指先之貝葉斯估。

## 驗

- [ ] 入數有 RT 與準列附正類
- [ ] 異過濾去試不足 10%
- [ ] 各主體—條件格至少 40 試
- [ ] 參估於合理域（v: 0-5、a: 0.3-3.0、t: 0.1-0.6）
- [ ] 收斂診過（貝葉斯 R-hat < 1.1、MLE 梯度近零）
- [ ] QP 圖示預分位於觀分位 50ms 內
- [ ] 模較生明排或留簡之理
- [ ] 諸自由參回復相關逾 r = 0.85
- [ ] 回復偏不足 5% 參域

## 陷

- **試計不足**：DDM 估耗數。各格不足 40 試致不穩估與差回復。擬前必驗試計
- **略誤 RT**：DDM 聯模正與誤 RT 分。棄誤試去界距與起點偏之信
- **不濾速猜**：RT < 100ms 或為污（先應）。含則歪非決時估
- **混 DDM 變**：基模設無試間變。若誤 RT 系速於正，需全模附 sv、sz 參
- **全模過擬**：七參 DDM 於稀數過擬。DDM 用 BIC（罰繁）勝 AIC
- **略參回復**：無回復驗，不能辨估偏於真試效。解釋條件差前必運回復

## 參

- `analyze-diffusion-dynamics` - DDM 底擴散過程之數析
- `implement-diffusion-network` - 共前向過程架之生成擴散模
- `design-experiment` - 為集 DDM 質數之試設
- `write-testthat-tests` - R 中參估流之試
