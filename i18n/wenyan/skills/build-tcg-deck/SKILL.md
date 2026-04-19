---
name: build-tcg-deck
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Build a competitive or casual trading card game deck. Covers archetype
  selection, mana/energy curve analysis, win condition identification,
  meta-game positioning, and sideboard construction for Pokemon TCG, Magic:
  The Gathering, Flesh and Blood, and other TCGs. Use when building a new deck
  for a tournament format or casual play, adapting an existing deck to a changed
  meta-game, evaluating whether a new set warrants a deck change, or converting
  a deck concept into a tournament-ready list.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: tcg
  complexity: intermediate
  language: natural
  tags: tcg, deck-building, pokemon, mtg, fab, strategy, meta, archetype
---

# 建 TCG 之牌組

自原型擇至末優，循結構化之程建卡牌之組，通行於 Pokemon TCG、Magic: The Gathering、Flesh and Blood 及他主 TCG。

## 用時

- 為特賽制或休戰建新組
- 調現組以合已變之 meta
- 評新卡或新組之發否值組變
- 教人以建組之原理
- 將組念轉為賽備之列

## 入

- **必要**：卡牌戲（Pokemon TCG、MTG、FaB 等）
- **必要**：制（Standard、Expanded、Modern、Legacy、Blitz 等）
- **必要**：目（競賽、休戰、低費）
- **可選**：好之原型或略（aggro、control、combo、midrange）
- **可選**：預算限（最費、已持之卡）
- **可選**：當 meta 之影（頂組、預期之場）

## 法

### 第一步：定原型

擇組之戰身。

1. 識當制中諸原型：
   - **Aggro**：以早壓與高效攻者速勝
   - **Control**：高效解諸威，以卡利於末局勝
   - **Combo**：聚特卡合而生強協或即勝
   - **Midrange**：靈戰，隨需於 aggro 與 control 間轉
   - **Tempo**：以高效時與擾得資源之利
2. 擇原型據：
   - 玩者之好與風格
   - meta 之位（何勝頂組？）
   - 預算限（combo 組常須特貴卡）
   - 制之合（察禁卡表與輪替態）
3. 識 1-2 主勝條：
   - 此組實以何法勝？
   - 此組欲達之理想局態為何？
4. 明述所擇原型與勝條

**得：** 明原型附定勝條。略足特以引卡擇，足彈以應變。

**敗則：** 若無原型合，自可得之最強個卡始，令原型自卡池湧。佳組或圍卡而建，非圍念。

### 第二步：建核

擇定組略之卡。

1. 識**核引**（12-20 卡，按戲）：
   - 直啟勝條之卡
   - 各核卡取最大合法份
   - 不可易——無此組不行
2. 加**支卡**（8-15 卡）：
   - 尋或護核引之卡
   - 抽/搜效以增一致
   - 護要件之卡（抗、盾、除）
3. 加**互動**（8-12 卡）：
   - 除對之威
   - 擾對之略
   - 合制之防
4. 填**源基**（各戲特）：
   - MTG：地（60 卡組典 24-26，40 卡組 16-17）
   - Pokemon：能卡（基 8-12 + 特）
   - FaB：pitch 值分（紅/黃/藍衡）

**得：** 至或近制最小之全組列。各卡有明角（核、支、互、源）。

**敗則：** 若組逾制之數，先削最弱之支。若核引須過多卡（>25），略或過脆——簡勝條。

### 第三步：析曲

驗組之資源分持其略。

1. 繪**mana/能/費之曲**：
   - 數各費點之卡（0、1、2、3、4、5+）
   - 驗曲合原型：
     - Aggro：峰於 1-2，3 後陡落
     - Midrange：峰於 2-3，4-5 有中存
     - Control：較平，高費終者更多
     - Combo：聚於 combo 件之費
2. 察**色/類分**（MTG：色衡；Pokemon：能類涵）：
   - 源基能按曲穩施卡乎？
   - 有須專源支之色重卡乎？
3. 驗**卡類衡**：
   - 足生物/攻者以施壓
   - 足咒/trainer 以互動與一致
   - 無要類全缺
4. 若曲不持略，宜調

**得：** 滑曲令組按時行略。Aggro 速打，control 早存，combo 按程聚。

**敗則：** 若曲塊（貴卡太多，早打不足），換貴支為廉替。曲要於任單卡。

### 第四步：meta 之位

評組於預期場。

1. 識當 meta 頂五組（用賽果、階表）
2. 各頂組評：
   - **利**：汝略天克其（+1）
   - **等**：二組無結構利（0）
   - **不利**：其略天克汝（-1）
3. 算對場之預勝率：
   - 以對 meta 份權衡對戰
   - 對頂五 60% 以上預勝率者位佳
4. 若位劣，考：
   - 換互動卡以標最劣對戰
   - 若制許，加 sideboard 為不利對戰
   - 異原型是否位佳

**得：** 組於 meta 之清象。利與不利對戰附具體由。

**敗則：** 若 meta 資料不得，專於多能——令組能互諸略而非為一對戰優。

### 第五步：建 sideboard

為制特調建 sideboard/副組（若適）。

1. 第四步之各不利對戰：
   - 識 2-4 卡顯善此對戰
   - 宜高影卡，非微善
2. sideboard 各卡知：
   - 於何對戰帶入
   - 自主組何卡換
   - 帶入否顯變組之曲
3. 驗 sideboard 不逾制限（MTG：15 卡，FaB：異）
4. 確 sideboard 卡非只適一邊緣組
   - 各 sideboard 位宜涵至少二對戰（若可）

**得：** 專之 sideboard 顯善最劣對戰而不稀主略。

**敗則：** 若 sideboard 不能修最劣對戰，組於當 meta 或位劣。考核略須調而非 sideboard 補。

## 驗

- [ ] 原型與勝條明定
- [ ] 組合制之法（禁、輪、卡數）
- [ ] 各卡有定角（核、支、互、源）
- [ ] mana/能之曲持略之速
- [ ] 源基能按曲穩施卡
- [ ] meta 對戰已評附具體推
- [ ] sideboard 以清換計標最劣對戰
- [ ] 預算限已合（若適）

## 陷

- **勝條太多**：有三勝法之組常皆不精。專 1-2
- **曲盲**：加強貴卡而不察組能按時施
- **忽 meta**：閉建。理論最佳敗於實最常
- **情卡**：留無助略之愛卡。各位必自掙
- **sideboard 末念**：末以剩卡建 sideboard。sideboard 為組之部，非附
- **過 tech**：填組以狹解，代主動略

## 參

- `grade-tcg-card` — 為賽合與藏值評卡況
- `manage-tcg-collection` — 為建組蹤可取之卡而藏管
