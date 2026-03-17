---
name: consult-natural-history
description: >
  Hildegard von Bingens Naturgeschichtswissen aus der Physica nachschlagen.
  Umfasst Klassifikation von Pflanzen, Steinen, Tieren, Fischen, Voegeln,
  Elementen und Baeumen mit ihren medizinischen, symbolischen und praktischen
  Eigenschaften. Ermoeglicht Querverweise zwischen Kategorien und
  Anwendungsanleitung. Verwenden beim Erkunden einer bestimmten Pflanze,
  eines Steins oder Tieres aus Hildegards Perspektive, beim Erforschen
  mittelalterlicher Naturgeschichte und Kosmologie, beim Querverweisen von
  Eigenschaften ueber Kategorien hinweg oder beim Integrieren von Physica-
  Wissen in Gesundheits-, spirituelle oder kreative Praxis.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: hildegard
  complexity: intermediate
  language: natural
  tags: hildegard, physica, natural-history, stones, animals, plants, elements
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Naturgeschichte konsultieren

Hildegard von Bingens *Physica* fuer Naturgeschichtswissen nachschlagen — Eigenschaften von Pflanzen, Steinen, Tieren, Fischen, Voegeln, Elementen und Baeumen mit ihren medizinischen, symbolischen und praktischen Anwendungen.

## Wann verwenden

- Eine bestimmte Pflanze, einen Stein oder ein Tier aus Hildegards Perspektive verstehen
- Symbolische oder medizinische Eigenschaften natuerlicher Objekte in der *Physica* erkunden
- Mittelalterliche Naturgeschichte und Kosmologie erforschen
- Eigenschaften ueber Kategorien hinweg querverweisen (z.B. eine Pflanze und einen Stein mit aehnlichem Temperament)
- *Physica*-Wissen in Gesundheits-, spirituelle oder kreative Praxis integrieren
- Die Beziehung zwischen Natur und Theologie in Hildegards Denken studieren

## Eingaben

- **Erforderlich**: Zu konsultierende Kategorie (Pflanzen, Steine, Tiere, Fische, Voegel, Elemente, Baeume, Reptilien, Metalle)
- **Erforderlich**: Spezifische Anfrage zu Gegenstand oder Eigenschaft (z.B. "Smaragd", "Fenchel", "Eigenschaften des Feuerelements")
- **Optional**: Anwendungskontext (medizinisch, symbolisch, liturgisch, praktisch)
- **Optional**: Zugehoeriges Temperament oder Leiden (zur Anleitung der Eigenschaftsinterpretation)
- **Optional**: Querverweisanfrage (z.B. "Pflanzen und Steine fuer kaltes Temperament")

## Vorgehensweise

### Schritt 1: Die Kategorie in der Physica bestimmen

Bestimmen, welches der neun Buecher der *Physica* das angefragte Wissen enthaelt.

