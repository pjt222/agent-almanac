---
name: fail-early-pattern
description: >
  Wendet das Fail-Early-(Fail-Fast-)Muster an, um Fehler so frueh wie moeglich
  zu erkennen und zu melden. Behandelt Eingabevalidierung mit Guard-Klauseln,
  aussagekraeftige Fehlermeldungen, Assertion-Funktionen und Anti-Muster, die
  Fehler still verschlucken. Primaere Beispiele in R mit allgemeiner/polyglotter
  Anleitung. Verwenden beim Schreiben von Funktionen, die externe Eingaben
  akzeptieren, beim Hinzufuegen von Eingabevalidierung vor der CRAN-Einreichung,
  beim Refaktorieren von Code der still falsche Ergebnisse erzeugt, beim
  Ueberpruefen von PRs auf Fehlerbehandlungsqualitaet oder beim Absichern
  interner APIs gegen ungueltiger Argumente.
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
  domain: general
  complexity: intermediate
  language: multi
  tags: error-handling, validation, defensive-programming, guard-clauses, fail-fast
---

# Fruehzeitig Scheitern

Wenn etwas scheitern wird, sollte es so frueh wie moeglich, so laut wie moeglich und mit so viel Kontext wie moeglich scheitern. Dieser Skill kodifiziert das Fail-Early-Muster: Eingaben an Systemgrenzen validieren, Guard-Klauseln verwenden, um schlechten Zustand abzulehnen bevor er sich ausbreitet, und Fehlermeldungen schreiben, die beantworten *was* scheiterte, *wo*, *warum* und *wie man es behebt*.

## Wann verwenden

- Schreiben oder Pruefen von Funktionen, die externe Eingaben akzeptieren (Benutzerdaten, API-Antworten, Dateiinhalte)
- Eingabevalidierung zu Paketfunktionen hinzufuegen vor der CRAN-Einreichung
- Refaktorieren von Code, der still falsche Ergebnisse erzeugt statt Fehler zu werfen
- Pruefen von Pull Requests auf Fehlerbehandlungsqualitaet
- Absichern interner APIs gegen ungueltiger Argumente

## Eingaben

- **Erforderlich**: Funktion oder Modul, auf das das Muster angewendet werden soll
- **Erforderlich**: Identifizierung von Vertrauensgrenzen (wo externe Daten eintreten)
- **Optional**: Bestehender Fehlerbehandlungscode zum Refaktorieren
- **Optional**: Zielsprache (Standard: R; gilt auch fuer Python, TypeScript, Rust)

## Vorgehensweise

### Schritt 1: Vertrauensgrenzen identifizieren

Kartieren, wo externe Daten ins System eintreten. Diese Punkte benoetigen Validierung:

- Oeffentliche API-Funktionen (exportierte Funktionen in einem R-Paket)
- Benutzerseitige Parameter
- Datei-E/A (Lesen von Konfigs, Datendateien, Benutzer-Uploads)
- Netzwerkantworten (API-Aufrufe, Datenbankabfragen)
- Umgebungsvariablen und Systemkonfiguration

Interne Hilfsfunktionen, die nur durch eigenen validierten Code aufgerufen werden, benoetigen generell keine redundante Validierung.

**Erwartet:** Eine Liste von Einstiegspunkten, an denen nicht vertrauenswuerdige Daten in den Code eintreten.

**Bei Fehler:** Falls Grenzen unklar sind, rueckwaerts von Fehlern in Logs oder Bug-Reports verfolgen, um herauszufinden, wo schlechte Daten zuerst eingetreten sind.

### Schritt 2: Guard-Klauseln an Einstiegspunkten hinzufuegen

Eingaben am Anfang jeder oeffentlichen Funktion validieren, bevor irgendeine Arbeit beginnt.

**R (base):**

```r
calculate_summary <- function(data, method = c("mean", "median", "trim"), trim_pct = 0.1) {
  # Guard: Typenpruefung
  if (!is.data.frame(data)) {
    stop("'data' must be a data frame, not ", class(data)[[1]], call. = FALSE)
  }
  # Guard: Nicht leer
  if (nrow(data) == 0L) {
    stop("'data' must have at least one row", call. = FALSE)
  }
  # Guard: Argument-Abgleich
  method <- match.arg(method)
  # Guard: Bereichspruefung
  if (!is.numeric(trim_pct) || trim_pct < 0 || trim_pct > 0.5) {
    stop("'trim_pct' must be a number between 0 and 0.5, got: ", trim_pct, call. = FALSE)
  }
  # --- Alle Guards bestanden, echte Arbeit beginnen ---
  # ...
}
```

