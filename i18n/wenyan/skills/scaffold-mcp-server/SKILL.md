---
name: scaffold-mcp-server
locale: wenyan
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

# 搭 MCP 服務

依工具之規，用官 MCP SDK（TypeScript 或 Python），生完備可行之 MCP 服務項目。

## 用時

- 已有工具之規（自 `analyze-codebase-for-mcp` 或人手書），需可行之服乃用
- 新立 MCP 服項目，欲自始得正之結構乃用
- 既有工具之集遷至 MCP 協乃用
- 全施前以 Claude Code 試工具之面乃用
- 需服之搭與 CI 之試套乃用

## 入

- **必要**：工具規之文（YAML 或 JSON，含工具名、參、返之類）
- **必要**：目標之語（`typescript` 或 `python`）
- **必要**：傳輸之類（`stdio` 或 `sse`）
- **可選**：出之目（默：當前目）
- **可選**：包之名與版
- **可選**：認證之法（`none`、`bearer-token`、`api-key`）
- **可選**：Docker 之裝（`true` 或 `false`，默：`false`）

## 法

### 第一步：擇 SDK 之語與傳輸

1.1. 依項目之境擇施之語：

- **TypeScript**：宜於 Node.js 之生態、近 web 之器、JSON 重之為
- **Python**：宜於數據科學、ML、科學計算之工具面

1.2. 擇傳輸之機：

- **stdio**：本地工具行之默。Claude Code 起服為子程
- **SSE（Server-Sent Events）**：為遠/共服。需 HTTP 之宿

1.3. 定認證之求：

- **none**：本地 stdio 服（程級之信）
- **bearer-token**：遠 SSE 服附靜令
- **api-key**：遠服每客之鑰

得：語、傳輸、認證之擇皆書。

敗則：求曖昧，默用 TypeScript + stdio + 無認證以最速得行之服。

### 第二步：始項目之結構

2.1. 建項目目而始：

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

2.2. 立標準目之結構：

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

2.3. 增 npm 之 bin 條（TypeScript）或 Python 之入點：

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

得：可建之項目骨，諸依皆裝。

敗則：npm/pip 裝敗，察網與註冊之訪。TypeScript 須 Node.js >= 18。Python 須 Python >= 3.10。

### 第三步：依規施工具之手

3.1. 析工具規之文，每工具生一手：

**TypeScript 之手模：**

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

**Python 之手模：**

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

3.2. 依規生每類一手文件。

3.3. 增類察之外之入驗：

- 串長之限
- 數範之界
- 枚值之約
- 必域之強

3.4. 增結構之誤應於諸預期之敗模。

得：每類一手文件，附類參與誤處。

敗則：規含曖昧之類，默為 `string` 並加 TODO 之注以待人手細之。

### 第四步：配傳輸

4.1. 立服之入點，附所擇之傳輸：

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

4.2. 若需認證，增中間件：

- Bearer 令：驗 `Authorization` 頭
- API 鑰：驗 `X-API-Key` 頭

4.3. stdio 服增 shebang 線，使可直行：

```typescript
#!/usr/bin/env node
```

得：行之入點，於所配傳輸啟 MCP 服。

敗則：SDK 版與引徑不合，察 `@modelcontextprotocol/sdk` 之版而調引。SDK 諸版間重構其徑。

### 第五步：建試套

5.1. 立試套以驗每工具：

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

5.2. 為每工具立試裝：有效之入、無效之入、邊例。

5.3. 增 `test` 本於 `package.json` 或 `pyproject.toml`。

得：試套以有效與無效之入皆練每工具。

敗則：SDK 版無 `InMemoryTransport`，退為起服為子程而以 stdio 管通。

### 第六步：生文檔與配置

6.1. 生 `README.md`，含：

- 項目之述
- 裝之令
- Claude Code 之配令
- Claude Desktop JSON 之配片
- 工具列含述與參之模
- 開發與試之令

6.2. 生 Claude Code 之註命：

```bash
# stdio transport
claude mcp add $PACKAGE_NAME stdio "node" "dist/index.js"

# SSE transport
claude mcp add $PACKAGE_NAME -e API_KEY=your_key -- mcp-remote http://localhost:3000/mcp
```

6.3. 生 Claude Desktop 之配片：

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

6.4. 若求 Docker，生 `Dockerfile`：

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

得：完備之文檔與配文件，可即用。

敗則：所生 README 含占位，於項目搜實值以代。Docker 建敗，驗基像合所用之 Node.js/Python 版。

## 驗

- [ ] 項目建無誤（`npm run build` 或等者）
- [ ] 服啟而應 `tools/list` JSON-RPC 之請
- [ ] 規之每工具皆註且可察
- [ ] 試套以有效之入皆過
- [ ] 試套確無效之入返誤
- [ ] Claude Code 可以 `claude mcp add` 連
- [ ] README 含可行之裝與配令
- [ ] 諸所生之碼皆過 lint（若已配）

## 陷

- **SDK 引徑之變**：`@modelcontextprotocol/sdk` 諸版間重構其出。常察所裝版之實出徑
- **忘 shebang**：直呼之 stdio 服需 `#!/usr/bin/env node` 為首線方可行
- **阻事件循環**：TypeScript 之手必為 `async`。同步操阻服上諸他工具呼
- **package.json 缺 `type: "module"`**：MCP SDK 用 ESM 引。無 `"type": "module"`，Node.js 視文件為 CommonJS 而引敗
- **Zod 模之漂**：規進而 Zod 模未更，驗不合致默敗。自單一真源生模
- **stdout 之污**：stdio 傳用 stdout 為 JSON-RPC。手中之 `console.log` 污協流。用 `console.error` 或文件日誌代之

## 參

- `analyze-codebase-for-mcp` — 生此技所用之工具規
- `build-custom-mcp-server` — 繁例之手施
- `configure-mcp-server` — 連所搭之服於 Claude Code/Desktop
- `troubleshoot-mcp-connection` — 展後察連之患
- `containerize-mcp-server` — 以 Docker 裝服以散布
