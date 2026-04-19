---
name: appraise-gemstone
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Appraise gemstone value using the four Cs (color, clarity, cut, carat),
  origin assessment, treatment detection, and market factor analysis.
  Advisory educational guidance only — not a certified appraisal. Use when
  understanding factors that determine a gemstone's value, pre-screening
  stones before a professional appraisal, evaluating whether a seller's asking
  price is reasonable, learning gemstone grading methodology, or understanding
  how treatment status affects value.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: lapidary
  complexity: advanced
  language: natural
  tags: lapidary, appraisal, valuation, gemstones, grading
---

# 估寶石

藉四 C（色、淨度、切工、克拉）、產地評估、處理偵測與市場因素分析，估寶石之值。此為教育性建議指引，非經認證之評估。

> **DISCLAIMER**：此程序供寶石估值方法之教育指引。**非**經認證之估值。為保險、遺產、銷售或法律目的，恆向認證寶石學家（GIA Graduate Gemologist、FGA 或同等）取正式估值。寶石值依需親手專業評估之因素而大異。

## 適用時機

- 欲解決寶石值之因素
- 為專業估值付費前先篩石
- 須評賣家之要價是否合於合理範圍
- 為教育目的學寶石分級方法
- 欲解處理狀態如何影響值

## 輸入

- **必要**：已識之寶石（種類已確——見 `identify-gemstone`）
- **必要**：對石之取（鬆裝為佳；鑲嵌石限評估）
- **選擇性**：克拉秤（精至 0.01 ct）
- **選擇性**：10x 放大鏡或寶石學顯微鏡
- **選擇性**：日光等效光源（5500-6500K）
- **選擇性**：色分級主石或參考圖（GIA 系）
- **選擇性**：折射儀與 Chelsea 濾鏡（為處理偵測）

## 步驟

### 步驟一：色分級

以三分量（色相、飽和度、明度）評石之色。

```
Colour Assessment Framework:

HUE: The dominant spectral colour
+------------------+------------------------------------------+
| Primary Hue      | Examples                                 |
+------------------+------------------------------------------+
| Red              | Ruby, red spinel, pyrope garnet          |
| Orange           | Spessartine garnet, fire opal            |
| Yellow           | Yellow sapphire, citrine, chrysoberyl    |
| Green            | Emerald, tsavorite, peridot, tourmaline  |
| Blue             | Sapphire, aquamarine, tanzanite          |
| Violet/Purple    | Amethyst, purple sapphire                |
| Pink             | Pink sapphire, morganite, kunzite        |
+------------------+------------------------------------------+
Secondary modifiers: yellowish-green, purplish-red, orangy-pink, etc.

SATURATION: Intensity of the colour
+------------------+------------------------------------------+
| Level            | Description                              |
+------------------+------------------------------------------+
| Vivid            | Pure, intense colour (most valuable)     |
| Strong           | Rich colour, slight modifier             |
| Moderate         | Noticeable colour, some grey/brown       |
| Weak             | Faint colour, significant grey/brown     |
| Greyish/Brownish | Colour masked by grey or brown modifiers |
+------------------+------------------------------------------+

TONE: Lightness or darkness
+------------------+------------------------------------------+
| Level            | Description                              |
+------------------+------------------------------------------+
| Very light       | Pastel, may lack presence                |
| Light            | Attractive in some species (aquamarine)  |
| Medium-light     | Often ideal for many species             |
| Medium           | Classic "fine" tone for most coloured    |
|                  | gemstones                                |
| Medium-dark      | Rich, but watch for over-darkening       |
| Dark             | Colour may appear black face-up          |
| Very dark        | Loses transparency, appears opaque       |
+------------------+------------------------------------------+

IDEAL COLOUR RANGES (highest value):
- Ruby: medium-dark, vivid red ("pigeon blood")
- Sapphire: medium, vivid blue (not too dark, not violetish)
- Emerald: medium, vivid green (not yellowish, not bluish)
- Tanzanite: medium-dark, vivid violetish-blue
- Aquamarine: medium, strong blue (not greenish)
```

