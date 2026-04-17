---
name: fit-drift-diffusion-model
description: >
  認知的ドリフト拡散モデル（Ratcliff DDM）を反応時間と正確度データに適合させ、
  パラメータ推定（ドリフト率、境界分離、非決定時間）、モデル比較、パラメータ回復
  バリデーションを行う。反応時間データを用いた二項選択の意思決定モデリング時、
  実験データからの認知パラメータ推定時、逐次サンプリングモデルバリアントの比較時、
  または速度-正確度トレードオフ効果を潜在的認知コンポーネントに分解する時に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: diffusion
  complexity: advanced
  language: multi
  tags: diffusion, ddm, drift-diffusion, cognitive, reaction-time, estimation
  locale: ja
  source_locale: en
  source_commit: a87e5e0380bbe51f65cb0662d60c10030a81f255
  translator: claude
  translation_date: "2026-03-17"
---

# ドリフト拡散モデルの適合

反応時間と正確度データからドリフト拡散モデル（DDM）のパラメータを推定し、観測された分位数に対するモデル適合を評価し、候補モデルバリアントを比較し、パラメータ回復シミュレーションにより推定品質を検証する。

## 使用タイミング

- 反応時間データを用いた二項選択の意思決定をモデリングする時
- 実験データから認知パラメータ（ドリフト率、境界分離、非決定時間）を推定する時
- 意思決定課題の逐次サンプリングモデルバリアントを比較する時
- DDM適合パイプラインが既知のパラメータ値を回復することを検証する時
- 速度-正確度トレードオフ効果を潜在的認知コンポーネントに分解する時

## 入力

- **必須**: 試行ごとの正確度ラベル（正答/誤答）付き反応時間データ
- **必須**: 各試行の参加者および条件識別子
- **必須**: DDMバリアントの選択（基本3パラメータ、完全7パラメータ、または階層的）
- **任意**: ベイズ推定の事前分布（デフォルト：弱情報事前分布）
- **任意**: パラメータ回復のシミュレーションデータセット数（デフォルト：100）
- **任意**: RT フィルタリング境界（秒単位、デフォルト：0.1〜5.0）

## 手順

### ステップ1: 反応時間データの準備

DDM適合のために生の行動データをクリーニングしフォーマットする。

1. データセットをロードし、参加者ID、条件、RT、正確度の列を確認する：

```python
import pandas as pd

data = pd.read_csv("behavioral_data.csv")
required_columns = ["subject_id", "condition", "rt", "accuracy"]
assert all(col in data.columns for col in required_columns), \
    f"Missing columns: {set(required_columns) - set(data.columns)}"
```

2. 設定可能な境界を使用して外れ値RTをフィルタリングする：

```python
rt_lower = 0.1  # seconds
rt_upper = 5.0  # seconds

n_before = len(data)
data = data[(data["rt"] >= rt_lower) & (data["rt"] <= rt_upper)]
n_removed = n_before - len(data)
print(f"Removed {n_removed} trials ({100*n_removed/n_before:.1f}%) outside [{rt_lower}, {rt_upper}]s")
```

3. 参加者と条件ごとの要約統計量を計算する：

```python
summary = data.groupby(["subject_id", "condition"]).agg(
    n_trials=("rt", "count"),
    mean_rt=("rt", "mean"),
    accuracy=("accuracy", "mean")
).reset_index()
print(summary.describe())
```

4. 最小試行数を確認する（DDMはセルごとに十分なデータが必要）：

```python
min_trials = summary["n_trials"].min()
assert min_trials >= 40, f"Minimum trials per cell is {min_trials}; need at least 40 for stable estimation"
```

**期待結果:** RT外れ値のないクリーニングされたデータフレーム、参加者-条件セルごとに少なくとも40試行、正確度が0.50〜0.99の範囲。

**失敗時:** 試行数が少なすぎる場合、条件の統合または欠損データが多すぎる参加者の除外を検討する。正確度が天井（>0.99）または床（<0.55）の場合、DDMが同定不能かもしれない — 課題の難易度を確認する。

### ステップ2: DDMバリアントの選択

研究課題に基づいて適切なモデル複雑度を選択する。

1. 候補モデルバリアントを定義する：

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

2. データの特性に基づいて選択する：

| 基準 | 基本（3パラメータ） | 完全（7パラメータ） | 階層的 |
|-----------|-----------------|-----------------|--------------|
| セルあたりの試行数 | 40-100 | 200+ | 40+（プール） |
| 参加者数 | 任意 | 任意 | 10+ |
| 研究目標 | グループ効果 | 個人適合 | 両レベル |
| 誤答RTの形状 | 対称 | 非対称 | どちらでも |

