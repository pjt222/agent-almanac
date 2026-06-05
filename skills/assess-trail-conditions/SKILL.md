---
name: assess-trail-conditions
description: >
  Evaluate current trail conditions including weather, snow line, river
  crossings, exposure, and trail maintenance status for safety decision-making.
  Produces a GREEN/YELLOW/RED safety rating with actionable go/no-go
  recommendations. Use the day before or morning of a planned hike, during tour
  planning to assess seasonal viability, after unexpected weather changes on a
  multi-day tour, when reports suggest trail damage or closures, or before
  committing to an alpine or exposed route.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: travel
  complexity: intermediate
  language: multi
  tags: travel, hiking, safety, weather, terrain, conditions
---

# Assess Trail Conditions

Evaluate current trail conditions for safety decision-making before a planned hike or during tour planning.

## When to Use

- The day before or morning of a planned hike to make a go/no-go decision
- During tour planning to assess seasonal viability of a route
- After unexpected weather changes during a multi-day tour
- When reports suggest trail damage, closures, or unusual hazards
- Before committing to an alpine or exposed route

## Inputs

- **Required**: Trail name, region, and approximate coordinates or waypoints
- **Required**: Planned date(s) of the hike
- **Optional**: Trail difficulty rating (SAC T1-T6)
- **Optional**: Maximum elevation on the route
- **Optional**: Known hazard points (river crossings, exposed ridges, glaciers)
- **Optional**: Group experience level (affects risk tolerance thresholds)

## Procedure

### Step 1: Gather Weather Data

Collect weather forecasts from multiple sources for the trail's elevation range.

```
Weather Data Sources (in preference order):
┌────────────────────────┬──────────────────────────────────────┐
│ Source                 │ Best for                             │
├────────────────────────┼──────────────────────────────────────┤
│ National weather svc   │ Official forecasts with warnings     │
│ (MeteoSwiss, ZAMG,    │                                      │
│ DWD, Meteo-France)    │                                      │
├────────────────────────┼──────────────────────────────────────┤
│ Mountain-specific      │ Altitude-stratified forecasts        │
│ forecasts (e.g.,      │ (valley vs. summit conditions)       │
│ bergfex, meteoblue)   │                                      │
├────────────────────────┼──────────────────────────────────────┤
│ Avalanche bulletins    │ Snow stability (winter/spring)       │
│ (SLF, EAWS members)  │                                      │
├────────────────────────┼──────────────────────────────────────┤
│ Local webcams          │ Real-time visual conditions          │
├────────────────────────┼──────────────────────────────────────┤
│ Recent trip reports    │ On-the-ground observations           │
└────────────────────────┴──────────────────────────────────────┘
```

Collect the following data points:

```
Weather Assessment:
┌─────────────────────┬───────────────┬───────────────────────────┐
│ Parameter           │ Valley        │ Summit/Ridge              │
├─────────────────────┼───────────────┼───────────────────────────┤
│ Temperature (C)     │               │                           │
│ Wind speed (km/h)   │               │                           │
│ Wind gusts (km/h)   │               │                           │
│ Precipitation (mm)  │               │                           │
│ Precipitation type  │               │                           │
│ Visibility (km)     │               │                           │
│ Cloud base (m)      │               │                           │
│ Freezing level (m)  │               │                           │
│ Snow line (m)       │               │                           │
│ Thunderstorm risk   │               │                           │
│ UV index            │               │                           │
└─────────────────────┴───────────────┴───────────────────────────┘
```

**Expected:** Weather data from at least 2 independent sources, with altitude-specific information for both the lowest and highest points of the route.

**On failure:** If detailed mountain forecasts are unavailable for the specific region, use general forecasts with altitude adjustments: temperature drops approximately 6.5 C per 1000 m of elevation gain, wind speed increases with altitude and exposure. If forecasts disagree, plan for the worse prediction.

### Step 2: Assess Terrain Conditions

Evaluate the current state of the trail surface, snow, water, and exposure hazards.

