---
name: enhance-glyph
locale: de
source_locale: en
source_commit: acc252e6
translator: claude
translation_date: "2026-03-18"
description: >
  Eine bestehende R-basierte Piktogramm-Glyphe fuer die Visualisierungsschicht
  verbessern. Umfasst visuelle Ueberpruefung der aktuellen Glyphe, Diagnose
  spezifischer Probleme (Proportionen, Lesbarkeit, Glow-Balance), gezielte
  Modifikationen an der Glyphen-Funktion, erneutes Rendering und Vorher/Nachher-
  Vergleich. Funktioniert fuer Skill-, Agent- und Team-Glyphen. Verwenden, wenn
  eine Glyphe bei kleinen Groessen schlecht rendert, ihre visuelle Metapher unklar
  ist, Proportionsprobleme hat, der Neon-Glow-Effekt unausgewogen ist, oder nach
  dem Hinzufuegen neuer Paletten oder Aenderungen an der Rendering-Pipeline.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "2.0"
  domain: design
  complexity: intermediate
  language: R
  tags: design, glyph, enhancement, icon, ggplot2, visualization, refinement
---

# Glyphe verbessern

Eine bestehende Piktogramm-Glyphe in der `viz/`-Visualisierungsschicht verbessern — das aktuelle Rendering ueberpruefen, visuelle Probleme diagnostizieren, gezielte Modifikationen anwenden, neu rendern und Vorher/Nachher vergleichen. Funktioniert fuer Skill-, Agent- und Team-Glyphen.

## Wann verwenden

- Eine Glyphe rendert bei kleinen Groessen schlecht (Details gehen verloren, Formen verschmelzen)
- Die visuelle Metapher einer Glyphe ist unklar oder passt nicht zur dargestellten Entitaet
- Eine Glyphe hat Proportionsprobleme (zu gross, zu klein, dezentriert)
- Der Neon-Glow-Effekt uebertrifft oder unterdrueckt die Glyphe
- Eine Glyphe sieht in einer Palette gut aus, aber in anderen schlecht
- Batch-Verbesserung nach dem Hinzufuegen neuer Paletten oder Aenderungen an der Rendering-Pipeline

## Eingaben

- **Erforderlich**: Entitaetstyp — `skill`, `agent` oder `team`
- **Erforderlich**: Entitaets-ID der zu verbessernden Glyphe (z.B. `commit-changes`, `mystic`, `tending`)
- **Erforderlich**: Spezifisches Problem (Lesbarkeit, Proportionen, Glow, Paletten-Kompatibilitaet)
- **Optional**: Referenz-Glyphe, die das gewuenschte Qualitaetsniveau demonstriert
- **Optional**: Zielpalette(n) zur Optimierung (Standard: alle Paletten)

## Verfahren

### Schritt 1: Pruefung — Aktuellen Zustand bewerten

Die aktuelle Glyphe untersuchen und spezifische Probleme identifizieren.

1. Die Glyphen-Funktion basierend auf dem Entitaetstyp lokalisieren:
   - **Skills**: `viz/R/primitives*.R` (19 domaenengruppierte Dateien), zugeordnet in `viz/R/glyphs.R`
   - **Agents**: `viz/R/agent_primitives.R`, zugeordnet in `viz/R/agent_glyphs.R`
   - **Teams**: `viz/R/team_primitives.R`, zugeordnet in `viz/R/team_glyphs.R`
2. Die Glyphen-Funktion lesen, um ihre Struktur zu verstehen:
   - Wie viele Ebenen verwendet sie?
   - Welche Primitives ruft sie auf?
   - Welche Skalierungsfaktoren und Positionierung sind gesetzt?
3. Die gerenderte Ausgabe ansehen:
   - Skills: `viz/public/icons/cyberpunk/<domain>/<skillId>.webp`
   - Agents: `viz/public/icons/cyberpunk/agents/<agentId>.webp`
   - Teams: `viz/public/icons/cyberpunk/teams/<teamId>.webp`
   - Falls verfuegbar, 2-3 weitere Paletten fuer palettenuebergreifendes Rendering pruefen
   - Bei Icon-Groesse (~48px im Graph) und Panel-Groesse (~160px im Detail-Panel) betrachten
