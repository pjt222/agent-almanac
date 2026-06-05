---
name: formulate-quantum-problem
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

Translate a physical system into a well-posed quantum mechanical problem by identifying the relevant degrees of freedom, constructing the Hamiltonian and state space, specifying boundary conditions, selecting an appropriate approximation method, and validating the formulation against known limits.

## When to Use

- Setting up a quantum mechanics problem for analytic or numerical solution
- Formulating a quantum chemistry calculation (molecular orbitals, electronic structure)
- Translating a physical scenario into the Dirac or Schrodinger formalism
- Choosing between perturbation theory, variational methods, DFT, or exact diagonalization
- Preparing a theoretical model for comparison with experimental spectroscopic or scattering data

## Inputs

- **Required**: Description of the physical system (atom, molecule, solid, field, etc.)
- **Required**: Observable(s) of interest (energy spectrum, transition rates, ground state properties)
- **Optional**: Experimental constraints or data to match (spectral lines, binding energies)
- **Optional**: Desired accuracy level or computational budget
- **Optional**: Preferred formalism (wave mechanics, matrix mechanics, second quantization, path integral)

## Procedure

### Step 1: Identify Physical System and Relevant Degrees of Freedom

Characterize the system completely before writing any equations:

1. **Particle content**: List all particles (electrons, nuclei, photons, phonons) and their quantum numbers (spin, charge, mass).
2. **Symmetries**: Identify spatial symmetries (spherical, cylindrical, translational, crystal group), internal symmetries (spin rotation, gauge), and discrete symmetries (parity, time reversal).
3. **Energy scales**: Determine the relevant energy scales to decide which degrees of freedom are active and which can be frozen or treated adiabatically.
4. **Degrees of freedom reduction**: Apply the Born-Oppenheimer approximation if nuclear and electronic timescales separate. Identify collective coordinates if many-body simplifications apply.

```markdown
## System Characterization
- **Particles**: [list with quantum numbers]
- **Active degrees of freedom**: [coordinates, spins, fields]
- **Frozen degrees of freedom**: [and justification for freezing]
- **Symmetry group**: [continuous and discrete]
- **Energy scale hierarchy**: [e.g., electronic >> vibrational >> rotational]
```

**Expected:** A complete inventory of particles, quantum numbers, symmetries, and a justified selection of active versus frozen degrees of freedom.

**On failure:** If the energy scale hierarchy is unclear, retain all degrees of freedom initially and flag the need for a scale analysis. Premature truncation leads to qualitatively wrong physics.

### Step 2: Construct Hamiltonian and State Space

Build the mathematical framework from the degrees of freedom identified in Step 1:

1. **Hilbert space**: Define the state space. For finite-dimensional systems, specify the basis (e.g., spin-1/2 basis |up>, |down>). For infinite-dimensional systems, specify the function space (e.g., L2(R^3) for a single particle in 3D).
2. **Kinetic terms**: Write the kinetic energy operator for each particle. In position representation, T = -hbar^2/(2m) nabla^2.
3. **Potential terms**: Write all interaction potentials (Coulomb, harmonic, spin-orbit, external fields). Be explicit about functional form and coupling constants.
4. **Composite Hamiltonian**: Assemble H = T + V, grouping terms by interaction type. For multi-particle systems, include exchange and correlation terms or note where they will enter via approximation.
5. **Operator algebra**: Verify that the Hamiltonian is Hermitian. Identify constants of motion ([H, O] = 0) that can be used to block-diagonalize the problem.

```markdown
## Hamiltonian Structure
- **Hilbert space**: [definition and basis]
- **H = T + V decomposition**:
  - T = [kinetic terms]
  - V = [potential terms, grouped by type]
- **Constants of motion**: [operators commuting with H]
- **Symmetry-adapted basis**: [if block diagonalization is possible]
```

**Expected:** A complete, Hermitian Hamiltonian with all terms explicitly written, the Hilbert space defined, and constants of motion identified.

**On failure:** If the Hamiltonian is not manifestly Hermitian, check for missing conjugate terms or gauge-dependent phases. If the Hilbert space is ambiguous (e.g., for relativistic particles), specify the formalism explicitly and note the issue.

### Step 3: Specify Boundary and Initial Conditions

Constrain the problem to have a unique solution:

1. **Boundary conditions**: For bound state problems, require normalizability (psi -> 0 at infinity). For scattering problems, specify incoming wave boundary conditions. For periodic systems, apply Bloch or Born-von Karman conditions.
2. **Domain restrictions**: Specify the spatial domain. For a particle in a box, define the walls. For a hydrogen atom, define the radial and angular domains. For lattice models, define the lattice and its topology.
3. **Initial state** (time-dependent problems): Define the state at t=0 as an expansion in the energy eigenbasis or as a wave packet with specified center and width.
4. **Constraint equations**: For indistinguishable particles, enforce symmetrization (bosons) or antisymmetrization (fermions). For gauge theories, impose gauge-fixing conditions.

```markdown
## Boundary and Initial Conditions
- **Spatial domain**: [definition]
- **Boundary type**: [Dirichlet / Neumann / periodic / scattering]
- **Normalization**: [condition]
- **Particle statistics**: [bosonic / fermionic / distinguishable]
- **Initial state** (if time-dependent): [specification]
```

