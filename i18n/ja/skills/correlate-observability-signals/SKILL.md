---
name: correlate-observability-signals
description: >
  一貫したデバッグのためにメトリクス、ログ、トレースを統合する。ログからトレースへの
  リンク用のエグザンプラーを実装し、RED/USEメソッドを使用した統合ダッシュボードを
  構築し、オブザーバビリティシグナル間の迅速な根本原因分析を実現する。複数システムに
  またがる複雑なインシデント調査時、平均修復時間の短縮時、分散トレーシングの実装時、
  サイロ化されたツールから統合オブザーバビリティプラットフォームへの移行時に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: observability
  complexity: advanced
  language: multi
  tags: correlation, exemplars, red-method, use-method, unified-observability
  locale: ja
  source_locale: en
  source_commit: a87e5e0380bbe51f65cb0662d60c10030a81f255
  translator: claude
  translation_date: "2026-03-17"
---

# オブザーバビリティシグナルの相関

オブザーバビリティの三本柱にわたって、メトリクス、ログ、トレースを統合デバッグ用に接続する。

## 使用タイミング

- 複数システムにまたがる複雑なインシデントの調査時
- MTTR（平均修復時間）の短縮時
- 統合オブザーバビリティダッシュボードの構築時
- 分散トレーシングの実装時
- サイロ化されたツールから統合オブザーバビリティへの移行時

## 入力

- **必須**: Prometheus（メトリクス）
- **必須**: ログ集約システム（Loki、Elasticsearch、CloudWatch）
- **必須**: 分散トレーシングバックエンド（Tempo、Jaeger、Zipkin）
- **任意**: 統合可視化用のGrafana
- **任意**: OpenTelemetryインストルメンテーション

## 手順

> 完全な設定ファイルとテンプレートについては[拡張例](references/EXAMPLES.md)を参照。

### ステップ1: トレースコンテキスト伝播の実装

OpenTelemetryを使用してすべてのログとメトリクスにトレースIDを追加する:

```go
// Go example: Propagate trace context to logs
package main

import (
    "context"
    "log"

    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/trace"
)

func handleRequest(ctx context.Context, userID string) {
    // Extract trace context
    span := trace.SpanFromContext(ctx)
    traceID := span.SpanContext().TraceID().String()

    // Include trace ID in structured logs
    log.Printf("trace_id=%s user_id=%s action=process_request", traceID, userID)

    // Business logic here
    processData(ctx, userID)
}

func processData(ctx context.Context, userID string) {
    tracer := otel.Tracer("my-service")
    ctx, span := tracer.Start(ctx, "processData")
    defer span.End()

    traceID := span.SpanContext().TraceID().String()
    log.Printf("trace_id=%s user_id=%s action=process_data", traceID, userID)

    // More work
}
```

Pythonの例:

```python
# Python: Flask with OpenTelemetry
from flask import Flask, request
from opentelemetry import trace
from opentelemetry.instrumentation.flask import FlaskInstrumentor
import logging

app = Flask(__name__)
FlaskInstrumentor().instrument_app(app)

logging.basicConfig(
    format='%(asctime)s trace_id=%(otelTraceID)s span_id=%(otelSpanID)s %(message)s',
    level=logging.INFO
)

@app.route('/api/users/<user_id>')
def get_user(user_id):
    span = trace.get_current_span()
    trace_id = format(span.get_span_context().trace_id, '032x')

    logging.info(f"Fetching user {user_id}", extra={
        'otelTraceID': trace_id,
        'otelSpanID': format(span.get_span_context().span_id, '016x')
    })

    # Business logic
    return {"user_id": user_id}
```

**期待結果:** すべてのログに`trace_id`フィールドが含まれ、ログからトレースへの相関が可能になる。

**失敗時:** トレースIDが欠落している場合、OpenTelemetry SDKの初期化とコンテキスト伝播を確認する。

### ステップ2: Prometheusでのエグザンプラー設定

エグザンプラーはメトリクスをトレースにリンクする:

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  # Enable exemplar storage
  exemplars:
    max_exemplars: 100000  # Per TSDB block

scrape_configs:
  - job_name: 'api-service'
    static_configs:
      - targets: ['api-service:8080']
    # Scrape exemplars
    metric_relabel_configs:
      - source_labels: [__name__]
        regex: 'http_request_duration_seconds.*'
        action: keep
```

エグザンプラーを発行するようにアプリケーションをインストルメント:

```go
// Go: Emit exemplars with Prometheus histogram
package main

import (
    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promauto"
    "go.opentelemetry.io/otel/trace"
)

