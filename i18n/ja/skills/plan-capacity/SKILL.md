---
name: plan-capacity
description: >
  過去のメトリクスと成長モデルを使用してキャパシティプランニングを実施する。
  予測にpredict_linearを使用し、リソースの制約を特定し、ヘッドルームを計算し、
  飽和前にスケーリングアクションを推奨する。季節的なトラフィックスパイクや
  製品ローンチの前、四半期ごとのキャパシティレビュー中、リソース使用率が
  上昇トレンドにある場合、または予算計画サイクルの前に使用する。
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
  tags: capacity-planning, forecasting, predict-linear, growth, headroom
---

# キャパシティプランニング

データ駆動型のキャパシティプランニングでリソースニーズを予測し、飽和を防ぐ。

## 使用タイミング

- 季節的なトラフィックスパイク（祝日、セールイベント）の前
- 新機能のローンチを計画するとき
- 四半期ごとのキャパシティレビュー中
- リソース使用率が上昇トレンドにある場合
- 予算計画サイクルの前

## 入力

- **必須**: 過去のメトリクス（CPU、メモリ、ディスク、ネットワーク、リクエスト/秒）
- **必須**: トレンド分析の時間範囲（最低4週間）
- **任意**: ビジネスの成長予測（ユーザー成長の見込み、機能ローンチ）
- **任意**: 予算の制約

## 手順

### ステップ1: 過去のメトリクスを収集する

主要なリソースメトリクスのためにPrometheusをクエリする：

```promql
# CPU usage trend over 8 weeks
avg(rate(node_cpu_seconds_total{mode!="idle"}[5m])) by (instance)

# Memory usage trend
avg(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) by (instance)

# Disk usage growth
avg(node_filesystem_size_bytes - node_filesystem_free_bytes) by (instance, device)

# Request rate growth
sum(rate(http_requests_total[5m])) by (service)

# Database connection pool usage
avg(db_connection_pool_used / db_connection_pool_max) by (instance)
```

分析のためにエクスポートする：

```bash
# Export 8 weeks of CPU data
curl -G 'http://prometheus:9090/api/v1/query_range' \
  --data-urlencode 'query=avg(rate(node_cpu_seconds_total{mode!="idle"}[5m])) by (instance)' \
  --data-urlencode 'start=2024-12-15T00:00:00Z' \
  --data-urlencode 'end=2025-02-09T00:00:00Z' \
  --data-urlencode 'step=1h' | jq '.data.result' > cpu_8weeks.json
```

**期待結果：** 大きなギャップのない各リソースのクリーンな時系列データ。

**失敗時：** データ欠損は予測精度を低下させる。メトリクスの保持とスクレイプ間隔を確認する。

### ステップ2: predict_linearで成長率を計算する

Prometheusの`predict_linear()`を使用して飽和を予測する：

```promql
# Predict when CPU will hit 80% (4 weeks ahead)
predict_linear(
  avg(rate(node_cpu_seconds_total{mode!="idle"}[5m]))[8w:],
  4*7*24*3600  # 4 weeks in seconds
) > 0.80

# Predict disk full date (8 weeks ahead)
predict_linear(
  avg(node_filesystem_size_bytes - node_filesystem_free_bytes)[8w:],
  8*7*24*3600
) > 0.95 * avg(node_filesystem_size_bytes)

# Predict memory pressure (2 weeks ahead)
predict_linear(
  avg(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes)[8w:],
  2*7*24*3600
) / avg(node_memory_MemTotal_bytes) > 0.90

# Predict request rate capacity breach (4 weeks ahead)
predict_linear(
  sum(rate(http_requests_total[5m]))[8w:],
  4*7*24*3600
) > 10000  # known capacity limit
```

予測ダッシュボードを作成する：

```json
{
  "dashboard": {
    "title": "Capacity Forecast",
    "panels": [
      {
        "title": "CPU Saturation Forecast (4 weeks)",
        "targets": [
          {
            "expr": "predict_linear(avg(rate(node_cpu_seconds_total{mode!=\"idle\"}[5m]))[8w:], 4*7*24*3600)",
            "legendFormat": "Predicted CPU"
          },
          {
            "expr": "0.80",
            "legendFormat": "Target Threshold (80%)"
          }
        ]
      },
      {
        "title": "Disk Full Date",
        "targets": [
          {
            "expr": "(avg(node_filesystem_size_bytes) - predict_linear(avg(node_filesystem_free_bytes)[8w:], 8*7*24*3600)) / avg(node_filesystem_size_bytes)",
            "legendFormat": "Predicted Usage %"
          }
        ]
      }
    ]
  }
}
```

