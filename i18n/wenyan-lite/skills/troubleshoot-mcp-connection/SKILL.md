---
name: troubleshoot-mcp-connection
locale: wenyan-lite
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

# 排查 MCP 連線

診斷並解決 MCP 伺服器連線失敗。

## 適用時機

- Claude Code 或 Claude Desktop 無法連上 MCP 伺服器
- 會話中未出現 MCP 工具
- 出現「Cannot attach the server」錯誤
- 連線原本可用，今已中斷
- 於新機器上設置 MCP

## 輸入

- **必要**：錯誤訊息或症狀描述
- **必要**：何客戶端（Claude Code、Claude Desktop 或兩者）
- **必要**：何 MCP 伺服器（mcptools、Hugging Face 或自製）
- **選擇性**：近期對配置或環境之變更

## 步驟

### 步驟一：辨識客戶端與配置

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

**預期：** 配置文件已定位且可讀取，列出 MCP 伺服器條目，含 command、args 與 env 欄位。

**失敗時：** 若配置文件不存在或為空，伺服器從未配置。依 `configure-mcp-server` 技能重新設置。

### 步驟二：獨立測試伺服器

**R mcptools**：

```bash
# Test if R can start the server
"/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe" -e "mcptools::mcp_server()"
```

若失敗：
- 檢查 R 路徑：`ls "/mnt/c/Program Files/R/"`
- 檢查 mcptools 已安裝：`Rscript -e "library(mcptools)"`
- 檢查 ellmer 依賴：`Rscript -e "library(ellmer)"`

**Hugging Face MCP**：

```bash
# Test mcp-remote directly
mcp-remote https://huggingface.co/mcp

# Check if mcp-remote is installed
which mcp-remote
npm list -g mcp-remote
```

**預期：** 伺服器進程啟動，產生初始化輸出（JSON-RPC 握手或「listening」訊息），無錯誤。

**失敗時：** 若 R mcptools 失敗，確認 R 版本路徑無誤且 mcptools 已安裝於 R 庫中。若 mcp-remote 失敗，以 `npm install -g mcp-remote` 全局重裝並驗證其位於 PATH 上。

### 步驟三：診斷常見錯誤模式

**「Cannot attach the server」（Claude Desktop）**

根本原因：Windows 命令引數解析。

修復：以環境變數取代 `--header` 引數：

```json
{
  "hf-mcp-server": {
    "command": "mcp-remote",
    "args": ["https://huggingface.co/mcp"],
    "env": { "HF_TOKEN": "your_token" }
  }
}
```

並確保 `mcp-remote` 全局安裝（`npm install -g mcp-remote`），勿依賴 `npx`。

**「Connection refused」**

- 伺服器未運行或埠號錯誤
- 防火牆阻擋連線
- 傳輸類型錯誤（stdio 對 HTTP）

**「Command not found」**

- 缺少可執行檔之完整路徑
- 執行上下文中未配置 PATH
- 於 Windows：含空格之路徑用 `C:\\PROGRA~1\\...`

**MCP 工具未出現但無錯誤**

- 伺服器啟動但工具未註冊
- 檢查伺服器 stdout 之初始化訊息
- 確認伺服器使用正確之 MCP 協議版本

**預期：** 錯誤模式已對應至文檔分類之一（cannot attach、connection refused、command not found 或無聲失敗）。

**失敗時：** 若錯誤不合任何已知模式，捕捉完整錯誤輸出並查伺服器端日誌。於該 MCP 伺服器之 GitHub issues 中搜索此確切錯誤訊息。

### 步驟四：檢查網路與認證

```bash
# Test Hugging Face API connectivity
curl -I "https://huggingface.co/mcp"

# Verify token validity
curl -H "Authorization: Bearer $HF_TOKEN" https://huggingface.co/api/whoami
```

**預期：** HTTP 端點返回 200 狀態，whoami 呼叫返回您的 Hugging Face 用戶名，證實網路連通且認證有效。

