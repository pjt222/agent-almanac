---
name: deploy-shiny-app
description: >
  Shinyアプリケーションをshinyapps.io、Posit Connect、またはDockerコンテナに
  デプロイします。rsconnectの設定、マニフェストの生成、Dockerfileの作成、
  デプロイメントの検証を扱います。外部または内部ユーザー向けにShinyアプリを
  公開するとき、ローカル開発からホスト環境に移行するとき、KubernetesまたはDocker
  デプロイメント用にShinyアプリをコンテナ化するとき、または自動デプロイメント
  パイプラインをセットアップするときに使用します。
locale: ja
source_locale: en
source_commit: 6f65f316
fence_basis_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: shiny
  complexity: basic
  language: R
  tags: shiny, deployment, shinyapps-io, posit-connect, docker, rsconnect
---

# Shinyアプリのデプロイ

ShinyアプリケーションをShinyapps.io、Posit Connect、またはDockerコンテナにデプロイします。

## 使用タイミング

- 外部または内部ユーザー向けにShinyアプリを公開するとき
- ローカル開発からホスト環境に移行するとき
- KubernetesまたはDockerデプロイメント用にShinyアプリをコンテナ化するとき
- 自動デプロイメントパイプラインをセットアップするとき

## 入力

- **必須**: Shinyアプリケーションへのパス
- **必須**: デプロイ先（shinyapps.io、Posit Connect、またはDocker）
- **オプション**: アカウント名とトークン（shinyapps.io/Connect用）
- **オプション**: インスタンスサイズの選択
- **オプション**: カスタムドメインまたはURLパス

## 手順

### ステップ1: アプリケーションの準備

アプリが自己完結型でデプロイ可能であることを確認します：

```r
# Check for missing dependencies
rsconnect::appDependencies("path/to/app")

# For golem apps, ensure DESCRIPTION lists all Imports
devtools::check()

# Verify the app runs cleanly
shiny::runApp("path/to/app")
```

以下のファイルが存在することを確認してください：
- `app.R`（または`ui.R` + `server.R`）
- `renv.lock`（再現可能なデプロイメントに推奨）
- `.Rprofile`が本番環境で`mcptools::mcp_session()`を呼び出していないこと

**期待結果：** アプリがエラーなしでローカルに実行でき、すべての依存関係がキャプチャされています。

**失敗時：** `appDependencies()`が欠けているパッケージを報告する場合はインストールして`renv.lock`を更新してください。アプリがシステムライブラリ（例：gdal、curl）を使用する場合は、Dockerパス用にメモしてください。

### ステップ2a: shinyapps.ioへのデプロイ

```r
# One-time account setup
rsconnect::setAccountInfo(
  name = "your-account",
  token = Sys.getenv("SHINYAPPS_TOKEN"),
  secret = Sys.getenv("SHINYAPPS_SECRET")
)

# Deploy
rsconnect::deployApp(
  appDir = "path/to/app",
  appName = "my-app",
  appTitle = "My Application",
  account = "your-account",
  forceUpdate = TRUE
)
```

認証情報は`.Renviron`に保存してください（コードには絶対に書かない）：

```bash
# .Renviron
SHINYAPPS_TOKEN=your_token_here
SHINYAPPS_SECRET=your_secret_here
```

**期待結果：** アプリがデプロイされ`https://your-account.shinyapps.io/my-app/`でアクセス可能になります。

**失敗時：** 認証が失敗する場合は、shinyapps.ioダッシュボード > Account > Tokensでトークンを再生成してください。サーバーでパッケージのインストールが失敗する場合は、すべてのパッケージがCRANで入手可能か確認してください — shinyapps.ioはデフォルトでGitHubからインストールできません。

### ステップ2b: Posit Connectへのデプロイ

```r
# Register server (one-time)
rsconnect::addServer(
  url = "https://connect.example.com",
  name = "production"
)

# Authenticate (one-time)
rsconnect::connectApiUser(
  account = "your-username",
  server = "production",
  apiKey = Sys.getenv("CONNECT_API_KEY")
)

# Deploy
rsconnect::deployApp(
  appDir = "path/to/app",
  appName = "my-app",
  server = "production",
  account = "your-username"
)
```

**期待結果：** アプリがデプロイされてPosit Connectインスタンスでアクセス可能になります。

**失敗時：** サーバーが接続を拒否する場合は、APIキーとサーバーURLを確認してください。パッケージのインストールが失敗する場合は、Connectが必要なリポジトリ（CRAN、内部CRANライクなリポジトリ）にアクセスできるか確認してください。

### ステップ2c: Dockerでのデプロイ

`Dockerfile`を作成します：

