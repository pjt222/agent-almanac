---
name: ornament-style-modern
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Design ornamental patterns using modern and speculative aesthetics with colorblind-accessible
  color scales. Breaks free from historical period constraints to explore cyberpunk, solarpunk,
  biopunk, brutalist, vaporwave, and other contemporary genres. Includes CVD (Color Vision
  Deficiency) awareness and perceptually uniform scales (viridis, cividis, inferno). Use when
  creating ornamental designs in modern or genre-specific aesthetics, designing patterns that
  must be colorblind-accessible, or exploring hybrid motifs combining historical ornament with
  contemporary visual language.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: design
  complexity: intermediate
  language: natural
  tags: design, ornament, modern, colorblind, accessibility, cyberpunk, sci-fi, generative-ai, z-image
---

# 飾型—今

以今+幻美學作飾、用色盲友色階。脫史期之囿—鼓誤代、迎雜紋、盤本於覺均之普惠色階。

此乃 `ornament-style-mono`/`ornament-style-color` 之「縱」伴。彼錨於史忠、此錨於型一致、色普惠、藝由。

## 用

- 立今、幻、型特之飾（cyberpunk、solarpunk、brutalist 等）
- 立科學色盲友盤
- 探史飾↔今語之雜
- 為數位境（UI、遊戲、屏媒）作飾、史忠非標
- CVD 安為求之飾
- 純抽或算法飾、無史參
- 跨文跨期合紋、不慮誤代

## 入

- **必**：型/美向（或「隨機」，或「無型」純抽）
- **必**：用境（緣、章、楣、板、瓦、獨紋、UI）
- **可**：色階好（viridis、cividis、inferno、magma、plasma 等）或自盤
- **可**：CVD 型（protanopia、deuteranopia、tritanopia 或「皆」）
- **可**：具紋元（電路、有機、幾何格等）
- **可**：渲法（digital、holographic、neon、3D、glitch 等）
- **可**：史雜元（如「Gothic 花飾+電路板」）
- **可**：解+比
- **可**：種以重生

## 行

### 一：擇型/美

擇今或幻美為視基。型流動、鼓混雜。

```
Modern and Speculative Aesthetics:
+-----------------------+--------------------------+-----------------------------------+-----------------------------+
| Genre                 | Visual Character         | Motif Language                    | Color Tendency              |
+-----------------------+--------------------------+-----------------------------------+-----------------------------+
| Cyberpunk             | Neon-on-dark, circuit,   | Circuit traces, kanji, hexagons,  | Neon cyan/magenta on black  |
|                       | tech, glitch             | fractured glass, data streams     |                             |
+-----------------------+--------------------------+-----------------------------------+-----------------------------+
| Hard Sci-Fi           | Clean, technical,        | Engineering diagrams, orbital     | Cool metallics, deep space  |
|                       | precise                  | paths, crystalline lattice        | blue                        |
+-----------------------+--------------------------+-----------------------------------+-----------------------------+
| Solarpunk             | Organic-tech fusion,     | Leaf/vine + solar panel, living   | Greens, warm amber,         |
|                       | verdant                  | architecture, moss on circuit     | sunlight                    |
+-----------------------+--------------------------+-----------------------------------+-----------------------------+
| Biopunk               | Organic, visceral,       | DNA helix, cell structure,        | Deep organics,              |
|                       | grown                    | mycelium, coral, nerve networks   | bioluminescent              |
+-----------------------+--------------------------+-----------------------------------+-----------------------------+
| Brutalist             | Raw, monumental,         | Concrete texture, massive         | Grays, concrete,            |
|                       | geometric                | geometry, exposed grid, slab      | industrial                  |
+-----------------------+--------------------------+-----------------------------------+-----------------------------+
| Art Deco Revival      | Geometric elegance,      | Sunburst, chevron, ziggurat, fan, | Gold, black, cream,         |
|                       | luxury                   | stepped forms                     | emerald                     |
+-----------------------+--------------------------+-----------------------------------+-----------------------------+
| Vaporwave             | Retro-digital, surreal   | Classical busts (glitched), grid, | Pink/teal/purple gradients  |
|                       |                          | gradient, marble                  |                             |
+-----------------------+--------------------------+-----------------------------------+-----------------------------+
| Retrofuturism         | 1950s-60s future vision  | Atomic/Space Age, streamline, ray | Chrome, turquoise, coral    |
|                       |                          | gun, fin, orbit                   |                             |
+-----------------------+--------------------------+-----------------------------------+-----------------------------+
| Generative /          | Mathematical,            | Voronoi, reaction-diffusion,      | Any scale -- often viridis  |
| Algorithmic           | procedural               | L-system, noise field, fractal    | family                      |
+-----------------------+--------------------------+-----------------------------------+-----------------------------+
| Afrofuturism          | Ancestral + futuristic   | Adinkra, kente geometry, cosmic,  | Rich earth + metallic +     |
|                       |                          | mask, constellation               | electric                    |
+-----------------------+--------------------------+-----------------------------------+-----------------------------+
```

