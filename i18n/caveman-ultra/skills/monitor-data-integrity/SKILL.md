---
name: monitor-data-integrity
locale: caveman-ultra
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

# Monitor Data Integrity

Design + operate programme continuously monitoring data integrity across validated systems via ALCOA+ + anomaly detection.

## Use When

- Establish data integrity monitoring for GxP systems
- Regulatory inspection prep where data integrity is focus
- Post-incident requiring enhanced monitoring
- Periodic review of existing controls
- Implement MHRA / WHO / PIC/S data integrity guidance

## In

- **Required**: In-scope systems + ALCOA+ risk profile
- **Required**: Applicable guidance (MHRA Data Integrity, WHO TRS 996, PIC/S PI 041)
- **Required**: Current audit trail capabilities per system
- **Optional**: Prior findings or regulatory observations
- **Optional**: Existing monitoring procs/metrics
- **Optional**: User access matrices + role defs

## Do

### Step 1: Assess ALCOA+ Posture

Per system vs. all ALCOA+ principles:

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

→ Every system has rated ALCOA+ assessment + specific findings per principle.

If err: system can't be assessed (no audit trail) → flag critical gap, immediate remediation.

### Step 2: Detective Controls

Define monitoring activities that detect violations:

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

→ Detective controls scheduled, assigned, doc'd w/ clear review criteria.

If err: reviews not on schedule → doc gap + escalate to QA mgmt. Missed reviews accumulate risk.

### Step 3: Anomaly Detection Patterns

Specific patterns triggering investigation:

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

→ Patterns specific, measurable, actionable w/ thresholds + response procs.

If err: thresholds too low (excessive false positives) → adjust based on baseline. Too high (missing real issues) → tighten after first cycle.

### Step 4: Metrics Dashboard

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

→ Dashboard at-a-glance compliance status + clear escalation triggers.

If err: data sources can't support automated metrics → manual collection + doc plan to automate.

### Step 5: Investigation Triggers + Escalation

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

→ Every investigation: severity + timeline + escalation path.

If err: investigations not completed in timeline → escalate to next level.

### Step 6: Compile Monitoring Plan

Assemble all into master plan:

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

→ Single approved doc defining complete programme.

If err: plan too large for single doc → master plan + refs to system-specific monitoring procs.

## Check

- [ ] ALCOA+ assessment for all in-scope systems
- [ ] Audit trail review schedule: frequency + scope + reviewer
- [ ] ≥5 anomaly patterns w/ specific thresholds
- [ ] Metrics dashboard: KPIs w/ green/yellow/red thresholds
- [ ] Investigation triggers: severity + response timelines
- [ ] Escalation reaches regulatory affairs for critical
- [ ] Plan approved by QA + IT leadership
- [ ] Periodic review schedule

## Traps

- **Monitor w/o action**: Collecting metrics but never investigating = false security, worse than no monitoring (generates evidence of ignored findings)
- **Static thresholds**: Guesswork-based → excessive false positives → alert fatigue
- **Audit trail review as checkbox**: Reviewing w/o knowing what to look for = ineffective. Train reviewers on patterns
- **Ignore system limitations**: Some have poor audit trails. Doc limitations + compensating controls, don't pretend
- **No trending**: Individual anomalies seem minor; patterns across time/users reveal systemic. Always trend metrics

## →

- `design-compliance-architecture` — identifies systems needing monitoring
- `implement-audit-trail` — technical foundation monitoring relies on
- `investigate-capa-root-cause` — when monitoring detects issues needing formal investigation
- `conduct-gxp-audit` — audits assess effectiveness of programme
- `prepare-inspection-readiness` — data integrity = primary inspection focus
