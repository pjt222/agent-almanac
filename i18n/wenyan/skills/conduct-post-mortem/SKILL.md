---
name: conduct-post-mortem
locale: wenyan
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

# 行事後之審

引無責事後之審以學於事且增系之韌。

## 用時

- 產境有事或服降之後
- 近失或險過之後
- 察重現之問時
- 跨團共所學

## 入

- **必**：事詳（起止時、受影之服、重）
- **必**：事窗中誌、量、警之訪
- **可選**：事中所用之行冊
- **可選**：通誌（Slack、PagerDuty）

## 法

### 第一步：收原資

聚事之諸品：

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

**得：** 誌、量、警涵全事線。

**敗則：** 資不全則注缺於報。下次設更長之留。

### 第二步：建時線

生時序之復：

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

**得：** 明分分之序示何事於何時。

**敗則：** 時戳不合。確諸系用 NTP 而誌 UTC。

### 第三步：識助因

用五何或魚骨之析：

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

**得：** 多層因已識而無責。

**敗則：** 若析止於「工師誤」，深掘。何令此誤發？

### 第四步：生行項

立具體可追之改：

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

**得：** 每行有主、期、明產。

**敗則：** 含糊如「改測」不行。宜具體。

### 第五步：書而分報

用此範構：

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

**得：** 報於事後四十八時內分於團與相關。

**敗則：** 若報遲逾一週，見解將陳。先於事後之審。

### 第六步：於日會/回顧察行項

追行項之進：

```bash
# Create GitHub issues from action items
gh issue create --title "AI-001: Add connection pool metrics" \
  --body "From post-mortem PM-2025-02-09. Owner: @bob. Deadline: 2025-02-16" \
  --label "post-mortem,observability" \
  --assignee bob

# Set up recurring reminder
# Add to team calendar: Weekly review of open post-mortem items
```

**得：** 行項追於項目管具，週察之。

**敗則：** 若行項荒，事必重。為高危項命執助。

## 驗

- [ ] 時線全且時序準
- [ ] 多助因已識（非一）
- [ ] 行項有主、期、先
- [ ] 報用無責之言（無「X 致此問」）
- [ ] 報於四十八時內分於諸相關
- [ ] 行項追於票系
- [ ] 四週後之察已排

## 陷

- **責之文**：用「誰」而非「何/因」之言。專於系，非人。
- **淺析**：止於初因。必問「因」至少五次。
- **含糊行項**：「改察」非可行。「於日 Z 加量 X 於板 Y」乃可行。
- **不隨**：行項建而不察。設日曆之提。
- **畏明**：匿事減學。廣分（於合安界內）。

## 參

- `write-incident-runbook` - 建事中所引之行冊
- `configure-alerting-rules` - 依事後之得改警
