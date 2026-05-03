---
name: sharpen-knife
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Sharpen and maintain knives using whetstones, field stones, and improvised
  abrasives. Covers blade anatomy, bevel assessment, whetstone technique
  (coarse to fine progression), stropping, sharpness testing, field sharpening
  methods, and ongoing edge maintenance. Use when a knife fails the fingernail
  test, when cutting tasks require excessive pressure, before a trip where a
  sharp blade is essential, after heavy use, or when a blade has visible nicks
  or a rolled edge. Applicable to bushcraft blades, folding knives, and garden
  cutting tools.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: bushcraft
  complexity: intermediate
  language: natural
  tags: bushcraft, knife, sharpening, blade, maintenance, whetstone, tools, gardening
---

# Sharpen Knife

Sharpen, maintain knife edge with whetstones, strops, field methods.

## When Use

- Knife fails catch on fingernail when drawn light across edge
- Cutting tasks need excessive pressure or produce ragged cuts
- Before trip or task where sharp blade essential (carving, food prep, batoning)
- Routine maintenance after heavy use (every 1-3 field days)
- Blade has visible nicks, chips, or rolled edge

## Inputs

- **Required**: Knife to sharpen
- **Required**: Abrasive surface (whetstone, diamond plate, ceramic rod, or field stone)
- **Optional**: Strop (leather belt, cardboard, or smooth wood) with compound
- **Optional**: Angle guide or coin for bevel reference
- **Optional**: Marker (Sharpie) for bevel visualization
- **Optional**: Honing oil or water (depends on stone type)

## Steps

### Step 1: Assess Blade

Examine knife. Determine what level of sharpening needed.

```
Blade Assessment:
┌─────────────────────┬──────────────────────────────────┬─────────────────────┐
│ Condition           │ Signs                            │ Action Needed       │
├─────────────────────┼──────────────────────────────────┼─────────────────────┤
│ Dull (most common)  │ Won't catch on fingernail;       │ Medium grit → fine  │
│                     │ slides off tomato skin;          │ grit → strop        │
│                     │ reflects light along edge        │                     │
├─────────────────────┼──────────────────────────────────┼─────────────────────┤
│ Very dull / abused  │ Visible flat spot along edge;    │ Coarse grit →       │
│                     │ tears rather than cuts;          │ medium → fine →     │
│                     │ edge shines under light          │ strop               │
├─────────────────────┼──────────────────────────────────┼─────────────────────┤
│ Nicked / chipped    │ Visible notches in edge;         │ Coarse grit to      │
│                     │ snags on material when drawing   │ grind past nicks →  │
│                     │ across                           │ reprofile → strop   │
├─────────────────────┼──────────────────────────────────┼─────────────────────┤
│ Slightly dull       │ Catches on fingernail but not    │ Strop only (or a    │
│ (maintenance)       │ crisply; still cuts paper but    │ few passes on fine  │
│                     │ not cleanly                      │ grit then strop)    │
├─────────────────────┼──────────────────────────────────┼─────────────────────┤
│ Rolled edge         │ Edge feels sharp on one side     │ Strop firmly on     │
│                     │ but dull on the other; blade     │ both sides; if that │
│                     │ curves microscopically           │ fails, light passes │
│                     │                                  │ on fine stone       │
└─────────────────────┴──────────────────────────────────┴─────────────────────┘

Light Test:
Hold the blade edge-on under a bright light. A sharp edge is invisible —
it has no width. A dull edge reflects a thin line of light where metal
has folded or flattened.
```

**Got:** Know blade's condition and which grits to use.

**If fail:** Unsure? Start with medium grit (1000). Always refine further, but start too coarse on near-sharp blade removes unnecessary metal.

### Step 2: Know Abrasives

Choose right stone for job.

