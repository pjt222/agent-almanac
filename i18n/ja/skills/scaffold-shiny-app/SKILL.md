---
name: scaffold-shiny-app
description: >
  golem（本番Rパッケージ）、rhino（エンタープライズ）、またはvanilla（クイック
  プロトタイプ）構造を使って新しいShinyアプリケーションをスキャフォールドします。
  フレームワークの選択、プロジェクトの初期化、最初のモジュール作成を扱います。
  Rで新しいインタラクティブWebアプリケーションを開始するとき、ダッシュボードや
  データエクスプローラーのプロトタイプを作成するとき、golemを使ってRパッケージ
  として本番Shinyアプリをセットアップするとき、またはrhinoでエンタープライズ
  Shinyプロジェクトをブートストラップするときに使用します。
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
  complexity: basic
  language: R
  tags: shiny, golem, rhino, scaffold, web-app, reactive
---

# Shinyアプリのスキャフォールド

golem、rhino、またはvanillaスキャフォールドを使って本番対応の構造で新しいShinyアプリケーションを作成します。

## 使用タイミング

- Rで新しいインタラクティブWebアプリケーションを開始するとき
- ダッシュボードやデータエクスプローラーのプロトタイプを作成するとき
- RパッケージとしてShinyアプリを本番設定でセットアップするとき（golem）
- エンタープライズShinyプロジェクトをブートストラップするとき（rhino）

## 入力

- **必須**: アプリケーション名
- **必須**: フレームワークの選択（golem、rhino、またはvanilla）
- **オプション**: モジュールスキャフォールドを含めるか（デフォルト：あり）
- **オプション**: 依存関係管理にrenvを使用するか（デフォルト：あり）
- **オプション**: デプロイ先（shinyapps.io、Posit Connect、Docker）

## 手順

### ステップ1: フレームワークの選択

適切なフレームワークを選択するためにプロジェクト要件を評価します：

| フレームワーク | 最適用途 | 構造 |
|-------------|---------|------|
| **golem** | Rパッケージとして出荷する本番アプリ | DESCRIPTION、テスト、ビネットを持つRパッケージ |
| **rhino** | JS/CSSビルドパイプラインを持つエンタープライズアプリ | boxモジュール、Sass、JSバンドリング、rhino::init() |
| **vanilla** | クイックプロトタイプと学習 | 単一のapp.RまたはUI.R/server.Rペア |

**期待結果：** プロジェクトのスコープとチームのニーズに基づいた明確なフレームワークの決定。

**失敗時：** 迷う場合はgolemをデフォルトとして選択してください。最も構造化されており、後で簡略化できます。vanillaは使い捨てプロトタイプにのみ適しています。

### ステップ2: プロジェクトのスキャフォールド

#### Golemパス

```r
golem::create_golem("myapp", package_name = "myapp")
```

これにより以下が作成されます：
```
myapp/
├── DESCRIPTION
├── NAMESPACE
├── R/
│   ├── app_config.R
│   ├── app_server.R
│   ├── app_ui.R
│   └── run_app.R
├── dev/
│   ├── 01_start.R
│   ├── 02_dev.R
│   ├── 03_deploy.R
│   └── run_dev.R
├── inst/
│   ├── app/www/
│   └── golem-config.yml
├── man/
├── tests/
│   ├── testthat.R
│   └── testthat/
└── vignettes/
```

#### Rhinoパス

```r
rhino::init("myapp")
```

これにより以下が作成されます：
```
myapp/
├── app/
│   ├── js/
│   ├── logic/
│   ├── static/
│   ├── styles/
│   ├── view/
│   └── main.R
├── tests/
│   ├── cypress/
│   └── testthat/
├── .github/
├── app.R
├── dependencies.R
├── rhino.yml
└── renv.lock
```

#### Vanillaパス

`app.R`を作成します：

```r
library(shiny)
library(bslib)

ui <- page_sidebar(
  title = "My App",
  sidebar = sidebar(
    sliderInput("n", "Sample size", 10, 1000, 100)
  ),
  card(
    card_header("Output"),
    plotOutput("plot")
  )
)

server <- function(input, output, session) {
  output$plot <- renderPlot({
    hist(rnorm(input$n), main = "Random Normal")
  })
}

shinyApp(ui, server)
```

**期待結果：** すべてのスキャフォールドファイルが作成されたプロジェクトディレクトリ。

**失敗時：** golemの場合は、golemパッケージがインストールされているか確認してください：`install.packages("golem")`。rhinoの場合はGitHubからインストールしてください：`remotes::install_github("Appsilon/rhino")`。vanillaの場合はshinyとbslibがインストールされているか確認してください。

### ステップ3: 依存関係の設定

