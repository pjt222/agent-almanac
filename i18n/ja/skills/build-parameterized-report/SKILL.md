---
name: build-parameterized-report
description: >
  異なる入力でレンダリングして複数のバリエーションを生成できるパラメータ化された
  QuartoまたはR Markdownレポートを作成する。パラメータ定義、プログラマティック
  レンダリング、バッチ生成をカバーする。異なる部門、地域、期間で同じレポートを
  生成する時、単一テンプレートからクライアント固有のレポートを作成する時、特定の
  サブセットにフィルタリングするダッシュボードを構築する時、異なる入力で繰り返し
  レポートを自動化する時に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: reporting
  complexity: intermediate
  language: R
  tags: quarto, parameterized, batch, automation, reporting
  locale: ja
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# パラメータ化レポートの構築

パラメータを受け取り、単一テンプレートから複数のカスタマイズされたバリエーションを生成するレポートを作成する。

## 使用タイミング

- 異なる部門、地域、または期間で同じレポートを生成する時
- テンプレートからクライアント固有のレポートを作成する時
- 特定のサブセットにフィルタリングするダッシュボードを構築する時
- 異なる入力で繰り返しレポートを自動化する時

## 入力

- **必須**: レポートテンプレート（QuartoまたはR Markdown）
- **必須**: パラメータ定義（名前、型、デフォルト値）
- **任意**: バッチ生成用のパラメータ値リスト
- **任意**: 生成レポートの出力ディレクトリ

## 手順

### ステップ1: YAMLでパラメータを定義

Quarto（`report.qmd`）の場合:

```yaml
---
title: "Sales Report: `r params$region`"
params:
  region: "North America"
  year: 2025
  include_forecast: true
format:
  html:
    toc: true
---
```

R Markdown（`report.Rmd`）の場合:

```yaml
---
title: "Sales Report"
params:
  region: "North America"
  year: 2025
  include_forecast: true
output: html_document
---
```

**期待結果:** YAMLヘッダーに名前付きパラメータを含む`params:`ブロックがあり、各パラメータが正しい型のデフォルト値を持つ。

**失敗時:** 「object 'params' not found」でレンダリングが失敗する場合、`params:`ブロックがYAMLフロントマター下で正しくインデントされていることを確認する。Quartoの場合、`params`はYAMLのトップレベルでなければならず、`format:`の下にネストしてはならない。

### ステップ2: コードでパラメータを使用

````markdown
```{r}
#| label: filter-data

data <- full_dataset |>
  filter(region == params$region, year == params$year)

nrow(data)
```

## Overview for `r params$region`

This report covers the `r params$region` region for `r params$year`.

```{r}
#| label: forecast
#| eval: !expr params$include_forecast

# This chunk only runs when include_forecast is TRUE
forecast_model <- forecast::auto.arima(data$sales)
forecast::autoplot(forecast_model)
```
````

**期待結果:** コードチャンクが`params$name`でパラメータを参照し、条件付きチャンクがQuartoでは`#| eval: !expr params$flag`を使用する。`` `r params$region` ``のようなインラインR式が動的テキストをレンダリングする。

**失敗時:** `params$name`がNULLを返す場合、パラメータ名がYAML定義とコード参照間で正確に一致していることを確認する（大文字小文字を区別）。デフォルト値が正しい型であることを確認する。

### ステップ3: カスタムパラメータでレンダリング

単一レンダリング:

```r
# Quarto
quarto::quarto_render(
  "report.qmd",
  execute_params = list(region = "Europe", year = 2025)
)

# R Markdown
rmarkdown::render(
  "report.Rmd",
  params = list(region = "Europe", year = 2025),
  output_file = "report-europe-2025.html"
)
```

**期待結果:** カスタムパラメータ値でYAMLデフォルトを上書きして単一レポートが正常にレンダリングされる。出力ファイルが指定パスに作成される。

**失敗時:** Quartoレンダリングが失敗する場合、`quarto` CLIがインストールされPATHにあることを確認する。R Markdownレンダリングが失敗する場合、`rmarkdown`がインストールされていることを確認する。`execute_params`（Quarto）または`params`（R Markdown）のパラメータ名がYAML定義と正確に一致していることを確認する。

### ステップ4: 複数レポートのバッチレンダリング

```r
regions <- c("North America", "Europe", "Asia Pacific", "Latin America")
years <- c(2024, 2025)

# Generate all combinations
combinations <- expand.grid(region = regions, year = years, stringsAsFactors = FALSE)

# Render each
purrr::pwalk(combinations, function(region, year) {
  output_name <- sprintf("report-%s-%d.html",
    tolower(gsub(" ", "-", region)), year)

  quarto::quarto_render(
    "report.qmd",
    execute_params = list(region = region, year = year),
    output_file = output_name
  )
})
```

**期待結果:** 地域-年の組み合わせごとに1つのHTMLファイル。

**失敗時:** パラメータ名がYAMLとコード間で正確に一致していることを確認する。すべてのパラメータ値が有効であることを確認する。

### ステップ5: パラメータバリデーションの追加

```r
#| label: validate-params

stopifnot(
  "Region must be a valid region" = params$region %in% valid_regions,
  "Year must be numeric" = is.numeric(params$year),
  "Year must be reasonable" = params$year >= 2020 && params$year <= 2030
)
```

**期待結果:** バリデーションコードチャンクが各レンダリングの開始時に実行され、パラメータが範囲外または誤った型の場合に情報的なエラーで停止する。

**失敗時:** `stopifnot()`が不明確なエラーメッセージを生成する場合、より明確な診断のために明示的な`if (!cond) stop("message")`呼び出しに切り替える。

### ステップ6: 出力の整理

```r
# Create output directory
output_dir <- file.path("reports", format(Sys.Date(), "%Y-%m"))
dir.create(output_dir, recursive = TRUE, showWarnings = FALSE)

# Render with output path
quarto::quarto_render(
  "report.qmd",
  execute_params = list(region = region),
  output_file = file.path(output_dir, paste0("report-", region, ".html"))
)
```

**期待結果:** 出力ファイルが日付スタンプ付きサブディレクトリに記述的な名前で書き込まれる（例: `reports/2025-06/report-europe.html`）。

**失敗時:** `dir.create()`が失敗する場合、親ディレクトリが存在し書き込み可能であることを確認する。Windowsではパス長が260文字を超えていないことを確認する。

## バリデーション

- [ ] レポートがデフォルトパラメータでレンダリングされる
- [ ] レポートが各セットのカスタムパラメータでレンダリングされる
- [ ] 処理前にパラメータがバリデーションされる
- [ ] 出力ファイルが記述的に名前付けされている
- [ ] 条件付きセクションがパラメータに基づいて正しくレンダリングされる
- [ ] バッチ生成がすべての組み合わせで完了する

## よくある落とし穴

- **パラメータ名の不一致**: YAML名はコード内の`params$name`参照と正確に一致しなければならない
- **型変換**: YAMLは`year: 2025`を整数としてパースするかもしれないが、コードは文字列を期待する場合がある。明示的にする
- **条件付き評価**: Quartoでは`eval = params$flag`ではなく`#| eval: !expr params$flag`を使用する
- **ファイルの上書き**: 一意の出力名なしでは、各レンダリングが前のものを上書きする
- **バッチモードでのメモリ**: 長いバッチ実行はメモリを蓄積する可能性がある。分離のために`callr::r()`の使用を検討する

## 関連スキル

- `create-quarto-report` -- 基本的なQuartoドキュメントセットアップ
- `generate-statistical-tables` -- パラメータに適応するテーブル
- `format-apa-report` -- パラメータ化された学術レポート
