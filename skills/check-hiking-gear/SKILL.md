---
name: check-hiking-gear
description: >
  Generate and verify a hiking gear checklist optimized for season, duration,
  difficulty, and group size with weight management. Covers the ten essentials,
  layering systems, navigation tools, emergency kit, and group gear distribution.
  Use when preparing for a day hike or multi-day trekking tour, packing for a
  group and distributing shared gear, adapting a standard gear list to specific
  conditions, reviewing gear before departure, or managing pack weight for long
  or technical routes.
license: MIT
allowed-tools: Read Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: travel
  complexity: basic
  language: multi
  tags: travel, hiking, gear, checklist, weight, packing
---

# Check Hiking Gear

Generate and verify a hiking gear checklist optimized for the specific conditions of a planned hike.

## When to Use

- Preparing for a day hike or multi-day trekking tour
- Packing for a group and distributing shared gear
- Adapting a standard gear list to specific season or conditions
- Reviewing gear before departure to catch missing items
- Managing pack weight for long or technical routes

## Inputs

- **Required**: Hike duration (day hike, overnight, multi-day)
- **Required**: Season and expected temperature range
- **Required**: Trail difficulty (SAC T1-T6 or descriptive)
- **Optional**: Maximum elevation and expected conditions (snow, rain, heat)
- **Optional**: Group size (for distributing shared gear)
- **Optional**: Target pack weight or weight limit
- **Optional**: Special requirements (via ferrata gear, glacier equipment, photography)

## Procedure

### Step 1: Assess Conditions

Determine the environmental factors that drive gear selection.

```
Condition Assessment Matrix:
┌──────────────────┬────────────────────────────────────────────┐
│ Factor           │ Impact on Gear                             │
├──────────────────┼────────────────────────────────────────────┤
│ Temperature      │ Layering depth, sleeping bag rating        │
│ Precipitation    │ Rain gear weight, pack cover, gaiters      │
│ Snow/ice         │ Microspikes, crampons, ice axe, gaiters    │
│ Sun exposure     │ Sunscreen, hat, sunglasses, lip balm       │
│ Altitude (>2500m)│ Extra warm layer, sun protection, hydration│
│ Duration         │ Food weight, water capacity, shelter type  │
│ Remoteness       │ First aid depth, emergency beacon, backup  │
│ Technical terrain│ Helmet, harness, rope, via ferrata set     │
│ Water sources    │ Carry capacity, purification method        │
│ Hut availability │ Sleeping bag vs. sheet, meal vs. cook gear │
└──────────────────┴────────────────────────────────────────────┘
```

Classify the hike into one of these profiles:

```
Hike Profiles:
  SUMMER-DAY:     Warm, short, well-marked, huts available
  SUMMER-MULTI:   Warm, multi-day, hut-to-hut or camping
  SHOULDER:       Spring/autumn, variable weather, possible snow
  WINTER:         Cold, snow cover, short daylight
  ALPINE:         High altitude, exposed, technical sections
  TROPICAL:       Hot, humid, rain, insects
```

**Expected:** A clear hike profile with all condition factors assessed. This profile drives the checklist in Step 2.

**On failure:** If conditions are uncertain (e.g., shoulder season with unpredictable weather), plan for the worse case. It is always better to carry a rain jacket you don't use than to be soaked without one.

### Step 2: Generate Base Checklist by Category

Build the gear list organized by the Ten Essentials framework plus additional categories.

