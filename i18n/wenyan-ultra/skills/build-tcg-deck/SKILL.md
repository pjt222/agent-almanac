---
name: build-tcg-deck
locale: wenyan-ultra
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

# 建 TCG 牌組

自原型擇至末優建 TCG 牌組，循跨 Pokemon TCG、Magic: The Gathering、Flesh and Blood 及諸主 TCG 之結構程。

## 用

- 為賽制或休玩建新牌組
- 適已變元遊之現牌組
- 評新卡或擴是否值牌組改
- 教他建牌組則
- 牌念轉賽備列

## 入

- **必**：卡戲（Pokemon TCG、MTG、FaB 等）
- **必**：制（Standard、Expanded、Modern、Legacy、Blitz 等）
- **必**：標（賽競、休玩、廉建）
- **可**：偏原型或策（aggro、control、combo、midrange）
- **可**：預束（最花、已有卡）
- **可**：當元遊拍（頂牌、候域）

## 行

### 一：定原型

擇牌組之策身。

1. 識當制可得原型：
   - **Aggro**：早壓與效擊速勝
   - **Control**：效答威，於晚局以卡勝優勝
   - **Combo**：合具卡組以強聚或即勝
   - **Midrange**：活策—於 aggro 與 control 間按需移
   - **Tempo**：以效時與擾得資優
2. 依擇原型：
   - 玩偏與風
   - 元遊位（何勝頂牌？）
   - 預束（combo 牌常需具貴卡）
   - 制法（察禁列與輪轉）
3. 識 1-2 主勝條：
   - 牌組實何勝？
   - 牌組欲達之理局態？
4. 顯述原型擇與勝條

**得：** 清原型附定勝條。策足具以導卡擇而足活以適。

**敗：** 無原型合→始於可得最強單卡而令原型自卡池現。有時最佳牌組建於卡而非念。

### 二：建核

擇定牌組策之卡。

1. 識**核引**（依戲 12-20 卡）：
   - 直啟勝條之卡
   - 每核卡最多法份
   - 此不可商—牌組無此不行
2. 加**支卡**（8-15 卡）：
   - 尋或護核引之卡
   - 抽/尋效以升一致
   - 要件護（反制、盾、除）
3. 加**互動**（8-12 卡）：
   - 對威之除
   - 對策之擾
   - 適制之守選
4. 填**資基**（戲專）：
   - MTG：地（60 牌典 24-26、40 牌 16-17）
   - Pokemon：能卡（8-12 基 + 特）
   - FaB：棄值分（均 red/yellow/blue）

**得：** 至或近制最小牌大之全牌列。每卡有清角（核、支、互、資）。

**敗：** 牌列過制大→先斷最弱支。核引需過多卡（>25）→策或過脆—簡勝條。

### 三：析曲線

驗牌組資分支其策。

1. 繪 **mana/energy/cost 曲**：
   - 計每費點卡（0、1、2、3、4、5+）
   - 驗曲合原型：
     - Aggro：峰於 1-2，3 後急降
     - Midrange：峰於 2-3，4-5 中有
     - Control：扁曲，多高費終結
     - Combo：聚於 combo 件費
2. 察**色/類分**（MTG：色衡；Pokemon：能類涵）：
   - 資基能依曲穩施卡否？
   - 有需專資支之色密卡乎？
3. 驗**卡類衡**：
   - 足生/擊以加壓
   - 足咒/訓為互與一致
   - 無危類全缺
4. 曲不支策→調

**得：** 平曲令牌依時行策。Aggro 速行、control 早存、combo 時合。

**敗：** 曲顛（過多貴卡、早玩不足）→換貴支卡為廉代。曲要過於任單卡。

### 四：元遊位

較牌組與候域。

1. 識當元頂五牌（用賽果、層表）
2. 每頂牌→評：
   - **利**：策自克其（分：+1）
   - **平**：兩牌無構利（分：0）
   - **不利**：其策自克己（分：-1）
3. 算對域之候勝率：
   - 以對手元份加權配對
   - 對頂五勝率 60%+ 為位佳
4. 若位差→慮：
   - 換互卡以標最壞配對
   - 加邊板（若制允）於不利配對
   - 或他原型位較佳乎

**得：** 牌組於元位之清圖。利與不利配對以具體由識。

**敗：** 無元資→聚於泛—確牌可互多策，非優於一配。

### 五：建邊板

為制專適建邊板/側牌（若適）。

1. 每步四不利配對→
   - 識 2-4 卡顯改配對
   - 此當為高影卡，非微改
2. 每邊板卡知：
   - 入對何配對
   - 代主牌何
   - 入否顯改牌曲
3. 驗邊板不過制限（MTG：15 卡、FaB：變）
4. 確無邊板卡唯對邊緣牌相關
   - 每邊板位當盡涵至少二配對

**得：** 聚邊板顯改最壞配對而不稀主策。

**敗：** 邊板不能修最壞配對→牌於當元或位差。慮核策需調而非邊板補。

## 驗

- [ ] 原型與勝條清定
- [ ] 牌合制法（禁列、輪轉、卡計）
- [ ] 每卡有定角（核、支、互、資）
- [ ] mana/energy 曲支策速
- [ ] 資基可依曲穩施卡
- [ ] 元配對以具體推評
- [ ] 邊板以清換計標最壞配對
- [ ] 預束滿（若適）

## 忌

- **多勝條**：一牌三勝法常皆不精。聚於 1-2
- **曲盲**：加強貴卡而不察牌能否時施
- **略元**：於真空建。理中最佳牌敗於實中最常牌
- **情卡入**：留寵卡而不服策。每位必爭其位
- **邊板後補**：末以餘卡建邊板。邊板為牌之一，非附錄
- **過技**：填牌以窄答於具牌而非主策

## 參

- `grade-tcg-card` — 為賽法與藏值評卡況
- `manage-tcg-collection` — 錄可建牌之卡
