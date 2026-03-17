---
name: conduct-retrospective
description: >
  通过收集状态报告和速度指标数据，梳理进展良好和需要改进的方面，
  并生成带有负责人和截止日期的可操作改进条目，开展项目或冲刺回顾会议。
  适合在冲刺结束时、项目阶段或里程碑完成后、重大事件或成功之后、
  持续流程的季度回顾，或在启动类似项目前用于提炼经验教训时使用。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: project-management
  complexity: basic
  language: multi
  tags: project-management, retrospective, continuous-improvement, agile, lessons-learned
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude-opus-4-6
  translation_date: "2026-03-16"
---

# 开展回顾会议

主持结构化的回顾会议，回顾近期项目执行情况，识别哪些方面有效、哪些方面无效，并生成具有具体行动项、负责人和截止日期的可操作改进条目，反馈至项目流程中。本技能将原始项目数据转化为有证据支撑的经验教训，附带明确的行动、负责人和截止日期。

## 适用场景

- 冲刺结束（冲刺回顾）
- 项目阶段或里程碑结束
- 重大事件、失败或成功之后
- 对持续进行的项目流程进行季度回顾
- 启动类似项目前（经验教训回顾）

## 输入

- **必填**：回顾周期（冲刺编号、日期范围或里程碑）
- **可选**：回顾周期内的状态报告
- **可选**：冲刺速度和完成率数据
- **可选**：上一次回顾的行动项（用于检查关闭情况）
- **可选**：团队反馈或调研结果

## 步骤

### 第 1 步：收集回顾数据

读取回顾周期内的可用文档：
- 该周期的 STATUS-REPORT-*.md 文件
- SPRINT-PLAN.md 用于计划与实际对比
- BACKLOG.md 用于条目流转和周期时间
- 之前的 RETRO-*.md 用于未关闭行动项

提取关键事实：
- 计划条目数与完成条目数
- 速度趋势
- 遇到的阻碍项及解决时间
- 进入冲刺的计划外工作
- 上次回顾中未关闭的行动项

**预期结果：** 包含量化指标的数据摘要（速度、完成百分比、阻碍项数量）。

**失败处理：** 如果没有文档，基于定性观察开展回顾会议。

### 第 2 步：梳理"进展良好"

列出 3-5 件进展良好的事项，附有证据：

```markdown
## What Went Well
| # | Observation | Evidence |
|---|------------|---------|
| 1 | [Specific positive observation] | [Metric, example, or artifact reference] |
| 2 | [Specific positive observation] | [Metric, example, or artifact reference] |
| 3 | [Specific positive observation] | [Metric, example, or artifact reference] |
```

聚焦于值得延续的实践，而非仅关注结果。"每日站会使阻碍项保持可见"比"我们按时交付"更具可操作性。

**预期结果：** 3-5 条有证据支撑的积极观察。

**失败处理：** 如果没有进展良好的事项，再仔细寻找——即使是小的成就也很重要。至少，团队完成了这一周期。

### 第 3 步：梳理"需要改进"

列出 3-5 件需要改进的事项，附有证据：

```markdown
## What Needs Improvement
| # | Observation | Evidence | Impact |
|---|------------|---------|--------|
| 1 | [Specific issue] | [Metric, example, or incident] | [Effect on delivery] |
| 2 | [Specific issue] | [Metric, example, or incident] | [Effect on delivery] |
| 3 | [Specific issue] | [Metric, example, or incident] | [Effect on delivery] |
```

保持具体和客观。"估算不准"过于模糊。"5 个条目中有 3 个超出估算 50% 以上，增加了 8 个计划外天数"才具有可操作性。

**预期结果：** 3-5 个有证据支撑的改进领域，并说明影响。

**失败处理：** 如果团队认为一切都好，对比计划与实际指标——差距揭示问题所在。

### 第 4 步：生成改进行动

对每个改进领域，创建一个可操作条目：

```markdown
## Improvement Actions
| ID | Action | Owner | Due Date | Success Criteria | Source |
|----|--------|-------|----------|-----------------|--------|
| A-001 | [Specific action] | [Name] | [Date] | [How to verify success] | Improvement #1 |
| A-002 | [Specific action] | [Name] | [Date] | [How to verify success] | Improvement #2 |
| A-003 | [Specific action] | [Name] | [Date] | [How to verify success] | Improvement #3 |
```

每个行动必须：
- 具体（不是"改善估算"，而是"在梳理时增加估算审查步骤"）
- 有负责人（一人问责）
- 有时限（截止日期在接下来 1-2 个冲刺内）
- 可验证（成功标准已定义）

**预期结果：** 2-4 个带负责人和截止日期的改进行动。

**失败处理：** 如果行动过于模糊，应用"如何验证这已完成？"的测试。

### 第 5 步：审查上次行动并撰写报告

检查上次回顾行动的关闭情况：

```markdown
## Previous Action Review
| ID | Action | Owner | Status | Notes |
|----|--------|-------|--------|-------|
| A-prev-001 | [Action from last retro] | [Name] | Closed / Open / Recurring | [Outcome] |
| A-prev-002 | [Action from last retro] | [Name] | Closed / Open / Recurring | [Outcome] |
```

标记反复出现的条目（同一问题在 3 次以上回顾中出现）——这些需要上报或采用不同方法。

撰写完整的回顾报告：

```markdown
# Retrospective: [Sprint N / Phase Name / Date Range]
## Date: [YYYY-MM-DD]
## Document ID: RETRO-[PROJECT]-[YYYY-MM-DD]

### Period Summary
- **Period**: [Sprint N / dates]
- **Planned**: [N items / N points]
- **Completed**: [N items / N points]
- **Velocity**: [N] (previous: [N])
- **Unplanned Work**: [N items]

### What Went Well
[From Step 2]

### What Needs Improvement
[From Step 3]

### Improvement Actions
[From Step 4]

### Previous Action Review
[From Step 5]

---
*Retrospective facilitated by: [Name/Agent]*
```

保存为 `RETRO-[YYYY-MM-DD].md`。

**预期结果：** 完整的回顾文档已保存，包含行动项、证据和上次行动审查。

**失败处理：** 如果回顾没有改进行动，说明它没有推动变革——重新审视第 3 步。

## 验证清单

- [ ] 回顾文件已创建，文件名包含日期戳
- [ ] 周期摘要包含量化指标
- [ ] "进展良好"有 3-5 条有证据支撑的条目
- [ ] "需要改进"有 3-5 条有证据支撑的条目
- [ ] 改进行动有负责人、截止日期和成功标准
- [ ] 上次回顾行动已审查关闭情况
- [ ] 反复出现的问题已标记

## 常见问题

- **相互指责**：回顾会议审查流程和实践，而非针对个人。将问题框架化为系统性的，而非个人责任。
- **行动没有跟进**：这是最大的回顾失败。在创建新行动前始终审查上次行动。
- **行动过多**：2-4 个有针对性的行动胜过 10 个模糊的行动。团队只能吸收这么多变化。
- **缺乏证据**："我们感觉估算很差"是观点。"5 个条目中有 3 个超出估算 50%"是数据。始终附上证据。
- **跳过积极方面**：只讨论问题会打击士气。庆祝成功可以强化良好实践。

## 相关技能

- `generate-status-report` — 状态报告为回顾提供数据
- `manage-backlog` — 改进行动反馈至待办事项列表
- `plan-sprint` — 回顾经验教训提高冲刺规划准确性
- `draft-project-charter` — 回顾章程假设条件和风险准确性
- `create-work-breakdown-structure` — 审查针对 WBS 的估算准确性
