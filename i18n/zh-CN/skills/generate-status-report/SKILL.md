---
name: generate-status-report
description: >
  通过读取现有项目文档（章程、待办事项列表、冲刺计划、WBS），
  计算指标、识别阻碍项，并使用 RAG 指示器汇总进度，生成项目状态报告，
  涵盖进度、范围、预算和质量维度。适合在冲刺或报告周期结束时使用，
  当干系人请求健康状态更新、在指导委员会或治理会议前，
  或当新的阻碍项或风险在项目中期出现时使用。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: project-management
  complexity: intermediate
  language: multi
  tags: project-management, status-report, metrics, rag, progress, blockers
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude-opus-4-6
  translation_date: "2026-03-16"
---

# 生成项目状态报告

通过分析项目文档、计算进度指标，并汇总成果、阻碍项和后续工作计划，配合 RAG（红/琥珀/绿）健康指示器，生成周期性状态报告。

## 适用场景

- 冲刺或报告周期结束（每周、双周、每月）
- 干系人请求项目健康状态更新
- 指导委员会或治理会议前
- 项目健康指示器发生变化（例如出现新的阻碍项或风险）
- 针对章程里程碑的定期检查点

## 输入

- **必填**：报告周期（开始日期、结束日期）
- **必填**：至少一份项目文档（BACKLOG.md、SPRINT-PLAN.md、WBS.md 或 PROJECT-CHARTER.md）
- **可选**：之前的状态报告（用于趋势对比）
- **可选**：预算或资源跟踪数据
- **可选**：风险登记册更新

## 步骤

### 第 1 步：读取现有文档

扫描项目目录中的项目管理文档：
- PROJECT-CHARTER.md — 里程碑、成功标准
- BACKLOG.md — 按状态分类的条目数量、燃尽数据
- SPRINT-PLAN.md — 冲刺目标、承诺条目、任务完成情况
- WBS.md — 工作包完成百分比
- 之前的 STATUS-REPORT-*.md 文件 — 趋势数据

读取可用文件。并非所有文件都会存在——根据可用数据调整报告内容。

**预期结果：** 至少成功读取一份文档，提取关键指标。

**失败处理：** 如果没有文档，无法生成报告。先使用 `draft-project-charter` 或 `manage-backlog` 技能创建章程或待办事项列表。

### 第 2 步：计算进度指标

从可用数据计算指标：

**敏捷指标**（来自 BACKLOG.md / SPRINT-PLAN.md）：
- 速度：本次冲刺完成的故事点数
- 冲刺完成率：已完成条目数 / 已承诺条目数
- 待办事项燃尽：与上一周期相比的总剩余点数
- 周期时间：从进行中到完成的平均天数

**传统指标**（来自 WBS.md）：
- 完成百分比：已完成工作包数 / 总工作包数
- 进度偏差：计划里程碑日期与实际日期对比
- 工作量偏差：估算工作量与实际消耗工作量对比

```markdown
## Metrics
| Metric | Value | Previous | Trend |
|--------|-------|----------|-------|
| Velocity | [N] pts | [N] pts | ↑/↓/→ |
| Sprint Completion | [N]% | [N]% | ↑/↓/→ |
| Backlog Remaining | [N] pts | [N] pts | ↓ (good) |
| Schedule Variance | [+/-N days] | [+/-N days] | |
```

**预期结果：** 3-5 个指标已计算，并与上一周期对比。

**失败处理：** 如果没有历史数据（第一份报告），省略"上期"和"趋势"列。如果数据不完整，在报告末尾注明差距，并提出建立跟踪机制的行动项。

### 第 3 步：识别阻碍项、风险和问题

列出活跃的阻碍项和风险：

```markdown
## Blockers & Risks
| ID | Type | Description | Severity | Owner | Status | Action Required |
|----|------|------------|----------|-------|--------|----------------|
| R-001 | Risk | [Description] | High | [Name] | Open | [Action] |
| B-001 | Blocker | [Description] | Critical | [Name] | Active | [Action by date] |
| I-001 | Issue | [Description] | Medium | [Name] | Investigating | [Action] |
```

与章程风险登记册交叉核对。标记任何之前未识别的新风险。

**预期结果：** 所有活跃阻碍项和主要风险已记录，包含负责人和行动项。

**失败处理：** 如果没有阻碍项，明确写明"无活跃阻碍项"——不要留空该部分。如果阻碍项没有负责人，上报给项目经理分配。

