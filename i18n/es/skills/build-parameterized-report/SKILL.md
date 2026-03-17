---
name: build-parameterized-report
description: >
  Crear informes parametrizados en Quarto o R Markdown que pueden renderizarse
  con diferentes entradas para generar múltiples variaciones. Cubre definiciones
  de parámetros, renderizado programático y generación por lotes. Usar al
  generar el mismo informe para diferentes departamentos, regiones o períodos
  de tiempo; crear informes específicos por cliente desde una plantilla;
  construir dashboards que filtren subconjuntos específicos; o automatizar
  informes recurrentes con entradas variables.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: reporting
  complexity: intermediate
  language: R
  tags: quarto, parameterized, batch, automation, reporting
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# Construir Informe Parametrizado

Crear informes que aceptan parámetros para generar múltiples variaciones personalizadas desde una sola plantilla.

## Cuándo Usar

- Generar el mismo informe para diferentes departamentos, regiones o períodos de tiempo
- Crear informes específicos por cliente desde una plantilla
- Construir dashboards que filtren subconjuntos específicos
- Automatizar informes recurrentes con diferentes entradas

## Entradas

- **Requerido**: Plantilla de informe (Quarto o R Markdown)
- **Requerido**: Definiciones de parámetros (nombres, tipos, valores por defecto)
- **Opcional**: Lista de valores de parámetros para generación por lotes
- **Opcional**: Directorio de salida para los informes generados

## Procedimiento

### Paso 1: Definir Parámetros en YAML

Para Quarto (`report.qmd`):

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

Para R Markdown (`report.Rmd`):

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

**Esperado:** El encabezado YAML contiene un bloque `params:` con parámetros nombrados, cada uno con un valor por defecto del tipo correcto.

**En caso de fallo:** Si el renderizado falla con "object 'params' not found", asegurar que el bloque `params:` esté correctamente indentado bajo el frontmatter YAML. Para Quarto, `params` debe estar en el nivel superior del YAML, no anidado bajo `format:`.

### Paso 2: Usar Parámetros en el Código

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

**Esperado:** Los bloques de código referencian parámetros mediante `params$name` y los bloques condicionales usan `#| eval: !expr params$flag` para Quarto. Las expresiones R en línea como `` `r params$region` `` renderizan texto dinámico.

**En caso de fallo:** Si `params$name` devuelve NULL, verificar que el nombre del parámetro coincida exactamente entre la definición YAML y la referencia en el código (sensible a mayúsculas). Verificar que los valores por defecto sean del tipo correcto.

### Paso 3: Renderizar con Parámetros Personalizados

Renderizado individual:

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

**Esperado:** Un solo informe se renderiza exitosamente con valores de parámetros personalizados que anulan los valores por defecto del YAML. El archivo de salida se crea en la ruta especificada.

**En caso de fallo:** Si el renderizado de Quarto falla, verificar que la CLI `quarto` esté instalada y en el PATH. Si el renderizado de R Markdown falla, verificar que `rmarkdown` esté instalado. Asegurar que los nombres de parámetros en `execute_params` (Quarto) o `params` (R Markdown) coincidan exactamente con las definiciones YAML.

### Paso 4: Renderizar Múltiples Informes por Lotes

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

**Esperado:** Un archivo HTML por cada combinación región-año.

**En caso de fallo:** Verificar que los nombres de parámetros coincidan exactamente entre YAML y código. Asegurar que todos los valores de parámetros sean válidos.

### Paso 5: Agregar Validación de Parámetros

```r
#| label: validate-params

stopifnot(
  "Region must be a valid region" = params$region %in% valid_regions,
  "Year must be numeric" = is.numeric(params$year),
  "Year must be reasonable" = params$year >= 2020 && params$year <= 2030
)
```

**Esperado:** El bloque de código de validación se ejecuta al inicio de cada renderizado y se detiene con un error informativo si algún parámetro está fuera de rango o tiene el tipo incorrecto.

**En caso de fallo:** Si `stopifnot()` produce mensajes de error poco útiles, cambiar a llamadas explícitas `if (!cond) stop("message")` para diagnósticos más claros.

### Paso 6: Organizar la Salida

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

**Esperado:** Los archivos de salida se escriben en un subdirectorio con fecha y nombres descriptivos (p. ej., `reports/2025-06/report-europe.html`).

**En caso de fallo:** Si `dir.create()` falla, verificar que el directorio padre exista y sea escribible. En Windows, verificar que la longitud de la ruta no exceda 260 caracteres.

## Validación

- [ ] El informe se renderiza con parámetros por defecto
- [ ] El informe se renderiza con cada conjunto de parámetros personalizados
- [ ] Los parámetros se validan antes del procesamiento
- [ ] Los archivos de salida tienen nombres descriptivos
- [ ] Las secciones condicionales se renderizan correctamente según los parámetros
- [ ] La generación por lotes se completa para todas las combinaciones

## Errores Comunes

- **Discrepancia en nombres de parámetros**: Los nombres YAML deben coincidir exactamente con las referencias `params$name` en el código
- **Coerción de tipos**: YAML puede interpretar `year: 2025` como entero pero el código espera carácter. Ser explícito.
- **Evaluación condicional**: Usar `#| eval: !expr params$flag` no `eval = params$flag` en Quarto
- **Sobrescritura de archivos**: Sin nombres de salida únicos, cada renderizado sobrescribe el anterior
- **Memoria en modo por lotes**: Las ejecuciones largas por lotes pueden acumular memoria. Considerar usar `callr::r()` para aislamiento.

## Habilidades Relacionadas

- `create-quarto-report` - configuración básica de documentos Quarto
- `generate-statistical-tables` - tablas que se adaptan a parámetros
- `format-apa-report` - informes académicos parametrizados
