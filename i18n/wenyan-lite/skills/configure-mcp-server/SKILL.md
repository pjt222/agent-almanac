---
name: configure-mcp-server
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Configure MCP (Model Context Protocol) servers for Claude Code and
  Claude Desktop. Covers mcptools setup, Hugging Face integration,
  WSL path handling, and multi-client configuration. Use when setting up
  Claude Code to connect to R via mcptools, configuring Claude Desktop
  with MCP servers, adding Hugging Face or other remote MCP servers, or
  troubleshooting MCP connectivity between clients and servers.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mcp-integration
  complexity: intermediate
  language: multi
  tags: mcp, claude-code, claude-desktop, mcptools, configuration
---

# 配置 MCP 伺服器

為 Claude Code（WSL）與 Claude Desktop（Windows）設 MCP 伺服器連接。

## 適用時機

- 配 Claude Code 以 mcptools 連 R
- 配 Claude Desktop 含 MCP 伺服器
- 加 Hugging Face 或他遠端 MCP 伺服器
- 診工具間之 MCP 連通性

## 輸入

- **必要**：MCP 伺服器類（mcptools、Hugging Face、自訂）
- **必要**：客戶端（Claude Code、Claude Desktop、或兩者）
- **選擇性**：認證令牌
- **選擇性**：自訂伺服器實作

## 步驟

### 步驟一：裝 MCP 伺服器包

**R（mcptools）**：

```r
install.packages("remotes")
remotes::install_github("posit-dev/mcptools")
```

**Hugging Face**：

```bash
npm install -g mcp-remote
```

**預期：** `mcptools` 自 GitHub 裝且於 R 中無誤載入。`mcp-remote` 全域可達（`which mcp-remote` 或 `npm list -g mcp-remote`）。

**失敗時：** `mcptools` 先確 `remotes` 已裝。若 GitHub 限速，於 `~/.Renviron` 設 `GITHUB_PAT`。`mcp-remote` 確 Node.js 與 npm 已裝且於 PATH。

### 步驟二：配 Claude Code（WSL）

**R mcptools 伺服器**：

```bash
claude mcp add r-mcptools stdio \
  "/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe" \
  -- -e "mcptools::mcp_server()"
```

**Hugging Face 伺服器**：

```bash
claude mcp add hf-mcp-server \
  -e HF_TOKEN=your_token_here \
  -- mcp-remote https://huggingface.co/mcp
```

**驗配置**：

```bash
claude mcp list
claude mcp get r-mcptools
```

**預期：** `claude mcp list` 顯 `r-mcptools` 與 `hf-mcp-server`（或所加之伺服器）。`claude mcp get r-mcptools` 顯正確命令與參數。

**失敗時：** 若伺服器未見於列，驗 `~/.claude.json` 含正確項。若 `claude` 命令未找到，加入 PATH：`export PATH="$HOME/.claude/local/node_modules/.bin:$PATH"`。

### 步驟三：配 Claude Desktop（Windows）

編輯 `%APPDATA%\Claude\claude_desktop_config.json`：

```json
{
  "mcpServers": {
    "r-mcptools": {
      "command": "C:\\PROGRA~1\\R\\R-45~1.0\\bin\\x64\\Rscript.exe",
      "args": ["-e", "mcptools::mcp_server()"]
    },
    "hf-mcp-server": {
      "command": "mcp-remote",
      "args": ["https://huggingface.co/mcp"],
      "env": {
        "HF_TOKEN": "your_token_here"
      }
    }
  }
}
```

**要**：Windows 含空格之目錄用 8.3 短路徑（`PROGRA~1` 非 `Program Files`）。令牌用環境變數，非 `--header` 參數。

**預期：** `%APPDATA%\Claude\claude_desktop_config.json` 之 JSON 配置有效，含正確伺服器項。重啟後 Claude Desktop 顯 MCP 伺服器指示。

**失敗時：** 以 linter 驗 JSON（如 `jq . < config.json`）。若 Windows 路徑空格致解析錯，用 8.3 短路徑（`PROGRA~1`）。確 Claude Desktop 全重啟（非僅最小化）。

### 步驟四：配 R 會話於 MCP

加於項目 `.Rprofile`：

```r
if (requireNamespace("mcptools", quietly = TRUE)) {
  mcptools::mcp_session()
}
```

此於 RStudio 開項目時自啟 MCP 會話。

**預期：** `.Rprofile` 於項目於 RStudio 開時有條件啟 `mcptools::mcp_session()`，令 MCP 工具自動可用。

**失敗時：** 若會話始時 `mcptools` 未找到，驗其已裝於 RStudio 用之庫（查 `.libPaths()`）。若用 renv，確 mcptools 於 renv 庫中。

### 步驟五：驗連接

**自 WSL 測 R MCP**：

```bash
"/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe" -e "mcptools::mcp_server()"
```

**自 Claude Code 內測**：

啟 Claude Code 並用 MCP 工具——其宜現於工具列。

**測 Claude Desktop**：

配置改後重啟 Claude Desktop。察 UI 中之 MCP 伺服器指示。

**預期：** 以 `mcptools::mcp_server()` 行 Rscript 生輸出而無誤。MCP 工具於活會話中見於 Claude Code 工具列。Claude Desktop 重啟後顯伺服器態。

**失敗時：** 若 Rscript 命令敗，查全路徑正確（`ls "/mnt/c/Program Files/R/"` 以驗 R 版本）。若工具未現於 Claude Code，重啟會話。Claude Desktop 則查防火牆設。

### 步驟六：多伺服器配置

Claude Code 與 Claude Desktop 皆支同時多 MCP 伺服器：

```bash
# Claude Code: add multiple servers
claude mcp add r-mcptools stdio "/path/to/Rscript.exe" -- -e "mcptools::mcp_server()"
claude mcp add hf-mcp-server -e HF_TOKEN=token -- mcp-remote https://huggingface.co/mcp
claude mcp add custom-server stdio "/path/to/server" -- --port 3001
```

**預期：** 多 MCP 伺服器同時配且可達。`claude mcp list` 顯所有伺服器。每伺服器之工具於同 Claude Code 會話可用。

**失敗時：** 若伺服器衝突，查各有獨名於配置中。若一伺服器阻他者，驗伺服器用非阻塞 I/O（stdio 傳輸自動處）。

## 驗證

- [ ] `claude mcp list` 顯所有已配伺服器
- [ ] R MCP 伺服器回應工具呼叫
- [ ] Hugging Face MCP 伺服器認證並回應
- [ ] Claude Code 與 Claude Desktop 皆可連（若兩者皆配）
- [ ] MCP 工具見於會話之工具列

## 常見陷阱

- **Windows 路徑空格**：用 8.3 短名或妥引用。不同工具解析路徑各異
- **令牌於命令參數中**：Windows 上 `--header "Authorization: Bearer token"` 因解析而敗。改用環境變數
- **混淆 Claude Code 與 Claude Desktop 配置**：此乃分之工具含分之配置檔（`~/.claude.json` vs `%APPDATA%\Claude\`）
- **npx vs 全域裝**：`npx mcp-remote` 於 Claude Desktop 脈絡或敗。以 `npm install -g mcp-remote` 全域裝
- **mcptools 版本**：確 mcptools 最新。其需 `ellmer` 包為依賴

## 相關技能

- `build-custom-mcp-server` - 建自訂 MCP 伺服器
- `troubleshoot-mcp-connection` - 調連接問題
- `setup-wsl-dev-environment` - WSL 設之前置
