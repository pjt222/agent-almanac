---
name: test-shiny-app
description: >
  Shiny-Anwendungen mit shinytest2 für End-to-End-Tests und testServer()
  für Unit-Tests der Server-Logik testen. Behandelt Snapshot-Tests,
  UI-Interaktionstests, Modul-Unit-Tests und CI-Integration. Verwenden,
  wenn Shiny-App-Verhalten validiert, Regressionstests eingerichtet oder
  Tests in CI/CD eingebunden werden sollen.
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
  tags: shiny, testing, shinytest2, testthat, ci-cd
---

# Shiny-App testen

Shiny-Anwendungen mit shinytest2 (End-to-End) und testServer() (Unit-Tests) zuverlässig testen.

## Wann verwenden

- Shiny-App-Verhalten vor dem Deployment validieren
- Regressionstests für kritische User Journeys einrichten
- Modul-Logik isoliert unit-testen
- Shiny-Tests in GitHub Actions CI einbinden

## Eingaben

- **Erforderlich**: Laufende Shiny-App (lokal oder remote)
- **Optional**: Bestehende `tests/`-Verzeichnisstruktur
- **Optional**: CI-Workflow für automatische Testausführung

## Vorgehensweise

### Schritt 1: shinytest2 installieren

shinytest2 und seine Dependencies installieren.

```r
install.packages("shinytest2")

# Chromium-Browser für UI-Tests installieren (benötigt Netzwerkzugriff)
shinytest2::install_chromium()

# Für CI (headless Chrome verwenden)
# Chromium wird über chromote automatisch gefunden
```

In bestehende Teststruktur integrieren:

```r
# Tests-Verzeichnis einrichten (wenn noch nicht vorhanden)
usethis::use_testthat()

# shinytest2 in Testinfrastruktur integrieren
shinytest2::use_shinytest2()
```

**Erwartet:** shinytest2 installiert. `tests/testthat/setup-shinytest2.R` erstellt.

**Bei Fehler:** Wenn Chromium-Installation fehlschlägt, systemweit installierten Chrome/Chromium verwenden: `shinytest2::install_chromium(force = TRUE)`.

### Schritt 2: Ersten Snapshot-Test erstellen

shinytest2 im Record-Modus verwenden, um Test-Snapshots automatisch zu generieren.

```r
# Aufzeichnung starten (öffnet App + Test-Recorder)
shinytest2::record_test(".")

# Alternativ: Manuell ersten Test schreiben
# tests/testthat/test-app.R
```

Aufgezeichnete Tests sehen aus wie:

```r
# tests/testthat/test-app.R
library(shinytest2)

test_that("app startet und UI rendert korrekt", {
  app <- AppDriver$new(
    app_dir = system.file(package = "myapp"),  # oder "."
    name = "app-startup-test"
  )

  # Anfangs-Screenshot aufnehmen
  app$expect_screenshot()

  app$stop()
})
```

**Erwartet:** Snapshot-Bilder in `tests/testthat/_snaps/` erstellt. Test läuft ohne Fehler.

**Bei Fehler:** Wenn App nicht startet, Konsolen-Output mit `app$get_logs()` prüfen. Wenn Screenshot-Vergleich fehlschlägt, Snapshots mit `shinytest2::snapshot_review()` aktualisieren.

### Schritt 3: UI-Interaktionstests schreiben

Tests für spezifisches User-Verhalten schreiben.

```r
# tests/testthat/test-interactions.R
library(shinytest2)

test_that("Datensatz-Auswahl aktualisiert Tabelle", {
  app <- AppDriver$new(".", name = "dataset-selection")

  # Initialen Zustand prüfen
  initial_value <- app$get_value(output = "table")
  expect_true(length(initial_value$body) > 0)

  # Input ändern
  app$set_inputs(dataset = "mtcars")
  app$expect_values(output = "table")

  app$stop()
})

test_that("Slider filtert Zeilenanzahl", {
  app <- AppDriver$new(".", name = "slider-filter")

  app$set_inputs(n_rows = 5)
  app$click("apply")

  # Wert aus Output extrahieren und prüfen
  table_data <- app$get_value(output = "table")
  expect_equal(nrow(table_data$body), 5)

  app$stop()
})
```

**Erwartet:** Tests simulieren User-Interaktionen und prüfen Output-Änderungen.

**Bei Fehler:** Wenn `get_value()` unerwartete Struktur zurückgibt, `app$get_value(output = "table") |> str()` verwenden, um die tatsächliche Struktur zu untersuchen.

### Schritt 4: Server-Logik unit-testen

Shiny-Server-Funktionen mit `testServer()` isoliert testen.

```r
# tests/testthat/test-server.R
library(shiny)
library(testthat)

test_that("server berechnet korrekten Mittelwert", {
  testServer(app_server, {
    # Inputs setzen
    session$setInputs(dataset = "iris", n_rows = 10)

    # Output prüfen
    expect_s3_class(output$table$result, "data.frame")
    expect_equal(nrow(output$table$result), 10)
  })
})

test_that("reactive Werte aktualisieren korrekt", {
  testServer(app_server, {
    session$setInputs(multiplier = 2)

    # Reaktiven Wert prüfen
    result <- filtered_data()
    expect_true(all(result$value > 0))
  })
})
```

