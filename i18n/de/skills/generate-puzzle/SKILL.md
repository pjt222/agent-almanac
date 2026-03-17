---
name: generate-puzzle
description: >
  Puzzles ueber generate_puzzle() oder geom_puzzle_*() mit
  Parametervalidierung gegen inst/config.yml generieren. Unterstuetzt
  rechteckige, hexagonale, konzentrische, Voronoi- und SNIC-Puzzletypen
  mit konfigurierbaren Raster-, Groessen-, Seed-, Offset- und
  Layout-Parametern. Verwenden beim Erstellen von Puzzle-SVG-Dateien
  fuer einen bestimmten Typ und eine bestimmte Konfiguration, beim Testen
  der Generierung mit verschiedenen Parametern, beim Generieren von
  Beispielausgaben fuer Dokumentation oder Demos oder beim Erstellen
  von ggplot2-Puzzle-Visualisierungen.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: jigsawr
  complexity: basic
  language: R
  tags: jigsawr, puzzle, svg, generation, ggplot2
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# Puzzle generieren

Puzzles mit der einheitlichen API des jigsawR-Pakets generieren.

## Wann verwenden

- Erstellen von Puzzle-SVG-Dateien fuer einen bestimmten Typ und eine bestimmte Konfiguration
- Testen der Puzzle-Generierung mit verschiedenen Parametern
- Generieren von Beispielausgaben fuer Dokumentation oder Demos
- Erstellen von ggplot2-Puzzle-Visualisierungen mit geom_puzzle_*()

## Eingaben

- **Erforderlich**: Puzzletyp (`"rectangular"`, `"hexagonal"`, `"concentric"`, `"voronoi"`, `"random"`, `"snic"`)
- **Erforderlich**: Rasterabmessungen (typabhaengig: `c(cols, rows)` oder `c(rings)`)
- **Optional**: Groesse in mm (Standard variiert je nach Typ)
- **Optional**: Seed fuer Reproduzierbarkeit (Standard: 42)
- **Optional**: Offset (0 = verzahnt, >0 = getrennte Teile)
- **Optional**: Layout (`"grid"` oder `"repel"` fuer rectangular)
- **Optional**: Fusionsgruppen (PILES-Notationsstring)

## Vorgehensweise

### Schritt 1: Konfigurationsbeschraenkungen lesen

```bash
R_EXE="/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe"
"$R_EXE" -e "cat(yaml::yaml.load_file('inst/config.yml')[['{TYPE}']]$grid$max)"
```

Oder `inst/config.yml` direkt lesen, um gueltige Bereiche fuer den gewaehlten Typ zu pruefen.

**Erwartet:** Die Min/Max-Werte fuer grid, size, tabsize und andere Parameter sind fuer den gewaehlten Puzzletyp bekannt.

**Bei Fehler:** Falls `config.yml` fehlt oder der Typ-Schluessel nicht existiert, pruefen Sie, ob Sie sich im jigsawR-Projektstammverzeichnis befinden und das Paket mindestens einmal gebaut wurde.

### Schritt 2: Typ und Parameter bestimmen

Die Benutzeranfrage auf gueltige `generate_puzzle()`-Argumente abbilden:

| Typ | grid | size | Zusaetzliche Parameter |
|------|------|------|-------------|
| rectangular | `c(cols, rows)` | `c(width, height)` mm | `offset`, `layout`, `tabsize` |
| hexagonal | `c(rings)` | `c(diameter)` mm | `do_warp`, `do_trunc`, `tabsize` |
| concentric | `c(rings)` | `c(diameter)` mm | `center_shape`, `tabsize` |
| voronoi | `c(cols, rows)` | `c(width, height)` mm | `n_interior`, `tabsize` |
| random | `c(cols, rows)` | `c(width, height)` mm | `n_interior`, `tabsize` |
| snic | `c(cols, rows)` | `c(width, height)` mm | `n_interior`, `compactness`, `tabsize` |

**Erwartet:** Benutzeranfrage auf gueltige `generate_puzzle()`-Argumente mit korrektem `type`, `grid`-Abmessungen und `size`-Werten innerhalb der Bereiche aus config.yml abgebildet.

**Bei Fehler:** Falls unsicher, welches Parameterformat verwendet werden soll, die obige Tabelle konsultieren. Rectangular- und Voronoi-Typen verwenden `c(cols, rows)` fuer grid; hexagonal und concentric verwenden `c(rings)`.

### Schritt 3: R-Skript erstellen

Eine Skriptdatei schreiben (bevorzugt gegenueber `-e` fuer komplexe Befehle):

