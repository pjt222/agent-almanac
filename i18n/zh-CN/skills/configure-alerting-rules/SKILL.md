---
name: configure-alerting-rules
description: >
  配置 Prometheus Alertmanager，包括路由树、接收器（Slack、PagerDuty、邮件）、
  抑制规则、静默及通知模板，用于可操作的事故告警。适用于通过自动事故检测实施主动监控、
  按严重程度将告警路由到适当团队、通过分组和去重减少告警疲劳、
  与 PagerDuty 等值班系统集成，或将遗留告警迁移到基于 Prometheus 的告警系统。
locale: zh-CN
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
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

设置 Prometheus 告警规则和 Alertmanager，实现可靠且可操作的事故通知。

> 完整配置文件和模板请参阅 [Extended Examples](references/EXAMPLES.md)。

## 适用场景

- 通过自动事故检测实施主动监控
- 根据严重程度和服务所有权将告警路由到适当团队
- 通过智能分组和去重减少告警疲劳
- 与值班系统（PagerDuty、Opsgenie）集成监控
- 为关键生产问题建立升级策略
- 将遗留监控系统迁移到基于 Prometheus 的告警
- 创建引导响应人员解决问题的可操作告警

## 输入

- **必填**：需要告警的 Prometheus 指标（错误率、延迟、饱和度）
- **必填**：值班轮换和升级策略
- **可选**：需要迁移的现有告警定义
- **可选**：通知渠道（Slack、邮件、PagerDuty）
- **可选**：常见告警的运行手册文档

## 步骤

### 第 1 步：部署 Alertmanager

安装并配置 Alertmanager 以接收来自 Prometheus 的告警。

**Docker Compose 部署**（基本结构）：

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

**基础 Alertmanager 配置**（`alertmanager.yml` 摘录）：

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

**配置 Prometheus 使用 Alertmanager**（`prometheus.yml`）：

```yaml
alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093
      timeout: 10s
      api_version: v2
```

**预期结果：** Alertmanager UI 可通过 `http://localhost:9093` 访问，Prometheus "Status > Alertmanagers" 显示 UP 状态。

**失败处理：**
- 检查 Alertmanager 日志：`docker logs alertmanager`
- 验证 Prometheus 可访问 Alertmanager：`curl http://alertmanager:9093/api/v2/status`
- 测试 webhook URL：`curl -X POST <SLACK_WEBHOOK_URL> -d '{"text":"test"}'`
- 验证 YAML 语法：`amtool check-config alertmanager.yml`

### 第 2 步：在 Prometheus 中定义告警规则

创建条件满足时触发的告警规则。

**创建告警规则文件**（`/etc/prometheus/rules/alerts.yml` 摘录）：

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

**告警设计最佳实践**：

- **`for` 持续时间**：防止抖动告警。大多数告警使用 5-10 分钟。
- **描述性注解**：包含当前值、受影响资源和运行手册链接。
- **严重程度级别**：critical（呼叫值班人员）、warning（调查）、info（仅供参考）
- **团队标签**：启用路由到正确团队/渠道
- **运行手册链接**：每个告警都应有运行手册 URL

将规则加载到 Prometheus：

```yaml
# prometheus.yml
rule_files:
  - "rules/*.yml"
```

验证和重新加载：

```bash
promtool check rules /etc/prometheus/rules/alerts.yml
curl -X POST http://localhost:9090/-/reload
```

**预期结果：** 告警在 Prometheus "Alerts" 页面可见，阈值超出时告警触发，Alertmanager 接收触发的告警。

**失败处理：**
- 检查 Prometheus 日志中的规则评估错误
- 用 `promtool check rules` 验证规则语法
- 在 Prometheus UI 中独立测试告警查询
- 检查告警状态转换：Inactive → Pending → Firing

### 第 3 步：创建通知模板

设计可读且可操作的通知消息。

**创建模板文件**（`/etc/alertmanager/templates/default.tmpl` 摘录）：

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

**在接收器中使用模板**：

```yaml
receivers:
  - name: 'slack-custom'
    slack_configs:
      - channel: '#alerts'
        title: '{{ template "slack.default.title" . }}'
        text: '{{ template "slack.default.text" . }}'
```

