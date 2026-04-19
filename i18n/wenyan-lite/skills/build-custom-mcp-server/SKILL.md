---
name: build-custom-mcp-server
locale: wenyan-lite
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

建自訂 MCP 伺服器以向 AI 助手暴露領域專之工具。

## 適用時機

- 須向 Claude Code 或 Claude Desktop 暴露自訂功能
- 建超 mcptools 所提之專工具
- 創領域專之 AI 助手整合
- 包既有 API 或服務為 MCP 工具

## 輸入

- **必要**：所暴露之工具列（名、描述、參數、行為）
- **必要**：實作語（Node.js 或 R）
- **必要**：傳輸類（stdio 或 HTTP）
- **選擇性**：驗證需求
- **選擇性**：Docker 打包之需

## 步驟

### 步驟一：定工具規

書代碼前，定每工具：

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

**預期：** 每工具之 YAML 或 markdown 規，含名、描、參（含類、預設、必須旗）、返類，於書代碼前已錄。

**失敗時：** 若工具規不明，訪域專或審既有 API 文檔以定參類與返格式。

### 步驟二：以 Node.js 實作（用 MCP SDK）

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

**預期：** 可工作之 `server.js`，引 MCP SDK、以 Zod 綱定工具、以 stdio 傳輸連。運行 `node server.js` 不錯啟伺服器。

**失敗時：** 驗 `@modelcontextprotocol/sdk` 與 `zod` 已裝（`npm install`）。查引路合 SDK 版（SDK 於版間重組導出）。

### 步驟三：以 R 實作（用 mcptools）

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

**預期：** 可工作之 `server.R`，以 `mcp_tool()` 註自訂工具、以 `mcp_server()` 啟伺服器。運行 `Rscript server.R` 啟 MCP 伺服器。

**失敗時：** 確 `mcptools` 自 GitHub 裝（`remotes::install_github("posit-dev/mcptools")`）。查處理函之簽名合參數定義。

### 步驟四：立項目結構

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

**預期：** 項目目錄已創，含 `server.js`（或 `server.R`）、`package.json`、模組工具實作之 `tools/`、測之 `test/`。

**失敗時：** 若結構與實作語不合，相應調。R 伺服器或用 `R/` 代 `tools/`，`tests/testthat/` 代 `test/`。

### 步驟五：測伺服器

**以 stdio 手動測**：

```bash
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node server.js
```

**於 Claude Code 註**：

```bash
claude mcp add my-server stdio "node" "/path/to/server.js"
```

**驗工具顯**：

啟 Claude Code 會話，查自訂工具已列且可行。

**預期：** `tools/list` JSON-RPC 呼返諸定工具及正綱。`claude mcp list` 顯所註伺服器。工具於 Claude Code 會話可呼。

**失敗時：** 若 `tools/list` 返空陣列，工具於 `server.connect()` 前未註。若 Claude Code 不尋伺服器，驗 `claude mcp add` 中之命令路為絕對且二進可執。

### 步驟六：加錯處

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

**預期：** 每工具處理包 try/catch。無效輸入返 `isError: true` 附描訊，非崩伺服器。

**失敗時：** 若伺服器仍崩於壞輸入，查 try/catch 包全處理體，含任 async 操作。確 promises 於 try 塊內 awaited。

### 步驟七：打包以分發

建 `package.json` 附 bin 項：

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

用戶乃可裝並配：

```bash
npm install -g my-mcp-server
claude mcp add my-server stdio "my-mcp-server"
```

**預期：** `package.json` 附指向伺服器入口之 `bin` 項。用戶可以 `npm install -g` 全域裝、以 `claude mcp add` 註。

**失敗時：** 若全域裝後 bin 項不工，確 `server.js` 有 shebang 行（`#!/usr/bin/env node`）且標為可執。驗套件名不衝既有 npm 套件。

## 驗證

- [ ] 伺服器無錯啟
- [ ] `tools/list` 返諸定工具及正綱
- [ ] 每工具以有效輸入正執
- [ ] 工具對無效輸入返合錯
- [ ] 伺服器以 stdio 傳輸與 Claude Code 工作
- [ ] 工具於 Claude 會話可發現且可用

## 常見陷阱

- **阻操作**：MCP 伺服器當異步處請求。長操作阻他工具呼
- **缺錯處**：未處之異崩伺服器。恆包工具處於 try/catch
- **綱失配**：工具參綱須完合處理所期
- **stdio 緩衝**：用 stdio 傳輸時，確輸出已沖。Node.js 預設緩 stdout
- **安全**：MCP 伺服器與進程具同存取。細驗輸入，尤其 shell 命令或數據庫查詢

## 相關技能

- `configure-mcp-server` — 連所建伺服器至客戶端
- `troubleshoot-mcp-connection` — 調連問題
- `containerize-mcp-server` — 以 Docker 包伺服器
