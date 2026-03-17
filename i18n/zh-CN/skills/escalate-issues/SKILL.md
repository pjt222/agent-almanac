---
name: escalate-issues
description: >
  按严重程度对维护问题进行分类，带上下文记录发现，路由到适当的专家代理或人工，
  并创建可操作的问题报告。适用于维护任务遇到超出自动清理范围的问题时：不安全
  删除的代码、需要领域专业知识的配置变更、清理过程中检测到的破坏性变更、需要
  复杂重构，或安全敏感的发现（如硬编码密钥或漏洞）。
license: MIT
allowed-tools: Read Write Edit Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: maintenance
  complexity: basic
  language: multi
  tags: maintenance, triage, escalation, routing, issue-reporting
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# 升级问题

## 适用场景

当维护任务遇到超出自动清理范围的问题时使用此技能：

- 不确定代码是否可以安全删除
- 配置变更需要领域专业知识（安全、性能、架构）
- 清理过程中检测到破坏性变更
- 需要复杂重构（不仅仅是清理）
- 安全敏感的发现（硬编码密钥、漏洞）

**不要**用于有明确修复方案的简单问题。仅在自动清理有风险或不充分时才升级。

## 输入

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `issue_description` | string | 是 | 问题的清晰描述 |
| `severity` | enum | 是 | `critical`、`high`、`medium`、`low` |
| `context_files` | array | 否 | 相关文件路径 |
| `specialist` | string | 否 | 目标代理（未指定则自动路由） |
| `blocking` | boolean | 否 | 问题是否阻塞进一步清理（默认：false） |

## 步骤

### 第 1 步：评估严重程度

使用标准严重程度级别分类问题。

**关键（CRITICAL）** — 阻塞生产功能：
- 在活跃使用的代码中的损坏导入
- 安全漏洞（暴露的密钥、SQL 注入）
- 清理操作导致的数据丢失风险
- 生产服务中断

**高（HIGH）** — 影响可维护性或开发人员生产力：
- 大量死代码膨胀（>1000 行）
- 损坏的 CI/CD 流水线
- 环境之间的重大配置偏移
- 可能被动态加载的未引用模块

**中（MEDIUM）** — 轻微的卫生问题：
- 未使用的辅助函数（<100 行）
- 需要更新的过时文档
- 已弃用的配置文件（不再使用但仍存在）
- 非关键路径中的 lint 警告

**低（LOW）** — 风格不一致：
- 混合缩进（可用但不一致）
- 尾部空白
- 命名不一致（camelCase vs snake_case）
- 轻微的格式差异

**严重程度决策树**：
```
Does it break production? → CRITICAL
Does it block development? → HIGH
Does it impact code quality? → MEDIUM
Is it purely cosmetic? → LOW
```

**预期结果：** 问题已分类并带有明确的严重程度标签

**失败处理：** 如果不确定，默认为 HIGH 并升级给人工重新分类

### 第 2 步：记录发现

为专家审查捕获所有相关上下文。

**问题报告模板**：
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

**预期结果：** 问题已在 `ESCALATION_REPORTS/issue_YYYYMMDD_HHMM.md` 中完整记录上下文

**失败处理：**（不适用——始终记录，即使不完整）

### 第 3 步：确定路由

将问题类型匹配到适当的专家代理或人工审查者。

**路由表**：

| 问题类型 | 专家 | 原因 |
|----------|------|------|
| 安全漏洞 | security-analyst | 需要安全专业知识 |
| GxP 合规问题 | gxp-validator | 需要法规知识 |
| 架构决策 | senior-software-developer | 设计模式专业知识 |
| 配置管理 | devops-engineer | 基础设施知识 |
| 依赖冲突 | devops-engineer | 包管理专业知识 |
| 性能瓶颈 | senior-data-scientist | 优化知识 |
| 代码风格争议 | code-reviewer | 风格指南权威 |
| 死代码不确定性 | r-developer（或特定语言） | 语言特定知识 |
| 不明确的损坏测试 | code-reviewer | 测试设计专业知识 |
| 文档准确性 | senior-researcher | 需要领域知识 |
| 许可证兼容性 | auditor | 法律/合规专业知识 |