**R (rlang/cli — bevorzugt fuer Pakete):**

```r
calculate_summary <- function(data, method = c("mean", "median", "trim"), trim_pct = 0.1) {
  rlang::check_required(data)
  if (!is.data.frame(data)) {
    cli::cli_abort("{.arg data} must be a data frame, not {.cls {class(data)}}.")
  }
  if (nrow(data) == 0L) {
    cli::cli_abort("{.arg data} must have at least one row.")
  }
  method <- rlang::arg_match(method)
  if (!is.numeric(trim_pct) || trim_pct < 0 || trim_pct > 0.5) {
    cli::cli_abort("{.arg trim_pct} must be between 0 and 0.5, not {.val {trim_pct}}.")
  }
  # ...
}
```

**Allgemein (TypeScript):**

```typescript
function calculateSummary(data: DataFrame, method: Method, trimPct: number): Summary {
  if (data.rows.length === 0) {
    throw new Error(`data must have at least one row`);
  }
  if (trimPct < 0 || trimPct > 0.5) {
    throw new RangeError(`trimPct must be between 0 and 0.5, got: ${trimPct}`);
  }
  // ...
}
```

**Erwartet:** Jede oeffentliche Funktion beginnt mit Guard-Klauseln, die ungueltige Eingaben ablehnen, bevor Nebeneffekte oder Berechnungen beginnen.

**Bei Fehler:** Falls Validierungslogik lang wird (>15 Zeilen Guards), einen `validate_*`-Helfer extrahieren oder `stopifnot()` fuer einfache Typ-Assertions verwenden.

### Schritt 3: Aussagekraeftige Fehlermeldungen schreiben

Jede Fehlermeldung sollte vier Fragen beantworten:

1. **Was** scheiterte — welcher Parameter oder welche Operation
2. **Wo** — Funktionsname oder Kontext (automatisch mit `cli::cli_abort`)
3. **Warum** — was erwartet wurde vs. was erhalten wurde
4. **Wie zu beheben** — wenn die Loesung nicht offensichtlich ist

**Gute Meldungen:**

```r
# Was + Warum (erwartet vs. tatsaechlich)
stop("'n' must be a positive integer, got: ", n, call. = FALSE)

# Was + Warum + Wie zu beheben
cli::cli_abort(c(
  "{.arg config_path} does not exist: {.file {config_path}}",
  "i" = "Create it with {.run create_config({.file {config_path}})}."
))

# Was + Kontext
cli::cli_abort(c(
  "Column {.val {col_name}} not found in {.arg data}.",
  "i" = "Available columns: {.val {names(data)}}"
))
```

**Schlechte Meldungen:**

```r
stop("Error")                    # Was ist gescheitert? Keine Ahnung
stop("Invalid input")           # Welche Eingabe? Was ist damit falsch?
stop(paste("Error in step", i)) # Keine handlungsrelevante Information
```

**Erwartet:** Fehlermeldungen sind selbstdokumentierend — ein Entwickler, der den Fehler zum ersten Mal sieht, kann ihn ohne Lesen des Quellcodes diagnostizieren und beheben.

**Bei Fehler:** Die drei juengsten Bug-Reports ueberpruefen. Falls einer das Lesen des Quellcodes erforderte, um ihn zu verstehen, muessen seine Fehlermeldungen verbessert werden.

### Schritt 4: stop() gegenueber warning() bevorzugen

`stop()` (oder `cli::cli_abort()`) verwenden, wenn die Funktion kein korrektes Ergebnis erzeugen kann. `warning()` nur verwenden, wenn die Funktion noch ein sinnvolles Ergebnis liefern kann, aber der Aufrufer von einem Problem wissen sollte.

**Faustregel:** Falls ein Benutzer still eine falsche Antwort erhalten koennte, ist das ein `stop()`, kein `warning()`.

