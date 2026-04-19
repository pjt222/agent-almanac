---
name: configure-mcp-server
locale: wenyan
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

# 設 MCP 伺

設 MCP 伺之連於 Claude Code（WSL）與 Claude Desktop（Windows）。

## 用時

- 設 Claude Code 經 mcptools 連 R
- 設 Claude Desktop 附 MCP 伺
- 加 Hugging Face 或他遠 MCP 伺
- 察具間 MCP 連之問

## 入

- **必**：MCP 伺之類（mcptools、Hugging Face、自）
- **必**：客（Claude Code、Claude Desktop、或二）
- **可選**：認之符
- **可選**：自伺之實

## 法

### 第一步：裝 MCP 伺包

**R（mcptools）**：

```r
install.packages("remotes")
remotes::install_github("posit-dev/mcptools")
```

**Hugging Face**：

```bash
npm install -g mcp-remote
```

**得：** `mcptools` 自 GitHub 裝且 R 中無誤載。`mcp-remote` 全域可以 `which mcp-remote` 或 `npm list -g mcp-remote` 得。

**敗則：** `mcptools` 則先確 `remotes` 已裝。若 GitHub 率限裝，於 `~/.Renviron` 設 `GITHUB_PAT`。`mcp-remote` 則驗 Node.js 與 npm 已裝且於 PATH。

### 第二步：設 Claude Code（WSL）

**R mcptools 伺**：

```bash
claude mcp add r-mcptools stdio \
  "/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe" \
  -- -e "mcptools::mcp_server()"
```

**Hugging Face 伺**：

```bash
claude mcp add hf-mcp-server \
  -e HF_TOKEN=your_token_here \
  -- mcp-remote https://huggingface.co/mcp
```

**驗設**：

```bash
claude mcp list
claude mcp get r-mcptools
```

**得：** `claude mcp list` 示 `r-mcptools` 與 `hf-mcp-server`（或所加）。`claude mcp get r-mcptools` 示正令與參。

**敗則：** 若伺不現於列，驗 `~/.claude.json` 含正條。若 `claude` 令不得，加入 PATH：`export PATH="$HOME/.claude/local/node_modules/.bin:$PATH"`。

### 第三步：設 Claude Desktop（Windows）

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

**要**：Windows 含空格之目用 8.3 短徑（`PROGRA~1` 非 `Program Files`）。符用環變，非 `--header` 參。

**得：** `%APPDATA%\Claude\claude_desktop_config.json` 為有效 JSON 附正伺條。重啟後 Claude Desktop 示 MCP 兆。

**敗則：** 以 lint 驗 JSON（如 `jq . < config.json`）。若 Windows 徑空格致析誤，用 8.3 短徑（`PROGRA~1`）。確 Claude Desktop 全重啟（非只小化）。

### 第四步：設 R 話為 MCP

加於項目之 `.Rprofile`：

```r
if (requireNamespace("mcptools", quietly = TRUE)) {
  mcptools::mcp_session()
}
```

此使 RStudio 開項時自啟 MCP 話。

**得：** `.Rprofile` 條件啟 `mcptools::mcp_session()` 於 RStudio 開項時，使 MCP 具自可得。

**敗則：** 若 `mcptools` 於話始不得，驗其裝於 RStudio 所用之庫（察 `.libPaths()`）。用 renv 則確 mcptools 於 renv 庫。

### 第五步：驗連

**自 WSL 試 R MCP**：

```bash
"/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe" -e "mcptools::mcp_server()"
```

**於 Claude Code 中試**：

啟 Claude Code 而用 MCP 具——宜現於具列。

**試 Claude Desktop**：

設後重啟 Claude Desktop。察 UI 中 MCP 伺之兆。

**得：** 行 Rscript 附 `mcptools::mcp_server()` 無誤出。MCP 具於活話中現於 Claude Code 具列。Claude Desktop 重啟後示伺態。

**敗則：** 若 Rscript 令敗，察全徑正（`ls "/mnt/c/Program Files/R/"` 驗 R 版）。若具不現於 Claude Code，重啟話。Claude Desktop 則察防火設。

### 第六步：多伺之設

Claude Code 與 Claude Desktop 皆支多 MCP 伺並行：

```bash
# Claude Code: add multiple servers
claude mcp add r-mcptools stdio "/path/to/Rscript.exe" -- -e "mcptools::mcp_server()"
claude mcp add hf-mcp-server -e HF_TOKEN=token -- mcp-remote https://huggingface.co/mcp
claude mcp add custom-server stdio "/path/to/server" -- --port 3001
```

**得：** 多 MCP 伺設且同可訪。`claude mcp list` 示諸伺。每伺之具於同 Claude Code 話中可得。

**敗則：** 若伺衝，察每伺於設有獨名。若一伺阻他，驗諸伺用非阻 I/O（stdio 傳自治之）。

## 驗

- [ ] `claude mcp list` 示諸設伺
- [ ] R MCP 伺應具呼
- [ ] Hugging Face MCP 伺認且應
- [ ] Claude Code 與 Claude Desktop 皆可連（若二皆設）
- [ ] MCP 具於話中現於具列

## 陷

- **Windows 徑空格**：用 8.3 短名或正引徑。異具析徑異。
- **符於令參**：Windows 中 `--header "Authorization: Bearer token"` 因析而敗。用環變。
- **混 Claude Code 與 Desktop 之設**：此二異具各設檔異（`~/.claude.json` 對 `%APPDATA%\Claude\`）
- **npx 對全裝**：`npx mcp-remote` 於 Claude Desktop 境或敗。以 `npm install -g mcp-remote` 全裝。
- **mcptools 版**：確 mcptools 現。需 `ellmer` 包為依。

## 參

- `build-custom-mcp-server` - 建己之 MCP 伺
- `troubleshoot-mcp-connection` - 察連之問
- `setup-wsl-dev-environment` - WSL 設之前提
