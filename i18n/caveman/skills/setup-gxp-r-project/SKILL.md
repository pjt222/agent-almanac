---
name: setup-gxp-r-project
locale: caveman
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

# Set Up GxP R Project

Make R project structure that meets GxP regulatory requirements for validated computing.

## When Use

- Start R analysis project in regulated env (pharma, biotech, medical devices)
- Set up R for clinical trial analysis
- Make validated computing env for regulatory submissions
- Implement 21 CFR Part 11 or EU Annex 11 requirements

## Inputs

- **Required**: Project scope + regulatory framework (FDA, EMA, both)
- **Required**: R version + package versions to validate
- **Required**: Validation strategy (risk-based)
- **Optional**: Existing SOPs for computerized systems
- **Optional**: QMS integration requirements

## Steps

### Step 1: Create Validated Project Structure

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

**Got:** Complete dir structure exists with `R/`, `validation/` (including `iq/`, `oq/`, `pq/` subdirs), `tests/testthat/`, `data/raw/`, `data/derived/`, `output/`, `docs/` dirs.

**If fail:** Dirs missing? Create with `mkdir -p`. Verify in correct project root. For existing projects, create only missing dirs rather than overwriting.

### Step 2: Create Validation Plan

Create `validation/validation_plan.md`.

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

**Got:** `validation/validation_plan.md` complete with scope, GAMP 5 risk categories, validation activities matrix, roles + responsibilities, acceptance criteria. Plan references specific R version + regulatory framework.

**If fail:** Regulatory framework unclear? Consult org's QA dept for applicable SOPs. Do not proceed with validation activities until plan reviewed + approved.

### Step 3: Lock Dependencies with renv

```r
# Initialize renv with exact versions
renv::init()

# Install specific validated versions
renv::install("dplyr@1.1.4")
renv::install("ggplot2@3.5.0")

# Snapshot
renv::snapshot()
```

`renv.lock` file serves as controlled package inventory.

**Got:** `renv.lock` exists with exact version numbers for all required packages. `renv::status()` reports no issues. Every package version pinned (e.g., `dplyr@1.1.4`), not floating.

**If fail:** `renv::install()` fails for specific version? Check version exists on CRAN archives. Use `renv::install("package@version", repos = "https://packagemanager.posit.co/cran/latest")` for archived versions.

### Step 4: Implement Version Control

```bash
git init
git add .
git commit -m "Initial validated project structure"

# Use signed commits for traceability
git config user.signingkey YOUR_GPG_KEY
git config commit.gpgsign true
```

**Got:** Project under git version control with signed commits enabled. Initial commit contains validated project structure + `renv.lock`.

**If fail:** GPG signing fails? Verify GPG key configured with `gpg --list-secret-keys`. For envs without GPG, document deviation, use unsigned commits with manual audit trail entries in `docs/change_log.md`.

### Step 5: Create IQ Protocol

`validation/iq/iq_protocol.md`.

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

**Got:** `validation/iq/iq_protocol.md` contains test cases for R version verification, package install verification, package version verification, each with clear expected results + pass/fail fields.

**If fail:** IQ protocol template does not match org SOP requirements? Adapt format while keeping required fields (requirement, procedure, expected, actual, pass/fail). Consult QA for approved templates.

### Step 6: Write Automated OQ/PQ Tests

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

**Got:** Automated test files in `tests/testthat/` covering OQ (operational verification of each function) + PQ (end-to-end validation against independent reference values). Tests use explicit numeric tolerances.

**If fail:** Reference values not yet available from independent calc (e.g., SAS)? Create placeholder tests with `skip("Awaiting independent reference values")`, document in traceability matrix.

### Step 7: Create Traceability Matrix

```markdown
# Traceability Matrix

| Req ID | Requirement | Test ID | Test Description | Status |
|--------|-------------|---------|------------------|--------|
| REQ-001 | Import CSV data correctly | OQ-001 | Verify data dimensions and types | PASS |
| REQ-002 | Calculate primary endpoint | PQ-001 | Compare against reference results | PASS |
| REQ-003 | Generate report output | PQ-002 | Verify report contains all sections | PASS |
```

**Got:** `validation/traceability_matrix.md` links every requirement to at least one test case, every test linked to a requirement. No orphaned requirements or tests.

**If fail:** Requirements untested? Create test cases or document risk-based justification for exclusion. Tests with no linked requirement? Either link to existing requirement or remove as out-of-scope.

## Checks

- [ ] Project structure follows documented template
- [ ] renv.lock contains all deps with exact versions
- [ ] Validation plan complete + approved
- [ ] IQ protocol executes successfully
- [ ] OQ test cases cover all configured functionality
- [ ] PQ tests validate against independently computed results
- [ ] Traceability matrix links requirements to tests
- [ ] Change control process documented

## Pitfalls

- **Use `install.packages()` without version pinning**: Always use renv with locked versions
- **Missing audit trail**: Every change must be documented. Use git signed commits.
- **Over-validating**: Apply risk-based approach. Not every CRAN package needs Category 5 validation.
- **Forget system-level qualification**: OS + R installation need IQ too
- **No independent verification**: PQ should compare against results computed independently (SAS, manual calc)

## See Also

- `write-validation-documentation` - detailed validation document creation
- `implement-audit-trail` - electronic records + audit trails
- `validate-statistical-output` - double programming + output validation
- `manage-renv-dependencies` - dep locking for validated envs
