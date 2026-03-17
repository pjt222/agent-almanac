---
name: scaffold-shiny-app
description: >
  Shiny-App mit golem (produktionsreif), rhino (modularer Ansatz) oder
  Vanilla-Shiny (einfach) erstellen. Behandelt Projektstruktur, grundlegendes
  UI/Server-Setup und Verifikation der lokalen Ausführung. Verwenden, wenn
  eine neue Shiny-App gestartet oder zwischen Scaffolding-Frameworks
  gewählt werden soll.
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
  complexity: basic
  language: R
  tags: shiny, golem, rhino, scaffold, r-packages
---

# Shiny-App scaffolden

Eine neue Shiny-Anwendung mit dem geeigneten Framework für den Produktionsfall scaffolden.

## Wann verwenden

- Start einer neuen Shiny-App
- Wahl zwischen Scaffolding-Frameworks (golem, rhino, Vanilla)
- Einrichten einer standardisierten Projektstruktur für ein Team
- Schnelles Prototypen einer datengesteuerten Web-App in R

## Eingaben

- **Erforderlich**: App-Name (gültiger R-Paketname)
- **Erforderlich**: Framework-Wahl: `golem`, `rhino` oder `vanilla`
- **Optional**: Autor-Informationen für DESCRIPTION (bei golem/rhino)
- **Optional**: Ziel-Verzeichnis (Standard: aktuelles Verzeichnis)

## Vorgehensweise

### Schritt 1: Framework auswählen

Das richtige Scaffolding-Framework basierend auf Projektanforderungen auswählen.

| Framework | Wann verwenden |
|-----------|----------------|
| `golem` | Produktions-Apps, R-Paket-Struktur, CRAN-Deployment |
| `rhino` | Modulare Apps, box-Module, JavaScript-Assets |
| `vanilla` | Schnelle Prototypen, einfache Apps, kein Framework-Overhead |

**Erwartet:** Framework-Auswahl stimmt mit Projektkomplexität und Team-Expertise überein.

**Bei Fehler:** Wenn unsicher, mit `vanilla` beginnen und später auf golem/rhino migrieren, wenn die App wächst.

### Schritt 2: Projekt scaffolden

Das gewählte Framework installieren und das Projekt initialisieren.

**Für golem:**

```r
install.packages("golem")
golem::create_golem("myapp")
```

**Für rhino:**

```r
install.packages("rhino")
rhino::init("myapp")
```

**Für Vanilla Shiny:**

```r
install.packages("shiny")

# Projektstruktur manuell erstellen
dir.create("myapp")
dir.create("myapp/R")
dir.create("myapp/www")

# App-Dateien erstellen
file.create("myapp/app.R")
file.create("myapp/R/ui.R")
file.create("myapp/R/server.R")
```

**Erwartet:** Projektverzeichnis mit Framework-spezifischer Struktur erstellt.

**Bei Fehler:** Wenn Package-Installation fehlschlägt, prüfen ob CRAN erreichbar ist: `options(repos = c(CRAN = "https://cran.rstudio.com/"))`. Für golem auf GitHub: `remotes::install_github("Thinkr-open/golem")`.

### Schritt 3: Basis-UI und Server einrichten

Grundlegende UI- und Server-Komponenten implementieren.

**Für golem (`R/app_ui.R` und `R/app_server.R`):**

```r
# R/app_ui.R
app_ui <- function(request) {
  tagList(
    golem_add_external_resources(),
    fluidPage(
      titlePanel("My App"),
      sidebarLayout(
        sidebarPanel(
          selectInput("dataset", "Choose a dataset:",
            choices = c("iris", "mtcars"))
        ),
        mainPanel(
          tableOutput("table")
        )
      )
    )
  )
}

# R/app_server.R
app_server <- function(input, output, session) {
  output$table <- renderTable({
    get(input$dataset)
  })
}
```

**Für Vanilla Shiny (`app.R`):**

