---
name: instrument-distributed-tracing
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  OpenTelemetry distributed tracing — auto/manual instrumentation, ctx propagation,
  sampling, Jaeger/Tempo integration. Use when: debug latency in distributed sys,
  req flow across microservices, correlate traces w/ logs+metrics, e2e latency,
  migrate legacy tracing → OTel.
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

# Instrument Distributed Tracing

OTel tracing → track req across microservices → find perf bottleneck.

## Use When

- Latency debug → multi-service distributed sys
- Req flow + deps between microservices
- Slow DB query / external API in txn
- Correlate traces w/ logs+metrics → root cause
- E2E latency (user req → res)
- Legacy tracing (Zipkin, Jaeger) → OTel migration
- SLO compliance → latency percentile

## In

- **Req**: Svc list (lang + framework)
- **Req**: Backend (Jaeger, Tempo, Zipkin, SaaS)
- **Opt**: Existing lib (OpenTracing, Zipkin)
- **Opt**: Sampling strat (%, rate limit)
- **Opt**: Custom span attrs → biz metadata

## Do

> See [Extended Examples](references/EXAMPLES.md) for complete config files.

### Step 1: Backend

Deploy Jaeger / Grafana Tempo → receive+store traces.

**Opt A: Jaeger all-in-one** (dev/test):

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

**Opt B: Grafana Tempo** (prod, scalable):

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

**Tempo config** (`tempo.yaml`):

```yaml
server:
  http_listen_port: 3200

distributor:
  receivers:
    jaeger:
# ... (see EXAMPLES.md)
```

**Prod w/ S3 storage**:

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

→ Backend up, OTLP ready, Jaeger UI / Grafana → "no traces" initially.

**If err:**
- Ports busy? `netstat -tulpn | grep -E '(4317|16686|3200)'`
- Container logs: `docker logs jaeger` / `docker logs tempo`
- Test OTLP: `curl http://localhost:4318/v1/traces -v`
- Tempo: `tempo -config.file=/etc/tempo.yaml -verify-config`

### Step 2: Instrument Apps (Auto)

OTel auto-instrument → common frameworks → min code change.

**Python w/ Flask**:

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
# ... (see EXAMPLES.md)
```

**Go w/ Gin**:

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
# ... (see EXAMPLES.md)
```

**Node.js w/ Express**:

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
# ... (see EXAMPLES.md)
```

→ Traces from svcs appear in Jaeger UI / Grafana. HTTP req → spans auto.

**If err:**
- Exporter endpoint reachable from app?
- Env vars: `OTEL_EXPORTER_OTLP_ENDPOINT=http://tempo:4317`
- Debug log: `OTEL_LOG_LEVEL=debug` (Py), `OTEL_LOG_LEVEL=DEBUG` (Node)
- Test w/ simple span → verify export pipeline
- Ver conflicts between OTel pkgs?

### Step 3: Manual Instrument

Custom spans → biz logic, DB query, external call.

**Py manual spans**:

```python
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

def process_order(order_id):
    # Create a span for the entire operation
# ... (see EXAMPLES.md)
```

**Go manual spans**:

```go
import (
    "context"
    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/attribute"
    "go.opentelemetry.io/otel/codes"
    "go.opentelemetry.io/otel/trace"
# ... (see EXAMPLES.md)
```

**Span attrs best practice**:
- Semantic conv: `http.method`, `http.status_code`, `db.system`, `db.statement`
- Biz ctx: `user.id`, `order.id`, `product.category`
- Resource id: `instance.id`, `region`, `availability_zone`
- Errs: `span.RecordError(err)` + `span.SetStatus(codes.Error, message)`
- Events: `span.AddEvent("cache_miss")`

→ Custom spans in trace view. Parent-child correct. Attrs visible. Errs highlighted.

**If err:**
- Ctx propagation → parent span ctx → child?
- Span names descriptive + naming conv?
- Spans ended (`defer span.End()` Go, `with` Py)?
- Attr types: str, int, bool, float only
- Semantic conv: standard attr names

### Step 4: Ctx Propagation

Trace ctx flows across svc boundary + async ops.

**HTTP headers propagation** (W3C Trace Context):

```python
# Client side (Python with requests)
import requests
from opentelemetry import trace
from opentelemetry.propagate import inject

tracer = trace.get_tracer(__name__)
# ... (see EXAMPLES.md)
```

