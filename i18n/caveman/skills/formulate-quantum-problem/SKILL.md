---
name: formulate-quantum-problem
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Formulate a quantum mechanics or quantum chemistry problem with proper
  mathematical framework including Hilbert space, operators, boundary conditions,
  and approximation method selection. Use when setting up a quantum mechanics
  problem for analytic or numerical solution, formulating a quantum chemistry
  calculation, translating a physical scenario into the Schrodinger or Dirac
  formalism, or choosing between perturbation theory, variational methods,
  DFT, and exact diagonalization.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: theoretical-science
  complexity: advanced
  language: natural
  tags: theoretical, quantum-mechanics, quantum-chemistry, hilbert-space, formulation
---

# Formulate Quantum Problem

Turn physical system into well-posed quantum problem. Find relevant degrees of freedom. Build Hamiltonian + state space. Set boundary conditions. Pick approximation method. Validate formulation vs known limits.

## When Use

- Set up quantum mechanics problem for analytic or numerical solution
- Formulate quantum chemistry calculation (molecular orbitals, electronic structure)
- Translate physical scenario into Dirac or Schrodinger formalism
- Pick between perturbation theory, variational, DFT, exact diagonalization
- Prep theoretical model for comparison with experimental spectroscopic or scattering data

## Inputs

- **Required**: Physical system description (atom, molecule, solid, field)
- **Required**: Observables (energy spectrum, transition rates, ground state)
- **Optional**: Experimental constraints or data (spectral lines, binding energies)
- **Optional**: Desired accuracy or computational budget
- **Optional**: Preferred formalism (wave mechanics, matrix mechanics, second quantization, path integral)

## Steps

### Step 1: Find Physical System + Relevant Degrees of Freedom

Characterize system before writing equations:

1. **Particle content**: List particles (electrons, nuclei, photons, phonons) + quantum numbers (spin, charge, mass).
2. **Symmetries**: Find spatial (spherical, cylindrical, translational, crystal group), internal (spin rotation, gauge), discrete (parity, time reversal).
3. **Energy scales**: Find relevant energy scales. Decide which degrees of freedom active, which frozen or adiabatic.
4. **Degrees of freedom shrink**: Apply Born-Oppenheimer if nuclear + electronic timescales separate. Find collective coordinates if many-body simplify.

```markdown
## System Characterization
- **Particles**: [list with quantum numbers]
- **Active degrees of freedom**: [coordinates, spins, fields]
- **Frozen degrees of freedom**: [and justification for freezing]
- **Symmetry group**: [continuous and discrete]
- **Energy scale hierarchy**: [e.g., electronic >> vibrational >> rotational]
```

**Got:** Complete inventory — particles, quantum numbers, symmetries, justified active vs frozen degrees of freedom.

**If fail:** Energy scale hierarchy unclear? Keep all degrees of freedom, flag need for scale analysis. Premature truncation → qualitatively wrong physics.

### Step 2: Build Hamiltonian + State Space

Build math framework from degrees of freedom in Step 1:

1. **Hilbert space**: Define state space. Finite-dim → specify basis (spin-1/2 |up>, |down>). Infinite-dim → specify function space (L2(R^3) for single particle in 3D).
2. **Kinetic terms**: Kinetic operator each particle. Position: T = -hbar^2/(2m) nabla^2.
3. **Potential terms**: All interaction potentials (Coulomb, harmonic, spin-orbit, external). Explicit functional form + coupling constants.
4. **Composite Hamiltonian**: Assemble H = T + V, group by interaction type. Multi-particle → include exchange + correlation or note approximation entry.
5. **Operator algebra**: Verify Hamiltonian Hermitian. Find constants of motion ([H, O] = 0) for block-diagonalization.

```markdown
## Hamiltonian Structure
- **Hilbert space**: [definition and basis]
- **H = T + V decomposition**:
  - T = [kinetic terms]
  - V = [potential terms, grouped by type]
- **Constants of motion**: [operators commuting with H]
- **Symmetry-adapted basis**: [if block diagonalization is possible]
```

**Got:** Complete Hermitian Hamiltonian, all terms explicit. Hilbert space defined. Constants of motion identified.

**If fail:** Not manifestly Hermitian? Check missing conjugate terms or gauge phases. Hilbert space ambiguous (relativistic)? Specify formalism explicit, note issue.

### Step 3: Set Boundary + Initial Conditions

Constrain problem for unique solution:

1. **Boundary conditions**: Bound state → normalizability (psi -> 0 at infinity). Scattering → incoming wave boundary. Periodic → Bloch or Born-von Karman.
2. **Domain restrictions**: Spatial domain. Particle in box → walls. Hydrogen atom → radial + angular. Lattice models → lattice + topology.
3. **Initial state** (time-dependent): State at t=0 as expansion in energy eigenbasis or wave packet with center + width.
4. **Constraint equations**: Indistinguishable particles → symmetrize (bosons) or antisymmetrize (fermions). Gauge theories → gauge-fixing.