**自动路由逻辑**：
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

**预期结果：** 问题已路由到适当的专家并附有理由

**失败处理：** 如果没有明确的专家，升级给人工手动路由

### 第 4 步：创建可操作的问题报告

生成适合目标受众（代理或人工）的格式化报告。

**面向专家代理**（MCP 工具的结构化格式）：
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

**面向人工审查者**（详细 markdown）：
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

**预期结果：** 报告已为目标受众适当格式化

**失败处理：**（不适用——如不确定则生成通用 markdown 报告）

### 第 5 步：跟踪升级状态

维护所有升级的日志以防止重复报告。

```markdown
# Escalation Log

| ID | Date | Severity | Issue | Specialist | Status |
|----|------|----------|-------|-----------|--------|
| ESC-001 | 2026-02-16 | CRITICAL | Broken prod import | human | Resolved |
| ESC-002 | 2026-02-16 | HIGH | Dead payment code | human | Pending |
| ESC-003 | 2026-02-16 | MEDIUM | Config drift | devops-engineer | In Progress |
```

**预期结果：** `ESCALATION_LOG.md` 已更新新条目

**失败处理：** 如果日志不存在，创建它

### 第 6 步：通知和阻塞（如需要）

如果问题阻塞进一步的维护，通知并暂停清理。

**阻塞逻辑**：
- 关键问题始终阻塞
- 高级问题在关键路径中阻塞
- 中/低级问题不阻塞

**通知**：
```markdown
MAINTENANCE BLOCKED

Issue ESC-002 (HIGH severity) requires human review before proceeding.

**Affected Operation**: clean-codebase (Step 5: Remove Dead Code)
**Reason**: Uncertain if src/legacy_payments.js is truly dead

**Action Required**: Review ESCALATION_REPORTS/ESC-002_2026-02-16.md

Once resolved, re-run maintenance from Step 5.
```

**预期结果：** 维护已暂停；已生成清晰的通知

**失败处理：** 如果通知机制不可用，在报告中记录

## 验证清单

升级后：

- [ ] 问题严重程度正确评估
- [ ] 完整上下文已记录（文件、证据、尝试）
- [ ] 已确定适当的专家
- [ ] 升级报告已在 ESCALATION_REPORTS/ 中创建
- [ ] ESCALATION_LOG.md 已更新
- [ ] 阻塞状态已沟通（如适用）
- [ ] 报告中未暴露敏感信息

## 常见问题

1. **过度升级**：升级简单问题浪费专家时间。仅在真正不确定或有风险时才升级

2. **升级不足**：在没有升级的情况下删除代码"看看测试是否通过"可能导致生产中断

3. **上下文不足**：没有证据的升级迫使专家重新调查。包含文件路径、行号、错误消息

4. **描述模糊**："配置有问题"不可操作。要具体："配置偏移：开发环境使用 API v1，生产使用 v2"

5. **不跟踪状态**：重复升级已审查的问题。先检查 ESCALATION_LOG.md

6. **暴露密钥**：在升级报告中包含实际的 API 密钥或密码。脱敏敏感值

## 相关技能

- [clean-codebase](../clean-codebase/SKILL.md) — 不确定时经常触发升级
- [tidy-project-structure](../tidy-project-structure/SKILL.md) — 可能发现复杂的组织问题
- [repair-broken-references](../repair-broken-references/SKILL.md) — 不清楚引用应修复还是删除时升级
- [compliance/security-scan](../../compliance/security-scan/SKILL.md) — 升级安全发现
- [general/issue-triage](../../general/issue-triage/SKILL.md) — 通用问题分类模式
