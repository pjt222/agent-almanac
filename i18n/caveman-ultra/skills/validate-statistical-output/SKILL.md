---
name: validate-statistical-output
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Validate statistical analysis output through double programming,
  independent verification, and reference comparison. Covers comparison
  methodology, tolerance definitions, and deviation handling for regulated
  environments. Use when validating primary or secondary endpoint analyses
  for regulatory submissions, performing double programming (R vs SAS or
  independent R implementations), verifying that analysis code produces
  correct results, or re-validating after code or environment changes.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: compliance
  complexity: advanced
  language: R
  tags: validation, statistics, double-programming, verification, pharma
---

# Validate Statistical Output

Verify stat analysis results via independent calc + systematic comparison.

## Use When

- Validate primary|secondary endpoint analyses → regulatory submissions
- Double programming (R vs SAS, or independent R impls)
- Verify analysis code produces correct results
- Re-validate after code|env changes

## In

- **Required**: Primary analysis code + results
- **Required**: Reference results (independent calc, published vals, known test data)
- **Required**: Tolerance criteria for numeric comparisons
- **Optional**: Regulatory submission ctx

## Do

### Step 1: Define Comparison Framework

```r
# Define tolerance levels for different statistics
tolerances <- list(
  counts = 0,           # Exact match for integers
  proportions = 1e-4,   # 0.01% for proportions
  means = 1e-6,         # Numeric precision for means
  p_values = 1e-4,      # 4 decimal places for p-values
  confidence_limits = 1e-3  # 3 decimal places for CIs
)
```

**Got:** Tolerance levels per stat category, stricter for int counts (exact), looser for floating-pt (p-vals, CIs).

**If err:** Tolerances disputed → doc rationale per threshold + sign-off from stat lead before proceed. Refer ICH E9 for regulatory.

### Step 2: Comparison Fn

```r
#' Compare two result sets with tolerance-based matching
#'
#' @param primary Results from the primary analysis
#' @param reference Results from the independent calculation
#' @param tolerances Named list of tolerance values
#' @return Data frame with comparison results
compare_results <- function(primary, reference, tolerances) {
  stopifnot(names(primary) == names(reference))

  comparison <- data.frame(
    statistic = names(primary),
    primary_value = unlist(primary),
    reference_value = unlist(reference),
    stringsAsFactors = FALSE
  )

  comparison$absolute_diff <- abs(comparison$primary_value - comparison$reference_value)
  comparison$tolerance <- sapply(comparison$statistic, function(s) {
    # Match to tolerance category or use default
    tol <- tolerances[[s]]
    if (is.null(tol)) tolerances$means  # default tolerance
    else tol
  })

  comparison$pass <- comparison$absolute_diff <= comparison$tolerance

  comparison
}
```

**Got:** `compare_results()` returns df w/ stat name, primary, reference, abs diff, tolerance, pass/fail.

**If err:** Errors on mismatched names → verify both lists use identical names. Tolerance map fails → add default for unrecognized.

### Step 3: Double Programming

Independent impl reaches same results via different code:

```r
# PRIMARY ANALYSIS (in R/primary_analysis.R)
primary_analysis <- function(data) {
  model <- lm(endpoint ~ treatment + baseline + sex, data = data)
  coefs <- summary(model)$coefficients

  list(
    treatment_estimate = coefs["treatmentActive", "Estimate"],
    treatment_se = coefs["treatmentActive", "Std. Error"],
    treatment_p = coefs["treatmentActive", "Pr(>|t|)"],
    n_subjects = nobs(model),
    r_squared = summary(model)$r.squared
  )
}

# INDEPENDENT VERIFICATION (in validation/independent_analysis.R)
# Written by a different analyst or using different methodology
independent_analysis <- function(data) {
  # Using matrix algebra instead of lm()
  X <- model.matrix(~ treatment + baseline + sex, data = data)
  y <- data$endpoint

  beta <- solve(t(X) %*% X) %*% t(X) %*% y
  residuals <- y - X %*% beta
  sigma2 <- sum(residuals^2) / (nrow(X) - ncol(X))
  var_beta <- sigma2 * solve(t(X) %*% X)
  se <- sqrt(diag(var_beta))

  t_stat <- beta["treatmentActive"] / se["treatmentActive"]
  p_value <- 2 * pt(-abs(t_stat), df = nrow(X) - ncol(X))

  list(
    treatment_estimate = as.numeric(beta["treatmentActive"]),
    treatment_se = se["treatmentActive"],
    treatment_p = as.numeric(p_value),
    n_subjects = nrow(data),
    r_squared = 1 - sum(residuals^2) / sum((y - mean(y))^2)
  )
}
```

