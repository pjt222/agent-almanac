---
name: configure-log-aggregation
description: >
  Zentralisierte Log-Aggregation mit Loki und Promtail (oder ELK-Stack) einrichten,
  einschliesslich Log-Parsing, Label-Extraktion, Aufbewahrungsrichtlinien und Integration
  mit Metriken zur Korrelation. Verwenden, wenn Logs aus mehreren Services in einem
  durchsuchbaren System zusammengefuehrt werden sollen, lokale Log-Dateien durch zentralen
  abfragbaren Speicher ersetzt werden, Logs mit Metriken und Traces korreliert werden,
  strukturiertes Logging mit Label-Extraktion implementiert wird oder
  Produktionsvorfaelle eine serviceuebergreifende Log-Analyse erfordern.
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: observability
  complexity: intermediate
  language: multi
  tags: loki, promtail, logging, elk, log-aggregation
---

# Log-Aggregation konfigurieren

Zentrale Log-Sammlung, -Parsing und -Abfrage mit Loki/Promtail oder ELK-Stack fuer operationelle Sichtbarkeit implementieren.

## Wann verwenden

- Logs aus mehreren Services oder Hosts in einem durchsuchbaren System zusammenfuehren
- Lokale Log-Dateien durch zentralen, abfragbaren Log-Speicher ersetzen
- Logs mit Metriken und Traces fuer vollstaendige Observability korrelieren
- Strukturiertes Logging mit Label-Extraktion aus unstrukturierten Logs implementieren
- Aufbewahrungsrichtlinien fuer Log-Daten basierend auf Speicher- und Compliance-Anforderungen festlegen
- Produktionsvorfaelle mit Log-Analyse ueber mehrere Services hinweg debuggen

## Eingaben

- **Pflichtfeld**: Log-Quellen (Anwendungslogs, Systemlogs, Container-Logs)
- **Pflichtfeld**: Log-Format-Muster (JSON, Klartext, Syslog usw.)
- **Optional**: Label-Extraktionsregeln fuer strukturierte Abfragen
- **Optional**: Aufbewahrungs- und Komprimierungsrichtlinien
- **Optional**: Vorhandene Log-Shipper-Konfiguration (Fluentd, Filebeat, Promtail)

## Vorgehensweise

> Unter [Extended Examples](references/EXAMPLES.md) sind vollstaendige Konfigurationsdateien und Templates verfuegbar.


### Schritt 1: Log-Aggregation-Stack auswaehlen

Zwischen Loki (Prometheus-Stil) und ELK (Elasticsearch-basiert) basierend auf den Anforderungen waehlen.

**Loki-Vorteile**:
- Leichtgewichtig, fuer Kubernetes und cloud-native Umgebungen konzipiert
- Label-basierter Index (wie Prometheus) fuer geringen Speicheraufwand
- Native Integration mit Grafana fuer einheitliche Dashboards
- Horizontale Skalierbarkeit mit Object Storage (S3, GCS)
- Geringerer Ressourcenverbrauch im Vergleich zu Elasticsearch

**ELK-Vorteile**:
- Volltextsuche ueber alle Log-Inhalte (nicht nur Labels)
- Umfangreiches Abfrage-DSL und Aggregationen
- Reifes Ecosystem mit Beats- und Logstash-Plugins
- Besser fuer Compliance/Audit-Logs, die tiefe historische Suche erfordern

Fuer diese Anleitung liegt der Fokus auf **Loki + Promtail** (empfohlen fuer die meisten modernen Setups).

Entscheidungskriterien:
```markdown
Use Loki if:
- You want label-based queries similar to Prometheus
- Storage costs are a concern (Loki indexes only labels)
- You already use Grafana for metrics
- Kubernetes/container-native deployment

Use ELK if:
- You need full-text search across all log content
- You have complex log parsing and enrichment requirements
- You require advanced analytics and aggregations
- Legacy systems with existing Logstash pipelines
```

