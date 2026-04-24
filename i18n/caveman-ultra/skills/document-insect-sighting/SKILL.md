---
name: document-insect-sighting
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Record insect sightings with location, date, habitat, photography, behavior
  notes, preliminary identification, and citizen science submission. Covers
  GPS coordinates, weather conditions, microhabitat description, macro
  photography techniques, behavioral observations, preliminary identification
  to order using body plan, and submission to citizen science platforms such
  as iNaturalist. Use when encountering an insect you want to document,
  contributing to citizen science biodiversity databases, building a personal
  observation journal, or supporting ecological surveys with georeferenced
  photographic records.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: entomology
  complexity: basic
  language: natural
  tags: entomology, insects, documentation, citizen-science, iNaturalist, photography
---

# Document Insect Sighting

Record insect sightings → structured data + quality photos + citizen sci submission → biodiversity research.

## Use When

- Spot insect → want to doc (personal/research)
- Contrib to iNaturalist, BugGuide
- Build systematic journal for habitat/region
- Support ecological surveys w/ georef photos
- Beginner learning insect diversity

## In

- **Required**: Sighting (live in field or recent)
- **Required**: Camera/smartphone w/ close-up capability
- **Optional**: GPS / phone w/ location
- **Optional**: Notebook / field journal
- **Optional**: Hand lens (10x) → fine detail
- **Optional**: Ruler/coin → scale ref
- **Optional**: iNaturalist or equiv account

## Do

### Step 1: Location + Date + Weather

Capture context before approaching. Many species habitat-specific + seasonally active → metadata as important as photo.

```
Sighting Record — Context:
+--------------------+------------------------------------------+
| Field              | Record                                   |
+--------------------+------------------------------------------+
| Date               | Full date and time (e.g., 2026-06-15,    |
|                    | 14:30 local time)                        |
+--------------------+------------------------------------------+
| Location           | GPS coordinates if available; otherwise   |
|                    | describe precisely (e.g., "south bank of |
|                    | Elm Creek, 200m east of footbridge")     |
+--------------------+------------------------------------------+
| Elevation          | Meters above sea level if available       |
+--------------------+------------------------------------------+
| Weather            | Temperature (estimate is fine), cloud     |
|                    | cover, wind, recent rain                 |
+--------------------+------------------------------------------+
| Season phase       | Early spring, late spring, summer, early  |
|                    | autumn, late autumn, winter              |
+--------------------+------------------------------------------+
```

→ Complete context: date + time + precise location (GPS ideal) + weather.

If err: no GPS → describe vs landmarks (trail junctions, buildings, water) → enough to relocate. Weather uncertain → estimate temp range + "overcast"/"clear" over blank.

### Step 2: Habitat + Microhabitat

Record where in landscape + immediate substrate/structure.

```
Habitat Recording:
+--------------------+------------------------------------------+
| Factor             | Record                                   |
+--------------------+------------------------------------------+
| Broad habitat      | Deciduous forest, grassland, wetland,    |
|                    | urban garden, riparian corridor, desert   |
+--------------------+------------------------------------------+
| Microhabitat       | Underside of leaf, bark crevice, flower   |
|                    | head, soil surface, under rock, on water  |
|                    | surface, in flight                       |
+--------------------+------------------------------------------+
| Substrate          | Specific plant species if known, dead     |
|                    | wood, dung, carrion, bare soil, rock     |
+--------------------+------------------------------------------+
| Plant association  | What plant is the insect on or near?     |
|                    | (host plant relationships are diagnostic) |
+--------------------+------------------------------------------+
| Light conditions   | Full sun, partial shade, deep shade       |
+--------------------+------------------------------------------+
| Moisture           | Dry, damp, wet, submerged margin          |
+--------------------+------------------------------------------+
```

→ Habitat description places insect in ecological context (landscape + microhabitat).

If err: microhabitat hard (insect in flight) → note what flying near / landed on. "In flight, 1m above meadow grasses" over blank.

### Step 3: Diagnostic Photos

Photos = most important element. Citizen sci IDs rely almost entirely on image quality.

```
Photography Protocol:

Shots to take (in priority order):
1. DORSAL (top-down) — shows wing pattern, body shape, coloration
2. LATERAL (side view) — shows leg structure, body profile, antennae
3. FRONTAL (head-on) — shows eyes, mouthparts, antennae base
4. VENTRAL (underside) — if accessible, shows leg joints, abdominal pattern
5. SCALE REFERENCE — place a coin, ruler, or finger near the insect
   for size comparison (do not touch the insect)

Tips for quality macro photographs:
- Get as close as your camera allows while maintaining focus
- Use natural light; avoid flash if possible (causes glare and flattens detail)
- Shoot against a neutral background when feasible (leaf, paper, hand)
- Hold the camera parallel to the insect's body plane for maximum sharpness
- Take multiple shots at each angle — at least 3 per view
- If the insect is moving, use burst mode or continuous shooting
- Photograph the insect in situ first, then closer shots if it remains
- Include at least one photo showing the insect in its habitat context
- If wings are open, photograph quickly — the pattern may change when
  wings close (especially butterflies and dragonflies)
```

→ ≥3 usable photos: dorsal + lateral + scale. Ideal ≥5 across angles.

If err: insect moves before all angles → prioritize dorsal (top-down) → most diagnostic for ID. Sharp dorsal > multiple blurry. Flies before any photo → sketch body shape + colors from memory immediately.