```
Abrasive Types:
┌─────────────────────┬─────────────────────────────────┬──────────────────────┐
│ Type                │ Characteristics                 │ Best For             │
├─────────────────────┼─────────────────────────────────┼──────────────────────┤
│ Water stones        │ Soak 5-15 min before use;       │ Home sharpening;     │
│ (natural/synthetic) │ fast cutting; wear quickly;      │ best feedback and    │
│                     │ need flattening periodically     │ finest edges         │
├─────────────────────┼─────────────────────────────────┼──────────────────────┤
│ Diamond plates      │ No soaking needed (use water    │ Field use; hard      │
│                     │ as lubricant); very durable;     │ steels; flattening   │
│                     │ aggressive cut                   │ water stones         │
├─────────────────────┼─────────────────────────────────┼──────────────────────┤
│ Ceramic stones/rods │ No soaking; very fine grit;     │ Touch-up and         │
│                     │ hard and slow-wearing            │ maintenance; field   │
│                     │                                  │ carry                │
├─────────────────────┼─────────────────────────────────┼──────────────────────┤
│ Oil stones          │ Use honing oil; slower cutting;  │ Traditional;         │
│ (Arkansas, India)   │ very durable; less messy         │ workshop use         │
├─────────────────────┼─────────────────────────────────┼──────────────────────┤
│ Field stones        │ Any smooth, fine-grained stone;  │ Wilderness emergency │
│ (improvised)        │ river stones, slate, sandstone;  │ when no other       │
│                     │ unpredictable grit               │ abrasive available   │
└─────────────────────┴─────────────────────────────────┴──────────────────────┘

Grit Progression:
┌──────────────┬────────────────┬──────────────────────────────────┐
│ Grit Range   │ Purpose        │ When to Use                      │
├──────────────┼────────────────┼──────────────────────────────────┤
│ 220-400      │ Coarse         │ Reprofiling, removing chips,     │
│              │                │ establishing a new bevel         │
├──────────────┼────────────────┼──────────────────────────────────┤
│ 800-1000     │ Medium         │ Standard sharpening of a dull    │
│              │                │ blade; the workhorse grit        │
├──────────────┼────────────────┼──────────────────────────────────┤
│ 3000-6000    │ Fine           │ Refining the edge after medium;  │
│              │                │ polishing the bevel              │
├──────────────┼────────────────┼──────────────────────────────────┤
│ 8000+        │ Ultra-fine     │ Mirror polish; razors; optional  │
│              │                │ for most knives                  │
└──────────────┴────────────────┴──────────────────────────────────┘
```

**Got:** Correct abrasive selected, prepared (soaked, oiled, or wetted as required).

**If fail:** No proper stone? Ceramic mug bottom (unglazed ring) works as fine-grit emergency hone. Car window bottom works similar. Field: smooth river stone better than nothing.

### Step 3: Find and Match Bevel Angle

Bevel angle determines edge geometry. Match existing angle unless reprofiling.

```
Common Bevel Angles:
┌─────────────────────┬───────────────┬──────────────────────────────┐
│ Knife Type          │ Angle (per    │ Notes                        │
│                     │ side)         │                              │
├─────────────────────┼───────────────┼──────────────────────────────┤
│ Bushcraft / fixed   │ 20-25°        │ Balance of sharpness and     │
│ blade               │               │ durability for wood, rope,   │
│                     │               │ and general camp tasks       │
├─────────────────────┼───────────────┼──────────────────────────────┤
│ Kitchen knife       │ 15-20°        │ Thinner for clean food cuts; │
│                     │               │ less durable on hard items   │
├─────────────────────┼───────────────┼──────────────────────────────┤
│ Japanese kitchen    │ 10-15°        │ Very acute; exceptional      │
│                     │               │ sharpness; fragile on bone   │
├─────────────────────┼───────────────┼──────────────────────────────┤
│ Machete / chopper   │ 25-30°        │ Thick for impact resistance  │
├─────────────────────┼───────────────┼──────────────────────────────┤
│ Folding knife (EDC) │ 20°           │ General purpose              │
├─────────────────────┼───────────────┼──────────────────────────────┤
│ Hori-hori / garden  │ 15-20°        │ Similar to kitchen; for soil │
│ blade               │               │ and root cutting             │
└─────────────────────┴───────────────┴──────────────────────────────┘

Finding the Angle:
1. Lay the blade flat on the stone (0°)
2. Slowly raise the spine until the bevel sits flush on the stone
3. The point where the entire bevel contacts the stone is the correct angle
4. Marker trick: color the bevel with a Sharpie, make one stroke on the stone.
   - Ink removed from the whole bevel = correct angle
   - Ink removed only at the edge = angle too high
   - Ink removed only at the shoulder = angle too low

Coin Stack Reference (for consistent angle):
- 1 coin under spine ≈ 12-15° (thin kitchen knives)
- 2 coins under spine ≈ 17-20° (general purpose)
- 3 coins under spine ≈ 22-25° (bushcraft / heavy use)
(Varies with blade width — wider blades need more coins for the same angle)
```

**Got:** Hold knife at consistent angle matching existing bevel.

**If fail:** Cannot maintain consistent angle freehand? Use sharpening guide or clamp system. Inconsistent angle most common cause of poor sharpening. Practice on cheap knife before valued blade.

### Step 4: Sharpen — Coarse to Fine Progression

Work through grits from coarsest needed to finest.

