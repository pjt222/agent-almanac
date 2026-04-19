---
name: instrument-distributed-tracing
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
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

Implement OpenTelemetry distributed tracing to track requests across microservices and identify performance bottlenecks.

## When to Use

- Debugging latency issues in distributed systems with multiple services
- Understanding request flow and dependencies between microservices
- Identifying slow database queries or external API calls within a transaction
- Correlating traces with logs and metrics for root cause analysis
- Measuring end-to-end latency from user request to response
- Migrating from legacy tracing systems (Zipkin, Jaeger) to OpenTelemetry
- Establishing SLO compliance through detailed latency percentile tracking

## Inputs

- **Required**: List of services to instrument (languages and frameworks)
- **Required**: Tracing backend choice (Jaeger, Tempo, Zipkin, or vendor SaaS)
- **Optional**: Existing instrumentation libraries (OpenTracing, Zipkin)
- **Optional**: Sampling strategy requirements (percentage, rate limiting)
- **Optional**: Custom span attributes for business-specific metadata

## Procedure

> See [Extended Examples](references/EXAMPLES.md) for complete configuration files and templates.


### Step 1: Set Up Tracing Backend

Deploy Jaeger or Grafana Tempo to receive and store traces.

**Option A: Jaeger all-in-one** (development/testing):

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

**Option B: Grafana Tempo** (production, scalable):

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

**Tempo configuration** (`tempo.yaml`):

```yaml
server:
  http_listen_port: 3200

distributor:
  receivers:
    jaeger:
# ... (see EXAMPLES.md for complete configuration)
```

For **production with S3 storage**:

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

**Expected:** Tracing backend accessible, ready to receive traces via OTLP, Jaeger UI or Grafana shows "no traces" initially.

**On failure:**
- Verify ports not already in use: `netstat -tulpn | grep -E '(4317|16686|3200)'`
- Check container logs: `docker logs jaeger` or `docker logs tempo`
- Test OTLP endpoint: `curl http://localhost:4318/v1/traces -v`
- For Tempo: validate config syntax with `tempo -config.file=/etc/tempo.yaml -verify-config`

### Step 2: Instrument Applications (Auto-Instrumentation)

Use OpenTelemetry auto-instrumentation for common frameworks to minimize code changes.

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

**Expected:** Traces from instrumented services appear in Jaeger UI or Grafana, HTTP requests automatically create spans.

**On failure:**
- Check exporter endpoint is reachable from application
- Verify environment variables: `OTEL_EXPORTER_OTLP_ENDPOINT=http://tempo:4317`
- Enable debug logging: `OTEL_LOG_LEVEL=debug` (Python), `OTEL_LOG_LEVEL=DEBUG` (Node.js)
- Test with simple span: manually create a span to verify export pipeline
- Check for version conflicts between OpenTelemetry packages

### Step 3: Add Manual Instrumentation

Create custom spans for business logic, database queries, and external calls.

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

**Span attributes best practices**:
- Use semantic conventions: `http.method`, `http.status_code`, `db.system`, `db.statement`
- Add business context: `user.id`, `order.id`, `product.category`
- Include resource identifiers: `instance.id`, `region`, `availability_zone`
- Record errors: `span.RecordError(err)` and `span.SetStatus(codes.Error, message)`
- Add events for significant milestones: `span.AddEvent("cache_miss")`

**Expected:** Custom spans appear in trace view, parent-child relationships correct, attributes visible in span details, errors highlighted.

**On failure:**
- Verify context propagation: parent span context passed to child
- Check span names are descriptive and follow naming conventions
- Ensure spans are ended (use `defer span.End()` in Go, `with` blocks in Python)
- Review attribute types: strings, ints, bools, floats only
- Validate semantic conventions: use standard attribute names where applicable

### Step 4: Implement Context Propagation

Ensure trace context flows across service boundaries and async operations.

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

**Async operations** (Python asyncio):

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

**Expected:** Traces span multiple services, trace IDs consistent across service boundaries, parent-child relationships preserved.

**On failure:**
- Verify W3C Trace Context propagator configured: `otel.propagation.set_global_textmap(TraceContextTextMapPropagator())`
- Check headers are passed in HTTP requests
- For Kafka: ensure headers supported by broker version (v0.11+)
- Debug with header inspection: log `traceparent` header value
- Use trace visualization to identify broken trace links

### Step 5: Configure Sampling Strategies

Implement sampling to reduce trace volume and cost while maintaining visibility.

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

Configure in `tempo.yaml`:

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

**Expected:** Trace volume reduced to target percentage, error traces always sampled, sampling decision visible in trace metadata.

**On failure:**
- Verify sampler applied before tracer provider initialization
- Check sampling decision attribute in exported spans
- For tail sampling: ensure sufficient buffering (`ingestion_burst_size_bytes`)
- Monitor dropped traces: `otel_traces_dropped_total` metric
- Test with synthetic high-volume traffic to validate sampling rate

### Step 6: Correlate Traces with Metrics and Logs

Link traces to metrics and logs for unified observability.

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

This generates Prometheus metrics:
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

In Grafana dashboard, enable exemplars:

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

**Expected:** Clicking metric exemplars opens trace, logs show trace IDs, traces link to logs, unified debugging across signals.

**On failure:**
- Verify exemplar support enabled in Prometheus (requires v2.26+)
- Check trace ID format matches (32-char hex)
- Ensure metrics generator enabled in Tempo config
- Validate remote write endpoint accessible from Tempo
- Test exemplar queries: `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) and on() exemplar`

## Validation

- [ ] Tracing backend receives spans from all instrumented services
- [ ] Traces show correct parent-child relationships across services
- [ ] Span attributes include semantic conventions and business context
- [ ] Context propagates correctly across HTTP calls and message queues
- [ ] Sampling strategy reduces trace volume to target percentage
- [ ] Error traces always sampled (if using error-aware sampling)
- [ ] Trace IDs appear in application logs with correct format
- [ ] Grafana shows traces linked from metrics via exemplars
- [ ] Log panels have data links to trace viewer
- [ ] Trace retention matches configured storage policy

## Common Pitfalls

- **Context not propagated**: Forgetting to pass `context` to downstream calls breaks traces. Always pass context explicitly.
- **Spans never ended**: Missing `defer span.End()` (Go) or `with` blocks (Python) causes spans to remain open and memory leaks.
- **Over-instrumentation**: Creating spans for every function causes trace bloat. Focus on service boundaries, database calls, and external APIs.
- **Missing error recording**: Not calling `span.RecordError()` loses valuable debugging information. Always record errors in spans.
- **High cardinality attributes**: Using unbounded values (user IDs, request bodies) as span attributes causes storage issues. Use sampling or aggregate labels.
- **Incorrect span kind**: Using wrong span kind (CLIENT vs SERVER vs INTERNAL) affects service graph generation. Follow semantic conventions.
- **Sampling before context**: Sampling decisions must respect parent trace context. Use `ParentBased` sampler to honor upstream sampling.

## Related Skills

- `correlate-observability-signals` - Unified debugging with metrics, logs, and traces linked by trace IDs
- `setup-prometheus-monitoring` - Generate metrics from traces using Tempo metrics generator
- `configure-log-aggregation` - Add trace IDs to logs for correlation with distributed traces
- `build-grafana-dashboards` - Visualize trace-derived metrics and exemplar links in dashboards
