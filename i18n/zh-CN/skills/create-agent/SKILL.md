---
name: create-agent
description: >
  按照 agent-almanac 智能体模板和注册表规范创建新的智能体定义文件。涵盖角色
  设计、工具选择、技能分配、模型选择、前置元数据模式、必需章节、注册表集成
  和发现符号链接验证。适用于向库中添加新的专业智能体、为 Claude Code 子智能体
  定义角色，或创建具有精选技能和工具的领域专属助手。
locale: zh-CN
source_locale: en
source_commit: 6f65f316
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
  tags: meta, agent, creation, persona, agentskills
---

# 创建新智能体

定义具有聚焦目的、精选工具、分配技能并按智能体模板和注册表规范完整文档化的 Claude Code 子智能体角色。

## 适用场景

- 向库中添加尚未覆盖领域的新专业智能体
- 将反复出现的工作流或提示模式转换为可复用的智能体角色
- 创建具有精选技能和受限工具的领域专属助手
- 将过于宽泛的智能体拆分为聚焦的单一职责智能体
- 在组合多智能体团队之前设计新团队成员

## 输入

- **必需**：智能体名称（小写连字符格式，例如 `data-engineer`）
- **必需**：智能体主要目的的一行描述
- **必需**：说明智能体解决的问题的目的陈述
- **可选**：模型选择（默认：`sonnet`；备选：`opus`、`haiku`）
- **可选**：优先级（默认：`normal`；备选：`high`、`low`）
- **可选**：从 `skills/_registry.yml` 分配的技能列表
- **可选**：智能体所需的 MCP 服务器（例如 `r-mcptools`、`hf-mcp-server`）

## 步骤

### 第 1 步：设计智能体角色

为智能体选择清晰、聚焦的身份：

- **名称**：小写连字符格式，描述角色。以名词或领域限定词开头：`security-analyst`、`r-developer`、`tour-planner`。避免 `helper` 或 `assistant` 等通用名称。
- **目的**：一段解释此智能体解决的具体问题的说明。问：「此智能体能做现有智能体覆盖不到的什么？」
- **沟通风格**：考虑领域特点。技术智能体应精确且多引用。创意智能体可以更具探索性。合规智能体应正式且以审计为导向。

继续之前，检查与现有 53 个智能体的重叠：

```bash
grep -i "description:" agents/_registry.yml | grep -i "<your-domain-keywords>"
```

**预期结果：** 没有现有智能体覆盖相同细分领域。若现有智能体有部分重叠，考虑扩展而非创建新的。

**失败处理：** 若存在重叠显著的智能体，要么扩展该智能体的技能列表，要么缩小新智能体的范围以补充而非重复。

### 第 2 步：选择工具

选择智能体所需的最小工具集。遵循最小权限原则：

| 工具集 | 适用场景 | 示例智能体 |
|--------|---------|----------|
| `[Read, Grep, Glob]` | 只读分析、审查、审计 | code-reviewer、security-analyst、auditor |
| `[Read, Grep, Glob, WebFetch]` | 分析加外部查询 | senior-researcher |
| `[Read, Write, Edit, Bash, Grep, Glob]` | 完整开发——创建/修改代码 | r-developer、web-developer、devops-engineer |
| `[Read, Write, Edit, Bash, Grep, Glob, WebFetch, WebSearch]` | 开发加外部研究 | polymath、shapeshifter |

仅分析代码的智能体不要包含 `Bash`。除非智能体确实需要查询外部资源，否则不要包含 `WebFetch` 或 `WebSearch`。

**预期结果：** 工具列表只包含智能体在主要工作流中实际会用到的工具。

**失败处理：** 审查智能体的能力列表——若某能力不需要工具，删除该工具。

### 第 3 步：选择模型

根据任务复杂度选择模型：

- **`sonnet`**（默认）：大多数智能体。推理与速度的良好平衡。用于开发、审查、分析和标准工作流。
- **`opus`**：复杂推理、多步规划、细致判断。用于高级智能体、架构决策或需要深度领域专业知识的任务。
- **`haiku`**：简单、快速响应。用于做直接查找、格式化或模板填充的智能体。

**预期结果：** 模型与智能体主要用例的认知需求匹配。

