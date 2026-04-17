---
name: correlate-observability-signals
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
  locale: es
  source_locale: en
  source_commit: a87e5e0380bbe51f65cb0662d60c10030a81f255
  translator: claude
  translation_date: "2026-03-17"
---

# Correlate Observability Signals

Connect metrics, logs, and traces for unified debugging across the three pillars of observability.

## Cuándo Usar

- Investigating complex incidents that span multiple systems
- Reducing MTTR (mean time to resolution)
- Building unified observability dashboards
- Implementing distributed tracing
- Moving from siloed tools to unified observability

## Entradas

- **Requerido**: Prometheus (metrics)
- **Requerido**: Log aggregation system (Loki, Elasticsearch, CloudWatch)
- **Requerido**: Distributed tracing backend (Tempo, Jaeger, Zipkin)
- **Opcional**: Grafana for unified visualization
- **Opcional**: OpenTelemetry instrumentation

## Procedimiento

> See [Extended Examples](references/EXAMPLES.md) for complete configuration files and templates.


### Paso 1: Implement Trace Context Propagation

Add trace IDs to all logs and metrics using OpenTelemetry:

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

Python example:

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

**Esperado:** All logs include `trace_id` field, enabling log-to-trace correlation.

**En caso de fallo:** If trace IDs missing, check OpenTelemetry SDK initialization and context propagation.

### Paso 2: Configure Exemplars in Prometheus

Exemplars link metrics to traces:

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

Instrument application to emit exemplars:

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

Query exemplars in Prometheus:

```promql
# Histogram with exemplars
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

In Grafana, exemplars appear as dots on histogram graphs that link to traces.

**Esperado:** Grafana shows exemplars in metric graphs, clicking opens corresponding trace.

**En caso de fallo:** Verify Prometheus version ≥2.26 (exemplar support), check Grafana data source config enables exemplars.

### Paso 3: Build Unified Dashboard with RED Method

RED Method: Rate, Errors, Duration (for services)

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

**Esperado:** Single dashboard showing rate, errors, duration + correlated logs.

**En caso de fallo:** If panels show "No Data", verify metric names match your instrumentation.

### Paso 4: Implement USE Method for Resources

USE Method: Utilization, Saturation, Errors (for resources like CPU, memory, disk)

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

**Esperado:** Dashboard showing resource health across all USE dimensions.

**En caso de fallo:** Ensure node_exporter is running and scraping system metrics.

### Paso 5: Link Logs to Traces in Loki

Configure Loki to extract trace IDs:

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

In Grafana, configure Loki data source:

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

**Esperado:** Clicking trace ID in Loki logs opens corresponding trace in Tempo.

**En caso de fallo:** Verify regex matches your log format, check Tempo data source UID.

### Paso 6: Create Unified Incident View

Build a dashboard that brings all signals together:

```json
{
  "dashboard": {
    "title": "Incident Investigation",
    "templating": {
      "list": [
        {
# ... (see EXAMPLES.md for complete configuration)
```

Workflow during incident:

1. Alert fires for high error rate
2. On-call engineer opens Grafana dashboard
3. Identifies spike in error rate at specific time
4. Clicks exemplar dot on duration histogram → opens trace
5. Trace shows slow database query
6. Clicks "View Logs" on span → opens logs for that trace
7. Logs reveal specific SQL query causing timeout
8. Root cause identified in <2 minutes

**Esperado:** Single pane of glass for debugging, jumping between metrics/logs/traces.

**En caso de fallo:** If links don't work, check data source configurations and trace ID propagation.

## Validación

- [ ] Trace IDs present in all application logs
- [ ] Prometheus scraping exemplars
- [ ] Grafana dashboards show exemplar dots on histograms
- [ ] Clicking exemplar opens corresponding trace in Tempo/Jaeger
- [ ] Loki logs have "View Trace" links that work
- [ ] RED dashboard created for key services
- [ ] USE dashboard created for infrastructure
- [ ] Unified incident dashboard tested during GameDay

## Errores Comunes

- **Inconsistent trace ID format**: OpenTelemetry uses 32-char hex, Jaeger uses 16-char. Choose one.
- **Missing context propagation**: If trace IDs don't flow across services, distributed tracing breaks. Use OpenTelemetry auto-instrumentation.
- **Exemplar overload**: Too many exemplars (>100k) can slow Prometheus. Sample high-volume metrics.
- **Clock skew**: Traces span multiple services. Ensure NTP is configured; clock drift causes trace ordering issues.
- **Data retention mismatch**: If traces expire before metrics, correlation breaks. Align retention policies.

## Habilidades Relacionadas

- `setup-prometheus-monitoring` - metrics foundation for correlation
- `configure-log-aggregation` - logs foundation for correlation
- `instrument-distributed-tracing` - traces foundation for correlation
- `build-grafana-dashboards` - unified visualization layer
