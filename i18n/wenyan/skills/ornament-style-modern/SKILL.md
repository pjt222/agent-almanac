---
name: ornament-style-modern
locale: wenyan
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

# 飾風——今

以今與想美學設飾紋，附色盲可達之色階。脫史期之束以探賽博朋克、太陽朋克、生物朋克、粗獷主義、蒸汽波等今類。含色盲（CVD）覺與覺均色階（viridis、cividis、inferno）。

此為 `ornament-style-mono` 與 `ornament-style-color` 之「不縛」伴。彼錨於史美術之確，此錨於類一致、色可達、與藝自由。

## 用時

- 設今、想、或類特美學之飾乃用
- 須色盲可達之科驗色階乃用
- 探合史飾與今視言之混紋乃用
- 為數脈（UI 飾、遊資、屏媒）生飾，史確非目乃用
- 飾須 CVD 安全乃用
- 純抽或算法飾，無史參乃用
- 跨文化期合紋傳，不慮異時乃用

## 入

- **必要**：類/美學向（或「驚我」隨選，或「無類」純抽）
- **必要**：應脈（邊、徽、楣、板、瓦、獨紋、UI 件）
- **可選**：色階好（viridis、cividis、inferno、magma、plasma 等）或自盤
- **可選**：欲優之 CVD 類（紅盲、綠盲、藍黃盲，或「皆」）
- **可選**：具紋件（電路跡、有機長、幾何格等）
- **可選**：渲風（數藝、全息、霓燈、3D 渲、故障藝等）
- **可選**：史混件（如「哥特格紋 + 電路板」）
- **可選**：目分辨率與比
- **可選**：種子值供可復生

## 法

### 第一步：選類/美學

擇今或想美學為視基。不同史期，類流——混與雜薦之。

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
- **自由用者定美學**：述表外任向
- **史混**：合史期與今類（如「拜占庭賽博」「伊斯蘭算法」）
- **無類/純抽**：飾全由結構、色階、構驅，無類敘

1. 用者已指類者，確認並注其視特、紋言、色傾
2. 「驚我」者，隨選——重於飾潛強之類（賽博、太陽、算法、Art Deco 復）
3. 史混請者，識史紋詞與今渲/情覆
4. 注應脈（屏、印、實物）影響渲擇

**得：** 明識之類（或混）附其特視言已解。混者，二源傳皆明。

**敗則：** 用者請表外類者，以 WebSearch 「[genre] aesthetic visual design motifs」研其視，建等條目。要識：視特、典紋、色傾。

### 第二步：擇色策

擇色盲可達階或自盤。色盲階為薦默。

**徑甲：色盲可達階（薦）**

擇覺均色階，為通讀設：

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

**譯連續階為飾盤：**
階上等距取 3-5 色。viridis 五色之例：
- 位 0.0：深紫（#440154）
- 位 0.25：藍紫（#31688e）
- 位 0.5：青綠（#35b779）
- 位 0.75：黃綠（#90d743）
- 位 1.0：亮黃（#fde725）

以 `ornament-style-color` 之 60/30/10 框賦角：主、次、強。

**徑乙：自盤**

自由盤選附選 CVD 模驗：
1. 定 3-5 色附名角
2. 選驗 CVD 類，以 WebSearch 「CVD color simulator [colors]」
3. 注 CVD 險與緩（如色外加紋或形）

**得：** 3-5 色盤附角，自階取或自定，CVD 兼容已注。

**敗則：** 不確者，用 viridis 三色取（深紫、青、黃）。為最通達且視衡之默。

### 第三步：析紋構

解所選紋之結構文法，用史技同框，然明許今構技。

1. 行結構析：
   - **對稱類**：雙、輻、平移、點，*或*故障破、過程不對稱、偽隨
   - **幾何架**：圓、方、三、帶，*或* voronoi 胞、分形、反應擴散場
   - **填模**：實、線填、空、混，*或*漸、雜紋、據驅
   - **邊處**：清、有機、互鎖，*或*故障、溶、像素階

2. 加**色至構之映**：
   - 何結構件得階上何色？
   - 色循形（每形一色）抑流（漸跨結構界）？
   - 階最亮/淺色現於何？（常焦點）
   - 底色為何？

