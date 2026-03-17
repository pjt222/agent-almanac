---
name: optimize-docker-build-cache
description: >
  レイヤーキャッシュ、マルチステージビルド、BuildKit機能、依存関係先行コピーパターンを使用して
  Dockerビルド時間を最適化する。R、Node.js、Pythonプロジェクトに適用可能。Dockerビルドが
  パッケージの繰り返しインストールにより遅い場合、リビルドがコード変更のたびにすべての依存関係を
  再インストールする場合、イメージサイズが不必要に大きい場合、またはCI/CDパイプラインのビルドが
  ボトルネックになっている場合に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: intermediate
  language: Docker
  tags: docker, cache, optimization, multi-stage, buildkit
locale: ja
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
---

# Dockerビルドキャッシュの最適化

効果的なレイヤーキャッシュとビルド最適化によりDockerビルド時間を短縮する。

## 使用タイミング

- パッケージの繰り返しインストールによりDockerビルドが遅い場合
- リビルドがコード変更のたびにすべての依存関係を再インストールする場合
- イメージサイズが不必要に大きい場合
- CI/CDパイプラインのビルドがボトルネックになっている場合

## 入力

- **必須**: 最適化する既存のDockerfile
- **任意**: 目標ビルド時間の改善値
- **任意**: 目標イメージサイズの削減値

## 手順

### ステップ1: 変更頻度順にレイヤーを並べる

変更頻度の低いレイヤーを先に配置する：

```dockerfile
# 1. ベースイメージ（ほとんど変更されない）
FROM rocker/r-ver:4.5.0

# 2. システム依存関係（たまに変更される）
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# 3. 依存関係ファイルのみ（依存関係変更時に変わる）
COPY renv.lock renv.lock
COPY renv/activate.R renv/activate.R
RUN R -e "renv::restore()"

# 4. ソースコード（頻繁に変更される）
COPY . .
```

**基本原則**: Dockerは各レイヤーをキャッシュする。レイヤーが変更されると、以降のすべてのレイヤーが再ビルドされる。依存関係のインストールはソースコードのコピーよりも前に行うべきである。

**期待結果：** Dockerfileのレイヤーが変更頻度の低い順（ベースイメージ、システム依存関係）から高い順（ソースコード）に並んでおり、依存関係ロックファイルがフルソースの前にコピーされている。

**失敗時：** コード変更のたびにビルドが依存関係を再インストールする場合、`COPY . .`が依存関係インストールの`RUN`コマンドの後に来ていることを確認する。

### ステップ2: 依存関係インストールとコードを分離する

**悪い例**（コード変更のたびにパッケージをリビルド）：

```dockerfile
COPY . .
RUN R -e "renv::restore()"
```

**良い例**（ロックファイル変更時のみパッケージをリビルド）：

```dockerfile
COPY renv.lock renv.lock
RUN R -e "renv::restore()"
COPY . .
```

Node.jsでも同じパターン：

```dockerfile
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
```

**期待結果：** 依存関係ロックファイル（`renv.lock`、`package-lock.json`、`requirements.txt`）がフルソースコードの`COPY . .`の前に別レイヤーでコピーおよびインストールされている。

**失敗時：** ロックファイルのコピーに失敗する場合、ファイルがビルドコンテキストに存在し、`.dockerignore`で除外されていないことを確認する。

### ステップ3: マルチステージビルドの使用

ビルド依存関係とランタイムを分離する：

```dockerfile
# ビルドステージ - 開発ツールを含む
FROM rocker/r-ver:4.5.0 AS builder
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev libssl-dev build-essential
COPY renv.lock .
RUN R -e "install.packages('renv'); renv::restore()"

# ランタイムステージ - 最小限のイメージ
FROM rocker/r-ver:4.5.0
RUN apt-get update && apt-get install -y \
    libcurl4 libssl3 \
    && rm -rf /var/lib/apt/lists/*
COPY --from=builder /usr/local/lib/R/site-library /usr/local/lib/R/site-library
COPY . /app
WORKDIR /app
CMD ["Rscript", "main.R"]
```

**期待結果：** Dockerfileに開発ツールを含むビルドステージと本番依存関係のみを含むランタイムステージがある。最終イメージがシングルステージビルドよりも大幅に小さい。

**失敗時：** `COPY --from=builder`がライブラリを見つけられない場合、ステージ間でインストールパスが一致していることを確認する。`docker build --target builder .`を使用してビルドステージを独立してデバッグする。

### ステップ4: RUNコマンドの結合

各`RUN`がレイヤーを作成する。関連するコマンドを結合する：

