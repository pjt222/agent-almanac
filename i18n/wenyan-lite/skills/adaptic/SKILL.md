---
name: adaptic
locale: wenyan-lite
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

組構五步通觀循環，以達成跨多領域之全景綜合。順序分析產出妥協（「各取一分」），而通觀循環產出整合——一統合之理解，同持眾領域並覓其湧現之全。

## 適用時機

- 問題確跨三領域以上，且*領域間之互動*重於任一領域之深度
- 已試順序分析（博學者之風），然其綜合似妥協而非整合
- 既有方法似「各取一分」而非統合之願景
- 重大架構決策前，影響多方利害關係人時
- 領域專家異見而其解在其視角*之間*而非任一之內

## 不宜使用

- 單領域問題——直接召領域代理
- 順序分析（博學者風）足以應對之既明權衡
- 自我照護或健康情境——應用 tending 團隊
- 速於深更要時——完整循環需持久注意力

## 輸入

- **必要**：需多領域綜合之問題或議題
- **選擇性**：明列所持之領域（預設：自問題情境自動偵測）
- **選擇性**：深度設定——`light`、`standard` 或 `deep`（預設：`standard`）
- **選擇性**：表達形式——`narrative`、`diagram`、`table` 或 `recommendation`（預設：`auto`）

## 配置

```yaml
settings:
  depth: standard          # light (skip meditate), standard, deep (extended perceive)
  domains: auto            # auto-detect or explicit list
  expression_form: auto    # narrative, diagram, table, recommendation
```

## 步驟

### 步驟一：清——空其作場

行 `meditate` 技能以清先前情境、假設與單領域偏見。

1. 行完整冥想程序：備、定錨、觀擾、收
2. 特留意領域偏見——將問題以最近活躍之領域為框之傾向
3. 清未及全貌前已至之倉促解
4. 若設 `depth: light`，省為簡短清場之頓而非完整冥想

**預期：** 作場已空。無領域佔先。無解已先選。代理處於中性、能容之態，可同持多重視角。

**失敗時：** 若某領域屢自稱為「真問題」，明點其偏：「我察覺自己正以此為[領域]問題。」點明其偏，可鬆其執。若清場全敗，問題或實為單領域——再考通觀循環是否所需。

### 步驟二：開——入全景之模

行 `expand-awareness` 技能，由窄焦移至寬野之知。

1. 列舉與問題相關之諸領域——勿先濾或排
2. 對每領域，記其核心關切、約束與價值，不評斷
3. 軟化焦點：同持諸領域於覺，而非一一輪轉
4. 抗「即解」之拉力——此步純為開視野
5. 若輸入已明列領域，以之為起始集，然仍開放以發現他相關領域

**預期：** 全景場已開。一切相關領域同持於覺。代理可感全貌而不縮入任一領域。其感為寬而非壓。

**失敗時：** 若領域清單覺有缺，問：「何視角缺失，可改畫面？」若同時之覺塌為順序之掃（領域 A 而 B 而 C），緩之——目標為持全場而非巡其部。若逾七領域齊活，將相關者群為簇，以減認知負而保廣度。

### 步驟三：察——觀跨領域之紋

維全景之覺，行 `observe` 與 `awareness` 以察跨諸顯領域之紋、張、共鳴。

1. 持步驟二之全景場開——勿窄焦
2. 行 `observe` 察實在之物：何紋於諸領域中重複？何張存於領域間？何共鳴連看似無關之關切？
3. 行 `awareness` 察*未*被見者：何領域被微忽？何處有盲點？何假設於表下運作？
4. 記跨領域之察而暫不解：
   - **張**：領域反向拉之處
   - **共鳴**：領域相強或相應之處
   - **隙**：無領域應對而全貌揭示之關切
   - **驚**：領域為畫面貢獻意外之物
5. 若設 `depth: deep`，延此步——多次循 observe 與 awareness，令較細之紋浮現

關鍵紀律：同察諸領域，而非依次察各領域。順序之察將失跨領域之紋——而此正為通觀循環之全部要旨。

**預期：** 豐之跨領域察集——張、共鳴、隙、驚。此察跨領域邊界而非居於任一之內。代理已察單領域視角下不可見之事。

