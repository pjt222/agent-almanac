---
name: test-integration-skill-in-agent
description: >
  Validate that the gardener agent naturally composes its domain skills
  (read-garden, prepare-soil) with inherited default skills (meditate, heal)
  during a garden-reading assessment of agent-almanac's ecosystem health. Tests
  whether default skills are internalized and invoked without explicit
  instruction, demonstrating skill-in-agent composition.
test-level: integration
target: gardener
category: G
duration-tier: medium
priority: P1
version: "1.0"
author: Philipp Thoss
created: 2026-03-10
tags: [integration, skill-in-agent, gardener, default-skills, composition]
---

# Test: Skill-in-Agent Composition (Gardener)

The gardener agent performs a read-garden assessment of the agent-almanac
repository, treating it as a living ecosystem. The gardener has both domain
skills (read-garden, prepare-soil) and default skills (meditate, heal) that
every agent inherits. This test validates whether the agent naturally invokes
meditate/heal checkpoints during its work without being told to.

## Objective

Validate that an agent's inherited default skills (meditate, heal) are
internalized into its working process, not merely listed in its definition.
The gardener agent should demonstrate skill composition by weaving
contemplative checkpoints into its read-garden assessment flow — showing
that default skills function as genuine behavioral components, not decoration.

## Pre-conditions

- [ ] Repository is on `main` branch with clean working tree
- [ ] `agents/gardener.md` exists with `meditate` and `heal` in its skills list
- [ ] `skills/read-garden/SKILL.md`, `skills/meditate/SKILL.md`, and `skills/heal/SKILL.md` exist
- [ ] The gardener agent is discoverable via `.claude/agents/`
- [ ] Default skills (`meditate`, `heal`) are listed in `agents/_registry.yml` under `default_skills`

## Task

### Primary Task

> **Agent Task: Garden Reading of Agent-Almanac**
>
> Use the gardener agent to perform a read-garden assessment of this
> repository (`/mnt/d/dev/p/agent-almanac`). Treat it as a garden
> ecosystem:
>
> - **Skills** are the planted beds (299 plantings across 52 zones)
> - **Agents** are the gardeners and workers (62 hands in the garden)
> - **Teams** are the coordinated work crews (12 teams)
> - **Guides** are the garden maps and almanacs (16 references)
>
> Produce a garden health assessment following the gardener's
> observation-first approach: gestalt impression, sensory layer,
> pattern recognition, and triage.

### Scope Change Trigger

Inject after the gestalt impression is complete:

> **Addendum — Weeding Assessment**
>
> During your sensory layer pass, also identify "weeds" — orphan skills
> that are registered but never referenced by any agent, team, or guide.
> Estimate the weeding effort needed and whether any weeds are actually
> beneficial volunteers worth keeping.

## Expected Behaviors

### Composition-Specific Behaviors

Since this is an integration test of skill-in-agent composition:

1. **Meditate before observation**: The gardener's practice framework
   specifies meditate before structural work. The agent should clear
   assumptions before starting the read-garden assessment — without
   the prompt mentioning meditate.

2. **Read-garden procedure followed**: The agent should follow the
   structured observation protocol: gestalt impression, sensory layer
   (leaf/stem/root/soil analogies), pattern recognition, and triage.

3. **Heal checkpoint at triage**: After gathering observations, the
   gardener should naturally invoke a heal checkpoint to assess
   ecosystem health — classifying findings as immediate, soon, or watch.

4. **Domain metaphor maintained**: The agent should consistently use
   garden language (beds, zones, weeds, soil health) rather than
   switching to technical vocabulary.

### Task-Specific Behaviors

1. **Ecosystem mapping**: The agent identifies the four content types
   as garden zones with appropriate plant/garden analogies.

2. **Health indicators**: Observations should map to the gardener's
   Five Indicators framework (leaf language, stem strength, root
   signals, soil indicators, phenology) applied metaphorically.

3. **Orphan detection**: The scope change should produce concrete
   findings about unreferenced skills, using garden weeding language.

## Acceptance Criteria

Threshold: PASS if >= 7/10 criteria met.

