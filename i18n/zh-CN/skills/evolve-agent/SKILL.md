---
name: evolve-agent
description: >
  通过就地完善角色或创建高级变体来演进现有智能体定义。涵盖对照最佳实践
  评估当前智能体、收集演进需求、选择范围（完善 vs. 变体）、对技能、工具、
  能力和限制应用更改、更新版本元数据，以及同步注册表和交叉引用。适用于
  智能体技能列表过时、用户反馈揭示能力缺口、工具需求发生变化、需要在原版
  旁边创建高级变体，或智能体在实际使用后需要范围优化时。
locale: zh-CN
source_locale: en
source_commit: 971b2bdc
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
  tags: meta, agent, evolution, maintenance, versioning
---

# 演进现有智能体

改进、扩展或创建最初用 `create-agent` 编写的智能体的高级变体。此流程涵盖智能体生命周期的维护方面：对照最佳实践评估不足、对角色定义应用有针对性的改进、更新版本，以及保持注册表和交叉引用同步。

## 适用场景

- 库中添加新技能后，智能体的技能列表已过时
- 用户反馈揭示缺失的能力、不清晰的目的或薄弱的示例
- 工具需求发生变化（新的 MCP 服务器、工具被删除、需要减少权限）
- 智能体的范围需要优化——与另一个智能体重叠或范围太宽
- 需要在原版旁边创建高级变体（例如 `r-developer` 和 `r-developer-advanced`）
- 相关智能体或团队被添加，See Also 中的交叉引用已过期

## 输入

- **必需**：要演进的现有智能体文件路径（例如 `agents/r-developer.md`）
- **必需**：演进触发原因（反馈、新技能、工具变更、范围重叠、团队集成、发现的限制）
- **可选**：目标版本更新幅度（patch、minor、major）
- **可选**：是否创建高级变体而非就地完善（默认：就地完善）

## 步骤

### 第 1 步：评估当前智能体

读取现有智能体文件，并对照 `guides/agent-best-practices.md` 的质量检查清单评估每个章节：

| 章节 | 检查内容 | 常见问题 |
|------|---------|---------|
| 前置元数据 | 所有必需字段存在（`name`、`description`、`tools`、`model`、`version`、`author`） | 缺少 `tags`，`version` 过期，`priority` 错误 |
| Purpose | 具体问题陈述，而非"帮助 X" | 模糊或与另一个智能体重叠 |
| Capabilities | 带粗体引导的具体可验证能力 | 笼统（"处理开发"），无分组 |
| Available Skills | 与前置元数据 `skills` 列表匹配，所有 ID 存在于注册表 | 过期 ID，缺少新技能，不必要地列出默认技能 |
| Usage Scenarios | 2-3 个带调用模式的真实场景 | 占位文本，不真实的示例 |
| Examples | 展示用户请求和智能体行为 | 缺失或过于简单的示例 |
| Limitations | 3-5 个诚实的约束条件 | 太少、太模糊或完全缺失 |
| See Also | 指向智能体、指南、团队的有效交叉引用 | 指向已重命名或删除文件的过期链接 |

```bash
# 读取智能体文件
cat agents/<agent-name>.md

# 检查前置元数据解析
head -20 agents/<agent-name>.md

# 验证前置元数据中的技能存在于注册表
grep "skills:" -A 20 agents/<agent-name>.md

# 检查智能体是否被任何团队引用
grep -r "<agent-name>" teams/*.md
```

**预期结果：** 列出具体的不足、弱点或改进机会，按章节组织。

**失败处理：** 若智能体文件不存在或没有前置元数据，此技能不适用——改用 `create-agent` 从头编写。

### 第 2 步：收集演进需求

识别并分类触发演进的原因：

