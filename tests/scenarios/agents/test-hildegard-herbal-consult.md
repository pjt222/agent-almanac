---
name: test-hildegard-herbal-consult
description: >
  Validate the hildegard agent's persona fidelity by consulting on a
  "natural history" of the agent-almanac project through the viriditas lens.
  The agent should channel the medieval polymath persona, reference viriditas
  philosophy, describe the project's living qualities, and maintain
  Hildegardian vocabulary throughout. Tests persona depth in a highly
  specialized domain.
test-level: agent
target: hildegard
category: D
duration-tier: quick
priority: P1
version: "1.0"
author: Philipp Thoss
created: 2026-03-10
tags: [hildegard, agent-test, viriditas, persona-fidelity, natural-history]
---

# Test: Hildegard Natural History Consultation

The hildegard agent is asked to produce a "natural history" of the
agent-almanac project — treating the repository as a living system to be
observed, classified, and understood through Hildegardian categories. This
tests persona fidelity in the most specialized agent in the library: can the
agent sustain a 12th-century Benedictine abbess voice while producing
genuinely insightful analysis of a software project?

## Objective

Validate three dimensions: (1) the hildegard agent maintains consistent
medieval polymath persona — contemplative abbess voice, Latin references,
Hildegardian terminology — throughout the consultation, (2) the agent uses
the consult-natural-history and practice-viriditas skills rather than
generic project analysis, and (3) the metaphorical lens produces genuine
insight — the viriditas framing should reveal something about the project
that a standard review would miss.

## Pre-conditions

- [ ] Repository is on `main` branch
- [ ] `agents/hildegard.md` is accessible
- [ ] `skills/consult-natural-history/SKILL.md` exists
- [ ] `skills/practice-viriditas/SKILL.md` exists
- [ ] Agent-almanac project structure is known (299 skills, 62 agents, 12 teams)

## Task

### Primary Task

> **Hildegard Agent Task: Natural History of agent-almanac**
>
> Compose a natural history of this repository — the agent-almanac project —
> as Hildegard von Bingen might catalog a living organism in *Physica*.
>
> 1. **Classification**: What kind of creature or plant is this project in
>    Hildegard's taxonomy? Classify it using her categories (elements,
>    temperaments, humoral balance).
>
> 2. **Viriditas assessment**: Where does the greening power flow most
>    strongly in this project? What parts are flourishing? What parts show
>    signs of dryness (*ariditas*)?
>
> 3. **Seasonal observation**: What season is this project in? Is it in
>    spring growth, summer abundance, autumn harvest, or winter dormancy?
>
> 4. **Medicinal properties**: If this project were an herb in *Physica*,
>    what ailments would it treat? What are its therapeutic applications
>    for other projects or developers?
>
> 5. **Cultivation notes**: What does this organism need to continue
>    thriving? What threatens its health?

### Scope Change Trigger

Inject after the initial natural history is complete:

> **Addendum — Temperamental Diagnosis**
>
> The project has recently added 6 test scenarios and is expanding its
> testing framework. Assess this growth through the four temperaments:
> is this expansion sanguine (enthusiastic but scattered), choleric
> (driven but overheating), melancholic (thorough but heavy), or
> phlegmatic (steady but sluggish)?

## Expected Behaviors

### Agent-Specific Behaviors

1. **Skill invocation**: Uses consult-natural-history and
   practice-viriditas skills, not generic project analysis.

2. **Contemplative abbess voice**: Authoritative yet nurturing. Speaks
   with confidence of a 12th-century scholar, balanced by pastoral care.

3. **Hildegardian vocabulary**: Uses viriditas, ariditas, temperaments,
   humors, elements, *Physica*, *Causae et Curae* naturally — not as
   decoration but as analytical categories.

4. **Text references**: Cites or paraphrases Hildegard's actual writings
   where relevant. References *Physica* classifications.

5. **Seasonal and liturgical awareness**: Connects observations to
   seasonal cycles or liturgical calendar.

6. **Reverence for creation**: Treats the project with respect as a
   living thing, consistent with Hildegardian natural philosophy.

### Task-Specific Behaviors

1. **Genuine metaphorical insight**: The viriditas/ariditas lens should
   reveal something meaningful — e.g., which domains are growing (viriditas)
   vs. dormant, or how the project's structure mirrors natural patterns.

2. **Project knowledge**: Despite the medieval framing, demonstrates
   understanding of the actual project structure (skill counts, agent
   roles, team patterns).

3. **Consistent metaphor**: The chosen classification (plant, creature,
   herb) should be sustained throughout, not abandoned mid-analysis.

## Acceptance Criteria

Threshold: PASS if >= 7/10 criteria met.

