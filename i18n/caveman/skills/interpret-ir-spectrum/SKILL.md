---
name: interpret-ir-spectrum
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
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

Read IR absorption spectra. Identify functional groups. Check hydrogen bonding. Compile inventory of structural features in sample.

## When Use

- Identify functional groups in unknown compound as first screen
- Confirm presence or absence of specific functional groups (e.g., verify reaction turned alcohol to ketone)
- Monitor reaction progress by tracking appearance/disappearance of characteristic absorptions
- Distinguish between similar compounds differing in functional group content
- Complement NMR + mass spec data with vibrational info

## Inputs

- **Required**: IR spectrum data (absorption frequencies in cm-1 with intensities, as %Transmittance or Absorbance plot)
- **Required**: Sample prep method (KBr pellet, ATR, Nujol mull, thin film, solution cell)
- **Optional**: Molecular formula or expected compound class
- **Optional**: Known structural fragments from other spectroscopic data
- **Optional**: Instrument parameters (resolution, scan range, detector type)

## Steps

### Step 1: Check Spectrum Quality and Format

Verify spectrum suitable for interpretation before analyzing peaks:

1. **Check y-axis format**: %Transmittance (%T, peaks point down) or Absorbance (A, peaks point up)? All analysis assumes consistent convention
2. **Verify wavenumber range**: Covers at least 4000-400 cm-1 for standard mid-IR? Note any truncation
3. **Assess baseline**: Good baseline relatively flat, near 100%T (or 0 Absorbance) in regions with no absorption. Sloping or noisy baselines cut reliability
4. **Check resolution**: Adjacent peaks closer than instrumental resolution cannot be distinguished. Typical FTIR resolution = 4 cm-1
5. **Identify prep artifacts**: KBr pellets may show broad O-H band from moisture (~3400 cm-1). Nujol mulls obscure C-H stretches. ATR spectra show intensity distortion at low wavenumbers. Note any artifacts limiting interpretation

**Got:** Spectrum confirmed suitable. Format, range, artifacts documented.

**If fail:** Severe baseline problems, saturation (flat-bottomed peaks from too-concentrated samples), or prep artifacts obscuring critical regions? Note limitation. Flag affected spectral regions unreliable.

### Step 2: Scan Diagnostic Region (4000-1500 cm-1)

Systematic analysis of high-frequency region where most functional groups make characteristic absorptions:

1. **O-H stretches (3200-3600 cm-1)**: Look for broad absorptions. Sharp peak near 3600 cm-1 = free O-H. Broad band centered at 3200-3400 cm-1 = hydrogen-bonded O-H (alcohols, carboxylic acids, water)
2. **N-H stretches (3300-3500 cm-1)**: Primary amines show two peaks (symmetric + asymmetric). Secondary amines show one. Typically sharper than O-H bands
3. **C-H stretches (2800-3300 cm-1)**:

| Frequency (cm-1) | Assignment |
|-------------------|------------|
| 3300 | sp C-H (alkyne, sharp) |
| 3000--3100 | sp2 C-H (aromatic, vinyl) |
| 2850--3000 | sp3 C-H (alkyl, multiple peaks) |
| 2700--2850 | Aldehyde C-H (two peaks from Fermi resonance) |

4. **Triple-bond region (2000-2300 cm-1)**:

| Frequency (cm-1) | Assignment | Notes |
|-------------------|------------|-------|
| 2100--2260 | C triple-bond C | Weak or absent if symmetric |
| 2200--2260 | C triple-bond N | Medium to strong |
| ~2350 | CO2 | Atmospheric artifact, disregard |

5. **Carbonyl region (1650-1800 cm-1)** — most diagnostic single region in IR:

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

6. **C=C and C=N stretches (1600-1680 cm-1)**: Alkene C=C = 1620-1680 cm-1 (weak to medium). Aromatic C=C = multiple peaks near 1450-1600 cm-1. C=N (imine) = 1620-1660 cm-1

**Got:** All absorptions in diagnostic region identified, with functional group assignments and confidence levels (strong, tentative, absent).

**If fail:** Carbonyl region obscured (e.g., water absorption in KBr, atmospheric CO2)? Note gap. Expected functional group absorption absent? Confirm with second prep method before concluding truly absent.

### Step 3: Analyze Fingerprint Region (1500-400 cm-1)

Examine lower-frequency region for confirmatory and structural detail:

1. **C-O stretches (1000-1300 cm-1)**: Ethers, esters, alcohols, carboxylic acids make strong C-O stretching. Esters show characteristic strong band near 1000-1100 cm-1 in addition to carbonyl
2. **C-N stretches (1000-1250 cm-1)**: Amines and amides. Overlap with C-O makes assignment tentative without other evidence
3. **C-F, C-Cl, C-Br stretches**:

| Frequency (cm-1) | Assignment |
|-------------------|------------|
| 1000--1400 | C-F (strong) |
| 600--800 | C-Cl |
| 500--680 | C-Br |

4. **Aromatic substitution pattern (700-900 cm-1)**: Out-of-plane C-H bending reveals substitution:

| Frequency (cm-1) | Pattern |
|-------------------|---------|
| 730--770 | Mono-substituted (+ 690--710) |
| 735--770 | Ortho-disubstituted |
| 750--810, 860--900 | Meta-disubstituted |
| 790--840 | Para-disubstituted |

