---
name: format-apa-report
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Format a Quarto or R Markdown report following APA 7th edition style.
  Covers apaquarto/papaja packages, title page, abstracts, citations,
  tables, figures, and reference formatting. Use when writing an academic
  paper in APA format, creating a psychology or social science research
  report, generating reproducible manuscripts with embedded analysis,
  or preparing a thesis or dissertation chapter.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: reporting
  complexity: intermediate
  language: R
  tags: apa, academic, psychology, quarto, papaja
---

# 擬 APA 報

以 Quarto（apaquarto）或 R Markdown（papaja）造 APA 7 式報。

## 用

- 書 APA 式學文
- 造心或社研報
- 生含析之可複稿
- 備論或章

## 入

- **必**：析碼與果
- **必**：書庫文（.bib）
- **可**：共作與屬
- **可**：稿類（期刊文、生文）

## 行

### 一：擇框

**甲：apaquarto（Quarto，宜）**

```r
install.packages("remotes")
remotes::install_github("wjschne/apaquarto")
```

**乙：papaja（R Markdown）**

```r
remotes::install_github("crsh/papaja")
```

得：所擇框包裝成並可 `library(apaquarto)` 或 `library(papaja)` 載。

敗：因缺系依（如 PDF 用之 LaTeX）→先裝 TinyTeX：`quarto install tinytex`。GitHub 裝敗→察 `remotes` 已裝且 GitHub 可達。

### 二：造文（apaquarto）

造 `manuscript.qmd`：

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

得：`manuscript.qmd` 存，YAML frontmatter 含題、短題、作者屬、摘、關詞、書庫引、APA 特格選。

敗：驗 YAML 縮進一致（2 空）；`author:` 條用 `name:`、`affiliations:`、`corresponding:` 之列式；`bibliography:` 指向存之 `.bib` 文。

### 三：書 APA 容

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

得：容循 APA 節構（Introduction、Method、Results、Discussion、References）並有 inline R 為統與正 `@fig-`、`@tbl-` 交引。

敗：inline R 不渲→驗 backtick-r 語（`` `r expression` ``）。交引示為字→察所引塊標用正前綴且塊有對應 caption 選。

### 四：APA 式擬表

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

得：表以 APA 式渲：統符斜體欄首、正小數齊、表上述述。

敗：`gt` 表不以 APA 式渲→確 `gt` 已裝且 `cols_label()` 用 markdown 斜體（`*M*`、`*SD*`）。papaja 用者→用 `apa_table()` 代 `gt()`。

### 五：管引

造 `references.bib`：

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

APA 引式：
- 括：`[@smith2023]` -> (Smith & Jones, 2023)
- 敘：`@smith2023` -> Smith and Jones (2023)
- 多：`[@smith2023; @jones2022]` -> (Jones, 2022; Smith & Jones, 2023)

得：`references.bib` 含有效 BibTeX 條，諸必欄（author、title、year、journal）齊，引鍵匹稿中所用。

敗：以在線驗器或 `bibtool -d references.bib` 驗 BibTeX 語法。確文中引鍵正匹 `.bib` 鍵（區大小）。

### 六：渲

```bash
# Word document (common for journal submission)
quarto render manuscript.qmd --to apaquarto-docx

# PDF (for preprint or review)
quarto render manuscript.qmd --to apaquarto-pdf
```

得：正擬 APA 文含題頁、running head、正擬參節。

敗：PDF 渲敗→驗 TinyTeX 已裝（`quarto install tinytex`）。DOCX 議→察 apaquarto Word 模可達。參不現→確文末有 `# References` 首。

## 驗

- [ ] 題頁擬正（題、作者、屬、作者注）
- [ ] 摘並含關詞
- [ ] 文中引匹參列
- [ ] 表與圖號正
- [ ] 統以 APA 擬（斜體、正符）
- [ ] 參為 APA 7 式
- [ ] 頁號與 running head 在（PDF）

## 忌

- **inline R 擬**：用 backtick-r 為 inline 統，勿硬碼
- **引鍵不匹**：確文中 .bib 鍵正匹
- **圖位**：APA 稿常末置圖；設 `documentmode: man`
- **缺 CSL 文**：apaquarto 含 APA CSL；papaja 用者或須定 `csl: apa.csl`
- **摘中特符**：YAML 摘塊中避 markdown 格

## 參

- `create-quarto-report` - 通 Quarto 文造
- `generate-statistical-tables` - 發版就之表
- `build-parameterized-report` - 批報生