3. **今構技**（此技獨）：
   - **混紋**：史飾構 + 今渲（如哥特格紋以電路板渲）
   - **非統對稱**：故意對稱破、故障物、復模內過程變
   - **層構**：飾覆紋、透效、景深糊
   - **元飾**：飾紋成於小飾紋（分形嵌）

**得：** 結構述附明色賦與所識之今構技。

**敗則：** 今類紋構不明者，錨於類之實視先例。賽博電路跡循帶架附平移對稱。算法用輻或場架。紋言或新然結構文法通。

### 第四步：構今提示

建 Z-Image 生之文提，以今提模。

**提模：**
```
[Rendering style] of [genre]-inspired ornamental design,
[motif description], [color scale or palette],
[composition type], [mood/atmosphere],
[application context], [additional qualifiers]
```

**今渲風：**
- `digital art` — 清數渲、屏宜、平漸
- `holographic` — 虹彩、光衍、多角色變
- `neon sign` — 暗底發光線、光暈、熱邊
- `3D render` — 體、光、材質、深
- `glitch art` — 數壞、掃線物、色道分
- `vector graphic` — 平、清邊、可縮、幾何精
- `screen print` — 限色、配標、墨質、觸
- `laser etched` — 精、金面、燒痕、技
- `generative art` — 過程、算法、數精
- `concept art` — 繪、氛、敘、影光

**提中色階：**
譯階名為模可解之述色語：
- **Viridis**：「deep purple transitioning through teal green to bright yellow」
- **Cividis**：「steel blue transitioning to golden yellow」
- **Inferno**：「black through deep red and orange to bright yellow-white」
- **Magma**：「black through dark purple and burnt orange to pale yellow」
- **Plasma**：「deep indigo through magenta and orange to bright yellow」
- **Mako**：「deep navy blue transitioning to light aqua teal」
- **Rocket**：「dark brown-black through brick red to pale cream」

**提例：**
- `neon sign ornamental design inspired by cyberpunk aesthetic, circuit trace patterns and hexagonal grid, deep purple and teal green and bright yellow colors (viridis palette), repeating border frieze, electric and atmospheric, dark background with glowing elements`
- `digital art of solarpunk-inspired ornamental panel, vine and leaf motifs intertwined with solar cell geometry, steel blue to golden yellow gradient (cividis palette), vertical panel composition, warm and hopeful atmosphere, organic-technology fusion`
- `generative art ornamental tile, algorithmic reaction-diffusion pattern, dark purple through burnt orange to pale yellow (magma palette), square repeating unit, mathematical and volcanic, procedural organic quality`
- `3D render of Art Deco Revival ornamental medallion with brutalist influence, sunburst and ziggurat geometry in raw concrete and gold, deep indigo through magenta to bright yellow (plasma palette), radial symmetry, monumental elegance`

**得：** 25-50 字之提，明渲風、類、紋、色階/盤、構、與情。

**敗則：** 提色不合擬階者，前置色述。不言階名，於提始述實色：「deep purple, teal green, and bright yellow ornamental design...」Z-Image 重早提詞。

### 第五步：設生參

擇分辨率與生參。

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

1. 依應脈擇分辨率
2. 設 `steps` 為 10-12（漸細與階準益於多步）
3. 設 `shift` 為 3（默）或 4 為霓暗風益於高反差
4. 擇 `random_seed: true` 探或 `random_seed: false` 附具種以可復
5. 記諸參供文

**得：** 全參已設。漸基階須 10+ 步以平色變。

**敗則：** 不確者，用 1024x1024 於 10 步附 shift 3。霓/發光/高反差風方升 shift 4。

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

**得：** 生像有可識飾構與可見色漸/盤。色或不全合所指階——此於評處。

**敗則：** MCP 具不可用者，驗 hf-mcp-server 已設（見 `configure-mcp-server` 或 `troubleshoot-mcp-connection`）。生像全抽無飾構者，提須加具結構語——返第四步。色全誤者，前置色名於提。

### 第七步：評設

依五準評生像，承色規則為今飾調。

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

1. 各準評：**強**（明達）、**足**（部分達）、**弱**（不達）
2. 各準注具察
3. 4+ 準評強者，設成
4. 2+ 準評弱者，返第四步以調提

**得：** 已評附具察。今風漸色階較史平盤難控——首生色階準常評足。

**敗則：** 多準評弱者，提或須根本重構。常修：移色述至提之首、簡為較少色（3 而非 5）、強類特語、增步至 12。