Für Modul-Tests:

```r
# tests/testthat/test-mod_data_filter.R
test_that("data filter Modul filtert korrekt", {
  test_data <- reactive({ head(iris, 100) })

  testServer(
    mod_data_filter_server,
    args = list(data = test_data),
    {
      session$setInputs(n_rows = 5, apply = 1)

      result <- session$returned()
      expect_equal(nrow(result()), 5)
    }
  )
})
```

**Erwartet:** Server-Logik unabhängig von UI testbar. Reaktive Berechnungen verifizierbar.

**Bei Fehler:** Wenn `testServer()` fehlschlägt mit "could not find function", sicherstellen, dass Server-Funktion exportiert oder im Paket-Namespace zugänglich ist.

### Schritt 5: Edge Cases und Fehlerbehandlung testen

Randfälle und Fehlerszenarien testen.

```r
# tests/testthat/test-edge-cases.R
test_that("app behandelt leere Eingaben korrekt", {
  testServer(app_server, {
    session$setInputs(dataset = NULL, n_rows = 0)

    # Sicherstellen dass App nicht abstürzt
    expect_silent(output$table)
  })
})

test_that("app zeigt Fehlermeldung bei ungültigen Eingaben", {
  app <- AppDriver$new(".", name = "error-handling")

  # Ungültige Eingabe erzwingen (z. B. via URL-Parameter)
  app$set_inputs(n_rows = -1)
  app$click("apply")

  # Fehlermeldung prüfen
  error_output <- app$get_value(output = "error_message")
  expect_false(is.null(error_output))

  app$stop()
})
```

**Erwartet:** App behandelt edge cases ohne Absturz. Fehlermeldungen korrekt angezeigt.

**Bei Fehler:** Wenn Tests edge cases nicht abdecken, Fehlerbehandlung im Server mit `tryCatch()` oder `validate(need(...))` hinzufügen.

### Schritt 6: CI-Integration

Tests in GitHub Actions CI einbinden.

```yaml
# .github/workflows/test-shiny.yml
name: Shiny Tests

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: r-lib/actions/setup-r@v2
        with:
          use-public-rspm: true

      - name: Install system dependencies
        run: |
          sudo apt-get install -y chromium-browser

      - uses: r-lib/actions/setup-r-dependencies@v2
        with:
          extra-packages: shinytest2, testthat

      - name: Run tests
        run: |
          Rscript -e "testthat::test_dir('tests/testthat')"
        env:
          CHROMOTE_CHROME_ARGS: "--no-sandbox"  # Für CI erforderlich
```

**Erwartet:** Tests in CI auf Push/PR ausgeführt. Fehlgeschlagene Tests blockieren Merge.

**Bei Fehler:** Wenn Chromium in CI nicht gefunden wird, `CHROMOTE_CHROME_ARGS="--no-sandbox --disable-gpu"` und sicherstellen, dass `chromium-browser` oder `google-chrome` installiert ist.

## Validierung

- [ ] shinytest2 installiert und Chromium verfügbar
- [ ] Snapshots in `tests/testthat/_snaps/` erstellt
- [ ] UI-Interaktionstests simulieren echte User-Workflows
- [ ] Server-Unit-Tests via `testServer()` prüfen Logik isoliert
- [ ] Edge Cases und Fehlerbehandlung getestet
- [ ] Tests in CI laufen ohne Fehler

## Haeufige Stolperfallen

- **Nicht-deterministische Snapshots**: Animationen, Timestamps oder zufällige Daten verursachen Snapshot-Instabilität. `set.seed()` verwenden und dynamischen Inhalt mocken.
- **Chromium fehlt in CI**: Immer `--no-sandbox`-Flag in CI-Umgebungen setzen. GitHub Actions braucht spezielle Chromium-Konfiguration.
- **`testServer()` vs `AppDriver`**: `testServer()` testet Server-Logik isoliert (keine echten UI). `AppDriver` testet echte Browser-Interaktionen.
- **Veraltete Snapshots**: Nach UI-Änderungen müssen Snapshots mit `shinytest2::snapshot_review()` oder `shinytest2::snapshot_update()` aktualisiert werden.
- **Timing-Probleme**: Asynchrone Operationen (Plots, Downloads) benötigen `app$wait_for_idle()` nach auslösenden Aktionen.
- **Modul-Tests ohne Reaktivität**: `testServer()` benötigt reaktive Inputs — immer `session$setInputs()` vor Assertions aufrufen.

## Verwandte Skills

- `scaffold-shiny-app` — Shiny-App vor dem Testen scaffolden
- `build-shiny-module` — Module erstellen, die mit `testServer()` getestet werden
- `deploy-shiny-app` — Getestete App deployen
- `setup-github-actions-ci` — CI/CD-Workflows einrichten
