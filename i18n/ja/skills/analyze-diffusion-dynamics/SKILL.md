---
name: analyze-diffusion-dynamics
description: >
  確率微分方程式、フォッカー・プランク方程式、初通過時間分布、パラメータ感度分析を
  使用して拡散過程のダイナミクスを分析する。連続時間拡散過程の確率密度の時間発展を
  導出する時、有界拡散の平均初通過時間を計算する時、ドリフトと拡散パラメータが
  プロセスの挙動にどう影響するかを分析する時、閉形式解を確率シミュレーションに対して
  検証する時に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: diffusion
  complexity: intermediate
  language: multi
  tags: diffusion, sde, fokker-planck, first-passage, dynamics, analysis
  locale: ja
  source_locale: en
  source_commit: a87e5e0380bbe51f65cb0662d60c10030a81f255
  translator: claude
  translation_date: "2026-03-17"
---

# 拡散ダイナミクスの分析

拡散過程の確率微分方程式を定式化し、対応するフォッカー・プランク方程式を導出し、初通過時間分布を解析的または数値的に計算し、パラメータ感度分析を行い、解析結果をモンテカルロシミュレーションに対して検証することにより、拡散過程の挙動を特性化する。

## 使用タイミング

- 連続時間拡散過程の確率密度の時間発展を導出する時
- 有界拡散の平均初通過時間またはフルの初通過時間分布を計算する時
- ドリフト、拡散係数、境界パラメータがプロセスの挙動にどう影響するかを分析する時
- 閉形式解を確率シミュレーションに対して検証する時
- ドリフト拡散モデルや生成拡散過程の基礎となるダイナミクスの直観を構築する時

## 入力

- **必須**: SDE仕様（ドリフト関数、拡散係数、ドメイン/境界）
- **必須**: ドリフト関数と拡散関数のパラメータ値または範囲
- **必須**: 境界条件（吸収、反射、または混合）
- **任意**: 過渡解析の時間範囲（デフォルト: ダイナミクスから自動検出）
- **任意**: 数値PDEソルバーの空間離散化解像度（デフォルト: dx=0.001）
- **任意**: シミュレーション検証用のモンテカルロ軌道数（デフォルト: 10000）

## 手順

### ステップ1: SDEモデルを定式化する

プロセスのドリフト関数、拡散係数、境界条件を定義する。

1. 標準的な伊藤形式でSDEを記述する:

```
dX(t) = mu(X, t) dt + sigma(X, t) dW(t)
```

ここで`mu`はドリフト関数、`sigma`は拡散係数、`W(t)`は標準ウィーナー過程である。

2. SDEの各成分をコードで実装する:

```python
import numpy as np

class DiffusionProcess:
    """A one-dimensional diffusion process specified by drift and diffusion functions."""

    def __init__(self, drift_fn, diffusion_fn, lower_bound=None, upper_bound=None,
                 boundary_type="absorbing"):
        self.drift = drift_fn
        self.diffusion = diffusion_fn
        self.lower_bound = lower_bound
        self.upper_bound = upper_bound
        self.boundary_type = boundary_type

# Example: Ornstein-Uhlenbeck process on [0, a]
ou_process = DiffusionProcess(
    drift_fn=lambda x, t: 2.0 * (0.5 - x),     # mean-reverting drift
    diffusion_fn=lambda x, t: 0.1,               # constant diffusion
    lower_bound=0.0,
    upper_bound=1.0,
    boundary_type="absorbing"
)

# Example: Standard DDM (constant drift and diffusion)
ddm_process = DiffusionProcess(
    drift_fn=lambda x, t: 0.5,        # drift rate v
    diffusion_fn=lambda x, t: 1.0,    # unit diffusion (s=1, convention)
    lower_bound=0.0,                   # lower absorbing boundary
    upper_bound=1.5,                   # upper absorbing boundary (a)
    boundary_type="absorbing"
)
```

3. 初期条件を定義する:

```python
# Point source at x0
x0 = 0.75  # starting point (e.g., midpoint between boundaries for DDM with z=a/2)

# Or a distribution
initial_distribution = lambda x: np.exp(-50 * (x - 0.75)**2)  # narrow Gaussian
```

4. パラメータの整合性を検証する:

