---
name: qualify-vendor
description: >
  Qualify a vendor or supplier of GxP-relevant software or services. Covers
  vendor risk classification, assessment questionnaire design, desk and
  on-site audit approaches, quality agreement evaluation, SLA review, and
  ongoing monitoring cadence definition. Use when selecting a new vendor for
  a GxP-critical system, onboarding a cloud provider for regulated data,
  performing a periodic re-qualification, when a vendor audit finding requires
  re-assessment, or when EU Annex 11 or ICH Q10 requires supplier qualification.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: compliance
  complexity: intermediate
  language: multi
  tags: gxp, vendor, qualification, supplier, quality-agreement, compliance
---

# Qualify Vendor

Assess and qualify a vendor providing GxP-relevant software, infrastructure, or services to ensure they meet regulatory quality standards.

## When to Use

- Selecting a new vendor for a GxP-critical computerized system
- Onboarding a cloud service provider for regulated data
- Periodic re-qualification of an existing vendor is due
- A vendor audit finding requires re-assessment
- Regulatory requirement for supplier qualification (EU Annex 11 §3.4, ICH Q10)

## Inputs

- **Required**: Vendor name, product/service, and intended GxP use
- **Required**: Vendor risk classification criteria
- **Required**: Applicable regulatory requirements
- **Optional**: Vendor-provided quality documentation (ISO certifications, SOC reports)
- **Optional**: Previous vendor audit reports or qualification records
- **Optional**: Reference customer experiences

## Procedure

### Step 1: Classify Vendor Risk

Determine the vendor's risk level based on GxP impact:

```markdown
# Vendor Risk Classification
## Document ID: VRC-[VENDOR]-[YYYY]-[NNN]

### Risk Classification Criteria
| Factor | Weight | Critical | Major | Minor |
|--------|--------|----------|-------|-------|
| GxP impact | 40% | Directly processes GxP data or affects product quality | Supports GxP processes indirectly | No GxP impact |
| Data access | 20% | Accesses or stores GxP-regulated data | Accesses supporting data only | No data access |
| Substitutability | 15% | Sole source, no alternative | Limited alternatives | Multiple alternatives |
| Regulatory exposure | 15% | Subject to regulatory inspection | May be referenced in submissions | No regulatory exposure |
| Business criticality | 10% | System downtime stops operations | Downtime causes delays | Minimal operational impact |

### Vendor Classification
| Vendor | Product/Service | Risk Score | Classification | Qualification Approach |
|--------|----------------|------------|---------------|----------------------|
| [Vendor name] | [Product] | [Score] | Critical / Major / Minor | On-site audit / Desk audit / Questionnaire only |

### Qualification Approach by Risk
| Risk Level | Qualification Activities | Re-qualification Frequency |
|------------|------------------------|---------------------------|
| **Critical** | Questionnaire + desk audit + on-site audit | Annual |
| **Major** | Questionnaire + desk audit | Every 2 years |
| **Minor** | Questionnaire only | Every 3 years |
```

**Expected:** Vendor risk classification drives proportionate qualification effort.
**On failure:** If risk classification is disputed, default to the higher level. Under-qualifying a critical vendor is a regulatory risk.

### Step 2: Design and Send Assessment Questionnaire

```markdown
# Vendor Assessment Questionnaire
## Document ID: VAQ-[VENDOR]-[YYYY]-[NNN]

### Section 1: Company Information
1. Legal name, address, and parent company (if applicable)
2. Number of employees (total and in quality/development)
3. Products and services relevant to this qualification
4. Key customers in the pharmaceutical/life sciences industry

### Section 2: Quality Management System
5. Do you maintain a certified QMS? (ISO 9001, ISO 13485, ISO 27001 — provide certificates)
6. Describe your document control system
7. Describe your change management process
8. Describe your CAPA process
9. How do you handle customer complaints?
10. When was your last external audit? Provide the summary report.

### Section 3: Software Development (if applicable)
11. Describe your software development lifecycle (SDLC)
12. Do you follow GAMP 5, IEC 62304, or other development standards?
13. Describe your testing methodology (unit, integration, system, regression)
14. How do you manage source code (version control, branching, code review)?
15. Describe your release management process
16. How do you handle bug reports and patches?

### Section 4: Data Integrity and Security
17. How do you ensure data integrity (ALCOA+ principles)?
18. Describe your audit trail capabilities
19. Describe your access control model (role-based, attribute-based)
20. Describe your data backup and recovery procedures
21. Have you had any data breaches in the last 3 years? If yes, describe.
22. Provide your most recent SOC 2 Type II report (if available)

### Section 5: Regulatory Compliance
23. Are your products used in FDA-regulated or EU-regulated environments?
24. Can you provide a 21 CFR Part 11 compliance statement?
25. Can you provide an EU Annex 11 compliance statement?
26. Do you provide validation support documentation (IQ/OQ/PQ packs)?
27. How do you notify customers of changes that may affect their validated state?

### Section 6: Support and Service Level
28. Describe your support tiers and response times
29. What is your system availability target (uptime SLA)?
30. Describe your disaster recovery and business continuity plan
31. What is your customer notification process for planned and unplanned downtime?
32. What is your end-of-life/end-of-support policy?
```

