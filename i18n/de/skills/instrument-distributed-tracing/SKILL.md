---
name: instrument-distributed-tracing
description: >
  Anwendungen mit OpenTelemetry fuer verteiltes Tracing instrumentieren, einschliesslich
  automatischer und manueller Instrumentierung, Kontextpropagierung, Sampling-Strategien
  und Integration mit Jaeger oder Tempo. Verwenden, wenn Latenzprobleme in verteilten
  Systemen debuggt werden, der Request-Fluss ueber Microservices verstanden werden soll,
  Traces mit Logs und Metriken fuer eine Ursachenanalyse korreliert werden, die
  End-to-End-Latenz gemessen wird oder von Legacy-Tracing-Systemen zu OpenTelemetry
  migriert wird.
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
  complexity: advanced
  language: multi
  tags: opentelemetry, tracing, jaeger, tempo, instrumentation
---

# Verteiltes Tracing instrumentieren

OpenTelemetry-Distributed-Tracing implementieren, um Anfragen ueber Microservices zu verfolgen und Performance-Engpaesse zu identifizieren.

## Wann verwenden

- Latenzprobleme in verteilten Systemen mit mehreren Services debuggen
- Request-Fluss und Abhaengigkeiten zwischen Microservices verstehen
- Langsame Datenbankabfragen oder externe API-Aufrufe innerhalb einer Transaktion identifizieren
- Traces mit Logs und Metriken fuer eine Ursachenanalyse korrelieren
- End-to-End-Latenz von der Benutzeranfrage bis zur Antwort messen
- Von Legacy-Tracing-Systemen (Zipkin, Jaeger) zu OpenTelemetry migrieren
- SLO-Compliance durch detailliertes Latenz-Perzentil-Tracking sicherstellen

## Eingaben

- **Pflichtfeld**: Liste der zu instrumentierenden Services (Sprachen und Frameworks)
- **Pflichtfeld**: Auswahl des Tracing-Backends (Jaeger, Tempo, Zipkin oder Vendor-SaaS)
- **Optional**: Vorhandene Instrumentierungsbibliotheken (OpenTracing, Zipkin)
- **Optional**: Sampling-Strategie-Anforderungen (Prozentuell, Rate-Limiting)
- **Optional**: Benutzerdefinierte Span-Attribute fuer geschaeftsspezifische Metadaten

## Vorgehensweise

> Unter [Extended Examples](references/EXAMPLES.md) sind vollstaendige Konfigurationsdateien und Templates verfuegbar.


### Schritt 1: Tracing-Backend einrichten

Jaeger oder Grafana Tempo zum Empfangen und Speichern von Traces bereitstellen.

**Option A: Jaeger all-in-one** (Entwicklung/Tests):

```yaml
# docker-compose.yml
version: '3.8'
services:
  jaeger:
    image: jaegertracing/all-in-one:1.51
    ports:
      - "5775:5775/udp"   # Zipkin compact thrift
      - "6831:6831/udp"   # Jaeger compact thrift
      - "6832:6832/udp"   # Jaeger binary thrift
      - "5778:5778"       # Serve configs
      - "16686:16686"     # Jaeger UI
      - "14268:14268"     # Jaeger HTTP thrift
      - "14250:14250"     # Jaeger GRPC
      - "9411:9411"       # Zipkin compatible endpoint
    environment:
      - COLLECTOR_ZIPKIN_HOST_PORT=:9411
      - COLLECTOR_OTLP_ENABLED=true
    restart: unless-stopped
```

**Option B: Grafana Tempo** (Produktion, skalierbar):

```yaml
# docker-compose.yml
version: '3.8'
services:
  tempo:
    image: grafana/tempo:2.3.0
    command: ["-config.file=/etc/tempo.yaml"]
    volumes:
      - ./tempo.yaml:/etc/tempo.yaml
      - tempo-data:/tmp/tempo
    ports:
      - "3200:3200"   # Tempo HTTP
      - "4317:4317"   # OTLP gRPC
      - "4318:4318"   # OTLP HTTP
      - "9411:9411"   # Zipkin
    restart: unless-stopped

volumes:
  tempo-data:
```

**Tempo-Konfiguration** (`tempo.yaml`):

```yaml
server:
  http_listen_port: 3200

distributor:
  receivers:
    jaeger:
# ... (see EXAMPLES.md for complete configuration)
```

Fuer **Produktion mit S3-Speicher**:

```yaml
storage:
  trace:
    backend: s3
    s3:
      bucket: tempo-traces
      endpoint: s3.amazonaws.com
      region: us-east-1
    wal:
      path: /tmp/tempo/wal
    pool:
      max_workers: 100
      queue_depth: 10000
```

