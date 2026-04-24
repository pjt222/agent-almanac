---
name: escalate-issues
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Triage maintenance problems by severity, document findings with context,
  route to appropriate specialist agent or human, and create actionable issue
  reports. Use when a maintenance task encounters problems beyond automated
  cleanup: code that is unsafe to delete, configuration changes requiring domain
  expertise, breaking changes detected during cleanup, complex refactoring needed,
  or security-sensitive findings such as hardcoded secrets or vulnerabilities.
license: MIT
allowed-tools: Read Write Edit Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: maintenance
  complexity: basic
  language: multi
  tags: maintenance, triage, escalation, routing, issue-reporting
---

# escalate-issues

## Use When

Maintenance task hits problems beyond automated cleanup:

- Uncertain if code safe to delete
- Config changes need domain expertise (security, perf, arch)
- Breaking changes detected during cleanup
- Complex refactor needed (not cleanup)
- Security-sensitive (secrets, vulns)

**Do NOT use** for simple clear fixes. Escalate only when risky/insufficient.

## In

| Param | Type | Req | Desc |
|-----------|------|----------|-------------|
| `issue_description` | string | Yes | Clear description |
| `severity` | enum | Yes | `critical`, `high`, `medium`, `low` |
| `context_files` | array | No | Paths to files |
| `specialist` | string | No | Target agent (auto-route if none) |
| `blocking` | boolean | No | Blocks cleanup (default: false) |

## Do

### Step 1: Severity

Classify via standard levels.

**CRITICAL** — Blocks prod:
- Broken imports in active code
- Security vulns (secrets, SQL injection)
- Data loss risk
- Prod outages

**HIGH** — Impacts maintainability/dev:
- Significant dead code (>1000 lines)
- Broken CI/CD
- Major config drift
- Unref modules maybe dynamically loaded

**MEDIUM** — Minor hygiene:
- Unused helpers (<100 lines)
- Stale docs
- Deprecated configs
- Lint warn non-critical

**LOW** — Style:
- Mixed indent
- Trailing whitespace
- Inconsistent naming
- Minor formatting

**Decision Tree**:
```
Does it break production? → CRITICAL
Does it block development? → HIGH
Does it impact code quality? → MEDIUM
Is it purely cosmetic? → LOW
```

→ Classified w/ clear label.

If err: uncertain → default HIGH, escalate human re-triage.

### Step 2: Document

Capture context for specialist.

**Report Template**:
```markdown
# Issue: [Brief Title]

**Severity**: CRITICAL | HIGH | MEDIUM | LOW
**Discovered During**: [Skill name, e.g., clean-codebase]
**Date**: YYYY-MM-DD
**Blocking**: Yes | No

## Description

Clear description of the problem in 2-3 sentences.

## Context

- **File(s)**: [List of affected files with line numbers]
- **Related**: [Related issues, commits, or previous attempts to fix]
- **Impact**: [What breaks if this isn't fixed, or what's wasted if not cleaned]

## Evidence

```language
# Code snippet or log excerpt showing the problem
```

## Attempted Fixes

- Tried X but failed because Y
- Considered Z but uncertain due to W

## Recommendation

- **Option 1**: [Safe conservative approach]
- **Option 2**: [More aggressive fix with risks]
- **Preferred**: [Which option to pursue and why]

## Specialist Routing

**Suggested Agent**: [agent-name]
**Reason**: [Why this specialist is appropriate]

## References

- [Link to related documentation]
- [Link to similar past issues]
```

→ Documented w/ full context → `ESCALATION_REPORTS/issue_YYYYMMDD_HHMM.md`.

If err: (N/A — always document, even incomplete)

### Step 3: Route

Match issue → specialist/human.

**Routing Table**:

| Issue Type | Specialist | Reason |
|------------|-----------|---------|
| Security vuln | security-analyst | Security expertise |
| GxP compliance | gxp-validator | Regulatory |
| Architecture | senior-software-developer | Design patterns |
| Config mgmt | devops-engineer | Infra |
| Dep conflicts | devops-engineer | Pkg mgmt |
| Perf bottleneck | senior-data-scientist | Optimization |
| Style dispute | code-reviewer | Style authority |
| Dead code uncertain | r-developer (lang-specific) | Lang knowledge |
| Broken test unclear | code-reviewer | Test design |
| Doc accuracy | senior-researcher | Domain |
| License compat | auditor | Legal/compliance |

