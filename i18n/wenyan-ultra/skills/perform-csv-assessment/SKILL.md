---
name: perform-csv-assessment
locale: wenyan-ultra
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

# 行 CSV 評

依 GAMP 5 險基法為受監境之計算系驗。

## 用

- GxP 境引新系
- 舊驗系大變
- 期重驗
- 巡備求驗隙析

## 入

- **必**：系述（名、用、商、版）
- **必**：用旨+監境（GxP 範）
- **必**：GAMP 5 軟類（1-5）
- **可**：現 URS
- **可**：商文（設、釋、SOP）
- **可**：舊驗文

## 行

### 一：定 GAMP 5 軟類

分類：

| Category | Type | Example | Validation Effort |
|----------|------|---------|-------------------|
| 1 | Infrastructure software | OS, firmware | Low — verify installation |
| 3 | Non-configured product | COTS as-is | Low-Medium — verify functionality |
| 4 | Configured product | LIMS with config | Medium-High — verify configuration |
| 5 | Custom application | Bespoke R/Shiny app | High — full lifecycle validation |

**得：** 類明賦+因錄。
**敗：** 類歧→默高類+錄因。

### 二：書 URS

立 URS 文+號求：

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

**得：** 諸求皆有獨號、優、源。
**敗：** 無清源/優之求→旗以待干係人審。

### 三：行險評

施 GAMP 5 險基（FMEA）：

```markdown
# Risk Assessment
## Document ID: RA-[SYS]-[NNN]

| Req ID | Failure Mode | Severity (1-5) | Probability (1-5) | Detectability (1-5) | RPN | Risk Level | Mitigation |
|--------|-------------|----------------|-------------------|---------------------|-----|------------|------------|
| URS-001 | Incorrect BMI calculation | 4 | 2 | 1 | 8 | Low | OQ test case |
| URS-002 | Audit trail entries missing | 5 | 3 | 3 | 45 | High | IQ + OQ + monitoring |
| URS-011 | Unauthorized access | 5 | 2 | 2 | 20 | Medium | OQ test + periodic review |
```

RPN = 重 × 概 × 察。

| RPN Range | Risk Level | Testing Requirement |
|-----------|------------|---------------------|
| 1–12 | Low | Basic verification |
| 13–36 | Medium | Documented test case |
| 37+ | High | Full IQ/OQ/PQ with retest |

**得：** 各 URS 求皆有對應險評行。
**敗：** 未評之求→升驗主導前處。

### 四：定驗策（驗計）

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

**得：** 試行前諸干係人批驗計。
**敗：** 計未批勿行試。

### 五：立試程（IQ/OQ/PQ）

各驗階寫試本：

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

**得：** 諸中+高險求皆至少一試例。
**敗：** 行前補缺之試例。

### 六：立追溯陣

立 RTM、由各求經險評至試例：

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

**得：** 100% URS 求現於 RTM+鏈接試果。
**敗：** 任求無鏈試果→旗為驗隙。

### 七：書驗要報

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

**得：** 報引諸驗交付+清成/敗結。
**敗：** 偏差未決→報須言「條件」狀+CAPA 引。

## 驗

- [ ] GAMP 5 類賦+錄因
- [ ] URS 有號求+優+源追溯
- [ ] 險評涵諸 URS 求
- [ ] 試行前驗計批
- [ ] 試程有先決、步、預果、簽位
- [ ] RTM 鏈各求至險+試果
- [ ] 驗要報錄諸動、偏差、結
- [ ] 諸文皆有獨號+版控

## 忌

- **過驗**：類 5 力施於類 3 軟費資—力依險合
- **缺追溯**：求不貫至試例→隱隙
- **無計而試**：批驗計前行試→果無效
- **忽非功能**：安、性能、料整之求常忽
- **靜驗**：視驗為一次—變則重評

## 參

- `setup-gxp-r-project`
- `write-validation-documentation`
- `implement-audit-trail`
- `validate-statistical-output`
- `conduct-gxp-audit`
