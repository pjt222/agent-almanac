---
name: build-grafana-dashboards
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Create production-ready Grafana dashboards with reusable panels, template variables,
  annotations, and provisioning for version-controlled dashboard deployment. Use when
  creating visual representations of Prometheus, Loki, or other data source metrics,
  building operational dashboards for SRE teams, migrating from manual dashboard creation
  to version-controlled provisioning, or establishing executive-level SLO compliance
  reporting.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: observability
  complexity: intermediate
  language: multi
  tags: grafana, dashboards, visualization, panels, provisioning
---

# Build Grafana Dashboards

Design + deploy Grafana dashboards w/ best practices for maintainability, reusability, version control.

## Use When

- Visual reps of Prometheus, Loki, other data source metrics
- Operational dashboards for SRE teams + incident responders
- Exec-level SLO compliance reporting
- Migrate manual creation → version-controlled provisioning
- Standardize layouts across teams w/ template vars
- Drill-down experiences: high-level → detailed

## In

- **Required**: Data source config (Prometheus, Loki, Tempo, etc.)
- **Required**: Metrics or logs to visualize w/ query patterns
- **Optional**: Template vars for multi-service or multi-env views
- **Optional**: Existing dashboard JSON for migration/mod
- **Optional**: Annotation queries for event correlation (deploys, incidents)

## Do

> See [Extended Examples](references/EXAMPLES.md) for complete config files + templates.

### Step 1: Design Dashboard Structure

Plan layout + organization before building panels.

Create dashboard spec doc:

```markdown
# Service Overview Dashboard

## Purpose
Real-time operational view for on-call engineers monitoring the API service.

## Rows
1. High-Level Metrics (collapsed by default)
   - Request rate, error rate, latency (RED metrics)
   - Service uptime, instance count
2. Detailed Metrics (expanded by default)
   - Per-endpoint latency breakdown
   - Error rate by status code
   - Database connection pool status
3. Resource Utilization
   - CPU, memory, disk usage per instance
   - Network I/O rates
4. Logs (collapsed by default)
   - Recent errors from Loki
   - Alert firing history

## Variables
- `environment`: production, staging, development
- `instance`: all instances or specific instance selection
- `interval`: aggregation window (5m, 15m, 1h)

## Annotations
- Deployment events from CI/CD system
- Alert firing/resolving events
```

Design principles:
- **Most important first**: Critical at top, details below
- **Consistent time ranges**: Sync time across panels
- **Drill-down paths**: Link high-level → detailed
- **Responsive layout**: Rows + panel widths work on various screens

**→** Clear structure documented, stakeholders aligned on metrics + layout priorities.

**If err:**
- Conduct design review w/ end users (SREs, devs)
- Benchmark vs industry standards (USE method, RED method, Four Golden Signals)
- Review existing dashboards for consistency patterns

### Step 2: Dashboard w/ Template Vars

Foundation w/ reusable vars for filtering.

Dashboard JSON structure (or UI → export):

```json
{
  "dashboard": {
    "title": "API Service Overview",
    "uid": "api-service-overview",
    "version": 1,
    "timezone": "browser",
    "editable": true,
    "graphTooltip": 1,
    "time": {
      "from": "now-6h",
      "to": "now"
    },
    "refresh": "30s",
    "templating": {
      "list": [
        {
          "name": "environment",
          "type": "query",
          "datasource": "Prometheus",
          "query": "label_values(up{job=\"api-service\"}, environment)",
          "multi": false,
          "includeAll": false,
          "refresh": 1,
          "sort": 1,
          "current": {
            "selected": false,
            "text": "production",
            "value": "production"
          }
        },
        {
          "name": "instance",
          "type": "query",
          "datasource": "Prometheus",
          "query": "label_values(up{job=\"api-service\",environment=\"$environment\"}, instance)",
          "multi": true,
          "includeAll": true,
          "refresh": 1,
          "allValue": ".*",
          "current": {
            "selected": true,
            "text": "All",
            "value": "$__all"
          }
        },
        {
          "name": "interval",
          "type": "interval",
          "options": [
            {"text": "1m", "value": "1m"},
            {"text": "5m", "value": "5m"},
            {"text": "15m", "value": "15m"},
            {"text": "1h", "value": "1h"}
          ],
          "current": {
            "text": "5m",
            "value": "5m"
          },
          "auto": false
        }
      ]
    },
    "annotations": {
      "list": [
        {
          "name": "Deployments",
          "datasource": "Prometheus",
          "enable": true,
          "expr": "changes(app_version{job=\"api-service\",environment=\"$environment\"}[5m]) > 0",
          "step": "60s",
          "iconColor": "rgba(0, 211, 255, 1)",
          "tagKeys": "version"
        }
      ]
    }
  }
}
```

