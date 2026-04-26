---
name: plan-spectroscopic-analysis
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Plan spectroscopic analysis campaign: define analytical question, assess
  sample, pick techniques via decision matrix, plan prep per technique,
  sequence non-destructive → destructive, define success criteria w/
  cross-validation strategy.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: spectroscopy
  complexity: intermediate
  language: natural
  tags: spectroscopy, analytical-planning, technique-selection, sample-preparation
---

# Plan Spectroscopic Analysis

Design spectroscopic campaign: pick right techniques, sequence efficiently, define success criteria → answer specific analytical question.

## Use When

- Investigate unknown compound → which spectroscopic techniques?
- Optimize analysis sequence → preserve sample for destructive methods
- Plan sample prep before instrument time
- Cross-validate complementary techniques
- Budget instrument time + prioritize when resources limited
- Train new analysts in systematic planning

## In

- **Required**: Analytical question (structure ID, quantitation, purity, functional group screen, reaction monitoring)
- **Required**: Sample desc (physical state, qty, known/suspected class)
- **Optional**: Available instruments + capabilities
- **Optional**: Budget + time constraints
- **Optional**: Safety data (toxicity, reactivity, volatility, light)
- **Optional**: Prior data (if any)

## Do

### Step 1: Define Analytical Question

Clarify info needed before picking technique.

1. **Classify question**:
   - **Structure ID**: Full molecular structure of unknown. Broadest set.
   - **Structure confirm**: Known compound matches expected. Few, focused on diagnostics.
   - **Quantitative**: Concentration of known analyte. Calibration + good linearity (UV-Vis, NMR w/ internal std).
   - **Purity**: Impurities present? Identify? High sensitivity + separation.
   - **Functional group screen**: Which groups present, no full structure. IR often enough.
   - **Reaction monitor**: Track reaction over time. Speed + compatibility w/ conditions (in situ IR, Raman, UV-Vis).

2. **Success criteria**: Explicit. Structure ID → "single proposal consistent w/ all data". Quantitation → "concentration w/ <5% rel error".

3. **Existing knowledge**: Compile (elemental analysis, reaction scheme, expected product, lit precedent). Constrains problem, fewer techniques needed.

→ Clear analytical question w/ success criteria + existing knowledge summary.

If err: question vague ("characterize this") → narrow w/ requestor. Vague → unfocused → wasted instrument time.

### Step 2: Assess Sample Characteristics

Eval sample → which techniques feasible.

1. **Physical state**: Solid (crystalline, amorphous, powder), liquid, solution, gas, thin film, biological tissue. Each constrains prep + technique.
2. **Quantity**: Total mass/vol. NMR needs mg, MS µg, SERS ng.
3. **Solubility**: Test/estimate in common solvents (water, methanol, DMSO, chloroform, hexane). NMR → deuterated solvent. UV-Vis → transparent.
4. **Stability**: Thermal (GC-MS needs volatilization), photo (Raman uses laser), air/moisture (KBr pellet), solution (time-dependent).
5. **Safety**: Toxicity, flammability, reactivity, radioactivity. Affects handling, may exclude techniques (volatile toxics → no open-atmosphere Raman w/o containment).
6. **MW range**: Small (<1000 Da) vs polymers/biomolecules (>1000 Da) → different MS ionization + NMR strategies.

→ Sample characterization summary: state, qty, solubility, stability, hazards, MW range.

If err: can't characterize adequately (qty too small to test solubility) → conservative: start non-destructive minimal-sample (Raman, ATR-IR), reassess after.

### Step 3: Select Techniques via Decision Matrix

Pick most informative techniques based on question + sample.

| Technique | Best For | Sample Needs | Destructive? | Sensitivity | Key Limitations |
|-----------|----------|-------------|--------------|-------------|-----------------|
| 1H NMR | H connectivity, integration, coupling | 1--10 mg in deuterated solvent | No | mg | Requires solubility, insensitive |
| 13C NMR | Carbon skeleton, functional groups | 10--50 mg in deuterated solvent | No | mg | Very insensitive, long acquisition |
| 2D NMR | Full connectivity, stereochemistry | 5--20 mg in deuterated solvent | No | mg | Hours of instrument time |
| IR (ATR) | Functional group ID | Any solid/liquid, minimal prep | No | ug | Water interference, fingerprint overlap |
| IR (KBr) | Functional group ID, transmission | 1--2 mg solid in KBr pellet | No* | ug | Moisture sensitive, sample mixed |
| Raman | Symmetric modes, aqueous samples | Any state, no prep for solids | No | ug--mg | Fluorescence, photodegradation |
| EI-MS | Volatile small molecules, fragmentation | ug, must be volatile | Yes (GC-MS) | ng--ug | Requires volatility |
| ESI-MS | Polar/large molecules, MW determination | Solution in volatile solvent | Yes | pg--ng | Adduct complexity, ion suppression |
| MALDI-MS | Polymers, proteins, large molecules | Solid + matrix | Yes | fmol | Matrix interference below 500 Da |
| UV-Vis | Chromophores, quantitation | Solution, ug--mg | No | ug | Limited structural information |

*IR with KBr is non-destructive to the molecule but the sample cannot be easily recovered from the pellet.

1. **Match question to technique**: Structure ID → NMR + MS + IR min. Functional group → IR only. Quantitation → UV-Vis or NMR best.
2. **Feasibility**: Cross-ref candidates w/ Step 2 sample. Eliminate incompatible (GC-MS for non-volatile, NMR for paramagnetic).
3. **Prioritize by info density**: Rank by info per question.
4. **Cost + availability**: If equal info, prefer faster, cheaper, more available.

