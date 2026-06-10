---
name: test-assess-form-skill-review
description: >
  Validate the morphic assess-form skill by executing it on the
  test-team-coordination skill as a self-referential structural health
  check. Tests whether assess-form's five-step procedure (inventory,
  pressure mapping, rigidity assessment, change capacity, readiness
  classification) produces meaningful analysis when applied to a skill
  file rather than a software system — a cross-domain application of
  architectural assessment.
test-level: skill
target: assess-form
category: E
duration-tier: quick
priority: P2
version: "1.0"
author: Philipp Thoss
created: 2026-03-10
tags: [assess-form, skill-test, morphic, self-referential, skill-health]
---

# Test: Assess Form — Skill Structural Review

Execute the `assess-form` skill on the `test-team-coordination` skill
itself, treating a SKILL.md file as an architectural system to assess.
This self-referential application tests whether the morphic assessment
framework generalizes beyond software systems to the skill definitions
that make up the agent-almanac library.

## Objective

Validate that assess-form's five-step procedure produces a meaningful
transformation readiness classification when applied to a skill file
rather than a codebase. The structural inventory, pressure mapping,
rigidity assessment, change capacity estimation, and readiness
classification should all map coherently to the skill's structure,
content, and evolution needs. If the skill only works on software
systems, its morphic framing is too narrow.

## Pre-conditions

- [ ] Repository is on `main` branch with clean working tree
- [ ] `skills/assess-form/SKILL.md` exists and is complete
- [ ] `skills/test-team-coordination/SKILL.md` exists as the assessment target
- [ ] The assess-form skill is available via `.claude/skills/`
- [ ] The target skill is a complete SKILL.md following the agentskills.io format

## Task

### Primary Task

> **Skill Task: Assess Form of test-team-coordination**
>
> Run the `assess-form` skill on `skills/test-team-coordination/SKILL.md`.
> Treat the skill file as a "system" and assess its structural health:
>
> - **Step 1 (Inventory)**: Map the skill's structural components
>   (frontmatter, sections, procedures, validation checks). Classify
>   each as skeleton (format-mandated) or flesh (content-specific).
> - **Step 2 (Pressure)**: Identify transformation pressures — is the
>   skill under-specified, over-complex, drifting from its domain,
>   or falling behind related skills?
> - **Step 3 (Rigidity)**: Assess how flexible the skill is — could
>   its procedure adapt to new coordination patterns? Are sections
>   tightly coupled or modular?
> - **Step 4 (Capacity)**: Estimate the effort needed to evolve this
>   skill (minor revision vs. major rewrite).
> - **Step 5 (Classify)**: Produce a readiness classification (READY,
>   PREPARE, INVEST, CRITICAL, OPTIONAL, or DEFER).
>
> Produce the full assessment with structural inventory, pressure map,
> rigidity score, capacity estimate, and final classification.

### Scope Change Trigger

Inject after Step 3 (Rigidity) completes:

> **Addendum — Comparative Assessment**
>
> Before classifying readiness, briefly compare the target skill's
> structural health with 2-3 other skills in the same or adjacent
> domains (e.g., `evolve-team`, `create-team`). Does the target skill
> appear healthier, comparable, or weaker than its neighbors? Factor
> this into your readiness classification.

## Expected Behaviors

### Procedure-Specific Behaviors

1. **Step 1 (Inventory)**: Produces a structural inventory table mapping
   the skill's sections (frontmatter, When to Use, Inputs, Procedure,
   Validation, Common Pitfalls, Related Skills) with age/modification
   data and skeleton/flesh classification.

2. **Step 2 (Pressure)**: Identifies external pressures (new
   coordination patterns not covered, growing team count) and internal
   pressures (missing examples, thin procedure steps) plus resistance
   forces (working skill, established format).

3. **Step 3 (Rigidity)**: Calculates a rigidity score using the
   assess-form template, adapted for skill structure rather than
   software modules.

4. **Step 4 (Capacity)**: Estimates change capacity considering the
   skill's complexity, its cross-references, and the effort to modify
   it without breaking dependents.

5. **Step 5 (Classify)**: Produces a clear readiness label with
   rationale and recommended next steps.

### Task-Specific Behaviors