```python
def validate_process(process, x0):
    """Check that the SDE specification is self-consistent."""
    assert process.lower_bound < process.upper_bound, "Lower bound must be less than upper bound"
    assert process.lower_bound <= x0 <= process.upper_bound, \
        f"Initial position {x0} outside bounds [{process.lower_bound}, {process.upper_bound}]"
    test_drift = process.drift(x0, 0)
    test_diff = process.diffusion(x0, 0)
    assert np.isfinite(test_drift), f"Drift is not finite at x0={x0}"
    assert test_diff > 0, f"Diffusion coefficient must be positive, got {test_diff}"
    print(f"Process validated: drift={test_drift:.4f}, diffusion={test_diff:.4f} at x0={x0}")

validate_process(ddm_process, x0=0.75)
```

**期待結果:** 有限なドリフト値、厳密に正の拡散係数、ドメイン境界内の初期条件を持つ完全に定式化されたSDE。

**失敗時:** ドメイン内のいずれかの点で拡散係数がゼロまたは負の場合、プロセスは退化している -- 関数形式を確認する。境界でドリフトが無限大の場合、反射境界がより適切かどうか検討する。

### ステップ2: フォッカー・プランク方程式を導出する

SDEを確率密度の等価な偏微分方程式に変換する。

1. 遷移密度p(x, t)のフォッカー・プランク方程式（FPE）を記述する:

```
dp/dt = -d/dx [mu(x,t) * p(x,t)] + (1/2) * d^2/dx^2 [sigma(x,t)^2 * p(x,t)]
```

2. 定数係数（標準DDMケース）の場合、以下のように簡略化される:

```
dp/dt = -v * dp/dx + (s^2 / 2) * d^2p/dx^2
```

3. 有限差分法によるFPEの数値解法を実装する:

```python
from scipy.sparse import diags
from scipy.sparse.linalg import spsolve

def solve_fokker_planck(process, x0, t_max, dx=0.001, dt=None):
    """Solve the FPE numerically using Crank-Nicolson scheme."""
    x_grid = np.arange(process.lower_bound, process.upper_bound + dx, dx)
    N = len(x_grid)

    if dt is None:
        max_sigma = max(process.diffusion(x, 0) for x in x_grid)
        dt = 0.4 * dx**2 / max_sigma**2  # CFL-like stability condition

    # Initial condition: narrow Gaussian centered at x0
    p = np.exp(-((x_grid - x0)**2) / (2 * (2*dx)**2))
    p[0] = 0  # absorbing boundary
    p[-1] = 0  # absorbing boundary
    p = p / (np.sum(p) * dx)

    t_steps = int(t_max / dt)
    survival = np.zeros(t_steps)
    density_snapshots = []

    for step in range(t_steps):
        mu_vals = np.array([process.drift(x, step*dt) for x in x_grid])
        sigma_vals = np.array([process.diffusion(x, step*dt) for x in x_grid])
        D = 0.5 * sigma_vals**2

        # Finite difference operators (interior points)
        advection = -mu_vals[1:-1] / (2 * dx)
        diffusion_coeff = D[1:-1] / dx**2

        main_diag = 1 + dt * 2 * diffusion_coeff
        upper_diag = dt * (-diffusion_coeff[:-1] - advection[:-1])
        lower_diag = dt * (-diffusion_coeff[1:] + advection[1:])

        A = diags([lower_diag, main_diag, upper_diag], [-1, 0, 1], format="csc")
        p[1:-1] = spsolve(A, p[1:-1])
        p[0] = 0
        p[-1] = 0

        survival[step] = np.sum(p[1:-1]) * dx

        if step % (t_steps // 10) == 0:
            density_snapshots.append((step * dt, p.copy()))

    return x_grid, survival, density_snapshots
```

4. 発展する密度を実行してプロットする:

```python
import matplotlib.pyplot as plt

x_grid, survival, snapshots = solve_fokker_planck(ddm_process, x0=0.75, t_max=5.0)

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))
for t_val, density in snapshots:
    ax1.plot(x_grid, density, label=f"t={t_val:.2f}")
ax1.set_xlabel("x")
ax1.set_ylabel("p(x, t)")
ax1.set_title("Fokker-Planck Density Evolution")
ax1.legend()

t_vals = np.linspace(0, 5.0, len(survival))
ax2.plot(t_vals, survival)
ax2.set_xlabel("Time")
ax2.set_ylabel("Survival probability")
ax2.set_title("Survival Probability S(t)")
fig.tight_layout()
fig.savefig("fokker_planck_solution.png", dpi=150)
```

**期待結果:** 密度はx0で狭いピークとして始まり、SDE係数に従って広がりドリフトし、確率が境界で吸収されるにつれて徐々に減衰する。生存確率は1から0に向かって単調に減少する。

**失敗時:** 密度が振動や負の値を発生する場合、時間ステップが大きすぎる -- dtを減らす。密度が減衰しない場合（生存確率が1のまま）、境界がx0から遠すぎるかドリフトが両方の境界から離れる方向に押している。ソルバーの境界条件を確認する。

