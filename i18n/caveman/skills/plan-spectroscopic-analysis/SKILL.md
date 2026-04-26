---
name: plan-spectroscopic-analysis
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Plan a comprehensive spectroscopic analysis campaign by defining the
  analytical question, assessing sample characteristics, selecting appropriate
  techniques using a decision matrix, planning sample preparation for each
  technique, sequencing analyses from non-destructive to destructive, and
  defining success criteria with a cross-validation strategy.
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

Design spectroscopic analysis campaign. Pick right techniques, sequence them, define success criteria for answering specific analytical question about a sample.

## When Use

- Starting investigation of unknown compound — deciding which spectroscopic techniques to use
- Optimizing analysis sequence to preserve sample for destructive methods
- Planning sample preparation requirements before acquiring instrument time
- Ensuring cross-validation between complementary techniques
- Budgeting instrument time and prioritizing techniques when resources limited
- Training new analysts in systematic analytical planning

## Inputs

- **Required**: Analytical question (structure ID, quantitation, purity assessment, functional group screening, reaction monitoring)
- **Required**: Sample description (physical state, approximate quantity, known or suspected compound class)
- **Optional**: Available instruments and capabilities
- **Optional**: Budget and time constraints
- **Optional**: Safety data (toxicity, reactivity, volatility, light sensitivity)
- **Optional**: Prior analytical data (if any results already exist)

## Steps

### Step 1: Define Analytical Question

Clarify exactly what info needed before picking any technique:

1. **Classify question type**:
   - **Structure identification**: Determine complete molecular structure of unknown compound. Needs broadest set of techniques.
   - **Structure confirmation**: Verify known compound matches expected structure. Fewer techniques, focused on diagnostic features.
   - **Quantitative analysis**: Determine concentration or amount of known analyte. Needs calibration and technique with good linearity (UV-Vis, NMR with internal standard).
   - **Purity assessment**: Determine if sample contains impurities and identify them. Needs high sensitivity and separation capability.
   - **Functional group screening**: Identify which functional groups present without full structure determination. IR often enough.
   - **Reaction monitoring**: Track progress of chemical reaction over time. Needs speed and compatibility with reaction conditions (in situ IR, Raman, UV-Vis).

2. **Define success criteria**: State explicitly what counts as satisfactory answer. For structure ID: "single structural proposal consistent with all spectroscopic data." For quantitation: "concentration determined with < 5% relative error."

3. **Assess what already known**: Compile existing info about sample (elemental analysis, reaction scheme, expected product, literature precedent). Constrains problem. Reduces number of techniques needed.

**Got:** Clearly stated analytical question with defined success criteria. Summary of existing knowledge about sample.

**If fail:** Analytical question vague ("characterize this sample")? Work with requestor to narrow it. Vague question → unfocused analysis and wasted instrument time.

### Step 2: Assess Sample Characteristics

Evaluate sample to determine which techniques feasible:

