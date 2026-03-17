---
name: appraise-gemstone
description: >
  Edelsteinwert anhand der vier Cs (Farbe, Reinheit, Schliff, Karatgewicht),
  Herkunftsbewertung, Behandlungserkennung und Marktfaktorenanalyse bewerten.
  Nur beratende Bildungsanleitung — keine zertifizierte Schaetzung. Verwenden
  beim Verstaendnis der wertbestimmenden Faktoren eines Edelsteins, bei der
  Vorauswahl von Steinen vor einer professionellen Schaetzung, bei der
  Bewertung, ob ein Verkaufspreis angemessen ist, beim Erlernen der
  Edelstein-Bewertungsmethodik oder beim Verstaendnis, wie der
  Behandlungsstatus den Wert beeinflusst.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: lapidary
  complexity: advanced
  language: natural
  tags: lapidary, appraisal, valuation, gemstones, grading
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Edelstein bewerten

Edelsteinwert anhand der vier Cs (Farbe, Reinheit, Schliff, Karatgewicht), Behandlungserkennung, Herkunftsbewertung und Marktfaktorenanalyse bewerten. Dies ist nur beratende Bildungsanleitung und stellt keine zertifizierte gemmologische Schaetzung dar.

> **HAFTUNGSAUSSCHLUSS**: Diese Vorgehensweise bietet Bildungsanleitung zur Edelstein-Bewertungsmethodik. Sie ist KEINE zertifizierte Schaetzung. Fuer Versicherungs-, Nachlass-, Verkaufs- oder Rechtszwecke immer eine formelle Schaetzung von einem zertifizierten Gemmologen (GIA Graduate Gemologist, FGA oder gleichwertig) einholen. Edelsteinwerte koennen enorm variieren, basierend auf Faktoren, die eine praktische professionelle Bewertung erfordern.

## Wann verwenden

- Die Faktoren verstehen, die den Wert eines Edelsteins bestimmen
- Steine vor der Bezahlung einer professionellen Schaetzung vorpruefen
- Bewerten, ob der Verkaufspreis eines Haendlers innerhalb eines angemessenen Bereichs liegt
- Edelstein-Bewertungsmethodik zu Bildungszwecken erlernen
- Verstehen, wie der Behandlungsstatus den Wert beeinflusst

## Eingaben

- **Erforderlich**: Identifizierter Edelstein (Art bestaetigt — siehe `identify-gemstone`)
- **Erforderlich**: Zugang zum Stein (lose bevorzugt; gefasste Steine beschraenken die Bewertung)
- **Optional**: Karatwaage (genau bis 0,01 ct)
- **Optional**: 10x Lupe oder gemmologisches Mikroskop
- **Optional**: Tageslichaequivalente Lichtquelle (5500-6500K)
- **Optional**: Farbbewertungs-Referenzsteine oder Referenzbilder (GIA-System)
- **Optional**: Refraktometer und Chelsea-Filter (fuer Behandlungserkennung)

## Vorgehensweise

### Schritt 1: Farbbewertung

Die Farbe des Steins anhand der drei Komponenten bewerten: Farbton, Saettigung und Tonwert.

```
Colour Assessment Framework:

HUE: The dominant spectral colour
+------------------+------------------------------------------+
| Primary Hue      | Examples                                 |
+------------------+------------------------------------------+
| Red              | Ruby, red spinel, pyrope garnet          |
| Orange           | Spessartine garnet, fire opal            |
| Yellow           | Yellow sapphire, citrine, chrysoberyl    |
| Green            | Emerald, tsavorite, peridot, tourmaline  |
| Blue             | Sapphire, aquamarine, tanzanite          |
| Violet/Purple    | Amethyst, purple sapphire                |
| Pink             | Pink sapphire, morganite, kunzite        |
+------------------+------------------------------------------+
Secondary modifiers: yellowish-green, purplish-red, orangy-pink, etc.

SATURATION: Intensity of the colour
+------------------+------------------------------------------+
| Level            | Description                              |
+------------------+------------------------------------------+
| Vivid            | Pure, intense colour (most valuable)     |
| Strong           | Rich colour, slight modifier             |
| Moderate         | Noticeable colour, some grey/brown       |
| Weak             | Faint colour, significant grey/brown     |
| Greyish/Brownish | Colour masked by grey or brown modifiers |
+------------------+------------------------------------------+

TONE: Lightness or darkness
+------------------+------------------------------------------+
| Level            | Description                              |
+------------------+------------------------------------------+
| Very light       | Pastel, may lack presence                |
| Light            | Attractive in some species (aquamarine)  |
| Medium-light     | Often ideal for many species             |
| Medium           | Classic "fine" tone for most coloured    |
|                  | gemstones                                |
| Medium-dark      | Rich, but watch for over-darkening       |
| Dark             | Colour may appear black face-up          |
| Very dark        | Loses transparency, appears opaque       |
+------------------+------------------------------------------+

IDEAL COLOUR RANGES (highest value):
- Ruby: medium-dark, vivid red ("pigeon blood")
- Sapphire: medium, vivid blue (not too dark, not violetish)
- Emerald: medium, vivid green (not yellowish, not bluish)
- Tanzanite: medium-dark, vivid violetish-blue
- Aquamarine: medium, strong blue (not greenish)
```

