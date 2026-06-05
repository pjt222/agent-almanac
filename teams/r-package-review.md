---
name: r-package-review
description: Multi-agent team for comprehensive R package quality review covering code quality, architecture, and security
lead: r-developer
version: "1.0.0"
author: Philipp Thoss
created: 2026-02-16
updated: 2026-02-16
tags: [R, code-review, quality, package-development]
coordination: hub-and-spoke
members:
  - id: r-developer
    role: Lead
    responsibilities: Distributes review tasks, checks R-specific conventions (roxygen2, NAMESPACE, testthat), synthesizes final review report
  - id: code-reviewer
    role: Quality Reviewer
    responsibilities: Reviews code style, test coverage, pull request quality, and general best practices
  - id: senior-software-developer
    role: Architecture Reviewer
    responsibilities: Evaluates package structure, API design, dependency management, SOLID principles, and technical debt
  - id: security-analyst
    role: Security Reviewer
    responsibilities: Audits for exposed secrets, input validation, safe file operations, and dependency vulnerabilities
---

# R Package Review Team

A four-agent team that performs comprehensive quality review of R packages. The lead (r-developer) orchestrates parallel reviews across code quality, architecture, and security, then synthesizes findings into a unified report.

## Purpose

R package development benefits from multiple review perspectives that a single agent cannot provide simultaneously. This team decomposes package review into four complementary specialties:

- **R conventions**: roxygen2 documentation, NAMESPACE exports, testthat patterns, CRAN compliance
- **Code quality**: style consistency, test coverage, error handling, pull request hygiene
- **Architecture**: package structure, API surface, dependency graph, SOLID adherence
- **Security**: secret exposure, input sanitization, safe eval patterns, dependency CVEs

By running these reviews in parallel and synthesizing results, the team delivers thorough feedback faster than sequential single-agent review.

## Team Composition

| Member | Agent | Role | Focus Areas |
|---|---|---|---|
| Lead | `r-developer` | Lead | R conventions, CRAN compliance, final synthesis |
| Quality | `code-reviewer` | Quality Reviewer | Style, tests, error handling, PR quality |
| Architecture | `senior-software-developer` | Architecture Reviewer | Structure, API design, dependencies, tech debt |
| Security | `security-analyst` | Security Reviewer | Secrets, input validation, CVEs, safe patterns |

## Coordination Pattern

Hub-and-spoke: the r-developer lead distributes review tasks, each reviewer works independently, and the lead collects and synthesizes all findings.

```
            r-developer (Lead)
           /       |        \
          /        |         \
   code-reviewer   |    security-analyst
                   |
     senior-software-developer
```

**Flow:**

1. Lead analyzes package structure and creates review tasks
2. Three reviewers work in parallel on their specialties
3. Lead collects all findings and produces a unified report
4. Lead flags conflicts or overlapping findings

## Task Decomposition

### Phase 1: Setup (Lead)
The r-developer lead examines the package and creates targeted tasks:

- Identify key files: `DESCRIPTION`, `NAMESPACE`, `R/`, `tests/`, `man/`, `vignettes/`
- Create review tasks scoped to each reviewer's specialty
- Note any package-specific concerns (e.g., Rcpp integration, Shiny components)

### Phase 2: Parallel Review

**code-reviewer** tasks:
- Review code style against tidyverse style guide
- Check test coverage and testthat patterns
- Evaluate error messages and `stop()`/`warning()` usage
- Review `.Rbuildignore` and development file hygiene

**senior-software-developer** tasks:
- Evaluate package API surface (`@export` decisions)
- Check dependency weight (`Imports` vs `Suggests`)
- Assess internal code organization and coupling
- Review for unnecessary complexity or premature abstraction

**security-analyst** tasks:
- Scan for exposed secrets in code and data
- Check `system()`, `eval()`, and `source()` usage
- Review file I/O for path traversal risks
- Check dependencies for known vulnerabilities

### Phase 3: Synthesis (Lead)
The r-developer lead:
- Collects all reviewer findings
- Checks R-specific conventions (roxygen2, NAMESPACE, CRAN notes)
- Resolves conflicting recommendations
- Produces a prioritized report: critical > high > medium > low

## Configuration

Machine-readable configuration block for tooling that auto-creates this team.

<!-- CONFIG:START -->
```yaml
team:
  name: r-package-review
  lead: r-developer
  coordination: hub-and-spoke
  members:
    - agent: r-developer
      role: Lead
      subagent_type: r-developer
    - agent: code-reviewer
      role: Quality Reviewer
      subagent_type: code-reviewer
    - agent: senior-software-developer
      role: Architecture Reviewer
      subagent_type: senior-software-developer
    - agent: security-analyst
      role: Security Reviewer
      subagent_type: security-analyst
  tasks:
    - name: review-code-quality
      assignee: code-reviewer
      description: Review code style, test coverage, error handling, and PR hygiene
    - name: review-architecture
      assignee: senior-software-developer
      description: Evaluate package structure, API design, dependencies, and tech debt
    - name: review-security
      assignee: security-analyst
      description: Audit for secrets, input validation, safe patterns, and dependency CVEs
    - name: review-r-conventions
      assignee: r-developer
      description: Check roxygen2 docs, NAMESPACE, testthat patterns, CRAN compliance
    - name: synthesize-report
      assignee: r-developer
      description: Collect all findings and produce unified prioritized report
      blocked_by: [review-code-quality, review-architecture, review-security, review-r-conventions]
```
<!-- CONFIG:END -->

## Usage Scenarios

### Scenario 1: Pre-CRAN Submission Review
Before submitting to CRAN, run the full team review to catch issues across all dimensions:

```
User: Review my R package at /path/to/mypackage before CRAN submission
```

The team will check CRAN-specific requirements (examples, \dontrun, URL validity) alongside general quality, architecture, and security concerns.

### Scenario 2: Pull Request Review
For significant PRs that touch multiple package components:

```
User: Review PR #42 on my R package — it adds a new API endpoint and Rcpp integration
```

The team distributes review across the changed areas, with the architecture reviewer focusing on the API design and the security analyst checking the Rcpp bindings.

### Scenario 3: Package Audit
For inherited or unfamiliar packages that need a thorough assessment:

```
User: Audit this R package I inherited — I need to understand its quality and risks
```

The team provides a comprehensive assessment covering code health, architectural decisions, and security posture.

## Limitations

- Best suited for R packages; not designed for general-purpose code review
- Requires all four agent types to be available as subagents
- The synthesized report reflects automated analysis; human judgment is still needed for domain-specific logic
- Does not run `R CMD check` or tests directly — focuses on static review
- Large packages (>100 R files) may benefit from scoped review rather than full-package review

## See Also

- [r-developer](../agents/r-developer.md) — Lead agent with R package expertise
- [code-reviewer](../agents/code-reviewer.md) — Quality review agent
- [senior-software-developer](../agents/senior-software-developer.md) — Architecture review agent
- [security-analyst](../agents/security-analyst.md) — Security audit agent
- [submit-to-cran](../skills/submit-to-cran/SKILL.md) — CRAN submission skill
- [review-software-architecture](../skills/review-software-architecture/SKILL.md) — Architecture review skill

---

**Author**: Philipp Thoss
**Version**: 1.0.0
**Last Updated**: 2026-02-16
