---
name: evolve-team
description: >
  通过就地完善结构或创建专业化变体来演进现有团队组合。涵盖对照模板和协调
  模式评估当前团队、收集演进需求、选择范围（调整成员、更改协调模式、
  拆分/合并团队）、对团队文件和 CONFIG 块应用更改、更新版本元数据，以及
  同步注册表和交叉引用。适用于团队成员名单过时、协调模式不再适用、用户
  反馈揭示工作流缺口、需要在原版旁边创建专业化变体，或智能体库中的添加
  或删除影响团队组合时。
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
  tags: meta, team, evolution, coordination, maintenance
---

# 演进现有团队

改进、重构或创建最初用 `create-team` 编写的团队的专业化变体。此流程涵盖团队生命周期的维护方面：对照模板和协调模式评估不足、对组成和工作流应用有针对性的改进、更新版本，以及保持注册表和交叉引用同步。

## 适用场景

- 智能体被添加、删除或演进后，团队成员名单已过时
- 用户反馈揭示工作流瓶颈、不清晰的交接或缺失的视角
- 协调模式不再适合团队的实际工作流（例如 hub-and-spoke 应改为 parallel）
- 需要在原版旁边创建专业化变体（例如 `r-package-review` 和 `r-package-review-security-focused`）
- 团队成员职责重叠，需要更明确的边界
- CONFIG 块与散文描述或成员列表不同步
- 团队需要拆分为两个较小团队，或两个团队需要合并

## 输入

- **必需**：要演进的现有团队文件路径（例如 `teams/r-package-review.md`）
- **必需**：演进触发原因（反馈、新智能体、协调不匹配、范围重叠、性能问题、智能体演进）
- **可选**：目标版本更新幅度（patch、minor、major）
- **可选**：是否创建专业化变体而非就地完善（默认：就地完善）

## 步骤

### 第 1 步：评估当前团队

读取现有团队文件，并对照团队模板（`teams/_template.md`）评估每个章节：

| 章节 | 检查内容 | 常见问题 |
|------|---------|---------|
| 前置元数据 | 所有必需字段（`name`、`description`、`lead`、`version`、`author`、`coordination`、`members[]`） | 缺少 `tags`，`version` 过期，`coordination` 错误 |
| Purpose | 清晰的多智能体理由（至少两种不同专业） | 单个智能体即可处理 |
| Team Composition | 表格与前置元数据成员匹配，无重叠职责 | 过期表格，重复的关注领域 |
| Coordination Pattern | 与实际工作流匹配，有 ASCII 图 | 工作流的错误模式 |
| Task Decomposition | 按阶段分解，每个成员有具体任务 | 任务模糊，缺少阶段 |
| CONFIG Block | 标记间的有效 YAML，与前置元数据和散文匹配 | 不同步，缺少 `blocked_by`，无效 YAML |
| Usage Scenarios | 2-3 个真实的激活提示 | 占位文本 |
| Limitations | 3-5 个诚实的约束条件 | 缺失或过于笼统 |
| See Also | 指向成员智能体、相关团队、指南的有效链接 | 过期链接 |

```bash
# 读取团队文件
cat teams/<team-name>.md

# 验证所有成员智能体仍然存在
grep "id:" teams/<team-name>.md | while read line; do
  agent=$(echo "$line" | grep -oP '(?<=id: )[\w-]+')
  grep "id: $agent" agents/_registry.yml || echo "MISSING: $agent"
done

# 检查团队是否被任何指南引用
grep -r "<team-name>" guides/*.md
```

**预期结果：** 列出具体的不足、弱点或改进机会，按章节组织。

**失败处理：** 若团队文件不存在或没有前置元数据，此技能不适用——改用 `create-team` 从头编写。

### 第 2 步：收集演进需求

识别并分类触发演进的原因：

