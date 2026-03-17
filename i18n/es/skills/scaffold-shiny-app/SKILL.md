---
name: scaffold-shiny-app
description: >
  Crear una nueva aplicación Shiny usando golem (paquete R de producción),
  rhino (empresarial) o estructura vanilla (prototipo rápido). Cubre la
  selección del framework, inicialización del proyecto y creación del primer
  módulo. Úsalo al iniciar una nueva aplicación web interactiva en R, al crear
  un prototipo de panel o explorador de datos, al configurar una aplicación
  Shiny de producción como paquete R con golem, o al arrancar un proyecto
  Shiny empresarial con rhino.
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
  complexity: basic
  language: R
  tags: shiny, golem, rhino, scaffold, web-app, reactive
---

# Scaffold Shiny App

Crear una nueva aplicación Shiny con estructura lista para producción usando scaffolding de golem, rhino o vanilla.

## Cuándo Usar

- Al iniciar una nueva aplicación web interactiva en R
- Al crear un prototipo de panel o explorador de datos
- Al configurar una aplicación Shiny de producción como paquete R (golem)
- Al arrancar un proyecto Shiny empresarial (rhino)

## Entradas

- **Requerido**: Nombre de la aplicación
- **Requerido**: Elección del framework (golem, rhino o vanilla)
- **Opcional**: Si incluir scaffolding de módulos (predeterminado: sí)
- **Opcional**: Si usar renv para gestión de dependencias (predeterminado: sí)
- **Opcional**: Destino de despliegue (shinyapps.io, Posit Connect, Docker)

## Procedimiento

### Paso 1: Elegir el Framework

Evalúa los requisitos del proyecto para seleccionar el framework apropiado:

| Framework | Mejor Para | Estructura |
|-----------|------------|------------|
| **golem** | Apps de producción distribuidas como paquetes R | Paquete R con DESCRIPTION, tests, viñetas |
| **rhino** | Apps empresariales con pipeline de compilación JS/CSS | Módulos box, Sass, bundling JS, rhino::init() |
| **vanilla** | Prototipos rápidos y aprendizaje | Un solo app.R o par ui.R/server.R |

**Esperado:** Decisión clara de framework basada en el alcance del proyecto y las necesidades del equipo.

**En caso de fallo:** Si no estás seguro, usa golem por defecto — proporciona la mayor estructura y se puede simplificar más adelante. Vanilla solo es apropiado para prototipos desechables.

### Paso 2: Crear el Scaffolding del Proyecto

#### Camino Golem

```r
golem::create_golem("myapp", package_name = "myapp")
```

Esto crea:
```
myapp/
├── DESCRIPTION
├── NAMESPACE
├── R/
│   ├── app_config.R
│   ├── app_server.R
│   ├── app_ui.R
│   └── run_app.R
├── dev/
│   ├── 01_start.R
│   ├── 02_dev.R
│   ├── 03_deploy.R
│   └── run_dev.R
├── inst/
│   ├── app/www/
│   └── golem-config.yml
├── man/
├── tests/
│   ├── testthat.R
│   └── testthat/
└── vignettes/
```

#### Camino Rhino

```r
rhino::init("myapp")
```

Esto crea:
```
myapp/
├── app/
│   ├── js/
│   ├── logic/
│   ├── static/
│   ├── styles/
│   ├── view/
│   └── main.R
├── tests/
│   ├── cypress/
│   └── testthat/
├── .github/
├── app.R
├── dependencies.R
├── rhino.yml
└── renv.lock
```

#### Camino Vanilla

Crea `app.R`:

```r
library(shiny)
library(bslib)

ui <- page_sidebar(
  title = "My App",
  sidebar = sidebar(
    sliderInput("n", "Sample size", 10, 1000, 100)
  ),
  card(
    card_header("Output"),
    plotOutput("plot")
  )
)

server <- function(input, output, session) {
  output$plot <- renderPlot({
    hist(rnorm(input$n), main = "Random Normal")
  })
}

shinyApp(ui, server)
```

**Esperado:** Directorio del proyecto creado con todos los archivos de scaffolding.

**En caso de fallo:** Para golem, asegúrate de que el paquete golem esté instalado: `install.packages("golem")`. Para rhino, instala desde GitHub: `remotes::install_github("Appsilon/rhino")`. Para vanilla, asegúrate de que shiny y bslib estén instalados.

### Paso 3: Configurar las Dependencias

#### Golem/Vanilla

