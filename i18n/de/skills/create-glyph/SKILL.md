---
name: create-glyph
locale: de
source_locale: en
source_commit: 41c6956b
translator: claude
translation_date: "2026-03-18"
description: >
  R-basierte Piktogramm-Glyphen fuer Skill-, Agent- oder Team-Icons in der
  Visualisierungsschicht erstellen. Umfasst Konzeptskizze, ggplot2-Ebenenzusammenstellung
  mit der Primitives-Bibliothek, Farbstrategie, Registrierung in der passenden
  Glyph-Zuordnungsdatei und im Manifest, Rendering ueber die Build-Pipeline sowie
  visuelle Ueberpruefung der Neon-Glow-Ausgabe. Verwenden, wenn eine neue Entitaet
  hinzugefuegt wurde und ein visuelles Icon fuer die Force-Graph-Visualisierung braucht,
  eine bestehende Glyphe ersetzt werden soll, oder beim Batch-Erstellen von Glyphen
  fuer eine neue Domaene.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "2.0"
  domain: design
  complexity: intermediate
  language: R
  tags: design, glyph, pictogram, icon, ggplot2, visualization, neon
---

# Glyphe erstellen

R-basierte Piktogramm-Glyphen fuer Skill-, Agent- oder Team-Icons in der `viz/`-Visualisierungsschicht erstellen. Jede Glyphe ist eine reine ggplot2-Funktion, die eine erkennbare Form auf einer 100x100-Leinwand zeichnet und mit einem Neon-Glow-Effekt als transparentes WebP gerendert wird.

## Wann verwenden

- Ein neuer Skill, Agent oder Team wurde hinzugefuegt und benoetigt ein visuelles Icon
- Eine bestehende Glyphe soll ersetzt oder neu gestaltet werden
- Batch-Erstellung von Glyphen fuer eine neue Skill-Domaene
- Visuelle Metaphern fuer Entitaetskonzepte prototypisieren

## Eingaben

- **Erforderlich**: Entitaetstyp — `skill`, `agent` oder `team`
- **Erforderlich**: Entitaets-ID (z.B. `create-glyph`, `mystic`, `r-package-review`) und Domaene (fuer Skills)
- **Erforderlich**: Visuelles Konzept — was die Glyphe darstellen soll
- **Optional**: Referenz-Glyphe zum Studium des Komplexitaetsniveaus
- **Optional**: Benutzerdefinierter `--glow-sigma`-Wert (Standard: 4)

## Verfahren

### Schritt 1: Konzept — Visuelle Metapher entwerfen

Die zu ikonifizierende Entitaet identifizieren und eine visuelle Metapher waehlen.

1. Die Quelldatei der Entitaet lesen, um das Kernkonzept zu verstehen:
   - Skills: `skills/<id>/SKILL.md`
   - Agents: `agents/<id>.md`
   - Teams: `teams/<id>.md`
2. Einen Metaphertyp waehlen:
   - **Konkretes Objekt**: ein Kolben fuer Experimente, ein Schild fuer Sicherheit
   - **Abstraktes Symbol**: Pfeile fuer Zusammenfuehrung, Spiralen fuer Iteration
   - **Zusammengesetzt**: 2-3 einfache Formen kombinieren (z.B. Dokument + Stift)
3. Bestehende Glyphen als Komplexitaetsreferenz heranziehen:

```
Complexity Tiers:
+----------+--------+-------------------------------------------+
| Tier     | Layers | Examples                                  |
+----------+--------+-------------------------------------------+
| Simple   | 2      | glyph_flame, glyph_heartbeat              |
| Moderate | 3-5    | glyph_document, glyph_experiment_flask    |
| Complex  | 6+     | glyph_ship_wheel, glyph_bridge_cpp        |
+----------+--------+-------------------------------------------+
```

4. Einen Funktionsnamen festlegen: `glyph_<beschreibender_name>` (snake_case, eindeutig)

**Erwartet:** Eine klare gedankliche Skizze der Form mit 2-6 geplanten Ebenen.

**Bei Fehler:** Falls das Konzept zu abstrakt ist, auf ein verwandtes konkretes Objekt zurueckgreifen. Bestehende Glyphen in derselben Domaene zur Inspiration durchsehen.

### Schritt 2: Zusammensetzen — Glyphen-Funktion schreiben

Die R-Funktion schreiben, die ggplot2-Ebenen erzeugt.

