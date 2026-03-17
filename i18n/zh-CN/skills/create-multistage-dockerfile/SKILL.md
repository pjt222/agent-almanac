---
name: create-multistage-dockerfile
description: >
  创建多阶段 Dockerfile，将构建环境和运行时环境分离以生成最小的生产镜像。
  涵盖 builder/runtime 阶段分离、产物复制、scratch/distroless/alpine
  目标以及大小对比。适用于生产镜像过大、构建工具包含在最终镜像中、需要从
  一个 Dockerfile 生成不同的开发和生产镜像，或部署到受限环境（边缘设备、
  Serverless）时。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: intermediate
  language: Docker
  tags: docker, multi-stage, distroless, alpine, scratch, optimization
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# 创建多阶段 Dockerfile

构建多阶段 Dockerfile，通过将构建工具与运行时分离来生成最小的生产镜像。

## 适用场景

- 生产镜像过大（编译语言 >500MB）
- 构建工具（编译器、开发头文件）包含在最终镜像中
- 需要从一个 Dockerfile 生成不同的开发和生产镜像
- 部署到受限环境（边缘设备、Serverless）

## 输入

- **必需**：现有的 Dockerfile 或要容器化的项目
- **必需**：语言和构建系统（npm、pip、go build、cargo、maven）
- **可选**：目标运行时基础（slim、alpine、distroless、scratch）
- **可选**：最终镜像大小预算

## 步骤

### 第 1 步：识别构建依赖与运行时依赖

| 类别 | 构建阶段 | 运行时阶段 |
|------|----------|------------|
| 编译器 | gcc、g++、rustc | 不需要 |
| 包管理器 | npm、pip、cargo | 有时需要（解释型语言） |
| 开发头文件 | `-dev` 包 | 不需要 |
| 源代码 | 完整源代码树 | 仅编译产出 |
| 测试框架 | jest、pytest | 不需要 |

### 第 2 步：构建多阶段结构

核心模式：在大镜像中构建，将产物复制到精简镜像。

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

### 第 3 步：应用语言特定模式

#### Node.js（精简的 node_modules）

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

#### Python（虚拟环境复制）

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

#### Go（静态二进制到 scratch）

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

#### Rust（静态 musl 二进制）

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

**预期结果：** 最终镜像仅包含运行时和编译产物。

**失败处理：** 检查 `COPY --from=builder` 路径。使用 `docker build --target builder` 调试构建阶段。

### 第 4 步：选择运行时基础

| 基础 | 大小 | Shell | 用途 |
|------|------|-------|------|
| `scratch` | 0 MB | 无 | 静态 Go/Rust 二进制 |
| `gcr.io/distroless/static` | ~2 MB | 无 | 静态二进制 + CA 证书 |
| `gcr.io/distroless/base` | ~20 MB | 无 | 动态二进制（libc） |
| `*-slim` | 50-150 MB | 有 | 解释型语言 |
| `alpine` | ~7 MB | 有 | 需要 shell 访问时 |

**注意：** Alpine 使用 musl libc。部分 Python wheel 和 Node 原生模块可能不兼容。解释型语言优先使用 `-slim`（glibc）。

### 第 5 步：跨阶段构建参数

```dockerfile
ARG APP_VERSION=0.0.0

FROM golang:1.23 AS builder
ARG APP_VERSION
RUN go build -ldflags="-X main.version=${APP_VERSION}" -o /server .

FROM gcr.io/distroless/static
COPY --from=builder /server /server
ENTRYPOINT ["/server"]
```

构建命令：`docker build --build-arg APP_VERSION=1.2.3 .`

**注意：** `FROM` 之前的 `ARG` 是全局的。每个需要使用它的阶段必须重新声明 `ARG`。

### 第 6 步：对比镜像大小

```bash
# Build both variants
docker build -t myapp:fat --target builder .
docker build -t myapp:slim .

# Compare sizes
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | grep myapp
```

**预期结果：** 生产镜像比构建阶段小 50-90%。

## 验证清单

- [ ] `docker build` 为所有阶段完成
- [ ] 最终镜像不包含构建工具（编译器、开发头文件）
- [ ] `docker run` 从精简镜像正确工作
- [ ] 镜像大小相比单阶段显著减小
- [ ] `COPY --from=builder` 路径正确
- [ ] 源代码未泄漏到生产镜像中

## 常见问题

- **缺少运行时库**：编译代码可能需要共享库（`libc`、`libssl`）。彻底测试精简镜像。
- **`COPY --from` 路径错误**：产物路径必须精确匹配。使用 `docker build --target builder` 然后 `docker run --rm builder ls /path` 来调试。
- **Alpine musl 问题**：Node.js 原生插件和部分 Python 包在 Alpine 上失败。改用 `-slim`。
- **全局 ARG 作用域**：`FROM` 之前声明的 `ARG` 仅对 `FROM` 行可用。在需要使用的每个阶段内重新声明。
- **忘记 CA 证书**：`scratch` 没有证书。从 builder 复制 `/etc/ssl/certs/ca-certificates.crt` 或使用 distroless。

## 相关技能

- `create-dockerfile` - 单阶段通用 Dockerfile
- `create-r-dockerfile` - 使用 rocker 镜像的 R 特定 Dockerfile
- `optimize-docker-build-cache` - 层缓存和 BuildKit 功能
- `setup-compose-stack` - 使用多阶段镜像的 compose 配置
