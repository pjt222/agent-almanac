---
name: evolve-skill
description: >
  通过就地完善或创建高级变体来演进现有技能。涵盖评估当前技能、收集演进需求、
  选择范围（完善 vs. 变体）、应用更改、更新版本元数据，以及同步注册表和
  交叉引用。适用于技能步骤过时、用户反馈揭示不足、技能需要提升复杂度、
  需要在原版旁边创建高级变体，或相关技能被添加导致交叉引用过期时。
locale: zh-CN
source_locale: en
source_commit: b4dd42cd
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: general
  complexity: intermediate
  language: multi
  tags: meta, skill, agentskills, maintenance, evolution, versioning
---

# 演进现有技能

改进、扩展或创建最初用 `create-skill` 编写的技能的高级变体。此流程涵盖技能生命周期的维护方面：评估不足、应用有针对性的改进、更新版本，以及保持注册表和交叉引用同步。

## 适用场景

- 技能的步骤在工具变更后已过时或不完整
- 用户反馈揭示缺失的问题、不清晰的步骤或薄弱的验证
- 技能需要从基础升级到中级（或中级升级到高级）
- 需要在原版旁边创建高级变体（例如 `create-r-package` 和 `create-r-package-advanced`）
- 相关技能被添加或删除，交叉引用已过期

## 输入

- **必需**：要演进的现有 SKILL.md 路径
- **必需**：演进触发原因（反馈、工具变更、复杂度提升、新相关技能、发现的问题）
- **可选**：若要更改复杂度，目标复杂度级别（basic、intermediate、advanced）
- **可选**：是否创建高级变体而非就地完善（默认：就地完善）

## 步骤

### 第 1 步：评估当前技能

读取现有 SKILL.md，并对照质量检查清单评估每个章节：

| 章节 | 检查内容 | 常见问题 |
|------|---------|---------|
| 前置元数据 | 所有必需字段存在，`description` < 1024 字符 | 缺少 `tags`，`version` 过期 |
| When to Use | 3-5 个具体触发条件 | 触发条件模糊或重叠 |
| Inputs | 必需与可选明确分离 | 可选输入缺少默认值 |
| Procedure | 每步有代码 + Expected + On failure | 缺少 On failure 块，使用伪代码而非真实命令 |
| Validation | 每项为二元通过/失败 | 主观标准（"代码是干净的"） |
| Common Pitfalls | 3-6 个包含原因和规避方法 | 过于笼统（"小心 X"） |
| Related Skills | 2-5 个有效技能引用 | 指向已重命名/删除技能的过期引用 |

```bash
# 读取技能
cat skills/<skill-name>/SKILL.md

# 检查前置元数据解析
head -20 skills/<skill-name>/SKILL.md

# 验证相关技能是否仍然存在
grep -oP '`[\w-]+`' skills/<skill-name>/SKILL.md | sort -u
```

**预期结果：** 列出具体的不足、弱点或改进机会。

**失败处理：** 若 SKILL.md 不存在或没有前置元数据，此技能不适用——改用 `create-skill` 从头编写。

### 第 2 步：收集演进需求

识别并分类触发演进的原因：

| 触发原因 | 示例 | 典型范围 |
|---------|------|---------|
| 用户反馈 | "第 3 步不清楚" | 完善 |
| 工具变更 | 新 API 版本，命令已弃用 | 完善 |
| 发现问题 | 未记录的常见失败 | 完善 |
| 复杂度提升 | 技能对实际使用太浅 | 完善或变体 |
| 新相关技能 | 添加了相邻技能 | 完善（交叉引用） |
| 高级用例 | 高级用户需要更深入的覆盖 | 变体 |

在编辑前记录所需的具体更改，每项更改对应其目标章节。

**预期结果：** 具体的更改列表（例如"为第 4 步添加 On failure"、"添加新的第 6 步处理边界情况 X"、"更新 Related Skills 包含 `new-skill`"）。

**失败处理：** 若更改不明确，在继续之前向用户请求澄清。模糊的演进目标只会产生模糊的改进。

### 第 3 步：选择演进范围

