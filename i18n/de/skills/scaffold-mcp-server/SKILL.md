---
name: scaffold-mcp-server
description: >
  Scaffold a new MCP server from tool specifications using the official SDK
  (TypeScript or Python), einschliesslich transport configuration, tool handlers,
  and test harness. Verwenden wenn you have a tool specification and need a working
  server, when starting a new MCP server project and want correct structure
  from the start, when migrating an existing tool integration to the MCP
  protocol, or when prototyping a tool surface to test with Claude Code vor
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
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# MCP-Server aufsetzen

Generieren a complete, runnable MCP server project from a tool specification document, using the official MCP SDK for TypeScript or Python.

## Wann verwenden

- You have a tool specification (from `analyze-codebase-for-mcp` or written manuell) and need a working server
- Starting a new MCP server project and want correct structure from the start
- Migrating an existing tool integration to the MCP protocol
- Prototyping a tool surface to test with Claude Code vor full implementation
- Need both der Server scaffold and a test harness for CI

## Eingaben

- **Erforderlich**: Tool specification document (YAML or JSON with tool names, parameters, return types)
- **Erforderlich**: Target language (`typescript` or `python`)
- **Erforderlich**: Transport type (`stdio` or `sse`)
- **Optional**: Output directory (default: current directory)
- **Optional**: Package name and version
- **Optional**: Authentication method (`none`, `bearer-token`, `api-key`)
- **Optional**: Docker packaging (`true` or `false`, default: `false`)

## Vorgehensweise

### Schritt 1: Auswaehlen SDK Language and Transport

1.1. Waehlen the implementation language basierend auf project context:
   - **TypeScript**: Best for Node.js ecosystems, web-adjacent tools, JSON-heavy workloads
   - **Python**: Best for data science, ML, and scientific computing tool surfaces

1.2. Waehlen the transport mechanism:
   - **stdio**: Default for local tool execution. Claude Code launches der Server as a subprocess.
   - **SSE (Server-Sent Events)**: For remote/shared servers. Requires HTTP hosting.

1.3. Bestimmen Authentifizierung requirements:
   - **none**: Local stdio servers (process-level trust)
   - **bearer-token**: Remote SSE servers with static tokens
   - **api-key**: Remote servers with per-client keys

**Erwartet:** Clear language, transport, and auth choices documented.

**Bei Fehler:** If requirements are ambiguous, default to TypeScript + stdio + no auth for fastest time-to-working-server.

### Schritt 2: Initialize Project Structure

2.1. Erstellen das Projekt directory and initialize:

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

2.2. Erstellen the standard Verzeichnisstruktur:

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

2.3. Hinzufuegen a bin entry for npm (TypeScript) or entry point for Python:

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

**Erwartet:** A buildable project skeleton with all Abhaengigkeiten installed.

**Bei Fehler:** If npm/pip install fails, check network connectivity and registry access. For TypeScript, ensure Node.js >= 18. For Python, ensure Python >= 3.10.

### Schritt 3: Implementieren Tool Handlers from Spec

3.1. Parsen the tool specification document and fuer jede tool, generate a handler:

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

3.2. Generieren one handler file per tool category from the specification.

3.3. Hinzufuegen input validation beyond type checking:
   - String length limits
   - Numeric range bounds
   - Enum value constraints
   - Required field enforcement

3.4. Hinzufuegen structured error responses for all anticipated failure modes.

**Erwartet:** A handler file per category with typed parameters and Fehlerbehandlung.

**Bei Fehler:** If the spec contains ambiguous types, default to `string` and add a TODO comment for manual refinement.

### Schritt 4: Konfigurieren Transport

4.1. Erstellen der Server entry point with the chosen transport:

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

4.2. If Authentifizierung ist erforderlich, add middleware:
   - Bearer token: validate `Authorization` header
   - API key: validate `X-API-Key` header

4.3. Hinzufuegen a shebang line for stdio servers to enable direct execution:

```typescript
#!/usr/bin/env node
```

**Erwartet:** A working entry point that starts the MCP server on the configured transport.

**Bei Fehler:** If the SDK version nicht match the import paths, check the `@modelcontextprotocol/sdk` version and adjust imports. The SDK restructured paths zwischen versions.

### Schritt 5: Erstellen Testen Harness

5.1. Erstellen a test harness that validates every tool:

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

5.2. Erstellen test fixtures fuer jede tool: valid inputs, invalid inputs, and Grenzfaelle.

5.3. Hinzufuegen a `test` script to `package.json` or `pyproject.toml`.

**Erwartet:** A test harness that exercises every tool with both valid and invalid inputs.

**Bei Fehler:** If `InMemoryTransport` ist nicht available in the SDK version, fall back to spawning der Server as a subprocess and communicating via stdio pipes.

### Schritt 6: Generieren Documentation and Configuration

6.1. Generieren a `README.md` with:
   - Project description
   - Installation instructions
   - Claude Code configuration command
   - Claude Desktop JSON configuration snippet
   - Tool listing with descriptions and parameter schemas
   - Development and testing instructions

6.2. Generieren Claude Code registration command:

```bash
# stdio transport
claude mcp add $PACKAGE_NAME stdio "node" "dist/index.js"

# SSE transport
claude mcp add $PACKAGE_NAME -e API_KEY=your_key -- mcp-remote http://localhost:3000/mcp
```

6.3. Generieren Claude Desktop configuration snippet:

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

6.4. If Docker was requested, generate a `Dockerfile`:

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

**Erwartet:** Abschliessen documentation and configuration files for immediate use.

**Bei Fehler:** If the generated README has placeholder values, search das Projekt for actual values to substitute. If Docker build fails, verify the base image matches the Node.js/Python version used.

## Validierung

- [ ] Project builds ohne errors (`npm run build` or equivalent)
- [ ] Server starts and responds to `tools/list` JSON-RPC request
- [ ] Every tool from the specification is registered and discoverable
- [ ] Testen harness passes for all tools with valid inputs
- [ ] Testen harness confirms error responses for invalid inputs
- [ ] Claude Code can connect via `claude mcp add` command
- [ ] README includes working installation and configuration instructions
- [ ] All generated code passes linting (if configured)

## Haeufige Stolperfallen

- **SDK import path changes**: The `@modelcontextprotocol/sdk` package restructured its exports zwischen versions. Always check the installed version's actual export paths.
- **Forgetting the shebang**: stdio servers invoked directly need `#!/usr/bin/env node` as the first line to be executable.
- **Blocking the event loop**: Tool handlers in TypeScript muss `async`. Synchronous operations block all other tool calls on der Server.
- **Missing `type: "module"` in package.json**: The MCP SDK uses ESM imports. Without `"type": "module"`, Node.js treats files as CommonJS and imports fail.
- **Zod schema drift**: If the tool spec evolves but Zod schemas sind nicht updated, validation mismatches cause silent failures. Generieren schemas from a single source of truth.
- **stdout pollution**: stdio transport uses stdout for JSON-RPC. Any `console.log` in tool handlers corrupts the protocol stream. Use `console.error` or a file logger stattdessen.

## Verwandte Skills

- `analyze-codebase-for-mcp` - generate the tool specification this skill consumes
- `build-custom-mcp-server` - manual server implementation for complex cases
- `configure-mcp-server` - connect the scaffolded server to Claude Code/Desktop
- `troubleshoot-mcp-connection` - debug connectivity issues nach deployment
- `containerize-mcp-server` - package der Server in Docker for distribution