| 触发原因 | 示例 | 典型范围 |
|---------|------|---------|
| 用户反馈 | "审查耗时太长，智能体重复劳动" | 优化职责或更改模式 |
| 新智能体可用 | 创建了 `api-security-analyst` 智能体 | 添加成员 |
| 智能体演进 | `code-reviewer` 获得了新技能 | 更新成员职责 |
| 智能体删除 | `deprecated-agent` 已退役 | 删除成员，重新分配任务 |
| 协调不匹配 | 顺序团队有独立子任务 | 改为 parallel |
| 范围扩展 | 团队需要覆盖部署，而非仅审查 | 添加成员或创建变体 |
| 团队太大 | 6+ 成员导致协调开销 | 拆分为两个团队 |
| 团队太小 | 单个成员承担大部分工作 | 与另一个团队合并或添加成员 |

在编辑前记录所需的具体更改：

```
- 前置元数据：添加新成员 `api-security-analyst`，角色为"API Security Reviewer"
- Team Composition：在组合表中添加行
- Task Decomposition：在执行阶段添加 API 安全审查任务
- CONFIG block：添加成员和任务条目
- See Also：添加新智能体文件链接
```

**预期结果：** 具体的更改列表，每项映射到团队文件的特定章节。

**失败处理：** 若更改不明确，在继续之前向用户请求澄清。模糊的演进目标只会产生模糊的改进。

### 第 3 步：选择演进范围

使用此决策矩阵确定就地完善还是创建变体：

| 标准 | 完善（就地） | 专业化变体（新团队） |
|------|------------|----------------|
| 团队 ID | 不变 | 新 ID：`<team>-<specialty>` |
| 文件路径 | 同一 `.md` 文件 | `teams/` 中的新文件 |
| 版本更新 | patch 或 minor | 从 1.0.0 开始 |
| 协调 | 可能改变 | 可能与原版不同 |
| 注册表 | 更新现有条目 | 添加新条目 |
| 原始团队 | 直接修改 | 保持不变，获得 See Also 交叉引用 |

**完善**：当调整成员、优化职责、修复 CONFIG 块或更改协调模式时选择。团队保持其身份。

**变体**：当演进版本会服务于实质上不同的用例、需要不同的协调模式或针对不同受众时选择。原版保持不变用于其现有用例。

其他范围决策：

| 情况 | 行动 |
|------|------|
| 团队有 6+ 成员且速度慢 | 拆分为两个聚焦团队 |
| 两个 2 人团队涵盖相邻领域 | 合并为一个 3-4 人团队 |
| 团队协调模式错误 | 完善——就地更改模式 |
| 团队需要完全不同的负责人 | 若负责人存在则完善；若不存在则先创建智能体 |

**预期结果：** 明确的决定——完善、变体、拆分或合并——及其理由。

**失败处理：** 若不确定，默认选择完善。拆分或合并团队影响范围更大，应与用户确认。

### 第 4 步：对团队文件应用更改

#### 对于完善

直接编辑现有团队文件。保持所有引用团队组成章节间的一致性：

1. **前置元数据 `members[]`**：添加、删除或更新成员条目（每个包含 `id`、`role`、`responsibilities`）
2. **Team Composition 表格**：必须与前置元数据成员完全匹配
3. **Coordination Pattern**：若模式改变，更新散文和 ASCII 图
4. **Task Decomposition**：修改阶段和每个成员的任务以反映新组成
5. **CONFIG block**：更新 `members` 和 `tasks` 列表以匹配（见第 5 步）
6. **Usage Scenarios**：若团队激活触发器改变，修改
7. **Limitations**：更新以反映新约束或删除已解决的约束
8. **See Also**：更新智能体链接，添加对新相关团队或指南的引用

遵循以下编辑规则：
- 保留所有现有章节——添加内容，不删除章节
- 添加成员时，在以下所有位置添加：前置元数据、组成表格、任务分解和 CONFIG 块
- 删除成员时，从以上所有位置删除，并重新分配其任务
- 验证每个成员智能体存在：`grep "id: agent-name" agents/_registry.yml`
- 在成员列表中保留负责人——负责人始终是成员

#### 对于变体

```bash
# 以原版为基础复制
cp teams/<team-name>.md teams/<team-name>-<specialty>.md

# 编辑变体：
# - 将 `name` 改为 `<team-name>-<specialty>`
# - 更新 `description` 反映专业化范围
# - 若需要调整 `coordination` 模式
# - 将 `version` 重置为 "1.0.0"
# - 为专业化用例修改成员、任务和 CONFIG 块
# - 在 See Also 中引用原版作为通用替代
```

