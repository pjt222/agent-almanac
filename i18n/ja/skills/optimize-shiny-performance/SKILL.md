---
name: optimize-shiny-performance
description: >
  profvis、bindCache、memoise、async/promises、debounce/throttle、および
  長時間実行される計算向けのExtendedTaskを使ってShinyアプリケーションのパフォーマンスを
  プロファイルして最適化します。ユーザーインタラクション中にアプリが遅くまたは
  応答しないと感じるとき、同時負荷でサーバーリソースが枯渇するとき、特定の操作が
  ボトルネックを生じさせるとき、または多くの同時ユーザーを持つ本番デプロイメント用に
  アプリを準備するときに使用します。
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
  complexity: advanced
  language: R
  tags: shiny, performance, profiling, caching, async, promises, optimization
---

# Shinyパフォーマンスの最適化

キャッシング、非同期操作、リアクティブグラフの最適化を通じてShinyアプリケーションのパフォーマンスをプロファイルし、診断し、最適化します。

## 使用タイミング

- Shinyアプリがユーザーインタラクション中に遅くまたは応答しないと感じるとき
- 同時ユーザー負荷でサーバーリソースが枯渇するとき
- 特定の操作（データ読み込み、プロット作成、計算）がボトルネックを生じさせるとき
- 多くのユーザーを持つ本番デプロイメント用にアプリを準備するとき

## 入力

- **必須**: Shinyアプリケーションへのパス
- **必須**: パフォーマンス問題の説明（読み込みが遅い、インタラクションが遅延する、メモリが高い）
- **オプション**: 予想される同時ユーザー数
- **オプション**: 利用可能なサーバーリソース（RAM、CPUコア）
- **オプション**: アプリがデータベースまたは外部APIを使用するか

## 手順

### ステップ1: アプリケーションのプロファイリング

```r
# profvisでプロファイル
profvis::profvis({
  shiny::runApp("path/to/app", display.mode = "normal")
})

# または特定の操作をプロファイル
profvis::profvis({
  result <- expensive_computation(data)
})
```

主要なボトルネックを特定します：
1. **データ読み込み**: 初期データフェッチにどれくらいかかるか？
2. **リアクティブの再計算**: どのリアクティブが最も頻繁に発火するか？
3. **レンダリング**: どの出力のレンダリングに最も時間がかかるか？
4. **外部呼び出し**: データベースクエリ、APIリクエスト、ファイルI/O？

リアクティブグラフ分析にリアクティブログを使用します：

```r
# リアクティブログを有効化
options(shiny.reactlog = TRUE)
shiny::runApp("path/to/app")
# ブラウザでCtrl+F3を押してリアクティブグラフを表示
```

**期待結果：** 2〜3の最大のボトルネックが明確に特定されます。

**失敗時：** profvisが有用な詳細を表示しない場合は、特定のセクションを`profvis::profvis()`でラップしてください。reactlogが圧倒的な場合は、一度に1つのインタラクションに集中してください。

### ステップ2: リアクティブグラフの最適化

不要なリアクティブの無効化を減らします：

```r
# 悪い例: 任意の入力変更で再計算される
output$plot <- renderPlot({
  data <- load_data()  # 毎回実行される
  filtered <- data[data$category == input$category, ]
  plot(filtered)
})

# 良い例: データ読み込みをフィルタリングから分離する
raw_data <- reactive({
  load_data()
}) |> bindCache()  # 高価な部分をキャッシュ

filtered_data <- reactive({
  raw_data()[raw_data()$category == input$category, ]
})

output$plot <- renderPlot({
  plot(filtered_data())
})
```

不要な無効化を防ぐために`isolate()`を使用します：

```r
# すべての入力変更ではなく、ボタンがクリックされたときのみ再計算
output$result <- renderText({
  input$compute  # ボタンへの依存関係を取得
  isolate({
    paste("N =", input$n, "Mean =", mean(rnorm(input$n)))
  })
})
```

高頻度の入力には`debounce()`と`throttle()`を使用します：

```r
# テキスト入力をデバウンス — ユーザーが入力を止めてから500ms待つ
search_text <- reactive(input$search) |> debounce(500)

# スライダーをスロットル — 最大250msごとに更新
slider_value <- reactive(input$slider) |> throttle(250)
```

**期待結果：** リアクティブグラフが必要な再計算のみを発火します。

**失敗時：** 依存関係を削除すると機能が壊れる場合は、暗黙的なリアクティブ依存関係に頼る代わりに`req()`を使って明示的なガードを追加してください。

### ステップ3: キャッシングの実装

#### Shiny出力用のbindCache

```r
output$plot <- renderPlot({
  create_expensive_plot(filtered_data())
}) |> bindCache(input$category, input$date_range)

output$table <- renderDT({
  expensive_query(input$filters)
}) |> bindCache(input$filters)
```

`bindCache`は入力値をキャッシュキーとして使用します。同じ入力が再び発生すると、キャッシュされた結果がすぐに返されます。

#### 関数用のmemoise

```r
# 高価な関数結果をキャッシュ
load_reference_data <- memoise::memoise(
  function(dataset_name) {
    readr::read_csv(paste0("data/", dataset_name, ".csv"))
  },
  cache = cachem::cache_disk("cache/", max_age = 3600)
)
```

#### アプリレベルのデータ事前計算

```r
# global.Rまたはサーバー関数の外 — アプリ起動時に一度だけ計算される
reference_data <- readr::read_csv("data/reference.csv")
model <- readRDS("models/trained_model.rds")

server <- function(input, output, session) {
  # reference_dataとmodelはすべてのセッションで利用可能
  # 再読み込みなし
}
```

