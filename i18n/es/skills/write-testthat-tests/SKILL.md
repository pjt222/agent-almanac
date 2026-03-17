---
name: write-testthat-tests
description: >
  Escribir pruebas exhaustivas con testthat (edición 3) para funciones de
  paquetes R. Cubre organización de pruebas, aserciones, fixtures, mocking,
  pruebas de snapshot, pruebas parametrizadas y obtención de alta cobertura.
  Usar al añadir pruebas para nuevas funciones del paquete, aumentar la
  cobertura de pruebas del código existente, escribir pruebas de regresión
  para corrección de errores, o configurar la infraestructura de pruebas para
  un paquete que carece de ella.
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
  complexity: intermediate
  language: R
  tags: r, testthat, testing, unit-tests, coverage
---

# Escribir Pruebas con testthat

Crear pruebas exhaustivas para funciones de paquetes R usando testthat edición 3.

## Cuándo Usar

- Añadir pruebas para nuevas funciones del paquete
- Aumentar la cobertura de pruebas del código existente
- Escribir pruebas de regresión para corrección de errores
- Configurar la infraestructura de pruebas para un nuevo paquete

## Entradas

- **Obligatorio**: Funciones R a probar
- **Obligatorio**: Comportamiento esperado y casos límite
- **Opcional**: Fixtures de prueba o datos de muestra
- **Opcional**: Porcentaje de cobertura objetivo (predeterminado: 80%)

## Procedimiento

### Paso 1: Configurar la Infraestructura de Pruebas

Si aún no está hecho:

```r
usethis::use_testthat(edition = 3)
```

Esto crea `tests/testthat.R` y el directorio `tests/testthat/`.

**Esperado:** Se crean `tests/testthat.R` y el directorio `tests/testthat/`. DESCRIPTION tiene `Config/testthat/edition: 3` configurado.

**En caso de fallo:** Si usethis no está disponible, crear manualmente `tests/testthat.R` con el contenido `library(testthat); library(packagename); test_check("packagename")` y el directorio `tests/testthat/`.

### Paso 2: Crear el Archivo de Prueba

```r
usethis::use_test("function_name")
```

Esto crea `tests/testthat/test-function_name.R` con una plantilla.

**Esperado:** Archivo de prueba creado en `tests/testthat/test-function_name.R` con un bloque `test_that()` de marcador listo para completar.

**En caso de fallo:** Si `usethis::use_test()` no está disponible, crear el archivo manualmente. Seguir la convención de nomenclatura `test-<function_name>.R`.

### Paso 3: Escribir Pruebas Básicas

```r
test_that("weighted_mean computes correct result", {
  expect_equal(weighted_mean(1:3, c(1, 1, 1)), 2)
  expect_equal(weighted_mean(c(10, 20), c(1, 3)), 17.5)
})

test_that("weighted_mean handles NA values", {
  expect_equal(weighted_mean(c(1, NA, 3), c(1, 1, 1), na.rm = TRUE), 2)
  expect_true(is.na(weighted_mean(c(1, NA, 3), c(1, 1, 1), na.rm = FALSE)))
})

test_that("weighted_mean validates input", {
  expect_error(weighted_mean("a", 1), "numeric")
  expect_error(weighted_mean(1:3, 1:2), "length")
})
```

**Esperado:** Las pruebas básicas cubren la salida correcta para entradas típicas, el comportamiento con valores NA y los mensajes de error de validación de entradas.

**En caso de fallo:** Si las pruebas fallan inmediatamente, verificar que la función está cargada (`devtools::load_all()`). Si los mensajes de error no coinciden, usar un patrón regex en `expect_error()` en lugar de una cadena exacta.

### Paso 4: Probar Casos Límite

```r
test_that("weighted_mean handles edge cases", {
  # Empty input
  expect_error(weighted_mean(numeric(0), numeric(0)))

  # Single value
  expect_equal(weighted_mean(5, 1), 5)

  # Zero weights
  expect_true(is.nan(weighted_mean(1:3, c(0, 0, 0))))

  # Very large values
  expect_equal(weighted_mean(c(1e15, 1e15), c(1, 1)), 1e15)

  # Negative weights
  expect_error(weighted_mean(1:3, c(-1, 1, 1)))
})
```

**Esperado:** Se cubren los casos límite: entrada vacía, valores únicos, pesos cero, valores extremos y entradas inválidas. Cada caso límite tiene un comportamiento esperado claro.

**En caso de fallo:** Si la función no gestiona un caso límite como se espera, decidir si corregir la función o ajustar la prueba. Documentar el comportamiento previsto para los casos ambiguos.

### Paso 5: Usar Fixtures para Pruebas Complejas

Crear `tests/testthat/fixtures/` para datos de prueba:

```r
# tests/testthat/helper.R (cargado automáticamente)
create_test_data <- function() {
  data.frame(
    x = c(1, 2, 3, NA, 5),
    group = c("a", "a", "b", "b", "b")
  )
}
```

```r
# En el archivo de prueba
test_that("process_data works with grouped data", {
  test_data <- create_test_data()
  result <- process_data(test_data)
  expect_s3_class(result, "data.frame")
  expect_equal(nrow(result), 2)
})
```

**Esperado:** Las fixtures proporcionan datos de prueba consistentes en múltiples archivos de prueba. Las funciones auxiliares en `tests/testthat/helper.R` se cargan automáticamente por testthat.

**En caso de fallo:** Si las funciones auxiliares no se encuentran, asegurarse de que el archivo se llama `helper.R` (no `helpers.R`) y está en `tests/testthat/`. Reiniciar la sesión R si es necesario.

