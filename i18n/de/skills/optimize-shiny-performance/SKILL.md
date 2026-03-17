---
name: optimize-shiny-performance
description: >
  Shiny-App-Performance durch Profiling, Caching, asynchrone Operationen
  und effizientes Reactive-Design optimieren. Behandelt profvis-Profiling,
  bindCache(), promises/future für Hintergrundtasks und UI-Rendering-
  Optimierungen. Verwenden, wenn eine Shiny-App langsam reagiert, viele
  Nutzer gleichzeitig bedient werden sollen oder Berechnungen Sekunden
  dauern.
license: MIT
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: shiny
  complexity: advanced
  language: R
  tags: shiny, performance, caching, async, profiling, optimization
---

# Shiny-Performance optimieren

Shiny-App-Engpässe identifizieren und beheben durch systematisches Profiling und gezielte Optimierungen.

## Wann verwenden

- App reagiert langsam auf User-Inputs
- Mehrere gleichzeitige Nutzer bedient werden sollen
- Berechnungen Sekunden dauern und UI blockieren
- Hohe Server-CPU oder RAM-Nutzung beobachtet wird

## Eingaben

- **Erforderlich**: Laufende Shiny-App mit messbaren Performance-Problemen
- **Optional**: Profiling-Ziele (spezifische Inputs oder Szenarien)
- **Optional**: Ziel-Nutzeranzahl (für Last-Tests)

## Vorgehensweise

### Schritt 1: Performance mit profvis profilieren

Engpässe identifizieren, bevor optimiert wird.

```r
install.packages("profvis")
library(profvis)

# App-Code profilieren
profvis({
  # App-Session simulieren
  shinyApp(ui, server)
}, interval = 0.01)

# Oder spezifische Funktion profilieren
profvis({
  result <- expensive_computation(data)
})
```

In `profvis`-Flammendiagramm nach suchen:
- Breiten Balken = viel Zeit verbracht
- Tief verschachtelte Calls = potenzielle Optimierungspunkte
- R-interne Funktionen (hellgrau) = wenig optimierbar

```r
# Einzelne Funktion zeitmessen
system.time({
  result <- slow_function(large_data)
})
```

**Erwartet:** Profiling-Ergebnis zeigt Flammendiagramm. Langsame Funktionen identifiziert.

**Bei Fehler:** Wenn profvis App nicht öffnen kann, `profvis({ source("app.R") })` verwenden, oder Profiling auf einzelne Funktionen beschränken.

### Schritt 2: Reaktive Berechnungen optimieren

Unnötige Re-Evaluierungen reaktiver Ausdrücke verhindern.

```r
# Schlecht: Daten bei jedem Input-Change neu laden
server <- function(input, output, session) {
  output$plot <- renderPlot({
    data <- read.csv("large_data.csv")  # Jedes Mal neu laden!
    filter(data, category == input$category) |>
      ggplot(aes(x, y)) + geom_point()
  })
}

# Besser: Daten einmal laden, Filtering reaktiv halten
server <- function(input, output, session) {
  # Einmal laden beim App-Start
  data <- read.csv("large_data.csv")

  filtered_data <- reactive({
    filter(data, category == input$category)
  })

  output$plot <- renderPlot({
    ggplot(filtered_data(), aes(x, y)) + geom_point()
  })
}
```

Reaktive Abhängigkeiten minimieren:

```r
# Übermäßige Reaktivität: plot re-rendert bei JEDER Input-Änderung
output$plot <- renderPlot({
  # input$color, input$size, input$title — alle trigger re-render
  plot(data, col = input$color, cex = input$size, main = input$title)
})

# Besser: Nur bei relevanten Input-Änderungen neu rendern
plot_data <- reactive({
  # Nur Datentransformationen hier
  prepare_plot_data(data, input$filter)
})

output$plot <- renderPlot({
  # Rendering vom Styling trennen
  p <- base_plot(plot_data())
  p + theme_custom(input$color, input$size, input$title)
})
```

**Erwartet:** Reduzierte Anzahl unnötiger Berechnungen. Reaktive Graph kleiner und klarer.

**Bei Fehler:** Wenn nach Optimierung falsche Daten angezeigt werden, reaktive Abhängigkeiten mit `reactlog::reactlog_enable()` visualisieren.

### Schritt 3: Output-Caching mit bindCache

Teure Berechnungen cachen, die sich selten ändern.

```r
library(shiny)

server <- function(input, output, session) {
  # Plot-Output cachen
  output$expensive_plot <- renderPlot({
    Sys.sleep(2)  # Zeitintensive Berechnung simulieren
    create_complex_plot(input$dataset, input$year)
  }) |>
    bindCache(input$dataset, input$year)  # Cache-Schlüssel

  # Reaktiven Wert cachen
  expensive_result <- reactive({
    run_model(input$params)
  }) |>
    bindCache(input$params)

  # Cache auf Disk (persistent über App-Neustarts)
  output$persistent_plot <- renderPlot({
    generate_report_chart(input$report_id)
  }) |>
    bindCache(input$report_id, cache = cachem::cache_disk("./cache"))
}
```

Cache-Strategie wählen:
- `cachem::cache_mem()` — In-Memory (Standard, App-Lebensdauer)
- `cachem::cache_disk()` — Auf Disk (persistent über Neustarts)
- Globaler Cache mit `shinyOptions(cache = cachem::cache_mem(max_size = 500e6))`

**Erwartet:** Erster Aufruf langsam, nachfolgende Aufrufe mit denselben Inputs sofort. Cache-Trefferrate in Logs sichtbar.

**Bei Fehler:** Wenn gecachte Daten veraltet sind, Cache-Schlüssel um Timestamp oder Datenversion erweitern: `bindCache(input$id, file.mtime("data.csv"))`.

