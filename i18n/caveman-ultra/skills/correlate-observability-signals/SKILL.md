---
name: correlate-observability-signals
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Unify metrics, logs, and traces for cohesive debugging. Implement exemplars
  for log-to-trace linking, build unified dashboards using RED/USE methods,
  and enable rapid root cause analysis across observability signals. Use when
  investigating complex incidents spanning multiple systems, reducing mean time
  to resolution, implementing distributed tracing, or moving from siloed tools
  to a unified observability platform.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: observability
  complexity: advanced
  language: multi
  tags: correlation, exemplars, red-method, use-method, unified-observability
---

# Correlate Observability Signals

Metrics + logs + traces → unified debug across 3 pillars.

## Use When

- Multi-sys incident invest
- MTTR reduction
- Unified obs dashboards
- Distrib tracing impl
- Siloed tools → unified

## In

- **Required**: Prometheus (metrics)
- **Required**: Log agg sys (Loki, Elasticsearch, CloudWatch)
- **Required**: Tracing backend (Tempo, Jaeger, Zipkin)
- **Optional**: Grafana viz
- **Optional**: OpenTelemetry instrum

## Do

> See [Extended Examples](references/EXAMPLES.md) for complete configuration files and templates.

### Step 1: Trace Context Propagation

Add trace IDs → all logs/metrics via OpenTelemetry:

```go
// Go example: Propagate trace context to logs
package main

import (
    "context"
    "log"

    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/trace"
)

func handleRequest(ctx context.Context, userID string) {
    // Extract trace context
    span := trace.SpanFromContext(ctx)
    traceID := span.SpanContext().TraceID().String()

    // Include trace ID in structured logs
    log.Printf("trace_id=%s user_id=%s action=process_request", traceID, userID)

    // Business logic here
    processData(ctx, userID)
}

func processData(ctx context.Context, userID string) {
    tracer := otel.Tracer("my-service")
    ctx, span := tracer.Start(ctx, "processData")
    defer span.End()

    traceID := span.SpanContext().TraceID().String()
    log.Printf("trace_id=%s user_id=%s action=process_data", traceID, userID)

    // More work
}
```

Python:

```python
# Python: Flask with OpenTelemetry
from flask import Flask, request
from opentelemetry import trace
from opentelemetry.instrumentation.flask import FlaskInstrumentor
import logging

app = Flask(__name__)
FlaskInstrumentor().instrument_app(app)

logging.basicConfig(
    format='%(asctime)s trace_id=%(otelTraceID)s span_id=%(otelSpanID)s %(message)s',
    level=logging.INFO
)

@app.route('/api/users/<user_id>')
def get_user(user_id):
    span = trace.get_current_span()
    trace_id = format(span.get_span_context().trace_id, '032x')

    logging.info(f"Fetching user {user_id}", extra={
        'otelTraceID': trace_id,
        'otelSpanID': format(span.get_span_context().span_id, '016x')
    })

    # Business logic
    return {"user_id": user_id}
```

→ Logs have `trace_id` → log-to-trace correlation works.

If err: no trace IDs → check OTel SDK init + ctx propagation.

### Step 2: Prometheus Exemplars

Exemplars → link metrics ↔ traces:

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  # Enable exemplar storage
  exemplars:
    max_exemplars: 100000  # Per TSDB block

scrape_configs:
  - job_name: 'api-service'
    static_configs:
      - targets: ['api-service:8080']
    # Scrape exemplars
    metric_relabel_configs:
      - source_labels: [__name__]
        regex: 'http_request_duration_seconds.*'
        action: keep
```

Emit exemplars:

```go
// Go: Emit exemplars with Prometheus histogram
package main

import (
    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promauto"
    "go.opentelemetry.io/otel/trace"
)

var httpDuration = promauto.NewHistogramVec(
    prometheus.HistogramOpts{
        Name:    "http_request_duration_seconds",
        Help:    "HTTP request duration",
        Buckets: prometheus.DefBuckets,
    },
    []string{"method", "endpoint", "status"},
)

func recordRequest(ctx context.Context, method, endpoint, status string, duration float64) {
    // Get trace ID for exemplar
    span := trace.SpanFromContext(ctx)
    traceID := span.SpanContext().TraceID().String()

    // Record metric with exemplar
    observer := httpDuration.WithLabelValues(method, endpoint, status)
    observer.(prometheus.ExemplarObserver).ObserveWithExemplar(
        duration,
        prometheus.Labels{"trace_id": traceID},
    )
}
```

Query:

```promql
# Histogram with exemplars
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

Grafana → exemplar dots on histograms → click → trace.

→ Grafana exemplars in graphs, click opens trace.

If err: check Prometheus ≥2.26 + Grafana data source exemplar config.

### Step 3: RED Dashboard

RED: Rate, Errors, Duration (services).