**期待結果：** 繰り返しの操作がキャッシュされた結果を使用し、応答時間が大幅に短縮されます。

**失敗時：** キャッシュが大きくなりすぎる場合は`max_age`または`max_size`の制限を設定してください。キャッシュされた値が古い場合は`max_age`を減らすかキャッシュクリアボタンを追加してください。`bindCache`がエラーを引き起こす場合は、キャッシュキーの入力がシリアライズ可能であることを確認してください。

### ステップ4: 長時間操作への非同期処理の追加

長時間実行される計算には`ExtendedTask`（Shiny >= 1.8.1）を使用します：

```r
server <- function(input, output, session) {
  # 拡張タスクを定義
  analysis_task <- ExtendedTask$new(function(data, params) {
    promises::future_promise({
      # これはバックグラウンドプロセスで実行される
      run_heavy_analysis(data, params)
    })
  }) |> bind_task_button("run_analysis")

  # タスクをトリガー
  observeEvent(input$run_analysis, {
    analysis_task$invoke(dataset(), input$params)
  })

  # 結果を使用
  output$result <- renderTable({
    analysis_task$result()
  })
}
```

Shiny < 1.8.1のアプリにはpromisesを直接使用します：

```r
library(promises)
library(future)
plan(multisession, workers = 4)

server <- function(input, output, session) {
  result <- eventReactive(input$compute, {
    future_promise({
      Sys.sleep(5)  # 長時間計算をシミュレート
      expensive_analysis(isolate(input$params))
    })
  })

  output$table <- renderTable({
    result()
  })
}
```

**期待結果：** 長時間操作がUIをブロックしない。計算実行中に他のユーザーがインタラクションできます。

**失敗時：** `future_promise`がエラーになる場合は`plan(multisession)`が設定されているか確認してください。futureで変数が利用できない場合は明示的に渡してください — futureは別のRプロセスで実行されます。

### ステップ5: レンダリングの最適化

レンダリングのオーバーヘッドを削減します：

```r
# 再レンダリングの代わりにplotlyをインタラクティブプロットに使用
output$plot <- plotly::renderPlotly({
  plotly::plot_ly(filtered_data(), x = ~x, y = ~y, type = "scatter")
})

# 大きなテーブルにはサーバーサイドDTを使用
output$table <- DT::renderDataTable({
  DT::datatable(large_data(), server = TRUE, options = list(
    pageLength = 25,
    processing = TRUE
  ))
})

# 非表示要素のレンダリングを避けるための条件付きUI
output$details <- renderUI({
  req(input$show_details)
  expensive_details_ui()
})
```

**期待結果：** レンダリング操作が高速化され、UIをブロックしません。

**失敗時：** plotlyが大きなデータセットで遅い場合は、WebGLレンダリングに`toWebGL()`を使用するか、プロット前にデータをダウンサンプリングしてください。

### ステップ6: パフォーマンス改善の検証

```r
# ビフォー/アフターのベンチマーク
system.time({
  shiny::testServer(myModuleServer, args = list(...), {
    session$setInputs(category = "A")
    session$flushReact()
  })
})

# shinyloadtestによる負荷テスト
shinyloadtest::record_session("http://localhost:3838")
shinyloadtest::shinycannon(
  "recording.log",
  "http://localhost:3838",
  workers = 10,
  loaded_duration_minutes = 5
)
shinyloadtest::shinyloadtest_report("recording.log")
```

**期待結果：** 応答時間および/または同時ユーザー容量の測定可能な改善。

**失敗時：** パフォーマンスが改善されなかった場合は、次のボトルネックを見つけるために再プロファイルしてください。パフォーマンス最適化は反復的です — まず最大のボトルネックを修正し、次に再測定してください。

## バリデーション

- [ ] プロファイリングが特定のボトルネックを特定する（推測ではない）
- [ ] リアクティブグラフに不要な無効化チェーンがない
- [ ] 高価な操作がキャッシングを使用する（bindCacheまたはmemoise）
- [ ] 長時間実行される計算が非同期処理を使用する（ExtendedTaskまたはpromises）
- [ ] 高頻度の入力がdebounce/throttleを使用する
- [ ] 大きなデータセットがサーバーサイド処理を使用する
- [ ] パフォーマンス改善が測定可能（ビフォー/アフターのタイミング）

## よくある落とし穴

- **早期最適化**: 最初にプロファイルしてください。ボトルネックはあなたが思っている場所にはほとんどありません。
- **キャッシュ無効化のバグ**: ユーザーが古いデータを見る場合は、キャッシュキーに関連するすべての入力が含まれていません。`bindCache()`に欠けている依存関係を追加してください。
- **futureの変数スコーピング**: `future_promise`は別のプロセスで実行されます。グローバル変数、データベース接続、リアクティブな値は明示的にキャプチャする必要があります。
- **リアクティブスパゲッティ**: リアクティブグラフが複雑すぎて理解できない場合、アプリにはキャッシングではなくアーキテクチャのリファクタリング（モジュール）が必要です。
- **過剰なキャッシング**: すべてをキャッシュするとメモリを無駄にします。高価でかつ繰り返しの入力パターンを持つ操作のみキャッシュしてください。

## 関連スキル

- `build-shiny-module` — 保守可能なリアクティブコードのためのモジュラーアーキテクチャ
- `scaffold-shiny-app` — 最初から適切なアプリフレームワークを選択する
- `deploy-shiny-app` — 適切なサーバーリソースで最適化されたアプリをデプロイする
- `test-shiny-app` — パフォーマンスリグレッションテスト
