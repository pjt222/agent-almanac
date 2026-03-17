---
name: design-shiny-ui
description: >
  Moderne, zugängliche Shiny-Benutzeroberflächen mit bslib-Themes, responsivem
  Layout und Barrierefreiheits-Best-Practices gestalten. Behandelt Bootstrap-
  5-Theming, layout_columns(), Cards und WCAG-Konformität. Verwenden, wenn
  eine Shiny-App professionell wirken soll, ein Marken-Theme konsistent
  angewendet oder die Zugänglichkeit für alle Nutzer verbessert werden soll.
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
  tags: shiny, ui, bslib, theming, accessibility, bootstrap
---

# Shiny-UI gestalten

Moderne, zugängliche und visuell ansprechende Shiny-Benutzeroberflächen mit bslib und Bootstrap 5 erstellen.

## Wann verwenden

- Shiny-App professionell und markenkonform gestalten
- Responsives Layout für verschiedene Bildschirmgrößen einrichten
- Zugänglichkeit (WCAG 2.1 AA) sicherstellen
- Konsistentes Design über mehrere Apps implementieren

## Eingaben

- **Erforderlich**: Shiny-App (scaffolded oder bestehend)
- **Optional**: Markenfarben und Typografie (Hex-Codes, Schriftarten)
- **Optional**: Design-System oder Style-Guide
- **Optional**: Zugänglichkeits-Anforderungen

## Vorgehensweise

### Schritt 1: bslib installieren und Bootstrap 5 aktivieren

bslib für modernes Bootstrap-5-Theming einrichten.

```r
install.packages("bslib")

# Grundlegendes bslib-Setup in app.R oder app_ui.R
library(shiny)
library(bslib)

ui <- page_sidebar(  # Modernes Layout mit bslib
  title = "Meine App",
  sidebar = sidebar(
    selectInput("dataset", "Datensatz:", choices = c("iris", "mtcars"))
  ),
  # Hauptinhalt
  card(
    card_header("Datenübersicht"),
    tableOutput("table")
  )
)
```

**Erwartet:** App verwendet Bootstrap 5. Modernes, responsives Grundlayout.

**Bei Fehler:** Wenn bslib und shiny Version inkompatibel sind, `packageVersion("bslib")` und `packageVersion("shiny")` prüfen — bslib >= 0.5.0 für volle Bootstrap-5-Unterstützung.

### Schritt 2: Custom Theme erstellen

Markenspezifisches Bootstrap-5-Theme konfigurieren.

```r
# Marken-Theme definieren
mein_theme <- bs_theme(
  version = 5,

  # Grundlegende Markenfarben
  bg = "#FFFFFF",           # Hintergrund
  fg = "#212529",           # Vordergrund (Text)
  primary = "#0066CC",      # Primärfarbe
  secondary = "#6C757D",    # Sekundärfarbe
  success = "#28A745",
  warning = "#FFC107",
  danger = "#DC3545",

  # Typografie
  base_font = font_google("Inter"),
  heading_font = font_google("Inter", wght = 600),
  code_font = font_google("JetBrains Mono"),

  # Benutzerdefinierte Sass-Variablen
  "border-radius" = "0.5rem",
  "box-shadow" = "0 2px 4px rgba(0,0,0,0.1)"
)

# Theme in App verwenden
ui <- page_sidebar(
  theme = mein_theme,
  title = "Meine App",
  # ...
)
```

Theme live im Browser anpassen:

```r
# Interaktiver Theme-Editor (nur Entwicklung)
bs_themer()  # Fügt Theming-Widget zur App hinzu
```

**Erwartet:** App zeigt benutzerdefinierte Farben und Typografie. `bs_themer()` zeigt interaktive Theme-Kontrollen.

**Bei Fehler:** Wenn Google Fonts nicht laden (kein Internet), `font_google()` durch `font_collection("system-ui", "sans-serif")` ersetzen.

### Schritt 3: Responsives Layout mit Cards und Columns

Flexibles, responsives Layout mit bslib-Komponenten erstellen.

