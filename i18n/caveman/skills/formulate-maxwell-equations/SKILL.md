---
name: formulate-maxwell-equations
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
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

Crack EM stuff. State right Maxwell equations (integral or differential). Apply boundary + symmetry to shrink system. Solve PDEs for fields. Compute Poynting vector, radiation pressure, wave impedance. Verify against static + wave limits.

## When Use

- Boundary value problem for E + B fields, sources + material interfaces
- Derive EM wave equation from first principles
- Compute energy flow (Poynting vector) + momentum density of EM fields
- Apply boundary conditions at media interfaces (dielectric, conductor, magnetic)
- Analyze displacement current + role in Ampere-Maxwell
- Connect static limits (Coulomb, Biot-Savart) to unified time-dependent framework

## Inputs

- **Required**: Physical setup (geometry, source charges + currents, material props)
- **Required**: Quantity to solve (E, B, wave solution, energy flux, boundary field)
- **Optional**: Symmetry (planar, cylindrical, spherical, none)
- **Optional**: Time dependence (static, harmonic omega, general)
- **Optional**: Boundary conditions at interfaces or conductor surfaces

## Steps

### Step 1: State Four Maxwell Equations + Pick Relevant Subset

Write full set, choose which constrain problem:

1. **Gauss for E**: div(E) = rho / epsilon_0 (diff) or closed_surface_integral(E . dA) = Q_enc / epsilon_0 (int). E divergence to charge density. Use for E from charge with symmetry.

2. **Gauss for B**: div(B) = 0 (diff) or closed_surface_integral(B . dA) = 0 (int). No magnetic monopoles. Every B line closed loop. Consistency check on B.

3. **Faraday**: curl(E) = -dB/dt (diff) or contour_integral(E . dl) = -d(Phi_B)/dt (int). Changing B makes curling E. Induction + wave derivation.

4. **Ampere-Maxwell**: curl(B) = mu_0 J + mu_0 epsilon_0 dE/dt (diff) or contour_integral(B . dl) = mu_0 I_enc + mu_0 epsilon_0 d(Phi_E)/dt (int). Current + changing E make curling B. Displacement current term mu_0 epsilon_0 dE/dt essential for wave + current continuity.

5. **Form pick**: Differential for local fields, wave equations, PDEs. Integral for high-symmetry where field extracts direct.

6. **Active equations**: Not all four independent every problem. Electrostatics (dB/dt = 0, J = 0) → only Gauss for E + curl(E) = 0 matter. Magnetostatics → Gauss for B + Ampere (no displacement current) enough.

```markdown
## Maxwell Equations for This Problem
- **Form**: [differential / integral / both]
- **Active equations**: [list which of the four are non-trivial constraints]
- **Source terms**: rho = [charge density], J = [current density]
- **Time dependence**: [static / harmonic / general]
- **Displacement current**: [negligible / essential -- with justification]
```

**Got:** Four equations stated. Relevant subset identified with justification. Displacement current included or explicitly argued negligible.

**If fail:** Unclear if displacement current matters? Estimate |epsilon_0 dE/dt| / |J|. Ratio near 1 or bigger → keep displacement current. Vacuum no free charges → always essential for wave.

### Step 2: Apply Boundary Conditions + Symmetry

Shrink system with material interfaces + geometric symmetry:

1. **Boundary at material interfaces**: Medium 1 + 2, surface charge sigma_f + surface current K_f:
   - Normal E: epsilon_1 E_1n - epsilon_2 E_2n = sigma_f
   - Tangential E: E_1t = E_2t (continuous)
   - Normal B: B_1n = B_2n (continuous)
   - Tangential H: n_hat x (H_1 - H_2) = K_f (n_hat from 2 to 1)

2. **Conductor boundary**: Perfect conductor surface:
   - E_tangential = 0 (inside E = 0)
   - B_normal = 0 (inside B = 0 for time-varying)
   - Surface charge: sigma = epsilon_0 E_normal
   - Surface current: K = (1/mu_0) n_hat x B

3. **Symmetry shrink**: Use symmetries to cut independent variables:
   - Planar: fields depend one coord (z), PDEs → ODEs
   - Cylindrical: depend (rho, z) or rho only
   - Spherical: depend r only
   - Translational invariance: Fourier transform invariant direction

4. **Gauge choice** (using potentials): Pick gauge for scalar phi + vector A:
   - Coulomb: div(A) = 0 (splits electrostatic + radiation)
   - Lorenz: div(A) + mu_0 epsilon_0 d(phi)/dt = 0 (Lorentz-covariant, decouples wave)

