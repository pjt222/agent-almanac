---
name: plan-garden-calendar
description: >
  Plan garden activities using solar, lunar, and biodynamic calendars. Covers
  USDA hardiness zones, frost date calculation, equinox/solstice anchoring,
  synodic lunar cycle (waxing/waning), ascending/descending moon, Maria Thun
  biodynamic calendar (root/leaf/flower/fruit days), succession planting
  schedules, and seasonal task planning. Use when planning a new growing season
  and needing a planting schedule, integrating lunar or biodynamic timing into
  garden practice, calculating frost dates and planting windows for a specific
  zone, setting up succession planting for continuous harvest, or conducting
  end-of-season review.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: gardening
  complexity: intermediate
  language: natural
  tags: gardening, calendar, lunar, biodynamic, solar, frost-dates, succession-planting
---

# Plan Garden Calendar

Plan garden activities using solar, lunar, and biodynamic calendar systems for optimal timing.

## When to Use

- You are planning a new growing season and need a planting schedule
- You want to integrate lunar or biodynamic timing into your garden practice
- You need to calculate frost dates and planting windows for your zone
- You want to set up succession planting for continuous harvest
- End-of-season review and planning for the next year

## Inputs

- **Required**: USDA hardiness zone or geographic location (for frost dates)
- **Required**: Crops or plants to schedule
- **Optional**: Calendar system preference (solar only, lunar, or biodynamic)
- **Optional**: Garden size and bed count
- **Optional**: Previous season's garden journal

## Procedure

### Step 1: Establish the Solar Framework

The solar calendar provides the hard boundaries — frost dates and day length.

```
Solar Calendar Anchors:
1. Find your USDA Hardiness Zone:
   - Zone determines minimum winter temperature and which perennials survive
   - Also correlates with growing season length
   - Look up at: planthardiness.ars.usda.gov (US) or local equivalent

2. Determine frost dates:
   - Last spring frost (LSF): Date after which frost is unlikely (50% threshold)
   - First autumn frost (FAF): Date after which frost becomes likely
   - Growing season = FAF minus LSF (in days)

   Example (Zone 7b, mid-Atlantic US):
   - Last spring frost: April 15
   - First autumn frost: October 15
   - Growing season: ~180 days

3. Anchor seasonal milestones:
   ┌───────────────────┬───────────────┬────────────────────────────┐
   │ Event             │ Approx. Date  │ Garden Significance        │
   ├───────────────────┼───────────────┼────────────────────────────┤
   │ Winter solstice   │ Dec 21        │ Seed ordering, planning    │
   │ Spring equinox    │ Mar 20        │ Start indoor seeds (cool   │
   │                   │               │ crops: 6-8 wk before LSF)  │
   │ Last spring frost │ Zone-specific │ Direct sow tender crops    │
   │ Summer solstice   │ Jun 21        │ Peak day length, begin     │
   │                   │               │ autumn crop planning       │
   │ Autumn equinox    │ Sep 22        │ Harvest season, cover crop │
   │ First autumn frost│ Zone-specific │ Protect or harvest tender  │
   │                   │               │ crops before this date     │
   └───────────────────┴───────────────┴────────────────────────────┘
```

**Expected:** Clear frost dates and growing season length for your specific location.

**On failure:** If frost dates are unknown, use conservative estimates (add 2 weeks to average LSF for safe direct-sow date). Local garden clubs or agricultural extension offices are the best regional sources.

### Step 2: Overlay the Lunar Calendar

The moon influences sap flow, germination, and soil biology. Two cycles matter.

```
Lunar Cycle 1: Synodic (Phase Cycle — 29.5 days)
┌─────────────────────┬────────────────────────────────────────────┐
│ Phase               │ Garden Activity                            │
├─────────────────────┼────────────────────────────────────────────┤
│ New Moon → 1st Qtr  │ Plant leafy crops (lettuce, spinach,      │
│ (Waxing crescent)   │ cabbage). Sap rises — good for above-     │
│                     │ ground vegetative growth.                  │
├─────────────────────┼────────────────────────────────────────────┤
│ 1st Qtr → Full Moon │ Plant fruiting crops (tomato, pepper,     │
│ (Waxing gibbous)    │ beans, squash). Strong light + rising sap  │
│                     │ = vigorous above-ground growth.            │
├─────────────────────┼────────────────────────────────────────────┤
│ Full Moon → 3rd Qtr │ Plant root crops (carrot, beet, potato,   │
│ (Waning gibbous)    │ onion). Sap descends — energy moves to    │
│                     │ roots. Good for transplanting.             │
├─────────────────────┼────────────────────────────────────────────┤
│ 3rd Qtr → New Moon  │ Rest period. No planting. Good for:       │
│ (Waning crescent)   │ weeding, composting, soil preparation,    │
│                     │ pruning, harvesting for storage.           │
└─────────────────────┴────────────────────────────────────────────┘

Lunar Cycle 2: Sidereal (Ascending/Descending — ~27.3 days)
- Ascending moon (moon moves higher in sky each night):
  Sap rises in plants. Good for: grafting, taking cuttings, harvesting
  fruit and aerial parts, sowing above-ground crops
- Descending moon (moon moves lower in sky each night):
  Sap descends to roots. Good for: planting, transplanting, root
  pruning, applying soil preparations, planting root crops

Note: Ascending/descending is NOT the same as waxing/waning.
Ascending = moon's position in the zodiac moving northward.
Check a biodynamic calendar for daily ascending/descending status.
```

