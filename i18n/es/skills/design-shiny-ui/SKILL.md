---
name: design-shiny-ui
description: >
  Diseñar interfaces de usuario de aplicaciones Shiny usando bslib para
  temas, layout_columns para cuadrículas responsivas, cajas de valor, tarjetas
  y CSS/SCSS personalizado. Cubre layouts de página, accesibilidad y coherencia
  de marca. Úsalo al construir una nueva UI de app Shiny desde cero, al
  modernizar una app existente de fluidPage a bslib, al aplicar temas de marca,
  al hacer una app Shiny responsiva en diferentes tamaños de pantalla, o al
  mejorar la accesibilidad de una aplicación Shiny.
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
  tags: shiny, bslib, ui, theming, layout, css, accessibility, responsive
---

# Design Shiny UI

Diseñar interfaces de aplicaciones Shiny responsivas y accesibles usando temas bslib, primitivas de layout modernas y CSS personalizado.

## Cuándo Usar

- Al construir una nueva UI de app Shiny desde cero
- Al modernizar una app Shiny existente de fluidPage a bslib
- Al aplicar temas de marca (colores, fuentes) a una app Shiny
- Al hacer una app Shiny responsiva en diferentes tamaños de pantalla
- Al mejorar la accesibilidad de una aplicación Shiny

## Entradas

- **Requerido**: Propósito de la aplicación y audiencia objetivo
- **Requerido**: Tipo de layout (sidebar, navbar, fillable, dashboard)
- **Opcional**: Colores y fuentes de marca
- **Opcional**: Si usar CSS/SCSS personalizado (predeterminado: solo bslib)
- **Opcional**: Requisitos de accesibilidad (nivel WCAG)

## Procedimiento

### Paso 1: Elegir el Layout de Página

bslib proporciona varios constructores de página:

```r
# Layout sidebar — el más común para apps de datos
ui <- page_sidebar(
  title = "My App",
  sidebar = sidebar("Controls here"),
  "Main content here"
)

# Layout navbar — para apps de múltiples páginas
ui <- page_navbar(
  title = "My App",
  nav_panel("Tab 1", "Content 1"),
  nav_panel("Tab 2", "Content 2"),
  nav_spacer(),
  nav_item(actionButton("help", "Help"))
)

# Layout fillable — el contenido llena el espacio disponible
ui <- page_fillable(
  card(
    full_screen = TRUE,
    plotOutput("plot")
  )
)

# Layout dashboard — cuadrícula de cajas de valor y tarjetas
ui <- page_sidebar(
  title = "Dashboard",
  sidebar = sidebar(open = "closed", "Filters"),
  layout_columns(
    fill = FALSE,
    value_box("Revenue", "$1.2M", theme = "primary"),
    value_box("Users", "4,521", theme = "success"),
    value_box("Uptime", "99.9%", theme = "info")
  ),
  layout_columns(
    card(plotOutput("chart1")),
    card(plotOutput("chart2"))
  )
)
```

**Esperado:** El layout de página coincide con las necesidades de navegación y contenido de la aplicación.

**En caso de fallo:** Si el layout no se ve bien, verifica que estés usando `page_sidebar()` / `page_navbar()` (bslib) y no `fluidPage()` / `navbarPage()` (shiny base). Las versiones bslib tienen mejores valores predeterminados y soporte de temas.

### Paso 2: Configurar el Tema bslib

```r
my_theme <- bslib::bs_theme(
  version = 5,                      # Bootstrap 5
  bootswatch = "flatly",            # Tema preestablecido opcional
  bg = "#ffffff",                   # Color de fondo
  fg = "#2c3e50",                   # Color de primer plano (texto)
  primary = "#2c3e50",              # Color primario de marca
  secondary = "#95a5a6",            # Color secundario
  success = "#18bc9c",
  info = "#3498db",
  warning = "#f39c12",
  danger = "#e74c3c",
  base_font = bslib::font_google("Source Sans Pro"),
  heading_font = bslib::font_google("Source Sans Pro", wght = 600),
  code_font = bslib::font_google("Fira Code"),
  "navbar-bg" = "#2c3e50"
)

ui <- page_sidebar(
  theme = my_theme,
  title = "Themed App",
  # ...
)
```