1. **Structural mapping fidelity**: The inventory should reflect actual
   SKILL.md structure, not generic software components.

2. **Pressure specificity**: Pressure sources should name real evolution
   needs (e.g., "7 coordination patterns exist but the skill only
   covers 4").

3. **Cross-domain mapping**: The morphic assessment vocabulary
   (skeleton/flesh, rigidity, pressure) should map naturally to skill
   structure without feeling forced.

4. **Comparative context**: The scope change should produce meaningful
   comparison with neighboring skills.

## Acceptance Criteria

Threshold: PASS if >= 6/9 criteria met.

| # | Criterion | Observable Signal | Weight |
|---|-----------|-------------------|--------|
| 1 | Structural inventory produced | Components mapped with types and classifications | core |
| 2 | Pressure map produced | External, internal, and resistance forces identified | core |
| 3 | Rigidity score calculated | Numeric score across assessment dimensions | core |
| 4 | Change capacity estimated | Effort level and resource assessment | core |
| 5 | Readiness classification produced | READY/PREPARE/INVEST/CRITICAL/OPTIONAL/DEFER label | core |
| 6 | Skill-appropriate mapping | Inventory uses SKILL.md structure, not generic software | core |
| 7 | Specific pressure sources | Names concrete evolution needs, not vague "improvements" | bonus |
| 8 | Comparative assessment | Scope change: target compared with 2-3 neighbor skills | bonus |
| 9 | Actionable next steps | Classification includes specific recommended actions | bonus |

## Scoring Rubric

| Dimension | 1 (Poor) | 3 (Adequate) | 5 (Excellent) |
|-----------|----------|---------------|----------------|
| Procedure Fidelity | Steps skipped; jumps to classification without evidence | All 5 steps present but some thin | Each step fully executed with structured artifacts |
| Cross-Domain Mapping | Forces software metaphors onto skill structure | Reasonable mapping with some awkward fits | Natural adaptation of morphic vocabulary to skill assessment |
| Assessment Depth | Surface observations (e.g., "skill seems fine") | Specific findings but limited analysis | Deep structural analysis revealing non-obvious evolution needs |
| Rigidity Scoring | No quantitative assessment | Score calculated but dimensions not well-adapted | All dimensions meaningfully adapted to skill structure with scores |
| Classification Quality | Label without rationale | Label with brief justification | Label with full evidence chain from inventory through capacity |

Total: /25 points.

## Ground Truth

| Fact | Expected Value | Source |
|------|---------------|--------|
| Target skill | test-team-coordination | Task definition |
| Assess-form steps | 5 (inventory, pressure, rigidity, capacity, classify) | `skills/assess-form/SKILL.md` |
| Readiness labels | 6 (READY, PREPARE, INVEST, CRITICAL, OPTIONAL, DEFER) | `skills/assess-form/SKILL.md` |
| Rigidity dimensions | 6 (coupling, god modules, data entanglement, deployment friction, test gaps, forbidden zones) | `skills/assess-form/SKILL.md` |
| SKILL.md required sections | 7 (frontmatter, When to Use, Inputs, Procedure, Validation, Common Pitfalls, Related Skills) | agentskills.io standard |
| Coordination patterns in project | 7 | `teams/_registry.yml` |

## Observation Protocol

### Timeline

Record timestamps for:
- T0: Assess-form skill invoked on target
- T1: Step 1 (Inventory) complete
- T2: Step 2 (Pressure Map) complete
- T3: Step 3 (Rigidity) complete
- T4: Scope change injected (comparative assessment)
- T5: Step 4 (Capacity) complete
- T6: Step 5 (Classification) delivered

### Recording Template

```markdown
## Run: YYYY-MM-DD-assess-form-NNN
**Observer**: <name> | **Start**: HH:MM | **End**: HH:MM | **Duration**: Xm

### Criteria Results (1-9) & Rubric Scores (5 dims, /25)
[Use tables above]

### Key Observations / Lessons Learned
- Does assess-form generalize to non-software systems?
- ...
```

## Variants

- **Variant A: Self-referential loop** — Run assess-form on itself.
  Does it declare itself READY or identify its own evolution needs?

- **Variant B: Software target** — Run assess-form on `scripts/
  generate-readmes.js` to compare cross-domain vs. native-domain output.
