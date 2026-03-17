---
name: write-roxygen-docs
description: >
  Rパッケージの関数、データセット、クラスのroxygen2ドキュメントを記述する。
  標準タグ、相互参照、使用例、NAMESPACEエントリの生成を網羅。
  tidyverseドキュメントスタイルに準拠。新規エクスポート関数のドキュメント追加、
  内部ヘルパーやデータセットのドキュメント作成、S3/S4/R6クラスとメソッドの
  ドキュメント作成、またはドキュメント関連のR CMD checkノートの修正時に使用する。
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
  domain: r-packages
  complexity: basic
  language: R
  tags: r, roxygen2, documentation, namespace
---

# Roxygenドキュメントの記述

Rパッケージの関数、データセット、クラスの完全なroxygen2ドキュメントを作成する。

## 使用タイミング

- 新規エクスポート関数にドキュメントを追加する時
- 内部ヘルパー関数をドキュメント化する時
- パッケージのデータセットをドキュメント化する時
- S3/S4/R6クラスとメソッドをドキュメント化する時
- ドキュメント関連の`R CMD check`ノートを修正する時

## 入力

- **必須**: ドキュメント化するR関数、データセット、またはクラス
- **任意**: 相互参照のための関連関数（`@family`、`@seealso`）
- **任意**: 関数をエクスポートすべきかどうか

## 手順

### ステップ1: 関数ドキュメントの記述

roxygenコメントを関数の直上に配置する：

```r
#' Compute the weighted mean of a numeric vector
#'
#' Calculates the arithmetic mean of `x` weighted by `w`. Missing values
#' in either `x` or `w` are handled according to the `na.rm` parameter.
#'
#' @param x A numeric vector of values.
#' @param w A numeric vector of weights, same length as `x`.
#' @param na.rm Logical. Should missing values be removed? Default `FALSE`.
#'
#' @return A single numeric value representing the weighted mean.
#'
#' @examples
#' weighted_mean(1:5, rep(1, 5))
#' weighted_mean(c(1, 2, NA, 4), c(1, 1, 1, 1), na.rm = TRUE)
#'
#' @export
#' @family summary functions
#' @seealso [stats::weighted.mean()] for the base R equivalent
weighted_mean <- function(x, w, na.rm = FALSE) {
  # implementation
}
```

**期待結果：** タイトル、説明文、各パラメータの`@param`、`@return`、`@examples`、`@export`を含む完全なroxygenブロックが作成される。

**失敗時：** タグについて不明な場合は`?roxygen2::rd_roclet`を確認する。よくある省略は`@return`で、CRANではエクスポートされるすべての関数に必須。

### ステップ2: 必須タグリファレンス

| タグ | 目的 | エクスポートに必須？ |
|-----|---------|---------------------|
| `#' Title` | 最初の行、1文 | はい |
| `#' Description` | 空行後の段落 | はい |
| `@param` | パラメータのドキュメント | はい |
| `@return` | 戻り値の説明 | はい（CRAN） |
| `@examples` | 使用例 | 強く推奨 |
| `@export` | NAMESPACEに追加 | はい、パブリックAPIの場合 |
| `@family` | 関連関数のグループ化 | 推奨 |
| `@seealso` | 相互参照 | 任意 |
| `@keywords internal` | 内部としてマーク | エクスポートしないドキュメントに |

**期待結果：** 関数タイプに必要なすべての必須タグが特定される。エクスポートされる関数は最低限`@param`、`@return`、`@examples`、`@export`を持つ。

