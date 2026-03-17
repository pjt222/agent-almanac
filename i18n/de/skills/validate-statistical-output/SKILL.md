---
name: validate-statistical-output
description: >
  Statistische Analyseausgaben durch Doppelprogrammierung, unabhaengige
  Verifizierung und Referenzvergleich validieren. Umfasst Vergleichsmethodik,
  Toleranzdefinitionen und Abweichungsbehandlung fuer regulierte Umgebungen.
  Anzuwenden bei der Validierung primaerer oder sekundaerer Endpunktanalysen
  fuer Behoerdeneinreichungen, bei der Durchfuehrung von Doppelprogrammierung
  (R vs. SAS oder unabhaengige R-Implementierungen), bei der Verifizierung
  korrekter Ergebnisse des Analysecodes oder bei der Revalidierung nach Code-
  oder Umgebungsaenderungen.
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
  tags: validation, statistics, double-programming, verification, pharma
---

# Statistische Ausgaben validieren

Statistische Analyseergebnisse durch unabhaengige Berechnung und systematischen Vergleich verifizieren.

## Wann verwenden

- Validierung primaerer und sekundaerer Endpunktanalysen fuer Behoerdeneinreichungen
- Durchfuehren von Doppelprogrammierung (R vs. SAS oder unabhaengige R-Implementierungen)
- Verifizieren, dass der Analysecode korrekte Ergebnisse produziert
- Revalidierung nach Code- oder Umgebungsaenderungen

## Eingaben

- **Erforderlich**: Primaerer Analysecode und Ergebnisse
- **Erforderlich**: Referenzergebnisse (unabhaengige Berechnung, veroeffentlichte Werte oder bekannte Testdaten)
- **Erforderlich**: Toleranzkriterien fuer numerische Vergleiche
- **Optional**: Kontext der Behoerdeneinreichung

## Vorgehensweise

### Schritt 1: Vergleichsrahmen definieren

```r
# Define tolerance levels for different statistics
tolerances <- list(
  counts = 0,           # Exact match for integers
  proportions = 1e-4,   # 0.01% for proportions
  means = 1e-6,         # Numeric precision for means
  p_values = 1e-4,      # 4 decimal places for p-values
  confidence_limits = 1e-3  # 3 decimal places for CIs
)
```

**Erwartet:** Toleranzniveaus fuer jede Statistikkategorie sind definiert, mit strengeren Toleranzen fuer Integer-Zaehler (exakte Uebereinstimmung) und lockereren Toleranzen fuer Gleitkommastatistiken (p-Werte, Konfidenzintervalle).

**Bei Fehler:** Werden Toleranzniveaus beanstandet, die Begruendung fuer jeden Schwellenwert dokumentieren und vom statistischen Leiter genehmigen lassen. Fuer Behoerdeneinreichungen auf ICH-E9-Leitlinien verweisen.

### Schritt 2: Vergleichsfunktion erstellen

```r
#' Compare two result sets with tolerance-based matching
#'
#' @param primary Results from the primary analysis
#' @param reference Results from the independent calculation
#' @param tolerances Named list of tolerance values
#' @return Data frame with comparison results
compare_results <- function(primary, reference, tolerances) {
  stopifnot(names(primary) == names(reference))

  comparison <- data.frame(
    statistic = names(primary),
    primary_value = unlist(primary),
    reference_value = unlist(reference),
    stringsAsFactors = FALSE
  )

  comparison$absolute_diff <- abs(comparison$primary_value - comparison$reference_value)
  comparison$tolerance <- sapply(comparison$statistic, function(s) {
    # Match to tolerance category or use default
    tol <- tolerances[[s]]
    if (is.null(tol)) tolerances$means  # default tolerance
    else tol
  })

  comparison$pass <- comparison$absolute_diff <= comparison$tolerance

  comparison
}
```

**Erwartet:** `compare_results()` gibt einen Data Frame mit Spalten fuer Statistikname, Primaerwert, Referenzwert, absolute Differenz, Toleranz und Bestanden/Fehlgeschlagen-Status zurueck.

**Bei Fehler:** Wirft die Funktion bei nicht uebereinstimmenden Namen einen Fehler, pruefen, ob beide Ergebnislisten identische Statistiknamen verwenden. Schlaegt die Toleranzzuordnung fehl, eine Standardtoleranz fuer nicht erkannte Statistiknamen hinzufuegen.

### Schritt 3: Doppelprogrammierung implementieren