1. Den Stein von oben unter tageslichaequivalenter Beleuchtung betrachten
2. Den primaeren Farbton und eventuelle sekundaere Modifikatoren identifizieren
3. Saettigung bewerten — lebhaft und stark erzielen die hoechsten Aufpreise
4. Tonwert bewerten — mittel ist generell optimal; zu dunkel oder zu hell mindert den Wert
5. Mit Referenzbildern oder Referenzsteinen vergleichen, falls verfuegbar
6. Eventuelle Farbzonierung notieren, die von oben sichtbar ist (mindert den Wert)

**Erwartet:** Eine dreikomponentige Farbbewertung (z.B. "mittleres lebhaftes Blau mit leichtem violetten Modifikator"), die den Stein auf dem Farbqualitaetsspektrum fuer seine Art positioniert.

**Bei Fehler:** Wenn die Lichtbedingungen nicht ideal sind (gelbliches Innenlicht), die Einschraenkung notieren. Farbbewertung unter falscher Beleuchtung liefert unzuverlaessige Ergebnisse. Wenn Farbwechsel vermutet wird (Alexandrit, manche Saphire, manche Granate), sowohl unter Tageslicht als auch unter Gluehlampen bewerten.

### Schritt 2: Reinheitsbewertung

Die inneren Merkmale des Steins unter 10-facher Vergroesserung bewerten.

```
Coloured Gemstone Clarity Scale (GIA-based):

+-------------------+------------------------------------------+
| Grade             | Description                              |
+-------------------+------------------------------------------+
| VVS               | Very Very Slightly Included: minute      |
| (eye-clean)       | inclusions, difficult to see at 10x      |
+-------------------+------------------------------------------+
| VS                | Very Slightly Included: minor            |
| (eye-clean)       | inclusions, noticeable at 10x            |
+-------------------+------------------------------------------+
| SI1               | Slightly Included: noticeable at 10x,    |
| (usually eye-     | may be visible to the eye                |
| clean)            |                                          |
+-------------------+------------------------------------------+
| SI2               | Slightly Included: easily seen at 10x,   |
| (eye-visible)     | visible to the unaided eye               |
+-------------------+------------------------------------------+
| I1                | Included: obvious inclusions that may    |
|                   | affect transparency or durability        |
+-------------------+------------------------------------------+
| I2-I3             | Heavily Included: prominent inclusions   |
|                   | that affect beauty and/or durability     |
+-------------------+------------------------------------------+

SPECIES-SPECIFIC EXPECTATIONS:
Different species have different "normal" clarity levels:
- Type I (usually eye-clean): aquamarine, topaz, chrysoberyl
  → Inclusions are penalized more heavily
- Type II (usually included): ruby, sapphire, tourmaline
  → Eye-clean examples command significant premiums
- Type III (almost always included): emerald, red tourmaline
  → Eye-clean examples are extremely rare and valuable
```

1. Den Stein zuerst von oben untersuchen — sieht das unbewaffnete Auge Einschluesse?
2. Unter 10-facher Vergroesserung untersuchen, durch die Tafel fokussierend
3. Einschlusstyp (Kristall, Feder, Fingerabdruck, Seide, Nadel), Groesse, Lage und Anzahl notieren
4. Bewerten, ob Einschluesse Transparenz, Brillanz oder Haltbarkeit beeintraechtigen
5. Einen Reinheitsgrad zuweisen, basierend auf der Sichtbarkeit und Auswirkung der Einschluesse
6. Artspezifische Erwartungen beruecksichtigen — ein SI1-Smaragd ist ausgezeichnet; ein SI1-Aquamarin ist durchschnittlich

