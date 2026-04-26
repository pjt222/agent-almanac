---
name: perform-csv-assessment
locale: wenyan
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

依 GAMP 5 法行計算機系統驗證（CSV）評於監管之境。

## 用時

- GxP 境引新計系乃用
- 已驗系遇大變乃用
- 定期再驗乃用
- 監管察驗備須驗證隙析乃用

## 入

- **必要**：系述（名、用、供、版）
- **必要**：擬用聲與監管脈（GxP 範）
- **必要**：GAMP 5 軟件類（1–5）
- **可選**：既有用者求規（URS）
- **可選**：供商文（設規、發注、SOP）
- **可選**：先驗證文

## 法

### 第一步：定 GAMP 5 軟件類

類分系：

| Category | Type | Example | Validation Effort |
|----------|------|---------|-------------------|
| 1 | Infrastructure software | OS, firmware | Low — verify installation |
| 3 | Non-configured product | COTS as-is | Low-Medium — verify functionality |
| 4 | Configured product | LIMS with config | Medium-High — verify configuration |
| 5 | Custom application | Bespoke R/Shiny app | High — full lifecycle validation |

**得：** 類已明賦附依據書於文。
**敗則：** 類混者，默高類並書其據。

### 第二步：書用者求規（URS）

建 URS 文附編號之求：

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

**得：** 諸求皆有獨識、優、與至源之追。
**敗則：** 無明源或優之求標供股東察。

### 第三步：行險評

依 GAMP 5 險基法行 FMEA：

```markdown
# Risk Assessment
## Document ID: RA-[SYS]-[NNN]

| Req ID | Failure Mode | Severity (1-5) | Probability (1-5) | Detectability (1-5) | RPN | Risk Level | Mitigation |
|--------|-------------|----------------|-------------------|---------------------|-----|------------|------------|
| URS-001 | Incorrect BMI calculation | 4 | 2 | 1 | 8 | Low | OQ test case |
| URS-002 | Audit trail entries missing | 5 | 3 | 3 | 45 | High | IQ + OQ + monitoring |
| URS-011 | Unauthorized access | 5 | 2 | 2 | 20 | Medium | OQ test + periodic review |
```

險優先數（RPN）= 嚴 x 概 x 可察。

| RPN Range | Risk Level | Testing Requirement |
|-----------|------------|---------------------|
| 1–12 | Low | Basic verification |
| 13–36 | Medium | Documented test case |
| 37+ | High | Full IQ/OQ/PQ with retest |

**得：** 諸 URS 求皆有對應險評行。
**敗則：** 未評之求升至驗證主再進。

### 第四步：定驗證策（驗證計）

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

**得：** 試行前驗證計已諸股東批准。
**敗則：** 無批之驗證計，勿進試行。

### 第五步：建試程（IQ/OQ/PQ）

各驗階書試本：

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

**得：** 諸中高險之求至少有一試例。
**敗則：** 始行前加缺試例。

### 第六步：建追溯矩陣

建求追溯矩陣（RTM）連諸求經險評至試例：

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

**得：** 100% URS 求現於追溯矩陣附連試果。
**敗則：** 無連試果之求標為驗證隙。

### 第七步：書驗證摘報

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

**得：** 報引諸驗證交付附明過/失之結。
**敗則：** 偏未解者，報必述「條件」態附 CAPA 引。

## 驗

- [ ] GAMP 5 類已賦附書依據
- [ ] URS 有編號之求附優與至源之追
- [ ] 險評覆諸 URS 求
- [ ] 驗證計於試行前已批
- [ ] 試程含前提、步、預期果、與簽位
- [ ] 追溯矩陣連諸求至險與試果
- [ ] 驗證摘報書諸活、偏、與結
- [ ] 諸文有獨識與版控

## 陷

- **過驗證**：以類五力施類三軟件費資。力宜合險
- **缺追溯**：不溯至試例之求為隱隙
- **無計而試**：批前試行使果失效
- **忽非功能求**：安、性、據完整求常忽
- **靜驗證**：以驗證為一時事。變須再評

## 參

- `setup-gxp-r-project` — 已驗 R 境之項目構
- `write-validation-documentation` — IQ/OQ/PQ 程與報書
- `implement-audit-trail` — 電子記之察驗軌跡行
- `validate-statistical-output` — 統計出驗法
- `conduct-gxp-audit` — 已驗系之察