### 第八步：迭或定

以針迭精設或受果。

**今特迭策：**
1. **階取移**：viridis 衍盤過縮者，自階異位取（如略中、用端 + 一偏中點）
2. **類強**：類不出者，加類特詞：「cyberpunk neon circuitry」非僅「cyberpunk」
3. **色前置**：置具色述於提之首
4. **種定色調**：留種，僅變色述以調盤而存構
5. **渲校**：以材特語強渲風：「glowing neon tubes on matte black surface」非僅「neon sign」
6. **可達加強**：CVD 評弱者，鄰件間反差加並加結構別（紋、形、大）並色

**迭算：** 每設念限三迭。

1. 第七步察具弱者，施對應校策
2. 第六步重生
3. 第七步重評
4. 4+ 準評強或迭算盡時受

**得：** 1-2 迭後類一致與色準改。完階復難望——目「可識在右色族附正進方」。

**敗則：** 迭不收者，色階或過細至模不能復為漸。簡為自階取較少色（3 而非 5）並明名之。或受最近近並注偏於文。

### 第九步：書設

建終設全記供可復與參。

1. 記下：
   - **類**：類/美學名與任混件
   - **紋**：所用主紋與其結構文法
   - **渲風**：數藝、霓燈、故障藝、3D 渲等
   - **色階**：階名與取點，或自盤
     - 階：[階名]，於位 [0.0, 0.25, 0.5, 0.75, 1.0] 取
     - 自定：各色附角與約 hex
   - **CVD 兼容**：目 CVD 類與評
   - **色角**（60/30/10）：
     - 主：[階上色名]（~hex）— 60%
     - 次：[階上色名]（~hex）— 30%
     - 強：[階上色名]（~hex）— 10%
   - **終提**：所受像之確提
   - **種**：復用種值
   - **分辨率**：所用分辨率
   - **步/移**：生參
   - **評**：五規則準評之簡注
   - **迭**：迭數與要變
2. 注類一致察（何行、模何異釋）
3. 注 CVD 特察（賴色獨之件 vs 色 + 結構）
4. 薦應與適注

**得：** 可復記附全色階文與 CVD 兼容評。

**敗則：** 全文覺過者，至少記終提、種、色階名、與 CVD 兼容態。此供復與可達驗。

## 驗

- [ ] 已選類或美學向（或明「無類」純抽）
- [ ] 色策已擇：名色盲階或自盤附 CVD 驗
- [ ] 用色盲階者，取點識並角賦
- [ ] 為目觀眾評 CVD 兼容
- [ ] 紋構已析附色至構之映
- [ ] 提含明色述（非僅階名）與類特語
- [ ] 提指類宜今渲風
- [ ] 分辨率合應脈
- [ ] 步設 10+ 為漸/色準
- [ ] 生像依五點今規評（含可達準）
- [ ] 種值已記供可復
- [ ] 終設書於提、種、階/盤、CVD 注、與參

## 陷

- **提中用階名**：Z-Image 不識「viridis」——譯為述色：「deep purple through teal green to bright yellow」。階名供文，色詞供提
- **僅階選之 CVD 忽**：擇 CVD 安階必而不足。飾依鄰色辨而無結構別（形、紋、大）者，仍不可達。用冗視碼
- **無構之類**：「賽博飾」過泛。指紋：「cyberpunk circuit trace border with hexagonal nodes」。類為氛；紋為構。二者皆需
- **階取過多**：自連續階取 7+ 點生濁漸。3-5 取點生較清且階準
- **忽暗底**：多今類（賽博、霓、蒸汽波）假暗背。不指「on dark background」或「on black ground」者，亮階生淡
- **漸步不足**：漸基色階較史平盤需多步推。色階用 8 步生帶或不準變。用 10-12
- **今技中強史確**：此非 `ornament-style-color`。若覺須警異時或要期確顏料，轉史技。此處，拜占庭紋以賽博霓渲非誤——乃要

## 參

- `ornament-style-mono` — 黑白基技；加今色處前立紋構之用
- `ornament-style-color` — 史色伴；要期確盤與美術史確時用之
- `review-web-design` — 色論與可達則施飾色構
- `review-ux-ui` — UI 脈中飾用 WCAG 色反差指引相關
- `meditate` — 焦注與觀想可助抽紋發
