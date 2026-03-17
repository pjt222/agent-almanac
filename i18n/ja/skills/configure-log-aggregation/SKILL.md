---
name: configure-log-aggregation
description: >
  LokiとPromtail（またはELKスタック）を使用して、ログの解析、ラベル抽出、
  保持ポリシー、メトリクスとの相関のための統合ログ集約をセットアップする。
  複数サービスのログを検索可能なシステムに統合する場合、ローカルログファイルを
  集中型のクエリ可能なストレージに置き換える場合、ログをメトリクスやトレースと
  相関させる場合、ラベル抽出による構造化ログを実装する場合、またはクロスサービスの
  ログ分析を必要とする本番インシデントのトラブルシューティングを行う場合に使用する。
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
  tags: loki, promtail, logging, elk, log-aggregation
---

# ログ集約の設定

運用の可視性を確保するために、Loki/PromtailまたはELKスタックを使用して、集中型のログ収集、解析、クエリを実装する。

## 使用タイミング

- 複数のサービスまたはホストからのログを検索可能なシステムに統合する場合
- ローカルログファイルを集中型のクエリ可能なログストレージに置き換える場合
- ログをメトリクスやトレースと相関させて完全な可観測性を実現する場合
- 非構造化ログからのラベル抽出を使用して構造化ログを実装する場合
- ストレージとコンプライアンスのニーズに基づいてログデータの保持ポリシーを設定する場合
- クロスサービスのログ分析を必要とする本番インシデントのトラブルシューティングを行う場合

## 入力

- **必須**: ログソース（アプリケーションログ、システムログ、コンテナログ）
- **必須**: ログフォーマットパターン（JSON、プレーンテキスト、syslogなど）
- **任意**: 構造化クエリのためのラベル抽出ルール
- **任意**: 保持と圧縮のポリシー
- **任意**: 既存のログシッパー設定（Fluentd、Filebeat、Promtail）

## 手順

> 完全な設定ファイルとテンプレートは[拡張例](references/EXAMPLES.md)を参照。


### ステップ1: ログ集約スタックの選択

要件に基づいてLoki（Prometheusスタイル）またはELK（Elasticsearchベース）から選択する。

**Lokiの利点**：
- 軽量で、Kubernetesとクラウドネイティブ環境向けに設計されている
- ストレージのオーバーヘッドを低減するラベルベースのインデックス（Prometheusと同様）
- 統合ダッシュボードのためのGrafanaとのネイティブ統合
- オブジェクトストレージ（S3、GCS）を使用した水平スケーラビリティ
- Elasticsearchと比較してリソース消費が少ない

**ELKの利点**：
- すべてのログコンテンツ（ラベルだけでなく）に対する全文検索
- 豊富なクエリDSLと集計
- beats、logstashプラグインを持つ成熟したエコシステム
- 深い歴史的検索を必要とするコンプライアンス/監査ログに適している

このガイドでは、**Loki + Promtail**（ほとんどの現代的なセットアップに推奨）に焦点を当てる。

判断基準：
```markdown
Use Loki if:
- You want label-based queries similar to Prometheus
- Storage costs are a concern (Loki indexes only labels)
- You already use Grafana for metrics
- Kubernetes/container-native deployment

Use ELK if:
- You need full-text search across all log content
- You have complex log parsing and enrichment requirements
- You require advanced analytics and aggregations
- Legacy systems with existing Logstash pipelines
```

**期待結果：** 要件に基づいた明確な選択が行われ、チームが適切なインストールアーティファクトをダウンロードする。

**失敗時：**
- ストレージ要件をベンチマークする：Lokiは同じログに対してElasticsearchより約10倍少ない
- クエリパターンを評価する：全文検索のニーズとラベルフィルタリング
- 運用オーバーヘッドを考慮する：ELKはより多くのチューニングとリソースを必要とする

### ステップ2: Lokiのデプロイ

適切なストレージバックエンドでLokiをインストールして設定する。

**Docker Composeデプロイ**（`docker-compose.yml`）：

```yaml
version: '3.8'

services:
  loki:
    image: grafana/loki:2.9.0
    ports:
      - "3100:3100"
    volumes:
      - ./loki-config.yml:/etc/loki/local-config.yaml
      - loki-data:/loki
    command: -config.file=/etc/loki/local-config.yaml
    restart: unless-stopped

  promtail:
    image: grafana/promtail:2.9.0
    volumes:
      - ./promtail-config.yml:/etc/promtail/config.yml
      - /var/log:/var/log:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
    command: -config.file=/etc/promtail/config.yml
    restart: unless-stopped
    depends_on:
      - loki

volumes:
  loki-data:
```

