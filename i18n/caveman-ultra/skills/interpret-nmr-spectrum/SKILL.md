---
name: interpret-nmr-spectrum
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Systematic NMR interpret (1H, 13C, DEPT, 2D) → elucidate mol structure.
  Chemical shift assignment, coupling pattern, integration, correlate multi-dim
  data → coherent structural proposals.
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

Analyze 1D + 2D NMR → assign peaks, determine coupling, propose structural fragments consistent w/ all data.

## Use When

- Structure of unknown organic compound from NMR
- Confirm identity + purity of synthesized product
- Assign peaks in complex spectra w/ overlap
- Correlate multi-exp (1H, 13C, DEPT, COSY, HSQC, HMBC) → unified picture
- Distinguish regioisomers / stereoisomers / conformational

## In

- **Req**: NMR data (min 1H w/ shifts, multiplicities, integration)
- **Req**: Mol formula / MW (from MS, EA)
- **Opt**: 13C + DEPT (shifts + multiplicities)
- **Opt**: 2D (COSY, HSQC, HMBC, NOESY/ROESY correlation tables)
- **Opt**: Solvent + field strength
- **Opt**: Known constraints (rxn starting material, IR confirmed groups)

## Do

### Step 1: Spectrum Type + Acquisition

Establish what data + quality before interpret:

1. **ID exp types**: Catalog which avail (1H, 13C, DEPT-135, DEPT-90, COSY, HSQC, HMBC, NOESY, ROESY, TOCSY). Note nucleus + dimensionality.
2. **Acquisition params**: Spectrometer freq (400 MHz, 600 MHz), solvent, temp, ref standard.
3. **Solvent + ref peaks**: Locate + exclude.

| Solvent | 1H Residual (ppm) | 13C Signal (ppm) |
|---------|-------------------|-------------------|
| CDCl3 | 7.26 | 77.16 |
| DMSO-d6 | 2.50 | 39.52 |
| D2O | 4.79 | -- |
| CD3OD | 3.31 | 49.00 |
| Acetone-d6 | 2.05 | 29.84, 206.26 |
| C6D6 | 7.16 | 128.06 |

4. **Quality**: Baseline flatness, multiplet res, S/N. Flag artifacts (spinning sidebands, 13C satellites, solvent impurity H2O ~1.56 ppm CDCl3).

→ Inventory of exps, solvent/ref peaks excluded, quality assessed.

**If err:** Poor S/N / severe baseline distortion → note limitation + cautious. Flag peaks indistinguishable from noise.

### Step 2: 1H Chemical Shifts

Assign each 1H → environment using shift ranges:

1. **Tabulate**: Per peak → shift (ppm), multiplicity, J (Hz), rel int.
2. **Classify by shift**:

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

3. **Count H**: Integration ratios rel to formula → # protons per signal. Normalize simplest whole-# ratio.
4. **Exchangeable protons**: Signals disappear on D2O shake (OH, NH, COOH) = exchangeable. Record presence + shift.