**Expected:** Understanding of both lunar cycles and their garden applications.

**On failure:** If lunar calendar feels overwhelming, start with just the synodic cycle (waxing = above-ground, waning = below-ground) and add the sidereal layer in the second season.

### Step 3: Integrate the Biodynamic Calendar (Optional — Advanced)

The Maria Thun biodynamic calendar assigns each day to one of four plant organs based on the moon's zodiacal position.

```
Biodynamic Day Types:
┌───────────┬─────────────────┬──────────────────────────────────────┐
│ Day Type  │ Zodiac Signs    │ Favoured Activities                  │
├───────────┼─────────────────┼──────────────────────────────────────┤
│ Root      │ Taurus, Virgo,  │ Sow/transplant root crops (carrot,  │
│           │ Capricorn       │ beet, potato). Soil cultivation.     │
│           │ (Earth signs)   │ Compost turning.                     │
├───────────┼─────────────────┼──────────────────────────────────────┤
│ Leaf      │ Cancer, Scorpio,│ Sow/transplant leafy greens. Water  │
│           │ Pisces          │ plants. Lawn care. Prune for growth. │
│           │ (Water signs)   │                                      │
├───────────┼─────────────────┼──────────────────────────────────────┤
│ Flower    │ Gemini, Libra,  │ Sow/transplant flowering plants.    │
│           │ Aquarius        │ Harvest flowers and herbs. Apply     │
│           │ (Air signs)     │ preparation 501 (horn silica).       │
├───────────┼─────────────────┼──────────────────────────────────────┤
│ Fruit     │ Aries, Leo,     │ Sow/transplant fruiting crops       │
│           │ Sagittarius     │ (tomato, pepper, bean). Harvest      │
│           │ (Fire signs)    │ fruit. Collect seed.                 │
└───────────┴─────────────────┴──────────────────────────────────────┘

Using the Calendar:
1. Obtain the current year's Maria Thun biodynamic calendar
   (published annually, available from biodynamic associations)
2. Note which days are root/leaf/flower/fruit
3. Schedule your plantings to align day type with crop type
4. Avoid planting on "unfavourable" days (perigee, node crossings)
5. Combine with synodic phase: e.g., plant carrots on a root day
   during waning moon for strongest root growth signal

Practical Reality:
- Perfect alignment (right phase + right day type + good weather + you're free)
  happens 2-3 times per month. Don't wait for perfection.
- Match at least ONE calendar layer. Matching two is good. Three is ideal.
- Weather and your schedule always override calendar — a plant in the ground
  on the "wrong" day beats a seed in the packet on the "right" day.
```

**Expected:** Awareness of biodynamic day types and how to use the annual calendar.

**On failure:** If biodynamic calendar is unavailable, the lunar phase calendar (Step 2) captures the most important timing signals. Add biodynamic day types when you have access to the annual calendar.

### Step 4: Build a Succession Planting Schedule

Stagger plantings for continuous harvest rather than one overwhelming glut.

```
Succession Planting Principles:
1. Same crop, staggered sowing:
   - Sow lettuce every 2 weeks from LSF to 8 weeks before FAF
   - Sow bush beans every 3 weeks from 2 weeks after LSF to 10 weeks before FAF
   - Sow radish every 2 weeks (spring and autumn — skip midsummer heat)

2. Different crops, same bed:
   - Spring: peas (harvest June) → Summer: beans (harvest Sept) → Autumn: garlic (harvest next June)
   - This is relay planting — each crop follows the previous with minimal gap

3. Example Succession Calendar (Zone 7b):
   ┌─────────┬────────────────┬───────────────────────────────┐
   │ Week    │ Sow Indoors    │ Direct Sow / Transplant      │
   ├─────────┼────────────────┼───────────────────────────────┤
   │ Feb 15  │ Tomato, pepper │                               │
   │ Mar 1   │ Brassica starts│ Peas, spinach (under cloche)  │
   │ Mar 15  │ Lettuce #1     │ Radish #1, carrots (early)    │
   │ Apr 1   │ Lettuce #2     │ Radish #2, beet #1            │
   │ Apr 15  │               │ Transplant brassicas out       │
   │ May 1   │ Lettuce #3     │ Bean #1, squash, cucumber      │
   │ May 15  │               │ Transplant tomato, pepper      │
   │ Jun 1   │               │ Bean #2, lettuce #4 (shade)    │
   │ Jun 15  │               │ Bean #3                        │
   │ Jul 1   │ Autumn brassica│ Beet #2, carrot (autumn)      │
   │ Jul 15  │               │ Transplant autumn brassicas    │
   │ Aug 1   │               │ Lettuce #5 (autumn), radish #3 │
   │ Aug 15  │               │ Spinach (autumn), cover crop   │
   │ Sep 1   │               │ Garlic (plant 4-6 wks pre FAF)│
   └─────────┴────────────────┴───────────────────────────────┘
```