```r
# RICHTIG: stop wenn Ergebnis falsch waere
read_config <- function(path) {
  if (!file.exists(path)) {
    stop("Config file not found: ", path, call. = FALSE)
  }
  yaml::read_yaml(path)
}

# RICHTIG: warnen wenn Ergebnis noch verwendbar ist
summarize_data <- function(data) {
  if (any(is.na(data$value))) {
    warning(sum(is.na(data$value)), " NA values dropped from 'value' column", call. = FALSE)
    data <- data[!is.na(data$value), ]
  }
  # Mit gueltigen Daten fortfahren
}
```

**Erwartet:** `stop()` wird fuer Bedingungen verwendet, die falsche Ergebnisse erzeugen wuerden; `warning()` ist fuer degradierte-aber-gueltige Ergebnisse reserviert.

**Bei Fehler:** Bestehende `warning()`-Aufrufe pruefen. Falls die Funktion nach der Warnung Unsinn zurueckgibt, auf `stop()` aendern.

### Schritt 5: Assertions fuer interne Invarianten verwenden

Fuer Bedingungen, die "niemals passieren sollten" in korrektem Code, Assertions verwenden. Diese fangen Programmiererfehler waehrend der Entwicklung auf:

```r
# R: stopifnot fuer interne Invarianten
process_chunk <- function(chunk, total_size) {
  stopifnot(
    is.list(chunk),
    length(chunk) > 0,
    total_size > 0
  )
  # ...
}

# R: explizite Assertion mit Kontext
merge_results <- function(left, right) {
  if (ncol(left) != ncol(right)) {
    stop("Internal error: column count mismatch (", ncol(left), " vs ", ncol(right),
         "). This is a bug -- please report it.", call. = FALSE)
  }
  # ...
}
```

**Erwartet:** Interne Invarianten werden assertiert, damit Bugs sofort an der Verletzungsstelle auftreten, nicht drei Funktionsaufrufe spaeter mit einem kryptischen Fehler.

**Bei Fehler:** Falls `stopifnot()`-Meldungen zu kryptisch sind, auf explizites `if/stop` mit Kontext umstellen.

### Schritt 6: Anti-Muster refaktorieren

Diese gaengigen Anti-Muster identifizieren und beheben:

**Anti-Muster 1: Leeres tryCatch (Fehler verschlucken)**

```r
# VORHER: Fehler verschwindet still
result <- tryCatch(
  parse_data(input),
  error = function(e) NULL
)

# NACHHER: Protokollieren, neu werfen oder typisierter Fehler
result <- tryCatch(
  parse_data(input),
  error = function(e) {
    cli::cli_abort("Failed to parse input: {e$message}", parent = e)
  }
)
```

**Anti-Muster 2: Standardwerte, die schlechte Eingaben verdecken**

```r
# VORHER: Aufrufer weiss nie, dass seine Eingabe ignoriert wurde
process <- function(x = 10) {
  if (!is.numeric(x)) x <- 10  # ersetzt schlechte Eingabe still
  x * 2
}

# NACHHER: Aufrufer ueber das Problem informieren
process <- function(x = 10) {
  if (!is.numeric(x)) {
    stop("'x' must be numeric, got ", class(x)[[1]], call. = FALSE)
  }
  x * 2
}
```

**Anti-Muster 3: suppressWarnings als Loesung**

```r
# VORHER: Symptom verstecken statt Ursache beheben
result <- suppressWarnings(as.numeric(user_input))

# NACHHER: Explizit validieren, erwarteten Fall behandeln
if (!grepl("^-?\\d+\\.?\\d*$", user_input)) {
  stop("Expected a number, got: '", user_input, "'", call. = FALSE)
}
result <- as.numeric(user_input)
```

**Anti-Muster 4: Catch-All-Ausnahmebehandler**

```r
# VORHER: Jeder Fehler wird gleich behandelt
tryCatch(
  complex_operation(),
  error = function(e) message("Something went wrong")
)

# NACHHER: Spezifische Bedingungen behandeln, unerwartete propagieren lassen
tryCatch(
  complex_operation(),
  custom_validation_error = function(e) {
    cli::cli_warn("Validation issue: {e$message}")
    fallback_value
  }
  # Unerwartete Fehler propagieren natuerlich
)
```

**Erwartet:** Anti-Muster werden durch explizite Validierung oder spezifische Fehlerbehandlung ersetzt.

