---
name: format-apa-report
description: >
  Quarto または R Markdown レポートを APA 第7版スタイルでフォーマットする。apaquarto/papaja
  パッケージ、タイトルページ、要約、引用、表、図、参考文献のフォーマットを網羅する。
  APA形式で学術論文を執筆する時、心理学や社会科学の研究報告を作成する時、
  分析が埋め込まれた再現可能な原稿を生成する時、または学位論文の章を準備する時に使用する。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: reporting
  complexity: intermediate
  language: R
  tags: apa, academic, psychology, quarto, papaja
  locale: ja
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# APAレポートのフォーマット

Quarto（apaquarto）または R Markdown（papaja）を使用して APA 第7版形式のレポートを作成する。

## 使用タイミング

- APA形式で学術論文を執筆する時
- 心理学や社会科学の研究報告を作成する時
- 分析が埋め込まれた再現可能な原稿を生成する時
- 学位論文の章を準備する時

## 入力

- **必須**: 分析コードと結果
- **必須**: 参考文献ファイル（.bib）
- **任意**: 共著者と所属
- **任意**: 原稿タイプ（雑誌論文、学生論文）

## 手順

### ステップ1: フレームワークの選択

**オプションA: apaquarto（Quarto、推奨）**

```r
install.packages("remotes")
remotes::install_github("wjschne/apaquarto")
```

**オプションB: papaja（R Markdown）**

```r
remotes::install_github("crsh/papaja")
```

**期待結果:** 選択したフレームワークパッケージが正常にインストールされ、`library(apaquarto)` または `library(papaja)` で読み込めること。

**失敗時:** システム依存関係の不足（例：PDF出力用のLaTeX）によりインストールが失敗する場合、まず `quarto install tinytex` で TinyTeX をインストールする。GitHubからのインストールが失敗する場合、`remotes` パッケージがインストールされていること、GitHubにアクセス可能であることを確認する。

### ステップ2: ドキュメントの作成（apaquarto）

`manuscript.qmd` を作成する:

```yaml
---
title: "Effects of Variable X on Outcome Y"
shorttitle: "Effects of X on Y"
author:
  - name: First Author
    corresponding: true
    orcid: 0000-0000-0000-0000
    email: author@university.edu
    affiliations:
      - name: University Name
        department: Department of Psychology
  - name: Second Author
    affiliations:
      - name: Other University
abstract: |
  This study examined the relationship between X and Y.
  Using a sample of N = 200 participants, we found...
  Results are discussed in terms of theoretical implications.
keywords: [keyword1, keyword2, keyword3]
bibliography: references.bib
format:
  apaquarto-docx: default
  apaquarto-pdf:
    documentmode: man
---
```

**期待結果:** `manuscript.qmd` ファイルが存在し、タイトル、短縮タイトル、著者所属、要約、キーワード、参考文献の参照、APA固有のフォーマットオプションを含む有効なYAMLフロントマターを持つこと。

**失敗時:** YAMLのインデントが一貫している（2スペース）こと、`author:` エントリが `name:`、`affiliations:`、`corresponding:` フィールドを含むリスト形式を使用していることを確認する。`bibliography:` が既存の `.bib` ファイルを指していることを確認する。

### ステップ3: APAコンテンツの執筆

````markdown
# Introduction

Previous research has established that... [@smith2023; @jones2022].
@smith2023 found significant effects of X on Y.

# Method

## Participants

We recruited `r nrow(data)` participants (*M*~age~ = `r mean(data$age)`,
*SD* = `r sd(data$age)`).

## Materials

The study used the Measurement Scale [@author2020].

## Procedure

Participants completed... (see @fig-design for the study design).

# Results

```{r}
#| label: fig-results
#| fig-cap: "Mean scores by condition with 95% confidence intervals."
#| fig-width: 6
#| fig-height: 4

ggplot(summary_data, aes(x = condition, y = mean, fill = condition)) +
  geom_col() +
  geom_errorbar(aes(ymin = ci_lower, ymax = ci_upper), width = 0.2) +
  theme_apa()
```

A two-way ANOVA revealed a significant main effect of condition,
*F*(`r anova_result$df1`, `r anova_result$df2`) = `r anova_result$F`,
*p* `r format_pvalue(anova_result$p)`, $\eta^2_p$ = `r anova_result$eta`.

# Discussion

The findings support the hypothesis that...

# References
````

**期待結果:** コンテンツがAPAのセクション構造（Introduction、Method、Results、Discussion、References）に従い、統計のためのインラインRコードと `@fig-` および `@tbl-` プレフィックスを使用した適切なクロスリファレンスを含むこと。

