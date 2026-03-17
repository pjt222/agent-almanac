---
name: submit-to-cran
description: >
  Vollstaendiges Verfahren zur Einreichung eines R-Pakets bei CRAN,
  einschliesslich Vorpruefungen (lokal, win-builder, R-hub), Vorbereitung
  der cran-comments.md, URL- und Rechtschreibpruefung sowie der eigentlichen
  Einreichung. Deckt Ersteinreichungen und Aktualisierungen ab. Verwenden,
  wenn ein Paket fuer die erstmalige Veroeffentlichung auf CRAN bereit ist,
  eine aktualisierte Version eingereicht werden soll oder nach
  CRAN-Prueferrueckmeldungen neu eingereicht wird.
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
  complexity: advanced
  language: R
  tags: r, cran, submission, release, publishing
---

# Bei CRAN einreichen

Den vollstaendigen CRAN-Einreichungsworkflow von den Vorabpruefungen bis zur Einreichung ausfuehren.

## Wann verwenden

- Paket ist fuer die erstmalige Veroeffentlichung auf CRAN bereit
- Eine aktualisierte Version eines bestehenden CRAN-Pakets wird eingereicht
- Nach CRAN-Prueferrueckmeldungen wird neu eingereicht

## Eingaben

- **Erforderlich**: R-Paket, das den lokalen `R CMD check` mit 0 Fehlern und 0 Warnungen besteht
- **Erforderlich**: Aktualisierte Versionsnummer in DESCRIPTION
- **Erforderlich**: Aktualisierte NEWS.md mit Aenderungen fuer diese Version
- **Optional**: Frueherer CRAN-Prueferkommentar (fuer Wiedereinreichungen)

## Vorgehensweise

### Schritt 1: Version und NEWS pruefen

Version in DESCRIPTION verifizieren:

```r
desc::desc_get_version()
```

Sicherstellen, dass NEWS.md einen Eintrag fuer diese Version enthaelt. Der Eintrag sollte benutzerseitige Aenderungen zusammenfassen.

**Erwartet:** Version folgt semantischer Versionierung. NEWS.md hat einen passenden Eintrag fuer diese Version.

**Bei Fehler:** Version mit `usethis::use_version()` aktualisieren (Auswahl: "major", "minor" oder "patch"). Einen NEWS.md-Eintrag mit benutzerseitigen Aenderungen hinzufuegen.

### Schritt 2: Lokaler R CMD Check

```r
devtools::check()
```

**Erwartet:** 0 Fehler, 0 Warnungen, 0 Hinweise (1 Hinweis bei Ersteinreichungen akzeptabel: "New submission").

**Bei Fehler:** Alle Fehler und Warnungen vor dem Fortfahren beheben. Das Pruefprotokoll unter `<pkg>.Rcheck/00check.log` fuer Details lesen. Hinweise sollten in cran-comments.md erlaeutert werden.

### Schritt 3: Rechtschreibpruefung

```r
devtools::spell_check()
```

Legitime Woerter zu `inst/WORDLIST` hinzufuegen (ein Wort pro Zeile, alphabetisch sortiert).

**Erwartet:** Keine unerwarteten Rechtschreibfehler. Alle markierten Woerter sind entweder korrigiert oder zu `inst/WORDLIST` hinzugefuegt.

**Bei Fehler:** Echte Rechtschreibfehler beheben. Fachbegriffe zu `inst/WORDLIST` hinzufuegen (ein Wort pro Zeile, alphabetisch sortiert).

### Schritt 4: URL-Pruefung

```r
urlchecker::url_check()
```

**Erwartet:** Alle URLs liefern HTTP 200 zurueck. Keine defekten oder weitergeleiteten Links.

**Bei Fehler:** Defekte URLs ersetzen. `\doi{}` fuer DOI-Links anstelle von rohen URLs verwenden. Links zu nicht mehr vorhandenen Ressourcen entfernen.

### Schritt 5: Win-Builder-Pruefungen

```r
devtools::check_win_devel()
devtools::check_win_release()
```

Auf E-Mail-Ergebnisse warten (in der Regel 15-30 Minuten).

**Erwartet:** 0 Fehler, 0 Warnungen fuer Win-builder release und devel. Ergebnisse kommen per E-Mail innerhalb von 15-30 Minuten an.

**Bei Fehler:** Plattformspezifische Probleme beheben. Haeufige Ursachen: unterschiedliche Compiler-Warnungen, fehlende Systemabhaengigkeiten, Pfadtrennzeichen-Unterschiede. Lokal beheben und erneut an Win-builder senden.

### Schritt 6: R-hub-Pruefung

```r
rhub::rhub_check()
```

Prueft auf mehreren Plattformen (Ubuntu, Windows, macOS).

**Erwartet:** Alle Plattformen bestehen mit 0 Fehlern und 0 Warnungen.

**Bei Fehler:** Wenn eine bestimmte Plattform fehlschlaegt, das R-hub-Build-Protokoll nach plattformspezifischen Fehlern durchsuchen. `testthat::skip_on_os()` oder bedingten Code fuer plattformabhaengiges Verhalten verwenden.

### Schritt 7: cran-comments.md vorbereiten

`cran-comments.md` im Paketstammverzeichnis erstellen oder aktualisieren:

```markdown
## R CMD check results
0 errors | 0 warnings | 1 note

* This is a new release.

## Test environments
* local: Windows 11, R 4.5.0
* win-builder: R-release, R-devel
* R-hub: ubuntu-latest (R-release), windows-latest (R-release), macos-latest (R-release)

## Downstream dependencies
There are currently no downstream dependencies for this package.
```

Fuer Aktualisierungen Folgendes einschliessen:
- Was sich geaendert hat (kurz)
- Antwort auf frueheres Prueferrueckmeldung
- Ergebnisse der Pruefung rueckwaertsgerichteter Abhaengigkeiten, falls zutreffend

**Erwartet:** `cran-comments.md` fasst die Pruefergebnisse aller Testumgebungen korrekt zusammen und erlaeutert alle Hinweise.

**Bei Fehler:** Wenn Pruefergebnisse zwischen Plattformen abweichen, alle Abweichungen dokumentieren. CRAN-Pruefer werden diese Angaben mit eigenen Tests vergleichen.

### Schritt 8: Letzte Vorabpruefung

```r
# Eine letzte Pruefung
devtools::check()

# Das gebaute Tarball verifizieren
devtools::build()
```

**Erwartet:** Abschliessender `devtools::check()` wird sauber bestanden. Ein `.tar.gz`-Tarball wird im uebergeordneten Verzeichnis erstellt.

**Bei Fehler:** Wenn ein letztes Problem auftaucht, es beheben und alle Pruefungen ab Schritt 2 erneut ausfuehren. Nicht mit bekannten Fehlern einreichen.

### Schritt 9: Einreichen

```r
devtools::release()
```

Fuehrt interaktive Pruefungen durch und reicht ein. Alle Fragen ehrlich beantworten.

Alternativ manuell unter https://cran.r-project.org/submit.html einreichen, indem das Tarball hochgeladen wird.

**Erwartet:** Bestaetigung per E-Mail von CRAN kommt innerhalb weniger Minuten an. Auf den Bestaetigunslink klicken, um die Einreichung abzuschliessen.

**Bei Fehler:** E-Mail auf Ablehnungsgruende pruefen. Haeufige Probleme: Beispiele zu langsam, fehlende `\value`-Tags, nicht portierbarer Code. Probleme beheben und erneut einreichen, dabei in cran-comments.md vermerken, was geaendert wurde.

### Schritt 10: Nach der Einreichung

Nach der Annahme:

```r
# Release taggen
usethis::use_github_release()

# Auf Entwicklungsversion hochsetzen
usethis::use_dev_version()
```

**Erwartet:** GitHub-Release mit dem angenommenen Versions-Tag erstellt. DESCRIPTION auf die Entwicklungsversion (`x.y.z.9000`) angehoben.

**Bei Fehler:** Wenn das GitHub-Release fehlschlaegt, es manuell mit `gh release create` erstellen. Wenn die CRAN-Annahme verzoegert ist, auf die Bestaetigung per E-Mail warten, bevor getaggt wird.

## Validierung

- [ ] `R CMD check` liefert 0 Fehler, 0 Warnungen auf dem lokalen Rechner
- [ ] Win-builder besteht (release + devel)
- [ ] R-hub besteht auf allen getesteten Plattformen
- [ ] `cran-comments.md` beschreibt die Pruefergebnisse korrekt
- [ ] Alle URLs gueltig
- [ ] Keine Rechtschreibfehler
- [ ] Versionsnummer ist korrekt und inkrementiert
- [ ] NEWS.md ist aktuell
- [ ] DESCRIPTION-Metadaten sind vollstaendig und korrekt

## Haeufige Stolperfallen

- **Beispiele zu langsam**: Aufwendige Beispiele in `\donttest{}` einschliessen. CRAN setzt Zeitlimits durch.
- **Nicht-standardmaessige Datei-/Verzeichnisnamen**: Dateien vermeiden, die CRAN-Hinweise ausloesen (`.Rbuildignore` pruefen)
- **Fehlendes `\value` in Dokumentation**: Alle exportierten Funktionen benoetigen ein `@return`-Tag
- **Vignetten-Build-Fehler**: Sicherstellen, dass Vignetten in einer sauberen Umgebung ohne `.Renviron` gebaut werden koennen
- **DESCRIPTION-Titelformat**: Muss Title Case sein, kein Punkt am Ende, kein "A Package for..."
- **Pruefung rueckwaertsgerichteter Abhaengigkeiten vergessen**: Fuer Aktualisierungen `revdepcheck::revdep_check()` ausfuehren

## Beispiele

```r
# Vollstaendiger Voreinreichungs-Workflow
devtools::spell_check()
urlchecker::url_check()
devtools::check()
devtools::check_win_devel()
rhub::rhub_check()
# Auf Ergebnisse warten...
devtools::release()
```

## Verwandte Skills

- `release-package-version` - Versionserhoehung und Git-Tagging
- `write-roxygen-docs` - Dokumentation sicherstellen, die CRAN-Standards erfuellt
- `setup-github-actions-ci` - CI-Pruefungen, die CRAN-Anforderungen spiegeln
- `build-pkgdown-site` - Dokumentationswebsite fuer angenommene Pakete
