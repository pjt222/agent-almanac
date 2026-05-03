---
name: scaffold-mcp-server
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Scaffold new MCP server from tool spec via official SDK (TS|Py), w/ transport config, tool handlers, test harness. Use → have spec + need working server, new MCP project right structure, migrate tool integ → MCP, prototype tool surface w/ Claude Code pre-impl.
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

Generate runnable MCP server project from tool spec → official MCP SDK (TS|Py).

## Use When

- Have spec (from `analyze-codebase-for-mcp` or manual) + need server
- New MCP project → right structure from start
- Migrate existing tool integ → MCP protocol
- Prototype tool surface → test w/ Claude Code pre-full-impl
- Need scaffold + test harness for CI

## In

- **Required**: Tool spec doc (YAML|JSON: tool names, params, return types)
- **Required**: Lang (`typescript`|`python`)
- **Required**: Transport (`stdio`|`sse`)
- **Optional**: Output dir (default: cwd)
- **Optional**: Pkg name + ver
- **Optional**: Auth (`none`|`bearer-token`|`api-key`)
- **Optional**: Docker (`true`|`false`, default `false`)

## Do

### Step 1: SDK Lang + Transport

1.1. Lang by ctx:
   - **TS**: Node.js, web-adj, JSON-heavy
   - **Py**: Data sci, ML, scientific tools

1.2. Transport:
   - **stdio**: Default local. Claude Code launches as subprocess.
   - **SSE**: Remote|shared. Needs HTTP host.

1.3. Auth:
   - **none**: Local stdio (proc-level trust)
   - **bearer-token**: Remote SSE w/ static tokens
   - **api-key**: Remote w/ per-client keys

→ Lang, transport, auth documented.

If err: ambiguous → default TS + stdio + no auth → fastest time-to-working.

### Step 2: Init Project

2.1. Mkdir + init:

**TS:**

```bash
mkdir -p $PROJECT_NAME && cd $PROJECT_NAME
npm init -y
npm install @modelcontextprotocol/sdk zod
npm install -D typescript @types/node tsx
npx tsc --init --target ES2022 --module nodenext --moduleResolution nodenext --outDir dist
```

**Py:**

```bash
mkdir -p $PROJECT_NAME && cd $PROJECT_NAME
python -m venv .venv
source .venv/bin/activate
pip install mcp pydantic
```

2.2. Standard structure:

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

2.3. Bin entry npm (TS) | entry point Py:

**TS package.json:**

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

→ Buildable skeleton w/ all deps installed.

If err: install fails → check net + registry. TS → Node ≥18. Py → Py ≥3.10.

### Step 3: Tool Handlers from Spec

3.1. Parse spec → per tool, gen handler:

**TS template:**

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

**Py template:**

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

3.2. One handler file per category from spec.

3.3. Validation beyond type checking:
   - String len limits
   - Numeric bounds
   - Enum constraints
   - Required field enforce

3.4. Structured err responses for anticipated failures.

→ Handler file per category w/ typed params + err handling.

If err: ambiguous types → default `string` + TODO for manual refine.

### Step 4: Configure Transport

4.1. Server entry w/ chosen transport:

**stdio (TS):**

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

**SSE (TS):**

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

4.2. Auth req → middleware:
   - Bearer token → validate `Authorization` header
   - API key → validate `X-API-Key` header

4.3. Shebang for stdio → direct exec:

```typescript
#!/usr/bin/env node
```

→ Working entry starts MCP server on transport.

If err: SDK ver ≠ import paths → check `@modelcontextprotocol/sdk` ver + adjust. SDK restructured paths between vers.

### Step 5: Test Harness

5.1. Validate every tool:

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

5.2. Test fixtures per tool: valid, invalid, edge cases.

5.3. Add `test` script → `package.json` | `pyproject.toml`.

→ Harness exercises every tool w/ valid+invalid.

If err: `InMemoryTransport` not in SDK ver → fall back to spawning server as subproc + stdio pipes.

### Step 6: Docs + Config

6.1. Gen `README.md` w/:
   - Project desc
   - Install instructions
   - Claude Code config cmd
   - Claude Desktop JSON snippet
   - Tool listing w/ descs + param schemas
   - Dev + test instructions

6.2. Gen Claude Code register cmd:

```bash
# stdio transport
claude mcp add $PACKAGE_NAME stdio "node" "dist/index.js"

# SSE transport
claude mcp add $PACKAGE_NAME -e API_KEY=your_key -- mcp-remote http://localhost:3000/mcp
```

6.3. Gen Claude Desktop config:

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

6.4. Docker requested → gen `Dockerfile`:

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

→ Complete docs + config for immediate use.

If err: README has placeholders → search project for actual vals to substitute. Docker fail → verify base img matches Node|Py ver.

## Check

- [ ] Builds w/o errs (`npm run build`|equiv)
- [ ] Server starts + responds `tools/list` JSON-RPC
- [ ] Every tool from spec registered + discoverable
- [ ] Harness passes valid inputs all tools
- [ ] Harness confirms err responses invalid inputs
- [ ] Claude Code connects via `claude mcp add`
- [ ] README has working install + config
- [ ] Gen code passes lint (if configured)

## Traps

- **SDK import path changes**: `@modelcontextprotocol/sdk` restructured between vers. Check installed ver export paths.
- **Forget shebang**: stdio invoked directly needs `#!/usr/bin/env node` first line.
- **Block event loop**: TS handlers must `async`. Sync ops block all other tool calls.
- **Missing `type: "module"`**: SDK uses ESM. Without → Node treats as CJS, imports fail.
- **Zod schema drift**: Spec evolves but Zod not updated → silent fails. Gen schemas from single source of truth.
- **stdout pollution**: stdio uses stdout for JSON-RPC. Any `console.log` in handlers corrupts. Use `console.error`|file logger.

## →

- `analyze-codebase-for-mcp` — gen spec this skill consumes
- `build-custom-mcp-server` — manual impl for complex
- `configure-mcp-server` — connect scaffold → Claude Code/Desktop
- `troubleshoot-mcp-connection` — debug post-deploy
- `containerize-mcp-server` — Docker for distribution
