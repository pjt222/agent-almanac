---
name: generate-statistical-tables
locale: wenyan
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

# 統計表之生

為報告與論文製備刊級統計表。

## 用時

- 製描述統計表
- 格式回歸或 ANOVA 輸出
- 建相關矩陣
- 學術論文 APA 式表
- 為 Quarto/R Markdown 文檔生表

## 入

- **必要**：統計分析結果（模型對象、摘要資料）
- **必要**：輸出格式（HTML、PDF、Word）
- **可選**：樣式指南（APA、期刊特定）
- **可選**：表編號方案

## 法

### 第一步：擇表包

| Package | Best for | Formats |
|---------|----------|---------|
| `gt` | HTML, general-purpose | HTML, PDF, Word |
| `kableExtra` | LaTeX/PDF documents | PDF, HTML |
| `flextable` | Word documents | Word, PDF, HTML |
| `gtsummary` | Clinical/statistical summaries | All via gt/flextable |

**得：** 表包依輸出格式與用例而擇。所擇包已裝可載。

**敗則：** 若所需包未裝，行 `install.packages("gt")`（或合適包）。`gtsummary` 則 `gt` 與 `gtsummary` 皆須裝。

### 第二步：描述統計表

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

**得：** `gt` 表對象格式化，均值、SD、計數依類分組。列頭用正統計記號（斜體 *M*、*SD*、*n*）。

**敗則：** 若 `group_by()` 生非預期，驗分組變量存且具預期水準。若 `fmt_number()` 誤，確目標列為數值。

### 第三步：回歸結果表

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

**得：** `gtsummary` 回歸表，p 值粗體、模型擬合統計（R 方、N）於源注、描述題詞。

**敗則：** 若 `tbl_regression()` 敗，驗入為模型對象（如 `lm`、`glm`）。若 `add_glance_source_note()` 誤，察 `broom` 可整理模型：`broom::glance(model)`。

### 第四步：相關矩陣

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

**得：** 下三角相關矩陣以 `gt` 表渲染，上三角空白、兩小數位、清題詞。

**敗則：** 若 `sub_missing()` 未空上三角，驗 `NA` 以 `cor_matrix[upper.tri(cor_matrix)] <- NA` 正設。若變量非數值，`cor()` 敗；先濾為數值列。

### 第五步：ANOVA 表

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

**得：** 格式化 ANOVA 表含 Source、*df*、*SS*、*MS*、*F*、*p* 列。交互項清標，p 值三小數位。

**敗則：** 若 `broom::tidy(aov_result)` 生非預期列，驗模型為 `aov` 對象。若需 III 型平方和，用 `car::Anova(model, type = 3)` 代 base `aov()`。

### 第六步：存表

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

**得：** 表存為所指格式（HTML、Word、PNG、PDF）。輸出檔於適當應用中正開。

**敗則：** 若 `gtsave()` Word 敗，確 `webshot2` 已裝。`kableExtra` PDF 輸出者，確 LaTeX 發行（TinyTeX 或 MiKTeX）已裝。

### 第七步：嵌入 Quarto 文檔

````markdown
```{r}
#| label: tbl-descriptives
#| tbl-cap: "Descriptive Statistics by Group"

gt(descriptives) |>
  fmt_number(columns = c(M, SD), decimals = 2)
```

See @tbl-descriptives for summary statistics.
````

**得：** 表於 Quarto 文檔內渲染，有可交叉引用標籤（`@tbl-*`）與正題詞。表依文檔輸出格式自適應。

**敗則：** 若表不渲染，驗塊標籤始以 `tbl-` 供 Quarto 交叉引用。若 PDF 失格式，由 `gt` 改 `kableExtra` 為 LaTeX 輸出。

## 驗

- [ ] 表於目標格式（HTML、PDF、Word）正渲染
- [ ] 數字格式一致（小數位、對齊）
- [ ] 統計記號合樣式指南（斜體、正符號）
- [ ] 表有清題詞與編號
- [ ] 列頭有意義
- [ ] 注/腳注釋縮寫或顯著標

## 陷

- **gt 於 PDF**：gt PDF 支援有限。重 LaTeX 文檔用 kableExtra
- **舍入不一**：始用 `fmt_number()`（gt）或 `format()`，非 `round()` 於顯示
- **缺值顯示**：gt 以 `sub_missing()` 配置或 `options(knitr.kable.NA = "")`
- **PDF 寬表**：表過頁寬需 `landscape()` 或減字號
- **APA 數字格式**：界於一之值（p 值、相關）無首零：".03" 非 "0.03"

## 參

- `format-apa-report` — APA 手稿中之表
- `create-quarto-report` — 報告中嵌表
- `build-parameterized-report` — 依參數適應之表
