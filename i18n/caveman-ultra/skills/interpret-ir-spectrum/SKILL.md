---
name: interpret-ir-spectrum
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Systematic IR spectrum interpret → id functional groups. Diagnostic region
  (4000-1500 cm-1), fingerprint (1500-400 cm-1), H-bonding effects, functional
  group inventory w/ confidence.
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

Analyze IR absorption → id functional groups, assess H-bonding, inventory structural features.

## Use When

- ID functional groups in unknown (first screen)
- Confirm presence/absence (e.g., rxn converted OH → ketone?)
- Monitor rxn progress → appear/disappear of absorptions
- Distinguish similar compounds by functional group
- Complement NMR + MS w/ vibrational info

## In

- **Req**: IR data (abs freq cm-1 + intensities, %T or Abs)
- **Req**: Prep method (KBr, ATR, Nujol, thin film, soln cell)
- **Opt**: Mol formula / expected class
- **Opt**: Known frags from other spectra
- **Opt**: Instrument params (res, range, detector)

## Do

### Step 1: Spectrum Quality + Format

Verify suitability before peak analysis:

1. **y-axis format**: %T (peaks down) / Abs (peaks up). Keep consistent.
2. **Wavenumber range**: ≥ 4000-400 cm-1 for mid-IR. Note truncation.
3. **Baseline**: Flat + near 100%T (or 0 Abs) in no-abs regions. Slopes/noise → reduce reliability.
4. **Resolution**: Adjacent peaks < instrumental res → can't distinguish. Typical FTIR: 4 cm-1.
5. **Prep artifacts**: KBr → broad OH ~3400 cm-1 (moisture). Nujol obscures CH stretch. ATR distorts low wavenumbers. Note.

→ Spectrum suitable; format, range, artifacts documented.

**If err:** Severe baseline probs, saturation (flat-bottom peaks → too-conc sample), prep artifacts obscuring critical regions → note limitation + flag regions unreliable.

### Step 2: Diagnostic Region (4000-1500 cm-1)

High-freq region → most functional groups:

1. **O-H (3200-3600 cm-1)**: Broad abs. Sharp ~3600 → free OH; broad 3200-3400 → H-bonded OH (alcohols, acids, water).
2. **N-H (3300-3500 cm-1)**: Primary amines → 2 peaks (sym+asym); secondary → 1. Sharper than OH.
3. **C-H (2800-3300 cm-1)**:

| Frequency (cm-1) | Assignment |
|-------------------|------------|
| 3300 | sp C-H (alkyne, sharp) |
| 3000--3100 | sp2 C-H (aromatic, vinyl) |
| 2850--3000 | sp3 C-H (alkyl, multiple peaks) |
| 2700--2850 | Aldehyde C-H (two peaks from Fermi resonance) |

4. **Triple-bond (2000-2300 cm-1)**:

| Frequency (cm-1) | Assignment | Notes |
|-------------------|------------|-------|
| 2100--2260 | C triple-bond C | Weak or absent if symmetric |
| 2200--2260 | C triple-bond N | Medium to strong |
| ~2350 | CO2 | Atmospheric artifact, disregard |

5. **Carbonyl (1650-1800 cm-1)** — most diagnostic single region:

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

6. **C=C + C=N (1600-1680 cm-1)**: Alkene C=C → 1620-1680 (weak-med). Aromatic C=C → multiple 1450-1600. C=N (imine) → 1620-1660.

→ All abs in diagnostic ID'd w/ func group + confidence (strong/tentative/absent).

**If err:** Carbonyl obscured (water in KBr, atm CO2) → note gap. Expected group absent → confirm w/ 2nd prep before concluding absent.

### Step 3: Fingerprint (1500-400 cm-1)

Low-freq region → confirmation + structural detail:

1. **C-O (1000-1300 cm-1)**: Ethers, esters, alcohols, acids → strong C-O. Esters → characteristic strong band 1000-1100 + carbonyl.
2. **C-N (1000-1250 cm-1)**: Amines + amides; overlap C-O → tentative w/o other evidence.
3. **C-F, C-Cl, C-Br**:

| Frequency (cm-1) | Assignment |
|-------------------|------------|
| 1000--1400 | C-F (strong) |
| 600--800 | C-Cl |
| 500--680 | C-Br |

