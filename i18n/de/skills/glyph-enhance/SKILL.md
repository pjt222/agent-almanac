---
name: glyph-enhance
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude
translation_date: "2026-03-17"
description: >
  Ein bestehendes R-basiertes Piktogramm-Glyph fuer die Visualisierungsebene
  verbessern. Umfasst visuelle Pruefung des aktuellen Glyphs, Diagnose
  spezifischer Probleme (Proportionen, Lesbarkeit, Glow-Balance), gezielte
  Aenderungen an der Glyph-Funktion, Neu-Rendering und Vorher/Nachher-Vergleich.
  Anwenden wenn ein Glyph bei kleinen Groessen schlecht rendert, seine visuelle
  Metapher unklar ist, es Proportionsprobleme gibt, der Neon-Glow-Effekt
  unausgewogen ist, oder nach dem Hinzufuegen neuer Paletten oder Aenderungen
  an der Rendering-Pipeline.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: design
  complexity: intermediate
  language: R
  tags: design, glyph, enhancement, icon, ggplot2, visualization, refinement
---

# Glyph verbessern

Ein bestehendes Piktogramm-Glyph in der `viz/`-Visualisierungsebene verbessern — aktuelles Rendering pruefen, visuelle Probleme diagnostizieren, gezielte Aenderungen anwenden, neu rendern und Vorher/Nachher vergleichen.

## Wann verwenden

- Ein Glyph rendert bei kleinen Groessen schlecht (Details gehen verloren, Formen verschmelzen)
- Die visuelle Metapher eines Glyphs ist unklar oder passt nicht zum dargestellten Skill
- Ein Glyph hat Proportionsprobleme (zu gross, zu klein, nicht zentriert)
- Der Neon-Glow-Effekt ueberstrahlt das Glyph oder wirkt zu schwach
- Ein Glyph sieht in einer Palette gut, in anderen aber schlecht aus
- Stapelverbesserung nach dem Hinzufuegen neuer Paletten oder Aenderungen an der Rendering-Pipeline

## Eingaben

- **Erforderlich**: Skill-ID des zu verbessernden Glyphs (z.B. `commit-changes`)
- **Erforderlich**: Konkretes Problem (Lesbarkeit, Proportionen, Glow, Palettenkompatibilitaet)
- **Optional**: Referenz-Glyph das die gewuenschte Qualitaetsstufe demonstriert
- **Optional**: Zielpalette(n) fuer die Optimierung (Standard: alle Paletten)

## Vorgehensweise

### Schritt 1: Pruefung — Aktuellen Zustand bewerten

Das aktuelle Glyph untersuchen und spezifische Probleme identifizieren.

1. Die Glyph-Funktion finden:
   - Skill-Glyphs: `viz/R/primitives*.R` und zugeordnet in `viz/R/glyphs.R`
   - Agent-Glyphs: `viz/R/agent_primitives.R` und zugeordnet in `viz/R/agent_glyphs.R`
2. Die Glyph-Funktion lesen um ihre Struktur zu verstehen:
   - Wie viele Ebenen verwendet sie?
   - Welche Primitive ruft sie auf (aus `primitives.R`, `primitives_2.R` usw.)?
   - Was sind die Skalierungsfaktoren und Positionierungen?
3. Die gerenderte Ausgabe betrachten:
   - `viz/public/icons/cyberpunk/<domain>/<skillId>.webp` als Referenzpalette pruefen
   - Wenn verfuegbar, 2-3 weitere Paletten fuer palettenuebergreifendes Rendering pruefen
   - Sowohl bei Icon-Groesse (~48px im Graph) als auch bei Panel-Groesse (~160px im Detailpanel) betrachten
4. Das Glyph auf den **Qualitaetsdimensionen** bewerten:

```
Glyph-Qualitaetsdimensionen:
+-------------------+------+-----------------------------------------------+
| Dimension         | 1-5  | Bewertungskriterien                           |
+-------------------+------+-----------------------------------------------+
| Lesbarkeit        |      | Bei 48px erkennbar? Bei 160px klar?           |
| Proportionen      |      | Gut zentriert? Gute Nutzung der 100x100-Fl.?  |
| Metapher          |      | Stellt die Form den Skill klar dar?           |
| Glow-Balance      |      | Glow verstaerkt ohne zu ueberstrahlen?        |
| Palettenkompatib. |      | Sieht gut aus ueber cyberpunk + viridis?      |
| Komplexitaet      |      | Angemessene Ebenenzahl (nicht zu voll/leer)?  |
+-------------------+------+-----------------------------------------------+
```

5. Die 1-2 Dimensionen mit den niedrigsten Werten identifizieren — das sind die Verbesserungsziele

**Erwartet:** Eine klare Diagnose dessen was am Glyph nicht stimmt und welche Dimensionen verbessert werden sollen. Die Pruefung sollte spezifisch sein: "Proportionen: Glyph nutzt nur 40% der Flaeche" nicht "sieht schlecht aus."

