---
name: create-dockerfile
locale: wenyan
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

# 建 Dockerfile

為通用應用建可產之 Dockerfile。

## 用時

- 將 Node.js、Python、Go、Rust、Java 應用入容器
- 建一致之建／運境
- 備應用為雲布或 Docker Compose
- 項目無現 Dockerfile

## 入

- **必要**：項目語與入點（如 `npm start`、`python app.py`）
- **必要**：依清單（package.json、requirements.txt、go.mod、Cargo.toml、pom.xml）
- **可選**：目標境（開發或生產）
- **可選**：暴露之埠

## 法

### 第一步：擇基像

| 語 | 開發像 | 產像 | 尺 |
|----------|-----------|------------|------|
| Node.js | `node:22-bookworm` | `node:22-bookworm-slim` | ~200MB |
| Python | `python:3.12-bookworm` | `python:3.12-slim-bookworm` | ~150MB |
| Go | `golang:1.23-bookworm` | `gcr.io/distroless/static` | ~2MB |
| Rust | `rust:1.82-bookworm` | `debian:bookworm-slim` | ~80MB |
| Java | `eclipse-temurin:21-jdk` | `eclipse-temurin:21-jre` | ~200MB |

**得：** 為產像擇 slim/distroless 變。

### 第二步：書 Dockerfile（按語）

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

**得：** `docker build -t myapp .` 無訛而畢。

**敗則：** 察基像之可得與依裝命令。

### 第三步：ENTRYPOINT 對 CMD

| 指令 | 用 | 覆蓋 |
|-----------|---------|----------|
| `ENTRYPOINT` | 定執 | 以 `--entrypoint` 覆 |
| `CMD` | 默參 | 以尾參覆 |
| 二者 | `ENTRYPOINT` + `CMD` 之默參 | 參唯覆 CMD |

`ENTRYPOINT` 用於有單一志之編譯二進。`CMD` 用於解釋語，或欲 `docker run myapp bash` 者。

### 第四步：建 .dockerignore

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

**得：** 建脈排開發之物。

### 第五步：增非根用者

產境宜以非根運：

```dockerfile
RUN groupadd -r appuser && useradd -r -g appuser -m appuser
USER appuser
```

distroless 像用內置之 nonroot：

```dockerfile
FROM gcr.io/distroless/static:nonroot
USER nonroot
```

### 第六步：建而驗

```bash
docker build -t myapp:latest .
docker run --rm myapp:latest
docker image inspect myapp:latest --format '{{.Size}}'
```

**得：** 容器起，於期埠應，以非根運。

**敗則：** 以 `docker logs` 察誌。驗 WORKDIR、COPY 路、暴露之埠。

## 驗

- [ ] `docker build` 無訛而畢
- [ ] 容器起而應用應
- [ ] `.dockerignore` 排無謂之文件
- [ ] 應用以非根運
- [ ] 依先於源碼複（緩存有效）
- [ ] 無密或 `.env` 烤入像

## 陷

- **依裝前 COPY**：每改碼則廢依緩。宜先複清單文件。
- **以根運**：Docker 默為根。產境宜增非根用者。
- **缺 .dockerignore**：將 `node_modules` 或 `.git` 送入建脈費時費盤。
- **基像用 `latest`**：宜釘特版（如 `node:22.11.0`）以重現。
- **忘 `--no-cache-dir`**：Python `pip` 默緩存包，脹像。
- **ADD 對 COPY**：除非需 URL 下載或 tar 解壓（`ADD` 自解），宜用 `COPY`。

## 參

- `create-r-dockerfile` — R 專用 Dockerfile，用 rocker 像
- `create-multistage-dockerfile` — 多階段之法以最小產像
- `optimize-docker-build-cache` — 進階緩之策
- `setup-compose-stack` — 以他服協已容器化之應