```r
ui <- page_sidebar(
  theme = mein_theme,
  title = "Dashboard",

  sidebar = sidebar(
    width = 300,  # Sidebar-Breite in Pixeln
    bg = "#f8f9fa",
    selectInput("dataset", "Datensatz:", choices = c("iris", "mtcars")),
    sliderInput("rows", "Zeilen:", min = 5, max = 50, value = 10),
    hr(),
    actionButton("refresh", "Aktualisieren", class = "btn-primary w-100")
  ),

  # Responsives 2-Spalten-Layout
  layout_columns(
    col_widths = c(8, 4),  # 8/12 + 4/12 Bootstrap-Spalten

    card(
      full_screen = TRUE,  # Vollbild-Erweiterungsbutton
      card_header(
        "Hauptdiagramm",
        class = "bg-primary text-white"
      ),
      plotOutput("main_plot", height = "400px")
    ),

    layout_columns(
      col_widths = c(12, 12),  # Gestapelte Cards auf rechter Seite

      value_box(
        title = "Datenpunkte",
        value = textOutput("n_points"),
        showcase = bsicons::bs_icon("bar-chart"),
        theme = "primary"
      ),

      card(
        card_header("Zusammenfassung"),
        tableOutput("summary_table")
      )
    )
  )
)
```

**Erwartet:** Responsives 2-Spalten-Layout auf Desktop. Gestapelt auf Mobile.

**Bei Fehler:** Wenn Spalten nicht korrekt brechen, `col_widths` überprüfen — Summe muss 12 oder weniger ergeben (Bootstrap-12-Spalten-Grid).

### Schritt 4: Interaktionselemente gestalten

Moderne UI-Komponenten mit Bootstrap-5-Styling hinzufügen.

```r
# Navigation mit Tabs
page_navbar(
  theme = mein_theme,
  title = "Meine App",
  nav_panel(
    "Übersicht",
    icon = bsicons::bs_icon("house"),
    # Inhalt der Übersichtsseite
  ),
  nav_panel(
    "Analyse",
    icon = bsicons::bs_icon("graph-up"),
    # Analyseinhalt
  ),
  nav_spacer(),
  nav_item(
    tags$a(href = "https://docs.example.com", "Dokumentation",
           target = "_blank")
  )
)

# Gestylte Buttons
fluidRow(
  actionButton("primary_btn", "Primär", class = "btn-primary"),
  actionButton("outline_btn", "Umriss", class = "btn-outline-secondary ms-2"),
  downloadButton("download", "Herunterladen", class = "btn-success ms-2")
)

# Tooltips und Popovers
tags$button(
  class = "btn btn-info",
  `data-bs-toggle` = "tooltip",
  `data-bs-placement` = "top",
  title = "Hilfreiche Erklärung",
  bsicons::bs_icon("question-circle")
)
```

**Erwartet:** Moderne UI-Elemente mit korrektem Bootstrap-5-Styling.

**Bei Fehler:** Wenn Tooltips nicht erscheinen, Bootstrap-5-JavaScript muss aktiviert sein. `bs_dependency_defer()` oder manuelle JS-Initialisierung verwenden.

### Schritt 5: Zugänglichkeit sicherstellen

WCAG 2.1 AA-Konformität für alle Nutzer implementieren.

```r
# Semantisches HTML mit ARIA-Labels
ui <- page_sidebar(
  theme = mein_theme,

  # Skip-Navigation-Link
  tags$a(
    href = "#main-content",
    class = "visually-hidden-focusable",
    "Zum Hauptinhalt springen"
  ),

  sidebar = sidebar(
    # Label für Seitenleiste
    tags$div(
      role = "region",
      `aria-label` = "Filteroptionen",
      selectInput("dataset", "Datensatz auswählen:", choices = c("iris", "mtcars"))
    )
  ),

  tags$main(
    id = "main-content",
    role = "main",
    `aria-label` = "Hauptinhalt",

    # Beschreibende Alt-Texte für Plots
    plotOutput(
      "main_plot",
      alt = "Streudiagramm der ausgewählten Datensatz-Variablen"
    ),

    # Tabellen mit Überschriften
    tags$div(
      role = "region",
      `aria-label` = "Datentabelle",
      tableOutput("data_table")
    )
  )
)
```

