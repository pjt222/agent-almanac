---
name: build-parameterized-report
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

Create reports that accept parameters to generate multiple customized variations from a single template.

## When to Use

- Generating the same report for different departments, regions, or time periods
- Creating client-specific reports from a template
- Building dashboards that filter to specific subsets
- Automating recurring reports with different inputs

## Inputs

- **Required**: Report template (Quarto or R Markdown)
- **Required**: Parameter definitions (names, types, defaults)
- **Optional**: List of parameter values for batch generation
- **Optional**: Output directory for generated reports

## Procedure

### Step 1: Define Parameters in YAML

For Quarto (`report.qmd`):

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

For R Markdown (`report.Rmd`):

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

**Expected:** The YAML header contains a `params:` block with named parameters, each having a default value of the correct type.

**On failure:** If rendering fails with "object 'params' not found", ensure the `params:` block is correctly indented under the YAML frontmatter. For Quarto, `params` must be at the top level of the YAML, not nested under `format:`.

### Step 2: Use Parameters in Code

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

**Expected:** Code chunks reference parameters via `params$name` and conditional chunks use `#| eval: !expr params$flag` for Quarto. Inline R expressions like `` `r params$region` `` render dynamic text.

**On failure:** If `params$name` returns NULL, verify the parameter name matches exactly between the YAML definition and the code reference (case-sensitive). Check that default values are the correct type.

### Step 3: Render with Custom Parameters

Single render:

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

**Expected:** A single report renders successfully with custom parameter values overriding the YAML defaults. The output file is created at the specified path.

**On failure:** If Quarto render fails, check that `quarto` CLI is installed and on PATH. If R Markdown render fails, verify `rmarkdown` is installed. Ensure parameter names in `execute_params` (Quarto) or `params` (R Markdown) match the YAML definitions exactly.

### Step 4: Batch Render Multiple Reports

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

**Expected:** One HTML file per region-year combination.

**On failure:** Check that parameter names match exactly between YAML and code. Ensure all parameter values are valid.

### Step 5: Add Parameter Validation

```r
#| label: validate-params

stopifnot(
  "Region must be a valid region" = params$region %in% valid_regions,
  "Year must be numeric" = is.numeric(params$year),
  "Year must be reasonable" = params$year >= 2020 && params$year <= 2030
)
```

**Expected:** The validation code chunk runs at the start of each render and stops with an informative error if any parameter is out of range or the wrong type.

**On failure:** If `stopifnot()` produces unhelpful error messages, switch to explicit `if (!cond) stop("message")` calls for clearer diagnostics.

### Step 6: Organize Output

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

**Expected:** Output files are written to a date-stamped subdirectory with descriptive names (e.g., `reports/2025-06/report-europe.html`).

**On failure:** If `dir.create()` fails, check that the parent directory exists and is writable. On Windows, verify the path length does not exceed 260 characters.

## Validation

- [ ] Report renders with default parameters
- [ ] Report renders with each set of custom parameters
- [ ] Parameters are validated before processing
- [ ] Output files are named descriptively
- [ ] Conditional sections render correctly based on parameters
- [ ] Batch generation completes for all combinations

## Common Pitfalls

- **Parameter name mismatch**: YAML names must exactly match `params$name` references in code
- **Type coercion**: YAML may parse `year: 2025` as integer but code expects character. Be explicit.
- **Conditional evaluation**: Use `#| eval: !expr params$flag` not `eval = params$flag` in Quarto
- **File overwriting**: Without unique output names, each render overwrites the previous
- **Memory in batch mode**: Long batch runs may accumulate memory. Consider using `callr::r()` for isolation.

## Related Skills

- `create-quarto-report` - base Quarto document setup
- `generate-statistical-tables` - tables that adapt to parameters
- `format-apa-report` - parameterized academic reports
