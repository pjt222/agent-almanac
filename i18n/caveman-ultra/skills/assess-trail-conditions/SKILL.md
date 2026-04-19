---
name: assess-trail-conditions
locale: caveman-ultra
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

Eval current trail conditions → safety decision pre-hike or during tour plan.

## Use When

- Day before or morning of planned hike → go/no-go
- Tour planning → seasonal viability
- After unexpected weather on multi-day tour
- Reports suggest trail damage, closures, unusual hazards
- Before committing alpine or exposed route

## In

- **Required**: Trail name, region, coords/waypoints
- **Required**: Planned date(s)
- **Optional**: Difficulty (SAC T1-T6)
- **Optional**: Max elevation
- **Optional**: Known hazard pts (river crossings, exposed ridges, glaciers)
- **Optional**: Group exp level (risk tolerance thresholds)

## Do

### Step 1: Gather Weather

Forecasts from multi srcs for trail's elevation range.

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

Collect:

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

**→** Weather from ≥2 independent srcs + altitude-specific for lowest + highest route pts.

**If err:** Detailed mountain forecasts unavail for region → general forecasts + altitude adjustments: temp drops ~6.5 C per 1000 m gain, wind increases w/ altitude + exposure. Forecasts disagree → plan worse prediction.

### Step 2: Assess Terrain

Current state of trail surface, snow, water, exposure hazards.

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

Data srcs for terrain:
- Recent trip reports (forums, club sites)
- Hut warden reports (call nearest)
- Webcams at/near trail
- Avalanche bulletins (snow + terrain info even summer)
- Trail maintenance authorities (nat park offices, Alpenverein)

**→** Terrain assessment per significant hazard pt, current data ≤48 hr old.

**If err:** Current data unavail (remote, no recent reports) → assume worse than avg for season. Contact nearest staffed hut or mountain rescue for local knowledge.

### Step 3: Eval Trail Status

Closures, diversions, maintenance on planned route.

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
2. **Partial closures**: Sections closed w/ official diversions
3. **Seasonal closures**: Not yet open (snow, hut not staffed)
4. **Damage reports**: Landslides, bridge washouts, trail erosion
5. **Event impacts**: Races, military exercises, hunting seasons

**→** Confirmed trail status (open, partially closed, closed) + diversions mapped + time impact estimated.

**If err:** Status can't be confirmed → plan potential diversions. Carry detailed map (not just trail app route) → alternatives navigable on spot. Listed closed → respect even if appears passable.

### Step 4: Rate Safety Level

Combine all into overall safety rating.

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

YELLOW ratings → specific mitigation actions:
- Early start → beat afternoon weather
- Turnaround time if conditions worsen
- Specific sections to monitor closely
- Communication plan if group separates

**→** Clear GREEN/YELLOW/RED + specific justification. YELLOW → actionable mitigation + defined trigger pts for abort.

**If err:** Inconclusive (insufficient data) → treat YELLOW min. Uncertainty should increase caution. Any single RED → overall RED regardless of others.

### Step 5: Generate Report

Concise actionable report.

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

**→** Complete dated conditions report enabling informed go/no-go. Shareable w/ all group + understandable no additional ctx.

**If err:** Can't complete report (key data unavail) → state what unknown + how affects decision. Incomplete + acknowledged gaps safer than false certainty.

## Check

- [ ] Weather from ≥2 independent srcs
- [ ] Altitude-specific forecasts (not just valley)
- [ ] Terrain assessed all key hazard pts
- [ ] Trail status verified (open/closed/diversions)
- [ ] Safety rating assigned + clear justification
- [ ] Mitigations defined for YELLOW
- [ ] Report complete + dated
- [ ] Report shared w/ all group members
- [ ] Assessment ≤24 hr old at departure

## Traps

- **Valley weather bias**: Clear valley means nothing at altitude. Always check summit-level; dramatically different 1000 m higher.
- **Stale data**: Report from 3 days unreliable. Mountain conditions change rapidly. Reassess morning of hike.
- **Optimism bias**: Desire → rationalize marginal conditions. Argue case for going → probably not good enough.
- **Single-src reliance**: 1 forecast can be wrong. Cross-check ≥2 srcs, weight local/mountain-specific > general.
- **Ignore trend**: Current acceptable but deteriorating → more caution than snapshot suggests.
- **Social pressure override**: Never proceed because group eager or long drive. Mountain will be there next week; you might not.
- **Snow line miscalc**: Reported snow line = avg. North-facing slopes hold snow 200-500 m below reported.

## →

- `plan-hiking-tour` — uses this assessment as input for safety eval step
- `check-hiking-gear` — gear adjustments per assessed conditions (microspikes, extra layers)
- `plan-tour-route` — trail condition awareness for broader tour planning
- `create-spatial-visualization` — visualize hazard zones on map overlay
