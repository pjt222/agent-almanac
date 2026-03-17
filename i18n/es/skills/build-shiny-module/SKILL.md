---
name: build-shiny-module
description: >
  Construir módulos Shiny reutilizables con aislamiento correcto del espacio de
  nombres usando NS(). Cubre pares UI/server de módulos, valores de retorno
  reactivos, comunicación entre módulos y composición de módulos anidados.
  Úsalo al extraer un componente reutilizable de una aplicación Shiny en
  crecimiento, al construir un widget de UI usado en múltiples lugares, al
  encapsular lógica reactiva compleja detrás de una interfaz limpia, o al
  componer aplicaciones más grandes a partir de unidades más pequeñas y
  comprobables.
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
  tags: shiny, modules, namespace, reactive, composition
---

# Build Shiny Module

Crear pares de módulos Shiny UI/server reutilizables con aislamiento correcto del espacio de nombres, comunicación reactiva y composabilidad.

## Cuándo Usar

- Al extraer un componente reutilizable de una aplicación Shiny en crecimiento
- Al construir un widget de UI que se usará en múltiples lugares
- Al encapsular lógica reactiva compleja detrás de una interfaz limpia
- Al componer aplicaciones más grandes a partir de unidades más pequeñas y comprobables

## Entradas

- **Requerido**: Descripción del propósito y funcionalidad del módulo
- **Requerido**: Contrato de entrada/salida (qué recibe y devuelve el módulo)
- **Opcional**: Si el módulo anida otros módulos (predeterminado: no)
- **Opcional**: Contexto del framework (golem, rhino o vanilla)

## Procedimiento

### Paso 1: Definir la Interfaz del Módulo

Antes de escribir código, define qué acepta y devuelve el módulo:

```
Módulo: data_filter
Entradas: dataset reactivo, nombres de columnas para filtrar
Salidas: dataset filtrado reactivo
UI: controles de filtro (selectInput, sliderInput, dateRangeInput)
```

**Esperado:** Contrato claro que especifica entradas reactivas, salidas reactivas y elementos de UI.

**En caso de fallo:** Si la interfaz no está clara, el módulo probablemente es demasiado amplio. Divídelo en módulos más pequeños con responsabilidades únicas.

### Paso 2: Crear la Función UI del Módulo

```r
#' Data Filter Module UI
#'
#' @param id ID del espacio de nombres del módulo
#' @return Un tagList de controles de filtro
#' @export
dataFilterUI <- function(id) {
  ns <- NS(id)
  tagList(
    selectInput(
      ns("column"),
      "Filter column",
      choices = NULL
    ),
    uiOutput(ns("filter_control")),
    actionButton(ns("apply"), "Apply Filter", class = "btn-primary")
  )
}
```

Reglas clave:
- El nombre de la función sigue la convención `<nombre>UI`
- El primer argumento siempre es `id`
- Crea `ns <- NS(id)` al inicio
- Envuelve cada `inputId` y `outputId` con `ns()`
- Devuelve un `tagList()` para permitir ubicación flexible

**Esperado:** Función UI que crea elementos de entrada/salida con espacio de nombres.

**En caso de fallo:** Si los IDs colisionan al usar el módulo dos veces, verifica que cada ID esté envuelto con `ns()`. Omisión común: IDs dentro de `renderUI()` o `uiOutput()` — estos también necesitan `ns()`.

### Paso 3: Crear la Función Server del Módulo

```r
#' Data Filter Module Server
#'
#' @param id ID del espacio de nombres del módulo
#' @param data Expresión reactiva que devuelve un data frame
#' @param columns Vector de caracteres de nombres de columnas filtrables
#' @return Expresión reactiva que devuelve el data frame filtrado
#' @export
dataFilterServer <- function(id, data, columns) {
  moduleServer(id, function(input, output, session) {
    ns <- session$ns

    # Actualizar opciones de columna cuando cambian los datos
    observeEvent(data(), {
      available <- intersect(columns, names(data()))
      updateSelectInput(session, "column", choices = available)
    })

    # Control de filtro dinámico basado en la columna seleccionada
    output$filter_control <- renderUI({
      req(input$column)
      col_data <- data()[[input$column]]

      if (is.numeric(col_data)) {
        sliderInput(
          ns("value_range"),
          "Range",
          min = min(col_data, na.rm = TRUE),
          max = max(col_data, na.rm = TRUE),
          value = range(col_data, na.rm = TRUE)
        )
      } else {
        selectInput(
          ns("value_select"),
          "Values",
          choices = unique(col_data),
          multiple = TRUE,
          selected = unique(col_data)
        )
      }
    })

    # Devolver datos filtrados como reactivo
    filtered <- eventReactive(input$apply, {
      req(input$column)
      col <- input$column
      df <- data()

      if (is.numeric(df[[col]])) {
        req(input$value_range)
        df[df[[col]] >= input$value_range[1] &
           df[[col]] <= input$value_range[2], ]
      } else {
        req(input$value_select)
        df[df[[col]] %in% input$value_select, ]
      }
    }, ignoreNULL = FALSE)

    return(filtered)
  })
}
```

