---
name: test-security-audit-codebase-self
description: >
  Validate the security-audit-codebase skill by running it on the agent-almanac
  repository itself. The self-referential audit tests whether the skill's 7-step
  procedure correctly identifies the project as clean (per the existing CLAUDE.md
  security audit) and produces properly structured findings with severity
  classifications. Ground truth is strong because the project has a documented
  audit baseline.
test-level: skill
target: security-audit-codebase
category: E
duration-tier: quick
priority: P1
version: "1.0"
author: Philipp Thoss
created: 2026-03-10
tags: [security-audit-codebase, skill-test, security, self-referential]
---

# Test: Security Audit Codebase (Self-Referential)

Run the `security-audit-codebase` skill on the agent-almanac repository — a
documentation-only project with a known-clean security posture. Tests whether
the skill correctly classifies a clean codebase, avoids false positives on
intentional placeholders, and produces a complete audit report.

## Objective

Validate that the security-audit-codebase skill's 7-step procedure (secrets
scan, gitignore check, dependency audit, injection scan, auth review,
configuration check, report generation) produces accurate findings when run
against a project with known security characteristics. The self-referential
nature provides strong ground truth: the CLAUDE.md documents a passing audit.

## Pre-conditions

- [ ] Repository is on `main` branch with clean working tree
- [ ] `skills/security-audit-codebase/SKILL.md` exists and is complete
- [ ] CLAUDE.md security audit section exists with "PASSED" status
- [ ] `.gitignore` is present and covers `.Renviron`, `.RData`, `.Rhistory`

## Task

### Primary Task

> **Skill Task: Security Audit**
>
> Run the `security-audit-codebase` skill on this repository
> (`/mnt/d/dev/p/agent-almanac`).
>
> - **Scope**: Full audit (all 7 steps)
> - **Compliance framework**: None (general security review)
> - **Previous findings**: CLAUDE.md documents a passing audit from 2024-12-13
>
> Follow the 7-step procedure exactly as written in the SKILL.md. Produce
> the final Security Audit Report with findings categorized by severity.

### Scope Change Trigger

Inject after Step 4 (Injection Vulnerabilities) completes:

> **Addendum — Git History Check**
>
> Extend the audit to check git history for any previously committed
> secrets that were later removed. Report whether the history is clean
> or contains any historical exposures.

## Expected Behaviors

### Procedure-Specific Behaviors

Since this is a skill-level test, expected behaviors map to procedure steps:

1. **Step 1 (Secrets Scan)**: Scans for API keys, tokens, passwords,
   connection strings, and private keys. Correctly identifies placeholders
   (`YOUR_TOKEN_HERE`, `your.email@example.com`) as non-findings.

2. **Step 2 (Gitignore Check)**: Verifies `.gitignore` coverage for
   sensitive files. Confirms no tracked sensitive files.

3. **Step 3 (Dependencies)**: Identifies `package.json` (js-yaml) and
   audits for vulnerabilities. Notes that this is a docs-only project
   with minimal dependencies.

4. **Step 4 (Injection)**: Correctly determines injection scanning is
   largely N/A for a markdown/YAML documentation project.

5. **Step 5 (Auth/AuthZ)**: Correctly marks as N/A — no authentication
   in a documentation repository.

6. **Step 6 (Configuration)**: Checks for debug mode, permissive CORS,
   and insecure URLs in any configuration files present.

7. **Step 7 (Report)**: Produces a structured audit report with
   severity classifications and an overall PASS/FAIL determination.

### Task-Specific Behaviors

1. **Placeholder recognition**: Must distinguish real secrets from
   intentional placeholders in guide documentation (e.g., `your_token_here`
   in `setting-up-your-environment.md`).

2. **Correct N/A handling**: Auth, injection, and some dependency checks
   should be marked N/A with rationale, not skipped silently.

3. **Clean codebase verdict**: Final report should conclude PASS,
   consistent with the existing CLAUDE.md audit.

## Acceptance Criteria

