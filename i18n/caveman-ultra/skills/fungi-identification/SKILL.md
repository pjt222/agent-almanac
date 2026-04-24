---
name: fungi-identification
locale: caveman-ultra
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

Field ID fungi via morphology + spore print + habitat + season. Safety-first.

## Use When

- Unknown fungus → ID
- Foraging edible → confirm species before eat
- Garden fungi harmful?
- Building field ID skill
- Differentiate edible from deadly look-alike

## In

- **Required**: specimen or clear in-situ observation
- **Required**: ability to observe fine details (cap, gills, stem, base)
- **Optional**: field guide for region
- **Optional**: paper + glass for spore print
- **Optional**: knife for cross-section
- **Optional**: 10× hand lens

## Do

### Step 1: Cardinal Rule

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

→ Rule internalized before ID.

**If err:** no failure mode. Rule not internalized → do not proceed for consumption.

### Step 2: Document habitat

Context narrows ID before touching.

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

→ Complete habitat record for species ID context.

**If err:** unclear (urban mixed) → record what visible. Incomplete → reduces confidence → factor into safety.

### Step 3: Examine morphology

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

→ Complete morphological description.

**If err:** feature unobservable (no ring but may have been lost) → "not observed" not "absent". Distinction matters.

### Step 4: ID via multiple confirmations

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

→ Species-level ID + explicit confidence + look-alike assessment.

**If err:** stalls at genus → OK for learning. For consumption → only "Certain" species-level.

## Check

- [ ] Cardinal rule acknowledged
- [ ] Habitat documented
- [ ] All morphology examined
- [ ] Base excavated → volva check
- [ ] Spore print (if time)
- [ ] Look-alikes ruled out
- [ ] Confidence honestly assessed
- [ ] Only "Certain" → consumption

## Traps

- **Single feature**: "looks like chanterelle" by colour alone. True chanterelle = false gills + soil near trees + apricot smell. False chanterelle + Jack-o'-lantern share colour only.
- **Skip base**: miss volva → deadly Amanita (death cap, destroying angel).
- **App trust**: AI ID apps → high error on look-alikes. Starting point not confirmation.
- **"Common = safe"**: abundance ≠ edible. Deadly can be locally abundant.
- **Taste unknown**: expert-only diagnostic. Non-expert: never taste unknown.
- **Delayed toxins**: A. phalloides → pleasant taste + 24-48 hr symptoms → liver damage by then.

## →

- `mushroom-cultivation` — growing known species eliminates ID risk
- `forage-plants` — complementary field ID, multi-feature confirmation
