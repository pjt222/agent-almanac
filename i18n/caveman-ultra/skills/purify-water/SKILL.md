---
name: purify-water
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Purify water from wild sources via boiling, filtration, chemical methods.
  Source assessment + priority ranking, sediment pre-filter, method selection
  (boiling, chemical, UV, filter), altitude-adjusted boiling, chemical dosages,
  safe storage. Use → wilderness drinking water, unknown quality sources,
  emergency dehydration risk, water safe for cooking or wound cleaning.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: bushcraft
  complexity: intermediate
  language: natural
  tags: bushcraft, water, purification, survival, wilderness, filtration
---

# Purify Water

Purify wild sources → safe drinking water via field-available methods.

## Use When

- Need drinking water in wilderness, no treated water access
- Sources unknown quality (streams, rivers, lakes, ponds)
- Emergency survival, dehydration risk
- Water safe for cooking or wound cleaning

## In

- **Required**: Water source (flowing or still)
- **Required**: Container (metal pot, bottle, improvised)
- **Optional**: Purification supplies (chemical tablets, filter, UV pen)
- **Optional**: Fire-making for boiling (see `make-fire`)
- **Optional**: Cloth or natural filter materials for pre-filter

## Do

### Step 1: Assess + Select Source

Not all sources equal risk. Pick best available.

```
Water Source Priority Ranking (best to worst):
┌──────┬─────────────────────────┬────────────────────────────────────┐
│ Rank │ Source                  │ Notes                              │
├──────┼─────────────────────────┼────────────────────────────────────┤
│ 1    │ Spring (at the source)  │ Lowest contamination; still treat  │
│ 2    │ Fast-flowing stream     │ Moving water has fewer pathogens   │
│      │ (above human activity)  │ than still water                   │
│ 3    │ Large river             │ Dilution helps but agriculture/    │
│      │                         │ industry upstream is a concern     │
│ 4    │ Large lake              │ Collect from open water, not shore │
│ 5    │ Small pond or puddle    │ High pathogen and parasite risk    │
│ 6    │ Stagnant pool           │ Last resort; heavy treatment needed│
└──────┴─────────────────────────┴────────────────────────────────────┘

Warning Signs (avoid if possible):
- Dead animals nearby
- Algae bloom (blue-green scum)
- Chemical odor or oily sheen
- Downstream of mining, agriculture, or settlements
- No surrounding vegetation (may indicate toxic soil)
```

Collect below surface (avoid surface film), away from bank edge.

→ Clear or slightly turbid water from best available source, in clean container.

If err: only poor sources available (stagnant, turbid) → proceed but plan aggressive pre-filtering (Step 2) + multiple methods (belt-and-suspenders). No source found → look for indicators: green vegetation in valleys, animal trails downhill, insect swarms at dawn/dusk, listen for running water.

### Step 2: Pre-Filter Sediment

Remove particulate before purification. Sediment reduces chemical effectiveness + clogs filters.

```
Improvised Gravity Filter (layered in a container with a hole at the bottom):

    ┌─────────────────────┐  ← Open top: pour water in
    │  Grass / cloth      │  ← Coarse pre-filter
    │  Fine sand          │  ← Removes fine particles
    │  Charcoal (crushed) │  ← Adsorbs some chemicals and odors
    │  Gravel             │  ← Structural support
    │  Grass / cloth      │  ← Prevents gravel from falling through
    └────────┬────────────┘
             │
        Filtered water drips out

Materials:
- Container: birch bark cone, hollow log, cut plastic bottle, sock
- Sand: fine, clean sand (rinse first if possible)
- Charcoal: from a previous fire (NOTite ash — charcoal only)
- Gravel: small stones, rinsed
```

Simple sediment removal → strain through bandana, t-shirt, multiple cloth layers.

→ Visibly clearer water, reduced turbidity. Charcoal removes some odor + taste.

If err: still very turbid after filtering → settle 30-60 min. Carefully decant clearer top layer. Repeat. Note: pre-filtering does NOT make water safe — prepares for purification.

### Step 3: Select Purification Method

Choose by available tools + conditions.

