---
name: optimize-docker-build-cache
description: >
  Optimiere Docker-Buildzeiten durch Layer-Caching, Multi-Stage-Builds,
  BuildKit-Funktionen und Abhaengigkeiten-zuerst-Kopiermuster. Anwendbar auf
  R-, Node.js- und Python-Projekte. Verwende diesen Skill, wenn Docker-Builds
  durch wiederholte Paketinstallationen langsam sind, wenn Rebuilds bei jeder
  Code-Aenderung alle Abhaengigkeiten neu installieren, wenn Image-Groessen
  unnoetig gross sind oder wenn CI/CD-Pipeline-Builds einen Engpass darstellen.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: intermediate
  language: Docker
  tags: docker, cache, optimization, multi-stage, buildkit
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# Docker-Build-Cache optimieren

Docker-Buildzeiten durch effektives Layer-Caching und Build-Optimierung reduzieren.

## Wann verwenden

- Docker-Builds sind durch wiederholte Paketinstallationen langsam
- Rebuilds installieren bei jeder Code-Aenderung alle Abhaengigkeiten neu
- Image-Groessen sind unnoetig gross
- CI/CD-Pipeline-Builds sind ein Engpass

## Eingaben

- **Erforderlich**: Vorhandenes Dockerfile zur Optimierung
- **Optional**: Angestrebte Verbesserung der Buildzeit
- **Optional**: Angestrebte Reduzierung der Image-Groesse

## Vorgehensweise

### Schritt 1: Layer nach Aenderungshaeufigkeit ordnen

Am wenigsten aenderbare Layer zuerst platzieren:

```dockerfile
# 1. Basisimage (aendert sich selten)
FROM rocker/r-ver:4.5.0

# 2. Systemabhaengigkeiten (aendern sich gelegentlich)
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# 3. Nur Abhaengigkeitsdateien (aendern sich bei Deps-Aenderungen)
COPY renv.lock renv.lock
COPY renv/activate.R renv/activate.R
RUN R -e "renv::restore()"

# 4. Quellcode (aendert sich haeufig)
COPY . .
```

**Schluesselprinzip**: Docker cached jeden Layer. Wenn sich ein Layer aendert, werden alle nachfolgenden Layer neu gebaut. Die Abhaengigkeitsinstallation sollte vor dem Quellcode-Kopieren kommen.

**Erwartet:** Die Dockerfile-Layer sind von am wenigsten aenderbar (Basisimage, System-Deps) bis am meisten aenderbar (Quellcode) geordnet, wobei Abhaengigkeits-Lockfiles vor dem vollstaendigen Quellcode kopiert werden.

**Bei Fehler:** Wenn Builds weiterhin bei jeder Code-Aenderung Abhaengigkeiten neu installieren, sicherstellen, dass `COPY . .` nach dem Abhaengigkeitsinstallations-`RUN`-Befehl kommt, nicht davor.

### Schritt 2: Abhaengigkeitsinstallation vom Code trennen

**Schlecht** (baut Pakete bei jeder Code-Aenderung neu):

```dockerfile
COPY . .
RUN R -e "renv::restore()"
```

**Gut** (baut Pakete nur bei Lockfile-Aenderung neu):

```dockerfile
COPY renv.lock renv.lock
RUN R -e "renv::restore()"
COPY . .
```

Gleiches Muster fuer Node.js:

```dockerfile
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
```

**Erwartet:** Die Abhaengigkeits-Lockfile (`renv.lock`, `package-lock.json`, `requirements.txt`) wird in einem separaten Layer kopiert und installiert, bevor der vollstaendige Quellcode mit `COPY . .` kopiert wird.

**Bei Fehler:** Wenn das Kopieren der Lockfile fehlschlaegt, sicherstellen, dass die Datei im Build-Kontext existiert und nicht durch `.dockerignore` ausgeschlossen wird.

### Schritt 3: Multi-Stage-Builds verwenden

Build-Abhaengigkeiten von Laufzeitabhaengigkeiten trennen:

```dockerfile
# Build-Phase - enthaelt Entwicklungstools
FROM rocker/r-ver:4.5.0 AS builder
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev libssl-dev build-essential
COPY renv.lock .
RUN R -e "install.packages('renv'); renv::restore()"

# Laufzeit-Phase - minimales Image
FROM rocker/r-ver:4.5.0
RUN apt-get update && apt-get install -y \
    libcurl4 libssl3 \
    && rm -rf /var/lib/apt/lists/*
COPY --from=builder /usr/local/lib/R/site-library /usr/local/lib/R/site-library
COPY . /app
WORKDIR /app
CMD ["Rscript", "main.R"]
```

**Erwartet:** Das Dockerfile hat eine Builder-Phase mit Entwicklungstools und eine Laufzeit-Phase mit nur Produktionsabhaengigkeiten. Das finale Image ist deutlich kleiner als ein Single-Stage-Build.

**Bei Fehler:** Wenn `COPY --from=builder` keine Bibliotheken findet, den Installationspfad zwischen den Phasen abgleichen. `docker build --target builder .` verwenden, um die Build-Phase unabhaengig zu debuggen.

### Schritt 4: RUN-Befehle kombinieren