**他支模：**
- **自定美**：表外之向
- **史雜**：合史期+今型（如「Byzantine cyberpunk」「Islamic 生成」）
- **無型/純抽**：但構、色階、構圖、無型敘

1. 用者指型則確並記其視性、紋語、色傾
2. 「隨機」則擇—偏飾力強者（cyberpunk、solarpunk、生成、Art Deco Revival）
3. 史雜→識史紋彙+今渲/情之疊
4. 記用境（屏、印、物）—影渲擇

**得：** 型（或雜）明識、視語明。雜則兩源皆述。

**敗：** 用者求表外之型→以 WebSearch「[型] aesthetic visual design motifs」研、立同條目。要識：視性、典紋、色傾。

### 二：擇色策

擇色盲友階或自盤。色盲階為薦默。

**徑甲：色盲友階（薦）**

擇覺均、普讀之階：

```
Colorblind-Accessible Color Scales:
+------------+---------------+--------------------+-----------------------------+-------------------------+
| Scale      | Type          | CVD Safe           | Character                   | Best For                |
+------------+---------------+--------------------+-----------------------------+-------------------------+
| Viridis    | Sequential    | All 3 types        | Blue-green-yellow, balanced | Default recommendation  |
+------------+---------------+--------------------+-----------------------------+-------------------------+
| Cividis    | Sequential    | Deutan + Protan    | Blue-to-yellow, muted       | Maximum CVD safety      |
|            |               | optimized          |                             |                         |
+------------+---------------+--------------------+-----------------------------+-------------------------+
| Inferno    | Sequential    | All 3 types        | Black-red-yellow-white, hot | Dramatic, high contrast |
+------------+---------------+--------------------+-----------------------------+-------------------------+
| Magma      | Sequential    | All 3 types        | Black-purple-orange-yellow  | Moody, volcanic         |
+------------+---------------+--------------------+-----------------------------+-------------------------+
| Plasma     | Sequential    | All 3 types        | Purple-pink-orange-yellow   | Vivid, energetic        |
+------------+---------------+--------------------+-----------------------------+-------------------------+
| Turbo      | Rainbow-like  | Moderate           | Full spectrum, perceptual   | Many distinct colors    |
+------------+---------------+--------------------+-----------------------------+-------------------------+
| Mako       | Sequential    | All 3 types        | Dark blue to light teal     | Cool, oceanic           |
+------------+---------------+--------------------+-----------------------------+-------------------------+
| Rocket     | Sequential    | All 3 types        | Dark to light via warm      | Warm, ember-like        |
|            |               |                    | tones                       |                         |
+------------+---------------+--------------------+-----------------------------+-------------------------+
| Okabe-Ito  | Categorical   | All 3 types        | 8 distinct colors           | Discrete elements, max  |
|            |               |                    |                             | distinction             |
+------------+---------------+--------------------+-----------------------------+-------------------------+
```

```
CVD Types and Impact:
+-----------------------------+----------+-----------------+------------------------------+
| CVD Type                    | Affects  | Confuses        | Safe Scales                  |
+-----------------------------+----------+-----------------+------------------------------+
| Protanopia (red-blind)      | ~1% male | Red/green       | viridis, cividis, inferno    |
+-----------------------------+----------+-----------------+------------------------------+
| Deuteranopia (green-blind)  | ~5% male | Red/green       | viridis, cividis, inferno    |
+-----------------------------+----------+-----------------+------------------------------+
| Tritanopia (blue-yellow)    | ~0.01%   | Blue/yellow     | inferno, magma (with care)   |
+-----------------------------+----------+-----------------+------------------------------+
```