**失敗時:** インラインRコードがレンダリングされない場合、バッククォート-r構文が正しいか（`` `r expression` ``）確認する。クロスリファレンスがリテラルテキストとして表示される場合、参照先のチャンクラベルが正しいプレフィックスを使用し、チャンクに対応するキャプションオプションがあることを確認する。

### ステップ4: APA形式の表のフォーマット

```r
#| label: tbl-descriptives
#| tbl-cap: "Descriptive Statistics by Condition"

library(gt)

descriptive_table <- data |>
  group_by(condition) |>
  summarise(
    M = mean(score),
    SD = sd(score),
    n = n()
  )

gt(descriptive_table) |>
  fmt_number(columns = c(M, SD), decimals = 2) |>
  cols_label(
    condition = "Condition",
    M = "*M*",
    SD = "*SD*",
    n = "*n*"
  )
```

**期待結果:** 表がAPAフォーマットでレンダリングされること：統計記号のイタリック体の列ヘッダー、適切な小数点揃え、表の上部に記述的なキャプション。

**失敗時:** `gt` テーブルがAPAスタイルでレンダリングされない場合、`gt` パッケージがインストールされていること、`cols_label()` がマークダウンスタイルのイタリック（`*M*`、`*SD*`）を使用していることを確認する。papajaユーザーは `gt()` の代わりに `apa_table()` を使用する。

### ステップ5: 引用の管理

`references.bib` を作成する:

```bibtex
@article{smith2023,
  author = {Smith, John A. and Jones, Mary B.},
  title = {Effects of intervention on outcomes},
  journal = {Journal of Psychology},
  year = {2023},
  volume = {45},
  pages = {123--145},
  doi = {10.1000/example}
}
```

APA引用スタイル:
- 括弧内引用: `[@smith2023]` -> (Smith & Jones, 2023)
- 叙述的引用: `@smith2023` -> Smith and Jones (2023)
- 複数引用: `[@smith2023; @jones2022]` -> (Jones, 2022; Smith & Jones, 2023)

**期待結果:** `references.bib` が必須フィールド（author、title、year、journal）をすべて含む有効なBibTeXエントリを持ち、引用キーが原稿テキストで使用されているものと一致すること。

**失敗時:** オンラインバリデータまたは `bibtool -d references.bib` でBibTeX構文を検証する。テキスト内の引用キーが `.bib` のキーと完全に一致していることを確認する（大文字小文字を区別）。

### ステップ6: レンダリング

```bash
# Word文書（雑誌投稿によく使用）
quarto render manuscript.qmd --to apaquarto-docx

# PDF（プレプリントまたはレビュー用）
quarto render manuscript.qmd --to apaquarto-pdf
```

**期待結果:** タイトルページ、柱見出し、正しくフォーマットされた参考文献セクションを持つ適切にフォーマットされたAPAドキュメント。

**失敗時:** PDFレンダリングの失敗には、TinyTeXがインストールされていることを確認する（`quarto install tinytex`）。DOCX出力の問題には、apaquartoのWordテンプレートがアクセス可能であることを確認する。参考文献が表示されない場合、ドキュメントの末尾に `# References` 見出しがあることを確認する。

## バリデーション

- [ ] タイトルページが正しくフォーマットされている（タイトル、著者、所属、著者注）
- [ ] 要約がキーワード付きで存在する
- [ ] 本文中の引用が参考文献リストと一致する
- [ ] 表と図が正しく番号付けされている
- [ ] 統計がAPA形式でフォーマットされている（イタリック体、適切な記号）
- [ ] 参考文献がAPA第7版形式である
- [ ] ページ番号と柱見出しが存在する（PDF）

## よくある落とし穴

- **インラインRコードのフォーマット**: インライン統計にはバッククォート-r構文を使用し、ハードコードされた値は使用しない
- **引用キーの不一致**: .bibのキーがテキスト内で完全に一致していることを確認する
- **図の配置**: APA原稿は通常、図を末尾に配置する; `documentmode: man` を設定する
- **CSLファイルの欠落**: apaquartoにはAPA CSLが含まれている; papajaユーザーは `csl: apa.csl` の指定が必要な場合がある
- **要約内の特殊文字**: YAML要約ブロック内でマークダウンフォーマットを避ける

## 関連スキル

- `create-quarto-report` — 一般的なQuartoドキュメント作成
- `generate-statistical-tables` — 出版対応の表
- `build-parameterized-report` — バッチレポート生成
