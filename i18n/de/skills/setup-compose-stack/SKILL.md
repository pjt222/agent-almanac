---
name: setup-compose-stack
description: >
  Konfiguriere allgemeine Docker-Compose-Stacks fuer gaengige Anwendungsmuster.
  Umfasst Web-App + Datenbank + Cache + Worker-Dienste, benannte Volumes,
  Netzwerke, Health-Checks, depends_on, Umgebungsverwaltung und Profile. Verwende
  diesen Skill beim Betrieb einer Web-App mit Datenbank oder Cache, beim Einrichten
  einer Entwicklungsumgebung mit mehreren Diensten, beim Orchestrieren von
  Hintergrund-Workern neben einer API oder beim Erstellen reproduzierbarer
  Multi-Service-Umgebungen teamuebergreifend.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: intermediate
  language: Docker
  tags: docker-compose, orchestration, postgres, redis, multi-service, health-checks
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# Compose-Stack einrichten

Docker Compose fuer Multi-Service-Anwendungsstacks mit Datenbanken, Caches und Workern konfigurieren.

## Wann verwenden

- Betrieb einer Web-App mit Datenbank und/oder Cache
- Einrichten einer Entwicklungsumgebung mit mehreren Diensten
- Orchestrieren von Hintergrund-Workern neben einer API
- Reproduzierbare Multi-Service-Umgebungen teamuebergreifend benoetigt

## Eingaben

- **Erforderlich**: Anwendungsdienst (Sprache, Port, Einstiegspunkt)
- **Erforderlich**: Benoetigte unterstuetzende Dienste (Datenbank, Cache, Queue usw.)
- **Optional**: Entwicklungs- vs. Produktionskonfiguration
- **Optional**: Vorhandene Dockerfiles fuer benutzerdefinierte Dienste

## Vorgehensweise

### Schritt 1: Kern-Stack definieren

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://appuser:apppass@postgres:5432/appdb
      REDIS_URL: redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped

  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: appuser
      POSTGRES_PASSWORD: apppass
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U appuser -d appdb"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data

volumes:
  pgdata:
  redisdata:
```

**Erwartet:** `docker compose up` startet alle Dienste, wobei die App auf eine gesunde Datenbank wartet.

### Schritt 2: Health-Checks hinzufuegen

Health-Checks ermoeglichen `depends_on` mit `condition: service_healthy`:

```yaml
services:
  postgres:
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U appuser -d appdb"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  app:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 10s
```

### Schritt 3: Netzwerke konfigurieren

```yaml
services:
  app:
    networks:
      - frontend
      - backend

  postgres:
    networks:
      - backend

  nginx:
    networks:
      - frontend
    ports:
      - "80:80"

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
```

Dies isoliert die Datenbank von direktem externen Zugriff, waehrend die App beide Netzwerke verbindet.

### Schritt 4: Umgebungsvariablen verwalten

`.env`-Datei erstellen (git-ignoriert):

```
POSTGRES_PASSWORD=secure_password_here
APP_SECRET=your_secret_key
```

In Compose referenzieren:

```yaml
services:
  postgres:
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  app:
    env_file:
      - .env
```

`.env.example` erstellen (in Git eingecheckt):

```
POSTGRES_PASSWORD=changeme
APP_SECRET=changeme
```

### Schritt 5: Worker-Dienste hinzufuegen

```yaml
services:
  worker:
    build:
      context: .
      dockerfile: Dockerfile
    command: ["node", "src/worker.js"]
    environment:
      DATABASE_URL: postgres://appuser:apppass@postgres:5432/appdb
      REDIS_URL: redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped
    deploy:
      replicas: 2
```

### Schritt 6: Profile fuer optionale Dienste verwenden

```yaml
services:
  app:
    # startet immer
    build: .

  mailhog:
    image: mailhog/mailhog
    ports:
      - "8025:8025"
    profiles:
      - dev

  adminer:
    image: adminer
    ports:
      - "8080:8080"
    profiles:
      - dev
```

```bash
# Nur Kerndienste starten
docker compose up

# Mit Entwicklungstools starten
docker compose --profile dev up
```

### Schritt 7: Override fuer Entwicklung erstellen

`docker-compose.override.yml` wird automatisch zusammengefuehrt:

```yaml
services:
  app:
    build:
      target: dev
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      NODE_ENV: development
      DEBUG: "app:*"
    command: ["npm", "run", "dev"]
```

### Schritt 8: Bauen und Starten

```bash
# Alle Images bauen
docker compose build

# Im Hintergrund starten
docker compose up -d

# Logs anzeigen
docker compose logs -f app

# Dienststatus pruefen
docker compose ps

# Stoppen und entfernen
docker compose down

# Stoppen und Volumes entfernen (vollstaendiger Reset)
docker compose down -v
```

**Erwartet:** Alle Dienste starten, Health-Checks bestehen, App verbindet sich mit Datenbank und Cache.

**Bei Fehler:** `docker compose logs <service>` pruefen. Haeufige Probleme: Port-Konflikte, fehlende Umgebungsvariablen, Health-Check-Timeouts.

## Validierung

- [ ] `docker compose up` startet alle Dienste fehlerfrei
- [ ] Health-Checks bestehen fuer Datenbank und Cache
- [ ] Anwendung verbindet sich mit allen abhaengigen Diensten
- [ ] Benannte Volumes persistieren Daten ueber Neustarts hinweg
- [ ] `.env` ist git-ignoriert; `.env.example` ist eingecheckt
- [ ] `docker compose down` stoppt alles sauber
- [ ] Profile trennen Entwicklungstools von Produktionsdiensten

## Haeufige Fehler

- **Keine Health-Checks**: `depends_on` ohne `condition: service_healthy` wartet nur auf Container-Start, nicht auf Bereitschaft.
- **Hartcodierte Passwoerter in Compose**: `.env`-Dateien oder Docker Secrets verwenden. Niemals Passwoerter committen.
- **Volume-Mount ueberschreibt**: Das Mounten von `.:/app` ueberschreibt im Image gebaute `node_modules`. Ein anonymes Volume verwenden: `/app/node_modules`.
- **Port-Konflikte**: `docker compose ps` und `lsof -i :<port>` auf Konflikte pruefen.
- **`version:`-Schluessel**: Compose V2 ignoriert den `version:`-Schluessel. Fuer moderne Setups weglassen.
- **WSL-Pfad-Probleme**: `/mnt/c/...`-Pfade verwenden, wenn Windows-Verzeichnisse aus WSL eingehaengt werden.

## Verwandte Skills

- `setup-docker-compose` - R-spezifische Docker-Compose-Konfigurationen
- `create-dockerfile` - Das Dockerfile schreiben, das Compose referenziert
- `create-multistage-dockerfile` - Optimierte Images fuer den Stack bauen
- `configure-nginx` - Nginx-Reverse-Proxy zum Stack hinzufuegen
