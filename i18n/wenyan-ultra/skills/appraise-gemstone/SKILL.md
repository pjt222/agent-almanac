---
name: appraise-gemstone
locale: wenyan-ultra
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

以四 C（色、淨、切、克）、產地、處置、市分估寶石值。唯教導非證估。

> **告**：此程供寶石值學導。**非**證估。為保、產、售、法須證寶石學家（GIA Graduate Gemologist、FGA 或等）正估。寶石值依手評之素巨變。

## 用

- 欲解定寶石值之素→用
- 證估前先篩→用
- 評售價合理否→用
- 學寶石評法→用
- 解處置態何影值→用

## 入

- **必**：識之寶石（種已確——見 `identify-gemstone`）
- **必**：可達寶石（散勝；嵌限評）
- **可**：克秤（精至 0.01 ct）
- **可**：10x 放或寶石學鏡
- **可**：日光等光（5500-6500K）
- **可**：色評主石或參圖（GIA 系）
- **可**：折光與 Chelsea 濾（為處置察）

## 行

### 一：色評

以三素評：色相、飽、調。

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

1. 於日光下察面上
2. 識主色與副調
3. 評飽——艷強得最高溢
4. 評調——中常宜；過暗過淺減值
5. 比於參圖或主石若可
6. 註面上見色帶否（減值）

得：三素色評（如「中艷藍微紫調」）置石於其種色質譜。

敗：光不宜（黃室光）→註限。誤光下色評不靠。疑變色（亞歷山大、某剛玉、某榴）→於日與白熾下評。

### 二：淨評

於 10x 放下評內特。

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

1. 先察面上——肉眼見內含否？
2. 察 10x 放下，焦穿台
3. 註內含類（晶、羽、印、絲、針）、大、位、數
4. 評影透、輝、耐否
5. 按見度與影賦淨等
6. 考種預——SI1 翡翠優；SI1 海藍中

得：淨等附要內含述、位、影。等校於種預。

敗：放不足（無 10x）→唯眼淨/不淨評。註限。嵌石蓋亭內含→註不能評之區。

### 三：切質評

按比、稱、光性評切質。

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

1. 面上輕搖——察輝、窗、滅
2. 察比：台大、冠高、亭深
3. 評稱：廓形、面齊、會精
4. 評面拋：刻、線、橘皮於 10x
5. 察腰：均厚、不薄（崩險）不厚（死重）
6. 評切自優至差

得：切質評含比、光性、稱、面拋。切等大影值——切善之中質可勝差切之高色淨。

敗：嵌石不能全量比→評可見者（面上光性、稱、拋）註比不能驗。嵌石恆有評限。

### 四：克量與尺

錄石重與尺。

1. 以克秤秤之（1 克=0.2 克）
2. 錄重至兩位（如 2.37 ct）
3. 量尺：長 x 寬 x 深於毫
4. 嵌石以種式由尺估重：
   - 圓：徑^2 x 深 x SG 因
   - 橢：長 x 寬 x 深 x SG 因 x 0.0020
5. 註每克值於商閾增：
   - 0.50、1.00、2.00、3.00、5.00、10.00 ct
   - 1.02 ct 之石溢於同質之 0.98 ct

得：精克重（至 0.01 ct）與毫尺。嵌石重估附明誤裕。

敗：無秤→量尺以標式估重。註重為估。值石恆於校秤驗重。

### 五：察處置

評石經處增其貌否。

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

1. 察內含為熱兆（絲化、應力暈）
2. 用纖光察裂填（閃效）
3. 察面塗以察緣與刻
4. 高值石注實證為處置之要
5. 錄處置評：未處、熱、填、塗、擴、未知

得：處置評附證觀。$500 上石薦實證（GIA、GRS、SSEF、Gubelin）為權處置定。

敗：諸處置（尤輕熱與某輻射）無實儀（FTIR 譜、UV-Vis、Raman）不可察。處置不確→錄「未知——薦實測」非猜。

### 六：市素析

考四 C 外影市值之外素。

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

1. 究石產地若知或可證
2. 考種今市位（升、穩、退）
3. 評實證加值否（>1 ct 與 >$500 多是）
4. 註出處或史義
5. 合全評為值範（非單點）

得：脈值範計四 C、處置、產、市素。表為範附明設。

敗：寶石價需續變市知。市數不可達→供質評（四 C+處置）無價估，薦商或證估師問。

## 驗

- [ ] 估前種正識
- [ ] 色評於日光下含色相、飽、調
- [ ] 淨於 10x 下評附內含錄
- [ ] 切質評含比、光性、稱、拋
- [ ] 克量量（或附明裕估）
- [ ] 處置評附證觀
- [ ] 市素計（產、稀、證值）
- [ ] 值表為範非單號
- [ ] 告含：此教導非證估

## 忌

- **略告**：此程唯供教導。為保、售、法之正估須證寶石學家。恆明述
- **誤光下色評**：螢、白熾、LED 皆移色感。用日光等（5500-6500K）或自然北面日光
- **忽種專淨預**：SI1 翡翠優；SI1 海藍中下。淨須相對種常評
- **過重克量**：大、切差、含內之石較小、切善、淨者每克值低。四 C 互動——重獨不定值
- **無證設未處**：市多紅藍寶經熱。設處置除實證明否

## 參

- `identify-gemstone` —— 種正識為估前置；誤識廢全評
- `grade-tcg-card` —— 觀先、防偏法鏡寶石估避「願評」之律
