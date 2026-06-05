---
name: consult-natural-history
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

Reference Hildegard von Bingen's *Physica* for natural history knowledge — properties of plants, stones, animals, fish, birds, elements, and trees with their medicinal, symbolic, and practical applications.

## When to Use

- You need to understand a specific plant, stone, or animal from Hildegard's perspective
- You want to explore symbolic or medicinal properties of natural objects in *Physica*
- You are researching medieval natural history and cosmology
- You need to cross-reference properties across categories (e.g., a plant and a stone with similar temperament)
- You want to integrate *Physica*'s knowledge into health, spiritual, or creative practice
- You are studying the relationship between nature and theology in Hildegard's thought

## Inputs

- **Required**: Category to consult (plants, stones, animals, fish, birds, elements, trees, reptiles, metals)
- **Required**: Specific item or property inquiry (e.g., "emerald", "fennel", "properties of fire element")
- **Optional**: Application context (medicinal, symbolic, liturgical, practical)
- **Optional**: Related temperament or ailment (to guide property interpretation)
- **Optional**: Cross-reference request (e.g., "plants and stones for cold temperament")

## Procedure

### Step 1: Identify the Category in Physica

Determine which of the nine books of *Physica* contains the requested knowledge.

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

**Expected:** Correct book/category identified for the inquiry (e.g., "emerald" → Book IV Stones; "fennel" → Book I Plants).

**On failure:** If uncertain which category, search multiple. Example: "willow" could be Book I (plant) or Book III (tree) — Hildegard lists it in Book III as a tree with bark and wood properties.

### Step 2: Extract Properties and Applications

Retrieve the specific properties Hildegard attributes to the item.

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

**Expected:** Properties extracted with temperature, moisture, medicinal use, and symbolic associations clearly noted.

**On failure:** If *Physica* entry is brief or unclear, supplement with known temperamental logic. Example: If Hildegard says only "it is warm," infer that it treats cold conditions and avoid in hot conditions.

### Step 3: Cross-Reference Between Categories (Optional)

Identify related items across categories that share properties or work synergistically.

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

**Expected:** Related items identified across 2-3 categories that share temperament, medicinal use, or symbolic meaning. Synergistic use suggested where appropriate.

**On failure:** If cross-references are unclear, focus on single-category lookup. Cross-referencing is enrichment, not essential for basic consultation.

### Step 4: Application Guidance

Provide practical or symbolic guidance for using the knowledge.

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

**Expected:** Clear, actionable guidance for using *Physica* knowledge in context (medicinal, spiritual, seasonal, scholarly). User knows what to do with the information.

**On failure:** If application is unclear, provide the raw *Physica* entry text and let user determine application. Hildegard's entries are often self-explanatory.

### Step 5: Contextualize within Hildegard's Holistic System

Integrate *Physica* knowledge with broader Hildegardian health and spiritual practice.

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

**Expected:** User understands *Physica* as one component of Hildegard's holistic system. Cross-references to temperament, viriditas, and liturgical context provided where relevant.

**On failure:** If integration feels complex, focus on immediate practical use (Step 4) and defer holistic integration for advanced study.

## Validation Checklist

- [ ] Correct *Physica* book/category identified (I–IX)
- [ ] Properties extracted: temperature, moisture, medicinal use, symbolic meaning
- [ ] Contraindications or cautions noted (if any)
- [ ] Application guidance provided (medicinal, spiritual, seasonal, or scholarly)
- [ ] Cross-references noted (if requested) across 2+ categories
- [ ] Integration with broader Hildegardian system contextualized
- [ ] User informed this is medieval natural history, not modern scientific taxonomy

## Common Pitfalls

1. **Modern Scientific Overlay**: *Physica* is pre-scientific. Don't expect botanical accuracy by Linnaean standards
2. **Literal Ingredient Substitution**: Medieval plants may differ from modern cultivars. Research carefully before using
3. **Ignoring Temperament**: Hildegard's properties are temperamental (hot/cold, moist/dry), not chemical. Context matters
4. **Isolated Remedy Focus**: *Physica* is not a standalone herbal. It integrates with *Causae et Curae*, viriditas, and spirituality
5. **Animal Cruelty**: Some *Physica* remedies use animal parts. Adapt ethically or omit
6. **Stone Ingestion**: Some remedies involve powdering stones in wine. Modern safety: Do NOT ingest stones/minerals
7. **Symbolic Dismissal**: *Physica*'s symbolic meanings are integral to Hildegard's theology. Don't separate "practical" from "spiritual"

## Related Skills

- `formulate-herbal-remedy` — Uses *Physica* Book I (Plants) as primary source
- `assess-holistic-health` — *Physica* properties align with temperament system in *Causae et Curae*
- `practice-viriditas` — *Physica* as catalog of viriditas expressions in creation
- `compose-sacred-music` — Many chants reference *Physica* natural imagery
- `heal` (esoteric domain) — *Physica* remedies as part of holistic healing modalities
- `prepare-soil` (gardening domain) — Growing *Physica* medicinal plants
