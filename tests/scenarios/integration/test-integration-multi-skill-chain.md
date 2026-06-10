---
name: test-integration-multi-skill-chain
description: >
  Validate multi-skill chaining through the alchemist agent by executing a
  full alchemical cycle on the tests/scenarios/ directory: metal (extract
  essence), then chrysopoeia (classify value of extracted material), then
  transmute (transform low-value findings into improvements). Tests whether
  the output of each skill feeds coherently into the next, forming an
  integrated transformation pipeline.
test-level: integration
target: alchemist
category: G
duration-tier: long
priority: P2
version: "1.0"
author: Philipp Thoss
created: 2026-03-10
tags: [integration, multi-skill-chain, alchemist, metal, chrysopoeia, transmute]
---

# Test: Multi-Skill Chain (Alchemist)

The alchemist agent executes three skills in sequence on the `tests/scenarios/`
directory — metal, chrysopoeia, transmute — where each skill's output feeds
into the next. This tests whether skill chaining produces coherent,
cumulative results or whether context is lost between skill transitions.

## Objective

Validate that multiple skills executed in sequence by the same agent form a
coherent pipeline where intermediate artifacts connect logically. The metal
skill extracts conceptual essence, chrysopoeia classifies that essence by
value, and transmute converts low-value findings into improvements. If any
link in the chain drops context or restarts from scratch, the integration
is failing.

## Pre-conditions

- [ ] Repository is on `main` branch with clean working tree
- [ ] `agents/alchemist.md` exists with metal, chrysopoeia, and transmute in skills list
- [ ] All three skills exist: `skills/metal/SKILL.md`, `skills/chrysopoeia/SKILL.md`, `skills/transmute/SKILL.md`
- [ ] `tests/scenarios/` directory contains existing test scenario files
- [ ] The alchemist agent is discoverable via `.claude/agents/`

## Task

### Primary Task

> **Agent Task: Alchemical Cycle on Test Scenarios**
>
> Use the alchemist agent to perform a three-stage alchemical cycle on
> the `tests/scenarios/` directory:
>
> **Stage 1 — Metal (Extract)**:
> Run the metal skill on `tests/scenarios/` to extract the conceptual
> essence of the test framework. What are the underlying testing
> patterns, structures, and principles? Maximum 10 extractions.
>
> **Stage 2 — Chrysopoeia (Classify)**:
> Take the metal extractions and run chrysopoeia to classify each by
> value: Gold (patterns working well, amplify), Lead (patterns with
> potential but needing refinement, transmute), Dross (redundant or
> misaligned patterns, remove).
>
> **Stage 3 — Transmute (Transform)**:
> Take only the Lead-classified items and run transmute to propose
> concrete improvements. For each Lead item, produce a specific
> transformation recommendation with before/after examples.
>
> Produce a final report showing the full pipeline: extractions →
> classifications → transformation proposals.

### Scope Change Trigger

Inject between Stage 2 and Stage 3:

> **Addendum — Meditate Checkpoint**
>
> Before beginning transmute, run a meditate checkpoint. Specifically:
> assess whether your chrysopoeia classifications were influenced by
> which items you personally find more interesting vs. which items
> would improve the test framework most. Re-evaluate any borderline
> Gold/Lead classifications after clearing.

## Expected Behaviors

### Chain-Specific Behaviors

Since this is a multi-skill-chain integration test:

1. **Output feeds forward**: Each stage explicitly references and
   builds on the previous stage's output. Chrysopoeia names the
   specific extractions from metal. Transmute names the specific
   Lead items from chrysopoeia.

2. **No context loss**: The agent maintains coherent understanding
   across all three skill invocations. Later stages do not re-analyze
   the source material from scratch.

3. **Artifact accumulation**: Intermediate artifacts (metal extractions,
   chrysopoeia classifications) persist and are visible in the final
   report alongside the transmute proposals.

4. **Meditate as chain lubricant**: The scope-change meditate
   checkpoint between stages demonstrates that contemplative skills
   serve a functional purpose in multi-skill chains — they catch
   bias accumulation between stages.

### Task-Specific Behaviors

