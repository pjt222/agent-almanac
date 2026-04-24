---
name: grade-tcg-card
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Grade a trading card using PSA, BGS, or CGC standards. Covers observation-first
  assessment (adapted from meditate's unbiased observation), centering measurement,
  surface analysis, edge and corner evaluation, and final grade assignment with
  confidence interval. Supports Pokemon, MTG, Flesh and Blood, and Kayou cards.
  Use when evaluating a card before professional grading submission, pre-screening
  a collection for high-grade candidates, settling condition disputes between
  buyers and sellers, or estimating the grade-dependent value spread for a card.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: tcg
  complexity: intermediate
  language: natural
  tags: tcg, grading, psa, bgs, cgc, pokemon, mtg, fab, kayou, cards, collecting
---

# TCG 卡之鑑級

依專業鑑級標準（PSA、BGS、CGC）察並鑑交易卡。用自 `meditate` 技能改編之先察協議免鑑級錨定——最常見之鑑級偏見。

## 用時

- 送交專業鑑級前察卡
- 預篩集以識值送之高級候選
- 解買賣間卡況爭議
- 依結構化察協議學穩定鑑級
- 估特定卡之級依值差

## 入

- **必要**：卡識別（系、號、名、變體/版）
- **必要**：卡影像或物理描述（正反）
- **必要**：所用鑑級標準（PSA 1-10、BGS 1-10 含子級、CGC 1-10）
- **可選**：各級之已知市值（供級值析）
- **可選**：卡遊戲（Pokemon、Magic: The Gathering、Flesh and Blood、Kayou）

## 法

### 第一步：清偏——無預判之察

改自 `meditate` 第二至三步：察卡而不錨於預期級或市值。

1. 置卡市值之知於一旁
2. 鑑前勿查近售或族群報
3. 若知卡「值錢」，顯承認偏見：
   - 「知此卡於 PSA 10 值 $X。今置於旁。」
4. 始察卡為物理對象，非收藏品
5. 記初印象然勿令其錨察
6. 標任何過早級念為「錨定」並返察

**得：** 中性始態，純依物理狀察卡，非市期。鑑級錨定（鑑前知值）為鑑級不一之首因。

**敗則：** 若偏頑固（高值卡使欲見 10），顯書之。外化減其影響。唯可察卡為物理對象時繼。

### 第二步：置中察

測卡印置中於兩面。

1. 測正面四側邊寬：
   - 左對右邊（水平置中）
   - 上對下邊（垂直置中）
   - 以比表：如 55/45 左右、60/40 上下
2. 反面重複
3. 施鑑級標準之置中閾：

```
PSA Centering Thresholds:
+-------+-------------------+-------------------+
| Grade | Front (max)       | Back (max)        |
+-------+-------------------+-------------------+
| 10    | 55/45 or better   | 75/25 or better   |
| 9     | 60/40 or better   | 90/10 or better   |
| 8     | 65/35 or better   | 90/10 or better   |
| 7     | 70/30 or better   | 90/10 or better   |
+-------+-------------------+-------------------+

BGS Centering Subgrade:
+------+-------------------+-------------------+
| Sub  | Front (max)       | Back (max)        |
+------+-------------------+-------------------+
| 10   | 50/50 perfect     | 50/50 perfect     |
| 9.5  | 55/45 or better   | 60/40 or better   |
| 9    | 60/40 or better   | 65/35 or better   |
| 8.5  | 65/35 or better   | 70/30 or better   |
+------+-------------------+-------------------+
```

4. 記每軸置中分與所適子級

**得：** 兩面之數值置中比與對應級/子級已識。此為鑑級中最客觀之測。

**敗則：** 若邊太窄不可準測（全圖卡、無邊印），記「置中 N/A——無邊」並跳第三步。有鑑級服務對無邊卡用異標準。

### 第三步：表面析

察卡表面之瑕。

1. 於良光下察正表：
   - **印瑕**：墨斑、缺墨、印線、色不一
   - **表面刮**：直光與斜光下可見
   - **表面白化**：表層霧或濁
   - **凹印**：斜光下可見之凹
   - **染色或變色**：黃化、水印、化學損
2. 以同準察反表
3. 別工廠瑕與處置損：
   - 工廠：印線、誤切、壓痕——或較少罰
   - 處置：刮、凹、染——皆罰
4. 表面況評：
   - 原始（10）：放大下無瑕
   - 近原始（9-9.5）：僅放大下見輕微瑕
   - 優（8-8.5）：肉眼可見輕微磨
   - 良（6-7）：中度磨，多輕瑕
   - 次及以下（1-5）：見顯著損

**得：** 詳細表面清單，每瑕有位、述、嚴重度。工廠與處置瑕已別。

**敗則：** 若影像解析度太低不可析表，標限並供級範而非點級。勸實察。

### 第四步：邊與角察

察卡邊與角之磨。

1. 察四邊：
   - **白化**：色邊沿白點白線（最常瑕）
   - **崩裂**：邊層小片缺
   - **粗**：邊覺不平或有微裂
   - **箔分**：全息箔卡察邊處分層
2. 察四角：
   - **銳**：角尖銳且尖
   - **圓化**：角尖磨為弧（輕、中、重）
   - **裂**：角處見層分（凹）
   - **彎**：角折或摺
3. 依表面同尺評邊角況
4. 記最差之具體角/邊

**得：** 每邊每角況察。最差之單角/邊常限總級。

**敗則：** 若卡於套或頂載中遮邊，記不能全察之處。

### 第五步：定末級

合諸子察為末級。

1. **PSA 鑑級**（單數 1-10）：
   - 末級為最弱子察所限
   - 完美表面但 65/35 置中之卡封於 PSA 8
   - 施「最低限」原則，若他區出眾則調上
2. **BGS 鑑級**（四子級→總）：
   - 賦子級：置中、邊、角、表面（各 1-10，0.5 步）
   - 總 = 加權均，然最低子級限總
   - BGS 10 Pristine 需四子級皆 10
   - BGS 9.5 Gem Mint 需均 9.5+ 且無子級低於 9
3. **CGC 鑑級**（似 PSA 附子級於標）：
   - 賦置中、表面、邊、角
   - 總依 CGC 專有加權
4. 附信心陳末級：
   - 「PSA 8（確定）」——清級，不太可能更高或低
   - 「PSA 8-9（邊界）」——鑑級服務或任一方向
   - 「PSA 7-8（不確）」——察資料有限

**得：** 附信心等之末級。BGS 者報四子級。級有第二至四步證據支。

**敗則：** 若察不確（如不能辨表痕為刮或塵），供級範並勸專業鑑級。勿以不足資料定確級。

## 驗

- [ ] 鑑前已作偏見察（無級錨定）
- [ ] 兩面置中已測並記比
- [ ] 表面察刮、印瑕、染、凹
- [ ] 四邊四角個別察
- [ ] 工廠對處置瑕已別
- [ ] 末級有每子察證據支
- [ ] 信心等已陳（確定、邊界、不確）
- [ ] 正施鑑級標準（PSA/BGS/CGC 閾）

## 陷

- **級錨定**：鑑前知卡值偏察向「所望」級。始終先物理察
- **忽反面**：反表與反置中皆計。多鑑級者過重正面
- **工廠與處置瑕混**：工廠印線與刮異，然二者皆影響級
- **過鑑全息箔**：全息與箔卡於特定角方見表刮。用多光角
- **置中視錯覺**：圖位可使置中見較實好或差。測邊非圖

## 參

- `build-tcg-deck` — 卡況影響比賽合法之構組
- `manage-tcg-collection` — 依級估值之集管
- `meditate` — 改編作鑑級偏見防之無預判察技法源
