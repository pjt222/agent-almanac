---
name: create-r-dockerfile
description: >
  rockerベースイメージを使用してRプロジェクト用のDockerfileを作成する。システム依存関係のインストール、
  Rパッケージのインストール、renv統合、高速リビルドのための最適化されたレイヤー順序をカバーする。
  Rアプリケーションや分析のコンテナ化、再現可能なR環境の構築、Rベースサービス（Shiny、Plumber、
  MCPサーバー）のデプロイ、またはマシン間で一貫した開発環境を構築する際に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: intermediate
  language: Docker
  tags: docker, r, rocker, container, reproducibility
locale: ja
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
---

# R Dockerfileの作成

rockerベースイメージを使用し、適切な依存関係管理を行うRプロジェクト用Dockerfileを構築する。

## 使用タイミング

- Rアプリケーションや分析のコンテナ化
- 再現可能なR環境の構築
- Rベースサービス（Shiny、Plumber、MCPサーバー）のデプロイ
- 一貫した開発環境のセットアップ

## 入力

- **必須**: 依存関係を持つRプロジェクト（DESCRIPTIONまたはrenv.lock）
- **必須**: 用途（開発、本番、またはサービス）
- **任意**: Rバージョン（デフォルト: 最新安定版）
- **任意**: 必要な追加システムライブラリ

## 手順

### ステップ1: ベースイメージの選択

| ユースケース | ベースイメージ | サイズ |
|----------|-----------|------|
| 最小限のRランタイム | `rocker/r-ver:4.5.0` | 約800MB |
| tidyverse付き | `rocker/tidyverse:4.5.0` | 約1.8GB |
| RStudio Server付き | `rocker/rstudio:4.5.0` | 約1.9GB |
| Shinyサーバー | `rocker/shiny-verse:4.5.0` | 約2GB |

**期待結果：** プロジェクトの要件に合致し、不要な肥大化のないベースイメージが選択される。

**失敗時：** どのイメージを使用するか不明な場合は、`rocker/r-ver`（最小限）から始めて必要に応じてパッケージを追加する。完全なイメージカタログは[rocker-org](https://github.com/rocker-org/rocker-versioned2)を参照。

### ステップ2: Dockerfileの作成

```dockerfile
FROM rocker/r-ver:4.5.0

# システム依存関係のインストール
# 目的別にグループ化して明確にする
RUN apt-get update && apt-get install -y \
    # HTTP/SSL
    libcurl4-openssl-dev \
    libssl-dev \
    # XML処理
    libxml2-dev \
    # Git統合
    libgit2-dev \
    libssh2-1-dev \
    # グラフィックス
    libfontconfig1-dev \
    libharfbuzz-dev \
    libfribidi-dev \
    libfreetype6-dev \
    libpng-dev \
    libtiff5-dev \
    libjpeg-dev \
    # ユーティリティ
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Rパッケージのインストール
# 順序: キャッシュ効率のため変更頻度の低いものから
RUN R -e "install.packages(c( \
    'remotes', \
    'devtools', \
    'renv' \
    ), repos='https://cloud.r-project.org/')"

# 作業ディレクトリの設定
WORKDIR /workspace

# renvファイルを先にコピー（キャッシュレイヤー）
COPY renv.lock renv.lock
COPY renv/activate.R renv/activate.R

# ロックファイルからパッケージを復元
RUN R -e "renv::restore()"

# プロジェクトファイルをコピー
COPY . .

# デフォルトコマンド
CMD ["R"]
```

**期待結果：** `docker build -t myproject .` でDockerfileが正常にビルドされる。

**失敗時：** `apt-get install`中にビルドが失敗した場合、対象ディストロ（Debian）のパッケージ名を確認する。`renv::restore()`が失敗した場合、`renv.lock`と`renv/activate.R`がrestoreステップの前にコピーされていることを確認する。

### ステップ3: .dockerignoreの作成

```
.git
.Rproj.user
.Rhistory
.RData
renv/library
renv/cache
renv/staging
docs/
*.tar.gz
```

**期待結果：** `.dockerignore`がGit履歴、IDEファイル、ローカルrenvライブラリ、ビルド成果物をDockerコンテキストから除外する。

**失敗時：** Dockerビルドが不要なファイルをコピーし続ける場合、`.dockerignore`がDockerfileと同じディレクトリにあり、正しいグロブパターンを使用していることを確認する。

### ステップ4: ビルドとテスト

```bash
docker build -t r-project:latest .
docker run --rm -it r-project:latest R -e "sessionInfo()"
```

**期待結果：** コンテナが正しいRバージョンですべてのパッケージが利用可能な状態で起動する。`sessionInfo()`の出力で期待されるRバージョンが確認できる。

**失敗時：** ビルドログでシステム依存関係のエラーを確認する。不足している`-dev`パッケージを`apt-get install`レイヤーに追加する。

### ステップ5: 本番環境向け最適化

本番デプロイにはマルチステージビルドを使用する：

```dockerfile
# ビルドステージ
FROM rocker/r-ver:4.5.0 AS builder
RUN apt-get update && apt-get install -y libcurl4-openssl-dev libssl-dev
COPY renv.lock .
RUN R -e "install.packages('renv'); renv::restore()"

# ランタイムステージ
FROM rocker/r-ver:4.5.0
COPY --from=builder /usr/local/lib/R/site-library /usr/local/lib/R/site-library
COPY . /app
WORKDIR /app
CMD ["Rscript", "main.R"]
```

**期待結果：** マルチステージビルドにより最終イメージが小さくなる。ランタイムステージにはコンパイル済みRパッケージのみが含まれ、ビルドツールは含まれない。

**失敗時：** ランタイムステージでパッケージの読み込みに失敗する場合、`COPY --from=builder`のライブラリパスがRのインストール先と一致していることを確認する。両方のステージで`R -e ".libPaths()"`で確認する。

## バリデーション

- [ ] `docker build`がエラーなく完了する
- [ ] コンテナが起動しRセッションが動作する
- [ ] すべての必要なパッケージが利用可能
- [ ] `.dockerignore`が不要なファイルを除外している
- [ ] イメージサイズがユースケースに対して適切
- [ ] コード変更のみの場合のリビルドが高速（レイヤーキャッシュが機能）

## よくある落とし穴

- **システム依存関係の不足**: コンパイルコードを含むRパッケージには`-dev`ライブラリが必要。`install.packages()`中のエラーメッセージを確認する
- **レイヤーキャッシュの無効化**: パッケージインストール前にすべてのファイルをコピーすると、コード変更のたびにキャッシュが無効化される。先にロックファイルをコピーする
- **大きなイメージ**: `apt-get install`の後に`rm -rf /var/lib/apt/lists/*`を使用する。マルチステージビルドを検討する
- **タイムゾーンの問題**: タイムゾーン対応の操作には`ENV TZ=UTC`を追加するか`tzdata`をインストールする
- **rootでの実行**: 本番環境には非rootユーザーを追加する: `RUN useradd -m appuser && USER appuser`

## 例

```bash
# ソースをマウントした開発コンテナ
docker run --rm -it -v $(pwd):/workspace r-project:latest R

# Plumber APIサービス
docker run -d -p 8000:8000 r-api:latest

# Shinyアプリ
docker run -d -p 3838:3838 r-shiny:latest
```

## 関連スキル

- `setup-docker-compose` - 複数コンテナのオーケストレーション
- `containerize-mcp-server` - MCP Rサーバーの特殊ケース
- `optimize-docker-build-cache` - 高度なキャッシュ戦略
- `manage-renv-dependencies` - renv.lockがDockerビルドに入力される
