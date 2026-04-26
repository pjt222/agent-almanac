---
name: interpret-uv-vis-spectrum
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Systematic UV-Vis absorption interpret → id chromophores, classify electronic
  transitions, Woodward-Fieser rules for conjugated sys, quant analysis via
  Beer-Lambert.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: spectroscopy
  complexity: intermediate
  language: natural
  tags: spectroscopy, uv-vis, chromophore, beer-lambert, electronic-transitions
---

# Interpret UV-Vis Spectrum

Analyze UV-Vis absorption → id chromophores, classify electronic transitions, predict λ-max conjugated sys, apply Beer-Lambert for quant.

## Use When

- ID chromophores + extent of conjugation in organic compound
- Confirm aromatic rings, conjugated dienes, enones
- Quant analysis (conc from absorbance)
- Monitor rxn kinetics via abs changes over time
- Characterize metal-ligand complexes (d-d + charge-transfer)
- Solvent effects on electronic transitions (solvatochromism)

## In

- **Req**: UV-Vis data (λ nm vs abs / molar absorptivity)
- **Req**: Solvent
- **Opt**: Conc + path length (for Beer-Lambert)
- **Opt**: ε at λ-max
- **Opt**: Spectra in multi-solvents (solvatochromism)
- **Opt**: Structural info from other spectra

## Do

### Step 1: Verify Instrument Params + Quality

Ensure reliable data before interpret:

1. **λ range**: Confirm relevant range. Standard UV-Vis 190-800 nm. Solvent cutoffs:

| Solvent | UV Cutoff (nm) | Notes |
|---------|----------------|-------|
| Water | 190 | Excellent UV transparency |
| Hexane | 195 | Non-polar, minimal solvent effects |
| Methanol | 205 | Protic, may cause blue shifts |
| Acetonitrile | 190 | Good general-purpose UV solvent |
| Dichloromethane | 230 | Absorbs below 230 nm |
| Chloroform | 245 | Absorbs below 245 nm |
| Acetone | 330 | Absorbs strongly, poor UV solvent |

2. **Absorbance range**: Reliable A = 0.1-1.0. <0.1 → noise; >1.0 → stray light non-linear. Flag λ-max outside.
3. **Baseline + blank**: Verify solvent blank subtracted. Residual solvent abs / cuvette artifacts → rising baseline at short λ.
4. **Slit width**: Narrow → better res, lower S/N. Fine structure expected (vibrational progression) → confirm slit appropriate (typ 1-2 nm).

→ Instrument params documented, solvent cutoff respected, abs in linear range, baseline clean.

**If err:** A > 1.0 at λ-max → dilute + remeasure. Solvent absorbs in region → re-acquire in more transparent solvent.

### Step 2: Locate λ-Max + Band Characteristics

Locate + characterize all abs bands:

1. **Locate λ-max**: Per abs max → record λ (nm) + abs (or ε if known).
2. **Band shape**: Broad featureless (typical soln-phase) or vibrational fine structure (rigid chromophores, polycyclic aromatics).
3. **Shoulders**: Overlapping transitions → note approx λ + int.
4. **Classify by ε**:

| epsilon (L mol-1 cm-1) | Transition Type | Example |
|-------------------------|-----------------|---------|
| < 100 | Forbidden (n -> pi*) | Ketone ~280 nm |
| 100--10,000 | Weakly allowed | Aromatic 250--270 nm |
| 10,000--100,000 | Fully allowed (pi -> pi*) | Conjugated diene ~220 nm |
| > 100,000 | Charge transfer | Metal complexes, dyes |

→ All abs maxima + shoulders tabulated w/ λ, abs/ε, qualitative shape.

**If err:** No distinct maxima (monotonic rise) → compound lacks chromophore in range, or conc too low. Increase conc / extend range.

### Step 3: Classify Electronic Transitions

Assign each band → transition type:

1. **σ → σ*** (<200 nm): Vacuum UV only. Saturated HCs + C-C/C-H. Not typically measured standard.
2. **n → σ*** (150-250 nm): Lone pair → σ antibonding. Heteroatoms (O, N, S, halogens). Saturated amines ~190-200; alcohols/ethers ~175-185.
3. **π → π*** (200-500 nm): Bonding π → antibonding π*. Strongest abs for organics. Int + λ increase w/ extended conjugation.
4. **n → π*** (250-400 nm): Lone pair → π antibonding. Formally forbidden (low ε, 10-100). Characteristic C=O (270-280 simple ketones), N=O, C=S.
5. **Charge-transfer**: e- transfer donor↔acceptor, or metal↔ligand. Very intense (ε > 10,000) + broad. Metal complexes + donor-acceptor organics.
6. **d-d** (transition metal complexes): Weak broad in visible → crystal/ligand field splitting.

→ Each band assigned → transition type w/ rationale (pos, int, solvent sensitivity).

**If err:** Band unassignable → consider charge-transfer character / impurity abs. Multiple overlapping → deconvolution.

