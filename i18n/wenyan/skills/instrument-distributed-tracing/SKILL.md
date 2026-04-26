---
name: instrument-distributed-tracing
locale: wenyan
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

# 佈分散追蹤之器

以 OpenTelemetry 施分散追蹤，跨微服務追請求，以辨性能之瓶頸。

## 用時

- 多服務分散系統有延時疑難，需究其故
- 欲明微服務間請求之流與所依
- 單次交易中，辨緩慢之資料庫查詢或外部 API 呼叫
- 以追蹤配合日誌與指標，溯根因
- 度從用者請求至回應之端到端延時
- 自舊追蹤系統（Zipkin、Jaeger）遷至 OpenTelemetry
- 以詳盡延時百分位追蹤，立 SLO 合規

## 入

- **必要**：待佈儀之服務表（其語言與框架）
- **必要**：追蹤後端之選（Jaeger、Tempo、Zipkin 或商用 SaaS）
- **可選**：既有佈儀庫（OpenTracing、Zipkin）
- **可選**：抽樣策略之需（百分比、限流）
- **可選**：業務專用之自訂 span 屬性

## 法

> 完整配置檔案與樣板，見 [Extended Examples](references/EXAMPLES.md)。


### 第一步：立追蹤後端

佈 Jaeger 或 Grafana Tempo 以收存追蹤。

**甲：Jaeger all-in-one**（開發／測試用）：

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

**乙：Grafana Tempo**（產線，可擴展）：

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

**Tempo 之配置**（`tempo.yaml`）：

```yaml
server:
  http_listen_port: 3200

distributor:
  receivers:
    jaeger:
# ... (see EXAMPLES.md for complete configuration)
```

**產線以 S3 存之**：

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

**得：**追蹤後端可達，備受 OTLP 追蹤之傳；Jaeger UI 或 Grafana 初顯「無追蹤」。

**敗則：**
- 驗埠是否占用：`netstat -tulpn | grep -E '(4317|16686|3200)'`
- 察容器日誌：`docker logs jaeger` 或 `docker logs tempo`
- 試 OTLP 端點：`curl http://localhost:4318/v1/traces -v`
- Tempo：以 `tempo -config.file=/etc/tempo.yaml -verify-config` 驗配置語法

### 第二步：佈應用之儀（自動佈儀）

用 OpenTelemetry 之自動佈儀於常見框架，以省改碼之勞。

**Python 用 Flask**：

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

**Go 用 Gin 框架**：

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

**Node.js 用 Express**：

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

**得：**已佈儀服務之追蹤現於 Jaeger UI 或 Grafana，HTTP 請求自動生 span。

**敗則：**
- 察匯出端點自應用是否可達
- 驗環境變數：`OTEL_EXPORTER_OTLP_ENDPOINT=http://tempo:4317`
- 啟除錯日誌：`OTEL_LOG_LEVEL=debug`（Python）、`OTEL_LOG_LEVEL=DEBUG`（Node.js）
- 以簡 span 試：手建一 span 以驗匯出管線
- 察 OpenTelemetry 諸包間有無版本衝突

### 第三步：加手動佈儀

為業務邏輯、資料庫查詢與外部呼叫建自訂 span。

**Python 手動 span**：

```python
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

def process_order(order_id):
    # Create a span for the entire operation
# ... (see EXAMPLES.md for complete configuration)
```

**Go 手動 span**：

```go
import (
    "context"
    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/attribute"
    "go.opentelemetry.io/otel/codes"
    "go.opentelemetry.io/otel/trace"
# ... (see EXAMPLES.md for complete configuration)
```

**span 屬性之善法**：
- 用語義約定：`http.method`、`http.status_code`、`db.system`、`db.statement`
- 添業務脈絡：`user.id`、`order.id`、`product.category`
- 含資源標識：`instance.id`、`region`、`availability_zone`
- 記錯：`span.RecordError(err)` 與 `span.SetStatus(codes.Error, message)`
- 為要事加 event：`span.AddEvent("cache_miss")`

**得：**自訂 span 現於追蹤視圖，父子關係正確，屬性於 span 詳情可見，錯誤顯明。

**敗則：**
- 驗脈絡傳播：父 span 脈絡傳予子
- 察 span 名是否具述性，循命名約定
- 確 span 已終（Go 用 `defer span.End()`，Python 用 `with` 區塊）
- 審屬性型別：限字串、整數、布林、浮點
- 驗語義約定：宜用標準屬性名

### 第四步：施脈絡傳播

確追蹤脈絡跨服務界與非同步作業無礙。

**HTTP 標頭傳播**（W3C Trace Context）：

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

**訊息佇列傳播**（Kafka）：

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

**非同步作業**（Python asyncio）：

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

**得：**追蹤跨數服務，trace ID 跨界一致，父子關係得保。

