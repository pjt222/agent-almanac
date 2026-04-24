---
name: generate-statistical-tables
locale: caveman
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

# Generate Statistical Tables

Make publication-ready stats tables for reports + manuscripts.

## When Use

- Make descriptive stats tables
- Format regression or ANOVA output
- Build correlation matrices
- Make APA-style tables for academic papers
- Make tables for Quarto/R Markdown docs

## Inputs

- **Required**: Stats analysis results (model objects, summary data)
- **Required**: Output format (HTML, PDF, Word)
- **Optional**: Style guide (APA, journal-specific)
- **Optional**: Table numbering scheme

## Steps

### Step 1: Pick Table Package

| Package | Best for | Formats |
|---------|----------|---------|
| `gt` | HTML, general-purpose | HTML, PDF, Word |
| `kableExtra` | LaTeX/PDF documents | PDF, HTML |
| `flextable` | Word documents | Word, PDF, HTML |
| `gtsummary` | Clinical/statistical summaries | All via gt/flextable |

**Got:** Table package picked by output format + use case. Package installed + loadable.

**If fail:** Package not installed? Run `install.packages("gt")` (or right one). `gtsummary` needs both `gt` + `gtsummary` installed.

### Step 2: Descriptive Statistics Table

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

**Got:** `gt` table object with formatted means, SDs, counts by category. Column headers use proper stats notation (italic *M*, *SD*, *n*).

**If fail:** `group_by()` unexpected? Verify grouping variable exists + has expected levels. `fmt_number()` errors? Target columns must be numeric.

### Step 3: Regression Results Table

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

**Got:** `gtsummary` regression table with bold p-values, model fit stats (R-squared, N) in source note, descriptive caption.

**If fail:** `tbl_regression()` fails? Verify input is model object (`lm`, `glm`). `add_glance_source_note()` errors? Check `broom` can tidy: `broom::glance(model)`.

### Step 4: Correlation Matrix

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

**Got:** Lower-triangle correlation matrix as `gt` table. Upper triangle blank, two decimal places, clear caption.

**If fail:** `sub_missing()` won't blank upper triangle? Verify `NA` set via `cor_matrix[upper.tri(cor_matrix)] <- NA`. Non-numeric variables → `cor()` fails; filter to numeric columns first.

### Step 5: ANOVA Table

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

**Got:** Formatted ANOVA table with Source, *df*, *SS*, *MS*, *F*, *p* columns. Interaction terms labeled, p-values to three decimals.

**If fail:** `broom::tidy(aov_result)` unexpected columns? Verify model = `aov` object. Type III sums of squares → use `car::Anova(model, type = 3)` not base `aov()`.

### Step 6: Save Tables

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

**Got:** Table saved to specified format (HTML, Word, PNG, PDF). Output file opens in right application.

**If fail:** `gtsave()` fails for Word? `webshot2` package needed. PDF output via `kableExtra` → needs LaTeX distribution (TinyTeX or MiKTeX).

### Step 7: Embed in Quarto Document

````markdown
```{r}
#| label: tbl-descriptives
#| tbl-cap: "Descriptive Statistics by Group"

gt(descriptives) |>
  fmt_number(columns = c(M, SD), decimals = 2)
```

See @tbl-descriptives for summary statistics.
````

**Got:** Table renders inline in Quarto doc, cross-reference label (`@tbl-*`), proper caption. Table adapts to document output format automatically.

**If fail:** Table won't render? Chunk label must start with `tbl-` for Quarto cross-ref. Formatting lost in PDF → switch from `gt` to `kableExtra` for LaTeX output.

## Checks

- [ ] Table renders correct in target format (HTML, PDF, Word)
- [ ] Numbers formatted consistent (decimals, alignment)
- [ ] Stats notation follows style guide (italicized, proper symbols)
- [ ] Table has clear caption + numbering
- [ ] Column headers meaningful
- [ ] Notes/footnotes explain abbreviations + significance markers

## Pitfalls

- **gt in PDF**: gt has limited PDF support. Use kableExtra for LaTeX-heavy docs.
- **Rounding inconsistency**: Always use `fmt_number()` (gt) or `format()` not `round()` for display
- **Missing values display**: Set with `sub_missing()` in gt or `options(knitr.kable.NA = "")`
- **Wide tables in PDF**: Tables over page width need `landscape()` or smaller font
- **APA number formatting**: No leading zero for values bounded by 1 (p-values, correlations): ".03" not "0.03"

## See Also

- `format-apa-report` - tables in APA manuscripts
- `create-quarto-report` - embed tables in reports
- `build-parameterized-report` - tables that adapt to parameters
