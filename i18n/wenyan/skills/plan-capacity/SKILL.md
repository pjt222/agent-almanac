---
name: plan-capacity
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  以歷史指標與增長模型行容量謀劃。用 predict_linear 預測、識資源之制、
  算餘地、薦於飽和前擴縮之動。當季性流量峰、新品發布、季度容量檢、
  資源用量上升、或預算謀劃週期之前用之。
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

# 容量謀劃

以數據驅動之容量謀劃預資源所需，防飽和。

## 用時

- 季性流量峰前（節慶、促銷）
- 新功能發布謀劃時
- 季度容量檢時
- 資源用量上升時
- 預算謀劃週期之前

## 入

- **必要**：歷史指標（CPU、記憶體、磁碟、網路、每秒請求）
- **必要**：趨勢分析之時域（最少 4 週）
- **可選**：業務增長預測（預期用戶增長、功能發布）
- **可選**：預算之制

## 法

### 第一步：採歷史指標

對 Prometheus 查關鍵資源指標：

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

匯出以分析：

```bash
# Export 8 weeks of CPU data
curl -G 'http://prometheus:9090/api/v1/query_range' \
  --data-urlencode 'query=avg(rate(node_cpu_seconds_total{mode!="idle"}[5m])) by (instance)' \
  --data-urlencode 'start=2024-12-15T00:00:00Z' \
  --data-urlencode 'end=2025-02-09T00:00:00Z' \
  --data-urlencode 'step=1h' | jq '.data.result' > cpu_8weeks.json
```

得：諸資源之乾淨時間序列數據，無大缺。

敗則：缺數據減預測之準。察指標保留與抓取間隔。

### 第二步：以 predict_linear 算增長率

用 Prometheus 之 `predict_linear()` 預飽和：

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

立預測儀表板：

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

得：清晰之圖示，現資源何時將越閾。

敗則：若預測有誤（負值、巨擺），察：
- 歷史不足（最少 4 週）
- 階躍峰（部署、遷移）扭曲趨勢
- 季性模式線性模型未能捕

### 第三步：算當前餘地

定飽和前之安全餘：

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

立餘地總覽報告：

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

得：諸資源量化之餘地，附飽和時估。

敗則：若餘地已負，已陷被動。即時擴縮所需。

### 第四步：模型增長情境

納業務預測：

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

得：諸情境示業務變對容量之影響。

敗則：若情境逾容量，事前優先擴縮。

### 第五步：生擴縮之薦

立可行之薦：

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

得：附費、時程、觸發條件之優先列。

敗則：若薦因費被拒，重檢閾或受險。

### 第六步：設容量警

立低餘地之警：

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

得：警於飽和前發，留時主動擴縮。

敗則：若警頻發（警疲）或太晚（被動奔走），調閾。

## 驗

- [ ] 歷史指標至少涵 8 週
- [ ] `predict_linear()` 查返合理之預測（無負值）
- [ ] 諸關鍵資源之餘地皆算
- [ ] 增長情境含業務預測
- [ ] 擴縮之薦附費與時程
- [ ] 容量警已設且測
- [ ] 報告與工程領導及財務共審

## 陷

- **歷史不足**：線性預測需 4+ 週數據。少於此者，預測不可靠。
- **忽階躍變**：部署、遷移、功能發布致峰扭曲趨勢。濾之或註之。
- **線性之假**：非皆線性增長。指數增長（病毒式產品）需異模型。
- **忘前置時**：雲供給雖速，採購、預算、遷移需週。早謀。
- **無預算對齊**：容量謀劃無預算之認，致末刻奔走。早納財務。

## 參

- `setup-prometheus-monitoring` — 採容量謀劃所用之指標
- `build-grafana-dashboards` — 視覺化預測與餘地
- `optimize-cloud-costs` — 平衡容量謀劃與費優化
