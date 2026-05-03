---
name: setup-gxp-r-project
locale: wenyan
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

# 設 GxP R 項目

立 R 項目之構合 GxP 規（21 CFR Part 11、EU Annex 11）。

## 用時

- 受規之境（藥、生技、醫器）始 R 析項目乃用
- 為臨床試驗析設 R 乃用
- 為註冊提交立可驗之計算境乃用
- 施 21 CFR Part 11 或 EU Annex 11 之求乃用

## 入

- **必要**：項目之範與規之框（FDA、EMA、或二）
- **必要**：欲驗之 R 版與包版
- **必要**：驗策（風險為基）
- **可選**：既有計算系之 SOP
- **可選**：質管之集求

## 法

### 第一步：立可驗之項目構

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

得：完之目構存，含 `R/`、`validation/`（含 `iq/`、`oq/`、`pq/`）、`tests/testthat/`、`data/raw/`、`data/derived/`、`output/`、`docs/`。

敗則：目缺，以 `mkdir -p` 立。驗在項目根。既項目，唯立缺者，勿覆既構。

### 第二步：立驗之計

立 `validation/validation_plan.md`：

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

得：`validation/validation_plan.md` 完備，含範、GAMP 5 風險類、驗活動矩陣、職責、受準。計引特之 R 版與規框。

敗則：規框不明，諮組之 QA 求適 SOP。計未審而批，勿進驗活動。

### 第三步：以 renv 鎖依

```r
# Initialize renv with exact versions
renv::init()

# Install specific validated versions
renv::install("dplyr@1.1.4")
renv::install("ggplot2@3.5.0")

# Snapshot
renv::snapshot()
```

`renv.lock` 文件為受控之包目。

得：`renv.lock` 存附諸需包之確版號。`renv::status()` 報無患。每包版皆鎖（如 `dplyr@1.1.4`），非浮。

敗則：`renv::install()` 於特版敗，察其於 CRAN 檔存否。歷版用 `renv::install("package@version", repos = "https://packagemanager.posit.co/cran/latest")`。

### 第四步：施版控

```bash
git init
git add .
git commit -m "Initial validated project structure"

# Use signed commits for traceability
git config user.signingkey YOUR_GPG_KEY
git config commit.gpgsign true
```

得：項目入 git 版控附簽提交。首提交含可驗之構與 `renv.lock`。

敗則：GPG 簽敗，以 `gpg --list-secret-keys` 驗 GPG 鑰之配。無 GPG 之境，書其偏，用無簽提交附人手審於 `docs/change_log.md`。

### 第五步：立 IQ 之協

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

得：`validation/iq/iq_protocol.md` 含 R 版驗、包裝驗、包版驗之試例，各附明預期與過/敗欄。

敗則：IQ 模不合組之 SOP 之求，存其要欄而適其式（求、程、預期、實得、過/敗）。諮 QA 之認模。

### 第六步：寫自動之 OQ/PQ 試

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

得：自動試文件存於 `tests/testthat/`，覆 OQ（每函操作之驗）與 PQ（端到端驗於獨算之參值）。試用明數容差。

敗則：獨算之參值（如自 SAS）尚未得，立占位試以 `skip("Awaiting independent reference values")` 並書於追溯矩陣。

### 第七步：立追溯矩陣

```markdown
# Traceability Matrix

| Req ID | Requirement | Test ID | Test Description | Status |
|--------|-------------|---------|------------------|--------|
| REQ-001 | Import CSV data correctly | OQ-001 | Verify data dimensions and types | PASS |
| REQ-002 | Calculate primary endpoint | PQ-001 | Compare against reference results | PASS |
| REQ-003 | Generate report output | PQ-002 | Verify report contains all sections | PASS |
```

得：`validation/traceability_matrix.md` 連每求至少一試例，每試例皆連於求。無孤求或孤試。

敗則：求未試，立其試例，或書風險為基之排除由。試無連求，連於既求或除之為範外。

## 驗

- [ ] 項目構合所書模
- [ ] renv.lock 含諸依附確版
- [ ] 驗計完而批
- [ ] IQ 協行而成
- [ ] OQ 試例覆諸配功
- [ ] PQ 試驗於獨算之果
- [ ] 追溯矩陣連求於試
- [ ] 變控程已書

## 陷

- **`install.packages()` 無版鎖**：常用 renv 附鎖版
- **缺審計線**：每變必書。用 git 簽提交
- **過驗**：用風險為基。非每 CRAN 包皆需 Category 5 之驗
- **忘系統級之認**：OS 與 R 之裝亦需 IQ
- **無獨驗**：PQ 宜比於獨算之果（SAS、人手算）

## 參

- `write-validation-documentation` — 詳之驗文檔之立
- `implement-audit-trail` — 電錄與審計線
- `validate-statistical-output` — 雙程與出之驗
- `manage-renv-dependencies` — 為驗境之依鎖
