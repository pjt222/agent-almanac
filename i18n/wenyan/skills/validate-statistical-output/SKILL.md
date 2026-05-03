---
name: validate-statistical-output
locale: wenyan
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

# 驗統計之出

以獨計與系較，驗統計析之果。

## 用時

- 為監管呈驗主與次端點析
- 行雙編程（R 對 SAS、或獨 R 之施）
- 驗析碼生正果
- 碼或境變後重驗

## 入

- **必要**：主析之碼與果
- **必要**：參果（獨計、已發值、或已知試數）
- **必要**：數較之容差準
- **可選**：監管呈之脈絡

## 法

### 第一步：定較之框

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

得：每統計類之容差已定，整計嚴（精配）、浮點統計（p 值、信區）寬。

敗則：容差爭者，記每閾之理而前進前得統計領之准。監管呈查 ICH E9 之囑。

### 第二步：立較之函

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

得：`compare_results()` 返數框，含統計名、主值、參值、絕差、容差、過敗狀。

敗則：函於名不配時訛者，驗兩果列用同統計名。容差映敗者，加默容差為未識統計名。

### 第三步：施雙編程

書獨之施，異碼達同果：

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

得：兩獨施存，用異碼徑（如 `lm()` 對矩陣代數）達同統計果。其由異析者書或用根本異法。

敗則：獨施生異果者，先驗兩用同入數（較 `digest::digest(data)`）。次察 NA 處、對比編、自由度計之差。

### 第四步：行較

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

得：較報示諸統計皆於容差內。`Overall` 行讀「ALL PASS」。

敗則：見差者，勿即假主析誤。察兩施：察中計、驗同入數、較缺值與邊例之處。

### 第五步：對外參較（SAS）

R 出對 SAS 較時：

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

得：R 對 SAS 較果於容差內，已知系差（對比編、舍入）已記已釋。

敗則：R 與 SAS 異超容者，察三常分歧之源：默對比編（R 用處理對比、SAS 用 GLM 參化）、缺值處、中計舍入。每差記其根因。

### 第六步：記其果

立驗報：

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

得：完驗報文存於 `validation/output_comparison_report.txt`，含項目元、較果、總判、會信。

敗則：`sink()` 敗或生空文者，察出域存（`dir.create("validation", showWarnings = FALSE)`）且無前 `sink()` 仍活（用 `sink.number()` 察）。

### 第七步：處差

果不配時：

1. 驗兩施用同入數（雜湊較）
2. 察 NA 處之異
3. 逐步較中計
4. 記根因
5. 定其差可受（容內）抑需碼修

得：諸差皆已究、根因已識，各分為可受（容內並有理）抑需碼修。

敗則：差不能釋者，升至統計領。勿輕忽未釋之差，蓋或示一施有真訛。

## 驗

- [ ] 獨析生於容差內之果
- [ ] 諸較統計已記
- [ ] 差（若有）已究而解
- [ ] 入數整已驗（雜湊配）
- [ ] 容差準已預定且有理
- [ ] 驗報全且簽

## 陷

- **同析者書兩施**：雙編程需獨析者方為真驗
- **施間共碼**：獨版不可抄主版
- **不宜容差**：過寬掩真訛；過嚴標浮點噪
- **忽系差**：小恆偏或示真訛雖在容內
- **不驗驗**：以已知入察較碼自正

## 參

- `setup-gxp-r-project` - 已驗工作之項目結構
- `write-validation-documentation` - 程與報之模
- `implement-audit-trail` - 追驗過自身
- `write-testthat-tests` - 持驗之自試套
