---
name: design-shiny-ui
description: >
  テーマ設定にbslib、レスポンシブグリッドにlayout_columns、バリューボックス、
  カード、カスタムCSS/SCSSを使ってShinyアプリケーションUIを設計します。
  ページレイアウト、アクセシビリティ、ブランドの一貫性を扱います。新しいShinyアプリ
  UIをゼロから構築するとき、既存のアプリをfluidPageからbslibにモダナイズするとき、
  ブランドのテーマを適用するとき、Shinyアプリを様々な画面サイズでレスポンシブにするとき、
  またはShinyアプリのアクセシビリティを改善するときに使用します。
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
  tags: shiny, bslib, ui, theming, layout, css, accessibility, responsive
---

# Shiny UIの設計

bslibのテーマ設定、モダンなレイアウトプリミティブ、カスタムCSSを使ってレスポンシブでアクセシブルなShinyアプリケーションインターフェースを設計します。

## 使用タイミング

- 新しいShinyアプリUIをゼロから構築するとき
- 既存のShinyアプリをfluidPageからbslibにモダナイズするとき
- Shinyアプリにブランドのテーマ（色、フォント）を適用するとき
- Shinyアプリを様々な画面サイズでレスポンシブにするとき
- Shinyアプリケーションのアクセシビリティを改善するとき

## 入力

- **必須**: アプリケーションの目的とターゲットオーディエンス
- **必須**: レイアウトタイプ（sidebar、navbar、fillable、dashboard）
- **オプション**: ブランドの色とフォント
- **オプション**: カスタムCSS/SCSSを使用するか（デフォルト：bslibのみ）
- **オプション**: アクセシビリティ要件（WCAGレベル）

## 手順

### ステップ1: ページレイアウトの選択

bslibはいくつかのページコンストラクターを提供します：

```r
# サイドバーレイアウト — データアプリに最も一般的
ui <- page_sidebar(
  title = "My App",
  sidebar = sidebar("Controls here"),
  "Main content here"
)

# Navbarレイアウト — 複数ページアプリに
ui <- page_navbar(
  title = "My App",
  nav_panel("Tab 1", "Content 1"),
  nav_panel("Tab 2", "Content 2"),
  nav_spacer(),
  nav_item(actionButton("help", "Help"))
)

# Fillableレイアウト — コンテンツが利用可能なスペースを埋める
ui <- page_fillable(
  card(
    full_screen = TRUE,
    plotOutput("plot")
  )
)

# ダッシュボードレイアウト — バリューボックスとカードのグリッド
ui <- page_sidebar(
  title = "Dashboard",
  sidebar = sidebar(open = "closed", "Filters"),
  layout_columns(
    fill = FALSE,
    value_box("Revenue", "$1.2M", theme = "primary"),
    value_box("Users", "4,521", theme = "success"),
    value_box("Uptime", "99.9%", theme = "info")
  ),
  layout_columns(
    card(plotOutput("chart1")),
    card(plotOutput("chart2"))
  )
)
```

**期待結果：** ページレイアウトがアプリケーションのナビゲーションとコンテンツのニーズと一致します。

**失敗時：** レイアウトが正しく見えない場合は、`fluidPage()`/`navbarPage()`（ベースshiny）ではなく`page_sidebar()`/`page_navbar()`（bslib）を使用しているか確認してください。bslibバージョンはデフォルトとテーマサポートが優れています。

### ステップ2: bslibテーマの設定

```r
my_theme <- bslib::bs_theme(
  version = 5,                      # Bootstrap 5
  bootswatch = "flatly",            # オプションのプリセットテーマ
  bg = "#ffffff",                   # 背景色
  fg = "#2c3e50",                   # 前景（テキスト）色
  primary = "#2c3e50",              # プライマリブランドカラー
  secondary = "#95a5a6",            # セカンダリカラー
  success = "#18bc9c",
  info = "#3498db",
  warning = "#f39c12",
  danger = "#e74c3c",
  base_font = bslib::font_google("Source Sans Pro"),
  heading_font = bslib::font_google("Source Sans Pro", wght = 600),
  code_font = bslib::font_google("Fira Code"),
  "navbar-bg" = "#2c3e50"
)

ui <- page_sidebar(
  theme = my_theme,
  title = "Themed App",
  # ...
)
```

