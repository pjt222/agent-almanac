---
name: write-vignette
description: >
  R MarkdownまたはQuartoを使用してRパッケージのビネットを作成する。
  ビネットのセットアップ、YAML設定、コードチャンクオプション、ビルドとテスト、
  ビネットのCRAN要件を網羅。「はじめに」チュートリアルの追加、複数の関数にまたがる
  複雑なワークフローの文書化、ドメイン固有のガイド作成、またはCRAN投稿で
  関数ヘルプページを超えたユーザー向けドキュメントが必要な時に使用する。
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
  tags: r, vignette, rmarkdown, documentation, tutorial
---

# ビネットの記述

Rパッケージの長文ドキュメントビネットを作成する。

## 使用タイミング

- パッケージの「はじめに」チュートリアルを追加する時
- 複数の関数にまたがる複雑なワークフローを文書化する時
- ドメイン固有のガイドを作成する時（例：統計手法）
- CRAN投稿で関数ヘルプを超えたユーザー向けドキュメントが必要な時

## 入力

- **必須**: ドキュメント化する関数を持つRパッケージ
- **必須**: ビネットのタイトルとトピック
- **任意**: 形式（R MarkdownまたはQuarto、デフォルト：R Markdown）
- **任意**: ビネットが外部データやAPIを必要とするかどうか

## 手順

### ステップ1: ビネットファイルの作成

```r
usethis::use_vignette("getting-started", title = "Getting Started with packagename")
```

**期待結果：** YAMLフロントマターを持つ`vignettes/getting-started.Rmd`が作成される。DESCRIPTIONのSuggestsフィールドに`knitr`と`rmarkdown`が追加される。`vignettes/`ディレクトリが存在する。

**失敗時：** `usethis::use_vignette()`が失敗する場合、作業ディレクトリがパッケージルート（`DESCRIPTION`が含まれる）であることを確認する。`knitr`がインストールされていない場合は`install.packages("knitr")`を実行する。手動で作成する場合は`vignettes/`ディレクトリとファイルを作成し、YAMLフロントマターに3つの`%\Vignette*`エントリすべてが含まれていることを確認する。

### ステップ2: ビネットコンテンツの記述

```markdown
---
title: "Getting Started with packagename"
output: rmarkdown::html_vignette
vignette: >
  %\VignetteIndexEntry{Getting Started with packagename}
  %\VignetteEngine{knitr::rmarkdown}
  %\VignetteEncoding{UTF-8}
---

## Introduction

Brief overview of what the package does and who it's for.

## Installation

```r
install.packages("packagename")
library(packagename)
```

## Basic Usage

Walk through the primary workflow:

```r
# Load example data
data <- example_data()

# Process
result <- main_function(data, option = "default")

# Inspect
summary(result)
```

## Advanced Features

Cover optional or advanced functionality.

## Conclusion

Summarize and point to other vignettes or resources.
```

**期待結果：** ビネットのRmdファイルに「はじめに」、インストール、基本的な使い方、高度な機能、まとめのセクションが含まれる。コード例がパッケージのエクスポートされた関数を使用して表示可能な出力を生成する。

**失敗時：** 例が実行に失敗する場合、`devtools::install()`でパッケージがインストールされているか確認する。例が（`devtools::load_all()`ではなく）`library()`呼び出しでパッケージ名を使用していることを確認する。外部リソースを必要とする関数には、実行せずにコードを表示するために`eval=FALSE`を使用する。

### ステップ3: コードチャンクの設定

異なる目的でチャンクオプションを使用する：

```r
# 標準的な評価チャンク
{r example-basic}
result <- compute_something(1:10)
result

# コードを表示するが実行しない（例示目的）
{r api-example, eval=FALSE}
connect_to_api(key = "your_key_here")

# コードを非表示にして実行する（出力のみ表示）
{r hidden-setup, echo=FALSE}
library(packagename)

# グローバルオプションを設定
{r setup, include=FALSE}
knitr::opts_chunk$set(
  collapse = TRUE,
  comment = "#>",
  fig.width = 7,
  fig.height = 5
)
```

**期待結果：** `include=FALSE`を持つsetupチャンクがグローバルオプション（`collapse`、`comment`、`fig.width`、`fig.height`）を設定する。チャンクが適切に設定される：例示コードには`eval=FALSE`、隠しセットアップには`echo=FALSE`、インタラクティブな例には標準チャンク。

