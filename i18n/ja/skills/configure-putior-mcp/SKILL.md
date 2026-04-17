---
name: configure-putior-mcp
description: >
  putior MCPサーバーを設定して16のワークフロー可視化ツールをAIアシスタントに公開する。
  Claude CodeとClaude Desktopのセットアップ、依存関係のインストール（mcptools、
  ellmer）、ツールの検証、エージェント間通信用のオプションのACPサーバー設定をカバー
  する。AIアシスタントがワークフローをインタラクティブにアノテーション・可視化できる
  ようにする時、putior MCP統合で新しい開発環境をセットアップする時、自動化
  パイプライン用のACP経由のエージェント間通信を設定する時に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: workflow-visualization
  complexity: intermediate
  language: R
  tags: putior, mcp, acp, ai-assistant, claude, tools, integration
  locale: ja
  source_locale: en
  source_commit: ecb11b8b
  translator: claude
  translation_date: "2026-03-17"
---

# putior MCPサーバーの設定

AIアシスタント（Claude Code、Claude Desktop）がワークフローのアノテーションとダイアグラム生成ツールを直接呼び出せるように、putior MCPサーバーをセットアップする。

## 使用タイミング

- AIアシスタントがワークフローをインタラクティブにアノテーション・可視化できるようにする時
- putior MCP統合で新しい開発環境をセットアップする時
- putiorをインストールした後にAI支援のワークフロードキュメンテーションが必要な時
- 自動化パイプライン用のACP経由のエージェント間通信を設定する時

## 入力

- **必須**: putiorがインストール済み（`install-putior`を参照）
- **必須**: ターゲットクライアント: Claude Code、Claude Desktop、または両方
- **任意**: ACPサーバーも設定するかどうか（デフォルト: いいえ）
- **任意**: ACPサーバーのカスタムホスト/ポート（デフォルト: localhost:8080）

## 手順

### ステップ1: MCP依存関係のインストール

MCPサーバー機能に必要なパッケージをインストールする。

```r
# Required: MCP framework
remotes::install_github("posit-dev/mcptools")

# Required: Tool definition framework
install.packages("ellmer")

# Verify both load
library(mcptools)
library(ellmer)
```

**期待結果:** 両方のパッケージがエラーなくインストール・ロードされる。

**失敗時:** `mcptools`には`remotes`パッケージが必要。まずインストールする：`install.packages("remotes")`。GitHubがレート制限する場合、`~/.Renviron`に`GITHUB_PAT`を設定する（`GITHUB_PAT=your_token_here`の行を追加してRを再起動）。トークンをシェルコマンドに貼り付けたりバージョン管理にコミットしたり**しない**。

### ステップ2: Claude Code（WSL/Linux/macOS）の設定

Claude Codeの設定にputior MCPサーバーを追加する。

```bash
# One-line setup
claude mcp add putior -- Rscript -e "putior::putior_mcp_server()"
```

WSLでWindows Rを使用する場合:
```bash
claude mcp add putior -- "/mnt/c/Program Files/R/R-4.5.2/bin/Rscript.exe" -e "putior::putior_mcp_server()"
```

設定の確認:
```bash
claude mcp list
claude mcp get putior
```

**期待結果:** MCPサーバーリストに`putior`がステータス「configured」で表示される。

**失敗時:** Claude CodeがPATHにない場合、追加する：`export PATH="$HOME/.claude/local/node_modules/.bin:$PATH"`。Rscriptのパスが間違っている場合、`which Rscript`または`ls "/mnt/c/Program Files/R/"`でRの場所を確認する。

### ステップ3: Claude Desktop（Windows）の設定

Claude DesktopのMCP設定ファイルにputiorを追加する。

`%APPDATA%\Claude\claude_desktop_config.json`を編集する:

```json
{
  "mcpServers": {
    "putior": {
      "command": "C:\\PROGRA~1\\R\\R-45~1.0\\bin\\x64\\Rscript.exe",
      "args": ["-e", "putior::putior_mcp_server()"]
    }
  }
}
```

またはフルパスで:
```json
{
  "mcpServers": {
    "putior": {
      "command": "C:\\Program Files\\R\\R-4.5.2\\bin\\x64\\Rscript.exe",
      "args": ["-e", "putior::putior_mcp_server()"]
    }
  }
}
```

設定ファイル編集後にClaude Desktopを再起動する。

**期待結果:** Claude DesktopのMCPサーバーリストにputiorが表示される。会話中にツールが利用可能になる。

**失敗時:** JSONリンターで構文を検証する。Rパスが存在することを確認する。パスのスペースが問題を引き起こす場合は8.3短縮名（`PROGRA~1`、`R-45~1.0`）を使用する。

### ステップ4: 全16ツールの検証

すべてのMCPツールがアクセス可能で機能することをテストする。

```r
# Get tool definitions
tools <- putior::putior_mcp_tools()
cat(sprintf("Total tools: %d\n", length(tools)))

# List tool names
vapply(tools, function(t) t$name, character(1))
```

カテゴリ別の16ツール:

**コアワークフロー（5）:**
- `put` -- ファイルからPUTアノテーションをスキャン（正規表現ベースのファイルフィルタリング用の`exclude`パラメータをサポート）
- `put_diagram` -- Mermaidダイアグラムを生成
- `put_auto` -- コードからワークフローを自動検出（`exclude`パラメータをサポート）
- `put_generate` -- アノテーション提案を生成（`exclude`パラメータをサポート）
- `put_merge` -- 手動と自動のアノテーションをマージ（`exclude`パラメータをサポート）