```
THE TEN ESSENTIALS (always carry):
┌────┬──────────────────┬────────────────────────────────────────┐
│ #  │ Category         │ Items                                  │
├────┼──────────────────┼────────────────────────────────────────┤
│ 1  │ Navigation       │ Map (paper), compass, GPS/phone with   │
│    │                  │ offline maps, route description         │
├────┼──────────────────┼────────────────────────────────────────┤
│ 2  │ Sun protection   │ Sunscreen (SPF 50+), sunglasses        │
│    │                  │ (cat 3-4), lip balm with SPF, hat      │
├────┼──────────────────┼────────────────────────────────────────┤
│ 3  │ Insulation       │ Extra warm layer beyond what you       │
│    │                  │ expect to need (fleece or puffy)        │
├────┼──────────────────┼────────────────────────────────────────┤
│ 4  │ Illumination     │ Headlamp + spare batteries             │
├────┼──────────────────┼────────────────────────────────────────┤
│ 5  │ First aid        │ Blister kit, bandages, pain relief,    │
│    │                  │ personal medications, emergency blanket │
├────┼──────────────────┼────────────────────────────────────────┤
│ 6  │ Fire             │ Lighter + waterproof matches            │
│    │                  │ (emergency warmth/signaling)            │
├────┼──────────────────┼────────────────────────────────────────┤
│ 7  │ Repair/tools     │ Knife or multi-tool, duct tape,        │
│    │                  │ cord (3m paracord)                      │
├────┼──────────────────┼────────────────────────────────────────┤
│ 8  │ Nutrition        │ Extra food beyond planned meals         │
│    │                  │ (energy bars, nuts, dried fruit)        │
├────┼──────────────────┼────────────────────────────────────────┤
│ 9  │ Hydration        │ Water bottles/bladder (min 1.5L for    │
│    │                  │ day hike), purification if needed       │
├────┼──────────────────┼────────────────────────────────────────┤
│ 10 │ Shelter          │ Emergency bivvy or space blanket        │
│    │                  │ (day hike), tent/tarp (multi-day)      │
└────┴──────────────────┴────────────────────────────────────────┘

CLOTHING (layer system):
┌──────────────────┬────────────────────────────────────────────┐
│ Layer            │ Items                                      │
├──────────────────┼────────────────────────────────────────────┤
│ Base layer       │ Merino or synthetic shirt & underwear      │
│ Mid layer        │ Fleece jacket or lightweight puffy         │
│ Shell layer      │ Waterproof/breathable jacket               │
│ Legs             │ Hiking pants (zip-off for versatility)     │
│ Feet             │ Hiking boots/shoes, wool socks, liners     │
│ Hands            │ Lightweight gloves (even in summer above   │
│                  │ 2000 m)                                    │
│ Head             │ Sun hat + warm hat/buff                    │
└──────────────────┴────────────────────────────────────────────┘

ADDITIONAL BY PROFILE:
┌──────────────────┬────────────────────────────────────────────┐
│ Profile add-on   │ Additional items                           │
├──────────────────┼────────────────────────────────────────────┤
│ Multi-day        │ Sleeping bag/liner, toiletries, change of  │
│                  │ clothes, cooking system, extra food        │
├──────────────────┼────────────────────────────────────────────┤
│ Snow/ice         │ Microspikes or crampons, gaiters, ice axe │
│                  │ (if applicable), extra insulation          │
├──────────────────┼────────────────────────────────────────────┤
│ Alpine/technical │ Helmet, harness, via ferrata set, rope,    │
│                  │ carabiners, slings                         │
├──────────────────┼────────────────────────────────────────────┤
│ Remote           │ Emergency beacon (PLB/InReach), extensive  │
│                  │ first aid, water purification, extra food  │
├──────────────────┼────────────────────────────────────────────┤
│ Winter           │ Insulated jacket, ski poles, snowshoes,    │
│                  │ thermos, goggles, balaclava                │
└──────────────────┴────────────────────────────────────────────┘
```

**Expected:** A complete checklist with all ten essentials, appropriate clothing layers, and profile-specific additions. Every item is relevant to the assessed conditions.

**On failure:** If the list seems excessive for a short easy hike, verify that only the base ten essentials are included for SUMMER-DAY profiles. If the list seems too light for alpine conditions, cross-reference with the Alpine profile add-ons.

### Step 3: Optimize Weight

Review the checklist to reduce pack weight without compromising safety.

```
Weight Optimization Strategies:
┌──────────────────────┬────────────────────────────────────────┐
│ Strategy             │ Example                                │
├──────────────────────┼────────────────────────────────────────┤
│ Eliminate            │ Remove items not needed for conditions  │
│ Substitute           │ Trail runners instead of heavy boots   │
│                      │ (if terrain allows)                    │
│ Downsize             │ Smaller first aid kit for day hikes    │
│ Multi-use items      │ Buff = sun protection + warm hat +     │
│                      │ dust mask                              │
│ Share in group       │ One first aid kit per 3-4 people,      │
│                      │ one repair kit per group                │
│ Repackage            │ Decant sunscreen into small bottle,    │
│                      │ remove excess packaging                │
│ Lighter materials    │ Titanium cookware, cuben fiber shelter │
└──────────────────────┴────────────────────────────────────────┘

Weight Targets (pack weight without food/water):
  Day hike:       3-5 kg base weight
  Hut-to-hut:     5-8 kg base weight
  Camping:        8-12 kg base weight
  Winter/alpine:  10-15 kg base weight
```

