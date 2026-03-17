---
name: instrument-distributed-tracing
description: >
  自動・手動インストルメンテーション、コンテキスト伝播、サンプリング戦略、
  JaegerまたはTempoとの統合を含む、分散トレーシングのためにOpenTelemetryで
  アプリケーションをインストルメントする。分散システムのレイテンシ問題のデバッグ、
  マイクロサービス間のリクエストフローの把握、根本原因分析のためのトレースと
  ログ・メトリクスの相関、エンドツーエンドのレイテンシ測定、またはレガシーの
  トレーシングシステムからOpenTelemetryへの移行時に使用する。
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
  complexity: advanced
  language: multi
  tags: opentelemetry, tracing, jaeger, tempo, instrumentation
---

# 分散トレーシングのインストルメント

OpenTelemetryの分散トレーシングを実装して、マイクロサービス間のリクエストを追跡し、パフォーマンスのボトルネックを特定する。

## 使用タイミング

- 複数のサービスを持つ分散システムのレイテンシ問題をデバッグする場合
- マイクロサービス間のリクエストフローと依存関係を把握する場合
- トランザクション内の遅いデータベースクエリや外部API呼び出しを特定する場合
- 根本原因分析のためにトレースをログとメトリクスと相関させる場合
- ユーザーリクエストからレスポンスまでのエンドツーエンドのレイテンシを測定する場合
- レガシーのトレーシングシステム（Zipkin、Jaeger）からOpenTelemetryに移行する場合
- 詳細なレイテンシパーセンタイル追跡によるSLOコンプライアンスを確立する場合

## 入力

- **必須**: インストルメントするサービスのリスト（言語とフレームワーク）
- **必須**: トレーシングバックエンドの選択（Jaeger、Tempo、Zipkin、またはベンダーSaaS）
- **任意**: 既存のインストルメンテーションライブラリ（OpenTracing、Zipkin）
- **任意**: サンプリング戦略の要件（パーセンテージ、レート制限）
- **任意**: ビジネス固有のメタデータ用のカスタムスパン属性

## 手順

> 完全な設定ファイルとテンプレートは[拡張例](references/EXAMPLES.md)を参照。


### ステップ1: トレーシングバックエンドのセットアップ

JaegerまたはGrafana Tempoをデプロイしてトレースを受信・保存する。

**オプションA: Jaegerオールインワン**（開発/テスト）：

```yaml
# docker-compose.yml
version: '3.8'
services:
  jaeger:
    image: jaegertracing/all-in-one:1.51
    ports:
      - "5775:5775/udp"   # Zipkin compact thrift
      - "6831:6831/udp"   # Jaeger compact thrift
      - "6832:6832/udp"   # Jaeger binary thrift
      - "5778:5778"       # Serve configs
      - "16686:16686"     # Jaeger UI
      - "14268:14268"     # Jaeger HTTP thrift
      - "14250:14250"     # Jaeger GRPC
      - "9411:9411"       # Zipkin compatible endpoint
    environment:
      - COLLECTOR_ZIPKIN_HOST_PORT=:9411
      - COLLECTOR_OTLP_ENABLED=true
    restart: unless-stopped
```

**オプションB: Grafana Tempo**（本番、スケーラブル）：

```yaml
# docker-compose.yml
version: '3.8'
services:
  tempo:
    image: grafana/tempo:2.3.0
    command: ["-config.file=/etc/tempo.yaml"]
    volumes:
      - ./tempo.yaml:/etc/tempo.yaml
      - tempo-data:/tmp/tempo
    ports:
      - "3200:3200"   # Tempo HTTP
      - "4317:4317"   # OTLP gRPC
      - "4318:4318"   # OTLP HTTP
      - "9411:9411"   # Zipkin
    restart: unless-stopped

volumes:
  tempo-data:
```

**Tempo設定**（`tempo.yaml`）：

```yaml
server:
  http_listen_port: 3200

distributor:
  receivers:
    jaeger:
# ... (完全な設定はEXAMPLES.mdを参照)
```

**S3ストレージを使用した本番環境**：

```yaml
storage:
  trace:
    backend: s3
    s3:
      bucket: tempo-traces
      endpoint: s3.amazonaws.com
      region: us-east-1
    wal:
      path: /tmp/tempo/wal
    pool:
      max_workers: 100
      queue_depth: 10000
```

