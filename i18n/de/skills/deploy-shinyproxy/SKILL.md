---
name: deploy-shinyproxy
description: >
  ShinyProxy für das Hosting mehrerer containerisierter Shiny-Anwendungen
  deployen. Behandelt ShinyProxy-Docker-Deployment, application.yml-
  Konfiguration, Shiny-App-Docker-Images, Authentifizierung, Container-
  Backends, Nutzungserfassung und Skalierung. Verwenden, wenn mehrere
  Shiny-Apps hinter einem einzigen Einstiegspunkt gehostet, App-spezifische
  Authentifizierung benötigt oder Shiny-Apps als isolierte Docker-Container
  deployt werden sollen.
license: MIT
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: shiny
  complexity: advanced
  language: R
  tags: shinyproxy, shiny, docker, deployment, multi-app, authentication, self-hosted
---

# ShinyProxy deployen

ShinyProxy deployen, um mehrere containerisierte Shiny-Anwendungen mit Authentifizierung und Nutzungserfassung zu hosten.

## Wann verwenden

- Mehrere Shiny-Apps hinter einem einzigen Einstiegspunkt hosten
- App-spezifische Authentifizierung und Zugriffskontrolle benötigt
- Shiny-Apps als isolierte Docker-Container deployen
- Über Single-App-Deployment skalieren (shinyapps.io oder standalone Docker)
- Nutzungsanalysen und Audit-Logging benötigt

## Eingaben

- **Erforderlich**: Eine oder mehrere Shiny-Apps zum Deployen
- **Erforderlich**: Server mit installiertem Docker
- **Optional**: Authentifizierungsanbieter (LDAP, OpenID, Social)
- **Optional**: Domain-Name und SSL-Zertifikat
- **Optional**: Container-Orchestrierung (Docker oder Kubernetes)

## Vorgehensweise

### Schritt 1: Shiny-App-Docker-Images erstellen

Jede Shiny-App benötigt ihr eigenes Docker-Image. Beispiel-`Dockerfile` für eine Shiny-App:

```dockerfile
FROM rocker/shiny:4.5.0

RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

RUN R -e "install.packages(c('shiny', 'bslib', 'DT', 'dplyr'), \
    repos='https://cloud.r-project.org/')"

COPY app/ /srv/shiny-server/app/

RUN chown -R shiny:shiny /srv/shiny-server/app

USER shiny
EXPOSE 3838
CMD ["R", "-e", "shiny::runApp('/srv/shiny-server/app', host='0.0.0.0', port=3838)"]
```

Jede App bauen und testen:

```bash
docker build -t myorg/dashboard:latest ./apps/dashboard/
docker run --rm -p 3838:3838 myorg/dashboard:latest
```

**Erwartet:** Jede Shiny-App läuft unabhängig in ihrem eigenen Container.

**Bei Fehler:** Wenn der Container nicht startet, Logs prüfen: `docker logs <container-id>`. Häufige Ursachen: fehlende R-Packages, falsche Dateipfade in COPY-Befehlen.

### Schritt 2: ShinyProxy konfigurieren

`application.yml`:

```yaml
proxy:
  title: "Shiny Applications"
  port: 8080
  container-backend: docker
  docker:
    internal-networking: true
  authentication: simple
  admin-groups: admins

  users:
    - name: admin
      password: admin_password
      groups: admins
    - name: analyst
      password: analyst_password
      groups: users

  specs:
    - id: dashboard
      display-name: "Analytics Dashboard"
      description: "Interactive data analysis dashboard"
      container-image: myorg/dashboard:latest
      container-cmd: ["R", "-e", "shiny::runApp('/srv/shiny-server/app', host='0.0.0.0', port=3838)"]
      container-network: shinyproxy-net
      port: 3838
      access-groups: [admins, users]

    - id: report-builder
      display-name: "Report Builder"
      description: "Generate custom reports"
      container-image: myorg/report-builder:latest
      container-cmd: ["R", "-e", "shiny::runApp('/srv/shiny-server/app', host='0.0.0.0', port=3838)"]
      container-network: shinyproxy-net
      port: 3838
      access-groups: [admins]

logging:
  file:
    name: /opt/shinyproxy/log/shinyproxy.log

server:
  forward-headers-strategy: native
```

