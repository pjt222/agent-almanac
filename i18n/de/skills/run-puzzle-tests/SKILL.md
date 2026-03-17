---
name: run-puzzle-tests
description: >
  Die jigsawR-Testsuite ueber WSL-R-Ausfuehrung starten. Unterstuetzt
  vollstaendige Suite, nach Muster gefiltert oder einzelne Datei.
  Interpretiert Pass/Fail/Skip-Zaehler und identifiziert fehlschlagende
  Tests. Verwendet niemals das --vanilla-Flag (renv benoetigt .Rprofile
  fuer die Aktivierung).
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: jigsawr
  complexity: basic
  language: R
  tags: jigsawr, testing, testthat, renv, wsl
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# Puzzle-Tests ausfuehren

Die jigsawR-Testsuite ausfuehren und Ergebnisse interpretieren.

## Wann verwenden

- Nach Aenderung von R-Quellcode im Paket
- Nach Hinzufuegen eines neuen Puzzletyps oder Features
- Vor dem Committen von Aenderungen zur Verifizierung, dass nichts kaputt ist
- Debuggen eines spezifischen Testfehlers

## Eingaben

- **Erforderlich**: Testumfang (`full`, `filtered` oder `single`)
- **Optional**: Filtermuster (fuer gefilterten Modus, z.B. `"snic"`, `"rectangular"`)
- **Optional**: Spezifischer Testdateipfad (fuer Einzelmodus)

## Vorgehensweise

### Schritt 1: Testumfang waehlen

| Umfang | Verwenden wenn | Dauer |
|-------|----------|----------|
| Voll | Vor Commits, nach grossen Aenderungen | ~2-5 Min |
| Gefiltert | Arbeit an einem Puzzletyp | ~30s |
| Einzeln | Debuggen einer spezifischen Testdatei | ~10s |

**Erwartet:** Testumfang basierend auf aktuellem Workflow ausgewaehlt: vollstaendige Suite vor Commits, gefiltert bei Arbeit an einem spezifischen Puzzletyp, einzelne Datei beim Debuggen eines Tests.

**Bei Fehler:** Falls unsicher, welcher Umfang verwendet werden soll, standardmaessig die vollstaendige Suite waehlen. Es dauert laenger, faengt aber typ-uebergreifende Regressionen ab.

### Schritt 2: Testskript erstellen und ausfuehren

**Vollstaendige Suite**:

Eine Skriptdatei erstellen (z.B. `/tmp/run_tests.R`):

```r
devtools::test()
```

```bash
R_EXE="/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe"
cd /mnt/d/dev/p/jigsawR && "$R_EXE" -e "devtools::test()"
```

**Nach Muster gefiltert**:

```bash
"$R_EXE" -e "devtools::test(filter = 'snic')"
```

**Einzelne Datei**:

```bash
"$R_EXE" -e "testthat::test_file('tests/testthat/test-snic-puzzles.R')"
```

**Erwartet:** Testausgabe mit Pass/Fail/Skip-Zaehlern.

**Bei Fehler:**
- NICHT das `--vanilla`-Flag verwenden; renv benoetigt `.Rprofile` zur Aktivierung
- Bei renv-Fehlern zuerst `renv::restore()` ausfuehren
- Fuer komplexe Befehle, die mit Exit-Code 5 fehlschlagen, in eine Skriptdatei schreiben

### Schritt 3: Ergebnisse interpretieren

Nach der Zusammenfassungszeile suchen:

```
[ FAIL 0 | WARN 0 | SKIP 7 | PASS 2042 ]
```

- **PASS**: Tests, die erfolgreich waren
- **FAIL**: Tests, die fehlgeschlagen sind (muessen untersucht werden)
- **SKIP**: Uebersprungene Tests (normalerweise wegen fehlender optionaler Pakete wie `snic`)
- **WARN**: Warnungen waehrend Tests (ueberpruefen, aber nicht blockierend)

**Erwartet:** Zusammenfassungszeile geparst, um PASS-, FAIL-, SKIP- und WARN-Zaehler zu identifizieren. FAIL = 0 fuer einen sauberen Testlauf.

