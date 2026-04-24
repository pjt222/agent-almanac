---
name: dissolve-form
locale: wenyan-lite
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

# 化形

有控而拆僵固之系統結構——化石化之架構、累積之技術債、組織之僵——同時存其核心能力（「成蟲盤」），以為新形之種。

## 適用時機

- 形態評估（見 `assess-form`）將系統分為 PREPARE 或 CRITICAL（太僵固不可直接變形）
- 系統石化至漸變不可能
- 技術債累積至阻所有前進
- 組織結構僵固至不能適新要求
- 於 `adapt-architecture` 前，現形須先軟化方可重塑
- 遺留系統退役，於關停前須萃其價值

## 輸入

- **必要**：示高僵固之形態評估（由 `assess-form`）
- **必要**：須存之核心能力之辨（成蟲盤）
- **選擇**：目標形態（化後當現之形，或尚未知）
- **選擇**：化解之時限與約束
- **選擇**：相關方對具體元件之關切
- **選擇**：先前化解之嘗試及其結果

## 步驟

### 步驟一：辨成蟲盤

於生物變態中，成蟲盤為毛蟲內之細胞群，存於化解之中而後成蝴蝶之器官。辨必須存之核心能力。

1. 編現系統所供每項能力之目錄：
   - 面向使用者之功能
   - 數據處理函數
   - 與外部系統之整合點
   - 嵌於代碼/流程之機構知識
   - 業務規則（常隱而未錄）
2. 分每能力：
   - **成蟲盤**（必存）：核心業務邏輯、關鍵整合、不可替代之數據
   - **可替組織**（可重建）：UI、基礎設施、標準算法
   - **壞死組織**（不當存）：已不存之錯誤之變通、已死系統之相容墊、無人用之功能
3. 萃成蟲盤為可攜形式：
   - 明錄業務規則（或僅存於代碼注釋或口耳之中）
   - 萃關鍵算法為獨立且已測之模組
   - 以格式無關之表示導出關鍵數據
   - 錄整合合約及其實際（非文檔之）行為

**預期：** 能力之清晰清單，分為核心（存）、可替（重建）、壞死（棄）。核心能力於化解始前萃為可攜之形。

**失敗時：** 成蟲盤之辨不確（相關方對核心者之判有歧）時，寧多存。所萃寧多於所需——化解後棄之易；失之則每不可復。

### 步驟二：繪化解序

定結構元素化解之序——先外層，後核心。

1. 依依賴深度排序：
   - 第一層（最外）：無依賴者之元件——除之無破
   - 第二層：依賴者僅為第一層之元件（已化解者）
   - 第三層：具深依賴之元件——除之須謹慎管介面
   - 第 N 層（核心）：承載之元件，一切所依——最後化解
2. 每層定：
   - 化解者何（除、退役、存檔）
   - 代之者何（新元件、無、或暫時樁）
   - 為餘層須保之介面為何
   - 此層化解後，如何驗系統仍運作
3. 建化解檢查點：
   - 每層後，餘系統須測並驗其運作
   - 每檢查點為可暫停之穩定狀態
   - 若某層之化解致意外破，由前檢查點恢復

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

**預期：** 依層序之化解序，每步皆安（檢查點已驗）且可逆（前檢查點可復）。最關鍵之元件於團隊經驗與信心最足時最後化解。

**失敗時：** 依賴映射示循環依賴（A 依 B、B 依 A）時，循環須先破，序化方可行。於 A 與 B 之間引介面，破循環，後續行之。

### 步驟三：行介面考古

於化解僵結構前，掘並錄其實際介面——非文檔所述，乃實際所用。

1. 儀器化現介面：
   - 錄每介面之每次呼叫、消息、數據交換
   - 運行至少一完整業務週期（日、週、月——視其相關）
   - 捕實際負載之形，非僅文檔之模式
2. 對比實際與文檔之行為：
   - 何文檔介面從未被呼叫？（第一層化解之候）
   - 何未文檔之介面活躍於用？（隱依賴——必存或明確替之）
   - 實際流量揭示之邊角，文檔未提者何？
3. 由實際行為建介面合約：
   - 此合約為任何替代之規格
   - 含輸入輸出之實例
   - 錄錯誤處理之行為（實際所為，非應為）

