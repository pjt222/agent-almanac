---
name: write-validation-documentation
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Write IQ/OQ/PQ validation documentation for computerized systems
  in regulated environments. Covers protocols, reports, test scripts,
  deviation handling, and approval workflows. Use when validating R or
  other software for regulated use, preparing for a regulatory audit,
  documenting qualification of computing environments, or creating and
  updating validation protocols and reports for new or re-qualified
  systems.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: compliance
  complexity: advanced
  language: R
  tags: validation, iq-oq-pq, documentation, gxp, qualification
---

# 書驗文

立全 IQ/OQ/PQ 驗文於計系。

## 用時

- 驗 R 或他軟為監管用
- 為監管審備
- 錄計境之驗
- 立或更驗程與報

## 入

- **必要**：欲驗之系/軟（名、版、用）
- **必要**：定範與策之驗計
- **必要**：用戶要規
- **可選**：現 SOP 模
- **可選**：前驗文（為再驗）

## 法

### 第一步：書安裝驗（IQ）程

```markdown
# Installation Qualification Protocol
**System**: R Statistical Computing Environment
**Version**: 4.5.0
**Document ID**: IQ-PROJ-001
**Prepared by**: [Name] | **Date**: [Date]
**Reviewed by**: [Name] | **Date**: [Date]
**Approved by**: [Name] | **Date**: [Date]

## 1. Objective
Verify that R and required packages are correctly installed per specifications.

## 2. Prerequisites
- [ ] Server/workstation meets hardware requirements
- [ ] Operating system qualified
- [ ] Network access available (for package downloads)

## 3. Test Cases

### IQ-001: R Installation
| Field | Value |
|-------|-------|
| Requirement | R version 4.5.0 correctly installed |
| Procedure | Open R console, execute `R.version.string` |
| Expected Result | "R version 4.5.0 (2025-04-11)" |
| Actual Result | ______________________ |
| Pass/Fail | [ ] |
| Executed by | ____________ Date: ________ |

### IQ-002: Package Inventory
| Package | Required Version | Installed Version | Pass/Fail |
|---------|-----------------|-------------------|-----------|
| dplyr | 1.1.4 | | [ ] |
| ggplot2 | 3.5.0 | | [ ] |
| survival | 3.7-0 | | [ ] |

## 4. Deviations
[Document any deviations from expected results and their resolution]

## 5. Conclusion
[ ] All IQ tests PASSED - system installation verified
[ ] IQ tests FAILED - see deviation section
```

得：`validation/iq/iq_protocol.md` 完，附唯文 ID、目、先決清、為 R 裝與每需包之試例、偏差段、與批域。

敗則：組需異文式者，調模配現 SOP。要域（要、程、期果、實果、過敗）無論何式皆須存。

### 第二步：書運作驗（OQ）程

```markdown
# Operational Qualification Protocol
**Document ID**: OQ-PROJ-001

## 1. Objective
Verify that the system operates correctly under normal conditions.

## 2. Test Cases

### OQ-001: Data Import Functionality
| Field | Value |
|-------|-------|
| Requirement | System correctly imports CSV files |
| Test Data | validation/test_data/import_test.csv (MD5: abc123) |
| Procedure | Execute `read.csv("import_test.csv")` |
| Expected | Data frame with 100 rows, 5 columns |
| Actual Result | ______________________ |
| Evidence | Screenshot/log file reference |

### OQ-002: Statistical Calculations
| Field | Value |
|-------|-------|
| Requirement | t-test produces correct results |
| Test Data | Known dataset: x = c(2.1, 2.5, 2.3), y = c(3.1, 3.5, 3.3) |
| Procedure | Execute `t.test(x, y)` |
| Expected | t = -5.000, df = 4, p = 0.00753 |
| Actual Result | ______________________ |
| Tolerance | ±0.001 |

### OQ-003: Error Handling
| Field | Value |
|-------|-------|
| Requirement | System handles invalid input gracefully |
| Procedure | Execute `analysis_function(invalid_input)` |
| Expected | Informative error message, no crash |
| Actual Result | ______________________ |
```