**Erwartet:** Ein Reinheitsgrad mit Beschreibung der wichtigsten Einschluesse, ihrer Lage und ihrer Auswirkung auf Schoenheit und Haltbarkeit. Der Grad ist auf artspezifische Erwartungen kalibriert.

**Bei Fehler:** Wenn die Vergroesserung unzureichend ist (keine Lupe verfuegbar), nur eine augenrein/nicht-augenrein Bewertung durchfuehren. Die Einschraenkung notieren. Wenn der Stein gefasst ist und Pavilion-Einschluesse verborgen sind, notieren, welche Bereiche nicht bewertet werden konnten.

### Schritt 3: Schliffqualitaets-Bewertung

Die Qualitaet des Schliffs basierend auf Proportionen, Symmetrie und Lichtleistung bewerten.

```
Cut Quality Factors:

PROPORTIONS:
+------------------+------------------------------------------+
| Factor           | Ideal                                    |
+------------------+------------------------------------------+
| Table size       | 55-65% of girdle diameter (round)        |
| Crown height     | 12-17% of girdle diameter                |
| Pavilion depth   | 40-45% of girdle diameter                |
| Girdle thickness | Medium (not too thin, not too thick)     |
| Total depth      | 58-65% of girdle diameter                |
+------------------+------------------------------------------+

LIGHT PERFORMANCE:
+------------------+------------------------------------------+
| Factor           | Description                              |
+------------------+------------------------------------------+
| Brilliance       | White light return — pavillion angles     |
|                  | determine total internal reflection      |
+------------------+------------------------------------------+
| Windowing        | "See-through" area (pavilion too shallow)|
|                  | Any visible window reduces value         |
+------------------+------------------------------------------+
| Extinction       | Dark areas that do not return light      |
|                  | (pavilion too steep, or inherent to deep |
|                  | colour stones at steep viewing angles)   |
+------------------+------------------------------------------+
| Scintillation    | Flashes of light as stone moves          |
|                  | (pattern and intensity)                  |
+------------------+------------------------------------------+

SYMMETRY AND FINISH:
- Facet alignment and meet precision
- Outline symmetry (roundness, oval evenness)
- Surface polish quality (scratches, orange peel)
- Girdle consistency (even thickness)
```

1. Den Stein von oben betrachten und sanft bewegen — Brillanz, Fensterbildung und Extinktion beobachten
2. Proportionen pruefen: Tafelgroesse, Kronenhoehe, Paviliontiefe
3. Symmetrie bewerten: Umrissform, Facettenausrichtung, Treffpunktpraezision
4. Oberflaechenpolitur bewerten: Kratzer, Polierlinien, Orangenhaut unter 10x
5. Ruendiste pruefen: gleichmaessige Dicke, nicht zu duenn (Abplatzrisiko) oder zu dick (totes Gewicht)
6. Den Schliff von Ausgezeichnet bis Schlecht bewerten

**Erwartet:** Eine Schliffqualitaetsbewertung, die Proportionen, Lichtleistung, Symmetrie und Oberflaechenfinish abdeckt. Der Schliffgrad beeinflusst den Wert erheblich — ein gut geschliffener Stein mittlerer Qualitaet kann einen schlecht geschliffenen Stein hoeherer Farbe und Reinheit uebertreffen.

**Bei Fehler:** Wenn der Stein gefasst ist und Proportionen nicht vollstaendig gemessen werden koennen, das Sichtbare bewerten (Lichtleistung von oben, Symmetrie, Politur) und notieren, dass Proportionen nicht verifiziert werden konnten. Gefasste Steine haben immer Bewertungseinschraenkungen.

### Schritt 4: Karatgewicht und Masse

Gewicht und Abmessungen des Steins erfassen.

1. Den Stein auf einer Karatwaage wiegen (1 Karat = 0,2 Gramm)
2. Gewicht auf zwei Dezimalstellen erfassen (z.B. 2,37 ct)
3. Abmessungen messen: Laenge x Breite x Tiefe in Millimetern
4. Fuer gefasste Steine das Gewicht anhand der Abmessungen mit artspezifischen Formeln schaetzen:
   - Rund: Durchmesser^2 x Tiefe x SG-Faktor
   - Oval: Laenge x Breite x Tiefe x SG-Faktor x 0,0020
5. Beachten, dass der Pro-Karat-Wert an kommerziell bedeutsamen Gewichtsschwellen steigt:
   - 0,50 ct, 1,00 ct, 2,00 ct, 3,00 ct, 5,00 ct, 10,00 ct
   - Ein 1,02-ct-Stein erzielt einen Aufpreis gegenueber einem 0,98-ct-Stein gleicher Qualitaet

