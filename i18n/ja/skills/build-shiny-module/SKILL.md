---
name: build-shiny-module
description: >
  NS()を使って適切な名前空間分離を持つ再利用可能なShinyモジュールを構築します。
  モジュールUI/サーバーペア、リアクティブな戻り値、モジュール間通信、ネストした
  モジュールの構成を扱います。成長するShinyアプリから再利用可能コンポーネントを
  抽出するとき、複数の場所で使われるUIウィジェットを構築するとき、複雑なリアクティブ
  ロジックをクリーンなインターフェースの裏に隠すとき、または大きなアプリケーションを
  小さくテスト可能な単位から構成するときに使用します。
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
  tags: shiny, modules, namespace, reactive, composition
---

# Shinyモジュールの構築

適切な名前空間分離、リアクティブな通信、および構成可能性を持つShiny UI/サーバーモジュールペアを作成します。

## 使用タイミング

- 成長するShinyアプリから再利用可能コンポーネントを抽出するとき
- 複数の場所で使われるUIウィジェットを構築するとき
- 複雑なリアクティブロジックをクリーンなインターフェースの裏に隠すとき
- 大きなアプリケーションを小さくテスト可能な単位から構成するとき

## 入力

- **必須**: モジュールの目的と機能の説明
- **必須**: 入出力の仕様（モジュールが受け取るものと返すもの）
- **オプション**: モジュールが他のモジュールをネストするか（デフォルト：いいえ）
- **オプション**: フレームワークのコンテキスト（golem、rhino、またはvanilla）

## 手順

### ステップ1: モジュールインターフェースの定義

コードを書く前に、モジュールが受け取るものと返すものを定義します：

```
モジュール: data_filter
入力: リアクティブデータセット、フィルタリングする列名
出力: リアクティブなフィルタリング済みデータセット
UI: フィルターコントロール（selectInput、sliderInput、dateRangeInput）
```

**期待結果：** リアクティブな入力、リアクティブな出力、UIエレメントを指定した明確な仕様。

**失敗時：** インターフェースが不明確な場合、モジュールがおそらく広すぎます。単一の責任を持つより小さなモジュールに分割してください。

### ステップ2: モジュールUI関数の作成

```r
#' Data Filter Module UI
#'
#' @param id Module namespace ID
#' @return A tagList of filter controls
#' @export
dataFilterUI <- function(id) {
  ns <- NS(id)
  tagList(
    selectInput(
      ns("column"),
      "Filter column",
      choices = NULL
    ),
    uiOutput(ns("filter_control")),
    actionButton(ns("apply"), "Apply Filter", class = "btn-primary")
  )
}
```

主要なルール：
- 関数名は`<name>UI`規則に従う
- 最初の引数は常に`id`
- 先頭に`ns <- NS(id)`を作成する
- すべての`inputId`と`outputId`を`ns()`でラップする
- 柔軟な配置を可能にするために`tagList()`を返す

**期待結果：** 名前空間化されたinput/outputエレメントを作成するUI関数。

**失敗時：** モジュールを2回使用するとIDが衝突する場合は、すべてのIDが`ns()`でラップされているか確認してください。よくある見落とし：`renderUI()`または`uiOutput()`内のID — これらも`ns()`が必要です。

### ステップ3: モジュールサーバー関数の作成

```r
#' Data Filter Module Server
#'
#' @param id Module namespace ID
#' @param data Reactive expression returning a data frame
#' @param columns Character vector of filterable column names
#' @return Reactive expression returning the filtered data frame
#' @export
dataFilterServer <- function(id, data, columns) {
  moduleServer(id, function(input, output, session) {
    ns <- session$ns

    # データが変わったときに列の選択肢を更新
    observeEvent(data(), {
      available <- intersect(columns, names(data()))
      updateSelectInput(session, "column", choices = available)
    })

    # 選択した列に基づくダイナミックフィルターコントロール
    output$filter_control <- renderUI({
      req(input$column)
      col_data <- data()[[input$column]]

      if (is.numeric(col_data)) {
        sliderInput(
          ns("value_range"),
          "Range",
          min = min(col_data, na.rm = TRUE),
          max = max(col_data, na.rm = TRUE),
          value = range(col_data, na.rm = TRUE)
        )
      } else {
        selectInput(
          ns("value_select"),
          "Values",
          choices = unique(col_data),
          multiple = TRUE,
          selected = unique(col_data)
        )
      }
    })

    # フィルタリングされたデータをリアクティブとして返す
    filtered <- eventReactive(input$apply, {
      req(input$column)
      col <- input$column
      df <- data()

      if (is.numeric(df[[col]])) {
        req(input$value_range)
        df[df[[col]] >= input$value_range[1] &
           df[[col]] <= input$value_range[2], ]
      } else {
        req(input$value_select)
        df[df[[col]] %in% input$value_select, ]
      }
    }, ignoreNULL = FALSE)

    return(filtered)
  })
}
```

主要なルール：
- 関数名は`<name>Server`規則に従う
- 最初の引数は常に`id`
- 追加の引数はリアクティブ式または静的な値
- `moduleServer(id, function(input, output, session) { ... })`を使用する
- サーバー内で作成するダイナミックUIには`session$ns`を使用する
- リアクティブな値を明示的に返す

