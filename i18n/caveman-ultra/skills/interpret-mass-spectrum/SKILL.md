---
name: interpret-mass-spectrum
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Systematic MS interpret → determine mol formula, fragmentation pathways,
  propose structure. Ionization method, mol ion ID, isotope pattern, common
  frag losses, purity eval.
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

Analyze MS → mol ion, formula, fragmentation pathways, structural features.

## Use When

- MW + formula of unknown
- Confirm synthetic product (mol ion + fragmentation)
- ID impurities / degradation products
- Propose structural features from characteristic frag losses
- Isotope patterns → halogens, S, metals

## In

- **Req**: MS data (m/z + rel int, min full scan)
- **Req**: Ionization method (EI, ESI, MALDI, CI, APCI, APPI)
- **Opt**: HRMS exact mass (measured vs calc)
- **Opt**: Mol formula from other (EA, NMR)
- **Opt**: MS/MS data (frag of selected precursor)
- **Opt**: Chrom ctx (LC-MS / GC-MS tR, purity)

## Do

### Step 1: Ionization Method + Expected Ion Types

Determine what species present before peak assignment:

1. **Classify ionization**:

| Method | Energy | Primary Ion | Fragmentation | Typical Use |
|--------|--------|-------------|---------------|-------------|
| EI (70 eV) | Hard | M+. (radical cation) | Extensive | Small volatile molecules, GC-MS |
| CI | Soft | [M+H]+, [M+NH4]+ | Minimal | Molecular weight confirmation |
| ESI | Soft | [M+H]+, [M+Na]+, [M-H]- | Minimal | Polar, biomolecules, LC-MS |
| MALDI | Soft | [M+H]+, [M+Na]+, [M+K]+ | Minimal | Large molecules, polymers, proteins |
| APCI | Soft | [M+H]+, [M-H]- | Some | Medium polarity, LC-MS |

2. **Polarity mode**: +ve → cations; -ve → anions. ESI uses both commonly.
3. **Adducts + clusters**: Soft ionization → [M+Na]+ (M+23), [M+K]+ (M+39), [2M+H]+, [2M+Na]+ besides [M+H]+. ID these before mol ion.
4. **Multiply charged**: ESI → m/z = (M + nH) / n. Look for fractional m/z spacing (0.5 Da = z=2).

→ Method documented, expected ion types listed, adducts/clusters ID'd → true mol ion determinable.

**If err:** Method unknown → examine spectrum for clues: extensive frag → EI; adduct patterns → ESI; matrix peaks → MALDI. Check instrument log.

### Step 2: Mol Ion + Mol Formula

ID mol ion peak + derive formula:

1. **Locate mol ion (M)**: EI → M+. highest m/z w/ reasonable isotope pattern (may be weak/absent for labile compounds). Soft → ID [M+H]+ / [M+Na]+ + subtract adduct → M.
2. **N rule**: Odd MW → odd # N. Even MW → 0 or even # N.
3. **DBE**: DBE = (2C + 2 + N - H - X) / 2, X = halogens. Ring / π bond = 1 DBE. Benzene = 4, carbonyl = 1.
4. **HRMS**: Exact mass avail → calc formula using mass defect. Compare measured vs candidate formulas in accuracy window (typ < 5 ppm modern instruments).
5. **Cross-check isotope pattern**: Observed must match proposed formula (Step 3).

→ Mol ion ID'd, MW determined, N rule applied, formula proposed (confirmed by HRMS if avail).

**If err:** No mol ion in EI (common thermally labile / highly branched) → try softer ionization. Ambiguous mol ion → check loss of common small frags from highest m/z (M-1, M-15, M-18 → help ID M).

### Step 3: Isotope Patterns

Use isotopic signatures → detect elements:

1. **Monoisotopic elements**: H, C, N, O, F, P, I have characteristic abundances. CHNO only → M+1 ≈ 1.1% per C.
2. **Halogen patterns**:

| Element | Isotopes | M : M+2 Ratio | Visual Pattern |
|---------|----------|----------------|----------------|
| 35Cl / 37Cl | 35, 37 | 3 : 1 | Doublet, 2 Da apart |
| 79Br / 81Br | 79, 81 | 1 : 1 | Equal doublet, 2 Da apart |
| 2 Cl | -- | 9 : 6 : 1 | Triplet |
| 2 Br | -- | 1 : 2 : 1 | Triplet |
| 1 Cl + 1 Br | -- | 3 : 4 : 1 | Characteristic quartet-like |

