---
name: setup-gxp-r-project
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Set up R project compliant w/ GxP regs (21 CFR Part 11, EU Annex 11). Validated envs, qualification docs, change control, electronic records. Use → start R analysis in regulated env (pharma, biotech, med devices), R for clinical trial analysis, validated compute env for regulatory submissions, impl 21 CFR Part 11|EU Annex 11.
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

R project structure → GxP reg validated computing reqs.

## Use When

- R analysis in regulated env (pharma, biotech, med devices)
- R for clinical trial analysis
- Validated compute env for regulatory submissions
- Impl 21 CFR Part 11|EU Annex 11

## In

- **Required**: Project scope + reg framework (FDA|EMA|both)
- **Required**: R ver + pkg vers to validate
- **Required**: Validation strategy (risk-based)
- **Optional**: Existing SOPs for computerized systems
- **Optional**: QMS integration reqs

## Do

### Step 1: Validated Project Structure

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

→ Complete dir structure exists w/ all listed dirs.

If err: missing → `mkdir -p`. Verify in correct project root. Existing → create only missing, don't overwrite.

### Step 2: Validation Plan

`validation/validation_plan.md`:

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

→ Plan complete w/ scope, GAMP 5 risk categories, validation activities matrix, roles, acceptance criteria. References specific R ver + reg framework.

If err: framework unclear → consult QA dept for SOPs. Don't proceed validation activities until plan reviewed+approved.

### Step 3: Lock Deps w/ renv

```r
# Initialize renv with exact versions
renv::init()

# Install specific validated versions
renv::install("dplyr@1.1.4")
renv::install("ggplot2@3.5.0")

# Snapshot
renv::snapshot()
```

`renv.lock` = controlled pkg inventory.

→ `renv.lock` exists w/ exact vers all pkgs. `renv::status()` reports no issues. Every ver pinned (`dplyr@1.1.4`), not floating.

If err: `renv::install()` fails specific ver → check exists CRAN archives. Use `renv::install("package@version", repos = "https://packagemanager.posit.co/cran/latest")` for archived.

### Step 4: Version Control

```bash
git init
git add .
git commit -m "Initial validated project structure"

# Use signed commits for traceability
git config user.signingkey YOUR_GPG_KEY
git config commit.gpgsign true
```

→ Project under git w/ signed commits. Initial commit has validated structure + `renv.lock`.

If err: GPG signing fails → verify GPG key (`gpg --list-secret-keys`). Envs w/o GPG → document deviation + unsigned + manual audit trail in `docs/change_log.md`.

### Step 5: IQ Protocol

`validation/iq/iq_protocol.md`:

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

→ IQ protocol has test cases (R ver, pkg install, pkg ver verifications) w/ clear expected + pass/fail.

If err: protocol template ≠ org SOP reqs → adapt format keeping required fields (req, procedure, expected, actual, pass/fail). Consult QA for approved templates.

### Step 6: Automated OQ/PQ Tests

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

→ Test files exist in `tests/testthat/` covering OQ (op verification each fn) + PQ (e2e validation vs independent ref). Use explicit numeric tolerances.

If err: ref vals not yet from independent calc (SAS) → placeholder w/ `skip("Awaiting independent reference values")` + document in traceability.

### Step 7: Traceability Matrix

```markdown
# Traceability Matrix

| Req ID | Requirement | Test ID | Test Description | Status |
|--------|-------------|---------|------------------|--------|
| REQ-001 | Import CSV data correctly | OQ-001 | Verify data dimensions and types | PASS |
| REQ-002 | Calculate primary endpoint | PQ-001 | Compare against reference results | PASS |
| REQ-003 | Generate report output | PQ-002 | Verify report contains all sections | PASS |
```

→ Matrix links every req to ≥1 test, every test to req. No orphans.

If err: untested reqs → create tests or document risk-based exclusion. Tests w/o req → link or remove out-of-scope.

## Check

- [ ] Structure follows template
- [ ] renv.lock has all deps w/ exact vers
- [ ] Validation plan complete + approved
- [ ] IQ protocol executes
- [ ] OQ covers all configured fns
- [ ] PQ validates vs independent results
- [ ] Traceability matrix links reqs↔tests
- [ ] Change control process documented

## Traps

- **`install.packages()` w/o pinning**: Always renv w/ locked vers
- **No audit trail**: Every change documented. Git signed commits.
- **Over-validating**: Risk-based. Not every CRAN pkg needs Cat 5.
- **Forget system-level QA**: OS + R install need IQ too
- **No independent verify**: PQ → compare vs results from independent (SAS, manual)

## →

- `write-validation-documentation` — detailed validation docs
- `implement-audit-trail` — electronic records + audit trails
- `validate-statistical-output` — double programming + output validation
- `manage-renv-dependencies` — dep locking for validated envs
