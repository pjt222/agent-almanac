---
name: make-fire
description: >
  Start + maintain fire via friction, spark, solar. Site select, material
  grade (tinder/kindling/fuel), lay (teepee, log cabin, platform), ignite
  (ferro rod, flint+steel, bow drill), nurture, LNT extinguish. Use → warmth,
  light, signal; boil water; cook; emergency survival.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: bushcraft
  complexity: intermediate
  language: natural
  tags: bushcraft, fire, survival, wilderness, primitive-skills
  locale: caveman-ultra
  source_locale: en
  source_commit: 1861e6a6
  translator: "Julius Brussee homage — caveman"
  translation_date: "2026-04-17"
---

# Make Fire

Start + maintain fire in wilderness w/ natural + carried materials.

## Use When

- Need warmth, light, signal
- Boil water → purify (see `purify-water`)
- Cook foraged/hunted food (see `forage-plants`)
- Emergency → heat, morale

## In

- **Required**: Ignition (ferro rod, flint+steel, lighter, bow drill, lens)
- **Required**: Dry tinder
- **Optional**: Site constraints (wind, ground, cover)
- **Optional**: Purpose (warmth, cooking, signal, purify)

## Do

### Step 1: Site

Safe, functional, low impact.

```
Site Selection Criteria:
┌─────────────────────┬────────────────────────────────────┐
│ Factor              │ Requirement                        │
├─────────────────────┼────────────────────────────────────┤
│ Wind                │ Sheltered or with a windbreak      │
│ Ground              │ Mineral soil, rock, or sand        │
│ Overhead clearance  │ No branches within 3 m / 10 ft    │
│ Distance from water │ At least 5 m / 15 ft from streams │
│ Distance from camp  │ Close enough for use, far enough   │
│                     │ to avoid spark hazards to gear     │
│ Drainage            │ Slight slope or flat; avoid hollows│
│                     │ where rain pools                   │
└─────────────────────┴────────────────────────────────────┘
```

Clear 1 m / 3 ft circle → mineral soil. Snow/wet → platform of green logs or flat stones.

→ Cleared, level site, no debris in circle, clear overhead, wind-shielded.

If err: no ground → raised platform, 4-6 green wrist-thick logs side by side. Wind strong → windbreak from logs, rocks, or tarp at 45°.

### Step 2: Gather + Grade

Three categories, graded by dryness + size.

```
Material Grading:
┌──────────┬──────────────────┬──────────────┬───────────────────────────┐
│ Category │ Diameter         │ Examples     │ Quantity needed           │
├──────────┼──────────────────┼──────────────┼───────────────────────────┤
│ Tinder   │ Hair-thin fibers │ Birch bark,  │ Two fist-sized bundles    │
│          │                  │ dried grass, │                           │
│          │                  │ cedar bark,  │                           │
│          │                  │ fatwood      │                           │
│          │                  │ shavings,    │                           │
│          │                  │ cattail fluff│                           │
├──────────┼──────────────────┼──────────────┼───────────────────────────┤
│ Kindling │ Pencil-thin to   │ Dead twigs,  │ Two armfuls, sorted by   │
│          │ finger-thick     │ split sticks │ thickness                │
├──────────┼──────────────────┼──────────────┼───────────────────────────┤
│ Fuel     │ Wrist-thick to   │ Dead standing│ Enough for intended burn │
│          │ arm-thick        │ wood, split  │ time (1 armload ≈ 1 hr)  │
│          │                  │ logs         │                           │
└──────────┴──────────────────┴──────────────┴───────────────────────────┘

Dryness Test:
- Snap test: dry wood snaps cleanly; damp wood bends
- Sound test: dry wood clicks when struck together; damp wood thuds
- Source priority: dead standing > dead leaning > dead on dry ground > dead on wet ground
```

→ Three sorted piles, arm's reach. Tinder bone-dry + fine. Kindling snaps clean.

If err: all damp → scrape inner bark (cedar, birch, poplar) → fine fibers. Fatwood ignites wet. Last resort → carried starters (cotton+petroleum jelly, wax cardboard).

### Step 3: Build Lay

Choose lay → purpose + conditions.

```
Fire Lay Decision Table:
┌──────────────┬──────────────────────┬──────────────────────────┐
│ Fire Lay     │ Best for             │ Construction             │
├──────────────┼──────────────────────┼──────────────────────────┤
│ Teepee       │ Quick start, boiling │ Lean kindling against    │
│              │ water, signaling     │ a central tinder bundle  │
│              │                      │ in a cone shape          │
├──────────────┼──────────────────────┼──────────────────────────┤
│ Log cabin    │ Sustained heat,      │ Stack pairs of sticks in │
│              │ cooking, drying      │ alternating layers like  │
│              │                      │ a cabin; tinder in center│
├──────────────┼──────────────────────┼──────────────────────────┤
│ Lean-to      │ Windy conditions     │ Push a green stick into  │
│              │                      │ ground at 30°; lean      │
│              │                      │ kindling against it with │
│              │                      │ tinder underneath        │
├──────────────┼──────────────────────┼──────────────────────────┤
│ Platform     │ Snow/wet ground      │ Lay green logs side by   │
│              │                      │ side as a base; build    │
│              │                      │ teepee or log cabin on   │
│              │                      │ top                      │
├──────────────┼──────────────────────┼──────────────────────────┤
│ Star/Radial  │ Long burns with      │ Lay 4-5 logs radiating   │
│              │ minimal fuel         │ from center like spokes; │
│              │                      │ push inward as they burn │
└──────────────┴──────────────────────┴──────────────────────────┘
```