```
Physica — Nine Books of Natural History:

┌──────┬────────────────┬──────────────┬─────────────────────────┐
│ Book │ Title          │ # Entries    │ Focus                   │
├──────┼────────────────┼──────────────┼─────────────────────────┤
│ I    │ PLANTS         │ 230 entries  │ Herbs, grains, spices,  │
│      │ (Plantae)      │              │ vegetables — medicinal  │
│      │                │              │ and dietary properties  │
├──────┼────────────────┼──────────────┼─────────────────────────┤
│ II   │ ELEMENTS       │ 7 entries    │ Fire, air, water, earth,│
│      │ (Elementa)     │              │ wind, stars, sun/moon   │
├──────┼────────────────┼──────────────┼─────────────────────────┤
│ III  │ TREES          │ 27 entries   │ Oak, apple, willow,     │
│      │ (Arbores)      │              │ birch — wood, fruit,    │
│      │                │              │ leaves, symbolic meaning│
├──────┼────────────────┼──────────────┼─────────────────────────┤
│ IV   │ STONES         │ 26 entries   │ Gems and minerals —     │
│      │ (Lapides)      │              │ healing, protection,    │
│      │                │              │ spiritual properties    │
├──────┼────────────────┼──────────────┼─────────────────────────┤
│ V    │ FISH           │ 37 entries   │ Freshwater & saltwater  │
│      │ (Pisces)       │              │ fish — dietary guidance │
├──────┼────────────────┼──────────────┼─────────────────────────┤
│ VI   │ BIRDS          │ 72 entries   │ Domestic & wild birds — │
│      │ (Aves)         │              │ meat properties, eggs,  │
│      │                │              │ symbolic meanings       │
├──────┼────────────────┼──────────────┼─────────────────────────┤
│ VII  │ ANIMALS        │ 45 entries   │ Mammals — domestic &    │
│      │ (Animalia)     │              │ wild, medicinal uses of │
│      │                │              │ parts (bones, organs)   │
├──────┼────────────────┼──────────────┼─────────────────────────┤
│ VIII │ REPTILES       │ 16 entries   │ Snakes, frogs, worms —  │
│      │ (Reptilia)     │              │ medicinal (external) and│
│      │                │              │ symbolic (often negative│
├──────┼────────────────┼──────────────┼─────────────────────────┤
│ IX   │ METALS         │ 8 entries    │ Gold, silver, iron,     │
│      │ (Metalla)      │              │ copper — practical and  │
│      │                │              │ medicinal applications  │
└──────┴────────────────┴──────────────┴─────────────────────────┘

Lookup Process:
1. Identify which category the inquiry falls under
2. Locate the entry within that book (alphabetical or grouped by type)
3. Extract properties: temperature, moisture, medicinal use, contraindications
4. Note symbolic or theological associations if relevant
```

**Erwartet:** Korrektes Buch/Kategorie fuer die Anfrage identifiziert (z.B. "Smaragd" → Buch IV Steine; "Fenchel" → Buch I Pflanzen).

**Bei Fehler:** Bei Unsicherheit ueber die Kategorie mehrere durchsuchen. Beispiel: "Weide" koennte Buch I (Pflanze) oder Buch III (Baum) sein — Hildegard fuehrt sie in Buch III als Baum mit Rinden- und Holzeigenschaften auf.

### Schritt 2: Eigenschaften und Anwendungen extrahieren

Die spezifischen Eigenschaften abrufen, die Hildegard dem Gegenstand zuschreibt.

```
Property Categories in Physica:

TEMPERATURE (Hot/Warm/Temperate/Cool/Cold):
- Hot: Generates heat, dries moisture, stimulates (e.g., ginger, fire, gold)
- Warm: Gently heating, balances cold conditions (e.g., fennel, cinnamon)
- Temperate: Balanced, neither heating nor cooling (e.g., spelt, emerald)
- Cool: Mildly cooling, calms heat (e.g., lettuce, cucumber)
- Cold: Strongly cooling, can suppress activity (e.g., ice, certain stones)

MOISTURE (Moist/Dry):
- Moist: Softens, lubricates, adds fluidity (e.g., butter, water element)
- Dry: Firms, dries dampness, removes excess moisture (e.g., rye, certain stones)

MEDICINAL USE:
- Internal: Eaten, drunk, or taken as tincture (plants, fish, some stones
  powdered in wine)
- External: Poultice, salve, amulet, or ritual use (stones, animal parts)
- Specific ailments: Digestive, respiratory, skin, heart, mental/spiritual

SYMBOLIC/THEOLOGICAL:
- Virtue associations (emerald = chastity; sapphire = divine contemplation)
- Biblical references (cedar = Temple; dove = Holy Spirit)
- Cosmological role (elements as building blocks; metals as earthly reflection
  of heavenly order)

Example Entries:

FENNEL (Book I, Chapter 1):
- Temperature: Warm
- Moisture: Moderately moist
- Use: "However it is consumed — raw, cooked, or as spice — it brings gladness
  and gives pleasant warmth, good digestion, and gentle sweat."
- Application: Digestive aid, carminative, mood-lifting
- Contraindications: None noted (generally safe)

EMERALD (Book IV, Chapter 10):
- Temperature: Temperate (neither hot nor cold)
- Symbolic: Chastity, purity, protection against impure thoughts
- Use: "If someone is tormented by impure thoughts, let them hold an emerald
  in their hand, warm it with their breath, moisten it with saliva, and place
  it over their heart. The impurity will leave."
- Application: Spiritual/psychological (calms lust, stabilizes emotions)

FIRE ELEMENT (Book II, Chapter 1):
- Temperature: Hot and dry
- Cosmological: "Fire is in all things; it gives life, light, and warmth."
- Medicinal: Fire (heat) is essential for digestion, circulation, vitality
- Symbolic: Holy Spirit, divine love, transformative power
- Caution: Excess fire → inflammation, fever, anger

OAK TREE (Book III, Chapter 5):
- Temperature: Warm and dry
- Parts: Bark (astringent, stops bleeding), acorns (not for human food —
  too dry and bitter), wood (durable for building)
- Symbolic: Strength, endurance, steadfastness
- Medicinal: Oak bark decoction for diarrhea, wounds (external)
```

