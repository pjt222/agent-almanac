---
name: add-puzzle-type
description: >
  Einen neuen Puzzletyp ueber alle 10+ Pipeline-Integrationspunkte in
  jigsawR aufsetzen. Erstellt das Kern-Puzzlemodul, verdrahtet es in die
  einheitliche Pipeline (Generierung, Positionierung, Rendering, Adjazenz),
  fuegt ggpuzzle geom/stat-Layer hinzu, aktualisiert DESCRIPTION und
  config.yml, erweitert die Shiny-App und erstellt eine umfassende Testsuite.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: jigsawr
  complexity: advanced
  language: R
  tags: jigsawr, puzzle-type, pipeline, integration, scaffold
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# Puzzletyp hinzufuegen

Einen neuen Puzzletyp ueber alle Pipeline-Integrationspunkte in jigsawR aufsetzen.

## Wann verwenden

- Einen komplett neuen Puzzletyp zum Paket hinzufuegen
- Der etablierten Integrations-Checkliste folgen (CLAUDE.md 10-Punkte-Pipeline)
- Sicherstellen, dass nichts uebersehen wird, wenn ein neuer Typ End-to-End verdrahtet wird

## Eingaben

- **Erforderlich**: Name des neuen Typs (Kleinbuchstaben, z.B. `"triangular"`)
- **Erforderlich**: Geometriebeschreibung (wie Teile geformt/angeordnet sind)
- **Erforderlich**: Ob der Typ externe Pakete benoetigt (zu Suggests hinzufuegen)
- **Optional**: Parameterliste ueber die Standard-Parameter hinaus (grid, size, seed, tabsize, offset)
- **Optional**: Referenzimplementierung oder Algorithmusquelle

## Vorgehensweise

### Schritt 1: Kern-Puzzlemodul erstellen

`R/<type>_puzzle.R` mit der internen Generierungsfunktion erstellen:

```r
#' Generate <type> puzzle pieces (internal)
#' @noRd
generate_<type>_pieces_internal <- function(params, seed) {
  # 1. RNG-Zustand initialisieren
  # 2. Teilegeometrien generieren
  # 3. Kantenpfade erstellen (SVG-Pfaddaten)
  # 4. Adjazenz berechnen
  # 5. Liste zurueckgeben: pieces, edges, adjacency, metadata
}
```

Dem Muster in `R/voronoi_puzzle.R` oder `R/snic_puzzle.R` fuer die Struktur folgen.

**Erwartet:** Funktion gibt eine Liste mit `$pieces`, `$edges`, `$adjacency`, `$metadata` zurueck.

**Bei Fehler:** Die Rueckgabestruktur mit `generate_voronoi_pieces_internal()` vergleichen, um fehlende Listenelemente oder falsche Typen zu identifizieren.

### Schritt 2: In jigsawR_clean.R verdrahten

`R/jigsawR_clean.R` bearbeiten:

1. `"<type>"` zum `valid_types`-Vektor hinzufuegen
2. Typspezifische Parameterextraktion im Params-Abschnitt hinzufuegen
3. Validierungslogik fuer typspezifische Beschraenkungen hinzufuegen
4. Dateinamenpraefixzuordnung hinzufuegen (z.B. `"<type>"` -> `"<type>_"`)

```r
# In valid_types
valid_types <- c("rectangular", "hexagonal", "concentric", "voronoi", "snic", "<type>")
```

**Erwartet:** `generate_puzzle(type = "<type>")` wird ohne "unknown type"-Fehler akzeptiert.

**Bei Fehler:** Sicherstellen, dass der Typ-String exakt wie geschrieben zu `valid_types` hinzugefuegt wurde und dass die Parameterextraktion alle erforderlichen typspezifischen Argumente abdeckt.

### Schritt 3: In unified_piece_generation.R verdrahten

`R/unified_piece_generation.R` bearbeiten:

1. Dispatch-Fall in `generate_pieces_internal()` hinzufuegen
2. Fusionsbehandlung hinzufuegen, falls der Typ PILES-Notation unterstuetzt

```r
# Im switch/dispatch
"<type>" = generate_<type>_pieces_internal(params, seed)
```

**Erwartet:** Teile werden generiert, wenn der Typ dispatcht wird.

**Bei Fehler:** Bestaetigen, dass der Dispatch-Fall-String exakt mit dem Typnamen uebereinstimmt und dass `generate_<type>_pieces_internal` definiert und aus dem Puzzlemodul exportiert ist.

### Schritt 4: In piece_positioning.R verdrahten

`R/piece_positioning.R` bearbeiten:

Positionierungs-Dispatch fuer den neuen Typ hinzufuegen. Die meisten Typen verwenden gemeinsame Positionierungslogik, aber einige benoetigen benutzerdefinierte Behandlung.

**Erwartet:** `apply_piece_positioning()` behandelt den neuen Typ ohne Fehler und Teile werden an korrekten Koordinaten platziert.

**Bei Fehler:** Pruefen, ob der neue Typ benutzerdefinierte Positionierungslogik benoetigt oder den gemeinsamen Positionierungspfad wiederverwenden kann. Einen Dispatch-Fall hinzufuegen, falls der Standardpfad nicht gilt.

### Schritt 5: In unified_renderer.R verdrahten

`R/unified_renderer.R` bearbeiten:

1. Rendering-Fall in `render_puzzle_svg()` hinzufuegen
2. Kantenpfadfunktion hinzufuegen: `get_<type>_edge_paths()`
3. Teilenamenfunktion hinzufuegen: `get_<type>_piece_name()`

**Erwartet:** SVG-Ausgabe wird fuer den neuen Typ mit korrekten Teileumrissen und Kantenpfaden generiert.

**Bei Fehler:** Sicherstellen, dass `get_<type>_edge_paths()` gueltige SVG-Pfaddaten zurueckgibt und `get_<type>_piece_name()` eindeutige Bezeichner fuer jedes Teil erzeugt.

### Schritt 6: In adjacency_api.R verdrahten

`R/adjacency_api.R` bearbeiten:

Nachbar-Dispatch hinzufuegen, damit `get_neighbors()` und `get_adjacency()` fuer den neuen Typ funktionieren.

**Erwartet:** `get_neighbors(result, piece_id)` gibt korrekte Nachbarn fuer jedes Teil im Puzzle zurueck.

**Bei Fehler:** Pruefen, ob der Adjazenz-Dispatch die korrekte Datenstruktur zurueckgibt. Mit einem kleinen Raster testen und Nachbarschaftsbeziehungen manuell gegen die Geometrie verifizieren.

### Schritt 7: ggpuzzle Geom-Layer hinzufuegen

`R/geom_puzzle.R` bearbeiten:

`geom_puzzle_<type>()` unter Verwendung der `make_puzzle_layer()`-Factory erstellen:

```r
#' @export
geom_puzzle_<type> <- function(mapping = NULL, data = NULL, ...) {
  make_puzzle_layer(type = "<type>", mapping = mapping, data = data, ...)
}
```

**Erwartet:** `ggplot() + geom_puzzle_<type>(aes(...))` rendert ohne Fehler.

**Bei Fehler:** Sicherstellen, dass `make_puzzle_layer()` den korrekten Typ-String erhaelt und dass die Geom-Funktion im NAMESPACE ueber `@export` exportiert wird.

### Schritt 8: Stat-Dispatch hinzufuegen

`R/stat_puzzle.R` bearbeiten:

1. Typspezifische Standardparameter hinzufuegen
2. Dispatch-Fall in `compute_panel()` hinzufuegen

**Erwartet:** Der Stat-Layer berechnet die Puzzlegeometrie korrekt und erzeugt die erwartete Anzahl von Polygonen.

**Bei Fehler:** Pruefen, ob der `compute_panel()`-Dispatch-Fall einen Data Frame mit den erforderlichen Spalten (`x`, `y`, `group`, `piece_id`) zurueckgibt und ob die Standardparameter fuer den neuen Typ sinnvoll sind.

### Schritt 9: DESCRIPTION aktualisieren

`DESCRIPTION` bearbeiten:

1. Neuen Typ zum Description-Feldtext hinzufuegen
2. Neue Pakete zu `Suggests:` hinzufuegen (falls externe Abhaengigkeit)
3. `Collate:` aktualisieren, um die neue R-Datei einzuschliessen (alphabetische Reihenfolge)

**Erwartet:** `devtools::document()` ist erfolgreich. Kein NOTE ueber nicht aufgelistete Dateien.

**Bei Fehler:** Pruefen, ob die neue R-Datei im `Collate:`-Feld in alphabetischer Reihenfolge aufgefuehrt ist und ob neue Suggests-Pakete korrekt mit Versionsbeschraenkungen geschrieben sind.

### Schritt 10: config.yml aktualisieren

`inst/config.yml` bearbeiten:

Standards und Beschraenkungen fuer den neuen Typ hinzufuegen:

```yaml
<type>:
  grid:
    default: [3, 3]
    min: [2, 2]
    max: [20, 20]
  size:
    default: [300, 300]
    min: [100, 100]
    max: [2000, 2000]
  tabsize:
    default: 20
    min: 5
    max: 50
  # Typspezifische Parameter hier hinzufuegen
```

**Erwartet:** Konfiguration ist gueltiges YAML. Standardwerte erzeugen ein funktionierendes Puzzle bei Verwendung durch `generate_puzzle()`.

**Bei Fehler:** YAML mit `yaml::yaml.load_file("inst/config.yml")` validieren. Sicherstellen, dass Standard-Grid- und Size-Werte ein sinnvolles Puzzle erzeugen (nicht zu klein oder zu gross).

### Schritt 11: Shiny-App erweitern

`inst/shiny-app/app.R` bearbeiten:

1. Den neuen Typ zum UI-Typ-Selektor hinzufuegen
2. Bedingte UI-Panels fuer typspezifische Parameter hinzufuegen
3. Serverseitige Generierungslogik hinzufuegen

**Erwartet:** Shiny-App zeigt den neuen Typ im Dropdown an und generiert Puzzles bei Auswahl.

**Bei Fehler:** Pruefen, ob der Typ zum `choices`-Argument des UI-Selektors hinzugefuegt wurde, ob das bedingte Panel fuer typspezifische Parameter `conditionalPanel(condition = "input.type == '<type>'")` verwendet und ob der serverseitige Handler die korrekten Parameter uebergibt.

### Schritt 12: Testsuite erstellen

`tests/testthat/test-<type>-puzzles.R` erstellen:

```r
test_that("<type> puzzle generates correct piece count", { ... })
test_that("<type> puzzle respects seed reproducibility", { ... })
test_that("<type> adjacency returns valid neighbors", { ... })
test_that("<type> fusion merges pieces correctly", { ... })
test_that("<type> geom layer renders without error", { ... })
test_that("<type> SVG output is well-formed", { ... })
test_that("<type> config constraints are enforced", { ... })
```

Falls der Typ ein externes Paket benoetigt, Tests mit `skip_if_not_installed()` umschliessen.

**Erwartet:** Alle Tests bestehen. Keine Skips, es sei denn, eine externe Abhaengigkeit fehlt.

**Bei Fehler:** Jeden Integrationspunkt einzeln pruefen. Das haeufigste Problem sind fehlende Dispatch-Faelle -- `grep -rn "switch\|valid_types" R/` ausfuehren, um alle Dispatch-Stellen zu finden.

## Validierung

- [ ] `generate_puzzle(type = "<type>")` erzeugt gueltige Ausgabe
- [ ] Alle 10 Integrationspunkte sind korrekt verdrahtet
- [ ] `devtools::test()` besteht mit neuen Tests
- [ ] `devtools::check()` gibt 0 Fehler, 0 Warnungen zurueck
- [ ] Shiny-App rendert den neuen Typ
- [ ] Konfigurationsbeschraenkungen werden durchgesetzt (Min/Max-Validierung)
- [ ] Adjazenz und Fusion funktionieren korrekt
- [ ] ggpuzzle Geom-Layer rendert ohne Fehler
- [ ] `devtools::document()` ist erfolgreich (NAMESPACE aktualisiert)

## Haeufige Fehler

- **Fehlender Dispatch-Fall**: Das Vergessen einer der 10+ Dateien verursacht stilles Versagen oder "unknown type"-Fehler
- **strsplit mit negativen Zahlen**: Beim Erstellen von Adjazenz-Schluesseln mit `paste(a, b, sep = "-")` erzeugen negative Teile-Labels Schluessel wie `"1--1"`. Stattdessen `"|"` als Trennzeichen verwenden und mit `"\\|"` splitten.
- **Verwendung von `cat()` fuer Ausgabe**: Immer `cli`-Paket-Logging-Wrapper verwenden (`log_info`, `log_warn`, etc.)
- **Collate-Reihenfolge**: Das DESCRIPTION Collate-Feld muss alphabetisch oder abhaengigkeitsgeordnet sein
- **Config.yml-Format**: Sicherstellen, dass YAML gueltig ist; mit `yaml::yaml.load_file("inst/config.yml")` testen

## Verwandte Skills

- `generate-puzzle` -- Den neuen Typ nach dem Aufsetzen testen
- `run-puzzle-tests` -- Die vollstaendige Testsuite zur Verifizierung der Integration ausfuehren
- `validate-piles-notation` -- Fusion mit dem neuen Typ testen
- `write-testthat-tests` -- Allgemeine Muster zum Schreiben von Tests
- `write-roxygen-docs` -- Die neue Geom-Funktion dokumentieren
