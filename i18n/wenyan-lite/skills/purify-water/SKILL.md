---
name: purify-water
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Purify water from wild sources using boiling, filtration, and chemical
  methods. Covers source assessment and priority ranking, sediment pre-filtering,
  method selection (boiling, chemical, UV, filter), altitude-adjusted boiling
  procedure, chemical treatment dosages, and safe storage practices. Use when
  needing drinking water in a wilderness setting, when available water sources
  are of unknown quality, in an emergency survival situation where dehydration
  is a risk, or when making water safe for cooking or wound cleaning.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: bushcraft
  complexity: intermediate
  language: natural
  tags: bushcraft, water, purification, survival, wilderness, filtration
---

# 淨水

以野外可得之法（煮沸、過濾、化學）淨化野水使可飲。

## 適用時機

- 於荒野中無潔水可得，須取飲水
- 可得之水源品質不明（溪、河、湖、池）
- 緊急求生情境，有脫水之虞
- 須使水適於烹飪或清創

## 輸入

- **必要**：水源（流動或靜止）
- **必要**：容器（金屬鍋、瓶或就地之器）
- **選擇性**：淨水用品（化學錠、濾器、UV 筆）
- **選擇性**：可生火以供煮沸（見 `make-fire`）
- **選擇性**：作預濾之布或天然材料

## 步驟

### 步驟一：評估並擇水源

非所有水源風險均等。擇可得之最佳者。

```
Water Source Priority Ranking (best to worst):
┌──────┬─────────────────────────┬────────────────────────────────────┐
│ Rank │ Source                  │ Notes                              │
├──────┼─────────────────────────┼────────────────────────────────────┤
│ 1    │ Spring (at the source)  │ Lowest contamination; still treat  │
│ 2    │ Fast-flowing stream     │ Moving water has fewer pathogens   │
│      │ (above human activity)  │ than still water                   │
│ 3    │ Large river             │ Dilution helps but agriculture/    │
│      │                         │ industry upstream is a concern     │
│ 4    │ Large lake              │ Collect from open water, not shore │
│ 5    │ Small pond or puddle    │ High pathogen and parasite risk    │
│ 6    │ Stagnant pool           │ Last resort; heavy treatment needed│
└──────┴─────────────────────────┴────────────────────────────────────┘

Warning Signs (avoid if possible):
- Dead animals nearby
- Algae bloom (blue-green scum)
- Chemical odor or oily sheen
- Downstream of mining, agriculture, or settlements
- No surrounding vegetation (may indicate toxic soil)
```

自水面下取水（避表膜），離岸邊一段距離。

**預期：** 自最佳可得之源所取之清或微濁水，置於潔淨容器。

**失敗時：** 若僅有差源（停滯、混濁），仍進行但須積極預濾（步驟二）並用多法（兩道保險）。若無水源，找跡象：山谷之青植物、向下之獸徑、晨昏之蟲群、聽流水聲。

### 步驟二：預濾沉積

於淨水前去除微粒。沉積會削弱化學處理之效並阻塞濾器。

```
Improvised Gravity Filter (layered in a container with a hole at the bottom):

    ┌─────────────────────┐  ← Open top: pour water in
    │  Grass / cloth      │  ← Coarse pre-filter
    │  Fine sand          │  ← Removes fine particles
    │  Charcoal (crushed) │  ← Adsorbs some chemicals and odors
    │  Gravel             │  ← Structural support
    │  Grass / cloth      │  ← Prevents gravel from falling through
    └────────┬────────────┘
             │
        Filtered water drips out

Materials:
- Container: birch bark cone, hollow log, cut plastic bottle, sock
- Sand: fine, clean sand (rinse first if possible)
- Charcoal: from a previous fire (NOTite ash — charcoal only)
- Gravel: small stones, rinsed
```

簡單去沉積，可以頭巾、T 恤或多層布過濾。

**預期：** 可見之較清水，濁度降低。木炭層去除部分氣味與味。

**失敗時：** 若濾後仍甚濁，於容器中靜置 30-60 分鐘。小心倒出較清之上層。重複靜置或濾。注意：預濾**不**使水可飲——僅備供淨化。

### 步驟三：擇淨水法

依可用工具與條件擇之。

