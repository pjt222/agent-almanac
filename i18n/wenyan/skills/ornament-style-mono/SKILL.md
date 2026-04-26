---
name: ornament-style-mono
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Design monochrome ornamental patterns grounded in Alexander Speltz's classical
  ornament taxonomy. Covers historical period selection, motif structural analysis,
  prompt construction for line art and silhouette rendering, and AI-assisted image
  generation via Z-Image. Use when creating decorative borders, medallions, or
  friezes in a single color, exploring historical ornament styles through generative
  AI, producing line art or pen-and-ink renderings of classical motifs, or generating
  reference imagery for design or educational materials.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: design
  complexity: intermediate
  language: natural
  tags: design, ornament, monochrome, art-history, speltz, generative-ai, z-image
---

# 飾風——黑白

合美術史古飾學與 AI 助像生以設黑白飾紋。每設根於 Alexander Speltz 之《The Styles of Ornament》（1904）所述具史期與紋傳。

## 用時

- 設單色之邊、徽、楣、板乃用
- 以生 AI 探史飾風乃用
- 為古紋作線藝、剪影、木刻、鋼筆墨渲乃用
- 為設、繪、教生參像乃用
- 跨文化期研飾傳之結構文法乃用

## 入

- **必要**：欲史期或風（或「驚我」隨選）
- **必要**：應脈（邊、徽、楣、板、瓦、獨紋）
- **可選**：具紋好（莨苕、棕葉、迴紋、阿拉伯紋等）
- **可選**：渲風好（線藝、剪影、木刻、鋼筆墨、雕版）
- **可選**：目分辨率與比
- **可選**：種子值供可復生

## 法

### 第一步：選史期

於古飾分類中擇期。各期有特紋與構則。

```
Historical Ornament Periods:
┌───────────────────┬─────────────────┬──────────────────────────────────────────┬──────────────────────┐
│ Period            │ Date Range      │ Key Motifs                               │ Mono Suitability     │
├───────────────────┼─────────────────┼──────────────────────────────────────────┼──────────────────────┤
│ Egyptian          │ 3100–332 BCE    │ Lotus, papyrus, scarab, winged disk,     │ Excellent — bold     │
│                   │                 │ uraeus, ankh                             │ geometric forms      │
├───────────────────┼─────────────────┼──────────────────────────────────────────┼──────────────────────┤
│ Greek             │ 800–31 BCE      │ Meander/Greek key, palmette, anthemion,  │ Excellent — high     │
│                   │                 │ acanthus, guilloche, egg-and-dart        │ contrast geometry    │
├───────────────────┼─────────────────┼──────────────────────────────────────────┼──────────────────────┤
│ Roman             │ 509 BCE–476 CE  │ Acanthus scroll, rosette, grotesque,     │ Very good — dense    │
│                   │                 │ candelabra, rinceau, trophy              │ carved relief style  │
├───────────────────┼─────────────────┼──────────────────────────────────────────┼──────────────────────┤
│ Byzantine         │ 330–1453 CE     │ Interlace, vine scroll, cross forms,     │ Good — flat          │
│                   │                 │ basket weave, peacock, chi-rho           │ silhouette style     │
├───────────────────┼─────────────────┼──────────────────────────────────────────┼──────────────────────┤
│ Islamic           │ 7th–17th c.     │ Arabesque, geometric star, muqarnas,     │ Excellent — pure     │
│                   │                 │ tessellation, knotwork, calligraphic     │ geometric abstraction│
├───────────────────┼─────────────────┼──────────────────────────────────────────┼──────────────────────┤
│ Romanesque        │ 1000–1200 CE    │ Interlace, beast chains, chevron,        │ Very good — heavy    │
│                   │                 │ billet, zigzag, inhabited scroll         │ carved stone quality │
├───────────────────┼─────────────────┼──────────────────────────────────────────┼──────────────────────┤
│ Gothic            │ 1150–1500 CE    │ Trefoil, quatrefoil, crocket,           │ Very good — tracery  │
│                   │                 │ finial, tracery, naturalistic leaf       │ and window patterns  │
├───────────────────┼─────────────────┼──────────────────────────────────────────┼──────────────────────┤
│ Renaissance       │ 1400–1600 CE    │ Grotesque, candelabra, putto,           │ Good — engraving     │
│                   │                 │ medallion, festoon, cartouche           │ and woodcut styles   │
├───────────────────┼─────────────────┼──────────────────────────────────────────┼──────────────────────┤
│ Baroque/Rococo    │ 1600–1780 CE    │ C-scroll, S-scroll, shell, asymmetric   │ Moderate — complex   │
│                   │                 │ cartouche, garland, ribbon              │ forms benefit from   │
│                   │                 │                                          │ color for depth      │
├───────────────────┼─────────────────┼──────────────────────────────────────────┼──────────────────────┤
│ Art Nouveau       │ 1890–1910 CE    │ Whiplash curve, organic line, lily,     │ Excellent — defined  │
│                   │                 │ dragonfly, femme-fleur, sinuous vine    │ by line quality      │
└───────────────────┴─────────────────┴──────────────────────────────────────────┴──────────────────────┘
```