**Erwartet:** Tracing-Backend ist zugaenglich, bereit, Traces ueber OTLP zu empfangen, Jaeger-UI oder Grafana zeigt initial "keine Traces" an.

**Bei Fehler:**
- Pruefen, ob Ports bereits belegt sind: `netstat -tulpn | grep -E '(4317|16686|3200)'`
- Container-Logs pruefen: `docker logs jaeger` oder `docker logs tempo`
- OTLP-Endpunkt testen: `curl http://localhost:4318/v1/traces -v`
- Fuer Tempo: Konfigurationssyntax validieren mit `tempo -config.file=/etc/tempo.yaml -verify-config`

### Schritt 2: Anwendungen instrumentieren (Auto-Instrumentierung)

OpenTelemetry-Auto-Instrumentierung fuer gaengige Frameworks verwenden, um Code-Aenderungen zu minimieren.

**Python mit Flask**:

```bash
pip install opentelemetry-distro opentelemetry-exporter-otlp
opentelemetry-bootstrap -a install
```

```python
# app.py
from flask import Flask
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
# ... (see EXAMPLES.md for complete configuration)
```

**Go mit Gin-Framework**:

```bash
go get go.opentelemetry.io/otel
go get go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc
go get go.opentelemetry.io/otel/sdk/trace
go get go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin
```

```go
package main

import (
    "context"
    "github.com/gin-gonic/gin"
    "go.opentelemetry.io/otel"
# ... (see EXAMPLES.md for complete configuration)
```

**Node.js mit Express**:

```bash
npm install @opentelemetry/api \
            @opentelemetry/sdk-node \
            @opentelemetry/auto-instrumentations-node \
            @opentelemetry/exporter-trace-otlp-grpc
```

```javascript
// tracing.js
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
# ... (see EXAMPLES.md for complete configuration)
```

**Erwartet:** Traces von instrumentierten Services erscheinen in der Jaeger-UI oder in Grafana, HTTP-Anfragen erstellen automatisch Spans.

**Bei Fehler:**
- Pruefen, ob der Exporter-Endpunkt von der Anwendung erreichbar ist
- Umgebungsvariablen pruefen: `OTEL_EXPORTER_OTLP_ENDPOINT=http://tempo:4317`
- Debug-Logging aktivieren: `OTEL_LOG_LEVEL=debug` (Python), `OTEL_LOG_LEVEL=DEBUG` (Node.js)
- Mit einem einfachen Span testen: manuell einen Span erstellen, um die Export-Pipeline zu pruefen
- Auf Versionskonflikte zwischen OpenTelemetry-Paketen pruefen

### Schritt 3: Manuelle Instrumentierung hinzufuegen

Benutzerdefinierte Spans fuer Geschaeftslogik, Datenbankabfragen und externe Aufrufe erstellen.

**Python manuelle Spans**:

```python
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

def process_order(order_id):
    # Create a span for the entire operation
# ... (see EXAMPLES.md for complete configuration)
```

**Go manuelle Spans**:

```go
import (
    "context"
    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/attribute"
    "go.opentelemetry.io/otel/codes"
    "go.opentelemetry.io/otel/trace"
# ... (see EXAMPLES.md for complete configuration)
```

**Best Practices fuer Span-Attribute**:
- Semantische Konventionen verwenden: `http.method`, `http.status_code`, `db.system`, `db.statement`
- Geschaeftskontext hinzufuegen: `user.id`, `order.id`, `product.category`
- Ressourcenbezeichner einschliessen: `instance.id`, `region`, `availability_zone`
- Fehler aufzeichnen: `span.RecordError(err)` und `span.SetStatus(codes.Error, message)`
- Ereignisse fuer wichtige Meilensteine hinzufuegen: `span.AddEvent("cache_miss")`

**Erwartet:** Benutzerdefinierte Spans erscheinen in der Trace-Ansicht, Eltern-Kind-Beziehungen korrekt, Attribute in Span-Details sichtbar, Fehler hervorgehoben.

**Bei Fehler:**
- Kontextpropagierung pruefen: uebergeordneter Span-Kontext wird an untergeordneten weitergegeben
- Sicherstellen, dass Span-Namen beschreibend sind und Namenskonventionen folgen
- Spans muessen beendet werden (`defer span.End()` in Go, `with`-Bloecke in Python)
- Attributtypen pruefen: nur Strings, Integer, Boolesche Werte, Floats
- Semantische Konventionen validieren: Standard-Attributnamen verwenden, wo anwendbar

### Schritt 4: Kontextpropagierung implementieren

Sicherstellen, dass der Trace-Kontext ueber Service-Grenzen und asynchrone Operationen hinweg fliesst.