1. Funktionssignatur (unveraenderlicher Vertrag):
   ```r
   glyph_<name> <- function(cx, cy, s, col, bright) {
     # cx, cy = center coordinates (50, 50 on 100x100 canvas)
     # s = scale factor (1.0 = fill ~70% of canvas)
     # col = domain color hex (e.g., "#ff88dd" for design)
     # bright = brightened variant of col (auto-computed by renderer)
     # Returns: list() of ggplot2 layers
   }
   ```

2. Skalierungsfaktor `* s` auf ALLE Dimensionen anwenden fuer konsistente Skalierung:
   ```r
   r <- 20 * s        # radius
   hw <- 15 * s       # half-width
   lw <- .lw(s)       # line width (default base 2.5)
   lw_thin <- .lw(s, 1.2)  # thinner line width
   ```

3. Geometrie mit verfuegbaren Primitives erstellen:

   | Geometrie | Verwendung |
   |-----------|------------|
   | `ggplot2::geom_polygon(data, .aes(x, y), ...)` | Gefuellte Formen |
   | `ggplot2::geom_path(data, .aes(x, y), ...)` | Offene Linien/Kurven |
   | `ggplot2::geom_segment(data, .aes(x, xend, y, yend), ...)` | Liniensegmente, Pfeile |
   | `ggplot2::geom_rect(data, .aes(xmin, xmax, ymin, ymax), ...)` | Rechtecke |
   | `ggforce::geom_circle(data, .aes(x0, y0, r), ...)` | Kreise |

4. Die Farbstrategie anwenden:

   ```
   Alpha Guide:
   +----------------------+------------+--------------------------+
   | Purpose              | Alpha      | Example                  |
   +----------------------+------------+--------------------------+
   | Large fill (body)    | 0.08-0.15  | hex_with_alpha(col, 0.1) |
   | Medium fill (accent) | 0.15-0.25  | hex_with_alpha(col, 0.2) |
   | Small fill (detail)  | 0.25-0.35  | hex_with_alpha(bright, 0.3) |
   | Outline stroke       | 1.0        | color = bright           |
   | Secondary stroke     | 1.0        | color = col              |
   | No fill              | ---        | fill = NA                |
   +----------------------+------------+--------------------------+
   ```

5. Eine flache `list()` von Ebenen zurueckgeben (der Renderer iteriert und umgibt jede mit Glow)

6. Die Funktion in der passenden Primitives-Datei basierend auf dem Entitaetstyp platzieren:
   - **Skills**: Domaenengruppiert ueber 19 Primitives-Dateien:
     - `primitives.R` — bushcraft, compliance, containerization, data-serialization, defensive
     - `primitives_2.R` — devops, general, git, mcp-integration
     - `primitives_3.R` — mlops, observability, PM, r-packages, reporting, review, web-dev, esoteric, design
     - Weitere `primitives_4.R` bis `primitives_19.R` fuer neuere Domaenen
   - **Agents**: `viz/R/agent_primitives.R`
   - **Teams**: `viz/R/team_primitives.R`

**Erwartet:** Eine funktionierende R-Funktion, die eine Liste von 2-6 ggplot2-Ebenen zurueckgibt.

**Bei Fehler:** Falls `ggforce::geom_circle` Fehler verursacht, sicherstellen, dass ggforce installiert ist. Falls Koordinaten nicht stimmen, bedenken, dass die Leinwand 100x100 mit (0,0) unten links ist. Die Funktion interaktiv testen:
```r
source("viz/R/utils.R"); source("viz/R/primitives.R")  # etc.
layers <- glyph_<name>(50, 50, 1.0, "#ff88dd", "#ffa8f0")
p <- ggplot2::ggplot() + ggplot2::coord_fixed(xlim=c(0,100), ylim=c(0,100)) +
     ggplot2::theme_void()
for (l in layers) p <- p + l
print(p)
```

### Schritt 3: Registrieren — Entitaet der Glyphe zuordnen

Die Entitaet-zu-Glyphe-Zuordnung in der passenden Glyph-Zuordnungsdatei hinzufuegen.

**Fuer Skills:**
1. `viz/R/glyphs.R` oeffnen
2. Den Kommentarbereich fuer die Zieldomaene finden (z.B. `# -- design (3)`)
3. Den Eintrag in alphabetischer Reihenfolge innerhalb des Domaenenblocks hinzufuegen:
   ```r
   "skill-id" = "glyph_function_name",
   ```
4. Die Domaenenanzahl im Kommentar bei Bedarf aktualisieren

