---
name: test-metal-self-extraction
description: >
  Validate the metal skill by running it on the agent-almanac repository itself.
  The self-referential extraction tests whether the skill correctly identifies
  the project's conceptual essence (reusable procedure management, persona
  definition, multi-agent coordination) without reproducing the 299 specific
  skills, 62 agents, or 12 teams. Ground truth is strong because we know
  exactly what this project contains.
test-level: skill
target: metal
version: "1.0"
author: Philipp Thoss
created: 2026-03-09
tags: [metal, alchemy, extraction, self-referential, skill-test]
---

# Test: Metal Self-Extraction

Run the `metal` skill on the agent-almanac repository itself — a self-
referential extraction that tests whether the 7-step metallurgical procedure
correctly separates essence from detail. We know exactly what this project
contains, making ground truth verification straightforward.

## Objective

Validate that the metal skill's procedure (prospect → assay → meditate →
smelt → heal → cast → temper) produces correctly abstracted extractions
that pass the Ore Test. The self-referential nature means every extracted
concept can be verified: does it describe the project's organizational
genome without reproducing its phenotype (the actual 299 skills)?

## Pre-conditions

- [ ] Repository is on `main` branch with clean working tree
- [ ] `skills/metal/SKILL.md` exists and is complete
- [ ] The `metal` skill is available via `/metal` (symlinked to `.claude/skills/`)
- [ ] Current counts verified: 299 skills, 62 agents, 12 teams, 15 guides
- [ ] The alchemist agent has `metal` in its skills list

## Task

### Primary Task

> **Skill Task: Metal Self-Extraction**
>
> Run the `metal` skill on this repository (`/mnt/d/dev/p/agent-almanac`).
>
> - **Purpose**: Onboarding — understand the project's conceptual architecture
> - **Focus domains**: All
> - **Output depth**: extract (full procedure)
> - **Maximum extractions**: 15
>
> Follow the 7-step procedure exactly as written in the SKILL.md. Produce
> all intermediate artifacts (Prospect Report, Assay Report, Temper
> Assessment) and the final Cast output with skeletal definitions.

### Scope Change Trigger

Inject after Step 3 (Meditate) completes:

> **Addendum — Compression Ratio Check**
>
> After completing the extraction, calculate the compression ratio
> (source lines analyzed / output lines produced) as described in the
> Extracting Project Essence guide. Report whether the extraction falls
> in the target range (5:1 to 50:1) and diagnose if it is a photograph,
> map, or globe.

## Expected Behaviors

### Procedure-Specific Behaviors

Since this is a skill-level test, expected behaviors map to procedure steps:

1. **Step 1 (Prospect)**: Produces a factual survey with project name,
   declared purpose, languages (markdown, YAML), size, shape
   (documentation library), and external surface.

2. **Step 2 (Assay)**: Samples representative files from different areas
   and identifies domains, verbs, roles, and flows. Classifies each as
   essential or accidental.

3. **Step 3 (Meditate)**: Explicitly releases implementation bias. Rewrites
   any framework-specific findings at a higher abstraction level.

4. **Step 4 (Smelt)**: Classifies each essential concept as skill, agent,
   or team with generalized names and one-line descriptions.

5. **Step 5 (Heal)**: Performs over-extraction, under-extraction,
   generalization, and balance checks.

6. **Step 6 (Cast)**: Produces skeletal definitions in agentskills.io
   format.

7. **Step 7 (Temper)**: Runs the final Ore Test on all extractions and
   produces the summary with count, coverage, confidence, and next steps.

### Task-Specific Behaviors

1. **Essence, not detail**: Extracted skills should describe categories
   like "author-structured-procedure" or "compose-agent-team", NOT
   reproduce specific skills like "write-testthat-tests" or
   "deploy-to-kubernetes".

2. **Correct project understanding**: The Prospect report should identify
   this as a documentation/definition library, not a software application.

