---
name: qualify-vendor
locale: wenyan-lite
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

# 評定供應商

評估並評定提供 GxP 相關軟體、基礎設施或服務之供應商，使其達法規品質標準。

## 適用時機

- 為 GxP 關鍵電腦化系統擇新供應商
- 為法規資料引入雲端服務商
- 既有供應商之定期重評期已至
- 供應商稽核發現要求重新評估
- 法規要求供應商評定（EU Annex 11 §3.4、ICH Q10）

## 輸入

- **必要**：供應商名、產品／服務、擬用之 GxP 用途
- **必要**：供應商風險分類準則
- **必要**：適用之法規要求
- **選擇性**：供應商提供之品質文件（ISO 認證、SOC 報告）
- **選擇性**：先前之稽核或評定紀錄
- **選擇性**：客戶推薦之經驗

## 步驟

### 步驟一：分類供應商風險

依其 GxP 影響定供應商之風險層級：

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

**預期：** 供應商風險分類驅動成比例之評定努力。
**失敗時：** 若分類有爭議，預設為較高層級。低估關鍵供應商之分類為法規風險。

### 步驟二：設計並寄送評估問卷

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

**預期：** 問卷已寄予供應商，附回覆期限（關鍵供應商通常為 4-6 週）。
**失敗時：** 若供應商不能或不願填卷，本身即風險指標。記錄拒填並升至採購與 QA。

### 步驟三：評估供應商之回覆

審視並為問卷回覆評分：

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

**預期：** 各節皆已評估，含明確之發現與整體可接受性之判定。
**失敗時：** 若回覆不全或閃避，請求釐清。持續不回應為評定失敗之準則。

### 步驟四：執行稽核（若需）

對關鍵與重大供應商，執行桌面或現場稽核：

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

**預期：** 稽核發現以客觀方式記錄，並附嚴重度分類。
**失敗時：** 若無法安排現場稽核，以徹底之桌面稽核加視訊訪談補之。

### 步驟五：評估品質協議與 SLA

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

**預期：** 品質協議與 SLA 條款已於簽約前審其充足。
**失敗時：** 若關鍵之品質協議條款缺漏，協商納入。無充足之稽核權與變更通知，勿評定供應商。

### 步驟六：發出評定決定

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

**預期：** 明確之評定決定，附記錄之理由與後續監測計畫。
**失敗時：** 若決定為「不評定」，記具體缺失並通知採購。辨識替代供應商。

## 驗證

- [ ] 供應商風險已分類，附記錄之理由
- [ ] 評估問卷涵蓋 QMS、開發、安全、合規與支援
- [ ] 已評估供應商回覆並附評分發現
- [ ] 已對關鍵與重大供應商執行稽核
- [ ] 品質協議已審所需條款
- [ ] SLA 已對法規與業務需求加以評估
- [ ] 評定決定已記錄，附核可簽署
- [ ] 已界定後續監測計畫，含頻率與職責

## 常見陷阱

- **未評定先採購**：評定未盡即簽約，喪失品質協議協商之槓桿，並造合規缺口。
- **問卷無驗證**：照單全收供應商之自評不足。以稽核、推薦查證或文件審查驗關鍵主張。
- **無變更通知條款**：無契約上之變更通知，供應商可能於不知情下變更其產品或服務，影響你之驗證狀態。
- **以評定為一次性事件**：評定為持續性。常規監測、重評定與績效檢視為合規之必要。
- **忽略次承包商**：若供應商將關鍵服務（如代管、開發）次包出去，次承包商之品質亦須評估。

## 相關技能

- `design-compliance-architecture` —— 辨明哪些供應商須評定
- `conduct-gxp-audit` —— 供應商稽核循內部稽核之同法
- `prepare-inspection-readiness` —— 受檢時常被要求供應商評定
- `manage-change-control` —— 供應商發起之變更須變更控制評估
- `perform-csv-assessment` —— 供應商評定為其產品之驗證路線提供依據