**Erwartet:** Klare Entscheidung basierend auf Anforderungen getroffen, Team laedt geeignete Installationsartefakte herunter.

**Bei Fehler:**
- Speicheranforderungen vergleichen: Loki ~10x weniger als Elasticsearch fuer dieselben Logs
- Abfragemuster bewerten: Volltextsuche vs. Label-Filterung
- Betriebsaufwand bedenken: ELK erfordert mehr Tuning und Ressourcen

### Schritt 2: Loki bereitstellen

Loki mit geeignetem Speicher-Backend installieren und konfigurieren.

**Docker-Compose-Deployment** (`docker-compose.yml`):

```yaml
version: '3.8'

services:
  loki:
    image: grafana/loki:2.9.0
    ports:
      - "3100:3100"
    volumes:
      - ./loki-config.yml:/etc/loki/local-config.yaml
      - loki-data:/loki
    command: -config.file=/etc/loki/local-config.yaml
    restart: unless-stopped

  promtail:
    image: grafana/promtail:2.9.0
    volumes:
      - ./promtail-config.yml:/etc/promtail/config.yml
      - /var/log:/var/log:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
    command: -config.file=/etc/promtail/config.yml
    restart: unless-stopped
    depends_on:
      - loki

volumes:
  loki-data:
```

**Loki-Konfiguration** (`loki-config.yml`):

```yaml
auth_enabled: false

server:
  http_listen_port: 3100
  grpc_listen_port: 9096

# ... (see EXAMPLES.md for complete configuration)
```

Fuer **Produktion** mit S3-Speicher:

```yaml
storage_config:
  aws:
    s3: s3://us-east-1/my-loki-bucket
    s3forcepathstyle: true
  boltdb_shipper:
    active_index_directory: /loki/index
    cache_location: /loki/cache
    shared_store: s3
```

**Erwartet:** Loki startet erfolgreich, Health-Check besteht unter `http://localhost:3100/ready`, Logs werden gemaess Aufbewahrungsrichtlinie gespeichert.

**Bei Fehler:**
- Loki-Logs pruefen: `docker logs loki`
- Pruefen, ob Speicherverzeichnisse vorhanden und beschreibbar sind
- Konfigurationssyntax testen: `docker run grafana/loki:2.9.0 -config.file=/etc/loki/local-config.yaml -verify-config`
- Sicherstellen, dass Aufbewahrungseinstellungen die Festplattenkapazitaet nicht ueberschreiten
- Fuer S3: IAM-Berechtigungen und Bucket-Zugriff pruefen

### Schritt 3: Promtail fuer Log-Shipping konfigurieren

Promtail einrichten, um Logs zu scrapen und mit Label-Extraktion an Loki weiterzuleiten.

**Promtail-Konfiguration** (`promtail-config.yml`):

```yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml
# ... (see EXAMPLES.md for complete configuration)
```

Wichtige Promtail-Konzepte:
- **Scrape configs**: Log-Quellen und deren Erkennung definieren
- **Pipeline stages**: Logs vor dem Senden an Loki transformieren und labeln
- **Relabel configs**: Dynamische Beschriftung basierend auf Metadaten
- **Positions file**: Verfolgt Leseoffsets, um Log-Wiederverarbeitung zu vermeiden

**Erwartet:** Promtail scrapt konfigurierte Log-Dateien, Labels werden korrekt angewendet, Logs sind in Loki ueber LogQL-Abfragen sichtbar.

**Bei Fehler:**
- Promtail-Logs pruefen: `docker logs promtail`
- Dateipfade auf Zugaenglichkeit pruefen: `docker exec promtail ls /var/log`
- Regex-Muster unabhaengig mit Beispiel-Log-Zeilen testen
- Promtail-Metriken ueberwachen: `curl http://localhost:9080/metrics | grep promtail`
- Positions-Datei auf Fortschritt pruefen: `cat /tmp/positions.yaml`

