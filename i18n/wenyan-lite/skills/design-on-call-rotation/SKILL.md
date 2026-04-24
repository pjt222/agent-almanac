---
name: design-on-call-rotation
locale: wenyan-lite
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

# 設計值班輪替

創一可持之值班表，衡覆蓋之需與工程師之安。

## 適用時機

- 首立值班
- 團隊由 2-3 擴至 5+ 工程師
- 治值班過勞或警示疲勞
- 改事件回應時間
- 事後覆盤辨交接之缺

## 輸入

- **必要**：團隊人數與時區
- **必要**：服務 SLA 要求（回應時間、覆蓋時段）
- **選擇**：歷史事件量與時點
- **選擇**：值班補償之預算
- **選擇**：現有值班工具（PagerDuty、Opsgenie）

## 步驟

### 步驟一：定輪替表

依團隊人數擇輪替之長：

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

5 人團隊之示例表：

```
Week 1: Alice (Primary), Bob (Secondary)
Week 2: Charlie (Primary), Diana (Secondary)
Week 3: Eve (Primary), Alice (Secondary)
Week 4: Bob (Primary), Charlie (Secondary)
Week 5: Diana (Primary), Eve (Secondary)
```

**預期：** 輪替公平，提供 24/7 覆蓋。

**失敗時：** 若有覆蓋缺口，增工程師或將 SLA 降至僅工作時間。

### 步驟二：配升級策略

於 PagerDuty/Opsgenie 設分層升級：

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

繪升級流程圖：

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

**預期：** 升級路徑清晰，延遲合理。

**失敗時：** 升級頻發時，縮短確認窗或查警示質量。

### 步驟三：定交接程序

建結構化之交接清單：

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

自動發交接提醒：

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

**預期：** 知識順暢移交，班次之間無信息遺漏。

**失敗時：** 事件重發因接班者未知變通時，交接須強制為必。

### 步驟四：施疲勞管理

立規以防過勞：

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

追蹤警示疲勞指標：

```promql
# Alerts per on-call engineer per week
count(ALERTS{alertstate="firing"}) by (oncall_engineer)

# Nighttime pages (22:00-06:00 local)
count(ALERTS{alertstate="firing", hour_of_day>=22 or hour_of_day<6})

# Time to acknowledge (should be <5 min during business hours)
histogram_quantile(0.95, rate(alert_ack_duration_seconds_bucket[7d]))
```

**預期：** 值班負擔可持，工程師無長期疲憊。

**失敗時：** 縱有規而仍過勞時，減警示量或增員。

### 步驟五：錄運行手冊與升級聯絡

建值班速查指南：

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

**預期：** 值班者能於 2 分鐘內尋得所需之信息。

**失敗時：** 工程師屢問「X 在何處？」時，文檔須集中。

### 步驟六：定期值班回顧

每月審值班體驗：

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

追蹤長期之改進：

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

**預期：** 值班體驗逐月改善，警示量漸減。

**失敗時：** 指標不改時，上呈領導。或須暫停功能開發以治運維之疾。

## 驗證

- [ ] 輪替表涵蓋所有所需時段（24/7 或工作時間）
- [ ] 升級策略已測（發測試警示）
- [ ] 交接程序已錄並共享於團隊
- [ ] 疲勞管理規則已成文
- [ ] 值班速查指南完備可取
- [ ] 月度回顧已排
- [ ] 值班補償已核（若適用）

## 常見陷阱

- **工程師太少**：3 或以下人員，則每 2-3 週即值班一次，不可持。每週輪替至少 5 人。
- **升級無延遲**：立即升級主管徒耗資深者之時。先給予 15 分鐘回應。
- **省略交接**：無上下文移交致錯重現。交接須為必。
- **忽警示疲勞**：工程師因雜音而忽警示，則要事致漏。須積極調校。
- **無補償**：無薪或補休之值班滋怨。預算須為之留。

## 相關技能

- `configure-alerting-rules` - 減致疲勞之警示噪音
- `write-incident-runbook` - 建值班班次中所引之運行手冊
