---
name: monitor-data-integrity
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Design and operate a data integrity monitoring programme based on ALCOA+
  principles. Covers detective controls, audit trail review schedules,
  anomaly detection patterns (off-hours activity, sequential modifications,
  bulk changes), metrics dashboards, investigation triggers, and escalation
  matrix definition. Use when establishing a data integrity monitoring
  programme for GxP systems, preparing for inspections where data integrity
  is a focus area, after a data integrity incident requiring enhanced
  monitoring, or when implementing MHRA, WHO, or PIC/S guidance.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: compliance
  complexity: advanced
  language: multi
  tags: gxp, data-integrity, alcoa, monitoring, anomaly-detection, compliance
---

# 察數據完整

依 ALCOA+ 之則，建並行一程，以察驗證系統諸數據之完整，輔以察驗軌跡與異常之察。

## 用時

- GxP 系統欲建數據完整察程乃用
- 監管察驗將至而數據完整為焦點乃用
- 數據完整事故後，察須加強乃用
- 既有數據完整控制定期回顧乃用
- MHRA、WHO、或 PIC/S 數據完整指引欲行乃用

## 入

- **必要**：在範系統及其 ALCOA+ 風險畫像
- **必要**：適用指引（MHRA Data Integrity、WHO TRS 996、PIC/S PI 041）
- **必要**：各系統當前之察驗軌跡能力
- **可選**：先前數據完整察或監管察察
- **可選**：既有察程或度量
- **可選**：用者准入矩陣與角色定義

## 法

### 第一步：察當前 ALCOA+ 之姿

依 ALCOA+ 諸則察各系統：

```markdown
# Data Integrity Assessment
## Document ID: DIA-[SITE]-[YYYY]-[NNN]

### ALCOA+ Assessment Matrix

| Principle | Definition | Assessment Questions | System 1 | System 2 |
|-----------|-----------|---------------------|----------|----------|
| **Attributable** | Who performed the action and when? | Are all entries linked to unique user IDs? Is the timestamp system-generated? | G/A/R | G/A/R |
| **Legible** | Can data be read and understood? | Are records readable throughout retention period? Are formats controlled? | G/A/R | G/A/R |
| **Contemporaneous** | Was data recorded at the time of the activity? | Are timestamps real-time? Are backdated entries detectable? | G/A/R | G/A/R |
| **Original** | Is this the first-captured data? | Are original records preserved? Is there a clear original vs copy distinction? | G/A/R | G/A/R |
| **Accurate** | Is the data correct and truthful? | Are calculations verified? Are transcription errors detectable? | G/A/R | G/A/R |
| **Complete** | Is all data present? | Are deletions detectable? Are all expected records present? | G/A/R | G/A/R |
| **Consistent** | Are data elements consistent across records? | Do timestamps follow logical sequence? Are versions consistent? | G/A/R | G/A/R |
| **Enduring** | Will data survive for the required retention period? | Is the storage medium reliable? Are backups verified? | G/A/R | G/A/R |
| **Available** | Can data be accessed when needed? | Are retrieval procedures documented? Are access controls appropriate? | G/A/R | G/A/R |

Rating: G = Good (controls adequate), A = Adequate (minor improvements needed), R = Remediation required
```

**得：** 各系統皆有評級之 ALCOA+ 察，每則皆有具體所察。
**敗則：** 系統不能受察者（如無察驗軌跡能力），標為要害缺，須立即補。

### 第二步：設察控

定察活以見數據完整之違：

```markdown
# Detective Controls Design
## Document ID: DCD-[SITE]-[YYYY]-[NNN]

### Audit Trail Review Schedule
| System | Review Type | Frequency | Reviewer | Scope |
|--------|-----------|-----------|----------|-------|
| LIMS | Comprehensive | Monthly | QA | All data modifications, deletions, and access events |
| ERP | Targeted | Weekly | QA | Batch record modifications and approvals |
| R/Shiny | Comprehensive | Per analysis | Statistician | All input/output/parameter changes |

### Review Checklist
For each audit trail review cycle:
- [ ] All data modifications have documented justification
- [ ] No unexplained deletions or void entries
- [ ] Timestamps are sequential and consistent with business operations
- [ ] No off-hours activity without documented justification
- [ ] No shared account usage detected
- [ ] Failed login attempts are within normal thresholds
- [ ] No privilege escalation events outside change control
```

**得：** 察控有期、有人、有文，回顧之則明。
**敗則：** 察驗軌跡未按期回顧者，書其缺並上報質量之主管。漏察積險。

### 第三步：定異常察之模

立明確之模，觸發追察：

```markdown
# Anomaly Detection Patterns

### Pattern 1: Off-Hours Activity
**Trigger:** Data creation, modification, or deletion outside business hours (defined as [06:00-20:00 local time, Monday-Friday])
**Threshold:** Any GxP-critical data modification outside defined hours
**Response:** Verify with user and supervisor within 2 business days
**Exceptions:** Documented shift work, approved overtime, automated processes

### Pattern 2: Sequential Modifications
**Trigger:** Multiple modifications to the same record within a short timeframe
**Threshold:** >3 modifications to the same record within 60 minutes
**Response:** Review modification reasons; verify each change has documented justification
**Exceptions:** Initial data entry corrections within [grace period, e.g., 30 minutes]

### Pattern 3: Bulk Changes
**Trigger:** Unusually high volume of data modifications by a single user
**Threshold:** >50 modifications per user per day (baseline: [calculate from normal usage])
**Response:** Verify business justification for bulk activity
**Exceptions:** Documented batch operations, data migration activities under change control

### Pattern 4: Delete/Void Spikes
**Trigger:** Unusual number of record deletions or voidings
**Threshold:** >5 delete/void events per user per week
**Response:** Immediate QA review of deleted/voided records
**Exceptions:** None — all delete/void events require documented justification

### Pattern 5: Privilege Escalation
**Trigger:** User access changes granting administrative or elevated privileges
**Threshold:** Any privilege change outside the user access management SOP
**Response:** Verify with IT security and system owner within 24 hours
**Exceptions:** Emergency access per documented emergency access procedure

### Pattern 6: Audit Trail Gaps
**Trigger:** Missing or interrupted audit trail entries
**Threshold:** Any gap > 0 entries (audit trail should be continuous)
**Response:** Immediate investigation — potential system malfunction or tampering
**Exceptions:** None — audit trail gaps are always critical
```

