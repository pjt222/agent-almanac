---
name: analyze-diffusion-dynamics
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

# Analyze Diffusion Dynamics

Characterize the behavior of diffusion processes by specifying their stochastic differential equations, deriving the corresponding Fokker-Planck equation, computing first-passage time distributions analytically or numerically, performing parameter sensitivity analysis, and validating analytical results against Monte Carlo simulation.

## When to Use

- Deriving the probability density evolution of a continuous-time diffusion process
- Computing mean first-passage times or full first-passage time distributions for bounded diffusion
- Analyzing how drift, diffusion coefficient, and boundary parameters affect process behavior
- Validating closed-form solutions against stochastic simulation
- Building intuition for the dynamics underlying drift-diffusion models or generative diffusion processes

## Inputs

- **Required**: SDE specification (drift function, diffusion coefficient, domain/boundaries)
- **Required**: Parameter values or ranges for the drift and diffusion functions
- **Required**: Boundary conditions (absorbing, reflecting, or mixed)
- **Optional**: Time horizon for transient analysis (default: auto-detect from dynamics)
- **Optional**: Spatial discretization resolution for numerical PDE solvers (default: dx=0.001)
- **Optional**: Number of Monte Carlo trajectories for simulation validation (default: 10000)

## Procedure

### Step 1: Specify the SDE Model

Define the drift function, diffusion coefficient, and boundary conditions for the process.

1. Write the SDE in standard Ito form:

```
dX(t) = mu(X, t) dt + sigma(X, t) dW(t)
```

where `mu` is the drift function, `sigma` is the diffusion coefficient, and `W(t)` is a standard Wiener process.

2. Implement the SDE components in code:

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

3. Define the initial condition:

```python
# Point source at x0
x0 = 0.75  # starting point (e.g., midpoint between boundaries for DDM with z=a/2)

# Or a distribution
initial_distribution = lambda x: np.exp(-50 * (x - 0.75)**2)  # narrow Gaussian
```

4. Validate parameter consistency:

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

**Expected:** A fully specified SDE with finite drift values, strictly positive diffusion coefficient, and initial condition within the domain boundaries.

**On failure:** If the diffusion coefficient is zero or negative at any point in the domain, the process is degenerate -- check the functional form. If drift is infinite at a boundary, consider whether a reflecting boundary is more appropriate.

### Step 2: Derive the Fokker-Planck Equation

Convert the SDE to its equivalent partial differential equation for the probability density.

1. Write the Fokker-Planck equation (FPE) for the transition density p(x, t):

```
dp/dt = -d/dx [mu(x,t) * p(x,t)] + (1/2) * d^2/dx^2 [sigma(x,t)^2 * p(x,t)]
```

2. For constant coefficients (standard DDM case), this simplifies to:

```
dp/dt = -v * dp/dx + (s^2 / 2) * d^2p/dx^2
```

3. Implement numerical solution of the FPE via finite differences:

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

4. Run and plot the evolving density:

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

**Expected:** Density starts as a narrow peak at x0, spreads and drifts according to the SDE coefficients, and gradually decays as probability is absorbed at the boundaries. Survival probability decreases monotonically from 1 toward 0.

**On failure:** If the density develops oscillations or negative values, the time step is too large -- reduce dt. If density does not decay (survival stays near 1), the boundaries may be too far from x0 or drift pushes away from both boundaries. Check boundary conditions in the solver.

### Step 3: Compute First-Passage Time Distributions

Derive the distribution of times at which the process first reaches a boundary.

1. Compute the first-passage time density from the survival function:

```python
def first_passage_time_density(survival, dt):
    """FPT density is the negative derivative of survival probability."""
    fpt_density = -np.gradient(survival, dt)
    fpt_density = np.maximum(fpt_density, 0)  # enforce non-negativity
    return fpt_density
```

2. For the standard DDM with constant drift, use the known analytic solution:

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

3. Compute summary statistics of the FPT distribution:

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

4. For two-boundary problems, separate FPT by boundary using probability flux at each absorbing wall (finite difference of density at the boundary grid points).

**Expected:** FPT density is a right-skewed unimodal distribution. For the DDM with positive drift, the upper boundary FPT has more mass and a shorter mode than the lower boundary FPT. Mean FPT for typical DDM parameters (v=1, a=1.5, z=0.75) is approximately 0.5-2.0 seconds.

**On failure:** If the FPT density has negative values, the numerical differentiation is noisy -- apply a small Gaussian smoothing kernel. If total probability at both boundaries does not sum to approximately 1.0, either the time horizon is too short (increase t_max) or there is probability leakage in the solver.

