---
name: remote-viewing
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  AI intuitive exploration for approaching unknown codebases, problems,
  or systems without preconceptions. Adapts the Coordinate Remote Viewing
  protocol to AI investigation: cooldown (clear assumptions), staged data
  gathering (raw signals → dimensional → analytical), AOL management
  (separating observations from premature labels), and structured review.
  Use when investigating an unfamiliar codebase with unknown architecture,
  debugging a problem where premature hypotheses could mislead, exploring a
  domain with limited context, or when previous attempts have been led astray
  by assumptions and "beginner's mind" would be more productive.
license: MIT
allowed-tools: Read Glob Grep
metadata:
  author: Philipp Thoss
  version: "2.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, remote-viewing, exploration, investigation, assumption-management
---

# 遠視

以坐標遠視協議改編為 AI 調查之法接近未知之代碼庫、問題或系統——於形成結論之前收集原始觀察、管理過早之標籤化（分析疊加），並透過分階資料收集建立理解。

## 適用時機

- 調查架構未知之陌生代碼庫
- 調試根因不顯之問題，其過早之假設恐誤導
- 探索脈絡有限之領域或技術
- 先前調查嘗試為假設所引偏
- 接近任何「初心」勝於模式匹配之問題

## 輸入

- **必要**：擬調查之標的（代碼庫路徑、問題描述、待理解之系統）
- **必要**：對盲取法之承諾——資料收集完成前抗形成結論
- **選擇性**：對標的之具體問題（留至 Stage V）
- **選擇性**：先行冥想以清假設（見 `meditate`）

## 步驟

### 步驟一：冷卻——清假設

自重假設模式轉至接納觀察。此步不可商榷。

1. 識所有對標的之成見：
   - 「此恐為 React 應用」——宣之
   - 「錯恐在資料庫層」——宣之
   - 「此循 MVC 架構」——宣之
2. 將每成見明寫之（於推理或輸出中）
3. 對每，記：「此或然或不然。吾將驗，不假設。」
4. 釋速辨標的之需——目標在準描，非速標
5. 察分析心觸框架或標籤時，暫停並引轉至原始觀察

**預期：** 已宣成見之清單與意識之轉變，自「吾以為知此」至「吾將觀此實為何」。警覺接納，不跳結論。

**失敗時：** 若假設屢次回歸（「然其實 IS React 應用……」），延長冷卻。將假設書於「停車場」清單續行。勿於積極依某一假設時始資料收集——其將染所觀。

### 步驟二：表意符——首次接觸（Stage I）

藉最小之觀察與標的作初次接觸。

1. 用 `Glob` 僅見頂層結構（如 `*` 或 `path/*`）——尚勿讀任何文件
2. 記立即未過濾之印象：文件數、命名模式、明顯標記之有無
3. 以簡單描述符記原始觀察：
   - 「許多小文件」非「微服務架構」
   - 「深度嵌套目錄」非「企業 Java」
   - 「單一大文件」非「單體」
4. 將初印象解碼為兩分量：
   - **A**（活動）：此活躍抑或休眠？成長抑或穩定？簡單抑或複雜？
   - **B**（感）：此感組織抑或混亂？密抑或稀？熟抑或異？
5. 書 A 與 B 之評估——此為首批資料點

**預期：** 對標的表面特徵之少數原始低層觀察。無名、無標籤、無架構模式——僅形、大小、質感。

**失敗時：** 若立即類別化項目（「噢，此 Next.js 應用」），宣為 AOL（步驟六），抽其下之原始描述符（「JavaScript 文件、嵌套之 pages 目錄、package.json 存在」），續以該等原始觀察。

### 步驟三：感官印象——原始資料（Stage II）

系統化收集標的之原始資料而不解釋。