| 触发原因 | 示例 | 典型范围 |
|---------|------|---------|
| 用户反馈 | "智能体在审查中遗漏了 XSS" | 添加技能或能力 |
| 新技能可用 | 库添加了 `analyze-api-security` | 更新技能列表 |
| 工具变更 | 新 MCP 服务器可用 | 添加到 tools/mcp_servers |
| 范围重叠 | 两个智能体都声称"代码审查" | 优化目的和限制 |
| 团队集成 | 智能体被添加到新团队 | 更新 See Also，验证能力 |
| 模型升级 | 任务需要更深入的推理 | 更改模型字段 |
| 减少权限 | 智能体有 Bash 但只读取文件 | 删除不必要的工具 |

在编辑前记录所需的具体更改，每项更改对应特定章节：

```
- 前置元数据：将 `new-skill-id` 添加到技能列表
- Capabilities：添加"API Security Analysis"能力
- Available Skills：添加 `new-skill-id` 及描述
- Limitations：删除关于缺少技能的过时限制
- See Also：添加包含此智能体的新团队链接
```

**预期结果：** 具体的更改列表，每项映射到智能体文件的特定章节。

**失败处理：** 若更改不明确，在继续之前向用户请求澄清。模糊的演进目标只会产生模糊的改进。

### 第 3 步：选择演进范围

使用此决策矩阵确定就地完善还是创建变体：

| 标准 | 完善（就地） | 高级变体（新智能体） |
|------|------------|----------------|
| 智能体 ID | 不变 | 新 ID：`<agent>-advanced` 或 `<agent>-<specialty>` |
| 文件路径 | 同一 `.md` 文件 | `agents/` 中的新文件 |
| 版本更新 | patch 或 minor | 从 1.0.0 开始 |
| 模型 | 可能改变 | 通常更高（例如 sonnet → opus） |
| 注册表 | 更新现有条目 | 添加新条目 |
| 原始智能体 | 直接修改 | 保持不变，获得 See Also 交叉引用 |

**完善**：当更新技能、修复文档、优化范围或调整工具时选择。智能体保持其身份。

**变体**：当演进版本会服务于实质上不同的受众、需要不同模型或添加会使原版范围过宽的能力时选择。原版保持不变用于更简单的用例。

**预期结果：** 明确的决定——完善或变体——及其理由。

**失败处理：** 若不确定，默认选择完善。以后总可以提取变体；反之则更难合并。

### 第 4 步：对智能体文件应用更改

#### 对于完善

直接编辑现有智能体文件：

- **前置元数据**：根据需要更新 `skills`、`tools`、`tags`、`model`、`priority`、`mcp_servers`
- **Purpose/Capabilities**：修改以反映新范围或添加的功能
- **Available Skills**：添加带描述的新技能，删除已弃用的技能
- **Usage Scenarios**：添加或修改场景以演示新能力
- **Limitations**：删除不再适用的约束，添加新的诚实约束
- **See Also**：更新交叉引用以反映当前智能体/团队/指南格局

遵循以下编辑规则：
- 保留所有现有章节——添加内容，不删除章节
- 保持 Available Skills 章节与前置元数据 `skills` 列表同步
- 不要将默认技能（`meditate`、`heal`）添加到前置元数据，除非它们是智能体方法论的核心
- 验证每个技能 ID 存在：`grep "id: skill-name" skills/_registry.yml`

#### 对于变体

```bash
# 以原版为基础复制
cp agents/<agent-name>.md agents/<agent-name>-advanced.md

# 编辑变体：
# - 将 `name` 改为 `<agent-name>-advanced`
# - 更新 `description` 反映高级范围
# - 若需要提高 `model`（例如 sonnet → opus）
# - 将 `version` 重置为 "1.0.0"
# - 为高级用例扩展技能、能力和示例
# - 在 See Also 中引用原版作为更简单的替代
```

**预期结果：** 智能体文件（完善版或新变体）通过第 1 步的评估检查清单。

**失败处理：** 若编辑破坏文档结构，使用 `git diff` 查看更改，并用 `git checkout -- <file>` 回退部分编辑。

### 第 4.5 步：同步已翻译的变体

> **当存在翻译时必须执行。** 本步骤同时适用于人类作者和遵循此流程的 AI 智能体。不要跳过——过期的 `source_commit` 值会导致 `npm run validate:translations` 在所有语言环境中报告错误的过期警告。

