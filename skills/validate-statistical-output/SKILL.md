---
name: validate-statistical-output
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

Verify statistical analysis results through independent calculation and systematic comparison.

## When to Use

- Validating primary and secondary endpoint analyses for regulatory submissions
- Performing double programming (R vs SAS, or independent R implementations)
- Verifying that analysis code produces correct results
- Re-validating after code or environment changes

## Inputs

- **Required**: Primary analysis code and results
- **Required**: Reference results (independent calculation, published values, or known test data)
- **Required**: Tolerance criteria for numeric comparisons
- **Optional**: Regulatory submission context

## Procedure

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

**Expected:** Tolerance levels defined for each statistic category, with stricter tolerances for integer counts (exact match) and looser tolerances for floating-point statistics (p-values, confidence intervals).

**On failure:** If tolerance levels are disputed, document the rationale for each threshold and get sign-off from the statistical lead before proceeding. Refer to ICH E9 guidelines for regulatory submissions.

### Step 2: Create Comparison Function

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

**Expected:** `compare_results()` returns a data frame with columns for statistic name, primary value, reference value, absolute difference, tolerance, and pass/fail status.

**On failure:** If the function errors on mismatched names, verify that both result lists use identical statistic names. If tolerance mapping fails, add a default tolerance for unrecognized statistic names.

### Step 3: Implement Double Programming

Write an independent implementation that reaches the same results through different code:

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

**Expected:** Two independent implementations exist that use different code paths (e.g., `lm()` vs. matrix algebra) to arrive at the same statistical results. The implementations are written by different analysts or use fundamentally different methods.

**On failure:** If the independent implementation produces different results, first verify both use the same input data (compare `digest::digest(data)`). Then check for differences in NA handling, contrast coding, or degrees-of-freedom calculations.

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

**Expected:** Comparison report shows all statistics within tolerance. The `Overall` line reads "ALL PASS."

**On failure:** If discrepancies are found, do not immediately assume the primary analysis is wrong. Investigate both implementations: check intermediate calculations, verify identical input data, and compare handling of missing values and edge cases.

### Step 5: Compare Against External Reference (SAS)

When comparing R output against SAS:

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

**Expected:** R-vs-SAS comparison results are within tolerance, with any known systematic differences (contrast coding, rounding) documented and explained.

**On failure:** If R and SAS produce different results beyond tolerance, check the three most common sources of divergence: default contrast coding (R uses treatment contrasts, SAS uses GLM parameterization), handling of missing values, and rounding of intermediate calculations. Document each difference with its root cause.

### Step 6: Document Results

Create a validation report:

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

**Expected:** A complete validation report file exists at `validation/output_comparison_report.txt` containing project metadata, comparison results, overall verdict, and session information.

**On failure:** If `sink()` fails or produces an empty file, check that the output directory exists (`dir.create("validation", showWarnings = FALSE)`) and that no prior `sink()` call is still active (use `sink.number()` to check).

### Step 7: Handle Discrepancies

When results don't match:

1. Verify both implementations use the same input data (hash comparison)
2. Check for differences in NA handling
3. Compare intermediate calculations step by step
4. Document the root cause
5. Determine if the difference is acceptable (within tolerance) or requires code correction

**Expected:** All discrepancies are investigated, root causes identified, and each is classified as either acceptable (within tolerance with documented reason) or requiring code correction.

**On failure:** If a discrepancy cannot be explained, escalate to the statistical lead. Do not dismiss unexplained differences, as they may indicate a genuine error in one implementation.

## Validation

- [ ] Independent analysis produces results within tolerance
- [ ] All comparison statistics are documented
- [ ] Discrepancies (if any) are investigated and resolved
- [ ] Input data integrity verified (hash match)
- [ ] Tolerance criteria are pre-specified and justified
- [ ] Validation report is complete and signed

## Common Pitfalls

- **Same analyst writing both implementations**: Double programming requires independent analysts for true validation
- **Sharing code between implementations**: The independent version must not copy from the primary
- **Inappropriate tolerance**: Too loose hides real errors; too strict flags floating-point noise
- **Ignoring systematic differences**: Small consistent biases may indicate a real error even within tolerance
- **Not validating the validation**: Verify the comparison code itself works correctly with known inputs

## Related Skills

- `setup-gxp-r-project` - project structure for validated work
- `write-validation-documentation` - protocol and report templates
- `implement-audit-trail` - tracking the validation process itself
- `write-testthat-tests` - automated test suites for ongoing validation
