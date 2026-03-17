---
name: containerize-mcp-server
description: >
  Dockerを使用してRベースのMCP（Model Context Protocol）サーバーをコンテナ化する。
  mcptools統合、ポート公開、stdio vs HTTPトランスポート、およびコンテナ化されたサーバーへの
  Claude Code接続をカバーする。ローカルR環境なしでR MCPサーバーをデプロイする場合、
  再現可能なMCPサーバー環境の構築、他のコンテナ化されたサービスと並行してMCPサーバーを実行する場合、
  またはMCPサーバーを他の開発者に配布する際に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: advanced
  language: Docker
  tags: docker, mcp, mcptools, claude, container
locale: ja
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
---

# MCPサーバーのコンテナ化

R MCPサーバーをDockerコンテナにパッケージ化し、ポータブルなデプロイを実現する。

## 使用タイミング

- ローカルR環境なしでR MCPサーバーをデプロイする場合
- 再現可能なMCPサーバー環境の構築
- 他のコンテナ化されたサービスと並行してMCPサーバーを実行する場合
- MCPサーバーを他の開発者に配布する場合

## 入力

- **必須**: R MCPサーバー実装（mcptoolsベースまたはカスタム）
- **必須**: Dockerがインストールされ実行中であること
- **任意**: サーバーに必要な追加Rパッケージ
- **任意**: トランスポートモード（stdioまたはHTTP）

## 手順

### ステップ1: MCPサーバー用Dockerfileの作成

```dockerfile
FROM rocker/r-ver:4.5.0

# システム依存関係のインストール
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    libssl-dev \
    libxml2-dev \
    libgit2-dev \
    libssh2-1-dev \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Rパッケージのインストール
RUN R -e "install.packages(c( \
    'remotes', \
    'ellmer' \
    ), repos='https://cloud.r-project.org/')"

# mcptoolsのインストール
RUN R -e "remotes::install_github('posit-dev/mcptools')"

# 作業ディレクトリの設定
WORKDIR /workspace

# MCPサーバーポートの公開
EXPOSE 3000 3001 3002

# 環境変数
ENV R_LIBS_USER=/workspace/renv/library
ENV RENV_PATHS_CACHE=/workspace/renv/cache

# デフォルト: MCPサーバーの起動
CMD ["R", "-e", "mcptools::mcp_server()"]
```

**期待結果：** プロジェクトルートに`rocker/r-ver`ベースイメージ、システム依存関係、mcptoolsインストール、デフォルトコマンドとしてMCPサーバーを含む`Dockerfile`が存在する。

**失敗時：** ベースイメージタグがRバージョンと一致していることを確認する。`remotes::install_github`が失敗した場合、`git`と`libgit2-dev`がシステム依存関係レイヤーに含まれていることを確認する。

### ステップ2: docker-compose.ymlの作成

```yaml
version: '3.8'

services:
  mcp-server:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: r-mcp-server
    image: r-mcp-server:latest

    volumes:
      - /path/to/projects:/workspace
      - renv-cache:/workspace/renv/cache

    stdin_open: true
    tty: true

    network_mode: "host"

    environment:
      - TERM=xterm-256color
      - R_LIBS_USER=/workspace/renv/library

    restart: unless-stopped

volumes:
  renv-cache:
    driver: local
```

`network_mode: "host"`を使用することで、MCPサーバーのポートがlocalhostでアクセス可能になる。

**期待結果：** プロジェクトルートにMCPサーバーサービス、プロジェクトファイルとrenvキャッシュのボリュームマウント、stdioトランスポート用の`stdin_open`/`tty`有効化を含む`docker-compose.yml`ファイルが存在する。

**失敗時：** ボリュームパスが無効な場合、`/path/to/projects`を実際のプロジェクトディレクトリに調整する。Windows/WSLでは`/mnt/c/...`または`/mnt/d/...`パスを使用する。

### ステップ3: ビルドと起動

```bash
docker compose build
docker compose up -d
```

**期待結果：** MCPサーバーが実行中のコンテナが起動する。