### Paso 6: Simular Dependencias Externas

```r
test_that("fetch_data handles API errors", {
  local_mocked_bindings(
    api_call = function(...) stop("Connection refused")
  )
  expect_error(fetch_data("endpoint"), "Connection refused")
})

test_that("fetch_data returns parsed data", {
  local_mocked_bindings(
    api_call = function(...) list(data = list(value = 42))
  )
  result <- fetch_data("endpoint")
  expect_equal(result$value, 42)
})
```

**Esperado:** Las dependencias externas (APIs, bases de datos, llamadas de red) se simulan para que las pruebas se ejecuten sin conexiones reales. Los valores de retorno simulados ejercitan la lógica de procesamiento de datos de la función.

**En caso de fallo:** Si `local_mocked_bindings()` falla, asegurarse de que la función simulada es accesible en el ámbito de la prueba. Para funciones de otros paquetes, usar el argumento `.package`.

### Paso 7: Pruebas de Snapshot para Salidas Complejas

```r
test_that("format_report produces expected output", {
  expect_snapshot(format_report(test_data))
})

test_that("plot_results creates expected plot", {
  expect_snapshot_file(
    save_plot(plot_results(test_data), "test-plot.png"),
    "expected-plot.png"
  )
})
```

**Esperado:** Los archivos de snapshot se crean en `tests/testthat/_snaps/`. La primera ejecución crea la línea base; las ejecuciones siguientes comparan con ella.

**En caso de fallo:** Si los snapshots fallan tras un cambio intencionado, actualizarlos con `testthat::snapshot_accept()`. Para diferencias entre plataformas, usar el parámetro `variant` para mantener snapshots específicos de cada plataforma.

### Paso 8: Usar Condiciones de Omisión

```r
test_that("database query works", {
  skip_on_cran()
  skip_if_not(has_db_connection(), "No database available")

  result <- query_db("SELECT 1")
  expect_equal(result[[1]], 1)
})

test_that("parallel computation works", {
  skip_on_os("windows")
  skip_if(parallel::detectCores() < 2, "Need multiple cores")

  result <- parallel_compute(1:100)
  expect_length(result, 100)
})
```

**Esperado:** Las pruebas que requieren entornos especiales (red, base de datos, múltiples núcleos) están correctamente protegidas con condiciones de omisión. Estas pruebas se ejecutan localmente pero se omiten en CRAN o entornos de CI restringidos.

**En caso de fallo:** Si las pruebas fallan en CRAN o CI pero pasan localmente, añadir el guard `skip_on_cran()`, `skip_on_os()` o `skip_if_not()` apropiado al inicio del bloque `test_that()`.

### Paso 9: Ejecutar Pruebas y Verificar Cobertura

```r
# Ejecutar todas las pruebas
devtools::test()

# Ejecutar archivo de prueba específico
devtools::test_active_file()  # en RStudio
testthat::test_file("tests/testthat/test-function_name.R")

# Verificar cobertura
covr::package_coverage()
covr::report()
```

**Esperado:** Todas las pruebas pasan con `devtools::test()`. El informe de cobertura muestra que se alcanza el porcentaje objetivo (apuntar a >80%).

**En caso de fallo:** Si las pruebas fallan, leer la salida de las pruebas para los fallos de aserción específicos. Si la cobertura está por debajo del objetivo, usar `covr::report()` para identificar las rutas de código no probadas y añadir pruebas para ellas.

## Validación

- [ ] Todas las pruebas pasan con `devtools::test()`
- [ ] La cobertura supera el porcentaje objetivo
- [ ] Cada función exportada tiene al menos una prueba
- [ ] Se prueban las condiciones de error
- [ ] Se cubren los casos límite (NA, NULL, vacío, valores en los límites)
- [ ] Ninguna prueba depende de estado externo ni del orden de ejecución

## Errores Comunes

- **Pruebas que dependen unas de otras**: Cada bloque `test_that()` debe ser independiente
- **Rutas de archivo codificadas**: Usar `testthat::test_path()` para los fixtures de prueba
- **Comparación de punto flotante**: Usar `expect_equal()` (tiene tolerancia) no `expect_identical()`
- **Probar funciones privadas**: Probar a través de la API pública cuando sea posible. Usar `:::` con moderación.
- **Pruebas de snapshot en CI**: Los snapshots son sensibles a la plataforma. Usar el parámetro `variant` para plataformas cruzadas.
- **Olvidar `skip_on_cran()`**: Las pruebas que requieren red, bases de datos o ejecución larga deben omitirse en CRAN

## Ejemplos

```r
# Patrón: el archivo de prueba refleja el archivo R/
# R/weighted_mean.R -> tests/testthat/test-weighted_mean.R

# Patrón: nombres de prueba descriptivos
test_that("weighted_mean returns NA when na.rm = FALSE and input contains NA", {
  result <- weighted_mean(c(1, NA), c(1, 1), na.rm = FALSE)
  expect_true(is.na(result))
})

# Patrón: probar advertencias
test_that("deprecated_function emits deprecation warning", {
  expect_warning(deprecated_function(), "deprecated")
})
```

## Habilidades Relacionadas

- `create-r-package` - configurar la infraestructura de pruebas como parte de la creación del paquete
- `write-roxygen-docs` - documentar las funciones que se prueban
- `setup-github-actions-ci` - ejecutar pruebas automáticamente al hacer push
- `submit-to-cran` - CRAN requiere que las pruebas pasen en todas las plataformas
