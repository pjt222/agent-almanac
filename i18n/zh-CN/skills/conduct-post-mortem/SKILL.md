---
name: conduct-post-mortem
description: >
  在事故发生后开展无责备后复盘分析。构建时间线重建、识别促成因素、
  并生成可操作的改进措施。专注于系统性问题而非个人责任。适用于任何生产事故或服务降级之后、
  险情发生后、调查反复出现的问题，或向跨团队分享系统性经验教训。
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
  complexity: basic
  language: multi
  tags: post-mortem, incident-review, blameless, timeline, action-items
---

# Conduct Post-Mortem

主导无责备后复盘，从事故中学习并提升系统韧性。

## 适用场景

- 任何生产事故或服务降级之后
- 险情或危机发生后
- 调查反复出现的问题时
- 向跨团队分享经验教训

## 输入

- **必填**：事故详情（开始/结束时间、受影响服务、严重程度）
- **必填**：事故窗口期间的日志、指标和告警访问权限
- **可选**：事故响应期间使用的运行手册
- **可选**：通信日志（Slack、PagerDuty）

## 步骤

### 第 1 步：收集原始数据

收集事故的所有相关产物：

```bash
# Export relevant logs (adjust timerange)
kubectl logs deployment/api-service \
  --since-time="2025-02-09T10:00:00Z" \
  --until-time="2025-02-09T11:30:00Z" > incident-logs.txt

# Export Prometheus metrics snapshot
curl -G 'http://prometheus:9090/api/v1/query_range' \
  --data-urlencode 'query=rate(http_requests_total{job="api"}[5m])' \
  --data-urlencode 'start=2025-02-09T10:00:00Z' \
  --data-urlencode 'end=2025-02-09T11:30:00Z' \
  --data-urlencode 'step=15s' > metrics.json

# Export alert history
amtool alert query --within=2h alertname="HighErrorRate" --output json > alerts.json
```

**预期结果：** 覆盖完整事故时间线的日志、指标和告警。

**失败处理：** 如果数据不完整，在报告中记录缺口。为下次建立更长的保留期。

### 第 2 步：构建时间线

创建按时间顺序的重建：

```markdown
## Timeline (all times UTC)

| Time     | Event | Source | Actor |
|----------|-------|--------|-------|
| 10:05:23 | First 5xx errors appear | nginx access logs | - |
| 10:06:45 | High error rate alert fires | Prometheus | - |
| 10:08:12 | On-call engineer paged | PagerDuty | System |
| 10:12:00 | Engineer acknowledges alert | PagerDuty | @alice |
| 10:15:30 | Database connection pool exhausted | app logs | - |
| 10:18:45 | Database queries identified as slow | pganalyze | @alice |
| 10:22:10 | Cache layer deployed as mitigation | kubectl | @alice |
| 10:35:00 | Error rate returns to normal | Prometheus | - |
| 10:40:00 | Incident marked resolved | PagerDuty | @alice |
```

**预期结果：** 清晰的分钟级序列，展示发生了什么以及何时发生。

**失败处理：** 时间戳不匹配。确保所有系统使用 NTP 并以 UTC 记录日志。

### 第 3 步：识别促成因素

使用五个为什么或鱼骨分析：

```markdown
## Contributing Factors

### Immediate Cause
- Database connection pool exhausted (max 20 connections)
- Query introduced in v2.3.0 deployment lacked index

### Contributing Factors
1. **Monitoring Gap**: Connection pool utilization not monitored
2. **Testing Gap**: Load testing didn't include new query pattern
3. **Runbook Gap**: No documented procedure for DB connection issues
4. **Capacity Planning**: Pool size unchanged despite 3x traffic growth

### Systemic Issues
- No pre-deployment query plan review
- Database alerts only fire on total failure, not degradation
```

**预期结果：** 识别出多层次因果关系，避免指责。

**失败处理：** 如果分析停留在"工程师犯了错误"，继续深挖。是什么允许了这个错误发生？

### 第 4 步：生成行动项

创建具体且可追踪的改进措施：

