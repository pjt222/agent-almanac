---
name: create-dockerfile
locale: caveman-ultra
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

# Create Dockerfile

Prod-ready Dockerfile for general-purpose apps.

## Use When

- Containerize Node/Python/Go/Rust/Java app
- Consistent build/runtime env
- Cloud deploy / Docker Compose prep
- No existing Dockerfile

## In

- **Required**: Lang + entry (`npm start`, `python app.py`)
- **Required**: Dep manifest (package.json, requirements.txt, go.mod, Cargo.toml, pom.xml)
- **Optional**: Target env (dev/prod)
- **Optional**: Exposed ports

## Do

### Step 1: Base Image

| Lang | Dev Img | Prod Img | Size |
|----------|-----------|------------|------|
| Node.js | `node:22-bookworm` | `node:22-bookworm-slim` | ~200MB |
| Python | `python:3.12-bookworm` | `python:3.12-slim-bookworm` | ~150MB |
| Go | `golang:1.23-bookworm` | `gcr.io/distroless/static` | ~2MB |
| Rust | `rust:1.82-bookworm` | `debian:bookworm-slim` | ~80MB |
| Java | `eclipse-temurin:21-jdk` | `eclipse-temurin:21-jre` | ~200MB |

**Got:** Slim/distroless for prod.

### Step 2: Write Dockerfile (per lang)

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

**Got:** `docker build -t myapp .` → no err.

**If err:** Check base img avail + dep install cmds.

### Step 3: ENTRYPOINT vs CMD

| Directive | Purpose | Override |
|-----------|---------|----------|
| `ENTRYPOINT` | Fixed exec | `--entrypoint` |
| `CMD` | Default args | Trailing args |
| Both | `ENTRYPOINT` + def args via `CMD` | Args override CMD only |

`ENTRYPOINT` → compiled single-purpose. `CMD` → interpreted (want `docker run myapp bash`).

### Step 4: .dockerignore

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

**Got:** Build ctx no dev artifacts.

### Step 5: Non-Root User

Always non-root prod:

```dockerfile
RUN groupadd -r appuser && useradd -r -g appuser -m appuser
USER appuser
```

Distroless:

```dockerfile
FROM gcr.io/distroless/static:nonroot
USER nonroot
```

### Step 6: Build + Verify

```bash
docker build -t myapp:latest .
docker run --rm myapp:latest
docker image inspect myapp:latest --format '{{.Size}}'
```

**Got:** Container starts, port responds, non-root.

**If err:** `docker logs`. Check WORKDIR, COPY paths, ports.

## Check

- [ ] `docker build` no err
- [ ] Container starts + responds
- [ ] `.dockerignore` excludes junk
- [ ] App non-root
- [ ] Deps copied before src (cache)
- [ ] No secrets / `.env` in img

## Traps

- **COPY before dep install**: Invalidates cache on code change. Manifest first.
- **Root user**: Def Docker = root. Add non-root prod.
- **No .dockerignore**: `node_modules` / `.git` in ctx → waste.
- **`latest` tag**: Pin ver (`node:22.11.0`) → repro.
- **No `--no-cache-dir`**: pip caches → img bloat.
- **ADD vs COPY**: `COPY` unless URL / tar (`ADD` auto-extracts).

## →

- `create-r-dockerfile` — R-specific via rocker
- `create-multistage-dockerfile` — multi-stage min prod imgs
- `optimize-docker-build-cache` — cache strategies
- `setup-compose-stack` — orchestrate w/ other svcs
