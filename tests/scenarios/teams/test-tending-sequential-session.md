---
name: test-tending-sequential-session
description: >
  Validate the tending team's sequential coordination pattern by running
  a domain health assessment of the alchemy domain after adding the metal
  skill. Four members work in strict sequence: mystic (set intention) →
  alchemist (assess domain coherence) → gardener (observe growth patterns) →
  shaman (integrate synthesis). Tests handoff quality, cumulative insight,
  and sequential ordering.
test-level: team
target: tending
coordination-pattern: sequential
team-size: 4
version: "1.0"
author: Philipp Thoss
created: 2026-03-09
tags: [tending, sequential, alchemy, domain-health, meta-cognitive, handoff]
---

# Test: Tending Sequential Session — Alchemy Domain Health

The tending team — mystic (lead), alchemist, gardener, and shaman — runs
a sequential session assessing the health of the alchemy domain after the
addition of the `metal` skill. Each member works in a strict handoff chain,
building on the previous member's output. The sequential pattern requires
clear handoff artifacts and cumulative insight, not repetitive restatement.

## Objective

Validate that the sequential coordination pattern produces clean handoffs
between members, that each phase adds genuinely new insight (not restatement
of the previous phase), and that the final member's deliverable references
and builds on all prior phases. The alchemy domain assessment is chosen
because it is substantive (4 skills, well-defined lineage), the team
members have domain-relevant expertise, and the "is the domain complete?"
question has a debatable answer.

## Pre-conditions

- [ ] Repository is on `main` branch with clean working tree
- [ ] All 4 alchemy skills exist: `athanor`, `transmute`, `chrysopoeia`, `metal`
- [ ] `agents/alchemist.md` lists all 4 alchemy skills
- [ ] `teams/tending.md` exists with `coordination: sequential`
- [ ] The `test-team-coordination` skill is available (symlinked to `.claude/skills/`)

## Task

### Primary Task

> **Tending Team Task: Alchemy Domain Health Assessment**
>
> Assess the health of the alchemy domain in this repository. The domain
> currently contains 4 skills:
> - `athanor` — Four-stage alchemical code transformation
> - `transmute` — Targeted single-function/module conversion
> - `chrysopoeia` — Value extraction through classification and optimization
> - `metal` — Conceptual essence extraction from repositories
>
> Work in sequence:
>
> **Phase 1 — Mystic (Meditate & Set Intention)**:
> Clear the space. Meditate on the alchemy domain's purpose. Set an
> intention for the assessment: What does domain health mean for a set
> of transmutive skills? What would a thriving alchemy domain look like?
> What would a struggling one look like?
>
> **Phase 2 — Alchemist (Assess Domain Coherence)**:
> Building on the mystic's intention, assess the alchemy domain's
> internal coherence:
> - Do the 4 skills form a logically complete set?
> - Is there overlap or redundancy between skills?
> - Are there gaps — transformative capabilities that should exist but don't?
> - Does the lineage (athanor → transmute → chrysopoeia → metal) tell a coherent story?
>
> **Phase 3 — Gardener (Observe Growth Patterns)**:
> Building on the alchemist's assessment, observe the domain's growth:
> - Is the domain thriving (healthy diversity, clear niche per skill) or overgrown (overlap, confusion)?
> - How does this domain compare in maturity to other domains? (52 domains exist)
> - Are there signs the domain needs pruning, or signs it needs more cultivation?
> - What is the soil quality (supporting infrastructure: guides, agent, tests)?
>
> **Phase 4 — Shaman (Integrate & Synthesize)**:
> Receive all prior outputs and produce a synthesis:
> - What is the overall health verdict for the alchemy domain?
> - What are the key strengths and vulnerabilities?
> - What specific actions would improve domain health?
> - Does the domain need a 5th skill, or is metal the capstone?

### Scope Change Trigger

Inject after the gardener phase (Phase 3) completes:

> **Addendum — Cross-Domain Comparison**
>
> In the shaman's synthesis, also compare the alchemy domain's health
> to one other domain of similar size (3-5 skills). Pick the domain
> that makes the most interesting comparison and explain why.

