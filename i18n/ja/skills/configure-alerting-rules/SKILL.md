---
name: configure-alerting-rules
description: >
  アクション可能なインシデントアラートのために、ルーティングツリー、レシーバー
  （Slack、PagerDuty、メール）、インヒビションルール、サイレンス、通知テンプレートを
  含むPrometheus Alertmanagerを設定する。自動インシデント検出のプロアクティブな
  モニタリングを実装する場合、重大度に基づいて適切なチームにアラートをルーティングする場合、
  グルーピングと重複排除によるアラート疲れを軽減する場合、PagerDutyなどのオンコール
  システムと統合する場合、またはレガシーアラートからPrometheusベースのアラートに
  移行する場合に使用する。
locale: ja
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

# アラートルールの設定

信頼性が高くアクション可能なインシデント通知のために、Prometheusのアラートルールと Alertmanagerをセットアップする。

> 完全な設定ファイルとテンプレートは[拡張例](references/EXAMPLES.md)を参照。

## 使用タイミング

- 自動インシデント検出のプロアクティブなモニタリングを実装する場合
- 重大度とサービスオーナーシップに基づいて適切なチームにアラートをルーティングする場合
- インテリジェントなグルーピングと重複排除によるアラート疲れを軽減する場合
- モニタリングをオンコールシステム（PagerDuty、Opsgenie）と統合する場合
- 重大な本番問題のためのエスカレーションポリシーを確立する場合
- レガシーモニタリングシステムからPrometheusベースのアラートに移行する場合
- 対応者を解決策に導くアクション可能なアラートを作成する場合

## 入力

- **必須**: アラート対象のPrometheusメトリクス（エラーレート、レイテンシ、飽和度）
- **必須**: オンコールローテーションとエスカレーションポリシー
- **任意**: 移行する既存のアラート定義
- **任意**: 通知チャンネル（Slack、メール、PagerDuty）
- **任意**: 一般的なアラートのためのランブックドキュメント

## 手順

### ステップ1: Alertmanagerのデプロイ

AlertmanagerをインストールしてPrometheusからアラートを受信するよう設定する。

**Docker Composeデプロイ**（基本構造）：

```yaml
version: '3.8'
services:
  alertmanager:
    image: prom/alertmanager:v0.26.0
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager.yml:/etc/alertmanager/alertmanager.yml
    # ... (完全な設定はEXAMPLES.mdを参照)
```

**基本的なAlertmanager設定**（`alertmanager.yml`の抜粋）：

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

# ... (完全なルーティング、インヒビションルール、レシーバーはEXAMPLES.mdを参照)
```

**AlertmanagerをPrometheusに設定**（`prometheus.yml`）：

```yaml
alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093
      timeout: 10s
      api_version: v2
```

**期待結果：** AlertmanagerのUIが`http://localhost:9093`でアクセス可能で、Prometheusの「Status > Alertmanagers」がUPステータスを表示する。

**失敗時：**
- Alertmanagerのログを確認する: `docker logs alertmanager`
- PrometheusがAlertmanagerに到達できることを確認する: `curl http://alertmanager:9093/api/v2/status`
- WebhookのURLをテストする: `curl -X POST <SLACK_WEBHOOK_URL> -d '{"text":"test"}'`
- YAML構文を検証する: `amtool check-config alertmanager.yml`

### ステップ2: Prometheusでアラートルールを定義する

条件が満たされたときに発火するアラートルールを作成する。

**アラートルールファイルを作成**（`/etc/prometheus/rules/alerts.yml`の抜粋）：

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
          # ... (完全なアラートはEXAMPLES.mdを参照)
```

**アラート設計のベストプラクティス**：

- **`for`の時間**: フラッピングアラートを防ぐ。ほとんどのアラートには5〜10分を使用する。
- **説明的なアノテーション**: 現在の値、影響を受けるリソース、ランブックリンクを含める。
- **重大度レベル**: critical（オンコールをページング）、warning（調査）、info（FYI）
- **チームラベル**: 正しいチーム/チャンネルへのルーティングを可能にする
- **ランブックリンク**: すべてのアラートにランブックのURLが必要

ルールをPrometheusに読み込む：

```yaml
# prometheus.yml
rule_files:
  - "rules/*.yml"
```

検証とリロード：

```bash
promtool check rules /etc/prometheus/rules/alerts.yml
curl -X POST http://localhost:9090/-/reload
```

**期待結果：** アラートがPrometheusの「Alerts」ページに表示され、しきい値を超えたときにアラートが発火し、Alertmanagerが発火したアラートを受信する。

**失敗時：**
- ルール評価エラーのためにPrometheusのログを確認する
- `promtool check rules`でルール構文を確認する
- PrometheusのUIでアラートクエリを独立してテストする
- アラートの状態遷移を確認する：Inactive → Pending → Firing

### ステップ3: 通知テンプレートを作成する

読みやすくアクション可能な通知メッセージを設計する。

**テンプレートファイルを作成**（`/etc/alertmanager/templates/default.tmpl`の抜粋）：

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

# ... (完全なメールとPagerDutyのテンプレートはEXAMPLES.mdを参照)
```

**レシーバーでテンプレートを使用**：

```yaml
receivers:
  - name: 'slack-custom'
    slack_configs:
      - channel: '#alerts'
        title: '{{ template "slack.default.title" . }}'
        text: '{{ template "slack.default.text" . }}'
```

