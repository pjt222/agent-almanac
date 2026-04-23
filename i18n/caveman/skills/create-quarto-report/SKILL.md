---
name: create-quarto-report
locale: caveman
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

Set up and write reproducible Quarto document for analysis reports, presentations, websites.

## When Use

- Making reproducible analysis report
- Building presentation with embedded code
- Generating HTML, PDF, Word documents from code
- Migrating from R Markdown to Quarto

## Inputs

- **Required**: Report topic and target audience
- **Required**: Output format (html, pdf, docx, revealjs)
- **Optional**: Data sources and analysis code
- **Optional**: Citation bibliography (.bib file)

## Steps

### Step 1: Create Quarto Document

Create `report.qmd`:

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

**Got:** File `report.qmd` exists with valid YAML frontmatter: title, author, date, format config, execution options.

**If fail:** Validate YAML header. Check matching `---` delimiters and right indentation. Confirm `format:` key matches supported Quarto output formats (`html`, `pdf`, `docx`, `revealjs`).

### Step 2: Write Content with Code Chunks

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

**Got:** Content sections have properly formatted code chunks with `{r}` language identifier and `#|` chunk options for labels, captions, dimensions.

**If fail:** Verify code chunks use ```` ```{r} ```` syntax (not inline backticks). Confirm `#|` options inside chunk (not in YAML header). Label prefixes match cross-reference types (`fig-` for figures, `tbl-` for tables).

### Step 3: Configure Chunk Options

Common chunk-level options (use `#|` syntax):

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

**Got:** Chunk options applied at chunk level using `#|` syntax. Labels follow naming rules for cross-referencing.

**If fail:** Ensure chunk options use `#|` syntax (Quarto-native), not legacy `{r, option=value}` R Markdown syntax. Verify label names have only alphanumeric characters and hyphens.

### Step 4: Add Cross-References and Citations

```markdown
See @fig-scatter for the visualization and @tbl-summary for statistics.

This approach follows @smith2023 methodology.

::: {#fig-combined layout-ncol=2}
![Plot A](plot_a.png){#fig-plotA}
![Plot B](plot_b.png){#fig-plotB}

Combined figure caption
:::
```

**Got:** Cross-references (`@fig-name`, `@tbl-name`) resolve to right figures and tables. Citations (`@key`) match entries in `.bib` file.

**If fail:** Verify referenced labels exist in code chunks with right prefix (`fig-`, `tbl-`). For citations, check `.bib` keys match exactly (case-sensitive) and `bibliography:` is set in YAML header.

### Step 5: Render the Document

```bash
quarto render report.qmd

# Specific format
quarto render report.qmd --to pdf
quarto render report.qmd --to docx

# Preview with live reload
quarto preview report.qmd
```

**Got:** Output file made in right format.

**If fail:**
- Missing quarto: Install from https://quarto.org/docs/get-started/
- PDF errors: Install TinyTeX with `quarto install tinytex`
- R package errors: Confirm all packages installed

### Step 6: Multi-Format Output

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

Render all formats: `quarto render report.qmd`

**Got:** All specified output formats generate fine. Each has right styling and layout for target format.

**If fail:** One format fails, others succeed? Check format-specific requirements: PDF needs LaTeX engine (install with `quarto install tinytex`), DOCX needs valid reference template if specified, format-specific YAML options must nest under each format key.

## Checks

- [ ] Document renders without errors
- [ ] All code chunks execute fine
- [ ] Cross-references resolve (figures, tables, citations)
- [ ] Table of contents accurate
- [ ] Output format fits audience

## Pitfalls

- **Missing label prefix**: Cross-referenceable figures need `fig-` prefix in label, tables need `tbl-`
- **Cache invalidation**: Cached chunks won't re-run when upstream data changes. Delete `_cache/` to force.
- **PDF without LaTeX**: Install TinyTeX or use `format: pdf` with `pdf-engine: weasyprint` for CSS-based PDF
- **R Markdown syntax in Quarto**: Use `#|` chunk options instead of `{r, echo=FALSE}` style

## See Also

- `format-apa-report` - APA-formatted academic reports
- `build-parameterized-report` - parameterized multi-report generation
- `generate-statistical-tables` - publication-ready tables
- `write-vignette` - Quarto vignettes in R packages
