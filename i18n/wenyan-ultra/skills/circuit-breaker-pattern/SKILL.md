---
name: circuit-breaker-pattern
locale: wenyan-ultra
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

# Circuit Breaker Pattern

工具敗時優雅降級。五工具一壞，勿全敗——識壞、止呼、減範於可行、誠報所略。本技依分散系統斷路器，適於代理編排。

核見（kirapixelads「廚火」）：調度層（expeditor）不烹。決「何試」與「如何試」須分——免編排陷於敗工具之重試環。

## 用

- 建依多工具（可靠性異）之代理
- 設容錯流程，部分成果勝於全敗
- 代理陷於壞工具之重試環
- 中途從工具故障優雅復
- 固現代理防級聯工具敗
- 陳舊緩存之工具輸出被當新

## 入

- **必**：代理所依工具列（名與用）
- **必**：代理所謀之事
- **可**：已知可靠性問題或往敗模式
- **可**：敗閾（默：3 連敗始開斷路）
- **可**：循環敗預算（默：5 總敗止而報）
- **可**：半開探距（默：開後每第 3 試）

## 行

### 一：建能力圖

宣每工具所供與替者。此圖為減範之基——無之則工具敗時不知所措。

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

每工具書：
1. 所供能力（一行）
2. 可替之工具（附退降注）
3. 無替時之手動 fallback

**得：** 覆諸工具之全能力圖。每項至少有 fallback，無替亦然。圖顯常隱者：何為關鍵（無替）、何可替。

**敗：** 工具列不明→起於技能 frontmatter 之 `allowed-tools`。替不確→標 `degradation: "unknown — test before relying on this route"` 非略。

### 二：初斷路器狀態

為每工具設狀態追蹤。皆以 CLOSED 起（健、常行）。

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

- **CLOSED** — 工具健。常用。追連敗。
- **OPEN** — 工具已壞。勿呼。路由至替或減範。
- **HALF-OPEN** — 工具壞或已復。發一探呼。成→CLOSED。敗→OPEN。

**狀態轉換：**

- CLOSED → OPEN：連敗達閾（默 3）
- OPEN → HALF-OPEN：隔可配距（如每 3 步）
- HALF-OPEN → CLOSED：探成
- HALF-OPEN → OPEN：探敗

**得：** 諸工具之狀態表已初為 CLOSED 零敗。閾與預算已明宣。

**敗：** 工具列不可先舉（動態發現）→首用時初。模式仍適——只漸建表。

### 三：行呼叫與追蹤環

代理欲呼工具→依此決策序。此為調度邏輯——決「是否試」，非「如何行」。

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

調度者不立即重試敗呼。記敗、察閾、繼行。重試只於後步之 HALF-OPEN 探。

**得：** 每呼前後皆守之決策環。工具健持續追蹤。調度層不陷於敗工具。

**敗：** 跨呼追蹤不便（無狀態行）→降簡模：計總敗、預算滿即停。三態斷路器為佳；敗計為最低可行。

### 四：OPEN 時路由至替

工具 OPEN→參能力圖（步一），路由至最佳替。

**路由優先：**

1. **退降小之替**——用別工具供相似能力。於任務輸出注退降。
2. **退降大之替**——用別工具，能力失多。明標所失。
3. **手動 fallback**——報代理所不能、用者須供之信息或動作。
4. **減範**——無替無 fallback→除依賴子任務（步五）。

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

**得：** 工具 OPEN→代理透明路由或減範。路由決與退降皆於輸出記，用者知何受影響。

**敗：** 能力圖不全（無替列）→默減範而報。勿默略工——必記所略與因。

### 五：減範於可行

工具 OPEN 且替竭→減任務至尚可為者。非敗——為誠範管理。

**減範協議：**

1. 列餘子任務
2. 每子任務→察所需工具
3. 所需皆 CLOSED 或有替→留
4. 所需有 OPEN 無替→標 DEFERRED
5. 續於減範
6. 末報 deferred 諸項

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

勿試 deferred 者。勿重試 OPEN 工具望其可。斷路器之設即為防此——信其狀態。

**得：** 任務分為可行與 deferred。代理畢諸可行，報 deferred 附因與解鎖法。

**敗：** 減範後無餘（諸工具皆壞）→直赴步六——停而報。無可用工具之代理不偽進。

### 六：陳舊處理與數據質量標註

工具返或陳舊（緩存、舊快照、往取）→明標非當新。

**陳舊指標：**

- 工具輸出與前呼完全相同（或緩存命中）
- 數據引用較任務時舊之時戳
- 工具文檔述緩存行為
- 果與近觀相悖

**標註協議：**

```
When presenting potentially stale data:

"[STALE DATA — retrieved at {timestamp}, may not reflect current state]
 File contents as of last successful Read:
 ..."

"[CACHED RESULT — Grep returned identical results to previous call;
 filesystem may have changed since]"

"[UNVERIFIED — WebSearch result from {date}; current status unknown]"
```

勿默以陳舊為當新。用者或下游代理須知質量以決。

**得：** 或陳舊之諸輸出皆明標。新數據不標（標留不確定，非確認）。

**敗：** 陳否不可定（無時戳無基準）→注不確：「[FRESHNESS UNKNOWN — no baseline for comparison]」。陳新不確本身即信息。

### 七：執行敗預算

追諸工具之總敗。預算竭→代理停而報，非續累錯。

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

**預算竭時：**

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