1. 於日光等效照下面朝上觀石
2. 識主色相與任何副修飾
3. 評飽和度——鮮明與強烈得最高溢
4. 評明度——中為宜；過暗或過淡減值
5. 對參考圖或主石比，若可
6. 注任面朝上可見之色帶（減值）

**預期：** 三分量色等級（如「中度鮮明藍附微紫修飾」）將石定於該種色品質光譜之位。

**失敗時：** 若照明非理想（黃色室內光），記其限。於誤照下色分級產不可靠之結果。若疑變色（紫翠玉、某些藍寶、某些石榴），於日光與白熾光下皆評。

### 步驟二：淨度分級

於 10x 放大下評石之內部特徵。

```
Coloured Gemstone Clarity Scale (GIA-based):

+-------------------+------------------------------------------+
| Grade             | Description                              |
+-------------------+------------------------------------------+
| VVS               | Very Very Slightly Included: minute      |
| (eye-clean)       | inclusions, difficult to see at 10x      |
+-------------------+------------------------------------------+
| VS                | Very Slightly Included: minor            |
| (eye-clean)       | inclusions, noticeable at 10x            |
+-------------------+------------------------------------------+
| SI1               | Slightly Included: noticeable at 10x,    |
| (usually eye-     | may be visible to the eye                |
| clean)            |                                          |
+-------------------+------------------------------------------+
| SI2               | Slightly Included: easily seen at 10x,   |
| (eye-visible)     | visible to the unaided eye               |
+-------------------+------------------------------------------+
| I1                | Included: obvious inclusions that may    |
|                   | affect transparency or durability        |
+-------------------+------------------------------------------+
| I2-I3             | Heavily Included: prominent inclusions   |
|                   | that affect beauty and/or durability     |
+-------------------+------------------------------------------+

SPECIES-SPECIFIC EXPECTATIONS:
Different species have different "normal" clarity levels:
- Type I (usually eye-clean): aquamarine, topaz, chrysoberyl
  → Inclusions are penalized more heavily
- Type II (usually included): ruby, sapphire, tourmaline
  → Eye-clean examples command significant premiums
- Type III (almost always included): emerald, red tourmaline
  → Eye-clean examples are extremely rare and valuable
```

1. 先面朝上察石——肉眼見任內含物否？
2. 於 10x 放大下察，焦點透過台面
3. 注內含物類型（晶體、羽毛、指紋、絲、針）、大小、位置、數
4. 評內含物是否影響透、輝或耐久
5. 依內含物之可見性與影響賦淨度等級
6. 考種之預期——SI1 翡翠為佳；SI1 海藍寶為平

**預期：** 淨度等級附關鍵內含物之描述、其位置、其對美與耐久之影響。等級依種特有之預期校準。

**失敗時：** 若放大不足（無放大鏡），僅行肉眼乾淨／不淨之評估。記其限。若石鑲嵌且亭部內含物隱，記何區不能評。

### 步驟三：切工品質評估

依比例、對稱與光性能評切工品質。

```
Cut Quality Factors:

PROPORTIONS:
+------------------+------------------------------------------+
| Factor           | Ideal                                    |
+------------------+------------------------------------------+
| Table size       | 55-65% of girdle diameter (round)        |
| Crown height     | 12-17% of girdle diameter                |
| Pavilion depth   | 40-45% of girdle diameter                |
| Girdle thickness | Medium (not too thin, not too thick)     |
| Total depth      | 58-65% of girdle diameter                |
+------------------+------------------------------------------+

LIGHT PERFORMANCE:
+------------------+------------------------------------------+
| Factor           | Description                              |
+------------------+------------------------------------------+
| Brilliance       | White light return — pavillion angles     |
|                  | determine total internal reflection      |
+------------------+------------------------------------------+
| Windowing        | "See-through" area (pavilion too shallow)|
|                  | Any visible window reduces value         |
+------------------+------------------------------------------+
| Extinction       | Dark areas that do not return light      |
|                  | (pavilion too steep, or inherent to deep |
|                  | colour stones at steep viewing angles)   |
+------------------+------------------------------------------+
| Scintillation    | Flashes of light as stone moves          |
|                  | (pattern and intensity)                  |
+------------------+------------------------------------------+

SYMMETRY AND FINISH:
- Facet alignment and meet precision
- Outline symmetry (roundness, oval evenness)
- Surface polish quality (scratches, orange peel)
- Girdle consistency (even thickness)
```

