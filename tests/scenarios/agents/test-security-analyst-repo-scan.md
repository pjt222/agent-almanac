---
name: test-security-analyst-repo-scan
description: >
  Validate the security-analyst agent's ability to perform a clean security
  audit of the agent-almanac repository without generating false positives.
  The repository has already passed a manual security audit, so the ground
  truth is a clean bill of health. Tests defensive persona, systematic
  methodology, and false positive suppression.
test-level: agent
target: security-analyst
category: D
duration-tier: quick
priority: P0
version: "1.0"
author: Philipp Thoss
created: 2026-03-10
tags: [security-analyst, agent-test, security, audit, false-positives]
---

# Test: Security Analyst Repository Scan

The security-analyst agent performs a security audit of this repository. The
key challenge is that the codebase is documentation-only (markdown and YAML)
with no application code, no secrets, and no dependencies beyond npm for
README generation. A prior manual audit confirmed clean status (documented in
the parent CLAUDE.md). This tests whether the agent can confirm a clean
codebase without inflating findings or generating false positives.

## Objective

Validate three dimensions: (1) the security-analyst follows the
security-audit-codebase skill procedure systematically, (2) the agent
correctly identifies the repository as low-risk documentation without
manufacturing false findings, and (3) the agent examines CI workflow
permissions, script safety, and configuration patterns — the areas where
real risks could exist in a docs-only repo.

## Pre-conditions

- [ ] Repository is on `main` branch
- [ ] `agents/security-analyst.md` is accessible
- [ ] Parent CLAUDE.md security audit section exists at `/mnt/d/dev/p/CLAUDE.md`
- [ ] `.github/workflows/` directory contains 8 workflow files (as of 2026-07; re-derive from the directory)

## Task

### Primary Task

> **Security Analyst Task: Repository Security Scan**
>
> Perform a comprehensive security audit of the agent-almanac repository.
> Check for:
>
> 1. **Exposed secrets**: API keys, tokens, credentials, private keys in
>    any file (markdown, YAML, JSON, scripts)
>
> 2. **Dependency vulnerabilities**: npm packages, any lockfiles, known CVEs
>
> 3. **CI/CD permission issues**: Overly permissive GitHub Actions
>    permissions, unsafe script injection patterns, unpinned action versions
>
> 4. **Unsafe patterns in scripts**: Command injection, path traversal,
>    unsanitized input in `scripts/` directory
>
> 5. **Information disclosure**: Sensitive personal information, internal
>    paths, or infrastructure details that should not be public
>
> Produce a **Security Audit Report** with findings (or confirmation of
> clean status), risk ratings, and any recommendations.

### Scope Change Trigger

Inject after the initial scan completes:

> **Addendum — Threat Model Assessment**
>
> Given that this is an open-source documentation repository with no
> application runtime, what is the realistic threat model? Who are the
> threat actors, what are the attack vectors, and where is the actual
> risk surface?

## Expected Behaviors

### Agent-Specific Behaviors

1. **Skill invocation**: The agent should follow the security-audit-codebase
   skill procedure — systematic scanning, not ad-hoc file reading.

2. **Defensive persona**: Uses security-specific vocabulary (threat model,
   attack surface, risk rating, CVE, OWASP) consistently.

3. **False positive discipline**: Does not inflate findings. Placeholder
   examples (`your.email@example.com`, `YOUR_TOKEN_HERE`) should not be
   flagged as real secrets.

4. **Scope-appropriate analysis**: Recognizes this is a documentation repo
   and calibrates findings accordingly — CI permissions and script safety
   are relevant; SQL injection is not.

5. **Evidence-based findings**: Every finding (or clean confirmation)
   includes the specific files checked and patterns searched.

### Task-Specific Behaviors

1. **Pattern scanning**: Searches for `sk-`, `ghp_`, `AKIA`, private keys,
   `.env` files, and similar secret patterns.

2. **CI workflow inspection**: Reviews GitHub Actions for `permissions:`,
   `secrets.`, and script injection via `${{ }}` expressions.

3. **Script analysis**: Reads `scripts/generate-readmes.js` and any other
   scripts for unsafe patterns.

4. **Clean confirmation**: Explicitly states the codebase is clean when no
   real issues are found, rather than manufacturing low-severity findings.

## Acceptance Criteria

Threshold: PASS if >= 7/10 criteria met.

