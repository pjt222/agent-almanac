---
name: review-codebase
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Multi-phase deep codebase review with severity ratings and structured
  output. Covers architecture, security, code quality, UX/accessibility
  in single coordinated pass. Produces prioritized findings table
  suitable for direct conversion to GitHub issues via create-github-
  issues skill.
license: MIT
allowed-tools: Read Grep Glob Bash WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: review
  complexity: advanced
  language: multi
  tags: review, code-quality, architecture, security, accessibility, codebase
---

# Review Codebase

Multi-phase deep codebase review producing severity-rated findings with fix-order recommendations. Unlike `review-pull-request` (scoped to a diff) or single-domain reviews (`security-audit-codebase`, `review-software-architecture`), this skill covers entire project or subproject across all quality dimensions in one pass.

## When Use

- Whole-project or subproject review (not PR-scoped)
- New codebase onboarding — building mental model of what exists and what needs attention
- Periodic health checks after sustained development
- Pre-release quality gate across architecture, security, code quality, UX
- When output should feed direct into issue creation or sprint planning

## Inputs

- **Required**: `target_path` — root directory of codebase or subproject to review
- **Optional**:
  - `scope` — which phases to run: `full` (default), `security`, `architecture`, `quality`, `ux`
  - `output_format` — `findings` (table only), `report` (narrative), `both` (default)
  - `severity_threshold` — minimum severity to include: `LOW` (default), `MEDIUM`, `HIGH`, `CRITICAL`

## Steps

### Step 1: Census

Inventory codebase to establish scope and identify review targets.

1. Count files by language/type: `find target_path -type f | sort by extension`
2. Measure total line counts per language
3. ID test directories and estimate test coverage (files with tests vs files without)
4. Check dependency state: lockfiles present, outdated dependencies, known vulnerabilities
5. Note build system, CI/CD configuration, documentation state
6. Record census as opening section of report

**Got:** Factual inventory — file counts, languages, test presence, dependency health. No judgments yet.

**If fail:** Target path empty or inaccessible? Stop and report. Specific subdirectories inaccessible? Note them and continue with what is available.

### Step 2: Architecture Review

Assess structural health: coupling, duplication, data flow, separation of concerns.

1. Map module/directory structure. ID primary architectural pattern
2. Check for code duplication — repeated logic across files, copy-paste patterns
3. Assess coupling — how many files must change for single feature modification
4. Evaluate data flow — clear boundaries between layers (UI, logic, data)?
5. ID dead code, unused exports, orphaned files
6. Check for consistent patterns — does codebase follow its own conventions?
7. Rate each finding: CRITICAL, HIGH, MEDIUM, or LOW

**Got:** List of architectural findings with severity ratings and file references. Common findings: mode dispatch duplication, missing abstraction layers, circular dependencies.

**If fail:** Codebase too small for meaningful architecture review (< 5 files)? Note this and skip to Step 3. Architecture review needs enough code to have structure.

### Step 3: Security Audit

Identify security vulnerabilities and defensive coding gaps.

1. Scan for injection vectors: HTML injection (`innerHTML`), SQL injection, command injection
2. Check authentication and authorization patterns (if applicable)
3. Review error handling — errors silently swallowed? Error messages leak internals?
4. Audit dependency versions against known CVEs
5. Check for hardcoded secrets, API keys, credentials
6. Review Docker/container security: root user, exposed ports, build secrets
7. Check localStorage/sessionStorage for sensitive data storage
8. Rate each finding: CRITICAL, HIGH, MEDIUM, or LOW

**Got:** List of security findings with severity, affected files, remediation guidance. CRITICAL findings include injection vulnerabilities and exposed secrets.

**If fail:** No security-relevant code exists (pure documentation project)? Note this and skip to Step 4.

### Step 4: Code Quality

Evaluate maintainability, readability, defensive coding.

1. ID magic numbers and hardcoded values that should be named constants
2. Check for consistent naming conventions across codebase
3. Find missing input validation at system boundaries
4. Assess error handling patterns — consistent? Provide useful messages?
5. Check for commented-out code, TODO/FIXME markers, incomplete implementations
6. Review test quality — tests testing behavior or implementation details?
7. Rate each finding: CRITICAL, HIGH, MEDIUM, or LOW