### 第 4 步：汇总成果和下一周期计划

编写两个部分：

```markdown
## Accomplishments (This Period)
- [Completed item/milestone with evidence]
- [Completed item/milestone with evidence]
- [Completed item/milestone with evidence]

## Planned (Next Period)
- [Planned item/milestone with target]
- [Planned item/milestone with target]
- [Planned item/milestone with target]
```

**预期结果：** 3-5 项有具体证据的成果，以及下一周期的 3-5 个计划条目。

**失败处理：** 如果没有成果，报告原因（被阻碍、重新规划、团队不可用）。如果下一周期计划不明确，将"规划会议定于 [日期]"列为主要条目。

### 第 5 步：分配 RAG 指示器并撰写报告

评估四个维度的项目健康状态：

| 维度 | 绿色 | 琥珀色 | 红色 |
|-----------|-------|-------|-----|
| **进度** | 按计划推进或提前 | 落后 1-2 周 | 落后超过 2 周或里程碑未达成 |
| **范围** | 无不受控变更 | 轻微范围调整 | 影响可交付成果的范围蔓延 |
| **预算** | 在计划的 5% 以内 | 超出计划 5-15% | 超出计划 15% 以上或未跟踪 |
| **质量** | 测试通过，标准达成 | 轻微质量问题 | 严重缺陷或验收失败 |

撰写完整报告：

```markdown
# Status Report: [Project Name]
## Report Date: [YYYY-MM-DD]
## Reporting Period: [Start] to [End]
## Document ID: SR-[PROJECT]-[YYYY-MM-DD]

### Overall Health
| Dimension | Status | Notes |
|-----------|--------|-------|
| Schedule | 🟢/🟡/🔴 | [One-line explanation] |
| Scope | 🟢/🟡/🔴 | [One-line explanation] |
| Budget | 🟢/🟡/🔴 | [One-line explanation] |
| Quality | 🟢/🟡/🔴 | [One-line explanation] |

### Executive Summary
[2-3 sentences: overall status, key achievement, biggest risk]

### Metrics
[From Step 2]

### Accomplishments
[From Step 4]

### Blockers & Risks
[From Step 3]

### Planned Next Period
[From Step 4]

### Decisions Needed
- [Decision 1 — needed by date, from whom]

---
*Report prepared by: [Name/Agent]*
```

保存为 `STATUS-REPORT-[YYYY-MM-DD].md`。

**预期结果：** 完整的状态报告已保存，包含 RAG 指示器、指标和叙述性内容。

**失败处理：** 如果数据不足以进行 RAG 评估，使用 ⚪（灰色）表示"数据不足"，并列出下一份报告需要收集的数据。

## 验证清单

- [ ] 状态报告文件已创建，文件名包含正确日期戳
- [ ] 四个维度均已分配 RAG 指示器，并有依据说明
- [ ] 至少从项目文档中计算出 3 个指标
- [ ] 阻碍项部分已存在（即使是"无活跃阻碍项"）
- [ ] 成果已列出并有证据
- [ ] 包含下一周期计划
- [ ] 执行摘要为 2-3 句话，而非一段落
- [ ] 每个阻碍项和风险都有负责人、行动项和截止日期

## 常见问题

- **报告缺乏数据支撑**：状态报告必须基于证据。每项声明都应引用文档或指标。
- **持续全绿**：没有证据的持续绿色 RAG 表明报告不够诚实。质疑绿色评估的依据。
- **阻碍项没有负责人**：每个阻碍项都需要负责人和行动项。无人负责的阻碍项不会得到解决。
- **指标缺乏上下文**："速度 = 18"没有参照物就毫无意义。始终包含上一周期或目标值。
- **报告过长**：状态报告应该能在 2 分钟内扫读完毕。保持在 1-2 页以内。
- **缺少决策部分**：如果项目需要干系人决策，明确列出并附截止日期。
- **过时数据**：使用过期文档会导致报告误导人。验证文档日期与报告周期匹配。
- **缺少趋势数据**：首次报告无法显示趋势，但后续报告必须与前期对比。

## 相关技能

- `draft-project-charter` — 章程提供状态跟踪所需的里程碑和成功标准
- `manage-backlog` — 待办事项指标为状态报告提供素材
- `plan-sprint` — 冲刺结果提供速度和完成率数据
- `create-work-breakdown-structure` — WBS 完成情况驱动传统进度指标
- `conduct-retrospective` — 状态报告数据为回顾会议提供素材
