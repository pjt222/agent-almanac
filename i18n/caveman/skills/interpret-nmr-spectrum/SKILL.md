---
name: interpret-nmr-spectrum
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
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

Read 1D and 2D NMR spectra. Assign peaks, determine coupling, propose molecular structural fragments consistent with all observed data.

## When Use

- Determine structure of unknown organic compound from NMR data
- Confirm identity and purity of synthesized product
- Assign peaks in complex spectra with overlapping signals
- Correlate multiple NMR experiments (1H, 13C, DEPT, COSY, HSQC, HMBC) into unified structural picture
- Distinguish regioisomers, stereoisomers, conformational isomers

## Inputs

- **Required**: NMR spectrum data (at minimum 1H spectrum with chemical shifts, multiplicities, integration)
- **Required**: Molecular formula or molecular weight (from mass spectrometry or elemental analysis)
- **Optional**: 13C and DEPT spectra (chemical shifts and multiplicities)
- **Optional**: 2D spectra (COSY, HSQC, HMBC, NOESY/ROESY correlation tables)
- **Optional**: Solvent and field strength used for acquisition
- **Optional**: Known structural constraints (e.g., reaction starting material, functional groups confirmed by IR)

## Steps

### Step 1: Assess Spectrum Type and Acquisition Parameters

Establish what data is available, its quality, before interpreting:

1. **Identify experiment types**: Catalog which spectra available (1H, 13C, DEPT-135, DEPT-90, COSY, HSQC, HMBC, NOESY, ROESY, TOCSY). Note nucleus observed and dimensionality
2. **Record acquisition parameters**: Spectrometer frequency (e.g., 400 MHz, 600 MHz), solvent, temperature, reference standard
3. **Identify solvent and reference peaks**: Locate and exclude solvent signals using reference table:

| Solvent | 1H Residual (ppm) | 13C Signal (ppm) |
|---------|-------------------|-------------------|
| CDCl3 | 7.26 | 77.16 |
| DMSO-d6 | 2.50 | 39.52 |
| D2O | 4.79 | -- |
| CD3OD | 3.31 | 49.00 |
| Acetone-d6 | 2.05 | 29.84, 206.26 |
| C6D6 | 7.16 | 128.06 |

4. **Assess spectral quality**: Check baseline flatness, resolution of multiplets, signal-to-noise. Flag any artifacts (spinning sidebands, 13C satellites, solvent impurity peaks like H2O at ~1.56 ppm in CDCl3)

**Got:** Complete inventory of available experiments. Solvent/reference peaks excluded from analysis. Quality assessment.

**If fail:** Poor signal-to-noise or severe baseline distortion? Note limitation, proceed with caution. Flag any peaks not reliably distinguishable from noise.

### Step 2: Analyze 1H Chemical Shifts

Assign each 1H signal to chemical environment using characteristic shift ranges:

1. **Tabulate all signals**: For each peak, record chemical shift (ppm), multiplicity, coupling constant(s) J (Hz), relative integration
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

3. **Count hydrogens**: Use integration ratios relative to molecular formula to assign number of protons per signal. Normalize to simplest whole-number ratio
4. **Note exchangeable protons**: Signals disappearing on D2O shake (OH, NH, COOH) are exchangeable. Record presence and approximate shift

**Got:** Table of all 1H signals with shift, multiplicity, J-values, integration (number of H), preliminary environment assignment.

**If fail:** Integration ratios not summing to expected total protons? Check for overlapping signals, broad peaks hidden in baseline, or incorrect molecular formula.

### Step 3: Determine Coupling Patterns and J-Values

Extract connectivity info from splitting patterns:

1. **Identify multiplicities**: Assign each signal as singlet (s), doublet (d), triplet (t), quartet (q), doublet of doublets (dd), etc. For complex multiplets (m), estimate number of coupling partners
2. **Measure coupling constants**: Extract J-values in Hz. Match reciprocal couplings (if H_A couples to H_B with J = 7.2 Hz, H_B must show same J to H_A)
3. **Classify J-values by type**:

| J Range (Hz) | Coupling Type |
|--------------|---------------|
| 0--3 | Geminal (2J) or long-range (4J, 5J) |
| 6--8 | Vicinal aliphatic (3J) |
| 8--10 | Vicinal with restricted rotation |
| 10--17 | Vicinal olefinic cis (6--12) or trans (12--18) |
| 0--3 | Aromatic meta |
| 6--9 | Aromatic ortho |

4. **Map coupling networks**: Group mutually coupled protons into spin systems. Each spin system = connected fragment of molecule
5. **Assess roof effect**: In AB-type patterns, inner lines of doublets more intense than outer → chemical shift proximity

**Got:** All coupling constants measured and matched reciprocally. Spin systems identified. Coupling types classified.

**If fail:** Multiplets too complex for first-order rules? Note higher-order pattern. Overlapping signals or strongly coupled nuclei (delta-nu/J < 10) make non-first-order patterns needing simulation.

### Step 4: Analyze 13C and DEPT Data

Determine carbon types and count from 13C experiments:

1. **Count distinct carbon signals**: Compare number of 13C peaks vs molecular formula. Fewer peaks than expected = molecular symmetry
2. **Classify by chemical shift**:

| Range (ppm) | Carbon Type | Examples |
|-------------|-------------|----------|
| 0--50 | sp3 Alkyl | CH3, CH2, CH, quaternary C |
| 50--100 | Alpha to O or N | -OCH3, -OCH2, anomeric C |
| 100--150 | Aromatic / vinyl | =CH-, ArC |
| 150--170 | Heteroaromatic / enol / imine | C=N, C-O aromatic |
| 170--185 | Carboxyl / ester / amide | -COOH, -COOR, -CONR2 |
| 185--220 | Aldehyde / ketone | -CHO, >C=O |

