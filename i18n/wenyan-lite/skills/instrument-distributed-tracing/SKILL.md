---
name: instrument-distributed-tracing
locale: wenyan-lite
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

# 儀表分散式追蹤

以 OpenTelemetry 行分散式追蹤，追跨微服務之請求並識性能瓶頸。

## 適用時機

- 除多服務分散系統之延遲問題
- 解微服務間之請求流與依賴
- 識交易中之慢資料庫查詢或外部 API 調用
- 關聯追蹤於日誌與指標以作根因分析
- 測自用戶請求至響應之端到端延遲
- 自舊追蹤系統（Zipkin、Jaeger）遷至 OpenTelemetry
- 以細延遲分位追蹤立 SLO 合規

## 輸入

- **必要**：待儀表之服務清單（語言與框架）
- **必要**：追蹤後端擇（Jaeger、Tempo、Zipkin，或廠商 SaaS）
- **選擇性**：既有儀表庫（OpenTracing、Zipkin）
- **選擇性**：取樣策略需（百分比、速率限制）
- **選擇性**：供業務特元數據之自訂 span 屬性

## 步驟

> 見 [Extended Examples](references/EXAMPLES.md) 供完整配置文件與模板。


### 步驟一：設追蹤後端

部署 Jaeger 或 Grafana Tempo 以接並存追蹤。

**選 A：Jaeger all-in-one**（開發/測試）：

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

**選 B：Grafana Tempo**（生產、可擴）：

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

**Tempo 配置**（`tempo.yaml`）：

```yaml
server:
  http_listen_port: 3200

distributor:
  receivers:
    jaeger:
# ... (see EXAMPLES.md for complete configuration)
```

**生產 S3 存儲**：

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

**預期：** 追蹤後端可訪，備以 OTLP 接追蹤，Jaeger UI 或 Grafana 初示「無追蹤」。

**失敗時：**
- 驗端口未佔：`netstat -tulpn | grep -E '(4317|16686|3200)'`
- 查容器日誌：`docker logs jaeger` 或 `docker logs tempo`
- 測 OTLP 端點：`curl http://localhost:4318/v1/traces -v`
- 對 Tempo：以 `tempo -config.file=/etc/tempo.yaml -verify-config` 驗配語法

### 步驟二：儀表應用（自動儀表）

用 OpenTelemetry 自動儀表以最小碼變涵常框架。

**Python 與 Flask**：

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

**Go 與 Gin 框架**：

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

**Node.js 與 Express**：

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

**預期：** 儀表服務之追蹤現於 Jaeger UI 或 Grafana，HTTP 請求自動創 span。

**失敗時：**
- 查匯出器端點自應用可達
- 驗環境變量：`OTEL_EXPORTER_OTLP_ENDPOINT=http://tempo:4317`
- 啟除錯日誌：`OTEL_LOG_LEVEL=debug`（Python）、`OTEL_LOG_LEVEL=DEBUG`（Node.js）
- 以簡 span 測：手動創 span 以驗匯出管線
- 查 OpenTelemetry 套件間之版本衝突

### 步驟三：加手動儀表

為業務邏輯、資料庫查詢與外部調用創自訂 span。

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

**Span 屬性最佳實踐**：
- 用語義慣：`http.method`、`http.status_code`、`db.system`、`db.statement`
- 加業務上下文：`user.id`、`order.id`、`product.category`
- 含資源標識：`instance.id`、`region`、`availability_zone`
- 記錯：`span.RecordError(err)` 與 `span.SetStatus(codes.Error, message)`
- 為重要里程加事件：`span.AddEvent("cache_miss")`

**預期：** 自訂 span 現於追蹤視圖，父子關係正，屬性於 span 細中可見，錯誤已突顯。

**失敗時：**
- 驗上下文傳：父 span 上下文已傳於子
- 查 span 名描述性並循命名慣
- 確 span 已終（Go 用 `defer span.End()`，Python 用 `with` 塊）
- 審屬性類型：僅字串、整數、布爾、浮點
- 驗語義慣：可用處用標準屬性名

### 步驟四：行上下文傳播

確追蹤上下文跨服務邊界與異步運作而流。

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

**消息佇列傳播**（Kafka）：

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

**異步運作**（Python asyncio）：

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

**預期：** 追蹤跨多服務，追蹤 ID 跨服務邊界一致，父子關係保。

