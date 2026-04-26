---
name: remote-viewing
locale: wenyan-ultra
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

# 遙視

以 CRV 協近未知碼、問、系——先集原察、後成結、管早標（AOL）、階集數以建解。

## 用

- 察陌生碼庫、構未知
- 除錯而根因不明、早設可誤
- 探汝脈少之域或技
- 前察為設所誤
- 「初心」過模匹更生產之問

## 入

- **必**：欲察之標（庫路、問述、欲解之系）
- **必**：盲入之諾——數集畢前拒成結
- **可**：欲答標問（留階五）
- **可**：先禪以清設（見 `meditate`）

## 行

### 一：冷卻——清設

由設重模化為納察。此步不可議。

1. 識諸成見於標：
   - 「此或為 React 應」——申之
   - 「錯或於庫層」——申之
   - 「此循 MVC」——申之
2. 各成見明書（思中或輸中）
3. 各記：「或真或否。我驗、不假。」
4. 釋速識標之需——旨在準述、非速標
5. 覺析心伸框或標時、停而引回原察

得：所申成見列、由「我知此為何」至「我察此實為何」之有意移。覺納、不躍結。

敗：設復現（「然其*真*為 React…」）→延冷卻。書設於「泊位」續行。執於某設時勿始集——將染諸察。

### 二：表意——首觸（階一）

以最小可察始觸標。

1. 用 `Glob` 唯見頂層構（如 `*` 或 `path/*`）——勿讀任檔
2. 記即、未濾印：檔數、命模、顯標之存無
3. 用簡描錄原察：
   - 「many small files」非「microservice architecture」
   - 「deeply nested directories」非「enterprise Java」
   - 「single large file」非「monolith」
4. 解初印為二要：
   - **A**（活）：活乎寐？長乎穩？簡乎複？
   - **B**（感）：覺整乎亂？密乎疏？熟乎異？
5. 書 A B 估——汝首數點

得：少數原低層察於標表性。無名、無標、無構模——唯形、大、質。

敗：立分（「噢、Next.js 應」）→申為 AOL（六）、取標下原描（「JavaScript 檔、嵌 pages 錄、package.json 存」）、續以原察。

### 三：感印——原數（階二）

系集標原數而不釋。

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

1. 用 `Glob`、`Grep`、輕 `Read` 探各道
2. 一道一察——首印、勿深潛
3. 用描非標：「73 .ts files」非「TypeScript project」
4. 圈（標）特顯之察
5. 道無顯產→錄「nothing observed」而過
6. 旨諸道 10-20 數點

得：發現非假之原察列。某顯、某噪。數應低層描、非高層分。

敗：諸察成分→已滑入析。停、回表意步、新眼再觸標。一道據（諸檔察、無史）→意移少用之道。

### 四：維數——構（階三）

由原察移至空與構解。

1. 始繪標構而不標：
   - 何連何？（imports、引、配指）
   - 主「區」何而何相關？
   - 階為何——平、嵌、混？
2. 輕讀關鍵檔——入點、配檔、README
3. 記關：「錄 A 自錄 B 引」「配檔引 C 路」
4. 略空局：訊如何流系？
5. 記 Aesthetic Impact (AI)——此庫覺如何？維良？倉？實驗？

得：略構圖含關注。標總範（大/小、簡/複、單體/模組）漸明。庫之「感」捕。

敗：圖覺純猜→簡：唯記可驗連（真 import、真配引）。無構模生→回階二集更原數——維解需察基。

### 五：問——導問（階五）

典 CRV 階四注深析構；庫察則意併入前維/構階、故此調協進至階五為導問。

至此乃唯帶特問入察。

1. 各問明述：「入點為何？」「數源何？」「測覆如何？」
2. 各問、用 `Grep` 與 `Read` 尋答——標的、非探
3. 各問記首發
4. 記信級：高（直據）、中（推）、低（疑）
5. 明標諸階五數——其 AOL 險高、因問激期

得：特答於導問、據已集原與構數。信級誠。

敗：導問唯產 AOL（汝答自設非據）→回前階。CRV 協為序有由——略察階躍問→產不可信答。

### 六：管 AOL

AOL 為察之主誤源。析心早標標時生。會中時時管之。

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

律非避 AOL——乃識且申之、勿污察。皆察產 AOL。技在捕速。

得：AOL 起時即識、明申、察續以原描非標。

敗：AOL 已據（汝悟自標推數步）→召「AOL 休」。回階二集試標之新原察。重污察應於審中如實標。

### 七：閉與審

正式結察、合發見。

1. 按序審諸數：首印、原察、構數、導答、AOL 申
2. 識最信之 5-10 察
3. 至此——唯至此——成合：此系為何？如何行？關鍵特為何？
4. 記合何部據良支、何部推
5. 較合與步一所申成見——何確？何誤？
6. 為用或為汝後參存發見

得：基於原察非模匹假設之接地解。合勝快分、信級誠。

敗：合覺薄→前階或集數不足。然勿棄部分發見——「73 TypeScript files, deeply nested component structure, active git history, thin test coverage」勝誤標。準述為旨、非識。

## 驗

- [ ] 集數前申成見
- [ ] 階一察為原描非標
- [ ] 階二數跨多道集、非僅一
- [ ] 諸 AOL 識時即申
- [ ] 階按序進（I → II → III → V）、不躍結
- [ ] 標盲入——勿據「應含何」之設讀檔
- [ ] 合分據持發見與推
- [ ] 察錄存以後參

## 忌

- **躍識**：原察前尋「何框？」必污 AOL
- **抑標**：強不成設生張——宜申之、取下原號
- **略冷卻**：執設始察→偏諸後察
- **唯確尋**：設成後唯尋確據而忽矛
- **混速與技**：速識覺生產而常誤。徹底階察費時而產更準解
- **道少**：唯一鏡察（唯讀碼、唯察構）→失他道號

## 參

- `remote-viewing-guidance` — 人導變、AI 任 CRV 監/委
- `meditate` — 禪所育心靜與清設直增察質
- `heal` — 察揭 AI 自思偏時、自癒治根因
