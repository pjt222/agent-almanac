---
name: configure-nginx
description: >
  Konfiguriere Nginx als Webserver und Reverse Proxy. Umfasst statische
  Dateiauslieferung, Reverse Proxy zu Upstream-Diensten, SSL/TLS-Terminierung
  mit Let's Encrypt, Location-Bloecke, Lastverteilung, Rate Limiting und
  Sicherheitsheader. Verwende diesen Skill beim Ausliefern statischer Dateien
  in Produktion, beim Reverse-Proxying zu Backend-Diensten (Node.js, Python,
  R/Shiny), bei SSL/TLS-Terminierung, bei Lastverteilung ueber Instanzen
  oder beim Hinzufuegen von Rate Limiting und Sicherheitsheadern zur Haertung
  eines Endpunkts.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: containerization
  complexity: intermediate
  language: multi
  tags: nginx, reverse-proxy, ssl, tls, lets-encrypt, web-server, security-headers
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# Nginx konfigurieren

Nginx als Webserver und Reverse Proxy mit SSL-Terminierung und Sicherheitshaertung einrichten.

## Wann verwenden

- Statische Dateien (HTML, CSS, JS) in Produktion ausliefern
- Reverse Proxying zu Backend-Diensten (Node.js, Python, Go, R/Shiny)
- SSL/TLS mit Let's-Encrypt-Zertifikaten terminieren
- Lastverteilung ueber mehrere Backend-Instanzen
- Rate Limiting und Sicherheitsheader hinzufuegen

## Eingaben

- **Erforderlich**: Deployment-Ziel (Docker-Container oder Bare Metal)
- **Erforderlich**: Backend-Dienst(e) zum Proxying (Host:Port)
- **Optional**: Domainname fuer SSL
- **Optional**: Verzeichnis fuer statische Dateien

## Vorgehensweise

### Schritt 1: Einfacher Reverse Proxy

`nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    server {
        listen 80;
        server_name example.com;

        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

Docker-Compose-Dienst:

```yaml
services:
  nginx:
    image: nginx:1.27-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - app
```

**Erwartet:** Anfragen an Port 80 werden an den App-Dienst weitergeleitet.

### Schritt 2: Statische Dateiauslieferung

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 6M;
        add_header Cache-Control "public";
    }
}
```

### Schritt 3: SSL/TLS mit Let's Encrypt

Mit certbot und der Webroot-Methode:

```nginx
server {
    listen 80;
    server_name example.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Docker Compose mit certbot:

```yaml
services:
  nginx:
    image: nginx:1.27-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - certbot-webroot:/var/www/certbot:ro
      - certbot-certs:/etc/letsencrypt:ro

  certbot:
    image: certbot/certbot
    volumes:
      - certbot-webroot:/var/www/certbot
      - certbot-certs:/etc/letsencrypt

volumes:
  certbot-webroot:
  certbot-certs:
```

Erstes Zertifikat:

```bash
docker compose run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d example.com --email admin@example.com --agree-tos
```

**Erwartet:** HTTPS funktioniert mit gueltigem Let's-Encrypt-Zertifikat.

**Bei Fehler:** DNS-Eintrag pruefen, ob er auf den Server zeigt. Sicherstellen, dass Port 80 fuer ACME-Challenges offen ist.

### Schritt 4: Sicherheitsheader

```nginx
server {
    # ... SSL-Konfiguration oben ...

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';" always;

    # Nginx-Version verbergen
    server_tokens off;
}
```

### Schritt 5: Rate Limiting

```nginx
http {
    # Rate-Limit-Zonen definieren
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

    server {
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://app;
        }

        location /login {
            limit_req zone=login burst=5;
            proxy_pass http://app;
        }
    }
}
```

### Schritt 6: Lastverteilung

```nginx
upstream app {
    least_conn;
    server app1:3000;
    server app2:3000;
    server app3:3000 backup;
}
```

| Methode | Direktive | Verhalten |
|---------|-----------|-----------|
| Round Robin | (Standard) | Gleichmaessige Verteilung |
| Wenigste Verbindungen | `least_conn` | Leitet an am wenigsten ausgelasteten weiter |
| IP-Hash | `ip_hash` | Sticky Sessions |
| Gewichtet | `server app:3000 weight=3` | Proportional |

### Schritt 7: Konfiguration testen

```bash
# Konfigurationssyntax testen
docker compose exec nginx nginx -t

# Ohne Ausfallzeit neu laden
docker compose exec nginx nginx -s reload

# Antwortheader pruefen
curl -I https://example.com
```

**Erwartet:** `nginx -t` meldet Syntax OK. Header enthalten Sicherheitsheader.

## Validierung

- [ ] `nginx -t` meldet gueltige Konfiguration
- [ ] HTTP leitet auf HTTPS um (falls SSL aktiviert)
- [ ] Backend-Dienst ist ueber den Proxy erreichbar
- [ ] Sicherheitsheader in der Antwort vorhanden
- [ ] Rate Limiting greift bei ueberschuessigen Anfragen
- [ ] SSL-Labs-Test ergibt A+-Bewertung (falls oeffentlich)

## Haeufige Fehler

- **Fehlender `proxy_set_header Host`**: Backend erhaelt falschen Host-Header, was virtuelle Hosts und Weiterleitungen bricht.
- **`location`-Reihenfolge ist wichtig**: Nginx verwendet den spezifischsten Treffer. Exakt (`=`) > Praefix (`^~`) > Regex (`~`) > allgemeiner Praefix.
- **SSL-Zertifikatserneuerung**: Cron oder Timer fuer `certbot renew` einrichten und Nginx neu laden.
- **Grosse Request-Bodies**: Standard `client_max_body_size` ist 1MB. Fuer Datei-Uploads erhoehen: `client_max_body_size 50m;`.
- **WebSocket-Proxying**: Erfordert zusaetzliche Header. Siehe `configure-reverse-proxy` fuer das Muster.

## Verwandte Skills

- `configure-reverse-proxy` - Multi-Tool-Proxy-Muster einschliesslich WebSocket und Traefik
- `setup-compose-stack` - Compose-Stack mit Nginx
- `deploy-searxng` - Verwendet Nginx als Frontend fuer SearXNG
- `configure-ingress-networking` - Kubernetes Ingress (NGINX Ingress Controller)
