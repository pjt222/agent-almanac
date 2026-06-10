---
name: review-codebase
description: >
  Multi-phase deep codebase review with severity ratings and structured output.
  Covers architecture, security, code quality, and UX/accessibility in a single
  coordinated pass. Produces a prioritized findings table suitable for direct
  conversion to GitHub issues via the create-github-issues skill.
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

Multi-phase deep codebase review producing severity-rated findings with fix-order recommendations. Unlike `review-pull-request` (scoped to a diff) or single-domain reviews (`security-audit-codebase`, `review-software-architecture`), this skill covers an entire project or subproject across all quality dimensions in one pass.

## When to Use

- Whole-project or subproject review (not PR-scoped)
- New codebase onboarding — building a mental model of what exists and what needs attention
- Periodic health checks after sustained development
- Pre-release quality gate across architecture, security, code quality, and UX
- When the output should feed directly into issue creation or sprint planning

## Inputs

- **Required**: `target_path` — root directory of the codebase or subproject to review
- **Optional**:
  - `scope` — which phases to run: `full` (default), `security`, `architecture`, `quality`, `ux`
  - `output_format` — `findings` (table only), `report` (narrative), `both` (default)
  - `severity_threshold` — minimum severity to include: `LOW` (default), `MEDIUM`, `HIGH`, `CRITICAL`

## Procedure

### Step 1: Census

Inventory the codebase to establish scope and identify review targets.

1. Count files by language/type: `find target_path -type f | sort by extension`
2. Measure total line counts per language
3. Identify test directories and estimate test coverage (files with tests vs files without)
4. Check dependency state: lockfiles present, outdated dependencies, known vulnerabilities
5. Note build system, CI/CD configuration, and documentation state
6. Record the census as the opening section of the report

**Expected:** A factual inventory — file counts, languages, test presence, dependency health. No judgments yet.

**On failure:** If the target path is empty or inaccessible, stop and report. If specific subdirectories are inaccessible, note them and continue with what is available.

### Step 2: Architecture Review

Assess structural health: coupling, duplication, data flow, and separation of concerns.

1. Map the module/directory structure and identify the primary architectural pattern
2. Check for code duplication — repeated logic across files, copy-paste patterns
3. Assess coupling — how many files must change for a single feature modification
4. Evaluate data flow — are there clear boundaries between layers (UI, logic, data)?
5. Identify dead code, unused exports, and orphaned files
6. Check for consistent patterns — does the codebase follow its own conventions?
7. Rate each finding: CRITICAL, HIGH, MEDIUM, or LOW

**Expected:** A list of architectural findings with severity ratings and file references. Common findings: mode dispatch duplication, missing abstraction layers, circular dependencies.

**On failure:** If the codebase is too small for meaningful architecture review (< 5 files), note this and skip to Step 3. Architecture review requires enough code to have structure.

### Step 3: Security Audit

Identify security vulnerabilities and defensive coding gaps.

1. Scan for injection vectors: HTML injection (`innerHTML`), SQL injection, command injection
2. Check authentication and authorization patterns (if applicable)
3. Review error handling — are errors silently swallowed? Do error messages leak internals?
4. Audit dependency versions against known CVEs
5. Check for hardcoded secrets, API keys, or credentials
6. Review Docker/container security: root user, exposed ports, build secrets
7. Check localStorage/sessionStorage for sensitive data storage
8. Rate each finding: CRITICAL, HIGH, MEDIUM, or LOW

**Expected:** A list of security findings with severity, affected files, and remediation guidance. CRITICAL findings include injection vulnerabilities and exposed secrets.

**On failure:** If no security-relevant code exists (pure documentation project), note this and skip to Step 4.

### Step 4: Code Quality

Evaluate maintainability, readability, and defensive coding.

1. Identify magic numbers and hardcoded values that should be named constants
2. Check for consistent naming conventions across the codebase
3. Find missing input validation at system boundaries
4. Assess error handling patterns — are they consistent? Do they provide useful messages?
5. Check for commented-out code, TODO/FIXME markers, and incomplete implementations
6. Review test quality — are tests testing behavior or implementation details?
7. Rate each finding: CRITICAL, HIGH, MEDIUM, or LOW