使用此决策矩阵确定就地完善还是创建变体：

| 标准 | 完善（就地） | 高级变体（新技能） |
|------|------------|----------------|
| 技能 ID | 不变 | 新 ID：`<skill>-advanced` |
| 文件路径 | 同一 SKILL.md | 新目录 |
| 版本更新 | 补丁或次要 | 从 1.0 开始 |
| 复杂度 | 可能提高 | 高于原版 |
| 注册表 | 无新条目 | 添加新条目 |
| 符号链接 | 无变化 | 需要新符号链接 |
| 原始技能 | 直接修改 | 保持不变，获得交叉引用 |

**完善**：当改进质量、修复不足或添加适量新内容时选择。技能保持其身份。

**变体**：当演进版本会使长度翻倍、改变目标受众或需要实质上不同的输入时选择。原版保持不变用于更简单的用例。

**预期结果：** 明确的决定——完善或变体——及其理由。

**失败处理：** 若不确定，默认选择完善。以后总可以提取变体；反之则难以合并。

### 第 4 步：应用内容更改

#### 对于完善

直接编辑现有 SKILL.md：

```bash
# 打开编辑
# 添加/修改步骤
# 强化 Expected/On failure 对
# 添加表格或示例
# 更新 When to Use 触发条件
# 若范围改变则修改 Inputs
```

遵循以下编辑规则：
- 保留所有现有章节——添加内容，不删除章节
- 插入后保持步骤编号连续
- 每个新增或修改的步骤必须有 Expected 和 On failure
- 新问题添加到 Common Pitfalls 章节末尾
- 新相关技能添加到 Related Skills 章节末尾

#### 对于变体

```bash
# 创建变体目录
mkdir -p skills/<skill-name>-advanced/

# 以原版为基础复制
cp skills/<skill-name>/SKILL.md skills/<skill-name>-advanced/SKILL.md

# 编辑变体：
# - 将 `name` 改为 `<skill-name>-advanced`
# - 更新 `description` 反映高级范围
# - 提高 `complexity`（例如 intermediate → advanced）
# - 将 `version` 重置为 "1.0"
# - 为高级用例添加/扩展步骤
# - 在 Related Skills 中引用原版作为前置技能
```

**预期结果：** SKILL.md（完善版或新变体）通过第 1 步的评估检查清单。

**失败处理：** 若步骤编辑破坏了文档结构，使用 `git diff` 查看更改，并用 `git checkout -- <file>` 回退部分编辑。

### 第 5 步：更新版本和元数据

按语义版本规范更新前置元数据中的 `version` 字段：

| 更改类型 | 版本更新 | 示例 |
|---------|---------|------|
| 修正错别字、措辞澄清 | 补丁：1.0 → 1.1 | 修正第 3 步中不清晰的句子 |
| 新步骤、新问题、新表格 | 次要：1.0 → 2.0 | 添加了第 7 步处理边界情况 |
| 重构流程、更改输入 | 主要：1.0 → 2.0 | 从 5 步重组为 8 步 |

同时更新：
- 若范围扩展则更新 `complexity`（例如 basic → intermediate）
- 若覆盖范围改变则更新 `tags`
- 若技能范围有实质性不同则更新 `description`

**预期结果：** 前置元数据 `version` 反映更改的规模。新变体从 `"1.0"` 开始。

**失败处理：** 若忘记更新版本，下次演进时将无法区分当前状态与之前状态。提交前务必更新版本。

### 第 6 步：更新注册表和交叉引用

#### 对于完善

不需要注册表更改（路径未改变）。仅当其他技能的 Related Skills 发生变化时更新交叉引用：

```bash
# 检查是否有技能引用了已演进的技能
grep -r "<skill-name>" skills/*/SKILL.md
```

#### 对于变体

在 `skills/_registry.yml` 中添加新技能：

```yaml
- id: <skill-name>-advanced
  path: <skill-name>-advanced/SKILL.md
  complexity: advanced
  language: multi
  description: One-line description of the advanced variant
```

