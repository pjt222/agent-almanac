---
name: test-devops-platform-parallel-review
description: >
  Validate the parallel coordination pattern by tasking the devops-platform-engineering
  team with reviewing the agent-almanac project's CI/CD infrastructure and deployment
  setup. All four members work independently on non-overlapping subtasks, and the
  lead merges results into a unified platform assessment.
test-level: team
target: devops-platform-engineering
coordination-pattern: parallel
team-size: 4
category: C
duration-tier: medium
priority: P0
version: "1.0"
author: Philipp Thoss
created: 2026-03-10
tags: [devops-platform-engineering, parallel, ci-cd, infrastructure, review]
---

# Test: Platform Engineering CI/CD Review

Four platform engineers independently review the agent-almanac project's infrastructure
from their respective domains — CI/CD pipelines, ML readiness, supply chain security,
and developer experience architecture. The task validates the parallel coordination
pattern: independent concurrent work with no inter-member dependencies, followed
by lead-driven integration.

## Objective

Validate that the parallel coordination pattern produces genuinely independent
work streams with no duplicated effort, that members do not wait for or depend
on each other's output during execution, and that the lead successfully merges
four independent assessments into a coherent platform recommendation.

## Pre-conditions

- [ ] Repository is on `main` branch with clean working tree
- [ ] CI workflows exist: `.github/workflows/validate-skills.yml`, `validate-tests.yml`, `validate-integrity.yml`, `update-readmes.yml`
- [ ] `package.json` exists with npm scripts
- [ ] The `test-team-coordination` skill is available (symlinked to `.claude/skills/`)

## Task

### Primary Task

> **DevOps Platform Engineering Task: CI/CD Infrastructure Review**
>
> Review the agent-almanac project's infrastructure and CI/CD setup as a
> platform engineering exercise. Each team member should independently assess
> their domain:
>
> 1. **DevOps Engineer (Lead)**: Review the GitHub Actions workflows for
>    best practices — pinned action versions, minimal permissions, caching
>    strategy, job dependencies, and failure handling. Assess overall
>    CI/CD maturity.
>
> 2. **ML Platform Engineer**: Assess the project's readiness for ML
>    integration — could this repository support model-backed skill
>    validation? Evaluate the MCP server integration architecture as
>    an inference pipeline analogy. Propose a lightweight experiment
>    tracking approach for test result variance.
>
> 3. **Platform Security Engineer**: Audit the CI/CD supply chain —
>    action provenance, secret handling, permission scoping, dependency
>    pinning (npm, Python pip in CI). Check for over-permissive
>    `GITHUB_TOKEN` usage.
>
> 4. **Platform Architect**: Evaluate the developer experience — how easy
>    is it to add a new workflow, run validation locally, understand the
>    CI/CD structure? Assess the `scripts/` directory, `package.json`
>    scripts, and documentation coverage for the infrastructure layer.
>
> Produce a unified platform assessment with findings from all four
> domains, prioritized by severity.

### Scope Change Trigger

Inject after all four members have begun independent work:

> **Addendum**: A new validation workflow (`validate-integrity.yml`) was just
> added. Include it in your review. Additionally, assess whether the three
> validation workflows should be consolidated into a single workflow with
> matrix strategy, or kept separate. Provide a recommendation with trade-offs.

## Expected Behaviors

### Pattern-Specific Behaviors (Parallel)

1. **Independent concurrent work**: All 4 members begin working without waiting for others
2. **No inter-member dependencies**: No member's output serves as input for another during execution
3. **Lead merges results**: DevOps engineer collects all findings and produces unified assessment
4. **Work is partitioned, not duplicated**: Each member covers a distinct domain; no overlapping reviews

### Task-Specific Behaviors

1. **Domain specificity**: Each member stays in their lane — security doesn't review DX, architect doesn't audit secrets
2. **Self-referential accuracy**: Findings about the actual CI/CD setup should be factually correct (verifiable against `.github/workflows/`)
3. **Consolidation recommendation**: The scope change (consolidate workflows?) should produce a reasoned trade-off analysis, not a yes/no

## Acceptance Criteria

Threshold: PASS if >= 8/11 criteria met.