3. **Apply DEPT editing**: Use DEPT-135 (CH and CH3 up, CH2 down, quaternary absent) and DEPT-90 (CH only) to determine number of attached hydrogens per carbon
4. **Calculate degree of unsaturation**: DBE = (2C + 2 + N - H - X) / 2. Compare with count of pi bonds and rings implied by spectrum

**Got:** Every 13C signal classified by type (CH3, CH2, CH, C) and chemical environment. Degree of unsaturation calculated, consistent with observed functional groups.

**If fail:** DEPT data unavailable? Infer hydrogen attachment from HSQC correlations (Step 5). Carbon count does not match molecular formula? Check for coincident signals or quaternary carbons hidden in noise.

### Step 5: Correlate 2D NMR Data

Build connectivity using two-dimensional experiments:

1. **COSY (1H-1H correlation)**: Identify which protons are 2-3 bonds apart. Map cross-peaks to confirm and extend spin systems from Step 3
2. **HSQC (1H-13C one-bond)**: Assign each proton to directly bonded carbon. Links 1H and 13C assignments unambiguously
3. **HMBC (1H-13C long-range)**: Identify 2-3 bond H-C correlations. HMBC critical for connecting fragments across quaternary carbons, heteroatoms, carbonyl groups lacking direct H-C bonds
4. **NOESY/ROESY (through-space)**: Identify protons spatially close (< 5 Angstroms) regardless of bonding. Use for stereochemical assignment and conformational analysis
5. **Build fragment connectivity**: Use HMBC correlations to connect spin systems from COSY into larger fragments. Each HMBC cross-peak = 2-3 bond path from H to C

**Got:** Connectivity map linking all spin systems into coherent molecular framework, with stereochemical info from NOE data where available.

**If fail:** 2D data incomplete or ambiguous? Note which connections are tentative. Multiple structural proposals may be necessary. Prioritize HMBC correlations for fragment assembly — bridges gaps COSY cannot.

### Step 6: Propose and Validate Structure

Assemble fragments into complete structural proposal:

1. **Assemble fragments**: Connect structural fragments from Steps 2-5 using HMBC correlations and degree-of-unsaturation constraints
2. **Check molecular formula**: Verify proposed structure matches molecular formula exactly (atom count, degree of unsaturation)
3. **Back-predict chemical shifts**: For proposed structure, predict expected 1H and 13C chemical shifts. Compare with observed. Deviations > 0.3 ppm (1H) or > 5 ppm (13C) warrant re-examination
4. **Verify all correlations**: Confirm every observed COSY, HSQC, HMBC correlation explained by proposed structure. Unexplained cross-peaks = error or impurity
5. **Consider alternatives**: Multiple structures fit the data? List distinguishing experiments or correlations that would resolve ambiguity
6. **Assign stereochemistry**: Use NOE data, J-value analysis (Karplus relationship for dihedral angles), known conformational preferences to assign relative and, where possible, absolute stereochemistry

**Got:** Single best-fit structural proposal with all NMR data accounted for, or ranked list of candidates with plan to distinguish them.

**If fail:** No single structure accounts for all data? Check for: mixture of compounds (extra peaks with non-integer integration ratios), dynamic processes (broad peaks from conformational exchange), paramagnetic impurities (anomalous broadening). Re-examine molecular formula if multiple structures remain equally viable.

## Checks

- [ ] All solvent and reference peaks identified and excluded from interpretation
- [ ] Every 1H signal assigned chemical shift region, multiplicity, J-value, integration
- [ ] Coupling constants reciprocal (matched between coupling partners)
- [ ] 13C signals classified by DEPT multiplicity and chemical shift region
- [ ] Degree of unsaturation calculated and consistent with proposed structure
- [ ] 2D correlations (COSY, HSQC, HMBC) all explained by structural proposal
- [ ] Proposed structure matches molecular formula exactly
- [ ] Back-predicted chemical shifts agree with observed values within tolerance
- [ ] Stereochemistry addressed using NOE and/or J-value analysis where applicable

## Pitfalls

- **Ignoring solvent peaks**: Common solvents make signals overlapping analyte peaks. Always identify and exclude solvent residuals, water, grease peaks before interpretation.
- **Forcing first-order analysis on second-order patterns**: Strongly coupled nuclei (small chemical shift difference relative to J) make distorted multiplets not interpretable with simple n+1 rules. Recognize roof effects and non-binomial intensity patterns as indicators.
- **Overlooking exchangeable protons**: OH and NH signals may be broad, shifted by concentration/temperature, or absent in protic solvents. D2O shake experiment clarifies which signals exchangeable.
- **Assuming all 13C peaks visible**: Quaternary carbons have long relaxation times and low intensity. May be absent from short-acquisition spectra. HMBC correlations often only way to detect them.
- **Misinterpret HMBC artifacts**: HMBC spectra can show one-bond artifacts (misassigned as long-range correlations) and weak four-bond correlations. Cross-check with HSQC to filter out one-bond leakthrough.
- **Neglect symmetry**: Observed number of 13C peaks fewer than molecular formula predicts? Molecule likely has symmetry element. Account for this before proposing structure.

## See Also

- `interpret-ir-spectrum` — identify functional groups to constrain NMR-based structure proposals
- `interpret-mass-spectrum` — determine molecular formula and fragmentation for cross-validation
- `interpret-uv-vis-spectrum` — characterize chromophores and conjugation extent
- `interpret-raman-spectrum` — complementary vibrational data for symmetric modes
- `plan-spectroscopic-analysis` — select and sequence spectroscopic techniques before data acquisition
