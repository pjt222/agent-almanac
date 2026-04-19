---
name: assess-trail-conditions
locale: wenyan-ultra
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

# 評徑況

評今徑況為安決——氣、雪線、河渡、暴露、維。出綠/黃/紅安評附行/不行薦。

## 用

- 行前日或晨為行/不行決→用
- 旅謀為季可行評→用
- 多日旅意外氣變後→用
- 報示徑損或閉時→用
- 入高山或暴路前→用

## 入

- **必**：徑名、區、近座或路點
- **必**：計行日
- **可**：徑難（SAC T1-T6）
- **可**：路最高
- **可**：知險點（河渡、暴脊、冰）
- **可**：群經（影險忍）

## 行

### 一：採氣數

自多源收徑高範之氣預。

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

收諸數：

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

得：自至少 2 獨源之氣數，附路最低與最高之高專信。

敗：山專預不可達→用通預附高調：每升 1000 m 溫降約 6.5°C，風隨高與暴增。預異→計較劣預。

### 二：評地況

評徑面、雪、水、暴險今態。

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

地況數源：

- 近行報（行壇、山會址）
- 屋管報（呼最近屋）
- 徑或近徑網攝
- 雪崩公（夏含雪與地信）
- 徑維局（公園處、Alpenverein）

得：路各要險點之地評，基於不過 48 時之今數。

敗：今況數不可達（遠區無近報）→設況較季均劣。呼最近職屋或山救站求地知。

### 三：評徑態

察計路之閉、改道、維題。

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

察：

1. **全閉**：徑不可過或法閉（野生護、建）
2. **部閉**：段閉附正改道
3. **季閉**：徑季未開（雪、屋未職）
4. **損報**：滑、橋沖、徑蝕
5. **事影**：賽、軍演、獵季

得：徑態確（開、部閉、閉）附改道圖與時影估。

敗：徑態不可確→計潛改道。攜詳圖（非僅徑應路）使可現場航替。徑列為閉→敬之即似可過。

### 四：評安階

合諸評為總安評。

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

黃評定具減動：

- 早起以越午前氣
- 況劣轉返時
- 須密監之段
- 群分時通計

得：明 GREEN、YELLOW、或 RED 評附具證。YELLOW 含可行減步與定中止觸。

敗：評不結（信不足）→默至少 YELLOW。不確當增慎非減。任一素紅→總評紅不論他。

### 五：生況報

合評為簡可行報。

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

得：完、有日之況報使知行/不行決。報可分群且不需加脈可解。

敗：報不能完（如關數不可達）→述未知與其影決。明缺之不全評勝偽信。

## 驗

- [ ] 氣數自至少 2 獨源
- [ ] 高專預得（非僅谷氣）
- [ ] 路諸要險點之地況評
- [ ] 徑態驗（開/閉/改道）
- [ ] 安評附明證
- [ ] YELLOW 評之減定
- [ ] 況報完且日
- [ ] 報分諸群成員
- [ ] 評於起時不過 24 時舊

## 忌

- **谷氣偏**：谷天清於高無意。恆察峰預；況可較高 1000 m 大異
- **舊數**：3 日前報不靠。山況速變。行晨重評
- **樂偏**：欲行計路使理化邊況。需辯案者→況或不足
- **唯一源**：一預可誤。至少 2 源交核，重地/山專源
- **忽趨**：今況可受而退。退趨需較瞬示更慎
- **社壓覆**：永勿因群急或駕長而行。山次週仍在；君或不
- **雪線誤算**：報雪線為均。北面可保雪報線下 200-500 m

## 參

- `plan-hiking-tour` —— 用此評為安評步入
- `check-hiking-gear` —— 按評況裝調（加微爪、加層）
- `plan-tour-route` —— 廣旅謀之徑況覺
- `create-spatial-visualization` —— 圖險區於地疊
