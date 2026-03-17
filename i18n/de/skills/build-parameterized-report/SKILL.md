---
name: build-parameterized-report
description: >
  Parametrisierte Quarto- oder R-Markdown-Berichte erstellen, die mit
  unterschiedlichen Eingaben gerendert werden koennen, um mehrere Varianten
  zu erzeugen. Umfasst Parameterdefinitionen, programmatisches Rendering
  und Batch-Generierung. Verwenden, wenn der gleiche Bericht fuer
  verschiedene Abteilungen, Regionen oder Zeitraeume erstellt, kundenspezifische
  Berichte aus einer einzelnen Vorlage erzeugt, Dashboards auf bestimmte
  Teilmengen gefiltert oder wiederkehrende Berichte mit wechselnden
  Eingaben automatisiert werden sollen.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: reporting
  complexity: intermediate
  language: R
  tags: quarto, parameterized, batch, automation, reporting
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# Parametrisierten Bericht erstellen

Berichte erstellen, die Parameter akzeptieren, um mehrere angepasste Varianten aus einer einzelnen Vorlage zu generieren.

## Wann verwenden

- Den gleichen Bericht fuer verschiedene Abteilungen, Regionen oder Zeitraeume generieren
- Kundenspezifische Berichte aus einer Vorlage erstellen
- Dashboards erstellen, die auf bestimmte Teilmengen filtern
- Wiederkehrende Berichte mit unterschiedlichen Eingaben automatisieren

## Eingaben

- **Erforderlich**: Berichtsvorlage (Quarto oder R Markdown)
- **Erforderlich**: Parameterdefinitionen (Namen, Typen, Standardwerte)
- **Optional**: Liste von Parameterwerten fuer die Batch-Generierung
- **Optional**: Ausgabeverzeichnis fuer generierte Berichte

## Vorgehensweise

### Schritt 1: Parameter im YAML definieren

Fuer Quarto (`report.qmd`):

```yaml
---
title: "Sales Report: `r params$region`"
params:
  region: "North America"
  year: 2025
  include_forecast: true
format:
  html:
    toc: true
---
```

Fuer R Markdown (`report.Rmd`):

```yaml
---
title: "Sales Report"
params:
  region: "North America"
  year: 2025
  include_forecast: true
output: html_document
---
```

**Erwartet:** Der YAML-Header enthaelt einen `params:`-Block mit benannten Parametern, die jeweils einen Standardwert des korrekten Typs haben.

**Bei Fehler:** Wenn das Rendering mit "object 'params' not found" fehlschlaegt, sicherstellen, dass der `params:`-Block korrekt unter dem YAML-Frontmatter eingerueckt ist. Fuer Quarto muss `params` auf der obersten Ebene des YAML stehen, nicht unter `format:` verschachtelt.

### Schritt 2: Parameter im Code verwenden

````markdown
```{r}
#| label: filter-data

data <- full_dataset |>
  filter(region == params$region, year == params$year)

nrow(data)
```

## Overview for `r params$region`

This report covers the `r params$region` region for `r params$year`.

```{r}
#| label: forecast
#| eval: !expr params$include_forecast

# This chunk only runs when include_forecast is TRUE
forecast_model <- forecast::auto.arima(data$sales)
forecast::autoplot(forecast_model)
```
````

**Erwartet:** Code-Chunks referenzieren Parameter ueber `params$name` und bedingte Chunks verwenden `#| eval: !expr params$flag` fuer Quarto. Inline-R-Ausdruecke wie `` `r params$region` `` rendern dynamischen Text.

**Bei Fehler:** Wenn `params$name` NULL zurueckgibt, sicherstellen, dass der Parametername exakt zwischen YAML-Definition und Code-Referenz uebereinstimmt (Gross-/Kleinschreibung beachten). Pruefen, ob Standardwerte den korrekten Typ haben.

### Schritt 3: Mit benutzerdefinierten Parametern rendern

Einzelnes Rendering:

```r
# Quarto
quarto::quarto_render(
  "report.qmd",
  execute_params = list(region = "Europe", year = 2025)
)

# R Markdown
rmarkdown::render(
  "report.Rmd",
  params = list(region = "Europe", year = 2025),
  output_file = "report-europe-2025.html"
)
```

**Erwartet:** Ein einzelner Bericht wird erfolgreich mit benutzerdefinierten Parameterwerten gerendert, die die YAML-Standardwerte ueberschreiben. Die Ausgabedatei wird am angegebenen Pfad erstellt.

