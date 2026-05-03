---
name: setup-prometheus-monitoring
locale: wenyan-ultra
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

# 設 Prometheus 察

配產備 Prometheus 釋含採標、錄則、聯。

## 用

- 為微服或散系設集指採→用
- 行時序察為應與基設指→用
- 為 SLO/SLI 追與警立基→用
- 跨諸 Prometheus 經聯合指→用
- 自舊察方遷至今察棧→用

## 入

- **必**：採標列（服、出器、端）
- **必**：留期與儲需
- **可**：既服發現機（Kubernetes、Consul、EC2）
- **可**：錄則為預聚指
- **可**：聯階為多叢設

## 行

### 一：裝配 Prometheus

建基 Prometheus 配含全設與採間：

```bash
mkdir -p /etc/prometheus/{rules,file_sd}
mkdir -p /var/lib/prometheus

cd /tmp
wget https://github.com/prometheus/prometheus/releases/download/v2.48.0/prometheus-2.48.0.linux-amd64.tar.gz
tar xvf prometheus-2.48.0.linux-amd64.tar.gz
sudo cp prometheus-2.48.0.linux-amd64/{prometheus,promtool} /usr/local/bin/
```

建 `/etc/prometheus/prometheus.yml`：

```yaml
global:
  scrape_interval: 15s
  scrape_timeout: 10s
  evaluation_interval: 15s
  external_labels:
    cluster: 'production'
    region: 'us-east-1'

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - localhost:9093

rule_files:
  - "rules/*.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
        labels:
          env: 'production'

  - job_name: 'node'
    static_configs:
      - targets:
          - 'node1:9100'
          - 'node2:9100'
        labels:
          env: 'production'

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

得：Prometheus 啟、網 UI 達於 `http://localhost:9090`、標列於 Status > Targets。

敗：
- `promtool check config /etc/prometheus/prometheus.yml` 察語
- 驗檔權：`sudo chown -R prometheus:prometheus /etc/prometheus /var/lib/prometheus`
- 察日誌：`journalctl -u prometheus -f`

### 二：配服發現

設動標發現以免手管。

**Kubernetes**：

```yaml
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        target_label: __address__
        regex: ([^:]+)(?::\d+)?;(\d+)
        replacement: $1:$2
      - source_labels: [__meta_kubernetes_namespace]
        target_label: kubernetes_namespace
      - source_labels: [__meta_kubernetes_pod_name]
        target_label: kubernetes_pod_name
```

**檔基**服發現—建 `/etc/prometheus/file_sd/services.json`：

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

**Consul**：

```yaml
  - job_name: 'consul-services'
    consul_sd_configs:
      - server: 'consul.example.com:8500'
        services: []
    relabel_configs:
      - source_labels: [__meta_consul_service]
        target_label: job
      - source_labels: [__meta_consul_tags]
        regex: '.*,monitoring,.*'
        action: keep
```

得：動標現於 Prometheus UI、服變/縮時自更。

敗：
- Kubernetes：驗 RBAC `kubectl auth can-i list pods --as=system:serviceaccount:monitoring:prometheus`
- 檔 SD：驗 JSON `python -m json.tool /etc/prometheus/file_sd/services.json`
- Consul：測連 `curl http://consul.example.com:8500/v1/catalog/services`

### 三：建錄則

預聚貴詢為儀板性與警效。

建 `/etc/prometheus/rules/recording_rules.yml`：

```yaml
groups:
  - name: api_aggregations
    interval: 30s
    rules:
      - record: job:http_requests:rate5m
        expr: |
          sum by (job, endpoint, method) (
            rate(http_requests_total[5m])
          )

      - record: job:http_errors:rate5m
        expr: |
          sum by (job) (
            rate(http_requests_total{status=~"5.."}[5m])
          ) / sum by (job) (
            rate(http_requests_total[5m])
          ) * 100

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
      - record: instance:cpu_usage:ratio
        expr: |
          1 - avg by (instance) (
            rate(node_cpu_seconds_total{mode="idle"}[5m])
          )

      - record: instance:memory_usage:ratio
        expr: |
          1 - (
            node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes
          )

      - record: instance:disk_usage:ratio
        expr: |
          1 - (
            node_filesystem_avail_bytes{fstype!~"tmpfs|fuse.*"}
            / node_filesystem_size_bytes{fstype!~"tmpfs|fuse.*"}
          )
```

驗並重載：

```bash
promtool check rules /etc/prometheus/rules/recording_rules.yml

curl -X POST http://localhost:9090/-/reload

sudo killall -HUP prometheus
```