**预期结果：** 团队文件（完善版或新变体）通过第 1 步的评估检查清单，所有章节内部一致。

**失败处理：** 若编辑破坏内部一致性（例如 CONFIG 块列出的成员不在前置元数据中），对比前置元数据 `members[]` 与 Team Composition 表格、Task Decomposition 和 CONFIG 块以找出不匹配。

### 第 5 步：更新 CONFIG 块

`<!-- CONFIG:START -->` 和 `<!-- CONFIG:END -->` 之间的 CONFIG 块必须与散文章节保持同步。任何成员或任务更改后：

1. 验证 CONFIG `members` 中的每个 `agent` 与前置元数据中的成员匹配
2. 验证 CONFIG `tasks` 中的每个 `assignee` 与成员智能体 id 匹配
3. 若任务顺序改变，更新 `blocked_by` 依赖
4. 确保综合/最终任务引用所有前置任务

```yaml
team:
  name: <team-name>
  lead: <lead-agent>
  coordination: <pattern>
  members:
    - agent: <agent-id>
      role: <role-title>
      subagent_type: <agent-id>
  tasks:
    - name: <task-name>
      assignee: <agent-id>
      description: <one-line>
    - name: synthesize-results
      assignee: <lead-agent>
      description: Collect and synthesize all member outputs
      blocked_by: [<prior-task-names>]
```

**预期结果：** CONFIG YAML 有效，所有智能体和任务与文件其余部分一致，`blocked_by` 形成有效的 DAG。

**失败处理：** 单独解析 CONFIG 块 YAML 以找出语法错误。交叉检查每个 `assignee` 与 `members` 列表。

### 第 6 步：更新版本和元数据

按语义版本控制更新前置元数据中的 `version` 字段：

| 更改类型 | 版本更新 | 示例 |
|---------|---------|------|
| 措辞修正、See Also 更新 | Patch：1.0.0 → 1.0.1 | 修正了过期的智能体链接 |
| 添加新成员、修改任务 | Minor：1.0.0 → 1.1.0 | 添加了 security-analyst 成员 |
| 协调模式改变、团队重构 | Major：1.0.0 → 2.0.0 | 从 hub-and-spoke 改为 parallel |

同时更新：
- `updated` 日期为当前日期
- `tags`（若团队的领域覆盖改变）
- `description`（若团队目的有实质性不同）
- `coordination`（若模式改变）

**预期结果：** 前置元数据 `version` 和 `updated` 反映更改的幅度和日期。新变体从 `"1.0.0"` 开始。

**失败处理：** 若忘记更新版本，下次演进时将无法区分当前状态与之前状态。提交前务必更新版本。

### 第 7 步：更新注册表和交叉引用

#### 对于完善

更新 `teams/_registry.yml` 中的现有条目以匹配修订的前置元数据：

```bash
# 找到团队的注册表条目
grep -A 10 "id: <team-name>" teams/_registry.yml
```

更新 `description`、`lead`、`members` 和 `coordination` 字段以匹配团队文件。无需更改数量。

#### 对于变体

在 `teams/_registry.yml` 中添加新团队：

```yaml
- id: <team-name>-<specialty>
  path: <team-name>-<specialty>.md
  lead: <lead-agent>
  members: [agent-1, agent-2, agent-3]
  coordination: <pattern>
  description: One-line description of the specialized variant
```

然后：
1. 在注册表顶部递增 `total_teams`
2. 在原始团队的 See Also 中添加指向变体的交叉引用
3. 在变体的 See Also 中添加指向原版的交叉引用

运行 README 自动化：

```bash
npm run update-readmes
```

**预期结果：** 注册表条目与团队文件前置元数据匹配。`npm run update-readmes` 以 0 退出。对于变体，`total_teams` 等于实际团队条目数量。