**失敗時：** 若察皆居單領域內（「於領域 A，我察 X」），全景場已塌。返步驟二再開。若無跨領域之紋現，問題或不需通觀——或實可拆為獨立之領域問題。若察步產出察過繁，先張（張為整合所在）。

### 步驟四：合——成湧現之全

行 `integrate-gestalt` 技能，將跨領域之察綜為統合之解。

1. 圖步驟三所識之張——勿倉促解，持之為創意之約束
2. 覓其形：諸察同持時，何統合之解湧出？此非妥協亦非平均——乃涵蓋而超越諸領域視角之新紋
3. 試其全：整合之解尊崇各領域之核心關切否？解張或僅紙糊？
4. 一語道破其見——若不可簡述，整合尚未成
5. 驗其見實為湧現：可藉順序領域分析得之否？若可，則通觀循環無增值，順序分析已足

**預期：** 一統合之解，同持諸領域。其見如發現而非構造——湧自全而非組自部。各領域之核心關切受尊，領域間之張獲解而非妥協。

**失敗時：** 若整合產「各領域取一分」而非統合之全，格式塔未成。返步驟三，覓避而不察之張——整合通*經*張而非繞之。若久未成格式塔，拆之：覓張最強之二三領域先合，再擴。

### 步驟五：表——傳整合之解

行 `express-insight` 技能，將綜合傳於受眾。

1. 評受眾：其熟何領域？何種框架可使整合之見可達？
2. 擇表達形式（或用輸入所定者）：
   - **敘事**：受眾須懂自部至全之歷程
   - **圖解**：受眾須見結構關係
   - **表格**：受眾須系統比對領域視角
   - **建議**：受眾須可行之決策
3. 透明表整合之解：示何領域貢獻、何處張獲解、湧現之見較任一視角增益何
4. 邀挑戰：明標整合中何處最強、何處最思辨

**預期：** 整合之解之清晰、得體之表，受眾可達。表呈其工——受眾可見諸領域視角如何貢獻於全。形契受眾所需。

**失敗時：** 若表似領域視角之列而非整合之全，步驟四之見已於翻譯中失。返步驟四之一語總結，由其中心向外建表。若受眾框架有誤，問：「誰需此？告知何決策？」

## 驗證

- [ ] 步驟一（清）已行——先前情境與領域偏見明釋
- [ ] 步驟二（開）產出同持三領域以上之全景場
- [ ] 步驟三（察）識別跨領域之紋（非僅領域內之察）
- [ ] 步驟四（合）產出超越任一領域之單一湧現之見
- [ ] 步驟五（表）以契受眾之形傳達其見
- [ ] 終局產出非順序單領域分析所能得
- [ ] 各領域核心關切於整合之解中受尊
- [ ] 領域間張藉整合而解，非藉妥協

## 常見陷阱

- **順序偽裝為同時**：一一循領域而後拼結果非通觀之察。試曰：跨領域*互動*產新物否，抑或產出僅領域分析之串接？
- **倉促整合**：全景場未盡開即跳至綜合。步驟二三建感知之基，使真整合可成——倉促則綜合膚淺。
- **妥協代湧現**：將領域視角平均（「五成安全、五成可用」）為妥協而非整合。真整合覓一框使二者皆*盡*得，或誠言其不可化約之權衡
- **單領域問題濫用**：非每問題皆需全景綜合。若問題潔居一領域，通觀徒增開銷而無益。「不宜使用」之準則自有其因
- **表達中失見**：步驟四產清晰格式塔，然步驟五分為領域之列。以整合之見為表之中心；領域細節為佐證而非主結構
- **領域膨脹**：人為擴展領域數以證通觀之合理。三實相關之領域勝於七而四為周邊

## 相關技能

- `meditate` — 循環步驟一；清情境並立中性起態
- `expand-awareness` — 循環步驟二；由窄焦移至全景之覺
- `observe` — 用於步驟三；察場中所現
- `awareness` — 用於步驟三；察未被見者，揭盲點
- `integrate-gestalt` — 循環步驟四；自跨領域之紋成湧現之全
- `express-insight` — 循環步驟五；傳整合之解
