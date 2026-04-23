---
name: create-quarto-report
locale: wenyan-ultra
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

# 造 Quarto 報

設建可重 Quarto 文為析報、講、網。

## 用

- 建可重析報
- 築含內碼之講
- 自碼生 HTML、PDF、Word 文
- 自 R Markdown 遷至 Quarto

## 入

- **必**：報題與目眾
- **必**：出式（html、pdf、docx、revealjs）
- **可**：數源與析碼
- **可**：引書目（.bib 檔）

## 行

### 一：建 Quarto 文

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

**得：** `report.qmd` 存含有效 YAML 含標、作者、日、式設、行選。

**敗：** 驗 YAML 頭合 `---` 界與正縮。保 `format:` 合 Quarto 支式（`html`、`pdf`、`docx`、`revealjs`）。

### 二：書含碼塊之內

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

**得：** 諸節含正式碼塊、`{r}` 語別與 `#|` 塊選為標、題、寸。

**敗：** 驗碼塊用 ```` ```{r} ```` 文（非內引）、`#|` 選於塊內（非 YAML 頭）、標前綴合交引型（`fig-` 為圖、`tbl-` 為表）。

### 三：設塊選

常塊級選（用 `#|` 文）：

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

**得：** 塊選用 `#|` 文施於塊級、標循交引之命規。

**敗：** 保塊選用 `#|` 文（Quarto 原）、非舊 `{r, option=value}` R Markdown 文。驗標名僅含字母數與連字符。

### 四：加交引與引

```markdown
See @fig-scatter for the visualization and @tbl-summary for statistics.

This approach follows @smith2023 methodology.

::: {#fig-combined layout-ncol=2}
![Plot A](plot_a.png){#fig-plotA}
![Plot B](plot_b.png){#fig-plotB}

Combined figure caption
:::
```

**得：** 交引（`@fig-name`、`@tbl-name`）解至正圖表、引（`@key`）合 `.bib` 檔項。

**敗：** 驗引標存於碼塊含正前綴。引時察 `.bib` 鍵全合（分大小）且 YAML 頭含 `bibliography:`。

### 五：渲文

```bash
quarto render report.qmd

# Specific format
quarto render report.qmd --to pdf
quarto render report.qmd --to docx

# Preview with live reload
quarto preview report.qmd
```

**得：** 出檔於定式生。

**敗：**
- 缺 quarto：自 https://quarto.org/docs/get-started/ 裝
- PDF 誤：`quarto install tinytex` 裝 TinyTeX
- R 包誤：保諸包已裝

### 六：多式出

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

**得：** 諸定出式成生，各含合目式之風與排。

**敗：** 一式敗而他成→察式專需：PDF 需 LaTeX 擎（`quarto install tinytex`）、DOCX 需有效考模、式專 YAML 選須正巢於各式鍵下。

## 驗

- [ ] 文無誤渲
- [ ] 諸碼塊正行
- [ ] 交引解（圖、表、引）
- [ ] 目錄正
- [ ] 出式合眾

## 忌

- **缺標前綴**：可交圖需 `fig-` 前綴、表需 `tbl-`
- **快失效**：上數變時快塊不重行。刪 `_cache/` 強行
- **PDF 無 LaTeX**：裝 TinyTeX 或用 `format: pdf` 含 `pdf-engine: weasyprint` 為 CSS 基 PDF
- **Quarto 中 R Markdown 文**：用 `#|` 塊選而非 `{r, echo=FALSE}` 式

## 參

- `format-apa-report` - APA 式學報
- `build-parameterized-report` - 參多報生
- `generate-statistical-tables` - 刊備表
- `write-vignette` - R 包中 Quarto vignettes
