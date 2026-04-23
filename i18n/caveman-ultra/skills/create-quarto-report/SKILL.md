---
name: create-quarto-report
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Create a Quarto document for reproducible reports, presentations, or
  websites. Covers YAML configuration, code chunk options, output
  formats, cross-references, and rendering. Use when creating a
  reproducible analysis report, building a presentation with embedded
  code, generating HTML, PDF, or Word documents from code, or migrating
  an existing R Markdown document to Quarto.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: reporting
  complexity: basic
  language: R
  tags: quarto, report, reproducible, rmarkdown, publishing
---

# Create Quarto Report

Repro Quarto doc → reports / presentations / websites.

## Use When

- Repro analysis report
- Presentation w/ embedded code
- Gen HTML/PDF/Word from code
- Migrate R Markdown → Quarto

## In

- **Required**: Topic + audience
- **Required**: Out fmt (html, pdf, docx, revealjs)
- **Optional**: Data + analysis code
- **Optional**: Bib (.bib)

## Do

### Step 1: Create Doc

`report.qmd`:

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

**Got:** `report.qmd` exists w/ valid YAML (title, author, date, format, exec).

**If err:** Validate YAML header — `---` delimiters match, indent correct. `format:` = supported (`html`, `pdf`, `docx`, `revealjs`).

### Step 2: Content + Chunks

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

**Got:** Sections w/ `{r}` chunks + `#|` opts (labels, captions, dims).

**If err:** Verify ```` ```{r} ```` syntax (not inline). `#|` inside chunk (not YAML). Label prefix matches xref type (`fig-`, `tbl-`).

### Step 3: Chunk Opts

Common (`#|`):

```
#| label: chunk-name        # Required for cross-references
#| echo: false               # Hide code
#| eval: false               # Show but don't run
#| output: false             # Run but hide output
#| fig-width: 8              # Figure dimensions
#| fig-height: 6
#| fig-cap: "Caption text"   # Enable @fig-name references
#| tbl-cap: "Caption text"   # Enable @tbl-name references
#| cache: true               # Cache expensive computations
```

**Got:** Opts via `#|` syntax, labels = xref naming conv.

**If err:** `#|` (Quarto-native), not legacy `{r, option=value}`. Labels alphanumeric + hyphens only.

### Step 4: Xrefs + Citations

```markdown
See @fig-scatter for the visualization and @tbl-summary for statistics.

This approach follows @smith2023 methodology.

::: {#fig-combined layout-ncol=2}
![Plot A](plot_a.png){#fig-plotA}
![Plot B](plot_b.png){#fig-plotB}

Combined figure caption
:::
```

**Got:** Xrefs (`@fig-name`, `@tbl-name`) resolve. Citations (`@key`) match `.bib`.

**If err:** Verify labels exist w/ correct prefix (`fig-`, `tbl-`). `.bib` keys exact (case-sensitive). `bibliography:` in YAML.

### Step 5: Render

```bash
quarto render report.qmd

# Specific format
quarto render report.qmd --to pdf
quarto render report.qmd --to docx

# Preview with live reload
quarto preview report.qmd
```

**Got:** Out file in fmt.

**If err:**
- No quarto → install https://quarto.org/docs/get-started/
- PDF err → `quarto install tinytex`
- R pkg err → install

### Step 6: Multi-Fmt Out

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

Render all: `quarto render report.qmd`

**Got:** All fmts gen, correct styling per target.

**If err:** 1 fail, others OK → check fmt-specific. PDF → LaTeX engine (`quarto install tinytex`). DOCX → valid ref template if set. Fmt opts nested under each format key.

## Check

- [ ] Renders no err
- [ ] All chunks execute
- [ ] Xrefs resolve (fig, tbl, cite)
- [ ] TOC accurate
- [ ] Out fmt fits audience

## Traps

- **No label prefix**: Fig xref needs `fig-`, tbl needs `tbl-`
- **Cache invalid**: Cached chunks don't re-run on upstream change. Delete `_cache/` → force.
- **PDF no LaTeX**: Install TinyTeX OR `pdf-engine: weasyprint` (CSS-based)
- **RMD syntax in Quarto**: Use `#|` not `{r, echo=FALSE}`

## →

- `format-apa-report` — APA academic reports
- `build-parameterized-report` — param multi-reports
- `generate-statistical-tables` — pub-ready tables
- `write-vignette` — Quarto vignettes in R pkgs
