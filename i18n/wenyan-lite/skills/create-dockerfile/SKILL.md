---
name: create-dockerfile
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Create general-purpose Dockerfiles for Node.js, Python, Go, Rust, and Java
  projects. Covers base image selection, dependency installation, user
  permissions, COPY patterns, ENTRYPOINT vs CMD, and .dockerignore. Use when
  containerizing an application for the first time, creating a consistent
  build/runtime environment, preparing an app for cloud deployment or Docker
  Compose, or when no existing Dockerfile is present in the project.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: basic
  language: Docker
  tags: docker, dockerfile, node, python, go, rust, java, container
---

# 造 Dockerfile

為通用應用項目寫可投產之 Dockerfile。

## 適用時機

- 容器化 Node.js、Python、Go、Rust、Java 應用
- 造一致之建構/執行環境
- 備應用以供雲部署或 Docker Compose
- 項目中無既存 Dockerfile

## 輸入

- **必要**：項目語言與入口（如 `npm start`、`python app.py`）
- **必要**：依賴清單（package.json、requirements.txt、go.mod、Cargo.toml、pom.xml）
- **選擇性**：目標環境（開發或生產）
- **選擇性**：暴露之埠

## 步驟

### 步驟一：擇基礎映像

| 語言 | 開發映像 | 生產映像 | 大小 |
|----------|-----------|------------|------|
| Node.js | `node:22-bookworm` | `node:22-bookworm-slim` | ~200MB |
| Python | `python:3.12-bookworm` | `python:3.12-slim-bookworm` | ~150MB |
| Go | `golang:1.23-bookworm` | `gcr.io/distroless/static` | ~2MB |
| Rust | `rust:1.82-bookworm` | `debian:bookworm-slim` | ~80MB |
| Java | `eclipse-temurin:21-jdk` | `eclipse-temurin:21-jre` | ~200MB |

**預期：** 生產映像擇 slim/distroless 變體。

### 步驟二：寫 Dockerfile（按語言）

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

**預期：** `docker build -t myapp .` 完而無誤。

**失敗時：** 察基礎映像可得性與依賴裝命令。

### 步驟三：ENTRYPOINT 與 CMD

| 指令 | 目的 | 覆寫 |
|-----------|---------|----------|
| `ENTRYPOINT` | 固定執行檔 | 以 `--entrypoint` 覆 |
| `CMD` | 預設引數 | 以尾引數覆 |
| 並用 | `ENTRYPOINT` + `CMD` 所提之預設引數 | 引數僅覆 CMD |

編譯二進制且單一目的用 `ENTRYPOINT`。直譯語言宜用 `CMD`——或欲 `docker run myapp bash`。

### 步驟四：造 .dockerignore

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

**預期：** 建構脈絡排開發遺物。

### 步驟五：加非 root 用戶

生產中恒以非 root 執：

```dockerfile
RUN groupadd -r appuser && useradd -r -g appuser -m appuser
USER appuser
```

distroless 映像用內建 nonroot 用戶：

```dockerfile
FROM gcr.io/distroless/static:nonroot
USER nonroot
```

### 步驟六：建構與驗證

```bash
docker build -t myapp:latest .
docker run --rm myapp:latest
docker image inspect myapp:latest --format '{{.Size}}'
```

**預期：** 容器啟、於所期之埠應答、以非 root 執。

**失敗時：** 以 `docker logs` 察日誌。驗 WORKDIR、COPY 路、暴露之埠。

## 驗證

- [ ] `docker build` 完而無誤
- [ ] 容器啟且應用應答
- [ ] `.dockerignore` 排非必要檔
- [ ] 應用以非 root 用戶執
- [ ] 依賴於源程式前複（快取效率）
- [ ] 無機密或 `.env` 檔烘入映像

## 常見陷阱

- **依賴裝前 COPY**：每改程式皆失依賴快取。恒先複清單檔
- **以 root 執**：Docker 預設用 root。生產恒加非 root 用戶
- **缺 .dockerignore**：送 `node_modules` 或 `.git` 入建構脈絡耗時與空間
- **基礎映像用 `latest` 標**：釘至具體版本（如 `node:22.11.0`）以便重現
- **忘 `--no-cache-dir`**：Python `pip` 預設快取套件，膨脹映像
- **ADD 與 COPY**：用 `COPY`，除非需 URL 下載或 tar 解壓（`ADD` 自動解壓）

## 相關技能

- `create-r-dockerfile` - R 專屬之 Dockerfile，用 rocker 映像
- `create-multistage-dockerfile` - 多階段模式，以造最小之生產映像
- `optimize-docker-build-cache` - 進階快取策略
- `setup-compose-stack` - 容器化應用與他服務之編排
