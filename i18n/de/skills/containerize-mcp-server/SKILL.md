---
name: containerize-mcp-server
description: >
  Containerisiere einen R-basierten MCP-Server (Model Context Protocol) mit Docker.
  Umfasst mcptools-Integration, Port-Freigabe, stdio- vs. HTTP-Transport und die
  Verbindung von Claude Code mit dem containerisierten Server. Verwende diesen Skill
  beim Deployen eines R-MCP-Servers ohne lokale R-Installation, beim Erstellen einer
  reproduzierbaren MCP-Server-Umgebung, beim Betrieb von MCP-Servern neben anderen
  containerisierten Diensten oder beim Verteilen eines MCP-Servers an andere Entwickler.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: advanced
  language: Docker
  tags: docker, mcp, mcptools, claude, container
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# MCP-Server containerisieren

Einen R-MCP-Server in einen Docker-Container fuer portables Deployment verpacken.

## Wann verwenden

- Deployen eines R-MCP-Servers ohne lokale R-Installation
- Erstellen einer reproduzierbaren MCP-Server-Umgebung
- Betrieb von MCP-Servern neben anderen containerisierten Diensten
- Verteilen eines MCP-Servers an andere Entwickler

## Eingaben

- **Erforderlich**: R-MCP-Server-Implementierung (mcptools-basiert oder benutzerdefiniert)
- **Erforderlich**: Docker installiert und laufend
- **Optional**: Zusaetzliche R-Pakete, die der Server benoetigt
- **Optional**: Transportmodus (stdio oder HTTP)

## Vorgehensweise

### Schritt 1: Dockerfile fuer MCP-Server erstellen

```dockerfile
FROM rocker/r-ver:4.5.0

# Systemabhaengigkeiten installieren
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    libssl-dev \
    libxml2-dev \
    libgit2-dev \
    libssh2-1-dev \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# R-Pakete installieren
RUN R -e "install.packages(c( \
    'remotes', \
    'ellmer' \
    ), repos='https://cloud.r-project.org/')"

# mcptools installieren
RUN R -e "remotes::install_github('posit-dev/mcptools')"

# Arbeitsverzeichnis setzen
WORKDIR /workspace

# MCP-Server-Ports freigeben
EXPOSE 3000 3001 3002

# Umgebungsvariablen
ENV R_LIBS_USER=/workspace/renv/library
ENV RENV_PATHS_CACHE=/workspace/renv/cache

# Standard: MCP-Server starten
CMD ["R", "-e", "mcptools::mcp_server()"]
```

**Erwartet:** Ein `Dockerfile` existiert im Projektstamm mit `rocker/r-ver`-Basisimage, Systemabhaengigkeiten, mcptools-Installation und dem MCP-Server als Standardbefehl.

**Bei Fehler:** Sicherstellen, dass das Basisimage-Tag zur R-Version passt. Wenn `remotes::install_github` fehlschlaegt, pruefen, ob `git` und `libgit2-dev` im Systemabhaengigkeiten-Layer enthalten sind.

### Schritt 2: docker-compose.yml erstellen

```yaml
version: '3.8'

services:
  mcp-server:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: r-mcp-server
    image: r-mcp-server:latest

    volumes:
      - /path/to/projects:/workspace
      - renv-cache:/workspace/renv/cache

    stdin_open: true
    tty: true

    network_mode: "host"

    environment:
      - TERM=xterm-256color
      - R_LIBS_USER=/workspace/renv/library

    restart: unless-stopped

volumes:
  renv-cache:
    driver: local
```

Die Verwendung von `network_mode: "host"` stellt sicher, dass die MCP-Server-Ports auf localhost erreichbar sind.

**Erwartet:** Eine `docker-compose.yml`-Datei im Projektstamm mit dem MCP-Server-Dienst, Volume-Mounts fuer Projektdateien und renv-Cache sowie aktiviertem `stdin_open`/`tty` fuer stdio-Transport.

**Bei Fehler:** Wenn Volume-Pfade ungueltig sind, `/path/to/projects` an das tatsaechliche Projektverzeichnis anpassen. Unter Windows/WSL `/mnt/c/...`- oder `/mnt/d/...`-Pfade verwenden.

### Schritt 3: Bauen und Starten

```bash
docker compose build
docker compose up -d
```

**Erwartet:** Container startet mit laufendem MCP-Server.

