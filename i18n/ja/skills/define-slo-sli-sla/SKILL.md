---
name: define-slo-sli-sla
description: >
  エラーバジェット追跡、バーンレートアラート、PrometheusおよびSlothやPyrraなどのツールを使用した
  自動レポートを含む、サービスレベル目標（SLO）、サービスレベル指標（SLI）、
  サービスレベルアグリーメント（SLA）を確立する。カスタマー向けサービスの信頼性目標を
  定義する場合、エラーバジェットを通じた機能開発速度とシステム信頼性のバランスを取る場合、
  任意のアップタイム目標からデータ駆動型のメトリクスへ移行する場合、またはSRE実践を
  実装する場合に使用する。
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
  tags: slo, sli, sla, error-budget, burn-rate
---

# SLO/SLI/SLAの定義

サービスレベル目標で測定可能な信頼性ターゲットを確立し、指標で追跡し、エラーバジェットを管理する。

## 使用タイミング

- カスタマー向けサービスまたはAPIの信頼性ターゲットを定義する場合
- サービスプロバイダーとコンシューマーの間で明確な期待を確立する場合
- エラーバジェットを通じた機能開発速度とシステム信頼性のバランスを取る場合
- インシデントの重大度と対応のための客観的な基準を作成する場合
- 任意のアップタイム目標からデータ駆動型の信頼性メトリクスへ移行する場合
- サイト信頼性エンジニアリング（SRE）の実践を実装する場合
- 時間の経過とともにサービス品質を測定して改善する場合

## 入力

- **必須**: サービスの説明と重要なユーザージャーニー
- **必須**: 過去のメトリクスデータ（リクエストレート、レイテンシ、エラーレート）
- **任意**: 顧客への既存のSLAコミットメント
- **任意**: サービスの可用性とパフォーマンスのためのビジネス要件
- **任意**: インシデント履歴と顧客影響データ

## 手順

> 完全な設定ファイルとテンプレートは[拡張例](references/EXAMPLES.md)を参照。


### ステップ1: SLI、SLO、SLAの階層を理解する

これら3つの概念の関係と違いを習得する。

**定義**：

```markdown
SLI (Service Level Indicator)
- **What**: A quantitative measure of service behavior
- **Example**: Request success rate, request latency, system throughput
- **Measurement**: `successful_requests / total_requests * 100`

SLO (Service Level Objective)
- **What**: Target value or range for an SLI over a time window
- **Example**: 99.9% of requests succeed in 30-day window
- **Purpose**: Internal reliability target to guide operations

SLA (Service Level Agreement)
- **What**: Contractual commitment with consequences for missing SLO
- **Example**: 99.9% uptime SLA with refunds if breached
- **Purpose**: External promise to customers with penalties
```

**階層**：
```
SLA (99.9% uptime, customer refunds)
  ├─ SLO (99.95% success rate, internal target)
  │   └─ SLI (actual measured: 99.97% success rate)
  └─ Error Budget (0.05% failures allowed per month)
```

**重要な原則**: SLOはSLAより**厳格**にして、顧客への影響が生じる前にバッファを設ける。

例：
- **SLA**: 99.9%の可用性（顧客への約束）
- **SLO**: 99.95%の可用性（内部ターゲット）
- **バッファ**: SLAを超える前の0.05%の余裕

**期待結果：** チームが違いを理解し、どのメトリクスがSLIになるかに合意し、SLOターゲットについて一致する。

**失敗時：**
- SLI/SLO/SLAに関するGoogle SREブックの章をレビューする
- ステークホルダーとワークショップを実施して定義を統一する
- 複雑なレイテンシSLOの前に、単純な成功率のSLIから始める

### ステップ2: 適切なSLIの選択

ユーザー体験とビジネスへの影響を反映するSLIを選ぶ。

**Four Golden Signals**（Google SRE）：

1. **レイテンシ**: リクエストを処理する時間
   ```promql
   # P95 latency
   histogram_quantile(0.95,
     sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
   )
   ```

2. **トラフィック**: システムへの要求
   ```promql
   # Requests per second
   sum(rate(http_requests_total[5m]))
   ```

3. **エラー**: 失敗したリクエストのレート
   ```promql
   # Error rate percentage
   sum(rate(http_requests_total{status=~"5.."}[5m]))
   / sum(rate(http_requests_total[5m])) * 100
   ```

