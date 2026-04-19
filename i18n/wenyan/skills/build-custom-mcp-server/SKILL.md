---
name: build-custom-mcp-server
locale: wenyan
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

# 建自訂 MCP 之服

建自訂 MCP 服以呈域特之工具於 AI 輔手。

## 用時

- 須呈自訂能於 Claude Code 或 Claude Desktop
- 建專工具逾 mcptools 所供
- 建域特之 AI 輔整合
- 包現 API 或服為 MCP 工具

## 入

- **必要**：欲呈之工具清單（名、述、參、行）
- **必要**：施之語（Node.js 或 R）
- **必要**：傳類（stdio 或 HTTP）
- **可選**：認證之須
- **可選**：Docker 包之須

## 法

### 第一步：定工具規

書碼前，先定各工具：

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

**得：** 各工具有 YAML 或 markdown 規，含名、述、參（含類、默、必旗）、返類，皆記於書碼前。

**敗則：** 若工具規不明，訪域專家或察現 API 之文以定參類與返格。

### 第二步：以 Node.js 施（用 MCP SDK）

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

**得：** 成之 `server.js` 檔，入 MCP SDK、以 Zod 模定工具、以 stdio 傳連。行 `node server.js` 啟服無錯。

**敗則：** 驗 `@modelcontextprotocol/sdk` 與 `zod` 已裝（`npm install`）。察入路合 SDK 版（SDK 於諸版間重組出口）。

### 第三步：以 R 施（用 mcptools）

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

**得：** 成之 `server.R` 檔，以 `mcp_tool()` 註自訂工具，以 `mcp_server()` 啟服。行 `Rscript server.R` 啟 MCP 服。

**敗則：** 驗 `mcptools` 已自 GitHub 裝（`remotes::install_github("posit-dev/mcptools")`）。察 handler 之簽合參定。

### 第四步：立項目之構

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

**得：** 項目目建立，含 `server.js`（或 `server.R`）、`package.json`、`tools/` 目為模組工具、`test/` 目為測。

**敗則：** 若目構不合施之語，宜調之。R 服或用 `R/` 代 `tools/`，用 `tests/testthat/` 代 `test/`。

### 第五步：測服

**以 stdio 手測**：

```bash
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node server.js
```

**註於 Claude Code**：

```bash
claude mcp add my-server stdio "node" "/path/to/server.js"
```

**驗工具現**：

啟 Claude Code 會，察自訂工具列而可用。

**得：** `tools/list` 之 JSON-RPC 呼返諸定工具，名模皆正。`claude mcp list` 示服已註。工具可自 Claude Code 會呼。

**敗則：** 若 `tools/list` 返空陣，工具未於 `server.connect()` 前註。若 Claude Code 不能尋服，驗 `claude mcp add` 中命路為絕對且二進制可行。

### 第六步：加錯處

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

**得：** 各工具 handler 包於 try/catch。誤入返 `isError: true` 附述言，不崩服程。

**敗則：** 若惡入仍崩服，察 try/catch 裹整 handler 體含諸 async 行。確 promise 於 try 內 await。

### 第七步：包為分發

建 `package.json` 含 bin 條：

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

用者可裝而設：

```bash
npm install -g my-mcp-server
claude mcp add my-server stdio "my-mcp-server"
```

**得：** `package.json` 含 `bin` 條指服之入口。用者可以 `npm install -g` 全裝，以 `claude mcp add` 註。

**敗則：** 若全裝後 bin 條不行，確 `server.js` 有 shebang 線（`#!/usr/bin/env node`）且標為可行。驗包名不衝已存之 npm 包。

## 驗

- [ ] 服啟無錯
- [ ] `tools/list` 返諸定工具與正模
- [ ] 各工具於正入下正行
- [ ] 惡入時工具返適錯
- [ ] 服以 stdio 傳與 Claude Code 行
- [ ] 工具於 Claude 會中可見可用

## 陷

- **阻塞之行**：MCP 服宜異理請。久行阻他工具呼
- **缺錯處**：未理之異崩服。恆以 try/catch 裹工具 handler
- **模不合**：工具參模必全合 handler 所望
- **stdio 緩**：用 stdio 傳時，確輸出已沖。Node.js 默緩 stdout
- **安**：MCP 服有程同等之取。慎驗入，尤殼命或庫詢

## 參

- `configure-mcp-server` - 連所建之服於客
- `troubleshoot-mcp-connection` - 調連之題
- `containerize-mcp-server` - 以 Docker 包服
