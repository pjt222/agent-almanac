---
title: "Running a Code Review"
description: "Multi-agent code review using review teams for R packages and web projects"
category: workflow
agents: [r-developer, code-reviewer, senior-software-developer, security-analyst, web-developer]
teams: [r-package-review, fullstack-web-dev]
skills: [review-software-architecture, review-data-analysis, security-audit-codebase]
---

# Running a Code Review

Code review benefits from multiple perspectives. A single reviewer can check style or architecture, but catching the full range of issues -- from security vulnerabilities to API design flaws to accessibility gaps -- requires specialized viewpoints working in concert.

This guide shows how to use the [r-package-review](../teams/r-package-review.md) and [fullstack-web-dev](../teams/fullstack-web-dev.md) teams for structured, multi-agent code review. It covers when to use a full team, when a single agent suffices, and how to act on the findings.

## When to Use This Guide

- Reviewing an R package before CRAN submission and you want comprehensive coverage across code quality, architecture, and security
- Reviewing a pull request that touches multiple concerns (functionality, tests, dependencies, security) and would benefit from parallel specialist review
- Getting structured feedback on a web application covering implementation, design, accessibility, and security
- Auditing an inherited or unfamiliar codebase where you need a thorough assessment across dimensions
- Preparing for an external review or audit and want to catch issues first

## Prerequisites

- **Code to review**: Changes committed to a branch or the full package/project available on disk. The review operates on what is visible in the working tree and git history.
- **Claude Code running**: With access to the repository. Agents are launched as subagents from your Claude Code session.
- **Familiarity with the agent system**: Understanding what agents are and how teams coordinate them. See the [agents directory](../agents/) and [teams directory](../teams/) for background on available personas and compositions.

## Workflow Overview

The multi-agent review follows a consistent pattern regardless of which team you use:

```
Human triggers review
       |
       v
Team lead analyzes codebase, creates scoped tasks
       |
       v
Specialist reviewers work in parallel (or sequentially)
       |
       v
Lead synthesizes findings into unified report
       |
       v
Human receives prioritized report, acts on findings
```

The key difference from a single-agent review is that each reviewer focuses exclusively on their specialty. The lead handles coordination and conflict resolution, so you receive one coherent report rather than separate, potentially contradictory feedback streams.

## R Package Review

The [r-package-review](../teams/r-package-review.md) team uses hub-and-spoke coordination: the r-developer lead distributes tasks to three specialist reviewers who work in parallel, then the lead synthesizes all findings.

### Step 1: Initiate the Review

Tell Claude Code what you want reviewed and invoke the team:

```
Review my R package at /path/to/mypackage using the r-package-review team.
Focus on CRAN readiness.
```

Or for a specific PR:

```
Review PR #42 on this R package using the r-package-review team.
The PR adds a new S3 method and updates the vignette.
```

### Step 2: Lead Analyzes Structure

The r-developer lead examines the package layout and creates targeted review tasks:

- Identifies key files: `DESCRIPTION`, `NAMESPACE`, `R/`, `tests/`, `man/`, `vignettes/`
- Notes package-specific concerns (Rcpp integration, Shiny components, compiled code)
- Scopes each reviewer's task to the relevant parts of the codebase

### Step 3: Parallel Specialist Review

Three reviewers work simultaneously on their assigned areas:

**code-reviewer** (Quality):
- Code style against the tidyverse style guide
- Test coverage and testthat patterns
- Error message quality (`stop()`, `warning()`, `message()` usage)
- `.Rbuildignore` and development file hygiene

**senior-software-developer** (Architecture):
- Package API surface and `@export` decisions
- Dependency weight (`Imports` vs `Suggests` appropriateness)
- Internal code organization, coupling, and cohesion
- Unnecessary complexity or premature abstraction

**security-analyst** (Security):
- Exposed secrets in code, data, or configuration
- Dangerous patterns: `system()`, `eval()`, `source()` with user input
- File I/O path traversal risks
- Dependency vulnerabilities (known CVEs)

