---
name: ornament-style-mono
locale: wenyan-lite
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

# 紋飾風——單色

結合古典紋飾之藝術史知識與 AI 輔助影像生成，設計單色紋飾模式。每設計皆根於 Alexander Speltz 之《The Styles of Ornament》（1904）所述具體歷史時代與圖案傳統。

## 適用時機

- 以單色創作裝飾邊框、徽章、橫飾帶或面板
- 透過生成式 AI 探索歷史紋飾風格
- 製作古典圖案之線稿、剪影、木刻或筆墨渲染
- 為設計、插圖或教育材料生成參考影像
- 研究跨文化與時代之紋飾傳統結構文法

## 輸入

- **必要**：所欲之歷史時代或風格（或「驚我」隨機擇）
- **必要**：應用上下文（邊框、徽章、橫飾帶、面板、瓷磚、獨立圖案）
- **選擇性**：特定圖案偏好（茛苕、棕葉飾、回紋、阿拉伯式等）
- **選擇性**：渲染風格偏好（線稿、剪影、木刻、筆墨、銅版畫）
- **選擇性**：目標解析度與長寬比
- **選擇性**：可重現生成之種子值

## 步驟

### 步驟一：擇歷史時代

自古典紋飾分類學中擇時代。每時代皆有特徵圖案與結構原則。

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

1. 若用戶指定時代，確認並記其特徵圖案
2. 若「驚我」，隨機擇——偏向「Excellent」單色適合性之時代
3. 記與時代相關之 2-3 主圖案，供提示構建用

**預期：** 已明辨時代，附 2-3 候選圖案，並了解該時代紋飾於單色下何以良好（或具挑戰）。

**失敗時：** 若用戶請求未在表中之時代（如 Celtic、Aztec、Art Deco），以 WebSearch 或 WebFetch 研究其紋飾詞彙並構同等條目，附圖案表與單色適合性評估，後再行。

### 步驟二：分析圖案結構

於構建提示前了解所擇圖案之結構文法。

1. 辨**對稱類型**：
   - 雙邊（沿一軸鏡像——多數有機圖案）
   - 輻射（旋轉——玫瑰飾、徽章、星形）
   - 平移（重複單元——橫飾帶、邊框、鋪排）
   - 點（中心向外輻射——羅盤玫瑰、曼陀羅）

2. 辨**幾何骨架**：
   - 圓本（玫瑰飾、徽章、圓盤）
   - 矩本（面板、間板、卡圖什）
   - 三角本（山牆填充、拱肩）
   - 帶本（橫飾帶、邊框、行進紋飾）

3. 辨**填充模式**：
   - 實心（剪影，無內部細節）
   - 線填（陰影線、交叉陰影、平行線）
   - 開放（但輪廓，負空間為主）
   - 混合（輪廓附選擇性內部細節）

4. 辨**邊緣處理**：
   - 潔淨邊界（含於框內）
   - 有機溢出（圖案越邊或於邊溶解）
   - 互鎖（連於相鄰單元——重複模式所用）

**預期：** 結構描述如「雙邊對稱、帶本骨架、線填、互鎖邊」，將指引提示。

**失敗時：** 若圖案結構不明，以 WebSearch 查「[period] [motif] ornament」尋視覺參考並分析首數結果。Speltz 之原版圖版乃公有領域，網上廣可得。

### 步驟三：構建單色提示

用時代、圖案與結構分析，為 Z-Image 生成構建文字提示。

**提示範本：**
```
[Rendering style] of [motif name] ornament in the [period] style,
[composition type], monochrome, black and white,
[structural details from Step 2],
[application context], [additional qualifiers]
```

**渲染風格選項：**
- `detailed line art` — 潔淨向量式線、無填
- `black silhouette` — 白地基上實黑形
- `woodcut print` — 粗刻線附木紋紋理
- `pen-and-ink illustration` — 細線附陰影線以求深度
- `copperplate engraving` — 精準平行線創色調漸變
- `stencil design` — 連通負空間，無浮島

