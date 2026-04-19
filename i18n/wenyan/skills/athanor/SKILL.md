---
name: athanor
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Four-stage alchemical code transmutation — nigredo (decomposition), albedo
  (purification), citrinitas (illumination), rubedo (synthesis) — with meditate
  and heal checkpoints between stages. Transforms tangled or legacy code into
  optimized, well-structured output through systematic material analysis. Use
  when transforming legacy code into modern equivalents, refactoring deeply
  tangled modules where incremental fixes keep failing, converting a codebase
  between paradigms, or when simpler refactoring approaches have stalled and a
  full-cycle transformation is needed.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: alchemy
  complexity: advanced
  language: multi
  tags: alchemy, transmutation, refactoring, transformation, four-stages, nigredo, albedo, citrinitas, rubedo
---

# 煉爐

行碼或數之四階煉金轉化——nigredo（解）、albedo（淨）、citrinitas（明）、rubedo（合）——間置冥想與愈之察點。煉爐乃諸階保恆溫之爐也。

## 用時

- 變遺碼為今之等乃用
- 重構深纏模而漸修屢敗乃用
- 轉碼庫於諸範間（程式至函式、巨石至模塊）乃用
- 處原亂數為淨析數集乃用
- 輕重構法已滯而需全環轉乃用

## 入

- **必要**：待變之材（檔徑、模名、或數源）
- **必要**：所求末態（目架構、範、或式）
- **可選**：已知約（須守 API、不可改庫模等）
- **可選**：前敗試與其滯之由

## 法

### 第一步：Nigredo — 解

破原材為構元。無神聖；一切錄。

1. 全錄材：
   - 列每函、類、模、或數實
   - 映諸依（入、呼、數流）
   - 識隱耦（共全、隱態、副作）
2. 露隱假：
   - 碼依何未書行？
   - 何錯條默吞？
   - 何序依存？
3. 錄反式與技債：
   - 神物、環依、複貼重
   - 死路、不及枝、遺功
   - 硬值、魔數、嵌設
4. 生 **Nigredo 錄**：每元、依、假、反式之結構化錄

**得：** 材之全不退錄。錄當覺不適——若不然，解不徹。諸隱假今明。

**敗則：** 若材過大不可全錄，按模界解而各為獨煉爐行。若依過纏不可映，以 `grep`/`Grep` 追實呼位代文。

### 第二步：冥想 — 煅察點

行 `meditate` 以清 nigredo 所積之假。

1. 置 nigredo 錄而清心境
2. 錨於入所述之變目
3. 察 nigredo 引之偏——解使某法似不可免乎？
4. 標早解念為「旁」而返目

**得：** 清之無偏態備評材而不錨於當前之形。目覺新而非受現形所限。

**敗則：** 若 nigredo 發現屢引注（特惡反式、巧 hack 誘存），書而明置之。唯目清於當前形時進。

### 第三步：Albedo — 淨

別本於偶。去諸不事目形者。

1. 自 nigredo 錄分每元：
   - **本**：核業邏、不替算法、關數變
   - **偶**：框架皮、舊錯變通、兼容墊
   - **毒**：反式、安漏、死碼
2. 取本元於孤：
   - 自框架皮取核邏
   - 別數變於 I/O
   - 自實取界
3. 全除毒元——書除何與何以
4. 偶元則定目形有等乎
5. 生 **Albedo 取**：淨本邏附清界

**得：** 一組純孤之函/模表原材之核值。每片可孤試。取顯小於原。

**敗則：** 若本偶過纏不可別，先立縫點（界）。若材抗淨，或需 `dissolve-form` 於煉爐續前。

### 第四步：愈 — 淨察

行 `heal` 察淨徹乎。

1. 分 albedo 取：仍持毒殘乎？
2. 察偏：淨偏於原變目乎？
3. 察全：諸本元皆計乎、或早棄？
4. 若需再衡：復誤分為偶之本元

**得：** 信 albedo 取全、淨、備明。無本邏失；無毒式留。

**敗則：** 若察顯要隙，返第三步附所識隙。勿於材不全時進 citrinitas。

### 第五步：Citrinitas — 明

見目形。映淨元於其佳構。

1. 式識：識何設計式事淨元
   - 數流示管/濾、事件源、CQRS 乎？
   - 界示策、適、外觀乎？
   - 模構示六角、層、微核乎？
2. 設目架構：
   - 映每本元於新位
   - 定組件間之界
   - 述新構中數流
3. 識須新建者（原無等）：
   - 統複邏之新抽象
   - 代隱耦之新界
   - 代默敗之新誤處
4. 生 **Citrinitas 藍**：自 albedo 取至目形之全映

**得：** 清詳之藍，每本元有家、每界有定。藍當覺不可免——予淨元則此構為自然合。

**敗則：** 若多有效架構競，對入之約評各。若無明勝者，擇最簡而書他為未來擇。

### 第六步：冥想 — 合前察點

行 `meditate` 備終合。

1. 清 citrinitas 之析境
2. 錨於 citrinitas 藍為合之導
3. 察變之焦——何被急乎？
4. 確備：藍清、材淨、約知

**得：** 所建之靜清。合階當為執，非設。

**敗則：** 若藍疑持，返第五步附具憂。精藍勝於疑而始合。

### 第七步：Rubedo — 合

組淨元於目形。賢者之石：行而優之碼。

1. 循 citrinitas 藍建新構：
   - 建檔、模、界如所規
   - 遷每本元至新位
   - 實新抽象與界
2. 連組：
   - 接數流如所設
   - 實新路誤傳
   - 設依注或模載
3. 驗合：
   - 各組孤行乎？（單試）
   - 組正組乎？（整試）
   - 全系生同原之出乎？（回歸試）
4. 除鷹架：
   - 除暫兼容墊
   - 除遷助
   - 清留於舊構之引
5. 生 **Rubedo 出**：已轉之碼，全行於新形

**得：** 行碼於原可量進：少行、清構、好試覆、少依。變已成，舊形可退。

**敗則：** 若合露藍隙，勿補——返第五步（citrinitas）改設。若組失，孤修之而後試整合。rubedo 不可生半變之嵌合。

## 驗

- [ ] Nigredo 錄全（諸元、依、假皆錄）
- [ ] Nigredo/albedo 間冥想察點過（假清）
- [ ] Albedo 取只含本元附清界
- [ ] 愈察確淨全
- [ ] Citrinitas 藍映每本元於目形
- [ ] Citrinitas/rubedo 間冥想察點過（備合）
- [ ] Rubedo 出過原行之回歸試
- [ ] Rubedo 出可量進（繁度、耦、試覆）
- [ ] 無毒元存於終出
- [ ] 入之變約皆達

## 陷

- **跳 nigredo 之深**：急解致合中隱耦露。盡投於錄
- **存偶繁**：戀巧變通或「行勿觸」之碼。非本則去
- **跳冥想察點**：一階之認知勢偏下一。頓為結構，非選
- **無藍合**：citrinitas 未盡前始碼生補丁，非轉化
- **不全回歸試**：rubedo 須重現原行。未試路默破
- **citrinitas 中範蔓**：明階露原目外之進機。注而勿追——煉爐事所述之變，非臆想

## 參

- `transmute` — 單函或小模之輕變
- `chrysopoeia` — 值取與優（變基碼為金）
- `meditate` — 階門察點之元認知清
- `heal` — 淨驗之子系察
- `dissolve-form` — 材過剛不可煉時先溶
- `adapt-architecture` — 系級遷式之補法
- `review-software-architecture` — 合後架構審
