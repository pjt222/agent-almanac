---
name: configure-log-aggregation
locale: caveman-ultra
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

# Configure Log Aggregation

Impl centralized log collection, parsing, querying w/ Loki/Promtail or ELK stack → operational visibility.

## Use When

- Consolidate logs from multi services/hosts → searchable system
- Replace local log files w/ centralized, queryable log storage
- Correlate logs w/ metrics + traces for full observability
- Impl structured logging w/ label extraction from unstructured logs
- Set retention policies for log data by storage + compliance needs
- Troubleshoot prod incidents requiring log analysis across services

## In

- **Required**: Log sources (app logs, sys logs, container logs)
- **Required**: Log format patterns (JSON, plaintext, syslog, etc.)
- **Optional**: Label extraction rules for structured querying
- **Optional**: Retention + compression policies
- **Optional**: Existing log shipper config (Fluentd, Filebeat, Promtail)

## Do

> See [Extended Examples](references/EXAMPLES.md) for complete config files + templates.


### Step 1: Choose Log Aggregation Stack

Select Loki (Prometheus-style) or ELK (Elasticsearch-based) by req's.

**Loki advantages**:
- Lightweight, designed for K8s + cloud-native envs
- Label-based indexing (like Prometheus) → low storage overhead
- Native Grafana integration for unified dashboards
- Horizontal scalability w/ object storage (S3, GCS)
- Lower resource consumption vs. Elasticsearch

**ELK advantages**:
- Full-text search across all log content (not just labels)
- Rich query DSL + aggregations
- Mature ecosystem w/ beats, logstash plugins
- Better for compliance/audit logs requiring deep historical search