**Auto Routing**:
```python
def route_issue(severity, issue_type):
    if severity == "CRITICAL":
        # Always escalate to human for critical issues
        return "human"

    if "security" in issue_type or "secret" in issue_type:
        return "security-analyst"

    if "gxp" in issue_type or "compliance" in issue_type:
        return "gxp-validator"

    if "architecture" in issue_type or "design" in issue_type:
        return "senior-software-developer"

    if "config" in issue_type or "deployment" in issue_type:
        return "devops-engineer"

    # Default: code-reviewer for general code issues
    return "code-reviewer"
```

→ Routed w/ justification.

If err: no clear specialist → human for manual route.

### Step 4: Actionable Report

Formatted for target audience.

**Specialist Agents** (structured for MCP):
```yaml
---
type: escalation
severity: high
from_agent: janitor
to_agent: security-analyst
blocking: false
---

# Security Concern: Hardcoded API Key in Config

**File**: config/production.yml:45
**Pattern**: API_KEY="sk_live_abc123..."

**Request**: Please review if this is a valid secret or a placeholder.
If valid, recommend secure credential management strategy.

**Context**: Discovered during config cleanup sweep.
```

**Human** (detailed md):
```markdown
# Escalation Report: Uncertain Dead Code Removal

**From**: Janitor Agent
**Date**: 2026-02-16
**Severity**: HIGH

## Problem

File `src/legacy_payments.js` (450 lines) appears unused but contains
complex payment processing logic. Static analysis shows zero references,
but name suggests business-critical functionality.

## Why Escalated

- Uncertain if payment code is dynamically loaded at runtime
- Potential data loss risk if deleted incorrectly
- Requires domain knowledge to assess business impact

## Evidence

- No direct imports found
- Last modified 8 months ago
- Git history shows it was part of payment refactor

## Recommendation

Request human review before deletion. If confirmed dead:
1. Archive to archive/legacy/ directory
2. Document in ARCHIVE_LOG.md
3. Create ticket to verify payment flows still work

## Next Steps

Awaiting human confirmation before proceeding with cleanup.
```

→ Formatted for audience.

If err: (N/A — generic md if uncertain)

### Step 5: Track

Log escalations → prevent duplicates.

```markdown
# Escalation Log

| ID | Date | Severity | Issue | Specialist | Status |
|----|------|----------|-------|-----------|--------|
| ESC-001 | 2026-02-16 | CRITICAL | Broken prod import | human | Resolved |
| ESC-002 | 2026-02-16 | HIGH | Dead payment code | human | Pending |
| ESC-003 | 2026-02-16 | MEDIUM | Config drift | devops-engineer | In Progress |
```

→ `ESCALATION_LOG.md` updated w/ new entry.

If err: log DNE → create.

### Step 6: Notify + Block (If Required)

Blocking → notify + pause cleanup.

**Blocking Logic**:
- CRITICAL always blocks
- HIGH blocks if critical path
- MEDIUM/LOW no block

**Notification**:
```markdown
⚠️ MAINTENANCE BLOCKED ⚠️

Issue ESC-002 (HIGH severity) requires human review before proceeding.

**Affected Operation**: clean-codebase (Step 5: Remove Dead Code)
**Reason**: Uncertain if src/legacy_payments.js is truly dead

**Action Required**: Review ESCALATION_REPORTS/ESC-002_2026-02-16.md

Once resolved, re-run maintenance from Step 5.
```

→ Maintenance paused, notification clear.

If err: notification unavailable → document in report.

## Check

After escalation:

- [ ] Severity correct
- [ ] Full context (files, evidence, attempts)
- [ ] Specialist identified
- [ ] Report in ESCALATION_REPORTS/
- [ ] LOG updated
- [ ] Blocking communicated if applicable
- [ ] No secrets exposed

## Traps

1. **Over-Escalate**: Simple issues waste specialist. Only when uncertain/risky.
2. **Under-Escalate**: Delete code "to see if tests pass" no escalate → prod outage.
3. **Insufficient Context**: No evidence → specialists re-investigate. Include paths, lines, errs.
4. **Vague**: "Something wrong w/ config" not actionable. Specific: "Config drift: dev v1, prod v2".
5. **No Track**: Re-escalating already-reviewed. Check LOG first.
6. **Expose Secrets**: Real keys/passwords in reports. Redact sensitive.

## →

- [clean-codebase](../clean-codebase/SKILL.md) — Often triggers escalations uncertain
- [tidy-project-structure](../tidy-project-structure/SKILL.md) — May discover complex org issues
- [repair-broken-references](../repair-broken-references/SKILL.md) — Escalate unclear fix/remove
- [compliance/security-scan](../../compliance/security-scan/SKILL.md) — Escalate security findings
- [general/issue-triage](../../general/issue-triage/SKILL.md) — General classification patterns
