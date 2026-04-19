---
name: configure-putior-mcp
locale: caveman
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

Set up putior MCP server so AI assistants (Claude Code, Claude Desktop) can directly call workflow annotation, diagram generation tools.

## When Use

- Enable AI assistants to interactively annotate, visualize workflows
- Set up new dev environment with putior MCP integration
- After install putior and want AI-assisted workflow documentation
- Configure agent-to-agent communication via ACP for automated pipelines

## Inputs

- **Required**: putior installed (see `install-putior`)
- **Required**: Target client: Claude Code, Claude Desktop, or both
- **Optional**: Whether to also configure ACP server (default: no)
- **Optional**: Custom host/port for ACP server (default: localhost:8080)

## Steps

### Step 1: Install MCP Dependencies

Install required packages for MCP server functionality.

```r
# Required: MCP framework
remotes::install_github("posit-dev/mcptools")

# Required: Tool definition framework
install.packages("ellmer")

# Verify both load
library(mcptools)
library(ellmer)
```

**Got:** Both packages install, load without errors.

**If fail:** `mcptools` requires `remotes` package. Install first: `install.packages("remotes")`. GitHub rate-limits? Configure `GITHUB_PAT` in `~/.Renviron` (add line `GITHUB_PAT=your_token_here`, restart R). Do **not** paste tokens into shell commands or commit them to version control.

### Step 2: Configure Claude Code (WSL/Linux/macOS)

Add putior MCP server to Claude Code configuration.

```bash
# One-line setup
claude mcp add putior -- Rscript -e "putior::putior_mcp_server()"
```

For WSL with Windows R:
```bash
claude mcp add putior -- "/mnt/c/Program Files/R/R-4.5.2/bin/Rscript.exe" -e "putior::putior_mcp_server()"
```

Verify configuration:
```bash
claude mcp list
claude mcp get putior
```

**Got:** `putior` appears in MCP server list with status "configured".

**If fail:** Claude Code not in PATH? Add: `export PATH="$HOME/.claude/local/node_modules/.bin:$PATH"`. Rscript path wrong? Locate R with `which Rscript` or `ls "/mnt/c/Program Files/R/"`.

### Step 3: Configure Claude Desktop (Windows)

Add putior to Claude Desktop MCP configuration file.

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

Or with full path:
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

Restart Claude Desktop after editing configuration.

**Got:** Claude Desktop shows putior in its MCP server list. Tools become available in conversation.

**If fail:** Validate JSON syntax with JSON linter. Check R path exists. Use 8.3 short names (`PROGRA~1`, `R-45~1.0`) if spaces in paths cause issues.

### Step 4: Verify All 16 Tools

Test all MCP tools accessible, functional.

```r
# Get tool definitions
tools <- putior::putior_mcp_tools()
cat(sprintf("Total tools: %d\n", length(tools)))

# List tool names
vapply(tools, function(t) t$name, character(1))
```

16 tools organized by category:

**Core Workflow (5):**
- `put` — Scan files for PUT annotations (supports `exclude` parameter for regex-based file filtering)
- `put_diagram` — Generate Mermaid diagrams
- `put_auto` — Auto-detect workflow from code (supports `exclude` parameter)
- `put_generate` — Generate annotation suggestions (supports `exclude` parameter)
- `put_merge` — Merge manual + auto annotations (supports `exclude` parameter)

**Reference/Discovery (7):**
- `get_comment_prefix` — Get comment prefix for extension
- `get_supported_extensions` — List supported extensions
- `list_supported_languages` — List supported languages
- `get_detection_patterns` — Get auto-detection patterns
- `get_diagram_themes` — List available themes
- `putior_guide` — AI assistant documentation
- `putior_help` — Quick reference help

**Utilities (3):**
- `is_valid_put_annotation` — Validate annotation syntax
- `split_file_list` — Parse file lists
- `ext_to_language` — Extension to language name

**Configuration (1):**
- `set_putior_log_level` — Configure logging verbosity

> **Important: Custom palettes cannot be used through MCP.** The `palette` parameter on `put_diagram` accepts a `putior_theme` R object created by `put_theme()`. Because MCP communicates via JSON, R objects like `putior_theme` cannot be serialized across MCP boundary. When calling `put_diagram` through MCP, use string-based `theme` parameter (e.g., `theme = "viridis"`) instead. For custom palettes, call `put_theme()` and `put_diagram(palette = ...)` directly in R session.

Test core tools from Claude Code:
```
Use the putior_help tool to see available commands
Use the put tool to scan ./R/ for annotations
Use the put_diagram tool to generate a diagram
```

**Got:** All 16 tools listed. Core tools return expected results when called with valid inputs.

**If fail:** Tools missing? Check putior version current: `packageVersion("putior")`. Older versions may have fewer tools. Update with `remotes::install_github("pjt222/putior")`.

### Step 5: Configure ACP Server (Optional)

Set up ACP (Agent Communication Protocol) server for agent-to-agent communication.

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

**Got:** ACP server starts on configured port. `/agents` returns putior agent manifest. `/runs` accepts natural language requests, returns workflow results.

**If fail:** Port 8080 in use? Specify different port. `plumber2` not installed? Server function prints helpful error message suggesting installation.

## Checks

- [ ] `putior::putior_mcp_tools()` exposes core tools (`put`, `put_diagram`, `put_auto`, `put_generate`, `put_merge`), returns ~16 tools for current version
- [ ] Claude Code: `claude mcp list` shows `putior` configured
- [ ] Claude Code: `putior_help` tool returns help text when invoked
- [ ] Claude Desktop: putior appears in MCP server list after restart
- [ ] Core tools (`put`, `put_diagram`, `put_auto`) execute without errors
- [ ] (Optional) ACP server responds to `curl http://localhost:8080/agents`

## Pitfalls

- **mcptools not installed**: MCP server requires `mcptools` (from GitHub) and `ellmer` (from CRAN). Both must be installed. putior checks, provides helpful messages if missing.
- **Wrong R path in Claude Desktop**: Windows paths need escaping in JSON (`\\`). Use 8.3 short names to avoid spaces: `C:\\PROGRA~1\\R\\R-45~1.0\\bin\\x64\\Rscript.exe`.
- **Forgetting to restart**: Claude Desktop must be restarted after editing config file. Claude Code picks up changes on next session start.
- **renv isolation**: putior installed in renv library but Claude Code/Desktop launches R without renv? Packages won't be found. Ensure `mcptools` and `ellmer` installed in global library or configure renv activation in MCP server command.
- **Port conflicts for ACP**: Default ACP port (8080) commonly used. Check with `lsof -i :8080` or `netstat -tlnp | grep 8080` before starting.
- **Including only specific tools**: To expose subset of tools, use `putior_mcp_tools(include = c("put", "put_diagram"))` when building custom MCP server wrappers.
- **Custom palettes via MCP**: `palette` parameter on `put_diagram` requires `putior_theme` R object (created by `put_theme()`), which cannot be serialized through MCP JSON interface. Use built-in `theme` parameter string for MCP calls. For custom palettes, use R directly.

## See Also

- `install-putior` — prerequisite: putior and optional deps must be installed
- `configure-mcp-server` — general MCP server configuration for Claude Code/Desktop
- `troubleshoot-mcp-connection` — diagnose connection issues if tools don't appear
- `build-custom-mcp-server` — build custom MCP servers that wrap putior tools
- `analyze-codebase-workflow` — use MCP tools interactively for codebase analysis
