---
name: manage-memory
description: >
  整理、提取、修剪和验证 Claude Code 持久化记忆文件。涵盖将 MEMORY.md
  作为简洁索引、提取专题文件、检测过期条目、对比项目状态进行准确性验证，
  以及处理 200 行截断限制。适用于 MEMORY.md 接近 200 行限制时、一次会话
  产生值得保存的持久洞察后、某主题章节超过 10-15 行需要提取时，或项目
  状态变更导致记忆条目可能过期时。
locale: zh-CN
source_locale: en
source_commit: 025eea68
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
  tags: memory, claude-code, organization, maintenance, auto-memory
---

# 管理记忆

维护 Claude Code 的持久化记忆目录，使其跨会话保持准确、简洁和有效。MEMORY.md 在每次对话时加载到系统提示中——200 行之后的内容会被截断，因此该文件必须是指向专题文件获取详情的精简索引。

## 适用场景

- MEMORY.md 接近 200 行截断阈值
- 一次会话产生了值得保存的持久洞察（新模式、架构决策、调试解决方案）
- MEMORY.md 中某主题章节超过 10-15 行，应予以提取
- 项目状态变更（文件重命名、新增领域、更新数量），记忆条目可能过期
- 开始新工作领域时，检查是否已存在相关记忆
- 会话间的定期维护，保持记忆目录健康

## 输入

- **必需**：访问记忆目录（通常为 `~/.claude/projects/<project-path>/memory/`）
- **可选**：具体触发原因（例如"MEMORY.md 太长"、"刚完成重大重构"）
- **可选**：需要添加、更新或提取的主题

## 步骤

### 第 1 步：评估当前状态

读取 MEMORY.md 并列出记忆目录中的所有文件：

```bash
wc -l <memory-dir>/MEMORY.md
ls -la <memory-dir>/
```

对照 200 行限制检查行数。盘点现有专题文件。

**预期结果：** 清楚了解总行数、专题文件数量以及 MEMORY.md 中存在哪些章节。

**失败处理：** 若记忆目录不存在，创建它。若 MEMORY.md 不存在，创建一个最简版本，包含 `# Project Memory` 标题和 `## Topic Files` 章节。

### 第 2 步：识别过期条目

将记忆声明与当前项目状态进行对比。常见的过期模式：

1. **数量偏移**：添加或删除后发生变化的文件数量、技能数量、领域数量
2. **路径变更**：已移动、重命名或删除的文件或目录
3. **已过时的模式**：修复后不再需要的临时方案
4. **矛盾条目**：关于同一主题说法不一的两个条目

使用 Grep 快速核查关键声明：

```bash
# 示例：验证技能数量声明
grep -c "^      - id:" skills/_registry.yml
# 示例：验证文件是否仍然存在
ls path/claimed/in/memory.md
```

**预期结果：** 列出过期条目及其正确的当前值。

**失败处理：** 若无法验证某条声明（例如引用了无法检查的外部状态），保留该条目但添加 `(unverified)` 注释，而非静默保留可能错误的信息。

### 第 3 步：决定添加内容

对于新条目，写入前应用以下筛选标准：

1. **持久性**：下次会话时这还是真的吗？避免会话专属上下文（当前任务、进行中的工作、临时状态）。
2. **非重复**：CLAUDE.md 或项目文档中是否已涵盖此内容？不要重复——记忆用于记录其他地方未捕获的内容。
3. **已验证**：这是经过多次交互确认的，还是单次观察？单次观察应先与项目文档核实再写入。
4. **可操作**：了解这一点会改变行为方式吗？"天空是蓝色的"没什么用，"退出码 5 表示引号错误——使用临时文件"则改变了工作方式。

例外情况：若用户明确要求记住某事，立即保存——无需等待多次确认。

**预期结果：** 筛选后值得添加的条目列表，每条都满足持久性+非重复+已验证+可操作标准。

**失败处理：** 若不确定某条目是否值得保留，倾向于简短地保留在 MEMORY.md 中——日后修剪比重新发现容易。

### 第 4 步：提取过大的主题

当 MEMORY.md 中某章节超过约 10-15 行时，将其提取到专用专题文件：

1. 创建 `<memory-dir>/<topic-name>.md`，包含描述性标题
2. 将 MEMORY.md 中的详细内容移至专题文件
3. 在 MEMORY.md 中用 1-2 行摘要和链接替换该章节：

```markdown
## Topic Files
- [topic-name.md](topic-name.md) — Brief description of contents
```