3. 選択したバリアントを設定する：

```python
selected_variant = "basic"  # adjust based on criteria above
model_config = model_variants[selected_variant]
print(f"Selected: {selected_variant} ({model_config['free_params']} free parameters)")
print(f"Parameters: {', '.join(model_config['params'])}")
```

**期待結果:** 試行数、参加者数、研究課題に基づいた正当性を伴うモデルバリアントの選択。

**失敗時:** バリアント間で迷う場合、基本モデルから始め、残差診断が体系的な適合不良（例：誤答RT分布の不一致）を示す場合のみ複雑性を追加する。

### ステップ3: パラメータの推定

最尤法またはベイズ推定を使用してDDMをデータに適合させる。

1. `fast-dm`またはPython `pyddm`アプローチを使用したMLE適合：

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

2. HDDMを使用したベイズ推定：

```python
import hddm

hddm_model = hddm.HDDM(data, depends_on={"v": "condition"})
hddm_model.find_starting_values()
hddm_model.sample(5000, burn=1000, thin=2, dbname="traces.db", db="pickle")
```

3. 推定パラメータを抽出して保存する：

```python
params = hddm_model.get_group_estimates()
print("Group-level parameter estimates:")
for param_name, stats in params.items():
    print(f"  {param_name}: {stats['mean']:.3f} [{stats['2.5q']:.3f}, {stats['97.5q']:.3f}]")
```

4. 収束をチェックする（ベイズのみ）：

```python
from kabuki.analyze import gelman_rubin

convergence = gelman_rubin(hddm_model)
max_rhat = max(convergence.values())
print(f"Max Gelman-Rubin R-hat: {max_rhat:.3f}")
assert max_rhat < 1.1, f"Chains have not converged (R-hat = {max_rhat:.3f})"
```

**期待結果:** 標準誤差または信用区間付きのパラメータ推定値。ベイズ適合ではすべてのパラメータでGelman-Rubin R-hat < 1.1。ドリフト率は通常0.5-4.0、境界0.5-2.5、非決定時間0.15-0.50秒。

**失敗時:** 推定が収束しない場合、以下を試す：(a) より厳しいパラメータ境界、(b) グリッドサーチによるより良い初期値、(c) より多くのバーンイン付きの長いチェーン。MLEが境界値に達する場合、モデルが誤指定されている可能性がある。

### ステップ4: モデル適合の評価

分位数ベースの診断を使用して予測と観測のRT分布を比較する。

1. 適合モデルから予測RT分位数を生成する：

```python
import numpy as np

quantiles = [0.1, 0.3, 0.5, 0.7, 0.9]

predicted_rts = model.simulate(n_trials=10000)
pred_quantiles = np.quantile(predicted_rts[predicted_rts > 0], quantiles)  # correct
pred_quantiles_err = np.quantile(np.abs(predicted_rts[predicted_rts < 0]), quantiles)  # error
```

2. 観測RT分位数を計算する：

```python
obs_correct = data[data["accuracy"] == 1]["rt"]
obs_error = data[data["accuracy"] == 0]["rt"]

obs_quantiles = np.quantile(obs_correct, quantiles)
obs_quantiles_err = np.quantile(obs_error, quantiles) if len(obs_error) > 10 else None
```

3. 分位数-確率プロット（QPプロット）を作成する：

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

4. 適合統計量（分位数ビンのカイ二乗）を計算する：

```python
from scipy.stats import chisquare

observed_proportions = np.diff(np.concatenate([[0], quantiles, [1]]))
predicted_proportions = np.diff(np.concatenate([[0], quantiles, [1]]))
chi2, p_value = chisquare(observed_proportions, predicted_proportions)
print(f"Chi-square fit: chi2={chi2:.3f}, p={p_value:.3f}")
```

**期待結果:** QPプロットで正答と誤答の両方のRTについて予測分位数が観測分位数に密接に追従する。カイ二乗検定が非有意（p > 0.05）で適切な適合を示す。

**失敗時:** モデルが高速または低速の分位数を体系的に逸する場合、試行間変動パラメータ（sv, st）の追加を検討する。誤答RTの形状が誤っている場合、開始点変動（sz）を追加する。拡張モデルで再適合する。

### ステップ5: モデル比較

情報量基準を使用して候補DDMバリアント間で選択する。

1. 各候補モデルを適合させ、適合統計量を収集する：

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

2. BIC値を計算して比較する：

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

3. 標準的なガイドラインを使用してBIC差を解釈する：

