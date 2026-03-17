---
name: create-r-dockerfile
description: >
  Erstelle ein Dockerfile fuer R-Projekte mit rocker-Basisimages. Umfasst die
  Installation von Systemabhaengigkeiten, R-Paketinstallation, renv-Integration
  und optimierte Layer-Reihenfolge fuer schnelle Rebuilds. Verwende diesen Skill
  beim Containerisieren einer R-Anwendung oder Analyse, beim Erstellen
  reproduzierbarer R-Umgebungen, beim Deployen R-basierter Dienste (Shiny,
  Plumber, MCP-Server) oder beim Einrichten konsistenter Entwicklungsumgebungen
  auf verschiedenen Rechnern.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: intermediate
  language: Docker
  tags: docker, r, rocker, container, reproducibility
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# R-Dockerfile erstellen

Erstelle ein Dockerfile fuer R-Projekte mit rocker-Basisimages und ordnungsgemaessem Abhaengigkeitsmanagement.

## Wann verwenden

- Containerisieren einer R-Anwendung oder Analyse
- Erstellen reproduzierbarer R-Umgebungen
- Deployen R-basierter Dienste (Shiny, Plumber, MCP-Server)
- Einrichten konsistenter Entwicklungsumgebungen

## Eingaben

- **Erforderlich**: R-Projekt mit Abhaengigkeiten (DESCRIPTION oder renv.lock)
- **Erforderlich**: Zweck (Entwicklung, Produktion oder Dienst)
- **Optional**: R-Version (Standard: neueste stabile Version)
- **Optional**: Zusaetzlich benoetigte Systembibliotheken

## Vorgehensweise

### Schritt 1: Basisimage waehlen

| Anwendungsfall | Basisimage | Groesse |
|----------------|-----------|---------|
| Minimale R-Laufzeitumgebung | `rocker/r-ver:4.5.0` | ~800MB |
| Mit tidyverse | `rocker/tidyverse:4.5.0` | ~1.8GB |
| Mit RStudio Server | `rocker/rstudio:4.5.0` | ~1.9GB |
| Shiny-Server | `rocker/shiny-verse:4.5.0` | ~2GB |

**Erwartet:** Ein Basisimage wird ausgewaehlt, das den Projektanforderungen entspricht, ohne unnoetige Aufblaehung.