```
Purification Method Comparison:
┌───────────────┬────────────┬───────────┬────────────┬──────────────────────┐
│ Method        │ Kills      │ Time      │ Requires   │ Limitations          │
│               │ bacteria/  │           │            │                      │
│               │ viruses/   │           │            │                      │
│               │ parasites  │           │            │                      │
├───────────────┼────────────┼───────────┼────────────┼──────────────────────┤
│ Boiling       │ Yes/Yes/Yes│ 1-3 min   │ Fire, metal│ Fuel, time, does not │
│               │            │ (rolling) │ container  │ remove chemicals     │
├───────────────┼────────────┼───────────┼────────────┼──────────────────────┤
│ Chlorine      │ Yes/Yes/   │ 30 min    │ Tablets or │ Less effective in    │
│ dioxide tabs  │ Yes        │           │ drops      │ cold/turbid water    │
├───────────────┼────────────┼───────────┼────────────┼──────────────────────┤
│ Iodine        │ Yes/Yes/   │ 30 min    │ Tablets or │ Taste; not for       │
│               │ Partial    │           │ tincture   │ pregnant/thyroid     │
│               │            │           │            │ conditions; weak     │
│               │            │           │            │ against Crypto       │
├───────────────┼────────────┼───────────┼────────────┼──────────────────────┤
│ UV pen        │ Yes/Yes/Yes│ 60-90 sec │ UV device, │ Requires clear water;│
│               │            │ per liter │ batteries  │ battery dependent    │
├───────────────┼────────────┼───────────┼────────────┼──────────────────────┤
│ Pump/squeeze  │ Yes/No*/   │ Immediate │ Filter     │ Most don't remove    │
│ filter        │ Yes        │           │ device     │ viruses (*unless     │
│               │            │           │            │ 0.02 micron)         │
├───────────────┼────────────┼───────────┼────────────┼──────────────────────┤
│ SODIS (solar) │ Yes/Yes/   │ 6-48 hrs  │ Clear PET  │ Slow; needs sun;     │
│               │ Partial    │           │ bottle,    │ only 1-2 L at a time │
│               │            │           │ sunlight   │                      │
└───────────────┴────────────┴───────────┴────────────┴──────────────────────┘

Decision logic:
- Have fire + metal pot?          → Boil (most reliable)
- Have chemical tablets?          → Chemical treatment
- Have filter + tablet combo?     → Filter then treat (belt-and-suspenders)
- Sunny day + clear PET bottles?  → SODIS as a backup method
- Multiple methods available?     → Use two for maximum safety
```

→ Clear decision on method(s) based on available tools.

If err: no standard tools → boiling = default, needs only fire + heat-safe container. Even single-wall metal water bottle works. Dire emergency → improvise from rock depression or green bamboo section near flames.

### Step 4: Boil Water

Most reliable field method. Kills all pathogen classes.

```
Boiling Procedure:
1. Bring water to a ROLLING boil (large bubbles breaking the surface)
2. Maintain rolling boil for:
   - Sea level to 2000 m / 6500 ft:  1 minute
   - 2000-4000 m / 6500-13000 ft:    3 minutes
   - Above 4000 m / 13000 ft:        5 minutes
3. Remove from heat
4. Allow to cool in the covered container
5. If taste is flat, pour between two containers several times to aerate

Altitude Adjustment:
  Water boils at lower temperatures at altitude.
  At 3000 m / 10000 ft, water boils at ~90°C / 194°F.
  Longer boiling compensates for the lower temperature.

Fuel Estimate:
  Boiling 1 L requires roughly 15-20 min of sustained fire
  depending on container, wind, and starting temperature.
```

→ Vigorous rolling boil maintained for appropriate duration. After cool, safe from biological pathogens.

If err: can't maintain rolling boil (wind, weak fire) → extend time. Container leaks/cracks → transfer to another vessel. No metal container → boil in wooden, bark, or hide container w/ hot rocks: heat stones in fire 20+ min, transfer to water container w/ tongs or sticks. Avoid river rocks (may crack/explode from trapped moisture).

### Step 5: Apply Chemical Treatment

When boiling impractical or as secondary treatment.

