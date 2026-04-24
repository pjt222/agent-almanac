---
name: formulate-maxwell-equations
locale: caveman-ultra
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

EM phenomenon → state Maxwell eqs (int/diff) → apply BCs + symmetry → solve PDE → derive Poynting/pressure/impedance → verify limits.

## Use When

- BVP for E, B w/ sources + interfaces
- Derive EM wave eq from first principles
- Compute Poynting vector + momentum density
- BCs at interfaces (dielectrics, conductors, magnetic)
- Displacement current role in Ampere-Maxwell
- Static limits (Coulomb, Biot-Savart) → unified time-dep

## In

- **Required**: config (geometry, sources, material props)
- **Required**: target quantity (E, B, wave, flux, boundary value)
- **Optional**: symmetry (planar/cyl/sph/none)
- **Optional**: time-dep (static/harmonic omega/general)
- **Optional**: BCs at interfaces/conductors

## Do

### Step 1: State 4 eqs + select subset

1. **Gauss E**: div(E)=rho/epsilon_0 (diff) or ∮E·dA=Q_enc/epsilon_0 (int). Use w/ symmetry for E from charges.

2. **Gauss B**: div(B)=0 (diff) or ∮B·dA=0 (int). No monopoles. Consistency check.

3. **Faraday**: curl(E)=-dB/dt (diff) or ∮E·dl=-dPhi_B/dt (int). Changing B → curling E. Induction + waves.

4. **Ampere-Maxwell**: curl(B)=mu_0 J + mu_0 epsilon_0 dE/dt (diff) or ∮B·dl=mu_0 I_enc + mu_0 epsilon_0 dPhi_E/dt (int). Displacement current mu_0 epsilon_0 dE/dt → essential for waves + continuity.

5. **Form**: diff for local/wave/PDE; int for symmetry problems.

6. **Active subset**: electrostatics → Gauss E + curl(E)=0. Magnetostatics → Gauss B + Ampere (no displacement).

```markdown
## Maxwell Equations for This Problem
- **Form**: [differential / integral / both]
- **Active equations**: [list which of the four are non-trivial constraints]
- **Source terms**: rho = [charge density], J = [current density]
- **Time dependence**: [static / harmonic / general]
- **Displacement current**: [negligible / essential -- with justification]
```

→ 4 eqs stated, subset ID'd w/ justify, displacement current included/argued negligible.

**If err:** unclear displacement current → estimate |epsilon_0 dE/dt|/|J|. ≥1 → keep. Vacuum + no free charges → always essential.

### Step 2: BCs + symmetry

1. **BCs at interfaces** (media 1,2, surface charge sigma_f, surface current K_f):
   - Normal E: epsilon_1 E_1n - epsilon_2 E_2n = sigma_f
   - Tangential E: E_1t = E_2t
   - Normal B: B_1n = B_2n
   - Tangential H: n_hat × (H_1-H_2) = K_f (n_hat: 2→1)

2. **Conductor BCs** (perfect):
   - E_tan=0 (inside E=0)
   - B_normal=0 (time-varying)
   - sigma = epsilon_0 E_normal
   - K = (1/mu_0) n_hat × B

3. **Symmetry**:
   - Planar: fields depend on 1 coord → ODE
   - Cylindrical: (rho,z) or rho
   - Spherical: r only
   - Translational invariance → Fourier transform

4. **Gauge** (potentials phi, A):
   - Coulomb: div(A)=0 (separates static + radiation)
   - Lorenz: div(A) + mu_0 epsilon_0 d(phi)/dt=0 (Lorentz-covariant, decouples wave eqs)

```markdown
## Boundary Conditions and Symmetry
- **Interfaces**: [list with media properties on each side]
- **Boundary conditions applied**: [normal E, tangential E, normal B, tangential H]
- **Symmetry**: [planar / cylindrical / spherical / none]
- **Reduced coordinates**: [independent variables after symmetry reduction]
- **Gauge** (if using potentials): [Coulomb / Lorenz / other]
```

→ BCs at every interface, symmetry applied, ready for PDE.

**If err:** over-determined → check components vs conditions. Under-determined → missed BC (often tangential H or radiation at ∞).

### Step 3: Solve PDE

1. **Wave eq derivation** (source-free, linear, homogeneous):
   - curl(curl(E)) = -d/dt(curl(B)) = -mu epsilon d²E/dt²
   - Identity: curl(curl(E)) = grad(div(E)) - nabla²(E)
   - div(E)=0 → nabla²(E) = mu epsilon d²E/dt²
   - v=1/sqrt(mu epsilon); vacuum c=1/sqrt(mu_0 epsilon_0)
   - Same for B

2. **Plane wave** (z-prop):
   - E(z,t)=E_0 exp[i(kz - omega t)], k=omega/v=omega*sqrt(mu epsilon)
   - B=(1/v) k_hat × E
   - |B|=|E|/v
   - Polarization: linear/circular/elliptical

3. **Laplace/Poisson** (static):
   - nabla²(phi)=-rho/epsilon_0 (Poisson) or nabla²(phi)=0 (Laplace)
   - Separation of variables → match BCs

4. **Guided waves/cavities**:
   - TE/TM decomposition
   - Conducting-wall BCs
   - Eigenvalue → propagation const / resonance
   - Cutoff: omega_c = v*pi*sqrt((m/a)²+(n/b)²) rect guide a×b