**失败处理：** 若注册表数量有误，使用 `grep -c "^  - id:" teams/_registry.yml` 统计条目数量并更正。若 README 自动化失败，验证 `package.json` 存在且 `js-yaml` 已安装。

### 第 8 步：验证演进后的团队

运行完整验证检查清单：

- [ ] 团队文件存在于预期路径
- [ ] YAML 前置元数据解析无误
- [ ] `version` 已更新（完善）或设为 "1.0.0"（变体）
- [ ] `updated` 日期反映今天
- [ ] 所有必需章节存在：Purpose、Team Composition、Coordination Pattern、Task Decomposition、Configuration、Usage Scenarios、Limitations、See Also
- [ ] 前置元数据 `members[]` 与 Team Composition 表格匹配
- [ ] CONFIG 块成员与前置元数据成员匹配
- [ ] CONFIG 块任务有有效的 assignees 和 `blocked_by` 引用
- [ ] 所有成员智能体 ID 存在于 `agents/_registry.yml`
- [ ] 负责人智能体出现在成员列表中
- [ ] 没有两个成员共有相同的主要职责
- [ ] 注册表条目存在且与前置元数据匹配
- [ ] 对于变体：`total_teams` 数量与磁盘上的实际数量匹配
- [ ] 交叉引用是双向的（原版 ↔ 变体）
- [ ] `git diff` 显示无意外的原始内容删除

```bash
# 验证前置元数据
head -25 teams/<team-name>.md

# 验证所有成员智能体存在
for agent in agent-a agent-b agent-c; do
  grep "id: $agent" agents/_registry.yml
done

# 统计磁盘上的团队数与注册表的对比
ls teams/*.md | grep -v template | wc -l
grep total_teams teams/_registry.yml

# 审查所有更改
git diff
```

**预期结果：** 所有检查清单项通过。演进后的团队已准备好提交。

**失败处理：** 逐项处理每个失败项。演进后最常见的问题是 CONFIG 块偏移（成员或任务与散文不匹配）和忘记更新 `updated` 日期。

## 验证清单

- [ ] 团队文件存在且有有效的 YAML 前置元数据
- [ ] `version` 字段反映所做的更改
- [ ] `updated` 日期为当前日期
- [ ] 所有章节存在且内部一致
- [ ] 前置元数据 `members[]`、Team Composition 表格和 CONFIG 块同步
- [ ] 所有成员智能体 ID 存在于 `agents/_registry.yml`
- [ ] 负责人智能体在成员列表中
- [ ] CONFIG 块 YAML 有效且可解析
- [ ] 注册表条目与团队文件匹配
- [ ] 对于变体：`teams/_registry.yml` 中有正确路径的新条目
- [ ] 对于变体：`total_teams` 数量已更新
- [ ] 交叉引用有效（See Also 中无失效链接）
- [ ] `git diff` 确认无意外的内容删除

## 常见问题

- **CONFIG 块偏移**：CONFIG 块、前置元数据和散文章节必须就成员和任务达成一致。更新其中一个而不更新其他是最常见的团队演进错误。每次更改后，交叉检查这三者。
- **忘记更新版本**：没有版本更新，就无法追踪更改的内容和时间。提交前始终更新 `version` 和 `updated`。
- **孤立的成员引用**：删除成员时，Task Decomposition 和 CONFIG 块中的任务必须重新分配或删除。保留孤立的 assignees 导致激活失败。
- **演进后协调模式错误**：向顺序团队添加可并行的成员，或使 hub-and-spoke 团队中的智能体需要彼此的输出。任何结构性更改后，重新评估 `create-team` 第 4 步中的模式决策。
- **添加成员后团队太大**：超过 5 个成员的团队协调困难。若演进使团队超过 5 人，考虑拆分为两个聚焦团队。
- **创建变体后 See Also 过期**：创建变体时，原版和变体都需要相互引用。单向引用使关联图不完整。

## 相关技能

- `create-team` — 创建新团队的基础；evolve-team 假设最初遵循了此流程
- `evolve-skill` — 演进 SKILL.md 文件的并行流程
- `evolve-agent` — 演进智能体定义的并行流程
- `commit-changes` — 用描述性消息提交演进后的团队
