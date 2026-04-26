---
name: manage-change-control
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Manage change control for validated computerized systems. Covers change
  request triage (emergency, standard, minor), impact assessment on validated
  state, revalidation scope determination, approval workflows, implementation
  tracking, and post-change verification. Use when a validated system requires
  a software upgrade, patch, or configuration change; when infrastructure
  changes affect validated systems; when a CAPA requires system modification;
  or when emergency changes need expedited approval and retrospective
  documentation.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: compliance
  complexity: intermediate
  language: multi
  tags: gxp, change-control, revalidation, impact-assessment, compliance
---

# Manage Change Control

Evaluate, approve, implement, verify changes to validated computerized systems while maintaining validated state.

## When Use

- Validated system requires software upgrade, patch, or configuration change
- Infrastructure changes (server migration, OS upgrade, network change) affect validated systems
- CAPA or audit finding requires system modification
- Business process changes require system reconfiguration
- Emergency changes need expedited approval and retrospective documentation

## Inputs

- **Required**: Change description (what is changing and why)
- **Required**: System(s) affected and current validated state
- **Required**: Change requestor and business justification
- **Optional**: Vendor release notes or technical documentation
- **Optional**: Related CAPA or audit finding references
- **Optional**: Existing validation documentation for affected system(s)

## Steps

### Step 1: Create and Classify Change Request

```markdown
# Change Request
## Document ID: CR-[SYS]-[YYYY]-[NNN]

### 1. Change Description
**Requestor:** [Name, Department]
**Date:** [YYYY-MM-DD]
**System:** [System name and version]
**Current State:** [Current configuration/version]
**Proposed State:** [Target configuration/version]

### 2. Justification
[Business, regulatory, or technical reason for the change]

### 3. Classification
| Type | Definition | Approval Path | Timeline |
|------|-----------|--------------|----------|
| **Emergency** | Urgent fix for safety, data integrity, or regulatory compliance | System owner + QA (retrospective CCB) | Implement immediately, document within 5 days |
| **Standard** | Planned change with potential impact on validated state | CCB approval before implementation | Per CCB schedule |
| **Minor** | Low-risk change with no impact on validated state | System owner approval | Documented before implementation |

**This change is classified as:** [Emergency / Standard / Minor]
**Rationale:** [Why this classification]
```

**Got:** Change request has unique ID, clear description, justified classification.
**If fail:** Classification disputed? Default to Standard. Let CCB adjudicate.

### Step 2: Perform Impact Assessment

Evaluate change against all dimensions of validated state:

```markdown
# Impact Assessment
## Change Request: CR-[SYS]-[YYYY]-[NNN]

### Impact Matrix
| Dimension | Affected? | Details | Risk |
|-----------|-----------|---------|------|
| Software configuration | Yes/No | [Specific parameters changing] | [H/M/L] |
| Source code | Yes/No | [Modules, functions, or scripts affected] | [H/M/L] |
| Database schema | Yes/No | [Tables, fields, constraints changing] | [H/M/L] |
| Infrastructure | Yes/No | [Servers, network, storage affected] | [H/M/L] |
| Interfaces | Yes/No | [Upstream/downstream system connections] | [H/M/L] |
| User access/roles | Yes/No | [Role changes, new access requirements] | [H/M/L] |
| SOPs/work instructions | Yes/No | [Procedures requiring update] | [H/M/L] |
| Training | Yes/No | [Users requiring retraining] | [H/M/L] |
| Data migration | Yes/No | [Data transformation or migration needed] | [H/M/L] |
| Audit trail | Yes/No | [Impact on audit trail continuity] | [H/M/L] |

### Regulatory Impact
- [ ] Change affects 21 CFR Part 11 controls
- [ ] Change affects EU Annex 11 controls
- [ ] Change affects data integrity (ALCOA+)
- [ ] Change requires regulatory notification
```

**Got:** Every dimension assessed with clear yes/no and rationale.
**If fail:** Impact cannot be determined without testing? Classify dimension as "Unknown — requires investigation." Mandate sandbox evaluation before production change.

### Step 3: Determine Revalidation Scope

Based on impact assessment, define what validation activities needed:

