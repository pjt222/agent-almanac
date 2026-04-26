---
name: ornament-style-color
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Design polychromatic ornamental patterns grounded in Alexander Speltz's classical
  ornament taxonomy. Builds on monochrome structural analysis by adding period-authentic
  color palettes, color-to-motif mapping, and rendering styles suited to painted,
  illuminated, and glazed ornament. Use when creating decorative designs where color
  is integral to the tradition (Islamic tilework, illuminated manuscripts, Art Nouveau),
  exploring how historical periods used color in ornament, or producing colored reference
  imagery for design, illustration, or educational materials.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: design
  complexity: intermediate
  language: natural
  tags: design, ornament, polychromatic, color, art-history, speltz, generative-ai, z-image
---

# 飾風——色

合美術史色學與 AI 助像生以設多色飾紋。承 `ornament-style-mono` 之結構基，加期確色盤、色和則、與宜繪、彩飾、釉飾之渲風。

## 用時

- 飾傳中色為要者（如伊斯蘭瓦、彩飾稿、新藝術海報）乃用
- 探史期飾用色（盤、分、象徵）乃用
- 為設、繪、或教生彩參像乃用
- 古紋之繪、彩飾、釉、彩窗渲乃用
- 飾傳中色與形之關係乃用

## 入

- **必要**：欲史期或風（或「驚我」隨選）
- **必要**：應脈（邊、徽、楣、板、瓦、獨紋）
- **可選**：色盤好（期確、自定、或具色）
- **可選**：具紋好（莨苕、阿拉伯、玫瑰等）
- **可選**：渲風好（繪、彩飾、釉瓦、彩窗、水彩）
- **可選**：色情（淡/古、衡/自然、艷/飽）
- **可選**：目分辨率與比
- **可選**：種子值供可復生

## 法

### 第一步：選史期與色盤

擇期並識其色言。飾色非任意——各期之盤本於可得顏料、文化象徵、與材脈。

```
Historical Ornament Periods with Characteristic Palettes:
┌───────────────────┬─────────────────┬────────────────────────────────────────────────────────┐
│ Period            │ Date Range      │ Characteristic Palette                                  │
├───────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Egyptian          │ 3100–332 BCE    │ Lapis blue, gold/ochre, terracotta red, black, white   │
│                   │                 │ Mineral pigments: flat, unmodulated, high contrast      │
├───────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Greek             │ 800–31 BCE      │ Terracotta red, black, ochre, white, blue (rare)       │
│                   │                 │ Pottery palette; architectural color largely lost        │
├───────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Roman             │ 509 BCE–476 CE  │ Pompeii red, ochre yellow, black, white, verdigris     │
│                   │                 │ Fresco palette: warm earth tones, strong red dominant    │
├───────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Byzantine         │ 330–1453 CE     │ Gold (dominant), deep blue, crimson, purple, white      │
│                   │                 │ Mosaic tesserae: jewel tones, gold ground, luminous      │
├───────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Islamic           │ 7th–17th c.     │ Turquoise/cobalt blue, white, gold, emerald green       │
│                   │                 │ Tile glazes: luminous, saturated, geometric precision    │
├───────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Romanesque        │ 1000–1200 CE    │ Ochre, rust red, deep green, dark blue, cream           │
│                   │                 │ Manuscript and stone: earthy, muted, mineral-derived     │
├───────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Gothic            │ 1150–1500 CE    │ Ultramarine blue, ruby red, emerald green, gold, white  │
│                   │                 │ Stained glass + illumination: saturated, luminous        │
├───────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Renaissance       │ 1400–1600 CE    │ Rich earth tones, azure blue, gold leaf, warm greens    │
│                   │                 │ Oil and fresco: naturalistic, modulated, subtle          │
├───────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Baroque/Rococo    │ 1600–1780 CE    │ Pastel pink, powder blue, cream, gold, soft green       │
│                   │                 │ (Rococo) vs deep burgundy, gold, forest green (Baroque) │
├───────────────────┼─────────────────┼────────────────────────────────────────────────────────┤
│ Art Nouveau       │ 1890–1910 CE    │ Sage green, dusty rose, amber/gold, muted purple,      │
│                   │                 │ teal. Organic, muted, nature-derived palette             │
└───────────────────┴─────────────────┴────────────────────────────────────────────────────────┘
```

