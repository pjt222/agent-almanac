---
name: plan-spectroscopic-analysis
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

Design a spectroscopic analysis campaign that selects the right techniques, sequences them efficiently, and defines success criteria for answering a specific analytical question about a sample.

## When to Use

- Starting an investigation of an unknown compound and deciding which spectroscopic techniques to use
- Optimizing the analysis sequence to preserve sample for destructive methods
- Planning sample preparation requirements before acquiring instrument time
- Ensuring cross-validation between complementary techniques
- Budgeting instrument time and prioritizing techniques when resources are limited
- Training new analysts in systematic analytical planning

## Inputs

- **Required**: Analytical question (structure identification, quantitation, purity assessment, functional group screening, or reaction monitoring)
- **Required**: Sample description (physical state, approximate quantity, known or suspected compound class)
- **Optional**: Available instruments and their capabilities
- **Optional**: Budget and time constraints
- **Optional**: Safety data (toxicity, reactivity, volatility, light sensitivity)
- **Optional**: Prior analytical data (if any results already exist)

## Procedure

### Step 1: Define the Analytical Question

Clarify exactly what information is needed before selecting any technique:

1. **Classify the question type**:
   - **Structure identification**: Determine the complete molecular structure of an unknown compound. Requires the broadest set of techniques.
   - **Structure confirmation**: Verify that a known compound matches its expected structure. Fewer techniques needed, focused on diagnostic features.
   - **Quantitative analysis**: Determine the concentration or amount of a known analyte. Requires calibration and a technique with good linearity (UV-Vis, NMR with internal standard).
   - **Purity assessment**: Determine whether a sample contains impurities and, if so, identify them. Requires high sensitivity and separation capability.
   - **Functional group screening**: Identify which functional groups are present without full structure determination. IR is often sufficient.
   - **Reaction monitoring**: Track the progress of a chemical reaction over time. Requires speed and compatibility with the reaction conditions (in situ IR, Raman, or UV-Vis).

2. **Define the success criteria**: State explicitly what constitutes a satisfactory answer. For structure identification: "a single structural proposal consistent with all spectroscopic data." For quantitation: "concentration determined with < 5% relative error."

3. **Assess what is already known**: Compile any existing information about the sample (elemental analysis, reaction scheme, expected product, literature precedent). This constrains the problem and reduces the number of techniques needed.

**Expected:** A clearly stated analytical question with defined success criteria and a summary of existing knowledge about the sample.

**On failure:** If the analytical question is vague ("characterize this sample"), work with the requestor to narrow it down. A vague question leads to unfocused analysis and wasted instrument time.

### Step 2: Assess Sample Characteristics

Evaluate the sample to determine which techniques are feasible:

1. **Physical state**: Solid (crystalline, amorphous, powder), liquid, solution, gas, thin film, or biological tissue. Each state constrains which sample preparation methods and techniques are applicable.
2. **Quantity available**: Estimate the total sample mass or volume. Some techniques require milligrams (NMR), others work with micrograms (MS) or nanograms (SERS).
3. **Solubility**: Test or estimate solubility in common solvents (water, methanol, DMSO, chloroform, hexane). NMR requires a deuterated solvent; UV-Vis requires a transparent solvent.
4. **Stability**: Assess thermal stability (for GC-MS, which requires volatilization), photostability (for Raman, which uses laser excitation), air/moisture sensitivity (for KBr pellet preparation), and solution stability (for time-dependent measurements).
5. **Safety hazards**: Note toxicity, flammability, reactivity, and radioactivity. These affect handling protocols and may exclude certain techniques (e.g., volatile toxic compounds should not be analyzed by open-atmosphere Raman without containment).
6. **Expected molecular weight range**: Small organics (< 1000 Da) vs. polymers/biomolecules (> 1000 Da) require different MS ionization methods and different NMR acquisition strategies.

