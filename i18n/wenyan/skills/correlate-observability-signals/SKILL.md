---
name: correlate-observability-signals
locale: wenyan
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

# 聯可觀之訊

聯度、誌、跡三柱為一，以統合而除三界之弊。

## 用時

- 究跨系統之繁亂
- 減 MTTR（平均解決之時）
- 建統合之可觀儀盤
- 施散式之跡
- 由孤工具轉統合可觀

## 入

- **必要**：Prometheus（度）
- **必要**：誌聚之系（Loki、Elasticsearch、CloudWatch）
- **必要**：散跡之後端（Tempo、Jaeger、Zipkin）
- **可選**：Grafana 以作統合之視
- **可選**：OpenTelemetry 之儀化

## 法

> 全配置文件與樣板參 [Extended Examples](references/EXAMPLES.md)。


### 第一步：施跡脈之傳

以 OpenTelemetry 置跡 ID 於諸誌與度：

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

**得：** 諸誌含 `trace_id` 之域，誌與跡可聯。

**敗則：** 若跡 ID 失，察 OpenTelemetry SDK 之初與脈之傳。

### 第二步：設 Prometheus 之範例

範例聯度於跡：

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

儀化應用以發範例：

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

於 Prometheus 查範例：

```promql
# Histogram with exemplars
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

於 Grafana，範例現為直方圖上之點，聯至跡。

**得：** Grafana 顯範例於度圖，點之則開相應之跡。

**敗則：** 驗 Prometheus 版本 ≥2.26（支援範例），查 Grafana 源設啟範例。

### 第三步：以 RED 法建統合儀盤

RED 法：率、訛、時（施於服）

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

**得：** 一儀盤顯率、訛、時，兼聯之誌。

**敗則：** 若盤顯「無數據」，驗度之名與儀化相合。

### 第四步：施 USE 法於諸資

USE 法：用、飽、訛（施於 CPU、記憶、盤等資）

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

**得：** 儀盤顯資健於諸 USE 維度。

**敗則：** 確 node_exporter 運而採系之度。

### 第五步：於 Loki 聯誌至跡

設 Loki 以抽跡 ID：

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

於 Grafana 設 Loki 源：

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

**得：** 點 Loki 誌中之跡 ID 則開 Tempo 之跡。

**敗則：** 驗正則合誌之式，察 Tempo 源之 UID。

### 第六步：建統合事件之視

建一盤聚諸訊：

```json
{
  "dashboard": {
    "title": "Incident Investigation",
    "templating": {
      "list": [
        {
# ... (see EXAMPLES.md for complete configuration)
```

事件之流：

1. 高訛率觸警
2. 值班師開 Grafana 盤
3. 識某時訛率之峰
4. 點時直方圖上之範例 → 開跡
5. 跡顯庫之慢查
6. 點跨距上之「觀誌」 → 開該跡之誌
7. 誌示具體 SQL 查致超時
8. 根因識於二分鐘內

**得：** 一玻觀諸訊，跳於度、誌、跡間除弊。

**敗則：** 若聯失效，察諸源設與跡 ID 之傳。

## 驗

- [ ] 諸應用誌皆含跡 ID
- [ ] Prometheus 採範例
- [ ] Grafana 盤於直方圖顯範例點
- [ ] 點範例則於 Tempo／Jaeger 開相應之跡
- [ ] Loki 誌有可行之「觀跡」聯
- [ ] 要服已建 RED 盤
- [ ] 基建已建 USE 盤
- [ ] 統合事件盤於 GameDay 已試

## 陷

- **跡 ID 式不一**：OpenTelemetry 用 32 字元十六進位，Jaeger 用 16 字元。宜擇其一。
- **脈傳失**：若跡 ID 不跨服，散跡斷。用 OpenTelemetry 自動儀化。
- **範例過**：範例過多（>100k）則 Prometheus 緩。高量度宜採樣。
- **鐘偏**：跡跨諸服。確設 NTP；鐘偏致跡序誤。
- **留存不合**：若跡先於度過期，聯斷。諸留存期宜合。

## 參

- `setup-prometheus-monitoring` — 聯之度根基
- `configure-log-aggregation` — 聯之誌根基
- `instrument-distributed-tracing` — 聯之跡根基
- `build-grafana-dashboards` — 統合視之層
