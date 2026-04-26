---
name: model-markov-chain
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Build and analyze discrete or continuous Markov chains including transition
  matrix construction, state classification, stationary distribution computation,
  and mean first passage times. Use when modeling a memoryless system with
  observed transition counts or rates, computing long-run steady-state
  probabilities, determining expected hitting times or absorption probabilities,
  classifying states as transient or recurrent, or building a foundation for
  hidden Markov models or reinforcement learning MDPs.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: stochastic-processes
  complexity: intermediate
  language: multi
  tags: stochastic, markov-chain, transition-matrix, stationary-distribution
---

# Model Markov Chain

Construct + classify + analyze DTMC/CTMC from raw transition data or domain specs → stationary distributions + mean first passage times + simulation validation. Both DTMC + CTMC workflows end-to-end.

## Use When

- Memoryless system: future depends only on current state
- Observed transition counts/rates between finite state set
- Long-run steady-state probabilities
- Expected hitting times or absorption probabilities
- Classify states transient/recurrent/absorbing for structural analysis
- Compare alternative Markov models for same system
- Foundation for advanced (HMM, RL MDPs)

## In

### Required

| Input | Type | Description |
|-------|------|-------------|
| `state_space` | list/vector | Exhaustive enumeration of all states in the chain |
| `transition_data` | matrix, data frame, or edge list | Raw transition counts, a probability matrix, or a rate matrix (for CTMC) |
| `chain_type` | string | Either `"discrete"` (DTMC) or `"continuous"` (CTMC) |

### Optional

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `initial_distribution` | vector | uniform | Starting state probabilities |
| `time_horizon` | integer/float | 100 | Number of steps (DTMC) or time units (CTMC) for simulation |
| `tolerance` | float | 1e-10 | Convergence tolerance for iterative computations |
| `absorbing_states` | list | auto-detect | States explicitly marked as absorbing |
| `labels` | list | state indices | Human-readable names for each state |
| `method` | string | `"eigen"` | Solver method: `"eigen"`, `"power"`, or `"linear_system"` |

## Do

### Step 1: Define State Space + Transitions

1.1. Enumerate all distinct states. Confirm exhaustive + mutually exclusive.

1.2. Raw obs → tabulate counts into `n x n` count matrix `C` where `C[i,j]` = transitions from `i` to `j`.

1.3. CTMC → collect holding times each state alongside transition destinations.

1.4. Verify no state missing → every observed origin + destination in state space.

1.5. Doc data source, observation period, filtering. Provenance essential for reproducing + explaining anomalies.

→ Well-defined state space size `n` + count matrix or (origin, destination, rate/count) tuples covering all observed transitions. Small enough for matrix ops (typically `n < 10000` dense).

If err: states missing → re-examine source, expand enumeration. Too large → lump rare into "other" or simulation-based. Extremely sparse → verify observation period long enough.

### Step 2: Construct Transition Matrix or Generator

2.1. **DTMC:** Normalize each row of count matrix → probability matrix `P`:
   - `P[i,j] = C[i,j] / sum(C[i,])`
   - Verify row sums = 1 within tolerance

2.2. **CTMC:** Construct rate (generator) matrix `Q`:
   - Off-diag: `Q[i,j] = rate i to j`
   - Diag: `Q[i,i] = -sum(Q[i,j] for j != i)`
   - Verify row sums = 0 within tolerance

2.3. Zero-count rows (states never observed as origins) → smoothing: Laplace, absorbing, or flag for review.

2.4. Store format suitable for downstream (dense small, sparse large).

→ Valid stochastic `P` (rows sum 1) or generator `Q` (rows sum 0), no neg off-diag in `P`, no pos diag in `Q`.

If err: row sums deviate → check data corruption or float issues. Re-normalize or re-examine.

### Step 3: Classify States

3.1. Communication classes via strongly connected components of directed graph (positive prob edges only).

3.2. Per class:
   - **Recurrent** if no outgoing edges to other classes
   - **Transient** if has outgoing edges
   - **Absorbing** if single state w/ `P[i,i] = 1`

3.3. Periodicity per recurrent class via GCD of cycle lengths. Period 1 = aperiodic.

3.4. **Irreducible** (single class) or **reducible** (multiple)?

3.5. Summarize: each class, type, period, absorbing states.

→ Complete classification: every state assigned class + labels (transient/positive recurrent/null recurrent/absorbing) + periodicity.

If err: graph analysis inconsistent → verify no neg entries + rows sum correctly. Very large → iterative graph algorithms not full matrix powers.

### Step 4: Stationary Distribution

4.1. **Irreducible aperiodic:** Solve `pi * P = pi` s.t. `sum(pi) = 1`.
   - Reformulate `pi * (P - I) = 0` w/ normalization
   - Eigendecomp: `pi` = left eigenvector of `P` for eigenvalue 1, normalized

