---
name: athanor
locale: wenyan-ultra
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

煉碼或數之四階變——黑（解）、白（淨）、黃（明）、紅（合）——階間有冥與癒檢點。

## 用

- 變舊碼為現等→用
- 重構深糾模而漸修恆敗→用
- 庫範變（程序至函、整至模）→用
- 治原亂數為清析集→用
- 簡重構停而需全環變→用

## 入

- **必**：欲變料（檔路、模名、數源）
- **必**：欲末態（標構、範、式）
- **可**：知限（必存 API、不可改數模等）
- **可**：前敗變試與停由

## 行

### 一：黑——解

破原料為其元。無聖；皆錄。

1. 全錄料：
   - 列各函、類、模、數實
   - 圖諸依（入、呼、數流）
   - 識隱耦（共全、隱態、副效）
2. 顯隱設：
   - 碼賴何無文行？
   - 何誤況默吞？
   - 何序依存？
3. 錄反例與技債：
   - 神物、循依、複貼
   - 死碼、不達枝、遺特
   - 硬碼、魔數、嵌設
4. 出**黑錄**：諸件、依、設、反例之構錄

得：無畏完料錄。錄當不適——若不則解未深。每隱設皆明。

敗：料太大不能全錄→按模界分各為獨煉行。依太纏不能圖→用 `grep`/`Grep` 追實呼處非賴文。

### 二：冥——煅檢點

行 `meditate` 清黑期積之設。

1. 置黑錄而清心脈
2. 定於入述變之標
3. 察黑入之偏——解使某法似必？
4. 標早解念為「岔」而返標

得：清、無偏態評料而不為今形定。標似新非為所見限。

敗：黑發拉注（甚劣反例、誘存之巧 hack）→書下而明置。標清於今形再進。

### 三：白——淨

分本與偶。剝諸不為標形者。

1. 自黑錄分各件：
   - **本**：核商邏、不可代算、關數變
   - **偶**：框模、舊蟲變通、容片
   - **毒**：反例、安洞、死碼
2. 取本入孤：
   - 拉核邏出框包
   - 分數變於 I/O
   - 取介於施
3. 全去毒——文何去與何由
4. 偶件定標形有等否
5. 出**白萃**：淨本邏附清介

得：純、孤函/模代原料核值。各部可孤測。萃顯小於原。

敗：本與偶纏不能分→先入縫點（介）。料抗淨→或需 `dissolve-form` 後煉再續。

### 四：癒——淨評

行 `heal` 評淨深否。

1. 分白萃：仍載毒餘乎？
2. 察偏：淨偏自原變標乎？
3. 評全：本件皆計或某早棄？
4. 重衡：誤分為偶之本件復原

得：信白萃完、清、備明。無本邏失；無毒紋留。

敗：評揭大缺→回三附識具缺。料不全勿入黃。

### 五：黃——明

見標形。圖淨件至最佳構。

1. 紋識：識何設紋為淨件：
   - 數流示管/濾、事源、CQRS 乎？
   - 介示策、配、面乎？
   - 模構示六角、層、微核乎？
2. 設標構：
   - 圖各本件至新位
   - 定件間介
   - 規數於新構之流
3. 識須新建（原無等）：
   - 統重邏之新抽
   - 代隱耦之新介
   - 代默敗之新誤理
4. 出**黃藍**：自白萃至標形之完圖

得：清、詳藍各本件有家、各介定。藍當似必——予淨件此構為自然合。

敗：多有效構爭→各按入限評。無明勝→偏最簡而文選為後。

### 六：冥——合前檢

行 `meditate` 為末合備。

1. 清黃之析脈
2. 定於黃藍為合導
3. 察變憂——有何急乎？
4. 確備：藍清、料淨、限知

得：對所建之靜清。合期當為行非設。

敗：藍存疑→回五附具憂。藍精勝以不確始合。

### 七：紅——合

合淨件為標形。賢者石：行、優之碼。

1. 按黃藍築新構：
   - 建檔、模、介如規
   - 遷各本件至新位
   - 施新抽與介
2. 接諸件：
   - 接設之數流
   - 經新路施誤傳
   - 設依注或模載
3. 驗合：
   - 各件孤行乎？（單測）
   - 諸件正合乎？（整測）
   - 全系出同原乎？（退測）
4. 撤架：
   - 刪暫容片
   - 去遷助
   - 清舊構之餘引
5. 出**紅果**：變碼，於新形全功

得：行碼可量勝原：少行、清構、加測覆、減依。變畢，舊形可棄。

敗：合揭藍缺→勿補——回五（黃）改設。獨件敗→孤修再試全整。紅勿出半變嵌合怪。

## 驗

- [ ] 黑錄完（諸件、依、設皆錄）
- [ ] 黑/白間冥檢過（設清）
- [ ] 白萃唯本件附清介
- [ ] 癒評確淨完
- [ ] 黃藍圖每本件至標形
- [ ] 黃/紅間冥檢過（備合）
- [ ] 紅果通對原行之退測
- [ ] 紅果可量改（繁、耦、測覆）
- [ ] 無毒件存末果
- [ ] 入變限滿

## 忌

- **略黑深**：急解致隱耦於合期顯。全投錄
- **存偶繁**：執巧變通或「行之，勿觸」碼。非本則去
- **略冥檢**：一階心勢偏次。停為構非可選
- **無藍合**：黃未完即始碼出補非變
- **退測不全**：紅須生原行。未測路將默破
- **黃中範蔓**：明期揭原標外改機。註之而勿追——煉服述變非擬理

## 參

- `transmute` —— 為單函或小模之輕變
- `chrysopoeia` —— 值取與優（化基碼為金）
- `meditate` —— 階檢用之元清
- `heal` —— 淨驗用之子系評
- `dissolve-form` —— 料太剛於煉時先溶
- `adapt-architecture` —— 系階遷紋之伴
- `review-software-architecture` —— 合後構察
