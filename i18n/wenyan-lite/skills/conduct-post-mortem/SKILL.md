---
name: conduct-post-mortem
locale: wenyan-lite
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

# 行事後檢討

領無咎之事後檢討，自事件中學並增系統韌性。

## 適用時機

- 任何生產事件或服務退化之後
- 險情或險之事後
- 調查屢現問題時
- 跨團隊分享學到者

## 輸入

- **必要**：事件細節（起訖時、受影響服務、嚴重度）
- **必要**：事件時段之日誌、指標、告警之存取
- **選擇性**：事件應對所用之 runbook
- **選擇性**：通訊日誌（Slack、PagerDuty）

## 步驟

### 步驟一：集原始數據

集事件之所有產物：

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

**預期：** 日誌、指標、告警涵全事件時線。

**失敗時：** 若數據不全，於報中註缺口。下次設更長之保留期。

### 步驟二：建時線

作按時序之重構：

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

**預期：** 分鐘至分鐘之清晰序，示何事何時發。

**失敗時：** 時戳不合。確所有系統用 NTP 且以 UTC 記。

### 步驟三：識貢獻因

用五問法或魚骨分析：

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

**預期：** 多層因果已辨，避咎。

**失敗時：** 若分析止於「某工程師失誤」，深掘。何者容此失誤？

### 步驟四：生行動項

作具體、可追之改進：

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

**預期：** 每行動有所有人、期限、清晰交付物。

**失敗時：** 含糊之行動如「改進測試」不會為之。求具體。

### 步驟五：寫報並發

用此模板結構：

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

**預期：** 報於事件 48 時內與團隊與關係人分享。

**失敗時：** 若報延超一週，見解陳。優先處事後檢討。

### 步驟六：於立會/回顧中審行動項

追行動項之進：

```bash
# Create GitHub issues from action items
gh issue create --title "AI-001: Add connection pool metrics" \
  --body "From post-mortem PM-2025-02-09. Owner: @bob. Deadline: 2025-02-16" \
  --label "post-mortem,observability" \
  --assignee bob

# Set up recurring reminder
# Add to team calendar: Weekly review of open post-mortem items
```

**預期：** 行動項於項目管理工具追蹤，每週審。

**失敗時：** 若行動項停滯，事件必再現。為高優項指派高管保薦者。

## 驗證

- [ ] 時線完整且按時序準
- [ ] 多貢獻因已辨（非僅其一）
- [ ] 行動項有所有人、期限、優先級
- [ ] 報用無咎語（無「X 致此患」）
- [ ] 報於 48 時內發予所有關係人
- [ ] 行動項於工單系統追蹤
- [ ] 後續審已排於四週後

## 常見陷阱

- **咎責文化**：用「誰」代「何/為何」。專於系統，非人
- **淺分析**：止於首因。總問「為何」至少五次
- **含糊行動項**：「改進監控」不可行。「於日 Z 前將指標 X 加入儀表板 Y」可行
- **無後續**：行動項生而從未審。設日曆提醒
- **畏透明**：藏事件減學習。廣傳（於適當安全邊界內）

## 相關技能

- `write-incident-runbook` — 建事件應對中引用之 runbook
- `configure-alerting-rules` — 據事後檢討發現改進告警
