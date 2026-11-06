---
name: read-continue-here
description: >
  在会话开始时读取 CONTINUE_HERE.md 延续文件并从前一会话的中断处继续。
  涵盖检测文件、评估新鲜度、解析结构化交接、与用户确认恢复计划，以及
  消费后清理。可选地配置 SessionStart hook 和 CLAUDE.md 指令以自动接续。
  在存在延续文件的会话开始时、在中断会话后引导，或在设置自动延续检测时使用。
license: MIT
allowed-tools: Read Write Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: basic
  language: multi
  tags: session, continuity, handoff, context, workflow, read
  locale: zh-CN
  source_locale: en
  source_commit: 025eea68
  fence_basis_commit: 9616c3db25dbf24f7586e87fafa15229c28ef8de
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# 读取 Continue Here

读取结构化延续文件并从前一会话的中断处恢复工作。

## 适用场景

- 开始新会话且 CONTINUE_HERE.md 在项目根存在
- 在 SessionStart hook 注入延续上下文后
- 引导身份并检测先前会话工件
- 为项目设置自动延续检测（一次性基础设施）

## 输入

- **必需**：项目目录（默认为当前工作目录）
- **可选**：是否配置基础设施（SessionStart hook + CLAUDE.md 指令）
- **可选**：消费后是否删除文件（默认：是）

## 步骤

### 第 1 步：检测并读取延续文件

在项目根检查 `CONTINUE_HERE.md`：

```bash
ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || ROOT=$PWD
CONTINUE_FILE=
for candidate in CONTINUE_HERE.md docs/CONTINUE_HERE.md .claude/CONTINUE_HERE.md; do
  if [ -f "$ROOT/$candidate" ]; then CONTINUE_FILE="$ROOT/$candidate"; break; fi
done
if [ -n "$CONTINUE_FILE" ]; then
  echo "handoff: $CONTINUE_FILE"
else
  ELSEWHERE=$(find "$ROOT" -maxdepth 3 -name 'CONTINUE_HERE.md' \
    -not -path '*/.git/*' -not -path '*/node_modules/*' 2>/dev/null | head -5)
  if [ -n "$ELSEWHERE" ]; then
    echo "no handoff at a resolved path, but one exists elsewhere:"
    echo "$ELSEWHERE"
  else
    echo "no handoff"
  fi
fi
```

若不存在，优雅退出 —— 没有要继续的内容。

若存在，读取文件内容。解析 5 个部分：Objective、Completed、In Progress、Next Steps、Context。从头部行提取时间戳和分支。

**预期结果：** 文件已读取，其部分被解析为先前会话状态的清晰心智模型。

**失败处理：** 若文件存在但格式错误（缺失部分、为空），将其视为部分信号 —— 提取存在的内容并向用户注明缺少的内容。

### 第 2 步：评估新鲜度

将文件时间戳与当前时间比较：

```bash
: "${CONTINUE_FILE:?resolve it with the Step 1 block in this shell first}"
# File modification time
stat -c '%Y' "$CONTINUE_FILE" 2>/dev/null || stat -f '%m' "$CONTINUE_FILE"
# Current time
date +%s
```

新鲜度分类：
- **新鲜**（< 24 小时，相同分支）：可直接安全行动
- **陈旧**（> 24 小时或不同分支）：在继续前向用户标记
- **被取代**（交接时间戳后存在新提交）：自交接以来有人在项目上工作

检查分支对齐：

```bash
: "${CONTINUE_FILE:?resolve it with the Step 1 block in this shell first}"
git branch --show-current
git log --oneline --since="$(stat -c '%Y' "$CONTINUE_FILE" | xargs -I{} date -d @{} --iso-8601=seconds)" 2>/dev/null
```

**预期结果：** 带分类（新鲜、陈旧或被取代）和支持证据的新鲜度评估。

**失败处理：** 若不在 git 仓库中，跳过分支和提交检查。仅依赖文件头部的时间戳。

### 第 3 步：汇总并确认恢复

简洁地向用户呈现延续状态：
- "先前会话目标：[Objective]"
- "已完成：[summary]"
- "进行中：[summary]"
- "建议下一行动：[Next Steps item 1]"

若新鲜度为"陈旧"或"被取代"，呈现证据并询问是继续交接还是从头开始。

若任何 Next Steps 项标记 `**[USER]**`，显式浮现这些 —— 它们需要用户决策才能继续工作。

**预期结果：** 用户确认恢复计划，可能有调整。代理对接下来做什么有清晰授权。

