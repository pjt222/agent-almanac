---
name: make-fire
description: >
  Start and maintain a fire using friction, spark, and solar methods.
  Covers site selection, material grading (tinder/kindling/fuel), fire lay
  construction (teepee, log cabin, platform), ignition techniques (ferro rod,
  flint & steel, bow drill), flame nurturing, and Leave No Trace extinguishing.
  Use when needing warmth, light, or a signal in a wilderness setting, when
  boiling water for purification, when cooking foraged food, or in an emergency
  survival situation requiring heat or morale support.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: bushcraft
  complexity: intermediate
  language: natural
  tags: bushcraft, fire, survival, wilderness, primitive-skills
  locale: wenyan-ultra
  source_locale: en
  source_commit: 1861e6a6
  translator: "Julius Brussee homage — caveman"
  translation_date: "2026-04-17"
---

# 生火

野外起火、養火也。

## 用

- 求暖、光、號於野→用
- 沸水淨（見 `purify-water`）→用
- 煮覓食（見 `forage-plants`）→用
- 危急求熱氣→用

## 入

- **必**：引源（鎂棒、火石、打火機、弓鑽、凸鏡）
- **必**：乾絨
- **可**：地限（風、土、覆）
- **可**：火之用（暖、炊、號、淨水）

## 行

### 一：擇地

擇安、用、少擾之地。

```
Site Selection Criteria:
┌─────────────────────┬────────────────────────────────────┐
│ Factor              │ Requirement                        │
├─────────────────────┼────────────────────────────────────┤
│ Wind                │ Sheltered or with a windbreak      │
│ Ground              │ Mineral soil, rock, or sand        │
│ Overhead clearance  │ No branches within 3 m / 10 ft    │
│ Distance from water │ At least 5 m / 15 ft from streams │
│ Distance from camp  │ Close enough for use, far enough   │
│                     │ to avoid spark hazards to gear     │
│ Drainage            │ Slight slope or flat; avoid hollows│
│                     │ where rain pools                   │
└─────────────────────┴────────────────────────────────────┘
```

清圓徑約 1 m 至礦土。雪濕地→築青木或平石台。

得：地清平、圓內無燃屑、上空足、有遮風。

敗：土不宜→以 4-6 青（活）腕粗木並列為台。風過烈→以木、石、布 45° 斜為屏。

### 二：集材

分三類、按乾大級之。

```
Material Grading:
┌──────────┬──────────────────┬──────────────┬───────────────────────────┐
│ Category │ Diameter         │ Examples     │ Quantity needed           │
├──────────┼──────────────────┼──────────────┼───────────────────────────┤
│ Tinder   │ Hair-thin fibers │ Birch bark,  │ Two fist-sized bundles    │
│          │                  │ dried grass, │                           │
│          │                  │ cedar bark,  │                           │
│          │                  │ fatwood      │                           │
│          │                  │ shavings,    │                           │
│          │                  │ cattail fluff│                           │
├──────────┼──────────────────┼──────────────┼───────────────────────────┤
│ Kindling │ Pencil-thin to   │ Dead twigs,  │ Two armfuls, sorted by   │
│          │ finger-thick     │ split sticks │ thickness                │
├──────────┼──────────────────┼──────────────┼───────────────────────────┤
│ Fuel     │ Wrist-thick to   │ Dead standing│ Enough for intended burn │
│          │ arm-thick        │ wood, split  │ time (1 armload ≈ 1 hr)  │
│          │                  │ logs         │                           │
└──────────┴──────────────────┴──────────────┴───────────────────────────┘

Dryness Test:
- Snap test: dry wood snaps cleanly; damp wood bends
- Sound test: dry wood clicks when struck together; damp wood thuds
- Source priority: dead standing > dead leaning > dead on dry ground > dead on wet ground
```

得：三堆於臂內。絨骨乾細；枝脆折。

敗：絨皆濕→刮內皮（柏、樺、楊）以刀作細絲。肥松（死松脂心）濕亦燃。末計：用攜物（油棉、蠟紙板）。

### 三：架火

按用與況擇架。

```
Fire Lay Decision Table:
┌──────────────┬──────────────────────┬──────────────────────────┐
│ Fire Lay     │ Best for             │ Construction             │
├──────────────┼──────────────────────┼──────────────────────────┤
│ Teepee       │ Quick start, boiling │ Lean kindling against    │
│              │ water, signaling     │ a central tinder bundle  │
│              │                      │ in a cone shape          │
├──────────────┼──────────────────────┼──────────────────────────┤
│ Log cabin    │ Sustained heat,      │ Stack pairs of sticks in │
│              │ cooking, drying      │ alternating layers like  │
│              │                      │ a cabin; tinder in center│
├──────────────┼──────────────────────┼──────────────────────────┤
│ Lean-to      │ Windy conditions     │ Push a green stick into  │
│              │                      │ ground at 30°; lean      │
│              │                      │ kindling against it with │
│              │                      │ tinder underneath        │
├──────────────┼──────────────────────┼──────────────────────────┤
│ Platform     │ Snow/wet ground      │ Lay green logs side by   │
│              │                      │ side as a base; build    │
│              │                      │ teepee or log cabin on   │
│              │                      │ top                      │
├──────────────┼──────────────────────┼──────────────────────────┤
│ Star/Radial  │ Long burns with      │ Lay 4-5 logs radiating   │
│              │ minimal fuel         │ from center like spokes; │
│              │                      │ push inward as they burn │
└──────────────┴──────────────────────┴──────────────────────────┘
```