Usa el editor de temas interactivo durante el desarrollo:

```r
bslib::bs_theme_preview(my_theme)
```

**Esperado:** La app se renderiza con colores de marca, fuentes y componentes Bootstrap 5 coherentes.

**En caso de fallo:** Si las fuentes no cargan, verifica el acceso a internet (Google Fonts lo requiere) o cambia a fuentes del sistema: `font_collection("system-ui", "-apple-system", "Segoe UI")`. Si las variables del tema no se aplican, verifica que estés pasando `theme` a la función de página.

### Paso 3: Construir el Layout con Tarjetas y Columnas

```r
ui <- page_sidebar(
  theme = my_theme,
  title = "Analysis Dashboard",
  sidebar = sidebar(
    width = 300,
    title = "Filters",
    selectInput("dataset", "Dataset", choices = c("iris", "mtcars")),
    sliderInput("sample", "Sample %", 10, 100, 100, step = 10),
    hr(),
    actionButton("refresh", "Refresh", class = "btn-primary w-100")
  ),

  # Fila KPI — sin relleno
  layout_columns(
    fill = FALSE,
    col_widths = c(4, 4, 4),
    value_box(
      title = "Observations",
      value = textOutput("n_obs"),
      showcase = bsicons::bs_icon("table"),
      theme = "primary"
    ),
    value_box(
      title = "Variables",
      value = textOutput("n_vars"),
      showcase = bsicons::bs_icon("columns-gap"),
      theme = "info"
    ),
    value_box(
      title = "Missing",
      value = textOutput("n_missing"),
      showcase = bsicons::bs_icon("exclamation-triangle"),
      theme = "warning"
    )
  ),

  # Fila de contenido principal
  layout_columns(
    col_widths = c(8, 4),
    card(
      card_header("Distribution"),
      full_screen = TRUE,
      plotOutput("main_plot")
    ),
    card(
      card_header("Summary"),
      tableOutput("summary_table")
    )
  )
)
```

Primitivas de layout clave:
- `layout_columns()` — cuadrícula responsiva con `col_widths`
- `card()` — contenedor de contenido con cabecera/pie opcional
- `value_box()` — visualización de KPI con icono y tema
- `layout_sidebar()` — sidebar anidada dentro de tarjetas
- `navset_card_tab()` — tarjetas con pestañas

**Esperado:** Layout de cuadrícula responsiva que se adapta al tamaño de pantalla.

**En caso de fallo:** Si las columnas se apilan inesperadamente en pantallas anchas, verifica que la suma de `col_widths` sea 12 (cuadrícula Bootstrap). Si las tarjetas se superponen, asegúrate de `fill = FALSE` en las filas sin relleno.

### Paso 4: Añadir Elementos de UI Dinámicos

```r
server <- function(input, output, session) {
  output$dynamic_filters <- renderUI({
    data <- current_data()
    tagList(
      selectInput("col", "Column", choices = names(data)),
      if (is.numeric(data[[input$col]])) {
        sliderInput("range", "Range",
          min = min(data[[input$col]], na.rm = TRUE),
          max = max(data[[input$col]], na.rm = TRUE),
          value = range(data[[input$col]], na.rm = TRUE)
        )
      } else {
        selectInput("values", "Values",
          choices = unique(data[[input$col]]),
          multiple = TRUE
        )
      }
    )
  })

  # Paneles condicionales (sin viaje de ida y vuelta al servidor)
  # En UI:
  # conditionalPanel(
  #   condition = "input.show_advanced == true",
  #   numericInput("alpha", "Alpha", 0.05)
  # )
}
```

**Esperado:** Los elementos de UI se actualizan dinámicamente basándose en las selecciones del usuario y los datos.

**En caso de fallo:** Si la UI dinámica parpadea, usa `conditionalPanel()` (basado en CSS) en lugar de `renderUI()` donde sea posible. Si las entradas dinámicas pierden sus valores al volver a renderizar, añade `session$sendInputMessage()` para restaurar el estado.

### Paso 5: Añadir CSS/SCSS Personalizado (Opcional)

Para estilos más allá de las variables del tema bslib:

```r
# CSS en línea
ui <- page_sidebar(
  theme = my_theme,
  tags$head(tags$style(HTML("
    .sidebar { border-right: 2px solid var(--bs-primary); }
    .card-header { font-weight: 600; }
    .value-box .value { font-size: 2.5rem; }
  "))),
  # ...
)

# Archivo CSS externo (coloca en directorio www/)
ui <- page_sidebar(
  theme = my_theme,
  tags$head(tags$link(rel = "stylesheet", href = "custom.css")),
  # ...
)
```

Para integración SCSS con bslib:

```r
my_theme <- bslib::bs_theme(version = 5) |>
  bslib::bs_add_rules(sass::sass_file("www/custom.scss"))
```

**Esperado:** Estilos personalizados aplicados sin romper los temas de bslib.

**En caso de fallo:** Si el CSS personalizado entra en conflicto con bslib, usa variables CSS de Bootstrap (`var(--bs-primary)`) en lugar de colores hardcodeados. Esto garantiza que los cambios de tema se propaguen a los estilos personalizados.

### Paso 6: Garantizar la Accesibilidad

```r
# Añadir etiquetas ARIA a las entradas
selectInput("category", "Category",
  choices = c("A", "B", "C")
) |> tagAppendAttributes(`aria-describedby` = "category-help")

# Añadir texto alternativo a los gráficos
output$plot <- renderPlot({
  plot(data(), main = "Distribution of Values")
}, alt = "Histogram showing the distribution of selected values")

# Asegurar suficiente contraste de color en el tema
my_theme <- bslib::bs_theme(
  version = 5,
  bg = "#ffffff",      # Fondo blanco
  fg = "#212529"       # Texto oscuro — ratio de contraste 15.4:1
)

# Usar HTML semántico
tags$main(
  role = "main",
  tags$h1("Dashboard"),
  tags$section(
    `aria-label` = "Key Performance Indicators",
    layout_columns(
      # cajas de valor...
    )
  )
)
```

**Esperado:** La app cumple los estándares WCAG 2.1 AA para contraste de color, navegación por teclado y compatibilidad con lectores de pantalla.

**En caso de fallo:** Prueba con la auditoría de accesibilidad de las herramientas de desarrollo del navegador (Lighthouse). Verifica los ratios de contraste de color con el verificador de contraste de WebAIM. Asegúrate de que todos los elementos interactivos sean accesibles por teclado.

## Validación

- [ ] El layout de página se renderiza correctamente en anchos de escritorio y móvil
- [ ] El tema bslib se aplica consistentemente a todos los componentes
- [ ] Las cajas de valor se muestran con los temas e iconos correctos
- [ ] Las tarjetas se redimensionan correctamente en la cuadrícula responsiva
- [ ] El CSS personalizado usa variables de Bootstrap, no valores hardcodeados
- [ ] Todos los gráficos tienen texto alternativo para lectores de pantalla
- [ ] El contraste de color cumple WCAG AA (4.5:1 para texto)
- [ ] Los elementos interactivos son accesibles por teclado

## Errores Comunes

- **Mezclar UI de Shiny antigua y nueva**: No mezcles `fluidPage()` con componentes bslib. Usa exclusivamente `page_sidebar()`, `page_navbar()` o `page_fillable()`.
- **Colores hardcodeados en CSS**: Usa `var(--bs-primary)` en lugar de `#2c3e50`. Los colores hardcodeados se rompen cuando cambia el tema.
- **`fill = FALSE` faltante en filas sin relleno**: Las filas de cajas de valor y filas de resumen normalmente no deben estirarse para llenar el espacio disponible. Establece `fill = FALSE`.
- **Google Fonts en entornos sin conexión**: Si la app se despliega en una red aislada, usa fuentes del sistema o archivos de fuente auto-alojados en lugar de `font_google()`.
- **Ignorar el móvil**: Prueba con el modo responsivo del navegador. `layout_columns` se apila automáticamente en pantallas estrechas, pero el CSS personalizado puede no hacerlo.

## Habilidades Relacionadas

- `scaffold-shiny-app` — configuración inicial de la app incluyendo la configuración del tema
- `build-shiny-module` — crear componentes UI modulares
- `optimize-shiny-performance` — renderizado consciente del rendimiento
- `review-web-design` — revisión de diseño visual para layout, tipografía y color
- `review-ux-ui` — revisión de usabilidad y accesibilidad