4. **飽和度**: システムがどれほど「満杯」か
   ```promql
   # CPU saturation
   avg(rate(node_cpu_seconds_total{mode!="idle"}[5m]))
   ```

**一般的なSLIパターン**：

```yaml
# Availability SLI
availability:
  description: "Percentage of successful requests"
  query: |
    sum(rate(http_requests_total{status!~"5.."}[5m]))
    / sum(rate(http_requests_total[5m]))
  good_threshold: 0.999  # 99.9%

# Latency SLI
latency:
  description: "P99 request latency under 500ms"
  query: |
    histogram_quantile(0.99,
      sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
    ) < 0.5
  good_threshold: 0.95  # 95% of windows meet target

# Throughput SLI
throughput:
  description: "Requests processed per second"
  query: |
    sum(rate(http_requests_total[5m]))
  good_threshold: 1000  # Minimum 1000 req/s

# Data freshness SLI (for batch jobs)
freshness:
  description: "Data updated within last hour"
  query: |
    (time() - max(data_last_updated_timestamp)) < 3600
  good_threshold: 1  # Always fresh
```

**SLI選択基準**：
- **ユーザーに見える**: 実際のユーザー体験を反映する
- **測定可能**: 既存のメトリクスから定量化できる
- **行動可能**: チームがエンジニアリング作業で改善できる
- **意味がある**: 顧客満足度と相関する
- **シンプル**: 理解して説明しやすい

回避すべきもの：
- ユーザーに見えない内部システムメトリクス（CPU、メモリ）
- 顧客への影響を予測しないバニティメトリクス
- 過度に複雑な複合スコア

**期待結果：** サービスあたり2〜4個のSLIが選択され、少なくとも可用性とレイテンシをカバーし、測定クエリについてチームが合意する。

**失敗時：**
- ユーザージャーニーをマッピングして重要な障害ポイントを特定する
- インシデント履歴を分析する：どのメトリクスが顧客への影響を予測したか？
- A/Bテストでラジカルに検証する：メトリクスを劣化させ、顧客の苦情を測定する
- 単純な可用性SLIから始めて、段階的に複雑さを増やす

### ステップ3: SLOターゲットと時間ウィンドウの設定

現実的で達成可能な信頼性ターゲットを定義する。

**SLO仕様フォーマット**：

```yaml
service: user-api
slos:
  - name: availability
    objective: 99.9
    description: |
      99.9% of requests return non-5xx status codes
# ... (完全な設定はEXAMPLES.mdを参照)
```

**時間ウィンドウの選択**：

一般的なウィンドウ：
- **30日**（月次）: 外部SLAの典型
- **7日**（週次）: エンジニアリングチームへの迅速なフィードバック
- **1日**（日次）: 迅速な対応を要する高頻度サービス

30日ウィンドウのエラーバジェット例：
```
SLO: 99.9% availability over 30 days
Allowed failures: 0.1%
Total requests per month: 100M
Error budget: 100,000 failed requests
Daily budget: ~3,333 failed requests
```

**現実的なターゲットの設定**：

1. **現在のパフォーマンスをベースライン化**：
   ```promql
   # Check actual availability over past 90 days
   avg_over_time(
     (sum(rate(http_requests_total{status!~"5.."}[5m]))
     / sum(rate(http_requests_total[5m])))[90d:5m]
   )
   # Result: 99.95% → Set SLO at 99.9% (safer than current)
   ```

2. **「9」のコストを計算**：
   ```
   99%    → 7.2 hours downtime/month (low reliability)
   99.9%  → 43 minutes downtime/month (good)
   99.95% → 22 minutes downtime/month (very good)
   99.99% → 4.3 minutes downtime/month (expensive)
   99.999% → 26 seconds downtime/month (very expensive)
   ```

3. **ユーザーの幸福度とエンジニアリングコストのバランスを取る**：
   - 厳しすぎる: 高コスト、機能開発が遅くなる
   - 緩すぎる: 貧弱なユーザー体験、顧客離れ
   - **スイートスポット**: ユーザーの期待をわずかに上回る

**期待結果：** ビジネスステークホルダーの賛同を得てSLOターゲットを設定し、根拠を文書化し、エラーバジェットを計算する。

