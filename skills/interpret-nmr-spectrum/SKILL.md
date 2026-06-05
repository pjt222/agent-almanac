---
name: interpret-nmr-spectrum
description: >
  Systematically interpret nuclear magnetic resonance spectra (1H, 13C, DEPT,
  and 2D experiments) to elucidate molecular structure. Covers chemical shift
  assignment, coupling pattern analysis, integration, and correlation of
  multi-dimensional data into coherent structural proposals.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: spectroscopy
  complexity: advanced
  language: natural
  tags: spectroscopy, nmr, chemical-shift, coupling, structure-elucidation
---

# Interpret NMR Spectrum

Analyze one-dimensional and two-dimensional NMR spectra to assign peaks, determine coupling relationships, and propose molecular structural fragments consistent with all observed data.

## When to Use

- Determining the structure of an unknown organic compound from NMR data
- Confirming the identity and purity of a synthesized product
- Assigning peaks in complex spectra with overlapping signals
- Correlating multiple NMR experiments (1H, 13C, DEPT, COSY, HSQC, HMBC) into a unified structural picture
- Distinguishing regioisomers, stereoisomers, or conformational isomers

## Inputs

- **Required**: NMR spectrum data (at minimum, a 1H spectrum with chemical shifts, multiplicities, and integration)
- **Required**: Molecular formula or molecular weight (from mass spectrometry or elemental analysis)
- **Optional**: 13C and DEPT spectra (chemical shifts and multiplicities)
- **Optional**: 2D spectra (COSY, HSQC, HMBC, NOESY/ROESY correlation tables)
- **Optional**: Solvent and field strength used for acquisition
- **Optional**: Known structural constraints (e.g., reaction starting material, functional groups confirmed by IR)

## Procedure

### Step 1: Assess Spectrum Type and Acquisition Parameters

Establish what data is available and its quality before interpreting:

1. **Identify experiment types**: Catalog which spectra are available (1H, 13C, DEPT-135, DEPT-90, COSY, HSQC, HMBC, NOESY, ROESY, TOCSY). Note the nucleus observed and the dimensionality.
2. **Record acquisition parameters**: Note the spectrometer frequency (e.g., 400 MHz, 600 MHz), solvent, temperature, and reference standard.
3. **Identify solvent and reference peaks**: Locate and exclude solvent signals using the reference table below.

| Solvent | 1H Residual (ppm) | 13C Signal (ppm) |
|---------|-------------------|-------------------|
| CDCl3 | 7.26 | 77.16 |
| DMSO-d6 | 2.50 | 39.52 |
| D2O | 4.79 | -- |
| CD3OD | 3.31 | 49.00 |
| Acetone-d6 | 2.05 | 29.84, 206.26 |
| C6D6 | 7.16 | 128.06 |

4. **Assess spectral quality**: Check baseline flatness, resolution of multiplets, and signal-to-noise ratio. Flag any artifacts (spinning sidebands, 13C satellites, solvent impurity peaks such as H2O at ~1.56 ppm in CDCl3).

**Expected:** A complete inventory of available experiments, confirmed solvent/reference peaks excluded from analysis, and a quality assessment.

**On failure:** If the spectrum has poor signal-to-noise or severe baseline distortion, note the limitation and proceed with caution. Flag any peaks that cannot be reliably distinguished from noise.

### Step 2: Analyze 1H Chemical Shifts

Assign each 1H signal to a chemical environment using characteristic shift ranges:

1. **Tabulate all signals**: For each peak, record chemical shift (ppm), multiplicity, coupling constant(s) J (Hz), and relative integration.
2. **Classify by chemical shift region**:

| Range (ppm) | Environment | Examples |
|-------------|-------------|----------|
| 0.0--0.5 | Shielded (cyclopropane, M-H) | Cyclopropyl H, metal hydrides |
| 0.5--2.0 | Alkyl (CH3, CH2, CH) | Saturated aliphatic chains |
| 2.0--4.5 | Alpha to heteroatom/unsaturation | -OCH3, -NCH2, allylic, benzylic |
| 4.5--6.5 | Vinyl / olefinic | =CH-, =CH2 |
| 6.5--8.5 | Aromatic | ArH |
| 9.0--10.0 | Aldehyde | -CHO |
| 10.0--12.0 | Carboxylic acid | -COOH |
| 0.5--5.0 (broad, exchangeable) | OH, NH | Alcohols, amines, amides |

