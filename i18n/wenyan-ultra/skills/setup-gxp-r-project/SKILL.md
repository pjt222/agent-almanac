---
name: setup-gxp-r-project
locale: wenyan-ultra
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

# 設 GxP R 項

建合 GxP 規之 R 項結構為驗算。

## 用

- 規境（藥、生技、醫器）始 R 析項→用
- 為臨試析設 R→用
- 為規呈建驗算境→用
- 行 21 CFR Part 11 或 EU Annex 11 需→用

## 入

- **必**：項範與規框（FDA、EMA、二）
- **必**：所驗 R 本與包本
- **必**：驗策（險導法）
- **可**：既電腦系 SOP
- **可**：質管系接需

## 行

### 一：建驗項結構

```
gxp-project/
├── R/
│   ├── 01_data_import.R
│   ├── 02_data_processing.R
│   └── 03_analysis.R
├── validation/
│   ├── validation_plan.md
│   ├── risk_assessment.md
│   ├── iq/
│   │   ├── iq_protocol.md
│   │   └── iq_report.md
│   ├── oq/
│   │   ├── oq_protocol.md
│   │   └── oq_report.md
│   ├── pq/
│   │   ├── pq_protocol.md
│   │   └── pq_report.md
│   └── traceability_matrix.md
├── tests/
│   ├── testthat.R
│   └── testthat/
│       ├── test-data_import.R
│       └── test-analysis.R
├── data/
│   ├── raw/
│   └── derived/
├── output/
├── docs/
│   ├── sop_references.md
│   └── change_log.md
├── renv.lock
├── DESCRIPTION
├── .Rprofile
└── CLAUDE.md
```

得：完目結構含 `R/`、`validation/`（含 `iq/`、`oq/`、`pq/`）、`tests/testthat/`、`data/raw/`、`data/derived/`、`output/`、`docs/`。

敗：目缺→`mkdir -p` 建。驗於正項根。既項僅建缺目、勿覆既結構。

### 二：建驗計

建 `validation/validation_plan.md`：

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

得：`validation/validation_plan.md` 完含範、GAMP 5 險類、驗動陣、職責、接準。引特 R 本與規框。

敗：規框不明→諮組 QA 部為適 SOP。計未審准前勿進驗動。

### 三：用 renv 鎖依

```r
renv::init()

renv::install("dplyr@1.1.4")
renv::install("ggplot2@3.5.0")

renv::snapshot()
```

`renv.lock` 為控包冊。

得：`renv.lock` 存含諸需包準本。`renv::status()` 報無問題。每包本釘（如 `dplyr@1.1.4`）非浮。

敗：`renv::install()` 特本敗→察本存於 CRAN 檔。用 `renv::install("package@version", repos = "https://packagemanager.posit.co/cran/latest")` 為檔本。

### 四：行版控

```bash
git init
git add .
git commit -m "Initial validated project structure"

git config user.signingkey YOUR_GPG_KEY
git config commit.gpgsign true
```

得：項於 git 控含署名提啟。首提含驗結構與 `renv.lock`。

敗：GPG 署敗→`gpg --list-secret-keys` 驗 GPG 鑰配。無 GPG 境→文錄偏、用無署提含 `docs/change_log.md` 之手審跡。

### 五：建 IQ 議

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

得：`validation/iq/iq_protocol.md` 含 R 本驗、包裝驗、包本驗之測例、各含明期果與過/敗欄。

敗：IQ 議板不合組 SOP→保需欄（需、程、期果、實果、過/敗）改式。諮 QA 為准板。

### 六：書自動 OQ/PQ 測

```r
test_that("primary analysis produces validated results", {
  test_data <- read.csv(test_path("fixtures", "validation_dataset.csv"))

  result <- primary_analysis(test_data)

  expect_equal(result$estimate, 2.345, tolerance = 1e-3)
  expect_equal(result$p_value, 0.012, tolerance = 1e-3)
  expect_equal(result$ci_lower, 1.234, tolerance = 1e-3)
})
```

得：自測檔於 `tests/testthat/` 覆 OQ（各函操驗）與 PQ（端對端對獨算參值驗）。測用顯數忍。

敗：獨算之參值未備（如 SAS）→建占測含 `skip("Awaiting independent reference values")` 並文錄於追陣。

### 七：建追陣

```markdown
# Traceability Matrix

| Req ID | Requirement | Test ID | Test Description | Status |
|--------|-------------|---------|------------------|--------|
| REQ-001 | Import CSV data correctly | OQ-001 | Verify data dimensions and types | PASS |
| REQ-002 | Calculate primary endpoint | PQ-001 | Compare against reference results | PASS |
| REQ-003 | Generate report output | PQ-002 | Verify report contains all sections | PASS |
```

得：`validation/traceability_matrix.md` 連各需於 ≥ 1 測例、各測例連於需。無孤需或測。

敗：需未測→建測例或文錄險導排除。測無連需→連既需或除為範外。

## 驗

- [ ] 項結構循文錄板
- [ ] renv.lock 含諸依準本
- [ ] 驗計完准
- [ ] IQ 議成行
- [ ] OQ 測例覆諸配功
- [ ] PQ 測對獨算果驗
- [ ] 追陣連需於測
- [ ] 變控程文錄

## 忌

- **`install.packages()` 無本釘**：恆用 renv 含鎖本
- **缺審跡**：諸變必文錄。用 git 署提
- **過驗**：施險導法。非每 CRAN 包需類 5 驗
- **忘系級驗**：OS 與 R 裝亦需 IQ
- **無獨驗**：PQ 宜對獨算果（SAS、手算）較

## 參

- `write-validation-documentation`
- `implement-audit-trail`
- `validate-statistical-output`
- `manage-renv-dependencies`