**Expected:** Questionnaire sent to vendor with a response deadline (typically 4-6 weeks for critical vendors).
**On failure:** If the vendor cannot or will not complete the questionnaire, this is itself a risk indicator. Document the refusal and escalate to procurement and QA.

### Step 3: Evaluate Vendor Responses

Review and score the questionnaire responses:

```markdown
# Vendor Evaluation
## Document ID: VE-[VENDOR]-[YYYY]-[NNN]

### Response Evaluation Matrix
| Section | Score (1-5) | Key Findings | Acceptable? |
|---------|-------------|-------------|-------------|
| Quality Management System | [Score] | [Summary of findings] | [Yes/No/Conditional] |
| Software Development | [Score] | [Summary] | [Yes/No/Conditional] |
| Data Integrity and Security | [Score] | [Summary] | [Yes/No/Conditional] |
| Regulatory Compliance | [Score] | [Summary] | [Yes/No/Conditional] |
| Support and Service Level | [Score] | [Summary] | [Yes/No/Conditional] |

Score: 1 = Unacceptable, 2 = Significant gaps, 3 = Adequate with conditions, 4 = Good, 5 = Excellent

### Red Flags (automatic escalation)
- [ ] No QMS or expired certification
- [ ] No change notification process to customers
- [ ] No audit trail capability
- [ ] Data breach with no corrective action
- [ ] Cannot provide 21 CFR 11 or EU Annex 11 compliance statement
- [ ] No validation support documentation
```

**Expected:** Each section evaluated with clear findings and an overall acceptability determination.
**On failure:** If responses are incomplete or evasive, request clarification. Persistent non-responsiveness is a qualification failure criterion.

### Step 4: Conduct Audit (If Required)

For critical and major vendors, conduct a desk or on-site audit:

```markdown
# Vendor Audit Plan
## Document ID: VAP-[VENDOR]-[YYYY]-[NNN]

### Desk Audit (Remote)
| Document Requested | Received? | Assessment |
|-------------------|-----------|------------|
| QMS manual or overview | [Y/N] | [Finding] |
| SDLC documentation | [Y/N] | [Finding] |
| Most recent internal audit report | [Y/N] | [Finding] |
| SOC 2 Type II report | [Y/N] | [Finding] |
| 21 CFR 11 / EU Annex 11 compliance statement | [Y/N] | [Finding] |
| Sample release notes (last 3 releases) | [Y/N] | [Finding] |
| Customer notification examples | [Y/N] | [Finding] |

### On-Site Audit (if critical vendor)
| Area | Activities | Duration |
|------|-----------|----------|
| Quality system | Review QMS documentation, CAPA records, complaint handling | 2 hours |
| Development | Walk through SDLC, code review process, testing evidence | 2 hours |
| Operations | Observe data centre (if applicable), review security controls | 1 hour |
| Support | Review support ticket resolution, SLA compliance metrics | 1 hour |

### Audit Findings
| Finding ID | Area | Observation | Severity | Vendor Response Required? |
|-----------|------|-------------|----------|--------------------------|
| VF-001 | [Area] | [Observation] | [Major/Minor/Obs] | [Yes/No] |
```

**Expected:** Audit findings documented objectively with severity classification.
**On failure:** If an on-site audit cannot be arranged, conduct a thorough desk audit supplemented by video conference interviews.

### Step 5: Evaluate Quality Agreement and SLA