**失敗時：** `docker compose logs mcp-server`でログを確認する。よくある問題：
- Rパッケージの不足: DockerfileのRUNインストールステップに追加する
- ポートが既に使用中: 公開ポートを変更するか競合するサービスを停止する

### ステップ4: Claude Codeのコンテナへの接続

stdioトランスポートの場合（コンテナはstdinで実行中の状態を維持する必要がある）：

```bash
claude mcp add r-mcp-docker stdio "docker" "exec" "-i" "r-mcp-server" "R" "-e" "mcptools::mcp_server()"
```

HTTPトランスポートの場合（MCPサーバーがサポートしている場合）：

```json
{
  "mcpServers": {
    "r-mcp-docker": {
      "type": "http",
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

**期待結果：** Claude CodeのMCP設定に`r-mcp-docker`サーバーエントリが含まれ、`claude mcp list`で新しいサーバーが表示される。

**失敗時：** stdioトランスポートの場合、コンテナ名が一致していること（`r-mcp-server`）と`docker ps`でコンテナが実行中であることを確認する。HTTPトランスポートの場合、ポートが公開されて`curl http://localhost:3000/mcp`で到達可能であることを確認する。

### ステップ5: 接続の確認

```bash
# コンテナの実行確認
docker ps | grep mcp-server

# コンテナ内のRセッションテスト
docker exec -it r-mcp-server R -e "sessionInfo()"

# mcptoolsの利用可能性を確認
docker exec -it r-mcp-server R -e "library(mcptools)"
```

**期待結果：** `docker ps`で`r-mcp-server`コンテナが実行中と表示され、`sessionInfo()`が期待されるRバージョンを返し、`library(mcptools)`がエラーなく読み込まれる。

**失敗時：** コンテナが実行されていない場合、`docker compose logs mcp-server`で起動エラーを確認する。mcptoolsの読み込みに失敗した場合、パッケージが正しくインストールされたことを確認するためイメージをリビルドする。

### ステップ6: カスタムMCPツールの追加

プロジェクト固有のMCPツールを追加するには、Rスクリプトをマウントする：

```yaml
volumes:
  - ./mcp-tools:/mcp-tools
```

CMDでそれらを読み込む：

```dockerfile
CMD ["R", "-e", "source('/mcp-tools/custom_tools.R'); mcptools::mcp_server()"]
```

**期待結果：** カスタムRスクリプトがコンテナ内の`/mcp-tools/`でアクセス可能で、MCPサーバーが起動時にデフォルトツールと一緒にそれらを読み込む。

**失敗時：** `docker exec -it r-mcp-server ls /mcp-tools/`でボリュームマウントパスが正しいことを確認する。スクリプトのsourceに失敗する場合、カスタムツールに不足しているパッケージ依存関係を確認する。

## バリデーション

- [ ] コンテナがエラーなくビルドされる
- [ ] MCPサーバーがコンテナ内で起動する
- [ ] Claude Codeがコンテナ化されたサーバーに接続できる
- [ ] MCPツールがリクエストに正しく応答する
- [ ] コンテナがクリーンに再起動する
- [ ] ボリュームマウントでプロジェクトファイルにアクセスできる

## よくある落とし穴

- **stdin/ttyの要件**: MCP stdioトランスポートには`stdin_open: true`と`tty: true`が必要
- **ネットワーク分離**: デフォルトのDockerネットワーキングではlocalhostアクセスが妨げられる場合がある。`network_mode: "host"`を使用するか特定のポートを公開する
- **パッケージバージョン**: 再現性のためmcptoolsを特定のコミットに固定する
- **大きなイメージサイズ**: mcptoolsとその依存関係は大きくなりうる。本番環境ではマルチステージビルドを検討する
- **WindowsのDockerパス**: Windows上のDocker DesktopとWSLを使用する場合、パスマッピングが異なる

## 関連スキル

- `create-r-dockerfile` - R用の基本的なDockerfileパターン
- `setup-docker-compose` - compose設定の詳細
- `configure-mcp-server` - DockerなしのMCPサーバー設定
- `troubleshoot-mcp-connection` - MCP接続の問題のデバッグ
