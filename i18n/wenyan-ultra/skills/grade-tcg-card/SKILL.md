---
name: grade-tcg-card
locale: wenyan-ultra
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

# 評 TCG 卡

依專業評級標準（PSA、BGS、CGC）評卡。用源自 `meditate` 之「觀察先於定級」協議以防錨定——評級最常之偏。

## 用

- 評前提交專業評級
- 預篩集，辨值交之高級候
- 調買賣間之卡況爭
- 學結構化評級以保一致
- 估特卡之級-值差

## 入

- **必**：卡識（套、號、名、異版）
- **必**：卡像或物描（正背）
- **必**：適評標（PSA 1-10、BGS 1-10 含子級、CGC 1-10）
- **可**：諸級之市值（供級-值析）
- **可**：卡戲（Pokemon、MTG、Flesh and Blood、Kayou）

## 行

### 一：清偏——觀察無預判

由 `meditate` 二-三步改：觀察不錨期級或市值。

1. 置卡市值於旁
2. 評前勿查近售或群體報告
3. 若知值，顯承偏：
   - 「吾知此卡於 PSA 10 值 $X。吾置此於旁」
4. 先以物察，非集藏品
5. 記初感而勿使錨評
6. 過早級思標「錨」並歸觀察

得：中立起態，純物況評，非市期。級錨（評前知值）乃評級不一之首因。

敗：偏黏（高值卡欲見 10）→顯書偏。外化減其影。能物察方進。

### 二：置中評

量印置中於雙面。

1. 量正面四邊之邊框寬：
   - 左右（橫置中）
   - 上下（縱置中）
   - 比：如 55/45 左右，60/40 上下
2. 背面重
3. 用評標之置中閾：

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

4. 記軸置中分與子級

得：雙面置中數比，對應級/子級。此為評級中最客觀之測。

敗：邊過窄不可準量（全畫、無邊）→記「置中 N/A——無邊」並跳三步。某些機構對無邊卡用異標。

### 三：表面析

察卡表之瑕。

1. 於良光察正表：
   - **印瑕**：墨點、缺墨、印線、色不一
   - **表劃**：於直與斜光下可見
   - **表白化**：表層朦朧或雲霧
   - **凹痕**：於側光下可見
   - **染或變色**：黃、水痕、化損
2. 背表同法
3. 分廠瑕與手損：
   - 廠：印線、誤切、褶——或罰輕
   - 手：劃、凹、染——皆罰
4. 評表況：
   - 無瑕（10）：放大無瑕
   - 近無瑕（9-9.5）：僅放大可見小瑕
   - 優（8-8.5）：裸眼見小磨
   - 良（6-7）：中磨、多小瑕
   - 可下（1-5）：明損

得：表目錄詳，諸瑕位、述、重度皆評。廠瑕與手損分。

敗：像辨率太低→標限並予級範，非點級。薦物察。

### 四：邊角評

察邊角磨損。

1. 察四邊：
   - **白化**：色邊之白點或線（最常）
   - **屑落**：小片邊層缺
   - **粗**：邊覺不平或微裂
   - **箔離**：閃卡察邊緣分層
2. 察四角：
   - **利**：角尖銳
   - **圓**：尖磨為曲（輕、中、重）
   - **裂**：角見層分（丁）
   - **彎**：角折或褶
3. 用表況同尺評邊角
4. 記最差角/邊

得：各邊角況評。最差之單角/邊常限總級。

敗：卡於套或裝遮邊→記未可察區。

### 五：定末級

合子評為末級。

1. **PSA 評**（單 1-10）：
   - 末級由最弱子評限
   - 完美表而 65/35 置中→封頂 PSA 8
   - 用「最低限」則，然他優處或升
2. **BGS 評**（四子→總）：
   - 分子級：Centering、Edges、Corners、Surface（各 1-10 以 0.5 步）
   - 總=加權均，然最低子限總
   - BGS 10 Pristine 需四子皆 10
   - BGS 9.5 Gem Mint 需均 9.5+，無子於 9 下
3. **CGC 評**（近 PSA 標有子於牌）：
   - 分 Centering、Surface、Edges、Corners
   - 總依 CGC 專屬加權
4. 末級連信：
   - 「PSA 8（確）」——級清，不高不低
   - 「PSA 8-9（臨界）」——機構或評任一
   - 「PSA 7-8（不確）」——評數據有限

得：末級連信心。BGS 則報四子。級由 2-4 步證支持。

敗：評未定（如痕或劃或塵）→予級範並薦專業評級。無足數據勿予確級。

## 驗

- [ ] 評前已清偏（無錨）
- [ ] 雙面置中已量並記比
- [ ] 表察劃、印瑕、染、凹
- [ ] 四邊四角各評
- [ ] 廠瑕與手損分
- [ ] 末級由各子評證支持
- [ ] 信心陳（確、臨界、不確）
- [ ] 評標正確（PSA/BGS/CGC 閾）

## 忌

- **級錨**：評前知值偏評至「期級」。必先物評
- **略背**：背表與背置中計。多評者過重正
- **混廠手瑕**：廠印線異於劃，然皆影級
- **過評閃卡**：閃與箔卡藏劃至視角正。用多光角
- **置中視錯**：畫位使置中顯優或差於實。量邊，勿量畫

## 參

- `build-tcg-deck`
- `manage-tcg-collection`
- `meditate`