```markdown
# Quality Agreement Evaluation
## Document ID: QAE-[VENDOR]-[YYYY]-[NNN]

### Quality Agreement Checklist
| Clause | Present? | Adequate? | Comments |
|--------|----------|-----------|----------|
| Roles and responsibilities (vendor vs customer) | [Y/N] | [Y/N] | |
| Change notification (advance notice of changes) | [Y/N] | [Y/N] | [Minimum notice period?] |
| Audit rights (right to audit vendor) | [Y/N] | [Y/N] | [Frequency, scope?] |
| Data ownership and portability | [Y/N] | [Y/N] | [Data return on termination?] |
| Security and confidentiality obligations | [Y/N] | [Y/N] | |
| Regulatory inspection cooperation | [Y/N] | [Y/N] | [Vendor supports regulatory inspections?] |
| CAPA process for quality issues | [Y/N] | [Y/N] | |
| Validation support obligations | [Y/N] | [Y/N] | [IQ/OQ/PQ support?] |
| Subcontractor management | [Y/N] | [Y/N] | [Vendor's subcontractor quality?] |
| Termination and transition support | [Y/N] | [Y/N] | [Data migration support?] |

### SLA Evaluation
| Metric | Vendor Commitment | Industry Benchmark | Acceptable? |
|--------|------------------|-------------------|-------------|
| Availability (uptime) | [e.g., 99.9%] | 99.5% - 99.99% | [Y/N] |
| Response time (critical issues) | [e.g., 1 hour] | 1-4 hours | [Y/N] |
| Resolution time (critical issues) | [e.g., 4 hours] | 4-24 hours | [Y/N] |
| Planned maintenance notification | [e.g., 5 days] | 5-14 days | [Y/N] |
| Data backup frequency | [e.g., Daily] | Daily minimum | [Y/N] |
| Disaster recovery RTO | [e.g., 4 hours] | 4-24 hours | [Y/N] |
```

**Expected:** Quality agreement and SLA terms are reviewed for adequacy before contract signature.
**On failure:** If critical quality agreement clauses are missing, negotiate their inclusion. Do not qualify a vendor without adequate audit rights and change notification.

### Step 6: Issue Qualification Decision

```markdown
# Vendor Qualification Report
## Document ID: VENDOR-QUALIFICATION-[VENDOR]

### Qualification Summary
| Criterion | Result |
|-----------|--------|
| Vendor risk classification | [Critical / Major / Minor] |
| Questionnaire assessment | [Score/5] |
| Audit results (if applicable) | [Satisfactory / Satisfactory with conditions / Unsatisfactory] |
| Quality agreement | [Adequate / Needs revision] |
| SLA | [Adequate / Needs revision] |

### Qualification Decision
| Decision | Meaning |
|----------|---------|
| **Qualified** | Vendor meets all requirements; proceed with procurement |
| **Conditionally qualified** | Vendor meets most requirements; specific conditions must be met within defined timeline |
| **Not qualified** | Vendor does not meet requirements; do not proceed |

**Decision:** [Qualified / Conditionally Qualified / Not Qualified]
**Conditions (if applicable):** [List specific conditions with deadlines]

### Ongoing Monitoring
| Activity | Frequency | Responsible |
|----------|-----------|-------------|
| Performance metrics review | Quarterly | System owner |
| Quality agreement compliance | Annual | QA |
| Re-qualification audit/assessment | [Per risk level] | QA |
| Regulatory update review | As needed | Regulatory affairs |

### Approval
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Quality Assurance | | | |
| System Owner | | | |
| Procurement | | | |
```

**Expected:** Clear qualification decision with documented rationale and ongoing monitoring plan.
**On failure:** If the decision is "Not Qualified," document the specific deficiencies and communicate to procurement. Identify alternative vendors.

## Validation

- [ ] Vendor risk classified with documented rationale
- [ ] Assessment questionnaire covers QMS, development, security, compliance, and support
- [ ] Vendor responses evaluated with scored findings
- [ ] Audit conducted for critical and major vendors
- [ ] Quality agreement reviewed for all required clauses
- [ ] SLA evaluated against regulatory and business requirements
- [ ] Qualification decision documented with approval signatures
- [ ] Ongoing monitoring plan defined with frequency and responsibilities

## Common Pitfalls

- **Procurement before qualification**: Signing a contract before qualification is complete removes leverage for quality agreement negotiations and creates a compliance gap.
- **Questionnaire without verification**: Accepting vendor self-assessment at face value is insufficient. Verify key claims through audits, reference checks, or document review.
- **No change notification clause**: Without contractual change notification, a vendor can change their product or service in ways that impact your validated state without your knowledge.
- **Qualification as one-time event**: Vendor qualification is ongoing. Regular monitoring, re-qualification, and performance review are essential to sustained compliance.
- **Ignoring subcontractors**: If the vendor subcontracts critical services (e.g., hosting, development), the subcontractor's quality must also be assessed.

## Related Skills

- `design-compliance-architecture` — identifies which vendors require qualification
- `conduct-gxp-audit` — vendor audits follow the same methodology as internal audits
- `prepare-inspection-readiness` — vendor qualifications are frequently requested during inspections
- `manage-change-control` — vendor-initiated changes require change control assessment
- `perform-csv-assessment` — vendor qualification informs the validation approach for the vendor's product