## Expected Behaviors

### Pattern-Specific Behaviors (Sequential)

From the coordination pattern definition in `tests/_registry.yml`:

1. **Clear handoff order between members**: Mystic → Alchemist → Gardener
   → Shaman. No member should begin before the previous member completes.

2. **Each member receives output from the previous**: The alchemist's
   assessment should reference the mystic's intention. The gardener's
   observation should build on the alchemist's coherence assessment.
   The shaman's synthesis should reference all three prior phases.

3. **No parallel execution within the sequence**: Members should not
   work simultaneously. Each phase starts after the previous completes.

4. **Final member produces the deliverable**: The shaman's synthesis
   is the team's output. Intermediate outputs are handoff artifacts,
   not final deliverables.

### Task-Specific Behaviors

1. **Cumulative insight**: Each phase should add genuinely new perspective.
   The gardener should see something the alchemist didn't. The shaman
   should see something none of the prior three did individually.

2. **Domain expertise**: Each member should apply their distinctive lens:
   mystic (meta-cognitive intention), alchemist (transmutive coherence),
   gardener (growth/cultivation), shaman (integrative synthesis).

3. **Concrete domain knowledge**: Members should reference actual alchemy
   skill content (procedure steps, the Ore Test, transmutation stages),
   not just generic domain assessment language.

4. **Debatable conclusion**: The "does the domain need a 5th skill?"
   question should produce a reasoned argument, not an automatic yes/no.

## Acceptance Criteria

Threshold: PASS if >= 7/10 criteria met.

| # | Criterion | Observable Signal | Weight |
|---|-----------|-------------------|--------|
| 1 | Sequential ordering | Phases execute in order: mystic → alchemist → gardener → shaman | core |
| 2 | Handoff artifacts | Each phase produces an explicit output that the next phase receives | core |
| 3 | Cumulative building | Each phase references and builds on the previous, not just restates | core |
| 4 | Distinct lenses | Each member's contribution reflects their unique expertise (not interchangeable) | core |
| 5 | All 4 skills assessed | The assessment explicitly covers athanor, transmute, chrysopoeia, and metal | core |
| 6 | Lineage coherence evaluated | The alchemy lineage story is assessed (not just individual skills in isolation) | core |
| 7 | Shaman synthesis references all phases | Final output explicitly references insights from mystic, alchemist, and gardener | core |
| 8 | Scope change absorbed | Cross-domain comparison included in shaman's synthesis | core |
| 9 | Reasoned 5th-skill conclusion | The "is metal the capstone?" question receives a substantiated argument | bonus |
| 10 | Concrete skill knowledge | Members reference actual content (Ore Test, nigredo/albedo/citrinitas/rubedo, etc.) | bonus |

## Scoring Rubric

| Dimension | 1 (Poor) | 3 (Adequate) | 5 (Excellent) |
|-----------|----------|---------------|----------------|
| Handoff Quality | No visible handoff; phases feel independent | Handoff artifacts exist but weak connection between phases | Rich handoff where each phase deeply builds on the previous |
| Cumulative Insight | Each phase restates the previous in different words | Each phase adds some new perspective but overlap is significant | Clear progression — each phase reveals something the prior could not |
| Expertise Differentiation | All members sound the same regardless of role | Members show some role-appropriate vocabulary | Each member's contribution is unmistakably from their domain perspective |
| Domain Depth | Assessment could apply to any domain (generic) | References specific alchemy skills and their relationships | Deep engagement with procedure details, the Ore Test, lineage logic |
| Synthesis Quality | Shaman summarizes without integrating | Synthesis references prior phases but mainly recaps | Synthesis identifies emergent patterns visible only by combining all perspectives |

Total: /25 points.

## Ground Truth

Known facts about the alchemy domain for verifying assessment accuracy.

