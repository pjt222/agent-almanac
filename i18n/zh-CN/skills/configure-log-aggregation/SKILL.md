---
name: configure-log-aggregation
description: >
  使用 Loki 和 Promtail（或 ELK 栈）设置集中式日志聚合，包括日志解析、标签提取、
  保留策略及与指标的集成关联。适用于将多服务日志整合到可搜索系统、
  用集中式可查询存储替代本地日志文件、将日志与指标和追踪关联、
  实现带标签提取的结构化日志记录，或排查需要跨服务日志分析的生产事故。
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
  complexity: intermediate
  language: multi
  tags: loki, promtail, logging, elk, log-aggregation
---

# Configure Log Aggregation

使用 Loki/Promtail 或 ELK 栈实现集中式日志收集、解析和查询，提升运营可见性。

## 适用场景

- 将多服务或多主机的日志整合到可搜索系统中
- 用集中式可查询日志存储替代本地日志文件
- 将日志与指标和追踪关联以实现全面可观测性
- 通过从非结构化日志中提取标签实现结构化日志记录
- 根据存储和合规需求设置日志数据的保留策略
- 排查需要跨服务日志分析的生产事故

## 输入

- **必填**：日志来源（应用日志、系统日志、容器日志）
- **必填**：日志格式模式（JSON、纯文本、syslog 等）
- **可选**：用于结构化查询的标签提取规则
- **可选**：保留和压缩策略
- **可选**：现有日志传输配置（Fluentd、Filebeat、Promtail）

## 步骤

> 完整配置文件和模板请参阅 [Extended Examples](references/EXAMPLES.md)。

### 第 1 步：选择日志聚合栈

根据需求在 Loki（Prometheus 风格）和 ELK（基于 Elasticsearch）之间做出选择。

**Loki 优势**：
- 轻量级，专为 Kubernetes 和云原生环境设计
- 基于标签的索引（类似 Prometheus），存储开销低
- 与 Grafana 原生集成，实现统一仪表板
- 通过对象存储（S3、GCS）水平扩展
- 相比 Elasticsearch 资源消耗更低

**ELK 优势**：
- 跨所有日志内容的全文搜索（不仅限于标签）
- 丰富的查询 DSL 和聚合功能
- 成熟生态，含 beats 和 logstash 插件
- 更适合需要深度历史搜索的合规/审计日志

本指南重点介绍 **Loki + Promtail**（适合大多数现代设置的推荐方案）。

决策标准：
```markdown
Use Loki if:
- You want label-based queries similar to Prometheus
- Storage costs are a concern (Loki indexes only labels)
- You already use Grafana for metrics
- Kubernetes/container-native deployment

Use ELK if:
- You need full-text search across all log content
- You have complex log parsing and enrichment requirements
- You require advanced analytics and aggregations
- Legacy systems with existing Logstash pipelines
```

**预期结果：** 根据需求做出明确选择，团队下载相应的安装包。

**失败处理：**
- 对比存储需求基准：相同日志量下 Loki 约为 Elasticsearch 的 1/10
- 评估查询模式：全文搜索需求 vs 标签过滤
- 考虑运维开销：ELK 需要更多调优和资源

### 第 2 步：部署 Loki

安装并配置带合适存储后端的 Loki。

**Docker Compose 部署**（`docker-compose.yml`）：

```yaml
version: '3.8'

services:
  loki:
    image: grafana/loki:2.9.0
    ports:
      - "3100:3100"
    volumes:
      - ./loki-config.yml:/etc/loki/local-config.yaml
      - loki-data:/loki
    command: -config.file=/etc/loki/local-config.yaml
    restart: unless-stopped

  promtail:
    image: grafana/promtail:2.9.0
    volumes:
      - ./promtail-config.yml:/etc/promtail/config.yml
      - /var/log:/var/log:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
    command: -config.file=/etc/promtail/config.yml
    restart: unless-stopped
    depends_on:
      - loki

volumes:
  loki-data:
```

**Loki 配置**（`loki-config.yml`）：

```yaml
auth_enabled: false

server:
  http_listen_port: 3100
  grpc_listen_port: 9096

# ... (see EXAMPLES.md for complete configuration)
```

**生产环境**使用 S3 存储：

```yaml
storage_config:
  aws:
    s3: s3://us-east-1/my-loki-bucket
    s3forcepathstyle: true
  boltdb_shipper:
    active_index_directory: /loki/index
    cache_location: /loki/cache
    shared_store: s3
```

**预期结果：** Loki 成功启动，`http://localhost:3100/ready` 健康检查通过，日志按保留策略存储。

**失败处理：**
- 检查 Loki 日志：`docker logs loki`
- 验证存储目录存在且可写
- 测试配置语法：`docker run grafana/loki:2.9.0 -config.file=/etc/loki/local-config.yaml -verify-config`
- 确保保留设置不超出磁盘容量
- 对于 S3：验证 IAM 权限和存储桶访问

### 第 3 步：配置 Promtail 进行日志传输

设置 Promtail 抓取日志并将带标签提取的日志转发到 Loki。