### ステップ3: 初通過時間分布を計算する

プロセスが最初に境界に到達する時間の分布を導出する。

1. 生存関数から初通過時間密度を計算する:

```python
def first_passage_time_density(survival, dt):
    """FPT density is the negative derivative of survival probability."""
    fpt_density = -np.gradient(survival, dt)
    fpt_density = np.maximum(fpt_density, 0)  # enforce non-negativity
    return fpt_density
```

2. 定数ドリフトの標準DDMについては、既知の解析解を使用する:

```python
def ddm_fpt_upper(t, v, a, z, s=1.0, n_terms=50):
    """Analytic FPT density at the upper boundary for constant-drift DDM.

    Uses the infinite series representation (large-time expansion).
    """
    if t <= 0:
        return 0.0
    density = 0.0
    for k in range(1, n_terms + 1):
        density += (k * np.pi * s**2 / a**2) * \
            np.exp(-v * (a - z) / s**2 - 0.5 * v**2 * t / s**2) * \
            np.sin(k * np.pi * z / a) * \
            np.exp(-0.5 * (k * np.pi * s / a)**2 * t)
    return density
```

3. FPT分布の要約統計量を計算する:

```python
def fpt_statistics(fpt_density, dt):
    """Compute mean, variance, and quantiles of the FPT distribution."""
    t_vals = np.arange(len(fpt_density)) * dt
    total_mass = np.sum(fpt_density) * dt

    # Normalize
    fpt_normed = fpt_density / total_mass if total_mass > 0 else fpt_density

    mean_fpt = np.sum(t_vals * fpt_normed) * dt
    var_fpt = np.sum((t_vals - mean_fpt)**2 * fpt_normed) * dt

    # Quantiles via CDF
    cdf = np.cumsum(fpt_normed) * dt
    quantile_10 = t_vals[np.searchsorted(cdf, 0.1)]
    quantile_50 = t_vals[np.searchsorted(cdf, 0.5)]
    quantile_90 = t_vals[np.searchsorted(cdf, 0.9)]

    return {
        "mean": mean_fpt,
        "std": np.sqrt(var_fpt),
        "q10": quantile_10,
        "q50": quantile_50,
        "q90": quantile_90,
        "total_probability": total_mass
    }
```

4. 二重境界問題では、各吸収壁での確率フラックスを使用して境界ごとにFPTを分離する（境界格子点での密度の有限差分）。

**期待結果:** FPT密度は右に裾の長い単峰分布である。正のドリフトを持つDDMでは、上境界FPTがより多くの質量を持ち、下境界FPTよりも短いモードを持つ。典型的なDDMパラメータ（v=1, a=1.5, z=0.75）の平均FPTは約0.5-2.0秒。

**失敗時:** FPT密度に負の値がある場合、数値微分がノイジーである -- 小さなガウス平滑化カーネルを適用する。両境界での全確率が約1.0にならない場合、時間範囲が短すぎる（t_maxを増やす）かソルバーに確率漏れがある。

### ステップ4: パラメータ感度を分析する

各パラメータの変化が初通過時間分布にどう影響するかを定量化する。

1. 感度分析のパラメータグリッドを定義する:

```python
param_ranges = {
    "v": np.linspace(0.2, 3.0, 15),     # drift rate
    "a": np.linspace(0.5, 2.5, 15),      # boundary separation
    "z_ratio": np.linspace(0.3, 0.7, 9)  # starting point as fraction of a
}

base_params = {"v": 1.0, "a": 1.5, "z_ratio": 0.5}
```

2. 他のパラメータをベースラインに固定しながら各パラメータをスイープする:

```python
sensitivity_results = {}

for param_name, param_values in param_ranges.items():
    means = []
    accuracies = []
    for val in param_values:
        params = base_params.copy()
        params[param_name] = val
        z = params["z_ratio"] * params["a"]

        process = DiffusionProcess(
            drift_fn=lambda x, t, v=params["v"]: v,
            diffusion_fn=lambda x, t: 1.0,
            lower_bound=0.0,
            upper_bound=params["a"],
            boundary_type="absorbing"
        )

        _, survival, _ = solve_fokker_planck(process, x0=z, t_max=10.0)
        fpt = first_passage_time_density(survival, dt=10.0/len(survival))
        stats = fpt_statistics(fpt, dt=10.0/len(survival))
        means.append(stats["mean"])
        accuracies.append(stats["total_probability"])  # proxy for upper boundary

    sensitivity_results[param_name] = {
        "values": param_values,
        "mean_fpt": np.array(means),
        "accuracy": np.array(accuracies)
    }
```