```
Purification Method Comparison:
┌───────────────┬────────────┬───────────┬────────────┬──────────────────────┐
│ Method        │ Kills      │ Time      │ Requires   │ Limitations          │
│               │ bacteria/  │           │            │                      │
│               │ viruses/   │           │            │                      │
│               │ parasites  │           │            │                      │
├───────────────┼────────────┼───────────┼────────────┼──────────────────────┤
│ Boiling       │ Yes/Yes/Yes│ 1-3 min   │ Fire, metal│ Fuel, time, does not │
│               │            │ (rolling) │ container  │ remove chemicals     │
├───────────────┼────────────┼───────────┼────────────┼──────────────────────┤
│ Chlorine      │ Yes/Yes/   │ 30 min    │ Tablets or │ Less effective in    │
│ dioxide tabs  │ Yes        │           │ drops      │ cold/turbid water    │
├───────────────┼────────────┼───────────┼────────────┼──────────────────────┤
│ Iodine        │ Yes/Yes/   │ 30 min    │ Tablets or │ Taste; not for       │
│               │ Partial    │           │ tincture   │ pregnant/thyroid     │
│               │            │           │            │ conditions; weak     │
│               │            │           │            │ against Crypto       │
├───────────────┼────────────┼───────────┼────────────┼──────────────────────┤
│ UV pen        │ Yes/Yes/Yes│ 60-90 sec │ UV device, │ Requires clear water;│
│               │            │ per liter │ batteries  │ battery dependent    │
├───────────────┼────────────┼───────────┼────────────┼──────────────────────┤
│ Pump/squeeze  │ Yes/No*/   │ Immediate │ Filter     │ Most don't remove    │
│ filter        │ Yes        │           │ device     │ viruses (*unless     │
│               │            │           │            │ 0.02 micron)         │
├───────────────┼────────────┼───────────┼────────────┼──────────────────────┤
│ SODIS (solar) │ Yes/Yes/   │ 6-48 hrs  │ Clear PET  │ Slow; needs sun;     │
│               │ Partial    │           │ bottle,    │ only 1-2 L at a time │
│               │            │           │ sunlight   │                      │
└───────────────┴────────────┴───────────┴────────────┴──────────────────────┘

Decision logic:
- Have fire + metal pot?          → Boil (most reliable)
- Have chemical tablets?          → Chemical treatment
- Have filter + tablet combo?     → Filter then treat (belt-and-suspenders)
- Sunny day + clear PET bottles?  → SODIS as a backup method
- Multiple methods available?     → Use two for maximum safety
```

**預期：** 已依可用工具明確擇定淨化法。

**失敗時：** 若無標準工具，煮沸為預設——僅需火與耐熱容器。即便單壁金屬瓶亦可用以煮沸。極端情境下可以石窩或近火之青竹節為臨時容器。

### 步驟四：煮沸

最可靠之野外淨水法。殺所有病原類。

```
Boiling Procedure:
1. Bring water to a ROLLING boil (large bubbles breaking the surface)
2. Maintain rolling boil for:
   - Sea level to 2000 m / 6500 ft:  1 minute
   - 2000-4000 m / 6500-13000 ft:    3 minutes
   - Above 4000 m / 13000 ft:        5 minutes
3. Remove from heat
4. Allow to cool in the covered container
5. If taste is flat, pour between two containers several times to aerate

Altitude Adjustment:
  Water boils at lower temperatures at altitude.
  At 3000 m / 10000 ft, water boils at ~90°C / 194°F.
  Longer boiling compensates for the lower temperature.

Fuel Estimate:
  Boiling 1 L requires roughly 15-20 min of sustained fire
  depending on container, wind, and starting temperature.
```

**預期：** 水達猛烈翻滾並維持適當時長。冷卻後對生物病原已安全。

**失敗時：** 若無法維持翻滾（風、火弱），延長時間。容器漏或裂則改換。若無金屬器，可以木、樹皮或皮容器加熱石煮水：將石於火中加熱 20+ 分鐘，再以鉗或棒移至水中。避用河石（內部水分可能爆裂）。

### 步驟五：施化學處理

煮沸不便時用之，或作為次層處理。