Leave gaps → airflow. Fire needs O2 → pack loose, not tight.

→ Stable structure, tinder accessible, airflow gaps, kindling → flame climbs tinder → kindling → fuel.

If err: collapses → support stick driven in ground as post. Smokes won't flame → open gaps, wind side open at base.

### Step 4: Ignite

Method → available tools.

```
Ignition Methods (ranked by reliability):
┌───────────────┬────────────────────────────────────────────────┐
│ Method        │ Technique                                      │
├───────────────┼────────────────────────────────────────────────┤
│ Lighter/match │ Apply flame directly to tinder for 5-10 sec   │
├───────────────┼────────────────────────────────────────────────┤
│ Ferro rod     │ Hold rod against tinder; scrape striker down   │
│               │ rod at 45° with firm, fast strokes; direct     │
│               │ sparks into center of tinder bundle            │
├───────────────┼────────────────────────────────────────────────┤
│ Flint & steel │ Strike steel against flint edge to cast sparks │
│               │ onto char cloth laid on tinder                 │
├───────────────┼────────────────────────────────────────────────┤
│ Bow drill     │ Carve fireboard notch; place tinder below;     │
│               │ spin spindle with bow using steady, full-length│
│               │ strokes until coal forms in notch              │
├───────────────┼────────────────────────────────────────────────┤
│ Solar (lens)  │ Focus sunlight through lens onto dark tinder;  │
│               │ hold steady until smoke appears; gently blow   │
└───────────────┴────────────────────────────────────────────────┘
```

→ Tinder glows (ember) or small flame within 30 sec.

If err: sparks land, tinder won't catch → too damp or coarse. Process finer (scrape, shred, fluff). Ferro rod → add magnesium shavings as accelerant. Bow drill → spindle+fireboard same dry softwood (willow, cedar, poplar), notch reaches center.

### Step 5: Nurture

Ember → flame carefully.

1. Ember (bow drill, flint+steel) → fold bundle around, blow gently, steady increasing breaths → flame
2. Flaming bundle → fire lay
3. Shield wind w/ body or break
4. Thinnest kindling first → pencil-thin sticks where flame touches
5. Wait for catch before adding more

→ Flames climb tinder → smallest kindling in 1-2 min. Crackling → self-sustaining.

If err: dies at kindling → too thick or damp. Split thinner, use driest. Suffocates → lay too tight, lift material gently. No hard blow → scatters embers.

### Step 6: Fuel Up

Progressive size increase.

1. Kindling burns steady (2-3 min) → add finger-thick
2. Catch fully → add wrist-thick
3. Arrange fuel → maintain airflow: lean or cross-stack
4. Cooking → burn down to coal bed (20-30 min) before pot/grill

```
Fuel Progression:
  Tinder → Pencil-thin → Finger-thick → Wrist-thick → Arm-thick
  (each stage must be established before adding the next)
```

→ Stable, self-sustaining fire, consistent heat, refuel every 15-30 min.

If err: dies when adding larger → jumping sizes. Back one size smaller, build bigger coal bed. Hisses/steams → too wet, split → expose dry inner, or prop near (not on) fire to dry.

### Step 7: Extinguish + LNT

```
Extinguishing Protocol:
1. Stop adding fuel 30-60 min before you need the fire out
2. Let wood burn down to ash
3. Spread coals and ash with a stick
4. Douse with water (pour, stir, pour again)
5. Feel with the back of your hand 10 cm / 4 in above the ashes
6. If any warmth is felt, repeat douse-stir-douse
7. When cold to touch, scatter the ash over a wide area
8. Replace any ground cover or duff that was moved
9. "Could someone walk by and not know a fire was here?"
```

→ Site cold to touch, no visible coals, area undisturbed.

If err: no water → smother w/ mineral soil (not organic duff → smolders). Stir + check repeatedly. Never leave until cold. Coals in deep ash → scrape aside, douse exposed.

## Check

- [ ] Site cleared → mineral soil or platform built
- [ ] Materials gathered in 3 graded categories before ignite
- [ ] Lay allowed airflow
- [ ] Tinder → kindling no die
- [ ] Fire reached self-sustaining fuel stage
- [ ] Fully extinguished → cold touch, no embers
- [ ] LNT site

## Traps

- **Damp tinder**: Most common fail. Process finer than you think. Source dead standing.
- **Smother w/ fuel**: Too much wood too fast → cuts O2. Gradual build.
- **Ignore wind**: Helps or kills. Use for airflow, shield during ignite.
- **Bad sort**: Searching kindling while tinder burns → wastes time. Gather+sort before spark.
- **Wet ground**: Dry wood on wet ground → heat loss. Platform in damp.
- **Incomplete extinguish**: Buried coals reignite hours later. Always verify cold touch.

## →

- `purify-water` — boil needs sustained fire; boil method depends on this
- `forage-plants` — many plants → tinder (birch, cattail, grass); some need cooking
- `paper-making` — handcraft paper from fibres; shares fibre prep + pulping w/ tinder prep
