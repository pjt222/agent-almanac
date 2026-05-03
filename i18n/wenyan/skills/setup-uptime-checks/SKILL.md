---
name: setup-uptime-checks
locale: wenyan
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

# 設可用之察

自外觀察服之可用，且防 SSL 證書過期。

## 用時

- 監對客之端（API、網）乃用
- 跟 SSL 證書之過期乃用
- 自多域驗服之可用乃用
- 立公之狀頁乃用
- 達 SLA 之可用報之求乃用

## 入

- **必要**：欲監之 HTTP/HTTPS 端列
- **必要**：為指收之 Prometheus 實
- **可選**：多地之探位
- **可選**：狀頁之器（Statuspage.io、Cachet、自定）
- **可選**：警之渠（PagerDuty、Slack）

## 法

> 詳備之配與模板，參 [Extended Examples](references/EXAMPLES.md)。

### 第一步：展 Blackbox Exporter

以 Docker 或 Kubernetes 裝 Blackbox Exporter：

```bash
# Docker deployment
docker run -d \
  --name blackbox-exporter \
  -p 9115:9115 \
  -v $(pwd)/blackbox.yml:/etc/blackbox_exporter/config.yml \
  prom/blackbox-exporter:latest \
  --config.file=/etc/blackbox_exporter/config.yml
```

Kubernetes 之展：

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

得：Blackbox Exporter 行而於端口 9115 可達。

敗則：察防火牆規，確配卷掛正。

### 第二步：配 Blackbox 之模

立 `blackbox.yml` 附諸探類：

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

載配於 Kubernetes：

```bash
kubectl create configmap blackbox-exporter-config \
  -n monitoring \
  --from-file=blackbox.yml \
  --dry-run=client -o yaml | kubectl apply -f -
```

得：諸探之模已配為異察類。

敗則：驗 YAML 語法。察 Blackbox Exporter 之日為配誤。

### 第三步：配 Prometheus 之抓

加 Blackbox 之目於 Prometheus 配：

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

重載 Prometheus 配：

```bash
# Reload Prometheus (if running in Docker)
docker exec prometheus kill -HUP 1

# Or Kubernetes
kubectl rollout restart deployment/prometheus -n monitoring
```

得：Prometheus 抓 Blackbox Exporter，指於 Prometheus UI 可見。

敗則：察 Prometheus 日為抓誤。驗 Blackbox Exporter 可達。

### 第四步：立可用之警

定警則：

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

載入 Prometheus：

```bash
# Add to prometheus.yml
rule_files:
  - /etc/prometheus/uptime-alerts.yml

# Reload
docker exec prometheus kill -HUP 1
```

得：端不可達或 SSL 證將過期則警觸。

敗則：察 Prometheus 警頁之則評誤。

### 第五步：立可用之儀表

立 Grafana 儀表：

```json
{
  "dashboard": {
    "title": "Uptime Monitoring",
    "panels": [
      {
        "title": "Endpoint Availability (7 days)",
# ... (see EXAMPLES.md for complete configuration)
```

得：儀表示可用百分、SSL 過期、應時。

敗則：察 Grafana 之 Prometheus 數源，驗指被抓。

### 第六步：設狀頁

法甲：用 Statuspage.io（SaaS）：

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

法乙：自宿 Cachet：

```yaml
# docker-compose.yml for Cachet
version: '3'
services:
  cachet:
    image: cachethq/docker:latest
    ports:
# ... (see EXAMPLES.md for complete configuration)
```

法丙：自定狀頁，自 Prometheus 指：

```html
<!-- Simple status page (served via Nginx or GitHub Pages) -->
<!DOCTYPE html>
<html>
<head>
  <title>Company Status</title>
  <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
# ... (see EXAMPLES.md for complete configuration)
```

得：公狀頁示當前服狀與事件。

敗則：確狀頁之網址客可達，非藏於 VPN。

## 驗

- [ ] Blackbox Exporter 已展而可達
- [ ] Prometheus 抓 Blackbox 之指
- [ ] 諸要端皆配可用之察
- [ ] SSL 證過期之警已配（14 日之警）
- [ ] 警已試（模端不可達，察警觸）
- [ ] Grafana 儀表示可用與 SSL 過期
- [ ] 狀頁客可訪
- [ ] 警通達於值班工程師

## 陷

- **唯內之察**：集內之 Blackbox Exporter 不能察外 DNS/路由之患。於多雲/多域展探
- **抓過頻**：每 10 秒察生負。30-60s 常足
- **無 SSL 之監**：證過期可恥可防。常監之
- **狀頁不自動**：事件中人手更狀頁費時。自 Prometheus 警自動之
- **假陽**：單敗之察不應警。用 `for: 2m` 以避暫網之閃

## 參

- `configure-alerting-rules` — 為可用敗立警
- `setup-prometheus-monitoring` — 為 Blackbox Exporter 之 Prometheus 後端