**Got:** List of quality findings focused on maintainability. Common findings: magic numbers, inconsistent patterns, missing guards.

**If fail:** Codebase generated or minified? Note this and adjust expectations. Generated code has different quality criteria than hand-written code.

### Step 5: UX and Accessibility (if frontend exists)

Evaluate user experience and accessibility compliance.

1. Check ARIA roles, labels, landmarks on interactive elements
2. Verify keyboard navigation — can all interactive elements be reached via Tab?
3. Test focus management — does focus move logical when panels open/close?
4. Check responsive design — test at common breakpoints (320px, 768px, 1024px)
5. Verify color contrast ratios meet WCAG 2.1 AA standards
6. Check screen reader compatibility — dynamic content changes announced?
7. Rate each finding: CRITICAL, HIGH, MEDIUM, or LOW

**Got:** List of UX/a11y findings with WCAG references where applicable. No frontend exists? This step produces "N/A — no frontend code detected."

**If fail:** Frontend code exists but cannot be rendered (missing build step)? Audit source code statically and note that runtime testing was not possible.

### Step 6: Findings Synthesis

Compile all findings into prioritized summary.

1. Merge findings from all phases into single table
2. Sort by severity (CRITICAL first, then HIGH, MEDIUM, LOW)
3. Within each severity level, group by theme (security, architecture, quality, UX)
4. For each finding, include: severity, phase, file(s), one-line description, suggested fix
5. Produce recommended fix order that considers dependencies between fixes
6. Summarize: total findings by severity, top 3 priorities, estimated effort level

**Got:** Findings table with columns: `#`, `Severity`, `Phase`, `File(s)`, `Finding`, `Fix`. Fix-order recommendation that accounts for dependencies (e.g., "refactor architecture before adding tests").

**If fail:** No findings produced? This is itself a finding — either codebase exceptionally clean or review too shallow. Re-examine at least one phase with deeper inspection.

## Checks

- [ ] All requested phases completed (or explicit skipped with justification)
- [ ] Every finding has severity rating (CRITICAL/HIGH/MEDIUM/LOW)
- [ ] Every finding references at least one file or directory
- [ ] Findings table sorted by severity
- [ ] Fix-order recommendations account for dependencies between findings
- [ ] Summary includes total counts by severity
- [ ] If `output_format` includes `report`, narrative sections accompany table

## Scaling with Rest

Between review phases, use `/rest` as checkpoint — especially between phases 2-5, which need different analytical perspectives. Checkpoint rest (brief, transitional) prevents momentum of one phase from biasing next. See `rest` skill "Scaling Rest" section for guidance on checkpoint vs full rest.

## Pitfalls

- **Boil the ocean**: Review every line of large codebase produces noise. Focus on high-impact areas: entry points, security boundaries, architectural seams
- **Severity inflation**: Not every finding is CRITICAL. Reserve CRITICAL for exploitable vulnerabilities and data-loss risks. Most architectural issues are MEDIUM
- **Miss the forest for the trees**: Individual code quality issues matter less than systemic patterns. Magic numbers appear in 20 files? That is one architectural finding, not 20 quality findings
- **Skip the census**: Census (Step 1) seems bureaucratic but prevents reviewing code that does not exist or missing entire directories
- **Phase bleed**: Security findings during architecture review, or quality findings during security audit. Note them for correct phase rather than mix concerns — produces cleaner findings table

## See Also

- `security-audit-codebase` — deep-dive security audit when review-codebase security phase reveals complex vulnerabilities
- `review-software-architecture` — detailed architecture review for specific subsystems
- `review-ux-ui` — comprehensive UX/accessibility audit beyond what phase 5 covers
- `review-pull-request` — diff-scoped review for individual changes
- `clean-codebase` — implements code quality fixes identified by this review
- `create-github-issues` — converts findings table into tracked GitHub issues
