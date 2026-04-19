---
name: conduct-post-mortem
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Conduct a blameless post-mortem analysis after an incident. Build timeline
  reconstruction, identify contributing factors, and generate actionable
  improvements. Focus on systemic issues rather than individual blame. Use
  after any production incident or service degradation, following a near-miss,
  when investigating recurring issues, or to share systemic learnings across
  teams.
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

# 行事後

導無責事後以學事且增系韌。

## 用

- 生產事故或服退後
- 近錯之後
- 查復現事
- 跨組傳學

## 入

- **必**：事故詳（始終時、所影服、嚴）
- **必**：事窗間之日誌、度、警之取
- **可**：事中所用 runbook
- **可**：通信日誌（Slack、PagerDuty）

## 行

### 一：集原始數據

聚事諸構件：

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

**得：** 日誌、度、警覆全事時。

**敗：** 數據不全→於報注缺。下次設更長留期。

### 二：建時線

按序重建：

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

**得：** 明、分分之序示何時何事。

**敗：** 時戳不合→確諸系用 NTP 且 UTC 日誌。

### 三：識貢因

用五何或魚骨析：

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

**得：** 多層因已識，避責。

**敗：** 析止於「工程師誤」→深挖。何使誤可發？

### 四：生動作項

建具可追之改：

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

**得：** 每項有主、期、明交付。

**敗：** 泛動作如「改測」不行。具體為宜。

### 五：寫與發報

用此模：

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

**得：** 報於事後 48 時內發至組與干係人。

**敗：** 報遲逾 1 週→學失鮮。優先事後。

### 六：於 standup/retro 察動作

追動作進：

```bash
# Create GitHub issues from action items
gh issue create --title "AI-001: Add connection pool metrics" \
  --body "From post-mortem PM-2025-02-09. Owner: @bob. Deadline: 2025-02-16" \
  --label "post-mortem,observability" \
  --assignee bob

# Set up recurring reminder
# Add to team calendar: Weekly review of open post-mortem items
```

**得：** 動作追於項管具，每週察。

**敗：** 動作懈→事復。高優項派主管。

## 驗

- [ ] 時線全且序準
- [ ] 多貢因已識（非只一）
- [ ] 動作有主、期、優
- [ ] 報用無責語（無「X 致之」）
- [ ] 報於 48 時內發諸干係人
- [ ] 動作追於票系
- [ ] 4 週後察已排

## 忌

- **責文化**：用「誰」語非「何/因」。焦系非人。
- **淺析**：止於首因。必問「因」至少五次。
- **泛動作**：「改監」非可為。「於某日加度 X 於板 Y」為宜。
- **無隨進**：動作生而未察。設日曆提。
- **懼透明**：藏事減學。廣分（守安界）。

## 參

- `write-incident-runbook` — 事中所引 runbook 之建
- `configure-alerting-rules` — 依事後發現改警
