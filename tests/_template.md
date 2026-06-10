---
name: test-<target>-<scenario-name>
description: >
  One-paragraph description of what is being tested and why.
test-level: team | agent | skill | negative | integration
target: <team-id | agent-id | skill-id>
coordination-pattern: <pattern from _registry.yml> (team tests only)
team-size: <N> (team tests only)
category: C | D | E | F | G  # (optional) test category
duration-tier: quick | medium | long  # (optional) expected duration
priority: P0 | P1 | P2  # (optional) implementation priority
version: "1.0"
author: Philipp Thoss
created: YYYY-MM-DD
tags: [tag1, tag2]
---

# Test: <Human-Readable Title>

Brief description of the test scenario and what makes it a good validation
of the target's capabilities.

## Objective

What this test validates in 2-3 sentences. Focus on the coordination
behavior, not just task output.

## Pre-conditions

- [ ] Pre-condition 1 (e.g., repository in clean state)
- [ ] Pre-condition 2 (e.g., specific files exist)
- [ ] Pre-condition 3 (e.g., registry counts verified)

## Task

The exact prompt or task description to give the target. Include:

### Primary Task

The initial task prompt, verbatim.

### Scope Change Trigger (optional)

A mid-task addition that tests adaptation. Specify when to inject it.

## Expected Behaviors

### Pattern-Specific Behaviors

From the coordination pattern definition in `tests/_registry.yml`:

1. Behavior 1
2. Behavior 2
3. Behavior 3
4. Behavior 4

### Task-Specific Behaviors

Behaviors specific to this scenario:

1. Behavior A
2. Behavior B

## Acceptance Criteria

Threshold: PASS if >= N/M criteria met.

| # | Criterion | Observable Signal | Weight |
|---|-----------|-------------------|--------|
| 1 | Criterion name | How to verify | core/bonus |
| 2 | ... | ... | ... |

## Scoring Rubric (optional)

| Dimension | 1 (Poor) | 3 (Adequate) | 5 (Excellent) |
|-----------|----------|---------------|----------------|
| Dimension 1 | Description | Description | Description |
| Dimension 2 | ... | ... | ... |

Total: /N points.

## Ground Truth (if applicable)

Known facts that can verify the accuracy of findings.

| Fact | Expected Value | Source |
|------|---------------|--------|
| Fact 1 | Value | How you know |

## Observation Protocol

### Timeline

Record timestamps for:
- Task start
- Phase transitions (e.g., assessment complete, execution begins)
- Scope change injection
- Task completion

### Recording Template

```markdown
## Run: YYYY-MM-DD-<target>-NNN

**Observer**: <name>
**Start**: HH:MM
**End**: HH:MM
**Duration**: Xm

### Phase Log
| Time | Phase | Observation |
|------|-------|-------------|
| HH:MM | ... | ... |

### Acceptance Criteria Results
| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | ... | PASS/PARTIAL/FAIL/BLOCKED | ... |

### Rubric Scores
| Dimension | Score | Notes |
|-----------|-------|-------|
| ... | /5 | ... |

### Key Observations
- ...

### Lessons Learned
- ...
```

## Variants (optional)

Alternative configurations for re-running the test:

- **Variant A**: Change X to test Y
- **Variant B**: Change X to test Z