### Step 4: Analyze Parameter Sensitivity

Quantify how changes in each parameter affect the first-passage time distribution.

1. Define the parameter grid for sensitivity analysis:

```python
param_ranges = {
    "v": np.linspace(0.2, 3.0, 15),     # drift rate
    "a": np.linspace(0.5, 2.5, 15),      # boundary separation
    "z_ratio": np.linspace(0.3, 0.7, 9)  # starting point as fraction of a
}

base_params = {"v": 1.0, "a": 1.5, "z_ratio": 0.5}
```

2. Sweep each parameter while holding others at baseline:

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

3. Plot sensitivity curves:

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

4. Compute partial derivatives (local sensitivity at baseline):

```python
for param_name, result in sensitivity_results.items():
    idx_base = np.argmin(np.abs(result["values"] - base_params[param_name]))
    if idx_base > 0 and idx_base < len(result["values"]) - 1:
        d_mean = (result["mean_fpt"][idx_base+1] - result["mean_fpt"][idx_base-1]) / \
                 (result["values"][idx_base+1] - result["values"][idx_base-1])
        print(f"d(mean_FPT)/d({param_name}) at baseline: {d_mean:.4f}")
```

**Expected:** Drift rate (v) has a strong negative effect on mean FPT and strong positive effect on accuracy. Boundary separation (a) has a strong positive effect on mean FPT (speed-accuracy tradeoff). Starting point (z) shifts accuracy with a smaller effect on mean FPT.

**On failure:** If sensitivity curves are flat or non-monotonic, check that the parameter range is wide enough and that the solver time horizon captures the full FPT distribution. Non-monotonic mean FPT with respect to drift rate would indicate a solver bug.

### Step 5: Validate Analytics Against Numerical Simulation

Run Monte Carlo simulations of the SDE to confirm analytical and numerical PDE results.

1. Implement Euler-Maruyama simulation of the SDE:

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

2. Run simulation and compute empirical FPT distribution:

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

3. Compare simulation against analytical or numerical PDE solution:

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

4. Quantify agreement between methods:

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

**Expected:** Simulation histograms closely match the analytical FPT curves. KS-test maximum CDF difference below 0.05 for 50,000 trajectories. Mean FPT from simulation within 2 standard errors of the analytical value.

**On failure:** If simulation disagrees with analytics, first check the Euler-Maruyama step size -- dt_sim should be small enough that boundary crossings are not missed (try dt_sim=0.00001). If the analytical series does not converge, increase n_terms. For non-constant coefficients where no analytic solution exists, compare two numerical methods (PDE solver vs. simulation) against each other.

## Validation

- [ ] SDE specification passes consistency checks (finite drift, positive diffusion, x0 in domain)
- [ ] Fokker-Planck density integrates to a value that decreases monotonically over time (survival function)
- [ ] Fokker-Planck solution shows no numerical artifacts (oscillations, negative values)
- [ ] FPT density is non-negative and integrates to approximately 1.0 across both boundaries
- [ ] Sensitivity analysis shows expected monotonic relationships (v vs. accuracy, a vs. mean FPT)
- [ ] Monte Carlo simulation mean FPT is within 2 standard errors of the PDE/analytic solution
- [ ] KS-test maximum CDF difference between simulation and analytics is below 0.05

## Common Pitfalls

- **Euler-Maruyama step size too large**: Large dt_sim causes trajectories to overshoot boundaries, leading to biased FPT estimates. Use dt_sim at most 1/10 of the expected mean FPT, or use a boundary-corrected scheme.
- **Truncating the FPT series too early**: The analytic DDM FPT density uses an infinite series. Too few terms (< 20) causes visible artifacts, especially at short times. Use at least 50 terms and check convergence.
- **Ignoring numerical diffusion in PDE solver**: First-order finite difference schemes introduce artificial diffusion that broadens the FPT distribution. Use Crank-Nicolson or higher-order schemes for accuracy.
- **Confusing Ito and Stratonovich forms**: The Fokker-Planck equation differs depending on the SDE convention. The standard form above assumes Ito calculus. If the SDE was written in Stratonovich form, add the noise-induced drift correction term.
- **Not accounting for both boundaries**: In two-boundary problems, the total absorption probability must sum to 1.0. Reporting only the upper boundary FPT without accounting for the lower boundary gives incorrect statistics.

## Related Skills

- `fit-drift-diffusion-model` - applies these dynamics to estimate parameters from behavioral data
- `implement-diffusion-network` - generative diffusion models discretize the same SDE framework
- `write-testthat-tests` - testing numerical solvers and analytical implementations
- `create-technical-report` - documenting diffusion analysis results
