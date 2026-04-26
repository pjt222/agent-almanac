---
name: purify-water
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Purify water from wild sources using boiling, filtration, and chemical
  methods. Covers source assessment and priority ranking, sediment pre-filtering,
  method selection (boiling, chemical, UV, filter), altitude-adjusted boiling
  procedure, chemical treatment dosages, and safe storage practices. Use when
  needing drinking water in a wilderness setting, when available water sources
  are of unknown quality, in an emergency survival situation where dehydration
  is a risk, or when making water safe for cooking or wound cleaning.
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

Purify water from wild sources to make safe for drinking. Use field-available methods.

## When Use

- Need drinking water in wilderness setting without access to treated water
- Available water sources of unknown quality (streams, rivers, lakes, ponds)
- Emergency survival situation where dehydration is a risk
- Need make water safe for cooking or wound cleaning

## Inputs

- **Required**: Water source (flowing or still)
- **Required**: Container (metal pot, bottle, improvised vessel)
- **Optional**: Purification supplies (chemical tablets, filter, UV pen)
- **Optional**: Fire-making capability for boiling (see `make-fire`)
- **Optional**: Cloth or natural filter materials for pre-filtering

## Steps

### Step 1: Assess and Pick Water Source

Not all water sources carry equal risk. Pick best available source.

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

Collect water from below surface (avoid surface film) and away from bank edge.

**Got:** Clear or slightly turbid water from best available source. Collected in clean container.

**If fail:** Only poor sources available (stagnant, turbid)? Proceed but plan for aggressive pre-filtering (Step 2). Use multiple purification methods (belt-and-suspenders approach). No water source found? Look for indicators: green vegetation in valleys, animal trails leading downhill, insect swarms at dawn/dusk. Listen for running water.

### Step 2: Pre-Filter Sediment

Remove particulate matter before purification. Sediment reduces effectiveness of chemical treatment and clogs filters.

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

For simple sediment removal, strain water through bandana, t-shirt, or multiple layers of cloth.

**Got:** Visibly clearer water with reduced turbidity. Charcoal layer removes some odor and taste.

**If fail:** Water still very turbid after filtering? Let it settle in container for 30-60 minutes. Carefully decant clearer top layer. Repeat settling or filtering process. Note: pre-filtering does NOT make water safe to drink — prepares it for purification.

### Step 3: Pick Purification Method

Pick based on available tools and conditions.

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

**Got:** Clear decision on which purification method(s) to use based on available tools.

**If fail:** No standard purification tools available? Boiling is default — needs only fire and heat-safe container. Even single-wall metal water bottle can be used for boiling. In dire emergency, container can be improvised from rock depression or green bamboo section placed near flames.

### Step 4: Boil the Water

Most reliable field purification method. Kills all pathogen classes.

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

**Got:** Water reaches vigorous rolling boil. Maintained for appropriate duration. After cooling, water is safe from biological pathogens.

**If fail:** Can't maintain rolling boil (wind, weak fire)? Extend boiling time. Container leaks or cracks? Transfer to another vessel. No metal container available? Boil water in wooden, bark, or hide container using hot rocks: heat stones in fire for 20+ minutes, then transfer to water container with tongs or sticks. Avoid river rocks (may crack or explode from trapped moisture).

### Step 5: Apply Chemical Treatment

Use when boiling is impractical or as secondary treatment.

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

**Got:** Treated water has faint chemical smell after wait period. Indicates adequate disinfection. Water safe from bacteria and viruses. Chlorine dioxide also effective against parasites.

**If fail:** Tablets expired (no smell after treatment)? Use double dose or combine with another method. Taste objectionable? Let water stand uncovered for 30 minutes to off-gas, or pour through improvised charcoal filter to improve taste. Chemical treatment your only method and you suspect Cryptosporidium (common near livestock)? Wait full 4 hours for chlorine dioxide or combine with filtration.

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

**Got:** Purified water remains safe in clean, sealed containers. System in place to avoid cross-contamination between raw and treated water.

**If fail:** Containers limited? Designate one as "raw" (collection only) and another as "clean" (purified only). Scratch or mark them distinctly. Suspect recontamination? Re-treat water before drinking.

## Checks

- [ ] Water source assessed and best available option selected
- [ ] Sediment pre-filtered from turbid water before purification
- [ ] Purification method appropriate for available tools and conditions
- [ ] Boiling reached and maintained rolling boil for altitude-adjusted duration
- [ ] Chemical treatment used correct dosage and wait time
- [ ] Purified water stored in clean, sealed, labeled containers
- [ ] Sufficient water purified to meet daily hydration needs

## Pitfalls

- **Skip pre-filtering**: Sediment reduces chemical effectiveness and clogs filters. Always pre-filter turbid water
- **Incomplete boiling**: Few bubbles on bottom is not rolling boil. Wait for vigorous, surface-breaking bubbles
- **Ignore altitude**: Water boils at lower temperatures at altitude. Increase boiling time accordingly
- **Chemical under-dosing**: Cold or turbid water needs more chemical or longer contact time
- **Cross-contamination**: Using same container for raw and purified water, or handling drinking rim with dirty hands
- **Rely on single method for worst-case sources**: For stagnant or livestock-adjacent water, use two methods (e.g. filter + chemical, or boil + chemical)

## See Also

- `make-fire` — required for boiling method. Fire also provides warmth while waiting for chemical treatment
- `forage-plants` — some plants indicate nearby water sources (willows, cattails, cottonwood). Foraged food may need clean water for preparation
