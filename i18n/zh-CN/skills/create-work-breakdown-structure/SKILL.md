---
name: create-work-breakdown-structure
description: >
  根据项目章程可交付成果创建工作分解结构（WBS）和 WBS 字典。
  涵盖层次化分解、WBS 编码、工作量估算、依赖关系识别和关键路径候选项。
  适合在项目章程批准后使用，用于规划具有明确可交付成果的传统或瀑布式项目，
  将大型计划分解为可管理的工作包，或为工作量估算和资源规划建立基础。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: project-management
  complexity: intermediate
  language: multi
  tags: project-management, wbs, work-breakdown-structure, classic, waterfall, planning
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude-opus-4-6
  translation_date: "2026-03-16"
---

# 创建工作分解结构

将项目范围分解为一组层次化的工作包，使其可被估算、分配和跟踪。WBS 通过将复杂的可交付成果拆解为可管理的组件，为工作量估算、资源规划和进度制定提供基础。

## 适用场景

- 项目章程已批准且范围已定义之后
- 规划具有明确可交付成果的传统/瀑布式项目
- 将大型计划分解为可管理的工作包
- 为工作量估算和资源规划建立基础
- 建立对所有所需工作的共同理解

## 输入

- **必填**：已批准的项目章程（尤其是范围和可交付成果部分）
- **必填**：项目方法论（传统/瀑布式，或用于规划的混合型 WBS）
- **可选**：类似项目的历史工作量数据
- **可选**：团队组成和可用技能
- **可选**：组织 WBS 模板或标准

## 步骤

### 第 1 步：从章程中提取可交付成果

阅读项目章程。列出所有可交付成果和验收标准。将其分组为 3-7 个顶级类别（这些成为 WBS 第一级元素）。

**预期结果：** 与章程可交付成果匹配的第一级 WBS 元素列表。

**失败处理：** 如果章程内容模糊，返回使用 `draft-project-charter` 细化范围。

### 第 2 步：分解为工作包

对每个第一级元素，分解为子元素（第二级、第三级）。应用 100% 规则：子元素必须代表父元素 100% 的范围。当工作包满足以下条件时停止分解：
- 可估算（能以人日分配工作量）
- 可分配（一人或一个团队负责）
- 可衡量（有明确的完成/未完成标准）

创建 WBS 大纲：
```markdown
# Work Breakdown Structure: [Project Name]
## Document ID: WBS-[PROJECT]-[YYYY]-[NNN]

### WBS Hierarchy

1. [Level 1: Deliverable Category A]
   1.1 [Level 2: Sub-deliverable]
      1.1.1 [Level 3: Work Package]
      1.1.2 [Level 3: Work Package]
   1.2 [Level 2: Sub-deliverable]
2. [Level 1: Deliverable Category B]
   2.1 [Level 2: Sub-deliverable]
3. [Level 1: Project Management]
   3.1 Planning
   3.2 Monitoring & Control
   3.3 Closure
```

应用 WBS 编码（1.1.1 格式）。确保最多 3-5 级深度。始终包含"项目管理"分支。

**预期结果：** 完整的 WBS，包含 15-50 个工作包，每个工作包具有唯一的 WBS 编码。

**失败处理：** 如果分解超过 5 级，说明范围过大——考虑拆分为子项目。

### 第 3 步：编写 WBS 字典

对每个工作包（叶节点），编写一个字典条目：

```markdown
# WBS Dictionary: [Project Name]
## Document ID: WBS-DICT-[PROJECT]-[YYYY]-[NNN]

### WBS 1.1.1: [Work Package Name]
- **Description**: What this work package produces
- **Acceptance Criteria**: How to verify it's done
- **Responsible**: Person or role
- **Estimated Effort**: [T-shirt size or person-days]
- **Dependencies**: WBS codes this depends on
- **Assumptions**: Key assumptions for this work package

### WBS 1.1.2: [Work Package Name]
...
```

**预期结果：** 每个叶节点工作包都有字典条目。

**失败处理：** 缺少字典条目表明分解不完整——重新审视第 2 步。

### 第 4 步：估算工作量

对每个工作包，采用一种估算方法：
- **T 恤尺码**（XS/S/M/L/XL）用于早期阶段规划
- **人日**用于详细规划
- **三点估算**（乐观/最可能/悲观）用于高不确定性工作

创建汇总表：
```markdown
## Effort Summary
| WBS Code | Work Package | Estimate | Method | Confidence |
|----------|-------------|----------|--------|------------|
| 1.1.1 | [Name] | 5 pd | person-days | High |
| 1.1.2 | [Name] | M | t-shirt | Medium |
```

总工作量 = 所有工作包之和。

**预期结果：** 每个工作包都有工作量估算并说明置信度。

**失败处理：** 如果超过 30% 的工作包置信度为低，安排与主题专家的细化会议。

### 第 5 步：识别依赖关系和关键路径候选项

映射工作包之间的依赖关系：
```markdown
## Dependencies
| WBS Code | Depends On | Type | Notes |
|----------|-----------|------|-------|
| 1.2.1 | 1.1.1 | Finish-to-Start | Output of 1.1.1 is input to 1.2.1 |
| 2.1.1 | 1.1.2 | Finish-to-Start | |
```

识别依赖工作包的最长链——这就是关键路径候选项。

**预期结果：** 依赖关系表至少包含完成到开始的关系。

**失败处理：** 如果依赖关系形成循环，说明分解存在错误——重新审视第 2 步。

### 第 6 步：审查和基线化

将 WBS 和字典合并为最终文档。在每个级别验证 100% 规则。获取干系人签字确认。

**预期结果：** WBS.md 和 WBS-DICTIONARY.md 文件已创建并经过审查。

**失败处理：** 如果干系人发现缺少的范围，添加工作包并重新估算。

## 验证清单

- [ ] WBS 文件已创建，包含文档 ID 和 WBS 编码
- [ ] 100% 规则满足：每个级别的子元素完整代表父元素范围
- [ ] 每个叶节点都有 WBS 字典条目
- [ ] 所有工作包都有工作量估算
- [ ] 识别了依赖关系且没有循环引用
- [ ] 包含项目管理分支
- [ ] 已识别关键路径候选项
- [ ] WBS 深度不超过 5 级

## 常见问题

- **将可交付成果与活动混淆**：WBS 元素应为名词（可交付成果），而非动词（活动）。应为"用户认证模块"而非"实施认证"。
- **违反 100% 规则**：如果子元素加起来不等于父元素范围的 100%，工作将被遗漏。
- **层级太浅或太深**：2 级对规划而言过于模糊；6 级以上属于微观管理。目标为 3-5 级。
- **跳过项目管理分支**：项目管理工作（规划、会议、报告）是真实工作，会消耗工作量。
- **分解前估算**：估算工作包，而非类别。第一级的估算不可靠。
- **没有字典**：没有字典的 WBS 只是标签树——字典提供了完成定义。

## 相关技能

- `draft-project-charter` — 提供 WBS 分解所需的范围和可交付成果
- `manage-backlog` — 将 WBS 工作包转化为可跟踪的待办事项
- `generate-status-report` — 报告针对 WBS 完成百分比的进展
- `plan-sprint` — 如果采用混合方法，从 WBS 工作包进行冲刺规划
- `conduct-retrospective` — 审查估算准确性和分解质量
