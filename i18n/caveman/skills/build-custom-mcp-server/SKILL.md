---
name: build-custom-mcp-server
locale: caveman
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

Create custom MCP server exposing domain-specific tools to AI assistants.

## When Use

- Need to expose custom functionality to Claude Code or Claude Desktop
- Building specialized tools beyond what mcptools provides
- Creating domain-specific AI assistant integration
- Wrapping existing APIs or services as MCP tools

## Inputs

- **Required**: List of tools to expose (name, description, parameters, behavior)
- **Required**: Implementation language (Node.js or R)
- **Required**: Transport type (stdio or HTTP)
- **Optional**: Authentication requirements
- **Optional**: Docker packaging needs

## Steps

### Step 1: Define Tool Specifications

Before writing code, define each tool:

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

**Got:** YAML or markdown spec for each tool with name, description, parameters (types, defaults, required flags), return type documented before writing code.

**If fail:** Tool specifications unclear? Interview domain expert or review existing API documentation for parameter types and return formats.

### Step 2: Implement in Node.js (Using MCP SDK)

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

**Got:** Working `server.js` imports MCP SDK, defines tools with Zod schemas, connects via stdio transport. Running `node server.js` starts server without errors.

**If fail:** Verify `@modelcontextprotocol/sdk` and `zod` installed (`npm install`). Check import paths match SDK version (SDK reorganized exports between versions).

### Step 3: Implement in R (Using mcptools)

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

**Got:** Working `server.R` registers custom tools with `mcp_tool()`, starts server with `mcp_server()`. Running `Rscript server.R` starts MCP server.

**If fail:** Ensure `mcptools` installed from GitHub (`remotes::install_github("posit-dev/mcptools")`). Check handler function signatures match parameter definitions.

### Step 4: Set Up Project Structure

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

**Got:** Project directory created with `server.js` (or `server.R`), `package.json`, `tools/` directory for modular tool implementations, `test/` for tests.

**If fail:** Directory structure doesn't match implementation language? Adjust accordingly. R servers may use `R/` instead of `tools/` and `tests/testthat/` instead of `test/`.

### Step 5: Test the Server

**Manual testing with stdio**:

```bash
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node server.js
```

**Register with Claude Code**:

```bash
claude mcp add my-server stdio "node" "/path/to/server.js"
```

**Verify tools appear**:

Start Claude Code session, check custom tools listed and functional.

**Got:** `tools/list` JSON-RPC call returns all defined tools with correct names and schemas. `claude mcp list` shows server registered. Tools callable from Claude Code session.

**If fail:** `tools/list` returns empty array? Tools were not registered before `server.connect()`. Claude Code cannot find server? Verify command path in `claude mcp add` is absolute, binary is executable.

### Step 6: Add Error Handling

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

**Got:** Each tool handler wrapped in try/catch. Invalid inputs return `isError: true` with descriptive message instead of crashing server process.

**If fail:** Server still crashes on bad input? Check try/catch wraps entire handler body including async operations. Ensure promises awaited within try block.

### Step 7: Package for Distribution

Create `package.json` with bin entry:

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

Users install and configure:

```bash
npm install -g my-mcp-server
claude mcp add my-server stdio "my-mcp-server"
```

**Got:** `package.json` with `bin` entry pointing to server entry point. Users install globally with `npm install -g`, register with `claude mcp add`.

**If fail:** Bin entry doesn't work after global install? Ensure `server.js` has shebang line (`#!/usr/bin/env node`), is marked executable. Verify package name doesn't conflict with existing npm packages.

## Checks

- [ ] Server starts without errors
- [ ] `tools/list` returns all defined tools with correct schemas
- [ ] Each tool executes correctly with valid input
- [ ] Tools return appropriate errors for invalid input
- [ ] Server works with Claude Code via stdio transport
- [ ] Tools discoverable and usable in Claude sessions

## Pitfalls

- **Blocking operations**: MCP servers should handle requests asynchronously. Long-running operations block other tool calls.
- **Missing error handling**: Unhandled exceptions crash server. Always wrap tool handlers in try/catch.
- **Schema mismatches**: Tool parameter schemas must exactly match what handler expects
- **stdio buffering**: Using stdio transport? Ensure output flushed. Node.js buffers stdout by default.
- **Security**: MCP servers have same access as process. Validate inputs carefully, especially for shell commands or database queries.

## See Also

- `configure-mcp-server` - connect built server to clients
- `troubleshoot-mcp-connection` - debug connectivity issues
- `containerize-mcp-server` - package server in Docker