**失敗時：**
- 達成可能なターゲットから始める（現在が98.5%なら99%など）
- 実際のパフォーマンスに基づいて四半期ごとにSLOターゲットを反復する
- 「ファイブナイン」の要求に対して現実的なターゲットについてエグゼクティブのスポンサーシップを得る
- 追加される「9」ごとにコストベネフィット分析を文書化する

### ステップ4: SlothによるSLOモニタリングの実装

SlothでSLO仕様からPrometheusの記録ルールとアラートを生成する。

**Slothのインストール**：

```bash
# Binary installation
wget https://github.com/slok/sloth/releases/download/v0.11.0/sloth-linux-amd64
chmod +x sloth-linux-amd64
sudo mv sloth-linux-amd64 /usr/local/bin/sloth

# Or Docker
docker pull ghcr.io/slok/sloth:latest
```

**SlothのSLO仕様を作成**（`slos/user-api.yml`）：

```yaml
version: "prometheus/v1"
service: "user-api"
labels:
  team: "platform"
  tier: "1"
slos:
# ... (完全な設定はEXAMPLES.mdを参照)
```

**Prometheusルールを生成**：

```bash
# Generate recording and alerting rules
sloth generate -i slos/user-api.yml -o prometheus/rules/user-api-slo.yml

# Validate generated rules
promtool check rules prometheus/rules/user-api-slo.yml
```

**生成された記録ルール**（抜粋）：

```yaml
groups:
  - name: sloth-slo-sli-recordings-user-api-requests-availability
    interval: 30s
    rules:
      # SLI: Ratio of good events
      - record: slo:sli_error:ratio_rate5m
# ... (完全な設定はEXAMPLES.mdを参照)
```

**生成されたアラート**：

```yaml
groups:
  - name: sloth-slo-alerts-user-api-requests-availability
    rules:
      # Fast burn: 2% budget consumed in 1 hour
      - alert: UserAPIHighErrorRate
        expr: |
# ... (完全な設定はEXAMPLES.mdを参照)
```

**ルールをPrometheusに読み込む**：

```yaml
# prometheus.yml
rule_files:
  - "rules/user-api-slo.yml"
```

Prometheusをリロードする：
```bash
curl -X POST http://localhost:9090/-/reload
```

**期待結果：** Slothがマルチウィンドウ・マルチバーンレートアラートを生成し、記録ルールが正常に評価され、インシデント中に適切にアラートが発火する。

**失敗時：**
- `yamllint slos/user-api.yml`でYAML構文を検証する
- Slothのバージョン互換性を確認する（v0.11以上推奨）
- Prometheusの記録ルール評価を確認する: `curl http://localhost:9090/api/v1/rules`
- 合成的なエラー注入でアラートをトリガーしてテストする
- SLIイベントクエリフォーマットのSlothドキュメントを確認する

### ステップ5: エラーバジェットダッシュボードの構築

GrafanaでSLOコンプライアンスとエラーバジェット消費を可視化する。

**GrafanaダッシュボードのJSON**（抜粋）：

```json
{
  "dashboard": {
    "title": "SLO Dashboard - User API",
    "panels": [
      {
        "type": "stat",
# ... (完全な設定はEXAMPLES.mdを参照)
```

**可視化すべき主要メトリクス**：
- SLOターゲット vs 現在のSLI
- 残りのエラーバジェット（パーセンテージと絶対値）
- バーンレート（バジェットがどれくらいの速さで枯渇しているか）
- 過去のSLIトレンド（30日間のローリングウィンドウ）
- 枯渇までの時間（現在のバーンレートが続いた場合）

**エラーバジェットポリシーダッシュボード**（マークダウンパネル）：

```markdown
## Error Budget Policy

**Current Status**: 78% budget remaining

### If Error Budget > 50%
- ✅ Full speed ahead on new features
# ... (完全な設定はEXAMPLES.mdを参照)
```

**期待結果：** ダッシュボードがリアルタイムのSLOコンプライアンスを表示し、エラーバジェットの枯渇が見え、チームが機能開発速度について情報に基づいた決定を下せる。

**失敗時：**
- 記録ルールが存在することを確認する: `curl http://localhost:9090/api/v1/rules | jq '.data.groups[].rules[] | select(.name | contains("slo:"))'`
- GrafanaのPrometheusデータソースが正しいURLを持つことを確認する
- ダッシュボードに追加する前にExploreビューでクエリ結果を検証する
- 時間範囲が適切なウィンドウに設定されていることを確認する（月次SLOには30dなど）

