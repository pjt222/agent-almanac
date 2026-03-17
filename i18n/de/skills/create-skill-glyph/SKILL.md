---
name: create-skill-glyph
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude
translation_date: "2026-03-17"
description: >
  R-basierte Piktogramm-Glyphen fuer Skill-Icons in der Visualisierungsschicht
  erstellen. Umfasst Konzeptskizze, ggplot2-Ebenen-Komposition mit der
  Primitives-Bibliothek, Farbstrategie, Registrierung in glyphs.R und
  icon-manifest.json, Rendering ueber build-icons.R und visuelle Verifizierung
  der Neon-Glow-Ausgabe. Anwenden wenn ein neuer Skill hinzugefuegt wurde und
  ein visuelles Icon fuer die Force-Graph-Visualisierung benoetigt, ein
  bestehendes Glyph ersetzt werden muss oder bei Stapelerstellung von Glyphen
  fuer eine neue Skill-Domaene.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: design
  complexity: intermediate
  language: R
  tags: design, glyph, pictogram, icon, ggplot2, visualization, neon
---

# Skill-Glyph erstellen

R-basierte Piktogramm-Glyphen fuer Skill-Icons in der `viz/`-Visualisierungsschicht erstellen. Jedes Glyph ist eine reine ggplot2-Funktion die eine erkennbare Form auf einer 100x100-Leinwand zeichnet, gerendert mit Neon-Glow-Effekt auf transparentem Hintergrund als WebP.

## Wann verwenden

- Ein neuer Skill wurde hinzugefuegt und benoetigt ein visuelles Icon fuer die Force-Graph-Visualisierung
- Ein bestehendes Glyph muss ersetzt oder ueberarbeitet werden
- Stapelerstellung von Glyphen fuer eine neue Skill-Domaene
- Visuelle Metaphern fuer Skill-Konzepte prototypisieren

## Eingaben

- **Erforderlich**: Skill-ID (z.B. `create-skill-glyph`) und Domaene (z.B. `design`)
- **Erforderlich**: Visuelles Konzept — was das Glyph darstellen soll
- **Optional**: Referenz-Glyph zur Orientierung am Komplexitaetsgrad
- **Optional**: Benutzerdefinierter `--glow-sigma`-Wert (Standard: 4)

## Vorgehensweise

### Schritt 1: Konzept — Visuelle Metapher entwerfen

Den zu symbolisierenden Skill identifizieren und eine visuelle Metapher waehlen.

1. Die SKILL.md des Skills lesen um das Kernkonzept zu verstehen
2. Metapherntyp waehlen:
   - **Woertliches Objekt**: ein Kolben fuer Experimente, ein Schild fuer Sicherheit
   - **Abstraktes Symbol**: Pfeile fuer Zusammenfuehrung, Spiralen fuer Iteration
   - **Zusammengesetzt**: 2-3 einfache Formen kombinieren (z.B. Dokument + Stift)
3. Bestehende Glyphen zur Komplexitaetskalibrierung heranziehen:

```
Komplexitaetsstufen:
┌──────────┬────────┬───────────────────────────────────────────┐
│ Stufe    │ Ebenen │ Beispiele                                 │
├──────────┼────────┼───────────────────────────────────────────┤
│ Einfach  │ 2      │ glyph_flame, glyph_heartbeat              │
│ Mittel   │ 3-5    │ glyph_document, glyph_experiment_flask     │
│ Komplex  │ 6+     │ glyph_ship_wheel, glyph_bridge_cpp        │
└──────────┴────────┴───────────────────────────────────────────┘
```

4. Funktionsnamen festlegen: `glyph_<beschreibender_name>` (snake_case, eindeutig)

**Erwartet:** Eine klare gedankliche Skizze der Form mit 2-6 geplanten Ebenen.

**Bei Fehler:** Wenn das Konzept zu abstrakt ist, auf ein verwandtes konkretes Objekt zurueckfallen. Bestehende Glyphen in derselben Domaene zur Inspiration durchsehen.

### Schritt 2: Komposition — Glyph-Funktion schreiben

Die R-Funktion schreiben die ggplot2-Ebenen erzeugt.

