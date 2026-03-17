---
name: write-roxygen-docs
description: >
  Escribir documentación roxygen2 para funciones, conjuntos de datos y clases
  de paquetes R. Cubre todas las etiquetas estándar, referencias cruzadas,
  ejemplos y generación de entradas en NAMESPACE. Sigue el estilo de
  documentación de tidyverse. Usar al añadir documentación a nuevas funciones
  exportadas, documentar funciones auxiliares internas o conjuntos de datos,
  documentar clases y métodos S3/S4/R6, o corregir notas de R CMD check
  relacionadas con la documentación.
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
  tags: r, roxygen2, documentation, namespace
---

# Escribir Documentación Roxygen

Crear documentación roxygen2 completa para funciones, conjuntos de datos y clases de paquetes R.

## Cuándo Usar

- Añadir documentación a una nueva función exportada
- Documentar funciones auxiliares internas
- Documentar conjuntos de datos del paquete
- Documentar clases y métodos S3/S4/R6
- Corregir notas de `R CMD check` relacionadas con la documentación

## Entradas

- **Obligatorio**: Función, conjunto de datos o clase R a documentar
- **Opcional**: Funciones relacionadas para referencias cruzadas (`@family`, `@seealso`)
- **Opcional**: Si la función debe ser exportada

## Procedimiento

### Paso 1: Escribir la Documentación de la Función

Colocar los comentarios roxygen directamente encima de la función:

```r
#' Compute the weighted mean of a numeric vector
#'
#' Calculates the arithmetic mean of `x` weighted by `w`. Missing values
#' in either `x` or `w` are handled according to the `na.rm` parameter.
#'
#' @param x A numeric vector of values.
#' @param w A numeric vector of weights, same length as `x`.
#' @param na.rm Logical. Should missing values be removed? Default `FALSE`.
#'
#' @return A single numeric value representing the weighted mean.
#'
#' @examples
#' weighted_mean(1:5, rep(1, 5))
#' weighted_mean(c(1, 2, NA, 4), c(1, 1, 1, 1), na.rm = TRUE)
#'
#' @export
#' @family summary functions
#' @seealso [stats::weighted.mean()] for the base R equivalent
weighted_mean <- function(x, w, na.rm = FALSE) {
  # implementation
}
```

**Esperado:** Bloque roxygen completo con título, descripción, `@param` para cada parámetro, `@return`, `@examples` y `@export`.

**En caso de fallo:** Si se desconoce una etiqueta, consultar `?roxygen2::rd_roclet`. La omisión más frecuente es `@return`, que CRAN requiere en todas las funciones exportadas.

### Paso 2: Referencia de Etiquetas Esenciales

| Etiqueta | Propósito | ¿Obligatoria para exportar? |
|----------|----------|----------------------------|
| `#' Title` | Primera línea, una oración | Sí |
| `#' Description` | Párrafo tras línea en blanco | Sí |
| `@param` | Documentación de parámetros | Sí |
| `@return` | Descripción del valor retornado | Sí (CRAN) |
| `@examples` | Ejemplos de uso | Muy recomendado |
| `@export` | Añadir a NAMESPACE | Sí, para la API pública |
| `@family` | Agrupar funciones relacionadas | Recomendado |
| `@seealso` | Referencias cruzadas | Opcional |
| `@keywords internal` | Marcar como interno | Para docs no exportadas |

**Esperado:** Se identifican todas las etiquetas obligatorias para el tipo de función. Las funciones exportadas tienen como mínimo `@param`, `@return`, `@examples` y `@export`.

