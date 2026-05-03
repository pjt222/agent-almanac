---
name: simulate-stochastic-process
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Simulate stochastic processes (Markov chains, random walks, SDEs, MCMC)
  w/ convergence diagnostics, variance reduction, viz. Use → sample paths
  for est/predict/viz, analytical intractable, Monte Carlo needing
  convergence guarantees, validate analytical vs empirical, sample complex
  posteriors via MCMC.
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

Sample paths from stochastic processes — discrete Markov, continuous-time, SDEs, MCMC samplers — w/ convergence diagnostics, variance reduction, trajectory viz.

## Use When

- Generate sample paths for est/predict/viz
- Analytical intractable, sim only feasible
- MC est needing convergence guarantees + uncertainty quant
- Validate analytical (stationary, hitting times) vs empirical
- Sample complex posterior via MCMC
- Prototype stochastic model before full analytical

## In

### Required

| Input | Type | Description |
|-------|------|-------------|
| `process_type` | string | `"dtmc"`, `"ctmc"`, `"random_walk"`, `"brownian_motion"`, `"sde"`, `"mcmc"` |
| `parameters` | dict | Process-specific (transition matrix, drift/diffusion, target density) |
| `n_paths` | integer | Independent paths to sim |
| `n_steps` | integer | Time steps per path (or total MCMC iters) |

### Optional

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `initial_state` | scalar/vector | process-specific | Start state | distribution |
| `dt` | float | 0.01 | Time step → continuous discretization |
| `seed` | integer | random | Reproducibility |
| `burn_in` | integer | `n_steps / 10` | Initial discard (MCMC) |
| `thinning` | integer | 1 | Keep every k-th → reduce autocorr |
| `variance_reduction` | string | `"none"` | `"none"`, `"antithetic"`, `"stratified"`, `"control_variate"` |
| `target_function` | callable | none | Eval along paths → MC est |

## Do

### Step 1: Define Process + Params

1.1. ID process type + gather params:
   - **DTMC**: Transition matrix `P` + state space. Validate row-stochastic.
   - **CTMC**: Rate matrix `Q`. Rows sum 0, off-diag non-neg.
   - **Random walk**: Step distrib (e.g. `{-1, +1}` equal prob), boundaries.
   - **Brownian**: Drift `mu`, vol `sigma`, dim `d`.
   - **SDE (Ito)**: Drift `a(x,t)`, diffusion `b(x,t)`.
   - **MCMC**: Target log-density, proposal (RW Metropolis, HMC, Gibbs).

1.2. Validate consistency:
   - Matrix dims match state space size
   - SDE coefs satisfy growth + Lipschitz (informal min) for solver
   - MCMC proposal well-defined for target support

1.3. Set seed → reproducibility.

**Got:** Fully spec'd model w/ validated params + reproducible RNG state.

**If err:** Inconsistent params (e.g. non-stochastic matrix) → correct first. Pathological SDE coefs → diff discretization scheme.

### Step 2: Select Sim Method

2.1. Choose algo per type:

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

2.2. SDE → `dt` small enough for stability. Heuristic: start `dt = 0.01`, halve until results stabilize.

2.3. MCMC → tune proposal scale → acceptance ~:
   - 23.4% → high-dim RW Metropolis
   - 57.4% → 1D targets
   - 65-90% → HMC (depends on trajectory length)

2.4. Variance reduction config:
   - **Antithetic**: Each path w/ `Z` → also sim w/ `-Z`
   - **Stratified**: Partition prob space, sample within strata
   - **Control variates**: Correlated quantity w/ known E → reduces var

**Got:** Algo matched to type w/ tuning params.

**If err:** Unstable (Euler-Maruyama diverging) → implicit method | reduce `dt`.

### Step 3: Implement + Run

3.1. Allocate storage `n_paths` × `n_steps` (or dynamic for event-driven Gillespie).

3.2. Per path `i = 1, ..., n_paths`:

   **DTMC / Random Walk:**
   - `x[0] = initial_state`
   - For `t = 1..n_steps`: sample `x[t]` from transition given `x[t-1]`

   **CTMC (Gillespie):**
   - `x[0] = initial_state`, `time = 0`
   - While `time < T_max`:
     - Total rate `lambda = -Q[x, x]`
     - Holding time `tau ~ Exp(lambda)`
     - Next state from probs `Q[x, j] / lambda` for `j != x`
     - `time += tau`, record

   **SDE (Euler-Maruyama):**
   - `x[0] = initial_state`
   - For `t = 1..n_steps`:
     - `dW = sqrt(dt) * N(0, I)` (Wiener)
     - `x[t] = x[t-1] + a(x[t-1], t*dt) * dt + b(x[t-1], t*dt) * dW`

   **MCMC (Metropolis-Hastings):**
   - `x[0] = initial_state`
   - For `t = 1..n_steps`:
     - Propose `x' ~ q(x' | x[t-1])`
     - `alpha = min(1, p(x') * q(x[t-1]|x') / (p(x[t-1]) * q(x'|x[t-1])))`
     - Accept w/ prob `alpha`: `x[t] = x'` if accepted, else `x[t-1]`
     - Record decision

3.3. `target_function` provided → eval at each state, store.

3.4. Apply thinning: keep every `thinning`-th.

3.5. Discard `burn_in` from start (MCMC).

**Got:** `n_paths` complete trajectories in mem, optional fn evals. MCMC acceptance in target range.

