---
name: generate-statistical-tables
locale: wenyan-lite
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

為報告與手稿建可發表之統計表。

## 適用時機

- 建描述統計表
- 格式化迴歸或 ANOVA 輸出
- 建相關矩陣
- 為學術論文生 APA 風格表
- 為 Quarto/R Markdown 文件生表

## 輸入

- **必要**：統計分析結果（模型物件、摘要資料）
- **必要**：輸出格式（HTML、PDF、Word）
- **選擇性**：風格指引（APA、特定期刊）
- **選擇性**：表編號方案

## 步驟

### 步驟一：擇表格套件

| 套件 | 宜於 | 格式 |
|---------|----------|---------|
| `gt` | HTML、通用 | HTML、PDF、Word |
| `kableExtra` | LaTeX/PDF 文件 | PDF、HTML |
| `flextable` | Word 文件 | Word、PDF、HTML |
| `gtsummary` | 臨床/統計摘要 | 皆經 gt/flextable |

**預期：** 依輸出格式與用例擇一表格套件。所擇套件已裝可載。

**失敗時：** 若所需套件未裝，執行 `install.packages("gt")`（或合宜套件）。用 `gtsummary` 須 `gt` 與 `gtsummary` 皆裝。

### 步驟二：描述統計表

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

**預期：** `gt` 表物件，含依類別分組之格式化均值、SD 與計數。欄首用正確統計標記（斜體 *M*、*SD*、*n*）。

**失敗時：** 若 `group_by()` 產意外結果，驗分組變數存且有預期層級。若 `fmt_number()` 拋錯，確目標欄含數值資料。

### 步驟三：迴歸結果表

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

**預期：** `gtsummary` 迴歸表，p 值粗體，模型擬合統計（R 平方、N）於源註中，附描述性標題。

**失敗時：** 若 `tbl_regression()` 失敗，驗輸入為模型物件（如 `lm`、`glm`）。若 `add_glance_source_note()` 錯，核 `broom` 可整理模型：`broom::glance(model)`。

### 步驟四：相關矩陣

```r
library(gt)

cor_matrix <- cor(data[, c("var1", "var2", "var3", "var4")],
                  use = "pairwise.complete.obs")

# 格式化下三角
cor_matrix[upper.tri(cor_matrix)] <- NA

as.data.frame(cor_matrix) |>
  tibble::rownames_to_column("Variable") |>
  gt() |>
  fmt_number(decimals = 2) |>
  sub_missing(missing_text = "") |>
  tab_header(title = "Table 3", subtitle = "Correlation Matrix")
```

**預期：** 下三角相關矩陣以 `gt` 表渲染，上三角留空，二位小數，附清晰標題。

**失敗時：** 若 `sub_missing()` 未空上三角，驗 `NA` 值正確設為 `cor_matrix[upper.tri(cor_matrix)] <- NA`。若變數非數值，`cor()` 將失敗；先篩選數值欄。

### 步驟五：ANOVA 表

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

**預期：** 格式化之 ANOVA 表含 Source、*df*、*SS*、*MS*、*F* 與 *p* 欄。交互作用項清楚標示，p 值格式為三位小數。

**失敗時：** 若 `broom::tidy(aov_result)` 產意外欄，驗模型為 `aov` 物件。欲 III 型平方和，用 `car::Anova(model, type = 3)` 替代原生 `aov()`。

### 步驟六：存表

```r
# 存為 HTML
gtsave(my_table, "table1.html")

# 存為 Word
gtsave(my_table, "table1.docx")

# 存為 PNG 圖
gtsave(my_table, "table1.png")

# 為 LaTeX/PDF（kableExtra）
kableExtra::save_kable(kable_table, "table1.pdf")
```

**預期：** 表存於指定檔格式（HTML、Word、PNG 或 PDF）。輸出檔於合宜應用中正確開啟。

**失敗時：** 若 `gtsave()` 於 Word 格式失敗，確 `webshot2` 套件已裝。經 `kableExtra` 之 PDF 輸出須 LaTeX 發行版（TinyTeX 或 MiKTeX）已裝。

### 步驟七：嵌於 Quarto 文件

````markdown
```{r}
#| label: tbl-descriptives
#| tbl-cap: "Descriptive Statistics by Group"

gt(descriptives) |>
  fmt_number(columns = c(M, SD), decimals = 2)
```

See @tbl-descriptives for summary statistics.
````

**預期：** 表於 Quarto 文件中就地渲染，附可交叉參考之標籤（`@tbl-*`）與合宜標題。表自動適應文件輸出格式。

**失敗時：** 若表未渲染，驗段標籤以 `tbl-` 始以便 Quarto 交叉參考。若 PDF 失格式，從 `gt` 改 `kableExtra` 以利 LaTeX 輸出。

## 驗證

- [ ] 表於目標格式（HTML、PDF、Word）中正確渲染
- [ ] 數字格式一致（小數位、對齊）
- [ ] 統計標記依風格指引（斜體、正確符號）
- [ ] 表有清晰標題與編號
- [ ] 欄首有意義
- [ ] 註腳解釋縮寫或顯著性標記

## 常見陷阱

- **PDF 中之 gt**：gt 之 PDF 支援有限。LaTeX 重文件用 kableExtra。
- **四捨五入不一致**：顯示永用 `fmt_number()`（gt）或 `format()` 而非 `round()`
- **缺失值顯示**：於 gt 以 `sub_missing()` 設或 `options(knitr.kable.NA = "")`
- **PDF 中寬表**：超頁寬之表須 `landscape()` 或字體縮小
- **APA 數字格式**：界限為一之值（p 值、相關）無前導零：".03" 非 "0.03"

## 相關技能

- `format-apa-report` - APA 手稿中之表
- `create-quarto-report` - 於報告中嵌表
- `build-parameterized-report` - 適應參數之表
