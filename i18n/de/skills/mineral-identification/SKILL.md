---
name: mineral-identification
description: >
  Feldbestimmung von Mineralen und Erzen anhand von Haerte, Strichfarbe, Glanz,
  Spaltbarkeit, Kristallhabitus und einfachen chemischen Tests. Umfasst das
  systematische Ausschlussverfahren, Mohs-Skala-Anwendung und gaengige
  Erzindikatoren fuer Edelmetalle, Edelsteine und Industrieminerale. Verwenden
  beim Antreffen eines unbekannten Gesteins- oder Mineralexemplars, beim
  Prospektieren und Bewerten, ob ein Standort wertvolle Mineralindikatoren
  zeigt, beim Unterscheiden von erzfuehrendem Gestein von taubem Gestein im
  Feld oder beim Aufbau geologischer Kompetenz durch systematische Beobachtung.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: prospecting
  complexity: intermediate
  language: natural
  tags: prospecting, minerals, geology, identification, hardness, streak, field-geology
  locale: de
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# Mineralbestimmung

Minerale im Feld anhand physikalischer Eigenschaften, systematischem Ausschlussverfahren und einfachen Feldtests identifizieren.

## Wann verwenden

- Sie finden ein unbekanntes Gesteins- oder Mineralexemplar und moechten es identifizieren
- Sie prospektieren und muessen bewerten, ob ein Standort Indikatoren fuer wertvolle Minerale zeigt
- Sie moechten erzfuehrendes Gestein von taubem Gestein im Feld unterscheiden
- Sie bauen geologische Kompetenz durch systematische Beobachtung auf

## Eingaben

- **Erforderlich**: Ein Mineralexemplar oder Aufschluss zur Untersuchung
- **Optional**: Strichplatte (unglasierte Porzellanfliese oder Rueckseite einer Badezimmerfliese)
- **Optional**: Stahlnagel oder Messerklinge (Haerte ~5,5)
- **Optional**: Glasplatte (Haerte ~5,5)
- **Optional**: Kupfermuenze (Haerte ~3,5)
- **Optional**: Handlupe (10x)
- **Optional**: Verduennte Salzsaeure (10% HCl) fuer Karbonattest

## Vorgehensweise

### Schritt 1: Beobachten ohne Beruehren

Vor dem Anfassen das Exemplar im Kontext beobachten.

```
Field Context:
+--------------------+------------------------------------------+
| Observation        | Record                                   |
+--------------------+------------------------------------------+
| Host rock          | What type of rock is it in/on?           |
|                    | (granite, basite, sandstone, schist...)   |
+--------------------+------------------------------------------+
| Geological setting | Vein, disseminated, massive, placer,     |
|                    | weathering surface, cave deposit          |
+--------------------+------------------------------------------+
| Associated         | What other minerals are nearby?           |
| minerals           | (quartz veins often host gold; iron       |
|                    | staining suggests oxidation zone)        |
+--------------------+------------------------------------------+
| Crystal form       | Visible crystals? Habit? Size?           |
| (if visible)       | (cubic, prismatic, tabular, massive)     |
+--------------------+------------------------------------------+
```

**Erwartet:** Feldkontext vor dem Anfassen des Exemplars erfasst.

**Bei Fehler:** Wenn der geologische Kontext unklar ist (loses Exemplar, staedtischer Fund), nur mit physikalischen Eigenschaften fortfahren — der Kontext haette geholfen, Kandidaten einzugrenzen, ist aber nicht zwingend erforderlich.

### Schritt 2: Physikalische Eigenschaften testen

Die diagnostischen Tests systematisch anwenden.

```
Diagnostic Property Tests:

LUSTER (how it reflects light):
- Metallic: reflects like metal (pyrite, galena, gold)
- Vitreous: glassy (quartz, feldspar)
- Pearly: like a pearl (muscovite, talc surfaces)
- Silky: like silk fibers (asbestos, satin spar gypsum)
- Earthy/dull: no reflection (kaolin, limonite)
- Adamantine: brilliant, diamond-like (diamond, zircon)

HARDNESS (Mohs scale — scratch test):
+------+-----------+----------------------------------+
| Mohs | Reference | Can Be Scratched By              |
+------+-----------+----------------------------------+
| 1    | Talc      | Fingernail                       |
| 2    | Gypsum    | Fingernail (barely)              |
| 3    | Calcite   | Copper coin                      |
| 4    | Fluorite  | Steel nail (easily)              |
| 5    | Apatite   | Steel nail (just)                |
| 6    | Feldspar  | Steel nail cannot scratch        |
| 7    | Quartz    | Scratches glass                  |
| 8    | Topaz     | Scratches quartz                 |
| 9    | Corundum  | Scratches topaz                  |
| 10   | Diamond   | Scratches everything             |
+------+-----------+----------------------------------+

Test: try to scratch the specimen with each reference tool,
starting from soft to hard. The hardness is between the tool
that fails and the tool that succeeds.

STREAK (powder colour on porcelain):
- Drag the specimen firmly across an unglazed porcelain tile
- Record the colour of the powder line
- Streak colour is often different from specimen colour
- Critical: hematite is grey-black but streaks RED
- Critical: pyrite is gold but streaks BLACK
- Minerals harder than the streak plate (~7) will not leave a streak

CLEAVAGE AND FRACTURE:
- Cleavage: breaks along flat planes (mica: 1 direction, feldspar: 2)
- Fracture: breaks irregularly (conchoidal = curved like glass, uneven, fibrous)
- Note number of cleavage directions and angles between them

SPECIFIC GRAVITY (heft test):
- Hold the specimen and assess: does it feel heavier or lighter
  than expected for its size?
- Heavy: possible metallic ore (galena, gold, magnetite)
- Light: possible pumice, sulfur, or organic material
```

