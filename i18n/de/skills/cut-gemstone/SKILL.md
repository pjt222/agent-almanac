---
name: cut-gemstone
description: >
  Edelsteine mit Cabochon- und Facettiertechniken schleifen. Umfasst
  Rohsteinbewertung, Orientierung fuer optimale Farbe und Ausbeute, Doppen,
  Schnittwinkel und Kronen-/Paviliongeometrie fuer Standard-Brillantschliffe.
  Verwenden wenn rohes Edelsteinmaterial zu einem Cabochon oder facettierten
  Stein geschliffen werden soll, die Schnittorientierung fuer optimale Farbe
  oder optische Phaenomene geplant wird, eine Cabochon- oder Facettiermaschine
  eingerichtet wird, oder der passende Schliffansatz fuer ein bestimmtes
  Material ausgewaehlt werden soll.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: lapidary
  complexity: advanced
  language: natural
  tags: lapidary, cutting, faceting, cabochon, gemstones
  locale: de
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# Edelstein schleifen

Edelsteine aus Rohmaterial mit Cabochon- und Facettiertechniken schleifen, einschliesslich Rohsteinbewertung, Orientierungsplanung, Doppen, Schleifen und Facettiergeometrie.

## Wann verwenden

- Sie haben rohes Edelsteinmaterial und moechten es zu einem fertigen Cabochon oder facettierten Stein schleifen
- Sie muessen die Schnittorientierung fuer optimale Farbe, Ausbeute oder optische Phaenomene planen
- Sie richten eine Cabochon- oder Facettiermaschine zum ersten Mal ein
- Sie moechten Kronen- und Pavilionwinkel fuer Standard-Brillantschliffe verstehen
- Sie muessen den passenden Schliffansatz fuer ein bestimmtes Material auswaehlen

## Eingaben

- **Erforderlich**: Rohes Edelsteinmaterial (bestimmte Art — siehe `identify-gemstone`)
- **Erforderlich**: Entscheidung zum Schliffansatz: Cabochon oder Facettierung
- **Erforderlich**: Zielform und ungefaehre Groesse
- **Optional**: Trimmsaege mit Diamantblatt
- **Optional**: Cabochonmaschine mit 80/220/600/1200/3000 Korn-Scheiben (fuer Cabochons)
- **Optional**: Facettiermaschine mit Indexgetriebe, Mast und Scheibenset (fuer Facettierung)
- **Optional**: Doppwachs oder Epoxid, Doppstaebe, Spirituslampe
- **Optional**: Schablonen (oval, rund, Marquise) in kalibrierten Standardgroessen

## Vorgehensweise

### Schritt 1: Rohsteinbewertung und Sicherheitspruefung

Das Rohmaterial bewerten, bevor mit dem Schleifen begonnen wird.

```
Rough Assessment Checklist:
+--------------------+------------------------------------------+
| Factor             | Assessment                               |
+--------------------+------------------------------------------+
| Species            | Identified? (MANDATORY before cutting)   |
|                    | Toxic dust risk? (check below)           |
+--------------------+------------------------------------------+
| Fractures          | Internal fractures that limit yield?     |
|                    | Will the stone break during cutting?     |
+--------------------+------------------------------------------+
| Colour zones       | Where is the best colour concentrated?   |
|                    | Can the cut centre the colour?           |
+--------------------+------------------------------------------+
| Inclusions         | Large inclusions that should be cut away?|
|                    | Silk for star stones? (orient for star)  |
+--------------------+------------------------------------------+
| Size and shape     | What finished shapes fit this rough?     |
|                    | Calibrated size possible?                |
+--------------------+------------------------------------------+
| Yield estimate     | Approximate finished weight as % of rough|
|                    | Typical: 25-40% for faceting             |
|                    | Typical: 40-60% for cabochons            |
+--------------------+------------------------------------------+

SAFETY — TOXIC DUST MATERIALS:
These minerals produce hazardous dust when cut. Use wet cutting ONLY,
ensure ventilation, and wear an appropriate respirator:
- Chrysotile (asbestos serpentine) — NEVER cut dry
- Malachite — copper carbonate dust is toxic
- Cinnabar — mercury sulfide, extremely toxic
- Orpiment/Realgar — arsenic compounds
- Chrysocolla — copper silicate, moderate risk
- Tiger's eye (fibrous) — fine silica fibers

ALL stone cutting produces silica dust. Always use water cooling
and never grind or cut dry without a dust extraction system.
```

