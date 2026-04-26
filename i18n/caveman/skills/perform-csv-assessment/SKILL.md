---
name: perform-csv-assessment
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Perform Computer Systems Validation (CSV) assessment following GAMP 5
  methodology. Covers user requirements, risk assessment, IQ/OQ/PQ planning,
  traceability matrix creation, and validation summary reporting. Use when
  new computerized system being introduced in GxP environment, when existing
  validated system undergoing significant change, when periodic revalidation
  required, or when regulatory inspection demands validation gap analysis.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: compliance
  complexity: advanced
  language: multi
  tags: csv, gamp-5, validation, risk-assessment, iq-oq-pq, traceability
---

# Perform CSV Assessment

Conduct Computer Systems Validation assessment using GAMP 5 risk-based methodology for regulated environments.

## When Use

- New computerized system being introduced in GxP environment
- Existing validated system undergoing significant change
- Periodic revalidation required
- Regulatory inspection prep demands validation gap analysis

## Inputs

- **Required**: System description (name, purpose, vendor, version)
- **Required**: Intended use statement and regulatory context (GxP scope)
- **Required**: GAMP 5 software category (1–5)
- **Optional**: Existing user requirements specification (URS)
- **Optional**: Vendor documentation (design specs, release notes, SOPs)
- **Optional**: Previous validation documentation

## Steps

### Step 1: Determine GAMP 5 Software Category

Classify the system:

| Category | Type | Example | Validation Effort |
|----------|------|---------|-------------------|
| 1 | Infrastructure software | OS, firmware | Low — verify installation |
| 3 | Non-configured product | COTS as-is | Low-Medium — verify functionality |
| 4 | Configured product | LIMS with config | Medium-High — verify configuration |
| 5 | Custom application | Bespoke R/Shiny app | High — full lifecycle validation |

**Got:** Category clearly assigned with rationale documented.
**If fail:** Category ambiguous? Default to higher category, document rationale.

### Step 2: Write User Requirements Specification (URS)

Create URS document with numbered requirements:

```markdown
# User Requirements Specification
## System: [System Name] v[Version]
## Document ID: URS-[SYS]-[NNN]

### 1. Purpose
[Intended use statement]

### 2. Functional Requirements
| ID | Requirement | Priority | Source |
|----|-------------|----------|--------|
| URS-001 | System shall calculate BMI from height and weight inputs | Must | Regulatory SOP-xxx |
| URS-002 | System shall generate audit trail entries for all data changes | Must | 21 CFR 11.10(e) |
| URS-003 | System shall export results in PDF format | Should | User request |

### 3. Non-Functional Requirements
| ID | Requirement | Priority | Source |
|----|-------------|----------|--------|
| URS-010 | System shall respond within 3 seconds for standard queries | Should | Usability |
| URS-011 | System shall restrict access via role-based authentication | Must | 21 CFR 11.10(d) |

### 4. Data Integrity Requirements
[ALCOA+ requirements: Attributable, Legible, Contemporaneous, Original, Accurate]

### 5. Regulatory Requirements
[Specific 21 CFR Part 11, EU Annex 11, or other applicable requirements]
```

**Got:** All requirements have unique IDs, priorities, traceability to source.
**If fail:** Flag requirements without clear source or priority for stakeholder review.

### Step 3: Perform Risk Assessment

Apply GAMP 5 risk-based approach using Failure Mode and Effects Analysis (FMEA):

```markdown
# Risk Assessment
## Document ID: RA-[SYS]-[NNN]

| Req ID | Failure Mode | Severity (1-5) | Probability (1-5) | Detectability (1-5) | RPN | Risk Level | Mitigation |
|--------|-------------|----------------|-------------------|---------------------|-----|------------|------------|
| URS-001 | Incorrect BMI calculation | 4 | 2 | 1 | 8 | Low | OQ test case |
| URS-002 | Audit trail entries missing | 5 | 3 | 3 | 45 | High | IQ + OQ + monitoring |
| URS-011 | Unauthorized access | 5 | 2 | 2 | 20 | Medium | OQ test + periodic review |
```

Risk Priority Number (RPN) = Severity x Probability x Detectability.

| RPN Range | Risk Level | Testing Requirement |
|-----------|------------|---------------------|
| 1–12 | Low | Basic verification |
| 13–36 | Medium | Documented test case |
| 37+ | High | Full IQ/OQ/PQ with retest |

**Got:** Every URS requirement has corresponding risk assessment row.
**If fail:** Escalate unassessed requirements to validation lead before proceeding.

### Step 4: Define Validation Strategy (Validation Plan)