開発中はインタラクティブなテーマエディタを使用します：

```r
bslib::bs_theme_preview(my_theme)
```

**期待結果：** アプリが一貫したブランドの色、フォント、Bootstrap 5コンポーネントでレンダリングされます。

**失敗時：** フォントが読み込まれない場合は、インターネットアクセスを確認してください（Google Fontsには必要）またはシステムフォントに切り替えてください：`font_collection("system-ui", "-apple-system", "Segoe UI")`。テーマ変数が適用されない場合は、`theme`をページ関数に渡しているか確認してください。

### ステップ3: カードとカラムを使ったレイアウトの構築

```r
ui <- page_sidebar(
  theme = my_theme,
  title = "Analysis Dashboard",
  sidebar = sidebar(
    width = 300,
    title = "Filters",
    selectInput("dataset", "Dataset", choices = c("iris", "mtcars")),
    sliderInput("sample", "Sample %", 10, 100, 100, step = 10),
    hr(),
    actionButton("refresh", "Refresh", class = "btn-primary w-100")
  ),

  # KPI行 — 非フィリング
  layout_columns(
    fill = FALSE,
    col_widths = c(4, 4, 4),
    value_box(
      title = "Observations",
      value = textOutput("n_obs"),
      showcase = bsicons::bs_icon("table"),
      theme = "primary"
    ),
    value_box(
      title = "Variables",
      value = textOutput("n_vars"),
      showcase = bsicons::bs_icon("columns-gap"),
      theme = "info"
    ),
    value_box(
      title = "Missing",
      value = textOutput("n_missing"),
      showcase = bsicons::bs_icon("exclamation-triangle"),
      theme = "warning"
    )
  ),

  # メインコンテンツ行
  layout_columns(
    col_widths = c(8, 4),
    card(
      card_header("Distribution"),
      full_screen = TRUE,
      plotOutput("main_plot")
    ),
    card(
      card_header("Summary"),
      tableOutput("summary_table")
    )
  )
)
```

主要なレイアウトプリミティブ：
- `layout_columns()` — `col_widths`を持つレスポンシブグリッド
- `card()` — オプションのヘッダー/フッターを持つコンテンツコンテナ
- `value_box()` — アイコンとテーマを持つKPI表示
- `layout_sidebar()` — カード内のネストしたサイドバー
- `navset_card_tab()` — タブ付きカード

**期待結果：** 画面サイズに適応するレスポンシブグリッドレイアウト。

**失敗時：** 広い画面で列が予期せずスタックする場合は、`col_widths`の合計が12（Bootstrapグリッド）になるか確認してください。カードが重なる場合は、非フィリング行に`fill = FALSE`を設定してください。

### ステップ4: ダイナミックUI要素の追加

```r
server <- function(input, output, session) {
  output$dynamic_filters <- renderUI({
    data <- current_data()
    tagList(
      selectInput("col", "Column", choices = names(data)),
      if (is.numeric(data[[input$col]])) {
        sliderInput("range", "Range",
          min = min(data[[input$col]], na.rm = TRUE),
          max = max(data[[input$col]], na.rm = TRUE),
          value = range(data[[input$col]], na.rm = TRUE)
        )
      } else {
        selectInput("values", "Values",
          choices = unique(data[[input$col]]),
          multiple = TRUE
        )
      }
    )
  })

  # 条件付きパネル（サーバーラウンドトリップなし）
  # UI内：
  # conditionalPanel(
  #   condition = "input.show_advanced == true",
  #   numericInput("alpha", "Alpha", 0.05)
  # )
}
```

**期待結果：** UI要素がユーザーの選択とデータに基づいてダイナミックに更新されます。

**失敗時：** ダイナミックUIがちらつく場合は、可能であれば`renderUI()`の代わりに`conditionalPanel()`（CSSベース）を使用してください。再レンダリング時にダイナミックな入力が値を失う場合は、状態を復元するために`session$sendInputMessage()`を追加してください。

### ステップ5: カスタムCSS/SCSSの追加（オプション）

bslibのテーマ変数を超えたスタイルのために：