**Bei Fehler:** Falls das Entfernen eines `tryCatch` kaskadierte Fehler verursacht, hat der Upstream-Code eine Validierungsluecke. Die Quelle beheben, nicht das Symptom.

### Schritt 7: Das Fail-Early-Refaktoring validieren

Die Testsuite ausfuehren, um zu bestaetigen, dass Fehlerpfade korrekt funktionieren:

```r
# Fehlermeldungen pruefen ob sie ausgeloest werden
testthat::expect_error(calculate_summary("not_a_df"), "must be a data frame")
testthat::expect_error(calculate_summary(data.frame()), "at least one row")
testthat::expect_error(calculate_summary(mtcars, trim_pct = 2), "between 0 and 0.5")

# Pruefen ob gueltige Eingaben noch funktionieren
testthat::expect_no_error(calculate_summary(mtcars, method = "mean"))
```

```bash
# Vollstaendige Testsuite ausfuehren
Rscript -e "devtools::test()"
```

**Erwartet:** Alle Tests bestehen. Fehlerpfad-Tests bestaetigen, dass schlechte Eingaben die erwartete Fehlermeldung ausloesen.

**Bei Fehler:** Falls bestehende Tests auf stillen Fehlern beruhten (z.B. NULL bei schlechter Eingabe zurueckgeben), sie aktualisieren, um den neuen Fehler zu erwarten.

## Validierung

- [ ] Jede oeffentliche Funktion validiert ihre Eingaben, bevor sie arbeitet
- [ ] Fehlermeldungen beantworten: was scheiterte, wo, warum und wie zu beheben
- [ ] `stop()` wird fuer Bedingungen verwendet, die falsche Ergebnisse erzeugen
- [ ] `warning()` wird nur fuer degradierte-aber-gueltige Ergebnisse verwendet
- [ ] Keine leeren `tryCatch`-Bloecke, die Fehler still verschlucken
- [ ] Kein `suppressWarnings()` als Ersatz fuer ordentliche Validierung
- [ ] Keine Standardwerte, die ungueltige Eingaben still verdecken
- [ ] Interne Invarianten verwenden `stopifnot()` oder explizite Assertions
- [ ] Fehlerpfad-Tests fuer jede Validierungs-Guard existieren
- [ ] Testsuite besteht nach Refaktorierung

## Haeufige Stolperfallen

- **Zu tief validieren**: An Vertrauensgrenzen validieren (oeffentliche API), nicht in jedem internen Helfer. Uebermaessige Validierung fuegt Laerm hinzu und schadet der Performance.
- **Fehlermeldungen ohne Kontext**: `"Invalid input"` zwingt den Aufrufer zu raten. Immer den Parameternamen, den erwarteten Typ/Bereich und den tatsaechlich erhaltenen Wert einbeziehen.
- **warning() verwenden wenn stop() gemeint ist**: Falls die Funktion nach der Warnung Unsinn zurueckgibt, erhaelt der Aufrufer still eine falsche Antwort. `stop()` verwenden und den Aufrufer entscheiden lassen, wie damit umzugehen ist.
- **Fehler in tryCatch verschlucken**: `tryCatch(..., error = function(e) NULL)` versteckt Bugs. Falls gefangen werden muss, mit hinzugefuegtem Kontext protokollieren oder neu werfen.
- **call. = FALSE vergessen**: In R schliesst `stop("msg")` standardmaessig den Aufruf ein, was fuer Endbenutzer laestig ist. In benutzerseitigen Funktionen `call. = FALSE` verwenden. `cli::cli_abort()` macht dies automatisch.
- **In Tests statt in Code validieren**: Tests pruefen Verhalten, schuetzen aber keine Produktions-Aufrufer. Validierung gehoert in die Funktion selbst.

## Verwandte Skills

- `write-testthat-tests` - Tests schreiben, die Fehlerpfade verifizieren
- `review-pull-request` - Code auf fehlende Validierung und stille Fehler pruefen
- `review-software-architecture` - Fehlerbehandlungsstrategie auf Systemebene beurteilen
- `create-skill` - neue Skills nach dem agentskills.io-Standard erstellen
- `security-audit-codebase` - sicherheitsfokussierter Review, der sich mit Eingabevalidierung ueberschneidet