#### Golem/Vanilla

```r
# renvの初期化
renv::init()

# コア依存関係の追加
usethis::use_package("shiny")
usethis::use_package("bslib")
usethis::use_package("DT")         # データテーブルを使用する場合
usethis::use_package("plotly")     # インタラクティブプロットを使用する場合

# スナップショット
renv::snapshot()
```

#### Rhino

依存関係は`dependencies.R`で管理されます：

```r
# dependencies.R
library(shiny)
library(bslib)
library(DT)
```

**期待結果：** すべての依存関係がDESCRIPTION（golem）またはdependencies.R（rhino）に記録され、renvでロックされています。

**失敗時：** renv::init()が失敗する場合は書き込み権限を確認してください。パッケージのインストールが失敗する場合はRバージョンの互換性を確認してください。

### ステップ4: 最初のモジュールの作成

#### Golem

```r
golem::add_module(name = "dashboard", with_test = TRUE)
```

これにより`R/mod_dashboard.R`と`tests/testthat/test-mod_dashboard.R`が作成されます。

#### Rhino

`app/view/dashboard.R`を作成します：

```r
box::use(
  shiny[moduleServer, NS, tagList, h3, plotOutput, renderPlot],
)

#' @export
ui <- function(id) {
  ns <- NS(id)
  tagList(
    h3("Dashboard"),
    plotOutput(ns("plot"))
  )
}

#' @export
server <- function(id) {
  moduleServer(id, function(input, output, session) {
    output$plot <- renderPlot({
      plot(1:10)
    })
  })
}
```

#### Vanilla

UIとサーバー関数を別のファイル`R/mod_dashboard.R`に追加します：

```r
dashboardUI <- function(id) {
  ns <- NS(id)
  tagList(
    h3("Dashboard"),
    plotOutput(ns("plot"))
  )
}

dashboardServer <- function(id) {
  moduleServer(id, function(input, output, session) {
    output$plot <- renderPlot({
      plot(1:10)
    })
  })
}
```

**期待結果：** 適切な名前空間を使用したUIとサーバー関数を持つモジュールファイルが作成されます。

**失敗時：** モジュールがUI関数内のすべてのinput/output IDに対して`NS(id)`を使用していることを確認してください。名前空間がなければ、モジュールを複数回使用するとIDが衝突します。

### ステップ5: アプリケーションの実行

```r
# Golem
golem::run_dev()

# Rhino
shiny::runApp()

# Vanilla
shiny::runApp("app.R")
```

**期待結果：** アプリケーションがエラーなしでブラウザで起動します。

**失敗時：** Rコンソールのエラーメッセージを確認してください。よくある問題：パッケージの欠落（インストールしてください）、ポートが使用中（`port = 3839`で別のポートを指定）、またはUI/サーバーコードの構文エラー。

## バリデーション

- [ ] アプリケーションディレクトリが選択したフレームワークに対して正しい構造を持つ
- [ ] `shiny::runApp()`がエラーなしで起動する
- [ ] UIとサーバー関数を持つ少なくとも1つのモジュールがスキャフォールドされている
- [ ] 依存関係が記録されている（DESCRIPTIONまたはdependencies.R）
- [ ] renv.lockがすべてのパッケージバージョンをキャプチャしている
- [ ] モジュールが適切な名前空間分離のために`NS(id)`を使用している

## よくある落とし穴

- **本番にvanillaを選ぶ**: vanilla構造にはテストインフラ、ドキュメント、デプロイツールが不足しています。プロトタイプ以外にはgolemまたはrhinoを使用してください。
- **モジュールで名前空間を省略する**: モジュールUIのすべての`inputId`と`outputId`は`ns()`でラップする必要があります。これを忘れるとサイレントなID衝突が起きます。
- **devtoolsワークフローなしのgolem**: golemアプリはRパッケージです。`source()`ではなく`devtools::load_all()`、`devtools::test()`、`devtools::document()`を使用してください。
- **boxなしのrhino**: rhinoはモジュールインポートにboxを使用します。`library()`呼び出しに戻らず、明示的なインポートには`box::use()`を使用してください。

## 関連スキル

- `build-shiny-module` — 適切な名前空間分離を持つ再利用可能なShinyモジュールの作成
- `test-shiny-app` — shinytest2とtestServer()テストのセットアップ
- `deploy-shiny-app` — shinyapps.io、Posit Connect、またはDockerへのデプロイ
- `design-shiny-ui` — bslibのテーマとレスポンシブレイアウトデザイン
- `create-r-package` — Rパッケージスキャフォールド（golemアプリはRパッケージ）
- `manage-renv-dependencies` — 詳細なrenv依存関係管理
