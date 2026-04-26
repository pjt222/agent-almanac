---
name: model-markov-chain
locale: caveman
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

Construct, classify, analyze discrete-time or continuous-time Markov chains from raw transition data or domain specifications, producing stationary distributions, mean first passage times, simulation-based validation. Covers both DTMC + CTMC workflows end-to-end.

## When Use

- Need to model system whose future state depends only on current state (memoryless property)
- Have observed transition counts or rates between finite set of states
- Want to compute long-run steady-state probabilities for a process
- Need to determine expected hitting times or absorption probabilities
- Classifying states as transient, recurrent, or absorbing for structural analysis
- Want to compare alternative Markov models for same system
- Building foundation for more advanced models (hidden Markov models, reinforcement learning MDPs)

## Inputs

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

## Steps

### Step 1: Define State Space + Transitions

1.1. Enumerate all distinct states. Confirm list is exhaustive + mutually exclusive.

1.2. If working from raw observations, tabulate transition counts into `n x n` count matrix `C` where `C[i,j]` is number of observed transitions from state `i` to state `j`.

1.3. For continuous-time chains, collect holding times in each state alongside transition destinations.

1.4. Verify no state is missing from enumeration by checking every observed origin + destination appears in state space.

1.5. Document data source, observation period, any filtering applied. Provenance record essential for reproducing analysis + explaining anomalies.

**Got:** Well-defined state space of size `n` + either count matrix or list of (origin, destination, rate/count) tuples covering all observed transitions. State space should be small enough for matrix operations (typically `n < 10000` for dense methods).

**If fail:** States missing? Re-examine source data + expand enumeration. State space too large for matrix methods? Consider lumping rare states into aggregate "other" state or switching to simulation-based analysis. Count matrix extremely sparse? Verify observation period long enough to capture typical transitions.

### Step 2: Construct Transition Matrix or Generator

2.1. **Discrete-time (DTMC):** Normalize each row of count matrix to obtain transition probability matrix `P`:
   - `P[i,j] = C[i,j] / sum(C[i,])`
   - Verify every row sums to 1 (within tolerance).

2.2. **Continuous-time (CTMC):** Construct rate (generator) matrix `Q`:
   - Off-diagonal: `Q[i,j] = rate of transition from i to j`
   - Diagonal: `Q[i,i] = -sum(Q[i,j] for j != i)`
   - Verify every row sums to 0 (within tolerance).

2.3. Handle zero-count rows (states never observed as origins) by deciding on smoothing strategy: Laplace smoothing, absorbing convention, or flagging for review.

2.4. Store matrix in format suitable for downstream computation (dense for small chains, sparse for large ones).

**Got:** Valid stochastic matrix `P` (rows sum to 1) or generator matrix `Q` (rows sum to 0) with no negative off-diagonal entries in `P` + no positive diagonal entries in `Q`.

**If fail:** Row sums deviate beyond tolerance? Check for data corruption or floating-point issues. Re-normalize or re-examine source data.

### Step 3: Classify States

3.1. Compute communication classes by finding strongly connected components of directed graph induced by transition matrix (only edges with positive probability).

3.2. For each communication class, determine:
   - **Recurrent** if class has no outgoing edges to other classes.
   - **Transient** if it does have outgoing edges.
   - **Absorbing** if class consists of single state with `P[i,i] = 1`.

3.3. Check periodicity for each recurrent class by computing GCD of all cycle lengths reachable from any state in class.
   - Period = 1 means aperiodic.

3.4. Determine if chain is **irreducible** (single communication class) or **reducible** (multiple classes).

3.5. Summarize: list each class, its type (transient/recurrent), its period, whether any absorbing states exist.

**Got:** Complete classification: every state assigned to communication class with labels (transient, positive recurrent, null recurrent, absorbing) + periodicity.

**If fail:** Graph analysis inconsistent? Verify transition matrix has no negative entries + rows sum correctly. For very large chains, use iterative graph algorithms instead of full matrix powers.

### Step 4: Compute Stationary Distribution

4.1. **Irreducible aperiodic chain:** Solve `pi * P = pi` subject to `sum(pi) = 1`.
   - Reformulate as `pi * (P - I) = 0` with normalization constraint.
   - Use eigenvalue decomposition: `pi` is left eigenvector of `P` corresponding to eigenvalue 1, normalized to sum to 1.

4.2. **Irreducible periodic chain:** Stationary distribution still exists but chain does not converge to it from arbitrary initial states. Compute it same way as 4.1.

4.3. **Reducible chain:** Compute stationary distribution for each recurrent class independently. Overall stationary distribution is convex combination depending on absorption probabilities from transient states.

4.4. **CTMC:** Solve `pi * Q = 0` with `sum(pi) = 1`.

4.5. Verify: multiply computed `pi` by `P` (or `Q`) + confirm result equals `pi` within tolerance.

4.6. For reducible chains, compute absorption probabilities from each transient state to each recurrent class. These probabilities, combined with per-class stationary distributions, give long-run behavior conditional on starting state.

4.7. Record spectral gap (difference between largest + second-largest eigenvalue magnitudes). Quantity governs rate of convergence to stationarity + useful for determining how many simulation steps needed in Step 6.