**組成限定詞：**
- `symmetrical`、`centered`、`repeating pattern`、`border design`
- `isolated motif on white background`、`continuous frieze`
- `within a circular frame`、`filling a rectangular panel`

**單色約束（恆當含）：**
- `monochrome, black and white, no color, no shading`（純線稿）
- `monochrome, black and white, high contrast`（剪影）
- `monochrome, black and white, fine hatching for depth`（銅版風）

**例提示：**
- `detailed line art of Greek meander border pattern, continuous frieze, monochrome, black and white, geometric precision, repeating unit, classical antiquity style`
- `black silhouette of Egyptian lotus and papyrus ornament, symmetrical panel design, monochrome, black and white, high contrast, temple decoration style`
- `pen-and-ink illustration of Art Nouveau whiplash curve with lily motif, vertical panel, monochrome, black and white, sinuous organic lines, Alphonse Mucha influence`

**預期：** 20-40 字之提示，指明渲染風格、圖案、時代、組成與單色約束。

**失敗時：** 若提示過模糊，加步驟二之結構具體。若過繁（過 50 字），去形容詞而留結構要旨，以簡之。Z-Image 對清晰具體之提示反應最佳——避抽象或概念語言。

### 步驟四：配置生成參數

擇合於應用上下文之解析度與生成參數。

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

1. 依應用上下文擇解析度
2. 將 `steps` 設為 8（預設）作初始生成；增至 10-12 用於細線細節
3. 將 `shift` 設為 3（預設）除非實驗
4. 為探索擇 `random_seed: true`，或為可重現以特定種子設 `random_seed: false`
5. 記所有參數以為文件

**預期：** 完整參數集備好生成：解析度、steps、shift、種子策略。

**失敗時：** 若不確定解析度，預設 1024x1024（1:1）——適多數紋飾上下文且最快生成。

### 步驟五：生成影像

呼 Z-Image MCP 工具以製紋飾。

1. 呼 `mcp__hf-mcp-server__gr1_z_image_turbo_generate`，附：
   - `prompt`：步驟三構之提示
   - `resolution`：步驟四
   - `steps`：步驟四
   - `shift`：步驟四
   - `random_seed`：步驟四
   - `seed`：若 `random_seed` 為假則具體種子
2. 記返之種子值以可重現
3. 記生成時間

**預期：** 生成影像與種子值。影像當顯可辨之單色紋飾形式。

**失敗時：** 若 MCP 工具不可用，驗 hf-mcp-server 已配（見 `configure-mcp-server` 或 `troubleshoot-mcp-connection`）。若工具可用但返錯，簡化提示重試。若生成影像全抽象無紋飾特徵，提示需更具體之結構語言——回步驟三。

### 步驟六：對風格準則評估

對四準則評估生成影像。

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

1. 對每準則評：**強**（明確符合）、**足**（部分符合）、**弱**（不符合）
2. 對每準則記具體觀察
3. 若 3+ 準則評為強，設計成功
4. 若 2+ 準則評為弱，回步驟三以修提示

**預期：** 含具體觀察之評分。多數首生影像於 2-3 準則上得「足」。

**失敗時：** 若所有準則評為弱，提示或過抽象或過繁。簡至最要：一圖案、一渲染風格、明「monochrome black and white」約束。考轉至單色適合性更高之時代。

### 步驟七：迭代或定稿

透過針對性迭代精煉設計或接受結果。

**迭代策略：**
1. **種子鎖定之精煉**：保同種子，微調提示——此演化組成而保其基本結構
2. **隨機探索**：用 `random_seed: true` 並同提示——此產同概念之變體
3. **提示演化**：修特定元素（變渲染風格、加/除圖案細節、調組成）

**迭代預算：** 每設計概念限 3 迭代。3 迭代後若結果不滿意，根本上重考時代/圖案組合或渲染風格。

1. 若步驟六之評估指出具體弱點，調提示以應之：
   - 對稱弱 → 加「perfectly symmetrical」或「mirror symmetry」
   - 色滲漏 → 加「pure black and white, no gray tones, no color」
   - 時代感錯 → 加具體時代藝術家或建築之引用
   - 細節不足 → 增 steps 至 10-12，加「highly detailed」
