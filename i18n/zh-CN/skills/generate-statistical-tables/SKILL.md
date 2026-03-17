---
name: generate-statistical-tables
description: >
  使用 gt、kableExtra 或 flextable 生成出版级统计表格。涵盖描述性统计、
  回归结果、方差分析表、相关矩阵和 APA 格式。适用于创建描述性统计表格、
  格式化回归或方差分析输出、构建相关矩阵、为学术论文制作 APA 样式表格，
  或为 Quarto 和 R Markdown 文档生成表格。
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: reporting
  complexity: intermediate
  language: R
  tags: r, tables, gt, statistics, publication
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# 生成统计表格

为报告和手稿创建出版级统计表格。

## 适用场景

- 创建描述性统计表格
- 格式化回归或方差分析输出
- 构建相关矩阵
- 为学术论文制作 APA 样式表格
- 为 Quarto/R Markdown 文档生成表格

## 输入

- **必需**：统计分析结果（模型对象、汇总数据）
- **必需**：输出格式（HTML、PDF、Word）
- **可选**：样式指南（APA、期刊特定）
- **可选**：表格编号方案

## 步骤

### 第 1 步：选择表格包

| 包 | 最适合 | 格式 |
|---------|----------|---------|
| `gt` | HTML、通用 | HTML、PDF、Word |
| `kableExtra` | LaTeX/PDF 文档 | PDF、HTML |
| `flextable` | Word 文档 | Word、PDF、HTML |
| `gtsummary` | 临床/统计摘要 | 通过 gt/flextable 支持所有格式 |

**预期结果：** 根据输出格式和用例选定表格包。所选包已安装并可加载。

**失败处理：** 如果所需包未安装，运行 `install.packages("gt")`（或相应的包）。对于 `gtsummary`，`gt` 和 `gtsummary` 都必须安装。

### 第 2 步：描述性统计表格

```r
library(gt)

descriptives <- data |>
  group_by(group) |>
  summarise(
    n = n(),
    M = mean(score, na.rm = TRUE),
    SD = sd(score, na.rm = TRUE),
    Min = min(score, na.rm = TRUE),
    Max = max(score, na.rm = TRUE)
  )

gt(descriptives) |>
  tab_header(
    title = "Table 1",
    subtitle = "Descriptive Statistics by Group"
  ) |>
  fmt_number(columns = c(M, SD), decimals = 2) |>
  fmt_number(columns = c(Min, Max), decimals = 1) |>
  cols_label(
    group = "Group",
    n = md("*n*"),
    M = md("*M*"),
    SD = md("*SD*")
  )
```

**预期结果：** 一个 `gt` 表格对象，包含按类别分组的格式化均值、标准差和计数。列标题使用正确的统计符号（斜体 *M*、*SD*、*n*）。

**失败处理：** 如果 `group_by()` 产生意外结果，检查分组变量是否存在并具有预期的水平。如果 `fmt_number()` 抛出错误，确保目标列包含数值数据。

### 第 3 步：回归结果表格

```r
model <- lm(outcome ~ predictor1 + predictor2 + predictor3, data = data)

library(gtsummary)

tbl_regression(model) |>
  bold_p() |>
  add_glance_source_note(
    include = c(r.squared, adj.r.squared, nobs)
  ) |>
  modify_header(label = "**Predictor**") |>
  modify_caption("Table 2: Regression Results")
```

**预期结果：** 一个 `gtsummary` 回归表格，p 值加粗，模型拟合统计量（R 方、N）在脚注中，并有描述性标题。

**失败处理：** 如果 `tbl_regression()` 失败，检查输入是否为模型对象（如 `lm`、`glm`）。如果 `add_glance_source_note()` 报错，检查 `broom` 能否整理该模型：`broom::glance(model)`。

### 第 4 步：相关矩阵

```r
library(gt)

cor_matrix <- cor(data[, c("var1", "var2", "var3", "var4")],
                  use = "pairwise.complete.obs")

# Format lower triangle
cor_matrix[upper.tri(cor_matrix)] <- NA

as.data.frame(cor_matrix) |>
  tibble::rownames_to_column("Variable") |>
  gt() |>
  fmt_number(decimals = 2) |>
  sub_missing(missing_text = "") |>
  tab_header(title = "Table 3", subtitle = "Correlation Matrix")
```