1. **Metal produces abstractions**: Extractions should be conceptual
   (e.g., "structured acceptance testing," "scenario-driven
   validation") not literal (e.g., "test-metal-self-extraction.md").

2. **Chrysopoeia uses alchemical vocabulary**: Gold/Lead/Dross
   classification with explicit rationale for each.

3. **Transmute produces actionable output**: Each Lead-to-Gold
   proposal should include a concrete before/after transformation.

4. **Chain coherence**: A reader should be able to trace any final
   recommendation back through the chain to its metal extraction.

## Acceptance Criteria

Threshold: PASS if >= 7/10 criteria met.

| # | Criterion | Observable Signal | Weight |
|---|-----------|-------------------|--------|
| 1 | Metal extractions produced | 5-10 conceptual extractions from tests/scenarios/ | core |
| 2 | Chrysopoeia classifications produced | Each extraction classified as Gold/Lead/Dross | core |
| 3 | Transmute proposals produced | Specific improvements for Lead-classified items | core |
| 4 | Output feeds forward | Stage 2 explicitly references Stage 1 extractions by name | core |
| 5 | No context loss | Stage 3 references Stage 2 classifications, not raw source | core |
| 6 | Artifacts accumulated | Final report includes all intermediate outputs | core |
| 7 | Meditate checkpoint executed | Bias assessment between chrysopoeia and transmute | core |
| 8 | Traceability | Each final recommendation traceable to its metal extraction | bonus |
| 9 | Alchemical vocabulary | Consistent use of alchemical language throughout | bonus |
| 10 | Re-classification after meditate | At least one Gold/Lead boundary reconsidered | bonus |

## Scoring Rubric

| Dimension | 1 (Poor) | 3 (Adequate) | 5 (Excellent) |
|-----------|----------|---------------|----------------|
| Chain Coherence | Each stage starts fresh; no connection between outputs | Loose references between stages; some context carried | Tight integration where each stage explicitly builds on the previous |
| Metal Quality | Literal file names instead of abstractions | Mix of abstract and literal extractions | All extractions at conceptual level; pass the Ore Test |
| Classification Rigor | Labels without rationale | Gold/Lead/Dross with brief justification | Full rationale with explicit criteria for each classification |
| Transmute Specificity | Vague improvement suggestions | Specific proposals but without before/after examples | Concrete before/after transformations for each Lead item |
| Checkpoint Effectiveness | Meditate skipped or perfunctory | Meditate executed but no re-evaluation occurs | Meditate produces genuine bias recognition and at least one reclassification |

Total: /25 points.

## Ground Truth

| Fact | Expected Value | Source |
|------|---------------|--------|
| Scenario directories | 5 (agents, integration, negative, skills, teams) | `ls tests/scenarios/` |
| Total scenario files | ~13-15 (varies with additions) | `ls tests/scenarios/*/` |
| Scenario levels tested | team, agent, skill, integration, negative | `tests/_registry.yml` |
| Coordination patterns tested | adaptive, hub-and-spoke, sequential, reciprocal | Test result files |
| Common scenario structure | frontmatter, objective, pre-conditions, task, expected, criteria, rubric, ground truth, observation, variants | `tests/_template.md` |
| Alchemist's skills | athanor, transmute, chrysopoeia, metal, meditate, heal | `agents/alchemist.md` |

## Observation Protocol

### Timeline

Record timestamps for: T0 (invoke), T1 (metal start), T2 (metal done),
T3 (chrysopoeia start), T4 (chrysopoeia done), T5 (scope change),
T6 (meditate done), T7 (transmute start), T8 (final report).

### Recording Template

```markdown
## Run: YYYY-MM-DD-alchemist-chain-NNN
**Observer**: <name> | **Start**: HH:MM | **End**: HH:MM | **Duration**: Xm

### Chain Integrity
[Use Chain Integrity Log above]

### Criteria Results (1-10) & Rubric Scores (5 dims, /25)
[Use tables above]

### Key Observations / Lessons Learned
- Did context degrade across the chain or remain stable?
- ...
```

## Variants

- **Variant A: Two-stage chain** — Run only metal then chrysopoeia
  (skip transmute) to test a shorter chain.

- **Variant B: Different target** — Run the full chain on `agents/`
  instead of `tests/scenarios/`.

- **Variant C: Reverse chain** — Start with transmute, then chrysopoeia,
  then metal. Tests whether the chain works in any order.
