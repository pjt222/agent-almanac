---
name: evaluate-levitation-mechanism
description: >
  Evaluate and compare levitation mechanisms for a given application through
  a structured trade study. Covers magnetic (passive diamagnetic, active
  feedback, superconducting), acoustic (standing wave, phased array),
  aerodynamic (hovercraft, air bearings, Coanda effect), and electrostatic
  (Coulomb suspension, ion traps) mechanisms. Use when selecting the most
  appropriate levitation approach for transport, sample handling, display,
  bearings, or precision measurement applications.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: levitation
  complexity: intermediate
  language: natural
  tags: levitation, mechanism-selection, trade-study, magnetic, acoustic, aerodynamic, electrostatic
---

# Evaluate Levitation Mechanism

Select the most appropriate levitation mechanism for a specific application by defining requirements, screening candidates against hard constraints, scoring survivors on soft criteria, and documenting the decision in a reproducible trade study matrix.

## When to Use

- Choosing a levitation approach for a new product or experiment
- Comparing magnetic, acoustic, aerodynamic, and electrostatic options for a contactless handling system
- Justifying a design decision in a technical review or proposal
- Re-evaluating an existing levitation system when requirements change (e.g., new payload, environment, or cost target)
- Performing a feasibility study before committing to detailed design

## Inputs

- **Required**: Application description (what is being levitated, why contactless suspension is needed)
- **Required**: Payload properties (mass range, material, geometry, temperature sensitivity)
- **Required**: Operating environment (temperature range, atmosphere, cleanliness, vibration)
- **Optional**: Power budget (watts available)
- **Optional**: Cost target (prototype and production)
- **Optional**: Precision requirements (positioning accuracy, stiffness, vibration isolation)
- **Optional**: Lifetime and maintenance constraints

## Procedure

### Step 1: Define Application Requirements

Establish the complete set of requirements before evaluating any mechanism:

1. **Payload specification**: Mass (range from minimum to maximum), dimensions, material composition, magnetic properties (is it ferromagnetic? conductive? diamagnetic?), temperature limits (can it tolerate cryogenic temperatures? heating?), and surface sensitivity (does contact cause contamination or damage?).
2. **Performance requirements**: Levitation gap (mm to m), load capacity, positioning accuracy, stiffness (N/m), damping, dynamic range (static hold versus controlled motion).
3. **Environmental constraints**: Temperature range of the operating environment, atmospheric composition (air, vacuum, inert gas, liquid), cleanliness class (semiconductor fab, biological, industrial), acoustic noise limits, electromagnetic compatibility (EMC) requirements.
4. **Operational constraints**: Available power, physical envelope (size and weight of the levitation system itself), maintenance interval, lifetime, operator skill level.
5. **Economic constraints**: Prototype cost, production unit cost, development timeline.

```markdown
## Requirements Summary
| Category | Requirement | Value | Priority |
|----------|------------|-------|----------|
| Payload mass | Range | [min - max] kg | Must have |
| Payload material | Magnetic class | [ferro/para/dia/non-magnetic] | Must have |
| Gap | Levitation height | [value] mm | Must have |
| Precision | Position accuracy | [value] um | Want |
| Temperature | Operating range | [min - max] C | Must have |
| Power | Budget | [value] W | Want |
| Cost | Unit cost target | [value] | Want |
| Environment | Cleanliness | [class or none] | Must have |
| Noise | Acoustic limit | [value] dB | Want |
| EMC | Field emission limit | [value or none] | Want |
```

**Expected:** A requirements table with each requirement classified as "Must have" (hard constraint, pass/fail) or "Want" (soft criterion, scored on a scale). At least 5 requirements should be defined.

**On failure:** If the application is too vaguely defined to set quantitative requirements, interview the stakeholder or perform a boundary analysis: define the loosest acceptable range for each parameter. Proceeding without defined requirements leads to an arbitrary or biased trade study.

### Step 2: Catalog Candidate Mechanisms

Enumerate the levitation mechanisms to be evaluated, with their operating principles and fundamental limits:

1. **Passive diamagnetic levitation**: Uses the diamagnetic susceptibility of the levitated object (or a diamagnetic stabilizer) in a permanent magnet field. No power required. Limited to small payloads (milligrams to grams) with strongly diamagnetic materials (pyrolytic graphite, bismuth). Operates at room temperature.