Jeder `RUN`-Befehl erstellt einen Layer. Zusammengehoerige Befehle kombinieren:

**Schlecht** (3 Layer, apt-Cache bleibt bestehen):

```dockerfile
RUN apt-get update
RUN apt-get install -y curl git
RUN rm -rf /var/lib/apt/lists/*
```

**Gut** (1 Layer, bereinigter Cache):

```dockerfile
RUN apt-get update && apt-get install -y \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*
```

**Erwartet:** Zusammengehoerige `apt-get`- oder Paketinstallationsbefehle sind in einzelne `RUN`-Anweisungen kombiniert, die jeweils mit Cache-Bereinigung (`rm -rf /var/lib/apt/lists/*`) enden.

**Bei Fehler:** Wenn ein kombinierter `RUN`-Befehl mittendrin fehlschlaegt, ihn voruebergehend aufteilen, um den fehlerhaften Befehl zu identifizieren, dann nach der Behebung wieder zusammenfuegen.

### Schritt 5: .dockerignore verwenden

Unnoetige Dateien am Eintritt in den Build-Kontext hindern:

```
.git
.Rproj.user
.Rhistory
.RData
renv/library
renv/cache
node_modules
docs/
*.tar.gz
.env
```

**Erwartet:** Eine `.dockerignore`-Datei existiert im Projektstamm, die `.git`, `node_modules`, `renv/library`, Build-Artefakte und Umgebungsdateien ausschliesst. Die Build-Kontext-Groesse ist merklich kleiner.

**Bei Fehler:** Wenn benoetigte Dateien im Container fehlen, `.dockerignore` auf zu breite Muster pruefen. Die ausfuehrliche Ausgabe von `docker build` verwenden, um zu ueberpruefen, welche Dateien an den Daemon gesendet werden.

### Schritt 6: BuildKit aktivieren

```bash
DOCKER_BUILDKIT=1 docker build -t myimage .
```

Oder in `docker-compose.yml`:

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
```

Mit den Umgebungsvariablen `COMPOSE_DOCKER_CLI_BUILD=1` und `DOCKER_BUILDKIT=1`.

BuildKit ermoeglicht:
- Parallele Stage-Builds
- Besseres Cache-Management
- `--mount=type=cache` fuer persistente Paket-Caches

**Erwartet:** Builds werden mit aktiviertem BuildKit ausgefuehrt (erkennbar an der Ausgabe im Stil `#1 [internal] load build definition`). Multi-Stage-Builds fuehren Stages wo moeglich parallel aus.

**Bei Fehler:** Wenn BuildKit nicht aktiv ist, sicherstellen, dass die Umgebungsvariablen vor dem Build-Befehl exportiert werden. Bei aelteren Docker-Versionen Docker Engine auf 18.09+ fuer BuildKit-Unterstuetzung aktualisieren.

### Schritt 7: Cache-Mounts fuer Paketmanager verwenden

```dockerfile
# R-Pakete mit persistentem Cache
RUN --mount=type=cache,target=/usr/local/lib/R/site-library \
    R -e "install.packages('dplyr')"

# npm mit persistentem Cache
RUN --mount=type=cache,target=/root/.npm \
    npm ci
```

**Erwartet:** Nachfolgende Builds verwenden gecachte Pakete aus dem Mount wieder, was die Installationszeiten drastisch reduziert, selbst wenn der Layer invalidiert wird. Der Cache bleibt ueber Builds hinweg bestehen.

**Bei Fehler:** Wenn `--mount=type=cache` nicht erkannt wird, sicherstellen, dass BuildKit aktiviert ist (`DOCKER_BUILDKIT=1`). Die Syntax erfordert BuildKit und wird vom Legacy-Builder nicht unterstuetzt.

## Validierung

- [ ] Rebuilds nach reinen Code-Aenderungen sind deutlich schneller
- [ ] Abhaengigkeitsinstallations-Layer wird gecacht, wenn sich die Lockfile nicht geaendert hat
- [ ] `.dockerignore` schliesst unnoetige Dateien aus
- [ ] Image-Groesse ist im Vergleich zum nicht optimierten Build reduziert
- [ ] Multi-Stage-Build (falls verwendet) trennt Build- und Laufzeitabhaengigkeiten

## Haeufige Fehler

- **Alle Dateien vor der Deps-Installation kopieren**: Invalidiert den Abhaengigkeits-Cache bei jeder Code-Aenderung.
- **`.dockerignore` vergessen**: Grosse Build-Kontexte verlangsamen jeden Build.
- **Zu viele Layer**: Jeder `RUN`-, `COPY`-, `ADD`-Befehl erstellt einen Layer. Wo sinnvoll kombinieren.
- **apt-Cache nicht bereinigen**: apt-get-Installationen immer mit `&& rm -rf /var/lib/apt/lists/*` beenden.
- **Plattformspezifische Caches**: Cache-Layer sind plattformspezifisch. CI-Runner profitieren moeglicherweise nicht von lokalen Caches.

## Verwandte Skills

- `create-r-dockerfile` - Initiale Dockerfile-Erstellung
- `setup-docker-compose` - Compose-Build-Konfiguration
- `containerize-mcp-server` - Optimierungen auf MCP-Server-Builds anwenden
