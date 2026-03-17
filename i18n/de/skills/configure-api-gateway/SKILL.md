---
name: configure-api-gateway
description: >
  API-Gateway (Kong oder Traefik) deployen und konfigurieren fuer
  API-Traffic-Management, Authentifizierung, Rate-Limiting, Anfrage-/Antwort-
  Transformation und Routing. Behandelt Plugin-Konfiguration, Upstream-Services,
  Consumer-Management und Integration mit bestehender Infrastruktur. Einsatz
  wenn mehrere Backend-Services einen einheitlichen API-Endpunkt benoetigen,
  zentrale Authentifizierung oder Rate-Limiting erforderlich ist, API-
  Versionierung implementiert werden soll oder detaillierte Analysen und
  Load-Balancing fuer Microservices benoetigt werden.
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: devops
  complexity: intermediate
  language: multi
  tags: api-gateway, kong, traefik, rate-limiting, authentication, routing, middleware
---

# API-Gateway konfigurieren

API-Gateway fuer zentralisiertes API-Traffic-Management und Richtliniendurchsetzung deployen und konfigurieren.

## Wann verwenden

- Mehrere Backend-Services benoetigen einheitlichen API-Endpunkt mit konsistenten Richtlinien
- Zentrale Authentifizierung/Autorisierung fuer API-Zugriff erforderlich
- Rate-Limiting und Kontingent-Management ueber APIs hinweg benoetigt
- Anfragen/Antworten transformieren ohne Backend-Services zu aendern
- API-Versionierung und Deprecation-Strategien implementieren
- Detaillierte API-Analysen und Monitoring benoetigt
- Service-Discovery und Load-Balancing fuer Microservices erforderlich

## Eingaben

- **Erforderlich**: Kubernetes-Cluster oder Docker-Umgebung
- **Erforderlich**: Auswahl des API-Gateways (Kong oder Traefik)
- **Erforderlich**: Backend-Service-Endpunkte als Proxy-Ziele
- **Optional**: Authentifizierungs-Provider (OAuth2, OIDC, API-Keys)
- **Optional**: Rate-Limiting-Anforderungen (Anfragen pro Minute/Stunde)
- **Optional**: Benutzerdefinierte Middleware- oder Plugin-Konfigurationen
- **Optional**: TLS-Zertifikate fuer HTTPS-Endpunkte

## Vorgehensweise

> Siehe [Erweiterte Beispiele](references/EXAMPLES.md) fuer vollstaendige Konfigurationsdateien und Vorlagen.

### Schritt 1: API-Gateway installieren

API-Gateway mit Datenbank (Kong) oder dateibasierter Konfiguration (Traefik) deployen.

**Fuer Kong mit PostgreSQL:**
```yaml
# kong-deployment.yaml (excerpt - see EXAMPLES.md for complete file)
apiVersion: v1
kind: Namespace
metadata:
  name: kong
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kong
  namespace: kong
spec:
  replicas: 2
  # ... (PostgreSQL, migrations, services - see EXAMPLES.md)
```

**Fuer Traefik:**
```yaml
# traefik-deployment.yaml (excerpt - see EXAMPLES.md for complete file)
apiVersion: v1
kind: Namespace
metadata:
  name: traefik
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: traefik
  namespace: traefik
spec:
  replicas: 2
  # ... (RBAC, ConfigMap, services - see EXAMPLES.md)
```

