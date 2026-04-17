---
name: generate-statistical-tables
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
  locale: ja
  source_locale: en
  source_commit: 902f69ec4eeddf6fdf26df7e988d8deb1a22c387
  translator: claude
  translation_date: "2026-03-17"
---

# 統計表の生成

Create publication-ready statistical tables for reports and manuscripts.

## 使用タイミング

- Creating descriptive statistics tables
- Formatting regression or ANOVA output
- Building correlation matrices
- Producing APA-style tables for academic papers
- Generating tables for Quarto/R Markdown documents

## 入力

- **必須**: Statistical analysis results (model objects, summary data)
- **必須**: Output format (HTML, PDF, Word)
- **任意**: Style guide (APA, journal-specific)
- **任意**: Table numbering scheme

## 手順

### ステップ1: Choose Table Package

| Package | Best for | Formats |
|---------|----------|---------|
| `gt` | HTML, general-purpose | HTML, PDF, Word |
| `kableExtra` | LaTeX/PDF documents | PDF, HTML |
| `flextable` | Word documents | Word, PDF, HTML |
| `gtsummary` | Clinical/statistical summaries | All via gt/flextable |

**期待結果:** A table package selected based on the output format and use case. The chosen package is installed and loadable.

**失敗時:** If the required package is not installed, run `install.packages("gt")` (or the appropriate package). For `gtsummary`, both `gt` and `gtsummary` must be installed.

### ステップ2: Descriptive Statistics Table

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

**期待結果:** A `gt` table object with formatted means, SDs, and counts grouped by category. Column headers use proper statistical notation (italicized *M*, *SD*, *n*).

**失敗時:** If `group_by()` produces unexpected results, verify the grouping variable exists and has the expected levels. If `fmt_number()` throws an error, ensure the target columns contain numeric data.

### ステップ3: Regression Results Table

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

**期待結果:** A `gtsummary` regression table with bolded p-values, model fit statistics (R-squared, N) in a source note, and a descriptive caption.

**失敗時:** If `tbl_regression()` fails, verify the input is a model object (e.g., `lm`, `glm`). If `add_glance_source_note()` errors, check that `broom` can tidy the model: `broom::glance(model)`.

### ステップ4: Correlation Matrix

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

**期待結果:** A lower-triangle correlation matrix rendered as a `gt` table with blanked upper triangle, two decimal places, and a clear caption.

**失敗時:** If `sub_missing()` does not blank the upper triangle, verify that `NA` values were set correctly with `cor_matrix[upper.tri(cor_matrix)] <- NA`. If variables are non-numeric, `cor()` will fail; filter to numeric columns first.

### ステップ5: ANOVA Table

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

**期待結果:** A formatted ANOVA table with Source, *df*, *SS*, *MS*, *F*, and *p* columns. Interaction terms are clearly labeled and p-values are formatted to three decimal places.

**失敗時:** If `broom::tidy(aov_result)` produces unexpected columns, verify the model is an `aov` object. For Type III sums of squares, use `car::Anova(model, type = 3)` instead of base `aov()`.

### ステップ6: Save Tables

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

**期待結果:** Table saved to the specified file format (HTML, Word, PNG, or PDF). The output file opens correctly in the appropriate application.

**失敗時:** If `gtsave()` fails for Word format, ensure the `webshot2` package is installed. For PDF output via `kableExtra`, ensure a LaTeX distribution (TinyTeX or MiKTeX) is installed.

### ステップ7: Embed in Quarto Document

````markdown
```{r}
#| label: tbl-descriptives
#| tbl-cap: "Descriptive Statistics by Group"

gt(descriptives) |>
  fmt_number(columns = c(M, SD), decimals = 2)
```

See @tbl-descriptives for summary statistics.
````

**期待結果:** The table renders inline in the Quarto document with a cross-referenceable label (`@tbl-*`) and a proper caption. The table adapts to the document's output format automatically.

**失敗時:** If the table does not render, verify the chunk label starts with `tbl-` for Quarto cross-referencing. If formatting is lost in PDF, switch from `gt` to `kableExtra` for LaTeX-based output.

## バリデーション

- [ ] Table renders correctly in target format (HTML, PDF, Word)
- [ ] Numbers are formatted consistently (decimal places, alignment)
- [ ] Statistical notation follows the style guide (italicized, proper symbols)
- [ ] Table has a clear caption and numbering
- [ ] Column headers are meaningful
- [ ] Notes/footnotes explain abbreviations or significance markers

## よくある落とし穴

- **gt in PDF**: gt has limited PDF support. Use kableExtra for LaTeX-heavy documents.
- **Rounding inconsistency**: Always use `fmt_number()` (gt) or `format()` rather than `round()` for display
- **Missing values display**: Configure with `sub_missing()` in gt or `options(knitr.kable.NA = "")`
- **Wide tables in PDF**: Tables exceeding page width need `landscape()` or font size reduction
- **APA number formatting**: No leading zero for values bounded by 1 (p-values, correlations): ".03" not "0.03"

## 関連スキル

- `format-apa-report` - tables within APA manuscripts
- `create-quarto-report` - embedding tables in reports
- `build-parameterized-report` - tables that adapt to parameters
