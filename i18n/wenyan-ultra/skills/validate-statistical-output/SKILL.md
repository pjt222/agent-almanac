---
name: validate-statistical-output
locale: wenyan-ultra
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

# 驗統出

以獨算與系較證統析果。

## 用

- 驗管呈之主次端點析→用
- 行雙編（R vs SAS、或獨 R 實）→用
- 證析碼生正果→用
- 碼或境變後重驗→用

## 入

- **必**：主析碼與果
- **必**：參果（獨算、刊值、已知試數）
- **必**：數較容差
- **可**：管呈境

## 行

### 一：定較框

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

得：諸統類定容差，整計嚴（精配）、浮點寬（p 值、信限）。

敗：容差有爭→錄各值理據、續前得統頭簽。參 ICH E9 於管呈。

### 二：建較函

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

得：`compare_results()` 返附統名、主值、參值、絕差、容差、過/敗欄之數據框。

敗：函於名不配誤→驗二果列用同名。容差對應失→加默容差於未知名。

### 三：行雙編

書獨實，以異碼達同果：

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

得：二獨實存，用異碼路（如 `lm()` vs 矩陣代數）達同統果。實由異析者書、或用根本異法。

敗：獨實生異果→先驗二用同入數（較 `digest::digest(data)`）。次察 NA 處、對比編、自由度算之異。

### 四：行較

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

得：較報示諸統於容差。`Overall` 行讀「ALL PASS」。

敗：覓差→勿即假主析誤。察二實：察中算、驗同入數、較缺值與邊例之處。

### 五：較外參（SAS）

R 與 SAS 較：

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

得：R vs SAS 較果於容差，已知系統異（對比編、捨入）錄釋。

敗：R 與 SAS 異超容差→察三常分歧源：默對比編（R 用處理對比、SAS 用 GLM 參化）、缺值處、中算捨入。各異錄根因。

### 六：錄果

建驗報：

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

得：完驗報檔存於 `validation/output_comparison_report.txt`，含案元、較果、總判、會信。

敗：`sink()` 敗或生空檔→察出目存（`dir.create("validation", showWarnings = FALSE)`）、無前 `sink()` 仍活（`sink.number()` 察）。

### 七：理差

果不配時：

1. 驗二實用同入數（雜湊較）
2. 察 NA 處異
3. 步步較中算
4. 錄根因
5. 定差可受（容差內）或須改碼

得：諸差究、根因辨、各歸可受（容差內附錄因）或須改碼。

敗：差不能釋→升予統頭。勿略未釋差，或示一實真誤。

## 驗

- [ ] 獨析果於容差
- [ ] 諸較統錄
- [ ] 差（若有）究而解
- [ ] 入數完整驗（雜湊配）
- [ ] 容差預定且有理
- [ ] 驗報完且簽

## 忌

- **同析者書二實**：雙編須獨析者方為真驗
- **實間共碼**：獨版不可由主版抄
- **容差不宜**：寬掩真誤；嚴標浮點噪
- **忽系統差**：小恒偏或示真誤雖於容差
- **不驗驗**：以已知入察較碼自身正

## 參

- `setup-gxp-r-project` - 驗工之案構
- `write-validation-documentation` - 綱與報模
- `implement-audit-trail` - 跡驗過程自身
- `write-testthat-tests` - 持驗之自動試套
