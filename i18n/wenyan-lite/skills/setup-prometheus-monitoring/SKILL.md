---
name: setup-prometheus-monitoring
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Configure Prometheus for time-series metrics collection, including scrape configurations,
  service discovery, recording rules, and federation patterns for multi-cluster deployments.
  Use when setting up centralized metrics collection for microservices, implementing time-series
  monitoring for application and infrastructure, establishing a foundation for SLO/SLI tracking
  and alerting, or migrating from legacy monitoring solutions to a modern observability stack.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: observability
  complexity: intermediate
  language: multi
  tags: prometheus, monitoring, metrics, scrape, recording-rules
---

# 設置 Prometheus 監控

配置生產就緒之 Prometheus 部署，含採集目標、記錄規則與聯邦。

## 適用時機

- 為微服務或分散式系統設置集中化指標收集
- 為應用與基礎設施指標實作時序監控
- 為 SLO/SLI 追蹤與警報建立基礎
- 經聯邦從多 Prometheus 實例整合指標
- 從遺留監控方案遷移至現代可觀察性堆疊

## 輸入

- **必要**：採集目標清單（服務、匯出器、端點）
- **必要**：保留期與儲存要求
- **選擇性**：既有服務發現機制（Kubernetes、Consul、EC2）
- **選擇性**：預聚合指標之記錄規則
- **選擇性**：多集群設置之聯邦階層

## 步驟

### 步驟一：安裝並配置 Prometheus

以全域設定與採集間隔建立基底 Prometheus 配置。

```bash
# Create Prometheus directory structure
mkdir -p /etc/prometheus/{rules,file_sd}
mkdir -p /var/lib/prometheus

# Download Prometheus (adjust version as needed)
cd /tmp
wget https://github.com/prometheus/prometheus/releases/download/v2.48.0/prometheus-2.48.0.linux-amd64.tar.gz
tar xvf prometheus-2.48.0.linux-amd64.tar.gz
sudo cp prometheus-2.48.0.linux-amd64/{prometheus,promtool} /usr/local/bin/
```

建立 `/etc/prometheus/prometheus.yml`：

```yaml
global:
  scrape_interval: 15s
  scrape_timeout: 10s
  evaluation_interval: 15s
  external_labels:
    cluster: 'production'
    region: 'us-east-1'

# Alertmanager configuration
alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - localhost:9093

# Load recording and alerting rules
rule_files:
  - "rules/*.yml"

# Scrape configurations
scrape_configs:
  # Prometheus self-monitoring
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
        labels:
          env: 'production'

  # Node exporter for host metrics
  - job_name: 'node'
    static_configs:
      - targets:
          - 'node1:9100'
          - 'node2:9100'
        labels:
          env: 'production'

  # Application metrics with file-based service discovery
  - job_name: 'app-services'
    file_sd_configs:
      - files:
          - '/etc/prometheus/file_sd/services.json'
        refresh_interval: 30s
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance
      - source_labels: [env]
        target_label: environment
```

**預期：** Prometheus 成功啟動、Web UI 於 `http://localhost:9090` 可存取、目標於 Status > Targets 列出。

**失敗時：**
- 以 `promtool check config /etc/prometheus/prometheus.yml` 檢查語法
- 驗證文件權限：`sudo chown -R prometheus:prometheus /etc/prometheus /var/lib/prometheus`
- 檢查日誌：`journalctl -u prometheus -f`

### 步驟二：配置服務發現

設置動態目標發現以避免手動目標管理。

對 **Kubernetes** 環境，加至 `scrape_configs`：

```yaml
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      # Only scrape pods with prometheus.io/scrape annotation
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      # Use custom port if specified
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        target_label: __address__
        regex: ([^:]+)(?::\d+)?;(\d+)
        replacement: $1:$2
      # Add namespace as label
      - source_labels: [__meta_kubernetes_namespace]
        target_label: kubernetes_namespace
      # Add pod name as label
      - source_labels: [__meta_kubernetes_pod_name]
        target_label: kubernetes_pod_name
```

對**基於文件**之服務發現，建立 `/etc/prometheus/file_sd/services.json`：

```json
[
  {
    "targets": ["web-app-1:8080", "web-app-2:8080"],
    "labels": {
      "job": "web-app",
      "env": "production",
      "team": "platform"
    }
  },
  {
    "targets": ["api-service-1:9090", "api-service-2:9090"],
    "labels": {
      "job": "api-service",
      "env": "production",
      "team": "backend"
    }
  }
]
```

對 **Consul** 服務發現：

```yaml
  - job_name: 'consul-services'
    consul_sd_configs:
      - server: 'consul.example.com:8500'
        services: []  # Empty list means discover all services
    relabel_configs:
      - source_labels: [__meta_consul_service]
        target_label: job
      - source_labels: [__meta_consul_tags]
        regex: '.*,monitoring,.*'
        action: keep
```

**預期：** 動態目標出現於 Prometheus UI，於服務擴展或變化時自動更新。

