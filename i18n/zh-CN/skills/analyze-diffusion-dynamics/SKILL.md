---
name: analyze-diffusion-dynamics
description: >
  使用随机微分方程、Fokker-Planck 方程、首达时间分布和参数灵敏度分析来
  分析扩散过程的动力学。适用于推导连续时间扩散过程的概率密度演化、计算
  有界扩散的平均首达时间、分析漂移和扩散参数如何影响过程行为，或将解析
  解与随机模拟进行对比验证。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: diffusion
  complexity: intermediate
  language: multi
  tags: diffusion, sde, fokker-planck, first-passage, dynamics, analysis
  locale: zh-CN
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# 分析扩散动力学

通过指定随机微分方程、推导相应的 Fokker-Planck 方程、解析或数值计算首达时间分布、进行参数灵敏度分析，以及将解析结果与蒙特卡洛模拟对比验证，来表征扩散过程的行为。

## 适用场景

- 推导连续时间扩散过程的概率密度演化
- 计算有界扩散的平均首达时间或完整首达时间分布
- 分析漂移、扩散系数和边界参数如何影响过程行为
- 将解析解与随机模拟进行对比验证
- 建立对漂移-扩散模型或生成式扩散过程底层动力学的直觉

## 输入

- **必需**：SDE 规格（漂移函数、扩散系数、域/边界）
- **必需**：漂移和扩散函数的参数值或范围
- **必需**：边界条件（吸收、反射或混合）
- **可选**：瞬态分析的时间范围（默认：从动力学自动检测）
- **可选**：数值 PDE 求解器的空间离散分辨率（默认：dx=0.001）
- **可选**：模拟验证的蒙特卡洛轨迹数（默认：10000）

## 步骤

### 第 1 步：指定 SDE 模型

定义过程的漂移函数、扩散系数和边界条件。

1. 以标准伊藤形式写出 SDE：

```
dX(t) = mu(X, t) dt + sigma(X, t) dW(t)
```

其中 `mu` 是漂移函数，`sigma` 是扩散系数，`W(t)` 是标准维纳过程。

2. 在代码中实现 SDE 组件：

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

3. 定义初始条件：

```python
# Point source at x0
x0 = 0.75  # starting point (e.g., midpoint between boundaries for DDM with z=a/2)

# Or a distribution
initial_distribution = lambda x: np.exp(-50 * (x - 0.75)**2)  # narrow Gaussian
```

4. 验证参数一致性：

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

**预期结果：** 一个完整指定的 SDE，具有有限的漂移值、严格正的扩散系数，以及域边界内的初始条件。

**失败处理：** 如果扩散系数在域内任何点为零或负值，则过程是退化的——检查函数形式。如果漂移在边界处无穷大，考虑反射边界是否更合适。

### 第 2 步：推导 Fokker-Planck 方程

将 SDE 转换为概率密度的等价偏微分方程。

1. 为转移密度 p(x, t) 写出 Fokker-Planck 方程（FPE）：

```
dp/dt = -d/dx [mu(x,t) * p(x,t)] + (1/2) * d^2/dx^2 [sigma(x,t)^2 * p(x,t)]
```

2. 对于常系数（标准 DDM 情况），这简化为：

```
dp/dt = -v * dp/dx + (s^2 / 2) * d^2p/dx^2
```

3. 通过有限差分实现 FPE 的数值求解：

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

4. 运行并绘制演化密度：

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

**预期结果：** 密度从 x0 处的窄峰开始，根据 SDE 系数扩散和漂移，并随着概率在边界被吸收而逐渐衰减。生存概率从 1 单调下降趋向 0。

**失败处理：** 如果密度出现振荡或负值，时间步长太大——减小 dt。如果密度不衰减（生存概率保持接近 1），边界可能离 x0 太远或漂移将过程推离两个边界。检查求解器中的边界条件。

### 第 3 步：计算首达时间分布

推导过程首次到达边界的时间分布。

1. 从生存函数计算首达时间密度：

```python
def first_passage_time_density(survival, dt):
    """FPT density is the negative derivative of survival probability."""
    fpt_density = -np.gradient(survival, dt)
    fpt_density = np.maximum(fpt_density, 0)  # enforce non-negativity
    return fpt_density
```

2. 对于常漂移的标准 DDM，使用已知的解析解：

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

3. 计算 FPT 分布的汇总统计量：

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

4. 对于双边界问题，使用每个吸收壁的概率通量（边界网格点处密度的有限差分）按边界分离 FPT。

**预期结果：** FPT 密度是右偏的单峰分布。对于正漂移的 DDM，上边界 FPT 具有更多的质量和更短的众数。典型 DDM 参数（v=1, a=1.5, z=0.75）的平均 FPT 大约为 0.5-2.0 秒。