**失败处理：** 若不确定，使用 `sonnet`。仅在测试发现推理质量不足时升级到 `opus`。

### 第 4 步：分配技能

浏览技能注册表，选择与智能体领域相关的技能：

```bash
# 列出某领域的所有技能
grep -A3 "domain-name:" skills/_registry.yml

# 按关键词搜索技能
grep -i "keyword" skills/_registry.yml
```

为前置元数据构建技能列表：

```yaml
skills:
  - skill-id-one
  - skill-id-two
  - skill-id-three
```

**重要说明**：所有智能体从注册表级 `default_skills` 字段自动继承默认技能（`meditate`、`heal`）。**不要**在智能体前置元数据中列出这些技能，除非它们是智能体方法论的核心（例如 `mystic` 智能体列出 `meditate`，因为冥想引导是其主要目的）。

**预期结果：** 技能列表包含 3-15 个 `skills/_registry.yml` 中存在的技能 ID。

**失败处理：** 验证每个技能 ID 存在：`grep "id: skill-name" skills/_registry.yml`。删除不匹配的任何 ID。

### 第 5 步：编写智能体文件

复制模板并填写前置元数据：

```bash
cp agents/_template.md agents/<agent-name>.md
```

填写 YAML 前置元数据：

```yaml
---
name: agent-name
description: One to two sentences describing primary capability and domain
tools: [Read, Write, Edit, Bash, Grep, Glob]
model: sonnet
version: "1.0.0"
author: Philipp Thoss
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [domain, specialty, relevant-keywords]
priority: normal
max_context_tokens: 200000
skills:
  - assigned-skill-one
  - assigned-skill-two
# Note: All agents inherit default skills (meditate, heal) from the registry.
# Only list them here if they are core to this agent's methodology.
# mcp_servers: []  # Uncomment and populate if MCP servers are needed
---
```

**预期结果：** YAML 前置元数据解析无误。所有必需字段（`name`、`description`、`tools`、`model`、`version`、`author`）存在。

**失败处理：** 验证 YAML 语法。常见问题：版本字符串缺少引号，缩进错误，工具列表中括号未闭合。

### 第 6 步：编写目的和能力

替换模板中的占位章节：

**目的**：一段解释此智能体解决的具体问题及其价值的说明。要具体——说明领域、工作流和结果。

**能力**：带粗体引导的要点列表。若智能体有许多能力，按类别分组：

```markdown
## Capabilities

- **Primary Capability**: What the agent does best
- **Secondary Capability**: Additional functionality
- **Tool Integration**: How it leverages its tools
```

**可用技能**：列出每个已分配技能及简短描述。使用原始技能 ID（斜杠命令名称）：

```markdown
## Available Skills

- `skill-id` - Brief description of what the skill does
```

**预期结果：** 目的具体（而非"帮助开发"），能力具体可验证，技能列表与前置元数据匹配。

**失败处理：** 若目的感觉模糊，回答：「用户会要求此智能体完成什么具体任务？」用那个答案作为目的。

### 第 7 步：编写使用场景和示例

提供 2-3 个使用场景，展示如何派生智能体：

```markdown
### Scenario 1: Primary Use Case
Brief description of the main scenario.

> "Use the agent-name agent to [specific task]."

### Scenario 2: Alternative Use Case
Description of another common use case.

> "Spawn the agent-name to [different task]."
```

添加 1-2 个展示用户请求和预期智能体行为的具体示例：

```markdown
### Example 1: Basic Usage
**User**: [Specific request]
**Agent**: [Expected response pattern and actions taken]
```

**预期结果：** 场景真实可信，示例展示实际价值，调用模式符合 Claude Code 规范。

**失败处理：** 在脑中测试这些示例——智能体真的能用其分配的工具和技能完成请求吗？

### 第 8 步：编写限制和参见

**限制**：3-5 个诚实的约束条件。智能体不能做什么、不应用于什么，或可能产生差结果的场景：

```markdown
## Limitations

- Cannot execute code in language X (no runtime available)
- Not suitable for tasks requiring Y — use Z agent instead
- Requires MCP server ABC to be running for full functionality
```

**参见**：交叉引用互补智能体、相关指南和相关团队：

