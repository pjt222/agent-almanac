---
name: read-continue-here
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
fence_basis_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Read a CONTINUE_HERE.md continuation file at session start and resume
  from where the prior session left off. Covers detecting the file, assessing
  freshness, parsing the structured handoff, confirming the resumption plan
  with the user, and cleaning up after consumption. Optionally configures a
  SessionStart hook and CLAUDE.md instruction for automatic pickup. Use at the
  start of a session when a continuation file exists, when bootstrapping after
  an interrupted session, or when setting up automatic continuation detection.
license: MIT
allowed-tools: Read Write Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: basic
  language: multi
  tags: session, continuity, handoff, context, workflow, read
---

# 讀續

讀續檔、承前任也。

## 用

- 啟新會、根存 CONTINUE_HERE.md→用
- SessionStart 鉤注入續脈→用
- 啟身、察前會跡→用
- 設自動續察（一次基設）→用

## 入

- **必**：項目錄（默當前）
- **可**：基設乎（鉤+CLAUDE.md）
- **可**：用畢刪乎（默是）

## 行

### 一：察讀

查根 `CONTINUE_HERE.md`：

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

無→雅退。

存→讀容。析五段：Objective、Completed、In Progress、Next Steps、Context。取首行時、枝。

得：檔讀、段析、前會態明。

敗：存而殘（缺段、空）→視為部分號，取所存、告用何缺。

### 二：察鮮

時與今較：

```bash
: "${CONTINUE_FILE:?resolve it with the Step 1 block in this shell first}"
# File modification time
stat -c '%Y' "$CONTINUE_FILE" 2>/dev/null || stat -f '%m' "$CONTINUE_FILE"
# Current time
date +%s
```

分鮮：
- **鮮**（< 24 時、同枝）：可直行
- **舊**（> 24 時或異枝）：先告用
- **越**（後存新提交）：他人於交後動

察枝合：

```bash
: "${CONTINUE_FILE:?resolve it with the Step 1 block in this shell first}"
git branch --show-current
git log --oneline --since="$(stat -c '%Y' "$CONTINUE_FILE" | xargs -I{} date -d @{} --iso-8601=seconds)" 2>/dev/null
```

得：鮮分（鮮、舊、越）有據。

敗：非庫→略枝、提交察。獨憑檔頭時。

### 三：摘確續

簡示續態於用：
- 「前會旨：[Objective]」
- 「已畢：[摘]」
- 「進行：[摘]」
- 「擬下：[Next Steps 第一]」

舊或越→示據、問續否抑新起。

Next Steps 標 `**[USER]**`→明揭，需用決方行。

得：用確續計（或調）。代有明命。

敗：用云「新起」「忽彼檔」→應、不顧續脈。問刪檔以免後混。

### 四：行交

由 Next Steps 一始（或用所指）：
- 引 In Progress 解半態
- 用 Context 避重蹈敗法
- 視 Completed 已畢——非用問勿復驗

得：代行正務、有續檔導引。

敗：Next Steps 含糊、In Progress 不明→問用，勿猜。

### 五：清

交用畢、工已起→刪 CONTINUE_HERE.md：

```bash
: "${CONTINUE_FILE:?resolve it with the Step 1 block in this shell first}"
if git ls-files --error-unmatch "$CONTINUE_FILE" >/dev/null 2>&1; then
  # Tracked: the deletion is recoverable, which is what makes it safe.
  git rm -q "$CONTINUE_FILE" && git commit -qm 'chore: consume the session handoff'
else
  # Untracked, ignored, or no repository at all — all three land here, and for
  # all three an ordinary delete is the right and only option.
  rm -- "$CONTINUE_FILE"
fi
```

舊續檔致後會混。

得：檔除、根淨。

敗：用欲留（如會中參）→留之，告會末必刪以免次會復用。

### 六：設 SessionStart 鉤（可）

未設→立自讀於會啟。

建鉤本：

