---
name: generate-statistical-tables
locale: caveman-ultra
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

Pub-ready stat tables for reports + manuscripts.

## Use When

- Descriptive stats tables
- Regression / ANOVA output format
- Correlation matrices
- APA-style academic
- Quarto / R Markdown tables

## In

- **Required**: stat results (models, summaries)
- **Required**: out format (HTML, PDF, Word)
- **Optional**: style guide (APA, journal)
- **Optional**: numbering scheme

## Do

### Step 1: Choose pkg

| Package | Best for | Formats |
|---------|----------|---------|
| `gt` | HTML, general-purpose | HTML, PDF, Word |
| `kableExtra` | LaTeX/PDF documents | PDF, HTML |
| `flextable` | Word documents | Word, PDF, HTML |
| `gtsummary` | Clinical/statistical summaries | All via gt/flextable |

→ Pkg selected by format + use case, installed + loadable.

**If err:** missing → `install.packages("gt")` (or proper). `gtsummary` needs `gt` + `gtsummary`.

### Step 2: Descriptive stats

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

→ `gt` object w/ M, SD, n grouped, italic headers.

**If err:** `group_by()` unexpected → verify var + levels. `fmt_number()` err → numeric cols.

### Step 3: Regression results

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

→ Regression table w/ bold p, fit stats note, caption.

**If err:** `tbl_regression()` fail → verify model obj (lm, glm). `add_glance_source_note()` err → check `broom::glance(model)`.

### Step 4: Correlation matrix

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

→ Lower-triangle cor matrix w/ blanked upper, 2 dec, caption.

**If err:** `sub_missing()` not blanking → check NA set. Non-numeric → `cor()` fails → filter numeric.

### Step 5: ANOVA table

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

→ ANOVA w/ Source, df, SS, MS, F, p. Interactions labeled, p to 3 dec.

**If err:** `broom::tidy(aov_result)` unexpected cols → verify aov obj. Type III SS → `car::Anova(model, type = 3)`.

### Step 6: Save

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

→ Saved to format. Opens correctly.

**If err:** `gtsave()` Word fail → install `webshot2`. PDF via kableExtra → install TinyTeX/MiKTeX.

### Step 7: Embed in Quarto

````markdown
```{r}
#| label: tbl-descriptives
#| tbl-cap: "Descriptive Statistics by Group"

gt(descriptives) |>
  fmt_number(columns = c(M, SD), decimals = 2)
```

See @tbl-descriptives for summary statistics.
````

→ Renders inline w/ `@tbl-*` cross-ref + caption. Adapts to format.

**If err:** no render → chunk label `tbl-` prefix. PDF formatting lost → switch gt → kableExtra.

## Check

- [ ] Renders in target format
- [ ] Consistent number format
- [ ] Stat notation per style (italic, symbols)
- [ ] Clear caption + numbering
- [ ] Meaningful headers
- [ ] Notes/footnotes explain abbrevs + sig markers

## Traps

- **gt in PDF**: limited. Use kableExtra for LaTeX.
- **Rounding inconsistency**: `fmt_number()` (gt) / `format()` not `round()`.
- **Missing values**: `sub_missing()` (gt) or `options(knitr.kable.NA = "")`.
- **Wide PDF**: `landscape()` or font reduction.
- **APA number**: no leading zero when ≤1 (p, corr): ".03" not "0.03".

## →

- `format-apa-report` — APA manuscript tables
- `create-quarto-report` — embed in reports
- `build-parameterized-report` — param-adaptive tables
