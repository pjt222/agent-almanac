---
name: validate-statistical-output
description: >
  ダブルプログラミング、独立した検証、参照比較を通じて統計分析出力をバリデートします。
  規制環境向けの比較方法論、許容誤差定義、逸脱処理を対象とします。
  規制提出向けの主要・副次エンドポイント分析のバリデーション時、ダブルプログラミング
  （RとSAS、または独立したR実装）の実施時、分析コードが正しい結果を生成することの
  検証時、またはコードや環境の変更後の再バリデーション時に使用します。
locale: ja
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
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

# 統計出力のバリデーション

独立した計算と系統的な比較を通じて統計分析結果を検証します。

## 使用タイミング

- 規制提出向けの主要・副次エンドポイント分析のバリデーション時
- ダブルプログラミングの実施時（RとSAS、または独立したR実装）
- 分析コードが正しい結果を生成することの検証時
- コードや環境の変更後の再バリデーション時

## 入力

- **必須**: 主要分析コードと結果
- **必須**: 参照結果（独立した計算、公表値、または既知のテストデータ）
- **必須**: 数値比較の許容誤差基準
- **任意**: 規制提出のコンテキスト

## 手順

### ステップ1: 比較フレームワークの定義

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

**期待結果：** 各統計カテゴリーの許容誤差レベルが定義され、整数カウントには厳しい許容誤差（完全一致）、浮動小数点統計（p値、信頼区間）には緩い許容誤差が設定されていること。

**失敗時：** 許容誤差レベルが争われた場合は、各閾値の根拠を文書化し、進める前に統計責任者の承認を得ます。規制提出についてはICH E9ガイドラインを参照します。

### ステップ2: 比較関数の作成

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

**期待結果：** `compare_results()` が統計名、主要値、参照値、絶対差、許容誤差、合否ステータスの列を含むデータフレームを返すこと。

**失敗時：** 名前の不一致で関数がエラーになった場合は、両方の結果リストが同じ統計名を使用していることを確認します。許容誤差マッピングが失敗した場合は、認識されない統計名のデフォルト許容誤差を追加します。

### ステップ3: ダブルプログラミングの実装

異なるコードで同じ結果に到達する独立した実装を作成します:

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

**期待結果：** 異なるコードパス（例：`lm()` と行列代数）を使用して同じ統計結果に到達する2つの独立した実装が存在すること。実装が異なるアナリストによって作成されているか、根本的に異なる方法を使用していること。

**失敗時：** 独立した実装が異なる結果を生成した場合は、まず両方が同じ入力データを使用していることを確認します（`digest::digest(data)` を比較）。次に、NA処理、コントラストコーディング、または自由度計算の違いを確認します。

### ステップ4: 比較の実行

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

**期待結果：** 比較報告書がすべての統計を許容誤差内で示すこと。`Overall` 行に「ALL PASS」と表示されること。

**失敗時：** 不一致が見つかった場合、主要分析が間違っていると即座に仮定しないこと。両方の実装を調査します：中間計算を確認し、同一の入力データを検証し、欠損値とエッジケースの処理を比較します。

### ステップ5: 外部参照（SAS）との比較

RとSASの出力を比較する場合:

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

**期待結果：** RとSASの比較結果が許容誤差内に収まり、既知の系統的な差異（コントラストコーディング、丸め）が文書化され、説明されていること。

**失敗時：** RとSASが許容誤差を超えた異なる結果を生成する場合は、差異の3つの最も一般的な原因を確認します：デフォルトのコントラストコーディング（Rは処理コントラスト、SASはGLMパラメータ化を使用）、欠損値の処理、中間計算の丸め。各差異をその根本原因とともに文書化します。

### ステップ6: 結果の文書化

バリデーション報告書を作成します:

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

**期待結果：** `validation/output_comparison_report.txt` にプロジェクトのメタデータ、比較結果、総合評価、セッション情報を含む完全なバリデーション報告書ファイルが存在すること。

**失敗時：** `sink()` が失敗するか空ファイルを生成する場合は、出力ディレクトリが存在するか確認し（`dir.create("validation", showWarnings = FALSE)`）、前の `sink()` 呼び出しがまだアクティブでないか確認します（`sink.number()` を使用）。

### ステップ7: 不一致の処理

結果が一致しない場合:

1. 両方の実装が同じ入力データを使用していることを確認する（ハッシュ比較）
2. NA処理の違いを確認する
3. 中間計算をステップごとに比較する
4. 根本原因を文書化する
5. 差異が許容可能か（許容誤差内で根拠が記録されている）、またはコード修正が必要かを判断する

**期待結果：** すべての不一致が調査され、根本原因が特定され、各不一致が許容可能（許容誤差内で理由が記録されている）またはコード修正が必要として分類されていること。

**失敗時：** 不一致を説明できない場合は、統計責任者にエスカレートします。説明のつかない差異は一方の実装に本物のエラーが存在する可能性があるため、無視しないでください。

## バリデーション

- [ ] 独立した分析が許容誤差内の結果を生成する
- [ ] すべての比較統計が文書化されている
- [ ] 不一致（ある場合）が調査され、解決されている
- [ ] 入力データの整合性が検証されている（ハッシュ一致）
- [ ] 許容誤差基準が事前に指定され、正当化されている
- [ ] バリデーション報告書が完成し、署名されている

## よくある落とし穴

- **同じアナリストが両方の実装を作成**: ダブルプログラミングは真のバリデーションのために独立したアナリストが必要
- **実装間でのコードの共有**: 独立バージョンは主要バージョンからコピーしてはならない
- **不適切な許容誤差**: 緩すぎると本物のエラーを隠す；厳しすぎると浮動小数点のノイズをフラグする
- **系統的差異の無視**: 許容誤差内の小さな一貫したバイアスでも本物のエラーを示している場合がある
- **バリデーションのバリデートなし**: 既知の入力でコンパリゾンコード自体が正しく動作することを確認すること

## 関連スキル

- `setup-gxp-r-project` - バリデート済み作業のプロジェクト構造
- `write-validation-documentation` - プロトコルと報告書テンプレート
- `implement-audit-trail` - バリデーションプロセス自体の追跡
- `write-testthat-tests` - 継続的バリデーションのための自動テストスイート