```
Chemical Treatment Dosages:
┌─────────────────────┬──────────────────┬────────────┬─────────────────────┐
│ Chemical            │ Dose per liter   │ Wait time  │ Notes               │
├─────────────────────┼──────────────────┼────────────┼─────────────────────┤
│ Chlorine dioxide    │ Per manufacturer │ 30 min     │ Most effective      │
│ tablets             │ (usually 1 tab   │ (4 hrs for │ chemical method;    │
│ (e.g., Aquamira,   │ per 1 L)         │ Crypto)    │ kills all pathogens │
│ Katadyn Micropur)   │                  │            │                     │
├─────────────────────┼──────────────────┼────────────┼─────────────────────┤
│ Iodine tablets      │ 1-2 tablets per  │ 30 min     │ Weak against        │
│                     │ liter            │            │ Cryptosporidium     │
├─────────────────────┼──────────────────┼────────────┼─────────────────────┤
│ Tincture of iodine  │ 5 drops per      │ 30 min     │ Double dose for     │
│ (2%)                │ liter (clear)    │ (60 min if │ cloudy water        │
│                     │ 10 drops per     │ cold/turbid│                     │
│                     │ liter (cloudy)   │ )          │                     │
├─────────────────────┼──────────────────┼────────────┼─────────────────────┤
│ Household bleach    │ 2 drops per      │ 30 min     │ Must be unscented,  │
│ (5-8% sodium        │ liter (clear)    │            │ plain bleach;       │
│ hypochlorite)       │ 4 drops per      │            │ check expiry date   │
│                     │ liter (cloudy)   │            │                     │
└─────────────────────┴──────────────────┴────────────┴─────────────────────┘

After treatment, water should have a slight chlorine/iodine smell.
If no smell is detected, add half the original dose and wait another 15 min.

Cold/turbid water adjustment:
- Temperature below 5°C / 40°F: double the wait time
- Turbid water: double the dose OR pre-filter first (recommended)
```

**預期：** 等候期後水有淡淡化學味，表示已適當消毒。對細菌與病毒已安全；二氧化氯亦對寄生蟲有效。

**失敗時：** 若錠已過期（處理後無味），加倍量或併他法。若味難飲，靜置不蓋 30 分鐘以散氣，或經臨時木炭濾以改味。若僅化學一法可用，且疑有 Cryptosporidium（畜牧附近常見），二氧化氯等候足 4 小時或併以濾。

### 步驟六：安全儲存

淨水可因器或手污染而再受污。

```
Safe Storage Practices:
1. Store in clean, dedicated containers (do not reuse unpurified containers)
2. If reusing a container, rinse it with a small amount of purified water first
3. Keep containers sealed or covered
4. Mark or separate "raw" and "purified" containers
   (e.g., tie a knot in the purified bottle's paracord handle)
5. Avoid reaching into containers with hands — pour, don't dip
6. In warm weather, consume within 24 hours
7. Re-treat water that has been stored more than 24 hours

Hydration Planning:
- Minimum: 2 L / 0.5 gal per day (sedentary, cool weather)
- Active: 4-6 L / 1-1.5 gal per day (hiking, hot weather)
- Plan purification capacity to meet daily needs
```

**預期：** 淨水於潔淨密封之容器中保持安全。已立分區避免生水與處理水互染。

**失敗時：** 若容器有限，指定一為「生」（僅取水）、一為「淨」（僅淨水）。以刮痕或標記區別。若疑再受污，飲前重新處理。

## 驗證

- [ ] 已評估水源並擇可得之最佳者
- [ ] 混濁水於淨化前已預濾沉積
- [ ] 淨化法適合可用工具與條件
- [ ] 煮沸已達翻滾並維持高度調整後之時長
- [ ] 化學處理之劑量與等候時間正確
- [ ] 淨水已置於潔淨、密封、標示之容器
- [ ] 已淨化足夠之水以滿日需

## 常見陷阱

- **跳過預濾**：沉積削化學效並阻濾器。混濁水永須預濾
- **煮沸不全**：底部數泡非翻滾。待表面爆破之猛泡
- **忽略海拔**：高海拔水沸點較低。增煮沸時間
- **化學欠量**：冷或濁水須更多化學物或更長接觸時間
- **交叉污染**：以同器盛生水與淨水，或以髒手觸飲口
- **單法應對最差源**：對停滯或畜牧附近之水，用兩法（如濾 + 化學，或煮 + 化學）

## 相關技能

- `make-fire` —— 煮沸所需；火亦能於候化學處理時供暖
- `forage-plants` —— 部分植物指示附近水源（柳、香蒲、楊）；採食常需潔水備食
