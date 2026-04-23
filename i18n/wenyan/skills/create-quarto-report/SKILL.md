---
name: create-quarto-report
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Create a Quarto document for reproducible reports, presentations, or
  websites. Covers YAML configuration, code chunk options, output
  formats, cross-references, and rendering. Use when creating a
  reproducible analysis report, building a presentation with embedded
  code, generating HTML, PDF, or Word documents from code, or migrating
  an existing R Markdown document to Quarto.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: reporting
  complexity: basic
  language: R
  tags: quarto, report, reproducible, rmarkdown, publishing
---

# 建 Quarto 報告

設建可重現之 Quarto 文檔，為析報、演示、網站。

## 用時

- 建可重現之析報
- 建含嵌碼之演示
- 由碼生 HTML、PDF、Word 文檔
- 由 R Markdown 遷至 Quarto

## 入

- **必要**：報題與目標聽者
- **必要**：出式（html、pdf、docx、revealjs）
- **可選**：數源與析碼
- **可選**：引目（.bib 文件）

## 法

### 第一步：建 Quarto 文檔

建 `report.qmd`：

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

**得：** `report.qmd` 文件存，有合法 YAML 前言，含題、作者、日、式配、執選。

**敗則：** 驗 YAML 頭之 `---` 界相配而縮進正。確 `format:` 合 Quarto 支持之出式（`html`、`pdf`、`docx`、`revealjs`）。

### 第二步：書內容含碼塊

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

**得：** 內容節含正格之碼塊，有 `{r}` 語標識與 `#|` 塊選為標、題、尺。

**敗則：** 驗碼塊用 ```` ```{r} ```` 語法（非內聯撇），`#|` 選於塊內（非 YAML 頭），標前綴合交叉參類（`fig-` 為圖、`tbl-` 為表）。

### 第三步：設塊選

常見塊級選（用 `#|` 語法）：

```
#| label: chunk-name        # Required for cross-references
#| echo: false               # Hide code
#| eval: false               # Show but don't run
#| output: false             # Run but hide output
#| fig-width: 8              # Figure dimensions
#| fig-height: 6
#| fig-cap: "Caption text"   # Enable @fig-name references
#| tbl-cap: "Caption text"   # Enable @tbl-name references
#| cache: true               # Cache expensive computations
```

**得：** 塊選於塊級以 `#|` 施，標循交叉參所需之名慣。

**敗則：** 確塊選用 `#|`（Quarto 原生），非舊 R Markdown 之 `{r, option=value}`。驗標名唯含字母數字與連字符。

### 第四步：加交叉參與引用

```markdown
See @fig-scatter for the visualization and @tbl-summary for statistics.

This approach follows @smith2023 methodology.

::: {#fig-combined layout-ncol=2}
![Plot A](plot_a.png){#fig-plotA}
![Plot B](plot_b.png){#fig-plotB}

Combined figure caption
:::
```

**得：** 交叉參（`@fig-name`、`@tbl-name`）解至正圖表，引用（`@key`）合 `.bib` 之項。

**敗則：** 驗所引之標存於碼塊且前綴正（`fig-`、`tbl-`）。引用者察 `.bib` 鍵精合（辨大小），YAML 頭有 `bibliography:`。

### 第五步：渲文檔

```bash
quarto render report.qmd

# Specific format
quarto render report.qmd --to pdf
quarto render report.qmd --to docx

# Preview with live reload
quarto preview report.qmd
```

**得：** 出文件生於指定式。

**敗則：**
- 缺 quarto：由 https://quarto.org/docs/get-started/ 裝
- PDF 訛：以 `quarto install tinytex` 裝 TinyTeX
- R 包訛：確諸包已裝

### 第六步：多式出

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

渲諸式：`quarto render report.qmd`

**得：** 諸指定出式皆成，各有合式之樣與佈。

**敗則：** 若一式敗他成，察式專需：PDF 需 LaTeX 引擎（以 `quarto install tinytex` 裝），DOCX 需合法參樣（若指定），式專 YAML 選須正嵌於各式鍵下。

## 驗

- [ ] 文檔無訛而渲
- [ ] 諸碼塊正執
- [ ] 交叉參解（圖、表、引用）
- [ ] 目錄正
- [ ] 出式合聽者

## 陷

- **缺標前綴**：可交叉參之圖需標有 `fig-`，表需 `tbl-`
- **緩失效**：緩塊於上游數變時不重運。刪 `_cache/` 以迫之。
- **無 LaTeX 之 PDF**：裝 TinyTeX，或以 `format: pdf` 與 `pdf-engine: weasyprint` 作基於 CSS 之 PDF
- **Quarto 中之 R Markdown 語法**：用 `#|` 塊選代 `{r, echo=FALSE}` 式

## 參

- `format-apa-report` — APA 格學術報
- `build-parameterized-report` — 參化多報生
- `generate-statistical-tables` — 可刊之表
- `write-vignette` — R 包之 Quarto vignette
