---
name: continue-here
description: >
  编写 CONTINUE_HERE.md 文件以捕获当前会话状态，使全新的 Claude Code 会话
  能够从上次中断处继续。涵盖评估近期工作、构建续接文件，以及可选配置
  SessionStart 钩子以实现自动续接。当以未完成工作结束会话、在会话间移交
  上下文，或保留 git 单独无法捕获的任务状态时使用。
locale: zh-CN
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: basic
  language: multi
  tags: session, continuity, handoff, context, workflow
---

# 从这里继续

编写结构化的续接文件，使下一个会话能够以完整的上下文开始。

## 适用场景

- 以仍在进行中的工作结束会话
- 在会话之间移交复杂任务
- 保留 git 无法捕获的意图、失败的方法和后续步骤
- 在任务进行到一半时关闭 Claude Code 之前

## 输入

- **必需**：有近期工作可总结的活跃会话
- **可选**：关于在交接中强调什么的具体说明

## 步骤

### 第 1 步：评估会话状态

收集关于近期工作的事实：

```bash
git log --oneline -5
git status
git diff --stat
```

回顾对话上下文：目标是什么、完成了什么、部分完成了什么、尝试过但失败了什么、做出了哪些决策。

**预期结果：** 清楚了解当前任务状态——已完成项、进行中项和计划中的后续步骤。

**失败处理：** 若不在 git 仓库中，跳过 git 命令。续接文件仍然可以捕获对话上下文和任务状态。

### 第 2 步：编写 CONTINUE_HERE.md

使用以下结构将文件写入项目根目录。每个章节必须包含可操作的内容，而非占位符。

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

指导原则：
- **Objective**：捕获「为什么」——git log 显示改变了什么，而非为什么
- **Completed**：清楚标记已完成的项目以防止重复工作
- **In Progress**：这是最有价值的章节——部分状态是最难重建的
- **Next Steps**：按优先级编号。在依赖用户的项目前加 `**[USER]**` 前缀
- **Context**：记录负面空间——尝试过并被拒绝的内容，以及原因

**预期结果：** 项目根目录中有一个 CONTINUE_HERE.md 文件，所有 5 个章节都填充了当前会话的真实内容。时间戳和分支是准确的。

**失败处理：** 若 Write 失败，检查文件权限。文件应该在项目根目录（与 `.git/` 相同的目录）中创建。验证 `.gitignore` 是否包含 `CONTINUE_HERE.md`——若没有，添加它。

### 第 3 步：验证文件

回读 CONTINUE_HERE.md 并确认：
- 时间戳是当前的（在过去几分钟内）
- 分支名称与 `git branch --show-current` 匹配
- 所有 5 个章节包含真实内容（无模板占位符）
- Next Steps 已编号且可操作
- In Progress 项目对当前状态的描述具体到足以恢复

**预期结果：** 文件读起来像一个清晰、可操作的交接，全新的会话可以立即用它恢复工作。

**失败处理：** 编辑包含占位符文本或过于模糊的章节。每个章节都应通过测试：「全新的会话是否可以根据这个内容采取行动，而无需提出澄清问题？」

### 第 4 步：配置 SessionStart 钩子（可选）

若尚未配置，设置在会话开始时自动读取 CONTINUE_HERE.md。

创建钩子脚本：

