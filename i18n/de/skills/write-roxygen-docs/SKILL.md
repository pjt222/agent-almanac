---
name: write-roxygen-docs
description: >
  roxygen2-Dokumentation fuer Funktionen, Datensaetze und Klassen eines
  R-Pakets schreiben. Umfasst alle gaengigen Tags, Querverweise, Beispiele
  und die Generierung von NAMESPACE-Eintraegen. Folgt dem
  Tidyverse-Dokumentationsstil. Verwenden beim Hinzufuegen von Dokumentation
  zu neuen exportierten Funktionen, internen Hilfsfunktionen, Datensaetzen,
  S3/S4/R6-Klassen und -Methoden oder beim Beheben dokumentationsbezogener
  R CMD check-Hinweise.
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
  complexity: basic
  language: R
  tags: r, roxygen2, documentation, namespace
---

# Roxygen-Dokumentation schreiben

Vollstaendige roxygen2-Dokumentation fuer Funktionen, Datensaetze und Klassen eines R-Pakets erstellen.

## Wann verwenden

- Dokumentation zu einer neuen exportierten Funktion hinzufuegen
- Interne Hilfsfunktionen dokumentieren
- Paketdatensaetze dokumentieren
- S3/S4/R6-Klassen und -Methoden dokumentieren
- Dokumentationsbezogene `R CMD check`-Hinweise beheben

## Eingaben

- **Erforderlich**: Zu dokumentierende R-Funktion, Datensatz oder Klasse
- **Optional**: Verwandte Funktionen fuer Querverweise (`@family`, `@seealso`)
- **Optional**: Ob die Funktion exportiert werden soll

## Vorgehensweise

### Schritt 1: Funktionsdokumentation schreiben

Roxygen-Kommentare direkt oberhalb der Funktion platzieren:

```r
#' Compute the weighted mean of a numeric vector
#'
#' Calculates the arithmetic mean of `x` weighted by `w`. Missing values
#' in either `x` or `w` are handled according to the `na.rm` parameter.
#'
#' @param x A numeric vector of values.
#' @param w A numeric vector of weights, same length as `x`.
#' @param na.rm Logical. Should missing values be removed? Default `FALSE`.
#'
#' @return A single numeric value representing the weighted mean.
#'
#' @examples
#' weighted_mean(1:5, rep(1, 5))
#' weighted_mean(c(1, 2, NA, 4), c(1, 1, 1, 1), na.rm = TRUE)
#'
#' @export
#' @family summary functions
#' @seealso [stats::weighted.mean()] for the base R equivalent
weighted_mean <- function(x, w, na.rm = FALSE) {
  # implementation
}
```

**Erwartet:** Vollstaendiger Roxygen-Block mit Titel, Beschreibung, `@param` fuer jeden Parameter, `@return`, `@examples` und `@export`.

**Bei Fehler:** Bei Unsicherheit ueber ein Tag `?roxygen2::rd_roclet` konsultieren. Haeufig vergessen wird `@return`, das CRAN fuer alle exportierten Funktionen erfordert.

### Schritt 2: Referenz der wesentlichen Tags

| Tag | Zweck | Fuer Export erforderlich? |
|-----|-------|--------------------------|
| `#' Title` | Erste Zeile, ein Satz | Ja |
| `#' Description` | Absatz nach Leerzeile | Ja |
| `@param` | Parameterdokumentation | Ja |
| `@return` | Beschreibung des Rueckgabewerts | Ja (CRAN) |
| `@examples` | Verwendungsbeispiele | Dringend empfohlen |
| `@export` | Zu NAMESPACE hinzufuegen | Ja, fuer oeffentliche API |
| `@family` | Verwandte Funktionen gruppieren | Empfohlen |
| `@seealso` | Querverweise | Optional |
| `@keywords internal` | Als intern markieren | Fuer nicht-exportierte Dokumentation |

**Erwartet:** Alle erforderlichen Tags fuer den Funktionstyp sind identifiziert. Exportierte Funktionen haben mindestens `@param`, `@return`, `@examples` und `@export`.