2. **Active electromagnetic feedback**: Electromagnets with position sensors and a real-time controller. Handles payloads from grams to hundreds of tonnes (maglev trains). Requires continuous power and a control system. Applicable to ferromagnetic and conductive payloads.

3. **Superconducting levitation**: Type-II superconductors with flux pinning provide passive, powerless levitation with intrinsic stability. Requires cryogenic cooling (liquid nitrogen for YBCO at 77 K, liquid helium for conventional superconductors). Payload limited by superconductor size and critical current. Extremely stiff.

4. **Acoustic standing wave**: Ultrasonic transducers create pressure nodes that trap small objects. Payload limited to sub-wavelength objects (typically < 5 mm in air at 40 kHz). Requires continuous driving power. Works with any material regardless of magnetic or electrical properties. Generates audible harmonics and acoustic streaming.

5. **Acoustic phased array**: Extension of standing wave levitation using multiple independently controlled transducers. Enables 3D manipulation and repositioning. Higher complexity and cost but much greater flexibility.

6. **Aerodynamic (air bearings)**: A thin film of pressurized air supports the object. Used in precision stages, air hockey tables, and hovercraft. Requires a continuous air supply. Very low friction. Gap typically 5-25 micrometers for precision bearings, larger for hovercraft.

7. **Aerodynamic (Coanda/Bernoulli)**: A jet of air directed over a curved surface creates a low-pressure region that suspends an object. Simple and inexpensive. Low precision and stiffness. Used in demonstrations and some industrial handling.

8. **Electrostatic (Coulomb)**: Charged electrodes suspend a charged or dielectric object. Very low force (micronewtons to millinewtons) but applicable in vacuum. Used in space applications (gravitational wave detectors, inertial sensors) and microelectromechanical systems (MEMS).

9. **Electrostatic (ion trap)**: Oscillating electric fields (Paul trap) or combined static and magnetic fields (Penning trap) confine charged particles. Used for single ions to nanoparticles. Primarily a laboratory technique for atomic physics and mass spectrometry.

```markdown
## Candidate Mechanisms
| # | Mechanism | Payload Range | Power | Temperature | Any Material? |
|---|-----------|--------------|-------|-------------|--------------|
| 1 | Passive diamagnetic | mg - g | None | Room temp | No (diamagnetic only) |
| 2 | Active EM feedback | g - 100+ t | Continuous | Room temp | No (ferro/conductive) |
| 3 | Superconducting | g - kg | Cryocooler | < 77 K | No (above SC) |
| 4 | Acoustic standing wave | ug - g | Continuous | Room temp | Yes |
| 5 | Acoustic phased array | ug - g | Continuous | Room temp | Yes |
| 6 | Air bearing | g - t | Air supply | Room temp | Yes |
| 7 | Coanda/Bernoulli | g - kg | Air supply | Room temp | Yes |
| 8 | Electrostatic Coulomb | ug - mg | Minimal | Any (vacuum ok) | No (charged/dielectric) |
| 9 | Ion trap | atoms - ug | RF power | Any (vacuum) | No (ions only) |
```

**Expected:** A catalog of all physically plausible mechanisms with their fundamental characteristics summarized. Include at least 4 mechanisms spanning at least 2 different physical principles.

**On failure:** If a mechanism's fundamental limits are uncertain, consult the literature or use the related analysis skills (analyze-magnetic-levitation, design-acoustic-levitation) to establish them before proceeding to screening. Do not screen based on guesses.

### Step 3: Screen Against Hard Constraints

Eliminate mechanisms that fail any "Must have" requirement:

1. **Apply each hard constraint as a pass/fail filter**: For every mechanism in the catalog, check each "Must have" requirement. A single failure eliminates the mechanism.
2. **Common screening criteria**:
   - **Mass range**: If the payload exceeds the mechanism's fundamental mass limit, eliminate it (e.g., acoustic levitation cannot handle kilogram payloads).
   - **Material compatibility**: If the payload is non-magnetic and the mechanism requires magnetic material, eliminate it (e.g., passive diamagnetic levitation of a ferromagnetic object is not possible).
   - **Temperature**: If cryogenics are not feasible in the operating environment, eliminate superconducting levitation.
   - **Vacuum/atmosphere**: If the environment is vacuum, eliminate aerodynamic mechanisms. If EMC requires no magnetic fields, eliminate magnetic mechanisms.
   - **Contact**: Air bearings require proximity to a flat surface (quasi-contact). If true non-contact is required, eliminate them.
