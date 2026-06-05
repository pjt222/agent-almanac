---
name: document-insect-sighting
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

Record insect sightings with structured data, quality photographs, and citizen science submission for biodiversity research.

## When to Use

- You encounter an insect you want to document for personal records or research
- You are contributing observations to citizen science platforms such as iNaturalist or BugGuide
- You are building a systematic observation journal for a habitat or region
- You want to support ecological surveys with georeferenced, photographed records
- You are a beginner learning to notice and record insect diversity

## Inputs

- **Required**: An insect sighting (live insect in the field or recently encountered specimen)
- **Required**: A camera or smartphone capable of close-up photography
- **Optional**: GPS device or smartphone with location services enabled
- **Optional**: Notebook or field journal for written observations
- **Optional**: Hand lens (10x) for fine detail observation
- **Optional**: Ruler or coin for photographic scale reference
- **Optional**: iNaturalist account or equivalent citizen science platform account

## Procedure

### Step 1: Record Location, Date, and Weather

Capture the context before approaching the insect. Many species are habitat-specific and seasonally active, so this metadata is as important as the photograph itself.

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

**Expected:** A complete context record with date, time, precise location (ideally GPS coordinates), and weather conditions at the time of observation.

**On failure:** If GPS is unavailable, describe the location relative to landmarks (trail junctions, buildings, water features) with enough detail that the site could be relocated. If weather data is uncertain, estimate temperature range and note "overcast" or "clear" rather than leaving the field blank.

### Step 2: Document Habitat and Microhabitat

Record where within the landscape the insect was found and what immediate substrate or structure it was using.

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

**Expected:** A description of the habitat that places the insect in ecological context, including both the broad landscape and the immediate microhabitat where the insect was found.

**On failure:** If the microhabitat is difficult to characterize (e.g., insect in flight), note what it was flying near or what it landed on. Record "in flight, 1m above meadow grasses" rather than leaving the field blank.

### Step 3: Photograph with Diagnostic Quality

Good photographs are the single most important element of a sighting record. Citizen science identifications rely almost entirely on image quality.

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

**Expected:** At least 3 usable photographs: one dorsal, one lateral, and one with scale reference. Ideally 5 or more images covering multiple angles.

**On failure:** If the insect moves before multiple angles are captured, prioritize the dorsal view (top-down) as it carries the most diagnostic information for identification. A single sharp dorsal photograph is better than multiple blurry images. If the insect flies away before any photograph, sketch the body shape and note colors from memory immediately.

### Step 4: Note Behavior and Interactions

Behavioral observations add ecological value that photographs alone cannot capture.

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

**Expected:** At least 3 behavioral observations recorded: activity, movement pattern, and abundance.

**On failure:** If the insect is encountered briefly (e.g., lands and immediately flies away), record what you did observe and note the observation duration. Even "resting on leaf surface, solitary, flew when approached, observation duration 5 seconds" is useful data.

### Step 5: Preliminary Identification to Order

You do not need to identify the species. Placing the insect into its order narrows identification significantly and helps citizen science reviewers.

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

**Expected:** A preliminary identification to order (e.g., "Coleoptera — beetle") or an honest "order uncertain" with a physical description.

**On failure:** If the insect does not clearly match any order in the quick key, record the body shape, wing type, and number of legs. Platforms like iNaturalist will accept "Insecta" as a starting identification, and community identifiers will refine it. An honest "unknown" is always better than a forced guess.

### Step 6: Submit to Citizen Science Platform

Upload the sighting to a platform where experts and community identifiers can verify and refine the identification.

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

**Expected:** A complete observation submitted to a citizen science platform with photographs, location, date, and preliminary identification, ready for community review.

**On failure:** If no internet access is available in the field, save all photographs and notes locally with the intention to upload later. Most platforms allow backdated submissions. If you do not have an account, store the record in your personal journal — the data still has value for your own learning and can be uploaded later.

## Validation

- [ ] Date, time, and precise location were recorded before approaching the insect
- [ ] Weather and habitat context were documented
- [ ] At least 3 photographs were taken from different angles
- [ ] At least one photograph includes a scale reference
- [ ] Behavior and activity were noted
- [ ] A preliminary identification to order was attempted (or honestly marked as unknown)
- [ ] The observation was submitted to a citizen science platform or stored in a structured journal

## Common Pitfalls

- **Approaching too quickly**: Many insects flee when approached rapidly. Move slowly and avoid casting your shadow over the subject. Photograph from farther away first, then gradually close distance
- **Ignoring habitat context**: A photograph of an insect on a white wall loses the ecological context. Always include at least one in-situ photograph showing the insect in its natural setting
- **Relying on a single photograph**: One image is often insufficient for identification. Wing pattern, leg structure, and antennae may only be visible from specific angles
- **Forgetting scale**: Without a size reference, a 5mm beetle and a 50mm beetle can look identical in photographs. Always include a coin, ruler, or finger for scale
- **Forcing an identification**: Submitting a confident but incorrect identification on citizen science platforms creates noise for researchers. "Insecta" or "order unknown" is always acceptable and preferred over a wrong genus or species
- **Not recording negatives**: "No insects observed on milkweed patch" is valuable absence data for surveys. Record what you checked, not just what you found

## Related Skills

- `identify-insect` — detailed morphological identification procedure when you need to go beyond preliminary order-level placement
- `observe-insect-behavior` — structured ethological observation protocols for deeper behavioral study
- `collect-preserve-specimens` — when a physical specimen is needed for definitive identification
- `survey-insect-population` — scaling individual sightings into systematic population-level surveys
