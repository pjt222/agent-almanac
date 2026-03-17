---
name: generate-puzzle
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude
translation_date: "2026-03-17"
description: >
  Puzzles ueber generate_puzzle() oder geom_puzzle_*() mit Parametervalidierung
  gegen inst/config.yml generieren. Unterstuetzt rechteckige, hexagonale,
  konzentrische, Voronoi- und SNIC-Puzzletypen mit konfigurierbaren Raster-,
  Groessen-, Seed-, Versatz- und Layoutparametern. Anwenden beim Erstellen von
  Puzzle-SVG-Dateien fuer einen bestimmten Typ und eine Konfiguration, beim
  Testen der Generierung mit verschiedenen Parametern, beim Erzeugen von
  Beispielausgaben fuer Dokumentation oder Demos, oder beim Erstellen von
  ggplot2-Puzzle-Visualisierungen.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: jigsawr
  complexity: basic
  language: R
  tags: jigsawr, puzzle, svg, generation, ggplot2
---

# Puzzle generieren

Puzzles mit der einheitlichen API des jigsawR-Pakets generieren.

## Wann verwenden

- Puzzle-SVG-Dateien fuer einen bestimmten Typ und eine Konfiguration erstellen
- Puzzlegenerierung mit verschiedenen Parametern testen
- Beispielausgaben fuer Dokumentation oder Demos erzeugen
- ggplot2-Puzzle-Visualisierungen mit geom_puzzle_*() erstellen

## Eingaben

- **Erforderlich**: Puzzletyp (`"rectangular"`, `"hexagonal"`, `"concentric"`, `"voronoi"`, `"random"`, `"snic"`)
- **Erforderlich**: Rasterdimensionen (typabhaengig: `c(cols, rows)` oder `c(rings)`)
- **Optional**: Groesse in mm (Standard variiert nach Typ)
- **Optional**: Seed fuer Reproduzierbarkeit (Standard: 42)
- **Optional**: Versatz (0 = ineinandergreifend, >0 = getrennte Teile)
- **Optional**: Layout (`"grid"` oder `"repel"` fuer rectangular)
- **Optional**: Fusionsgruppen (PILES-Notationszeichenkette)

## Vorgehensweise

### Schritt 1: Konfigurationseinschraenkungen lesen

```bash
R_EXE="/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe"
"$R_EXE" -e "cat(yaml::yaml.load_file('inst/config.yml')[['{TYPE}']]$grid$max)"
```

Oder `inst/config.yml` direkt lesen um gueltige Bereiche fuer den gewaehlten Typ zu pruefen.

**Erwartet:** Die Min/Max-Werte fuer Raster, Groesse, Zackengroesse und andere Parameter sind fuer den gewaehlten Puzzletyp bekannt.

**Bei Fehler:** Wenn `config.yml` fehlt oder der Typschluessel nicht existiert, pruefen ob man sich im jigsawR-Projektstamm befindet und das Paket mindestens einmal gebaut wurde.

### Schritt 2: Typ und Parameter bestimmen

Die Benutzeranfrage auf gueltige `generate_puzzle()`-Argumente abbilden:

| Typ | grid | size | Zusaetzliche Parameter |
|-----|------|------|----------------------|
| rectangular | `c(cols, rows)` | `c(width, height)` mm | `offset`, `layout`, `tabsize` |
| hexagonal | `c(rings)` | `c(diameter)` mm | `do_warp`, `do_trunc`, `tabsize` |
| concentric | `c(rings)` | `c(diameter)` mm | `center_shape`, `tabsize` |
| voronoi | `c(cols, rows)` | `c(width, height)` mm | `n_interior`, `tabsize` |
| random | `c(cols, rows)` | `c(width, height)` mm | `n_interior`, `tabsize` |
| snic | `c(cols, rows)` | `c(width, height)` mm | `n_interior`, `compactness`, `tabsize` |

**Erwartet:** Benutzeranfrage auf gueltige `generate_puzzle()`-Argumente abgebildet mit korrektem `type`, `grid`-Dimensionen und `size`-Werten innerhalb der Bereiche aus config.yml.

**Bei Fehler:** Wenn unklar ist welches Parameterformat zu verwenden ist, die obige Tabelle konsultieren. Typen rectangular und voronoi verwenden `c(cols, rows)` fuer Raster; hexagonal und concentric verwenden `c(rings)`.

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

