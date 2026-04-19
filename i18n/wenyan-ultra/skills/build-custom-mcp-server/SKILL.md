---
name: build-custom-mcp-server
locale: wenyan-ultra
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

# 建客 MCP 服

造客 MCP 服以露域專工於 AI 輔。

## 用

- 當露客能於 Claude Code 或 Claude Desktop
- 建 mcptools 之外專工
- 造域專 AI 輔整
- 包現 API 或服為 MCP 工

## 入

- **必**：當露工列（名、述、參、行）
- **必**：施語（Node.js 或 R）
- **必**：傳類（stdio 或 HTTP）
- **可**：認需
- **可**：Docker 包需

## 行

### 一：定工規

書碼前→每工定：

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

**得：** 每工以 YAML 或 markdown 規附名、述、參（含類、默、必旗）、返類已錄於書碼前。

**敗：** 工規不清→訪域專家或察現 API 文以定參類與返格。

### 二：施於 Node.js（用 MCP SDK）

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

**得：** 可行 `server.js` 檔—引 MCP SDK、以 Zod 綱定工、以 stdio 傳連。`node server.js` 無誤始服。

**敗：** 驗 `@modelcontextprotocol/sdk` 與 `zod` 已裝（`npm install`）。察引徑合 SDK 版（SDK 於版間重排導出）。

### 三：施於 R（用 mcptools）

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

**得：** 可行 `server.R` 檔—以 `mcp_tool()` 註客工、以 `mcp_server()` 始服。`Rscript server.R` 始 MCP 服。

**敗：** 驗 `mcptools` 自 GitHub 裝（`remotes::install_github("posit-dev/mcptools")`）。察處函簽合參定。

### 四：設案構

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

**得：** 案目造附 `server.js`（或 `server.R`）、`package.json`、`tools/` 目以分模工、`test/` 目以試。

**敗：** 目構不合施語→調。R 服或用 `R/` 代 `tools/` 與 `tests/testthat/` 代 `test/`。

### 五：試服

**stdio 手試**：

```bash
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node server.js
```

**註於 Claude Code**：

```bash
claude mcp add my-server stdio "node" "/path/to/server.js"
```

**驗工現**：

起 Claude Code 會而察客工列且可行。

**得：** `tools/list` JSON-RPC 呼返諸定工附正名與綱。`claude mcp list` 示服已註。工於 Claude Code 會可呼。

**敗：** `tools/list` 返空陣→工未註於 `server.connect()` 前。Claude Code 不得服→驗 `claude mcp add` 命徑絕而二進可行。

### 六：加誤處

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

**得：** 每工處以 try/catch 包。誤入返 `isError: true` 附述訊非崩服程。

**敗：** 服仍崩於劣入→察 try/catch 包全處體含諸 async 操。確保 promise 於 try 區內 await。

### 七：包發

造 `package.json` 附 bin 條：

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

用者可裝與配：

```bash
npm install -g my-mcp-server
claude mcp add my-server stdio "my-mcp-server"
```

**得：** `package.json` 附 `bin` 條指服入。用者以 `npm install -g` 全裝與 `claude mcp add` 註。

**敗：** bin 全裝後不行→確 `server.js` 首行有 shebang（`#!/usr/bin/env node`）且可行。驗包名不撞現 npm 包。

## 驗

- [ ] 服無誤始
- [ ] `tools/list` 返諸定工附正綱
- [ ] 每工以有效入正行
- [ ] 工於誤入返宜誤
- [ ] 服以 stdio 傳合 Claude Code
- [ ] 工於 Claude 會可發現且可用

## 忌

- **阻操**：MCP 服當異處請。久操阻他工呼。
- **缺誤處**：未處異崩服。必以 try/catch 包工處。
- **綱不合**：工參綱當全合處所候
- **stdio 緩**：用 stdio 傳→確出已沖。Node.js 默緩 stdout。
- **安**：MCP 服與程同權。精驗入，尤於殼命或庫查。

## 參

- `configure-mcp-server` — 連已建服與客
- `troubleshoot-mcp-connection` — 除連題
- `containerize-mcp-server` — 以 Docker 包服