```r
# インラインCSS
ui <- page_sidebar(
  theme = my_theme,
  tags$head(tags$style(HTML("
    .sidebar { border-right: 2px solid var(--bs-primary); }
    .card-header { font-weight: 600; }
    .value-box .value { font-size: 2.5rem; }
  "))),
  # ...
)

# 外部CSSファイル（www/ディレクトリに配置）
ui <- page_sidebar(
  theme = my_theme,
  tags$head(tags$link(rel = "stylesheet", href = "custom.css")),
  # ...
)
```

bslibとのSCSS統合：

```r
my_theme <- bslib::bs_theme(version = 5) |>
  bslib::bs_add_rules(sass::sass_file("www/custom.scss"))
```

**期待結果：** bslibのテーマを壊さずにカスタムスタイルが適用されます。

**失敗時：** カスタムCSSがbslibと競合する場合は、ハードコードされた色の代わりにBootstrap CSS変数（`var(--bs-primary)`）を使用してください。これにより、テーマ変更がカスタムスタイルに伝播します。

### ステップ6: アクセシビリティの確保

```r
# 入力にARIAラベルを追加
selectInput("category", "Category",
  choices = c("A", "B", "C")
) |> tagAppendAttributes(`aria-describedby` = "category-help")

# プロットにaltテキストを追加
output$plot <- renderPlot({
  plot(data(), main = "Distribution of Values")
}, alt = "Histogram showing the distribution of selected values")

# テーマで十分な色のコントラストを確保
my_theme <- bslib::bs_theme(
  version = 5,
  bg = "#ffffff",      # 白い背景
  fg = "#212529"       # 暗いテキスト — 15.4:1のコントラスト比
)

# セマンティックHTMLを使用
tags$main(
  role = "main",
  tags$h1("Dashboard"),
  tags$section(
    `aria-label` = "Key Performance Indicators",
    layout_columns(
      # バリューボックス...
    )
  )
)
```

**期待結果：** アプリが色のコントラスト、キーボードナビゲーション、スクリーンリーダーの互換性についてWCAG 2.1 AA基準を満たします。

**失敗時：** ブラウザのデベロッパーツールのアクセシビリティ監査（Lighthouse）でテストしてください。WebAIMのコントラストチェッカーで色のコントラスト比を確認してください。すべてのインタラクティブ要素がキーボードでフォーカスできることを確認してください。

## バリデーション

- [ ] ページレイアウトがデスクトップとモバイルの幅で正しくレンダリングされる
- [ ] bslibのテーマがすべてのコンポーネントに一貫して適用される
- [ ] バリューボックスが正しいテーマとアイコンで表示される
- [ ] カードがレスポンシブグリッドで適切にリサイズされる
- [ ] カスタムCSSがハードコードされた値ではなくBootstrap変数を使用する
- [ ] すべてのプロットがスクリーンリーダー用のaltテキストを持つ
- [ ] 色のコントラストがWCAG AA（テキストに対して4.5:1）を満たす
- [ ] インタラクティブ要素がキーボードでアクセス可能

## よくある落とし穴

- **古いShiny UIと新しいShiny UIの混在**: `fluidPage()`とbslibコンポーネントを混在させないでください。`page_sidebar()`、`page_navbar()`、または`page_fillable()`だけを使用してください。
- **CSSでのハードコードされた色**: `#2c3e50`の代わりに`var(--bs-primary)`を使用してください。テーマが変更されるとハードコードされた色は壊れます。
- **非フィリング行に`fill = FALSE`がない**: バリューボックス行とサマリー行は通常、利用可能なスペースを埋めるべきではありません。`fill = FALSE`を設定してください。
- **オフライン環境でのGoogle Fonts**: アプリがエアギャップネットワークにデプロイされる場合は、`font_google()`の代わりにシステムフォントまたはセルフホストのフォントファイルを使用してください。
- **モバイルの無視**: ブラウザのレスポンシブモードでテストしてください。`layout_columns`は狭い画面で自動的にスタックしますが、カスタムCSSはそうでない場合があります。

## 関連スキル

- `scaffold-shiny-app` — テーマ設定を含む初期アプリセットアップ
- `build-shiny-module` — モジュラーUIコンポーネントの作成
- `optimize-shiny-performance` — パフォーマンスを意識したレンダリング
- `review-web-design` — レイアウト、タイポグラフィ、色のビジュアルデザインレビュー
- `review-ux-ui` — ユーザビリティとアクセシビリティのレビュー
