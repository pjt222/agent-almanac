---
name: identify-gemstone
description: >
  Edelsteine anhand optischer Eigenschaften, physikalischer Tests und
  Einschlussanalyse identifizieren. Umfasst Brechungsindex, spezifisches
  Gewicht, Pleochroismus, Spektroskopie-Indikatoren und Erkennung gaengiger
  Simulanten. Verwenden beim Identifizieren eines unbekannten Edelsteins,
  beim Ueberpruefen der Artangabe eines Verkaeufers, beim Unterscheiden
  natuerlicher Steine von Simulanten oder Synthesen, beim Aufbau
  gemmologischer Kompetenz durch strukturierte Beobachtung oder beim
  Identifizieren von Rohmaterial vor dem Schleifen zur sicheren Handhabung.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: lapidary
  complexity: intermediate
  language: natural
  tags: lapidary, gemstones, identification, mineralogy, optics
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Edelstein identifizieren

Edelsteine anhand systematischer physikalischer und optischer Eigenschaftstests, Einschlussanalyse und Ausschlussverfahren gegen bekannte Artprofile identifizieren.

## Wann verwenden

- Sie haben einen unbekannten Edelstein oder vermuteten Edelstein und moechten die Art bestimmen
- Sie muessen die Artangabe eines Verkaeufers ueberpruefen
- Sie moechten einen natuerlichen Edelstein von einem gaengigen Simulanten oder einer Synthese unterscheiden
- Sie bauen gemmologische Kompetenz durch strukturierte Beobachtung und Tests auf
- Sie muessen Rohmaterial vor dem Schleifen identifizieren, um sichere Handhabung zu gewaehrleisten

## Eingaben

- **Erforderlich**: Ein Edelstein-Exemplar (loser Stein bevorzugt; gefasste Steine schraenken die Testmoeglichkeiten ein)
- **Optional**: Refraktometer mit Kontaktfluessigkeit (RI-Fluessigkeit, 1,81 Standard)
- **Optional**: Dichroskop (fuer Pleochroismus-Tests)
- **Optional**: Chelsea-Farbfilter
- **Optional**: Hydrostatische Waage oder schwere Fluessigkeiten
- **Optional**: 10x Lupe oder gemmologisches Mikroskop
- **Optional**: UV-Lampe (Langwelle 365nm und Kurzwelle 254nm)
- **Optional**: Polariskop (fuer optische Charakterbestimmung)

## Vorgehensweise

### Schritt 1: Visuelle Inspektion

Das Exemplar mit blossem Auge und anschliessend unter 10-facher Vergroesserung untersuchen.

```
Visual Inspection Checklist:
+--------------------+------------------------------------------+
| Observation        | Record                                   |
+--------------------+------------------------------------------+
| Colour             | Hue (red, blue, green...), saturation    |
|                    | (vivid, moderate, weak), tone            |
|                    | (light, medium, dark)                    |
+--------------------+------------------------------------------+
| Transparency       | Transparent, translucent, opaque         |
+--------------------+------------------------------------------+
| Luster             | Adamantine, vitreous, waxy, pearly,      |
|                    | silky, resinous                          |
+--------------------+------------------------------------------+
| Cut style          | Faceted, cabochon, carved, rough         |
+--------------------+------------------------------------------+
| Estimated size     | Approximate dimensions (mm) and weight   |
+--------------------+------------------------------------------+
| Surface condition  | Scratches, chips, abrasion, wear pattern |
+--------------------+------------------------------------------+
| Phenomena          | Star (asterism), cat's eye               |
|                    | (chatoyancy), play of colour, colour     |
|                    | change, adularescence                    |
+--------------------+------------------------------------------+
```

1. Die Koerperfarbe unter tageslichtaequivalenter Beleuchtung (5500-6500K) notieren
2. Auf Farbzonierung pruefen, indem der Stein aus verschiedenen Winkeln betrachtet wird
3. Transparenz und Glanz bewerten — diese grenzen die Kandidatenliste sofort ein
4. Nach optischen Phaenomenen suchen (Stern, Katzenauge, Farbspiel)
5. Alle ohne Vergroesserung sichtbaren Einschluesse erfassen

**Erwartet:** Ein vollstaendiges visuelles Profil einschliesslich Farbe, Transparenz, Glanz und etwaiger Phaenomene. Dies allein grenzt die Kandidaten auf eine handhabbare Auswahlliste ein.

