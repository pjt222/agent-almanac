---
name: manage-change-control
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Manage change control for validated computerized sys. Change req triage
  (emergency, standard, minor), impact assessment on validated state,
  revalidation scope, approval workflows, implementation tracking, post-change
  verification. Use when validated sys needs SW upgrade / patch / config
  change, infrastructure changes affect validated sys, CAPA requires sys mod,
  or emergency changes need expedited approval + retrospective docs.
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

Evaluate, approve, implement, verify changes to validated computerized sys while maintaining validated state.

## Use When

- Validated sys needs SW upgrade / patch / config change
- Infrastructure changes (server migration, OS upgrade, network) affect validated sys
- CAPA / audit finding requires sys mod
- Biz process changes require sys reconfig
- Emergency changes need expedited approval + retrospective docs

## In

- **Req**: Change description (what + why)
- **Req**: System(s) affected + current validated state
- **Req**: Requestor + biz justification
- **Opt**: Vendor release notes / tech docs
- **Opt**: Related CAPA / audit finding refs
- **Opt**: Existing validation docs for affected sys

## Do

### Step 1: Create + Classify Change Request

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

→ Req has unique ID, clear description, justified classification.

**If err:** Classification disputed → default Standard + let CCB adjudicate.

### Step 2: Impact Assessment

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

→ Every dimension assessed w/ clear y/n + rationale.

**If err:** Impact can't be determined w/o testing → classify "Unknown — requires investigation" + mandate sandbox eval before prod change.

### Step 3: Determine Revalidation Scope

Based on impact → define validation activities:

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

→ Revalidation scope proportional to impact — no more, no less.

**If err:** Scope contested → err toward more testing. Under-validation = regulatory risk; over-validation = only resource cost.

### Step 4: Obtain Approval

Route thru appropriate approval workflow:

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

→ All approvers signed before implementation (except emergency).

**If err:** Emergency → obtain verbal approval from sys owner + QA, implement, complete formal docs within 5 biz days.

### Step 5: Implement + Verify

Execute change + post-change verification:

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

→ Implementation matches approved plan, all verification passes.

**If err:** Verification fails → rollback immediately + document as deviation. Don't proceed w/o QA concurrence.

## Check

- [ ] Req has unique ID, description, classification
- [ ] Impact assessment covers all dimensions
- [ ] Revalidation scope defined w/ rationale
- [ ] All approvals obtained before implementation (or w/in 5 days emergency)
- [ ] Pre-impl backup + rollback procedure documented
- [ ] Post-change verification shows change works + nothing else broke
- [ ] Validation docs updated
- [ ] Record formally closed

## Traps

- **Skip impact assessment for "small" changes**: Even minor can have unexpected impacts. Config toggle seeming harmless may disable audit trail / change calc.
- **Emergency abuse**: >10% classified "emergency" → process being circumvented. Review + tighten criteria.
- **Incomplete rollback planning**: "Just restore backup" ignores data created between backup + rollback. Define data disposition per scenario.
- **Approval after implementation**: Retrospective approval (except emergencies) = compliance violation. CCB must approve before work.
- **Missing regression testing**: Verify only changed func insufficient. Regression must confirm existing validated fns unaffected.

## →

- `design-compliance-architecture` — defines governance framework incl CCB
- `write-validation-documentation` — create revalidation docs triggered by changes
- `perform-csv-assessment` — full CSV reassessment for major changes needing full revalidation
- `write-standard-operating-procedure` — update SOPs affected by change
- `investigate-capa-root-cause` — when changes triggered by CAPAs
