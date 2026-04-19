---
name: circuit-breaker-pattern
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Implement circuit breaker logic for agentic tool calls — tracking tool health,
  transitioning between closed/open/half-open states, reducing task scope when
  tools fail, routing to alternatives via capability maps, and enforcing failure
  budgets to prevent error accumulation. Separates orchestration (deciding what
  to attempt) from execution (calling tools), following the expeditor pattern.
  Use when building agents that depend on multiple tools with varying reliability,
  designing fault-tolerant agentic workflows, recovering gracefully from tool
  outages mid-task, or hardening existing agents against cascading tool failures.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: general
  complexity: intermediate
  language: multi
  tags: resilience, circuit-breaker, error-handling, graceful-degradation, tool-reliability, fault-tolerance
---

# 斷路器模式

工具失敗時之優雅降級。呼五工具而一壞之代理不該全敗——宜識壞者、止呼之、縮範圍至尚可達者、誠報所略。此技能以分散系統之斷路器模式編碼此邏輯，適於代理工具編排。

核心洞見出自 kirapixelads 之「廚房火患」：調度者（編排層）不宜親烹。定奪**何事當試**與**如何為之**之職責分離，令編排者不陷於壞工具之重試迴圈。

## 適用時機

- 構建依賴多工具而可靠性各異之代理
- 設計容錯代理工作流，部分結果勝於全敗
- 代理於壞工具重試迴圈陷住而未續用可行工具
- 任務中途優雅復原於工具停擺
- 強化既有代理以抗連鎖工具失敗
- 陳舊或快取之工具輸出被誤為新鮮數據

## 輸入

- **必要**：代理依賴之工具清單（名與用途）
- **必要**：代理欲達之任務
- **選擇性**：已知工具可靠性問題或過往失敗模式
- **選擇性**：失敗閾值（預設：連續 3 敗即開路）
- **選擇性**：每週期失敗預算（預設：總 5 敗即暫停並報）
- **選擇性**：半開探測間隔（預設：開後每第 3 次嘗試）

## 步驟

### 步驟一：建能力圖

宣每一工具所供與可選之替代。此圖乃縮範圍之基——無之，工具敗令代理茫然無措。

```yaml
capability_map:
  - tool: Grep
    provides: content search across files
    alternatives:
      - tool: Bash
        method: "rg or grep command"
        degradation: "loses Grep's built-in output formatting"
      - tool: Read
        method: "read suspected files directly"
        degradation: "requires knowing which files to check; no broad search"
    fallback: "ask the user which files to examine"

  - tool: Bash
    provides: command execution, build tools, git operations
    alternatives: []
    fallback: "report commands that need to be run manually"

  - tool: Read
    provides: file content inspection
    alternatives:
      - tool: Bash
        method: "cat or head command"
        degradation: "loses line numbering and truncation safety"
    fallback: "ask the user to paste file contents"

  - tool: Write
    provides: file creation
    alternatives:
      - tool: Edit
        method: "create via full-file edit"
        degradation: "requires file to already exist for Edit"
      - tool: Bash
        method: "echo/cat heredoc"
        degradation: "loses Write's atomic file creation"
    fallback: "output file contents for the user to save manually"

  - tool: WebSearch
    provides: external information retrieval
    alternatives: []
    fallback: "state what information is needed; ask user to provide it"
```

每一工具記：
1. 其供何能（一行）
2. 何替代工具可部分涵蓋（附降級記）
3. 無工具替代時之人工退路

**預期：** 涵代理所用每工具之完整能力圖。每一目至少有退路，即無工具替代。圖明示慣常隱含者：何者關鍵（無替代）、何者可替。

**失敗時：** 若工具清單不明，由技能前言之 `allowed-tools` 起。若替代未定，標為 `degradation: "unknown — test before relying on this route"`，勿省。

### 步驟二：初始化斷路器狀態

為每工具立狀態追蹤。所有工具始於 CLOSED 態（健康、正常運作）。