### Schritt 4: Logs mit LogQL abfragen

LogQL-Syntax fuer Filterung und Aggregation von Logs erlernen.

**Grundlegende Abfragen**:

```logql
# All logs from a job
{job="app"}

# Logs with specific label values
{job="app", level="error"}

# Regex filter on log line content
{job="app"} |~ "authentication failed"

# Case-insensitive regex
{job="app"} |~ "(?i)error"

# Line filter (doesn't parse, just includes/excludes)
{job="app"} |= "user"  # Contains "user"
{job="app"} != "debug" # Doesn't contain "debug"
```

**Parsing und Filterung**:

```logql
# JSON parsing
{job="app"} | json | level="error"

# Regex parsing with named groups
{job="app"} | regexp "user_id=(?P<user_id>\\d+)" | user_id="12345"

# Logfmt parsing (key=value format)
{job="app"} | logfmt | level="error", service="auth"

# Pattern parsing
{job="nginx"} | pattern `<ip> - <user> [<timestamp>] "<method> <path> <protocol>" <status> <size>` | status >= 500
```

**Aggregationen** (Metriken aus Logs):

```logql
# Count log lines per level
sum by (level) (count_over_time({job="app"}[5m]))

# Rate of error logs
rate({job="app", level="error"}[5m])

# Bytes processed per service
sum by (service) (bytes_over_time({job="app"}[1h]))

# Average request duration from logs
avg_over_time({job="app"} | json | unwrap duration [5m])

# Top 10 error messages
topk(10, sum by (message) (count_over_time({level="error"} [1h])))
```

**Filterung nach extrahierten Feldern**:

```logql
# Find specific trace in logs
{job="app"} | json | trace_id="abc123def456"

# HTTP 5xx errors from nginx
{job="nginx"} | pattern `<_> "<_> <_> <_>" <status> <_>` | status >= 500

# Failed authentication attempts
{job="app"} | json | message=~"authentication failed" | user_id != ""
```

Grafana-Explore-Abfragen oder Dashboard-Panels mit diesen Mustern erstellen.

**Erwartet:** Abfragen liefern erwartete Log-Zeilen zurueck, Filterung funktioniert korrekt, Aggregationen erzeugen Metriken aus Logs.

**Bei Fehler:**
- Grafana Explore verwenden, um Abfragen interaktiv zu debuggen
- Label-Namen pruefen: `curl http://localhost:3100/loki/api/v1/labels`
- Label-Werte pruefen: `curl http://localhost:3100/loki/api/v1/label/{label_name}/values`
- Abfrage vereinfachen: mit einfachem Label-Selektor beginnen, Filter schrittweise hinzufuegen
- Zeitbereich pruefen: Logs koennen im ausgewaehlten Fenster nicht vorhanden sein

### Schritt 5: Logs mit Metriken und Traces integrieren

Logs mit Prometheus-Metriken und verteilten Traces fuer einheitliche Observability korrelieren.

**Trace-IDs zu Logs hinzufuegen** (Anwendungsinstrumentierung):

```python
# Python with OpenTelemetry
import logging
from opentelemetry import trace

logger = logging.getLogger(__name__)

def handle_request():
    span = trace.get_current_span()
    trace_id = span.get_span_context().trace_id

    logger.info(
        "Processing request",
        extra={"trace_id": format(trace_id, "032x")}
    )
```

```go
// Go with OpenTelemetry
import (
    "go.opentelemetry.io/otel/trace"
    "go.uber.org/zap"
)

func handleRequest(ctx context.Context) {
    span := trace.SpanFromContext(ctx)
    traceID := span.SpanContext().TraceID().String()

    logger.Info("Processing request",
        zap.String("trace_id", traceID),
    )
}
```

**Grafana-Datenlinks konfigurieren** von Metriken zu Logs:

In der Prometheus-Panel-Feldkonfiguration:

```json
{
  "fieldConfig": {
    "defaults": {
      "links": [
        {
          "title": "View Logs",
          "url": "/explore?left={\"datasource\":\"Loki\",\"queries\":[{\"refId\":\"A\",\"expr\":\"{job=\\\"app\\\",instance=\\\"${__field.labels.instance}\\\"} |= `${__field.labels.trace_id}`\"}],\"range\":{\"from\":\"${__from}\",\"to\":\"${__to}\"}}",
          "targetBlank": false
        }
      ]
    }
  }
}
```

**Grafana-Datenlinks konfigurieren** von Logs zu Traces:

In der Loki-Datenquellenkonfiguration:

```yaml
datasources:
  - name: Loki
    type: loki
    url: http://loki:3100
    jsonData:
      derivedFields:
        - datasourceName: Tempo
          matcherRegex: "trace_id=(\\w+)"
          name: TraceID
          url: "$${__value.raw}"
```

**Logs in Grafana Explore korrelieren**:
1. Metriken in Prometheus abfragen
2. Auf Datenpunkt klicken
3. "View Logs" aus Kontextmenue auswaehlen
4. Loki-Abfrage wird automatisch mit relevanten Labels und Zeitbereich befuellt
5. Trace-ID in Logs anklicken
6. Tempo-Trace-Ansicht oeffnet sich mit vollstaendigem verteilten Trace

**Erwartet:** Das Klicken auf Metriken oeffnet verwandte Logs, Trace-IDs in Logs verlinken zum Trace-Viewer, einheitliche Ansicht fuer Metriken/Logs/Traces-Navigation.

**Bei Fehler:**
- Trace-ID-Format mit Regex in derived fields abgleichen
- Pruefen, ob trace_id-Label von der Promtail-Pipeline extrahiert wird
- Sicherstellen, dass Tempo-Datenquelle in Grafana konfiguriert ist
- URL-Kodierung fuer komplexe Filterausdrucke testen
- Datenlink-URLs im Inkognito-/Privatfenster des Browsers validieren

### Schritt 6: Log-Aufbewahrung und Komprimierung einrichten

Aufbewahrungsrichtlinien und Komprimierung konfigurieren, um Speicherkosten zu verwalten.

**Aufbewahrung nach Stream** (in der Loki-Konfiguration):

```yaml
limits_config:
  retention_period: 720h  # Global default: 30 days

  # Per-tenant retention (requires multi-tenancy enabled)
  per_tenant_override_config: /etc/loki/overrides.yaml

# overrides.yaml
overrides:
  production:
    retention_period: 2160h  # 90 days for production
  staging:
    retention_period: 360h   # 15 days for staging
  development:
    retention_period: 168h   # 7 days for dev
```

**Aufbewahrung nach Stream-Labels** (erfordert Komprimierungsdienst):

```yaml
compactor:
  working_directory: /loki/compactor
  shared_store: filesystem
  compaction_interval: 10m
  retention_enabled: true
  retention_delete_delay: 2h
# ... (see EXAMPLES.md for complete configuration)
```

Die Prioritaet bestimmt, welche Regel gilt, wenn mehrere zutreffen (niedrigere Zahl = hoehere Prioritaet).

**Komprimierungseinstellungen**:

```yaml
chunk_store_config:
  chunk_cache_config:
    enable_fifocache: true
    fifocache:
      max_size_bytes: 1GB
      ttl: 24h
# ... (see EXAMPLES.md for complete configuration)
```

**Aufbewahrung ueberwachen**:

```bash
# Check chunk stats
curl http://localhost:3100/loki/api/v1/status/chunks | jq

# Check compactor metrics
curl http://localhost:3100/metrics | grep loki_compactor

# Verify deleted chunks
curl http://localhost:3100/metrics | grep loki_boltdb_shipper_retention_deleted
```

