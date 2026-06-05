---
name: simulate-stochastic-process
description: >
  Simulate stochastic processes (Markov chains, random walks, SDEs, MCMC) with
  convergence diagnostics, variance reduction, and visualization. Use when
  generating sample paths for estimation, prediction, or visualization;
  when analytical solutions are intractable; running Monte Carlo estimation
  needing convergence guarantees; validating analytical results against
  empirical simulation; or sampling from complex posteriors via MCMC.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: stochastic-processes
  complexity: advanced
  language: multi
  tags: stochastic, simulation, mcmc, convergence, monte-carlo
---

# Simulate Stochastic Process

Simulate sample paths from stochastic processes -- including discrete Markov chains, continuous-time processes, stochastic differential equations, and MCMC samplers -- with convergence diagnostics, variance reduction techniques, and trajectory visualization.

## When to Use

- You need to generate sample paths from a stochastic process for estimation, prediction, or visualization
- Analytical solutions are intractable and simulation is the only feasible approach
- You are running Monte Carlo estimation and need convergence guarantees and uncertainty quantification
- You want to validate analytical results (stationary distributions, hitting times) against empirical simulation
- You need to sample from a complex posterior distribution using MCMC
- You are prototyping a stochastic model before committing to full analytical treatment

## Inputs

### Required

| Input | Type | Description |
|-------|------|-------------|
| `process_type` | string | Type of process: `"dtmc"`, `"ctmc"`, `"random_walk"`, `"brownian_motion"`, `"sde"`, `"mcmc"` |
| `parameters` | dict | Process-specific parameters (transition matrix, drift/diffusion coefficients, target density, etc.) |
| `n_paths` | integer | Number of independent sample paths to simulate |
| `n_steps` | integer | Number of time steps per path (or total MCMC iterations) |

### Optional

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `initial_state` | scalar/vector | process-specific | Starting state or distribution for each path |
| `dt` | float | 0.01 | Time step size for continuous-time discretization |
| `seed` | integer | random | Random seed for reproducibility |
| `burn_in` | integer | `n_steps / 10` | Number of initial steps to discard (MCMC) |
| `thinning` | integer | 1 | Keep every k-th sample to reduce autocorrelation |
| `variance_reduction` | string | `"none"` | Method: `"none"`, `"antithetic"`, `"stratified"`, `"control_variate"` |
| `target_function` | callable | none | Function to evaluate along paths for Monte Carlo estimation |

## Procedure

### Step 1: Define Process Model and Parameters

1.1. Identify the process type and gather all required parameters:
   - **DTMC**: Transition matrix `P` and state space. Validate `P` is row-stochastic.
   - **CTMC**: Rate matrix `Q`. Validate rows sum to 0 and off-diagonal entries are non-negative.
   - **Random walk**: Step distribution (e.g., `{-1, +1}` with equal probability), boundaries if any.
   - **Brownian motion**: Drift `mu`, volatility `sigma`, dimension `d`.
   - **SDE (Ito)**: Drift function `a(x,t)`, diffusion function `b(x,t)`.
   - **MCMC**: Target log-density, proposal mechanism (random walk Metropolis, Hamiltonian, Gibbs components).

1.2. Validate parameter consistency:
   - Matrix dimensions match state space size.
   - SDE coefficients satisfy growth and Lipschitz conditions (at least informally) for the chosen solver.
   - MCMC proposal is well-defined for the support of the target distribution.

1.3. Set the random seed for reproducibility.

**Expected:** A fully specified stochastic model with validated parameters and a reproducible random state.

**On failure:** If parameters are inconsistent (e.g., non-stochastic matrix), correct them before proceeding. If SDE coefficients are pathological, consider a different discretization scheme.

### Step 2: Select Simulation Method

2.1. Choose the appropriate algorithm based on process type:

| Process | Method | Key Property |
|---------|--------|-------------|
| DTMC | Direct sampling from transition row | Exact |
| CTMC | Gillespie algorithm (SSA) | Exact, event-driven |
| CTMC (approx.) | Tau-leaping | Approximate, faster for high rates |
| Random walk | Direct sampling of increments | Exact |
| Brownian motion | Cumulative sum of Gaussian increments | Exact for fixed `dt` |
| SDE (general) | Euler-Maruyama | Order 0.5 strong, order 1.0 weak |
| SDE (higher order) | Milstein | Order 1.0 strong (scalar noise) |
| SDE (stiff) | Implicit Euler-Maruyama | Stable for stiff drift |
| MCMC (general) | Metropolis-Hastings | Asymptotically exact |
| MCMC (gradient) | Hamiltonian Monte Carlo (HMC) | Better mixing for high dimensions |
| MCMC (conditional) | Gibbs sampler | Exact conditionals when available |

