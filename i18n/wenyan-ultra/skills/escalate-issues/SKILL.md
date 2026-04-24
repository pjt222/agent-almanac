---
name: escalate-issues
locale: wenyan-ultra
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

## 用

維護遇自動清外之議時用此技：

- 碼可安刪否不明
- 組態須域專（安、性、架）
- 清中察破變
- 須繁重構（非僅清）
- 安感發現（硬碼密、脆弱）

**勿用**於有明修之簡議。僅於自動清危或不足時升。

## 入

| 參 | 類 | 必 | 述 |
|-----------|------|----------|-------------|
| `issue_description` | string | Yes | Clear description of the problem |
| `severity` | enum | Yes | `critical`, `high`, `medium`, `low` |
| `context_files` | array | No | Paths to relevant files |
| `specialist` | string | No | Target agent (auto-route if not specified) |
| `blocking` | boolean | No | Whether issue blocks further cleanup (default: false) |

## 行

### 一：估重

以標重級分之。

**CRITICAL** — 阻生產功能：
- 用碼之引破
- 安脆弱（密露、SQL 注）
- 清作致失數
- 生產服斷

**HIGH** — 損維或發效：
- 大死碼（>1000 行）
- CI/CD 管破
- 環境間大組漂
- 或動態載之無引模

**MEDIUM** — 微衛議：
- 未用助函（<100 行）
- 舊文須更
- 棄組文（不用而存）
- 非要路之 lint 警

**LOW** — 式不一：
- 縮進混（可而不一）
- 末空
- 命不一（camelCase 對 snake_case）
- 微格差

**重決樹**：
```
Does it break production? → CRITICAL
Does it block development? → HIGH
Does it impact code quality? → MEDIUM
Is it purely cosmetic? → LOW
```

得：議以明重標已分。

敗：不確→默 HIGH 並升人重分。

### 二：錄發現

捕關境供專閱。

**議報模**：
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

得：議以全境錄於 `ESCALATION_REPORTS/issue_YYYYMMDD_HHMM.md`。

敗：（不適——永錄，縱不全）。

### 三：定路

匹議類於適專 agent 或人閱者。

**路表**：

| 議類 | 專 | 因 |
|------------|-----------|---------|
| Security vulnerability | security-analyst | Security expertise required |
| GxP compliance concern | gxp-validator | Regulatory knowledge needed |
| Architecture decision | senior-software-developer | Design pattern expertise |
| Config management | devops-engineer | Infrastructure knowledge |
| Dependency conflicts | devops-engineer | Package management expertise |
| Performance bottleneck | senior-data-scientist | Optimization knowledge |
| Code style dispute | code-reviewer | Style guide authority |
| Dead code uncertainty | r-developer (or lang-specific) | Language-specific knowledge |
| Broken test unclear | code-reviewer | Test design expertise |
| Documentation accuracy | senior-researcher | Domain knowledge required |
| License compatibility | auditor | Legal/compliance expertise |

**自動路邏**：
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

得：議路至適專並有理。

敗：無明專→升人手動路。

### 四：造可行報

生適標眾之格式報（agent 或人）。

**予專 agent**（MCP 工具之結構）：
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

**予人閱者**（詳 markdown）：
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

得：報以標眾適格生。

敗：（不適——不確則以通 markdown 生）。

### 五：追升態

守諸升之日以防重報。

```markdown
# Escalation Log

| ID | Date | Severity | Issue | Specialist | Status |
|----|------|----------|-------|-----------|--------|
| ESC-001 | 2026-02-16 | CRITICAL | Broken prod import | human | Resolved |
| ESC-002 | 2026-02-16 | HIGH | Dead payment code | human | Pending |
| ESC-003 | 2026-02-16 | MEDIUM | Config drift | devops-engineer | In Progress |
```

得：`ESCALATION_LOG.md` 以新條更。

敗：日不存→造之。

### 六：告而阻（若須）

若議阻維→告而停清。

**阻邏**：
- CRITICAL 永阻
- HIGH 於要路則阻
- MEDIUM/LOW 不阻

**告**：
```markdown
⚠️ MAINTENANCE BLOCKED ⚠️

Issue ESC-002 (HIGH severity) requires human review before proceeding.

**Affected Operation**: clean-codebase (Step 5: Remove Dead Code)
**Reason**: Uncertain if src/legacy_payments.js is truly dead

**Action Required**: Review ESCALATION_REPORTS/ESC-002_2026-02-16.md

Once resolved, re-run maintenance from Step 5.
```

得：維暫停；明告已生。

敗：告機無→於報中錄。

## 驗

升後：

- [ ] 議重已正估
- [ ] 全境已錄（文、證、嘗）
- [ ] 適專已識
- [ ] 升報已建於 ESCALATION_REPORTS/
- [ ] ESCALATION_LOG.md 已更
- [ ] 阻態若適已告
- [ ] 報中無敏信露

## 忌

1. **過升**：升簡議費專時。唯於真不確或危時升
2. **漏升**：刪碼「僅試過否」而未升→可致生產斷
3. **境不足**：無證而升→迫專重查。宜含文徑、行號、誤信
4. **述模糊**：「組有誤」不可行。須特：「組漂：dev 用 API v1，prod 用 v2」
5. **不追態**：重升已閱議。先察 ESCALATION_LOG.md
6. **露密**：升報中含真 API 鑰或密碼。敏值須蓋

## 參

- [clean-codebase](../clean-codebase/SKILL.md) — 不確時常觸升
- [tidy-project-structure](../tidy-project-structure/SKILL.md) — 或現繁組議
- [repair-broken-references](../repair-broken-references/SKILL.md) — 引可修或須刪不明時升
- [compliance/security-scan](../../compliance/security-scan/SKILL.md) — 安發現宜升
- [general/issue-triage](../../general/issue-triage/SKILL.md) — 通議分模
