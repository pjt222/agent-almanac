---
name: analyze-magnetic-field
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

Calculate the magnetic field produced by a given current distribution by characterizing the source geometry, selecting the appropriate law (Biot-Savart for arbitrary geometries, Ampere's law for high-symmetry configurations), evaluating field integrals, checking limiting cases, incorporating magnetic material effects where relevant, and visualizing the resulting field-line topology.

## When to Use

- Computing the B-field from an arbitrary current-carrying conductor (wire loop, helix, irregular path)
- Exploiting cylindrical, planar, or toroidal symmetry to apply Ampere's law directly
- Estimating far-field behavior via the magnetic dipole approximation
- Superposing fields from multiple current sources
- Analyzing magnetic materials: linear permeability, B-H curves, hysteresis, saturation

## Inputs

- **Required**: Current distribution specification (geometry, current magnitude and direction)
- **Required**: Region of interest where the field is needed (observation points or volume)
- **Optional**: Material properties (relative permeability, B-H curve data, coercivity, remanence)
- **Optional**: Desired accuracy level (exact integral, multipole expansion order, numerical resolution)
- **Optional**: Visualization requirements (2D cross-section, 3D field lines, magnitude contour map)

## Procedure

### Step 1: Characterize Current Distribution and Geometry

Fully specify the source before selecting a method:

1. **Current path**: Describe the geometry of every current-carrying element. For line currents, specify the path as a parametric curve r'(t). For surface currents, specify the surface current density K (A/m). For volume currents, specify J (A/m^2).
2. **Coordinate system**: Choose coordinates aligned with the dominant symmetry. Cylindrical (rho, phi, z) for wires and solenoids. Spherical (r, theta, phi) for dipoles and loops at large distances. Cartesian for planar sheets.
3. **Symmetry analysis**: Identify translational, rotational, and reflection symmetries. A symmetry of the source is a symmetry of the field. Document which components of B are nonzero by symmetry and which vanish.
4. **Current continuity**: Verify that the current distribution satisfies div(J) = 0 (steady state) or div(J) = -d(rho)/dt (time-varying). Inconsistent current distributions produce unphysical fields.

```markdown
## Source Characterization
- **Current type**: [line I / surface K / volume J]
- **Geometry**: [parametric description]
- **Coordinate system**: [and justification]
- **Symmetries**: [translational / rotational / reflection]
- **Nonzero B-components by symmetry**: [list]
- **Current continuity**: [verified / issue noted]
```

**Expected:** A complete geometric description of the current distribution with coordinate system chosen, symmetries cataloged, and current continuity verified.

**On failure:** If the geometry is too complex for a closed-form parametric description, discretize into short straight segments (numerical Biot-Savart). If current continuity is violated, add displacement current or return charge accumulation terms before proceeding.

### Step 2: Select Appropriate Law

Choose the method that matches the problem's symmetry and complexity:

1. **Ampere's law** (high symmetry): Use when the current distribution has sufficient symmetry that B can be pulled out of the line integral. Applicable cases:
   - Infinite straight wire (cylindrical symmetry) -> circular Amperian loop
   - Infinite solenoid (translational + rotational) -> rectangular Amperian loop
   - Toroid (rotational about the ring axis) -> circular Amperian loop
   - Infinite planar current sheet (translational in two directions) -> rectangular loop

2. **Biot-Savart law** (general): Use for arbitrary geometries where Ampere's law cannot simplify:
   - dB = (mu_0 / 4 pi) * (I dl' x r_hat) / r^2
   - For volume currents: B(r) = (mu_0 / 4 pi) * integral of (J(r') x r_hat) / r^2 dV'

3. **Magnetic dipole approximation** (far field): Use when the observation point is far from the source (r >> source dimension d):
   - Compute the magnetic dipole moment: m = I * A * n_hat (for a planar loop of area A)
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

**Expected:** A justified choice of method with a clear statement of why the chosen law is appropriate for the problem's symmetry level.

**On failure:** If Ampere's law is chosen but the symmetry is insufficient (B cannot be extracted from the integral), fall back to Biot-Savart. If the source geometry is too complex for analytic Biot-Savart, discretize numerically.

### Step 3: Set Up and Evaluate Field Integrals

Execute the calculation using the method selected in Step 2:

1. **Ampere's law path**: For each Amperian loop:
   - Parameterize the loop path and compute the line integral of B . dl
   - Compute the enclosed current I_enc by counting all currents threading the loop
   - Solve: contour_integral(B . dl) = mu_0 * I_enc
   - Extract B from the integral using the symmetry established in Step 1

2. **Biot-Savart integration**: For each field point r:
   - Parameterize the source: dl' = (dr'/dt) dt or express J(r') over the volume
   - Compute the displacement vector: r - r' and its magnitude |r - r'|
   - Evaluate the cross product: dl' x (r - r') or J x (r - r')
   - Integrate over the source (line, surface, or volume)
   - For analytic evaluation: exploit symmetry to reduce dimensionality (e.g., on-axis field of a loop involves only one integral)
   - For numerical evaluation: discretize into N segments, compute the sum, and check convergence by doubling N

3. **Dipole calculation**:
   - Compute total magnetic moment: m = (1/2) integral of (r' x J) dV' for volume currents, or m = I * A * n_hat for a planar loop
   - Apply the dipole field formula at each observation point
   - Estimate the error: the next multipole (quadrupole) correction scales as (d/r)^4

4. **Superposition assembly**: Sum contributions from all sources at each observation point. Track components separately to preserve cancellation accuracy.

```markdown
## Field Calculation
- **Integral setup**: [explicit expression]
- **Evaluation method**: [analytic / numeric with N segments]
- **Result**: B(r) = [expression with units]
- **Convergence check** (if numerical): [N vs. 2N comparison]
```

**Expected:** An explicit expression for B(r) at the observation points, with correct units (Tesla or Gauss) and a convergence check for numerical results.

**On failure:** If the integral diverges, check for a missing regularization (e.g., the field on the wire itself diverges for an infinitely thin wire -- use finite wire radius). If numerical results oscillate with N, the integrand has a near-singularity that requires adaptive quadrature or analytical subtraction of the singular part.

### Step 4: Check Limiting Cases

Verify the result against known physics before trusting it:

1. **Far-field dipole limit**: At large r, any localized current distribution should produce a field that matches the magnetic dipole formula. Compute B from your result in the limit r -> infinity and compare with (mu_0 / 4 pi) * [3(m . r_hat) r_hat - m] / r^3.

2. **Near-field infinite-wire limit**: Close to a long straight segment of the conductor (distance rho << length L), the field should approach B = mu_0 I / (2 pi rho). Check this for the relevant portion of your geometry.

3. **On-axis special cases**: For loops and solenoids, the on-axis field has simple closed forms:
   - Single circular loop of radius R at distance z on axis: B_z = mu_0 I R^2 / [2 (R^2 + z^2)^(3/2)]
   - Solenoid of length L, n turns per length: B_interior = mu_0 n I (for L >> R)

4. **Symmetry consistency**: Verify that components predicted to vanish by symmetry (Step 1) are indeed zero in the computed result. A nonzero forbidden component indicates an error.

5. **Dimensional analysis**: Verify that B has units of Tesla. Every term should carry mu_0 * [current] / [length] or equivalent.

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

**Expected:** All limiting cases match. The field has the correct units, symmetry, and asymptotic behavior.

**On failure:** A failed limit indicates an error in the integral setup or evaluation. The most common causes are: wrong sign in the cross product, missing factor of 2 or pi, incorrect limits of integration, or a coordinate system mismatch between source and field point parameterizations.

### Step 5: Incorporate Magnetic Materials and Visualize

Extend the analysis to include material effects and produce field visualizations:

1. **Linear magnetic materials**: Replace mu_0 with mu = mu_r * mu_0 inside the material. Apply boundary conditions at material interfaces:
   - Normal component: B1_n = B2_n (continuous)
   - Tangential component: H1_t - H2_t = K_free (surface free current)
   - In the absence of free surface currents: H1_t = H2_t

2. **Nonlinear materials (B-H curves)**: For ferromagnetic cores:
   - Use the material's B-H curve to relate B and H at each point
   - For design purposes, approximate with piecewise linear segments: linear region (B = mu H), knee region, and saturation region (B approximately constant)
   - Account for hysteresis if the operating point cycles: remanent magnetization B_r and coercive field H_c define the loop

3. **Demagnetization effects**: For finite-geometry magnetic materials (e.g., short rods, spheres), the internal field is reduced by the demagnetization factor N_d: H_internal = H_applied - N_d * M.

4. **Field visualization**:
   - Plot field lines using the stream function or by integrating dB/ds along the field direction
   - Plot magnitude contours (|B| as a color map)
   - For 2D cross-sections, indicate the current direction (dots for out-of-page, crosses for into-page)
   - Verify that field lines form closed loops (div B = 0) -- open field lines indicate a visualization or calculation error

5. **Physical intuition check**: Confirm that the field pattern makes qualitative sense. The field should be strongest near the current source, should circulate around currents (right-hand rule), and should decay with distance.

```markdown
## Material Effects and Visualization
- **Material model**: [vacuum / linear mu_r / nonlinear B-H / hysteretic]
- **Boundary conditions applied**: [list interfaces]
- **Visualization**: [field lines / magnitude contour / both]
- **Div B = 0 check**: [field lines close / verified numerically]
```

**Expected:** A complete field solution including material effects where relevant, with a visualization that shows closed field lines consistent with div B = 0 and qualitative behavior matching physical intuition.

**On failure:** If field lines do not close, the calculation has a divergence error -- recheck the integral or numerical method. If the material introduces unexpected field amplification, verify that mu_r is applied only inside the material volume and that boundary conditions are correctly enforced at every interface.

## Validation

- [ ] Current distribution is fully specified with geometry, magnitude, and direction
- [ ] Current continuity (div J = 0 for steady state) is verified
- [ ] Coordinate system is aligned with the dominant symmetry
- [ ] Method selection (Ampere / Biot-Savart / dipole) is justified by symmetry analysis
- [ ] Field integrals are set up with correct cross products and limits
- [ ] Numerical results show convergence (N vs. 2N test)
- [ ] Far-field dipole limit is verified
- [ ] Near-field and on-axis limits match known formulas
- [ ] Forbidden symmetry components are zero
- [ ] Units are Tesla throughout
- [ ] Material boundary conditions are correctly applied (if applicable)
- [ ] Field lines form closed loops (div B = 0)

## Common Pitfalls

- **Wrong cross-product direction**: The Biot-Savart cross product is dl' x r_hat (source to field), not r_hat x dl'. Getting this backward flips the entire field direction. Use the right-hand rule as a quick check.
- **Confusing B and H**: In vacuum B = mu_0 H, but inside magnetic materials B = mu H. Ampere's law in terms of H uses free current only; in terms of B it includes bound (magnetization) currents. Mixing conventions produces factors-of-mu_r errors.
- **Applying Ampere's law without sufficient symmetry**: Ampere's law is always true but only useful when symmetry allows B to be extracted from the integral. If B varies along the Amperian loop, the law gives a single scalar equation for a spatially varying function -- underdetermined.
- **Ignoring the finite length of "infinite" wires**: Real solenoids and wires have ends. The infinite-wire or infinite-solenoid formula is valid only far from the ends (distance from end >> radius). Near the ends, use the full Biot-Savart integral or finite-solenoid corrections.
- **Neglecting demagnetization in finite geometries**: A magnetized sphere or short rod does not have the same internal field as a long rod in the same applied field. The demagnetization factor can reduce the effective internal field by 30-100% depending on the aspect ratio.
- **Non-physical field lines**: If a visualization shows field lines that begin or end in free space (not on a current source or at infinity), the calculation or plotting algorithm has an error. Magnetic field lines always form closed loops.

## Related Skills

- `solve-electromagnetic-induction` -- use the computed B-field to analyze time-varying flux and induced EMF
- `formulate-maxwell-equations` -- generalize to the full set of Maxwell's equations including displacement current and wave propagation
- `design-electromagnetic-device` -- apply magnetic field analysis to the design of electromagnets, motors, and transformers
- `formulate-quantum-problem` -- quantum treatment of magnetic interactions (Zeeman effect, spin-orbit coupling)