1. Funktionssignatur (unveraenderlicher Vertrag):
   ```r
   glyph_<name> <- function(cx, cy, s, col, bright) {
     # cx, cy = Mittelpunktkoordinaten (50, 50 auf 100x100-Leinwand)
     # s = Skalierungsfaktor (1.0 = fuellt ~70% der Leinwand)
     # col = Domaenenfarbe hex (z.B. "#ff88dd" fuer design)
     # bright = aufgehellte Variante von col (automatisch vom Renderer berechnet)
     # Rueckgabe: list() von ggplot2-Ebenen
   }
   ```

2. Skalierungsfaktor `* s` auf ALLE Dimensionen anwenden fuer konsistente Skalierung:
   ```r
   r <- 20 * s        # Radius
   hw <- 15 * s       # Halbe Breite
   lw <- .lw(s)       # Linienbreite (Standard-Basis 2.5)
   lw_thin <- .lw(s, 1.2)  # Duennere Linienbreite
   ```

3. Geometrie mit verfuegbaren Primitiven erstellen:

   | Geometrie | Verwendung |
   |-----------|------------|
   | `ggplot2::geom_polygon(data, .aes(x, y), ...)` | Gefuellte Formen |
   | `ggplot2::geom_path(data, .aes(x, y), ...)` | Offene Linien/Kurven |
   | `ggplot2::geom_segment(data, .aes(x, xend, y, yend), ...)` | Liniensegmente, Pfeile |
   | `ggplot2::geom_rect(data, .aes(xmin, xmax, ymin, ymax), ...)` | Rechtecke |
   | `ggforce::geom_circle(data, .aes(x0, y0, r), ...)` | Kreise |

4. Farbstrategie anwenden:

   ```
   Alpha-Leitfaden:
   ┌──────────────────────┬────────────┬──────────────────────────┐
   │ Zweck                │ Alpha      │ Beispiel                 │
   ├──────────────────────┼────────────┼──────────────────────────┤
   │ Grosse Fuellung      │ 0.08-0.15  │ hex_with_alpha(col, 0.1) │
   │ Mittlere Fuellung    │ 0.15-0.25  │ hex_with_alpha(col, 0.2) │
   │ Kleine Fuellung      │ 0.25-0.35  │ hex_with_alpha(bright, 0.3) │
   │ Umrisslinie          │ 1.0        │ color = bright           │
   │ Sekundaere Linie     │ 1.0        │ color = col              │
   │ Keine Fuellung       │ —          │ fill = NA                │
   └──────────────────────┴────────────┴──────────────────────────┘
   ```

5. Eine flache `list()` von Ebenen zurueckgeben (der Renderer iteriert und umhuellt jede mit Glow)

6. Die Funktion in die passende Primitives-Datei basierend auf Domaenen-Gruppierung platzieren:
   - `primitives.R` — bushcraft, compliance, containerization, data-serialization, defensive
   - `primitives_2.R` — devops, general, git, mcp-integration
   - `primitives_3.R` — mlops, observability, project-management, r-packages, reporting, review, web-dev, esoteric, design

**Erwartet:** Eine funktionierende R-Funktion die eine Liste von 2-6 ggplot2-Ebenen zurueckgibt.

**Bei Fehler:** Wenn `ggforce::geom_circle` Fehler verursacht, sicherstellen dass ggforce installiert ist. Wenn Koordinaten falsch sind: die Leinwand ist 100x100 mit (0,0) unten links. Die Funktion interaktiv testen:
```r
source("viz/R/utils.R"); source("viz/R/primitives.R")
layers <- glyph_<name>(50, 50, 1.0, "#ff88dd", "#ffa8f0")
p <- ggplot2::ggplot() + ggplot2::coord_fixed(xlim=c(0,100), ylim=c(0,100)) +
     ggplot2::theme_void()
for (l in layers) p <- p + l
print(p)
```

### Schritt 3: Registrieren — Skill dem Glyph zuordnen

Die Skill-zu-Glyph-Zuordnung in `viz/R/glyphs.R` hinzufuegen.

