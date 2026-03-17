---
name: write-vignette
description: >
  Crear viñetas para paquetes R usando R Markdown o Quarto. Cubre la
  configuración de viñetas, la configuración YAML, las opciones de fragmentos
  de código, la compilación y las pruebas, y los requisitos de CRAN para
  viñetas. Usar al añadir un tutorial de introducción, documentar flujos de
  trabajo complejos que abarcan múltiples funciones, crear guías específicas
  de dominio, o cuando el envío a CRAN requiere documentación orientada al
  usuario más allá de las páginas de ayuda de funciones.
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: r-packages
  complexity: basic
  language: R
  tags: r, vignette, rmarkdown, documentation, tutorial
---

# Escribir Viñetas

Crear documentación extensa en forma de viñetas para paquetes R.

## Cuándo Usar

- Añadir un tutorial de "Introducción" para un paquete
- Documentar flujos de trabajo complejos que abarcan múltiples funciones
- Crear guías específicas de dominio (p. ej., metodología estadística)
- El envío a CRAN requiere documentación orientada al usuario más allá de la ayuda de funciones

## Entradas

- **Obligatorio**: Paquete R con funciones a documentar
- **Obligatorio**: Título y tema de la viñeta
- **Opcional**: Formato (R Markdown o Quarto, predeterminado: R Markdown)
- **Opcional**: Si la viñeta necesita datos externos o APIs

## Procedimiento

### Paso 1: Crear el Archivo de Viñeta

```r
usethis::use_vignette("getting-started", title = "Getting Started with packagename")
```

**Esperado:** `vignettes/getting-started.Rmd` creado con cabecera YAML. `knitr` y `rmarkdown` añadidos al campo Suggests de DESCRIPTION. El directorio `vignettes/` existe.

**En caso de fallo:** Si `usethis::use_vignette()` falla, verificar que el directorio de trabajo es la raíz del paquete (contiene `DESCRIPTION`). Si `knitr` no está instalado, ejecutar primero `install.packages("knitr")`. Para la creación manual, crear el directorio `vignettes/` y el archivo a mano, asegurándose de que la cabecera YAML incluye las tres entradas `%\Vignette*`.

### Paso 2: Escribir el Contenido de la Viñeta

```markdown
---
title: "Getting Started with packagename"
output: rmarkdown::html_vignette
vignette: >
  %\VignetteIndexEntry{Getting Started with packagename}
  %\VignetteEngine{knitr::rmarkdown}
  %\VignetteEncoding{UTF-8}
---

## Introduction

Brief overview of what the package does and who it's for.

## Installation

```r
install.packages("packagename")
library(packagename)
```

## Basic Usage

Walk through the primary workflow:

```r
# Load example data
data <- example_data()

# Process
result <- main_function(data, option = "default")

# Inspect
summary(result)
```

## Advanced Features

Cover optional or advanced functionality.

## Conclusion

Summarize and point to other vignettes or resources.
```

**Esperado:** El archivo Rmd de la viñeta contiene secciones de Introducción, Instalación, Uso Básico, Funciones Avanzadas y Conclusión. Los ejemplos de código usan las funciones exportadas del paquete y producen salida visible.

**En caso de fallo:** Si los ejemplos fallan al ejecutarse, verificar que el paquete está instalado con `devtools::install()`. Asegurarse de que los ejemplos usan el nombre del paquete en las llamadas `library()` (no `devtools::load_all()`). Para funciones que requieren recursos externos, usar `eval=FALSE` para mostrar el código sin ejecutarlo.

### Paso 3: Configurar los Fragmentos de Código

Usar opciones de fragmentos para distintos propósitos:

```r
# Fragmento evaluado estándar
{r example-basic}
result <- compute_something(1:10)
result

# Mostrar código pero no ejecutar (con fines ilustrativos)
{r api-example, eval=FALSE}
connect_to_api(key = "your_key_here")

# Ejecutar pero ocultar el código (mostrar solo la salida)
{r hidden-setup, echo=FALSE}
library(packagename)

# Configurar opciones globales
{r setup, include=FALSE}
knitr::opts_chunk$set(
  collapse = TRUE,
  comment = "#>",
  fig.width = 7,
  fig.height = 5
)
```

**Esperado:** Un fragmento de configuración con `include=FALSE` establece las opciones globales (`collapse`, `comment`, `fig.width`, `fig.height`). Los fragmentos están configurados apropiadamente: `eval=FALSE` para código ilustrativo, `echo=FALSE` para la configuración oculta, y fragmentos estándar para los ejemplos interactivos.