1. Artbestimmung bestaetigen (bei Unsicherheit zuerst `identify-gemstone` ausfuehren)
2. Auf toxisches Staubrisiko pruefen — einige Materialien erfordern zusaetzliche Vorsichtsmassnahmen
3. Auf Risse unter starkem Durchlicht untersuchen
4. Farbzonen und Einschlusslagen kartieren
5. Abschaetzen, welche Fertigformen der Rohstein ergeben kann

**Erwartet:** Eine dokumentierte Rohsteinbewertung mit bestaetigter Art, kartierten Rissen, identifizierten Farbzonen und einem Schliffplan.

**Bei Fehler:** Wenn der Rohstein umfangreiche Risse aufweist, abwaegen, ob er stabilisiert werden kann (Epoxid-Impaergnierung fuer poroeses Material) oder ob die Ausbeute zu gering ist, um das Schleifen zu rechtfertigen. Manches Rohmaterial wird besser als Sammlertueck verkauft oder getauscht.

### Schritt 2: Orientierungsplanung

Die optimale Schnittorientierung fuer Farbe und Phaenomene bestimmen.

```
Orientation Principles by Stone Type:

PLEOCHROIC STONES (tourmaline, sapphire, tanzanite, iolite):
- Orient the table perpendicular to the crystal axis showing
  the best face-up colour
- Tourmaline: the c-axis often shows dark/opaque colour —
  orient the table to view the a/b axis colour
- Sapphire: slight pleochroism — orient for deepest blue face-up
- Tanzanite: trichroic — blue/violet axis preferred for table

STAR STONES (star ruby, star sapphire):
- Silk (rutile needles) must be parallel to the base
- Cut as cabochon with the dome centred over the silk
- The star appears at 90 degrees to the silk orientation

CAT'S EYE STONES (chrysoberyl cat's eye, tiger's eye):
- Fibrous inclusions must run perpendicular to the length
  of an elongated cabochon
- The eye appears as a bright line across the shortest dimension

COLOUR-ZONED MATERIAL (sapphire, ametrine, watermelon tourmaline):
- Position colour zones so they are not visible face-up
- Or feature them intentionally (ametrine, watermelon tourmaline)
```

1. Bestimmen, ob der Stein pleochroisch ist — durch das Dichroskop aus mehreren Richtungen betrachten
2. Bei phaenomenalen Steinen (Stern, Katzenauge) das Einschlussmuster lokalisieren und entsprechend orientieren
3. Bei farbzoniertem Material entscheiden, ob die Zonierung verborgen oder betont werden soll
4. Die Orientierung auf dem Rohstein mit einem Aluminiumstift markieren
5. Tafelposition und Tiefe planen, um die Ausbeute bei der gewaehlten Orientierung zu maximieren

**Erwartet:** Ein markierter Rohstein mit angegebener Tafelrichtung, Orientierung und ungefaehrem Umriss. Der Schliffplan optimiert Farbpraesentation und Ausbeute.

**Bei Fehler:** Wenn die beste Farborientierung mit der maximalen Ausbeute in Konflikt steht, nach Prioritaet entscheiden: Farbqualitaet steigert den Wert fast immer mehr als zusaetzliches Karatgewicht. Im Zweifelsfall nach Farbe orientieren.

### Schritt 3: Cabochonschliff

Einen Edelstein auf einer Cabochonmaschine zu einem gewoelbten Cabochon formen.

```
Cabochon Cutting Sequence:

EQUIPMENT SETUP:
- Cabbing machine with water drip on all wheels
- Wheel sequence: 80, 220, 600, 1200, 3000 (or 1200 + polish)
- Dop sticks and dop wax (or cyanoacrylate adhesive)
- Safety glasses — MANDATORY
- Avoid loose clothing, tie back long hair

STEP-BY-STEP:
1. SLAB: Cut a slab 5-8mm thick through the best area
2. TEMPLATE: Mark the desired outline (oval, round, etc.)
   using a template and aluminum pencil
3. TRIM: Remove excess material on the trim saw or 80-grit wheel
   Cut close to the line but leave 1-2mm margin
4. DOP: Attach the slab to a dop stick with dop wax
   Heat the wax, press the stone flat-side down, centre it
5. SHAPE (80 grit): Grind to the template outline
   Work all the way around, maintaining symmetry
6. DOME (220 grit): Shape the dome profile
   Standard dome height = ~1/3 of the stone's width
   Keep the dome symmetrical — check from all angles
7. SMOOTH (600 grit): Remove 220-grit scratches
   Work systematically, keeping even pressure
8. PRE-POLISH (1200 grit): Remove 600-grit scratches
   The surface should feel smooth to the fingernail
9. FLAT BOTTOM: Remove the stone from the dop, re-dop
   face-down, and grind the bottom flat on 220 → 600 grit
10. POLISH: See polish-gemstone skill for final finishing
```