1. `viz/R/glyphs.R` oeffnen
2. Den Kommentarabschnitt fuer die Zieldomaene finden (z.B. `# -- design (3)`)
3. Den Eintrag in alphabetischer Reihenfolge innerhalb des Domaenenblocks hinzufuegen:
   ```r
   "skill-id" = "glyph_function_name",
   ```
4. Den Domaenenzaehler im Kommentar aktualisieren falls zutreffend (z.B. `(3)` -> `(4)`)
5. Verifizieren dass keine doppelte Skill-ID in `SKILL_GLYPHS` existiert

**Erwartet:** Die `SKILL_GLYPHS`-Liste enthaelt die neue Zuordnung.

**Bei Fehler:** Wenn der Build spaeter "No glyph mapped for skill" meldet, pruefen ob die Skill-ID exakt mit der im Manifest und Registry uebereinstimmt.

### Schritt 4: Manifest — Icon-Eintrag hinzufuegen

Das Icon in `viz/data/icon-manifest.json` registrieren.

1. Das Manifest oeffnen und die bestehenden Eintraege der Domaene finden
2. Die naechste Seed-Nummer fuer diese Domaene identifizieren:

   ```
   Domaenen-Seed-Bereiche:
   ┌──────────────────────┬──────────────┐
   │ Domaene              │ Seed-Bereich │
   ├──────────────────────┼──────────────┤
   │ bushcraft            │ 10001-10xxx  │
   │ compliance           │ 20001-20xxx  │
   │ containerization     │ 30001-30xxx  │
   │ data-serialization   │ 40001-40xxx  │
   │ defensive            │ 50001-50xxx  │
   │ design               │ 60001-60xxx  │
   │ devops               │ 70001-70xxx  │
   │ esoteric             │ 80001-80xxx  │
   │ general              │ 90001-90xxx  │
   │ git                  │ 100001-100xxx│
   │ mcp-integration      │ 110001-110xxx│
   │ mlops                │ 120001-120xxx│
   │ observability        │ 130001-130xxx│
   │ project-management   │ 140001-140xxx│
   │ r-packages           │ 150001-150xxx│
   │ reporting            │ 160001-160xxx│
   │ review               │ 170001-170xxx│
   │ web-dev              │ 180001-180xxx│
   └──────────────────────┴──────────────┘
   ```

3. Den Eintrag zum `icons`-Array hinzufuegen:
   ```json
   {
     "skillId": "skill-id",
     "domain": "domain-name",
     "prompt": "<domain basePrompt>, <skill-spezifische Beschreibungen>, dark background, vector art, clean edges, single centered icon, no text",
     "seed": <naechster_seed>,
     "path": "public/icons/cyberpunk/<domain>/<skill-id>.webp",
     "status": "pending"
   }
   ```

**Erwartet:** Gueltiges JSON mit dem neuen Eintrag bei seinen Domaenen-Geschwistern.

**Bei Fehler:** JSON-Syntax validieren. Haeufige Fehler: nachgestelltes Komma nach letztem Array-Element, fehlende Anfuehrungszeichen.

### Schritt 5: Rendern — Icon generieren

Die Build-Pipeline ausfuehren um die WebP zu rendern.

1. In das `viz/`-Verzeichnis navigieren (oder Projektstamm)
2. Die Zieldomaene rendern:
   ```bash
   cd viz && Rscript build-icons.R --only <domain>
   ```
3. Nur das neue Icon rendern (bestehende nicht neu rendern):
   ```bash
   Rscript build-icons.R --only <domain> --skip-existing
   ```
4. Zuerst einen Probelauf:
   ```bash
   Rscript build-icons.R --only <domain> --dry-run
   ```
5. Ausgabeort: `viz/public/icons/<palette>/<domain>/<skill-id>.webp`

**Erwartet:** Das Log zeigt `OK: <domain>/<skill-id> (seed=XXXXX, XX.XKB)` und die WebP-Datei existiert.

**Bei Fehler:**
- `"No glyph mapped for skill"` — Schritt-3-Zuordnung fehlt oder hat Tippfehler
- `"Unknown domain"` — Domaene nicht in `get_palette_colors()` in `palettes.R`
- R-Paketfehler — Zuerst `install.packages(c("ggplot2", "ggforce", "ggfx", "ragg", "magick"))` ausfuehren
- Bei Renderabsturz die Glyph-Funktion interaktiv testen (siehe Schritt-2-Fallback)