**失敗時：**
- Kubernetes：以 `kubectl auth can-i list pods --as=system:serviceaccount:monitoring:prometheus` 驗證 RBAC 權限
- File SD：以 `python -m json.tool /etc/prometheus/file_sd/services.json` 驗證 JSON 語法
- Consul：以 `curl http://consul.example.com:8500/v1/catalog/services` 測試連線

### 步驟三：建立記錄規則

預聚合昂貴查詢以提升儀表板效能與警報效率。

建立 `/etc/prometheus/rules/recording_rules.yml`：

```yaml
groups:
  - name: api_aggregations
    interval: 30s
    rules:
      # Calculate request rate per endpoint (5m window)
      - record: job:http_requests:rate5m
        expr: |
          sum by (job, endpoint, method) (
            rate(http_requests_total[5m])
          )

      # Calculate error rate percentage
      - record: job:http_errors:rate5m
        expr: |
          sum by (job) (
            rate(http_requests_total{status=~"5.."}[5m])
          ) / sum by (job) (
            rate(http_requests_total[5m])
          ) * 100

      # P95 latency by endpoint
      - record: job:http_request_duration_seconds:p95
        expr: |
          histogram_quantile(0.95,
            sum by (job, endpoint, le) (
              rate(http_request_duration_seconds_bucket[5m])
            )
          )

  - name: resource_aggregations
    interval: 1m
    rules:
      # CPU usage by instance
      - record: instance:cpu_usage:ratio
        expr: |
          1 - avg by (instance) (
            rate(node_cpu_seconds_total{mode="idle"}[5m])
          )

      # Memory usage percentage
      - record: instance:memory_usage:ratio
        expr: |
          1 - (
            node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes
          )

      # Disk usage by mount point
      - record: instance:disk_usage:ratio
        expr: |
          1 - (
            node_filesystem_avail_bytes{fstype!~"tmpfs|fuse.*"}
            / node_filesystem_size_bytes{fstype!~"tmpfs|fuse.*"}
          )
```

驗證並重新載入：

```bash
# Validate rules syntax
promtool check rules /etc/prometheus/rules/recording_rules.yml

# Reload Prometheus configuration (without restart)
curl -X POST http://localhost:9090/-/reload

# Or send SIGHUP signal
sudo killall -HUP prometheus
```

**預期：** 記錄規則成功評估、含 `job:` 前綴之新指標於 Prometheus 中可見、儀表板查詢效能改善。

**失敗時：**
- 以 `promtool check rules` 檢查規則語法
- 驗證評估間隔符合資料可用性
- 檢查缺失之源指標：`curl http://localhost:9090/api/v1/targets`
- 審視評估錯誤之日誌：`journalctl -u prometheus | grep -i error`

### 步驟四：配置儲存與保留

為保留要求與查詢效能優化儲存。

編輯 `/etc/systemd/system/prometheus.service`：

```ini
[Unit]
Description=Prometheus Monitoring System
Documentation=https://prometheus.io/docs/introduction/overview/
After=network-online.target

[Service]
Type=simple
User=prometheus
Group=prometheus
ExecStart=/usr/local/bin/prometheus \
  --config.file=/etc/prometheus/prometheus.yml \
  --storage.tsdb.path=/var/lib/prometheus \
  --storage.tsdb.retention.time=30d \
  --storage.tsdb.retention.size=50GB \
  --web.console.templates=/etc/prometheus/consoles \
  --web.console.libraries=/etc/prometheus/console_libraries \
  --web.listen-address=:9090 \
  --web.enable-lifecycle \
  --web.enable-admin-api

Restart=always
RestartSec=10s

[Install]
WantedBy=multi-user.target
```

關鍵儲存旗標：
- `--storage.tsdb.retention.time=30d`：保留 30 日資料
- `--storage.tsdb.retention.size=50GB`：限儲存至 50GB（先觸者為準）
- `--storage.tsdb.wal-compression`：啟用 WAL 壓縮（降低磁碟 I/O）
- `--web.enable-lifecycle`：允許經 HTTP POST 重新載入配置
- `--web.enable-admin-api`：啟用快照與刪除 API

啟用並啟動：

```bash
sudo systemctl daemon-reload
sudo systemctl enable prometheus
sudo systemctl start prometheus
sudo systemctl status prometheus
```

**預期：** Prometheus 依政策保留指標、磁碟用量於限制內、舊資料自動修剪。

**失敗時：**
- 監控磁碟用量：`du -sh /var/lib/prometheus`
- 檢查 TSDB 統計：`curl http://localhost:9090/api/v1/status/tsdb`
- 驗證保留設定：`curl http://localhost:9090/api/v1/status/runtimeinfo | jq .data.storageRetention`
- 強制清理：`curl -X POST http://localhost:9090/api/v1/admin/tsdb/delete_series?match[]={__name__=~".+"}`

### 步驟五：設置聯邦（多集群）

配置階層 Prometheus 以跨集群聚合指標。

於**邊緣 Prometheus** 實例（每集群中），確保外部標籤已設：

```yaml
global:
  external_labels:
    cluster: 'production-east'
    datacenter: 'us-east-1'
```

於**中央 Prometheus** 實例，加入聯邦採集配置：