**期待結果：** 通知が一貫してフォーマットされ、すべての関連コンテキストを含み、ランブックリンクによりアクション可能。

**失敗時：**
- テンプレートのレンダリングをテストする: `amtool template test --config.file=alertmanager.yml`
- Alertmanagerのログのテンプレート構文エラーを確認する
- テンプレートのデータ構造をデバッグするために`{{ . | json }}`を使用する

### ステップ4: ルーティングとグルーピングの設定

インテリジェントなルーティングルールでアラートの配信を最適化する。

**高度なルーティング設定**（抜粋）：

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

# ... (時間間隔付きの完全なルーティングはEXAMPLES.mdを参照)
```

**グルーピング戦略**：

```yaml
# Group by alertname: All HighCPU alerts bundled together
group_by: ['alertname']

# Group by alertname AND cluster: Separate notifications per cluster
group_by: ['alertname', 'cluster']
```

**期待結果：** アラートが正しいチームにルーティングされ、論理的にグループ化され、重大度に適切なタイミング。

**失敗時：**
- ルーティングをテストする: `amtool config routes test --config.file=alertmanager.yml --alertname=HighCPU --label=severity=critical`
- ルーティングツリーを確認する: `amtool config routes show --config.file=alertmanager.yml`
- アラートが複数のルートにマッチすべき場合は`continue: true`を確認する

### ステップ5: インヒビションとサイレンシングの実装

インヒビションルールと一時的なサイレンスでアラートノイズを削減する。

**インヒビションルール**（依存アラートを抑制）：

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

# ... (その他のインヒビションパターンはEXAMPLES.mdを参照)
```

**サイレンスをプログラムで作成**：

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

**期待結果：** インヒビションがカスケードアラートを自動的に削減し、計画メンテナンス中はサイレンスが通知を防ぐ。

**失敗時：**
- ライブアラートでインヒビションロジックをテストする
- AlertmanagerのUIの「Silences」タブを確認する
- サイレンスマッチャーが正確であることを確認する（ラベルは完全に一致しなければならない）

### ステップ6: 外部システムとの統合

AlertmanagerをPagerDuty、Opsgenie、Jiraなどに接続する。

**PagerDuty統合**（抜粋）：

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
        # ... (完全な統合例はEXAMPLES.mdを参照)
```

**カスタム統合のためのWebhook**：

```yaml
receivers:
  - name: 'webhook-custom'
    webhook_configs:
      - url: 'https://your-webhook-endpoint.com/alerts'
        send_resolved: true
```

**期待結果：** アラートがPagerDutyでインシデントを作成し、チームのコミュニケーションチャンネルに表示され、オンコールのエスカレーションをトリガーする。

**失敗時：**
- APIキー/トークンが有効であることを確認する
- 外部サービスへのネットワーク接続を確認する
- curlでWebhookエンドポイントを独立してテストする
- デバッグモードを有効にする: `--log.level=debug`

## バリデーション

- [ ] AlertmanagerがPrometheusからアラートを正常に受信する
- [ ] アラートがラベルと重大度に基づいて正しいチームにルーティングされる
- [ ] Slack、メール、またはPagerDutyに通知が配信される
- [ ] アラートのグルーピングが通知量を適切に削減する
- [ ] インヒビションルールが依存アラートを正しく抑制する
- [ ] サイレンスがメンテナンスウィンドウ中に通知を防ぐ
- [ ] 通知テンプレートにランブックリンクとコンテキストが含まれている
- [ ] 繰り返し間隔が長時間続く問題のアラート疲れを防ぐ
- [ ] アラートが解消されたときに解決通知が送信される
- [ ] 外部統合（PagerDuty、Opsgenie）がインシデントを作成する

## よくある落とし穴

- **アラート疲れ**: 優先度の低いアラートが多すぎると、対応者が重要なアラートを無視するようになる。厳格なしきい値を設定し、インヒビションを使用する。
- **`for`の時間がない**: `for`なしのアラートは一時的なスパイクで発火する。常に5〜10分のウィンドウを使用する。
- **過度に広いグルーピング**: `['...']`によるグルーピングは個別の通知を送信する。特定のラベルグルーピングを使用する。
- **ランブックリンクなし**: ランブックのないアラートは対応者を推測に任せる。すべてのアラートにランブックのURLが必要。
- **不正な重大度**: 警告をcriticalとして誤ってラベル付けするとチームの感覚が鈍くなる。criticalは緊急事態のために予約する。
- **忘れられたサイレンス**: 期限のないサイレンスは本物の問題を隠す可能性がある。常に終了時間を設定する。
- **単一ルート**: すべてのアラートを1つのチャンネルに送るとコンテキストが失われる。チーム固有のルーティングを使用する。
- **インヒビションなし**: 停止中のカスケードアラートがノイズを生む。インヒビションルールを実装する。

## 関連スキル

- `setup-prometheus-monitoring` - アラートルールにフィードするメトリクスと記録ルールを定義する
- `define-slo-sli-sla` - エラーバジェット管理のためにSLOバーンレートアラートを生成する
- `write-incident-runbook` - アラートアノテーションからリンクされるランブックを作成する
- `build-grafana-dashboards` - アラート発火履歴とサイレンスパターンを可視化する