### Schritt 6: Verifizieren — Visuelle Inspektion

Die gerenderte Ausgabe auf Qualitaetsstandards pruefen.

1. Dateiexistenz und plausible Groesse verifizieren:
   ```bash
   ls -la viz/public/icons/cyberpunk/<domain>/<skill-id>.webp
   # Erwartet: 15-80 KB typischer Bereich
   ```

2. Die WebP in einem Bildbetrachter oeffnen und pruefen:
   - Form liest sich klar bei voller Groesse (1024x1024)
   - Neon-Glow ist vorhanden aber nicht ueberwaetigend
   - Hintergrund ist transparent (kein schwarzes/weisses Rechteck)
   - Kein Abschneiden an Leinwandkanten

3. Bei kleinen Groessen pruefen (das Icon rendert bei ~40-160px im Force-Graphen):
   - Form bleibt erkennbar
   - Details werden nicht zu Rauschen
   - Glow ueberwaeeltigt die Form nicht

**Erwartet:** Ein klares, erkennbares Piktogramm mit gleichmaessigem Neon-Glow auf transparentem Hintergrund.

**Bei Fehler:**
- Glow zu stark: mit `--glow-sigma 2` neu rendern (Standard ist 4)
- Glow zu schwach: mit `--glow-sigma 8` neu rendern
- Form bei kleinen Groessen unleserlich: Glyph vereinfachen (weniger Ebenen, kraeftigere Striche, `.lw(s, base)` Basiswert erhoehen)
- Abschneiden an Raendern: Formdimensionen reduzieren oder Mittelpunkt verschieben

### Schritt 7: Iterieren — Bei Bedarf verfeinern

Anpassungen vornehmen und neu rendern.

1. Haeufige Anpassungen:
   - **Kraeftigere Striche**: `.lw(s, base)` erhoehen — `base = 3.0` oder `3.5` probieren
   - **Sichtbarere Fuellung**: Alpha von 0.10 auf 0.15-0.20 erhoehen
   - **Formproportionen**: Multiplikatoren fuer `s` anpassen (z.B. `20 * s` -> `24 * s`)
   - **Detail-Ebenen hinzufuegen/entfernen**: Gesamtzahl zwischen 2-6 Ebenen halten fuer beste Ergebnisse

2. Nach Aenderungen neu rendern:
   ```bash
   # Bestehendes Icon zuerst loeschen
   rm viz/public/icons/cyberpunk/<domain>/<skill-id>.webp
   # Neu rendern
   Rscript build-icons.R --only <domain> --skip-existing
   ```

3. Wenn zufrieden, verifizieren dass der Manifest-Status `"done"` zeigt (das Build-Skript aktualisiert automatisch bei Erfolg)

**Erwartet:** Das fertige Icon besteht alle Verifizierungspruefungen aus Schritt 6.

**Bei Fehler:** Wenn nach 3+ Iterationen das Glyph immer noch nicht gut lesbar ist, eine komplett andere visuelle Metapher in Betracht ziehen (zurueck zu Schritt 1).

## Referenz

### Domaenen-Farbpalette

Alle 52 Domaenenfarben sind in `viz/R/palettes.R` definiert (die einzige Wahrheitsquelle). Die Cyberpunk-Palette (handabgestimmte Neonfarben) ist in `get_cyberpunk_colors()`. Viridis-Familie-Paletten werden automatisch ueber `viridisLite` generiert.

Eine Domaenenfarbe nachschlagen:
```r
source("viz/R/palettes.R")
get_palette_colors("cyberpunk")$domains[["design"]]
# [1] "#ff88dd"
```

Beim Hinzufuegen einer neuen Domaene an drei Stellen in `palettes.R` ergaenzen:
1. `PALETTE_DOMAIN_ORDER` (alphabetisch)
2. `get_cyberpunk_colors()` Domaenenliste
3. `Rscript generate-palette-colors.R` ausfuehren um JSON + JS zu regenerieren

### Hilfsfunktionen

