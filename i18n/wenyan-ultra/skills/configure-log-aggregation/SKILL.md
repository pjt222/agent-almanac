---
name: configure-log-aggregation
locale: wenyan-ultra
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

# 配日聚

以 Loki/Promtail 或 ELK 施中集日收、析、查以運可見。

## 用

- 合多服/主日於可查系
- 替本地日檔為集中可查存
- 日與度跡關聯以全可觀
- 結構日含標抽以析
- 依存與合規設日留策
- 產事查須跨服日析

## 入

- **必**：日源（應用日、系日、容器日）
- **必**：日格（JSON、素、syslog 等）
- **可**：標抽規以結構查
- **可**：留與壓策
- **可**：現日輸配（Fluentd、Filebeat、Promtail）

## 行

> 見 [Extended Examples](references/EXAMPLES.md) 以全配與模。

### 一：擇日聚堆

於 Loki（Prometheus 式）與 ELK（Elasticsearch 基）間擇。

**Loki 利**：
- 輕，為 K8s 與雲原生設
- 標索引（如 Prometheus）減存負
- Grafana 原生整
- 水平擴以物存（S3、GCS）
- 資耗較 Elasticsearch 少

**ELK 利**：
- 諸日全文搜（非只標）
- 富查 DSL 與聚
- 成熟生態含 beats、logstash plugin
- 合規/審計需深史搜為宜

此導焦 **Loki + Promtail**（新設多宜）。

決準：
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

**得：** 依求明擇，組下宜之裝構件。

**敗：**
- 基準存求：Loki 較 Elasticsearch ~10x 少
- 評查模：全文搜 vs 標濾
- 察運負：ELK 須多調與資

### 二：部 Loki

裝且配 Loki 含宜存後。

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

**Loki 配**（`loki-config.yml`）：

```yaml
auth_enabled: false

server:
  http_listen_port: 3100
  grpc_listen_port: 9096

# ... (see EXAMPLES.md for complete configuration)
```

**生產** 含 S3 存：

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

**得：** Loki 成啟，健察過於 `http://localhost:3100/ready`，日按留策存。

**敗：**
- 察 Loki 日：`docker logs loki`
- 驗存目錄在且可寫
- 測配語：`docker run grafana/loki:2.9.0 -config.file=/etc/loki/local-config.yaml -verify-config`
- 確留設不超盤量
- S3：驗 IAM 權與桶存取

### 三：配 Promtail 以輸日

設 Promtail 以刮日且附標抽前轉至 Loki。

**Promtail 配**（`promtail-config.yml`）：

```yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml
# ... (see EXAMPLES.md for complete configuration)
```

Promtail 要念：
- **Scrape configs**：定日源與如何發現
- **Pipeline stages**：發前變與標日
- **Relabel configs**：依元動標
- **Positions file**：追讀偏以避重處

**得：** Promtail 刮已配日檔，標正施，日經 LogQL 於 Loki 可見。

**敗：**
- 察 Promtail 日：`docker logs promtail`
- 驗檔路可達：`docker exec promtail ls /var/log`
- 以樣日獨測正則
- 察 Promtail 度：`curl http://localhost:9080/metrics | grep promtail`
- 察 positions 檔進：`cat /tmp/positions.yaml`

### 四：以 LogQL 查日

學 LogQL 語以濾與聚日。

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

**聚**（從日生度）：

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

**依抽欄濾**：

```logql
# Find specific trace in logs
{job="app"} | json | trace_id="abc123def456"

# HTTP 5xx errors from nginx
{job="nginx"} | pattern `<_> "<_> <_> <_>" <status> <_>` | status >= 500

# Failed authentication attempts
{job="app"} | json | message=~"authentication failed" | user_id != ""
```

以此模建 Grafana explore 查或板。

**得：** 查返預期日，濾正行，聚從日生度。

**敗：**
- 用 Grafana Explore 互式調查
- 察標名：`curl http://localhost:3100/loki/api/v1/labels`
- 驗標值：`curl http://localhost:3100/loki/api/v1/label/{label_name}/values`
- 簡查：起於基標選，漸加濾
- 察時範：日或不在所選窗

### 五：整日於度與跡

以 Prometheus 度與分散跡關聯日為統一可觀。

**於日加 trace ID**（應用埋點）：

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

**配 Grafana 數據鏈** 從度至日：

於 Prometheus 板欄配：

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

**配 Grafana 數據鏈** 從日至跡：

於 Loki datasource 配：

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

**於 Grafana Explore 關聯日**：
1. 於 Prometheus 查度
2. 點數據
3. 於脈菜擇「View Logs」
4. Loki 查自填關標與時範
5. 於日點 trace ID
6. Tempo 跡視開示全分散跡

**得：** 點度開相關日，日中 trace ID 鏈至跡視，單窗察度/日/跡。

**敗：**
- 驗 trace ID 格匹 derivedFields 正則
- 察 trace_id 標為 Promtail pipeline 抽
- 確 Tempo datasource 已於 Grafana 配
- 測複濾式之 URL 編碼
- 於匿名/私瀏窗驗數據鏈 URL

### 六：設日留與壓

配留策與壓以管存費。

**依流留**（於 Loki 配）：

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

**依流標留**（須 compactor）：

```yaml
compactor:
  working_directory: /loki/compactor
  shared_store: filesystem
  compaction_interval: 10m
  retention_enabled: true
  retention_delete_delay: 2h
# ... (see EXAMPLES.md for complete configuration)
```

優先決多規匹時何規施（小數＝高優）。

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

**得：** 舊日按留策自刪，存用穩，壓減索尺。

**敗：**
- 留不行→於 Loki 配啟 compactor
- 察 compactor 日：`docker logs loki | grep compactor`
- 驗 retention_enabled: true 且 retention_deletes_enabled: true
- 察盤用：`du -sh /loki/`
- S3：察桶生命策不衝 Loki 留

## 驗

- [ ] Loki API 健察返 200：`curl http://localhost:3100/ready`
- [ ] Promtail 成刮諸配日源
- [ ] 標正抽於日行（於 Grafana Explore 可見）
- [ ] LogQL 查返預期含適濾
- [ ] 日留策執（舊日留期後刪）
- [ ] 日於 Grafana 板與 Explore 可達
- [ ] 日中 trace ID 鏈至 Tempo 跡視
- [ ] 度板有至相關日之數據鏈
- [ ] 壓行減存負
- [ ] 存用於分配盤/S3 預算內

## 忌

- **高基數標**：無界標值（用戶 ID、求 ID）致索爆。用定標（level、service、env）變入日行。
- **無日析**：發生日而無標抽限查。必析結構日（JSON、logfmt）或正則析無結構。
- **時析誤**：時格不合致日序亂或拒。以樣日測時析。
- **留不行**：compactor 須啟方刪舊。察 `retention_enabled: true` 與 `retention_deletes_enabled: true`。
- **入率限**：默（10MB/s）或於高量低。調 `ingestion_rate_mb` 與 `ingestion_burst_size_mb`。
- **查超時**：廣查於長期或超時。用具體標選與短時窗。
- **日重**：多 Promtail 刮同日生重。用唯標或 positions 檔協調。

## 參

- `correlate-observability-signals` - 經 trace ID 統合度、日、跡除錯
- `build-grafana-dashboards` - 視日生度且建板之日面板
- `setup-prometheus-monitoring` - 度供事中查日之脈
- `instrument-distributed-tracing` - 於日加 trace ID 關聯分散跡