4. Die Glyphe auf den **Qualitaetsdimensionen** bewerten:

```
Glyph Quality Dimensions:
+----------------+------+-----------------------------------------------+
| Dimension      | 1-5  | Assessment Criteria                           |
+----------------+------+-----------------------------------------------+
| Readability    |      | Recognizable at 48px? Clear at 160px?         |
| Proportions    |      | Well-centered? Good use of the 100x100 canvas?|
| Metaphor       |      | Does the shape clearly represent the entity?   |
| Glow balance   |      | Glow enhances without overwhelming?            |
| Palette compat |      | Looks good across cyberpunk + viridis palettes?|
| Complexity     |      | Appropriate layer count (not too busy/sparse)? |
+----------------+------+-----------------------------------------------+
```

5. Die 1-2 Dimensionen mit den niedrigsten Bewertungen identifizieren — das sind die Verbesserungsziele

**Erwartet:** Eine klare Diagnose, was mit der Glyphe nicht stimmt und welche Dimensionen verbessert werden sollen. Die Pruefung sollte spezifisch sein: "Proportionen: Glyphe nutzt nur 40% der Leinwand", nicht "sieht schlecht aus".

**Bei Fehler:** Falls die Glyphen-Funktion fehlt oder die Entitaet nicht in ihrer `*_glyphs.R`-Zuordnung ist, wurde die Glyphe moeglicherweise noch nicht erstellt — stattdessen `create-glyph` verwenden.

### Schritt 2: Diagnostizieren — Ursachenanalyse

Bestimmen, warum die identifizierten Probleme bestehen.

1. Bei **Lesbarkeits**-Problemen:
   - Zu viele feine Details, die bei kleinen Groessen verschmelzen?
   - Unzureichender Kontrast zwischen Glyphen-Elementen?
   - Linien zu duenn (< 1.5 `size` bei s=1.0)?
   - Elemente zu nah beieinander?
2. Bei **Proportions**-Problemen:
   - Skalierungsfaktor `s` zu klein oder zu gross?
   - Zentrum von (50, 50) verschoben?
   - Elemente dehnen sich ueber den sicheren Bereich (10-90) hinaus aus?
3. Bei **Glow**-Problemen:
   - Glyphen-Strichbreite interagiert mit `ggfx::with_outer_glow()`:
     - Duenne Linien: Glow macht sie unscharf
     - Dicke Fuellungen: Glow erzeugt uebertriebenes Leuchten
   - Mehrere ueberlappende Elemente: zusammengesetzter Glow erzeugt Hotspots
4. Bei **Palettenkompatibilitaets**-Problemen:
   - Glyphe verwendet hartcodierte Farben statt `col`/`bright`-Parameter?
   - Kontrastarme Paletten (cividis, mako) machen die Glyphe unsichtbar?
   - Die Glyphe haengt von Farbvariation ab, die manche Paletten nicht bieten?
5. Die spezifische Ursache fuer jedes Problem dokumentieren

**Erwartet:** Ursachen, die direkt auf Code-Aenderungen hinweisen. "Die Glyphe ist zu klein" -> "Skalierungsfaktor ist 0.6, sollte aber 0.8 sein." "Glow uebertrifft" -> "Drei ueberlappende gefuellte Polygone erzeugen jeweils Glow."

**Bei Fehler:** Falls die Ursache nicht offensichtlich aus der Code-Inspektion ist, die Glyphe isoliert mit verschiedenen Parametern rendern, um das Problem einzugrenzen. `render_glyph()` mit einer einzelnen Glyphe zum Testen verwenden.

### Schritt 3: Modifizieren — Gezielte Korrekturen anwenden

Die Glyphen-Funktion bearbeiten, um die diagnostizierten Probleme zu beheben.

