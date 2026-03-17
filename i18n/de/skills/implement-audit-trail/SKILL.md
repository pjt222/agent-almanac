---
name: implement-audit-trail
description: >
  Auditpfad-Funktionalitaet fuer R-Projekte in regulierten Umgebungen
  implementieren. Umfasst Protokollierung, Provenienzverfolg, elektronische
  Signaturen, Datenintegritaetspruefungen und 21-CFR-Part-11-Konformitaet.
  Anzuwenden wenn eine R-Analyse elektronische Aufzeichnungskonformitaet
  (21 CFR Part 11) erfordert, wenn nachverfolgt werden soll wer was wann
  in einer Analyse getan hat, bei der Implementierung von Datenprovenienztracking
  oder beim Erstellen manipulationssicherer Analyseprotokolle fuer
  Behoerdeneinreichungen.
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
  domain: compliance
  complexity: advanced
  language: R
  tags: audit-trail, logging, provenance, 21-cfr-part-11, data-integrity
---

# Auditpfad implementieren

Auditpfad-Faehigkeiten zu R-Projekten fuer die regulatorische Konformitaet hinzufuegen.

## Wann verwenden

- R-Analyse erfordert elektronische Aufzeichnungskonformitaet (21 CFR Part 11)
- Nachverfolgung wer was, wann und warum in einer Analyse getan hat
- Implementierung von Datenprovenienztracking
- Erstellung manipulationssicherer Analyseprotokolle

## Eingaben

- **Erforderlich**: R-Projekt mit Datenverarbeitungs- oder Analyseskripten
- **Erforderlich**: Regulatorische Anforderungen (welche Auditpfad-Elemente sind verpflichtend)
- **Optional**: Vorhandene Protokollierungsinfrastruktur
- **Optional**: Anforderungen an elektronische Signaturen

## Vorgehensweise

### Schritt 1: Strukturierte Protokollierung einrichten

`R/audit_log.R` erstellen:

```r
#' Initialize audit log for a session
#'
#' @param log_dir Directory for audit log files
#' @param analyst Name of the analyst
#' @return Path to the created log file
init_audit_log <- function(log_dir = "audit_logs", analyst = Sys.info()["user"]) {
  dir.create(log_dir, showWarnings = FALSE, recursive = TRUE)

  log_file <- file.path(log_dir, sprintf(
    "audit_%s_%s.jsonl",
    format(Sys.time(), "%Y%m%d_%H%M%S"),
    analyst
  ))

  entry <- list(
    timestamp = format(Sys.time(), "%Y-%m-%dT%H:%M:%S%z"),
    event = "SESSION_START",
    analyst = analyst,
    r_version = R.version.string,
    platform = .Platform$OS.type,
    working_directory = getwd(),
    session_id = paste0(Sys.getpid(), "-", format(Sys.time(), "%Y%m%d%H%M%S"))
  )

  write(jsonlite::toJSON(entry, auto_unbox = TRUE), log_file, append = TRUE)
  options(audit_log_file = log_file, audit_session_id = entry$session_id)

  log_file
}

#' Log an audit event
#'
#' @param event Event type (DATA_IMPORT, TRANSFORM, ANALYSIS, EXPORT, etc.)
#' @param description Human-readable description
#' @param details Named list of additional details
log_audit_event <- function(event, description, details = list()) {
  log_file <- getOption("audit_log_file")
  if (is.null(log_file)) stop("Audit log not initialized. Call init_audit_log() first.")

  entry <- list(
    timestamp = format(Sys.time(), "%Y-%m-%dT%H:%M:%S%z"),
    event = event,
    description = description,
    session_id = getOption("audit_session_id"),
    details = details
  )

  write(jsonlite::toJSON(entry, auto_unbox = TRUE), log_file, append = TRUE)
}
```

**Erwartet:** `R/audit_log.R` wurde mit den Funktionen `init_audit_log()` und `log_audit_event()` erstellt. Der Aufruf von `init_audit_log()` erstellt das Verzeichnis `audit_logs/` und eine zeitgestempelte JSONL-Datei. Jeder Protokolleintrag ist eine einzelne JSON-Zeile mit den Feldern `timestamp`, `event`, `analyst` und `session_id`.

**Bei Fehler:** Schlaegt `jsonlite::toJSON()` fehl, sicherstellen, dass das Paket `jsonlite` installiert ist. Kann das Protokollverzeichnis nicht erstellt werden, Dateisystemberechtigungen pruefen. Fehlen Zeitzonen in Zeitstempeln, pruefen, ob `%z` auf der Plattform unterstuetzt wird.

