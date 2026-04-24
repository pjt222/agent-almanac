---
name: escalate-issues
locale: wenyan-lite
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

## 適用時機

此技適用於維護任務遇超出自動清理之問題時：

- 不確定代碼是否可安全刪
- 配置改需領域專長（安全、效能、架構）
- 清理中發現破壞性變更
- 需複雜重構（非僅清理）
- 安全敏感之發現（寫死之密秘、漏洞）

**勿用**於有明修之簡單問題。僅於自動清理有險或不足時升級。

## 輸入

| 參數 | 類型 | 必要 | 說明 |
|-----------|------|----------|-------------|
| `issue_description` | string | 是 | 問題之明述 |
| `severity` | enum | 是 | `critical`、`high`、`medium`、`low` |
| `context_files` | array | 否 | 相關文件之路徑 |
| `specialist` | string | 否 | 目標代理（若未指則自路由） |
| `blocking` | boolean | 否 | 問題是否阻後續清理（預設：false） |

## 步驟

### 步驟一：評嚴重度

以標準嚴重度分類問題。

**CRITICAL** — 阻生產功能：
- 活用代碼中破之 import
- 安全漏洞（暴露之密秘、SQL 注入）
- 清理致數據遺失之險
- 生產服務中斷

**HIGH** — 影響可維護性或開發生產力：
- 大量死代碼（>1000 行）
- 破之 CI/CD 管線
- 環境間大幅配置漂移
- 可能動態載入之未被引模組

**MEDIUM** — 衛生小疵：
- 未用之輔助函數（<100 行）
- 陳舊之文檔待更
- 棄用之配置文件（存而不用）
- 非關鍵路徑之 lint 警告

**LOW** — 風格不一：
- 縮排混（可行而不一）
- 行尾空白
- 命名不一（camelCase vs snake_case）
- 格式小異

**嚴重度決策樹**：
```
Does it break production? → CRITICAL
Does it block development? → HIGH
Does it impact code quality? → MEDIUM
Is it purely cosmetic? → LOW
```

**預期：** 問題以明嚴重度標分類

**失敗時：** 若不定，預設 HIGH 並升級予人再分類

### 步驟二：文檔發現

為專家審捕所有相關語境。

**問題報告模板**：
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

**預期：** 問題以全語境文檔於 `ESCALATION_REPORTS/issue_YYYYMMDD_HHMM.md`

**失敗時：** （無——恒文檔之，縱不全）

### 步驟三：定路由

配問題類型於合適之專家代理或人審。

**路由表**：

| 問題類型 | 專家 | 原因 |
|------------|-----------|---------|
| 安全漏洞 | security-analyst | 需安全專長 |
| GxP 合規之慮 | gxp-validator | 需監管知識 |
| 架構決定 | senior-software-developer | 設計模式專長 |
| 配置管理 | devops-engineer | 基礎設施知識 |
| 依賴衝突 | devops-engineer | 包管理專長 |
| 效能瓶頸 | senior-data-scientist | 優化知識 |
| 代碼風格爭 | code-reviewer | 風格指南之權 |
| 死代碼不定 | r-developer (or lang-specific) | 語言特定知識 |
| 測試破不明 | code-reviewer | 測試設計專長 |
| 文檔準確性 | senior-researcher | 需領域知識 |
| 授權相容 | auditor | 法律/合規專長 |

**自動路由邏輯**：
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

**預期：** 問題帶理由路至合適之專家

**失敗時：** 若無明專家，升級予人以手動路由

### 步驟四：建可行之問題報告

生合於目標對象（代理或人）之格式化報告。

**予專家代理**（MCP 工具之結構式格式）：
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

**予人審**（詳細 markdown）：
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

**預期：** 報告已合於目標對象之格

**失敗時：** （無——若不定以通用 markdown 生報告）

### 步驟五：追升級狀態

維所有升級之日誌以防重複報告。

```markdown
# Escalation Log

| ID | Date | Severity | Issue | Specialist | Status |
|----|------|----------|-------|-----------|--------|
| ESC-001 | 2026-02-16 | CRITICAL | Broken prod import | human | Resolved |
| ESC-002 | 2026-02-16 | HIGH | Dead payment code | human | Pending |
| ESC-003 | 2026-02-16 | MEDIUM | Config drift | devops-engineer | In Progress |
```

**預期：** `ESCALATION_LOG.md` 已以新條目更

**失敗時：** 若日誌不存，建之

### 步驟六：若需則通知並阻

若問題阻後續維護，則通知並暫停清理。

**阻斷邏輯**：
- CRITICAL 問題恒阻
- HIGH 問題若於關鍵路徑則阻
- MEDIUM/LOW 問題不阻

**通知**：
```markdown
⚠️ MAINTENANCE BLOCKED ⚠️

Issue ESC-002 (HIGH severity) requires human review before proceeding.

**Affected Operation**: clean-codebase (Step 5: Remove Dead Code)
**Reason**: Uncertain if src/legacy_payments.js is truly dead

**Action Required**: Review ESCALATION_REPORTS/ESC-002_2026-02-16.md

Once resolved, re-run maintenance from Step 5.
```

**預期：** 維護已暫停；明通知已生

**失敗時：** 若通知機制不可得，於報告中文檔之

## 驗證清單

升級後：

- [ ] 問題嚴重度已正評
- [ ] 全語境已文檔（文件、證據、所試）
- [ ] 合適之專家已識
- [ ] 升級報告已建於 ESCALATION_REPORTS/
- [ ] ESCALATION_LOG.md 已更
- [ ] 若用則阻斷狀態已傳
- [ ] 報告無敏感信息外露

## 常見陷阱

1. **過升級**：為簡單問題升級浪專家之時。僅於真不定或有險時升。

2. **欠升級**：刪代碼「以觀測試是否過」而不升級可致生產中斷。

3. **語境不足**：無證據升級迫專家再查。含文件路徑、行號、錯誤訊息。

4. **模糊之述**：「配置有問題」不可行。具體：「配置漂移：dev 用 API v1，prod 用 v2」。

5. **不追狀態**：再升已審之問題。先查 ESCALATION_LOG.md。

6. **密秘外露**：升級報告中含實 API key 或密碼。遮敏感值。

## 相關技能

- [clean-codebase](../clean-codebase/SKILL.md) — 常於不定時觸發升級
- [tidy-project-structure](../tidy-project-structure/SKILL.md) — 或發現複雜組織問題
- [repair-broken-references](../repair-broken-references/SKILL.md) — 於引用不明是否修或刪時升級
- [compliance/security-scan](../../compliance/security-scan/SKILL.md) — 升級安全發現
- [general/issue-triage](../../general/issue-triage/SKILL.md) — 通用問題分類模式
