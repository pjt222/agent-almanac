---
name: configure-putior-mcp
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Configure the putior MCP server to expose 16 workflow visualization
  tools to AI assistants. Covers Claude Code and Claude Desktop setup,
  dependency installation (mcptools, ellmer), tool verification, and
  optional ACP server configuration for agent-to-agent communication. Use
  when enabling AI assistants to annotate and visualize workflows interactively,
  setting up a new development environment with putior MCP integration, or
  configuring agent-to-agent communication via ACP for automated pipelines.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: workflow-visualization
  complexity: intermediate
  language: R
  tags: putior, mcp, acp, ai-assistant, claude, tools, integration
---

# 配置 putior MCP 伺服器

設 putior MCP 伺服器令 AI 助手（Claude Code、Claude Desktop）可直呼工作流註釋與圖表生成之工具。

## 適用時機

- 令 AI 助手互動式註釋並視覺化工作流
- 設新開發環境含 putior MCP 整合
- 裝 putior 後欲 AI 輔助工作流文件
- 為自動化管線配代理間通訊 via ACP

## 輸入

- **必要**：putior 已裝（見 `install-putior`）
- **必要**：目標客戶端：Claude Code、Claude Desktop、或兩者
- **選擇性**：是否亦配 ACP 伺服器（預設：否）
- **選擇性**：ACP 伺服器之自訂主機/port（預設：localhost:8080）

## 步驟

### 步驟一：裝 MCP 依賴

裝 MCP 伺服器功能所需之包。

```r
# Required: MCP framework
remotes::install_github("posit-dev/mcptools")

# Required: Tool definition framework
install.packages("ellmer")

# Verify both load
library(mcptools)
library(ellmer)
```

**預期：** 兩包裝且載入無誤。

**失敗時：** `mcptools` 需 `remotes` 包。先裝：`install.packages("remotes")`。GitHub 限速則於 `~/.Renviron` 配 `GITHUB_PAT`（加行 `GITHUB_PAT=your_token_here` 並重啟 R）。**勿**將令牌貼於 shell 命令或提至版本控制。

### 步驟二：配 Claude Code（WSL/Linux/macOS）

加 putior MCP 伺服器至 Claude Code 之配置。

```bash
# One-line setup
claude mcp add putior -- Rscript -e "putior::putior_mcp_server()"
```

WSL 用 Windows R：
```bash
claude mcp add putior -- "/mnt/c/Program Files/R/R-4.5.2/bin/Rscript.exe" -e "putior::putior_mcp_server()"
```

驗配置：
```bash
claude mcp list
claude mcp get putior
```

**預期：** `putior` 見於 MCP 伺服器列，態為「configured」。

**失敗時：** 若 Claude Code 不於 PATH，加之：`export PATH="$HOME/.claude/local/node_modules/.bin:$PATH"`。若 Rscript 路徑錯，以 `which Rscript` 或 `ls "/mnt/c/Program Files/R/"` 尋 R。

### 步驟三：配 Claude Desktop（Windows）

加 putior 於 Claude Desktop 之 MCP 配置檔。

編 `%APPDATA%\Claude\claude_desktop_config.json`：

```json
{
  "mcpServers": {
    "putior": {
      "command": "C:\\PROGRA~1\\R\\R-45~1.0\\bin\\x64\\Rscript.exe",
      "args": ["-e", "putior::putior_mcp_server()"]
    }
  }
}
```

或以全路徑：
```json
{
  "mcpServers": {
    "putior": {
      "command": "C:\\Program Files\\R\\R-4.5.2\\bin\\x64\\Rscript.exe",
      "args": ["-e", "putior::putior_mcp_server()"]
    }
  }
}
```

編配置後重啟 Claude Desktop。

**預期：** Claude Desktop 於其 MCP 伺服器列顯 putior。對話中工具可用。

**失敗時：** 以 JSON linter 驗語法。查 R 路徑存。若路徑空格致問題，用 8.3 短名（`PROGRA~1`、`R-45~1.0`）。

### 步驟四：驗全 16 工具

測所有 MCP 工具可達且可用。

```r
# Get tool definitions
tools <- putior::putior_mcp_tools()
cat(sprintf("Total tools: %d\n", length(tools)))

# List tool names
vapply(tools, function(t) t$name, character(1))
```

16 工具依類：

**核心工作流（5）：**
- `put` — 掃檔尋 PUT 註（支 `exclude` 參數以正則過濾檔）
- `put_diagram` — 生 Mermaid 圖表
- `put_auto` — 自代碼自動偵工作流（支 `exclude` 參數）
- `put_generate` — 生註建議（支 `exclude` 參數）
- `put_merge` — 合手動+自動註（支 `exclude` 參數）

**參考/發現（7）：**
- `get_comment_prefix` — 取副檔之註前綴
- `get_supported_extensions` — 列支援副檔
- `list_supported_languages` — 列支援語言
- `get_detection_patterns` — 取自動偵模式
- `get_diagram_themes` — 列可用主題
- `putior_guide` — AI 助手文件
- `putior_help` — 速參之助