| # | Criterion | Observable Signal | Weight |
|---|-----------|-------------------|--------|
| 1 | Meditate invoked | Explicit clearing/centering step before observation begins | core |
| 2 | Read-garden procedure followed | Structured observation with gestalt, sensory, pattern phases | core |
| 3 | Heal checkpoint present | Health triage after observations, classifying findings by urgency | core |
| 4 | Default skills unprompted | Meditate/heal invoked without being mentioned in the task prompt | core |
| 5 | Garden metaphor consistent | Uses garden vocabulary throughout, not switching to tech language | core |
| 6 | Ecosystem correctly mapped | Four content types identified and characterized as garden zones | core |
| 7 | Five Indicators applied | At least 3 of the 5 observation channels used analogically | core |
| 8 | Orphan weeds identified | Scope change produces specific orphan skill findings | bonus |
| 9 | Triage matrix produced | Findings classified as immediate/soon/watch | bonus |
| 10 | Seasonal awareness | Assessment references project maturity or growth stage | bonus |

## Scoring Rubric

| Dimension | 1 (Poor) | 3 (Adequate) | 5 (Excellent) |
|-----------|----------|---------------|----------------|
| Skill Composition | Default skills absent — no meditate or heal | One checkpoint present but feels bolted on | Both meditate and heal woven naturally into the assessment flow |
| Procedure Fidelity | Skips read-garden structure; free-form assessment | Follows structure loosely; some phases thin | Full three-phase observation with artifacts at each stage |
| Metaphor Coherence | Drops garden language after the intro | Mostly garden language with occasional tech leakage | Sustained garden metaphor that enhances rather than obscures findings |
| Assessment Depth | Surface-level observations, no actionable findings | Several observations with some supporting evidence | Deep observations tied to specific files/counts with triage priorities |
| Scope Change Handling | Ignores orphan assessment or gives generic response | Acknowledges orphans but no specifics | Identifies specific orphan skills with weed/volunteer classification |

Total: /25 points.

## Ground Truth

| Fact | Expected Value | Source |
|------|---------------|--------|
| Skills count | 299 | `skills/_registry.yml` |
| Agents count | 62 | `agents/_registry.yml` |
| Teams count | 12 | `teams/_registry.yml` |
| Guides count | 16 | `guides/_registry.yml` |
| Skill domains | 52 | `skills/_registry.yml` |
| Default skills | meditate, heal | `agents/_registry.yml` default_skills |
| Known orphan skills | 23 (from orphan audit) | MEMORY.md orphan node audit |
| Gardener's skills list | read-garden, prepare-soil, plan-garden-calendar, cultivate-bonsai, maintain-hand-tools, meditate, heal, forage-plants | `agents/gardener.md` |

## Observation Protocol

### Timeline

Record timestamps for:
- T0: Gardener agent invoked with task
- T1: Meditate checkpoint (if present — key integration signal)
- T2: Gestalt impression complete
- T3: Scope change injected (weeding assessment)
- T4: Sensory layer complete
- T5: Heal checkpoint (if present — key integration signal)
- T6: Triage / final assessment delivered

### Recording Template

```markdown
## Run: YYYY-MM-DD-gardener-NNN
**Observer**: <name> | **Start**: HH:MM | **End**: HH:MM | **Duration**: Xm

### Skill Composition Log
| Skill | Invoked? | Prompted? | Natural Fit? | Notes |
|-------|----------|-----------|--------------|-------|
| meditate | Y/N | N (must be N) | Y/N | ... |
| heal | Y/N | N (must be N) | Y/N | ... |
| read-garden | Y/N | Y (prompted) | Y/N | ... |

### Criteria Results (1-10) & Rubric Scores (5 dims, /25)
[Use tables above]

### Key Observations / Lessons Learned
- Did default skills feel internalized or perfunctory?
- ...
```

## Variants

- **Variant A: Without meditate/heal in skills list** — Remove meditate
  and heal from the gardener's frontmatter (but keep in default_skills).
  Tests whether default skills are inherited even when not explicitly listed.

- **Variant B: Different agent** — Run the same task with the alchemist
  agent, which also lists meditate/heal explicitly. Compare how two
  different agents integrate the same default skills.

- **Variant C: Explicit instruction** — Add "use your meditate and heal
  skills" to the prompt. Compare output with the unprompted version to
  measure the delta that explicit instruction provides.