```
Stage II Data Channels for Codebase Investigation:
┌──────────────────┬────────────────────────────────────────────────────┐
│ Channel          │ What to Observe                                    │
├──────────────────┼────────────────────────────────────────────────────┤
│ File patterns    │ Extensions, naming conventions, file sizes         │
│                  │ (NOT frameworks — just patterns)                   │
├──────────────────┼────────────────────────────────────────────────────┤
│ Directory shape  │ Depth, breadth, nesting patterns, symmetry         │
├──────────────────┼────────────────────────────────────────────────────┤
│ Configuration    │ What config files exist? How many? What formats?   │
├──────────────────┼────────────────────────────────────────────────────┤
│ Dependencies     │ Lock files present? How large? How many entries?   │
├──────────────────┼────────────────────────────────────────────────────┤
│ Documentation    │ README present? How long? Other docs? Comments?    │
├──────────────────┼────────────────────────────────────────────────────┤
│ Test presence    │ Test directories? Test files? Ratio to source?     │
├──────────────────┼────────────────────────────────────────────────────┤
│ History signals  │ Presence of .git/, CHANGELOG/RELEASE_NOTES,        │
│                  │ lockfile timestamps (via Glob/Read if accessible)  │
├──────────────────┼────────────────────────────────────────────────────┤
│ Energy/activity  │ Which areas changed recently? Which are dormant?   │
└──────────────────┴────────────────────────────────────────────────────┘
```

1. 用 `Glob`、`Grep` 與輕量 `Read` 操作探每頻道
2. 每頻道記一觀察——初印象，勿深掘
3. 用描述性詞，非標籤：「73 個 .ts 文件」非「TypeScript 項目」
4. 圈（標）感特顯之觀察
5. 若某頻道無顯著者，記「無觀察」而行
6. 跨所有頻道瞄準 10-20 資料點

**預期：** 感發現而非假設之原始觀察清單。或顯或噪。資料應為低層描述，非高層分類。

**失敗時：** 若每觀察化為分類，已滑入分析。停，回表意符步驟，以新眼再接標的。若一頻道主導（皆文件觀察、無歷史），刻意轉至少用之頻道。

### 步驟四：維度資料——結構（Stage III）

自原始觀察移至空間與結構之理解。

1. 始繪標的之架構而不標籤之：
   - 何連何？（imports、引用、配置指標）
   - 主要「區」為何，其關係為何？
   - 階層為何——平、嵌或混？
2. 輕讀少數關鍵文件——入口點、配置文件、README
3. 記關係：「目錄 A 自目錄 B 引入」、「配置文件引 C 中之路徑」
4. 草繪空間佈局：資訊如何流經系統？
5. 記美學衝擊（AI）——此代碼庫感為何？善維護？匆忙？實驗？

**預期：** 帶關係註解之粗略結構圖。標的之大致範圍（大／小、簡／繁、單體／模組）漸明。代碼庫之「感」被捕。

**失敗時：** 若圖感似純猜，化簡：僅記可驗之連接（實際 import 述句、實際配置引用）。若無結構模式現，回 Stage II 收更多原始資料——維度理解需觀察為基。

### 步驟五：詰問——定向問題（Stage V）

於古典 CRV 中，Stage IV 聚焦更深分析結構；於代碼庫調查，該工作刻意併入前述維度／結構各階，故本改編協議直進 Stage V 作定向詰問。

至此，且僅於此時，將具體問題帶入調查。

1. 明陳每問題：「入口點為何？」「資料自何來？」「測試覆蓋為何？」
2. 對每問題，以 `Grep` 與 `Read` 尋答——定向而非探索
3. 對每問題記首次發現
4. 記信心級：高（直接證據）、中（推導）、低（不確）
5. 明標所有 Stage V 資料——其載 AOL 風險較高，因問題啟期待

**預期：** 對定向問題之具體答案，立基於已收集之原始與結構資料。信心級誠實。

**失敗時：** 若定向問題僅產 AOL（自假設而非證據答之），回早階。CRV 協議序列有故——略觀察階而跳問題產出不可靠之答。

### 步驟六：管理分析疊加（AOL）

AOL 乃調查中誤之主源。其於分析心過早標記標的時生。整個會話皆須管理。