**期待結果：** トレーシングバックエンドがアクセス可能で、OTLPを介してトレースを受信する準備ができており、JaegerのUIまたはGrafanaが最初は「トレースなし」を表示する。

**失敗時：**
- ポートが使用中でないことを確認する: `netstat -tulpn | grep -E '(4317|16686|3200)'`
- コンテナのログを確認する: `docker logs jaeger`または`docker logs tempo`
- OTLPエンドポイントをテストする: `curl http://localhost:4318/v1/traces -v`
- Tempoの場合: `tempo -config.file=/etc/tempo.yaml -verify-config`で設定構文を検証する

### ステップ2: アプリケーションのインストルメント（自動インストルメンテーション）

コード変更を最小限に抑えるために、一般的なフレームワーク向けのOpenTelemetry自動インストルメンテーションを使用する。

**PythonとFlask**：

```bash
pip install opentelemetry-distro opentelemetry-exporter-otlp
opentelemetry-bootstrap -a install
```

```python
# app.py
from flask import Flask
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
# ... (完全な設定はEXAMPLES.mdを参照)
```

**GoとGinフレームワーク**：

```bash
go get go.opentelemetry.io/otel
go get go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc
go get go.opentelemetry.io/otel/sdk/trace
go get go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin
```

```go
package main

import (
    "context"
    "github.com/gin-gonic/gin"
    "go.opentelemetry.io/otel"
# ... (完全な設定はEXAMPLES.mdを参照)
```

**Node.jsとExpress**：

```bash
npm install @opentelemetry/api \
            @opentelemetry/sdk-node \
            @opentelemetry/auto-instrumentations-node \
            @opentelemetry/exporter-trace-otlp-grpc
```

```javascript
// tracing.js
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
# ... (完全な設定はEXAMPLES.mdを参照)
```

**期待結果：** インストルメントされたサービスからのトレースがJaegerのUIまたはGrafanaに表示され、HTTPリクエストが自動的にスパンを作成する。

**失敗時：**
- エクスポーターのエンドポイントがアプリケーションから到達可能であることを確認する
- 環境変数を確認する: `OTEL_EXPORTER_OTLP_ENDPOINT=http://tempo:4317`
- デバッグログを有効にする: `OTEL_LOG_LEVEL=debug`（Python）、`OTEL_LOG_LEVEL=DEBUG`（Node.js）
- 単純なスパンでテストする：手動でスパンを作成してエクスポートパイプラインを確認する
- OpenTelemetryパッケージ間のバージョン競合を確認する

### ステップ3: 手動インストルメンテーションの追加

ビジネスロジック、データベースクエリ、外部呼び出し用のカスタムスパンを作成する。

**Pythonの手動スパン**：

```python
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

def process_order(order_id):
    # Create a span for the entire operation
# ... (完全な設定はEXAMPLES.mdを参照)
```

**Goの手動スパン**：

```go
import (
    "context"
    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/attribute"
    "go.opentelemetry.io/otel/codes"
    "go.opentelemetry.io/otel/trace"
# ... (完全な設定はEXAMPLES.mdを参照)
```

**スパン属性のベストプラクティス**：
- セマンティック規約を使用する: `http.method`、`http.status_code`、`db.system`、`db.statement`
- ビジネスコンテキストを追加する: `user.id`、`order.id`、`product.category`
- リソース識別子を含める: `instance.id`、`region`、`availability_zone`
- エラーを記録する: `span.RecordError(err)`と`span.SetStatus(codes.Error, message)`
- 重要なマイルストーンにイベントを追加する: `span.AddEvent("cache_miss")`

**期待結果：** カスタムスパンがトレースビューに表示され、親子関係が正しく、属性がスパン詳細に表示され、エラーが強調表示される。

**失敗時：**
- コンテキスト伝播を確認する：親スパンのコンテキストが子に渡されること
- スパン名が説明的で命名規則に従っていることを確認する
- スパンが終了していることを確認する（GoでのGo `defer span.End()`、Pythonでの`with`ブロック）
- 属性タイプを確認する：文字列、int、bool、floatのみ
- セマンティック規約を検証する：該当する場合は標準的な属性名を使用する

### ステップ4: コンテキスト伝播の実装

サービス境界と非同期操作を越えてトレースコンテキストが流れることを確認する。

