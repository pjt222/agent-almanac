---
name: ornament-style-color
locale: wenyan-ultra
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

# 飾型—色

合史色學+AI 生像作彩飾。承 `ornament-style-mono` 之構基，加期實彩盤+色和則+彩、繪、釉飾之渲法。

## 用

- 立色為傳必之飾（伊斯蘭瓦、繪本、新藝海報）
- 探諸期飾色之用—盤、分、義
- 為設計、插畫、教材作彩參圖
- 生繪、繪本、釉、彩窗之古紋
- 究飾傳中色↔形之關

## 入

- **必**：所欲期或型（或「隨機」）
- **必**：用境（緣、章、楣、板、瓦、獨紋）
- **可**：色盤好（期實、自定、特色）
- **可**：紋好（acanthus、arabesque、玫等）
- **可**：渲法好（繪、繪本、釉、彩窗、水彩）
- **可**：色情（暗/古、平/自然、烈/飽）
- **可**：解+比
- **可**：種以重生

## 行

### 一：擇期+色盤

擇期+識其色語。飾之色非偶—各期之盤本於可得之顏料、文化象、材境。

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

1. 用者指期則確並記其盤
2. 「隨機」則擇—偏色傳富者（伊、拜、哥、新藝）
3. 記材境（壁畫、馬賽克、瓦、彩窗、印）—影渲

**得：** 期+盤+材境明識。

**敗：** 用者求表外之期→以 WebSearch「[期] ornament color palette pigments」研其色語、立同條目。期顏料可得性為實導。

### 二：定色盤

譯史盤為 3-5 色具角集。

**色角框：**
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

**色和法：**
- **期實**：但用該期可得之顏料/材色
- **互補**：色輪相對（藍↔金/橙）—高反差
- **類比**：相鄰（鼠尾草綠、青、藍）—諧、微
- **三和**：等分三色（紅、藍、金）—鮮、衡

1. 擇 3-5 色+角（主、次、強、可選）
2. 擇和法
3. 賦約 hex 或描述名
4. 記情：暗/古、平/自然、烈/飽

**例盤：**
- **伊瓦**：青綠（主）、白（次）、鈷藍（強）、金（細）—類比+金—烈
- **新藝海報**：鼠尾草綠（主）、塵玫（次）、琥珀金（強）—類比—暗
- **拜馬賽**：金（主）、深藍（次）、緋紅（強）、白（細）—互補—烈

**得：** 3-5 色+角+比+和+情皆定。

**敗：** 色擇覺隨—錨於材境。問：「何顏料可得？」「何為地材？」（金箔於犢、釉於陶、漆於灰）—材限+實盤。

### 三：析紋構

解所擇紋之構文法、承單色析+色↔構映。

1. 行同 `ornament-style-mono` 步二之構析：
   - 對稱型（雙、徑、平、點）
   - 幾何架（圓、方、三角、帶）
   - 填模（實、線填、開、混）
   - 緣理（淨、有機、互鎖）

2. 加 **色↔構映**：
   - 何構元受何色？
   - 色從形（每形一色）或流（色梯越構界）？
   - 強色於何處？（焦點、交、細元）
   - 地/背為何色？

**例映：**
```
Islamic Star Pattern:
- Star forms: turquoise (dominant)
- Interlocking geometric ground: white (secondary)
- Star center details: cobalt blue (accent)
- Outline/border: gold (detail)
→ Color follows form strictly — each geometric shape is one flat color
```

**得：** 構述+各構元之具色賦。

**敗：** 映不明→以 WebSearch「[期] [紋] ornament color」覽史例—史飾幾必以色明構、勿掩。

### 四：構彩 prompt

立 Z-Image 生用之文 prompt、含色+渲法。

**Prompt 模：**
```
[Rendering style] of [motif name] ornament in the [period] style,
[composition type], [color palette description],
[color mood], [structural details from Step 3],
[application context], [additional qualifiers]
```

**色適渲法：**
- `painted ornament`—筆觸見、實色、壁畫/油畫質
- `illuminated manuscript`—金箔、富寶色、犢地
- `glazed ceramic tile`—亮面、平色、緣精
- `stained glass`—透色、形間黑鉛
- `watercolor illustration`—透洗、軟緣、紙見
- `enamel on metal`—硬亮色、金地
- `mosaic`—小磚、間隙見、明
- `printed poster`—平色區、新藝/工藝美

**Prompt 中色描：**
- 名具色：「turquoise blue and gold on white ground」
- 述情：「muted antique tones」或「vivid saturated jewel colors」
- 述分：「blue dominant with gold accents」或「warm earth tones with red details」

**例 prompt：**
- `glazed ceramic tile ornament in the Islamic style, geometric star pattern, turquoise blue and white with cobalt blue accents and gold outlines, vivid saturated colors, repeating tessellation, Iznik tilework quality`
- `illuminated manuscript border in the Gothic style, vine and trefoil ornament, ultramarine blue and ruby red with gold leaf details on cream vellum, rich jewel tones, vertical panel, medieval book of hours quality`
- `watercolor illustration of Art Nouveau floral ornament, whiplash curves with lily motif, sage green and dusty rose with amber gold accents, muted organic tones, vertical panel, Alphonse Mucha influence`

