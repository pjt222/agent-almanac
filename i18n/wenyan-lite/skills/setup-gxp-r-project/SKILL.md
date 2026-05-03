---
name: setup-gxp-r-project
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Set up an R project structure compliant with GxP regulations
  (21 CFR Part 11, EU Annex 11). Covers validated environments,
  qualification documentation, change control, and electronic records
  requirements. Use when starting an R analysis project in a regulated
  environment (pharma, biotech, medical devices), setting up R for clinical
  trial analysis, creating a validated computing environment for regulatory
  submissions, or implementing 21 CFR Part 11 or EU Annex 11 requirements.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: compliance
  complexity: advanced
  language: R
  tags: gxp, validation, regulatory, pharma, 21-cfr-part-11
---

# 設置 GxP R 項目

建立符合 GxP 法規之 R 項目結構，以滿足驗證計算之要求。

## 適用時機

- 於受監管環境（製藥、生物技術、醫療設備）啟動 R 分析項目
- 設置 R 用於臨床試驗分析
- 為法規送件建立驗證之計算環境
- 實作 21 CFR Part 11 或 EU Annex 11 要求

## 輸入

- **必要**：項目範圍與法規框架（FDA、EMA 或兩者）
- **必要**：欲驗證之 R 版本與套件版本
- **必要**：驗證策略（基於風險之方法）
- **選擇性**：電腦化系統之既有 SOP
- **選擇性**：品質管理系統整合要求

## 步驟

### 步驟一：建立驗證項目結構

```
gxp-project/
├── R/                          # Analysis scripts
│   ├── 01_data_import.R
│   ├── 02_data_processing.R
│   └── 03_analysis.R
├── validation/                 # Validation documentation
│   ├── validation_plan.md      # VP: scope, strategy, roles
│   ├── risk_assessment.md      # Risk categorization
│   ├── iq/                     # Installation Qualification
│   │   ├── iq_protocol.md
│   │   └── iq_report.md
│   ├── oq/                     # Operational Qualification
│   │   ├── oq_protocol.md
│   │   └── oq_report.md
│   ├── pq/                     # Performance Qualification
│   │   ├── pq_protocol.md
│   │   └── pq_report.md
│   └── traceability_matrix.md  # Requirements to tests mapping
├── tests/                      # Automated test suite
│   ├── testthat.R
│   └── testthat/
│       ├── test-data_import.R
│       └── test-analysis.R
├── data/                       # Input data (controlled)
│   ├── raw/                    # Immutable raw data
│   └── derived/                # Processed datasets
├── output/                     # Analysis outputs
├── docs/                       # Supporting documentation
│   ├── sop_references.md       # Links to relevant SOPs
│   └── change_log.md           # Manual change documentation
├── renv.lock                   # Locked dependencies
├── DESCRIPTION                 # Project metadata
├── .Rprofile                   # Session configuration
└── CLAUDE.md                   # AI assistant instructions
```

**預期：** 完整目錄結構已存，含 `R/`、`validation/`（含 `iq/`、`oq/`、`pq/` 子目錄）、`tests/testthat/`、`data/raw/`、`data/derived/`、`output/` 與 `docs/` 目錄。

**失敗時：** 若目錄缺失，以 `mkdir -p` 建立。驗證你於正確項目根。對既有項目，僅建缺失目錄而不覆蓋既有結構。

### 步驟二：建立驗證計劃

建立 `validation/validation_plan.md`：

```markdown
# Validation Plan

## 1. Purpose
This plan defines the validation strategy for [Project Name] using R [version].

## 2. Scope
- R version: 4.5.0
- Packages: [list with versions]
- Analysis: [description]
- Regulatory framework: 21 CFR Part 11 / EU Annex 11

## 3. Risk Assessment Approach
Using GAMP 5 risk-based categories:
- Category 3: Non-configured products (R base)
- Category 4: Configured products (R packages with default settings)
- Category 5: Custom applications (custom R scripts)

## 4. Validation Activities
| Activity | Category 3 | Category 4 | Category 5 |
|----------|-----------|-----------|-----------|
| IQ | Required | Required | Required |
| OQ | Reduced | Standard | Enhanced |
| PQ | N/A | Standard | Enhanced |

## 5. Roles and Responsibilities
- Validation Lead: [Name]
- Developer: [Name]
- QA Reviewer: [Name]
- Approver: [Name]

## 6. Acceptance Criteria
All tests must pass with documented evidence.
```

**預期：** `validation/validation_plan.md` 完整含範圍、GAMP 5 風險類別、驗證活動矩陣、角色與責任、接受標準。計劃參照具體 R 版本與法規框架。

**失敗時：** 若法規框架不清，諮詢組織之 QA 部門以查適用 SOP。計劃未經審視與批准前，勿進行驗證活動。

### 步驟三：以 renv 鎖定依賴

```r
# Initialize renv with exact versions
renv::init()

# Install specific validated versions
renv::install("dplyr@1.1.4")
renv::install("ggplot2@3.5.0")

# Snapshot
renv::snapshot()
```

`renv.lock` 文件作為受控之套件清單。

