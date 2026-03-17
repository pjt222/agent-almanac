---
name: write-vignette
description: >
  R-Paket-Vignetten mit R Markdown oder Quarto erstellen. Behandelt
  Vignetten-Einrichtung, YAML-Konfiguration, Code-Chunk-Optionen,
  Erstellen und Testen sowie CRAN-Anforderungen fuer Vignetten.
  Verwenden beim Hinzufuegen eines "Getting Started"-Tutorials,
  beim Dokumentieren komplexer Arbeitsablaeufe ueber mehrere Funktionen
  hinweg, beim Erstellen domaenenspezifischer Anleitungen oder wenn
  die CRAN-Einreichung benutzerseitige Dokumentation jenseits von
  Funktionshilfeseiten erfordert.
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
  tags: r, vignette, rmarkdown, documentation, tutorial
---

# Vignette schreiben

Ausfuehrliche Dokumentationsvignetten fuer R-Pakete erstellen.

## Wann verwenden

- Ein "Getting Started"-Tutorial fuer ein Paket hinzufuegen
- Komplexe Arbeitsablaeufe dokumentieren, die mehrere Funktionen umfassen
- Domaenenspezifische Anleitungen erstellen (z.B. statistische Methodik)
- CRAN-Einreichung erfordert benutzerseitige Dokumentation jenseits von Funktionshilfe

## Eingaben

- **Erforderlich**: R-Paket mit zu dokumentierenden Funktionen
- **Erforderlich**: Vignetten-Titel und Thema
- **Optional**: Format (R Markdown oder Quarto, Standard: R Markdown)
- **Optional**: Ob die Vignette externe Daten oder APIs benoetigt

## Vorgehensweise

### Schritt 1: Vignetten-Datei erstellen

```r
usethis::use_vignette("getting-started", title = "Getting Started with packagename")
```

**Erwartet:** `vignettes/getting-started.Rmd` mit YAML-Frontmatter erstellt. `knitr` und `rmarkdown` zum Suggests-Feld in DESCRIPTION hinzugefuegt. Das Verzeichnis `vignettes/` existiert.

**Bei Fehler:** Wenn `usethis::use_vignette()` fehlschlaegt, pruefen, ob das Arbeitsverzeichnis das Paketstammverzeichnis ist (enthaelt `DESCRIPTION`). Wenn `knitr` nicht installiert ist, zuerst `install.packages("knitr")` ausfuehren. Bei manueller Erstellung das Verzeichnis `vignettes/` und die Datei von Hand anlegen und sicherstellen, dass das YAML-Frontmatter alle drei `%\Vignette*`-Eintraege enthaelt.

### Schritt 2: Vignetten-Inhalt schreiben

```markdown
---
title: "Getting Started with packagename"
output: rmarkdown::html_vignette
vignette: >
  %\VignetteIndexEntry{Getting Started with packagename}
  %\VignetteEngine{knitr::rmarkdown}
  %\VignetteEncoding{UTF-8}
---

## Introduction

Brief overview of what the package does and who it's for.

## Installation

```r
install.packages("packagename")
library(packagename)
```

## Basic Usage

Walk through the primary workflow:

```r
# Load example data
data <- example_data()

# Process
result <- main_function(data, option = "default")

# Inspect
summary(result)
```

## Advanced Features

Cover optional or advanced functionality.

## Conclusion

Summarize and point to other vignettes or resources.
```

**Erwartet:** Die Vignetten-Rmd-Datei enthaelt die Abschnitte Introduction, Installation, Basic Usage, Advanced Features und Conclusion. Code-Beispiele verwenden die exportierten Funktionen des Pakets und liefern sichtbare Ausgaben.

**Bei Fehler:** Wenn Beispiele nicht ausfuehren, pruefen, ob das Paket mit `devtools::install()` installiert ist. Sicherstellen, dass Beispiele den Paketnamen in `library()`-Aufrufen verwenden (nicht `devtools::load_all()`). Fuer Funktionen, die externe Ressourcen benoetigen, `eval=FALSE` verwenden, um Code ohne Ausfuehrung anzuzeigen.

### Schritt 3: Code-Chunks konfigurieren

Chunk-Optionen fuer verschiedene Zwecke verwenden:

```r
# Standard ausgewerteter Chunk
{r example-basic}
result <- compute_something(1:10)
result

# Code anzeigen, aber nicht ausfuehren (fuer illustrative Zwecke)
{r api-example, eval=FALSE}
connect_to_api(key = "your_key_here")

# Ausfuehren, aber Code verbergen (nur Ausgabe anzeigen)
{r hidden-setup, echo=FALSE}
library(packagename)

# Globale Optionen setzen
{r setup, include=FALSE}
knitr::opts_chunk$set(
  collapse = TRUE,
  comment = "#>",
  fig.width = 7,
  fig.height = 5
)
```

**Erwartet:** Ein Setup-Chunk mit `include=FALSE` setzt globale Optionen (`collapse`, `comment`, `fig.width`, `fig.height`). Chunks sind angemessen konfiguriert: `eval=FALSE` fuer illustrativen Code, `echo=FALSE` fuer verstecktes Setup und Standard-Chunks fuer interaktive Beispiele.