```markdown
## Boundary Conditions and Symmetry
- **Interfaces**: [list with media properties on each side]
- **Boundary conditions applied**: [normal E, tangential E, normal B, tangential H]
- **Symmetry**: [planar / cylindrical / spherical / none]
- **Reduced coordinates**: [independent variables after symmetry reduction]
- **Gauge** (if using potentials): [Coulomb / Lorenz / other]
```

**Got:** Boundary conditions stated every interface. Symmetry cuts dimension. Problem ready for PDE solution.

**If fail:** Over-determined (more equations than unknowns)? Check field components match conditions. Under-determined? Missed condition — often tangential H or radiation at infinity.

### Step 3: Solve PDEs

Solve Maxwell equations or derived forms for field quantities:

1. **Wave equation derive**: Source-free, linear, homogeneous medium:
   - Curl of Faraday: curl(curl(E)) = -d/dt(curl(B))
   - Sub Ampere-Maxwell: curl(curl(E)) = -mu epsilon d^2E/dt^2
   - Vector identity: curl(curl(E)) = grad(div(E)) - nabla^2(E)
   - With div(E) = 0: nabla^2(E) = mu epsilon d^2E/dt^2
   - Wave speed: v = 1/sqrt(mu epsilon); vacuum c = 1/sqrt(mu_0 epsilon_0)
   - Same for B

2. **Plane wave solutions**: Wave in z-direction:
   - E(z, t) = E_0 exp[i(kz - omega t)], k = omega/v = omega * sqrt(mu epsilon)
   - B = (1/v) k_hat x E (perpendicular E + propagation)
   - |B| = |E|/v
   - Polarization: linear, circular, elliptical by E_0 components

3. **Laplace + Poisson** (static):
   - No time: nabla^2(phi) = -rho/epsilon_0 (Poisson) or nabla^2(phi) = 0 (Laplace)
   - Separation of variables in right coordinates
   - Match boundary to pin expansion coefficients

4. **Guided waves + cavities**: Waveguides + resonant cavities:
   - Split into TE (transverse electric) + TM (transverse magnetic) modes
   - Apply conducting-wall boundary
   - Eigenvalue problem → allowed propagation constants + resonant frequencies
   - Cutoff: omega_c = v * pi * sqrt((m/a)^2 + (n/b)^2) for rectangular guide a x b

5. **Skin depth in conductors**: Time-varying fields into conductor conductivity sigma_c:
   - delta = sqrt(2 / (omega mu sigma_c))
   - Fields decay exp(-z/delta)
   - 60 Hz copper: delta ~ 8.5 mm; 1 GHz: delta ~ 2 micrometers

```markdown
## Field Solution
- **Equation solved**: [wave equation / Laplace / Poisson / eigenvalue]
- **Solution method**: [separation of variables / Fourier transform / Green's function / numerical]
- **Result**: E(r, t) = [expression], B(r, t) = [expression]
- **Dispersion relation**: omega(k) = [if wave solution]
- **Characteristic scales**: [wavelength, skin depth, decay length]
```

**Got:** Explicit field expressions satisfying Maxwell + all boundary. Dispersion relation or eigenvalue spectrum if applicable.

**If fail:** PDE won't separate in chosen coordinates? Try different system or numerical (finite difference, finite element). Solution fails a Maxwell equation on back-sub? Algebraic error — re-check curl + divergence.

### Step 4: Compute Derived Quantities

Pull physical quantities from field solution:

1. **Poynting vector**: S = (1/mu_0) E x B (instantaneous energy flux, W/m^2):
   - Plane waves: S = (1/mu_0) |E|^2 / v in propagation direction
   - Time-averaged: <S> = (1/2) Re(E x H*) for harmonic
   - Intensity: I = |<S>| (power per area)

