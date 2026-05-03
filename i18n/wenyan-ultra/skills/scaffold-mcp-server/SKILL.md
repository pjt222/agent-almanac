---
name: scaffold-mcp-server
locale: wenyan-ultra
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

# 架 MCP 服

從工譜生完備可行 MCP 服項，用官 MCP SDK（TypeScript 或 Python）。

## 用

- 有工譜需可行服→用
- 始新 MCP 服項欲始即正→用
- 遷既工接於 MCP→用
- 原型工面預測 Claude Code→用
- 需服架與 CI 測台→用

## 入

- **必**：工譜文（YAML 或 JSON 含名、參、返）
- **必**：標語（`typescript` 或 `python`）
- **必**：傳型（`stdio` 或 `sse`）
- **可**：出目（默：當）
- **可**：包名與本
- **可**：認法（`none`、`bearer-token`、`api-key`）
- **可**：Docker 包（`true`/`false`，默 `false`）

## 行

### 一：選 SDK 語與傳

1.1. 按項境擇行語：
   - **TypeScript**：宜 Node.js 生、近網、JSON 重
   - **Python**：宜資科、ML、科算

1.2. 擇傳：
   - **stdio**：默為地行。Claude Code 啟服為子進程
   - **SSE**：遠/共服。需 HTTP 託

1.3. 定認需：
   - **none**：地 stdio（進程級信）
   - **bearer-token**：遠 SSE 含靜令
   - **api-key**：遠服含每客令

得：明語、傳、認擇文錄。

敗：需含糊→默 TypeScript + stdio + 無認以最快達工服。

### 二：始項結構

2.1. 建項目啟：

**TypeScript：**

```bash
mkdir -p $PROJECT_NAME && cd $PROJECT_NAME
npm init -y
npm install @modelcontextprotocol/sdk zod
npm install -D typescript @types/node tsx
npx tsc --init --target ES2022 --module nodenext --moduleResolution nodenext --outDir dist
```

**Python：**

```bash
mkdir -p $PROJECT_NAME && cd $PROJECT_NAME
python -m venv .venv
source .venv/bin/activate
pip install mcp pydantic
```

2.2. 建標目結構：

```
$PROJECT_NAME/
├── src/
│   ├── index.ts|main.py
│   ├── tools/
│   │   ├── index.ts|__init__.py
│   │   └── [category].ts|.py
│   └── utils/
│       └── validation.ts|.py
├── test/
│   ├── harness.ts|.py
│   └── tools/
│       └── [category].test.ts|.py
├── package.json|pyproject.toml
├── tsconfig.json
├── Dockerfile
└── README.md
```

2.3. 加 npm bin（TypeScript）或 Python 入點：

**TypeScript package.json：**

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

得：可建之項骨含諸依裝。

敗：npm/pip 裝敗→查網與譜達。TypeScript 需 Node.js ≥ 18。Python 需 ≥ 3.10。

### 三：行工處於譜

3.1. 析譜為各工生處：

**TypeScript 處板：**

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

**Python 處板：**

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

3.2. 為譜各類生一處檔。

3.3. 加入驗超於型查：
   - 串長限
   - 數範
   - 列值約
   - 必欄強

3.4. 為諸期敗模加結構誤應。

得：各類有處檔含型參與誤理。

敗：譜含模糊型→默 `string` 加 TODO 註以人精。

### 四：配傳

4.1. 建服入點含所擇傳：

**stdio（TypeScript）：**

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

**SSE（TypeScript）：**

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

4.2. 認需→加中介：
   - Bearer：驗 `Authorization` 頭
   - API key：驗 `X-API-Key` 頭

4.3. stdio 服加首行以可執：

```typescript
#!/usr/bin/env node
```

得：可行入點啟 MCP 服於配傳。

敗：SDK 本不合入路→查 `@modelcontextprotocol/sdk` 本、調入。SDK 本間重組路。

### 五：建測台

5.1. 築測台驗諸工：

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

  const tools = await client.listTools();
  console.assert(tools.tools.length === EXPECTED_TOOL_COUNT);

  for (const tool of tools.tools) {
    const result = await client.callTool({
      name: tool.name,
      arguments: getTestInput(tool.name),
    });
    console.assert(!result.isError, `${tool.name} failed`);
  }

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

5.2. 為各工建測夾：有效入、無效入、邊例。

5.3. 加 `test` 本至 `package.json` 或 `pyproject.toml`。

得：測台行諸工於有效與無效入。

敗：`InMemoryTransport` SDK 本無→退至子進程啟服經 stdio 管通。

### 六：生文與配

6.1. 生 `README.md` 含：
   - 項述
   - 裝令
   - Claude Code 配命
   - Claude Desktop JSON 配片
   - 工列含述與參譜
   - 開發測令

6.2. 生 Claude Code 註命：

```bash
# stdio transport
claude mcp add $PACKAGE_NAME stdio "node" "dist/index.js"

# SSE transport
claude mcp add $PACKAGE_NAME -e API_KEY=your_key -- mcp-remote http://localhost:3000/mcp
```

6.3. 生 Claude Desktop 配片：

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

6.4. Docker 求→生 `Dockerfile`：

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

得：完文與配檔可即用。

敗：生 README 含占位→項內搜實值代。Docker 建敗→驗基像合 Node.js/Python 本。

## 驗

- [ ] 項建無誤（`npm run build` 等）
- [ ] 服啟並應 `tools/list` JSON-RPC
- [ ] 譜諸工皆註可發
- [ ] 測台過諸工於有效入
- [ ] 測台確誤應於無效入
- [ ] Claude Code 經 `claude mcp add` 可連
- [ ] README 含可行裝配令
- [ ] 生碼過 lint（如配）

## 忌

- **SDK 入路改**：`@modelcontextprotocol/sdk` 本間重組出。必查裝本實出路
- **忘 shebang**：直行 stdio 服需首行 `#!/usr/bin/env node`
- **阻事循**：TypeScript 工處需 `async`。同步操阻服諸工
- **缺 `type: "module"`**：MCP SDK 用 ESM 入。缺則 Node.js 視為 CommonJS、入敗
- **Zod 譜漂**：工譜變而 Zod 不更→驗錯致默敗。從一源生譜
- **stdout 污**：stdio 傳用 stdout 為 JSON-RPC。工處內 `console.log` 壞流。用 `console.error` 或檔記

## 參

- `analyze-codebase-for-mcp`
- `build-custom-mcp-server`
- `configure-mcp-server`
- `troubleshoot-mcp-connection`
- `containerize-mcp-server`
