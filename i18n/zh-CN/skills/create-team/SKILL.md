---
name: create-team
description: >
  按照 agent-almanac 团队模板和注册表规范创建新的团队组合文件。涵盖团队目的
  定义、成员选择、协调模式选择、任务分解设计、机器可读配置块、注册表集成
  和 README 自动化。适用于定义多智能体工作流、为复杂审查流程组合智能体，
  或为反复出现的协作任务创建协调团队。
locale: zh-CN
source_locale: en
source_commit: acc252e6 # stale — source updated for teams infrastructure fix
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: meta, team, creation, composition, coordination
---

# 创建新团队

定义协调两个或多个智能体完成需要多视角、多专业或多阶段任务的多智能体团队组合。生成的团队文件与团队注册表集成，可在 Claude Code 中按名称激活。

## 适用场景

- 任务需要单个智能体无法提供的多视角（例如代码审查 + 安全审计 + 架构审查）
- 需要角色分配和交接模式一致的反复出现的协作工作流
- 现有智能体组合被反复使用，应予以正式化
- 复杂流程自然分解为由不同智能体处理的阶段或专业
- 需要为基于 sprint、基于管道或并行工作定义协调团队

## 输入

- **必需**：团队名称（小写连字符格式，例如 `data-pipeline-review`）
- **必需**：团队目的（一段描述需要多个智能体的问题）
- **必需**：负责人智能体（必须存在于 `agents/_registry.yml`）
- **可选**：协调模式（默认：hub-and-spoke）。选项之一：`hub-and-spoke`、`sequential`、`parallel`、`timeboxed`、`adaptive`
- **可选**：成员数量（默认：3-4；建议范围：2-5）
- **可选**：源材料（要正式化的现有工作流、操作手册或临时团队组合）

## 步骤

### 第 1 步：定义团队目的

阐明需要多个智能体协作的问题。有效的团队目的必须回答：

1. **此团队交付什么结果？**（例如综合审查报告、已部署应用、sprint 增量）
2. **为什么单个智能体无法完成？** 识别至少两种所需的不同专业或视角。
3. **何时应激活此团队？** 定义触发条件。

将目的写成一段话，供人或智能体阅读以决定是否激活此团队。

**预期结果：** 清晰的段落解释团队的价值主张，识别至少两种不同专业。

**失败处理：** 若无法识别两种不同专业，任务可能不需要团队。改用具有多种技能的单个智能体。

### 第 2 步：选择负责人智能体

负责人智能体协调团队。从 `agents/_registry.yml` 中选择以下特征的智能体：

- 在团队主要输出的相关领域具有专业知识
- 能将传入请求分解为其他成员的子任务
- 能将多位审查者的结果综合为连贯的可交付成果

```bash
# 列出所有可用智能体
grep "^  - id:" agents/_registry.yml
```

负责人还必须作为成员出现在团队组合中（负责人始终是成员）。

**预期结果：** 选定一个智能体作为负责人，已确认其存在于智能体注册表中。

**失败处理：** 若没有现有智能体适合负责人角色，先使用 `create-agent` 技能（或手动使用 `agents/_template.md`）创建一个。不要创建负责人不存在智能体定义的团队。

### 第 3 步：选择成员智能体

选择 2-5 个成员（包括负责人），职责清晰且不重叠。为每个成员定义：

- **id**：来自智能体注册表的智能体名称
- **role**：简短头衔（例如"Quality Reviewer"、"Security Auditor"、"Architecture Reviewer"）
- **responsibilities**：一句话描述此成员做其他成员不做的什么

```bash
# 验证每个候选智能体存在
grep "id: agent-name-here" agents/_registry.yml
```

验证无重叠：没有两个成员应有相同的主要职责。若职责重叠，要么合并角色，要么明确边界。

**预期结果：** 选定 2-5 个成员，每人有唯一角色和明确职责，均已在智能体注册表中确认。

**失败处理：** 若所需智能体不存在，先创建它。若两个成员之间职责重叠，重写以明确边界或删除其中一个成员。

### 第 4 步：选择协调模式

选择最适合团队工作流的模式。五种模式及其使用场景：

