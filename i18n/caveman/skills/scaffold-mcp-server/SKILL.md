---
name: scaffold-mcp-server
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Scaffold a new MCP server from tool specifications using the official SDK
  (TypeScript or Python), including transport configuration, tool handlers,
  and test harness. Use when you have a tool specification and need a working
  server, when starting a new MCP server project and want correct structure
  from the start, when migrating an existing tool integration to the MCP
  protocol, or when prototyping a tool surface to test with Claude Code before
  full implementation.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mcp-integration
  complexity: intermediate
  language: multi
  tags: mcp, scaffold, sdk, typescript, python, server
---

# Scaffold MCP Server

Generate complete, runnable MCP server project from tool spec. Use official MCP SDK for TypeScript or Python.

## When Use

- Have tool spec (from `analyze-codebase-for-mcp` or written) and need working server
- Start new MCP server project, want correct structure from start
- Migrate existing tool integration to MCP protocol
- Prototype tool surface to test with Claude Code before full impl
- Need both server scaffold + test harness for CI

## Inputs

- **Required**: Tool spec doc (YAML or JSON with tool names, params, return types)
- **Required**: Target language (`typescript` or `python`)
- **Required**: Transport type (`stdio` or `sse`)
- **Optional**: Output dir (default: current)
- **Optional**: Package name + version
- **Optional**: Auth method (`none`, `bearer-token`, `api-key`)
- **Optional**: Docker packaging (`true` or `false`, default: `false`)

## Steps

### Step 1: Select SDK Language and Transport

1.1. Choose language by project context.
   - **TypeScript**: Best for Node.js, web tools, JSON-heavy
   - **Python**: Best for data science, ML, scientific computing

1.2. Choose transport.
   - **stdio**: Default for local. Claude Code launches server as subprocess.
   - **SSE (Server-Sent Events)**: For remote/shared. Needs HTTP hosting.

1.3. Determine auth.
   - **none**: Local stdio (process-level trust)
   - **bearer-token**: Remote SSE with static tokens
   - **api-key**: Remote with per-client keys

**Got:** Clear language, transport, auth choices documented.

**If fail:** Requirements ambiguous? Default TypeScript + stdio + no auth for fastest time-to-working-server.

### Step 2: Initialize Project Structure

2.1. Create project dir + init.

**TypeScript:**

```bash
mkdir -p $PROJECT_NAME && cd $PROJECT_NAME
npm init -y
npm install @modelcontextprotocol/sdk zod
npm install -D typescript @types/node tsx
npx tsc --init --target ES2022 --module nodenext --moduleResolution nodenext --outDir dist
```

**Python:**

```bash
mkdir -p $PROJECT_NAME && cd $PROJECT_NAME
python -m venv .venv
source .venv/bin/activate
pip install mcp pydantic
```

2.2. Standard dir structure.

```
$PROJECT_NAME/
├── src/
│   ├── index.ts|main.py      # Server entry point
│   ├── tools/                 # One file per tool category
│   │   ├── index.ts|__init__.py
│   │   └── [category].ts|.py
│   └── utils/                 # Shared utilities
│       └── validation.ts|.py
├── test/
│   ├── harness.ts|.py         # MCP test harness
│   └── tools/
│       └── [category].test.ts|.py
├── package.json|pyproject.toml
├── tsconfig.json              # TypeScript only
├── Dockerfile                 # If Docker requested
└── README.md
```

2.3. Add bin entry for npm (TS) or entry point for Python.

**TypeScript package.json:**

```json
{
  "name": "$PACKAGE_NAME",
  "version": "1.0.0",
  "type": "module",
  "bin": { "$PACKAGE_NAME": "./dist/index.js" },
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsx src/index.ts",
    "test": "tsx test/harness.ts"
  }
}
```

**Got:** Buildable project skeleton with all deps installed.

**If fail:** npm/pip install fails? Check network + registry access. TS: ensure Node.js >= 18. Python: ensure Python >= 3.10.

### Step 3: Implement Tool Handlers from Spec

3.1. Parse tool spec doc, generate handler per tool.