**Erwartet:** Alte Logs werden gemaess Aufbewahrungsrichtlinie automatisch geloescht, Speichernutzung stabilisiert sich, Komprimierung reduziert die Indexgroesse.

**Bei Fehler:**
- Komprimierungsdienst in der Loki-Konfiguration aktivieren, wenn Aufbewahrung nicht funktioniert
- Komprimierungs-Logs pruefen: `docker logs loki | grep compactor`
- `retention_enabled: true` und `retention_deletes_enabled: true` pruefen
- Festplattennutzung ueberwachen: `du -sh /loki/`
- Fuer S3: Pruefen, ob Bucket-Lifecycle-Richtlinien nicht mit Loki-Aufbewahrung in Konflikt stehen

## Validierung

- [ ] Loki-API-Health-Check gibt 200 zurueck: `curl http://localhost:3100/ready`
- [ ] Promtail scrapt erfolgreich Logs aus allen konfigurierten Quellen
- [ ] Labels werden korrekt aus Log-Zeilen extrahiert (in Grafana Explore sichtbar)
- [ ] LogQL-Abfragen liefern erwartete Ergebnisse mit ordentlicher Filterung
- [ ] Log-Aufbewahrungsrichtlinie wird durchgesetzt (alte Logs nach Aufbewahrungszeitraum geloescht)
- [ ] Logs sind ueber Grafana-Dashboards und Explore-Ansicht zugaenglich
- [ ] Trace-IDs aus Logs verlinken zum Tempo-Trace-Viewer
- [ ] Metriken-Panels haben Datenlinks zu relevanten Logs
- [ ] Komprimierung laeuft und reduziert Speicheraufwand
- [ ] Speichernutzung innerhalb des zugewiesenen Festplatten-/S3-Budgets

## Haeufige Stolperfallen

- **Labels mit hoher Kardinalitaet**: Unbegrenzte Label-Werte (Benutzer-IDs, Request-IDs) fuehren zu Index-Explosion. Feste Labels verwenden (level, service, env) und Variablen in Log-Zeilen ablegen.
- **Fehlendes Log-Parsing**: Rohe Logs ohne Label-Extraktion senden schraenkt Abfragekapazitaeten ein. Strukturierte Logs (JSON, logfmt) immer parsen oder Regex fuer unstrukturierte verwenden.
- **Falsche Zeitstempel-Verarbeitung**: Nicht passende Zeitstempelformate fuehren zu unsortierten oder abgelehnten Logs. Zeitstempel-Parsing mit Beispiel-Logs testen.
- **Aufbewahrung funktioniert nicht**: Komprimierungsdienst muss aktiviert sein, damit Aufbewahrung alte Daten loescht. `retention_enabled: true` und `retention_deletes_enabled: true` pruefen.
- **Aufnahmerate-Limits**: Standard-Limits (10MB/s) koennen fuer hochvolumige Systeme zu niedrig sein. `ingestion_rate_mb` und `ingestion_burst_size_mb` anpassen.
- **Abfrage-Timeouts**: Breite Abfragen ueber lange Zeitbereiche koennen timeout-bedingt abbrechen. Spezifischere Label-Selektoren und kuerzere Zeitfenster verwenden.
- **Log-Duplikation**: Mehrere Promtail-Instanzen, die dieselben Logs scrapen, erstellen Duplikate. Eindeutige Labels oder Positions-Datei-Koordination verwenden.

## Verwandte Skills

- `correlate-observability-signals` - Einheitliches Debugging ueber Metriken, Logs und Traces hinweg mithilfe von Trace-IDs
- `build-grafana-dashboards` - Log-abgeleitete Metriken visualisieren und Log-Panels in Dashboards erstellen
- `setup-prometheus-monitoring` - Metriken liefern Kontext dafuer, wann Logs waehrend Vorfaellen abgefragt werden sollen
- `instrument-distributed-tracing` - Trace-IDs zu Logs hinzufuegen zur Korrelation mit verteilten Traces
