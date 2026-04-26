---
name: ornament-style-mono
locale: wenyan-ultra
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

# 飾型—單

合史飾識+AI 生像作單色飾。各設根於史期+紋傳—本於 Alexander Speltz《The Styles of Ornament》（1904）。

## 用

- 立單色之緣、章、楣、板
- 探史飾型藉生 AI
- 立線、影、木刻、墨筆之古紋渲
- 為設、插、教材作參圖
- 究跨文跨期飾傳之構文法

## 入

- **必**：所欲期或型（或「隨機」）
- **必**：用境（緣、章、楣、板、瓦、獨紋）
- **可**：紋好（acanthus、palmette、meander、arabesque 等）
- **可**：渲法好（線、影、木刻、墨筆、銅版）
- **可**：解+比
- **可**：種以重生

## 行

### 一：擇史期

擇古飾分類之期。各期有特紋+構則。

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

1. 用者指期則確並記其特紋
2. 「隨機」則擇—偏 Mono 適「優」者
3. 記 2-3 主紋以備立 prompt

**得：** 期+ 2-3 候紋+解此期單色適性之故。

**敗：** 表外之期（Celtic、Aztec、Art Deco 等）→以 WebSearch/WebFetch 研、立同條目+紋單+單色適性、後行。

### 二：析紋構

立 prompt 前須解所擇紋之構文法。

1. 識**對稱**：
   - 雙（一軸鏡像—多有機紋）
   - 徑（旋—rosette、章、星紋）
   - 平移（復單元—楣、緣、鋪砌）
   - 點（中心放射—羅盤玫、曼陀羅）

2. 識**幾何架**：
   - 圓（rosette、章、roundel）
   - 方（板、metope、cartouche）
   - 三角（pediment、spandrel）
   - 帶（楣、緣、行飾）

3. 識**填模**：
   - 實（影、無內細）
   - 線填（hatching、平行線）
   - 開（但輪廓、負空為主）
   - 混（輪廓+選性內細）

4. 識**緣理**：
   - 淨界（框內）
   - 有機溢（紋越或於緣解）
   - 互鎖（連鄰單元—為復模）

**得：** 構述如「雙對稱、帶架、線填、互鎖緣」—引 prompt。

**敗：** 紋構不明→以 WebSearch「[期] [紋] ornament」覽參。Speltz 原版公有、網易得。

### 三：構單色 prompt

以期+紋+構析立 Z-Image 用 prompt。

**Prompt 模：**
```
[Rendering style] of [motif name] ornament in the [period] style,
[composition type], monochrome, black and white,
[structural details from Step 2],
[application context], [additional qualifiers]
```

**渲法：**
- `detailed line art`—淨向量線、無填
- `black silhouette`—白地之實黑形
- `woodcut print`—粗刻線+木紋
- `pen-and-ink illustration`—細線+ hatching
- `copperplate engraving`—精平行線、調梯
- `stencil design`—連負空、無浮島

**構限：**
- `symmetrical`、`centered`、`repeating pattern`、`border design`
- `isolated motif on white background`、`continuous frieze`
- `within a circular frame`、`filling a rectangular panel`

**單色限**（必含）：
- `monochrome, black and white, no color, no shading`（純線）
- `monochrome, black and white, high contrast`（影）
- `monochrome, black and white, fine hatching for depth`（雕版）

**例 prompt：**
- `detailed line art of Greek meander border pattern, continuous frieze, monochrome, black and white, geometric precision, repeating unit, classical antiquity style`
- `black silhouette of Egyptian lotus and papyrus ornament, symmetrical panel design, monochrome, black and white, high contrast, temple decoration style`
- `pen-and-ink illustration of Art Nouveau whiplash curve with lily motif, vertical panel, monochrome, black and white, sinuous organic lines, Alphonse Mucha influence`

**得：** 20-40 字 prompt、述渲法、紋、期、構、單色限。

**敗：** 過泛→加步二之構具。過繁（> 50 字）→去飾、留構要—Z-Image 喜清具、忌抽象。

### 四：配生參

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

1. 依用境擇解
2. 設 `steps` 8（默）；細線→10-12
3. 設 `shift` 為 3（默）
4. 探則 `random_seed: true`、重生則 `random_seed: false`+具種
5. 錄諸參備案

**得：** 全參定—解、steps、shift、種策。

**敗：** 解不定→1024x1024（1:1）—諸飾境通宜+生最速。

### 五：生像

呼 Z-Image MCP：