**得：** 25-50 字 prompt、明渲法、紋、期、構、色。

**敗：** 生色不合盤→色描置 prompt 前（紋前）—Z-Image 重前 token。亦可名具 hex 或顏料名（ultramarine、vermillion、ochre）。

### 五：配生參

擇解+生參。彩飾常須步多於單色。

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

1. 依用境擇解
2. 設 `steps` 10-12（色細+盤準須多步）
3. 設 `shift` 為 3（默）
4. 探則 `random_seed: true`、重生則 `random_seed: false`+具種
5. 錄諸參備案

**得：** 全參定。彩飾通須 ≥ 10 步以盤忠。

**敗：** 不定→1024x1024 + 10 步—諸彩境之穩默。

### 六：生像

呼 Z-Image MCP 具：

1. 呼 `mcp__hf-mcp-server__gr1_z_image_turbo_generate`：
   - `prompt`：步四所立
   - `resolution`：步五
   - `steps`：步五（薦 10-12）
   - `shift`：步五
   - `random_seed`：步五
   - `seed`：若 `random_seed` 為假則具種
2. 錄返之種以重生
3. 記生時

**得：** 生像有可識飾形+見色。色或非全合—評時治之。

**敗：** MCP 不可達→驗 hf-mcp-server 已配（見 `configure-mcp-server`/`troubleshoot-mcp-connection`）。生像全抽→prompt 須具構語—回步四。色全錯→色名置 prompt 前。

### 七：評色忠

依五準評。

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

1. 各準評：**強**（合）、**足**（半合）、**弱**（不合）
2. 各準記具觀
3. 4+ 準強→成
4. 2+ 準弱→回步四改 prompt

**得：** 評有具觀。彩比單難控—初生盤+分多為「足」。

**敗：** 多弱→prompt 須根本重構。常修：色名置 prompt 至前、減色、明指地色、增步至 12。

### 八：迭或定

針對性迭或受。

**色迭策：**
1. **盤糾**：色錯→具色名於 prompt 前：「turquoise blue and gold: [餘]」
2. **分糾**：明述比：「mostly turquoise blue with small gold accents」
3. **渲糾**：強渲法描：「in the style of Iznik ceramic tiles, glossy glaze surface」
4. **鎖種調色**：保種、僅變色描以調盤、保構
5. **情移**：「vivid saturated」改「muted antique」反之以調色強度

**迭預算：** 各概念限 3 迭。彩比單須更多 prompt 調。

1. 步七示弱→施對應糾策
2. 重生（步六）
3. 重評（步七）
4. 4+ 準強或預算盡→受

**得：** 1-2 迭後色忠改善。完盤合難—求「可識為合色族」即可。

**敗：** 迭不收→盤或過具於模能重—簡至少色（5→3）、用廣描（「warm earth tones」非具 hex）、或受最近之近似。

### 九：錄設計

立全錄以重+參。

1. 錄：
   - **期**：期名+期間
   - **紋**：主紋
   - **渲法**：繪、繪本、釉等
   - **色盤**：各色+角+約 hex
     - Dominant: [色名] (~hex) — 60%
     - Secondary: [色名] (~hex) — 30%
     - Accent: [色名] (~hex) — 10%
     - Additional: [色名] (~hex) — 細/金
   - **色和**：所用法（期實、互補、類比、三和）
   - **色情**：暗、平、烈
   - **終 prompt**：生受像之確 prompt
   - **種**：以重生
   - **解**：所用解
   - **Steps/Shift**：生參
   - **評**：五準分簡記
   - **迭**：迭數+主變
2. 記生盤↔史盤之比
3. 記色觀（模處色佳/劣者）
4. 薦用+色適註（如「盤適屏顯」或「需 CMYK 印調」）

**得：** 可重之錄、全色文+hex 約+盤析。

**敗：** 全錄覺繁→至少錄終 prompt、種、欲↔實色單—足以重+後迭調盤。

## 驗

- [ ] 具期擇+具特盤識
- [ ] 3-5 色盤定+角（主/次/強）+比
- [ ] 色和明擇（期實、互補、類比、三和）
- [ ] 紋構析+色↔構映
- [ ] prompt 含具色名+情描
- [ ] prompt 述色適渲法（繪、釉、繪本等）
- [ ] 解合用境
- [ ] steps ≥ 10 以色忠
- [ ] 生像依五準評
- [ ] 種錄以重
- [ ] 終設計錄含 prompt、種、盤（hex 約）、參

## 忌

- **但賴色名**：「藍」歧—具「青綠」「鈷」「群青」—諸藍各喚異期+情
- **色過多**：> 5 色於 prompt 惑模生濁—史飾通 3-4 色+地—節為實
- **忽地色**：背地色與紋色同要—犢、白瓷、金箔、暗石各根本變諸他色之讀—明指
- **無構之色**：劣構加色不善—單色版不工則加色亦不工—先以 `ornament-style-mono` 修構
- **時代錯盤**：亮洋紅、霓虹、糖彩不屬史飾—顏料可得限期盤—守限以實
- **步不足**：色細須步多於單色—8 步多生洗白或盤不準—用 10-12

## 參

- `ornament-style-mono`
- `review-web-design`
- `meditate`
