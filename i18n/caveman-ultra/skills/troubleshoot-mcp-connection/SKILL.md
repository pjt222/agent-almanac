---
name: troubleshoot-mcp-connection
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Diagnose and fix MCP server connection issues between Claude Code,
  Claude Desktop, and MCP servers. Covers Windows argument parsing,
  authentication failures, transport issues, and platform-specific
  debugging. Use when Claude Code or Claude Desktop fails to connect to
  an MCP server, when MCP tools don't appear in sessions, on "cannot
  attach the server" errors, when a working connection has stopped, or
  when setting up MCP on a new machine.
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

Diag + resolve MCP server connection failures.

## Use When

- Claude Code|Desktop fails to connect to MCP server
- MCP tools don't appear in sess
- "Cannot attach the server" err
- Connection worked → stopped
- Setting up MCP on new machine

## In

- **Required**: Err msg|symptom
- **Required**: Client (Claude Code, Desktop, both)
- **Required**: MCP server (mcptools, HF, custom)
- **Optional**: Recent config|env changes

## Do

### Step 1: ID Client + Config

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

**Got:** Config file located + readable, MCP server entries w/ command, args, env.

**If err:** Config doesn't exist|empty → never configured. Follow `configure-mcp-server` from scratch.

### Step 2: Test Server Independently

**R mcptools**:

```bash
# Test if R can start the server
"/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe" -e "mcptools::mcp_server()"
```

Fails:
- R path: `ls "/mnt/c/Program Files/R/"`
- mcptools installed: `Rscript -e "library(mcptools)"`
- ellmer dep: `Rscript -e "library(ellmer)"`

**HF MCP**:

```bash
# Test mcp-remote directly
mcp-remote https://huggingface.co/mcp

# Check if mcp-remote is installed
which mcp-remote
npm list -g mcp-remote
```

**Got:** Server proc starts + init out (JSON-RPC handshake or "listening") no errs.

**If err:** R mcptools fails → check R ver path correct + mcptools in R lib. mcp-remote fails → reinstall global `npm install -g mcp-remote` + verify on PATH.

### Step 3: Diag Common Err Patterns

**"Cannot attach the server" (Claude Desktop)**

Root: Windows cmd arg parsing.

Fix: env vars instead of `--header`:

```json
{
  "hf-mcp-server": {
    "command": "mcp-remote",
    "args": ["https://huggingface.co/mcp"],
    "env": { "HF_TOKEN": "your_token" }
  }
}
```

Also ensure `mcp-remote` global (`npm install -g mcp-remote`), not relying on `npx`.

**"Connection refused"**

- Server not running|wrong port
- Firewall blocking
- Wrong transport (stdio vs HTTP)

**"Command not found"**

- Missing full path to exec
- PATH not configured in exec ctx
- Windows: `C:\\PROGRA~1\\...` for paths w/ spaces

**MCP tools missing, no err**

- Server starts, tools not registered
- Check server stdout for init msgs
- Verify correct MCP protocol ver

**Got:** Err pattern matched to documented category (cannot attach, conn refused, cmd not found, silent fail).

**If err:** No match → capture full err out + check server logs. Search exact err in MCP server's GitHub issues.

### Step 4: Network + Auth

```bash
# Test Hugging Face API connectivity
curl -I "https://huggingface.co/mcp"

# Verify token validity
curl -H "Authorization: Bearer $HF_TOKEN" https://huggingface.co/api/whoami
```

**Got:** HTTP returns 200, whoami returns HF username → confirms net + auth.

**If err:** curl conn err → DNS|proxy. Token rejected (401) → regen at huggingface.co/settings/tokens + update config.

### Step 5: Verify JSON Syntax

```bash
# Validate JSON (common issue: trailing commas, missing quotes)
python3 -m json.tool /path/to/config.json
```

**Got:** JSON parses no errs → valid syntax.

**If err:** Common: trailing commas after last entry, missing quotes around strings, mismatched braces. Fix syntax err per parser + re-validate.

### Step 6: Platform-Specific Debug

**Windows (Claude Desktop)**:
- Arg parsing differs from Unix
- Spaces in paths break exec
- 8.3 short paths: `C:\PROGRA~1\R\R-45~1.0\bin\x64\Rscript.exe`
- env vars > cmd-line headers

**WSL (Claude Code)**:
- Unix quoting works
- Full paths w/ spaces (quoted)
- npm/npx via NVM → ensure NVM loaded in exec ctx

**Got:** Platform-specific issue ID'd (Windows arg parsing, WSL path resolve, NVM ctx).

**If err:** Windows-specific → switch cmd-line args → env vars for auth. WSL-specific → verify Windows exec path accessible from WSL via full `/mnt/c/...`.

### Step 7: Reset + Reconfigure

All else fails:

```bash
# Remove and re-add the server (Claude Code)
claude mcp remove server-name
claude mcp add server-name stdio "/full/path/to/executable" -- args

# Restart Claude Desktop after config changes
# (close and reopen the application)
```

**Got:** After remove + re-add, `claude mcp list` shows correct config + fresh conn succeeds.

**If err:** Re-add fails → check exec path correct + cmd works direct in terminal. Claude Desktop → ensure fully closed (system tray) before restart.

### Step 8: Logs

**Claude Code**: MCP errs in terminal out at sess start.

**Claude Desktop**: App logs (location varies by OS).

**Server-side**: Add logging → capture incoming reqs + errs.

**Got:** Logs reveal specific point of fail (server start, handshake, auth, tool reg).

**If err:** No logs → add `stderr` capture to server cmd (redirect to log file) + reproduce. Claude Desktop → `%APPDATA%\Claude\logs\` for app logs.

## Check

- [ ] Server starts independently no errs
- [ ] Config JSON valid
- [ ] Client connects success
- [ ] MCP tools appear in sess
- [ ] Tools exec when called
- [ ] Conn persists across reqs

## Traps

- **Wrong config file**: Claude Code (`~/.claude.json`) vs Desktop (`%APPDATA%\Claude\claude_desktop_config.json`)
- **No restart after config**: Desktop needs restart; Code picks up on new sess
- **npx in restricted env**: npx downloads at runtime. Net|perms restricted → install global.
- **Token expiration**: HF tokens expire. Regen if auth fails suddenly.
- **Version mismatch**: MCP protocol vers must be compat between client + server

## →

- `configure-mcp-server` — initial MCP setup
- `build-custom-mcp-server` — custom server debug ctx
- `setup-wsl-dev-environment` — WSL prereq setup
