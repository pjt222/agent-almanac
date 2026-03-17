---
name: test-shiny-app
description: >
  エンドツーエンドのブラウザテストにshinytest2を、モジュールサーバーロジックの
  ユニットテストにtestServer()を使ってShinyアプリケーションをテストします。
  スナップショットテスト、CIインテグレーション、外部サービスのモックを扱います。
  既存のShinyアプリケーションにテストを追加するとき、新しいShinyプロジェクトの
  テスト戦略をセットアップするとき、Shinyコードをリファクタリングする前に
  リグレッションテストを書くとき、またはShinyアプリのテストをCI/CDパイプラインに
  統合するときに使用します。
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
  domain: shiny
  complexity: intermediate
  language: R
  tags: shiny, testing, shinytest2, testServer, snapshot, CI
---

# Shinyアプリのテスト

shinytest2（エンドツーエンド）とtestServer()（ユニットテスト）を使ってShinyアプリケーションの包括的なテストをセットアップします。

## 使用タイミング

- 既存のShinyアプリケーションにテストを追加するとき
- 新しいShinyプロジェクトのテスト戦略をセットアップするとき
- Shinyコードをリファクタリングする前にリグレッションテストを書くとき
- ShinyアプリのテストをCI/CDパイプラインに統合するとき

## 入力

- **必須**: Shinyアプリケーションへのパス
- **必須**: テストのスコープ（ユニットテスト、エンドツーエンド、または両方）
- **オプション**: スナップショットテストを使用するか（デフォルト：e2eではあり）
- **オプション**: CIプラットフォーム（GitHub Actions、GitLab CI）
- **オプション**: 分離してテストするモジュール

## 手順

### ステップ1: テスト依存関係のインストール

```r
install.packages("shinytest2")

# golemアプリの場合、Suggests依存関係として追加
usethis::use_package("shinytest2", type = "Suggests")

# testthatインフラがない場合はセットアップ
usethis::use_testthat(edition = 3)
```

**期待結果：** shinytest2がインストールされ、testthatディレクトリ構造が整っています。

**失敗時：** shinytest2にはchromore（ヘッドレスChrome）が必要です。システムにChrome/Chromiumをインストールしてください。WSLの場合：`sudo apt install -y chromium-browser`。`chromote::find_chrome()`で確認してください。

### ステップ2: モジュールのtestServer()ユニットテストの記述

`tests/testthat/test-mod_dashboard.R`を作成します：

```r
test_that("dashboard module filters data correctly", {
  testServer(dataFilterServer, args = list(
    data = reactive(iris),
    columns = c("Species", "Sepal.Length")
  ), {
    # 入力を設定
    session$setInputs(column = "Species")
    session$setInputs(value_select = "setosa")
    session$setInputs(apply = 1)

    # 出力を確認
    result <- filtered()
    expect_equal(nrow(result), 50)
    expect_true(all(result$Species == "setosa"))
  })
})

test_that("dashboard module handles empty data", {
  testServer(dataFilterServer, args = list(
    data = reactive(iris[0, ]),
    columns = c("Species")
  ), {
    # モジュールは空のデータでエラーを出してはいけない
    expect_no_error(session$setInputs(column = "Species"))
  })
})
```

主要なパターン：
- `testServer()`はブラウザなしでモジュールサーバーロジックをテストする
- `args`リストでリアクティブな引数を渡す
- `session$setInputs()`でユーザーインタラクションをシミュレートする
- リアクティブな戻り値には名前で直接アクセスする
- エッジケースをテストする：空のデータ、NULL入力、無効な値

**期待結果：** `devtools::test()`でモジュールテストが通過します。

**失敗時：** `testServer()`が「not a module server function」でエラーになる場合は、関数が内部で`moduleServer()`を使用していることを確認してください。`session$setInputs()`がリアクティブをトリガーしない場合は、入力を設定した後に`session$flushReact()`を追加してください。

### ステップ3: shinytest2エンドツーエンドテストの記述

`tests/testthat/test-app-e2e.R`を作成します：

```r
test_that("app loads and displays initial state", {
  # golemアプリの場合
  app <- AppDriver$new(
    app_dir = system.file(package = "myapp"),
    name = "initial-load",
    height = 800,
    width = 1200
  )
  on.exit(app$stop(), add = TRUE)

  # アプリが読み込まれるのを待つ
  app$wait_for_idle(timeout = 10000)

  # 主要な要素が存在するか確認
  app$expect_values()
})

test_that("filter interaction updates the table", {
  app <- AppDriver$new(
    app_dir = system.file(package = "myapp"),
    name = "filter-interaction"
  )
  on.exit(app$stop(), add = TRUE)

  # アプリと対話する
  app$set_inputs(`filter1-column` = "cyl")
  app$wait_for_idle()

  app$set_inputs(`filter1-apply` = "click")
  app$wait_for_idle()

  # 出力値のスナップショット
  app$expect_values(output = "table")
})
```