**预期结果：** 下三角相关矩阵渲染为 `gt` 表格，上三角留空，保留两位小数，并有清晰的标题。

**失败处理：** 如果 `sub_missing()` 未能留空上三角，检查 `NA` 值是否已通过 `cor_matrix[upper.tri(cor_matrix)] <- NA` 正确设置。如果变量非数值型，`cor()` 将失败；先筛选数值列。

### 第 5 步：方差分析表

```r
aov_result <- aov(score ~ group * condition, data = data)

library(gtsummary)

tbl_anova <- broom::tidy(aov_result) |>
  gt() |>
  fmt_number(columns = c(sumsq, meansq, statistic), decimals = 2) |>
  fmt_number(columns = p.value, decimals = 3) |>
  cols_label(
    term = "Source",
    df = md("*df*"),
    sumsq = md("*SS*"),
    meansq = md("*MS*"),
    statistic = md("*F*"),
    p.value = md("*p*")
  ) |>
  tab_header(title = "Table 4", subtitle = "ANOVA Results")
```

**预期结果：** 格式化的方差分析表，包含来源、*df*、*SS*、*MS*、*F* 和 *p* 列。交互项标注清晰，p 值格式化为三位小数。

**失败处理：** 如果 `broom::tidy(aov_result)` 产生意外列，检查模型是否为 `aov` 对象。若需要 III 类平方和，使用 `car::Anova(model, type = 3)` 而非基础的 `aov()`。

### 第 6 步：保存表格

```r
# Save as HTML
gtsave(my_table, "table1.html")

# Save as Word
gtsave(my_table, "table1.docx")

# Save as PNG image
gtsave(my_table, "table1.png")

# For LaTeX/PDF (kableExtra)
kableExtra::save_kable(kable_table, "table1.pdf")
```

**预期结果：** 表格保存为指定文件格式（HTML、Word、PNG 或 PDF）。输出文件在相应应用程序中正确打开。

**失败处理：** 如果 `gtsave()` 对 Word 格式失败，确保 `webshot2` 包已安装。对于通过 `kableExtra` 的 PDF 输出，确保已安装 LaTeX 发行版（TinyTeX 或 MiKTeX）。

### 第 7 步：嵌入 Quarto 文档

````markdown
```{r}
#| label: tbl-descriptives
#| tbl-cap: "Descriptive Statistics by Group"

gt(descriptives) |>
  fmt_number(columns = c(M, SD), decimals = 2)
```

See @tbl-descriptives for summary statistics.
````

**预期结果：** 表格在 Quarto 文档中内联渲染，具有可交叉引用的标签（`@tbl-*`）和正确的标题。表格自动适应文档的输出格式。

**失败处理：** 如果表格未渲染，检查代码块标签是否以 `tbl-` 开头（Quarto 交叉引用要求）。如果在 PDF 中格式丢失，从 `gt` 切换到 `kableExtra` 以适应基于 LaTeX 的输出。

## 验证清单

- [ ] 表格在目标格式（HTML、PDF、Word）中正确渲染
- [ ] 数字格式一致（小数位数、对齐）
- [ ] 统计符号遵循样式指南（斜体、正确符号）
- [ ] 表格有清晰的标题和编号
- [ ] 列标题有意义
- [ ] 注释/脚注解释缩写或显著性标记

## 常见问题

- **gt 在 PDF 中的限制**：gt 对 PDF 支持有限。对于 LaTeX 密集的文档使用 kableExtra。
- **舍入不一致**：始终使用 `fmt_number()`（gt）或 `format()` 而非 `round()` 来显示数据
- **缺失值显示**：在 gt 中使用 `sub_missing()` 或 `options(knitr.kable.NA = "")` 配置
- **PDF 中的宽表格**：超过页面宽度的表格需要 `landscape()` 或缩小字体
- **APA 数字格式**：以 1 为界的值不加前导零（p 值、相关系数）：".03" 而非 "0.03"

## 相关技能

- `format-apa-report` - APA 手稿中的表格
- `create-quarto-report` - 在报告中嵌入表格
- `build-parameterized-report` - 适应参数的表格
