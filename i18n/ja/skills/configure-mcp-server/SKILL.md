---
name: configure-mcp-server
description: >
  Claude CodeとClaude Desktop用のMCP（Model Context Protocol）サーバーを設定する。
  mcptoolsのセットアップ、Hugging Face統合、WSLパス処理、マルチクライアント設定を
  カバーする。Claude Codeをmcptools経由でRに接続する時、Claude DesktopにMCP
  サーバーを設定する時、Hugging Faceやその他のリモートMCPサーバーを追加する時、
  クライアントとサーバー間のMCP接続のトラブルシューティング時に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mcp-integration
  complexity: intermediate
  language: multi
  tags: mcp, claude-code, claude-desktop, mcptools, configuration
  locale: ja
  source_locale: en
  source_commit: 902f69ec4eeddf6fdf26df7e988d8deb1a22c387
  translator: claude
  translation_date: "2026-03-17"
---

# MCPサーバーの設定

Claude Code（WSL）とClaude Desktop（Windows）用のMCPサーバー接続をセットアップする。

## 使用タイミング

- Claude Codeをmcptools経由でRに接続する時
- Claude DesktopにMCPサーバーを設定する時
- Hugging Faceやその他のリモートMCPサーバーを追加する時
- ツール間のMCP接続のトラブルシューティング時

## 入力

- **必須**: MCPサーバータイプ（mcptools、Hugging Face、カスタム）
- **必須**: クライアント（Claude Code、Claude Desktop、または両方）
- **任意**: 認証トークン
- **任意**: カスタムサーバー実装

## 手順

### ステップ1: MCPサーバーパッケージのインストール

**R（mcptools）の場合**:

```r
install.packages("remotes")
remotes::install_github("posit-dev/mcptools")
```

**Hugging Faceの場合**:

```bash
npm install -g mcp-remote
```

**期待結果:** `mcptools`がGitHubからインストールされ、Rでエラーなくロードされる。`mcp-remote`が`which mcp-remote`または`npm list -g mcp-remote`でグローバルに利用可能。

**失敗時:** `mcptools`の場合、まず`remotes`がインストールされていることを確認する。GitHubがインストールをレート制限する場合、`~/.Renviron`に`GITHUB_PAT`を設定する。`mcp-remote`の場合、Node.jsとnpmがインストールされPATHに含まれていることを確認する。

### ステップ2: Claude Code（WSL）の設定

**R mcptoolsサーバー**:

```bash
claude mcp add r-mcptools stdio \
  "/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe" \
  -- -e "mcptools::mcp_server()"
```

**Hugging Faceサーバー**:

```bash
claude mcp add hf-mcp-server \
  -e HF_TOKEN=your_token_here \
  -- mcp-remote https://huggingface.co/mcp
```

**設定の確認**:

```bash
claude mcp list
claude mcp get r-mcptools
```

**期待結果:** `claude mcp list`で`r-mcptools`と`hf-mcp-server`（または追加したサーバー）が表示される。`claude mcp get r-mcptools`で正しいコマンドと引数が表示される。

**失敗時:** サーバーがリストに表示されない場合、`~/.claude.json`に正しいエントリが含まれているか確認する。`claude`コマンドが見つからない場合、PATHに追加する：`export PATH="$HOME/.claude/local/node_modules/.bin:$PATH"`。

### ステップ3: Claude Desktop（Windows）の設定

`%APPDATA%\Claude\claude_desktop_config.json`を編集する:

```json
{
  "mcpServers": {
    "r-mcptools": {
      "command": "C:\\PROGRA~1\\R\\R-45~1.0\\bin\\x64\\Rscript.exe",
      "args": ["-e", "mcptools::mcp_server()"]
    },
    "hf-mcp-server": {
      "command": "mcp-remote",
      "args": ["https://huggingface.co/mcp"],
      "env": {
        "HF_TOKEN": "your_token_here"
      }
    }
  }
}
```

**重要**: スペースを含むWindowsディレクトリには8.3短縮パスを使用する（`Program Files`ではなく`PROGRA~1`）。トークンには`--header`引数ではなく環境変数を使用する。

**期待結果:** `%APPDATA%\Claude\claude_desktop_config.json`のJSON設定ファイルが正しいサーバーエントリを持つ有効なJSON。再起動後にClaude DesktopがMCPサーバーインジケータを表示する。

