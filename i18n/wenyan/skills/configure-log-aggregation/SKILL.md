---
name: configure-log-aggregation
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Set up centralized log aggregation with Loki and Promtail (or ELK stack), including
  log parsing, label extraction, retention policies, and integration with metrics for
  correlation. Use when consolidating logs from multiple services into a searchable
  system, replacing local log files with centralized queryable storage, correlating logs
  with metrics and traces, implementing structured logging with label extraction, or
  troubleshooting production incidents requiring cross-service log analysis.
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

# 設誌聚

以 Loki/Promtail 或 ELK 施中誌收、析、查為行之見。

## 用時

- 聚多服主之誌於可搜之系
- 代本誌檔以中可查之存
- 連誌於量與跡為全察
- 以標取於非構之誌施構誌
- 依存與規設誌之留策
- 察產事需跨服誌析

## 入

- **必**：誌源（應、系、容誌）
- **必**：誌式（JSON、純、syslog 等）
- **可選**：取標則為構查
- **可選**：留與壓策
- **可選**：現存誌運設（Fluentd、Filebeat、Promtail）

## 法

> 見 [Extended Examples](references/EXAMPLES.md) 以全設檔。

### 第一步：擇誌聚之棧

依需擇 Loki（Prometheus 式）或 ELK（Elasticsearch 式）。

**Loki 之善**：
- 輕，為 K8s 與雲生而設
- 標索（如 Prometheus）故存低
- 原於 Grafana 合為一板
- 以物存（S3、GCS）橫展
- 較 Elasticsearch 耗資少

**ELK 之善**：
- 全內容之全文搜（非只標）
- 富查 DSL 與聚
- 成熟態附 beats、logstash 插
- 善於需深史搜之規/審誌

此引專於 **Loki + Promtail**（多數現代宜）。

決之準：
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

**得：** 明擇依需，團下合之裝品。

**敗則：**
- 基存需：Loki 約少於 Elasticsearch 十倍
- 評查式：全搜需對標濾
- 察行冗：ELK 需多調與資

### 第二步：部 Loki

裝設 Loki 附合存後端。

**Docker Compose 部**（`docker-compose.yml`）：

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

**Loki 設**（`loki-config.yml`）：

```yaml
auth_enabled: false

server:
  http_listen_port: 3100
  grpc_listen_port: 9096

# ... (see EXAMPLES.md for complete configuration)
```

**產**附 S3 存：

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

**得：** Loki 啟成，健察於 `http://localhost:3100/ready` 過，誌依留策存。

**敗則：**
- 察 Loki 誌：`docker logs loki`
- 驗存目存且可書
- 試設法：`docker run grafana/loki:2.9.0 -config.file=/etc/loki/local-config.yaml -verify-config`
- 確留設不逾碟
- S3 則驗 IAM 權與桶訪

### 第三步：設 Promtail 運誌

設 Promtail 刮誌送 Loki 附取標。

**Promtail 設**（`promtail-config.yml`）：

```yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml
# ... (see EXAMPLES.md for complete configuration)
```

Promtail 之要：
- **刮設**：定誌源與如何發現
- **管階**：送前變標誌
- **重標設**：依元資動標
- **位檔**：追讀偏免重處

**得：** Promtail 刮設誌檔，標正施，誌經 LogQL 查於 Loki 可見。

**敗則：**
- 察 Promtail 誌：`docker logs promtail`
- 驗檔徑可訪：`docker exec promtail ls /var/log`
- 獨試正則於樣誌
- 察 Promtail 量：`curl http://localhost:9080/metrics | grep promtail`
- 察位檔之進：`cat /tmp/positions.yaml`

### 第四步：以 LogQL 查誌

學 LogQL 之法為濾聚誌。

**基查**：

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

**析與濾**：

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

**聚**（自誌得量）：

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

**以取欄濾**：

```logql
# Find specific trace in logs
{job="app"} | json | trace_id="abc123def456"

# HTTP 5xx errors from nginx
{job="nginx"} | pattern `<_> "<_> <_> <_>" <status> <_>` | status >= 500

# Failed authentication attempts
{job="app"} | json | message=~"authentication failed" | user_id != ""
```

以此建 Grafana Explore 查或板項。

**得：** 查返期誌，濾正行，聚自誌生量。

