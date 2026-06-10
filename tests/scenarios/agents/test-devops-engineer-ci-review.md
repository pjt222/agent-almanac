---
name: test-devops-engineer-ci-review
description: >
  Validate the devops-engineer agent's CI/CD expertise by reviewing the
  project's 5 GitHub Actions workflows for best practices — pinned action
  versions, minimal permissions, caching strategy, matrix builds, and
  failure handling. Self-referential target: .github/workflows/ directory.
test-level: agent
target: devops-engineer
category: D
duration-tier: medium
priority: P1
version: "1.0"
author: Philipp Thoss
created: 2026-03-10
tags: [devops-engineer, agent-test, ci-cd, best-practices, review]
---

# Test: DevOps Engineer CI Workflow Review

The devops-engineer agent reviews this repository's 5 GitHub Actions
workflows for CI/CD best practices. The workflows are real, in production,
and cover pages deployment, README generation, skill validation, test
validation, and integrity checking. This self-referential target provides
verifiable ground truth — the agent's findings can be checked against the
actual workflow files.

## Objective

Validate three dimensions: (1) the devops-engineer uses infrastructure-
specific skills and vocabulary (not generic code review), (2) the agent
demonstrates deep GitHub Actions expertise — understanding permissions
models, action pinning, caching, and matrix strategies, and (3) the
agent produces actionable improvement recommendations with specific
YAML changes rather than abstract best-practice advice.

## Pre-conditions

- [ ] Repository is on `main` branch
- [ ] `.github/workflows/` contains 5 files: deploy-pages.yml, update-readmes.yml, validate-integrity.yml, validate-skills.yml, validate-tests.yml
- [ ] `agents/devops-engineer.md` is accessible

## Task

### Primary Task

> **DevOps Engineer Task: CI Workflow Best Practices Review**
>
> Review all 5 GitHub Actions workflows in `.github/workflows/` for
> CI/CD best practices. Assess each workflow on:
>
> 1. **Action version pinning**: Are actions pinned to SHA or version tag?
>    Are `@main` or `@master` references used?
>
> 2. **Permissions**: Are permissions explicitly declared and minimal?
>    Does the workflow use `permissions:` at job or workflow level?
>
> 3. **Caching**: Are dependencies cached? Could caching improve
>    performance?
>
> 4. **Matrix strategy**: Where applicable, is matrix testing used for
>    cross-platform or cross-version coverage?
>
> 5. **Failure handling**: Are `continue-on-error`, `timeout-minutes`,
>    and `if: failure()` patterns used appropriately?
>
> 6. **Secrets handling**: Are secrets accessed safely? Any risk of
>    secret exposure in logs?
>
> Produce a **CI Review Report** with per-workflow findings, overall
> score, and prioritized improvement recommendations with specific
> YAML snippets.

### Scope Change Trigger

Inject after the per-workflow review is complete:

> **Addendum — Consolidation Assessment**
>
> Could any of these 5 workflows be consolidated into fewer files using
> reusable workflows or composite actions? What would the tradeoffs be?

## Expected Behaviors

### Agent-Specific Behaviors

1. **Infrastructure vocabulary**: Uses CI/CD-specific terms — workflow
   dispatch, job matrix, runner labels, action pinning, OIDC, caching
   keys, concurrency groups.

2. **Deep Actions knowledge**: Understands GitHub Actions permission
   model, `GITHUB_TOKEN` scope, reusable workflows vs. composite
   actions, and environment protection rules.

3. **Specific YAML recommendations**: Provides concrete YAML changes,
   not abstract advice like "improve caching."

4. **Per-workflow analysis**: Reviews each workflow individually with
   specific findings, not a generic summary.

5. **Severity-ranked findings**: Distinguishes security issues (unpinned
   actions) from performance improvements (missing caching).

### Task-Specific Behaviors

1. **All 5 workflows covered**: No workflow is skipped or glossed over.

2. **SHA pinning check**: Specifically checks whether actions use SHA
   pinning vs. version tags vs. branch references.

3. **Permission audit**: Checks whether `permissions:` is declared and
   follows least-privilege principle.

4. **Documentation repo context**: Recognizes this is a docs repo — no
   need for build matrices, but validation workflows benefit from
   efficiency improvements.

## Acceptance Criteria

Threshold: PASS if >= 7/10 criteria met.