1. **Physical state**: Solid (crystalline, amorphous, powder), liquid, solution, gas, thin film, biological tissue. Each state constrains which sample preparation methods and techniques apply.
2. **Quantity available**: Estimate total sample mass or volume. Some techniques need milligrams (NMR), others work with micrograms (MS) or nanograms (SERS).
3. **Solubility**: Test or estimate solubility in common solvents (water, methanol, DMSO, chloroform, hexane). NMR needs deuterated solvent. UV-Vis needs transparent solvent.
4. **Stability**: Assess thermal stability (for GC-MS — needs volatilization), photostability (for Raman — uses laser excitation), air/moisture sensitivity (for KBr pellet preparation), solution stability (for time-dependent measurements).
5. **Safety hazards**: Note toxicity, flammability, reactivity, radioactivity. Affects handling protocols. May exclude certain techniques (e.g. volatile toxic compounds shouldn't be analyzed by open-atmosphere Raman without containment).
6. **Expected molecular weight range**: Small organics (< 1000 Da) vs polymers/biomolecules (> 1000 Da) need different MS ionization methods and different NMR acquisition strategies.

**Got:** Sample characterization summary listing state, quantity, solubility, stability, hazards, molecular weight range.

**If fail:** Sample can't be characterized adequately (e.g. quantity too small to test solubility)? Adopt conservative approach: start with non-destructive, minimal-sample techniques (Raman, ATR-IR). Assess further after initial results.

### Step 3: Select Techniques Using Decision Matrix

Pick most informative techniques based on analytical question and sample characteristics:

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

*IR with KBr is non-destructive to molecule but sample can't easily be recovered from pellet.

1. **Match question to technique**: Structure ID usually needs NMR + MS + IR min. Functional group screening needs only IR. Quantitation works best with UV-Vis or NMR.
2. **Check feasibility**: Cross-reference each candidate technique with sample characteristics from Step 2. Eliminate incompatible ones (e.g. GC-MS for non-volatile compounds, NMR for paramagnetic samples).
3. **Prioritize by information density**: Rank remaining techniques by how much information they provide toward answering specific question.
4. **Consider cost and availability**: Multiple techniques provide similar info? Prefer one that's faster, cheaper, more readily available.

**Got:** Ranked list of selected techniques with reason per choice. Notes on excluded techniques and why.

**If fail:** No single technique sufficient (common for structure ID)? Plan should include complementary techniques together answering question. No suitable technique available? Note limitation. Recommend alternative analytical approaches (e.g. derivatization to make sample suitable for GC-MS).

### Step 4: Plan Sample Preparation per Technique

Define specific preparation requirements for each selected technique:

1. **NMR preparation**: Dissolve 1--50 mg sample in 0.5--0.7 mL of deuterated solvent. Pick solvent based on solubility and spectral window:

| Solvent | 1H Residual | Use When |
|---------|-------------|----------|
| CDCl3 | 7.26 ppm | Non-polar to moderately polar compounds |
| DMSO-d6 | 2.50 ppm | Polar compounds, broad solubility |
| D2O | 4.79 ppm | Water-soluble compounds, peptides |
| CD3OD | 3.31 ppm | Polar organic compounds |
| C6D6 | 7.16 ppm | Aromatic region overlap avoidance |

2. **IR preparation**: Pick method based on sample state:
   - **ATR**: Place solid or liquid direct on crystal. Fastest, minimal preparation.
   - **KBr pellet**: Grind 1--2 mg sample with 100--200 mg dry KBr. Press into transparent disk.
   - **Solution cell**: Dissolve in IR-transparent solvent (CCl4, CS2). Limited windows of transparency.
   - **Thin film**: Cast from solution onto NaCl or KBr window. Good for polymers and oils.

3. **MS preparation**: Match ionization method to sample:
   - **EI (GC-MS)**: Sample must be volatile. Dissolve in volatile solvent (dichloromethane, hexane).
   - **ESI (LC-MS)**: Dissolve in ESI-compatible solvent (methanol/water, acetonitrile/water with 0.1% formic acid).
   - **MALDI**: Mix with appropriate matrix (DHB, CHCA, sinapinic acid). Dry on target plate.

4. **UV-Vis preparation**: Dissolve in UV-transparent solvent. Adjust concentration so absorbance at lambda-max between 0.1 and 1.0. Use matched cuvettes for sample and reference.

5. **Raman preparation**: Minimal preparation needed for most samples. Solids measured neat. Liquids in glass vials (glass has weak Raman scattering). Avoid fluorescent containers. For aqueous solutions, Raman works well — water is weak Raman scatterer.

**Got:** Preparation protocol per selected technique — solvent choices, quantities needed, special handling instructions.

**If fail:** Sample quantity insufficient for all planned techniques? Prioritize based on information hierarchy from Step 3. Sample insoluble in all suitable solvents? Consider solid-state techniques (ATR-IR, Raman, solid-state NMR, MALDI-MS).

### Step 5: Determine Analysis Sequence and Cross-Validation Strategy

Order analyses to preserve sample and maximize information flow:

1. **Sequence by destructiveness**: Non-destructive first, destructive last.
   - **First tier (non-destructive, no preparation)**: Raman, ATR-IR
   - **Second tier (non-destructive, requires preparation)**: UV-Vis, NMR (sample often recoverable by evaporating solvent)
   - **Third tier (destructive or consumes sample)**: MS (ESI, EI/GC-MS, MALDI)

2. **Information flow**: Use early results to refine later analyses:
   - IR/Raman functional group data helps choose best NMR experiments (e.g. IR shows no carbonyl → skip carbonyl-focused 13C analysis).
   - Molecular formula from MS helps interpret NMR (integration ratios, expected number of peaks).
   - NMR connectivity data helps interpret MS fragmentation.

3. **Define cross-validation points**: Identify where results from different techniques should agree:
   - Molecular formula: MS (molecular ion) must match NMR (H and C count) and elemental analysis.
   - Functional groups: IR assignments must be consistent with NMR chemical shifts and MS fragmentation.
   - Degree of unsaturation: Calculated from formula (MS) must match observed rings and double bonds (NMR, UV-Vis).

4. **Plan for contingencies**: Define what additional experiments to run if initial results ambiguous:
   - NMR shows unexpected complexity → run 2D experiments (COSY, HSQC, HMBC).
   - MS molecular ion ambiguous → try different ionization method or request HRMS.
   - IR dominated by one functional group → try Raman for complementary information.

5. **Document the plan**: Produce written analysis plan with technique sequence, sample preparation steps, expected turnaround time, decision points for contingency experiments.

**Got:** Complete, ordered analysis plan with preparation protocols, cross-validation criteria, contingency provisions documented.

**If fail:** Plan can't be completed due to sample or instrument constraints? Document limitations explicitly. Propose best achievable subset of analyses.

## Checks

- [ ] Analytical question clearly defined with explicit success criteria
- [ ] Sample characteristics assessed (state, quantity, solubility, stability, hazards)
- [ ] Techniques selected using decision matrix with reasons documented
- [ ] Infeasible techniques identified and excluded with reasons
- [ ] Sample preparation planned per selected technique
- [ ] Analysis sequence ordered from non-destructive to destructive
- [ ] Cross-validation points defined between complementary techniques
- [ ] Contingency experiments identified for ambiguous results
- [ ] Total sample consumption estimated and verified against available quantity

## Pitfalls

- **Skip planning phase**: Jumping direct to nearest available instrument wastes sample and time. Even 15 min of planning saves hours of re-analysis.
- **Pick techniques by habit not need**: Not every analysis needs NMR. Simple functional group confirmation may need only IR. Match technique to question.
- **Underestimate sample requirements**: Running out of sample midway through analysis sequence is avoidable. Compute total sample needs upfront. Add 20% reserve.
- **Run destructive methods first**: GC-MS before NMR means NMR sample must come from separate aliquot. Sequence non-destructive methods first to max information per milligram.
- **Neglect solvent compatibility**: Sample dissolved in DMSO-d6 for NMR can't easily be used for GC-MS (non-volatile solvent). Plan solvent choices across all techniques.
- **No cross-validation strategy**: Without defined checkpoints, contradictory results from different techniques may go unnoticed until final interpretation stage.

## See Also

- `interpret-nmr-spectrum` -- interpret NMR data acquired per this plan
- `interpret-ir-spectrum` -- interpret IR data acquired per this plan
- `interpret-mass-spectrum` -- interpret MS data acquired per this plan
- `interpret-uv-vis-spectrum` -- interpret UV-Vis data acquired per this plan
- `interpret-raman-spectrum` -- interpret Raman data acquired per this plan
- `validate-analytical-method` -- validate quantitative methods selected in this plan