**失敗時：**
- 驗 W3C Trace Context 傳播器已配：`otel.propagation.set_global_textmap(TraceContextTextMapPropagator())`
- 查標頭已於 HTTP 請求中傳
- 對 Kafka：確代理版本（v0.11+）支標頭
- 以標頭察除錯：記 `traceparent` 標頭值
- 以追蹤視覺化識破之追蹤鏈

### 步驟五：配取樣策略

行取樣以減追蹤量與成本而持可見。

**取樣策略**：

```python
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.sampling import (
    ParentBased,
    TraceIdRatioBased,
    StaticSampler,
    Decision
# ... (see EXAMPLES.md for complete configuration)
```

**與 Tempo 之尾基取樣**：

於 `tempo.yaml` 配：

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

用 **Grafana Tempo 之 TraceQL** 作動態取樣：

```traceql
# Sample traces with errors
{ status = error }

# Sample slow traces (>1s)
{ duration > 1s }

# Sample specific services
{ resource.service.name = "checkout-service" }
```

**預期：** 追蹤量已減至目標百分比，錯追蹤恒取樣，取樣決於追蹤元數據中可見。

**失敗時：**
- 驗取樣器於追蹤器供應器初始化前已用
- 查已匯 span 中之取樣決屬性
- 對尾取樣：確足緩衝（`ingestion_burst_size_bytes`）
- 監丟失追蹤：`otel_traces_dropped_total` 指標
- 以合成高量流驗取樣率

### 步驟六：關聯追蹤於指標與日誌

連追蹤於指標與日誌以成統一觀測。

**加追蹤 ID 於日誌**（Python）：

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
- `traces_service_graph_request_total` - 服務間請求計數
- `traces_span_metrics_duration_seconds` - span 時長直方圖
- `traces_spanmetrics_calls_total` - span 調用計數

**自指標查追蹤**（Grafana）：

於 Grafana 之 Prometheus 資料源加 exemplar 支援：

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

**預期：** 點擊指標 exemplar 開追蹤，日誌示追蹤 ID，追蹤連於日誌，跨信號統一除錯。

**失敗時：**
- 驗 Prometheus（需 v2.26+）中 exemplar 支援已啟
- 查追蹤 ID 格式匹配（32 字符十六進制）
- 確 Tempo 配中指標生成器已啟
- 驗遠寫端點自 Tempo 可達
- 測 exemplar 查詢：`histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) and on() exemplar`

## 驗證

- [ ] 追蹤後端自所有儀表服務接 span
- [ ] 追蹤示跨服務之正確父子關係
- [ ] Span 屬性含語義慣與業務上下文
- [ ] 上下文正確跨 HTTP 調用與消息佇列傳
- [ ] 取樣策略減追蹤量至目標百分比
- [ ] 錯誤追蹤恒取樣（若用錯感取樣）
- [ ] 追蹤 ID 現於應用日誌並格式正
- [ ] Grafana 示經 exemplar 連自指標之追蹤
- [ ] 日誌面板有至追蹤視圖之數據鏈
- [ ] 追蹤保留匹配所配存儲政策

## 常見陷阱

- **上下文未傳**：忘傳 `context` 於下游調用破追蹤。恒明顯傳上下文
- **Span 未終**：缺 `defer span.End()`（Go）或 `with` 塊（Python）致 span 存而記憶漏
- **過度儀表**：為每函創 span 致追蹤膨脹。聚焦於服務邊界、資料庫調用與外部 API
- **缺錯誤記錄**：未調 `span.RecordError()` 失值除錯信息。恒於 span 中記錯
- **高基數屬性**：用無界值（用戶 ID、請求體）為 span 屬性致存儲問題。用取樣或聚合標籤
- **錯 span 種**：用錯 span 種（CLIENT vs SERVER vs INTERNAL）影響服務圖生。循語義慣
- **上下文前取樣**：取樣決須敬父追蹤上下文。用 `ParentBased` 取樣器以敬上游取樣

## 相關技能

- `correlate-observability-signals` - 以追蹤 ID 連指標、日誌與追蹤作統一除錯
- `setup-prometheus-monitoring` - 用 Tempo 指標生成器自追蹤生指標
- `configure-log-aggregation` - 加追蹤 ID 於日誌以關聯分散追蹤
- `build-grafana-dashboards` - 於儀表板視覺化追蹤衍指標與 exemplar 鏈