| 模式 | 适用场景 | 示例团队 |
|------|---------|---------|
| **hub-and-spoke** | 负责人分配任务、收集结果并综合。最适合审查和审计工作流。 | r-package-review、gxp-compliance-validation、ml-data-science-review |
| **sequential** | 每个智能体基于前一个智能体的输出构建。最适合管道和分阶段工作流。 | fullstack-web-dev、tending |
| **parallel** | 所有智能体同时处理独立子任务。最适合子任务无依赖时。 | devops-platform-engineering |
| **timeboxed** | 工作组织为固定时长的迭代。最适合有积压的持续项目工作。 | scrum-team |
| **adaptive** | 团队根据任务自组织。最适合未知或高度可变的任务。 | opaque-team |

**决策指南：**
- 若负责人必须看到所有结果才能产出：**hub-and-spoke**
- 若智能体 B 需要智能体 A 的输出才能开始：**sequential**
- 若所有智能体都能在不看到彼此输出的情况下工作：**parallel**
- 若工作跨多次迭代且有规划仪式：**timeboxed**
- 若无法提前预测任务结构：**adaptive**

**预期结果：** 选定一种协调模式，并有清晰的选择理由。

**失败处理：** 若不确定，默认使用 hub-and-spoke。它是最常见的模式，适用于大多数审查和分析工作流。

### 第 5 步：设计任务分解

定义典型传入请求如何在团队成员间拆分。按阶段构建：

1. **设置阶段**：负责人分析请求并创建任务
2. **执行阶段**：每个成员处理的内容（根据协调模式，可以是并行、顺序或按 sprint）
3. **综合阶段**：如何收集结果并产生最终可交付成果

为每个成员列出其在典型请求中会执行的 3-5 个具体任务。这些任务同时出现在"任务分解"散文章节和 CONFIG 块的 `tasks` 列表中。

**预期结果：** 按阶段结构的分解，每个成员有具体任务，与所选协调模式匹配。

**失败处理：** 若任务太模糊（例如"审查事物"），使其具体化（例如"对照 tidyverse 风格指南审查代码风格，检查测试覆盖率，评估错误消息质量"）。

### 第 6 步：编写团队文件

复制模板并填写所有章节：

```bash
cp teams/_template.md teams/<team-name>.md
```

按顺序填写以下章节：

1. **YAML 前置元数据**：`name`、`description`、`lead`、`version`（"1.0.0"）、`author`、`created`、`updated`、`tags`、`coordination`、`members[]`（每个包含 id、role、responsibilities）
2. **标题**：`# Team Name`（人类可读，标题格式）
3. **简介**：一段摘要
4. **目的**：此团队存在的原因，结合了哪些专业
5. **团队组合**：包含成员、智能体、角色、关注点列的表格
6. **协调模式**：散文描述加流程的 ASCII 图
7. **任务分解**：按阶段分解，每个成员有具体任务
8. **配置**：机器可读的 CONFIG 块（见第 7 步）
9. **使用场景**：2-3 个具体场景和示例用户提示
10. **限制**：3-5 个已知约束
11. **参见**：成员智能体文件及相关技能/团队的链接

**预期结果：** 完整的团队文件，所有章节填写完毕，模板中无剩余占位文本。

**失败处理：** 与现有团队文件（例如 `teams/r-package-review.md`）对比以验证结构。搜索模板占位字符串如"your-team-name"或"another-agent"查找未填写的章节。

### 第 7 步：编写 CONFIG 块

`<!-- CONFIG:START -->` 和 `<!-- CONFIG:END -->` 标记之间的 CONFIG 块为工具提供机器可读的 YAML。按如下结构：

    <!-- CONFIG:START -->
    ```yaml
    team:
      name: <team-name>
      lead: <lead-agent-id>
      coordination: <pattern>
      members:
        - agent: <agent-id>
          role: <role-title>
          subagent_type: <agent-id>  # Claude Code subagent type for spawning
        # ... repeat for each member
      tasks:
        - name: <task-name>
          assignee: <agent-id>
          description: <one-line description>
        # ... repeat for each task
        - name: synthesize-report  # final task if hub-and-spoke
          assignee: <lead-agent-id>
          description: <synthesis description>
          blocked_by: [<prior-task-names>]  # for dependency ordering
    ```
    <!-- CONFIG:END -->

`subagent_type` 字段映射到 Claude Code 智能体类型。对于 `.claude/agents/` 中定义的智能体，使用智能体 id 作为 subagent_type。使用 `blocked_by` 表达任务依赖（例如综合被所有审查任务阻塞）。

**预期结果：** CONFIG 块是有效的 YAML，所有智能体与前置元数据成员列表中的一致，任务依赖形成有效的 DAG（无循环）。

