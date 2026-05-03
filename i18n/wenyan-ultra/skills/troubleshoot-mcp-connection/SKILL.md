---
name: troubleshoot-mcp-connection
locale: wenyan-ultra
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

# 排MCP

診MCP接敗、解之。

## 用

- Claude Code/Desktop 接 MCP 敗→用
- 會中無 MCP 工→用
- 「Cannot attach the server」→用
- 前通今絕→用
- 新機設 MCP→用

## 入

- **必**：誤訊或徵
- **必**：何客（Code、Desktop、二者）
- **必**：何 MCP（mcptools、HF、自製）
- **可**：近設或環之變

## 行

### 一：辨客與配

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

得：配檔可讀，示 MCP 條目（command、args、env）。

敗：配檔不存或空→未嘗設。從 `configure-mcp-server` 始。

### 二：獨試器

**R mcptools**：

```bash
# Test if R can start the server
"/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe" -e "mcptools::mcp_server()"
```

若敗：
- 察 R 路：`ls "/mnt/c/Program Files/R/"`
- 察 mcptools 已裝：`Rscript -e "library(mcptools)"`
- 察 ellmer 依：`Rscript -e "library(ellmer)"`

**HF MCP**：

```bash
# Test mcp-remote directly
mcp-remote https://huggingface.co/mcp

# Check if mcp-remote is installed
which mcp-remote
npm list -g mcp-remote
```

得：器啟，吐初訊（JSON-RPC 握手或「listening」），無誤。

敗：mcptools 敗→驗 R 版路、mcptools 入庫。mcp-remote 敗→`npm install -g mcp-remote` 重裝、驗於 PATH。

### 三：診常誤

**「Cannot attach the server」（Desktop）**

本：Windows 參析。

修：用環變代 `--header`：

```json
{
  "hf-mcp-server": {
    "command": "mcp-remote",
    "args": ["https://huggingface.co/mcp"],
    "env": { "HF_TOKEN": "your_token" }
  }
}
```

且驗 `mcp-remote` 全裝（`npm install -g mcp-remote`），勿賴 `npx`。

**「Connection refused」**

- 器未行或港誤
- 防火牆阻
- 傳型誤（stdio vs HTTP）

**「Command not found」**

- 缺執全路
- PATH 未設於行境
- Windows：含空之路用 `C:\\PROGRA~1\\...`

**工不見而無誤**

- 器啟而工未註
- 察器 stdout 初訊
- 驗器用正 MCP 協版

得：誤合一類（不能附、拒接、命未尋、默敗）。

敗：無類合→錄全誤、察器側日。於 GitHub 議搜原訊。

### 四：察網與認

```bash
# Test Hugging Face API connectivity
curl -I "https://huggingface.co/mcp"

# Verify token validity
curl -H "Authorization: Bearer $HF_TOKEN" https://huggingface.co/api/whoami
```

得：HTTP 返 200，whoami 返 HF 用名，網與認皆通。

敗：curl 報接誤→察 DNS 與代理。令拒（401）→於 huggingface.co/settings/tokens 重生、更配。

### 五：驗 JSON 配

```bash
# Validate JSON (common issue: trailing commas, missing quotes)
python3 -m json.tool /path/to/config.json
```

得：JSON 析無誤，配檔法正。

敗：常誤為末逗、缺引、括不對。修報之誤、再驗。

### 六：分台診

**Windows（Desktop）**：
- 參析異於 Unix
- 路含空則命敗
- 用 8.3 短路：`C:\PROGRA~1\R\R-45~1.0\bin\x64\Rscript.exe`
- 環變較命列頭可靠

**WSL（Code）**：
- Unix 引法正
- 含空之全路（須引）可
- npm/npx 經 NVM：驗 NVM 載於行境

得：分台問題已辨（Windows 參、WSL 路、NVM 境）。

敗：Windows 因→由命列換環變認。WSL 因→驗 Windows 執路經 `/mnt/c/...` 可達。

### 七：重設

末計：

```bash
# Remove and re-add the server (Claude Code)
claude mcp remove server-name
claude mcp add server-name stdio "/full/path/to/executable" -- args

# Restart Claude Desktop after config changes
# (close and reopen the application)
```

得：移而重添後，`claude mcp list` 示器配正、新接成。

敗：重添敗→驗執路、命直行可。Desktop→確全閉（察系托盤）乃重啟。

### 八：察日

**Claude Code**：啟會時察終端 MCP 誤。

**Claude Desktop**：察應用日（位依 OS）。

**器側**：加日捕入請與誤。

得：日揭敗點（啟、握手、認、工註）。

敗：無日→重導 stderr 入檔、復現。Desktop→察 `%APPDATA%\Claude\logs\`。

## 驗

- [ ] 器獨啟無誤
- [ ] JSON 配正
- [ ] 客接成
- [ ] MCP 工現於會
- [ ] 工召成
- [ ] 接續多請

## 忌

- **改誤配**：Code（`~/.claude.json`）vs Desktop（`%APPDATA%\Claude\claude_desktop_config.json`）
- **改後不重啟**：Desktop 須重啟；Code 新會自承新配
- **限境用 npx**：npx 行時下包。網或權限受限→全裝
- **令過期**：HF 令可過。認忽敗→重生
- **版不合**：MCP 協版客器須相容

## 參

- `configure-mcp-server` - 初設
- `build-custom-mcp-server` - 自製器之診境
- `setup-wsl-dev-environment` - WSL 前置
