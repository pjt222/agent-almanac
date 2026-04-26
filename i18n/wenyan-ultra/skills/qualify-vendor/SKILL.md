---
name: qualify-vendor
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
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

# 資商

評資 GxP 軟、基或服之商以確其達規質準。

## 用

- 為 GxP 要系擇新商→用
- 為循資接雲服→用
- 期重資現商→用
- 商審發需再評→用
- 規需供資（EU Annex 11 §3.4、ICH Q10）→用

## 入

- **必**：商名、品/服、欲 GxP 用
- **必**：商險分則
- **必**：應規需
- **可**：商供質文（ISO 證、SOC 報）
- **可**：前商審報或資錄
- **可**：參用驗

## 行

### 一：分商險

按 GxP 影定商險級：

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

得：商險分驅相稱資力。
敗：分有議→默高級。要商不足資為規險。

### 二：設並送評問卷

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

得：問卷送商含應期（要商常 4-6 週）。
敗：商不能或不願填→此本身為險指。記拒並升至採與 QA。

### 三：評商應

察並評問卷應：

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

得：諸段評含明發與總可受決。
敗：應不全或避→求釋。持不應為資敗則。

### 四：行審（若需）

要與大商→行案或場審：

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

得：審發客記含重分。
敗：場審不能辦→徹案審加視會問。

### 五：評質約與 SLA

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

得：質約與 SLA 條約於約簽前察足。
敗：要質約款缺→談入之。無足審權與變告勿資商。

### 六：發資決

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

得：明資決含記由與續監計。
敗：決為「不資」→記特缺與告採。識備商。

## 驗

- [ ] 商險分含記由
- [ ] 評問卷涵 QMS、開、安、循、支
- [ ] 商應評含分發
- [ ] 要與大商行審
- [ ] 質約諸需款察
- [ ] SLA 對規與商需評
- [ ] 資決記含批簽
- [ ] 續監計定含頻與責

## 忌

- **資前採**：資前簽約除質約談力、立循缺
- **問卷無驗**：受商自評不足。要主由審、參察、文察驗
- **無變告款**：無約變告、商可變品或服影汝循態而汝不知
- **資為一時事**：商資為續。常監、重資、效察為續循之要
- **忽分包**：商分要服（如託、開）→分包質亦察

## 參

- `design-compliance-architecture` — 識何商需資
- `conduct-gxp-audit` — 商審循內審同法
- `prepare-inspection-readiness` — 商資於檢中常求
- `manage-change-control` — 商起變需變控評
- `perform-csv-assessment` — 商資告商品之驗徑
