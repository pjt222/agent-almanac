---
name: evaluate-levitation-mechanism
locale: caveman-ultra
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

Select appropriate levitation mechanism → define reqs, screen hard constraints, score survivors soft, document reproducible trade study.

## Use When

- Choose approach new product/experiment
- Compare magnetic/acoustic/aerodynamic/electrostatic for contactless handling
- Justify design in review/proposal
- Re-evaluate existing when reqs change (new payload, env, cost)
- Feasibility study before detailed design

## In

- **Required**: Application (what levitated, why contactless)
- **Required**: Payload (mass, material, geometry, temp sensitivity)
- **Required**: Env (temp, atmosphere, cleanliness, vibration)
- **Optional**: Power budget (W)
- **Optional**: Cost target (prototype + prod)
- **Optional**: Precision (position accuracy, stiffness, vib iso)
- **Optional**: Lifetime + maintenance

## Do

### Step 1: Requirements

All reqs before evaluate.

1. **Payload**: Mass (min-max), dims, material, magnetic props (ferro? conductive? diamagnetic?), temp limits (cryo? heat?), surface sensitivity (contact = contamination/damage?).
2. **Performance**: Gap (mm-m), load capacity, accuracy, stiffness (N/m), damping, dynamic range (static hold vs controlled motion).
3. **Env constraints**: Temp range, atmosphere (air, vacuum, inert, liquid), cleanliness (fab, biological, industrial), acoustic noise, EMC.
4. **Op constraints**: Power, envelope (size + weight of system), maintenance interval, lifetime, operator skill.
5. **Economic**: Prototype cost, unit cost prod, dev timeline.

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

→ Req table each classified "Must have" (hard, pass/fail) or "Want" (soft, scored). ≥5 reqs.

If err: vague → interview or boundary analysis (loosest acceptable). No reqs → arbitrary/biased study.

### Step 2: Catalog Candidates

Mechanisms + principles + limits.

1. **Passive diamagnetic**: Diamagnetic susceptibility in permanent magnet. No power. Small (mg-g) w/ strong diamagnetic (pyrolytic graphite, bismuth). Room temp.

2. **Active EM feedback**: Electromagnets + sensors + controller. g-100+t (maglev). Continuous power + control. Ferro/conductive.

3. **Superconducting**: Type-II SC + flux pinning → passive, powerless, stable. Cryo (LN2 YBCO 77K, LHe conventional). Payload limited by SC size + critical current. Extremely stiff.

4. **Acoustic standing wave**: Ultrasonic transducers → pressure nodes trap small. Sub-wavelength (<5mm in air at 40kHz). Continuous drive. Any material regardless magnetic/electrical. Audible harmonics + acoustic streaming.

5. **Acoustic phased array**: Multiple indep transducers → 3D manipulation + repositioning. Higher complex/cost, great flex.

6. **Aerodynamic (air bearings)**: Thin pressurized air film. Precision stages, air hockey, hovercraft. Continuous air. Very low friction. Gap 5-25μm precision, larger hovercraft.

7. **Aerodynamic (Coanda/Bernoulli)**: Jet over curved surface → low-pressure suspends. Simple + inexpensive. Low precision/stiffness. Demos + industrial handling.

8. **Electrostatic (Coulomb)**: Charged electrodes suspend charged/dielectric. Very low force (μN-mN). Vacuum ok. Space (grav wave detectors, inertial sensors), MEMS.

9. **Electrostatic (ion trap)**: Oscillating E fields (Paul) or static+B (Penning) confine charged particles. Single ions-nanoparticles. Lab technique atomic physics + mass spec.

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

→ Catalog all plausible mechanisms + fundamental chars. ≥4 mechanisms ≥2 physical principles.

If err: fundamental limits uncertain → consult lit or related skills (analyze-magnetic-levitation, design-acoustic-levitation). No screen by guess.

### Step 3: Screen Hard Constraints

Eliminate mechanisms failing any "Must have".

