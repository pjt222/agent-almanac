---
name: ornament-style-color
locale: wenyan-lite
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

# 紋飾風——彩

結合藝術史色彩知識與 AI 輔助影像生成，設計多彩紋飾模式。本技能於 `ornament-style-mono` 之結構基礎上加時代真確之色彩調色板、色彩和諧原則，及適於繪、彩飾與釉之紋飾渲染風格。

## 適用時機

- 創作色彩為傳統不可分之裝飾設計（如伊斯蘭瓷磚、彩飾手稿、新藝術海報）
- 探索諸時代之紋飾用色——調色、分配與象徵意涵
- 為設計、插圖或教育材料製作彩色參考影像
- 生成古典圖案之繪、彩飾、釉或彩繪玻璃渲染
- 研究紋飾傳統中色彩與形式之關係

## 輸入

- **必要**：所欲之歷史時代或風格（或「驚我」以隨機擇）
- **必要**：應用上下文（邊框、徽章、橫飾帶、面板、瓷磚、獨立圖案）
- **選擇性**：色彩調色板偏好（時代真確、自定或特定色）
- **選擇性**：特定圖案偏好（茛苕、阿拉伯式、玫瑰花飾等）
- **選擇性**：渲染風格偏好（繪、彩飾、釉瓷磚、彩繪玻璃、水彩）
- **選擇性**：色彩情緒（沉靜/古樸、平衡/自然、鮮明/飽和）
- **選擇性**：目標解析度與長寬比
- **選擇性**：可重現生成之種子值

## 步驟

### 步驟一：擇歷史時代與調色板

擇時代並辨其特徵色彩語言。紋飾之色從非任意——每時代皆有調色板，根於可得顏料、文化象徵與材料上下文。

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

1. 若用戶指定時代，確認並記其特徵調色板
2. 若「驚我」，隨機擇——偏向具豐富色彩傳統之時代（伊斯蘭、拜占庭、哥德、新藝術）
3. 記材料上下文（壁畫、馬賽克、瓷磚、彩繪玻璃、版印），此影響色彩之渲染

**預期：** 已明辨時代及其特徵調色板與材料上下文。

**失敗時：** 若用戶請求未在表中之時代，以 WebSearch 查「[period] ornament color palette pigments」研究其色彩語言並構建同等條目。歷史顏料可得性乃時代真確色彩之可靠指南。

### 步驟二：定義調色板

將歷史調色板譯為具角色之具體 3-5 色集。

**色彩角色框架：**
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

**色彩和諧法：**
- **時代真確**：但用該時代顏料與材料可得之色
- **互補**：色輪上相對之色（如藍與金/橙）——強對比
- **類似**：相鄰之色（如鼠尾草綠、青、沉靜藍）——和諧、微妙
- **三方**：等距三色（如紅、藍、金）——鮮明、平衡

1. 擇 3-5 色，附命名角色（主色、次色、強調、可選）
2. 擇和諧法
3. 賦近似十六進值或描述性色名
4. 記色彩情緒：沉靜/古樸、平衡/自然或鮮明/飽和

**例調色板定義：**
- **伊斯蘭瓷磚**：綠松石（主）、白（次）、鈷藍（強調）、金（細）——類似 + 金屬——鮮明
- **新藝術海報**：鼠尾草綠（主）、灰玫瑰（次）、琥珀金（強調）——類似——沉靜
- **拜占庭馬賽克**：金（主）、深藍（次）、深紅（強調）、白（細）——互補——鮮明

**預期：** 3-5 個命名色之調色板，附角色、比例、和諧法與情緒之定義。

**失敗時：** 若色彩擇取感任意，錨於時代之材料上下文。問：「物理上何顏料可得？」與「地基材料為何？」（金箔於羊皮紙、釉於陶、塗料於灰泥）。材料約束並真確化調色板。

### 步驟三：分析圖案結構

了解所擇圖案之結構文法，以色彩對結構之映射擴展單色分析。

1. 行 `ornament-style-mono` 步驟二之同結構分析：
   - 對稱類型（雙邊、輻射、平移、點）
   - 幾何骨架（圓、矩形、三角、帶）
   - 填充模式（實心、線填、開放、混合）
   - 邊緣處理（潔淨、有機、互鎖）

2. 加 **色彩對結構之映射**：
   - 何結構元素受何色？
   - 色彩隨形（每形得一色）還是流（色梯度跨結構邊界）？
   - 強調色於何處現？（通常於焦點、交點或小細節元素）
   - 地基/背景為何色？

**例映射：**
```
Islamic Star Pattern:
- Star forms: turquoise (dominant)
- Interlocking geometric ground: white (secondary)
- Star center details: cobalt blue (accent)
- Outline/border: gold (detail)
→ Color follows form strictly — each geometric shape is one flat color
```