**Expected:** A list of quality findings focused on maintainability. Common findings: magic numbers, inconsistent patterns, missing guards.

**On failure:** If the codebase is generated or minified, note this and adjust expectations. Generated code has different quality criteria than hand-written code.

### Step 5: UX and Accessibility (if frontend exists)

Evaluate user experience and accessibility compliance.

1. Check ARIA roles, labels, and landmarks on interactive elements
2. Verify keyboard navigation — can all interactive elements be reached via Tab?
3. Test focus management — does focus move logically when panels open/close?
4. Check responsive design — test at common breakpoints (320px, 768px, 1024px)
5. Verify color contrast ratios meet WCAG 2.1 AA standards
6. Check screen reader compatibility — are dynamic content changes announced?
7. Rate each finding: CRITICAL, HIGH, MEDIUM, or LOW

**Expected:** A list of UX/a11y findings with WCAG references where applicable. If no frontend exists, this step produces "N/A — no frontend code detected."

**On failure:** If frontend code exists but cannot be rendered (missing build step), audit the source code statically and note that runtime testing was not possible.

### Step 6: Findings Synthesis

Compile all findings into a prioritized summary.

1. Merge findings from all phases into a single table
2. Sort by severity (CRITICAL first, then HIGH, MEDIUM, LOW)
3. Within each severity level, group by theme (security, architecture, quality, UX)
4. For each finding, include: severity, phase, file(s), one-line description, suggested fix
5. Produce a recommended fix order that considers dependencies between fixes
6. Summarize: total findings by severity, top 3 priorities, estimated effort level

**Expected:** A findings table with columns: `#`, `Severity`, `Phase`, `File(s)`, `Finding`, `Fix`. A fix-order recommendation that accounts for dependencies (e.g., "refactor architecture before adding tests").

**On failure:** If no findings were produced, this is itself a finding — either the codebase is exceptionally clean or the review was too shallow. Re-examine at least one phase with deeper inspection.

## Validation

- [ ] All requested phases were completed (or explicitly skipped with justification)
- [ ] Every finding has a severity rating (CRITICAL/HIGH/MEDIUM/LOW)
- [ ] Every finding references at least one file or directory
- [ ] The findings table is sorted by severity
- [ ] Fix-order recommendations account for dependencies between findings
- [ ] The summary includes total counts by severity
- [ ] If `output_format` includes `report`, narrative sections accompany the table

## Scaling with Rest

Between review phases, use `/rest` as a checkpoint — especially between phases 2-5, which require different analytical perspectives. A checkpoint rest (brief, transitional) prevents the momentum of one phase from biasing the next. See the `rest` skill's "Scaling Rest" section for guidance on checkpoint vs full rest.

## Common Pitfalls

- **Boiling the ocean**: Reviewing every line of a large codebase produces noise. Focus on high-impact areas: entry points, security boundaries, and architectural seams
- **Severity inflation**: Not every finding is CRITICAL. Reserve CRITICAL for exploitable vulnerabilities and data-loss risks. Most architectural issues are MEDIUM
- **Missing the forest for the trees**: Individual code quality issues matter less than systemic patterns. If magic numbers appear in 20 files, that is one architectural finding, not 20 quality findings
- **Skipping the census**: The census (Step 1) seems bureaucratic but prevents reviewing code that does not exist or missing entire directories
- **Phase bleed**: Security findings during architecture review, or quality findings during security audit. Note them for the correct phase rather than mixing concerns — it produces a cleaner findings table

## Related Skills

- `security-audit-codebase` — deep-dive security audit when the review-codebase security phase reveals complex vulnerabilities
- `review-software-architecture` — detailed architecture review for specific subsystems
- `review-ux-ui` — comprehensive UX/accessibility audit beyond what phase 5 covers
- `review-pull-request` — diff-scoped review for individual changes
- `clean-codebase` — implements the code quality fixes identified by this review
- `create-github-issues` — converts findings table into tracked GitHub issues