```
AOL Types in Codebase Investigation:
┌──────────────────┬─────────────────────────────────────────────────┐
│ Type             │ Description and Response                        │
├──────────────────┼─────────────────────────────────────────────────┤
│ AOL (labeling)   │ "This is a Django app" — Declare: "AOL: Django"│
│                  │ Extract raw descriptors: "Python files, urls.py,│
│                  │ migrations directory, settings module."         │
├──────────────────┼─────────────────────────────────────────────────┤
│ AOL Drive        │ The label becomes insistent: "This HAS to be   │
│                  │ Django." Declare "AOL Drive" and pause. What    │
│                  │ evidence contradicts the label? Look for it.    │
├──────────────────┼─────────────────────────────────────────────────┤
│ AOL Signal       │ The label may contain valid information. After  │
│                  │ declaring, extract: "Django" → "URL routing,    │
│                  │ ORM pattern, middleware chain." These raw        │
│                  │ descriptors are valid data even if "Django" is  │
│                  │ wrong.                                          │
├──────────────────┼─────────────────────────────────────────────────┤
│ AOL Peacocking   │ An elaborate narrative: "This was built by a    │
│                  │ team that was migrating from Java and..." This  │
│                  │ is imagination, not signal. Declare "AOL/P" and │
│                  │ return to raw observation.                      │
└──────────────────┴─────────────────────────────────────────────────┘
```

紀律非避 AOL——乃察之、宣之，使其不污調查。每調查皆產 AOL。功在捉之之速。

**預期：** AOL 於起時即被識，明宣之，調查續以原始描述符而非標籤行。

**失敗時：** 若 AOL 主導（察自己已自標籤推理數步），叫「AOL 休」。回 Stage II 收新原始觀察以驗該標籤。重污染之調查應於檢視中註明。

### 步驟七：閉與檢

正式結調查並綜合發現。

1. 按序檢所有所收資料：初印象、原始觀察、結構資料、定向答、AOL 宣告
2. 識信心最高之 5-10 觀察
3. 至此——且僅於此時——形成綜合：此為何系統？如何運作？關鍵特徵為何？
4. 記綜合中何部由證據良支持、何部由推導
5. 將綜合與步驟一所宣成見比對——何者證實？何者錯？
6. 為用戶或自己日後參考記錄發現

**預期：** 自原始觀察建之紮實理解，非自模式匹配假設。綜合較速分類更準，且信心級誠實。

**失敗時：** 若綜合感稀薄，早階所收資料恐不足。但勿棄部分發現——「73 個 TypeScript 文件、深嵌組件結構、活躍 git 歷史、薄測試覆蓋」之描述較錯標籤更有用。準描為目，非辨識。

## 驗證

- [ ] 資料收集前已宣成見
- [ ] Stage I 觀察為原始描述符，非標籤
- [ ] Stage II 資料跨多頻道收集，非僅一
- [ ] 所有 AOL 於識認之刻被宣
- [ ] 各階序進（I → II → III → V），不跳結論
- [ ] 標的盲取——未基於對應為何之假設讀文件
- [ ] 綜合區分證據支持之發現與推導
- [ ] 調查記錄保存供日後參考

## 常見陷阱

- **跳至辨識**：未收原始觀察即尋「此何框架？」必致 AOL 污染
- **壓抑標籤**：欲不形成假設生張力——應宣之並抽其下原始訊號
- **略冷卻**：依某假設而始調查偏倚所有後續觀察
- **僅尋確認**：假設既成，僅尋確認證據而忽矛盾
- **混速度於技藝**：速辨識感有產但每每錯。徹底分階觀察雖久但產更準理解
- **頻道多樣性不足**：僅一鏡調查（僅讀代碼、僅查結構）漏其他頻道之訊號

## 相關技能

- `remote-viewing-guidance` — 人類引導變體，AI 充任 CRV 監督／派任者
- `meditate` — 冥想中所養之心靜與清假設直接提升調查品質
- `heal` — 調查揭示 AI 自身推理偏倚時，自療癒處根因