```
Terrain Condition Factors:
┌──────────────────────┬─────────────────────────────────────────┐
│ Factor               │ Assessment Method                       │
├──────────────────────┼─────────────────────────────────────────┤
│ Snow cover           │ Compare current snow line to route's    │
│                      │ highest point. If route goes above snow │
│                      │ line, assess whether snow gear is       │
│                      │ needed and if the group has it.         │
├──────────────────────┼─────────────────────────────────────────┤
│ Ice                  │ North-facing slopes above freezing      │
│                      │ level may retain ice even in summer.    │
│                      │ Check recent overnight temps.           │
├──────────────────────┼─────────────────────────────────────────┤
│ River/stream         │ Check recent rainfall totals. Rivers    │
│ crossings            │ can be impassable 24-48 hrs after       │
│                      │ heavy rain or during snowmelt peak.     │
├──────────────────────┼─────────────────────────────────────────┤
│ Rockfall zones       │ More active after freeze-thaw cycles    │
│                      │ and rain. Early morning passage is      │
│                      │ safer (frozen in place overnight).      │
├──────────────────────┼─────────────────────────────────────────┤
│ Mud/erosion          │ Recent rain makes steep trails          │
│                      │ slippery and increases fall risk.       │
│                      │ Poles recommended.                      │
├──────────────────────┼─────────────────────────────────────────┤
│ Exposure (ridges,    │ Wind speed determines whether exposed   │
│ cliff paths)         │ sections are safe. Gusts >60 km/h make │
│                      │ exposed ridges dangerous.               │
└──────────────────────┴─────────────────────────────────────────┘
```

Data sources for terrain conditions:
- Recent trip reports (hiking forums, mountain club sites)
- Hut warden reports (call the nearest hut)
- Webcams at or near the trail
- Avalanche bulletins (include snow and terrain info even in summer)
- Trail maintenance authorities (national park offices, Alpenverein sections)

**Expected:** A terrain assessment for each significant hazard point on the route, based on current data no more than 48 hours old.

**On failure:** If current condition data is unavailable (remote area, no recent reports), assume conditions are worse than average for the season. Contact the nearest staffed hut or mountain rescue station for local knowledge.

### Step 3: Evaluate Trail Status

Check for closures, diversions, and maintenance issues on the planned route.

```
Trail Status Sources:
┌────────────────────────┬──────────────────────────────────────┐
│ Source                 │ Information type                     │
├────────────────────────┼──────────────────────────────────────┤
│ Official trail portals │ Closures, diversions, damage reports │
│ (regional/national)   │                                      │
├────────────────────────┼──────────────────────────────────────┤
│ National park websites │ Seasonal closures (wildlife, snow)   │
├────────────────────────┼──────────────────────────────────────┤
│ Hut websites/phones   │ Hut opening dates, path conditions   │
├────────────────────────┼──────────────────────────────────────┤
│ Local tourism offices  │ Recent trail work, event closures    │
├────────────────────────┼──────────────────────────────────────┤
│ Hiking community       │ Unofficial reports, photos, GPX      │
│ (forums, apps)        │ tracks showing actual paths taken     │
└────────────────────────┴──────────────────────────────────────┘
```

Check for:
1. **Full closures**: Trail impassable or legally closed (wildlife protection, construction)
2. **Partial closures**: Sections closed with official diversions
3. **Seasonal closures**: Trail not yet open for the season (snow, hut not staffed)
4. **Damage reports**: Landslides, bridge washouts, trail erosion
5. **Event impacts**: Races, military exercises, hunting seasons

**Expected:** Confirmed trail status (open, partially closed, closed) with any diversions mapped and time impact estimated.

**On failure:** If trail status cannot be confirmed, plan for potential diversions. Carry a detailed map (not just the trail app route) so that alternatives can be navigated on the spot. If a trail is listed as closed, respect the closure even if it appears passable.

### Step 4: Rate Safety Level

Combine all assessment data into an overall safety rating.

```
Safety Rating Criteria:
┌─────────┬────────────────────────────────────────────────────┐
│ Rating  │ Criteria                                           │
├─────────┼────────────────────────────────────────────────────┤
│ GREEN   │ All of:                                            │
│         │ - Weather forecast stable, no severe warnings      │
│         │ - Trail open with no significant hazards           │
│         │ - Terrain conditions normal for the season         │
│         │ - Route within group's capability                  │
│         │ - Visibility good (>5 km at altitude)              │
├─────────┼────────────────────────────────────────────────────┤
│ YELLOW  │ One or more of:                                    │
│         │ - Afternoon thunderstorm risk (>30%)               │
│         │ - Wind gusts 40-60 km/h on exposed sections        │
│         │ - Trail partially closed (diversion available)     │
│         │ - Snow patches requiring care but no special gear  │
│         │ - Recent rain making terrain slippery              │
│         │ - Route near the group's capability limit          │
│         │ Decision: Proceed with extra caution and backup    │
├─────────┼────────────────────────────────────────────────────┤
│ RED     │ Any of:                                            │
│         │ - Severe weather warning (storm, heavy snow)       │
│         │ - Wind gusts >60 km/h on exposed terrain           │
│         │ - Trail closed (no safe diversion)                 │
│         │ - Snow/ice requiring gear the group lacks          │
│         │ - Visibility <1 km on unmarked/exposed terrain     │
│         │ - River crossings at dangerous water levels        │
│         │ - Avalanche danger level 3+ on route               │
│         │ - Route clearly exceeds group's capability         │
│         │ Decision: Do not proceed. Choose alternative or    │
│         │ postpone.                                          │
└─────────┴────────────────────────────────────────────────────┘
```