**HTTP-Header-Propagierung** (W3C Trace Context):

```python
# Client side (Python with requests)
import requests
from opentelemetry import trace
from opentelemetry.propagate import inject

tracer = trace.get_tracer(__name__)
# ... (see EXAMPLES.md for complete configuration)
```

```go
// Server side (Go with Gin)
import (
    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/propagation"
)

# ... (see EXAMPLES.md for complete configuration)
```

**Nachrichtenwarteschlangen-Propagierung** (Kafka):

```python
# Producer
from opentelemetry.propagate import inject
from kafka import KafkaProducer

producer = KafkaProducer(bootstrap_servers=['kafka:9092'])

# ... (see EXAMPLES.md for complete configuration)
```

```python
# Consumer
from opentelemetry.propagate import extract

def process_message(msg):
    # Extract trace context from Kafka headers
    headers = {k: v.decode('utf-8') for k, v in msg.headers}
    ctx = extract(headers)

    # Continue the trace
    with tracer.start_as_current_span("process_order_event", context=ctx):
        order_id = json.loads(msg.value)['order_id']
        handle_order(order_id)
```

**Asynchrone Operationen** (Python asyncio):

```python
import asyncio
from opentelemetry import trace, context

async def async_operation():
    # Capture current context
    token = context.attach(context.get_current())
    try:
        with tracer.start_as_current_span("async_database_query"):
            await asyncio.sleep(0.1)  # Simulated async work
            return "result"
    finally:
        context.detach(token)
```

**Erwartet:** Traces erstrecken sich ueber mehrere Services, Trace-IDs sind ueber Service-Grenzen hinweg konsistent, Eltern-Kind-Beziehungen bleiben erhalten.

**Bei Fehler:**
- W3C-Trace-Context-Propagator-Konfiguration pruefen: `otel.propagation.set_global_textmap(TraceContextTextMapPropagator())`
- Sicherstellen, dass Header in HTTP-Anfragen weitergegeben werden
- Fuer Kafka: Pruefen, ob Header von der Broker-Version unterstuetzt werden (v0.11+)
- Mit Header-Inspektion debuggen: `traceparent`-Headerwert protokollieren
- Trace-Visualisierung verwenden, um unterbrochene Trace-Links zu identifizieren

### Schritt 5: Sampling-Strategien konfigurieren

Sampling implementieren, um das Trace-Volumen und die Kosten zu reduzieren und gleichzeitig die Sichtbarkeit zu erhalten.

**Sampling-Strategien**:

```python
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.sampling import (
    ParentBased,
    TraceIdRatioBased,
    StaticSampler,
    Decision
# ... (see EXAMPLES.md for complete configuration)
```

**Tail-basiertes Sampling mit Tempo**:

In `tempo.yaml` konfigurieren:

```yaml
overrides:
  defaults:
    metrics_generator:
      processors: [service-graphs, span-metrics]
      storage:
        path: /tmp/tempo/generator/wal
        remote_write:
          - url: http://prometheus:9090/api/v1/write
            send_exemplars: true

    # Tail sampling (requires tempo-query)
    ingestion_rate_limit_bytes: 5000000
    ingestion_burst_size_bytes: 10000000
```

**Grafana Tempo's TraceQL** fuer dynamisches Sampling verwenden:

```traceql
# Sample traces with errors
{ status = error }

# Sample slow traces (>1s)
{ duration > 1s }

# Sample specific services
{ resource.service.name = "checkout-service" }
```

**Erwartet:** Trace-Volumen auf Zielprozentsatz reduziert, Fehler-Traces werden immer gesampelt, Sampling-Entscheidung in Trace-Metadaten sichtbar.

**Bei Fehler:**
- Pruefen, ob der Sampler vor der Initialisierung des Tracer-Providers angewendet wird
- Sampling-Entscheidungsattribut in exportierten Spans pruefen
- Fuer Tail-Sampling: ausreichend Puffer sicherstellen (`ingestion_burst_size_bytes`)
- Verworfene Traces ueberwachen: `otel_traces_dropped_total`-Metrik
- Mit synthetischem Hochvolumen-Traffic testen, um die Sampling-Rate zu validieren

### Schritt 6: Traces mit Metriken und Logs korrelieren

Traces mit Metriken und Logs fuer einheitliche Observability verknuepfen.

**Trace-IDs zu Logs hinzufuegen** (Python):

```python
import logging
from opentelemetry import trace

# Custom log formatter with trace context
class TraceFormatter(logging.Formatter):
    def format(self, record):
# ... (see EXAMPLES.md for complete configuration)
```

**Metriken aus Traces generieren** (Tempo):