**預期：** `renv.lock` 已存，所有所需套件附精確版本號。`renv::status()` 報告無問題。每套件版本已固定（如 `dplyr@1.1.4`），非浮動。

**失敗時：** 若 `renv::install()` 對特定版本失敗，檢查該版本存於 CRAN 歸檔。對歸檔版本用 `renv::install("package@version", repos = "https://packagemanager.posit.co/cran/latest")`。

### 步驟四：實作版本控制

```bash
git init
git add .
git commit -m "Initial validated project structure"

# Use signed commits for traceability
git config user.signingkey YOUR_GPG_KEY
git config commit.gpgsign true
```

**預期：** 項目於 git 版本控制下，啟用簽署提交。初始提交含已驗證之項目結構與 `renv.lock`。

**失敗時：** 若 GPG 簽署失敗，以 `gpg --list-secret-keys` 驗證 GPG 鑰已配置。對無 GPG 之環境，記錄偏差並用未簽署提交，於 `docs/change_log.md` 中作手動審計軌跡條目。

### 步驟五：建立 IQ 協議

`validation/iq/iq_protocol.md`：

```markdown
# Installation Qualification Protocol

## Objective
Verify that R and required packages are correctly installed.

## Test Cases

### IQ-001: R Version Verification
- **Requirement**: R 4.5.0 installed
- **Procedure**: Execute `R.version.string`
- **Expected:** "R version 4.5.0 (date)"
- **Result**: [ PASS / FAIL ]

### IQ-002: Package Installation Verification
- **Requirement**: All packages in renv.lock installed
- **Procedure**: Execute `renv::status()`
- **Expected:** "No issues found"
- **Result**: [ PASS / FAIL ]

### IQ-003: Package Version Verification
- **Procedure**: Execute `installed.packages()[, c("Package", "Version")]`
- **Expected:** Versions match renv.lock exactly
- **Result**: [ PASS / FAIL ]
```

**預期：** `validation/iq/iq_protocol.md` 含 R 版本驗證、套件安裝驗證與套件版本驗證之測試案例，每附明確預期結果與通過/失敗欄位。

**失敗時：** 若 IQ 協議範本不符組織 SOP 要求，調整格式同時保留所需欄位（要求、程序、預期結果、實際結果、通過/失敗）。諮詢 QA 取核准之範本。

### 步驟六：撰寫自動化 OQ/PQ 測試

```r
# tests/testthat/test-analysis.R
test_that("primary analysis produces validated results", {
  # Known input -> known output (double programming validation)
  test_data <- read.csv(test_path("fixtures", "validation_dataset.csv"))

  result <- primary_analysis(test_data)

  # Compare against independently calculated expected values
  expect_equal(result$estimate, 2.345, tolerance = 1e-3)
  expect_equal(result$p_value, 0.012, tolerance = 1e-3)
  expect_equal(result$ci_lower, 1.234, tolerance = 1e-3)
})
```

**預期：** 自動化測試文件存於 `tests/testthat/`，涵蓋 OQ（每函數之操作驗證）與 PQ（端對端驗證對照獨立計算之參考值）。測試用明確之數值容差。

**失敗時：** 若參考值尚未來自獨立計算（如 SAS），以 `skip("Awaiting independent reference values")` 建立佔位測試並於追溯矩陣中記錄。

### 步驟七：建立追溯矩陣

```markdown
# Traceability Matrix

| Req ID | Requirement | Test ID | Test Description | Status |
|--------|-------------|---------|------------------|--------|
| REQ-001 | Import CSV data correctly | OQ-001 | Verify data dimensions and types | PASS |
| REQ-002 | Calculate primary endpoint | PQ-001 | Compare against reference results | PASS |
| REQ-003 | Generate report output | PQ-002 | Verify report contains all sections | PASS |
```

**預期：** `validation/traceability_matrix.md` 將每要求連至至少一測試案例，且每測試案例連至一要求。無孤立要求或測試。

**失敗時：** 若要求未測試，為其建立測試案例或記錄基於風險之排除理由。若測試無連結之要求，連至既有要求或將其移除作範圍外。

## 驗證

- [ ] 項目結構遵循書面範本
- [ ] renv.lock 含所有依賴附精確版本
- [ ] 驗證計劃完整並已批准
- [ ] IQ 協議成功執行
- [ ] OQ 測試案例涵蓋所有已配置功能
- [ ] PQ 測試對獨立計算之結果驗證
- [ ] 追溯矩陣將要求連至測試
- [ ] 變更控制流程已記錄

## 常見陷阱

- **未鎖定版本之 `install.packages()`**：應始終用 renv 配鎖定版本
- **缺審計軌跡**：每變更須記錄。用 git 簽署提交。
- **過度驗證**：套用基於風險之方法。非每 CRAN 套件皆需 Category 5 驗證。
- **遺忘系統級資格認證**：OS 與 R 安裝亦需 IQ
- **無獨立驗證**：PQ 應對照獨立計算之結果（SAS、手算）

## 相關技能

- `write-validation-documentation` - 詳細驗證文件建立
- `implement-audit-trail` - 電子記錄與審計軌跡
- `validate-statistical-output` - 雙重編程與輸出驗證
- `manage-renv-dependencies` - 受驗證環境之依賴鎖定