1. 面朝上觀石並輕搖——觀輝、窗、消光
2. 查比例：台面大小、冠高、亭深
3. 評對稱：輪廓形、刻面對齊、會合精準
4. 評表面拋光：於 10x 下看刮痕、拋光線、橘皮
5. 查腰圍：均厚、不過薄（崩裂風險）或過厚（死重）
6. 將切工自 Excellent 至 Poor 評

**預期：** 切工品質評估涵蓋比例、光性能、對稱、表面拋光。切工等級顯著影響值——切工良好之中等品石可勝切工差之高色淨度石。

**失敗時：** 若石鑲嵌且比例不能全量，評可見者（面朝上之光性能、對稱、拋光）並記比例不能驗。鑲嵌石恆有評估之限。

### 步驟四：克拉重與量

記石之重與尺寸。

1. 以克拉秤稱石（1 克拉 = 0.2 克）
2. 記重至二位小數（如 2.37 ct）
3. 量尺寸：長 x 寬 x 深，毫米
4. 對鑲嵌石，依種特有公式由尺寸估重：
   - 圓形：直徑^2 x 深 x SG 因子
   - 橢圓：長 x 寬 x 深 x SG 因子 x 0.0020
5. 注每克拉值於商業顯著之重閾增：
   - 0.50 ct、1.00 ct、2.00 ct、3.00 ct、5.00 ct、10.00 ct
   - 1.02 ct 之石較同品之 0.98 ct 之石溢

**預期：** 準克拉重（至 0.01 ct）與毫米尺寸。對鑲嵌石，重之估計附明陳之誤差範圍。

**失敗時：** 若無克拉秤，量尺寸並以標準公式估重。注重為估。為貴石恆於校準秤上驗重。

### 步驟五：處理偵測

評石是否經處理以強化外觀。

```
Common Gemstone Treatments:
+-------------------+------------------------------------------+
| Treatment         | Detection Indicators                     |
+-------------------+------------------------------------------+
| Heat treatment    | Dissolved silk (rutile needles melted),  |
| (ruby, sapphire)  | stress fractures around inclusions,     |
|                   | altered colour zoning                    |
|                   | NOTE: Heat treatment is standard and     |
|                   | widely accepted for corundum             |
+-------------------+------------------------------------------+
| Fracture filling  | Flash effect under fibre-optic light     |
| (emerald, ruby)   | (blue/orange flash in fractures),       |
|                   | bubbles in filler material               |
|                   | Reduces value significantly              |
+-------------------+------------------------------------------+
| Surface coating   | Colour concentrated at surface,          |
| (topaz "mystic")  | scratches reveal different colour       |
|                   | underneath, uneven colour               |
+-------------------+------------------------------------------+
| Diffusion         | Colour concentrated at surface or along  |
| (sapphire)        | fractures. Immerse in methylene iodide  |
|                   | — colour pattern visible                 |
+-------------------+------------------------------------------+
| Irradiation       | Unstable colours may fade in sunlight    |
| (topaz, diamond)  | Some irradiation is undetectable without |
|                   | lab testing                              |
+-------------------+------------------------------------------+
| Glass filling     | Gas bubbles in glass, flash effect,      |
| (ruby)            | different lustre in filled areas         |
|                   | Severely reduces value and durability    |
+-------------------+------------------------------------------+

TREATMENT IMPACT ON VALUE:
- Untreated (with certification): highest premium
- Standard accepted treatment (heat): moderate reduction
- Enhancement treatment (filling, coating): significant reduction
- Requires disclosure at point of sale in all jurisdictions
```