```markdown
## Boundary and Initial Conditions
- **Spatial domain**: [definition]
- **Boundary type**: [Dirichlet / Neumann / periodic / scattering]
- **Normalization**: [condition]
- **Particle statistics**: [bosonic / fermionic / distinguishable]
- **Initial state** (if time-dependent): [specification]
```

**Got:** Boundary conditions physically motivated, mathematically consistent with Hamiltonian domain, sufficient for unique solution (or well-defined scattering matrix).

**If fail:** Over- or under-determined? Check self-adjointness of Hamiltonian on chosen domain. Non-self-adjoint → careful treatment of deficiency indices.

### Step 4: Pick Approximation Method

Pick solution strategy for problem structure:

1. **Check exact solvability**: Problem reduces to known exactly solvable model (harmonic oscillator, hydrogen atom, Ising)? Yes → use exact + perturbation for corrections.

2. **Perturbation theory** (weak coupling):
   - Split H = H0 + lambda V, H0 exactly solvable
   - Verify lambda V small vs level spacing of H0
   - Check degeneracy; degenerate perturbation theory if needed
   - Good for: weak interaction, few-body, analytic results

3. **Variational methods** (ground state):
   - Trial wave function with adjustable parameters
   - Trial function satisfies boundary + symmetry
   - Good for: ground state energy target, many-body

4. **Density Functional Theory** (many-electron):
   - Exchange-correlation functional (LDA, GGA, hybrid)
   - Basis set (plane waves, Gaussian, numerical atomic orbitals)
   - Good for: many-electron, ground state density + energy

5. **Numerical exact methods** (small, benchmarking):
   - Exact diagonalization for small Hilbert spaces
   - Quantum Monte Carlo for ground state sampling
   - DMRG for 1D or quasi-1D
   - Good for: high accuracy, small system

```markdown
## Approximation Method Selection
- **Method chosen**: [name]
- **Justification**: [why this method fits the problem structure]
- **Expected accuracy**: [order of perturbation, variational bound quality, DFT functional accuracy]
- **Computational cost**: [scaling with system size]
- **Alternatives considered**: [and why they were rejected]
```

**Got:** Justified choice with clear accuracy + cost. Alternatives documented.

**If fail:** No single method clearly right? Formulate for two methods + compare. Disagreement reveals difficulty + guides refinement.

### Step 5: Validate Formulation vs Known Limits

Before solving, verify formulation reproduces known physics:

1. **Classical limit**: Take hbar -> 0 (or large quantum numbers), verify Hamiltonian reduces to correct classical mechanics.
2. **Non-interacting limit**: Set couplings to zero, verify solution = product of single-particle states.
3. **Symmetry limits**: Verify formulation respects all identified symmetries. Check Hamiltonian transforms correctly under symmetry group.
4. **Dimensional analysis**: Verify every term has units of energy. Check characteristic length, energy, time scales physically reasonable.
5. **Known exact results**: Special cases (hydrogen atom Z=1, harmonic oscillator quadratic potential)? Verify formulation reproduces them.

```markdown
## Validation Checks
| Check | Expected Result | Status |
|-------|----------------|--------|
| Classical limit (hbar -> 0) | [classical Hamiltonian] | [Pass/Fail] |
| Non-interacting limit | [product states] | [Pass/Fail] |
| Symmetry transformation | [correct representation] | [Pass/Fail] |
| Dimensional analysis | [all terms in energy units] | [Pass/Fail] |
| Known exact case | [reproduced result] | [Pass/Fail] |
```

**Got:** All validation checks pass. Formulation self-consistent, ready to solve.

**If fail:** Failed check = error in Hamiltonian construction or boundary. Trace to term or condition, fix before solving.

## Checks

- [ ] All particles + quantum numbers explicit
- [ ] Hilbert space defined with clear basis
- [ ] Hamiltonian Hermitian + all terms correct units
- [ ] Constants of motion identified + used for simplification
- [ ] Boundary conditions physically motivated + mathematically sufficient
- [ ] Particle statistics (bosonic/fermionic) correctly enforced
- [ ] Approximation method choice justified + accuracy stated
- [ ] Classical, non-interacting, symmetry limits checked
- [ ] Known exact results reproduced special cases
- [ ] Formulation complete for implementation

## Pitfalls

- **Dropping degrees of freedom early**: Freezing without energy scale check misses physics. Always justify with scale argument.
- **Non-Hermitian Hamiltonian**: Forgetting conjugate terms in spin-orbit or complex potentials. Verify H = H-dagger explicit.
- **Wrong boundary for scattering**: Bound-state boundary (normalizability) for scattering discards continuous spectrum. Match boundary to physical question.
- **Ignoring degeneracy in perturbation theory**: Non-degenerate on degenerate level → divergent corrections. Check degeneracy before expanding.
- **Over-rely on single approximation**: Different methods = complementary failure modes. Variational → upper bounds but miss excited states. Perturbation diverges at strong coupling. Cross-validate when possible.
- **Dimensional inconsistency**: Mixing natural units (hbar = 1) with SI in same expression. Pick unit system at start, state it explicit.

## See Also

- `derive-theoretical-result` -- derive analytic results from formulated problem
- `survey-theoretical-literature` -- prior work on similar quantum systems