1. 用者已指期者，確認並注其特盤
2. 「驚我」者，隨選——重於色傳豐之期（伊斯蘭、拜占庭、哥特、新藝術）
3. 注材脈（壁、馬賽克、瓦、彩窗、印），影響色之渲

**得：** 明識之期附其特盤與材脈已解。

**敗則：** 用者請表外之期者，以 WebSearch 研「[period] ornament color palette pigments」並建等條目。史顏料可得性為期確色之可靠引。

### 第二步：定色盤

譯史盤為具 3-5 色組附定角。

**色角架：**
```
Color Distribution (60/30/10 Rule):
┌──────────────┬────────────┬──────────────────────────────────────────┐
│ Role         │ Proportion │ Function                                  │
├──────────────┼────────────┼──────────────────────────────────────────┤
│ Dominant     │ ~60%       │ Ground color or primary structural color  │
│ Secondary    │ ~30%       │ Motif fill or supporting structural color │
│ Accent       │ ~10%       │ Highlights, details, focal points         │
│ (Optional)   │ —          │ Additional accent or metallic (gold)      │
│ (Optional)   │ —          │ Background / ground if different from     │
│              │            │ dominant                                   │
└──────────────┴────────────┴──────────────────────────────────────────┘
```

**色和諸法：**
- **期確**：唯用該史期顏料與材所可得之色
- **互補**：色輪相對之色（如藍與金/橙）——高反差
- **類比**：相鄰色（如鼠尾草綠、青、淡藍）——和諧細微
- **三和**：三等距色（如紅、藍、金）——艷而衡

1. 選 3-5 色，名其角（主、次、強、選）
2. 擇和法
3. 賦約 hex 或述色名
3. 注色情：淡/古、衡/自然、或艷/飽

**色盤定例：**
- **伊斯蘭瓦**：青綠（主）、白（次）、寶藍（強）、金（細）——類比 + 金——艷
- **新藝術海報**：鼠尾草綠（主）、淡玫（次）、琥珀金（強）——類比——淡
- **拜占庭馬賽克**：金（主）、深藍（次）、絳紅（強）、白（細）——互補——艷

**得：** 3-5 色盤附名、角、比、和法、與情已定。

**敗則：** 色選覺任意者，錨於期之材脈。問：「何顏料物可得？」「底材為何？」（皮上金箔、陶上釉、灰上漆）。材限並認盤。

### 第三步：析紋構

解所選紋之結構文法，承黑白析加色至構之映。

1. 行 `ornament-style-mono` 第二步同結構析：
   - 對稱類（雙、輻、平移、點）
   - 幾何架（圓、方、三、帶）
   - 填模（實、線填、空、混）
   - 邊處（清、有機、互鎖）

2. 加**色至構之映**：
   - 何結構件得何色？
   - 色循形（每形一色）抑流（色漸跨結構界）？
   - 強色現於何？（常於焦點、交、或小細件）
   - 底色為何？

**映例：**
```
Islamic Star Pattern:
- Star forms: turquoise (dominant)
- Interlocking geometric ground: white (secondary)
- Star center details: cobalt blue (accent)
- Outline/border: gold (detail)
→ Color follows form strictly — each geometric shape is one flat color
```

**得：** 結構述附各結構件之明色賦。

**敗則：** 色至構之映不明者，以 WebSearch 「[period] [motif] ornament color」研史例，察色如何實用。史飾幾乎必以色明結構，非掩之。

### 第四步：構色提示

建 Z-Image 生之文提，含色盤與渲風。

**提模：**
```
[Rendering style] of [motif name] ornament in the [period] style,
[composition type], [color palette description],
[color mood], [structural details from Step 3],
[application context], [additional qualifiers]
```

**色宜渲風：**
- `painted ornament` — 筆觸見、不透色、壁或油質
- `illuminated manuscript` — 金箔、寶色、皮底
- `glazed ceramic tile` — 光面、平色、精邊
- `stained glass` — 透色、形間黑鉛線
- `watercolor illustration` — 透洗、軟邊、紙見
- `enamel on metal` — 硬光色、金底
- `mosaic` — 小石、件間隙、明
- `printed poster` — 平色區、新藝術或工藝美術質

**提中色述：**
- 名具色：「turquoise blue and gold on white ground」
- 述情：「muted antique tones」或「vivid saturated jewel colors」
- 指分：「blue dominant with gold accents」或「warm earth tones with red details」