```markdown
# Validation Plan
## Document ID: VP-[SYS]-[NNN]

### Scope
- System: [Name] v[Version]
- GAMP Category: [N]
- Validation approach: [Prospective / Retrospective / Concurrent]

### Qualification Stages
| Stage | Scope | Applies? | Rationale |
|-------|-------|----------|-----------|
| IQ | Installation correctness | Yes | Verify installation, dependencies, configuration |
| OQ | Operational requirements | Yes | Verify functional requirements from URS |
| PQ | Performance under real conditions | [Yes/No] | [Rationale] |

### Roles and Responsibilities
| Role | Name | Responsibility |
|------|------|---------------|
| Validation Lead | [Name] | Plan, coordinate, approve |
| Tester | [Name] | Execute test scripts |
| System Owner | [Name] | Approve for production use |
| QA | [Name] | Review and sign-off |

### Acceptance Criteria
- All critical test cases pass
- No unresolved critical or major deviations
- Traceability matrix complete
```

**Got:** Validation plan approved by all stakeholders before test execution.
**If fail:** Don't proceed to test execution without approved validation plan.

### Step 5: Create Test Protocols (IQ/OQ/PQ)

Write test scripts for each qualification stage:

```markdown
# Operational Qualification Protocol
## Test Case: TC-OQ-001
## Traces to: URS-001

**Objective:** Verify BMI calculation accuracy

**Prerequisites:**
- System installed per IQ protocol
- Test data set prepared

**Test Steps:**
| Step | Action | Expected Result | Actual Result | Pass/Fail |
|------|--------|-----------------|---------------|-----------|
| 1 | Enter height=180cm, weight=75kg | BMI displayed as 23.15 | | |
| 2 | Enter height=160cm, weight=90kg | BMI displayed as 35.16 | | |
| 3 | Enter height=0, weight=75kg | Error message displayed | | |

**Tester:** _________ Date: _________
**Reviewer:** _________ Date: _________
```

**Got:** Every medium- and high-risk requirement has at least one test case.
**If fail:** Add missing test cases before execution begins.

### Step 6: Build Traceability Matrix

Create Requirements Traceability Matrix (RTM) linking every requirement through risk assessment to test cases:

```markdown
# Traceability Matrix
## Document ID: TM-[SYS]-[NNN]

| URS ID | Requirement | Risk Level | Test Case(s) | Test Result | Status |
|--------|-------------|------------|--------------|-------------|--------|
| URS-001 | BMI calculation | Low | TC-OQ-001 | Pass | Verified |
| URS-002 | Audit trail | High | TC-IQ-003, TC-OQ-005 | Pass | Verified |
| URS-003 | PDF export | Low | TC-OQ-008 | Pass | Verified |
| URS-011 | Role-based access | Medium | TC-OQ-010, TC-OQ-011 | Pass | Verified |
```

**Got:** 100% of URS requirements appear in traceability matrix with linked test results.
**If fail:** Any requirement without linked test result flagged as validation gap.

### Step 7: Write Validation Summary Report

```markdown
# Validation Summary Report
## Document ID: VSR-[SYS]-[NNN]

### 1. Executive Summary
[System name] v[version] has been validated in accordance with [VP document ID].

### 2. Validation Activities Performed
| Activity | Document ID | Status |
|----------|-------------|--------|
| User Requirements | URS-SYS-001 | Approved |
| Risk Assessment | RA-SYS-001 | Approved |
| Validation Plan | VP-SYS-001 | Approved |
| IQ Protocol/Report | IQ-SYS-001 | Executed — Pass |
| OQ Protocol/Report | OQ-SYS-001 | Executed — Pass |
| Traceability Matrix | TM-SYS-001 | Complete |

### 3. Deviations
| Dev ID | Description | Impact | Resolution |
|--------|-------------|--------|------------|
| DEV-001 | [Description] | [Impact assessment] | [Resolution and rationale] |

### 4. Conclusion
The system meets all user requirements as documented in [URS ID]. The validation is considered [Successful / Successful with conditions].

### 5. Approval
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Validation Lead | | | |
| System Owner | | | |
| Quality Assurance | | | |
```

**Got:** Report references all validation deliverables with clear pass/fail conclusion.
**If fail:** Deviations unresolved? Report must state "conditional" status with CAPA references.

## Checks

- [ ] GAMP 5 category assigned with documented rationale
- [ ] URS has numbered requirements with priorities and traceability to source
- [ ] Risk assessment covers every URS requirement
- [ ] Validation plan approved before test execution
- [ ] Test protocols have prerequisite, step, expected result, signature fields
- [ ] Traceability matrix links every requirement to risk and test results
- [ ] Validation summary report documents all activities, deviations, conclusion
- [ ] All documents have unique document IDs and version control

## Pitfalls

- **Over-validation**: Applying Category 5 effort to Category 3 software wastes resources. Match effort to risk.
- **Missing traceability**: Requirements that don't trace through to test cases are invisible gaps.
- **Testing without plan**: Executing tests before validation plan approved invalidates results.
- **Ignoring non-functional requirements**: Security, performance, data integrity requirements often overlooked.
- **Static validation**: Treating validation as one-time event. Changes require re-assessment.

## See Also

- `setup-gxp-r-project` — project structure for validated R environments
- `write-validation-documentation` — IQ/OQ/PQ protocol and report writing
- `implement-audit-trail` — audit trail implementation for electronic records
- `validate-statistical-output` — statistical output verification methodology
- `conduct-gxp-audit` — auditing validated systems