**Erwartet:** Eigenschaften extrahiert mit klar notierten Temperatur-, Feuchtigkeits-, Medizin- und symbolischen Zuordnungen.

**Bei Fehler:** Wenn der *Physica*-Eintrag kurz oder unklar ist, mit bekannter Temperamentlogik ergaenzen. Beispiel: Wenn Hildegard nur sagt "es ist warm", daraus ableiten, dass es kalte Zustaende behandelt und bei heissen Zustaenden zu meiden ist.

### Schritt 3: Zwischen Kategorien querverweisen (Optional)

Verwandte Gegenstaende ueber Kategorien hinweg identifizieren, die Eigenschaften teilen oder synergetisch wirken.

```
Cross-Referencing Patterns:

BY TEMPERAMENT:
Cold/Damp Conditions → Warming/Drying Agents:
- PLANTS: Fennel, ginger, galangal, yarrow (Book I)
- STONES: Carnelian, jasper (Book IV) — warm stones worn as amulets
- ELEMENTS: Fire (Book II) — exposure to sunlight, warmth
- ANIMALS: Lamb (Book VII) — warming meat

Hot/Dry Conditions → Cooling/Moistening Agents:
- PLANTS: Lettuce, cucumber, violet, plantain (Book I)
- STONES: Emerald, sapphire (Book IV) — cooling stones for inflamed conditions
- ELEMENTS: Water (Book II) — hydration, cool baths
- FISH: Most fish are cooling and moistening (Book V)

BY AILMENT:
Digestive Issues:
- PLANTS: Fennel (warming), yarrow (drying), ginger (stimulating)
- STONES: Sapphire worn over stomach (Hildegard: "calms stomach pain")
- ANIMALS: Lamb (easy to digest), avoid pork (heavy, cold)
- ELEMENTS: Fire (supports digestion through bodily heat)

Respiratory Congestion:
- PLANTS: Lungwort, elecampane, hyssop (Book I)
- STONES: Beryl (Hildegard: "good for lungs and liver")
- BIRDS: Chicken broth (nourishing, light)
- ELEMENTS: Air (fresh air, avoid damp environments)

BY SYMBOLIC THEME:
Purity/Chastity:
- PLANTS: Lily (white, pure) — though not extensively discussed in Physica
- STONES: Emerald (see above), crystal (clarity, purity)
- ANIMALS: Dove (Book VI) — symbol of Holy Spirit, innocence
- ELEMENTS: Water (purification through baptism)

Strength/Endurance:
- PLANTS: Oak (Book III), chestnut (strong, nourishing)
- STONES: Jasper (fortifies heart), agate (strengthens)
- ANIMALS: Ox (Book VII) — strength, labor
- METALS: Iron (Book IX) — fortitude, weapon-making
```

**Erwartet:** Verwandte Gegenstaende ueber 2-3 Kategorien hinweg identifiziert, die Temperament, medizinische Verwendung oder symbolische Bedeutung teilen. Synergetische Nutzung wo angemessen vorgeschlagen.

**Bei Fehler:** Wenn Querverweise unklar sind, auf Einzelkategorie-Nachschlagen konzentrieren. Querverweise sind Bereicherung, nicht wesentlich fuer die Grundkonsultation.

### Schritt 4: Anwendungsanleitung

Praktische oder symbolische Anleitung zur Nutzung des Wissens bereitstellen.

