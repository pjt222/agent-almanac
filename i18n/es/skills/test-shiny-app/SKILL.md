---
name: test-shiny-app
description: >
  Probar aplicaciones Shiny usando shinytest2 para tests de navegador de
  extremo a extremo y testServer() para tests unitarios de la lógica del
  server de módulos. Cubre pruebas de snapshot, integración con CI y
  simulación de servicios externos. Úsalo al añadir tests a una aplicación
  Shiny existente, al configurar una estrategia de tests para un nuevo
  proyecto Shiny, al escribir tests de regresión antes de refactorizar código
  Shiny, o al integrar tests de apps Shiny en pipelines CI/CD.
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
  domain: shiny
  complexity: intermediate
  language: R
  tags: shiny, testing, shinytest2, testServer, snapshot, CI
---

# Test Shiny App

Configurar tests completos para aplicaciones Shiny usando shinytest2 (extremo a extremo) y testServer() (tests unitarios).

## Cuándo Usar

- Al añadir tests a una aplicación Shiny existente
- Al configurar una estrategia de tests para un nuevo proyecto Shiny
- Al escribir tests de regresión antes de refactorizar código Shiny
- Al integrar tests de apps Shiny en pipelines CI/CD

## Entradas

- **Requerido**: Ruta a la aplicación Shiny
- **Requerido**: Alcance de los tests (tests unitarios, extremo a extremo, o ambos)
- **Opcional**: Si usar tests de snapshot (predeterminado: sí para e2e)
- **Opcional**: Plataforma CI (GitHub Actions, GitLab CI)
- **Opcional**: Módulos a probar en aislamiento

## Procedimiento

### Paso 1: Instalar las Dependencias de Test

```r
install.packages("shinytest2")

# Para apps golem, añadir como dependencia de Suggests
usethis::use_package("shinytest2", type = "Suggests")

# Configurar infraestructura testthat si no está presente
usethis::use_testthat(edition = 3)
```

**Esperado:** shinytest2 instalado y estructura de directorios testthat en su lugar.

**En caso de fallo:** shinytest2 requiere chromote (Chrome sin cabeza). Instala Chrome/Chromium en el sistema. En WSL: `sudo apt install -y chromium-browser`. Verifica con `chromote::find_chrome()`.

### Paso 2: Escribir Tests Unitarios testServer() para Módulos

Crea `tests/testthat/test-mod_dashboard.R`:

```r
test_that("dashboard module filters data correctly", {
  testServer(dataFilterServer, args = list(
    data = reactive(iris),
    columns = c("Species", "Sepal.Length")
  ), {
    # Establecer entradas
    session$setInputs(column = "Species")
    session$setInputs(value_select = "setosa")
    session$setInputs(apply = 1)

    # Verificar salida
    result <- filtered()
    expect_equal(nrow(result), 50)
    expect_true(all(result$Species == "setosa"))
  })
})

test_that("dashboard module handles empty data", {
  testServer(dataFilterServer, args = list(
    data = reactive(iris[0, ]),
    columns = c("Species")
  ), {
    # El módulo no debe dar error con datos vacíos
    expect_no_error(session$setInputs(column = "Species"))
  })
})
```

Patrones clave:
- `testServer()` prueba la lógica del server del módulo sin un navegador
- Pasa argumentos reactivos a través de la lista `args`
- Usa `session$setInputs()` para simular interacciones del usuario
- Accede a los valores de retorno reactivos directamente por nombre
- Prueba casos extremos: datos vacíos, entradas NULL, valores inválidos

**Esperado:** Los tests del módulo pasan con `devtools::test()`.

**En caso de fallo:** Si `testServer()` da error con "not a module server function", asegúrate de que la función use `moduleServer()` internamente. Si `session$setInputs()` no activa los reactivos, añade `session$flushReact()` después de establecer las entradas.

### Paso 3: Escribir Tests de Extremo a Extremo con shinytest2

Crea `tests/testthat/test-app-e2e.R`:

```r
test_that("app loads and displays initial state", {
  # Para apps golem
  app <- AppDriver$new(
    app_dir = system.file(package = "myapp"),
    name = "initial-load",
    height = 800,
    width = 1200
  )
  on.exit(app$stop(), add = TRUE)

  # Esperar a que la app cargue
  app$wait_for_idle(timeout = 10000)

  # Verificar que los elementos clave existen
  app$expect_values()
})

test_that("filter interaction updates the table", {
  app <- AppDriver$new(
    app_dir = system.file(package = "myapp"),
    name = "filter-interaction"
  )
  on.exit(app$stop(), add = TRUE)

  # Interactuar con la app
  app$set_inputs(`filter1-column` = "cyl")
  app$wait_for_idle()

  app$set_inputs(`filter1-apply` = "click")
  app$wait_for_idle()

  # Tomar snapshot de los valores de salida
  app$expect_values(output = "table")
})
```

