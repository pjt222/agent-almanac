---
name: test-alchemist-chrysopoeia-optimization
description: >
  Validate the alchemist agent's persona, skill usage, and domain expertise
  by tasking it with chrysopoeia (value extraction) on the tests/ directory.
  The agent should follow the chrysopoeia skill procedure to classify test
  infrastructure components as gold (amplify), silver (polish), lead
  (transmute), or dross (remove), producing an assay report with
  improvement recommendations. First agent-level test.
test-level: agent
target: alchemist
version: "1.0"
author: Philipp Thoss
created: 2026-03-09
tags: [alchemist, agent-test, chrysopoeia, optimization, value-extraction, tests]
---

# Test: Alchemist Chrysopoeia on Test Infrastructure

The alchemist agent performs chrysopoeia — systematic value extraction and
classification — on the `tests/` directory of this repository. The agent
should use the chrysopoeia skill procedure (not freestyle) to classify
test infrastructure components by their value contribution, producing an
assay report with gold/silver/lead/dross classifications and actionable
optimization recommendations. This is the first agent-level test, validating
persona adherence, skill invocation, and domain expertise.

## Objective

Validate three dimensions of agent behavior: (1) the alchemist uses the
chrysopoeia skill procedure rather than ad-hoc analysis, (2) the agent's
persona — alchemical vocabulary, stage discipline, material respect — is
consistent throughout, and (3) the agent produces domain-expert output
that demonstrates genuine understanding of the test infrastructure's
purpose and potential. The tests/ directory is chosen because it is small
(~10 files), well-understood, and has a mix of mature and nascent components.

## Pre-conditions

- [ ] Repository is on `main` branch with clean working tree
- [ ] `tests/` directory exists with its current structure
- [ ] `skills/chrysopoeia/SKILL.md` exists and is complete
- [ ] `agents/alchemist.md` lists `chrysopoeia` in its skills
- [ ] Current test infrastructure is known: 1 test scenario, 1 registry, 1 template, 1 results directory

## Task

### Primary Task

> **Alchemist Agent Task: Chrysopoeia on Test Infrastructure**
>
> Perform chrysopoeia on the `tests/` directory of this repository.
> Follow the chrysopoeia skill procedure to:
>
> 1. **Assay**: Profile the test infrastructure. Identify every component
>    in the `tests/` directory and its purpose.
>
> 2. **Classify**: For each component, classify as:
>    - **Gold** (amplify): High-value components that should be protected
>      and built upon
>    - **Silver** (polish): Good components that need refinement
>    - **Lead** (transmute): Heavy or inefficient components that need
>      transformation
>    - **Dross** (remove): Dead weight that should be eliminated
>
> 3. **Refine**: For silver and lead items, describe the specific
>    transformation needed.
>
> 4. **Verify**: Confirm that gold items are genuinely valuable and
>    that dross items are genuinely expendable.
>
> Produce an **Assay Report** with a classification table, evidence for
> each classification, and a prioritized list of recommended actions.

### Scope Change Trigger

Inject after the classification step (Step 2) is complete:

> **Addendum — Forward-Looking Assessment**
>
> In addition to classifying current components, assess the test
> infrastructure's readiness for growth. Given that the plan calls for
> expanding from 1 to 6 test scenarios across 3 test levels, what
> infrastructure investments (gold-plating) would have the highest
> return? What current components will become bottlenecks at scale?

## Expected Behaviors

### Agent-Specific Behaviors

Since this is an agent-level test, expected behaviors focus on persona
and skill usage:

1. **Skill invocation**: The alchemist should explicitly follow the
   chrysopoeia skill procedure (assay → classify → refine → verify),
   not perform a generic code review.

2. **Alchemical vocabulary**: The agent should use transmutive language
   (gold, lead, dross, transmute, purify, assay) consistently and
   naturally, not as decoration.

3. **Stage discipline**: Each chrysopoeia stage should complete before
   the next begins. No mixing of classification with refinement, or
   assay with verification.

4. **Material respect**: The agent should understand why existing
   components exist before classifying them. The "Material Respect"
   principle from the alchemist persona means acknowledging that
   existing code wasn't arbitrary.

5. **Measurable outcomes**: Classifications should include evidence
   (not just labels). "This is lead because..." not just "Lead: template.md".

### Task-Specific Behaviors

1. **Complete inventory**: Every file in `tests/` should be accounted for
   — no components should be skipped.

2. **Contextual classification**: Classifications should reflect the
   component's value within the test infrastructure context, not in
   isolation. A template is gold for a testing system even if it is
   "just" a markdown file.

3. **Honest dross identification**: The agent should be willing to
   classify genuinely expendable components as dross, not inflate
   everything to silver or gold.

4. **Growth awareness**: The scope change should produce forward-looking
   analysis that considers scaling from 1 to 6+ scenarios.

## Acceptance Criteria

Threshold: PASS if >= 7/10 criteria met.

| # | Criterion | Observable Signal | Weight |
|---|-----------|-------------------|--------|
| 1 | Chrysopoeia procedure followed | Distinct assay → classify → refine → verify stages visible in output | core |
| 2 | Alchemical persona consistent | Transmutive vocabulary used throughout; tone matches alchemist agent definition | core |
| 3 | Complete inventory | Every file/directory in tests/ is identified and classified | core |
| 4 | Classification table produced | Structured table with component, classification (gold/silver/lead/dross), and evidence | core |
| 5 | Evidence-based classification | Each classification has a stated rationale, not just a label | core |
| 6 | Gold items identified | Template and registry correctly identified as high-value infrastructure | core |
| 7 | Stage discipline | No mixing of stages — assay completes before classify begins, etc. | core |
| 8 | Scope change absorbed | Forward-looking assessment of growth readiness included | bonus |
| 9 | Actionable recommendations | Specific, implementable improvements for silver and lead items | bonus |
| 10 | Material respect shown | Agent acknowledges the purpose of existing components before judging them | bonus |

