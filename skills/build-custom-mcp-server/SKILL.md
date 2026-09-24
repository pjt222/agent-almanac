---
name: build-custom-mcp-server
description: >
  Build a custom MCP (Model Context Protocol) server that exposes
  domain-specific tools to AI assistants. Covers server implementation
  in Node.js or R, tool definitions, the resources and prompts primitives,
  transport configuration, and testing with Claude Code. Use when you need
  to expose custom functionality beyond
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

Create a custom MCP server that exposes domain-specific tools to AI assistants.

## When to Use

- Need to expose custom functionality to Claude Code or Claude Desktop
- Building specialized tools beyond what mcptools provides
- Creating a domain-specific AI assistant integration
- Wrapping existing APIs or services as MCP tools

## Inputs

- **Required**: List of tools to expose (name, description, parameters, behavior)
- **Required**: Implementation language (Node.js or R)
- **Required**: Transport type (stdio or HTTP)
- **Optional**: Authentication requirements
- **Optional**: Docker packaging needs

## Procedure

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

**Expected:** A YAML or markdown specification for each tool with name, description, parameters (including types, defaults, and required flags), and return type documented before writing any code.

**On failure:** If tool specifications are unclear, interview the domain expert or review the existing API documentation to determine parameter types and return formats.

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

**Expected:** A working `server.js` file that imports the MCP SDK, defines tools with Zod schemas, and connects via stdio transport. Running `node server.js` starts the server without errors.

**On failure:** Verify that `@modelcontextprotocol/sdk` and `zod` are installed (`npm install`). Check that the import paths match the SDK version (the SDK reorganized exports between versions).

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

**Expected:** A working `server.R` file that registers custom tools with `mcp_tool()` and starts the server with `mcp_server()`. Running `Rscript server.R` starts the MCP server.

**On failure:** Ensure `mcptools` is installed from GitHub (`remotes::install_github("posit-dev/mcptools")`). Check that the handler function signatures match the parameter definitions.

### Step 4: Decide Whether You Also Need Resources or Prompts

Tools are one of three server-side primitives, and reaching for a tool when the
protocol already has the right shape is the most common design mistake here. The
three differ by *who decides to invoke them*, and that difference is the whole
basis for choosing:

- **Tools** are model-controlled. The model decides to call one, usually to *do*
  something with side effects. Everything above this step.
- **Resources** are application-driven. The host application decides what to pull
  into context — through a picker, a search, or its own heuristics. The spec's
  examples are files, database schemas, and application-specific data. If your
  "tool" only reads and returns data with no side effect, it probably wants to be
  a resource.
- **Prompts** are user-controlled: "exposed from servers to clients with the
  intention of the user being able to explicitly select them", typically surfaced
  as slash commands. A reusable instruction template belongs here, not in a tool.

Each must be declared as a capability during initialization or the client will
never call it, and this is the usual reason a correctly implemented handler is
never reached. Add `resources` and `prompts` alongside `tools` in the capabilities
object. Both take optional `listChanged`, meaning the server will notify when its
list changes; `resources` additionally takes `subscribe`, for per-resource change
notifications. Declaring neither is valid — an empty `resources: {}` means the
feature is supported with no optional extras.

**For resources**, implement `resources/list` and `resources/read`. A resource is
identified by a `uri` and carries a `name`, plus optional `title`, `description`,
`mimeType` and `size`. `resources/read` returns a `contents` array whose entries
carry either `text` or a base64 `blob` — never both, and binary data must be
base64-encoded. For parameterized access add `resources/templates/list`, returning
entries with a `uriTemplate` in RFC 6570 syntax such as `file:///{path}`. If you
declared `listChanged`, emit `notifications/resources/list_changed`; if you
declared `subscribe`, honour `resources/subscribe` and emit
`notifications/resources/updated`. Return `-32002` for a URI you do not recognise,
which is a resource-specific code rather than the generic invalid-params one.

