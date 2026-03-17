---
name: run-puzzle-tests
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude
translation_date: "2026-03-17"
description: >
  Die jigsawR-Testsuite ueber WSL-R-Ausfuehrung starten. Unterstuetzt
  vollstaendige Suite, nach Muster gefiltert oder einzelne Datei. Interpretiert
  Bestanden/Fehlgeschlagen/Uebersprungen-Zaehler und identifiziert fehlschlagende
  Tests. Verwendet niemals das --vanilla-Flag (renv braucht .Rprofile fuer die
  Aktivierung). Anwenden nach Aenderung von R-Quellcode, nach Hinzufuegen eines
  neuen Puzzle-Typs oder Features, vor dem Committen von Aenderungen zur
  Verifikation dass nichts kaputt ist, oder beim Debuggen eines spezifischen
  Testfehlers.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: jigsawr
  complexity: basic
  language: R
  tags: jigsawr, testing, testthat, renv, wsl
---

# Puzzle-Tests ausfuehren

Die jigsawR-Testsuite ausfuehren und Ergebnisse interpretieren.

## Wann verwenden

- Nach Aenderung von R-Quellcode im Paket
- Nach Hinzufuegen eines neuen Puzzle-Typs oder Features
- Vor dem Committen von Aenderungen zur Verifikation dass nichts kaputt ist
- Beim Debuggen eines spezifischen Testfehlers

## Eingaben

- **Erforderlich**: Testumfang (`full`, `filtered` oder `single`)
- **Optional**: Filtermuster (fuer gefilterten Modus, z.B. `"snic"`, `"rectangular"`)
- **Optional**: Spezifischer Testdateipfad (fuer Einzelmodus)

## Vorgehensweise

### Schritt 1: Testumfang waehlen

| Umfang | Verwenden wenn | Dauer |
|--------|----------------|-------|
| Voll | Vor Commits, nach grossen Aenderungen | ~2-5 Min |
| Gefiltert | Arbeit an einem Puzzle-Typ | ~30s |
| Einzeln | Debuggen einer spezifischen Testdatei | ~10s |

**Erwartet:** Testumfang basierend auf dem aktuellen Arbeitsablauf ausgewaehlt: vollstaendige Suite vor Commits, gefiltert bei Arbeit an einem bestimmten Puzzle-Typ, einzelne Datei beim Debuggen eines Tests.

**Bei Fehler:** Im Zweifelsfall welcher Umfang zu verwenden ist, standardmaessig die vollstaendige Suite ausfuehren. Es dauert laenger, faengt aber typuebergreifende Regressionen ab.

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

**Erwartet:** Testausgabe mit Bestanden/Fehlgeschlagen/Uebersprungen-Zaehlern.

**Bei Fehler:**
- NICHT das `--vanilla`-Flag verwenden; renv braucht `.Rprofile` fuer die Aktivierung
- Bei renv-Fehlern zuerst `renv::restore()` ausfuehren
- Bei komplexen Befehlen die mit Exit-Code 5 fehlschlagen, stattdessen in eine Skriptdatei schreiben

### Schritt 3: Ergebnisse interpretieren

Die Zusammenfassungszeile suchen:

```
[ FAIL 0 | WARN 0 | SKIP 7 | PASS 2042 ]
```

- **PASS**: Tests die bestanden haben
- **FAIL**: Tests die fehlgeschlagen sind (muessen untersucht werden)
- **SKIP**: Uebersprungene Tests (meist wegen fehlender optionaler Pakete wie `snic`)
- **WARN**: Warnungen waehrend der Tests (pruefen aber nicht blockierend)

**Erwartet:** Die Zusammenfassungszeile geparst um PASS-, FAIL-, SKIP- und WARN-Zaehler zu identifizieren. FAIL = 0 fuer einen sauberen Testlauf.

**Bei Fehler:** Wenn die Zusammenfassungszeile nicht sichtbar ist, ist der Test-Runner moeglicherweise vor Abschluss abgestuerzt. Auf R-Fehler oberhalb der Zusammenfassung pruefen. Wenn die Ausgabe abgeschnitten ist, in eine Datei umleiten: `"$R_EXE" -e "devtools::test()" > test_results.txt 2>&1`.