**Expected:** A sample characterization summary listing state, quantity, solubility, stability, hazards, and molecular weight range.

**On failure:** If the sample cannot be characterized adequately (e.g., quantity is too small to test solubility), adopt a conservative approach: start with non-destructive, minimal-sample techniques (Raman, ATR-IR) and assess further after initial results.

### Step 3: Select Techniques Using the Decision Matrix

Choose the most informative techniques based on the analytical question and sample characteristics:

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

1. **Match question to technique**: Structure ID typically requires NMR + MS + IR at minimum. Functional group screening needs only IR. Quantitation works best with UV-Vis or NMR.
2. **Check feasibility**: Cross-reference each candidate technique with the sample characteristics from Step 2. Eliminate techniques that are incompatible (e.g., GC-MS for non-volatile compounds, NMR for paramagnetic samples).
3. **Prioritize by information density**: Rank the remaining techniques by how much information they provide toward answering the specific question.
4. **Consider cost and availability**: If multiple techniques provide similar information, prefer the one that is faster, cheaper, or more readily available.

**Expected:** A ranked list of selected techniques with justification for each choice and notes on any techniques excluded and why.

**On failure:** If no single technique is sufficient (which is common for structure identification), the plan should include complementary techniques that together answer the question. If no suitable technique is available, note the limitation and recommend alternative analytical approaches (e.g., derivatization to make the sample suitable for GC-MS).

### Step 4: Plan Sample Preparation for Each Technique

Define specific preparation requirements for each selected technique:

1. **NMR preparation**: Dissolve 1--50 mg sample in 0.5--0.7 mL of deuterated solvent. Choose solvent based on solubility and spectral window:

| Solvent | 1H Residual | Use When |
|---------|-------------|----------|
| CDCl3 | 7.26 ppm | Non-polar to moderately polar compounds |
| DMSO-d6 | 2.50 ppm | Polar compounds, broad solubility |
| D2O | 4.79 ppm | Water-soluble compounds, peptides |
| CD3OD | 3.31 ppm | Polar organic compounds |
| C6D6 | 7.16 ppm | Aromatic region overlap avoidance |

2. **IR preparation**: Select method based on sample state:
   - **ATR**: Place solid or liquid directly on the crystal. Fastest, minimal preparation.
   - **KBr pellet**: Grind 1--2 mg sample with 100--200 mg dry KBr, press into a transparent disk.
   - **Solution cell**: Dissolve in IR-transparent solvent (CCl4, CS2). Limited windows of transparency.
   - **Thin film**: Cast from solution onto NaCl or KBr window. Good for polymers and oils.

3. **MS preparation**: Match ionization method to sample:
   - **EI (GC-MS)**: Sample must be volatile. Dissolve in volatile solvent (dichloromethane, hexane).
   - **ESI (LC-MS)**: Dissolve in ESI-compatible solvent (methanol/water, acetonitrile/water with 0.1% formic acid).
   - **MALDI**: Mix with appropriate matrix (DHB, CHCA, sinapinic acid) and dry on the target plate.

4. **UV-Vis preparation**: Dissolve in UV-transparent solvent. Adjust concentration so that absorbance at lambda-max is between 0.1 and 1.0. Use matched cuvettes for sample and reference.

5. **Raman preparation**: Minimal preparation needed for most samples. Solids can be measured neat. Liquids in glass vials (glass has weak Raman scattering). Avoid fluorescent containers. For aqueous solutions, Raman works well because water is a weak Raman scatterer.

**Expected:** A preparation protocol for each selected technique, including solvent choices, quantities needed, and special handling instructions.

**On failure:** If sample quantity is insufficient for all planned techniques, prioritize based on the information hierarchy from Step 3. If sample is insoluble in all suitable solvents, consider solid-state techniques (ATR-IR, Raman, solid-state NMR, MALDI-MS).

### Step 5: Determine Analysis Sequence and Cross-Validation Strategy

