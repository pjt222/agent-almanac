---
name: render-puzzle-docs
description: >
  Die jigsawR Quarto-Dokumentationsseite fuer GitHub Pages rendern.
  Unterstuetzt frisches Rendern (Cache loeschen), gecachtes Rendern
  (schneller) und Einzelseiten-Rendern. Verwendet das mitgelieferte
  Render-Skript oder direkten quarto.exe-Aufruf aus WSL.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: jigsawr
  complexity: basic
  language: R
  tags: jigsawr, quarto, documentation, github-pages, rendering
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# Puzzle-Dokumentation rendern

Die jigsawR Quarto-Dokumentationsseite rendern.

## Wann verwenden

- Vollstaendige Dokumentationsseite nach Inhaltsaenderungen erstellen
- Einzelne Seite waehrend iterativer Bearbeitung rendern
- Dokumentation fuer ein Release oder einen PR vorbereiten
- Render-Fehler in Quarto-.qmd-Dateien debuggen

## Eingaben

- **Erforderlich**: Render-Modus (`fresh`, `cached` oder `single`)
- **Optional**: Spezifischer .qmd-Dateipfad (fuer Einzelseiten-Modus)
- **Optional**: Ob das Ergebnis im Browser geoeffnet werden soll

## Vorgehensweise

### Schritt 1: Render-Modus waehlen

| Modus | Befehl | Dauer | Verwenden wenn |
|------|---------|----------|----------|
| Frisch | `bash inst/scripts/render_quarto.sh` | ~5-7 Min | Inhalt geaendert, Cache veraltet |
| Gecacht | `bash inst/scripts/render_quarto.sh --cached` | ~1-2 Min | Kleine Aenderungen, Cache gueltig |
| Einzeln | Direkter quarto.exe-Aufruf | ~30s | Iteration an einer Seite |

**Erwartet:** Render-Modus basierend auf der aktuellen Situation ausgewaehlt: frisch fuer Inhaltsaenderungen oder veralteten Cache, gecacht fuer kleine Aenderungen, einzeln fuer Iteration an einer Seite.

**Bei Fehler:** Falls unsicher, ob der Cache veraltet ist, standardmaessig frisch rendern. Es dauert laenger, garantiert aber korrekte Ausgabe.

### Schritt 2: Render ausfuehren

**Frisches Rendern** (loescht `_freeze` und `_site`, fuehrt allen R-Code erneut aus):

```bash
cd /mnt/d/dev/p/jigsawR && bash inst/scripts/render_quarto.sh
```

**Gecachtes Rendern** (verwendet vorhandene `_freeze`-Dateien):

```bash
cd /mnt/d/dev/p/jigsawR && bash inst/scripts/render_quarto.sh --cached
```

**Einzelseite** (eine .qmd-Datei direkt rendern):

```bash
QUARTO_EXE="/mnt/c/Program Files/RStudio/resources/app/bin/quarto/bin/quarto.exe"
"$QUARTO_EXE" render quarto/getting-started.qmd
```

**Erwartet:** Rendern wird ohne Fehler abgeschlossen. Ausgabe in `quarto/_site/`.

**Bei Fehler:**
- Auf R-Code-Fehler in .qmd-Chunks pruefen (nach `#| label:`-Markern suchen)
- Sicherstellen, dass pandoc ueber die `RSTUDIO_PANDOC`-Umgebungsvariable verfuegbar ist
- Cache loeschen versuchen: `rm -rf quarto/_freeze quarto/_site`
- Pruefen, dass alle in .qmd-Dateien verwendeten R-Pakete installiert sind

### Schritt 3: Ausgabe verifizieren

```bash
ls -la /mnt/d/dev/p/jigsawR/quarto/_site/index.html
```

Seitenstruktur bestaetigen:
- `quarto/_site/index.html` existiert
- Navigationslinks loesen korrekt auf
- Bilder und SVG-Dateien rendern korrekt

**Erwartet:** `index.html` existiert und ist nicht leer. Navigationslinks loesen auf, und Bilder/SVGs rendern korrekt im Browser.

**Bei Fehler:** Falls `index.html` fehlt, ist das Rendern wahrscheinlich still fehlgeschlagen. Mit ausfuehrlicher Ausgabe erneut ausfuehren und auf R-Code-Fehler in `.qmd`-Chunks pruefen. Falls nur einige Seiten fehlen, verifizieren, ob diese `.qmd`-Dateien in `_quarto.yml` aufgefuehrt sind.

### Schritt 4: Vorschau (optional)

Im Windows-Browser oeffnen:

```bash
cmd.exe /c start "" "D:\\dev\\p\\jigsawR\\quarto\\_site\\index.html"
```

**Erwartet:** Die Dokumentationsseite oeffnet sich im Windows-Standardbrowser zur visuellen Inspektion.

**Bei Fehler:** Falls der `cmd.exe /c start`-Befehl aus WSL fehlschlaegt, stattdessen `explorer.exe "D:\\dev\\p\\jigsawR\\quarto\\_site\\index.html"` versuchen. Alternativ manuell im Browser zur Datei navigieren.

## Validierung

- [ ] `quarto/_site/index.html` existiert und ist nicht leer
- [ ] Keine Render-Fehler in der Konsolenausgabe
- [ ] Alle R-Code-Chunks wurden erfolgreich ausgefuehrt (auf Fehlermeldungen pruefen)
- [ ] Navigation zwischen Seiten funktioniert
- [ ] Alle .qmd-Dateien haben `#| label:` fuer Code-Chunks fuer saubere Ausgabe

## Haeufige Fehler

- **Veralteter Freeze-Cache**: Falls R-Code geaendert wurde, frisch rendern, um `_freeze`-Dateien neu zu generieren
- **Fehlende R-Pakete**: Quarto-.qmd-Dateien koennen Pakete verwenden, die nicht in renv sind; diese zuerst installieren
- **Pandoc nicht gefunden**: Sicherstellen, dass `RSTUDIO_PANDOC` in `.Renviron` gesetzt ist
- **Lange Renderzeiten**: Frisches Rendern dauert 5-7 Minuten (14 Seiten mit R-Ausfuehrung); waehrend der Iteration den gecachten Modus verwenden
- **Code-Chunk-Labels**: Alle R-Code-Chunks sollten `#| label:` fuer sauberes Rendern haben

## Verwandte Skills

- `generate-puzzle` -- Puzzle-Ausgabe generieren, auf die in der Dokumentation verwiesen wird
- `run-puzzle-tests` -- Sicherstellen, dass Codebeispiele in der Dokumentation korrekt sind
- `create-quarto-report` -- Allgemeine Quarto-Dokumenterstellung
