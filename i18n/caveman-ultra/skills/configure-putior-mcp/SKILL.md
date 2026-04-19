---
name: configure-putior-mcp
locale: caveman-ultra
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

# Configure putior MCP Server

Set up putior MCP server → AI assistants (Claude Code, Claude Desktop) can directly call workflow annotation + diagram gen tools.

## Use When

- Enable AI assistants to interactively annotate + visualize workflows
- Set up new dev env w/ putior MCP integration
- Post-install putior → want AI-assisted workflow docs
- Configure agent-to-agent comm via ACP for automated pipelines

## In

- **Required**: putior installed (see `install-putior`)
- **Required**: Target client: Claude Code, Claude Desktop, or both
- **Optional**: Configure ACP server too (default: no)
- **Optional**: Custom host/port for ACP server (default: localhost:8080)

## Do

### Step 1: Install MCP Dependencies

Install req'd pkgs for MCP server functionality.

```r
# Required: MCP framework
remotes::install_github("posit-dev/mcptools")

# Required: Tool definition framework
install.packages("ellmer")

# Verify both load
library(mcptools)
library(ellmer)
```

**→** Both pkgs install + load w/o errs.

**If err:** `mcptools` requires `remotes` pkg. Install first: `install.packages("remotes")`. GitHub rate-limits → configure `GITHUB_PAT` in `~/.Renviron` (add line `GITHUB_PAT=your_token_here` + restart R). Do **NOT** paste tokens into shell cmds or commit to version control.

### Step 2: Configure Claude Code (WSL/Linux/macOS)

Add putior MCP server to Claude Code's config.

```bash
# One-line setup
claude mcp add putior -- Rscript -e "putior::putior_mcp_server()"
```

For WSL w/ Windows R:
```bash
claude mcp add putior -- "/mnt/c/Program Files/R/R-4.5.2/bin/Rscript.exe" -e "putior::putior_mcp_server()"
```

Verify config:
```bash
claude mcp list
claude mcp get putior
```

**→** `putior` appears in MCP server list w/ status "configured".

**If err:** Claude Code not in PATH → add: `export PATH="$HOME/.claude/local/node_modules/.bin:$PATH"`. Rscript path wrong → locate R w/ `which Rscript` or `ls "/mnt/c/Program Files/R/"`.

### Step 3: Configure Claude Desktop (Windows)

Add putior to Claude Desktop's MCP config file.

Edit `%APPDATA%\Claude\claude_desktop_config.json`:

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

Or w/ full path:
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

Restart Claude Desktop post-edit.

**→** Claude Desktop shows putior in MCP server list. Tools become avail in conversation.

**If err:** Valid. JSON syntax w/ JSON linter. Check R path exists. Use 8.3 short names (`PROGRA~1`, `R-45~1.0`) if spaces in paths cause issues.

### Step 4: Verify All 16 Tools

Test all MCP tools accessible + functional.

```r
# Get tool definitions
tools <- putior::putior_mcp_tools()
cat(sprintf("Total tools: %d\n", length(tools)))

# List tool names
vapply(tools, function(t) t$name, character(1))
```

16 tools organized by category:

**Core Workflow (5):**
- `put` — Scan files for PUT annotations (supports `exclude` param for regex-based file filtering)
- `put_diagram` — Generate Mermaid diagrams
- `put_auto` — Auto-detect workflow from code (supports `exclude` param)
- `put_generate` — Gen annotation suggestions (supports `exclude` param)
- `put_merge` — Merge manual + auto annotations (supports `exclude` param)

**Reference/Discovery (7):**
- `get_comment_prefix` — Get comment prefix for extension
- `get_supported_extensions` — List supported extensions
- `list_supported_languages` — List supported languages
- `get_detection_patterns` — Get auto-detection patterns
- `get_diagram_themes` — List available themes
- `putior_guide` — AI assistant docs
- `putior_help` — Quick reference help