5. **Skin depth**:
   - delta = sqrt(2/(omega mu sigma_c))
   - Decay exp(-z/delta)
   - 60 Hz Cu: ~8.5 mm; 1 GHz: ~2 micrometers

```markdown
## Field Solution
- **Equation solved**: [wave equation / Laplace / Poisson / eigenvalue]
- **Solution method**: [separation of variables / Fourier transform / Green's function / numerical]
- **Result**: E(r, t) = [expression], B(r, t) = [expression]
- **Dispersion relation**: omega(k) = [if wave solution]
- **Characteristic scales**: [wavelength, skin depth, decay length]
```

→ Explicit E, B satisfying all eqs + BCs, dispersion/eigenvalues if applicable.

**If err:** can't separate → try new coord or numerics (FD/FE). Back-sub fails Maxwell → algebra err in curl/div.

### Step 4: Derived quantities

1. **Poynting**: S = (1/mu_0) E × B (W/m²)
   - Plane wave: S = (1/mu_0) |E|²/v in prop dir
   - Time-avg: <S> = (1/2) Re(E × H*) harmonic
   - Intensity: I = |<S>|

2. **Energy density**:
   - u = (1/2)(epsilon_0 |E|² + |B|²/mu_0) vacuum
   - u = (1/2)(E·D + B·H) linear media
   - Conservation: du/dt + div(S) = -J·E (Poynting's thm)

3. **Radiation pressure**:
   - Absorber: P_rad = I/c = <S>/c
   - Reflector: P_rad = 2I/c = 2<S>/c

4. **Wave impedance**:
   - Medium: eta = sqrt(mu/epsilon) = mu*v
   - Vacuum: eta_0 = sqrt(mu_0/epsilon_0) ≈ 377 Ω
   - |E| = eta |H|
   - Reflection normal: r = (eta_2 - eta_1)/(eta_2 + eta_1)

5. **Power + Q**:
   - Ohmic loss/vol: p_loss = sigma |E|²/2
   - Q = omega * (stored energy)/(power dissipated/cycle)
   - Bandwidth: Delta_omega = omega/Q

```markdown
## Derived Quantities
- **Poynting vector**: S = [expression], <S> = [time-averaged]
- **Energy density**: u = [expression]
- **Radiation pressure**: P_rad = [value]
- **Wave impedance**: eta = [value]
- **Reflection/transmission**: r = [value], t = [value]
- **Q-factor** (if resonant): Q = [value]
```

→ All quantities w/ correct units, energy conservation via Poynting, reasonable magnitudes.

**If err:** Poynting thm not balanced → E/B inconsistent. Re-verify all 4 eqs. Common: E, B from different approx not mutually consistent.

### Step 5: Verify limits

1. **Static (omega→0)**:
   - E → Coulomb / Laplace-Poisson
   - B → Biot-Savart / Ampere (no displacement)
   - Displacement → 0

2. **Plane wave**: v=1/sqrt(mu epsilon), correct polarization.

3. **Perfect conductor (sigma→∞)**:
   - delta → 0
   - E_tan → 0 at surface
   - r → -1 (phase inversion)

4. **Vacuum (epsilon_r=1, mu_r=1)**: v=c, eta=eta_0 ≈ 377 Ω.

5. **Energy conservation**: integrate Poynting thm over closed vol → total field energy rate + outflow = -power from currents. Imbalance = err.

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

→ All limits match. Energy conserved to numerical precision.

**If err:** Static fail → source/BC err. Plane wave fail → wave eq derivation err. Energy conservation fail → E/B inconsistent. Trace + fix before accepting.

## Check

- [ ] 4 eqs stated, subset ID'd
- [ ] Displacement current included or justified negligible
- [ ] BCs applied at every interface
- [ ] Symmetry reduces PDE dim
- [ ] Wave eq / Laplace / Poisson correctly derived
- [ ] Solutions back-sub satisfy all 4 eqs
- [ ] Poynting + energy density correct units (W/m², J/m³)
- [ ] Poynting thm verified
- [ ] Impedance + r, t reasonable
- [ ] Static limit = Coulomb + Biot-Savart
- [ ] Plane wave limit: v=1/sqrt(mu epsilon), E⊥B⊥k
- [ ] Solution reproducible

## Traps

- **Drop displacement**: div(curl B)=0 → div(J)=0 contradicts charge conservation → mu_0 epsilon_0 dE/dt essential. Never drop w/o checking dE/dt vs J/epsilon_0.
- **Inconsistent E, B**: solving independently can violate Faraday + Gauss B. Always verify all 4.
- **Wrong n_hat dir**: n_hat × (H_1-H_2)=K_f requires 2→1. Reverse flips sign.
- **D/E/B/H confusion**: vacuum D=epsilon_0 E, B=mu_0 H. Media D=epsilon E, B=mu H. Maxwell uses D,H for free sources, E,B for force. Mixing → epsilon_r/mu_r errors.
- **Phase vs group v**: v=omega/k phase. Energy/info → v_g=d(omega)/dk. Dispersive media: differ.
- **Forget radiation condition**: scattering in unbounded → Sommerfeld (outgoing at ∞). Missing → non-unique + unphysical incoming.

## →

- `analyze-magnetic-field` — static B (magnetostatic limit)
- `solve-electromagnetic-induction` — Faraday + RL circuits
- `formulate-quantum-problem` — quantize EM (QED)
- `derive-theoretical-result` — rigorous wave/Green's/dispersion
- `analyze-diffusion-dynamics` — diffusion eq from Maxwell (skin effect)