Eine unabhaengige Implementierung schreiben, die durch unterschiedlichen Code zu denselben Ergebnissen gelangt:

```r
# PRIMARY ANALYSIS (in R/primary_analysis.R)
primary_analysis <- function(data) {
  model <- lm(endpoint ~ treatment + baseline + sex, data = data)
  coefs <- summary(model)$coefficients

  list(
    treatment_estimate = coefs["treatmentActive", "Estimate"],
    treatment_se = coefs["treatmentActive", "Std. Error"],
    treatment_p = coefs["treatmentActive", "Pr(>|t|)"],
    n_subjects = nobs(model),
    r_squared = summary(model)$r.squared
  )
}

# INDEPENDENT VERIFICATION (in validation/independent_analysis.R)
# Written by a different analyst or using different methodology
independent_analysis <- function(data) {
  # Using matrix algebra instead of lm()
  X <- model.matrix(~ treatment + baseline + sex, data = data)
  y <- data$endpoint

  beta <- solve(t(X) %*% X) %*% t(X) %*% y
  residuals <- y - X %*% beta
  sigma2 <- sum(residuals^2) / (nrow(X) - ncol(X))
  var_beta <- sigma2 * solve(t(X) %*% X)
  se <- sqrt(diag(var_beta))

  t_stat <- beta["treatmentActive"] / se["treatmentActive"]
  p_value <- 2 * pt(-abs(t_stat), df = nrow(X) - ncol(X))

  list(
    treatment_estimate = as.numeric(beta["treatmentActive"]),
    treatment_se = se["treatmentActive"],
    treatment_p = as.numeric(p_value),
    n_subjects = nrow(data),
    r_squared = 1 - sum(residuals^2) / sum((y - mean(y))^2)
  )
}
```

**Erwartet:** Zwei unabhaengige Implementierungen existieren, die unterschiedliche Codepfade verwenden (z. B. `lm()` vs. Matrixalgebra), um zu denselben statistischen Ergebnissen zu gelangen. Die Implementierungen werden von verschiedenen Analytikern oder nach grundlegend unterschiedlichen Methoden erstellt.

**Bei Fehler:** Liefert die unabhaengige Implementierung andere Ergebnisse, zuerst pruefen, ob beide dieselben Eingabedaten verwenden (`digest::digest(data)` vergleichen). Dann Unterschiede in NA-Behandlung, Kontrastkodierung oder Freiheitsgradberechnungen pruefen.

### Schritt 4: Vergleich durchfuehren

```r
# Execute both analyses
primary_results <- primary_analysis(study_data)
independent_results <- independent_analysis(study_data)

# Compare
comparison <- compare_results(primary_results, independent_results, tolerances)

# Report
cat("Validation Comparison Report\n")
cat("============================\n")
cat(sprintf("Date: %s\n", Sys.time()))
cat(sprintf("Overall: %s\n\n",
  ifelse(all(comparison$pass), "ALL PASS", "DISCREPANCIES FOUND")))

print(comparison)
```

**Erwartet:** Der Vergleichsbericht zeigt alle Statistiken innerhalb der Toleranz. Die Zeile "Overall" lautet "ALL PASS".

**Bei Fehler:** Werden Abweichungen gefunden, nicht sofort davon ausgehen, dass die primaere Analyse falsch ist. Beide Implementierungen untersuchen: Zwischenberechnungen pruefen, identische Eingabedaten verifizieren und den Umgang mit fehlenden Werten und Randfaellen vergleichen.

### Schritt 5: Gegen externe Referenz (SAS) vergleichen

Beim Vergleich von R-Ausgaben mit SAS:

```r
# Load SAS results (exported as CSV or from .sas7bdat)
sas_results <- list(
  treatment_estimate = 1.2345,  # From SAS PROC GLM output
  treatment_se = 0.3456,
  treatment_p = 0.0004,
  n_subjects = 200,
  r_squared = 0.4567
)

comparison <- compare_results(primary_results, sas_results, tolerances)

# Known sources of difference between R and SAS:
# - Default contrasts (R: treatment, SAS: GLM parameterization)
# - Rounding of intermediate calculations
# - Handling of missing values (na.rm vs listwise deletion)
```

**Erwartet:** R-vs.-SAS-Vergleichsergebnisse liegen innerhalb der Toleranz, wobei bekannte systematische Unterschiede (Kontrastkodierung, Rundung) dokumentiert und erklaert sind.

