---
name: plan-hiking-tour
description: >
  Plan a hiking tour with trail selection by difficulty (SAC/UIAA), time
  estimation using Munter's formula, elevation analysis, and safety
  assessment. Covers multi-day hut-to-hut tours, day hikes, and alpine routes
  with terrain classification and group fitness considerations. Use when
  planning a day hike or multi-day trekking tour, selecting trails appropriate
  for a group's fitness and experience, estimating realistic hiking times, or
  planning hut-to-hut tours with overnight logistics.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: travel
  complexity: intermediate
  language: multi
  tags: travel, hiking, trails, elevation, safety, difficulty
---

# Plan Hiking Tour

Plan a hiking tour with trail selection, time estimation, elevation analysis, and safety assessment for groups of varying fitness levels.

## When to Use

- Planning a day hike or multi-day trekking tour
- Selecting trails appropriate for a group's fitness and experience
- Estimating realistic hiking times for route planning
- Assessing whether a route is safe given current conditions
- Planning hut-to-hut tours with overnight logistics

## Inputs

- **Required**: Region or area for the hike
- **Required**: Group profile (number of people, fitness level, experience)
- **Required**: Available time (day hike duration or number of days)
- **Optional**: Difficulty preference (SAC T1-T6, or descriptive: easy/moderate/hard)
- **Optional**: Elevation gain/loss tolerance (meters)
- **Optional**: Specific peaks, huts, or destinations to include
- **Optional**: Season and expected weather window

## Procedure

### Step 1: Define Requirements

Establish the parameters that constrain trail selection.

```
Group Fitness Classification:
┌──────────────┬──────────────────────────────────────────────────┐
│ Level        │ Capabilities                                     │
├──────────────┼──────────────────────────────────────────────────┤
│ Beginner     │ 3-4 hrs walking, <500 m elevation gain,          │
│              │ well-marked paths only (SAC T1-T2)               │
├──────────────┼──────────────────────────────────────────────────┤
│ Intermediate │ 5-7 hrs walking, 500-1000 m elevation gain,      │
│              │ mountain trails with some exposure (SAC T2-T3)   │
├──────────────┼──────────────────────────────────────────────────┤
│ Advanced     │ 7-10 hrs walking, 1000-1500 m elevation gain,    │
│              │ alpine trails, scrambling (SAC T3-T5)            │
├──────────────┼──────────────────────────────────────────────────┤
│ Expert       │ 10+ hrs, 1500+ m gain, via ferrata, glacier,     │
│              │ technical terrain (SAC T5-T6, UIAA I-III)        │
└──────────────┴──────────────────────────────────────────────────┘

SAC Hiking Scale Reference:
  T1 - Hiking:         Well-maintained paths, no exposure
  T2 - Mountain hiking: Marked trails, some steep sections
  T3 - Demanding:      Exposed sections, scree, basic scrambling
  T4 - Alpine hiking:  Simple scrambling, steep exposed terrain
  T5 - Demanding alpine: Challenging scrambling, glacier crossings
  T6 - Difficult alpine: Very exposed climbing, technical ice/rock
```

Document the group's weakest-link fitness level, as this determines the maximum difficulty.

**Expected:** A clear requirements profile with group level, time budget, elevation tolerance, and any must-include or must-avoid constraints.

**On failure:** If the group has mixed fitness levels, plan for the weakest member but identify optional extensions for stronger hikers (e.g., a peak side trip while others rest at a hut).

### Step 2: Select Trail Candidates

Research and shortlist trails matching the requirements.

Sources for trail data:
- Hiking guidebooks and regional websites
- OpenStreetMap (trails tagged with `sac_scale`)
- National/regional trail databases (e.g., SchweizMobil, Alpenverein)
- WebSearch for "[region] hiking trails [difficulty]"

For each candidate trail, collect:

```
Trail Data Sheet:
┌─────────────────────┬──────────────────────────────────────┐
│ Field               │ Value                                │
├─────────────────────┼──────────────────────────────────────┤
│ Trail name/number   │                                      │
│ Start point         │ Name, elevation, access              │
│ End point           │ Name, elevation, access              │
│ Distance (km)       │                                      │
│ Elevation gain (m)  │                                      │
│ Elevation loss (m)  │                                      │
│ Highest point (m)   │                                      │
│ Difficulty (SAC)    │                                      │
│ Exposure            │ None / Moderate / Significant        │
│ Markings            │ Well-marked / Sparse / Unmarked      │
│ Huts/shelters       │ Names and locations along route      │
│ Water sources       │ Reliable / Seasonal / None           │
│ Season              │ Months when passable                 │
│ Escape routes       │ Points where you can exit early      │
└─────────────────────┴──────────────────────────────────────┘
```

Shortlist 2-3 candidates that fit the requirements plus one easier backup option.

