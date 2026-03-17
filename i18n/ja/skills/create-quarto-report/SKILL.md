---
name: create-quarto-report
description: >
  再現可能なレポート、プレゼンテーション、ウェブサイト用のQuartoドキュメントを作成する。
  YAML設定、コードチャンクオプション、出力形式、相互参照、レンダリングをカバー。
  再現可能な分析レポートの作成、コード埋め込みプレゼンテーションの構築、
  コードからHTML・PDF・Word文書の生成、既存のR MarkdownドキュメントのQuartoへの
  移行に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: reporting
  complexity: basic
  language: R
  tags: quarto, report, reproducible, rmarkdown, publishing
  locale: ja
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# Quartoレポートの作成

分析レポート、プレゼンテーション、ウェブサイト用の再現可能なQuartoドキュメントをセットアップして作成する。

## 使用タイミング

- 再現可能な分析レポートを作成する場合
- コード埋め込みのプレゼンテーションを構築する場合
- コードからHTML、PDF、Word文書を生成する場合
- R MarkdownからQuartoへ移行する場合

## 入力

- **必須**: レポートのトピックと対象読者
- **必須**: 出力形式（html, pdf, docx, revealjs）
- **任意**: データソースと分析コード
- **任意**: 引用文献ファイル（.bibファイル）

## 手順

### ステップ1: Quartoドキュメントの作成

`report.qmd`を作成する:

```yaml
---
title: "Analysis Report"
author: "Author Name"
date: today
format:
  html:
    toc: true
    toc-depth: 3
    code-fold: true
    theme: cosmo
    self-contained: true
execute:
  echo: true
  warning: false
  message: false
bibliography: references.bib
---
```

**期待結果：** ファイル`report.qmd`が、タイトル、著者、日付、フォーマット設定、実行オプションを含む有効なYAMLフロントマターとともに存在する。

**失敗時：** `---`デリミタの一致とインデントが正しいことを確認してYAMLヘッダーを検証する。`format:`キーがサポートされているQuarto出力形式（`html`、`pdf`、`docx`、`revealjs`）のいずれかと一致することを確認する。

### ステップ2: コードチャンク付きコンテンツの記述

````markdown
## Introduction

This report analyzes the relationship between variables X and Y.

## Data

```{r}
#| label: load-data
library(dplyr)
library(ggplot2)

data <- read.csv("data.csv")
glimpse(data)
```

## Analysis

```{r}
#| label: fig-scatter
#| fig-cap: "Scatter plot of X vs Y"
#| fig-width: 8
#| fig-height: 6

ggplot(data, aes(x = x_var, y = y_var)) +
  geom_point(alpha = 0.6) +
  geom_smooth(method = "lm") +
  theme_minimal()
```

As shown in @fig-scatter, there is a positive relationship.

## Results

```{r}
#| label: tbl-summary
#| tbl-cap: "Summary statistics"

data |>
  summarise(
    mean_x = mean(x_var),
    sd_x = sd(x_var),
    mean_y = mean(y_var),
    sd_y = sd(y_var)
  ) |>
  knitr::kable(digits = 2)
```

See @tbl-summary for descriptive statistics.
````

**期待結果：** コンテンツセクションに、`{r}`言語識別子と`#|`チャンクオプション（ラベル、キャプション、サイズ用）を持つ適切にフォーマットされたコードチャンクが含まれている。

**失敗時：** コードチャンクが```` ```{r} ````構文（インラインバックティックではない）を使用していること、`#|`オプションがチャンク内部にあること（YAMLヘッダーではない）、ラベルプレフィックスが相互参照タイプと一致すること（図には`fig-`、表には`tbl-`）を確認する。

### ステップ3: チャンクオプションの設定

一般的なチャンクレベルオプション（`#|`構文を使用）:

```
#| label: chunk-name        # 相互参照に必須
#| echo: false               # コードを非表示
#| eval: false               # 表示するが実行しない
#| output: false             # 実行するが出力を非表示
#| fig-width: 8              # 図のサイズ
#| fig-height: 6
#| fig-cap: "Caption text"   # @fig-name参照を有効にする
#| tbl-cap: "Caption text"   # @tbl-name参照を有効にする
#| cache: true               # 高負荷計算をキャッシュ
```

**期待結果：** チャンクオプションが`#|`構文でチャンクレベルに適用され、ラベルが相互参照に必要な命名規則に従っている。

**失敗時：** チャンクオプションがレガシーの`{r, option=value}` R Markdown構文ではなく、`#|`構文（Quartoネイティブ）を使用していることを確認する。ラベル名には英数字とハイフンのみが含まれることを確認する。

### ステップ4: 相互参照と引用の追加

```markdown
See @fig-scatter for the visualization and @tbl-summary for statistics.

This approach follows @smith2023 methodology.

::: {#fig-combined layout-ncol=2}
![Plot A](plot_a.png){#fig-plotA}
![Plot B](plot_b.png){#fig-plotB}

Combined figure caption
:::
```

**期待結果：** 相互参照（`@fig-name`、`@tbl-name`）が正しい図と表に解決され、引用（`@key`）が`.bib`ファイルのエントリと一致する。

**失敗時：** 参照されたラベルが正しいプレフィックス（`fig-`、`tbl-`）を持つコードチャンクに存在することを確認する。引用については、`.bib`のキーが完全に一致すること（大文字小文字を区別）と、YAMLヘッダーに`bibliography:`が設定されていることを確認する。

### ステップ5: ドキュメントのレンダリング

```bash
quarto render report.qmd

# 特定の形式
quarto render report.qmd --to pdf
quarto render report.qmd --to docx

# ライブリロード付きプレビュー
quarto preview report.qmd
```

**期待結果：** 指定した形式で出力ファイルが生成される。

**失敗時：**
- quartoが見つからない場合: https://quarto.org/docs/get-started/ からインストール
- PDFエラー: `quarto install tinytex`でTinyTeXをインストール
- Rパッケージエラー: すべてのパッケージがインストールされていることを確認

### ステップ6: 複数形式の出力

```yaml
format:
  html:
    toc: true
    theme: cosmo
  pdf:
    documentclass: article
    geometry: margin=1in
  docx:
    reference-doc: template.docx
```

すべての形式をレンダリング: `quarto render report.qmd`

**期待結果：** 指定したすべての出力形式が正常に生成され、それぞれがターゲット形式に適切なスタイリングとレイアウトを持つ。

**失敗時：** 一つの形式が失敗し他が成功する場合、形式固有の要件を確認する: PDFにはLaTeXエンジンが必要（`quarto install tinytex`でインストール）、DOCXには有効な参照テンプレートが必要（指定されている場合）、形式固有のYAMLオプションは各形式キーの下に正しくネストされている必要がある。

## バリデーション

- [ ] ドキュメントがエラーなしでレンダリングされる
- [ ] すべてのコードチャンクが正しく実行される
- [ ] 相互参照が解決される（図、表、引用）
- [ ] 目次が正確である
- [ ] 出力形式が対象読者に適切である

## よくある落とし穴

- **ラベルプレフィックスの欠落**: 相互参照可能な図にはラベルに`fig-`プレフィックスが必要、表には`tbl-`が必要
- **キャッシュの無効化**: キャッシュされたチャンクは上流データが変更されても再実行されない。`_cache/`を削除して強制実行
- **LaTeXなしのPDF**: TinyTeXをインストールするか、CSSベースのPDFには`format: pdf`と`pdf-engine: weasyprint`を使用
- **QuartoでのR Markdown構文**: `{r, echo=FALSE}`スタイルではなく`#|`チャンクオプションを使用

## 関連スキル

- `format-apa-report` - APA形式の学術レポート
- `build-parameterized-report` - パラメータ化された複数レポート生成
- `generate-statistical-tables` - 出版品質の表
- `write-vignette` - Rパッケージ内のQuartoビニエット
