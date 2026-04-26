---
name: interpret-raman-spectrum
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Systematic Raman interpret → id mol vibrations, polarizability selection
  rules, compare vs IR, depolarization ratios → symmetry. Raman-active modes,
  fluorescence mitigation, ref spectrum match.
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

Analyze Raman scattering → id mol vibrations, apply selection rules complementary to IR, integrate Raman + IR → comprehensive vibrational.

## Use When

- Samples difficult for IR (aqueous, sealed, remote sensing)
- ID symmetric vibrations weak/inactive in IR
- Complement IR via mutual exclusion (centrosymmetric mol)
- Characterize C materials (graphene, CNT, diamond) via Raman bands
- Inorganic, minerals, crystalline phases (Raman often > informative than IR)
- Non-destructive in situ (no sample prep for many Raman)

## In

- **Req**: Raman data (Raman shift cm-1 vs int)
- **Req**: Excitation laser λ (e.g., 532, 633, 785, 1064 nm)
- **Opt**: IR of same sample → complementary
- **Opt**: Polarization data (parallel + perpendicular → depolarization ratios)
- **Opt**: Mol formula / compound class
- **Opt**: Physical state (solid, liquid, soln, gas, thin film)

## Do

### Step 1: Quality + Artifacts

Evaluate reliability before peak analysis:

1. **Laser λ + fluorescence**: Fluorescence = most common interference. Broad intense BG obscures Raman peaks. Shorter λ (532) → more fluorescence; longer (785, 1064) → less, weaker Raman (int scales λ^-4).
2. **S/N**: Peaks distinguishable from noise? Weak scatterers → longer acquisition / higher power.
3. **Cosmic ray spikes**: Sharp narrow spikes random pos = cosmic artifacts, not Raman. Appear in one of time-avg set; remove w/ spike filters.
4. **Baseline correction**: Slope/curve (fluorescence / thermal) → subtract before measuring.
5. **Photodegradation**: High power → damage/transform sample. Check spectral changes between successive acquisitions at same spot. Reduce power if degradation.
6. **Range**: Standard 100-4000 cm-1. Low-freq cutoff depends on edge/notch filter blocking Rayleigh. Note truncation.

→ Quality assessed, fluorescence documented, artifacts (cosmic, baseline) ID'd / corrected, usable range confirmed.

**If err:** Fluorescence dominates (broad BG >> peaks) → recommend re-measure w/ longer λ (785 / 1064) or SERS. Sample degrades → reduce power / rotating stage.

### Step 2: Raman-Active Modes + Selection Rules

Determine Raman-active + how complement IR:

1. **Raman rule**: Vibration Raman-active if changes polarizability. Symmetric stretches (change mol vol) → typically strong Raman.
2. **IR rule (compare)**: Vibration IR-active if changes dipole moment. Asymmetric stretches → typically strong IR.
3. **Mutual exclusion**: Mol w/ center of inversion (centrosymmetric) → no vibration both Raman-active + IR-active. Band in both → no center of symmetry.
4. **General complementarity**: Even non-centrosymmetric → Raman-strong tend IR-weak + vv. Combined dataset > either alone.
5. **Raman-favored modes**: Sym stretches (C-C, C=C, S-S, N=N), breathing modes of rings, stretches of homonuclear bonds (no dipole change → IR-inactive) → typically strong Raman.

→ Selection rules applied, Raman-active vs IR-active distinguished, mutual exclusion tested if centrosymmetric.

**If err:** Mol symmetry unknown → use combined Raman + IR to infer. Band in both w/ comparable int → not centrosymmetric.

### Step 3: Raman Shift Positions

Assign bands → vibrational modes via characteristic freqs:

1. **C-H stretch (2800-3100 cm-1)**: Similar IR but Raman int differ. Aromatic + olefinic C-H (3000-3100) often > Raman than aliphatic.
2. **Triple bonds (2100-2260 cm-1)**: C≡C sym stretch strong Raman, often weak/absent IR. C≡N active in both.
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

5. **Other characteristic**:

| Shift (cm-1) | Assignment |
|---------------|------------|
| 430--550 | S-S stretch (disulfide) |
| 570--705 | C-S stretch |
| 800--1100 | C-C skeletal stretch |
| 630--770 | C-Cl stretch |
| 500--680 | C-Br stretch |
| 200--400 | Metal-ligand stretch |