**期待結果：** リソースがしきい値を超えるタイミングを示す明確な可視化。

**失敗時：** 予測が間違って見える場合（負の値、大幅な変動）、以下を確認する：
- 不十分な履歴（最低4週間必要）
- デプロイ、マイグレーションなどのステップスパイクがトレンドを歪めている
- 線形モデルで捉えられていない季節的なパターン

### ステップ3: 現在のヘッドルームを計算する

飽和前の安全マージンを決定する：

```promql
# CPU headroom (percentage remaining before 80% threshold)
(0.80 - avg(rate(node_cpu_seconds_total{mode!="idle"}[5m]))) / 0.80 * 100

# Memory headroom (bytes remaining before 90% usage)
avg(node_memory_MemAvailable_bytes) - (avg(node_memory_MemTotal_bytes) * 0.10)

# Request rate headroom (requests/sec before saturation)
10000 - sum(rate(http_requests_total[5m]))

# Time until saturation (weeks until CPU hits 80%)
(0.80 - avg(rate(node_cpu_seconds_total{mode!="idle"}[5m]))) /
  deriv(avg(rate(node_cpu_seconds_total{mode!="idle"}[5m]))[8w:]) /
  (7*24*3600)
```

ヘッドルームのサマリーレポートを作成する：

```bash
cat > capacity_headroom.md <<'EOF'
# Capacity Headroom Report (2025-02-09)

## Current Utilization
- **CPU**: 45% average (target: <80%)
- **Memory**: 62% (target: <90%)
- **Disk**: 71% (target: <95%)
- **Request Rate**: 4,200 req/s (capacity: 10,000)

## Headroom Analysis
- **CPU**: 35% headroom → ~12 weeks until saturation
- **Memory**: 28% headroom → ~16 weeks until saturation
- **Disk**: 24% headroom → ~8 weeks until full
- **Request Rate**: 5,800 req/s headroom → ~20 weeks until capacity

## Priority Actions
1. **Disk**: Implement log rotation or expand volume within 4 weeks
2. **CPU**: Plan horizontal scaling in next quarter
3. **Memory**: Monitor but no immediate action needed
EOF
```

**期待結果：** 飽和までの時間推定を含む各リソースの定量化されたヘッドルーム。

**失敗時：** ヘッドルームがすでにネガティブな場合は、リアクティブモードにある。即座のスケーリングが必要。

### ステップ4: 成長シナリオをモデル化する

ビジネス予測を考慮に入れる：

```python
# Example Python script for scenario modeling
import pandas as pd
import numpy as np

# Load historical data
df = pd.read_json('cpu_8weeks.json')

# Calculate weekly growth rate
growth_rate_weekly = df['value'].pct_change(periods=7).mean()

# Scenario 1: Current trend
weeks_ahead = 12
current_trend = df['value'].iloc[-1] * (1 + growth_rate_weekly) ** weeks_ahead

# Scenario 2: 2x user growth (marketing campaign)
accelerated_trend = df['value'].iloc[-1] * (1 + growth_rate_weekly * 2) ** weeks_ahead

# Scenario 3: New feature launch (+30% baseline)
feature_launch = (df['value'].iloc[-1] * 1.30) * (1 + growth_rate_weekly) ** weeks_ahead

print(f"Current Trend (12 weeks): {current_trend:.1%} CPU")
print(f"2x Growth Scenario: {accelerated_trend:.1%} CPU")
print(f"Feature Launch Scenario: {feature_launch:.1%} CPU")
print(f"Threshold: 80%")
```

**期待結果：** ビジネスの変化がキャパシティに与える影響を示す複数のシナリオ。

**失敗時：** シナリオがキャパシティを超える場合は、イベントの前にスケーリングを優先する。

### ステップ5: スケーリング推奨事項を生成する

アクション可能な推奨事項を作成する：

