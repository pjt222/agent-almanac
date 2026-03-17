---
name: write-testthat-tests
description: >
  Umfassende testthat-Tests (Edition 3) fuer R-Paketfunktionen schreiben.
  Behandelt Testorganisation, Erwartungen, Fixtures, Mocking, Snapshot-Tests,
  parametrisierte Tests und das Erreichen hoher Testabdeckung. Verwenden
  beim Hinzufuegen von Tests fuer neue Paketfunktionen, zur Erhoehung der
  Testabdeckung bestehenden Codes, zum Schreiben von Regressionstests fuer
  Fehlerbehebungen oder beim Einrichten der Testinfrastruktur fuer ein
  neues Paket.
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: r-packages
  complexity: intermediate
  language: R
  tags: r, testthat, testing, unit-tests, coverage
---

# testthat-Tests schreiben

Umfassende Tests fuer R-Paketfunktionen mit testthat Edition 3 erstellen.

## Wann verwenden

- Tests fuer neue Paketfunktionen hinzufuegen
- Testabdeckung fuer bestehenden Code erhoehen
- Regressionstests fuer Fehlerbehebungen schreiben
- Testinfrastruktur fuer ein neues Paket einrichten

## Eingaben

- **Erforderlich**: Zu testende R-Funktionen
- **Erforderlich**: Erwartetes Verhalten und Grenzfaelle
- **Optional**: Test-Fixtures oder Beispieldaten
- **Optional**: Zielabdeckungsprozentsatz (Standard: 80%)

## Vorgehensweise

### Schritt 1: Testinfrastruktur einrichten

Falls noch nicht geschehen:

```r
usethis::use_testthat(edition = 3)
```

Dies erstellt `tests/testthat.R` und das Verzeichnis `tests/testthat/`.

**Erwartet:** `tests/testthat.R` und Verzeichnis `tests/testthat/` erstellt. DESCRIPTION hat `Config/testthat/edition: 3` gesetzt.

**Bei Fehler:** Wenn usethis nicht verfuegbar ist, `tests/testthat.R` manuell erstellen mit dem Inhalt `library(testthat); library(packagename); test_check("packagename")` und das Verzeichnis `tests/testthat/` hinzufuegen.

### Schritt 2: Testdatei erstellen

```r
usethis::use_test("function_name")
```

Erstellt `tests/testthat/test-function_name.R` mit einer Vorlage.

**Erwartet:** Testdatei unter `tests/testthat/test-function_name.R` erstellt mit einem Platzhalter-`test_that()`-Block zum Ausfuellen.

**Bei Fehler:** Wenn `usethis::use_test()` nicht verfuegbar ist, die Datei manuell erstellen. Die Namenskonvention `test-<function_name>.R` einhalten.

### Schritt 3: Grundlegende Tests schreiben

```r
test_that("weighted_mean computes correct result", {
  expect_equal(weighted_mean(1:3, c(1, 1, 1)), 2)
  expect_equal(weighted_mean(c(10, 20), c(1, 3)), 17.5)
})

test_that("weighted_mean handles NA values", {
  expect_equal(weighted_mean(c(1, NA, 3), c(1, 1, 1), na.rm = TRUE), 2)
  expect_true(is.na(weighted_mean(c(1, NA, 3), c(1, 1, 1), na.rm = FALSE)))
})

test_that("weighted_mean validates input", {
  expect_error(weighted_mean("a", 1), "numeric")
  expect_error(weighted_mean(1:3, 1:2), "length")
})
```

**Erwartet:** Grundlegende Tests decken korrekte Ausgaben fuer typische Eingaben, NA-Behandlungsverhalten und Eingabevalidierungs-Fehlermeldungen ab.

**Bei Fehler:** Wenn Tests sofort fehlschlagen, pruefen, ob die Funktion geladen ist (`devtools::load_all()`). Wenn Fehlermeldungen nicht uebereinstimmen, ein Regex-Muster in `expect_error()` statt eines exakten Strings verwenden.

### Schritt 4: Grenzfaelle testen

