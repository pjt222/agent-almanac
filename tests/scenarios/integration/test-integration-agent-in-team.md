---
name: test-integration-agent-in-team
description: >
  Validate that the entomology team's members invoke their assigned skills
  during coordinated hub-and-spoke work. The team surveys agent-almanac's
  "skill ecosystem" for biodiversity, with each member using their specific
  entomology skills analogically: survey-insect-population for skill population
  trends, identify-insect for domain classification, and document-insect-sighting
  for documentation quality cataloging.
test-level: integration
target: entomology
category: G
duration-tier: medium
priority: P1
version: "1.0"
author: Philipp Thoss
created: 2026-03-10
tags: [integration, agent-in-team, entomology, skill-usage, ecosystem]
---

# Test: Agent-in-Team Composition (Entomology)

The entomology team surveys agent-almanac's skill ecosystem for biodiversity,
with each member applying their specialist skills analogically. This tests
whether agents within a hub-and-spoke team actually invoke their assigned
skills during coordinated work, rather than producing generic analysis.

## Objective

Validate that team coordination produces differentiated specialist output
where each agent's contribution reflects their specific skill set. The
conservation-entomologist should use survey-insect-population thinking,
the taxonomic-entomologist should use identify-insect methodology, and the
citizen-entomologist should use document-insect-sighting protocols. If all
three produce similar generic output, skill-in-agent-in-team composition
is failing.

## Pre-conditions

- [ ] Repository is on `main` branch with clean working tree
- [ ] `teams/entomology.md` exists with hub-and-spoke coordination
- [ ] All three agents exist: `conservation-entomologist.md`, `taxonomic-entomologist.md`, `citizen-entomologist.md`
- [ ] Skills exist: `survey-insect-population`, `identify-insect`, `document-insect-sighting`
- [ ] Current counts verified against the four `_registry.yml` files (source of truth — do not hardcode)

## Task

### Primary Task

> **Team Task: Skill Ecosystem Biodiversity Survey**
>
> Activate the entomology team to survey the agent-almanac skill ecosystem
> for biodiversity. Treat the 361 skills across 65 domains (as of 2026-07;
> re-derive from the registries) as a "species
> population" to study:
>
> - **Conservation lead**: Assess ecosystem health — are domains balanced
>   or are some overpopulated while others are endangered? What are the
>   population trends?
> - **Taxonomic specialist**: Classify the skill "species" — are domain
>   tags accurate? Are there misclassified skills? Do any skills belong
>   to multiple domains?
> - **Citizen scientist**: Evaluate documentation accessibility — how
>   easy is it for a newcomer to discover and understand skills? Rate
>   the "field guide" quality.
>
> Produce a unified biodiversity report with each specialist's findings
> and the lead's ecological synthesis.

### Scope Change Trigger

Inject after the taxonomic specialist's classification work begins:

> **Addendum — Invasive Species Check**
>
> The taxonomic specialist should also check for "invasive species" —
> skills that have drifted outside their declared domain. For example,
> a skill tagged `esoteric` that is actually a straightforward DevOps
> procedure, or a skill tagged `general` that clearly belongs in a
> specific domain.

## Expected Behaviors

### Coordination-Specific Behaviors

From the hub-and-spoke pattern:

1. **Lead distributes tasks**: The conservation-entomologist receives
   the request, decomposes it, and creates scoped tasks for each
   specialist.

2. **Parallel specialist work**: The taxonomic and citizen specialists
   work independently on their scoped tasks without waiting for each
   other.

3. **Lead synthesizes**: After specialist reports are in, the lead
   combines findings with an ecological framing and conservation
   recommendations.

4. **Conflict resolution**: If specialists disagree (e.g., on whether
   a domain is "healthy"), the lead resolves with ecological reasoning.

### Task-Specific Behaviors

1. **Skill-differentiated output**: Each agent's contribution should
   be visibly different in methodology and vocabulary, reflecting their
   specific skills (survey vs. identify vs. document).

