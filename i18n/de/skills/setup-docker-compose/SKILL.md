---
name: setup-docker-compose
description: >
  Konfiguriere Docker Compose fuer Multi-Container-R-Entwicklungsumgebungen.
  Umfasst Dienstdefinitionen, Volume-Mounts, Netzwerke, Umgebungsvariablen
  und Konfigurationen fuer Entwicklung vs. Produktion. Verwende diesen Skill
  beim Betrieb von R neben anderen Diensten (Datenbanken, APIs), beim Einrichten
  einer reproduzierbaren R-Entwicklungsumgebung, beim Orchestrieren eines
  R-basierten MCP-Server-Containers oder beim Verwalten von Umgebungsvariablen
  und Volume-Mounts fuer R-Projekte.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: intermediate
  language: Docker
  tags: docker-compose, orchestration, development, volumes
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# Docker Compose einrichten

Docker Compose fuer R-Entwicklungs- und Deployment-Umgebungen konfigurieren.

## Wann verwenden

- Betrieb von R neben anderen Diensten (Datenbanken, APIs)
- Einrichten einer reproduzierbaren Entwicklungsumgebung
- Orchestrieren eines R-basierten MCP-Server-Containers
- Verwalten von Umgebungsvariablen und Volume-Mounts

## Eingaben

- **Erforderlich**: Dockerfile fuer den R-Dienst
- **Erforderlich**: Projektverzeichnis zum Einhaengen
- **Optional**: Zusaetzliche Dienste (Datenbank, Cache, Webserver)
- **Optional**: Konfiguration von Umgebungsvariablen

## Vorgehensweise

### Schritt 1: docker-compose.yml erstellen

```yaml
version: '3.8'

services:
  r-dev:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: r-dev
    image: r-dev:latest

    volumes:
      - .:/workspace
      - renv-cache:/workspace/renv/cache

    stdin_open: true
    tty: true

    environment:
      - TERM=xterm-256color
      - R_LIBS_USER=/workspace/renv/library
      - RENV_PATHS_CACHE=/workspace/renv/cache

    command: R

    restart: unless-stopped

volumes:
  renv-cache:
    driver: local
```

**Erwartet:** Eine `docker-compose.yml`-Datei existiert mit definiertem R-Dienst, einschliesslich Volume-Mounts fuer das Projektverzeichnis und den renv-Cache sowie Umgebungsvariablen fuer R-Bibliothekspfade.

**Bei Fehler:** Bei ungueltigem YAML mit `docker compose config` validieren. Sicherstellen, dass die Einrueckung Leerzeichen (keine Tabs) verwendet und alle Zeichenkettenwerte mit Sonderzeichen in Anfuehrungszeichen stehen.

### Schritt 2: Zusaetzliche Dienste hinzufuegen (bei Bedarf)

```yaml
services:
  r-dev:
    # ... wie oben
    depends_on:
      - postgres
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432

  postgres:
    image: postgres:16
    container_name: r-postgres
    environment:
      POSTGRES_DB: analysis
      POSTGRES_USER: ruser
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  renv-cache:
  pgdata:
```

**Erwartet:** Der zusaetzliche Dienst (z.B. PostgreSQL) ist mit eigenem Volume, Umgebungsvariablen und Port-Mapping definiert. Der R-Dienst hat `depends_on` mit Verweis auf den neuen Dienst.

**Bei Fehler:** Wenn der Datenbankdienst nicht startet, `docker compose logs postgres` auf Initialisierungsfehler pruefen. Sicherstellen, dass Umgebungsvariablen wie `POSTGRES_PASSWORD_FILE` auf gueltige Secrets verweisen oder fuer die Entwicklung auf `POSTGRES_PASSWORD` umstellen.

### Schritt 3: Netzwerk konfigurieren

Fuer Dienste, die Localhost-Zugriff benoetigen (z.B. MCP-Server):

```yaml
services:
  r-dev:
    network_mode: "host"
```

Fuer isoliertes Netzwerk:

```yaml
services:
  r-dev:
    networks:
      - app-network
    ports:
      - "3000:3000"

networks:
  app-network:
    driver: bridge
```

**Erwartet:** Netzwerk ist entsprechend konfiguriert: `host`-Modus fuer Dienste, die Localhost-Zugriff benoetigen (MCP-Server), oder Bridge-Netzwerk mit expliziten Port-Mappings fuer isolierte Dienste.