### Step 4: Behavior + Interactions

Behavioral obs add ecological value photos can't capture.

```
Behavioral Notes:
+--------------------+------------------------------------------+
| Category           | Record what you observe                  |
+--------------------+------------------------------------------+
| Activity           | Feeding, flying, resting, mating,        |
|                    | ovipositing (egg-laying), burrowing,     |
|                    | grooming, basking                        |
+--------------------+------------------------------------------+
| Movement           | Crawling, hovering, darting, undulating   |
|                    | flight, walking on water, jumping        |
+--------------------+------------------------------------------+
| Feeding            | What is it eating? Nectar, pollen, leaf   |
|                    | tissue, other insects, dung, sap?        |
+--------------------+------------------------------------------+
| Interactions       | Other insects nearby? Being predated?     |
|                    | Ants attending? Parasites visible?        |
+--------------------+------------------------------------------+
| Sound              | Buzzing, clicking, stridulation (wing or  |
|                    | leg rubbing)? Silent?                    |
+--------------------+------------------------------------------+
| Abundance          | Solitary individual, a few, many (swarm,  |
|                    | aggregation)?                            |
+--------------------+------------------------------------------+
| Duration           | How long did you observe?                 |
+--------------------+------------------------------------------+
```

→ ≥3 behavioral obs: activity + movement + abundance.

If err: brief encounter (lands, flies) → record what you did see + duration. "Resting on leaf, solitary, flew when approached, 5 sec" = useful.

### Step 5: Preliminary ID → Order

No need for species. Placing in order narrows ID + helps reviewers.

```
Quick Key to Major Insect Orders:

1. Count the legs.
   - 6 legs → insect (proceed below)
   - 8 legs → arachnid (spider, tick, mite) — not an insect
   - More than 8 legs → myriapod (centipede, millipede) — not an insect
   - Wings but hard to count legs → likely insect; look at wings

2. Examine the wings.
   - Hard front wings (elytra) covering body → Coleoptera (beetles)
   - Scaly wings, often colorful → Lepidoptera (butterflies/moths)
   - Two wings + knob-like halteres → Diptera (flies)
   - Four membranous wings + narrow waist → Hymenoptera (bees/wasps/ants)
   - Half-leathery, half-membranous front wings → Hemiptera (true bugs)
   - Large, transparent wings + long abdomen → Odonata (dragonflies/damselflies)
   - Straight, narrow, leathery front wings → Orthoptera (grasshoppers/crickets)
   - No wings, laterally flattened, jumps → Siphonaptera (fleas)
   - No wings, pale body, in wood or soil → Isoptera (termites)

3. If unsure, note: "Order uncertain — resembles [description]"
```

→ Preliminary ID to order (e.g., "Coleoptera — beetle") or honest "order uncertain" + description.

If err: no clear match → record body shape + wing type + leg count. iNaturalist accepts "Insecta" as start. Honest "unknown" > forced guess.

### Step 6: Submit to Citizen Sci Platform

Upload → experts + community verify/refine.

```
Submission Checklist for iNaturalist (or equivalent):

1. Upload photographs — start with the best dorsal shot
2. Set location — use the map pin or enter GPS coordinates
3. Set date and time of observation
4. Add initial identification (order or family if known; "Insecta" if not)
5. Add observation notes:
   - Habitat and microhabitat
   - Behavior observed
   - Approximate size
   - Any sounds produced
6. Mark as "wild" (not captive/cultivated)
7. Set location accuracy — use the uncertainty circle to reflect GPS precision
8. Submit and monitor for community identifications

Data Quality Tips:
- Observations with 3+ photos from different angles get identified faster
- Including habitat context in one photo helps remote identifiers
- Adding a size reference dramatically improves identification accuracy
- Responding to identifier questions speeds up the process
- "Research Grade" status requires 2+ agreeing identifications at species level
```

→ Complete obs submitted w/ photos + location + date + prelim ID → community review.

If err: no net in field → save photos + notes locally, upload later. Most platforms allow backdated. No account → store in journal, value for learning + upload later.

## Check

- [ ] Date + time + precise location → before approach
- [ ] Weather + habitat documented
- [ ] ≥3 photos from diff angles
- [ ] ≥1 photo w/ scale ref
- [ ] Behavior + activity noted
- [ ] Prelim order ID attempted (or honestly marked unknown)
- [ ] Submitted to citizen sci or structured journal

## Traps

- **Approach too fast**: Many flee rapid approach. Move slow + no shadow over subject. Photo from far, then close.
- **Ignore habitat context**: Insect on white wall → loses ecology. Always ≥1 in-situ photo.
- **Single photo**: One img insufficient. Wings/legs/antennae only from specific angles.
- **Forget scale**: No size ref → 5mm beetle = 50mm beetle in photo. Coin/ruler/finger for scale.
- **Force ID**: Confident-but-wrong ID creates noise for researchers. "Insecta" / "order unknown" always OK, preferred over wrong genus/species.
- **Skip negatives**: "No insects on milkweed patch" = valuable absence data. Record what checked, not just what found.

## →

- `identify-insect` — detailed morphological ID beyond order
- `observe-insect-behavior` — structured ethological protocols
- `collect-preserve-specimens` — when physical specimen needed
- `survey-insect-population` — scaling sightings → systematic pop surveys
