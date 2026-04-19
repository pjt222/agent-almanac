---
name: assess-trail-conditions
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
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

Evaluate current trail conditions for safety decision-making before planned hike or during tour planning.

## When Use

- Day before or morning of planned hike to make go/no-go decision
- During tour planning to assess seasonal viability of route
- After unexpected weather changes during multi-day tour
- Reports suggest trail damage, closures, or unusual hazards
- Before committing to alpine or exposed route

## Inputs

- **Required**: Trail name, region, approximate coordinates or waypoints
- **Required**: Planned date(s) of hike
- **Optional**: Trail difficulty rating (SAC T1-T6)
- **Optional**: Maximum elevation on route
- **Optional**: Known hazard points (river crossings, exposed ridges, glaciers)
- **Optional**: Group experience level (affects risk tolerance thresholds)

## Steps

### Step 1: Gather Weather Data

Collect weather forecasts from multiple sources for trail's elevation range.

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

**Got:** Weather data from at least 2 independent sources, with altitude-specific information for both lowest and highest points of route.

**If fail:** Detailed mountain forecasts unavailable for specific region? Use general forecasts with altitude adjustments: temperature drops approximately 6.5 C per 1000 m of elevation gain, wind speed increases with altitude and exposure. Forecasts disagree? Plan for worse prediction.

### Step 2: Assess Terrain Conditions

Evaluate current state of trail surface, snow, water, exposure hazards.

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
- Hut warden reports (call nearest hut)
- Webcams at or near trail
- Avalanche bulletins (include snow and terrain info even in summer)
- Trail maintenance authorities (national park offices, Alpenverein sections)

**Got:** Terrain assessment for each significant hazard point on route, based on current data no more than 48 hours old.

**If fail:** Current condition data unavailable (remote area, no recent reports)? Assume conditions worse than average for season. Contact nearest staffed hut or mountain rescue station for local knowledge.

### Step 3: Evaluate Trail Status

Check for closures, diversions, maintenance issues on planned route.

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
3. **Seasonal closures**: Trail not yet open for season (snow, hut not staffed)
4. **Damage reports**: Landslides, bridge washouts, trail erosion
5. **Event impacts**: Races, military exercises, hunting seasons

**Got:** Confirmed trail status (open, partially closed, closed) with any diversions mapped and time impact estimated.

**If fail:** Trail status cannot be confirmed? Plan for potential diversions. Carry detailed map (not just trail app route) so alternatives can be navigated on spot. Trail listed as closed? Respect closure even if appears passable.

### Step 4: Rate Safety Level

Combine all assessment data into overall safety rating.

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

**Got:** Clear GREEN, YELLOW, or RED rating with specific justification. YELLOW ratings include actionable mitigation steps and defined trigger points for abort.

**If fail:** Assessment inconclusive (insufficient data to rate confidently)? Treat as YELLOW at minimum. Uncertainty should increase caution, not decrease it. Any single factor RED? Overall rating RED regardless of other factors.

### Step 5: Generate Conditions Report

Compile assessment into concise, actionable report.

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

**Got:** Complete, dated conditions report that enables informed go/no-go decision. Report should be shareable with all group members and understandable without additional context.

**If fail:** Report cannot be completed (e.g., key data unavailable)? State what is unknown and how it affects decision. Incomplete assessment with acknowledged gaps safer than false sense of certainty.

## Checks

- [ ] Weather data collected from at least 2 independent sources
- [ ] Altitude-specific forecasts obtained (not just valley weather)
- [ ] Terrain conditions assessed for all key hazard points on route
- [ ] Trail status verified (open/closed/diversions)
- [ ] Safety rating assigned with clear justification
- [ ] Mitigations defined for YELLOW ratings
- [ ] Conditions report complete and dated
- [ ] Report shared with all group members
- [ ] Assessment no more than 24 hours old at time of departure

## Pitfalls

- **Valley weather bias**: Clear skies in valley mean nothing at altitude. Always check summit-level forecasts; conditions can be dramatically different 1000 m higher.
- **Stale data**: Report from 3 days ago is unreliable. Mountain conditions change rapidly. Reassess on morning of hike.
- **Optimism bias**: Desire to hike planned route makes people rationalize marginal conditions. Have to argue case for going? Conditions probably not good enough.
- **Single-source reliance**: One forecast can be wrong. Cross-check with at least two sources, weight local/mountain-specific sources over general ones.
- **Ignoring trend**: Current conditions may be acceptable but deteriorating. Deteriorating trend requires more caution than snapshot suggests.
- **Social pressure override**: Never proceed because group is eager or because you drove long way. Mountain will be there next week; you might not be.
- **Snow line miscalculation**: Reported snow line is average. North-facing slopes can hold snow 200-500 m below reported line.

## See Also

- `plan-hiking-tour` — uses this assessment as input for safety evaluation step
- `check-hiking-gear` — gear adjustments based on assessed conditions (add microspikes, extra layers)
- `plan-tour-route` — trail condition awareness for broader tour planning
- `create-spatial-visualization` — visualize hazard zones on map overlay
