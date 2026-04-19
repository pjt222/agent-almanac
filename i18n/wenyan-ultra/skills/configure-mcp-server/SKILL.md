---
name: configure-mcp-server
locale: wenyan-ultra
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

# 配 MCP 服

設 MCP 服連於 Claude Code（WSL）與 Claude Desktop（Win）。

## 用

- 設 Claude Code 經 mcptools 連 R
- 配 Claude Desktop 含 MCP 服
- 加 Hugging Face 或他遠 MCP 服
- 除具間 MCP 連

## 入

- **必**：MCP 服類（mcptools、Hugging Face、自）
- **必**：客戶（Claude Code、Claude Desktop、俱）
- **可**：鑑 token
- **可**：自服實

## 行

### 一：裝 MCP 服包

**R（mcptools）**：

```r
install.packages("remotes")
remotes::install_github("posit-dev/mcptools")
```

**Hugging Face**：

```bash
npm install -g mcp-remote
```

**得：** `mcptools` 從 GitHub 裝且於 R 載無錯。`mcp-remote` 全局可用 `which mcp-remote` 或 `npm list -g mcp-remote`。

**敗：** `mcptools` 須先裝 `remotes`。GitHub 限率→於 `~/.Renviron` 設 `GITHUB_PAT`。`mcp-remote`→驗 Node.js 與 npm 已裝於 PATH。

### 二：配 Claude Code（WSL）

**R mcptools 服**：

```bash
claude mcp add r-mcptools stdio \
  "/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe" \
  -- -e "mcptools::mcp_server()"
```

**Hugging Face 服**：

```bash
claude mcp add hf-mcp-server \
  -e HF_TOKEN=your_token_here \
  -- mcp-remote https://huggingface.co/mcp
```

**驗配**：

```bash
claude mcp list
claude mcp get r-mcptools
```

**得：** `claude mcp list` 示 `r-mcptools` 與 `hf-mcp-server`（或所加者）。`claude mcp get r-mcptools` 示正令與參。

**敗：** 服未現於列→驗 `~/.claude.json` 含正項。`claude` 未在 PATH→`export PATH="$HOME/.claude/local/node_modules/.bin:$PATH"`。

### 三：配 Claude Desktop（Win）

編 `%APPDATA%\Claude\claude_desktop_config.json`：

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

**要**：Win 含空格之目錄用 8.3 短路（`PROGRA~1` 非 `Program Files`）。token 用環變，非 `--header` 參。

**得：** `%APPDATA%\Claude\claude_desktop_config.json` 之 JSON 有效含正服項。Claude Desktop 重啟後示 MCP 服指示。

**敗：** 以 linter 驗 JSON（如 `jq . < config.json`）。Win 路徑含空致析錯→用 8.3 短路（`PROGRA~1`）。確 Claude Desktop 全重啟（非只最小）。

### 四：配 R 會於 MCP

於項 `.Rprofile` 加：

```r
if (requireNamespace("mcptools", quietly = TRUE)) {
  mcptools::mcp_session()
}
```

此於 RStudio 開項時自啟 MCP 會。

**得：** `.Rprofile` 於項於 RStudio 開時有條件啟 `mcptools::mcp_session()`，MCP 具自可用。

**敗：** 會啟時 `mcptools` 未見→驗已裝於 RStudio 所用庫（察 `.libPaths()`）。用 renv→確 mcptools 於 renv 庫。

### 五：驗連

**從 WSL 測 R MCP**：

```bash
"/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe" -e "mcptools::mcp_server()"
```

**於 Claude Code 測**：

啟 Claude Code 且用 MCP 具——應現於具列。

**測 Claude Desktop**：

配變後重啟 Claude Desktop。UI 察 MCP 服指示。

**得：** Rscript 行 `mcptools::mcp_server()` 無錯輸。MCP 具於 Claude Code 活會中現於具列。Claude Desktop 重啟後示服態。

**敗：** Rscript 令敗→察全路正（`ls "/mnt/c/Program Files/R/"` 驗 R 版）。具未現於 Claude Code→重啟會。Claude Desktop→察防火牆設。

### 六：多服配

Claude Code 與 Claude Desktop 俱支同時多 MCP 服：

```bash
# Claude Code: add multiple servers
claude mcp add r-mcptools stdio "/path/to/Rscript.exe" -- -e "mcptools::mcp_server()"
claude mcp add hf-mcp-server -e HF_TOKEN=token -- mcp-remote https://huggingface.co/mcp
claude mcp add custom-server stdio "/path/to/server" -- --port 3001
```

**得：** 多 MCP 服同配且可達。`claude mcp list` 示諸服。諸服具於同 Claude Code 會可用。

**敗：** 服衝→察各於配有唯名。一服阻他→驗服用非阻 I/O（stdio 傳自行此）。

## 驗

- [ ] `claude mcp list` 示諸配服
- [ ] R MCP 服應具呼
- [ ] Hugging Face MCP 服鑑且應
- [ ] Claude Code 與 Claude Desktop 俱可連（若俱配）
- [ ] MCP 具於會中現於具列

## 忌

- **Win 路徑空格**：用 8.3 短名或正引路。各具析路異。
- **token 於令參**：Win 上 `--header "Authorization: Bearer token"` 因析敗。用環變替。
- **Claude Code 與 Claude Desktop 配混**：為別具有別配檔（`~/.claude.json` vs `%APPDATA%\Claude\`）
- **npx vs 全裝**：`npx mcp-remote` 或於 Claude Desktop 脈敗。全裝 `npm install -g mcp-remote`。
- **mcptools 版**：確 mcptools 最新。須 `ellmer` 包為依。

## 參

- `build-custom-mcp-server` - 建自之 MCP 服
- `troubleshoot-mcp-connection` - 除連問
- `setup-wsl-dev-environment` - WSL 設前置
