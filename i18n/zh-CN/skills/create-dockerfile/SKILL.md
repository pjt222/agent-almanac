---
name: create-dockerfile
description: >
  为 Node.js、Python、Go、Rust 和 Java 项目创建通用 Dockerfile。涵盖基础
  镜像选择、依赖安装、用户权限、COPY 模式、ENTRYPOINT 与 CMD 的区别以及
  .dockerignore。适用于首次容器化应用程序、创建一致的构建/运行环境、为云部署
  或 Docker Compose 准备应用，或项目中尚无 Dockerfile 时。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: basic
  language: Docker
  tags: docker, dockerfile, node, python, go, rust, java, container
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# 创建 Dockerfile

为通用应用项目编写生产就绪的 Dockerfile。

## 适用场景

- 容器化 Node.js、Python、Go、Rust 或 Java 应用程序
- 创建一致的构建/运行环境
- 为云部署或 Docker Compose 准备应用
- 项目中无现有 Dockerfile

## 输入

- **必需**：项目语言和入口点（如 `npm start`、`python app.py`）
- **必需**：依赖清单（package.json、requirements.txt、go.mod、Cargo.toml、pom.xml）
- **可选**：目标环境（开发或生产）
- **可选**：暴露端口

## 步骤

### 第 1 步：选择基础镜像

| 语言 | 开发镜像 | 生产镜像 | 大小 |
|------|----------|----------|------|
| Node.js | `node:22-bookworm` | `node:22-bookworm-slim` | ~200MB |
| Python | `python:3.12-bookworm` | `python:3.12-slim-bookworm` | ~150MB |
| Go | `golang:1.23-bookworm` | `gcr.io/distroless/static` | ~2MB |
| Rust | `rust:1.82-bookworm` | `debian:bookworm-slim` | ~80MB |
| Java | `eclipse-temurin:21-jdk` | `eclipse-temurin:21-jre` | ~200MB |

**预期结果：** 为生产镜像选择 slim/distroless 变体。

### 第 2 步：编写 Dockerfile（按语言）

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

**预期结果：** `docker build -t myapp .` 无错误完成。

**失败处理：** 检查基础镜像可用性和依赖安装命令。

### 第 3 步：ENTRYPOINT 与 CMD

| 指令 | 用途 | 覆盖方式 |
|------|------|----------|
| `ENTRYPOINT` | 固定可执行文件 | 使用 `--entrypoint` 覆盖 |
| `CMD` | 默认参数 | 使用尾部参数覆盖 |
| 两者结合 | `ENTRYPOINT` + 通过 `CMD` 提供默认参数 | 参数仅覆盖 CMD |

对于具有单一用途的编译二进制文件使用 `ENTRYPOINT`。对于解释型语言使用 `CMD`，以便可以执行 `docker run myapp bash`。

### 第 4 步：创建 .dockerignore

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

**预期结果：** 构建上下文排除开发产物。

### 第 5 步：添加非 root 用户

生产环境始终以非 root 身份运行：

```dockerfile
RUN groupadd -r appuser && useradd -r -g appuser -m appuser
USER appuser
```

对于 distroless 镜像，使用内置的 nonroot 用户：

```dockerfile
FROM gcr.io/distroless/static:nonroot
USER nonroot
```

### 第 6 步：构建和验证

```bash
docker build -t myapp:latest .
docker run --rm myapp:latest
docker image inspect myapp:latest --format '{{.Size}}'
```

**预期结果：** 容器启动，在预期端口响应，以非 root 身份运行。

**失败处理：** 使用 `docker logs` 检查日志。验证 WORKDIR、COPY 路径和暴露端口。

## 验证清单

- [ ] `docker build` 无错误完成
- [ ] 容器启动且应用响应
- [ ] `.dockerignore` 排除不必要的文件
- [ ] 应用以非 root 用户运行
- [ ] 依赖在源代码之前被复制（缓存效率）
- [ ] 镜像中未烘焙密钥或 `.env` 文件

## 常见问题

- **在依赖安装前 COPY**：每次代码更改都使依赖缓存失效。始终先复制清单文件。
- **以 root 运行**：默认 Docker 用户是 root。生产环境始终添加非 root 用户。
- **缺少 .dockerignore**：将 `node_modules` 或 `.git` 发送到构建上下文浪费时间和磁盘。
- **使用 `latest` 标签作为基础镜像**：固定到特定版本（如 `node:22.11.0`）以实现可重现性。
- **忘记 `--no-cache-dir`**：Python `pip` 默认缓存包，导致镜像膨胀。
- **ADD 与 COPY**：使用 `COPY` 除非需要 URL 下载或 tar 解压（`ADD` 自动解压）。

## 相关技能

- `create-r-dockerfile` - 使用 rocker 镜像的 R 特定 Dockerfile
- `create-multistage-dockerfile` - 用于最小生产镜像的多阶段模式
- `optimize-docker-build-cache` - 高级缓存策略
- `setup-compose-stack` - 与其他服务一起编排容器化应用