```r
test_that("weighted_mean handles edge cases", {
  # Empty input
  expect_error(weighted_mean(numeric(0), numeric(0)))

  # Single value
  expect_equal(weighted_mean(5, 1), 5)

  # Zero weights
  expect_true(is.nan(weighted_mean(1:3, c(0, 0, 0))))

  # Very large values
  expect_equal(weighted_mean(c(1e15, 1e15), c(1, 1)), 1e15)

  # Negative weights
  expect_error(weighted_mean(1:3, c(-1, 1, 1)))
})
```

**Erwartet:** Grenzfaelle sind abgedeckt: leere Eingabe, einzelne Werte, Nullgewichte, extreme Werte und ungueltigen Eingaben. Jeder Grenzfall hat ein klar definiertes erwartetes Verhalten.

**Bei Fehler:** Wenn die Funktion einen Grenzfall nicht wie erwartet behandelt, entscheiden, ob die Funktion oder der Test angepasst werden soll. Das beabsichtigte Verhalten fuer mehrdeutige Faelle dokumentieren.

### Schritt 5: Fixtures fuer komplexe Tests verwenden

`tests/testthat/fixtures/` fuer Testdaten erstellen:

```r
# tests/testthat/helper.R (wird automatisch geladen)
create_test_data <- function() {
  data.frame(
    x = c(1, 2, 3, NA, 5),
    group = c("a", "a", "b", "b", "b")
  )
}
```

```r
# In der Testdatei
test_that("process_data works with grouped data", {
  test_data <- create_test_data()
  result <- process_data(test_data)
  expect_s3_class(result, "data.frame")
  expect_equal(nrow(result), 2)
})
```

**Erwartet:** Fixtures stellen konsistente Testdaten ueber mehrere Testdateien hinweg bereit. Hilfsfunktionen in `tests/testthat/helper.R` werden von testthat automatisch geladen.

**Bei Fehler:** Wenn Hilfsfunktionen nicht gefunden werden, sicherstellen, dass die Datei `helper.R` heisst (nicht `helpers.R`) und sich in `tests/testthat/` befindet. Die R-Sitzung bei Bedarf neu starten.

### Schritt 6: Externe Abhaengigkeiten mocken

```r
test_that("fetch_data handles API errors", {
  local_mocked_bindings(
    api_call = function(...) stop("Connection refused")
  )
  expect_error(fetch_data("endpoint"), "Connection refused")
})

test_that("fetch_data returns parsed data", {
  local_mocked_bindings(
    api_call = function(...) list(data = list(value = 42))
  )
  result <- fetch_data("endpoint")
  expect_equal(result$value, 42)
})
```

**Erwartet:** Externe Abhaengigkeiten (APIs, Datenbanken, Netzwerkaufrufe) werden gemockt, sodass Tests ohne echte Verbindungen laufen. Mock-Rueckgabewerte testen die Datenverarbeitungslogik der Funktion.

**Bei Fehler:** Wenn `local_mocked_bindings()` fehlschlaegt, sicherstellen, dass die zu mockende Funktion im Testbereich zugreifbar ist. Fuer Funktionen in anderen Paketen das Argument `.package` verwenden.

### Schritt 7: Snapshot-Tests fuer komplexe Ausgaben

```r
test_that("format_report produces expected output", {
  expect_snapshot(format_report(test_data))
})

test_that("plot_results creates expected plot", {
  expect_snapshot_file(
    save_plot(plot_results(test_data), "test-plot.png"),
    "expected-plot.png"
  )
})
```

**Erwartet:** Snapshot-Dateien werden in `tests/testthat/_snaps/` erstellt. Der erste Lauf erstellt den Ausgangszustand; spaeteren Laeufe vergleichen damit.

**Bei Fehler:** Wenn Snapshots nach einer beabsichtigten Aenderung fehlschlagen, sie mit `testthat::snapshot_accept()` aktualisieren. Bei plattformuebergreifenden Unterschieden den Parameter `variant` verwenden, um plattformspezifische Snapshots zu pflegen.

### Schritt 8: Uebersprungbedingungen verwenden