**Bei Fehler:** Wenn die Beleuchtung schlecht ist (gelbliches Raumlicht), die Einschraenkung notieren. Tageslicht oder tageslichtaequivalente Leuchtmittel werden dringend empfohlen. Gluehlampen verschieben die Farbwahrnehmung und koennen zur Fehlidentifikation von Farbwechselsteinen fuehren.

### Schritt 2: Physikalische Eigenschaftstests

Messbare physikalische Eigenschaften testen, um die Identifikation einzugrenzen.

```
Key Physical Properties:
+--------------------+------------------------------------------+
| Property           | Method                                   |
+--------------------+------------------------------------------+
| Hardness (Mohs)    | Scratch test against reference minerals  |
|                    | or hardness pencils. CAUTION: Do NOT     |
|                    | scratch faceted gemstones — use other    |
|                    | tests instead for cut stones             |
+--------------------+------------------------------------------+
| Specific gravity   | Hydrostatic weighing:                    |
| (SG)               | SG = weight in air / (weight in air -    |
|                    | weight in water)                         |
|                    |                                          |
|                    | Common SG values:                        |
|                    | Quartz: 2.65                             |
|                    | Beryl: 2.68-2.74                         |
|                    | Tourmaline: 3.02-3.26                    |
|                    | Topaz: 3.53                              |
|                    | Corundum: 3.99-4.01                      |
|                    | Zircon: 4.60-4.73                        |
|                    | CZ: 5.65-5.95                            |
+--------------------+------------------------------------------+
| Heft               | Does the stone feel heavier or lighter   |
|                    | than expected for its size?              |
|                    | CZ and zircon feel noticeably heavy      |
|                    | Quartz and glass feel average            |
+--------------------+------------------------------------------+
```

1. Bei Rohmaterial: Haerte anhand von Mohs-Skala-Referenzpunkten testen
2. Bei geschliffenen Steinen: Spezifisches Gewicht mit hydrostatischer Methode messen
3. Die Haptik bewerten — erfahrene Pruefer koennen CZ von Diamant allein am Gewicht unterscheiden
4. Alle an der Oberflaeche sichtbaren Spaltflaechen notieren

**Erwartet:** Haertebereich (bei Rohmaterial) oder SG-Wert (bei geschliffenen Steinen), der zwischen Kandidatenarten differenziert. SG ist oft die aussagekraeftigste Einzeldiagnostik fuer geschliffene Steine.

**Bei Fehler:** Wenn keine hydrostatische Waage verfuegbar ist, den Haptik-Test als grobe Orientierung verwenden. Steine, die sich „zu schwer fuer ihre Groesse" anfuehlen, haben wahrscheinlich ein hohes SG (>3,5). Wenn ein Haertetest den geschliffenen Stein beschaedigen wuerde, zu den optischen Tests springen.

### Schritt 3: Optische Tests

Gemmologische optische Instrumente fuer definitive Eigenschaften anwenden.

```
Optical Property Tests:
+--------------------+------------------------------------------+
| Test               | What It Reveals                          |
+--------------------+------------------------------------------+
| Refractive Index   | Measured on refractometer with RI fluid  |
| (RI)               | Diagnostic for most species:             |
|                    | Quartz: 1.544-1.553                      |
|                    | Beryl: 1.577-1.583                       |
|                    | Tourmaline: 1.624-1.644                  |
|                    | Topaz: 1.609-1.617                       |
|                    | Corundum: 1.762-1.770                    |
|                    | Spinel: 1.718                            |
|                    | Diamond: 2.417 (OTL on refractometer)    |
|                    | CZ: 2.15 (OTL on refractometer)          |
+--------------------+------------------------------------------+
| Birefringence      | Difference between high and low RI       |
| (BR)               | Quartz: 0.009                            |
|                    | Corundum: 0.008                          |
|                    | Tourmaline: 0.018-0.020                  |
|                    | Singly refractive: 0 (spinel, garnet,    |
|                    | diamond)                                 |
+--------------------+------------------------------------------+
| Pleochroism        | Colour variation with crystal direction  |
| (dichroscope)      | Strong: tourmaline, tanzanite, iolite    |
|                    | Moderate: corundum, topaz                |
|                    | None: singly refractive stones           |
+--------------------+------------------------------------------+
| Optic character    | Singly refractive (SR), doubly           |
| (polariscope)      | refractive (DR), aggregate (AGG)         |
+--------------------+------------------------------------------+
| UV fluorescence    | Long-wave and short-wave UV response     |
|                    | Diamond: often blue (LWUV)               |
|                    | Ruby: strong red (LWUV)                  |
|                    | Emerald: usually inert                   |
+--------------------+------------------------------------------+
| Chelsea filter     | Transmits deep red and yellow-green      |
|                    | Emerald (Cr): appears red/pink           |
|                    | Aquamarine: appears green                |
|                    | Blue synthetic spinel: appears red       |
+--------------------+------------------------------------------+
```

