---
name: setup-uptime-checks
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Configure external uptime monitoring via Blackbox Exporter + Prometheus. SSL cert monitor, HTTP endpoint health checks, status pages for customer-facing. Use → monitor customer endpoints (APIs, sites), track SSL expiry, validate avail multi regions, create public status pages, meet SLA reqs for uptime reporting.
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

# Set Up Uptime Checks

Monitor svc avail from external + prevent SSL expiry.

## Use When

- Monitor customer endpoints (APIs, sites)
- Track SSL cert expiry
- Validate svc avail multi regions
- Create public status pages
- Meet SLA reqs uptime reporting

## In

- **Required**: HTTP|HTTPS endpoints to monitor
- **Required**: Prometheus instance for metrics
- **Optional**: Multi geo probe locations
- **Optional**: Status page tool (Statuspage.io, Cachet, custom)
- **Optional**: Alert channels (PagerDuty, Slack)

## Do

> See [Extended Examples](references/EXAMPLES.md) for complete config + templates.


### Step 1: Deploy Blackbox Exporter

Docker|K8s:

```bash
# Docker deployment
docker run -d \
  --name blackbox-exporter \
  -p 9115:9115 \
  -v $(pwd)/blackbox.yml:/etc/blackbox_exporter/config.yml \
  prom/blackbox-exporter:latest \
  --config.file=/etc/blackbox_exporter/config.yml
```

K8s:

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

→ Blackbox Exporter running, port 9115 accessible.

If err: check firewall, config volume mounted.

### Step 2: Configure Modules

`blackbox.yml`:

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

Load into K8s:

```bash
kubectl create configmap blackbox-exporter-config \
  -n monitoring \
  --from-file=blackbox.yml \
  --dry-run=client -o yaml | kubectl apply -f -
```

→ Multi probe modules for diff check types.

If err: validate YAML syntax. Check Blackbox Exporter logs for config errs.

### Step 3: Prometheus Scrape

Add Blackbox targets:

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

Reload:

```bash
# Reload Prometheus (if running in Docker)
docker exec prometheus kill -HUP 1

# Or Kubernetes
kubectl rollout restart deployment/prometheus -n monitoring
```

→ Prometheus scraping Blackbox, metrics in UI.

If err: Prometheus logs for scrape errs. Verify Blackbox reachable.

### Step 4: Uptime Alerts

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

Load:

```bash
# Add to prometheus.yml
rule_files:
  - /etc/prometheus/uptime-alerts.yml

# Reload
docker exec prometheus kill -HUP 1
```

→ Alerts fire when endpoints unreachable|SSL expiring.

If err: check Prometheus alerts page for rule eval errs.

### Step 5: Uptime Dashboard

Grafana:

```json
{
  "dashboard": {
    "title": "Uptime Monitoring",
    "panels": [
      {
        "title": "Endpoint Availability (7 days)",
# ... (see EXAMPLES.md for complete configuration)
```

→ Dashboard shows uptime %, SSL expiry, response times.

If err: Prometheus data source in Grafana, verify metrics scraped.

### Step 6: Status Page

A: Statuspage.io (SaaS):

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

B: Self-hosted Cachet:

```yaml
# docker-compose.yml for Cachet
version: '3'
services:
  cachet:
    image: cachethq/docker:latest
    ports:
# ... (see EXAMPLES.md for complete configuration)
```

C: Custom from Prometheus metrics:

```html
<!-- Simple status page (served via Nginx or GitHub Pages) -->
<!DOCTYPE html>
<html>
<head>
  <title>Company Status</title>
  <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
# ... (see EXAMPLES.md for complete configuration)
```

→ Public status page shows current + incidents.

If err: status page URL reachable by customers, not behind VPN.

## Check

- [ ] Blackbox Exporter deployed + accessible
- [ ] Prometheus scraping Blackbox metrics
- [ ] Uptime checks for all critical endpoints
- [ ] SSL expiry alerts (14d warning)
- [ ] Alerts tested (simulate down, fires)
- [ ] Grafana shows uptime + SSL expiry
- [ ] Status page accessible to customers
- [ ] Notifications reach on-call

## Traps

- **Internal-only checks**: Blackbox in cluster can't detect external DNS|routing. Probes in multi clouds|regions.
- **Too frequent scrape**: 10s = load. 30-60s usually sufficient.
- **No SSL monitor**: Expired certs embarrassing+preventable. Always monitor.
- **Status page not automated**: Manual updates during incidents waste time. Automate from Prometheus alerts.
- **False positives**: Single fail shouldn't alert. `for: 2m` avoids transient blips.

## →

- `configure-alerting-rules` — create alerts for uptime fails
- `setup-prometheus-monitoring` — Prometheus backend for Blackbox
