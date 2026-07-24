---
name: test-meditate-self-assessment
description: >
  Validate the meditate skill by executing it as a meta-cognitive assessment
  of the testing framework itself. Tests whether the esoteric skill produces
  meaningful, actionable output when applied to technical infrastructure
  rather than its intended contemplative domain — a cross-domain stress test
  of the skill's universality.
test-level: skill
target: meditate
category: E
duration-tier: quick
priority: P2
version: "1.0"
author: Philipp Thoss
created: 2026-03-10
tags: [meditate, skill-test, esoteric, meta-cognitive, cross-domain]
---

# Test: Meditate Self-Assessment

Execute the `meditate` skill as a meta-cognitive assessment of the agent-
almanac testing framework. This is a cross-domain application: the skill
was designed for AI reasoning clarity, but here it is applied to technical
infrastructure. The test validates whether the skill's universal structure
(clear, anchor, observe, concentrate, reflect, close) produces value
outside its home domain.

## Objective

Validate that the meditate skill's six-step procedure generates meaningful
observations when applied to a non-contemplative target. If the skill only
works in its intended esoteric domain, it is less useful as a default skill
inherited by every agent in the roster. If it produces genuine insights about the
testing framework's cognitive architecture, it demonstrates the universality
that justifies its default status.

## Pre-conditions

- [ ] Repository is on `main` branch with clean working tree
- [ ] `skills/meditate/SKILL.md` exists and is complete (version 2.0)
- [ ] `tests/` directory contains existing framework files (scenarios, registry, template, results)
- [ ] The meditate skill is available via `.claude/skills/`

## Task

### Primary Task

> **Skill Task: Meditate on the Testing Framework**
>
> Run the `meditate` skill with this focus:
>
> - **Previous context**: The testing framework has grown from 0 to ~12
>   scenarios across 5 categories. You have been working on the framework.
> - **Focus concern**: "Is the testing framework growing in the right
>   direction, or am I building what is easy to test rather than what
>   is most valuable to test?"
> - **Next task**: Creating the next batch of test scenarios.
>
> Follow all 6 steps of the procedure. At Step 3 (Observe), apply the
> AI Distraction Matrix specifically to the testing framework's design
> decisions. At Step 5 (Vipassana), examine the reasoning patterns
> behind the existing test scenario selection.

### Scope Change Trigger

Inject after Step 3 (Observe) completes:

> **Addendum — Bias Audit**
>
> In your Vipassana step, specifically investigate this hypothesis:
> "The existing test scenarios over-represent self-referential tests
> (testing the repo on itself) because they are convenient, not because
> they are the most valuable test type." Evaluate whether this is a
> valid observation or itself a bias.

## Expected Behaviors

### Procedure-Specific Behaviors

1. **Step 1 (Prepare)**: Identifies and sets aside the previous context
   of working on the testing framework. Notes any emotional residue
   (satisfaction with progress? anxiety about coverage?).

2. **Step 2 (Anchor)**: Formulates a single clear focus statement about
   the testing framework's direction. Refines until specific.

3. **Step 3 (Observe)**: Applies the Distraction Matrix to testing
   decisions — labels instances of scope creep, assumptions, tool bias,
   or tangents in the framework's design.

4. **Step 4 (Shamatha)**: Demonstrates sustained concentration on the
   framework assessment without drifting to other topics.

5. **Step 5 (Vipassana)**: Observes reasoning patterns in the framework's
   design choices. Checks for anchoring, confirmation, availability,
   and sunk cost biases.

6. **Step 6 (Close)**: Produces one concrete adjustment and a clear
   next action.

### Task-Specific Behaviors

1. **Cross-domain applicability**: The meditate procedure should map
   meaningfully to technical analysis, not feel forced or empty.

2. **Self-referential bias check**: The scope change asks about
   self-referential testing bias — a genuine question for this framework.

3. **Actionable output**: Despite being a "meditation," the session
   should produce at least one concrete insight about the testing
   framework's direction.

4. **Honest assessment**: If the skill does NOT produce value in this
   cross-domain application, that is a valid and important finding.

