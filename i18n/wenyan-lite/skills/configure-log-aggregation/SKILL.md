---
name: configure-log-aggregation
locale: wenyan-lite
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

# 配置日誌聚合

以 Loki/Promtail 或 ELK 實行集中式日誌收集、解析、查詢以得運作可見性。

## 適用時機

- 將多服務或主機之日誌合為可搜之系統
- 以集中可查之日誌貯代本地日誌檔
- 將日誌與指標與追蹤關聯以得完整可觀測性
- 行結構化日誌記錄含標籤抽取
- 據貯藏與合規定日誌保留策
- 診需跨服務日誌分析之生產事件

## 輸入

- **必要**：日誌源（應用日誌、系統日誌、容器日誌）
- **必要**：日誌格式模式（JSON、純文、syslog 等）
- **選擇性**：結構化查詢之標籤抽取規則
- **選擇性**：保留與壓縮策
- **選擇性**：既有日誌托運配置（Fluentd、Filebeat、Promtail）

## 步驟

> 見 [Extended Examples](references/EXAMPLES.md) 取完整配置檔與模板。

### 步驟一：擇日誌聚合棧

據需求於 Loki（Prometheus 式）與 ELK（Elasticsearch 式）之間擇。

**Loki 之利**：
- 輕量，為 Kubernetes 與雲原生環境設計
- 標籤式索引（如 Prometheus），低貯藏負
- 與 Grafana 原生整合以得統一儀表板
- 物件貯（S3、GCS）水平擴展
- 較 Elasticsearch 更低資源耗

**ELK 之利**：
- 全文搜索跨所有日誌內容（非僅標籤）
- 豐查詢 DSL 與聚合
- 成熟生態含 beats、logstash 外掛
- 較宜合規/稽核日誌需深史搜

本指南專注於 **Loki + Promtail**（多數現代設之推薦）。

抉擇標準：
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

**預期：** 據需求作明擇，團隊下載適合之裝產物。

**失敗時：**
- 基準貯需：同日誌 Loki 較 Elasticsearch 少約 10 倍
- 評查詢模式：全文搜需 vs 標籤篩
- 慮運作負：ELK 需更多調校與資源

### 步驟二：部署 Loki

裝並配 Loki 含合適貯後端。

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

**生產**含 S3 貯：

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

**預期：** Loki 成功啟，`http://localhost:3100/ready` 健康檢查通過，日誌依保留策貯。

**失敗時：**
- 查 Loki 日誌：`docker logs loki`
- 驗貯目錄存且可寫
- 測配置語法：`docker run grafana/loki:2.9.0 -config.file=/etc/loki/local-config.yaml -verify-config`
- 確保留設不超磁碟容
- S3 則驗 IAM 權限與 bucket 存取

### 步驟三：配 Promtail 以運日誌

設 Promtail 以爬日誌並轉至 Loki 含標籤抽取。

**Promtail 配置**（`promtail-config.yml`）：

```yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml
# ... (see EXAMPLES.md for complete configuration)
```

Promtail 關鍵概念：
- **爬取配置**：定日誌源及其發現法
- **管線階段**：送 Loki 前轉並標日誌
- **重標配置**：據元數據動態標
- **位置檔**：追讀偏移以免重處

**預期：** Promtail 爬已配日誌檔，標正確施，日誌經 LogQL 查詢見於 Loki。

**失敗時：**
- 查 Promtail 日誌：`docker logs promtail`
- 驗檔路徑可達：`docker exec promtail ls /var/log`
- 以樣本日誌行獨立測正則
- 監 Promtail 指標：`curl http://localhost:9080/metrics | grep promtail`
- 查位置檔進度：`cat /tmp/positions.yaml`

### 步驟四：以 LogQL 查日誌

學 LogQL 語法以篩與聚合日誌。

**基本查詢**：

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

**解析與篩**：

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

**聚合**（自日誌生指標）：

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

**以抽取欄位篩**：

```logql
# Find specific trace in logs
{job="app"} | json | trace_id="abc123def456"

# HTTP 5xx errors from nginx
{job="nginx"} | pattern `<_> "<_> <_> <_>" <status> <_>` | status >= 500

# Failed authentication attempts
{job="app"} | json | message=~"authentication failed" | user_id != ""
```

以此模式建 Grafana 探索查詢或儀表板面板。

**預期：** 查詢返預期日誌行，篩正確運，聚合自日誌生指標。

**失敗時：**
- 用 Grafana Explore 互動除錯查詢
- 查標籤名：`curl http://localhost:3100/loki/api/v1/labels`
- 驗標籤值：`curl http://localhost:3100/loki/api/v1/label/{label_name}/values`
- 簡查詢：始基本標籤選擇器，漸加篩
- 查時範圍：日誌或不於所選窗