```bash
mkdir -p ~/.claude/hooks/continue-here

cat > ~/.claude/hooks/continue-here/read-continuation.sh << 'SCRIPT'
#!/bin/bash
# SessionStart hook: inject CONTINUE_HERE.md into session context
# OS-aware: works on native Linux, WSL, macOS, and Windows (Git Bash/MSYS)
set -uo pipefail

# --- Platform detection ---
detect_platform() {
  case "$(uname -s)" in
    Darwin) echo "mac" ;;
    Linux)
      if grep -qi microsoft /proc/version 2>/dev/null; then
        echo "wsl"
      else
        echo "linux"
      fi ;;
    MINGW*|MSYS*|CYGWIN*) echo "windows" ;;
    *) echo "unknown" ;;
  esac
}
PLATFORM=${PLATFORM:-$(detect_platform)}

CONTINUE_FILE="$PWD/CONTINUE_HERE.md"

if [ ! -f "$CONTINUE_FILE" ]; then
  exit 0
fi

# Strip CRLF (files on NTFS often have Windows line endings)
CONTENT=$(sed 's/\r$//' "$CONTINUE_FILE")

# JSON-escape: prefer jq, fall back to portable awk
if command -v jq >/dev/null 2>&1; then
  ESCAPED=$(printf '%s' "$CONTENT" | jq -Rsa .)
else
  ESCAPED=$(printf '%s' "$CONTENT" | awk '
    BEGIN { ORS=""; print "\"" }
    {
      gsub(/\\/, "\\\\")
      gsub(/"/, "\\\"")
      gsub(/\t/, "\\t")
      if (NR > 1) print "\\n"
      print
    }
    END { print "\"" }
  ')
fi

cat << EOF
{"hookSpecificOutput":{"sessionStartContext":{"additionalContext":$ESCAPED}}}
EOF
SCRIPT

chmod +x ~/.claude/hooks/continue-here/read-continuation.sh
```

在 `~/.claude/settings.json` 的 SessionStart 钩子数组中添加：

```json
{
  "type": "command",
  "command": "~/.claude/hooks/continue-here/read-continuation.sh",
  "timeout": 5
}
```

**预期结果：** 钩子脚本存在、可执行，并在 settings.json 中注册。在下次会话开始时，若 CONTINUE_HERE.md 存在，其内容将被注入到会话上下文中。

**失败处理：** 检查 settings.json 在编辑后是否是有效的 JSON。手动测试钩子：`cd /your/project && ~/.claude/hooks/continue-here/read-continuation.sh`。若未安装 `jq`，脚本会回退到 `awk`，因此 `jq` 是推荐但非必需的。

### 第 5 步：添加 CLAUDE.md 说明（可选）

在项目的 CLAUDE.md 中添加简短说明，使 Claude 理解文件的用途：

```markdown
## Session Continuity

If `CONTINUE_HERE.md` exists in the project root, read it at session start. It contains a structured handoff from a prior session: objective, completed work, in-progress state, next steps, and context. Act on it — acknowledge the continuation, summarize prior state, and propose resuming from the Next Steps section. If the file is older than 24 hours, flag this to the user before proceeding. After the handoff is consumed, the file can be deleted.
```

**预期结果：** CLAUDE.md 包含该说明。即使未配置 SessionStart 钩子，未来的会话也会读取并执行 CONTINUE_HERE.md。

**失败处理：** 若 CLAUDE.md 不存在，仅用此章节创建它。若文件太长，在靠近顶部的地方添加该说明，以便不会被截断。

## 验证清单

- [ ] CONTINUE_HERE.md 存在于项目根目录
- [ ] 文件包含所有 5 个章节，内容真实（无占位符）
- [ ] 时间戳和分支是准确的
- [ ] `.gitignore` 包含 `CONTINUE_HERE.md`
- [ ] Next Steps 已编号且可操作
- [ ] In Progress 项目指定了足够的细节以便无需提问即可恢复
- [ ] （可选）SessionStart 钩子脚本存在且可执行
- [ ] （可选）CLAUDE.md 包含会话连续性说明

## 常见问题

- **写入占位符而非内容**：「TODO：稍后填写」违背了目的。每个章节必须包含当前会话的真实信息。
- **复制 git 状态**：不要列出每个更改的文件——git 已经追踪了这些。专注于意图、部分状态和后续步骤。
- **忘记 Context 章节**：失败的方法是最有价值的记录内容。没有它们，下一个会话将重试相同的死胡同。
- **不先读取就覆盖**：若 CONTINUE_HERE.md 已经从之前的会话中存在，先读取它——它可能包含之前交接中未完成的工作。
- **留下过期文件**：CONTINUE_HERE.md 是临时的。下一个会话使用它之后，删除它。过期文件会造成混乱。

## 相关技能

- `bootstrap-agent-identity` — 冷启动身份重建，使用此技能产生的续接文件
- `manage-memory` — 持久的跨会话知识（补充此临时交接）
- `commit-changes` — 在编写续接文件之前将工作保存到 git
- `write-claude-md` — 可选的连续性指导所在的项目说明