Order the analyses to preserve sample and maximize information flow:

1. **Sequence by destructiveness**: Non-destructive techniques first, destructive last.
   - **First tier (non-destructive, no preparation)**: Raman, ATR-IR
   - **Second tier (non-destructive, requires preparation)**: UV-Vis, NMR (sample can often be recovered by evaporating solvent)
   - **Third tier (destructive or consumes sample)**: MS (ESI, EI/GC-MS, MALDI)

2. **Information flow**: Use early results to refine later analyses:
   - IR/Raman functional group data helps choose the best NMR experiments (e.g., if IR shows no carbonyl, skip carbonyl-focused 13C analysis).
   - Molecular formula from MS helps interpret NMR (integration ratios, expected number of peaks).
   - NMR connectivity data helps interpret MS fragmentation.

3. **Define cross-validation points**: Identify where results from different techniques should agree:
   - Molecular formula: MS (molecular ion) must match NMR (H and C count) and elemental analysis.
   - Functional groups: IR assignments must be consistent with NMR chemical shifts and MS fragmentation.
   - Degree of unsaturation: Calculated from formula (MS) must match observed rings and double bonds (NMR, UV-Vis).

4. **Plan for contingencies**: Define what additional experiments to run if initial results are ambiguous:
   - If NMR shows unexpected complexity: run 2D experiments (COSY, HSQC, HMBC).
   - If MS molecular ion is ambiguous: try a different ionization method or request HRMS.
   - If IR is dominated by one functional group: try Raman for complementary information.

5. **Document the plan**: Produce a written analysis plan with technique sequence, sample preparation steps, expected turnaround time, and decision points for contingency experiments.

**Expected:** A complete, ordered analysis plan with preparation protocols, cross-validation criteria, and contingency provisions documented.

**On failure:** If the plan cannot be completed due to sample or instrument constraints, document the limitations explicitly and propose the best achievable subset of analyses.

## Validation

- [ ] Analytical question clearly defined with explicit success criteria
- [ ] Sample characteristics assessed (state, quantity, solubility, stability, hazards)
- [ ] Techniques selected using the decision matrix with justifications documented
- [ ] Infeasible techniques identified and excluded with reasons
- [ ] Sample preparation planned for each selected technique
- [ ] Analysis sequence ordered from non-destructive to destructive
- [ ] Cross-validation points defined between complementary techniques
- [ ] Contingency experiments identified for ambiguous results
- [ ] Total sample consumption estimated and verified against available quantity

## Common Pitfalls

- **Skipping the planning phase**: Jumping directly to the nearest available instrument wastes sample and time. Even 15 minutes of planning saves hours of re-analysis.
- **Selecting techniques by habit rather than need**: Not every analysis requires NMR. A simple functional group confirmation may need only IR. Match the technique to the question.
- **Underestimating sample requirements**: Running out of sample midway through the analysis sequence is avoidable. Calculate total sample needs upfront and add a 20% reserve.
- **Running destructive methods first**: GC-MS before NMR means the NMR sample must come from a separate aliquot. Sequence non-destructive methods first to maximize information per milligram.
- **Neglecting solvent compatibility**: A sample dissolved in DMSO-d6 for NMR cannot easily be used for GC-MS (non-volatile solvent). Plan solvent choices across all techniques.
- **No cross-validation strategy**: Without defined checkpoints, contradictory results from different techniques may go unnoticed until the final interpretation stage.

## Related Skills

- `interpret-nmr-spectrum` -- interpret NMR data acquired according to this plan
- `interpret-ir-spectrum` -- interpret IR data acquired according to this plan
- `interpret-mass-spectrum` -- interpret MS data acquired according to this plan
- `interpret-uv-vis-spectrum` -- interpret UV-Vis data acquired according to this plan
- `interpret-raman-spectrum` -- interpret Raman data acquired according to this plan
- `validate-analytical-method` -- validate quantitative methods selected in this plan
