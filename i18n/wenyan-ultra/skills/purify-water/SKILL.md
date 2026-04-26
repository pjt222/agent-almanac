---
name: purify-water
locale: wenyan-ultra
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

野水以場法淨為飲也。

## 用

- 野中無治水而需飲→用
- 水源質未知（溪、河、湖、塘）→用
- 急生況、脫水險→用
- 為炊或洗瘡備安水→用

## 入

- **必**：水源（流或靜）
- **必**：器（金鍋、瓶或代器）
- **可**：淨備（化片、濾、UV 筆）
- **可**：為沸之火能（見 `make-fire`）
- **可**：前濾之布或自然濾材

## 行

### 一：察並擇水源

諸源險異。擇現之佳。

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

於面下取（避面膜）、離岸邊。

得：清或微濁水自佳源、入淨器。

敗：唯劣源（靜、濁）→行而計激前濾（步二）並用多淨法。無源→尋指：谷中綠植、獸徑下行、晨昏蟲群、聽流水。

### 二：前濾沉

淨前除粒。沉減化效並塞濾。

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

簡沉除→過巾、衫或多布層篩。

得：見較清水、濁減。炭層除某味。

敗：濾後仍濁→於器沉 30-60 分。慎倒上層。重沉或濾。注：前濾**不**使水可飲——備之以淨。

### 三：擇淨法

按可用具與況擇。

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

得：按可用具明決淨法。

敗：無標淨具→沸為默——唯需火與耐熱器。即單壁金水瓶可用為沸。急中、可自岩凹或青竹節置近焰代器。

### 四：沸水

最穩場淨。殺諸病類。

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

得：水達烈滾沸、持合時。冷後安於諸生病。

敗：不能持滾（風、弱火）→延沸時。器漏裂→轉他器。無金器→可於木、皮、皮器以熱石沸：火中熱石 ≥20 分、以鉗或棍轉至水器。避河石（封濕可裂或爆）。

### 五：施化治

沸不便或為次治時用。

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

得：治後水待時後有微化味、示足消。安於菌與毒；二氧化氯亦對寄生蟲。

敗：片過期（治後無味）→倍劑或合他法。味不佳→水露置 30 分以脫氣、或過代炭濾以增味。化為唯法且疑 Cryptosporidium（畜近常）→等二氧化氯全 4 時或合濾。

### 六：安存

淨水可由污器或手再污。

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

得：淨水於清封器仍安。立系防生治間交污。

敗：器少→定一為「生」（唯收）他為「淨」（唯淨）。明刻或標。疑再污→飲前重治。

## 驗

- [ ] 水源已察、選現之佳
- [ ] 濁水淨前已前濾沉
- [ ] 淨法合可用具與況
- [ ] 沸達並持合度滾沸
- [ ] 化治用正劑與待時
- [ ] 淨水存於清、封、標器
- [ ] 足淨水以合日水需

## 忌

- **略前濾**：沉減化效並塞濾。濁水必前濾
- **沸不全**：底數泡非滾沸。待烈、面破泡
- **忽度**：高度水低溫沸。增沸時
- **化欠劑**：冷或濁水需更多化或長接
- **交污**：同器為生與淨水、或污手觸飲緣
- **單法於最劣源**：靜或畜近水→用二法（如濾+化或沸+化）

## 參

- `make-fire` — 沸法所需；火亦供暖於化治待時
- `forage-plants` — 某植指近水源（柳、香蒲、楊）；覓食可需淨水備
