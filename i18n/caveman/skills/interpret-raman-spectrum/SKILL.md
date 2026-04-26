---
name: interpret-raman-spectrum
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Systematically interpret Raman spectra to identify molecular vibrations,
  assess polarizability-driven selection rules, compare with complementary
  IR data, and evaluate depolarization ratios for symmetry assignment. Covers
  Raman-active mode identification, fluorescence interference mitigation,
  and reference spectrum matching.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: spectroscopy
  complexity: intermediate
  language: natural
  tags: spectroscopy, raman, polarizability, vibrational, complementary-ir
---

# Interpret Raman Spectrum

Read Raman scattering spectra. Identify molecular vibrations. Apply selection rules complementary to IR absorption. Integrate Raman data with IR for comprehensive vibrational analysis.

## When Use

- Analyze samples difficult for IR (aqueous solutions, sealed containers, remote sensing)
- Identify symmetric vibrations weak or inactive in IR
- Complement IR data using mutual exclusion principle for centrosymmetric molecules
- Characterize carbon materials (graphene, carbon nanotubes, diamond) via characteristic Raman bands
- Analyze inorganic compounds, minerals, crystalline phases where Raman often more informative than IR
- Non-destructive, in situ analysis (no sample prep required for many Raman measurements)

## Inputs

- **Required**: Raman spectrum data (Raman shift in cm-1 vs. intensity)
- **Required**: Excitation laser wavelength (e.g., 532 nm, 633 nm, 785 nm, 1064 nm)
- **Optional**: IR spectrum of same sample for complementary analysis
- **Optional**: Polarization data (parallel and perpendicular spectra for depolarization ratios)
- **Optional**: Known molecular formula or compound class
- **Optional**: Sample physical state (solid, liquid, solution, gas, thin film)

## Steps

### Step 1: Assess Spectrum Quality and Identify Artifacts

Evaluate Raman spectrum for reliability before analyzing peaks:

1. **Laser wavelength and fluorescence**: Fluorescence = most common interference in Raman. Makes broad intense background that obscures Raman peaks. Shorter-wavelength lasers (532 nm) excite more fluorescence. Longer-wavelength lasers (785 nm, 1064 nm) reduce it at cost of weaker Raman signal (intensity scales as lambda^-4)
2. **Signal-to-noise ratio**: Raman peaks clearly distinguishable from noise? Weak Raman scatterers may need longer acquisition or higher laser power
3. **Cosmic ray spikes**: Sharp, narrow spikes at random positions = cosmic ray artifacts, not Raman peaks. Appear in only one spectrum of time-averaged set. Remove by spike filters
4. **Baseline correction**: Sloping or curved baseline (from fluorescence or thermal emission) should be subtracted before measuring peak positions and intensities
5. **Photodegradation**: High laser power can damage or transform sample. Check for spectral changes between successive acquisitions at same spot. Reduce power if degradation observed
6. **Spectral range**: Standard Raman spectra cover 100-4000 cm-1 Raman shift. Low-frequency cutoff depends on edge or notch filter used to block Rayleigh line. Note if any region truncated

**Got:** Spectrum quality assessed. Fluorescence level documented. Artifacts (cosmic rays, baseline drift) identified or corrected. Usable spectral range confirmed.

**If fail:** Fluorescence dominates spectrum (broad background >> Raman peaks)? Recommend re-measurement with longer-wavelength laser (785 or 1064 nm) or surface-enhanced Raman spectroscopy (SERS). Sample degrades? Reduce laser power or use rotating sample stage.

### Step 2: Identify Raman-Active Modes and Apply Selection Rules

Determine which vibrations are Raman-active and how they complement IR data:

1. **Raman selection rule**: Vibration Raman-active if it involves change in polarizability of molecule. Symmetric stretches (often change molecular volume) typically strong in Raman
2. **IR selection rule (for comparison)**: Vibration IR-active if involves change in dipole moment. Asymmetric stretches typically strong in IR
3. **Mutual exclusion principle**: For molecules with center of inversion (centrosymmetric), no vibration can be both Raman-active and IR-active. Band appears in both spectra? Molecule lacks center of symmetry
4. **General complementarity**: Even for non-centrosymmetric molecules, vibrations strong in Raman tend to be weak in IR, and vice versa. Complementarity makes combined Raman + IR dataset more informative than either alone
5. **Identify Raman-favored modes**: Symmetric stretches (C-C, C=C, S-S, N=N), breathing modes of rings, stretches of homonuclear bonds (no dipole change, IR-inactive) typically strong in Raman

**Got:** Selection rules applied. Raman-active vs. IR-active modes distinguished. Mutual exclusion tested if molecule centrosymmetric.

**If fail:** Molecular symmetry unknown? Use combined Raman and IR data to infer it. Band appears in both spectra with comparable intensity? Molecule not centrosymmetric.

### Step 3: Analyze Raman Shift Positions

Assign observed Raman bands to specific vibrational modes using characteristic frequencies:

1. **C-H stretching region (2800-3100 cm-1)**: Similar to IR, but Raman intensities differ. Aromatic and olefinic C-H (3000-3100 cm-1) often stronger in Raman than aliphatic C-H
2. **Triple bonds (2100-2260 cm-1)**: C triple-bond C symmetric stretch strong in Raman, often weak or absent in IR. C triple-bond N active in both
3. **Double bond stretches**:

| Shift (cm-1) | Assignment | Raman Intensity |
|---------------|------------|-----------------|
| 1600--1680 | C=C stretch | Strong |
| 1650--1800 | C=O stretch | Medium (weaker than IR) |
| 1500--1600 | Aromatic C=C | Medium to strong |

4. **Aromatic ring modes**:

| Shift (cm-1) | Assignment | Notes |
|---------------|------------|-------|
| 990--1010 | Ring breathing (monosubstituted) | Very strong, diagnostic |
| 1000 | Ring breathing (sym. trisubstituted) | Strong |
| 1580--1600 | Ring stretch | Medium |
| 3050--3070 | Aromatic C-H stretch | Medium |

5. **Other characteristic Raman bands**:

| Shift (cm-1) | Assignment |
|---------------|------------|
| 430--550 | S-S stretch (disulfide) |
| 570--705 | C-S stretch |
| 800--1100 | C-C skeletal stretch |
| 630--770 | C-Cl stretch |
| 500--680 | C-Br stretch |
| 200--400 | Metal-ligand stretch |

6. **Carbon materials**: G band (~1580 cm-1, graphitic sp2) and D band (~1350 cm-1, defect/disorder) diagnostic for carbon allotropes. 2D band (~2700 cm-1) characterizes graphene layer count. Diamond shows sharp peak at 1332 cm-1

**Got:** All significant Raman bands assigned to vibrational modes with reference to characteristic frequency ranges.

**If fail:** Band cannot be assigned from tables above? Consult spectral databases (RRUFF for minerals, SDBS for organics). Unassigned bands may belong to combination modes, overtones, lattice vibrations in crystalline samples.

### Step 4: Compare Raman with IR Data

Integrate two complementary vibrational techniques:

1. **Tabulate corresponding bands**: Create comparison table listing each vibrational mode with Raman shift, IR frequency, relative intensity in each technique
2. **Identify modes observed in only one technique**: Modes present in Raman but absent in IR (or vice versa) give symmetry info. Symmetric stretches of non-polar bonds (S-S, C=C in symmetric environments) appear only in Raman
3. **Resolve ambiguities**: IR assignments tentative (e.g., overlapping C-O and C-N stretches in fingerprint region)? Check whether Raman gives clearer picture due to different relative intensities
4. **Functional group confirmation**: Confirm IR-identified functional groups via Raman counterparts. Ester should show C=O in IR (~1735 cm-1) and C-O-C in Raman. Carboxylic acid should show broad O-H in IR and C=O in both techniques
5. **Assess overall consistency**: Raman and IR data should be mutually consistent. Any contradictions (e.g., band assigned as symmetric stretch appearing strong in both spectra for allegedly centrosymmetric molecule) = error in assignment or symmetry assumption

