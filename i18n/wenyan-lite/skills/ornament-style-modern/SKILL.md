---
name: ornament-style-modern
locale: wenyan-lite
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

# 紋飾風——現代

以現代與推想美學配合色盲可達之色階，設計紋飾模式。本技能脫歷史時代之束縛——時代錯置鼓勵之，混合圖案歡迎之，調色板系統建於為普及無障礙設計之感知一致色階上。

此乃 `ornament-style-mono` 與 `ornament-style-color` 之「鬆綁」夥伴。彼將每決策錨於藝術史忠實，此將決策錨於類型一致、色彩無障礙與藝術自由。

## 適用時機

- 創作現代、推想或類型特定美學之紋飾設計（cyberpunk、solarpunk、brutalist 等）
- 須以科學驗證之色階達色盲可達之模式設計
- 探索結合歷史紋飾與當代視覺語言之混合圖案
- 為數位上下文（UI 裝飾、遊戲資產、螢幕媒體）製作紋飾，歷史真確非目標
- 為 CVD（Color Vision Deficiency）安全性所必之裝飾影像生成
- 創作純抽象或演算法紋飾，無歷史參考
- 跨文化與時代結合圖案傳統，無時代錯置之顧

## 輸入

- **必要**：類型/美學方向（或「驚我」隨機擇，或「無類型」純抽象）
- **必要**：應用上下文（邊框、徽章、橫飾帶、面板、瓷磚、獨立圖案、UI 元素）
- **選擇性**：色階偏好（viridis、cividis、inferno、magma、plasma 等）或自定調色板
- **選擇性**：擬優化之 CVD 類型（protanopia、deuteranopia、tritanopia 或「all」）
- **選擇性**：特定圖案元素（電路紋、有機生長、幾何格等）
- **選擇性**：渲染風格（digital art、holographic、neon sign、3D render、glitch art 等）
- **選擇性**：歷史混合元素（如「Gothic tracery + circuit board」）
- **選擇性**：目標解析度與長寬比
- **選擇性**：可重現生成之種子值

## 步驟

### 步驟一：擇類型/美學

擇現代或推想之美學為視覺基礎。與歷史時代不同，類型流動——混合鼓勵之。

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

**亦支援之模式：**
- **自由格用戶定義之美學**：描述任何不在表中之視覺方向
- **歷史混合**：合歷史時代與現代類型（如「Byzantine cyberpunk」、「Islamic generative」）
- **無類型/純抽象**：但由結構、色階與組成驅動之紋飾，無類型敘事

1. 若用戶指定類型，確認並記其視覺特徵、圖案語言與色彩傾向
2. 若「驚我」，隨機擇——偏向具強紋飾潛力之類型（cyberpunk、solarpunk、generative、Art Deco Revival）
3. 若請歷史混合，辨歷史圖案詞彙與現代渲染/情緒疊層
4. 記應用上下文（數位螢幕、印刷、實體物），此影響渲染擇取

**預期：** 已明辨之類型（或混合），其特徵視覺語言已了解。對混合，二源傳統皆當明。

**失敗時：** 若用戶請求未在表中之類型，以 WebSearch 查「[genre] aesthetic visual design motifs」研究其視覺慣例並構同等條目。當辨之關鍵元素為：視覺特徵、典型圖案與色彩傾向。

### 步驟二：擇色彩策略

於色盲可達之色階與自定調色板間擇之。色盲色階為建議預設。

**路徑 A：色盲可達之色階（建議）**

自為普及可讀性設計之感知一致色階中擇：

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