**Fuer Agents:**
1. `viz/R/agent_glyphs.R` oeffnen
2. Die alphabetische Position in `AGENT_GLYPHS` finden
3. Den Eintrag hinzufuegen:
   ```r
   "agent-id" = "glyph_function_name",
   ```

**Fuer Teams:**
1. `viz/R/team_glyphs.R` oeffnen
2. Die alphabetische Position in `TEAM_GLYPHS` finden
3. Den Eintrag hinzufuegen:
   ```r
   "team-id" = "glyph_function_name",
   ```

5. Sicherstellen, dass keine doppelte ID in der Zielliste existiert

**Erwartet:** Die entsprechende `*_GLYPHS`-Liste enthaelt die neue Zuordnung.

**Bei Fehler:** Falls der Build spaeter "No glyph mapped" meldet, nochmals pruefen, dass die Entitaets-ID exakt mit der im Manifest und in der Registry uebereinstimmt.

### Schritt 4: Manifest — Icon-Eintrag hinzufuegen

Das Icon im passenden Manifest registrieren.

**Fuer Skills:** `viz/data/icon-manifest.json`
```json
{
  "skillId": "skill-id",
  "domain": "domain-name",
  "prompt": "<domain basePrompt>, <descriptors>, dark background, vector art",
  "seed": <next_seed>,
  "path": "public/icons/cyberpunk/<domain>/<skill-id>.webp",
  "status": "pending"
}
```

**Fuer Agents:** `viz/data/agent-icon-manifest.json`
```json
{
  "agentId": "agent-id",
  "prompt": "<agent-specific descriptors>, dark background, vector art",
  "seed": <next_seed>,
  "path": "public/icons/cyberpunk/agents/<agent-id>.webp",
  "status": "pending"
}
```

**Fuer Teams:** `viz/data/team-icon-manifest.json`
```json
{
  "teamId": "team-id",
  "prompt": "<team-specific descriptors>, dark background, vector art",
  "seed": <next_seed>,
  "path": "public/icons/cyberpunk/teams/<team-id>.webp",
  "status": "pending"
}
```

**Erwartet:** Gueltiges JSON mit dem neuen Eintrag bei den zugehoerigen Typ-Geschwistern.

**Bei Fehler:** JSON-Syntax validieren. Haeufige Fehler: nachgestelltes Komma nach dem letzten Array-Element, fehlende Anfuehrungszeichen.

### Schritt 5: Rendern — Icon generieren

Die Build-Pipeline ausfuehren, um das WebP zu rendern.

1. Zum `viz/`-Verzeichnis navigieren
2. Basierend auf dem Entitaetstyp rendern:

**Fuer Skills:**
```bash
cd viz && Rscript build-icons.R --only <domain>
# Or skip existing: Rscript build-icons.R --only <domain> --skip-existing
```

**Fuer Agents:**
```bash
cd viz && Rscript build-agent-icons.R --only <agent-id>
# Or skip existing: Rscript build-agent-icons.R --only <agent-id> --skip-existing
```

**Fuer Teams:**
```bash
cd viz && Rscript build-team-icons.R --only <team-id>
# Or skip existing: Rscript build-team-icons.R --only <team-id> --skip-existing
```

3. Fuer einen Probelauf zuerst `--dry-run` an einen beliebigen Befehl anhaengen
4. Ausgabeorte:
   - Skills: `viz/public/icons/<palette>/<domain>/<skill-id>.webp`
   - Agents: `viz/public/icons/<palette>/agents/<agent-id>.webp`
   - Teams: `viz/public/icons/<palette>/teams/<team-id>.webp`

**Erwartet:** Das Log zeigt `OK: <entity> (seed=XXXXX, XX.XKB)` und die WebP-Datei existiert.

**Bei Fehler:**
- `"No glyph mapped"` — Zuordnung aus Schritt 3 fehlt oder hat einen Tippfehler
- `"Unknown domain"` — Domaene nicht in `get_palette_colors()` in `palettes.R`
- R-Paketfehler — Zuerst `install.packages(c("ggplot2", "ggforce", "ggfx", "ragg", "magick"))` ausfuehren
- Falls das Rendering abstuerzt, die Glyphen-Funktion interaktiv testen (siehe Schritt 2 Fallback)

### Schritt 6: Verifizieren — Visuelle Inspektion

Die gerenderte Ausgabe auf Qualitaetsstandards pruefen.

