---
name: configure-putior-mcp
locale: wenyan-ultra
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

# 配 putior MCP 服

設 putior MCP 服，AI 助手（Claude Code、Claude Desktop）直呼工作流注與圖生具。

## 用

- 使 AI 助互式注與視工作流
- 設新開發境含 putior MCP 整
- 裝 putior 後欲 AI 助工作流文
- 經 ACP 配自動管道之代理間通

## 入

- **必**：putior 已裝（見 `install-putior`）
- **必**：目標客戶：Claude Code、Claude Desktop、俱
- **可**：亦配 ACP 服（默：否）
- **可**：ACP 服自主機/埠（默：localhost:8080）

## 行

### 一：裝 MCP 依

裝 MCP 服所需包。

```r
# Required: MCP framework
remotes::install_github("posit-dev/mcptools")

# Required: Tool definition framework
install.packages("ellmer")

# Verify both load
library(mcptools)
library(ellmer)
```

**得：** 兩包皆裝且無錯載。

**敗：** `mcptools` 須 `remotes`。先裝：`install.packages("remotes")`。GitHub 限率→於 `~/.Renviron` 設 `GITHUB_PAT`（加 `GITHUB_PAT=your_token_here` 且重啟 R）。**勿** 貼 token 於 shell 令或提交至控。

### 二：配 Claude Code（WSL/Linux/macOS）

加 putior MCP 服於 Claude Code 配。

```bash
# One-line setup
claude mcp add putior -- Rscript -e "putior::putior_mcp_server()"
```

WSL 含 Win R：
```bash
claude mcp add putior -- "/mnt/c/Program Files/R/R-4.5.2/bin/Rscript.exe" -e "putior::putior_mcp_server()"
```

驗配：
```bash
claude mcp list
claude mcp get putior
```

**得：** `putior` 現於 MCP 服列狀「configured」。

**敗：** Claude Code 不在 PATH→`export PATH="$HOME/.claude/local/node_modules/.bin:$PATH"`。Rscript 路誤→`which Rscript` 或 `ls "/mnt/c/Program Files/R/"` 尋 R。

### 三：配 Claude Desktop（Win）

加 putior 於 Claude Desktop MCP 配檔。

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

或含全路：
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

編配後重啟 Claude Desktop。

**得：** Claude Desktop 於 MCP 服列示 putior。具於談中可用。

**敗：** 以 JSON linter 驗語。察 R 路在。用 8.3 短名（`PROGRA~1`、`R-45~1.0`）以免空格問。

### 四：驗 16 具

測諸 MCP 具可達且行。

```r
# Get tool definitions
tools <- putior::putior_mcp_tools()
cat(sprintf("Total tools: %d\n", length(tools)))

# List tool names
vapply(tools, function(t) t$name, character(1))
```

16 具按類：

**核工作流（5）：**
- `put` — 掃檔尋 PUT 注（支 `exclude` 參以正則濾檔）
- `put_diagram` — 生 Mermaid 圖
- `put_auto` — 從碼自察工作流（支 `exclude` 參）
- `put_generate` — 生注建議（支 `exclude` 參）
- `put_merge` — 合手動+自動注（支 `exclude` 參）

**參/發現（7）：**
- `get_comment_prefix` — 取副檔名之注前綴
- `get_supported_extensions` — 列支副檔名
- `list_supported_languages` — 列支言
- `get_detection_patterns` — 取自察模
- `get_diagram_themes` — 列可用主題
- `putior_guide` — AI 助文
- `putior_help` — 速參助

**工具（3）：**
- `is_valid_put_annotation` — 驗注語
- `split_file_list` — 析檔列
- `ext_to_language` — 副檔名至言名

**配（1）：**
- `set_putior_log_level` — 配日冗度

> **要：自調色不可經 MCP 用。** `put_diagram` 之 `palette` 參受 `put_theme()` 建之 `putior_theme` R 物。因 MCP 經 JSON 通，R 物如 `putior_theme` 不可跨 MCP 界序。經 MCP 呼 `put_diagram`→用字串 `theme` 參（如 `theme = "viridis"`）。自調色→直於 R 會呼 `put_theme()` 與 `put_diagram(palette = ...)`。

於 Claude Code 測核具：
```
Use the putior_help tool to see available commands
Use the put tool to scan ./R/ for annotations
Use the put_diagram tool to generate a diagram
```

**得：** 諸 16 具列。核具於有效入呼時返預期果。

**敗：** 具缺→察 putior 版：`packageVersion("putior")`。舊版或具少。以 `remotes::install_github("pjt222/putior")` 更。

### 五：配 ACP 服（選）

設 ACP（Agent Communication Protocol）服以代理間通。

```r
# Install ACP dependency
install.packages("plumber2")

# Start ACP server (blocks — run in a separate R session or background)
putior::putior_acp_server()

# Custom host/port
putior::putior_acp_server(host = "0.0.0.0", port = 9000)
```

測 ACP 端：
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

**得：** ACP 服於已配埠啟。`/agents` 返 putior 代理清單。`/runs` 受自然語求且返工作流果。

**敗：** 8080 埠佔→指他埠。`plumber2` 未裝→服函印助訊建裝。

## 驗

- [ ] `putior::putior_mcp_tools()` 露核具（`put`、`put_diagram`、`put_auto`、`put_generate`、`put_merge`）且現版返約 16 具
- [ ] Claude Code：`claude mcp list` 示 `putior` 已配
- [ ] Claude Code：呼 `putior_help` 具返助文
- [ ] Claude Desktop：重啟後 putior 現於 MCP 服列
- [ ] 核具（`put`、`put_diagram`、`put_auto`）無錯行
- [ ] （選）ACP 服應 `curl http://localhost:8080/agents`

## 忌

- **mcptools 未裝**：MCP 服須 `mcptools`（GitHub）與 `ellmer`（CRAN）。俱裝。putior 察且缺時供助訊。
- **Claude Desktop R 路誤**：Win 路於 JSON 須轉義（`\\`）。用 8.3 短名避空：`C:\\PROGRA~1\\R\\R-45~1.0\\bin\\x64\\Rscript.exe`。
- **忘重啟**：Claude Desktop 編配檔後須重啟。Claude Code 下會啟取變。
- **renv 隔離**：putior 於 renv 庫裝但 Claude Code/Desktop 啟 R 無 renv→包未見。確 `mcptools` 與 `ellmer` 於全庫裝或於 MCP 服令配 renv 啟。
- **ACP 埠衝**：默 ACP 埠（8080）常用。啟前以 `lsof -i :8080` 或 `netstat -tlnp | grep 8080` 察。
- **僅露特具**：以 `putior_mcp_tools(include = c("put", "put_diagram"))` 建自 MCP 服封。
- **經 MCP 自調色**：`put_diagram` 之 `palette` 須 `put_theme()` 建之 `putior_theme` R 物，不可經 MCP JSON 介序。MCP 呼用內 `theme` 參字串。自調色用 R 直接。

## 參

- `install-putior` — 前置：putior 與選依須裝
- `configure-mcp-server` — 通 MCP 服配於 Claude Code/Desktop
- `troubleshoot-mcp-connection` - 具未現→診連問
- `build-custom-mcp-server` — 建封 putior 具之自 MCP 服
- `analyze-codebase-workflow` — 互式用 MCP 具析碼庫
