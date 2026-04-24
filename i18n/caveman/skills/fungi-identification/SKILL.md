---
name: fungi-identification
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Field identification of fungi using morphological features, spore prints,
  habitat analysis, and seasonal context with a safety-first approach. Covers
  cap, gill, stem, and spore characteristics, look-alike differentiation,
  toxicity risk assessment, and the critical rule of absolute certainty before
  consumption. Use when encountering an unknown fungus, foraging for edible
  mushrooms and needing to confirm species before consumption, assessing whether
  fungi in a garden or property are harmful, or differentiating an edible
  species from a dangerous look-alike.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mycology
  complexity: advanced
  language: natural
  tags: mycology, fungi, mushroom, identification, foraging, safety, spore-print
---

# Fungi Identification

Find mushroom ID in field. Use shape, spore prints, habitat, season. Safety first, always.

## When Use

- Unknown fungus, need ID
- Foraging edible mushrooms, confirm species before eat
- Garden/property fungi: harmful?
- Build field ID skill with structured observation
- Tell edible from dangerous look-alike

## Inputs

- **Required**: Fungus specimen or clear observation in situ
- **Required**: Eye for fine detail (cap, gills, stem, base)
- **Optional**: Field guide for region
- **Optional**: Paper + glass for spore prints
- **Optional**: Knife for cross-section
- **Optional**: Hand lens (10x) for fine detail

## Steps

### Step 1: Cardinal Rule

Before any ID work, burn rule into head.

```
CARDINAL RULE:
If you are not 100% certain of the identification, DO NOT EAT IT.

There is no "universal edibility test" for mushrooms.
Some deadly species taste pleasant.
Some deadly species have delayed symptoms (24-72 hours).
Some deadly species have NO antidote.

The cost of a false positive (eating a misidentified mushroom) is
organ failure and death. The cost of a false negative (skipping an
edible mushroom) is a missed meal.

ALWAYS ERR TOWARD CAUTION.
```

**Got:** Cardinal rule internalized before proceeding.

**If fail:** No failure mode for this step. Rule not internalized → do not proceed to field ID for consumption.

### Step 2: Document Habitat

Context narrows ID before touching specimen.

```
Habitat Recording:
+--------------------+------------------------------------------+
| Factor             | Record                                   |
+--------------------+------------------------------------------+
| Substrate          | Soil, wood (dead/living), dung, leaf      |
|                    | litter, moss, other fungi                |
+--------------------+------------------------------------------+
| Tree association   | What trees are within 10m? (Many fungi    |
|                    | are mycorrhizal with specific tree genera)|
+--------------------+------------------------------------------+
| Moisture           | Dry, damp, wet, waterlogged              |
+--------------------+------------------------------------------+
| Light              | Full shade, dappled, open                |
+--------------------+------------------------------------------+
| Season             | Early spring, late spring, summer, early  |
|                    | autumn, late autumn, winter              |
+--------------------+------------------------------------------+
| Altitude           | Lowland, mid-altitude, montane           |
+--------------------+------------------------------------------+
| Growth pattern     | Solitary, scattered, clustered, ring,    |
|                    | shelf/bracket                            |
+--------------------+------------------------------------------+
```

**Got:** Complete habitat record gives context for species ID.

**If fail:** Habitat unclear (urban garden, mixed plantings)? Record what visible. Incomplete habitat = lower ID confidence — factor into safety check.

### Step 3: Examine Morphological Features

Systematic look at specimen.

