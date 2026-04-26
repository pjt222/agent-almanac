---
name: interpret-mass-spectrum
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Systematically interpret mass spectra to determine molecular formula,
  identify fragmentation pathways, and propose molecular structures. Covers
  ionization method assessment, molecular ion identification, isotope pattern
  analysis, common fragmentation losses, and purity evaluation.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: spectroscopy
  complexity: advanced
  language: natural
  tags: spectroscopy, mass-spectrometry, fragmentation, molecular-ion, isotope
---

# Interpret Mass Spectrum

Read mass spectra from any common ionization method. Determine molecular ion, molecular formula, fragmentation pathways, structural features of analyte.

## When Use

- Determine molecular weight and formula of unknown compound
- Confirm identity of synthetic product by molecular ion + fragmentation
- Identify impurities or degradation products in sample
- Propose structural features from characteristic fragmentation losses
- Analyze isotope patterns to detect halogens, sulfur, metals

## Inputs

- **Required**: Mass spectrum data (m/z values with relative intensities, at minimum full scan spectrum)
- **Required**: Ionization method used (EI, ESI, MALDI, CI, APCI, APPI)
- **Optional**: High-resolution mass data (exact mass, measured vs. calculated)
- **Optional**: Molecular formula from other sources (elemental analysis, NMR)
- **Optional**: Tandem MS/MS data (fragmentation of selected precursor ions)
- **Optional**: Chromatographic context (LC-MS or GC-MS retention time, purity)

## Steps

### Step 1: Identify Ionization Method and Expected Ion Types

Determine what species spectrum contains before assigning peaks:

1. **Classify ionization method**:

| Method | Energy | Primary Ion | Fragmentation | Typical Use |
|--------|--------|-------------|---------------|-------------|
| EI (70 eV) | Hard | M+. (radical cation) | Extensive | Small volatile molecules, GC-MS |
| CI | Soft | [M+H]+, [M+NH4]+ | Minimal | Molecular weight confirmation |
| ESI | Soft | [M+H]+, [M+Na]+, [M-H]- | Minimal | Polar, biomolecules, LC-MS |
| MALDI | Soft | [M+H]+, [M+Na]+, [M+K]+ | Minimal | Large molecules, polymers, proteins |
| APCI | Soft | [M+H]+, [M-H]- | Some | Medium polarity, LC-MS |

2. **Note polarity mode**: Positive mode makes cations. Negative mode makes anions. ESI commonly uses both
3. **Check for adducts and clusters**: Soft ionization often makes [M+Na]+ (M+23), [M+K]+ (M+39), [2M+H]+, [2M+Na]+ in addition to [M+H]+. Identify these before assigning molecular ion
4. **Identify multiply charged ions**: In ESI, multiply charged ions at m/z = (M + nH) / n. Look for peaks separated by fractional m/z values (e.g., 0.5 Da spacing = z=2)

**Got:** Ionization method documented. Expected ion types listed. Adducts/clusters identified so true molecular ion can be determined.

**If fail:** Ionization method unknown? Examine spectrum for clues: extensive fragmentation = EI, adduct patterns = ESI, matrix peaks = MALDI. Consult instrument log if available.

### Step 2: Determine Molecular Ion and Molecular Formula

Identify molecular ion peak, derive molecular formula:

1. **Locate molecular ion (M)**: In EI, M+. is highest m/z peak with reasonable isotope pattern (may be weak or absent for labile compounds). In soft ionization, identify [M+H]+ or [M+Na]+ and subtract adduct to get M
2. **Apply nitrogen rule**: Odd molecular weight = odd number of nitrogen atoms. Even molecular weight = zero or even number of nitrogens
3. **Calculate degrees of unsaturation (DBE)**: DBE = (2C + 2 + N - H - X) / 2, where X = halogens. Each ring or pi bond = 1 DBE. Benzene = 4 DBE, carbonyl = 1 DBE
4. **Use high-resolution data**: Exact mass available? Calculate molecular formula using mass defect. Compare measured mass with all candidate formulas within mass accuracy window (typically < 5 ppm for modern instruments)
5. **Cross-check with isotope pattern**: Observed isotope pattern must match proposed molecular formula (see Step 3)

