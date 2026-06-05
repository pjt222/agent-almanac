---
name: investigate-capa-root-cause
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

Conduct a structured root cause investigation and develop effective corrective and preventive actions for compliance deviations.

## When to Use

- An audit finding requires a CAPA
- A deviation or incident occurred in a validated system
- A regulatory inspection observation needs a formal response
- A data integrity anomaly requires investigation
- Recurring issues suggest a systemic root cause

## Inputs

- **Required**: Description of the deviation, finding, or incident
- **Required**: Severity classification (critical, major, minor)
- **Required**: Evidence collected during the audit or investigation
- **Optional**: Previous related CAPAs or investigations
- **Optional**: Relevant SOPs, validation documents, and system logs
- **Optional**: Interview notes from involved personnel

## Procedure

### Step 1: Initiate the Investigation

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

**Expected:** Investigation initiated with clear problem statement and containment actions within 24 hours for critical findings.
**On failure:** If containment cannot be implemented immediately, escalate to QA Director and document the risk of delayed containment.

### Step 2: Select Investigation Method

Choose the method based on problem complexity:

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

**Expected:** Method selected matches the problem complexity — don't use a fault tree for a simple procedural error, and don't use 5-Why for a complex systemic failure.
**On failure:** If the first method does not reach a convincing root cause, apply a second method. Convergence across methods strengthens the conclusion.

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

**Expected:** Root cause analysis reaches the fundamental cause (not just the symptom) with supporting evidence for each step.
**On failure:** If the analysis produces only symptoms ("user made an error"), push deeper. Ask: "Why was the user able to make that error? What control should have prevented it?"

### Step 4: Design Corrective and Preventive Actions

Distinguish clearly between correction, corrective action, and preventive action:

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

**Expected:** Every CAPA action traces to a specific root cause, has measurable success criteria, and includes an effectiveness verification plan.
**On failure:** If success criteria are vague ("improve compliance"), rewrite them to be specific and measurable ("zero audit trail configuration changes outside change control for 6 consecutive months").

### Step 5: Verify Effectiveness

After CAPA implementation, verify that the actions actually worked:

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

**Expected:** Effectiveness verification demonstrates that the root cause was actually eliminated, not just that the action was completed.
**On failure:** If verification shows the CAPA was not effective, reopen the investigation and develop revised actions. Do not close an ineffective CAPA.

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

**Expected:** Trend analysis identifies systemic issues that individual CAPAs miss.
**On failure:** If trending reveals recurring root causes despite CAPAs, the CAPAs are treating symptoms. Escalate to management review for systemic intervention.

## Validation

- [ ] Investigation initiated within required timeline (24h for critical, 72h for major)
- [ ] Problem statement is factual and does not assign blame
- [ ] Investigation method is appropriate for problem complexity
- [ ] Root cause analysis reaches the fundamental cause (not just symptoms)
- [ ] Every root cause step is supported by evidence
- [ ] CAPAs distinguish correction, corrective action, and preventive action
- [ ] Each CAPA has measurable success criteria and a verification plan
- [ ] Effectiveness verified with evidence before CAPA closure
- [ ] Trend analysis reviewed at least quarterly

## Common Pitfalls

- **Stopping at the symptom**: "The user made an error" is not a root cause. The root cause is why the system or process allowed the error.
- **CAPA = retraining**: Retraining addresses only one possible root cause (knowledge). If the real root cause is a system design flaw or unclear SOP, retraining will not prevent recurrence.
- **Closing without verification**: Completing the action is not the same as verifying its effectiveness. A CAPA closed without effectiveness verification is a regulatory citation waiting to happen.
- **Blame-oriented investigation**: Investigations that focus on who made the error rather than what allowed the error undermine the quality culture and discourage reporting.
- **No trending**: Individual CAPAs may seem unrelated, but trending often reveals systemic issues (e.g., "training" root causes across multiple systems may indicate a broken training programme).

## Related Skills

- `conduct-gxp-audit` — audits generate findings that require CAPAs
- `monitor-data-integrity` — monitoring detects anomalies that trigger investigations
- `manage-change-control` — CAPA-driven changes go through change control
- `prepare-inspection-readiness` — open and overdue CAPAs are top inspection targets
- `design-training-program` — when root cause is training-related, improve the training programme
