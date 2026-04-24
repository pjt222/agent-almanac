---
name: generate-statistical-tables
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Generate publication-ready statistical tables using gt, kableExtra,
  or flextable. Covers descriptive statistics, regression results,
  ANOVA tables, correlation matrices, and APA formatting. Use when
  creating descriptive statistics tables, formatting regression or
  ANOVA output, building correlation matrices, producing APA-style
  tables for academic papers, or generating tables for Quarto and
  R Markdown documents.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: reporting
  complexity: intermediate
  language: R
  tags: r, tables, gt, statistics, publication
---

# 生統計表

造可出版之統計表供報告與稿。

## 用

- 造描述統計表
- 格式化回歸或 ANOVA 輸出
- 建相關矩陣
- 造 APA 式表供學術論文
- 造 Quarto/R Markdown 文檔之表

## 入

- **必**：統計析果（模對象、摘數）
- **必**：出格式（HTML、PDF、Word）
- **可**：風格指南（APA、期刊特）
- **可**：表編號方案

## 行

### 一：擇表包

| Package | Best for | Formats |
|---------|----------|---------|
| `gt` | HTML, general-purpose | HTML, PDF, Word |
| `kableExtra` | LaTeX/PDF documents | PDF, HTML |
| `flextable` | Word documents | Word, PDF, HTML |
| `gtsummary` | Clinical/statistical summaries | All via gt/flextable |

得：依出格式與用例擇包。所擇包已裝且可載。

敗：所需包未裝→`install.packages("gt")`（或適包）。`gtsummary` 需 `gt` 與 `gtsummary` 並裝。

### 二：描述統計表

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

得：`gt` 表對象，格式化均、SD、計數依類分。欄頭用正確統計符（斜體 *M*、*SD*、*n*）。

敗：`group_by()` 果異→驗分組變量存且有預期層。`fmt_number()` 誤→察目標欄含數值。

### 三：回歸結果表

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

得：`gtsummary` 回歸表，p 值粗，模擬合統計（R-squared、N）於源註，描述標題具。

敗：`tbl_regression()` 敗→驗輸入為模對象（如 `lm`、`glm`）。`add_glance_source_note()` 誤→察 `broom` 可整模：`broom::glance(model)`。

### 四：相關矩陣

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

得：下三角相關矩陣為 `gt` 表，上三角空白，二位小數，標題清。

敗：`sub_missing()` 不空白上三角→驗 `NA` 已以 `cor_matrix[upper.tri(cor_matrix)] <- NA` 設。變量非數值→`cor()` 敗；先濾數欄。

### 五：ANOVA 表

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

得：格式化 ANOVA 表含 Source、*df*、*SS*、*MS*、*F*、*p* 諸欄。交互項顯標，p 值三位小數。

敗：`broom::tidy(aov_result)` 出欄異→驗模為 `aov`。欲 Type III SS 用 `car::Anova(model, type = 3)` 非 base `aov()`。

### 六：存表

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

得：表存至指定格式（HTML、Word、PNG、PDF）。出檔於適應用正確開。

敗：`gtsave()` Word 敗→察 `webshot2` 包已裝。PDF 經 `kableExtra`→察 LaTeX 分發（TinyTeX 或 MiKTeX）已裝。

### 七：嵌 Quarto 文檔

````markdown
```{r}
#| label: tbl-descriptives
#| tbl-cap: "Descriptive Statistics by Group"

gt(descriptives) |>
  fmt_number(columns = c(M, SD), decimals = 2)
```

See @tbl-descriptives for summary statistics.
````

得：表於 Quarto 文檔內聯繪，標籤可交叉引（`@tbl-*`），題具。表自動適文檔出格式。

敗：表不繪→驗塊標以 `tbl-` 起供 Quarto 交叉引。PDF 格式失→由 `gt` 換 `kableExtra` 供 LaTeX 出。

## 驗

- [ ] 表於目標格式（HTML、PDF、Word）正確繪
- [ ] 數字格式一致（小數位、對齊）
- [ ] 統計符合風格指南（斜體、正符）
- [ ] 表有清題與編號
- [ ] 欄頭有意義
- [ ] 注/腳注釋縮寫或顯著標

## 忌

- **gt 於 PDF**：gt 於 PDF 有限。LaTeX 重文用 kableExtra
- **四捨不一**：恆用 `fmt_number()`（gt）或 `format()`，非 `round()` 供顯
- **缺值顯**：gt 用 `sub_missing()` 配，或 `options(knitr.kable.NA = "")`
- **PDF 寬表**：表過頁寬需 `landscape()` 或減字
- **APA 數格**：界 1 之值無先導零（p 值、相關）：".03" 非 "0.03"
- **忘腳注**：縮寫、顯著標必說明
- **混次型**：分類因子與數值因子應分表式

## 參

- `format-apa-report`
- `create-quarto-report`
- `build-parameterized-report`
