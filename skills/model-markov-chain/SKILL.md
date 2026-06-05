---
name: model-markov-chain
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

Construct, classify, and analyze discrete-time or continuous-time Markov chains from raw transition data or domain specifications, producing stationary distributions, mean first passage times, and simulation-based validation. Covers both DTMC and CTMC workflows end-to-end.

## When to Use

- You need to model a system whose future state depends only on its current state (memoryless property)
- You have observed transition counts or rates between a finite set of states
- You want to compute long-run steady-state probabilities for a process
- You need to determine expected hitting times or absorption probabilities
- You are classifying states as transient, recurrent, or absorbing for structural analysis
- You want to compare alternative Markov models for the same system
- You are building a foundation for more advanced models (hidden Markov models, reinforcement learning MDPs)

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

## Procedure

### Step 1: Define State Space and Transitions

1.1. Enumerate all distinct states. Confirm the list is exhaustive and mutually exclusive.

1.2. If working from raw observations, tabulate transition counts into an `n x n` count matrix `C` where `C[i,j]` is the number of observed transitions from state `i` to state `j`.

1.3. For continuous-time chains, collect holding times in each state alongside transition destinations.

1.4. Verify no state is missing from the enumeration by checking that every observed origin and destination appears in the state space.

1.5. Document the data source, observation period, and any filtering applied. This provenance record is essential for reproducing the analysis and explaining anomalies.

**Expected:** A well-defined state space of size `n` and either a count matrix or a list of (origin, destination, rate/count) tuples covering all observed transitions. The state space should be small enough for matrix operations (typically `n < 10000` for dense methods).

**On failure:** If states are missing, re-examine the source data and expand the enumeration. If the state space is too large for matrix methods, consider lumping rare states into an aggregate "other" state or switching to simulation-based analysis. If the count matrix is extremely sparse, verify the observation period is long enough to capture typical transitions.

### Step 2: Construct Transition Matrix or Generator

2.1. **Discrete-time (DTMC):** Normalize each row of the count matrix to obtain the transition probability matrix `P`:
   - `P[i,j] = C[i,j] / sum(C[i,])`
   - Verify every row sums to 1 (within tolerance).

2.2. **Continuous-time (CTMC):** Construct the rate (generator) matrix `Q`:
   - Off-diagonal: `Q[i,j] = rate of transition from i to j`
   - Diagonal: `Q[i,i] = -sum(Q[i,j] for j != i)`
   - Verify every row sums to 0 (within tolerance).

2.3. Handle zero-count rows (states never observed as origins) by deciding on a smoothing strategy: Laplace smoothing, absorbing convention, or flagging for review.

2.4. Store the matrix in a format suitable for downstream computation (dense for small chains, sparse for large ones).

**Expected:** A valid stochastic matrix `P` (rows sum to 1) or generator matrix `Q` (rows sum to 0) with no negative off-diagonal entries in `P` and no positive diagonal entries in `Q`.

**On failure:** If row sums deviate beyond tolerance, check for data corruption or floating-point issues. Re-normalize or re-examine source data.

### Step 3: Classify States

3.1. Compute the communication classes by finding strongly connected components of the directed graph induced by the transition matrix (only edges with positive probability).

3.2. For each communication class, determine:
   - **Recurrent** if the class has no outgoing edges to other classes.
   - **Transient** if it does have outgoing edges.
   - **Absorbing** if the class consists of a single state with `P[i,i] = 1`.

3.3. Check periodicity for each recurrent class by computing the GCD of all cycle lengths reachable from any state in the class.
   - Period = 1 means aperiodic.

3.4. Determine if the chain is **irreducible** (single communication class) or **reducible** (multiple classes).

3.5. Summarize: list each class, its type (transient/recurrent), its period, and whether any absorbing states exist.

**Expected:** A complete classification: every state assigned to a communication class with labels (transient, positive recurrent, null recurrent, absorbing) and periodicity.

**On failure:** If the graph analysis is inconsistent, verify the transition matrix has no negative entries and rows sum correctly. For very large chains, use iterative graph algorithms instead of full matrix powers.

### Step 4: Compute Stationary Distribution

4.1. **Irreducible aperiodic chain:** Solve `pi * P = pi` subject to `sum(pi) = 1`.
   - Reformulate as `pi * (P - I) = 0` with the normalization constraint.
   - Use eigenvalue decomposition: `pi` is the left eigenvector of `P` corresponding to eigenvalue 1, normalized to sum to 1.

4.2. **Irreducible periodic chain:** The stationary distribution still exists but the chain does not converge to it from arbitrary initial states. Compute it the same way as 4.1.

4.3. **Reducible chain:** Compute the stationary distribution for each recurrent class independently. The overall stationary distribution is a convex combination depending on absorption probabilities from transient states.

4.4. **CTMC:** Solve `pi * Q = 0` with `sum(pi) = 1`.

4.5. Verify: multiply the computed `pi` by `P` (or `Q`) and confirm the result equals `pi` within tolerance.

4.6. For reducible chains, compute the absorption probabilities from each transient state to each recurrent class. These probabilities, combined with the per-class stationary distributions, give the long-run behavior conditional on starting state.

4.7. Record the spectral gap (difference between the largest and second-largest eigenvalue magnitudes). This quantity governs the rate of convergence to stationarity and is useful for determining how many simulation steps are needed in Step 6.