**TypeScript handler template:**

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerTools(server: McpServer): void {
  server.tool(
    "tool_name",
    "Tool description from spec",
    {
      param1: z.string().describe("Parameter description"),
      param2: z.number().optional().default(10).describe("Optional param"),
    },
    async ({ param1, param2 }) => {
      try {
        // TODO: Implement tool logic
        const result = await performAction(param1, param2);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error: ${(error as Error).message}` }],
          isError: true,
        };
      }
    }
  );
}
```

**Python handler template:**

```python
from mcp.server import Server
from mcp.types import Tool, TextContent
from pydantic import BaseModel

class ToolNameParams(BaseModel):
    param1: str
    param2: int = 10

async def handle_tool_name(params: ToolNameParams) -> list[TextContent]:
    try:
        result = await perform_action(params.param1, params.param2)
        return [TextContent(type="text", text=json.dumps(result, indent=2))]
    except Exception as e:
        return [TextContent(type="text", text=f"Error: {e}")]
```

3.2. Generate one handler file per tool category from spec.

3.3. Add input validation beyond type check.
   - String length limits
   - Numeric range bounds
   - Enum value constraints
   - Required field enforcement

3.4. Add structured error responses for all anticipated failures.

**Got:** Handler file per category with typed params + error handling.

**If fail:** Spec contains ambiguous types? Default to `string`, add TODO for manual refinement.

### Step 4: Configure Transport

4.1. Make server entry with chosen transport.

**stdio (TypeScript):**

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTools } from "./tools/index.js";

const server = new McpServer({
  name: "$PACKAGE_NAME",
  version: "1.0.0",
});

registerTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);
```

**SSE (TypeScript):**

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { registerTools } from "./tools/index.js";

const server = new McpServer({
  name: "$PACKAGE_NAME",
  version: "1.0.0",
});

registerTools(server);

const transport = new SSEServerTransport("/messages", response);
await server.connect(transport);
```

4.2. If auth needed, add middleware.
   - Bearer token: validate `Authorization` header
   - API key: validate `X-API-Key` header

4.3. Add shebang for stdio servers to enable direct exec.

```typescript
#!/usr/bin/env node
```

**Got:** Working entry that starts MCP server on configured transport.

**If fail:** SDK version does not match import paths? Check `@modelcontextprotocol/sdk` version, adjust imports. SDK restructured paths between versions.

### Step 5: Create Test Harness

5.1. Build harness that validates every tool.

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

async function runTests(): Promise<void> {
  const server = createServer();
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  await server.connect(serverTransport);
  const client = new Client({ name: "test-client", version: "1.0.0" });
  await client.connect(clientTransport);

  // Test: tools/list returns all expected tools
  const tools = await client.listTools();
  console.assert(tools.tools.length === EXPECTED_TOOL_COUNT);

  // Test: each tool with valid input
  for (const tool of tools.tools) {
    const result = await client.callTool({
      name: tool.name,
      arguments: getTestInput(tool.name),
    });
    console.assert(!result.isError, `${tool.name} failed`);
  }

  // Test: each tool with invalid input returns isError
  for (const tool of tools.tools) {
    const result = await client.callTool({
      name: tool.name,
      arguments: getInvalidInput(tool.name),
    });
    console.assert(result.isError, `${tool.name} should reject invalid input`);
  }

  console.log("All tests passed");
}
```

5.2. Make test fixtures per tool: valid, invalid, edge cases.

5.3. Add `test` script to `package.json` or `pyproject.toml`.

**Got:** Test harness exercises every tool with valid + invalid inputs.

**If fail:** `InMemoryTransport` not in SDK version? Fall back to spawning server as subprocess, communicate via stdio pipes.

### Step 6: Generate Documentation and Configuration

6.1. Generate `README.md` with.
   - Project description
   - Install instructions
   - Claude Code config command
   - Claude Desktop JSON snippet
   - Tool listing with descriptions, param schemas
   - Dev + testing instructions

6.2. Generate Claude Code registration command.

```bash
# stdio transport
claude mcp add $PACKAGE_NAME stdio "node" "dist/index.js"

# SSE transport
claude mcp add $PACKAGE_NAME -e API_KEY=your_key -- mcp-remote http://localhost:3000/mcp
```

6.3. Generate Claude Desktop config snippet.

```json
{
  "mcpServers": {
    "$PACKAGE_NAME": {
      "command": "node",
      "args": ["path/to/dist/index.js"]
    }
  }
}
```

6.4. If Docker requested, generate `Dockerfile`.

```dockerfile
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-slim
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json .
ENTRYPOINT ["node", "dist/index.js"]
```

**Got:** Complete docs + config files for immediate use.

**If fail:** README has placeholder values? Search project for actual values to substitute. Docker build fails? Verify base image matches Node.js/Python version used.

## Checks

- [ ] Project builds without errors (`npm run build` or equiv)
- [ ] Server starts, responds to `tools/list` JSON-RPC request
- [ ] Every tool from spec registered, discoverable
- [ ] Test harness passes for all tools with valid inputs
- [ ] Test harness confirms error responses for invalid inputs
- [ ] Claude Code can connect via `claude mcp add` command
- [ ] README has working install + config instructions
- [ ] All generated code passes linting (if configured)

## Pitfalls

- **SDK import path changes**: `@modelcontextprotocol/sdk` package restructured exports between versions. Always check installed version's actual export paths.
- **Forget shebang**: stdio servers invoked direct need `#!/usr/bin/env node` as first line to be executable.
- **Block event loop**: Tool handlers in TS must be `async`. Sync ops block all other tool calls on server.
- **Missing `type: "module"` in package.json**: MCP SDK uses ESM imports. Without it, Node.js treats files as CommonJS, imports fail.
- **Zod schema drift**: Tool spec evolves but Zod schemas not updated = validation mismatches = silent failures. Generate schemas from single source of truth.
- **stdout pollution**: stdio transport uses stdout for JSON-RPC. Any `console.log` in tool handlers corrupts protocol stream. Use `console.error` or file logger.

## See Also

- `analyze-codebase-for-mcp` - generate tool spec this skill consumes
- `build-custom-mcp-server` - manual server impl for complex cases
- `configure-mcp-server` - connect scaffolded server to Claude Code/Desktop
- `troubleshoot-mcp-connection` - debug connectivity issues after deployment
- `containerize-mcp-server` - package server in Docker for distribution
