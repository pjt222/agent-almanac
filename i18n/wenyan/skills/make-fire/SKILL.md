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
  locale: wenyan
  source_locale: en
  source_commit: 1861e6a6
  translator: "Julius Brussee homage — caveman"
  translation_date: "2026-04-17"
---

# 取火

於野外，用所攜與所取之材，舉火而守之。

## 用時

- 野中需暖、需明、需號乃用
- 欲煮水以潔之（參 `purify-water`）乃用
- 欲炊所獵所採之食（參 `forage-plants`）乃用
- 危急求生，需熱、需氣者乃用

## 入

- **必要**：生火之具（鎂棒、燧石鋼、火柴、鑽弓具、或凸鏡）
- **必要**：乾燥之引火材（取於自然或所攜）
- **可選**：地之所限（風向、土性、上覆之枝）
- **可選**：火之所為（取暖、炊食、發號、潔水）

## 法

### 第一步：擇地而治之

擇地安全、適用、少擾於自然者。

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

徑約一米之圓，清至礦土。若於雪地或濕土，以生木或平石築臺。

得：地已清、已平，圓內無可燃之物，上空無礙，風有蔽。

敗則：若無合適之土，取生木腕粗者四至六，並置為臺。若風過強，積木石或張布四十五度以為屏。

### 第二步：聚材而分級

聚材為三類，各依乾與粗分級。

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

得：三堆已分，距火地咫尺可取。引火者乾如骨，析至極細。柴折而清脆者為佳。

敗則：若所得引火者皆濕，以刃刮樹內皮（柏、樺、楊）為細絲。松脂木（死松之脂心）雖濕猶燃。若實窮，用所攜之助燃（塗凡士林之棉、蠟紙）。

### 第三步：築火形

依其用與其境擇火形。

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

留隙以通氣。火需氧也——聚材宜疏，勿緊。

得：結構穩而引火者便於點，氣隙既足，柴之排列使焰得層層升進，自引火而柴而薪。

敗則：若崩，取支杖立地為中柱。若通氣不善（煙而不焰），開材間之隙，使迎風之底有口。

### 第四步：點其引火

依所具之器擇點火之法。

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

得：引火者於火花或焰觸之三十秒內發紅炭，或起微焰。

敗則：若火花落而引火者不燃，其濕或過粗也。再細析之（刮、撕、絨）。用鎂棒者，先刮鎂屑於其上為助燃。用鑽弓者，軸與火板宜同為乾軟木（柳、柏、楊），凹須至軸壓之中心。

### 第五步：養其焰

引火既燃，自炭至焰宜慎而轉之。

1. 若有紅炭（鑽弓、燧石鋼），裹引火於炭外，緩緩吹之，氣漸強而焰現
2. 置燃之引火束於已築之火形
3. 以身或屏蔽風
4. 先添最細之柴——鉛筆粗者逐枝置於焰觸之處
5. 前者燃全，方續添之

得：焰自引火登最細之柴，一二分鐘之內。啪剝之聲，示其自續矣。

敗則：若至細柴而焰滅，柴過粗或過濕也。以刃析細之，或獨取最乾最細者。若焰悶窒，火形過密——輕提其材以通氣。勿力吹而散其炭。

### 第六步：進至薪木

漸增其材之粗。

1. 細柴穩燃（二三分鐘持續之焰），乃添指粗之枝
2. 俟其全燃，再添腕粗之木
3. 置薪使氣通：相倚或交疊
4. 若為炊，待火降為炭床（二三十分鐘），方置鍋灶

```
Fuel Progression:
  Tinder → Pencil-thin → Finger-thick → Wrist-thick → Arm-thick
  (each stage must be established before adding the next)
```

得：火穩而自續，熱恆久，可每十五至三十分鐘添薪以守之。

敗則：若添大木則火輒滅，進階太速也。退一級，養更厚之炭床而後升。若木嘶而冒蒸，其過濕也——析之以露乾心，或近火（勿於火上）置之以乾，再添之。

### 第七步：滅其火而不留痕

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

得：火地觸之冷，無炭可見，地貌如未經擾。

敗則：若無水，以礦土覆之（勿用有機腐葉，恐其陰燃）。攪而反驗。未冷勿離其地。炭埋於深灰，盡除其灰而澆其露炭。

## 驗

- [ ] 火地已清至礦土，或已築臺
- [ ] 點火之前，材已聚而分三級
- [ ] 火形之築通氣有餘
- [ ] 引火已燃，轉至柴而不滅
- [ ] 火至自續薪階
- [ ] 火全滅——觸之冷，無可見之炭
- [ ] 地復其原狀，不留痕

## 陷

- **引火濕**：敗之最常者也。引火宜析至細於所以為必者，取於立死之材
- **以薪悶之**：薪過多過速則斷氣。宜漸次而進
- **忽於風**：風能助火，亦能殺火。用其氣流，點火之際蔽之
- **材未分**：引火燃而尋柴，耗危急之時。擊花之前盡聚而分之
- **濕土傳熱**：雖乾木置濕土亦失熱。濕境宜築臺
- **滅之不盡**：埋炭可復燃於數時之後。必驗其冷觸

## 參

- `purify-water` — 煮水需續火，其煮法賴此技
- `forage-plants` — 諸草可供引火（樺皮、蒲絨、乾草），某食須炊
- `paper-making` — 以草纖手製紙也，其纖之備與搗與取引火之備共一法