Threshold: PASS if >= 7/10 criteria met.

| # | Criterion | Observable Signal | Weight |
|---|-----------|-------------------|--------|
| 1 | Secrets scan executed | Grep patterns run for API keys, tokens, passwords | core |
| 2 | No false positives on placeholders | Placeholders in guides not flagged as real secrets | core |
| 3 | Gitignore verified | `.gitignore` checked for sensitive file coverage | core |
| 4 | Dependency audit performed | `package.json` dependencies checked | core |
| 5 | Injection scan completed or N/A'd | Injection checks run or rationale given for N/A | core |
| 6 | Auth marked N/A with rationale | Not silently skipped; explicit N/A determination | core |
| 7 | Report produced | Structured audit report with severity table | core |
| 8 | Overall verdict is PASS | Consistent with known-clean codebase | core |
| 9 | Git history check performed | Scope change: history scanned for removed secrets | bonus |
| 10 | Report matches SKILL.md template | Uses the exact report format from Step 7 | bonus |

## Scoring Rubric

| Dimension | 1 (Poor) | 3 (Adequate) | 5 (Excellent) |
|-----------|----------|---------------|----------------|
| Procedure Fidelity | Skips steps or combines them | All 7 steps executed but some thin | Each step fully executed with commands and findings |
| Accuracy | False positives on placeholders or missed real issues | Mostly correct with minor misclassifications | Zero false positives, correct N/A handling, accurate verdict |
| Report Quality | Unstructured notes | Report present but missing sections | Complete report following SKILL.md template exactly |
| Context Sensitivity | Treats docs project like a web app | Adjusts some checks for project type | Fully adapts each step to documentation-only context |
| Scope Change Handling | Ignores the addendum | Acknowledges but shallow check | Full git history scan with proper reporting |

Total: /25 points.

## Ground Truth

Known facts about the agent-almanac security posture.

| Fact | Expected Value | Source |
|------|---------------|--------|
| Overall security status | PASSED | CLAUDE.md Security Audit section |
| Exposed API keys | None | CLAUDE.md audit results |
| Placeholder patterns present | Yes (`YOUR_TOKEN_HERE`, `your.email@example.com`) | Guide files |
| `.Renviron` in .gitignore | Yes | `.gitignore` |
| Authentication present | No | Project is documentation-only |
| Injection surfaces | None | No executable application code |
| Dependencies | Minimal (js-yaml via package.json) | `package.json` |
| Public info (intentional) | GitHub username `pjt222`, author name | CLAUDE.md |

### What Should NOT Appear in Findings

- Placeholder tokens flagged as real secrets
- Guide examples flagged as vulnerabilities (e.g., `grep` patterns in skill docs)
- False critical/high findings on a documentation repository

## Observation Protocol

### Timeline

Record: T0 (invoked), T1-T4 (Steps 1-4 complete), T5 (scope change
injected), T6 (Steps 5-6 complete), T7 (report delivered).

### Recording Template

```markdown
## Run: YYYY-MM-DD-security-audit-NNN
**Observer**: <name> | **Start**: HH:MM | **End**: HH:MM | **Duration**: Xm

### Phase Log
| Time | Phase | Observation |
|------|-------|-------------|
| HH:MM | Steps 1-4 | Secrets, gitignore, deps, injection |
| HH:MM | Scope change | Git history check |
| HH:MM | Steps 5-7 | Auth/config review, report |

### Criteria Results (1-10) & Rubric Scores (5 dims, /25)
[Use Acceptance Criteria and Scoring Rubric tables above]

### Key Observations / Lessons Learned
- ...
```

## Variants

- **Variant A: Focused scope** — Run with focus area `secrets` only to
  test whether the skill correctly limits its scope to Step 1.

- **Variant B: With planted secret** — Create a temporary branch with a
  fake secret in a test file, run the audit, verify detection, then clean up.

- **Variant C: Agent execution** — Ask the security-analyst agent to run
  the skill instead of invoking directly. Tests agent-skill integration.
