---
name: write-validation-documentation
locale: caveman-ultra
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

# Write Validation Documentation

Complete IQ/OQ/PQ validation docs for computerized systems.

## Use When

- Validate R or other software → regulated use
- Prep for regulatory audit
- Doc qualification of computing envs
- Create|update validation protocols + reports

## In

- **Required**: System|software to validate (name, ver, purpose)
- **Required**: Validation plan defining scope + strategy
- **Required**: User reqs spec
- **Optional**: Existing SOP templates
- **Optional**: Prev validation docs (re-qualification)

## Do

### Step 1: IQ Protocol

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

**Got:** `validation/iq/iq_protocol.md` complete w/ unique doc ID, objective, prereqs, test cases for R install + every required pkg, deviation section, approval fields.

**If err:** Org requires different format → adapt template to match SOP. Key fields (req, procedure, expected, actual, pass/fail) preserved regardless.

### Step 2: OQ Protocol

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

**Got:** `validation/oq/oq_protocol.md` w/ test cases for data import, stat calcs, err handling, each w/ specific test data, expected (w/ tolerances), evidence reqs.

**If err:** Test data not yet avail → create synthetic w/ known properties. Doc data gen method for indep verify.

### Step 3: PQ Protocol

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

**Got:** `validation/pq/pq_protocol.md` w/ end-to-end test cases using real-world data, results compared vs indep ref calc (SAS out). Tolerances explicit.

**If err:** Indep ref not avail → doc gap + use dual-programming (2 indep R impls) as alt. Flag PQ provisional until indep verify done.

### Step 4: Qualification Reports

After exec protocols, doc results:

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

**Got:** Qualification reports (IQ, OQ, PQ) complete w/ all test results, deviations doc'd (or "None observed"), conclusions, approval sigs ready.

**If err:** Test fails during exec → doc each as deviation w/ root cause + resolution. Don't leave deviation sections blank when failures observed.

### Step 5: Auto Where Possible

Auto test scripts → generate evidence:

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

**Got:** Auto scripts in `validation/scripts/` generate evidence files (`iq_evidence.txt`) w/ timestamped results per test, reducing manual entry + ensuring reproducibility.

**If err:** Auto scripts fail due to env diffs → run manual + capture w/ `sink()`. Doc diffs between auto + manual exec in qualification report.

## Check

- [ ] All protocols unique doc IDs
- [ ] Protocols ref validation plan
- [ ] Test cases clear pass/fail criteria
- [ ] Reports include all executed test results
- [ ] Deviations doc'd w/ resolutions
- [ ] Approval signatures obtained
- [ ] Docs follow org SOP templates

## Traps

- **Vague acceptance**: "System works correctly" not testable. Specify exact expected vals.
- **Missing evidence**: Every test result needs supporting evidence (screenshots, logs, out files)
- **Incomplete deviation handling**: All failures must be documented, investigated, resolved
- **No version control for docs**: Validation docs need change control just like code
- **Skip re-qualification**: System updates (R ver, pkg updates) → re-qualification assessment

## →

- `setup-gxp-r-project` — project structure for validated envs
- `implement-audit-trail` — electronic records tracking
- `validate-statistical-output` — out validation methodology
