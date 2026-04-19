---
name: configure-alerting-rules
locale: wenyan-ultra
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

# 警規配

配 Prometheus 警規與 Alertmanager 以可靠可為之事故通。

> 見 [Extended Examples](references/EXAMPLES.md) 以全配與模。

## 用

- 施主動監含自動事察
- 依嚴與服主路警至宜組
- 智聚與去重減警疲
- 與值守系（PagerDuty、Opsgenie）整
- 立生產要事之升策
- 從舊監遷至 Prometheus 警
- 建導應者至解之可為警

## 入

- **必**：所警之 Prometheus 度（錯率、延、飽）
- **必**：值守輪與升策
- **可**：現警定遷
- **可**：通道（Slack、email、PagerDuty）
- **可**：常警之 runbook

## 行

### 一：部 Alertmanager

裝且配 Alertmanager 以受 Prometheus 警。

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

**基 Alertmanager 配**（`alertmanager.yml` 摘）：

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

**配 Prometheus 用 Alertmanager**（`prometheus.yml`）：

```yaml
alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093
      timeout: 10s
      api_version: v2
```

**得：** Alertmanager UI 可於 `http://localhost:9093` 達，Prometheus 「Status > Alertmanagers」示 UP。

**敗：**
- 察 Alertmanager 日誌：`docker logs alertmanager`
- 驗 Prometheus 可達 Alertmanager：`curl http://alertmanager:9093/api/v2/status`
- 測 webhook URL：`curl -X POST <SLACK_WEBHOOK_URL> -d '{"text":"test"}'`
- 驗 YAML：`amtool check-config alertmanager.yml`

### 二：於 Prometheus 定警規

建於條件滿時發之警規。

**建警規檔**（`/etc/prometheus/rules/alerts.yml` 摘）：

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

**警設良踐**：

- **`for` 期**：防抖。常 5-10 分鐘。
- **述注**：含現值、受影響資、runbook 鏈。
- **嚴級**：critical（叫值守）、warning（查）、info（知）
- **組標**：使路至正組/頻道
- **runbook 鏈**：每警應有 runbook URL

載規入 Prometheus：

```yaml
# prometheus.yml
rule_files:
  - "rules/*.yml"
```

驗且重載：

```bash
promtool check rules /etc/prometheus/rules/alerts.yml
curl -X POST http://localhost:9090/-/reload
```

**得：** 警於 Prometheus「Alerts」頁可見，閾超時發，Alertmanager 收發警。

**敗：**
- 察 Prometheus 日誌尋規評錯
- `promtool check rules` 驗規
- 於 Prometheus UI 獨測警查
- 察警態轉：Inactive → Pending → Firing

### 三：建通模

設可讀可為之通訊。

**建模檔**（`/etc/alertmanager/templates/default.tmpl` 摘）：

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

**於 receiver 用模**：

```yaml
receivers:
  - name: 'slack-custom'
    slack_configs:
      - channel: '#alerts'
        title: '{{ template "slack.default.title" . }}'
        text: '{{ template "slack.default.text" . }}'
```

**得：** 通格式一致、含諸脈、可為含 runbook 鏈。

**敗：**
- 測模渲染：`amtool template test --config.file=alertmanager.yml`
- 於 Alertmanager 日誌察模語錯
- 用 `{{ . | json }}` 調模數據結構

### 四：配路與聚

以智路規優警遞。

**進路配**（摘）：

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

**聚策**：

```yaml
# Group by alertname: All HighCPU alerts bundled together
group_by: ['alertname']

# Group by alertname AND cluster: Separate notifications per cluster
group_by: ['alertname', 'cluster']
```

**得：** 警路至正組、邏輯聚、時宜於嚴。

**敗：**
- 測路：`amtool config routes test --config.file=alertmanager.yml --alertname=HighCPU --label=severity=critical`
- 察路樹：`amtool config routes show --config.file=alertmanager.yml`
- 警當匹多路→確 `continue: true`

### 五：施抑與靜

以抑規與暫靜減警噪。

**抑規**（壓依警）：

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

**以程建靜**：

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

**得：** 抑自動減級聯警，靜防維時之通。

**敗：**
- 以活警測抑邏
- 察 Alertmanager UI 之「Silences」頁
- 驗靜匹全（標須完全匹）

### 六：與外系整

連 Alertmanager 至 PagerDuty、Opsgenie、Jira 等。

**PagerDuty 整**（摘）：

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

**Webhook 自整**：

```yaml
receivers:
  - name: 'webhook-custom'
    webhook_configs:
      - url: 'https://your-webhook-endpoint.com/alerts'
        send_resolved: true
```

**得：** 警於 PagerDuty 建事，現於組通頻道，觸值守升。

**敗：**
- 驗 API key/token 有效
- 察與外服之網連
- 以 curl 獨測 webhook 端
- 啟 debug：`--log.level=debug`

## 驗

- [ ] Alertmanager 成收 Prometheus 警
- [ ] 警依標與嚴路至正組
- [ ] 通遞至 Slack、email、PagerDuty
- [ ] 警聚宜減通量
- [ ] 抑規正壓依警
- [ ] 靜於維窗防通
- [ ] 通模含 runbook 鏈與脈
- [ ] 重發間防久問之警疲
- [ ] 解通於警清時發
- [ ] 外整（PagerDuty、Opsgenie）建事

## 忌

- **警疲**：低優警多→應者忽 critical。嚴閾、用抑。
- **無 `for` 期**：無 `for` 於瞬峰發。常 5-10 分窗。
- **聚過廣**：`['...']` 聚發單通。用具體標聚。
- **無 runbook 鏈**：無 runbook 之警令應者猜。每警須 runbook URL。
- **誤嚴**：warning 標為 critical→組麻。critical 留急時。
- **忘靜**：無期靜可藏真問。必設終時。
- **單路**：諸警至一頻道失脈。用組特路。
- **無抑**：故中級聯警生噪。施抑規。

## 參

- `setup-prometheus-monitoring` - 定度與錄規供警用
- `define-slo-sli-sla` - 生 SLO 燒率警以管錯預算
- `write-incident-runbook` - 建警注所鏈之 runbook
- `build-grafana-dashboards` - 視警發史與靜模