停而報如電路斷路器：防損累。續呼壞工具之代理耗脈絡、惑用者以重錯、或生不一致之部分果。

**得：** 預算竭→代理淨停。報含已畢、未畢、工具健、可行下一步。

**敗：** 不能生淨報（狀態追丟）→輸出所有。部分報勝於默續。

### 八：關注分離——調度 vs 執行

驗調度邏輯（步二至七）淨分於工具執行。

**調度（編排）行者：**
- 追工具健狀態
- 決呼、略、探
- 工具 OPEN 時路由至替
- 執行敗預算
- 生狀態報告

**調度不為者：**
- 立即重試敗呼
- 改呼參數繞錯
- 捕而抑工具錯
- 設工具何以敗
- 行須工具之 fallback 邏輯

調度「烹飪」（自呼工具繞他工具敗）→分離破。宜路由或減範——非修壞工具。

**得：** 編排決與工具行淨界。調度層可述而不引具體工具 API 或錯類。

**敗：** 編排與執行糾纏→重構：決邏輯獨立於每呼前。決步出四者一：CALL、SKIP、PROBE、PAUSE。執步依出而行。

### 九：察級聯敗

諸工具共基礎（網、檔、權）→一根因可同絆多斷路。察此相關模式，勿獨治。

**級聯敗指標：**

- 3+ 工具於同步或窄窗內 OPEN
- 敗共錯簽（如「connection refused」、「permission denied」）
- 往獨立敗史之工具忽同敗

**應對協議：**

1. 第二斷路開→察敗類與首同否
2. 相關→標**系統敗**——停諸呼，非只壞者
3. 報疑根因：「Multiple tools failing with [shared pattern] — likely [network/filesystem/permissions] issue」
4. 系統敗間勿探半開——探亦敗、耗預算
5. 用者確基礎已復方再探

**退避複合：** 級聯觸→半開探用指數退避：步 3、步 6、步 12。上限 20 步防永鎖。防急探壓復中之系統。

**得：** 相關敗為單系統事，非 N 獨立絆。預算計系統事一次，非 N 次。

**敗：** 相關察不便（敗簽異而根同）→降獨立每工具斷路。系統仍優雅降級——只耗預算更速。

### 十：呼前工具擇層

入斷路器環（步三）前，可驗工具在且可能成。減可料敗之無謂絆。

**呼前察：**

| Check | Method | Action on failure |
|-------|--------|-------------------|
| Tool exists | Verify tool is in the allowed-tools list | Skip — do not even attempt |
| MCP server health | Check server process/connection status | Route to alternative immediately |
| Resource availability | Verify target file/URL/endpoint exists | Route or degrade scope |

**決表：**

```
Pre-call score:
  AVAILABLE  → proceed to circuit breaker loop (Step 3)
  DEGRADED   → proceed with caution, lower the failure threshold by 1
  UNAVAILABLE → skip tool, route to alternative (Step 4) without consuming budget
```

呼前察為勸，非權威。過察之工具仍可運行時敗。斷路器仍為主靠機制。

**得：** 可料敗（工具缺、服務不通）於耗預算前即截。斷路器只治真運行敗。

**敗：** 呼前察不在或負擔大→略此步。步三斷路器環治諸敗——呼前擇為優化非必。

## 驗

- [ ] 能力圖覆諸工具，替與 fallback 皆記
- [ ] 斷路器狀態表為諸工具已初
- [ ] 狀態轉守 CLOSED → OPEN → HALF-OPEN → CLOSED 環
- [ ] 敗閾明宣非默
- [ ] 減範前先試替路由
- [ ] 減範記 deferred 子任務與因
- [ ] 陳舊明標——勿視為新
- [ ] 敗預算執，竭則停而報
- [ ] 調度邏輯不行工具呼或重試
- [ ] 狀態報含已畢、未畢、工具健
- [ ] 無默敗——諸略、deferred、退降皆記
- [ ] 3+ 工具同 OPEN→察級聯
- [ ] 系統敗態停諸探至基礎復
- [ ] 呼前察（若用）不於可料敗耗預算

## 忌

- **重試代斷路**：續呼壞工具耗預算與脈絡。三連敗為模式，非厄——開斷路。
- **調度烹飪**：編排層決「何試」，非「如何修壞工具」。若調度為 Bash 敗制繞令→越界矣。
- **默減範**：略子任務而不記→果似完而實非。必報所略。
- **視陳為新**：緩存或往取或不合當今。標不確，勿忽。
- **早開斷路**：單瞬敗不宜開。用閾（默 3）濾噪。
- **開後不探**：永開則代理永不知工具已復。半開探為復之要。
- **忽敗預算**：無預算→代理可累數十敗於諸工具而紙面「有進」。預算迫誠檢點。
- **級聯退避倍增**：依鏈諸工具各施指數退避→複合延指數增。限鏈總退避，非只每工具。
- **陳發現分**：呼前擇（步十）緩存可用性評。條件變而緩存未失效→代理或略已復工具或試不在者。系統敗後須重評。

## 參

- `fail-early-pattern` — 互補：fail-early 於工前驗入；circuit-breaker 治工中敗
- `escalate-issues` — 預算竭或減範大→升至專或人
- `write-incident-runbook` — 記常工具敗模式為 runbook 以速診
- `assess-context` — 估諸工具退降時現法可否適；合於減範決
- `du-dum` — 雙鐘架構分觀與決；代理環中減觀負之補模