**期待結果：** 入力を処理しリアクティブな出力を返すサーバー関数。

**失敗時：** リアクティブな値が更新されない場合は、ダイナミックUIからの入力が（外側の`ns`ではなく）`session$ns`を使っているか確認してください。モジュールがNULLを返す場合は、`return()`が`moduleServer()`の内側の最後の式であることを確認してください。

### ステップ4: 親アプリへのモジュールの接続

```r
# app_ui.RまたはuiにてM
ui <- page_sidebar(
  title = "Analysis App",
  sidebar = sidebar(
    dataFilterUI("filter1")
  ),
  card(
    DT::dataTableOutput("table")
  )
)

# app_server.RまたはserverにてMJ
server <- function(input, output, session) {
  # 生データソース
  raw_data <- reactive({ mtcars })

  # モジュールを呼び出す — 戻り値をキャプチャ
  filtered_data <- dataFilterServer(
    "filter1",
    data = raw_data,
    columns = c("cyl", "mpg", "hp", "wt")
  )

  # モジュールが返したリアクティブを使用
  output$table <- DT::renderDataTable({
    filtered_data()
  })
}
```

**期待結果：** モジュールがUIに表示され、返されたリアクティブが下流の出力に流れます。

**失敗時：** モジュールUIがレンダリングされない場合は、UI呼び出しとサーバー呼び出しで`id`文字列が一致しているか確認してください。返されたリアクティブがNULLの場合は、サーバー関数が実際に値を返しているか確認してください。

### ステップ5: ネストしたモジュールの構成（オプション）

他のモジュールを含むモジュールの場合：

```r
analysisUI <- function(id) {
  ns <- NS(id)
  tagList(
    dataFilterUI(ns("filter")),
    plotOutput(ns("plot"))
  )
}

analysisServer <- function(id, data) {
  moduleServer(id, function(input, output, session) {
    # 名前空間化されたIDで内部モジュールを呼び出す
    filtered <- dataFilterServer("filter", data = data, columns = names(data()))

    output$plot <- renderPlot({
      req(filtered())
      plot(filtered())
    })

    return(filtered)
  })
}
```

主要なルール：UIでは`ns("inner_id")`でネストする。サーバーでは`"inner_id"`だけで呼び出す — `moduleServer`が名前空間のチェーンを処理します。

**期待結果：** 内部モジュールが外部モジュールの名前空間内で正しくレンダリングされます。

**失敗時：** 内部モジュールのUIが表示されない場合は、外部UI関数で内部モジュールのIDの周りに`ns()`を忘れている可能性があります。サーバーの通信が壊れている場合は、内部モジュールのIDが一致しているか確認してください（サーバー呼び出しに`ns()`はない）。

### ステップ6: モジュールを分離してテスト

```r
# モジュールのクイックテストアプリ
if (interactive()) {
  shiny::shinyApp(
    ui = fluidPage(
      dataFilterUI("test"),
      DT::dataTableOutput("result")
    ),
    server = function(input, output, session) {
      data <- reactive(iris)
      filtered <- dataFilterServer("test", data, names(iris))
      output$result <- DT::renderDataTable(filtered())
    }
  )
}
```

**期待結果：** モジュールが最小限のテストアプリで正しく動作します。

**失敗時：** モジュールが分離されたときに失敗するが、完全なアプリでは動作する場合（またはその逆）、グローバル変数や親セッションの状態への暗黙的な依存関係を確認してください。

## バリデーション

- [ ] モジュールUI関数が最初の引数として`id`を受け取り`NS(id)`を使用する
- [ ] UIのすべてのinput/output IDが`ns()`でラップされている
- [ ] モジュールサーバーが`moduleServer(id, function(input, output, session) { ... })`を使用する
- [ ] サーバー内のダイナミックUIがIDに`session$ns`を使用する
- [ ] モジュールをID衝突なしに複数回インスタンス化できる
- [ ] リアクティブな戻り値が親アプリからアクセス可能
- [ ] モジュールが最小限のスタンドアロンテストアプリで動作する

## よくある落とし穴

- **`renderUI()`内で`ns()`を忘れる**: サーバー内で作成するダイナミックUIは`session$ns`を使用する必要があります — 外側の`ns`は`moduleServer()`内では使用できません。
- **非リアクティブなデータを渡す**: 時間とともに変化するモジュール引数はリアクティブ式でなければなりません。`data`ではなく`reactive(data)`を渡してください。
- **IDの不一致**: UI呼び出しの`id`文字列はサーバー呼び出しの`id`と完全に一致する必要があります。
- **リアクティブを返さない**: モジュールが親に必要なものを計算する場合は、リアクティブを`return()`する必要があります。これを忘れるとサイレントなバグになります。
- **ネストしたモジュールの名前空間**: UIでは：`ns("inner_id")`。サーバーでは：ただの`"inner_id"`。これらを混同すると名前空間の二重ラッピングやプレフィックスの欠落が起きます。

## 関連スキル

- `scaffold-shiny-app` — モジュールを追加する前のアプリ構造のセットアップ
- `test-shiny-app` — testServer()ユニットテストによるモジュールのテスト
- `design-shiny-ui` — モジュールUIのbslibレイアウトとテーマ
- `optimize-shiny-performance` — モジュール内のキャッシュと非同期パターン
