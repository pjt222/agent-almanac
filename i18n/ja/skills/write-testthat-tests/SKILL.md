---
name: write-testthat-tests
description: >
  Rパッケージ関数の包括的なtestthat（エディション3）テストを記述する。
  テストの構成、期待値、フィクスチャ、モック、スナップショットテスト、
  パラメータ化テスト、高いカバレッジ達成を網羅。新規パッケージ関数のテスト追加、
  既存コードのテストカバレッジ向上、バグ修正のリグレッションテスト作成、
  またはテストインフラの未整備なパッケージへの設定時に使用する。
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
  complexity: intermediate
  language: R
  tags: r, testthat, testing, unit-tests, coverage
---

# testthatテストの記述

testthatエディション3を使用してRパッケージ関数の包括的なテストを作成する。

## 使用タイミング

- 新規パッケージ関数のテストを追加する時
- 既存コードのテストカバレッジを向上させる時
- バグ修正のリグレッションテストを作成する時
- 新規パッケージのテストインフラを設定する時

## 入力

- **必須**: テスト対象のR関数
- **必須**: 期待される動作とエッジケース
- **任意**: テストフィクスチャまたはサンプルデータ
- **任意**: 目標カバレッジ率（デフォルト：80%）

## 手順

### ステップ1: テストインフラの設定

まだ設定していない場合：

```r
usethis::use_testthat(edition = 3)
```

これにより`tests/testthat.R`と`tests/testthat/`ディレクトリが作成される。

**期待結果：** `tests/testthat.R`と`tests/testthat/`ディレクトリが作成される。DESCRIPTIONに`Config/testthat/edition: 3`が設定される。

**失敗時：** usethisが利用できない場合、`tests/testthat.R`を手動で作成し`library(testthat); library(packagename); test_check("packagename")`を含め、`tests/testthat/`ディレクトリを追加する。

### ステップ2: テストファイルの作成

```r
usethis::use_test("function_name")
```

`tests/testthat/test-function_name.R`にテンプレートが作成される。

**期待結果：** `tests/testthat/test-function_name.R`にプレースホルダーの`test_that()`ブロックが作成され、すぐに記述できる状態になる。

**失敗時：** `usethis::use_test()`が利用できない場合、ファイルを手動で作成する。`test-<function_name>.R`という命名規則に従うこと。

### ステップ3: 基本テストの記述

```r
test_that("weighted_mean computes correct result", {
  expect_equal(weighted_mean(1:3, c(1, 1, 1)), 2)
  expect_equal(weighted_mean(c(10, 20), c(1, 3)), 17.5)
})

test_that("weighted_mean handles NA values", {
  expect_equal(weighted_mean(c(1, NA, 3), c(1, 1, 1), na.rm = TRUE), 2)
  expect_true(is.na(weighted_mean(c(1, NA, 3), c(1, 1, 1), na.rm = FALSE)))
})

test_that("weighted_mean validates input", {
  expect_error(weighted_mean("a", 1), "numeric")
  expect_error(weighted_mean(1:3, 1:2), "length")
})
```

**期待結果：** 基本テストが、典型的な入力に対する正しい出力、NAの処理動作、入力バリデーションのエラーメッセージをカバーしている。

**失敗時：** テストがすぐに失敗する場合、関数が読み込まれているか確認する（`devtools::load_all()`）。エラーメッセージが一致しない場合、`expect_error()`で正確な文字列の代わりに正規表現パターンを使用する。

### ステップ4: エッジケースのテスト

```r
test_that("weighted_mean handles edge cases", {
  # 空の入力
  expect_error(weighted_mean(numeric(0), numeric(0)))

  # 単一の値
  expect_equal(weighted_mean(5, 1), 5)

  # ゼロの重み
  expect_true(is.nan(weighted_mean(1:3, c(0, 0, 0))))

  # 非常に大きな値
  expect_equal(weighted_mean(c(1e15, 1e15), c(1, 1)), 1e15)

  # 負の重み
  expect_error(weighted_mean(1:3, c(-1, 1, 1)))
})
```

**期待結果：** エッジケースがカバーされている：空の入力、単一の値、ゼロの重み、極端な値、無効な入力。各エッジケースに明確な期待動作がある。

**失敗時：** 関数がエッジケースを期待通りに処理しない場合、関数を修正するかテストを調整するかを判断する。曖昧なケースの意図する動作を文書化する。

### ステップ5: 複雑なテストにフィクスチャを使用

テストデータ用に`tests/testthat/fixtures/`を作成する：

```r
# tests/testthat/helper.R（自動的に読み込まれる）
create_test_data <- function() {
  data.frame(
    x = c(1, 2, 3, NA, 5),
    group = c("a", "a", "b", "b", "b")
  )
}
```

```r
# テストファイル内
test_that("process_data works with grouped data", {
  test_data <- create_test_data()
  result <- process_data(test_data)
  expect_s3_class(result, "data.frame")
  expect_equal(nrow(result), 2)
})
```

**期待結果：** フィクスチャが複数のテストファイルにわたって一貫したテストデータを提供する。`tests/testthat/helper.R`のヘルパー関数はtestthatによって自動的に読み込まれる。

**失敗時：** ヘルパー関数が見つからない場合、ファイルが`helpers.R`ではなく`helper.R`という名前で`tests/testthat/`にあることを確認する。必要に応じてRセッションを再起動する。

