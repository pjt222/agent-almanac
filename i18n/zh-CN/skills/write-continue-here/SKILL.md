---
name: write-continue-here
description: >
  写一个 CONTINUE_HERE.md 文件捕捉当前会话状态，使新的 Claude Code 会话
  能从此次中断处接续。涵盖评估近期工作、用 objective、completed、in-progress、
  next-steps 和 context 部分构造延续文件，并验证文件可执行。在结束有未完成
  工作的会话、在会话间交接上下文，或保留 git 单独无法捕获的任务状态时使用。
license: MIT
allowed-tools: Read Write Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: basic
  language: multi
  tags: session, continuity, handoff, context, workflow, write
  locale: zh-CN
  source_locale: en
  source_commit: 025eea68
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# 写 Continue Here

写结构化延续文件，使下次会话以完整上下文开始。

## 适用场景

- 结束仍有进行中工作的会话
- 在会话间交接复杂任务
- 保留 git 无法捕获的意图、失败方法和下一步
- 在任务中关闭 Claude Code 之前

## 输入

- **必需**：带近期工作要汇总的活跃会话
- **可选**：关于在交接中强调什么的具体指令

## 步骤

### 第 1 步：评估会话状态

收集关于近期工作的事实：

```bash
git log --oneline -5
git status
git diff --stat
```

审查对话上下文：目标是什么、已完成什么、什么部分完成、什么尝试且失败、做了哪些决策。

**预期结果：** 对当前任务状态的清晰理解 —— 完成项、进行中项和计划下一步。

**失败处理：** 若不在 git 仓库，跳过 git 命令。延续文件仍可捕获对话上下文和任务状态。

### 第 2 步：写 CONTINUE_HERE.md

将文件写到项目根，使用以下结构。每个部分必须包含可执行内容，非占位符。

```markdown
# Continue Here

> Last updated: YYYY-MM-DDTHH:MM:SSZ | Branch: current-branch-name

## Objective
One-paragraph description of what we are trying to accomplish and why.

## Completed
- [x] Finished item with key file paths (e.g., `src/feature.R`)
- [x] Decisions made and their rationale

## In Progress
- [ ] Partially complete work — describe current state (branch, file:line)
- [ ] Known issues with partial work

## Next Steps
1. Immediate next action (most important)
2. Subsequent actions in priority order
3. **[USER]** Items needing user input or decision

## Context
- Failed approaches and why they did not work
- Key constraints or trade-offs discovered
- Relevant issue/PR links
```

指南：
- **Objective**：捕捉 WHY —— git log 显示什么变了，不是为什么
- **Completed**：清晰标记已完成项以防止重做
- **In Progress**：这是最高价值部分 —— 部分状态最难重建
- **Next Steps**：按优先级编号。用户依赖项前缀 `**[USER]**`
- **Context**：记录否定空间 —— 什么被尝试和拒绝以及为什么

**预期结果：** 项目根的 CONTINUE_HERE.md 文件，所有 5 个部分都填充当前会话的真实内容。时间戳和分支准确。

**失败处理：** 若 Write 失败，检查文件权限。文件应在项目根创建（与 `.git/` 同目录）。验证 `.gitignore` 包含 `CONTINUE_HERE.md` —— 若否，添加它。

### 第 3 步：验证文件

读回 CONTINUE_HERE.md 并确认：
- 时间戳是最近的（过去几分钟内）
- 分支名匹配 `git branch --show-current`
- 所有 5 个部分包含真实内容（无模板占位符）
- Next Steps 按编号且可执行
- In Progress 项足够具体描述当前状态以恢复

**预期结果：** 文件读起来像清晰、可执行的交接，新会话可立即用它恢复工作。

**失败处理：** 编辑包含占位文本或太模糊的部分。每个部分应通过测试："新会话能根据此行动而无需澄清问题吗？"

## 验证清单

- [ ] CONTINUE_HERE.md 在项目根存在
- [ ] 文件包含所有 5 个部分附真实内容（非占位符）
- [ ] 时间戳和分支准确
- [ ] `.gitignore` 包括 `CONTINUE_HERE.md`
- [ ] Next Steps 按编号且可执行
- [ ] In Progress 项指定足够细节以无问题恢复

## 常见问题

- **写占位符而非内容**："TODO: fill in later" 违背目的。每个部分必须包含当前会话的真实信息。
- **重复 git 状态**：不要列出每个改变文件 —— git 已跟踪。专注意图、部分状态和下一步。
- **遗忘 Context 部分**：失败方法是最有价值的记录。没有它们，下次会话会重试相同死路。
- **未读就覆写**：若 CONTINUE_HERE.md 已存在自先前会话，先读它 —— 它可能包含早期交接的未完成工作。
- **留下陈旧文件**：CONTINUE_HERE.md 短暂。下次会话消费后，删除它。陈旧文件导致混淆。

## 相关技能

- `read-continue-here` —— 互补：在会话开始读取并根据延续文件行动
- `bootstrap-agent-identity` —— 冷启动身份重建，消费此技能产出的延续文件
- `manage-memory` —— 持久跨会话知识（补充此短暂交接）
- `commit-changes` —— 写延续文件前将工作保存到 git
- `write-claude-md` —— 可选延续指南所在的项目指令
