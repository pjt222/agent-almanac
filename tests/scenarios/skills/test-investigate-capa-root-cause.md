---
name: test-investigate-capa-root-cause
description: >
  Validate the investigate-capa-root-cause skill by applying it to a real test
  framework finding: the opaque-team adaptive pattern scored 73% versus 100%
  for sequential and reciprocal patterns. Uses 5-Why and fishbone analysis
  to investigate root causes of the performance gap. Tests a compliance domain
  skill on actual project data rather than a hypothetical scenario.
test-level: skill
target: investigate-capa-root-cause
category: E
duration-tier: medium
priority: P1
version: "1.0"
author: Philipp Thoss
created: 2026-03-10
tags: [investigate-capa-root-cause, skill-test, compliance, root-cause, capa]
---

# Test: Investigate CAPA Root Cause (Adaptive Pattern Gap)

Apply the `investigate-capa-root-cause` skill to a real finding from the
test framework: the opaque-team's adaptive coordination pattern scored 73%
on rubric (22/30) while sequential (tending) and reciprocal (dyad) patterns
scored 100%. This tests a compliance skill on actual project data.

## Objective

Validate that the investigate-capa-root-cause skill's 6-step procedure
(initiate, select method, analyse, design CAPA, verify effectiveness,
trend analysis) produces a rigorous investigation when applied to a real
performance finding. The finding is well-documented in the test framework
results, providing strong ground truth for evaluating investigation quality.

## Pre-conditions

- [ ] Repository is on `main` branch
- [ ] `skills/investigate-capa-root-cause/SKILL.md` exists and is complete
- [ ] Test results exist at `tests/results/` with cross-scenario analysis
- [ ] Cross-scenario analysis at `tests/results/2026-03-09-cross-scenario-analysis.md` is accessible
- [ ] The finding is documented: opaque-team scored 22/30 (73%) rubric

## Task

### Primary Task

> **Skill Task: CAPA Root Cause Investigation**
>
> Investigate the following finding using the `investigate-capa-root-cause`
> skill procedure:
>
> - **Finding**: Test scenario "test-opaque-team-cartographers-audit"
>   scored 73% on rubric (22/30) versus 100% (30/30) for sequential
>   pattern (tending) and 100% (25/25) for reciprocal pattern (dyad)
> - **Severity**: Major (significant performance gap in a coordination pattern)
> - **Evidence**: Cross-scenario analysis dated 2026-03-09; individual
>   test result files in `tests/results/`
>
> Apply both 5-Why analysis and fishbone (Ishikawa) analysis to determine
> root causes. Design corrective and preventive actions. The investigation
> scope is limited to the test framework — do not investigate the
> opaque-team definition itself as the "system under test."

### Scope Change Trigger

Inject after Step 3 (Root Cause Analysis) completes:

> **Addendum — Framework Limitation Assessment**
>
> The cross-scenario analysis noted that all tests were executed by a
> single agent simulating multiple roles (no actual multi-agent execution).
> Assess whether this framework limitation is itself a root cause or a
> confounding variable. Update your analysis accordingly.

## Expected Behaviors

### Procedure-Specific Behaviors

Since this is a skill-level test, expected behaviors map to procedure steps:

1. **Steps 1-2 (Initiate, Select)**: Produces investigation document with
   blame-free problem statement. Selects 5-Why + fishbone combination as
   appropriate for a multi-factor problem with justification.

2. **Step 3 (Analyse)**: Executes both 5-Why (linear cause chain) and
   fishbone (6 categories). Each step supported by evidence from test results.

3. **Steps 4-5 (CAPA, Verify)**: Distinguishes correction, corrective
   action, and preventive action with measurable success criteria. Defines
   verification plan with specific metrics and timelines.

4. **Step 6 (Trends)**: Places the finding in context of the broader
   test framework results (30 scenarios, 7 of 8 coordination patterns
   tested, as of 2026-07; re-derive from `tests/_registry.yml`).

### Task-Specific Behaviors

1. **Evidence-based analysis**: Every "why" and fishbone entry should
   reference specific data from the test results, not speculation.

2. **Framework awareness**: The investigation should recognize that the
   test framework itself (single-agent simulation) may contribute to
   the observed performance gap.

3. **Appropriate severity**: Major classification is correct — this is a
   significant finding but not a safety/compliance critical event.

4. **Actionable CAPAs**: Corrective actions should be specific to the
   test framework (e.g., add negative tests, implement actual multi-agent
   execution) rather than generic ("improve quality").

## Acceptance Criteria

Threshold: PASS if >= 7/10 criteria met.

