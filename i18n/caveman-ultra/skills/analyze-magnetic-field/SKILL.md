---
name: analyze-magnetic-field
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Calculate and visualize magnetic fields produced by current distributions
  using the Biot-Savart law, Ampere's law, and magnetic dipole approximations.
  Use when computing B-fields from arbitrary current geometries, exploiting
  symmetry with Ampere's law, analyzing superposition of multiple sources,
  or characterizing magnetic materials through permeability, B-H curves,
  and hysteresis behavior.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: electromagnetism
  complexity: intermediate
  language: natural
  tags: electromagnetism, magnetic-fields, biot-savart, ampere, magnetic-materials
---

# Analyze Magnetic Field

Calc B-field from current distribution: characterize src geometry → select law (Biot-Savart arbitrary, Ampere high-sym) → eval integrals → check limits → incorporate material effects → visualize field-line topology.

## Use When

- B-field from arbitrary current conductor (wire loop, helix, irregular)
- Exploit cylindrical/planar/toroidal sym → Ampere direct
- Estimate far-field via dipole approx
- Superpose multiple current srcs
- Analyze materials: linear permeability, B-H curves, hysteresis, saturation

## In

- **Required**: Current distribution spec (geometry, current magnitude + direction)
- **Required**: Region of interest (obs pts or vol)
- **Optional**: Material props (mu_r, B-H curve data, coercivity, remanence)
- **Optional**: Accuracy (exact integral, multipole order, numerical res)
- **Optional**: Viz reqs (2D cross-section, 3D field lines, magnitude contour)

## Do

### Step 1: Characterize Current + Geometry

Fully spec src pre-method:

1. **Current path**: Geometry each current element. Line currents → parametric curve r'(t). Surface currents → K (A/m). Volume currents → J (A/m^2).
2. **Coord system**: Align w/ dominant sym. Cylindrical (rho, phi, z) wires/solenoids. Spherical (r, theta, phi) dipoles/loops far dist. Cartesian planar sheets.
3. **Sym analysis**: ID translational, rotational, reflection. Src sym = field sym. Doc nonzero B-components + vanish.
4. **Current continuity**: Verify div(J) = 0 (steady) or div(J) = -d(rho)/dt (time-varying). Inconsistent → unphysical fields.

```markdown
## Source Characterization
- **Current type**: [line I / surface K / volume J]
- **Geometry**: [parametric description]
- **Coordinate system**: [and justification]
- **Symmetries**: [translational / rotational / reflection]
- **Nonzero B-components by symmetry**: [list]
- **Current continuity**: [verified / issue noted]
```

**→** Complete geometric desc, coord system chosen, sym cataloged, continuity verified.

**If err:** Too complex for closed-form → discretize short straight segments (numerical Biot-Savart). Continuity violated → add displacement current or return charge accumulation before proceeding.

### Step 2: Select Law

Match method to sym + complexity:

1. **Ampere** (high sym): Use when B extractable from line integral. Applicable:
   - Infinite straight wire (cylindrical) → circular Amperian loop
   - Infinite solenoid (translational + rotational) → rectangular loop
   - Toroid (rotational about ring axis) → circular loop
   - Infinite planar current sheet (translational in 2 dirs) → rectangular loop

