---
name: correlate-observability-signals
locale: wenyan-lite
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

# 關聯可觀測性信號

連接指標、日誌、追蹤以統合除錯，貫通可觀測性三柱。

## 適用時機

- 查橫跨多系統之複雜事故
- 減 MTTR（平均解決時間）
- 建統一之可觀測性儀表板
- 施分散追蹤
- 由孤立工具移至統一可觀測性

## 輸入

- **必要**：Prometheus（指標）
- **必要**：日誌聚合系統（Loki、Elasticsearch、CloudWatch）
- **必要**：分散追蹤後端（Tempo、Jaeger、Zipkin）
- **選擇性**：Grafana 以行統一可視化
- **選擇性**：OpenTelemetry 儀器化

## 步驟

> 完整配置檔與範本見 [Extended Examples](references/EXAMPLES.md)。


### 步驟一：施追蹤脈絡傳播

以 OpenTelemetry 加追蹤 ID 於所有日誌與指標：

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

Python 之例：

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

**預期：** 所有日誌含 `trace_id` 欄，令日誌-追蹤可關聯。

**失敗時：** 若追蹤 ID 缺，察 OpenTelemetry SDK 初始化及脈絡傳播。

### 步驟二：配置 Prometheus 中之 exemplars

exemplars 連指標於追蹤：

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

儀器化應用以發 exemplars：

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

於 Prometheus 查 exemplars：

```promql
# Histogram with exemplars
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

於 Grafana，exemplars 顯為直方圖上之點，可連至追蹤。

**預期：** Grafana 於指標圖中顯 exemplars，點之則開對應追蹤。

**失敗時：** 驗 Prometheus 版本 ≥2.26（支援 exemplar），察 Grafana 資料源配置啟 exemplars。

### 步驟三：以 RED 法建統一儀表板

RED 法：率（Rate）、誤（Errors）、延（Duration）——用於服務。

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

**預期：** 單一儀表板顯率、誤、延與關聯日誌。

**失敗時：** 若面板顯「No Data」，驗指標名合儀器化。

### 步驟四：以 USE 法施於資源

USE 法：利用（Utilization）、飽和（Saturation）、誤（Errors）——用於資源如 CPU、記憶體、磁碟。

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

**預期：** 儀表板顯各 USE 維度之資源健康。

**失敗時：** 確保 node_exporter 運行，擷取系統指標。

### 步驟五：Loki 中連日誌於追蹤

配 Loki 以萃取追蹤 ID：

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

於 Grafana，配 Loki 資料源：

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

**預期：** 點 Loki 日誌中之追蹤 ID 則於 Tempo 中開對應追蹤。

**失敗時：** 驗正則合日誌格式，察 Tempo 資料源 UID。

### 步驟六：建統一事故視圖

造一儀表板，集所有信號：

```json
{
  "dashboard": {
    "title": "Incident Investigation",
    "templating": {
      "list": [
        {
# ... (see EXAMPLES.md for complete configuration)
```

事故時之工作流：

1. 告警觸於高誤率
2. 值班工程師開 Grafana 儀表板
3. 辨特定時之誤率尖峰
4. 點延遲直方圖上之 exemplar 點——開追蹤
5. 追蹤顯緩之資料庫查詢
6. 點 span 上之「View Logs」——開該追蹤之日誌
7. 日誌揭致逾時之具體 SQL 查詢
8. 2 分內辨根因

**預期：** 單一視窗以除錯，可於指標、日誌、追蹤間跳。

**失敗時：** 若連結不行，察資料源配置與追蹤 ID 傳播。

## 驗證

- [ ] 追蹤 ID 存於所有應用日誌
- [ ] Prometheus 擷取 exemplars
- [ ] Grafana 儀表板於直方圖顯 exemplar 點
- [ ] 點 exemplar 則於 Tempo/Jaeger 開對應追蹤
- [ ] Loki 日誌有可用之「View Trace」連結
- [ ] 已為關鍵服務建 RED 儀表板
- [ ] 已為基礎設施建 USE 儀表板
- [ ] GameDay 時已測統一事故儀表板

## 常見陷阱

- **追蹤 ID 格式不一**：OpenTelemetry 用 32 字十六進制，Jaeger 用 16 字。擇一
- **脈絡傳播缺失**：追蹤 ID 若不跨服務流，分散追蹤崩。用 OpenTelemetry 自動儀器化
- **exemplar 過載**：exemplars 過多（>100k）可緩 Prometheus。取樣高量指標
- **時鐘偏移**：追蹤跨多服務。確保 NTP 已配；時鐘漂致追蹤序錯
- **資料保留不配**：追蹤若先於指標過期，關聯斷。對齊保留策略

## 相關技能

- `setup-prometheus-monitoring` - 關聯之指標基礎
- `configure-log-aggregation` - 關聯之日誌基礎
- `instrument-distributed-tracing` - 關聯之追蹤基礎
- `build-grafana-dashboards` - 統一之可視化層
