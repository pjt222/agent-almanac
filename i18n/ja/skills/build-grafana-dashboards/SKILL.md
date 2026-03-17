---
name: build-grafana-dashboards
description: >
  再利用可能なパネル、テンプレート変数、アノテーション、プロビジョニングを備えた
  本番対応のGrafanaダッシュボードを作成し、バージョン管理されたデプロイを実現する。
  Prometheus、Loki、その他のデータソースのメトリクスを可視化する場合、
  SREチーム向けの運用ダッシュボードを構築する場合、手動のダッシュボード作成から
  バージョン管理されたプロビジョニングに移行する場合、またはSLOコンプライアンスの
  エグゼクティブレベルのレポートを確立する場合に使用する。
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
  tags: grafana, dashboards, visualization, panels, provisioning
---

# Grafanaダッシュボードの構築

保守性、再利用性、バージョン管理のベストプラクティスに従ってGrafanaダッシュボードを設計・デプロイする。

## 使用タイミング

- Prometheus、Loki、その他のデータソースのメトリクスを視覚的に表現する場合
- SREチームとインシデント対応者向けの運用ダッシュボードを構築する場合
- SLOコンプライアンスのためのエグゼクティブレベルのレポートダッシュボードを確立する場合
- 手動作成からバージョン管理されたプロビジョニングへダッシュボードを移行する場合
- テンプレート変数を使用してチーム間でダッシュボードレイアウトを標準化する場合
- 高レベルの概要から詳細なメトリクスへのドリルダウン体験を作成する場合

## 入力

- **必須**: データソース設定（Prometheus、Loki、Tempoなど）
- **必須**: クエリパターンを伴う可視化対象のメトリクスまたはログ
- **任意**: マルチサービスまたはマルチ環境ビュー用のテンプレート変数
- **任意**: 移行または変更のための既存のダッシュボードJSON
- **任意**: イベント相関用のアノテーションクエリ（デプロイ、インシデント）

## 手順

> 完全な設定ファイルとテンプレートは[拡張例](references/EXAMPLES.md)を参照。


### ステップ1: ダッシュボード構造の設計

パネルを構築する前に、ダッシュボードのレイアウトと構成を計画する。

ダッシュボード仕様書を作成する：

```markdown
# Service Overview Dashboard

## Purpose
Real-time operational view for on-call engineers monitoring the API service.

## Rows
1. High-Level Metrics (collapsed by default)
   - Request rate, error rate, latency (RED metrics)
   - Service uptime, instance count
2. Detailed Metrics (expanded by default)
   - Per-endpoint latency breakdown
   - Error rate by status code
   - Database connection pool status
3. Resource Utilization
   - CPU, memory, disk usage per instance
   - Network I/O rates
4. Logs (collapsed by default)
   - Recent errors from Loki
   - Alert firing history

## Variables
- `environment`: production, staging, development
- `instance`: all instances or specific instance selection
- `interval`: aggregation window (5m, 15m, 1h)

## Annotations
- Deployment events from CI/CD system
- Alert firing/resolving events
```

主要な設計原則：
- **最重要メトリクスを先頭に**: 重要なメトリクスを上部に配置し、詳細は下に
- **一貫した時間範囲**: すべてのパネルで時間を同期する
- **ドリルダウンパス**: 高レベルから詳細ダッシュボードへのリンク
- **レスポンシブレイアウト**: 様々な画面で機能する行とパネル幅を使用する

**期待結果：** ダッシュボード構造が明確に文書化され、メトリクスとレイアウトの優先順位についてステークホルダーが合意する。

**失敗時：**
- エンドユーザー（SRE、開発者）とダッシュボード設計レビューを実施する
- 業界標準（USEメソッド、REDメソッド、Four Golden Signals）に対してベンチマークする
- 一貫性パターンのためにチームの既存ダッシュボードをレビューする

### ステップ2: テンプレート変数を使用したダッシュボードの作成

フィルタリング用の再利用可能な変数でダッシュボードの基盤を構築する。

ダッシュボードJSON構造を作成する（またはUIを使用してエクスポート）：