**Loki設定**（`loki-config.yml`）：

```yaml
auth_enabled: false

server:
  http_listen_port: 3100
  grpc_listen_port: 9096

# ... (完全な設定はEXAMPLES.mdを参照)
```

S3ストレージを使用した**本番環境**向け：

```yaml
storage_config:
  aws:
    s3: s3://us-east-1/my-loki-bucket
    s3forcepathstyle: true
  boltdb_shipper:
    active_index_directory: /loki/index
    cache_location: /loki/cache
    shared_store: s3
```

**期待結果：** Lokiが正常に起動し、`http://localhost:3100/ready`でヘルスチェックが通過し、保持ポリシーに従ってログが保存される。

**失敗時：**
- Lokiのログを確認する: `docker logs loki`
- ストレージディレクトリが存在して書き込み可能であることを確認する
- 設定の構文をテストする: `docker run grafana/loki:2.9.0 -config.file=/etc/loki/local-config.yaml -verify-config`
- 保持設定がディスク容量を超えないことを確認する
- S3の場合: IAMパーミッションとバケットアクセスを確認する

### ステップ3: ログ配送のためのPromtailの設定

PromtailがログをスクレイプしてLokiにラベル抽出付きで転送するよう設定する。

**Promtail設定**（`promtail-config.yml`）：

```yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml
# ... (完全な設定はEXAMPLES.mdを参照)
```

Promtailの主要な概念：
- **スクレイプ設定**: ログソースとそれらをディスカバリする方法を定義する
- **パイプラインステージ**: Lokiに送信する前にログを変換してラベル付けする
- **リラベル設定**: メタデータに基づく動的なラベル付け
- **ポジションファイル**: ログの再処理を避けるために読み取りオフセットを追跡する

**期待結果：** Promtailが設定されたログファイルをスクレイプし、ラベルが正しく適用され、LogQLクエリを介してLokiでログが閲覧可能。

**失敗時：**
- Promtailのログを確認する: `docker logs promtail`
- ファイルパスがアクセス可能であることを確認する: `docker exec promtail ls /var/log`
- サンプルのログ行で正規表現パターンを独立してテストする
- Promtailのメトリクスを監視する: `curl http://localhost:9080/metrics | grep promtail`
- 進捗のためにポジションファイルを確認する: `cat /tmp/positions.yaml`

### ステップ4: LogQLでログをクエリする

ログのフィルタリングと集計のためのLogQL構文を習得する。

**基本クエリ**：

```logql
# All logs from a job
{job="app"}

# Logs with specific label values
{job="app", level="error"}

# Regex filter on log line content
{job="app"} |~ "authentication failed"

# Case-insensitive regex
{job="app"} |~ "(?i)error"

# Line filter (doesn't parse, just includes/excludes)
{job="app"} |= "user"  # Contains "user"
{job="app"} != "debug" # Doesn't contain "debug"
```

**解析とフィルタリング**：

```logql
# JSON parsing
{job="app"} | json | level="error"

# Regex parsing with named groups
{job="app"} | regexp "user_id=(?P<user_id>\\d+)" | user_id="12345"

# Logfmt parsing (key=value format)
{job="app"} | logfmt | level="error", service="auth"

# Pattern parsing
{job="nginx"} | pattern `<ip> - <user> [<timestamp>] "<method> <path> <protocol>" <status> <size>` | status >= 500
```

**集計**（ログからのメトリクス）：

```logql
# Count log lines per level
sum by (level) (count_over_time({job="app"}[5m]))

# Rate of error logs
rate({job="app", level="error"}[5m])

# Bytes processed per service
sum by (service) (bytes_over_time({job="app"}[1h]))

# Average request duration from logs
avg_over_time({job="app"} | json | unwrap duration [5m])

# Top 10 error messages
topk(10, sum by (message) (count_over_time({level="error"} [1h])))
```

**抽出フィールドによるフィルタリング**：