4. **Aromatic subst pattern (700-900 cm-1)**: OOP C-H bending → substitution:

| Frequency (cm-1) | Pattern |
|-------------------|---------|
| 730--770 | Mono-substituted (+ 690--710) |
| 735--770 | Ortho-disubstituted |
| 750--810, 860--900 | Meta-disubstituted |
| 790--840 | Para-disubstituted |

5. **Fingerprint comparison**: Region unique per compound. Ref spectrum avail → overlay + compare → identity confirm.

→ Confirmatory assignments for Step 2 groups + structural detail (subst patterns, C-O/C-N).

**If err:** Fingerprint inherently complex + overlapping. Ambiguous → flag tentative + rely on diagnostic + other spectra.

### Step 4: H-bonding + Intermolecular Effects

Evaluate sample state + interactions:

1. **H-bonding broadening**: Compare width+pos of OH, NH. Free OH sharp ~3600; H-bonded broad + shifted 3200-3400. Acid dimers → very broad OH 2500-3300.
2. **Conc + state effects**: Soln spectra at diff conc → distinguish intramolecular (conc-indep) from intermolecular (conc-dep) H-bonds.
3. **Fermi resonance**: 2 overlapping bands → doublet. Classic: aldehyde C-H pair ~2720 + 2820. Recognize → avoid mis-assign as separate groups.
4. **Solid-state effects**: KBr + Nujol → solid packing → broadens bands + shifts 10-20 cm-1 vs soln. ATR closest to neat liquid.

→ H-bonding characterized, prep artifacts accounted, anomalous band shapes explained.

**If err:** H-bonding unresolved (overlap OH + NH) → note ambiguity. D2O exchange / var-temp → helps, requires add'l data.

### Step 5: Compile Func Group Inventory

Assemble findings → structured report:

1. **Confirmed groups**: Strong unambiguous abs in diagnostic (e.g., sharp C=O at 1715 = ketone/aldehyde).
2. **Tentative**: Weaker evidence / overlap → >1 possible group.
3. **Absent**: Characteristic strong abs clearly missing (no broad OH → no free alcohol/acid).
4. **Discrepancies**: Abs not fitting proposed groups, or expected abs missing.
5. **Cross-ref**: Compare IR inventory vs NMR, MS, UV-Vis if avail.

→ Complete inventory by confidence, specific freqs + intensities cited as evidence.

**If err:** Inventory incomplete/contradictory → ID which add'l exps (ATR vs KBr, var conc, D2O exchange) resolve ambiguity.

## Check

- [ ] Quality assessed (baseline, res, artifacts, y-axis)
- [ ] Solvent, prep, atm artifacts ID'd + excluded
- [ ] All abs in diagnostic (4000-1500) assigned / flagged
- [ ] Carbonyl region → sub-type assignment where possible
- [ ] Fingerprint examined for confirmation
- [ ] H-bonding evaluated + peak shape/pos impact documented
- [ ] Inventory compiled w/ confidence
- [ ] Absent groups explicit (neg evidence informative)
- [ ] Cross-ref vs other spectra

## Traps

- **Ignore prep artifacts**: KBr moisture (broad 3400), Nujol C-H (2850-2950), ATR distortion at low wavenumbers → mimic/obscure real. Always consider prep.
- **Over-interpret fingerprint**: Region < 1500 complex+overlapping. Use for confirm not primary ID. Don't assign every peak.
- **Confuse atm CO2 w/ sample**: Sharp doublet ~2350 = atm CO2 usually, not sample. BG subtraction removes, verify.
- **Neglect intensity+width**: Strong broad ≠ weak sharp at same freq. Report intensity (str/med/weak) + shape (sharp/broad) + freq.
- **Single-peak assignment**: Never ID func group from single abs. Carbonyls → supported by additional bands (C-O for esters, N-H for amides, C-H for aldehydes).
- **Absence from weak abs**: Some groups → inherently weak IR (sym C=C, triple bonds sym alkynes). Absence ≠ always absence of group.

## →

- `interpret-nmr-spectrum` — detailed connectivity + H environments
- `interpret-mass-spectrum` — mol formula + fragmentation
- `interpret-uv-vis-spectrum` — chromophores complementing IR
- `interpret-raman-spectrum` — complementary vibrational → IR-inactive modes
- `plan-spectroscopic-analysis` — select + sequence techniques pre-acquisition
