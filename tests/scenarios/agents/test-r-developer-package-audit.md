---
name: test-r-developer-package-audit
description: >
  Validate the r-developer agent's R-centric persona, skill usage, and domain
  expertise by auditing the tests/results/ directory's Quarto + renv setup for
  R package best practices. The agent should assess DESCRIPTION-like metadata,
  renv lockfile validity, and Quarto render chain using R-specific skills.
test-level: agent
target: r-developer
category: D
duration-tier: medium
priority: P0
version: "1.0"
author: Philipp Thoss
created: 2026-03-10
tags: [r-developer, agent-test, r-packages, best-practices, audit]
---

# Test: R Developer Package Audit on tests/results/

The r-developer agent audits the `tests/results/` directory — which contains
a Quarto report, renv lockfile, and results data — for adherence to R package
best practices. This self-referential target tests whether the agent maintains
its R-centric persona, invokes R-specific skills, and produces actionable
recommendations grounded in CRAN conventions and tidyverse patterns.

## Objective

Validate three dimensions: (1) the r-developer uses R-specific skills
(manage-renv-dependencies, create-quarto-report) rather than generic file
review, (2) the agent maintains an R-centric perspective throughout —
referencing DESCRIPTION conventions, renv workflows, roxygen2 patterns, and
devtools commands, and (3) the agent produces domain-expert output that
distinguishes R best practices from general software engineering advice.

## Pre-conditions

- [ ] Repository is on `main` branch
- [ ] `tests/results/` directory exists with renv.lock, report.qmd, results.yml
- [ ] `agents/r-developer.md` is accessible
- [ ] `tests/results/renv/` directory exists with activate.R

## Task

### Primary Task

> **R Developer Agent Task: Audit tests/results/ for R Best Practices**
>
> Audit the `tests/results/` directory as if it were a standalone R project.
> Assess the following:
>
> 1. **Metadata completeness**: Does the project have DESCRIPTION-like
>    metadata? Are author, license, and dependencies declared?
>
> 2. **renv lockfile validity**: Is `renv.lock` well-formed? Are package
>    versions pinned? Are there any outdated or vulnerable dependencies?
>
> 3. **Quarto render chain**: Can `report.qmd` be expected to render
>    successfully? Are its YAML header fields complete? Does it follow
>    Quarto best practices?
>
> 4. **Project hygiene**: Does the directory follow R project conventions
>    (.Rprofile, .Rbuildignore, .gitignore patterns)?
>
> Produce a **Best Practices Report** with findings, severity ratings, and
> specific R-idiomatic recommendations.

### Scope Change Trigger

Inject after the initial audit is complete:

> **Addendum — CRAN Readiness Check**
>
> If this directory were restructured as a minimal R package for distributing
> the test results dashboard, what would be needed? Identify the gap between
> current state and a CRAN-submittable package.

## Expected Behaviors

### Agent-Specific Behaviors

1. **R skill invocation**: The agent should reference or follow R-specific
   skills (manage-renv-dependencies, create-quarto-report) rather than
   performing a generic file audit.

2. **R-centric vocabulary**: Uses R ecosystem terminology — DESCRIPTION,
   NAMESPACE, renv::snapshot(), devtools::check(), roxygen2, .Rprofile —
   not generic software terms.

3. **Package convention awareness**: Evaluates against CRAN submission
   standards, not just "does the file exist."

4. **Practical recommendations**: Suggests specific R commands and functions
   (e.g., `renv::status()`, `usethis::use_description()`) rather than
   abstract advice.

5. **Tidyverse alignment**: Recommendations follow tidyverse style guide
   conventions and use `::` package-qualified calls.

### Task-Specific Behaviors

1. **renv deep inspection**: Goes beyond "lockfile exists" to check version
   pinning, repository sources, and R version compatibility.

2. **Quarto YAML validation**: Checks report.qmd header fields against
   Quarto documentation standards (format, execute options, params).

3. **Missing file identification**: Notes absence of standard R project
   files (DESCRIPTION, .Rbuildignore, tests/) with severity ratings.

## Acceptance Criteria

Threshold: PASS if >= 7/9 criteria met.