**Utilities (3):**
- `is_valid_put_annotation` — Valid. annotation syntax
- `split_file_list` — Parse file lists
- `ext_to_language` — Extension to language name

**Configuration (1):**
- `set_putior_log_level` — Configure logging verbosity

> **Important: Custom palettes can't be used through MCP.** `palette` param on `put_diagram` accepts `putior_theme` R object created by `put_theme()`. MCP comms via JSON → R objects like `putior_theme` can't be serialized across MCP boundary. Calling `put_diagram` through MCP → use string-based `theme` param (e.g., `theme = "viridis"`) instead. Custom palettes → call `put_theme()` + `put_diagram(palette = ...)` directly in R session.

Test core tools from Claude Code:
```
Use the putior_help tool to see available commands
Use the put tool to scan ./R/ for annotations
Use the put_diagram tool to generate a diagram
```

**→** All 16 tools listed. Core tools return expected results when called w/ valid in.

**If err:** Tools missing → check putior ver current: `packageVersion("putior")`. Older vers may have fewer tools. Update w/ `remotes::install_github("pjt222/putior")`.

### Step 5: Configure ACP Server (Optional)

Set up ACP (Agent Comm Protocol) server for agent-to-agent comm.

```r
# Install ACP dependency
install.packages("plumber2")

# Start ACP server (blocks — run in a separate R session or background)
putior::putior_acp_server()

# Custom host/port
putior::putior_acp_server(host = "0.0.0.0", port = 9000)
```

Test ACP endpoints:
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

**→** ACP server starts on config'd port. `/agents` returns putior agent manifest. `/runs` accepts natural language reqs + returns workflow results.

**If err:** Port 8080 in use → specify diff port. `plumber2` not installed → server fn will print helpful err msg suggesting install.

## Check

- [ ] `putior::putior_mcp_tools()` exposes core tools (`put`, `put_diagram`, `put_auto`, `put_generate`, `put_merge`) + returns ~16 tools for current ver
- [ ] Claude Code: `claude mcp list` shows `putior` configured
- [ ] Claude Code: `putior_help` tool returns help text when invoked
- [ ] Claude Desktop: putior appears in MCP server list post-restart
- [ ] Core tools (`put`, `put_diagram`, `put_auto`) execute w/o errs
- [ ] (Optional) ACP server responds to `curl http://localhost:8080/agents`

## Traps

- **mcptools not installed**: MCP server requires `mcptools` (from GitHub) + `ellmer` (from CRAN). Both must be installed. putior checks + provides helpful msgs if missing.
- **Wrong R path in Claude Desktop**: Windows paths need escaping in JSON (`\\`). Use 8.3 short names to avoid spaces: `C:\\PROGRA~1\\R\\R-45~1.0\\bin\\x64\\Rscript.exe`.
- **Forget to restart**: Claude Desktop must be restarted post-config edit. Claude Code picks up changes on next session start.
- **renv isolation**: putior installed in renv library but Claude Code/Desktop launches R w/o renv → pkgs not found. Ensure `mcptools` + `ellmer` installed in global library or configure renv activation in MCP server cmd.
- **Port conflicts for ACP**: Default ACP port (8080) commonly used. Check w/ `lsof -i :8080` or `netstat -tlnp | grep 8080` before starting.
- **Include only specific tools**: Expose subset of tools → use `putior_mcp_tools(include = c("put", "put_diagram"))` when building custom MCP server wrappers.
- **Custom palettes via MCP**: `palette` param on `put_diagram` requires `putior_theme` R object (created by `put_theme()`), can't be serialized through MCP's JSON interface. Use built-in `theme` param string for MCP calls. Custom palettes → use R directly.

## →

- `install-putior` — prerequisite: putior + optional deps must be installed
- `configure-mcp-server` — general MCP server config for Claude Code/Desktop
- `troubleshoot-mcp-connection` — diagnose connection issues if tools don't appear
- `build-custom-mcp-server` — build custom MCP servers wrapping putior tools
- `analyze-codebase-workflow` — use MCP tools interactively for codebase analysis
