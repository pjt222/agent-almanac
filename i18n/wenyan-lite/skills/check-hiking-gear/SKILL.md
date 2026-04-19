---
name: check-hiking-gear
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Generate and verify a hiking gear checklist optimized for season, duration,
  difficulty, and group size with weight management. Covers the ten essentials,
  layering systems, navigation tools, emergency kit, and group gear distribution.
  Use when preparing for a day hike or multi-day trekking tour, packing for a
  group and distributing shared gear, adapting a standard gear list to specific
  conditions, reviewing gear before departure, or managing pack weight for long
  or technical routes.
license: MIT
allowed-tools: Read Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: travel
  complexity: basic
  language: multi
  tags: travel, hiking, gear, checklist, weight, packing
---

# Check Hiking Gear

生並驗健行之裝備清單，合其季、時、難、人數之具體條件。

## 適用時機

- 備日健行或多日徒步之遊
- 為團體打包並分配共有裝備
- 以標準清單應具體之季或境
- 啟行前之裝備覆查以察所缺
- 為長徑或技術路線管包重

## 輸入

- **必要**：健行之時（日行、過夜、多日）
- **必要**：季與預期之溫區
- **必要**：徑之難（SAC T1-T6 或描述）
- **選擇性**：最高海拔與預期之狀（雪、雨、熱）
- **選擇性**：團體之人數（分配共有裝備用）
- **選擇性**：目標包重或重限
- **選擇性**：特殊之需（鐵索、冰川裝、攝影）

## 步驟

### 步驟一：評其境

定驅裝備之選之環境因。

```
Condition Assessment Matrix:
┌──────────────────┬────────────────────────────────────────────┐
│ Factor           │ Impact on Gear                             │
├──────────────────┼────────────────────────────────────────────┤
│ Temperature      │ 層次之深、睡袋之級                          │
│ Precipitation    │ 雨具之重、包套、雪套                        │
│ Snow/ice         │ 冰爪齒、冰爪、冰鎬、雪套                    │
│ Sun exposure     │ 防曬、帽、墨鏡、唇膏                        │
│ Altitude (>2500m)│ 額外暖層、防曬、水                          │
│ Duration         │ 食重、水容、庇護類型                        │
│ Remoteness       │ 急救之深、應急信標、備用                    │
│ Technical terrain│ 頭盔、吊帶、繩、鐵索組                      │
│ Water sources    │ 攜帶容量、淨化方法                          │
│ Hut availability │ 睡袋對睡袋內襯、餐對炊具                    │
└──────────────────┴────────────────────────────────────────────┘
```

將此行類入其一輪廓：

```
Hike Profiles:
  SUMMER-DAY:     Warm, short, well-marked, huts available
  SUMMER-MULTI:   Warm, multi-day, hut-to-hut or camping
  SHOULDER:       Spring/autumn, variable weather, possible snow
  WINTER:         Cold, snow cover, short daylight
  ALPINE:         High altitude, exposed, technical sections
  TROPICAL:       Hot, humid, rain, insects
```

**預期：** 明之行程輪廓，諸因皆已評。此輪廓驅步二之清單。

**失敗時：** 境不定時（如過渡季之不測），計最壞之況。攜雨衣不用勝於無之而濕。

### 步驟二：按類生基礎清單

以十要素為綱建裝備清單，加其他類。