→ Table of 1H signals w/ shift, multiplicity, J, integration (# H), prelim env assignment.

**If err:** Integration doesn't sum to expected → check overlapping, broad peaks hidden in baseline, wrong formula.

### Step 3: Coupling Patterns + J-Values

Extract connectivity from splitting:

1. **Multiplicities**: s, d, t, q, dd, etc. Complex m → estimate # coupling partners.
2. **Measure J**: Extract Hz. Match reciprocal (if H_A ↔ H_B J = 7.2, H_B shows same J to H_A).
3. **Classify J**:

| J Range (Hz) | Coupling Type |
|--------------|---------------|
| 0--3 | Geminal (2J) or long-range (4J, 5J) |
| 6--8 | Vicinal aliphatic (3J) |
| 8--10 | Vicinal with restricted rotation |
| 10--17 | Vicinal olefinic cis (6--12) or trans (12--18) |
| 0--3 | Aromatic meta |
| 6--9 | Aromatic ortho |

4. **Map coupling networks**: Group mutually coupled protons → spin systems. Each = connected frag.
5. **Roof effect**: AB-type → inner lines of doublets more intense → chemical shift proximity.

→ All J measured + matched reciprocally, spin systems ID'd, coupling types classified.

**If err:** Multiplets too complex for first-order → note higher-order pattern. Overlapping / strongly coupled (δν/J < 10) → non-first-order requires simulation.

### Step 4: 13C + DEPT

Determine C types + count:

1. **Count distinct 13C signals**: Compare # peaks vs formula. Fewer → symmetry.
2. **Classify by shift**:

| Range (ppm) | Carbon Type | Examples |
|-------------|-------------|----------|
| 0--50 | sp3 Alkyl | CH3, CH2, CH, quaternary C |
| 50--100 | Alpha to O or N | -OCH3, -OCH2, anomeric C |
| 100--150 | Aromatic / vinyl | =CH-, ArC |
| 150--170 | Heteroaromatic / enol / imine | C=N, C-O aromatic |
| 170--185 | Carboxyl / ester / amide | -COOH, -COOR, -CONR2 |
| 185--220 | Aldehyde / ketone | -CHO, >C=O |

3. **DEPT editing**: DEPT-135 (CH + CH3 up, CH2 down, quaternary absent) + DEPT-90 (CH only) → # attached H per C.
4. **DBE**: DBE = (2C + 2 + N - H - X) / 2. Compare # π bonds + rings implied.

→ Every 13C signal classified by type (CH3, CH2, CH, C) + env, DBE consistent w/ observed groups.

**If err:** No DEPT → infer H attachment from HSQC (Step 5). C count ≠ formula → coincident signals / quaternary Cs in noise.

### Step 5: 2D NMR

Build connectivity using 2D exps:

1. **COSY (1H-1H)**: Which H 2-3 bonds apart. Map cross-peaks → confirm+extend spin systems Step 3.
2. **HSQC (1H-13C 1-bond)**: Assign each H → directly bonded C. Links 1H + 13C unambiguously.
3. **HMBC (1H-13C long-range)**: 2-3 bond H-C. Critical for connecting frags across quaternary C, heteroatoms, carbonyls w/o direct H-C.
4. **NOESY/ROESY (through-space)**: H's spatially close (<5 Å) regardless bonding. → Stereochem + conformational.
5. **Build frag connectivity**: HMBC → connect COSY spin systems → larger frags. Each HMBC cross-peak = 2-3 bond H-C path.

→ Connectivity map linking spin systems into coherent framework + stereochem from NOE where avail.

**If err:** 2D incomplete / ambiguous → note tentative connections. Multiple proposals poss. Prioritize HMBC → bridges gaps COSY can't.

### Step 6: Propose + Validate Structure

Assemble frags → complete proposal:

1. **Assemble**: Connect frags Steps 2-5 using HMBC + DBE constraints.
2. **Check formula**: Proposed matches formula exactly (atom count, DBE).
3. **Back-predict shifts**: For proposed → predict 1H + 13C shifts. Compare observed; deviations > 0.3 ppm (1H) / > 5 ppm (13C) → re-examine.
4. **Verify all correlations**: Every COSY, HSQC, HMBC explained. Unexplained → error / impurity.
5. **Alternatives**: Multiple structures fit → list distinguishing exps / correlations.
6. **Stereochem**: NOE + J analysis (Karplus for dihedral) + known conformational prefs → relative + (where poss) absolute.

→ Single best-fit proposal w/ all NMR accounted, or ranked candidates + plan to distinguish.

**If err:** No single structure → check: mixture (extra peaks non-integer int), dynamic processes (broad peaks from conformational exchange), paramagnetic impurities (anomalous broadening). Re-examine formula if multiple equally viable.

## Check

- [ ] Solvent + ref peaks ID'd + excluded
- [ ] Every 1H signal → shift region, multiplicity, J, integration
- [ ] J reciprocal (matched between partners)
- [ ] 13C classified by DEPT multiplicity + shift
- [ ] DBE calc + consistent w/ proposed
- [ ] 2D (COSY, HSQC, HMBC) all explained
- [ ] Proposed matches formula exactly
- [ ] Back-predicted shifts agree w/ observed within tolerance
- [ ] Stereochem via NOE / J where applicable

## Traps

- **Ignore solvent peaks**: Common solvents → signals overlap analyte. Always ID + exclude residuals, water, grease.
- **Force 1st-order on 2nd-order**: Strongly coupled nuclei (small Δshift rel J) → distorted multiplets, can't interpret w/ simple n+1. Roof effects + non-binomial intensity → indicators.
- **Overlook exchangeable**: OH + NH may be broad, shift w/ conc/temp, absent in protic solvents. D2O shake → clarifies.
- **Assume all 13C visible**: Quaternary Cs → long relax times + low int. May be absent short-acquisition. HMBC often only way to detect.
- **Misinterpret HMBC artifacts**: HMBC → 1-bond artifacts (mis-assigned long-range) + weak 4-bond. Cross-check w/ HSQC → filter 1-bond leakthrough.
- **Neglect symmetry**: Fewer 13C peaks than formula → symmetry element. Account before proposing.

## →

- `interpret-ir-spectrum` — func groups → constrain NMR structure
- `interpret-mass-spectrum` — formula + frag for cross-val
- `interpret-uv-vis-spectrum` — chromophores + conjugation extent
- `interpret-raman-spectrum` — complementary vibrational → symmetric modes
- `plan-spectroscopic-analysis` — select + sequence techniques pre-acquisition
