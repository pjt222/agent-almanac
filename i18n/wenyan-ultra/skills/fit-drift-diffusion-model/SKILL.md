---
name: fit-drift-diffusion-model
locale: wenyan-ultra
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

# 擬 DDM

自反應時與正確率估 DDM 參、以分位估擬、較候變、以參復模擬驗估質。

## 用

- 以反應時模二擇決
- 自實數估認參（漂率、界隔、非決時）
- 較決任之序抽模變
- 驗 DDM 擬管復已知參值
- 解速正權衡為潛認素

## 入

- **必**：含各試之正/誤標之反應時數
- **必**：各試之受者與條件識
- **必**：DDM 變擇（基 3 參、全 7 參、或層）
- **可**：貝葉估之先（默：弱告）
- **可**：參復之模數（默：100）
- **可**：RT 濾界秒（默：0.1 至 5.0）

## 行

### 一：備反應時數

清並格原行數以擬 DDM。

1. 載數並察受 ID、條件、RT、正確欄：

```python
import pandas as pd

data = pd.read_csv("behavioral_data.csv")
required_columns = ["subject_id", "condition", "rt", "accuracy"]
assert all(col in data.columns for col in required_columns), \
    f"Missing columns: {set(required_columns) - set(data.columns)}"
```

2. 以可設界濾離群 RT：

```python
rt_lower = 0.1  # seconds
rt_upper = 5.0  # seconds

n_before = len(data)
data = data[(data["rt"] >= rt_lower) & (data["rt"] <= rt_upper)]
n_removed = n_before - len(data)
print(f"Removed {n_removed} trials ({100*n_removed/n_before:.1f}%) outside [{rt_lower}, {rt_upper}]s")
```

3. 各受與條件計摘統：

```python
summary = data.groupby(["subject_id", "condition"]).agg(
    n_trials=("rt", "count"),
    mean_rt=("rt", "mean"),
    accuracy=("accuracy", "mean")
).reset_index()
print(summary.describe())
```

4. 驗最少試數（DDM 需足數於各格）：

```python
min_trials = summary["n_trials"].min()
assert min_trials >= 40, f"Minimum trials per cell is {min_trials}; need at least 40 for stable estimation"
```

得：已清數文無 RT 離群，各受-條件格至少 40 試，正確率於 0.50 與 0.99 間。

敗：試過少→考合條件或去缺數過者。正確頂（>0.99）或底（<0.55）→DDM 或不可識；察任難。

### 二：擇 DDM 變

依研問擇模繁。

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

2. 依數性擇：

| Criterion | Basic (3-param) | Full (7-param) | Hierarchical |
|-----------|-----------------|-----------------|--------------|
| Trials per cell | 40-100 | 200+ | 40+ (pooled) |
| Subjects | Any | Any | 10+ |
| Research goal | Group effects | Individual fits | Both levels |
| Error RT shape | Symmetric | Asymmetric | Either |

3. 設所擇變：

```python
selected_variant = "basic"  # adjust based on criteria above
model_config = model_variants[selected_variant]
print(f"Selected: {selected_variant} ({model_config['free_params']} free parameters)")
print(f"Parameters: {', '.join(model_config['params'])}")
```

得：變已擇並有依試數、受數、研問之理。

敗：變間不確→自基始，唯殘診示系誤擬（如誤 RT 分不匹）時加繁。

### 三：估參

以極似或貝葉擬 DDM。

1. MLE 擬用 `fast-dm` 或 Python `pyddm`：

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

2. 貝葉估用 HDDM：

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

4. 察收斂（僅貝葉）：

```python
from kabuki.analyze import gelman_rubin

convergence = gelman_rubin(hddm_model)
max_rhat = max(convergence.values())
print(f"Max Gelman-Rubin R-hat: {max_rhat:.3f}")
assert max_rhat < 1.1, f"Chains have not converged (R-hat = {max_rhat:.3f})"
```

得：參估含標誤或信區。貝葉：諸參 Gelman-Rubin R-hat < 1.1。漂率常 0.5-4.0、界 0.5-2.5、非決時 0.15-0.50s。

敗：估不收→試：(a) 緊參界，(b) 經網搜佳始值，(c) 長鏈多燒。MLE 碰界值→模或誤設。

### 四：估擬

以分位診較預測與察 RT 分。

1. 自擬模生預 RT 分位：

```python
import numpy as np

quantiles = [0.1, 0.3, 0.5, 0.7, 0.9]

predicted_rts = model.simulate(n_trials=10000)
pred_quantiles = np.quantile(predicted_rts[predicted_rts > 0], quantiles)  # correct
pred_quantiles_err = np.quantile(np.abs(predicted_rts[predicted_rts < 0]), quantiles)  # error
```