1. 用者已指期者，確認並注其特紋
2. 「驚我」者，隨選——重於黑白宜「Excellent」之期
3. 注期 2-3 主紋以供提構

**得：** 明識之期附 2-3 候紋與其黑白宜之解。

**敗則：** 用者請表外之期者（如凱爾特、阿茲特克、Art Deco），以 WebSearch 或 WebFetch 研其飾詞並建等條目附紋列與黑白宜評再進。

### 第二步：析紋構

提構前解所選紋之結構文法。

1. 識**對稱類**：
   - 雙（鏡於一軸——多有機紋）
   - 輻（旋——玫瑰、徽、星紋）
   - 平移（重複單元——楣、邊、鋪砌）
   - 點（中焦輻外——羅盤玫瑰、曼陀羅）

2. 識**幾何架**：
   - 圓基（玫瑰、徽、圓盤）
   - 方基（板、間板、鏤紋盾）
   - 三基（山形填、三角間）
   - 帶基（楣、邊、行飾）

3. 識**填模**：
   - 實（剪影，無內細）
   - 線填（線陰、十字陰、平線）
   - 空（僅輪廓，負空主導）
   - 混（輪廓加擇內細）

4. 識**邊處**：
   - 清界（限於框內）
   - 有機溢（紋逾或於邊溶）
   - 互鎖（連於鄰單元——重複紋用）

**得：** 結構述如「雙對稱、帶架、線填、互鎖邊」以告提。

**敗則：** 紋構不明者，以 WebSearch 「[period] [motif] ornament」尋視參並析首數結果。Speltz 原版為公域，網上易得。

### 第三步：構黑白提

以期、紋、構析建 Z-Image 生之文提。

**提模：**
```
[Rendering style] of [motif name] ornament in the [period] style,
[composition type], monochrome, black and white,
[structural details from Step 2],
[application context], [additional qualifiers]
```

**渲風選：**
- `detailed line art` — 清矢量似線，無填
- `black silhouette` — 白底實黑形
- `woodcut print` — 大刻線附木紋
- `pen-and-ink illustration` — 細線附陰示深
- `copperplate engraving` — 精平線生階
- `stencil design` — 連負空，無浮島

**構限：**
- `symmetrical`、`centered`、`repeating pattern`、`border design`
- `isolated motif on white background`、`continuous frieze`
- `within a circular frame`、`filling a rectangular panel`

**黑白限**（必含）：
- `monochrome, black and white, no color, no shading`（純線藝）
- `monochrome, black and white, high contrast`（剪影）
- `monochrome, black and white, fine hatching for depth`（雕版）

**提例：**
- `detailed line art of Greek meander border pattern, continuous frieze, monochrome, black and white, geometric precision, repeating unit, classical antiquity style`
- `black silhouette of Egyptian lotus and papyrus ornament, symmetrical panel design, monochrome, black and white, high contrast, temple decoration style`
- `pen-and-ink illustration of Art Nouveau whiplash curve with lily motif, vertical panel, monochrome, black and white, sinuous organic lines, Alphonse Mucha influence`