**Got:** Unified vibrational analysis table combining Raman and IR data. Functional group assignments confirmed or refined by complementary info.

**If fail:** IR data unavailable? Raman spectrum alone still gives useful info, with reduced certainty. Note which assignments would benefit from IR confirmation.

### Step 5: Evaluate Polarization Data and Document Results

Use depolarization ratios for symmetry assignment. Compile final analysis:

1. **Depolarization ratio (rho)**: rho = I_perpendicular / I_parallel, measured from polarized Raman experiments
   - **rho = 0 to 0.75**: Polarized band (rho < 0.75). Totally symmetric vibrations (A-type) polarized
   - **rho = 0.75**: Depolarized band. Non-totally-symmetric vibrations give rho = 0.75
2. **Symmetry assignment**: Polarized bands must belong to totally symmetric irreducible representation of molecular point group. Helps distinguish between modes of different symmetry at similar frequencies
3. **Compile results**: Assemble complete table of all observed Raman bands with:
   - Raman shift (cm-1)
   - Relative intensity (strong/medium/weak)
   - Depolarization ratio (if measured)
   - Assignment (vibrational mode)
   - Corresponding IR band (if observed)
4. **Compare with reference spectra**: Compound known? Compare observed Raman spectrum with published reference spectra (databases: RRUFF, SDBS, NIST). Agreement in peak positions within +/- 3 cm-1 and matching relative intensities confirms identity
5. **Report uncertainties**: Flag any assignments tentative. Note which additional experiments (temperature-dependent Raman, resonance Raman, SERS) could resolve ambiguities

**Got:** Complete Raman analysis with all bands assigned. Polarization data interpreted for symmetry. Results integrated with IR and other spectroscopic data.

**If fail:** Polarization data unavailable? Symmetry assignment relies on frequency and intensity patterns alone. Note limitation. Recommend polarized measurements if symmetry info critical.

## Checks

- [ ] Spectrum quality assessed (fluorescence, cosmic rays, baseline, photodegradation)
- [ ] Raman selection rules applied. Raman-active modes identified
- [ ] Mutual exclusion principle tested if molecule centrosymmetric
- [ ] All significant Raman bands assigned to vibrational modes
- [ ] Raman data compared and integrated with IR data where available
- [ ] Depolarization ratios interpreted for symmetry assignment (if polarization data available)
- [ ] Assignments consistent with known molecular structure or proposed structure from other techniques
- [ ] Results compared with reference spectra where possible

## Pitfalls

- **Fluorescence overwhelming Raman signal**: Single most common problem. Switch to longer-wavelength laser or use time-gated detection. Do not try to interpret broad fluorescent humps as Raman bands.
- **Confuse cosmic ray spikes with real peaks**: Cosmic rays make sharp, intense spikes at random positions. Present in single acquisitions but disappear in averaged spectra. Always check for reproducibility.
- **Neglect polarizability selection rule**: Modes strong in IR (asymmetric stretches of polar bonds) may be weak or absent in Raman, and vice versa. Do not expect same intensity pattern as IR.
- **Ignore sample degradation**: High laser power can char, polymerize, phase-transform sample. Spectrum changes between successive measurements at same spot = degradation.
- **Assume all Raman bands are fundamentals**: Overtones (2x fundamental frequency) and combination bands can appear in Raman spectra. Typically weaker than fundamentals but can cause confusion if not considered.
- **Overlook low-frequency modes**: Lattice vibrations, torsional modes, metal-ligand stretches appear below 400 cm-1. Many conventional Raman setups do not access this region. Verify instrument's notch/edge filter allows measurement in low-frequency range if these modes relevant.

## See Also

- `interpret-ir-spectrum` — complementary vibrational technique for dipole-active modes
- `interpret-nmr-spectrum` — determine molecular connectivity for complete structure assignment
- `interpret-mass-spectrum` — establish molecular formula and fragmentation
- `interpret-uv-vis-spectrum` — characterize electronic transitions and chromophores
- `plan-spectroscopic-analysis` — select and sequence analytical techniques before data acquisition
