---
name: test-dyad-contemplative-review
description: >
  Validate the dyad team's reciprocal coordination pattern by tasking
  contemplative and alchemist with a two-round reciprocal review of the
  metal skill. Round 1: alchemist reviews procedure quality while
  contemplative witnesses reasoning patterns. Round 2: roles switch —
  contemplative assesses conceptual coherence while alchemist witnesses.
  Tests alternating roles, witness feedback quality, and dual-perspective
  synthesis.
test-level: team
target: dyad
coordination-pattern: reciprocal
team-size: 2
version: "1.0"
author: Philipp Thoss
created: 2026-03-09
tags: [dyad, reciprocal, contemplative, alchemist, metal, review, witnessing]
---

# Test: Dyad Contemplative Review of Metal

The dyad team — contemplative (lead) and alchemist (partner) — performs a
two-round reciprocal review of the `metal` skill. In each round, one member
acts as practitioner (reviewing the skill) while the other acts as witness
(observing reasoning patterns and providing reflective feedback). Roles
alternate between rounds. This is the only coordination pattern with
alternating roles, making it fundamentally different from all others.

## Objective

Validate that the reciprocal pattern produces genuine role alternation,
substantive witness feedback (not rubber-stamping), and a final synthesis
that integrates both perspectives. The metal skill is chosen as the review
target because it is new, complex (advanced-level, 7 steps), and spans
both practical procedure and conceptual framework — allowing the alchemist
to assess procedure quality and the contemplative to assess reasoning depth.

## Pre-conditions

- [ ] Repository is on `main` branch with clean working tree
- [ ] `skills/metal/SKILL.md` exists and is complete (312 lines)
- [ ] `agents/alchemist.md` has `metal` in its skills list
- [ ] `teams/dyad.md` exists with `coordination: reciprocal`
- [ ] The `test-team-coordination` skill is available (symlinked to `.claude/skills/`)

## Task

### Primary Task

> **Dyad Team Task: Reciprocal Review of the Metal Skill**
>
> Perform a two-round reciprocal review of `skills/metal/SKILL.md`.
>
> **Round 1 — Alchemist as Practitioner, Contemplative as Witness**:
> The alchemist reviews the metal skill's procedure quality:
> - Are the 7 steps well-ordered and complete?
> - Do the Expected/On failure blocks cover realistic scenarios?
> - Is the Ore Test clearly defined and consistently applied?
> - Does the skill fit coherently within the alchemy lineage (athanor, transmute, chrysopoeia, metal)?
>
> The contemplative observes the alchemist's reasoning process and provides
> reflective feedback: What assumptions did the alchemist bring? What blind
> spots appeared? What was the quality of attention?
>
> **Round 2 — Contemplative as Practitioner, Alchemist as Witness**:
> The contemplative assesses the metal skill's conceptual coherence:
> - Does the essence/detail distinction hold up under scrutiny?
> - Are the four perspectives (archaeologist, biologist, music theorist, cartographer) genuinely complementary or redundant?
> - Is the skill's self-awareness adequate (does it acknowledge its own limitations)?
> - Does the skill embody the meditate/heal checkpoints authentically?
>
> The alchemist witnesses the contemplative's reasoning and provides
> reflective feedback from the transmutive perspective.
>
> **Final Synthesis**: Integrate both rounds into a unified review with
> findings, strengths, and recommendations.

### Scope Change Trigger

Not applicable — the reciprocal pattern's test value lies in role
alternation and witness quality, not adaptation to scope changes. Adding
scope changes would conflate pattern testing with adaptation testing.

## Expected Behaviors

### Pattern-Specific Behaviors (Reciprocal)

From the coordination pattern definition in `tests/_registry.yml`:

1. **Clear practitioner/witness role distinction**: In each round, one
   member clearly acts as the primary reviewer (practitioner) while the
   other observes and reflects (witness). The roles should be explicitly
   stated, not blurred.

2. **Roles alternate between rounds**: The practitioner in Round 1 becomes
   the witness in Round 2, and vice versa. This alternation should be
   explicit and clean.

