---
name: test-coordinate-swarm-planning
description: >
  Validate the coordinate-swarm skill by executing it to plan a testing
  coverage strategy for 299 skills. The swarm should decompose the coverage
  problem using stigmergy, local rules, and quorum sensing to determine
  which skills to test first based on risk, value, and domain-diversity
  criteria. Tests whether the swarm coordination framework produces
  actionable planning output when applied to a meta-testing problem.
test-level: skill
target: coordinate-swarm
category: E
duration-tier: medium
priority: P2
version: "1.0"
author: Philipp Thoss
created: 2026-03-10
tags: [coordinate-swarm, skill-test, swarm, coverage-planning]
---

# Test: Coordinate Swarm Coverage Planning

Run the `coordinate-swarm` skill to design a foraging strategy for testing
coverage across 299 skills. The swarm coordination framework — stigmergy,
local rules, quorum sensing — is applied to the meta-problem of deciding
which skills to test next, in what order, and by what criteria.

## Objective

Validate that the coordinate-swarm skill's five-step procedure produces
a coherent, actionable coordination plan when applied to the test coverage
problem. The skill should classify the problem, design stigmergic signals
for test prioritization, define local rules for test agents, calibrate
quorum thresholds for coverage decisions, and propose tuning parameters —
all without a centralized test scheduler.

## Pre-conditions

- [ ] Repository is on `main` branch with clean working tree
- [ ] `skills/coordinate-swarm/SKILL.md` exists and is complete
- [ ] Current counts verified: 299 skills, 52 domains
- [ ] `tests/_registry.yml` exists with current test inventory (6 scenarios)
- [ ] Coverage gap is known: 6 of 299 skills tested (~2% coverage)

## Task

### Primary Task

> **Skill Task: Swarm Coverage Planning**
>
> Run the `coordinate-swarm` skill to plan a testing coverage strategy.
>
> **Context**:
> - 299 skills across 52 domains need testing
> - Currently 6 test scenarios exist (~2% coverage)
> - No centralized test scheduler — tests are created as agents explore
> - Goal: maximize coverage value per test created
>
> **Agents** (the test-writing swarm): Imagine 5 agents who can each
> create test scenarios independently. They need coordination to avoid
> duplicating effort and to collectively prioritize high-value targets.
>
> Follow the 5-step procedure: classify the problem, design stigmergic
> signals, define local rules, calibrate quorum sensing, and propose
> tuning parameters. Produce all intermediate artifacts.

### Scope Change Trigger

Inject after Step 2 (Signal Design) completes:

> **Addendum — Domain Diversity Constraint**
>
> Add a signal that prevents the swarm from over-testing a single domain.
> The 52 domains should receive coverage proportional to their size but
> with a minimum floor (every domain gets at least one test). Integrate
> this constraint into the existing signal table.

## Expected Behaviors

### Procedure-Specific Behaviors

1. **Step 1 (Classify)**: Identifies this as a foraging/division-of-labor
   hybrid problem — agents search for high-value test targets while
   self-organizing to cover different domains.

2. **Step 2 (Signals)**: Produces a signal design table with at least
   3-4 signals (e.g., tested-marker, priority-trail, domain-coverage,
   busy-marker) with decay rates and agent responses.

3. **Step 3 (Local Rules)**: Defines 3-7 prioritized rules that each
   test-writing agent follows using only local information (visible
   signals, own state).

4. **Step 4 (Quorum)**: Sets thresholds for collective decisions like
   "this domain has sufficient coverage" or "switch from exploration
   to exploitation mode."

5. **Step 5 (Tuning)**: Proposes parameters and a simulation/pilot
   approach for validating the swarm plan.

### Task-Specific Behaviors

1. **Coverage-aware prioritization**: Signals should encode information
   about which skills and domains have been tested vs. untested.

2. **Risk-based foraging**: Higher-priority testing for skills that are
   complex, cross-referenced, or foundational.

3. **Domain diversity**: After the scope change, the signal table should
   include a domain-saturation signal preventing clustering.