6. **C materials**: G band (~1580, graphitic sp2) + D band (~1350, defect/disorder) → diagnostic for C allotropes. 2D (~2700) → graphene layer count. Diamond sharp peak 1332.

→ All significant bands assigned to vibrational modes w/ ref to freq ranges.

**If err:** Band unassignable from tables → consult DBs (RRUFF minerals, SDBS organics). Unassigned → combination modes, overtones, lattice vibrations in crystalline.

### Step 4: Compare Raman vs IR

Integrate two complementary techniques:

1. **Tabulate corresponding bands**: Per mode → Raman shift, IR freq, rel int each technique.
2. **Modes in one only**: Raman but not IR (or vv) → symmetry info. Sym stretches of non-polar bonds (S-S, C=C sym env) → Raman only.
3. **Resolve ambiguities**: IR tentative (e.g., overlapping C-O + C-N fingerprint) → Raman may be clearer (diff rel int).
4. **Functional group confirm**: Confirm IR-ID'd groups via Raman counterparts. Ester → C=O IR (~1735) + C-O-C Raman. Acid → broad OH IR + C=O both.
5. **Assess consistency**: Raman + IR mutually consistent. Contradictions (band assigned sym stretch strong both for centrosymmetric) → err in assignment / symmetry.

→ Unified vibrational analysis table combining Raman+IR, func groups confirmed / refined by complementary.

**If err:** No IR → Raman alone useful but reduced certainty. Note assignments benefiting from IR confirm.

### Step 5: Polarization + Document

Depolarization ratios → symmetry + compile final:

1. **Depolarization ratio (ρ)**: ρ = I⊥ / I∥, from polarized Raman.
   - ρ = 0-0.75 → polarized band. Totally symmetric vibrations (A-type) polarized.
   - ρ = 0.75 → depolarized. Non-totally-sym vibrations → ρ = 0.75.
2. **Symmetry assignment**: Polarized bands → totally sym irrep of point group. Helps distinguish modes of diff sym at similar freqs.
3. **Compile**: Complete table per observed:
   - Raman shift (cm-1)
   - Rel int (strong/medium/weak)
   - Depolarization ratio (if measured)
   - Assignment
   - Corresponding IR band (if observed)
4. **Compare ref spectra**: Known compound → compare vs published (RRUFF, SDBS, NIST). Agreement ±3 cm-1 + matching rel int → identity.
5. **Report uncertainties**: Flag tentative assignments, note which add'l exps (temp-dep Raman, resonance Raman, SERS) resolve ambiguity.

→ Complete analysis, all bands assigned, polarization → symmetry, results integrated w/ IR + other.

**If err:** No polarization → symmetry relies on freq+int alone. Note limitation + recommend polarized measurements if symmetry critical.

## Check

- [ ] Quality assessed (fluorescence, cosmic, baseline, photodegradation)
- [ ] Selection rules applied, Raman-active modes ID'd
- [ ] Mutual exclusion tested if centrosymmetric
- [ ] All significant bands assigned
- [ ] Raman vs IR compared + integrated where avail
- [ ] Depolarization ratios → symmetry (if polarization avail)
- [ ] Assignments consistent w/ known / proposed structure
- [ ] Results compared w/ ref spectra where poss

## Traps

- **Fluorescence overwhelm signal**: Most common prob. Switch longer λ / time-gated detection. Don't interpret broad fluorescent humps as Raman bands.
- **Confuse cosmic spikes w/ real peaks**: Random pos sharp intense spikes → present in single, absent in averaged. Always check reproducibility.
- **Neglect polarizability rule**: Strong IR modes (asym polar) → weak/absent Raman + vv. Don't expect same int pattern as IR.
- **Ignore degradation**: High power → char, polymerize, phase-transform. Spectrum changes between measurements at same spot = degradation.
- **Assume all Raman = fundamentals**: Overtones (2× fundamental) + combination bands appear. Weaker than fundamentals but cause confusion.
- **Overlook low-freq**: Lattice vibrations, torsional, metal-ligand below 400 cm-1. Many setups don't access. Verify notch/edge filter allows low-freq if these modes relevant.

## →

- `interpret-ir-spectrum` — complementary vibrational → dipole-active
- `interpret-nmr-spectrum` — connectivity → complete structure
- `interpret-mass-spectrum` — formula + frag
- `interpret-uv-vis-spectrum` — electronic transitions + chromophores
- `plan-spectroscopic-analysis` — select + sequence techniques pre-acquisition
