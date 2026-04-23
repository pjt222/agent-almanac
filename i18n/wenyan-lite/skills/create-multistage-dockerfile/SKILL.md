---
name: create-multistage-dockerfile
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Create multi-stage Dockerfiles that separate build and runtime environments
  for minimal production images. Covers builder/runtime stage separation,
  artifact copying, scratch/distroless/alpine targets, and size comparison.
  Use when production images are too large, when build tools are included in
  the final image, when you need separate dev and prod images from one
  Dockerfile, or when deploying to constrained environments like edge or
  serverless.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: intermediate
  language: Docker
  tags: docker, multi-stage, distroless, alpine, scratch, optimization
---

# 造多階段 Dockerfile

建多階段 Dockerfile，以分建構與執行之環境，產最小之生產映像。

## 適用時機

- 生產映像過大（編譯語言 >500MB）
- 建構工具（編譯器、開發標頭）入終映像
- 需自一 Dockerfile 產異之開發與生產映像
- 部署至受限環境（邊緣、無伺服）

## 輸入

- **必要**：既存之 Dockerfile 或待容器化之項目
- **必要**：語言與建構系統（npm、pip、go build、cargo、maven）
- **選擇性**：目標執行基礎（slim、alpine、distroless、scratch）
- **選擇性**：終映像之大小預算

## 步驟

### 步驟一：辨建構與執行依賴

| 類 | 建構階段 | 執行階段 |
|----------|-------------|---------------|
| 編譯器 | gcc、g++、rustc | 不需 |
| 套件管理器 | npm、pip、cargo | 有時（直譯語言） |
| 開發標頭 | `-dev` 套件 | 不需 |
| 源程式 | 全源樹 | 僅編譯輸出 |
| 測試框架 | jest、pytest | 不需 |

### 步驟二：結構化多階段建構

核心模式：建於胖映像，複構件至 slim 映像。

```dockerfile
# ---- Build Stage ----
FROM <build-image> AS builder
WORKDIR /src
COPY <dependency-manifest> .
RUN <install-dependencies>
COPY . .
RUN <build-command>

# ---- Runtime Stage ----
FROM <runtime-image>
COPY --from=builder /src/<artifact> /<dest>
EXPOSE <port>
CMD [<entrypoint>]
```

### 步驟三：施語言專屬模式

#### Node.js（剪之 node_modules）

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

#### Python（virtualenv 複）

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

#### Go（靜態二進制至 scratch）

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

#### Rust（靜態 musl 二進制）

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

**預期：** 終映像僅含執行時與編譯構件。

**失敗時：** 察 `COPY --from=builder` 路。用 `docker build --target builder` 除錯建構階段。

### 步驟四：擇執行基礎

| 基礎 | 大小 | Shell | 用例 |
|------|------|-------|----------|
| `scratch` | 0 MB | 無 | 靜態 Go/Rust 二進制 |
| `gcr.io/distroless/static` | ~2 MB | 無 | 靜態二進制 + CA 憑證 |
| `gcr.io/distroless/base` | ~20 MB | 無 | 動態二進制（libc） |
| `*-slim` | 50-150 MB | 有 | 直譯語言 |
| `alpine` | ~7 MB | 有 | 需 shell 存取時 |

**注：** Alpine 用 musl libc。某 Python wheels 與 Node 原生模組或不可。直譯語言宜用 `-slim`（glibc）。

### 步驟五：跨階段之建構引數

```dockerfile
ARG APP_VERSION=0.0.0

FROM golang:1.23 AS builder
ARG APP_VERSION
RUN go build -ldflags="-X main.version=${APP_VERSION}" -o /server .

FROM gcr.io/distroless/static
COPY --from=builder /server /server
ENTRYPOINT ["/server"]
```

建以：`docker build --build-arg APP_VERSION=1.2.3 .`

**注：** `FROM` 前之 `ARG` 為全域。各階段須重宣 `ARG` 以用之。

### 步驟六：比映像大小

```bash
# Build both variants
docker build -t myapp:fat --target builder .
docker build -t myapp:slim .

# Compare sizes
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | grep myapp
```

**預期：** 生產映像較建構階段小 50-90%。

## 驗證

- [ ] `docker build` 各階段皆完
- [ ] 終映像不含建構工具（編譯器、開發標頭）
- [ ] `docker run` 於 slim 映像中行之無誤
- [ ] 映像大小較單階段顯著減
- [ ] `COPY --from=builder` 路正確
- [ ] 無源程式洩入生產映像

## 常見陷阱

- **缺執行庫**：編譯程式或需共享庫（`libc`、`libssl`）。詳測 slim 映像
- **`COPY --from` 路斷**：構件路須完全合。用 `docker build --target builder` 繼以 `docker run --rm builder ls /path` 除錯
- **Alpine musl 問題**：原生 Node.js 附加與某 Python 套件於 Alpine 敗。改用 `-slim`
- **全域 ARG 範圍**：宣於 `FROM` 前之 `ARG` 僅可用於 `FROM` 行。需用之階段內重宣
- **忘 CA 憑證**：`scratch` 無憑證。自建構器複 `/etc/ssl/certs/ca-certificates.crt` 或用 distroless

## 相關技能

- `create-dockerfile` - 單階段通用 Dockerfile
- `create-r-dockerfile` - R 專屬之 Dockerfile，用 rocker 映像
- `optimize-docker-build-cache` - 層快取與 BuildKit 功能
- `setup-compose-stack` - 以多階段映像行之 compose 配置