**將連續色階譯為紋飾調色板：**
於色階上等距之 3-5 色取樣。viridis 之 5 色調色板：
- Position 0.0: deep purple (#440154)
- Position 0.25: blue-violet (#31688e)
- Position 0.5: teal green (#35b779)
- Position 0.75: yellow-green (#90d743)
- Position 1.0: bright yellow (#fde725)

用 `ornament-style-color` 之 60/30/10 框架賦角色：主色（最大區）、次色（支持）、強調（焦點）。

**路徑 B：自定調色板**

自由格調色板擇取，附選擇性 CVD 模擬檢查：
1. 定義 3-5 色，附命名角色
2. 可用 WebSearch 查「CVD color simulator [colors]」對 CVD 類型驗證
3. 記任何 CVD 風險與緩解（如除色外加紋理或模式）

**預期：** 3-5 個命名色之調色板，附角色，或自命名色階取樣或自定，附 CVD 相容性註記。

**失敗時：** 若不確定，用 viridis 取 3 色（deep purple、teal、yellow）。此乃最普及無障礙且視覺平衡之預設。

### 步驟三：分析圖案結構

了解所擇圖案之結構文法，用與歷史技能同框架，但明允現代組成技法。

1. 行結構分析：
   - **對稱類型**：雙邊、輻射、平移、點，*或* glitch 破、程序非對稱、偽隨機
   - **幾何骨架**：圓、矩形、三角、帶，*或* voronoi 細胞、分形、reaction-diffusion 場
   - **填充模式**：實心、線填、開放、混合，*或* 漸變、雜訊紋理、資料驅動
   - **邊緣處理**：潔淨、有機、互鎖，*或* glitch 化、溶解、像素階梯

2. 加 **色彩對結構之映射**：
   - 何結構元素受所擇色階之何色？
   - 色彩隨形（每形得一色）還是流（漸變跨結構邊界）？
   - 色階之最亮/最淺色於何處現？（通常焦點）
   - 地基/背景為何色？

3. **現代組成技法**（本技能獨有）：
   - **混合圖案**：歷史紋飾結構 + 現代渲染（如 Gothic tracery 渲為電路板）
   - **非傳統對稱**：刻意對稱破、glitch 偽影、重複模式內之程序變化
   - **層疊組成**：紋飾於紋理上、透明效果、景深模糊
   - **元紋飾**：由更小紋飾模式組成之紋飾模式（分形嵌套）

**預期：** 含明確色彩賦予與所辨識任何現代組成技法之結構描述。

**失敗時：** 若現代類型之圖案結構不明，錨於類型之現實視覺先例。Cyberpunk 電路紋循帶骨架以平移對稱。Generative/algorithmic 用輻射或場為本之骨架。圖案語言或新，然結構文法乃普世。

### 步驟四：構建現代提示

為 Z-Image 生成構建文字提示，用現代提示範本。

**提示範本：**
```
[Rendering style] of [genre]-inspired ornamental design,
[motif description], [color scale or palette],
[composition type], [mood/atmosphere],
[application context], [additional qualifiers]
```

**現代渲染風格：**
- `digital art` — 潔淨數位渲染、螢幕就緒、平滑漸變
- `holographic` — 虹彩、繞射光、多角色變
- `neon sign` — 暗地基上發光線、光暈、熱邊
- `3D render` — 體積、有光、材質、深度
- `glitch art` — 數位毀損、掃描線偽影、色頻分裂
- `vector graphic` — 平、潔邊、可縮放感、幾何精準
- `screen print` — 限色、套準標記、墨質、觸感
- `laser etched` — 精準、金屬表面、燒蝕標、技術
- `generative art` — 程序、演算法、數學精準
- `concept art` — 繪畫、氛圍、敘事、電影燈光

**提示中之色階：**
將色階名譯為模型可詮釋之描述性色彩語言：
- **Viridis**：「deep purple transitioning through teal green to bright yellow」
- **Cividis**：「steel blue transitioning to golden yellow」
- **Inferno**：「black through deep red and orange to bright yellow-white」
- **Magma**：「black through dark purple and burnt orange to pale yellow」
- **Plasma**：「deep indigo through magenta and orange to bright yellow」
- **Mako**：「deep navy blue transitioning to light aqua teal」
- **Rocket**：「dark brown-black through brick red to pale cream」

**例提示：**
- `neon sign ornamental design inspired by cyberpunk aesthetic, circuit trace patterns and hexagonal grid, deep purple and teal green and bright yellow colors (viridis palette), repeating border frieze, electric and atmospheric, dark background with glowing elements`
- `digital art of solarpunk-inspired ornamental panel, vine and leaf motifs intertwined with solar cell geometry, steel blue to golden yellow gradient (cividis palette), vertical panel composition, warm and hopeful atmosphere, organic-technology fusion`
- `generative art ornamental tile, algorithmic reaction-diffusion pattern, dark purple through burnt orange to pale yellow (magma palette), square repeating unit, mathematical and volcanic, procedural organic quality`
- `3D render of Art Deco Revival ornamental medallion with brutalist influence, sunburst and ziggurat geometry in raw concrete and gold, deep indigo through magenta to bright yellow (plasma palette), radial symmetry, monumental elegance`

**預期：** 25-50 字之提示，指明渲染風格、類型、圖案、色階/調色板、組成與情緒。

**失敗時：** 若提示生不合所欲色階之色，將色彩描述前置。勿提色階名，於開始描述實際色：「deep purple, teal green, and bright yellow ornamental design...」。Z-Image 對較早之提示權重較重。

### 步驟五：配置生成參數

擇解析度與生成參數。

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

1. 依應用上下文擇解析度
2. 將 `steps` 設為 10-12（漸變細節與色階忠實自更多步受益）
3. 將 `shift` 設為 3（預設）或 4 用於高對比之 neon-on-dark 風格
4. 為探索擇 `random_seed: true`，或為可重現以特定種子設 `random_seed: false`
5. 記所有參數以為文件

**預期：** 完整參數集。漸變色階需 10+ 步以平滑色彩過渡。

**失敗時：** 若不確定，用 1024x1024 於 10 步附 shift 3。但於 neon/glow/高對比風格增至 shift 4。

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

**預期：** 含可辨紋飾結構與可見色彩漸變/調色板之生成影像。色或不完美匹指定色階——於評估中處理。

**失敗時：** 若 MCP 工具不可用，驗 hf-mcp-server 已配（見 `configure-mcp-server` 或 `troubleshoot-mcp-connection`）。若生成影像全抽象無紋飾結構，提示需更具體之結構語言——回步驟四。若色全錯，將色名前置。

### 步驟七：評估設計

對為現代紋飾改編之五準則評估生成影像。

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

1. 對每準則評：**強**（明確符合）、**足**（部分符合）、**弱**（不符合）
2. 對每準則記具體觀察
3. 若 4+ 準則評為強，設計成功
4. 若 2+ 準則評為弱，回步驟四以修提示

**預期：** 含具體觀察之評分。具漸變色階之現代風格較平直歷史調色板難控——首次生成於色階忠實上預期得「足」。

**失敗時：** 若多數準則評為弱，提示或須根本重構。常見修正：將色彩描述移至提示之最前、簡化至更少色（3 而非 5）、強化類型特定語言、增步至 12。

### 步驟八：迭代或定稿

透過針對性迭代精煉設計或接受結果。

**現代特定之迭代策略：**
1. **色階取樣偏移**：若 viridis 衍之調色板過縮，自不同位置取樣（如略中、用端點 + 一偏中之點）
2. **類型放大**：若類型未透出，加類型特定關鍵字：「cyberpunk neon circuitry」而非但「cyberpunk」
3. **色彩前置**：將具體色彩描述置於提示之最開始
4. **種子鎖定之色彩調**：保種子，但變色描以調調色板而保組成
5. **渲染修正**：以材料特定語言強化渲染風格：「glowing neon tubes on matte black surface」而非但「neon sign」
6. **無障礙增強**：若 CVD 評估弱，增鄰近元素間之對比，並於色外加結構區分（紋理、模式、大小）

**迭代預算：** 每設計概念限 3 迭代。

1. 若步驟七之評估指出具體弱點，施對應之修正策略
2. 用步驟六重生
3. 用步驟七重評
4. 4+ 準則評為強或迭代預算耗盡時接受

**預期：** 1-2 迭代後類型一致與色彩忠實改進。完美色階再現不可能——求「可辨於正確色族且過渡方向正確」。

**失敗時：** 若迭代不收斂，色階或對模型過於微妙，難重現為漸變。簡化以自色階取更少色（3 而非 5）並明命之。或接受最近近似並於文件中記偏差。

### 步驟九：記錄設計

為可重現與參考建終設計之完整記錄。

1. 記下：
   - **類型**：類型/美學名與任何混合元素
   - **圖案**：所用之主圖案與其結構文法
   - **渲染風格**：digital art、neon sign、glitch art、3D render 等
   - **色階**：色階名與取樣點，或自定調色板
     - 若色階：[scale name]，於位置 [0.0, 0.25, 0.5, 0.75, 1.0] 取樣
     - 若自定：每色附角色與近似十六進值
   - **CVD 相容**：目標 CVD 類型與評估
   - **色彩角色**（60/30/10）：
     - 主色：[color name from scale] (~hex) — 60%
     - 次色：[color name from scale] (~hex) — 30%
     - 強調：[color name from scale] (~hex) — 10%
   - **終提示**：產出所接受影像之確切提示
   - **種子**：再現之種子值
   - **解析度**：所用之解析度
   - **Steps/Shift**：生成參數
   - **評估**：對五標尺評分之簡記
   - **迭代**：迭代次數與所施關鍵變更
2. 記類型一致觀察（何運作、模型不同詮釋者）
3. 記 CVD 特定觀察（但靠色之元素 vs 色 + 結構之元素）
4. 建議潛在應用與適配記

**預期：** 含完整色階文件與 CVD 相容性評估之可重現記錄。

**失敗時：** 若完整文件感過繁，至少記終提示、種子、色階名與 CVD 相容狀態。此可再現並驗無障礙。

## 驗證

- [ ] 已擇類型或美學方向（或明確「無類型」純抽象）
- [ ] 已擇色彩策略：命名色盲色階或附 CVD 檢查之自定調色板
- [ ] 若用色盲色階，已辨取樣點並賦角色
- [ ] 對目標受眾之 CVD 相容已評
- [ ] 已分析圖案結構並映射色彩於結構
- [ ] 提示含明確色彩描述（非僅色階名）與類型特定語言
- [ ] 提示指明合於類型之現代渲染風格
- [ ] 解析度合於應用上下文
- [ ] Steps 設為 10+ 以求漸變/色彩忠實
- [ ] 已對五點現代標尺（含無障礙準則）評估生成影像
- [ ] 已記種子值以可重現
- [ ] 終設計已以提示、種子、色階/調色板、CVD 註記與參數記錄

## 常見陷阱

- **提示中用色階名**：Z-Image 不知「viridis」——譯為描述性色：「deep purple through teal green to bright yellow」。色階名為文件，色字為提示
- **超色階擇取外忽略 CVD**：擇 CVD 安全色階乃必，非足。若紋飾賴區辨色階中相鄰色而無結構區分（形、紋理、大小），仍或不可達。用冗餘視覺編碼
- **類型無結構**：「Cyberpunk ornament」過模糊。指圖案：「cyberpunk circuit trace border with hexagonal nodes」。類型乃氛圍；圖案乃結構。二者皆需
- **色階取樣過多**：自連續色階取 7+ 點於生成中致渾濁漸變。3-5 取樣點產更潔淨結果與更佳色階忠實
- **忽略暗地基**：許多現代類型（cyberpunk、neon、vaporwave）假定暗背景。未指「on dark background」或「on black ground」於亮色階產出褪色結果
- **漸變步不足**：漸變色階較平直歷史調色板需更多推理步。色階為本之色彩工用 8 步產帶狀或不精準過渡。用 10-12
- **於現代技能中強迫歷史忠實**：本技能非 `ornament-style-color`。若你發現自身於糾時代錯置或堅守時代真確顏料，轉至歷史技能。此處，Byzantine 圖案渲為 cyberpunk 霓虹標非錯——乃要點

## 相關技能

- `ornament-style-mono` — 單色基礎技能；於加現代色彩處理前立圖案結構有用
- `ornament-style-color` — 歷史色彩夥伴；當需時代真確調色板與藝術史忠實，而非現代美學
- `review-web-design` — 色彩理論與無障礙原則適用於紋飾色彩組成
- `review-ux-ui` — 紋飾於 UI 上下文時 WCAG 色彩對比指引相關
- `meditate` — 專注注意與視覺化練習可助抽象模式發展