```
THE TEN ESSENTIALS (always carry):
┌────┬──────────────────┬────────────────────────────────────────┐
│ #  │ Category         │ Items                                  │
├────┼──────────────────┼────────────────────────────────────────┤
│ 1  │ Navigation       │ Map (paper), compass, GPS/phone with   │
│    │                  │ offline maps, route description         │
├────┼──────────────────┼────────────────────────────────────────┤
│ 2  │ Sun protection   │ Sunscreen (SPF 50+), sunglasses        │
│    │                  │ (cat 3-4), lip balm with SPF, hat      │
├────┼──────────────────┼────────────────────────────────────────┤
│ 3  │ Insulation       │ Extra warm layer beyond what you       │
│    │                  │ expect to need (fleece or puffy)        │
├────┼──────────────────┼────────────────────────────────────────┤
│ 4  │ Illumination     │ Headlamp + spare batteries             │
├────┼──────────────────┼────────────────────────────────────────┤
│ 5  │ First aid        │ Blister kit, bandages, pain relief,    │
│    │                  │ personal medications, emergency blanket │
├────┼──────────────────┼────────────────────────────────────────┤
│ 6  │ Fire             │ Lighter + waterproof matches            │
│    │                  │ (emergency warmth/signaling)            │
├────┼──────────────────┼────────────────────────────────────────┤
│ 7  │ Repair/tools     │ Knife or multi-tool, duct tape,        │
│    │                  │ cord (3m paracord)                      │
├────┼──────────────────┼────────────────────────────────────────┤
│ 8  │ Nutrition        │ Extra food beyond planned meals         │
│    │                  │ (energy bars, nuts, dried fruit)        │
├────┼──────────────────┼────────────────────────────────────────┤
│ 9  │ Hydration        │ Water bottles/bladder (min 1.5L for    │
│    │                  │ day hike), purification if needed       │
├────┼──────────────────┼────────────────────────────────────────┤
│ 10 │ Shelter          │ Emergency bivvy or space blanket        │
│    │                  │ (day hike), tent/tarp (multi-day)      │
└────┴──────────────────┴────────────────────────────────────────┘

CLOTHING (layer system):
┌──────────────────┬────────────────────────────────────────────┐
│ Layer            │ Items                                      │
├──────────────────┼────────────────────────────────────────────┤
│ Base layer       │ Merino or synthetic shirt & underwear      │
│ Mid layer        │ Fleece jacket or lightweight puffy         │
│ Shell layer      │ Waterproof/breathable jacket               │
│ Legs             │ Hiking pants (zip-off for versatility)     │
│ Feet             │ Hiking boots/shoes, wool socks, liners     │
│ Hands            │ Lightweight gloves (even in summer above   │
│                  │ 2000 m)                                    │
│ Head             │ Sun hat + warm hat/buff                    │
└──────────────────┴────────────────────────────────────────────┘

ADDITIONAL BY PROFILE:
┌──────────────────┬────────────────────────────────────────────┐
│ Profile add-on   │ Additional items                           │
├──────────────────┼────────────────────────────────────────────┤
│ Multi-day        │ Sleeping bag/liner, toiletries, change of  │
│                  │ clothes, cooking system, extra food        │
├──────────────────┼────────────────────────────────────────────┤
│ Snow/ice         │ Microspikes or crampons, gaiters, ice axe │
│                  │ (if applicable), extra insulation          │
├──────────────────┼────────────────────────────────────────────┤
│ Alpine/technical │ Helmet, harness, via ferrata set, rope,    │
│                  │ carabiners, slings                         │
├──────────────────┼────────────────────────────────────────────┤
│ Remote           │ Emergency beacon (PLB/InReach), extensive  │
│                  │ first aid, water purification, extra food  │
├──────────────────┼────────────────────────────────────────────┤
│ Winter           │ Insulated jacket, ski poles, snowshoes,    │
│                  │ thermos, goggles, balaclava                │
└──────────────────┴────────────────────────────────────────────┘
```

**預期：** 完整之清單，含十要素、合宜之衣層、輪廓專之增項。每物皆合所評之境。

**失敗時：** 清單似為短易行過多，驗 SUMMER-DAY 輪廓惟含十基礎要素。清單似為高山境過輕，交參 Alpine 輪廓之增項。

### 步驟三：優化重量

覆查清單以減包重而不損安全。

