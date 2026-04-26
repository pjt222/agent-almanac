---
name: instrument-distributed-tracing
locale: wenyan-ultra
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

# 建分布式追蹤

以 OpenTelemetry 建分布式追蹤→跨微服務追請求、識性能瓶頸。

## 用

- 分布式系統延遲調試（多服務）
- 解微服務間請求流與依賴
- 識事務中慢查詢、外部 API 調用
- 追蹤與日誌、指標相關→根因
- 量端到端延遲
- 遷舊追蹤系統（Zipkin、Jaeger）→ OpenTelemetry
- 以詳細延遲百分位立 SLO 守證

## 入

- **必**：待建服務列（語言與框架）
- **必**：追蹤後端（Jaeger、Tempo、Zipkin、或商 SaaS）
- **可**：現有建庫（OpenTracing、Zipkin）
- **可**：採樣策略需求（比例、速率限）
- **可**：自定 span 屬性（業務元數據）

## 行

> 全配置文件與模板詳見 [Extended Examples](references/EXAMPLES.md)。


### 一：立追蹤後端

部署 Jaeger 或 Grafana Tempo 以收存追蹤。

**甲：Jaeger all-in-one**（開發/測試）：

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

**乙：Grafana Tempo**（生產、可擴）：

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

生產用 **S3 存**：

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

得：後端可達，可經 OTLP 收追蹤，Jaeger UI 或 Grafana 初示「無追蹤」。

敗：
- 驗端口未占：`netstat -tulpn | grep -E '(4317|16686|3200)'`
- 查容器日誌：`docker logs jaeger` 或 `docker logs tempo`
- 驗 OTLP 端點：`curl http://localhost:4318/v1/traces -v`
- Tempo：`tempo -config.file=/etc/tempo.yaml -verify-config` 驗配置

### 二：建應用（自動建）

用 OpenTelemetry 自動建以少改碼。

**Python + Flask**：

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

**Go + Gin**：

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

**Node.js + Express**：

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

得：受建服務之追蹤見於 Jaeger UI 或 Grafana，HTTP 請求自動成 span。

敗：
- 查導出端點由應用可達
- 驗環境：`OTEL_EXPORTER_OTLP_ENDPOINT=http://tempo:4317`
- 啟調試日誌：`OTEL_LOG_LEVEL=debug`（Python）、`OTEL_LOG_LEVEL=DEBUG`（Node.js）
- 以簡單 span 測：手動造 span 以驗導出管線
- 查 OpenTelemetry 包之版本衝突

### 三：加手動建

為業務邏輯、數據庫查、外部調用造自定 span。

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

**span 屬性佳法**：
- 用語義約：`http.method`、`http.status_code`、`db.system`、`db.statement`
- 加業務脈：`user.id`、`order.id`、`product.category`
- 含資源識：`instance.id`、`region`、`availability_zone`
- 記錯：`span.RecordError(err)` 及 `span.SetStatus(codes.Error, message)`
- 加事件記里程：`span.AddEvent("cache_miss")`

得：自定 span 見於追蹤視圖，父子關係正，屬性見於 span 詳，錯高亮。

敗：
- 驗脈絡傳：父 span 脈絡傳至子
- 查 span 名具描述且循名規
- 確保 span 結束（Go 用 `defer span.End()`，Python 用 `with`）
- 驗屬性型：僅字符、整、布爾、浮點
- 驗語義約：適用處用標屬名

### 四：施脈絡傳

確保追蹤脈絡跨服務邊與異步操作流轉。

**HTTP 頭傳**（W3C Trace Context）：

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

**消息隊列傳**（Kafka）：

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

**異步操作**（Python asyncio）：

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

得：追蹤跨多服務，追蹤 ID 跨服務邊一致，父子關係存。

敗：
- 驗 W3C Trace Context 傳者已配：`otel.propagation.set_global_textmap(TraceContextTextMapPropagator())`
- 查頭於 HTTP 請求中傳
- Kafka：確保 broker 支持頭（v0.11+）
- 以頭查調試：記 `traceparent` 頭值
- 以追蹤可視化識斷鏈

