---
name: render-puzzle-docs
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude
translation_date: "2026-03-17"
description: >
  Die jigsawR Quarto-Dokumentationsseite fuer GitHub Pages rendern.
  Unterstuetzt frisches Rendern (Cache loeschen), gecachtes Rendern (schneller)
  und Einzelseiten-Rendern. Verwendet das mitgelieferte Render-Skript oder
  direkten quarto.exe-Aufruf aus WSL. Anwenden beim Erstellen der vollstaendigen
  Seite nach Inhaltsaenderungen, beim Rendern einer einzelnen Seite waehrend
  iterativer Bearbeitung, beim Vorbereiten der Dokumentation fuer ein Release
  oder PR, oder beim Debuggen von Renderfehlern in Quarto-.qmd-Dateien.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: jigsawr
  complexity: basic
  language: R
  tags: jigsawr, quarto, documentation, github-pages, rendering
---

# Puzzle-Dokumentation rendern

Die jigsawR Quarto-Dokumentationsseite rendern.

## Wann verwenden

- Vollstaendige Dokumentationsseite nach Inhaltsaenderungen erstellen
- Einzelne Seite waehrend iterativer Bearbeitung rendern
- Dokumentation fuer ein Release oder PR vorbereiten
- Renderfehler in Quarto-.qmd-Dateien debuggen

## Eingaben

- **Erforderlich**: Render-Modus (`fresh`, `cached` oder `single`)
- **Optional**: Spezifischer .qmd-Dateipfad (fuer Einzelseiten-Modus)
- **Optional**: Ob das Ergebnis im Browser geoeffnet werden soll

## Vorgehensweise

### Schritt 1: Render-Modus waehlen

| Modus | Befehl | Dauer | Verwendung |
|-------|--------|-------|------------|
| Frisch | `bash inst/scripts/render_quarto.sh` | ~5-7 Min | Inhalt geaendert, Cache veraltet |
| Gecacht | `bash inst/scripts/render_quarto.sh --cached` | ~1-2 Min | Kleine Aenderungen, Cache gueltig |
| Einzeln | Direkter quarto.exe-Aufruf | ~30s | Iteration an einer Seite |

**Erwartet:** Render-Modus basierend auf der aktuellen Situation ausgewaehlt: frisch fuer Inhaltsaenderungen oder veralteten Cache, gecacht fuer kleine Aenderungen, einzeln fuer Iteration an einer Seite.

**Bei Fehler:** Im Zweifelsfall ob der Cache veraltet ist, standardmaessig frisch rendern. Es dauert laenger, garantiert aber korrekte Ausgabe.

### Schritt 2: Rendern ausfuehren

**Frisches Rendern** (loescht `_freeze` und `_site`, fuehrt allen R-Code erneut aus):

```bash
cd /mnt/d/dev/p/jigsawR && bash inst/scripts/render_quarto.sh
```

**Gecachtes Rendern** (verwendet vorhandene `_freeze`-Dateien):

```bash
cd /mnt/d/dev/p/jigsawR && bash inst/scripts/render_quarto.sh --cached
```

**Einzelne Seite** (eine .qmd-Datei direkt rendern):

```bash
QUARTO_EXE="/mnt/c/Program Files/RStudio/resources/app/bin/quarto/bin/quarto.exe"
"$QUARTO_EXE" render quarto/getting-started.qmd
```

**Erwartet:** Rendern wird ohne Fehler abgeschlossen. Ausgabe in `quarto/_site/`.

**Bei Fehler:**
- Auf R-Code-Fehler in .qmd-Chunks pruefen (nach `#| label:`-Markern suchen)
- Sicherstellen dass pandoc ueber die Umgebungsvariable `RSTUDIO_PANDOC` verfuegbar ist
- Cache loeschen versuchen: `rm -rf quarto/_freeze quarto/_site`
- Pruefen ob alle in .qmd-Dateien verwendeten R-Pakete installiert sind

### Schritt 3: Ausgabe ueberpruefen

```bash
ls -la /mnt/d/dev/p/jigsawR/quarto/_site/index.html
```

Die Seitenstruktur bestaetigen:
- `quarto/_site/index.html` existiert
- Navigationslinks loesen korrekt auf
- Bilder und SVG-Dateien werden korrekt dargestellt

**Erwartet:** `index.html` existiert und ist nicht leer. Navigationslinks loesen auf, und Bilder/SVGs werden im Browser korrekt dargestellt.

**Bei Fehler:** Wenn `index.html` fehlt, ist das Rendern wahrscheinlich stillschweigend fehlgeschlagen. Mit ausfuehrlicher Ausgabe erneut ausfuehren und auf R-Code-Fehler in `.qmd`-Chunks pruefen. Wenn nur einige Seiten fehlen, ueberpruefen ob diese `.qmd`-Dateien in `_quarto.yml` aufgefuehrt sind.

### Schritt 4: Vorschau (Optional)

Im Windows-Browser oeffnen:

```bash
cmd.exe /c start "" "D:\\dev\\p\\jigsawR\\quarto\\_site\\index.html"
```

**Erwartet:** Die Dokumentationsseite oeffnet sich im Windows-Standardbrowser zur visuellen Pruefung.

**Bei Fehler:** Wenn der `cmd.exe /c start`-Befehl aus WSL fehlschlaegt, stattdessen `explorer.exe "D:\\dev\\p\\jigsawR\\quarto\\_site\\index.html"` versuchen. Alternativ die Datei manuell im Browser aufrufen.

## Validierung

- [ ] `quarto/_site/index.html` existiert und ist nicht leer
- [ ] Keine Renderfehler in der Konsolenausgabe
- [ ] Alle R-Code-Chunks wurden erfolgreich ausgefuehrt (auf Fehlermeldungen pruefen)
- [ ] Navigation zwischen Seiten funktioniert
- [ ] Alle .qmd-Dateien haben `#| label:` bei Code-Chunks fuer saubere Ausgabe

## Haeufige Stolperfallen

- **Veralteter Freeze-Cache**: Wenn sich R-Code geaendert hat, frisches Rendern zum Neugenerieren der `_freeze`-Dateien verwenden
- **Fehlende R-Pakete**: Quarto-.qmd-Dateien koennten Pakete nutzen die nicht in renv enthalten sind; diese zuerst installieren
- **Pandoc nicht gefunden**: Sicherstellen dass `RSTUDIO_PANDOC` in `.Renviron` gesetzt ist
- **Lange Renderzeiten**: Frisches Rendern dauert 5-7 Minuten (14 Seiten mit R-Ausfuehrung); gecachten Modus waehrend der Iteration verwenden
- **Code-Chunk-Label**: Alle R-Code-Chunks sollten `#| label:` fuer sauberes Rendering haben

## Verwandte Skills

- `generate-puzzle` — Puzzle-Ausgabe generieren auf die in der Dokumentation verwiesen wird
- `run-puzzle-tests` — Sicherstellen dass Codebeispiele in der Doku korrekt sind
- `create-quarto-report` — Allgemeine Quarto-Dokumenterstellung
