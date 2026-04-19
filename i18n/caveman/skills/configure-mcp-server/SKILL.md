---
name: configure-mcp-server
locale: caveman
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

Set up MCP server connections for Claude Code (WSL) and Claude Desktop (Windows).

## When Use

- Set up Claude Code to connect to R via mcptools
- Configure Claude Desktop with MCP servers
- Add Hugging Face or other remote MCP servers
- Troubleshoot MCP connectivity between tools

## Inputs

- **Required**: MCP server type (mcptools, Hugging Face, custom)
- **Required**: Client (Claude Code, Claude Desktop, or both)
- **Optional**: Authentication tokens
- **Optional**: Custom server implementation

## Steps

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

**Got:** `mcptools` installs from GitHub, loads in R without errors. `mcp-remote` available globally via `which mcp-remote` or `npm list -g mcp-remote`.

**If fail:** For `mcptools`, ensure `remotes` installed first. GitHub rate-limits install? Set `GITHUB_PAT` in `~/.Renviron`. For `mcp-remote`, verify Node.js, npm installed and on PATH.

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

**Verify configuration**:

```bash
claude mcp list
claude mcp get r-mcptools
```

**Got:** `claude mcp list` shows both `r-mcptools` and `hf-mcp-server` (or whichever servers added). `claude mcp get r-mcptools` displays correct command, arguments.

**If fail:** Server not appearing in list? Verify `~/.claude.json` contains correct entry. `claude` command not found? Add to PATH: `export PATH="$HOME/.claude/local/node_modules/.bin:$PATH"`.

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

**Important**: Use 8.3 short paths for Windows directories with spaces (`PROGRA~1` not `Program Files`). Use environment variables for tokens, not `--header` arguments.

**Got:** JSON config file at `%APPDATA%\Claude\claude_desktop_config.json` is valid JSON with correct server entries. Claude Desktop shows MCP server indicators after restart.

**If fail:** Validate JSON with linter (e.g., `jq . < config.json`). Use 8.3 short paths (`PROGRA~1`) if Windows path spaces cause parsing errors. Ensure Claude Desktop fully restarted (not minimized).

### Step 4: Configure R Session for MCP

Add to project `.Rprofile`:

```r
if (requireNamespace("mcptools", quietly = TRUE)) {
  mcptools::mcp_session()
}
```

Starts MCP session automatically when opening project in RStudio.

**Got:** `.Rprofile` conditionally starts `mcptools::mcp_session()` when project opened in RStudio. MCP tools available automatically.

**If fail:** `mcptools` not found at session start? Verify installed in library RStudio uses (check `.libPaths()`). Using renv? Ensure mcptools in renv library.

### Step 5: Verify Connections

**Test R MCP from WSL**:

```bash
"/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe" -e "mcptools::mcp_server()"
```

**Test from within Claude Code**:

Start Claude Code, use MCP tools — should appear in tool list.

**Test Claude Desktop**:

Restart Claude Desktop after configuration changes. Check for MCP server indicators in UI.

**Got:** Running Rscript with `mcptools::mcp_server()` produces output without errors. MCP tools appear in Claude Code tool list during active session. Claude Desktop shows server status after restart.

**If fail:** Rscript command fails? Check full path correct (`ls "/mnt/c/Program Files/R/"` to verify R version). Tools don't appear in Claude Code? Restart session. Claude Desktop? Check firewall settings.

### Step 6: Multi-Server Configuration

Both Claude Code and Claude Desktop support multiple MCP servers simultaneously:

```bash
# Claude Code: add multiple servers
claude mcp add r-mcptools stdio "/path/to/Rscript.exe" -- -e "mcptools::mcp_server()"
claude mcp add hf-mcp-server -e HF_TOKEN=token -- mcp-remote https://huggingface.co/mcp
claude mcp add custom-server stdio "/path/to/server" -- --port 3001
```

**Got:** Multiple MCP servers configured, accessible simultaneously. `claude mcp list` shows all servers. Each server's tools available in same Claude Code session.

**If fail:** Servers conflict? Check each has unique name in configuration. One server blocks others? Verify servers use non-blocking I/O (stdio transport handles this automatically).

## Checks

- [ ] `claude mcp list` shows all configured servers
- [ ] R MCP server responds to tool calls
- [ ] Hugging Face MCP server authenticates, responds
- [ ] Both Claude Code and Claude Desktop can connect (if both configured)
- [ ] MCP tools appear in tool list during sessions

## Pitfalls

- **Windows path spaces**: Use 8.3 short names or quote paths correctly. Different tools parse paths differently.
- **Token in command args**: On Windows, `--header "Authorization: Bearer token"` fails due to parsing. Use environment variables instead.
- **Confusing Claude Code and Claude Desktop configs**: Separate tools with separate config files (`~/.claude.json` vs `%APPDATA%\Claude\`)
- **npx vs global install**: `npx mcp-remote` may fail in Claude Desktop context. Install globally with `npm install -g mcp-remote`.
- **mcptools version**: Ensure mcptools up to date. Requires `ellmer` package as dependency.

## See Also

- `build-custom-mcp-server` - creating own MCP server
- `troubleshoot-mcp-connection` - debugging connection issues
- `setup-wsl-dev-environment` - WSL setup prerequisite
