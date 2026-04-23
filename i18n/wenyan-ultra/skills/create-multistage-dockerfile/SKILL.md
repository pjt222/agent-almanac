---
name: create-multistage-dockerfile
locale: wenyan-ultra
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

# 造多段 Dockerfile

構多段 Dockerfile 分構與行境以生最小產像。

## 用

- 產像過大（>500MB 為編譯語）
- 構具（編、發頭）入終像
- 自一 Dockerfile 生發與產異像
- 部於限境（邊、無服）

## 入

- **必**：存 Dockerfile 或待容器化案
- **必**：語與構系（npm、pip、go build、cargo、maven）
- **可**：目行基（slim、alpine、distroless、scratch）
- **可**：終像寸預

## 行

### 一：別構與行依

| 類 | 構段 | 行段 |
|----------|-------------|---------------|
| 編譯 | gcc、g++、rustc | 不需 |
| 包理 | npm、pip、cargo | 或（解譯語） |
| 發頭 | `-dev` 包 | 不需 |
| 源碼 | 全源樹 | 僅編出 |
| 試架 | jest、pytest | 不需 |

### 二：構多段構

核模：構於肥像、複品至瘦像。

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

### 三：施語專模

#### Node.js（剪 node_modules）

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

#### Python（虛境複）

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

#### Go（靜二入 scratch）

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

#### Rust（靜 musl 二）

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

**得：** 終像僅含行與編品。

**敗：** 察 `COPY --from=builder` 路。用 `docker build --target builder` 除構段。

### 四：擇行基

| 基 | 寸 | 殼 | 用 |
|------|------|-------|----------|
| `scratch` | 0 MB | 無 | 靜 Go/Rust 二 |
| `gcr.io/distroless/static` | ~2 MB | 無 | 靜二+CA 證 |
| `gcr.io/distroless/base` | ~20 MB | 無 | 動二（libc） |
| `*-slim` | 50-150 MB | 有 | 解譯語 |
| `alpine` | ~7 MB | 有 | 殼需時 |

**注：** Alpine 用 musl libc。某 Python wheels 與 Node native modules 或不行。解譯語宜用 `-slim`（glibc）。

### 五：跨段構引

```dockerfile
ARG APP_VERSION=0.0.0

FROM golang:1.23 AS builder
ARG APP_VERSION
RUN go build -ldflags="-X main.version=${APP_VERSION}" -o /server .

FROM gcr.io/distroless/static
COPY --from=builder /server /server
ENTRYPOINT ["/server"]
```

構以：`docker build --build-arg APP_VERSION=1.2.3 .`

**注：** `FROM` 前之 `ARG` 為全。各段須重申 `ARG` 以用之。

### 六：較像寸

```bash
# Build both variants
docker build -t myapp:fat --target builder .
docker build -t myapp:slim .

# Compare sizes
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | grep myapp
```

**得：** 產像較構段小 50-90%。

## 驗

- [ ] `docker build` 諸段畢
- [ ] 終像不含構具（編、發頭）
- [ ] `docker run` 於瘦像正行
- [ ] 像寸較單段顯減
- [ ] `COPY --from=builder` 路正
- [ ] 無源漏入產像

## 忌

- **缺行庫**：編碼或需共庫（`libc`、`libssl`）。瘦像須全試
- **破 `COPY --from` 路**：品路須合。用 `docker build --target builder` 再 `docker run --rm builder ls /path` 除
- **Alpine musl 問**：Native Node.js addons 與某 Python 包於 Alpine 敗。用 `-slim`
- **全 ARG 範**：`FROM` 前申之 `ARG` 僅於 `FROM` 行可。各段用則重申
- **忘 CA 證**：`scratch` 無證。自 builder 複 `/etc/ssl/certs/ca-certificates.crt` 或用 distroless

## 參

- `create-dockerfile` - 單段標 Dockerfile
- `create-r-dockerfile` - R 專 Dockerfile 用 rocker 像
- `optimize-docker-build-cache` - 層快與 BuildKit 特
- `setup-compose-stack` - 用多段像之 compose 設
