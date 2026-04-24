---
name: design-on-call-rotation
locale: caveman
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

# Design On-Call Rotation

Make sustainable on-call schedule. Balance coverage with engineer well-being.

## When Use

- Set up on-call first time
- Scale team from 2-3 to 5+ engineers
- Fight on-call burnout or alert fatigue
- Speed up incident response
- After post-mortem finds handoff issue

## Inputs

- **Required**: Team size + time zones
- **Required**: Service SLA needs (response time, coverage hours)
- **Optional**: Past incident volume + timing
- **Optional**: Budget for on-call pay
- **Optional**: Existing on-call tool (PagerDuty, Opsgenie)

## Steps

### Step 1: Pick Rotation Schedule

Pick rotation length by team size:

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

Example 5-person team schedule:

```
Week 1: Alice (Primary), Bob (Secondary)
Week 2: Charlie (Primary), Diana (Secondary)
Week 3: Eve (Primary), Alice (Secondary)
Week 4: Bob (Primary), Charlie (Secondary)
Week 5: Diana (Primary), Eve (Secondary)
```

**Got:** Schedule rotates fairly. 24/7 coverage.

**If fail:** Coverage gaps? Add engineers or drop SLA to business hours only.

### Step 2: Config Escalation Policy

Set up tiered escalation in PagerDuty/Opsgenie:

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

Escalation flowchart:

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

**Got:** Clear escalation path. Reasonable delays.

**If fail:** Escalations fire too often? Shorten ack windows or check alert quality.

### Step 3: Define Handoff

Make structured handoff checklist:

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

Automate handoff reminders:

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

**Got:** Smooth knowledge transfer. No info loss between shifts.

**If fail:** Incidents recur because incoming engineer missed workarounds? Make handoff mandatory.

### Step 4: Fatigue Management

Rules to stop burnout:

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

Track alert fatigue metrics:

```promql
# Alerts per on-call engineer per week
count(ALERTS{alertstate="firing"}) by (oncall_engineer)

# Nighttime pages (22:00-06:00 local)
count(ALERTS{alertstate="firing", hour_of_day>=22 or hour_of_day<6})

# Time to acknowledge (should be <5 min during business hours)
histogram_quantile(0.95, rate(alert_ack_duration_seconds_bucket[7d]))
```

**Got:** On-call load sustainable. Engineers not chronically exhausted.

**If fail:** Burnout despite rules? Cut alert volume or hire more engineers.

### Step 5: Document Runbooks + Contacts

Make on-call reference guide:

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

**Got:** On-call engineer finds any needed info in <2 min.

**If fail:** Engineers keep asking "where is X?"? Centralize docs.

### Step 6: Schedule On-Call Retros

Review on-call experience monthly:

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

Track improvement over time:

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

**Got:** On-call experience improves month-over-month. Alert volume drops.

**If fail:** Metrics don't improve? Escalate to leadership. May need to pause feature work, fix operational debt.

## Checks

- [ ] Rotation schedule covers all hours (24/7 or business hours)
- [ ] Escalation policy tested (send test alerts)
- [ ] Handoff procedure documented + shared with team
- [ ] Fatigue rules codified
- [ ] On-call reference guide complete + accessible
- [ ] Monthly retros scheduled
- [ ] On-call comp approved (if applicable)

## Pitfalls

- **Too few engineers**: 3 or fewer = on-call every 2-3 weeks, unsustainable. Min 5 for weekly rotation.
- **No escalation delays**: Instant manager escalation wastes senior time. Give primary 15 min to respond.
- **Skipping handoffs**: No context transfer = repeated mistakes. Make handoffs mandatory.
- **Ignoring alert fatigue**: Engineers ignore alerts from noise → critical issues missed. Tune aggressively.
- **No comp**: On-call with no pay/time off = resentment. Budget for it.

## See Also

- `configure-alerting-rules` - cut alert noise causing fatigue
- `write-incident-runbook` - runbooks referenced during on-call shifts