**預期：** 含每結構元素之明確色彩賦予之結構描述。

**失敗時：** 若色彩對結構之映射不明，以 WebSearch 查「[period] [motif] ornament color」研究歷史範例，觀色彩實際如何用。歷史紋飾幾乎恆以色彩澄清結構，非遮之。

### 步驟四：構建色彩提示

為 Z-Image 生成構建文字提示，納入調色板與渲染風格。

**提示範本：**
```
[Rendering style] of [motif name] ornament in the [period] style,
[composition type], [color palette description],
[color mood], [structural details from Step 3],
[application context], [additional qualifiers]
```

**色彩適合之渲染風格：**
- `painted ornament` — 筆觸可見、不透明色、壁畫或油畫品質
- `illuminated manuscript` — 金箔、豐富寶石色調、羊皮紙地基
- `glazed ceramic tile` — 光面、平色、精準邊緣
- `stained glass` — 半透色、形間黑色鉛條
- `watercolor illustration` — 透明渲染、軟邊、紙可見
- `enamel on metal` — 硬光面色、金屬地基
- `mosaic` — 小石片、片間可見縫、發光
- `printed poster` — 平色區、新藝術或工藝美術品質

**提示中之色彩描述：**
- 命具體色：「綠松石藍與金於白地基」
- 描情緒：「沉靜古樸色調」或「鮮明飽和寶石色」
- 指分配：「藍主，金強調」或「暖土色調與紅細節」

**例提示：**
- `glazed ceramic tile ornament in the Islamic style, geometric star pattern, turquoise blue and white with cobalt blue accents and gold outlines, vivid saturated colors, repeating tessellation, Iznik tilework quality`
- `illuminated manuscript border in the Gothic style, vine and trefoil ornament, ultramarine blue and ruby red with gold leaf details on cream vellum, rich jewel tones, vertical panel, medieval book of hours quality`
- `watercolor illustration of Art Nouveau floral ornament, whiplash curves with lily motif, sage green and dusty rose with amber gold accents, muted organic tones, vertical panel, Alphonse Mucha influence`

**預期：** 25-50 字之提示，指明渲染風格、圖案、時代、組成與明確色彩資訊。

**失敗時：** 若提示生不合調色板之色，將色彩描述前置（置於圖案描述之前）。Z-Image 對較早之提示權重較重。亦可命名特定十六進色或著名顏料名（群青、朱紅、赭）。

### 步驟五：配置生成參數

擇解析度與生成參數。彩紋飾常自比單色多之推理步驟受益。

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

1. 依應用上下文擇解析度
2. 將 `steps` 設為 10-12 用於彩工（色彩細節與調色板準確自更多步受益）
3. 將 `shift` 設為 3（預設）
4. 為探索擇 `random_seed: true`，或為可重現以特定種子設 `random_seed: false`
5. 記所有參數以為文件

**預期：** 完整參數集。注意彩紋飾通常需 10+ 步以求調色板忠實。

**失敗時：** 若不確定，用 1024x1024 於 10 步。此乃多數彩紋飾上下文之可靠預設。

### 步驟六：生成影像

呼 Z-Image MCP 工具以製紋飾。

1. 呼 `mcp__hf-mcp-server__gr1_z_image_turbo_generate`，附：
   - `prompt`：步驟四構之提示
   - `resolution`：步驟五
   - `steps`：步驟五（建議 10-12）
   - `shift`：步驟五
   - `random_seed`：步驟五
   - `seed`：若 `random_seed` 為假則具體種子
2. 記返之種子值以可重現
3. 記生成時間

**預期：** 含可辨紋飾形式與可見色之生成影像。色彩或不完美匹指定調色板——此於評估中處理。

**失敗時：** 若 MCP 工具不可用，驗 hf-mcp-server 已配（見 `configure-mcp-server` 或 `troubleshoot-mcp-connection`）。若生成影像全抽象，提示需更具體之結構語言——回步驟四。若色全錯，將色名前置。

### 步驟七：評估色彩忠實

對五準則評估生成影像，以色彩特定評估擴展單色標尺。

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

1. 對每準則評：**強**（明確符合）、**足**（部分符合）、**弱**（不符合）
2. 對每準則記具體觀察
3. 若 4+ 準則評為強，設計成功
4. 若 2+ 準則評為弱，回步驟四以修提示

**預期：** 含具體觀察之評分。彩紋飾較單色難控——首次生成於調色板匹與分配上預期得「足」分。

**失敗時：** 若多數準則評為弱，提示或須根本重構。常見修正：將色名移至提示之最前、用較少色、明指地基色、增步至 12。

