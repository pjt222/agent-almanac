---
name: configure-reverse-proxy
description: >
  Konfiguriere Reverse-Proxy-Muster mit verschiedenen Tools einschliesslich Nginx,
  Traefik und ShinyProxy. Umfasst WebSocket-Proxying, pfadbasiertes und hostbasiertes
  Routing, SSL-Terminierung und Docker-Label-Auto-Discovery. Verwende diesen Skill
  beim Routing mehrerer Dienste hinter einem einzigen Einstiegspunkt, beim Proxying
  von WebSocket-Verbindungen (Shiny, Socket.IO), bei Auto-Discovery von Docker-Diensten
  mit Traefik-Labels oder beim Hinzufuegen von SSL-Terminierung zu Diensten, die TLS
  nicht nativ unterstuetzen.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: intermediate
  language: multi
  tags: reverse-proxy, traefik, nginx, websocket, routing, shinyproxy, ssl
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# Reverse Proxy konfigurieren

Reverse-Proxy-Muster fuer das Routing von Traffic zu Backend-Diensten mit Nginx, Traefik oder ShinyProxy einrichten.

## Wann verwenden

- Routing mehrerer Dienste hinter einem einzigen Einstiegspunkt
- Proxying von WebSocket-Verbindungen (Shiny, Socket.IO, Live Reload)
- Auto-Discovery von Docker-Diensten mit Traefik-Labels
- Pfadbasiertes oder hostbasiertes Routing zu verschiedenen Backends
- SSL-Terminierung fuer Dienste hinzufuegen, die TLS nicht unterstuetzen

## Eingaben

- **Erforderlich**: Backend-Dienste zum Proxying (Host:Port)
- **Erforderlich**: Routing-Strategie (pfadbasiert, hostbasiert oder beides)
- **Optional**: Proxy-Tool-Praeferenz (Nginx, Traefik)
- **Optional**: Domainname(n) fuer hostbasiertes Routing
- **Optional**: WebSocket-Endpunkte zum Proxying

## Vorgehensweise

### Schritt 1: Proxy-Tool waehlen

| Funktion | Nginx | Traefik |
|----------|-------|---------|
| Konfiguration | Statische Dateien | Docker-Labels / dynamisch |
| Auto-Discovery | Nein (manuell) | Ja (Docker-Provider) |
| Let's Encrypt | Ueber certbot | Eingebautes ACME |
| Dashboard | Nein (Drittanbieter) | Eingebaut |
| WebSocket | Manuelle Konfiguration | Automatisch |
| Geeignet fuer | Statische Konfiguration, hoher Traffic | Dynamische Docker-Umgebungen |

### Schritt 2: Nginx -- Pfadbasiertes Routing

```nginx
server {
    listen 80;

    location /api/ {
        proxy_pass http://api:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /app/ {
        proxy_pass http://webapp:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
}
```

**Hinweis:** Ein abschliessender `/` bei `proxy_pass` entfernt das Location-Praefix. `proxy_pass http://api:8000/;` mit `location /api/` leitet `/api/users` als `/users` weiter.

### Schritt 3: Nginx -- Hostbasiertes Routing

```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://api:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    server_name app.example.com;

    location / {
        proxy_pass http://webapp:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Schritt 4: Nginx -- WebSocket-Proxying

WebSockets erfordern Upgrade-Header. Wesentlich fuer Shiny, Socket.IO und Live Reload:

```nginx
location /ws/ {
    proxy_pass http://app:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_read_timeout 86400;
}
```

Speziell fuer Shiny-Apps:

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    location / {
        proxy_pass http://shiny:3838;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
        proxy_buffering off;
    }
}
```

**Erwartet:** WebSocket-Verbindungen werden aufgebaut und bestehen fort.

**Bei Fehler:** Pruefen, ob `proxy_http_version 1.1` gesetzt ist. `Upgrade`- und `Connection`-Header ueberpruefen.

### Schritt 5: Traefik -- Docker-Label-Auto-Discovery

`docker-compose.yml`:

```yaml
services:
  traefik:
    image: traefik:v3.2
    command:
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.email=admin@example.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - letsencrypt:/letsencrypt

  api:
    image: myapi:latest
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=Host(`api.example.com`)"
      - "traefik.http.routers.api.entrypoints=websecure"
      - "traefik.http.routers.api.tls.certresolver=letsencrypt"
      - "traefik.http.services.api.loadbalancer.server.port=8000"

  webapp:
    image: myapp:latest
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.webapp.rule=Host(`app.example.com`)"
      - "traefik.http.routers.webapp.entrypoints=websecure"
      - "traefik.http.routers.webapp.tls.certresolver=letsencrypt"
      - "traefik.http.services.webapp.loadbalancer.server.port=3000"

volumes:
  letsencrypt:
```

**Erwartet:** Traefik entdeckt Dienste automatisch ueber Labels und stellt SSL-Zertifikate bereit.

### Schritt 6: Traefik -- Pfadbasiertes Routing mit Labels

```yaml
services:
  api:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=Host(`example.com`) && PathPrefix(`/api`)"
      - "traefik.http.routers.api.middlewares=strip-api"
      - "traefik.http.middlewares.strip-api.stripprefix.prefixes=/api"
      - "traefik.http.services.api.loadbalancer.server.port=8000"
```

### Schritt 7: Traefik -- Rate Limiting und Header

```yaml
labels:
  - "traefik.http.middlewares.ratelimit.ratelimit.average=100"
  - "traefik.http.middlewares.ratelimit.ratelimit.burst=50"
  - "traefik.http.middlewares.security.headers.stsSeconds=63072000"
  - "traefik.http.middlewares.security.headers.contentTypeNosniff=true"
  - "traefik.http.middlewares.security.headers.frameDeny=true"
  - "traefik.http.routers.app.middlewares=ratelimit,security"
```

### Schritt 8: Proxy-Konfiguration ueberpruefen

```bash
# Nginx: Konfiguration testen
docker compose exec nginx nginx -t

# Routing pruefen
curl -H "Host: api.example.com" http://localhost/health

# WebSocket pruefen (benoetigt wscat: npm install -g wscat)
wscat -c ws://localhost/ws/

# Traefik-Dashboard (falls aktiviert)
# http://localhost:8080/dashboard/
```

**Erwartet:** Anfragen werden an die richtigen Backends geroutet. WebSocket-Upgrades sind erfolgreich.

## Validierung

- [ ] HTTP-Anfragen werden basierend auf Pfad oder Host an das richtige Backend geroutet
- [ ] WebSocket-Verbindungen werden aufgebaut und aufrechterhalten
- [ ] SSL-Terminierung funktioniert (falls konfiguriert)
- [ ] Backend-Dienste erhalten korrekte `Host`-, `X-Real-IP`-, `X-Forwarded-For`-Header
- [ ] Traefik entdeckt neue Dienste automatisch ueber Labels (bei Verwendung von Traefik)
- [ ] Konfiguration uebersteht `docker compose restart`

## Haeufige Fehler

- **Abschliessender Schraegstrich stimmt nicht ueberein**: `proxy_pass http://app/` vs `http://app` verhaelt sich bei Pfad-Stripping in Nginx unterschiedlich.
- **WebSocket-Timeout**: Standard `proxy_read_timeout` ist 60s. Langlebige WebSocket-Verbindungen benoetigen `86400` (24h).
- **Docker-Socket-Sicherheit**: Das Mounten von `/var/run/docker.sock` in Traefik gibt vollen Docker-Zugriff. `ro`-Mount verwenden und Socket-Proxy in Betracht ziehen.
- **DNS-Aufloesung**: Nginx loest Upstreams beim Start auf. `resolver 127.0.0.11` fuer Dockers internen DNS bei dynamischen Diensten verwenden.
- **Fehlende `proxy_buffering off`**: Shiny- und SSE-Endpunkte benoetigen `proxy_buffering off` fuer Echtzeit-Streaming.

## Verwandte Skills

- `configure-nginx` - Detaillierte Nginx-Konfiguration mit SSL und Sicherheitsheadern
- `deploy-shinyproxy` - ShinyProxy fuer containerisiertes Shiny-App-Hosting
- `setup-compose-stack` - Compose-Stack mit Reverse Proxy
- `configure-api-gateway` - API-Gateway-Muster mit Kong und Traefik