**リファレンス/ディスカバリ（7）:**
- `get_comment_prefix` -- 拡張子のコメントプレフィックスを取得
- `get_supported_extensions` -- サポートされる拡張子を一覧表示
- `list_supported_languages` -- サポートされる言語を一覧表示
- `get_detection_patterns` -- 自動検出パターンを取得
- `get_diagram_themes` -- 利用可能なテーマを一覧表示
- `putior_guide` -- AIアシスタントドキュメンテーション
- `putior_help` -- クイックリファレンスヘルプ

**ユーティリティ（3）:**
- `is_valid_put_annotation` -- アノテーション構文を検証
- `split_file_list` -- ファイルリストをパース
- `ext_to_language` -- 拡張子を言語名に変換

**設定（1）:**
- `set_putior_log_level` -- ログ詳細度を設定

Claude Codeからコアツールをテスト:
```
Use the putior_help tool to see available commands
Use the put tool to scan ./R/ for annotations
Use the put_diagram tool to generate a diagram
```

**期待結果:** 全16ツールがリストされる。有効な入力でコアツールが期待通りの結果を返す。

**失敗時:** ツールが欠けている場合、putiorのバージョンが最新か確認する：`packageVersion("putior")`。古いバージョンではツールが少ない場合がある。`remotes::install_github("pjt222/putior")`で更新する。

### ステップ5: ACPサーバーの設定（任意）

エージェント間通信用のACP（Agent Communication Protocol）サーバーをセットアップする。

```r
# Install ACP dependency
install.packages("plumber2")

# Start ACP server (blocks — run in a separate R session or background)
putior::putior_acp_server()

# Custom host/port
putior::putior_acp_server(host = "0.0.0.0", port = 9000)
```

ACPエンドポイントのテスト:
```bash
# Discover agent
curl http://localhost:8080/agents

# Execute a scan
curl -X POST http://localhost:8080/runs \
  -H "Content-Type: application/json" \
  -d '{"input": [{"role": "user", "parts": [{"content": "scan ./R/"}]}]}'

# Generate diagram
curl -X POST http://localhost:8080/runs \
  -H "Content-Type: application/json" \
  -d '{"input": [{"role": "user", "parts": [{"content": "generate diagram for ./R/"}]}]}'
```

**期待結果:** ACPサーバーが設定されたポートで起動する。`/agents`がputiorエージェントマニフェストを返す。`/runs`が自然言語リクエストを受け付けワークフロー結果を返す。

**失敗時:** ポート8080が使用中の場合、別のポートを指定する。`plumber2`がインストールされていない場合、サーバー関数がインストールを提案する有用なエラーメッセージを表示する。

## バリデーション

- [ ] `putior::putior_mcp_tools()`がコアツール（`put`、`put_diagram`、`put_auto`、`put_generate`、`put_merge`）を公開し、現在のバージョンで約16ツールを返す
- [ ] Claude Code: `claude mcp list`で`putior`が設定済みと表示される
- [ ] Claude Code: 呼び出し時に`putior_help`ツールがヘルプテキストを返す
- [ ] Claude Desktop: 再起動後にMCPサーバーリストにputiorが表示される
- [ ] コアツール（`put`、`put_diagram`、`put_auto`）がエラーなく実行される
- [ ] （任意）ACPサーバーが`curl http://localhost:8080/agents`に応答する

## よくある落とし穴

- **mcptoolsがインストールされていない**: MCPサーバーには`mcptools`（GitHubから）と`ellmer`（CRANから）が必要。両方がインストールされている必要がある。putiorは不足している場合に有用なメッセージを表示する
- **Claude DesktopのRパスが間違っている**: WindowsパスはJSON内でエスケープが必要（`\\`）。スペースを避けるために8.3短縮名を使用する：`C:\\PROGRA~1\\R\\R-45~1.0\\bin\\x64\\Rscript.exe`
- **再起動の忘れ**: Claude Desktopは設定ファイル編集後に再起動が必要。Claude Codeは次のセッション開始時に変更を反映する
- **renvの分離**: putiorがrenvライブラリにインストールされているがClaude Code/DesktopがRをrenvなしで起動する場合、パッケージが見つからない。`mcptools`と`ellmer`がグローバルライブラリにインストールされているか、MCPサーバーコマンドでrenvアクティベーションが設定されていることを確認する
- **ACPのポート競合**: デフォルトACPポート（8080）はよく使用される。起動前に`lsof -i :8080`または`netstat -tlnp | grep 8080`で確認する
- **特定のツールのみを含める**: ツールのサブセットを公開するには、カスタムMCPサーバーラッパーを構築する際に`putior_mcp_tools(include = c("put", "put_diagram"))`を使用する
- **MCP経由のカスタムパレット**: `put_diagram`の`palette`パラメータには`putior_theme` Rオブジェクト（`put_theme()`で作成）が必要で、MCPのJSONインターフェース経由ではシリアライズできない。MCP呼び出しには組み込みの`theme`パラメータ文字列を使用する。カスタムパレットにはRを直接使用する

## 関連スキル

- `install-putior` -- 前提条件: putiorとオプションの依存関係がインストールされている必要がある
- `configure-mcp-server` -- Claude Code/Desktop用の一般的なMCPサーバー設定
- `troubleshoot-mcp-connection` -- ツールが表示されない場合の接続問題の診断
- `build-custom-mcp-server` -- putiorツールをラップするカスタムMCPサーバーの構築
- `analyze-codebase-workflow` -- コードベース分析にMCPツールをインタラクティブに使用
