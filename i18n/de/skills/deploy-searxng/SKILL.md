---
name: deploy-searxng
description: >
  Deploye eine selbstgehostete SearXNG-Metasuchmaschine ueber Docker Compose.
  Umfasst settings.yml-Konfiguration, Engine-Auswahl, Ergebnis-Proxying,
  Nginx-Frontend, Persistenz und Updates. Verwende diesen Skill beim Einrichten
  einer privaten Suchmaschine ohne Tracking, beim Aggregieren von Ergebnissen
  mehrerer Anbieter, beim Betrieb einer gemeinsamen Suchinstanz fuer ein Team
  oder eine Organisation oder beim Ersetzen der Abhaengigkeit von einem einzelnen
  Suchanbieter.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: intermediate
  language: Docker
  tags: searxng, self-hosted, search-engine, privacy, docker-compose, meta-search
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# SearXNG deployen

Eine selbstgehostete SearXNG-Metasuchmaschine mit Docker Compose und Nginx deployen.

## Wann verwenden

- Einrichten einer privaten, selbstgehosteten Suchmaschine
- Aggregieren von Ergebnissen mehrerer Suchanbieter ohne Tracking
- Betrieb einer Suchinstanz fuer ein Team oder eine Organisation
- Ersetzen der Abhaengigkeit von einem einzelnen Suchanbieter

## Eingaben

- **Erforderlich**: Server oder Rechner mit installiertem Docker
- **Optional**: Domainname fuer oeffentlichen Zugang
- **Optional**: SSL-Zertifikat oder Let's-Encrypt-Einrichtung
- **Optional**: Benutzerdefinierte Engine-Praeferenzen

## Vorgehensweise

### Schritt 1: Projektstruktur erstellen

```bash
mkdir -p searxng/{config,nginx}
cd searxng
```

### Schritt 2: Docker-Compose-Datei schreiben

`docker-compose.yml`:

```yaml
services:
  searxng:
    image: searxng/searxng:latest
    container_name: searxng
    volumes:
      - ./config:/etc/searxng:rw
    environment:
      - SEARXNG_BASE_URL=https://search.example.com/
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - SETGID
      - SETUID
    restart: unless-stopped
    networks:
      - searxng

  nginx:
    image: nginx:1.27-alpine
    container_name: searxng-nginx
    ports:
      - "8080:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - searxng
    restart: unless-stopped
    networks:
      - searxng

networks:
  searxng:
    driver: bridge
```

### Schritt 3: SearXNG-Einstellungen konfigurieren

`config/settings.yml`:

```yaml
use_default_settings: true

general:
  instance_name: "My SearXNG"
  privacypolicy_url: false
  contact_url: false

search:
  safe_search: 0
  autocomplete: "google"
  default_lang: "en"

server:
  secret_key: "generate-a-random-secret-key-here"
  limiter: true
  image_proxy: true
  port: 8080
  bind_address: "0.0.0.0"

ui:
  static_use_hash: true
  default_theme: simple
  infinite_scroll: true

engines:
  - name: google
    engine: google
    shortcut: g
    disabled: false

  - name: duckduckgo
    engine: duckduckgo
    shortcut: ddg
    disabled: false

  - name: wikipedia
    engine: wikipedia
    shortcut: wp
    disabled: false

  - name: github
    engine: github
    shortcut: gh
    disabled: false

  - name: stackoverflow
    engine: stackoverflow
    shortcut: so
    disabled: false

  - name: arxiv
    engine: arxiv
    shortcut: arx
    disabled: false
```

Geheimschluessel generieren:

```bash
openssl rand -hex 32
```

### Schritt 4: Nginx-Frontend konfigurieren

`nginx/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    server {
        listen 80;

        location / {
            proxy_pass http://searxng:8080;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Connection "";
            proxy_buffering off;
        }

        location /static/ {
            proxy_pass http://searxng:8080/static/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### Schritt 5: Rate Limiting konfigurieren

`config/limiter.toml`:

```toml
[botdetection.ip_limit]
link_token = true

[botdetection.ip_lists]
block_ip = []
pass_ip = ["127.0.0.1/8", "::1/128"]
pass_searxng_org = false
```

### Schritt 6: Deployen und Ueberpruefen

```bash
# Stack starten
docker compose up -d

# Logs pruefen
docker compose logs -f searxng

# Pruefen, ob es laeuft
curl -s http://localhost:8080 | head -5

# Suche testen
curl -s "http://localhost:8080/search?q=test&format=json" | head -20
```

**Erwartet:** SearXNG antwortet auf Port 8080 ueber Nginx. Suchanfragen liefern aggregierte Ergebnisse.

**Bei Fehler:** `docker compose logs searxng` auf Konfigurationsfehler pruefen. YAML-Syntax von `settings.yml` ueberpruefen.

### Schritt 7: SSL hinzufuegen (Produktion)

Fuer oeffentliche Deployments SSL-Terminierung hinzufuegen. `docker-compose.yml` aktualisieren:

```yaml
services:
  nginx:
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx-ssl.conf:/etc/nginx/nginx.conf:ro
      - certbot-certs:/etc/letsencrypt:ro
      - certbot-webroot:/var/www/certbot:ro

  certbot:
    image: certbot/certbot
    volumes:
      - certbot-certs:/etc/letsencrypt
      - certbot-webroot:/var/www/certbot

volumes:
  certbot-certs:
  certbot-webroot:
```

Siehe den `configure-nginx`-Skill fuer die vollstaendige SSL-Nginx-Konfiguration.

### Schritt 8: Updates und Wartung

```bash
# Neuestes Image herunterladen
docker compose pull searxng

# Mit neuem Image neu starten
docker compose up -d

# Konfiguration sichern
cp -r config/ config-backup-$(date +%Y%m%d)/
```

## Validierung

- [ ] SearXNG startet ohne Fehler in den Logs
- [ ] Suchanfragen liefern Ergebnisse von konfigurierten Engines
- [ ] Image-Proxy funktioniert (Bilder werden ueber SearXNG geladen)
- [ ] Rate Limiter blockiert ueberschuessige Anfragen
- [ ] Konfiguration bleibt ueber Container-Neustarts erhalten
- [ ] Nginx proxied Anfragen korrekt

## Haeufige Fehler

- **Fehlender secret_key**: SearXNG verweigert den Start ohne `secret_key` in settings.yml.
- **Config-Berechtigungen**: SearXNG schreibt ins Konfigurationsverzeichnis. Das Volume muss `:rw` sein, nicht `:ro`.
- **Engine-Blockierungen**: Einige Engines koennen Anfragen von Server-IPs blockieren. Engines rotieren oder Image-Proxy verwenden.
- **YAML-Einrueckung**: `settings.yml` ist empfindlich gegenueber Einrueckung. Vor dem Deployen mit einem YAML-Linter validieren.
- **Base-URL-Diskrepanz**: `SEARXNG_BASE_URL` muss mit der tatsaechlichen URL uebereinstimmen, ueber die Benutzer zugreifen, einschliesslich Protokoll und abschliessendem Schraegstrich.
- **DNS-Aufloesung in Docker**: Engines, die Google/Bing verwenden, benoetigen moeglicherweise Host-Netzwerk oder ordnungsgemaesses DNS. Standard-Docker-DNS funktioniert normalerweise.

## Verwandte Skills

- `setup-compose-stack` - Allgemeine Docker-Compose-Muster, die hier verwendet werden
- `configure-nginx` - Nginx-Konfiguration fuer SSL und Sicherheitsheader
- `configure-reverse-proxy` - Erweiterte Proxy-Muster fuer das Nginx-Frontend
