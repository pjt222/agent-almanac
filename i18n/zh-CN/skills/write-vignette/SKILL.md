---
name: write-vignette
description: >
  使用 R Markdown 或 Quarto 创建 R 包 vignette。涵盖 vignette 设置、
  YAML 配置、代码块选项、构建与测试，以及 CRAN 对 vignette 的要求。
  适用于添加入门教程、记录跨多个函数的复杂工作流、创建领域特定指南，
  或 CRAN 提交要求提供函数帮助页之外的用户文档的场景。
locale: zh-CN
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

# 编写 Vignette

为 R 包创建长篇文档 vignette。

## 适用场景

- 为包添加"入门"教程
- 记录跨多个函数的复杂工作流
- 创建领域特定指南（如统计方法）
- CRAN 提交要求提供函数帮助页之外的用户文档

## 输入

- **必需**：含待记录函数的 R 包
- **必需**：Vignette 标题和主题
- **可选**：格式（R Markdown 或 Quarto，默认：R Markdown）
- **可选**：Vignette 是否需要外部数据或 API

## 步骤

### 第 1 步：创建 Vignette 文件

```r
usethis::use_vignette("getting-started", title = "Getting Started with packagename")
```

**预期结果：** `vignettes/getting-started.Rmd` 已创建，包含 YAML frontmatter。`knitr` 和 `rmarkdown` 已添加至 DESCRIPTION Suggests 字段。`vignettes/` 目录已存在。

**失败处理：** 若 `usethis::use_vignette()` 失败，确认工作目录是包的根目录（包含 `DESCRIPTION`）。若 `knitr` 未安装，先运行 `install.packages("knitr")`。若需手动创建，创建 `vignettes/` 目录和文件，确保 YAML frontmatter 包含全部三个 `%\Vignette*` 条目。

### 第 2 步：编写 Vignette 内容

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

**预期结果：** Vignette Rmd 文件包含"介绍"、"安装"、"基础用法"、"高级功能"和"总结"章节。代码示例使用包的导出函数并产生可见输出。

**失败处理：** 若示例运行失败，使用 `devtools::install()` 确认包已安装。确保示例在 `library()` 调用中使用包名（而非 `devtools::load_all()`）。对于需要外部资源的函数，使用 `eval=FALSE` 仅展示代码而不执行。

### 第 3 步：配置代码块

为不同目的使用代码块选项：

```r
# 标准执行块
{r example-basic}
result <- compute_something(1:10)
result

# 展示代码但不运行（用于说明目的）
{r api-example, eval=FALSE}
connect_to_api(key = "your_key_here")

# 运行但隐藏代码（仅显示输出）
{r hidden-setup, echo=FALSE}
library(packagename)

# 设置全局选项
{r setup, include=FALSE}
knitr::opts_chunk$set(
  collapse = TRUE,
  comment = "#>",
  fig.width = 7,
  fig.height = 5
)
```

**预期结果：** 带有 `include=FALSE` 的 setup 块设置全局选项（`collapse`、`comment`、`fig.width`、`fig.height`）。代码块配置适当：说明性代码使用 `eval=FALSE`，隐藏设置使用 `echo=FALSE`，交互示例使用标准块。

**失败处理：** 若代码块选项不生效，确认语法使用 `{r chunk-name, option=value}` 格式（逗号分隔，逻辑值不加引号）。确认 setup 块通过放置在文档顶部来最先运行。

### 第 4 步：处理外部依赖

对于需要网络访问或可选包的 vignette：

```r
{r check-available, include=FALSE}
has_suggested <- requireNamespace("optionalpkg", quietly = TRUE)

{r use-suggested, eval=has_suggested}
optionalpkg::special_function()
```

对于耗时计算，预计算并保存结果：

```r
# 将预计算结果保存至 vignettes/
saveRDS(expensive_result, "vignettes/precomputed.rds")

# 在 vignette 中加载
{r load-precomputed}
result <- readRDS("precomputed.rds")
```

**预期结果：** 外部依赖处理得当：可选包使用 `requireNamespace()` 条件加载，依赖网络的代码使用 `eval=FALSE` 或 `tryCatch()`，耗时计算使用预计算的 `.rds` 文件。

**失败处理：** 若 vignette 因可选包不可用而在 CRAN 上失败，用条件变量包裹相关部分（如 `eval=has_suggested`）。对于预计算结果，确认 `.rds` 文件包含在 `vignettes/` 目录中并以相对路径引用。

### 第 5 步：构建并测试 Vignette

```r
# 构建单个 vignette
devtools::build_vignettes()

# 构建并检查（可捕获 vignette 问题）
devtools::check()
```

**预期结果：** Vignette 构建无错误。HTML 输出可正常阅读。

**失败处理：**
- 找不到 pandoc：在 `.Renviron` 中设置 `RSTUDIO_PANDOC`
- 包未安装：先运行 `devtools::install()`
- 缺少 Suggests 包：安装 DESCRIPTION Suggests 中列出的包

### 第 6 步：在包检查中验证

```r
devtools::check()
```

与 Vignette 相关的检查：正确构建、构建时间合理、无错误。

**预期结果：** `devtools::check()` 通过，无 vignette 相关错误或警告。Vignette 在 CRAN 时间限制内构建完成（通常不超过 60 秒）。

**失败处理：** 若 vignette 导致检查失败，常见修复包括：在 DESCRIPTION 中添加缺少的 Suggests 包、对慢速块使用 `eval=FALSE` 减少构建时间、确保 `VignetteIndexEntry` 与标题匹配。单独运行 `devtools::build_vignettes()` 以隔离 vignette 特定错误。

## 验证清单

- [ ] Vignette 通过 `devtools::build_vignettes()` 构建无错误
- [ ] 所有代码块正确执行
- [ ] VignetteIndexEntry 与标题匹配
- [ ] `devtools::check()` 通过且无 vignette 警告
- [ ] Vignette 出现在 pkgdown 站点文章中（若适用）
- [ ] 构建时间合理（CRAN 要求 < 60 秒）

## 常见问题

- **VignetteIndexEntry 不匹配**：YAML 中的索引条目必须与用户在 `vignette(package = "pkg")` 中看到的内容一致
- **缺少 `vignette` YAML 块**：三行 `%\Vignette*` 均为必需
- **Vignette 对 CRAN 而言过慢**：预计算结果或对耗时操作使用 `eval=FALSE`
- **找不到 pandoc**：确认已设置 `RSTUDIO_PANDOC` 环境变量
- **引用包自身**：在 vignette 中使用 `library(packagename)` 而非 `devtools::load_all()`

## 相关技能

- `write-roxygen-docs` — 补充 vignette 教程的函数级文档
- `build-pkgdown-site` — Vignette 在 pkgdown 站点中作为文章显示
- `submit-to-cran` — CRAN 对 vignette 有特定要求
- `create-quarto-report` — 作为 R Markdown vignette 替代方案的 Quarto