3. **Witness provides reflective feedback**: The witness's contribution
   should be substantive — observations about reasoning patterns, blind
   spots, assumptions, and quality of attention. NOT a summary of the
   practitioner's findings or a second review.

4. **Practice depth over breadth**: Each round should go deep on its
   focus area rather than trying to cover everything. The alchemist
   focuses on procedure quality; the contemplative focuses on conceptual
   coherence. They do not try to do each other's work.

### Task-Specific Behaviors

1. **Domain-appropriate review lenses**: The alchemist should review
   through the lens of transmutive quality (procedure robustness, stage
   completeness, alchemy lineage fit). The contemplative should review
   through the lens of meta-cognitive coherence (reasoning depth, self-
   awareness, authentic practice).

2. **Witness feedback influences Round 2**: The contemplative's witness
   feedback from Round 1 should visibly influence how the alchemist
   approaches witnessing in Round 2 (or how the contemplative adjusts
   their practitioner approach based on what they observed).

3. **Dual-perspective synthesis**: The final synthesis should genuinely
   integrate both perspectives, not just concatenate two reviews. Areas
   of agreement and disagreement should be noted.

4. **The metal skill is read and understood**: Both members should
   demonstrate actual engagement with the 312-line skill, not generic
   review patterns.

## Acceptance Criteria

Threshold: PASS if >= 6/9 criteria met.

| # | Criterion | Observable Signal | Weight |
|---|-----------|-------------------|--------|
| 1 | Clear role distinction | In each round, one member is explicitly practitioner and the other explicitly witness | core |
| 2 | Roles alternate | Alchemist practitioner → witness, Contemplative witness → practitioner between rounds | core |
| 3 | Substantive witness feedback | Witness observations address reasoning patterns/assumptions, not just content | core |
| 4 | Depth over breadth | Round 1 focuses on procedure quality; Round 2 focuses on conceptual coherence — not overlapping | core |
| 5 | Skill actually reviewed | Specific references to metal skill content (step names, the Ore Test, smelt criteria, etc.) | core |
| 6 | Dual synthesis | Final output integrates both perspectives with agreement/disagreement noted | core |
| 7 | Witness influences next round | Round 2 output differs from what it would be without Round 1 witness feedback | bonus |
| 8 | Domain-appropriate lenses | Alchemist uses transmutive vocabulary; contemplative uses meta-cognitive vocabulary | bonus |
| 9 | Actionable recommendations | Final synthesis includes specific, implementable improvement suggestions for the metal skill | bonus |

## Scoring Rubric

| Dimension | 1 (Poor) | 3 (Adequate) | 5 (Excellent) |
|-----------|----------|---------------|----------------|
| Role Clarity | Roles blurred; both members review simultaneously | Roles stated but witness drifts into co-reviewing | Crystal-clear distinction; witness provides a fundamentally different type of contribution |
| Witness Quality | Witness output is a summary or repetition of practitioner findings | Witness makes some observations about reasoning process | Witness reveals blind spots, assumptions, or patterns the practitioner could not see about themselves |
| Alternation Authenticity | Only one round occurs, or roles do not actually switch | Roles switch but the second round feels like a repeat | Clear role reversal; each member brings genuinely different strengths to each role |
| Synthesis Integration | Two reviews concatenated with a header | Some cross-referencing but mostly independent summaries | True synthesis — tensions identified, complementary insights woven together, emergent understanding |
| Engagement Depth | Generic review patterns; could apply to any skill | References specific metal content but superficially | Deep engagement with the Ore Test, 7-step procedure, alchemy lineage, and conceptual framework |

Total: /25 points.

## Ground Truth

Known facts about the metal skill for verifying review accuracy.