```r
# Inicializar renv
renv::init()

# Añadir dependencias principales
usethis::use_package("shiny")
usethis::use_package("bslib")
usethis::use_package("DT")         # si se usan tablas de datos
usethis::use_package("plotly")     # si se usan gráficos interactivos

# Capturar estado
renv::snapshot()
```

#### Rhino

Las dependencias se gestionan en `dependencies.R`:

```r
# dependencies.R
library(shiny)
library(bslib)
library(DT)
```

**Esperado:** Todas las dependencias registradas en DESCRIPTION (golem) o dependencies.R (rhino) y bloqueadas con renv.

**En caso de fallo:** Si renv::init() falla, verifica los permisos de escritura. Si los paquetes no se instalan, verifica la compatibilidad de la versión de R.

### Paso 4: Crear el Primer Módulo

#### Golem

```r
golem::add_module(name = "dashboard", with_test = TRUE)
```

Esto crea `R/mod_dashboard.R` y `tests/testthat/test-mod_dashboard.R`.

#### Rhino

Crea `app/view/dashboard.R`:

```r
box::use(
  shiny[moduleServer, NS, tagList, h3, plotOutput, renderPlot],
)

#' @export
ui <- function(id) {
  ns <- NS(id)
  tagList(
    h3("Dashboard"),
    plotOutput(ns("plot"))
  )
}

#' @export
server <- function(id) {
  moduleServer(id, function(input, output, session) {
    output$plot <- renderPlot({
      plot(1:10)
    })
  })
}
```

#### Vanilla

Añade las funciones del módulo a un archivo separado `R/mod_dashboard.R`:

```r
dashboardUI <- function(id) {
  ns <- NS(id)
  tagList(
    h3("Dashboard"),
    plotOutput(ns("plot"))
  )
}

dashboardServer <- function(id) {
  moduleServer(id, function(input, output, session) {
    output$plot <- renderPlot({
      plot(1:10)
    })
  })
}
```

**Esperado:** Archivo de módulo creado con funciones UI y server usando el espacio de nombres correcto.

**En caso de fallo:** Asegúrate de que el módulo use `NS(id)` para todos los IDs de input/output en la función UI. Sin el espacio de nombres, los IDs colisionarán cuando el módulo se use varias veces.

### Paso 5: Ejecutar la Aplicación

```r
# Golem
golem::run_dev()

# Rhino
shiny::runApp()

# Vanilla
shiny::runApp("app.R")
```

**Esperado:** La aplicación se lanza en el navegador sin errores.

**En caso de fallo:** Revisa la consola de R para ver mensajes de error. Problemas comunes: paquetes faltantes (instálalos), puerto ya en uso (especifica un puerto diferente con `port = 3839`), o errores de sintaxis en el código UI/server.

## Validación

- [ ] El directorio de la aplicación tiene la estructura correcta para el framework elegido
- [ ] `shiny::runApp()` se lanza sin errores
- [ ] Al menos un módulo está creado con funciones UI y server
- [ ] Las dependencias están registradas (DESCRIPTION o dependencies.R)
- [ ] renv.lock captura todas las versiones de paquetes
- [ ] El módulo usa `NS(id)` para aislamiento correcto del espacio de nombres

## Errores Comunes

- **Elegir vanilla para producción**: La estructura vanilla carece de infraestructura de tests, documentación y herramientas de despliegue. Usa golem o rhino para cualquier cosa más allá de prototipos.
- **Espacio de nombres faltante en módulos**: Cada `inputId` y `outputId` en la UI de un módulo debe estar envuelto con `ns()`. Olvidarlo provoca colisiones silenciosas de IDs.
- **golem sin flujo de trabajo devtools**: Las apps golem son paquetes R. Usa `devtools::load_all()`, `devtools::test()` y `devtools::document()` — no `source()`.
- **rhino sin box**: rhino usa box para importaciones de módulos. No uses llamadas `library()` — usa `box::use()` para importaciones explícitas.

## Habilidades Relacionadas

- `build-shiny-module` — crear módulos Shiny reutilizables con aislamiento correcto del espacio de nombres
- `test-shiny-app` — configurar tests de shinytest2 y testServer()
- `deploy-shiny-app` — desplegar en shinyapps.io, Posit Connect o Docker
- `design-shiny-ui` — temas bslib y diseño de layout responsivo
- `create-r-package` — scaffolding de paquetes R (las apps golem son paquetes R)
- `manage-renv-dependencies` — gestión detallada de dependencias renv
