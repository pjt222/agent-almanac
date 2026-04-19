---
name: build-custom-mcp-server
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Build a custom MCP (Model Context Protocol) server that exposes
  domain-specific tools to AI assistants. Covers server implementation
  in Node.js or R, tool definitions, transport configuration, and testing
  with Claude Code. Use when you need to expose custom functionality beyond
  what mcptools provides, when building specialized domain-specific AI
  integrations, or when wrapping existing APIs or services as MCP tools.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mcp-integration
  complexity: advanced
  language: multi
  tags: mcp, server, custom-tools, node-js, protocol
---

# Build Custom MCP Server

Custom MCP server → expose domain-specific tools to AI assistants.

## Use When

- Expose custom fn to Claude Code / Claude Desktop
- Specialized tools beyond mcptools
- Domain-specific AI assistant integration
- Wrap existing APIs/services as MCP tools

## In

- **Required**: Tool list (name, desc, params, behavior)
- **Required**: Impl lang (Node.js or R)
- **Required**: Transport (stdio or HTTP)
- **Optional**: Auth reqs
- **Optional**: Docker packaging needs

## Do

### Step 1: Define Tool Specs

Before code, define each tool:

```yaml
tools:
  - name: query_database
    description: Execute a read-only SQL query against the analysis database
    parameters:
      query:
        type: string
        description: SQL SELECT query to execute
        required: true
      limit:
        type: integer
        description: Maximum rows to return
        default: 100
    returns: JSON array of result rows

  - name: run_analysis
    description: Execute a predefined statistical analysis by name
    parameters:
      analysis_name:
        type: string
        description: Name of the analysis to run
        enum: [descriptive, regression, survival]
      dataset:
        type: string
        description: Dataset identifier
        required: true
```

**→** YAML/md spec per tool w/ name, desc, params (types, defaults, required), return type documented before code.

**If err:** Specs unclear → interview domain expert or review existing API docs for param types + return formats.

### Step 2: Impl in Node.js (MCP SDK)

```javascript
// server.js
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "my-analysis-server",
  version: "1.0.0",
});

// Define tools
server.tool(
  "query_database",
  "Execute a read-only SQL query against the analysis database",
  {
    query: z.string().describe("SQL SELECT query"),
    limit: z.number().default(100).describe("Max rows to return"),
  },
  async ({ query, limit }) => {
    // Validate read-only
    if (!/^\s*SELECT/i.test(query)) {
      return {
        content: [{ type: "text", text: "Error: Only SELECT queries allowed" }],
        isError: true,
      };
    }

    const results = await executeQuery(query, limit);
    return {
      content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
    };
  }
);

server.tool(
  "run_analysis",
  "Execute a predefined statistical analysis",
  {
    analysis_name: z.enum(["descriptive", "regression", "survival"]),
    dataset: z.string().describe("Dataset identifier"),
  },
  async ({ analysis_name, dataset }) => {
    const result = await runAnalysis(analysis_name, dataset);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

// Start server with stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
```

**→** Working `server.js` imports MCP SDK, defines tools w/ Zod schemas, connects via stdio. `node server.js` starts w/o errs.

**If err:** Verify `@modelcontextprotocol/sdk` + `zod` installed (`npm install`). Check import paths match SDK ver (SDK reorganized exports between versions).

### Step 3: Impl in R (mcptools)

```r
# server.R
library(mcptools)

# Register custom tools
mcp_tool(
  name = "query_database",
  description = "Execute a read-only SQL query",
  parameters = list(
    query = list(type = "string", description = "SQL SELECT query"),
    limit = list(type = "integer", description = "Max rows", default = 100)
  ),
  handler = function(query, limit = 100) {
    if (!grepl("^\\s*SELECT", query, ignore.case = TRUE)) {
      stop("Only SELECT queries allowed")
    }
    result <- DBI::dbGetQuery(con, paste(query, "LIMIT", limit))
    jsonlite::toJSON(result, auto_unbox = TRUE)
  }
)

# Start server
mcptools::mcp_server()
```

**→** Working `server.R` registers tools w/ `mcp_tool()`, starts via `mcp_server()`. `Rscript server.R` starts MCP server.

**If err:** `mcptools` installed from GitHub (`remotes::install_github("posit-dev/mcptools")`). Handler fn signatures match param defs.

### Step 4: Project Structure

```
my-mcp-server/
├── package.json          # Node.js dependencies
├── server.js             # Server implementation
├── tools/                # Tool implementations
│   ├── database.js
│   └── analysis.js
├── test/                 # Tests
│   └── tools.test.js
├── Dockerfile            # Container packaging
└── README.md             # Setup instructions
```

**→** Project dir w/ `server.js` (or `server.R`), `package.json`, `tools/` for modular tool impls, `test/` for tests.

**If err:** Structure doesn't match impl lang → adjust. R servers may use `R/` vs `tools/` + `tests/testthat/` vs `test/`.

### Step 5: Test Server

**Manual stdio test**:

```bash
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node server.js
```

**Register w/ Claude Code**:

```bash
claude mcp add my-server stdio "node" "/path/to/server.js"
```

**Verify tools appear**:

Start Claude Code session, check custom tools listed + functional.

**→** `tools/list` JSON-RPC returns all tools w/ correct names + schemas. `claude mcp list` shows server registered. Tools callable from session.

**If err:** `tools/list` returns empty → tools not registered before `server.connect()`. Claude Code can't find → verify cmd path in `claude mcp add` absolute + binary executable.

### Step 6: Error Handling

```javascript
server.tool("risky_operation", "...", schema, async (params) => {
  try {
    const result = await performOperation(params);
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});
```

**→** Each handler wrapped in try/catch. Invalid in → `isError: true` w/ desc msg, not crash.

**If err:** Still crashes on bad in → try/catch wraps full handler body incl async. Promises awaited in try block.

### Step 7: Package for Distribution

Create `package.json` w/ bin entry:

```json
{
  "name": "my-mcp-server",
  "version": "1.0.0",
  "bin": {
    "my-mcp-server": "./server.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "zod": "^3.22.0"
  }
}
```

Users install + configure:

```bash
npm install -g my-mcp-server
claude mcp add my-server stdio "my-mcp-server"
```

**→** `package.json` w/ `bin` entry pointing to entry point. Users install globally w/ `npm install -g` + register w/ `claude mcp add`.

**If err:** Bin entry doesn't work after global install → `server.js` has shebang (`#!/usr/bin/env node`) + marked executable. Pkg name doesn't conflict w/ existing npm.

## Check

- [ ] Server starts w/o errs
- [ ] `tools/list` returns all tools w/ correct schemas
- [ ] Each tool executes correctly w/ valid in
- [ ] Tools return appropriate errs for invalid in
- [ ] Works w/ Claude Code via stdio
- [ ] Tools discoverable + usable in Claude sessions

## Traps

- **Blocking ops**: Handle req async. Long ops block other tool calls
- **Missing err handling**: Unhandled exceptions crash. Always wrap in try/catch
- **Schema mismatch**: Param schemas must exactly match handler expects
- **stdio buffering**: Ensure out flushed. Node.js buffers stdout by default
- **Security**: MCP servers have same access as process. Validate in carefully, esp shell cmds/DB queries

## →

- `configure-mcp-server` — connect built server to clients
- `troubleshoot-mcp-connection` — debug connectivity
- `containerize-mcp-server` — package in Docker