2. 用步驟五重生
3. 用步驟六重評
4. 3+ 準則評為強或迭代預算耗盡時接受

**預期：** 1-2 迭代後影像改進，或決定接受當前最佳結果。

**失敗時：** 若迭代未改進結果，根本提示概念或不能良好譯至模型。試同時代之另一圖案，或全變渲染風格（如自線稿至剪影）。

### 步驟八：記錄設計

為可重現與參考建終設計之完整記錄。

1. 記下：
   - **時代**：歷史時代名與日期範圍
   - **圖案**：所用之主圖案
   - **渲染風格**：線稿、剪影、木刻等
   - **終提示**：產出所接受影像之確切提示
   - **種子**：再現之種子值
   - **解析度**：所用之解析度
   - **Steps/Shift**：生成參數
   - **評估**：對四準則評分之簡記
   - **迭代**：迭代次數與所施關鍵變更
2. 記任何藝術史觀察——生成設計較歷史範例如何
3. 建議潛在應用：印刷、數位邊框、織品圖案等

**預期：** 可重現之記錄，使確切影像可再生並了解其設計脈絡。

**失敗時：** 若文件感過繁，至少記終提示與種子——此二值已足以再現影像。

## 關鍵圖案參考

下列圖案出於多歷史時代，為古典紋飾核心詞彙：

- **茛苕（Acanthus）**：深裂葉；希臘起源，於羅馬與文藝復興紋飾中為主
- **棕葉飾（Palmette）**：扇形葉束；埃及與希臘，anthemion 之祖先
- **anthemion**：交替棕葉與蓮之橫飾帶；希臘，無盡改編
- **Guilloche**：互鎖圓形成鏈；古老普世
- **回紋/希臘鑰匙**：成連續帶之角螺旋；典型希臘
- **阿拉伯式**：無限延伸之植物卷；伊斯蘭，原則上非具象
- **三葉/四葉**：圓內三/四瓣之形；哥德式窗花
- **玫瑰飾**：輻射對稱之花形；普世跨所有時代
- **卷軸（C 與 S）**：螺旋形；巴洛克與洛可可之標誌
- **奇異紋（Grotesque）**：奇幻人獸植物混合；羅馬，於文藝復興復興
- **編織/結紋**：無始無終之編帶；凱爾特、伊斯蘭、拜占庭
- **蓮**：化之睡蓮；埃及起源，傳於亞洲紋飾傳統

## 驗證

- [ ] 已擇具體歷史時代並具理據
- [ ] 已分析圖案結構（對稱、骨架、填充、邊緣處理）
- [ ] 提示含明確單色約束（「black and white」或同等）
- [ ] 提示指明渲染風格（線稿、剪影、木刻等）
- [ ] 解析度合於應用上下文
- [ ] 已對四點標尺評估生成影像
- [ ] 已記種子值以可重現
- [ ] 終設計已以提示、種子與參數記錄

## 常見陷阱

- **省略單色約束**：Z-Image 預設彩。提示中無明「monochrome, black and white」即得彩輸出。將約束於提示之早，非後想
- **過度指定提示**：過 50 字之提示常產混亂結果。守一圖案、一渲染風格、一組成類型。品質來自清晰，非數量
- **忽略時代文法**：每時代有結構規則。埃及框內哥德式三葉，或希臘回紋邊框內巴洛克卷軸，產視覺不一致。守時代詞彙
- **期向量輸出**：Z-Image 產柵格影像。求真向量線稿，生成影像但作手動描摹之參考，非終生產資產
- **跳結構分析**：自時代擇取直跳提示而不分析圖案結構，產通用「裝飾」結果而非歷史紮根之紋飾

## 相關技能

- `ornament-style-color` — 此技能之多彩夥伴；加調色板定義與色彩對結構之映射
- `meditate` — 專注注意與視覺想像練習可助紋飾組成
- `review-web-design` — 設計審查原則（視覺層次、節奏、平衡）直接適用於紋飾組成
