---
name: design-on-call-rotation
description: >
  设计可持续的值班轮换制度，包含均衡的排班、清晰的升级策略、疲劳管理和交接流程。
  在保持事故响应覆盖的同时最小化倦怠。适用于首次建立值班制度、将团队从 2-3 人扩展到 5+ 人、
  解决值班倦怠或告警疲劳问题、改善事故响应时间，或在后复盘发现交接问题之后。
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
  tags: on-call, rotation, escalation, fatigue-management, handoff
---

# Design On-Call Rotation

创建可持续的值班排班，在覆盖范围与工程师健康之间取得平衡。

## 适用场景

- 首次建立值班制度
- 将团队从 2-3 人扩展到 5+ 人
- 解决值班倦怠或告警疲劳
- 改善事故响应时间
- 后复盘发现交接问题之后

## 输入

- **必填**：团队规模和时区
- **必填**：服务 SLA 要求（响应时间、覆盖时间）
- **可选**：历史事故量和时间分布
- **可选**：值班补偿预算
- **可选**：现有值班工具（PagerDuty、Opsgenie）

## 步骤

### 第 1 步：定义轮换排班

根据团队规模选择轮换周期：

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

5 人团队示例排班：

```
Week 1: Alice (Primary), Bob (Secondary)
Week 2: Charlie (Primary), Diana (Secondary)
Week 3: Eve (Primary), Alice (Secondary)
Week 4: Bob (Primary), Charlie (Secondary)
Week 5: Diana (Primary), Eve (Secondary)
```

**预期结果：** 公平轮换且提供全天候覆盖的排班。

**失败处理：** 如果存在覆盖缺口，增加工程师或将 SLA 缩减为仅工作时间。

### 第 2 步：配置升级策略

在 PagerDuty/Opsgenie 中设置分层升级：

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

创建升级流程图：

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

**预期结果：** 具有合理延迟的清晰升级路径。

**失败处理：** 如果升级触发过于频繁，缩短确认窗口或检查告警质量。

### 第 3 步：定义交接流程

创建结构化的交接清单：

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

自动化交接提醒：

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

**预期结果：** 顺畅的知识传递，班次间无信息丢失。

**失败处理：** 如果事故因接班工程师不知道变通方法而重复发生，使交接成为强制性要求。

### 第 4 步：实施疲劳管理

制定防止倦怠的规则：

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

追踪告警疲劳指标：

```promql
# Alerts per on-call engineer per week
count(ALERTS{alertstate="firing"}) by (oncall_engineer)

# Nighttime pages (22:00-06:00 local)
count(ALERTS{alertstate="firing", hour_of_day>=22 or hour_of_day<6})

# Time to acknowledge (should be <5 min during business hours)
histogram_quantile(0.95, rate(alert_ack_duration_seconds_bucket[7d]))
```

**预期结果：** 值班负荷可持续，工程师不会长期精疲力竭。

**失败处理：** 如果尽管有规则仍发生倦怠，减少告警量或增加工程师。

### 第 5 步：记录运行手册和升级联系人

创建值班快速参考指南：

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

**预期结果：** 值班工程师可以在 2 分钟内找到所需信息。

**失败处理：** 如果工程师频繁询问"X 在哪里？"，集中文档管理。

### 第 6 步：安排定期值班回顾

每月审查值班体验：

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

随时间追踪改进：

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

**预期结果：** 值班体验逐月改善，告警量减少。

**失败处理：** 如果指标没有改善，向领导层升级。可能需要暂停功能工作来修复运营问题。

## 验证清单

- [ ] 轮换排班覆盖所有所需时间（24/7 或工作时间）
- [ ] 升级策略已测试（发送测试告警）
- [ ] 交接流程已记录并与团队共享
- [ ] 疲劳管理规则已制定
- [ ] 值班快速参考指南完整且可访问
- [ ] 每月回顾已安排
- [ ] 值班补偿已批准（如适用）

## 常见问题

- **工程师太少**：3 人或更少意味着每 2-3 周值班一次，不可持续。周轮换最少需要 5 人。
- **没有升级延迟**：立即升级给管理者会浪费高级工程师时间。给主要值班人员 15 分钟响应时间。
- **跳过交接**：缺乏上下文传递会导致重复犯错。使交接成为强制性要求。
- **忽视告警疲劳**：如果工程师因噪音而忽视告警，关键问题就会被遗漏。积极调优。
- **没有补偿**：没有薪酬或补假的值班会产生怨恨。为此预算。

## 相关技能

- `configure-alerting-rules` - 减少导致疲劳的告警噪音
- `write-incident-runbook` - 创建值班期间引用的运行手册
