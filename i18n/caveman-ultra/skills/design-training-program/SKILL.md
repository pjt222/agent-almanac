---
name: design-training-program
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Design a GxP training programme covering training needs analysis by role,
  curriculum design (regulatory awareness, system-specific, data integrity),
  competency assessment criteria, training record retention, and retraining
  triggers for SOP revisions and incidents. Use when a new validated system
  requires user training before go-live, an audit finding cites inadequate
  training, organisational changes introduce new roles, a periodic programme
  review is due, or inspection preparation requires demonstrating training
  adequacy.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: compliance
  complexity: intermediate
  language: multi
  tags: gxp, training, competency, compliance, quality-management, curriculum
---

# Design Training Program

Role-based GxP program → curriculum + competency + records for regulated envs.

## Use When

- New validated sys → user training pre go-live
- Audit finds inadequate training / missing records
- Org change → new roles/responsibilities
- Periodic program review due
- Regulatory inspection prep → prove training adequacy

## In

- **Required**: Systems + processes needing trained personnel
- **Required**: Role defs (admin, user, QA, mgmt)
- **Required**: Applicable regulatory reqs (GMP, GLP, GCP)
- **Optional**: Existing materials/curricula
- **Optional**: Competency gaps from audits/reviews
- **Optional**: Training mgmt sys capabilities

## Do

### Step 1: Training Needs Analysis

Per role: what need to know?

```markdown
# Training Needs Analysis
## Document ID: TNA-[DEPT]-[YYYY]-[NNN]

### Role-Based Training Requirements

| Role | GxP Awareness | System Training | Data Integrity | SOP Training | Assessment Type |
|------|--------------|----------------|----------------|--------------|-----------------|
| System Administrator | Advanced | Advanced | Advanced | Admin SOPs | Written + Practical |
| End User | Basic | Intermediate | Intermediate | Operational SOPs | Written + Practical |
| QA Reviewer | Advanced | Basic (review focus) | Advanced | QA SOPs | Written |
| Management | Basic | Overview only | Intermediate | Governance SOPs | Written |
| IT Support | Basic | Infrastructure only | Basic | IT SOPs | Written |

### Training Gap Analysis
| Role | Current Competency | Required Competency | Gap | Priority |
|------|-------------------|---------------------|-----|----------|
| [Role] | [Current level] | [Required level] | [Gap description] | [H/M/L] |
```

→ Every role → defined training reqs linked to job + GxP duties.
If err: roles unclear → RACI exercise first → set duties before training needs.

### Step 2: Curriculum

Modules by topic:

```markdown
# Training Curriculum
## Document ID: TC-[DEPT]-[YYYY]-[NNN]

### Module 1: GxP Regulatory Awareness
**Duration:** 2 hours | **Delivery:** Classroom / eLearning | **Audience:** All roles
**Content:**
1. Introduction to GxP regulations (GMP, GLP, GCP overview)
2. 21 CFR Part 11 and EU Annex 11 requirements for electronic records
3. Data integrity principles (ALCOA+)
4. Consequences of non-compliance (warning letters, consent decrees, product recalls)
5. Individual responsibilities and accountability

### Module 2: System-Specific Training — [System Name]
**Duration:** 4 hours | **Delivery:** Instructor-led with hands-on | **Audience:** Users, Admins
**Content:**
1. System purpose and GxP classification
2. Login, navigation, and role-based access
3. Core workflows (step-by-step for each user task)
4. Electronic signature procedures
5. Audit trail: how entries are created and what they mean
6. Error handling and deviation reporting
7. Data entry best practices

### Module 3: Data Integrity in Practice
**Duration:** 1.5 hours | **Delivery:** Workshop | **Audience:** Users, QA, Admins
**Content:**
1. ALCOA+ principles with system-specific examples
2. Common data integrity risks and how to avoid them
3. Recognising and reporting data integrity concerns
4. Audit trail review basics
5. Case studies: real-world data integrity failures and lessons learned

### Module 4: SOP Training — [SOP-ID]
**Duration:** 1 hour per SOP | **Delivery:** Read and sign / walkthrough | **Audience:** Per SOP scope
**Content:**
1. SOP purpose and scope
2. Step-by-step procedure walkthrough
3. Decision points and deviation handling
4. Forms and documentation requirements
5. Q&A and clarification
```

→ Each module: duration + delivery + audience + content.
If err: content too broad for time → split or prereq chains.

### Step 3: Competency Assessments

How competency measured per module:

```markdown
# Competency Assessment Design

### Assessment Types
| Type | When to Use | Passing Score | Records |
|------|------------|---------------|---------|
| **Written test** | Knowledge assessment (regulations, principles) | 80% | Score sheet retained |
| **Practical demonstration** | Skill assessment (system operation) | All critical steps correct | Signed observation form |
| **Observed task** | On-the-job competency | Supervisor sign-off | Competency form |

### Sample Written Assessment — GxP Awareness (Module 1)
1. List the five ALCOA principles for data integrity. (5 points)
2. Under 21 CFR 11.50, what three elements must an electronic signature display? (3 points)
3. You discover that a colleague's data entry contains an error. Describe the correct procedure to correct it. (5 points)
4. True/False: A shared login account can be used if all users sign a logbook. (2 points — answer: False)
5. Describe one consequence of a data integrity failure for a pharmaceutical company. (5 points)

**Passing score:** 16/20 (80%)
**On failure:** Retraining required before re-assessment. Maximum 2 re-attempts.

### Practical Assessment Template
| Step | Task | Observed? | Performed Correctly? | Comments |
|------|------|-----------|---------------------|----------|
| 1 | Log in with personal credentials | Yes/No | Yes/No | |
| 2 | Navigate to [specific function] | Yes/No | Yes/No | |
| 3 | Enter test data correctly | Yes/No | Yes/No | |
| 4 | Apply electronic signature | Yes/No | Yes/No | |
| 5 | Locate and interpret audit trail | Yes/No | Yes/No | |

**Assessor:** _______ **Date:** _______ **Result:** Pass / Fail
```

