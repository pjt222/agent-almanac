---
name: investigate-capa-root-cause
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Investigate root causes + manage CAPAs for compliance deviations. Method
  selection (5-Why, fishbone, fault tree), structured RCA, corrective vs
  preventive action design, effectiveness verification, trend analysis. Use
  when audit finding needs CAPA, deviation in validated sys, regulatory
  observation, data integrity anomaly, recurring issues suggest systemic root.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: compliance
  complexity: intermediate
  language: multi
  tags: gxp, capa, root-cause, investigation, fishbone, five-why, compliance
---

# Investigate CAPA Root Cause

Structured RCA + effective corrective/preventive actions for compliance deviations.

## Use When

- Audit finding needs CAPA
- Deviation / incident in validated sys
- Regulatory inspection observation needs formal response
- Data integrity anomaly needs investigation
- Recurring issues → systemic root

## In

- **Req**: Description of deviation / finding / incident
- **Req**: Severity (critical, major, minor)
- **Req**: Evidence from audit / investigation
- **Opt**: Prior related CAPAs / investigations
- **Opt**: Relevant SOPs, validation docs, sys logs
- **Opt**: Interview notes

## Do

### Step 1: Initiate

```markdown
# Root Cause Investigation
## Document ID: RCA-[CAPA-ID]
## CAPA Reference: CAPA-[YYYY]-[NNN]

### 1. Trigger
| Field | Value |
|-------|-------|
| Source | [Audit finding / Deviation / Inspection observation / Monitoring alert] |
| Reference | [Finding ID, deviation ID, or observation number] |
| System | [Affected system name and version] |
| Date discovered | [YYYY-MM-DD] |
| Severity | [Critical / Major / Minor] |
| Investigator | [Name, Title] |
| Investigation deadline | [Date — per severity: Critical 15 days, Major 30 days, Minor 60 days] |

### 2. Problem Statement
[Objective, factual description of what happened, what should have happened, and the gap between the two. No blame, no assumptions.]

### 3. Immediate Containment (if required)
| Action | Owner | Completed |
|--------|-------|-----------|
| [e.g., Restrict system access pending investigation] | [Name] | [Date] |
| [e.g., Quarantine affected batch records] | [Name] | [Date] |
| [e.g., Implement manual workaround] | [Name] | [Date] |
```

→ Investigation initiated w/ clear problem statement + containment w/in 24h for critical findings.

**If err:** Containment can't be implemented immediately → escalate QA Director + document risk of delayed containment.

### Step 2: Select Method

Choose based on complexity:

```markdown
### Investigation Method Selection

| Method | Best For | Complexity | Output |
|--------|----------|-----------|--------|
| **5-Why Analysis** | Single-cause problems, straightforward failures | Low | Linear cause chain |
| **Fishbone (Ishikawa)** | Multi-factor problems, process failures | Medium | Cause-and-effect diagram |
| **Fault Tree Analysis** | System failures, safety-critical events | High | Boolean logic tree |

**Selected method:** [5-Why / Fishbone / Fault Tree / Combination]
**Rationale:** [Why this method is appropriate for this problem]
```

→ Method matches complexity — no fault tree for simple procedural, no 5-Why for complex systemic.

**If err:** First method doesn't reach convincing root → apply 2nd. Convergence across methods strengthens.

### Step 3: Conduct RCA

#### Opt A: 5-Why

```markdown
### 5-Why Analysis

| Level | Question | Answer | Evidence |
|-------|----------|--------|----------|
| Why 1 | Why did [the problem] occur? | [Immediate cause] | [Evidence reference] |
| Why 2 | Why did [immediate cause] occur? | [Contributing factor] | [Evidence reference] |
| Why 3 | Why did [contributing factor] occur? | [Deeper cause] | [Evidence reference] |
| Why 4 | Why did [deeper cause] occur? | [Systemic cause] | [Evidence reference] |
| Why 5 | Why did [systemic cause] occur? | [Root cause] | [Evidence reference] |

**Root cause:** [Clear statement of the fundamental cause]
```

#### Opt B: Fishbone (Ishikawa)

```markdown
### Fishbone Analysis

Analyse causes across six standard categories:

| Category | Potential Causes | Confirmed? | Evidence |
|----------|-----------------|------------|----------|
| **People** | Inadequate training, unfamiliarity with SOP, staffing shortage | [Y/N] | [Ref] |
| **Process** | SOP unclear, missing step, wrong sequence | [Y/N] | [Ref] |
| **Technology** | System misconfiguration, software bug, interface failure | [Y/N] | [Ref] |
| **Materials** | Incorrect input data, wrong version of reference document | [Y/N] | [Ref] |
| **Measurement** | Wrong metric, inadequate monitoring, missed threshold | [Y/N] | [Ref] |
| **Environment** | Organisational change, regulatory change, resource constraints | [Y/N] | [Ref] |

**Contributing causes:** [List confirmed causes]
**Root cause(s):** [The fundamental cause(s) — may be more than one]
```

#### Opt C: Fault Tree

```markdown
### Fault Tree Analysis

**Top event:** [The undesired event]

Level 1 (OR gate — any of these could cause the top event):
├── [Cause A]
│   Level 2 (AND gate — both needed):
│   ├── [Sub-cause A1]
│   └── [Sub-cause A2]
├── [Cause B]
│   Level 2 (OR gate):
│   ├── [Sub-cause B1]
│   └── [Sub-cause B2]
└── [Cause C]

**Minimal cut sets:** [Smallest combinations of events that cause the top event]
**Root cause(s):** [Fundamental failures identified in the tree]
```

