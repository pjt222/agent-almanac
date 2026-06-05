---
name: interpret-uv-vis-spectrum
description: >
  Systematically interpret ultraviolet-visible absorption spectra to identify
  chromophores, classify electronic transitions, apply Woodward-Fieser rules
  for conjugated systems, and perform quantitative analysis using the
  Beer-Lambert law.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: spectroscopy
  complexity: intermediate
  language: natural
  tags: spectroscopy, uv-vis, chromophore, beer-lambert, electronic-transitions
---

# Interpret UV-Vis Spectrum

Analyze ultraviolet-visible absorption spectra to identify chromophores, classify electronic transitions, predict absorption maxima for conjugated systems, and apply the Beer-Lambert law for quantitative determination.

## When to Use

- Identifying chromophores and the extent of conjugation in an organic compound
- Confirming the presence of aromatic rings, conjugated dienes, or enones
- Performing quantitative analysis (determining concentration from absorbance)
- Monitoring reaction kinetics by tracking absorbance changes over time
- Characterizing metal-ligand complexes via d-d and charge-transfer transitions
- Assessing solvent effects on electronic transitions (solvatochromism)

## Inputs

- **Required**: UV-Vis spectrum data (wavelength in nm vs. absorbance or molar absorptivity)
- **Required**: Solvent used for measurement
- **Optional**: Concentration and path length (for Beer-Lambert calculations)
- **Optional**: Molar absorptivity (epsilon) values at lambda-max
- **Optional**: Spectra in multiple solvents (for solvatochromism analysis)
- **Optional**: Structural information from other spectroscopic methods

## Procedure

### Step 1: Verify Instrument Parameters and Spectrum Quality

Ensure the data is reliable before interpreting absorption bands:

1. **Wavelength range**: Confirm the spectrum covers the relevant range. Standard UV-Vis spans 190--800 nm. Solvents impose low-wavelength cutoffs:

| Solvent | UV Cutoff (nm) | Notes |
|---------|----------------|-------|
| Water | 190 | Excellent UV transparency |
| Hexane | 195 | Non-polar, minimal solvent effects |
| Methanol | 205 | Protic, may cause blue shifts |
| Acetonitrile | 190 | Good general-purpose UV solvent |
| Dichloromethane | 230 | Absorbs below 230 nm |
| Chloroform | 245 | Absorbs below 245 nm |
| Acetone | 330 | Absorbs strongly, poor UV solvent |

2. **Absorbance range**: Reliable measurements require absorbance between 0.1 and 1.0. Below 0.1, noise dominates; above 1.0, stray light causes non-linear response. Flag any lambda-max values outside this range.
3. **Baseline and blank**: Verify that a solvent blank was subtracted. Residual solvent absorption or cuvette artifacts appear as a rising baseline at short wavelengths.
4. **Slit width**: Narrow slit widths give better resolution but lower signal-to-noise. If fine structure is expected (vibrational progression on electronic bands), confirm the slit width is appropriate (typically 1--2 nm).

**Expected:** Instrument parameters documented, solvent cutoff respected, absorbance values within the linear range, and baseline confirmed clean.

**On failure:** If absorbance exceeds 1.0 at lambda-max, the sample must be diluted and remeasured. If the solvent absorbs in the region of interest, recommend re-acquisition in a more transparent solvent.

### Step 2: Identify Lambda-Max and Band Characteristics

Locate and characterize all absorption bands:

1. **Locate lambda-max values**: Identify each absorption maximum (lambda-max) and record its wavelength (nm) and absorbance (or molar absorptivity epsilon if known).
2. **Measure band shape**: Note whether each band is broad and featureless (typical of solution-phase electronic transitions) or shows vibrational fine structure (typical of rigid chromophores like polycyclic aromatics).
3. **Record shoulders**: Absorption shoulders indicate overlapping transitions. Note their approximate wavelength and intensity.
4. **Classify by molar absorptivity**:

| epsilon (L mol-1 cm-1) | Transition Type | Example |
|-------------------------|-----------------|---------|
| < 100 | Forbidden (n -> pi*) | Ketone ~280 nm |
| 100--10,000 | Weakly allowed | Aromatic 250--270 nm |
| 10,000--100,000 | Fully allowed (pi -> pi*) | Conjugated diene ~220 nm |
| > 100,000 | Charge transfer | Metal complexes, dyes |

**Expected:** All absorption maxima and shoulders tabulated with wavelength, absorbance/epsilon, and qualitative band shape.

**On failure:** If the spectrum shows no distinct maxima (monotonic rise), the compound may lack a chromophore in the measured range, or the concentration may be too low. Increase concentration or extend the wavelength range.

### Step 3: Classify Electronic Transitions

Assign each absorption band to a specific electronic transition type:

1. **sigma -> sigma* transitions** (< 200 nm): Observed only in vacuum UV. Relevant for saturated hydrocarbons and C-C/C-H bonds. Not typically measured in standard UV-Vis.
2. **n -> sigma* transitions** (150--250 nm): Lone pair to sigma antibonding. Observed for heteroatoms (O, N, S, halogens). Saturated amines absorb near 190--200 nm; alcohols/ethers near 175--185 nm.
3. **pi -> pi* transitions** (200--500 nm): Bonding pi to antibonding pi*. These are the strongest absorptions for organic compounds. Intensity and wavelength increase with extended conjugation.
4. **n -> pi* transitions** (250--400 nm): Lone pair to pi antibonding. Formally forbidden (low epsilon, typically 10--100). Characteristic of C=O (270--280 nm for simple ketones), N=O, and C=S groups.
5. **Charge-transfer transitions**: Electron transfer between donor and acceptor groups, or between metal and ligand. Typically very intense (epsilon > 10,000) and broad. Found in metal complexes and donor-acceptor organic molecules.
6. **d-d transitions** (for transition metal complexes): Weak, broad bands in the visible region arising from crystal field or ligand field splitting.

**Expected:** Each absorption band assigned to a transition type with supporting rationale (position, intensity, solvent sensitivity).

**On failure:** If a band cannot be assigned to a standard transition type, consider charge-transfer character or the possibility of impurity absorption. Multiple overlapping transitions may require deconvolution.

### Step 4: Apply Woodward-Fieser Rules for Conjugated Systems

Predict lambda-max for conjugated dienes and enones and compare with observed values:

1. **Conjugated dienes** (Woodward rules):

| Component | Increment (nm) |
|-----------|----------------|
| Base value (heteroannular diene) | 214 |
| Base value (homoannular diene) | 253 |
| Each additional conjugated C=C | +30 |
| Each exocyclic C=C | +5 |
| Each alkyl substituent on C=C | +5 |
| -OAcyl substituent | +0 |
| -OR substituent | +6 |
| -SR substituent | +30 |
| -Cl, -Br substituent | +5 |
| -NR2 substituent | +5 |

2. **Alpha-beta unsaturated carbonyls** (Woodward-Fieser rules):

| Component | Increment (nm) |
|-----------|----------------|
| Base value (alpha-beta unsat. ketone, 6-ring or acyclic) | 215 |
| Base value (alpha-beta unsat. aldehyde) | 208 |
| Each additional conjugated C=C | +30 |
| Each exocyclic C=C | +5 |
| Homoannular diene component | +39 |
| Alpha substituent (alkyl) | +10 |
| Beta substituent (alkyl) | +12 |
| Gamma and higher substituent (alkyl) | +18 |
| -OH (alpha) | +35 |
| -OH (beta) | +30 |
| -OAc (alpha, beta, gamma) | +6 |
| -OR (alpha) | +35 |
| -OR (beta) | +30 |
| -Cl (alpha) | +15 |
| -Cl (beta) | +12 |
| -Br (beta) | +25 |
| -NR2 (beta) | +95 |

3. **Calculate predicted lambda-max**: Sum the base value and all applicable increments.
4. **Compare with observed**: Agreement within +/- 5 nm supports the proposed chromophore. Deviations > 10 nm suggest an incorrect structural assignment or strong solvent/steric effects.