**Expected:** A shortlist of trail candidates with complete data sheets, all within the group's capability range.

**On failure:** If no trails match all constraints, relax the least important constraint first (typically distance before difficulty). If trail data is incomplete, note the gaps and plan to verify on-site or contact local tourism offices.

### Step 3: Calculate Times Using Munter Formula

Estimate hiking time using the Swiss Alpine Club (SAC) Munter formula for realistic planning.

```
Munter Formula:
  Time (hours) = (horizontal_km + vertical_km) / pace

  Where:
  - horizontal_km = trail distance in km
  - vertical_km   = elevation gain in meters / 100
                     (each 100 m up counts as 1 km)
  - pace           = km/h achieved on flat ground

Pace by Fitness Level:
┌──────────────┬────────────────┬──────────────────────────────┐
│ Level        │ Pace (km/h)    │ Notes                        │
├──────────────┼────────────────┼──────────────────────────────┤
│ Beginner     │ 3.5            │ Includes frequent stops      │
│ Intermediate │ 4.0            │ Steady pace, short breaks    │
│ Advanced     │ 4.5            │ Efficient pace, few breaks   │
│ Expert       │ 5.0            │ Fast and steady              │
│ With kids    │ 2.5-3.0        │ Very frequent stops          │
│ Heavy pack   │ Subtract 0.5   │ Multi-day with full pack     │
└──────────────┴────────────────┴──────────────────────────────┘

Descent Adjustment:
  - Gentle descent (<20% grade): adds minimal time
  - Steep descent (>20% grade): add elevation_loss_m / 200 hours
  - Very steep/technical: add elevation_loss_m / 150 hours
```

Example calculation:
```
Trail: 12 km distance, 850 m elevation gain, 400 m steep descent
Group: Intermediate (pace = 4.0 km/h)

Ascent component:  (12 + 850/100) / 4.0 = (12 + 8.5) / 4.0 = 5.1 hours
Descent component: 400 / 200 = 2.0 hours additional for steep descent
Total estimate:    5.1 + 2.0 = 7.1 hours (round to 7-7.5 hours)

Add breaks: +30 min lunch, +15 min x 3 short breaks = +75 min
Total with breaks: approximately 8.5 hours trailhead to trailhead
```

**Expected:** Time estimates for each trail candidate, including break time. Estimates should be conservative (better to arrive early than to hike in darkness).

**On failure:** If calculated times exceed the available daylight, the route is too long. Either shorten it (find a closer end point or skip a section via transport) or split into two days. If the group is untested, use the beginner pace for the first day and adjust based on actual performance.

### Step 4: Assess Safety

Evaluate objective and subjective hazards for the selected route.

```
Safety Assessment Checklist:
┌──────────────────────┬────────────┬──────────────────────────────┐
│ Hazard               │ Rating     │ Mitigation                   │
├──────────────────────┼────────────┼──────────────────────────────┤
│ Weather forecast     │ Good/Fair/ │ Check 3 sources; define      │
│                      │ Poor       │ turn-around weather triggers  │
├──────────────────────┼────────────┼──────────────────────────────┤
│ Thunderstorm risk    │ Low/Med/   │ Plan to be below treeline    │
│                      │ High       │ by early afternoon           │
├──────────────────────┼────────────┼──────────────────────────────┤
│ Snow/ice on trail    │ None/Some/ │ Check snow line; carry       │
│                      │ Extensive  │ microspikes if needed        │
├──────────────────────┼────────────┼──────────────────────────────┤
│ River crossings      │ Dry/Normal/│ Check recent rainfall;       │
│                      │ High water │ identify bridges or fords    │
├──────────────────────┼────────────┼──────────────────────────────┤
│ Exposure/fall risk   │ None/Mod/  │ Assess group comfort level;  │
│                      │ Significant│ carry slings for short-roping│
├──────────────────────┼────────────┼──────────────────────────────┤
│ Trail condition      │ Good/Fair/ │ Check maintenance reports;   │
│                      │ Poor       │ plan for slower pace if poor │
├──────────────────────┼────────────┼──────────────────────────────┤
│ Escape routes        │ Multiple/  │ Identify exit points and     │
│                      │ Few/None   │ nearest road access          │
├──────────────────────┼────────────┼──────────────────────────────┤
│ Cell coverage        │ Good/Spotty│ Download offline maps;       │
│                      │ /None      │ carry emergency beacon if    │
│                      │            │ remote                       │
└──────────────────────┴────────────┴──────────────────────────────┘

Overall Safety Rating:
  GREEN  - All factors favorable, proceed as planned
  YELLOW - One or more concerns, proceed with extra caution and backup plan
  RED    - Significant hazards present, postpone or choose alternative route
```

**Expected:** A completed safety assessment with all hazards rated and mitigations documented. An overall GREEN/YELLOW/RED rating for the go/no-go decision.