### 步驟五：將日誌與指標與追蹤整合

以關聯日誌與 Prometheus 指標與分布追蹤得統一可觀測性。

**加追蹤 ID 於日誌**（應用埋點）：

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

**配 Grafana 數據連結**自指標至日誌：

Prometheus 面板欄位配置中：

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

**配 Grafana 數據連結**自日誌至追蹤：

Loki 數據源配置中：

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

**於 Grafana Explore 關聯日誌**：
1. 於 Prometheus 查指標
2. 點數據點
3. 從脈絡選單選「View Logs」
4. Loki 查詢自填相關標籤與時範圍
5. 點日誌中追蹤 ID
6. Tempo 追蹤視圖開含完整分布追蹤

**預期：** 點指標開相關日誌，日誌中追蹤 ID 連追蹤檢視器，指標/日誌/追蹤於單一視窗導航。

**失敗時：**
- 驗追蹤 ID 格式合 derived fields 之正則
- 查 trace_id 標籤為 Promtail 管線抽取
- 確 Grafana 中已配 Tempo 數據源
- 測複雜篩表達之 URL 編碼
- 於無痕/私瀏覽器驗數據連結 URL

### 步驟六：設日誌保留與壓縮

配保留策與壓縮以管貯成本。

**按流保留**（Loki 配置中）：

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

**按流標籤保留**（需 compactor）：

```yaml
compactor:
  working_directory: /loki/compactor
  shared_store: filesystem
  compaction_interval: 10m
  retention_enabled: true
  retention_delete_delay: 2h
# ... (see EXAMPLES.md for complete configuration)
```

優先決定多匹配時施何規則（低數＝高優先）。

**壓縮設**：

```yaml
chunk_store_config:
  chunk_cache_config:
    enable_fifocache: true
    fifocache:
      max_size_bytes: 1GB
      ttl: 24h
# ... (see EXAMPLES.md for complete configuration)
```

**監保留**：

```bash
# Check chunk stats
curl http://localhost:3100/loki/api/v1/status/chunks | jq

# Check compactor metrics
curl http://localhost:3100/metrics | grep loki_compactor

# Verify deleted chunks
curl http://localhost:3100/metrics | grep loki_boltdb_shipper_retention_deleted
```

**預期：** 舊日誌依保留策自刪，貯用穩，壓縮減索引大小。

**失敗時：**
- 若保留不運則於 Loki 配置啟 compactor
- 查 compactor 日誌：`docker logs loki | grep compactor`
- 驗 retention_enabled: true 且 retention_deletes_enabled: true
- 監磁碟用：`du -sh /loki/`
- S3 則查 bucket 生命週期策不與 Loki 保留衝突

## 驗證

- [ ] Loki API 健康檢查返 200：`curl http://localhost:3100/ready`
- [ ] Promtail 成功自所有已配源爬日誌
- [ ] 標籤正確自日誌行抽（於 Grafana Explore 可見）
- [ ] LogQL 查詢返含妥篩之預期結果
- [ ] 日誌保留策行（保留期後舊日誌刪）
- [ ] 日誌可自 Grafana 儀表板與 Explore 視圖達
- [ ] 日誌之追蹤 ID 連至 Tempo 追蹤檢視器
- [ ] 指標面板有至相關日誌之數據連結
- [ ] 壓縮運且減貯負
- [ ] 貯用於分配之磁碟/S3 預算內

## 常見陷阱

- **高基數標籤**：用無界標籤值（用戶 ID、請求 ID）致索引爆炸。用固定標籤（level、service、env）並將變數置於日誌行中
- **缺日誌解析**：送原日誌而無標籤抽限查詢能。總解結構化日誌（JSON、logfmt）或用正則於非結構
- **時戳解析誤**：不合時戳格式致日誌亂序或被拒。以樣本日誌測時戳解析
- **保留不運**：compactor 須啟以令保留刪舊數據。查 `retention_enabled: true` 且 `retention_deletes_enabled: true`
- **入速率限**：預設限（10MB/s）於高量系統或過低。調 `ingestion_rate_mb` 與 `ingestion_burst_size_mb`
- **查詢超時**：長時範圍之廣查詢可超時。用更具體之標籤選擇器與更短時窗
- **日誌重複**：多 Promtail 實例爬同日誌生重。用獨標籤或位置檔協調

## 相關技能

- `correlate-observability-signals` - 以追蹤 ID 跨指標、日誌、追蹤之統一調試
- `build-grafana-dashboards` - 視覺化日誌衍生指標並於儀表板建日誌面板
- `setup-prometheus-monitoring` - 指標供事件中何時查日誌之脈絡
- `instrument-distributed-tracing` - 加追蹤 ID 於日誌以關聯分布追蹤
