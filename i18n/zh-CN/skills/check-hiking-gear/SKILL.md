---
name: check-hiking-gear
description: >
  生成并验证针对季节、持续时间、难度和团队规模优化的徒步装备清单，包含重量管理。
  涵盖十大必需品、分层穿衣系统、导航工具、急救包和团队装备分配。适用于准备
  一日徒步或多日穿越、为团队打包和分配共享装备、将标准装备清单适配特定条件、
  出发前检查装备，或为长距离或技术路线管理背包重量。
license: MIT
allowed-tools: Read Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: travel
  complexity: basic
  language: multi
  tags: travel, hiking, gear, checklist, weight, packing
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# 检查徒步装备

生成并验证针对计划徒步的特定条件优化的徒步装备清单。

## 适用场景

- 准备一日徒步或多日穿越
- 为团队打包和分配共享装备
- 将标准装备清单适配特定季节或条件
- 出发前检查装备以发现遗漏物品
- 为长距离或技术路线管理背包重量

## 输入

- **必需**：徒步持续时间（一日徒步、过夜、多日）
- **必需**：季节和预期温度范围
- **必需**：步道难度（SAC T1-T6 或描述性等级）
- **可选**：最高海拔和预期条件（雪、雨、高温）
- **可选**：团队规模（用于分配共享装备）
- **可选**：目标背包重量或重量限制
- **可选**：特殊需求（铁索攀岩装备、冰川装备、摄影器材）

## 步骤

### 第 1 步：评估条件

确定驱动装备选择的环境因素。

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

将徒步归类为以下档案之一：

```
Hike Profiles:
  SUMMER-DAY:     Warm, short, well-marked, huts available
  SUMMER-MULTI:   Warm, multi-day, hut-to-hut or camping
  SHOULDER:       Spring/autumn, variable weather, possible snow
  WINTER:         Cold, snow cover, short daylight
  ALPINE:         High altitude, exposed, technical sections
  TROPICAL:       Hot, humid, rain, insects
```

**预期结果：** 清晰的徒步档案，所有条件因素已评估。此档案驱动第 2 步的清单。

**失败处理：** 如果条件不确定（例如换季时天气不可预测），按最坏情况准备。携带一件不用的雨衣总比没有雨衣被淋湿好。

### 第 2 步：按类别生成基础清单

基于十大必需品框架加额外类别构建装备清单。

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

**预期结果：** 完整的清单，包含所有十大必需品、适当的服装层次和档案特定的附加项。每个物品都与评估的条件相关。

**失败处理：** 如果清单对简短轻松的徒步看起来过多，验证 SUMMER-DAY 档案是否只包含基础十大必需品。如果清单对高山条件看起来太轻，与高山档案附加项交叉参考。

### 第 3 步：优化重量

审查清单以在不影响安全的前提下减轻背包重量。

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

对于团队徒步，分配共享装备：

```
Shared Gear Distribution:
  First aid kit (group)  → strongest hiker or designated person
  Repair kit             → most experienced with repairs
  Cooking system         → split stove/fuel/pot across members
  Shelter (if shared)    → split tent body/fly/poles
  Emergency gear         → distribute PLB, rope among members
```

**预期结果：** 重量优化的清单，每个物品都有明确用途。总背包重量在徒步档案的目标范围内。共享装备分配给特定团队成员。

**失败处理：** 如果背包重量超过目标 20% 以上，重新考虑徒步档案是否合适。长时间负重过重的背包会大幅增加疲劳和受伤风险。要么减少装备（接受更多风险），要么选择更轻松/更短的路线。

### 第 4 步：对照条件验证完整性

对装备清单与评估条件进行最终交叉检查。

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

**预期结果：** 所有检查通过。徒步者能自信地说出背包中每个物品的用途，并会注意到任何物品的缺失。

**失败处理：** 如果任何必需检查未通过，在出发前解决它。最危险的失败是：没有导航备份（手机没电）、水容量不足，以及缺少保暖层（即使在夏季树线以上也有失温风险）。

## 验证清单

- [ ] 清单中包含所有十大必需品
- [ ] 服装系统匹配预期温度范围
- [ ] 包含档案特定的附加项（雪具、高山装备等）
- [ ] 背包重量在徒步档案的目标范围内
- [ ] 共享装备分配给特定团队成员（团队徒步）
- [ ] 水容量覆盖补给点之间的最长间隔
- [ ] 急救包包含个人药物
- [ ] 徒步中没有新的/未测试的装备（穿过的靴子、测试过的炉具）

## 常见问题

- **棉杀人**：棉织物保留水分，在湿润时失去保暖性能。所有层次使用美利奴羊毛或合成面料
- **徒步日穿新靴**：未测试的鞋类会导致水泡。在长距离徒步前至少用 3-4 次短途行走磨合新靴
- **假设单一水源**：如果唯一计划的水源干涸（季节性溪流），脱水会很快到来。始终按最坏情况携带容量
- **"以防万一"式过度打包**：每一克不必要的重量都会在数小时内累积。如果你无法说出在这次特定徒步中何时会使用某物品，就把它留下
- **忘记防晒**：在高海拔，紫外线暴露大约每 1000 米增加 10%。即使在凉爽天气中，2000 米以上晒伤和雪盲也是真实的危害
- **忽视团队装备重叠**：四个徒步者每人携带完整急救包浪费重量。打包前协调共享物品

## 相关技能

- `plan-hiking-tour` — 确定需要什么装备的徒步计划
- `assess-trail-conditions` — 当前条件影响装备需求（如意外降雪）
- `make-fire` — 紧急生火是十大必需品之一
- `purify-water` — 当天然水源是唯一选择时的净水方法
