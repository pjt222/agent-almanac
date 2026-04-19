---
name: check-hiking-gear
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
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

Generate and verify hiking gear checklist optimized for specific conditions of planned hike.

## When Use

- Preparing for day hike or multi-day trekking tour
- Packing for group, distributing shared gear
- Adapting standard gear list to specific season or conditions
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

## Steps

### Step 1: Assess Conditions

Determine environmental factors driving gear selection.

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

Classify hike into one of these profiles:

```
Hike Profiles:
  SUMMER-DAY:     Warm, short, well-marked, huts available
  SUMMER-MULTI:   Warm, multi-day, hut-to-hut or camping
  SHOULDER:       Spring/autumn, variable weather, possible snow
  WINTER:         Cold, snow cover, short daylight
  ALPINE:         High altitude, exposed, technical sections
  TROPICAL:       Hot, humid, rain, insects
```

**Got:** Clear hike profile with all condition factors assessed. Profile drives checklist in Step 2.

**If fail:** Conditions uncertain (e.g., shoulder season with unpredictable weather)? Plan for worse case. Always better to carry rain jacket you don't use than to be soaked without one.

### Step 2: Generate Base Checklist by Category

Build gear list organized by Ten Essentials framework plus additional categories.

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

**Got:** Complete checklist with all ten essentials, appropriate clothing layers, profile-specific additions. Every item relevant to assessed conditions.

**If fail:** List seems excessive for short easy hike? Verify only base ten essentials included for SUMMER-DAY profiles. List seems too light for alpine conditions? Cross-reference with Alpine profile add-ons.

### Step 3: Optimize Weight

Review checklist to reduce pack weight without compromising safety.

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

**Got:** Weight-optimized checklist where every item serves clear purpose. Total pack weight within target range for hike profile. Shared gear assigned to specific group members.

**If fail:** Pack weight exceeds target by more than 20%? Reconsider whether hike profile appropriate. Heavily loaded pack on long day dramatically increases fatigue and injury risk. Either reduce gear (accept more risk) or choose easier/shorter route.

### Step 4: Verify Completeness Against Conditions

Final cross-check of gear list against assessed conditions.

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

**Got:** All checks pass. Hiker can confidently state what every item in pack is for, would notice if any item were missing.

**If fail:** Any essential check fails? Resolve before departure. Most dangerous failures: no navigation backup (phone dies), insufficient water capacity, missing insulation layer (hypothermia risk even in summer above treeline).

## Checks

- [ ] All ten essentials included in checklist
- [ ] Clothing system matches expected temperature range
- [ ] Profile-specific additions included (snow gear, alpine gear, etc.)
- [ ] Pack weight within target range for hike profile
- [ ] Shared gear assigned to specific group members (group hikes)
- [ ] Water capacity covers longest gap between resupply points
- [ ] Emergency kit includes personal medications
- [ ] No new/untested gear on hike (broken-in boots, tested stove)

## Pitfalls

- **Cotton kills**: Cotton clothing retains moisture, loses insulation when wet. Use merino wool or synthetic fabrics for all layers.
- **New boots on hike day**: Untested footwear causes blisters. Break in new boots with at least 3-4 shorter walks before long hike.
- **One water source assumption**: Only planned water source dry (seasonal streams)? Dehydration follows quickly. Always carry capacity for worst case.
- **Overpacking "just in case"**: Every unnecessary gram compounds over hours. Cannot name when you would use item on this specific hike? Leave it behind.
- **Forgetting sun protection**: At altitude, UV exposure increases roughly 10% per 1000 m. Sunburn and snow blindness real hazards above 2000 m, even in cool weather.
- **Ignoring group gear overlap**: Four hikers each carrying full first aid kit wastes weight. Coordinate shared items before packing.

## See Also

- `plan-hiking-tour` — hiking plan determining what gear needed
- `assess-trail-conditions` — current conditions affect gear requirements (e.g., unexpected snow)
- `make-fire` — emergency fire-starting is one of ten essentials
- `purify-water` — water purification methods for when natural sources are only option