**En caso de fallo:** Si las opciones de fragmento no surten efecto, verificar que la sintaxis usa el formato `{r chunk-name, option=value}` (separado por comas, sin comillas alrededor de valores lógicos). Comprobar que el fragmento de configuración se ejecuta primero colocándolo al principio del documento.

### Paso 4: Gestionar Dependencias Externas

Para viñetas que necesitan acceso a la red o paquetes opcionales:

```r
{r check-available, include=FALSE}
has_suggested <- requireNamespace("optionalpkg", quietly = TRUE)

{r use-suggested, eval=has_suggested}
optionalpkg::special_function()
```

Para cálculos de larga duración, precomputar y guardar los resultados:

```r
# Guardar resultados precomputados en vignettes/
saveRDS(expensive_result, "vignettes/precomputed.rds")

# Cargar en la viñeta
{r load-precomputed}
result <- readRDS("precomputed.rds")
```

**Esperado:** Las dependencias externas se gestionan con elegancia: los paquetes opcionales se cargan condicionalmente con `requireNamespace()`, el código dependiente de la red usa `eval=FALSE` o `tryCatch()`, y los cálculos costosos usan archivos `.rds` precomputados.

**En caso de fallo:** Si la viñeta falla en CRAN por paquetes opcionales no disponibles, envolver esas secciones con una variable condicional (p. ej., `eval=has_suggested`). Para resultados precomputados, asegurarse de que el archivo `.rds` está incluido en el directorio `vignettes/` y se referencia con una ruta relativa.

### Paso 5: Compilar y Probar la Viñeta

```r
# Compilar una única viñeta
devtools::build_vignettes()

# Compilar y verificar (detecta problemas de viñeta)
devtools::check()
```

**Esperado:** La viñeta compila sin errores. La salida HTML es legible.

**En caso de fallo:**
- Pandoc faltante: Configurar `RSTUDIO_PANDOC` en `.Renviron`
- Paquete no instalado: Ejecutar primero `devtools::install()`
- Suggests faltantes: Instalar los paquetes listados en DESCRIPTION Suggests

### Paso 6: Verificar en la Comprobación del Paquete

```r
devtools::check()
```

Verificaciones relacionadas con viñetas: compila correctamente, no tarda demasiado, sin errores.

**Esperado:** `devtools::check()` pasa sin errores ni advertencias relacionados con viñetas. La viñeta compila dentro de los límites de tiempo de CRAN (generalmente menos de 60 segundos).

**En caso de fallo:** Si la viñeta provoca fallos en la verificación, las correcciones más comunes son: añadir los paquetes Suggests faltantes a DESCRIPTION, reducir el tiempo de compilación con `eval=FALSE` en fragmentos lentos, y asegurarse de que `VignetteIndexEntry` coincide con el título. Ejecutar `devtools::build_vignettes()` por separado para aislar los errores específicos de la viñeta.

## Validación

- [ ] La viñeta compila sin errores con `devtools::build_vignettes()`
- [ ] Todos los fragmentos de código se ejecutan correctamente
- [ ] VignetteIndexEntry coincide con el título
- [ ] `devtools::check()` pasa sin advertencias de viñeta
- [ ] La viñeta aparece en los artículos del sitio pkgdown (si corresponde)
- [ ] El tiempo de compilación es razonable (< 60 segundos para CRAN)

## Errores Comunes

- **Discrepancia en VignetteIndexEntry**: La entrada del índice en YAML debe coincidir con lo que se quiere que los usuarios vean en `vignette(package = "pkg")`
- **Falta el bloque YAML de `vignette`**: Las tres líneas `%\Vignette*` son obligatorias
- **Viñeta demasiado lenta para CRAN**: Precomputar resultados o usar `eval=FALSE` para operaciones costosas
- **Pandoc no encontrado**: Asegurarse de que la variable de entorno `RSTUDIO_PANDOC` está configurada
- **Referencia al propio paquete**: Usar `library(packagename)` no `devtools::load_all()` en las viñetas

## Habilidades Relacionadas

- `write-roxygen-docs` - los documentos a nivel de función complementan los tutoriales de las viñetas
- `build-pkgdown-site` - las viñetas aparecen como artículos en el sitio pkgdown
- `submit-to-cran` - CRAN tiene requisitos específicos para las viñetas
- `create-quarto-report` - Quarto como alternativa a las viñetas de R Markdown