3. **Count hydrogens**: Use integration ratios relative to the molecular formula to assign the number of protons per signal. Normalize to the simplest whole-number ratio.
4. **Note exchangeable protons**: Signals that disappear on D2O shake (OH, NH, COOH) are exchangeable. Record their presence and approximate shift.

**Expected:** A table of all 1H signals with shift, multiplicity, J-values, integration (number of H), and preliminary environment assignment.

**On failure:** If integration ratios do not sum to the expected total number of protons, check for overlapping signals, broad peaks hidden in the baseline, or incorrect molecular formula.

### Step 3: Determine Coupling Patterns and J-Values

Extract connectivity information from splitting patterns:

1. **Identify multiplicities**: Assign each signal as singlet (s), doublet (d), triplet (t), quartet (q), doublet of doublets (dd), etc. For complex multiplets (m), estimate the number of coupling partners.
2. **Measure coupling constants**: Extract J-values in Hz. Match reciprocal couplings (if H_A couples to H_B with J = 7.2 Hz, H_B must show the same J to H_A).
3. **Classify J-values by type**:

| J Range (Hz) | Coupling Type |
|--------------|---------------|
| 0--3 | Geminal (2J) or long-range (4J, 5J) |
| 6--8 | Vicinal aliphatic (3J) |
| 8--10 | Vicinal with restricted rotation |
| 10--17 | Vicinal olefinic cis (6--12) or trans (12--18) |
| 0--3 | Aromatic meta |
| 6--9 | Aromatic ortho |

4. **Map coupling networks**: Group mutually coupled protons into spin systems. Each spin system represents a connected fragment of the molecule.
5. **Assess roof effect**: In AB-type patterns, the inner lines of doublets are more intense than the outer lines, indicating chemical shift proximity.

**Expected:** All coupling constants measured and matched reciprocally, spin systems identified, and coupling types classified.

**On failure:** If multiplets are too complex to analyze by first-order rules, note the higher-order pattern. Consider that overlapping signals or strongly coupled nuclei (delta-nu/J < 10) produce non-first-order patterns requiring simulation.

### Step 4: Analyze 13C and DEPT Data

Determine carbon types and count from 13C experiments:

1. **Count distinct carbon signals**: Compare the number of 13C peaks with the molecular formula. Fewer peaks than expected indicates molecular symmetry.
2. **Classify by chemical shift**:

| Range (ppm) | Carbon Type | Examples |
|-------------|-------------|----------|
| 0--50 | sp3 Alkyl | CH3, CH2, CH, quaternary C |
| 50--100 | Alpha to O or N | -OCH3, -OCH2, anomeric C |
| 100--150 | Aromatic / vinyl | =CH-, ArC |
| 150--170 | Heteroaromatic / enol / imine | C=N, C-O aromatic |
| 170--185 | Carboxyl / ester / amide | -COOH, -COOR, -CONR2 |
| 185--220 | Aldehyde / ketone | -CHO, >C=O |

3. **Apply DEPT editing**: Use DEPT-135 (CH and CH3 up, CH2 down, quaternary absent) and DEPT-90 (CH only) to determine the number of attached hydrogens per carbon.
4. **Calculate degree of unsaturation**: DBE = (2C + 2 + N - H - X) / 2. Compare with the count of pi bonds and rings implied by the spectrum.

**Expected:** Every 13C signal classified by type (CH3, CH2, CH, C) and chemical environment, degree of unsaturation calculated and consistent with observed functional groups.

**On failure:** If DEPT data is unavailable, infer hydrogen attachment from HSQC correlations (Step 5). If carbon count does not match the molecular formula, check for coincident signals or quaternary carbons hidden in noise.

### Step 5: Correlate 2D NMR Data

Build connectivity using two-dimensional experiments:

1. **COSY (1H-1H correlation)**: Identify which protons are 2--3 bonds apart. Map cross-peaks to confirm and extend the spin systems from Step 3.
2. **HSQC (1H-13C one-bond)**: Assign each proton to its directly bonded carbon. This links the 1H and 13C assignments unambiguously.
3. **HMBC (1H-13C long-range)**: Identify 2--3 bond H-C correlations. HMBC is critical for connecting fragments across quaternary carbons, heteroatoms, and carbonyl groups that lack direct H-C bonds.
4. **NOESY/ROESY (through-space)**: Identify protons that are spatially close (< 5 Angstroms) regardless of bonding connectivity. Use for stereochemical assignment and conformational analysis.
5. **Build fragment connectivity**: Use HMBC correlations to connect the spin systems from COSY into larger fragments. Each HMBC cross-peak represents a 2--3 bond path from H to C.

