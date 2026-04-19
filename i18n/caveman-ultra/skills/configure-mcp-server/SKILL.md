---
name: configure-mcp-server
locale: caveman-ultra
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

# Configure MCP Server

Set up MCP server connections for Claude Code (WSL) + Claude Desktop (Windows).

## Use When

- Setting up Claude Code to connect to R via mcptools
- Configuring Claude Desktop w/ MCP servers
- Adding Hugging Face or other remote MCP servers
- Troubleshooting MCP connectivity between tools

## In

- **Required**: MCP server type (mcptools, Hugging Face, custom)
- **Required**: Client (Claude Code, Claude Desktop, or both)
- **Optional**: Auth tokens
- **Optional**: Custom server impl

## Do

### Step 1: Install MCP Server Packages

**For R (mcptools)**:

```r
install.packages("remotes")
remotes::install_github("posit-dev/mcptools")
```

**For Hugging Face**:

```bash
npm install -g mcp-remote
```

**→** `mcptools` installs from GitHub + loads in R w/o errs. `mcp-remote` avail globally via `which mcp-remote` or `npm list -g mcp-remote`.

**If err:** `mcptools` → ensure `remotes` installed first. GitHub rate-limits install → set `GITHUB_PAT` in `~/.Renviron`. `mcp-remote` → valid. Node.js + npm installed + on PATH.

### Step 2: Configure Claude Code (WSL)

**R mcptools server**:

```bash
claude mcp add r-mcptools stdio \
  "/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe" \
  -- -e "mcptools::mcp_server()"
```

**Hugging Face server**:

```bash
claude mcp add hf-mcp-server \
  -e HF_TOKEN=your_token_here \
  -- mcp-remote https://huggingface.co/mcp
```

**Verify config**:

```bash
claude mcp list
claude mcp get r-mcptools
```

**→** `claude mcp list` shows both `r-mcptools` + `hf-mcp-server` (or whichever added). `claude mcp get r-mcptools` displays correct cmd + args.

**If err:** Server not in list → valid. `~/.claude.json` contains correct entry. `claude` cmd not found → add to PATH: `export PATH="$HOME/.claude/local/node_modules/.bin:$PATH"`.

### Step 3: Configure Claude Desktop (Windows)

Edit `%APPDATA%\Claude\claude_desktop_config.json`:

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

**Important**: Use 8.3 short paths for Windows dirs w/ spaces (`PROGRA~1` not `Program Files`). Use env vars for tokens, not `--header` args.

**→** JSON config file at `%APPDATA%\Claude\claude_desktop_config.json` valid JSON w/ correct server entries. Claude Desktop shows MCP server indicators post-restart.

**If err:** Valid. JSON w/ linter (e.g., `jq . < config.json`). Use 8.3 short paths (`PROGRA~1`) if Windows path spaces cause parse errs. Ensure Claude Desktop fully restarted (not just minimized).

### Step 4: Configure R Session for MCP

Add to project `.Rprofile`:

```r
if (requireNamespace("mcptools", quietly = TRUE)) {
  mcptools::mcp_session()
}
```

Starts MCP session auto when opening project in RStudio.

**→** `.Rprofile` conditionally starts `mcptools::mcp_session()` when project opened in RStudio → MCP tools avail auto.

**If err:** `mcptools` not found at session start → valid. installed in library RStudio uses (check `.libPaths()`). Using renv → ensure mcptools in renv library.

### Step 5: Verify Connections

**Test R MCP from WSL**:

```bash
"/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe" -e "mcptools::mcp_server()"
```

**Test from w/in Claude Code**:

Start Claude Code + use MCP tools → they should appear in tool list.

**Test Claude Desktop**:

Restart Claude Desktop post-config changes. Check for MCP server indicators in UI.

**→** Rscript w/ `mcptools::mcp_server()` produces out w/o errs. MCP tools appear in Claude Code tool list during active session. Claude Desktop shows server status post-restart.

**If err:** Rscript fails → check full path correct (`ls "/mnt/c/Program Files/R/"` to valid. R ver). Tools don't appear in Claude Code → restart session. Claude Desktop → check firewall.

### Step 6: Multi-Server Configuration

Both Claude Code + Claude Desktop support multi MCP servers simultaneously:

```bash
# Claude Code: add multiple servers
claude mcp add r-mcptools stdio "/path/to/Rscript.exe" -- -e "mcptools::mcp_server()"
claude mcp add hf-mcp-server -e HF_TOKEN=token -- mcp-remote https://huggingface.co/mcp
claude mcp add custom-server stdio "/path/to/server" -- --port 3001
```

**→** Multi MCP servers config'd + accessible simultaneously. `claude mcp list` shows all. Each server's tools avail in same Claude Code session.

**If err:** Servers conflict → check each has unique name in config. One server blocks others → valid. servers use non-blocking I/O (stdio transport handles auto).

## Check

- [ ] `claude mcp list` shows all config'd servers
- [ ] R MCP server responds to tool calls
- [ ] Hugging Face MCP server auths + responds
- [ ] Both Claude Code + Claude Desktop can connect (if both config'd)
- [ ] MCP tools appear in tool list during sessions

## Traps

- **Windows path spaces**: Use 8.3 short names or quote paths correct. Diff tools parse paths differently.
- **Token in cmd args**: Windows, `--header "Authorization: Bearer token"` fails due to parsing. Use env vars instead.
- **Confuse Claude Code + Claude Desktop configs**: Separate tools w/ separate config files (`~/.claude.json` vs `%APPDATA%\Claude\`)
- **npx vs global install**: `npx mcp-remote` may fail in Claude Desktop context. Install globally w/ `npm install -g mcp-remote`.
- **mcptools ver**: Ensure mcptools up to date. Requires `ellmer` pkg as dep.

## →

- `build-custom-mcp-server` - creating your own MCP server
- `troubleshoot-mcp-connection` - debugging connection issues
- `setup-wsl-dev-environment` - WSL setup prerequisite
