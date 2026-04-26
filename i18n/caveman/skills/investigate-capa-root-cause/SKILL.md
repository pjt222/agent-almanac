---
name: investigate-capa-root-cause
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Investigate root causes and manage CAPAs (Corrective and Preventive Actions)
  for compliance deviations. Covers investigation method selection (5-Why,
  fishbone, fault tree), structured root cause analysis, corrective vs
  preventive action design, effectiveness verification, and trend analysis.
  Use when an audit finding requires a CAPA, when a deviation or incident
  occurs in a validated system, when a regulatory observation needs a formal
  response, when a data integrity anomaly requires investigation, or when
  recurring issues suggest a systemic root cause.
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

Structured root cause investigation. Develop effective corrective and preventive actions for compliance deviations.

## When Use

- Audit finding requires CAPA
- Deviation or incident happened in validated system
- Regulatory inspection observation needs formal response
- Data integrity anomaly requires investigation
- Recurring issues suggest systemic root cause

## Inputs

- **Required**: Description of deviation, finding, or incident
- **Required**: Severity classification (critical, major, minor)
- **Required**: Evidence collected during audit or investigation
- **Optional**: Previous related CAPAs or investigations
- **Optional**: Relevant SOPs, validation documents, system logs
- **Optional**: Interview notes from involved personnel

## Steps

### Step 1: Initiate Investigation

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

**Got:** Investigation initiated with clear problem statement and containment actions within 24 hours for critical findings.
**If fail:** Containment cannot be implemented immediately? Escalate to QA Director. Document risk of delayed containment.

### Step 2: Select Investigation Method

Choose method based on problem complexity:

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

**Got:** Method selected matches problem complexity — don't use fault tree for simple procedural error, don't use 5-Why for complex systemic failure.
**If fail:** First method does not reach convincing root cause? Apply second method. Convergence across methods strengthens conclusion.

### Step 3: Conduct Root Cause Analysis

#### Option A: 5-Why Analysis

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

#### Option B: Fishbone (Ishikawa) Diagram

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

#### Option C: Fault Tree Analysis

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

**Got:** Root cause analysis reaches fundamental cause (not just symptom) with supporting evidence for each step.
**If fail:** Analysis produces only symptoms ("user made error")? Push deeper. Ask: "Why was user able to make that error? What control should have prevented it?"

### Step 4: Design Corrective and Preventive Actions

Distinguish clearly between correction, corrective action, preventive action:

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

**Got:** Every CAPA action traces to specific root cause, has measurable success criteria, includes effectiveness verification plan.
**If fail:** Success criteria vague ("improve compliance")? Rewrite to be specific and measurable ("zero audit trail configuration changes outside change control for 6 consecutive months").

### Step 5: Verify Effectiveness

After CAPA implementation, verify actions actually worked:

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

**Got:** Effectiveness verification shows root cause actually eliminated, not just that action was completed.
**If fail:** Verification shows CAPA not effective? Reopen investigation, develop revised actions. Do not close ineffective CAPA.

### Step 6: Analyse CAPA Trends

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

**Got:** Trend analysis identifies systemic issues individual CAPAs miss.
**If fail:** Trending reveals recurring root causes despite CAPAs? CAPAs treating symptoms. Escalate to management review for systemic intervention.

## Checks

- [ ] Investigation initiated within required timeline (24h for critical, 72h for major)
- [ ] Problem statement factual, does not assign blame
- [ ] Investigation method appropriate for problem complexity
- [ ] Root cause analysis reaches fundamental cause (not just symptoms)
- [ ] Every root cause step supported by evidence
- [ ] CAPAs distinguish correction, corrective action, preventive action
- [ ] Each CAPA has measurable success criteria and verification plan
- [ ] Effectiveness verified with evidence before CAPA closure
- [ ] Trend analysis reviewed at least quarterly

## Pitfalls

- **Stopping at symptom**: "User made error" not a root cause. Root cause = why system or process allowed error.
- **CAPA = retraining**: Retraining addresses only one possible root cause (knowledge). Real root cause is system design flaw or unclear SOP? Retraining will not prevent recurrence.
- **Closing without verification**: Completing action not same as verifying effectiveness. CAPA closed without effectiveness verification = regulatory citation waiting to happen.
- **Blame-oriented investigation**: Investigations focusing on who made error rather than what allowed error undermine quality culture, discourage reporting.
- **No trending**: Individual CAPAs may seem unrelated. Trending often reveals systemic issues (e.g., "training" root causes across multiple systems may indicate broken training programme).

## See Also

- `conduct-gxp-audit` — audits generate findings requiring CAPAs
- `monitor-data-integrity` — monitoring detects anomalies triggering investigations
- `manage-change-control` — CAPA-driven changes go through change control
- `prepare-inspection-readiness` — open and overdue CAPAs are top inspection targets
- `design-training-program` — when root cause training-related, improve training programme