1. RI am Refraktometer messen — sowohl hohe als auch niedrige Ablesung fuer die Doppelbrechung nehmen
2. Pleochroismus mit Dichroskop testen — langsam drehen und Farbwechsel notieren
3. Optischen Charakter am Polariskop pruefen (SR vs. DR vs. AGG)
4. UV-Fluoreszenz unter Langwelle und Kurzwelle testen
5. Chelsea-Filter verwenden, wenn chromgefaerbte Steine vermutet werden

**Erwartet:** RI-Wert (auf 0,001), Doppelbrechung, optischer Charakter, Pleochroismus-Beschreibung und UV-Reaktion. Zusammen mit Schritt 2 identifiziert dies die meisten Edelsteinarten definitiv.

**Bei Fehler:** Wenn der RI ueber der Messgrenze liegt (OTL, >1,81), handelt es sich wahrscheinlich um Diamant, CZ, Zirkon (Hochtyp) oder eine Synthese mit hohem RI. SG und Waermeleitfaehigkeit zur Differenzierung verwenden. Wenn kein Refraktometer verfuegbar ist, auf SG + visuelle Eigenschaften + Einschluesse stuetzen.

### Schritt 4: Einschlussanalyse

Innere Merkmale unter Vergroesserung zur Artbestaetigung und Bestimmung natuerlich vs. synthetisch untersuchen.

```
Diagnostic Inclusions by Species:
+------------------+------------------------------------------+
| Species          | Characteristic Inclusions                |
+------------------+------------------------------------------+
| Diamond          | Crystals (garnet, diopside), feathers,   |
|                  | cloud, graining, pinpoints               |
+------------------+------------------------------------------+
| Ruby/Sapphire    | Silk (rutile needles), fingerprints,     |
|                  | colour zoning (straight angular),        |
|                  | crystal inclusions                       |
+------------------+------------------------------------------+
| Emerald          | Three-phase inclusions (solid + liquid + |
|                  | gas), jardin (garden-like fractures),    |
|                  | pyrite crystals                          |
+------------------+------------------------------------------+
| Tourmaline       | Growth tubes, liquid-filled fractures    |
+------------------+------------------------------------------+
| Quartz/Amethyst  | Tiger stripes, phantoms, two-phase       |
|                  | inclusions, negative crystals            |
+------------------+------------------------------------------+

Synthetic Indicators:
+------------------+------------------------------------------+
| Synthetic Type   | Telltale Inclusions                      |
+------------------+------------------------------------------+
| Flame fusion     | Curved growth lines (striae),            |
| (Verneuil)       | gas bubbles (spherical)                  |
+------------------+------------------------------------------+
| Flux grown       | Flux fingerprints (wispy veils),         |
|                  | platinum platelets                       |
+------------------+------------------------------------------+
| Hydrothermal     | Chevron or zigzag growth patterns,       |
|                  | seed plate remnant                       |
+------------------+------------------------------------------+
| Glass simulants  | Round gas bubbles, swirl marks,          |
|                  | conchoidal fracture chips                |
+------------------+------------------------------------------+
```

1. Den Stein unter Dunkelfeld-Beleuchtung (gemmologisches Mikroskop) oder Schraegbeleuchtung durch eine 10x Lupe untersuchen
2. Zuerst nach artdiagnostischen Einschluessen suchen
3. Auf Synthese-Indikatoren pruefen — gekruemmte Streifen und Gasblasen sind beweisend fuer Flammen-Schmelzsynthesen
4. Einschlusstyp, Lage und Haeufigkeit notieren
5. Einschluesse nach Moeglichkeit fotografisch dokumentieren

**Erwartet:** Artbestaetigende Einschlussmuster und Bestimmung natuerlich/synthetisch. Einige Arten werden eher durch ihre Einschluesse als durch optische Eigenschaften identifiziert (z.B. der Jardin des Smaragds).

**Bei Fehler:** Wenn der Stein augenrein ist und bei 10x keine Einschluesse sichtbar sind, kann es sich um einen sehr sauberen natuerlichen Stein oder eine Synthese handeln. Das Fehlen von Einschluessen erhoeht die Synthese-Wahrscheinlichkeit — optische und physikalische Tests zur Bestaetigung heranziehen. Laboranalyse (FTIR, Raman) kann erforderlich sein.