**Bei Fehler:** Logs mit `docker compose logs mcp-server` pruefen. Haeufige Probleme:
- Fehlende R-Pakete: Zum Dockerfile-RUN-Installationsschritt hinzufuegen
- Port bereits belegt: Freigegebenen Port aendern oder kollidierenden Dienst stoppen

### Schritt 4: Claude Code mit Container verbinden

Fuer stdio-Transport (Container muss mit stdin weiterlaufen):

```bash
claude mcp add r-mcp-docker stdio "docker" "exec" "-i" "r-mcp-server" "R" "-e" "mcptools::mcp_server()"
```

Fuer HTTP-Transport (wenn der MCP-Server dies unterstuetzt):

```json
{
  "mcpServers": {
    "r-mcp-docker": {
      "type": "http",
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

**Erwartet:** Die MCP-Konfiguration von Claude Code enthaelt den `r-mcp-docker`-Servereintrag, und `claude mcp list` zeigt den neuen Server.

**Bei Fehler:** Fuer stdio-Transport sicherstellen, dass der Containername uebereinstimmt (`r-mcp-server`) und der Container mit `docker ps` laeuft. Fuer HTTP-Transport pruefen, ob der Port freigegeben und mit `curl http://localhost:3000/mcp` erreichbar ist.

### Schritt 5: Verbindung ueberpruefen

```bash
# Pruefen, ob Container laeuft
docker ps | grep mcp-server

# R-Sitzung im Container testen
docker exec -it r-mcp-server R -e "sessionInfo()"

# Pruefen, ob mcptools verfuegbar ist
docker exec -it r-mcp-server R -e "library(mcptools)"
```

**Erwartet:** `docker ps` zeigt den `r-mcp-server`-Container als laufend, `sessionInfo()` gibt die erwartete R-Version zurueck, und `library(mcptools)` wird fehlerfrei geladen.

**Bei Fehler:** Wenn der Container nicht laeuft, `docker compose logs mcp-server` auf Startfehler pruefen. Wenn mcptools nicht geladen werden kann, das Image neu bauen, um sicherzustellen, dass das Paket korrekt installiert wurde.

### Schritt 6: Benutzerdefinierte MCP-Tools hinzufuegen

Um projektspezifische MCP-Tools hinzuzufuegen, R-Skripte einhaengen:

```yaml
volumes:
  - ./mcp-tools:/mcp-tools
```

Und im CMD laden:

```dockerfile
CMD ["R", "-e", "source('/mcp-tools/custom_tools.R'); mcptools::mcp_server()"]
```

**Erwartet:** Benutzerdefinierte R-Skripte sind im Container unter `/mcp-tools/` zugaenglich, und der MCP-Server laedt sie beim Start neben den Standardtools.

**Bei Fehler:** Sicherstellen, dass der Volume-Mount-Pfad korrekt ist, mit `docker exec -it r-mcp-server ls /mcp-tools/` pruefen. Wenn Skripte nicht gesourced werden koennen, fehlende Paketabhaengigkeiten in den benutzerdefinierten Tools pruefen.

## Validierung

- [ ] Container wird fehlerfrei gebaut
- [ ] MCP-Server startet im Container
- [ ] Claude Code kann sich mit dem containerisierten Server verbinden
- [ ] MCP-Tools antworten korrekt auf Anfragen
- [ ] Container startet sauber neu
- [ ] Volume-Mounts ermoeglichen Zugriff auf Projektdateien

## Haeufige Fehler

- **stdin/tty-Anforderungen**: MCP-stdio-Transport erfordert `stdin_open: true` und `tty: true`
- **Netzwerkisolation**: Standard-Docker-Netzwerk kann Localhost-Zugriff verhindern. `network_mode: "host"` verwenden oder bestimmte Ports freigeben.
- **Paketversionen**: mcptools auf einen bestimmten Commit fuer Reproduzierbarkeit pinnen.
- **Grosse Image-Groesse**: mcptools + Abhaengigkeiten koennen gross sein. Multi-Stage-Builds fuer Produktion in Betracht ziehen.
- **Windows-Docker-Pfade**: Bei Docker Desktop unter Windows mit WSL unterscheidet sich das Pfad-Mapping.

## Verwandte Skills

- `create-r-dockerfile` - Basis-Dockerfile-Muster fuer R
- `setup-docker-compose` - Details zur Compose-Konfiguration
- `configure-mcp-server` - MCP-Server-Konfiguration ohne Docker
- `troubleshoot-mcp-connection` - Debugging von MCP-Verbindungsproblemen