**失败处理：** 若用户说"从头开始"或"忽略该文件"，承认并继续而不带延续上下文。提供删除文件以防止未来混淆。

### 第 4 步：根据交接行动

从 Next Steps 项 1 开始工作（或用户指引的地方）：
- 引用 In Progress 项以理解部分状态
- 使用 Context 部分以避免重试失败方法
- 将 Completed 项视为已完成 —— 除非用户要求，否则不重新验证

**预期结果：** 代理在正确任务上有效工作，由延续文件指引。

**失败处理：** 若 Next Steps 模糊或 In Progress 状态不清，向用户请求澄清而非猜测。

### 第 5 步：清理

先保留一份副本：下一次 `write-continue-here` 会把草稿与此版本比较。按就近优先的顺序，在项目的 CLAUDE.md、父目录的 CLAUDE.md、用户级 `~/.claude/CLAUDE.md` 和 README 中查找的 `Handoff archive: <dir>` 行指定归档目录；没有该行时，未跟踪的交接文件以 `CONTINUE_HERE.prev.md` 保存在旁边，已跟踪的无需副本。设置 `ARCHIVE_STATE=consumed`：

```bash
: "${CONTINUE_FILE:?set it to the path of the handoff, as the resolver printed it}"
: "${ARCHIVE_STATE:?set it to consumed when reading, superseded when replacing}"
case "$CONTINUE_FILE" in /*) ;; *) CONTINUE_FILE=$PWD/$CONTINUE_FILE ;; esac
HOME_DIR=${CONTINUE_FILE%/*} ARCHIVED=
ROOT=$(git -C "$HOME_DIR" rev-parse --show-toplevel 2>/dev/null) || ROOT=$HOME_DIR
PROJECT=$(git -C "$HOME_DIR" rev-parse --path-format=absolute --git-common-dir 2>/dev/null) || PROJECT=$ROOT
PROJECT=${PROJECT%/.git}; PROJECT=${PROJECT##*/} # a linked worktree names its project, not itself
SEARCH=("$ROOT/CLAUDE.md" "$ROOT/.claude/CLAUDE.md") dir=${ROOT%/*} ARCHIVE=
while [ -n "$dir" ]; do SEARCH+=("$dir/CLAUDE.md"); dir=${dir%/*}; done
for f in "${SEARCH[@]}" "$HOME/.claude/CLAUDE.md" "$ROOT/README.md"; do # nearest first, builtins only
  [ -f "$f" ] && while IFS= read -r l || [ -n "$l" ]; do
    l=${l%$'\r'}; case "$l" in "Handoff archive: "*) ARCHIVE=${l#Handoff archive: }; break 2 ;; esac
  done < "$f"
done
case "$ARCHIVE" in '~/'*) ARCHIVE=$HOME/${ARCHIVE#'~/'} ;; ''|/*|'<dir>') ;; *) ARCHIVE=${f%/*}/$ARCHIVE ;; esac
STAMP=$(date -u +%Y-%m-%dT%H%M%SZ) KEEP=cp
[ "$ARCHIVE_STATE" = superseded ] && KEEP=mv
if [ "$ARCHIVE" = '<dir>' ]; then
  echo "REFUSED: $f carries the unedited 'Handoff archive: <dir>'; name a directory there" >&2; false
elif [ -n "$ARCHIVE" ]; then
  DEST=$ARCHIVE/${STAMP%%T*}/$PROJECT-CONTINUE_HERE.$STAMP.$ARCHIVE_STATE.md
  mkdir -p -- "${DEST%/*}" && "$KEEP" -- "$CONTINUE_FILE" "$DEST" && ARCHIVED=$DEST
elif git -C "$HOME_DIR" ls-files --error-unmatch -- "$CONTINUE_FILE" >/dev/null 2>&1; then
  if git -C "$HOME_DIR" diff --quiet HEAD -- "$CONTINUE_FILE"; then ARCHIVED="git history, tracked"
  else echo "REFUSED: $CONTINUE_FILE has uncommitted changes; read them before committing anything" >&2; false; fi
else
  "$KEEP" -- "$CONTINUE_FILE" "$HOME_DIR/CONTINUE_HERE.prev.md" && ARCHIVED=$HOME_DIR/CONTINUE_HERE.prev.md
fi
if [ -n "$ARCHIVED" ]; then echo "archive: $ARCHIVED"
else echo "REFUSED: $CONTINUE_FILE was not archived, so the cleanup will not delete it" >&2; false; fi
```

