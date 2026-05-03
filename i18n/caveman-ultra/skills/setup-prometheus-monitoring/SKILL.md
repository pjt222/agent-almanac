---
name: setup-prometheus-monitoring
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Configure Prometheus for time-series metrics → scrape configs, service discovery, recording rules, federation for multi-cluster. Use → centralized metrics for microservices, time-series monitoring app+infra, foundation for SLO/SLI+alerting, migrate legacy → modern observability.
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

# Setup Prometheus Monitoring

Configure prod-ready Prometheus w/ scrape targets, recording rules, federation.

## Use When

- Centralized metrics for microservices|distributed
- Time-series monitor app+infra
- Foundation for SLO/SLI + alerting
- Consolidate metrics from multi Prometheus via federation
- Migrate legacy → modern observability

## In

- **Required**: Scrape targets (services, exporters, endpoints)
- **Required**: Retention period + storage reqs
- **Optional**: Existing service discovery (K8s, Consul, EC2)
- **Optional**: Recording rules for pre-agg metrics
- **Optional**: Federation hierarchy multi-cluster

## Do

### Step 1: Install + Configure

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

`/etc/prometheus/prometheus.yml`:

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

→ Prometheus starts, UI at `http://localhost:9090`, targets in Status > Targets.

If err:
- Syntax: `promtool check config /etc/prometheus/prometheus.yml`
- Perms: `sudo chown -R prometheus:prometheus /etc/prometheus /var/lib/prometheus`
- Logs: `journalctl -u prometheus -f`

### Step 2: Service Discovery

Dynamic targets → no manual.

**K8s** add to `scrape_configs`:

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

**File-based** `/etc/prometheus/file_sd/services.json`:

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

**Consul**:

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

→ Dynamic targets in UI, auto-update on scale|change.

If err:
- K8s: RBAC `kubectl auth can-i list pods --as=system:serviceaccount:monitoring:prometheus`
- File SD: `python -m json.tool /etc/prometheus/file_sd/services.json`
- Consul: `curl http://consul.example.com:8500/v1/catalog/services`

### Step 3: Recording Rules

Pre-aggregate expensive queries → dashboard perf + alerting efficiency.

`/etc/prometheus/rules/recording_rules.yml`:

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

Validate + reload:

```bash
# Validate rules syntax
promtool check rules /etc/prometheus/rules/recording_rules.yml

# Reload Prometheus configuration (without restart)
curl -X POST http://localhost:9090/-/reload

# Or send SIGHUP signal
sudo killall -HUP prometheus
```

→ Rules eval, new metrics w/ `job:` prefix, query perf improved.

If err:
- `promtool check rules`
- Eval interval matches data avail
- Missing source: `curl http://localhost:9090/api/v1/targets`
- Logs: `journalctl -u prometheus | grep -i error`

### Step 4: Storage + Retention

`/etc/systemd/system/prometheus.service`:

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

Key flags:
- `--storage.tsdb.retention.time=30d`: 30d data
- `--storage.tsdb.retention.size=50GB`: 50GB cap (whichever first)
- `--storage.tsdb.wal-compression`: ↓disk I/O
- `--web.enable-lifecycle`: Reload via HTTP POST
- `--web.enable-admin-api`: Snapshot + delete APIs

Enable + start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable prometheus
sudo systemctl start prometheus
sudo systemctl status prometheus
```

→ Retains per policy, disk within limits, old auto-pruned.

If err:
- Disk: `du -sh /var/lib/prometheus`
- TSDB: `curl http://localhost:9090/api/v1/status/tsdb`
- Retention: `curl http://localhost:9090/api/v1/status/runtimeinfo | jq .data.storageRetention`
- Force cleanup: `curl -X POST http://localhost:9090/api/v1/admin/tsdb/delete_series?match[]={__name__=~".+"}`

### Step 5: Federation (Multi-Cluster)

Hierarchical for aggregating across clusters.

**Edge** instances per cluster, set external labels:

```yaml
global:
  external_labels:
    cluster: 'production-east'
    datacenter: 'us-east-1'
```

**Central** add federation scrape:

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

Best practices:
- `honor_labels: true` preserves original
- Federate only recording rules + aggregates (not raw)
- Scrape intervals longer than edge eval
- `match[]` filters → don't federate everything

→ Central shows federated metrics from all, queries span regions, min duplication.

If err:
- Endpoint accessible: `curl http://prometheus-east.example.com:9090/federate?match[]={__name__=~"job:.*"} | head -20`
- Label conflicts (central vs edge external)
- Federation lag: compare timestamps
- Match patterns: `curl http://localhost:9090/api/v1/label/__name__/values | jq .data | grep "job:"`

### Step 6: HA (Optional)

Redundant instances identical configs for failover.

**Thanos**|**Cortex** for true HA, or load-balanced:

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

Grafana queries both:

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

HAProxy|nginx for LB:

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

→ Queries balanced, auto-failover if 1 down, no data loss single-instance fail.

If err:
- Both scrape same targets (slight time skew OK)
- Config drift between
- Dedup in queries (Grafana shows dup series)
- LB health checks

## Check

- [ ] UI accessible
- [ ] All scrape targets UP in Status > Targets
- [ ] Service discovery dynamic add|remove
- [ ] Recording rules eval w/o errs
- [ ] Retention matches configured time|size
- [ ] Federation pulls from edge
- [ ] Queries return expected cardinality (not excessive)
- [ ] Disk stable + within budget
- [ ] Reload via HTTP|SIGHUP
- [ ] Self-monitor metrics (up, scrape duration)

## Traps

- **High cardinality**: Avoid unbounded labels (user IDs, timestamps, UUIDs). Recording rules to agg before storage.
- **Scrape interval mismatch**: Recording rules eval ≥ scrape intervals → no gaps.
- **Federation overload**: All metrics = massive dup. Only federate aggregated rules.
- **Missing relabel**: Service discovery → confusing|dup labels w/o relabel.
- **Retention too short**: Set longer than longest dashboard window → no "no data" gaps.
- **No resource limits**: Excessive mem w/ high cardinality. Set `--storage.tsdb.max-block-duration` + monitor heap.
- **Disabled lifecycle**: W/o `--web.enable-lifecycle`, reloads need full restart → scrape gaps.

## →

- `configure-alerting-rules` — alerting rules + Alertmanager routing
- `build-grafana-dashboards` — visualize w/ Grafana
- `define-slo-sli-sla` — SLO/SLI via recording rules + error budget
- `instrument-distributed-tracing` — complement metrics w/ tracing