### ステップ6: エラーバジェットポリシーの確立

エラーバジェットを管理するための組織的プロセスを定義する。

**エラーバジェットポリシーテンプレート**：

```yaml
service: user-api
slo:
  availability: 99.9%
  latency_p99: 200ms
  window: 30 days

# ... (完全な設定はEXAMPLES.mdを参照)
```

**ポリシー実施の自動化**：

```python
# Example: Deployment gate script
import requests
import sys

def check_error_budget(service):
    # Query Prometheus for error budget
# ... (完全な設定はEXAMPLES.mdを参照)
```

CI/CDパイプラインに統合する：

```yaml
# .github/workflows/deploy.yml
jobs:
  check-error-budget:
    runs-on: ubuntu-latest
    steps:
      - name: Check SLO Error Budget
        run: |
          python scripts/check_error_budget.py user-api
      - name: Deploy
        if: success()
        run: |
          kubectl apply -f deploy/
```

**期待結果：** 明確なポリシーが文書化され、バジェット枯渇時に自動ゲートがリスクのあるデプロイを防ぎ、信頼性の優先順位についてチームが一致する。

**失敗時：**
- 手動ポリシー実施から始める（Slackのリマインダー）
- ソフトゲート（警告、ブロックではない）で段階的に自動化する
- ハードゲート（デプロイのブロック）の前にエグゼクティブの賛同を得る
- 四半期ごとにポリシーの有効性をレビューし、必要に応じてしきい値を調整する

## バリデーション

- [ ] SLIがユーザー体験とビジネスへの影響を反映するよう選択されている
- [ ] SLOターゲットがステークホルダーの合意のもとに設定され、根拠が文書化されている
- [ ] Prometheusの記録ルールがSLIメトリクスを正常に生成する
- [ ] マルチバーンレートアラートが設定され、合成エラーでテストされている
- [ ] GrafanaダッシュボードがリアルタイムのSLOコンプライアンスとエラーバジェットを表示する
- [ ] エラーバジェットポリシーが文書化されてチームに周知されている
- [ ] 自動ゲートがバジェット枯渇時にリスクのあるデプロイを防ぐ
- [ ] 週次/月次のSLOレビュー会議がスケジュールされている
- [ ] インシデントの振り返りにSLOへの影響分析が含まれている
- [ ] SLOコンプライアンスレポートがステークホルダーと共有されている

## よくある落とし穴

- **過度に厳格なSLO**: コスト分析なしに「ファイブナイン」を設定するとバーンアウトと機能開発速度の低下につながる。達成可能なものから始めて段階的に上げる。
- **SLIが多すぎる**: 10以上の指標を追跡すると混乱が生じる。2〜4つの重要なユーザー向けメトリクスに焦点を当てる。
- **SLAバッファなしのSLO**: SLOをSLAと同じに設定すると、顧客への影響が生じる前のエラーの余裕がない。0.05〜0.1%のバッファを保つ。
- **エラーバジェットの無視**: SLOを追跡するがバジェット枯渇に対して行動しないと目的が失われる。エラーバジェットポリシーを実施する。
- **バニティメトリクスをSLIに**: ユーザーに見えるメトリクス（レイテンシ、エラー）ではなく内部メトリクス（CPU、メモリ）を使用すると優先順位がずれる。
- **ステークホルダーの賛同なし**: 製品/ビジネスの合意のないエンジニアリングのみのSLOは対立を生む。エグゼクティブのスポンサーシップを得る。
- **静的なSLO**: システムが進化しても目標を見直しや調整をしない。実際のパフォーマンスとユーザーフィードバックに基づいて四半期ごとに再検討する。

## 関連スキル

- `setup-prometheus-monitoring` - SLI計算のためにメトリクスを収集するPrometheusを設定する
- `configure-alerting-rules` - オンコール通知のためにAlertmanagerとSLOバーンレートアラートを統合する
- `build-grafana-dashboards` - SLOコンプライアンスとエラーバジェット消費を可視化する
- `write-incident-runbook` - インシデント対応の優先順位付けのためにランブックにSLOへの影響を含める