**Promtail 配置**（`promtail-config.yml`）：

```yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml
# ... (see EXAMPLES.md for complete configuration)
```

Promtail 关键概念：
- **抓取配置**：定义日志来源及其发现方式
- **管道阶段**：在发送到 Loki 前转换和标记日志
- **重新标记配置**：基于元数据的动态标记
- **位置文件**：追踪读取偏移量，避免重复处理日志

**预期结果：** Promtail 抓取配置的日志文件，标签正确应用，日志可通过 LogQL 查询在 Loki 中看到。

**失败处理：**
- 检查 Promtail 日志：`docker logs promtail`
- 验证文件路径可访问：`docker exec promtail ls /var/log`
- 使用示例日志行独立测试正则表达式
- 监控 Promtail 指标：`curl http://localhost:9080/metrics | grep promtail`
- 检查位置文件进度：`cat /tmp/positions.yaml`

### 第 4 步：使用 LogQL 查询日志

学习 LogQL 语法用于过滤和聚合日志。

**基础查询**：

```logql
# All logs from a job
{job="app"}

# Logs with specific label values
{job="app", level="error"}

# Regex filter on log line content
{job="app"} |~ "authentication failed"

# Case-insensitive regex
{job="app"} |~ "(?i)error"

# Line filter (doesn't parse, just includes/excludes)
{job="app"} |= "user"  # Contains "user"
{job="app"} != "debug" # Doesn't contain "debug"
```

**解析和过滤**：

```logql
# JSON parsing
{job="app"} | json | level="error"

# Regex parsing with named groups
{job="app"} | regexp "user_id=(?P<user_id>\\d+)" | user_id="12345"

# Logfmt parsing (key=value format)
{job="app"} | logfmt | level="error", service="auth"

# Pattern parsing
{job="nginx"} | pattern `<ip> - <user> [<timestamp>] "<method> <path> <protocol>" <status> <size>` | status >= 500
```

**聚合**（从日志生成指标）：

```logql
# Count log lines per level
sum by (level) (count_over_time({job="app"}[5m]))

# Rate of error logs
rate({job="app", level="error"}[5m])

# Bytes processed per service
sum by (service) (bytes_over_time({job="app"}[1h]))

# Average request duration from logs
avg_over_time({job="app"} | json | unwrap duration [5m])

# Top 10 error messages
topk(10, sum by (message) (count_over_time({level="error"} [1h])))
```

**按提取字段过滤**：

```logql
# Find specific trace in logs
{job="app"} | json | trace_id="abc123def456"

# HTTP 5xx errors from nginx
{job="nginx"} | pattern `<_> "<_> <_> <_>" <status> <_>` | status >= 500

# Failed authentication attempts
{job="app"} | json | message=~"authentication failed" | user_id != ""
```

使用这些模式创建 Grafana Explore 查询或仪表板面板。

**预期结果：** 查询返回预期日志行，过滤正确有效，聚合从日志生成指标。

**失败处理：**
- 使用 Grafana Explore 交互式调试查询
- 检查标签名称：`curl http://localhost:3100/loki/api/v1/labels`
- 验证标签值：`curl http://localhost:3100/loki/api/v1/label/{label_name}/values`
- 简化查询：从基础标签选择器开始，逐步添加过滤
- 检查时间范围：日志可能不在选定窗口内

### 第 5 步：将日志与指标和追踪集成

将日志与 Prometheus 指标和分布式追踪关联，实现统一可观测性。

**向日志添加追踪 ID**（应用程序插桩）：

```python
# Python with OpenTelemetry
import logging
from opentelemetry import trace

logger = logging.getLogger(__name__)

def handle_request():
    span = trace.get_current_span()
    trace_id = span.get_span_context().trace_id

    logger.info(
        "Processing request",
        extra={"trace_id": format(trace_id, "032x")}
    )
```

```go
// Go with OpenTelemetry
import (
    "go.opentelemetry.io/otel/trace"
    "go.uber.org/zap"
)

func handleRequest(ctx context.Context) {
    span := trace.SpanFromContext(ctx)
    traceID := span.SpanContext().TraceID().String()

    logger.Info("Processing request",
        zap.String("trace_id", traceID),
    )
}
```

**配置 Grafana 数据链接**从指标到日志：

在 Prometheus 面板字段配置中：

```json
{
  "fieldConfig": {
    "defaults": {
      "links": [
        {
          "title": "View Logs",
          "url": "/explore?left={\"datasource\":\"Loki\",\"queries\":[{\"refId\":\"A\",\"expr\":\"{job=\\\"app\\\",instance=\\\"${__field.labels.instance}\\\"} |= `${__field.labels.trace_id}`\"}],\"range\":{\"from\":\"${__from}\",\"to\":\"${__to}\"}}",
          "targetBlank": false
        }
      ]
    }
  }
}
```

**配置 Grafana 数据链接**从日志到追踪：

在 Loki 数据源配置中：

```yaml
datasources:
  - name: Loki
    type: loki
    url: http://loki:3100
    jsonData:
      derivedFields:
        - datasourceName: Tempo
          matcherRegex: "trace_id=(\\w+)"
          name: TraceID
          url: "$${__value.raw}"
```