```
Circuit Breaker State Table:
+------------+--------+-------------------+------------------+-----------------+
| Tool       | State  | Consecutive Fails | Last Failure     | Last Success    |
+------------+--------+-------------------+------------------+-----------------+
| Grep       | CLOSED | 0                 | —                | —               |
| Bash       | CLOSED | 0                 | —                | —               |
| Read       | CLOSED | 0                 | —                | —               |
| Write      | CLOSED | 0                 | —                | —               |
| Edit       | CLOSED | 0                 | —                | —               |
| WebSearch  | CLOSED | 0                 | —                | —               |
+------------+--------+-------------------+------------------+-----------------+

Failure budget: 0 / 5 consumed
```

**狀態定義：**

- **CLOSED** — 工具健康。正常用。追連續敗。
- **OPEN** — 工具已知壞。勿呼。路由至替代或降範圍。
- **HALF-OPEN** — 工具曾壞或已復。發單一探測呼。成則遷 CLOSED；敗則返 OPEN。

**狀態轉移：**

- CLOSED -> OPEN：連敗達閾值（預設 3）
- OPEN -> HALF-OPEN：經可配之間隔後（如每第 3 任務步）
- HALF-OPEN -> CLOSED：探測成
- HALF-OPEN -> OPEN：探測敗

**預期：** 所有工具以 CLOSED 態及零敗數初始化之狀態表。失敗閾值與預算已明宣。

**失敗時：** 若工具清單不能預舉（動態工具發現），首次用時再初始化。模式仍適——唯漸增表而已。

### 步驟三：實行呼與追之迴圈

代理需呼工具時，循此決策序。此即調度者邏輯——定**是否**呼，非**如何**行。

```
BEFORE each tool call:
  1. Check tool state in the circuit breaker table
  2. If OPEN:
     a. Check if it is time for a half-open probe
        - Yes → transition to HALF-OPEN, proceed with probe call
        - No  → skip this tool, route to alternative (Step 4)
  3. If HALF-OPEN:
     a. Make one probe call
     b. Success → transition to CLOSED, reset consecutive fails to 0
     c. Failure → transition to OPEN, increment failure budget
  4. If CLOSED:
     a. Make the call normally

AFTER each tool call:
  1. Success:
     - Reset consecutive fails to 0
     - Record last success timestamp
  2. Failure:
     - Increment consecutive fails
     - Record last failure timestamp and error message
     - Increment failure budget consumed
     - If consecutive fails >= threshold:
         transition to OPEN
         log: "Circuit OPENED for [tool]: [failure count] consecutive failures"
     - If failure budget exhausted:
         PAUSE — do not continue the task
         Report to user (Step 6)
```

調度者從不即時重試失敗之呼。其記失敗、驗閾值、續行。重試僅於後步由 HALF-OPEN 探測機制行之。

**預期：** 清晰之決策迴圈，代理於每次工具呼前後循之。工具健康連續追蹤。調度層永不於壞工具阻塞。

**失敗時：** 若跨呼追狀態不切實際（如無狀態執行），降至較簡模型：計總敗，至預算而暫停。三態斷路器為理想；敗計數器乃最低可行模式。

### 步驟四：開路時路由至替代

工具電路為 OPEN 時，查能力圖（步驟一），路由至最佳可用替代。

**路由優先序：**

1. **低降級之工具替代** — 用供類似能力之另一工具。於任務輸出記降級。
2. **高降級之工具替代** — 用能力明顯損失之另一工具。明標結果所缺。
3. **人工退路** — 報代理不能為者及用戶需供之資訊或行動。
4. **縮範圍** — 若無替代且無可行退路，將依賴之子任務全除於範圍（步驟五）。