5. **Overall fingerprint compare**: Fingerprint region unique to each compound. Reference spectrum available? Overlay and compare this region for identity confirmation

**Got:** Confirmatory assignments for functional groups from Step 2, plus additional structural detail (substitution patterns, C-O/C-N assignments).

**If fail:** Fingerprint region inherently complex and overlapping. Assignments ambiguous? Flag as tentative. Rely on diagnostic region and other spectroscopic data for final conclusions.

### Step 4: Assess Hydrogen Bonding and Intermolecular Effects

Evaluate how sample state and intermolecular interactions affect spectrum:

1. **Hydrogen bonding broadening**: Compare width and position of O-H and N-H bands. Free O-H sharp, near 3600 cm-1. Hydrogen-bonded O-H broad, shifted to 3200-3400 cm-1. Carboxylic acid dimers show very broad O-H from 2500-3300 cm-1
2. **Concentration and state effects**: Solution spectra at different concentrations distinguish intramolecular (concentration-independent) from intermolecular (concentration-dependent) hydrogen bonds
3. **Fermi resonance**: Two overlapping bands interact to split into doublet. Classic example: aldehyde C-H pair near 2720 and 2820 cm-1. Recognize Fermi resonance to avoid misassigning extra peaks as separate functional groups
4. **Solid-state effects**: KBr pellets and Nujol mulls reflect solid-state packing. Broadens bands. Shifts frequencies 10-20 cm-1 relative to solution spectra. ATR spectra closest to neat liquid state

**Got:** Hydrogen bonding state characterized. Prep-method artifacts accounted for. Any anomalous band shapes explained.

**If fail:** Hydrogen bonding effects cannot be resolved (e.g., overlapping O-H and N-H bands)? Note ambiguity. D2O exchange experiment or variable-temperature study can help, but need additional data.

### Step 5: Compile Functional Group Inventory

Assemble findings into structured report:

1. **List confirmed functional groups**: Strong, unambiguous absorptions in diagnostic region (e.g., sharp C=O at 1715 cm-1 = ketone or aldehyde)
2. **List tentative assignments**: Weaker evidence or overlapping absorptions that could be explained by more than one functional group
3. **List absent functional groups**: Characteristic strong absorptions clearly missing (e.g., no broad O-H band = no free alcohol or carboxylic acid)
4. **Note discrepancies**: Absorptions not fitting proposed functional group set, or expected absorptions missing
5. **Cross-reference**: Compare IR-derived inventory with info from other techniques (NMR, MS, UV-Vis) if available

**Got:** Complete functional group inventory by confidence level, with specific frequencies and intensities cited as evidence for each assignment.

**If fail:** Inventory incomplete or contradictory? Identify which additional experiments (ATR vs. KBr compare, variable concentration, D2O exchange) would resolve ambiguities.

## Checks

- [ ] Spectrum quality assessed (baseline, resolution, artifacts, y-axis format)
- [ ] Solvent, prep-method, atmospheric artifacts identified and excluded
- [ ] All absorptions in diagnostic region (4000-1500 cm-1) assigned or flagged
- [ ] Carbonyl region analyzed with specific sub-type assignment where possible
- [ ] Fingerprint region examined for confirmatory evidence
- [ ] Hydrogen bonding effects evaluated, influence on peak shape/position documented
- [ ] Functional group inventory compiled with confidence levels
- [ ] Absent functional groups explicitly noted (negative evidence informative)
- [ ] Assignments cross-referenced with other available spectroscopic data

## Pitfalls

- **Ignoring prep artifacts**: KBr moisture (broad 3400 cm-1), Nujol C-H (2850-2950 cm-1), ATR intensity distortion at low wavenumbers all mimic or obscure real absorptions. Always consider prep method.
- **Over-interpret fingerprint region**: Region below 1500 cm-1 complex and overlapping. Use for confirmation, not primary ID. Avoid assigning every peak.
- **Confuse atmospheric CO2 with sample peaks**: Sharp doublet near 2350 cm-1 almost always atmospheric CO2, not sample absorption. Background subtraction should remove, but verify.
- **Neglect band intensity and width**: Strong broad absorption differs from weak sharp peak at same frequency in diagnostic value. Report intensity (strong/medium/weak) and shape (sharp/broad) alongside frequency.
- **Single-peak assignments**: Never identify functional group from single absorption alone. Carbonyl groups should be supported by additional bands (C-O for esters, N-H for amides, C-H for aldehydes).
- **Assume absence from weak absorption**: Some functional groups make inherently weak IR absorptions (symmetric C=C, triple bonds in symmetric alkynes). Absence of peak does not always mean absence of group.

## See Also

- `interpret-nmr-spectrum` — determine detailed connectivity and hydrogen environments
- `interpret-mass-spectrum` — establish molecular formula and fragmentation pattern
- `interpret-uv-vis-spectrum` — characterize chromophores complementing IR functional group data
- `interpret-raman-spectrum` — complementary vibrational data for IR-inactive modes
- `plan-spectroscopic-analysis` — select and sequence spectroscopic techniques before data acquisition