**敗則：**
- 驗已設 W3C Trace Context 傳播器：`otel.propagation.set_global_textmap(TraceContextTextMapPropagator())`
- 察 HTTP 請求是否傳標頭
- Kafka：確 broker 版本支援標頭（v0.11 以上）
- 以檢標頭除錯：記 `traceparent` 標頭之值
- 用追蹤視覺化辨斷鏈

### 第五步：設抽樣策略

施抽樣以減追蹤之量與費，仍存可視。

**抽樣策略**：

```python
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.sampling import (
    ParentBased,
    TraceIdRatioBased,
    StaticSampler,
    Decision
# ... (see EXAMPLES.md for complete configuration)
```

**Tempo 之尾端抽樣**：

於 `tempo.yaml` 設之：

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

以 **Grafana Tempo 之 TraceQL** 施動態抽樣：

```traceql
# Sample traces with errors
{ status = error }

# Sample slow traces (>1s)
{ duration > 1s }

# Sample specific services
{ resource.service.name = "checkout-service" }
```

**得：**追蹤之量減至目標百分比，錯誤追蹤恆取樣，抽樣決策現於追蹤中繼。

**敗則：**
- 驗取樣器於 tracer provider 初始之前已設
- 察匯出 span 中之抽樣決策屬性
- 尾端抽樣：確緩衝足（`ingestion_burst_size_bytes`）
- 監丟棄之追蹤：`otel_traces_dropped_total` 指標
- 以合成高流量試，驗抽樣率

### 第六步：以追蹤關聯指標與日誌

連追蹤、指標、日誌，成統一可觀測。

**日誌加 trace ID**（Python）：

```python
import logging
from opentelemetry import trace

# Custom log formatter with trace context
class TraceFormatter(logging.Formatter):
    def format(self, record):
# ... (see EXAMPLES.md for complete configuration)
```

**自追蹤生指標**（Tempo）：

```yaml
# tempo.yaml
metrics_generator:
  registry:
    external_labels:
      cluster: production
  storage:
# ... (see EXAMPLES.md for complete configuration)
```

此生 Prometheus 指標：
- `traces_service_graph_request_total` — 服務間請求之數
- `traces_span_metrics_duration_seconds` — span 時距之直方圖
- `traces_spanmetrics_calls_total` — span 呼叫之數

**自指標查追蹤**（Grafana）：

於 Grafana 之 Prometheus 資料源添 exemplar 支援：

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

於 Grafana 儀表板啟 exemplar：

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

**得：**點指標 exemplar 可開追蹤，日誌現 trace ID，追蹤連日誌，信號間除錯得一。

**敗則：**
- 驗 Prometheus 啟 exemplar 支援（需 v2.26 以上）
- 察 trace ID 格式相符（32 字元十六進位）
- 確 Tempo 配置中 metrics generator 已啟
- 驗 Tempo 可達 remote write 端點
- 試 exemplar 查詢：`histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) and on() exemplar`

## 驗

- [ ] 追蹤後端收諸已佈儀服務之 span
- [ ] 追蹤顯跨服務之正確父子關係
- [ ] span 屬性含語義約定與業務脈絡
- [ ] 脈絡跨 HTTP 呼叫與訊息佇列正確傳播
- [ ] 抽樣策略減追蹤之量至目標百分比
- [ ] 錯誤追蹤恆取樣（若用錯誤感知抽樣）
- [ ] trace ID 以正確格式現於應用日誌
- [ ] Grafana 顯自指標經 exemplar 連至追蹤
- [ ] 日誌面板具至追蹤視圖之資料連結
- [ ] 追蹤留存符合設之存儲策略

## 陷

- **脈絡未傳**：忘將 `context` 傳予下游呼叫，則追蹤斷。恆明傳脈絡。
- **span 未終**：缺 `defer span.End()`（Go）或 `with` 區塊（Python），span 不閉致記憶體洩漏。
- **過度佈儀**：為每函數皆建 span 致追蹤臃腫。宜聚於服務界、資料庫呼叫、外部 API。
- **失記錯誤**：未呼 `span.RecordError()` 失珍貴除錯資訊。span 中恆記錯。
- **高基數屬性**：以無界之值（用者 ID、請求體）為 span 屬性致存儲困難。宜抽樣或聚合標籤。
- **span 類型誤**：用錯 span 類（CLIENT 與 SERVER 與 INTERNAL）影響服務圖生成。循語義約定。
- **抽樣先於脈絡**：抽樣決策須尊父追蹤脈絡。用 `ParentBased` 取樣器以遵上游抽樣。

## 參

- `correlate-observability-signals` — 以 trace ID 連指標、日誌、追蹤，成統一除錯
- `setup-prometheus-monitoring` — 以 Tempo metrics generator 自追蹤生指標
- `configure-log-aggregation` — 日誌加 trace ID 以關聯分散追蹤
- `build-grafana-dashboards` — 於儀表板視覺化追蹤所生之指標與 exemplar 連結
