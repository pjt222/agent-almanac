---
name: perform-csv-assessment
locale: wenyan-lite
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

# 行 CSV 評估

於受規環境，依 GAMP 5 風險為本之方法論行電腦系統驗證評估。

## 適用時機

- GxP 環境中將引入新電腦化系統
- 既有經驗證系統正歷重大變更
- 須行定期重驗證
- 法規檢查在即，須驗證缺口分析

## 輸入

- **必要**：系統描述（名、用途、廠商、版本）
- **必要**：擬用聲明與法規上下文（GxP 範圍）
- **必要**：GAMP 5 軟體類別（1–5）
- **選擇性**：既有用戶需求規格（URS）
- **選擇性**：廠商文件（設計規格、發布說明、SOP）
- **選擇性**：先前驗證文件

## 步驟

### 步驟一：辨 GAMP 5 軟體類別

將系統分類：

| Category | Type | Example | Validation Effort |
|----------|------|---------|-------------------|
| 1 | Infrastructure software | OS, firmware | Low — verify installation |
| 3 | Non-configured product | COTS as-is | Low-Medium — verify functionality |
| 4 | Configured product | LIMS with config | Medium-High — verify configuration |
| 5 | Custom application | Bespoke R/Shiny app | High — full lifecycle validation |

**預期：** 類別已明賦並記理據。
**失敗時：** 若類別模糊，預設較高類別並記理據。

### 步驟二：寫用戶需求規格（URS）

建附編號需求之 URS 文件：

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

**預期：** 所有需求皆有獨立 ID、優先級與對源之追溯。
**失敗時：** 對無清晰來源或優先級之需求，標予利害關係人審。

### 步驟三：行風險評估

施 GAMP 5 風險為本之法，用 Failure Mode and Effects Analysis（FMEA）：

```markdown
# Risk Assessment
## Document ID: RA-[SYS]-[NNN]

| Req ID | Failure Mode | Severity (1-5) | Probability (1-5) | Detectability (1-5) | RPN | Risk Level | Mitigation |
|--------|-------------|----------------|-------------------|---------------------|-----|------------|------------|
| URS-001 | Incorrect BMI calculation | 4 | 2 | 1 | 8 | Low | OQ test case |
| URS-002 | Audit trail entries missing | 5 | 3 | 3 | 45 | High | IQ + OQ + monitoring |
| URS-011 | Unauthorized access | 5 | 2 | 2 | 20 | Medium | OQ test + periodic review |
```

Risk Priority Number（RPN）= Severity x Probability x Detectability。

| RPN Range | Risk Level | Testing Requirement |
|-----------|------------|---------------------|
| 1–12 | Low | Basic verification |
| 13–36 | Medium | Documented test case |
| 37+ | High | Full IQ/OQ/PQ with retest |

**預期：** 每 URS 需求皆有對應之風險評估列。
**失敗時：** 將未評之需求上呈驗證主導者後再行。

### 步驟四：定驗證策略（驗證計劃）

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

**預期：** 測試執行前，驗證計劃經所有利害關係人核准。
**失敗時：** 無經核准之驗證計劃即不行測試執行。

### 步驟五：建測試協議（IQ/OQ/PQ）

為每資格階段寫測試腳本：

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

**預期：** 每中與高風險需求皆至少有一測試案。
**失敗時：** 執行始前加缺漏之測試案。

### 步驟六：建追溯矩陣

建需求追溯矩陣（RTM），連每需求經風險評估至測試案：

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

**預期：** 100% URS 需求現於追溯矩陣中，附連結之測試結果。
**失敗時：** 任何未連測試結果之需求皆標為驗證缺口。

### 步驟七：寫驗證摘要報告

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

**預期：** 報告引所有驗證交付物，附明確之通過/失敗結論。
**失敗時：** 若偏差未解，報告當以「有條件」狀態記之，附 CAPA 引用。

## 驗證

- [ ] GAMP 5 類別已賦予並具理據
- [ ] URS 有編號需求、優先級與對源之追溯
- [ ] 風險評估覆蓋所有 URS 需求
- [ ] 測試執行前驗證計劃已核准
- [ ] 測試協議有前提、步驟、預期結果與簽署欄
- [ ] 追溯矩陣連每需求於風險與測試結果
- [ ] 驗證摘要報告記諸活動、偏差與結論
- [ ] 所有文件皆有獨立文件 ID 與版本控制

## 常見陷阱

- **過度驗證**：將類別 5 之力施於類別 3 軟體，浪費資源。力與風險相應。
- **追溯缺漏**：不能追溯至測試案之需求乃隱形缺口。
- **無計劃即測試**：驗證計劃核准前執行測試使結果無效。
- **忽略非功能需求**：安全、性能與資料完整性需求常被忽。
- **靜態驗證**：將驗證視為一次性事件。變更需重評。

## 相關技能

- `setup-gxp-r-project` — 經驗證 R 環境之專案結構
- `write-validation-documentation` — IQ/OQ/PQ 協議與報告寫作
- `implement-audit-trail` — 電子記錄之審計追蹤實施
- `validate-statistical-output` — 統計輸出驗證方法
- `conduct-gxp-audit` — 經驗證系統之稽核
