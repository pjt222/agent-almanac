---
name: interpret-ir-spectrum
description: >
  Systematically interpret infrared spectra to identify functional groups
  present in a sample. Covers diagnostic region analysis (4000-1500 cm-1),
  fingerprint region assessment (1500-400 cm-1), hydrogen bonding effects,
  and compilation of a functional group inventory with confidence levels.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: spectroscopy
  complexity: intermediate
  language: natural
  tags: spectroscopy, ir, infrared, functional-groups, absorption
---

# Interpret IR Spectrum

Analyze infrared absorption spectra to identify functional groups, assess hydrogen bonding, and compile a comprehensive inventory of structural features present in the sample.

## When to Use

- Identifying functional groups in an unknown compound as a first screening step
- Confirming the presence or absence of specific functional groups (e.g., verifying a reaction converted an alcohol to a ketone)
- Monitoring reaction progress by tracking the appearance or disappearance of characteristic absorptions
- Distinguishing between similar compounds that differ in functional group content
- Complementing NMR and mass spectrometry data with vibrational information

## Inputs

- **Required**: IR spectrum data (absorption frequencies in cm-1 with intensities, either as %Transmittance or Absorbance plot)
- **Required**: Sample preparation method (KBr pellet, ATR, Nujol mull, thin film, solution cell)
- **Optional**: Molecular formula or expected compound class
- **Optional**: Known structural fragments from other spectroscopic data
- **Optional**: Instrument parameters (resolution, scan range, detector type)

## Procedure

### Step 1: Establish Spectrum Quality and Format

Verify that the spectrum is suitable for interpretation before analyzing peaks:

1. **Check y-axis format**: Determine whether the spectrum is plotted in %Transmittance (%T, peaks point down) or Absorbance (A, peaks point up). All subsequent analysis assumes consistent convention.
2. **Verify wavenumber range**: Confirm the spectrum covers at least 4000--400 cm-1 for a standard mid-IR analysis. Note any truncation.
3. **Assess baseline**: A good baseline should be relatively flat and near 100%T (or 0 Absorbance) in regions with no absorption. Sloping or noisy baselines reduce reliability.
4. **Check resolution**: Adjacent peaks separated by less than the instrumental resolution cannot be distinguished. Typical FTIR resolution is 4 cm-1.
5. **Identify preparation artifacts**: KBr pellets may show a broad O-H band from absorbed moisture (~3400 cm-1). Nujol mulls obscure C-H stretches. ATR spectra show intensity distortion at low wavenumbers. Note any artifacts that limit interpretation.

**Expected:** Spectrum confirmed as suitable for analysis, with format, range, and artifacts documented.

**On failure:** If the spectrum has severe baseline problems, saturation (flat-bottomed peaks from too-concentrated samples), or preparation artifacts obscuring critical regions, note the limitation and flag affected spectral regions as unreliable.

### Step 2: Scan the Diagnostic Region (4000--1500 cm-1)

Systematically analyze the high-frequency region where most functional groups produce characteristic absorptions:

1. **O-H stretches (3200--3600 cm-1)**: Look for broad absorptions. A sharp peak near 3600 cm-1 indicates free O-H; a broad band centered at 3200--3400 cm-1 indicates hydrogen-bonded O-H (alcohols, carboxylic acids, water).
2. **N-H stretches (3300--3500 cm-1)**: Primary amines show two peaks (symmetric and asymmetric stretch); secondary amines show one peak. These are typically sharper than O-H bands.
3. **C-H stretches (2800--3300 cm-1)**:

| Frequency (cm-1) | Assignment |
|-------------------|------------|
| 3300 | sp C-H (alkyne, sharp) |
| 3000--3100 | sp2 C-H (aromatic, vinyl) |
| 2850--3000 | sp3 C-H (alkyl, multiple peaks) |
| 2700--2850 | Aldehyde C-H (two peaks from Fermi resonance) |

4. **Triple-bond region (2000--2300 cm-1)**:

| Frequency (cm-1) | Assignment | Notes |
|-------------------|------------|-------|
| 2100--2260 | C triple-bond C | Weak or absent if symmetric |
| 2200--2260 | C triple-bond N | Medium to strong |
| ~2350 | CO2 | Atmospheric artifact, disregard |

5. **Carbonyl region (1650--1800 cm-1)** -- the most diagnostic single region in IR:

| Frequency (cm-1) | Assignment |
|-------------------|------------|
| 1800--1830, 1740--1770 | Acid anhydride (two C=O stretches) |
| 1770--1780 | Acid chloride |
| 1735--1750 | Ester |
| 1700--1725 | Carboxylic acid |
| 1705--1720 | Aldehyde |
| 1705--1720 | Ketone |
| 1680--1700 | Conjugated ketone / alpha-beta unsaturated |
| 1630--1690 | Amide (amide I band) |

6. **C=C and C=N stretches (1600--1680 cm-1)**: Alkene C=C appears at 1620--1680 cm-1 (weak to medium). Aromatic C=C shows multiple peaks near 1450--1600 cm-1. C=N (imine) appears at 1620--1660 cm-1.

**Expected:** All absorptions in the diagnostic region identified, with functional group assignments and confidence levels (strong, tentative, absent).

**On failure:** If the carbonyl region is obscured (e.g., water absorption in KBr, atmospheric CO2), note the gap. If an expected functional group absorption is absent, confirm with a second preparation method before concluding it is truly absent.

### Step 3: Analyze the Fingerprint Region (1500--400 cm-1)

Examine the lower-frequency region for confirmatory and structural detail:

1. **C-O stretches (1000--1300 cm-1)**: Ethers, esters, alcohols, and carboxylic acids produce strong C-O stretching absorptions. Esters show a characteristic strong band near 1000--1100 cm-1 in addition to the carbonyl.
2. **C-N stretches (1000--1250 cm-1)**: Amines and amides; overlap with C-O makes assignment tentative without other evidence.
3. **C-F, C-Cl, C-Br stretches**:

| Frequency (cm-1) | Assignment |
|-------------------|------------|
| 1000--1400 | C-F (strong) |
| 600--800 | C-Cl |
| 500--680 | C-Br |

4. **Aromatic substitution pattern (700--900 cm-1)**: Out-of-plane C-H bending reveals substitution:

| Frequency (cm-1) | Pattern |
|-------------------|---------|
| 730--770 | Mono-substituted (+ 690--710) |
| 735--770 | Ortho-disubstituted |
| 750--810, 860--900 | Meta-disubstituted |
| 790--840 | Para-disubstituted |

5. **Overall fingerprint comparison**: The fingerprint region is unique to each compound. If a reference spectrum is available, overlay and compare this region for identity confirmation.

**Expected:** Confirmatory assignments for functional groups identified in Step 2, plus additional structural detail (substitution patterns, C-O/C-N assignments).

**On failure:** The fingerprint region is inherently complex and overlapping. If assignments are ambiguous, flag them as tentative and rely on the diagnostic region and other spectroscopic data for final conclusions.

### Step 4: Assess Hydrogen Bonding and Intermolecular Effects

Evaluate how sample state and intermolecular interactions affect the spectrum:

1. **Hydrogen bonding broadening**: Compare the width and position of O-H and N-H bands. Free O-H is sharp and near 3600 cm-1; hydrogen-bonded O-H is broad and shifted to 3200--3400 cm-1. Carboxylic acid dimers show a very broad O-H from 2500--3300 cm-1.
2. **Concentration and state effects**: Solution spectra at different concentrations can distinguish intramolecular (concentration-independent) from intermolecular (concentration-dependent) hydrogen bonds.
3. **Fermi resonance**: Two overlapping bands can interact to split into a doublet. The classic example is the aldehyde C-H pair near 2720 and 2820 cm-1. Recognize Fermi resonance to avoid misassigning extra peaks as separate functional groups.
4. **Solid-state effects**: KBr pellets and Nujol mulls reflect solid-state packing, which broadens bands and can shift frequencies by 10--20 cm-1 relative to solution spectra. ATR spectra are closest to the neat liquid state.