```
Application Types:

1. MEDICINAL APPLICATION:
Scenario: User has cold/damp digestive upset
Consultation:
- PLANTS (Book I): Fennel infusion (warming, carminative)
- STONES (Book IV): Wear carnelian over stomach (warming stone)
- DIETARY (Books I, V, VII): Favor warming foods (ginger, lamb, cooked
  vegetables); avoid cold/damp (raw salads, pork, cold water)
Guidance: "Prepare fennel infusion (1 tbsp seeds per cup, steep 10 min),
drink after meals. Wear carnelian as pendant or in pocket over stomach area.
Adjust diet to warming foods for 1-2 weeks. Reassess."

2. SYMBOLIC/SPIRITUAL APPLICATION:
Scenario: User seeks support for contemplative prayer or chastity
Consultation:
- STONES (Book IV): Emerald (chastity, pure thoughts) — hold during prayer
- PLANTS (Book I): Violet (humility, modesty) — wear or place on altar
- ELEMENTS (Book II): Water (purification) — ritual washing before prayer
Guidance: "Hold emerald during morning prayer, focusing on purity of intention.
Place fresh violets (or dried) on prayer space. Begin prayer with ritual hand
washing as symbolic purification."

3. SEASONAL/ECOLOGICAL APPLICATION:
Scenario: User wants to align health practices with seasonal elements
Consultation:
- Spring (Air rising): Light, greening plants (Book I); fresh air walks
- Summer (Fire peak): Cooling plants (lettuce, cucumber); avoid excess heat
- Autumn (Earth settling): Root vegetables (Book I), grounding practices
- Winter (Water depth): Warming plants (ginger, galangal); rest more
Guidance: "In winter, favor Book I warming plants (fennel, ginger) in teas
and meals. Reduce raw foods. Align with Water element (rest, reflection).
Wear warming stones (carnelian, jasper) if feeling cold."

4. RESEARCH/STUDY APPLICATION:
Scenario: Scholar researching Hildegard's cosmology
Consultation:
- Elements (Book II): Foundational cosmology (fire, air, water, earth)
- Cross-reference to theological works (*Scivias*, *Liber Divinorum Operum*)
- Note how *Physica* integrates natural and divine order
Guidance: "Read Book II (Elements) first to understand Hildegard's cosmological
framework. Then see how she applies elemental theory to plants (Book I) and
stones (Book IV). Compare to *Scivias* Book I for theological integration of
creation and redemption."
```

**Erwartet:** Klare, umsetzbare Anleitung zur Nutzung des *Physica*-Wissens im Kontext (medizinisch, spirituell, saisonal, wissenschaftlich). Der Benutzer weiss, was mit den Informationen zu tun ist.

**Bei Fehler:** Wenn die Anwendung unklar ist, den rohen *Physica*-Eintragstext bereitstellen und den Benutzer die Anwendung bestimmen lassen. Hildegards Eintraege sind oft selbsterklaerend.

### Schritt 5: In Hildegards ganzheitliches System einordnen

*Physica*-Wissen mit der breiteren hildegardischen Gesundheits- und Spiritualpraxis integrieren.

```
Integration with Other Hildegardian Practices:

PHYSICA + CAUSAE ET CURAE (Temperament):
- Use *Physica* plants/stones to rebalance temperament identified in
  *Causae et Curae*
- Example: Melancholic (cold/dry) → Book I warming plants + Book IV
  warming stones

PHYSICA + VIRIDITAS PRACTICE:
- Recognize *Physica* as catalog of viriditas expressions
- Each plant, stone, animal is a manifestation of the greening power
- Meditation: Contemplate a plant's properties as expression of divine creativity

PHYSICA + SACRED MUSIC:
- Many of Hildegard's chants reference *Physica* themes
- Example: "O viridissima virga" (O greenest branch) — Virgin Mary as
  supreme viriditas
- Use *Physica* knowledge to deepen understanding of chant imagery

PHYSICA + LITURGICAL CALENDAR:
- Seasonal recommendations in *Physica* align with church year
- Spring (Easter) → greening plants, renewal
- Autumn (All Souls) → harvest, release, preparation for winter rest
- Winter (Advent/Lent) → warming plants, introspection, waiting

Holistic Health Framework:
┌─────────────────────┬────────────────────────────────────┐
│ Component           │ Hildegardian Source                │
├─────────────────────┼────────────────────────────────────┤
│ Herbal remedies     │ Physica Book I (Plants)            │
│ Dietary guidance    │ Physica Books I, V, VII + Causae   │
│ Temperament assess. │ Causae et Curae                    │
│ Spiritual practice  │ Scivias, Viriditas meditation      │
│ Seasonal rhythm     │ Physica + Liturgical calendar      │
│ Music as healing    │ Symphonia (sacred chants)          │
│ Stones/amulets      │ Physica Book IV (Stones)           │
└─────────────────────┴────────────────────────────────────┘

Hildegard's medicine is NOT isolated remedies but integrated practice:
Body (herbs, diet), Soul (prayer, music), Nature (seasons, viriditas)
```