```
Sharpening Technique:

SETUP:
1. Place stone on a stable, non-slip surface (wet towel underneath)
2. Ensure the stone is fully saturated (water stones) or oiled (oil stones)
3. Position yourself so you can make smooth, controlled strokes

STROKE METHOD (per side):
1. Place the blade on the stone at the correct angle
2. Push the edge forward along the stone as if slicing a thin layer off
   the surface — from heel to tip in a sweeping arc
3. Maintain consistent pressure and angle throughout the stroke
4. Light to moderate pressure — let the abrasive do the work
5. 5-10 strokes per side, then alternate

ALTERNATING PATTERN:
- 5-10 strokes on side A → 5-10 strokes on side B → repeat
- As you approach a sharp edge, reduce to 3 strokes per side,
  then 1 stroke per side (alternating single strokes)

CHECKING FOR A BURR:
- After sufficient strokes on one side, a thin wire edge (burr)
  forms on the opposite side
- Feel for it: drag your thumb ACROSS the edge (never along it)
  from the spine toward the edge — the burr catches slightly
  on the side opposite to the one you were sharpening
- A burr means you have reached the apex — move to the other side
- Once both sides have raised and removed the burr, move to the
  next finer grit

PROGRESSION:
Coarse (if needed) → raise burr on both sides → move to medium
Medium → raise burr on both sides → move to fine
Fine → light alternating strokes → strop
```

**Got:** After finest stone, blade catches firm on fingernail and slices paper clean (some drag acceptable before stropping).

**If fail:** Cannot raise burr after 20+ strokes? Check angle — may be too steep (grinding above edge) or too shallow (grinding flat of blade). Use marker trick again. Stone glazed (loaded with metal particles)? Rinse and rub with nagura stone or flattening plate.

### Step 5: Strop Edge

Stropping removes final burr, aligns edge to razor sharpness.

```
Stropping Protocol:
1. Use a leather strop, smooth cardboard, or bare softwood (palm side
   of a leather belt works in the field)
2. Apply stropping compound if available (chromium oxide / green compound,
   or fine polishing paste)
3. Lay the blade flat at the sharpening angle
4. Draw the blade SPINE-FIRST (opposite direction to sharpening —
   you are dragging the edge backward, not pushing it forward)
5. Light pressure only — less than sharpening
6. Alternate sides: 5 strokes per side → 3 → 1 → 1 → 1
7. Total: 20-30 strokes alternating

⚠️ CRITICAL: Strop spine-first (pull the edge backward).
   Pushing edge-first into a strop cuts the leather and
   dulls the blade.

Field Strop Alternatives:
- Smooth side of a leather belt (hold taut)
- Cardboard or newspaper laid flat
- Palm of your hand (careful! very light pressure, spine-first only)
- Smooth driftwood or the flat of a dry log
```

**Got:** Blade pops arm hair, slices phone-book-thin paper clean, or glides through tomato under own weight.

**If fail:** Edge feels sharp but catches or drags? Remaining burr on one side. Do 5 more alternating single strokes on fine stone, re-strop. Edge still inconsistent? Slight different angle on one side — mark with Sharpie, correct.

### Step 6: Test Sharpness

Use progressive tests to gauge edge quality.

```
Sharpness Tests (from easiest to most demanding):

1. FINGERNAIL TEST (basic):
   Lightly draw the edge across a fingernail at 45°.
   Sharp: catches and digs in immediately
   Dull: slides across without catching

2. PAPER TEST (good):
   Hold a sheet of printer paper by one edge and slice downward.
   Sharp: cuts cleanly with no tearing
   Acceptable: cuts with slight drag
   Dull: tears, folds, or won't start a cut

3. TOMATO TEST (kitchen standard):
   Place a ripe tomato on a cutting board.
   Sharp: the weight of the blade alone starts the cut
   Dull: requires downward pressure to break the skin

4. ARM HAIR TEST (very sharp):
   Lightly draw the blade across arm hair without touching skin.
   Sharp: hair pops cleanly
   Not quite: hair bends or pushes aside

5. HANGING HAIR TEST (razor sharp):
   Hold a single hair and bring the blade to it.
   Razor: cuts the hair with minimal pressure
   This level is unnecessary for most bushcraft/garden use.

Sharpness Standards by Use:
- Bushcraft / camp knife: pass paper test cleanly → good to go
- Kitchen knife: pass tomato test → good to go
- Carving knife: pass arm hair test → ideal
- Garden blade (hori-hori): pass paper test → sufficient
```

**Got:** Blade passes sharpness test appropriate for intended use.

**If fail:** Blade passes fingernail but fails paper? Needs more time on fine stone and more stropping. Fails fingernail entirely? Back to medium grit, re-sharpen from Step 4.

### Step 7: Field Sharpening (Wilderness Methods)

When proper stones not available.

