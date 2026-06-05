---
name: interpret-mass-spectrum
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

Analyze mass spectra from any common ionization method to determine the molecular ion, molecular formula, fragmentation pathways, and structural features of the analyte.

## When to Use

- Determining the molecular weight and formula of an unknown compound
- Confirming the identity of a synthetic product by molecular ion and fragmentation
- Identifying impurities or degradation products in a sample
- Proposing structural features from characteristic fragmentation losses
- Analyzing isotope patterns to detect halogens, sulfur, or metals

## Inputs

- **Required**: Mass spectrum data (m/z values with relative intensities, at minimum the full scan spectrum)
- **Required**: Ionization method used (EI, ESI, MALDI, CI, APCI, APPI)
- **Optional**: High-resolution mass data (exact mass, measured vs. calculated)
- **Optional**: Molecular formula from other sources (elemental analysis, NMR)
- **Optional**: Tandem MS/MS data (fragmentation of selected precursor ions)
- **Optional**: Chromatographic context (LC-MS or GC-MS retention time, purity)

## Procedure

### Step 1: Identify Ionization Method and Expected Ion Types

Determine what species the spectrum contains before assigning peaks:

1. **Classify the ionization method**:

| Method | Energy | Primary Ion | Fragmentation | Typical Use |
|--------|--------|-------------|---------------|-------------|
| EI (70 eV) | Hard | M+. (radical cation) | Extensive | Small volatile molecules, GC-MS |
| CI | Soft | [M+H]+, [M+NH4]+ | Minimal | Molecular weight confirmation |
| ESI | Soft | [M+H]+, [M+Na]+, [M-H]- | Minimal | Polar, biomolecules, LC-MS |
| MALDI | Soft | [M+H]+, [M+Na]+, [M+K]+ | Minimal | Large molecules, polymers, proteins |
| APCI | Soft | [M+H]+, [M-H]- | Some | Medium polarity, LC-MS |

2. **Note polarity mode**: Positive mode produces cations; negative mode produces anions. ESI commonly uses both.
3. **Check for adducts and clusters**: Soft ionization often produces [M+Na]+ (M+23), [M+K]+ (M+39), [2M+H]+, and [2M+Na]+ in addition to [M+H]+. Identify these before assigning the molecular ion.
4. **Identify multiply charged ions**: In ESI, multiply charged ions appear at m/z = (M + nH) / n. Look for peaks separated by fractional m/z values (e.g., 0.5 Da spacing indicates z=2).

**Expected:** Ionization method documented, expected ion types listed, and adducts/clusters identified so the true molecular ion can be determined.

**On failure:** If the ionization method is unknown, examine the spectrum for clues: extensive fragmentation suggests EI, adduct patterns suggest ESI, and matrix peaks suggest MALDI. Consult the instrument log if available.

### Step 2: Determine Molecular Ion and Molecular Formula

Identify the molecular ion peak and derive the molecular formula:

1. **Locate the molecular ion (M)**: In EI, M+. is the highest m/z peak with a reasonable isotope pattern (it may be weak or absent for labile compounds). In soft ionization, identify [M+H]+ or [M+Na]+ and subtract the adduct to get M.
2. **Apply the nitrogen rule**: An odd molecular weight indicates an odd number of nitrogen atoms. An even molecular weight indicates zero or an even number of nitrogen atoms.
3. **Calculate degrees of unsaturation (DBE)**: DBE = (2C + 2 + N - H - X) / 2, where X = halogens. Each ring or pi bond contributes one DBE. Benzene = 4 DBE, carbonyl = 1 DBE.
4. **Use high-resolution data**: If exact mass is available, calculate the molecular formula using the mass defect. Compare the measured mass with all candidate formulas within the mass accuracy window (typically < 5 ppm for modern instruments).
5. **Cross-check with isotope pattern**: The observed isotope pattern must match the proposed molecular formula (see Step 3).

**Expected:** Molecular ion identified, molecular weight determined, nitrogen rule applied, and a molecular formula proposed (confirmed by HRMS if available).

**On failure:** If no molecular ion is visible in EI (common for thermally labile or highly branched compounds), try a softer ionization method. If the molecular ion is ambiguous, check for loss of common small fragments from the highest m/z peak (e.g., M-1, M-15, M-18 can help identify M).

### Step 3: Analyze Isotope Patterns

Use isotopic signatures to detect specific elements:

1. **Monoisotopic elements**: H, C, N, O, F, P, I have characteristic natural abundance patterns. For molecules containing only C, H, N, O, the M+1 peak is approximately 1.1% per carbon.
2. **Halogen patterns**:

| Element | Isotopes | M : M+2 Ratio | Visual Pattern |
|---------|----------|----------------|----------------|
| 35Cl / 37Cl | 35, 37 | 3 : 1 | Doublet, 2 Da apart |
| 79Br / 81Br | 79, 81 | 1 : 1 | Equal doublet, 2 Da apart |
| 2 Cl | -- | 9 : 6 : 1 | Triplet |
| 2 Br | -- | 1 : 2 : 1 | Triplet |
| 1 Cl + 1 Br | -- | 3 : 4 : 1 | Characteristic quartet-like |

