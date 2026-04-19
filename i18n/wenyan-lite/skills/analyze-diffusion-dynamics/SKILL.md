---
name: analyze-diffusion-dynamics
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Analyze the dynamics of diffusion processes using stochastic differential
  equations, Fokker-Planck equations, first-passage time distributions, and
  parameter sensitivity analysis. Use when deriving probability density
  evolution for a continuous-time diffusion process, computing mean
  first-passage times for bounded diffusion, analyzing how drift and diffusion
  parameters affect process behavior, or validating closed-form solutions
  against stochastic simulation.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: diffusion
  complexity: intermediate
  language: multi
  tags: diffusion, sde, fokker-planck, first-passage, dynamics, analysis
---

# 析擴散動力學

藉指定隨機微分方程、推導 Fokker-Planck 方程、解析或數值計算首達時分佈、行參數敏感度分析、並對蒙地卡羅模擬驗證解析結果，以刻劃擴散過程之行為。

## 適用時機

- 推導連續時間擴散過程之機率密度演化
- 計算有界擴散之平均首達時或完整首達時分佈
- 分析漂移、擴散係數與邊界參數如何影響過程行為
- 對隨機模擬驗證閉式解
- 為漂移擴散模型或生成式擴散過程之底層動力學建立直覺

## 輸入

- **必要**：SDE 規格（漂移函式、擴散係數、定義域／邊界）
- **必要**：漂移與擴散函式之參數值或範圍
- **必要**：邊界條件（吸收、反射或混合）
- **選擇性**：暫態分析之時間範圍（預設：自動由動力學偵測）
- **選擇性**：數值 PDE 解算器之空間離散解析度（預設：dx=0.001）
- **選擇性**：模擬驗證之蒙地卡羅軌跡數（預設：10000）

## 步驟

### 步驟一：指定 SDE 模型

定義過程之漂移函式、擴散係數與邊界條件。

1. 以標準 Ito 形式撰 SDE：

```
dX(t) = mu(X, t) dt + sigma(X, t) dW(t)
```

其中 `mu` 為漂移函式，`sigma` 為擴散係數，`W(t)` 為標準維納過程。

2. 於碼中實作 SDE 元件：

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

3. 定義初始條件：

```python
# Point source at x0
x0 = 0.75  # starting point (e.g., midpoint between boundaries for DDM with z=a/2)

# Or a distribution
initial_distribution = lambda x: np.exp(-50 * (x - 0.75)**2)  # narrow Gaussian
```

4. 驗證參數一致性：

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

**預期：** SDE 全規定，漂移值有限、擴散係數嚴格為正、初始條件於定義域邊界內。

**失敗時：** 若擴散係數於定義域中任點為零或負，過程退化——查函式形式。若漂移於邊界處無窮，考反射邊界是否更宜。

### 步驟二：推 Fokker-Planck 方程

將 SDE 轉為機率密度之等價偏微分方程。

1. 撰過渡密度 p(x, t) 之 Fokker-Planck 方程（FPE）：

```
dp/dt = -d/dx [mu(x,t) * p(x,t)] + (1/2) * d^2/dx^2 [sigma(x,t)^2 * p(x,t)]
```

2. 對常係數（標準 DDM 情況），化簡為：

```
dp/dt = -v * dp/dx + (s^2 / 2) * d^2p/dx^2
```

3. 以有限差分實作 FPE 之數值解：

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

4. 行並繪演化中之密度：

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

**預期：** 密度始為 x0 處之窄峰，依 SDE 係數展與漂移，並隨機率於邊界被吸收而漸衰。存活機率自 1 單調降至 0。

**失敗時：** 若密度生振盪或負值，時間步過大——減 dt。若密度不衰（存活近 1），邊界或離 x0 過遠或漂移由二邊界皆推開。查解算器之邊界條件。

### 步驟三：計算首達時分佈

推過程首達邊界之時間分佈。

1. 自存活函式計算首達時密度：

```python
def first_passage_time_density(survival, dt):
    """FPT density is the negative derivative of survival probability."""
    fpt_density = -np.gradient(survival, dt)
    fpt_density = np.maximum(fpt_density, 0)  # enforce non-negativity
    return fpt_density
```

2. 對常漂移之標準 DDM，用已知解析解：

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

3. 計算 FPT 分佈之摘要統計量：

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

4. 對二邊界問題，依各吸收壁之機率通量（邊界格點密度之有限差分）分離 FPT。

**預期：** FPT 密度為右偏單峰分佈。對正漂移之 DDM，上邊界 FPT 較下邊界 FPT 質量更多且模較短。典型 DDM 參數（v=1, a=1.5, z=0.75）之平均 FPT 約 0.5-2.0 秒。