```python
# BIC difference interpretation (Kass & Raftery, 1995):
# 0-2:   Not worth mentioning
# 2-6:   Positive evidence
# 6-10:  Strong evidence
# >10:   Very strong evidence
```

4. ベイズモデルではDICまたはWAICを使用する：

```python
dic = hddm_model.dic
print(f"DIC: {dic:.1f}")
```

**期待結果:** BIC差 > 6で明確な勝者、またはBIC差 < 2の場合にはより単純なモデルを保持する正当な判断。

**失敗時:** モデルが区別不能な場合（BIC差 < 2）、より単純なモデルを選好する（倹約原理）。完全モデルが大差で勝つ場合、基本モデルがデータの問題により誤指定されていないことを確認する。

### ステップ6: パラメータ回復シミュレーションによる検証

推定パイプラインがシミュレーションデータから既知のパラメータ値を回復することを検証する。

1. 真のパラメータグリッドを定義する：

```python
true_params = {
    "v": [0.5, 1.0, 2.0, 3.0],
    "a": [0.6, 1.0, 1.5, 2.0],
    "t": [0.2, 0.3, 0.4]
}
```

2. 各組み合わせについてデータセットをシミュレーションし再推定する：

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

3. 回復統計量を計算する：

```python
recovery_df = pd.DataFrame(recovery_results)
for param in ["v", "a", "t"]:
    correlation = recovery_df[f"{param}_true"].corr(recovery_df[f"{param}_est"])
    bias = (recovery_df[f"{param}_est"] - recovery_df[f"{param}_true"]).mean()
    rmse = np.sqrt(((recovery_df[f"{param}_est"] - recovery_df[f"{param}_true"])**2).mean())
    print(f"{param}: r={correlation:.3f}, bias={bias:.4f}, RMSE={rmse:.4f}")
```

4. 回復散布図を生成する：

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

**期待結果:** すべてのパラメータで回復相関 r > 0.85、バイアスがゼロに近い（パラメータ範囲の5%未満）、RMSEがアプリケーションの許容範囲内。

**失敗時:** 特定のパラメータの回復が低い場合、通常は：(a) 試行数不足 -- n_simulated_trialsを増加、(b) パラメータのトレードオフ -- ドリフト率と境界がトレードオフ可能；一方を固定して回復性をテスト、(c) 平坦な尤度面 -- 再パラメータ化または情報事前分布によるベイズ推定を検討。

## バリデーション

- [ ] 入力データに正しい型のRTと正確度列がある
- [ ] 外れ値フィルタリングが試行の10%未満を除去した
- [ ] すべての参加者-条件セルに少なくとも40試行がある
- [ ] パラメータ推定値が妥当な範囲内（v: 0-5, a: 0.3-3.0, t: 0.1-0.6）
- [ ] 収束診断が合格（ベイズではR-hat < 1.1、MLEでは勾配がゼロ付近）
- [ ] QPプロットで予測分位数が観測分位数から50ms以内
- [ ] モデル比較が明確なランキングまたは正当な倹約性の判断を生成
- [ ] パラメータ回復相関がすべての自由パラメータでr = 0.85を超える
- [ ] 回復バイアスがパラメータ範囲の5%未満

## よくある落とし穴

- **不十分な試行数**: DDM推定はデータ量を必要とする。セルあたり40試行未満では推定が不安定になり回復性が低下する。適合前に常に試行数を確認する。
- **誤答RTを無視する**: DDMは正答と誤答のRT分布を同時にモデル化する。誤答試行を破棄すると境界分離と開始点バイアスの情報が失われる。
- **高速推測をフィルタリングしない**: 100ms未満のRTは汚染（予期的応答）である可能性が高い。含めると非決定時間の推定が歪む。
- **DDMバリアントの混同**: 基本モデルは試行間変動を仮定しない。誤答RTが正答RTよりも体系的に速い場合、svとszパラメータを持つ完全モデルが必要。
- **完全モデルでの過適合**: 7パラメータDDMは疎なデータに過適合する可能性がある。DDMのモデル選択にはAICではなくBIC（複雑性にペナルティを課す）を使用する。
- **パラメータ回復の省略**: 回復バリデーションなしでは推定バイアスと真の実験効果を区別できない。条件差を解釈する前に常に回復を実行する。

## 関連スキル

- `analyze-diffusion-dynamics` - DDMの基礎にある拡散過程の数学的分析
- `implement-diffusion-network` - 順方向プロセスフレームワークを共有する生成的拡散モデル
- `design-experiment` - DDM品質データ収集のための実験デザインの考慮事項
- `write-testthat-tests` - Rでのパラメータ推定パイプラインのテスト