cat("Teile:", length(result$pieces), "\n")
cat("SVG-Laenge:", nchar(result$svg_content), "\n")
cat("Dateien:", paste(result$files, collapse = ", "), "\n")
```

In einer temporaeren Skriptdatei speichern.

**Erwartet:** Eine R-Skriptdatei an einem temporaeren Speicherort gespeichert die `library(jigsawR)`, einen `generate_puzzle()`-Aufruf mit allen Parametern und diagnostische Ausgabezeilen enthaelt.

**Bei Fehler:** Wenn das Skript Syntaxfehler hat, pruefen ob alle Zeichenkettenargumente in Anfuehrungszeichen stehen und numerische Vektoren `c()` verwenden. Komplexes Shell-Escaping vermeiden indem immer Skriptdateien verwendet werden.

### Schritt 4: Ueber WSL-R ausfuehren

```bash
R_EXE="/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe"
"$R_EXE" /pfad/zum/skript.R
```

**Erwartet:** Skript wird fehlerfrei abgeschlossen. SVG-Datei(en) in `output/` geschrieben.

**Bei Fehler:** Pruefen ob renv wiederhergestellt ist (`renv::restore()`). Sicherstellen dass das Paket geladen ist (`devtools::load_all()`). NICHT das `--vanilla`-Flag verwenden (renv braucht .Rprofile).

### Schritt 5: Ausgabe ueberpruefen

- SVG-Datei existiert im `output/`-Verzeichnis
- SVG-Inhalt beginnt mit `<?xml` oder `<svg`
- Teileanzahl entspricht dem Erwarteten: cols * rows (rectangular), Ringformel (hex/concentric)
- Fuer den ggplot2-Ansatz ueberpruefen ob das Plot-Objekt fehlerfrei gerendert wird

**Erwartet:** SVG-Datei existiert in `output/`, Inhalt beginnt mit `<?xml` oder `<svg`, und die Teileanzahl entspricht der Rasterspezifikation (cols * rows fuer rectangular, Ringformel fuer hex/concentric).

**Bei Fehler:** Wenn die SVG-Datei fehlt, pruefen ob das `output/`-Verzeichnis existiert. Wenn die Teileanzahl falsch ist, die Rasterdimensionen gegen die erwartete Formel des Puzzletyps pruefen. Fuer ggplot2-Ausgabe pruefen ob der Plot fehlerfrei rendert indem er in `tryCatch()` gewrappt wird.

### Schritt 6: Ausgabe speichern

Generierte Dateien werden standardmaessig in `output/` gespeichert. Das `result`-Objekt enthaelt:
- `$svg_content` — rohe SVG-Zeichenkette
- `$pieces` — Liste der Teiledaten
- `$canvas_size` — Dimensionen
- `$files` — Pfade zu geschriebenen Dateien

**Erwartet:** Das `result`-Objekt enthaelt die Felder `$svg_content`, `$pieces`, `$canvas_size` und `$files`. In `$files` aufgefuehrte Dateien existieren auf der Festplatte.

**Bei Fehler:** Wenn `$files` leer ist, wurde das Puzzle moeglicherweise nur im Speicher generiert. Explizit speichern mit `writeLines(result$svg_content, "output/puzzle.svg")`.

## Validierung

- [ ] Skript wird fehlerfrei ausgefuehrt
- [ ] SVG-Datei ist wohlgeformtes XML
- [ ] Teileanzahl entspricht der Rasterspezifikation
- [ ] Gleicher Seed erzeugt identische Ausgabe (Reproduzierbarkeit)
- [ ] Parameter liegen innerhalb der config.yml-Einschraenkungen

## Haeufige Stolperfallen

- **`--vanilla`-Flag verwenden**: Bricht die renv-Aktivierung ab. Niemals verwenden.
- **Komplexe `-e`-Befehle**: Skriptdateien verwenden; Shell-Escaping verursacht Exit-Code 5.
- **Raster- vs. Groessen-Verwechslung**: Raster ist die Teileanzahl, Groesse sind die physischen Dimensionen in mm.
- **Versatz-Semantik**: 0 = zusammengesetztes Puzzle, positiv = explodierte/getrennte Teile.
- **SNIC ohne Paket**: Der Typ snic erfordert die Installation des `snic`-Pakets.

## Verwandte Skills

- `add-puzzle-type` — einen neuen Puzzletyp durchgaengig einrichten
- `validate-piles-notation` — Fusionsgruppen-Zeichenketten validieren bevor sie an generate_puzzle() uebergeben werden
- `run-puzzle-tests` — die Testsuite nach Generierungsaenderungen ausfuehren
- `write-testthat-tests` — Tests fuer neue Generierungsszenarien hinzufuegen