Farbkontrast prüfen:

```r
# Kontrastverhältnisse verifizieren (WCAG AA: min 4.5:1 für normalen Text)
# Externes Tool: https://webaim.org/resources/contrastchecker/

# Farbenblindheitssichere Paletten
colorblind_palette <- c(
  "#E69F00", "#56B4E9", "#009E73",
  "#F0E442", "#0072B2", "#D55E00", "#CC79A7"
)
```

**Erwartet:** App navigierbar mit Tastatur. Screen Reader-Nutzer können Inhalt verstehen. Farben haben ausreichenden Kontrast.

**Bei Fehler:** Wenn ARIA-Labels nicht erkannt werden, HTML-Ausgabe mit `view_ui <- function(ui) htmltools::html_print(ui)` untersuchen.

### Schritt 6: Theme über Apps hinweg wiederverwenden

Theme in R-Paket oder shared Skript packen.

```r
# R/theme.R (in golem-Paket oder gemeinsames Skript)
#' Unternehmensspezifisches bslib-Theme
#' @export
get_company_theme <- function() {
  bs_theme(
    version = 5,
    primary = "#0066CC",
    base_font = font_google("Inter"),
    heading_font = font_google("Inter", wght = 600)
  )
}

# In jeder App verwenden
ui <- page_sidebar(
  theme = get_company_theme(),
  # ...
)

# CSS-Überschreibungen für app-spezifische Anpassungen
ui <- page_sidebar(
  theme = bs_theme_update(
    get_company_theme(),
    # App-spezifische Überschreibungen
    "sidebar-bg" = "#f0f4f8"
  )
)
```

**Erwartet:** Konsistentes Design über alle Unternehmens-Apps. Theme in einzelner Datei wartbar.

**Bei Fehler:** Wenn Theme-Überschreibungen nicht wirken, CSS-Spezifität prüfen — bslib-Sass-Variablen haben Vorrang vor Bootstrap-Defaults.

## Validierung

- [ ] App verwendet Bootstrap 5 via bslib
- [ ] Custom Theme mit Markenfarben und Typografie konfiguriert
- [ ] Responsives Layout bricht korrekt auf mobilen Bildschirmen
- [ ] Navigation mit Tastatur vollständig möglich
- [ ] Farb-Kontrastverhältnisse erfüllen WCAG 2.1 AA (4.5:1)
- [ ] ARIA-Labels für nicht-textuelle Elemente vorhanden
- [ ] Theme in wiederverwendbarer Funktion oder Paket

## Haeufige Stolperfallen

- **Bootstrap-Version-Mischung**: Nicht Bootstrap 4 und 5 mischen. bslib-Themes erfordern konsistente Bootstrap-Version.
- **Inline-CSS vs Sass-Variablen**: Inline-CSS kann bslib-Theming überschreiben. Sass-Variablen über `bs_theme()` bevorzugen.
- **Google Fonts in Offline-Umgebungen**: `font_google()` benötigt Internet. Für Offline-Einsatz lokale Schriften in `www/fonts/` verwenden.
- **Kontrast-Checker für Markenfarben**: Markenfarben erfüllen nicht immer WCAG-Kontrastverhältnisse. Immer mit Tool prüfen.
- **Cards und full_screen**: `full_screen = TRUE` erfordert Inhalt mit definierten Höhen, sonst unbegrenzte Ausdehnung.
- **value_box in Modulen**: `value_box()` IDs über `ns()` korrekt namespace.

## Verwandte Skills

- `scaffold-shiny-app` — App vor UI-Design scaffolden
- `build-shiny-module` — Modulstruktur für wiederverwendbare UI-Komponenten
- `optimize-shiny-performance` — Performance nach UI-Fertigstellung optimieren
