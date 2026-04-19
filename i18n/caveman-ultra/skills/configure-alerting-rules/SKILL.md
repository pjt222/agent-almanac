---
name: configure-alerting-rules
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Configure Prometheus Alertmanager with routing trees, receivers (Slack, PagerDuty, email),
  inhibition rules, silences, and notification templates for actionable incident alerting.
  Use when implementing proactive monitoring with automated incident detection, routing alerts
  to the appropriate team by severity, reducing alert fatigue through grouping and deduplication,
  integrating with on-call systems like PagerDuty, or migrating from legacy alerting to
  Prometheus-based alerting.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: observability
  complexity: intermediate
  language: multi
  tags: alertmanager, alerting, routing, pagerduty, slack
---

# Configure Alerting Rules

Set up Prometheus alerting rules + Alertmanager → reliable, actionable incident notifications.

> See [Extended Examples](references/EXAMPLES.md) for complete config files + templates.

## Use When

- Impl proactive monitoring w/ automated incident detection
- Route alerts to correct teams by severity + service ownership
- Cut alert fatigue via intelligent grouping + dedup
- Integrate monitoring w/ on-call systems (PagerDuty, Opsgenie)
- Establish escalation policies for critical prod issues
- Migrate legacy monitoring → Prometheus-based alerting
- Create actionable alerts guiding responders to resolution

## In

- **Required**: Prometheus metrics to alert on (error rates, latency, saturation)
- **Required**: On-call rotation + escalation policies
- **Optional**: Existing alert defs to migrate
- **Optional**: Notification channels (Slack, email, PagerDuty)
- **Optional**: Runbook docs for common alerts

## Do

### Step 1: Deploy Alertmanager

Install + configure Alertmanager to receive alerts from Prometheus.

**Docker Compose deployment** (basic structure):

```yaml
version: '3.8'
services:
  alertmanager:
    image: prom/alertmanager:v0.26.0
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager.yml:/etc/alertmanager/alertmanager.yml
    # ... (see EXAMPLES.md for complete configuration)
```

**Basic Alertmanager config** (`alertmanager.yml` excerpt):

```yaml
global:
  resolve_timeout: 5m
  slack_api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'

route:
  receiver: 'default-receiver'
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h

  routes:
    - match:
        severity: critical
      receiver: pagerduty-critical

# ... (see EXAMPLES.md for complete routing, inhibition rules, and receivers)
```

**Configure Prometheus to use Alertmanager** (`prometheus.yml`):

```yaml
alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093
      timeout: 10s
      api_version: v2
```

**→** Alertmanager UI accessible at `http://localhost:9093`, Prometheus "Status > Alertmanagers" shows UP.

**If err:**
- Check Alertmanager logs: `docker logs alertmanager`
- Verify Prometheus can reach Alertmanager: `curl http://alertmanager:9093/api/v2/status`
- Test webhook URLs: `curl -X POST <SLACK_WEBHOOK_URL> -d '{"text":"test"}'`
- Valid. YAML syntax: `amtool check-config alertmanager.yml`

### Step 2: Define Alerting Rules in Prometheus

Create alerting rules that fire when conditions met.

**Create alerting rules file** (`/etc/prometheus/rules/alerts.yml` excerpt):

```yaml
groups:
  - name: instance_alerts
    interval: 30s
    rules:
      - alert: InstanceDown
        expr: up == 0
        for: 5m
        labels:
          severity: critical
          team: infrastructure
        annotations:
          summary: "Instance {{ $labels.instance }} is down"
          description: "{{ $labels.instance }} has been down for >5min."
          runbook_url: "https://wiki.example.com/runbooks/instance-down"

      - alert: HighCPUUsage
        expr: 100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage on {{ $labels.instance }}"
          # ... (see EXAMPLES.md for complete alerts)
```

**Alert design best practices**:

- **`for` duration**: Prevents flapping alerts. Use 5-10 min for most alerts.
- **Descriptive annotations**: Include current value, affected resource, runbook link.
- **Severity levels**: critical (pages on-call), warning (investigate), info (FYI)
- **Team labels**: Enable routing to correct team/channel
- **Runbook links**: Every alert should have runbook URL

Load rules into Prometheus:

```yaml
# prometheus.yml
rule_files:
  - "rules/*.yml"
```

Valid. + reload:

```bash
promtool check rules /etc/prometheus/rules/alerts.yml
curl -X POST http://localhost:9090/-/reload
```

**→** Alerts visible in Prometheus "Alerts" page, alerts fire when thresholds exceeded, Alertmanager receives fired alerts.

**If err:**
- Check Prometheus logs for rule eval errors
- Valid. rule syntax w/ `promtool check rules`
- Test alert queries independently in Prometheus UI
- Inspect alert state transitions: Inactive → Pending → Firing

### Step 3: Create Notification Templates

Design readable, actionable notification msgs.

**Create template file** (`/etc/alertmanager/templates/default.tmpl` excerpt):

```gotmpl
{{ define "slack.default.title" }}
[{{ .Status | toUpper }}] {{ .GroupLabels.alertname }}
{{ end }}

{{ define "slack.default.text" }}
{{ range .Alerts }}
*Alert:* {{ .Labels.alertname }}
*Severity:* {{ .Labels.severity }}
*Summary:* {{ .Annotations.summary }}
{{ if .Annotations.runbook_url }}*Runbook:* {{ .Annotations.runbook_url }}{{ end }}
{{ end }}
{{ end }}

# ... (see EXAMPLES.md for complete email and PagerDuty templates)
```

**Use templates in receivers**:

```yaml
receivers:
  - name: 'slack-custom'
    slack_configs:
      - channel: '#alerts'
        title: '{{ template "slack.default.title" . }}'
        text: '{{ template "slack.default.text" . }}'
```

**→** Notifications formatted consistent, include all relevant context, actionable w/ runbook links.

**If err:**
- Test template rendering: `amtool template test --config.file=alertmanager.yml`
- Check template syntax errs in Alertmanager logs
- Use `{{ . | json }}` to debug template data structure

### Step 4: Configure Routing + Grouping

Optimize alert delivery w/ intelligent routing rules.

**Advanced routing config** (excerpt):

```yaml
route:
  receiver: 'default-receiver'
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 30s

  routes:
    - match:
        team: platform
      receiver: 'team-platform'
      routes:
        - match:
            severity: critical
          receiver: 'pagerduty-platform'
          group_wait: 10s
          repeat_interval: 15m
          continue: true   # Also send to Slack

# ... (see EXAMPLES.md for complete routing with time intervals)
```

**Grouping strategies**:

```yaml
# Group by alertname: All HighCPU alerts bundled together
group_by: ['alertname']

# Group by alertname AND cluster: Separate notifications per cluster
group_by: ['alertname', 'cluster']
```

**→** Alerts routed to correct teams, grouped logically, timing appropriate for severity.

**If err:**
- Test routing: `amtool config routes test --config.file=alertmanager.yml --alertname=HighCPU --label=severity=critical`
- Check routing tree: `amtool config routes show --config.file=alertmanager.yml`
- Valid. `continue: true` if alert should match multi routes

### Step 5: Implement Inhibition + Silencing

Cut alert noise w/ inhibition rules + temporary silences.

**Inhibition rules** (suppress dependent alerts):

```yaml
inhibit_rules:
  # Cluster down suppresses all node alerts in that cluster
  - source_match:
      alertname: 'ClusterDown'
      severity: 'critical'
    target_match_re:
      alertname: '(InstanceDown|HighCPU|HighMemory)'
    equal: ['cluster']

  # Service down suppresses latency and error alerts
  - source_match:
      alertname: 'ServiceDown'
    target_match_re:
      alertname: '(HighLatency|HighErrorRate)'
    equal: ['service', 'namespace']

# ... (see EXAMPLES.md for more inhibition patterns)
```

**Create silences programmatically**:

```bash
# Silence during maintenance
amtool silence add \
  instance=app-server-1 \
  --author="ops-team" \
  --comment="Scheduled maintenance" \
  --duration=2h

# List and manage silences
amtool silence query
amtool silence expire <SILENCE_ID>
```

**→** Inhibition cuts cascade alerts auto, silences prevent notifications during planned maintenance.

**If err:**
- Test inhibition logic w/ live alerts
- Check Alertmanager UI "Silences" tab
- Valid. silence matchers exact (labels must match perfectly)

### Step 6: Integrate with External Systems

Connect Alertmanager to PagerDuty, Opsgenie, Jira, etc.

**PagerDuty integration** (excerpt):

```yaml
receivers:
  - name: 'pagerduty'
    pagerduty_configs:
      - routing_key: 'YOUR_INTEGRATION_KEY'
        severity: '{{ .CommonLabels.severity }}'
        description: '{{ range .Alerts.Firing }}{{ .Annotations.summary }}{{ end }}'
        details:
          firing: '{{ .Alerts.Firing | len }}'
          alertname: '{{ .GroupLabels.alertname }}'
        # ... (see EXAMPLES.md for complete integration examples)
```

**Webhook for custom integrations**:

```yaml
receivers:
  - name: 'webhook-custom'
    webhook_configs:
      - url: 'https://your-webhook-endpoint.com/alerts'
        send_resolved: true
```

**→** Alerts create incidents in PagerDuty, appear in team comms channels, trigger on-call escalations.

**If err:**
- Valid. API keys/tokens valid
- Check network connectivity to external services
- Test webhook endpoints independently w/ curl
- Enable debug mode: `--log.level=debug`

## Check

- [ ] Alertmanager receives alerts from Prometheus successfully
- [ ] Alerts routed to correct teams by labels + severity
- [ ] Notifications delivered to Slack, email, or PagerDuty
- [ ] Alert grouping cuts notification volume appropriately
- [ ] Inhibition rules suppress dependent alerts correct
- [ ] Silences prevent notifications during maintenance windows
- [ ] Notification templates include runbook links + context
- [ ] Repeat interval prevents alert fatigue for long-running issues
- [ ] Resolved notifications sent when alerts clear
- [ ] External integrations (PagerDuty, Opsgenie) create incidents

## Traps

- **Alert fatigue**: Too many low-pri alerts → responders ignore critical ones. Set strict thresholds, use inhibition.
- **Missing `for` duration**: Alerts w/o `for` fire on transient spikes. Always use 5-10 min windows.
- **Overly broad grouping**: Grouping by `['...']` sends individual notifications. Use specific label grouping.
- **No runbook links**: Alerts w/o runbooks leave responders guessing. Every alert needs runbook URL.
- **Incorrect severity**: Mislabeling warnings as critical desensitizes team. Reserve critical for emergencies.
- **Forgotten silences**: Silences w/o expiration can hide real issues. Always set end times.
- **Single route**: All alerts to one channel loses context. Use team-specific routing.
- **No inhibition**: Cascade alerts during outages create noise. Impl inhibition rules.

## →

- `setup-prometheus-monitoring` - Define metrics + recording rules feeding alerting rules
- `define-slo-sli-sla` - Generate SLO burn rate alerts for error budget mgmt
- `write-incident-runbook` - Create runbooks linked from alert annotations
- `build-grafana-dashboards` - Visualize alert firing history + silence patterns