```json
{
  "dashboard": {
    "title": "API Service Overview",
    "uid": "api-service-overview",
    "version": 1,
    "timezone": "browser",
    "editable": true,
    "graphTooltip": 1,
    "time": {
      "from": "now-6h",
      "to": "now"
    },
    "refresh": "30s",
    "templating": {
      "list": [
        {
          "name": "environment",
          "type": "query",
          "datasource": "Prometheus",
          "query": "label_values(up{job=\"api-service\"}, environment)",
          "multi": false,
          "includeAll": false,
          "refresh": 1,
          "sort": 1,
          "current": {
            "selected": false,
            "text": "production",
            "value": "production"
          }
        },
        {
          "name": "instance",
          "type": "query",
          "datasource": "Prometheus",
          "query": "label_values(up{job=\"api-service\",environment=\"$environment\"}, instance)",
          "multi": true,
          "includeAll": true,
          "refresh": 1,
          "allValue": ".*",
          "current": {
            "selected": true,
            "text": "All",
            "value": "$__all"
          }
        },
        {
          "name": "interval",
          "type": "interval",
          "options": [
            {"text": "1m", "value": "1m"},
            {"text": "5m", "value": "5m"},
            {"text": "15m", "value": "15m"},
            {"text": "1h", "value": "1h"}
          ],
          "current": {
            "text": "5m",
            "value": "5m"
          },
          "auto": false
        }
      ]
    },
    "annotations": {
      "list": [
        {
          "name": "Deployments",
          "datasource": "Prometheus",
          "enable": true,
          "expr": "changes(app_version{job=\"api-service\",environment=\"$environment\"}[5m]) > 0",
          "step": "60s",
          "iconColor": "rgba(0, 211, 255, 1)",
          "tagKeys": "version"
        }
      ]
    }
  }
}
```

変数の種類とユースケース：
- **クエリ変数**: データソースからの動的リスト（`label_values()`、`query_result()`）
- **インターバル変数**: クエリの集計ウィンドウ
- **カスタム変数**: メトリクス以外の選択のための静的リスト
- **定数変数**: パネル間で共有する値（データソース名、しきい値）
- **テキストボックス変数**: フィルタリング用の自由入力

**期待結果：** 変数がデータソースから正しく生成され、カスケードフィルタが機能する（環境がインスタンスをフィルタ）、デフォルト選択が適切。

**失敗時：**
- PrometheusのUIで変数クエリを独立してテストする
- 循環依存関係を確認する（変数AがBに依存し、BがAに依存）
- マルチセレクト変数の`allValue`フィールドの正規表現パターンを確認する
- 変数の更新設定を確認する（ダッシュボード読み込み時 vs 時間範囲変更時）

### ステップ3: 可視化パネルの構築

各メトリクスに適した可視化タイプでパネルを作成する。

**時系列パネル**（リクエストレート）：

```json
{
  "type": "timeseries",
  "title": "Request Rate",
  "gridPos": {"h": 8, "w": 12, "x": 0, "y": 0},
  "targets": [
    {
      "expr": "sum(rate(http_requests_total{job=\"api-service\",environment=\"$environment\",instance=~\"$instance\"}[$interval])) by (method)",
      "legendFormat": "{{method}}",
      "refId": "A"
    }
  ],
  "fieldConfig": {
    "defaults": {
      "unit": "reqps",
      "color": {
        "mode": "palette-classic"
      },
      "custom": {
        "drawStyle": "line",
        "lineInterpolation": "smooth",
        "fillOpacity": 10,
        "spanNulls": true
      },
      "thresholds": {
        "mode": "absolute",
        "steps": [
          {"value": null, "color": "green"},
          {"value": 1000, "color": "yellow"},
          {"value": 5000, "color": "red"}
        ]
      }
    }
  },
  "options": {
    "tooltip": {
      "mode": "multi",
      "sort": "desc"
    },
    "legend": {
      "displayMode": "table",
      "placement": "right",
      "calcs": ["mean", "max", "last"]
    }
  }
}
```

**Statパネル**（エラーレート）：

```json
{
  "type": "stat",
  "title": "Error Rate",
  "gridPos": {"h": 4, "w": 6, "x": 12, "y": 0},
  "targets": [
    {
# ... (完全な設定はEXAMPLES.mdを参照)
```

**ヒートマップパネル**（レイテンシ分布）：

```json
{
  "type": "heatmap",
  "title": "Request Duration Heatmap",
  "gridPos": {"h": 8, "w": 12, "x": 0, "y": 8},
  "targets": [
    {
# ... (完全な設定はEXAMPLES.mdを参照)
```