### Schritt 5: Identifikation durch Ausschlussverfahren

Alle gesammelten Daten zur endgueltigen Identifikation abgleichen.

1. Das Eigenschaftsprofil zusammenstellen:
   - Farbe + Transparenz + Glanz
   - Haerte oder SG
   - RI + Doppelbrechung + optischer Charakter
   - Pleochroismus + UV-Fluoreszenz
   - Einschlussmuster
2. Mit Referenztabellen fuer Kandidatenarten vergleichen
3. Arten eliminieren, die mit einer gemessenen Eigenschaft in Widerspruch stehen
4. Wenn zwei oder mehr Kandidaten verbleiben, den unterscheidenden Test identifizieren:
   - Beispiel: Blautopas vs. Aquamarin — SG ist beweisend (3,53 vs. 2,70)
5. Die Identifikation mit Konfidenzgrad angeben:
   - **Definitiv**: Mehrere Eigenschaften bestaetigen eine einzelne Art
   - **Wahrscheinlich**: Eigenschaften konsistent mit einer Art, aber ein Test fehlt
   - **Unsicher**: Widerspruechliche Daten oder unzureichende Tests — Laborueberweisung empfohlen

**Erwartet:** Eine endgueltige Artidentifikation (z.B. „Natuerlicher Saphir, blau, waermebehandelt") mit stuetzenden Belegen aus jeder Testkategorie. Oder eine klare Empfehlung zur Laboranalyse, wenn Feldtests nicht ausreichen.

**Bei Fehler:** Wenn der Stein mit verfuegbarer Ausruestung nicht identifiziert werden kann, alle gemessenen Eigenschaften dokumentieren und an ein gemmologisches Labor ueberweisen. Die gemessenen Daten dem Labor bereitstellen — das beschleunigt deren Analyse.

## Validierung

- [ ] Visuelle Inspektion unter tageslichtaequivalenter Beleuchtung abgeschlossen
- [ ] Mindestens zwei physikalische Eigenschaften gemessen (Haerte/SG + eine weitere)
- [ ] RI gemessen und Doppelbrechung berechnet (wenn Refraktometer verfuegbar)
- [ ] Pleochroismus getestet (wenn Dichroskop verfuegbar)
- [ ] Einschluesse unter mindestens 10-facher Vergroesserung untersucht
- [ ] Identifikation durch systematisches Ausschlussverfahren erreicht, nicht durch Annahme
- [ ] Gaengige Simulanten explizit in Betracht gezogen und ausgeschlossen
- [ ] Bestimmung natuerlich vs. synthetisch getroffen (oder als unsicher gekennzeichnet)

## Haeufige Stolperfallen

- **Farbe allein vertrauen**: Farbe ist die unzuverlaessigste Identifikationseigenschaft. Blaue Steine umfassen Saphir, Topas, Aquamarin, Tansanit, Iolith, Spinell, Glas und CZ. Immer mit messbaren Eigenschaften bestaetigen
- **SG bei gefassten Steinen ueberspringen**: Gefasste Steine schraenken die Tests ein, aber RI, Pleochroismus, Einschluesse und UV koennen trotzdem geprueft werden. Die Einschraenkung dokumentieren statt zu raten
- **Hochbrechende Synthesen mit natuerlichen Steinen verwechseln**: Flammen-Schmelz-Rubine und -Saphire haben identische RI- und SG-Werte wie natuerliche Steine. Nur Einschluesse (gekruemmte Streifen vs. gerades Wachstum) unterscheiden sie
- **Annehmen, teuer = natuerlich**: Kommerzieller Schmuck enthaelt haeufig behandelte, synthetische oder simulierte Steine. Jeden Stein testen, unabhaengig von Herkunftsangaben
- **Das Exemplar beschaedigen**: Niemals einen facettierten Edelstein einem Haertetest unterziehen — es hinterlaesst sichtbare Kratzer. Zerstoerungsfreie Tests (RI, SG, Einschluesse) fuer geschliffene Steine verwenden

## Verwandte Skills

- `cut-gemstone` — Die Identifikation bestimmt sichere Schleifparameter und Orientierungsanforderungen fuer die Art
- `appraise-gemstone` — Positive Identifikation ist die Voraussetzung fuer jede aussagekraeftige Bewertung
- `mineral-identification` — Feldmineralidentifikation anhand physikalischer Eigenschaften (Prospecting-Domaene) teilt den systematischen Ausschlussansatz
