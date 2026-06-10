---
name: test-negative-malformed-scenario
description: >
  Validate that the test-team-coordination skill correctly detects and rejects
  a deliberately malformed test scenario file missing the required "Acceptance
  Criteria" section. The skill's Step 1.3 validation should catch the structural
  defect and abort with a clear error message rather than proceeding with
  incomplete data.
test-level: negative
target: test-team-coordination
category: F
duration-tier: quick
priority: P1
version: "1.0"
author: Philipp Thoss
created: 2026-03-10
tags: [negative, malformed-input, error-handling, test-team-coordination]
---

# Test: Malformed Scenario Rejection by Test Framework

The test-team-coordination skill (Step 1.3) requires six sections in every
scenario file: Objective, Pre-conditions, Task, Expected Behaviors, Acceptance
Criteria, and Observation Protocol. This negative test feeds the skill a
scenario file that is deliberately missing the Acceptance Criteria section,
verifying that the validation gate catches the defect and produces a clear,
actionable error message instead of silently proceeding.

## Objective

Validate the test framework's own input validation. The test-team-coordination
skill must reject structurally invalid scenario files at Step 1.3 rather than
allowing them to reach execution (Step 4). This tests defensive programming
within the framework itself — the system that tests others must also handle
its own bad inputs gracefully.

## Pre-conditions

- [ ] `skills/test-team-coordination/SKILL.md` exists and is the current version
- [ ] Repository is on `main` branch with clean working tree
- [ ] A malformed scenario file has been prepared (see Task below)

## Task

### Primary Task

Create a temporary malformed scenario file at
`tests/scenarios/negative/_malformed-fixture.md` with the following content —
a structurally valid YAML frontmatter but missing the `## Acceptance Criteria`
section entirely:

```markdown
---
name: test-fixture-malformed
description: Deliberately malformed fixture for negative testing
test-level: team
target: opaque-team
coordination-pattern: adaptive
team-size: 3
version: "1.0"
author: Test Fixture
created: 2026-03-10
tags: [fixture]
---

# Test: Malformed Fixture

A fixture scenario that is missing the Acceptance Criteria section.

## Objective

This is a test fixture. It exists only to be rejected.

## Pre-conditions

- [ ] None required

## Task

### Primary Task

Do nothing.

## Expected Behaviors

### Pattern-Specific Behaviors

1. None expected — this scenario should never reach execution.

## Observation Protocol

### Timeline

N/A — this scenario should be rejected at validation.
```

Then invoke the test-team-coordination skill against this malformed file:

> Run the test-team-coordination skill on
> `tests/scenarios/negative/_malformed-fixture.md`.

Observe whether Step 1.3 catches the missing section.

### Cleanup

After the test, delete `_malformed-fixture.md` — it is a transient fixture,
not a permanent scenario.

## Expected Behaviors

### Error-Handling Behaviors

1. **Validation gate triggers**: Step 1.3 detects missing "Acceptance Criteria" before Step 2.
2. **Clear error message**: Abort names the specific missing section, not a generic "invalid file."
3. **No partial execution**: Steps 2-7 do not execute. No result directory, no team, no RESULT.md.
4. **Graceful abort**: Clean termination — no stack traces, no silent continuation.

### Task-Specific Behaviors

1. **Section enumeration**: Error message lists which sections are present/missing.
2. **Frontmatter still parsed**: YAML parses successfully; the error is in the body, not metadata.

## Acceptance Criteria

Threshold: PASS if >= 5/7 criteria met.

| # | Criterion | Observable Signal | Weight |
|---|-----------|-------------------|--------|
| 1 | Step 1.3 detects missing section | Error message references "Acceptance Criteria" | core |
| 2 | Abort before Step 2 | No pre-condition checks are performed | core |
| 3 | No result directory created | `tests/results/` has no new directory for this run | core |
| 4 | Error message is human-readable | Message is a clear sentence, not a stack trace | core |
| 5 | Frontmatter parses successfully | Target, coordination-pattern, etc. are extracted before body validation fails | core |
| 6 | Missing section named explicitly | Error says "Acceptance Criteria" not just "missing section" | bonus |
| 7 | Fixture cleaned up | `_malformed-fixture.md` deleted after test completes | bonus |

## Observation Protocol

### Timeline

Record timestamps for:
- T0: Malformed fixture file created
- T1: test-team-coordination skill invoked on the fixture
- T2: Validation error produced (should be <10s after T1)
- T3: Fixture file deleted

### Recording Template

```markdown
## Run: YYYY-MM-DD-malformed-scenario-NNN
**Observer**: <name> | **Start**: HH:MM | **End**: HH:MM | **Duration**: Xm

### Phase Log
| Time | Phase | Observation |
|------|-------|-------------|
| HH:MM | Fixture creation | Malformed file written |
| HH:MM | Skill invocation | test-team-coordination invoked |
| HH:MM | Validation | Error produced / not produced |
| HH:MM | Cleanup | Fixture deleted |

### Acceptance Criteria Results
| # | Result | Evidence |
|---|--------|----------|
| 1-7 | PASS/FAIL | ... |

### Key Observations / Lessons Learned
- ...
```

## Variants

- **Variant A: Missing Objective** — Remove Objective instead. Tests whether all six sections are validated.
- **Variant B: Empty section** — Include heading but no table. Tests presence vs content validation.
- **Variant C: Malformed frontmatter** — Break YAML syntax. Tests a different error path.