```
Morphological Checklist:

CAP (Pileus):
- Shape: convex, flat, concave, conical, umbonate, bell-shaped
- Diameter (measure or estimate)
- Surface: smooth, scaly, fibrous, slimy, dry, cracked
- Colour (note if colour changes with age or moisture)
- Margin: smooth, striate, inrolled, appendiculate (veil remnants)

GILLS / PORES / SPINES (Hymenium):
- Type: gills (lamellae), pores (tubes), spines (teeth), smooth
- Attachment: free, adnexed, adnate, decurrent
- Spacing: crowded, close, distant
- Colour (important — note changes with age)
- Bruising: do gills change colour when damaged?

STEM (Stipe):
- Height and diameter
- Shape: equal, tapered, bulbous, club-shaped
- Surface: smooth, fibrous, scaly, reticulate (netted)
- Interior: solid, hollow, stuffed (pithy center)
- Ring (annulus): present/absent, position, persistent/fragile
- Volva (cup at base): present/absent — ALWAYS check by
  carefully excavating the base (Amanita species have a volva)

FLESH (Context):
- Colour when cut
- Colour change on exposure to air (note time to change)
- Texture: firm, brittle, fibrous, gelatinous
- Smell: mushroomy, anise, radish, flour, chlorine, unpleasant
- Taste: (ONLY if species is confirmed non-deadly by an expert;
  for unknown species, DO NOT taste)

SPORE PRINT:
- Remove the stem; place the cap gill-side down on paper
  (half white, half dark paper to see any colour)
- Cover with a glass or bowl to maintain humidity
- Wait 4-12 hours
- Record spore colour: white, cream, pink, brown, purple-brown,
  black, rust-orange
```

**Got:** Full morphological description — all major features.

**If fail:** Feature not observable (no ring visible, may have been lost)? Record "not observed" not "absent." Distinction matters for ID.

### Step 4: ID with Multiple Confirmations

Cross-reference all data vs reference material.

```
Identification Protocol:
1. Use habitat + season to narrow to likely genera
2. Use cap shape + gill type + spore colour to narrow to species group
3. Check ALL features against the candidate species description
4. Specifically check against dangerous look-alikes:
   - Does this species have a deadly doppelganger?
   - What feature distinguishes the edible from the deadly?
   - Can I see that distinguishing feature clearly?

Confidence Levels:
+----------+---------------------------+---------------------------+
| Level    | Criteria                  | Action                    |
+----------+---------------------------+---------------------------+
| Certain  | All features match; no    | Safe to collect (for      |
|          | look-alike confusion;     | experienced identifiers)  |
|          | experienced with species  |                           |
+----------+---------------------------+---------------------------+
| Probable | Most features match;      | DO NOT eat. Collect for   |
|          | one or two uncertain;     | further study (spore      |
|          | look-alike eliminated     | print, expert review)     |
+----------+---------------------------+---------------------------+
| Possible | Some features match;      | DO NOT eat. Photograph    |
|          | look-alike not fully      | and seek expert opinion   |
|          | eliminated                |                           |
+----------+---------------------------+---------------------------+
| Unknown  | Cannot narrow to species  | DO NOT eat. DO NOT        |
|          |                          | handle extensively        |
+----------+---------------------------+---------------------------+
```

**Got:** Species-level ID with explicit confidence + look-alike assessment.

**If fail:** ID stalls at genus level? OK for learning. For eating, only species-level "Certain" ID acceptable.

## Checks

- [ ] Cardinal rule acknowledged before starting
- [ ] Habitat documented before examining specimen
- [ ] All morphological features examined systematically
- [ ] Base excavated to check volva
- [ ] Spore print taken (if time allows)
- [ ] Dangerous look-alikes explicitly checked + eliminated
- [ ] Confidence level honestly assessed
- [ ] Only "Certain" IDs considered for eating

## Pitfalls

- **One-feature ID**: "Looks like chanterelle" by colour alone. True chanterelles have false gills (ridges), grow from soil near trees, apricot smell. False chanterelles + Jack-o'-lanterns share colour but differ every other feature
- **Skipping base check**: No dig = no volva — single most important feature for deadly Amanita (death cap, destroying angel)
- **Trust apps blind**: AI mushroom ID apps big error rates for look-alikes. Use as start, never as confirmation
- **"Common = safe"**: Abundance no tell edibility. Deadly species can be locally abundant
- **Tasting unknowns**: Some mycologists taste as diagnostic, needs expert knowledge of safe-to-taste species. Non-experts → no taste unknown fungi
- **Ignoring delayed toxins**: Some species (Amanita phalloides) pleasant taste + delayed symptoms. When symptoms appear (24-48h), liver damage severe

## See Also

- `mushroom-cultivation` — growing known species kills ID risk entire
- `forage-plants` — complementary field ID skill; same multi-feature confirmation method
