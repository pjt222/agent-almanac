---
name: create-dockerfile
locale: wenyan-ultra
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

書產備 Dockerfile 為標應案。

## 用

- 容器化 Node.js、Python、Go、Rust、Java 應
- 建一致構/行境
- 為雲部或 Docker Compose 備應
- 案中無存 Dockerfile

## 入

- **必**：案語與入點（如 `npm start`、`python app.py`）
- **必**：依備（package.json、requirements.txt、go.mod、Cargo.toml、pom.xml）
- **可**：目境（發或產）
- **可**：露口

## 行

### 一：擇基像

| 語 | 發像 | 產像 | 寸 |
|----------|-----------|------------|------|
| Node.js | `node:22-bookworm` | `node:22-bookworm-slim` | ~200MB |
| Python | `python:3.12-bookworm` | `python:3.12-slim-bookworm` | ~150MB |
| Go | `golang:1.23-bookworm` | `gcr.io/distroless/static` | ~2MB |
| Rust | `rust:1.82-bookworm` | `debian:bookworm-slim` | ~80MB |
| Java | `eclipse-temurin:21-jdk` | `eclipse-temurin:21-jre` | ~200MB |

**得：** 產像擇 slim/distroless 變。

### 二：書 Dockerfile（按語）

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

**得：** `docker build -t myapp .` 無誤畢。

**敗：** 察基像可用與依裝令。

### 三：ENTRYPOINT 與 CMD

| 令 | 目 | 覆 |
|-----------|---------|----------|
| `ENTRYPOINT` | 定執 | 以 `--entrypoint` 覆 |
| `CMD` | 默引 | 以尾引覆 |
| 合 | `ENTRYPOINT` + `CMD` 之默引 | 引僅覆 CMD |

編譯單目用 `ENTRYPOINT`。解譯語可欲 `docker run myapp bash` 則用 `CMD`。

### 四：建 .dockerignore

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

**得：** 構脈除發餘。

### 五：加非 root 用

產時恆行為非 root：

```dockerfile
RUN groupadd -r appuser && useradd -r -g appuser -m appuser
USER appuser
```

distroless 像用內建 nonroot：

```dockerfile
FROM gcr.io/distroless/static:nonroot
USER nonroot
```

### 六：構與驗

```bash
docker build -t myapp:latest .
docker run --rm myapp:latest
docker image inspect myapp:latest --format '{{.Size}}'
```

**得：** 容器起、應於期口、非 root 行。

**敗：** 以 `docker logs` 察誌。驗 WORKDIR、COPY 路、露口。

## 驗

- [ ] `docker build` 無誤畢
- [ ] 容器起應
- [ ] `.dockerignore` 除餘檔
- [ ] 應為非 root 行
- [ ] 依先複於源（快效）
- [ ] 密或 `.env` 不入像

## 忌

- **COPY 先於依裝**：碼每變必失依快。先複備
- **為 root 行**：默 Docker 用為 root。產必加非 root
- **缺 .dockerignore**：`node_modules`、`.git` 入構脈費時費碟
- **基像用 `latest`**：釘定版（如 `node:22.11.0`）為重現
- **忘 `--no-cache-dir`**：Python `pip` 默快包、脹像
- **ADD 與 COPY**：用 `COPY` 除需 URL 下或 tar 解（`ADD` 自解）

## 參

- `create-r-dockerfile` - R 專 Dockerfile 用 rocker 像
- `create-multistage-dockerfile` - 多段模為最小產像
- `optimize-docker-build-cache` - 進快策
- `setup-compose-stack` - 以他服調容器化應