パネル選択ガイド：
- **時系列**: 時間経過のトレンド（レート、カウント、所要時間）
- **Stat**: しきい値カラーリング付きの現在値
- **ゲージ**: パーセンテージ値（CPU、メモリ、ディスク使用量）
- **バーゲージ**: ある時点での複数値の比較
- **ヒートマップ**: 時間経過による値の分布（レイテンシパーセンタイル）
- **テーブル**: 複数メトリクスの詳細な内訳
- **ログ**: Lokiからのフィルタリング付き生ログ行

**期待結果：** パネルがデータとともに正しく表示され、可視化が意図したメトリクスタイプと一致し、凡例が説明的で、しきい値が問題を強調表示する。

**失敗時：**
- 同じ時間範囲と変数でExploreビューのクエリをテストする
- メトリクス名の誤りや不正なラベルフィルタを確認する
- 集計関数がメトリクスタイプと一致することを確認する（カウンターにrate、ゲージにavg）
- ユニット設定を確認する（バイト、秒、1秒あたりのリクエスト数）
- 空の結果をデバッグするために「Show query inspector」を有効にする

### ステップ4: 行とレイアウトの設定

論理的なグループ分けのためにパネルを折り畳み可能な行に整理する。

```json
{
  "panels": [
    {
      "type": "row",
      "title": "High-Level Metrics",
      "collapsed": false,
# ... (完全な設定はEXAMPLES.mdを参照)
```

レイアウトのベストプラクティス：
- グリッドは幅24単位で、各パネルは`w`（幅）と`h`（高さ）を指定する
- 関連するパネルをグループ化するために行を使用し、重要度の低いセクションはデフォルトで折り畳む
- 最重要メトリクスを最初に表示される領域に配置する（y=0-8）
- 行内でパネルの高さを一貫させる（通常4、8、または12単位）
- 時系列には全幅（24）、比較には半幅（12）を使用する

**期待結果：** ダッシュボードレイアウトが論理的に整理され、行の折り畳み/展開が正しく機能し、パネルがギャップなく視覚的に整列する。

**失敗時：**
- gridPos座標が重なっていないことを確認する
- 行パネルの配列にパネルが含まれていること（nullでないこと）を確認する
- y座標がページ下に向かって論理的に増加することを確認する
- Grafana UIの「Edit JSON」でグリッド位置を確認する

### ステップ5: リンクとドリルダウンの追加

関連するダッシュボード間のナビゲーションパスを作成する。

JSONのダッシュボードレベルのリンク：

```json
{
  "links": [
    {
      "title": "Service Details",
      "type": "link",
      "icon": "external link",
# ... (完全な設定はEXAMPLES.mdを参照)
```

パネルレベルのデータリンク：

```json
{
  "fieldConfig": {
    "defaults": {
      "links": [
        {
          "title": "View Logs for ${__field.labels.instance}",
# ... (完全な設定はEXAMPLES.mdを参照)
```

リンク変数：
- `$service`、`$environment`: ダッシュボードテンプレート変数
- `${__field.labels.instance}`: クリックしたデータポイントのラベル値
- `${__from}`、`${__to}`: 現在のダッシュボード時間範囲
- `$__url_time_range`: URL用のエンコードされた時間範囲

**期待結果：** パネル要素またはダッシュボードリンクをクリックすると、コンテキスト（時間範囲、変数）が保持された関連ビューに移動する。

**失敗時：**
- クエリパラメータ内の特殊文字をURLエンコードする
- 様々な変数選択でリンクをテストする（全て vs 特定の値）
- ターゲットダッシュボードのUIDが存在してアクセス可能であることを確認する
- `includeVars`と`keepTime`フラグが期待通りに機能することを確認する

### ステップ6: ダッシュボードプロビジョニングの設定

再現可能なデプロイのためにダッシュボードをコードとしてバージョン管理する。

プロビジョニングディレクトリ構造を作成する：

```bash
mkdir -p /etc/grafana/provisioning/{dashboards,datasources}
```

データソースのプロビジョニング（`/etc/grafana/provisioning/datasources/prometheus.yml`）：

```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
# ... (完全な設定はEXAMPLES.mdを参照)
```

ダッシュボードのプロビジョニング（`/etc/grafana/provisioning/dashboards/default.yml`）：

```yaml
apiVersion: 1

providers:
  - name: 'default'
    orgId: 1
    folder: 'Services'
    type: file
    disableDeletion: false
    updateIntervalSeconds: 30
    allowUiUpdates: true
    options:
      path: /var/lib/grafana/dashboards
      foldersFromFilesStructure: true
```

