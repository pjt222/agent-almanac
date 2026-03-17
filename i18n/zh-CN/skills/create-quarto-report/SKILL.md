---
name: create-quarto-report
description: >
  创建用于可复现报告、演示文稿或网站的 Quarto 文档。涵盖 YAML 配置、
  代码块选项、输出格式、交叉引用和渲染。适用于创建可复现的分析报告、
  构建嵌入代码的演示文稿、从代码生成 HTML、PDF 或 Word 文档，或将现有
  R Markdown 文档迁移到 Quarto。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: reporting
  complexity: basic
  language: R
  tags: quarto, report, reproducible, rmarkdown, publishing
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# 创建 Quarto 报告

搭建和编写用于分析报告、演示文稿或网站的可复现 Quarto 文档。

## 适用场景

- 创建可复现的分析报告
- 构建嵌入代码的演示文稿
- 从代码生成 HTML、PDF 或 Word 文档
- 从 R Markdown 迁移到 Quarto

## 输入

- **必需**：报告主题和目标受众
- **必需**：输出格式（html、pdf、docx、revealjs）
- **可选**：数据源和分析代码
- **可选**：引用文献文件（.bib 文件）

## 步骤

### 第 1 步：创建 Quarto 文档

创建 `report.qmd`：

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

**预期结果：** 文件 `report.qmd` 存在，包含有效的 YAML 前言部分，包括标题、作者、日期、格式配置和执行选项。

**失败处理：** 通过检查匹配的 `---` 分隔符和正确的缩进来验证 YAML 头部。确保 `format:` 键匹配 Quarto 支持的输出格式之一（`html`、`pdf`、`docx`、`revealjs`）。

### 第 2 步：编写内容和代码块

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

**预期结果：** 内容部分包含格式正确的代码块，使用 `{r}` 语言标识符和 `#|` 块选项来设置标签、标题和尺寸。

**失败处理：** 确认代码块使用 ```` ```{r} ```` 语法（不是行内反引号），`#|` 选项在块内部（不在 YAML 头部中），标签前缀与交叉引用类型匹配（`fig-` 用于图表，`tbl-` 用于表格）。

### 第 3 步：配置块选项

常用的块级选项（使用 `#|` 语法）：

```
#| label: chunk-name        # 交叉引用必需
#| echo: false               # 隐藏代码
#| eval: false               # 显示但不运行
#| output: false             # 运行但隐藏输出
#| fig-width: 8              # 图表尺寸
#| fig-height: 6
#| fig-cap: "Caption text"   # 启用 @fig-name 引用
#| tbl-cap: "Caption text"   # 启用 @tbl-name 引用
#| cache: true               # 缓存耗时计算
```

**预期结果：** 块选项使用 `#|` 语法在块级别应用，标签遵循交叉引用所需的命名规范。

**失败处理：** 确保块选项使用 `#|` 语法（Quarto 原生），而不是旧版 `{r, option=value}` R Markdown 语法。确认标签名称仅包含字母数字字符和连字符。

### 第 4 步：添加交叉引用和引用

```markdown
See @fig-scatter for the visualization and @tbl-summary for statistics.

This approach follows @smith2023 methodology.

::: {#fig-combined layout-ncol=2}
![Plot A](plot_a.png){#fig-plotA}
![Plot B](plot_b.png){#fig-plotB}

Combined figure caption
:::
```

**预期结果：** 交叉引用（`@fig-name`、`@tbl-name`）正确解析到对应的图表和表格，引用（`@key`）匹配 `.bib` 文件中的条目。

**失败处理：** 确认引用的标签存在于具有正确前缀（`fig-`、`tbl-`）的代码块中。对于引用，检查 `.bib` 键是否完全匹配（区分大小写），以及 YAML 头部中是否设置了 `bibliography:`。

### 第 5 步：渲染文档

```bash
quarto render report.qmd

# 指定格式
quarto render report.qmd --to pdf
quarto render report.qmd --to docx

# 带实时重载的预览
quarto preview report.qmd
```

**预期结果：** 生成指定格式的输出文件。

**失败处理：**
- 缺少 quarto：从 https://quarto.org/docs/get-started/ 安装
- PDF 错误：使用 `quarto install tinytex` 安装 TinyTeX
- R 包错误：确保所有包已安装

### 第 6 步：多格式输出

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

渲染所有格式：`quarto render report.qmd`

**预期结果：** 所有指定的输出格式都成功生成，每种格式都具有正确的样式和布局。

**失败处理：** 如果一种格式失败而其他格式成功，请检查特定格式的要求：PDF 需要 LaTeX 引擎（使用 `quarto install tinytex` 安装），DOCX 在指定时需要有效的参考模板，格式特定的 YAML 选项必须正确嵌套在每个格式键下。

## 验证清单

- [ ] 文档渲染无错误
- [ ] 所有代码块正确执行
- [ ] 交叉引用正确解析（图表、表格、引用）
- [ ] 目录准确
- [ ] 输出格式适合目标受众

## 常见问题

- **缺少标签前缀**：可交叉引用的图表需要标签中的 `fig-` 前缀，表格需要 `tbl-`
- **缓存失效**：当上游数据更改时，缓存的块不会重新运行。删除 `_cache/` 强制重新运行。
- **没有 LaTeX 的 PDF**：安装 TinyTeX 或使用 `format: pdf` 配合 `pdf-engine: weasyprint` 生成基于 CSS 的 PDF
- **Quarto 中的 R Markdown 语法**：使用 `#|` 块选项而不是 `{r, echo=FALSE}` 风格

## 相关技能

- `format-apa-report` - APA 格式的学术报告
- `build-parameterized-report` - 参数化多报告生成
- `generate-statistical-tables` - 出版级表格
- `write-vignette` - R 包中的 Quarto 小品文