**Erwartet:** Genaues Karatgewicht (auf 0,01 ct) und Millimeter-Abmessungen. Fuer gefasste Steine eine Gewichtsschaetzung mit angegebener Fehlermarge.

**Bei Fehler:** Wenn keine Karatwaage verfuegbar ist, Abmessungen messen und Gewicht mit Standardformeln schaetzen. Notieren, dass das Gewicht geschaetzt ist. Fuer wertvolle Steine das Gewicht immer auf einer kalibrierten Waage verifizieren.

### Schritt 5: Behandlungserkennung

Bewerten, ob der Stein behandelt wurde, um sein Erscheinungsbild zu verbessern.

```
Common Gemstone Treatments:
+-------------------+------------------------------------------+
| Treatment         | Detection Indicators                     |
+-------------------+------------------------------------------+
| Heat treatment    | Dissolved silk (rutile needles melted),  |
| (ruby, sapphire)  | stress fractures around inclusions,     |
|                   | altered colour zoning                    |
|                   | NOTE: Heat treatment is standard and     |
|                   | widely accepted for corundum             |
+-------------------+------------------------------------------+
| Fracture filling  | Flash effect under fibre-optic light     |
| (emerald, ruby)   | (blue/orange flash in fractures),       |
|                   | bubbles in filler material               |
|                   | Reduces value significantly              |
+-------------------+------------------------------------------+
| Surface coating   | Colour concentrated at surface,          |
| (topaz "mystic")  | scratches reveal different colour       |
|                   | underneath, uneven colour               |
+-------------------+------------------------------------------+
| Diffusion         | Colour concentrated at surface or along  |
| (sapphire)        | fractures. Immerse in methylene iodide  |
|                   | — colour pattern visible                 |
+-------------------+------------------------------------------+
| Irradiation       | Unstable colours may fade in sunlight    |
| (topaz, diamond)  | Some irradiation is undetectable without |
|                   | lab testing                              |
+-------------------+------------------------------------------+
| Glass filling     | Gas bubbles in glass, flash effect,      |
| (ruby)            | different lustre in filled areas         |
|                   | Severely reduces value and durability    |
+-------------------+------------------------------------------+

TREATMENT IMPACT ON VALUE:
- Untreated (with certification): highest premium
- Standard accepted treatment (heat): moderate reduction
- Enhancement treatment (filling, coating): significant reduction
- Requires disclosure at point of sale in all jurisdictions
```

1. Einschluesse auf Anzeichen von Waermebehandlung untersuchen (aufgeloeste Seide, Spannungshoefe)
2. Glasfaserlicht verwenden, um auf Rissfuellung zu pruefen (Blitzeffekt)
3. Auf Oberflaechenbeschichtungen pruefen, indem Kanten und Kratzer untersucht werden
4. Fuer hochwertige Steine anmerken, dass Laborzertifizierung fuer den Behandlungsstatus unerlasslich ist
5. Behandlungsbewertung erfassen: unbehandelt, erhitzt, gefuellt, beschichtet, diffundiert oder unbekannt

**Erwartet:** Eine Behandlungsbewertung mit stuetzenden Beobachtungen. Fuer Steine ueber 500 USD Laborzertifizierung (GIA, GRS, SSEF, Guebelin) fuer verbindliche Behandlungsbestimmung empfehlen.

**Bei Fehler:** Viele Behandlungen (besonders milde Waermebehandlung und manche Bestrahlung) koennen ohne Laborinstrumente (FTIR-Spektroskopie, UV-Vis, Raman) nicht erkannt werden. Wenn der Behandlungsstatus unsicher ist, "unbekannt — Labortestung empfohlen" erfassen, anstatt zu raten.

### Schritt 6: Marktfaktorenanalyse

Externe Faktoren beruecksichtigen, die den Marktwert ueber die vier Cs hinaus beeinflussen.

```
Market Factors:
+-------------------+------------------------------------------+
| Factor            | Impact                                   |
+-------------------+------------------------------------------+
| Origin            | Kashmir sapphire, Burmese ruby, and      |
|                   | Colombian emerald command significant     |
|                   | premiums (2-10x) over identical quality  |
|                   | from other sources                       |
+-------------------+------------------------------------------+
| Rarity            | Paraiba tourmaline, alexandrite,          |
|                   | padparadscha sapphire — scarcity drives  |
|                   | premium pricing                          |
+-------------------+------------------------------------------+
| Certification     | GIA, GRS, SSEF, Gubelin reports add      |
|                   | confidence and liquidity to high-value   |
|                   | stones                                   |
+-------------------+------------------------------------------+
| Fashion/trends    | Tanzanite, morganite, and coloured       |
|                   | diamonds have experienced trend-driven   |
|                   | price increases                          |
+-------------------+------------------------------------------+
| Setting/mounting  | A well-made setting from a recognised    |
|                   | maker can add value. Generic mounts do   |
|                   | not                                      |
+-------------------+------------------------------------------+
| Provenance        | Royal, historical, or celebrity provenance|
|                   | adds auction premium                     |
+-------------------+------------------------------------------+
```

