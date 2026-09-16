---
name: read-continue-here
locale: wenyan
source_locale: en
source_commit: 82c77053
fence_basis_commit: a2c36f4e6
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

讀承接之文，續前會所未竟者。

## 用時

- 新會初啟，項目根有 CONTINUE_HERE.md 乃用
- SessionStart 鈎注承接脈絡之後乃用
- 啟身識而察前會之遺乃用
- 為項目立自動察續（一次之基建）乃用

## 入

- **必要**：項目之所（默為當前工作之所）
- **可選**：是否設基建（SessionStart 鈎與 CLAUDE.md 之諭）
- **可選**：用畢是否刪之（默：然）

## 法

### 第一步：察而讀承接之文

於項目之根察 `CONTINUE_HERE.md`：

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

若闕，安然而退——無可續者也。

若存，讀其內。析五段：目、已畢、進中、下步、脈絡。自首行取時與枝。

得：文已讀，其段已析為前會狀態之清明心象。

敗則：若文存而殘（缺段、空），視為偏信——取其有者，缺者告之於用者。

### 第二步：察其新陳

文之時與當下相較：

```bash
: "${CONTINUE_FILE:?resolve it with the Step 1 block in this shell first}"
# File modification time
stat -c '%Y' "$CONTINUE_FILE" 2>/dev/null || stat -f '%m' "$CONTINUE_FILE"
# Current time
date +%s
```

分新陳之等：

- **新**（< 24 時，同枝）：可直行
- **陳**（> 24 時或異枝）：先告用者
- **被代**（承接時後有新提交）：自承接後有人於項目勞之

察枝之合：

```bash
: "${CONTINUE_FILE:?resolve it with the Step 1 block in this shell first}"
git branch --show-current
git log --oneline --since="$(stat -c '%Y' "$CONTINUE_FILE" | xargs -I{} date -d @{} --iso-8601=seconds)" 2>/dev/null
```

得：新陳之察附分類（新、陳、被代）與佐證。

敗則：若不在 git 庫，略枝與提交之察。獨依文首之時。

### 第三步：總而請續之命

簡而陳前會之狀於用者：

- 「前會之目：[目]」
- 「已畢：[摘]」
- 「進中：[摘]」
- 「擬之下步：[下步之第一]」

若新陳為「陳」或「被代」，陳其證，問是否承之或新起。

若下步有標 `**[USER]**` 者，明列之——須用者決方可進。

得：用者承續之計，或有調。代理有清明之命以續。

敗則：若用者云「新起」或「忽其文」，受之而進，不用承接之脈。請刪之以防後惑。

### 第四步：行其承接

自下步之第一行始（或用者所指之處）：

- 參進中以解部分之狀
- 用脈絡段以避再試已敗之徑
- 視已畢者為畢——勿再驗，除非用者請

得：代理勤於正事，由承接之文所明。

敗則：若下步含混或進中之狀不清，請用者明之，勿臆斷。

### 第五步：清理

承接既用而事已起，刪 CONTINUE_HERE.md：

```bash
: "${CONTINUE_FILE:?resolve it with the Step 1 block in this shell first}"
if git ls-files --error-unmatch "$CONTINUE_FILE" >/dev/null 2>&1; then
  # Tracked: the deletion is recoverable, which is what makes it safe.
  # The pathspec is load-bearing: `git commit -m` with none commits the WHOLE
  # index, so a peer session's staged work is swept into a commit titled for the
  # handoff. This runs at session start, which is exactly when that is likely.
  git rm -q "$CONTINUE_FILE" &&
    git commit -qm 'chore: consume the session handoff' -- "$CONTINUE_FILE"
else
  # Untracked, ignored, or no repository at all — all three land here, and for
  # all three an ordinary delete is the right and only option.
  rm -- "$CONTINUE_FILE"
fi
```

陳承接之文，後會生惑。

得：文已去。項目根已淨。

敗則：若用者欲存之（如會中為參），留之，然告會終前宜刪，勿令下會復用。

### 第六步：設 SessionStart 鈎（可選）

若未設，立會啟自讀 CONTINUE_HERE.md 之機。

立鈎之文：

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
      BEGIN {
        ORS = ""
        # JSON forbids every raw byte below 0x20 inside a string, not only the
        # three with short escapes. Handling \\ " and tab alone left CR, ESC and
        # the rest to pass through raw, which made the object unparseable — and
        # an unparseable object is discarded in exactly the silent way #844 was.
        # A handoff quoting terminal output carries ESC; one written on NTFS
        # carries CR. Both are ordinary here.
        for (i = 1; i < 32; i++) esc[sprintf("%c", i)] = sprintf("\\u%04x", i)
        esc["\t"] = "\\t"
        print "\""
      }
      {
        line = $0
        gsub(/\\/, "\\\\", line)
        gsub(/"/, "\\\"", line)
        if (line ~ /[\001-\037]/) {
          out = ""
          n = length(line)
          for (i = 1; i <= n; i++) {
            ch = substr(line, i, 1)
            out = out (ch in esc ? esc[ch] : ch)
          }
          line = out
        }
        if (NR > 1) print "\\n"
        print line
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

加於 `~/.claude/settings.json` 之 SessionStart 鈎陣中：

```json
{
  "type": "command",
  "command": "~/.claude/hooks/continue-here/read-continuation.sh",
  "timeout": 5
}
```

得：鈎文已存，可執，已錄於 settings.json。下會啟時，若 CONTINUE_HERE.md 存，其內注入會脈絡。

敗則：察 settings.json 改後仍為合 JSON。手試其鈎：`cd /your/project && ~/.claude/hooks/continue-here/read-continuation.sh`。文於無 `jq` 時退用 `awk`，故 `jq` 宜備而非必。

### 第七步：增 CLAUDE.md 之諭（可選）

於項目之 CLAUDE.md 增簡諭，使 Claude 解此文之意：

```markdown
## Session Continuity

If `CONTINUE_HERE.md` exists in the project root, read it at session start. It contains a structured handoff from a prior session: objective, completed work, in-progress state, next steps, and context. Act on it — acknowledge the continuation, summarize prior state, and propose resuming from the Next Steps section. If the file is older than 24 hours, flag this to the user before proceeding. After the handoff is consumed, the file can be deleted.
```

得：CLAUDE.md 含此諭。後會雖無 SessionStart 鈎亦可讀而行 CONTINUE_HERE.md。

敗則：若 CLAUDE.md 不存，立之而獨含此段。若文過長，置諭於前以免被截。

## 驗

- [ ] CONTINUE_HERE.md 已察（或無亦安處）
- [ ] 新陳已察（時、枝、承接後之提交）
- [ ] 續之計已陳於用者並得其承
- [ ] 事自正確之下步而起
- [ ] 文用畢已清
- [ ] （可選）SessionStart 鈎之文已存且可執
- [ ] （可選）CLAUDE.md 含會續之諭

## 陷

- **未承而行**：必陳續之計於用者。文雖新，其意或已改。
- **盲信陳文**：逾 24 時或異枝之承接文乃議，非命。必察新陳。
- **忽脈絡段**：文之最貴者，常為已敗之徑。略此致再試死路。
- **忘清理**：用畢留 CONTINUE_HERE.md，下會生惑而再試行之。
- **視已畢為未驗**：除非用者明請，勿復做已畢之事。信前會之斷。

## 參

- `write-continue-here` — 其補：會終書承接之文
- `bootstrap-agent-identity` — 全身識重建，含承接之察為一啟發
- `manage-memory` — 跨會持久之知（補此一過之承）
- `write-claude-md` — 項目之諭，可選之續之指南所在