1. Datei-Existenz und angemessene Groesse pruefen:
   ```bash
   ls -la viz/public/icons/cyberpunk/<type-path>/<entity-id>.webp
   # Expected: 15-80 KB typical range
   ```

2. Das WebP in einem Bildbetrachter oeffnen und pruefen:
   - Form ist bei voller Groesse (1024x1024) klar erkennbar
   - Neon-Glow ist vorhanden, aber nicht uebertrieben
   - Hintergrund ist transparent (kein schwarzes/weisses Rechteck)
   - Kein Beschnitt an den Leinwandraendern

3. Bei kleinen Groessen pruefen (das Icon wird mit ~40-160px im Force-Graph gerendert):
   - Form bleibt erkennbar
   - Details werden nicht zu Rauschen
   - Glow uebertrifft nicht die Form

**Erwartet:** Ein klares, erkennbares Piktogramm mit gleichmaessigem Neon-Glow auf transparentem Hintergrund.

**Bei Fehler:**
- Glow zu stark: mit `--glow-sigma 2` neu rendern (Standard ist 4)
- Glow zu schwach: mit `--glow-sigma 8` neu rendern
- Form bei kleinen Groessen unlesbar: Glyphe vereinfachen (weniger Ebenen, kraeftigere Striche, `.lw(s, base)` Basiswert erhoehen)
- Beschnitt an Raendern: Formdimensionen reduzieren oder Zentrum verschieben

### Schritt 7: Iterieren — Bei Bedarf verfeinern

Anpassungen vornehmen und erneut rendern.

1. Haeufige Anpassungen:
   - **Kraeftigere Striche**: `.lw(s, base)` erhoehen — `base = 3.0` oder `3.5` versuchen
   - **Sichtbarere Fuellung**: Alpha von 0.10 auf 0.15-0.20 erhoehen
   - **Formproportionen**: Multiplikatoren auf `s` anpassen (z.B. `20 * s` -> `24 * s`)
   - **Detail-Ebenen hinzufuegen/entfernen**: Gesamtzahl der Ebenen zwischen 2-6 halten fuer beste Ergebnisse

2. Zum erneuten Rendern nach Aenderungen:
   ```bash
   # Delete the existing icon first, then re-render
   rm viz/public/icons/cyberpunk/<type-path>/<entity-id>.webp
   # Use the appropriate build command from Step 5
   ```

3. Wenn zufriedenstellend, pruefen, ob der Manifest-Status `"done"` zeigt (das Build-Skript aktualisiert ihn automatisch bei Erfolg)

**Erwartet:** Das fertige Icon besteht alle Pruefungen aus Schritt 6.

**Bei Fehler:** Falls die Glyphe nach 3+ Iterationen immer noch nicht gut lesbar ist, eine voellig andere visuelle Metapher in Betracht ziehen (zurueck zu Schritt 1).

## Referenz

### Domaenen- und Entitaetsfarbpaletten

Alle 58 Domaenenfarben (fuer Skills) sind in `viz/R/palettes.R` definiert (die einzige Quelle der Wahrheit). Agent- und Team-Farben werden ebenfalls in `palettes.R` verwaltet. Die Cyberpunk-Palette (handabgestimmte Neonfarben) ist in `get_cyberpunk_colors()`. Viridis-Familienpaletten werden automatisch ueber `viridisLite` generiert.

Zum Nachschlagen einer Farbe:
```r
source("viz/R/palettes.R")
get_palette_colors("cyberpunk")$domains[["design"]]   # skill domain
get_palette_colors("cyberpunk")$agents[["mystic"]]     # agent
get_palette_colors("cyberpunk")$teams[["tending"]]     # team
```

Beim Hinzufuegen einer neuen Domaene an drei Stellen in `palettes.R` eintragen:
1. `PALETTE_DOMAIN_ORDER` (alphabetisch)
2. `get_cyberpunk_colors()` Domaenenliste
3. `Rscript generate-palette-colors.R` ausfuehren, um JSON + JS zu regenerieren

### Glyphen-Funktionskatalog

Den vollstaendigen Katalog verfuegbarer Glyphen-Funktionen in den Primitives-Quelldateien einsehen:
- **Skills**: `viz/R/primitives.R` bis `viz/R/primitives_19.R` (domaenengruppiert)
- **Agents**: `viz/R/agent_primitives.R`
- **Teams**: `viz/R/team_primitives.R`

### Hilfsfunktionen