| # | Criterion | Observable Signal | Weight |
|---|-----------|-------------------|--------|
| 1 | All 5 workflows reviewed | Each workflow file is read and assessed individually | core |
| 2 | DevOps persona maintained | CI/CD-specific vocabulary used throughout | core |
| 3 | Action pinning assessed | Checks whether actions use SHA, version tag, or branch reference | core |
| 4 | Permissions evaluated | Reviews permissions declarations in each workflow | core |
| 5 | Specific YAML provided | Improvement recommendations include concrete YAML snippets | core |
| 6 | Severity ratings applied | Findings ranked by security vs. performance vs. style | core |
| 7 | Per-workflow structure | Report is organized per-workflow, not as a generic summary | core |
| 8 | Scope change absorbed | Consolidation assessment with tradeoff analysis | bonus |
| 9 | Caching opportunities identified | Notes where dependency caching could improve run times | bonus |
| 10 | Failure handling reviewed | Checks for timeout-minutes, continue-on-error usage | bonus |

## Scoring Rubric

| Dimension | 1 (Poor) | 3 (Adequate) | 5 (Excellent) |
|-----------|----------|---------------|----------------|
| Skill Fidelity | Generic code review; no CI/CD methodology | Some CI/CD structure but incomplete coverage | Systematic review covering all 6 assessment dimensions per workflow |
| Persona Consistency | Generic developer voice | DevOps terms present but inconsistent | Deep infrastructure engineer voice with precise CI/CD terminology |
| Technical Depth | Surface checks ("uses actions/checkout") | Checks action versions but misses permission nuances | Expert-level: SHA pinning, OIDC vs PAT, concurrency groups, reusable workflows |
| Domain Expertise | Could be reviewing any YAML file | Demonstrates Actions knowledge but misses patterns | Deep understanding of GitHub Actions permission model and security implications |
| Recommendation Quality | Vague ("pin your actions") | Specific but missing YAML examples | Concrete YAML diffs with rationale for each change |

Total: /25 points.

## Ground Truth

| Workflow | Purpose | Source |
|----------|---------|--------|
| deploy-pages.yml | Deploy visualization to GitHub Pages | File inspection |
| update-readmes.yml | Auto-generate READMEs from registries | File inspection |
| validate-integrity.yml | Cross-reference validation between registries and files | File inspection |
| validate-skills.yml | Validate SKILL.md frontmatter, sections, line counts | File inspection |
| validate-tests.yml | Validate test scenario format and registry sync | File inspection |

| Fact | Expected Value | Source |
|------|---------------|--------|
| Total workflows | 5 | .github/workflows/ listing |
| Workflow trigger types | push, pull_request, workflow_dispatch (varies) | File inspection |
| Actions used | actions/checkout, actions/setup-node, JamesIves/github-pages-deploy-action, others | File inspection |

## Observation Protocol

### Timeline

Record timestamps for:
- T0: CI review task delivered
- T1: Agent begins reading workflow files
- T2: Per-workflow analysis underway
- T3: Cross-workflow patterns identified
- T4: Scope change injected (consolidation)
- T5: Final CI review report delivered

### Recording Template

```markdown
## Run: YYYY-MM-DD-devops-engineer-NNN

**Observer**: <name>
**Start**: HH:MM
**End**: HH:MM
**Duration**: Xm

### Phase Log
| Time | Phase | Observation |
|------|-------|-------------|
| HH:MM | File discovery | Agent lists and reads workflow files |
| HH:MM | Per-workflow review | Individual workflow analysis |
| HH:MM | Cross-cutting findings | Common patterns across workflows |
| HH:MM | Scope change | Consolidation assessment |
| HH:MM | Delivery | CI review report complete |

### Acceptance Criteria Results
| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | All 5 workflows reviewed | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 2 | DevOps persona maintained | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 3 | Action pinning assessed | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 4 | Permissions evaluated | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 5 | Specific YAML provided | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 6 | Severity ratings applied | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 7 | Per-workflow structure | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 8 | Scope change absorbed | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 9 | Caching opportunities identified | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 10 | Failure handling reviewed | PASS/PARTIAL/FAIL/BLOCKED | ... |

### Rubric Scores
| Dimension | Score | Notes |
|-----------|-------|-------|
| Skill Fidelity | /5 | ... |
| Persona Consistency | /5 | ... |
| Technical Depth | /5 | ... |
| Domain Expertise | /5 | ... |
| Recommendation Quality | /5 | ... |
| **Total** | **/25** | |

### Key Observations
- ...

### Lessons Learned
- ...
```

## Variants

- **Variant A: Fix mode** — Ask the devops-engineer to implement its own
  recommendations by editing the workflow files. Tests execution skills.

- **Variant B: Security-analyst comparison** — Run the same CI review with
  the security-analyst. Compare: devops-engineer should focus on efficiency
  and architecture; security-analyst should focus on permissions and secrets.

- **Variant C: Greenfield design** — Instead of reviewing existing
  workflows, ask the agent to design the CI/CD from scratch for this repo.
  Compare the designed result against current implementation.
