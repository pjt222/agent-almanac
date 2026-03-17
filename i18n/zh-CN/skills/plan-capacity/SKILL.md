---
name: plan-capacity
description: >
  使用历史指标和增长模型进行容量规划。使用 predict_linear 进行预测、
  识别资源瓶颈、计算余量，并在达到饱和前推荐扩容操作。适用于季节性流量高峰或
  产品发布前、季度容量审查期间、资源利用率呈上升趋势时，或预算规划周期前。
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
  tags: capacity-planning, forecasting, predict-linear, growth, headroom
---

# Plan Capacity

通过数据驱动的容量规划预测资源需求并防止饱和。

## 适用场景

- 季节性流量高峰前（节假日、促销活动）
- 规划新功能发布时
- 季度容量审查期间
- 资源利用率呈上升趋势时
- 预算规划周期前

## 输入

- **必填**：历史指标（CPU、内存、磁盘、网络、每秒请求数）
- **必填**：趋势分析时间范围（最少 4 周）
- **可选**：业务增长预测（预期用户增长、功能发布）
- **可选**：预算约束

## 步骤

### 第 1 步：收集历史指标

查询 Prometheus 获取关键资源指标：

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

导出以供分析：

```bash
# Export 8 weeks of CPU data
curl -G 'http://prometheus:9090/api/v1/query_range' \
  --data-urlencode 'query=avg(rate(node_cpu_seconds_total{mode!="idle"}[5m])) by (instance)' \
  --data-urlencode 'start=2024-12-15T00:00:00Z' \
  --data-urlencode 'end=2025-02-09T00:00:00Z' \
  --data-urlencode 'step=1h' | jq '.data.result' > cpu_8weeks.json
```

**预期结果：** 每个资源的清洁时间序列数据，无大量缺口。

**失败处理：** 数据缺失会降低预测准确性。检查指标保留期和抓取间隔。

### 第 2 步：使用 predict_linear 计算增长率

使用 Prometheus 的 `predict_linear()` 预测饱和时间：

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

创建预测仪表板：

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

**预期结果：** 清晰可视化，显示资源何时将突破阈值。

**失败处理：** 如果预测看起来错误（负值、剧烈波动），检查：
- 历史数据不足（需要最少 4 周）
- 部署、迁移等导致的阶跃变化扭曲趋势
- 线性模型未捕获的季节性模式

### 第 3 步：计算当前余量

确定饱和前的安全余量：

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

创建余量摘要报告：

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

**预期结果：** 每个资源的量化余量，包含饱和时间估算。

**失败处理：** 如果余量已经为负，则处于响应式模式。需要立即扩容。

### 第 4 步：建立增长场景模型

将业务预测纳入考量：

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

**预期结果：** 多个场景显示业务变化对容量的影响。

**失败处理：** 如果场景超出容量，在事件发生前优先扩容。

### 第 5 步：生成扩容建议

创建可操作的建议：

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

**预期结果：** 优先列表，包含成本、时间线和触发条件。

**失败处理：** 如果建议因成本被拒绝，重新审视阈值或接受风险。

### 第 6 步：设置容量告警

为低余量创建告警：

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

**预期结果：** 告警在饱和前触发，留出主动扩容的时间。

**失败处理：** 如果告警触发过于频繁（告警疲劳）或过晚（被动应急），调整阈值。

## 验证清单

- [ ] 历史指标覆盖至少 8 周
- [ ] `predict_linear()` 查询返回合理的预测（无负值）
- [ ] 为所有关键资源计算了余量
- [ ] 增长场景包含业务预测
- [ ] 扩容建议包含成本和时间线
- [ ] 容量告警已配置和测试
- [ ] 报告已与工程领导和财务团队审查

## 常见问题

- **历史数据不足**：线性预测需要 4 周以上数据。数据不足时，预测不可靠。
- **忽略阶跃变化**：部署、迁移或功能发布会产生扭曲趋势的峰值。过滤或添加注解。
- **线性假设**：并非所有增长都是线性的。指数增长（病毒式产品）需要不同的模型。
- **忘记交付时间**：云端配置很快，但采购、预算和迁移需要数周。提前规划。
- **没有预算对齐**：没有预算支持的容量规划会导致最后时刻的手忙脚乱。尽早让财务参与。

## 相关技能

- `setup-prometheus-monitoring` - 收集用于容量规划的指标
- `build-grafana-dashboards` - 可视化预测和余量
- `optimize-cloud-costs` - 平衡容量规划与成本优化
