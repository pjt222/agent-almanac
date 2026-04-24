---
name: dissolve-form
locale: wenyan
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

# 解形

控拆僵硬系統之結構——消石化之架構、累積之技債、組織之僵固——而存為新形之種之核心能力（「成蟲盤」）。

## 用時

- 形評（見 `assess-form`）定系統為 PREPARE 或 CRITICAL（過僵難直變）
- 系統石化至增量變不可能
- 技債已累積至阻一切前進
- 組織結構僵至不能適新要
- 欲 `adapt-architecture` 前先軟化當前之形使可重塑
- 遺產系統退役前須取值

## 入

- **必要**：示高剛性之形評（由 `assess-form` 得）
- **必要**：須存之核心能力之識（成蟲盤）
- **可選**：目標形（解形後應顯現者；或未知）
- **可選**：解形之時間表與限
- **可選**：相關者於特定組件之憂
- **可選**：前次解形之試與其果

## 法

### 第一步：識成蟲盤

生物蛻變中，成蟲盤乃毛蟲內一簇細胞，歷解而存，化為蝶之器。識必存之核心能力。

1. 錄當前系統所供之諸能：
   - 面用者之功能
   - 資料處理之函
   - 與外系統之整合點
   - 嵌於代碼／流程中之組織知識
   - 業務規則（常隱而無書）
2. 類每能：
   - **成蟲盤**（必存）：核心業務邏輯、關鍵整合、不可替之資料
   - **可替組織**（可重建）：UI、基礎設施、標準算法
   - **死組織**（不應存）：已無之 bug 之繞過、死系統之相容墊、無人用之功能
3. 將成蟲盤取為可攜形式：
   - 明書業務規則（其或僅存於代碼註釋或部落知識）
   - 取關鍵算法為獨立已測之模塊
   - 以格式無關之表示出核心資料
   - 記整合契約及其實際（非書面）行為

**得：** 諸能清單已類為核心（存）、可替（重建）、死（棄）。解形始前核心能力已取為可攜形式。

**敗則：** 成蟲盤之識不確（相關者於何為核心有異）則寧取偏存。取多於所料之能——解後棄易，失之知識常不可復。

### 第二步：謀解形之序

定結構元件解形之序——外層先，核心最後。

1. 按依賴深度排序：
   - 第 1 層（最外）：無依賴之組件——去之無損
   - 第 2 層：其依賴僅為第 1 層（已解）之組件
   - 第 3 層：依賴更深之組件——去之須謹守接口
   - 第 N 層（核心）：諸皆依之承重組件——最後解
2. 每層定：
   - 何物解之（去、退役、存檔）
   - 何替之（新組件、無物、臨時樁）
   - 餘諸層之須保接口
   - 此層解後何驗系統仍行
3. 立解形檢查點：
   - 每層後，餘系統須測且驗行
   - 每檢查點為解形可暫之穩態
   - 若層解致意外破壞，由前檢查點復之

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

**得：** 層序之解形序，每步穩（檢查點驗）且可逆（前檢查點可復）。最關鍵組件於最後解形，其時隊最有驗與信。

**敗則：** 依賴映射揭循環依賴（A 依 B，B 依 A）則先破環方能順解。於 A、B 間設接口、破環、再續序。

### 第三步：行接口考古

解僵結構前，掘並書其實接口——非書面者，乃實用者。

1. 監測當前接口：
   - 每調、每消息、每資料交換於每接口皆記
   - 行至少一完整業務週期（日、週、月——視相關）
   - 捕實負載形，非僅書面模式
2. 實行對書面行為：
   - 書面接口何未被調？（第 1 層解之候選）
   - 書面之外接口何活躍？（隱依賴——須存或明替）
   - 實流量揭何邊界情形，書面未及？
3. 由實行為立接口契約：
   - 此契約為任何替者之規格
   - 含入出之實例
   - 書錯誤處理行為（實為何，非應為何）

