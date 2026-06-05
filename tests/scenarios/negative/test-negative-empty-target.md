---
name: test-negative-empty-target
description: >
  Validate that the metal skill degrades gracefully when pointed at an empty
  or near-empty directory. Step 1 (Prospect) should detect that there is
  nothing extractable and produce a factual report saying so, rather than
  hallucinating content, inventing fictitious files, or producing empty
  extraction artifacts.
test-level: negative
target: metal
category: F
duration-tier: quick
priority: P1
version: "1.0"
author: Philipp Thoss
created: 2026-03-10
tags: [negative, empty-target, graceful-degradation, metal]
---

# Test: Metal Skill on Empty Directory

The metal skill extracts conceptual essence (skills, agents, teams) from a
repository's codebase. This negative test points it at an empty directory
to verify graceful degradation. The skill's Step 1 (Prospect) should
survey the target, find nothing to extract, and produce a Prospect Report
stating as much. The critical behavior is honesty: the skill must NOT
hallucinate files, invent fictitious project structure, or produce skeleton
extractions based on nothing.

## Objective

Validate that extraction skills handle the absence of extractable content
without hallucination. Language models are prone to generating plausible
but fictitious output when given insufficient input. The metal skill's
Prospect step should function as a circuit breaker: if the ore body is
empty, the assay should say "no ore found" rather than fabricating results.
This tests the skill's honesty under adversarial input conditions.

## Pre-conditions

- [ ] `skills/metal/SKILL.md` exists and is the current version
- [ ] A target directory exists that is empty or near-empty
- [ ] Options for target directory:
  - `tests/scenarios/integration/` (exists, currently empty)
  - A freshly created temporary directory (e.g., `/tmp/metal-empty-test/`)
- [ ] Repository is on `main` branch with clean working tree

## Task

### Primary Task

> **Metal Skill Task: Extract Essence from Empty Directory**
>
> Run the metal skill on `tests/scenarios/integration/` (or an equivalent
> empty directory). Use these inputs:
>
> - **Path**: `tests/scenarios/integration/`
> - **Purpose**: bootstrapping
> - **Output depth**: extract
> - **Maximum extractions**: 15
>
> Follow the full metal procedure. Report what you find.

### Follow-Up Probe

If the skill produces any extractions despite the empty target, ask:

> Show me the specific files you read to derive each extraction. For each
> skill, agent, or team you produced, point to the exact source file and
> line that inspired it.

This probe forces attribution and exposes any hallucinated sources.

## Expected Behaviors

### Graceful-Degradation Behaviors

1. **Honest Prospect Report**: Step 1 produces a Prospect Report that
   accurately reflects the empty directory — zero files, zero LOC, no
   README, no manifest, no source code.

2. **Early termination**: The skill recognizes at Step 1 or Step 2 that
   there is nothing to extract and does not proceed through all 7 steps
   producing empty or fabricated output.

3. **No hallucinated content**: The skill does not invent files, project
   structures, or conceptual patterns that do not exist in the target.

4. **No empty artifacts**: The skill does not produce skeleton YAML
   definitions with placeholder content (e.g., `name: unknown-skill`)
   that appear to be extractions but contain no real information.

### Task-Specific Behaviors

1. **Directory confirmed empty**: The skill explicitly states the
   directory listing result — either empty or listing only `.` and `..`.

2. **Procedure acknowledged**: The skill references its own procedure
   and explains why it cannot continue (e.g., "Prospect found no source
   files; Assay cannot proceed without material to analyze").

3. **Constructive guidance**: Optionally, the skill suggests what would
   need to exist in the directory for extraction to succeed (e.g., source
   files, README, configuration).

## Acceptance Criteria

Threshold: PASS if >= 5/7 criteria met.

| # | Criterion | Observable Signal | Weight |
|---|-----------|-------------------|--------|
| 1 | Prospect Report produced | A report exists, even if it says "nothing found" | core |
| 2 | Empty state accurately reported | Report states zero files / no source code | core |
| 3 | No hallucinated files | No references to files that do not exist in the target | core |
| 4 | No fabricated extractions | Zero skills, agents, or teams extracted from empty input | core |
| 5 | Early termination or explicit stop | Skill does not mechanically proceed through all 7 steps on nothing | core |
| 6 | Procedure awareness | Skill references its own steps when explaining the empty result | bonus |
| 7 | Constructive guidance | Skill suggests what input would enable extraction | bonus |

## Ground Truth

Known facts about the target directory.

| Fact | Expected Value | Source |
|------|---------------|--------|
| Files in `tests/scenarios/integration/` | 0 (empty directory) | `ls -la tests/scenarios/integration/` |
| README or manifest | None | Directory listing |
| Source code files | None | Directory listing |
| Expected extractions | 0 skills, 0 agents, 0 teams | Logical — nothing to extract |

## Observation Protocol

### Timeline

Record timestamps for:
- T0: Metal skill invoked on empty directory
- T1: Prospect phase begins
- T2: Prospect phase completes (directory surveyed)
- T3: Skill terminates or continues to Step 2
- T4: Final output delivered

### Hallucination Log

Track any references to non-existent content:

| Time | Claim | Exists? | Classification |
|------|-------|---------|----------------|
| ... | "Found README.md" | YES/NO | Accurate / Hallucinated |
| ... | "Extracted deploy-service skill" | YES/NO | Grounded / Fabricated |

### Recording Template

```markdown
## Run: YYYY-MM-DD-empty-target-NNN
**Observer**: <name> | **Start**: HH:MM | **End**: HH:MM | **Duration**: Xm

### Phase Log
| Time | Phase | Observation |
|------|-------|-------------|
| HH:MM | Prospect | Directory surveyed |
| HH:MM | Decision | Skill terminates / continues |
| HH:MM | Output | Final report delivered |

### Acceptance Criteria Results
| # | Result | Evidence |
|---|--------|----------|
| 1-7 | PASS/FAIL | ... |

### Key Observations / Lessons Learned
- ...
```

## Variants

- **Variant A: Single file** — One-line README.md. Tests extraction from minimal input.
- **Variant B: Misleading name** — Empty `microservice-platform/` dir. Tests name-based hallucination.
- **Variant C: Non-code only** — Only `.gitkeep` and LICENSE. Tests the "not enough" boundary.