```markdown
## See Also

- [complementary-agent](complementary-agent.md) - handles the X side of this workflow
- [relevant-guide](../guides/guide-name.md) - background knowledge for this domain
- [relevant-team](../teams/team-name.md) - team that includes this agent
```

**预期结果：** 限制诚实且具体。参见引用现有文件。

**失败处理：** 检查引用的文件是否存在：`ls agents/complementary-agent.md`。

### 第 9 步：添加到注册表

编辑 `agents/_registry.yml`，按字母顺序添加新智能体条目：

```yaml
  - id: agent-name
    path: agents/agent-name.md
    description: Same one-line description from frontmatter
    tags: [domain, specialty]
    priority: normal
    tools: [Read, Write, Edit, Bash, Grep, Glob]
    skills:
      - skill-id-one
      - skill-id-two
```

在文件顶部递增 `total_agents` 数量。

**预期结果：** 注册表条目与智能体文件前置元数据匹配。`total_agents` 等于实际智能体条目数量。

**失败处理：** 使用 `grep -c "^  - id:" agents/_registry.yml` 统计条目数量，并验证与 `total_agents` 是否匹配。

### 第 10 步：验证发现

Claude Code 从 `.claude/agents/` 目录发现智能体。在此存储库中，该目录是指向 `agents/` 的符号链接：

```bash
# 验证符号链接存在且可解析
ls -la .claude/agents/
readlink -f .claude/agents/<agent-name>.md
```

若 `.claude/agents/` 符号链接完整，无需额外操作——新智能体文件自动可被发现。

运行 README 自动化更新智能体 README：

```bash
npm run update-readmes
```

**预期结果：** `.claude/agents/<agent-name>.md` 解析到新智能体文件。`agents/README.md` 包含新智能体。

**失败处理：** 若符号链接损坏，重新创建：`ln -sf ../agents .claude/agents`。若 `npm run update-readmes` 失败，检查 `scripts/generate-readmes.js` 是否存在且 `js-yaml` 已安装。

## 验证清单

- [ ] 智能体文件存在于 `agents/<agent-name>.md`
- [ ] YAML 前置元数据解析无误
- [ ] 所有必需字段存在：`name`、`description`、`tools`、`model`、`version`、`author`
- [ ] `name` 字段与文件名（不含 `.md`）匹配
- [ ] 所有章节存在：Purpose、Capabilities、Available Skills、Usage Scenarios、Examples、Limitations、See Also
- [ ] 前置元数据中的技能在 `skills/_registry.yml` 中存在
- [ ] 默认技能（`meditate`、`heal`）未列出，除非是智能体方法论的核心
- [ ] 工具列表遵循最小权限原则
- [ ] 智能体已列入 `agents/_registry.yml`，路径正确且元数据匹配
- [ ] 注册表中的 `total_agents` 数量已更新
- [ ] `.claude/agents/` 符号链接解析到新智能体文件
- [ ] 与现有智能体无显著重叠

## 常见问题

- **工具过度分配**：当智能体只需要读取和分析时包含 `Bash`、`Write` 或 `WebFetch`。这违反了最小权限原则，可能导致意外副作用。从最小集开始，仅在某项能力需要时添加工具。
- **技能分配缺失或错误**：列出注册表中不存在的技能 ID，或完全忘记分配技能。在添加前始终用 `grep "id: skill-name" skills/_registry.yml` 验证每个技能 ID。
- **不必要地列出默认技能**：当 `meditate` 或 `heal` 已从注册表继承时将其添加到智能体前置元数据。仅在它们是智能体方法论的核心时才列出（例如 `mystic`、`alchemist`、`gardener`、`shaman`）。
- **范围与现有智能体重叠**：创建与 53 个现有智能体之一已覆盖功能重复的新智能体。始终先搜索注册表，考虑扩展现有智能体的技能列表。
- **目的和能力模糊**：写"帮助开发"而非"搭建包含完整结构、文档和 CI/CD 配置的 R 包"。具体性是使智能体有用且可被发现的关键。

## 相关技能

- `create-skill` - 创建 SKILL.md 文件的并行流程，而非智能体文件
- `create-team` - 将多个智能体组合为协调团队（计划中）
- `commit-changes` - 提交新智能体文件和注册表更新
