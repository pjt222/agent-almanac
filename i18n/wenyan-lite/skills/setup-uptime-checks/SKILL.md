---
name: setup-uptime-checks
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Configure external uptime monitoring using Blackbox Exporter and Prometheus.
  Implement SSL certificate monitoring, HTTP endpoint health checks, and
  status pages for customer-facing visibility. Use when monitoring customer-facing
  endpoints such as APIs and websites, tracking SSL certificate expiration,
  validating service availability from multiple regions, creating public status
  pages, or meeting SLA requirements for uptime reporting.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: observability
  complexity: basic
  language: multi
  tags: uptime, blackbox-exporter, ssl-monitoring, status-page, health-checks
---

# 設置可用性檢查

自外部視角監控服務可用性並防止 SSL 憑證過期。

## 適用時機

- 監控面向客戶之端點（API、網站）
- 追蹤 SSL 憑證過期
- 自多個區域驗證服務可用性
- 建立公開狀態頁
- 符合可用性報告之 SLA 要求

## 輸入

- **必要**：欲監控之 HTTP/HTTPS 端點清單
- **必要**：用以收集指標之 Prometheus 實例
- **選擇性**：多個地理探測位置
- **選擇性**：狀態頁工具（Statuspage.io、Cachet、自訂）
- **選擇性**：警報通知通道（PagerDuty、Slack）

## 步驟

> 詳見 [Extended Examples](references/EXAMPLES.md) 取得完整配置文件與範本。

### 步驟一：部署 Blackbox Exporter

經 Docker 或 Kubernetes 安裝 Blackbox Exporter：

```bash
# Docker deployment
docker run -d \
  --name blackbox-exporter \
  -p 9115:9115 \
  -v $(pwd)/blackbox.yml:/etc/blackbox_exporter/config.yml \
  prom/blackbox-exporter:latest \
  --config.file=/etc/blackbox_exporter/config.yml
```

Kubernetes 部署：

```yaml
# blackbox-exporter-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: blackbox-exporter
  namespace: monitoring
spec:
  replicas: 1
  selector:
    matchLabels:
      app: blackbox-exporter
  template:
    metadata:
      labels:
        app: blackbox-exporter
    spec:
      containers:
      - name: blackbox-exporter
        image: prom/blackbox-exporter:latest
        ports:
        - containerPort: 9115
        volumeMounts:
        - name: config
          mountPath: /etc/blackbox_exporter
      volumes:
      - name: config
        configMap:
          name: blackbox-exporter-config
---
apiVersion: v1
kind: Service
metadata:
  name: blackbox-exporter
  namespace: monitoring
spec:
  selector:
    app: blackbox-exporter
  ports:
  - port: 9115
    targetPort: 9115
```

**預期：** Blackbox Exporter 執行且於連接埠 9115 可存取。

**失敗時：** 檢查防火牆規則、確保配置卷正確掛載。

### 步驟二：配置 Blackbox 模組

建立含各種探測類型之 `blackbox.yml`：

```yaml
# blackbox.yml
modules:
  # Basic HTTP 200 check
  http_2xx:
    prober: http
    timeout: 5s
    http:
      valid_status_codes: [200]
      method: GET
      follow_redirects: true
      preferred_ip_protocol: "ip4"

  # HTTP with authentication
  http_2xx_auth:
    prober: http
    timeout: 5s
    http:
      valid_status_codes: [200]
      method: GET
      headers:
        Authorization: "Bearer ${AUTH_TOKEN}"

  # API health check (expects JSON response)
  http_json_health:
    prober: http
    timeout: 5s
    http:
      valid_status_codes: [200]
      method: GET
      fail_if_body_not_matches_regexp:
        - '"status":"healthy"'

  # SSL certificate check
  http_2xx_ssl:
    prober: http
    timeout: 5s
    http:
      valid_status_codes: [200]
      method: GET
      tls_config:
        insecure_skip_verify: false
      fail_if_ssl_not_present: true

  # TCP port check (e.g., database)
  tcp_connect:
    prober: tcp
    timeout: 5s
    tcp:
      preferred_ip_protocol: "ip4"

  # ICMP ping
  icmp:
    prober: icmp
    timeout: 5s
    icmp:
      preferred_ip_protocol: "ip4"

  # DNS resolution check
  dns_google:
    prober: dns
    timeout: 5s
    dns:
      query_name: "google.com"
      query_type: "A"
      valid_rcodes:
        - NOERROR
```

將配置載入 Kubernetes：

```bash
kubectl create configmap blackbox-exporter-config \
  -n monitoring \
  --from-file=blackbox.yml \
  --dry-run=client -o yaml | kubectl apply -f -
```

**預期：** 多個探測模組已為不同檢查類型配置。

**失敗時：** 驗證 YAML 語法。檢查 Blackbox Exporter 日誌以查配置錯誤。

### 步驟三：配置 Prometheus 採集

將 Blackbox 目標加至 Prometheus 配置：

```yaml
# prometheus.yml
scrape_configs:
  # Blackbox exporter itself
  - job_name: 'blackbox-exporter'
    static_configs:
      - targets: ['blackbox-exporter:9115']

  # HTTP endpoint checks
  - job_name: 'blackbox-http'
    metrics_path: /probe
    params:
      module: [http_2xx]
    static_configs:
      - targets:
          - https://api.company.com/health
          - https://www.company.com
          - https://app.company.com/login
    relabel_configs:
      - source_labels: [__address__]
        target_label: __param_target
      - source_labels: [__param_target]
        target_label: instance
      - target_label: __address__
        replacement: blackbox-exporter:9115

  # SSL certificate expiry checks
  - job_name: 'blackbox-ssl'
    metrics_path: /probe
    params:
      module: [http_2xx_ssl]
    static_configs:
      - targets:
          - https://api.company.com
          - https://www.company.com
    relabel_configs:
      - source_labels: [__address__]
        target_label: __param_target
      - source_labels: [__param_target]
        target_label: instance
      - target_label: __address__
        replacement: blackbox-exporter:9115

  # TCP connectivity checks (databases, etc.)
  - job_name: 'blackbox-tcp'
    metrics_path: /probe
    params:
      module: [tcp_connect]
    static_configs:
      - targets:
          - postgres.internal:5432
          - redis.internal:6379
    relabel_configs:
      - source_labels: [__address__]
        target_label: __param_target
      - source_labels: [__param_target]
        target_label: instance
      - target_label: __address__
        replacement: blackbox-exporter:9115
```

