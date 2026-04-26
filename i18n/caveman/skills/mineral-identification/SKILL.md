---
name: mineral-identification
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Field identification of minerals and ores using hardness, streak, luster,
  cleavage, crystal habit, and simple chemical tests. Covers the systematic
  elimination methodology, Mohs scale application, and common ore indicators
  for precious metals, gemstones, and industrial minerals. Use when encountering
  an unknown rock or mineral specimen, when prospecting and assessing whether a
  site shows valuable mineral indicators, when distinguishing ore-bearing rock
  from barren rock in the field, or when building geological literacy through
  systematic observation.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: prospecting
  complexity: intermediate
  language: natural
  tags: prospecting, minerals, geology, identification, hardness, streak, field-geology
---

# Mineral Identification

Identify minerals in field using physical properties, systematic elimination, simple field tests.

## When Use

- Find unknown rock or mineral specimen, want to identify
- Prospecting, need to assess whether site shows indicators of valuable minerals
- Want to distinguish ore-bearing rock from barren rock in field
- Building geological literacy through systematic observation

## Inputs

- **Required**: Mineral specimen or outcrop to examine
- **Optional**: Streak plate (unglazed porcelain tile or bathroom tile back)
- **Optional**: Steel nail or knife blade (hardness ~5.5)
- **Optional**: Glass plate (hardness ~5.5)
- **Optional**: Copper coin (hardness ~3.5)
- **Optional**: Hand lens (10x)
- **Optional**: Dilute hydrochloric acid (10% HCl) for carbonate test

## Steps

### Step 1: Observe Without Touching

Before handling, observe specimen in context.

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

**Got:** Field context recorded before handling specimen.

**If fail:** Geological context unclear (loose specimen, urban find)? Proceed with physical properties only — context would have helped narrow candidates but not strictly required.

### Step 2: Test Physical Properties

Apply diagnostic tests systematically.

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

**Got:** Profile of specimen: luster, hardness range, streak colour, cleavage/fracture type, relative density.

**If fail:** Property ambiguous (e.g., luster between metallic + vitreous — "sub-metallic")? Record both options. Ambiguity reduces confidence but does not prevent identification.

### Step 3: Apply Special Tests

Additional tests for specific mineral groups.

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

**Got:** Additional diagnostic data narrowing identification further.

**If fail:** Special tests unavailable (no magnet, no acid)? Proceed with basic properties — sufficient for most common minerals.

### Step 4: Identify by Elimination

Cross-reference property profile against known minerals.

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

**Got:** Mineral identification or shortlist of 2-3 candidates with distinguishing test needed to differentiate.

**If fail:** Specimen does not match any common mineral? May be rock (aggregate of minerals) rather than single mineral, or may require laboratory analysis (thin section, XRD).

## Checks

- [ ] Field context recorded before handling
- [ ] Luster assessed under natural light
- [ ] Hardness tested against at least two reference materials
- [ ] Streak colour recorded (if specimen softer than streak plate)
- [ ] Cleavage or fracture pattern noted
- [ ] Identification reached by systematic elimination, not guessing
- [ ] Look-alike minerals explicitly considered + differentiated

## Pitfalls

- **Confusing pyrite with gold**: "Fool's gold" (pyrite) is harder (6 vs 2.5), brittle (gold is malleable), streaks black (gold streaks gold). Tests are definitive — use them
- **Ignoring streak**: Specimen colour unreliable (hematite can be grey, red, or black). Streak colour consistent + diagnostic
- **Scratching with contaminated tools**: Steel nail with rust produces false streak. Clean test tools before use
- **Assuming crystal habit**: Many minerals rarely show well-formed crystals in field. Massive or granular forms more common — do not require visible crystals for identification
- **Confusing weathered surface with true colour**: Break specimen to expose fresh surface before testing. Weathering rinds can completely disguise mineral beneath

## See Also

- `gold-washing` — alluvial gold recovery uses mineral identification skills to read stream deposits + assess gold-bearing gravels