```go
// Server side (Go with Gin)
import (
    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/propagation"
)

# ... (see EXAMPLES.md)
```

**Msg queue propagation** (Kafka):

```python
# Producer
from opentelemetry.propagate import inject
from kafka import KafkaProducer

producer = KafkaProducer(bootstrap_servers=['kafka:9092'])

# ... (see EXAMPLES.md)
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

**Async ops** (Py asyncio):

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

→ Traces span multi svcs. Trace IDs consistent. Parent-child preserved.

**If err:**
- W3C propagator set: `otel.propagation.set_global_textmap(TraceContextTextMapPropagator())`
- Headers passed in HTTP req?
- Kafka: header support v0.11+
- Debug → log `traceparent` value
- Viz → find broken trace links

### Step 5: Sampling

Sampling → reduce trace vol + cost, keep visibility.

**Sampling strats**:

```python
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.sampling import (
    ParentBased,
    TraceIdRatioBased,
    StaticSampler,
    Decision
# ... (see EXAMPLES.md)
```

**Tail-based sampling w/ Tempo**:

`tempo.yaml`:

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

**Grafana Tempo TraceQL** → dynamic sampling:

```traceql
# Sample traces with errors
{ status = error }

# Sample slow traces (>1s)
{ duration > 1s }

# Sample specific services
{ resource.service.name = "checkout-service" }
```

→ Trace vol → target %. Err traces always sampled. Sampling in span metadata.

**If err:**
- Sampler applied before tracer provider init
- Sampling decision attr in exported spans?
- Tail sampling: `ingestion_burst_size_bytes` sufficient buffering
- Dropped traces: `otel_traces_dropped_total`
- Test synth high-vol traffic → validate rate

### Step 6: Correlate Traces w/ Metrics+Logs

Link traces → metrics+logs → unified obs.

**Add trace IDs → logs** (Py):

```python
import logging
from opentelemetry import trace

# Custom log formatter with trace context
class TraceFormatter(logging.Formatter):
    def format(self, record):
# ... (see EXAMPLES.md)
```

**Gen metrics from traces** (Tempo):

```yaml
# tempo.yaml
metrics_generator:
  registry:
    external_labels:
      cluster: production
  storage:
# ... (see EXAMPLES.md)
```

Prometheus metrics produced:
- `traces_service_graph_request_total` — req count between svcs
- `traces_span_metrics_duration_seconds` — span duration histogram
- `traces_spanmetrics_calls_total` — span call counts

**Query traces from metrics** (Grafana):

Exemplar support → Prometheus datasource:

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

Enable exemplars in dashboard:

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

→ Click metric exemplar → trace opens. Logs → trace IDs. Traces → logs. Unified debug.

**If err:**
- Exemplar support enabled Prometheus (v2.26+)
- Trace ID format match (32-char hex)
- Metrics gen enabled Tempo config
- Remote write reachable from Tempo
- Test: `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) and on() exemplar`

## Check

- [ ] Backend receives spans from all svcs
- [ ] Traces → parent-child correct across svcs
- [ ] Span attrs → semantic conv + biz ctx
- [ ] Ctx propagates across HTTP+MQ
- [ ] Sampling → target %
- [ ] Err traces always sampled
- [ ] Trace IDs in logs (correct format)
- [ ] Grafana → traces via exemplars
- [ ] Log panels → trace viewer links
- [ ] Retention matches storage policy

## Traps

- **Ctx not propagated**: Forget pass `context` → broken trace. Pass explicit.
- **Spans never ended**: Miss `defer span.End()` / `with` → mem leak
- **Over-instrument**: Span per fn → trace bloat. Focus svc boundary, DB, external API.
- **Miss err record**: No `span.RecordError()` → lose debug info. Always record errs.
- **High-card attrs**: Unbounded vals (user ID, bodies) → storage issues. Sample / aggregate.
- **Wrong span kind**: CLIENT vs SERVER vs INTERNAL → svc graph wrong. Follow semantic conv.
- **Sample before ctx**: Sampling respects parent. Use `ParentBased` → honor upstream.

## →

- `correlate-observability-signals` — unified debug w/ metrics+logs+traces
- `setup-prometheus-monitoring` — gen metrics from traces (Tempo gen)
- `configure-log-aggregation` — trace IDs in logs
- `build-grafana-dashboards` — viz trace-derived metrics + exemplar links
