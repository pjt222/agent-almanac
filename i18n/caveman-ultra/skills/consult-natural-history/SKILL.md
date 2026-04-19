---
name: consult-natural-history
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Reference Hildegard von Bingen's Physica natural history knowledge. Covers
  classification of plants, stones, animals, fish, birds, elements, and trees
  with their medicinal, symbolic, and practical properties. Enables cross-
  referencing between categories and application guidance. Use when exploring
  a specific plant, stone, or animal from Hildegard's perspective, researching
  medieval natural history and cosmology, cross-referencing properties across
  categories, or integrating Physica knowledge into health, spiritual, or
  creative practice.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: hildegard
  complexity: intermediate
  language: natural
  tags: hildegard, physica, natural-history, stones, animals, plants, elements
---

# Consult Natural History

Reference Hildegard von Bingen's *Physica* for natural history knowledge — properties of plants, stones, animals, fish, birds, elements, trees w/ medicinal, symbolic, practical applications.

## Use When

- Need to understand specific plant, stone, animal from Hildegard's perspective
- Explore symbolic / medicinal properties of natural objects in *Physica*
- Researching medieval natural history + cosmology
- Cross-ref properties across categories (e.g., plant + stone w/ similar temperament)
- Integrate *Physica* knowledge into health, spiritual, creative practice
- Studying relationship between nature + theology in Hildegard's thought

## In

- **Required**: Category to consult (plants, stones, animals, fish, birds, elements, trees, reptiles, metals)
- **Required**: Specific item / property inquiry (e.g., "emerald", "fennel", "properties of fire element")
- **Optional**: Application context (medicinal, symbolic, liturgical, practical)
- **Optional**: Related temperament / ailment (guide property interpretation)
- **Optional**: Cross-ref req (e.g., "plants + stones for cold temperament")

## Do

### Step 1: Identify Category in Physica

Determine which of the nine books of *Physica* contains req'd knowledge.

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

**→** Correct book/category ID'd for inquiry (e.g., "emerald" → Book IV Stones; "fennel" → Book I Plants).

**If err:** Uncertain which category → search multi. Ex: "willow" could be Book I (plant) or Book III (tree) — Hildegard lists in Book III as tree w/ bark + wood properties.

### Step 2: Extract Properties + Applications

Retrieve specific properties Hildegard attributes to item.

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

**→** Properties extracted w/ temperature, moisture, medicinal use, symbolic associations clearly noted.

**If err:** *Physica* entry brief / unclear → supplement w/ known temperamental logic. Ex: Hildegard says only "it is warm" → infer treats cold conditions + avoid in hot conditions.

### Step 3: Cross-Reference Between Categories (Optional)

ID related items across categories sharing properties or synergy.

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

**→** Related items ID'd across 2-3 categories sharing temperament, medicinal use, symbolic meaning. Synergistic use suggested where appropriate.

**If err:** Cross-refs unclear → focus on single-category lookup. Cross-ref = enrichment, not essential for basic consultation.

### Step 4: Application Guidance

Provide practical / symbolic guidance for using knowledge.

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

**→** Clear, actionable guidance for using *Physica* knowledge in context (medicinal, spiritual, seasonal, scholarly). User knows what to do w/ info.

**If err:** Application unclear → provide raw *Physica* entry text + let user determine application. Hildegard's entries often self-explanatory.

### Step 5: Contextualize in Hildegard's Holistic System

Integrate *Physica* knowledge w/ broader Hildegardian health + spiritual practice.

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

**→** User understands *Physica* as one component of Hildegard's holistic system. Cross-refs to temperament, viriditas, liturgical context provided where relevant.

**If err:** Integration complex → focus on immediate practical use (Step 4) + defer holistic integration for advanced study.

## Check

- [ ] Correct *Physica* book/category ID'd (I–IX)
- [ ] Properties extracted: temperature, moisture, medicinal use, symbolic meaning
- [ ] Contraindications / cautions noted (if any)
- [ ] Application guidance provided (medicinal, spiritual, seasonal, scholarly)
- [ ] Cross-refs noted (if req'd) across 2+ categories
- [ ] Integration w/ broader Hildegardian system contextualized
- [ ] User informed this = medieval natural history, not modern scientific taxonomy

## Traps

1. **Modern Scientific Overlay**: *Physica* = pre-scientific. Don't expect botanical accuracy by Linnaean standards.
2. **Literal Ingredient Substitution**: Medieval plants may differ from modern cultivars. Research careful before using.
3. **Ignore Temperament**: Hildegard's properties = temperamental (hot/cold, moist/dry), not chemical. Context matters.
4. **Isolated Remedy Focus**: *Physica* ≠ standalone herbal. Integrates w/ *Causae et Curae*, viriditas, spirituality.
5. **Animal Cruelty**: Some *Physica* remedies use animal parts. Adapt ethically or omit.
6. **Stone Ingestion**: Some remedies involve powdering stones in wine. Modern safety: Do NOT ingest stones/minerals.
7. **Symbolic Dismissal**: *Physica*'s symbolic meanings integral to Hildegard's theology. Don't separate "practical" from "spiritual".

## →

- `formulate-herbal-remedy` — Uses *Physica* Book I (Plants) as primary source
- `assess-holistic-health` — *Physica* properties align w/ temperament system in *Causae et Curae*
- `practice-viriditas` — *Physica* as catalog of viriditas expressions in creation
- `compose-sacred-music` — Many chants ref *Physica* natural imagery
- `heal` (esoteric domain) — *Physica* remedies as part of holistic healing modalities
- `prepare-soil` (gardening domain) — Growing *Physica* medicinal plants
