---
name: perform-csv-assessment
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Perform a Computer Systems Validation (CSV) assessment following GAMP 5
  methodology. Covers user requirements, risk assessment, IQ/OQ/PQ planning,
  traceability matrix creation, and validation summary reporting. Use when a
  new computerized system is being introduced in a GxP environment, when an
  existing validated system is undergoing significant change, when periodic
  revalidation is required, or when a regulatory inspection demands a
  validation gap analysis.
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

CSV via GAMP 5 risk-based for regulated envs.

## Use When

- New computerized system in GxP env
- Existing validated system has significant change
- Periodic revalidation required
- Regulatory inspection prep → gap analysis

## In

- **Required**: System desc (name, purpose, vendor, version)
- **Required**: Intended use + regulatory context (GxP scope)
- **Required**: GAMP 5 software category (1-5)
- **Optional**: Existing URS
- **Optional**: Vendor docs (specs, release notes, SOPs)
- **Optional**: Prev validation docs

## Do

### Step 1: Determine GAMP 5 category

Classify:

| Category | Type | Example | Validation Effort |
|----------|------|---------|-------------------|
| 1 | Infrastructure software | OS, firmware | Low — verify installation |
| 3 | Non-configured product | COTS as-is | Low-Medium — verify functionality |
| 4 | Configured product | LIMS with config | Medium-High — verify configuration |
| 5 | Custom application | Bespoke R/Shiny app | High — full lifecycle validation |

→ Category assigned, rationale documented.

If err: ambiguous → default to higher cat + document rationale.

### Step 2: Write URS

Numbered requirements:

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

→ All reqs have unique IDs, priorities, traceable source.

If err: no clear source/priority → flag for stakeholder review.

### Step 3: Risk assessment

GAMP 5 risk-based via FMEA:

```markdown
# Risk Assessment
## Document ID: RA-[SYS]-[NNN]

| Req ID | Failure Mode | Severity (1-5) | Probability (1-5) | Detectability (1-5) | RPN | Risk Level | Mitigation |
|--------|-------------|----------------|-------------------|---------------------|-----|------------|------------|
| URS-001 | Incorrect BMI calculation | 4 | 2 | 1 | 8 | Low | OQ test case |
| URS-002 | Audit trail entries missing | 5 | 3 | 3 | 45 | High | IQ + OQ + monitoring |
| URS-011 | Unauthorized access | 5 | 2 | 2 | 20 | Medium | OQ test + periodic review |
```

RPN = Severity × Probability × Detectability.

| RPN Range | Risk Level | Testing Requirement |
|-----------|------------|---------------------|
| 1–12 | Low | Basic verification |
| 13–36 | Medium | Documented test case |
| 37+ | High | Full IQ/OQ/PQ with retest |

→ Every URS requirement has corresponding risk row.

If err: unassessed → escalate to validation lead before proceed.

### Step 4: Validation plan

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

→ Plan approved by stakeholders before test execution.

If err: no approved plan → don't proceed to test execution.

### Step 5: Test protocols (IQ/OQ/PQ)

Test scripts per stage:

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

→ Every medium/high-risk req has ≥1 test case.

If err: missing test cases → add before execution.

### Step 6: Traceability matrix

RTM links req → risk → test:

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

→ 100% URS requirements in matrix w/ linked test results.

If err: req no linked test → flag as validation gap.

### Step 7: Validation summary report

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

→ Report references all deliverables w/ clear pass/fail conclusion.

If err: deviations unresolved → "conditional" status w/ CAPA refs.

## Check

- [ ] GAMP 5 category assigned w/ rationale
- [ ] URS w/ numbered reqs + priorities + traceable source
- [ ] Risk assessment covers every URS req
- [ ] Validation plan approved before test execution
- [ ] Test protocols have prerequisite, step, expected, signature fields
- [ ] Traceability matrix links req → risk → test results
- [ ] VSR documents activities, deviations, conclusion
- [ ] All docs have unique IDs + version control

## Traps

- **Over-validation**: Cat 5 effort on Cat 3 software = waste. Match effort to risk
- **Missing traceability**: reqs not tracing to tests = invisible gaps
- **Test before plan**: tests executed before plan approved → invalid results
- **Ignore non-functional**: security, perf, data integrity often overlooked
- **Static validation**: one-time event. Changes need re-assessment

## →

- `setup-gxp-r-project` — project structure for validated R envs
- `write-validation-documentation` — IQ/OQ/PQ protocol + report writing
- `implement-audit-trail` — audit trail for electronic records
- `validate-statistical-output` — stat output verification
- `conduct-gxp-audit` — auditing validated systems
