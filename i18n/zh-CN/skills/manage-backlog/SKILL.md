---
name: manage-backlog
description: >
  创建和维护包含优先级条目、验收标准和估算值的产品或项目待办事项列表。
  涵盖用户故事编写、MoSCoW 优先级排序、待办事项梳理、条目拆分和状态跟踪。
  适合在新项目启动时将范围转化为可操作条目、在冲刺规划前持续进行梳理、
  在干系人反馈或范围变更后重新排序，或将过大条目拆分为可实施的部分时使用。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: project-management
  complexity: intermediate
  language: multi
  tags: project-management, backlog, user-stories, prioritization, grooming, moscow
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude-opus-4-6
  translation_date: "2026-03-16"
---

# 管理产品待办事项列表

创建、优先排序并维护工作条目的待办事项列表，作为待完成工作的唯一真实来源，适用于敏捷和传统项目管理方法。

## 适用场景

- 新项目启动时将范围转化为可操作条目
- 在冲刺规划前持续进行待办事项梳理
- 在干系人反馈或范围变更后重新排序工作
- 将过大条目拆分为可实施的部分
- 审查和归档已完成或已取消的条目

## 输入

- **必填**：项目范围（来自章程、WBS 或干系人输入）
- **可选**：待更新的现有待办事项文件（BACKLOG.md）
- **可选**：优先级排序框架偏好（MoSCoW、价值/工作量、WSJF）
- **可选**：估算规模（故事点数、T 恤尺码、人日）
- **可选**：需要更新待办事项的冲刺或迭代反馈

## 步骤

### 第 1 步：创建或加载待办事项结构

如果没有待办事项列表，创建具有标准列的 BACKLOG.md。如果已存在，读取并验证结构。

```markdown
# Product Backlog: [Project Name]
## Last Updated: [YYYY-MM-DD]

### Summary
- **Total Items**: [N]
- **Ready for Sprint**: [N]
- **In Progress**: [N]
- **Done**: [N]
- **Cancelled**: [N]

### Backlog Items
| ID | Title | Type | Priority | Estimate | Status | Sprint |
|----|-------|------|----------|----------|--------|--------|
| B-001 | [Title] | Feature | Must | 5 | Ready | — |
| B-002 | [Title] | Bug | Should | 2 | Ready | — |
| B-003 | [Title] | Task | Could | 3 | New | — |

### Item Details

#### B-001: [Title]
- **Type**: Feature | Bug | Task | Spike | Tech Debt
- **Priority**: Must | Should | Could | Won't
- **Estimate**: [Points or size]
- **Status**: New | Ready | In Progress | Done | Cancelled
- **Acceptance Criteria**:
  - [ ] [Criterion 1]
  - [ ] [Criterion 2]
- **Notes**: [Context, links, dependencies]

#### B-002: [Title]
...
```

**预期结果：** BACKLOG.md 存在，具有有效的结构和汇总统计数据。

**失败处理：** 如果文件结构损坏，在保留现有条目数据的前提下重新构建。

### 第 2 步：编写或细化条目

对每个新条目，以用户故事或需求格式编写：

- **用户故事格式**："作为 [角色]，我希望 [能力]，以便 [获益]"
- **需求格式**："[系统/组件] 在 [条件] 时应 [行为]"

每个条目必须包含：
- 唯一 ID（B-NNN，递增）
- 清晰标题（祈使动词形式）
- 类型分类
- 至少 2 个验收标准（可测试，二元通过/失败）

示例：
```markdown
#### B-005: Enable User Login with OAuth
- **Type**: Feature
- **Priority**: Must
- **Estimate**: 5
- **Status**: Ready
- **Acceptance Criteria**:
  - [ ] User can log in using GitHub OAuth
  - [ ] User session persists for 24 hours
  - [ ] Failed login shows clear error message
- **Notes**: Requires OAuth app registration in GitHub
```

**预期结果：** 所有条目都有标题、类型和验收标准。

**失败处理：** 没有验收标准的条目标记为 Status: New（非 Ready）。它们不能进入冲刺。

### 第 3 步：使用 MoSCoW 或价值/工作量矩阵排列优先级

应用所选的优先级排序框架：

**MoSCoW**（默认）：
- **Must**（必须有）：没有它项目失败。不可协商。
- **Should**（应该有）：重要但项目没有它仍可成功。如果容量允许则包含。
- **Could**（可以有）：锦上添花。仅在不影响 Must/Should 条目时包含。
- **Won't**（不会有）：明确排除在当前范围之外。记录以供未来考虑。

