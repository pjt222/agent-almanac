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
  locale: wenyan-lite
  source_locale: en
  source_commit: 1861e6a6
  translator: "Julius Brussee homage — caveman"
  translation_date: "2026-04-17"
---

# 生火

以現有之天然與攜帶材料，於荒野條件下生火並維持。

## 適用時機

- 於荒野中需取暖、照明或信號
- 需煮沸水以淨化（見 `purify-water`）
- 需烹煮採集或狩獲之食物（見 `forage-plants`）
- 緊急求生情境中需熱源或士氣支持

## 輸入

- **必要**：點火源（火棒、火石與鋼、打火機、弓鑽套組或放大鏡）
- **必要**：乾燥火絨材料（天然或攜帶）
- **選擇性**：火場位置限制（風向、地面類型、上方遮蔽）
- **選擇性**：火之用途（取暖、烹飪、信號、淨水）

## 步驟

### 步驟一：選址並整備場地

擇一安全、實用且環境衝擊最小之位置。

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

清出直徑約 1 米／3 呎之圓圈，露出礦質土。若於雪上或濕地，以青木或平石建平臺。

**預期：** 已清整、平坦之火場，圓圈內無易燃雜物，上方淨空充足，並有擋風設置。

**失敗時：** 若無適合地面，以 4-6 根腕粗青木（活木）並排鋪成懸臺。若風勢過強，以疊木、石塊或以 45 度斜張之防水布建擋風屏障。

### 步驟二：採集並分級材料

以三類收集材料，各依乾度與尺寸分級。

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

**預期：** 三堆分類材料置於火場觸手可及之處。火絨應極乾且細碎處理。引火柴折斷應清脆。

**失敗時：** 若所有火絨皆潮濕，以刀刃刮取內樹皮（雪松、樺、楊）製成細纖維。松明（枯針葉樹之松脂心材）即使潮濕亦可點燃。最後手段，採用攜帶之引火物（塗凡士林之棉球、蠟漬紙板）。

### 步驟三：建構火堆架

依用途與條件擇一火堆架。

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

保留氣流縫隙。火需氧氣——材料鬆疊，勿緊壓。

**預期：** 結構穩固，火絨可及以供點火，氣流縫隙充足，引火柴之安置使火焰得以從火絨循次攀至引火柴再至燃料。

**失敗時：** 若結構倒塌，以插入地面之支撐棒作中心立柱。若氣流不足（火冒煙而不著焰），開鬆材料間縫隙，並確保迎風面底部有開口。

### 步驟四：點燃火絨

依可用工具擇一點火法。

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

**預期：** 火絨於火星或火焰接觸 30 秒內開始發紅（燃炭）或產生小火焰。

**失敗時：** 若火星落入而火絨不燃，則火絨過濕或過粗。將火絨更細處理（刮、撕、蓬鬆）。若用火棒，先將少許鎂屑刮至火絨上作助燃劑。若用弓鑽，確保鑽桿與火板為同一乾軟木（柳、雪松、楊），且凹口深達鑽桿之凹陷中心。

### 步驟五：呵護火焰

火絨點燃後，謹慎由燃炭過渡至火焰。

1. 若有燃炭（弓鑽、火石與鋼）：將火絨包住燃炭，以穩定漸強之吹氣輕柔地吹，直至火焰出現
2. 將帶焰之火絨置入已備好之火堆架中
3. 以身體或擋風屏障遮風
4. 先加最細之引火柴——將鉛筆粗之個別枝條置於火焰接觸處
5. 每次添加後待其著火再加更多

**預期：** 火焰於 1-2 分鐘內從火絨攀至最小引火柴。劈啪聲表示燃燒已自維持。

**失敗時：** 若火焰於引火柴階段熄滅，則引火柴過粗或過濕。以刀將引火柴劈得更細，或僅用最乾、最細之枝。若火焰窒息，火堆架過緊——輕提材料以改善氣流。勿用力吹散燃炭。

### 步驟六：建立至燃料木

循序增加材料尺寸。

1. 引火柴穩定燃燒後（持續火焰 2-3 分鐘），加入指粗枝條
2. 待其完全著火再加腕粗木
3. 排列燃料以維持氣流：將木塊相倚或交叉堆疊
4. 烹飪用途：待火燃至炭床（20-30 分鐘）再置鍋或烤架

```
Fuel Progression:
  Tinder → Pencil-thin → Finger-thick → Wrist-thick → Arm-thick
  (each stage must be established before adding the next)
```

**預期：** 穩固自維持之火，產生一致熱量，每 15-30 分鐘添燃料即可維持。

**失敗時：** 若加大木時火持續熄滅，則跳級過快。退回小一級，建立更大之炭床再升級。若木嘶鳴冒蒸氣，則過濕——劈開露出乾燥內木，或靠近（非置於）火旁令其先乾再加。

### 步驟七：熄火並不留痕跡

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

**預期：** 火場觸之冰涼，無可見燃炭，區域看似未經擾動。

**失敗時：** 若無水可用，以礦質土（非腐植質，後者可能悶燒）覆蓋熄火。反覆攪拌並檢查。切勿於未冷之前離開火場。若燃炭埋於深灰中，將灰刮開並澆濕露出之燃炭。

## 驗證

- [ ] 火場已清至礦質土或已建懸臺
- [ ] 點火前已採集三類分級材料
- [ ] 火堆架結構允許充足氣流
- [ ] 火絨點燃並過渡至引火柴而未熄
- [ ] 火達自維持之燃料階段
- [ ] 火已完全熄滅——觸之冰涼，無可見燃炭
- [ ] 場地依不留痕跡原則保留

## 常見陷阱

- **潮濕火絨**：最常見之失敗。火絨處理之細度務必超乎所想，並取自枯立材料
- **以燃料悶熄**：加木過多過快切斷氧氣。應循序建立
- **忽視風**：風可助火亦可殺火。利用風以供氣流，但點火時須遮蔽火絨
- **材料分類不良**：火絨燃燒時還在搜尋引火柴將浪費關鍵時間。打火前應收集並分類一切
- **濕地傳導**：即便乾木置於濕地亦將散熱。濕地條件下使用平臺
- **熄滅不完全**：埋藏之燃炭數小時後可能復燃。務必驗證觸之冰涼

## 相關技能

- `purify-water` — 煮沸水需持續之火；煮沸法依賴本技能
- `forage-plants` — 許多植物提供火絨（樺皮、香蒲絨、乾草），且部分需烹煮
- `paper-making` — 以植物纖維手工造紙；與火絨備製共用纖維處理與製漿技術