### Step 4: Lead Synthesizes Report

The r-developer lead:

- Collects all reviewer findings
- Adds R-specific convention checks (roxygen2 completeness, NAMESPACE correctness, CRAN notes)
- Resolves conflicting recommendations between reviewers
- Produces a unified report organized by severity

### Expected Output Structure

The final report follows a prioritized format:

```
## Review Summary
Package: mypackage (v0.2.0)
Files reviewed: 14 R files, 8 test files, 2 vignettes
Reviewers: code-reviewer, senior-software-developer, security-analyst

## Critical (must fix)
- [Security] API key hardcoded in R/api_client.R:23

## High (should fix)
- [Architecture] Circular dependency between module_a.R and module_b.R
- [Quality] No tests for exported function compute_score()

## Medium (recommended)
- [Quality] Inconsistent naming: snake_case in R/utils.R, camelCase in R/helpers.R
- [R Conventions] Missing @return tags on 3 exported functions

## Low (consider)
- [Architecture] data.table listed in Imports but only used in one internal function
- [Quality] Vignette code chunks not evaluated (eval=FALSE throughout)
```

## Web Project Review

The [fullstack-web-dev](../teams/fullstack-web-dev.md) team uses sequential coordination: each specialist reviews in order, with the lead integrating feedback between stages. This pipeline ensures each phase builds on the previous one.

### Step 1: Initiate the Review

```
Review my web application at /path/to/webapp using the fullstack-web-dev team.
It is a Next.js app with Tailwind CSS and an API layer.
```

### Step 2: Sequential Review Pipeline

Unlike the R package review's parallel approach, the web review flows through stages:

**web-developer** (Lead -- Initial Assessment):
- Reviews scaffolding, project structure, and build configuration
- Checks TypeScript types, API route implementations, component organization
- Creates scoped tasks for subsequent reviewers

**senior-web-designer** (Design Review):
- Evaluates layout quality, grid systems, and responsive breakpoints
- Checks typography scale, colour contrast ratios, and spacing rhythm
- Reviews brand consistency and visual hierarchy
- Assesses component styling patterns and Tailwind usage

**senior-ux-ui-specialist** (UX Audit):
- Audits usability against Nielsen heuristics
- Checks WCAG 2.1 AA accessibility compliance
- Tests keyboard navigation paths and focus management
- Reviews screen reader compatibility (ARIA labels, semantic HTML)
- Evaluates user flows and error states

**security-analyst** (Security Hardening):
- Audits for OWASP Top 10 vulnerabilities (XSS, CSRF, injection)
- Reviews CSP headers and security middleware
- Checks authentication and authorization flows
- Scans for exposed secrets and environment variable handling
- Audits dependency tree for known CVEs

### Step 3: Lead Integrates and Reports

The web-developer lead collects findings from all stages and produces a unified report, noting which issues were identified at which stage and any cross-cutting concerns.

## Single-Agent Review

When a full team is overkill -- for a small PR, a focused style check, or a quick security scan -- use a single agent directly.

### Focused PR Review with code-reviewer

```
Use the code-reviewer agent to review PR #15.
Focus on test coverage and error handling.
```

The [code-reviewer](../agents/code-reviewer.md) agent applies the [review-pull-request](../skills/review-pull-request/SKILL.md) skill to examine the changes, providing feedback on style, tests, and general quality without the overhead of team coordination.

### Architecture-Only Review

```
Use the senior-software-developer agent to evaluate the architecture
of the src/services/ directory. Focus on coupling and dependency management.
```

### Security-Only Audit

```
Use the security-analyst agent to audit this codebase for security issues.
Apply the security-audit-codebase skill.
```

This invokes the [security-audit-codebase](../skills/security-audit-codebase/SKILL.md) skill directly, producing a focused security report without involving other reviewers.

## Customizing the Review

### Scoping to Specific Files

Narrow the review to particular areas when the full codebase is too large or when you only care about recent changes:

```
Review only the R/ and tests/ directories. Skip vignettes and data/.
```

```
Review only files changed in the last 3 commits.
```

### Skipping a Review Dimension

If you already have confidence in one area, exclude that reviewer:

```
Run the r-package-review team but skip the security review.
I already ran a security audit last week.
```

### Adding Compliance

For regulated environments, add the gxp-validator or auditor agent to the review:

```
Run the r-package-review team and also include the gxp-validator
for 21 CFR Part 11 compliance checking.
```

### Using Activation Profiles

Activation profiles let you adjust agent behavior for specific contexts. For example, you can activate the security-analyst's "strict" profile for a pre-release audit or the code-reviewer's "mentoring" profile for a junior developer's PR. See the [epigenetics activation control guide](epigenetics-activation-control.md) for details on configuring profiles.

## Acting on Findings

### Working Through the Report

Process findings by severity: **Critical** items are blockers (security holes, data loss, build failures) -- fix immediately. **High** items should be resolved before merging (missing tests, architectural problems, CRAN failures). **Medium** items are worth fixing this cycle (style, docs, design). **Low** items can be tracked for later.

### Using Agents to Implement Fixes

The same agents that identified issues can help fix them:

```
The r-package-review team found 3 high-severity issues.
Use the r-developer agent to fix the missing roxygen2 @return tags.
Use the security-analyst agent to remove the hardcoded API key
and set up environment variable handling.
```

After implementing fixes, re-run the review to verify: "Re-run the r-package-review team, focusing on the 5 issues flagged previously."

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| Review takes too long | Package or project is very large, and all files are being reviewed | Scope the review to specific directories or recent changes. For packages with >50 R files, review in batches. |
| Conflicting findings between reviewers | Two reviewers recommend opposite approaches (e.g., code-reviewer wants more abstraction, architect says it is premature) | The lead should flag these conflicts in the report. As the human, you make the final call based on project context. |
| Reviewer missing context | Agent does not understand domain-specific conventions or project history | Provide context in your prompt: "This package follows Bioconductor conventions, not CRAN" or "We intentionally use eval() here because..." |
| Findings are too generic | Reviewer produces boilerplate advice instead of specific, actionable feedback | Re-run with a narrower scope and explicit focus: "Check specifically for path traversal in the file I/O functions in R/io.R" |
| Security reviewer flags false positives | Safe patterns flagged as dangerous (e.g., controlled `system()` calls) | Acknowledge in your prompt: "The system() calls in R/external.R are intentional and input-validated. Skip those." |
| Team coordination fails | Subagent creation or communication errors | Ensure agents are discoverable in the `.claude/agents/` directory. Check that the team definition in `teams/` matches the available agent names. |

## Related Resources

### Teams
- [r-package-review](../teams/r-package-review.md) -- Four-agent R package review team
- [fullstack-web-dev](../teams/fullstack-web-dev.md) -- Four-agent web development pipeline team

### Agents
- [r-developer](../agents/r-developer.md) -- R package lead with CRAN expertise
- [code-reviewer](../agents/code-reviewer.md) -- Code quality and style reviewer
- [senior-software-developer](../agents/senior-software-developer.md) -- Architecture and design reviewer
- [security-analyst](../agents/security-analyst.md) -- Security auditor
- [web-developer](../agents/web-developer.md) -- Web development lead

### Skills
- [review-software-architecture](../skills/review-software-architecture/SKILL.md) -- Architecture review procedure
- [review-data-analysis](../skills/review-data-analysis/SKILL.md) -- Data analysis review procedure
- [review-pull-request](../skills/review-pull-request/SKILL.md) -- PR review procedure
- [security-audit-codebase](../skills/security-audit-codebase/SKILL.md) -- Security audit procedure

### Guides
- [R Package Development](r-package-development.md) -- Package development standards
- [Epigenetics Activation Control](epigenetics-activation-control.md) -- Agent activation profiles
