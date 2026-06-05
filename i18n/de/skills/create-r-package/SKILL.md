---
name: create-r-package
description: >
  Ein neues R-Paket mit vollstaendiger Struktur aufsetzen, einschliesslich
  DESCRIPTION, NAMESPACE, testthat, roxygen2, renv, Git, GitHub Actions CI
  und Entwicklungskonfigurationsdateien (.Rprofile, .Renviron.example,
  CLAUDE.md). Folgt den usethis-Konventionen und dem tidyverse-Stil.
  Verwenden beim Erstellen eines neuen R-Pakets von Grund auf, beim
  Umwandeln loser R-Skripte in ein strukturiertes Paket oder beim
  Aufsetzen eines Paketgeruests fuer kollaborative Entwicklung.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: r-packages
  complexity: basic
  language: R
  tags: r, package, usethis, scaffold, setup
  locale: de
  source_locale: en
  source_commit: 6a868d56
  translator: claude-opus-4-6
  translation_date: 2026-03-13
---

# R-Paket erstellen

Ein vollstaendig konfiguriertes R-Paket mit modernen Werkzeugen und Best Practices aufsetzen.

## Wann verwenden

- Beim Erstellen eines neuen R-Pakets von Grund auf
- Beim Umwandeln loser R-Skripte in ein Paket
- Beim Aufsetzen eines Paketgeruests fuer kollaborative Entwicklung

## Eingaben

- **Erforderlich**: Paketname (Kleinbuchstaben, keine Sonderzeichen ausser `.`)
- **Erforderlich**: Einzeilige Beschreibung des Paketzwecks
- **Optional**: Lizenztyp (Standard: MIT)
- **Optional**: Autorinformationen (Name, E-Mail, ORCID)
- **Optional**: Ob renv initialisiert werden soll (Standard: ja)

## Vorgehensweise

### Schritt 1: Paketgeruest erstellen

```r
usethis::create_package("packagename")
setwd("packagename")
```

**Erwartet:** Verzeichnis erstellt mit `DESCRIPTION`, `NAMESPACE`, `R/` und `man/` Unterverzeichnissen.

**Bei Fehler:** Sicherstellen, dass usethis installiert ist (`install.packages("usethis")`). Pruefen, dass das Verzeichnis nicht bereits existiert.

### Schritt 2: DESCRIPTION konfigurieren

`DESCRIPTION` mit korrekten Metadaten bearbeiten:

```text
Package: packagename
Title: What the Package Does (Title Case)
Version: 0.1.0
Authors@R:
    person("First", "Last", , "email@example.com", role = c("aut", "cre"),
           comment = c(ORCID = "0000-0000-0000-0000"))
Description: One paragraph describing what the package does. Must be more
    than one sentence. Avoid starting with "This package".
License: MIT + file LICENSE
Encoding: UTF-8
Roxygen: list(markdown = TRUE)
RoxygenNote: 7.3.2
URL: https://github.com/username/packagename
BugReports: https://github.com/username/packagename/issues
```

**Erwartet:** Gueltige DESCRIPTION, die `R CMD check` ohne Metadaten-Warnungen besteht.

**Bei Fehler:** Falls `R CMD check` DESCRIPTION-Felder bemaengelt, sicherstellen, dass `Title` in Title Case ist, `Description` mehr als einen Satz enthaelt und `Authors@R` gueltige `person()`-Syntax verwendet.

### Schritt 3: Infrastruktur einrichten

```r
usethis::use_mit_license()
usethis::use_readme_md()
usethis::use_news_md()
usethis::use_testthat(edition = 3)
usethis::use_git()
usethis::use_github_action("check-standard")
```

**Erwartet:** LICENSE, README.md, NEWS.md, `tests/`-Verzeichnis, `.git/` initialisiert und `.github/workflows/` erstellt.

**Bei Fehler:** Falls eine `usethis::use_*()`-Funktion fehlschlaegt, die fehlende Abhaengigkeit installieren und erneut ausfuehren. Falls `.git/` bereits existiert, ueberspringt `use_git()` die Initialisierung.

### Schritt 4: Entwicklungskonfiguration erstellen

`.Rprofile` erstellen:

```r
if (file.exists("renv/activate.R")) {
  source("renv/activate.R")
}

if (requireNamespace("mcptools", quietly = TRUE)) {
  mcptools::mcp_session()
}
```

`.Renviron.example` erstellen:

```text
RSTUDIO_PANDOC="C:/Program Files/RStudio/resources/app/bin/quarto/bin/tools"
# GITHUB_PAT=your_github_token_here
```

`.Rbuildignore`-Eintraege erstellen:

```text
^\.Rprofile$
^\.Renviron$
^\.Renviron\.example$
^renv$
^renv\.lock$
^CLAUDE\.md$
^\.github$
^.*\.Rproj$
```

**Erwartet:** `.Rprofile`, `.Renviron.example` und `.Rbuildignore` sind erstellt. Entwicklungsdateien sind vom gebauten Paket ausgeschlossen.

**Bei Fehler:** Falls `.Rprofile` beim Start Fehler verursacht, Syntaxprobleme pruefen. Sicherstellen, dass `requireNamespace()`-Schutzabfragen Fehler bei fehlenden optionalen Paketen verhindern.

### Schritt 5: renv initialisieren

```r
renv::init()
```

**Erwartet:** `renv/`-Verzeichnis und `renv.lock` erstellt. Projektlokale Bibliothek ist aktiv.

**Bei Fehler:** renv mit `install.packages("renv")` installieren. Falls renv bei der Initialisierung haengt, Netzwerkverbindung pruefen oder `options(timeout = 600)` setzen.

### Schritt 6: Paketdokumentationsdatei erstellen

`R/packagename-package.R` erstellen:

```r
#' @keywords internal
"_PACKAGE"

## usethis namespace: start
## usethis namespace: end
NULL
```

**Erwartet:** `R/packagename-package.R` existiert mit dem `"_PACKAGE"`-Sentinel. Ausfuehren von `devtools::document()` generiert die paketweite Hilfe.

**Bei Fehler:** Sicherstellen, dass der Dateiname dem Muster `R/<packagename>-package.R` entspricht. Der `"_PACKAGE"`-String muss ein eigenstaendiger Ausdruck sein, nicht innerhalb einer Funktion.

### Schritt 7: CLAUDE.md erstellen

`CLAUDE.md` im Projektstammverzeichnis mit projektspezifischen Anweisungen fuer KI-Assistenten erstellen.

**Erwartet:** `CLAUDE.md` existiert im Projektstammverzeichnis mit projektspezifischen Bearbeitungskonventionen, Build-Befehlen und Architekturhinweisen.

**Bei Fehler:** Falls unsicher, was enthalten sein soll, mit dem Paketnamen, einer einzeiligen Beschreibung, gaengigen Entwicklungsbefehlen (`devtools::check()`, `devtools::test()`) und nicht offensichtlichen Konventionen beginnen.

## Validierung

- [ ] `devtools::check()` liefert 0 Fehler, 0 Warnungen
- [ ] Paketstruktur entspricht dem erwarteten Layout
- [ ] `.Rprofile` laedt fehlerfrei
- [ ] `renv::status()` zeigt keine Probleme
- [ ] Git-Repository initialisiert mit passendem `.gitignore`
- [ ] GitHub Actions Workflow-Datei vorhanden

## Haeufige Stolperfallen

- **Paketnamenskonflikte**: Vor der Namensfestlegung CRAN mit `available::available("packagename")` pruefen
- **Fehlende .Rbuildignore-Eintraege**: Entwicklungsdateien (`.Rprofile`, `.Renviron`, `renv/`) muessen vom gebauten Paket ausgeschlossen werden
- **Encoding vergessen**: Immer `Encoding: UTF-8` in DESCRIPTION einfuegen
- **RoxygenNote-Abweichung**: Die Version in DESCRIPTION muss mit der installierten roxygen2-Version uebereinstimmen

## Beispiele

```r
# Minimale Erstellung
usethis::create_package("myanalysis")

# Vollstaendiges Setup in einer Sitzung
usethis::create_package("myanalysis")
usethis::use_mit_license()
usethis::use_testthat(edition = 3)
usethis::use_readme_md()
usethis::use_git()
usethis::use_github_action("check-standard")
renv::init()
```

## Verwandte Skills

- `write-roxygen-docs` - Funktionen dokumentieren
- `write-testthat-tests` - Tests fuer das Paket hinzufuegen
- `setup-github-actions-ci` - Detaillierte CI/CD-Konfiguration
- `manage-renv-dependencies` - Paketabhaengigkeiten verwalten
- `write-claude-md` - Wirksame KI-Assistenten-Anweisungen erstellen