```logql
# Find specific trace in logs
{job="app"} | json | trace_id="abc123def456"

# HTTP 5xx errors from nginx
{job="nginx"} | pattern `<_> "<_> <_> <_>" <status> <_>` | status >= 500

# Failed authentication attempts
{job="app"} | json | message=~"authentication failed" | user_id != ""
```

これらのパターンを使用してGrafana Exploreのクエリまたはダッシュボードパネルを作成する。

**期待結果：** クエリが期待されるログ行を返し、フィルタリングが正しく機能し、集計がログからメトリクスを生成する。

**失敗時：**
- Grafana Exploreを使用してクエリをインタラクティブにデバッグする
- ラベル名を確認する: `curl http://localhost:3100/loki/api/v1/labels`
- ラベル値を確認する: `curl http://localhost:3100/loki/api/v1/label/{label_name}/values`
- クエリを単純化する：基本的なラベルセレクタから始め、フィルタを段階的に追加する
- 時間範囲を確認する：選択したウィンドウにログが存在しない可能性がある

### ステップ5: ログをメトリクスとトレースに統合する

統合された可観測性のためにログをPrometheusメトリクスと分散トレースと相関させる。

**ログにトレースIDを追加する**（アプリケーションのインストルメンテーション）：

```python
# Python with OpenTelemetry
import logging
from opentelemetry import trace

logger = logging.getLogger(__name__)

def handle_request():
    span = trace.get_current_span()
    trace_id = span.get_span_context().trace_id

    logger.info(
        "Processing request",
        extra={"trace_id": format(trace_id, "032x")}
    )
```

```go
// Go with OpenTelemetry
import (
    "go.opentelemetry.io/otel/trace"
    "go.uber.org/zap"
)

func handleRequest(ctx context.Context) {
    span := trace.SpanFromContext(ctx)
    traceID := span.SpanContext().TraceID().String()

    logger.Info("Processing request",
        zap.String("trace_id", traceID),
    )
}
```

**Grafanaデータリンクを設定する**（メトリクスからログへ）：

Prometheusパネルのフィールド設定：

```json
{
  "fieldConfig": {
    "defaults": {
      "links": [
        {
          "title": "View Logs",
          "url": "/explore?left={\"datasource\":\"Loki\",\"queries\":[{\"refId\":\"A\",\"expr\":\"{job=\\\"app\\\",instance=\\\"${__field.labels.instance}\\\"} |= `${__field.labels.trace_id}`\"}],\"range\":{\"from\":\"${__from}\",\"to\":\"${__to}\"}}",
          "targetBlank": false
        }
      ]
    }
  }
}
```

**Grafanaデータリンクを設定する**（ログからトレースへ）：

LokiデータソースのYAML設定：

```yaml
datasources:
  - name: Loki
    type: loki
    url: http://loki:3100
    jsonData:
      derivedFields:
        - datasourceName: Tempo
          matcherRegex: "trace_id=(\\w+)"
          name: TraceID
          url: "$${__value.raw}"
```

**Grafana Exploreでログを相関させる**：
1. PrometheusでメトリクスをクエリするGrafana Exploreでログを相関させる
2. データポイントをクリックする
3. コンテキストメニューから「View Logs」を選択する
4. 関連するラベルと時間範囲でLokiクエリが自動入力される
5. ログ内のトレースIDをクリックする
6. 完全な分散トレースを含むTempoのトレースビューが開く

**期待結果：** メトリクスをクリックすると関連ログが開き、ログのトレースIDがトレースビューにリンクし、メトリクス/ログ/トレースのナビゲーション用の単一ペインが実現する。

**失敗時：**
- トレースIDフォーマットが派生フィールドの正規表現と一致することを確認する
- Promtailパイプラインによってtrace_idラベルが抽出されていることを確認する
- GrafanaでTempoデータソースが設定されていることを確認する
- 複雑なフィルタ式のURLエンコードをテストする
- シークレット/プライベートブラウザウィンドウでデータリンクURLを検証する

### ステップ6: ログ保持とコンパクションの設定

ストレージコストを管理するために保持ポリシーとコンパクションを設定する。

**ストリームによる保持**（Loki設定内）：

```yaml
limits_config:
  retention_period: 720h  # Global default: 30 days

  # Per-tenant retention (requires multi-tenancy enabled)
  per_tenant_override_config: /etc/loki/overrides.yaml

# overrides.yaml
overrides:
  production:
    retention_period: 2160h  # 90 days for production
  staging:
    retention_period: 360h   # 15 days for staging
  development:
    retention_period: 168h   # 7 days for dev
```