→ Assessments test knowledge (why) + skill (how).
If err: pass rates <70% → review materials for clarity first, not blame learners.

### Step 4: Records + Retention

```markdown
# Training Record Management

### Required Training Records
| Record | Format | Retention Period | Storage |
|--------|--------|-----------------|---------|
| Training matrix (who needs what) | Electronic | Current + 2 years superseded | Training management system |
| Individual training transcript | Electronic | Employment + 2 years | Training management system |
| Assessment results | Electronic or paper | Same as transcript | Training management system |
| Training materials (version used) | Electronic | Life of system + 1 year | Document management system |
| Trainer qualification records | Electronic | Employment + 2 years | HR system |

### Training Matrix Template
| Employee | Role | Module 1 | Module 2 | Module 3 | SOP-001 | SOP-002 | Status |
|----------|------|----------|----------|----------|---------|---------|--------|
| J. Smith | User | 2026-01-15 ✓ | 2026-01-16 ✓ | Due 2026-03-01 | 2026-01-20 ✓ | N/A | Partially trained |
| K. Jones | Admin | 2026-01-15 ✓ | 2026-01-17 ✓ | 2026-01-18 ✓ | 2026-01-20 ✓ | 2026-01-20 ✓ | Fully trained |
```

→ Records prove every GxP-performing person trained + assessed before activity.
If err: records incomplete → retrospective gap assessment + immediate remediation training.

### Step 5: Retraining Triggers

```markdown
# Retraining Triggers

| Trigger | Scope | Timeline | Assessment Required? |
|---------|-------|----------|---------------------|
| SOP revision (minor) | Affected users — read and sign | Before new version effective | No — read and acknowledge |
| SOP revision (major) | Affected users — formal retraining | Before new version effective | Yes — written or practical |
| System upgrade | All users of affected functionality | Before production go-live | Yes — practical demonstration |
| Data integrity incident | Involved personnel + department | Within 30 days of investigation closure | Yes — written |
| Audit finding (training-related) | Per CAPA scope | Per CAPA timeline | Per CAPA requirements |
| Annual refresher | All GxP personnel | Annual from initial training date | No — refresher acknowledgement |
| Role change | Individual | Before assuming new responsibilities | Yes — per new role requirements |
| Extended absence (>6 months) | Returning individual | Before resuming GxP activities | Yes — practical assessment |
```

→ Triggers specific + measurable + timelined.
If err: retraining not done by trigger deadline → individual must not perform GxP until done.

### Step 6: Compile Program Doc

```markdown
# Training Programme
## Document ID: TRAINING-PROGRAM-[DEPT]-[YYYY]-[NNN]

### 1. Purpose and Scope
### 2. Training Needs Analysis [Step 1]
### 3. Curriculum [Step 2]
### 4. Competency Assessments [Step 3]
### 5. Training Records and Retention [Step 4]
### 6. Retraining Triggers [Step 5]
### 7. Programme Review
- Annual review of training effectiveness (pass rates, audit findings, incidents)
- Curriculum update when systems, SOPs, or regulations change
- Trainer qualification verification

### 8. Approval
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Training Manager | | | |
| QA Director | | | |
| Department Head | | | |
```

→ Full program approved + effective before go-live / compliance deadline.
If err: approval delayed → interim training measures + plan to formalize.

## Check

- [ ] Needs analysis done for all GxP-touching roles
- [ ] Curriculum modules: duration + delivery + content outline
- [ ] Assessments per module + defined passing criteria
- [ ] Matrix tracks all personnel vs required training
- [ ] Retention meets regulatory reqs
- [ ] Retraining triggers: timelines + assessment reqs
- [ ] Program approved by QA + mgmt

## Traps

- **Training = read SOP**: Read-and-sign OK for minor updates, NOT initial training. New users need instructor-led + hands-on.
- **No assessment**: Training w/o assessment can't prove learning. Regulators want competence evidence, not attendance.
- **Trainer unqualified**: Trainers must be demonstrably competent. "Train the trainer" records often requested in inspections.
- **Stale matrix**: Not updated on join/leave/role-change → compliance gaps. Integrate w/ HR.
- **One-size-fits-all**: Admins need deeper training than end users. Role-based avoids overwhelm + under-train.

## →

- `write-standard-operating-procedure` — SOPs drive content + retraining triggers
- `design-compliance-architecture` — IDs systems + roles needing training
- `conduct-gxp-audit` — audits often assess training adequacy
- `manage-change-control` — sys changes trigger retraining
- `prepare-inspection-readiness` — records are primary inspection target