| Funktion | Signatur | Zweck |
|----------|----------|-------|
| `.lw(s, base)` | `(scale, base=2.5)` | Skalierungsbewusste Linienbreite |
| `.aes(...)` | Alias fuer `ggplot2::aes` | Kurzform fuer aestethische Zuordnung |
| `hex_with_alpha(hex, alpha)` | `(string, 0-1)` | Alpha zu Hex-Farbe hinzufuegen |
| `brighten_hex(hex, factor)` | `(string, factor=1.3)` | Hex-Farbe aufhellen |
| `dim_hex(hex, factor)` | `(string, factor=0.4)` | Hex-Farbe abdunkeln |

## Validierung

- [ ] Glyph-Funktion folgt `glyph_<name>(cx, cy, s, col, bright) -> list()` Signatur
- [ ] Alle Dimensionen verwenden `* s` Skalierungsfaktor
- [ ] Farbstrategie verwendet `col` fuer Fuellungen, `bright` fuer Umrisse, `hex_with_alpha()` fuer Transparenz
- [ ] Funktion in korrekter Primitives-Datei fuer Domaenengruppierung platziert
- [ ] `SKILL_GLYPHS`-Eintrag in `viz/R/glyphs.R` mit korrekter Skill-ID hinzugefuegt
- [ ] `icon-manifest.json`-Eintrag mit korrekter Domaene, Seed, Pfad und `"status": "pending"` hinzugefuegt
- [ ] `build-icons.R --dry-run` laeuft fehlerfrei
- [ ] Gerenderte WebP existiert unter `viz/public/icons/cyberpunk/<domain>/<skill-id>.webp`
- [ ] Dateigroesse im erwarteten Bereich (15-80 KB)
- [ ] Icon liest sich klar bei sowohl 1024px als auch ~40px Anzeigegroeessen
- [ ] Transparenter Hintergrund (kein Vollrechteck hinter dem Glyph)
- [ ] Manifest-Status nach erfolgreichem Render auf `"done"` aktualisiert

## Haeufige Stolperfallen

- **`* s` vergessen**: Hartcodierte Pixelwerte brechen wenn Skalierung sich aendert. Immer mit `s` multiplizieren.
- **Leinwand-Ursprungsverwirrung**: (0,0) ist unten links, nicht oben links. Hoehere `y`-Werte gehen NACH OBEN.
- **Doppelter Glow**: Der Renderer wendet bereits `ggfx::with_outer_glow()` auf jede Ebene an. KEINEN Glow innerhalb der Glyph-Funktion hinzufuegen.
- **Zu viele Ebenen**: Jede Ebene bekommt individuelles Glow-Wrapping. Mehr als 8 Ebenen macht Rendering langsam und visuell verrauscht.
- **IDs stimmen nicht ueberein**: Die Skill-ID in `SKILL_GLYPHS`, `icon-manifest.json` und `_registry.yml` muessen alle exakt uebereinstimmen.
- **JSON nachgestellte Kommas**: Das Manifest ist striktes JSON. Kein nachgestelltes Komma nach dem letzten Array-Element.
- **Fehlende Domaenenfarbe**: Wenn die Domaene nicht in `get_cyberpunk_colors()` in `palettes.R` ist, wird Rendering fehlschlagen. Farbe zuerst zu `palettes.R` hinzufuegen, dann `Rscript generate-palette-colors.R` ausfuehren um das JS-Modul zu regenerieren.

## Verwandte Skills

- [glyph-enhance](../glyph-enhance/SKILL.md) — Visuelle Qualitaet eines bestehenden Glyphs verbessern, Renderprobleme beheben oder Detail-Ebenen hinzufuegen
- [ornament-style-mono](../ornament-style-mono/SKILL.md) — Komplementaere KI-basierte Bildgenerierung (Z-Image vs R-codierte Glyphen)
- [ornament-style-color](../ornament-style-color/SKILL.md) — Farbtheorie anwendbar auf Glyph-Akzentfuellungs-Entscheidungen
- [create-skill](../create-skill/SKILL.md) — Der uebergeordnete Workflow der Glyph-Erstellung beim Hinzufuegen neuer Skills ausloest
