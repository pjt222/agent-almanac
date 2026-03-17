---
name: format-apa-report
description: >
  按照 APA 第7版格式编排 Quarto 或 R Markdown 报告。涵盖 apaquarto/papaja
  包、扉页、摘要、引用、表格、图表和参考文献格式。适用于撰写 APA 格式的学术
  论文、创建心理学或社会科学研究报告、生成嵌入分析的可复现手稿，或准备学位
  论文章节。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: reporting
  complexity: intermediate
  language: R
  tags: apa, academic, psychology, quarto, papaja
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# 格式化 APA 报告

使用 Quarto（apaquarto）或 R Markdown（papaja）创建 APA 第7版格式的报告。

## 适用场景

- 撰写 APA 格式的学术论文
- 创建心理学或社会科学研究报告
- 生成嵌入分析的可复现手稿
- 准备学位论文章节

## 输入

- **必需**：分析代码和结果
- **必需**：参考文献文件（.bib）
- **可选**：合著者和单位信息
- **可选**：手稿类型（期刊文章、学生论文）

## 步骤

### 第 1 步：选择框架

**选项 A：apaquarto（Quarto，推荐）**

```r
install.packages("remotes")
remotes::install_github("wjschne/apaquarto")
```

**选项 B：papaja（R Markdown）**

```r
remotes::install_github("crsh/papaja")
```

**预期结果：** 所选框架包成功安装，可通过 `library(apaquarto)` 或 `library(papaja)` 加载。

**失败处理：** 如果因缺少系统依赖项（如 PDF 输出的 LaTeX）导致安装失败，请先使用 `quarto install tinytex` 安装 TinyTeX。如果 GitHub 安装失败，检查 `remotes` 包是否已安装且 GitHub 可访问。

### 第 2 步：创建文档（apaquarto）

创建 `manuscript.qmd`：

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

**预期结果：** 文件 `manuscript.qmd` 存在，包含有效的 YAML 前言部分，含标题、短标题、作者单位、摘要、关键词、参考文献引用和 APA 特定格式选项。

**失败处理：** 确认 YAML 缩进一致（2个空格），`author:` 条目使用包含 `name:`、`affiliations:` 和 `corresponding:` 字段的列表格式。检查 `bibliography:` 指向现有的 `.bib` 文件。

### 第 3 步：撰写 APA 内容

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

**预期结果：** 内容遵循 APA 章节结构（引言、方法、结果、讨论、参考文献），使用行内 R 代码报告统计数据，并使用 `@fig-` 和 `@tbl-` 前缀进行正确的交叉引用。

**失败处理：** 如果行内 R 代码未渲染，请检查反引号-r 语法是否正确（`` `r expression` ``）。如果交叉引用显示为纯文本，检查引用的块标签是否使用了正确的前缀，以及块是否有相应的标题选项。

### 第 4 步：以 APA 样式格式化表格

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

**预期结果：** 表格以 APA 格式渲染：统计符号使用斜体列标题、正确的小数对齐和表格上方的描述性标题。

**失败处理：** 如果 `gt` 表格未以 APA 样式渲染，确保 `gt` 包已安装，`cols_label()` 使用 Markdown 风格斜体（`*M*`、`*SD*`）。papaja 用户应使用 `apa_table()` 而非 `gt()`。

### 第 5 步：管理引用

创建 `references.bib`：

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

APA 引用样式：
- 括号引用：`[@smith2023]` -> (Smith & Jones, 2023)
- 叙述引用：`@smith2023` -> Smith and Jones (2023)
- 多引用：`[@smith2023; @jones2022]` -> (Jones, 2022; Smith & Jones, 2023)

**预期结果：** `references.bib` 包含有效的 BibTeX 条目，具备所有必需字段（author、title、year、journal），引用键与手稿文本中使用的一致。

**失败处理：** 使用在线验证器或 `bibtool -d references.bib` 验证 BibTeX 语法。确保文本中的引用键与 `.bib` 键完全匹配（区分大小写）。

### 第 6 步：渲染

```bash
# Word 文档（期刊投稿常用）
quarto render manuscript.qmd --to apaquarto-docx

# PDF（预印本或审稿用）
quarto render manuscript.qmd --to apaquarto-pdf
```

**预期结果：** 格式正确的 APA 文档，包含扉页、页眉和正确格式化的参考文献部分。

**失败处理：** PDF 渲染失败时，验证 TinyTeX 已安装（`quarto install tinytex`）。DOCX 输出问题请检查 apaquarto 的 Word 模板是否可访问。如果参考文献未显示，确保文档末尾有 `# References` 标题。

## 验证清单

- [ ] 扉页格式正确（标题、作者、单位、作者注）
- [ ] 包含摘要和关键词
- [ ] 正文引用与参考文献列表匹配
- [ ] 表格和图表编号正确
- [ ] 统计数据按 APA 格式排版（斜体、正确符号）
- [ ] 参考文献采用 APA 第7版格式
- [ ] 页码和页眉存在（PDF）

## 常见问题

- **行内 R 代码格式**：使用反引号-r 语法报告行内统计数据，不要硬编码数值
- **引用键不匹配**：确保 .bib 键在文本中完全匹配
- **图表放置**：APA 手稿通常将图表放在末尾；设置 `documentmode: man`
- **缺少 CSL 文件**：apaquarto 内含 APA CSL；papaja 用户可能需要指定 `csl: apa.csl`
- **摘要中的特殊字符**：避免在 YAML 摘要块中使用 Markdown 格式

## 相关技能

- `create-quarto-report` - 通用 Quarto 文档创建
- `generate-statistical-tables` - 出版级表格
- `build-parameterized-report` - 批量报告生成
