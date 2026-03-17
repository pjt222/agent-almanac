---
name: optimize-shiny-performance
description: >
  Perfilar y optimizar el rendimiento de aplicaciones Shiny usando profvis,
  bindCache, memoise, async/promises, debounce/throttle y ExtendedTask para
  computaciones de larga duración. Úsalo cuando la app se siente lenta o no
  responde durante la interacción del usuario, cuando los recursos del servidor
  se agotan bajo carga concurrente, cuando operaciones específicas crean
  cuellos de botella, o al preparar una app para despliegue en producción con
  muchos usuarios concurrentes.
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
  complexity: advanced
  language: R
  tags: shiny, performance, profiling, caching, async, promises, optimization
---

# Optimize Shiny Performance

Perfilar, diagnosticar y optimizar el rendimiento de aplicaciones Shiny mediante caché, operaciones async y optimización del grafo reactivo.

## Cuándo Usar

- La app Shiny se siente lenta o no responde durante la interacción del usuario
- Los recursos del servidor se agotan bajo carga de usuarios concurrentes
- Operaciones específicas (carga de datos, gráficos, computación) crean cuellos de botella
- Al preparar una app para despliegue en producción con muchos usuarios

## Entradas

- **Requerido**: Ruta a la aplicación Shiny
- **Requerido**: Descripción del problema de rendimiento (carga lenta, interacción lenta, memoria alta)
- **Opcional**: Número de usuarios concurrentes esperados
- **Opcional**: Recursos disponibles del servidor (RAM, núcleos CPU)
- **Opcional**: Si la app usa una base de datos o API externa

## Procedimiento

### Paso 1: Perfilar la Aplicación

```r
# Perfilar con profvis
profvis::profvis({
  shiny::runApp("path/to/app", display.mode = "normal")
})

# O perfilar operaciones específicas
profvis::profvis({
  result <- expensive_computation(data)
})
```

Identifica los principales cuellos de botella:
1. **Carga de datos**: ¿Cuánto tarda la recuperación inicial de datos?
2. **Recalculación reactiva**: ¿Qué reactivos se activan con más frecuencia?
3. **Renderizado**: ¿Qué salidas tardan más en renderizarse?
4. **Llamadas externas**: ¿Consultas de base de datos, solicitudes de API, E/S de archivos?

Usa el registro reactivo para análisis del grafo reactivo:

```r
# Habilitar el registro reactivo
options(shiny.reactlog = TRUE)
shiny::runApp("path/to/app")
# Presiona Ctrl+F3 en el navegador para ver el grafo reactivo
```

**Esperado:** Identificación clara de los 2-3 mayores cuellos de botella.

**En caso de fallo:** Si profvis no muestra detalles útiles, envuelve secciones específicas con `profvis::profvis()`. Si reactlog es abrumador, céntrate en una interacción a la vez.

### Paso 2: Optimizar el Grafo Reactivo

Reduce las invalidaciones reactivas innecesarias:

```r
# MAL: Recalcula con CUALQUIER cambio de entrada
output$plot <- renderPlot({
  data <- load_data()  # Se ejecuta cada vez
  filtered <- data[data$category == input$category, ]
  plot(filtered)
})

# BIEN: Aislar la carga de datos del filtrado
raw_data <- reactive({
  load_data()
}) |> bindCache()  # Cachear la parte costosa

filtered_data <- reactive({
  raw_data()[raw_data()$category == input$category, ]
})

output$plot <- renderPlot({
  plot(filtered_data())
})
```

Usa `isolate()` para prevenir invalidaciones innecesarias:

```r
# Solo recalcula cuando se hace clic en el botón, no con cada cambio de entrada
output$result <- renderText({
  input$compute  # Tomar dependencia del botón
  isolate({
    paste("N =", input$n, "Mean =", mean(rnorm(input$n)))
  })
})
```

Usa `debounce()` y `throttle()` para entradas de alta frecuencia:

```r
# Debounce de entrada de texto — esperar 500ms después de que el usuario deje de escribir
search_text <- reactive(input$search) |> debounce(500)

# Throttle del slider — actualizar como máximo cada 250ms
slider_value <- reactive(input$slider) |> throttle(250)
```

**Esperado:** El grafo reactivo solo activa los recálculos necesarios.

**En caso de fallo:** Si eliminar una dependencia rompe la funcionalidad, usa `req()` para añadir guardas explícitas en lugar de depender de dependencias reactivas implícitas.

### Paso 3: Implementar Caché

#### bindCache para Salidas Shiny

```r
output$plot <- renderPlot({
  create_expensive_plot(filtered_data())
}) |> bindCache(input$category, input$date_range)

output$table <- renderDT({
  expensive_query(input$filters)
}) |> bindCache(input$filters)
```

`bindCache` usa los valores de entrada como claves de caché. Cuando las mismas entradas ocurren de nuevo, el resultado en caché se devuelve inmediatamente.

#### memoise para Funciones

```r
# Cachear resultados de funciones costosas
load_reference_data <- memoise::memoise(
  function(dataset_name) {
    readr::read_csv(paste0("data/", dataset_name, ".csv"))
  },
  cache = cachem::cache_disk("cache/", max_age = 3600)
)
```

#### Pre-computación de Datos a Nivel de App

```r
# En global.R o fuera de la función server — computado una vez al iniciar la app
reference_data <- readr::read_csv("data/reference.csv")
model <- readRDS("models/trained_model.rds")

server <- function(input, output, session) {
  # reference_data y model están disponibles para todas las sesiones
  # sin volver a cargar
}
```