1. Cabochonmaschine mit Wasserfluss auf allen Scheiben einrichten
2. Schutzbrille aufsetzen — ohne Ausnahme
3. Platte schneiden und Schablonenumriss markieren
4. Stein sicher doppen — ein loser Stein beim Schleifen ist gefaehrlich
5. Auf 80er Korn formen, auf 220er woelben, durch 600er und 1200er glaetten
6. Gleichmaessige Woelbungskruemmung durchgehend beibehalten — ungleichmaessige Woelbungen zeigen nach dem Polieren "flache Stellen"

**Erwartet:** Ein gleichmaessig gewoelbter Cabochon, bereit zum Endpolieren, mit symmetrischem Umriss, gleichmaessiger Woelbungshoehe und keinen sichtbaren Kratzern aus der 1200er-Korn-Phase.

**Bei Fehler:** Wenn die Woelbung flache Stellen oder Asymmetrie aufweist, zum 220er Korn zurueckkehren und nachformen. Besser etwas Material verlieren als eine ungleichmaessige Woelbung zu polieren. Wenn der Stein beim Schleifen vom Dopp abfaellt, sorgfaeltig neu doppen und fortfahren — den Stein zuerst auf Abplatzer pruefen.

### Schritt 4: Facettierung

Praezise geometrische Facetten mit einer Facettiermaschine schleifen.

```
Standard Round Brilliant Angles (quartz-family, RI ~1.54):
+------------------+-------+--------+
| Facet            | Angle | Index  |
+------------------+-------+--------+
| Crown main       | 42°   | 96-index: 3,9,15,21,27,33,39,45 |
| Crown break      | 25°   | (bisect mains)                   |
| Crown star       | 15°   | (bisect breaks toward table)     |
| Table            | 0°    | flat    |
| Pavilion main    | 43°   | 96-index: 3,9,15,21,27,33,39,45 |
| Pavilion break   | Use GemCad or published diagrams           |
+------------------+-------+--------+

Standard Round Brilliant Angles (corundum, RI ~1.76):
+------------------+-------+
| Facet            | Angle |
+------------------+-------+
| Crown main       | 37°   |
| Pavilion main    | 41°   |
+------------------+-------+

CRITICAL: Pavilion angles determine brilliance.
- Too shallow → light leaks through bottom ("windowing")
- Too steep → dark extinction zones
- Correct angle → total internal reflection (brilliance)
```

1. Ein veroeffentlichtes Facettierdiagramm fuer die Zielform und den Material-Brechungsindex auswaehlen
2. Den Rohstein vorbereiten: Pavilionseite planschleifen (die Spitze zeigt nach unten)
3. Den Stein doppen — Kegeldopp fuer runde Steine, Flachdopp fuer andere
4. Pavilion-Facetten zuerst bei den veroeffentlichten Winkeln auf der Grobscheibe (600er Mesh Diamant) schleifen
5. Alle Pavilion-Facetten zu einem praezisen Punkt zusammenfuehren (der "Culet-Meet")
6. Auf einen Kegeldopp uebertragen (oder eine Transfervorrichtung verwenden) um die Krone zu schleifen
7. Kronen-Hauptfacetten, dann Bruchfacetten, dann Sternfacetten schleifen, die Tafel zuletzt anlegen
8. Jede Stufe vorpolieren und polieren (siehe `polish-gemstone` fuer Scheiben- und Poliermittelauswahl)

**Erwartet:** Ein facettierter Edelstein mit praezisen Meets (wo Facettenkanten an einem einzigen Punkt zusammenlaufen), gleichmaessigen Facettengroessen, guter Symmetrie und korrekten Winkeln fuer den Brechungsindex des Materials.

