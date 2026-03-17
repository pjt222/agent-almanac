---
name: instrument-distributed-tracing
description: >
  使用 OpenTelemetry 为应用程序插桩分布式追踪，包括自动和手动插桩、
  上下文传播、采样策略及与 Jaeger 或 Tempo 的集成。适用于调试分布式系统中的延迟问题、
  理解跨微服务的请求流、将追踪与日志和指标关联进行根因分析、
  测量端到端延迟，或将遗留追踪系统迁移到 OpenTelemetry。
locale: zh-CN
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
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

实现 OpenTelemetry 分布式追踪，跨微服务追踪请求并识别性能瓶颈。

## 适用场景

- 调试多服务分布式系统中的延迟问题
- 理解微服务之间的请求流和依赖关系
- 识别事务中缓慢的数据库查询或外部 API 调用
- 将追踪与日志和指标关联进行根因分析
- 测量从用户请求到响应的端到端延迟
- 将遗留追踪系统（Zipkin、Jaeger）迁移到 OpenTelemetry
- 通过详细延迟百分位追踪建立 SLO 合规性

## 输入

- **必填**：待插桩的服务列表（语言和框架）
- **必填**：追踪后端选择（Jaeger、Tempo、Zipkin 或供应商 SaaS）
- **可选**：现有插桩库（OpenTracing、Zipkin）
- **可选**：采样策略需求（百分比、速率限制）
- **可选**：业务特定元数据的自定义 span 属性

## 步骤

> 完整配置文件和模板请参阅 [Extended Examples](references/EXAMPLES.md)。

### 第 1 步：设置追踪后端

部署 Jaeger 或 Grafana Tempo 以接收和存储追踪数据。

**选项 A：Jaeger all-in-one**（开发/测试）：

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

**选项 B：Grafana Tempo**（生产环境，可扩展）：

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

**生产环境使用 S3 存储**：

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

**预期结果：** 追踪后端可访问，准备好通过 OTLP 接收追踪，Jaeger UI 或 Grafana 初始显示"no traces"。

**失败处理：**
- 验证端口未被占用：`netstat -tulpn | grep -E '(4317|16686|3200)'`
- 检查容器日志：`docker logs jaeger` 或 `docker logs tempo`
- 测试 OTLP 端点：`curl http://localhost:4318/v1/traces -v`
- 对于 Tempo：使用 `tempo -config.file=/etc/tempo.yaml -verify-config` 验证配置语法

### 第 2 步：为应用程序插桩（自动插桩）

使用 OpenTelemetry 自动插桩处理常见框架，最小化代码变更。

**Python with Flask**：

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

**Go with Gin framework**：

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

**Node.js with Express**：

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

**预期结果：** 来自已插桩服务的追踪出现在 Jaeger UI 或 Grafana 中，HTTP 请求自动创建 span。

**失败处理：**
- 检查 exporter 端点从应用程序可达
- 验证环境变量：`OTEL_EXPORTER_OTLP_ENDPOINT=http://tempo:4317`
- 启用调试日志：`OTEL_LOG_LEVEL=debug`（Python）、`OTEL_LOG_LEVEL=DEBUG`（Node.js）
- 用简单 span 测试：手动创建一个 span 验证导出管道
- 检查 OpenTelemetry 包之间的版本冲突

### 第 3 步：添加手动插桩

为业务逻辑、数据库查询和外部调用创建自定义 span。

**Python 手动 span**：

```python
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

def process_order(order_id):
    # Create a span for the entire operation
# ... (see EXAMPLES.md for complete configuration)
```

**Go 手动 span**：

```go
import (
    "context"
    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/attribute"
    "go.opentelemetry.io/otel/codes"
    "go.opentelemetry.io/otel/trace"
# ... (see EXAMPLES.md for complete configuration)
```

**Span 属性最佳实践**：
- 使用语义约定：`http.method`、`http.status_code`、`db.system`、`db.statement`
- 添加业务上下文：`user.id`、`order.id`、`product.category`
- 包含资源标识符：`instance.id`、`region`、`availability_zone`
- 记录错误：`span.RecordError(err)` 和 `span.SetStatus(codes.Error, message)`
- 为重要里程碑添加事件：`span.AddEvent("cache_miss")`

**预期结果：** 自定义 span 出现在追踪视图中，父子关系正确，属性在 span 详情中可见，错误被高亮显示。

**失败处理：**
- 验证上下文传播：父 span 上下文传递给子 span
- 检查 span 名称是否具有描述性并遵循命名约定
- 确保 span 被结束（Go 中使用 `defer span.End()`，Python 中使用 `with` 块）
- 检查属性类型：仅支持字符串、整数、布尔值、浮点数
- 验证语义约定：在适用处使用标准属性名称

### 第 4 步：实现上下文传播

确保追踪上下文跨服务边界和异步操作流动。

**HTTP 头传播**（W3C Trace Context）：

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

**消息队列传播**（Kafka）：

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

**异步操作**（Python asyncio）：

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

**预期结果：** 追踪跨越多个服务，追踪 ID 跨服务边界保持一致，父子关系得以保留。

