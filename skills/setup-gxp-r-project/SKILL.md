---
name: setup-gxp-r-project
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

Create an R project structure that meets GxP regulatory requirements for validated computing.

## When to Use

- Starting an R analysis project in a regulated environment (pharma, biotech, medical devices)
- Setting up R for use in clinical trial analysis
- Creating a validated computing environment for regulatory submissions
- Implementing 21 CFR Part 11 or EU Annex 11 requirements

## Inputs

- **Required**: Project scope and regulatory framework (FDA, EMA, or both)
- **Required**: R version and package versions to validate
- **Required**: Validation strategy (risk-based approach)
- **Optional**: Existing SOPs for computerized systems
- **Optional**: Quality management system integration requirements

## Procedure

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

**Expected:** The complete directory structure exists with `R/`, `validation/` (including `iq/`, `oq/`, `pq/` subdirectories), `tests/testthat/`, `data/raw/`, `data/derived/`, `output/`, and `docs/` directories.

**On failure:** If directories are missing, create them with `mkdir -p`. Verify you are in the correct project root. For existing projects, create only the missing directories rather than overwriting existing structure.

### Step 2: Create Validation Plan

Create `validation/validation_plan.md`:

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

**Expected:** `validation/validation_plan.md` is complete with scope, GAMP 5 risk categories, validation activities matrix, roles and responsibilities, and acceptance criteria. The plan references the specific R version and regulatory framework.

**On failure:** If the regulatory framework is unclear, consult the organization's QA department for applicable SOPs. Do not proceed with validation activities until the plan is reviewed and approved.

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

The `renv.lock` file serves as the controlled package inventory.

**Expected:** `renv.lock` exists with exact version numbers for all required packages. `renv::status()` reports no issues. Every package version is pinned (e.g., `dplyr@1.1.4`), not floating.

**On failure:** If `renv::install()` fails for a specific version, check that the version exists on CRAN archives. Use `renv::install("package@version", repos = "https://packagemanager.posit.co/cran/latest")` for archived versions.

### Step 4: Implement Version Control

```bash
git init
git add .
git commit -m "Initial validated project structure"

# Use signed commits for traceability
git config user.signingkey YOUR_GPG_KEY
git config commit.gpgsign true
```

**Expected:** The project is under git version control with signed commits enabled. The initial commit contains the validated project structure and `renv.lock`.

**On failure:** If GPG signing fails, verify the GPG key is configured with `gpg --list-secret-keys`. For environments without GPG, document the deviation and use unsigned commits with manual audit trail entries in `docs/change_log.md`.

### Step 5: Create IQ Protocol

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

**Expected:** `validation/iq/iq_protocol.md` contains test cases for R version verification, package installation verification, and package version verification, each with clear expected results and pass/fail fields.

**On failure:** If the IQ protocol template does not match organizational SOP requirements, adapt the format while retaining the required fields (requirement, procedure, expected result, actual result, pass/fail). Consult QA for approved templates.

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

**Expected:** Automated test files exist in `tests/testthat/` covering OQ (operational verification of each function) and PQ (end-to-end validation against independently calculated reference values). Tests use explicit numeric tolerances.

**On failure:** If reference values are not yet available from independent calculation (e.g., SAS), create placeholder tests with `skip("Awaiting independent reference values")` and document in the traceability matrix.

### Step 7: Create Traceability Matrix

```markdown
# Traceability Matrix

| Req ID | Requirement | Test ID | Test Description | Status |
|--------|-------------|---------|------------------|--------|
| REQ-001 | Import CSV data correctly | OQ-001 | Verify data dimensions and types | PASS |
| REQ-002 | Calculate primary endpoint | PQ-001 | Compare against reference results | PASS |
| REQ-003 | Generate report output | PQ-002 | Verify report contains all sections | PASS |
```

**Expected:** `validation/traceability_matrix.md` links every requirement to at least one test case, and every test case is linked to a requirement. No orphaned requirements or tests.

**On failure:** If requirements are untested, create test cases for them or document a risk-based justification for exclusion. If tests have no linked requirement, either link them to an existing requirement or remove them as out-of-scope.

## Validation

- [ ] Project structure follows documented template
- [ ] renv.lock contains all dependencies with exact versions
- [ ] Validation plan is complete and approved
- [ ] IQ protocol executes successfully
- [ ] OQ test cases cover all configured functionality
- [ ] PQ tests validate against independently computed results
- [ ] Traceability matrix links requirements to tests
- [ ] Change control process is documented

## Common Pitfalls

- **Using `install.packages()` without version pinning**: Always use renv with locked versions
- **Missing audit trail**: Every change must be documented. Use git signed commits.
- **Over-validating**: Apply risk-based approach. Not every CRAN package needs Category 5 validation.
- **Forgetting system-level qualification**: The OS and R installation need IQ too
- **No independent verification**: PQ should compare against results computed independently (SAS, manual calculation)

## Related Skills

- `write-validation-documentation` - detailed validation document creation
- `implement-audit-trail` - electronic records and audit trails
- `validate-statistical-output` - double programming and output validation
- `manage-renv-dependencies` - dependency locking for validated environments