```
Example routing decision:

Tool needed: Grep (circuit OPEN)
Task: find all files containing "API_KEY"

Route 1: Bash with rg command
  → Degradation: loses Grep's built-in formatting
  → Decision: ACCEPTABLE — use this route

If Bash also OPEN:
Route 2: Read suspected config files directly
  → Degradation: requires guessing which files; no broad search
  → Decision: PARTIAL — try known config paths only

If Read also OPEN:
Route 3: Ask user
  → "I need to find files containing 'API_KEY' but my search
     tools are unavailable. Can you run: grep -r 'API_KEY' ."
  → Decision: FALLBACK — user provides the information

If user unavailable:
Route 4: Scope reduction
  → Remove "find API key references" from task scope
  → Document: "SKIPPED: API key search — no tools available"
```

**預期：** 工具電路開時，代理透明路由至替代或降範圍。路由決策與降級皆於任務輸出中記，令用戶知所受影響。

**失敗時：** 若能力圖不全（無替代列），預設降範圍並報。從不靜然略工——總記所略及因。

### 步驟五：縮範圍至可達之工

工具開路且替代窮盡時，縮任務至尚能以可行工具達者。此非敗——乃誠實之範圍管理。

**縮範圍規約：**

1. 列剩餘子任務
2. 每一子任務，查其需工具
3. 若所需工具皆 CLOSED 或有可行替代：保留
4. 若任一所需工具為 OPEN 且無替代：標為 DEFERRED
5. 以縮後之範圍續行
6. 終時報延期之子任務

```
Scope Reduction Report:

Original scope: 5 sub-tasks
  [x] 1. Read configuration files          (Read: CLOSED)
  [x] 2. Search for deprecated patterns    (Grep: CLOSED)
  [ ] 3. Run test suite                    (Bash: OPEN — no alternative)
  [x] 4. Update documentation             (Edit: CLOSED)
  [ ] 5. Deploy to staging                 (Bash: OPEN — no alternative)

Reduced scope: 3 sub-tasks achievable
Deferred: 2 sub-tasks require Bash (circuit OPEN)

Recommendation: Complete sub-tasks 1, 2, 4 now.
Sub-tasks 3 and 5 require Bash — will probe on next cycle
or user can run commands manually.
```

勿試延期之子任務。勿望開路工具能成而重試。斷路器之存正為此——信其態。

**預期：** 任務清分為可達與延期之工。代理完成所有可達之工並報延期項附其因及解鎖之道。

**失敗時：** 若縮範圍除盡所有子任務（每工具皆壞），直跳步驟六——暫停並報。無可行工具之代理不該佯進。

### 步驟六：處陳舊並標數據品質

工具返或陳舊之數據時（快取結果、過時快照、先前取得之內容），明標之，勿視為新鮮。

**陳舊指標：**

- 工具輸出與先前呼完全同（或為快取命中）
- 數據引用時戳較當前任務舊
- 工具文件述及快取行為
- 結果與其他近來觀察矛盾

**標籤規約：**

```
When presenting potentially stale data:

"[STALE DATA — retrieved at {timestamp}, may not reflect current state]
 File contents as of last successful Read:
 ..."

"[CACHED RESULT — Grep returned identical results to previous call;
 filesystem may have changed since]"

"[UNVERIFIED — WebSearch result from {date}; current status unknown]"
```

從不靜然以陳舊數據為當前。用戶或下游代理須知數據品質以作良決。

**預期：** 所有或陳舊之工具輸出皆明標。新鮮數據不標（標留不定，非留確認）。

**失敗時：** 若陳舊不可定（無時戳、無比較基線），記其不定：「[FRESHNESS UNKNOWN — no baseline for comparison]」。新鮮性之不定本身即資訊。

### 步驟七：行使失敗預算

跨所有工具追總敗。預算盡時代理暫停並報，勿續積錯。

```
Failure Budget Enforcement:

Budget: 5 failures per cycle
Current: 4 / 5 consumed

  Failure 1: Bash — "permission denied" (step 3)
  Failure 2: Bash — "command not found" (step 3)
  Failure 3: Bash — "timeout after 120s" (step 4)
  Failure 4: WebSearch — "connection refused" (step 5)

Status: 1 failure remaining before mandatory pause

→ Next tool call proceeds with heightened caution
→ If it fails: PAUSE and generate status report
```

