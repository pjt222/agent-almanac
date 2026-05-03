---
name: troubleshoot-mcp-connection
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Diagnose, fix MCP server connection issues between Claude Code,
  Claude Desktop, MCP servers. Covers Windows arg parsing,
  auth fails, transport issues, platform-specific debugging.
  Use when Claude Code or Claude Desktop fail connect to MCP server,
  when MCP tools don't appear, on "cannot attach server" errors,
  when working connection stopped, or when set up MCP on new machine.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mcp-integration
  complexity: intermediate
  language: multi
  tags: mcp, troubleshooting, debugging, connection, windows
---

# Troubleshoot MCP Connection

Diagnose, resolve MCP server connection failures.

## When Use

- Claude Code or Claude Desktop fails connect to MCP server
- MCP tools don't appear in sessions
- "Cannot attach server" errors
- Connection worked, now stopped
- Set up MCP on new machine

## Inputs

- **Required**: Error message or symptom description
- **Required**: Which client (Claude Code, Claude Desktop, both)
- **Required**: Which MCP server (mcptools, Hugging Face, custom)
- **Optional**: Recent changes to config or environment

## Steps

### Step 1: Identify Client and Config

**Claude Code** (WSL):

```bash
# View MCP configuration
claude mcp list
claude mcp get server-name

# Configuration stored in
cat ~/.claude.json | python3 -m json.tool
```

**Claude Desktop** (Windows):

```bash
# Configuration file location
cat "/mnt/c/Users/$USER/AppData/Roaming/Claude/claude_desktop_config.json"
```

**Got:** Config file located, readable. Shows MCP server entries with command, args, env fields.

**If fail:** Config file missing or empty? Server never configured. Use `configure-mcp-server` skill — set up from scratch.

### Step 2: Test Server Independent

**R mcptools**:

```bash
# Test if R can start the server
"/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe" -e "mcptools::mcp_server()"
```

If fail:
- Check R path: `ls "/mnt/c/Program Files/R/"`
- Check mcptools installed: `Rscript -e "library(mcptools)"`
- Check ellmer dep: `Rscript -e "library(ellmer)"`

**Hugging Face MCP**:

```bash
# Test mcp-remote directly
mcp-remote https://huggingface.co/mcp

# Check if mcp-remote is installed
which mcp-remote
npm list -g mcp-remote
```

**Got:** Server process starts. Produces init output (JSON-RPC handshake or "listening" msg). No errors.

**If fail:** R mcptools fails? Check R version path correct, mcptools installed in R library. mcp-remote fails? Reinstall global with `npm install -g mcp-remote`. Verify on PATH.

### Step 3: Diagnose Common Error Patterns

**"Cannot attach server" (Claude Desktop)**

Root cause: Windows command argument parsing.

Fix: Use env vars instead of `--header` args:

```json
{
  "hf-mcp-server": {
    "command": "mcp-remote",
    "args": ["https://huggingface.co/mcp"],
    "env": { "HF_TOKEN": "your_token" }
  }
}
```

Also ensure `mcp-remote` global installed (`npm install -g mcp-remote`) — no rely on `npx`.

**"Connection refused"**

- Server not running or wrong port
- Firewall blocks connection
- Wrong transport type (stdio vs HTTP)

**"Command not found"**

- Missing full path to executable
- PATH not configured in execution context
- On Windows: use `C:\\PROGRA~1\\...` for paths with spaces

**MCP tools don't appear, no error**

- Server starts but tools not registered
- Check server stdout for init messages
- Verify server uses correct MCP protocol version

**Got:** Error pattern matched to one documented category (cannot attach, connection refused, command not found, silent failure).

**If fail:** Error matches no known pattern? Capture full error output. Check server-side logs. Search exact error in MCP server's GitHub issues.

### Step 4: Check Network and Auth

```bash
# Test Hugging Face API connectivity
curl -I "https://huggingface.co/mcp"

# Verify token validity
curl -H "Authorization: Bearer $HF_TOKEN" https://huggingface.co/api/whoami
```

**Got:** HTTP endpoint returns 200. whoami returns Hugging Face username. Network and auth OK.

**If fail:** curl returns connection error? Check DNS, proxy. Token rejected (401)? Regenerate at huggingface.co/settings/tokens. Update config.

### Step 5: Verify JSON Config Syntax

```bash
# Validate JSON (common issue: trailing commas, missing quotes)
python3 -m json.tool /path/to/config.json
```

**Got:** JSON parses, no errors. Config syntax valid.

**If fail:** Common JSON issues — trailing commas after last entry, missing quotes around strings, mismatched braces. Fix syntax error from parser. Re-validate.

### Step 6: Platform-Specific Debugging

**Windows (Claude Desktop)**:
- Arg parsing differs from Unix
- Spaces in paths break command execution
- Use 8.3 short paths: `C:\PROGRA~1\R\R-45~1.0\bin\x64\Rscript.exe`
- Env vars more reliable than command-line headers

**WSL (Claude Code)**:
- Unix-style quoting works
- Full paths with spaces OK (quoted)
- npm/npx via NVM: ensure NVM loaded in execution context

**Got:** Platform-specific issue identified (Windows arg parsing, WSL path resolution, NVM context loading).

**If fail:** Windows-specific? Switch from command-line args to env vars for auth. WSL-specific? Verify Windows executable path accessible from WSL via `/mnt/c/...`.

### Step 7: Reset and Reconfigure

If all else fails:

```bash
# Remove and re-add the server (Claude Code)
claude mcp remove server-name
claude mcp add server-name stdio "/full/path/to/executable" -- args

# Restart Claude Desktop after config changes
# (close and reopen the application)
```

**Got:** After remove and re-add, `claude mcp list` shows server with correct config. Fresh connection succeeds.

**If fail:** Re-add fails? Check executable path correct. Run command directly in terminal — works? For Claude Desktop, ensure app fully closed (check system tray) before restart.

### Step 8: Check Logs

**Claude Code**: Look for MCP errors in terminal output when start session.

**Claude Desktop**: Check application logs (location varies by OS).

**Server-side**: Add logging to MCP server. Capture incoming requests, errors.

**Got:** Log entries reveal specific failure point (server startup, handshake, auth, tool registration).

**If fail:** No logs? Add `stderr` capture to server command (redirect to log file). Reproduce failure. For Claude Desktop, check `%APPDATA%\Claude\logs\` for app-level logs.

## Checks

- [ ] Server starts independent, no errors
- [ ] Config JSON valid
- [ ] Client connects
- [ ] MCP tools appear in session
- [ ] Tools execute when called
- [ ] Connection persists across multiple requests

## Pitfalls

- **Edit wrong config file**: Claude Code (`~/.claude.json`) vs Claude Desktop (`%APPDATA%\Claude\claude_desktop_config.json`)
- **No restart after config change**: Claude Desktop needs restart. Claude Code picks up changes on new session
- **npx in restricted env**: npx downloads packages at runtime. Network or permissions restricted? Install global
- **Token expiration**: Hugging Face tokens expire. Regenerate if auth fails appear sudden
- **Version mismatch**: MCP protocol versions must be compatible — client, server

## See Also

- `configure-mcp-server` - initial MCP setup
- `build-custom-mcp-server` - custom server debugging context
- `setup-wsl-dev-environment` - WSL prerequisite setup