**Expected:** A probability vector `pi` of length `n` with all entries non-negative, summing to 1, satisfying the balance equations within tolerance. The spectral gap should be positive for aperiodic irreducible chains.

**On failure:** If the eigensolver fails to converge, try iterative power method (`pi_k+1 = pi_k * P` until convergence). If multiple eigenvalues equal 1, the chain is reducible -- handle per Step 4.3. If the spectral gap is extremely small, the chain mixes slowly and will require very long simulations for validation.

### Step 5: Calculate Mean First Passage Times

5.1. Define the mean first passage time `m[i,j]` as the expected number of steps to reach state `j` starting from state `i`.

5.2. For an irreducible chain, solve the system of linear equations:
   - `m[i,j] = 1 + sum(P[i,k] * m[k,j] for k != j)` for all `i != j`
   - `m[j,j] = 1 / pi[j]` (mean recurrence time)

5.3. For absorbing chains, compute absorption probabilities and expected times to absorption:
   - Partition `P` into transient (`Q_t`) and absorbing blocks.
   - Fundamental matrix: `N = (I - Q_t)^{-1}`
   - Expected steps to absorption: `N * 1` (column vector of ones)
   - Absorption probabilities: `N * R` where `R` is the transient-to-absorbing block.

5.4. For CTMC, replace step counts with expected holding times using the generator matrix.

5.5. Present results as a matrix or table of pairwise first passage times for key state pairs.

**Expected:** A matrix of mean first passage times where diagonal entries equal mean recurrence times (`1/pi[j]`) and off-diagonal entries are finite for communicating state pairs.

**On failure:** If the linear system is singular, the chain has transient states that cannot reach the target. Report unreachable pairs as infinite. Verify the chain structure from Step 3.

### Step 6: Validate with Simulation

6.1. Simulate `K` independent sample paths of the chain for `T` steps each, starting from the initial distribution.

6.2. Estimate the stationary distribution empirically by counting state occupancy frequencies across all paths after discarding a burn-in period.

6.3. Compare simulated frequencies to the analytical stationary distribution. Compute the total variation distance or chi-squared statistic.

6.4. Estimate mean first passage times empirically by recording the first hitting time for each target state across replications.

6.5. Report agreement metrics:
   - Max absolute deviation between analytical and simulated stationary probabilities.
   - 95% confidence intervals for simulated first passage times vs. analytical values.

6.6. If discrepancies exceed tolerance, re-examine the transition matrix construction and classification steps.

**Expected:** Simulated stationary distribution within 0.01 total variation distance of the analytical solution (for sufficiently long runs). Simulated mean first passage times within 10% of analytical values.

**On failure:** Increase simulation length `T` or number of replications `K`. If discrepancies persist, the analytical solution may have numerical errors -- recompute with higher precision.

## Validation

- The transition matrix `P` has all non-negative entries and each row sums to 1 (or `Q` rows sum to 0 for CTMC)
- The stationary distribution `pi` is a valid probability vector satisfying `pi * P = pi`
- Mean recurrence times equal `1/pi[j]` for each recurrent state `j`
- Simulated state frequencies converge to the analytical stationary distribution
- State classification is consistent: no recurrent state has edges leaving its communication class
- All eigenvalues of `P` have magnitude at most 1, with exactly one eigenvalue equal to 1 per recurrent class
- For absorbing chains: absorption probabilities from each transient state sum to 1 across all absorbing classes
- The fundamental matrix `N = (I - Q_t)^{-1}` has all positive entries (expected visit counts are positive)
- Detailed balance holds if and only if the chain is reversible: `pi[i] * P[i,j] = pi[j] * P[j,i]` for all `i,j`

## Common Pitfalls

- **Non-exhaustive state space**: Missing states produce a sub-stochastic matrix (rows sum to less than 1). Always verify row sums before analysis.
- **Confusing DTMC and CTMC**: A rate matrix must have non-positive diagonal and rows summing to 0. Applying DTMC formulas to a rate matrix produces nonsense.
- **Ignoring periodicity**: A periodic chain has a valid stationary distribution but does not converge to it in the usual sense. Mixing time analysis must account for period.
- **Numerical instability for large chains**: Eigenvalue decomposition of large dense matrices is expensive and can lose precision. Use sparse solvers or iterative methods for chains with more than a few hundred states.
- **Zero-probability transitions**: Structural zeros in the transition matrix can make the chain reducible. Verify irreducibility before computing a single stationary distribution.
- **Insufficient simulation length**: Short simulations with poor mixing produce biased estimates. Always compute effective sample size and check trace plots.
- **Assuming reversibility without checking**: Many analytical shortcuts (e.g., detailed balance) apply only to reversible chains. Verify `pi[i] * P[i,j] = pi[j] * P[j,i]` before using reversibility-dependent results.
- **Floating-point accumulation in power method**: Iterating `pi * P` many times accumulates rounding errors. Periodically re-normalize `pi` to sum to 1 during power iteration.

## Related Skills

- [Fit Hidden Markov Model](../fit-hidden-markov-model/SKILL.md) -- extends Markov chains to latent-state models with observed emissions
- [Simulate Stochastic Process](../simulate-stochastic-process/SKILL.md) -- general simulation framework applicable to Markov chain sample paths and Monte Carlo validation