```r
library(shiny)

ui <- fluidPage(
  titlePanel("My App"),
  sidebarLayout(
    sidebarPanel(
      selectInput("dataset", "Choose a dataset:",
        choices = c("iris", "mtcars"))
    ),
    mainPanel(
      tableOutput("table")
    )
  )
)

server <- function(input, output, session) {
  output$table <- renderTable({
    get(input$dataset)
  })
}

shinyApp(ui, server)
```

**Erwartet:** UI und Server ohne Syntaxfehler definiert. App startet ohne Laufzeitfehler.

**Bei Fehler:** Wenn `get(input$dataset)` Fehler erzeugt, sicherstellen, dass Datensatznamen mit R-Basisumgebung zugänglichen Datensätzen übereinstimmen (iris, mtcars, etc.).

### Schritt 4: Lokal verifizieren

Die App lokal ausführen und grundlegende Funktionalität prüfen.

**Für golem:**

```r
golem::run_dev()
```

**Für Vanilla:**

```r
# Im Projektverzeichnis
shiny::runApp("myapp")

# Oder wenn bereits in myapp/
shiny::runApp()
```

App öffnet sich im Standard-Browser oder zeigt die URL an:

```
Listening on http://127.0.0.1:PORT
```

**Erwartet:** App startet ohne Fehler. Basis-UI rendert korrekt. Dropdown-Auswahl ändert Tabelleninhalt.

**Bei Fehler:** Wenn Port belegt ist, anderen Port angeben: `shiny::runApp(port = 3838)`. Wenn App mit Fehler abbricht, Konsolen-Fehlerausgabe für Paket-fehlende oder Syntaxfehler prüfen.

### Schritt 5: Projektstruktur dokumentieren

`README.md` und grundlegende Konfiguration hinzufügen.

```r
# README.md erstellen
writeLines(c(
  "# My App",
  "",
  "## Overview",
  "Brief description of the app.",
  "",
  "## Setup",
  "```r",
  "install.packages('shiny')",
  "shiny::runApp()",
  "```",
  "",
  "## Structure",
  "- `R/` — App-Logik (UI, Server, Module)",
  "- `www/` — Statische Assets (CSS, JS, Bilder)",
  "- `tests/` — App-Tests"
), "myapp/README.md")
```

**Erwartet:** README erklärt App-Zweck und Setup-Schritte.

**Bei Fehler:** Wenn README-Erstellung fehlschlägt, manuell im Texteditor erstellen.

## Validierung

- [ ] Projektverzeichnis mit korrekter Framework-Struktur erstellt
- [ ] Basis-UI und Server ohne Syntaxfehler definiert
- [ ] App startet lokal ohne Fehler
- [ ] UI rendert korrekt im Browser
- [ ] Basis-Interaktivität (Input → Output) funktioniert
- [ ] README mit Setup-Anweisungen vorhanden

## Haeufige Stolperfallen

- **Golem vs Plain Shiny**: golem erzwingt R-Paket-Struktur (DESCRIPTION, NAMESPACE). `devtools::check()` laufen lassen, um Paket-Konformität sicherzustellen.
- **Namespace-Kollisionen**: Wenn mehrere Pakete Funktion `select()` exportieren, stets `pkg::function()` verwenden (z. B. `dplyr::select()`).
- **Reaktive Kontexte**: `input$*`-Werte nur innerhalb reaktiver Kontexte (`reactive()`, `observe()`, `render*()`). Außerhalb schlägt dies fehl.
- **Shiny-App vs Funktion**: In golem ist `run_app()` die Entry-Point-Funktion. In Vanilla ist `shinyApp(ui, server)` der Entry-Point.
- **Port-Konflikte**: Wenn mehrere Apps gleichzeitig laufen, für jede explizite Ports setzen.
- **`www/`-Verzeichnis**: Statische Dateien müssen in `www/` liegen. Auf sie wird mit relativem Pfad ohne `www/`-Präfix zugegriffen.

## Verwandte Skills

- `build-shiny-module` — wiederverwendbare Shiny-Module erstellen
- `test-shiny-app` — App mit shinytest2 testen
- `deploy-shiny-app` — App auf shinyapps.io oder Posit Connect deployen
- `design-shiny-ui` — UI mit bslib und modernen Themes gestalten