2.2. For SDE methods, choose `dt` small enough for numerical stability. A useful heuristic: start with `dt = 0.01` and halve it until results stabilize.

2.3. For MCMC, tune the proposal scale to achieve an acceptance rate of approximately:
   - 23.4% for high-dimensional random walk Metropolis
   - 57.4% for one-dimensional targets
   - 65-90% for HMC (depends on trajectory length)

2.4. If variance reduction is requested, configure it:
   - **Antithetic variates**: For each path with random increments `Z`, also simulate with `-Z`.
   - **Stratified sampling**: Partition the probability space and sample within each stratum.
   - **Control variates**: Identify a correlated quantity with known expectation to reduce variance.

**Expected:** A selected simulation algorithm matched to the process type with appropriate tuning parameters.

**On failure:** If the chosen method is unstable (e.g., Euler-Maruyama diverging), switch to an implicit method or reduce `dt`.

### Step 3: Implement and Run Simulation

3.1. Allocate storage for `n_paths` trajectories, each of length `n_steps` (or dynamically for event-driven methods like Gillespie).

3.2. For each path `i = 1, ..., n_paths`:

   **DTMC / Random Walk:**
   - Set `x[0] = initial_state`
   - For `t = 1, ..., n_steps`: sample `x[t]` from the transition distribution given `x[t-1]`

   **CTMC (Gillespie):**
   - Set `x[0] = initial_state`, `time = 0`
   - While `time < T_max`:
     - Compute total rate `lambda = -Q[x, x]`
     - Sample holding time `tau ~ Exp(lambda)`
     - Sample next state from transition probabilities `Q[x, j] / lambda` for `j != x`
     - Update `time += tau`, record transition

   **SDE (Euler-Maruyama):**
   - Set `x[0] = initial_state`
   - For `t = 1, ..., n_steps`:
     - `dW = sqrt(dt) * N(0, I)` (Wiener increment)
     - `x[t] = x[t-1] + a(x[t-1], t*dt) * dt + b(x[t-1], t*dt) * dW`

   **MCMC (Metropolis-Hastings):**
   - Set `x[0] = initial_state`
   - For `t = 1, ..., n_steps`:
     - Propose `x' ~ q(x' | x[t-1])`
     - Compute acceptance ratio `alpha = min(1, p(x') * q(x[t-1]|x') / (p(x[t-1]) * q(x'|x[t-1])))`
     - Accept with probability `alpha`: `x[t] = x'` if accepted, else `x[t] = x[t-1]`
     - Record acceptance decision

3.3. If `target_function` is provided, evaluate it at each state along each path and store the values.

3.4. Apply thinning: keep every `thinning`-th sample.

3.5. Discard `burn_in` samples from the beginning of each path (primarily for MCMC).

**Expected:** `n_paths` complete trajectories stored in memory, with optional function evaluations. MCMC acceptance rate is within the target range.

**On failure:** If simulation produces NaN or Inf values, reduce `dt` for SDE methods or check parameter validity. If MCMC acceptance rate is near 0% or 100%, adjust proposal scale.

### Step 4: Apply Convergence Diagnostics

4.1. **Trace plots**: Plot the value of each component over time for a subset of paths. Visual inspection for stationarity (no trends, stable variance).

4.2. **Gelman-Rubin diagnostic (R-hat)**: For MCMC with multiple chains:
   - Compute within-chain variance `W` and between-chain variance `B`.
   - `R_hat = sqrt((n-1)/n + B/(n*W))`
   - Convergence indicated by `R_hat < 1.01` (strict) or `R_hat < 1.1` (lenient).

4.3. **Effective sample size (ESS)**:
   - Estimate autocorrelation at increasing lags.
   - `ESS = n_samples / (1 + 2 * sum(autocorrelations))`
   - Rule of thumb: `ESS > 400` for reliable posterior summaries.

4.4. **Geweke diagnostic**: Compare the mean of the first 10% and last 50% of each chain. The z-score should be within [-2, 2] for convergence.

4.5. **For non-MCMC processes**: Verify that time-averaged statistics (mean, variance) stabilize as path length increases. Plot running averages.

4.6. Report a summary table:

| Diagnostic | Value | Threshold | Status |
|-----------|-------|-----------|--------|
| R-hat (max) | ... | < 1.01 | ... |
| ESS (min) | ... | > 400 | ... |
| Geweke z (max abs) | ... | < 2.0 | ... |
| Acceptance rate | ... | 0.15-0.50 | ... |

**Expected:** All convergence diagnostics pass their thresholds. Trace plots show stable, well-mixing chains.

**On failure:** If R-hat > 1.1, run longer chains or improve the proposal. If ESS is very low, increase thinning or switch to a better sampler (e.g., HMC). If Geweke fails, extend burn-in.

### Step 5: Compute Summary Statistics with Confidence Intervals

