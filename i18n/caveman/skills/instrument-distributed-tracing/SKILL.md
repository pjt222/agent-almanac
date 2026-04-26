---
name: instrument-distributed-tracing
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Instrument applications with OpenTelemetry for distributed tracing, including auto and manual
  instrumentation, context propagation, sampling strategies, and integration with Jaeger or Tempo.
  Use when debugging latency issues in distributed systems, understanding request flow across
  microservices, correlating traces with logs and metrics for root cause analysis, measuring
  end-to-end latency, or migrating from legacy tracing systems to OpenTelemetry.
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

Wire OpenTelemetry. Track requests cross microservices. Find slow spots.

## When Use

- Debug latency cross many services
- Follow request flow, see service deps
- Spot slow DB queries, slow API calls inside transaction
- Tie traces to logs and metrics for root cause
- Measure end-to-end latency: user req to response
- Migrate old tracing (Zipkin, Jaeger) to OpenTelemetry
- Prove SLO compliance via latency percentiles

## Inputs

- **Required**: List of services to instrument (languages, frameworks)
- **Required**: Backend choice (Jaeger, Tempo, Zipkin, vendor SaaS)
- **Optional**: Existing instrumentation libs (OpenTracing, Zipkin)
- **Optional**: Sampling strategy (percent, rate limit)
- **Optional**: Custom span attrs for business metadata

## Steps

> See [Extended Examples](references/EXAMPLES.md) for complete configuration files and templates.


### Step 1: Stand Up Backend

Deploy Jaeger or Grafana Tempo. Receive, store traces.

**Option A: Jaeger all-in-one** (dev/test):

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

**Option B: Grafana Tempo** (prod, scales):

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
# ... (see EXAMPLES.md for complete configuration)
```

For **prod with S3 storage**:

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

**Got:** Backend live. Ready for traces over OTLP. Jaeger UI or Grafana shows "no traces" first.

**If fail:**
- Ports in use? `netstat -tulpn | grep -E '(4317|16686|3200)'`
- Container logs: `docker logs jaeger` or `docker logs tempo`
- Test OTLP endpoint: `curl http://localhost:4318/v1/traces -v`
- For Tempo: check config syntax with `tempo -config.file=/etc/tempo.yaml -verify-config`

### Step 2: Instrument Apps (Auto)

Use OpenTelemetry auto-instrumentation. Common frameworks. Minimal code change.

**Python with Flask**:

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

**Go with Gin framework**:

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

**Node.js with Express**:

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

**Got:** Traces from instrumented services show in Jaeger UI or Grafana. HTTP requests auto-create spans.

**If fail:**
- Exporter endpoint reachable from app?
- Env vars set: `OTEL_EXPORTER_OTLP_ENDPOINT=http://tempo:4317`
- Turn on debug logs: `OTEL_LOG_LEVEL=debug` (Python), `OTEL_LOG_LEVEL=DEBUG` (Node.js)
- Test with simple span — verify export pipe
- Check for version conflicts across OTel packages

### Step 3: Add Manual Instrumentation

Custom spans for business logic, DB queries, external calls.

**Python manual spans**:

```python
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

def process_order(order_id):
    # Create a span for the entire operation
# ... (see EXAMPLES.md for complete configuration)
```

**Go manual spans**:

```go
import (
    "context"
    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/attribute"
    "go.opentelemetry.io/otel/codes"
    "go.opentelemetry.io/otel/trace"
# ... (see EXAMPLES.md for complete configuration)
```

**Span attrs best practice**:
- Use semantic conventions: `http.method`, `http.status_code`, `db.system`, `db.statement`
- Business context: `user.id`, `order.id`, `product.category`
- Resource IDs: `instance.id`, `region`, `availability_zone`
- Record errors: `span.RecordError(err)` + `span.SetStatus(codes.Error, message)`
- Events for milestones: `span.AddEvent("cache_miss")`

**Got:** Custom spans in trace view. Parent-child right. Attrs visible in span details. Errors highlighted.

**If fail:**
- Context propagation: parent span context passed to child?
- Span names descriptive, follow naming conventions?
- Spans ended? (`defer span.End()` in Go, `with` blocks in Python)
- Attr types: strings, ints, bools, floats only
- Semantic conventions: use standard attr names where applicable

### Step 4: Wire Context Propagation

Trace context must flow cross service boundaries, async ops.

**HTTP headers propagation** (W3C Trace Context):

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

**Message queue propagation** (Kafka):

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