1. Die Datei oeffnen, die die Glyphen-Funktion enthaelt
2. Modifikationen entsprechend der Diagnose anwenden:
   - **Skalierung/Proportionen**: `s`-Multiplikator oder Element-Offsets anpassen
   - **Lesbarkeit**: Komplexe Elemente vereinfachen, Strichbreite erhoehen, Abstaende vergroessern
   - **Glow-Balance**: Ueberlappende gefuellte Bereiche reduzieren, Umrisse statt Fuellungen verwenden, wo Fuellungen Leuchten erzeugen
   - **Palettenkompatibilitaet**: Sicherstellen, dass alle Farben von `col`/`bright`-Parametern abgeleitet werden, Alpha fuer Tiefe hinzufuegen
3. Dem **Glyphen-Funktionsvertrag** folgen:
   ```r
   glyph_name <- function(cx, cy, s, col, bright) {
     # cx, cy = center (50, 50)
     # s = scale (1.0 = ~70% of canvas)
     # col = domain color, bright = brightened variant
     # Returns: list() of ggplot2 layers
   }
   ```
4. Die Funktionssignatur beibehalten — Parameter nicht aendern
5. Modifikationen minimal halten: die diagnostizierten Probleme beheben, nicht die gesamte Glyphe neu gestalten

**Erwartet:** Eine modifizierte Glyphen-Funktion, die die in Schritten 1-2 identifizierten spezifischen Probleme behebt. Aenderungen sind gezielt und minimal — verbessern, nicht neu gestalten.

**Bei Fehler:** Falls die Modifikationen andere Dimensionen verschlechtern (z.B. Proportionsfix bricht Lesbarkeit), Aenderungen rueckgaengig machen und einen anderen Ansatz versuchen. Falls die Glyphe eine vollstaendige Neugestaltung benoetigt, stattdessen `create-glyph` verwenden.

### Schritt 4: Neu rendern — Aktualisierte Icons generieren

Die modifizierte Glyphe rendern und die Korrektur verifizieren.

1. Basierend auf dem Entitaetstyp neu rendern:

   **Fuer Skills:**
   ```bash
   cd /mnt/d/dev/p/agent-almanac/viz
   Rscript build-icons.R --only <domain> --no-cache
   ```

   **Fuer Agents:**
   ```bash
   cd /mnt/d/dev/p/agent-almanac/viz
   Rscript build-agent-icons.R --only <agent-id> --no-cache
   ```

   **Fuer Teams:**
   ```bash
   cd /mnt/d/dev/p/agent-almanac/viz
   Rscript build-team-icons.R --only <team-id> --no-cache
   ```

2. Ausgabedateien am erwarteten Pfad fuer jede Palette pruefen
3. Dateigroessen pruefen — Icons sollten 2-15 KB (WebP) sein:
   - Unter 2 KB: Glyphe ist moeglicherweise zu einfach oder Rendering ist fehlgeschlagen
   - Ueber 15 KB: Glyphe ist moeglicherweise zu komplex (zu viele Ebenen)

**Erwartet:** Frische Icon-Dateien fuer alle Paletten generiert. Dateigroessen im erwarteten Bereich.

**Bei Fehler:** Falls das Build-Skript Fehler ausgibt, die R-Konsolenausgabe auf den spezifischen Fehler pruefen. Haeufige Ursachen: fehlende schliessende Klammer in der Glyphen-Funktion, Referenzierung undefinierter Primitives oder Rueckgabe eines Nicht-Listen-Objekts. Falls das Rendering erfolgreich ist, aber die Ausgabe leer, koennten die Glyphen-Ebenen ausserhalb der Leinwandgrenzen liegen.

### Schritt 5: Vergleichen — Vorher/Nachher-Verifikation

Ueberpruefen, ob die Verbesserung die Zieldimensionen verbessert hat.

1. Alte und neue Renderings vergleichen:
   - Die Cyberpunk-Palettenversion bei Icon- (48px) und Panel-Groesse (160px) betrachten
   - Mindestens 2 weitere Paletten pruefen (eine helle wie Turbo, eine dunkle wie Mako)
