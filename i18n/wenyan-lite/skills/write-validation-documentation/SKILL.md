---
name: write-validation-documentation
locale: wenyan-lite
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

# 撰寫驗證文檔

為電腦化系統建立完整之 IQ/OQ/PQ 驗證文檔。

## 適用時機

- 為受規管使用驗證 R 或其他軟體
- 為法規稽核準備
- 記錄計算環境之資格認證
- 建立或更新驗證計畫書與報告

## 輸入

- **必要**：欲驗證之系統/軟體（名稱、版本、用途）
- **必要**：定義範圍與策略之驗證計畫
- **必要**：用戶需求規範
- **選擇性**：既有 SOP 範本
- **選擇性**：先前之驗證文檔（再資格認證用）

## 步驟

### 步驟一：撰寫安裝資格認證（IQ）計畫書

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

**預期：** `validation/iq/iq_protocol.md` 完整,含獨特文檔 ID、目的、前置清單、R 安裝與每所需套件之測試案例、偏差段及核准欄位。

**失敗時：** 若組織需不同文檔格式,調整範本以匹配既有 SOP。關鍵欄位（要求、程序、預期結果、實際結果、合格/不合格）不論格式皆須保留。

### 步驟二：撰寫操作資格認證（OQ）計畫書

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

**預期：** `validation/oq/oq_protocol.md` 含資料匯入、統計計算與錯誤處理之測試案例,各有特定測試資料、預期結果（適用處含容差）與證據要求。

**失敗時：** 若測試資料尚不可用,建立具已知性質之合成測試資料集。記錄資料生成方法,使結果得獨立驗證。

### 步驟三：撰寫效能資格認證（PQ）計畫書

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

**預期：** `validation/pq/pq_protocol.md` 含端到端測試案例,用真實世界（或代表性）資料,結果對獨立參考計算（如 SAS 輸出）比較。容差明確定義。

**失敗時：** 若獨立參考結果不可用,記錄缺口並用雙重程式設計（兩獨立 R 實作）作為替代驗證方法。將 PQ 標為暫定,直至獨立驗證完成。

### 步驟四：撰寫資格認證報告

執行計畫書後,記錄結果：

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

**預期：** 資格認證報告（IQ、OQ、PQ）完整,所有測試結果填入、偏差記錄（或「無觀察到」）、結論陳述,核准簽名欄位準備好供簽核。

**失敗時：** 若執行中發生測試失敗,將每失敗以根因分析與解決記錄為偏差。觀察到失敗時勿留偏差段空白。

### 步驟五：盡可能自動化

建立產生證據之自動測試腳本：

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

**預期：** `validation/scripts/` 中之自動腳本產生證據文件（如 `iq_evidence.txt`）,各測試案例含時間戳結果,降低手動資料輸入並確保可重現性。

**失敗時：** 若自動腳本因環境差異失敗,手動運行並以 `sink()` 擷取輸出。於資格認證報告中記錄自動與手動執行間之任何差異。

## 驗證

- [ ] 所有計畫書有獨特文檔 ID
- [ ] 計畫書引用驗證計畫
- [ ] 測試案例有清晰之合格/不合格準則
- [ ] 報告含所有已執行測試結果
- [ ] 偏差以解決記錄
- [ ] 核准簽名已獲
- [ ] 文檔遵循組織之 SOP 範本

## 常見陷阱

- **模糊接受準則**：「系統運作正確」不可測試。指定確切預期值
- **缺證據**：每測試結果需支持證據（截圖、日誌、輸出文件）
- **不完整之偏差處理**：所有失敗須記錄、調查並解決
- **文檔無版本控制**：驗證文檔如代碼般需變更控制
- **跳過再資格認證**：系統更新（R 版本、套件更新）需再資格認證評估

## 相關技能

- `setup-gxp-r-project` — 已驗證環境之專案結構
- `implement-audit-trail` — 電子記錄追蹤
- `validate-statistical-output` — 輸出驗證方法