**HTTP headers伝播**（W3Cトレースコンテキスト）：

```python
# Client side (Python with requests)
import requests
from opentelemetry import trace
from opentelemetry.propagate import inject

tracer = trace.get_tracer(__name__)
# ... (完全な設定はEXAMPLES.mdを参照)
```

```go
// Server side (Go with Gin)
import (
    "go.opentelemetry.io/otel"
    "go.opentelemetry.io/otel/propagation"
)

# ... (完全な設定はEXAMPLES.mdを参照)
```

**メッセージキューの伝播**（Kafka）：

```python
# Producer
from opentelemetry.propagate import inject
from kafka import KafkaProducer

producer = KafkaProducer(bootstrap_servers=['kafka:9092'])

# ... (完全な設定はEXAMPLES.mdを参照)
```

```python
# Consumer
from opentelemetry.propagate import extract

def process_message(msg):
    # Extract trace context from Kafka headers
    headers = {k: v.decode('utf-8') for k, v in msg.headers}
    ctx = extract(headers)

    # Continue the trace
    with tracer.start_as_current_span("process_order_event", context=ctx):
        order_id = json.loads(msg.value)['order_id']
        handle_order(order_id)
```

**非同期操作**（Python asyncio）：

```python
import asyncio
from opentelemetry import trace, context

async def async_operation():
    # Capture current context
    token = context.attach(context.get_current())
    try:
        with tracer.start_as_current_span("async_database_query"):
            await asyncio.sleep(0.1)  # Simulated async work
            return "result"
    finally:
        context.detach(token)
```

**期待結果：** トレースが複数のサービスにまたがり、サービス境界を越えてトレースIDが一貫し、親子関係が保持される。

**失敗時：**
- W3Cトレースコンテキストプロパゲーターが設定されていることを確認する: `otel.propagation.set_global_textmap(TraceContextTextMapPropagator())`
- HTTPリクエストにヘッダーが渡されていることを確認する
- Kafkaの場合: ブローカーバージョンがヘッダーをサポートしていることを確認する（v0.11以上）
- ヘッダーインスペクションでデバッグする：`traceparent`ヘッダーの値をログに記録する
- トレースの可視化を使用して切断されたトレースリンクを特定する

### ステップ5: サンプリング戦略の設定

可視性を維持しながらトレース量とコストを削減するためにサンプリングを実装する。

**サンプリング戦略**：

```python
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.sampling import (
    ParentBased,
    TraceIdRatioBased,
    StaticSampler,
    Decision
# ... (完全な設定はEXAMPLES.mdを参照)
```

**Tempoを使用したテールベースサンプリング**：

`tempo.yaml`での設定：

```yaml
overrides:
  defaults:
    metrics_generator:
      processors: [service-graphs, span-metrics]
      storage:
        path: /tmp/tempo/generator/wal
        remote_write:
          - url: http://prometheus:9090/api/v1/write
            send_exemplars: true

    # Tail sampling (requires tempo-query)
    ingestion_rate_limit_bytes: 5000000
    ingestion_burst_size_bytes: 10000000
```

動的サンプリングには**Grafana TempoのTraceQL**を使用する：

```traceql
# Sample traces with errors
{ status = error }

# Sample slow traces (>1s)
{ duration > 1s }

# Sample specific services
{ resource.service.name = "checkout-service" }
```

**期待結果：** トレース量がターゲットのパーセンテージに削減され、エラートレースが常にサンプリングされ、サンプリング決定がトレースメタデータに表示される。

**失敗時：**
- サンプラーがトレーサープロバイダーの初期化前に適用されていることを確認する
- エクスポートされたスパンのサンプリング決定属性を確認する
- テールサンプリングの場合: 十分なバッファリングを確認する（`ingestion_burst_size_bytes`）
- ドロップされたトレースを監視する: `otel_traces_dropped_total`メトリクス
- サンプリングレートを検証するために合成的な高ボリュームトラフィックでテストする

### ステップ6: トレースをメトリクスとログに相関させる

統合された可観測性のためにトレースをメトリクスとログにリンクする。

**ログにトレースIDを追加する**（Python）：

```python
import logging
from opentelemetry import trace

# Custom log formatter with trace context
class TraceFormatter(logging.Formatter):
    def format(self, record):
# ... (完全な設定はEXAMPLES.mdを参照)
```