**悪い例**（3レイヤー、aptキャッシュが残る）：

```dockerfile
RUN apt-get update
RUN apt-get install -y curl git
RUN rm -rf /var/lib/apt/lists/*
```

**良い例**（1レイヤー、キャッシュクリーン）：

```dockerfile
RUN apt-get update && apt-get install -y \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*
```

**期待結果：** 関連する`apt-get`やパッケージインストールコマンドが単一の`RUN`命令に結合され、それぞれがキャッシュクリーンアップ（`rm -rf /var/lib/apt/lists/*`）で終わっている。

**失敗時：** 結合した`RUN`コマンドが途中で失敗する場合、一時的に分割して失敗するコマンドを特定し、修正後に再結合する。

### ステップ5: .dockerignoreの使用

不要なファイルがビルドコンテキストに入るのを防ぐ：

```
.git
.Rproj.user
.Rhistory
.RData
renv/library
renv/cache
node_modules
docs/
*.tar.gz
.env
```

**期待結果：** `.git`、`node_modules`、`renv/library`、ビルド成果物、環境ファイルを除外する`.dockerignore`ファイルがプロジェクトルートに存在する。ビルドコンテキストのサイズが目に見えて小さくなる。

**失敗時：** コンテナ内で必要なファイルが見つからない場合、`.dockerignore`に広すぎるパターンがないか確認する。`docker build`の詳細出力を使用して、デーモンに送信されるファイルを確認する。

### ステップ6: BuildKitの有効化

```bash
DOCKER_BUILDKIT=1 docker build -t myimage .
```

または`docker-compose.yml`で：

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
```

`COMPOSE_DOCKER_CLI_BUILD=1`と`DOCKER_BUILDKIT=1`環境変数を設定する。

BuildKitが有効にするもの：
- ステージの並列ビルド
- 改善されたキャッシュ管理
- 永続的なパッケージキャッシュ用の`--mount=type=cache`

**期待結果：** BuildKitが有効な状態でビルドが実行される（`#1 [internal] load build definition`スタイルの出力で示される）。マルチステージビルドが可能な場合にステージを並列実行する。

**失敗時：** BuildKitがアクティブでない場合、ビルドコマンドの前に環境変数がエクスポートされていることを確認する。古いDockerバージョンでは、BuildKitサポートのためDocker Engineを18.09以上にアップグレードする。

### ステップ7: パッケージマネージャー用キャッシュマウントの使用

```dockerfile
# 永続キャッシュ付きRパッケージ
RUN --mount=type=cache,target=/usr/local/lib/R/site-library \
    R -e "install.packages('dplyr')"

# 永続キャッシュ付きnpm
RUN --mount=type=cache,target=/root/.npm \
    npm ci
```

**期待結果：** 後続のビルドがマウントからキャッシュされたパッケージを再利用し、レイヤーが無効化された場合でもインストール時間が大幅に短縮される。キャッシュはビルド間で永続化される。

**失敗時：** `--mount=type=cache`が認識されない場合、BuildKitが有効になっていることを確認する（`DOCKER_BUILDKIT=1`）。この構文はBuildKitが必要で、レガシービルダーではサポートされていない。

## バリデーション

- [ ] コードのみの変更後のリビルドが大幅に高速化される
- [ ] ロックファイルが変更されていない場合、依存関係インストールレイヤーがキャッシュされる
- [ ] `.dockerignore`が不要なファイルを除外している
- [ ] 最適化前のビルドと比較してイメージサイズが縮小される
- [ ] マルチステージビルド（使用する場合）がビルドとランタイムの依存関係を分離する

## よくある落とし穴

- **依存関係インストール前にすべてのファイルをコピー**: コード変更のたびに依存関係キャッシュが無効化される
- **`.dockerignore`の忘れ**: 大きなビルドコンテキストがすべてのビルドを遅くする
- **レイヤーが多すぎる**: 各`RUN`、`COPY`、`ADD`がレイヤーを作成する。論理的にまとめて結合する
- **aptキャッシュのクリーンアップ忘れ**: apt-getインストールの最後に常に`&& rm -rf /var/lib/apt/lists/*`を付ける
- **プラットフォーム固有のキャッシュ**: キャッシュレイヤーはプラットフォーム固有。CIランナーはローカルキャッシュの恩恵を受けない場合がある

## 関連スキル

- `create-r-dockerfile` - 初期Dockerfileの作成
- `setup-docker-compose` - composeビルドの設定
- `containerize-mcp-server` - MCPサーバービルドへの最適化の適用