2. Die Qualitaetsdimensionen aus Schritt 1 erneut bewerten:
   - Zieldimensionen sollten sich um mindestens 1 Punkt verbessern
   - Nicht-Zieldimensionen sollten sich nicht verschlechtern
3. Falls die Glyphe im Force-Graph verwendet wird, dort testen:
   - HTTP-Server starten: `python3 -m http.server 8080` von `viz/` aus
   - Den Graph laden und den Entitaetsknoten finden
   - Verifizieren, dass das Icon bei Standard-Zoom und beim Hineinzoomen korrekt rendert
4. Die vorgenommenen Aenderungen und die erzielte Verbesserung dokumentieren

**Erwartet:** Messbare Verbesserung auf den Zieldimensionen ohne Verschlechterung bei anderen. Die Glyphe sieht bei beiden Groessen und ueber Paletten hinweg besser aus.

**Bei Fehler:** Falls die Verbesserung marginal ist oder eine Verschlechterung auftritt, die Aenderungen rueckgaengig machen und die Diagnose ueberdenken. Manchmal sind die Einschraenkungen der urspruenglichen Glyphe dem Konzept inhaerent, nicht der Implementierung — in diesem Fall muss moeglicherweise die Metapher selbst geaendert werden (Eskalation zu `create-glyph`).

## Validierungscheckliste

- [ ] Aktuelle Glyphe mit spezifischer Problemdiagnose geprueft
- [ ] Ursache fuer jedes Problem identifiziert
- [ ] Modifikationen auf diagnostizierte Probleme ausgerichtet (nicht ueberarbeitet)
- [ ] Glyphen-Funktionsvertrag beibehalten (Signatur unveraendert)
- [ ] Icons fuer alle Paletten neu gerendert
- [ ] Vorher/Nachher-Vergleich zeigt Verbesserung bei Zieldimensionen
- [ ] Keine Verschlechterung bei Nicht-Zieldimensionen
- [ ] Dateigroessen im erwarteten Bereich (2-15 KB WebP)
- [ ] Glyphe rendert korrekt im Force-Graph-Kontext (falls zutreffend)

## Haeufige Fehler

- **Ueberverbesserung**: Ein Problem beheben und dann alles andere auch noch anpassen. Bei den diagnostizierten Problemen bleiben
- **Vertragsbruch**: Die Funktionssignatur aendern bricht die Rendering-Pipeline. Der 5-Parameter-Vertrag ist unveraenderlich
- **Palettenspezifische Optimierung**: Die Glyphe perfekt fuer Cyberpunk machen, aber schlecht fuer Viridis. Immer 3+ Paletten pruefen
- **Kleingeroessen-Rendering ignorieren**: Ein schoenes 160px-Icon, das bei 48px zum Klecks wird, ist eine gescheiterte Verbesserung
- **Vergessen neu zu rendern**: Die Funktion bearbeiten ohne den Build-Befehl auszufuehren bedeutet, dass die Aenderungen nicht sichtbar sind
- **Falscher Build-Befehl**: Skills verwenden `build-icons.R`, Agents verwenden `build-agent-icons.R`, Teams verwenden `build-team-icons.R`

## Verwandte Skills

- [create-glyph](../create-glyph/SKILL.md) — Eine neue Glyphe von Grund auf erstellen (verwenden, wenn Verbesserung nicht ausreicht)
- [audit-icon-pipeline](../audit-icon-pipeline/SKILL.md) — Erkennen, welche Glyphen in der Pipeline verbessert werden muessen
- [render-icon-pipeline](../render-icon-pipeline/SKILL.md) — Die vollstaendige Rendering-Pipeline nach Verbesserungen ausfuehren
- [ornament-style-mono](../ornament-style-mono/SKILL.md) — Visuelle Gestaltungsprinzipien, die auf Glyphen-Komposition anwendbar sind
- [chrysopoeia](../chrysopoeia/SKILL.md) — Wertextraktionsmethodik parallel zur Glyphen-Optimierung (Gold verstaerken, Schlacke entfernen)
