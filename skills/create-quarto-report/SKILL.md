---
name: create-quarto-report
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

Set up and write a reproducible Quarto document for analysis reports, presentations, or websites.

## When to Use

- Creating a reproducible analysis report
- Building a presentation with embedded code
- Generating HTML, PDF, or Word documents from code
- Migrating from R Markdown to Quarto

## Inputs

- **Required**: Report topic and target audience
- **Required**: Output format (html, pdf, docx, revealjs)
- **Optional**: Data sources and analysis code
- **Optional**: Citation bibliography (.bib file)

## Procedure

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

**Expected:** File `report.qmd` exists with valid YAML frontmatter including title, author, date, format configuration, and execution options.

**On failure:** Validate the YAML header by checking for matching `---` delimiters and correct indentation. Ensure `format:` key matches one of the supported Quarto output formats (`html`, `pdf`, `docx`, `revealjs`).

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

**Expected:** Content sections contain properly formatted code chunks with `{r}` language identifier and `#|` chunk options for labels, captions, and dimensions.

**On failure:** Verify code chunks use the ```` ```{r} ```` syntax (not inline backticks), that `#|` options are inside the chunk (not in the YAML header), and that label prefixes match cross-reference types (`fig-` for figures, `tbl-` for tables).

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

**Expected:** Chunk options are applied at the chunk level using `#|` syntax, and labels follow naming conventions required for cross-referencing.

**On failure:** Ensure chunk options use `#|` syntax (Quarto-native), not the legacy `{r, option=value}` R Markdown syntax. Verify that label names contain only alphanumeric characters and hyphens.

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

**Expected:** Cross-references (`@fig-name`, `@tbl-name`) resolve to the correct figures and tables, and citations (`@key`) match entries in the `.bib` file.

**On failure:** Verify that referenced labels exist in code chunks with the correct prefix (`fig-`, `tbl-`). For citations, check that `.bib` keys match exactly (case-sensitive) and that `bibliography:` is set in the YAML header.

### Step 5: Render the Document

```bash
quarto render report.qmd

# Specific format
quarto render report.qmd --to pdf
quarto render report.qmd --to docx

# Preview with live reload
quarto preview report.qmd
```

**Expected:** Output file generated in the specified format.

**On failure:**
- Missing quarto: Install from https://quarto.org/docs/get-started/
- PDF errors: Install TinyTeX with `quarto install tinytex`
- R package errors: Ensure all packages are installed

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

**Expected:** All specified output formats generate successfully, each with correct styling and layout for the target format.

**On failure:** If one format fails while others succeed, check format-specific requirements: PDF needs a LaTeX engine (install with `quarto install tinytex`), DOCX needs a valid reference template if specified, and format-specific YAML options must be correctly nested under each format key.

## Validation

- [ ] Document renders without errors
- [ ] All code chunks execute correctly
- [ ] Cross-references resolve (figures, tables, citations)
- [ ] Table of contents is accurate
- [ ] Output format is appropriate for the audience

## Common Pitfalls

- **Missing label prefix**: Cross-referenceable figures need `fig-` prefix in label, tables need `tbl-`
- **Cache invalidation**: Cached chunks won't re-run when upstream data changes. Delete `_cache/` to force.
- **PDF without LaTeX**: Install TinyTeX or use `format: pdf` with `pdf-engine: weasyprint` for CSS-based PDF
- **R Markdown syntax in Quarto**: Use `#|` chunk options instead of `{r, echo=FALSE}` style

## Related Skills

- `format-apa-report` - APA-formatted academic reports
- `build-parameterized-report` - parameterized multi-report generation
- `generate-statistical-tables` - publication-ready tables
- `write-vignette` - Quarto vignettes in R packages