检查此已演进智能体是否存在翻译，并将其更新以反映新的源状态：

```bash
# 检查是否存在翻译
ls i18n/*/agents/<agent-name>.md 2>/dev/null
```

#### 若存在翻译

1. 获取当前源提交哈希：

```bash
SOURCE_COMMIT=$(git rev-parse HEAD)
```

2. 更新每个已翻译文件前置元数据中的 `source_commit`：

```bash
for locale_file in i18n/*/agents/<agent-name>.md; do
  sed -i "s/^source_commit: .*/source_commit: $SOURCE_COMMIT/" "$locale_file"
done
```

3. 在提交消息中标记受影响的语言环境，以标记文件需要重新翻译：

```
evolve-agent(<agent-name>): <更改说明>

Translations flagged for re-sync: de, zh-CN, ja, es
Changed sections: <列出发生变化的章节>
```

4. 重新生成翻译状态文件：

```bash
npm run translation:status
```

#### 若不存在翻译

无需操作。继续第 5 步。

#### 针对变体

推迟新变体的翻译，直到变体稳定（1-2 个版本）。翻译 v1.0 的变体在到达 v1.2 时可能已大幅变化，属于浪费精力。在变体至少经过一次完善之后再添加翻译。

**预期结果：** 所有已翻译文件的 `source_commit` 更新到当前提交。提交消息注明哪些语言环境需要重新翻译，以及哪些章节发生了变化。`npm run translation:status` 以 0 退出。

**失败处理：** 若 `sed` 无法匹配前置元数据字段，已翻译文件可能采用了非标准格式。手动打开并确认其 YAML 前置元数据中包含 `source_commit`。若字段缺失，该文件未被正确生成——使用 `npm run translate:scaffold -- agents` 重新生成。

### 第 5 步：更新版本和元数据

按语义版本控制更新前置元数据中的 `version` 字段：

| 更改类型 | 版本更新 | 示例 |
|---------|---------|------|
| 修正错别字、措辞澄清 | Patch：1.0.0 → 1.0.1 | 修正了不清晰的限制 |
| 新技能添加、能力扩展 | Minor：1.0.0 → 1.1.0 | 添加了库中的 3 个新技能 |
| 重构目的、更改模型 | Major：1.0.0 → 2.0.0 | 缩小范围，升级到 opus |

同时更新：
- `updated` 日期为当前日期
- `tags`（若智能体的领域覆盖改变）
- `description`（若目的有实质性不同）
- `priority`（若智能体相对其他智能体的重要性改变）

**预期结果：** 前置元数据 `version` 和 `updated` 反映更改的幅度和日期。新变体从 `"1.0.0"` 开始。

**失败处理：** 若忘记更新版本，下次演进时将无法区分当前状态与之前状态。提交前务必更新版本。

### 第 6 步：更新注册表和交叉引用

#### 对于完善

更新 `agents/_registry.yml` 中的现有条目以匹配修订的前置元数据：

```bash
# 找到智能体的注册表条目
grep -A 10 "id: <agent-name>" agents/_registry.yml
```

更新 `description`、`tags`、`tools` 和 `skills` 字段以匹配智能体文件。无需更改数量。

若智能体的能力或名称发生变化，更新其他文件中的交叉引用：

```bash
# 检查是否有团队引用此智能体
grep -r "<agent-name>" teams/*.md

# 检查是否有指南引用此智能体
grep -r "<agent-name>" guides/*.md
```

#### 对于变体

在 `agents/_registry.yml` 中按字母顺序位置添加新智能体：

```yaml
  - id: <agent-name>-advanced
    path: agents/<agent-name>-advanced.md
    description: One-line description of the advanced variant
    tags: [domain, specialty, advanced]
    priority: normal
    tools: [Read, Write, Edit, Bash, Grep, Glob]
    skills:
      - skill-id-one
      - skill-id-two
```

然后：
1. 在注册表顶部递增 `total_agents`
2. 在原始智能体的 See Also 中添加指向变体的交叉引用
3. 在变体的 See Also 中添加指向原版的交叉引用
4. `.claude/agents/` 到 `agents/` 的符号链接意味着变体自动可被发现

