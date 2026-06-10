---
name: formulate-maxwell-equations
description: >
  Work with the full set of Maxwell's equations in integral and differential
  form to analyze electromagnetic fields, waves, and energy transport. Use
  when applying Gauss's law, Faraday's law, or the Ampere-Maxwell law to
  boundary value problems, deriving the electromagnetic wave equation,
  computing Poynting vector and radiation pressure, solving for fields at
  material interfaces, or connecting electrostatics and magnetostatics to
  the unified electromagnetic framework.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: electromagnetism
  complexity: advanced
  language: natural
  tags: electromagnetism, maxwell-equations, electromagnetic-waves, poynting-vector, boundary-conditions
---

# Formulate Maxwell Equations

Analyze electromagnetic phenomena by stating the relevant Maxwell equations in appropriate form (integral or differential), applying boundary conditions and symmetry to reduce the system, solving the resulting partial differential equations for the fields, computing derived quantities such as the Poynting vector, radiation pressure, and wave impedance, and verifying the solution against known static and wave limits.

## When to Use

- Solving a boundary value problem for E and B fields in a region with sources and material interfaces
- Deriving the electromagnetic wave equation from first principles
- Computing energy flow (Poynting vector) and momentum density of electromagnetic fields
- Applying boundary conditions at interfaces between different media (dielectrics, conductors, magnetic materials)
- Analyzing displacement current and its role in completing the Ampere-Maxwell equation
- Connecting the static limits (Coulomb's law, Biot-Savart) to the unified time-dependent framework

## Inputs

- **Required**: Physical configuration (geometry, source charges and currents, material properties)
- **Required**: Quantity to solve for (E-field, B-field, wave solution, energy flux, or boundary field values)
- **Optional**: Symmetry information (planar, cylindrical, spherical, or no special symmetry)
- **Optional**: Time dependence specification (static, harmonic at frequency omega, or general time-dependent)
- **Optional**: Boundary conditions at material interfaces or conductor surfaces

## Procedure

### Step 1: State the Four Maxwell Equations and Identify Relevant Subset

Write the complete set and select which equations constrain the problem:

1. **Gauss's law for E**: div(E) = rho / epsilon_0 (differential) or closed_surface_integral(E . dA) = Q_enc / epsilon_0 (integral). Relates E-field divergence to charge density. Use for finding E from charge distributions with symmetry.

2. **Gauss's law for B**: div(B) = 0 (differential) or closed_surface_integral(B . dA) = 0 (integral). No magnetic monopoles. Every magnetic field line is a closed loop. Use as a consistency check on computed B-fields.

3. **Faraday's law**: curl(E) = -dB/dt (differential) or contour_integral(E . dl) = -d(Phi_B)/dt (integral). A changing B-field generates a curling E-field. Use for induction problems and wave derivation.

4. **Ampere-Maxwell law**: curl(B) = mu_0 J + mu_0 epsilon_0 dE/dt (differential) or contour_integral(B . dl) = mu_0 I_enc + mu_0 epsilon_0 d(Phi_E)/dt (integral). Current and changing E-field generate curling B-field. The displacement current term mu_0 epsilon_0 dE/dt is essential for wave propagation and current continuity.

5. **Form selection**: Choose differential form for local field calculations, wave equations, and PDEs. Choose integral form for high-symmetry problems where the field can be extracted from the integral directly.

6. **Identify active equations**: Not all four equations are independent constraints in every problem. For electrostatics (dB/dt = 0, J = 0), only Gauss's law for E and curl(E) = 0 matter. For magnetostatics, Gauss's law for B and Ampere's law (without displacement current) suffice.

```markdown
## Maxwell Equations for This Problem
- **Form**: [differential / integral / both]
- **Active equations**: [list which of the four are non-trivial constraints]
- **Source terms**: rho = [charge density], J = [current density]
- **Time dependence**: [static / harmonic / general]
- **Displacement current**: [negligible / essential -- with justification]
```

**Expected:** The four equations are stated, the relevant subset is identified with justification, and the displacement current is either included or explicitly argued to be negligible.

**On failure:** If it is unclear whether the displacement current matters, estimate the ratio |epsilon_0 dE/dt| / |J|. If this ratio is comparable to or greater than 1, the displacement current must be retained. In vacuum with no free charges, the displacement current is always essential for wave propagation.

### Step 2: Apply Boundary Conditions and Symmetry

Reduce the system using material interfaces and geometric symmetry:

1. **Boundary conditions at material interfaces**: At the interface between media 1 and 2 with surface charge sigma_f and surface current K_f:
   - Normal E: epsilon_1 E_1n - epsilon_2 E_2n = sigma_f
   - Tangential E: E_1t = E_2t (continuous)
   - Normal B: B_1n = B_2n (continuous)
   - Tangential H: n_hat x (H_1 - H_2) = K_f (where n_hat points from 2 to 1)

2. **Conductor boundary conditions**: At the surface of a perfect conductor:
   - E_tangential = 0 (inside the conductor E = 0)
   - B_normal = 0 (inside the conductor B = 0 for time-varying fields)
   - Surface charge: sigma = epsilon_0 E_normal
   - Surface current: K = (1/mu_0) n_hat x B

3. **Symmetry reduction**: Use identified symmetries to reduce the number of independent variables:
   - Planar symmetry: fields depend on one coordinate only (e.g., z), reducing PDEs to ODEs
   - Cylindrical symmetry: fields depend on (rho, z) or rho only
   - Spherical symmetry: fields depend on r only
   - Translational invariance: Fourier transform in the invariant direction

4. **Gauge choice** (if using potentials): Select a gauge for the scalar potential phi and vector potential A:
   - Coulomb gauge: div(A) = 0 (separates electrostatic and radiation contributions)
   - Lorenz gauge: div(A) + mu_0 epsilon_0 d(phi)/dt = 0 (manifestly Lorentz-covariant, decouples wave equations)

```markdown
## Boundary Conditions and Symmetry
- **Interfaces**: [list with media properties on each side]
- **Boundary conditions applied**: [normal E, tangential E, normal B, tangential H]
- **Symmetry**: [planar / cylindrical / spherical / none]
- **Reduced coordinates**: [independent variables after symmetry reduction]
- **Gauge** (if using potentials): [Coulomb / Lorenz / other]
```

**Expected:** All boundary conditions are stated at every interface, symmetry is exploited to reduce the dimensionality, and the problem is ready for PDE solution.

**On failure:** If boundary conditions are over-determined (more equations than unknowns at an interface), check that the number of field components matches the number of conditions. If under-determined, a boundary condition has been missed -- often the tangential H condition or the radiation condition at infinity.

### Step 3: Solve Resulting PDEs

Solve the Maxwell equations or their derived forms for the field quantities:

1. **Wave equation derivation**: In a source-free, linear, homogeneous medium:
   - Take the curl of Faraday's law: curl(curl(E)) = -d/dt(curl(B))
   - Substitute Ampere-Maxwell: curl(curl(E)) = -mu epsilon d^2E/dt^2
   - Use the vector identity: curl(curl(E)) = grad(div(E)) - nabla^2(E)
   - With div(E) = 0 (no free charges): nabla^2(E) = mu epsilon d^2E/dt^2
   - Wave speed: v = 1/sqrt(mu epsilon); in vacuum c = 1/sqrt(mu_0 epsilon_0)
   - Identical equation holds for B

2. **Plane wave solutions**: For a wave propagating in the z-direction:
   - E(z, t) = E_0 exp[i(kz - omega t)] with k = omega/v = omega * sqrt(mu epsilon)
   - B = (1/v) k_hat x E (perpendicular to E and propagation direction)
   - |B| = |E|/v
   - Polarization: linear, circular, or elliptical depending on E_0 components

3. **Laplace and Poisson equations** (static case):
   - With no time dependence: nabla^2(phi) = -rho/epsilon_0 (Poisson) or nabla^2(phi) = 0 (Laplace)
   - Solve by separation of variables in the appropriate coordinate system
   - Match boundary conditions to determine expansion coefficients

4. **Guided waves and cavities**: For waveguides and resonant cavities:
   - Decompose into TE (transverse electric) and TM (transverse magnetic) modes
   - Apply conducting-wall boundary conditions
   - Solve the eigenvalue problem for allowed propagation constants or resonant frequencies
   - Cutoff frequency: omega_c = v * pi * sqrt((m/a)^2 + (n/b)^2) for a rectangular guide with dimensions a x b

5. **Skin depth in conductors**: For time-varying fields penetrating a conductor with conductivity sigma_c:
   - delta = sqrt(2 / (omega mu sigma_c))
   - Fields decay as exp(-z/delta) into the conductor
   - At 60 Hz in copper: delta approximately 8.5 mm; at 1 GHz: delta approximately 2 micrometers

```markdown
## Field Solution
- **Equation solved**: [wave equation / Laplace / Poisson / eigenvalue]
- **Solution method**: [separation of variables / Fourier transform / Green's function / numerical]
- **Result**: E(r, t) = [expression], B(r, t) = [expression]
- **Dispersion relation**: omega(k) = [if wave solution]
- **Characteristic scales**: [wavelength, skin depth, decay length]
```

**Expected:** Explicit field expressions satisfying Maxwell's equations and all boundary conditions, with the dispersion relation or eigenvalue spectrum if applicable.

**On failure:** If the PDE cannot be separated in the chosen coordinate system, try a different system or resort to numerical methods (finite difference, finite element). If the solution does not satisfy one of the Maxwell equations on back-substitution, there is an algebraic error in the derivation -- re-check the curl and divergence operations.

### Step 4: Compute Derived Quantities

Extract physically meaningful quantities from the field solution:

1. **Poynting vector**: S = (1/mu_0) E x B (instantaneous energy flux, W/m^2):
   - For plane waves: S = (1/mu_0) |E|^2 / v in the propagation direction
   - Time-averaged Poynting vector: <S> = (1/2) Re(E x H*) for harmonic fields
   - Intensity: I = |<S>| (power per unit area)

2. **Electromagnetic energy density**:
   - u = (1/2)(epsilon_0 |E|^2 + |B|^2/mu_0) in vacuum
   - u = (1/2)(E . D + B . H) in linear media
   - Energy conservation: du/dt + div(S) = -J . E (Poynting's theorem)

3. **Radiation pressure**: For a plane wave incident on a surface:
   - Perfect absorber: P_rad = I/c = <S>/c
   - Perfect reflector: P_rad = 2I/c = 2<S>/c
   - This is the momentum flux density of the electromagnetic field

4. **Wave impedance**:
   - In a medium: eta = sqrt(mu/epsilon) = mu * v
   - In vacuum: eta_0 = sqrt(mu_0/epsilon_0) approximately 377 Ohms
   - Relates E and H amplitudes: |E| = eta |H|
   - Reflection coefficient at normal incidence: r = (eta_2 - eta_1)/(eta_2 + eta_1)

5. **Power dissipation and quality factor**:
   - Ohmic loss per unit volume: p_loss = sigma |E|^2 / 2 (in a conductor)
   - Quality factor of a cavity: Q = omega * (stored energy) / (power dissipated per cycle)
   - Relates to the bandwidth of resonances: Delta_omega = omega / Q

```markdown
## Derived Quantities
- **Poynting vector**: S = [expression], <S> = [time-averaged]
- **Energy density**: u = [expression]
- **Radiation pressure**: P_rad = [value]
- **Wave impedance**: eta = [value]
- **Reflection/transmission**: r = [value], t = [value]
- **Q-factor** (if resonant): Q = [value]
```

**Expected:** All derived quantities computed with correct units, energy conservation verified via Poynting's theorem, and physically reasonable magnitudes.

**On failure:** If Poynting's theorem does not balance (du/dt + div(S) does not equal -J . E), there is an inconsistency between the E and B solutions. Re-verify that both fields satisfy all four Maxwell equations simultaneously. A common error is computing E and B from different approximations that are not mutually consistent.

### Step 5: Verify Against Known Limits

Check that the full solution reduces correctly in limiting cases:

1. **Static limit (omega -> 0)**: The solution should reduce to the electrostatic or magnetostatic result:
   - E-field should satisfy Coulomb's law or the Laplace/Poisson equation
   - B-field should satisfy the Biot-Savart law or Ampere's law (without displacement current)
   - Displacement current vanishes: mu_0 epsilon_0 dE/dt -> 0

2. **Plane wave limit**: In a source-free, unbounded medium, the solution should reduce to plane waves with v = 1/sqrt(mu epsilon) and the correct polarization.

3. **Perfect conductor limit (sigma -> infinity)**:
   - Skin depth delta -> 0 (fields do not penetrate)
   - Tangential E -> 0 at the surface
   - Reflection coefficient r -> -1 (perfect reflection with phase inversion)

4. **Vacuum limit (epsilon_r = 1, mu_r = 1)**: Material-dependent quantities should reduce to their vacuum values. Wave speed should equal c. Impedance should equal eta_0 approximately 377 Ohms.

5. **Energy conservation check**: Integrate Poynting's theorem over a closed volume. The rate of change of total field energy plus the power flowing out through the surface must equal the negative of the power delivered by currents inside the volume. Any imbalance indicates an error.

```markdown
## Limiting Case Verification
| Limit | Condition | Expected | Obtained | Match |
|-------|-----------|----------|----------|-------|
| Static | omega -> 0 | Coulomb / Biot-Savart | [result] | [Yes/No] |
| Plane wave | unbounded medium | v = c/n, eta = eta_0/n | [result] | [Yes/No] |
| Perfect conductor | sigma -> inf | delta -> 0, r -> -1 | [result] | [Yes/No] |
| Vacuum | epsilon_r = mu_r = 1 | c, eta_0 | [result] | [Yes/No] |
| Energy conservation | Poynting's theorem | balanced | [check] | [Yes/No] |
```

**Expected:** All limits produce the correct known results. Energy conservation is satisfied to within numerical precision.

**On failure:** A failed limit is a definitive indicator of an error. The static limit failing suggests a problem in the source terms or boundary conditions. The plane wave limit failing suggests an error in the wave equation derivation. Energy conservation failing suggests inconsistency between E and B solutions. Trace the failure back to the specific step and correct before accepting the solution.

## Validation

- [ ] All four Maxwell equations are stated and the relevant subset is identified
- [ ] Displacement current is included or explicitly justified as negligible
- [ ] Boundary conditions are applied at every material interface
- [ ] Symmetry is exploited to reduce the PDE dimensionality
- [ ] The wave equation (or Laplace/Poisson equation) is correctly derived
- [ ] Field solutions satisfy all four Maxwell equations on back-substitution
- [ ] Poynting vector and energy density are computed with correct units (W/m^2 and J/m^3)
- [ ] Poynting's theorem (energy conservation) is verified
- [ ] Wave impedance and reflection/transmission coefficients are physically reasonable
- [ ] Static limit reproduces Coulomb's law and Biot-Savart law
- [ ] Plane wave limit yields v = 1/sqrt(mu epsilon) and orthogonal E, B, k
- [ ] The solution is complete enough for another researcher to reproduce

## Common Pitfalls

- **Omitting the displacement current**: In the original Ampere's law (curl B = mu_0 J), taking the divergence gives div(J) = 0, which contradicts charge conservation when rho changes in time. The displacement current term mu_0 epsilon_0 dE/dt fixes this and is essential for wave propagation. Never drop it without verifying that dE/dt is negligible compared to J/epsilon_0.
- **Inconsistent E and B solutions**: Solving for E and B independently (e.g., E from Gauss's law and B from Ampere's law) without verifying Faraday's law and Gauss's law for B can produce fields that are not mutually consistent. Always verify all four equations.
- **Wrong boundary condition normal direction**: The convention n_hat x (H_1 - H_2) = K_f requires n_hat to point from medium 2 into medium 1. Reversing the direction flips the sign of the surface current condition.
- **Confusing D, E, B, and H in materials**: In vacuum, D = epsilon_0 E and B = mu_0 H. In linear media, D = epsilon E and B = mu H. Maxwell's equations in matter use D and H for the free source terms and E and B for the force law. Mixing constitutive relations leads to factors of epsilon_r or mu_r errors.
- **Phase velocity versus group velocity**: The wave speed v = omega/k is the phase velocity. Energy and information propagate at the group velocity v_g = d(omega)/dk. In dispersive media these differ, and using phase velocity for energy transport gives wrong results.
- **Forgetting the radiation condition**: For scattering and radiation problems in unbounded domains, the solution must satisfy the Sommerfeld radiation condition (outgoing waves at infinity). Without this condition, the solution is not unique and may include unphysical incoming waves.

## Related Skills

- `analyze-magnetic-field` -- compute static B-fields that serve as the magnetostatic limit of Maxwell's equations
- `solve-electromagnetic-induction` -- apply Faraday's law to specific induction geometries and RL circuits
- `formulate-quantum-problem` -- quantize the electromagnetic field for quantum optics and QED
- `derive-theoretical-result` -- carry out rigorous derivations of wave equations, Green's functions, and dispersion relations
- `analyze-diffusion-dynamics` -- diffusion equations arise from Maxwell's equations in conducting media (skin effect)