3. **Document eliminations with reasons**: Record why each eliminated mechanism fails, so the decision can be revisited if requirements change.

```markdown
## Screening Results
| # | Mechanism | Pass/Fail | Eliminating Constraint | Reason |
|---|-----------|-----------|----------------------|--------|
| 1 | Passive diamagnetic | [P/F] | [constraint or N/A] | [reason] |
| 2 | Active EM feedback | [P/F] | [constraint or N/A] | [reason] |
| ... | ... | ... | ... | ... |
```

**Expected:** A reduced list of candidate mechanisms, each having passed all hard constraints. At least one mechanism survives screening; ideally 2-4 remain for scoring.

**On failure:** If no mechanism passes all hard constraints, the requirements are mutually contradictory. Relax the least critical "Must have" requirement (reclassify it as "Want") and re-screen. If multiple requirements must be relaxed, the application may require a hybrid approach combining two mechanisms (e.g., magnetic primary force with aerodynamic stabilization).

### Step 4: Score on Soft Criteria

Rank the surviving mechanisms using a weighted scoring matrix:

1. **Define scoring criteria and weights**: Convert each "Want" requirement into a scoring criterion. Assign weights reflecting relative importance (e.g., 1-5 scale, or percentage weights summing to 100%). Common criteria include:
   - **Cost** (prototype and unit): weight by economic sensitivity
   - **Complexity**: number of components, control electronics, alignment criticality
   - **Precision**: positioning accuracy, stiffness, vibration isolation quality
   - **Power consumption**: operating watts, standby watts
   - **Scalability**: ability to handle a range of payloads or be manufactured in quantity
   - **Controllability**: ease of adjusting gap, position, or stiffness dynamically
   - **Maturity**: technology readiness level, availability of commercial components
   - **Noise**: acoustic, electromagnetic, or vibration emissions
2. **Score each mechanism**: Rate each surviving mechanism on each criterion using a consistent scale (e.g., 1 = poor, 3 = adequate, 5 = excellent). Base scores on quantitative data from Steps 1-3 where possible, not on subjective preference.
3. **Compute weighted scores**: For each mechanism, multiply each criterion score by its weight and sum. The mechanism with the highest weighted score is the top candidate.
4. **Sensitivity analysis**: Vary the top 2-3 weights by +/- 20% and check if the ranking changes. If the ranking is sensitive to weight choices, flag this and present the alternatives to the decision maker.

```markdown
## Scoring Matrix
| Criterion | Weight | Mech A | Mech B | Mech C |
|-----------|--------|--------|--------|--------|
| Cost | [w1] | [s1A] | [s1B] | [s1C] |
| Complexity | [w2] | [s2A] | [s2B] | [s2C] |
| Precision | [w3] | [s3A] | [s3B] | [s3C] |
| Power | [w4] | [s4A] | [s4B] | [s4C] |
| Scalability | [w5] | [s5A] | [s5B] | [s5C] |
| Controllability | [w6] | [s6A] | [s6B] | [s6C] |
| Maturity | [w7] | [s7A] | [s7B] | [s7C] |
| **Weighted Total** | | **[T_A]** | **[T_B]** | **[T_C]** |
| **Rank** | | [rank] | [rank] | [rank] |
```

**Expected:** A complete scoring matrix with all criteria weighted and all mechanisms scored. A clear ranking emerges, with the top candidate identified. Sensitivity analysis confirms the ranking is robust (or documents where it is fragile).

**On failure:** If two mechanisms score within 10% of each other, the decision is too close to call on paper. Recommend prototyping both and selecting based on experimental performance, or identify a discriminating test that would break the tie.

### Step 5: Document Recommendation and Trade Study

Produce the final trade study report:

1. **Recommendation**: State the recommended mechanism with a one-paragraph justification that references the scoring results and the key discriminating criteria.
2. **Runner-up**: Identify the second-place mechanism and explain under what changed conditions it would become the preferred choice (this serves as the fallback plan).
3. **Eliminated mechanisms**: Briefly list the eliminated mechanisms and their disqualifying constraints for completeness.
4. **Risks and mitigations**: For the recommended mechanism, identify the top 3 technical risks and proposed mitigations.
5. **Next steps**: Specify what detailed design work is needed (reference the appropriate analysis skill: analyze-magnetic-levitation for magnetic, design-acoustic-levitation for acoustic, etc.).

```markdown
## Trade Study Summary

### Recommendation
**[Mechanism name]** is recommended for [application] because [2-3 sentence justification
referencing the key scoring advantages].

### Runner-Up
**[Mechanism name]** would be preferred if [condition changes, e.g., "cryogenics become
available" or "payload mass decreases below X grams"].

### Eliminated Mechanisms
- [Mechanism]: eliminated by [constraint]
- [Mechanism]: eliminated by [constraint]

### Risks
| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| [Risk 1] | [H/M/L] | [H/M/L] | [action] |
| [Risk 2] | [H/M/L] | [H/M/L] | [action] |
| [Risk 3] | [H/M/L] | [H/M/L] | [action] |

### Next Steps
1. [Detailed analysis using specific skill]
2. [Prototype or simulation task]
3. [Experimental validation milestone]
```

**Expected:** A self-contained trade study document that another engineer could review, challenge, and act upon. The recommendation is traceable to the requirements and scoring, not to unstated preferences.

**On failure:** If the recommendation cannot be justified by the scoring alone (e.g., the top-scoring mechanism has a known showstopper that the criteria did not capture), revisit Step 1 to add the missing requirement. Do not override the scoring without documenting the reason.

## Validation

- [ ] Application requirements are defined with quantitative values and priority classification
- [ ] At least 4 levitation mechanisms spanning 2+ physical principles are cataloged
- [ ] Hard constraint screening is applied consistently with eliminations documented
- [ ] At least 2 mechanisms survive screening for meaningful comparison
- [ ] Scoring criteria have explicit weights and all scores are justified
- [ ] Sensitivity analysis is performed on the top 2-3 weight factors
- [ ] Recommendation includes justification traceable to the scoring matrix
- [ ] Runner-up and fallback conditions are documented
- [ ] Risks and mitigations are identified for the recommended mechanism
- [ ] The trade study is complete enough for an independent reviewer to verify

## Common Pitfalls

- **Anchoring on a preferred mechanism before the trade study**: Starting with a conclusion and reverse-engineering the requirements or weights to support it. The cure is to define requirements and weights before evaluating any mechanism. If you already know which mechanism you want, the trade study is a validation exercise, not a selection -- be honest about this.
- **Omitting mechanisms from unfamiliar domains**: Engineers with magnetic backgrounds overlook acoustic options and vice versa. Always include at least one mechanism from each of the four major families (magnetic, acoustic, aerodynamic, electrostatic) in the initial catalog, even if most will be screened out.
- **Confusing hard and soft constraints**: Treating a preference as a hard constraint eliminates viable options prematurely. Only truly non-negotiable requirements (safety, physics limits, regulatory) should be hard constraints. Everything else should be scored.
- **Equal weighting by default**: Assigning all criteria the same weight is a decision -- it implies all criteria are equally important. Stakeholders should explicitly prioritize. If they refuse, use pairwise comparison (AHP) to elicit implicit weights.
- **Ignoring system-level interactions**: A levitation mechanism does not exist in isolation. Acoustic levitation generates noise that may affect nearby instruments. Active magnetic levitation emits time-varying fields that may violate EMC requirements. Superconducting levitation requires a cryogenic infrastructure. Evaluate the mechanism within its system context.
- **Single-point scoring without uncertainty**: Rating a mechanism as "4" on cost implies false precision. If possible, express scores as ranges (e.g., "3-5") and propagate the uncertainty to the final ranking. If two mechanisms overlap in their score ranges, the ranking is not definitive.

## Related Skills

- `analyze-magnetic-levitation` -- detailed analysis when magnetic levitation is the recommended or candidate mechanism
- `design-acoustic-levitation` -- detailed design when acoustic levitation is selected
- `analyze-magnetic-field` -- compute the magnetic field profiles needed for magnetic levitation assessment
- `argumentation` -- structured reasoning and decision justification techniques applicable to the trade study