| Funktion | Signatur | Zweck |
|----------|----------|-------|
| `.lw(s, base)` | `(scale, base=2.5)` | Skalierungsbewusste Linienbreite |
| `.aes(...)` | alias fuer `ggplot2::aes` | Kurzform-Aesthetic-Mapping |
| `hex_with_alpha(hex, alpha)` | `(string, 0-1)` | Alpha zu Hex-Farbe hinzufuegen |
| `brighten_hex(hex, factor)` | `(string, factor=1.3)` | Hex-Farbe aufhellen |
| `dim_hex(hex, factor)` | `(string, factor=0.4)` | Hex-Farbe abdunkeln |

## Validierungscheckliste

- [ ] Glyphen-Funktion folgt der `glyph_<name>(cx, cy, s, col, bright) -> list()` Signatur
- [ ] Alle Dimensionen verwenden den `* s` Skalierungsfaktor
- [ ] Farbstrategie nutzt `col` fuer Fuellungen, `bright` fuer Umrisse, `hex_with_alpha()` fuer Transparenz
- [ ] Funktion in der korrekten Primitives-Datei fuer Entitaetstyp und Domaene platziert
- [ ] Glyphen-Zuordnungseintrag in der passenden `*_glyphs.R`-Datei hinzugefuegt
- [ ] Manifest-Eintrag mit korrekter Entitaets-ID, Pfad und `"status": "pending"` hinzugefuegt
- [ ] Build-Befehl laeuft ohne Fehler (zuerst Probelauf)
- [ ] Gerendertes WebP existiert am erwarteten Pfad
- [ ] Dateigroesse im erwarteten Bereich (15-80 KB)
- [ ] Icon ist bei 1024px und ~40px Anzeiggroessen klar erkennbar
- [ ] Transparenter Hintergrund (kein massives Rechteck hinter der Glyphe)
- [ ] Manifest-Status nach erfolgreichem Rendern auf `"done"` aktualisiert

## Haeufige Fehler

- **`* s` vergessen**: Hartcodierte Pixelwerte brechen, wenn sich die Skalierung aendert. Immer mit `s` multiplizieren.
- **Leinwand-Ursprungsverwirrung**: (0,0) ist unten links, nicht oben links. Hoehere `y`-Werte bewegen sich NACH OBEN.
- **Doppelter Glow**: Der Renderer wendet bereits `ggfx::with_outer_glow()` auf jede Ebene an. Keinen Glow INNERHALB der Glyphen-Funktion hinzufuegen.
- **Zu viele Ebenen**: Jede Ebene bekommt individuelles Glow-Wrapping. Mehr als 8 Ebenen macht das Rendering langsam und visuell unruhig.
- **Nicht uebereinstimmende IDs**: Die Entitaets-ID in der Glyphen-Zuordnung, im Manifest und in der Registry muessen alle exakt uebereinstimmen.
- **JSON-Nachkommas**: Das Manifest ist striktes JSON. Kein nachgestelltes Komma nach dem letzten Array-Element.
- **Fehlende Domaenenfarbe**: Falls die Domaene nicht in `get_cyberpunk_colors()` in `palettes.R` ist, wird das Rendering einen Fehler werfen. Zuerst die Farbe hinzufuegen, dann regenerieren.
- **Falsche Primitives-Datei**: Skills gehoeren in domaenengruppierte `primitives*.R`, Agents in `agent_primitives.R`, Teams in `team_primitives.R`.

## Verwandte Skills

- [enhance-glyph](../enhance-glyph/SKILL.md) — Visuelle Qualitaet einer bestehenden Glyphe verbessern, Rendering-Probleme beheben oder Detail-Ebenen hinzufuegen
- [audit-icon-pipeline](../audit-icon-pipeline/SKILL.md) — Fehlende Glyphen und Icons erkennen, um zu wissen, was erstellt werden muss
- [render-icon-pipeline](../render-icon-pipeline/SKILL.md) — Die vollstaendige Rendering-Pipeline von Anfang bis Ende ausfuehren
- [ornament-style-mono](../ornament-style-mono/SKILL.md) — Komplementaere KI-basierte Bilderzeugung (Z-Image vs R-codierte Glyphen)
- [ornament-style-color](../ornament-style-color/SKILL.md) — Farbtheorie anwendbar auf Glyphen-Akzentfuellungsentscheidungen
- [create-skill](../create-skill/SKILL.md) — Der uebergeordnete Workflow, der Glyphen-Erstellung ausloest beim Hinzufuegen neuer Skills