交接被消费且工作进行后，删除 CONTINUE_HERE.md：

```bash
: "${CONTINUE_FILE:?resolve it with the Step 1 block in this shell first}"
: "${ARCHIVED:?run the archive fence first in this shell call, or set ARCHIVED to the path it printed}"
SCOPE_LINE=$(while IFS= read -r l; do
  case "$l" in "Nobody runs:"*) printf '%s' "$l"; break ;; esac
done < "$CONTINUE_FILE")
if [ -n "$SCOPE_LINE" ]; then
  echo "WARNING: $CONTINUE_FILE carries a peer-session scope declaration the peer will no longer find:" >&2
  echo "  $SCOPE_LINE" >&2
  echo "Copy it where the peer will see it (an issue comment, a message to the peer)." >&2
fi
if git ls-files --error-unmatch "$CONTINUE_FILE" >/dev/null 2>&1; then
  # The pathspec is load-bearing: without it, the commit also takes a peer's staged work.
  git rm -q "$CONTINUE_FILE" &&
    git commit -qm 'chore: consume the session handoff' -- "$CONTINUE_FILE"
else
  rm -- "$CONTINUE_FILE" # untracked, ignored, or no repository: an ordinary delete
fi
```

陈旧的延续文件在未来会话中导致混淆。

**预期结果：** 文件已移除。项目根干净。

**失败处理：** 若用户希望保留文件（如作为会话期间的引用），保留它但注明应在会话结束前删除以防止下次会话重新消费它。

### 第 6 步：配置 SessionStart Hook（可选）

该钩子把解析到的交接文件注入每个新会话。脚本、其 `settings.json` 条目以及如何检查其输出，见 [references/session-start-hook.md](references/session-start-hook.md)。

**预期结果：** Hook 脚本存在、可执行并已在 settings.json 中注册。下次会话开始时，若 CONTINUE_HERE.md 存在，其内容被注入会话上下文。

**失败处理：** 检查编辑后 settings.json 是有效 JSON。手动测试 hook：`cd /your/project && ~/.claude/hooks/continue-here/read-continuation.sh`。脚本若未安装 `jq` 则回退到 `awk`，所以 `jq` 推荐但非必需。

### 第 7 步：添加 CLAUDE.md 指令（可选）

向项目的 CLAUDE.md 添加简短指令，使 Claude 理解文件目的：

```markdown
## Session Continuity

If `CONTINUE_HERE.md` exists in the project root, read it at session start. It contains a structured handoff from a prior session: objective, completed work, in-progress state, next steps, and context. Act on it — acknowledge the continuation, summarize prior state, and propose resuming from the Next Steps section. If the file is older than 24 hours, flag this to the user before proceeding. After the handoff is consumed, the file can be deleted.
```

**预期结果：** CLAUDE.md 包含指令。未来会话会读取并根据 CONTINUE_HERE.md 行动，即使未配置 SessionStart hook。

**失败处理：** 若 CLAUDE.md 不存在，仅用此部分创建它。若文件太长，将指令添加到顶部附近，那里不会被截断。

## 验证清单

- [ ] CONTINUE_HERE.md 被检测到（或缺失被优雅处理）
- [ ] 评估新鲜度（时间戳、分支、交接后提交）
- [ ] 恢复计划已呈现并由用户确认
- [ ] 工作从正确的 Next Steps 项开始
- [ ] 消费后清理文件
- [ ] （可选）SessionStart hook 脚本存在并可执行
- [ ] （可选）CLAUDE.md 包含会话延续指令

## 常见问题

- **未确认就行动**：始终向用户呈现恢复计划。即使文件新鲜，他们可能改变了主意要做什么。
- **盲目信任陈旧文件**：超过 24 小时或来自不同分支的延续文件是建议，不是命令。始终检查新鲜度。
- **忽略 Context 部分**：文件最有价值的部分常是失败方法。跳过此部分导致重试死路。
- **遗忘清理**：消费后留下 CONTINUE_HERE.md 在下次会话中导致混淆，它会再次尝试根据它行动。
- **将 Completed 项视为未验证**：除非用户特别要求，不要重做已完成工作。信任先前会话的评估。

## 相关技能

- `write-continue-here` —— 互补：在会话结束时写延续文件
- `bootstrap-agent-identity` —— 完整身份重建，包括延续检测作为一种启发法
- `manage-memory` —— 持久跨会话知识（补充此短暂交接）
- `write-claude-md` —— 可选延续指南所在的项目指令