var httpDuration = promauto.NewHistogramVec(
    prometheus.HistogramOpts{
        Name:    "http_request_duration_seconds",
        Help:    "HTTP request duration",
        Buckets: prometheus.DefBuckets,
    },
    []string{"method", "endpoint", "status"},
)

func recordRequest(ctx context.Context, method, endpoint, status string, duration float64) {
    // Get trace ID for exemplar
    span := trace.SpanFromContext(ctx)
    traceID := span.SpanContext().TraceID().String()

    // Record metric with exemplar
    observer := httpDuration.WithLabelValues(method, endpoint, status)
    observer.(prometheus.ExemplarObserver).ObserveWithExemplar(
        duration,
        prometheus.Labels{"trace_id": traceID},
    )
}
```

Prometheusでエグザンプラーをクエリする:

```promql
# Histogram with exemplars
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

Grafanaでは、エグザンプラーがヒストグラムグラフ上にドットとして表示され、トレースにリンクする。

**期待結果:** Grafanaのメトリクスグラフにエグザンプラーが表示され、クリックすると対応するトレースが開く。

**失敗時:** Prometheusバージョンが2.26以上（エグザンプラーサポート）であることを確認し、Grafanaデータソース設定でエグザンプラーが有効になっているか確認する。

### ステップ3: REDメソッドによる統合ダッシュボードの構築

REDメソッド: Rate（レート）、Errors（エラー）、Duration（期間）（サービス向け）

```json
{
  "dashboard": {
    "title": "API Service - RED Dashboard",
    "panels": [
      {
        "title": "Request Rate (req/s)",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total{job=\"api-service\"}[5m])) by (endpoint)",
            "legendFormat": "{{ endpoint }}"
          }
        ],
        "exemplars": true
      },
      {
        "title": "Error Rate (%)",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total{job=\"api-service\", status=~\"5..\"}[5m])) / sum(rate(http_requests_total{job=\"api-service\"}[5m])) * 100",
            "legendFormat": "Error %"
          }
        ],
        "exemplars": true
      },
      {
        "title": "Request Duration (p50, p95, p99)",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.50, rate(http_request_duration_seconds_bucket{job=\"api-service\"}[5m]))",
            "legendFormat": "p50"
          },
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job=\"api-service\"}[5m]))",
            "legendFormat": "p95"
          },
          {
            "expr": "histogram_quantile(0.99, rate(http_request_duration_seconds_bucket{job=\"api-service\"}[5m]))",
            "legendFormat": "p99"
          }
        ],
        "exemplars": true
      },
      {
        "title": "Correlated Logs",
        "type": "logs",
        "datasource": "Loki",
        "targets": [
          {
            "expr": "{job=\"api-service\"} |= \"error\""
          }
        ],
        "options": {
          "showTime": true,
          "enableLogDetails": true
        }
      }
    ]
  }
}
```

**期待結果:** レート、エラー、期間+相関ログを表示する単一ダッシュボード。

**失敗時:** パネルが「No Data」を表示する場合、メトリクス名がインストルメンテーションと一致しているか確認する。

### ステップ4: リソース用のUSEメソッドの実装

USEメソッド: Utilization（使用率）、Saturation（飽和度）、Errors（エラー）（CPU、メモリ、ディスクなどのリソース向け）

```json
{
  "dashboard": {
    "title": "Node Resources - USE Dashboard",
    "panels": [
      {
        "title": "CPU Utilization (%)",
        "type": "graph",
        "targets": [
          {
            "expr": "100 - (avg(rate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
            "legendFormat": "CPU Usage %"
          }
        ]
      },
      {
        "title": "CPU Saturation (Load Average)",
        "type": "graph",
        "targets": [
          {
            "expr": "node_load1",
            "legendFormat": "1min load"
          },
          {
            "expr": "node_load5",
            "legendFormat": "5min load"
          },
          {
            "expr": "count(node_cpu_seconds_total{mode=\"idle\"})",
            "legendFormat": "CPU cores (threshold)"
          }
        ]
      },
      {
        "title": "Memory Utilization (%)",
        "type": "graph",
        "targets": [
          {
            "expr": "(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100",
            "legendFormat": "Memory Usage %"
          }
        ]
      },
      {
        "title": "Memory Saturation (Page Faults)",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(node_vmstat_pgmajfault[5m])",
            "legendFormat": "Major page faults/s"
          }
        ]
      },
      {
        "title": "Disk Utilization (%)",
        "type": "graph",
        "targets": [
          {
            "expr": "(node_filesystem_size_bytes - node_filesystem_free_bytes) / node_filesystem_size_bytes * 100",
            "legendFormat": "{{ device }}"
          }
        ]
      },
      {
        "title": "Disk Saturation (IO Wait %)",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(node_cpu_seconds_total{mode=\"iowait\"}[5m]) * 100",
            "legendFormat": "IO Wait %"
          }
        ]
      }
    ]
  }
}
```