得：錄則成評、新指見於 Prometheus 含 `job:` 前、儀板詢性進。

敗：
- `promtool check rules` 察則語
- 驗評間合資可
- 缺源指：`curl http://localhost:9090/api/v1/targets`
- 察日誌評誤：`journalctl -u prometheus | grep -i error`

### 四：配儲與留

優儲為留需與詢性。

改 `/etc/systemd/system/prometheus.service`：

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

要儲旗：
- `--storage.tsdb.retention.time=30d`：留 30 日
- `--storage.tsdb.retention.size=50GB`：限 50GB（先觸者）
- `--storage.tsdb.wal-compression`：WAL 壓（減盤 I/O）
- `--web.enable-lifecycle`：HTTP POST 重載
- `--web.enable-admin-api`：快照與刪 API

啟動：

```bash
sudo systemctl daemon-reload
sudo systemctl enable prometheus
sudo systemctl start prometheus
sudo systemctl status prometheus
```

得：Prometheus 按策留指、盤用於限內、舊資自剪。

敗：
- 察盤用：`du -sh /var/lib/prometheus`
- 察 TSDB 統：`curl http://localhost:9090/api/v1/status/tsdb`
- 驗留設：`curl http://localhost:9090/api/v1/status/runtimeinfo | jq .data.storageRetention`
- 強清：`curl -X POST http://localhost:9090/api/v1/admin/tsdb/delete_series?match[]={__name__=~".+"}`

### 五：設聯（多叢）

配階 Prometheus 為跨叢聚指。

於**邊** Prometheus（各叢）確外標設：

```yaml
global:
  external_labels:
    cluster: 'production-east'
    datacenter: 'us-east-1'
```

於**央** Prometheus 加聯採配：

```yaml
scrape_configs:
  - job_name: 'federate-production'
    honor_labels: true
    metrics_path: '/federate'
    params:
      'match[]':
        - '{__name__=~"job:.*"}'
        - '{__name__=~"ALERTS.*"}'
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

聯佳實：
- 用 `honor_labels: true` 保原標
- 僅聯錄則與聚（非原指）
- 設宜採間（長於邊評）
- 用 `match[]` 濾指（避全聯）

得：央 Prometheus 示諸叢聯指、詢可跨域、最少資重。

敗：
- 驗聯端達：`curl http://prometheus-east.example.com:9090/federate?match[]={__name__=~"job:.*"} | head -20`
- 察標衝（央 vs 邊外標）
- 察聯延：較時印異
- 察配式：`curl http://localhost:9090/api/v1/label/__name__/values | jq .data | grep "job:"`

### 六：行高可（可）

釋冗 Prometheus 含同配為轉。

用 **Thanos** 或 **Cortex** 為真 HA、或簡負衡：

```yaml
global:
  scrape_interval: 15s
  external_labels:
    prometheus: 'prometheus-1'
    replica: 'A'
```

配 Grafana 詢二：

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

用 HAProxy 或 nginx 為負衡：

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

得：詢請跨衡、單敗自轉、單敗無資失。

敗：
- 驗二採同標（微時偏可）
- 察配漂於二
- 察詢去重（Grafana 示重序）
- 察負衡健察

## 驗

- [ ] Prometheus 網 UI 達於期端
- [ ] 諸配採標於 Status > Targets 示 UP
- [ ] 服發現動加除標如期
- [ ] 錄則成評（日無誤）
- [ ] 指留合配時/大限
- [ ] 聯（如配）拉指自邊
- [ ] 詢返期指基（不過）
- [ ] 盤用穩於配儲預內
- [ ] 配重載經 HTTP 端或 SIGHUP 行
- [ ] Prometheus 自察指可（up、scrape duration 等）

## 忌

- **高基指**：避無界值標（user ID、時印、UUID）。錄則聚於儲前
- **採間不合**：錄則評間 ≥ 採間以免缺
- **聯過載**：聯諸指生大資重。僅聯聚錄則
- **缺重標配**：無正重標→服發現生混或重標
- **留過短**：留長於最長儀板時窗以免「無資」缺
- **無資源限**：高基時 Prometheus 可耗大記憶。設 `--storage.tsdb.max-block-duration` 並察堆用
- **禁生命週期端**：無 `--web.enable-lifecycle`→配重載需全重啟致採缺

## 參

- `configure-alerting-rules`
- `build-grafana-dashboards`
- `define-slo-sli-sla`
- `instrument-distributed-tracing`
