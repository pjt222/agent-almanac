---
name: install-putior
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude
translation_date: "2026-03-17"
description: >
  Das putior-R-Paket fuer Workflow-Visualisierung installieren und konfigurieren.
  Behandelt CRAN- und GitHub-Installation, optionale Abhaengigkeiten (mcptools,
  ellmer, shiny, shinyAce, logger, plumber2) und Verifikation der vollstaendigen
  Annotation-zu-Diagramm-Pipeline. Anwenden bei der erstmaligen Einrichtung von
  putior, beim Vorbereiten eines Rechners fuer Workflow-Visualisierungsaufgaben,
  wenn ein nachgelagerter Skill die Installation von putior voraussetzt, oder
  beim Wiederherstellen einer Umgebung nach einem R-Versionsupgrade oder
  renv-Bereinigung.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: workflow-visualization
  complexity: basic
  language: R
  tags: putior, install, workflow, mermaid, visualization, R
---

# putior installieren

Das putior-R-Paket und seine optionalen Abhaengigkeiten installieren damit die Annotation-zu-Diagramm-Pipeline einsatzbereit ist.

## Wann verwenden

- Erstmalige Einrichtung von putior in einem Projekt oder einer Umgebung
- Vorbereiten eines Rechners fuer Workflow-Visualisierungsaufgaben
- Ein nachgelagerter Skill (analyze-codebase-workflow, generate-workflow-diagram) setzt putior voraus
- Wiederherstellen einer Umgebung nach einem R-Versionsupgrade oder renv-Bereinigung

## Eingaben

- **Erforderlich**: Zugang zu einer R-Installation (>= 4.1.0)
- **Optional**: Ob von CRAN (Standard) oder der GitHub-Entwicklungsversion installiert werden soll
- **Optional**: Welche optionalen Abhaengigkeitsgruppen installiert werden sollen: MCP (`mcptools`, `ellmer`), interaktiv (`shiny`, `shinyAce`), Protokollierung (`logger`), ACP (`plumber2`)

## Vorgehensweise

### Schritt 1: R-Installation ueberpruefen

Sicherstellen dass R verfuegbar ist und die Mindestversionsanforderung erfuellt.

```r
R.Version()$version.string
# Muss >= 4.1.0 sein
```

```bash
# Von WSL mit Windows-R
"/mnt/c/Program Files/R/R-4.5.2/bin/Rscript.exe" -e "cat(R.version.string)"
```

**Erwartet:** R-Versionszeichenkette ausgegeben, >= 4.1.0.

**Bei Fehler:** R installieren oder upgraden. Unter Windows von https://cran.r-project.org/bin/windows/base/ herunterladen. Unter Linux `sudo apt install r-base` verwenden.

### Schritt 2: putior installieren

Von CRAN (stabil) oder GitHub (Entwicklung) installieren.

```r
# CRAN (empfohlen)
install.packages("putior")

# GitHub-Entwicklungsversion (wenn neueste Funktionen benoetigt)
remotes::install_github("pjt222/putior")
```

**Erwartet:** Paket wird fehlerfrei installiert. `library(putior)` laedt ohne Meldungen.

**Bei Fehler:** Wenn die CRAN-Installation mit "not available for this version of R" fehlschlaegt, die GitHub-Version verwenden. Wenn GitHub fehlschlaegt, pruefen ob `remotes` installiert ist: `install.packages("remotes")`.

### Schritt 3: Optionale Abhaengigkeiten installieren

Optionale Pakete je nach benoetigter Funktionalitaet installieren.

```r
# MCP-Server-Integration (fuer KI-Assistenten-Zugriff)
remotes::install_github("posit-dev/mcptools")
install.packages("ellmer")

# Interaktive Sandbox
install.packages("shiny")
install.packages("shinyAce")

# Strukturierte Protokollierung
install.packages("logger")

# ACP-Server (Agent-zu-Agent-Kommunikation)
install.packages("plumber2")
```

**Erwartet:** Jedes Paket wird fehlerfrei installiert.

**Bei Fehler:** Fuer `mcptools` sicherstellen dass `remotes` zuerst installiert ist. Bei Systemabhaengigkeitsfehlern unter Linux die benoetigten Bibliotheken installieren (z.B. `sudo apt install libcurl4-openssl-dev` fuer die httr2-Abhaengigkeit).

### Schritt 4: Installation verifizieren

Die grundlegende Pipeline ausfuehren um zu bestaetigen dass alles funktioniert.

```r
library(putior)

# Paketversion pruefen
packageVersion("putior")

# Verfuegbarkeit der Kernfunktionen ueberpruefen
stopifnot(
  is.function(put),
  is.function(put_auto),
  is.function(put_diagram),
  is.function(put_generate),
  is.function(put_merge),
  is.function(put_theme)
)

# Grundlegende Pipeline mit einer temporaeren Datei testen
tmp <- tempfile(fileext = ".R")
writeLines("# put id:'test', label:'Hello putior'", tmp)
cat(put_diagram(put(tmp)))
```

**Erwartet:** Mermaid-Flussdiagramm-Code wird auf der Konsole ausgegeben der `test` und `Hello putior` enthaelt.

**Bei Fehler:** Wenn `put` nicht gefunden wird, wurde das Paket nicht korrekt installiert. Mit `install.packages("putior", dependencies = TRUE)` neu installieren. Wenn das Diagramm leer ist, ueberpruefen ob die temporaere Datei erstellt wurde und die Annotationssyntax einfache Anfuehrungszeichen innerhalb doppelter verwendet.

## Validierung

- [ ] `library(putior)` laedt ohne Fehler
- [ ] `packageVersion("putior")` gibt eine gueltige Version zurueck
- [ ] `put()` mit einer Datei die eine gueltige PUT-Annotation enthaelt gibt einen Data Frame mit einer Zeile zurueck
- [ ] `put_diagram()` erzeugt Mermaid-Code der mit `flowchart` beginnt
- [ ] Alle angeforderten optionalen Abhaengigkeiten laden ohne Fehler

## Haeufige Stolperfallen

- **Falsche Anfuehrungszeichen-Schachtelung**: PUT-Annotationen verwenden einfache Anfuehrungszeichen innerhalb der Annotation: `id:'name'`, nicht `id:"name"` (was in manchen Kontexten mit dem Kommentarzeichenketten-Begrenzer kollidiert).
- **Fehlendes Pandoc fuer Vignetten**: Wenn das lokale Erstellen der putior-Vignetten geplant ist, sicherstellen dass `RSTUDIO_PANDOC` in `.Renviron` gesetzt ist.
- **renv-Isolation**: Wenn das Projekt renv verwendet, muss putior innerhalb der renv-Bibliothek installiert werden. `renv::install("putior")` statt `install.packages("putior")` ausfuehren.
- **GitHub-Ratenlimits**: Installation von `mcptools` von GitHub kann ohne `GITHUB_PAT` fehlschlagen. Einen Token via `usethis::create_github_token()` einrichten.

## Verwandte Skills

- `analyze-codebase-workflow` — naechster Schritt nach der Installation um eine Codebasis zu untersuchen
- `configure-putior-mcp` — den MCP-Server einrichten nach Installation der optionalen Abhaengigkeiten
- `manage-renv-dependencies` — putior innerhalb einer renv-Umgebung verwalten
- `configure-mcp-server` — allgemeine MCP-Server-Konfiguration