**得：** 經驗所得之接口契約，準確表系統實際通訊，含未書行為與隱依賴。

**敗則：** 監測過侵（損性能或須改代碼）則採樣流量代盡捕。業務週期過長則用已有資料佐以相關者訪談「何時何物調何物」。

### 第四步：控行解形

系統去結構元件而保成蟲盤之活。

1. 始於第 1 層（最外、無依賴）：
   - 去死功能與無用代碼
   - 存檔（勿刪）以作參
   - 驗：系統仍過諸測，無運行錯
2. 歷每層而進：
   - 每解之組件：
     a. 驗成蟲盤已取（第一步）
     b. 若有依賴餘者裝替或樁
     c. 去組件
     d. 行驗證套
     e. 察意外副作用
   - 每檢查點：書系統當前狀，驗行之狀
3. 處解形之抗：
   - 某組件抗解（隱依賴浮出）
   - 去致意外破壞時：
     a. 由檢查點復
     b. 查隱依賴
     c. 加之於接口考古（第三步）
     d. 為該依賴立明樁
     e. 再試解
4. 追解形之進：
   - 餘與解之組件
   - 已取且驗為可攜之成蟲盤
   - 已現且處之意外依賴

**得：** 非核心結構之系統、可驗之解。每層後餘系統更小、更簡、且仍行。成蟲盤保於可攜形式。

**敗則：** 解致級聯失敗則層序有誤——隱依賴深於預期。停、復、重映依賴、重序。若顯「成蟲盤」複雜於預期則該能配更多取時。

### 第五步：備重建之基

解後，餘系統應為最小可行核加取出之成蟲盤，備作重建。

1. 評解後狀：
   - 餘者何？（最小行核 + 取出之能）
   - 餘系統可維否？（隊能解且改否）
   - 諸成蟲盤皆可訪且驗否？（可攜、已測、已書）
2. 立重建清單：
   - 列每成蟲盤及其契約、資料、測試套
   - 明重建之目標架構（或標為「待定」）
   - 識缺口：部分取出或質量有慮之能
3. 交於重建：
   - 目標形已知：以最小核為起點續 `adapt-architecture`
   - 目標形未知：於最小核上運行而設計目標
   - 無論何者：系統今已足柔可塑

**得：** 最小、可維之系統，附明書之取能。基礎潔淨，備以任何所擇之形重建。

**敗則：** 解後系統不可維於預期則某應存之核心結構已解。察成蟲盤清單——若關鍵能缺，或仍可由存檔復。最小核過小不能行則某「可替組織」實為核心——由檢查點復之。

## 驗

- [ ] 成蟲盤已識、取出、驗為可攜形式
- [ ] 解形序由最外（無依賴）至核心層序
- [ ] 接口考古捕實際（非僅書面）行為
- [ ] 每解形層有驗之檢查點
- [ ] 解中無核心能力失
- [ ] 解後系統最小、可維、且行
- [ ] 重建清單書取能與缺口

## 陷

- **未取而解**：取核心能力前去僵組件毀不可復之知識。恆先取成蟲盤
- **信書面甚於觀察**：書面接口常異於實行。接口考古（第三步）顯真；書面顯意圖
- **先解核心**：於依賴未解前去承重結構致級聯失敗。恆由外而內
- **盡解**：盡解以從頭始聽來潔淨然失組織知識、歷驗之邊界處理、運維連續。存成蟲盤
- **解為罰**：解系統「因其不良」而無重建之謀致真空。解乃重建之備，非終點

## 參

- `assess-form` — 前置評估以識僵固且觸解形
- `adapt-architecture` — 繼解形之重建技
- `repair-damage` — 為須定向修而非全解之系統
- `build-consensus` — 大解前之共識可防隊散
- `decommission-validated-system` — 監管系統之正式退役流程
- `conduct-post-mortem` — 事後分析與解形之考據嚴謹相通
