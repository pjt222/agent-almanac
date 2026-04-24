---
name: design-on-call-rotation
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Design sustainable on-call rotations with balanced schedules, clear
  escalation policies, fatigue management, and handoff procedures. Minimize
  burnout while maintaining incident response coverage. Use when setting up
  on-call for the first time, scaling a team from 2-3 to 5+ engineers,
  addressing on-call burnout or alert fatigue, improving incident response
  times, or after a post-mortem identifies handoff issues.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: observability
  complexity: basic
  language: multi
  tags: on-call, rotation, escalation, fatigue-management, handoff

---

# 設值班輪

立可持值班表，衡蓋與工員之寧。

## 用

- 首立值班
- 隊由 2-3 擴至 5+ 工員
- 處值班倦或警疲
- 改事件應時
- 檢後察現交接患

## 入

- **必**：隊員數及時區
- **必**：服 SLA 求（應時、蓋時）
- **可**：史事量與時
- **可**：值班償預
- **可**：既值班具（PagerDuty、Opsgenie）

## 行

### 一：定輪表

依隊員數擇輪長：

```markdown
## Rotation Models

### Weekly Rotation (5+ person team)
- **Length**: 7 days (Monday 09:00 to Monday 09:00)
- **Pros**: Predictable, easy to plan around
- **Cons**: Whole week disrupted if alerts are frequent

### 12-Hour Split (3-4 person team)
- **Day shift**: 08:00-20:00 local time
- **Night shift**: 20:00-08:00 local time
- **Pros**: Shared burden, night coverage paid differently
- **Cons**: More handoffs, coordination needed

### Follow-the-Sun (Global team)
- **APAC**: 00:00-08:00 UTC
- **EMEA**: 08:00-16:00 UTC
- **Americas**: 16:00-00:00 UTC
- **Pros**: No night shifts, timezone-aligned
- **Cons**: Requires distributed team

### Two-Tier (Senior/Junior split)
- **Primary**: Junior engineers (first responder)
- **Secondary**: Senior engineers (escalation)
- **Pros**: Training opportunity, lighter senior load
- **Cons**: Risk of junior burnout
```

5 人隊表例：

```
Week 1: Alice (Primary), Bob (Secondary)
Week 2: Charlie (Primary), Diana (Secondary)
Week 3: Eve (Primary), Alice (Secondary)
Week 4: Bob (Primary), Charlie (Secondary)
Week 5: Diana (Primary), Eve (Secondary)
```

得：表公輪並供 24/7 蓋。

敗：蓋有隙→加員或減 SLA 僅為工時。

### 二：配升級策

於 PagerDuty/Opsgenie 設層升：

```yaml
# PagerDuty escalation policy (YAML representation)
escalation_policy:
  name: "Production Services"
  repeat_enabled: true
  num_loops: 3

  escalation_rules:
    - id: primary
      escalation_delay_in_minutes: 0
      targets:
        - type: schedule
          id: primary_on_call_schedule

    - id: secondary
      escalation_delay_in_minutes: 15
      targets:
        - type: schedule
          id: secondary_on_call_schedule

    - id: manager
      escalation_delay_in_minutes: 30
      targets:
        - type: user
          id: engineering_manager
```

立升級圖：

```
Alert Fires
    ↓
Primary On-Call Paged
    ↓
Wait 15 minutes (no ack)
    ↓
Secondary On-Call Paged
    ↓
Wait 15 minutes (no ack)
    ↓
Manager Paged
    ↓
Repeat cycle (max 3 times)
```

得：升路明含合理延。

敗：升過頻→縮應窗或查警質。

### 三：定交接程

立結構交接單：

```markdown
## On-Call Handoff Checklist

### Outgoing On-Call
- [ ] Update incident log with any ongoing issues
- [ ] Document any workarounds or known issues
- [ ] Share any alerts that are "noisy but safe to ignore" temporarily
- [ ] Note any upcoming deploys or maintenance windows
- [ ] Provide context on any flapping alerts

### Incoming On-Call
- [ ] Review incident log from previous shift
- [ ] Check for any ongoing incidents
- [ ] Verify PagerDuty/Opsgenie has correct contact info
- [ ] Test alert delivery (send test page to yourself)
- [ ] Review recent deploys and release notes
- [ ] Check capacity metrics for any concerning trends

### Handoff Meeting (15 min)
- Review any incidents from past week
- Discuss any changes to systems or runbooks
- Questions and clarifications
```

動交接提醒：

```bash
# Slack reminder script
curl -X POST https://slack.com/api/chat.postMessage \
  -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "#on-call",
    "text": "On-call handoff in 1 hour. Outgoing: @alice, Incoming: @bob. Please use the handoff checklist: https://wiki.company.com/oncall-handoff"
  }'
```

得：知轉順，班間無訊失。

敗：事復因入者不知繞法→令交接必行。

### 四：施倦管

設規以防倦：