```
Field Expedient Sharpening:

RIVER STONES:
1. Find a smooth, flat, fine-grained stone (slate, granite, basalt)
2. Wet the surface
3. Use the same technique as Step 4 — angle, stroke, alternate
4. Won't produce a polished edge but will restore cutting ability
5. Look for stones with a slightly gritty feel — glassy smooth
   stones won't cut fast enough

CERAMIC:
- Bottom of a ceramic mug (unglazed ring) serves as a fine hone
- Excellent for maintenance touch-ups in camp

CAR WINDOW EDGE:
- The edge of a car window (rolled down slightly) is fine-grit ceramic
- 5-10 strokes per side for a quick field touch-up

SANDPAPER ON FLAT SURFACE:
- If you have sandpaper (any grit), place it on a flat log or rock
- Sharpen as you would on a stone
- Works surprisingly well

LEATHER BELT STROP:
- Always available in the field if wearing a belt
- Hold taut between hand and fixed point
- Strop spine-first after any field sharpening

Minimum Field Sharpening Kit (recommended carry):
- Small diamond plate (credit-card size) or ceramic rod
- Leather strop strip (10cm x 3cm, fits in sheath)
These two items weigh almost nothing and handle all field needs.
```

**Got:** Blade restored to functional sharpness for camp tasks.

**If fail:** No suitable abrasive? Flat piece of hardwood with fine sand rubbed into grain serves as crude sharpening surface. Prioritize getting blade functional, not perfect.

### Step 8: Maintain Edge

Prevention easier than restoration.

```
Edge Maintenance Habits:
1. Strop before each use — 10 strokes per side on leather or cardboard
   (this alone can keep a knife sharp for weeks between stone sessions)
2. Cut on wood, not stone, glass, ceramic, or metal surfaces
3. Never pry, twist, or use the edge as a screwdriver
4. Clean and dry the blade after use — moisture causes corrosion,
   and corrosion eats the fine edge
5. Store knives in sheaths, on magnetic strips, or in blade guards —
   never loose in a drawer where edges contact other metal
6. Carbon steel: oil the blade after cleaning (camellia oil, mineral oil)
7. Stainless steel: less maintenance, but still benefits from drying
   and occasional oiling

Sharpening Frequency:
┌───────────────────┬────────────────────────────────────────┐
│ Use Pattern        │ Recommended Frequency                  │
├───────────────────┼────────────────────────────────────────┤
│ Daily kitchen use  │ Strop daily; stone weekly              │
│ Weekend bushcraft  │ Strop before each trip; stone monthly  │
│ Occasional garden  │ Strop before use; stone seasonally     │
│ Heavy field use    │ Strop daily; stone every 2-3 days      │
└───────────────────┴────────────────────────────────────────┘
```

**Got:** Maintenance routine keeps blade sharp between full sharpening sessions.

**If fail:** Need full coarse-to-fine sharpening often? Either steel too soft for task (consider harder knife) or blade damaged by misuse (cutting on hard surfaces, lateral torque, corrosion).

## Checks

- [ ] Blade condition assessed before choosing grit progression
- [ ] Correct bevel angle identified, maintained consistent
- [ ] Burr raised and removed on both sides at each grit stage
- [ ] Edge stropped after final stone
- [ ] Blade passes appropriate sharpness test for intended use
- [ ] Blade cleaned, dried, oiled after sharpening
- [ ] Maintenance routine (strop before use) established

## Pitfalls

- **Inconsistent angle**: Single most common sharpening failure. Angle changes mid-stroke? You round edge instead of sharpening. Use marker trick to verify, practice slow, deliberate strokes before building speed
- **Too much pressure**: Pressing hard does not sharpen faster — digs grooves in stone, can chip edge. Let abrasive cut; moderate pressure sufficient
- **Skipping grits**: Jump from 400 straight to 6000 leaves deep scratches fine stone cannot remove. Each grit should erase scratch pattern of previous
- **Not raising burr**: Move to next grit before forming burr on both sides? Haven't reached apex, blade won't be sharp. Patient — burr is checkpoint
- **Stropping edge-first**: Push edge into strop cuts leather, folds edge backward. Always strop spine-first (drag edge backward)
- **Neglect back side of single-bevel blades**: Japanese-style single-bevel knives only sharpened on bevel side, but flat back still needs few light passes to remove burr. Never create bevel on flat side
- **Wrong stone lubricant**: Water stones use water. Oil stones use honing oil. Mix clogs stone. Never water on oil stone or oil on water stone

## See Also

- `make-fire` — sharp knife essential for processing tinder, kindling, feathersticks; fire-making, knife maintenance companion skills
- `forage-plants` — sharp blade enables clean, sustainable harvesting cuts that minimize plant damage
- `maintain-hand-tools` — garden blades (hori-hori, secateurs) follow similar sharpening principles; this skill provides deeper knife-specific technique