Var types + use cases:
- **Query vars**: Dynamic lists from data source (`label_values()`, `query_result()`)
- **Interval vars**: Aggregation windows for queries
- **Custom vars**: Static lists for non-metric selections
- **Constant vars**: Shared values across panels (data source names, thresholds)
- **Text box vars**: Free-form in for filtering

**→** Vars populate from data source, cascading filters work (env filters instances), default selections appropriate.

**If err:**
- Test var queries independently in Prometheus UI
- Check circular deps (A depends on B depends on A)
- Verify regex in `allValue` for multi-select vars
- Review var refresh settings (on dashboard load vs time range change)

### Step 3: Visualization Panels

Create panels per metric w/ appropriate viz types.

**Time series panel** (request rate):

```json
{
  "type": "timeseries",
  "title": "Request Rate",
  "gridPos": {"h": 8, "w": 12, "x": 0, "y": 0},
  "targets": [
    {
      "expr": "sum(rate(http_requests_total{job=\"api-service\",environment=\"$environment\",instance=~\"$instance\"}[$interval])) by (method)",
      "legendFormat": "{{method}}",
      "refId": "A"
    }
  ],
  "fieldConfig": {
    "defaults": {
      "unit": "reqps",
      "color": {
        "mode": "palette-classic"
      },
      "custom": {
        "drawStyle": "line",
        "lineInterpolation": "smooth",
        "fillOpacity": 10,
        "spanNulls": true
      },
      "thresholds": {
        "mode": "absolute",
        "steps": [
          {"value": null, "color": "green"},
          {"value": 1000, "color": "yellow"},
          {"value": 5000, "color": "red"}
        ]
      }
    }
  },
  "options": {
    "tooltip": {
      "mode": "multi",
      "sort": "desc"
    },
    "legend": {
      "displayMode": "table",
      "placement": "right",
      "calcs": ["mean", "max", "last"]
    }
  }
}
```

**Stat panel** (error rate):

```json
{
  "type": "stat",
  "title": "Error Rate",
  "gridPos": {"h": 4, "w": 6, "x": 12, "y": 0},
  "targets": [
    {
# ... (see EXAMPLES.md for complete configuration)
```

**Heatmap panel** (latency distribution):

```json
{
  "type": "heatmap",
  "title": "Request Duration Heatmap",
  "gridPos": {"h": 8, "w": 12, "x": 0, "y": 8},
  "targets": [
    {
# ... (see EXAMPLES.md for complete configuration)
```

Panel selection guide:
- **Time series**: Trends over time (rates, counts, durations)
- **Stat**: Single current value w/ threshold coloring
- **Gauge**: Pct values (CPU, mem, disk usage)
- **Bar gauge**: Compare many values at point in time
- **Heatmap**: Distribution over time (latency percentiles)
- **Table**: Detailed breakdown of many metrics
- **Logs**: Raw log lines from Loki w/ filtering

**→** Panels render w/ data, viz matches intended types, legends descriptive, thresholds highlight problems.

**If err:**
- Test queries in Explore view w/ same time range + vars
- Check metric name typos or incorrect label filters
- Verify aggregation fns match metric type (rate for counters, avg for gauges)
- Review unit configs (bytes, sec, req/sec)
- Enable "Show query inspector" to debug empty results

### Step 4: Rows + Layout

Organize into collapsible rows for logical grouping.

```json
{
  "panels": [
    {
      "type": "row",
      "title": "High-Level Metrics",
      "collapsed": false,
# ... (see EXAMPLES.md for complete configuration)
```

Layout best practices:
- Grid 24 units wide, each panel specifies `w` + `h`
- Rows group related panels, collapse less critical by default
- Most critical in first visible area (y=0-8)
- Consistent panel heights w/in rows (typically 4, 8, 12 units)
- Full width (24) for time series, half (12) for comparisons

**→** Layout organized logically, rows collapse/expand correctly, panels align w/o gaps.

**If err:**
- Validate gridPos coords don't overlap
- Check row panels array contains panels (not null)
- Verify y-coords increment logically down page
- Use Grafana UI "Edit JSON" to inspect grid positions

### Step 5: Links + Drill-Downs

Navigation paths between related dashboards.

Dashboard-level links in JSON:

```json
{
  "links": [
    {
      "title": "Service Details",
      "type": "link",
      "icon": "external link",
# ... (see EXAMPLES.md for complete configuration)
```

Panel-level data links:

```json
{
  "fieldConfig": {
    "defaults": {
      "links": [
        {
          "title": "View Logs for ${__field.labels.instance}",
# ... (see EXAMPLES.md for complete configuration)
```