2. **Biot-Savart** (general): Arbitrary geometries Ampere can't simplify:
   - dB = (mu_0 / 4 pi) * (I dl' x r_hat) / r^2
   - Vol currents: B(r) = (mu_0 / 4 pi) * integral of (J(r') x r_hat) / r^2 dV'

3. **Dipole approx** (far field): Obs far from src (r >> src dim d):
   - Dipole moment: m = I * A * n_hat (planar loop area A)
   - B_dipole(r) = (mu_0 / 4 pi) * [3(m . r_hat) r_hat - m] / r^3
   - Valid r/d > 5 for ~1% accuracy

4. **Superposition**: Multi-src → B each independent + sum vectorially. Maxwell linearity → exact.

```markdown
## Method Selection
- **Primary method**: [Ampere / Biot-Savart / dipole]
- **Justification**: [symmetry argument or distance criterion]
- **Expected complexity**: [closed-form / single integral / numerical]
- **Fallback method**: [if primary fails or for cross-validation]
```

**→** Justified method choice, clear why law appropriate for sym level.

**If err:** Ampere chosen but insufficient sym (B not extractable) → fallback Biot-Savart. Src geometry too complex analytic Biot-Savart → discretize numerically.

### Step 3: Set Up + Eval Field Integrals

Execute calc via Step 2 method:

1. **Ampere path**: Per Amperian loop:
   - Parameterize path + compute line integral B . dl
   - Compute enclosed I_enc counting currents threading loop
   - Solve: contour_integral(B . dl) = mu_0 * I_enc
   - Extract B via sym (Step 1)

2. **Biot-Savart integration**: Per field pt r:
   - Parameterize src: dl' = (dr'/dt) dt or express J(r') over vol
   - Compute displacement: r - r' + magnitude |r - r'|
   - Eval cross product: dl' x (r - r') or J x (r - r')
   - Integrate over src (line, surface, vol)
   - Analytic eval: exploit sym reduce dim (on-axis field of loop → 1 integral)
   - Numerical: discretize N segments, sum, check convergence doubling N

3. **Dipole calc**:
   - Total magnetic moment: m = (1/2) integral (r' x J) dV' vol currents, or m = I * A * n_hat planar loop
   - Apply dipole field formula at each obs pt
   - Err estimate: next multipole (quadrupole) correction (d/r)^4

4. **Superposition assembly**: Sum all srcs per obs pt. Track components separately → preserve cancellation accuracy.

```markdown
## Field Calculation
- **Integral setup**: [explicit expression]
- **Evaluation method**: [analytic / numeric with N segments]
- **Result**: B(r) = [expression with units]
- **Convergence check** (if numerical): [N vs. 2N comparison]
```

**→** Explicit B(r) expr at obs pts, correct units (Tesla/Gauss), convergence check numerical.

**If err:** Integral diverges → missing regularization (field on thin wire diverges → use finite wire radius). Numerical oscillates w/ N → near-singularity → adaptive quadrature or analytical subtraction.

### Step 4: Check Limits

Verify vs known physics pre-trust:

1. **Far-field dipole limit**: Large r, localized src → dipole formula. Compute B → r → infinity, compare (mu_0 / 4 pi) * [3(m . r_hat) r_hat - m] / r^3.

2. **Near-field infinite-wire limit**: Close to long straight segment (rho << length L) → B = mu_0 I / (2 pi rho). Check for relevant geometry portion.

3. **On-axis special cases**: Loops + solenoids have simple closed forms:
   - Single circular loop radius R at dist z on axis: B_z = mu_0 I R^2 / [2 (R^2 + z^2)^(3/2)]
   - Solenoid length L, n turns/length: B_interior = mu_0 n I (L >> R)

4. **Sym consistency**: Verify components predicted vanish (Step 1) are 0. Nonzero forbidden → err.

5. **Dim analysis**: Verify B = Tesla. Every term mu_0 * [current] / [length].

```markdown
## Limiting Case Verification
| Case | Condition | Expected | Computed | Match |
|------|-----------|----------|----------|-------|
| Far-field dipole | r >> d | mu_0 m / (4 pi r^3) scaling | [result] | [Yes/No] |
| Near-field wire | rho << L | mu_0 I / (2 pi rho) | [result] | [Yes/No] |
| On-axis formula | [geometry] | [known result] | [result] | [Yes/No] |
| Symmetry zeros | [component] | 0 | [result] | [Yes/No] |
| Units | -- | Tesla | [check] | [Yes/No] |
```

**→** All limits match. Field: correct units, sym, asymptotic behavior.

**If err:** Failed limit → err in integral setup/eval. Common: wrong sign cross product, missing factor 2/pi, wrong integration limits, coord mismatch src vs field.

### Step 5: Materials + Visualize

Extend to material effects + produce viz:

1. **Linear materials**: Replace mu_0 w/ mu = mu_r * mu_0 inside. Boundary conds at interfaces:
   - Normal: B1_n = B2_n (continuous)
   - Tangential: H1_t - H2_t = K_free (surface free current)
   - No free surface currents: H1_t = H2_t

2. **Nonlinear (B-H curves)**: Ferromagnetic cores:
   - B-H curve relates B + H at each pt
   - Design: piecewise linear segments — linear (B = mu H), knee, saturation (B ~ constant)
   - Hysteresis if op pt cycles: remanent B_r + coercive H_c define loop

3. **Demagnetization**: Finite-geometry magnetic materials (short rods, spheres) → internal field reduced by N_d: H_internal = H_applied - N_d * M.

4. **Viz**:
   - Field lines via stream fn or integrating dB/ds along field direction
   - Magnitude contours (|B| color map)
   - 2D cross-sections → current direction (dots out, crosses in)
   - Verify field lines closed loops (div B = 0) — open → viz/calc err

5. **Intuition check**: Field pattern makes sense qualitatively. Strongest near src, circulates around currents (right-hand rule), decays w/ dist.

```markdown
## Material Effects and Visualization
- **Material model**: [vacuum / linear mu_r / nonlinear B-H / hysteretic]
- **Boundary conditions applied**: [list interfaces]
- **Visualization**: [field lines / magnitude contour / both]
- **Div B = 0 check**: [field lines close / verified numerically]
```

**→** Complete field solution + material effects, viz closed field lines consistent div B = 0, qualitative intuition match.

**If err:** Field lines don't close → divergence err in calc → recheck integral/numerical. Material → unexpected amplification → verify mu_r only inside material vol + boundary conds enforced each interface.

## Check

- [ ] Current distribution fully specified: geometry, magnitude, direction
- [ ] Current continuity (div J = 0 steady) verified
- [ ] Coord system aligned w/ dominant sym
- [ ] Method selection (Ampere / Biot-Savart / dipole) justified by sym
- [ ] Field integrals setup correct cross products + limits
- [ ] Numerical shows convergence (N vs 2N)
- [ ] Far-field dipole limit verified
- [ ] Near-field + on-axis match known formulas
- [ ] Forbidden sym components zero
- [ ] Units Tesla throughout
- [ ] Material boundary conds correct (if applicable)
- [ ] Field lines closed (div B = 0)

## Traps

- **Wrong cross-product direction**: Biot-Savart = dl' x r_hat (src to field), not r_hat x dl'. Backward → flips entire field direction. Right-hand rule quick check.
- **Confuse B + H**: Vacuum B = mu_0 H, inside material B = mu H. Ampere via H uses free current only; via B includes bound (magnetization). Mix conventions → mu_r errors.
- **Ampere no sufficient sym**: Always true but only useful when sym extracts B. B varies along loop → single scalar eq for spatially varying fn → underdetermined.
- **Ignore finite length of "infinite" wires**: Real solenoids + wires have ends. Infinite formula valid only far from ends (dist from end >> radius). Near ends → full Biot-Savart or finite-solenoid corrections.
- **Neglect demagnetization in finite**: Magnetized sphere/short rod ≠ long rod in same applied field. Demag factor reduces internal field 30-100% depending aspect ratio.
- **Non-physical field lines**: Begin/end free space (not src or infinity) → calc/plot err. Field lines always closed loops.

## →

- `solve-electromagnetic-induction` — use computed B → analyze time-varying flux + induced EMF
- `formulate-maxwell-equations` — generalize → full Maxwell + displacement current + wave propagation
- `design-electromagnetic-device` — apply to electromagnets, motors, transformers
- `formulate-quantum-problem` — quantum magnetic interactions (Zeeman, spin-orbit)
