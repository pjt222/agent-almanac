---
name: create-multistage-dockerfile
description: >
  ビルド環境とランタイム環境を分離して最小限の本番イメージを作成するマルチステージDockerfileを構築する。
  ビルダー/ランタイムステージの分離、成果物のコピー、scratch/distroless/alpineターゲット、
  およびサイズ比較をカバーする。本番イメージが大きすぎる場合、ビルドツールが最終イメージに含まれている場合、
  1つのDockerfileから開発用と本番用の別々のイメージが必要な場合、またはエッジやサーバーレスなどの
  制約のある環境にデプロイする場合に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: intermediate
  language: Docker
  tags: docker, multi-stage, distroless, alpine, scratch, optimization
locale: ja
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
---

# マルチステージDockerfileの作成

ビルドツールとランタイムを分離して最小限の本番イメージを生成するマルチステージDockerfileを構築する。

## 使用タイミング

- 本番イメージが大きすぎる場合（コンパイル言語で500MB超）
- ビルドツール（コンパイラ、開発ヘッダー）が最終イメージに含まれている場合
- 1つのDockerfileから開発用と本番用の別々のイメージが必要な場合
- 制約のある環境（エッジ、サーバーレス）へのデプロイ

## 入力

- **必須**: 既存のDockerfileまたはコンテナ化するプロジェクト
- **必須**: 言語とビルドシステム（npm、pip、go build、cargo、maven）
- **任意**: ターゲットランタイムベース（slim、alpine、distroless、scratch）
- **任意**: 最終イメージのサイズ制限

## 手順

### ステップ1: ビルド依存関係とランタイム依存関係の識別

| カテゴリ | ビルドステージ | ランタイムステージ |
|----------|-------------|---------------|
| コンパイラ | gcc、g++、rustc | 不要 |
| パッケージマネージャー | npm、pip、cargo | 場合による（インタープリタ言語） |
| 開発ヘッダー | `-dev`パッケージ | 不要 |
| ソースコード | フルソースツリー | コンパイル出力のみ |
| テストフレームワーク | jest、pytest | 不要 |

### ステップ2: マルチステージビルドの構造化

コアパターン：大きなイメージでビルドし、成果物をスリムなイメージにコピーする。

```dockerfile
# ---- ビルドステージ ----
FROM <build-image> AS builder
WORKDIR /src
COPY <dependency-manifest> .
RUN <install-dependencies>
COPY . .
RUN <build-command>

# ---- ランタイムステージ ----
FROM <runtime-image>
COPY --from=builder /src/<artifact> /<dest>
EXPOSE <port>
CMD [<entrypoint>]
```

### ステップ3: 言語固有パターンの適用

#### Node.js（プルーニングされたnode_modules）

```dockerfile
FROM node:22-bookworm AS builder
WORKDIR /src
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:22-bookworm-slim
RUN groupadd -r app && useradd -r -g app app
WORKDIR /app
COPY --from=builder /src/dist ./dist
COPY --from=builder /src/node_modules ./node_modules
COPY --from=builder /src/package.json .
USER app
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

#### Python（virtualenvコピー）

```dockerfile
FROM python:3.12-bookworm AS builder
WORKDIR /src
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

FROM python:3.12-slim-bookworm
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
WORKDIR /app
COPY --from=builder /src .
RUN groupadd -r app && useradd -r -g app app
USER app
EXPOSE 8000
CMD ["python", "app.py"]
```

#### Go（scratchへの静的バイナリ）

```dockerfile
FROM golang:1.23-bookworm AS builder
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /server ./cmd/server