### 五：配採樣策略

施採樣以減追蹤量與本而保可見。

**採樣策略**：

```python
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.sampling import (
    ParentBased,
    TraceIdRatioBased,
    StaticSampler,
    Decision
# ... (see EXAMPLES.md for complete configuration)
```

**Tempo 尾部採樣**：

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

用 **Grafana Tempo TraceQL** 動態採樣：

```traceql
# Sample traces with errors
{ status = error }

# Sample slow traces (>1s)
{ duration > 1s }

# Sample specific services
{ resource.service.name = "checkout-service" }
```

得：追蹤量降至目標比，錯追蹤必採，採樣決見於追蹤元。

敗：
- 驗採樣器於 tracer provider 初前施
- 查採樣決屬性見於導出 span
- 尾採樣：確保充分緩衝（`ingestion_burst_size_bytes`）
- 監丟棄追蹤：`otel_traces_dropped_total` 指標
- 以合成高量流量測以驗採樣率

### 六：合追蹤與指標、日誌

鏈追蹤至指標與日誌以統一可觀察性。

**於日誌加追蹤 ID**（Python）：

```python
import logging
from opentelemetry import trace

# Custom log formatter with trace context
class TraceFormatter(logging.Formatter):
    def format(self, record):
# ... (see EXAMPLES.md for complete configuration)
```

**由追蹤生指標**（Tempo）：

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
- `traces_service_graph_request_total` - 服務間請求計
- `traces_span_metrics_duration_seconds` - span 時長直方圖
- `traces_spanmetrics_calls_total` - span 調用計

**由指標查追蹤**（Grafana）：

於 Grafana 中為 Prometheus 源加 exemplar 支持：

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

得：點指標 exemplar 開追蹤，日誌示追蹤 ID，追蹤鏈日誌，跨信號統一調試。

敗：
- 驗 Prometheus 啟 exemplar 支持（須 v2.26+）
- 查追蹤 ID 格式匹（32 字符十六進）
- 確保 Tempo 配啟指標生成器
- 驗遠寫端點由 Tempo 可達
- 測 exemplar 查：`histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) and on() exemplar`

## 驗

- [ ] 追蹤後端由諸建服務收 span
- [ ] 追蹤示跨服務正父子關係
- [ ] span 屬含語義約與業務脈
- [ ] 脈絡跨 HTTP 調用與消息隊列正傳
- [ ] 採樣策略降追蹤量至目標比
- [ ] 錯追蹤必採（若用錯感知採樣）
- [ ] 追蹤 ID 以正格見於應用日誌
- [ ] Grafana 示由指標經 exemplar 鏈追蹤
- [ ] 日誌面板有數據鏈至追蹤視
- [ ] 追蹤留存合配置存策

## 忌

- **脈絡未傳**：忘傳 `context` 於下游調用→斷追蹤。必顯式傳。
- **span 未終**：缺 `defer span.End()`（Go）或 `with`（Python）→ span 長開、內存泄。
- **過建**：各函造 span→追蹤膨。重服務邊、數據庫調用、外部 API。
- **缺記錯**：不呼 `span.RecordError()` →失調試信息。必於 span 記錯。
- **高基數屬**：用無界值（用戶 ID、請求體）為 span 屬→存問題。用採樣或聚合標籤。
- **span 類誤**：用錯 span 類（CLIENT vs SERVER vs INTERNAL）→影響服務圖生。循語義約。
- **脈絡前採樣**：採樣決須守父追蹤脈絡。用 `ParentBased` 採樣器以守上游採樣。

## 參

- `correlate-observability-signals` - 指標、日誌、追蹤經追蹤 ID 鏈以統一調試
- `setup-prometheus-monitoring` - 以 Tempo 指標生成器由追蹤生指標
- `configure-log-aggregation` - 日誌加追蹤 ID 以合分布追蹤
- `build-grafana-dashboards` - 於儀表板可視化追蹤衍指標與 exemplar 鏈