重新載入 Prometheus 配置：

```bash
# Reload Prometheus (if running in Docker)
docker exec prometheus kill -HUP 1

# Or Kubernetes
kubectl rollout restart deployment/prometheus -n monitoring
```

**預期：** Prometheus 採集 Blackbox Exporter，指標於 Prometheus UI 中可見。

**失敗時：** 檢查 Prometheus 日誌之採集錯誤。驗證 Blackbox Exporter 可達。

### 步驟四：建立可用性警報

定義警報規則：

```yaml
# uptime-alerts.yml
groups:
  - name: uptime
    interval: 30s
    rules:
      - alert: EndpointDown
        expr: probe_success == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Endpoint {{ $labels.instance }} is down"
          description: "{{ $labels.instance }} has been unreachable for 2 minutes."

      - alert: SSLCertificateExpiringSoon
        expr: (probe_ssl_earliest_cert_expiry - time()) / 86400 < 14
        for: 1h
        labels:
          severity: warning
        annotations:
          summary: "SSL certificate for {{ $labels.instance }} expires in {{ $value | humanizeDuration }}"
          description: "Certificate expires on {{ $labels.instance }}. Renew soon."

      - alert: SSLCertificateExpired
        expr: (probe_ssl_earliest_cert_expiry - time()) < 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "SSL certificate for {{ $labels.instance }} has EXPIRED"
          description: "URGENT: Certificate expired. Service may be inaccessible."

      - alert: SlowResponseTime
        expr: probe_http_duration_seconds > 3
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Slow response from {{ $labels.instance }}"
          description: "HTTP request took {{ $value }}s (threshold: 3s)."

      - alert: HTTPStatusNot200
        expr: probe_http_status_code != 200
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "HTTP {{ $labels.instance }} returned {{ $value }}"
          description: "Expected 200, got {{ $value }}."
```

載入至 Prometheus：

```bash
# Add to prometheus.yml
rule_files:
  - /etc/prometheus/uptime-alerts.yml

# Reload
docker exec prometheus kill -HUP 1
```

**預期：** 端點不可達或 SSL 憑證過期時警報觸發。

**失敗時：** 檢查 Prometheus 警報頁之規則評估錯誤。

### 步驟五：建構可用性儀表板

建立 Grafana 儀表板：

```json
{
  "dashboard": {
    "title": "Uptime Monitoring",
    "panels": [
      {
        "title": "Endpoint Availability (7 days)",
# ... (see EXAMPLES.md for complete configuration)
```

**預期：** 儀表板顯示可用性 %、SSL 過期、回應時間。

**失敗時：** 檢查 Grafana 中之 Prometheus 資料源、驗證指標已被採集。

### 步驟六：設置狀態頁

選項 A：用 Statuspage.io（SaaS）：

```bash
# Integrate with Statuspage.io API
curl -X POST https://api.statuspage.io/v1/pages/PAGE_ID/incidents \
  -H "Authorization: OAuth YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "incident": {
      "name": "API Degradation",
      "status": "investigating",
      "impact_override": "minor",
      "body": "We are investigating elevated error rates on the API."
    }
  }'
```

選項 B：自託管 Cachet：

```yaml
# docker-compose.yml for Cachet
version: '3'
services:
  cachet:
    image: cachethq/docker:latest
    ports:
# ... (see EXAMPLES.md for complete configuration)
```

選項 C：自 Prometheus 指標之自訂狀態頁：

```html
<!-- Simple status page (served via Nginx or GitHub Pages) -->
<!DOCTYPE html>
<html>
<head>
  <title>Company Status</title>
  <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
# ... (see EXAMPLES.md for complete configuration)
```

**預期：** 公開狀態頁顯示當前服務狀態與事件。

**失敗時：** 確保狀態頁 URL 可達於客戶，非於 VPN 後。

## 驗證

- [ ] Blackbox Exporter 已部署且可存取
- [ ] Prometheus 採集 Blackbox 指標
- [ ] 所有關鍵端點之可用性檢查已配置
- [ ] SSL 憑證過期警報已配置（14 日警告）
- [ ] 警報已測試（模擬端點下線、檢查警報觸發）
- [ ] Grafana 儀表板顯示可用性與 SSL 過期
- [ ] 狀態頁對客戶可存取
- [ ] 警報通知達到 on-call 工程師

## 常見陷阱

- **僅內部之檢查**：集群內之 Blackbox Exporter 無法偵測外部 DNS/路由問題。於多雲/多區部署探測。
- **採集過頻**：每 10 秒檢查產生負載。30-60 秒通常足夠。
- **無 SSL 監控**：過期憑證令人尷尬且可預防。應始終監控。
- **狀態頁未自動化**：事件期間手動更新狀態頁浪費時間。自 Prometheus 警報自動化。
- **假陽性**：單次失敗檢查不應警報。用 `for: 2m` 以避免短暫網路波動。

## 相關技能

- `configure-alerting-rules` - 為可用性失敗建立警報
- `setup-prometheus-monitoring` - Blackbox Exporter 之 Prometheus 後端
