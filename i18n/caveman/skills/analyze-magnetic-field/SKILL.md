---
name: analyze-magnetic-field
locale: caveman
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

Calculate magnetic field produced by given current distribution. Characterize source geometry. Select appropriate law (Biot-Savart for arbitrary geometries, Ampere's law for high-symmetry configurations). Evaluate field integrals. Check limiting cases. Incorporate magnetic material effects where relevant. Visualize resulting field-line topology.

## When Use

- Computing B-field from arbitrary current-carrying conductor (wire loop, helix, irregular path)
- Exploiting cylindrical, planar, or toroidal symmetry to apply Ampere's law direct
- Estimating far-field behavior via magnetic dipole approximation
- Superposing fields from multiple current sources
- Analyzing magnetic materials: linear permeability, B-H curves, hysteresis, saturation

## Inputs

- **Required**: Current distribution specification (geometry, current magnitude and direction)
- **Required**: Region of interest where field needed (observation points or volume)
- **Optional**: Material properties (relative permeability, B-H curve data, coercivity, remanence)
- **Optional**: Desired accuracy level (exact integral, multipole expansion order, numerical resolution)
- **Optional**: Visualization requirements (2D cross-section, 3D field lines, magnitude contour map)

## Steps

### Step 1: Characterize Current Distribution and Geometry

Fully specify source before selecting method:

1. **Current path**: Describe geometry of every current-carrying element. For line currents, specify path as parametric curve r'(t). For surface currents, specify surface current density K (A/m). For volume currents, specify J (A/m^2).
2. **Coordinate system**: Choose coordinates aligned with dominant symmetry. Cylindrical (rho, phi, z) for wires and solenoids. Spherical (r, theta, phi) for dipoles and loops at large distances. Cartesian for planar sheets.
3. **Symmetry analysis**: Identify translational, rotational, reflection symmetries. Symmetry of source is symmetry of field. Document which components of B nonzero by symmetry and which vanish.
4. **Current continuity**: Verify current distribution satisfies div(J) = 0 (steady state) or div(J) = -d(rho)/dt (time-varying). Inconsistent current distributions produce unphysical fields.

```markdown
## Source Characterization
- **Current type**: [line I / surface K / volume J]
- **Geometry**: [parametric description]
- **Coordinate system**: [and justification]
- **Symmetries**: [translational / rotational / reflection]
- **Nonzero B-components by symmetry**: [list]
- **Current continuity**: [verified / issue noted]
```

**Got:** Complete geometric description of current distribution with coordinate system chosen, symmetries cataloged, current continuity verified.

**If fail:** Geometry too complex for closed-form parametric description? Discretize into short straight segments (numerical Biot-Savart). Current continuity violated? Add displacement current or return charge accumulation terms before proceeding.

### Step 2: Select Appropriate Law

Choose method that matches problem's symmetry and complexity:

1. **Ampere's law** (high symmetry): Use when current distribution has sufficient symmetry that B can be pulled out of line integral. Applicable cases:
   - Infinite straight wire (cylindrical symmetry) -> circular Amperian loop
   - Infinite solenoid (translational + rotational) -> rectangular Amperian loop
   - Toroid (rotational about ring axis) -> circular Amperian loop
   - Infinite planar current sheet (translational in two directions) -> rectangular loop

2. **Biot-Savart law** (general): Use for arbitrary geometries where Ampere's law cannot simplify:
   - dB = (mu_0 / 4 pi) * (I dl' x r_hat) / r^2
   - For volume currents: B(r) = (mu_0 / 4 pi) * integral of (J(r') x r_hat) / r^2 dV'

3. **Magnetic dipole approximation** (far field): Use when observation point far from source (r >> source dimension d):
   - Compute magnetic dipole moment: m = I * A * n_hat (for planar loop of area A)
   - B_dipole(r) = (mu_0 / 4 pi) * [3(m . r_hat) r_hat - m] / r^3
   - Valid when r/d > 5 for ~1% accuracy

4. **Superposition**: For multiple sources, compute B from each independently and sum vectorially. Linearity of Maxwell's equations guarantees this is exact.

```markdown
## Method Selection
- **Primary method**: [Ampere / Biot-Savart / dipole]
- **Justification**: [symmetry argument or distance criterion]
- **Expected complexity**: [closed-form / single integral / numerical]
- **Fallback method**: [if primary fails or for cross-validation]
```

**Got:** Justified choice of method with clear statement of why chosen law appropriate for problem's symmetry level.

**If fail:** Ampere's law chosen but symmetry insufficient (B cannot be extracted from integral)? Fall back to Biot-Savart. Source geometry too complex for analytic Biot-Savart? Discretize numerically.

### Step 3: Set Up and Evaluate Field Integrals

Execute calculation using method selected in Step 2:

1. **Ampere's law path**: For each Amperian loop:
   - Parameterize loop path and compute line integral of B . dl
   - Compute enclosed current I_enc by counting all currents threading loop
   - Solve: contour_integral(B . dl) = mu_0 * I_enc
   - Extract B from integral using symmetry established in Step 1

2. **Biot-Savart integration**: For each field point r:
   - Parameterize source: dl' = (dr'/dt) dt or express J(r') over volume
   - Compute displacement vector: r - r' and its magnitude |r - r'|
   - Evaluate cross product: dl' x (r - r') or J x (r - r')
   - Integrate over source (line, surface, or volume)
   - For analytic evaluation: exploit symmetry to reduce dimensionality (e.g., on-axis field of loop involves only one integral)
   - For numerical evaluation: discretize into N segments, compute sum, check convergence by doubling N

3. **Dipole calculation**:
   - Compute total magnetic moment: m = (1/2) integral of (r' x J) dV' for volume currents, or m = I * A * n_hat for planar loop
   - Apply dipole field formula at each observation point
   - Estimate error: next multipole (quadrupole) correction scales as (d/r)^4

4. **Superposition assembly**: Sum contributions from all sources at each observation point. Track components separately to preserve cancellation accuracy.

```markdown
## Field Calculation
- **Integral setup**: [explicit expression]
- **Evaluation method**: [analytic / numeric with N segments]
- **Result**: B(r) = [expression with units]
- **Convergence check** (if numerical): [N vs. 2N comparison]
```

**Got:** Explicit expression for B(r) at observation points, with correct units (Tesla or Gauss) and convergence check for numerical results.

**If fail:** Integral diverges? Check for missing regularization (e.g., field on wire itself diverges for infinitely thin wire -- use finite wire radius). Numerical results oscillate with N? Integrand has near-singularity that requires adaptive quadrature or analytical subtraction of singular part.

### Step 4: Check Limiting Cases

Verify result against known physics before trusting it:

1. **Far-field dipole limit**: At large r, any localized current distribution should produce field that matches magnetic dipole formula. Compute B from your result in limit r -> infinity and compare with (mu_0 / 4 pi) * [3(m . r_hat) r_hat - m] / r^3.

2. **Near-field infinite-wire limit**: Close to long straight segment of conductor (distance rho << length L), field should approach B = mu_0 I / (2 pi rho). Check this for relevant portion of your geometry.

3. **On-axis special cases**: For loops and solenoids, on-axis field has simple closed forms:
   - Single circular loop of radius R at distance z on axis: B_z = mu_0 I R^2 / [2 (R^2 + z^2)^(3/2)]
   - Solenoid of length L, n turns per length: B_interior = mu_0 n I (for L >> R)

4. **Symmetry consistency**: Verify components predicted to vanish by symmetry (Step 1) are indeed zero in computed result. Nonzero forbidden component indicates error.

5. **Dimensional analysis**: Verify B has units of Tesla. Every term should carry mu_0 * [current] / [length] or equivalent.

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

**Got:** All limiting cases match. Field has correct units, symmetry, asymptotic behavior.

**If fail:** Failed limit indicates error in integral setup or evaluation. Most common causes: wrong sign in cross product, missing factor of 2 or pi, incorrect limits of integration, or coordinate system mismatch between source and field point parameterizations.

### Step 5: Incorporate Magnetic Materials and Visualize

Extend analysis to include material effects and produce field visualizations:

1. **Linear magnetic materials**: Replace mu_0 with mu = mu_r * mu_0 inside material. Apply boundary conditions at material interfaces:
   - Normal component: B1_n = B2_n (continuous)
   - Tangential component: H1_t - H2_t = K_free (surface free current)
   - Absence of free surface currents: H1_t = H2_t

2. **Nonlinear materials (B-H curves)**: For ferromagnetic cores:
   - Use material's B-H curve to relate B and H at each point
   - For design purposes, approximate with piecewise linear segments: linear region (B = mu H), knee region, saturation region (B approximately constant)
   - Account for hysteresis if operating point cycles: remanent magnetization B_r and coercive field H_c define loop

3. **Demagnetization effects**: For finite-geometry magnetic materials (e.g., short rods, spheres), internal field reduced by demagnetization factor N_d: H_internal = H_applied - N_d * M.

4. **Field visualization**:
   - Plot field lines using stream function or by integrating dB/ds along field direction
   - Plot magnitude contours (|B| as color map)
   - For 2D cross-sections, indicate current direction (dots for out-of-page, crosses for into-page)
   - Verify field lines form closed loops (div B = 0) -- open field lines indicate visualization or calculation error

5. **Physical intuition check**: Confirm field pattern makes qualitative sense. Field should be strongest near current source, should circulate around currents (right-hand rule), should decay with distance.

```markdown
## Material Effects and Visualization
- **Material model**: [vacuum / linear mu_r / nonlinear B-H / hysteretic]
- **Boundary conditions applied**: [list interfaces]
- **Visualization**: [field lines / magnitude contour / both]
- **Div B = 0 check**: [field lines close / verified numerically]
```

**Got:** Complete field solution including material effects where relevant. Visualization shows closed field lines consistent with div B = 0 and qualitative behavior matching physical intuition.

**If fail:** Field lines do not close? Calculation has divergence error -- recheck integral or numerical method. Material introduces unexpected field amplification? Verify mu_r applied only inside material volume and boundary conditions correctly enforced at every interface.

## Checks

- [ ] Current distribution fully specified with geometry, magnitude, direction
- [ ] Current continuity (div J = 0 for steady state) verified
- [ ] Coordinate system aligned with dominant symmetry
- [ ] Method selection (Ampere / Biot-Savart / dipole) justified by symmetry analysis
- [ ] Field integrals set up with correct cross products and limits
- [ ] Numerical results show convergence (N vs. 2N test)
- [ ] Far-field dipole limit verified
- [ ] Near-field and on-axis limits match known formulas
- [ ] Forbidden symmetry components are zero
- [ ] Units are Tesla throughout
- [ ] Material boundary conditions correctly applied (if applicable)
- [ ] Field lines form closed loops (div B = 0)

## Pitfalls

- **Wrong cross-product direction**: Biot-Savart cross product is dl' x r_hat (source to field), not r_hat x dl'. Getting this backward flips entire field direction. Use right-hand rule as quick check.
- **Confusing B and H**: In vacuum B = mu_0 H, but inside magnetic materials B = mu H. Ampere's law in terms of H uses free current only; in terms of B includes bound (magnetization) currents. Mixing conventions produces factors-of-mu_r errors.
- **Applying Ampere's law without sufficient symmetry**: Ampere's law always true but only useful when symmetry allows B to be extracted from integral. B varies along Amperian loop? Law gives single scalar equation for spatially varying function -- underdetermined.
- **Ignoring finite length of "infinite" wires**: Real solenoids and wires have ends. Infinite-wire or infinite-solenoid formula valid only far from ends (distance from end >> radius). Near ends, use full Biot-Savart integral or finite-solenoid corrections.
- **Neglecting demagnetization in finite geometries**: Magnetized sphere or short rod does not have same internal field as long rod in same applied field. Demagnetization factor can reduce effective internal field by 30-100% depending on aspect ratio.
- **Non-physical field lines**: Visualization shows field lines that begin or end in free space (not on current source or at infinity)? Calculation or plotting algorithm has error. Magnetic field lines always form closed loops.

## See Also

- `solve-electromagnetic-induction` -- use computed B-field to analyze time-varying flux and induced EMF
- `formulate-maxwell-equations` -- generalize to full set of Maxwell's equations including displacement current and wave propagation
- `design-electromagnetic-device` -- apply magnetic field analysis to design of electromagnets, motors, transformers
- `formulate-quantum-problem` -- quantum treatment of magnetic interactions (Zeeman effect, spin-orbit coupling)
