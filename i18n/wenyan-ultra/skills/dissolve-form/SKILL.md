---
name: dissolve-form
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Perform controlled dismantling of rigid system structures while preserving
  essential capabilities (imaginal discs). Covers rigidity mapping, dissolution
  sequencing, knowledge extraction, interface archaeology, and safe decomposition
  of technical debt and organizational calcification. Use when assess-form
  classified the system as PREPARE or CRITICAL, when a system is so calcified
  that incremental change is impossible, when technical debt blocks all forward
  progress, or before adapt-architecture when the current form must be softened
  before it can be reshaped.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: morphic
  complexity: advanced
  language: natural
  tags: morphic, dissolution, decomposition, technical-debt
---

# 溶形

控拆僵系之構，溶固化架、積技債、組織之硬，存核能（成蟲盤）以播新形。

## 用

- 形析（見 `assess-form`）判系為 PREPARE 或 CRITICAL（過僵不可直變）
- 系固化至漸變不可
- 技債積至塞諸進路
- 組織硬至不能適新需
- `adapt-architecture` 前宜軟當形以可再塑
- 舊系退役宜先取值

## 入

- **必**：形析示高僵（由 `assess-form`）
- **必**：存之核能（成蟲盤）之識
- **可**：目形（溶後宜出者；可未知）
- **可**：溶時線及限
- **可**：眾對某組件之憂
- **可**：昔溶之試與其果

## 行

### 一：識成蟲盤

生物變態中，成蟲盤乃蠹中存溶之細胞群，為蝶之官。識必存之核能。

1. 錄當系諸能：
   - 面使者之功
   - 數處之函
   - 外系之介
   - 嵌於碼／程之機構知
   - 商規（常隱未書）
2. 各能分類：
   - **成蟲盤**（必存）：核商邏、關鍵介、不可替之數
   - **可替組織**（可重建）：UI、基礎、標算
   - **死組織**（不宜存）：已無錯之繞、死系之相容墊、無人用之功
3. 取成蟲盤為可攜形：
   - 明書商規（或僅存於碼注或口傳）
   - 取關鍵算為獨立已測模
   - 導核數為格式獨立之表
   - 記介契與其實（非書）行

得：諸能之錄，分核（存）、可替（建）、死（棄）。始溶前核能已取為可攜形。

敗：成蟲盤識不定（眾議核為何）→偏存。取勝於所思→溶後棄易，知失常不復。

### 二：繪溶序

定構素溶之序—外先，核末。

1. 依依賴深排：
   - 層一（最外）：無依者之組件—去無破
   - 層二：其依僅為層一（已溶）之組件
   - 層三：深依之組件—去之宜慎管介
   - 層 N（核）：承重者—末溶
2. 各層定：
   - 所溶（去、退、存檔）
   - 所替（新組、無、或臨時墊）
   - 餘層宜維之介
   - 該層溶後驗系仍運之法
3. 立溶點：
   - 各層後餘系宜測並驗運
   - 各點為可暫停之穩態
   - 該層溶致意外破→復至前點

```
Dissolution Sequence (outside in):
┌─────────────────────────────────────────────────────────────────┐
│ Layer 1: Dead features, unused integrations, orphaned code      │
│          → Remove. Nothing depends on these.                    │
│                                                                 │
│ Layer 2: Replaceable UI, standard infrastructure                │
│          → Replace with modern equivalents or stubs             │
│                                                                 │
│ Layer 3: Business logic wrappers, data access layers            │
│          → Extract imaginal discs, then dissolve                │
│                                                                 │
│ Layer 4 (core): Load-bearing structures, data stores            │
│          → Dissolve last, with full replacement ready           │
└─────────────────────────────────────────────────────────────────┘
```

得：層序溶法，各步安（點已驗）且可逆（前點可復）。最關鍵組件末溶，時隊有最多經驗及信。

敗：依賴圖現循環（A 依 B 依 A）→宜破環後再行。A 與 B 間引介以破，後行序。

### 三：作介考古

溶僵構前，掘並書其實介—非書者，乃實用者。

1. 現介裝儀：
   - 記諸呼、訊、數換於各介
   - 運至少一全商週（日、週、月—宜者）
   - 捕實負荷之形，非僅書綱
2. 實對書行比：
   - 何書介從未呼？（層一溶之候）
   - 何未書介正用？（隱依—宜存或明替）
   - 實流示何邊例而書不提？
3. 由實行建介契：
   - 此契為替之規
   - 含實入出例
   - 書錯處行（實發，非宜發）

得：據實導之介契，實表系如何實通，含未書行與隱依。

敗：裝儀過侵（影效或需改碼）→採樣代全捕。商週太長→用已得數加眾訪（「何況下何呼何」）。

### 四：行控溶

系拆諸構素而存成蟲盤之存。

1. 始於層一（最外，無依）：
   - 去死功與未用碼
   - 存檔（勿刪）以備
   - 驗：系仍過諸測，無運時錯
2. 歷各層：
   - 各溶組件：
     a. 驗成蟲盤已取（步一）
     b. 裝替或墊（若餘依）
     c. 去組件
     d. 行驗套
     e. 察意外副作
   - 各點：書當系態，驗運狀
3. 處溶阻：
   - 有組件抗溶（隱依現）
   - 去致意外破：
     a. 復自點
     b. 考隱依
     c. 加入介考古（步三）
     d. 為依建明墊
     e. 再試溶
4. 追溶進：
   - 餘 vs 溶之組件
   - 取並驗可攜之成蟲盤
   - 發現並處之意外依

得：系拆非核構之驗。各層後餘系更小、更簡、仍運。成蟲盤存為可攜形。

敗：溶致連鎖敗→層序誤→隱依深過所期→停、復、重繪依、重序。溶示「成蟲盤」較預期雜→為該能配更多取時。

### 五：備重建之基

溶後餘系宜為最小可行核+已取成蟲盤備重建。

1. 察溶後態：
   - 餘何？（最小運核+已取之能）
   - 餘系可維乎？（隊可解並改乎）
   - 諸成蟲盤可取並驗乎？（可攜、已測、書）
2. 立重建清單：
   - 列各成蟲盤與其契、數、測套
   - 定重建目架（或標「待定」）
   - 識缺：僅部取或質疑之能
3. 交重建：
   - 目形已知→以最小核為起進 `adapt-architecture`
   - 目形未知→於最小核運，同時設目
   - 無論如何：系今足軟以可再塑

得：最小可維之系，含明書之已取能。基淨備重建於任擇形。

敗：溶後系較預期不可維→有宜存之核構被溶→查成蟲盤錄，若關鍵能失仍可由檔復。最小核太小不能運→某「可替組織」實為核→由點復。

## 驗

- [ ] 成蟲盤已識、取、驗於可攜形
- [ ] 溶序層於最外（無依）至核
- [ ] 介考古已捕實（非僅書）行
- [ ] 各溶層有驗點
- [ ] 溶中無核能失
- [ ] 溶後系最小、可維、運
- [ ] 重建清單書已取能與缺

## 忌

- **溶而不取**：去僵組件前其核能未取→毀不可替之知→常先取成蟲盤
- **信書勝實察**：書介常異實行→介考古（步三）示真，書示意
- **先溶核**：去承重構於其依前→致連鎖敗→常外入
- **全溶**：全溶以從零始似淨而失機構知、戰試邊例處、運續→存成蟲盤
- **溶為罰**：無重建計而溶系「因其劣」→造空→溶乃重建之備，非末

## 參

- `assess-form`
- `adapt-architecture`
- `repair-damage`
- `build-consensus`
- `decommission-validated-system`
- `conduct-post-mortem`
