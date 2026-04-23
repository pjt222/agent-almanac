---
name: correlate-observability-signals
locale: wenyan-ultra
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

# 關聯可觀測信號

合指、誌、跡於一，為統除錯通三柱。

## 用

- 跨系複事查
- 減 MTTR
- 築統可觀儀板
- 施分跡
- 孤具轉統可觀

## 入

- **必**：Prometheus（指）
- **必**：誌聚系（Loki、Elasticsearch、CloudWatch）
- **必**：分跡後端（Tempo、Jaeger、Zipkin）
- **可**：Grafana 統視
- **可**：OpenTelemetry 儀器

## 行

> 見 [Extended Examples](references/EXAMPLES.md) 備檔與模。


### 一：施跡脈傳

以 OpenTelemetry 加跡 ID 於諸誌與指：

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

Python 例：

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

**得：** 諸誌含 `trace_id`，誌跡可聯。

**敗：** 跡 ID 缺→察 OpenTelemetry SDK 初與脈傳。

### 二：設 Prometheus 中 exemplars

Exemplars 聯指至跡：

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

儀應以發 exemplars：

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

於 Prometheus 中查 exemplars：

```promql
# Histogram with exemplars
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

於 Grafana，exemplars 現為直方圖上之點，可聯跡。

**得：** Grafana 指圖顯 exemplars，擊之開對應跡。

**敗：** 驗 Prometheus 版 ≥2.26（exemplar 支），察 Grafana 資源設啟 exemplars。

### 三：以 RED 法築統儀板

RED 法：Rate、Errors、Duration（服之度）

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

**得：** 單儀板顯率、誤、時延+關聯誌。

**敗：** 板顯「No Data」→驗指名合儀器。

### 四：施資 USE 法

USE 法：Utilization、Saturation、Errors（如 CPU、存、碟之資）

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

**得：** 儀板顯諸 USE 維之資康。

**敗：** 保 node_exporter 行且採系指。

### 五：於 Loki 中聯誌至跡

設 Loki 取跡 ID：

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

於 Grafana，設 Loki 資源：

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

**得：** Loki 誌中擊跡 ID→於 Tempo 中開對應跡。

**敗：** 驗 regex 合誌式，察 Tempo 資源 UID。

### 六：建統事視

築板合諸信號：

```json
{
  "dashboard": {
    "title": "Incident Investigation",
    "templating": {
      "list": [
        {
# ... (see EXAMPLES.md for complete configuration)
```

事中流：

1. 高誤率警發
2. 值班者開 Grafana 板
3. 識定時之誤率尖
4. 擊時延直方圖之 exemplar 點→開跡
5. 跡顯慢庫查
6. 擊跨段「View Logs」→開該跡之誌
7. 誌揭致超時之具 SQL
8. 根因識於 <2 分

**得：** 單板除錯，躍於指/誌/跡間。

**敗：** 聯敗→察資源設與跡 ID 傳。

## 驗

- [ ] 諸應誌含跡 ID
- [ ] Prometheus 採 exemplars
- [ ] Grafana 板直方圖顯 exemplar 點
- [ ] 擊 exemplar 於 Tempo/Jaeger 開對應跡
- [ ] Loki 誌含可用之「View Trace」聯
- [ ] 關鍵服已建 RED 板
- [ ] 基建已建 USE 板
- [ ] 統事板於 GameDay 中測

## 忌

- **跡 ID 式不一**：OpenTelemetry 用 32 字符 hex，Jaeger 用 16。擇一
- **缺脈傳**：跡 ID 不跨服→分跡破。用 OpenTelemetry 自動儀器
- **Exemplar 過負**：過多 exemplars（>100k）緩 Prometheus。採樣高量指
- **鐘偏**：跡跨多服。設 NTP；鐘漂生跡序問
- **留策不合**：跡逾而指存→聯破。齊留策

## 參

- `setup-prometheus-monitoring` - 聯之指基
- `configure-log-aggregation` - 聯之誌基
- `instrument-distributed-tracing` - 聯之跡基
- `build-grafana-dashboards` - 統視層