**失败处理：**
- 验证 W3C Trace Context 传播器已配置：`otel.propagation.set_global_textmap(TraceContextTextMapPropagator())`
- 检查 HTTP 请求中是否传递了头信息
- 对于 Kafka：确保 broker 版本支持头信息（v0.11+）
- 通过头信息检查调试：记录 `traceparent` 头信息值
- 使用追踪可视化识别断开的追踪链接

### 第 5 步：配置采样策略

实现采样以减少追踪量和成本，同时保持可见性。

**采样策略**：

```python
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.sampling import (
    ParentBased,
    TraceIdRatioBased,
    StaticSampler,
    Decision
# ... (see EXAMPLES.md for complete configuration)
```

**使用 Tempo 的尾部采样**：

在 `tempo.yaml` 中配置：

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

使用 **Grafana Tempo 的 TraceQL** 进行动态采样：

```traceql
# Sample traces with errors
{ status = error }

# Sample slow traces (>1s)
{ duration > 1s }

# Sample specific services
{ resource.service.name = "checkout-service" }
```

**预期结果：** 追踪量减少到目标百分比，错误追踪始终被采样，采样决策在追踪元数据中可见。

**失败处理：**
- 验证采样器在追踪提供程序初始化前已应用
- 检查已导出 span 中的采样决策属性
- 对于尾部采样：确保足够的缓冲区（`ingestion_burst_size_bytes`）
- 监控丢弃的追踪：`otel_traces_dropped_total` 指标
- 使用合成高流量测试验证采样率

### 第 6 步：将追踪与指标和日志关联

将追踪链接到指标和日志，实现统一可观测性。

**向日志添加追踪 ID**（Python）：

```python
import logging
from opentelemetry import trace

# Custom log formatter with trace context
class TraceFormatter(logging.Formatter):
    def format(self, record):
# ... (see EXAMPLES.md for complete configuration)
```

**从追踪生成指标**（Tempo）：

```yaml
# tempo.yaml
metrics_generator:
  registry:
    external_labels:
      cluster: production
  storage:
# ... (see EXAMPLES.md for complete configuration)
```

这将生成 Prometheus 指标：
- `traces_service_graph_request_total` - 服务间请求计数
- `traces_span_metrics_duration_seconds` - span 持续时间直方图
- `traces_spanmetrics_calls_total` - span 调用计数

**从指标查询追踪**（Grafana）：

在 Grafana 中向 Prometheus 数据源添加 exemplar 支持：

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

在 Grafana 仪表板中启用 exemplar：

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

**预期结果：** 点击指标 exemplar 打开追踪，日志显示追踪 ID，追踪链接到日志，实现跨信号的统一调试。

**失败处理：**
- 验证 Prometheus 中启用了 exemplar 支持（需要 v2.26+）
- 检查追踪 ID 格式匹配（32 位十六进制）
- 确保 Tempo 配置中启用了指标生成器
- 验证从 Tempo 到 remote write 端点可访问
- 测试 exemplar 查询：`histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) and on() exemplar`

## 验证清单

- [ ] 追踪后端从所有已插桩服务接收 span
- [ ] 追踪跨服务显示正确的父子关系
- [ ] Span 属性包含语义约定和业务上下文
- [ ] 上下文在 HTTP 调用和消息队列间正确传播
- [ ] 采样策略将追踪量减少到目标百分比
- [ ] 错误追踪始终被采样（如使用错误感知采样）
- [ ] 追踪 ID 以正确格式出现在应用程序日志中
- [ ] Grafana 通过 exemplar 显示从指标链接的追踪
- [ ] 日志面板有到追踪查看器的数据链接
- [ ] 追踪保留与配置的存储策略匹配

## 常见问题

- **上下文未传播**：忘记将 `context` 传递给下游调用会断开追踪。始终显式传递上下文。
- **Span 从未结束**：缺少 `defer span.End()`（Go）或 `with` 块（Python）导致 span 保持打开并产生内存泄漏。
- **过度插桩**：为每个函数创建 span 导致追踪臃肿。专注于服务边界、数据库调用和外部 API。
- **缺少错误记录**：不调用 `span.RecordError()` 会丢失宝贵的调试信息。始终在 span 中记录错误。
- **高基数属性**：将无限制值（用户 ID、请求体）用作 span 属性会导致存储问题。使用采样或聚合标签。
- **Span 类型错误**：使用错误的 span 类型（CLIENT vs SERVER vs INTERNAL）会影响服务图生成。遵循语义约定。
- **采样前的上下文**：采样决策必须遵守父追踪上下文。使用 `ParentBased` 采样器尊重上游采样。

## 相关技能

- `correlate-observability-signals` - 通过追踪 ID 链接指标、日志和追踪进行统一调试
- `setup-prometheus-monitoring` - 使用 Tempo 指标生成器从追踪生成指标
- `configure-log-aggregation` - 向日志添加追踪 ID 以与分布式追踪关联
- `build-grafana-dashboards` - 在仪表板中可视化追踪衍生指标和 exemplar 链接