**得：** 20-40 字之提，明渲風、紋、期、構、與黑白限。

**敗則：** 提過泛者，加第二步之結構具。過繁（逾五十字）者，刪形容詞，留結構要。Z-Image 應於明、具之提——避抽或概念語。

### 第四步：設生參

擇分辨率與生參合應脈。

```
Resolution by Application:
┌────────────────────┬─────────────────────┬────────────────────────────────┐
│ Application        │ Recommended         │ Rationale                      │
├────────────────────┼─────────────────────┼────────────────────────────────┤
│ Medallion / Roundel│ 1024x1024 (1:1)     │ Radial symmetry needs square   │
│ Tile / Repeat Unit │ 1024x1024 (1:1)     │ Square for seamless tiling     │
│ Horizontal Frieze  │ 1280x720 (16:9)     │ Wide format for running border │
│ Vertical Panel     │ 720x1280 (9:16)     │ Portrait format for columns    │
│ Wide Border        │ 1344x576 (21:9)     │ Ultrawide for architectural    │
│ General / Flexible │ 1152x896 (9:7)      │ Balanced landscape format      │
│ Large Detail       │ 1536x1536 (1:1)     │ Higher res for fine line work  │
└────────────────────┴─────────────────────┴────────────────────────────────┘
```

1. 依應脈擇分辨率
2. 設 `steps` 為 8（默）為初生；細線升 10-12
3. 設 `shift` 為 3（默），勿試
4. 擇 `random_seed: true` 探或 `random_seed: false` 附具種以可復
5. 記諸參供文

**得：** 全參已備生：分辨率、步、移、種策。

**敗則：** 分辨率不確者，默 1024x1024（1:1）——多飾脈下行且最速。

### 第五步：生像

呼 Z-Image MCP 具以生飾。

1. 呼 `mcp__hf-mcp-server__gr1_z_image_turbo_generate` 附：
   - `prompt`：第三步所構之提
   - `resolution`：第四步
   - `steps`：第四步
   - `shift`：第四步
   - `random_seed`：第四步
   - `seed`：若 `random_seed` false 之具種
2. 記返種值供可復
3. 注生時

**得：** 已生之像與種值。像現可識飾形於黑白。

**敗則：** MCP 具不可用者，驗 hf-mcp-server 已設（見 `configure-mcp-server` 或 `troubleshoot-mcp-connection`）。具可用然返誤者，簡提重試。生像全抽無飾性者，提須加具結構語——返第三步。

### 第六步：依風則評

依四準評生像。

```
Monochrome Ornament Evaluation Rubric:
┌─────────────────────┬───────────────────────────────────────────────────────┐
│ Criterion           │ Evaluation Questions                                  │
├─────────────────────┼───────────────────────────────────────────────────────┤
│ 1. Symmetry         │ Does the design exhibit the intended symmetry type?   │
│                     │ Is it visually balanced? Are repeating elements       │
│                     │ consistent?                                           │
├─────────────────────┼───────────────────────────────────────────────────────┤
│ 2. Monochrome       │ Is the image truly black and white? Are there         │
│    Fidelity         │ unwanted grays, colors, or gradients? Does the        │
│                     │ rendering style match the request?                    │
├─────────────────────┼───────────────────────────────────────────────────────┤
│ 3. Period Accuracy  │ Would this design be recognizable as belonging to     │
│                     │ the specified period? Are the motifs period-           │
│                     │ appropriate? Does it avoid anachronistic elements?    │
├─────────────────────┼───────────────────────────────────────────────────────┤
│ 4. Detail Level     │ Is the level of detail appropriate for the rendering  │
│                     │ style? Line art should have clean lines; woodcut      │
│                     │ should show bold strokes; engraving should show       │
│                     │ systematic hatching.                                  │
└─────────────────────┴───────────────────────────────────────────────────────┘
```

1. 各準評：**強**（明達）、**足**（部分達）、**弱**（不達）
2. 各準注具察
3. 3+ 準評強者，設成
4. 2+ 準評弱者，返第三步以調提