**Async ops** (Python asyncio):

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

**Got:** Traces span many services. Trace IDs consistent cross boundaries. Parent-child preserved.

**If fail:**
- W3C Trace Context propagator configured? `otel.propagation.set_global_textmap(TraceContextTextMapPropagator())`
- Headers passed in HTTP requests?
- Kafka: headers supported by broker version (v0.11+)?
- Debug: log `traceparent` header value
- Use trace viz to spot broken links

### Step 5: Set Sampling Strategy

Sample to cut volume and cost. Keep visibility.

**Sampling strategies**:

```python
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.sampling import (
    ParentBased,
    TraceIdRatioBased,
    StaticSampler,
    Decision
# ... (see EXAMPLES.md for complete configuration)
```

**Tail-based sampling with Tempo**:

In `tempo.yaml`:

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

Use **Grafana Tempo's TraceQL** for dynamic sampling:

```traceql
# Sample traces with errors
{ status = error }

# Sample slow traces (>1s)
{ duration > 1s }

# Sample specific services
{ resource.service.name = "checkout-service" }
```

**Got:** Trace volume cut to target percent. Error traces always sampled. Sampling decision in trace metadata.

**If fail:**
- Sampler applied before tracer provider init?
- Sampling decision attr in exported spans?
- Tail sampling: enough buffering? (`ingestion_burst_size_bytes`)
- Watch dropped traces: `otel_traces_dropped_total` metric
- Test with synthetic high-volume traffic to validate rate

### Step 6: Tie Traces to Metrics and Logs

Link traces, metrics, logs. Unified observability.

**Add trace IDs to logs** (Python):

```python
import logging
from opentelemetry import trace

# Custom log formatter with trace context
class TraceFormatter(logging.Formatter):
    def format(self, record):
# ... (see EXAMPLES.md for complete configuration)
```

**Generate metrics from traces** (Tempo):

```yaml
# tempo.yaml
metrics_generator:
  registry:
    external_labels:
      cluster: production
  storage:
# ... (see EXAMPLES.md for complete configuration)
```

Makes Prometheus metrics:
- `traces_service_graph_request_total` - request count between services
- `traces_span_metrics_duration_seconds` - span duration histogram
- `traces_spanmetrics_calls_total` - span call counts

**Query traces from metrics** (Grafana):

Add exemplar support to Prometheus datasource in Grafana:

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

In Grafana dashboard, turn on exemplars:

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

**Got:** Click metric exemplar opens trace. Logs show trace IDs. Traces link to logs. Unified debugging cross signals.

**If fail:**
- Exemplar support on in Prometheus (v2.26+)?
- Trace ID format matches (32-char hex)?
- Metrics generator on in Tempo config?
- Remote write endpoint reachable from Tempo?
- Test exemplar queries: `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) and on() exemplar`

## Checks

- [ ] Backend receives spans from all instrumented services
- [ ] Traces show right parent-child cross services
- [ ] Span attrs include semantic conventions + business context
- [ ] Context propagates cross HTTP and message queues
- [ ] Sampling cuts volume to target percent
- [ ] Error traces always sampled (if error-aware sampling)
- [ ] Trace IDs in app logs, right format
- [ ] Grafana shows traces linked from metrics via exemplars
- [ ] Log panels have data links to trace viewer
- [ ] Trace retention matches storage policy

## Pitfalls

- **Context not propagated**: Forgot to pass `context` downstream → broken traces. Pass context explicit.
- **Spans never ended**: Missing `defer span.End()` (Go) or `with` blocks (Python) → open spans, memory leaks.
- **Over-instrumentation**: Span for every function bloats traces. Focus on service boundaries, DB calls, external APIs.
- **Missing error recording**: Skip `span.RecordError()` → lose debug info. Always record errors in spans.
- **High cardinality attrs**: Unbounded values (user IDs, request bodies) as span attrs → storage pain. Sample or aggregate.
- **Wrong span kind**: CLIENT vs SERVER vs INTERNAL mixed up → wrong service graph. Follow semantic conventions.
- **Sampling before context**: Sampling must respect parent context. Use `ParentBased` sampler.

## See Also

- `correlate-observability-signals` - Unified debugging across metrics, logs, traces by trace ID
- `setup-prometheus-monitoring` - Metrics from traces via Tempo generator
- `configure-log-aggregation` - Trace IDs in logs for correlation
- `build-grafana-dashboards` - Viz trace-derived metrics and exemplars