```yaml
# tempo.yaml
metrics_generator:
  registry:
    external_labels:
      cluster: production
  storage:
# ... (see EXAMPLES.md for complete configuration)
```

Dadurch werden Prometheus-Metriken generiert:
- `traces_service_graph_request_total` - Anzahl der Anfragen zwischen Services
- `traces_span_metrics_duration_seconds` - Span-Dauer-Histogramm
- `traces_spanmetrics_calls_total` - Span-Aufrufzaehler

**Traces aus Metriken abfragen** (Grafana):

Exemplar-Unterstuetzung fuer Prometheus-Datenquelle in Grafana hinzufuegen:

```yaml
datasources:
  - name: Prometheus
    type: prometheus
    url: http://prometheus:9090
    jsonData:
      exemplarTraceIdDestinations:
        - name: trace_id
          datasourceName: Tempo
```

In Grafana-Dashboard Exemplare aktivieren:

```json
{
  "fieldConfig": {
    "defaults": {
      "custom": {
        "showExemplars": true
      }
    }
  }
}
```

**Erwartet:** Das Klicken auf Metrik-Exemplare oeffnet den Trace, Logs zeigen Trace-IDs, Traces verlinken zu Logs, einheitliches Debugging ueber alle Signale hinweg.

**Bei Fehler:**
- Exemplar-Unterstuetzung in Prometheus pruefen (erfordert v2.26+)
- Trace-ID-Format pruefen (32-stellige Hexadezimalzahl)
- Sicherstellen, dass der Metrik-Generator in der Tempo-Konfiguration aktiviert ist
- Remote-Write-Endpunkt auf Zugaenglichkeit von Tempo aus pruefen
- Exemplar-Abfragen testen: `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) and on() exemplar`

## Validierung

- [ ] Tracing-Backend empfaengt Spans von allen instrumentierten Services
- [ ] Traces zeigen korrekte Eltern-Kind-Beziehungen ueber Services hinweg
- [ ] Span-Attribute enthalten semantische Konventionen und Geschaeftskontext
- [ ] Kontext propagiert korrekt ueber HTTP-Aufrufe und Nachrichtenwarteschlangen
- [ ] Sampling-Strategie reduziert Trace-Volumen auf Zielprozentsatz
- [ ] Fehler-Traces werden immer gesampelt (bei Verwendung von fehlerbewahrtem Sampling)
- [ ] Trace-IDs erscheinen in Anwendungslogs mit korrektem Format
- [ ] Grafana zeigt Traces, die ueber Exemplare mit Metriken verknuepft sind
- [ ] Log-Panels haben Datenlinks zum Trace-Viewer
- [ ] Trace-Aufbewahrung entspricht der konfigurierten Speicherrichtlinie

## Haeufige Stolperfallen

- **Kontext nicht propagiert**: Das Vergessen, den `context` an nachgelagerte Aufrufe weiterzugeben, unterbricht Traces. Kontext immer explizit weitergeben.
- **Spans nie beendet**: Fehlendes `defer span.End()` (Go) oder `with`-Bloecke (Python) fuehrt dazu, dass Spans offen bleiben und Speicherlecks entstehen.
- **Ueberinstrumentierung**: Das Erstellen von Spans fuer jede Funktion verursacht Trace-Ueberfluss. Auf Service-Grenzen, Datenbankaufrufe und externe APIs konzentrieren.
- **Fehlende Fehleraufzeichnung**: Das Nicht-Aufrufen von `span.RecordError()` verliert wertvolle Debug-Informationen. Fehler in Spans immer aufzeichnen.
- **Attribute mit hoher Kardinalitaet**: Unbegrenzte Werte (Benutzer-IDs, Request-Bodies) als Span-Attribute verwenden, verursacht Speicherprobleme. Sampling oder aggregierte Labels verwenden.
- **Falscher Span-Typ**: Falschen Span-Typ verwenden (CLIENT vs SERVER vs INTERNAL) beeinflusst die Service-Graph-Generierung. Semantische Konventionen befolgen.
- **Sampling vor Kontext**: Sampling-Entscheidungen muessen den uebergeordneten Trace-Kontext respektieren. `ParentBased`-Sampler verwenden, um Upstream-Sampling zu beruecksichtigen.

## Verwandte Skills

- `correlate-observability-signals` - Einheitliches Debugging mit Metriken, Logs und Traces, die durch Trace-IDs verknuepft sind
- `setup-prometheus-monitoring` - Metriken aus Traces mit dem Tempo-Metrik-Generator generieren
- `configure-log-aggregation` - Trace-IDs zu Logs hinzufuegen zur Korrelation mit verteilten Traces
- `build-grafana-dashboards` - Trace-abgeleitete Metriken und Exemplar-Links in Dashboards visualisieren