Reglas clave:
- El nombre de la función sigue la convención `<nombre>Server`
- El primer argumento siempre es `id`
- Los argumentos adicionales son expresiones reactivas o valores estáticos
- Usa `moduleServer(id, function(input, output, session) { ... })`
- Usa `session$ns` para UI dinámica creada dentro del server
- Devuelve valores reactivos explícitamente

**Esperado:** Función server que procesa entradas y devuelve salida reactiva.

**En caso de fallo:** Si los valores reactivos no se actualizan, verifica que las entradas de UI dinámica usen `session$ns` (no el `ns` externo). Si el módulo devuelve NULL, asegúrate de que `return()` sea la última expresión dentro de `moduleServer()`.

### Paso 4: Conectar el Módulo a la App Principal

```r
# En app_ui.R o ui
ui <- page_sidebar(
  title = "Analysis App",
  sidebar = sidebar(
    dataFilterUI("filter1")
  ),
  card(
    DT::dataTableOutput("table")
  )
)

# En app_server.R o server
server <- function(input, output, session) {
  # Fuente de datos en bruto
  raw_data <- reactive({ mtcars })

  # Llamar al módulo — capturar su valor de retorno
  filtered_data <- dataFilterServer(
    "filter1",
    data = raw_data,
    columns = c("cyl", "mpg", "hp", "wt")
  )

  # Usar el reactivo devuelto por el módulo
  output$table <- DT::renderDataTable({
    filtered_data()
  })
}
```

**Esperado:** El módulo aparece en la UI y su reactivo devuelto fluye hacia las salidas posteriores.

**En caso de fallo:** Si la UI del módulo no se renderiza, verifica que la cadena `id` coincida entre las llamadas UI y server. Si el reactivo devuelto es NULL, verifica que la función server realmente devuelva un valor.

### Paso 5: Componer Módulos Anidados (Opcional)

Para módulos que contienen otros módulos:

```r
analysisUI <- function(id) {
  ns <- NS(id)
  tagList(
    dataFilterUI(ns("filter")),
    plotOutput(ns("plot"))
  )
}

analysisServer <- function(id, data) {
  moduleServer(id, function(input, output, session) {
    # Llamar al módulo interno con ID con espacio de nombres
    filtered <- dataFilterServer("filter", data = data, columns = names(data()))

    output$plot <- renderPlot({
      req(filtered())
      plot(filtered())
    })

    return(filtered)
  })
}
```

Regla clave: En la UI, anida con `ns("inner_id")`. En el server, llama con solo `"inner_id"` — `moduleServer` gestiona el encadenamiento del espacio de nombres.

**Esperado:** El módulo interno se renderiza correctamente dentro del espacio de nombres del módulo externo.

**En caso de fallo:** Si la UI del módulo interno no aparece, probablemente olvidaste `ns()` alrededor del ID del módulo interno en la función UI externa. Si la comunicación del server falla, verifica que el ID del módulo interno coincida (sin `ns()` en la llamada del server).

### Paso 6: Probar el Módulo en Aislamiento

```r
# App de prueba rápida para el módulo
if (interactive()) {
  shiny::shinyApp(
    ui = fluidPage(
      dataFilterUI("test"),
      DT::dataTableOutput("result")
    ),
    server = function(input, output, session) {
      data <- reactive(iris)
      filtered <- dataFilterServer("test", data, names(iris))
      output$result <- DT::renderDataTable(filtered())
    }
  )
}
```

**Esperado:** El módulo funciona correctamente en la app de prueba mínima.

**En caso de fallo:** Si el módulo falla en aislamiento pero funciona en la app completa (o viceversa), busca dependencias implícitas en variables globales o en el estado de la sesión padre.

## Validación

- [ ] La función UI del módulo acepta `id` como primer argumento y usa `NS(id)`
- [ ] Cada ID de entrada/salida en la UI está envuelto con `ns()`
- [ ] El server del módulo usa `moduleServer(id, function(input, output, session) { ... })`
- [ ] La UI dinámica en el server usa `session$ns` para los IDs
- [ ] El módulo puede instanciarse múltiples veces sin colisiones de IDs
- [ ] Los valores de retorno reactivos son accesibles para la app padre
- [ ] El módulo funciona en una app de prueba independiente mínima

## Errores Comunes

- **Olvidar `ns()` en `renderUI()`**: La UI dinámica creada dentro del server debe usar `session$ns` — el `ns` externo no está disponible dentro de `moduleServer()`.
- **Pasar datos no reactivos**: Los argumentos del módulo que cambian con el tiempo deben ser expresiones reactivas. Pasa `reactive(data)` no `data`.
- **Incompatibilidad de IDs**: La cadena `id` en la llamada UI debe coincidir exactamente con el `id` en la llamada server.
- **No devolver reactivos**: Si el módulo calcula algo que necesita el padre, debe `return()` un reactivo. Olvidarlo es un bug silencioso.
- **Espacio de nombres en módulos anidados**: En UI: `ns("inner_id")`. En server: solo `"inner_id"`. Mezclar esto causa doble envolvimiento del espacio de nombres o prefijos faltantes.

## Habilidades Relacionadas

- `scaffold-shiny-app` — configurar la estructura de la app antes de añadir módulos
- `test-shiny-app` — probar módulos con tests unitarios testServer()
- `design-shiny-ui` — layout y temas bslib para UIs de módulos
- `optimize-shiny-performance` — patrones de caché y async dentro de módulos