4.2. **Irreducible periodic:** Stationary still exists but doesn't converge from arbitrary init. Same as 4.1.

4.3. **Reducible:** Stationary per recurrent class independently. Overall = convex combo depending on absorption probabilities from transient.

4.4. **CTMC:** Solve `pi * Q = 0` w/ `sum(pi) = 1`.

4.5. Verify: `pi * P` (or `Q`) = `pi` within tolerance.

4.6. Reducible → absorption probabilities from each transient to each recurrent class. Combined w/ per-class stationary → long-run conditional on start.

4.7. Spectral gap (largest vs. 2nd-largest eigenvalue magnitudes). Governs convergence rate, useful for sim length Step 6.

→ Probability vector `pi` length `n`, all non-neg, sum 1, satisfies balance equations within tolerance. Spectral gap > 0 for aperiodic irreducible.

If err: eigensolver no converge → iterative power method (`pi_k+1 = pi_k * P` until converge). Multiple eigenvalues = 1 → reducible, handle 4.3. Very small spectral gap → mixes slowly, needs very long sims.

### Step 5: Mean First Passage Times

5.1. Define `m[i,j]` = expected steps to reach `j` from `i`.

5.2. Irreducible → solve linear system:
   - `m[i,j] = 1 + sum(P[i,k] * m[k,j] for k != j)` for all `i != j`
   - `m[j,j] = 1 / pi[j]` (mean recurrence)

5.3. Absorbing → absorption probs + expected times:
   - Partition `P` into transient (`Q_t`) + absorbing
   - Fundamental: `N = (I - Q_t)^{-1}`
   - Expected steps to absorption: `N * 1`
   - Absorption probs: `N * R` where `R` = transient-to-absorbing block

5.4. CTMC → step counts → expected holding times via generator matrix.

5.5. Present matrix/table of pairwise FPT for key state pairs.

→ FPT matrix: diag = mean recurrence (`1/pi[j]`), off-diag = finite for communicating pairs.

If err: linear system singular → transient states can't reach target. Report unreachable as infinite. Verify chain structure Step 3.

### Step 6: Validate w/ Simulation

6.1. Sim `K` independent paths for `T` steps, starting from initial dist.

6.2. Estimate stationary empirically: state occupancy frequencies across paths after burn-in.

6.3. Compare sim freq vs. analytical stationary. Total variation distance or chi-squared.

6.4. Estimate FPT empirically: first hitting time per target state across reps.

6.5. Report agreement:
   - Max abs deviation analytical vs. sim stationary probs
   - 95% CI for sim FPT vs. analytical

6.6. Discrepancies > tolerance → re-examine matrix construction + classification.

→ Sim stationary within 0.01 TV distance of analytical (sufficient runs). Sim FPT within 10% of analytical.

If err: increase `T` or `K`. Persists → analytical may have numerical errors, recompute higher precision.

## Check

- Transition matrix `P`: all non-neg, rows sum 1 (or `Q` rows sum 0 CTMC)
- Stationary `pi` valid probability vector, `pi * P = pi`
- Mean recurrence = `1/pi[j]` for each recurrent state `j`
- Sim state freqs converge to analytical stationary
- State classification consistent: no recurrent state edges leaving its class
- All eigenvalues of `P` ≤ 1 magnitude, exactly one = 1 per recurrent class
- Absorbing chains: absorption probs from each transient sum to 1 across absorbing classes
- Fundamental `N = (I - Q_t)^{-1}` all positive (expected visit counts positive)
- Detailed balance iff reversible: `pi[i] * P[i,j] = pi[j] * P[j,i]` for all `i,j`

## Traps

- **Non-exhaustive state space**: Missing states → sub-stochastic (rows < 1). Always verify row sums first
- **Confuse DTMC vs. CTMC**: Rate matrix has non-pos diag + rows sum 0. DTMC formulas on rate matrix → nonsense
- **Ignore periodicity**: Periodic chain has valid stationary but doesn't converge usual sense. Mixing time analysis must account for period
- **Numerical instability large chains**: Eigendecomp large dense matrices expensive + loses precision. Use sparse solvers or iterative for >few hundred states
- **Zero-prob transitions**: Structural zeros → reducible. Verify irreducibility before single stationary
- **Insufficient sim length**: Short sims w/ poor mixing → biased. Always compute effective sample size + check trace plots
- **Assume reversibility w/o checking**: Many shortcuts (detailed balance) only reversible chains. Verify `pi[i] * P[i,j] = pi[j] * P[j,i]` before
- **Float accumulation in power method**: Iterating `pi * P` many times accumulates rounding. Periodically re-normalize during power iteration

## →

- [Fit Hidden Markov Model](../fit-hidden-markov-model/SKILL.md) — extends Markov chains to latent-state models w/ observed emissions
- [Simulate Stochastic Process](../simulate-stochastic-process/SKILL.md) — general sim framework for Markov chain sample paths + Monte Carlo validation