```json
{
  "dashboard": {
    "title": "API Service - RED Dashboard",
    "panels": [
      {
        "title": "Request Rate (req/s)",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total{job=\"api-service\"}[5m])) by (endpoint)",
            "legendFormat": "{{ endpoint }}"
          }
        ],
        "exemplars": true
      },
      {
        "title": "Error Rate (%)",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total{job=\"api-service\", status=~\"5..\"}[5m])) / sum(rate(http_requests_total{job=\"api-service\"}[5m])) * 100",
            "legendFormat": "Error %"
          }
        ],
        "exemplars": true
      },
      {
        "title": "Request Duration (p50, p95, p99)",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.50, rate(http_request_duration_seconds_bucket{job=\"api-service\"}[5m]))",
            "legendFormat": "p50"
          },
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job=\"api-service\"}[5m]))",
            "legendFormat": "p95"
          },
          {
            "expr": "histogram_quantile(0.99, rate(http_request_duration_seconds_bucket{job=\"api-service\"}[5m]))",
            "legendFormat": "p99"
          }
        ],
        "exemplars": true
      },
      {
        "title": "Correlated Logs",
        "type": "logs",
        "datasource": "Loki",
        "targets": [
          {
            "expr": "{job=\"api-service\"} |= \"error\""
          }
        ],
        "options": {
          "showTime": true,
          "enableLogDetails": true
        }
      }
    ]
  }
}
```

→ One dashboard: rate + errors + duration + logs.

If err: "No Data" → metric name mismatch.

### Step 4: USE Method for Resources

USE: Util, Saturation, Errors (CPU/mem/disk).

```json
{
  "dashboard": {
    "title": "Node Resources - USE Dashboard",
    "panels": [
      {
        "title": "CPU Utilization (%)",
        "type": "graph",
        "targets": [
          {
            "expr": "100 - (avg(rate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
            "legendFormat": "CPU Usage %"
          }
        ]
      },
      {
        "title": "CPU Saturation (Load Average)",
        "type": "graph",
        "targets": [
          {
            "expr": "node_load1",
            "legendFormat": "1min load"
          },
          {
            "expr": "node_load5",
            "legendFormat": "5min load"
          },
          {
            "expr": "count(node_cpu_seconds_total{mode=\"idle\"})",
            "legendFormat": "CPU cores (threshold)"
          }
        ]
      },
      {
        "title": "Memory Utilization (%)",
        "type": "graph",
        "targets": [
          {
            "expr": "(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100",
            "legendFormat": "Memory Usage %"
          }
        ]
      },
      {
        "title": "Memory Saturation (Page Faults)",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(node_vmstat_pgmajfault[5m])",
            "legendFormat": "Major page faults/s"
          }
        ]
      },
      {
        "title": "Disk Utilization (%)",
        "type": "graph",
        "targets": [
          {
            "expr": "(node_filesystem_size_bytes - node_filesystem_free_bytes) / node_filesystem_size_bytes * 100",
            "legendFormat": "{{ device }}"
          }
        ]
      },
      {
        "title": "Disk Saturation (IO Wait %)",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(node_cpu_seconds_total{mode=\"iowait\"}[5m]) * 100",
            "legendFormat": "IO Wait %"
          }
        ]
      }
    ]
  }
}
```

→ Res health across all USE dims.

If err: ensure node_exporter scraping.

### Step 5: Link Loki Logs → Traces

```yaml
# loki-config.yml
schema_config:
  configs:
    - from: 2024-01-01
      store: boltdb-shipper
      object_store: s3
      schema: v11
      index:
        prefix: index_
        period: 24h

# Derived fields for trace linking
query_config:
  derived_fields:
    - name: TraceID
      source: trace_id
      url: 'https://tempo.company.com/trace/${__value.raw}'
      urlDisplayLabel: 'View Trace'
```

Grafana Loki data source:

```json
{
  "name": "Loki",
  "type": "loki",
  "url": "http://loki:3100",
  "jsonData": {
    "derivedFields": [
      {
        "datasourceUid": "tempo-uid",
        "matcherRegex": "trace_id=(\\w+)",
        "name": "TraceID",
        "url": "$${__value.raw}"
      }
    ]
  }
}
```

→ Click trace ID in Loki → opens Tempo trace.

If err: regex mismatch / wrong Tempo UID.

### Step 6: Unified Incident View

```json
{
  "dashboard": {
    "title": "Incident Investigation",
    "templating": {
      "list": [
        {
# ... (see EXAMPLES.md for complete configuration)
```

Incident workflow:

1. Alert → high err rate
2. On-call opens Grafana
3. Spot spike at time T
4. Click exemplar on duration → trace
5. Trace → slow DB query
6. "View Logs" on span → trace logs
7. Logs → specific SQL timeout
8. Root cause <2 min

→ Single pane, jump metrics/logs/traces.

If err: links broken → check data sources + trace ID propagation.

## Check

- [ ] Trace IDs in all app logs
- [ ] Prometheus scraping exemplars
- [ ] Grafana shows exemplar dots
- [ ] Exemplar click → trace in Tempo/Jaeger
- [ ] Loki "View Trace" links work
- [ ] RED dashboard for key services
- [ ] USE dashboard for infra
- [ ] Incident dashboard GameDay tested

## Traps

- **Trace ID format**: OTel = 32 hex, Jaeger = 16. Pick one.
- **Missing ctx propagation**: IDs don't flow → distrib tracing breaks. Use OTel auto-instrum.
- **Exemplar overload**: >100k → slow Prometheus. Sample high-vol.
- **Clock skew**: Traces span services → NTP required, drift → order issues.
- **Retention mismatch**: Traces expire < metrics → correlation breaks. Align retention.

## →

- `setup-prometheus-monitoring` — metrics foundation
- `configure-log-aggregation` — logs foundation
- `instrument-distributed-tracing` — trace foundation
- `build-grafana-dashboards` — unified viz