```dockerfile
FROM rocker/shiny-verse:4.4.0

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    libssl-dev \
    libxml2-dev \
    && rm -rf /var/lib/apt/lists/*

# Install R packages
RUN R -e "install.packages(c('shiny', 'bslib', 'DT', 'plotly'))"

# Copy app
COPY . /srv/shiny-server/myapp/

# Configure Shiny Server
COPY shiny-server.conf /etc/shiny-server/shiny-server.conf

# Expose port
EXPOSE 3838

# Run
CMD ["/usr/bin/shiny-server"]
```

`shiny-server.conf`を作成します：

```text
run_as shiny;

server {
  listen 3838;

  location / {
    site_dir /srv/shiny-server/myapp;
    log_dir /var/log/shiny-server;
    directory_index on;
  }
}
```

ビルドと実行：

```bash
docker build -t myapp:latest .
docker run -p 3838:3838 myapp:latest
```

**期待結果：** アプリが`http://localhost:3838`でアクセス可能になります。

**失敗時：** パッケージのインストールでビルドが失敗する場合は、欠けているシステムライブラリを`apt-get install`の行に追加してください。アプリが読み込まれない場合はShiny Serverのログを確認してください：`docker exec <container> cat /var/log/shiny-server/*.log`。

### ステップ3: デプロイメントの確認

```r
# Check the deployed URL responds
response <- httr::GET("https://your-app-url/")
httr::status_code(response)  # Should be 200

# For Docker
response <- httr::GET("http://localhost:3838/")
httr::status_code(response)
```

手動確認チェックリスト：
1. アプリがエラーなしで読み込まれる
2. すべてのインタラクティブ要素が応答する
3. デプロイされた環境でデータ接続が機能する
4. 認証/認可が機能する（該当する場合）

**期待結果：** アプリがHTTP 200で応答し、すべての機能が動作します。

**失敗時：** 特定のデプロイメントプラットフォームのサーバーログを確認してください。よくある問題：本番環境での環境変数の未設定、localhostの代わりに本番URLを使ったデータベース接続、またはローカルにしか存在しないファイルパス。

### ステップ4: モニタリングの設定（オプション）

#### shinyapps.io

`https://www.shinyapps.io/admin/#/applications`のダッシュボードでモニタリングします。

#### Posit Connect

```r
# Check deployment status via API
connectapi::connect(
  server = "https://connect.example.com",
  api_key = Sys.getenv("CONNECT_API_KEY")
)
```

#### Docker

DockerfileにHEALTHCHECKを追加します：

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:3838/ || exit 1
```

**期待結果：** デプロイメントターゲットのモニタリングが設定されています。

**失敗時：** ヘルスチェックが断続的に失敗する場合はタイムアウト値を増やしてください。Shinyアプリは初回読み込み時に応答が遅い場合があります。

## バリデーション

- [ ] アプリがエラーなしでデプロイされる
- [ ] デプロイされたURLがHTTP 200で応答する
- [ ] すべてのインタラクティブ機能が本番環境で動作する
- [ ] 環境変数/シークレットが設定されている（ハードコードされていない）
- [ ] 認証情報が`.Renviron`またはCIシークレットに保存されており、コードには書かれていない
- [ ] 再現可能な依存関係解決のためにrenv.lockがコミットされている

## よくある落とし穴

- **ハードコードされたファイルパス**: 絶対パスを`system.file()`（パッケージデータ用）または環境変数（外部リソース用）に置き換えてください。
- **開発専用の依存関係**: `mcptools::mcp_session()`や`devtools`を読み込む`.Rprofile`をデプロイしないでください。条件付き読み込みまたは別のプロファイルを使用してください。
- **DockerでのシステムライブラリのMissing**: sf、curl、xml2などのRパッケージにはシステムライブラリが必要です。Dockerfileの`apt-get install`に追加してください。
- **shinyapps.ioでのCRANのみパッケージ**: shinyapps.ioはデフォルトでCRANからのみインストールします。GitHubのみのパッケージには`remotes`パッケージとデプロイメント内での明示的なインストールが必要です。
- **環境変数の忘れ**: データベース認証情報、APIキー、その他のシークレットはコードとは別に、デプロイメント環境で設定する必要があります。

## 関連スキル

- `scaffold-shiny-app` — デプロイ前のアプリ構造の作成
- `create-r-dockerfile` — Rプロジェクトの詳細なDocker設定
- `setup-docker-compose` — データベースを持つShiny用のマルチコンテナセットアップ
- `setup-github-actions-ci` — 自動デプロイメントを含むCI/CD
- `optimize-shiny-performance` — 本番デプロイ前のパフォーマンスチューニング
