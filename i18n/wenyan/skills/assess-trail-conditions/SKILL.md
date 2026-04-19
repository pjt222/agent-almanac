---
name: assess-trail-conditions
locale: wenyan
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

# 察徑之況

為安決於擬行前或行中察當徑之況。

## 用時

- 擬行之日前或晨為行/不行之決乃用
- 行計中察路季可行乎乃用
- 多日行中氣突變後乃用
- 報示徑損、閉、或異險乃用
- 未決高山或暴路前乃用

## 入

- **必要**：徑名、區、約坐標或路點
- **必要**：擬行之日
- **可選**：徑難度（SAC T1-T6）
- **可選**：路之最高
- **可選**：已知險點（河渡、暴脊、冰川）
- **可選**：隊經度（影險容閾）

## 法

### 第一步：采氣象數

自多源采徑海拔範之氣象預。

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

采下數點：

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

**得：** 氣象數自至少二獨源，附路最低與最高之海拔特信。

**敗則：** 若特區無詳山預，以通預附海拔調：每升 1000m 溫約降 6.5C、風速隨高與暴增。預異則計最劣。

### 第二步：察地況

察徑面、雪、水、暴險之當態。

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

地況之數源：
- 近行報（山行壇、山會站）
- 山屋守者報（呼近屋）
- 徑上或附近之網攝
- 雪崩報（含雪與地之信雖夏）
- 徑維局（國家公園辦、Alpenverein 分部）

**得：** 每路要險點之地評，基於當數不過 48 時。

**敗則：** 若當況數不可得（遠區、無近報），假況較季均劣。呼近有人屋或山救站取土知。

### 第三步：察徑狀

察擬路之閉、繞、維患。

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
1. **全閉**：徑不可過或法閉（野生保、建）
2. **部閉**：段閉附官繞
3. **季閉**：徑未季開（雪、屋未人）
4. **損報**：滑、橋壞、徑蝕
5. **事影**：賽、軍演、獵季

**得：** 確徑狀（開、部閉、閉）附繞映且時影估。

**敗則：** 若徑狀不可確，計潛繞。攜詳圖（非僅徑應路）使現場可替。若徑列閉，敬之雖似可過。

### 第四步：評安級

合諸察數為總安級。

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

黃級定具緩行：
- 早始越午氣
- 況惡則回時
- 密察之特段
- 隊分則通計

**得：** 清 GREEN、YELLOW、或 RED 級附具由。黃級含可行緩步與定棄觸。

**敗則：** 若察歧（信不足以信評），至少視為 YELLOW。疑當增謹，非減之。若任一因為 RED，總為 RED 無論他因。

### 第五步：生況報

合察為簡可行之報。

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

**得：** 全附日之況報使明行/不行決。報當可共諸隊員而無需加境可解。

**敗則：** 若報不可全（如要數缺），述何未知及影。不全附認隙之察勝於假定。

## 驗

- [ ] 氣象數自至少二獨源采
- [ ] 海拔特預取（非僅谷氣）
- [ ] 地況於路諸要險點察
- [ ] 徑狀驗（開/閉/繞）
- [ ] 安級定附清由
- [ ] 黃級定緩步
- [ ] 況報全而附日
- [ ] 報共諸隊員
- [ ] 察於啟時不過 24 時

## 陷

- **谷氣偏**：谷晴不代山。恆察峰級預；況或千米上殊異
- **陳數**：三日前報不信。山況速變。行晨再察
- **樂觀偏**：欲行擬路致人理邊況。若須爭行，況或不足
- **依單源**：一預可誤。至少對二源，重土/山特勝通
- **忽趨**：當況可但惡。惡趨需於影更謹
- **社壓蓋**：勿以隊渴或遠駛而行。山下周仍在；汝或不
- **雪線誤算**：報雪線為均。北坡可於報線下 200-500m 持雪

## 參

- `plan-hiking-tour` — 此察為其安評步之入
- `check-hiking-gear` — 依察況調具（加尖釘、多層）
- `plan-tour-route` — 徑況察於廣行計
- `create-spatial-visualization` — 視險區於圖疊