2. **Quantitative population data**: The conservation lead should
   cite actual domain sizes (e.g., "esoteric: 29 species, compliance:
   17, r-packages: 10") rather than vague assessments.

3. **Taxonomic precision**: The taxonomic specialist should examine
   actual skill frontmatter and flag specific misclassifications.

4. **Accessibility metrics**: The citizen specialist should evaluate
   concrete aspects: section completeness, jargon density, example
   quality, cross-reference coverage.

## Acceptance Criteria

Threshold: PASS if >= 7/10 criteria met.

| # | Criterion | Observable Signal | Weight |
|---|-----------|-------------------|--------|
| 1 | Lead distributes tasks | Explicit task decomposition before specialist work | core |
| 2 | Three distinct outputs | Each specialist produces differentiated content | core |
| 3 | Survey methodology used | Conservation lead uses population/trend language | core |
| 4 | Identification methodology used | Taxonomic specialist uses classification/key language | core |
| 5 | Documentation methodology used | Citizen specialist evaluates accessibility/readability | core |
| 6 | Lead synthesizes findings | Unified report combining all perspectives | core |
| 7 | Quantitative data cited | Actual domain counts and skill numbers referenced | core |
| 8 | Misclassifications identified | Taxonomic specialist flags specific domain-tag issues | bonus |
| 9 | Invasive species found | Scope change produces concrete examples of domain drift | bonus |
| 10 | Conservation recommendations | Lead proposes actions for ecosystem balance | bonus |

## Scoring Rubric

| Dimension | 1 (Poor) | 3 (Adequate) | 5 (Excellent) |
|-----------|----------|---------------|----------------|
| Coordination Fidelity | No visible hub-and-spoke; monolithic output | Lead delegates but synthesis is thin | Clear distribute-work-synthesize flow with lead framing |
| Skill Differentiation | All three agents produce similar generic analysis | Two agents are distinct, one is generic | All three contributions are methodologically distinct |
| Domain Knowledge | Vague references to "skills" without specifics | Some actual counts and domain names cited | Deep engagement with registry data, specific skill examples |
| Ecological Framing | Technical vocabulary, no ecosystem metaphor | Mixed metaphor — sometimes ecological, sometimes technical | Sustained ecological vocabulary enriching the analysis |
| Scope Change Handling | Invasive species check ignored | Acknowledged but no specific examples | Concrete misclassified skills identified with correction proposals |

Total: /25 points.

## Ground Truth

| Fact | Expected Value | Source |
|------|---------------|--------|
| Total skills | 361 | `skills/_registry.yml` |
| Total domains | 65 | `skills/_registry.yml` |
| Largest domain | esoteric (29 skills) | `skills/_registry.yml` |
| Second largest | general (24) | `skills/_registry.yml` |
| Smallest domains | crafting, edge-computing, i18n, linguistics, tensegrity (1 each) | `skills/_registry.yml` |
| Team coordination | hub-and-spoke | `teams/entomology.md` |
| Team lead | conservation-entomologist | `teams/entomology.md` |
| Team size | 3 | `teams/entomology.md` |

## Observation Protocol

### Timeline

Record timestamps for:
- T0: Entomology team activated
- T1: Lead completes task decomposition
- T2: Specialist work begins (parallel)
- T3: Scope change injected (invasive species)
- T4: Specialist reports delivered
- T5: Lead synthesis complete

### Recording Template

```markdown
## Run: YYYY-MM-DD-entomology-NNN
**Observer**: <name> | **Start**: HH:MM | **End**: HH:MM | **Duration**: Xm

### Agent Skill Usage Log
| Agent | Expected Skill | Invoked? | Evidence |
|-------|---------------|----------|----------|
| conservation-entomologist | survey-insect-population | Y/N | ... |
| taxonomic-entomologist | identify-insect | Y/N | ... |
| citizen-entomologist | document-insect-sighting | Y/N | ... |

### Criteria Results (1-10) & Rubric Scores (5 dims, /25)
[Use tables above]

### Key Observations / Lessons Learned
- ...
```

## Variants

- **Variant A: Single agent** — Same survey with just the conservation-
  entomologist. Compare depth and breadth with team output.

- **Variant B: Native domain** — Give the team an actual insect task
  to verify it works in its home domain, not just analogically.
