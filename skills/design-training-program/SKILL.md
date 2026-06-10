---
name: design-training-program
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

Create a role-based GxP training programme with curriculum, competency assessments, and record management for regulated environments.

## When to Use

- A new validated system requires user training before go-live
- An audit finding cites inadequate training or missing training records
- Organisational changes introduce new roles or responsibilities
- Periodic review of the training programme is due
- Regulatory inspection preparation requires demonstrating training adequacy

## Inputs

- **Required**: Systems and processes requiring trained personnel
- **Required**: Role definitions (administrator, user, QA, management)
- **Required**: Applicable regulatory requirements for training (GMP, GLP, GCP)
- **Optional**: Existing training materials or curricula
- **Optional**: Competency gaps identified in audits or performance reviews
- **Optional**: Training management system capabilities

## Procedure

### Step 1: Conduct Training Needs Analysis

Identify what each role needs to know:

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

**Expected:** Every role has defined training requirements linked to their job function and GxP responsibilities.
**On failure:** If roles are not clearly defined, conduct a RACI exercise first to establish responsibilities before defining training needs.

### Step 2: Design the Curriculum

Structure training into modules by topic:

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

**Expected:** Each module has defined duration, delivery method, audience, and specific content outline.
**On failure:** If content is too broad for the allocated time, split into sub-modules or create prerequisite chains.

### Step 3: Create Competency Assessments

Define how competency is measured for each module:

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

**Expected:** Assessments test both knowledge (understanding why) and skill (demonstrating how).
**On failure:** If pass rates are below 70%, review the training materials for clarity before blaming the learners.

### Step 4: Define Training Records and Retention

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

**Expected:** Training records demonstrate that every person performing GxP activities was trained and assessed before performing those activities.
**On failure:** If training records are incomplete, conduct a retrospective training gap assessment and implement immediate remediation training.

### Step 5: Define Retraining Triggers

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

**Expected:** Retraining triggers are specific, measurable, and linked to defined timelines.
**On failure:** If retraining is not completed before the trigger deadline, the individual must not perform the affected GxP activities until training is complete.

### Step 6: Compile the Training Programme Document

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

**Expected:** Complete training programme approved and effective before system go-live or compliance deadline.
**On failure:** If approval is delayed, implement interim training measures and document the plan to formalise.

## Validation

- [ ] Training needs analysis completed for all roles interacting with GxP systems
- [ ] Curriculum modules defined with duration, delivery method, and content outline
- [ ] Competency assessments exist for each module with defined passing criteria
- [ ] Training matrix tracks all personnel against all required training
- [ ] Training record retention meets regulatory requirements
- [ ] Retraining triggers are defined with timelines and assessment requirements
- [ ] Training programme approved by QA and management

## Common Pitfalls

- **Training = reading the SOP**: Read-and-sign is appropriate for minor updates, not for initial training. New users need instructor-led training with hands-on practice.
- **No competency assessment**: Training without assessment cannot demonstrate that learning occurred. Regulators expect evidence of competence, not just attendance.
- **Trainer not qualified**: Trainers must be demonstrably competent in the subject. "Train the trainer" records are frequently requested during inspections.
- **Stale training matrix**: A training matrix that is not updated when people join, leave, or change roles creates compliance gaps. Integrate with HR processes.
- **One-size-fits-all**: Administrators need deeper training than end users. Role-based curriculum avoids overwhelming some users while under-training others.

## Related Skills

- `write-standard-operating-procedure` — SOPs drive training content and retraining triggers
- `design-compliance-architecture` — identifies which systems and roles require training
- `conduct-gxp-audit` — audits frequently assess training adequacy
- `manage-change-control` — system changes trigger retraining requirements
- `prepare-inspection-readiness` — training records are a primary inspection target