| # | Criterion | Observable Signal | Weight |
|---|-----------|-------------------|--------|
| 1 | Four distinct work streams | Each member produces a separate assessment section | core |
| 2 | No sequential dependencies | No member waits for or references another member's in-progress output | core |
| 3 | Lead integration | DevOps engineer synthesizes a unified report, not just concatenated sections | core |
| 4 | Work partitioned | No two members review the same aspect (e.g., both checking action versions) | core |
| 5 | Factually accurate CI/CD findings | At least 3 findings verifiable against actual workflow files | core |
| 6 | Security domain covered | At least 2 supply chain or permission findings from security engineer | core |
| 7 | DX domain covered | At least 2 developer experience findings from architect | core |
| 8 | Scope change absorbed | New workflow included in review without restarting work | core |
| 9 | Consolidation recommendation | Trade-off analysis for single-vs-multiple workflows with clear recommendation | bonus |
| 10 | Severity prioritization | Unified report ranks findings by severity (critical/high/medium/low) | bonus |
| 11 | Actionable recommendations | At least 3 specific, implementable improvement suggestions | bonus |

## Scoring Rubric

| Dimension | 1 (Poor) | 3 (Adequate) | 5 (Excellent) |
|-----------|----------|---------------|----------------|
| Parallelism fidelity | Members work sequentially or reference each other's output | Members work independently but some overlap exists | Clean parallel execution with zero inter-member dependencies |
| Domain specificity | Members stray into each other's domains | Mostly distinct with minor overlap | Each member stays strictly in their expertise area |
| Integration quality | Lead concatenates sections verbatim | Lead adds summary but limited synthesis | Lead synthesizes cross-cutting themes and resolves conflicts |
| Factual accuracy | Multiple incorrect claims about CI/CD setup | Mostly accurate with minor errors | All findings verifiable against actual files |
| Scope adaptation | Scope change ignored or causes restart | Scope change addressed but disrupts flow | Scope change absorbed smoothly into ongoing work |

Total: /25 points.

## Ground Truth

| Fact | Expected Value | Source |
|------|---------------|--------|
| Number of CI workflows | 5 (validate-skills, validate-tests, validate-integrity, update-readmes, deploy-pages) | `.github/workflows/` directory |
| Checkout action version | v6 | All workflow files |
| Skills validation uses external tool | skills-ref from agentskills/agentskills, pinned to commit SHA | validate-skills.yml |
| Integrity workflow trigger paths | agents/, teams/, guides/, .claude/ | validate-integrity.yml |
| npm scripts available | update-readmes, check-readmes, validate:integrity, test | package.json |
| Python used in CI | Yes, for skills-ref installation | validate-skills.yml |

## Observation Protocol

### Timeline

Record timestamps for:
- T0: Task assigned to team
- T1: All 4 members have begun independent work (confirm no sequencing)
- T2: Scope change injected
- T3: Scope change absorbed (visible in at least one member's output)
- T4: Lead begins integration
- T5: Unified report delivered

### Parallelism Log

| Member | Start Time | End Time | Domain Covered | Overlap with Others? |
|--------|-----------|----------|----------------|---------------------|
| devops-engineer | | | | |
| mlops-engineer | | | | |
| security-analyst | | | | |
| senior-software-developer | | | | |

### Recording Template

```markdown
## Run: YYYY-MM-DD-devops-platform-engineering-NNN

**Observer**: <name>
**Start**: HH:MM
**End**: HH:MM
**Duration**: Xm

### Phase Log
| Time | Phase | Observation |
|------|-------|-------------|
| HH:MM | ... | ... |

### Parallelism Assessment
| Member | Independent? | Domain Distinct? | Notes |
|--------|-------------|-----------------|-------|
| devops-engineer | Y/N | Y/N | ... |
| mlops-engineer | Y/N | Y/N | ... |
| security-analyst | Y/N | Y/N | ... |
| senior-software-developer | Y/N | Y/N | ... |

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

## Variants

- **Variant A**: Reduce to 3 members (drop mlops-engineer) to test parallel with smaller team
- **Variant B**: Inject a second scope change (e.g., "also review the deploy-pages workflow") to test multi-adaptation
- **Variant C**: Assign intentionally overlapping domains to test conflict resolution in the merge phase