### ステップ6: 外部依存関係のモック

```r
test_that("fetch_data handles API errors", {
  local_mocked_bindings(
    api_call = function(...) stop("Connection refused")
  )
  expect_error(fetch_data("endpoint"), "Connection refused")
})

test_that("fetch_data returns parsed data", {
  local_mocked_bindings(
    api_call = function(...) list(data = list(value = 42))
  )
  result <- fetch_data("endpoint")
  expect_equal(result$value, 42)
})
```

**期待結果：** 外部依存関係（API、データベース、ネットワーク呼び出し）がモック化され、テストが実際の接続なしで実行される。モックの戻り値が関数のデータ処理ロジックを検証する。

**失敗時：** `local_mocked_bindings()`が失敗する場合、モック化される関数がテストスコープからアクセス可能か確認する。他のパッケージの関数には`.package`引数を使用する。

### ステップ7: 複雑な出力のスナップショットテスト

```r
test_that("format_report produces expected output", {
  expect_snapshot(format_report(test_data))
})

test_that("plot_results creates expected plot", {
  expect_snapshot_file(
    save_plot(plot_results(test_data), "test-plot.png"),
    "expected-plot.png"
  )
})
```

**期待結果：** スナップショットファイルが`tests/testthat/_snaps/`に作成される。最初の実行でベースラインが作成され、以降の実行はそれと比較される。

**失敗時：** 意図的な変更後にスナップショットが失敗する場合、`testthat::snapshot_accept()`で更新する。クロスプラットフォームの違いには、プラットフォーム固有のスナップショットを保持するために`variant`パラメータを使用する。

### ステップ8: スキップ条件の使用

```r
test_that("database query works", {
  skip_on_cran()
  skip_if_not(has_db_connection(), "No database available")

  result <- query_db("SELECT 1")
  expect_equal(result[[1]], 1)
})

test_that("parallel computation works", {
  skip_on_os("windows")
  skip_if(parallel::detectCores() < 2, "Need multiple cores")

  result <- parallel_compute(1:100)
  expect_length(result, 100)
})
```

**期待結果：** 特別な環境（ネットワーク、データベース、複数コア）が必要なテストが適切なスキップ条件で保護されている。これらのテストはローカルでは実行されるが、CRANや制限されたCI環境ではスキップされる。

**失敗時：** テストがCRANやCIでは失敗するがローカルではパスする場合、`test_that()`ブロックの先頭に適切な`skip_on_cran()`、`skip_on_os()`、または`skip_if_not()`ガードを追加する。

### ステップ9: テストの実行とカバレッジの確認

```r
# すべてのテストを実行
devtools::test()

# 特定のテストファイルを実行
devtools::test_active_file()  # RStudioで
testthat::test_file("tests/testthat/test-function_name.R")

# カバレッジを確認
covr::package_coverage()
covr::report()
```

**期待結果：** `devtools::test()`ですべてのテストがパスする。カバレッジレポートが目標率（>80%を目標）を達成していることを示す。

**失敗時：** テストが失敗した場合、テスト出力を読んで特定のアサーション失敗を確認する。カバレッジが目標を下回る場合は`covr::report()`を使用してテストされていないコードパスを特定し、テストを追加する。

## バリデーション

- [ ] `devtools::test()`ですべてのテストがパスする
- [ ] カバレッジが目標率を超えている
- [ ] エクスポートされるすべての関数に少なくとも1つのテストがある
- [ ] エラー条件がテストされている
- [ ] エッジケースがカバーされている（NA、NULL、空、境界値）
- [ ] テストが外部状態や実行順序に依存していない

## よくある落とし穴

- **テストが互いに依存している**: 各`test_that()`ブロックは独立していなければならない
- **ハードコードされたファイルパス**: テストフィクスチャには`testthat::test_path()`を使用する
- **浮動小数点の比較**: `expect_identical()`ではなく`expect_equal()`（許容誤差あり）を使用する
- **プライベート関数のテスト**: 可能な限りパブリックAPIを通じてテストする。`:::`は控えめに使用する
- **CIでのスナップショットテスト**: スナップショットはプラットフォーム依存。クロスプラットフォームには`variant`パラメータを使用する
- **`skip_on_cran()`の忘れ**: ネットワーク、データベース、または長い実行時間が必要なテストはCRANでスキップしなければならない

## 例

```r
# パターン：テストファイルはR/ファイルを反映する
# R/weighted_mean.R -> tests/testthat/test-weighted_mean.R

# パターン：説明的なテスト名
test_that("weighted_mean returns NA when na.rm = FALSE and input contains NA", {
  result <- weighted_mean(c(1, NA), c(1, 1), na.rm = FALSE)
  expect_true(is.na(result))
})

# パターン：警告のテスト
test_that("deprecated_function emits deprecation warning", {
  expect_warning(deprecated_function(), "deprecated")
})
```

## 関連スキル

- `create-r-package` - パッケージ作成の一部としてテストインフラを設定する
- `write-roxygen-docs` - テストする関数のドキュメント化
- `setup-github-actions-ci` - プッシュ時にテストを自動実行する
- `submit-to-cran` - CRANはすべてのプラットフォームでテストのパスを要求する