```
Weight Optimization Strategies:
┌──────────────────────┬────────────────────────────────────────┐
│ Strategy             │ Example                                │
├──────────────────────┼────────────────────────────────────────┤
│ Eliminate            │ Remove items not needed for conditions  │
│ Substitute           │ Trail runners instead of heavy boots   │
│                      │ (if terrain allows)                    │
│ Downsize             │ Smaller first aid kit for day hikes    │
│ Multi-use items      │ Buff = sun protection + warm hat +     │
│                      │ dust mask                              │
│ Share in group       │ One first aid kit per 3-4 people,      │
│                      │ one repair kit per group                │
│ Repackage            │ Decant sunscreen into small bottle,    │
│                      │ remove excess packaging                │
│ Lighter materials    │ Titanium cookware, cuben fiber shelter │
└──────────────────────┴────────────────────────────────────────┘

Weight Targets (pack weight without food/water):
  Day hike:       3-5 kg base weight
  Hut-to-hut:     5-8 kg base weight
  Camping:        8-12 kg base weight
  Winter/alpine:  10-15 kg base weight
```

團體健行，分共有裝備：

```
Shared Gear Distribution:
  First aid kit (group)  → strongest hiker or designated person
  Repair kit             → most experienced with repairs
  Cooking system         → split stove/fuel/pot across members
  Shelter (if shared)    → split tent body/fly/poles
  Emergency gear         → distribute PLB, rope among members
```

**預期：** 重量優化之清單，每物皆有明用。總包重於輪廓目標內。共有裝備分配於具體人員。

**失敗時：** 若包重超目標兩成以上，重考輪廓是否合宜。長日重載顯增疲與傷之險。或減裝備（承險）或擇易之短徑。

### 步驟四：以境驗全

以所評境終查裝備清單。

```
Verification Checklist:
┌────────────────────────────────────────┬──────────┬──────────┐
│ Check                                  │ Pass     │ Notes    │
├────────────────────────────────────────┼──────────┼──────────┤
│ All ten essentials present             │ [ ]      │          │
│ Clothing layers match temperature range│ [ ]      │          │
│ Rain gear if >20% precipitation chance │ [ ]      │          │
│ Snow gear if above/near snow line      │ [ ]      │          │
│ Water capacity sufficient between      │ [ ]      │          │
│ resupply points                        │          │          │
│ Food sufficient for duration + reserve │ [ ]      │          │
│ Navigation tools loaded with route     │ [ ]      │          │
│ Phone charged + portable charger       │ [ ]      │          │
│ First aid includes personal meds       │ [ ]      │          │
│ Emergency contact info carried         │ [ ]      │          │
│ Boots/shoes broken in (no new gear)    │ [ ]      │          │
│ Pack fits comfortably at loaded weight │ [ ]      │          │
└────────────────────────────────────────┴──────────┴──────────┘
```

**預期：** 諸查皆過。行者可信陳包中每物為何用，若缺則必察。

**失敗時：** 任一要查敗，啟行前先解。最危之敗為：無導航備援（電話盡電）、水容不足、缺絕緣層（樹線上夏亦有低溫之險）。

## 驗證

- [ ] 十要素皆含於清單
- [ ] 衣系合預期之溫區
- [ ] 輪廓專之增項已含（雪裝、高山裝等）
- [ ] 包重於行程輪廓之目標內
- [ ] 共有裝備分配於具體人員（團體行）
- [ ] 水容覆補給點間最長之隙
- [ ] 急救含個人藥
- [ ] 無新／未試之裝備（靴已磨合、爐已測）

## 常見陷阱

- **棉致死**：棉衣留濕而失絕緣。諸層皆用羊毛或合成纖維。
- **新靴首日**：未試之鞋生水泡。新靴先以三至四次短行磨合。
- **一水源之假設**：若所計之唯一水源乾（季流），脫水速至。恆備最壞之容。
- **「或須」之過裝**：每無用之克數時間累積。若不能說此具體行何時用之，留之。
- **忽防曬**：海拔中 UV 每千米約增一成。樹線上二千米，曬傷與雪盲為真險，涼天亦然。
- **忽團裝之重複**：四行者各攜全急救盒耗重。打包前協共有之物。

## 相關技能

- `plan-hiking-tour` — 定所需裝備之健行計畫
- `assess-trail-conditions` — 當前境影裝備需求（如非預期之雪）
- `make-fire` — 應急生火乃十要素之一
- `purify-water` — 自然源為唯一時之水淨化法