→ RCA reaches fundamental cause (not symptom) w/ evidence per step.

**If err:** Analysis only symptoms ("user made err") → push deeper. Ask: "Why could user make that err? What control should've prevented?"

### Step 4: Design Corrective + Preventive Actions

Distinguish correction vs corrective vs preventive:

```markdown
### CAPA Plan

| Category | Definition | Action | Owner | Deadline |
|----------|-----------|--------|-------|----------|
| **Correction** | Fix the immediate problem | [e.g., Re-enable audit trail for batch module] | [Name] | [Date] |
| **Corrective Action** | Eliminate the root cause | [e.g., Remove admin ability to disable audit trail; require change control for all audit trail configuration changes] | [Name] | [Date] |
| **Preventive Action** | Prevent recurrence in other areas | [e.g., Audit all systems for audit trail disable capability; add monitoring alert for audit trail configuration changes] | [Name] | [Date] |

### CAPA Details

**CAPA-[YYYY]-[NNN]-CA1: [Corrective Action Title]**
- **Root cause addressed:** [Specific root cause from Step 3]
- **Action description:** [Detailed description of what will be done]
- **Success criteria:** [Measurable outcome that proves the action worked]
- **Verification method:** [How effectiveness will be checked]
- **Verification date:** [When effectiveness will be verified — typically 3-6 months after implementation]

**CAPA-[YYYY]-[NNN]-PA1: [Preventive Action Title]**
- **Risk addressed:** [What recurrence or spread this prevents]
- **Action description:** [Detailed description]
- **Success criteria:** [Measurable outcome]
- **Verification method:** [How effectiveness will be checked]
- **Verification date:** [Date]
```

→ Every action traces to specific root, has measurable success criteria, + effectiveness verification plan.

**If err:** Success criteria vague ("improve compliance") → rewrite specific + measurable ("zero audit trail config changes outside change control for 6 consecutive months").

### Step 5: Verify Effectiveness

After implementation → verify actions worked:

```markdown
### Effectiveness Verification

**CAPA-[YYYY]-[NNN] — Verification Record**

| CAPA Action | Verification Date | Method | Evidence | Result |
|-------------|------------------|--------|----------|--------|
| CA1: [Action] | [Date] | [Method: audit, sampling, metric review] | [Evidence reference] | [Effective / Not Effective] |
| PA1: [Action] | [Date] | [Method] | [Evidence reference] | [Effective / Not Effective] |

### Effectiveness Criteria Check
- [ ] The original problem has not recurred since CAPA implementation
- [ ] The corrective action eliminated the root cause (evidence: [reference])
- [ ] The preventive action has been applied to similar systems/processes
- [ ] No new issues were introduced by the CAPA actions

### CAPA Closure
| Field | Value |
|-------|-------|
| Closure decision | [Closed — Effective / Closed — Not Effective / Extended] |
| Closed by | [Name, Title] |
| Closure date | [YYYY-MM-DD] |
| Next review | [If recurring, when to re-check] |
```

→ Verification demonstrates root eliminated, not just action completed.

**If err:** Verification shows CAPA not effective → reopen investigation + develop revised actions. Don't close ineffective CAPA.

### Step 6: Analyse Trends

```markdown
### CAPA Trend Analysis

| Period | Total CAPAs | By Source | Top 3 Root Cause Categories | Recurring? |
|--------|------------|-----------|---------------------------|------------|
| Q1 20XX | [N] | Audit: [n], Deviation: [n], Monitoring: [n] | [Cat1], [Cat2], [Cat3] | [Y/N] |
| Q2 20XX | [N] | Audit: [n], Deviation: [n], Monitoring: [n] | [Cat1], [Cat2], [Cat3] | [Y/N] |

### Systemic Issues
| Issue | Frequency | Systems Affected | Recommended Action |
|-------|-----------|-----------------|-------------------|
| [e.g., Training gaps] | [N occurrences in 12 months] | [Systems] | [Systemic programme improvement] |
```

→ Trend analysis IDs systemic issues individual CAPAs miss.

**If err:** Trending reveals recurring roots despite CAPAs → CAPAs treating symptoms. Escalate to mgmt for systemic intervention.

## Check

- [ ] Investigation initiated w/in timeline (24h critical, 72h major)
- [ ] Problem statement factual, no blame
- [ ] Method appropriate for complexity
- [ ] RCA reaches fundamental cause (not symptoms)
- [ ] Every step supported by evidence
- [ ] CAPAs distinguish correction, corrective, preventive
- [ ] Each CAPA has measurable success criteria + verification plan
- [ ] Effectiveness verified w/ evidence before closure
- [ ] Trend analysis reviewed ≥ quarterly

## Traps

- **Stop at symptom**: "User made err" ≠ root. Root = why sys/process allowed err.
- **CAPA = retraining**: Retraining addresses only 1 possible root (knowledge). Real root = sys design flaw / unclear SOP → retraining won't prevent.
- **Close w/o verification**: Completing action ≠ verifying effectiveness. Closed CAPA w/o verification = regulatory citation waiting.
- **Blame-oriented**: Focus on who made err vs what allowed err → undermines quality culture, discourages reporting.
- **No trending**: Individual CAPAs seem unrelated, trending reveals systemic issues (e.g., "training" roots across multi systems = broken training prog).

## →

- `conduct-gxp-audit` — audits → findings → CAPAs
- `monitor-data-integrity` — monitoring detects anomalies → investigations
- `manage-change-control` — CAPA-driven changes go thru change control
- `prepare-inspection-readiness` — open/overdue CAPAs top inspection targets
- `design-training-program` — root = training → improve prog