```markdown
# Revalidation Determination

| Revalidation Level | Criteria | Activities Required |
|--------------------|----------|-------------------|
| **Full revalidation** | Core functionality changed, new GAMP category, or major version upgrade | URS review, RA update, IQ, OQ, PQ, TM update, VSR |
| **Partial revalidation** | Specific functions affected, configuration changes | Targeted OQ for affected functions, TM update |
| **Documentation only** | No functional impact, administrative changes | Update validation documents, change log entry |
| **None** | No impact on validated state (e.g., cosmetic change) | Change log entry only |

### Determination for CR-[SYS]-[YYYY]-[NNN]
**Revalidation level:** [Full / Partial / Documentation only / None]
**Rationale:** [Specific reasoning based on impact assessment]

### Required Activities
| Activity | Owner | Deadline |
|----------|-------|----------|
| [e.g., Execute OQ test cases TC-OQ-015 through TC-OQ-022] | [Name] | [Date] |
| [e.g., Update traceability matrix for URS-007] | [Name] | [Date] |
| [e.g., Update SOP-LIMS-003 section 4.2] | [Name] | [Date] |
```

**Got:** Revalidation scope proportional to change impact — no more, no less.
**If fail:** Revalidation scope contested? Err on side of more testing. Under-validation = regulatory risk. Over-validation = only resource cost.

### Step 4: Obtain Approval

Route change through appropriate approval workflow:

```markdown
# Change Approval

### Approval for: CR-[SYS]-[YYYY]-[NNN]

| Role | Name | Decision | Signature | Date |
|------|------|----------|-----------|------|
| System Owner | | Approve / Reject / Defer | | |
| QA Representative | | Approve / Reject / Defer | | |
| IT Representative | | Approve / Reject / Defer | | |
| Validation Lead | | Approve / Reject / Defer | | |

### Conditions (if any)
[Any conditions attached to the approval]

### Planned Implementation Window
- **Start:** [Date/Time]
- **End:** [Date/Time]
- **Rollback deadline:** [Point of no return]
```

**Got:** All required approvers signed before implementation begins (except emergency changes).
**If fail:** For emergency changes, obtain verbal approval from system owner and QA, implement change, complete formal documentation within 5 business days.

### Step 5: Implement and Verify

Execute change. Perform post-change verification:

```markdown
# Implementation Record

### Pre-Implementation
- [ ] Backup of current system state completed
- [ ] Rollback procedure documented and tested
- [ ] Affected users notified
- [ ] Test environment validated (if applicable)

### Implementation
- **Implemented by:** [Name]
- **Date/Time:** [YYYY-MM-DD HH:MM]
- **Steps performed:** [Detailed implementation steps]
- **Deviations from plan:** [None / Description]

### Post-Change Verification
| Verification | Result | Evidence |
|--------------|--------|----------|
| System accessible and functional | Pass/Fail | [Screenshot/log reference] |
| Changed functionality works as specified | Pass/Fail | [Test case reference] |
| Unchanged functionality unaffected (regression) | Pass/Fail | [Test case reference] |
| Audit trail continuity maintained | Pass/Fail | [Audit trail screenshot] |
| User access controls intact | Pass/Fail | [Access review reference] |

### Closure
- [ ] All verification activities completed successfully
- [ ] Validation documents updated per revalidation determination
- [ ] SOPs updated and effective
- [ ] Training completed for affected users
- [ ] Change record closed in change control system
```

**Got:** Implementation matches approved plan. All verification activities pass.
**If fail:** Verification fails? Execute rollback procedure immediately. Document failure as deviation. Do not proceed without QA concurrence.

## Checks

- [ ] Change request has unique ID, description, classification
- [ ] Impact assessment covers all dimensions (software, data, infrastructure, SOPs, training)
- [ ] Revalidation scope defined with rationale
- [ ] All required approvals obtained before implementation (or within 5 days for emergency)
- [ ] Pre-implementation backup and rollback procedure documented
- [ ] Post-change verification shows change works and nothing else broke
- [ ] Validation documents updated to reflect change
- [ ] Change record formally closed

## Pitfalls

- **Skipping impact assessment for "small" changes**: Even minor changes can have unexpected impacts. Configuration toggle that seems harmless may disable audit trail or change calculation.
- **Emergency change abuse**: More than 10% of changes classified as "emergency"? Change process being circumvented. Review and tighten emergency criteria.
- **Incomplete rollback planning**: Assuming rollback is "just restore backup" ignores data created between backup and rollback. Define data disposition for every rollback scenario.
- **Approval after implementation**: Retrospective approval (except for documented emergencies) = compliance violation. CCB must approve before work begins.
- **Missing regression testing**: Verifying only changed functionality insufficient. Regression testing must confirm existing validated functions remain unaffected.

## See Also

- `design-compliance-architecture` — defines governance framework including change control board
- `write-validation-documentation` — create revalidation documentation triggered by changes
- `perform-csv-assessment` — full CSV reassessment for major changes requiring full revalidation
- `write-standard-operating-procedure` — update SOPs affected by change
- `investigate-capa-root-cause` — when changes triggered by CAPAs