**Bei Fehler:** Bei unbekannten Tags die [roxygen2-Dokumentation](https://roxygen2.r-lib.org/articles/rd.html) fuer Verwendung und Syntax konsultieren.

### Schritt 3: Datensaetze dokumentieren

`R/data.R` erstellen:

```r
#' Example dataset of city temperatures
#'
#' A dataset containing daily temperature readings for major cities.
#'
#' @format A data frame with 365 rows and 4 variables:
#' \describe{
#'   \item{date}{Date of observation}
#'   \item{city}{City name}
#'   \item{temp_c}{Temperature in Celsius}
#'   \item{humidity}{Relative humidity percentage}
#' }
#' @source \url{https://example.com/data}
"city_temperatures"
```

**Erwartet:** `R/data.R` enthaelt Roxygen-Bloecke fuer jeden Datensatz mit `@format` zur Beschreibung der Struktur und `@source` zur Angabe der Datenherkunft.

**Bei Fehler:** Wenn `R CMD check` vor nicht dokumentierten Datensaetzen warnt, sicherstellen, dass der in Anfuehrungszeichen gesetzte String (z.B. `"city_temperatures"`) genau dem Objektnamen entspricht, der mit `usethis::use_data()` gespeichert wurde.

### Schritt 4: Das Paket dokumentieren

`R/packagename-package.R` erstellen:

```r
#' @keywords internal
"_PACKAGE"

## usethis namespace: start
## usethis namespace: end
NULL
```

**Erwartet:** `R/packagename-package.R` existiert mit `@keywords internal` und dem `"_PACKAGE"`-Sentinel. `devtools::document()` generiert `man/packagename-package.Rd`.

**Bei Fehler:** Wenn `R CMD check` eine fehlende Paketdokumentationsseite meldet, sicherstellen, dass die Datei `R/<packagename>-package.R` heisst und den String `"_PACKAGE"` enthaelt.

### Schritt 5: Sonderfaelle behandeln

**Funktionen mit Punkten im Namen** (S3-Methoden):

```r
#' @export
#' @rdname process
process.myclass <- function(x, ...) {
  # S3 method
}
```

**Dokumentation wiederverwenden** mit `@inheritParams`:

```r
#' @inheritParams weighted_mean
#' @param trim Fraction of observations to trim.
trimmed_mean <- function(x, w, na.rm = FALSE, trim = 0.1) {
  # implementation
}
```

**Keine sichtbare Bindung beheben** mit dem `.data`-Pronomen:

```r
#' @importFrom rlang .data
my_function <- function(df) {
  dplyr::filter(df, .data$column > 5)
}
```

**Erwartet:** Sonderfaelle (S3-Methoden, vererbte Parameter, `.data`-Pronomen) sind korrekt dokumentiert. `@rdname` gruppiert S3-Methoden zusammen. `@inheritParams` verwendet Parameter-Dokumentation ohne Duplikation.

**Bei Fehler:** Wenn `R CMD check` vor "no visible binding for global variable" warnt, `#' @importFrom rlang .data` hinzufuegen oder als letzten Ausweg `utils::globalVariables()` verwenden.

### Schritt 6: Dokumentation generieren

```r
devtools::document()
```

**Erwartet:** `man/`-Verzeichnis mit `.Rd`-Dateien fuer jedes dokumentierte Objekt aktualisiert. `NAMESPACE` mit korrekten Exporten und Importen neu generiert.

**Bei Fehler:** Auf Roxygen-Syntaxfehler pruefen. Haeufige Probleme: nicht geschlossene Klammern in `\describe{}`, fehlende `#'`-Praefix in einer Zeile oder ungueltiger Tag-Name. `devtools::document()` nach der Korrektur erneut ausfuehren.

## Validierung

- [ ] Jede exportierte Funktion hat `@param`, `@return` und `@examples`
- [ ] `devtools::document()` laeuft ohne Fehler
- [ ] `devtools::check()` zeigt keine Dokumentationswarnungen
- [ ] `@family`-Tags gruppieren verwandte Funktionen korrekt
- [ ] Beispiele laufen ohne Fehler (testen mit `devtools::run_examples()`)

## Haeufige Stolperfallen

- **Fehlendes `@return`**: CRAN erfordert, dass alle exportierten Funktionen ihren Rueckgabewert dokumentieren
- **Beispiele, die Internet/Authentifizierung benoetigen**: In `\dontrun{}` einschliessen mit einem erklaerenden Kommentar
- **Langsame Beispiele**: `\donttest{}` fuer Beispiele verwenden, die funktionieren, aber fuer CRAN zu lange dauern
- **Markdown in roxygen**: Mit `Roxygen: list(markdown = TRUE)` in DESCRIPTION aktivieren
- **`devtools::document()` zu laufen vergessen**: Man-Pages werden generiert, nicht haendisch geschrieben

## Verwandte Skills

- `create-r-package` - erstmalige Paketeinrichtung einschliesslich roxygen-Konfiguration
- `write-testthat-tests` - die dokumentierten Funktionen testen
- `write-vignette` - ausfuehrliche Dokumentation jenseits der Funktionsreferenz
- `submit-to-cran` - Dokumentationsanforderungen fuer CRAN