```markdown
## Fatigue Prevention Rules

### Alert Volume Limits
- **Threshold**: Max 5 pages per night (22:00-06:00)
- **Action**: If exceeded, trigger incident review next day
- **Goal**: Reduce noisy alerts that disrupt sleep

### Time Off After Major Incident
- **Rule**: If on-call handles P1 incident >2 hours overnight, they get comp time
- **Amount**: Equal to incident duration (e.g., 3-hour incident = 3 hours off)
- **Scheduling**: Must be taken within 2 weeks

### Maximum Consecutive Weeks
- **Limit**: No more than 2 consecutive weeks on-call
- **Reason**: Prevents exhaustion from extended coverage

### Minimum Rest Between Rotations
- **Cooldown**: At least 2 weeks between primary rotations
- **Exception**: Emergency coverage (requires manager approval)

### Vacation Protection
- **Rule**: No on-call during scheduled vacation
- **Process**: Mark as "Out of Office" in PagerDuty 2 weeks in advance
- **Swap**: Coordinate swap with team, update schedule
```

追警疲量：

```promql
# Alerts per on-call engineer per week
count(ALERTS{alertstate="firing"}) by (oncall_engineer)

# Nighttime pages (22:00-06:00 local)
count(ALERTS{alertstate="firing", hour_of_day>=22 or hour_of_day<6})

# Time to acknowledge (should be <5 min during business hours)
histogram_quantile(0.95, rate(alert_ack_duration_seconds_bucket[7d]))
```

得：值班負可持，工員不長倦。

敗：守規而倦仍生→減警量或聘更多工員。

### 五：書運行手冊及升級聯

立值班速參：

```markdown
# On-Call Quick Reference

## Emergency Contacts
- **Engineering Manager**: Alice Smith, +1-555-0100
- **CTO**: Bob Johnson, +1-555-0200
- **Security Team**: security@company.com, +1-555-0300
- **Cloud Provider Support**: AWS Support Case Portal

## Common Runbooks
- [Database Connection Pool Exhaustion](https://wiki/runbook-db-pool)
- [High API Latency](https://wiki/runbook-api-latency)
- [Disk Space Full](https://wiki/runbook-disk-full)
- [SSL Certificate Expiration](https://wiki/runbook-ssl-renewal)

## Access & Credentials
- **Production AWS**: SSO via company.okta.com
- **Kubernetes**: `kubectl --context production`
- **Database**: Read-only access via Bastion host
- **Secrets**: 1Password vault "On-Call Production"

## Escalation Decision Tree
- **P1 (Service Down)**: Immediate response, escalate to manager after 30min
- **P2 (Degraded)**: Response within 15min, escalate if not resolved in 1 hour
- **P3 (Warning)**: Acknowledge, resolve during business hours
- **Security Incident**: Immediately escalate to Security Team, don't investigate alone
```

得：值班員 < 2 分內得所需訊。

敗：工員屢問「X 在何」→集中書。

### 六：排值班復盤

月省值班經：

```markdown
## On-Call Retrospective Agenda (Monthly)

### Metrics Review (15 min)
- Total alerts: [X] (target: <50/week)
- Nighttime pages: [Y] (target: <5/week)
- Mean time to acknowledge: [Z] (target: <5 min)
- Incidents by severity: P1: [A], P2: [B], P3: [C]

### Qualitative Feedback (20 min)
- What was the most challenging incident?
- Which alerts were noisy/low-value?
- Were runbooks helpful? Which need updates?
- Any gaps in monitoring or alerting?

### Action Items (10 min)
- Fix noisy alerts identified
- Update runbooks that were incomplete
- Adjust rotation schedule if needed
- Plan alert tuning work

### Recognition (5 min)
- Shout-outs for excellent incident response
- Share learnings from interesting incidents
```

追改進：

```bash
# Generate monthly on-call report
cat > oncall_report_2025-02.md <<EOF
# On-Call Report: February 2025

## Key Metrics
- **Total Alerts**: 38 (down from 52 in January)
- **Nighttime Pages**: 4 (within target)
- **P1 Incidents**: 1 (database outage, 45min MTTR)
- **P2 Incidents**: 3 (all resolved <1 hour)

## Improvements Made
- Tuned CPU alert threshold (reduced false positives by 40%)
- Added runbook for Redis cache failures
- Implemented log rotation (prevented disk full alerts)

## Upcoming Changes
- Migrate to follow-the-sun rotation (Q2)
- Add Slack alert integration (in progress)
EOF
```

得：值班經月月進，警量漸減。

敗：量不進→升至首領→或宜暫停功作以治運患。

## 驗

- [ ] 輪表蓋諸求時（24/7 或工時）
- [ ] 升級策已試（發試警）
- [ ] 交接程已書並示隊
- [ ] 倦管規已編
- [ ] 值班速參全且可訪
- [ ] 月復盤已排
- [ ] 值班償已批（若適）

## 忌

- **工員過少**：3 以下→每 2-3 週值班，不可持→週輪最少 5
- **無升級延**：即升首領廢高級時→給主 15 分應
- **略交接**：脈絡未轉致重誤→令交接必行
- **略警疲**：工員因噪略警→關鍵患失→激調
- **無償**：無酬或補休之值班致恨→備預

## 參

- `configure-alerting-rules`
- `write-incident-runbook`
