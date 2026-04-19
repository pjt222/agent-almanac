---
name: build-tcg-deck
locale: wenyan-lite
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

# Build TCG Deck

自原型之擇至終優化，依結構化之程構集換卡牌遊戲之牌組；此程可用於 Pokemon TCG、Magic: The Gathering、Flesh and Blood 等主 TCG。

## 適用時機

- 為特定賽制或休閒玩建新牌組
- 既有牌組應變之賽局
- 評新卡或新組之發是否須改牌
- 教人牌組構建之原則
- 將牌組概念化為賽制可行之列

## 輸入

- **必要**：卡牌遊戲（Pokemon TCG、MTG、FaB 等）
- **必要**：賽制（Standard、Expanded、Modern、Legacy、Blitz 等）
- **必要**：目標（競賽、休閒、預算）
- **選擇性**：所好之原型或策略（aggro、control、combo、midrange）
- **選擇性**：預算之限（最高花費、既有之卡）
- **選擇性**：當前賽局之快照（頂級牌組、預期場域）

## 步驟

### 步驟一：定原型

擇牌組之戰略身份。

1. 辨當前賽制可行之原型：
   - **Aggro**：以早壓與效率攻擊者速勝
   - **Control**：效率應答威脅，後期以卡勢勝
   - **Combo**：組特定卡合而強協同或即勝
   - **Midrange**：彈策略，依需於 aggro 與 control 間轉
   - **Tempo**：以效率時機與擾獲資源之勢
2. 依以下擇原型：
   - 玩家之好與風格
   - 賽局定位（何者勝頂級牌組？）
   - 預算之限（combo 常需特定貴卡）
   - 賽制合法（查禁卡與輪換）
3. 辨一至二主勝條件：
   - 此牌組如何真正勝局？
   - 此牌組欲達之理想局態為何？
4. 明陳原型之擇與勝條件

**預期：** 明之原型與既定之勝條件。策略足具體以導卡之擇，又足彈以應變。

**失敗時：** 若無原型相合，始自最強單卡，令原型自卡池浮出。有時最佳牌組繞一卡而非一概念而建。

### 步驟二：建核心

擇定牌組策略之卡。

1. 辨**核心引擎**（12-20 卡，依遊戲）：
   - 直啟勝條件之卡
   - 每核心卡最大合法副本數
   - 此不可商——無此則牌組不行
2. 加**支援卡**（8-15 卡）：
   - 尋或護核心引擎之卡
   - 抽／搜效應以增一致性
   - 護關鍵件（反制、護盾、清除）
3. 加**互動**（8-12 卡）：
   - 清對手威脅
   - 擾對手策略
   - 合賽制之防守選項
4. 填**資源基**（遊戲專）：
   - MTG：地牌（六十張常 24-26，四十張 16-17）
   - Pokemon：能量卡（基本 8-12 + 特殊）
   - FaB：pitch 值分配（紅／黃／藍均衡）

**預期：** 完整之牌組列，於或近賽制最小牌數。每卡皆有明角色（核心、支援、互動、資源）。

**失敗時：** 若牌列超賽制尺，先裁最弱支援。若核心引擎須卡過多（>25），策略或太脆——簡勝條件。

### 步驟三：析曲線

驗牌組之資源分配支其策略。

1. 繪**法力／能量／費用曲線**：
   - 數每費點（0、1、2、3、4、5+）之卡
   - 驗曲線合原型：
     - Aggro：峰於 1-2，三之後驟降
     - Midrange：峰於 2-3，4-5 有中度
     - Control：平曲線，更多高費之結算者
     - Combo：集於 combo-piece 之費
2. 查**色／類分配**（MTG：色均衡；Pokemon：能量類覆）：
   - 資源基可靠按曲線施卡乎？
   - 有色重卡需專之資源支乎？
3. 驗**卡類均衡**：
   - 足之生物／攻擊者以施壓
   - 足之法術／訓練師為互動與一致
   - 無關鍵類完全缺
4. 若曲線不支策略則調之

**預期：** 順之曲線令牌組按時行其策略。Aggro 速行，control 早期存活，combo 按時組件。

**失敗時：** 若曲線塊狀（過多貴卡、早期少行），以便宜之替代換貴支援。曲線重於單卡。

### 步驟四：賽局定位

以預期場域評牌組。

1. 辨當前賽局頂五牌組（用賽果、分級表）
2. 每頂牌組評：
   - **順**：汝策略自然剋其（分：+1）
   - **平**：兩牌組皆無結構勢（分：0）
   - **逆**：其策略自然剋汝（分：-1）
3. 算對場域之預期勝率：
   - 以對手賽局佔比加權匹配
   - 對頂五之預期勝率六成以上者位佳
4. 若位不佳，考慮：
   - 換互動卡以針最壞匹配
   - 加邊欄（若賽制允）為逆匹配
   - 另一原型是否位更佳

**預期：** 牌組於賽局之明位。順逆匹配以具體因辨之。

**失敗時：** 若賽局數不可得，聚於多面性——確牌組可與多策略互動，而非為一匹配優化。

### 步驟五：建邊欄

為賽制專之適應建邊欄／side deck（若適）。

1. 每步四之逆匹配：
   - 辨二至四卡可顯改此匹配
   - 此當為高衝卡，非邊際之改
2. 邊欄每卡當知：
   - 於何匹配入之
   - 自主牌組換何
   - 入之是否顯改牌組之曲線
3. 驗邊欄不超賽制限（MTG：15；FaB：異）
4. 確無邊欄卡惟對一邊緣牌組有用
   - 每邊欄槽若可當覆至少二匹配

**預期：** 聚焦之邊欄，顯改最壞匹配而不稀主策略。

**失敗時：** 若邊欄不能修最壞匹配，牌組於當前賽局或位不佳。考慮核心策略是否須調，非邊欄補之。

## 驗證清單

- [ ] 原型與勝條件明定
- [ ] 牌組合賽制合法（禁卡、輪換、卡數）
- [ ] 每卡皆有定角色（核心、支援、互動、資源）
- [ ] 法力／能量曲線支策略之速
- [ ] 資源基可靠按曲線施卡
- [ ] 賽局匹配以具體理評之
- [ ] 邊欄以明換計針最壞匹配
- [ ] 預算之限已滿（若適）

## 常見陷阱

- **勝條件過多**：三勝徑之牌組多皆不精。聚於一至二
- **曲線盲**：加強貴卡而不查是否可按時施
- **忽賽局**：於真空中建。理論最佳牌組敗於實中最常牌組
- **感情之加**：留無益策略之寵物卡。每槽須掙其位
- **邊欄事後**：以剩卡最後建邊欄。邊欄為牌組之部，非附錄
- **過技術**：以針特定牌組之狹答填牌組，而非主動策略

## 相關技能

- `grade-tcg-card` — 為賽制合法與收藏值之卡狀評估
- `manage-tcg-collection` — 為追建牌組可用之卡之庫存管理