**預算盡時：**

```
FAILURE BUDGET EXHAUSTED — PAUSING

Completed work:
  - Sub-task 1: Read configuration files (SUCCESS)
  - Sub-task 2: Search for deprecated patterns (SUCCESS)

Incomplete work:
  - Sub-task 3: Run test suite (FAILED — Bash circuit OPEN)
  - Sub-task 4: Update documentation (NOT ATTEMPTED — paused)
  - Sub-task 5: Deploy to staging (NOT ATTEMPTED — paused)

Tool health:
  Grep: CLOSED (healthy)
  Read: CLOSED (healthy)
  Edit: CLOSED (healthy)
  Bash: OPEN (3 consecutive failures — permission/command/timeout)
  WebSearch: OPEN (1 failure — connection refused)

Failures: 5 / 5 budget consumed

Recommendation:
  1. Investigate Bash failures — likely environment issue
  2. Check network connectivity for WebSearch
  3. Resume from sub-task 4 after resolution
```

暫停並報之職等於電系斷路器：防害之積。代理屢呼壞工具徒耗上下文窗、以重錯惑用戶、或生不一致之部分結果。

**預期：** 預算盡時代理清淨止。報包括已完之工、未完之工、工具健康、可行之後續步驟。

**失敗時：** 若代理不能生清淨之報（如狀態追蹤已失），輸出可用之任何資訊。部分報勝於靜然續行。

### 步驟八：職責分離——調度者 vs. 執行者

驗編排邏輯（步驟二至七）與工具執行清分。

**調度者（編排）為：**
- 追工具健康態
- 定是否呼工具、略之或探之
- 工具開路時路由至替代
- 行使失敗預算
- 生狀態報

**調度者不為：**
- 即時重試失敗之呼
- 改工具呼參數以繞錯
- 捕捉並抑工具錯
- 假設工具為何敗
- 行本身需工具之退路邏輯

若調度者「親烹」（為繞其他工具敗而自作工具呼），分離已破。調度者宜路由至替代工具或縮範圍——非試修壞工具。

**預期：** 編排決策與工具執行間之清界。調度層可描而不引具體工具 API 或錯類型。

**失敗時：** 若編排與執行糾纏，將決策邏輯抽為每工具呼前行之獨立步。決策步出四輸出之一：CALL、SKIP、PROBE、PAUSE。執行步據之而行。

### 步驟九：偵連鎖失敗

多工具共基礎設施（網路、檔案系統、權限）時，單一根因可同絆數路。偵此相關模式，勿視每路為獨立。

**連鎖失敗指標：**

- 於同任務步或窄窗內 3 個以上工具遷 OPEN
- 諸敗有共錯簽（如「connection refused」、「permission denied」）
- 先前獨立之敗史工具突同敗

**回應規約：**

1. 第二路開時，驗失敗類別與第一者同否
2. 若相關：標為**系統性失敗**——停所有工具呼，非僅壞者
3. 報疑根因：「多工具以 [共模式] 敗——或 [網路/檔案系統/權限] 之患」
4. 系統性失敗中勿探半開工具——探亦敗且耗預算
5. 僅待用戶確基礎設施患已解後再探

**退讓倍乘：** 連鎖失敗觸發時，半開探用指數退讓：第 3 步探、後第 6 步、後第 12 步。間隔上限為 20 步以防永久閉路。此防速探壓倒復原中之系統。

**預期：** 相關敗被偵並視為單一系統性事件，非 N 次獨立路絆。失敗預算計系統性事件一次，非 N 次。

**失敗時：** 若相關偵測不切實際（諸敗雖共因而錯簽各異），降為獨立每工具路。系統仍優雅降級——僅耗預算更速而已。