1. 察內含物之熱處理跡（溶絲、應力暈）
2. 用纖維光以查裂縫填充（閃光效應）
3. 察邊與刮痕以查表面塗層
4. 對高值石，注實驗室認證為處理狀態權威判定所必要
5. 記處理評估：未處理、加熱、填充、塗層、擴散或未知

**預期：** 處理評估附支持之觀察。對 $500 以上之石，建議實驗室認證（GIA、GRS、SSEF、Gubelin）以權威判處理。

**失敗時：** 多處理（特輕熱處理與某些輻照）非實驗室儀器（FTIR 光譜、UV-Vis、Raman）不能偵測。若處理狀態不確，記「未知——建議實驗室測試」而勿猜。

### 步驟六：市場因素分析

考四 C 之外影響市值之外部因素。

```
Market Factors:
+-------------------+------------------------------------------+
| Factor            | Impact                                   |
+-------------------+------------------------------------------+
| Origin            | Kashmir sapphire, Burmese ruby, and      |
|                   | Colombian emerald command significant     |
|                   | premiums (2-10x) over identical quality  |
|                   | from other sources                       |
+-------------------+------------------------------------------+
| Rarity            | Paraiba tourmaline, alexandrite,          |
|                   | padparadscha sapphire — scarcity drives  |
|                   | premium pricing                          |
+-------------------+------------------------------------------+
| Certification     | GIA, GRS, SSEF, Gubelin reports add      |
|                   | confidence and liquidity to high-value   |
|                   | stones                                   |
+-------------------+------------------------------------------+
| Fashion/trends    | Tanzanite, morganite, and coloured       |
|                   | diamonds have experienced trend-driven   |
|                   | price increases                          |
+-------------------+------------------------------------------+
| Setting/mounting  | A well-made setting from a recognised    |
|                   | maker can add value. Generic mounts do   |
|                   | not                                      |
+-------------------+------------------------------------------+
| Provenance        | Royal, historical, or celebrity provenance|
|                   | adds auction premium                     |
+-------------------+------------------------------------------+
```

1. 若知或可證，研石之可能產地
2. 考種於市場之當前位（趨升、穩、降）
3. 評實驗室認證是否將加值（一般對 >1 ct 且 >$500 之石為是）
4. 注任產地或歷史意義
5. 將完整評估彙為值之範圍（非單一價點）

**預期：** 情境化之值範圍，計四 C、處理狀態、產地與市場因素。以附明陳假設之範圍表。

**失敗時：** 寶石定價需持續演變之市場專業。若市場資料不可用，供品質評估（四 C + 處理）而不附價估，並建議諮商商或認證估價師。

## 驗證

- [ ] 估值始前種已正識
- [ ] 色於日光等效照下評，附色相、飽和度、明度
- [ ] 淨度於 10x 放大下分級附內含物清單
- [ ] 切工品質為比例、光性能、對稱、拋光評
- [ ] 克拉重已量（或附明陳範圍之估）
- [ ] 處理狀態已評附支持觀察
- [ ] 市場因素已考（產地、稀有、認證之值）
- [ ] 值以範圍表，非單一數
- [ ] 含免責：此為教育指引，非經認證之估值

## 常見陷阱

- **省免責**：此程序供教育指引而已。為保險、銷售或法律目的之正式估值需認證寶石學家。恆明陳此
- **於誤照下分級色**：螢光、白熾、LED 燈皆移色感。用日光等效（5500-6500K）或自然北向日光
- **忽種特有之淨度預期**：SI1 翡翠為佳石；SI1 海藍寶為下平。淨度須相對該種之常分級
- **過值克拉重**：大、切工差、有內含物之石每克拉值低於小、切工良、潔淨之石。四 C 互動——重獨不決值
- **無證即假未處理**：市上多數紅藍寶皆熱處理。除非實驗室認證確未處理，假已處理

## 相關技能

- `identify-gemstone` — 種之正識為估值之先決；誤識使整評估無效
- `grade-tcg-card` — 觀察先、防偏見之方法平行於估寶石中避「臆想分級」所需之紀律