1. Die wahrscheinliche Herkunft des Steins recherchieren, falls bekannt oder zertifizierbar
2. Die aktuelle Marktposition der Art beruecksichtigen (steigend, stabil, ruecklaeufig)
3. Bewerten, ob Laborzertifizierung Wert hinzufuegen wuerde (generell ja fuer Steine >1 ct und >500 USD)
4. Jegliche Provenienz oder historische Bedeutung notieren
5. Die vollstaendige Bewertung in eine Wertspanne zusammenstellen (nicht einen einzelnen Preispunkt)

**Erwartet:** Eine kontextualisierte Wertspanne, die die vier Cs, den Behandlungsstatus, die Herkunft und Marktfaktoren beruecksichtigt. Als Spanne mit angegebenen Annahmen ausgedrueckt.

**Bei Fehler:** Edelsteinpreise erfordern Marktkompetenz, die sich kontinuierlich weiterentwickelt. Wenn Marktdaten nicht verfuegbar sind, die Qualitaetsbewertung (vier Cs + Behandlung) ohne Preisschaetzung bereitstellen und die Konsultation eines Haendlers oder zertifizierten Schaetzers empfehlen.

## Validierung

- [ ] Art vor Beginn der Schaetzung positiv identifiziert
- [ ] Farbe unter tageslichaequivalenter Beleuchtung mit Farbton, Saettigung und Tonwert bewertet
- [ ] Reinheit unter 10-facher Vergroesserung mit Einschlussinventar bewertet
- [ ] Schliffqualitaet auf Proportionen, Lichtleistung, Symmetrie und Finish bewertet
- [ ] Karatgewicht gemessen (oder mit angegebener Marge geschaetzt)
- [ ] Behandlungsstatus mit stuetzenden Beobachtungen bewertet
- [ ] Marktfaktoren beruecksichtigt (Herkunft, Seltenheit, Zertifizierungswert)
- [ ] Wert als Spanne ausgedrueckt, nicht als einzelne Zahl
- [ ] Haftungsausschluss enthalten: Dies ist Bildungsanleitung, keine zertifizierte Schaetzung

## Haeufige Stolperfallen

- **Haftungsausschluss weglassen**: Diese Vorgehensweise bietet nur Bildungsanleitung. Formelle Schaetzungen fuer Versicherungs-, Verkaufs- oder Rechtszwecke erfordern einen zertifizierten Gemmologen. Dies immer klar angeben
- **Farbbewertung unter falscher Beleuchtung**: Leuchtstoff-, Glueh- und LED-Lampen verschieben alle die Farbwahrnehmung. Tageslichaequivalent (5500-6500K) oder natuerliches nordseitiges Tageslicht verwenden
- **Artspezifische Reinheitserwartungen ignorieren**: Ein SI1-Smaragd ist ein feiner Stein; ein SI1-Aquamarin ist unterdurchschnittlich. Reinheit muss relativ zum Normalen fuer die Art bewertet werden
- **Karatgewicht ueberbewerten**: Ein grosser, schlecht geschliffener, einschlussreicher Stein ist pro Karat weniger wert als ein kleinerer, gut geschliffener, reiner Stein. Die vier Cs interagieren — Gewicht allein bestimmt nicht den Wert
- **Unbehandelt annehmen ohne Beweise**: Die Mehrheit der Rubine und Saphire auf dem Markt sind waermebehandelt. Behandlung annehmen, es sei denn, Laborzertifizierung bestaetigt das Gegenteil

## Verwandte Skills

- `identify-gemstone` — Positive Artidentifikation ist die Voraussetzung fuer eine Schaetzung; Fehlidentifikation macht die gesamte Bewertung ungueltig
- `grade-tcg-card` — Die beobachtungszuerst, verzerrungsvermeidende Methodik entspricht der Disziplin, die noetig ist, um "Wunschbewertung" bei der Edelsteinschaetzung zu vermeiden