### Schritt 4: Fehlschlaege untersuchen

Wenn Tests fehlschlagen:

1. Die Fehlermeldung lesen — sie enthaelt Datei, Zeile und Erwartetes vs. Tatsaechliches
2. Pruefen ob es ein neuer Fehler oder ein bereits bestehender ist
3. Bei Assertionsfehlerern den Test und die getestete Funktion lesen
4. Bei Fehlererrors pruefen ob sich eine Funktionssignatur geaendert hat

```bash
# Nur den fehlschlagenden Test mit ausfuehrlicher Ausgabe ausfuehren
"$R_EXE" -e "testthat::test_file('tests/testthat/test-failing.R', reporter = 'summary')"
```

**Erwartet:** Grundursache jedes fehlschlagenden Tests identifiziert. Der Fehler ist entweder eine echte Regression (Code muss korrigiert werden) oder ein Testumgebungsproblem (fehlende Abhaengigkeit, Pfadproblem).

**Bei Fehler:** Wenn die Fehlermeldung unklar ist, `browser()`- oder `print()`-Anweisungen zum Test hinzufuegen und mit `testthat::test_file()` fuer interaktives Debugging erneut ausfuehren.

### Schritt 5: Gruende fuer Uebersprungene pruefen

Uebersprungene Tests sind normal wenn optionale Abhaengigkeiten fehlen:

- `snic`-Pakettests ueberspringen mit `skip_if_not_installed("snic")`
- Tests die ein bestimmtes Betriebssystem erfordern ueberspringen mit `skip_on_os()`
- Nur-CRAN-Tests ueberspringen mit `skip_on_cran()`

Bestaetigen dass die Gruende fuer das Ueberspringen berechtigt sind und keine echten Fehler verbergen.

**Erwartet:** Alle uebersprungenen Tests sind durch berechtigte Gruende abgedeckt (optionale Abhaengigkeit nicht installiert, plattformspezifisches Ueberspringen, Nur-CRAN-Ueberspringen). Keine uebersprungenen Tests verbergen tatsaechliche Testfehler.

**Bei Fehler:** Wenn ein Ueberspringen verdaechtig erscheint, den `skip_if_*()`-Aufruf voruebergehend entfernen und den Test ausfuehren um zu sehen ob er besteht oder einen versteckten Fehler offenbart.

## Validierung

- [ ] Alle Tests bestehen (FAIL = 0)
- [ ] Keine unerwarteten Warnungen
- [ ] Zaehler der Uebersprungenen entspricht den Erwartungen (nur uebersprungene fuer optionale Abhaengigkeiten)
- [ ] Testanzahl hat sich nicht verringert (keine Tests versehentlich entfernt)

## Haeufige Stolperfallen

- **`--vanilla` verwenden**: Bricht die renv-Aktivierung ab. Niemals mit jigsawR verwenden.
- **Komplexe `-e`-Zeichenketten**: Shell-Escaping-Probleme verursachen Exit-Code 5. Skriptdateien verwenden.
- **Veralteter Paketzustand**: `devtools::load_all()` oder `devtools::document()` vor dem Testen ausfuehren wenn NAMESPACE-beeinflussender Code geaendert wurde.
- **Fehlende Testabhaengigkeiten**: Manche Tests brauchen vorgeschlagene Pakete. Das `Suggests`-Feld in `DESCRIPTION` pruefen.
- **Probleme mit parallelen Tests**: Wenn Tests sich gegenseitig stoeren, sequentiell mit `testthat::test_file()` ausfuehren.

## Verwandte Skills

- `generate-puzzle` — Puzzles generieren um zu verifizieren dass das Verhalten den Tests entspricht
- `add-puzzle-type` — neue Typen brauchen umfassende Testsuiten
- `write-testthat-tests` — allgemeine Muster zum Schreiben von R-Tests
- `validate-piles-notation` — PILES-Parsing unabhaengig testen