1. 呼 `mcp__hf-mcp-server__gr1_z_image_turbo_generate`：
   - `prompt`：步三
   - `resolution`：步四
   - `steps`：步四
   - `shift`：步四
   - `random_seed`：步四
   - `seed`：若 `random_seed` 為假則具種
2. 錄返之種以重生
3. 記生時

**得：** 生像+種。像有可識飾形、單色。

**敗：** MCP 不可達→驗 hf-mcp-server 已配（見 `configure-mcp-server`/`troubleshoot-mcp-connection`）。具而報誤→簡 prompt 重試。生全抽無飾性→prompt 須具構語—回步三。

### 六：對型準評

依四準評。

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

1. 各準評：**強**、**足**、**弱**
2. 各準記具觀
3. 3+ 準強→成
4. 2+ 準弱→回步三改 prompt

**得：** 評有具觀。初生多 2-3 準為「足」。

**敗：** 諸準皆弱→prompt 過抽或過繁—簡至最要：一紋、一渲、明「monochrome black and white」。或轉單色適性高之期。

### 七：迭或定

針對性迭或受。

**迭策：**
1. **鎖種精**：保種、微改 prompt—保構而演化
2. **隨探**：`random_seed: true` + 同 prompt—生同概念變
3. **prompt 進化**：改具元（變渲法、加減紋細、調構）

**迭預算：** 各概念限 3 迭。3 迭未足→根本重思期/紋合或渲法。

1. 步六示弱→改 prompt 對之：
   - 對稱弱→加「perfectly symmetrical」或「mirror symmetry」
   - 色漏→加「pure black and white, no gray tones, no color」
   - 期感誤→加具期之畫家或建築
   - 細不足→steps 升 10-12、加「highly detailed」
2. 重生（步五）
3. 重評（步六）
4. 3+ 準強或預算盡→受

**得：** 1-2 迭後改善、或受現最佳。

**敗：** 迭不善→prompt 概念與模不合—試同期他紋或全變渲法（線→影）。

### 八：錄設計

立全錄以重+參。

1. 錄：
   - **期**：期名+期間
   - **紋**：主紋
   - **渲法**：線、影、木刻等
   - **終 prompt**：受像之確 prompt
   - **種**：以重生
   - **解**：所用解
   - **Steps/Shift**：生參
   - **評**：四準分簡記
   - **迭**：迭數+主變
2. 記藝史觀—生設↔史例之比
3. 薦用：印、數位緣、織紋等

**得：** 可重之錄、可重生確像+解設計緣。

**敗：** 全錄覺繁→至少錄終 prompt+種—二者足以重生。

## 主紋參

下諸紋跨諸期、為古飾核心彙：

- **Acanthus**：深裂葉；希源、羅+文藝復興盛
- **Palmette**：扇形葉束；埃+希、anthemion 之祖
- **Anthemion**：palmette 與 lotus 交楣；希、無盡演
- **Guilloche**：互鎖圓成鏈；古、普
- **Meander/Greek Key**：折角螺旋成連帶；希之典
- **Arabesque**：無盡延之植蔓；伊、原則上非具象
- **Trefoil/Quatrefoil**：圓內三/四裂；哥之花飾
- **Rosette**：徑對稱花形；諸期普
- **Scroll（C+S）**：螺旋形；巴洛克+洛可可之標
- **Grotesque**：人獸植幻雜；羅、文藝復興復
- **Interlace/Knotwork**：無始終織帶；凱爾特、伊、拜
- **Lotus**：化睡蓮；埃源、傳亞諸飾傳

## 驗

- [ ] 具期擇+具因
- [ ] 紋構析（對稱、架、填、緣）
- [ ] prompt 含明單色限（「black and white」或同）
- [ ] prompt 述渲法（線、影、木刻等）
- [ ] 解合用境
- [ ] 生像依四準評
- [ ] 種錄以重
- [ ] 終設計錄含 prompt、種、參

## 忌

- **略單色限**：Z-Image 默彩—prompt 中無明「monochrome, black and white」則生彩—置 prompt 之早、勿後加
- **prompt 過具**：> 50 字多生惑果—守一紋一渲一構—質本於清、非繁
- **忽期文法**：各期有構則—哥三葉於埃框、巴洛克卷於希 meander 緣→視不諧—守期彙
- **冀向量出**：Z-Image 生柵格—欲真向量線→生像但為人手描之參、非終資
- **略構析**：由擇期跳至 prompt 而不析紋構→生泛「裝飾」果、非史錨之飾

## 參

- `ornament-style-color`
- `meditate`
- `review-web-design`
