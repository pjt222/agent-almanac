---
name: validate-statistical-output
locale: wenyan-lite
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

# 驗證統計輸出

經獨立計算與系統化比較,驗證統計分析結果。

## 適用時機

- 為法規遞交驗證主要與次要終點分析
- 進行雙重程式設計（R 對 SAS,或獨立之 R 實作）
- 驗證分析代碼產生正確結果
- 代碼或環境變更後重新驗證

## 輸入

- **必要**：主分析代碼與結果
- **必要**：參考結果（獨立計算、已發表值或已知測試資料）
- **必要**：數值比較之容差準則
- **選擇性**：法規遞交背景

## 步驟

### 步驟一：定義比較框架

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

**預期：** 各統計量類別之容差水準已定義,整數計數較嚴（精確匹配）,浮點統計量（p 值、信賴區間）較鬆。

**失敗時：** 若容差水準有爭議,記錄各閾值之理由並於進行前獲統計負責人簽核。法規遞交參 ICH E9 指引。

### 步驟二：建立比較函式

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

**預期：** `compare_results()` 返回資料框,含統計量名、主值、參考值、絕對差、容差及通過/失敗狀態之欄位。

**失敗時：** 若函式因名稱不匹配出錯,驗證兩結果列表用相同統計量名。若容差對應失敗,為未識別之統計量名加預設容差。

### 步驟三：實施雙重程式設計

撰寫透過不同代碼達相同結果之獨立實作：

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

**預期：** 存在兩個獨立實作,經不同代碼路徑（如 `lm()` 對矩陣代數）達相同統計結果。實作由不同分析師撰寫,或用根本不同之方法。

**失敗時：** 若獨立實作產生不同結果,先驗證兩者用同輸入資料（比較 `digest::digest(data)`）。再檢查 NA 處理、對比編碼或自由度計算之差異。

### 步驟四：執行比較

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

**預期：** 比較報告顯示所有統計量於容差內。`Overall` 行讀「ALL PASS」。

**失敗時：** 若發現差異,勿立即假設主分析有誤。調查兩實作：檢查中間計算、驗證輸入資料相同、比較缺失值與邊緣情況之處理。

### 步驟五：對外部參考（SAS）比較

對 R 與 SAS 輸出比較時：

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

**預期：** R 對 SAS 比較結果於容差內,任何已知系統性差異（對比編碼、捨入）已記錄並解釋。

**失敗時：** 若 R 與 SAS 產生超容差之差異,檢查三個最常見之分歧來源：預設對比編碼（R 用 treatment 對比、SAS 用 GLM 參數化）、缺失值處理、中間計算之捨入。記錄各差異與其根因。

### 步驟六：記錄結果

建立驗證報告：

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

**預期：** 完整之驗證報告文件存於 `validation/output_comparison_report.txt`,含專案元資料、比較結果、整體裁定與會話資訊。

**失敗時：** 若 `sink()` 失敗或產生空文件,檢查輸出目錄存在（`dir.create("validation", showWarnings = FALSE)`）且無先前之 `sink()` 呼叫仍活躍（用 `sink.number()` 檢查）。

### 步驟七：處理差異

當結果不匹配時：

1. 驗證兩實作用相同輸入資料（雜湊比較）
2. 檢查 NA 處理之差異
3. 逐步比較中間計算
4. 記錄根因
5. 判定差異是否可接受（容差內）或需代碼修正

**預期：** 所有差異經調查、根因辨識,且各被分類為可接受（容差內,有記錄理由）或需代碼修正。

**失敗時：** 若差異無法解釋,升級至統計負責人。勿駁回未解釋之差異,因可能指示某實作有真實錯誤。

## 驗證

- [ ] 獨立分析產生容差內之結果
- [ ] 所有比較統計量已記錄
- [ ] 差異（若有）經調查並解決
- [ ] 輸入資料完整性已驗證（雜湊匹配）
- [ ] 容差準則已預先指定並有理由
- [ ] 驗證報告完整且已簽署

## 常見陷阱

- **同分析師寫兩實作**：雙重程式設計需獨立分析師方為真實驗證
- **實作間共享代碼**：獨立版本不得自主版本複製
- **不適當之容差**：過鬆藏匿真實錯誤；過嚴標記浮點雜訊
- **忽略系統性差異**：小幅一致偏差即便於容差內,亦可能指示真實錯誤
- **未驗證驗證**：以已知輸入驗證比較代碼本身運作正確

## 相關技能

- `setup-gxp-r-project` — 已驗證工作之專案結構
- `write-validation-documentation` — 計畫書與報告範本
- `implement-audit-trail` — 追蹤驗證過程本身
- `write-testthat-tests` — 持續驗證之自動化測試組