4. **Concrete, not abstract**: The plan should be specific enough that
   a human could actually follow it to prioritize the next 10 tests.

## Acceptance Criteria

Threshold: PASS if >= 6/9 criteria met.

| # | Criterion | Observable Signal | Weight |
|---|-----------|-------------------|--------|
| 1 | Problem classified | Coordination problem type identified with failure mode | core |
| 2 | Signal table produced | At least 3 signals with deposit conditions, decay rates, responses | core |
| 3 | Local rules defined | 3-7 prioritized rules using only local information | core |
| 4 | Quorum thresholds set | Collective decision thresholds with hysteresis | core |
| 5 | Tuning proposed | Parameters and validation approach documented | core |
| 6 | Coverage data used | References actual counts (299 skills, 52 domains, 6 tests) | core |
| 7 | Domain diversity signal added | Scope change integrated into signal table | bonus |
| 8 | Actionable output | Plan specific enough to guide next 10 test selections | bonus |
| 9 | Risk-based prioritization | High-value skills identified with criteria | bonus |

## Scoring Rubric

| Dimension | 1 (Poor) | 3 (Adequate) | 5 (Excellent) |
|-----------|----------|---------------|----------------|
| Procedure Fidelity | Skips steps or produces generic planning output | All 5 steps executed but some thin | Each step fully executed with all required artifacts |
| Signal Quality | Signals are vague or not independently meaningful | Reasonable signals but decay/response dynamics weak | Composable signals with well-calibrated decay and clear responses |
| Rule Clarity | Rules require global knowledge or are ambiguous | Local rules but some edge cases unaddressed | Simple, local, stateless rules with clear priority ordering |
| Problem Fit | Generic coordination plan, not tailored to testing | Tailored to testing but misses key dynamics | Deeply specific to test coverage with domain-aware foraging |
| Actionability | Abstract framework with no concrete next steps | Some concrete suggestions mixed with abstraction | Specific priority list derivable from the plan |

Total: /25 points.

## Ground Truth

| Fact | Expected Value | Source |
|------|---------------|--------|
| Total skills | 299 | `skills/_registry.yml` |
| Total domains | 52 | `skills/_registry.yml` |
| Existing tests | ~6 scenarios | `tests/_registry.yml` |
| Coverage | ~2% | Calculated |
| Largest domains | esoteric (29), compliance (17), devops (13), observability (13), mlops (12) | `skills/_registry.yml` |
| Single-skill domains | crafting (1), linguistics (1) | `skills/_registry.yml` |
| Problem class | Foraging + division of labor | coordinate-swarm procedure |

## Observation Protocol

### Timeline

Record timestamps for:
- T0: Skill invoked with coverage planning inputs
- T1: Step 1 (Classification) complete
- T2: Step 2 (Signal Design) complete
- T3: Scope change injected (domain diversity)
- T4: Step 3 (Local Rules) complete
- T5: Step 4 (Quorum Sensing) complete
- T6: Step 5 (Tuning) complete

### Recording Template

```markdown
## Run: YYYY-MM-DD-coordinate-swarm-NNN
**Observer**: <name> | **Start**: HH:MM | **End**: HH:MM | **Duration**: Xm

### Signal Table Evaluation
| Signal | Well-defined? | Decay Appropriate? | Response Clear? |
|--------|--------------|-------------------|-----------------|
| ... | Y/N | Y/N | Y/N |

### Criteria Results (1-9) & Rubric Scores (5 dims, /25)
[Use tables above]

### Key Observations / Lessons Learned
- Could this plan actually be executed to prioritize tests?
- ...
```

## Variants

- **Variant A: Smaller swarm** — Design for 2 agents instead of 5.
  Tests whether the coordination framework scales down gracefully.

- **Variant B: Different target** — Apply coordinate-swarm to plan
  coverage across 62 agents instead of 299 skills.

- **Variant C: Execute the plan** — After generating the swarm plan,
  follow its top-3 recommendations and actually create the test
  scenarios. Validates plan quality through execution.
