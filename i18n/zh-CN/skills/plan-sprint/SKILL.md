---
name: plan-sprint
description: >
  通过细化待办事项、定义冲刺目标、计算团队容量、选择条目并将其分解为任务来规划冲刺。
  生成包含目标、所选条目、任务分解和容量分配的 SPRINT-PLAN.md。
  适合在 Scrum 或敏捷项目中启动新冲刺、重大范围变更后重新规划、
  从临时工作过渡到有组织的冲刺节奏，或在待办事项梳理后条目已准备好纳入时使用。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: project-management
  complexity: intermediate
  language: multi
  tags: project-management, sprint, agile, scrum, capacity, sprint-planning
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude-opus-4-6
  translation_date: "2026-03-16"
---

# 规划冲刺

通过选择已细化的待办事项至团队容量上限、定义明确的冲刺目标，并将所选条目分解为可操作的任务，规划一个时间盒化的冲刺。本技能生成完整的冲刺计划，指导团队在整个冲刺迭代期间的工作。

## 适用场景

- 在 Scrum 或敏捷项目中启动新冲刺
- 重大范围变更后重新规划冲刺
- 从临时工作过渡到有组织的冲刺节奏
- 待办事项梳理后条目已准备好纳入冲刺
- 项目章程批准后规划第一个冲刺

## 输入

- **必填**：产品待办事项列表（已优先级排序，含估算值）
- **必填**：冲刺时长（通常 1-2 周）
- **必填**：团队成员及其可用性
- **可选**：前一冲刺的速度（完成的故事点数或条目数）
- **可选**：冲刺编号和日期范围
- **可选**：上一冲刺的遗留条目

## 步骤

### 第 1 步：审查和细化待办事项

阅读当前的 BACKLOG.md。对待办事项列表顶部的每个候选条目，验证其是否包含：

- 清晰的标题和描述
- 验收标准（可测试的条件）
- 估算值（故事点数或 T 恤尺码）
- 无未解决的阻碍项

细化任何缺少这些要素的条目。将估算值超过一半冲刺容量的条目拆分为更小、更易管理的部分。

**预期结果：** 待办事项列表顶部的 10-15 个条目已"冲刺就绪"，包含验收标准和估算值。

**失败处理：** 如果条目缺少验收标准，现在编写。如果条目无法估算，安排细化讨论，仅选择已就绪的条目。

### 第 2 步：定义冲刺目标

写出一个明确的冲刺目标——用一句话说明本次冲刺将实现什么。目标应该：

- 在冲刺时长内可实现
- 对干系人有价值
- 可测试（可在冲刺结束时验证是否达成）

```markdown
**Sprint Goal**: [One sentence describing the objective]
```

示例："通过电子邮件验证和双因素认证，使用户能够重置密码。"

**预期结果：** 冲刺目标表述为一句清晰、可测试的话。

**失败处理：** 如果没有连贯的目标浮现，待办事项优先级可能过于分散——咨询产品负责人，聚焦于单一有价值的结果。

### 第 3 步：计算团队容量

计算每位团队成员的可用人日：

```markdown
## Team Capacity
| Team Member | Available Days | Overhead (%) | Net Capacity |
|-------------|---------------|-------------|--------------|
| [Name] | [Sprint days - PTO] | 20% | [Available × 0.8] |
| [Name] | [Sprint days - PTO] | 20% | [Available × 0.8] |
| **Total** | | | **[Sum] person-days** |
```

开销涵盖会议、审查、临时请求（通常 15-25%）。

如果使用故事点：用前一冲刺速度作为容量。如果是第一个冲刺，使用理论最大值的 60-70%。

**预期结果：** 以人日或故事点计算的容量，并记录假设条件。

**失败处理：** 如果没有历史速度数据，保持保守——按 60% 容量规划，冲刺后调整。宁可少承诺多交付，也不要多承诺而失败。

### 第 4 步：选择条目并组成冲刺待办事项列表

从产品待办事项列表顶部选择条目直至达到容量上限。将每个所选条目分解为任务（每个 2-8 小时）：

