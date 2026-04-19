---
name: adaptic
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Master skill composing the 5-step synoptic cycle for panoramic synthesis
  across multiple domains. Orchestrates meditate, expand-awareness, observe,
  awareness, integrate-gestalt, and express-insight into a coherent process
  that produces unified understanding rather than sequential compromise. Use
  when a problem genuinely spans 3+ domains and the interactions between
  domains matter more than depth in any one, when sequential analysis feels
  like compromise rather than integration, or before major architectural
  decisions affecting multiple stakeholders.
license: MIT
allowed-tools: Read Write Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: synoptic
  complexity: advanced
  language: natural
  tags: synoptic, adaptic, panoramic, synthesis, gestalt, meta-skill
---

# 統觀

合五步以成全觀之合。序解致妥協，統觀致融——一見兼諸域而見湧現之全。

## 用

- 題真涉三域以上、域間之交重於單域之深→用
- 序析（博士式）已試而合似妥協→用
- 既法似「各取一二」非統一→用
- 大構決影多者前→用
- 域家相歧而解在諸見間→用

## 不用

- 單域之題——直用域者
- 衡明、序析足者
- 自養養生——用 tending 隊
- 速重於深——全環需持注

## 入

- **必**：須多域合之題
- **可**：明列諸域（默：自題察）
- **可**：深設——`light`、`standard`、`deep`（默 `standard`）
- **可**：表式——`narrative`、`diagram`、`table`、`recommendation`（默 `auto`）

## 設

```yaml
settings:
  depth: standard          # light (skip meditate), standard, deep (extended perceive)
  domains: auto            # auto-detect or explicit list
  expression_form: auto    # narrative, diagram, table, recommendation
```

## 行

### 一：清——空作所

行 `meditate` 以清前脈、預設、單域偏。

1. 行 `meditate` 全程：備、定、察擾、收
2. 特察域偏——以末活之域框題之傾向
3. 清未見全像即至之早解
4. `depth: light`→簡為短頓非全冥

得：作所空。無域佔先。無解預定。神中性受納，可同持諸見。

敗：某域恆稱「真題」→明名其偏：「吾框此為主 [域] 題」。名之則弱。盡清不能→題或真為單域，再考統觀必要乎。

### 二：開——入全觀

行 `expand-awareness` 以由窄轉廣。

1. 列題之諸域——勿先濾排
2. 各域：核憂、限、值，勿評
3. 軟焦：諸域同持於覺，非依次循
4. 抗即解之拉——此步唯開視野
5. 入若明予域，以為始而仍開於發新

得：全場開。諸域同持覺中。可感全景而不入單域。覺寬非壓。

敗：域不全→問：「缺何見可變圖」。同覺塌為序掃→緩之，欲持全非巡部。逾七域→聚相關以減負而存廣。

### 三：察——識跨域之紋

持全觀，行 `observe` 與 `awareness` 識諸域間之紋、張、和。

1. 持二步之全場——勿窄
2. 行 `observe`：何在？何紋跨域復？何張在域間？何和接無關之憂？
3. 行 `awareness`：何未見？何域微忽？何盲點？何隱設於下？
4. 記跨域察而未釋：
   - **張**：域相反拉處
   - **和**：域相強或應處
   - **缺**：諸域皆不及而全圖示之憂處
   - **驚**：域出意外貢處
5. `depth: deep`→延此步——多循 observe 與 awareness 以浮微紋

要律：跨諸域同察，非各域依次。序察失跨域紋，乃統觀之意所在。

得：豐之跨域察——張、和、缺、驚。皆跨域界，非寓單域。察出單域不可見之物。

敗：察皆寓單域（「於 A，吾見 X」）→全場已塌，回二步重開。無跨域紋→題或不需統觀，可分為獨立域題。察過繁→先張（合之所在）。

### 四：合——成湧現之全

行 `integrate-gestalt` 合跨域察為統一。

1. 圖三步張——勿早解；持為創限
2. 尋形：同持諸察湧何統？此非妥非平均，乃含且越諸見之新紋
3. 驗全：合解尊各域核乎？解張或僅蓋之乎？
4. 一句明見——不能簡述則合未畢
5. 驗見真湧現：序析可達否？可→統觀無加值，序析已足

得：一統解同持諸域。見如發現非構——自全湧出非由部組。各域核獲尊。張獲解非妥。

敗：合出「各域一二」非統一→形未成。回三步尋避之張——合過張非繞之。久不成→分：擇張最強之 2-3 域先合，後擴。

### 五：表——傳統解

行 `express-insight` 傳合於受。

1. 評受：熟何域？何框使合見可達？
2. 擇表式（或用入所定）：
   - **敘**：受須由部至全之程
   - **圖**：受須見構關
   - **表**：受須序比域見
   - **薦**：受須可行決
3. 透明表合：示哪域貢、何處解張、湧見越單見何
4. 邀疑：明哪段最強、哪最揣

得：清、形善之合表，受可達。表示其工——受可見域見如何貢全。式合受需。

敗：表似域見之列非統全→四步見已失於譯。回四步一句而由其外建表。受框誤→問：「誰需此？決何？」

## 驗

- [ ] 一步（清）已行——前脈、域偏明釋
- [ ] 二步（開）成全場持三域以上同覺
- [ ] 三步（察）識跨域紋（非僅域內察）
- [ ] 四步（合）成一湧見越單域
- [ ] 五步（表）以合受之式傳見
- [ ] 末出非單域序析可成
- [ ] 各域核於合中獲尊
- [ ] 域張由合解，非妥

## 忌

- **序偽同**：依次循域而綴果，非統觀。驗：跨域交湧新乎？或僅域析之連？
- **早合**：全場未開即合。二、三步築覺基使真合可成——急則淺
- **妥代湧**：「半安半用」乃妥非合。真合尋兩憂皆全足之框，或誠名不可減之衡
- **單域過用**：非題皆需全觀。題寓單域時統觀加負無值。「不用」之則為此
- **見失於表**：四步成清形，五步又分為域列。持合見為表之心；域細為旁證非主構
- **域膨**：偽增域數以稱統觀。三真域之合勝七域而四為旁

## 參

- `meditate` — 一步：清脈立中性始態
- `expand-awareness` — 二步：由窄轉廣
- `observe` — 三步用：察場中所現
- `awareness` — 三步用：察未見、揭盲點
- `integrate-gestalt` — 四步：跨域紋成湧全
- `express-insight` — 五步：傳統解