**Erwartet:** `application.yml` ist gültige YAML ohne Syntaxfehler. Alle App-Spezifikationen haben korrekte Felder.

**Bei Fehler:** YAML-Syntax mit `python3 -c "import yaml; yaml.safe_load(open('application.yml'))"` validieren. Einrückung ist entscheidend in YAML.

### Schritt 3: ShinyProxy mit Docker Compose deployen

`docker-compose.yml`:

```yaml
services:
  shinyproxy:
    image: openanalytics/shinyproxy:3.1.1
    container_name: shinyproxy
    ports:
      - "8080:8080"
    volumes:
      - ./application.yml:/opt/shinyproxy/application.yml:ro
      - /var/run/docker.sock:/var/run/docker.sock
      - shinyproxy-logs:/opt/shinyproxy/log
    networks:
      - shinyproxy-net
    restart: unless-stopped

networks:
  shinyproxy-net:
    name: shinyproxy-net
    driver: bridge

volumes:
  shinyproxy-logs:
```

```bash
# Netzwerk zuerst erstellen (ShinyProxy startet Container auf diesem Netzwerk)
docker network create shinyproxy-net

# ShinyProxy starten
docker compose up -d

# Logs prüfen
docker compose logs -f shinyproxy
```

**Erwartet:** ShinyProxy startet auf Port 8080, zeigt Login-Seite und listet konfigurierte Apps auf.

**Bei Fehler:** `docker compose logs shinyproxy` prüfen. Sicherstellen, dass App-Images lokal verfügbar sind (`docker images`).

### Schritt 4: Authentifizierung konfigurieren

#### Einfach (integriert)

Wie in Schritt 2 mit `authentication: simple` und inline-Benutzern.

#### LDAP

```yaml
proxy:
  authentication: ldap
  ldap:
    url: ldap://ldap.example.com:389/dc=example,dc=com
    manager-dn: cn=admin,dc=example,dc=com
    manager-password: ldap_admin_password
    user-search-base: ou=users
    user-search-filter: (uid={0})
    group-search-base: ou=groups
    group-search-filter: (member={0})
```

#### OpenID Connect (Keycloak, Auth0 usw.)

```yaml
proxy:
  authentication: openid
  openid:
    auth-url: https://auth.example.com/realms/myrealm/protocol/openid-connect/auth
    token-url: https://auth.example.com/realms/myrealm/protocol/openid-connect/token
    jwks-url: https://auth.example.com/realms/myrealm/protocol/openid-connect/certs
    client-id: shinyproxy
    client-secret: your_client_secret
    roles-claim: realm_access.roles
```

**Erwartet:** Authentifizierung funktioniert für alle konfigurierten Nutzer/Gruppen.

**Bei Fehler:** Wenn LDAP-Verbindung fehlschlägt, Netzwerkkonnektivität prüfen: `curl ldap://ldap.example.com:389`. Für OpenID-Fehler, Redirect-URL in Identity-Provider-Konfiguration prüfen.

### Schritt 5: Reverse Proxy mit Nginx hinzufügen

Für Produktion, Nginx vor ShinyProxy schalten:

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 443 ssl;
    server_name shiny.example.com;

    ssl_certificate /etc/letsencrypt/live/shiny.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/shiny.example.com/privkey.pem;

    location / {
        proxy_pass http://shinyproxy:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 600s;
        proxy_buffering off;
    }
}
```

WebSocket-Unterstützung ist kritisch — ShinyProxy und Shiny verwenden WebSockets intensiv.

**Erwartet:** HTTPS-Zugriff funktioniert. Shiny-Reaktivität (WebSockets) funktioniert durch Nginx.

**Bei Fehler:** Wenn Shiny nicht reagiert hinter Nginx, WebSocket-Upgrade-Header prüfen: `proxy_set_header Upgrade` und `proxy_set_header Connection` müssen vorhanden sein.

### Schritt 6: Nutzungserfassung

ShinyProxy protokolliert Nutzungsereignisse in seine Log-Datei. Für strukturiertes Tracking, InfluxDB konfigurieren:

```yaml
proxy:
  usage-stats-url: http://influxdb:8086/write?db=shinyproxy
  usage-stats-username: shinyproxy
  usage-stats-password: stats_password