**Bei Fehler:** Wenn die Glyph-Funktion fehlt oder der Skill nicht in `glyphs.R` ist, wurde das Glyph moeglicherweise noch nicht erstellt — stattdessen `create-skill-glyph` verwenden.

### Schritt 2: Diagnose — Ursachenanalyse

Feststellen warum die identifizierten Probleme bestehen.

1. Bei **Lesbarkeitsproblemen**:
   - Zu viele feine Details die bei kleinen Groessen verschmelzen?
   - Unzureichender Kontrast zwischen Glyph-Elementen?
   - Linien zu duenn (< 1.5 `size` bei s=1.0)?
   - Elemente zu nah beieinander?
2. Bei **Proportionsproblemen**:
   - Skalierungsfaktor `s` zu klein oder zu gross?
   - Zentrumsversatz von (50, 50)?
   - Elemente die ueber den sicheren Bereich (10-90) hinausragen?
3. Bei **Glow-Problemen**:
   - Glyph-Strichbreite interagiert mit `ggfx::with_outer_glow()`:
     - Duenne Linien: Glow macht sie unscharf
     - Dicke Fuellungen: Glow erzeugt uebermassige Ausstrahlung
   - Mehrere ueberlappende Elemente: zusammengesetzter Glow erzeugt Hotspots
4. Bei **Palettenkompatibilitaetsproblemen**:
   - Glyph verwendet hartcodierte Farben statt `col`/`bright`-Parametern?
   - Kontrastarme Paletten (cividis, mako) machen das Glyph unsichtbar?
   - Das Glyph basiert auf Farbvariation die manche Paletten nicht bieten?
5. Die spezifische Ursache fuer jedes Problem dokumentieren

**Erwartet:** Ursachen die direkt auf Codeaenderungen hinweisen. "Das Glyph ist zu klein" -> "Skalierungsfaktor ist 0.6, sollte aber 0.8 sein." "Glow ueberstrahlt" -> "drei ueberlappende gefuellte Polygone erzeugen jeweils Glow."

**Bei Fehler:** Wenn die Ursache aus der Code-Inspektion nicht offensichtlich ist, das Glyph isoliert mit verschiedenen Parametern rendern um das Problem einzugrenzen. `render_glyph()` mit einem einzelnen Glyph zum Testen verwenden.

### Schritt 3: Aendern — Gezielte Korrekturen anwenden

Die Glyph-Funktion bearbeiten um die diagnostizierten Probleme zu beheben.

1. Die Datei mit der Glyph-Funktion oeffnen
2. Aenderungen spezifisch zur Diagnose anwenden:
   - **Skalierung/Proportionen**: `s`-Multiplikator oder Element-Offsets anpassen
   - **Lesbarkeit**: Komplexe Elemente vereinfachen, Strichbreite erhoehen, Abstaende hinzufuegen
   - **Glow-Balance**: Ueberlappende Fuellflaechen reduzieren, Konturen statt Fuellungen verwenden wo diese Ausstrahlung erzeugen
   - **Palettenkompatibilitaet**: Sicherstellen dass alle Farben von `col`/`bright`-Parametern abgeleitet werden, Alpha fuer Tiefe hinzufuegen
3. Den **Glyph-Funktionsvertrag** einhalten:
   ```r
   glyph_name <- function(cx, cy, s, col, bright) {
     # cx, cy = Zentrum (50, 50)
     # s = Skalierung (1.0 = ~70% der Flaeche)
     # col = Domainfarbe, bright = aufgehellte Variante
     # Rueckgabe: list() von ggplot2-Ebenen
   }
   ```
4. Die Funktionssignatur beibehalten — Parameter nicht aendern
5. Aenderungen minimal halten: die diagnostizierten Probleme beheben, nicht das gesamte Glyph neu gestalten

**Erwartet:** Eine modifizierte Glyph-Funktion die die in Schritt 1-2 identifizierten spezifischen Probleme behebt. Aenderungen sind gezielt und minimal — verbessern, nicht neu gestalten.

**Bei Fehler:** Wenn die Aenderungen andere Dimensionen verschlechtern (z.B. Proportionenfix beeintraechtigt Lesbarkeit), Aenderungen rueckgaengig machen und einen anderen Ansatz versuchen. Wenn das Glyph eine komplette Neugestaltung braucht, stattdessen `create-skill-glyph` verwenden.

### Schritt 4: Neu-Rendering — Aktualisierte Icons generieren

Das modifizierte Glyph rendern und die Korrektur verifizieren.

1. Das spezifische Glyph ueber die Build-Pipeline neu rendern:
   ```bash
   cd /mnt/d/dev/p/agent-almanac/viz
   Rscript build-icons.R --only <domain> --no-cache
   ```
   Fuer Agent-Glyphs:
   ```bash
   Rscript build-agent-icons.R --only <agent-id> --no-cache
   ```
