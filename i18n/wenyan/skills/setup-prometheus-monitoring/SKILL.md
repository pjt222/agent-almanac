---
name: setup-prometheus-monitoring
locale: wenyan
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

# 設 Prometheus 之監

配生產可用之 Prometheus 展，附抓目、錄則、與聯邦。

## 用時

- 為微服或分布之系設集中之指收乃用
- 為應與基設之指監乃用
- 為 SLO/SLI 之跟與警立基乃用
- 經聯邦合多 Prometheus 之指乃用
- 自舊監遷至現代可察棧乃用

## 入

- **必要**：抓目之列（服、輸出器、端）
- **必要**：留期與存之求
- **可選**：既有服發機（Kubernetes、Consul、EC2）
- **可選**：為預聚指之錄則
- **可選**：為多集之聯邦層

## 法

### 第一步：裝而配 Prometheus

立基 Prometheus 配附全設與抓間。

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

立 `/etc/prometheus/prometheus.yml`：

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

得：Prometheus 啟成，Web UI 於 `http://localhost:9090` 可達，目於 Status > Targets 列。

敗則：
- 以 `promtool check config /etc/prometheus/prometheus.yml` 察語
- 驗權：`sudo chown -R prometheus:prometheus /etc/prometheus /var/lib/prometheus`
- 察日誌：`journalctl -u prometheus -f`

### 第二步：配服發

設動目發以免人手管目。

於 **Kubernetes** 之境，加於 `scrape_configs`：

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

為**文件**之服發，立 `/etc/prometheus/file_sd/services.json`：

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

為 **Consul** 之服發：

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

得：動目現於 Prometheus UI，自更於服擴或變。

敗則：
- Kubernetes：以 `kubectl auth can-i list pods --as=system:serviceaccount:monitoring:prometheus` 驗 RBAC
- File SD：以 `python -m json.tool /etc/prometheus/file_sd/services.json` 驗 JSON
- Consul：以 `curl http://consul.example.com:8500/v1/catalog/services` 試連

### 第三步：立錄則

預聚貴查以利儀表性能與警之效。

立 `/etc/prometheus/rules/recording_rules.yml`：

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

驗而重載：

```bash
# Validate rules syntax
promtool check rules /etc/prometheus/rules/recording_rules.yml

# Reload Prometheus configuration (without restart)
curl -X POST http://localhost:9090/-/reload

# Or send SIGHUP signal
sudo killall -HUP prometheus
```

得：錄則評成，新指於 Prometheus 以 `job:` 前綴可見，儀表查性能進。

敗則：
- 以 `promtool check rules` 察則語
- 驗評間合於數可得
- 察缺源指：`curl http://localhost:9090/api/v1/targets`
- 察日誌之評誤：`journalctl -u prometheus | grep -i error`

### 第四步：配存與留

依留之求與查性能優存。

編 `/etc/systemd/system/prometheus.service`：

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

要存之旗：

- `--storage.tsdb.retention.time=30d`：留 30 日之數
- `--storage.tsdb.retention.size=50GB`：限存於 50GB（先觸者勝）
- `--storage.tsdb.wal-compression`：啟 WAL 壓（減 I/O）
- `--web.enable-lifecycle`：許 HTTP POST 重載配
- `--web.enable-admin-api`：啟快照與刪 API

啟而行：

```bash
sudo systemctl daemon-reload
sudo systemctl enable prometheus
sudo systemctl start prometheus
sudo systemctl status prometheus
```

得：Prometheus 依策留指，盤用於限內，舊數自剪。

敗則：
- 監盤用：`du -sh /var/lib/prometheus`
- 察 TSDB 統：`curl http://localhost:9090/api/v1/status/tsdb`
- 驗留設：`curl http://localhost:9090/api/v1/status/runtimeinfo | jq .data.storageRetention`
- 強清：`curl -X POST http://localhost:9090/api/v1/admin/tsdb/delete_series?match[]={__name__=~".+"}`

### 第五步：設聯邦（多集）

配層 Prometheus 以聚跨集之指。

於**邊 Prometheus**（每集），確外標已設：

```yaml
global:
  external_labels:
    cluster: 'production-east'
    datacenter: 'us-east-1'
```

於**中 Prometheus**，加聯邦抓配：

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

聯邦之佳實踐：

- 用 `honor_labels: true` 保原標
- 唯聯邦錄則與聚（非原指）
- 設宜抓間（長於邊 Prometheus 之評）
- 用 `match[]` 濾指（避全聯邦）

得：中 Prometheus 示自諸集之聯邦指，查可跨域，數重少。

敗則：
- 驗聯邦端可訪：`curl http://prometheus-east.example.com:9090/federate?match[]={__name__=~"job:.*"} | head -20`
- 察標衝（中 vs 邊外標）
- 監聯邦延：比戳之差
- 察 match 之模：`curl http://localhost:9090/api/v1/label/__name__/values | jq .data | grep "job:"`

### 第六步：施高可用（可選）

展同配之冗 Prometheus 以為失移。

用 **Thanos** 或 **Cortex** 為真 HA，或簡載均之設：

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

配 Grafana 以查二實例：

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

用 HAProxy 或 nginx 為載均：

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

得：查請均於諸實，一實敗則自移，單實敗無數失。

敗則：
- 驗二實抓同目（微時偏可受）
- 察實間配漂
- 監查中之去重（Grafana 示重系）
- 察載均之健察

## 驗

- [ ] Prometheus Web UI 於預期端可達
- [ ] 諸所配抓目於 Status > Targets 示為 UP
- [ ] 服發如預動加/除目
- [ ] 錄則評成（日無誤）
- [ ] 指留合所配時/大限
- [ ] 聯邦（若配）自邊實拉指
- [ ] 查返預期之指基數（不過繁）
- [ ] 盤用穩於所派之存預算內
- [ ] 配重載以 HTTP 端或 SIGHUP 行
- [ ] Prometheus 自監之指可得（up、抓時等）

## 陷

- **高基指**：避無界值之標（用戶 ID、戳、UUID）。用錄則於存前聚
- **抓間不合**：錄則評之間宜等於或大於抓間以免缺
- **聯邦過載**：聯邦諸指生大數重。唯聯邦聚之錄則
- **缺 relabel 配**：無正之 relabel，服發或致惑或重之標
- **留過短**：設留長於最長儀表之時窗以免「無數」之缺
- **無資源限**：高基時 Prometheus 可耗記憶過繁。設 `--storage.tsdb.max-block-duration` 而監堆用
- **禁周期端**：無 `--web.enable-lifecycle`，配重載需全重啟致抓缺

## 參

- `configure-alerting-rules` — 依 Prometheus 指定警則而導 Alertmanager
- `build-grafana-dashboards` — 以 Grafana 儀表與板現 Prometheus 指
- `define-slo-sli-sla` — 以 Prometheus 錄則與誤算預算立 SLO/SLI 之目
- `instrument-distributed-tracing` — 以分布之追蹤補指，為深之可察