**Bei Fehler:** Bei Unsicherheit, welches Image verwendet werden soll, mit `rocker/r-ver` (minimal) beginnen und Pakete nach Bedarf hinzufuegen. Den vollstaendigen Image-Katalog unter [rocker-org](https://github.com/rocker-org/rocker-versioned2) pruefen.

### Schritt 2: Dockerfile schreiben

```dockerfile
FROM rocker/r-ver:4.5.0

# Systemabhaengigkeiten installieren
# Nach Zweck gruppiert fuer Uebersichtlichkeit
RUN apt-get update && apt-get install -y \
    # HTTP/SSL
    libcurl4-openssl-dev \
    libssl-dev \
    # XML-Verarbeitung
    libxml2-dev \
    # Git-Integration
    libgit2-dev \
    libssh2-1-dev \
    # Grafik
    libfontconfig1-dev \
    libharfbuzz-dev \
    libfribidi-dev \
    libfreetype6-dev \
    libpng-dev \
    libtiff5-dev \
    libjpeg-dev \
    # Hilfsprogramme
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# R-Pakete installieren
# Reihenfolge: am wenigsten aenderbare zuerst fuer Cache-Effizienz
RUN R -e "install.packages(c( \
    'remotes', \
    'devtools', \
    'renv' \
    ), repos='https://cloud.r-project.org/')"

# Arbeitsverzeichnis setzen
WORKDIR /workspace

# Zuerst renv-Dateien kopieren (Cache-Layer)
COPY renv.lock renv.lock
COPY renv/activate.R renv/activate.R

# Pakete aus Lockfile wiederherstellen
RUN R -e "renv::restore()"

# Projektdateien kopieren
COPY . .

# Standardbefehl
CMD ["R"]
```

**Erwartet:** Dockerfile wird erfolgreich mit `docker build -t myproject .` gebaut.

**Bei Fehler:** Wenn der Build waehrend `apt-get install` fehlschlaegt, Paketnamen fuer die Zieldistribution (Debian) pruefen. Wenn `renv::restore()` fehlschlaegt, sicherstellen, dass `renv.lock` und `renv/activate.R` vor dem Restore-Schritt kopiert werden.

### Schritt 3: .dockerignore erstellen

```
.git
.Rproj.user
.Rhistory
.RData
renv/library
renv/cache
renv/staging
docs/
*.tar.gz
```

**Erwartet:** `.dockerignore` schliesst Git-Verlauf, IDE-Dateien, lokale renv-Bibliothek und Build-Artefakte aus dem Docker-Kontext aus.

**Bei Fehler:** Wenn der Docker-Build weiterhin unerwuenschte Dateien kopiert, sicherstellen, dass `.dockerignore` im selben Verzeichnis wie das Dockerfile liegt und korrekte Glob-Muster verwendet.

### Schritt 4: Bauen und Testen

```bash
docker build -t r-project:latest .
docker run --rm -it r-project:latest R -e "sessionInfo()"
```

**Erwartet:** Container startet mit korrekter R-Version und alle Pakete sind verfuegbar. Die `sessionInfo()`-Ausgabe bestaetigt die erwartete R-Version.

**Bei Fehler:** Build-Logs auf Systemabhaengigkeitsfehler pruefen. Fehlende `-dev`-Pakete zum `apt-get install`-Layer hinzufuegen.

### Schritt 5: Fuer Produktion optimieren

Fuer Produktions-Deployments Multi-Stage-Builds verwenden:

```dockerfile
# Build-Phase
FROM rocker/r-ver:4.5.0 AS builder
RUN apt-get update && apt-get install -y libcurl4-openssl-dev libssl-dev
COPY renv.lock .
RUN R -e "install.packages('renv'); renv::restore()"

# Laufzeit-Phase
FROM rocker/r-ver:4.5.0
COPY --from=builder /usr/local/lib/R/site-library /usr/local/lib/R/site-library
COPY . /app
WORKDIR /app
CMD ["Rscript", "main.R"]
```

**Erwartet:** Multi-Stage-Build erzeugt ein kleineres finales Image. Die Laufzeit-Phase enthaelt nur kompilierte R-Pakete, keine Build-Tools.

**Bei Fehler:** Wenn Pakete in der Laufzeit-Phase nicht geladen werden koennen, sicherstellen, dass der Bibliothekspfad in `COPY --from=builder` mit dem Installationsort der R-Pakete uebereinstimmt. Mit `R -e ".libPaths()"` in beiden Phasen pruefen.

## Validierung

- [ ] `docker build` wird fehlerfrei abgeschlossen
- [ ] Container startet und R-Sitzung funktioniert
- [ ] Alle erforderlichen Pakete sind verfuegbar
- [ ] `.dockerignore` schliesst unnoetige Dateien aus
- [ ] Image-Groesse ist angemessen fuer den Anwendungsfall
- [ ] Rebuilds sind schnell, wenn sich nur Code aendert (Layer-Caching funktioniert)

## Haeufige Fehler

- **Fehlende Systemabhaengigkeiten**: R-Pakete mit kompiliertem Code benoetigen `-dev`-Bibliotheken. Fehlermeldungen waehrend `install.packages()` pruefen.
- **Layer-Cache-Invalidierung**: Das Kopieren aller Dateien vor der Paketinstallation invalidiert den Cache bei jeder Code-Aenderung. Zuerst die Lockfile kopieren.
- **Grosse Images**: `rm -rf /var/lib/apt/lists/*` nach `apt-get install` verwenden. Multi-Stage-Builds in Betracht ziehen.
- **Zeitzonen-Probleme**: `ENV TZ=UTC` hinzufuegen oder `tzdata` fuer zeitzonenbewusste Operationen installieren.
- **Als Root ausfuehren**: Fuer Produktion einen Nicht-Root-Benutzer hinzufuegen: `RUN useradd -m appuser && USER appuser`

## Beispiele

```bash
# Entwicklungscontainer mit eingehaengtem Quellcode
docker run --rm -it -v $(pwd):/workspace r-project:latest R

# Plumber-API-Dienst
docker run -d -p 8000:8000 r-api:latest

# Shiny-App
docker run -d -p 3838:3838 r-shiny:latest
```

## Verwandte Skills

- `setup-docker-compose` - Mehrere Container orchestrieren
- `containerize-mcp-server` - Spezialfall fuer MCP-R-Server
- `optimize-docker-build-cache` - Erweiterte Caching-Strategien
- `manage-renv-dependencies` - renv.lock speist Docker-Builds