**提例：**
- `glazed ceramic tile ornament in the Islamic style, geometric star pattern, turquoise blue and white with cobalt blue accents and gold outlines, vivid saturated colors, repeating tessellation, Iznik tilework quality`
- `illuminated manuscript border in the Gothic style, vine and trefoil ornament, ultramarine blue and ruby red with gold leaf details on cream vellum, rich jewel tones, vertical panel, medieval book of hours quality`
- `watercolor illustration of Art Nouveau floral ornament, whiplash curves with lily motif, sage green and dusty rose with amber gold accents, muted organic tones, vertical panel, Alphonse Mucha influence`

**得：** 25-50 字之提，明渲風、紋、期、構、與色息。

**敗則：** 提色不合盤者，前置色述（紋前）。Z-Image 重早提詞。亦試名具 hex 色或知顏料名（ultramarine、vermillion、ochre）。

### 第五步：設生參

擇分辨率與生參。色飾常較黑白益於多步推。

```
Resolution by Application (same as ornament-style-mono):
┌────────────────────┬─────────────────────┬────────────────────────────────┐
│ Application        │ Recommended         │ Rationale                      │
├────────────────────┼─────────────────────┼────────────────────────────────┤
│ Medallion / Roundel│ 1024x1024 (1:1)     │ Radial symmetry needs square   │
│ Tile / Repeat Unit │ 1024x1024 (1:1)     │ Square for seamless tiling     │
│ Horizontal Frieze  │ 1280x720 (16:9)     │ Wide format for running border │
│ Vertical Panel     │ 720x1280 (9:16)     │ Portrait format for columns    │
│ Wide Border        │ 1344x576 (21:9)     │ Ultrawide for architectural    │
│ General / Flexible │ 1152x896 (9:7)      │ Balanced landscape format      │
│ Large Detail       │ 1536x1536 (1:1)     │ Higher res for fine color work │
└────────────────────┴─────────────────────┴────────────────────────────────┘
```

1. 依應脈擇分辨率
2. 設 `steps` 為 10-12（色細與盤準益於多步）
3. 設 `shift` 為 3（默）
4. 擇 `random_seed: true` 探或 `random_seed: false` 附具種以可復
5. 記諸參供文

**得：** 全參已設。注色飾常須 10+ 步以盤準。

**敗則：** 不確者，用 1024x1024 於 10 步。多色飾脈下為可靠默。

### 第六步：生像

呼 Z-Image MCP 具以生飾。

1. 呼 `mcp__hf-mcp-server__gr1_z_image_turbo_generate` 附：
   - `prompt`：第四步所構之提
   - `resolution`：第五步
   - `steps`：第五步（薦 10-12）
   - `shift`：第五步
   - `random_seed`：第五步
   - `seed`：若 `random_seed` false 之具種
2. 記返種值供可復
3. 注生時

**得：** 生像有可識飾形與可見色。色或不全合所指盤——此於評處。

**敗則：** MCP 具不可用者，驗 hf-mcp-server 已設（見 `configure-mcp-server` 或 `troubleshoot-mcp-connection`）。生像全抽者，提須加具結構語——返第四步。色全誤者，前置色名於提。

### 第七步：評色準

依五準評生像，承黑白規則加色特評。

```
Polychromatic Ornament Evaluation Rubric:
┌─────────────────────┬───────────────────────────────────────────────────────┐
│ Criterion           │ Evaluation Questions                                  │
├─────────────────────┼───────────────────────────────────────────────────────┤
│ 1. Palette Match    │ Do the colors in the image approximate the specified  │
│                     │ palette? Are the named colors present? Are there      │
│                     │ unwanted colors that break the palette?               │
├─────────────────────┼───────────────────────────────────────────────────────┤
│ 2. Color            │ Does the color distribution roughly follow the        │
│    Distribution     │ 60/30/10 allocation? Is the dominant color actually   │
│                     │ dominant? Does the accent appear sparingly?           │
├─────────────────────┼───────────────────────────────────────────────────────┤
│ 3. Rendering Style  │ Does the image look like the specified rendering      │
│                     │ style? Does a "glazed tile" look glossy and flat?     │
│                     │ Does "illuminated manuscript" show gold and vellum?   │
├─────────────────────┼───────────────────────────────────────────────────────┤
│ 4. Period Accuracy  │ Would this design be recognizable as belonging to     │
│                     │ the specified period? Are motifs period-appropriate?   │
│                     │ Does the color usage match period conventions?        │
├─────────────────────┼───────────────────────────────────────────────────────┤
│ 5. Form-Color       │ Does color clarify the ornamental structure or        │
│    Balance          │ obscure it? Can you "read" the motifs through the     │
│                     │ color? Does color follow form as intended?            │
└─────────────────────┴───────────────────────────────────────────────────────┘
```