**Bei Fehler:** Produzieren R und SAS Ergebnisse ausserhalb der Toleranz, die drei haeufigsten Ursachen pruefen: Standard-Kontrastkodierung (R verwendet Treatment-Kontraste, SAS die GLM-Parametrisierung), Umgang mit fehlenden Werten und Rundung von Zwischenberechnungen. Jeden Unterschied mit seiner Grundursache dokumentieren.

### Schritt 6: Ergebnisse dokumentieren

Einen Validierungsbericht erstellen:

```r
# validation/output_comparison_report.R
sink("validation/output_comparison_report.txt")

cat("OUTPUT VALIDATION REPORT\n")
cat("========================\n")
cat(sprintf("Project: %s\n", project_name))
cat(sprintf("Date: %s\n", format(Sys.time())))
cat(sprintf("Primary Analyst: %s\n", primary_analyst))
cat(sprintf("Independent Analyst: %s\n", independent_analyst))
cat(sprintf("R Version: %s\n\n", R.version.string))

cat("COMPARISON RESULTS\n")
cat("------------------\n")
print(comparison, row.names = FALSE)

cat(sprintf("\nOVERALL VERDICT: %s\n",
  ifelse(all(comparison$pass), "VALIDATED", "DISCREPANCIES - INVESTIGATION REQUIRED")))

cat("\nSESSION INFO\n")
print(sessionInfo())

sink()
```

**Erwartet:** Eine vollstaendige Validierungsberichtsdatei existiert unter `validation/output_comparison_report.txt` mit Projektmetadaten, Vergleichsergebnissen, Gesamturteil und Sitzungsinformationen.

**Bei Fehler:** Schlaegt `sink()` fehl oder produziert eine leere Datei, pruefen, ob das Ausgabeverzeichnis existiert (`dir.create("validation", showWarnings = FALSE)`) und ob kein vorheriger `sink()`-Aufruf noch aktiv ist (`sink.number()` zur Pruefung verwenden).

### Schritt 7: Abweichungen behandeln

Wenn Ergebnisse nicht uebereinstimmen:

1. Pruefen, ob beide Implementierungen dieselben Eingabedaten verwenden (Hash-Vergleich)
2. Unterschiede in der NA-Behandlung pruefen
3. Zwischenberechnungen Schritt fuer Schritt vergleichen
4. Grundursache dokumentieren
5. Feststellen, ob die Differenz akzeptabel ist (innerhalb der Toleranz) oder eine Codekorrektur erfordert

**Erwartet:** Alle Abweichungen werden untersucht, Grundursachen identifiziert, und jede wird entweder als akzeptabel (innerhalb der Toleranz mit dokumentiertem Grund) oder als korrekturbeduerend eingestuft.

**Bei Fehler:** Kann eine Abweichung nicht erklaert werden, an den statistischen Leiter eskalieren. Unerklaerete Unterschiede nicht ignorieren, da sie auf einen echten Fehler in einer Implementierung hinweisen koennen.

## Validierung

- [ ] Unabhaengige Analyse produziert Ergebnisse innerhalb der Toleranz
- [ ] Alle Vergleichsstatistiken sind dokumentiert
- [ ] Abweichungen (falls vorhanden) sind untersucht und behoben
- [ ] Eingabedatenintegritaet verifiziert (Hash-Uebereinstimmung)
- [ ] Toleranzkriterien sind vorab festgelegt und begruendet
- [ ] Validierungsbericht ist vollstaendig und unterzeichnet

## Haeufige Stolperfallen

- **Gleicher Analytiker fuer beide Implementierungen**: Doppelprogrammierung erfordert unabhaengige Analytiker fuer echte Validierung
- **Code zwischen Implementierungen teilen**: Die unabhaengige Version darf nicht von der primaeren kopiert werden
- **Unangemessene Toleranz**: Zu locker verbirgt echte Fehler; zu streng markiert Gleitkommageraeusch
- **Systematische Unterschiede ignorieren**: Kleine konsistente Verzerrungen koennen auf einen echten Fehler hinweisen, auch wenn sie innerhalb der Toleranz liegen
- **Keine Validierung der Validierung**: Pruefen, ob der Vergleichscode selbst mit bekannten Eingaben korrekt funktioniert

## Verwandte Skills

- `setup-gxp-r-project` - Projektstruktur fuer validierte Arbeiten
- `write-validation-documentation` - Protokoll- und Berichtsvorlagen
- `implement-audit-trail` - Verfolgung des Validierungsprozesses selbst
- `write-testthat-tests` - Automatisierte Testsuiten fuer laufende Validierung