```markdown
# Sprint Plan: Sprint [N]
## Document ID: SP-[PROJECT]-S[NNN]

### Sprint Details
- **Sprint Goal**: [From Step 2]
- **Duration**: [Start date] to [End date]
- **Capacity**: [From Step 3] person-days / [N] story points
- **Team**: [List team members]

### Sprint Backlog
| ID | Item | Points | Tasks | Assignee | Status |
|----|------|--------|-------|----------|--------|
| B-001 | [Item title] | 5 | 4 | [Name] | To Do |
| B-002 | [Item title] | 3 | 3 | [Name] | To Do |
| B-003 | [Item title] | 8 | 6 | [Name] | To Do |
| **Total** | | **16** | **13** | | |

### Task Breakdown

#### B-001: [Item title]
**Acceptance Criteria**: [From backlog item]

- [ ] Task 1: [Description] (4h, [Assignee])
- [ ] Task 2: [Description] (2h, [Assignee])
- [ ] Task 3: [Description] (4h, [Assignee])
- [ ] Task 4: [Description] (2h, [Assignee])

#### B-002: [Item title]
**Acceptance Criteria**: [From backlog item]

- [ ] Task 1: [Description] (3h, [Assignee])
- [ ] Task 2: [Description] (4h, [Assignee])
- [ ] Task 3: [Description] (2h, [Assignee])

#### B-003: [Item title]
**Acceptance Criteria**: [From backlog item]

- [ ] Task 1: [Description] (3h, [Assignee])
- [ ] Task 2: [Description] (4h, [Assignee])
- [ ] Task 3: [Description] (2h, [Assignee])
- [ ] Task 4: [Description] (3h, [Assignee])
- [ ] Task 5: [Description] (4h, [Assignee])
- [ ] Task 6: [Description] (2h, [Assignee])

### Risks and Dependencies
| Risk | Impact | Mitigation |
|------|--------|-----------|
| [Risk 1] | [Impact] | [Mitigation] |
| [Risk 2] | [Impact] | [Mitigation] |

### Carry-Over from Previous Sprint
| ID | Item | Reason | Remaining Effort |
|----|------|--------|-----------------|
| B-XXX | [Item] | [Reason] | [Hours/points] |
```

**预期结果：** 冲刺待办事项列表中所选条目不超过容量，每个条目均分解为带时间估算的任务。

**失败处理：** 如果总点数超过容量，移除最低优先级条目。绝不超出容量 10% 以上。如果依赖关系阻碍排序，重新排序或推迟条目。

### 第 5 步：记录承诺并保存

将冲刺计划写入 `SPRINT-PLAN.md`（或 `SPRINT-PLAN-S[NNN].md` 用于归档）。确认：

- 冲刺目标可通过所选条目实现
- 没有团队成员被过度分配（> 100% 容量）
- 条目间的依赖关系顺序正确
- 遗留条目已在容量中计入
- 所有验收标准已从待办事项中复制

运行最终验证：

```bash
# Check that total task hours align with capacity
grep -A 100 "Task Breakdown" SPRINT-PLAN.md | grep -o '([0-9]*h' | sed 's/[^0-9]//g' | awk '{sum+=$1} END {print "Total hours:", sum}'
```

**预期结果：** SPRINT-PLAN.md 已创建，包含完整的冲刺待办事项列表和任务分解。总小时数应 ≤ 可用人日 × 8 小时的 80%。

**失败处理：** 如果承诺与目标不一致，重新审视第 4 步中的条目选择。如果任务小时数超过容量，移除最后一个条目或更细粒度地分解任务。

## 验证清单

- [ ] 冲刺目标是一句清晰、可测试的话
- [ ] 团队容量已计算并记录假设条件（开销百分比、带薪假已计入）
- [ ] 所选条目不超过容量（点数或人日）
- [ ] 每个所选条目的验收标准已复制到任务分解中
- [ ] 每个所选条目已分解为任务（每个 2-8 小时）
- [ ] 没有团队成员被过度分配超过 100% 容量
- [ ] 上一冲刺的遗留条目已记录剩余工作量
- [ ] 条目间的依赖关系顺序正确
- [ ] 风险和缓解措施已记录
- [ ] SPRINT-PLAN.md 文件已创建并保存

## 常见问题

- **没有冲刺目标**：没有目标，冲刺只是一堆任务的集合。目标提供专注方向，是冲刺中期范围决策的基础。
- **过度承诺**：按 100% 容量规划忽略了中断、缺陷和开销。按 70-80% 规划以为意外情况留出缓冲。
- **任务过大**：超过 8 小时的任务会隐藏复杂性并使进度跟踪困难。将任务分解至 2-8 小时。
- **忽略遗留条目**：上一冲刺未完成的条目会消耗本次冲刺的容量。在容量计算中明确计入。
- **冲刺目标等同于条目列表**："完成 B-001、B-002、B-003"不是目标。目标描述结果："用户可以通过电子邮件验证重置密码。"
- **没有任务负责人**：规划时每个任务都应有指定人员，以便早期发现容量冲突。
- **跳过验收标准**：没有验收标准的任务无法测试。将验收标准从待办事项复制到任务分解部分。

## 相关技能

- `manage-backlog` — 维护和优先排序为冲刺规划提供来源的产品待办事项列表
- `draft-project-charter` — 为第一个冲刺提供项目背景和初始范围
- `generate-status-report` — 向干系人报告冲刺进展和速度
- `conduct-retrospective` — 回顾冲刺执行情况并改进规划流程
- `create-work-breakdown-structure` — 在混合敏捷-瀑布方法中，WBS 工作包可以转入待办事项列表