### Step 4: Woodward-Fieser Rules for Conjugated Sys

Predict λ-max for conjugated dienes + enones, compare observed:

1. **Conjugated dienes** (Woodward):

| Component | Increment (nm) |
|-----------|----------------|
| Base value (heteroannular diene) | 214 |
| Base value (homoannular diene) | 253 |
| Each additional conjugated C=C | +30 |
| Each exocyclic C=C | +5 |
| Each alkyl substituent on C=C | +5 |
| -OAcyl substituent | +0 |
| -OR substituent | +6 |
| -SR substituent | +30 |
| -Cl, -Br substituent | +5 |
| -NR2 substituent | +5 |

2. **α-β unsaturated carbonyls** (Woodward-Fieser):

| Component | Increment (nm) |
|-----------|----------------|
| Base value (alpha-beta unsat. ketone, 6-ring or acyclic) | 215 |
| Base value (alpha-beta unsat. aldehyde) | 208 |
| Each additional conjugated C=C | +30 |
| Each exocyclic C=C | +5 |
| Homoannular diene component | +39 |
| Alpha substituent (alkyl) | +10 |
| Beta substituent (alkyl) | +12 |
| Gamma and higher substituent (alkyl) | +18 |
| -OH (alpha) | +35 |
| -OH (beta) | +30 |
| -OAc (alpha, beta, gamma) | +6 |
| -OR (alpha) | +35 |
| -OR (beta) | +30 |
| -Cl (alpha) | +15 |
| -Cl (beta) | +12 |
| -Br (beta) | +25 |
| -NR2 (beta) | +95 |

3. **Calc predicted λ-max**: Sum base + all applicable increments.
4. **Compare observed**: ±5 nm → supports proposed chromophore. Deviations > 10 nm → incorrect assignment / strong solvent+steric effects.

→ Predicted λ-max calc + compared observed → supports/refutes proposed chromophore.

**If err:** Disagreement → re-examine chromophore. Common errs: miscount substituents, overlook exocyclic double bond, wrong base val (homoannular vs heteroannular).

### Step 5: Beer-Lambert for Quant

Absorbance → conc / ε characterization:

1. **Equation**: A = ε * b * c, A = abs (dimensionless), ε = molar absorptivity (L mol-1 cm-1), b = path length (cm), c = conc (mol L-1).
2. **Determine ε**: Conc + b known → calc ε from A at λ-max.
3. **Determine conc**: ε known (lit / calibration) → calc c from A.
4. **Linearity**: Valid in linear range (A = 0.1-1.0). Higher → deviations (stray light, mol interactions, instrumental).
5. **Solvent effects**: Compare polar vs non-polar:
   - **Bathochromic (red) shift**: λ-max → longer λ. π→π* red-shifts in more polar; n→π* in less polar.
   - **Hypsochromic (blue) shift**: λ-max → shorter λ. n→π* blue-shifts in more polar/protic (H-bonding stabilizes lone pair ground state).
   - **Hyperchromic/hypochromic**: Increase / decrease ε w/o λ change.

→ Quant results calc w/ appropriate sig figs, linearity verified, solvent effects documented if multi-solvent avail.

**If err:** Linearity fails → check sample degradation, aggregation at high conc, fluorescence interference. Dilute + remeasure to confirm.

## Check

- [ ] Solvent cutoff respected + abs in linear range (0.1-1.0)
- [ ] All λ-max + shoulders tabulated w/ λ, abs, ε
- [ ] Each band → electronic transition type
- [ ] Woodward-Fieser calc where applicable + compared observed
- [ ] Beer-Lambert applied correctly w/ verified linearity
- [ ] Solvent effects characterized if multi-solvent
- [ ] Chromophore consistent w/ structure from other spectra

## Traps

- **Measure > A=1.0**: Unreliable due to stray light. Always dilute + remeasure if λ-max abs > 1.0.
- **Ignore solvent cutoff**: Interpret abs below cutoff → artifacts, not real.
- **Confuse transition types by intensity**: Weak band ~280 could be n→π* carbonyl / forbidden π→π* aromatic. Context + solvent effects distinguish.
- **Misapply Woodward-Fieser**: Empirical rules → conjugated dienes + α-β unsat carbonyls only. Not for aromatic sys, isolated chromophores, metal complexes.
- **Neglect impurity abs**: Small amount of strongly-absorbing impurity → dominate spectrum. λ-max mismatch expectations → consider impurity.
- **Assume 1 band = 1 transition**: Broad bands often multi overlapping transitions. Deconvolution may be needed.

## →

- `interpret-nmr-spectrum` — mol connectivity → support chromophore ID
- `interpret-ir-spectrum` — func groups contributing to chromophore
- `interpret-mass-spectrum` — formula + detect conjugation via frag
- `interpret-raman-spectrum` — complementary vibrational → symmetric chromophores
- `plan-spectroscopic-analysis` — select + sequence techniques pre-acquisition
