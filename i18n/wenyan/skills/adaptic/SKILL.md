---
name: adaptic
locale: wenyan
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

# 通觀

組五步通觀之環，以達諸域之全景合成。序析所得者妥協耳（「各有少許」也），通觀之環所得者整合也——同持諸域之一體悟，尋其湧現之全。

## 用時

- 題誠跨三域以上，而*諸域之互*要於任一域之深乃用
- 序析（博識之風）已試，而合成覺如妥協非整合乃用
- 既有之法覺「各有少許」而非統一之觀乃用
- 重架構之決影及多方之前乃用
- 域專家相違而解在其*間*非在其內乃用

## 不用時

- 單域之題——直用其域之吏
- 權衡已明而序析足者
- 自養之境——用 tending 之團
- 速要於深者——全環須久注

## 入

- **必要**：需跨域合成之題或問
- **可選**：所持諸域之明列（默：由題境自察）
- **可選**：深之設——`light`、`standard`、`deep`（默：`standard`）
- **可選**：表達之形——`narrative`、`diagram`、`table`、`recommendation`（默：`auto`）

## 設

```yaml
settings:
  depth: standard          # light (skip meditate), standard, deep (extended perceive)
  domains: auto            # auto-detect or explicit list
  expression_form: auto    # narrative, diagram, table, recommendation
```

## 法

### 第一步：清——空其場

行 `meditate` 之技以清前境、假設與單域之偏。

1. 執冥想全程：備、錨、察擾、閉
2. 特注域偏——以近用之域為題之傾向
3. 清全景未見前之早到方案
4. 若設 `depth: light`，縮為短暫清境之頓，非全冥想

**得：** 場已空。無域為先。無解先擇。吏處中立受容之態，可同持諸觀。

**敗則：** 若某域屢自稱「真題」，明名其偏：「吾察覺將此主框為某域之題。」名之則鬆其握。若全清不成，題或誠為單域——再察通觀是否當用。

### 第二步：開——入全景之態

行 `expand-awareness` 之技，由狹注轉為廣場之察。

1. 列題所關之諸域——勿預篩、勿預排
2. 每域記其核心關切、約束、所重，勿評
3. 柔其注：諸域同持於察中，勿逐一周旋
4. 抗「始解」之引——此步純為開視之場
5. 若入中已明列諸域，以之為始，仍開於新域之察

**得：** 全景之場已開。所關諸域同持於察。吏可感其全地貌而不陷於一域。覺寬而不壓。

**敗則：** 若域列覺缺，問：「少何觀而能改其局？」若同察崩為序掃（甲、乙、丙），緩之——旨在持全場，非遊其部。若逾七域，聚其類以減認知之載而不失廣。

### 第三步：覺——察跨域之紋

持全景之察，行 `observe` 與 `awareness` 以察*跨*諸域之紋、張、鳴。

1. 持第二步之全景——勿窄其注
2. 行 `observe` 察實存者：諸域何紋屢現？諸域何張相抵？何鳴連似無關之事？
3. 行 `awareness` 察不見者：何域遭隱略？盲何在？何假設於表下運？
4. 記跨域之察而未解：
   - **張**：諸域相抵之處
   - **鳴**：諸域相應相和之處
   - **隙**：無域及之而全景所示之處
   - **驚**：某域出人意料之貢
5. 若設 `depth: deep`，延此步——多輪 observe 與 awareness，俟幽紋浮現

要律：同察諸域，非逐一察之。序察失跨域之紋，而此紋乃通觀之旨也。

**得：** 跨域諸察豐富——張、鳴、隙、驚。此諸察跨其界而非囿於一域。吏察自任一域皆不可見之物。

**敗則：** 若察皆於單域（「於甲域，吾察 X」），全景已崩。返第二步再開。若無跨域之紋浮現，題或不需通觀——或誠可析為獨立之域題。若察過繁，先張（整合生於張）。

### 第四步：合——形湧現之全

行 `integrate-gestalt` 之技，合跨域之察為統一之悟。

1. 繪第三步所識之張——勿早解之，持為創之約
2. 尋其形：諸察同持時何統一之悟浮現？此非妥協非平均——乃新紋也，含諸域之觀而超之
3. 試其全：合之悟尊各域之核心乎？解張抑或徒蓋之？
4. 以一言明其悟——若不能簡述，整合未盡
5. 驗悟真為湧現：序析諸域可得之乎？若可，通觀無益，序析已足

**得：** 一統合之悟同持諸域。悟覺如發現非構造——自全而生，非由部集。各域核心皆尊，諸域之張解而非妥協。

**敗則：** 若合得「各域少許」而非統一，其形未成。返第三步察所避之張——整合自張*而*入，非繞之。若久力無形，析之：取張最強二三域先合，後擴。

### 第五步：達——傳合之悟

行 `express-insight` 之技，以傳合成於所欲之聽者。

1. 察聽者：其熟何域？何框使合之悟可達？
2. 擇表達之形（或用入所指）：
   - **Narrative**：聽者須解由部至全之程
   - **Diagram**：聽者須見結構之連
   - **Table**：聽者須系統比諸域之觀
   - **Recommendation**：聽者須可行之決
3. 明達合之悟：示何域所貢、何張所解、湧現之悟超任一觀之所加
4. 邀挑戰：明記整合最強與最疑之處

**得：** 合之悟明達於聽者。表達顯其功——聽者見諸域觀如何貢於全。形合聽者之求。

**敗則：** 若表達覺如諸域之列非統一之全，第四步之悟已失於譯。返第四步之一言，自其中心而外建。若聽者之框有誤，問：「誰需之？決何事？」

## 驗

- [ ] 第一步（清）已行——前境與域偏明釋
- [ ] 第二步（開）生全景之場，同持三域以上
- [ ] 第三步（覺）識跨域之紋，非單域之察
- [ ] 第四步（合）生單一湧現之悟，超任一域
- [ ] 第五步（達）以合聽者之形傳之
- [ ] 終出非序單域析可得
- [ ] 各域之核心皆尊於合之悟
- [ ] 諸域之張由整合而解，非妥協

## 陷

- **序偽為同**：逐一周遊諸域而後訂其果，非通觀之覺。試：跨域之*互*生新乎，抑輸出僅為域析之串？
- **早合**：未全開全景而躍至合成。第二、三步立覺之基使真合可成——速之則成淺合
- **妥協代湧現**：平諸域之觀（「安半用半」）乃妥協，非整合。真整合尋一框使二關切*盡*達，或誠名不可約之權衡
- **單域過用**：非題皆需全景合成。若題於一域清居，通觀徒增耗而無益。「不用時」諸條自有其故
- **達失其悟**：第四步生清之整形，第五步析回域列。以合之悟為達之心；域之詳為證，非主
- **域膨**：人為增域以稱通觀。三誠關之域生合優於七域而四為邊

## 參

- `meditate` — 環之第一步；清境立中性之始
- `expand-awareness` — 環之第二步；由狹注轉為全景
- `observe` — 第三步所用；察場中所存
- `awareness` — 第三步所用；察不見者，顯盲
- `integrate-gestalt` — 環之第四步；由跨域之紋形湧現之全
- `express-insight` — 環之第五步；傳合之悟
