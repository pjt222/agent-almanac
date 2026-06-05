---
name: purify-water
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

Purify water from wild sources to make it safe for drinking using field-available methods.

## When to Use

- You need drinking water in a wilderness setting without access to treated water
- Available water sources are of unknown quality (streams, rivers, lakes, ponds)
- Emergency survival situation where dehydration is a risk
- You need to make water safe for cooking or wound cleaning

## Inputs

- **Required**: A water source (flowing or still)
- **Required**: A container (metal pot, bottle, or improvised vessel)
- **Optional**: Purification supplies (chemical tablets, filter, UV pen)
- **Optional**: Fire-making capability for boiling (see `make-fire`)
- **Optional**: Cloth or natural filter materials for pre-filtering

## Procedure

### Step 1: Assess and Select the Water Source

Not all water sources carry equal risk. Choose the best available source.

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

Collect water from below the surface (avoid surface film) and away from the bank edge.

**Expected:** Clear or slightly turbid water from the best available source, collected in a clean container.

**On failure:** If only poor sources are available (stagnant, turbid), proceed but plan for aggressive pre-filtering (Step 2) and use multiple purification methods (belt-and-suspenders approach). If no water source is found, look for indicators: green vegetation in valleys, animal trails leading downhill, insect swarms at dawn/dusk, and listen for running water.

### Step 2: Pre-Filter Sediment

Remove particulate matter before purification. Sediment reduces the effectiveness of chemical treatment and clogs filters.

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

For simple sediment removal, strain water through a bandana, t-shirt, or multiple layers of cloth.

**Expected:** Visibly clearer water with reduced turbidity. Charcoal layer removes some odor and taste.

**On failure:** If water is still very turbid after filtering, let it settle in a container for 30-60 minutes. Carefully decant the clearer top layer. Repeat the settling or filtering process. Note: pre-filtering does NOT make water safe to drink — it prepares it for purification.

### Step 3: Select Purification Method

Choose based on available tools and conditions.

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

**Expected:** A clear decision on which purification method(s) to use based on available tools.

**On failure:** If no standard purification tools are available, boiling is the default — it requires only fire and a heat-safe container. Even a single-wall metal water bottle can be used for boiling. In a dire emergency, a container can be improvised from a rock depression or green bamboo section placed near flames.

### Step 4: Boil the Water

The most reliable field purification method. Kills all pathogen classes.

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

**Expected:** Water reaches a vigorous rolling boil and is maintained for the appropriate duration. After cooling, the water is safe from biological pathogens.

**On failure:** If you cannot maintain a rolling boil (wind, weak fire), extend the boiling time. If the container leaks or cracks, transfer to another vessel. If no metal container is available, you can boil water in a wooden, bark, or hide container using hot rocks: heat stones in the fire for 20+ minutes, then transfer them to the water container with tongs or sticks. Avoid river rocks (may crack or explode from trapped moisture).

### Step 5: Apply Chemical Treatment

Use when boiling is impractical or as a secondary treatment.

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

**Expected:** Treated water has a faint chemical smell after the wait period, indicating adequate disinfection. Water is safe from bacteria and viruses; chlorine dioxide is also effective against parasites.

**On failure:** If tablets are expired (no smell after treatment), use a double dose or combine with another method. If the taste is objectionable, let the water stand uncovered for 30 minutes to off-gas, or pour through an improvised charcoal filter to improve taste. If chemical treatment is your only method and you suspect Cryptosporidium (common near livestock), wait the full 4 hours for chlorine dioxide or combine with filtration.

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

**Expected:** Purified water remains safe in clean, sealed containers. A system is in place to avoid cross-contamination between raw and treated water.

**On failure:** If containers are limited, designate one as "raw" (collection only) and another as "clean" (purified only). Scratch or mark them distinctly. If you suspect recontamination, re-treat the water before drinking.

## Validation

- [ ] Water source was assessed and the best available option was selected
- [ ] Sediment was pre-filtered from turbid water before purification
- [ ] Purification method was appropriate for available tools and conditions
- [ ] Boiling reached and maintained a rolling boil for the altitude-adjusted duration
- [ ] Chemical treatment used correct dosage and wait time
- [ ] Purified water stored in clean, sealed, labeled containers
- [ ] Sufficient water purified to meet daily hydration needs

## Common Pitfalls

- **Skipping pre-filtering**: Sediment reduces chemical effectiveness and clogs filters. Always pre-filter turbid water
- **Incomplete boiling**: A few bubbles on the bottom is not a rolling boil. Wait for vigorous, surface-breaking bubbles
- **Ignoring altitude**: Water boils at lower temperatures at altitude. Increase boiling time accordingly
- **Chemical under-dosing**: Cold or turbid water requires more chemical or longer contact time
- **Cross-contamination**: Using the same container for raw and purified water, or handling the drinking rim with dirty hands
- **Relying on a single method for worst-case sources**: For stagnant or livestock-adjacent water, use two methods (e.g., filter + chemical, or boil + chemical)

## Related Skills

- `make-fire` — required for the boiling method; fire also provides warmth while waiting for chemical treatment
- `forage-plants` — some plants indicate nearby water sources (willows, cattails, cottonwood); foraged food may require clean water for preparation
