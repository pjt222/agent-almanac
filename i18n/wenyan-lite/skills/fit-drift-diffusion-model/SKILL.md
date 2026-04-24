---
name: fit-drift-diffusion-model
locale: wenyan-lite
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

# 擬漂移-擴散模型

自反應時間與準確率數據估漂移-擴散模型（DDM）之參數、評模型擬合對所觀察之分位數、比候選模型變體、並以參數回復之模擬驗估之品質。

## 適用時機

- 以反應時間數據模二元決策
- 自實驗數據估認知參數（漂移率、邊界分離、非決策時）
- 比決策任務之順序抽樣模型變體
- 驗 DDM 擬合管線可回復已知參數值
- 分解速-準權衡效於潛認知組件

## 輸入

- **必要**：帶準確率標（正/誤）之反應時間數據，每試一
- **必要**：各試之主體與條件標識
- **必要**：DDM 變體之擇（基本三參、全七參或層次）
- **選擇性**：Bayesian 估之先驗分布（預設：弱信息）
- **選擇性**：供參數回復之模擬數據集數（預設：100）
- **選擇性**：RT 濾邊界（秒）（預設：0.1 至 5.0）

## 步驟

### 步驟一：備反應時間數據

清並格原始行為數據供 DDM 擬合。

1. 載數據集並察欄以找主體 ID、條件、RT 與準確率：

```python
import pandas as pd

data = pd.read_csv("behavioral_data.csv")
required_columns = ["subject_id", "condition", "rt", "accuracy"]
assert all(col in data.columns for col in required_columns), \
    f"Missing columns: {set(required_columns) - set(data.columns)}"
```

2. 以可配之界濾離群 RT：

```python
rt_lower = 0.1  # seconds
rt_upper = 5.0  # seconds

n_before = len(data)
data = data[(data["rt"] >= rt_lower) & (data["rt"] <= rt_upper)]
n_removed = n_before - len(data)
print(f"Removed {n_removed} trials ({100*n_removed/n_before:.1f}%) outside [{rt_lower}, {rt_upper}]s")
```

3. 算每主體與條件之摘要統計：

```python
summary = data.groupby(["subject_id", "condition"]).agg(
    n_trials=("rt", "count"),
    mean_rt=("rt", "mean"),
    accuracy=("accuracy", "mean")
).reset_index()
print(summary.describe())
```

4. 驗最小試數（DDM 每格需足之數據）：

```python
min_trials = summary["n_trials"].min()
assert min_trials >= 40, f"Minimum trials per cell is {min_trials}; need at least 40 for stable estimation"
```

**預期：** 已清之 dataframe，無 RT 離群，每主體-條件格至少 40 試，準確率介於 0.50 與 0.99 之間。

**失敗時：** 若試數過低，考慮合條件或移缺太多之主體。若準確率至頂（>0.99）或至底（<0.55），DDM 或不可識——察任務難度。

### 步驟二：擇 DDM 變體

依研究問題擇合適之模型複雜度。

1. 定候選模型變體：

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

2. 依數據特擇：

| 標準 | Basic（三參） | Full（七參） | 層次 |
|-----------|-----------------|-----------------|--------------|
| 每格試數 | 40-100 | 200+ | 40+（合） |
| 主體 | 任 | 任 | 10+ |
| 研究目標 | 組效 | 個擬 | 二層 |
| 誤 RT 形 | 對稱 | 非對稱 | 二者 |

3. 配所擇之變體：

```python
selected_variant = "basic"  # adjust based on criteria above
model_config = model_variants[selected_variant]
print(f"Selected: {selected_variant} ({model_config['free_params']} free parameters)")
print(f"Parameters: {', '.join(model_config['params'])}")
```

**預期：** 已擇之模型變體，附基於試數、主體數與研究問題之理由。

**失敗時：** 若於變體間不定，自基本模型始，唯於殘差診斷示系統失擬（如誤 RT 分布不配）時加複雜。

### 步驟三：估參數

以最大似然或 Bayesian 估自數據擬 DDM。

1. 以 `fast-dm` 或 Python `pyddm` 法行 MLE 擬合：

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

2. 以 HDDM 行 Bayesian 估：

```python
import hddm

hddm_model = hddm.HDDM(data, depends_on={"v": "condition"})
hddm_model.find_starting_values()
hddm_model.sample(5000, burn=1000, thin=2, dbname="traces.db", db="pickle")
```

3. 抽並存所估參數：

```python
params = hddm_model.get_group_estimates()
print("Group-level parameter estimates:")
for param_name, stats in params.items():
    print(f"  {param_name}: {stats['mean']:.3f} [{stats['2.5q']:.3f}, {stats['97.5q']:.3f}]")
```

4. 察收斂（僅 Bayesian）：

```python
from kabuki.analyze import gelman_rubin

convergence = gelman_rubin(hddm_model)
max_rhat = max(convergence.values())
print(f"Max Gelman-Rubin R-hat: {max_rhat:.3f}")
assert max_rhat < 1.1, f"Chains have not converged (R-hat = {max_rhat:.3f})"
```

**預期：** 參數估，附標準誤或可信區間。於 Bayesian 擬合，所有參數之 Gelman-Rubin R-hat < 1.1。漂移率典型 0.5-4.0、邊界 0.5-2.5、非決策時 0.15-0.50s。

