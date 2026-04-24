---
name: formulate-quantum-problem
locale: caveman-ultra
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

Physical system → well-posed QM problem: ID DOFs → build H + Hilbert space → BCs → pick approx method → validate vs known limits.

## Use When

- Set up QM problem for analytic/numerical solution
- QChem calc (MOs, electronic structure)
- Physical scenario → Dirac/Schrödinger
- Choose perturbation / variational / DFT / exact diag
- Theoretical model for spectroscopic/scattering comparison

## In

- **Required**: system desc (atom, molecule, solid, field)
- **Required**: target observable (spectrum, rates, ground state)
- **Optional**: experimental constraints
- **Optional**: accuracy / compute budget
- **Optional**: formalism (wave mech, matrix mech, 2nd quant, path int)

## Do

### Step 1: ID system + DOFs

1. **Particles**: list (electrons, nuclei, photons, phonons) + quantum nums (spin, charge, mass)
2. **Symmetries**: spatial (sph/cyl/trans/crystal), internal (spin/gauge), discrete (P, T)
3. **Energy scales**: which DOFs active vs frozen/adiabatic
4. **Reduction**: Born-Oppenheimer if nuclear/electronic timescales separate; collective coords for many-body

```markdown
## System Characterization
- **Particles**: [list with quantum numbers]
- **Active degrees of freedom**: [coordinates, spins, fields]
- **Frozen degrees of freedom**: [and justification for freezing]
- **Symmetry group**: [continuous and discrete]
- **Energy scale hierarchy**: [e.g., electronic >> vibrational >> rotational]
```

→ Complete inventory: particles, QNs, symmetries, active vs frozen justified.

**If err:** hierarchy unclear → keep all DOFs, flag for scale analysis. Premature truncation → wrong physics.

### Step 2: Build H + Hilbert space

1. **Hilbert space**: finite-dim → basis (|↑>, |↓>). Infinite → function space (L²(R³) for 3D single particle).
2. **Kinetic**: each particle. Position rep: T = -ℏ²/(2m) nabla².
3. **Potential**: all interactions (Coulomb, harmonic, spin-orbit, external). Explicit form + coupling.
4. **Composite H**: H = T + V, group by type. Multi-particle: exchange/correlation or note via approx.
5. **Operator algebra**: H Hermitian? Constants of motion ([H,O]=0) → block-diagonalize.

```markdown
## Hamiltonian Structure
- **Hilbert space**: [definition and basis]
- **H = T + V decomposition**:
  - T = [kinetic terms]
  - V = [potential terms, grouped by type]
- **Constants of motion**: [operators commuting with H]
- **Symmetry-adapted basis**: [if block diagonalization is possible]
```

→ Complete Hermitian H w/ all terms, Hilbert space defined, constants of motion ID'd.

**If err:** not Hermitian → missing conjugate / gauge phase. Ambiguous Hilbert space (relativistic) → specify formalism.

### Step 3: BCs + initial conditions

1. **BCs**: bound → normalizability (psi→0 at ∞). Scattering → incoming wave. Periodic → Bloch / Born-von Karman.
2. **Domain**: spatial. Box walls. H atom: radial + angular. Lattice + topology.
3. **Initial state** (time-dep): t=0 expansion in eigenbasis or wave packet w/ center + width.
4. **Constraints**: indistinguishable → sym (bosons) / antisym (fermions). Gauge → gauge-fixing.

```markdown
## Boundary and Initial Conditions
- **Spatial domain**: [definition]
- **Boundary type**: [Dirichlet / Neumann / periodic / scattering]
- **Normalization**: [condition]
- **Particle statistics**: [bosonic / fermionic / distinguishable]
- **Initial state** (if time-dependent): [specification]
```

→ BCs physically motivated, consistent w/ H domain, unique solution (or scattering matrix).

**If err:** over/under-determined → check self-adjointness on domain. Non-self-adjoint → handle deficiency indices.

### Step 4: Pick approx method

1. **Exact solvable**: matches known model (HO, H atom, Ising)? → exact + perturbation corrections.

2. **Perturbation** (weak coupling):
   - H = H0 + lambda V, H0 solvable
   - lambda V small vs H0 level spacing
   - Degeneracy? → degenerate perturbation
   - Fits: weak interaction, few-body, analytic needed

3. **Variational** (ground state):
   - Trial wf w/ params
   - Satisfies BCs + symmetry
   - Fits: ground state energy primary, many-body

4. **DFT** (many-electron):
   - XC functional (LDA, GGA, hybrid)
   - Basis (plane waves, Gaussian, NAOs)
   - Fits: many-electron, ground state density + energy

5. **Numerical exact** (small/benchmark):
   - Exact diag for small Hilbert
   - QMC for ground state sampling
   - DMRG for 1D/quasi-1D
   - Fits: high accuracy, small system

```markdown
## Approximation Method Selection
- **Method chosen**: [name]
- **Justification**: [why this method fits the problem structure]
- **Expected accuracy**: [order of perturbation, variational bound quality, DFT functional accuracy]
- **Computational cost**: [scaling with system size]
- **Alternatives considered**: [and why they were rejected]
```

→ Justified method + expected accuracy + compute cost + alternatives.

**If err:** no single method fits → formulate for 2 + compare. Disagreement reveals difficulty.

### Step 5: Validate vs limits

1. **Classical** (ℏ→0 or large QNs): H reduces to classical mech.
2. **Non-interacting**: couplings → 0 → product of single-particle states.
3. **Symmetry**: respects all symmetries. H transforms correctly under group.
4. **Dimensional**: every H term = energy. Length/energy/time scales reasonable.
5. **Known exact**: special cases (H atom Z=1, HO quadratic) → reproduced.

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

→ All pass. Self-consistent, ready to solve.

**If err:** fail → err in H construction or BCs. Trace to specific term/condition, fix before solving.

## Check

- [ ] Particles + QNs listed
- [ ] Hilbert space + basis
- [ ] H Hermitian + correct units
- [ ] Constants of motion used
- [ ] BCs physically + mathematically sufficient
- [ ] Statistics (bos/ferm) enforced
- [ ] Method justified + accuracy stated
- [ ] Classical, non-interacting, symmetry limits checked
- [ ] Known exact reproduced
- [ ] Reproducible

## Traps

- **Premature DOF drop**: freeze w/o energy scale arg → wrong physics. Justify every reduction.
- **Non-Hermitian H**: missing conjugate in spin-orbit / complex V. Verify H=H† explicitly.
- **Wrong scattering BCs**: bound-state BCs for scattering → discards continuum. Match to question.
- **Degeneracy in perturbation**: non-deg perturbation on deg level → divergent. Check first.
- **Single-method reliance**: variational → upper bound but misses excited; perturbation diverges at strong coupling. Cross-validate.
- **Unit inconsistency**: mixing natural (ℏ=1) + SI. Pick consistent system, state explicitly.

## →

- `derive-theoretical-result` — analytic from formulated problem
- `survey-theoretical-literature` — prior work on similar QM systems