FROM scratch
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /server /server
EXPOSE 8080
ENTRYPOINT ["/server"]
```

#### Rust（静的muslバイナリ）

```dockerfile
FROM rust:1.82-bookworm AS builder
RUN apt-get update && apt-get install -y musl-tools && rm -rf /var/lib/apt/lists/*
RUN rustup target add x86_64-unknown-linux-musl
WORKDIR /src
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs \
    && cargo build --release --target x86_64-unknown-linux-musl \
    && rm -rf src
COPY . .
RUN touch src/main.rs && cargo build --release --target x86_64-unknown-linux-musl

FROM scratch
COPY --from=builder /src/target/x86_64-unknown-linux-musl/release/myapp /myapp
EXPOSE 8080
ENTRYPOINT ["/myapp"]
```

**期待結果：** 最終イメージにランタイムとコンパイル済み成果物のみが含まれる。

**失敗時：** `COPY --from=builder`のパスを確認する。`docker build --target builder`を使用してビルドステージをデバッグする。

### ステップ4: ランタイムベースの選択

| ベース | サイズ | シェル | ユースケース |
|------|------|-------|----------|
| `scratch` | 0 MB | なし | 静的Go/Rustバイナリ |
| `gcr.io/distroless/static` | 約2 MB | なし | 静的バイナリ + CA証明書 |
| `gcr.io/distroless/base` | 約20 MB | なし | 動的バイナリ（libc） |
| `*-slim` | 50-150 MB | あり | インタープリタ言語 |
| `alpine` | 約7 MB | あり | シェルアクセスが必要な場合 |

**注意:** Alpineはmusl libcを使用する。一部のPythonホイールやNodeネイティブモジュールは動作しない場合がある。インタープリタ言語には`-slim`（glibc）を推奨する。

### ステップ5: ステージ間のビルド引数

```dockerfile
ARG APP_VERSION=0.0.0

FROM golang:1.23 AS builder
ARG APP_VERSION
RUN go build -ldflags="-X main.version=${APP_VERSION}" -o /server .

FROM gcr.io/distroless/static
COPY --from=builder /server /server
ENTRYPOINT ["/server"]
```

ビルド時: `docker build --build-arg APP_VERSION=1.2.3 .`

**注意:** `FROM`の前の`ARG`はグローバル。各ステージで使用するには`ARG`を再宣言する必要がある。

### ステップ6: イメージサイズの比較

```bash
# 両方のバリアントをビルド
docker build -t myapp:fat --target builder .
docker build -t myapp:slim .

# サイズを比較
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | grep myapp
```

**期待結果：** 本番イメージがビルドステージより50-90%小さい。

## バリデーション

- [ ] `docker build`がすべてのステージで完了する
- [ ] 最終イメージにビルドツール（コンパイラ、開発ヘッダー）が含まれていない
- [ ] スリムイメージからの`docker run`が正しく動作する
- [ ] シングルステージと比較してイメージサイズが大幅に縮小される
- [ ] `COPY --from=builder`のパスが正しい
- [ ] 本番イメージにソースコードが漏洩していない

## よくある落とし穴

- **ランタイムライブラリの不足**: コンパイルされたコードが共有ライブラリ（`libc`、`libssl`）を必要とする場合がある。スリムイメージを十分にテストする
- **`COPY --from`パスの誤り**: 成果物のパスは正確に一致する必要がある。`docker build --target builder`してから`docker run --rm builder ls /path`でデバッグする
- **Alpineのmusl問題**: ネイティブNode.jsアドオンや一部のPythonパッケージはAlpineで失敗する。代わりに`-slim`を使用する
- **グローバルARGスコープ**: `FROM`の前に宣言された`ARG`は`FROM`行でのみ利用可能。各ステージ内で再宣言する
- **CA証明書の忘れ**: `scratch`には証明書がない。ビルダーから`/etc/ssl/certs/ca-certificates.crt`をコピーするかdistrolessを使用する

## 関連スキル

- `create-dockerfile` - シングルステージの汎用Dockerfile
- `create-r-dockerfile` - rockerイメージを使用するR固有のDockerfile
- `optimize-docker-build-cache` - レイヤーキャッシュとBuildKit機能
- `setup-compose-stack` - マルチステージイメージを使用するcompose設定