**失敗時：** 若估不收，試：(a) 更緊之參數界、(b) 藉網格搜之更佳起值、(c) 更長之鏈與更多之 burn-in。若 MLE 碰界值，模型或誤配。

### 步驟四：評模型擬合

以分位數診斷比預與觀之 RT 分布。

1. 自已擬模型生預之 RT 分位數：

```python
import numpy as np

quantiles = [0.1, 0.3, 0.5, 0.7, 0.9]

predicted_rts = model.simulate(n_trials=10000)
pred_quantiles = np.quantile(predicted_rts[predicted_rts > 0], quantiles)  # correct
pred_quantiles_err = np.quantile(np.abs(predicted_rts[predicted_rts < 0]), quantiles)  # error
```

2. 算觀之 RT 分位數：

```python
obs_correct = data[data["accuracy"] == 1]["rt"]
obs_error = data[data["accuracy"] == 0]["rt"]

obs_quantiles = np.quantile(obs_correct, quantiles)
obs_quantiles_err = np.quantile(obs_error, quantiles) if len(obs_error) > 10 else None
```

3. 建分位-概率圖（QP 圖）：

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

4. 算擬合統計（於分位箱之卡方）：

```python
from scipy.stats import chisquare

observed_proportions = np.diff(np.concatenate([[0], quantiles, [1]]))
predicted_proportions = np.diff(np.concatenate([[0], quantiles, [1]]))
chi2, p_value = chisquare(observed_proportions, predicted_proportions)
print(f"Chi-square fit: chi2={chi2:.3f}, p={p_value:.3f}")
```

**預期：** QP 圖示預之分位數緊隨觀之分位數，於正確與誤 RT 皆然。卡方檢非顯著（p > 0.05），示足擬合。

**失敗時：** 若模型系統錯失快或慢分位數，考慮加跨試變異參數（sv、st）。若誤 RT 形誤，加起點變異（sz）。以擴展模型重擬。

### 步驟五：比模型

用信息標準於候選 DDM 變體間擇。

1. 擬各候選模型並集擬合統計：

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

2. 算並比 BIC 值：

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

3. 以標準指南釋 BIC 差：

```python
# BIC difference interpretation (Kass & Raftery, 1995):
# 0-2:   Not worth mentioning
# 2-6:   Positive evidence
# 6-10:  Strong evidence
# >10:   Very strong evidence
```

4. 於 Bayesian 模型，用 DIC 或 WAIC：

```python
dic = hddm_model.dic
print(f"DIC: {dic:.1f}")
```

**預期：** 模型間明之勝者，BIC 差 > 6，或於差 < 2 時留簡模型之證之決。

**失敗時：** 若模型不可辨（BIC 差 < 2），偏簡模型（簡約）。若全模型以大幅勝，確基本模型未因數據問題而誤配。

### 步驟六：以參數回復模擬驗

驗估管線自模擬數據回復已知參數值。

1. 定真值參數格：

```python
true_params = {
    "v": [0.5, 1.0, 2.0, 3.0],
    "a": [0.6, 1.0, 1.5, 2.0],
    "t": [0.2, 0.3, 0.4]
}
```

2. 為每組合模擬數據集並重估：

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

3. 算回復統計：

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

**預期：** 所有參數回復相關 r > 0.85、偏近零（參數範圍之 <5%）、RMSE 於應用可接之界內。

**失敗時：** 特定參數之低回復通常意：(a) 試數不足——增 n_simulated_trials、(b) 參數權衡——漂移率與邊界可互換；固一以測可回復性、(c) 平之似然面——考慮重參或以信息先驗之 Bayesian 估。

## 驗證

- [ ] 輸入數據有 RT 與準確率欄且類型正
- [ ] 離群濾移試少於 10%
- [ ] 每主體-條件格至少 40 試
- [ ] 參數估於合理範圍（v：0-5、a：0.3-3.0、t：0.1-0.6）
- [ ] 收斂診斷過（Bayesian R-hat < 1.1、MLE 梯度近零）
- [ ] QP 圖示預分位數於觀分位數 50ms 內
- [ ] 模型比產明排或簡約之證決
- [ ] 所有自由參數之回復相關 r > 0.85
- [ ] 回復偏少於參數範圍之 5%

## 常見陷阱

- **試數不足**：DDM 估餓於數據。每格不足 40 試致不穩之估與差之回復。擬前恒驗試數。
- **忽誤 RT**：DDM 聯模正確與誤 RT 分布。棄誤試丟關邊界分離與起點偏之信息。
- **不濾快猜**：低於 100ms 之 RT 或為污染物（預期反應）。納之令非決策時估失真。
- **混 DDM 變體**：基本模型假無跨試變異。若誤 RT 系統快於正確 RT，則需含 sv 與 sz 參之全模型。
- **以全模型過擬**：7 參 DDM 可於稀數據過擬。於 DDM 之模型選用 BIC（其懲複雜）而非 AIC。
- **略參數回復**：無回復驗則爾不能分估偏與真實驗效。釋條件差前恒行回復。

## 相關技能

- `analyze-diffusion-dynamics` - DDM 所依擴散過程之數學分析
- `implement-diffusion-network` - 共前向過程框架之生成擴散模型
- `design-experiment` - 採 DDM 質之數據之實驗設計
- `write-testthat-tests` - 測 R 中之參數估管線
