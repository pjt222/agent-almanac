---
name: assess-trail-conditions
locale: wenyan-lite
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

# 評步道狀況

為計畫健行前或行程規劃中之安全決策評當前步道狀況。

## 適用時機

- 計畫健行之前日或當朝以決行否
- 行程規劃中評路線之季節可行
- 多日行中遇非預期天氣變
- 報告示步道損、關閉或異常危
- 投入高山或暴露路線前

## 輸入

- **必要**：步道名、區、約座標或航點
- **必要**：健行之計畫日
- **選擇性**：步道難度（SAC T1-T6）
- **選擇性**：路線最高海拔
- **選擇性**：已知危點（渡河、暴露脊、冰川）
- **選擇性**：團隊經驗等級（影響風險容忍閾值）

## 步驟

### 步驟一：收天氣資料

自多源收步道海拔範圍之天氣預報。

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

收下列資料點：

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

**預期：** 至少 2 獨立源之天氣資料，附路線最低與最高點之海拔特定資訊。

**失敗時：** 若特定區之詳山地預報不可用，用通用預報附海拔調：每升 1000 m 溫降約 6.5 C，風速隨海拔與暴露增。若預報不一致，按更壞之預測計畫。

### 步驟二：評地形狀況

評步道表、雪、水、暴露危之當前態。

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

地形狀況之資料源：
- 近期行程報告（健行論壇、山岳俱樂部站）
- 山屋管理員報告（呼最近山屋）
- 步道處或近處之網路攝影機
- 雪崩公報（即夏亦含雪與地形資訊）
- 步道維護機關（國家公園辦、Alpenverein 分會）

**預期：** 為路線上各重要危點之地形評估，依不過 48 小時之當前資料。

**失敗時：** 若當前狀況資料不可用（偏遠區、無近期報告），假狀況較該季均更壞。聯絡最近有人之山屋或山地救援站以求在地知。

### 步驟三：評步道狀態

查計畫路線之關閉、改道與維護問題。

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

查：
1. **完全關閉**：步道不可通或法律關閉（野生動物保護、施工）
2. **部分關閉**：節段關閉附官方改道
3. **季節關閉**：步道尚未開季（雪、山屋無人）
4. **損報告**：山崩、橋沖毀、步道侵蝕
5. **事件影響**：賽事、軍演、狩獵季

**預期：** 確認之步道狀態（開、部分關閉、關閉），附改道圖與時間影響估計。

**失敗時：** 若步道狀態不能確認，計畫潛在改道。攜詳圖（非僅步道 app 路線），使替代可即場導航。若步道列為關閉，雖看似可通仍尊關閉。

### 步驟四：評安全等級

合一切評估資料為整體安全等級。

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

對 YELLOW 等級，定特定緩解行動：
- 早起以勝午後天氣
- 若狀況惡化之轉返時
- 須密切監之特定段
- 團隊分散時之通訊計畫

**預期：** 清晰之 GREEN、YELLOW 或 RED 等級，附特定理由。YELLOW 等級含可行緩解步與定義之退觸發點。

**失敗時：** 若評估不確（資料不足以信評），至少視為 YELLOW。不確應增謹，非減。若任一單因子為 RED，整體等級為 RED，不論他因。

### 步驟五：生狀況報告

將評估彙為簡明、可行之報告。

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

**預期：** 完整、附日期之狀況報告，使知情之行否決策成為可能。報告應可與一切團隊成員分享，且無額外情境亦可解。

**失敗時：** 若報告不能完成（如關鍵資料不可用），陳何未知與其如何影響決策。承認缺之不全評估較虛假之確定感更安全。

## 驗證

- [ ] 天氣資料自至少 2 獨立源收
- [ ] 海拔特定預報已得（非僅谷地天氣）
- [ ] 路線上一切關鍵危點之地形狀況已評
- [ ] 步道狀態已驗（開／關／改道）
- [ ] 安全等級已賦附清晰理由
- [ ] YELLOW 等級之緩解已定
- [ ] 狀況報告完整且附日期
- [ ] 報告已與一切團隊成員分享
- [ ] 出發時評估不過 24 小時

## 常見陷阱

- **谷地天氣偏見**：谷地晴空於海拔處毫無意義。恆查峰級預報；高 1000 m 之狀況可大異
- **陳舊資料**：3 日前之報告不可靠。山地狀況速變。健行當朝重評
- **樂觀偏見**：欲行計畫路線致人合理化邊緣狀況。若須為行辯，狀況或不足
- **獨源依**：一預報可錯。對至少二源交叉查，並重在地／山地特定源勝通用
- **忽趨**：當前狀況或可受然漸惡。漸惡之趨需較快照所示更謹
- **社會壓力凌駕**：勿因團隊熱切或因駕長路而行。山下週仍在；君未必
- **雪線誤算**：報告之雪線為均。北向坡可保雪較報告線低 200-500 m

## 相關技能

- `plan-hiking-tour` — 用此評估為安全評估步之輸入
- `check-hiking-gear` — 依評估狀況之裝備調整（加微爪、額外層）
- `plan-tour-route` — 為更廣行程規劃之步道狀況覺
- `create-spatial-visualization` — 視覺化危區於圖層上