**Got:** Molecular ion identified. Molecular weight determined. Nitrogen rule applied. Molecular formula proposed (confirmed by HRMS if available).

**If fail:** No molecular ion visible in EI (common for thermally labile or highly branched compounds)? Try softer ionization. Molecular ion ambiguous? Check for loss of common small fragments from highest m/z peak (e.g., M-1, M-15, M-18 can help identify M).

### Step 3: Analyze Isotope Patterns

Use isotopic signatures to detect specific elements:

1. **Monoisotopic elements**: H, C, N, O, F, P, I have characteristic natural abundance patterns. For molecules containing only C, H, N, O, M+1 peak = approximately 1.1% per carbon
2. **Halogen patterns**:

| Element | Isotopes | M : M+2 Ratio | Visual Pattern |
|---------|----------|----------------|----------------|
| 35Cl / 37Cl | 35, 37 | 3 : 1 | Doublet, 2 Da apart |
| 79Br / 81Br | 79, 81 | 1 : 1 | Equal doublet, 2 Da apart |
| 2 Cl | -- | 9 : 6 : 1 | Triplet |
| 2 Br | -- | 1 : 2 : 1 | Triplet |
| 1 Cl + 1 Br | -- | 3 : 4 : 1 | Characteristic quartet-like |

3. **Sulfur detection**: 34S contributes 4.4% at M+2. M+2 peak of approximately 4-5% relative to M (after correcting for 13C2 contribution) = one sulfur atom
4. **Silicon detection**: 29Si (5.1%) and 30Si (3.4%) make distinctive M+1 and M+2 contributions
5. **Compare with calculated patterns**: Use proposed molecular formula to calculate theoretical isotope pattern. Overlay with observed pattern to confirm or refute formula

**Got:** Isotope pattern analyzed. Presence or absence of Cl, Br, S, Si determined. Pattern consistent with proposed molecular formula.

**If fail:** Isotope resolution insufficient (low-resolution instrument)? M+2 pattern may be unresolvable. Note limitation. Rely on exact mass and other spectroscopic data for elemental composition.

### Step 4: Identify Fragmentation Losses and Key Fragment Ions

Map fragmentation pathways to extract structural info:

1. **Catalog major fragments**: List all peaks above 5-10% relative intensity with m/z values
2. **Calculate neutral losses from molecular ion**:

| Loss (Da) | Neutral Lost | Structural Implication |
|-----------|-------------|----------------------|
| 1 | H. | Labile hydrogen |
| 15 | CH3. | Methyl group |
| 17 | OH. | Hydroxyl |
| 18 | H2O | Alcohol, carboxylic acid |
| 27 | HCN | Nitrogen heterocycle, amine |
| 28 | CO or C2H4 | Carbonyl or ethyl |
| 29 | CHO. or C2H5. | Aldehyde or ethyl |
| 31 | OCH3. or CH2OH. | Methoxy or hydroxymethyl |
| 32 | CH3OH | Methyl ester |
| 35/36 | Cl./HCl | Chlorinated compound |
| 44 | CO2 | Carboxylic acid, ester |
| 45 | OC2H5. | Ethoxy |
| 46 | NO2. | Nitro compound |

3. **Identify characteristic fragment ions**:

| m/z | Ion | Origin |
|-----|-----|--------|
| 77 | C6H5+ | Phenyl cation |
| 91 | C7H7+ | Tropylium (benzyl rearrangement) |
| 105 | C6H5CO+ | Benzoyl cation |
| 43 | CH3CO+ or C3H7+ | Acetyl or propyl |
| 57 | C4H9+ or C3H5O+ | tert-Butyl or acrolein |
| 149 | Phthalate fragment | Plasticizer contaminant |

4. **Map fragmentation pathways**: Connect fragment ions by successive losses. Build fragmentation tree from M down to low-mass fragments
5. **Identify rearrangement ions**: McLafferty rearrangement (gamma-hydrogen transfer with beta-cleavage) makes even-electron ions from carbonyl-containing compounds. Retro-Diels-Alder fragmentation characteristic of cyclohexene systems