**預期：** 經驗導出之介面合約，準確表系統實際之通信方式，含未文檔之行為與隱依賴。

**失敗時：** 儀器化過於侵入（影響性能或需代碼變）時，抽樣流量代全捕。業務週期過長不待時，以現有數據佐以相關方之訪談（「何情況下何呼何」）。

### 步驟四：行有控之化解

系統化除結構元素，同時保成蟲盤之活。

1. 自第一層始（最外，無依賴者）：
   - 除死功能與未用之代碼
   - 存檔（勿刪）以備參考
   - 驗：系統仍過所有測試，無運行期錯誤
2. 逐層推進：
   - 每化解之元件：
     a. 驗成蟲盤已萃（步驟一）
     b. 裝替代或樁（若餘依賴者）
     c. 除該元件
     d. 行驗證套件
     e. 監意外之副作用
   - 每檢查點：錄當前系統狀態，驗運作狀況
3. 治化解阻力：
   - 某些元件抗化解（隱依賴浮現）
   - 除時致意外破時：
     a. 自檢查點恢復
     b. 查隱依賴
     c. 加之入介面考古（步驟三）
     d. 為此依賴建明樁
     e. 重試化解
4. 追化解進度：
   - 餘者對化解者
   - 成蟲盤萃出並驗其可攜
   - 意外依賴發現並處之

**預期：** 非核心結構之系統化、已驗之化解。每層後，餘系統更小、更簡，仍運作。成蟲盤以可攜形式存。

**失敗時：** 化解致級聯失敗時，層序有誤——隱依賴深於所期。停、復、重繪依賴、重序之。化解揭成蟲盤較所期複雜時，為該能力分配多萃時。

### 步驟五：備重建之基

化解後，餘系統當為最小可行核心加所萃成蟲盤，已備重建。

1. 評化解後之狀態：
   - 何餘？（最小運作核心 + 所萃能力）
   - 餘系統可維乎？（團隊能解且能改之）
   - 所有成蟲盤可取並驗乎？（可攜、已測、已錄）
2. 建重建清單：
   - 列每成蟲盤及其合約、數據、測試套件
   - 定重建之目標架構（或標為「待定」）
   - 辨缺口：部分萃出或質量有虞之能力
3. 交接至重建：
   - 目標形已知：以最小核心為起點進 `adapt-architecture`
   - 目標形未知：於最小核心上運作，同時設計目標
   - 無論何，系統今足以柔，可供重塑

**預期：** 最小、可維、所萃能力已明錄之系統。基底乾淨，備以任何所擇形式重建。

**失敗時：** 化解後系統較所期不可維時，某應存之核心結構被化解。查成蟲盤清單——若某關鍵能力缺，或可由存檔復之。最小核心過於最小而不能運作時，某「可替組織」實為核心——自檢查點復之。

## 驗證

- [ ] 成蟲盤已辨、已萃、以可攜形式驗之
- [ ] 化解序分層，由最外（無依賴）至核心
- [ ] 介面考古捕實際（非僅文檔）之行為
- [ ] 每化解層皆有已驗之檢查點
- [ ] 化解中無核心能力失
- [ ] 化解後系統為最小、可維、運作
- [ ] 重建清單錄所萃能力與缺口

## 常見陷阱

- **化而不萃**：於核心能力萃出前即除僵元件，毀不可替代之知識。恆先萃成蟲盤
- **信文檔而不觀**：文檔介面常與實際行為異。介面考古（步驟三）示真實；文檔示意圖
- **先化核心**：於依賴者化解前即除承載結構，致級聯失敗。恆自外而內
- **全部化解**：化解一切以自零重建似清潔，然失機構知識、實戰所磨之邊角處理、運作連續性。存成蟲盤
- **化解為懲**：無重建計而「因其不佳」化解系統致真空。化解為重建之備，非其本身為目的

## 相關技能

- `assess-form` — 辨僵固並觸發化解之前置評估
- `adapt-architecture` — 化解後之重建技能
- `repair-damage` — 需針對性修復而非全面化解之系統
- `build-consensus` — 大化解前立共識以防團隊裂
- `decommission-validated-system` — 受管制系統之正式退役流程
- `conduct-post-mortem` — 事後分析與化解共其調查之嚴謹