```markdown
## Capacity Scaling Plan

### Immediate Actions (Next 4 Weeks)
1. **Disk Expansion** [Priority: HIGH]
   - Current: 500GB, 71% used
   - Projected full date: 2025-04-01 (8 weeks)
   - Action: Expand to 1TB by 2025-03-15
   - Cost: $50/month additional
   - Justification: 5 weeks lead time needed

2. **Log Rotation Policy** [Priority: MEDIUM]
   - Current: Logs retained 90 days
   - Action: Reduce to 30 days, archive to S3
   - Savings: ~150GB disk space
   - Cost: $5/month S3 storage

### Near-Term Actions (Next Quarter)
3. **Horizontal Scaling - API Tier** [Priority: MEDIUM]
   - Current: 4 instances, 45% CPU
   - Projected: 65% CPU by 2025-05-01
   - Action: Add 2 instances (to 6 total)
   - Cost: $400/month
   - Trigger: When CPU avg exceeds 60% for 7 days

4. **Database Connection Pool** [Priority: LOW]
   - Current: 50 max connections, 40% used
   - Projected: 55% by Q3
   - Action: Increase to 75 in Q2
   - Cost: None (configuration change)

### Long-Term Planning (Next 6 Months)
5. **Migration to Auto-Scaling** [Priority: MEDIUM]
   - Current: Manual scaling
   - Action: Implement Kubernetes HPA (Horizontal Pod Autoscaler)
   - Timeline: Q3 2025
   - Benefit: Automatic response to load spikes
```

**期待結果：** コスト、タイムライン、トリガー条件を含む優先順位付きリスト。

**失敗時：** コストを理由に推奨事項が却下される場合は、しきい値を再検討するかリスクを受け入れる。

### ステップ6: キャパシティアラートを設定する

低ヘッドルームのアラートを作成する：

```yaml
# capacity_alerts.yml
groups:
  - name: capacity
    interval: 1h
    rules:
      - alert: CPUCapacityLow
        expr: |
          (0.80 - avg(rate(node_cpu_seconds_total{mode!="idle"}[5m]))) / 0.80 < 0.20
        for: 24h
        labels:
          severity: warning
        annotations:
          summary: "CPU headroom below 20%"
          description: "Current CPU headroom: {{ $value | humanizePercentage }}. Scaling needed within 4 weeks."

      - alert: DiskFillForecast
        expr: |
          predict_linear(avg(node_filesystem_free_bytes)[8w:], 4*7*24*3600) < 0.10 * avg(node_filesystem_size_bytes)
        for: 1h
        labels:
          severity: warning
        annotations:
          summary: "Disk projected to fill within 4 weeks"
          description: "Expand disk volume soon."

      - alert: MemoryCapacityLow
        expr: |
          avg(node_memory_MemAvailable_bytes) < 0.15 * avg(node_memory_MemTotal_bytes)
        for: 6h
        labels:
          severity: warning
        annotations:
          summary: "Memory headroom below 15%"
```

**期待結果：** 飽和前にアラートが発火し、プロアクティブにスケールする時間を与える。

**失敗時：** アラートが頻繁に発火する（アラート疲れ）または遅すぎる（リアクティブな混乱）場合はしきい値を調整する。

## バリデーション

- [ ] 過去のメトリクスが少なくとも8週間をカバーしている
- [ ] `predict_linear()`クエリが合理的な予測を返す（負の値がない）
- [ ] すべての重要なリソースのヘッドルームが計算されている
- [ ] 成長シナリオにビジネス予測が含まれている
- [ ] スケーリング推奨事項にコストとタイムラインがある
- [ ] キャパシティアラートが設定されてテストされている
- [ ] レポートがエンジニアリングリーダーシップと財務部門でレビューされた

## よくある落とし穴

- **不十分な履歴**: 線形予測には4週間以上のデータが必要。それ以下では予測が信頼できない。
- **ステップ変化の無視**: デプロイ、マイグレーション、機能ローンチはトレンドを歪めるスパイクを生む。フィルタリングするかアノテーションを付ける。
- **線形の前提**: すべての成長が線形ではない。指数的な成長（バイラル製品）には異なるモデルが必要。
- **リードタイムの忘却**: クラウドのプロビジョニングは速いが、調達、予算、マイグレーションには週単位の時間がかかる。早めに計画する。
- **予算の調整なし**: 予算の承認なしのキャパシティプランニングは土壇場の混乱につながる。財務部門を早期に関与させる。

## 関連スキル

- `setup-prometheus-monitoring` - キャパシティプランニングに使用するメトリクスを収集する
- `build-grafana-dashboards` - 予測とヘッドルームを可視化する
- `optimize-cloud-costs` - コスト最適化とキャパシティプランニングのバランスを取る