**Got:** All major fragment ions assigned. Neutral losses calculated and correlated with structural features. Fragmentation tree built.

**If fail:** Fragments do not correspond to simple losses from molecular ion? Consider rearrangement processes. Unassigned fragments may indicate unexpected functional groups, impurities, matrix/background peaks.

### Step 5: Assess Purity and Propose Structure

Evaluate overall spectrum for purity indicators. Assemble structural proposal:

1. **Purity check**: In GC-MS or LC-MS, examine chromatogram for additional peaks. In direct-infusion MS, look for unexpected ions not fragments of or adducts with main analyte
2. **Background and contaminant peaks**: Common contaminants: phthalate plasticizers (m/z 149, 167, 279), column bleed (siloxanes at m/z 207, 281, 355, 429 in GC-MS), solvent clusters
3. **Structural proposal**: Combine molecular formula (Step 2), isotope pattern (Step 3), fragmentation (Step 4) to propose structure or set of candidate structures
4. **Rank candidates**: Use fragmentation tree to rank structural candidates. Best structure explains most fragment ions with fewest ad hoc assumptions
5. **Cross-validate**: Compare proposed structure with data from other techniques (NMR, IR, UV-Vis). Mass spectrum alone rarely gives unambiguous structure for novel compounds

**Got:** Purity assessed. Contaminants identified if present. Structural proposal (or ranked candidate list) consistent with all MS data and cross-validated where possible.

**If fail:** Spectrum appears to contain multiple components and chromatographic separation not used? Flag mixture. Recommend LC-MS or GC-MS reanalysis. No satisfactory structural proposal emerges? Identify which additional data (HRMS, MS/MS, NMR) would resolve ambiguity.

## Checks

- [ ] Ionization method identified. Expected ion types documented
- [ ] Molecular ion located and distinguished from adducts, fragments, clusters
- [ ] Nitrogen rule applied and consistent with proposed formula
- [ ] Degrees of unsaturation calculated and accounted for in structure
- [ ] Isotope pattern matches proposed molecular formula
- [ ] Major fragment ions assigned with neutral losses and structural rationale
- [ ] Fragmentation tree built from molecular ion to low-mass fragments
- [ ] Common contaminant and background peaks identified and excluded
- [ ] Structural proposal cross-validated with other spectroscopic data

## Pitfalls

- **Misidentify molecular ion**: In EI, base peak often a fragment, not molecular ion. Molecular ion = highest m/z peak with chemically reasonable isotope pattern. Adduct ions in ESI ([M+Na]+, [2M+H]+) also mistaken for molecular ion.
- **Ignore nitrogen rule**: Odd-mass molecular ion requires odd number of nitrogens. Forgetting this → impossible molecular formulas.
- **Confuse isobaric losses**: Loss of 28 Da could be CO or C2H4. Loss of 29 could be CHO or C2H5. High-resolution MS or additional fragmentation data needed to distinguish isobaric losses.
- **Neglect multiply charged ions**: In ESI, doubly or triply charged ions at half or one-third expected m/z. Look for non-integer spacing between isotope peaks as diagnostic for multiple charges.
- **Over-interpret low-abundance peaks**: Peaks below 1-2% relative intensity may be noise, isotope contributions, minor contaminants rather than meaningful fragments.
- **Assume pure sample**: Many real-world spectra are mixtures. Always check chromatographic purity. Look for ions inconsistent with proposed structure.

## See Also

- `interpret-nmr-spectrum` — determine connectivity and hydrogen environments for structural confirmation
- `interpret-ir-spectrum` — identify functional groups that explain observed fragmentation
- `interpret-uv-vis-spectrum` — characterize chromophores in analyte
- `interpret-raman-spectrum` — complementary vibrational analysis
- `plan-spectroscopic-analysis` — select and sequence analytical techniques before data acquisition
- `interpret-chromatogram` — analyze GC or LC chromatographic data coupled with MS
