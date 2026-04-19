---
name: build-parameterized-report
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Create parameterized Quarto or R Markdown reports that can be rendered
  with different inputs to generate multiple variations. Covers parameter
  definitions, programmatic rendering, and batch generation. Use when
  generating the same report for different departments, regions, or time
  periods; creating client-specific reports from a single template;
  building dashboards that filter to specific subsets; or automating
  recurring reports with varying inputs.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: reporting
  complexity: intermediate
  language: R
  tags: quarto, parameterized, batch, automation, reporting
---

# Build Parameterized Report

Reports that accept params → many customized variations from single template.

## Use When

- Same report for diff depts, regions, time periods
- Client-specific reports from template
- Dashboards filtered to specific subsets
- Recurring reports w/ diff ins

## In

- **Required**: Report template (Quarto or R Markdown)
- **Required**: Param defs (names, types, defaults)
- **Optional**: Param values list for batch
- **Optional**: Out dir for generated reports

## Do

### Step 1: Define Params in YAML

Quarto (`report.qmd`):

```yaml
---
title: "Sales Report: `r params$region`"
params:
  region: "North America"
  year: 2025
  include_forecast: true
format:
  html:
    toc: true
---
```

R Markdown (`report.Rmd`):

```yaml
---
title: "Sales Report"
params:
  region: "North America"
  year: 2025
  include_forecast: true
output: html_document
---
```

**→** YAML header has `params:` block w/ named params, each w/ default of correct type.

**If err:** Render fails w/ "object 'params' not found" → ensure `params:` block indented correctly under YAML frontmatter. Quarto: `params` at top level, not nested under `format:`.

### Step 2: Use Params in Code

````markdown
```{r}
#| label: filter-data

data <- full_dataset |>
  filter(region == params$region, year == params$year)

nrow(data)
```

## Overview for `r params$region`

This report covers the `r params$region` region for `r params$year`.

```{r}
#| label: forecast
#| eval: !expr params$include_forecast

# This chunk only runs when include_forecast is TRUE
forecast_model <- forecast::auto.arima(data$sales)
forecast::autoplot(forecast_model)
```
````

**→** Chunks ref params via `params$name`, conditional chunks use `#| eval: !expr params$flag` for Quarto. Inline R expressions like `` `r params$region` `` render dynamic text.

**If err:** `params$name` returns NULL → verify name matches exactly YAML ↔ code ref (case-sensitive). Check default values correct type.

### Step 3: Render w/ Custom Params

Single:

```r
# Quarto
quarto::quarto_render(
  "report.qmd",
  execute_params = list(region = "Europe", year = 2025)
)

# R Markdown
rmarkdown::render(
  "report.Rmd",
  params = list(region = "Europe", year = 2025),
  output_file = "report-europe-2025.html"
)
```

**→** Single report renders w/ custom params overriding YAML defaults. Out file at specified path.

**If err:** Quarto fails → check `quarto` CLI installed + on PATH. R Markdown fails → verify `rmarkdown` installed. Param names in `execute_params` (Quarto) or `params` (R Markdown) match YAML defs exactly.

### Step 4: Batch Render

```r
regions <- c("North America", "Europe", "Asia Pacific", "Latin America")
years <- c(2024, 2025)

# Generate all combinations
combinations <- expand.grid(region = regions, year = years, stringsAsFactors = FALSE)

# Render each
purrr::pwalk(combinations, function(region, year) {
  output_name <- sprintf("report-%s-%d.html",
    tolower(gsub(" ", "-", region)), year)

  quarto::quarto_render(
    "report.qmd",
    execute_params = list(region = region, year = year),
    output_file = output_name
  )
})
```

**→** One HTML per region-year combination.

**If err:** Check param names match exactly YAML ↔ code. Ensure all values valid.

### Step 5: Param Validation

```r
#| label: validate-params

stopifnot(
  "Region must be a valid region" = params$region %in% valid_regions,
  "Year must be numeric" = is.numeric(params$year),
  "Year must be reasonable" = params$year >= 2020 && params$year <= 2030
)
```

**→** Validation chunk runs at start of each render, stops w/ informative err if param out of range or wrong type.

**If err:** `stopifnot()` unhelpful msgs → switch to explicit `if (!cond) stop("message")` for clearer diagnostics.

### Step 6: Organize Out

```r
# Create output directory
output_dir <- file.path("reports", format(Sys.Date(), "%Y-%m"))
dir.create(output_dir, recursive = TRUE, showWarnings = FALSE)

# Render with output path
quarto::quarto_render(
  "report.qmd",
  execute_params = list(region = region),
  output_file = file.path(output_dir, paste0("report-", region, ".html"))
)
```

**→** Out files to date-stamped subdir w/ descriptive names (e.g., `reports/2025-06/report-europe.html`).

**If err:** `dir.create()` fails → check parent dir exists + writable. Windows: verify path length ≤ 260 chars.

## Check

- [ ] Renders w/ default params
- [ ] Renders w/ each custom set
- [ ] Params validated before processing
- [ ] Out files named descriptively
- [ ] Conditional sections render based on params
- [ ] Batch completes for all combinations

## Traps

- **Name mismatch**: YAML names must exactly match `params$name` in code
- **Type coercion**: YAML may parse `year: 2025` as int but code expects char. Be explicit
- **Conditional eval**: Use `#| eval: !expr params$flag` not `eval = params$flag` in Quarto
- **File overwriting**: No unique names → each render overwrites prev
- **Memory in batch**: Long batches accumulate mem. Use `callr::r()` for isolation

## →

- `create-quarto-report` — base Quarto doc setup
- `generate-statistical-tables` — tables that adapt to params
- `format-apa-report` — parameterized academic reports