3. **Sulfur**: 34S → 4.4% at M+2. M+2 ≈ 4-5% rel M (after 13C2 correction) → ≈ 1 S.
4. **Silicon**: 29Si (5.1%) + 30Si (3.4%) → distinctive M+1 + M+2 contributions.
5. **Compare calc vs observed**: Use proposed formula → theoretical pattern → overlay observed → confirm/refute.

→ Pattern analyzed, Cl/Br/S/Si presence determined, consistent w/ proposed formula.

**If err:** Isotope res insufficient (low-res instrument) → M+2 unresolvable. Note limitation, rely on exact mass + other spectra for elemental comp.

### Step 4: Fragmentation Losses + Key Frag Ions

Map pathways → structural info:

1. **Catalog major frags**: All peaks > 5-10% rel int w/ m/z.
2. **Neutral losses from mol ion**:

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

3. **Characteristic frag ions**:

| m/z | Ion | Origin |
|-----|-----|--------|
| 77 | C6H5+ | Phenyl cation |
| 91 | C7H7+ | Tropylium (benzyl rearrangement) |
| 105 | C6H5CO+ | Benzoyl cation |
| 43 | CH3CO+ or C3H7+ | Acetyl or propyl |
| 57 | C4H9+ or C3H5O+ | tert-Butyl or acrolein |
| 149 | Phthalate fragment | Plasticizer contaminant |

4. **Map frag pathways**: Connect frag ions by successive losses → frag tree from M down to low mass.
5. **Rearrangement ions**: McLafferty (γ-H transfer + β-cleavage) → even-electron ions from carbonyl compounds. Retro-Diels-Alder → characteristic cyclohexene.

→ All major frag ions assigned, neutral losses calc + correlated w/ structure, frag tree built.

**If err:** Frags don't correspond to simple losses → consider rearrangement. Unassigned frags → unexpected groups, impurities, matrix/BG peaks.

### Step 5: Purity + Structure

Evaluate spectrum for purity + assemble proposal:

1. **Purity check**: GC-MS / LC-MS → examine chrom for add'l peaks. Direct-infusion → look for unexpected ions not frags/adducts of analyte.
2. **BG + contaminant peaks**: Common: phthalate plasticizers (m/z 149, 167, 279), column bleed (siloxanes 207, 281, 355, 429 in GC-MS), solvent clusters.
3. **Structure proposal**: Combine formula (Step 2) + isotope (Step 3) + frag (Step 4) → structure / candidate set.
4. **Rank candidates**: Frag tree → rank. Best = explains most frag ions w/ fewest ad hoc.
5. **Cross-validate**: Compare vs NMR, IR, UV-Vis. MS alone rarely unambiguous for novel compounds.

→ Purity assessed, contaminants ID'd if present, structural proposal / ranked candidates consistent w/ all MS + cross-validated where poss.

**If err:** Multiple components w/o chrom sep → flag mixture, recommend LC-MS / GC-MS reanalysis. No satisfactory proposal → ID which add'l data (HRMS, MS/MS, NMR) would resolve.

## Check

- [ ] Ionization method ID'd + expected ion types documented
- [ ] Mol ion located + distinguished from adducts, frags, clusters
- [ ] N rule applied + consistent w/ proposed formula
- [ ] DBE calc + accounted for in structure
- [ ] Isotope pattern matches formula
- [ ] Major frag ions assigned w/ neutral losses + structural rationale
- [ ] Frag tree built M → low mass
- [ ] Contaminant + BG peaks ID'd + excluded
- [ ] Proposal cross-validated w/ other spectra

## Traps

- **Mis-ID mol ion**: EI → base peak often frag, not M. M = highest m/z w/ reasonable isotope pattern. ESI adducts ([M+Na]+, [2M+H]+) → mistaken for M.
- **Ignore N rule**: Odd-mass M → odd # N. Forget → impossible formulas.
- **Confuse isobaric losses**: Loss 28 = CO or C2H4; loss 29 = CHO or C2H5. HRMS / add'l frag → distinguish.
- **Neglect multiply charged**: ESI → 2+/3+ at half/third expected m/z. Non-integer spacing between isotope peaks → multi charge diagnostic.
- **Over-interpret low-abundance**: Peaks < 1-2% rel int → noise, isotope contribs, minor contaminants, not real frags.
- **Assume pure**: Many real spectra = mixtures. Check chrom purity + look for ions inconsistent w/ proposed structure.

## →

- `interpret-nmr-spectrum` — connectivity + H environments → structural confirm
- `interpret-ir-spectrum` — func groups explaining observed frag
- `interpret-uv-vis-spectrum` — chromophores in analyte
- `interpret-raman-spectrum` — complementary vibrational
- `plan-spectroscopic-analysis` — select + sequence techniques pre-acquisition
- `interpret-chromatogram` — GC/LC chrom data coupled w/ MS
