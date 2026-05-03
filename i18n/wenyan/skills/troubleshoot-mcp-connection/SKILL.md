---
name: troubleshoot-mcp-connection
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Diagnose and fix MCP server connection issues between Claude Code,
  Claude Desktop, and MCP servers. Covers Windows argument parsing,
  authentication failures, transport issues, and platform-specific
  debugging. Use when Claude Code or Claude Desktop fails to connect to
  an MCP server, when MCP tools don't appear in sessions, on "cannot
  attach the server" errors, when a working connection has stopped, or
  when setting up MCP on a new machine.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mcp-integration
  complexity: intermediate
  language: multi
  tags: mcp, troubleshooting, debugging, connection, windows
---

# 排 MCP 連之疾

診而解 MCP 之連敗。

## 用時

- Claude Code 或 Claude Desktop 連 MCP 而不得乃用
- 會中不見 MCP 之具乃用
- 報「Cannot attach the server」之訛乃用
- 舊通而今絕乃用
- 新機初設 MCP 乃用

## 入

- **必要**：訛之辭或症之述
- **必要**：何客（Claude Code、Claude Desktop、或兼之）
- **必要**：何 MCP 之服（mcptools、Hugging Face、自製）
- **可選**：近設或環之變

## 法

### 第一步：辨客與設

**Claude Code**（WSL）：

```bash
# View MCP configuration
claude mcp list
claude mcp get server-name

# Configuration stored in
cat ~/.claude.json | python3 -m json.tool
```

**Claude Desktop**（Windows）：

```bash
# Configuration file location
cat "/mnt/c/Users/$USER/AppData/Roaming/Claude/claude_desktop_config.json"
```

得：設之文已得而可讀，其中 MCP 之服列以 command、args、env 之屬。

敗則：若設文不存或為空，則服未嘗設也。依 `configure-mcp-server` 之術自始而設之。

### 第二步：獨試其服

**R mcptools**：

```bash
# Test if R can start the server
"/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe" -e "mcptools::mcp_server()"
```

若敗：
- 驗 R 之徑：`ls "/mnt/c/Program Files/R/"`
- 驗 mcptools 已裝：`Rscript -e "library(mcptools)"`
- 驗 ellmer 之依：`Rscript -e "library(ellmer)"`

**Hugging Face MCP**：

```bash
# Test mcp-remote directly
mcp-remote https://huggingface.co/mcp

# Check if mcp-remote is installed
which mcp-remote
npm list -g mcp-remote
```

得：服之程已起，出其初之辭（JSON-RPC 之握手或「listening」之言），無訛。

敗則：R mcptools 敗，驗 R 之徑與 mcptools 是否裝於 R 之庫。mcp-remote 敗，以 `npm install -g mcp-remote` 全裝再驗其在 PATH。

### 第三步：診常見之訛

**「Cannot attach the server」（Claude Desktop）**

其本：Windows 之命參析。

修：用環之變代 `--header` 之參：

```json
{
  "hf-mcp-server": {
    "command": "mcp-remote",
    "args": ["https://huggingface.co/mcp"],
    "env": { "HF_TOKEN": "your_token" }
  }
}
```

並驗 `mcp-remote` 已全裝（`npm install -g mcp-remote`），勿賴 `npx`。

**「Connection refused」**

- 服未起，或埠誤
- 火牆阻其連
- 傳之類誤（stdio 抑 HTTP）

**「Command not found」**

- 缺執之全徑
- PATH 於行之境未設
- 於 Windows：徑有空格者用 `C:\\PROGRA~1\\...`

**MCP 之具不現而無訛**

- 服起而具未錄
- 察服之 stdout 求初之辭
- 驗服用 MCP 協議之版正

得：訛之相已歸於一類（cannot attach、connection refused、command not found、或默敗）。

敗則：訛不歸任一已知之類者，捕其全出，察服側之記。於 MCP 服之 GitHub issues 求其原文。

### 第四步：察網與證

```bash
# Test Hugging Face API connectivity
curl -I "https://huggingface.co/mcp"

# Verify token validity
curl -H "Authorization: Bearer $HF_TOKEN" https://huggingface.co/api/whoami
```

得：HTTP 端返 200，whoami 返其 Hugging Face 之名，網通而證有效。

敗則：curl 報連訛者，察 DNS 之解與代之設。憑被拒（401）者，於 huggingface.co/settings/tokens 再生而更其設。

### 第五步：驗 JSON 之文法

```bash
# Validate JSON (common issue: trailing commas, missing quotes)
python3 -m json.tool /path/to/config.json
```

得：JSON 解之無訛，設之文法正。

敗則：JSON 之最常之訛者，物或列之末尾餘逗、字串少引、括不對。修析者所報之訛而再驗。

### 第六步：依平臺而診

**Windows（Claude Desktop）**：
- 參析異於 Unix
- 徑中之空格令命敗
- 用 8.3 之短徑：`C:\PROGRA~1\R\R-45~1.0\bin\x64\Rscript.exe`
- 環之變較命之首之頭信為堅

**WSL（Claude Code）**：
- Unix 之引正
- 可用全徑含空格（引之）
- 經 NVM 之 npm/npx：驗 NVM 已載於行之境

得：平臺之疾已辨（如 Windows 之參析、WSL 之徑解、或 NVM 境之載）。

敗則：疾屬 Windows 者，以環之變代命首之參為證。屬 WSL 者，驗 Windows 之執自 WSL 以全 `/mnt/c/...` 之徑可達。

### 第七步：清而再設

若皆敗：

```bash
# Remove and re-add the server (Claude Code)
claude mcp remove server-name
claude mcp add server-name stdio "/full/path/to/executable" -- args

# Restart Claude Desktop after config changes
# (close and reopen the application)
```

得：去而再加之後，`claude mcp list` 示其服之設正，新試之連得。

敗則：再加而敗者，驗執之徑正、命於端中直行而通。Claude Desktop 者，驗其全閉（察系統托盤）而後再啟。

### 第八步：察其記

**Claude Code**：察起會時端之輸出有 MCP 之訛否。

**Claude Desktop**：察應之記（其位依 OS 而異）。

**服側**：增記於 MCP 之服以捕來請與訛。

得：記之條揭敗之精處（服起、握手、證、具錄）。

敗則：無記可得者，加 `stderr` 之捕於服之命（如導入記文）而復其敗。Claude Desktop 者，察 `%APPDATA%\Claude\logs\` 之應級記。

## 驗

- [ ] 服獨起無訛
- [ ] 設之 JSON 法正
- [ ] 客連得
- [ ] MCP 之具現於會
- [ ] 具呼之則行
- [ ] 連續多請而不絕

## 陷

- **誤改設文**：Claude Code（`~/.claude.json`）異於 Claude Desktop（`%APPDATA%\Claude\claude_desktop_config.json`）
- **設變而不再啟**：Claude Desktop 必再啟；Claude Code 新會即取新設
- **限境用 npx**：npx 行時下載。網或權有限者，宜全裝
- **憑過期**：Hugging Face 之憑可過期。證敗忽至者，再生之
- **版不合**：MCP 協議之版於客與服必相容

## 參

- `configure-mcp-server` — MCP 之初設
- `build-custom-mcp-server` — 自製服之診之境
- `setup-wsl-dev-environment` — WSL 之先設
