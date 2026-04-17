---
name: build-custom-mcp-server
description: >
  AIアシスタントにドメイン固有のツールを公開するカスタムMCP（Model Context Protocol）
  サーバーを構築する。Node.jsまたはRでのサーバー実装、ツール定義、トランスポート
  設定、Claude Codeでのテストをカバーする。mcptoolsが提供する以上のカスタム機能を
  公開する必要がある時、特化したドメイン固有のAI統合を構築する時、既存のAPIや
  サービスをMCPツールとしてラップする時に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mcp-integration
  complexity: advanced
  language: multi
  tags: mcp, server, custom-tools, node-js, protocol
  locale: ja
  source_locale: en
  source_commit: 902f69ec
  translator: claude
  translation_date: "2026-03-17"
---

# カスタムMCPサーバーの構築

AIアシスタントにドメイン固有のツールを公開するカスタムMCPサーバーを作成する。

## 使用タイミング

- Claude CodeまたはClaude Desktopにカスタム機能を公開する必要がある時
- mcptoolsが提供する以上の特化したツールを構築する時
- ドメイン固有のAIアシスタント統合を作成する時
- 既存のAPIやサービスをMCPツールとしてラップする時

## 入力

- **必須**: 公開するツールのリスト（名前、説明、パラメータ、動作）
- **必須**: 実装言語（Node.jsまたはR）
- **必須**: トランスポートタイプ（stdioまたはHTTP）
- **任意**: 認証要件
- **任意**: Dockerパッケージングのニーズ

## 手順

### ステップ1: ツール仕様の定義

コードを書く前に、各ツールを定義する:

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

**期待結果:** 各ツールのYAMLまたはmarkdown仕様。名前、説明、パラメータ（型、デフォルト、必須フラグを含む）、戻り値型がコードを書く前に文書化される。

**失敗時:** ツール仕様が不明確な場合、ドメイン専門家にインタビューするか、既存のAPIドキュメントをレビューしてパラメータの型と戻り値フォーマットを判定する。

### ステップ2: Node.jsでの実装（MCP SDKを使用）

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

**期待結果:** MCP SDKをインポートし、Zodスキーマでツールを定義し、stdioトランスポートで接続する動作する`server.js`ファイル。`node server.js`を実行するとエラーなしでサーバーが起動する。

**失敗時:** `@modelcontextprotocol/sdk`と`zod`がインストールされていることを確認する（`npm install`）。インポートパスがSDKバージョンと一致することを確認する（SDKはバージョン間でエクスポートを再構成した）。

### ステップ3: Rでの実装（mcptoolsを使用）

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

**期待結果:** `mcp_tool()`でカスタムツールを登録し、`mcp_server()`でサーバーを起動する動作する`server.R`ファイル。`Rscript server.R`を実行するとMCPサーバーが起動する。

**失敗時:** `mcptools`がGitHubからインストールされていることを確認する（`remotes::install_github("posit-dev/mcptools")`）。ハンドラー関数のシグネチャがパラメータ定義と一致していることを確認する。

### ステップ4: プロジェクト構造のセットアップ

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

**期待結果:** `server.js`（または`server.R`）、`package.json`、モジュラーなツール実装のための`tools/`ディレクトリ、テスト用の`test/`ディレクトリを含むプロジェクトディレクトリが作成される。

**失敗時:** ディレクトリ構造が実装言語と一致しない場合、適切に調整する。Rサーバーは`tools/`の代わりに`R/`を、`test/`の代わりに`tests/testthat/`を使用する場合がある。

### ステップ5: サーバーのテスト

**stdioでの手動テスト**:

```bash
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node server.js
```

**Claude Codeへの登録**:

```bash
claude mcp add my-server stdio "node" "/path/to/server.js"
```

**ツールの表示確認**:

Claude Codeセッションを開始し、カスタムツールがリストされ機能することを確認する。

**期待結果:** `tools/list` JSON-RPC呼び出しが正しい名前とスキーマを持つすべての定義されたツールを返す。`claude mcp list`がサーバーの登録を表示する。Claude Codeセッションからツールが呼び出し可能。

**失敗時:** `tools/list`が空の配列を返す場合、ツールが`server.connect()`の前に登録されていない。Claude Codeがサーバーを見つけられない場合、`claude mcp add`のコマンドパスが絶対パスでバイナリが実行可能であることを確認する。

### ステップ6: エラーハンドリングの追加

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

**期待結果:** 各ツールハンドラーがtry/catchでラップされている。無効な入力はサーバープロセスをクラッシュさせるのではなく、説明的なメッセージ付きの`isError: true`を返す。

**失敗時:** 不正な入力でサーバーがまだクラッシュする場合、try/catchが非同期操作を含むハンドラー本体全体をラップしていることを確認する。promiseがtryブロック内でawaitされていることを確認する。

### ステップ7: 配布用パッケージング

binエントリ付きの`package.json`を作成する:

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

ユーザーはインストールと設定が可能:

```bash
npm install -g my-mcp-server
claude mcp add my-server stdio "my-mcp-server"
```

**期待結果:** サーバーエントリポイントを指す`bin`エントリ付きの`package.json`。ユーザーは`npm install -g`でグローバルインストールし、`claude mcp add`で登録できる。

**失敗時:** グローバルインストール後にbinエントリが動作しない場合、`server.js`にシバン行（`#!/usr/bin/env node`）があり実行可能としてマークされていることを確認する。パッケージ名が既存のnpmパッケージと競合しないことを確認する。

## バリデーション

- [ ] サーバーがエラーなしで起動する
- [ ] `tools/list`が正しいスキーマを持つすべての定義されたツールを返す
- [ ] 各ツールが有効な入力で正しく実行される
- [ ] ツールが無効な入力に対して適切なエラーを返す
- [ ] サーバーがstdioトランスポートでClaude Codeと動作する
- [ ] ツールがClaudeセッションで検出可能かつ使用可能

## よくある落とし穴

- **ブロッキング操作**: MCPサーバーはリクエストを非同期で処理すべき。長時間実行される操作は他のツール呼び出しをブロックする
- **エラーハンドリングの欠如**: 未処理の例外はサーバーをクラッシュさせる。常にツールハンドラーをtry/catchでラップする
- **スキーマの不一致**: ツールパラメータスキーマはハンドラーが期待するものと正確に一致しなければならない
- **stdioバッファリング**: stdioトランスポートを使用する時、出力がフラッシュされることを確認する。Node.jsはデフォルトでstdoutをバッファリングする
- **セキュリティ**: MCPサーバーはプロセスと同じアクセス権を持つ。入力を慎重に検証する、特にシェルコマンドやデータベースクエリ

## 関連スキル

- `configure-mcp-server` -- 構築したサーバーをクライアントに接続する
- `troubleshoot-mcp-connection` -- 接続性の問題をデバッグする
- `containerize-mcp-server` -- サーバーをDockerでパッケージングする