专题文件命名规范：
- 使用小写连字符格式：`viz-architecture.md`，而非 `VizArchitecture.md`
- 按主题命名，而非按时间：`patterns.md`，而非 `session-2024-12.md`
- 归并相关条目：将"R 调试"和"WSL 特殊情况"合并到 `patterns.md`，而非每个事实创建一个文件

**预期结果：** MEMORY.md 保持在 200 行以内。每个专题文件可独立阅读，无需 MEMORY.md 上下文。

**失败处理：** 若专题文件内容不足 5 行，可能不值得提取——保留在 MEMORY.md 内联即可。

### 第 5 步：更新 MEMORY.md

应用所有更改：删除过期条目、添加新条目、更新数量，并确保"专题文件"章节列出所有专用文件。

MEMORY.md 结构应遵循以下模式：

```markdown
# Project Memory

## Section 1 — High-level context
- Bullet points, concise

## Section 2 — Another topic
- Key facts only

## Topic Files
- [file.md](file.md) — What it covers
```

指南：
- 每条要点最多 1-2 行
- 使用内联格式（`code`、**粗体**）提高可扫描性
- 最常需要的上下文放在前面
- 专题文件章节始终放在最后

**预期结果：** MEMORY.md 在 200 行以内，内容准确，所有专题文件的链接有效。

**失败处理：** 若提取后仍超过 200 行，找出使用频率最低的章节并提取。每个章节都是候选——即使是项目结构概述也可以提取到专题文件，仅留 1 行摘要。

### 第 6 步：验证完整性

进行最终检查：

1. **行数**：确认 MEMORY.md 在 200 行以内
2. **链接**：验证 MEMORY.md 中引用的每个专题文件均存在
3. **孤立文件**：检查未在 MEMORY.md 中引用的专题文件
4. **准确性**：对 2-3 个事实性声明与项目状态进行抽查

```bash
wc -l <memory-dir>/MEMORY.md
# 检查失效链接
for f in $(grep -oP '\[.*?\]\(\K[^)]+' <memory-dir>/MEMORY.md); do
  ls <memory-dir>/$f 2>/dev/null || echo "BROKEN: $f"
done
# 检查孤立文件
ls <memory-dir>/*.md | grep -v MEMORY.md
```

**预期结果：** 行数在 200 以内，无失效链接，无孤立文件，抽查的声明准确无误。

**失败处理：** 修复失效链接（更新或删除）。对于孤立文件，要么在 MEMORY.md 中添加引用，要么删除不再相关的文件。

## 验证清单

- [ ] MEMORY.md 在 200 行以内
- [ ] MEMORY.md 中引用的所有专题文件在磁盘上存在
- [ ] 记忆目录中无孤立 `.md` 文件（每个文件都从 MEMORY.md 链接）
- [ ] 任何记忆文件中无过期的数量或重命名路径
- [ ] 新条目满足持久性/非重复/已验证/可操作标准
- [ ] 专题文件有描述性标题且可独立阅读
- [ ] MEMORY.md 读起来是有用的快速参考，而非变更日志

## 常见问题

- **记忆文件污染**：将每次会话观察都写入记忆。大多数发现是会话专属的，无需持久化。写入前应用第 3 步的四个筛选标准。
- **数量过期**：更新代码但未更新记忆。数量（技能、智能体、领域、文件）会悄悄偏移。在信任记忆之前，始终对照事实来源验证数量。
- **按时间组织**：按"学到它的时间"而非"它涉及的内容"组织。基于主题的组织（`patterns.md`、`viz-architecture.md`）比基于日期的文件更有利于检索。
- **重复 CLAUDE.md 内容**：CLAUDE.md 是权威项目指令文件。记忆应捕获 CLAUDE.md 中没有的内容——调试洞察、架构决策、工作流偏好、跨项目模式。
- **过度提取**：为每个 3 行章节创建专题文件。仅在章节超过约 10-15 行时才提取。小章节保留内联完全没问题。
- **忘记 200 行限制**：MEMORY.md 在每次系统提示中加载。200 行之后的内容会被静默截断。若文件增长超过这个限制，底部内容实际上是不可见的。

## 相关技能

- `write-claude-md` — CLAUDE.md 捕获项目指令；记忆捕获跨会话学习
- `prune-agent-memory` — manage-memory 的逆操作：审计、分类和选择性遗忘存储的记忆
- `write-continue-here` — 为会话交接编写结构化续接文件；作为短期上下文桥梁补充记忆
- `read-continue-here` — 在会话开始时读取并执行续接文件；交接的消费端
- `create-skill` — 新技能可能产生值得记忆的模式
- `heal` — 自我修复可能作为整合步骤的一部分更新记忆
- `meditate` — 冥想会话可能浮现值得持久化的洞察
