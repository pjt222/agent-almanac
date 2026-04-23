---
name: create-multistage-dockerfile
locale: wenyan
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

# 建多階 Dockerfile

建多階 Dockerfile，分建與運境，以最小產像。

## 用時

- 產像過大（編譯語 >500MB）
- 建具（編譯器、dev 標頭）入終像
- 欲由一 Dockerfile 分生開發與產像
- 布至限境（邊緣、無服器）

## 入

- **必要**：現 Dockerfile 或欲容器化之項目
- **必要**：語與建系（npm、pip、go build、cargo、maven）
- **可選**：運基（slim、alpine、distroless、scratch）
- **可選**：終像尺之限

## 法

### 第一步：分建對運依

| 類 | 建階 | 運階 |
|----------|-------------|---------------|
| 編譯器 | gcc、g++、rustc | 不需 |
| 包管 | npm、pip、cargo | 或需（解釋語） |
| dev 標頭 | `-dev` 包 | 不需 |
| 源碼 | 全源樹 | 唯編譯之出 |
| 試框 | jest、pytest | 不需 |

### 第二步：構多階建

核心式：於肥像中建，將物複至瘦像。

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

### 第三步：施語專式

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

#### Go（靜二進至 scratch）

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

#### Rust（靜 musl 二進）

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

**得：** 終像唯含運與編譯之物。

**敗則：** 察 `COPY --from=builder` 路。以 `docker build --target builder` 調建階。

### 第四步：擇運基

| 基 | 尺 | 殼 | 用案 |
|------|------|-------|----------|
| `scratch` | 0 MB | 無 | 靜 Go／Rust 二進 |
| `gcr.io/distroless/static` | ~2 MB | 無 | 靜二進 + CA 證 |
| `gcr.io/distroless/base` | ~20 MB | 無 | 動二進（libc） |
| `*-slim` | 50-150 MB | 有 | 解釋語 |
| `alpine` | ~7 MB | 有 | 需殼訪時 |

**注：** Alpine 用 musl libc。部分 Python wheel 與 Node 原模可不行。解釋語宜 `-slim`（glibc）。

### 第五步：跨階建參

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

**注：** `FROM` 前之 `ARG` 為全域。各階須重聲 `ARG` 以用。

### 第六步：較像尺

```bash
# Build both variants
docker build -t myapp:fat --target builder .
docker build -t myapp:slim .

# Compare sizes
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | grep myapp
```

**得：** 產像比建階小 50-90%。

## 驗

- [ ] `docker build` 畢諸階
- [ ] 終像不含建具（編譯器、dev 標頭）
- [ ] `docker run` 由瘦像正行
- [ ] 像尺比單階大減
- [ ] `COPY --from=builder` 路正
- [ ] 源碼不洩入產像

## 陷

- **缺運庫**：編譯碼或需共享庫（`libc`、`libssl`）。瘦像宜徹試。
- **COPY --from 路破**：物路須精合。以 `docker build --target builder` 再 `docker run --rm builder ls /path` 調。
- **Alpine musl 問**：Node.js 原附加與部分 Python 包於 Alpine 敗。宜用 `-slim`。
- **全 ARG 範**：`FROM` 前之 `ARG` 唯 `FROM` 行可用。需用之階內重聲。
- **忘 CA 證**：`scratch` 無證。由建者複 `/etc/ssl/certs/ca-certificates.crt` 或用 distroless。

## 參

- `create-dockerfile` — 單階通用 Dockerfile
- `create-r-dockerfile` — R 專 Dockerfile 用 rocker 像
- `optimize-docker-build-cache` — 層緩與 BuildKit 之能
- `setup-compose-stack` — 用多階像之 compose 配