For YELLOW ratings, define specific mitigation actions:
- Early start to beat afternoon weather
- Turnaround time if conditions worsen
- Specific sections to monitor closely
- Communication plan if group separates

**Expected:** A clear GREEN, YELLOW, or RED rating with specific justification. YELLOW ratings include actionable mitigation steps and defined trigger points for abort.

**On failure:** If the assessment is inconclusive (insufficient data to rate confidently), treat it as YELLOW at minimum. Uncertainty should increase caution, not decrease it. If any single factor is RED, the overall rating is RED regardless of other factors.

### Step 5: Generate Conditions Report

Compile the assessment into a concise, actionable report.

```
Conditions Report Template:
═══════════════════════════════════════════════
TRAIL CONDITIONS REPORT
───────────────────────────────────────────────
Trail:    [Name / Route Number]
Date:     [Assessment date and time]
Hike date:[Planned date]
Rating:   [GREEN / YELLOW / RED]
───────────────────────────────────────────────

WEATHER SUMMARY
  Valley:  [temp]C, [wind] km/h, [precipitation]
  Summit:  [temp]C, [wind] km/h, [precipitation]
  Outlook: [trend: improving / stable / deteriorating]
  Alerts:  [any active warnings]

TERRAIN CONDITIONS
  Snow line:     [elevation] m ([above/below] route max)
  Trail surface: [dry / wet / muddy / icy / snow-covered]
  Water levels:  [normal / elevated / dangerous]
  Rockfall risk: [low / moderate / high]

TRAIL STATUS
  Status:     [open / partially closed / closed]
  Diversions: [none / details]
  Known issues:[list any damage or hazards]

RECOMMENDATIONS
  [Specific actions based on rating:]
  - [e.g., Start by 06:00 to clear ridge before noon]
  - [e.g., Carry microspikes for north-facing traverse]
  - [e.g., Turnaround by 13:00 if clouds build]

DECISION
  [GO / GO WITH CAUTION / NO-GO]
  [Reasoning in 1-2 sentences]
═══════════════════════════════════════════════
```

**Expected:** A complete, dated conditions report that enables an informed go/no-go decision. The report should be shareable with all group members and understandable without additional context.

**On failure:** If the report cannot be completed (e.g., key data unavailable), state what is unknown and how it affects the decision. An incomplete assessment with acknowledged gaps is safer than a false sense of certainty.

## Validation

- [ ] Weather data collected from at least 2 independent sources
- [ ] Altitude-specific forecasts obtained (not just valley weather)
- [ ] Terrain conditions assessed for all key hazard points on the route
- [ ] Trail status verified (open/closed/diversions)
- [ ] Safety rating assigned with clear justification
- [ ] Mitigations defined for YELLOW ratings
- [ ] Conditions report is complete and dated
- [ ] Report shared with all group members
- [ ] Assessment is no more than 24 hours old at time of departure

## Common Pitfalls

- **Valley weather bias**: Clear skies in the valley mean nothing at altitude. Always check summit-level forecasts; conditions can be dramatically different 1000 m higher.
- **Stale data**: A report from 3 days ago is unreliable. Mountain conditions change rapidly. Reassess on the morning of the hike.
- **Optimism bias**: The desire to hike a planned route makes people rationalize marginal conditions. If you have to argue the case for going, the conditions are probably not good enough.
- **Single-source reliance**: One forecast can be wrong. Cross-check with at least two sources, and weight local/mountain-specific sources over general ones.
- **Ignoring trend**: Current conditions may be acceptable but deteriorating. A deteriorating trend requires more caution than the snapshot suggests.
- **Social pressure override**: Never proceed because the group is eager or because you drove a long way. The mountain will be there next week; you might not be.
- **Snow line miscalculation**: The reported snow line is an average. North-facing slopes can hold snow 200-500 m below the reported line.

## Related Skills

- `plan-hiking-tour` — uses this assessment as input for the safety evaluation step
- `check-hiking-gear` — gear adjustments based on assessed conditions (add microspikes, extra layers)
- `plan-tour-route` — trail condition awareness for broader tour planning
- `create-spatial-visualization` — visualize hazard zones on a map overlay