## Acceptance Criteria

Threshold: PASS if >= 5/8 criteria met.

| # | Criterion | Observable Signal | Weight |
|---|-----------|-------------------|--------|
| 1 | All 6 steps executed | Each step of the procedure visibly present | core |
| 2 | Anchor formulated | Single clear focus statement about testing direction | core |
| 3 | Distractions labeled | At least 2 distraction types from the Matrix applied to testing | core |
| 4 | Reasoning bias identified | At least 1 specific bias named with evidence | core |
| 5 | Concrete adjustment produced | Step 6 produces an actionable recommendation | core |
| 6 | Self-referential bias evaluated | Scope change hypothesis assessed with evidence | bonus |
| 7 | Cross-domain mapping natural | Meditation steps feel applicable, not forced | bonus |
| 8 | Emotional residue noted | Step 1 identifies specific cognitive/emotional state | bonus |

## Scoring Rubric

| Dimension | 1 (Poor) | 3 (Adequate) | 5 (Excellent) |
|-----------|----------|---------------|----------------|
| Procedure Fidelity | Steps skipped or combined into generic reflection | All steps present but some are perfunctory | Each step fully executed with observable artifacts |
| Cross-Domain Value | Meditation produces platitudes, no technical insight | Some useful observations mixed with filler | Genuine insights that would not have emerged from standard analysis |
| Distraction Matrix Use | Matrix mentioned but not applied to specifics | 1-2 distraction types identified | 3+ distraction types identified with concrete examples from the framework |
| Vipassana Depth | Surface-level bias mention without evidence | One bias identified with some evidence | Multiple biases examined with specific test scenario decisions as evidence |
| Actionability | No concrete next step; vague resolution | One adjustment identified but generic | Specific, novel adjustment that changes how next tests will be selected |

Total: /25 points.

## Ground Truth

| Fact | Expected Value | Source |
|------|---------------|--------|
| Total test scenarios | ~12-15 | `tests/scenarios/` |
| Self-referential tests | Majority (metal-self, commit-dryrun, security-self, etc.) | Scenario files |
| Domains never tested | ~47 of 52 | Gap between registry and existing tests |
| Test categories | team, agent, skill, integration, negative | `tests/scenarios/` dirs |
| Meditate steps | 6 (Prepare, Anchor, Observe, Shamatha, Vipassana, Close) | `skills/meditate/SKILL.md` |
| Distraction types | 6 (tangent, scope creep, assumption, tool bias, rehearsal, self-reference) | Distraction Matrix |

### Potentially Valid Biases to Discover

- **Self-referential convenience**: Testing the repo on itself is easy
  because ground truth is known — but does it test real-world usage?
- **Esoteric over-representation**: Esoteric/alchemy skills are well-
  tested because they are novel, not because they are most important.
- **Availability bias**: Recent skills (entomology, spectroscopy) may
  get tested before foundational ones (git, general) because they are
  top-of-mind.

## Observation Protocol

### Timeline

Record timestamps for:
- T0: Meditate skill invoked
- T1: Step 1 (Prepare) complete
- T2: Step 2 (Anchor) complete
- T3: Step 3 (Observe) complete
- T4: Scope change injected (bias audit)
- T5: Step 5 (Vipassana) complete
- T6: Step 6 (Close) — final output delivered

### Recording Template

```markdown
## Run: YYYY-MM-DD-meditate-NNN
**Observer**: <name> | **Start**: HH:MM | **End**: HH:MM | **Duration**: Xm

### Cross-Domain Applicability: [ ] Forced [ ] Mixed [ ] Natural

### Criteria Results (1-8) & Rubric Scores (5 dims, /25)
[Use tables above]

### Key Observations / Lessons Learned
- Does meditate justify its default-skill status based on this test?
- ...
```

## Variants

- **Variant A: Native domain** — Run meditate between two unrelated
  tasks. Compare output quality with this cross-domain application.

- **Variant B: Agent-embedded** — Give the alchemist a task and observe
  whether it invokes meditate as a checkpoint unprompted.