| # | Criterion | Observable Signal | Weight |
|---|-----------|-------------------|--------|
| 1 | R-specific skills referenced | Agent mentions or follows manage-renv-dependencies, create-quarto-report, or similar R skills | core |
| 2 | R-centric persona maintained | Uses R ecosystem terminology throughout; no generic software review language | core |
| 3 | renv lockfile assessed | Evaluates renv.lock structure, version pinning, and dependency health | core |
| 4 | Quarto report assessed | Evaluates report.qmd YAML header and render expectations | core |
| 5 | Metadata gap identified | Notes absence of DESCRIPTION file or equivalent metadata | core |
| 6 | Severity ratings provided | Findings categorized by importance (critical/high/medium/low) | core |
| 7 | Specific R commands recommended | Suggests concrete R functions/commands, not abstract advice | core |
| 8 | Scope change absorbed | Produces CRAN readiness gap analysis when addendum is injected | bonus |
| 9 | Project hygiene evaluated | Checks for .Rprofile, .Rbuildignore, .gitignore R patterns | bonus |

## Scoring Rubric

| Dimension | 1 (Poor) | 3 (Adequate) | 5 (Excellent) |
|-----------|----------|---------------|----------------|
| Skill Fidelity | No R skills referenced; generic file review | References R skills but loosely | Explicitly follows R skill procedures with clear stage transitions |
| Persona Consistency | Generic developer voice; no R-specific character | R terminology present but mixed with generic advice | Pure R-centric voice; every recommendation is R-idiomatic |
| Technical Depth | Surface-level file existence checks | Checks file contents but misses R-specific nuances | Deep inspection of renv lockfile structure, Quarto YAML semantics, CRAN conventions |
| Domain Expertise | Could be any language's project audit | Demonstrates R knowledge but misses ecosystem patterns | Expert-level understanding of CRAN, renv, Quarto, and tidyverse conventions |
| Recommendation Quality | Vague ("add documentation") | Specific but not R-idiomatic | R-idiomatic commands with package-qualified calls and rationale |

Total: /25 points.

## Ground Truth

| Component | Known State | Source |
|-----------|------------|--------|
| `tests/results/renv.lock` | Exists, pins R package versions for Quarto rendering | File inspection |
| `tests/results/report.qmd` | Quarto document aggregating test results into HTML dashboard | File inspection |
| `tests/results/results.yml` | YAML data file with test execution results | File inspection |
| `tests/results/renv/` | renv library directory with activate.R | Directory listing |
| DESCRIPTION file | Does not exist — gap to identify | Directory listing |
| .Rbuildignore | Does not exist — gap to identify | Directory listing |

## Observation Protocol

### Timeline

Record timestamps for:
- T0: Audit task delivered to r-developer agent
- T1: Agent begins file inspection
- T2: renv lockfile analysis complete
- T3: Quarto report assessment complete
- T4: Scope change injected (CRAN readiness)
- T5: Final report delivered

### Recording Template

```markdown
## Run: YYYY-MM-DD-r-developer-NNN

**Observer**: <name>
**Start**: HH:MM
**End**: HH:MM
**Duration**: Xm

### Phase Log
| Time | Phase | Observation |
|------|-------|-------------|
| HH:MM | File inventory | Agent scans tests/results/ contents |
| HH:MM | renv analysis | Lockfile inspection |
| HH:MM | Quarto analysis | report.qmd assessment |
| HH:MM | Scope change | CRAN readiness gap analysis |
| HH:MM | Delivery | Best practices report complete |

### Acceptance Criteria Results
| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | R-specific skills referenced | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 2 | R-centric persona maintained | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 3 | renv lockfile assessed | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 4 | Quarto report assessed | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 5 | Metadata gap identified | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 6 | Severity ratings provided | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 7 | Specific R commands recommended | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 8 | Scope change absorbed | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 9 | Project hygiene evaluated | PASS/PARTIAL/FAIL/BLOCKED | ... |

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

- **Variant A: MCP server audit** — Audit an R MCP server package instead
  of tests/results/. Tests the agent on a more complex R package target.

- **Variant B: Non-R developer comparison** — Run the same audit with the
  devops-engineer agent. Compare whether the r-developer's R-specific lens
  adds value over a generic infrastructure review.

- **Variant C: Build mode** — Instead of auditing, ask the r-developer to
  restructure tests/results/ into a proper R package. Tests execution
  skills rather than assessment skills.