**Got:** 2 independent impls via different code paths (`lm()` vs matrix algebra) reach same stat results. Different analysts or fundamentally different methods.

**If err:** Independent impl produces different results → verify both use same input (`digest::digest(data)`). Check NA handling, contrast coding, df calc.

### Step 4: Run Comparison

```r
# Execute both analyses
primary_results <- primary_analysis(study_data)
independent_results <- independent_analysis(study_data)

# Compare
comparison <- compare_results(primary_results, independent_results, tolerances)

# Report
cat("Validation Comparison Report\n")
cat("============================\n")
cat(sprintf("Date: %s\n", Sys.time()))
cat(sprintf("Overall: %s\n\n",
  ifelse(all(comparison$pass), "ALL PASS", "DISCREPANCIES FOUND")))

print(comparison)
```

**Got:** Comparison report → all stats within tolerance. `Overall` reads "ALL PASS."

**If err:** Discrepancies → don't immediately assume primary wrong. Investigate both: intermediate calcs, identical input data, missing val handling, edge cases.

### Step 5: External Reference (SAS)

R vs SAS:

```r
# Load SAS results (exported as CSV or from .sas7bdat)
sas_results <- list(
  treatment_estimate = 1.2345,  # From SAS PROC GLM output
  treatment_se = 0.3456,
  treatment_p = 0.0004,
  n_subjects = 200,
  r_squared = 0.4567
)

comparison <- compare_results(primary_results, sas_results, tolerances)

# Known sources of difference between R and SAS:
# - Default contrasts (R: treatment, SAS: GLM parameterization)
# - Rounding of intermediate calculations
# - Handling of missing values (na.rm vs listwise deletion)
```

**Got:** R vs SAS within tolerance, known systematic diffs (contrast coding, rounding) documented + explained.

**If err:** R + SAS differ beyond tolerance → check 3 most common sources of divergence: default contrast coding (R: treatment, SAS: GLM param), missing val handling, rounding of intermediates. Doc each w/ root cause.

### Step 6: Doc Results

Validation report:

```r
# validation/output_comparison_report.R
sink("validation/output_comparison_report.txt")

cat("OUTPUT VALIDATION REPORT\n")
cat("========================\n")
cat(sprintf("Project: %s\n", project_name))
cat(sprintf("Date: %s\n", format(Sys.time())))
cat(sprintf("Primary Analyst: %s\n", primary_analyst))
cat(sprintf("Independent Analyst: %s\n", independent_analyst))
cat(sprintf("R Version: %s\n\n", R.version.string))

cat("COMPARISON RESULTS\n")
cat("------------------\n")
print(comparison, row.names = FALSE)

cat(sprintf("\nOVERALL VERDICT: %s\n",
  ifelse(all(comparison$pass), "VALIDATED", "DISCREPANCIES - INVESTIGATION REQUIRED")))

cat("\nSESSION INFO\n")
print(sessionInfo())

sink()
```

**Got:** Complete validation report at `validation/output_comparison_report.txt` w/ project meta, comparison, verdict, session info.

**If err:** `sink()` fails or empty file → check out dir exists (`dir.create("validation", showWarnings = FALSE)`) + no prior `sink()` still active (`sink.number()`).

### Step 7: Handle Discrepancies

When results don't match:

1. Verify both impls use same input (hash compare)
2. Check NA handling diffs
3. Compare intermediate calcs step by step
4. Doc root cause
5. Determine: acceptable (within tolerance) or requires correction

**Got:** All discrepancies investigated, root causes ID'd, classified as acceptable (documented) or requiring correction.

**If err:** Discrepancy can't be explained → escalate to stat lead. Don't dismiss unexplained → may indicate genuine err in one impl.

## Check

- [ ] Independent analysis produces results within tolerance
- [ ] All comparison stats documented
- [ ] Discrepancies (if any) investigated + resolved
- [ ] Input data integrity verified (hash match)
- [ ] Tolerance criteria pre-specified + justified
- [ ] Validation report complete + signed

## Traps

- **Same analyst writing both impls**: Double programming requires independent analysts for true validation
- **Sharing code between impls**: Independent ver must not copy from primary
- **Inappropriate tolerance**: Too loose hides real errs; too strict flags floating-pt noise
- **Ignore systematic diffs**: Small consistent biases may indicate real err even within tolerance
- **No validate validation**: Verify comparison code itself works correctly w/ known inputs

## →

- `setup-gxp-r-project` — project structure for validated work
- `write-validation-documentation` — protocol + report templates
- `implement-audit-trail` — track validation process itself
- `write-testthat-tests` — automated test suites for ongoing validation