**价值/工作量矩阵**（备选）：

| | 低工作量 | 高工作量 |
|---|-----------|-------------|
| **高价值** | 优先做（快速获胜） | 其次做（大赌注） |
| **低价值** | 第三做（填充项） | 不做（资金陷阱） |

排序待办事项表：Must 条目在前（Must 内按价值排序），然后是 Should，然后是 Could。

**预期结果：** 每个条目都有优先级。待办事项列表按优先级排序。

**失败处理：** 如果干系人在优先级上存在分歧，将 Must 与 Should 的决策上报给项目发起人。

### 第 4 步：梳理——拆分、估算和细化

审查条目的冲刺就绪性。对每个条目：
1. **拆分**：如果估算 > 8 点（或 > 1 周工作量）：分解为 2-4 个较小条目
2. **估算**：使用项目选定的规模
3. **细化**：将模糊的验收标准转化为可测试的条件
4. **标记就绪**：当条目具有标题、验收标准、估算且无阻碍项时标记为 Ready

记录拆分情况：
```markdown
**Split**: B-003 split into B-003a, B-003b, B-003c (original archived)

#### B-003a: Set Up Database Schema
- **Type**: Task
- **Priority**: Must
- **Estimate**: 3
- **Status**: Ready
- **Acceptance Criteria**:
  - [ ] Users table created with email, name fields
  - [ ] Migrations run successfully on dev environment

#### B-003b: Implement User CRUD Operations
- **Type**: Task
- **Priority**: Must
- **Estimate**: 5
- **Status**: Ready
- **Acceptance Criteria**:
  - [ ] Create user endpoint returns 201 with user object
  - [ ] Update user endpoint validates required fields
```

**预期结果：** 所有 Must 和 Should 条目处于 Ready 状态。

**失败处理：** 无法估算的条目需要在待办事项中添加一个 Spike（时间盒化研究任务）。

### 第 5 步：更新汇总并归档

更新汇总统计数据。将 Done 和 Cancelled 条目移至归档部分：

```markdown
### Archive
| ID | Title | Status | Sprint | Completed |
|----|-------|--------|--------|-----------|
| B-001 | Enable User Login with OAuth | Done | S-003 | 2025-03-15 |
| B-004 | Add Dark Mode Theme | Cancelled | — | 2025-03-10 |
```

通过统计每种状态的条目数更新汇总：
```bash
# Count Ready items
grep "| Ready |" BACKLOG.md | wc -l

# Count In Progress items
grep "| In Progress |" BACKLOG.md | wc -l

# Count Done items
grep "| Done |" BACKLOG.md | wc -l
```

**预期结果：** 汇总统计数据与实际条目数量匹配。归档部分包含所有已关闭条目。

**失败处理：** 如果计数不匹配，通过搜索 Status 值重新计数并手动更新汇总。

## 验证清单

- [ ] BACKLOG.md 存在，具有标准结构
- [ ] 每个条目都有唯一 ID、标题、类型、优先级和状态
- [ ] 所有 Must 和 Should 条目都有验收标准
- [ ] 条目按优先级排序（Must 在前，然后 Should，然后 Could）
- [ ] 没有估算超过 8 点的条目未经拆分
- [ ] 汇总统计数据准确
- [ ] Done/Cancelled 条目已归档

## 常见问题

- **没有验收标准**：没有标准的条目无法验证是否完成。每个条目至少需要 2 个可测试的标准。
- **所有东西都是 Must 优先级**：如果超过 50% 的条目是 Must，优先级设置不真实。在 Must 内进行强制排名。
- **僵尸条目**：在待办事项中停留数月没有进展的条目应重新评估或取消。
- **缺乏上下文的估算**：故事点是相对的——团队必须有参考条目（例如"B-001 是我们的 3 点参考"）。
- **拆分创造碎片**：拆分时，确保每个子条目可独立交付且有价值。
- **待办事项成为垃圾场**：待办事项不是愿望清单。定期清理不再与项目目标对齐的条目。
- **缺少依赖关系**：在 Notes 字段中记录阻碍条目。被阻碍的条目不应标记为 Ready。

## 相关技能

- `draft-project-charter` — 章程范围转化为初始待办事项
- `create-work-breakdown-structure` — WBS 工作包可成为待办事项条目
- `plan-sprint` — 冲刺规划从待办事项列表顶部选择条目
- `generate-status-report` — 待办事项燃尽数据为状态报告提供素材
- `conduct-retrospective` — 回顾改进条目反馈到待办事项列表