**预期结果：** 通知格式一致，包含所有相关上下文，带运行手册链接且可操作。

**失败处理：**
- 测试模板渲染：`amtool template test --config.file=alertmanager.yml`
- 检查 Alertmanager 日志中的模板语法错误
- 使用 `{{ . | json }}` 调试模板数据结构

### 第 4 步：配置路由和分组

通过智能路由规则优化告警投递。

**高级路由配置**（摘录）：

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

**分组策略**：

```yaml
# Group by alertname: All HighCPU alerts bundled together
group_by: ['alertname']

# Group by alertname AND cluster: Separate notifications per cluster
group_by: ['alertname', 'cluster']
```

**预期结果：** 告警路由到正确团队，逻辑分组，时机与严重程度匹配。

**失败处理：**
- 测试路由：`amtool config routes test --config.file=alertmanager.yml --alertname=HighCPU --label=severity=critical`
- 检查路由树：`amtool config routes show --config.file=alertmanager.yml`
- 如果告警应匹配多个路由，验证 `continue: true`

### 第 5 步：实现抑制和静默

通过抑制规则和临时静默减少告警噪音。

**抑制规则**（压制依赖告警）：

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

**以编程方式创建静默**：

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

**预期结果：** 抑制规则自动减少级联告警，静默在计划维护期间防止通知。

**失败处理：**
- 用实时告警测试抑制逻辑
- 检查 Alertmanager UI 的"Silences"标签
- 验证静默匹配器是精确的（标签必须完全匹配）

### 第 6 步：与外部系统集成

将 Alertmanager 连接到 PagerDuty、Opsgenie、Jira 等。

**PagerDuty 集成**（摘录）：

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

**自定义集成的 Webhook**：

```yaml
receivers:
  - name: 'webhook-custom'
    webhook_configs:
      - url: 'https://your-webhook-endpoint.com/alerts'
        send_resolved: true
```

**预期结果：** 告警在 PagerDuty 中创建事故，出现在团队通信渠道中，触发值班升级。

**失败处理：**
- 验证 API 密钥/令牌有效
- 检查到外部服务的网络连接
- 用 curl 独立测试 webhook 端点
- 启用调试模式：`--log.level=debug`

## 验证清单

- [ ] Alertmanager 成功接收来自 Prometheus 的告警
- [ ] 告警根据标签和严重程度路由到正确团队
- [ ] 通知成功投递到 Slack、邮件或 PagerDuty
- [ ] 告警分组适当减少通知量
- [ ] 抑制规则正确压制依赖告警
- [ ] 静默在维护窗口期间防止通知
- [ ] 通知模板包含运行手册链接和上下文
- [ ] 重复间隔防止长期运行问题的告警疲劳
- [ ] 告警消除时发送恢复通知
- [ ] 外部集成（PagerDuty、Opsgenie）创建事故

## 常见问题

- **告警疲劳**：过多低优先级告警导致响应人员忽视关键告警。设置严格阈值，使用抑制规则。
- **缺少 `for` 持续时间**：没有 `for` 的告警在短暂峰值时触发。始终使用 5-10 分钟窗口。
- **过于宽泛的分组**：按 `['...']` 分组会发送单独通知。使用特定标签分组。
- **没有运行手册链接**：没有运行手册的告警让响应人员无从下手。每个告警都需要运行手册 URL。
- **严重程度错误**：将 warning 标记为 critical 会使团队麻木。critical 仅用于紧急情况。
- **忘记的静默**：没有到期时间的静默可能隐藏真实问题。始终设置结束时间。
- **单一路由**：所有告警发到一个渠道会丢失上下文。使用团队特定路由。
- **没有抑制规则**：中断期间的级联告警产生噪音。实现抑制规则。

## 相关技能

- `setup-prometheus-monitoring` - 定义为告警规则提供数据的指标和记录规则
- `define-slo-sli-sla` - 为错误预算管理生成 SLO 燃烧率告警
- `write-incident-runbook` - 创建从告警注解链接的运行手册
- `build-grafana-dashboards` - 可视化告警触发历史和静默模式
