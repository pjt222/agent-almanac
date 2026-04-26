---
name: review-codebase
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Multi-phase deep codebase review w/ severity ratings + structured output.
  Architecture, security, code quality, UX/a11y in single coordinated pass.
  Produces prioritized findings table → direct conversion to GH issues via
  create-github-issues.
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

Multi-phase deep codebase review producing severity-rated findings w/ fix-order rec. Unlike `review-pull-request` (scoped to diff) or single-domain reviews (`security-audit-codebase`, `review-software-architecture`), covers entire project/subproject across all quality dims in one pass.

## Use When

- Whole-project or subproject review (not PR-scoped)
- New codebase onboarding — building mental model of what exists + needs attention
- Periodic health checks after sustained dev
- Pre-release quality gate across architecture, security, code quality, UX
- Output should feed directly into issue creation or sprint planning

## In

- **Required**: `target_path` — root dir of codebase/subproject
- **Optional**:
  - `scope` — phases to run: `full` (default), `security`, `architecture`, `quality`, `ux`
  - `output_format` — `findings` (table only), `report` (narrative), `both` (default)
  - `severity_threshold` — min severity: `LOW` (default), `MEDIUM`, `HIGH`, `CRITICAL`

## Do

### Step 1: Census

Inventory codebase → est scope + ID review targets.

1. Count files by lang/type: `find target_path -type f | sort by extension`
2. Measure total line counts per lang
3. ID test dirs + estimate coverage (files w/ tests vs without)
4. Check dep state: lockfiles present, outdated deps, known vulns
5. Note build system, CI/CD config, docs state
6. Record census as opening section of report

→ Factual inventory — file counts, langs, test presence, dep health. No judgments yet.

If err: target empty/inaccessible → stop + report. Specific subdirs inaccessible → note + continue w/ available.

### Step 2: Architecture Review

Assess structural health: coupling, duplication, data flow, separation of concerns.

1. Map module/dir structure + ID primary architectural pattern
2. Check code duplication — repeated logic across files, copy-paste
3. Assess coupling — how many files must change for single feature mod
4. Eval data flow — clear boundaries between layers (UI, logic, data)?
5. ID dead code, unused exports, orphaned files
6. Check consistent patterns — codebase follows own conventions?
7. Rate each: CRITICAL, HIGH, MEDIUM, LOW

→ List of architectural findings w/ severity + file refs. Common: mode dispatch duplication, missing abstraction layers, circular deps.

If err: codebase too small for meaningful review (<5 files) → note + skip Step 3. Architecture review needs enough code to have structure.

### Step 3: Security Audit

ID security vulns + defensive coding gaps.

1. Scan injection vectors: HTML (`innerHTML`), SQL, command injection
2. Check authn + authz patterns (if applicable)
3. Review error handling — silently swallowed? Leak internals?
4. Audit dep versions vs known CVEs
5. Check hardcoded secrets, API keys, creds
6. Review Docker/container security: root user, exposed ports, build secrets
7. Check localStorage/sessionStorage for sensitive data
8. Rate each: CRITICAL, HIGH, MEDIUM, LOW

→ List of security findings w/ severity, affected files, remediation. CRITICAL = injection vulns + exposed secrets.

If err: no security-relevant code (pure docs project) → note + skip Step 4.

### Step 4: Code Quality

Eval maintainability, readability, defensive coding.

1. ID magic numbers + hardcoded values should be named consts
2. Check consistent naming across codebase
3. Find missing input validation at system boundaries
4. Assess error handling — consistent? Useful messages?
5. Check commented-out code, TODO/FIXME, incomplete impls
6. Review test quality — testing behavior or impl details?
7. Rate each: CRITICAL, HIGH, MEDIUM, LOW

→ List of quality findings → maintainability. Common: magic numbers, inconsistent patterns, missing guards.

If err: codebase generated/minified → note + adjust expectations. Generated code has diff quality criteria than hand-written.

### Step 5: UX + a11y (if frontend exists)

Eval UX + a11y compliance.

1. Check ARIA roles, labels, landmarks on interactive
2. Verify keyboard nav — all interactive reachable via Tab?
3. Test focus mgmt — focus moves logically when panels open/close?
4. Check responsive — test at common breakpoints (320px, 768px, 1024px)
5. Verify color contrast meets WCAG 2.1 AA
6. Check screen reader compat — dynamic content changes announced?
7. Rate each: CRITICAL, HIGH, MEDIUM, LOW

→ List of UX/a11y findings w/ WCAG refs. No frontend → "N/A — no frontend code detected."

If err: frontend exists but can't render (missing build step) → audit source code statically + note runtime testing not possible.

### Step 6: Findings Synthesis

Compile all findings → prioritized summary.

1. Merge findings from all phases → single table
2. Sort by severity (CRITICAL first, then HIGH, MEDIUM, LOW)
3. Within each severity, group by theme (security, architecture, quality, UX)
4. Each finding: severity, phase, file(s), one-line description, suggested fix
5. Produce rec fix order considering deps between fixes
6. Summarize: total findings by severity, top 3 priorities, est effort level

→ Findings table w/ columns: `#`, `Severity`, `Phase`, `File(s)`, `Finding`, `Fix`. Fix-order rec accounting for deps (e.g. "refactor architecture before adding tests").

If err: no findings produced → finding itself — codebase exceptionally clean or review too shallow. Re-examine ≥1 phase deeper.

## Check

- [ ] All requested phases done (or explicitly skipped w/ justification)
- [ ] Every finding has severity rating (CRITICAL/HIGH/MEDIUM/LOW)
- [ ] Every finding refs ≥1 file or dir
- [ ] Findings table sorted by severity
- [ ] Fix-order recs account for deps between findings
- [ ] Summary has total counts by severity
- [ ] If `output_format` includes `report`, narrative sections accompany table

## Scaling w/ Rest

Between review phases, use `/rest` as checkpoint — esp between phases 2-5 needing diff analytical perspectives. Checkpoint rest (brief, transitional) prevents momentum of one phase biasing next. See `rest` "Scaling Rest" for guidance on checkpoint vs full rest.

## Traps

- **Boiling ocean**: Reviewing every line of large codebase produces noise. Focus high-impact: entry points, security boundaries, architectural seams.
- **Severity inflation**: Not every finding CRITICAL. Reserve CRITICAL for exploitable vulns + data-loss risks. Most architectural = MEDIUM.
- **Missing forest for trees**: Individual code quality matters less than systemic patterns. Magic numbers in 20 files = 1 architectural finding not 20 quality.
- **Skip census**: Census (Step 1) seems bureaucratic but prevents reviewing code that doesn't exist or missing entire dirs.
- **Phase bleed**: Security findings during architecture, or quality during security audit. Note for correct phase, no mix concerns — produces cleaner table.

## →

- `security-audit-codebase` — deep-dive when review-codebase security phase reveals complex vulns
- `review-software-architecture` — detailed architecture review for specific subsystems
- `review-ux-ui` — comprehensive UX/a11y audit beyond phase 5
- `review-pull-request` — diff-scoped review for individual changes
- `clean-codebase` — impl code quality fixes ID'd by this review
- `create-github-issues` — convert findings → tracked GH issues