**Got:** Probability vector `pi` of length `n` with all entries non-negative, summing to 1, satisfying balance equations within tolerance. Spectral gap should be positive for aperiodic irreducible chains.

**If fail:** Eigensolver fails to converge? Try iterative power method (`pi_k+1 = pi_k * P` until convergence). Multiple eigenvalues equal 1? Chain is reducible — handle per Step 4.3. Spectral gap extremely small? Chain mixes slowly + will require very long simulations for validation.

### Step 5: Calculate Mean First Passage Times

5.1. Define mean first passage time `m[i,j]` as expected number of steps to reach state `j` starting from state `i`.

5.2. For irreducible chain, solve system of linear equations:
   - `m[i,j] = 1 + sum(P[i,k] * m[k,j] for k != j)` for all `i != j`
   - `m[j,j] = 1 / pi[j]` (mean recurrence time)

5.3. For absorbing chains, compute absorption probabilities + expected times to absorption:
   - Partition `P` into transient (`Q_t`) + absorbing blocks.
   - Fundamental matrix: `N = (I - Q_t)^{-1}`
   - Expected steps to absorption: `N * 1` (column vector of ones)
   - Absorption probabilities: `N * R` where `R` is transient-to-absorbing block.

5.4. For CTMC, replace step counts with expected holding times using generator matrix.

5.5. Present results as matrix or table of pairwise first passage times for key state pairs.

**Got:** Matrix of mean first passage times where diagonal entries equal mean recurrence times (`1/pi[j]`) + off-diagonal entries are finite for communicating state pairs.

**If fail:** Linear system singular? Chain has transient states that cannot reach target. Report unreachable pairs as infinite. Verify chain structure from Step 3.

### Step 6: Validate with Simulation

6.1. Simulate `K` independent sample paths of chain for `T` steps each, starting from initial distribution.

6.2. Estimate stationary distribution empirically by counting state occupancy frequencies across all paths after discarding burn-in period.

6.3. Compare simulated frequencies to analytical stationary distribution. Compute total variation distance or chi-squared statistic.

6.4. Estimate mean first passage times empirically by recording first hitting time for each target state across replications.

6.5. Report agreement metrics:
   - Max absolute deviation between analytical + simulated stationary probabilities.
   - 95% confidence intervals for simulated first passage times vs analytical values.

6.6. If discrepancies exceed tolerance, re-examine transition matrix construction + classification steps.

**Got:** Simulated stationary distribution within 0.01 total variation distance of analytical solution (for sufficiently long runs). Simulated mean first passage times within 10% of analytical values.

**If fail:** Increase simulation length `T` or number of replications `K`. Discrepancies persist? Analytical solution may have numerical errors — recompute with higher precision.

## Checks

- Transition matrix `P` has all non-negative entries + each row sums to 1 (or `Q` rows sum to 0 for CTMC)
- Stationary distribution `pi` is valid probability vector satisfying `pi * P = pi`
- Mean recurrence times equal `1/pi[j]` for each recurrent state `j`
- Simulated state frequencies converge to analytical stationary distribution
- State classification consistent: no recurrent state has edges leaving its communication class
- All eigenvalues of `P` have magnitude at most 1, with exactly one eigenvalue equal to 1 per recurrent class
- For absorbing chains: absorption probabilities from each transient state sum to 1 across all absorbing classes
- Fundamental matrix `N = (I - Q_t)^{-1}` has all positive entries (expected visit counts are positive)
- Detailed balance holds if + only if chain is reversible: `pi[i] * P[i,j] = pi[j] * P[j,i]` for all `i,j`

## Pitfalls

- **Non-exhaustive state space**: Missing states produce sub-stochastic matrix (rows sum to less than 1). Always verify row sums before analysis.
- **Confusing DTMC + CTMC**: Rate matrix must have non-positive diagonal + rows summing to 0. Applying DTMC formulas to rate matrix produces nonsense.
- **Ignoring periodicity**: Periodic chain has valid stationary distribution but does not converge to it in usual sense. Mixing time analysis must account for period.
- **Numerical instability for large chains**: Eigenvalue decomposition of large dense matrices is expensive + can lose precision. Use sparse solvers or iterative methods for chains with more than few hundred states.
- **Zero-probability transitions**: Structural zeros in transition matrix can make chain reducible. Verify irreducibility before computing single stationary distribution.
- **Insufficient simulation length**: Short simulations with poor mixing produce biased estimates. Always compute effective sample size + check trace plots.
- **Assuming reversibility without checking**: Many analytical shortcuts (e.g., detailed balance) apply only to reversible chains. Verify `pi[i] * P[i,j] = pi[j] * P[j,i]` before using reversibility-dependent results.
- **Floating-point accumulation in power method**: Iterating `pi * P` many times accumulates rounding errors. Periodically re-normalize `pi` to sum to 1 during power iteration.

## See Also

- [Fit Hidden Markov Model](../fit-hidden-markov-model/SKILL.md) — extends Markov chains to latent-state models with observed emissions
- [Simulate Stochastic Process](../simulate-stochastic-process/SKILL.md) — general simulation framework applicable to Markov chain sample paths + Monte Carlo validation