**失败处理：** 验证 YAML 语法。验证任务列表中的每个 `assignee` 与成员列表中的 `agent` 匹配。检查 `blocked_by` 仅引用列表中之前定义的任务名称。

### 第 8 步：添加到注册表

编辑 `teams/_registry.yml` 添加新团队：

```yaml
- id: <team-name>
  path: <team-name>.md
  lead: <lead-agent-id>
  members: [<agent-id-1>, <agent-id-2>, ...]
  coordination: <pattern>
  description: <one-line description matching frontmatter>
```

在注册表顶部更新 `total_teams` 数量（目前为 8；添加一个团队后变为 9）。

```bash
# 验证条目已添加
grep "id: <team-name>" teams/_registry.yml
```

**预期结果：** 新条目出现在注册表中，`total_teams` 数量递增 1。

**失败处理：** 若团队名称已存在于注册表，选择不同的名称或更新现有条目。验证 YAML 缩进与现有条目匹配。

### 第 9 步：运行 README 自动化

从更新后的注册表重新生成 README 文件：

```bash
npm run update-readmes
```

这会更新 `teams/README.md` 中的动态章节以及任何引用团队数据的带有 `<!-- AUTO:START -->` / `<!-- AUTO:END -->` 标记的其他文件。

**预期结果：** 命令以 0 退出，`teams/README.md` 现在列出新团队。

**失败处理：** 运行 `npm run check-readmes` 查看哪些文件不同步。若脚本失败，验证存储库根目录存在 `package.json` 且 `js-yaml` 已安装（`npm install`）。

### 第 10 步：验证团队激活

测试团队在 Claude Code 中是否可以激活：

```
User: Use the <team-name> team to <typical task description>
```

Claude Code 应当：
1. 在 `teams/<team-name>.md` 找到团队文件
2. 识别负责人和成员
3. 遵循文件中描述的协调模式

**预期结果：** Claude Code 识别团队名称，识别正确的负责人和成员，并遵循协调模式。

**失败处理：** 验证团队文件位于 `teams/<team-name>.md`（而非子目录中）。检查所有成员智能体是否存在于 `.claude/agents/`（链接到 `agents/`）。确认团队已列入 `teams/_registry.yml`。

## 验证清单

- [ ] 团队文件存在于 `teams/<team-name>.md`
- [ ] YAML 前置元数据解析无误
- [ ] 所有必需前置元数据字段存在：`name`、`description`、`lead`、`version`、`author`、`coordination`、`members[]`
- [ ] 前置元数据中每个成员都有 `id`、`role` 和 `responsibilities`
- [ ] 所有章节存在：Purpose、Team Composition、Coordination Pattern、Task Decomposition、Configuration、Usage Scenarios、Limitations、See Also
- [ ] CONFIG 块存在于 `<!-- CONFIG:START -->` 和 `<!-- CONFIG:END -->` 标记之间
- [ ] CONFIG 块 YAML 有效且可解析
- [ ] 所有成员智能体 id 存在于 `agents/_registry.yml`
- [ ] 负责人智能体出现在成员列表中
- [ ] 没有两个成员共有相同的主要职责
- [ ] 团队已列入 `teams/_registry.yml`，路径、负责人、成员和协调模式正确
- [ ] 注册表中的 `total_teams` 数量已递增
- [ ] `npm run update-readmes` 无错误完成

## 常见问题

- **成员过多**：超过 5 个成员的团队协调困难。分发任务和综合结果的开销超过额外视角带来的收益。拆分为两个团队或减少到必要专业。
- **职责重叠**：若两个成员都"审查代码质量"，他们的发现会冲突，负责人浪费时间去重。每个成员必须有明确不同的关注领域。
- **协调模式选择错误**：当智能体需要彼此输出时使用 hub-and-spoke（应该是 sequential），或当智能体可以独立工作时使用 sequential（应该是 parallel）。回顾第 4 步中的决策指南。
- **缺少 CONFIG 块**：CONFIG 块不是可选的散文装饰。工具读取它来用 `TeamCreate` 自动创建团队。没有它，团队文件只是人类可读的，无法以程序方式激活。
- **负责人不在成员列表中**：负责人还必须作为成员出现，有自己的角色和职责。只"协调"而不做实质性工作的负责人浪费了一个名额。给负责人一个具体的审查或综合职责。

## 相关技能

- `create-skill` - 遵循相同元模式创建 SKILL.md 文件
- `create-agent` - 创建作为团队成员的智能体定义
- `commit-changes` - 提交新团队文件和注册表更新
