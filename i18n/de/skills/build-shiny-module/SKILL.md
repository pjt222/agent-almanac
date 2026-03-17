---
name: build-shiny-module
description: >
  Wiederverwendbare Shiny-Module mit UI/Server-Paaren erstellen. Behandelt
  Namespace-Isolation, Kommunikation zwischen Modulen über reactive Values
  und die Integration in die Haupt-App. Verwenden, wenn App-Logik in
  verwaltbare Teile aufgeteilt, UI-Komponenten wiederverwendet oder
  Namespace-Konflikte in großen Shiny-Apps vermieden werden sollen.
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
  complexity: intermediate
  language: R
  tags: shiny, modules, namespacing, reactive, r-packages
---

# Shiny-Modul erstellen

Wiederverwendbare Shiny-Module mit korrekt isolierten Namespaces und sauberer API erstellen.

## Wann verwenden

- App-Logik in verwaltbare, testbare Einheiten aufteilen
- UI-Komponenten über mehrere Apps oder App-Teile wiederverwenden
- Namespace-Konflikte in großen Shiny-Apps mit vielen Inputs/Outputs vermeiden
- Teams arbeiten an verschiedenen App-Teilen unabhängig voneinander

## Eingaben

- **Erforderlich**: Modulname (z. B. `dataFilter`, `plotViewer`)
- **Erforderlich**: Welche Daten/Werte das Modul empfangen und zurückgeben soll
- **Optional**: Ob das Modul reaktive Werte zurückgeben soll (für Modul-zu-Modul-Kommunikation)

## Vorgehensweise

### Schritt 1: Modul-Struktur planen

Die Modul-API definieren, bevor Code geschrieben wird.

Für jedes Modul entscheiden:
- **Inputs** (Parameter der UI-Funktion): Statische Konfiguration — Beschriftungen, Optionen
- **Server-Inputs** (Parameter der Server-Funktion): Reaktive Werte von Elternkomponente
- **Outputs** (Rückgabewert der Server-Funktion): Reaktive Werte, die andere Module verwenden

Beispiel: Datenfilter-Modul
- UI bekommt: `id`, optionale Beschriftungen
- Server bekommt: `data` (reaktiv — DataFrame)
- Server gibt zurück: `filtered_data` (reaktiv — gefilterter DataFrame)

**Erwartet:** Klar dokumentierte Modul-API vor Implementierung.

**Bei Fehler:** Wenn die API unklar ist, mit einer Minimalversion starten und iterieren. Übermäßig komplizierte Modul-APIs sind ein häufiges Problem.

### Schritt 2: Modul-UI-Funktion erstellen

Die UI-Komponente mit korrektem Namespace-Handling implementieren.

```r
# R/mod_data_filter.R
#' Datenfilter-Modul UI
#'
#' @param id Modul-ID (wird für Namespace-Isolation verwendet)
#' @param label Beschriftung für Datensatz-Auswahl
#' @export
mod_data_filter_ui <- function(id, label = "Datensatz auswählen") {
  ns <- NS(id)  # Namespace-Funktion erstellen

  tagList(
    selectInput(
      inputId = ns("dataset"),  # ns() auf alle IDs anwenden
      label = label,
      choices = c("iris", "mtcars", "airquality")
    ),
    sliderInput(
      inputId = ns("n_rows"),
      label = "Anzahl Zeilen",
      min = 1,
      max = 150,
      value = 10
    ),
    actionButton(
      inputId = ns("apply"),
      label = "Filter anwenden"
    )
  )
}
```

**Erwartet:** Alle Input/Output-IDs werden durch `ns()` geleitet. UI rendert ohne Fehler.

**Bei Fehler:** Wenn Fehler wie "undefined input" erscheinen, sicherstellen, dass ALLE IDs (nicht nur einige) durch `ns()` geleitet werden, einschließlich Outputs in `renderUI()`.

### Schritt 3: Modul-Server-Funktion erstellen

Die Server-Logik mit reaktiven Werten und Rückgabewert implementieren.

```r
#' Datenfilter-Modul Server
#'
#' @param id Modul-ID (muss UI-ID entsprechen)
#' @param data Reaktiver DataFrame, der gefiltert werden soll
#' @return Reaktiver gefilterter DataFrame
#' @export
mod_data_filter_server <- function(id, data) {
  # Validierung der Eingaben
  stopifnot(is.reactive(data))

  moduleServer(id, function(input, output, session) {
    # Gefilterte Daten als reaktiven Wert
    filtered <- eventReactive(input$apply, {
      df <- get(input$dataset)
      head(df, input$n_rows)
    }, ignoreNULL = FALSE)

    # Optional: Vorschau im Modul rendern
    output$preview <- renderTable({
      filtered()
    })

    # Reaktiven Wert zurückgeben, damit Elternkomponente ihn verwenden kann
    return(filtered)
  })
}
```

**Erwartet:** Server-Funktion verwendet `moduleServer()`. Reaktive Werte werden korrekt zurückgegeben.

**Bei Fehler:** Wenn `is.reactive(data)` fehlschlägt, sicherstellen, dass der Eltern-Server einen reaktiven Ausdruck übergibt (z. B. `reactive({ ... })`), nicht einen rohen Wert.

### Schritt 4: Module in Haupt-App integrieren

Das Modul in `app_ui.R` und `app_server.R` (oder `app.R`) einbinden.

