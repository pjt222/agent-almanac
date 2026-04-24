---
name: format-apa-report
locale: wenyan
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

# 格 APA 報

造循 APA 第七版之 Quarto（apaquarto）或 R Markdown（papaja）格之報。

## 用時

- 書 APA 格學報
- 造心或社科研報
- 生含析之可復製稿
- 備學位論章

## 入

- **必要**：析碼與果
- **必要**：參考文獻檔（.bib）
- **可選**：共作與所屬
- **可選**：稿類（期刊文、學生稿）

## 法

### 第一步：擇框

**甲選：apaquarto（Quarto，薦）**

```r
install.packages("remotes")
remotes::install_github("wjschne/apaquarto")
```

**乙選：papaja（R Markdown）**

```r
remotes::install_github("crsh/papaja")
```

**得：** 所擇框包成裝，可以 `library(apaquarto)` 或 `library(papaja)` 載。

**敗則：** 若因缺系依（如 PDF 之 LaTeX）裝敗，先 `quarto install tinytex`。若 GitHub 裝敗，察 `remotes` 已裝且 GitHub 可達。

### 第二步：造文（apaquarto）

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

**得：** `manuscript.qmd` 存附有效 YAML 含題、短題、作者所屬、摘、鍵詞、參考、APA 特格選。

**敗則：** 驗 YAML 縮進一（二空）且 `author:` 用 `name:`、`affiliations:`、`corresponding:` 之列格。察 `bibliography:` 指存之 `.bib`。

### 第三步：書 APA 容

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

**得：** 容循 APA 節構（Introduction、Method、Results、Discussion、References）附內嵌 R 碼統附正交引用 `@fig-` 與 `@tbl-`。

**敗則：** 若內嵌 R 碼不渲，驗反引 r 語正（`` `r expression` ``）。若交引示為字，察所引塊標正用前綴並配應題選。

### 第四步：以 APA 格表

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

**得：** 表以 APA 格渲：統符列頭斜體、正小對、表上有述題。

**敗則：** 若 `gt` 表不以 APA 渲，確 `gt` 裝且 `cols_label()` 用 markdown 斜體（`*M*`、`*SD*`）。papaja 用 `apa_table()` 代 `gt()`。

### 第五步：管引用

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

APA 引用式：
- 括內：`[@smith2023]` -> (Smith & Jones, 2023)
- 敘：`@smith2023` -> Smith and Jones (2023)
- 多：`[@smith2023; @jones2022]` -> (Jones, 2022; Smith & Jones, 2023)

**得：** `references.bib` 含有效 BibTeX 條附諸必域（author、title、year、journal），引鍵合稿文。

**敗則：** 以線驗器或 `bibtool -d references.bib` 驗 BibTeX 語。確文引鍵與 `.bib` 鍵確合（別大小）。

### 第六步：渲

```bash
# Word document (common for journal submission)
quarto render manuscript.qmd --to apaquarto-docx

# PDF (for preprint or review)
quarto render manuscript.qmd --to apaquarto-pdf
```

**得：** 正格之 APA 文附題頁、頁眉、正格之參考節。

**敗則：** PDF 渲敗時，驗 TinyTeX 裝（`quarto install tinytex`）。DOCX 出問時，察 apaquarto 之 Word 模可達。若參不現，確文末有 `# References` 題。

## 驗

- [ ] 題頁正格（題、作者、所屬、作者注）
- [ ] 摘附鍵詞
- [ ] 文內引合參考列
- [ ] 表圖正編
- [ ] 統循 APA 格（斜體、正符）
- [ ] 參考以 APA 第七版格
- [ ] 頁號與頁眉存（PDF）

## 陷

- **內嵌 R 碼格**：用反引 r 於內統，非硬值
- **引鍵失配**：確 .bib 鍵於文確合
- **圖置**：APA 稿通置圖於末；設 `documentmode: man`
- **缺 CSL 檔**：apaquarto 含 APA CSL；papaja 或需指 `csl: apa.csl`
- **摘中特字**：避 YAML 摘塊之 markdown 格

## 參

- `create-quarto-report` - 通 Quarto 文造
- `generate-statistical-tables` - 可發表表
- `build-parameterized-report` - 批報生
