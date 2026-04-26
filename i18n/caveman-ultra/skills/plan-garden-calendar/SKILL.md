---
name: plan-garden-calendar
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Plan garden activities w/ solar, lunar, biodynamic calendars. USDA zones,
  frost dates, equinox/solstice anchors, synodic lunar (waxing/waning),
  ascending/descending moon, Maria Thun (root/leaf/flower/fruit days),
  succession planting, seasonal tasks. Use → new season schedule, lunar/
  biodynamic timing, frost windows, succession harvest, end-of-season review.
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

Plan garden via solar, lunar, biodynamic calendars → optimal timing.

## Use When

- New season → need planting schedule
- Integrate lunar or biodynamic timing
- Calc frost dates + planting windows for zone
- Setup succession planting → continuous harvest
- End-of-season review → next year

## In

- **Required**: USDA hardiness zone or geo location (for frost dates)
- **Required**: Crops/plants to schedule
- **Optional**: Calendar preference (solar only, lunar, biodynamic)
- **Optional**: Garden size + bed count
- **Optional**: Prior season journal

## Do

### Step 1: Solar Framework

Solar calendar = hard boundaries → frost dates + day length.

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

→ Clear frost dates + growing season length for location.

If err: frost dates unknown → conservative estimate (add 2 wks to avg LSF for safe direct-sow). Local garden clubs / ag extension = best regional sources.

### Step 2: Overlay Lunar Calendar

Moon influences sap flow, germination, soil biology. Two cycles matter.

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

→ Both lunar cycles + garden applications understood.

If err: lunar feels overwhelming → start w/ synodic only (waxing = above-ground, waning = below-ground), add sidereal in season 2.

### Step 3: Biodynamic Calendar (Optional — Advanced)

Maria Thun calendar → each day = one of 4 plant organs based on moon zodiac.

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

→ Biodynamic day types + annual calendar usage clear.

If err: biodynamic calendar unavailable → lunar phase (Step 2) captures most timing signals. Add biodynamic later when accessible.

### Step 4: Succession Planting Schedule

Stagger plantings → continuous harvest, not one glut.

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

→ Week-by-week planting calendar customized to zone, succession intervals noted.

If err: schedule overwhelming → pick top 3 crops, plan only those. Add more in season 2 once rhythm steady.

### Step 5: Seasonal Task Schedule

Beyond planting → cyclical maintenance tasks.

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

→ Seasonal framework complementing weekly planting schedule.

If err: tasks consistently missed → too ambitious. Reduce beds/crops until rhythm sustainable.

### Step 6: Meditate Checkpoint — End-of-Season Reflection

End of season (after first frost) → sit w/ garden journal.

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

→ Reflective summary grounds next year's planning in this year's reality.

If err: reflection feels like self-criticism → reframe: garden is teacher. Every "failure" = data. Only real failure = not observing.

## Check

- [ ] USDA zone + frost dates ID'd for location
- [ ] Solar anchors marked (equinoxes, solstices, frost dates)
- [ ] Lunar cycle understood (min: waxing/waning = above/below ground)
- [ ] Planting schedule w/ succession intervals
- [ ] Schedule accounts for indoor start times (weeks pre-LSF)
- [ ] Seasonal task framework adapted to local
- [ ] Garden journal started or updated
- [ ] Meditate checkpoint done at end of growing season

## Traps

1. **Plant too early**: Eager spring planting in cold soil → wasted seed. Soil temp > air temp — use thermometer.
2. **Ignore microclimates**: South walls warmer, low spots collect frost. Garden has zones within zones.
3. **Calendar rigidity**: Calendar = guide, not command. Wrong weather → wait. Plants don't read calendars.
4. **No succession**: One big sowing → one big glut, then nothing. Stagger.
5. **Skip reflection**: No review → plan from hope, not evidence. Journal = most important tool.
6. **Over-schedule**: Packed calendar → burnout. Leave breathing room — garden fills it.

## →

- `read-garden` — observation skills informing mid-season adjustments
- `prepare-soil` — soil amendment timing depends on seasonal calendar
- `cultivate-bonsai` — bonsai seasonal care follows same solar/lunar framework
- `meditate` — end-of-season reflection (full protocol)
- `maintain-hand-tools` — winter tool care = scheduled seasonal task