**失敗時:** リンターでJSONを検証する（例：`jq . < config.json`）。Windowsパスのスペースがパースエラーを引き起こす場合は8.3短縮パス（`PROGRA~1`）を使用する。Claude Desktopが完全に再起動されていることを確認する（最小化だけでなく）。

### ステップ4: MCP用のRセッション設定

プロジェクトの`.Rprofile`に追加する:

```r
if (requireNamespace("mcptools", quietly = TRUE)) {
  mcptools::mcp_session()
}
```

これにより、RStudioでプロジェクトを開いた時にMCPセッションが自動的に開始される。

**期待結果:** `.Rprofile`ファイルがRStudioでプロジェクトを開いた時に条件付きで`mcptools::mcp_session()`を開始し、MCPツールが自動的に利用可能になる。

**失敗時:** セッション開始時に`mcptools`が見つからない場合、RStudioが使用するライブラリにインストールされているか確認する（`.libPaths()`を確認）。renvを使用している場合、mcptoolsがrenvライブラリにあることを確認する。

### ステップ5: 接続の確認

**WSLからのR MCPテスト**:

```bash
"/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe" -e "mcptools::mcp_server()"
```

**Claude Code内からのテスト**:

Claude Codeを起動してMCPツールを使用する — ツールリストに表示されるはず。

**Claude Desktopのテスト**:

設定変更後にClaude Desktopを再起動する。UIでMCPサーバーインジケータを確認する。

**期待結果:** `mcptools::mcp_server()`でRscriptを実行するとエラーなく出力される。アクティブセッション中にClaude CodeのツールリストにMCPツールが表示される。再起動後にClaude Desktopがサーバーステータスを表示する。

**失敗時:** Rscriptコマンドが失敗する場合、フルパスが正しいか確認する（`ls "/mnt/c/Program Files/R/"`でRバージョンを確認）。Claude Codeにツールが表示されない場合、セッションを再起動する。Claude Desktopの場合、ファイアウォール設定を確認する。

### ステップ6: マルチサーバー設定

Claude CodeとClaude Desktopは複数のMCPサーバーを同時にサポートする:

```bash
# Claude Code: 複数のサーバーを追加
claude mcp add r-mcptools stdio "/path/to/Rscript.exe" -- -e "mcptools::mcp_server()"
claude mcp add hf-mcp-server -e HF_TOKEN=token -- mcp-remote https://huggingface.co/mcp
claude mcp add custom-server stdio "/path/to/server" -- --port 3001
```

**期待結果:** 複数のMCPサーバーが設定され同時にアクセス可能。`claude mcp list`ですべてのサーバーが表示される。各サーバーのツールが同じClaude Codeセッションで利用可能。

**失敗時:** サーバーが競合する場合、設定で各サーバーが一意の名前を持っていることを確認する。あるサーバーが他をブロックする場合、サーバーがノンブロッキングI/Oを使用していることを確認する（stdioトランスポートはこれを自動的に処理する）。

## バリデーション

- [ ] `claude mcp list`ですべての設定済みサーバーが表示される
- [ ] R MCPサーバーがツール呼び出しに応答する
- [ ] Hugging Face MCPサーバーが認証し応答する
- [ ] Claude CodeとClaude Desktopの両方が接続できる（両方設定した場合）
- [ ] セッション中にツールリストにMCPツールが表示される

## よくある落とし穴

- **Windowsパスのスペース**: 8.3短縮名を使用するか、パスを正しくクォートする。ツールによってパスのパース方法が異なる
- **コマンド引数にトークン**: Windowsでは`--header "Authorization: Bearer token"`がパースの問題で失敗する。代わりに環境変数を使用する
- **Claude CodeとClaude Desktopの設定の混同**: これらは別々のツールで別々の設定ファイルを持つ（`~/.claude.json` vs `%APPDATA%\Claude\`）
- **npx vs グローバルインストール**: `npx mcp-remote`はClaude Desktopのコンテキストで失敗する可能性がある。`npm install -g mcp-remote`でグローバルにインストールする
- **mcptoolsのバージョン**: mcptoolsが最新であることを確認する。依存関係として`ellmer`パッケージが必要

## 関連スキル

- `build-custom-mcp-server` -- 独自のMCPサーバーの作成
- `troubleshoot-mcp-connection` -- 接続問題のデバッグ
- `setup-wsl-dev-environment` -- WSLセットアップの前提条件