然后：
1. 在注册表顶部递增 `total_skills`
2. 在原始技能的 Related Skills 中添加指向变体的交叉引用
3. 在变体的 Related Skills 中添加指向原版的交叉引用
4. 为斜杠命令发现创建符号链接：

```bash
# 项目级
ln -s ../../skills/<skill-name>-advanced .claude/skills/<skill-name>-advanced

# 全局
ln -s /mnt/d/dev/p/agent-almanac/skills/<skill-name>-advanced ~/.claude/skills/<skill-name>-advanced
```

**预期结果：** 注册表 `total_skills` 与 `find skills -name SKILL.md | wc -l` 匹配。交叉引用是双向的。

**失败处理：** 若注册表数量有误，运行 `find skills -name SKILL.md | wc -l` 获取真实数量并更正注册表。对于失效符号链接，使用 `readlink -f` 调试解析。

### 第 7 步：验证演进后的技能

运行完整验证检查清单：

- [ ] SKILL.md 存在于预期路径
- [ ] YAML 前置元数据解析无误
- [ ] `version` 已更新（完善）或设为 "1.0"（变体）
- [ ] 所有章节存在：When to Use、Inputs、Procedure、Validation、Common Pitfalls、Related Skills
- [ ] 每个步骤都有 Expected 和 On failure 块
- [ ] Related Skills 引用有效、现存的技能名称
- [ ] 注册表条目存在且路径正确（仅变体）
- [ ] `total_skills` 数量与磁盘上的实际技能数匹配
- [ ] 符号链接解析正确（仅变体）
- [ ] `git diff` 显示无意外的原始内容删除

```bash
# 验证前置元数据
head -20 skills/<skill-name>/SKILL.md

# 统计磁盘上的技能数与注册表的对比
find skills -name SKILL.md | wc -l
grep total_skills skills/_registry.yml

# 检查符号链接（变体适用）
ls -la .claude/skills/<skill-name>-advanced
readlink -f .claude/skills/<skill-name>-advanced/SKILL.md

# 审查所有更改
git diff
```

**预期结果：** 所有检查清单项通过。演进后的技能已准备好提交。

**失败处理：** 逐项处理每个失败项。演进后最常见的问题是 `total_skills` 数量过期——始终最后验证它。

## 验证清单

- [ ] SKILL.md 存在且有有效的 YAML 前置元数据
- [ ] `version` 字段反映所做的更改
- [ ] 所有步骤都有 Expected 和 On failure 块
- [ ] Related Skills 引用有效（无失效的交叉引用）
- [ ] 注册表 `total_skills` 与磁盘上的实际数量匹配
- [ ] 对于变体：`_registry.yml` 中有正确路径的新条目
- [ ] 对于变体：在 `.claude/skills/` 和 `~/.claude/skills/` 创建了符号链接
- [ ] `git diff` 确认无意外的内容删除

## 常见问题

- **忘记更新版本**：没有版本更新，就无法追踪更改的内容和时间。提交前始终更新 `version`。
- **意外删除内容**：重构步骤时，很容易丢失 On failure 块或表格行。提交前始终审查 `git diff`。
- **过期的交叉引用**：创建变体时，原版和变体都需要相互引用。单向引用使关联图不完整。
- **注册表数量偏移**：创建变体后，`total_skills` 数量必须递增。遗忘会导致其他检查注册表的技能出现验证失败。
- **完善时范围蔓延**：使技能长度翻倍的完善应该是变体。若要添加超过 3 个新步骤，重新考虑第 3 步中的范围决策。
- **避免在 NTFS 挂载路径上使用 `git mv`（WSL）**：在 `/mnt/` 路径上，目录的 `git mv` 可能创建权限损坏（`d?????????`）。改用 `mkdir -p` + 复制文件 + `git rm` 旧路径。参见[环境指南](../../guides/setting-up-your-environment.md)故障排除章节。

## 相关技能

- `create-skill` — 创建新技能的基础；evolve-skill 假设最初遵循了此流程
- `commit-changes` — 用描述性消息提交演进后的技能
- `configure-git-repository` — 版本控制的技能更改
- `security-audit-codebase` — 审查演进后的技能中是否意外包含密钥
