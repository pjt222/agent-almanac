---
name: configure-putior-mcp
locale: wenyan
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

# 設 putior MCP 伺

設 putior MCP 伺使 AI 助手（Claude Code、Claude Desktop）直呼流註與圖生具。

## 用時

- 啟 AI 助手互動註與視流
- 新開發境設附 putior MCP 合
- 裝 putior 後欲 AI 助流書
- 經 ACP 設使者間通為自管

## 入

- **必**：putior 已裝（見 `install-putior`）
- **必**：目客：Claude Code、Claude Desktop、或二
- **可選**：是否亦設 ACP 伺（默：否）
- **可選**：ACP 伺之自主/埠（默：localhost:8080）

## 法

### 第一步：裝 MCP 依

裝 MCP 伺功需包。

```r
# Required: MCP framework
remotes::install_github("posit-dev/mcptools")

# Required: Tool definition framework
install.packages("ellmer")

# Verify both load
library(mcptools)
library(ellmer)
```

**得：** 二包皆裝且載無誤。

**敗則：** `mcptools` 需 `remotes`。先裝之：`install.packages("remotes")`。若 GitHub 率限，於 `~/.Renviron` 設 `GITHUB_PAT`（加 `GITHUB_PAT=your_token_here` 而重啟 R）。**勿**貼符於殼令或提於版控。

### 第二步：設 Claude Code（WSL/Linux/macOS）

加 putior MCP 伺於 Claude Code 之設。

```bash
# One-line setup
claude mcp add putior -- Rscript -e "putior::putior_mcp_server()"
```

WSL 用 Windows R：
```bash
claude mcp add putior -- "/mnt/c/Program Files/R/R-4.5.2/bin/Rscript.exe" -e "putior::putior_mcp_server()"
```

驗設：
```bash
claude mcp list
claude mcp get putior
```

**得：** `putior` 現於 MCP 伺列附「configured」態。

**敗則：** 若 Claude Code 不於 PATH，加之：`export PATH="$HOME/.claude/local/node_modules/.bin:$PATH"`。若 Rscript 徑誤，以 `which Rscript` 或 `ls "/mnt/c/Program Files/R/"` 尋 R。

### 第三步：設 Claude Desktop（Windows）

加 putior 於 Claude Desktop 之 MCP 設檔。

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

或全徑：
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

編後重啟 Claude Desktop。

**得：** Claude Desktop 之 MCP 伺列示 putior。具於談中可用。

**敗則：** 以 JSON lint 驗法。察 R 徑存。若空格致問，用 8.3 短名（`PROGRA~1`、`R-45~1.0`）。

### 第四步：驗十六具

試諸 MCP 具可訪且可行。

```r
# Get tool definitions
tools <- putior::putior_mcp_tools()
cat(sprintf("Total tools: %d\n", length(tools)))

# List tool names
vapply(tools, function(t) t$name, character(1))
```

十六具依類：

**核心流（五）：**
- `put` — 掃檔尋 PUT 註（支 `exclude` 參之正則濾）
- `put_diagram` — 生 Mermaid 圖
- `put_auto` — 自碼察流（支 `exclude`）
- `put_generate` — 生註議（支 `exclude`）
- `put_merge` — 合手與自註（支 `exclude`）

**參/發現（七）：**
- `get_comment_prefix` — 得擴之注前綴
- `get_supported_extensions` — 列支擴
- `list_supported_languages` — 列支語
- `get_detection_patterns` — 得自察式
- `get_diagram_themes` — 列可用主
- `putior_guide` — AI 助文書
- `putior_help` — 速參助

**用（三）：**
- `is_valid_put_annotation` — 驗註法
- `split_file_list` — 析檔列
- `ext_to_language` — 擴轉語名

**設（一）：**
- `set_putior_log_level` — 設誌之詳

> **要：自定調不可經 MCP。**`put_diagram` 之 `palette` 參受 `put_theme()` 所建 `putior_theme` R 物。MCP 經 JSON 通，R 物如 `putior_theme` 不可越 MCP 界序。經 MCP 呼 `put_diagram` 時，用字之 `theme` 參代（如 `theme = "viridis"`）。自調用，直於 R 話呼 `put_theme()` 與 `put_diagram(palette = ...)`。

於 Claude Code 試核心具：
```
Use the putior_help tool to see available commands
Use the put tool to scan ./R/ for annotations
Use the put_diagram tool to generate a diagram
```

**得：** 諸十六具已列。核心具以有效入返期果。

**敗則：** 若具缺，察 putior 版為現：`packageVersion("putior")`。舊版或少具。以 `remotes::install_github("pjt222/putior")` 更。

### 第五步：設 ACP 伺（選）

設 ACP（Agent Communication Protocol）伺為使者間通。

```r
# Install ACP dependency
install.packages("plumber2")

# Start ACP server (blocks — run in a separate R session or background)
putior::putior_acp_server()

# Custom host/port
putior::putior_acp_server(host = "0.0.0.0", port = 9000)
```

試 ACP 端：
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

**得：** ACP 伺於設埠啟。`/agents` 返 putior 使者冊。`/runs` 受自然語請而返流果。

**敗則：** 若 8080 已用，定他埠。若 `plumber2` 未裝，伺函印助訊議裝。

## 驗

- [ ] `putior::putior_mcp_tools()` 露核心具（`put`、`put_diagram`、`put_auto`、`put_generate`、`put_merge`）且於當版返約十六具
- [ ] Claude Code：`claude mcp list` 示 `putior` 已設
- [ ] Claude Code：`putior_help` 具呼時返助文
- [ ] Claude Desktop：重啟後 putior 現於 MCP 伺列
- [ ] 核心具（`put`、`put_diagram`、`put_auto`）行無誤
- [ ]（選）ACP 伺應 `curl http://localhost:8080/agents`

## 陷

- **mcptools 未裝**：MCP 伺需 `mcptools`（自 GitHub）與 `ellmer`（自 CRAN）。二皆須裝。putior 察而若缺供助訊。
- **Claude Desktop 中 R 徑誤**：Windows 徑於 JSON 需逸（`\\`）。用 8.3 短名免空格：`C:\\PROGRA~1\\R\\R-45~1.0\\bin\\x64\\Rscript.exe`。
- **忘重啟**：Claude Desktop 編設後必重啟。Claude Code 於下話始取變。
- **renv 孤**：若 putior 裝於 renv 庫而 Claude Code/Desktop 啟 R 無 renv，包不得。確 `mcptools` 與 `ellmer` 裝於全庫或於 MCP 伺令中設 renv 啟。
- **ACP 之埠衝**：默 ACP 埠（8080）常用。啟前以 `lsof -i :8080` 或 `netstat -tlnp | grep 8080` 察。
- **只含特具**：露子集之具，建自 MCP 伺包時用 `putior_mcp_tools(include = c("put", "put_diagram"))`。
- **自定調經 MCP**：`put_diagram` 之 `palette` 參需 `putior_theme` R 物（`put_theme()` 所建），不可經 MCP JSON 界序。MCP 呼用內建 `theme` 字參。自定調直於 R 用。

## 參

- `install-putior` — 前提：putior 與選依必裝
- `configure-mcp-server` — Claude Code/Desktop 之通 MCP 伺設
- `troubleshoot-mcp-connection` — 診連問若具不現
- `build-custom-mcp-server` — 建包 putior 具之自 MCP 伺
- `analyze-codebase-workflow` — 互用 MCP 具為碼析