**期待結果:** すべてのUSEディメンションにわたるリソースの健全性を表示するダッシュボード。

**失敗時:** node_exporterが実行中でシステムメトリクスをスクレイピングしていることを確認する。

### ステップ5: Lokiでのログからトレースへのリンク

トレースIDを抽出するようにLokiを設定する:

```yaml
# loki-config.yml
schema_config:
  configs:
    - from: 2024-01-01
      store: boltdb-shipper
      object_store: s3
      schema: v11
      index:
        prefix: index_
        period: 24h

# Derived fields for trace linking
query_config:
  derived_fields:
    - name: TraceID
      source: trace_id
      url: 'https://tempo.company.com/trace/${__value.raw}'
      urlDisplayLabel: 'View Trace'
```

GrafanaでLokiデータソースを設定する:

```json
{
  "name": "Loki",
  "type": "loki",
  "url": "http://loki:3100",
  "jsonData": {
    "derivedFields": [
      {
        "datasourceUid": "tempo-uid",
        "matcherRegex": "trace_id=(\\w+)",
        "name": "TraceID",
        "url": "$${__value.raw}"
      }
    ]
  }
}
```

**期待結果:** LokiログのトレースIDをクリックするとTempoの対応するトレースが開く。

**失敗時:** 正規表現がログフォーマットに一致しているか確認し、TempoデータソースUIDを確認する。

### ステップ6: 統合インシデントビューの作成

すべてのシグナルをまとめるダッシュボードを構築する:

```json
{
  "dashboard": {
    "title": "Incident Investigation",
    "templating": {
      "list": [
        {
# ... (完全な設定はEXAMPLES.mdを参照)
```

インシデント中のワークフロー:

1. 高エラー率のアラートが発報
2. オンコールエンジニアがGrafanaダッシュボードを開く
3. 特定の時間帯のエラー率のスパイクを特定
4. 期間ヒストグラムのエグザンプラードットをクリック→トレースが開く
5. トレースが遅いデータベースクエリを表示
6. スパンの「View Logs」をクリック→そのトレースのログが開く
7. ログがタイムアウトの原因となっている特定のSQLクエリを明らかにする
8. 2分以内に根本原因を特定

**期待結果:** メトリクス/ログ/トレース間を行き来するデバッグ用の単一ペイン。

**失敗時:** リンクが機能しない場合、データソース設定とトレースID伝播を確認する。

## バリデーション

- [ ] すべてのアプリケーションログにトレースIDが含まれている
- [ ] Prometheusがエグザンプラーをスクレイピングしている
- [ ] Grafanaダッシュボードのヒストグラムにエグザンプラードットが表示される
- [ ] エグザンプラーをクリックするとTempo/Jaegerの対応するトレースが開く
- [ ] Lokiログに機能する「View Trace」リンクがある
- [ ] 主要サービスのREDダッシュボードが作成されている
- [ ] インフラストラクチャのUSEダッシュボードが作成されている
- [ ] 統合インシデントダッシュボードがGameDayでテスト済み

## よくある落とし穴

- **一貫性のないトレースIDフォーマット**: OpenTelemetryは32文字hex、Jaegerは16文字を使用。1つを選ぶ
- **コンテキスト伝播の欠落**: トレースIDがサービス間で流れない場合、分散トレーシングが壊れる。OpenTelemetryの自動インストルメンテーションを使用する
- **エグザンプラーの過負荷**: エグザンプラーが多すぎると（>100k）Prometheusが遅くなる可能性がある。高ボリュームメトリクスをサンプリングする
- **時計のズレ**: トレースは複数サービスにまたがる。NTPが設定されていることを確認する。クロックドリフトがトレースの順序の問題を引き起こす
- **データ保持期間の不一致**: トレースがメトリクスより先に期限切れになると相関が壊れる。保持ポリシーを揃える

## 関連スキル

- `setup-prometheus-monitoring` -- 相関のためのメトリクス基盤
- `configure-log-aggregation` -- 相関のためのログ基盤
- `instrument-distributed-tracing` -- 相関のためのトレース基盤
- `build-grafana-dashboards` -- 統合可視化レイヤー