3. 感度曲線をプロットする:

```python
fig, axes = plt.subplots(1, 3, figsize=(18, 5))
for idx, (param_name, result) in enumerate(sensitivity_results.items()):
    ax = axes[idx]
    ax.plot(result["values"], result["mean_fpt"], "b-o", label="Mean FPT")
    ax.set_xlabel(param_name)
    ax.set_ylabel("Mean FPT")
    ax.set_title(f"Sensitivity to {param_name}")

    ax2 = ax.twinx()
    ax2.plot(result["values"], result["accuracy"], "r--s", label="P(upper)")
    ax2.set_ylabel("P(upper boundary)")
    ax.legend(loc="upper left")
    ax2.legend(loc="upper right")

fig.tight_layout()
fig.savefig("parameter_sensitivity.png", dpi=150)
```

4. 偏微分（ベースラインでの局所感度）を計算する:

```python
for param_name, result in sensitivity_results.items():
    idx_base = np.argmin(np.abs(result["values"] - base_params[param_name]))
    if idx_base > 0 and idx_base < len(result["values"]) - 1:
        d_mean = (result["mean_fpt"][idx_base+1] - result["mean_fpt"][idx_base-1]) / \
                 (result["values"][idx_base+1] - result["values"][idx_base-1])
        print(f"d(mean_FPT)/d({param_name}) at baseline: {d_mean:.4f}")
```

**期待結果:** ドリフト率（v）は平均FPTに強い負の効果と正確性に強い正の効果を持つ。境界分離（a）は平均FPTに強い正の効果を持つ（速度-正確性のトレードオフ）。開始点（z）は平均FPTへの影響が小さく、正確性をシフトする。

**失敗時:** 感度曲線がフラットまたは非単調の場合、パラメータ範囲が十分に広いか、ソルバーの時間範囲がFPT分布全体をキャプチャしているかを確認する。ドリフト率に対する非単調な平均FPTはソルバーのバグを示す。

### ステップ5: 解析結果を数値シミュレーションで検証する

SDEのモンテカルロシミュレーションを実行して解析的および数値的PDE結果を確認する。

1. SDEのオイラー・丸山シミュレーションを実装する:

```python
def simulate_sde(process, x0, dt_sim=0.0001, t_max=10.0, n_trajectories=10000):
    """Simulate SDE paths and record first-passage times."""
    n_steps = int(t_max / dt_sim)
    fpt_upper = np.full(n_trajectories, np.nan)
    fpt_lower = np.full(n_trajectories, np.nan)

    x = np.full(n_trajectories, x0)
    sqrt_dt = np.sqrt(dt_sim)

    for step in range(n_steps):
        t = step * dt_sim
        active = np.isnan(fpt_upper) & np.isnan(fpt_lower)
        if not active.any():
            break

        mu = np.array([process.drift(xi, t) for xi in x[active]])
        sigma = np.array([process.diffusion(xi, t) for xi in x[active]])
        dW = np.random.randn(active.sum()) * sqrt_dt

        x[active] += mu * dt_sim + sigma * dW

        # Check boundary crossings
        hit_upper = active & (x >= process.upper_bound)
        hit_lower = active & (x <= process.lower_bound)
        fpt_upper[hit_upper] = (step + 1) * dt_sim
        fpt_lower[hit_lower] = (step + 1) * dt_sim

    return fpt_upper, fpt_lower
```

2. シミュレーションを実行して経験的FPT分布を計算する:

```python
fpt_upper_sim, fpt_lower_sim = simulate_sde(ddm_process, x0=0.75, n_trajectories=50000)

# Empirical statistics
valid_upper = fpt_upper_sim[~np.isnan(fpt_upper_sim)]
valid_lower = fpt_lower_sim[~np.isnan(fpt_lower_sim)]
total_absorbed = len(valid_upper) + len(valid_lower)
accuracy_sim = len(valid_upper) / total_absorbed

print(f"Simulated accuracy: {accuracy_sim:.4f}")
print(f"Mean FPT (upper): {valid_upper.mean():.4f} +/- {valid_upper.std()/np.sqrt(len(valid_upper)):.4f}")
print(f"Mean FPT (lower): {valid_lower.mean():.4f} +/- {valid_lower.std()/np.sqrt(len(valid_lower)):.4f}")
```

3. シミュレーションを解析的または数値的PDE解と比較する:

```python
fig, ax = plt.subplots(figsize=(10, 6))

# Empirical histogram
ax.hist(valid_upper, bins=100, density=True, alpha=0.5, label="Simulation (upper)")
ax.hist(valid_lower, bins=100, density=True, alpha=0.5, label="Simulation (lower)")

# Analytical solution overlay
t_vals_analytic = np.linspace(0.01, 5.0, 500)
v, a, z = 0.5, 1.5, 0.75
fpt_analytic = [ddm_fpt_upper(t, v, a, z) for t in t_vals_analytic]
ax.plot(t_vals_analytic, fpt_analytic, "k-", linewidth=2, label="Analytic (upper)")

ax.set_xlabel("First-passage time")
ax.set_ylabel("Density")
ax.set_title("FPT Distribution: Simulation vs. Analytic")
ax.legend()
fig.savefig("fpt_validation.png", dpi=150)
```

4. 手法間の一致を定量化する:

```python
from scipy.stats import ks_2samp

# Kolmogorov-Smirnov test between simulated and analytically-derived samples
analytic_cdf = np.cumsum(fpt_analytic) * (t_vals_analytic[1] - t_vals_analytic[0])
sim_sorted = np.sort(valid_upper)
sim_cdf = np.arange(1, len(sim_sorted)+1) / len(sim_sorted)

# Interpolate analytic CDF at simulation quantiles
from scipy.interpolate import interp1d
analytic_interp = interp1d(t_vals_analytic, analytic_cdf, bounds_error=False, fill_value=(0, 1))
max_diff = np.max(np.abs(sim_cdf - analytic_interp(sim_sorted)))
print(f"Max CDF difference (simulation vs. analytic): {max_diff:.4f}")
assert max_diff < 0.05, f"Simulation and analytic FPT differ by {max_diff:.4f} (threshold: 0.05)"
```

**期待結果:** シミュレーションのヒストグラムが解析的FPT曲線に密接に一致する。50,000軌道でKS検定の最大CDF差が0.05未満。シミュレーションの平均FPTが解析値の2標準誤差以内。

**失敗時:** シミュレーションが解析結果と一致しない場合、まずオイラー・丸山のステップサイズを確認する -- dt_simは境界通過が見逃されないよう十分小さくすべき（dt_sim=0.00001を試す）。解析級数が収束しない場合、n_termsを増やす。解析解が存在しない非定数係数の場合、2つの数値手法（PDEソルバー vs シミュレーション）を互いに比較する。

## バリデーション

- [ ] SDE仕様が整合性チェックに合格する（有限ドリフト、正の拡散、ドメイン内のx0）
- [ ] フォッカー・プランク密度が時間とともに単調に減少する値に積分される（生存関数）
- [ ] フォッカー・プランク解に数値的アーティファクト（振動、負の値）がない
- [ ] FPT密度が非負で、両境界にわたって約1.0に積分される
- [ ] 感度分析が期待される単調関係を示す（v vs 正確性、a vs 平均FPT）
- [ ] モンテカルロシミュレーションの平均FPTがPDE/解析解の2標準誤差以内
- [ ] シミュレーションと解析結果間のKS検定最大CDF差が0.05未満

## よくある落とし穴

- **オイラー・丸山のステップサイズが大きすぎる**: 大きなdt_simは軌道が境界をオーバーシュートさせ、バイアスのあるFPT推定につながる。dt_simは期待される平均FPTの1/10以下にするか、境界補正スキームを使用する。
- **FPT級数を早く打ち切りすぎる**: 解析的DDM FPT密度は無限級数を使用する。項が少なすぎると（20未満）、特に短時間で目に見えるアーティファクトが発生する。少なくとも50項を使用して収束を確認する。
- **PDEソルバーの数値拡散を無視する**: 1次有限差分スキームはFPT分布を広げる人工拡散を導入する。精度のためにクランク・ニコルソンまたは高次スキームを使用する。
- **伊藤形式とストラトノビッチ形式の混同**: フォッカー・プランク方程式はSDE規約により異なる。上記の標準形式は伊藤解析を仮定している。SDEがストラトノビッチ形式で記述された場合、ノイズ誘起ドリフト補正項を追加する。
- **両方の境界を考慮しない**: 二重境界問題では、全吸収確率は1.0に合計されなければならない。下境界を考慮せずに上境界FPTのみを報告すると、不正確な統計になる。

## 関連スキル

- `fit-drift-diffusion-model` - これらのダイナミクスを適用して行動データからパラメータを推定する
- `implement-diffusion-network` - 生成拡散モデルは同じSDEフレームワークを離散化する
- `write-testthat-tests` - 数値ソルバーと解析的実装のテスト
- `create-technical-report` - 拡散分析結果のドキュメント化