```yaml
scrape_configs:
  - job_name: 'federate-production'
    honor_labels: true
    metrics_path: '/federate'
    params:
      'match[]':
        # Aggregate only pre-computed recording rules
        - '{__name__=~"job:.*"}'
        # Include alert states
        - '{__name__=~"ALERTS.*"}'
        # Include critical infrastructure metrics
        - 'up{job=~".*"}'
    static_configs:
      - targets:
          - 'prometheus-east.example.com:9090'
          - 'prometheus-west.example.com:9090'
        labels:
          env: 'production'
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance
      - source_labels: [__address__]
        regex: 'prometheus-(.*).example.com.*'
        target_label: cluster
        replacement: '$1'
```

聯邦最佳實務：
- 用 `honor_labels: true` 保留原始標籤
- 僅聯邦記錄規則與聚合（非原始指標）
- 設適當之採集間隔（長於邊緣 Prometheus 之評估）
- 用 `match[]` 過濾指標（避免聯邦所有）

**預期：** 中央 Prometheus 顯示自所有集群之聯邦指標、查詢可跨多區域、最小資料重複。

**失敗時：**
- 驗證聯邦端點可存取：`curl http://prometheus-east.example.com:9090/federate?match[]={__name__=~"job:.*"} | head -20`
- 檢查標籤衝突（中央對邊緣外部標籤）
- 監控聯邦延遲：比較時戳差異
- 審視匹配模式：`curl http://localhost:9090/api/v1/label/__name__/values | jq .data | grep "job:"`

### 步驟六：實作高可用（選擇性）

部署冗餘 Prometheus 實例附相同配置以作故障轉移。

用 **Thanos** 或 **Cortex** 作真 HA，或簡單之負載均衡設置：

```yaml
# prometheus-1.yml and prometheus-2.yml (identical configs)
global:
  scrape_interval: 15s
  external_labels:
    prometheus: 'prometheus-1'  # Different per instance
    replica: 'A'

# Use --web.external-url flag for each instance
# prometheus-1: --web.external-url=http://prometheus-1.example.com:9090
# prometheus-2: --web.external-url=http://prometheus-2.example.com:9090
```

配置 Grafana 以查詢兩實例：

```json
{
  "name": "Prometheus-HA",
  "type": "prometheus",
  "url": "http://prometheus-lb.example.com",
  "jsonData": {
    "httpMethod": "POST",
    "timeInterval": "15s"
  }
}
```

用 HAProxy 或 nginx 作負載均衡：

```nginx
upstream prometheus_backend {
    server prometheus-1.example.com:9090 max_fails=3 fail_timeout=30s;
    server prometheus-2.example.com:9090 max_fails=3 fail_timeout=30s;
}

server {
    listen 9090;
    location / {
        proxy_pass http://prometheus_backend;
        proxy_set_header Host $host;
    }
}
```

**預期：** 查詢請求跨實例均衡、若一實例下線自動故障轉移、單實例失敗時無資料遺失。

**失敗時：**
- 驗證兩實例採集相同目標（小時間偏差可接受）
- 檢查實例間之配置漂移
- 監控查詢中之去重（Grafana 顯示重複序列）
- 審視負載均衡器之健康檢查

## 驗證

- [ ] Prometheus Web UI 於預期端點可存取
- [ ] 所有已配置之採集目標於 Status > Targets 顯示為 UP
- [ ] 服務發現如預期動態增/刪目標
- [ ] 記錄規則成功評估（日誌中無錯）
- [ ] 指標保留符合配置之時間/大小限制
- [ ] 聯邦（若已配置）自邊緣實例拉指標
- [ ] 查詢返回預期之指標基數（不過量）
- [ ] 磁碟用量穩定且於分配儲存預算內
- [ ] 配置重新載入經 HTTP 端點或 SIGHUP 運作
- [ ] Prometheus 自監控指標可用（up、採集時長等）

## 常見陷阱

- **高基數指標**：避免無界值之標籤（用戶 ID、時戳、UUID）。用記錄規則於儲存前聚合。
- **採集間隔不匹配**：記錄規則應以等於或大於採集間隔之間隔評估，以避免缺口。
- **聯邦過載**：聯邦所有指標造成龐大資料重複。僅聯邦聚合之記錄規則。
- **缺重新標記配置**：無適當重新標記，服務發現可造成混亂或重複標籤。
- **保留過短**：將保留設長於最長儀表板時間視窗，以避免「無資料」缺口。
- **無資源限制**：Prometheus 可於高基數消耗過量記憶體。設 `--storage.tsdb.max-block-duration` 並監控堆用量。
- **停用生命週期端點**：無 `--web.enable-lifecycle`，配置重新載入需完整重啟引發採集缺口。

## 相關技能

- `configure-alerting-rules` - 依 Prometheus 指標定義警報規則並路由至 Alertmanager
- `build-grafana-dashboards` - 以 Grafana 儀表板與面板視覺化 Prometheus 指標
- `define-slo-sli-sla` - 用 Prometheus 記錄規則與錯誤預算追蹤建立 SLO/SLI 目標
- `instrument-distributed-tracing` - 以分散式追蹤補足指標以更深之可觀察性
