---
name: setup-prometheus-monitoring
description: >
  Prometheusを設定して時系列メトリクスを収集する。スクレイプ設定、サービスディスカバリ、
  記録ルール、マルチクラスタ展開のフェデレーションパターンを含む。マイクロサービスの
  集中メトリクス収集、アプリケーションとインフラのモニタリング基盤構築、SLO/SLI追跡の
  確立、レガシー監視システムからの移行などに使用する。
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
  tags: prometheus, monitoring, metrics, scrape, recording-rules
---

# Setup Prometheus Monitoring

スクレイプターゲット、記録ルール、フェデレーションを備えた本番対応Prometheusデプロイメントを設定する。

## 使用タイミング

- マイクロサービスや分散システムの集中メトリクス収集を設定する場合
- アプリケーションとインフラのメトリクスに対する時系列モニタリングを実装する場合
- SLO/SLI追跡とアラートの基盤を確立する場合
- フェデレーション経由で複数のPrometheusインスタンスからメトリクスを統合する場合
- レガシー監視ソリューションからモダンなオブザーバビリティスタックへ移行する場合

## 入力

- **必須**: スクレイプターゲットのリスト（サービス、エクスポーター、エンドポイント）
- **必須**: 保持期間とストレージ要件
- **任意**: 既存のサービスディスカバリ機構（Kubernetes、Consul、EC2）
- **任意**: 事前集計メトリクスの記録ルール
- **任意**: マルチクラスタ構成のフェデレーション階層

## 手順

### ステップ1: Prometheusのインストールと設定

グローバル設定とスクレイプインターバルを含むベースのPrometheus設定を作成する。

```bash
# Prometheusディレクトリ構造を作成
mkdir -p /etc/prometheus/{rules,file_sd}
mkdir -p /var/lib/prometheus

# Prometheusのダウンロード（バージョンは必要に応じて調整）
cd /tmp
wget https://github.com/prometheus/prometheus/releases/download/v2.48.0/prometheus-2.48.0.linux-amd64.tar.gz
tar xvf prometheus-2.48.0.linux-amd64.tar.gz
sudo cp prometheus-2.48.0.linux-amd64/{prometheus,promtool} /usr/local/bin/
```

`/etc/prometheus/prometheus.yml` を作成する:

```yaml
global:
  scrape_interval: 15s
  scrape_timeout: 10s
  evaluation_interval: 15s
  external_labels:
    cluster: 'production'
    region: 'us-east-1'

# Alertmanagerの設定
alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - localhost:9093

# 記録ルールとアラートルールの読み込み
rule_files:
  - "rules/*.yml"

# スクレイプ設定
scrape_configs:
  # Prometheus自己モニタリング
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
        labels:
          env: 'production'

  # ホストメトリクス用ノードエクスポーター
  - job_name: 'node'
    static_configs:
      - targets:
          - 'node1:9100'
          - 'node2:9100'
        labels:
          env: 'production'

  # ファイルベースのサービスディスカバリによるアプリメトリクス
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

**期待結果：** PrometheusがWebUI（`http://localhost:9090`）でアクセス可能となり、ターゲットがStatus > Targetsに一覧表示される。

**失敗時：**
- `promtool check config /etc/prometheus/prometheus.yml` で構文を確認する
- ファイルパーミッションを確認: `sudo chown -R prometheus:prometheus /etc/prometheus /var/lib/prometheus`
- ログを確認: `journalctl -u prometheus -f`

### ステップ2: サービスディスカバリの設定

手動でターゲットを管理しなくて済むよう、動的なターゲットディスカバリを設定する。

**Kubernetes**環境の場合、`scrape_configs`に追加する:

```yaml
  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      # prometheus.io/scrapeアノテーションがあるポッドのみスクレイプ
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
      # 指定されている場合はカスタムポートを使用
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_port]
        action: replace
        target_label: __address__
        regex: ([^:]+)(?::\d+)?;(\d+)
        replacement: $1:$2
      # ネームスペースをラベルとして追加
      - source_labels: [__meta_kubernetes_namespace]
        target_label: kubernetes_namespace
      # ポッド名をラベルとして追加
      - source_labels: [__meta_kubernetes_pod_name]
        target_label: kubernetes_pod_name
```

**ファイルベース**のサービスディスカバリの場合、`/etc/prometheus/file_sd/services.json`を作成:

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

**Consul**サービスディスカバリの場合:

```yaml
  - job_name: 'consul-services'
    consul_sd_configs:
      - server: 'consul.example.com:8500'
        services: []  # 空リストはすべてのサービスを対象にする
    relabel_configs:
      - source_labels: [__meta_consul_service]
        target_label: job
      - source_labels: [__meta_consul_tags]
        regex: '.*,monitoring,.*'
        action: keep
```

**期待結果：** PrometheusのUIに動的ターゲットが表示され、サービスのスケールや変更に合わせて自動更新される。

