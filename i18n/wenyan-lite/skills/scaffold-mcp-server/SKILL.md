---
name: scaffold-mcp-server
locale: wenyan-lite
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

# 構建 MCP 伺服器腳手架

依工具規格文件以官方 MCP SDK（TypeScript 或 Python）產生完整、可執行之 MCP 伺服器項目。

## 適用時機

- 已有工具規格（來自 `analyze-codebase-for-mcp` 或手寫）並需可運行之伺服器
- 新建 MCP 伺服器項目並欲從一開始有正確結構
- 將既有工具整合遷移至 MCP 協議
- 於完整實作前以工具表面原型測試 Claude Code
- 同時需伺服器骨架與 CI 之測試框架

## 輸入

- **必要**：工具規格文件（YAML 或 JSON，含工具名、參數、回傳類型）
- **必要**：目標語言（`typescript` 或 `python`）
- **必要**：傳輸類型（`stdio` 或 `sse`）
- **選擇性**：輸出目錄（預設：當前目錄）
- **選擇性**：套件名與版本
- **選擇性**：認證方式（`none`、`bearer-token`、`api-key`）
- **選擇性**：Docker 打包（`true` 或 `false`，預設：`false`）

## 步驟

### 步驟一：選擇 SDK 語言與傳輸

1.1. 依項目情境選擇實作語言：
   - **TypeScript**：適合 Node.js 生態、近 web 工具、JSON 重之工作負載
   - **Python**：適合資料科學、ML 與科學計算工具表面

1.2. 選擇傳輸機制：
   - **stdio**：本地工具執行之預設。Claude Code 將伺服器作為子程序啟動。
   - **SSE（Server-Sent Events）**：用於遠端/共享伺服器。需 HTTP 託管。

1.3. 決定認證需求：
   - **none**：本地 stdio 伺服器（程序級信任）
   - **bearer-token**：遠端 SSE 伺服器，靜態 token
   - **api-key**：遠端伺服器，每客戶之鑰匙

**預期：** 語言、傳輸與認證選擇已書面記錄。

**失敗時：** 若需求不明，預設 TypeScript + stdio + 無認證以最快達成可運行之伺服器。

### 步驟二：初始化項目結構

2.1. 建立項目目錄並初始化：

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

2.2. 建立標準目錄結構：

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

2.3. 為 npm（TypeScript）加 bin 入口或為 Python 加入口點：

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

**預期：** 可建構之項目骨架，所有依賴皆已安裝。

**失敗時：** 若 npm/pip 安裝失敗，檢查網路連線與註冊表存取。TypeScript 需 Node.js >= 18。Python 需 Python >= 3.10。

### 步驟三：依規格實作工具處理器

3.1. 解析工具規格文件，並為每工具產生處理器：

**TypeScript 處理器範本：**

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

**Python 處理器範本：**

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

3.2. 由規格為每工具類別產生一處理器文件。

3.3. 於類型檢查之外加入輸入驗證：
   - 字串長度限制
   - 數值範圍邊界
   - 列舉值約束
   - 必填欄位強制

3.4. 為所有預期之失敗模式加入結構化錯誤回應。

**預期：** 每類別一處理器文件，附類型化參數與錯誤處理。

**失敗時：** 若規格含模糊類型，預設 `string` 並加 TODO 註解供手動細修。

### 步驟四：配置傳輸

4.1. 以所選傳輸建立伺服器入口點：

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

4.2. 若需認證，加入中介層：
   - Bearer token：驗證 `Authorization` 標頭
   - API key：驗證 `X-API-Key` 標頭

4.3. 為 stdio 伺服器加 shebang 行以啟用直接執行：

```typescript
#!/usr/bin/env node
```

**預期：** 可運作之入口點於配置之傳輸啟動 MCP 伺服器。

**失敗時：** 若 SDK 版本與引入路徑不符，檢查 `@modelcontextprotocol/sdk` 版本並調整引入。SDK 於版本間重整路徑。

### 步驟五：建立測試框架

5.1. 建構測試框架以驗證每工具：

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

5.2. 為每工具建立測試夾具：有效輸入、無效輸入與邊緣案例。

5.3. 加 `test` 腳本至 `package.json` 或 `pyproject.toml`。

**預期：** 測試框架以有效與無效輸入皆運用每工具。

**失敗時：** 若 SDK 版本中無 `InMemoryTransport`，退回將伺服器作為子程序啟動並透過 stdio 管道通訊。

### 步驟六：產生文件與配置

6.1. 產生 `README.md`，含：
   - 項目描述
   - 安裝指引
   - Claude Code 配置命令
   - Claude Desktop JSON 配置片段
   - 工具列表附描述與參數架構
   - 開發與測試指引

6.2. 產生 Claude Code 註冊命令：

```bash
# stdio transport
claude mcp add $PACKAGE_NAME stdio "node" "dist/index.js"

# SSE transport
claude mcp add $PACKAGE_NAME -e API_KEY=your_key -- mcp-remote http://localhost:3000/mcp
```

6.3. 產生 Claude Desktop 配置片段：

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

6.4. 若已要求 Docker，產生 `Dockerfile`：

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

**預期：** 完整文件與配置文件可立即使用。

**失敗時：** 若產生之 README 含佔位值，搜尋項目以代換實際值。若 Docker 建構失敗，驗證基底映像符合所用之 Node.js/Python 版本。

## 驗證

- [ ] 項目無錯誤建構（`npm run build` 或等效）
- [ ] 伺服器啟動並回應 `tools/list` JSON-RPC 請求
- [ ] 規格中每工具皆已註冊且可發現
- [ ] 測試框架以有效輸入對所有工具通過
- [ ] 測試框架對無效輸入確認錯誤回應
- [ ] Claude Code 可經 `claude mcp add` 命令連接
- [ ] README 含可運作之安裝與配置指引
- [ ] 所有產生之代碼通過 linting（若已配置）

## 常見陷阱

- **SDK 引入路徑變化**：`@modelcontextprotocol/sdk` 套件於版本間重整其匯出。應始終檢查已安裝版本之實際匯出路徑。
- **遺忘 shebang**：直接呼叫之 stdio 伺服器需 `#!/usr/bin/env node` 作首行以可執行。
- **阻塞事件迴圈**：TypeScript 之工具處理器須為 `async`。同步操作阻塞伺服器上所有其他工具呼叫。
- **package.json 中遺漏 `type: "module"`**：MCP SDK 用 ESM 引入。無 `"type": "module"`，Node.js 將文件視為 CommonJS 而引入失敗。
- **Zod 架構漂移**：若工具規格演進而 Zod 架構未更新，驗證不匹配引發靜默失敗。應由單一真實源產生架構。
- **stdout 污染**：stdio 傳輸用 stdout 作 JSON-RPC。工具處理器中任何 `console.log` 將腐蝕協議流。應改用 `console.error` 或文件記錄器。

## 相關技能

- `analyze-codebase-for-mcp` - 產生此技能消費之工具規格
- `build-custom-mcp-server` - 複雜情況之手動伺服器實作
- `configure-mcp-server` - 將腳手架伺服器連至 Claude Code/Desktop
- `troubleshoot-mcp-connection` - 部署後除錯連線問題
- `containerize-mcp-server` - 將伺服器以 Docker 打包用於分發