2. Verifizieren dass die Ausgabedateien existieren:
   - `viz/public/icons/<palette>/<domain>/<skillId>.webp` fuer jede Palette
3. Dateigroessen pruefen — Icons sollten 2-15 KB (WebP) sein:
   - Unter 2 KB: Glyph ist moeglicherweise zu einfach oder Rendering fehlgeschlagen
   - Ueber 15 KB: Glyph ist moeglicherweise zu komplex (zu viele Ebenen)

**Erwartet:** Frische Icon-Dateien fuer alle Paletten generiert. Dateigroessen im erwarteten Bereich.

**Bei Fehler:** Wenn `build-icons.R` Fehler wirft, die R-Konsolenausgabe auf den spezifischen Fehler pruefen. Haeufige Ursachen: fehlende schliessende Klammer in der Glyph-Funktion, Verweis auf undefinierte Primitive, oder Rueckgabe eines Nicht-list-Typs aus der Funktion. Wenn das Rendering erfolgreich ist aber die Ausgabe leer, liegen die Glyph-Ebenen moeglicherweise ausserhalb der Flaechengrenzen.

### Schritt 5: Vergleichen — Vorher/Nachher-Verifizierung

Verifizieren dass die Verbesserung die Zieldimensionen verbessert hat.

1. Alte und neue Renderings vergleichen:
   - Die Cyberpunk-Palettenversion sowohl bei Icon- (48px) als auch bei Panel-Groesse (160px) betrachten
   - Mindestens 2 weitere Paletten betrachten (eine helle wie turbo, eine dunkle wie mako)
2. Die Qualitaetsdimensionen aus Schritt 1 neu bewerten:
   - Zieldimensionen sollten sich um mindestens 1 Punkt verbessern
   - Nicht-Zieldimensionen sollten nicht abnehmen
3. Wenn das Glyph im Force-Graph verwendet wird, dort testen:
   - HTTP-Server starten: `python3 -m http.server 8080` aus `viz/`
   - Den Graphen laden und den Skill-Knoten finden
   - Verifizieren dass das Icon bei Standard-Zoom und beim Hineinzoomen korrekt rendert
4. Die vorgenommenen Aenderungen und die erzielte Verbesserung dokumentieren

**Erwartet:** Messbare Verbesserung bei den Zieldimensionen ohne Regression bei anderen. Das Glyph sieht bei beiden Groessen und ueber Paletten hinweg besser aus.

**Bei Fehler:** Wenn die Verbesserung marginal ist oder eine Regression auftritt, die Aenderungen rueckgaengig machen und die Diagnose ueberdenken. Manchmal sind die Einschraenkungen des urspruenglichen Glyphs der Metapher inhaerent, nicht der Implementierung — in diesem Fall muss moeglicherweise die Metapher selbst geaendert werden (an `create-skill-glyph` eskalieren).

## Validierung

- [ ] Aktuelles Glyph mit spezifischer Problemdiagnose geprueft
- [ ] Ursache fuer jedes Problem identifiziert
- [ ] Aenderungen gezielt auf diagnostizierte Probleme (nicht ueberarbeitet)
- [ ] Glyph-Funktionsvertrag beibehalten (Signatur unveraendert)
- [ ] Icons fuer alle Paletten neu gerendert
- [ ] Vorher/Nachher-Vergleich zeigt Verbesserung bei Zieldimensionen
- [ ] Keine Regression bei Nicht-Zieldimensionen
- [ ] Dateigroessen im erwarteten Bereich (2-15 KB WebP)
- [ ] Glyph rendert korrekt im Force-Graph-Kontext (falls zutreffend)

## Haeufige Stolperfallen

- **Ueberverbesserung**: Ein Problem beheben und dann alles andere noch anpassen. Bei den diagnostizierten Problemen bleiben
- **Vertragsbruch**: Die Funktionssignatur aendern bricht die Rendering-Pipeline. Der 5-Parameter-Vertrag ist unveraenderlich
- **Palettenspezifische Optimierung**: Das Glyph perfekt fuer Cyberpunk machen aber schlecht fuer Viridis. Immer 3+ Paletten pruefen
- **Rendering bei kleiner Groesse ignorieren**: Ein schoenes 160px-Icon das bei 48px zu einem Klecks wird ist eine fehlgeschlagene Verbesserung
- **Vergessen neu zu rendern**: Die Funktion bearbeiten ohne `build-icons.R` auszufuehren bedeutet dass die Aenderungen nicht sichtbar sind

## Verwandte Skills

- `create-skill-glyph` — Ein neues Glyph von Grund auf erstellen (verwenden wenn Verbesserung nicht ausreicht)
- `ornament-style-mono` — Visuelle Designprinzipien die auf Glyph-Komposition anwendbar sind
- `chrysopoeia` — Wertextraktionsmethodik parallelt Glyph-Optimierung (Gold verstaerken, Schlacke entfernen)