**失敗時：**
- Kubernetes: `kubectl auth can-i list pods --as=system:serviceaccount:monitoring:prometheus` でRBACパーミッションを確認する
- ファイルSD: `python -m json.tool /etc/prometheus/file_sd/services.json` でJSON構文を検証する
- Consul: `curl http://consul.example.com:8500/v1/catalog/services` で接続性をテストする

### ステップ3: 記録ルールの作成

ダッシュボードのパフォーマンスとアラート効率のために、高コストなクエリを事前集計する。

`/etc/prometheus/rules/recording_rules.yml` を作成する:

```yaml
groups:
  - name: api_aggregations
    interval: 30s
    rules:
      # エンドポイントごとのリクエストレートを計算（5分ウィンドウ）
      - record: job:http_requests:rate5m
        expr: |
          sum by (job, endpoint, method) (
            rate(http_requests_total[5m])
          )

      # エラーレートの割合を計算
      - record: job:http_errors:rate5m
        expr: |
          sum by (job) (
            rate(http_requests_total{status=~"5.."}[5m])
          ) / sum by (job) (
            rate(http_requests_total[5m])
          ) * 100

      # エンドポイントごとのP95レイテンシ
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
      # インスタンスごとのCPU使用率
      - record: instance:cpu_usage:ratio
        expr: |
          1 - avg by (instance) (
            rate(node_cpu_seconds_total{mode="idle"}[5m])
          )

      # メモリ使用率
      - record: instance:memory_usage:ratio
        expr: |
          1 - (
            node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes
          )

      # マウントポイントごとのディスク使用率
      - record: instance:disk_usage:ratio
        expr: |
          1 - (
            node_filesystem_avail_bytes{fstype!~"tmpfs|fuse.*"}
            / node_filesystem_size_bytes{fstype!~"tmpfs|fuse.*"}
          )
```

検証とリロード:

```bash
# ルール構文を検証
promtool check rules /etc/prometheus/rules/recording_rules.yml

# Prometheus設定をリロード（再起動なし）
curl -X POST http://localhost:9090/-/reload

# またはSIGHUPシグナルを送信
sudo killall -HUP prometheus
```

**期待結果：** 記録ルールが正常に評価され、`job:`プレフィックスの新しいメトリクスがPrometheusに表示され、ダッシュボードのクエリパフォーマンスが向上する。

**失敗時：**
- `promtool check rules` でルール構文を確認する
- 評価インターバルがデータの可用性と一致しているか確認する
- 欠落しているソースメトリクスを確認: `curl http://localhost:9090/api/v1/targets`
- 評価エラーのログを確認: `journalctl -u prometheus | grep -i error`

### ステップ4: ストレージと保持期間の設定

保持要件とクエリパフォーマンスのためにストレージを最適化する。

`/etc/systemd/system/prometheus.service` を編集する:

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

主なストレージフラグ:
- `--storage.tsdb.retention.time=30d`: データを30日間保持
- `--storage.tsdb.retention.size=50GB`: ストレージを50GBに制限（先に達した方の制限が適用）
- `--storage.tsdb.wal-compression`: WAL圧縮を有効化（ディスクI/Oを削減）
- `--web.enable-lifecycle`: HTTP POSTによる設定リロードを許可
- `--web.enable-admin-api`: スナップショットと削除APIを有効化

有効化して起動:

```bash
sudo systemctl daemon-reload
sudo systemctl enable prometheus
sudo systemctl start prometheus
sudo systemctl status prometheus
```

**期待結果：** Prometheusがポリシーに従ってメトリクスを保持し、ディスク使用量が制限内に収まり、古いデータが自動的に削除される。

**失敗時：**
- ディスク使用量を監視: `du -sh /var/lib/prometheus`
- TSDBの統計を確認: `curl http://localhost:9090/api/v1/status/tsdb`
- 保持設定を確認: `curl http://localhost:9090/api/v1/status/runtimeinfo | jq .data.storageRetention`
- 強制クリーンアップ: `curl -X POST http://localhost:9090/api/v1/admin/tsdb/delete_series?match[]={__name__=~".+"}`

### ステップ5: フェデレーションの設定（マルチクラスタ）

クラスタ間でメトリクスを集計するための階層型Prometheusを設定する。

**エッジPrometheus**インスタンス（各クラスタ内）で外部ラベルが設定されていることを確認:

```yaml
global:
  external_labels:
    cluster: 'production-east'
    datacenter: 'us-east-1'
```

**中央Prometheus**インスタンスにフェデレーションスクレイプ設定を追加:

```yaml
scrape_configs:
  - job_name: 'federate-production'
    honor_labels: true
    metrics_path: '/federate'
    params:
      'match[]':
        # 事前計算された記録ルールのみを集計
        - '{__name__=~"job:.*"}'
        # アラート状態を含める
        - '{__name__=~"ALERTS.*"}'
        # 重要なインフラメトリクスを含める
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

フェデレーションのベストプラクティス:
- `honor_labels: true` を使用して元のラベルを保持する
- 記録ルールと集計のみをフェデレートする（生のメトリクスではなく）
- 適切なスクレイプインターバルを設定する（エッジPrometheusの評価より長く）
- `match[]` を使用してメトリクスをフィルタリングする（すべてをフェデレートしない）

**期待結果：** 中央Prometheusが全クラスタのフェデレートされたメトリクスを表示し、クエリが複数のリージョンにまたがり、データの重複が最小化される。

**失敗時：**
- フェデレーションエンドポイントのアクセシビリティを確認: `curl http://prometheus-east.example.com:9090/federate?match[]={__name__=~"job:.*"} | head -20`
- ラベルの競合を確認（中央 vs エッジの外部ラベル）
- フェデレーションの遅延を監視: タイムスタンプの差異を比較
- マッチパターンを確認: `curl http://localhost:9090/api/v1/label/__name__/values | jq .data | grep "job:"`

### ステップ6: 高可用性の実装（任意）

フェイルオーバーのために同一設定の冗長Prometheusインスタンスをデプロイする。

**Thanos**または**Cortex**を使用した真のHA、または単純な負荷分散構成:

```yaml
# prometheus-1.yml と prometheus-2.yml（同一設定）
global:
  scrape_interval: 15s
  external_labels:
    prometheus: 'prometheus-1'  # インスタンスごとに異なる
    replica: 'A'

# 各インスタンスに --web.external-url フラグを使用
# prometheus-1: --web.external-url=http://prometheus-1.example.com:9090
# prometheus-2: --web.external-url=http://prometheus-2.example.com:9090
```

Grafanaを設定して両方のインスタンスにクエリする:

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

HAProxyまたはnginxで負荷分散する:

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

**期待結果：** クエリリクエストがインスタンス間で分散され、1つのインスタンスがダウンしても自動フェイルオーバーし、単一インスタンスの障害時にデータ損失が発生しない。

**失敗時：**
- 両インスタンスが同じターゲットをスクレイプしていることを確認する（わずかな時刻のずれは許容可能）
- インスタンス間の設定のずれを確認する
- クエリでの重複排除を監視する（Grafanaが重複シリーズを表示）
- ロードバランサーのヘルスチェックを確認する

## バリデーション

- [ ] PrometheusのWebUIが期待するエンドポイントでアクセス可能
- [ ] 設定されたすべてのスクレイプターゲットがStatus > TargetsでUPと表示されている
- [ ] サービスディスカバリが期待通りに動的にターゲットを追加・削除している
- [ ] 記録ルールが正常に評価されている（ログにエラーなし）
- [ ] 設定された時間/サイズ制限に従ってメトリクスが保持されている
- [ ] フェデレーション（設定されている場合）がエッジインスタンスからメトリクスを取得している
- [ ] クエリが期待するメトリクスのカーディナリティを返している（過剰でない）
- [ ] ディスク使用量が安定しており、割り当てられたストレージバジェット内に収まっている
- [ ] HTTPエンドポイントまたはSIGHUPによる設定リロードが機能している
- [ ] Prometheusの自己モニタリングメトリクスが利用可能（up、スクレイプ所要時間など）

## よくある落とし穴

- **高カーディナリティなメトリクス**: 無制限の値（ユーザーID、タイムスタンプ、UUID）を持つラベルを避ける。ストレージ前に記録ルールを使用して集計する。
- **スクレイプインターバルの不一致**: 記録ルールはスクレイプインターバル以上の間隔で評価する必要があり、ギャップを避けるため。
- **フェデレーションの過負荷**: すべてのメトリクスをフェデレートすると大量のデータ重複が発生する。集計された記録ルールのみをフェデレートする。
- **リラベル設定の欠如**: 適切なリラベルがないと、サービスディスカバリが混乱したラベルや重複ラベルを作成する可能性がある。
- **保持期間が短すぎる**: 最長のダッシュボード時間ウィンドウより長い保持期間を設定し、「データなし」のギャップを避ける。
- **リソース制限なし**: 高カーディナリティなメトリクスはPrometheusの過剰なメモリ消費につながる可能性がある。`--storage.tsdb.max-block-duration`を設定し、ヒープ使用量を監視する。
- **ライフサイクルエンドポイントの無効化**: `--web.enable-lifecycle`がないと、設定のリロードは完全な再起動が必要となり、スクレイプのギャップが生じる。

## 関連スキル

- `configure-alerting-rules` - Prometheusメトリクスに基づいてAlertmanagerへのアラートルールを定義する
- `build-grafana-dashboards` - GrafanaダッシュボードとパネルでPrometheusメトリクスを可視化する
- `define-slo-sli-sla` - Prometheusの記録ルールとエラーバジェット追跡を使用してSLO/SLIターゲットを確立する
- `instrument-distributed-tracing` - より深いオブザーバビリティのために分散トレーシングでメトリクスを補完する
