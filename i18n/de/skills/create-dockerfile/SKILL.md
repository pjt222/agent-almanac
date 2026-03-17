---
name: create-dockerfile
description: >
  Erstelle allgemeine Dockerfiles fuer Node.js-, Python-, Go-, Rust- und Java-Projekte.
  Umfasst Basisimage-Auswahl, Abhaengigkeitsinstallation, Benutzerberechtigungen,
  COPY-Muster, ENTRYPOINT vs CMD und .dockerignore. Verwende diesen Skill beim
  erstmaligen Containerisieren einer Anwendung, beim Erstellen einer konsistenten
  Build-/Laufzeitumgebung, beim Vorbereiten einer App fuer Cloud-Deployment oder
  Docker Compose, oder wenn kein bestehendes Dockerfile im Projekt vorhanden ist.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: basic
  language: Docker
  tags: docker, dockerfile, node, python, go, rust, java, container
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# Dockerfile erstellen

Ein produktionsreifes Dockerfile fuer allgemeine Anwendungsprojekte schreiben.

## Wann verwenden

- Containerisieren einer Node.js-, Python-, Go-, Rust- oder Java-Anwendung
- Erstellen einer konsistenten Build-/Laufzeitumgebung
- Vorbereiten einer Anwendung fuer Cloud-Deployment oder Docker Compose
- Kein bestehendes Dockerfile im Projekt vorhanden

## Eingaben

- **Erforderlich**: Projektsprache und Einstiegspunkt (z.B. `npm start`, `python app.py`)
- **Erforderlich**: Abhaengigkeitsmanifest (package.json, requirements.txt, go.mod, Cargo.toml, pom.xml)
- **Optional**: Zielumgebung (Entwicklung oder Produktion)
- **Optional**: Freigegebene Ports

## Vorgehensweise

### Schritt 1: Basisimage waehlen

| Sprache | Entwicklungs-Image | Produktions-Image | Groesse |
|---------|---------------------|-------------------|---------|
| Node.js | `node:22-bookworm` | `node:22-bookworm-slim` | ~200MB |
| Python | `python:3.12-bookworm` | `python:3.12-slim-bookworm` | ~150MB |
| Go | `golang:1.23-bookworm` | `gcr.io/distroless/static` | ~2MB |
| Rust | `rust:1.82-bookworm` | `debian:bookworm-slim` | ~80MB |
| Java | `eclipse-temurin:21-jdk` | `eclipse-temurin:21-jre` | ~200MB |

**Erwartet:** Die slim/distroless-Variante fuer Produktions-Images auswaehlen.

### Schritt 2: Dockerfile schreiben (nach Sprache)

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

**Erwartet:** `docker build -t myapp .` wird fehlerfrei abgeschlossen.

**Bei Fehler:** Verfuegbarkeit des Basisimages und Abhaengigkeitsinstallationsbefehle pruefen.

### Schritt 3: ENTRYPOINT vs CMD

| Direktive | Zweck | Ueberschreiben |
|-----------|-------|----------------|
| `ENTRYPOINT` | Feste ausfuehrbare Datei | Ueberschreiben mit `--entrypoint` |
| `CMD` | Standardargumente | Ueberschreiben mit nachfolgenden Argumenten |
| Beide | `ENTRYPOINT` + Standardargumente ueber `CMD` | Argumente ueberschreiben nur CMD |

`ENTRYPOINT` fuer kompilierte Binaerdateien mit einem einzigen Zweck verwenden. `CMD` fuer interpretierte Sprachen verwenden, bei denen man evtl. `docker run myapp bash` ausfuehren moechte.

### Schritt 4: .dockerignore erstellen

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

**Erwartet:** Build-Kontext schliesst Entwicklungsartefakte aus.

### Schritt 5: Nicht-Root-Benutzer hinzufuegen

In Produktion immer als Nicht-Root ausfuehren:

```dockerfile
RUN groupadd -r appuser && useradd -r -g appuser -m appuser
USER appuser
```

Fuer distroless-Images den eingebauten nonroot-Benutzer verwenden:

```dockerfile
FROM gcr.io/distroless/static:nonroot
USER nonroot
```

### Schritt 6: Bauen und Ueberpruefen

```bash
docker build -t myapp:latest .
docker run --rm myapp:latest
docker image inspect myapp:latest --format '{{.Size}}'
```

**Erwartet:** Container startet, antwortet auf dem erwarteten Port, laeuft als Nicht-Root.

**Bei Fehler:** Logs mit `docker logs` pruefen. WORKDIR, COPY-Pfade und freigegebene Ports ueberpruefen.

## Validierung

- [ ] `docker build` wird fehlerfrei abgeschlossen
- [ ] Container startet und Anwendung antwortet
- [ ] `.dockerignore` schliesst unnoetige Dateien aus
- [ ] Anwendung laeuft als Nicht-Root-Benutzer
- [ ] Abhaengigkeiten werden vor dem Quellcode kopiert (Cache-Effizienz)
- [ ] Keine Secrets oder `.env`-Dateien im Image eingebacken

## Haeufige Fehler

- **COPY vor Abhaengigkeitsinstallation**: Invalidiert den Abhaengigkeits-Cache bei jeder Code-Aenderung. Immer zuerst die Manifestdatei kopieren.
- **Als Root ausfuehren**: Standard-Docker-Benutzer ist Root. Fuer Produktion immer einen Nicht-Root-Benutzer hinzufuegen.
- **Fehlende .dockerignore**: Das Senden von `node_modules` oder `.git` in den Build-Kontext verschwendet Zeit und Speicherplatz.
- **`latest`-Tag fuer Basisimages verwenden**: Auf bestimmte Versionen pinnen (z.B. `node:22.11.0`) fuer Reproduzierbarkeit.
- **`--no-cache-dir` vergessen**: Python `pip` cached Pakete standardmaessig und blaeht das Image auf.
- **ADD vs COPY**: `COPY` verwenden, es sei denn, URL-Download oder Tar-Extraktion wird benoetigt (`ADD` extrahiert automatisch).

## Verwandte Skills

- `create-r-dockerfile` - R-spezifisches Dockerfile mit rocker-Images
- `create-multistage-dockerfile` - Multi-Stage-Muster fuer minimale Produktions-Images
- `optimize-docker-build-cache` - Erweiterte Caching-Strategien
- `setup-compose-stack` - Die containerisierte App mit anderen Diensten orchestrieren