**Bei Fehler:** Wenn Facetten-Meets nicht stimmen, sind die Winkel oder Indexeinstellungen leicht falsch. Das veroeffentlichte Diagramm erneut pruefen. "Meets jagen" (eine Facette anpassen, um eine andere zu korrigieren) verstaerkt Fehler — es ist besser, die Stufe neu zu schleifen, wenn der Fehler gross ist. Kleine Meet-Fehler sind fuer Anfaenger normal und beeintraechtigen die Brillanz nicht wesentlich.

### Schritt 5: Nachschliffinspektion

Den geschliffenen Stein bewerten, bevor zur Endpolitur uebergegangen wird.

1. Den Stein gruendlich reinigen
2. Symmetrie pruefen: von oben betrachten (Umriss), von der Seite (Proportionen) und durch die Tafel (Meet-Praezision)
3. Bei Cabochons: Woelbungsgleichmaessigkeit verifizieren, auf flache Stellen pruefen, gleichmaessige Umrissform sicherstellen
4. Bei facettierten Steinen: Meets unter 10x Lupe pruefen, auf verbliebene Facettenkratzer vom Schleifen achten
5. Endmasse und Gewicht messen
6. Wenn Maengel gefunden werden, zum entsprechenden Schliffschritt zurueckkehren vor dem Polieren

**Erwartet:** Ein vollstaendig geschliffener Stein, der Qualitaetsstandards fuer Symmetrie, Meets und Oberflaechenvorbereitung erfuellt, bereit fuer die Polierphase.

**Bei Fehler:** Wenn signifikante Maengel gefunden werden (schlechte Symmetrie, fehlerhafte Meets, falsche Proportionen), ist es zeiteffizienter, jetzt neu zu schleifen als einen mangelhaften Stein zu polieren und spaeter neu zu schleifen. Dokumentieren, was schiefgelaufen ist, fuer den naechsten Stein.

## Validierung

- [ ] Art bestimmt und toxisches Staubrisiko vor dem Schleifen bewertet
- [ ] Schutzausruestung durchgehend getragen (Augenschutz, Staub-/Spritzschutz)
- [ ] Wasserkuehlung bei allen Schleif- und Schneidvorgaengen aktiv
- [ ] Orientierung fuer optimale Farbe oder Phaenomene geplant
- [ ] Cabochon-Woelbung ist symmetrisch ohne flache Stellen (Cabochon-Pfad)
- [ ] Facetten-Meets laufen ohne signifikanten Versatz in Punkten zusammen (Facettier-Pfad)
- [ ] Endmasse gemessen und dokumentiert
- [ ] Stein ist frei von Schliffkratzern und bereit zum Polieren

## Haeufige Stolperfallen

- **Unidentifizierten Stein schleifen**: Manche Materialien erzeugen giftigen Staub (Malachit, Zinnober, Chrysotil). Immer vor dem Schleifen identifizieren. In jedem Fall Wasserkuehlung verwenden
- **Orientierungsplanung ueberspringen**: Einen pleochroischen Stein ohne Farborientierung zu schleifen kann einen stumpfen oder fehlgefaerbten Stein ergeben, der mit korrekter Orientierung wunderschoen geworden waere
- **Trocken schleifen**: Trockenschliff erzeugt Quarzfeinstaub (chronische Gesundheitsgefahr) und ueberhitzt den Stein (Thermoschock kann ihn brechen). Wasser muss auf allen Scheiben und Laeppen kontinuierlich fliessen
- **Durch Koernungen hetzen**: Von 220er auf 1200er Korn zu springen hinterlaesst tiefe Kratzer, die nach dem Polieren sichtbar werden. Jede Koernstufe muss die Kratzer der vorherigen Stufe vollstaendig entfernen
- **Doppversagen**: Ungenuegene Dopphaftung laesst den Stein sich verschieben oder beim Schleifen wegfliegen. Genuegend Wachs verwenden, sicherstellen, dass der Stein warm ist (nicht kalt), und den Dopp vor dem Schleifen vollstaendig abkuehlen lassen

## Verwandte Skills

- `identify-gemstone` — Artbestimmung ist vor Beginn des Schleifens erforderlich
- `polish-gemstone` — Der naechste Schritt nach dem Schleifen, umfasst Scheibenauswahl, Poliermittelwahl und Endbearbeitung