**失敗時：** タグについて不明な場合は[roxygen2ドキュメント](https://roxygen2.r-lib.org/articles/rd.html)で使用法と構文を確認する。

### ステップ3: データセットのドキュメント化

`R/data.R`を作成する：

```r
#' Example dataset of city temperatures
#'
#' A dataset containing daily temperature readings for major cities.
#'
#' @format A data frame with 365 rows and 4 variables:
#' \describe{
#'   \item{date}{Date of observation}
#'   \item{city}{City name}
#'   \item{temp_c}{Temperature in Celsius}
#'   \item{humidity}{Relative humidity percentage}
#' }
#' @source \url{https://example.com/data}
"city_temperatures"
```

**期待結果：** `R/data.R`に各データセットのroxygenブロックが含まれ、`@format`で構造を説明し、`@source`でデータの出所を提供している。

**失敗時：** `R CMD check`がドキュメント化されていないデータセットを警告する場合、引用符で囲まれた文字列（例：`"city_temperatures"`）が`usethis::use_data()`で保存されたオブジェクト名と完全に一致することを確認する。

### ステップ4: パッケージのドキュメント化

`R/packagename-package.R`を作成する：

```r
#' @keywords internal
"_PACKAGE"

## usethis namespace: start
## usethis namespace: end
NULL
```

**期待結果：** `R/packagename-package.R`が`@keywords internal`と`"_PACKAGE"`センチネルを持って存在する。`devtools::document()`を実行すると`man/packagename-package.Rd`が生成される。

**失敗時：** `R CMD check`がパッケージドキュメントページの欠如を報告する場合、ファイルが`R/<packagename>-package.R`という名前で`"_PACKAGE"`文字列を含むことを確認する。

### ステップ5: 特殊ケースの処理

**名前にドットが含まれる関数**（S3メソッド）：

```r
#' @export
#' @rdname process
process.myclass <- function(x, ...) {
  # S3 method
}
```

**`@inheritParams`によるドキュメントの再利用**：

```r
#' @inheritParams weighted_mean
#' @param trim Fraction of observations to trim.
trimmed_mean <- function(x, w, na.rm = FALSE, trim = 0.1) {
  # implementation
}
```

**`.data`プロノウンを使用したグローバル変数バインディングの修正**：

```r
#' @importFrom rlang .data
my_function <- function(df) {
  dplyr::filter(df, .data$column > 5)
}
```

**期待結果：** 特殊ケース（S3メソッド、継承パラメータ、`.data`プロノウン）が正しくドキュメント化される。`@rdname`でS3メソッドをグループ化する。`@inheritParams`で重複なくパラメータドキュメントを再利用する。

**失敗時：** `R CMD check`が「グローバル変数の可視バインディングがない」と警告する場合は`#' @importFrom rlang .data`を追加するか、最後の手段として`utils::globalVariables()`を使用する。

### ステップ6: ドキュメントの生成

```r
devtools::document()
```

**期待結果：** `man/`ディレクトリが各ドキュメント化オブジェクトの`.Rd`ファイルで更新される。正しいエクスポートとインポートで`NAMESPACE`が再生成される。

**失敗時：** roxygenの構文エラーを確認する。一般的な問題：`\describe{}`内の閉じ括弧の欠如、行の`#'`プレフィックスの欠如、または無効なタグ名。修正後に`devtools::document()`を再実行する。

## バリデーション

- [ ] エクスポートされるすべての関数が`@param`、`@return`、`@examples`を持つ
- [ ] `devtools::document()`がエラーなく実行される
- [ ] `devtools::check()`がドキュメント警告を示さない
- [ ] `@family`タグが関連関数を正しくグループ化している
- [ ] 例がエラーなく実行される（`devtools::run_examples()`でテスト）

## よくある落とし穴

- **`@return`の欠如**: CRANはエクスポートされるすべての関数に戻り値のドキュメントを要求する
- **インターネット/認証が必要な例**: `\dontrun{}`で囲み、理由を説明するコメントを追加する
- **実行が遅い例**: CRANには長すぎるが動作する例には`\donttest{}`を使用する
- **roxygenでのMarkdown**: DESCRIPTIONで`Roxygen: list(markdown = TRUE)`を有効化する
- **`devtools::document()`の実行忘れ**: manページは生成されるものであり、手動で記述するものではない

## 関連スキル

- `create-r-package` - rox ygen設定を含む初期パッケージセットアップ
- `write-testthat-tests` - ドキュメント化した関数のテスト
- `write-vignette` - 関数リファレンスを超えた長文ドキュメント
- `submit-to-cran` - CRANのドキュメント要件