`/var/lib/grafana/dashboards/`にダッシュボードJSONファイルを保存する：

```bash
/var/lib/grafana/dashboards/
├── api-service/
│   ├── overview.json
│   └── details.json
├── database/
│   └── postgres.json
└── infrastructure/
    ├── nodes.json
    └── kubernetes.json
```

Docker Composeを使用する場合：

```yaml
version: '3.8'
services:
  grafana:
    image: grafana/grafana:10.2.0
    ports:
      - "3000:3000"
    volumes:
      - ./grafana/provisioning:/etc/grafana/provisioning
      - ./grafana/dashboards:/var/lib/grafana/dashboards
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
      - GF_AUTH_ANONYMOUS_ENABLED=true
      - GF_AUTH_ANONYMOUS_ORG_ROLE=Viewer
```

**期待結果：** Grafana起動時にダッシュボードが自動的に読み込まれ、更新間隔後にJSONファイルへの変更が反映され、バージョン管理がダッシュボードの変更を追跡する。

**失敗時：**
- Grafanaのログを確認する: `docker logs grafana | grep -i provisioning`
- JSON構文を確認する: `python -m json.tool dashboard.json`
- Grafanaが読み取れるようにファイルのパーミッションを確認する: `chmod 644 *.json`
- UI変更を防ぐために`allowUiUpdates: false`でテストする
- プロビジョニング設定を検証する: `curl http://localhost:3000/api/admin/provisioning/dashboards/reload -X POST -H "Authorization: Bearer $GRAFANA_API_KEY"`

## バリデーション

- [ ] ダッシュボードがGrafana UIでエラーなく読み込まれる
- [ ] すべてのテンプレート変数が期待値で生成される
- [ ] 変数のカスケードが機能する（環境を選択するとインスタンスがフィルタされる）
- [ ] パネルが設定された時間範囲のデータを表示する
- [ ] パネルクエリが変数を正しく使用する（ハードコードされた値がない）
- [ ] しきい値が問題状態を適切に強調表示する
- [ ] 凡例の書式が説明的で煩雑でない
- [ ] 関連するイベントにアノテーションが表示される
- [ ] リンクがコンテキストを保持して正しいダッシュボードに移動する
- [ ] ダッシュボードがJSONファイルからプロビジョニングされている（バージョン管理済み）
- [ ] レスポンシブレイアウトが異なる画面サイズで機能する
- [ ] ツールチップとホバーのインタラクションが有用なコンテキストを提供する

## よくある落とし穴

- **変数がパネルを更新しない**: クエリが`$variable`構文を使用していること（ハードコードされた値でないこと）を確認する。変数の更新設定を確認する。
- **クエリが正しいのにパネルが空**: 時間範囲にデータポイントが含まれていることを確認する。スクレイプ間隔と集計ウィンドウを確認する（5mのrateには5m以上のデータが必要）。
- **凡例が冗長すぎる**: `legendFormat`を使用してデフォルトのメトリクス名ではなく関連するラベルのみを表示する。例: デフォルトの代わりに`{{method}} - {{status}}`。
- **時間範囲の不一致**: ダッシュボードの時間同期を設定してすべてのパネルが同じ時間ウィンドウを共有するようにする。相関調査には「Sync cursor」を使用する。
- **パフォーマンスの問題**: 高カーディナリティのシリーズ（>1000）を返すクエリを避ける。記録ルールまたは事前集計を使用する。高コストなクエリの時間範囲を制限する。
- **ダッシュボードのドリフト**: プロビジョニングなしでは、UIでの手動変更がバージョン管理の競合を生む。本番では`allowUiUpdates: false`を使用する。
- **データリンクの欠如**: データリンクには正確なラベル名が必要。`${__field.labels.labelname}`を注意深く使用し、クエリ結果にラベルが存在することを確認する。
- **アノテーションの過剰**: アノテーションが多すぎるとビューが煩雑になる。重要度でアノテーションをフィルタするか、別のアノテーショントラックを使用する。

## 関連スキル

- `setup-prometheus-monitoring` - GrafanaダッシュボードにフィードするPrometheusデータソースを設定する
- `configure-log-aggregation` - ログパネルのクエリとログベースのアノテーション用のLokiをセットアップする
- `define-slo-sli-sla` - GrafanaのstatパネルとゲージパネルでSLOコンプライアンスとエラーバジェットを可視化する
- `instrument-distributed-tracing` - メトリクスパネルからTempoトレースビューへのトレースIDリンクを追加する
