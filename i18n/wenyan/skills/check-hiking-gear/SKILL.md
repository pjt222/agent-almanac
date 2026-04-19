---
name: check-hiking-gear
locale: wenyan
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

# 察徒步之備

生而驗徒步之清單，按季、時長、難、眾數、重而優之。

## 用時

- 備一日徒步或多日之旅
- 為眾備而分共具
- 調標清單以合特季或況
- 發前察備，以免漏
- 為長或技徑管背重

## 入

- **必要**：時長（日、宿、多日）
- **必要**：季與預期溫段
- **必要**：徑難（SAC T1-T6 或述）
- **可選**：最高海拔與預況（雪、雨、熱）
- **可選**：眾數（為分共具）
- **可選**：目標背重或重限
- **可選**：特須（via ferrata、冰川裝、攝影）

## 法

### 第一步：察況

定驅備擇之境因。

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

類徒步於下之一貌：

```
Hike Profiles:
  SUMMER-DAY:     Warm, short, well-marked, huts available
  SUMMER-MULTI:   Warm, multi-day, hut-to-hut or camping
  SHOULDER:       Spring/autumn, variable weather, possible snow
  WINTER:         Cold, snow cover, short daylight
  ALPINE:         High altitude, exposed, technical sections
  TROPICAL:       Hot, humid, rain, insects
```

**得：** 清貌與諸況因已察。此貌驅第二步之清單。

**敗則：** 若況不定（如肩季變天），計最劣。持未用之雨衣勝於無衣而濕。

### 第二步：按類生基清單

依十要之框與附類建備清單。

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

**得：** 全清單含諸十要、合衣層、貌特之增。各品合所察況。

**敗則：** 若短易徒步清單過長，驗 SUMMER-DAY 貌只含基十要。若高山況清單過薄，交察 Alpine 貌之增。

### 第三步：優重

察清單以減背重而不損安。

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

眾徒步者，分共具：

```
Shared Gear Distribution:
  First aid kit (group)  → strongest hiker or designated person
  Repair kit             → most experienced with repairs
  Cooking system         → split stove/fuel/pot across members
  Shelter (if shared)    → split tent body/fly/poles
  Emergency gear         → distribute PLB, rope among members
```

**得：** 重優之清單，各品有明旨。總背重於貌之目範。共具已分於特員。

**敗則：** 若背重逾目兩成以上，重考貌是否合。久日重背大增疲與傷險。或減備（受險）或擇易/短徑。

### 第四步：驗全合況

清單於所察況之末交察。

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

**得：** 諸察皆過。徒步者可明述包中各品之旨，若缺則即覺。

**敗則：** 任要察敗者，發前解之。最危敗：無航備（機失電）、水容不足、缺保暖層（夏之林線上亦有低溫險）。

## 驗

- [ ] 清單含諸十要
- [ ] 衣系合預溫段
- [ ] 貌特之增已含（雪、高山等）
- [ ] 背重於貌之目範
- [ ] 共具已分於特員（眾徒步）
- [ ] 水容涵最長補間
- [ ] 急救含個人藥
- [ ] 無新未試之備（靴已磨合、爐已試）

## 陷

- **棉害**：棉衣濕而失保溫。諸層宜用美利奴或合成纖
- **徒步日新靴**：未試之鞋致泡。新靴至少三四短行磨合後長行
- **假一水源**：若唯計之源乾（季流），脫水速至。恆備最劣況之容
- **「以防」而過裝**：每無用之克於時累。若不能名此徒步何時用之，留家
- **忘防曬**：高處 UV 每千米升一成。2000 米上曬傷與雪盲為實危，即涼亦然
- **忽共具之疊**：四徒步者各攜全急救包費重。裝前協共品

## 參

- `plan-hiking-tour` — 徒步計定所須備
- `assess-trail-conditions` — 當況影備（如意外之雪）
- `make-fire` — 急火啟為十要之一
- `purify-water` — 自然源為唯選時之水淨法