**Bei Fehler:** Falls die Zusammenfassungszeile nicht sichtbar ist, ist der Test-Runner moeglicherweise vor dem Abschluss abgestuerzt. Auf R-Level-Fehler oberhalb der Zusammenfassung pruefen. Falls die Ausgabe abgeschnitten ist, in eine Datei umleiten: `"$R_EXE" -e "devtools::test()" > test_results.txt 2>&1`.

### Schritt 4: Fehler untersuchen

Falls Tests fehlschlagen:

1. Die Fehlermeldung lesen -- sie enthaelt Datei, Zeile und erwartet vs. tatsaechlich
2. Pruefen, ob es ein neuer Fehler oder ein vorbestehender ist
3. Fuer Assertion-Fehler den Test und die getestete Funktion lesen
4. Fuer Fehler-Ausfaelle pruefen, ob sich eine Funktionssignatur geaendert hat

```bash
# Nur den fehlschlagenden Test mit ausfuehrlicher Ausgabe ausfuehren
"$R_EXE" -e "testthat::test_file('tests/testthat/test-failing.R', reporter = 'summary')"
```

**Erwartet:** Ursache jedes fehlschlagenden Tests identifiziert. Der Fehler ist entweder eine echte Regression (Code muss behoben werden) oder ein Testumgebungsproblem (fehlende Abhaengigkeit, Pfadproblem).

**Bei Fehler:** Falls die Fehlermeldung unklar ist, `browser()`- oder `print()`-Anweisungen zum Test hinzufuegen und mit `testthat::test_file()` fuer interaktives Debuggen erneut ausfuehren.

### Schritt 5: Skip-Gruende verifizieren

Uebersprungene Tests sind normal, wenn optionale Abhaengigkeiten fehlen:

- `snic`-Paket-Tests ueberspringen mit `skip_if_not_installed("snic")`
- Tests, die ein bestimmtes Betriebssystem erfordern, ueberspringen mit `skip_on_os()`
- Nur-CRAN-Skips mit `skip_on_cran()`

Bestaetigen, dass Skip-Gruende legitim sind und keine echten Fehler maskieren.

**Erwartet:** Alle Skips werden durch legitime Gruende erklaert (optionale Abhaengigkeit nicht installiert, plattformspezifischer Skip, Nur-CRAN-Skip). Keine Skips maskieren tatsaechliche Testfehler.

**Bei Fehler:** Falls ein Skip verdaechtig erscheint, den `skip_if_*()`-Aufruf voruebergehend entfernen und den Test ausfuehren, um zu sehen, ob er besteht oder einen versteckten Fehler aufdeckt.

## Validierung

- [ ] Alle Tests bestehen (FAIL = 0)
- [ ] Keine unerwarteten Warnungen
- [ ] Skip-Zaehler stimmt mit erwartetem Wert ueberein (nur optionale Abhaengigkeits-Skips)
- [ ] Testanzahl hat sich nicht verringert (keine Tests versehentlich entfernt)

## Haeufige Fehler

- **Verwendung von `--vanilla`**: Unterbricht die renv-Aktivierung. Niemals mit jigsawR verwenden.
- **Komplexe `-e`-Strings**: Shell-Escaping-Probleme verursachen Exit-Code 5. Skriptdateien verwenden.
- **Veralteter Paketstatus**: `devtools::load_all()` oder `devtools::document()` vor dem Testen ausfuehren, falls NAMESPACE-relevanter Code geaendert wurde.
- **Fehlende Testabhaengigkeiten**: Einige Tests benoetigen Suggested-Pakete. DESCRIPTION Suggests-Feld pruefen.
- **Parallele Testprobleme**: Falls Tests sich gegenseitig stoeren, sequentiell mit `testthat::test_file()` ausfuehren.

## Verwandte Skills

- `generate-puzzle` -- Puzzles generieren, um zu verifizieren, dass das Verhalten den Tests entspricht
- `add-puzzle-type` -- Neue Typen benoetigen umfassende Testsuiten
- `write-testthat-tests` -- Allgemeine Muster zum Schreiben von R-Tests
- `validate-piles-notation` -- PILES-Parsing unabhaengig testen