**工具（3）：**
- `is_valid_put_annotation` — 驗註語法
- `split_file_list` — 解檔清單
- `ext_to_language` — 副檔至語言名

**配置（1）：**
- `set_putior_log_level` — 配記錄詳度

> **要：自訂調色盤不能經 MCP 用。** `put_diagram` 之 `palette` 參數收 `put_theme()` 建之 `putior_theme` R 物件。MCP 以 JSON 通訊，`putior_theme` 等 R 物件不能跨 MCP 邊界序列化。經 MCP 呼 `put_diagram` 時改用字串式之 `theme` 參數（如 `theme = "viridis"`）。自訂調色盤則於 R 會話中直呼 `put_theme()` 與 `put_diagram(palette = ...)`。

自 Claude Code 測核心工具：
```
Use the putior_help tool to see available commands
Use the put tool to scan ./R/ for annotations
Use the put_diagram tool to generate a diagram
```

**預期：** 全 16 工具列。以有效輸入呼核心工具返預期結果。

**失敗時：** 若工具缺，查 putior 版本：`packageVersion("putior")`。舊版或工具更少。以 `remotes::install_github("pjt222/putior")` 更。

### 步驟五：配 ACP 伺服器（選擇性）

設 ACP（Agent Communication Protocol）伺服器以代理間通訊。

```r
# Install ACP dependency
install.packages("plumber2")

# Start ACP server (blocks — run in a separate R session or background)
putior::putior_acp_server()

# Custom host/port
putior::putior_acp_server(host = "0.0.0.0", port = 9000)
```

測 ACP 端點：
```bash
# Discover agent
curl http://localhost:8080/agents

# Execute a scan
curl -X POST http://localhost:8080/runs \
  -H "Content-Type: application/json" \
  -d '{"input": [{"role": "user", "parts": [{"content": "scan ./R/"}]}]}'

# Generate diagram
curl -X POST http://localhost:8080/runs \
  -H "Content-Type: application/json" \
  -d '{"input": [{"role": "user", "parts": [{"content": "generate diagram for ./R/"}]}]}'
```

**預期：** ACP 伺服器於已配 port 啟。`/agents` 返 putior 代理清單。`/runs` 收自然語請求並返工作流結果。

**失敗時：** 若 port 8080 已用，指不同 port。若 `plumber2` 未裝，伺服器函數印建議裝之助錯。

## 驗證

- [ ] `putior::putior_mcp_tools()` 暴露核心工具（`put`、`put_diagram`、`put_auto`、`put_generate`、`put_merge`）且返當前版本之約 16 工具
- [ ] Claude Code：`claude mcp list` 顯 `putior` 已配
- [ ] Claude Code：`putior_help` 工具呼時返助文
- [ ] Claude Desktop：重啟後 putior 見於 MCP 伺服器列
- [ ] 核心工具（`put`、`put_diagram`、`put_auto`）行而無誤
- [ ] （選擇性）ACP 伺服器回應 `curl http://localhost:8080/agents`

## 常見陷阱

- **mcptools 未裝**：MCP 伺服器需 `mcptools`（自 GitHub）與 `ellmer`（自 CRAN）。兩者皆須裝。putior 查之並於缺時供助訊
- **Claude Desktop 中 R 路徑誤**：JSON 中 Windows 路徑需跳脫（`\\`）。用 8.3 短名以免空格：`C:\\PROGRA~1\\R\\R-45~1.0\\bin\\x64\\Rscript.exe`
- **忘重啟**：編配置後 Claude Desktop 須重啟。Claude Code 下次會話啟時取變
- **renv 隔離**：若 putior 裝於 renv 庫而 Claude Code/Desktop 啟 R 無 renv，則包不被找到。確 `mcptools` 與 `ellmer` 裝於全域庫或於 MCP 伺服器命令中配 renv 啟用
- **ACP port 衝突**：預 ACP port（8080）常用。啟前以 `lsof -i :8080` 或 `netstat -tlnp | grep 8080` 查
- **僅含特定工具**：暴露工具子集時建自訂 MCP 伺服器包裝用 `putior_mcp_tools(include = c("put", "put_diagram"))`
- **經 MCP 用自訂調色盤**：`put_diagram` 之 `palette` 參數需 `putior_theme` R 物件（由 `put_theme()` 建），不能跨 MCP 之 JSON 介序列化。MCP 呼用內建 `theme` 參數字串。自訂調色盤直用 R

## 相關技能

- `install-putior` — 前置：putior 與選擇性依賴須裝
- `configure-mcp-server` — Claude Code/Desktop 之通用 MCP 伺服器配置
- `troubleshoot-mcp-connection` — 若工具不現則診連接問題
- `build-custom-mcp-server` — 建包裝 putior 工具之自訂 MCP 伺服器
- `analyze-codebase-workflow` — 互動式用 MCP 工具行代碼庫分析