| # | Criterion | Observable Signal | Weight |
|---|-----------|-------------------|--------|
| 1 | Systematic scan performed | Agent searches for secret patterns across file types | core |
| 2 | Security persona maintained | Uses security-specific terminology throughout | core |
| 3 | No false positives on placeholders | Does not flag `YOUR_TOKEN_HERE` or example emails as real secrets | core |
| 4 | CI permissions reviewed | Inspects .github/workflows/ for permission issues | core |
| 5 | Scripts analyzed | Reviews scripts/ directory for unsafe patterns | core |
| 6 | Clean status confirmed | Explicitly confirms codebase is low-risk when no real issues found | core |
| 7 | Risk ratings used | Categorizes any findings by severity (critical/high/medium/low) | core |
| 8 | Scope change absorbed | Produces realistic threat model for a docs-only open-source repo | bonus |
| 9 | Dependency check performed | Examines package.json / package-lock.json for vulnerabilities | bonus |
| 10 | Evidence cited | References specific files and line patterns for each conclusion | bonus |

## Scoring Rubric

| Dimension | 1 (Poor) | 3 (Adequate) | 5 (Excellent) |
|-----------|----------|---------------|----------------|
| Skill Fidelity | Ad-hoc file reading; no systematic methodology | Some structure but incomplete scan categories | Full security-audit-codebase procedure with all scan categories |
| Persona Consistency | Generic reviewer voice; no security character | Security terms present but mixed with casual language | Consistent defensive security analyst voice throughout |
| False Positive Rate | Multiple false positives flagged as real issues | One or two borderline findings inflated | Zero false positives; clean confirmation when warranted |
| Scope Calibration | Applies web-app security checks to a docs repo | Mostly appropriate but includes irrelevant checks | Perfectly calibrated to documentation repo threat surface |
| Analytical Rigor | Superficial "looks clean" without evidence | Checks performed but evidence sparse | Every conclusion backed by specific files checked and patterns searched |

Total: /25 points.

## Ground Truth

| Fact | Expected Value | Source |
|------|---------------|--------|
| Exposed API keys/tokens | None | Manual audit in parent CLAUDE.md |
| Private credentials | None; uses placeholders | Manual audit in parent CLAUDE.md |
| Personal file paths | None hardcoded | Manual audit in parent CLAUDE.md |
| GitHub Actions count | 8 workflows | .github/workflows/ directory |
| npm dependencies | js-yaml (README generation) | package.json |
| Application runtime code | None — documentation only | Repository structure |
| .env files committed | None | git status / .gitignore |

## Observation Protocol

### Timeline

Record timestamps for:
- T0: Security audit task delivered
- T1: Secret pattern scanning begins
- T2: CI workflow review begins
- T3: Script analysis begins
- T4: Scope change injected (threat model)
- T5: Final audit report delivered

### Recording Template

```markdown
## Run: YYYY-MM-DD-security-analyst-NNN

**Observer**: <name>
**Start**: HH:MM
**End**: HH:MM
**Duration**: Xm

### Phase Log
| Time | Phase | Observation |
|------|-------|-------------|
| HH:MM | Secret scan | Agent searches for credential patterns |
| HH:MM | CI review | Workflow permission analysis |
| HH:MM | Script analysis | scripts/ directory inspection |
| HH:MM | Scope change | Threat model assessment |
| HH:MM | Delivery | Audit report complete |

### Acceptance Criteria Results
| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | Systematic scan performed | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 2 | Security persona maintained | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 3 | No false positives on placeholders | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 4 | CI permissions reviewed | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 5 | Scripts analyzed | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 6 | Clean status confirmed | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 7 | Risk ratings used | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 8 | Scope change absorbed | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 9 | Dependency check performed | PASS/PARTIAL/FAIL/BLOCKED | ... |
| 10 | Evidence cited | PASS/PARTIAL/FAIL/BLOCKED | ... |

### Rubric Scores
| Dimension | Score | Notes |
|-----------|-------|-------|
| Skill Fidelity | /5 | ... |
| Persona Consistency | /5 | ... |
| False Positive Rate | /5 | ... |
| Scope Calibration | /5 | ... |
| Analytical Rigor | /5 | ... |
| **Total** | **/25** | |

### Key Observations
- ...

### Lessons Learned
- ...
```

## Variants

- **Variant A: Planted secret** — Add a fake API key to a branch before
  running. Tests whether the agent catches a real positive in addition to
  avoiding false positives.

- **Variant B: Dirty repo** — Run against a project with known
  vulnerabilities (e.g., an npm project with outdated deps). Tests
  detection accuracy on a target with real findings.

- **Variant C: Agent comparison** — Run the same audit with the
  code-reviewer agent. Compare security depth and false positive rates.