**Bei Fehler:** Wenn Quarto-Rendering fehlschlaegt, pruefen, ob `quarto`-CLI installiert und im PATH ist. Wenn R-Markdown-Rendering fehlschlaegt, sicherstellen, dass `rmarkdown` installiert ist. Parameternamen in `execute_params` (Quarto) oder `params` (R Markdown) muessen exakt mit den YAML-Definitionen uebereinstimmen.

### Schritt 4: Mehrere Berichte im Batch rendern

```r
regions <- c("North America", "Europe", "Asia Pacific", "Latin America")
years <- c(2024, 2025)

# Generate all combinations
combinations <- expand.grid(region = regions, year = years, stringsAsFactors = FALSE)

# Render each
purrr::pwalk(combinations, function(region, year) {
  output_name <- sprintf("report-%s-%d.html",
    tolower(gsub(" ", "-", region)), year)

  quarto::quarto_render(
    "report.qmd",
    execute_params = list(region = region, year = year),
    output_file = output_name
  )
})
```

**Erwartet:** Eine HTML-Datei pro Region-Jahr-Kombination.

**Bei Fehler:** Pruefen, dass Parameternamen exakt zwischen YAML und Code uebereinstimmen. Sicherstellen, dass alle Parameterwerte gueltig sind.

### Schritt 5: Parametervalidierung hinzufuegen

```r
#| label: validate-params

stopifnot(
  "Region must be a valid region" = params$region %in% valid_regions,
  "Year must be numeric" = is.numeric(params$year),
  "Year must be reasonable" = params$year >= 2020 && params$year <= 2030
)
```

**Erwartet:** Der Validierungs-Code-Chunk wird zu Beginn jedes Renderings ausgefuehrt und stoppt mit einer informativen Fehlermeldung, wenn ein Parameter ausserhalb des Bereichs liegt oder den falschen Typ hat.

**Bei Fehler:** Wenn `stopifnot()` wenig hilfreiche Fehlermeldungen erzeugt, auf explizite `if (!cond) stop("message")`-Aufrufe umstellen fuer klarere Diagnose.

### Schritt 6: Ausgabe organisieren

```r
# Create output directory
output_dir <- file.path("reports", format(Sys.Date(), "%Y-%m"))
dir.create(output_dir, recursive = TRUE, showWarnings = FALSE)

# Render with output path
quarto::quarto_render(
  "report.qmd",
  execute_params = list(region = region),
  output_file = file.path(output_dir, paste0("report-", region, ".html"))
)
```

**Erwartet:** Ausgabedateien werden in ein datumsbezogenes Unterverzeichnis mit beschreibenden Namen geschrieben (z.B. `reports/2025-06/report-europe.html`).

**Bei Fehler:** Wenn `dir.create()` fehlschlaegt, pruefen, ob das uebergeordnete Verzeichnis existiert und beschreibbar ist. Unter Windows sicherstellen, dass die Pfadlaenge 260 Zeichen nicht ueberschreitet.

## Validierung

- [ ] Bericht rendert mit Standardparametern
- [ ] Bericht rendert mit jedem Satz benutzerdefinierter Parameter
- [ ] Parameter werden vor der Verarbeitung validiert
- [ ] Ausgabedateien sind beschreibend benannt
- [ ] Bedingte Abschnitte rendern korrekt basierend auf Parametern
- [ ] Batch-Generierung wird fuer alle Kombinationen abgeschlossen

## Haeufige Fehler

- **Parameternamen-Abweichung**: YAML-Namen muessen exakt mit `params$name`-Referenzen im Code uebereinstimmen
- **Typumwandlung**: YAML kann `year: 2025` als Integer parsen, aber Code erwartet Character. Explizit sein.
- **Bedingte Auswertung**: `#| eval: !expr params$flag` verwenden, nicht `eval = params$flag` in Quarto
- **Datei-Ueberschreibung**: Ohne eindeutige Ausgabenamen ueberschreibt jedes Rendering das vorherige
- **Speicher im Batch-Modus**: Lange Batch-Laeufe koennen Speicher ansammeln. `callr::r()` fuer Isolation erwaegen.

## Verwandte Skills

- `create-quarto-report` - Basis-Quarto-Dokumenteinrichtung
- `generate-statistical-tables` - Tabellen, die sich an Parameter anpassen
- `format-apa-report` - Parametrisierte akademische Berichte