**For prompts**, implement `prompts/list` and `prompts/get`. A prompt has a `name`
and an optional `arguments` list whose entries carry `name`, `description` and
`required`. `prompts/get` returns a `messages` array; each message has a `role` of
`user` or `assistant` — note there is no `system` role — and a `content` object of
type `text`, `image`, `audio`, or `resource` for embedding server-managed content
directly. Validate arguments before processing and return `-32602` for both an
unknown prompt name and a missing required argument.

Both list operations support cursor pagination, so return `nextCursor` when your
list is long and accept `cursor` in the request.

**Expected:** The capabilities object names every primitive the server actually
implements, and a client's `resources/list` or `prompts/list` returns entries
rather than a method-not-found error.

**On failure:**
- Handler never invoked — the capability was not declared at initialization;
  capability negotiation happens once, before any request
- Client shows a resource but reading it fails — check the URI is valid per
  RFC 3986 and that you return `-32002` rather than an empty result for unknown
  URIs
- Binary resource renders as garbage — `blob` must be base64, and `mimeType` must
  be set; a binary payload placed in `text` will not be decoded
- A prompt renders with the roles collapsed — `system` is not a valid role; fold
  system-level instruction into the first `user` message

### Step 5: Set Up Project Structure

```text
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

**Expected:** Project directory created with `server.js` (or `server.R`), `package.json`, `tools/` directory for modular tool implementations, and `test/` directory for tests.

**On failure:** If the directory structure doesn't match your implementation language, adjust accordingly. R servers may use `R/` instead of `tools/` and `tests/testthat/` instead of `test/`.

### Step 6: Test the Server

**Manual testing with stdio**:

```bash
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node server.js
```

**Register with Claude Code**:

```bash
claude mcp add my-server stdio "node" "/path/to/server.js"
```

**Verify tools appear**:

Start a Claude Code session and check that custom tools are listed and functional.

**Expected:** The `tools/list` JSON-RPC call returns all defined tools with correct names and schemas. `claude mcp list` shows the server registered. Tools are callable from a Claude Code session.

**On failure:** If `tools/list` returns an empty array, the tools were not registered before `server.connect()`. If Claude Code cannot find the server, verify the command path in `claude mcp add` is absolute and the binary is executable.

### Step 7: Add Error Handling

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

**Expected:** Each tool handler is wrapped in try/catch. Invalid inputs return `isError: true` with a descriptive message instead of crashing the server process.

**On failure:** If the server still crashes on bad input, check that the try/catch wraps the entire handler body including any async operations. Ensure promises are awaited within the try block.

### Step 8: Package for Distribution

Create a `package.json` with a bin entry:

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

Users can then install and configure:

```bash
npm install -g my-mcp-server
claude mcp add my-server stdio "my-mcp-server"
```

**Expected:** A `package.json` with a `bin` entry pointing to the server entry point. Users can install globally with `npm install -g` and register with `claude mcp add`.

**On failure:** If the bin entry doesn't work after global install, ensure `server.js` has a shebang line (`#!/usr/bin/env node`) and is marked executable. Verify the package name doesn't conflict with existing npm packages.

## Validation

- [ ] Server starts without errors
- [ ] `tools/list` returns all defined tools with correct schemas
- [ ] Each tool executes correctly with valid input
- [ ] Tools return appropriate errors for invalid input
- [ ] Server works with Claude Code via stdio transport
- [ ] Tools are discoverable and usable in Claude sessions

## Common Pitfalls

- **Blocking operations**: MCP servers should handle requests asynchronously. Long-running operations block other tool calls.
- **Missing error handling**: Unhandled exceptions crash the server. Always wrap tool handlers in try/catch.
- **Schema mismatches**: Tool parameter schemas must exactly match what the handler expects
- **stdio buffering**: When using stdio transport, ensure output is flushed. Node.js buffers stdout by default.
- **Security**: MCP servers have the same access as the process. Validate inputs carefully, especially for shell commands or database queries.

## Related Skills

- `configure-mcp-server` - connect the built server to clients
- `troubleshoot-mcp-connection` - debug connectivity issues
- `containerize-mcp-server` - package the server in Docker