Vollstaendige Deployment-Manifeste unter [EXAMPLES.md](references/EXAMPLES.md#step-1-install-api-gateway) verfuegbar.

Deployen:
```bash
kubectl apply -f kong-deployment.yaml  # OR traefik-deployment.yaml
kubectl wait --for=condition=ready pod -l app=kong -n kong --timeout=300s
kubectl get svc -n kong kong-proxy  # Get load balancer IP
```

**Erwartet:** Gateway-Pods laufen mit 2 Replikas. LoadBalancer-Service hat externe IP zugewiesen. Admin-API erreichbar (Kong: Port 8001, Traefik: Dashboard-Port 8080). Health-Checks bestehen.

**Bei Fehler:**
- Pod-Logs pruefen: `kubectl logs -n kong -l app=kong`
- Datenbankverbindung pruefen (Kong): `kubectl logs -n kong kong-migrations-<hash>`
- Service-Account-Berechtigungen pruefen (Traefik): `kubectl get clusterrolebinding traefik -o yaml`
- Pruefen ob Ports bereits belegt: `kubectl get svc --all-namespaces | grep 8000`

### Schritt 2: Backend-Services und Routen konfigurieren

Upstream-Services definieren und Routen zur API-Exponierung erstellen.

**Fuer Kong (mit decK fuer deklarative Konfiguration):**
```bash
# Install decK CLI
curl -sL https://github.com/Kong/deck/releases/download/v1.28.0/deck_1.28.0_linux_amd64.tar.gz | tar -xz
sudo mv deck /usr/local/bin/

# Create kong.yaml with services, routes, upstreams
# (see EXAMPLES.md for complete configuration)
deck sync --kong-addr http://localhost:8001 -s kong.yaml
curl -i http://localhost:8001/routes  # Verify routes
```

**Fuer Traefik (mit IngressRoute CRD):**
```yaml
# traefik-routes.yaml (excerpt)
apiVersion: traefik.io/v1alpha1
kind: IngressRoute
metadata:
  name: user-api-route
spec:
  entryPoints: [websecure]
  routes:
  - match: Host(`api.example.com`) && PathPrefix(`/api/users`)
    # ... (see EXAMPLES.md for full configuration)
```

Routen anwenden:
```bash
kubectl apply -f traefik-routes.yaml
curl -H "Host: api.example.com" https://GATEWAY_IP/api/users
```

Vollstaendige Routing-Konfigurationen unter [EXAMPLES.md](references/EXAMPLES.md#step-2-configure-backend-services-and-routes) verfuegbar.

**Erwartet:** Routen leiten Traffic korrekt an Backend-Services weiter. Gewichtetes Routing verteilt Traffic gemaess Konfiguration. Health-Checks ueberwachen Backend-Service-Gesundheit.

**Bei Fehler:**
- Pruefen, ob Backend-Services laufen: `kubectl get svc -n default`
- DNS-Aufloesung pruefen: `kubectl run test --rm -it --image=busybox -- nslookup user-service.default.svc.cluster.local`
- Gateway-Logs pruefen: `kubectl logs -n kong -l app=kong --tail=50`
- Konfiguration validieren: `deck validate -s kong.yaml`

### Schritt 3: Authentifizierung und Autorisierung implementieren

Authentifizierungs-Plugins/-Middleware fuer API-Sicherheit konfigurieren.

**Fuer Kong (API-Key- und JWT-Authentifizierung):**
```yaml
# kong-auth-config.yaml (excerpt)
consumers:
- username: mobile-app
  custom_id: app-001

keyauth_credentials:
- consumer: mobile-app
  key: mobile-secret-key-123

plugins:
- name: key-auth
  service: user-api
  # ... (see EXAMPLES.md for full configuration)
```

```bash
deck sync --kong-addr http://localhost:8001 -s kong-auth-config.yaml
curl -i -H "apikey: mobile-secret-key-123" http://GATEWAY_IP/api/users
```

**Fuer Traefik (BasicAuth und ForwardAuth Middleware):**
```yaml
# traefik-auth-middleware.yaml (excerpt)
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: basic-auth-middleware
spec:
  basicAuth:
    secret: basic-auth
    removeHeader: true
# ... (see EXAMPLES.md for OAuth2, rate limiting)
```

```bash
kubectl apply -f traefik-auth-middleware.yaml
curl -u user1:password https://GATEWAY_IP/api/protected
```

Vollstaendige Authentifizierungs-Konfigurationen unter [EXAMPLES.md](references/EXAMPLES.md#step-3-implement-authentication-and-authorization) verfuegbar.

**Erwartet:** Nicht authentifizierte Anfragen geben 401 zurueck. Gueltige Credentials erlauben Zugriff. Rate-Limiting gibt 429 nach Ueberschreiten des Schwellenwerts zurueck. JWT-Tokens werden korrekt validiert. ACL setzt Gruppenberechtigungen durch.

**Bei Fehler:**
- Consumer-Erstellung pruefen: `curl http://localhost:8001/consumers`
- Plugin aktiviert pruefen: `curl http://localhost:8001/plugins | jq .`
- Mit Verbose testen: `curl -v` fuer Antwort-Header pruefen
- JWT validieren: jwt.io zum Dekodieren des Tokens verwenden

### Schritt 4: Anfrage-/Antwort-Transformation konfigurieren

Middleware zum Transformieren von Anfragen und Antworten hinzufuegen.

**Fuer Kong:**
```yaml
# kong-transformations.yaml (excerpt)
plugins:
- name: request-transformer
  service: user-api
  config:
    add:
      headers: [X-Gateway-Version:1.0, X-Request-ID:$(uuid)]
    remove:
      headers: [X-Internal-Token]
- name: correlation-id
  # ... (see EXAMPLES.md for full configuration)
```

```bash
deck sync --kong-addr http://localhost:8001 -s kong-transformations.yaml
```

**Fuer Traefik:**
```yaml
# traefik-transformations.yaml (excerpt)
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: add-headers
spec:
  headers:
    customRequestHeaders:
      X-Gateway-Version: "1.0"
    # ... (see EXAMPLES.md for circuit breaker, retry, chain)
```

```bash
kubectl apply -f traefik-transformations.yaml
curl -v https://GATEWAY_IP/api/users | grep X-Gateway
```

Vollstaendige Transformations-Konfigurationen unter [EXAMPLES.md](references/EXAMPLES.md#step-4-configure-requestresponse-transformation) verfuegbar.

**Erwartet:** Anfrage-Header werden wie konfiguriert hinzugefuegt/entfernt. Antwort-Header enthalten Gateway-Metadaten. Grosse Anfragen werden mit 413 abgelehnt. Circuit-Breaker loest bei wiederholten Fehlern aus. Retries erfolgen bei voruebertgehenden Fehlern.

**Bei Fehler:**
- Middleware-Reihenfolge in der Kette pruefen
- Auf Header-Konflikte mit Backend-Services pruefen
- Transformationen einzeln testen, bevor sie verknuepft werden
- Logs auf Transformations-Fehler pruefen

### Schritt 5: Monitoring und Analysen aktivieren

Metriken, Logging und Dashboards fuer API-Sichtbarkeit konfigurieren.

**Kong-Monitoring einrichten:**
```yaml
# kong-monitoring.yaml (excerpt)
plugins:
- name: prometheus
  config:
    per_consumer: true
- name: http-log
  service: user-api
  # ... (see EXAMPLES.md for Datadog, file-log configuration)
```

```bash
deck sync --kong-addr http://localhost:8001 -s kong-monitoring.yaml

# Deploy ServiceMonitor (see EXAMPLES.md)
kubectl apply -f kong-servicemonitor.yaml
curl http://localhost:8100/metrics
```

**Traefik-Monitoring (integriert):**
```yaml
# ServiceMonitor (excerpt - see EXAMPLES.md for Grafana dashboard)
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: traefik-metrics
spec:
  endpoints:
  - port: metrics
    path: /metrics
    interval: 30s
```

```bash
kubectl port-forward -n traefik svc/traefik-dashboard 8080:8080
# Open http://localhost:8080/dashboard/
```

Vollstaendige Monitoring-Konfigurationen unter [EXAMPLES.md](references/EXAMPLES.md#step-5-enable-monitoring-and-analytics) verfuegbar.

**Erwartet:** Prometheus scraped Gateway-Metriken erfolgreich. Dashboards zeigen Anfrage-Raten, Latenz-Perzentile, Fehlerraten. Logs werden an Aggregationssystem weitergeleitet. Metriken segmentiert nach Service, Route und Consumer.

**Bei Fehler:**
- ServiceMonitor pruefen: `kubectl get servicemonitor -A`
- Prometheus-Targets in UI pruefen
- Sicherstellen, dass Metriken-Port erreichbar: `kubectl port-forward -n kong svc/kong-metrics 8100:8100`
- Erreichbarkeit des Log-Endpunkts validieren

### Schritt 6: API-Versionierung und Deprecation implementieren

Versions-Management und schrittweise API-Deprecation konfigurieren.

**Kong-Versionierungsstrategie:**
```yaml
# kong-versioning.yaml (excerpt)
services:
- name: user-api-v1
  url: http://user-service-v1.default.svc.cluster.local:8080
  routes:
  - name: user-v1-route
    paths: [/api/v1/users]
  plugins:
  - name: response-transformer
    config:
      add:
        headers:
        - X-Deprecation-Notice:"API v1 deprecated on 2024-12-31"
        - Sunset:"Wed, 31 Dec 2024 23:59:59 GMT"
# ... (see EXAMPLES.md for v2, default routing, rate limits)
```

**Traefik-Versionierung:**
```yaml
# traefik-versioning.yaml (excerpt)
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: v1-deprecation-headers
spec:
  headers:
    customResponseHeaders:
      X-Deprecation-Notice: "API v1 deprecated on 2024-12-31"
# ... (see EXAMPLES.md for complete IngressRoutes)
```

Versionierung testen:
```bash
curl -i https://api.example.com/api/v1/users  # Deprecated
curl -i https://api.example.com/api/v2/users  # Current
curl -i https://api.example.com/api/users     # Routes to v2
```

Vollstaendige Versionierungs-Konfigurationen unter [EXAMPLES.md](references/EXAMPLES.md#step-6-implement-api-versioning-and-deprecation) verfuegbar.

**Erwartet:** Verschiedene Versionen leiten an entsprechende Backend-Services weiter. Deprecation-Header in v1-Antworten vorhanden. Rate-Limits strenger fuer veraltete Versionen. Standard-Pfad leitet zur neuesten Version. Metriken nach API-Version segmentiert.

**Bei Fehler:**
- Pfad-Praezedenz/-Prioritaet pruefen (hoehere Prioritaet = zuerst ausgewertet)
- Auf ueberlappende Pfad-Muster pruefen
- Jede Versions-Route unabhaengig testen
- Routing-Logs auf Pfad-Matching pruefen
- Sicherstellen, dass Backend-Services fuer jede Version laufen

## Validierung

- [ ] API-Gateway-Pods laufen mit mehreren Replikas fuer Hochverfuegbarkeit
- [ ] LoadBalancer-Service hat externe IP zugewiesen
- [ ] Routen leiten Traffic korrekt an Backend-Services weiter
- [ ] Authentifizierung/Autorisierung setzt Zugangskontrolle durch (401/403-Antworten)
- [ ] Rate-Limiting gibt 429 nach Ueberschreiten des Kontingents zurueck
- [ ] Anfrage-/Antwort-Transformation fuegt/entfernt Header korrekt
- [ ] Circuit-Breaker loest bei wiederholten Backend-Fehlern aus
- [ ] Metriken exponiert und von Prometheus gescraped
- [ ] Dashboards zeigen Anfrage-Raten, Latenz, Fehler
- [ ] API-Versionierung leitet Anfragen an korrekte Backend-Versionen
- [ ] Deprecation-Header in aelteren API-Versionen vorhanden
- [ ] Health-Checks ueberwachen Backend-Service-Verfuegbarkeit

## Haeufige Stolperfallen

- **Datenbankabhaengigkeit (Kong)**: Kong mit Datenbank benoetigt PostgreSQL/Cassandra. DB-loser Modus verfuegbar, schraenkt aber einige Funktionen ein. DB-Modus fuer Produktion mit mehreren Gateway-Instanzen verwenden.

- **Pfad-Matching-Reihenfolge**: Routen/IngressRoutes werden in bestimmter Reihenfolge ausgewertet. Spezifischere Pfade sollten hoehere Prioritaet haben. Ueberlappende Pfade verursachen unvorhersehbares Routing.

- **Authentifizierungs-Bypass**: Sicherstellen, dass Authentifizierungs-Plugins auf alle Routen angewendet werden. Leicht, Route ohne Auth hinzuzufuegen. Standard-Plugins auf Service-Ebene verwenden, dann pro Route ueberschreiben.

- **Rate-Limit-Umfang**: Rate-Limiting `policy: local` zaehlt pro Gateway-Pod. Fuer konsistente Limits ueber Replikas zentralisierte Richtlinie (Redis) oder Sticky Sessions verwenden.

- **CORS-Konfiguration**: API-Gateway sollte CORS behandeln, nicht einzelne Services. CORS-Plugin/Middleware frueh hinzufuegen, um Browser-Preflight-Fehler zu vermeiden.

- **SSL/TLS-Terminierung**: Gateway terminiert normalerweise SSL. Sicherstellen, dass Zertifikate gueltig sind und automatische Erneuerung konfiguriert ist. cert-manager fuer Kubernetes-Zertifikatsverwaltung verwenden.

- **Upstream-Health-Checks**: Aktive Health-Checks konfigurieren, um Backend-Ausfaelle schnell zu erkennen. Passive Checks verlaessen sich auf echten Traffic und koennen langsamer reagieren.

- **Plugin-/Middleware-Ausfuehrungsreihenfolge**: Reihenfolge ist wichtig. Authentifizierung vor Rate-Limiting (vermeidet verschwendete Rate-Limit-Slots fuer ungueltige Anfragen). Transformation vor Logging (transformierte Werte protokollieren).

- **Ressourcenlimits**: Gateway-Pods koennen unter Last erhebliche CPU verbrauchen. Geeignete Ressourcenanforderungen/-limits setzen. CPU-Drosselung in Produktion ueberwachen.

- **Migrationsstrategie**: Nicht alle Plugins auf einmal aktivieren. Schrittweise einfuehren: Routing → Authentifizierung → Rate-Limiting → Transformationen → erweiterte Funktionen.

## Verwandte Skills

- `configure-ingress-networking` - Ingress-Controller-Setup ergaenzt API-Gateway
- `setup-service-mesh` - Service-Mesh bietet komplementaeres Ost-West-Traffic-Management
- `manage-kubernetes-secrets` - Zertifikats- und Credential-Management fuer Gateway
- `setup-prometheus-monitoring` - Monitoring-Integration fuer Gateway-Metriken
- `enforce-policy-as-code` - Richtliniendurchsetzung ergaenzt Gateway-Autorisierung