5.1. For each quantity of interest (state occupancy, function expectation, hitting times):
   - Compute the point estimate as the sample mean across paths (after burn-in and thinning).
   - Compute the standard error using the effective sample size: `SE = SD / sqrt(ESS)`.

5.2. Construct confidence intervals:
   - Normal approximation: `estimate +/- z_{alpha/2} * SE`
   - For skewed distributions, use percentile bootstrap or batch means.

5.3. If variance reduction was applied, compute the variance reduction factor:
   - `VRF = Var(naive estimator) / Var(reduced estimator)`
   - Report the effective speedup.

5.4. For Monte Carlo integration estimates:
   - Report the estimate, standard error, 95% CI, ESS, and number of function evaluations.

5.5. For distribution estimates:
   - Compute empirical quantiles (median, 2.5th, 97.5th percentiles).
   - Kernel density estimates for continuous quantities.

5.6. Tabulate all summary statistics with their uncertainties.

**Expected:** Point estimates with associated standard errors and confidence intervals. Variance reduction (if applied) yields a VRF > 1.

**On failure:** If confidence intervals are too wide, increase `n_paths` or `n_steps`. If variance reduction worsens estimates (VRF < 1), disable it -- the control variate or antithetic scheme may not suit the problem.

### Step 6: Visualize Trajectories and Distributions

6.1. **Trajectory plots**: Plot a representative subset of sample paths (5-20 paths) over time. Use transparency for overlapping paths.

6.2. **Ensemble statistics**: Overlay the mean trajectory and pointwise 95% confidence bands across all paths.

6.3. **Marginal distributions**: At selected time points, plot histograms or density estimates of the state distribution across paths.

6.4. **Stationary distribution comparison**: If an analytical stationary distribution is available, overlay it on the empirical histogram from the final time slice.

6.5. **Autocorrelation plots**: For MCMC, plot the autocorrelation function (ACF) for each component up to a reasonable lag.

6.6. **Diagnostic dashboard**: Combine trace plots, ACF plots, running mean plots, and marginal densities into a single multi-panel figure for comprehensive assessment.

6.7. Save all figures in both vector (PDF/SVG) and raster (PNG) formats for documentation.

**Expected:** Publication-quality figures showing trajectory behavior, distributional convergence, and diagnostic summaries. Analytical solutions (where available) match empirical results.

**On failure:** If visualizations reveal non-stationarity or multimodality not expected from the model, revisit Steps 1-2 for parameter or method errors. If plots are cluttered, reduce the number of displayed paths or increase figure size.

## Validation

- All simulated trajectories remain in the valid state space (no out-of-bounds values, no NaN/Inf)
- For DTMC/CTMC: empirical stationary distribution converges to the analytical one (within expected Monte Carlo error)
- For SDE: halving `dt` does not qualitatively change the results (convergence order check)
- For MCMC: R-hat < 1.01, ESS > 400, Geweke z-scores within [-2, 2]
- Confidence interval widths decrease proportionally to `1/sqrt(n_paths)` (central limit theorem)
- Variance reduction techniques yield VRF > 1 (estimates improve, not worsen)
- Reproducibility: re-running with the same seed produces identical results

## Common Pitfalls

- **Insufficient burn-in for MCMC**: Starting from a poor initial state requires a long burn-in before samples represent the target distribution. Always inspect trace plots and use convergence diagnostics rather than guessing the burn-in length.
- **Euler-Maruyama instability for stiff SDEs**: If the drift term has large gradients, explicit Euler-Maruyama can diverge. Switch to implicit methods or use adaptive step sizing.
- **Confusing strong and weak convergence for SDEs**: Strong convergence measures pathwise error (important for individual trajectories); weak convergence measures distributional error (sufficient for expectations). Euler-Maruyama has weak order 1.0 but strong order 0.5.
- **Pseudorandom number generator quality**: For very long simulations, low-quality RNGs can produce correlated samples. Use a well-tested generator (Mersenne Twister, PCG, or Xoshiro) and verify independence.
- **Ignoring autocorrelation in MCMC**: Treating autocorrelated MCMC samples as independent underestimates uncertainty. Always use effective sample size, not raw sample count, for standard errors.
- **Antithetic variates for non-monotone functions**: Antithetic sampling reduces variance only when the estimand is a monotone function of the underlying uniforms. For non-monotone functions, it can increase variance.
- **Memory for large simulations**: Storing all time steps of many long paths can exhaust memory. Use online statistics (running mean, variance) when full trajectories are not needed for visualization.

## Related Skills

- [Model Markov Chain](../model-markov-chain/SKILL.md) -- provides the transition matrices and analytical solutions that simulation validates
- [Fit Hidden Markov Model](../fit-hidden-markov-model/SKILL.md) -- simulation from fitted HMMs enables posterior predictive checking and synthetic data generation
