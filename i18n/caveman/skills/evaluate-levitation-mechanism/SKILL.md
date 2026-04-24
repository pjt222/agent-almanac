---
name: evaluate-levitation-mechanism
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
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

Pick best levitation mechanism for specific app: set rules, screen candidates vs hard limits, score survivors on soft criteria, log pick in repeatable trade study matrix.

## When Use

- Pick levitation way for new product or experiment
- Compare magnetic, acoustic, aero, electrostatic options for contactless handling system
- Back design pick in tech review or proposal
- Re-eval old levitation system when rules shift (e.g., new payload, env, or cost target)
- Do feasibility study before commit to detail design

## Inputs

- **Required**: App description (what gets floated, why contactless hold needed)
- **Required**: Payload props (mass range, material, shape, temp sensitivity)
- **Required**: Op env (temp range, air, cleanliness, vibration)
- **Optional**: Power budget (watts open)
- **Optional**: Cost target (prototype and production)
- **Optional**: Precision rules (position accuracy, stiffness, vibration block)
- **Optional**: Life and upkeep limits

## Steps

### Step 1: Define Application Requirements

Set full rules before check any mechanism:

1. **Payload spec**: Mass (range min to max), size, material, magnetic props (ferro? conductive? diamagnetic?), temp limits (can it take cryo? heat?), surface sensitivity (does contact cause taint or damage?).
2. **Perf rules**: Levitation gap (mm to m), load cap, position accuracy, stiffness (N/m), damping, dynamic range (static hold vs controlled motion).
3. **Env limits**: Temp range of op env, atm mix (air, vacuum, inert gas, liquid), cleanliness class (semi fab, bio, industrial), acoustic noise caps, EMC rules.
4. **Op limits**: Open power, physical envelope (size and weight of levitation system itself), upkeep gap, life, operator skill.
5. **Econ limits**: Prototype cost, production unit cost, dev timeline.

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

**Got:** Rules table with each rule marked "Must have" (hard limit, pass/fail) or "Want" (soft, scored on scale). At least 5 rules set.

**If fail:** App too vague to set count rules? Talk to stakeholder or do edge check: set loosest OK range for each param. Going without set rules give arbitrary or biased trade study.

### Step 2: Catalog Candidate Mechanisms

List levitation mechanisms to check, with op rules and base limits:

1. **Passive diamagnetic levitation**: Uses diamagnetic pull of floated thing (or diamagnetic stabilizer) in permanent magnet field. No power. Only small payloads (milligrams to grams) with strong diamagnetic materials (pyrolytic graphite, bismuth). Works at room temp.

2. **Active electromagnetic feedback**: Electromagnets with position sensors and real-time controller. Handles payloads from grams to hundreds of tonnes (maglev trains). Needs continuous power and control system. For ferro and conductive payloads.

3. **Superconducting levitation**: Type-II superconductors with flux pinning give passive, powerless levitation with built-in stability. Needs cryo cool (liquid nitrogen for YBCO at 77 K, liquid helium for classic superconductors). Payload limit by superconductor size and critical current. Very stiff.

4. **Acoustic standing wave**: Ultrasonic transducers make pressure nodes that trap small things. Payload under wavelength (typically < 5 mm in air at 40 kHz). Needs continuous drive power. Works with any material no matter magnetic or electric props. Makes audible harmonics and acoustic streaming.

5. **Acoustic phased array**: Extension of standing wave levitation using many independent transducers. Does 3D move and reposition. More complex and costly but much more flex.

6. **Aerodynamic (air bearings)**: Thin film of pressurized air holds thing. Used in precision stages, air hockey tables, hovercraft. Needs continuous air supply. Very low friction. Gap usually 5-25 micrometers for precision bearings, bigger for hovercraft.

7. **Aerodynamic (Coanda/Bernoulli)**: Jet of air over curved surface makes low-pressure zone that holds thing. Simple and cheap. Low precision and stiffness. Used in demos and some industrial handling.

8. **Electrostatic (Coulomb)**: Charged electrodes hold charged or dielectric thing. Very low force (micronewtons to millinewtons) but works in vacuum. Used in space (gravity wave detectors, inertial sensors) and MEMS.

9. **Electrostatic (ion trap)**: Shifting electric fields (Paul trap) or mix static and magnetic fields (Penning trap) hold charged particles. Used for single ions to nanoparticles. Mostly lab technique for atomic physics and mass spec.

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

**Got:** List of all physically plausible mechanisms with base traits summed. At least 4 mechanisms across at least 2 different physics rules.

**If fail:** Mechanism base limits unsure? Check lit or use related skills (analyze-magnetic-levitation, design-acoustic-levitation) to set them before go to screen. Do not screen on guess.

### Step 3: Screen Against Hard Constraints

Kill mechanisms that fail any "Must have" rule:

1. **Apply each hard limit as pass/fail filter**: For every mechanism in list, check each "Must have" rule. One fail kills mechanism.
2. **Common screen picks**:
   - **Mass range**: Payload past mechanism base mass limit? Kill it (e.g., acoustic levitation can't handle kilogram payloads).
   - **Material fit**: Payload non-magnetic and mechanism needs magnetic material? Kill it (e.g., passive diamagnetic levitation of ferromagnetic thing not possible).
   - **Temperature**: Cryo not doable in op env? Kill superconducting levitation.
   - **Vacuum/atm**: Env is vacuum? Kill aerodynamic. EMC needs no magnetic fields? Kill magnetic mechanisms.
   - **Contact**: Air bearings need near flat surface (quasi-contact). True non-contact needed? Kill them.
3. **Log kills with reasons**: Log why each killed mechanism fails, so pick can be redone if rules change.

```markdown
## Screening Results
| # | Mechanism | Pass/Fail | Eliminating Constraint | Reason |
|---|-----------|-----------|----------------------|--------|
| 1 | Passive diamagnetic | [P/F] | [constraint or N/A] | [reason] |
| 2 | Active EM feedback | [P/F] | [constraint or N/A] | [reason] |
| ... | ... | ... | ... | ... |
```

**Got:** Shorter list of candidate mechanisms, each passed all hard limits. At least one mechanism lives; ideally 2-4 stay for score.

**If fail:** No mechanism passes all hard limits? Rules clash. Loosen least key "Must have" (reclass as "Want") and re-screen. Many rules must loosen? App may need mixed way with two mechanisms (e.g., magnetic main force with aero stabilize).

### Step 4: Score on Soft Criteria

Rank surviving mechanisms with weighted score matrix:

1. **Set score picks and weights**: Turn each "Want" rule into score pick. Give weights by how key (e.g., 1-5 scale, or percent weights summing to 100%). Common picks:
   - **Cost** (prototype and unit): weight by econ sensitivity
   - **Complexity**: count of parts, control electronics, alignment key
   - **Precision**: position accuracy, stiffness, vibration block quality
   - **Power use**: op watts, standby watts
   - **Scalability**: can handle range of payloads or be made in quantity
   - **Controllability**: ease of tune gap, position, or stiffness on fly
   - **Maturity**: tech readiness level, open commercial parts
   - **Noise**: acoustic, EM, or vibration out
2. **Score each mechanism**: Rate each surviving mechanism on each pick with one scale (e.g., 1 = poor, 3 = OK, 5 = excellent). Base scores on count data from Steps 1-3 where can, not on feel.
3. **Compute weighted scores**: For each mechanism, multiply each pick score by weight and sum. Mechanism with highest weighted score is top candidate.
4. **Sensitivity check**: Vary top 2-3 weights by +/- 20% and check if rank changes. If rank is sensitive to weight picks, flag this and show alternatives to decision maker.

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

**Got:** Full score matrix with all picks weighted and all mechanisms scored. Clear rank shows up with top candidate named. Sensitivity check confirms rank robust (or logs where fragile).

**If fail:** Two mechanisms score within 10% of each other? Pick too close to call on paper. Advise prototype both and pick by experiment perf, or spot a split test that would break tie.

### Step 5: Document Recommendation and Trade Study

Make final trade study report:

1. **Pick**: State picked mechanism with one-para reason that ref scoring and key split picks.
2. **Runner-up**: Name second-place mechanism and say under what shifted conds it would become preferred (this is fallback plan).
3. **Killed mechanisms**: Briefly list killed mechanisms and their fail limits for full record.
4. **Risks and mitigations**: For picked mechanism, name top 3 tech risks and advised mitigations.
5. **Next steps**: State what detail design work needed (ref right analysis skill: analyze-magnetic-levitation for magnetic, design-acoustic-levitation for acoustic, etc.).

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

**Got:** Self-contained trade study doc another engineer can review, challenge, act on. Pick traces to rules and scores, not unstated preferences.

**If fail:** Pick can't be backed by scoring alone (e.g., top-score mechanism has known showstopper picks didn't catch)? Go back to Step 1 to add missing rule. Do not override score with no logged reason.

## Validation

- [ ] App rules set with count values and priority class
- [ ] At least 4 levitation mechanisms across 2+ physics rules listed
- [ ] Hard limit screen applied same way with kills logged
- [ ] At least 2 mechanisms live through screen for useful compare
- [ ] Score picks have clear weights and all scores backed
- [ ] Sensitivity check done on top 2-3 weight factors
- [ ] Pick has reason that traces to score matrix
- [ ] Runner-up and fallback cond logged
- [ ] Risks and mitigations named for picked mechanism
- [ ] Trade study full enough for outside reviewer to check

## Pitfalls

- **Anchor on preferred mechanism before trade study**: Start with conclusion and reverse-engineer rules or weights to back it. Cure: set rules and weights before check any mechanism. Already know which mechanism you want? Trade study is check, not pick -- be honest.
- **Skip mechanisms from unknown domains**: Magnetic-background engineers miss acoustic options and reverse. Always add at least one mechanism from each of four big families (magnetic, acoustic, aero, electrostatic) in first list, even if most get screened out.
- **Mix hard and soft limits**: Treat a preference as hard limit kills viable options early. Only truly non-negotiable rules (safety, physics limits, regulatory) should be hard limits. Everything else should be scored.
- **Equal weight by default**: Giving all picks same weight is a pick -- it says all picks are equally key. Stakeholders should rank clear. If they refuse, use pairwise compare (AHP) to draw hidden weights.
- **Ignore system-level mix**: Levitation mechanism not alone. Acoustic levitation makes noise that may hit nearby instruments. Active magnetic levitation emits time-varying fields that may break EMC rules. Superconducting levitation needs cryo infra. Check mechanism in its system context.
- **Single-point score with no uncertainty**: Rate mechanism as "4" on cost implies false precision. If can, express scores as ranges (e.g., "3-5") and pass uncertainty to final rank. If two mechanisms overlap in score ranges, rank not final.

## See Also

- `analyze-magnetic-levitation` -- detail analysis when magnetic levitation is picked or candidate mechanism
- `design-acoustic-levitation` -- detail design when acoustic levitation picked
- `analyze-magnetic-field` -- compute magnetic field profiles needed for magnetic levitation check
- `argumentation` -- structured reason and pick-back methods for trade study