```r
# R/app_ui.R (oder ui in app.R)
app_ui <- function(request) {
  fluidPage(
    titlePanel("Meine App mit Modulen"),
    sidebarLayout(
      sidebarPanel(
        # Modul-UI aufrufen mit eindeutiger ID
        mod_data_filter_ui("filter1", label = "Hauptdatensatz"),
        mod_data_filter_ui("filter2", label = "Vergleichsdatensatz")
      ),
      mainPanel(
        fluidRow(
          column(6, tableOutput("table1")),
          column(6, tableOutput("table2"))
        )
      )
    )
  )
}

# R/app_server.R (oder server in app.R)
app_server <- function(input, output, session) {
  # Reaktive Datenquelle
  raw_data <- reactive({ iris })

  # Modul-Server aufrufen — dieselbe ID wie UI
  filtered1 <- mod_data_filter_server("filter1", data = raw_data)
  filtered2 <- mod_data_filter_server("filter2", data = raw_data)

  # Modul-Outputs in Haupt-App verwenden
  output$table1 <- renderTable({ filtered1() })
  output$table2 <- renderTable({ filtered2() })
}
```

**Erwartet:** Beide Modulinstanzen unabhängig voneinander funktionieren. IDs "filter1" und "filter2" isolieren ihre Inputs/Outputs.

**Bei Fehler:** Wenn Module sich gegenseitig beeinflussen, prüfen ob beide UI und Server denselben `id`-Parameter verwenden. Unterschiedliche IDs = vollständige Isolation.

### Schritt 5: Modul-zu-Modul-Kommunikation

Mehrere Module miteinander kommunizieren lassen.

```r
# Fortgeschrittenes Muster: ReactiveValues für bidirektionale Kommunikation
app_server <- function(input, output, session) {
  # Gemeinsamer Status zwischen Modulen
  shared <- reactiveValues(
    selected_id = NULL,
    filter_active = FALSE
  )

  # Modul 1 aktualisiert shared state
  observeEvent(mod_selector_server("selector", shared = shared), {
    # Modul signalisiert über reactiveValues
  })

  # Modul 2 reagiert auf shared state
  mod_detail_server("detail", shared = shared)
}
```

Einfacheres Muster — Reaktive weitergeben:

```r
app_server <- function(input, output, session) {
  # Modul 1 gibt reaktiven Wert zurück
  selected_item <- mod_list_server("list")

  # Modul 2 empfängt reaktiven Wert von Modul 1
  mod_detail_server("detail", item = selected_item)
}
```

**Erwartet:** Module kommunizieren über reaktive Werte oder reactiveValues ohne direkte Kopplung.

**Bei Fehler:** Wenn Modul-Kommunikation nicht funktioniert, sicherstellen, dass reaktive Werte nicht "ausgepackt" werden (d. h. `selected_item` nicht `selected_item()` beim Weitergeben).

### Schritt 6: Modul testen

Modul isoliert mit `testServer()` testen.

```r
# tests/testthat/test-mod_data_filter.R
library(testthat)
library(shiny)

test_that("data filter module returns filtered data", {
  # Reaktive Testdaten erstellen
  test_data <- reactive({ iris })

  testServer(
    mod_data_filter_server,
    args = list(data = test_data),
    {
      # Input-Werte simulieren
      session$setInputs(dataset = "iris", n_rows = 5, apply = 1)

      # Rückgabewert prüfen
      result <- session$returned()
      expect_s3_class(result(), "data.frame")
      expect_equal(nrow(result()), 5)
    }
  )
})
```

**Erwartet:** Tests laufen mit `testthat::test_file()`. Assertions prüfen Modul-Verhalten.

**Bei Fehler:** Wenn `session$returned()` nicht verfügbar ist, sicherstellen, dass Server-Funktion einen reaktiven Wert explizit zurückgibt (letzter Ausdruck oder `return()`).

## Validierung

- [ ] Modul-UI verwendet `NS(id)` und leitet alle IDs durch `ns()`
- [ ] Modul-Server verwendet `moduleServer(id, ...)`
- [ ] Modul gibt reaktive Werte zurück (für Kommunikation mit Elternkomponente)
- [ ] Zwei Modulinstanzen mit verschiedenen IDs sind vollständig isoliert
- [ ] Integration in Haupt-App funktioniert
- [ ] Modul-Tests laufen ohne Fehler

## Haeufige Stolperfallen

- **Vergessenes `ns()` für IDs**: Jedes `inputId`, `outputId` und ID in `tagList` muss durch `ns()` geleitet werden. Fehlende Namespace-Wrapping verursacht subtile Bugs.
- **Reaktive Werte vs reaktive Ausdrücke zurückgeben**: `reactiveValues` und `reactive()` haben unterschiedliche Aufruf-Syntax. `reactiveValues$x` vs `reactive_expr()`.
- **Modul-ID-Gleichheit**: UI und Server MÜSSEN dieselbe ID verwenden. Selbst ein Tippfehler bricht die Namespace-Isolation.
- **`ignoreNULL` in `eventReactive`**: Standardmäßig feuert `eventReactive` nicht, wenn Event-Auslöser NULL ist. `ignoreNULL = FALSE` für Initialisierung beim Laden.
- **Verschachtelte Module**: Module können andere Module enthalten — die Namespace-Funktion korrekt durch alle Ebenen weitergeben.
- **Modul-Tests brauchen reaktive Kontexte**: Immer `testServer()` für Unit-Tests verwenden, da `moduleServer()` reaktiven Kontext erfordert.

## Verwandte Skills

- `scaffold-shiny-app` — Shiny-App scaffolden, bevor Module hinzugefügt werden
- `test-shiny-app` — vollständige App-Tests mit shinytest2
- `design-shiny-ui` — UI-Gestaltung und Theming