For group hikes, distribute shared gear:

```
Shared Gear Distribution:
  First aid kit (group)  → strongest hiker or designated person
  Repair kit             → most experienced with repairs
  Cooking system         → split stove/fuel/pot across members
  Shelter (if shared)    → split tent body/fly/poles
  Emergency gear         → distribute PLB, rope among members
```

**Expected:** A weight-optimized checklist where every item serves a clear purpose. Total pack weight is within the target range for the hike profile. Shared gear is assigned to specific group members.

**On failure:** If pack weight exceeds the target by more than 20%, reconsider whether the hike profile is appropriate. A heavily loaded pack on a long day dramatically increases fatigue and injury risk. Either reduce gear (accept more risk) or choose an easier/shorter route.

### Step 4: Verify Completeness Against Conditions

Final cross-check of the gear list against the assessed conditions.

```
Verification Checklist:
┌────────────────────────────────────────┬──────────┬──────────┐
│ Check                                  │ Pass     │ Notes    │
├────────────────────────────────────────┼──────────┼──────────┤
│ All ten essentials present             │ [ ]      │          │
│ Clothing layers match temperature range│ [ ]      │          │
│ Rain gear if >20% precipitation chance │ [ ]      │          │
│ Snow gear if above/near snow line      │ [ ]      │          │
│ Water capacity sufficient between      │ [ ]      │          │
│ resupply points                        │          │          │
│ Food sufficient for duration + reserve │ [ ]      │          │
│ Navigation tools loaded with route     │ [ ]      │          │
│ Phone charged + portable charger       │ [ ]      │          │
│ First aid includes personal meds       │ [ ]      │          │
│ Emergency contact info carried         │ [ ]      │          │
│ Boots/shoes broken in (no new gear)    │ [ ]      │          │
│ Pack fits comfortably at loaded weight │ [ ]      │          │
└────────────────────────────────────────┴──────────┴──────────┘
```

**Expected:** All checks pass. The hiker can confidently state what every item in the pack is for and would notice if any item were missing.

**On failure:** If any essential check fails, resolve it before departure. The most dangerous failures are: no navigation backup (phone dies), insufficient water capacity, and missing insulation layer (hypothermia risk even in summer above treeline).

## Validation

- [ ] All ten essentials are included in the checklist
- [ ] Clothing system matches the expected temperature range
- [ ] Profile-specific additions are included (snow gear, alpine gear, etc.)
- [ ] Pack weight is within target range for the hike profile
- [ ] Shared gear is assigned to specific group members (group hikes)
- [ ] Water capacity covers the longest gap between resupply points
- [ ] Emergency kit includes personal medications
- [ ] No new/untested gear on the hike (broken-in boots, tested stove)

## Common Pitfalls

- **Cotton kills**: Cotton clothing retains moisture and loses insulation when wet. Use merino wool or synthetic fabrics for all layers.
- **New boots on hike day**: Untested footwear causes blisters. Break in new boots with at least 3-4 shorter walks before a long hike.
- **One water source assumption**: If the only planned water source is dry (seasonal streams), dehydration follows quickly. Always carry capacity for the worst case.
- **Overpacking "just in case"**: Every unnecessary gram compounds over hours. If you cannot name when you would use an item on this specific hike, leave it behind.
- **Forgetting sun protection**: At altitude, UV exposure increases roughly 10% per 1000 m. Sunburn and snow blindness are real hazards above 2000 m, even in cool weather.
- **Ignoring group gear overlap**: Four hikers each carrying a full first aid kit wastes weight. Coordinate shared items before packing.

## Related Skills

- `plan-hiking-tour` — the hiking plan that determines what gear is needed
- `assess-trail-conditions` — current conditions affect gear requirements (e.g., unexpected snow)
- `make-fire` — emergency fire-starting is one of the ten essentials
- `purify-water` — water purification methods for when natural sources are the only option