```r
test_that("database query works", {
  skip_on_cran()
  skip_if_not(has_db_connection(), "No database available")

  result <- query_db("SELECT 1")
  expect_equal(result[[1]], 1)
})

test_that("parallel computation works", {
  skip_on_os("windows")
  skip_if(parallel::detectCores() < 2, "Need multiple cores")

  result <- parallel_compute(1:100)
  expect_length(result, 100)
})
```

**Erwartet:** Tests, die spezielle Umgebungen (Netzwerk, Datenbank, mehrere Kerne) erfordern, sind mit Uebersprungbedingungen abgesichert. Diese Tests laufen lokal, werden aber bei CRAN oder in eingeschraenkten CI-Umgebungen uebersprungen.

**Bei Fehler:** Wenn Tests bei CRAN oder CI fehlschlagen, lokal aber bestehen, die entsprechende Bedingung `skip_on_cran()`, `skip_on_os()` oder `skip_if_not()` am Anfang des `test_that()`-Blocks hinzufuegen.

### Schritt 9: Tests ausfuehren und Abdeckung pruefen

```r
# Alle Tests ausfuehren
devtools::test()

# Bestimmte Testdatei ausfuehren
devtools::test_active_file()  # in RStudio
testthat::test_file("tests/testthat/test-function_name.R")

# Abdeckung pruefen
covr::package_coverage()
covr::report()
```

**Erwartet:** Alle Tests bestehen mit `devtools::test()`. Der Abdeckungsbericht zeigt, dass der Zielprozentsatz erreicht wird (Ziel: >80%).

**Bei Fehler:** Wenn Tests fehlschlagen, die Testausgabe nach spezifischen Prueffehlem durchsuchen. Wenn die Abdeckung unter dem Ziel liegt, `covr::report()` verwenden, um nicht getestete Codepfade zu identifizieren und Tests hinzuzufuegen.

## Validierung

- [ ] Alle Tests bestehen mit `devtools::test()`
- [ ] Abdeckung ueberschreitet den Zielprozentsatz
- [ ] Jede exportierte Funktion hat mindestens einen Test
- [ ] Fehlerbedingungen werden getestet
- [ ] Grenzfaelle sind abgedeckt (NA, NULL, leer, Grenzwerte)
- [ ] Keine Tests haengen von externem Zustand oder Ausfuehrungsreihenfolge ab

## Haeufige Stolperfallen

- **Voneinander abhaengige Tests**: Jeder `test_that()`-Block muss unabhaengig sein
- **Hartcodierte Dateipfade**: `testthat::test_path()` fuer Test-Fixtures verwenden
- **Gleitkommavergleich**: `expect_equal()` (hat Toleranz) statt `expect_identical()` verwenden
- **Private Funktionen testen**: Moeglichst ueber die oeffentliche API testen. `:::` sparsam verwenden.
- **Snapshot-Tests in CI**: Snapshots sind plattformsensitiv. Parameter `variant` fuer plattformuebergreifende Tests verwenden.
- **`skip_on_cran()` vergessen**: Tests, die Netzwerk, Datenbanken oder lange Laufzeit erfordern, muessen bei CRAN uebersprungen werden

## Beispiele

```r
# Muster: Testdatei spiegelt R/-Datei
# R/weighted_mean.R -> tests/testthat/test-weighted_mean.R

# Muster: Beschreibende Testnamen
test_that("weighted_mean returns NA when na.rm = FALSE and input contains NA", {
  result <- weighted_mean(c(1, NA), c(1, 1), na.rm = FALSE)
  expect_true(is.na(result))
})

# Muster: Warnungen testen
test_that("deprecated_function emits deprecation warning", {
  expect_warning(deprecated_function(), "deprecated")
})
```

## Verwandte Skills

- `create-r-package` - Testinfrastruktur als Teil der Paketerstellung einrichten
- `write-roxygen-docs` - die getesteten Funktionen dokumentieren
- `setup-github-actions-ci` - Tests automatisch bei Push ausfuehren
- `submit-to-cran` - CRAN erfordert, dass Tests auf allen Plattformen bestehen