### Schritt 2: Datenintegritaetspruefungen hinzufuegen

```r
#' Compute and log data hash for integrity verification
#'
#' @param data Data frame to hash
#' @param label Descriptive label for the dataset
#' @return SHA-256 hash string
hash_data <- function(data, label = "dataset") {
  hash_value <- digest::digest(data, algo = "sha256")

  log_audit_event("DATA_HASH", sprintf("Hash computed for %s", label), list(
    hash_algorithm = "sha256",
    hash_value = hash_value,
    nrow = nrow(data),
    ncol = ncol(data),
    columns = names(data)
  ))

  hash_value
}

#' Verify data integrity against a recorded hash
#'
#' @param data Data frame to verify
#' @param expected_hash Previously recorded hash
#' @return Logical indicating whether data matches
verify_data_integrity <- function(data, expected_hash) {
  current_hash <- digest::digest(data, algo = "sha256")
  match <- identical(current_hash, expected_hash)

  log_audit_event("DATA_VERIFY",
    sprintf("Data integrity check: %s", ifelse(match, "PASS", "FAIL")),
    list(expected = expected_hash, actual = current_hash))

  if (!match) warning("Data integrity check FAILED")
  match
}
```

**Erwartet:** `hash_data()` gibt einen SHA-256-Hash-String zurueck und protokolliert ein `DATA_HASH`-Ereignis. `verify_data_integrity()` vergleicht aktuelle Daten mit einem gespeicherten Hash und protokolliert ein `DATA_VERIFY`-Ereignis mit PASS- oder FAIL-Status.

**Bei Fehler:** Wird `digest::digest()` nicht gefunden, das Paket `digest` installieren. Stimmen Hashes bei identischen Daten nicht ueberein, pruefen, ob Spaltenreihenfolge und Datentypen zwischen Hashberechnung und Verifizierung konsistent sind.

### Schritt 3: Datentransformationen verfolgen

```r
#' Wrap a data transformation with audit logging
#'
#' @param data Input data frame
#' @param transform_fn Function to apply
#' @param description Description of the transformation
#' @return Transformed data frame
audited_transform <- function(data, transform_fn, description) {
  input_hash <- digest::digest(data, algo = "sha256")
  input_dim <- dim(data)

  result <- transform_fn(data)

  output_hash <- digest::digest(result, algo = "sha256")
  output_dim <- dim(result)

  log_audit_event("DATA_TRANSFORM", description, list(
    input_hash = input_hash,
    input_rows = input_dim[1],
    input_cols = input_dim[2],
    output_hash = output_hash,
    output_rows = output_dim[1],
    output_cols = output_dim[2]
  ))

  result
}
```

**Erwartet:** `audited_transform()` umschliesst jede Transformationsfunktion und protokolliert Eingabedimensionen und Hash, Ausgabedimensionen und Hash sowie die Transformationsbeschreibung als `DATA_TRANSFORM`-Ereignis.

**Bei Fehler:** Wirft die Transformationsfunktion einen Fehler, wird das Auditereignis nicht protokolliert. Die Transformation in `tryCatch()` einwickeln, um sowohl Erfolge als auch Fehler zu protokollieren. Sicherstellen, dass die Transformationsfunktion einen Data Frame akzeptiert und zurueckgibt.

### Schritt 4: Sitzungsumgebung protokollieren

```r
#' Log complete session information for reproducibility
log_session_info <- function() {
  si <- sessionInfo()

  log_audit_event("SESSION_INFO", "Complete session environment recorded", list(
    r_version = si$R.version$version.string,
    platform = si$platform,
    locale = Sys.getlocale(),
    base_packages = si$basePkgs,
    attached_packages = sapply(si$otherPkgs, function(p) paste(p$Package, p$Version)),
    renv_lockfile_hash = if (file.exists("renv.lock")) {
      digest::digest(file = "renv.lock", algo = "sha256")
    } else NA
  ))
}
```

**Erwartet:** Ein `SESSION_INFO`-Ereignis wird protokolliert mit R-Version, Plattform, Locale, angehaengten Paketen mit Versionen und dem renv-Lockfile-Hash (falls zutreffend).

**Bei Fehler:** Liefert `sessionInfo()` unvollstaendige Paketinformationen, sicherstellen, dass alle Pakete vor dem Aufruf von `log_session_info()` via `library()` geladen werden. Der renv-Lockfile-Hash ist `NA`, wenn das Projekt kein renv verwendet.

