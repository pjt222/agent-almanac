---
name: configure-alerting-rules
locale: wenyan
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

# 設警之則

設 Prometheus 之警則與 Alertmanager 為可信可行之事告。

> 見 [Extended Examples](references/EXAMPLES.md) 以全設檔與範。

## 用時

- 施自動察事之主動監
- 依重與服主路警於合團
- 以智聚與去重減警疲
- 合監於值班系（PagerDuty、Opsgenie）
- 立升策於產之危問
- 自舊監遷於 Prometheus 之警
- 建可行之警導應者至解

## 入

- **必**：可警之 Prometheus 量（誤率、遲、飽）
- **必**：值班輪與升之策
- **可選**：現存警定以遷
- **可選**：告管（Slack、郵、PagerDuty）
- **可選**：常警之行冊

## 法

### 第一步：部 Alertmanager

裝設 Alertmanager 以受 Prometheus 之警。

**Docker Compose 部**（基構）：

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

**基 Alertmanager 設**（`alertmanager.yml` 摘）：

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

**設 Prometheus 用 Alertmanager**（`prometheus.yml`）：

```yaml
alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093
      timeout: 10s
      api_version: v2
```

**得：** Alertmanager UI 於 `http://localhost:9093` 可訪，Prometheus「Status > Alertmanagers」示 UP。

**敗則：**
- 察 Alertmanager 誌：`docker logs alertmanager`
- 驗 Prometheus 可達 Alertmanager：`curl http://alertmanager:9093/api/v2/status`
- 試 webhook URL：`curl -X POST <SLACK_WEBHOOK_URL> -d '{"text":"test"}'`
- 驗 YAML 法：`amtool check-config alertmanager.yml`

### 第二步：定警之則於 Prometheus

建警則，條件滿則發。

**建警則檔**（`/etc/prometheus/rules/alerts.yml` 摘）：

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

**警設之善實**：

- **`for` 之時**：防警抖。多數警用五至十分。
- **描註**：含當值、受影資、行冊鏈。
- **重級**：critical（呼值班）、warning（察）、info（悉）
- **團標**：令路至正團/道
- **行冊鏈**：每警必有行冊 URL

載則於 Prometheus：

```yaml
# prometheus.yml
rule_files:
  - "rules/*.yml"
```

驗而重載：

```bash
promtool check rules /etc/prometheus/rules/alerts.yml
curl -X POST http://localhost:9090/-/reload
```

**得：** 警見於 Prometheus 之「Alerts」頁，越閾時發，Alertmanager 受之。

**敗則：**
- 察 Prometheus 誌之則評誤
- 以 `promtool check rules` 驗則法
- 獨試警查於 Prometheus UI
- 察警態遷：Inactive → Pending → Firing

### 第三步：建告範

設可讀可行之告訊。

**建範檔**（`/etc/alertmanager/templates/default.tmpl` 摘）：

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

**於受者用範**：

```yaml
receivers:
  - name: 'slack-custom'
    slack_configs:
      - channel: '#alerts'
        title: '{{ template "slack.default.title" . }}'
        text: '{{ template "slack.default.text" . }}'
```

**得：** 告一式，含相關境，附行冊鏈以可行。

**敗則：**
- 試範渲：`amtool template test --config.file=alertmanager.yml`
- 察 Alertmanager 誌之範法誤
- 用 `{{ . | json }}` 以調範資之構

### 第四步：設路與聚

以智路則優送警。

**進路設**（摘）：

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

**聚之策**：

```yaml
# Group by alertname: All HighCPU alerts bundled together
group_by: ['alertname']

# Group by alertname AND cluster: Separate notifications per cluster
group_by: ['alertname', 'cluster']
```

**得：** 警路至正團，聚理合，時合於重。

**敗則：**
- 試路：`amtool config routes test --config.file=alertmanager.yml --alertname=HighCPU --label=severity=critical`
- 察路樹：`amtool config routes show --config.file=alertmanager.yml`
- 若警應配多路驗 `continue: true`

### 第五步：施抑與默

以抑則與暫默減警噪。

**抑則**（壓依警）：

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

**以程建默**：

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

**得：** 抑自減連警，默於謀之養時防告。

**敗則：**
- 以活警試抑理
- 察 Alertmanager UI 之「Silences」
- 驗默配完全對（標必全配）

### 第六步：合外系

連 Alertmanager 於 PagerDuty、Opsgenie、Jira 等。

**PagerDuty 合**（摘）：

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

**Webhook 為自定合**：

```yaml
receivers:
  - name: 'webhook-custom'
    webhook_configs:
      - url: 'https://your-webhook-endpoint.com/alerts'
        send_resolved: true
```

**得：** 警於 PagerDuty 建事，現於團通道，發值班升。

**敗則：**
- 驗 API 符有效
- 察於外服之網
- 獨以 curl 試 webhook 端
- 啟調：`--log.level=debug`

## 驗

- [ ] Alertmanager 自 Prometheus 成受警
- [ ] 警依標與重路至正團
- [ ] 告送至 Slack、郵、或 PagerDuty
- [ ] 警聚合減告量
- [ ] 抑則壓依警
- [ ] 默防告於養窗
- [ ] 告範含行冊鏈與境
- [ ] 重複間防長問之疲
- [ ] 警解時送解告
- [ ] 外合（PagerDuty、Opsgenie）建事

## 陷

- **警疲**：低先警過多使應者忽危。設嚴閾、用抑。
- **缺 `for` 之時**：無 `for` 之警於瞬峰發。必用五至十分之窗。
- **聚過廣**：以 `['...']` 聚送獨告。用特標聚。
- **無行冊鏈**：無行冊之警使應者茫。每警必有行冊 URL。
- **重誤**：誤標警為危使團鈍感。危留於急。
- **忘默**：無限之默可掩真問。必設止時。
- **單路**：諸警至一道失境。用團特路。
- **無抑**：事中連警生噪。施抑則。

## 參

- `setup-prometheus-monitoring` - 定供警則之量與錄則
- `define-slo-sli-sla` - 生 SLO 燃率警以治誤預
- `write-incident-runbook` - 建警註所鏈之行冊
- `build-grafana-dashboards` - 視警發史與默式