**Expected:** A connectivity map linking all spin systems into a coherent molecular framework, with stereochemical information from NOE data where available.

**On failure:** If 2D data is incomplete or ambiguous, note which connections are tentative. Multiple structural proposals may be necessary. Prioritize HMBC correlations for fragment assembly, as they bridge gaps that COSY cannot.

### Step 6: Propose and Validate Structure

Assemble fragments into a complete structural proposal:

1. **Assemble fragments**: Connect the structural fragments from Steps 2--5 using HMBC correlations and degree-of-unsaturation constraints.
2. **Check molecular formula**: Verify that the proposed structure matches the molecular formula exactly (atom count, degree of unsaturation).
3. **Back-predict chemical shifts**: For the proposed structure, predict expected 1H and 13C chemical shifts. Compare predictions with observed values; deviations > 0.3 ppm (1H) or > 5 ppm (13C) warrant re-examination.
4. **Verify all correlations**: Confirm that every observed COSY, HSQC, and HMBC correlation is explained by the proposed structure. Unexplained cross-peaks suggest an error or impurity.
5. **Consider alternatives**: If multiple structures fit the data, list distinguishing experiments or correlations that would resolve the ambiguity.
6. **Assign stereochemistry**: Use NOE data, J-value analysis (Karplus relationship for dihedral angles), and known conformational preferences to assign relative and, where possible, absolute stereochemistry.

**Expected:** A single best-fit structural proposal with all NMR data accounted for, or a ranked list of candidates with a plan to distinguish them.

**On failure:** If no single structure accounts for all data, check for: mixture of compounds (extra peaks with non-integer integration ratios), dynamic processes (broad peaks from conformational exchange), or paramagnetic impurities (anomalous broadening). Re-examine the molecular formula if multiple structures remain equally viable.

## Validation

- [ ] All solvent and reference peaks identified and excluded from interpretation
- [ ] Every 1H signal assigned a chemical shift region, multiplicity, J-value, and integration
- [ ] Coupling constants are reciprocal (matched between coupling partners)
- [ ] 13C signals classified by DEPT multiplicity and chemical shift region
- [ ] Degree of unsaturation calculated and consistent with proposed structure
- [ ] 2D correlations (COSY, HSQC, HMBC) are all explained by the structural proposal
- [ ] Proposed structure matches the molecular formula exactly
- [ ] Back-predicted chemical shifts agree with observed values within tolerance
- [ ] Stereochemistry addressed using NOE and/or J-value analysis where applicable

## Common Pitfalls

- **Ignoring solvent peaks**: Common solvents produce signals that can overlap with analyte peaks. Always identify and exclude solvent residuals, water, and grease peaks before interpretation.
- **Forcing first-order analysis on second-order patterns**: Strongly coupled nuclei (small chemical shift difference relative to J) produce distorted multiplets that cannot be interpreted with simple n+1 rules. Recognize roof effects and non-binomial intensity patterns as indicators.
- **Overlooking exchangeable protons**: OH and NH signals may be broad, shifted by concentration/temperature, or absent in protic solvents. A D2O shake experiment clarifies which signals are exchangeable.
- **Assuming all 13C peaks are visible**: Quaternary carbons have long relaxation times and low intensity. They may be absent from short-acquisition spectra. HMBC correlations are often the only way to detect them.
- **Misinterpreting HMBC artifacts**: HMBC spectra can show one-bond artifacts (misassigned as long-range correlations) and weak four-bond correlations. Cross-check with HSQC to filter out one-bond leakthrough.
- **Neglecting symmetry**: If the observed number of 13C peaks is fewer than the molecular formula predicts, the molecule likely has a symmetry element. Account for this before proposing a structure.

## Related Skills

- `interpret-ir-spectrum` -- identify functional groups to constrain NMR-based structure proposals
- `interpret-mass-spectrum` -- determine molecular formula and fragmentation for cross-validation
- `interpret-uv-vis-spectrum` -- characterize chromophores and conjugation extent
- `interpret-raman-spectrum` -- obtain complementary vibrational data for symmetric modes
- `plan-spectroscopic-analysis` -- select and sequence spectroscopic techniques before data acquisition