**在 Grafana Explore 中关联日志**：
1. 在 Prometheus 中查询指标
2. 点击数据点
3. 从上下文菜单选择"View Logs"
4. Loki 查询自动填充相关标签和时间范围
5. 点击日志中的追踪 ID
6. Tempo 追踪视图打开并显示完整分布式追踪

**预期结果：** 点击指标打开相关日志，日志中的追踪 ID 链接到追踪查看器，实现指标/日志/追踪的单一导航面板。

**失败处理：**
- 验证追踪 ID 格式与派生字段中的正则表达式匹配
- 检查 Promtail 管道提取的 trace_id 标签
- 确保 Grafana 中配置了 Tempo 数据源
- 测试复杂过滤表达式的 URL 编码
- 在隐私/无痕浏览器窗口中验证数据链接 URL

### 第 6 步：设置日志保留和压缩

配置保留策略和压缩以管理存储成本。

**按流保留**（在 Loki 配置中）：

```yaml
limits_config:
  retention_period: 720h  # Global default: 30 days

  # Per-tenant retention (requires multi-tenancy enabled)
  per_tenant_override_config: /etc/loki/overrides.yaml

# overrides.yaml
overrides:
  production:
    retention_period: 2160h  # 90 days for production
  staging:
    retention_period: 360h   # 15 days for staging
  development:
    retention_period: 168h   # 7 days for dev
```

**按流标签保留**（需要压缩器）：

```yaml
compactor:
  working_directory: /loki/compactor
  shared_store: filesystem
  compaction_interval: 10m
  retention_enabled: true
  retention_delete_delay: 2h
# ... (see EXAMPLES.md for complete configuration)
```

优先级决定多个规则匹配时适用哪条（数字越小优先级越高）。

**压缩设置**：

```yaml
chunk_store_config:
  chunk_cache_config:
    enable_fifocache: true
    fifocache:
      max_size_bytes: 1GB
      ttl: 24h
# ... (see EXAMPLES.md for complete configuration)
```

**监控保留情况**：

```bash
# Check chunk stats
curl http://localhost:3100/loki/api/v1/status/chunks | jq

# Check compactor metrics
curl http://localhost:3100/metrics | grep loki_compactor

# Verify deleted chunks
curl http://localhost:3100/metrics | grep loki_boltdb_shipper_retention_deleted
```

**预期结果：** 旧日志按保留策略自动删除，存储使用量趋于稳定，压缩减小索引大小。

**失败处理：**
- 如果保留不生效，在 Loki 配置中启用压缩器
- 检查压缩器日志：`docker logs loki | grep compactor`
- 验证 `retention_enabled: true` 和 `retention_deletes_enabled: true`
- 监控磁盘使用：`du -sh /loki/`
- 对于 S3：检查存储桶生命周期策略不与 Loki 保留冲突

## 验证清单

- [ ] Loki API 健康检查返回 200：`curl http://localhost:3100/ready`
- [ ] Promtail 成功从所有配置来源抓取日志
- [ ] 标签从日志行正确提取（在 Grafana Explore 中可见）
- [ ] LogQL 查询以正确过滤返回预期结果
- [ ] 日志保留策略有效（过期日志在保留期后删除）
- [ ] 日志可通过 Grafana 仪表板和 Explore 视图访问
- [ ] 日志中的追踪 ID 链接到 Tempo 追踪查看器
- [ ] 指标面板有数据链接到相关日志
- [ ] 压缩运行并减少存储开销
- [ ] 存储使用量在分配的磁盘/S3 预算内

## 常见问题

- **高基数标签**：使用无限制的标签值（用户 ID、请求 ID）会导致索引爆炸。使用固定标签（level、service、env），将变量放在日志行中。
- **缺少日志解析**：不带标签提取的原始日志发送限制了查询能力。始终解析结构化日志（JSON、logfmt）或对非结构化日志使用正则表达式。
- **时间戳解析错误**：时间戳格式不匹配导致日志乱序或被拒绝。使用示例日志测试时间戳解析。
- **保留不生效**：压缩器必须启用才能删除旧数据。检查 `retention_enabled: true` 和 `retention_deletes_enabled: true`。
- **摄入速率限制**：默认限制（10MB/s）对高容量系统可能过低。调整 `ingestion_rate_mb` 和 `ingestion_burst_size_mb`。
- **查询超时**：跨长时间范围的宽泛查询可能超时。使用更具体的标签选择器和更短的时间窗口。
- **日志重复**：多个 Promtail 实例抓取相同日志会产生重复。使用唯一标签或位置文件协调。

## 相关技能

- `correlate-observability-signals` - 使用追踪 ID 在指标、日志和追踪间统一调试
- `build-grafana-dashboards` - 可视化日志衍生指标并在仪表板中创建日志面板
- `setup-prometheus-monitoring` - 指标提供事故期间何时查询日志的上下文
- `instrument-distributed-tracing` - 向日志添加追踪 ID 以与分布式追踪关联