**Expected:** Predicted lambda-max calculated and compared with observed value, supporting or refuting the proposed chromophore structure.

**On failure:** If the predicted and observed values disagree significantly, re-examine the assumed chromophore structure. Common errors: miscounting substituents, overlooking an exocyclic double bond, or applying the wrong base value (homoannular vs. heteroannular).

### Step 5: Apply Beer-Lambert Law for Quantitative Analysis

Use absorbance data for concentration determination or molar absorptivity characterization:

1. **Beer-Lambert equation**: A = epsilon * b * c, where A = absorbance (dimensionless), epsilon = molar absorptivity (L mol-1 cm-1), b = path length (cm), c = concentration (mol L-1).
2. **Determine molar absorptivity**: If concentration and path length are known, calculate epsilon from the measured absorbance at lambda-max.
3. **Determine concentration**: If epsilon is known (from literature or a calibration curve), calculate the concentration from the measured absorbance.
4. **Check linearity**: Beer-Lambert law is valid only in the linear range (typically A = 0.1--1.0). At higher absorbances, deviations occur due to stray light, molecular interactions, and instrumental limitations.
5. **Assess solvent effects**: Compare spectra in polar vs. non-polar solvents:
   - **Bathochromic (red) shift**: lambda-max moves to longer wavelength. pi -> pi* transitions red-shift in more polar solvents; n -> pi* transitions red-shift in less polar solvents.
   - **Hypsochromic (blue) shift**: lambda-max moves to shorter wavelength. n -> pi* transitions blue-shift in more polar/protic solvents (hydrogen bonding stabilizes the lone pair ground state).
   - **Hyperchromic/hypochromic effects**: Increase or decrease in epsilon without wavelength change.

**Expected:** Quantitative results calculated with appropriate significant figures, linearity verified, and solvent effects documented if spectra in multiple solvents are available.

**On failure:** If Beer-Lambert linearity fails, check for sample degradation, aggregation at high concentration, or fluorescence interference. Dilute the sample and remeasure to confirm.

## Validation

- [ ] Solvent cutoff respected and absorbance within the linear range (0.1--1.0)
- [ ] All lambda-max values and shoulders tabulated with wavelength, absorbance, and epsilon
- [ ] Each absorption band assigned to an electronic transition type
- [ ] Woodward-Fieser calculation performed where applicable and compared with observed lambda-max
- [ ] Beer-Lambert law applied correctly with verified linearity
- [ ] Solvent effects characterized if multi-solvent data is available
- [ ] Chromophore assignment consistent with molecular structure from other spectroscopic methods

## Common Pitfalls

- **Measuring above A = 1.0**: High absorbance values are unreliable due to stray light effects. Always dilute and remeasure if lambda-max absorbance exceeds 1.0.
- **Ignoring the solvent cutoff**: Attempting to interpret absorptions below the solvent cutoff wavelength produces artifacts, not real sample data.
- **Confusing transition types by intensity alone**: A weak band near 280 nm could be an n -> pi* transition of a carbonyl or a forbidden pi -> pi* of an aromatic. Context and solvent effects are needed to distinguish them.
- **Misapplying Woodward-Fieser rules**: These empirical rules apply only to conjugated dienes and alpha-beta unsaturated carbonyls. They cannot be used for aromatic systems, isolated chromophores, or metal complexes.
- **Neglecting impurity absorption**: Even small amounts of a strongly absorbing impurity can dominate the spectrum. If lambda-max does not match expectations, consider impurity contributions.
- **Assuming one band = one transition**: Broad UV-Vis bands often contain multiple overlapping transitions. Band deconvolution may be necessary for accurate assignment.

## Related Skills

- `interpret-nmr-spectrum` -- determine molecular connectivity to support chromophore identification
- `interpret-ir-spectrum` -- identify functional groups that contribute to the chromophore
- `interpret-mass-spectrum` -- establish molecular formula and detect conjugation via fragmentation
- `interpret-raman-spectrum` -- complementary vibrational data for symmetric chromophores
- `plan-spectroscopic-analysis` -- select and sequence spectroscopic techniques before data acquisition