2. 算察 RT 分位：

```python
obs_correct = data[data["accuracy"] == 1]["rt"]
obs_error = data[data["accuracy"] == 0]["rt"]

obs_quantiles = np.quantile(obs_correct, quantiles)
obs_quantiles_err = np.quantile(obs_error, quantiles) if len(obs_error) > 10 else None
```

3. 造分位-概圖（QP 圖）：

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

4. 算擬統（分位箱 chi 方）：

```python
from scipy.stats import chisquare

observed_proportions = np.diff(np.concatenate([[0], quantiles, [1]]))
predicted_proportions = np.diff(np.concatenate([[0], quantiles, [1]]))
chi2, p_value = chisquare(observed_proportions, predicted_proportions)
print(f"Chi-square fit: chi2={chi2:.3f}, p={p_value:.3f}")
```

得：QP 圖示預分位近察分位於正與誤 RT。chi 方試非顯（p > 0.05），擬足。

敗：模系漏快或慢分位→考加跨試變參（sv、st）。誤 RT 形誤→加起變（sz）。以擴模重擬。

### 五：較模

以信準於候 DDM 變間擇。

1. 擬各候模並集擬統：

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

3. 以標引釋 BIC 差：

```python
# BIC difference interpretation (Kass & Raftery, 1995):
# 0-2:   Not worth mentioning
# 2-6:   Positive evidence
# 6-10:  Strong evidence
# >10:   Very strong evidence
```

4. 貝葉模用 DIC 或 WAIC：

```python
dic = hddm_model.dic
print(f"DIC: {dic:.1f}")
```

得：模間明勝者 BIC 差 > 6，或差 < 2 時有理留簡模之決。

敗：模不可分（BIC 差 < 2）→偏簡模（省）。全模以大邊勝→確基模非因數議誤設。

### 六：以參復模擬驗

驗估管自模擬數復已知參值。

1. 定真參網：

```python
true_params = {
    "v": [0.5, 1.0, 2.0, 3.0],
    "a": [0.6, 1.0, 1.5, 2.0],
    "t": [0.2, 0.3, 0.4]
}
```

2. 各合模擬數並重估：

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

3. 算復統：

```python
recovery_df = pd.DataFrame(recovery_results)
for param in ["v", "a", "t"]:
    correlation = recovery_df[f"{param}_true"].corr(recovery_df[f"{param}_est"])
    bias = (recovery_df[f"{param}_est"] - recovery_df[f"{param}_true"]).mean()
    rmse = np.sqrt(((recovery_df[f"{param}_est"] - recovery_df[f"{param}_true"])**2).mean())
    print(f"{param}: r={correlation:.3f}, bias={bias:.4f}, RMSE={rmse:.4f}")
```

4. 生復散圖：

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

得：諸參復相關 r > 0.85、偏近零（參域 < 5%）、RMSE 於用可接域。

敗：某參低復常意：(a) 試不足——增 n_simulated_trials；(b) 參權衡——漂與界可權衡；固一以試可復性；(c) 似然面平——考再參化或貝葉估以告先。

## 驗

- [ ] 入數含正類 RT 與正確欄
- [ ] 離群濾去 <10% 試
- [ ] 各受-條件格至少 40 試
- [ ] 參估於理域（v: 0-5、a: 0.3-3.0、t: 0.1-0.6）
- [ ] 收斷過（貝葉 R-hat < 1.1、MLE 梯近零）
- [ ] QP 圖示預分位距察分位 50ms 內
- [ ] 模較生明排或有理簡決
- [ ] 諸自參復相關逾 r = 0.85
- [ ] 復偏 <5% 參域

## 忌

- **試不足**：DDM 估飢數。<40 試/格致估不穩、復劣。擬前必驗試數
- **忽誤 RT**：DDM 聯模正與誤 RT 分。棄誤試失界與起之信
- **不濾速猜**：<100ms RT 或為污（預應）。含則歪非決時估
- **混 DDM 變**：基模設無跨試變。若誤 RT 系快於正→需全模含 sv 與 sz 參
- **全模過擬**：7 參 DDM 可於稀數過擬。DDM 模擇用 BIC（罰繁）非 AIC
- **略參復**：無復驗不能別估偏與真實驗效。釋條件差前必行復

## 參

- `analyze-diffusion-dynamics` - DDM 下擴散程之數析
- `implement-diffusion-network` - 共前向程框之生擴散模
- `design-experiment` - 集 DDM 質數之實驗設
- `write-testthat-tests` - 於 R 試參估管
