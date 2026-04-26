---
name: read-continue-here
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
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

# 讀續此處

讀取結構化之續行文件，自前次會話止處接續工作。

## 適用時機

- 開新會話而項目根目錄存有 CONTINUE_HERE.md
- SessionStart 鉤子注入續行上下文之後
- 引導身份識別並偵測前次會話遺留之痕跡
- 為項目設置自動續行偵測（一次性基礎建置）

## 輸入

- **必要**：項目目錄（預設為當前工作目錄）
- **選擇性**：是否設置基礎建置（SessionStart 鉤子加 CLAUDE.md 指示）
- **選擇性**：消化後是否刪除文件（預設為是）

## 步驟

### 步驟一：偵測並讀取續行文件

於項目根目錄查找 `CONTINUE_HERE.md`：

```bash
ls -la CONTINUE_HERE.md 2>/dev/null
```

若不存在，從容退出——無可續之事。

若存在，讀取文件內容。解析五段：目標、已完成、進行中、後續步驟、上下文。從標題行擷取時戳與分支。

**預期：** 文件已讀，各段已解析為前次會話狀態之清晰心智模型。

**失敗時：** 若文件存在但格式不全（缺段或為空），視為部分信號——擷取現有內容並向用戶說明所缺之處。

### 步驟二：評估鮮度

比對文件時戳與當前時間：

```bash
# File modification time
stat -c '%Y' CONTINUE_HERE.md 2>/dev/null || stat -f '%m' CONTINUE_HERE.md
# Current time
date +%s
```

分類鮮度：
- **新鮮**（少於 24 小時，同一分支）：可直接據以行動
- **陳舊**（超過 24 小時或分支不同）：續行前須先告知用戶
- **被取代**（交接時戳之後存有新提交）：項目自交接以來已有他人作業

檢查分支對齊：

```bash
git branch --show-current
git log --oneline --since="$(stat -c '%Y' CONTINUE_HERE.md | xargs -I{} date -d @{} --iso-8601=seconds)" 2>/dev/null
```

**預期：** 鮮度評估結果連同分類（新鮮、陳舊或被取代）及佐證證據。

**失敗時：** 若不在 git 倉庫內，跳過分支與提交檢查。僅依文件標題之時戳判斷。

### 步驟三：摘要並確認續行

簡潔向用戶呈現續行狀態：
- 「前次會話目標：[Objective]」
- 「已完成：[summary]」
- 「進行中：[summary]」
- 「擬議後續行動：[Next Steps item 1]」

若鮮度為「陳舊」或「被取代」，呈現證據並詢問續行抑或重新開始。

若任何後續步驟標有 `**[USER]**`，明確凸顯之——此類項目須用戶決策方可推進。

**預期：** 用戶確認續行計畫，可能略加調整。代理對下一步有明確授權。

**失敗時：** 若用戶云「重新開始」或「忽略該文件」，承認並無續行上下文地進行。可提議刪除文件以免日後混淆。

### 步驟四：執行交接事項

從後續步驟第一項（或用戶指示之處）開始作業：
- 參照進行中項目以理解部分狀態
- 利用上下文段以避免重試已失敗之路徑
- 視已完成項目為定局——除非用戶明示，勿復驗證

**預期：** 代理在續行文件指引下，於正確任務上有效作業。

**失敗時：** 若後續步驟含糊或進行中狀態不明，向用戶請求澄清而非揣測。

### 步驟五：清理

交接消化、作業展開後，刪除 CONTINUE_HERE.md：

```bash
rm CONTINUE_HERE.md
```

陳舊之續行文件將於日後會話造成混淆。

**預期：** 文件已移除。項目根目錄潔淨。

**失敗時：** 若用戶欲保留文件（如作會話中之參考），可保留，但須提醒於會話結束前刪除，以免下次會話再度消化。

### 步驟六：設置 SessionStart 鉤子（選擇性）

若尚未設置，建立會話啟動時自動讀取 CONTINUE_HERE.md 之機制。

建立鉤子腳本：

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

加入 `~/.claude/settings.json` 之 SessionStart 鉤子陣列：

```json
{
  "type": "command",
  "command": "~/.claude/hooks/continue-here/read-continuation.sh",
  "timeout": 5
}
```

**預期：** 鉤子腳本已存在、可執行，並登錄於 settings.json。下次會話啟動時，若 CONTINUE_HERE.md 存在，其內容將注入會話上下文。

**失敗時：** 編輯後須確認 settings.json 為有效 JSON。手動測試鉤子：`cd /your/project && ~/.claude/hooks/continue-here/read-continuation.sh`。腳本於無 `jq` 時退回 `awk`，故 `jq` 屬建議而非必要。

### 步驟七：加入 CLAUDE.md 指示（選擇性）

於項目之 CLAUDE.md 加入簡短指示，使 Claude 明白該文件之用：

```markdown
## Session Continuity

If `CONTINUE_HERE.md` exists in the project root, read it at session start. It contains a structured handoff from a prior session: objective, completed work, in-progress state, next steps, and context. Act on it — acknowledge the continuation, summarize prior state, and propose resuming from the Next Steps section. If the file is older than 24 hours, flag this to the user before proceeding. After the handoff is consumed, the file can be deleted.
```

**預期：** CLAUDE.md 包含該指示。日後會話即便未設 SessionStart 鉤子，亦將讀取並依 CONTINUE_HERE.md 行事。

**失敗時：** 若 CLAUDE.md 不存在，僅以此段建立。若文件過長，將指示置於頂部以免遭截斷。

## 驗證

- [ ] CONTINUE_HERE.md 已偵測（或缺席已從容處置）
- [ ] 鮮度已評估（時戳、分支、交接後之提交）
- [ ] 續行計畫已呈現並經用戶確認
- [ ] 作業自正確之後續步驟項目展開
- [ ] 文件於消化後已清理
- [ ] （選擇性）SessionStart 鉤子腳本存在且可執行
- [ ] （選擇性）CLAUDE.md 載有會話續行指示

## 常見陷阱

- **未確認即行動**：務必向用戶呈現續行計畫。文件雖新鮮，用戶可能已改變欲處理之事
- **盲信陳舊文件**：超過 24 小時或來自不同分支之續行文件僅是建議而非命令。應始終檢查鮮度
- **忽視上下文段**：文件最具價值處往往是失敗路徑之記載。略過此段將導致重蹈死路
- **遺忘清理**：消化後仍留 CONTINUE_HERE.md 將令下次會話混淆，重新據之行事
- **視已完成為待驗證**：除非用戶明確要求，勿重做已完成之事。應信任前次會話之判斷

## 相關技能

- `write-continue-here` — 對偶之技能：於會話結束時撰寫續行文件
- `bootstrap-agent-identity` — 完整身份重構，將續行偵測列為其一啟發
- `manage-memory` — 持久之跨會話知識（補此短暫交接之不足）
- `write-claude-md` — 項目指示，選擇性續行指南所居之處
