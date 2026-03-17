---
name: install-putior
description: >
  Das putior-R-Paket für Workflow-Visualisierung installieren und
  konfigurieren. Behandelt CRAN- und GitHub-Installation, optionale
  Abhängigkeiten (mcptools, ellmer, shiny, shinyAce, logger, plumber2)
  und Verifikation der vollständigen Annotation-to-Diagram-Pipeline.
  Verwenden, wenn putior erstmals eingerichtet, eine Maschine für
  Workflow-Visualisierungsaufgaben vorbereitet oder eine Umgebung nach
  einem R-Versionsupgrade oder renv-Wipe wiederhergestellt werden soll.
license: MIT
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
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

Das putior-R-Paket und seine optionalen Abhängigkeiten installieren, sodass die Annotation-to-Diagram-Pipeline einsatzbereit ist.

## Wann verwenden

- putior erstmals in einem Projekt oder einer Umgebung einrichten
- Eine Maschine für Workflow-Visualisierungsaufgaben vorbereiten
- Ein nachgelagertes Skill (analyze-codebase-workflow, generate-workflow-diagram) erfordert putior
- Umgebung nach einem R-Versionsupgrade oder renv-Wipe wiederherstellen

## Eingaben

- **Erforderlich**: Zugang zu einer R-Installation (>= 4.1.0)
- **Optional**: Ob von CRAN (Standard) oder GitHub Dev-Version installiert werden soll
- **Optional**: Welche optionalen Dependency-Gruppen installiert werden sollen: MCP (`mcptools`, `ellmer`), interaktiv (`shiny`, `shinyAce`), Logging (`logger`), ACP (`plumber2`)

## Vorgehensweise

### Schritt 1: R-Installation verifizieren

Sicherstellen, dass R verfügbar ist und die Mindestversionsanforderung erfüllt.

```r
R.Version()$version.string
# Muss >= 4.1.0 sein
```

```bash
# Aus WSL mit Windows-R
"/mnt/c/Program Files/R/R-4.5.2/bin/Rscript.exe" -e "cat(R.version.string)"
```

**Erwartet:** R-Versionsstring wird ausgegeben, >= 4.1.0.

**Bei Fehler:** R installieren oder upgraden. Unter Windows von https://cran.r-project.org/bin/windows/base/ herunterladen. Unter Linux `sudo apt install r-base` verwenden.

### Schritt 2: putior installieren

Von CRAN (stabil) oder GitHub (Dev) installieren.

```r
# CRAN (empfohlen)
install.packages("putior")

# GitHub-Dev-Version (wenn neueste Features benötigt werden)
remotes::install_github("pjt222/putior")
```

**Erwartet:** Paket ohne Fehler installiert. `library(putior)` lädt geräuschlos.

**Bei Fehler:** Wenn CRAN-Installation mit "not available for this version of R" fehlschlägt, GitHub-Version verwenden. Wenn GitHub fehlschlägt, prüfen ob `remotes` installiert ist: `install.packages("remotes")`.

### Schritt 3: Optionale Abhängigkeiten installieren

Optionale Pakete basierend auf benötigter Funktionalität installieren.

```r
# MCP-Server-Integration (für KI-Assistenten-Zugriff)
remotes::install_github("posit-dev/mcptools")
install.packages("ellmer")

# Interaktive Sandbox
install.packages("shiny")
install.packages("shinyAce")

# Strukturiertes Logging
install.packages("logger")

# ACP-Server (Agenten-zu-Agenten-Kommunikation)
install.packages("plumber2")
```

**Erwartet:** Jedes Paket wird ohne Fehler installiert.

**Bei Fehler:** Für `mcptools` sicherstellen, dass `remotes` zuerst installiert ist. Für System-Dependency-Fehler unter Linux die erforderlichen Bibliotheken installieren (z. B. `sudo apt install libcurl4-openssl-dev` für httr2-Abhängigkeit).

### Schritt 4: Installation verifizieren

Die Basis-Pipeline ausführen, um zu bestätigen, dass alles funktioniert.

```r
library(putior)

# Paketversion prüfen
packageVersion("putior")

# Verifizieren, dass Kernfunktionen verfügbar sind
stopifnot(
  is.function(put),
  is.function(put_auto),
  is.function(put_diagram),
  is.function(put_generate),
  is.function(put_merge),
  is.function(put_theme)
)

# Basis-Pipeline mit einer Temp-Datei testen
tmp <- tempfile(fileext = ".R")
writeLines("# put id:'test', label:'Hello putior'", tmp)
cat(put_diagram(put(tmp)))
```

**Erwartet:** Mermaid-Flowchart-Code in der Konsole ausgegeben, der `test` und `Hello putior` enthält.

**Bei Fehler:** Wenn `put` nicht gefunden wird, wurde das Paket nicht korrekt installiert. Mit `install.packages("putior", dependencies = TRUE)` neu installieren. Wenn das Diagramm leer ist, verifizieren, dass die Temp-Datei erstellt wurde und die Annotation-Syntax einfache Anführungszeichen innerhalb doppelter Anführungszeichen verwendet.

## Validierung

- [ ] `library(putior)` lädt ohne Fehler
- [ ] `packageVersion("putior")` gibt eine gültige Version zurück
- [ ] `put()` mit einer Datei, die eine gültige PUT-Annotation enthält, gibt einen DataFrame mit einer Zeile zurück
- [ ] `put_diagram()` erzeugt Mermaid-Code, der mit `flowchart` beginnt
- [ ] Alle angeforderten optionalen Abhängigkeiten laden ohne Fehler

## Haeufige Stolperfallen

- **Falsche Anführungszeichen-Verschachtelung**: PUT-Annotationen verwenden einfache Anführungszeichen innerhalb der Annotation: `id:'name'`, nicht `id:"name"` (was in manchen Kontexten mit dem Kommentar-String-Begrenzer kollidiert).
- **Fehlendes Pandoc für Vignetten**: Wenn putiors Vignetten lokal gebaut werden sollen, sicherstellen, dass `RSTUDIO_PANDOC` in `.Renviron` gesetzt ist.
- **renv-Isolation**: Wenn das Projekt renv verwendet, muss putior in der renv-Bibliothek installiert werden. `renv::install("putior")` statt `install.packages("putior")` verwenden.
- **GitHub-Ratenbegrenzungen**: Das Installieren von `mcptools` von GitHub kann ohne `GITHUB_PAT` fehlschlagen. Einen über `usethis::create_github_token()` setzen.

## Verwandte Skills

- `analyze-codebase-workflow` — nächster Schritt nach der Installation zum Erkunden einer Codebase
- `configure-putior-mcp` — MCP-Server nach Installation optionaler Abhängigkeiten einrichten
- `manage-renv-dependencies` — putior in einer renv-Umgebung verwalten
- `configure-mcp-server` — allgemeine MCP-Server-Konfiguration