**If err:** NaN/Inf → reduce `dt` (SDE) | check params. MCMC accept ~0% | ~100% → adjust proposal scale.

### Step 4: Convergence Diagnostics

4.1. **Trace plots**: per-component over time, subset paths. Visual check stationarity (no trends, stable var).

4.2. **Gelman-Rubin (R-hat)** for multi-chain MCMC:
   - Within-chain `W`, between-chain `B`
   - `R_hat = sqrt((n-1)/n + B/(n*W))`
   - `R_hat < 1.01` (strict) | `< 1.1` (lenient) → convergence

4.3. **Effective sample size (ESS)**:
   - Estimate autocorr at increasing lags
   - `ESS = n_samples / (1 + 2 * sum(autocorr))`
   - Rule: `ESS > 400` for reliable posterior summaries

4.4. **Geweke**: cmp mean first 10% vs last 50%. Z-score in [-2, 2] → convergence.

4.5. **Non-MCMC**: time-avg stats (mean, var) stabilize as path length ↑. Plot running averages.

4.6. Summary table:

| Diagnostic | Value | Threshold | Status |
|-----------|-------|-----------|--------|
| R-hat (max) | ... | < 1.01 | ... |
| ESS (min) | ... | > 400 | ... |
| Geweke z (max abs) | ... | < 2.0 | ... |
| Acceptance rate | ... | 0.15-0.50 | ... |

**Got:** All diagnostics pass thresholds. Trace shows stable, well-mixing chains.

**If err:** R-hat > 1.1 → run longer | improve proposal. ESS very low → ↑ thinning | better sampler (HMC). Geweke fails → extend burn-in.

### Step 5: Summary Stats + CIs

5.1. Per quantity (state occupancy, fn E, hitting times):
   - Point est = sample mean across paths (post burn-in + thin)
   - SE via ESS: `SE = SD / sqrt(ESS)`

5.2. Build CIs:
   - Normal approx: `est +/- z_{alpha/2} * SE`
   - Skewed → percentile bootstrap | batch means

5.3. Variance reduction → VRF:
   - `VRF = Var(naive) / Var(reduced)`
   - Report effective speedup

5.4. MC integration: report est, SE, 95% CI, ESS, # fn evals.

5.5. Distribution est:
   - Empirical quantiles (median, 2.5th, 97.5th)
   - KDE for continuous

5.6. Tabulate all w/ uncertainties.

**Got:** Point ests + SEs + CIs. Variance reduction (if applied) → VRF > 1.

**If err:** CIs too wide → ↑ `n_paths` | `n_steps`. Var reduction worsens (VRF < 1) → disable; control variate | antithetic mismatched.

### Step 6: Visualize

6.1. **Trajectory plots**: 5-20 paths over time. Use transparency for overlap.

6.2. **Ensemble stats**: overlay mean + pointwise 95% CI bands across paths.

6.3. **Marginal distributions**: at selected times, hist | density estimates of state across paths.

6.4. **Stationary cmp**: analytical avail → overlay on empirical hist (final time slice).

6.5. **Autocorr plots** (MCMC): ACF per component, reasonable lag.

6.6. **Diagnostic dashboard**: trace + ACF + running mean + marginal density → multi-panel.

6.7. Save figures vector (PDF/SVG) + raster (PNG) → docs.

**Got:** Pub-quality figures showing trajectory, distributional convergence, diagnostics. Analytical (where avail) matches empirical.

**If err:** Viz reveals non-stationarity | unexpected multimodality → revisit Steps 1-2 (param/method err). Cluttered plots → reduce paths shown | bigger figure.

## Check

- All trajectories in valid state space (no out-of-bounds, no NaN/Inf)
- DTMC/CTMC: empirical stationary → analytical (within MC err)
- SDE: halving `dt` doesn't qualitatively change → convergence order
- MCMC: R-hat < 1.01, ESS > 400, Geweke z in [-2, 2]
- CI widths shrink ∝ `1/sqrt(n_paths)` (CLT)
- Variance reduction → VRF > 1 (improves not worsens)
- Reproducibility: same seed → identical results

## Traps

- **Insufficient burn-in (MCMC)**: Poor initial state → long burn-in before samples represent target. Inspect trace + diagnostics, don't guess.
- **Euler-Maruyama instability (stiff SDE)**: Large drift gradients → explicit can diverge. Implicit | adaptive step.
- **Strong vs weak convergence (SDE)**: Strong = pathwise err (individual trajectories); weak = distributional (expectations). Euler-Maruyama: weak 1.0, strong 0.5.
- **PRNG quality**: Long sims → low-quality RNGs → correlated samples. Mersenne Twister | PCG | Xoshiro. Verify independence.
- **Ignore autocorr (MCMC)**: Treating autocorr samples as independent underestimates uncertainty. Use ESS, not raw count.
- **Antithetic for non-monotone fns**: Reduces var only for monotone fn of underlying uniforms. Non-monotone → can ↑ var.
- **Mem for large sims**: All time steps of many long paths → mem exhaust. Online stats (running mean, var) when full trajectories not needed for viz.

## →

- [Model Markov Chain](../model-markov-chain/SKILL.md) — transition matrices + analytical sims validate
- [Fit Hidden Markov Model](../fit-hidden-markov-model/SKILL.md) — sim from fitted HMMs → posterior predictive checking + synthetic data