```r
library(jigsawR)

result <- generate_puzzle(
  type = "rectangular",
  seed = 42,
  grid = c(3, 4),
  size = c(400, 300),
  offset = 0,
  layout = "grid"
)

cat("Pieces:", length(result$pieces), "\n")
cat("SVG length:", nchar(result$svg_content), "\n")
cat("Files:", paste(result$files, collapse = ", "), "\n")
```

In einer temporaeren Skriptdatei speichern.

**Erwartet:** Eine R-Skriptdatei an einem temporaeren Speicherort mit `library(jigsawR)`, einem `generate_puzzle()`-Aufruf mit allen Parametern und Diagnoseausgabezeilen.

**Bei Fehler:** Falls das Skript Syntaxfehler hat, sicherstellen, dass alle String-Argumente in Anfuehrungszeichen stehen und numerische Vektoren `c()` verwenden. Komplexes Shell-Escaping vermeiden, indem immer Skriptdateien verwendet werden.

### Schritt 4: Ueber WSL R ausfuehren

```bash
R_EXE="/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe"
"$R_EXE" /path/to/script.R
```

**Erwartet:** Skript wird ohne Fehler abgeschlossen. SVG-Datei(en) in `output/` geschrieben.

**Bei Fehler:** Pruefen, ob renv wiederhergestellt ist (`renv::restore()`). Sicherstellen, dass das Paket geladen ist (`devtools::load_all()`). NICHT das `--vanilla`-Flag verwenden (renv benoetigt .Rprofile).

### Schritt 5: Ausgabe verifizieren

- SVG-Datei existiert im `output/`-Verzeichnis
- SVG-Inhalt beginnt mit `<?xml` oder `<svg`
- Teileanzahl stimmt mit erwartetem Wert ueberein: cols * rows (rectangular), Ringformel (hex/concentric)
- Fuer den ggplot2-Ansatz verifizieren, dass das Plot-Objekt fehlerfrei rendert

**Erwartet:** SVG-Datei existiert in `output/`, Inhalt beginnt mit `<?xml` oder `<svg`, und Teileanzahl stimmt mit der Rasterspezifikation ueberein (cols * rows fuer rectangular, Ringformel fuer hex/concentric).

**Bei Fehler:** Falls SVG-Datei fehlt, pruefen ob das `output/`-Verzeichnis existiert. Falls Teileanzahl falsch ist, Rasterabmessungen gegen die erwartete Formel des Puzzletyps verifizieren. Fuer ggplot2-Ausgabe pruefen, ob der Plot fehlerfrei rendert, indem er in `tryCatch()` eingeschlossen wird.

### Schritt 6: Ausgabe speichern

Generierte Dateien werden standardmaessig in `output/` gespeichert. Das `result`-Objekt enthaelt:
- `$svg_content` -- roher SVG-String
- `$pieces` -- Liste der Teiledaten
- `$canvas_size` -- Abmessungen
- `$files` -- Pfade zu geschriebenen Dateien

**Erwartet:** Das `result`-Objekt enthaelt die Felder `$svg_content`, `$pieces`, `$canvas_size` und `$files`. Die in `$files` aufgelisteten Dateien existieren auf der Festplatte.

**Bei Fehler:** Falls `$files` leer ist, wurde das Puzzle moeglicherweise nur im Speicher generiert. Explizit mit `writeLines(result$svg_content, "output/puzzle.svg")` speichern.

## Validierung

- [ ] Skript wird ohne Fehler ausgefuehrt
- [ ] SVG-Datei ist wohlgeformtes XML
- [ ] Teileanzahl stimmt mit Rasterspezifikation ueberein
- [ ] Gleicher Seed erzeugt identische Ausgabe (Reproduzierbarkeit)
- [ ] Parameter liegen innerhalb der config.yml-Beschraenkungen

## Haeufige Fehler

- **Verwendung des `--vanilla`-Flags**: Unterbricht die renv-Aktivierung. Niemals verwenden.
- **Komplexe `-e`-Befehle**: Stattdessen Skriptdateien verwenden; Shell-Escaping verursacht Exit-Code 5.
- **Grid- vs. Size-Verwechslung**: Grid ist die Teileanzahl, Size sind physische Abmessungen in mm.
- **Offset-Semantik**: 0 = zusammengesetztes Puzzle, positiv = auseinandergezogene/getrennte Teile.
- **SNIC ohne Paket**: Der snic-Typ erfordert, dass das `snic`-Paket installiert ist.

## Verwandte Skills

- `add-puzzle-type` -- Einen neuen Puzzletyp End-to-End aufsetzen
- `validate-piles-notation` -- Fusionsgruppen-Strings vor der Uebergabe an generate_puzzle() validieren
- `run-puzzle-tests` -- Die Testsuite nach Generierungsaenderungen ausfuehren
- `write-testthat-tests` -- Tests fuer neue Generierungsszenarien hinzufuegen