**得：** 諸模具體、可量、可行，閾與應有定。
**敗則：** 閾過低（多假陽）者，依基線校之。閾過高（漏實情）者，首察週期後緊之。

### 第四步：建度量盤

```markdown
# Data Integrity Metrics Dashboard
## Document ID: DIMD-[SITE]-[YYYY]-[NNN]

### Key Performance Indicators

| KPI | Metric | Target | Yellow Threshold | Red Threshold | Source |
|-----|--------|--------|-----------------|---------------|--------|
| DI-01 | Audit trail review completion rate | 100% | <95% | <90% | Review log |
| DI-02 | Anomalies detected per month | Trending down | >10% increase MoM | >25% increase MoM | Anomaly log |
| DI-03 | Anomaly investigation closure rate | <15 business days | >15 days | >30 days | Investigation log |
| DI-04 | Open data integrity CAPAs | 0 overdue | 1-2 overdue | >2 overdue | CAPA tracker |
| DI-05 | Shared account instances detected | 0 | 1-2 | >2 | Access review |
| DI-06 | Unauthorised access attempts | <5/month | 5-10/month | >10/month | System logs |
| DI-07 | Audit trail gap events | 0 | N/A | >0 (always red) | System monitoring |

### Reporting Cadence
| Report | Frequency | Audience | Owner |
|--------|-----------|----------|-------|
| DI Metrics Summary | Monthly | QA Director, System Owners | QA Analyst |
| DI Trend Report | Quarterly | Quality Council | QA Manager |
| DI Annual Review | Annual | Site Director | QA Director |
```

**得：** 度量盤一目可見合規之態，升級之觸明。
**敗則：** 數據源不能支自動度量者，先以人工收集，書計劃以動之。

### 第五步：立追察觸發與升級

```markdown
# Investigation and Escalation Matrix

### Investigation Triggers
| Trigger | Severity | Response Time | Investigator |
|---------|----------|---------------|-------------|
| Audit trail gap detected | Critical | Immediate (within 4 hours) | IT + QA |
| Confirmed data falsification | Critical | Immediate (within 4 hours) | QA Director |
| Anomaly pattern confirmed after review | Major | Within 5 business days | QA Analyst |
| Repeated anomalies from same user | Major | Within 5 business days | QA + HR |
| Overdue audit trail review | Minor | Within 10 business days | QA Manager |

### Escalation Path
| Level | Escalated To | When |
|-------|-------------|------|
| 1 | System Owner | Any confirmed anomaly |
| 2 | QA Director | Major or critical finding |
| 3 | Site Director | Critical finding or potential regulatory impact |
| 4 | Regulatory Affairs | Confirmed data integrity failure requiring regulatory notification |
```

**得：** 各察有定之嚴、時、升級路。
**敗則：** 察未於定時內畢者，升至下一級。

### 第六步：合察計劃

集諸件為主數據完整察計劃：

```markdown
# Data Integrity Monitoring Plan
## Document ID: DI-MONITORING-PLAN-[SITE]-[YYYY]-[NNN]

### 1. Purpose and Scope
[From assessment scope]

### 2. ALCOA+ Assessment Summary
[From Step 1]

### 3. Detective Controls
[From Step 2]

### 4. Anomaly Detection Rules
[From Step 3]

### 5. Metrics and Reporting
[From Step 4]

### 6. Investigation and Escalation
[From Step 5]

### 7. Periodic Review
- Monitoring plan review: Annual
- Anomaly thresholds: Adjust after each quarterly review
- ALCOA+ re-assessment: When systems change or new systems are added

### 8. Approval
| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA Director | | | |
| IT Director | | | |
| Site Director | | | |
```

**得：** 一已批之文，定完整數據完整察程。
**敗則：** 計劃過大難以一文承者，建主計劃並引特定系統察程。

## 驗

- [ ] 諸在範系統皆畢 ALCOA+ 察
- [ ] 察驗軌跡回顧期、範圍、責人皆定
- [ ] 至少五異常察模有定，閾明確
- [ ] 度量盤具 KPI，綠黃紅閾分明
- [ ] 追察觸發有定，嚴與應時皆明
- [ ] 升級矩陣達於監管事務（要害察時）
- [ ] 察計劃經 QA 與 IT 主管核准
- [ ] 定期回顧之期已立

## 陷

- **察而無行**：收度量而不察異，給虛假安全感，劣於不察（生有所漏察之據）。
- **靜閾**：以揣測非基線數據定閾者，多假陽，致警疲。
- **察驗軌跡如打勾**：回顧而不知所察，無效。訓回顧者於異常之模。
- **忽系統限**：某些系統察驗軌跡能力差。書其限，行補償控，勿假裝其無。
- **無趨勢**：個別異常或微，然跨時跨人之模顯系統病。必趨勢化數據完整度量。

## 參

- `design-compliance-architecture` — 識需數據完整察之系統
- `implement-audit-trail` — 察所依之技基
- `investigate-capa-root-cause` — 察測得問題需正式追察時
- `conduct-gxp-audit` — 察察察程之效
- `prepare-inspection-readiness` — 數據完整為監管察驗主焦點