**Bei Fehler:** Wenn Chunk-Optionen nicht wirksam werden, pruefen, ob die Syntax das Format `{r chunk-name, option=value}` verwendet (kommagetrennt, keine Anfuehrungszeichen um logische Werte). Sicherstellen, dass der Setup-Chunk zuerst laeuft, indem er am Anfang des Dokuments platziert wird.

### Schritt 4: Externe Abhaengigkeiten behandeln

Fuer Vignetten, die Netzwerkzugriff oder optionale Pakete benoetigen:

```r
{r check-available, include=FALSE}
has_suggested <- requireNamespace("optionalpkg", quietly = TRUE)

{r use-suggested, eval=has_suggested}
optionalpkg::special_function()
```

Fuer zeitaufwendige Berechnungen Ergebnisse vorausberechnen und speichern:

```r
# Vorberechnete Ergebnisse in vignettes/ speichern
saveRDS(expensive_result, "vignettes/precomputed.rds")

# In der Vignette laden
{r load-precomputed}
result <- readRDS("precomputed.rds")
```

**Erwartet:** Externe Abhaengigkeiten werden angemessen behandelt: Optionale Pakete werden bedingt mit `requireNamespace()` geladen, netzwerkabhaengiger Code verwendet `eval=FALSE` oder `tryCatch()`, und aufwendige Berechnungen verwenden vorberechnete `.rds`-Dateien.

**Bei Fehler:** Wenn die Vignette bei CRAN wegen nicht verfuegbarer optionaler Pakete fehlschlaegt, diese Abschnitte mit einer Bedingungsvariable umschliessen (z.B. `eval=has_suggested`). Bei vorberechneten Ergebnissen sicherstellen, dass die `.rds`-Datei im Verzeichnis `vignettes/` enthalten ist und mit relativem Pfad referenziert wird.

### Schritt 5: Vignette bauen und testen

```r
# Einzelne Vignette bauen
devtools::build_vignettes()

# Bauen und pruefen (erkennt Vignetten-Probleme)
devtools::check()
```

**Erwartet:** Vignette baut ohne Fehler. HTML-Ausgabe ist lesbar.

**Bei Fehler:**
- Fehlendes pandoc: `RSTUDIO_PANDOC` in `.Renviron` setzen
- Paket nicht installiert: Zuerst `devtools::install()` ausfuehren
- Fehlende Suggests: Im Suggests von DESCRIPTION aufgefuehrte Pakete installieren

### Schritt 6: In der Paketpruefung verifizieren

```r
devtools::check()
```

Vignetten-bezogene Pruefungen: Baut korrekt, dauert nicht zu lange, keine Fehler.

**Erwartet:** `devtools::check()` besteht ohne vignetten-bezogene Fehler oder Warnungen. Die Vignette baut innerhalb der CRAN-Zeitlimits (in der Regel unter 60 Sekunden).

**Bei Fehler:** Wenn die Vignette Pruefungsfehler verursacht, haeufige Korrekturen: fehlende Suggests-Pakete zu DESCRIPTION hinzufuegen, Bauzeit mit `eval=FALSE` bei langsamen Chunks reduzieren und sicherstellen, dass `VignetteIndexEntry` mit dem Titel uebereinstimmt. `devtools::build_vignettes()` separat ausfuehren, um vignetten-spezifische Fehler zu isolieren.

## Validierung

- [ ] Vignette baut ohne Fehler via `devtools::build_vignettes()`
- [ ] Alle Code-Chunks werden korrekt ausgefuehrt
- [ ] VignetteIndexEntry stimmt mit dem Titel ueberein
- [ ] `devtools::check()` besteht ohne Vignetten-Warnungen
- [ ] Vignette erscheint in den Artikeln der pkgdown-Website (falls zutreffend)
- [ ] Bauzeit ist vertretbar (< 60 Sekunden fuer CRAN)

## Haeufige Stolperfallen

- **VignetteIndexEntry-Abweichung**: Der Indexeintrag im YAML muss dem entsprechen, was Nutzer in `vignette(package = "pkg")` sehen sollen
- **Fehlendes `vignette`-YAML-Block**: Alle drei `%\Vignette*`-Zeilen sind erforderlich
- **Vignette zu langsam fuer CRAN**: Ergebnisse vorausberechnen oder `eval=FALSE` fuer aufwendige Operationen verwenden
- **Pandoc nicht gefunden**: Sicherstellen, dass die Umgebungsvariable `RSTUDIO_PANDOC` gesetzt ist
- **Selbstreferenzierendes Paket**: In Vignetten `library(packagename)` statt `devtools::load_all()` verwenden

## Verwandte Skills

- `write-roxygen-docs` - Funktionsdokumentation ergaenzt Vignetten-Tutorials
- `build-pkgdown-site` - Vignetten erscheinen als Artikel auf der pkgdown-Website
- `submit-to-cran` - CRAN hat spezifische Vignetten-Anforderungen
- `create-quarto-report` - Quarto als Alternative zu R Markdown-Vignetten
