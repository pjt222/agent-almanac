---
name: setup-uptime-checks
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
  locale: es
  source_locale: en
  source_commit: a87e5e0380bbe51f65cb0662d60c10030a81f255
  translator: claude
  translation_date: "2026-03-17"
---

# Set Up Uptime Checks

Monitor service availability from external vantage points and prevent SSL certificate expirations.

## Cuándo Usar

- Monitoring customer-facing endpoints (APIs, websites)
- Tracking SSL certificate expiration
- Validating service availability from multiple regions
- Creating public status pages
- Meeting SLA requirements for uptime reporting

## Entradas

- **Requerido**: List of HTTP/HTTPS endpoints to monitor
- **Requerido**: Prometheus instance for metric collection
- **Opcional**: Multiple geographic probe locations
- **Opcional**: Status page tool (Statuspage.io, Cachet, custom)
- **Opcional**: Alert notification channels (PagerDuty, Slack)

## Procedimiento

> See [Extended Examples](references/EXAMPLES.md) for complete configuration files and templates.


### Paso 1: Deploy Blackbox Exporter

Install Blackbox Exporter via Docker or Kubernetes:

```bash
# Docker deployment
docker run -d \
  --name blackbox-exporter \
  -p 9115:9115 \
  -v $(pwd)/blackbox.yml:/etc/blackbox_exporter/config.yml \
  prom/blackbox-exporter:latest \
  --config.file=/etc/blackbox_exporter/config.yml
```

Kubernetes deployment:

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

**Esperado:** Blackbox Exporter running and accessible on port 9115.

**En caso de fallo:** Check firewall rules, ensure config volume is mounted correctly.

### Paso 2: Configure Blackbox Modules

Create `blackbox.yml` with various probe types:

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

Load config into Kubernetes:

```bash
kubectl create configmap blackbox-exporter-config \
  -n monitoring \
  --from-file=blackbox.yml \
  --dry-run=client -o yaml | kubectl apply -f -
```

**Esperado:** Multiple probe modules configured for different check types.

**En caso de fallo:** Validate YAML syntax. Check Blackbox Exporter logs for config errors.

### Paso 3: Configure Prometheus Scrape

Add Blackbox targets to Prometheus config:

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

Reload Prometheus config:

```bash
# Reload Prometheus (if running in Docker)
docker exec prometheus kill -HUP 1

# Or Kubernetes
kubectl rollout restart deployment/prometheus -n monitoring
```

**Esperado:** Prometheus scraping Blackbox Exporter, metrics visible in Prometheus UI.

**En caso de fallo:** Check Prometheus logs for scrape errors. Verify Blackbox Exporter is reachable.

### Paso 4: Create Uptime Alerts

Define alerting rules:

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

Load into Prometheus:

```bash
# Add to prometheus.yml
rule_files:
  - /etc/prometheus/uptime-alerts.yml

# Reload
docker exec prometheus kill -HUP 1
```

**Esperado:** Alerts fire when endpoints are unreachable or SSL certs expiring.

**En caso de fallo:** Check Prometheus alerts page for rule evaluation errors.

### Paso 5: Build Uptime Dashboard

Create Grafana dashboard:

```json
{
  "dashboard": {
    "title": "Uptime Monitoring",
    "panels": [
      {
        "title": "Endpoint Availability (7 days)",
# ... (see EXAMPLES.md for complete configuration)
```

**Esperado:** Dashboard showing uptime %, SSL expiry, response times.

**En caso de fallo:** Check Prometheus data source in Grafana, verify metrics are being scraped.

### Paso 6: Set Up Status Page

Option A: Use Statuspage.io (SaaS):

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

Option B: Self-hosted Cachet:

```yaml
# docker-compose.yml for Cachet
version: '3'
services:
  cachet:
    image: cachethq/docker:latest
    ports:
# ... (see EXAMPLES.md for complete configuration)
```

Option C: Custom status page from Prometheus metrics:

```html
<!-- Simple status page (served via Nginx or GitHub Pages) -->
<!DOCTYPE html>
<html>
<head>
  <title>Company Status</title>
  <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
# ... (see EXAMPLES.md for complete configuration)
```

**Esperado:** Public status page shows current service status and incidents.

**En caso de fallo:** Ensure status page URL is reachable by customers, not behind VPN.

## Validación

- [ ] Blackbox Exporter deployed and accessible
- [ ] Prometheus scraping Blackbox metrics
- [ ] Uptime checks configured for all critical endpoints
- [ ] SSL certificate expiry alerts configured (14-day warning)
- [ ] Alerts tested (simulate endpoint down, check alert fires)
- [ ] Grafana dashboard shows uptime and SSL expiry
- [ ] Status page accessible to customers
- [ ] Alert notifications reach on-call engineers

## Errores Comunes

- **Internal-only checks**: Blackbox Exporter inside cluster can't detect external DNS/routing issues. Deploy probes in multiple clouds/regions.
- **Too frequent scraping**: Checking every 10 seconds generates load. 30-60s is usually sufficient.
- **No SSL monitoring**: Expired certificates are embarrassing and preventable. Always monitor.
- **Status page not automated**: Manually updating status pages during incidents wastes time. Automate from Prometheus alerts.
- **False positives**: Single failed check shouldn't alert. Use `for: 2m` to avoid transient network blips.

## Habilidades Relacionadas

- `configure-alerting-rules` - create alerts for uptime failures
- `setup-prometheus-monitoring` - Prometheus backend for Blackbox Exporter