### Schritt 5: In Analyseskripten implementieren

```r
# 01_analysis.R
library(jsonlite)
library(digest)

# Start audit trail
log_file <- init_audit_log(analyst = "Philipp Thoss")

# Import data with audit
raw_data <- read.csv("data/raw/study_data.csv")
raw_hash <- hash_data(raw_data, "raw study data")

# Transform with audit
clean_data <- audited_transform(raw_data, function(d) {
  d |>
    dplyr::filter(!is.na(primary_endpoint)) |>
    dplyr::mutate(bmi = weight / (height/100)^2)
}, "Remove missing endpoints, calculate BMI")

# Run analysis
log_audit_event("ANALYSIS_START", "Primary efficacy analysis")
model <- lm(primary_endpoint ~ treatment + age + sex, data = clean_data)
log_audit_event("ANALYSIS_COMPLETE", "Primary efficacy analysis", list(
  model_class = class(model),
  formula = deparse(formula(model)),
  n_observations = nobs(model)
))

# Log session
log_session_info()
```

**Erwartet:** Analyseskripte initialisieren den Auditpfad zu Beginn, protokollieren jeden Datenimport, jede Transformation und jeden Analyseschritt und zeichnen am Ende die Sitzungsinformationen auf. Die JSONL-Protokolldatei erfasst die vollstaendige Provenienzrette.

**Bei Fehler:** Fehlt `init_audit_log()`, sicherstellen, dass `R/audit_log.R` geladen oder das Paket importiert wird. Fehlen Ereignisse im Protokoll, pruefen, ob `log_audit_event()` nach jeder wesentlichen Operation aufgerufen wird.

### Schritt 6: Git-basierte Aenderungskontrolle

Den Auditpfad auf Anwendungsebene durch git ergaenzen:

```bash
# Use signed commits for non-repudiation
git config commit.gpgsign true

# Descriptive commit messages referencing change control
git commit -m "CHG-042: Add BMI calculation to data processing

Per change request CHG-042, approved by [Name] on [Date].
Validation impact assessment: Low risk - additional derived variable."
```

**Erwartet:** Git-Commits sind signiert (GPG) und verwenden beschreibende Nachrichten mit Referenz auf Aenderungskontroll-IDs. Die Kombination aus Auditpfad auf Anwendungsebene (JSONL) und git-Verlauf liefert einen vollstaendigen Aenderungskontrolldatensatz.

**Bei Fehler:** Schlaegt die GPG-Signierung fehl, den Signierschluessel mit `git config --global user.signingkey KEY_ID` konfigurieren. Ist der Schluessel noch nicht eingerichtet, `gpg --gen-key` zum Erstellen verwenden.

## Validierung

- [ ] Auditpfad erfasst alle erforderlichen Ereignisse (Start, Datenzugriff, Transformationen, Analyse, Export)
- [ ] Zeitstempel verwenden ISO-8601-Format mit Zeitzone
- [ ] Daten-Hashes ermoeglichen Integritaetsverifizierung
- [ ] Sitzungsinformationen werden aufgezeichnet
- [ ] Protokolle sind nur-anhaengend (kein Loeschen oder Aendern)
- [ ] Analytikeridentitaet wird fuer jede Sitzung erfasst
- [ ] Protokollformat ist maschinenlesbar (JSONL)

## Haeufige Stolperfallen

- **Zu viel protokollieren**: Auf regulierte Ereignisse fokussieren. Nicht jede Variablenzuweisung protokollieren.
- **Veraenderbare Protokolle**: Auditpfade muessen nur-anhaengend sein. JSONL verwenden (ein JSON-Objekt pro Zeile).
- **Fehlende Zeitstempel**: Jedes Ereignis benoetigt einen Zeitstempel mit Zeitzone.
- **Kein Sitzungskontext**: Jeder Protokolleintrag sollte die Sitzung zur Korrelation referenzieren.
- **Vergessen der Initialisierung**: Skripte muessen `init_audit_log()` vor jeder Analyse aufrufen.

## Verwandte Skills

- `setup-gxp-r-project` - Projektstruktur fuer validierte Umgebungen
- `write-validation-documentation` - Validierungsprotokolle und -berichte
- `validate-statistical-output` - Methodik zur Ausgabevalidierung
- `configure-git-repository` - Versionskontrolle als Teil der Aenderungskontrolle
