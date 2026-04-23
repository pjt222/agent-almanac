---
name: create-multistage-dockerfile
locale: caveman
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

Build multi-stage Dockerfiles producing minimal production images. Separate build tooling from runtime.

## When Use

- Production images too large (>500MB for compiled languages)
- Build tools (compilers, dev headers) in final image
- Need separate images for dev and prod from one Dockerfile
- Deploying to constrained environments (edge, serverless)

## Inputs

- **Required**: Existing Dockerfile or project to containerize
- **Required**: Language and build system (npm, pip, go build, cargo, maven)
- **Optional**: Target runtime base (slim, alpine, distroless, scratch)
- **Optional**: Size budget for final image

## Steps

### Step 1: Identify Build vs Runtime Dependencies

| Category | Build Stage | Runtime Stage |
|----------|-------------|---------------|
| Compilers | gcc, g++, rustc | Not needed |
| Package managers | npm, pip, cargo | Sometimes (interpreted langs) |
| Dev headers | `-dev` packages | Not needed |
| Source code | Full source tree | Only compiled output |
| Test frameworks | jest, pytest | Not needed |

### Step 2: Structure the Multi-Stage Build

Core pattern: build in fat image, copy artifacts to slim image.

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

### Step 3: Apply Language-Specific Patterns

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

#### Python (virtualenv copy)

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

#### Go (static binary to scratch)

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

#### Rust (static musl binary)

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

**Got:** Final image has only runtime and compiled artifacts.

**If fail:** Check `COPY --from=builder` paths. Use `docker build --target builder` to debug build stage.

### Step 4: Choose Runtime Base

| Base | Size | Shell | Use Case |
|------|------|-------|----------|
| `scratch` | 0 MB | No | Static Go/Rust binaries |
| `gcr.io/distroless/static` | ~2 MB | No | Static binaries + CA certs |
| `gcr.io/distroless/base` | ~20 MB | No | Dynamic binaries (libc) |
| `*-slim` | 50-150 MB | Yes | Interpreted languages |
| `alpine` | ~7 MB | Yes | When shell access needed |

**Note:** Alpine uses musl libc. Some Python wheels and Node native modules may not work. Prefer `-slim` (glibc) for interpreted languages.

### Step 5: Build Args Across Stages

```dockerfile
ARG APP_VERSION=0.0.0

FROM golang:1.23 AS builder
ARG APP_VERSION
RUN go build -ldflags="-X main.version=${APP_VERSION}" -o /server .

FROM gcr.io/distroless/static
COPY --from=builder /server /server
ENTRYPOINT ["/server"]
```

Build with: `docker build --build-arg APP_VERSION=1.2.3 .`

**Note:** `ARG` before `FROM` is global. Each stage must re-declare `ARG` to use it.

### Step 6: Compare Image Sizes

```bash
# Build both variants
docker build -t myapp:fat --target builder .
docker build -t myapp:slim .

# Compare sizes
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | grep myapp
```

**Got:** Production image 50-90% smaller than build stage.

## Checks

- [ ] `docker build` finishes for all stages
- [ ] Final image has no build tools (compilers, dev headers)
- [ ] `docker run` works from slim image
- [ ] Image size significantly smaller vs single-stage
- [ ] `COPY --from=builder` paths right
- [ ] No source code leaks into production image

## Pitfalls

- **Missing runtime libraries**: Compiled code may need shared libraries (`libc`, `libssl`). Test slim image thoroughly.
- **Broken `COPY --from` paths**: Artifact path must match exactly. Use `docker build --target builder` then `docker run --rm builder ls /path` to debug.
- **Alpine musl issues**: Native Node.js addons and some Python packages fail on Alpine. Use `-slim` instead.
- **Global ARG scope**: `ARG` declared before `FROM` is available to `FROM` lines only. Re-declare inside each stage that needs it.
- **Forgetting CA certificates**: `scratch` has no certificates. Copy `/etc/ssl/certs/ca-certificates.crt` from builder or use distroless.

## See Also

- `create-dockerfile` - single-stage general Dockerfiles
- `create-r-dockerfile` - R-specific Dockerfiles with rocker images
- `optimize-docker-build-cache` - layer caching and BuildKit features
- `setup-compose-stack` - compose configurations using multi-stage images
