---
name: analyze-diffusion-dynamics
locale: wenyan
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

# 析擴散動力

以隨機微分方程、Fokker-Planck 方程、首達時分布、參靈敏度析，描擴散過程之行。

## 用時

- 推連時擴散過程之概密演化乃用
- 算有界擴散之均首達時或全首達時分布乃用
- 析漂、擴散、邊參如何影過程之行乃用
- 驗閉式解對隨機模擬乃用
- 建漂擴散模或生成擴散過程之動力直觀乃用

## 入

- **必要**：SDE 之規（漂函、擴散係、域/邊）
- **必要**：漂函與擴散函之參值或範
- **必要**：邊條件（吸收、反射、或混）
- **可選**：瞬態析之時界（默：按動力自察）
- **可選**：數值 PDE 解之空間離散率（默：dx=0.001）
- **可選**：模擬驗之蒙特卡洛軌數（默：10000）

## 法

### 第一步：定 SDE 模

明漂函、擴散係、邊條件。

1. 以標 Ito 式書 SDE：

```
dX(t) = mu(X, t) dt + sigma(X, t) dW(t)
```

其中 `mu` 為漂函，`sigma` 為擴散係，`W(t)` 為標 Wiener 過程。

2. 以碼實 SDE 諸元：

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

3. 定初條：

```python
# Point source at x0
x0 = 0.75  # starting point (e.g., midpoint between boundaries for DDM with z=a/2)

# Or a distribution
initial_distribution = lambda x: np.exp(-50 * (x - 0.75)**2)  # narrow Gaussian
```

4. 驗參一致：

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

**得：** SDE 全規有定，漂有限，擴散係嚴正，初位於域邊內。

**敗則：** 若擴散係於域中某處為零或負，過程退化——察函式。若漂於邊為無限，察反射邊是否更宜。

### 第二步：推 Fokker-Planck 方程

轉 SDE 為概密度之等效偏微方程。

1. 書概密度 p(x, t) 之 Fokker-Planck 方程（FPE）：

```
dp/dt = -d/dx [mu(x,t) * p(x,t)] + (1/2) * d^2/dx^2 [sigma(x,t)^2 * p(x,t)]
```

2. 恆係之標 DDM 則簡為：

```
dp/dt = -v * dp/dx + (s^2 / 2) * d^2p/dx^2
```

3. 以有限差分實 FPE 之數值解：

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

4. 行而繪密演：

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

**得：** 密自 x0 之窄峰起，依 SDE 係而漂散，以概率於邊被吸而漸衰。存活概率單調由 1 降向 0。

**敗則：** 若密生振盪或負值，時步過大——減 dt。若密不衰（存活近 1），邊或距 x0 過遠或漂離二邊。察求解器之邊條件。

### 第三步：算首達時分布

推過程首達邊之時分布。

1. 由存活函算首達時密：

```python
def first_passage_time_density(survival, dt):
    """FPT density is the negative derivative of survival probability."""
    fpt_density = -np.gradient(survival, dt)
    fpt_density = np.maximum(fpt_density, 0)  # enforce non-negativity
    return fpt_density
```

2. 恆漂之標 DDM，用已知解析解：

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

3. 算首達時分布之要計：

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

4. 二邊之題，以各吸邊之概流（邊格點密之有限差）分 FPT。

**得：** FPT 密為右偏之單峰分布。DDM 正漂則上邊 FPT 質多模短於下邊。典 DDM 參（v=1、a=1.5、z=0.75）之均 FPT 約 0.5-2.0 秒。

**敗則：** 若 FPT 密有負值，數值微分噪——施小 Gaussian 平滑核。若二邊之總概不和約 1.0，時界或過短（增 t_max）或求解器中有概漏。

### 第四步：析參靈敏

量各參之變如何影首達時分布。

1. 定靈敏析之參格：

```python
param_ranges = {
    "v": np.linspace(0.2, 3.0, 15),     # drift rate
    "a": np.linspace(0.5, 2.5, 15),      # boundary separation
    "z_ratio": np.linspace(0.3, 0.7, 9)  # starting point as fraction of a
}

base_params = {"v": 1.0, "a": 1.5, "z_ratio": 0.5}
```

2. 掃各參而其他守基線：

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

3. 繪靈敏線：

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

4. 算偏導（基線之局靈敏）：

```python
for param_name, result in sensitivity_results.items():
    idx_base = np.argmin(np.abs(result["values"] - base_params[param_name]))
    if idx_base > 0 and idx_base < len(result["values"]) - 1:
        d_mean = (result["mean_fpt"][idx_base+1] - result["mean_fpt"][idx_base-1]) / \
                 (result["values"][idx_base+1] - result["values"][idx_base-1])
        print(f"d(mean_FPT)/d({param_name}) at baseline: {d_mean:.4f}")
```

**得：** 漂率（v）強負影均 FPT、強正影準。邊距（a）強正影均 FPT（速準權衡）。始點（z）影準而微影均 FPT。

**敗則：** 若靈敏線平或非單調，察參範寬乎、求解時界捕全 FPT 分布乎。漂率相應之非單調均 FPT 示求解器有疵。

### 第五步：驗析於數擬

行 SDE 之蒙特卡洛以確析與數值 PDE 之果。

1. 實 Euler-Maruyama SDE 擬：

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

2. 行擬而算經驗 FPT 分布：

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

3. 比擬於析或數 PDE 解：

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

4. 量法間之合：

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

**得：** 擬之直方近析 FPT 線。5 萬軌 KS 試最大 CDF 差低於 0.05。擬之均 FPT 於析值二標準誤內。

**敗則：** 若擬違析，先察 Euler-Maruyama 步——dt_sim 宜小使邊穿不漏（試 dt_sim=0.00001）。若析級不收，增 n_terms。非恆係無析解者，比二數法（PDE 求解與擬）互對。

## 驗

- [ ] SDE 規過一致查（漂有限、擴散正、x0 於域內）
- [ ] Fokker-Planck 密積分隨時單調降（存活函）
- [ ] Fokker-Planck 解無數值疵（振盪、負值）
- [ ] FPT 密非負，積分約 1.0 於二邊
- [ ] 靈敏析示期之單調關（v 對準、a 對均 FPT）
- [ ] 蒙特卡洛擬均 FPT 於 PDE/析解二標準誤內
- [ ] 擬與析間 KS 試最大 CDF 差低於 0.05

## 陷

- **Euler-Maruyama 步過大**：dt_sim 大致軌越邊，FPT 估偏。用期均 FPT 十分之一或用邊校式
- **析級截過早**：DDM 析 FPT 密用無窮級。項少（< 20）致疵，尤短時。至少 50 項且察收
- **PDE 求解之數值擴散**：一階有限差引人為擴散，寬 FPT 分布。用 Crank-Nicolson 或高階以求準
- **混 Ito 與 Stratonovich**：Fokker-Planck 方程依 SDE 約而異。上標式假 Ito 微積。若書為 Stratonovich 則加噪誘漂之校項
- **忽二邊**：二邊之題，總吸概必和為 1.0。只報上邊 FPT 而不計下邊致計誤

## 參

- `fit-drift-diffusion-model` — 應此動力估行為數之參
- `implement-diffusion-network` — 生成擴散模離散同 SDE 框
- `write-testthat-tests` — 試數值求解與析實
- `create-technical-report` — 書擴散析之果