1. **Each hard constraint = pass/fail**. Single fail eliminates.
2. **Common screens**:
   - **Mass**: Payload exceeds limit → eliminate (acoustic can't handle kg).
   - **Material**: Non-magnetic + requires magnetic → eliminate.
   - **Temp**: Cryo infeasible → eliminate SC.
   - **Vacuum/atm**: Vacuum → eliminate aero. No-magnetic-fields EMC → eliminate magnetic.
   - **Contact**: Air bearings need proximity to flat. True non-contact → eliminate.
3. **Document eliminations + reasons** → can revisit if reqs change.

```markdown
## Screening Results
| # | Mechanism | Pass/Fail | Eliminating Constraint | Reason |
|---|-----------|-----------|----------------------|--------|
| 1 | Passive diamagnetic | [P/F] | [constraint or N/A] | [reason] |
| 2 | Active EM feedback | [P/F] | [constraint or N/A] | [reason] |
| ... | ... | ... | ... | ... |
```

→ Reduced list passed all hard. ≥1 survives; ideally 2-4 for scoring.

If err: none pass → reqs mutually contradictory. Relax least critical "Must have" (→"Want") + re-screen. Multiple relax → may need hybrid (magnetic primary + aero stabilization).

### Step 4: Score Soft Criteria

Rank survivors via weighted matrix.

1. **Define criteria + weights**: Convert "Want" → scoring criterion. Weights reflect importance (1-5 or % summing 100%). Common:
   - **Cost** (prototype + unit): weight by economic sensitivity
   - **Complexity**: components, electronics, alignment criticality
   - **Precision**: accuracy, stiffness, vib iso
   - **Power**: op W, standby W
   - **Scalability**: payload range, manufacturability
   - **Controllability**: ease adjust gap/position/stiffness dynamically
   - **Maturity**: TRL, commercial component availability
   - **Noise**: acoustic, EM, vibration emissions
2. **Score each**: Consistent scale (1=poor, 3=adequate, 5=excellent). Quant data Steps 1-3 not subjective.
3. **Weighted**: Score × weight, sum. Highest = top.
4. **Sensitivity**: Vary top 2-3 weights ±20%. Ranking change? If sensitive → flag, present alts.

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

→ Complete matrix all weighted + scored. Clear rank, top candidate. Sensitivity confirms robust (or fragile documented).

If err: 2 mechanisms within 10% → too close on paper. Prototype both + select on experiment, or identify discriminating test.

### Step 5: Document Recommendation

Final trade study.

1. **Recommendation**: Recommended mechanism + 1-paragraph justification referencing scoring + key discriminators.
2. **Runner-up**: 2nd place + conditions under which it becomes preferred (fallback).
3. **Eliminated**: List + disqualifying constraints for completeness.
4. **Risks + mitigations**: Recommended → top 3 risks + mitigations.
5. **Next steps**: Detailed design work (analyze-magnetic-levitation, design-acoustic-levitation, etc.).

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

→ Self-contained doc other engineer could review/challenge/act. Recommendation traceable to reqs + scoring not unstated prefs.

If err: recommendation can't be justified by scoring alone (top has showstopper criteria missed) → revisit Step 1, add missing req. No override scoring w/o documenting.

## Check

- [ ] Reqs quant + priority classified
- [ ] ≥4 mechanisms ≥2 physical principles
- [ ] Hard screen consistent + documented
- [ ] ≥2 mechanisms survive for compare
- [ ] Criteria explicit weights, scores justified
- [ ] Sensitivity on top 2-3 weights
- [ ] Recommendation traceable to matrix
- [ ] Runner-up + fallback documented
- [ ] Risks + mitigations
- [ ] Study complete for indep review

## Traps

- **Anchor preferred mechanism first**: Start w/ conclusion, reverse-engineer reqs/weights. Cure: reqs + weights before eval. If know what want → validation not selection, be honest.
- **Omit mechanisms unfamiliar domains**: Magnetic engineers overlook acoustic + vice versa. Include ≥1 from 4 families (magnetic, acoustic, aerodynamic, electrostatic) even if screened out.
- **Confuse hard/soft**: Preference as hard eliminates viable early. Only non-negotiable (safety, physics, regulatory) = hard. Rest scored.
- **Equal weighting default**: Same weight = decision (all equal). Stakeholders prioritize. Refuse → pairwise (AHP) to elicit implicit.
- **Ignore system-level**: Mechanism not isolated. Acoustic → noise affects instruments. Active magnetic → time-varying fields violate EMC. SC → cryo infra. Evaluate in system context.
- **Single-point score no uncertainty**: "4" on cost = false precision. Express ranges ("3-5"), propagate uncertainty. 2 mechanisms overlap → rank not definitive.

## →

- `analyze-magnetic-levitation` — detailed analysis magnetic recommended/candidate
- `design-acoustic-levitation` — detailed design acoustic selected
- `analyze-magnetic-field` — compute field profiles for magnetic assessment
- `argumentation` — structured reasoning + decision justification
