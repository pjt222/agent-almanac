---
name: purify-water
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  以煮、濾、化法淨野水。含源察與優序、沉預濾、法擇（煮、化、UV、濾）、
  海拔調煮程、化處量、安存修。野中需飲水、可用源不知質、急生險於脫水、
  或為烹或洗創使水安時用之。
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

以野可得之法淨野水使其安飲。

## 用時

- 野中需飲水而無治水
- 可用水源質不知（溪、河、湖、塘）
- 急生情險於脫水
- 需使水安為烹或洗創

## 入

- **必要**：水源（流或靜）
- **必要**：容器（金屬鍋、瓶、或臨機之器）
- **可選**：淨用品（化丸、濾、UV 筆）
- **可選**：煮用之火能（見 `make-fire`)
- **可選**：布或自然濾料為預濾

## 法

### 第一步：察並擇水源

非諸源同險。擇可得之最佳源。

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

收水自表下（避表膜）並離岸邊。

得：清或微濁水自可得最佳源，採於清容。

敗則：若唯劣源可得（靜、濁），進而謀激預濾（第二步）並用多淨法（帶與吊褲）。若無水源覓，尋徵：谷之綠、向下之獸跡、晨昏蟲群、聽流水。

### 第二步：預濾沉

淨前去顆粒。沉減化處效並塞濾。

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

簡沉去者，過頭巾、衫、多層布。

得：可見較清水、濁減。炭層去某氣味。

敗則：若濾後水仍甚濁，置容沉 30-60 分。仔細傾較清之頂層。重沉或濾。注：預濾**不**使水安飲——備之為淨。

### 第三步：擇淨法

依可用具與情擇。

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

得：依可用具明決用何淨法。

敗則：若無標淨具，煮為默——唯需火與耐熱容。即單壁金屬水瓶亦可煮。極急時，容可自岩凹或近火之青竹節臨時備之。

### 第四步：煮水

野最穩之淨法。殺諸病原類。

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

得：水達翻滾沸騰並維於宜久。冷後，水免於生物病原。

敗則：若不能維翻滾沸（風、弱火），延煮時。若容漏或裂，移至他器。若無金屬容，可於木、皮、皮容用熱石煮：石於火加熱 20+ 分，後以鉗或棍移入水容。避河石（或裂或自封濕爆）。

### 第五步：施化處

煮不便時或為次處用之。

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

得：候期後處之水有微化氣味，示足消毒。水免於菌與病毒；二氧化氯亦對寄生蟲有效。

敗則：若丸過期（處後無味），用倍量或合他法。若味劣，水露 30 分散氣，或過臨炭濾以進味。若化處為汝唯一法且疑 Cryptosporidium（畜近常見），二氧化氯候足 4 時或合濾。

### 第六步：安存

淨水可由污容或手再污。

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

得：淨水留安於清封容。系在以避生與處之水間之交叉污。

敗則：若容有限，指一為「生」（唯收）、他為「清」（唯淨）。劃或殊標之。若疑再污，飲前重處水。

## 驗

- [ ] 水源已察並擇可得最佳
- [ ] 淨前濁水已預濾沉
- [ ] 淨法宜可用具與情
- [ ] 煮達並維翻滾沸於海拔調之久
- [ ] 化處用正量與候時
- [ ] 淨水存於清封標容
- [ ] 足淨水以滿日水需

## 陷

- **略預濾**：沉減化效並塞濾。常預濾濁水
- **不全煮**：底之數泡非翻滾沸。待激破表之泡
- **忽海拔**：水於高處於低溫沸。煮時依增之
- **化量不足**：冷或濁水需多化或長觸時
- **交叉污**：生與淨水用同容、或污手觸飲口
- **最劣源唯一法**：靜或畜近水者，用二法（如濾 + 化、或煮 + 化）

## 參

- `make-fire` — 煮法所需；火亦於候化處時供暖
- `forage-plants` — 某植示近水源（柳、香蒲、楊）；採食或需清水備