2. **EM energy density**:
   - u = (1/2)(epsilon_0 |E|^2 + |B|^2/mu_0) in vacuum
   - u = (1/2)(E . D + B . H) in linear media
   - Energy conservation: du/dt + div(S) = -J . E (Poynting's theorem)

3. **Radiation pressure**: Plane wave on surface:
   - Perfect absorber: P_rad = I/c = <S>/c
   - Perfect reflector: P_rad = 2I/c = 2<S>/c
   - Momentum flux density of EM field

4. **Wave impedance**:
   - Medium: eta = sqrt(mu/epsilon) = mu * v
   - Vacuum: eta_0 = sqrt(mu_0/epsilon_0) ~ 377 Ohms
   - E + H amplitudes: |E| = eta |H|
   - Reflection at normal: r = (eta_2 - eta_1)/(eta_2 + eta_1)

5. **Power dissipation + quality factor**:
   - Ohmic loss per volume: p_loss = sigma |E|^2 / 2 (conductor)
   - Cavity Q-factor: Q = omega * (stored energy) / (power dissipated per cycle)
   - Bandwidth of resonances: Delta_omega = omega / Q

```markdown
## Derived Quantities
- **Poynting vector**: S = [expression], <S> = [time-averaged]
- **Energy density**: u = [expression]
- **Radiation pressure**: P_rad = [value]
- **Wave impedance**: eta = [value]
- **Reflection/transmission**: r = [value], t = [value]
- **Q-factor** (if resonant): Q = [value]
```

**Got:** All derived quantities with right units. Energy conservation verified via Poynting's theorem. Magnitudes physically reasonable.

**If fail:** Poynting's theorem won't balance (du/dt + div(S) != -J . E)? Inconsistency E + B solutions. Re-verify both fields satisfy all four Maxwell. Common error: E + B from different approximations not mutually consistent.

### Step 5: Verify Against Known Limits

Check solution reduces correctly in limits:

1. **Static limit (omega -> 0)**: Solution → electrostatic or magnetostatic:
   - E satisfies Coulomb or Laplace/Poisson
   - B satisfies Biot-Savart or Ampere (no displacement current)
   - Displacement current vanishes: mu_0 epsilon_0 dE/dt -> 0

2. **Plane wave limit**: Source-free unbounded medium → plane waves, v = 1/sqrt(mu epsilon), correct polarization.

3. **Perfect conductor limit (sigma -> infinity)**:
   - Skin depth delta -> 0 (no penetration)
   - Tangential E -> 0 at surface
   - Reflection r -> -1 (perfect reflection phase inversion)

4. **Vacuum limit (epsilon_r = 1, mu_r = 1)**: Material-dependent → vacuum values. Wave speed = c. Impedance = eta_0 ~ 377 Ohms.

5. **Energy conservation check**: Integrate Poynting's theorem over closed volume. Rate of change of total field energy + power flowing out = negative of power from currents inside. Any imbalance = error.

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

**Got:** All limits produce correct known results. Energy conservation satisfied to numerical precision.

**If fail:** Failed limit = definite error. Static limit fail → source terms or boundary. Plane wave limit fail → wave equation derivation. Energy conservation fail → inconsistency E + B. Trace failure to step, fix before accepting.

## Checks

- [ ] All four Maxwell equations stated + relevant subset identified
- [ ] Displacement current included or explicitly justified negligible
- [ ] Boundary conditions applied at every material interface
- [ ] Symmetry shrinks PDE dimension
- [ ] Wave equation (or Laplace/Poisson) correctly derived
- [ ] Field solutions satisfy all four Maxwell on back-sub
- [ ] Poynting vector + energy density with right units (W/m^2 + J/m^3)
- [ ] Poynting's theorem (energy conservation) verified
- [ ] Wave impedance + reflection/transmission coefficients reasonable
- [ ] Static limit reproduces Coulomb + Biot-Savart
- [ ] Plane wave limit gives v = 1/sqrt(mu epsilon) + orthogonal E, B, k
- [ ] Solution complete enough for reproduction

## Pitfalls

- **Dropping displacement current**: Original Ampere (curl B = mu_0 J), divergence gives div(J) = 0, contradicts charge conservation when rho changes in time. Term mu_0 epsilon_0 dE/dt fixes, essential for wave propagation. Never drop without verifying dE/dt negligible vs J/epsilon_0.
- **Inconsistent E + B solutions**: Solving E + B independent (E from Gauss, B from Ampere) without verifying Faraday + Gauss for B → fields not mutually consistent. Always verify all four.
- **Wrong boundary normal direction**: Convention n_hat x (H_1 - H_2) = K_f needs n_hat from medium 2 into 1. Reversed → flips surface current sign.
- **Confusing D, E, B, H in materials**: Vacuum: D = epsilon_0 E + B = mu_0 H. Linear media: D = epsilon E + B = mu H. Maxwell in matter use D + H for free source, E + B for force law. Mixing → factor of epsilon_r or mu_r errors.
- **Phase velocity vs group velocity**: Wave speed v = omega/k = phase velocity. Energy + info propagate at group velocity v_g = d(omega)/dk. Dispersive media differ, phase for energy transport → wrong.
- **Forgetting radiation condition**: Scattering + radiation in unbounded domain → solution must satisfy Sommerfeld radiation condition (outgoing waves at infinity). Without it → not unique, may include unphysical incoming waves.

## See Also

- `analyze-magnetic-field` -- compute static B-fields = magnetostatic limit of Maxwell
- `solve-electromagnetic-induction` -- apply Faraday to induction geometries + RL circuits
- `formulate-quantum-problem` -- quantize EM field for quantum optics + QED
- `derive-theoretical-result` -- rigorous derivation of wave equations, Green's functions, dispersion
- `analyze-diffusion-dynamics` -- diffusion equations from Maxwell in conducting media (skin effect)