主要なパターン：
- `AppDriver$new()`がヘッドレスChromeでアプリを起動する
- クリーンアップのために常に`on.exit(app$stop())`を使用する
- モジュールの入力IDは`"moduleId-inputId"`形式を使用する
- `app$expect_values()`がスナップショットファイルを作成/比較する
- `app$wait_for_idle()`がリアクティブな更新の完了を保証する

**期待結果：** エンドツーエンドテストが`tests/testthat/_snaps/`にスナップショットファイルを作成します。

**失敗時：** Chromeが見つからない場合は、`CHROMOTE_CHROME`環境変数をChromeバイナリのパスに設定してください。CIではスナップショットが失敗するがローカルでは通過する場合は、プラットフォーム依存のレンダリングの差異を確認してください。視覚的なスナップショットには`app$expect_screenshot()`ではなく`app$expect_values()`を使用してください。

### ステップ4: インタラクティブなテスト記録（オプション）

```r
shinytest2::record_test("path/to/app")
```

これはブラウザで記録パネル付きのアプリを開きます。アプリと対話し、「Save test」をクリックしてテストコードを自動生成します。

**期待結果：** 記録されたインタラクションを含むテストファイルが`tests/testthat/`に生成されます。

**失敗時：** レコーダーが開かない場合は、まず`shiny::runApp()`でアプリが正常に起動することを確認してください。レコーダーには動作するアプリが必要です。

### ステップ5: スナップショット管理のセットアップ

スナップショットベースのテストの場合、期待値を管理します：

```r
# レビュー後に新しい/変更されたスナップショットを受け入れる
testthat::snapshot_accept("test-app-e2e")

# スナップショットの差異をレビュー
testthat::snapshot_review("test-app-e2e")
```

スナップショットディレクトリをバージョン管理に追加します：

```
tests/testthat/_snaps/    # コミット済み — 期待値を含む
```

**期待結果：** スナップショットファイルがリグレッション検出のためにgitでトラッキングされています。

**失敗時：** スナップショットが予期せず変更された場合は、`testthat::snapshot_review()`を実行して差分を確認してください。意図的な変更は`testthat::snapshot_accept()`で受け入れてください。

### ステップ6: CIとの統合

`.github/workflows/R-CMD-check.yaml`に追加するか、専用のワークフローを作成します：

```yaml
- name: Install system dependencies
  run: |
    sudo apt-get update
    sudo apt-get install -y chromium-browser

- name: Set Chrome path
  run: echo "CHROMOTE_CHROME=$(which chromium-browser)" >> $GITHUB_ENV

- name: Run tests
  run: |
    Rscript -e 'devtools::test()'
```

golemアプリの場合は、テスト前にアプリパッケージがインストールされていることを確認してください：

```yaml
- name: Install app package
  run: Rscript -e 'devtools::install()'
```

**期待結果：** ヘッドレスChromeでCIのテストが通過します。

**失敗時：** よくあるCIの問題：Chromeがインストールされていない（apt-getステップを追加）、タイムアウト（`AppDriver$new()`の`timeout`を増やす）。

## バリデーション

- [ ] `devtools::test()`がすべてのテストをエラーなしで実行する
- [ ] testServer()テストがモジュールサーバーロジックをカバーする
- [ ] shinytest2テストが主要なユーザーワークフローをカバーする
- [ ] スナップショットファイルがバージョン管理にコミットされている
- [ ] CI環境でテストが通過する
- [ ] エッジケースがテストされている（空のデータ、NULL入力、エラー状態）

## よくある落とし穴

- **ロジックではなくUIレンダリングをテストする**: ロジックには`testServer()`を、データには`app$expect_values()`を優先してください。視覚的な外観が重要な場合にのみ`app$expect_screenshot()`を使用してください — スクリーンショットはプラットフォーム間で壊れやすいです。
- **e2eテストでのモジュールID形式**: AppDriver経由でモジュールの入力を設定するときは、`"moduleId.inputId"`ではなく`"moduleId-inputId"`形式（ハイフン区切り）を使用してください。
- **タイミングの不安定さ**: `app$set_inputs()`の後は常に`app$wait_for_idle()`を呼び出してください。それなしではリアクティブな更新が完了する前にアサーションが実行される可能性があります。
- **スナップショットのドリフト**: 異なるプラットフォーム（MacとLinux）で生成されたスナップショットをコミットしないでください。スナップショット生成はCIプラットフォームに標準化してください。
- **CIでChromeがない**: shinytest2はChrome/Chromiumが必要です。CIワークフローには常にインストールステップを含めてください。

## 関連スキル

- `build-shiny-module` — 明確なインターフェースを持つテスト可能なモジュールの作成
- `scaffold-shiny-app` — テストインフラを含むアプリ構造のセットアップ
- `write-testthat-tests` — Rパッケージの一般的なtestthatパターン
- `setup-github-actions-ci` — Rパッケージ（golemアプリ）のCI/CDセットアップ