Link vars:
- `$service`, `$environment`: Dashboard template vars
- `${__field.labels.instance}`: Label value from clicked point
- `${__from}`, `${__to}`: Current dashboard time range
- `$__url_time_range`: Encoded time range for URL

**→** Click elements or links navigates to related views w/ ctx preserved (time range, vars).

**If err:**
- URL encode special chars in query params
- Test links w/ various var selections (All vs specific)
- Verify target dashboard UIDs exist + accessible
- Check `includeVars` + `keepTime` flags work

### Step 6: Dashboard Provisioning

Version control dashboards as code for reproducible deploys.

Provisioning dir structure:

```bash
mkdir -p /etc/grafana/provisioning/{dashboards,datasources}
```

Datasource provisioning (`/etc/grafana/provisioning/datasources/prometheus.yml`):

```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
# ... (see EXAMPLES.md for complete configuration)
```

Dashboard provisioning (`/etc/grafana/provisioning/dashboards/default.yml`):

```yaml
apiVersion: 1

providers:
  - name: 'default'
    orgId: 1
    folder: 'Services'
    type: file
    disableDeletion: false
    updateIntervalSeconds: 30
    allowUiUpdates: true
    options:
      path: /var/lib/grafana/dashboards
      foldersFromFilesStructure: true
```

Store JSON in `/var/lib/grafana/dashboards/`:

```bash
/var/lib/grafana/dashboards/
├── api-service/
│   ├── overview.json
│   └── details.json
├── database/
│   └── postgres.json
└── infrastructure/
    ├── nodes.json
    └── kubernetes.json
```

Docker Compose:

```yaml
version: '3.8'
services:
  grafana:
    image: grafana/grafana:10.2.0
    ports:
      - "3000:3000"
    volumes:
      - ./grafana/provisioning:/etc/grafana/provisioning
      - ./grafana/dashboards:/var/lib/grafana/dashboards
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
      - GF_AUTH_ANONYMOUS_ENABLED=true
      - GF_AUTH_ANONYMOUS_ORG_ROLE=Viewer
```

**→** Dashboards auto-loaded on Grafana startup, JSON changes reflected after update interval, VC tracks dashboard changes.

**If err:**
- Check Grafana logs: `docker logs grafana | grep -i provisioning`
- Verify JSON syntax: `python -m json.tool dashboard.json`
- File perms: `chmod 644 *.json`
- Test `allowUiUpdates: false` to prevent UI mods
- Validate provisioning: `curl http://localhost:3000/api/admin/provisioning/dashboards/reload -X POST -H "Authorization: Bearer $GRAFANA_API_KEY"`

## Check

- [ ] Dashboard loads w/o errs in Grafana UI
- [ ] All template vars populate w/ expected values
- [ ] Cascading works (env filters instances)
- [ ] Panels display data for configured time ranges
- [ ] Queries use vars correctly (no hardcoded)
- [ ] Thresholds highlight problem states
- [ ] Legend formatting descriptive, not cluttered
- [ ] Annotations appear for relevant events
- [ ] Links navigate to correct dashboards w/ ctx preserved
- [ ] Dashboard provisioned from JSON (version controlled)
- [ ] Responsive layout works on diff screen sizes
- [ ] Tooltip + hover provide useful ctx

## Traps

- **Var not updating panels**: Queries must use `$variable` syntax, not hardcoded. Check var refresh settings
- **Empty panels w/ correct query**: Verify time range includes data. Check scrape interval vs aggregation window (5m rate needs >5m of data)
- **Legend verbose**: Use `legendFormat` for relevant labels only, not full metric name. `{{method}} - {{status}}` vs default
- **Inconsistent time ranges**: Set dashboard time sync → all panels share window. "Sync cursor" for correlated investigation
- **Perf issues**: Avoid queries returning high cardinality (>1000). Use recording rules or pre-aggregation. Limit time ranges for expensive queries
- **Dashboard drift**: No provisioning → manual UI changes create VC conflicts. `allowUiUpdates: false` in prod
- **Missing data links**: Need exact label names. `${__field.labels.labelname}` carefully, verify label exists in query result
- **Annotation overload**: Too many → clutter. Filter by importance or separate tracks

## →

- `setup-prometheus-monitoring` — config Prometheus data sources feeding Grafana
- `configure-log-aggregation` — set up Loki for log panel queries + log-based annotations
- `define-slo-sli-sla` — viz SLO compliance + error budgets w/ Grafana stat + gauge panels
- `instrument-distributed-tracing` — add trace ID links from metrics panels to Tempo trace views