```bash
mkdir -p ~/.claude/hooks/continue-here

cat > ~/.claude/hooks/continue-here/read-continuation.sh << 'SCRIPT'
#!/usr/bin/env bash
# SessionStart hook: inject the resolved CONTINUE_HERE.md into session context.
# OS-aware: works on native Linux, WSL, macOS, and Windows (Git Bash/MSYS).
set -uo pipefail

ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || ROOT=$PWD
CONTINUE_FILE=
for candidate in CONTINUE_HERE.md docs/CONTINUE_HERE.md .claude/CONTINUE_HERE.md; do
  if [ -f "$ROOT/$candidate" ]; then CONTINUE_FILE="$ROOT/$candidate"; break; fi
done

emit() {
  # additionalContext sits DIRECTLY under hookSpecificOutput. Nesting it inside a
  # "sessionStartContext" object — the shape this hook shipped until 2.0 — names a
  # key Claude Code does not know, so the whole object is discarded and the failure
  # is reported nowhere the user will look (#844). stdout carries the JSON and
  # nothing else.
  if command -v jq >/dev/null 2>&1; then
    ESCAPED=$(printf '%s' "$1" | jq -Rsa .)
  else
    ESCAPED=$(printf '%s' "$1" | awk '
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
  printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":%s}}' "$ESCAPED"
}

if [ -n "$CONTINUE_FILE" ]; then
  # Strip CRLF (files on NTFS often have Windows line endings)
  emit "$(sed 's/\r$//' "$CONTINUE_FILE")"
  exit 0
fi

# No handoff at a resolved path. Exiting silently here is what made a misplaced
# handoff indistinguishable from a project that has none, so look once more, cheaply,
# and say what was found.
ELSEWHERE=$(find "$ROOT" -maxdepth 3 -name 'CONTINUE_HERE.md' \
  -not -path '*/.git/*' -not -path '*/node_modules/*' 2>/dev/null | head -5)
if [ -n "$ELSEWHERE" ]; then
  emit "A CONTINUE_HERE.md exists in this project but not where the continuation hook resolves it. The hook looks for CONTINUE_HERE.md, docs/CONTINUE_HERE.md and .claude/CONTINUE_HERE.md, relative to the repository root. Found instead:
$ELSEWHERE
Read it if it is a handoff for this session, or move it to one of the resolved paths."
fi
exit 0
SCRIPT

chmod +x ~/.claude/hooks/continue-here/read-continuation.sh
```

入 `~/.claude/settings.json` SessionStart 鉤陣：

```json
{
  "type": "command",
  "command": "~/.claude/hooks/continue-here/read-continuation.sh",
  "timeout": 5
}
```

得：鉤本存、可執、注於 settings.json。次會啟、若 CONTINUE_HERE.md 存→容入會脈。

敗：察 settings.json 編後仍合 JSON。手測鉤：`cd /your/project && ~/.claude/hooks/continue-here/read-continuation.sh`。本退用 `awk` 若無 `jq`，故 `jq` 宜而非必。

### 七：增 CLAUDE.md 命（可）

於項 CLAUDE.md 增簡命使 Claude 解檔旨：

```markdown
## Session Continuity

If `CONTINUE_HERE.md` exists in the project root, read it at session start. It contains a structured handoff from a prior session: objective, completed work, in-progress state, next steps, and context. Act on it — acknowledge the continuation, summarize prior state, and propose resuming from the Next Steps section. If the file is older than 24 hours, flag this to the user before proceeding. After the handoff is consumed, the file can be deleted.
```

得：CLAUDE.md 含命。後會雖無鉤亦讀行 CONTINUE_HERE.md。

敗：CLAUDE.md 不存→建之，唯此段。檔過長→置近頂以免截斷。

## 驗

- [ ] CONTINUE_HERE.md 已察（或缺已雅理）
- [ ] 鮮已察（時、枝、後提交）
- [ ] 續計示用、用已確
- [ ] 工自正 Next Steps 始
- [ ] 用畢檔已清
- [ ] （可）SessionStart 鉤本存可執
- [ ] （可）CLAUDE.md 含續命

## 忌

- **未確而行**：必示續計於用。雖鮮，意或變
- **盲信舊檔**：> 24 時或異枝→建議非命。必察鮮
- **忽 Context**：最值常為敗法。略則重蹈死路
- **忘清**：用畢留 CONTINUE_HERE.md→次會混、復行之
- **疑 Completed**：非用問勿復畢工。信前會察

## 參

- `write-continue-here` — 補：會末書續檔
- `bootstrap-agent-identity` — 全身重構，含續察為一啟發
- `manage-memory` — 跨會持知（補此瞬交）
- `write-claude-md` — 項命，可選續導所居