**Expected:** Hydrogen bonding state characterized, preparation-method artifacts accounted for, and any anomalous band shapes explained.

**On failure:** If hydrogen bonding effects cannot be resolved (e.g., overlapping O-H and N-H bands), note the ambiguity. A D2O exchange experiment or variable-temperature study can help, but these require additional data.

### Step 5: Compile Functional Group Inventory

Assemble all findings into a structured report:

1. **List confirmed functional groups**: Groups with strong, unambiguous absorptions in the diagnostic region (e.g., sharp C=O at 1715 cm-1 = ketone or aldehyde).
2. **List tentative assignments**: Groups with weaker evidence or overlapping absorptions that could be explained by more than one functional group.
3. **List absent functional groups**: Groups whose characteristic strong absorptions are clearly missing from the spectrum (e.g., no broad O-H band means no free alcohol or carboxylic acid).
4. **Note discrepancies**: Any absorptions that do not fit the proposed functional group set, or expected absorptions that are missing.
5. **Cross-reference**: Compare the IR-derived functional group inventory with information from other techniques (NMR, MS, UV-Vis) if available.

**Expected:** A complete functional group inventory categorized by confidence level, with specific frequencies and intensities cited as evidence for each assignment.

**On failure:** If the inventory is incomplete or contradictory, identify which additional experiments (ATR vs. KBr comparison, variable concentration, D2O exchange) would resolve the ambiguities.

## Validation

- [ ] Spectrum quality assessed (baseline, resolution, artifacts, y-axis format)
- [ ] Solvent, preparation-method, and atmospheric artifacts identified and excluded
- [ ] All absorptions in the diagnostic region (4000--1500 cm-1) assigned or flagged
- [ ] Carbonyl region analyzed with specific sub-type assignment where possible
- [ ] Fingerprint region examined for confirmatory evidence
- [ ] Hydrogen bonding effects evaluated and their influence on peak shape/position documented
- [ ] Functional group inventory compiled with confidence levels
- [ ] Absent functional groups explicitly noted (negative evidence is informative)
- [ ] Assignments cross-referenced with other available spectroscopic data

## Common Pitfalls

- **Ignoring preparation artifacts**: KBr moisture (broad 3400 cm-1), Nujol C-H (2850--2950 cm-1), and ATR intensity distortion at low wavenumbers all mimic or obscure real sample absorptions. Always consider the preparation method.
- **Over-interpreting the fingerprint region**: The region below 1500 cm-1 is complex and overlapping. Use it for confirmation, not primary identification. Avoid assigning every peak.
- **Confusing atmospheric CO2 with sample peaks**: The sharp doublet near 2350 cm-1 is almost always atmospheric CO2, not a sample absorption. Background subtraction should remove it, but verify.
- **Neglecting band intensity and width**: A strong, broad absorption has different diagnostic value than a weak, sharp peak at the same frequency. Report intensity (strong/medium/weak) and shape (sharp/broad) alongside frequency.
- **Single-peak assignments**: Never identify a functional group from a single absorption alone. Carbonyl groups, for example, should be supported by additional bands (C-O for esters, N-H for amides, C-H for aldehydes).
- **Assuming absence from weak absorption**: Some functional groups produce inherently weak IR absorptions (symmetric C=C, triple bonds in symmetric alkynes). Absence of a peak does not always mean absence of the group.

## Related Skills

- `interpret-nmr-spectrum` -- determine detailed connectivity and hydrogen environments
- `interpret-mass-spectrum` -- establish molecular formula and fragmentation pattern
- `interpret-uv-vis-spectrum` -- characterize chromophores complementing IR functional group data
- `interpret-raman-spectrum` -- obtain complementary vibrational data for IR-inactive modes
- `plan-spectroscopic-analysis` -- select and sequence spectroscopic techniques before data acquisition