**ストリームラベルによる保持**（コンパクターが必要）：

```yaml
compactor:
  working_directory: /loki/compactor
  shared_store: filesystem
  compaction_interval: 10m
  retention_enabled: true
  retention_delete_delay: 2h
# ... (完全な設定はEXAMPLES.mdを参照)
```

複数のルールが一致する場合の優先度（数字が小さいほど優先度が高い）。

**圧縮設定**：

```yaml
chunk_store_config:
  chunk_cache_config:
    enable_fifocache: true
    fifocache:
      max_size_bytes: 1GB
      ttl: 24h
# ... (完全な設定はEXAMPLES.mdを参照)
```

**保持の監視**：

```bash
# Check chunk stats
curl http://localhost:3100/loki/api/v1/status/chunks | jq

# Check compactor metrics
curl http://localhost:3100/metrics | grep loki_compactor

# Verify deleted chunks
curl http://localhost:3100/metrics | grep loki_boltdb_shipper_retention_deleted
```

**期待結果：** 保持ポリシーに従って古いログが自動的に削除され、ストレージ使用量が安定し、コンパクションによってインデックスサイズが削減される。

**失敗時：**
- 保持が機能していない場合は、Loki設定でコンパクターを有効にする
- コンパクターのログを確認する: `docker logs loki | grep compactor`
- `retention_enabled: true`と`retention_deletes_enabled: true`を確認する
- ディスク使用量を監視する: `du -sh /loki/`
- S3の場合: バケットのライフサイクルポリシーがLokiの保持と競合しないことを確認する

## バリデーション

- [ ] LokiのAPIヘルスチェックが200を返す: `curl http://localhost:3100/ready`
- [ ] Promtailがすべての設定されたソースからのログを正常にスクレイプしている
- [ ] ログ行からラベルが正しく抽出されている（Grafana Exploreで確認可能）
- [ ] LogQLクエリが適切なフィルタリングで期待される結果を返す
- [ ] ログ保持ポリシーが適用されている（保持期間後に古いログが削除される）
- [ ] GrafanaのダッシュボードとExploreビューからログにアクセス可能
- [ ] ログのトレースIDがTempoトレースビューにリンクしている
- [ ] メトリクスパネルに関連ログへのデータリンクがある
- [ ] コンパクションが実行されてストレージのオーバーヘッドを削減している
- [ ] ストレージ使用量が割り当てられたディスク/S3バジェット内に収まっている

## よくある落とし穴

- **高カーディナリティのラベル**: 無制限のラベル値（ユーザーID、リクエストID）を使用するとインデックスが爆発する。固定ラベル（level、service、env）を使用し、変数はログ行に入れる。
- **ログ解析の欠如**: ラベル抽出なしで生ログを送信するとクエリ能力が制限される。常に構造化ログ（JSON、logfmt）を解析するか、非構造化ログには正規表現を使用する。
- **不正なタイムスタンプ解析**: タイムスタンプフォーマットが一致しないと、ログが順序外または拒否される。サンプルログでタイムスタンプ解析をテストする。
- **保持が機能しない**: 古いデータを削除するにはコンパクターが有効でなければならない。`retention_enabled: true`と`retention_deletes_enabled: true`を確認する。
- **取り込みレート制限**: デフォルトの制限（10MB/s）は高ボリュームのシステムには低すぎる場合がある。`ingestion_rate_mb`と`ingestion_burst_size_mb`を調整する。
- **クエリのタイムアウト**: 長い時間範囲にわたる広範なクエリはタイムアウトする可能性がある。より具体的なラベルセレクタと短い時間ウィンドウを使用する。
- **ログの重複**: 同じログをスクレイプする複数のPromtailインスタンスが重複を生む。一意のラベルまたはポジションファイルの調整を使用する。

## 関連スキル

- `correlate-observability-signals` - トレースIDを使用したメトリクス、ログ、トレースにわたる統合デバッグ
- `build-grafana-dashboards` - ログ由来のメトリクスを可視化し、ダッシュボードにログパネルを作成する
- `setup-prometheus-monitoring` - メトリクスはインシデント中にログをクエリするタイミングのコンテキストを提供する
- `instrument-distributed-tracing` - 分散トレースとの相関のためにログにトレースIDを追加する
