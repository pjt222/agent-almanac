---
name: configure-alerting-rules
locale: wenyan-lite
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

# 配置告警規則

設 Prometheus 告警規則與 Alertmanager 以得可靠可行之事件通知。

> 見 [Extended Examples](references/EXAMPLES.md) 取完整配置檔與模板。

## 適用時機

- 實行帶自動事件偵測之主動監控
- 依嚴重度與服務責屬路由告警至對應團隊
- 以智能分組與去重減告警疲勞
- 將監控接入值班系統（PagerDuty、Opsgenie）
- 立關鍵生產議題之升呈策
- 自舊監控系統遷至 Prometheus 告警
- 建引導應對者至解之可行告警

## 輸入

- **必要**：欲告警之 Prometheus 指標（錯誤率、延遲、飽和）
- **必要**：值班輪調與升呈策
- **選擇性**：待遷之既有告警定義
- **選擇性**：通知管道（Slack、email、PagerDuty）
- **選擇性**：常見告警之 runbook 文件

## 步驟

### 步驟一：部署 Alertmanager

裝並配 Alertmanager 以接收自 Prometheus 之告警。

**Docker Compose 部署**（基本結構）：

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

**基本 Alertmanager 配置**（`alertmanager.yml` 摘）：

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

**預期：** Alertmanager UI 於 `http://localhost:9093` 可達；Prometheus「Status > Alertmanagers」顯示 UP。

**失敗時：**
- 查 Alertmanager 日誌：`docker logs alertmanager`
- 驗 Prometheus 可達 Alertmanager：`curl http://alertmanager:9093/api/v2/status`
- 測 webhook URL：`curl -X POST <SLACK_WEBHOOK_URL> -d '{"text":"test"}'`
- 驗 YAML 語法：`amtool check-config alertmanager.yml`

### 步驟二：於 Prometheus 定告警規則

作條件滿足時觸之告警規則。

**建告警規則檔**（`/etc/prometheus/rules/alerts.yml` 摘）：

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

**告警設計良實踐**：

- **`for` 時長**：防抖動告警。多數告警用 5-10 分鐘
- **描述性註**：含當前值、受影響資源、runbook 連結
- **嚴重度**：critical（呼叫值班）、warning（調查）、info（知會）
- **團隊標籤**：令路由至正確團隊/頻道
- **Runbook 連結**：每告警宜有 runbook URL

載規則入 Prometheus：

```yaml
# prometheus.yml
rule_files:
  - "rules/*.yml"
```

驗並重載：

```bash
promtool check rules /etc/prometheus/rules/alerts.yml
curl -X POST http://localhost:9090/-/reload
```

**預期：** 告警見於 Prometheus「Alerts」頁；閾值超時告警觸；Alertmanager 收觸之告警。

**失敗時：**
- 查 Prometheus 日誌之規則求值錯
- 以 `promtool check rules` 驗規則語法
- 於 Prometheus UI 獨立測告警查詢
- 察告警狀態轉移：Inactive → Pending → Firing

### 步驟三：建通知模板

設可讀且可行之通知訊息。

**建模板檔**（`/etc/alertmanager/templates/default.tmpl` 摘）：

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

**於 receivers 用模板**：

```yaml
receivers:
  - name: 'slack-custom'
    slack_configs:
      - channel: '#alerts'
        title: '{{ template "slack.default.title" . }}'
        text: '{{ template "slack.default.text" . }}'
```

**預期：** 通知格式一致、含所有相關脈絡、附 runbook 連結可行。

**失敗時：**
- 測模板渲染：`amtool template test --config.file=alertmanager.yml`
- 於 Alertmanager 日誌查模板語法錯
- 用 `{{ . | json }}` 以調試模板數據結構

### 步驟四：配路由與分組

以智能路由規則優化告警遞送。

**進階路由配置**（摘）：

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

**分組策略**：

```yaml
# Group by alertname: All HighCPU alerts bundled together
group_by: ['alertname']

# Group by alertname AND cluster: Separate notifications per cluster
group_by: ['alertname', 'cluster']
```

**預期：** 告警路由至正確團隊、合邏輯分組、時序合嚴重度。

**失敗時：**
- 測路由：`amtool config routes test --config.file=alertmanager.yml --alertname=HighCPU --label=severity=critical`
- 查路由樹：`amtool config routes show --config.file=alertmanager.yml`
- 若告警當匹配多路由，驗 `continue: true`

### 步驟五：實行抑制與靜默

以抑制規則與暫時靜默減告警雜音。

**抑制規則**（抑從屬告警）：

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

**程序式建靜默**：

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

**預期：** 抑制自動減連鎖告警；靜默於計畫維護中防通知。

**失敗時：**
- 以活告警測抑制邏輯
- 查 Alertmanager UI「Silences」分頁
- 驗靜默匹配器精確（標籤須完全同）

### 步驟六：接外部系統

連 Alertmanager 至 PagerDuty、Opsgenie、Jira 等。

**PagerDuty 整合**（摘）：

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

**自訂整合之 Webhook**：

```yaml
receivers:
  - name: 'webhook-custom'
    webhook_configs:
      - url: 'https://your-webhook-endpoint.com/alerts'
        send_resolved: true
```

**預期：** 告警於 PagerDuty 建事件、見於團隊通訊頻道、觸值班升呈。

**失敗時：**
- 驗 API 金鑰/令牌有效
- 查至外服之網路連通
- 以 curl 獨立測 webhook 端點
- 啟除錯模式：`--log.level=debug`

## 驗證

- [ ] Alertmanager 成功自 Prometheus 收告警
- [ ] 告警依標籤與嚴重度路由至正確團隊
- [ ] 通知遞至 Slack、email、PagerDuty
- [ ] 告警分組適當減通知量
- [ ] 抑制規則正確抑從屬告警
- [ ] 靜默於維護窗防通知
- [ ] 通知模板含 runbook 連結與脈絡
- [ ] 重複間隔於長駐議題中防告警疲勞
- [ ] 告警清時發解決之通知
- [ ] 外部整合（PagerDuty、Opsgenie）建事件

## 常見陷阱

- **告警疲勞**：低優告警過多令應對者忽核心者。嚴閾值、用抑制
- **缺 `for` 時長**：無 `for` 之告警於瞬峰觸。總用 5-10 分鐘窗
- **過廣之分組**：以 `['...']` 分組發個別通知。用具體標籤分組
- **無 runbook 連結**：無 runbook 之告警令應對者猜。每告警需 runbook URL
- **錯嚴重度**：誤標警為核令團隊脫敏。核留於急
- **遺忘之靜默**：無期靜默可藏真問題。總設終時
- **單路由**：所有告警至一頻道失脈絡。用團隊專屬路由
- **無抑制**：斷擺時之連鎖告警生雜。實行抑制規則

## 相關技能

- `setup-prometheus-monitoring` - 定供告警規則之指標與記錄規則
- `define-slo-sli-sla` - 生錯誤預算管理之 SLO 燒率告警
- `write-incident-runbook` - 建告警註中連結之 runbook
- `build-grafana-dashboards` - 視覺化告警觸發歷史與靜默模式