**得：** 已評附具察。多首生像於 2-3 準評足。

**敗則：** 諸準皆評弱者，提或過抽或過繁。簡為最要：一紋、一渲、明「monochrome black and white」限。考轉黑白宜更高之期。

### 第七步：迭或定

以針迭精設或受果。

**迭策：**
1. **種定精**：留同種，微調提——演構而存基構
2. **隨探**：用 `random_seed: true` 同提——生同念之變
3. **提演**：改具件（變渲、加減紋細、調構）

**迭算：** 每設念限三迭。三迭後仍不滿者，根本重考期/紋合或渲風。

1. 第六步察具弱者，調提以修：
   - 對稱弱 → 加「perfectly symmetrical」或「mirror symmetry」
   - 色漏 → 加「pure black and white, no gray tones, no color」
   - 期感誤 → 加具期參藝家或紀念
   - 細不足 → 升步至 10-12，加「highly detailed」
2. 第五步重生
3. 第六步重評
4. 3+ 準評強或迭算盡時受

**得：** 1-2 迭後改像，或定受當前最佳果。

**敗則：** 迭不改果者，提念或不善於模譯。試同期他紋，或徹變渲風（如自線藝至剪影）。

### 第八步：書設

建終設全記供可復與參。

1. 記下：
   - **期**：史期名與時範
   - **紋**：所用主紋
   - **渲風**：線藝、剪影、木刻等
   - **終提**：所受像之確提
   - **種**：復用種值
   - **分辨率**：所用分辨率
   - **步/移**：生參
   - **評**：四準評之簡注
   - **迭**：迭數與要變
2. 注美術史察——生設較史例
3. 薦應：印、數邊、織紋等

**得：** 可復記允確像重生且解其設承。

**敗則：** 文覺過者，至少記終提與種——此二值足以復像。

## 主紋參

下列紋現於多史期，為古飾之核詞：

- **莨苕（Acanthus）**：深裂葉；希源，主於羅與文藝復興飾
- **棕葉（Palmette）**：扇形葉簇；埃與希，為 anthemion 祖
- **Anthemion**：交替棕葉蓮楣；希，無盡承
- **Guilloche**：互鎖圓成鏈；古，通用
- **迴紋（Meander/Greek Key）**：角螺旋成連帶；典希
- **阿拉伯紋（Arabesque）**：無盡延植卷；伊斯蘭，理論非具象
- **三/四葉**：圓內三/四裂形；哥特格紋
- **玫瑰紋（Rosette）**：輻對稱花形；諸期皆通
- **卷紋（C 與 S）**：螺旋形；巴洛克與洛可可標
- **Grotesque**：奇人獸植混；羅，文藝復興復興
- **互織/結紋（Interlace/Knotwork）**：無始終織帶；凱、伊、拜
- **蓮（Lotus）**：化水百合；埃源，傳東亞飾傳

## 驗

- [ ] 已選具史期附依據
- [ ] 紋構已析（對稱、架、填、邊處）
- [ ] 提含明黑白限（「black and white」或等）
- [ ] 提指渲風（線藝、剪影、木刻等）
- [ ] 分辨率合應脈
- [ ] 生像依四點規評
- [ ] 種值已記供可復
- [ ] 終設書於提、種、與參

## 陷

- **略黑白限**：Z-Image 默色。提無明「monochrome, black and white」者，得色出。早置限於提，勿事後加
- **過具提**：提過五十字常生混果。守一紋、一渲、一構類。質生於明，非量
- **忽期文法**：各期有結構規。哥特三葉於埃及框內，或巴洛克卷於希迴邊，生視不諧。守期詞
- **望矢出**：Z-Image 生柵像。真矢線藝者，生像為手描之參，非終資
- **略構析**：自選期至提而不析紋構者，生泛「飾」果非史錨之飾

## 參

- `ornament-style-color` — 多色伴；加色盤定與色至構之映
- `meditate` — 焦注與視想可助飾構
- `review-web-design` — 設察則（視階、律、衡）施飾構
