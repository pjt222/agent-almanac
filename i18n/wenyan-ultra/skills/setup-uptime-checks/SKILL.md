---
name: setup-uptime-checks
locale: wenyan-ultra
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

# 設運期察

自外點察服可、防 SSL 證期。

## 用

- 察客面端（API、網）→用
- 追 SSL 證期→用
- 跨域驗服可→用
- 建公態頁→用
- 達 SLA 運期報→用

## 入

- **必**：所察 HTTP/HTTPS 端列
- **必**：採指之 Prometheus
- **可**：諸地探位
- **可**：態頁工（Statuspage.io、Cachet、自）
- **可**：警通道（PagerDuty、Slack）

## 行

> 全配與板見 [Extended Examples](references/EXAMPLES.md)。

### 一：釋 Blackbox Exporter

裝 Blackbox 經 Docker 或 Kubernetes：

```bash
docker run -d \
  --name blackbox-exporter \
  -p 9115:9115 \
  -v $(pwd)/blackbox.yml:/etc/blackbox_exporter/config.yml \
  prom/blackbox-exporter:latest \
  --config.file=/etc/blackbox_exporter/config.yml
```

Kubernetes 釋：

```yaml
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

得：Blackbox 行可達於 9115。

敗：察防牆規、確配卷正掛。

### 二：配 Blackbox 模

建 `blackbox.yml` 含諸探型：

```yaml
modules:
  http_2xx:
    prober: http
    timeout: 5s
    http:
      valid_status_codes: [200]
      method: GET
      follow_redirects: true
      preferred_ip_protocol: "ip4"

  http_2xx_auth:
    prober: http
    timeout: 5s
    http:
      valid_status_codes: [200]
      method: GET
      headers:
        Authorization: "Bearer ${AUTH_TOKEN}"

  http_json_health:
    prober: http
    timeout: 5s
    http:
      valid_status_codes: [200]
      method: GET
      fail_if_body_not_matches_regexp:
        - '"status":"healthy"'

  http_2xx_ssl:
    prober: http
    timeout: 5s
    http:
      valid_status_codes: [200]
      method: GET
      tls_config:
        insecure_skip_verify: false
      fail_if_ssl_not_present: true

  tcp_connect:
    prober: tcp
    timeout: 5s
    tcp:
      preferred_ip_protocol: "ip4"

  icmp:
    prober: icmp
    timeout: 5s
    icmp:
      preferred_ip_protocol: "ip4"

  dns_google:
    prober: dns
    timeout: 5s
    dns:
      query_name: "google.com"
      query_type: "A"
      valid_rcodes:
        - NOERROR
```

載配入 Kubernetes：

```bash
kubectl create configmap blackbox-exporter-config \
  -n monitoring \
  --from-file=blackbox.yml \
  --dry-run=client -o yaml | kubectl apply -f -
```

得：諸探模配為異察型。

敗：驗 YAML。察 Blackbox 日為配誤。

### 三：配 Prometheus 採

加 Blackbox 標於 Prometheus 配：

```yaml
scrape_configs:
  - job_name: 'blackbox-exporter'
    static_configs:
      - targets: ['blackbox-exporter:9115']

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

重載 Prometheus：

```bash
docker exec prometheus kill -HUP 1

kubectl rollout restart deployment/prometheus -n monitoring
```

得：Prometheus 採 Blackbox、指見於 Prometheus UI。

敗：察 Prometheus 日為採誤。驗 Blackbox 可達。

### 四：建運期警

定警則：

```yaml
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
rule_files:
  - /etc/prometheus/uptime-alerts.yml

docker exec prometheus kill -HUP 1
```

得：警於端不可達或 SSL 期時跳。

敗：察 Prometheus 警頁為則評誤。

### 五：建運期儀板

建 Grafana 儀板：

```json
{
  "dashboard": {
    "title": "Uptime Monitoring",
    "panels": [
      {
        "title": "Endpoint Availability (7 days)",
# ... (see EXAMPLES.md for complete configuration)
```

得：儀板示運期 %、SSL 期、應時。

敗：察 Grafana Prometheus 源、驗指採。

### 六：設態頁

選甲：用 Statuspage.io（SaaS）：

```bash
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

選乙：自託 Cachet：

```yaml
version: '3'
services:
  cachet:
    image: cachethq/docker:latest
    ports:
# ... (see EXAMPLES.md for complete configuration)
```

選丙：自態頁自 Prometheus 指：

```html
<!DOCTYPE html>
<html>
<head>
  <title>Company Status</title>
  <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
# ... (see EXAMPLES.md for complete configuration)
```

得：公態頁示當服態與事故。

敗：確態頁 URL 為客可達、非 VPN 後。

## 驗

- [ ] Blackbox 釋可達
- [ ] Prometheus 採 Blackbox 指
- [ ] 諸關端配運期察
- [ ] SSL 期警配（14 日警）
- [ ] 警測（模端死、查警跳）
- [ ] Grafana 儀板示運期與 SSL 期
- [ ] 態頁客可達
- [ ] 警通達待命工

## 忌

- **僅內察**：叢內 Blackbox 不能察外 DNS/路問題。多雲/域釋探
- **採過頻**：每 10 秒察生負。30-60s 常足
- **無 SSL 察**：期證為窘可防。恆察
- **態頁不自動**：事故時手更費時。自 Prometheus 警自動
- **假陽**：單敗察不宜警。用 `for: 2m` 避暫網眨

## 參

- `configure-alerting-rules`
- `setup-prometheus-monitoring`