| Fact | Expected Value | Source |
|------|---------------|--------|
| Procedure steps | 7 (prospect, assay, meditate, smelt, heal, cast, temper) | `skills/metal/SKILL.md` |
| Skill complexity | Advanced | Frontmatter metadata |
| Alchemy lineage | athanor → transmute → chrysopoeia → metal | Guide: extracting-project-essence.md |
| Checkpoints | Meditate (Step 3) and Heal (Step 5) | Procedure |
| The Ore Test | "Could this concept exist in a completely different implementation?" | SKILL.md line 48-51 |
| Output format | agentskills.io skeletal definitions | Cast step |
| Target extraction count | 5-15 total (skills + agents + teams) | Smelt step and Common Pitfalls |
| Companion guide | `guides/extracting-project-essence.md` (4 perspectives) | Related Skills section |
| Allowed tools | Read, Grep, Glob, Bash | Frontmatter |
| Line count | ~312 lines | `wc -l` |

## Observation Protocol

### Timeline

Record timestamps for:
- T0: Dyad task delivered
- T1: Round 1 begins (alchemist as practitioner)
- T2: Alchemist completes Round 1 review
- T3: Contemplative delivers Round 1 witness feedback
- T4: Round 2 begins (contemplative as practitioner)
- T5: Contemplative completes Round 2 review
- T6: Alchemist delivers Round 2 witness feedback
- T7: Final synthesis delivered

### Role Alternation Log

| Round | Practitioner | Witness | Focus Area |
|-------|-------------|---------|------------|
| 1 | Alchemist | Contemplative | Procedure quality |
| 2 | Contemplative | Alchemist | Conceptual coherence |

### Witness Feedback Analysis

| Round | Witness | Feedback Type | Example |
|-------|---------|--------------|---------|
| 1 | Contemplative | Reasoning observation / Blind spot / Assumption / Attention quality | ... |
| 2 | Alchemist | Reasoning observation / Blind spot / Assumption / Attention quality | ... |

### Recording Template

```markdown
## Run: YYYY-MM-DD-dyad-NNN

**Observer**: <name>
**Start**: HH:MM
**End**: HH:MM
**Duration**: Xm

### Phase Log
| Time | Phase | Observation |
|------|-------|-------------|
| HH:MM | Setup | Lead establishes round structure |
| HH:MM | Round 1 practice | Alchemist reviews procedure quality |
| HH:MM | Round 1 witness | Contemplative provides reflective feedback |
| HH:MM | Transition | Roles switch |
| HH:MM | Round 2 practice | Contemplative reviews conceptual coherence |
| HH:MM | Round 2 witness | Alchemist provides reflective feedback |
| HH:MM | Synthesis | Dual-perspective integration |
| HH:MM | Delivery | Final review delivered |

### Acceptance Criteria Results
| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | Clear role distinction | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 2 | Roles alternate | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 3 | Substantive witness feedback | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 4 | Depth over breadth | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 5 | Skill actually reviewed | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 6 | Dual synthesis | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 7 | Witness influences next round | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 8 | Domain-appropriate lenses | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 9 | Actionable recommendations | PASS/PARTIAL/FAIL/BLOCKED | ... |

### Rubric Scores
| Dimension | Score | Notes |
|-----------|-------|-------|
| Role Clarity | /5 | ... |
| Witness Quality | /5 | ... |
| Alternation Authenticity | /5 | ... |
| Synthesis Integration | /5 | ... |
| Engagement Depth | /5 | ... |
| **Total** | **/25** | |

### Key Observations
- ...

### Lessons Learned
- ...
```

## Variants

- **Variant A: Three rounds** — Add a third round where both members
  reflect together (neither is witness). Tests whether the pattern
  naturally extends beyond paired alternation.

- **Variant B: Different skill** — Review a simpler skill (e.g.,
  `commit-changes`, basic complexity) to test whether the reciprocal
  pattern adds value for straightforward review targets.

- **Variant C: Different partner** — Replace alchemist with
  senior-researcher to test whether the reciprocal pattern works
  when the partner agent has a less contemplative orientation.

- **Variant D: Blind review** — Do not tell the agents what skill they
  are reviewing until the session starts. Tests whether the pattern
  handles unfamiliar material differently.