**失敗時：** チャンクオプションが効果を発揮しない場合、構文が`{r chunk-name, option=value}`形式（カンマ区切り、論理値に引用符なし）を使用していることを確認する。setupチャンクがドキュメントの先頭に配置されていることを確認する。

### ステップ4: 外部依存関係の処理

ネットワークアクセスやオプションパッケージが必要なビネットの場合：

```r
{r check-available, include=FALSE}
has_suggested <- requireNamespace("optionalpkg", quietly = TRUE)

{r use-suggested, eval=has_suggested}
optionalpkg::special_function()
```

長時間実行される計算の場合、結果を事前計算して保存する：

```r
# vignettes/に事前計算済みの結果を保存
saveRDS(expensive_result, "vignettes/precomputed.rds")

# ビネット内で読み込む
{r load-precomputed}
result <- readRDS("precomputed.rds")
```

**期待結果：** 外部依存関係が適切に処理される：オプションパッケージは`requireNamespace()`で条件付き読み込み、ネットワーク依存コードは`eval=FALSE`または`tryCatch()`を使用、コストのかかる計算は事前計算済みの`.rds`ファイルを使用する。

**失敗時：** オプションパッケージが利用不可のためにCRANでビネットが失敗する場合、それらのセクションを条件変数で囲む（例：`eval=has_suggested`）。事前計算済みの結果は、`.rds`ファイルが`vignettes/`ディレクトリに含まれていて相対パスで参照されていることを確認する。

### ステップ5: ビネットのビルドとテスト

```r
# 単一のビネットをビルド
devtools::build_vignettes()

# ビルドとチェック（ビネットの問題を検出）
devtools::check()
```

**期待結果：** ビネットがエラーなくビルドされる。HTML出力が読みやすい。

**失敗時：**
- pandocの欠如：`.Renviron`で`RSTUDIO_PANDOC`を設定する
- パッケージが未インストール：先に`devtools::install()`を実行する
- Suggestsの欠如：DESCRIPTIONのSuggestsに記載されたパッケージをインストールする

### ステップ6: パッケージチェックでの確認

```r
devtools::check()
```

ビネット関連のチェック：正しくビルドされる、時間がかかりすぎない、エラーがない。

**期待結果：** `devtools::check()`がビネット関連のエラーや警告なしでパスする。ビネットがCRANの時間制限内（通常60秒以内）にビルドされる。

**失敗時：** ビネットがチェック失敗を引き起こす場合、一般的な修正には：DESCRIPTIONへのSuggestsパッケージの追加、低速なチャンクへの`eval=FALSE`の使用によるビルド時間の短縮、`VignetteIndexEntry`がタイトルと一致していることの確認が含まれる。ビネット固有のエラーを分離するために`devtools::build_vignettes()`を別途実行する。

## バリデーション

- [ ] `devtools::build_vignettes()`でビネットがエラーなくビルドされる
- [ ] すべてのコードチャンクが正しく実行される
- [ ] VignetteIndexEntryがタイトルと一致する
- [ ] `devtools::check()`がビネット警告なしでパスする
- [ ] ビネットがpkgdownサイトの記事に表示される（該当する場合）
- [ ] ビルド時間が妥当である（CRANでは60秒未満）

## よくある落とし穴

- **VignetteIndexEntryの不一致**: YAMLのインデックスエントリは`vignette(package = "pkg")`でユーザーに表示されるものと一致しなければならない
- **`vignette` YAMLブロックの欠如**: 3つの`%\Vignette*`行すべてが必要
- **CRANには遅すぎるビネット**: 結果を事前計算するか、コストのかかる処理に`eval=FALSE`を使用する
- **pandocが見つからない**: `RSTUDIO_PANDOC`環境変数が設定されていることを確認する
- **パッケージの自己参照**: ビネット内では`devtools::load_all()`ではなく`library(packagename)`を使用する

## 関連スキル

- `write-roxygen-docs` - ビネットチュートリアルを補完する関数レベルのドキュメント
- `build-pkgdown-site` - ビネットはpkgdownサイトの記事として表示される
- `submit-to-cran` - CRANにはビネットに固有の要件がある
- `create-quarto-report` - R Markdownビネットの代替としてのQuarto
