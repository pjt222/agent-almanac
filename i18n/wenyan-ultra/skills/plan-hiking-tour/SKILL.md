---
name: plan-hiking-tour
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
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

# 計徒行

擇徑（按 SAC/UIAA 難）、Munter 式估時、析升、評安、為各健群之徒計也。

## 用

- 日徒或多日徒劃→用
- 擇合群健與歷之徑→用
- 估實徒時→用
- 評徑於今況之安否→用
- 棚至棚多日徒含宿→用

## 入

- **必**：徒區
- **必**：群（人數、健級、歷）
- **必**：可用時（日徒長或日數）
- **可**：難偏（SAC T1-T6 或述：易/中/難）
- **可**：升降容（米）
- **可**：欲含峰、棚、的
- **可**：季與預氣窗

## 行

### 一：定需

立限擇徑之諸參。

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

記群最弱者之健級、定最大難。

得：明需檔含群級、時算、升容、欲含或避之限。

敗：群健不一→計於最弱者、識強者選延（如於棚息時側登峰）。

### 二：擇徑候

研並列合需之徑。

徑資源：
- 徒書與地站
- OpenStreetMap（徑標 `sac_scale`）
- 國/地徑庫（如 SchweizMobil、Alpenverein）
- WebSearch 「[區] hiking trails [難]」

各候徑、集：

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

列 2-3 合需之候、加一較易備選。

得：候徑列含全資、皆於群力內。

敗：無徑合諸限→先寬最不要之限（常距先於難）。徑資缺→記之、計於現驗或詢地遊署。

### 三：以 Munter 式算時

用瑞士山會 (SAC) Munter 式估徒時以實計。

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

例算：
```
Trail: 12 km distance, 850 m elevation gain, 400 m steep descent
Group: Intermediate (pace = 4.0 km/h)

Ascent component:  (12 + 850/100) / 4.0 = (12 + 8.5) / 4.0 = 5.1 hours
Descent component: 400 / 200 = 2.0 hours additional for steep descent
Total estimate:    5.1 + 2.0 = 7.1 hours (round to 7-7.5 hours)

Add breaks: +30 min lunch, +15 min x 3 short breaks = +75 min
Total with breaks: approximately 8.5 hours trailhead to trailhead
```

得：諸候徑時估含休。估宜保（早至優於暗中徒）。

敗：算時過晝→徑過長。縮之（覓近終或過運跳段）或分二日。群未試→首日用初級速、按實調。

### 四：評安

評擇徑之客觀與主觀險。

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

得：完安評含諸險評與緩。總 GREEN/YELLOW/RED 評以決行否。

敗：主徑得 RED→改步二之備。皆 RED（如惡氣預）→延徒。永勿為時程便而越 RED。

### 五：計後勤

辦徒日或多日之實事。

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

多日徒：
1. 早訂棚（熱棚月前已滿）
2. 計食水補點
3. 各日定脫退點（傷或氣轉時何處出）
4. 與不徒之人共行程

得：諸後勤確或標待。棚已訂。徒首尾運已辦。急計記。

敗：棚滿→察近備（露宿、營、低棚加長近）。徒首難（如閉路）→備他運或調起點。

### 六：生徒計檔

匯諸事為完徒計檔。

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

得：完徒計可共於諸與及留於急連絡。計當無需再研可行。

敗：計有缺不可發前補→明記、各派人解。要安缺（無脫退、無氣察計）必發前解。

## 驗

- [ ] 徑難合群健與歷
- [ ] 時估用 Munter 式合群速
- [ ] 安評畢、諸險已評
- [ ] 總安評 GREEN 或 YELLOW（非 RED）
- [ ] 多日徒之棚/宿已確
- [ ] 各段水補點識
- [ ] 各日脫退徑映
- [ ] 急連絡與程記
- [ ] 行程共於不徒之急連絡
- [ ] 具清單已生（過 check-hiking-gear 技）

## 忌

- **計於最速者**：必計於最弱者。群行於弱鏈速
- **忽降時**：陡降緩、傷膝。Munter 式納之、然多徒者輕之
- **無回頭時**：定硬回頭時（高山徑常午前）以避暗中或午後雷
- **略備徑**：氣況變。常備易者
- **首日過載**：首日宜短易以察群速與適、尤於高
- **輕高度**：過 2500 m 未適者減速 10-20%。過 3000 m 高山病險真
- **棚訂假**：熱山棚（尤阿爾卑斯）需數週月前訂。旺季勿假入

## 參

- `check-hiking-gear` — 為計徒生優具清單
- `assess-trail-conditions` — 評擇徑之今況
- `plan-tour-route` — 非徒段之廣計
- `create-spatial-visualization` — 視徒徑與升剖
- `generate-tour-report` — 匯徒計為格報