**Expected:** Boundary conditions that are physically motivated, mathematically consistent with the Hamiltonian's domain, and sufficient to determine a unique solution (or a well-defined scattering matrix).

**On failure:** If boundary conditions are over- or under-determined, check the self-adjointness of the Hamiltonian on the chosen domain. Non-self-adjoint Hamiltonians require careful treatment of deficiency indices.

### Step 4: Select Approximation Method

Choose a solution strategy appropriate to the problem's structure:

1. **Assess exact solvability**: Check if the problem reduces to a known exactly solvable model (harmonic oscillator, hydrogen atom, Ising model, etc.). If yes, use the exact solution as the primary result and perturbation theory for corrections.

2. **Perturbation theory** (weak coupling):
   - Split H = H0 + lambda V where H0 is exactly solvable
   - Verify that lambda V is small compared to the level spacing of H0
   - Check for degeneracy; use degenerate perturbation theory if needed
   - Suitable when: interaction is weak, few-body system, analytic results needed

3. **Variational methods** (ground state focus):
   - Choose a trial wave function with adjustable parameters
   - Ensure the trial function satisfies boundary conditions and symmetry
   - Suitable when: ground state energy is the primary target, many-body system

4. **Density Functional Theory** (many-electron systems):
   - Choose the exchange-correlation functional (LDA, GGA, hybrid)
   - Define the basis set (plane waves, Gaussian, numerical atomic orbitals)
   - Suitable when: many-electron system, ground state density and energy needed

5. **Numerical exact methods** (small systems, benchmarking):
   - Exact diagonalization for small Hilbert spaces
   - Quantum Monte Carlo for ground state sampling
   - DMRG for one-dimensional or quasi-one-dimensional systems
   - Suitable when: high accuracy is needed and the system is small enough

```markdown
## Approximation Method Selection
- **Method chosen**: [name]
- **Justification**: [why this method fits the problem structure]
- **Expected accuracy**: [order of perturbation, variational bound quality, DFT functional accuracy]
- **Computational cost**: [scaling with system size]
- **Alternatives considered**: [and why they were rejected]
```

**Expected:** A justified choice of approximation method with a clear statement of expected accuracy and computational cost, plus documentation of alternatives considered.

**On failure:** If no single method is clearly appropriate, formulate the problem for two methods and compare results. Disagreement between methods reveals the problem's difficulty and guides further refinement.

### Step 5: Validate Formulation Against Known Limits

Before solving, verify the formulation reproduces known physics:

1. **Classical limit**: Take hbar -> 0 (or large quantum numbers) and verify that the Hamiltonian reduces to the correct classical mechanics.
2. **Non-interacting limit**: Set coupling constants to zero and verify the solution is a product of single-particle states.
3. **Symmetry limits**: Verify that the formulation respects all identified symmetries. Check that the Hamiltonian transforms correctly under the symmetry group.
4. **Dimensional analysis**: Verify that every term in the Hamiltonian has units of energy. Check that the characteristic length, energy, and time scales are physically reasonable.
5. **Known exact results**: If the system has known exact solutions in special cases (e.g., hydrogen atom for Z=1, harmonic oscillator for quadratic potential), verify the formulation reproduces them.

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

**Expected:** All validation checks pass. The formulation is self-consistent and ready for solution.

**On failure:** A failing validation check indicates an error in the Hamiltonian construction or boundary conditions. Trace the failure back to the specific term or condition and correct it before proceeding to solve.

## Validation

- [ ] All particles and quantum numbers are explicitly listed
- [ ] The Hilbert space is defined with a clear basis
- [ ] The Hamiltonian is Hermitian and all terms have correct units
- [ ] Constants of motion are identified and used for simplification
- [ ] Boundary conditions are physically motivated and mathematically sufficient
- [ ] Particle statistics (bosonic/fermionic) are correctly enforced
- [ ] Approximation method choice is justified with expected accuracy stated
- [ ] Classical, non-interacting, and symmetry limits are checked
- [ ] Known exact results are reproduced in special cases
- [ ] The formulation is complete enough for another researcher to implement

## Common Pitfalls

- **Omitting degrees of freedom prematurely**: Freezing a degree of freedom without checking the energy scale hierarchy can miss qualitatively important physics. Always justify every reduction with an energy scale argument.
- **Non-Hermitian Hamiltonian**: Forgetting conjugate terms in spin-orbit coupling or complex potentials. Always verify H = H-dagger explicitly.
- **Wrong boundary conditions for scattering**: Using bound-state boundary conditions (normalizability) for a scattering problem discards the continuous spectrum entirely. Match boundary conditions to the physical question.
- **Ignoring degeneracy in perturbation theory**: Applying non-degenerate perturbation theory to a degenerate level produces divergent corrections. Always check for degeneracy before expanding.
- **Over-reliance on a single approximation**: Different methods have complementary failure modes. Variational methods give upper bounds but can miss excited states. Perturbation theory diverges at strong coupling. Cross-validate when possible.
- **Dimensional inconsistency**: Mixing natural units (hbar = 1) with SI units in the same expression. Adopt a consistent unit system at the start and state it explicitly.

## Related Skills

- `derive-theoretical-result` -- derive analytic results from the formulated problem
- `survey-theoretical-literature` -- find prior work on similar quantum systems