### 步驟十：呼前工具選擇層

入斷路器迴圈（步驟三）前，選擇性驗工具可用且或成。此減可預測失敗致之無謂路絆。

**呼前檢查：**

| 檢查 | 方法 | 失敗時行動 |
|-------|--------|-------------------|
| 工具存在 | 驗工具於 allowed-tools 列中 | 略——不試 |
| MCP 伺服器健康 | 查伺服器進程/連接狀態 | 即路由至替代 |
| 資源可用 | 驗目標檔案/URL/端點存在 | 路由或降範圍 |

**決策表：**

```
Pre-call score:
  AVAILABLE  → proceed to circuit breaker loop (Step 3)
  DEGRADED   → proceed with caution, lower the failure threshold by 1
  UNAVAILABLE → skip tool, route to alternative (Step 4) without consuming budget
```

呼前檢查為諮，非斷。通呼前檢查之工具仍可於執行時敗。斷路器仍為主要可靠機制。

**預期：** 可預測失敗（缺工具、不可達伺服器）於耗失敗預算前被捕。斷路器僅處真正運行時失敗。

**失敗時：** 若呼前檢查不可用或增負過多，全略此步。步驟三之斷路器迴圈處所有敗——呼前選擇乃優化而非必需。

## 驗證

- [ ] 能力圖涵所有工具並記替代與退路
- [ ] 斷路器狀態表為所有工具已初始化
- [ ] 狀態轉移循 CLOSED -> OPEN -> HALF-OPEN -> CLOSED 環
- [ ] 失敗閾值已明宣（非隱含）
- [ ] 縮範圍前先試替代路由
- [ ] 縮範圍有附延期子任務及因之記
- [ ] 陳舊數據明標——從不以新鮮呈
- [ ] 失敗預算行使並於盡時暫停並報
- [ ] 調度者邏輯不行工具呼或重試失敗之呼
- [ ] 狀態報含已完之工、未完之工、工具健康
- [ ] 無靜然失敗——每一略、延、降級皆記
- [ ] 連鎖失敗於 3+ 工具同開時被偵
- [ ] 系統性失敗態暫停所有探測直基礎設施確復
- [ ] 呼前檢查（若用）不於可預測失敗耗失敗預算

## 常見陷阱

- **重試而非斷路**：屢呼壞工具耗失敗預算與上下文窗。連三敗為模式，非厄運。開路
- **調度者親烹**：編排層宜定**何事當試**，非**如何修壞工具**。若調度者為 Bash 敗造繞道命令，已越分離之界
- **靜然縮範圍**：去子任務而不記之，生看似完整而實不然之結果。總報所略
- **視陳舊為新鮮**：快取或先前取得之結果或不反當前態。標不定勿視而不見
- **開路過急**：單次短暫之敗不該開路。用閾值（預設 3）以濾噪取信
- **開後永不探**：永遠開路之電路令代理永不知工具已復。半開探為復原所必需
- **忽失敗預算**：無預算，代理可於多工具積數十敗而紙上「仍進」。預算迫誠實之檢查點
- **連鎖退讓倍乘**：依賴鏈中多工具各行其指數退讓時，複合延遲倍增。限總退讓於鏈，非僅每工具
- **陳舊發現分**：呼前選擇（步驟十）快取工具可用評估。若條件改變而快取未廢，代理或略已復之工具或試不可用者。系統性失敗事件後重查分

## 相關技能

- `fail-early-pattern` — 互補模式：fail-early 於工作始前驗輸入；circuit-breaker 管工作中失敗
- `escalate-issues` — 失敗預算盡或縮範圍大時，升至專家或人
- `write-incident-runbook` — 記屢現工具失敗模式為手冊以速診
- `assess-context` — 評當前法能否適應於多工具降級時；配縮範圍決策
- `du-dum` — 分觀察與決策之雙鐘架構；減代理迴圈觀察耗之互補模式