### Schritt 4: Asynchrone Operationen für lange Tasks

Hintergrundtasks implementieren, um UI-Blocking zu vermeiden.

```r
install.packages(c("future", "promises"))

library(future)
library(promises)

# Worker-Pool einrichten
plan(multisession, workers = 4)

server <- function(input, output, session) {
  # Asynchrone Berechnung
  result <- eventReactive(input$run, {
    future_promise({
      # Dieser Code läuft in Hintergrund-Worker
      Sys.sleep(5)  # Lange Berechnung
      run_analysis(isolate(input$params))
    })
  })

  # Output rendert nach Promise-Auflösung
  output$result_table <- renderTable({
    result()  # Automatisch auf Promise warten
  })

  # Fortschritt anzeigen (mit shiny::withProgress)
  output$progress_plot <- renderPlot({
    req(result())
    plot_results(result())
  })
}
```

Für Shiny mit ExtendedTask (Shiny 1.8.1+):

```r
long_task <- ExtendedTask$new(function(params) {
  future_promise({
    run_long_analysis(params)
  })
})

observeEvent(input$run, {
  long_task$invoke(input$params)
})

output$result <- renderTable({
  long_task$result()
})
```

**Erwartet:** UI bleibt während Hintergrundberechnung responsiv. Andere Nutzer nicht blockiert.

**Bei Fehler:** Wenn `plan(multisession)` fehlschlägt in Windows/WSL, `plan(multicore)` versuchen. Wenn Promises nicht auflösen, `then()`-Kette auf korrekte Verkettung prüfen.

### Schritt 5: Datenladen optimieren

Datei-I/O und Datenbankabfragen optimieren.

```r
# Strategie 1: Daten einmalig beim App-Start laden (außerhalb Server-Funktion)
# Diese Daten werden über alle Sessions geteilt
large_dataset <- readRDS("data/processed_data.rds")

# Strategie 2: Lazy Loading für selten genutzte Daten
get_data <- local({
  cache <- NULL
  function() {
    if (is.null(cache)) {
      cache <<- read.csv("large_file.csv")
    }
    cache
  }
})

# Strategie 3: Paginierung für große Tabellen
server <- function(input, output, session) {
  output$big_table <- renderDT({
    # Nur aktuelle Seite laden statt alle Daten
    DT::datatable(
      large_dataset,
      options = list(
        pageLength = 25,
        processing = TRUE,
        serverSide = TRUE  # Server-seitige Paginierung
      )
    )
  })
}
```

**Erwartet:** Datenladen deutlich schneller. App-Start-Zeit reduziert.

**Bei Fehler:** Wenn geteilte Daten zu Concurrency-Problemen führen, sicherstellen, dass Daten nur gelesen werden (nicht verändert). Schreibzugriff erfordert reaktive Isolation per Session.

### Schritt 6: UI-Rendering und Netzwerk optimieren

Rendering-Performance auf Client-Seite verbessern.

```r
# Große Plots lazy rendern
output$heavy_plot <- renderPlot({
  req(input$show_plot)  # Nur rendern wenn explizit angefordert
  create_complex_visualization(data)
}) |>
  bindCache(input$show_plot, input$params)

# UI-Updates bündeln
observeEvent(input$bulk_update, {
  # Alle UI-Updates in einer Session-Runde
  freezeReactiveValue(input, "filter1")
  freezeReactiveValue(input, "filter2")
  updateSelectInput(session, "filter1", choices = new_choices1)
  updateSelectInput(session, "filter2", choices = new_choices2)
})

# Große Tabellen mit DT statt renderTable
output$table <- DT::renderDT({
  DT::datatable(large_data, options = list(dom = 'tp', pageLength = 10))
})
```

**Erwartet:** UI-Rendering schneller. Weniger Netzwerk-Round-Trips zwischen Client und Server.

**Bei Fehler:** Wenn Plots langsam sind trotz Caching, Plot-Auflösung reduzieren: `renderPlot(..., res = 72)` statt Standard 96 dpi.

## Validierung

- [ ] profvis identifiziert Haupt-Engpässe
- [ ] Reaktive Ausdrücke nur wenn nötig neu evaluiert
- [ ] `bindCache()` reduziert Berechnungszeit für wiederholte Inputs
- [ ] Asynchrone Tasks blockieren UI nicht
- [ ] Datenladen außerhalb Session für geteilte Daten
- [ ] Profiling nach Optimierung zeigt messbare Verbesserung

## Haeufige Stolperfallen

- **Vorzeitige Optimierung**: Immer zuerst profilieren. Ohne Profiling wird oft der falsche Code optimiert.
- **Geteilte Mutable State**: Globale Variablen, die zwischen Sessions geteilt werden, verursachen Race Conditions. Nur immutable Daten global teilen.
- **Cache-Invalidierung**: Gecachte Plots werden nicht automatisch bei Datenänderungen invalidiert — Cache-Schlüssel müssen Datenversionen einschließen.
- **`future` in `observe`**: Futures innerhalb von `observe()` ohne `promises` sind nicht sicher. Immer `future_promise()` mit `then()` oder `%...>%` Pipe verwenden.
- **Over-Isolierung**: Zu viele `isolate()`-Aufrufe unterbrechen reaktive Kette und führen zu veralteten Daten.
- **Render-Debouncing**: Bei sehr schnellen Input-Änderungen (z. B. Slider) `debounce()` oder `throttle()` verwenden, um unnötige Re-Renders zu vermeiden.

## Verwandte Skills

- `build-shiny-module` — Modulstruktur hilft beim Isolieren und Optimieren von Komponenten
- `deploy-shiny-app` — Optimierte App deployen
- `deploy-shinyproxy` — Multi-Worker-Setup für Skalierung