```

InfluxDB zum Compose-Stack hinzufügen:

```yaml
services:
  influxdb:
    image: influxdb:1.8
    environment:
      INFLUXDB_DB: shinyproxy
      INFLUXDB_ADMIN_USER: admin
      INFLUXDB_ADMIN_PASSWORD: admin_password
    volumes:
      - influxdata:/var/lib/influxdb
    networks:
      - shinyproxy-net

volumes:
  influxdata:
```

**Erwartet:** Nutzungsereignisse werden in InfluxDB gespeichert und können abgefragt werden.

**Bei Fehler:** Wenn Metriken nicht erscheinen, sicherstellen, dass InfluxDB im selben Netzwerk (`shinyproxy-net`) läuft und URL korrekt ist.

### Schritt 7: App-Ressourcenlimits

```yaml
specs:
  - id: dashboard
    container-image: myorg/dashboard:latest
    container-memory-limit: 1g
    container-cpu-limit: 1.0
    max-instances: 5
    container-env:
      R_MAX_MEM_SIZE: 768m
```

**Erwartet:** Ressourcenlimits verhindern, dass eine App anderen die Ressourcen entzieht.

**Bei Fehler:** Wenn Apps mit Out-of-Memory-Fehlern abbrechen, `container-memory-limit` erhöhen oder App-Code auf Memory-Leaks untersuchen.

### Schritt 8: Deployment verifizieren

```bash
# ShinyProxy-Gesundheit prüfen
curl -s http://localhost:8080/actuator/health

# Login testen
curl -s -c cookies.txt -d "username=admin&password=admin_password" \
  http://localhost:8080/login

# Apps via API auflisten
curl -s -b cookies.txt http://localhost:8080/api/proxyspec
```

**Erwartet:** Health-Endpoint gibt `UP` zurück. Login erfolgreich. Apps starten in isolierten Containern.

**Bei Fehler:** Wenn Health-Check fehlschlägt, vollständige Logs prüfen: `docker compose logs shinyproxy | tail -50`.

## Validierung

- [ ] ShinyProxy startet und zeigt Login-Seite
- [ ] Authentifizierung funktioniert für alle konfigurierten Nutzer
- [ ] Jede Shiny-App startet in ihrem eigenen Container
- [ ] WebSocket-Verbindungen funktionieren (Shiny-Reaktivität)
- [ ] Zugriffsgruppen beschränken App-Sichtbarkeit korrekt
- [ ] Container-Cleanup funktioniert wenn Nutzer die Verbindung trennen
- [ ] Logs erfassen Nutzungsereignisse

## Haeufige Stolperfallen

- **Docker-Socket-Berechtigungen**: ShinyProxy benötigt Docker-Socket-Zugriff zum Starten von Containern. Als Nutzer der `docker`-Gruppe ausführen oder Socket mounten.
- **Netzwerk-Mismatch**: App-Container müssen sich im selben Docker-Netzwerk wie ShinyProxy befinden (`container-network` in Spezifikationen muss übereinstimmen).
- **WebSocket-Proxy**: Nginx oder andere Proxies vor ShinyProxy müssen WebSocket-Upgrade-Header weiterleiten.
- **Image nicht gefunden**: App-Images müssen auf dem Docker-Host gepullt oder gebaut sein, bevor ShinyProxy sie verwenden kann.
- **Container-Cleanup**: Wenn ShinyProxy abstürzt, können verwaiste App-Container verbleiben. `docker ps` zum Prüfen und Bereinigen verwenden.
- **Speicherlimits**: Shiny-Apps können erheblich Speicher verbrauchen. `container-memory-limit` setzen, um zu verhindern, dass eine App anderen Ressourcen entzieht.

## Verwandte Skills

- `deploy-shiny-app` — Single-App-Deployment auf shinyapps.io, Posit Connect oder Docker
- `configure-reverse-proxy` — Reverse-Proxy-Muster einschließlich WebSocket-Proxying
- `create-dockerfile` — allgemeine Dockerfile-Erstellung für App-Images