For this guide → focus on **Loki + Promtail** (rec'd for most modern setups).

Decision criteria:
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

**→** Clear choice made by req's, team downloads appropriate install artifacts.

**If err:**
- Benchmark storage req's: Loki ~10x less than Elasticsearch for same logs
- Eval query patterns: full-text search needs vs. label filtering
- Consider operational overhead: ELK requires more tuning + resources

### Step 2: Deploy Loki

Install + configure Loki w/ appropriate storage backend.

**Docker Compose deployment** (`docker-compose.yml`):

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

**Loki config** (`loki-config.yml`):

```yaml
auth_enabled: false

server:
  http_listen_port: 3100
  grpc_listen_port: 9096

# ... (see EXAMPLES.md for complete configuration)
```

For **prod** w/ S3 storage:

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

**→** Loki starts successfully, health check passes at `http://localhost:3100/ready`, logs stored per retention policy.

**If err:**
- Check Loki logs: `docker logs loki`
- Valid. storage dirs exist + writable
- Test config syntax: `docker run grafana/loki:2.9.0 -config.file=/etc/loki/local-config.yaml -verify-config`
- Ensure retention settings don't exceed disk capacity
- S3: valid. IAM perms + bucket access

### Step 3: Configure Promtail for Log Shipping

Set up Promtail to scrape logs + forward to Loki w/ label extraction.

**Promtail config** (`promtail-config.yml`):

```yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml
# ... (see EXAMPLES.md for complete configuration)
```

Key Promtail concepts:
- **Scrape configs**: Define log sources + how to discover them
- **Pipeline stages**: Transform + label logs before sending to Loki
- **Relabel configs**: Dynamic labeling by metadata
- **Positions file**: Tracks read offsets → avoid re-processing logs

**→** Promtail scrapes configured log files, labels applied correct, logs visible in Loki via LogQL queries.

**If err:**
- Check Promtail logs: `docker logs promtail`
- Valid. file paths accessible: `docker exec promtail ls /var/log`
- Test regex patterns independently w/ sample log lines
- Monitor Promtail metrics: `curl http://localhost:9080/metrics | grep promtail`
- Check positions file for progress: `cat /tmp/positions.yaml`

### Step 4: Query Logs with LogQL

Learn LogQL syntax for filtering + aggregating logs.

**Basic queries**:

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

**Parsing + filtering**:

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

**Aggregations** (metrics from logs):

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

**Filter by extracted fields**:

```logql
# Find specific trace in logs
{job="app"} | json | trace_id="abc123def456"

# HTTP 5xx errors from nginx
{job="nginx"} | pattern `<_> "<_> <_> <_>" <status> <_>` | status >= 500

# Failed authentication attempts
{job="app"} | json | message=~"authentication failed" | user_id != ""
```

Create Grafana explore queries or dashboard panels using these patterns.

**→** Queries return expected log lines, filtering works correct, aggregations produce metrics from logs.

**If err:**
- Use Grafana Explore → debug queries interactive
- Check label names: `curl http://localhost:3100/loki/api/v1/labels`
- Valid. label values: `curl http://localhost:3100/loki/api/v1/label/{label_name}/values`
- Simplify query: start w/ basic label selector, add filters incrementally
- Check time range: logs might not exist in selected window

### Step 5: Integrate Logs with Metrics + Traces

Correlate logs w/ Prometheus metrics + distributed traces → unified observability.

**Add trace IDs to logs** (app instrumentation):

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

**Configure Grafana data links** from metrics to logs:

In Prometheus panel field config:

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

**Configure Grafana data links** from logs to traces:

In Loki datasource config:

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

**Correlate logs in Grafana Explore**:
1. Query metrics in Prometheus
2. Click on data point
3. Select "View Logs" from context menu
4. Loki query auto-pop'd w/ relevant labels + time range
5. Click trace ID in logs
6. Tempo trace view opens w/ full distributed trace

**→** Clicking metrics opens related logs, trace IDs in logs link to trace viewer, single pane for metrics/logs/traces navigation.

**If err:**
- Valid. trace ID format matches regex in derived fields
- Check trace_id label extracted by Promtail pipeline
- Ensure Tempo datasource config'd in Grafana
- Test URL encoding for complex filter exprs
- Valid. data link URLs in incognito/private browser window

### Step 6: Set Up Log Retention + Compaction

Configure retention policies + compaction → manage storage costs.

**Retention by stream** (in Loki config):

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

**Retention by stream labels** (requires compactor):

```yaml
compactor:
  working_directory: /loki/compactor
  shared_store: filesystem
  compaction_interval: 10m
  retention_enabled: true
  retention_delete_delay: 2h
# ... (see EXAMPLES.md for complete configuration)
```

Priority determines which rule applies when multi match (lower number = higher priority).

**Compression settings**:

```yaml
chunk_store_config:
  chunk_cache_config:
    enable_fifocache: true
    fifocache:
      max_size_bytes: 1GB
      ttl: 24h
# ... (see EXAMPLES.md for complete configuration)
```

**Monitor retention**:

```bash
# Check chunk stats
curl http://localhost:3100/loki/api/v1/status/chunks | jq

# Check compactor metrics
curl http://localhost:3100/metrics | grep loki_compactor

# Verify deleted chunks
curl http://localhost:3100/metrics | grep loki_boltdb_shipper_retention_deleted
```

**→** Old logs auto deleted per retention policy, storage usage stabilizes, compaction cuts index size.

**If err:**
- Enable compactor in Loki config if retention not working
- Check compactor logs: `docker logs loki | grep compactor`
- Valid. retention_enabled: true + retention_deletes_enabled: true
- Monitor disk usage: `du -sh /loki/`
- S3: check bucket lifecycle policies don't conflict w/ Loki retention

## Check

- [ ] Loki API health check returns 200: `curl http://localhost:3100/ready`
- [ ] Promtail successfully scraping logs from all config'd sources
- [ ] Labels extracted correct from log lines (visible in Grafana Explore)
- [ ] LogQL queries return expected results w/ proper filtering
- [ ] Log retention policy enforced (old logs deleted after retention period)
- [ ] Logs accessible from Grafana dashboards + Explore view
- [ ] Trace IDs from logs link to Tempo trace viewer
- [ ] Metrics panels have data links to relevant logs
- [ ] Compaction running + cutting storage overhead
- [ ] Storage usage w/in allocated disk/S3 budget

## Traps

- **High cardinality labels**: Unbounded label values (user IDs, req IDs) → index explosion. Use fixed labels (level, service, env) + put variables in log lines.
- **Missing log parsing**: Raw logs w/o label extraction limits query capabilities. Always parse structured logs (JSON, logfmt) or use regex for unstructured.
- **Incorrect time parsing**: Mismatched timestamp formats → logs out of order or rejected. Test timestamp parsing w/ sample logs.
- **Retention not working**: Compactor must be enabled for retention to delete old data. Check `retention_enabled: true` + `retention_deletes_enabled: true`.
- **Ingestion rate limits**: Default limits (10MB/s) may be too low for high-volume systems. Adjust `ingestion_rate_mb` + `ingestion_burst_size_mb`.
- **Query timeouts**: Broad queries over long time ranges can timeout. Use more specific label selectors + shorter time windows.
- **Log duplication**: Multi Promtail instances scraping same logs create dupes. Use unique labels or positions file coordination.

## →

- `correlate-observability-signals` - Unified debugging across metrics, logs, traces using trace IDs
- `build-grafana-dashboards` - Visualize log-derived metrics + create log panels in dashboards
- `setup-prometheus-monitoring` - Metrics provide context for when to query logs during incidents
- `instrument-distributed-tracing` - Add trace IDs to logs for correlation w/ distributed traces