```markdown
## Action Items

| ID | Action | Owner | Deadline | Priority |
|----|--------|-------|----------|----------|
| AI-001 | Add connection pool metrics to Grafana | @bob | 2025-02-16 | High |
| AI-002 | Create runbook: DB connection saturation | @alice | 2025-02-20 | High |
| AI-003 | Add DB query plan check to CI/CD | @charlie | 2025-03-01 | Medium |
| AI-004 | Review and adjust connection pool size | @dan | 2025-02-14 | High |
| AI-005 | Implement DB slow query alerts (<100ms) | @bob | 2025-02-23 | Medium |
| AI-006 | Add load testing for new query patterns | @charlie | 2025-03-15 | Low |
```

**预期结果：** 每个行动项都有负责人、截止日期和明确的交付物。

**失败处理：** "改善测试"之类的模糊行动项不会被执行。要具体明确。

### 第 5 步：撰写并分发报告

使用如下模板结构：

```markdown
# Post-Mortem: API Service Degradation (2025-02-09)

**Date**: 2025-02-09
**Duration**: 1h 35min (10:05 - 11:40 UTC)
**Severity**: P1 (Critical service degraded)
**Authors**: @alice, @bob
**Reviewed**: 2025-02-10

## Summary
The API service experienced elevated error rates (40% of requests) due to
database connection pool exhaustion. Service was restored by deploying a
cache layer. No data loss occurred.

## Impact
- 40,000 failed requests over 1.5 hours
- 2,000 customers affected
- Revenue impact: ~$5,000 (estimated)

## Root Cause
Query introduced in v2.3.0 deployment performed a full table scan due to
missing index. Under increased load, this saturated the connection pool.

[... timeline, contributing factors, action items as above ...]

## What Went Well
- Alert fired within 90 seconds of first errors
- Mitigation deployed quickly (10 minutes from page to fix)
- Communication to customers was clear and timely

## Lessons Learned
- Database monitoring is insufficient; need connection-level metrics
- Load testing must cover new query patterns, not just volume
- Connection pool sizing hasn't kept pace with traffic growth

## Prevention
See Action Items above.
```

**预期结果：** 报告在事故发生后 48 小时内与团队和利益相关方共享。

**失败处理：** 如果报告延迟超过 1 周，洞察会变得陈旧。优先处理后复盘。

### 第 6 步：在站会/回顾中审查行动项

追踪行动项进度：

```bash
# Create GitHub issues from action items
gh issue create --title "AI-001: Add connection pool metrics" \
  --body "From post-mortem PM-2025-02-09. Owner: @bob. Deadline: 2025-02-16" \
  --label "post-mortem,observability" \
  --assignee bob

# Set up recurring reminder
# Add to team calendar: Weekly review of open post-mortem items
```

**预期结果：** 行动项在项目管理工具中追踪，每周审查。

**失败处理：** 如果行动项长期搁置，事故将重演。为高优先级事项指定高管赞助人。

## 验证清单

- [ ] 时间线完整且按时间顺序准确
- [ ] 识别出多个促成因素（不仅仅是一个）
- [ ] 行动项有负责人、截止日期和优先级
- [ ] 报告使用无责备语言（不含"X 导致了问题"）
- [ ] 报告在 48 小时内分发给所有利益相关方
- [ ] 行动项在工单系统中追踪
- [ ] 已安排 4 周后的跟进审查

## 常见问题

- **责备文化**：使用"谁"的语言而非"什么/为什么"。专注于系统，而非个人。
- **浅层分析**：停留在第一个原因就不再深究。始终至少问五次"为什么"。
- **模糊的行动项**："改善监控"不可操作。"在 Z 日期前将指标 X 添加到仪表板 Y"才可操作。
- **没有跟进**：行动项创建后从不审查。设置日历提醒。
- **透明度恐惧**：隐藏事故会减少学习机会。广泛分享（在适当的安全边界内）。

## 相关技能

- `write-incident-runbook` - 创建事故期间引用的运行手册
- `configure-alerting-rules` - 根据后复盘发现改善告警