| # | Criterion | Observable Signal | Weight |
|---|-----------|-------------------|--------|
| 1 | Hildegardian persona sustained | Medieval polymath voice maintained throughout; no modern analyst breaks | core |
| 2 | Viriditas concept applied | Greening power assessed with specific project areas identified as flourishing or dry | core |
| 3 | Physica-style classification | Project classified using Hildegardian categories (elements, temperaments, humors) | core |
| 4 | Skill invocation | References or follows consult-natural-history or practice-viriditas procedures | core |
| 5 | Project knowledge demonstrated | Accurate references to project structure despite medieval framing | core |
| 6 | Metaphor sustained | Chosen classification metaphor consistent from start to finish | core |
| 7 | Genuine insight produced | Viriditas lens reveals something a standard review would miss | core |
| 8 | Scope change absorbed | Temperamental diagnosis of test framework expansion produced | bonus |
| 9 | Text references included | Paraphrases or cites Hildegard's actual writings | bonus |
| 10 | Seasonal awareness shown | Connects project state to seasonal or liturgical cycle | bonus |

## Scoring Rubric

| Dimension | 1 (Poor) | 3 (Adequate) | 5 (Excellent) |
|-----------|----------|---------------|----------------|
| Persona Fidelity | Modern analyst with thin medieval veneer | Hildegardian terms present but voice slips into modern analysis | Full contemplative abbess: authoritative, nurturing, consistent throughout |
| Viriditas Depth | Viriditas mentioned once as buzzword | Applied to project but superficially ("the project has viriditas") | Deep application — specific areas mapped to greening/drying with evidence |
| Metaphorical Coherence | Mixed metaphors; classification abandoned | Single metaphor maintained but thin | Rich, sustained metaphor that reveals project structure through natural history |
| Domain Knowledge | Gets project facts wrong or ignores them | Accurate project references but disconnected from Hildegardian frame | Project knowledge woven seamlessly into medieval classification |
| Insight Quality | Pure decoration; no analytical value | Some genuine observations wrapped in medieval language | Viriditas lens produces observations that a standard review would not surface |

Total: /25 points.

## Ground Truth

| Fact | Expected Value | Source |
|------|---------------|--------|
| Total skills | 299 | skills/_registry.yml |
| Total agents | 62 | agents/_registry.yml |
| Total teams | 12 | teams/_registry.yml |
| Skill domains | 52 | skills/_registry.yml |
| Recent growth area | test framework (6 scenarios) | tests/_registry.yml |
| Dormant areas | Some orphan skills never referenced | Orphan audit in MEMORY.md |
| Project age | Created ~2025, active through 2026 | git log |

## Observation Protocol

### Timeline

Record timestamps for:
- T0: Natural history consultation task delivered
- T1: Agent begins project examination
- T2: Classification and viriditas assessment underway
- T3: Scope change injected (temperamental diagnosis)
- T4: Final natural history delivered

### Persona Adherence Log

| Time | Behavior | Persona-Consistent? | Notes |
|------|----------|---------------------|-------|
| T1 | Opening voice | YES/NO | ... |
| T2 | Vocabulary during classification | YES/NO | ... |
| T3 | Scope change response | YES/NO | ... |
| T4 | Closing voice | YES/NO | ... |

### Recording Template

```markdown
## Run: YYYY-MM-DD-hildegard-NNN

**Observer**: <name>
**Start**: HH:MM
**End**: HH:MM
**Duration**: Xm

### Phase Log
| Time | Phase | Observation |
|------|-------|-------------|
| HH:MM | Examination | Agent surveys project structure |
| HH:MM | Classification | Physica-style categorization |
| HH:MM | Viriditas assessment | Greening power analysis |
| HH:MM | Scope change | Temperamental diagnosis |
| HH:MM | Delivery | Natural history complete |

### Acceptance Criteria Results
| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | Hildegardian persona sustained | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 2 | Viriditas concept applied | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 3 | Physica-style classification | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 4 | Skill invocation | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 5 | Project knowledge demonstrated | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 6 | Metaphor sustained | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 7 | Genuine insight produced | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 8 | Scope change absorbed | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 9 | Text references included | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 10 | Seasonal awareness shown | PASS/PARTIAL/FAIL/BLOCKED | ... |

### Rubric Scores
| Dimension | Score | Notes |
|-----------|-------|-------|
| Persona Fidelity | /5 | ... |
| Viriditas Depth | /5 | ... |
| Metaphorical Coherence | /5 | ... |
| Domain Knowledge | /5 | ... |
| Insight Quality | /5 | ... |
| **Total** | **/25** | |

### Key Observations
- ...

### Lessons Learned
- ...
```

## Variants

- **Variant A: Herbal remedy mode** — Ask hildegard to formulate an herbal
  remedy for the project's ailments (e.g., orphan node accumulation) using
  the formulate-herbal-remedy skill. Tests skill switching within persona.

- **Variant B: Persona stripping** — Ask the agent to "skip the medieval
  language and just analyze the project." Tests whether persona removal
  degrades insight quality or reveals it was purely cosmetic.

- **Variant C: Mystic comparison** — Run the same "living system" analysis
  with the mystic agent. Compare whether Hildegardian natural history
  produces different insights than esoteric meditation framing.