**Esperado:** Las operaciones repetidas usan resultados en caché; el tiempo de respuesta cae significativamente.

**En caso de fallo:** Si la caché crece demasiado, establece límites `max_age` o `max_size`. Si los valores en caché son obsoletos, reduce `max_age` o añade un botón para limpiar la caché. Si `bindCache` causa errores, asegúrate de que las entradas de la clave de caché sean serializables.

### Paso 4: Añadir Async para Operaciones Largas

Usa `ExtendedTask` (Shiny >= 1.8.1) para computaciones de larga duración:

```r
server <- function(input, output, session) {
  # Definir la tarea extendida
  analysis_task <- ExtendedTask$new(function(data, params) {
    promises::future_promise({
      # Esto se ejecuta en un proceso en segundo plano
      run_heavy_analysis(data, params)
    })
  }) |> bind_task_button("run_analysis")

  # Activar la tarea
  observeEvent(input$run_analysis, {
    analysis_task$invoke(dataset(), input$params)
  })

  # Usar el resultado
  output$result <- renderTable({
    analysis_task$result()
  })
}
```

Para apps en Shiny < 1.8.1, usa promises directamente:

```r
library(promises)
library(future)
plan(multisession, workers = 4)

server <- function(input, output, session) {
  result <- eventReactive(input$compute, {
    future_promise({
      Sys.sleep(5)  # Simular computación larga
      expensive_analysis(isolate(input$params))
    })
  })

  output$table <- renderTable({
    result()
  })
}
```

**Esperado:** Las operaciones largas no bloquean la UI; otros usuarios pueden interactuar mientras la computación se ejecuta.

**En caso de fallo:** Si `future_promise` da error, verifica que `plan(multisession)` esté configurado. Si las variables no están disponibles en el futuro, pásalas explícitamente — los futuros se ejecutan en procesos R separados.

### Paso 5: Optimizar el Renderizado

Reduce la sobrecarga de renderizado:

```r
# Usar plotly para gráficos interactivos en lugar de volver a renderizar
output$plot <- plotly::renderPlotly({
  plotly::plot_ly(filtered_data(), x = ~x, y = ~y, type = "scatter")
})

# Usar DT del lado del servidor para tablas grandes
output$table <- DT::renderDataTable({
  DT::datatable(large_data(), server = TRUE, options = list(
    pageLength = 25,
    processing = TRUE
  ))
})

# UI condicional para evitar renderizar elementos ocultos
output$details <- renderUI({
  req(input$show_details)
  expensive_details_ui()
})
```

**Esperado:** Las operaciones de renderizado son más rápidas y no bloquean la UI.

**En caso de fallo:** Si plotly es lento con conjuntos de datos grandes, usa `toWebGL()` para renderizado WebGL o reduce la muestra de datos antes de graficar.

### Paso 6: Validar las Mejoras de Rendimiento

```r
# Benchmarking antes/después
system.time({
  shiny::testServer(myModuleServer, args = list(...), {
    session$setInputs(category = "A")
    session$flushReact()
  })
})

# Pruebas de carga con shinyloadtest
shinyloadtest::record_session("http://localhost:3838")
shinyloadtest::shinycannon(
  "recording.log",
  "http://localhost:3838",
  workers = 10,
  loaded_duration_minutes = 5
)
shinyloadtest::shinyloadtest_report("recording.log")
```

**Esperado:** Mejora medible en los tiempos de respuesta y/o capacidad de usuarios concurrentes.

**En caso de fallo:** Si el rendimiento no mejoró, vuelve a perfilar para encontrar el siguiente cuello de botella. La optimización del rendimiento es iterativa — corrige primero el mayor cuello de botella y luego vuelve a medir.

## Validación

- [ ] El perfilado identifica cuellos de botella específicos (sin suposiciones)
- [ ] El grafo reactivo no tiene cadenas de invalidación innecesarias
- [ ] Las operaciones costosas usan caché (bindCache o memoise)
- [ ] Las computaciones de larga duración usan async (ExtendedTask o promises)
- [ ] Las entradas de alta frecuencia usan debounce/throttle
- [ ] Los conjuntos de datos grandes usan procesamiento del lado del servidor
- [ ] La mejora del rendimiento es medible (tiempos antes/después)

## Errores Comunes

- **Optimización prematura**: Perfila primero. El cuello de botella raramente está donde crees.
- **Bugs de invalidación de caché**: Si los usuarios ven datos obsoletos, la clave de caché no incluye todas las entradas relevantes. Añade las dependencias faltantes a `bindCache()`.
- **Alcance de variables en futuros**: `future_promise` se ejecuta en un proceso separado. Las variables globales, conexiones de base de datos y valores reactivos deben capturarse explícitamente.
- **Espagueti reactivo**: Si el grafo reactivo es demasiado complejo para entender, la app necesita refactorización arquitectural (módulos), no solo caché.
- **Sobre-cachear**: Cachear todo desperdicia memoria. Solo cachea operaciones que son costosas Y tienen patrones de entrada repetidos.

## Habilidades Relacionadas

- `build-shiny-module` — arquitectura modular para código reactivo mantenible
- `scaffold-shiny-app` — elegir el framework correcto de la app desde el inicio
- `deploy-shiny-app` — desplegar apps optimizadas con recursos de servidor apropiados
- `test-shiny-app` — tests de regresión de rendimiento
