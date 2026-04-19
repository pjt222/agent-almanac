---
name: appraise-gemstone
locale: wenyan
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

以四 C（色、淨、切、克拉）、處置察、源察、市場因析估寶石之值。此為教育指引耳，非證書估也。

> **免責**：此程供寶估方法之教育指引。*非*證書估也。為保、遺、售、法之故，恆求證書寶石學家（GIA GG、FGA、或等）之正估。寶石值依需實觸專察之諸因可極變。

## 用時

- 欲解定寶值之諸因乃用
- 付證書估前預察石乃用
- 需評賣價於理範乎乃用
- 學寶石評級為教育乃用
- 欲解處置之狀如何影值乃用

## 入

- **必要**：已識之寶石（種已確——見 `identify-gemstone`）
- **必要**：可觸石（散者佳；鑲者限察）
- **可選**：克拉秤（準至 0.01 ct）
- **可選**：10 倍放大鏡或寶石顯微
- **可選**：日光等效光源（5500-6500K）
- **可選**：色評級標石或參圖（GIA 系）
- **可選**：折射儀與 Chelsea 濾（處置察）

## 法

### 第一步：色評級

以色相、飽和、明暗三元察石色。

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

1. 於日光等效光下正面視石
2. 識主色與次修飾
3. 察飽和——鮮明者溢價最高
4. 察明暗——中明為宜；太暗或太淡皆減值
5. 若有則對參圖或標石比
6. 記正面所見之色帶（減值）

**得：** 三元色級（如「中鮮藍附微紫修飾」）定石於其種之色質譜位。

**敗則：** 若光不宜（黃內光），注其限。誤光下評色產不可信之果。若疑變色（紫翠玉、某藍寶、某榴石），於日光與白熾光下察之。

### 第二步：淨評級

於 10 倍放下評石之內特。

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

1. 先正面察——肉眼見內含乎？
2. 於 10 倍放下察，透桌聚焦
3. 記內含類（晶、羽、指紋、絲、針）、大、位、數
4. 察內含影透光、輝、耐乎
5. 依內含之見與影賦淨級
6. 察種之期——SI1 祖母綠為佳，SI1 海水藍為平

**得：** 淨級附諸要內含之述、位、對美與耐之影。級依種之期校。

**敗則：** 若放不足（無放），僅察肉眼淨乎。注其限。若石鑲而腹內含隱，記何部不可察。

### 第三步：切質評

以比例、對稱、光表現評切之質。

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

1. 正面察而輕搖——察輝、窗、滅
2. 察比例：桌大、冠高、腹深
3. 察對稱：輪廓、面齊、會交之精
4. 察面光：於 10 倍下之劃、光線、橙皮
5. 察腰：厚勻，非過薄（崩險）亦非過厚（死重）
6. 評切自優至劣

**得：** 切質評含比例、光表現、對稱、面光。切級大影值——切佳中質之石可勝切劣高色淨之石。

**敗則：** 若鑲而比例不可全量，評可見者（正面光表現、對稱、光）且注比例未驗。鑲石恆有察限。

### 第四步：克拉與度量

記石重與度。

1. 以克拉秤稱石（1 克拉 = 0.2 克）
2. 記重至二小數（如 2.37 ct）
3. 量度：長 x 寬 x 深 於毫米
4. 鑲石依種式於度估重：
   - 圓：徑^2 x 深 x SG 因
   - 橢：長 x 寬 x 深 x SG 因 x 0.0020
5. 注每克拉值於商界要重閾升：
   - 0.50 ct、1.00 ct、2.00 ct、3.00 ct、5.00 ct、10.00 ct
   - 1.02 ct 之石溢於等質 0.98 ct 之石

**得：** 準克拉重（至 0.01 ct）與毫米度。鑲石則重估附誤裕。

**敗則：** 若無克拉秤，量度以標式估重。注重為估。貴石恆於校秤驗重。

### 第五步：處置察

察石曾以處置增色乎。

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

1. 察內含有熱處痕乎（絲化、應力暈）
2. 以光纖察裂隙填（閃效）
3. 察面塗：察邊與劃
4. 高值石注實驗室證（GIA、GRS、SSEF、Gubelin）為處置之權威定
5. 記處置察：未處、加熱、填、塗、擴散、或未知

**得：** 處置察附支觀。超 500 美金之石薦實驗室證。

**敗則：** 諸處（尤輕熱與某輻射）無實驗器具（FTIR 譜、UV-Vis、Raman）不可察。若處置狀不定，記「未知——薦實驗試」勝於猜。

### 第六步：市場因析

察四 C 外影值之外因。

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

1. 研石之源若可知或可證
2. 察種之市位（趨升、穩、降）
3. 評實驗室證可否增值（石 >1 ct 與 >500 美金則可）
4. 注諸源或歷史要
5. 合全評為值範（非單價）

**得：** 境化之值範，計四 C、處置、源、市場因。以範而非單值表，附述所假。

**敗則：** 寶價需持續演之市場專。若市場數不可得，供質評（四 C + 處置）無價估，薦詢商或證書估師。

## 驗

- [ ] 估前種已確
- [ ] 色於日光等效光察附色相、飽和、明暗
- [ ] 淨於 10 倍放評附內含錄
- [ ] 切質評含比例、光表現、對稱、面光
- [ ] 克拉量（或估附誤裕）
- [ ] 處置狀察附支觀
- [ ] 市場因察（源、稀、證值）
- [ ] 值為範表，非單數
- [ ] 免責含：此為教育指引，非證書估

## 陷

- **省免責**：此程供教育指引耳。為保、售、法之正估需證書寶石家。明述之
- **於誤光評色**：熒、白熾、LED 皆移色覺。用日光等效（5500-6500K）或自然北光
- **忽種之淨期**：SI1 祖母綠佳，SI1 海水藍平。淨須於種常評
- **過重克拉**：大而切劣含雜之石每克拉低於小而切佳淨者。四 C 互——重單不定值
- **假未處無證**：市之大多紅藍為熱處。假已處除非實驗室證定

## 參

- `identify-gemstone` — 估之前題；誤識致全評失
- `grade-tcg-card` — 察先、防偏之法同寶估中免「願評」之律