Patrones clave:
- `AppDriver$new()` lanza la app en Chrome sin cabeza
- Siempre usa `on.exit(app$stop())` para limpiar
- Los IDs de entrada del módulo usan el formato `"moduleId-inputId"`
- `app$expect_values()` crea/compara archivos de snapshot
- `app$wait_for_idle()` garantiza que las actualizaciones reactivas completen

**Esperado:** Los tests de extremo a extremo crean archivos de snapshot en `tests/testthat/_snaps/`.

**En caso de fallo:** Si Chrome no se encuentra, establece la variable de entorno `CHROMOTE_CHROME` a la ruta del binario de Chrome. Si los snapshots fallan en CI pero pasan en local, verifica las diferencias de renderizado dependientes de la plataforma — usa `app$expect_values()` para snapshots de datos en lugar de `app$expect_screenshot()` para snapshots visuales.

### Paso 4: Grabar un Test de Forma Interactiva (Opcional)

```r
shinytest2::record_test("path/to/app")
```

Esto abre la app en un navegador con un panel de grabación. Interactúa con la app, luego haz clic en "Save test" para generar automáticamente el código del test.

**Esperado:** Un archivo de test generado en `tests/testthat/` con las interacciones grabadas.

**En caso de fallo:** Si la grabadora no abre, verifica que la app se ejecute exitosamente con `shiny::runApp()` primero. La grabadora requiere una app funcional.

### Paso 5: Configurar la Gestión de Snapshots

Para tests basados en snapshots, gestiona los valores esperados:

```r
# Aceptar snapshots nuevos/modificados después de revisión
testthat::snapshot_accept("test-app-e2e")

# Revisar diferencias en snapshots
testthat::snapshot_review("test-app-e2e")
```

Añade los directorios de snapshots al control de versiones:

```
tests/testthat/_snaps/    # Confirmado — contiene los valores esperados
```

**Esperado:** Archivos de snapshot rastreados en git para detección de regresiones.

**En caso de fallo:** Si los snapshots cambian inesperadamente, ejecuta `testthat::snapshot_review()` para ver las diferencias. Acepta los cambios intencionales con `testthat::snapshot_accept()`.

### Paso 6: Integrar con CI

Añade a `.github/workflows/R-CMD-check.yaml` o crea un workflow dedicado:

```yaml
- name: Install system dependencies
  run: |
    sudo apt-get update
    sudo apt-get install -y chromium-browser

- name: Set Chrome path
  run: echo "CHROMOTE_CHROME=$(which chromium-browser)" >> $GITHUB_ENV

- name: Run tests
  run: |
    Rscript -e 'devtools::test()'
```

Para apps golem, asegúrate de que el paquete de la app esté instalado antes de las pruebas:

```yaml
- name: Install app package
  run: Rscript -e 'devtools::install()'
```

**Esperado:** Los tests pasan en CI con Chrome sin cabeza.

**En caso de fallo:** Problemas comunes de CI: Chrome no instalado (añade el paso apt-get), servidor de visualización faltante (shinytest2 usa modo sin cabeza por defecto, por lo que normalmente no es un problema), o tiempo de espera excedido en runners lentos (aumenta `timeout` en `AppDriver$new()`).

## Validación

- [ ] `devtools::test()` ejecuta todos los tests sin errores
- [ ] Los tests testServer() cubren la lógica del server del módulo
- [ ] Los tests shinytest2 cubren los flujos de trabajo clave del usuario
- [ ] Los archivos de snapshot están confirmados en el control de versiones
- [ ] Los tests pasan en el entorno CI
- [ ] Se prueban los casos extremos (datos vacíos, entradas NULL, estados de error)

## Errores Comunes

- **Probar el renderizado de UI en lugar de la lógica**: Prefiere `testServer()` para la lógica y `app$expect_values()` para los datos. Solo usa `app$expect_screenshot()` cuando la apariencia visual importa — los screenshots son frágiles entre plataformas.
- **Formato de ID del módulo en tests e2e**: Al establecer entradas de módulo via AppDriver, usa el formato `"moduleId-inputId"` (separado por guión), no `"moduleId.inputId"`.
- **Tiempos frágiles**: Siempre llama a `app$wait_for_idle()` después de `app$set_inputs()`. Sin esto, las aserciones pueden ejecutarse antes de que las actualizaciones reactivas completen.
- **Deriva de snapshots**: No confirmes snapshots generados en diferentes plataformas (Mac vs Linux). Estandariza en la plataforma CI para la generación de snapshots.
- **Chrome faltante en CI**: shinytest2 requiere Chrome/Chromium. Siempre incluye el paso de instalación en los workflows CI.

## Habilidades Relacionadas

- `build-shiny-module` — crear módulos comprobables con interfaces claras
- `scaffold-shiny-app` — configurar la estructura de la app con infraestructura de tests
- `write-testthat-tests` — patrones generales de testthat para paquetes R
- `setup-github-actions-ci` — configuración CI/CD para paquetes R (apps golem)