留隙通氣。火需氧→鬆堆非緊。

得：架穩、絨易引、隙足、枝排使焰漸升絨→枝→薪。

敗：崩→插支棍為柱。氣滯（煙而不焰）→開隙、迎風底留口。

### 四：引絨

按具擇法。

```
Ignition Methods (ranked by reliability):
┌───────────────┬────────────────────────────────────────────────┐
│ Method        │ Technique                                      │
├───────────────┼────────────────────────────────────────────────┤
│ Lighter/match │ Apply flame directly to tinder for 5-10 sec   │
├───────────────┼────────────────────────────────────────────────┤
│ Ferro rod     │ Hold rod against tinder; scrape striker down   │
│               │ rod at 45° with firm, fast strokes; direct     │
│               │ sparks into center of tinder bundle            │
├───────────────┼────────────────────────────────────────────────┤
│ Flint & steel │ Strike steel against flint edge to cast sparks │
│               │ onto char cloth laid on tinder                 │
├───────────────┼────────────────────────────────────────────────┤
│ Bow drill     │ Carve fireboard notch; place tinder below;     │
│               │ spin spindle with bow using steady, full-length│
│               │ strokes until coal forms in notch              │
├───────────────┼────────────────────────────────────────────────┤
│ Solar (lens)  │ Focus sunlight through lens onto dark tinder;  │
│               │ hold steady until smoke appears; gently blow   │
└───────────────┴────────────────────────────────────────────────┘
```

得：絨於 30 秒內紅（炭）或小焰生。

敗：星落而絨不燃→絨過濕或粗。細之（刮、撕、蓬）。鎂棒先刮鎂屑於絨為催。弓鑽→軸、板同乾軟木（柳、柏、楊），槽達軸心凹。

### 五：養焰

絨燃乃慎由炭至焰。

1. 有炭（弓鑽、火石）→以絨束裹炭，緩吹漸增至焰生
2. 置燃絨束於架中
3. 以身或屏遮風
4. 先加最細枝——鉛粗、置焰觸處
5. 各加必先燃乃加次

得：1-2 分鐘內焰由絨升至最細枝。劈啪聲→自續矣。

敗：枝階焰死→枝過粗濕。以刀更劈細、或擇最乾細。焰窒→架過緊、緩提材以通氣。勿猛吹散炭。

### 六：進薪

漸增材徑。

1. 枝穩燃（2-3 分鐘續焰）乃加指粗
2. 彼燃足乃加腕粗
3. 排薪存氣：相倚或交疊
4. 炊用→待燃為炭床（20-30 分鐘）乃置鍋烤架

```
Fuel Progression:
  Tinder → Pencil-thin → Finger-thick → Wrist-thick → Arm-thick
  (each stage must be established before adding the next)
```

得：火穩自續、熱均、每 15-30 分鐘加薪即養。

敗：加大材即死→越級也。退一級築厚炭床乃升。材嘶汽→過濕；劈露內乾、或近火烘再加。

### 七：滅跡

```
Extinguishing Protocol:
1. Stop adding fuel 30-60 min before you need the fire out
2. Let wood burn down to ash
3. Spread coals and ash with a stick
4. Douse with water (pour, stir, pour again)
5. Feel with the back of your hand 10 cm / 4 in above the ashes
6. If any warmth is felt, repeat douse-stir-douse
7. When cold to touch, scatter the ash over a wide area
8. Replace any ground cover or duff that was moved
9. "Could someone walk by and not know a fire was here?"
```

得：地冷、無可見炭、似未擾。

敗：無水→以礦土（非有機腐葉，會悶燃）埋。攪察再三。未冷勿離。炭埋深灰下→撥灰盡滅露炭。

## 驗

- [ ] 地清至礦土或築台
- [ ] 三類材於引前皆備
- [ ] 架氣通足
- [ ] 絨燃、傳枝不死
- [ ] 火達自續薪階
- [ ] 火全滅——冷觸、無見炭
- [ ] 地似無跡

## 忌

- **絨濕**：最常敗也。必細於料、擇立死木
- **薪悶**：過急加木斷氧。漸進之
- **忽風**：風助亦殺。用通氣、引時遮絨
- **分類亂**：絨燃時覓枝→誤時。一擊前盡備盡分
- **濕地導熱**：乾木於濕地亦失熱。濕況築台
- **滅不盡**：埋炭數時後可復燃。必冷觸方止

## 參

- `purify-water` — 沸水需續火，法賴此技
- `forage-plants` — 多草為絨（樺皮、香蒲絨、乾草），有者需炊
- `paper-making` — 以植纖造紙；纖備與搗法同絨備