→ Ranked list of techniques w/ justification + excluded ones w/ reasons.

If err: no single sufficient (common for structure ID) → plan complementary techniques together. None suitable → note limitation, recommend alts (derivatization → GC-MS).

### Step 4: Plan Sample Prep per Technique

Prep reqs per selected technique.

1. **NMR prep**: Dissolve 1-50 mg in 0.5-0.7 mL deuterated solvent. Solvent by solubility + spectral window:

| Solvent | 1H Residual | Use When |
|---------|-------------|----------|
| CDCl3 | 7.26 ppm | Non-polar to moderately polar compounds |
| DMSO-d6 | 2.50 ppm | Polar compounds, broad solubility |
| D2O | 4.79 ppm | Water-soluble compounds, peptides |
| CD3OD | 3.31 ppm | Polar organic compounds |
| C6D6 | 7.16 ppm | Aromatic region overlap avoidance |

2. **IR prep**: Method by sample state:
   - **ATR**: Solid/liquid direct on crystal. Fastest, minimal prep.
   - **KBr pellet**: Grind 1-2 mg w/ 100-200 mg dry KBr, press into transparent disk.
   - **Solution cell**: Dissolve in IR-transparent solvent (CCl4, CS2). Limited transparency windows.
   - **Thin film**: Cast from solution onto NaCl/KBr window. Polymers + oils.

3. **MS prep**: Match ionization to sample:
   - **EI (GC-MS)**: Sample volatile. Volatile solvent (DCM, hexane).
   - **ESI (LC-MS)**: ESI-compatible solvent (methanol/water, acetonitrile/water w/ 0.1% formic acid).
   - **MALDI**: Mix w/ matrix (DHB, CHCA, sinapinic acid), dry on target.

4. **UV-Vis prep**: UV-transparent solvent. Conc → absorbance at lambda-max 0.1-1.0. Matched cuvettes for sample + ref.

5. **Raman prep**: Minimal. Solids neat. Liquids in glass vials (weak Raman). Avoid fluorescent containers. Aqueous solutions OK (water = weak Raman scatterer).

→ Prep protocol per technique: solvents, qtys, special handling.

If err: qty insufficient for all → prioritize by Step 3 hierarchy. Insoluble in all suitable → solid-state techniques (ATR-IR, Raman, solid-state NMR, MALDI-MS).

### Step 5: Sequence + Cross-Validation Strategy

Order analyses → preserve sample, max info flow.

1. **Sequence by destructiveness**: Non-destructive first, destructive last.
   - **Tier 1 (non-destructive, no prep)**: Raman, ATR-IR
   - **Tier 2 (non-destructive, requires prep)**: UV-Vis, NMR (sample often recoverable by evaporation)
   - **Tier 3 (destructive or consumes sample)**: MS (ESI, EI/GC-MS, MALDI)

2. **Info flow**: Early results refine later:
   - IR/Raman functional groups → choose NMR experiments (no carbonyl in IR → skip carbonyl-focused 13C).
   - MW from MS → interpret NMR (integration ratios, peak count).
   - NMR connectivity → interpret MS fragmentation.

3. **Cross-validation points**: Where techniques must agree:
   - Molecular formula: MS (mol ion) = NMR (H + C count) = elemental analysis.
   - Functional groups: IR assignments consistent w/ NMR shifts + MS fragmentation.
   - Degree of unsaturation: From formula (MS) = observed rings + double bonds (NMR, UV-Vis).

4. **Contingencies**: What if ambiguous:
   - NMR unexpected complexity → run 2D (COSY, HSQC, HMBC).
   - MS mol ion ambiguous → different ionization or HRMS.
   - IR dominated by one group → Raman for complementary.

5. **Document plan**: Written plan w/ sequence, prep, turnaround, decision points.

→ Complete ordered plan w/ prep, cross-validation, contingencies doc'd.

If err: plan can't complete due to sample/instrument → doc limitations, propose best achievable subset.

## Check

- [ ] Analytical question clear w/ explicit success criteria
- [ ] Sample characteristics assessed (state, qty, solubility, stability, hazards)
- [ ] Techniques selected via decision matrix w/ justifications
- [ ] Infeasible techniques excluded w/ reasons
- [ ] Sample prep planned per technique
- [ ] Analysis sequence non-destructive → destructive
- [ ] Cross-validation points defined
- [ ] Contingency experiments ID'd for ambiguous
- [ ] Total sample consumption estimated vs available qty

## Traps

- **Skip planning**: Jumping to nearest instrument → wastes sample + time. 15 min planning saves hours of re-analysis.
- **Pick by habit not need**: Not every analysis needs NMR. Functional group confirm → only IR. Match technique to question.
- **Underestimate sample reqs**: Running out mid-sequence avoidable. Calc total upfront + 20% reserve.
- **Destructive methods first**: GC-MS before NMR → NMR needs separate aliquot. Non-destructive first → max info per mg.
- **Neglect solvent compat**: Sample in DMSO-d6 (NMR) → not easy for GC-MS (non-volatile). Plan solvents across all.
- **No cross-validation strategy**: No checkpoints → contradictory results unnoticed until final interp.

## →

- `interpret-nmr-spectrum` — interpret NMR per this plan
- `interpret-ir-spectrum` — interpret IR per this plan
- `interpret-mass-spectrum` — interpret MS per this plan
- `interpret-uv-vis-spectrum` — interpret UV-Vis per this plan
- `interpret-raman-spectrum` — interpret Raman per this plan
- `validate-analytical-method` — validate quantitative methods from this plan