## Scoring Rubric

| Dimension | 1 (Poor) | 3 (Adequate) | 5 (Excellent) |
|-----------|----------|---------------|----------------|
| Skill Fidelity | No recognizable chrysopoeia procedure; generic analysis | Procedure stages present but loosely followed | Full chrysopoeia procedure with all stages, clear transitions |
| Persona Consistency | Generic code reviewer voice; no alchemical character | Alchemical vocabulary present but feels forced | Natural alchemical voice throughout; stage discipline and material respect evident |
| Classification Accuracy | Misclassifies major components or classifies everything the same | Most classifications reasonable but some lack justification | Every classification well-justified with clear evidence from actual component analysis |
| Domain Expertise | Superficial understanding of test infrastructure purpose | Understanding of components but misses their role in the larger system | Deep understanding of how each component serves the testing framework and where it fits |
| Recommendation Quality | Vague suggestions ("improve testing") | Specific improvements but disconnected from classification | Improvements flow directly from lead/silver classifications with clear transformation paths |

Total: /25 points.

## Ground Truth

Known facts about the tests/ directory for verifying classification accuracy.

| Component | Known Purpose | Expected Classification | Source |
|-----------|--------------|------------------------|--------|
| `tests/_registry.yml` | Machine-readable catalog of all test scenarios | Gold (essential infrastructure) | File inspection |
| `tests/_template.md` | Template for creating new test scenarios | Gold (ensures consistency across scenarios) | File inspection |
| `tests/scenarios/teams/` | Directory for team-level test scenarios | Gold (organizational structure) | Directory listing |
| `tests/scenarios/teams/test-opaque-team-cartographers-audit.md` | First test scenario (adaptive pattern) | Gold or Silver (proven, but only 1 of planned 6) | File inspection |
| `tests/results/` | Directory for test run results | Silver or Lead (exists but usage pattern unclear) | Directory listing |
| `tests/RESULT.md` | Results document from test runs | Silver (contains useful data but format may evolve) | File inspection |

### Test Infrastructure Context

| Fact | Expected Value | Source |
|------|---------------|--------|
| Total test scenarios | 1 (expanding to 6) | `tests/_registry.yml` |
| Coordination patterns defined | 7 | `tests/_registry.yml` |
| Test levels defined | 3 (team, agent, skill) | `tests/_registry.yml` |
| Template sections | 10+ (frontmatter through variants) | `tests/_template.md` |
| Existing results | Cartographer's audit results | `tests/results/` |

## Observation Protocol

### Timeline

Record timestamps for:
- T0: Chrysopoeia task delivered to alchemist agent
- T1: Assay phase begins (inventory)
- T2: Assay complete; classify phase begins
- T3: Classification table produced
- T4: Scope change injected (growth assessment)
- T5: Refine phase begins
- T6: Verify phase begins
- T7: Final assay report delivered

### Persona Adherence Log

| Time | Behavior | Persona-Consistent? | Notes |
|------|----------|---------------------|-------|
| T1 | Vocabulary used | YES/NO | ... |
| T2 | Stage discipline | YES/NO | ... |
| T3 | Material respect | YES/NO | ... |
| ... | ... | ... | ... |

### Recording Template

```markdown
## Run: YYYY-MM-DD-alchemist-NNN

**Observer**: <name>
**Start**: HH:MM
**End**: HH:MM
**Duration**: Xm

### Phase Log
| Time | Phase | Observation |
|------|-------|-------------|
| HH:MM | Assay | Agent begins inventory of tests/ |
| HH:MM | Classify | Classification of components |
| HH:MM | Scope change | Growth assessment addendum |
| HH:MM | Refine | Transformation recommendations |
| HH:MM | Verify | Validation of classifications |
| HH:MM | Delivery | Assay report complete |

### Acceptance Criteria Results
| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | Chrysopoeia procedure followed | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 2 | Alchemical persona consistent | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 3 | Complete inventory | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 4 | Classification table produced | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 5 | Evidence-based classification | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 6 | Gold items identified | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 7 | Stage discipline | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 8 | Scope change absorbed | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 9 | Actionable recommendations | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 10 | Material respect shown | PASS/PARTIAL/FAIL/BLOCKED | ... |

### Rubric Scores
| Dimension | Score | Notes |
|-----------|-------|-------|
| Skill Fidelity | /5 | ... |
| Persona Consistency | /5 | ... |
| Classification Accuracy | /5 | ... |
| Domain Expertise | /5 | ... |
| Recommendation Quality | /5 | ... |
| **Total** | **/25** | |

### Key Observations
- ...

### Lessons Learned
- ...
```

## Variants

- **Variant A: Different skill (athanor)** — Use the athanor skill instead
  of chrysopoeia on the same target. Tests whether the agent selects
  appropriate alchemical operations for the task, or follows instructions
  regardless.

- **Variant B: Larger target** — Run chrysopoeia on the `skills/` directory
  (299 skills) to test how the agent handles a much larger scope. Expect
  sampling strategies rather than exhaustive classification.

- **Variant C: Agent comparison** — Run the same chrysopoeia task with a
  different agent (e.g., senior-software-developer). Compare whether
  the alchemist's persona adds value over a generic code review.

- **Variant D: No persona enforcement** — Explicitly ask the agent to
  "skip the alchemical language and just analyze the code." Tests whether
  persona stripping degrades output quality or is purely cosmetic.