**On failure:** If the assessment yields RED for the primary route, switch to the backup option from Step 2. If all options are RED (e.g., severe weather forecast), postpone the hike. Never override a RED safety rating for schedule convenience.

### Step 5: Plan Logistics

Organize practical details for the hiking day or multi-day tour.

```
Logistics Checklist:
┌──────────────────────┬──────────────────────────────────────────┐
│ Category             │ Details to confirm                       │
├──────────────────────┼──────────────────────────────────────────┤
│ Trailhead access     │ Driving directions, parking, bus/train   │
│ Hut reservations     │ Booking required? Half-board available?  │
│ Water resupply       │ Reliable sources along route             │
│ Food                 │ Packed lunch, hut meals, snacks          │
│ Gear                 │ See check-hiking-gear skill              │
│ Emergency contacts   │ Mountain rescue #, local emergency       │
│ Map and navigation   │ Paper map, offline GPS, waypoints loaded │
│ Group communication  │ Meeting points if group separates        │
│ Return transport     │ Last bus/train time from endpoint        │
│ Parking shuttle      │ If start != end, how to retrieve car     │
└──────────────────────┴──────────────────────────────────────────┘
```

For multi-day tours:
1. Book huts well in advance (popular huts fill months ahead)
2. Plan resupply points for food and water
3. Identify bail-out points for each day (where to exit if someone is injured or weather turns)
4. Share the itinerary with someone not on the hike

**Expected:** All logistics confirmed or flagged as pending. Hut reservations made. Transport to/from trailhead arranged. Emergency plan documented.

**On failure:** If huts are full, check for nearby alternatives (bivouacs, camping, lower huts with longer approach). If trailhead access is complicated (e.g., closed road), arrange alternative transport or adjust the starting point.

### Step 6: Generate Hiking Plan

Compile everything into a complete hiking plan document.

```
Hiking Plan Document Structure:
1. Summary
   - Route name, dates, total distance/elevation
   - Group members and emergency contacts
   - Overall difficulty and safety rating

2. Day-by-Day Itinerary
   - Start/end points with times
   - Distance, elevation gain/loss, estimated time
   - Key waypoints and navigation notes
   - Water sources and meal plans
   - Escape route options

3. Safety Information
   - Weather forecast (to be updated day-of)
   - Known hazards and mitigations
   - Turn-around time and triggers
   - Emergency procedures and contacts

4. Logistics
   - Transport arrangements
   - Accommodation bookings
   - Gear checklist reference

5. Maps
   - Overview map with all days
   - Elevation profile for each day
```

**Expected:** A complete hiking plan that can be shared with all participants and left with an emergency contact. The plan should be actionable without additional research.

**On failure:** If the plan has gaps that cannot be filled before departure, document them clearly and assign someone to resolve each item. Critical safety gaps (no escape route identified, no weather check plan) must be resolved before departure.

## Validation

- [ ] Trail difficulty matches the group's fitness and experience level
- [ ] Time estimates use Munter formula with appropriate pace for the group
- [ ] Safety assessment is completed with all hazards rated
- [ ] Overall safety rating is GREEN or YELLOW (not RED)
- [ ] Hut/accommodation reservations are confirmed for multi-day tours
- [ ] Water resupply points are identified for each segment
- [ ] Escape routes are mapped for each day
- [ ] Emergency contacts and procedures are documented
- [ ] Itinerary shared with an emergency contact not on the hike
- [ ] Gear checklist generated (via check-hiking-gear skill)

## Common Pitfalls

- **Planning for the fastest hiker**: Always plan for the slowest group member. The group moves at the pace of its weakest link.
- **Ignoring descent time**: Steep descents are slow and punishing on knees. The Munter formula accounts for this, but many hikers underestimate it.
- **No turnaround time**: Set a hard turnaround time (typically early afternoon for alpine routes) to avoid descending in darkness or afternoon thunderstorms.
- **Skipping the backup route**: Weather and conditions change. Always have an easier alternative prepared.
- **Overloaded first day**: Start with a shorter, easier day to assess group pace and acclimatize, especially at altitude.
- **Altitude underestimation**: Above 2500 m, reduce pace by 10-20% for unacclimatized hikers. Above 3000 m, altitude sickness risk is real.
- **Hut booking assumptions**: Popular mountain huts (especially in the Alps) require reservations weeks or months in advance. Never assume walk-in availability in high season.

## Related Skills

- `check-hiking-gear` — generate an optimized gear checklist for the planned hike
- `assess-trail-conditions` — evaluate current conditions on the selected trail
- `plan-tour-route` — broader tour planning for non-hiking segments
- `create-spatial-visualization` — visualize the hiking route and elevation profile
- `generate-tour-report` — compile the hiking plan into a formatted report