3. **Ore Test compliance**: Every extraction should pass: "Could this
   concept exist in a completely different implementation?" References
   to "SKILL.md", "agentskills.io", or specific directory names = gangue.

4. **Reasonable count**: 5-15 total extractions. Fewer than 5 means
   under-extraction; more than 15 means operating at neighborhood scale.

## Acceptance Criteria

Threshold: PASS if >= 8/11 criteria met.

| # | Criterion | Observable Signal | Weight |
|---|-----------|-------------------|--------|
| 1 | Prospect report produced | Factual survey with project name, size, shape, languages | core |
| 2 | Assay report produced | Domains, verbs, roles, flows identified with essential/accidental tags | core |
| 3 | Meditate checkpoint executed | Explicit statement of released bias; no framework-specific language in subsequent output | core |
| 4 | Ore Test applied | Each extraction explicitly evaluated against "Could this exist in a different implementation?" | core |
| 5 | Extraction count in range | 5-15 total extractions (skills + agents + teams) | core |
| 6 | No detail leakage | No extracted name or description references "SKILL.md", "agentskills.io", specific skill names, or directory paths | core |
| 7 | Correct type classification | Skills are procedures (verbs), agents are roles (nouns), teams are coordination patterns (groups) | core |
| 8 | Heal checkpoint executed | Over-extraction, under-extraction, and generalization checks performed | core |
| 9 | Skeletal definitions produced | Cast step produces YAML-formatted skeletal definitions for all extractions | bonus |
| 10 | Temper assessment produced | Final summary with count, coverage, confidence level, and next steps | bonus |
| 11 | Compression ratio calculated | Ratio reported and diagnosed (photograph/map/globe) per scope change | bonus |

## Scoring Rubric

| Dimension | 1 (Poor) | 3 (Adequate) | 5 (Excellent) |
|-----------|----------|---------------|----------------|
| Procedure Fidelity | Skips steps or combines stages | All 7 steps executed but some thin | Each step fully executed with all required artifacts |
| Abstraction Level | Extractions reproduce specific skills/agents | Mix of abstract and specific — some gangue leaked through | All extractions at the correct conceptual level; zero project-specific references |
| Ore Test Rigor | Ore Test mentioned but not applied systematically | Applied at meditate and temper stages | Applied at meditate, heal, and temper — triple verification |
| Project Understanding | Misidentifies project type or purpose | Correct identification but shallow understanding | Deep understanding of the four-pillar architecture and composition model |
| Output Quality | Raw notes, no structure | Structured reports but missing some sections | Complete, well-formatted artifacts at every stage |

Total: /25 points.

## Ground Truth

Known facts about the agent-almanac project for verifying extraction accuracy.

| Fact | Expected Value | Source |
|------|---------------|--------|
| Project type | Documentation/definition library (not software application) | README.md, CLAUDE.md |
| Content types | 4 (skills, agents, teams, guides) | CLAUDE.md Architecture section |
| Skills count | 299 | `skills/_registry.yml` |
| Agents count | 62 | `agents/_registry.yml` |
| Teams count | 12 | `teams/_registry.yml` |
| Guides count | 15 | `guides/_registry.yml` |
| Skill domains | 52 | `skills/_registry.yml` |
| Coordination patterns | 7 | `teams/_registry.yml` |
| Primary languages | Markdown, YAML | File inspection |
| Key roles | skill author, agent designer, team composer, standards reviewer | Cross-referencing teams and guides |
| Key procedures | create/evolve/review skills, compose teams, run audits | Skills registry |
| Key coordination patterns | hub-and-spoke (dominant), sequential, parallel, adaptive | Teams registry |
| Standard followed | agentskills.io | CLAUDE.md, skill frontmatter |

### What Should NOT Appear in Extractions

- Specific skill names (e.g., "write-testthat-tests", "deploy-to-kubernetes")
- Specific agent names (e.g., "r-developer", "mystic")
- Specific team names (e.g., "tending", "scrum-team")
- File format references (e.g., "SKILL.md", "_registry.yml")
- Technology references (e.g., "Claude Code", "WSL", "R", "Node.js")