**En caso de fallo:** Si una etiqueta es desconocida, consultar la [documentación de roxygen2](https://roxygen2.r-lib.org/articles/rd.html) para su uso y sintaxis.

### Paso 3: Documentar Conjuntos de Datos

Crear `R/data.R`:

```r
#' Example dataset of city temperatures
#'
#' A dataset containing daily temperature readings for major cities.
#'
#' @format A data frame with 365 rows and 4 variables:
#' \describe{
#'   \item{date}{Date of observation}
#'   \item{city}{City name}
#'   \item{temp_c}{Temperature in Celsius}
#'   \item{humidity}{Relative humidity percentage}
#' }
#' @source \url{https://example.com/data}
"city_temperatures"
```

**Esperado:** `R/data.R` contiene bloques roxygen para cada conjunto de datos con `@format` describiendo la estructura y `@source` indicando la procedencia de los datos.

**En caso de fallo:** Si `R CMD check` advierte sobre conjuntos de datos sin documentar, asegurarse de que la cadena entre comillas (p. ej., `"city_temperatures"`) coincide exactamente con el nombre del objeto guardado con `usethis::use_data()`.

### Paso 4: Documentar el Paquete

Crear `R/packagename-package.R`:

```r
#' @keywords internal
"_PACKAGE"

## usethis namespace: start
## usethis namespace: end
NULL
```

**Esperado:** `R/packagename-package.R` existe con `@keywords internal` y el centinela `"_PACKAGE"`. Al ejecutar `devtools::document()` se genera `man/packagename-package.Rd`.

**En caso de fallo:** Si `R CMD check` reporta que falta la página de documentación del paquete, verificar que el archivo se llama `R/<packagename>-package.R` y contiene la cadena `"_PACKAGE"`.

### Paso 5: Gestionar Casos Especiales

**Funciones con puntos en el nombre** (métodos S3):

```r
#' @export
#' @rdname process
process.myclass <- function(x, ...) {
  # S3 method
}
```

**Reutilizar documentación** con `@inheritParams`:

```r
#' @inheritParams weighted_mean
#' @param trim Fraction of observations to trim.
trimmed_mean <- function(x, w, na.rm = FALSE, trim = 0.1) {
  # implementation
}
```

**Corrección de "no visible binding"** usando el pronombre `.data`:

```r
#' @importFrom rlang .data
my_function <- function(df) {
  dplyr::filter(df, .data$column > 5)
}
```

**Esperado:** Los casos especiales (métodos S3, parámetros heredados, pronombre `.data`) se documentan correctamente. `@rdname` agrupa los métodos S3. `@inheritParams` reutiliza la documentación de parámetros sin duplicación.

**En caso de fallo:** Si `R CMD check` advierte sobre "no visible binding for global variable", añadir `#' @importFrom rlang .data` o usar `utils::globalVariables()` como último recurso.

### Paso 6: Generar la Documentación

```r
devtools::document()
```

**Esperado:** El directorio `man/` se actualiza con archivos `.Rd` para cada objeto documentado. `NAMESPACE` se regenera con las exportaciones e importaciones correctas.

**En caso de fallo:** Revisar los errores de sintaxis de roxygen. Problemas frecuentes: corchetes sin cerrar en `\describe{}`, falta el prefijo `#'` en una línea, o nombres de etiquetas inválidos. Ejecutar `devtools::document()` de nuevo tras corregir.

## Validación

- [ ] Cada función exportada tiene `@param`, `@return` y `@examples`
- [ ] `devtools::document()` se ejecuta sin errores
- [ ] `devtools::check()` no muestra advertencias de documentación
- [ ] Las etiquetas `@family` agrupan correctamente las funciones relacionadas
- [ ] Los ejemplos se ejecutan sin errores (probar con `devtools::run_examples()`)

## Errores Comunes

- **Falta `@return`**: CRAN requiere que todas las funciones exportadas documenten su valor de retorno
- **Ejemplos que necesitan internet o autenticación**: Envolver en `\dontrun{}` con un comentario explicativo
- **Ejemplos lentos**: Usar `\donttest{}` para ejemplos que funcionan pero tardan demasiado para CRAN
- **Markdown en roxygen**: Activar con `Roxygen: list(markdown = TRUE)` en DESCRIPTION
- **Olvidar ejecutar `devtools::document()`**: Las páginas man se generan, no se escriben a mano

## Habilidades Relacionadas

- `create-r-package` - configuración inicial del paquete incluyendo roxygen
- `write-testthat-tests` - probar las funciones que se documentan
- `write-vignette` - documentación extensa más allá de la referencia de funciones
- `submit-to-cran` - requisitos de documentación para CRAN