### 步驟八：迭代或定稿

透過針對性迭代精煉設計或接受結果。

**色彩特定迭代策略：**
1. **調色板修正**：若色錯，將具體色名置於提示之始：「turquoise blue and gold: [rest of prompt]」
2. **分配修正**：明述比例：「mostly turquoise blue with small gold accents」
3. **渲染修正**：強化渲染風格描述：「in the style of Iznik ceramic tiles, glossy glaze surface」
4. **種子鎖定之色彩調**：保種子，但變色描以調調色板而保組成
5. **情緒轉**：將「鮮明飽和」改為「沉靜古樸」或反之以調總體色彩強度

**迭代預算：** 每設計概念限 3 迭代。彩迭代常較單色需更多提示調整。

1. 若步驟七之評估指出具體弱點，施對應之修正策略
2. 用步驟六重生
3. 用步驟七重評
4. 4+ 準則評為強或迭代預算耗盡時接受

**預期：** 1-2 迭代後色彩忠實改進。完美調色板匹不可能——求「可辨於正確色族」。

**失敗時：** 若迭代不收斂，調色板或對模型過於具體而難可靠重現。簡化至更少色（3 而非 5）、用更廣之色描述（「暖土色調」而非具體十六進值），或接受最近近似。

### 步驟九：記錄設計

為可重現與參考建終設計之完整記錄。

1. 記下：
   - **時代**：歷史時代名與日期範圍
   - **圖案**：所用之主圖案
   - **渲染風格**：繪、彩飾、釉瓷磚等
   - **調色板**：每色附其角色與近似十六進值
     - 主色：[color name] (~hex) — 60%
     - 次色：[color name] (~hex) — 30%
     - 強調：[color name] (~hex) — 10%
     - 額外：[color name] (~hex) — 細節/金屬
   - **色彩和諧**：所用之法（時代真確、互補、類似、三方）
   - **色彩情緒**：沉靜、平衡或鮮明
   - **終提示**：產出所接受影像之確切提示
   - **種子**：再現之種子值
   - **解析度**：所用之解析度
   - **Steps/Shift**：生成參數
   - **評估**：對五準則評分之簡記
   - **迭代**：迭代次數與所施關鍵變更
2. 記生成之調色板較歷史參考調色板如何
3. 記任何色彩特定觀察（模型處理良好或差之色）
4. 建議潛在應用與色彩適配記（如「調色板適合螢幕顯示」或「需調以 CMYK 印刷」）

**預期：** 可重現之記錄，附完整色彩文件含十六進近似與調色板分析。

**失敗時：** 若完整文件感過繁，至少記終提示、種子及預期 vs 實際色之表。此可於未來迭代中再現並調整調色板。

## 驗證

- [ ] 已擇具體歷史時代並辨其特徵調色板
- [ ] 已定義 3-5 色之調色板，附角色（主/次/強調）與比例
- [ ] 已自覺擇色彩和諧法（時代真確、互補、類似、三方）
- [ ] 已分析圖案結構並映射色彩於結構
- [ ] 提示含明確色名與色彩情緒描述
- [ ] 提示指明色彩適合之渲染風格（繪、釉、彩飾等）
- [ ] 解析度合於應用上下文
- [ ] Steps 設為 10+ 以求色彩忠實
- [ ] 已對五點標尺評估生成影像
- [ ] 已記種子值以可重現
- [ ] 終設計已以提示、種子、調色板（含十六進近似）與參數記錄

## 常見陷阱

- **僅依色名**：「藍」歧義——指明「綠松石藍」、「鈷藍」或「群青藍」。不同藍喚不同之時代與情緒
- **色過多**：提示中過 5 色混淆模型，產渾濁結果。歷史紋飾通常用 3-4 色加地基。節制乃真確
- **忽略地基色**：背景/地基色與圖案色同要。奶油羊皮紙、白瓷、金箔或暗石地基根本變所有他色之讀法。明指之
- **色無結構基礎**：對結構不善之紋飾加色不能改之。若單色版不可，加色不助——先以 `ornament-style-mono` 修結構
- **時代錯之調色板**：鮮品紅、霓虹色或糖果粉彩不屬歷史紋飾。顏料可得性約束時代調色板——尊敬約束以求真確結果
- **步不足**：色細節較單色需更多推理步。色工用 8 步常產褪色或不精準之調色板渲染。用 10-12

## 相關技能

- `ornament-style-mono` — 單色基礎技能；色彩不合作時恆為備用，並建議為加色前了解圖案結構之首步
- `review-web-design` — 色彩理論原則（對比、和諧、節奏）直接適用於紋飾色彩組成
- `meditate` — 專注注意與色彩視覺化練習可助調色板開發
