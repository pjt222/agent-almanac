---
name: escalate-issues
locale: wenyan
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

# 升事

## 用時

維護之任遇自動清掃之外之問時用此：

- 不確碼可安全刪否
- 配置之改需領域之專（安全、性能、架構）
- 清掃中察破變
- 需複雜之重構（非僅清）
- 涉安全之事（硬碼秘、漏）

**勿用**於有明修之簡事。唯於自動清險或不足時方升之。

## 入

| 參 | 類 | 必 | 述 |
|-----------|------|----------|-------------|
| `issue_description` | string | 是 | 問題之明述 |
| `severity` | enum | 是 | `critical`、`high`、`medium`、`low` |
| `context_files` | array | 否 | 相關文件之路 |
| `specialist` | string | 否 | 目標員（若未指，自動繞） |
| `blocking` | boolean | 否 | 是否阻進一步清掃（默：false） |

## 法

### 第一步：評重

以標準重級類事。

**CRITICAL** — 阻產之運：
- 活用碼中破之引
- 安全漏（露秘、SQL 注）
- 清掃致數據失之險
- 產服停

**HIGH** — 影響維或開發者效：
- 死碼顯膨（逾千行）
- CI/CD 流破
- 諸環境間主配漂
- 或動態載之未引模組

**MEDIUM** — 小之潔病：
- 未用輔函（百行以下）
- 過時文檔需更
- 廢配件（不用而在）
- 非要徑之 lint 警

**LOW** — 風不一：
- 縮進雜（可行而不齊）
- 尾空白
- 命名不齊（camelCase 與 snake_case 雜）
- 小格式異

**重級之決樹**：
```
Does it break production? → CRITICAL
Does it block development? → HIGH
Does it impact code quality? → MEDIUM
Is it purely cosmetic? → LOW
```

**得：** 事附明重級標。

**敗則：** 若不確，默 HIGH 升於人以再判。

### 第二步：記所察

捕所有相關脈絡供員審。

**事報模板**：
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

**得：** 事以全脈絡記於 `ESCALATION_REPORTS/issue_YYYYMMDD_HHMM.md`。

**敗則：** （無——必記，雖未全）

### 第三步：定繞徑

配事類於適之員或人審。

**繞之表**：

| 事類 | 員 | 因 |
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

**自動繞之邏**：
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

**得：** 事繞至適員附理由。

**敗則：** 若無明員，升於人作手繞。

### 第四步：造可行之事報

生合受者（員或人）之式之報。

**於員**（MCP 工具之結構式）：
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

**於人審者**（詳 markdown）：
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

**得：** 報合受者式。

**敗則：** （無——不確時以通用 markdown 生報）

### 第五步：記升之狀

保升事之日誌以防重報。

```markdown
# Escalation Log

| ID | Date | Severity | Issue | Specialist | Status |
|----|------|----------|-------|-----------|--------|
| ESC-001 | 2026-02-16 | CRITICAL | Broken prod import | human | Resolved |
| ESC-002 | 2026-02-16 | HIGH | Dead payment code | human | Pending |
| ESC-003 | 2026-02-16 | MEDIUM | Config drift | devops-engineer | In Progress |
```

**得：** `ESCALATION_LOG.md` 增新條。

**敗則：** 若日誌不存，造之。

### 第六步：告並阻（若需）

若事阻後維，告並暫停清掃。

**阻之邏**：
- CRITICAL 事必阻
- HIGH 事於要徑中阻
- MEDIUM/LOW 事不阻

**告**：
```markdown
⚠️ MAINTENANCE BLOCKED ⚠️

Issue ESC-002 (HIGH severity) requires human review before proceeding.

**Affected Operation**: clean-codebase (Step 5: Remove Dead Code)
**Reason**: Uncertain if src/legacy_payments.js is truly dead

**Action Required**: Review ESCALATION_REPORTS/ESC-002_2026-02-16.md

Once resolved, re-run maintenance from Step 5.
```

**得：** 維暫停；明告生。

**敗則：** 若告機制不可用，記於報中。

## 驗

升後：

- [ ] 事重級正評
- [ ] 全脈絡已記（文件、證、試）
- [ ] 適員已識
- [ ] 升報造於 ESCALATION_REPORTS/
- [ ] ESCALATION_LOG.md 已更
- [ ] 阻狀若適已通
- [ ] 報無露敏信

## 陷

1. **過升**：升簡事耗員之時。唯真不確或險時乃升

2. **欠升**：刪碼「以試」而不升，致產停

3. **脈絡不足**：升無證，令員重查。附文路、行號、誤訊

4. **述模糊**：「配置有問」非可行。宜具體：「配漂：dev 用 API v1，prod 用 v2」

5. **不記狀**：重升已審事。先察 ESCALATION_LOG.md

6. **露秘**：於升報含真 API 鑰或密。遮敏值

## 參

- [clean-codebase](../clean-codebase/SKILL.md) — 常於不確時觸升
- [tidy-project-structure](../tidy-project-structure/SKILL.md) — 或察繁之組織問
- [repair-broken-references](../repair-broken-references/SKILL.md) — 引宜修或刪不明時升
- [compliance/security-scan](../../compliance/security-scan/SKILL.md) — 升安全之察
- [general/issue-triage](../../general/issue-triage/SKILL.md) — 通用事類之模