**トレースからメトリクスを生成する**（Tempo）：

```yaml
# tempo.yaml
metrics_generator:
  registry:
    external_labels:
      cluster: production
  storage:
# ... (完全な設定はEXAMPLES.mdを参照)
```

これにより以下のPrometheusメトリクスが生成される：
- `traces_service_graph_request_total` - サービス間のリクエスト数
- `traces_span_metrics_duration_seconds` - スパン時間のヒストグラム
- `traces_spanmetrics_calls_total` - スパンの呼び出し数

**メトリクスからトレースをクエリする**（Grafana）：

GrafanaのPrometheusデータソース設定にエグゼンプラーサポートを追加する：

```yaml
datasources:
  - name: Prometheus
    type: prometheus
    url: http://prometheus:9090
    jsonData:
      exemplarTraceIdDestinations:
        - name: trace_id
          datasourceName: Tempo
```

Grafanaダッシュボードでエグゼンプラーをenableにする：

```json
{
  "fieldConfig": {
    "defaults": {
      "custom": {
        "showExemplars": true
      }
    }
  }
}
```

**期待結果：** メトリクスエグゼンプラーをクリックするとトレースが開き、ログにトレースIDが表示され、トレースがログにリンクし、シグナル間での統合されたデバッグが実現する。

**失敗時：**
- Prometheusでエグゼンプラーサポートが有効であることを確認する（v2.26以上が必要）
- トレースIDフォーマットが一致していることを確認する（32文字の16進数）
- Tempo設定でメトリクスジェネレーターが有効であることを確認する
- Tempoからリモートライトエンドポイントにアクセス可能であることを確認する
- エグゼンプラークエリをテストする: `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) and on() exemplar`

## バリデーション

- [ ] トレーシングバックエンドがすべてのインストルメントされたサービスからスパンを受信する
- [ ] トレースがサービス間で正しい親子関係を示す
- [ ] スパン属性にセマンティック規約とビジネスコンテキストが含まれている
- [ ] コンテキストがHTTP呼び出しとメッセージキューを越えて正しく伝播する
- [ ] サンプリング戦略がトレース量をターゲットのパーセンテージに削減する
- [ ] エラートレースが常にサンプリングされる（エラー認識サンプリングを使用する場合）
- [ ] トレースIDがアプリケーションログに正しいフォーマットで表示される
- [ ] Grafanaがエグゼンプラーを介してメトリクスにリンクされたトレースを表示する
- [ ] ログパネルにトレースビューアーへのデータリンクがある
- [ ] トレース保持が設定されたストレージポリシーに一致する

## よくある落とし穴

- **コンテキストが伝播されない**: ダウンストリームの呼び出しに`context`を渡し忘れるとトレースが切断される。常にコンテキストを明示的に渡す。
- **スパンが終了しない**: `defer span.End()`（Go）または`with`ブロック（Python）の欠如はスパンが開いたままになりメモリリークを引き起こす。
- **過剰なインストルメンテーション**: すべての関数にスパンを作成するとトレースが膨大になる。サービス境界、データベース呼び出し、外部APIに焦点を当てる。
- **エラーの記録漏れ**: `span.RecordError()`を呼び出さないと貴重なデバッグ情報が失われる。常にスパンにエラーを記録する。
- **高カーディナリティ属性**: 無制限の値（ユーザーID、リクエストボディ）をスパン属性として使用するとストレージの問題が発生する。サンプリングまたは集計ラベルを使用する。
- **不正なスパンの種類**: 誤ったスパンの種類（CLIENT vs SERVER vs INTERNAL）を使用するとサービスグラフの生成に影響する。セマンティック規約に従う。
- **コンテキスト前のサンプリング**: サンプリング決定は親トレースコンテキストを尊重しなければならない。アップストリームのサンプリングを尊重するために`ParentBased`サンプラーを使用する。

## 関連スキル

- `correlate-observability-signals` - トレースIDでリンクされたメトリクス、ログ、トレースを使用した統合デバッグ
- `setup-prometheus-monitoring` - Tempoメトリクスジェネレーターを使用してトレースからメトリクスを生成する
- `configure-log-aggregation` - 分散トレースとの相関のためにログにトレースIDを追加する
- `build-grafana-dashboards` - ダッシュボードでトレース由来のメトリクスとエグゼンプラーリンクを可視化する