1. 各準評：**強**（明達）、**足**（部分達）、**弱**（不達）
2. 各準注具察
3. 4+ 準評強者，設成
4. 2+ 準評弱者，返第四步以調提

**得：** 已評附具察。色飾較黑白難控——首生色合與分常評足。

**敗則：** 多準評弱者，提或須根本重構。常修：移色名至提之首、用較少色、明指底色、增步至 12。

### 第八步：迭或定

以針迭精設或受果。

**色特迭策：**
1. **盤校**：色誤者，置具色名於提始：「turquoise blue and gold: [rest of prompt]」
2. **分校**：明指比：「mostly turquoise blue with small gold accents」
3. **渲校**：強渲風述：「in the style of Iznik ceramic tiles, glossy glaze surface」
4. **種定色調**：留種，僅變色述以調盤而存構
5. **情變**：「vivid saturated」變「muted antique」或反之以調總色強

**迭算：** 每設念限三迭。色迭常較黑白須多提調。

1. 第七步察具弱者，施對應校策
2. 第六步重生
3. 第七步重評
4. 4+ 準評強或迭算盡時受

**得：** 1-2 迭後色準改。完盤合難望——目「可識在右色族」。

**敗則：** 迭不收者，色盤或過具至模不能可靠復。簡為較少色（3 而非 5），用較廣色述（「warm earth tones」非具 hex），或受最近近。

### 第九步：書設

建終設全記供可復與參。

1. 記下：
   - **期**：史期名與時範
   - **紋**：所用主紋
   - **渲風**：繪、彩飾、釉瓦等
   - **色盤**：各色附角與約 hex
     - 主：[色名]（~hex）— 60%
     - 次：[色名]（~hex）— 30%
     - 強：[色名]（~hex）— 10%
     - 額：[色名]（~hex）— 細/金
   - **色和**：所用法（期確、互補、類比、三和）
   - **色情**：淡、衡、或艷
   - **終提**：所受像之確提
   - **種**：復用種值
   - **分辨率**：所用分辨率
   - **步/移**：生參
   - **評**：五準評之簡注
   - **迭**：迭數與要變
2. 注生盤較史參盤
3. 注色特察（模處良或差之色）
4. 薦應用與色適注（如「盤宜屏顯」或「CMYK 印須調」）

**得：** 可復記附全色文，含 hex 約與盤析。

**敗則：** 全文覺過者，至少記終提、種、與目擬實色之列。此供未迭之復與盤調。

## 驗

- [ ] 已選具史期附其特色盤之識
- [ ] 已定 3-5 色盤附角（主/次/強）與比
- [ ] 色和法已意擇（期確、互補、類比、三和）
- [ ] 紋構已析附色至構之映
- [ ] 提含明色名與色情述
- [ ] 提指色宜渲風（繪、釉、彩飾等）
- [ ] 分辨率合應脈
- [ ] 步設 10+ 為色準
- [ ] 生像已依五點規評
- [ ] 種值已記供可復
- [ ] 終設書於提、種、盤（附 hex 約）、與參

## 陷

- **唯賴色名**：「藍」含混——指「turquoise blue」、「cobalt blue」、或「ultramarine blue」。異藍喚異期異情
- **色過多**：提中過 5 色惑模生濁。史飾常用 3-4 色加底。簡為確
- **忽底色**：背/底色與紋色同要。皮、白陶、金箔、暗石底根本變諸色之讀。明指之
- **無構基之色**：加色於構差之飾不改之。黑白版不行者，加色不助——先以 `ornament-style-mono` 修構
- **異時盤**：亮品紅、霓、或糖粉非屬史飾。顏料可得限期盤——尊限以得確
- **步不足**：色細需較黑白多步。色用 8 步常生淡或不準盤渲。用 10-12

## 參

- `ornament-style-mono` — 黑白基技；色不合時為退路，並薦為解紋構之先（加色之前）
- `review-web-design` — 色論則（反差、和、律）直施飾色構
- `meditate` — 焦注與色觀想可助盤發
