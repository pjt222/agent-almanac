---
name: document-insect-sighting
locale: caveman
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

Record insect sighting. Structured data, quality photos, citizen science submission for biodiversity research.

## When Use

- See an insect, want to document for personal records or research
- Contributing to citizen science platforms (iNaturalist, BugGuide)
- Building systematic observation journal for habitat or region
- Support ecological surveys with georeferenced photos
- Beginner learning to notice + record insect diversity

## Inputs

- **Required**: Insect sighting (live insect in field or recently encountered specimen)
- **Required**: Camera or smartphone with close-up photography
- **Optional**: GPS device or smartphone with location services enabled
- **Optional**: Notebook or field journal
- **Optional**: Hand lens (10x) for fine detail
- **Optional**: Ruler or coin for photo scale reference
- **Optional**: iNaturalist or similar citizen science account

## Steps

### Step 1: Record Location, Date, Weather

Capture context before approaching insect. Many species habitat-specific + seasonally active → metadata as important as photo.

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

**Got:** Full context record: date, time, precise location (ideally GPS), weather at observation time.

**If fail:** No GPS? Describe location vs landmarks (trail junctions, buildings, water features) — enough detail to relocate. Weather uncertain? Estimate temp range, note "overcast" or "clear" — never blank.

### Step 2: Document Habitat + Microhabitat

Record where in landscape insect was found + what immediate substrate or structure it used.

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

**Got:** Habitat description places insect in ecological context. Broad landscape + immediate microhabitat where insect found.

**If fail:** Microhabitat hard to characterize (insect in flight)? Note what it was flying near or what it landed on. Record "in flight, 1m above meadow grasses" — never blank.

### Step 3: Photograph with Diagnostic Quality

Good photos = single most important element of sighting record. Citizen science IDs rely almost entirely on image quality.

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

**Got:** Min 3 usable photos: dorsal, lateral, one with scale reference. Ideally 5+ images covering multiple angles.

**If fail:** Insect moves before multiple angles captured? Prioritize dorsal view — most diagnostic info for ID. One sharp dorsal > multiple blurry. Insect flies away before any photo? Sketch body shape, note colors from memory immediately.

### Step 4: Note Behavior + Interactions

Behavioral observations add ecological value photos alone can't capture.

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

**Got:** Min 3 behavioral observations: activity, movement pattern, abundance.

**If fail:** Insect encountered briefly (lands, flies away)? Record what you did observe + note observation duration. Even "resting on leaf surface, solitary, flew when approached, duration 5 seconds" = useful data.

### Step 5: Preliminary ID to Order

Don't need species. Placing insect into its order narrows ID significantly + helps citizen science reviewers.

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

**Got:** Preliminary ID to order (e.g., "Coleoptera — beetle") or honest "order uncertain" with physical description.

**If fail:** Insect doesn't match any order in quick key? Record body shape, wing type, leg count. iNaturalist accepts "Insecta" as starting ID. Community refines. Honest "unknown" > forced guess.

### Step 6: Submit to Citizen Science Platform

Upload sighting. Experts + community identifiers verify + refine ID.

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

**Got:** Full observation submitted to citizen science platform. Photos, location, date, preliminary ID. Ready for community review.

**If fail:** No internet in field? Save all photos + notes locally, upload later. Most platforms allow backdated submissions. No account? Store in personal journal — data still valuable for learning, upload later.

## Checks

- [ ] Date, time, precise location recorded before approaching insect
- [ ] Weather + habitat context documented
- [ ] Min 3 photos from different angles
- [ ] Min 1 photo with scale reference
- [ ] Behavior + activity noted
- [ ] Preliminary ID to order attempted (or honestly unknown)
- [ ] Observation submitted to citizen science platform or stored in structured journal

## Pitfalls

- **Approaching too quickly**: Many insects flee when approached fast. Move slow, avoid casting shadow over subject. Photograph far first, close gradually.
- **Ignoring habitat context**: Photo of insect on white wall loses ecological context. Always include min 1 in-situ photo showing insect in natural setting.
- **Relying on single photo**: One image often insufficient for ID. Wing pattern, leg structure, antennae only visible from specific angles.
- **Forgetting scale**: No size reference? 5mm beetle + 50mm beetle look identical in photos. Always include coin, ruler, finger.
- **Forcing ID**: Confident but wrong ID on citizen science platforms creates noise for researchers. "Insecta" or "order unknown" always acceptable, preferred over wrong genus or species.
- **Not recording negatives**: "No insects observed on milkweed patch" = valuable absence data for surveys. Record what you checked, not just what you found.

## See Also

- `identify-insect` — detailed morphological ID when you need beyond preliminary order-level
- `observe-insect-behavior` — structured ethological observation protocols for deeper study
- `collect-preserve-specimens` — when physical specimen needed for definitive ID
- `survey-insect-population` — scaling individual sightings into systematic population-level surveys