| Fact | Expected Value | Source |
|------|---------------|--------|
| Alchemy skills count | 4 | `skills/_registry.yml` alchemy domain |
| Skill names | athanor, transmute, chrysopoeia, metal | Registry |
| All complexity: advanced | 3/4 advanced, 1/4 varies | Skill frontmatter |
| Lineage order | athanor (transform code) → transmute (convert code) → chrysopoeia (extract value) → metal (extract concepts) | `guides/extracting-project-essence.md` |
| Agent carrying all 4 | alchemist | `agents/alchemist.md` frontmatter |
| Companion guide exists | `guides/extracting-project-essence.md` | Guides registry |
| Domain has checkpoints | meditate + heal used as stage gates | alchemist.md, athanor SKILL.md |
| Comparable domains (3-5 skills) | bushcraft (4), mcp-integration (5), web-dev (4), reporting (4) | Skills registry |
| Alchemy domain completeness | Debatable — covers transform, convert, optimize, extract | Domain analysis |

## Observation Protocol

### Timeline

Record timestamps for:
- T0: Tending task delivered
- T1: Mystic begins Phase 1 (meditate & intention)
- T2: Mystic completes; handoff to alchemist
- T3: Alchemist begins Phase 2 (coherence assessment)
- T4: Alchemist completes; handoff to gardener
- T5: Gardener begins Phase 3 (growth observation)
- T6: Gardener completes; scope change injected
- T7: Shaman begins Phase 4 (synthesis)
- T8: Final synthesis delivered

### Handoff Artifact Log

| Handoff | From | To | Artifact Summary | Builds on Previous? |
|---------|------|----|------------------|---------------------|
| H1 | Mystic | Alchemist | ... | (first) |
| H2 | Alchemist | Gardener | ... | YES/NO |
| H3 | Gardener | Shaman | ... | YES/NO |

### Recording Template

```markdown
## Run: YYYY-MM-DD-tending-NNN

**Observer**: <name>
**Start**: HH:MM
**End**: HH:MM
**Duration**: Xm

### Phase Log
| Time | Phase | Observation |
|------|-------|-------------|
| HH:MM | Phase 1 | Mystic meditates and sets intention |
| HH:MM | Handoff 1 | Mystic → Alchemist |
| HH:MM | Phase 2 | Alchemist assesses domain coherence |
| HH:MM | Handoff 2 | Alchemist → Gardener |
| HH:MM | Phase 3 | Gardener observes growth patterns |
| HH:MM | Scope change | Cross-domain comparison added |
| HH:MM | Handoff 3 | Gardener → Shaman |
| HH:MM | Phase 4 | Shaman integrates synthesis |
| HH:MM | Delivery | Final synthesis complete |

### Acceptance Criteria Results
| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | Sequential ordering | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 2 | Handoff artifacts | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 3 | Cumulative building | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 4 | Distinct lenses | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 5 | All 4 skills assessed | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 6 | Lineage coherence | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 7 | Shaman refs all phases | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 8 | Scope change absorbed | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 9 | Reasoned 5th-skill conclusion | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 10 | Concrete skill knowledge | PASS/PARTIAL/FAIL/BLOCKED | ... |

### Rubric Scores
| Dimension | Score | Notes |
|-----------|-------|-------|
| Handoff Quality | /5 | ... |
| Cumulative Insight | /5 | ... |
| Expertise Differentiation | /5 | ... |
| Domain Depth | /5 | ... |
| Synthesis Quality | /5 | ... |
| **Total** | **/25** | |

### Key Observations
- ...

### Lessons Learned
- ...
```

## Variants

- **Variant A: Reverse order** — Run shaman → gardener → alchemist →
  mystic to test whether the sequential pattern works regardless of
  member ordering, or whether domain-appropriate ordering matters.

- **Variant B: Different domain** — Assess a different domain (e.g.,
  esoteric with 29 skills, or a small domain like crafting with 1 skill)
  to test whether the tending session scales across domain sizes.

- **Variant C: Skip a member** — Remove the gardener phase to test
  whether the sequential pattern handles a 3-member chain gracefully.

- **Variant D: Double pass** — Run the full sequence twice. On the second
  pass, each member receives both their predecessor's output AND their
  own output from the first pass. Tests whether iterative tending
  deepens or just repeats.
