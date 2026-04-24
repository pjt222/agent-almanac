---
name: format-apa-report
locale: wenyan-lite
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

# 格 APA 報告

以 Quarto（apaquarto）或 R Markdown（papaja）建循 APA 第 7 版格之報告。

## 適用時機

- 書 APA 格之學術論文
- 建心理或社科研究報告
- 生含嵌入分析之可復現稿
- 備論文或學位論文章

## 輸入

- **必要**：分析代碼與結
- **必要**：書目檔（.bib）
- **選擇性**：共著者與屬
- **選擇性**：稿類（期刊論文、學生論文）

## 步驟

### 步驟一：擇框

**選 A：apaquarto（Quarto，所建議）**

```r
install.packages("remotes")
remotes::install_github("wjschne/apaquarto")
```

**選 B：papaja（R Markdown）**

```r
remotes::install_github("crsh/papaja")
```

**預期：** 所擇框之包成裝並可以 `library(apaquarto)` 或 `library(papaja)` 載。

**失敗時：** 若裝因缺系統依賴（如 PDF 輸出之 LaTeX）敗，先以 `quarto install tinytex` 裝 TinyTeX。於 GitHub 裝敗，查 `remotes` 包已裝且 GitHub 可達。

### 步驟二：建文件（apaquarto）

建 `manuscript.qmd`：

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

**預期：** 檔 `manuscript.qmd` 存，有效 YAML frontmatter 含 title、shorttitle、author 屬、abstract、keywords、bibliography 引、APA 特定格選。

**失敗時：** 驗 YAML 縮排一致（2 空），`author:` 項以帶 `name:`、`affiliations:`、`corresponding:` 欄之清單格式。察 `bibliography:` 指已存之 `.bib` 檔。

### 步驟三：書 APA 內容

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

**預期：** 內容循 APA 節結構（Introduction、Method、Results、Discussion、References），含供統計之行內 R 代碼與用 `@fig-` 與 `@tbl-` 前綴之正交互引用。

**失敗時：** 若行內 R 代碼不渲，驗 backtick-r 語法正（`` `r expression` ``）。若交互引用顯為字面文，察所引之塊標用正前綴且塊有相應之 caption 選。

### 步驟四：以 APA 風格之表

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

**預期：** 表以 APA 格渲：統計符號之斜體欄頭、正小數對齊、表上之描述 caption。

**失敗時：** 若 `gt` 表不以 APA 格渲，確 `gt` 包已裝且 `cols_label()` 用 markdown 風格之斜體（`*M*`、`*SD*`）。於 papaja 使用者，改用 `apa_table()` 而非 `gt()`。

### 步驟五：管引用

建 `references.bib`：

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

APA 引用風格：
- 括號：`[@smith2023]` -> (Smith & Jones, 2023)
- 敘事：`@smith2023` -> Smith and Jones (2023)
- 多：`[@smith2023; @jones2022]` -> (Jones, 2022; Smith & Jones, 2023)

**預期：** `references.bib` 含有效 BibTeX 項，所有必欄（author、title、year、journal）俱在，引用 key 配稿文所用。

**失敗時：** 以線上驗器或 `bibtool -d references.bib` 驗 BibTeX 語法。確文中之引用 key 精配 `.bib` key（分大小寫）。

### 步驟六：渲

```bash
# Word document (common for journal submission)
quarto render manuscript.qmd --to apaquarto-docx

# PDF (for preprint or review)
quarto render manuscript.qmd --to apaquarto-pdf
```

**預期：** 正格之 APA 文件，含標題頁、running head 與正格之 references 節。

**失敗時：** 於 PDF 渲敗，驗 TinyTeX 已裝（`quarto install tinytex`）。於 DOCX 輸出問題，察 apaquarto 之 Word 模板可得。若 references 未現，確 `# References` 標於文件末存。

## 驗證

- [ ] 標題頁正格（標題、作者、屬、作者註）
- [ ] Abstract 存，含 keywords
- [ ] 文中引用配引用清單
- [ ] 表與圖正編號
- [ ] 統計以 APA 格（斜體、正符號）
- [ ] References 以 APA 第 7 版格
- [ ] 頁碼與 running head 存（PDF）

## 常見陷阱

- **行內 R 代碼格**：於行內統計用 backtick-r 語法，非硬編之值
- **引用 key 不配**：確 .bib key 於文中精配
- **圖之置**：APA 稿通常置圖於末；設 `documentmode: man`
- **缺 CSL 檔**：apaquarto 含 APA CSL；papaja 使用者或需指 `csl: apa.csl`
- **Abstract 中之特殊字符**：避於 YAML abstract 塊用 markdown 格

## 相關技能

- `create-quarto-report` - 通用 Quarto 文件建
- `generate-statistical-tables` - 出版備之表
- `build-parameterized-report` - 批量報告生