3. **Sulfur detection**: 34S contributes 4.4% at M+2. An M+2 peak of approximately 4--5% relative to M (after correcting for the contribution of 13C2) suggests one sulfur atom.
4. **Silicon detection**: 29Si (5.1%) and 30Si (3.4%) produce distinctive M+1 and M+2 contributions.
5. **Compare with calculated patterns**: Use the proposed molecular formula to calculate the theoretical isotope pattern. Overlay with the observed pattern to confirm or refute the formula.

**Expected:** Isotope pattern analyzed, presence or absence of Cl, Br, S, Si determined, and pattern consistent with the proposed molecular formula.

**On failure:** If isotope resolution is insufficient (low-resolution instrument), the M+2 pattern may be unresolvable. Note the limitation and rely on exact mass and other spectroscopic data for elemental composition.

### Step 4: Identify Fragmentation Losses and Key Fragment Ions

Map the fragmentation pathways to extract structural information:

1. **Catalog major fragments**: List all peaks above 5--10% relative intensity with their m/z values.
2. **Calculate neutral losses from the molecular ion**:

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

4. **Map fragmentation pathways**: Connect fragment ions by successive losses to build a fragmentation tree from M down to low-mass fragments.
5. **Identify rearrangement ions**: McLafferty rearrangement (gamma-hydrogen transfer with beta-cleavage) produces even-electron ions from carbonyl-containing compounds. Retro-Diels-Alder fragmentation is characteristic of cyclohexene systems.

**Expected:** All major fragment ions assigned, neutral losses calculated and correlated with structural features, fragmentation tree constructed.

**On failure:** If fragments do not correspond to simple losses from the molecular ion, consider rearrangement processes. Unassigned fragments may indicate unexpected functional groups, impurities, or matrix/background peaks.

### Step 5: Assess Purity and Propose Structure

Evaluate the overall spectrum for purity indicators and assemble a structural proposal:

1. **Purity check**: In GC-MS or LC-MS, examine the chromatogram for additional peaks. In direct-infusion MS, look for unexpected ions that are not fragments of or adducts with the main analyte.
2. **Background and contaminant peaks**: Common contaminants include phthalate plasticizers (m/z 149, 167, 279), column bleed (siloxanes at m/z 207, 281, 355, 429 in GC-MS), and solvent clusters.
3. **Structural proposal**: Combine the molecular formula (Step 2), isotope pattern (Step 3), and fragmentation (Step 4) to propose a structure or a set of candidate structures.
4. **Rank candidates**: Use the fragmentation tree to rank structural candidates. The best structure explains the most fragment ions with the fewest ad hoc assumptions.
5. **Cross-validate**: Compare the proposed structure with data from other techniques (NMR, IR, UV-Vis). The mass spectrum alone rarely provides an unambiguous structure for novel compounds.

**Expected:** Purity assessed, contaminants identified if present, and a structural proposal (or ranked candidate list) consistent with all MS data and cross-validated where possible.

**On failure:** If the spectrum appears to contain multiple components and chromatographic separation was not used, flag the mixture and recommend LC-MS or GC-MS reanalysis. If no satisfactory structural proposal emerges, identify which additional data (HRMS, MS/MS, NMR) would resolve the ambiguity.

## Validation

- [ ] Ionization method identified and expected ion types documented
- [ ] Molecular ion located and distinguished from adducts, fragments, and clusters
- [ ] Nitrogen rule applied and consistent with proposed formula
- [ ] Degrees of unsaturation calculated and accounted for in the structure
- [ ] Isotope pattern matches the proposed molecular formula
- [ ] Major fragment ions assigned with neutral losses and structural rationale
- [ ] Fragmentation tree constructed from molecular ion to low-mass fragments
- [ ] Common contaminant and background peaks identified and excluded
- [ ] Structural proposal cross-validated with other spectroscopic data

## Common Pitfalls

- **Misidentifying the molecular ion**: In EI, the base peak is often a fragment, not the molecular ion. The molecular ion is the highest m/z peak with a chemically reasonable isotope pattern. Adduct ions in ESI ([M+Na]+, [2M+H]+) can also be mistaken for the molecular ion.
- **Ignoring the nitrogen rule**: An odd-mass molecular ion requires an odd number of nitrogens. Forgetting this leads to impossible molecular formulas.
- **Confusing isobaric losses**: A loss of 28 Da could be CO or C2H4; a loss of 29 could be CHO or C2H5. High-resolution MS or additional fragmentation data is needed to distinguish isobaric losses.
- **Neglecting multiply charged ions**: In ESI, doubly or triply charged ions appear at half or one-third the expected m/z. Look for non-integer spacing between isotope peaks as a diagnostic for multiple charges.
- **Over-interpreting low-abundance peaks**: Peaks below 1--2% relative intensity may be noise, isotope contributions, or minor contaminants rather than meaningful fragments.
- **Assuming a pure sample**: Many real-world spectra are mixtures. Always check chromatographic purity and look for ions inconsistent with the proposed structure.

## Related Skills

- `interpret-nmr-spectrum` -- determine connectivity and hydrogen environments for structural confirmation
- `interpret-ir-spectrum` -- identify functional groups that explain observed fragmentation
- `interpret-uv-vis-spectrum` -- characterize chromophores in the analyte
- `interpret-raman-spectrum` -- complementary vibrational analysis
- `plan-spectroscopic-analysis` -- select and sequence analytical techniques before data acquisition
- `interpret-chromatogram` -- analyze GC or LC chromatographic data coupled with MS