**Erwartet:** Der Benutzer versteht die *Physica* als eine Komponente von Hildegards ganzheitlichem System. Querverweise zu Temperament, Viriditas und liturgischem Kontext wo relevant bereitgestellt.

**Bei Fehler:** Wenn die Integration komplex erscheint, auf die unmittelbare praktische Nutzung (Schritt 4) konzentrieren und die ganzheitliche Integration fuer fortgeschrittenes Studium zurueckstellen.

## Validierung

- [ ] Korrektes *Physica*-Buch/Kategorie identifiziert (I–IX)
- [ ] Eigenschaften extrahiert: Temperatur, Feuchtigkeit, medizinische Verwendung, symbolische Bedeutung
- [ ] Kontraindikationen oder Vorsichtsmassnahmen vermerkt (falls vorhanden)
- [ ] Anwendungsanleitung bereitgestellt (medizinisch, spirituell, saisonal oder wissenschaftlich)
- [ ] Querverweise notiert (falls angefragt) ueber 2+ Kategorien
- [ ] Integration mit dem breiteren hildegardischen System kontextualisiert
- [ ] Benutzer informiert, dass es sich um mittelalterliche Naturgeschichte handelt, nicht um moderne wissenschaftliche Taxonomie

## Haeufige Stolperfallen

1. **Moderne wissenschaftliche Ueberlagerung**: Die *Physica* ist vorwissenschaftlich. Keine botanische Genauigkeit nach Linneschen Standards erwarten
2. **Woertliche Zutatensubstitution**: Mittelalterliche Pflanzen koennen sich von modernen Sorten unterscheiden. Vor der Verwendung sorgfaeltig recherchieren
3. **Temperament ignorieren**: Hildegards Eigenschaften sind temperamentbezogen (heiss/kalt, feucht/trocken), nicht chemisch. Kontext ist wichtig
4. **Isolierter Heilmittelfokus**: Die *Physica* ist kein eigenstaendiges Kraeuterbuch. Sie integriert sich mit *Causae et Curae*, Viriditas und Spiritualitaet
5. **Tierquaelerei**: Einige *Physica*-Heilmittel verwenden tierische Teile. Ethisch anpassen oder weglassen
6. **Steineinnahme**: Einige Heilmittel beinhalten das Pulverisieren von Steinen in Wein. Moderne Sicherheit: Steine/Mineralien NICHT einnehmen
7. **Symbolische Abwertung**: Die symbolischen Bedeutungen der *Physica* sind integraler Bestandteil von Hildegards Theologie. "Praktisches" nicht vom "Spirituellen" trennen

## Verwandte Skills

- `formulate-herbal-remedy` — Verwendet *Physica* Buch I (Pflanzen) als Primaerquelle
- `assess-holistic-health` — *Physica*-Eigenschaften stimmen mit dem Temperamentsystem in *Causae et Curae* ueberein
- `practice-viriditas` — *Physica* als Katalog von Viriditas-Ausdruecken in der Schoepfung
- `compose-sacred-music` — Viele Gesaenge referenzieren *Physica*-Naturbilder
- `heal` (Domaene: esoteric) — *Physica*-Heilmittel als Teil ganzheitlicher Heilmodalitaeten
- `prepare-soil` (Domaene: gardening) — *Physica*-Heilpflanzen anbauen