| # | Criterion | Observable Signal | Weight |
|---|-----------|-------------------|--------|
| 1 | Investigation initiated | Document with trigger, problem statement, severity | core |
| 2 | Method selection justified | 5-Why + fishbone chosen with rationale | core |
| 3 | 5-Why analysis complete | At least 4 levels deep with evidence per level | core |
| 4 | Fishbone analysis complete | All 6 categories examined with confirmed/denied causes | core |
| 5 | Root cause identified | Clear statement of fundamental cause(s), not symptoms | core |
| 6 | CAPA plan produced | Correction, corrective action, and preventive action distinguished | core |
| 7 | Success criteria measurable | Each CAPA has specific, quantifiable success metrics | core |
| 8 | Problem statement blame-free | Factual description without attribution | core |
| 9 | Framework limitation assessed | Scope change: single-agent simulation evaluated as factor | bonus |
| 10 | Trend analysis performed | Finding placed in context of all 30 test scenarios | bonus |

## Scoring Rubric

| Dimension | 1 (Poor) | 3 (Adequate) | 5 (Excellent) |
|-----------|----------|---------------|----------------|
| Procedure Fidelity | Skips steps or mixes investigation with conclusions | All 6 steps present but some thin | Each step fully executed with all required artifacts |
| Analytical Depth | Stops at "adaptive is harder than structured" | Reaches plausible root causes with some evidence | Deep analysis with multiple converging root causes, each evidence-backed |
| Evidence Quality | Speculation without data references | References test results but imprecisely | Specific citations (scores, dates, scenario names) for every claim |
| CAPA Actionability | Generic actions ("improve testing") | Specific actions but vague success criteria | Concrete actions with measurable criteria and verification timelines |
| Scope Change Handling | Ignores framework limitation question | Acknowledges but does not integrate into analysis | Fully integrates as potential confounding variable with assessment |

Total: /25 points.

## Ground Truth

Known facts about the test framework finding for verifying analysis accuracy.

| Fact | Expected Value | Source |
|------|---------------|--------|
| Opaque-team rubric score | 22/30 (73%) | Cross-scenario analysis |
| Tending (sequential) score | 30/30 (100%) | Cross-scenario analysis |
| Dyad (reciprocal) score | 25/25 (100%) | Cross-scenario analysis |
| Opaque-team coordination | Adaptive pattern | `teams/opaque-team.md` |
| Tending coordination | Sequential pattern | `teams/tending.md` |
| Dyad coordination | Reciprocal pattern | `teams/dyad.md` |
| Total test scenarios | 30 (6 at the time of the 2026-03-09 analysis) | `tests/_registry.yml` |
| Framework limitation | Single agent simulates all roles | Cross-scenario analysis |
| Key finding from analysis | Structured patterns outperform adaptive | Cross-scenario analysis |
| Test date | 2026-03-09 | Test results directory naming |

### Plausible Root Causes

Factors a thorough investigation should surface: adaptive pattern requires
runtime role discovery (overhead); single-agent simulation cannot truly test
multi-agent coordination; structured patterns benefit from predefined role
clarity; N-shapeshifter design adds coordination complexity; rubric may not
weight adaptive strengths (flexibility, novelty).

## Observation Protocol

### Timeline

Record: T0 (initiate), T1 (method selected), T2 (5-Why done), T3 (fishbone
done), T4 (scope change injected), T5 (CAPA plan), T6 (verify/trends done).

### Recording Template

```markdown
## Run: YYYY-MM-DD-capa-root-cause-NNN
**Observer**: <name> | **Start**: HH:MM | **End**: HH:MM | **Duration**: Xm

### Phase Log
| Time | Phase | Observation |
|------|-------|-------------|
| HH:MM | Initiate / Method | Investigation + method selection |
| HH:MM | 5-Why + Fishbone | Root cause analysis |
| HH:MM | Scope change | Framework limitation assessed |
| HH:MM | CAPA / Verify / Trends | Actions, verification, context |

### Criteria Results (1-10) & Rubric Scores (5 dims, /25)
[Use Acceptance Criteria and Scoring Rubric tables above]

### Key Observations / Lessons Learned
- ...
```

## Variants

- **Variant A: 5-Why only** — Restrict to 5-Why analysis to test
  whether a single method reaches the same root causes.

- **Variant B: Different finding** — Apply to a different test result
  (e.g., alchemist agent test) to validate generalizability.

- **Variant C: With prior CAPAs** — Provide a fictional prior CAPA to
  test handling of previous investigations and recurring pattern checks.

- **Variant D: Critical severity** — Reclassify as critical to test
  whether the procedure adjusts timelines and containment actions.
