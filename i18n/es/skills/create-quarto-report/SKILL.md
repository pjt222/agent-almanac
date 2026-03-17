---
name: create-quarto-report
description: >
  Crear un documento Quarto para informes reproducibles, presentaciones o
  sitios web. Cubre configuración YAML, opciones de bloques de código, formatos
  de salida, referencias cruzadas y renderizado. Usar al crear un informe de
  análisis reproducible, construir una presentación con código integrado,
  generar documentos HTML, PDF o Word desde código, o migrar un documento
  R Markdown existente a Quarto.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: reporting
  complexity: basic
  language: R
  tags: quarto, report, reproducible, rmarkdown, publishing
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# Crear Informe Quarto

Configurar y escribir un documento Quarto reproducible para informes de análisis, presentaciones o sitios web.

## Cuándo Usar

- Crear un informe de análisis reproducible
- Construir una presentación con código integrado
- Generar documentos HTML, PDF o Word desde código
- Migrar de R Markdown a Quarto

## Entradas

- **Requerido**: Tema del informe y audiencia objetivo
- **Requerido**: Formato de salida (html, pdf, docx, revealjs)
- **Opcional**: Fuentes de datos y código de análisis
- **Opcional**: Bibliografía de citas (archivo .bib)

## Procedimiento

### Paso 1: Crear Documento Quarto

Crear `report.qmd`:

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

**Esperado:** El archivo `report.qmd` existe con frontmatter YAML válido incluyendo título, autor, fecha, configuración de formato y opciones de ejecución.

**En caso de fallo:** Validar el encabezado YAML verificando los delimitadores `---` coincidentes y la indentación correcta. Asegurar que la clave `format:` coincida con uno de los formatos de salida soportados por Quarto (`html`, `pdf`, `docx`, `revealjs`).

### Paso 2: Escribir Contenido con Bloques de Código

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

**Esperado:** Las secciones de contenido contienen bloques de código correctamente formateados con identificador de lenguaje `{r}` y opciones de bloque `#|` para etiquetas, subtítulos y dimensiones.

**En caso de fallo:** Verificar que los bloques de código usen la sintaxis ```` ```{r} ```` (no comillas invertidas en línea), que las opciones `#|` estén dentro del bloque (no en el encabezado YAML), y que los prefijos de etiqueta coincidan con los tipos de referencia cruzada (`fig-` para figuras, `tbl-` para tablas).

### Paso 3: Configurar Opciones de Bloque

Opciones comunes a nivel de bloque (usar sintaxis `#|`):

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

**Esperado:** Las opciones de bloque se aplican a nivel de bloque usando la sintaxis `#|`, y las etiquetas siguen las convenciones de nomenclatura requeridas para referencias cruzadas.

**En caso de fallo:** Asegurar que las opciones de bloque usen la sintaxis `#|` (nativa de Quarto), no la sintaxis heredada de R Markdown `{r, option=value}`. Verificar que los nombres de etiqueta contengan solo caracteres alfanuméricos y guiones.

### Paso 4: Agregar Referencias Cruzadas y Citas

```markdown
See @fig-scatter for the visualization and @tbl-summary for statistics.

This approach follows @smith2023 methodology.

::: {#fig-combined layout-ncol=2}
![Plot A](plot_a.png){#fig-plotA}
![Plot B](plot_b.png){#fig-plotB}

Combined figure caption
:::
```

**Esperado:** Las referencias cruzadas (`@fig-name`, `@tbl-name`) se resuelven a las figuras y tablas correctas, y las citas (`@key`) coinciden con las entradas en el archivo `.bib`.

**En caso de fallo:** Verificar que las etiquetas referenciadas existan en los bloques de código con el prefijo correcto (`fig-`, `tbl-`). Para citas, verificar que las claves del `.bib` coincidan exactamente (sensible a mayúsculas) y que `bibliography:` esté configurado en el encabezado YAML.

### Paso 5: Renderizar el Documento

```bash
quarto render report.qmd

# Specific format
quarto render report.qmd --to pdf
quarto render report.qmd --to docx

# Preview with live reload
quarto preview report.qmd
```

**Esperado:** Archivo de salida generado en el formato especificado.

**En caso de fallo:**
- Quarto faltante: Instalar desde https://quarto.org/docs/get-started/
- Errores de PDF: Instalar TinyTeX con `quarto install tinytex`
- Errores de paquetes R: Asegurar que todos los paquetes estén instalados

### Paso 6: Salida Multi-Formato

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

Renderizar todos los formatos: `quarto render report.qmd`

**Esperado:** Todos los formatos de salida especificados se generan exitosamente, cada uno con el estilo y diseño correcto para el formato objetivo.

**En caso de fallo:** Si un formato falla mientras otros tienen éxito, verificar los requisitos específicos del formato: PDF necesita un motor LaTeX (instalar con `quarto install tinytex`), DOCX necesita una plantilla de referencia válida si se especifica, y las opciones YAML específicas del formato deben estar correctamente anidadas bajo cada clave de formato.

## Validación

- [ ] El documento se renderiza sin errores
- [ ] Todos los bloques de código se ejecutan correctamente
- [ ] Las referencias cruzadas se resuelven (figuras, tablas, citas)
- [ ] La tabla de contenidos es precisa
- [ ] El formato de salida es apropiado para la audiencia

## Errores Comunes

- **Prefijo de etiqueta faltante**: Las figuras referenciables necesitan el prefijo `fig-` en la etiqueta, las tablas necesitan `tbl-`
- **Invalidación de caché**: Los bloques en caché no se re-ejecutan cuando los datos upstream cambian. Eliminar `_cache/` para forzar.
- **PDF sin LaTeX**: Instalar TinyTeX o usar `format: pdf` con `pdf-engine: weasyprint` para PDF basado en CSS
- **Sintaxis R Markdown en Quarto**: Usar opciones de bloque `#|` en lugar del estilo `{r, echo=FALSE}`

## Habilidades Relacionadas

- `format-apa-report` - Informes académicos con formato APA
- `build-parameterized-report` - Generación de múltiples informes parametrizados
- `generate-statistical-tables` - Tablas listas para publicación
- `write-vignette` - Viñetas Quarto en paquetes R