```
Chemical Treatment Dosages:
┌─────────────────────┬──────────────────┬────────────┬─────────────────────┐
│ Chemical            │ Dose per liter   │ Wait time  │ Notes               │
├─────────────────────┼──────────────────┼────────────┼─────────────────────┤
│ Chlorine dioxide    │ Per manufacturer │ 30 min     │ Most effective      │
│ tablets             │ (usually 1 tab   │ (4 hrs for │ chemical method;    │
│ (e.g., Aquamira,   │ per 1 L)         │ Crypto)    │ kills all pathogens │
│ Katadyn Micropur)   │                  │            │                     │
├─────────────────────┼──────────────────┼────────────┼─────────────────────┤
│ Iodine tablets      │ 1-2 tablets per  │ 30 min     │ Weak against        │
│                     │ liter            │            │ Cryptosporidium     │
├─────────────────────┼──────────────────┼────────────┼─────────────────────┤
│ Tincture of iodine  │ 5 drops per      │ 30 min     │ Double dose for     │
│ (2%)                │ liter (clear)    │ (60 min if │ cloudy water        │
│                     │ 10 drops per     │ cold/turbid│                     │
│                     │ liter (cloudy)   │ )          │                     │
├─────────────────────┼──────────────────┼────────────┼─────────────────────┤
│ Household bleach    │ 2 drops per      │ 30 min     │ Must be unscented,  │
│ (5-8% sodium        │ liter (clear)    │            │ plain bleach;       │
│ hypochlorite)       │ 4 drops per      │            │ check expiry date   │
│                     │ liter (cloudy)   │            │                     │
└─────────────────────┴──────────────────┴────────────┴─────────────────────┘

After treatment, water should have a slight chlorine/iodine smell.
If no smell is detected, add half the original dose and wait another 15 min.

Cold/turbid water adjustment:
- Temperature below 5°C / 40°F: double the wait time
- Turbid water: double the dose OR pre-filter first (recommended)
```

→ Treated water has faint chemical smell after wait → adequate disinfection. Safe from bacteria + viruses; chlorine dioxide also effective against parasites.

If err: tablets expired (no smell after treatment) → double dose or combine w/ another method. Taste objectionable → stand uncovered 30 min to off-gas, or pour through improvised charcoal filter. Chemical only + suspect Cryptosporidium (livestock) → wait full 4 hrs for chlorine dioxide or combine w/ filtration.

### Step 6: Store Safely

Purified water can be recontaminated through dirty containers or hands.

```
Safe Storage Practices:
1. Store in clean, dedicated containers (do not reuse unpurified containers)
2. If reusing a container, rinse it with a small amount of purified water first
3. Keep containers sealed or covered
4. Mark or separate "raw" and "purified" containers
   (e.g., tie a knot in the purified bottle's paracord handle)
5. Avoid reaching into containers with hands — pour, don't dip
6. In warm weather, consume within 24 hours
7. Re-treat water that has been stored more than 24 hours

Hydration Planning:
- Minimum: 2 L / 0.5 gal per day (sedentary, cool weather)
- Active: 4-6 L / 1-1.5 gal per day (hiking, hot weather)
- Plan purification capacity to meet daily needs
```

→ Purified water safe in clean sealed containers. System avoids cross-contamination.

If err: containers limited → designate one "raw" (collection only), another "clean" (purified only). Scratch/mark distinctly. Suspect recontamination → re-treat before drinking.

## Check

- [ ] Source assessed + best available picked
- [ ] Sediment pre-filtered from turbid water before purification
- [ ] Method appropriate for available tools + conditions
- [ ] Boiling reached + maintained rolling boil for altitude-adjusted duration
- [ ] Chemical treatment correct dosage + wait time
- [ ] Purified water stored in clean, sealed, labeled containers
- [ ] Sufficient water purified for daily hydration

## Traps

- **Skip pre-filter**: Sediment reduces chemical effectiveness + clogs filters. Always pre-filter turbid.
- **Incomplete boiling**: Few bubbles on bottom ≠ rolling boil. Wait for vigorous surface-breaking bubbles.
- **Ignore altitude**: Water boils at lower temps at altitude. Increase boiling time.
- **Chemical under-dose**: Cold or turbid → more chemical or longer contact time.
- **Cross-contamination**: Same container for raw + purified, or handling drinking rim w/ dirty hands.
- **Single method for worst-case**: Stagnant or livestock-adjacent → 2 methods (filter + chemical, or boil + chemical).

## →

- `make-fire` — required for boiling; fire also provides warmth while waiting for chemical treatment
- `forage-plants` — some plants indicate nearby water (willows, cattails, cottonwood); foraged food may need clean water for prep