**失敗時：** 若 curl 返回連線錯誤,檢查 DNS 解析與代理設定。若令牌被拒（401），於 huggingface.co/settings/tokens 重新生成令牌並更新配置。

### 步驟五：驗證 JSON 配置語法

```bash
# Validate JSON (common issue: trailing commas, missing quotes)
python3 -m json.tool /path/to/config.json
```

**預期：** JSON 解析無誤，證實配置文件具有效語法。

**失敗時：** 最常見之 JSON 問題為對象或陣列末尾條目後之拖尾逗號、字串值缺引號、大括號不匹配。修復解析器報告之語法錯誤並重新驗證。

### 步驟六：平台特定除錯

**Windows（Claude Desktop）**：
- 引數解析有別於 Unix
- 路徑中之空格中斷命令執行
- 用 8.3 短路徑：`C:\PROGRA~1\R\R-45~1.0\bin\x64\Rscript.exe`
- 環境變數比命令列標頭更可靠

**WSL（Claude Code）**：
- Unix 風格之引號運作正確
- 可用含空格之完整路徑（加引號）
- 經 NVM 之 npm/npx：確保 NVM 於執行上下文中已載入

**預期：** 已辨識平台特定問題（如 Windows 引數解析、WSL 路徑解析或 NVM 上下文載入）。

**失敗時：** 若問題為 Windows 特有，將認證從命令列引數切換至環境變數。若為 WSL 特有,驗證 Windows 可執行檔路徑可從 WSL 經完整 `/mnt/c/...` 路徑存取。

### 步驟七：重置並重新配置

若一切無效：

```bash
# Remove and re-add the server (Claude Code)
claude mcp remove server-name
claude mcp add server-name stdio "/full/path/to/executable" -- args

# Restart Claude Desktop after config changes
# (close and reopen the application)
```

**預期：** 移除並重新加入伺服器後，`claude mcp list` 顯示伺服器具正確配置，且新一次連線嘗試成功。

**失敗時：** 若重新加入失敗，確認可執行檔路徑無誤且該命令於終端中直接運行有效。對 Claude Desktop，確保應用程式已完全關閉（查系統匣）後再重啟。

### 步驟八：檢查日誌

**Claude Code**：啟動會話時查終端輸出中之 MCP 錯誤。

**Claude Desktop**：查應用程式日誌（位置依 OS 而異）。

**伺服器端**：於 MCP 伺服器加入日誌，捕捉傳入請求與錯誤。

**預期：** 日誌條目揭示失敗之特定點（伺服器啟動、握手、認證或工具註冊）。

**失敗時：** 若無日誌可用，於伺服器命令加入 `stderr` 捕捉（如重定向至日誌文件）並重現失敗。對 Claude Desktop,查 `%APPDATA%\Claude\logs\` 之應用層日誌。

## 驗證

- [ ] 伺服器獨立啟動無錯誤
- [ ] 配置 JSON 有效
- [ ] 客戶端連線成功
- [ ] 會話中出現 MCP 工具
- [ ] 工具被呼叫時執行正確
- [ ] 連線持續跨多次請求

## 常見陷阱

- **編輯錯誤之配置文件**：Claude Code（`~/.claude.json`）對 Claude Desktop（`%APPDATA%\Claude\claude_desktop_config.json`）
- **配置變更後未重啟**：Claude Desktop 需重啟；Claude Code 於新會話採用變更
- **受限環境中之 npx**：npx 於運行時下載套件。若網路或權限受限，全局安裝
- **令牌過期**：Hugging Face 令牌可能過期。若認證失敗突然出現，重新生成
- **版本不匹配**：客戶端與伺服器間之 MCP 協議版本須相容

## 相關技能

- `configure-mcp-server` — 初始 MCP 設置
- `build-custom-mcp-server` — 自製伺服器除錯上下文
- `setup-wsl-dev-environment` — WSL 前置設置
