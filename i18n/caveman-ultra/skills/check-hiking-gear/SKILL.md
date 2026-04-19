---
name: check-hiking-gear
locale: caveman-ultra
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

Generate + verify hiking gear checklist optimized for specific hike conditions.

## Use When

- Prep day hike or multi-day trek
- Packing for group + distributing shared gear
- Adapt standard list to specific season/conditions
- Review gear before departure to catch missing items
- Manage pack weight for long/technical routes

## In

- **Required**: Hike duration (day, overnight, multi-day)
- **Required**: Season + expected temp range
- **Required**: Trail difficulty (SAC T1-T6 or descriptive)
- **Optional**: Max elevation + expected conditions (snow, rain, heat)
- **Optional**: Group size (for shared gear)
- **Optional**: Target pack weight / limit
- **Optional**: Special reqs (via ferrata, glacier, photography)

## Do

### Step 1: Assess Conditions

Env factors driving gear selection.

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

Classify hike into profile:

```
Hike Profiles:
  SUMMER-DAY:     Warm, short, well-marked, huts available
  SUMMER-MULTI:   Warm, multi-day, hut-to-hut or camping
  SHOULDER:       Spring/autumn, variable weather, possible snow
  WINTER:         Cold, snow cover, short daylight
  ALPINE:         High altitude, exposed, technical sections
  TROPICAL:       Hot, humid, rain, insects
```

**→** Clear profile w/ all factors assessed. Drives checklist Step 2.

**If err:** Conditions uncertain (shoulder season, unpredictable) → plan worse case. Better to carry unused rain jacket than be soaked w/o.

### Step 2: Generate Base Checklist by Category

Build list organized by Ten Essentials + extra categories.

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

**→** Complete checklist w/ all 10 essentials, clothing layers, profile additions. Every item relevant to assessed conditions.

**If err:** Excessive for short easy hike → verify only base 10 essentials for SUMMER-DAY. Too light for alpine → cross-ref Alpine add-ons.

### Step 3: Optimize Weight

Reduce pack weight w/o compromising safety.

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

Group hikes → distribute shared:

```
Shared Gear Distribution:
  First aid kit (group)  → strongest hiker or designated person
  Repair kit             → most experienced with repairs
  Cooking system         → split stove/fuel/pot across members
  Shelter (if shared)    → split tent body/fly/poles
  Emergency gear         → distribute PLB, rope among members
```

**→** Weight-optimized list where every item has clear purpose. Total w/in target range. Shared gear assigned to specific members.

**If err:** Pack weight > target by >20% → reconsider if hike profile appropriate. Heavily loaded pack on long day → fatigue + injury risk. Reduce gear (accept risk) or pick easier/shorter route.

### Step 4: Verify Completeness

Final cross-check vs assessed conditions.

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

**→** All checks pass. Hiker can state what every item is for + would notice if missing.

**If err:** Essential check fails → resolve before departure. Most dangerous: no nav backup (phone dies), insufficient water capacity, missing insulation (hypothermia risk even summer above treeline).

## Check

- [ ] All 10 essentials in list
- [ ] Clothing matches temp range
- [ ] Profile additions included (snow, alpine, etc.)
- [ ] Pack weight w/in target
- [ ] Shared gear assigned to specific members (group hikes)
- [ ] Water capacity covers longest gap between resupply
- [ ] Emergency kit includes personal meds
- [ ] No new/untested gear (broken-in boots, tested stove)

## Traps

- **Cotton kills**: Retains moisture, loses insulation wet. Use merino or synthetic all layers
- **New boots on hike day**: Untested footwear → blisters. Break in ≥3-4 shorter walks before long hike
- **One water source assumption**: Seasonal streams dry → dehydration fast. Always carry worst-case capacity
- **Overpack "just in case"**: Every gram compounds. Can't name when you'd use on this hike → leave behind
- **Forget sun protection**: Altitude → UV ↑ ~10% per 1000m. Sunburn + snow blindness real hazards above 2000m even in cool
- **Ignore group overlap**: 4 hikers each w/ full first aid = wasted weight. Coordinate shared before packing

## →

- `plan-hiking-tour` — hiking plan determining needed gear
- `assess-trail-conditions` — current conditions affect gear reqs (e.g., unexpected snow)
- `make-fire` — emergency fire-starting is one of 10 essentials
- `purify-water` — water purification when natural sources only option
