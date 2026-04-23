---
name: create-multistage-dockerfile
locale: caveman-ultra
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

# Create Multi-Stage Dockerfile

Separate build + runtime → min prod img.

## Use When

- Prod imgs too large (>500MB compiled)
- Build tools (compilers, headers) in final img
- Need dev + prod from 1 Dockerfile
- Constrained env (edge, serverless)

## In

- **Required**: Existing Dockerfile / project
- **Required**: Lang + build (npm, pip, go, cargo, maven)
- **Optional**: Runtime base (slim, alpine, distroless, scratch)
- **Optional**: Size budget

## Do

### Step 1: Build vs Runtime Deps

| Cat | Build Stage | Runtime |
|----------|-------------|---------------|
| Compilers | gcc, g++, rustc | Not needed |
| Pkg mgrs | npm, pip, cargo | Sometimes (interpreted) |
| Dev headers | `-dev` pkgs | Not needed |
| Source | Full tree | Only compiled out |
| Test fw | jest, pytest | Not needed |

### Step 2: Multi-Stage Struct

Pattern: build in fat img, copy artifacts → slim.

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

### Step 3: Lang-Specific

#### Node.js (pruned node_modules)

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

#### Python (venv copy)

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

#### Go (static → scratch)

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

#### Rust (static musl)

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

**Got:** Final img = runtime + compiled artifacts only.

**If err:** Check `COPY --from=builder` paths. Use `docker build --target builder` → debug build stage.

### Step 4: Runtime Base

| Base | Size | Shell | Use |
|------|------|-------|----------|
| `scratch` | 0 MB | No | Static Go/Rust |
| `gcr.io/distroless/static` | ~2 MB | No | Static + CA certs |
| `gcr.io/distroless/base` | ~20 MB | No | Dynamic (libc) |
| `*-slim` | 50-150 MB | Yes | Interpreted |
| `alpine` | ~7 MB | Yes | Shell needed |

**Note:** Alpine = musl libc. Some Python wheels / Node native mods fail. Prefer `-slim` (glibc) for interpreted.

### Step 5: Build Args Cross Stages

```dockerfile
ARG APP_VERSION=0.0.0

FROM golang:1.23 AS builder
ARG APP_VERSION
RUN go build -ldflags="-X main.version=${APP_VERSION}" -o /server .

FROM gcr.io/distroless/static
COPY --from=builder /server /server
ENTRYPOINT ["/server"]
```

Build: `docker build --build-arg APP_VERSION=1.2.3 .`

**Note:** `ARG` before `FROM` = global. Each stage must re-declare `ARG` to use.

### Step 6: Compare Sizes

```bash
# Build both variants
docker build -t myapp:fat --target builder .
docker build -t myapp:slim .

# Compare sizes
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | grep myapp
```

**Got:** Prod img 50-90% smaller than build.

## Check

- [ ] All stages build
- [ ] Final img no build tools
- [ ] `docker run` works from slim
- [ ] Size reduced vs single-stage
- [ ] `COPY --from=builder` paths correct
- [ ] No src leak into prod

## Traps

- **Missing runtime libs**: Compiled code may need shared libs (`libc`, `libssl`). Test slim thoroughly.
- **Broken `COPY --from`**: Path must match exact. Debug: `docker build --target builder` + `docker run --rm builder ls /path`.
- **Alpine musl**: Native Node addons + some Python fail. Use `-slim`.
- **ARG scope**: Global `ARG` before `FROM` → only `FROM` lines. Re-declare in each stage needing it.
- **No CA certs**: `scratch` has none. Copy `/etc/ssl/certs/ca-certificates.crt` / use distroless.

## →

- `create-dockerfile` — single-stage general
- `create-r-dockerfile` — R-specific rocker
- `optimize-docker-build-cache` — layer caching + BuildKit
- `setup-compose-stack` — compose w/ multi-stage