### What SHOULD Appear (Conceptual Level)

- A skill about creating/authoring structured procedures
- A skill about composing multi-agent groups
- An agent for standards/quality review
- An agent for cross-disciplinary synthesis
- A team pattern for coordinated review
- Concepts around registry-driven discovery, progressive disclosure, meta-cognitive checkpoints

## Observation Protocol

### Timeline

Record timestamps for:
- T0: Metal skill invoked with inputs
- T1: Prospect report complete
- T2: Assay report complete
- T3: Meditate checkpoint complete
- T4: Smelt classification complete
- T5: Heal checkpoint complete
- T6: Cast definitions complete
- T7: Scope change injected (compression ratio)
- T8: Temper assessment complete (final delivery)

### Procedure Fidelity Log

| Step | Name | Started | Completed | Artifacts Produced | Notes |
|------|------|---------|-----------|--------------------|-------|
| 1 | Prospect | HH:MM | HH:MM | Prospect Report | ... |
| 2 | Assay | HH:MM | HH:MM | Assay Report | ... |
| 3 | Meditate | HH:MM | HH:MM | Bias statement | ... |
| 4 | Smelt | HH:MM | HH:MM | Classification table | ... |
| 5 | Heal | HH:MM | HH:MM | Quality assessment | ... |
| 6 | Cast | HH:MM | HH:MM | Skeletal definitions | ... |
| 7 | Temper | HH:MM | HH:MM | Temper assessment | ... |

### Ore Test Verification

| # | Extraction Name | Type | Ore Test Pass? | Rationale |
|---|----------------|------|----------------|-----------|
| 1 | ... | skill/agent/team | YES/NO | ... |

### Recording Template

```markdown
## Run: YYYY-MM-DD-metal-NNN

**Observer**: <name>
**Start**: HH:MM
**End**: HH:MM
**Duration**: Xm

### Phase Log
| Time | Phase | Observation |
|------|-------|-------------|
| HH:MM | Prospect | Survey begins |
| HH:MM | Assay | Sampling representative files |
| HH:MM | Meditate | Bias clearing |
| HH:MM | Smelt | Classification |
| HH:MM | Heal | Quality verification |
| HH:MM | Cast | Definition generation |
| HH:MM | Scope change | Compression ratio addendum |
| HH:MM | Temper | Final validation |

### Acceptance Criteria Results
| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | Prospect report | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 2 | Assay report | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 3 | Meditate checkpoint | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 4 | Ore Test applied | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 5 | Count in range (5-15) | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 6 | No detail leakage | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 7 | Correct type classification | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 8 | Heal checkpoint | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 9 | Skeletal definitions | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 10 | Temper assessment | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 11 | Compression ratio | PASS/PARTIAL/FAIL/BLOCKED | ... |

### Rubric Scores
| Dimension | Score | Notes |
|-----------|-------|-------|
| Procedure Fidelity | /5 | ... |
| Abstraction Level | /5 | ... |
| Ore Test Rigor | /5 | ... |
| Project Understanding | /5 | ... |
| Output Quality | /5 | ... |
| **Total** | **/25** | |

### Key Observations
- ...

### Lessons Learned
- ...
```

## Variants

- **Variant A: Survey depth only** — Run with `output_depth: survey`
  (prospect + assay only) to test the early stages in isolation.

- **Variant B: External repository** — Run metal on a well-known open
  source project (e.g., Express.js, dplyr) where the expected extractions
  can be independently verified.

- **Variant C: Alchemist agent** — Instead of invoking the skill directly,
  ask the alchemist agent to run metal. Tests whether the agent correctly
  locates and follows the skill procedure.

- **Variant D: Capped extractions (5)** — Set maximum extractions to 5
  to test whether the procedure prioritizes the most essential concepts
  when forced to be selective.
