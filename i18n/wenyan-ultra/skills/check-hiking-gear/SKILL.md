---
name: check-hiking-gear
locale: wenyan-ultra
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

# 察徒裝

生與驗徒裝單，優於計徒之具條件。

## 用

- 備日徒或多日穿越
- 群徒打包且分共裝
- 適標裝單於專季與條件
- 發前審裝以捕缺
- 管長或技路之包重

## 入

- **必**：徒時（日、過夜、多日）
- **必**：季與望溫範
- **必**：徑難（SAC T1-T6 或述）
- **可**：最高海拔與望況（雪、雨、熱）
- **可**：群大（分共裝）
- **可**：標包重或重限
- **可**：特需（via ferrata 裝、冰川具、攝）

## 行

### 一：評條件

定驅裝擇之境因。

```
Condition Assessment Matrix:
┌──────────────────┬────────────────────────────────────────────┐
│ Factor           │ Impact on Gear                             │
├──────────────────┼────────────────────────────────────────────┤
│ Temperature      │ Layering depth, sleeping bag rating        │
│ Precipitation    │ Rain gear weight, pack cover, gaiters      │
│ Snow/ice         │ Microspikes, crampons, ice axe, gaiters    │
│ Sun exposure     │ Sunscreen, hat, sunglasses, lip balm       │
│ Altitude (>2500m)│ Extra warm layer, sun protection, hydration│
│ Duration         │ Food weight, water capacity, shelter type  │
│ Remoteness       │ First aid depth, emergency beacon, backup  │
│ Technical terrain│ Helmet, harness, rope, via ferrata set     │
│ Water sources    │ Carry capacity, purification method        │
│ Hut availability │ Sleeping bag vs. sheet, meal vs. cook gear │
└──────────────────┴────────────────────────────────────────────┘
```

分徒為一形：

```
Hike Profiles:
  SUMMER-DAY:     Warm, short, well-marked, huts available
  SUMMER-MULTI:   Warm, multi-day, hut-to-hut or camping
  SHOULDER:       Spring/autumn, variable weather, possible snow
  WINTER:         Cold, snow cover, short daylight
  ALPINE:         High altitude, exposed, technical sections
  TROPICAL:       Hot, humid, rain, insects
```

**得：** 清徒形附諸因評。此形驅步二之單。

**敗：** 條件疑（如肩季不測）→備最壞。攜不用之雨衣勝無而濕。

### 二：依類生基單

以十要框加他類組裝單。

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

**得：** 全單附十要、宜層衣、形專加。每物合所評條件。

**敗：** 單似過於短易徒→驗 SUMMER-DAY 形唯含基十要。單似輕於 alpine 條件→察 alpine 形加。

### 三：優重

察單以減包重而不減安。

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

群徒→分共裝：

```
Shared Gear Distribution:
  First aid kit (group)  → strongest hiker or designated person
  Repair kit             → most experienced with repairs
  Cooking system         → split stove/fuel/pot across members
  Shelter (if shared)    → split tent body/fly/poles
  Emergency gear         → distribute PLB, rope among members
```

**得：** 優重單—每物有清旨。包重於形標範。共裝已賦具群員。

**敗：** 包重過標 20% 以上→重思徒形宜否。久日重包急增疲與傷險。或減裝（受更險）或擇易/短路。

### 四：驗全於條件

裝單與所評條件之末較。

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

**得：** 諸察皆通。徒者能信述每包中物之用，且若任物缺則察之。

**敗：** 任要察敗→發前解。最危敗為：無導備（機斷）、水量不足、缺保層（樹線以上夏亦可低溫）。

## 驗

- [ ] 十要皆於單
- [ ] 衣系合望溫範
- [ ] 形專加（雪裝、alpine 裝等）皆含
- [ ] 包重於形標範
- [ ] 共裝已賦具群員（群徒）
- [ ] 水量涵最長供間
- [ ] 急箱含個藥
- [ ] 徒上無新未試裝（破靴、試爐）

## 忌

- **棉殺**：棉衣留濕且濕後失保。諸層用美麗諾或合成。
- **新靴當日**：未試履致泡。長徒前至少三四短行破新靴。
- **一源假**：唯計水源乾（季流）→脫水速來。必備最壞容。
- **「備無患」過包**：每餘克經時積。若不能名具用→留。
- **忘防曬**：高海拔→UV 每千米約增一成。陽傷與雪盲為 2000m 以上之實險，雖涼亦然。
- **略群裝疊**：四徒皆攜全急箱費重。打包前協共物。

## 參

- `plan-hiking-tour` — 定需裝之徒計
- `assess-trail-conditions` — 當條件影裝需（如未期雪）
- `make-fire` — 急生火為十要一
- `purify-water` — 唯有自然源時之水淨法