**敗則：**
- 於 Grafana Explore 互動調
- 察標名：`curl http://localhost:3100/loki/api/v1/labels`
- 驗標值：`curl http://localhost:3100/loki/api/v1/label/{label_name}/values`
- 簡查：始於基標選而漸加濾
- 察時範：窗中或無誌

### 第五步：合誌於量跡

連誌於 Prometheus 量與散跡為一察。

**加 trace ID 於誌**（應儀）：

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

**設 Grafana 資鏈**自量至誌：

於 Prometheus 板欄設：

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

**設 Grafana 資鏈**自誌至跡：

於 Loki 資源設：

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

**於 Grafana Explore 連誌**：
1. 於 Prometheus 查量
2. 點資點
3. 擇境單之「View Logs」
4. Loki 查自填合標與時範
5. 點誌之 trace ID
6. Tempo 跡視開附全散跡

**得：** 點量開相關誌，誌中 trace ID 連至跡視，量/誌/跡一板導。

**敗則：**
- 驗 trace ID 式合衍欄之正則
- 察 trace_id 標為 Promtail 管所取
- 確 Tempo 資源於 Grafana 已設
- 試 URL 編於繁濾
- 於隱瀏覽驗資鏈 URL

### 第六步：設誌之留與縮

設留策與縮以治存本。

**依流之留**（於 Loki 設）：

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

**依流標之留**（需 compactor）：

```yaml
compactor:
  working_directory: /loki/compactor
  shared_store: filesystem
  compaction_interval: 10m
  retention_enabled: true
  retention_delete_delay: 2h
# ... (see EXAMPLES.md for complete configuration)
```

先（小數高先）定多配之則施何者。

**壓設**：

```yaml
chunk_store_config:
  chunk_cache_config:
    enable_fifocache: true
    fifocache:
      max_size_bytes: 1GB
      ttl: 24h
# ... (see EXAMPLES.md for complete configuration)
```

**監留**：

```bash
# Check chunk stats
curl http://localhost:3100/loki/api/v1/status/chunks | jq

# Check compactor metrics
curl http://localhost:3100/metrics | grep loki_compactor

# Verify deleted chunks
curl http://localhost:3100/metrics | grep loki_boltdb_shipper_retention_deleted
```

**得：** 舊誌依留策自刪，存穩，縮減索量。

**敗則：**
- 若留不行，啟 compactor 於 Loki 設
- 察 compactor 誌：`docker logs loki | grep compactor`
- 驗 retention_enabled: true 與 retention_deletes_enabled: true
- 察碟用：`du -sh /loki/`
- S3 則察桶生命策不衝 Loki 留

## 驗

- [ ] Loki API 健察返 200：`curl http://localhost:3100/ready`
- [ ] Promtail 成刮諸設源誌
- [ ] 標自誌正取（於 Grafana Explore 可見）
- [ ] LogQL 查返期果附正濾
- [ ] 誌留策執（留後舊誌刪）
- [ ] 誌於 Grafana 板與 Explore 可訪
- [ ] 誌中 trace ID 連至 Tempo 跡視
- [ ] 量板有至相關誌之資鏈
- [ ] 縮行且減存冗
- [ ] 存於碟/S3 預內

## 陷

- **高基標**：用無界之標值（用戶 ID、請求 ID）生索爆。用定標（級、服、境）而變於誌。
- **缺誌析**：送原誌無取標限查能。必析構誌（JSON、logfmt）或用正則於無構。
- **時析誤**：時戳式不合使誌亂或拒。以樣試時戳析。
- **留不行**：compactor 須啟以刪舊。察 `retention_enabled: true` 與 `retention_deletes_enabled: true`。
- **入率限**：默（10MB/s）於高量系或低。調 `ingestion_rate_mb` 與 `ingestion_burst_size_mb`。
- **查超時**：廣時之廣查或超時。用特標選與短時窗。
- **誌重**：多 Promtail 刮同誌生重。用獨標或位檔協。

## 參

- `correlate-observability-signals` - 以 trace ID 跨量誌跡之調
- `build-grafana-dashboards` - 視自誌得量而建誌板
- `setup-prometheus-monitoring` - 量供何時查誌之境於事中
- `instrument-distributed-tracing` - 加 trace ID 於誌以連散跡