**Expected:** A week-by-week planting calendar customized to your zone, with succession intervals noted.

**On failure:** If the schedule feels overwhelming, pick your 3 most important crops and plan successions for those only. Add more crops in the second season once the rhythm is established.

### Step 5: Seasonal Task Schedule

Beyond planting, the garden has cyclical maintenance tasks.

```
Seasonal Task Framework:
┌───────────┬──────────────────────────────────────────────────────┐
│ Season    │ Tasks                                                │
├───────────┼──────────────────────────────────────────────────────┤
│ Winter    │ - Order seeds (January)                              │
│ (Dec-Feb) │ - Plan beds and crop rotation on paper               │
│           │ - Maintain tools (see maintain-hand-tools)           │
│           │ - Apply prep 500 if ground is workable (late Feb)    │
│           │ - Start earliest indoor seeds (Feb, 8-10 wk pre LSF)│
├───────────┼──────────────────────────────────────────────────────┤
│ Spring    │ - Soil assessment and amendment (see prepare-soil)   │
│ (Mar-May) │ - Direct sow cool crops after soil reaches 7°C      │
│           │ - Transplant warm crops after LSF                    │
│           │ - Mulch beds after soil warms                        │
│           │ - First compost turn of the year                     │
├───────────┼──────────────────────────────────────────────────────┤
│ Summer    │ - Succession sow every 2-3 weeks                    │
│ (Jun-Aug) │ - Water deeply, less frequently (morning preferred)  │
│           │ - Harvest regularly to encourage production           │
│           │ - Start autumn crop seeds indoors (July)             │
│           │ - Apply prep 501 on fruit days (biodynamic)          │
├───────────┼──────────────────────────────────────────────────────┤
│ Autumn    │ - Main harvest and preservation                     │
│ (Sep-Nov) │ - Plant garlic (4-6 weeks before FAF)               │
│           │ - Sow cover crops on empty beds                     │
│           │ - Apply prep 500 (late October)                     │
│           │ - Compost final additions, insulate pile for winter  │
│           │ - End-of-season reflection (meditate checkpoint)     │
└───────────┴──────────────────────────────────────────────────────┘
```

**Expected:** A seasonal framework that complements the weekly planting schedule.

**On failure:** If tasks are consistently missed, the schedule may be too ambitious. Reduce the number of beds or crops until the rhythm feels sustainable.

### Step 6: Meditate Checkpoint — End-of-Season Reflection

At the close of the growing season (after first frost), sit with the garden journal.

```
End-of-Season Reflection (20-30 minutes):
1. Find a quiet spot in or overlooking the garden
2. Bring your garden journal and this year's calendar

3. Review without judgment:
   - What grew well? (Note varieties and planting dates)
   - What struggled? (Was it timing, soil, weather, or neglect?)
   - Which calendar alignments felt meaningful?
   - What surprised you?

4. Note three things to carry forward:
   - One success to repeat
   - One failure to investigate
   - One new thing to try

5. Close the journal. Sit quietly for 5 minutes.
   The garden is resting now. You should rest too.
   Planning begins after solstice — not before.

This reflection becomes the first page of next year's plan.
```

**Expected:** A reflective summary that grounds next year's planning in this year's reality.

**On failure:** If reflection feels like self-criticism, reframe: the garden is the teacher. Every "failure" is data. The only real failure is not observing.

## Validation Checklist

- [ ] USDA zone and frost dates identified for your location
- [ ] Solar calendar anchors marked (equinoxes, solstices, frost dates)
- [ ] Lunar cycle understood (at minimum: waxing/waning = above/below ground)
- [ ] Planting schedule built with succession intervals
- [ ] Schedule accounts for indoor start times (weeks before LSF)
- [ ] Seasonal task framework adapted to local conditions
- [ ] Garden journal started or updated with this year's calendar
- [ ] Meditate checkpoint completed at end of growing season

## Common Pitfalls

1. **Planting too early**: Eager spring planting into cold soil wastes seeds. Soil temperature matters more than air temperature — use a soil thermometer
2. **Ignoring microclimates**: South-facing walls are warmer, low spots collect frost. Your garden has zones within zones
3. **Calendar rigidity**: The calendar is a guide, not a command. If the weather is wrong, wait. Plants don't read calendars
4. **No succession planting**: A single large sowing produces a single overwhelming harvest followed by nothing. Stagger for continuity
5. **Skipping the reflection**: Without reviewing what happened, you plan from hope instead of evidence. The journal is the most important tool
6. **Over-scheduling**: A packed calendar leads to burnout. Leave breathing room — the garden will fill it

## Related Skills

- `read-garden` — Observation skills that inform calendar adjustments mid-season
- `prepare-soil` — Soil amendment timing depends on the seasonal calendar
- `cultivate-bonsai` — Bonsai seasonal care follows the same solar/lunar framework
- `meditate` — End-of-season reflection checkpoint (full protocol)
- `maintain-hand-tools` — Winter tool care is a scheduled seasonal task