**連階轉飾盤：**
於階上等距採 3-5 色。viridis 5 色：
- 0.0：deep purple (#440154)
- 0.25：blue-violet (#31688e)
- 0.5：teal green (#35b779)
- 0.75：yellow-green (#90d743)
- 1.0：bright yellow (#fde725)

依 60/30/10 賦角（主、次、強）。

**徑乙：自盤**

自由擇盤+CVD 模擬：
1. 定 3-5 色+角
2. 可以 WebSearch「CVD color simulator [colors]」驗
3. 記 CVD 險+緩（如加紋理或形以補色）

**得：** 3-5 色+角，自階採或自定，CVD 兼容已記。

**敗：** 不定→viridis + 3 色（深紫、青綠、黃）—最普惠+衡。

### 三：析紋構

析所擇紋之構文法、同史技、惟明許今構技。

1. 構析：
   - **對稱**：雙、徑、平、點，或 *glitch 破*、程序非對稱、偽隨機
   - **幾何架**：圓、方、三角、帶，或 voronoi、分形、reaction-diffusion 場
   - **填模**：實、線填、開、混，或梯、噪紋、料驅
   - **緣理**：淨、有機、互鎖，或 glitch、解體、像素步

2. **色↔構映**：
   - 何構元受階之何色？
   - 色從形或流（梯越界）？
   - 階之最亮/最淡於何處？（焦點）
   - 地/背為何色？

3. **今構技**（此技獨）：
   - **雜紋**：史飾構+今渲（Gothic 花飾渲為電路板）
   - **非傳對稱**：故破對稱、glitch 痕、復模內程序變
   - **層構**：飾疊紋理、透效、景深糊
   - **元飾**：飾紋由更小飾紋成（分形巢）

**得：** 構述+具色賦+今構技。

**敗：** 紋構不明於今型→錨於型實視先例。Cyberpunk 電路依帶架+平移對稱。生成/算法用徑或場架。紋語或新、構文法則普。

### 四：構今 prompt

立 Z-Image 用 prompt：

**Prompt 模：**
```
[Rendering style] of [genre]-inspired ornamental design,
[motif description], [color scale or palette],
[composition type], [mood/atmosphere],
[application context], [additional qualifiers]
```

**今渲法：**
- `digital art`—淨數渲、屏備、平梯
- `holographic`—虹彩、多角色移
- `neon sign`—暗地之亮線、光暈、熱緣
- `3D render`—體積、燈、材質、深
- `glitch art`—數損、掃線痕、色道分
- `vector graphic`—平、淨緣、可放、幾何精
- `screen print`—限色、套印標、墨質、有觸
- `laser etched`—精、金面、燒蝕、技
- `generative art`—程序、算法、數精
- `concept art`—畫意、氣氛、敘、影燈

**Prompt 中色階：**
譯階名為描述色語：
- **Viridis**：「deep purple transitioning through teal green to bright yellow」
- **Cividis**：「steel blue transitioning to golden yellow」
- **Inferno**：「black through deep red and orange to bright yellow-white」
- **Magma**：「black through dark purple and burnt orange to pale yellow」
- **Plasma**：「deep indigo through magenta and orange to bright yellow」
- **Mako**：「deep navy blue transitioning to light aqua teal」
- **Rocket**：「dark brown-black through brick red to pale cream」

**例 prompt：**
- `neon sign ornamental design inspired by cyberpunk aesthetic, circuit trace patterns and hexagonal grid, deep purple and teal green and bright yellow colors (viridis palette), repeating border frieze, electric and atmospheric, dark background with glowing elements`
- `digital art of solarpunk-inspired ornamental panel, vine and leaf motifs intertwined with solar cell geometry, steel blue to golden yellow gradient (cividis palette), vertical panel composition, warm and hopeful atmosphere, organic-technology fusion`
- `generative art ornamental tile, algorithmic reaction-diffusion pattern, dark purple through burnt orange to pale yellow (magma palette), square repeating unit, mathematical and volcanic, procedural organic quality`
- `3D render of Art Deco Revival ornamental medallion with brutalist influence, sunburst and ziggurat geometry in raw concrete and gold, deep indigo through magenta to bright yellow (plasma palette), radial symmetry, monumental elegance`

**得：** 25-50 字 prompt、述渲、型、紋、色階/盤、構、情。

**敗：** 生色不合階→色描置前。勿名階、起首即描色：「deep purple, teal green, and bright yellow ornamental design...」—Z-Image 重前 token。

### 五：配生參

```
Resolution by Application:
+--------------------+---------------------+----------------------------------------+
| Application        | Recommended         | Rationale                              |
+--------------------+---------------------+----------------------------------------+
| Medallion / Roundel| 1024x1024 (1:1)     | Radial symmetry needs square           |
+--------------------+---------------------+----------------------------------------+
| Tile / Repeat Unit | 1024x1024 (1:1)     | Square for seamless tiling             |
+--------------------+---------------------+----------------------------------------+
| Horizontal Frieze  | 1280x720 (16:9)     | Wide format for running border         |
+--------------------+---------------------+----------------------------------------+
| Vertical Panel     | 720x1280 (9:16)     | Portrait format for columns            |
+--------------------+---------------------+----------------------------------------+
| Wide Border        | 1344x576 (21:9)     | Ultrawide for architectural            |
+--------------------+---------------------+----------------------------------------+
| UI Element         | 1152x896 (9:7)      | Balanced landscape for screen use      |
+--------------------+---------------------+----------------------------------------+
| Large Detail       | 1536x1536 (1:1)     | Higher res for fine gradient work      |
+--------------------+---------------------+----------------------------------------+
```

1. 依用境擇解
2. 設 `steps` 10-12（梯細+階忠須多步）
3. 設 `shift` 為 3 默，或 4 為 neon 暗地高反差
4. 探則 `random_seed: true`、重生則 `random_seed: false`+具種
5. 錄諸參備案

**得：** 全參定。梯階須 ≥ 10 步以滑變。

**敗：** 不定→1024x1024 + 10 步 + shift 3。但 neon/亮/高反差 用 shift 4。

### 六：生像

呼 Z-Image MCP：

1. 呼 `mcp__hf-mcp-server__gr1_z_image_turbo_generate`：
   - `prompt`：步四
   - `resolution`：步五
   - `steps`：步五（薦 10-12）
   - `shift`：步五
   - `random_seed`：步五
   - `seed`：若 `random_seed` 為假則具種
2. 錄返之種以重生
3. 記生時

**得：** 生像有可識飾構+見色梯/盤。色或非全合階—評時治之。

**敗：** MCP 不可達→驗 hf-mcp-server 已配（見 `configure-mcp-server`/`troubleshoot-mcp-connection`）。生像全抽無構→prompt 須具構語—回步四。色全錯→色名置前。

### 七：評設計

依五準（為今飾調）評。

```
Modern Ornament Evaluation Rubric:
+---------------------+------------------------+-------------------------------------------+
| Criterion           | Replaces (from color)  | Evaluation Questions                      |
+---------------------+------------------------+-------------------------------------------+
| 1. Genre Coherence  | Period Accuracy        | Does it feel like the specified genre?    |
|                     |                        | Would someone familiar with the genre     |
|                     |                        | recognize the aesthetic?                  |
+---------------------+------------------------+-------------------------------------------+
| 2. Color Scale      | Palette Match          | Does the color gradient/palette           |
|    Fidelity         |                        | approximate the chosen scale? Are the     |
|                     |                        | key colors from the scale present?        |
+---------------------+------------------------+-------------------------------------------+
| 3. Accessibility    | (new criterion)        | Would this be distinguishable under the   |
|                     |                        | target CVD type? Do elements rely solely  |
|                     |                        | on color or also on shape/texture?        |
+---------------------+------------------------+-------------------------------------------+
| 4. Composition      | Form-Color Balance     | Does the ornamental structure read        |
|    Quality          |                        | clearly? Does color clarify or obscure    |
|                     |                        | the motif?                                |
+---------------------+------------------------+-------------------------------------------+
| 5. Rendering Style  | Rendering Style        | Does it match the specified rendering     |
|                     |                        | technique? Does a "neon sign" glow?       |
|                     |                        | Does "glitch art" show artifacts?         |
+---------------------+------------------------+-------------------------------------------+
```

1. 各準評：**強**、**足**、**弱**
2. 各準記具觀
3. 4+ 準強→成
4. 2+ 準弱→回步四改 prompt

**得：** 評有具觀。今+梯階比平史盤難控—初生階忠多為「足」。

**敗：** 多弱→prompt 須根本重構。常修：色描置前、簡至少色（5→3）、強型語、增步至 12。

### 八：迭或定

針對性迭或受。

**今迭策：**
1. **階採移**：viridis 派盤過壓→於階異位採（如略中、用端+一偏中）
2. **型放大**：型不顯→加型詞：「cyberpunk neon circuitry」非但「cyberpunk」
3. **色前置**：具色描置 prompt 至前
4. **鎖種調色**：保種、僅變色描以調盤、保構
5. **渲糾**：強渲法+材語：「glowing neon tubes on matte black surface」非但「neon sign」
6. **普惠強**：CVD 弱→增鄰元反差+加結構分（紋、模、大小）+色

**迭預算：** 各概念限 3 迭。

1. 步七示弱→施對應策
2. 重生（步六）
3. 重評（步七）
4. 4+ 準強或預算盡→受

**得：** 1-2 迭後型一致+色忠改善。完階重難—求「可識為合色族+正進向」即可。

**敗：** 迭不收→階或過微難為梯—簡至少色（5→3）+明名。或受最近近似+錄偏。

### 九：錄設計

立全錄以重+參。

1. 錄：
   - **型**：型/美名+雜元
   - **紋**：主紋+構文法
   - **渲法**：digital、neon、glitch、3D 等
   - **色階**：階名+採點，或自盤
     - 階：[名]、採於 [0.0, 0.25, 0.5, 0.75, 1.0]
     - 自：各色+角+約 hex
   - **CVD 兼容**：標 CVD 型+評
   - **色角**（60/30/10）：
     - Dominant: [階色名] (~hex) — 60%
     - Secondary: [階色名] (~hex) — 30%
     - Accent: [階色名] (~hex) — 10%
   - **終 prompt**：受像之確 prompt
   - **種**：以重生
   - **解**：所用解
   - **Steps/Shift**：生參
   - **評**：五準分簡記
   - **迭**：迭數+主變
2. 記型一致之觀（工者+模釋異者）
3. 記 CVD 觀（單依色↔色+構之元）
4. 薦用+適註

**得：** 可重之錄、全色階文+CVD 兼容評。

**敗：** 全錄覺繁→至少錄終 prompt、種、色階名、CVD 兼容狀—足以重+驗普惠。

## 驗

- [ ] 型/美擇（或明「無型」純抽）
- [ ] 色策擇：名色盲階或自盤+CVD 查
- [ ] 用色盲階則採點識+角賦
- [ ] CVD 兼容對標眾評
- [ ] 紋構析+色↔構映
- [ ] prompt 含具色描（非但階名）+型語
- [ ] prompt 述合型之今渲法
- [ ] 解合用境
- [ ] steps ≥ 10 以梯/色忠
- [ ] 生像依今五準（含普惠）評
- [ ] 種錄以重
- [ ] 終設計錄含 prompt、種、階/盤、CVD 註、參

## 忌

- **prompt 用階名**：Z-Image 不知「viridis」—譯為描述色：「deep purple through teal green to bright yellow」—階名為文、色詞為 prompt
- **CVD 但階擇**：擇 CVD 安階必、然不足—若飾依鄰色之分而無構分（形、紋、大小）—仍或不可達—用冗餘視碼
- **型無構**：「Cyberpunk ornament」過泛—具紋：「cyberpunk circuit trace border with hexagonal nodes」—型為氣、紋為構—兩者皆須
- **採點過多**：自連階採 ≥ 7 致濁梯—3-5 採點生淨果+階忠
- **忽暗地**：諸今型（cyberpunk、neon、vaporwave）假暗背—不指「on dark background」或「on black ground」生洗白
- **梯步不足**：梯階須步多於平史盤—8 步生帶或不準變—用 10-12
- **強行史忠於今技**：此非 `ornament-style-color`—若汝戒誤代或求期實顏料→轉史技。此處 Byzantine 紋以 cyberpunk neon 渲非誤—乃旨

## 參

- `ornament-style-mono`
- `ornament-style-color`
- `review-web-design`
- `review-ux-ui`
- `meditate`