**失敗時：** 若 FPT 密度有負值，數值微分有噪——施小高斯平滑核。若二邊界總機率不近 1.0，或時間範圍過短（增 t_max），或解算器中有機率洩漏。

### 步驟四：分析參數敏感度

量化各參數變動如何影響首達時分佈。

1. 為敏感度分析定參數網格：

```python
param_ranges = {
    "v": np.linspace(0.2, 3.0, 15),     # drift rate
    "a": np.linspace(0.5, 2.5, 15),      # boundary separation
    "z_ratio": np.linspace(0.3, 0.7, 9)  # starting point as fraction of a
}

base_params = {"v": 1.0, "a": 1.5, "z_ratio": 0.5}
```

2. 掃各參數而保他者於基線：

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

3. 繪敏感度曲線：

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

4. 計算偏導（基線之局部敏感度）：

```python
for param_name, result in sensitivity_results.items():
    idx_base = np.argmin(np.abs(result["values"] - base_params[param_name]))
    if idx_base > 0 and idx_base < len(result["values"]) - 1:
        d_mean = (result["mean_fpt"][idx_base+1] - result["mean_fpt"][idx_base-1]) / \
                 (result["values"][idx_base+1] - result["values"][idx_base-1])
        print(f"d(mean_FPT)/d({param_name}) at baseline: {d_mean:.4f}")
```

**預期：** 漂移率 (v) 對平均 FPT 有強負效應，對準確率有強正效應。邊界距 (a) 對平均 FPT 有強正效應（速準權衡）。起點 (z) 移準確率而對平均 FPT 影響較小。

**失敗時：** 若敏感度曲線平或非單調，查參數範圍是否夠廣、解算器時間範圍是否捕全 FPT 分佈。對漂移率非單調之平均 FPT 表示解算器有缺陷。

### 步驟五：對數值模擬驗證解析

行 SDE 之蒙地卡羅模擬以確認解析與數值 PDE 結果。

1. 實作 SDE 之 Euler-Maruyama 模擬：

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

2. 行模擬並計算經驗 FPT 分佈：

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

3. 比對模擬與解析或數值 PDE 解：

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

4. 量化二法之一致：

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

**預期：** 模擬直方圖與解析 FPT 曲線密切吻合。50,000 軌跡之 KS 檢定最大 CDF 差小於 0.05。模擬之平均 FPT 在解析值之 2 標準誤內。

**失敗時：** 若模擬與解析不合，先查 Euler-Maruyama 步長——dt_sim 須夠小以免漏邊界穿越（試 dt_sim=0.00001）。若解析級數不收斂，增 n_terms。對無解析解之非常數係數，比對二數值法（PDE 解算器與模擬）。

## 驗證

- [ ] SDE 規格通過一致性檢查（漂移有限、擴散為正、x0 於定義域）
- [ ] Fokker-Planck 密度積分為隨時單調降之值（存活函式）
- [ ] Fokker-Planck 解無數值產物（振盪、負值）
- [ ] FPT 密度非負，二邊界積分近 1.0
- [ ] 敏感度分析呈預期之單調關係（v 對準確率、a 對平均 FPT）
- [ ] 蒙地卡羅模擬之平均 FPT 於 PDE/解析解之 2 標準誤內
- [ ] 模擬與解析間 KS 檢定最大 CDF 差小於 0.05

## 常見陷阱

- **Euler-Maruyama 步長過大**：大 dt_sim 致軌跡越過邊界，使 FPT 估計有偏。dt_sim 至多取預期平均 FPT 之 1/10，或用邊界校正之方法
- **FPT 級數截太早**：解析 DDM FPT 密度用無窮級數。項過少（< 20）致可見產物，特於短時。用至少 50 項並查收斂
- **忽 PDE 解算器中之數值擴散**：一階有限差分產人工擴散，使 FPT 分佈展寬。為精度用 Crank-Nicolson 或更高階方法
- **混 Ito 與 Stratonovich 形式**：Fokker-Planck 方程隨 SDE 慣例而異。上之標準形假設 Ito 演算。若 SDE 為 Stratonovich，加噪聲誘導之漂移修正項
- **未計二邊界**：二邊界問題中，總吸收機率須和為 1.0。僅報上邊界 FPT 而不計下邊界，統計失真

## 相關技能

- `fit-drift-diffusion-model` — 將此動力學用於自行為資料估參
- `implement-diffusion-network` — 生成式擴散模型離散同一 SDE 框架
- `write-testthat-tests` — 測試數值解算器與解析實作
- `create-technical-report` — 文件化擴散分析結果