得：`validation/oq/oq_protocol.md` 含為數入、統計算、訛處之試例，各有特試數、期果（適時附容）、與證要。

敗則：試數未得者，立合成試數附已知性。錄數生法以使果可獨驗。

### 第三步：書效驗（PQ）程

```markdown
# Performance Qualification Protocol
**Document ID**: PQ-PROJ-001

## 1. Objective
Verify the system performs as intended with real-world data and workflows.

## 2. Test Cases

### PQ-001: End-to-End Primary Analysis
| Field | Value |
|-------|-------|
| Requirement | Primary endpoint analysis matches reference |
| Test Data | Blinded test dataset (hash: sha256:abc...) |
| Reference | Independent SAS calculation (report ref: SAS-001) |
| Procedure | Execute full analysis pipeline |
| Expected | Estimate within ±0.001 of reference |
| Actual Result | ______________________ |

### PQ-002: Report Generation
| Field | Value |
|-------|-------|
| Requirement | Generated report contains all required sections |
| Procedure | Execute report generation script |
| Checklist | |
| | [ ] Title page with study information |
| | [ ] Table of contents |
| | [ ] Demographic summary table |
| | [ ] Primary analysis results |
| | [ ] Appendix with session info |
```

得：`validation/pq/pq_protocol.md` 含端到端試例，用實世（或代）數，果對獨參計（如 SAS 出）較。容明定。

敗則：獨參果未得者，記其缺並用雙編程（兩獨 R 之施）為別驗法。標 PQ 為暫直至獨驗畢。

### 第四步：書驗報

執程後，記果：

```markdown
# Installation Qualification Report
**Document ID**: IQ-RPT-001
**Protocol Reference**: IQ-PROJ-001

## 1. Summary
All IQ test cases were executed on [date] by [name].

## 2. Results Summary
| Test ID | Description | Result |
|---------|-------------|--------|
| IQ-001 | R Installation | PASS |
| IQ-002 | Package Inventory | PASS |

## 3. Deviations
None observed.

## 4. Conclusion
The installation of R 4.5.0 and associated packages has been verified
and meets all specified requirements.

## 5. Approvals
| Role | Name | Signature | Date |
|------|------|-----------|------|
| Executor | | | |
| Reviewer | | | |
| Approver | | | |
```

得：驗報（IQ、OQ、PQ）完，諸試果已充、偏差已錄（或「None observed」）、結論已述、批簽域待簽。

敗則：執中試敗者，每敗錄為偏差附根因析與解。觀察敗時，勿留偏差段空。

### 第五步：可時自之

立自試本生證：

```r
# validation/scripts/run_iq.R
sink("validation/iq/iq_evidence.txt")
cat("IQ Execution Date:", format(Sys.time()), "\n\n")

cat("IQ-001: R Version\n")
cat("Result:", R.version.string, "\n")
cat("Status:", ifelse(R.version$major == "4" && R.version$minor == "5.0",
                      "PASS", "FAIL"), "\n\n")

cat("IQ-002: Package Versions\n")
required <- renv::dependencies()
installed <- installed.packages()
# ... comparison logic
sink()
```

得：`validation/scripts/` 中自本生證文（如 `iq_evidence.txt`），附每試例之時印果，減手入而保可重。

敗則：自本因境異而敗者，手行而以 `sink()` 捕出。錄自與手執之差於驗報。

## 驗

- [ ] 諸程有唯文 ID
- [ ] 程引驗計
- [ ] 試例有明過敗準
- [ ] 報含諸執試果
- [ ] 偏差已錄附解
- [ ] 批簽已得
- [ ] 文從組之 SOP 模

## 陷

- **泛接受準**：「系正運」不可試。指精期值
- **缺證**：每試果需證（圖、記、出文）
- **不全偏差處**：諸敗皆須錄、究、解
- **文無版控**：驗文需變控如碼
- **略再驗**：系更（R 版、包更）需再驗評

## 參

- `setup-gxp-r-project` - 為已驗境之項目結構
- `implement-audit-trail` - 電錄追
- `validate-statistical-output` - 出驗法