**失败处理：** 如果 FPT 密度有负值，说明数值微分有噪声——应用小的高斯平滑核。如果两个边界的总概率之和不近似为 1.0，要么时间范围太短（增加 t_max），要么求解器存在概率泄漏。

### 第 4 步：分析参数灵敏度

量化每个参数变化如何影响首达时间分布。

1. 定义灵敏度分析的参数网格：

```python
param_ranges = {
    "v": np.linspace(0.2, 3.0, 15),     # drift rate
    "a": np.linspace(0.5, 2.5, 15),      # boundary separation
    "z_ratio": np.linspace(0.3, 0.7, 9)  # starting point as fraction of a
}

base_params = {"v": 1.0, "a": 1.5, "z_ratio": 0.5}
```

2. 在保持其他参数在基线的同时扫描每个参数：

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

3. 绘制灵敏度曲线：

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

4. 计算偏导数（基线处的局部灵敏度）：

```python
for param_name, result in sensitivity_results.items():
    idx_base = np.argmin(np.abs(result["values"] - base_params[param_name]))
    if idx_base > 0 and idx_base < len(result["values"]) - 1:
        d_mean = (result["mean_fpt"][idx_base+1] - result["mean_fpt"][idx_base-1]) / \
                 (result["values"][idx_base+1] - result["values"][idx_base-1])
        print(f"d(mean_FPT)/d({param_name}) at baseline: {d_mean:.4f}")
```

**预期结果：** 漂移率（v）对平均 FPT 有强烈的负效应，对准确率有强烈的正效应。边界间距（a）对平均 FPT 有强烈的正效应（速度-准确率权衡）。起始点（z）移动准确率，对平均 FPT 的影响较小。

**失败处理：** 如果灵敏度曲线平坦或非单调，检查参数范围是否足够宽，以及求解器的时间范围是否捕获了完整的 FPT 分布。相对于漂移率的非单调平均 FPT 表明存在求解器错误。

### 第 5 步：用数值模拟验证解析结果

运行 SDE 的蒙特卡洛模拟以确认解析和数值 PDE 结果。

1. 实现 SDE 的 Euler-Maruyama 模拟：

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

2. 运行模拟并计算经验 FPT 分布：

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

3. 将模拟与解析或数值 PDE 解进行比较：

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

4. 量化方法之间的一致性：

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

**预期结果：** 模拟直方图与解析 FPT 曲线紧密匹配。50,000 条轨迹的 KS 检验最大 CDF 差异低于 0.05。模拟的平均 FPT 在解析值的 2 个标准误差内。

**失败处理：** 如果模拟与解析不一致，首先检查 Euler-Maruyama 步长——dt_sim 应足够小以免遗漏边界穿越（尝试 dt_sim=0.00001）。如果解析级数不收敛，增加 n_terms。对于不存在解析解的非常系数情况，将两种数值方法（PDE 求解器与模拟）相互比较。

## 验证清单

- [ ] SDE 规格通过一致性检查（有限漂移、正扩散、x0 在域内）
- [ ] Fokker-Planck 密度积分为随时间单调递减的值（生存函数）
- [ ] Fokker-Planck 解无数值伪影（振荡、负值）
- [ ] FPT 密度非负且在两个边界上积分近似为 1.0
- [ ] 灵敏度分析显示预期的单调关系（v vs. 准确率，a vs. 平均 FPT）
- [ ] 蒙特卡洛模拟平均 FPT 在 PDE/解析解的 2 个标准误差内
- [ ] 模拟与解析之间的 KS 检验最大 CDF 差异低于 0.05

## 常见问题

- **Euler-Maruyama 步长过大**：大的 dt_sim 导致轨迹越过边界，导致有偏的 FPT 估计。使用的 dt_sim 最多为预期平均 FPT 的 1/10，或使用边界校正方案
- **过早截断 FPT 级数**：解析 DDM FPT 密度使用无穷级数。项数过少（< 20）会产生可见伪影，尤其在短时间段。使用至少 50 项并检查收敛性
- **忽略 PDE 求解器中的数值扩散**：一阶有限差分方案引入人工扩散，使 FPT 分布变宽。使用 Crank-Nicolson 或更高阶方案以提高精度
- **混淆伊藤和 Stratonovich 形式**：Fokker-Planck 方程因 SDE 约定不同而不同。上述标准形式假设伊藤微积分。如果 SDE 是以 Stratonovich 形式写的，需添加噪声诱导漂移校正项
- **未考虑两个边界**：在双边界问题中，总吸收概率必须加和为 1.0。仅报告上边界 FPT 而不考虑下边界会给出不正确的统计量

## 相关技能

- `fit-drift-diffusion-model` - 应用这些动力学从行为数据估计参数
- `implement-diffusion-network` - 生成式扩散模型离散化相同的 SDE 框架
- `write-testthat-tests` - 测试数值求解器和解析实现
- `create-technical-report` - 记录扩散分析结果