**Erwartet:** Ein Profil des Exemplars: Glanz, Haertebereich, Strichfarbe, Spaltbarkeits-/Bruchtyp und relative Dichte.

**Bei Fehler:** Wenn eine Eigenschaft mehrdeutig ist (z.B. Glanz zwischen metallisch und glasig — „halbmetallisch"), beide Optionen erfassen. Mehrdeutigkeit verringert die Konfidenz, verhindert aber nicht die Bestimmung.

### Schritt 3: Spezialtests anwenden

Zusaetzliche Tests fuer bestimmte Mineralgruppen.

```
Special Field Tests:

MAGNETISM:
- Hold a magnet near the specimen
- Strong attraction: magnetite (or possibly pyrrhotite)
- Weak attraction: some iron-bearing minerals

ACID TEST (10% HCl):
- Drop acid on the specimen surface
- Vigorous fizzing: calcite (CaCO3)
- Fizzing on powder only: dolomite (scratch surface first, then apply acid)
- No fizzing: not a carbonate

TASTE (only for suspected halite):
- Salty taste: halite (NaCl)
- Do NOT taste unknown minerals generally — some are toxic

SMELL:
- Sulfur: rotten egg smell (sulfides when scratched)
- Clay: earthy "petrichor" smell when breathed on (clay minerals)

TENACITY:
- Brittle: shatters when struck (most silicates)
- Malleable: deforms without breaking (gold, copper, silver)
- Flexible: bends and stays (chlorite, some micas)
- Elastic: bends and springs back (muscovite mica)
```

**Erwartet:** Zusaetzliche diagnostische Daten, die die Bestimmung weiter eingrenzen.

**Bei Fehler:** Wenn Spezialtests nicht verfuegbar sind (kein Magnet, keine Saeure), mit den grundlegenden Eigenschaften fortfahren — sie genuegen fuer die meisten gaengigen Minerale.

### Schritt 4: Durch Ausschlussverfahren identifizieren

Das Eigenschaftsprofil mit bekannten Mineralen abgleichen.

```
Common Mineral Identification Key (simplified):

METALLIC LUSTER:
- Black streak + hard (6+) + cubic crystals = PYRITE
- Black streak + soft (2.5) + heavy + cubic = GALENA
- Red-brown streak + hard (5-6) + heavy = HEMATITE
- Yellow streak + soft (1.5-2.5) + yellow = GOLD (if malleable)
  or CHALCOPYRITE (if brittle, harder, green-black streak)
- Black streak + magnetic = MAGNETITE

NON-METALLIC, LIGHT-COLORED:
- Vitreous + hard (7) + conchoidal fracture = QUARTZ
- Vitreous + hard (6) + 2 cleavage planes = FELDSPAR
- Vitreous + soft (3) + fizzes in acid = CALCITE
- Pearly + very soft (1) + greasy feel = TALC
- Vitreous + soft (2) + 1 perfect cleavage = GYPSUM

NON-METALLIC, DARK-COLORED:
- Vitreous + hard (5-6) + 2 cleavage at ~90 degrees = PYROXENE
- Vitreous + hard (5-6) + 2 cleavage at ~60/120 degrees = AMPHIBOLE
- Vitreous + soft (2.5-3) + 1 perfect cleavage + flexible = BIOTITE (mica)
```

**Erwartet:** Eine Mineralbestimmung oder eine Auswahlliste von 2-3 Kandidaten mit dem zur Unterscheidung notwendigen Test.

**Bei Fehler:** Wenn das Exemplar keinem gaengigen Mineral entspricht, kann es sich um ein Gestein (Mineralgemenge) statt um ein einzelnes Mineral handeln, oder es erfordert moeglicherweise Laboranalyse (Duennschliff, XRD).

## Validierung

- [ ] Feldkontext wurde vor dem Anfassen erfasst
- [ ] Glanz wurde unter natuerlichem Licht bewertet
- [ ] Haerte wurde gegen mindestens zwei Referenzmaterialien getestet
- [ ] Strichfarbe wurde erfasst (wenn Exemplar weicher als Strichplatte)
- [ ] Spaltbarkeits- oder Bruchmuster wurde notiert
- [ ] Bestimmung wurde durch systematisches Ausschlussverfahren erreicht, nicht durch Raten
- [ ] Verwechslungsminerale wurden explizit in Betracht gezogen und differenziert

## Haeufige Stolperfallen

- **Pyrit mit Gold verwechseln**: „Katzengold" (Pyrit) ist haerter (6 vs. 2,5), sproede (Gold ist formbar) und hat schwarzen Strich (Gold hat goldenen Strich). Die Tests sind beweisend — sie verwenden
- **Strichfarbe ignorieren**: Exemplarfarbe ist unzuverlaessig (Haematit kann grau, rot oder schwarz sein). Strichfarbe ist konsistent und diagnostisch
- **Mit verunreinigten Werkzeugen ritzen**: Ein Stahlnagel mit Rost erzeugt einen falschen Strich. Testwerkzeuge vor Gebrauch reinigen
- **Kristallhabitus voraussetzen**: Viele Minerale zeigen im Feld selten gut ausgebildete Kristalle. Massive oder koernige Formen sind haeufiger — keine sichtbaren Kristalle fuer die Bestimmung voraussetzen
- **Verwitterte Oberflaeche mit wahrer Farbe verwechseln**: Das Exemplar aufschlagen, um eine frische Oberflaeche freizulegen, bevor getestet wird. Verwitterungsrinden koennen das darunter liegende Mineral vollstaendig verbergen

## Verwandte Skills

- `gold-washing` — Alluviale Goldgewinnung nutzt Mineralbestimmungsfaehigkeiten, um Bachablagerungen zu lesen und goldfuehrende Kiese zu bewerten