**Bei Fehler:** Wenn Dienste nicht kommunizieren koennen, sicherstellen, dass sie sich im selben Netzwerk befinden. Bei Bridge-Netzwerk Dienstnamen als Hostnamen verwenden (z.B. `postgres` statt `localhost`). Bei Host-Modus `localhost` verwenden und sicherstellen, dass Ports nicht kollidieren.

### Schritt 4: Umgebungsvariablen verwalten

`.env`-Datei erstellen (git-ignoriert):

```
R_VERSION=4.5.0
GITHUB_PAT=your_token_here
```

In Compose referenzieren:

```yaml
services:
  r-dev:
    build:
      args:
        R_VERSION: ${R_VERSION}
    env_file:
      - .env
```

**Erwartet:** Eine `.env`-Datei existiert (git-ignoriert) mit projektspezifischen Variablen, und `docker-compose.yml` referenziert sie ueber `env_file` oder Variableninterpolation (`${VAR}`).

**Bei Fehler:** Wenn Variablen nicht aufgeloest werden, sicherstellen, dass die `.env`-Datei im selben Verzeichnis wie `docker-compose.yml` liegt. `docker compose config` ausfuehren, um die aufgeloeste Konfiguration mit allen erweiterten Variablen zu sehen.

### Schritt 5: Bauen und Starten

```bash
# Images bauen
docker compose build

# Dienste starten
docker compose up -d

# An R-Sitzung anhaengen
docker compose exec r-dev R

# Logs anzeigen
docker compose logs -f r-dev

# Dienste stoppen
docker compose down
```

**Erwartet:** Alle Dienste starten. R-Sitzung ist erreichbar.

**Bei Fehler:** `docker compose logs` auf Startfehler pruefen. Haeufig: Port-Konflikte, fehlende Umgebungsvariablen.

### Schritt 6: Override fuer Entwicklung erstellen

`docker-compose.override.yml` fuer lokale Entwicklungseinstellungen erstellen:

```yaml
services:
  r-dev:
    volumes:
      - /path/to/local/packages:/extra-packages
    environment:
      - DEBUG=true
```

Dies wird automatisch mit `docker-compose.yml` zusammengefuehrt.

**Erwartet:** Eine `docker-compose.override.yml`-Datei existiert mit entwicklungsspezifischen Einstellungen (zusaetzliche Volumes, Debug-Flags), die automatisch beim Ausfuehren von `docker compose up` angewendet werden.

**Bei Fehler:** Wenn Overrides nicht wirksam werden, sicherstellen, dass der Dateiname exakt `docker-compose.override.yml` lautet. `docker compose config` ausfuehren, um die Zusammenfuehrung zu bestaetigen. Fuer explizite Override-Dateien `docker compose -f docker-compose.yml -f custom-override.yml up` verwenden.

## Validierung

- [ ] `docker compose build` wird fehlerfrei abgeschlossen
- [ ] `docker compose up` startet alle Dienste
- [ ] Volume-Mounts teilen Dateien korrekt zwischen Host und Container
- [ ] Umgebungsvariablen sind innerhalb der Container verfuegbar
- [ ] Dienste koennen miteinander kommunizieren
- [ ] `docker compose down` stoppt alles sauber

## Haeufige Fehler

- **Volume-Mount-Berechtigungen**: Linux-Container koennen Dateien als Root erstellen. `user:`-Direktive verwenden oder Berechtigungen korrigieren.
- **Port-Konflikte**: Pruefen, ob Dienste bereits dieselben Ports auf dem Host verwenden.
- **Docker Desktop vs CLI**: `docker compose` (v2) vs `docker-compose` (v1). V2 verwenden.
- **WSL-Pfad-Mounts**: `/mnt/c/...`-Pfade verwenden, wenn Windows-Verzeichnisse aus WSL eingehaengt werden.
- **Benannte Volumes vs Bind-Mounts**: Benannte Volumes bleiben ueber Rebuilds erhalten; Bind-Mounts spiegeln Host-Aenderungen sofort wider.

## Verwandte Skills

- `create-r-dockerfile` - Das Dockerfile erstellen, das Compose referenziert
- `containerize-mcp-server` - Compose-Konfiguration fuer MCP-Server
- `optimize-docker-build-cache` - Compose-Builds beschleunigen