**预期结果：** 注册表条目与智能体文件前置元数据匹配。对于变体，`total_agents` 等于实际智能体条目数量。

**失败处理：** 使用 `grep -c "^  - id:" agents/_registry.yml` 统计条目数量，并验证与 `total_agents` 是否匹配。

### 第 7 步：验证演进后的智能体

运行完整验证检查清单：

- [ ] 智能体文件存在于预期路径
- [ ] YAML 前置元数据解析无误
- [ ] `version` 已更新（完善）或设为 "1.0.0"（变体）
- [ ] `updated` 日期反映今天
- [ ] 所有必需章节存在：Purpose、Capabilities、Available Skills、Usage Scenarios、Examples、Limitations、See Also
- [ ] 前置元数据中的技能与 Available Skills 章节匹配
- [ ] 所有技能 ID 存在于 `skills/_registry.yml`
- [ ] 默认技能（`meditate`、`heal`）未列出，除非是方法论的核心
- [ ] 工具列表遵循最小权限原则
- [ ] 注册表条目存在且与前置元数据匹配
- [ ] 对于变体：`total_agents` 数量与磁盘上的实际数量匹配
- [ ] 交叉引用是双向的（原版 ↔ 变体）
- [ ] `git diff` 显示无意外的原始内容删除

```bash
# 验证前置元数据
head -20 agents/<agent-name>.md

# 检查技能存在
for skill in skill-a skill-b; do
  grep "id: $skill" skills/_registry.yml
done

# 统计磁盘上的智能体数与注册表的对比
ls agents/*.md | grep -v template | wc -l
grep total_agents agents/_registry.yml

# 审查所有更改
git diff
```

**预期结果：** 所有检查清单项通过。演进后的智能体已准备好提交。

**失败处理：** 逐项处理每个失败项。演进后最常见的问题是 Available Skills 章节中的过期技能 ID 和忘记更新 `updated` 日期。

## 验证清单

- [ ] 智能体文件存在且有有效的 YAML 前置元数据
- [ ] `version` 字段反映所做的更改
- [ ] `updated` 日期为当前日期
- [ ] 所有章节存在且内部一致
- [ ] 前置元数据 `skills` 数组与 Available Skills 章节匹配
- [ ] 所有技能 ID 存在于 `skills/_registry.yml`
- [ ] 默认技能未不必要地列出
- [ ] 注册表条目与智能体文件匹配
- [ ] 对于变体：`agents/_registry.yml` 中有正确路径的新条目
- [ ] 对于变体：`total_agents` 数量已更新
- [ ] 交叉引用有效（See Also 中无失效链接）
- [ ] `git diff` 确认无意外的内容删除

## 常见问题

- **忘记更新版本**：没有版本更新，就无法追踪更改的内容和时间。提交前始终更新 `version` 和 `updated`。
- **技能列表偏移**：前置元数据 `skills` 数组和 `## Available Skills` 章节必须保持同步。更新其中一个而不更新另一个会给人和工具带来混淆。
- **不必要地列出默认技能**：当 `meditate` 或 `heal` 已从注册表继承时将其添加到前置元数据。仅在它们是智能体方法论的核心时才列出（例如 `mystic`、`alchemist`）。
- **演进中工具过度分配**：在演进期间"以防万一"添加 `Bash` 或 `WebFetch`。每次工具添加都应由特定的新能力所需来证明。
- **创建变体后 See Also 过期**：创建变体时，原版和变体都需要相互引用。单向引用使关联图不完整。
- **注册表条目未更新**：更改智能体的技能、工具或描述后，`agents/_registry.yml` 条目必须更新以匹配。过期的注册表条目导致发现和工具失败。

## 相关技能

- `create-agent` — 创建新智能体的基础；evolve-agent 假设最初遵循了此流程
- `evolve-skill` — 演进 SKILL.md 文件的并行流程
- `commit-changes` — 用描述性消息提交演进后的智能体
