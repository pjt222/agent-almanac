---
name: create-dockerfile
description: >
  Node.js、Python、Go、Rust、Javaプロジェクト用の汎用Dockerfileを作成する。ベースイメージの選択、
  依存関係のインストール、ユーザー権限、COPYパターン、ENTRYPOINT vs CMD、および.dockerignoreを
  カバーする。アプリケーションを初めてコンテナ化する場合、一貫したビルド/ランタイム環境の構築、
  クラウドデプロイやDocker Compose向けアプリの準備、またはプロジェクトにDockerfileが存在しない
  場合に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: basic
  language: Docker
  tags: docker, dockerfile, node, python, go, rust, java, container
locale: ja
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
---

# Dockerfileの作成

汎用アプリケーションプロジェクト用の本番対応Dockerfileを作成する。

## 使用タイミング

- Node.js、Python、Go、Rust、またはJavaアプリケーションのコンテナ化
- 一貫したビルド/ランタイム環境の構築
- クラウドデプロイまたはDocker Compose向けアプリケーションの準備
- プロジェクトにDockerfileが存在しない場合

## 入力

- **必須**: プロジェクト言語とエントリポイント（例: `npm start`、`python app.py`）
- **必須**: 依存関係マニフェスト（package.json、requirements.txt、go.mod、Cargo.toml、pom.xml）
- **任意**: 対象環境（開発または本番）
- **任意**: 公開ポート

## 手順

### ステップ1: ベースイメージの選択

| 言語 | 開発イメージ | 本番イメージ | サイズ |
|----------|-----------|------------|------|
| Node.js | `node:22-bookworm` | `node:22-bookworm-slim` | 約200MB |
| Python | `python:3.12-bookworm` | `python:3.12-slim-bookworm` | 約150MB |
| Go | `golang:1.23-bookworm` | `gcr.io/distroless/static` | 約2MB |
| Rust | `rust:1.82-bookworm` | `debian:bookworm-slim` | 約80MB |
| Java | `eclipse-temurin:21-jdk` | `eclipse-temurin:21-jre` | 約200MB |

**期待結果：** 本番イメージにはslim/distrolessバリアントを選択する。

### ステップ2: Dockerfileの作成（言語別）

#### Node.js

```dockerfile
FROM node:22-bookworm-slim

RUN groupadd -r appuser && useradd -r -g appuser -m appuser

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

USER appuser
EXPOSE 3000
CMD ["node", "src/index.js"]
```

#### Python

```dockerfile
FROM python:3.12-slim-bookworm

RUN groupadd -r appuser && useradd -r -g appuser -m appuser

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

USER appuser
EXPOSE 8000
CMD ["python", "app.py"]
```

#### Go

```dockerfile
FROM golang:1.23-bookworm AS builder

WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /app/server ./cmd/server

FROM gcr.io/distroless/static
COPY --from=builder /app/server /server
EXPOSE 8080
ENTRYPOINT ["/server"]
```

#### Rust

```dockerfile
FROM rust:1.82-bookworm AS builder

WORKDIR /src
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs && cargo build --release && rm -rf src

COPY . .
RUN touch src/main.rs && cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /src/target/release/myapp /usr/local/bin/myapp
EXPOSE 8080
ENTRYPOINT ["myapp"]
```

#### Java (Maven)

```dockerfile
FROM eclipse-temurin:21-jdk AS builder

WORKDIR /src
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests

FROM eclipse-temurin:21-jre
COPY --from=builder /src/target/*.jar /app/app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

**期待結果：** `docker build -t myapp .`がエラーなく完了する。

**失敗時：** ベースイメージの利用可能性と依存関係インストールコマンドを確認する。

### ステップ3: ENTRYPOINT vs CMD

| ディレクティブ | 用途 | オーバーライド |
|-----------|---------|----------|
| `ENTRYPOINT` | 固定の実行ファイル | `--entrypoint`でオーバーライド |
| `CMD` | デフォルト引数 | 末尾の引数でオーバーライド |
| 両方 | `ENTRYPOINT` + `CMD`によるデフォルト引数 | 引数はCMDのみオーバーライド |

単一目的のコンパイル済みバイナリには`ENTRYPOINT`を使用する。`docker run myapp bash`の可能性があるインタープリタ言語には`CMD`を使用する。

### ステップ4: .dockerignoreの作成

```
.git
.gitignore
node_modules
__pycache__
*.pyc
target/
.env
.env.*
*.md
!README.md
.vscode
.idea
Dockerfile
docker-compose*.yml
```

**期待結果：** ビルドコンテキストが開発成果物を除外する。

### ステップ5: 非rootユーザーの追加

本番環境では常に非rootで実行する：

```dockerfile
RUN groupadd -r appuser && useradd -r -g appuser -m appuser
USER appuser
```

distrolessイメージの場合、組み込みのnonrootユーザーを使用する：

```dockerfile
FROM gcr.io/distroless/static:nonroot
USER nonroot
```

### ステップ6: ビルドと検証

```bash
docker build -t myapp:latest .
docker run --rm myapp:latest
docker image inspect myapp:latest --format '{{.Size}}'
```

**期待結果：** コンテナが起動し、期待されるポートで応答し、非rootとして実行される。

**失敗時：** `docker logs`でログを確認する。WORKDIR、COPYパス、公開ポートを確認する。

## バリデーション

- [ ] `docker build`がエラーなく完了する
- [ ] コンテナが起動しアプリケーションが応答する
- [ ] `.dockerignore`が不要なファイルを除外している
- [ ] アプリケーションが非rootユーザーとして実行される
- [ ] 依存関係がソースコードの前にコピーされている（キャッシュ効率）
- [ ] シークレットや`.env`ファイルがイメージに焼き込まれていない

## よくある落とし穴

- **依存関係インストール前のCOPY**: コード変更のたびに依存関係キャッシュが無効化される。常にマニフェストファイルを先にコピーする
- **rootでの実行**: デフォルトのDockerユーザーはroot。本番環境では常に非rootユーザーを追加する
- **`.dockerignore`の不足**: `node_modules`や`.git`をビルドコンテキストに送ると時間とディスクを浪費する
- **ベースイメージに`latest`タグを使用**: 再現性のため特定バージョン（例: `node:22.11.0`）に固定する
- **`--no-cache-dir`の忘れ**: Pythonの`pip`はデフォルトでパッケージをキャッシュし、イメージを肥大化させる
- **ADD vs COPY**: URLダウンロードやtar展開が不要な限り`COPY`を使用する（`ADD`は自動展開する）

## 関連スキル

- `create-r-dockerfile` - rockerイメージを使用するR固有のDockerfile
- `create-multistage-dockerfile` - 最小限の本番イメージ用マルチステージパターン
- `optimize-docker-build-cache` - 高度なキャッシュ戦略
- `setup-compose-stack` - コンテナ化されたアプリを他のサービスとオーケストレーション
