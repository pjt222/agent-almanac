---
name: create-multistage-dockerfile
description: >
  Erstelle Multi-Stage-Dockerfiles, die Build- und Laufzeitumgebungen fuer minimale
  Produktions-Images trennen. Umfasst Builder/Runtime-Stage-Trennung, Artefakt-Kopieren,
  scratch/distroless/alpine-Ziele und Groessenvergleich. Verwende diesen Skill, wenn
  Produktions-Images zu gross sind, wenn Build-Tools im finalen Image enthalten sind,
  wenn separate Entwicklungs- und Produktions-Images aus einem Dockerfile benoetigt
  werden oder beim Deployen in eingeschraenkten Umgebungen wie Edge oder Serverless.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: intermediate
  language: Docker
  tags: docker, multi-stage, distroless, alpine, scratch, optimization
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# Multi-Stage-Dockerfile erstellen

Multi-Stage-Dockerfiles erstellen, die minimale Produktions-Images erzeugen, indem Build-Tools von der Laufzeit getrennt werden.

## Wann verwenden

- Produktions-Images sind zu gross (>500MB fuer kompilierte Sprachen)
- Build-Tools (Compiler, Dev-Header) sind im finalen Image enthalten
- Separate Images fuer Entwicklung und Produktion aus einem Dockerfile benoetigt
- Deployen in eingeschraenkten Umgebungen (Edge, Serverless)

## Eingaben

- **Erforderlich**: Vorhandenes Dockerfile oder zu containerisierendes Projekt
- **Erforderlich**: Sprache und Build-System (npm, pip, go build, cargo, maven)
- **Optional**: Ziel-Laufzeit-Basis (slim, alpine, distroless, scratch)
- **Optional**: Groessenbudget fuer das finale Image

## Vorgehensweise

### Schritt 1: Build- vs. Laufzeitabhaengigkeiten identifizieren

| Kategorie | Build-Phase | Laufzeit-Phase |
|-----------|-------------|----------------|
| Compiler | gcc, g++, rustc | Nicht benoetigt |
| Paketmanager | npm, pip, cargo | Manchmal (interpretierte Sprachen) |
| Dev-Header | `-dev`-Pakete | Nicht benoetigt |
| Quellcode | Vollstaendiger Quellbaum | Nur kompilierte Ausgabe |
| Testframeworks | jest, pytest | Nicht benoetigt |

### Schritt 2: Multi-Stage-Build strukturieren

Das Kernmuster: In einem grossen Image bauen, Artefakte in ein schlankes Image kopieren.

```dockerfile
# ---- Build-Phase ----
FROM <build-image> AS builder
WORKDIR /src
COPY <abhaengigkeits-manifest> .
RUN <abhaengigkeiten-installieren>
COPY . .
RUN <build-befehl>

# ---- Laufzeit-Phase ----
FROM <laufzeit-image>
COPY --from=builder /src/<artefakt> /<ziel>
EXPOSE <port>
CMD [<einstiegspunkt>]
```

### Schritt 3: Sprachspezifische Muster anwenden

#### Node.js (bereinigte node_modules)

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

#### Python (virtualenv-Kopie)

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

#### Go (statische Binaerdatei nach scratch)

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

#### Rust (statische musl-Binaerdatei)

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

**Erwartet:** Finales Image enthaelt nur die Laufzeit und kompilierte Artefakte.

**Bei Fehler:** `COPY --from=builder`-Pfade pruefen. `docker build --target builder` verwenden, um die Build-Phase zu debuggen.

### Schritt 4: Laufzeit-Basis waehlen

| Basis | Groesse | Shell | Anwendungsfall |
|-------|---------|-------|----------------|
| `scratch` | 0 MB | Nein | Statische Go/Rust-Binaerdateien |
| `gcr.io/distroless/static` | ~2 MB | Nein | Statische Binaerdateien + CA-Zertifikate |
| `gcr.io/distroless/base` | ~20 MB | Nein | Dynamische Binaerdateien (libc) |
| `*-slim` | 50-150 MB | Ja | Interpretierte Sprachen |
| `alpine` | ~7 MB | Ja | Wenn Shell-Zugriff benoetigt wird |

**Hinweis:** Alpine verwendet musl libc. Einige Python-Wheels und Node-Native-Module funktionieren moeglicherweise nicht. Fuer interpretierte Sprachen `-slim` (glibc) bevorzugen.

### Schritt 5: Build-Argumente ueber Phasen hinweg

```dockerfile
ARG APP_VERSION=0.0.0

FROM golang:1.23 AS builder
ARG APP_VERSION
RUN go build -ldflags="-X main.version=${APP_VERSION}" -o /server .

FROM gcr.io/distroless/static
COPY --from=builder /server /server
ENTRYPOINT ["/server"]
```

Build mit: `docker build --build-arg APP_VERSION=1.2.3 .`

**Hinweis:** `ARG` vor `FROM` ist global. Jede Phase muss `ARG` erneut deklarieren, um es zu verwenden.

### Schritt 6: Image-Groessen vergleichen

```bash
# Beide Varianten bauen
docker build -t myapp:fat --target builder .
docker build -t myapp:slim .

# Groessen vergleichen
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | grep myapp
```

**Erwartet:** Produktions-Image ist 50-90% kleiner als die Build-Phase.

## Validierung

- [ ] `docker build` wird fuer alle Phasen abgeschlossen
- [ ] Finales Image enthaelt keine Build-Tools (Compiler, Dev-Header)
- [ ] `docker run` funktioniert korrekt vom schlanken Image
- [ ] Image-Groesse ist im Vergleich zum Single-Stage deutlich reduziert
- [ ] `COPY --from=builder`-Pfade sind korrekt
- [ ] Kein Quellcode gelangt in das Produktions-Image

## Haeufige Fehler

- **Fehlende Laufzeitbibliotheken**: Kompilierter Code benoetigt moeglicherweise Shared Libraries (`libc`, `libssl`). Das schlanke Image gruendlich testen.
- **Fehlerhafte `COPY --from`-Pfade**: Der Artefaktpfad muss exakt uebereinstimmen. `docker build --target builder` verwenden, dann `docker run --rm builder ls /path` zum Debuggen.
- **Alpine-musl-Probleme**: Native Node.js-Addons und einige Python-Pakete scheitern auf Alpine. Stattdessen `-slim` verwenden.
- **Globaler ARG-Gueltigkeitsbereich**: Ein `ARG` vor `FROM` ist nur fuer `FROM`-Zeilen verfuegbar. In jeder Phase, die es benoetigt, erneut deklarieren.
- **CA-Zertifikate vergessen**: `scratch` hat keine Zertifikate. `/etc/ssl/certs/ca-certificates.crt` vom Builder kopieren oder distroless verwenden.

## Verwandte Skills

- `create-dockerfile` - Single-Stage-Allzweck-Dockerfiles
- `create-r-dockerfile` - R-spezifische Dockerfiles mit rocker-Images
- `optimize-docker-build-cache` - Layer-Caching und BuildKit-Funktionen
- `setup-compose-stack` - Compose-Konfigurationen mit Multi-Stage-Images
