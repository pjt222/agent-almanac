---
name: circuit-breaker-pattern
locale: wenyan
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

# 斷路之式

具敗則柔降。使者呼五具而一破者，不宜盡敗——宜識其破、止呼之、減範至可成者、誠報所略。此技以散系之斷路式為準，化為使者具之調度。

核心之見，自 kirapixelads「廚火之問」：調者（調度之層）不可自炊。析「何攻」與「如何攻」之分，免調者陷於敗具之再試環。

## 用時

- 建倚多具而信度異之使者
- 設容錯之流，偏成勝於全敗
- 使者陷於敗具之再試環而不進於可用之具
- 任務中具斷而柔恢
- 固舊使者禦連鎖之具敗
- 陳緩之具出被視為新資

## 入

- **必**：使者所倚之具列（名與用）
- **必**：使者所圖之任
- **可選**：已知之具病或往敗之式
- **可選**：敗之閾（默：三連敗開路）
- **可選**：每周之敗額（默：五總敗而後停報）
- **可選**：半開試之距（默：開後每三攻一試）

## 法

### 第一步：建能圖

明各具所供與所有之替。此圖乃範縮之基——無之則具敗而使者茫然。

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

每具書：
1. 所供之能（一言）
2. 可部分代之具（附降等之注）
3. 無具可代時之手補

**得：** 全能圖涵使者所用每具。每條至少有補，雖無具替。圖明示常隱者：何具關鍵（無替）、何具可代。

**敗則：** 若具列含糊，自技之 `allowed-tools` 始。替不確者，標 `degradation: "unknown — test before relying on this route"` 而不略之。

### 第二步：初斷路之態

為每具設態追。諸具起於 CLOSED 態（健，常行）。

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

**態之定：**

- **CLOSED**——具健。正常用。追連敗。
- **OPEN**——具已破。勿呼。路於替或降範。
- **HALF-OPEN**——具曾破或已恢。發一試呼。成則遷 CLOSED；敗則返 OPEN。

**態之遷：**

- CLOSED -> OPEN：連敗至閾（默：三）
- OPEN -> HALF-OPEN：經定距（如每三步）
- HALF-OPEN -> CLOSED：試呼成
- HALF-OPEN -> OPEN：試呼敗

**得：** 全具態表已初為 CLOSED 零敗。閾與額明宣。

**敗則：** 若具不可預列（動發現），首用時初其態。式仍適——漸建表耳。

### 第三步：行呼追環

使者欲呼具時，循此決序。此乃調者之理——決「是否攻」，非「如何行」。

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

調者不即再試敗呼。記敗、察閾、而進。再試唯經 HALF-OPEN 試機於後步。

**得：** 明決環，使者每呼前後循之。具健續追。調層不阻於敗具。

**敗則：** 若跨呼追態難（如無態之行），降至簡：數總敗而於額停。三態斷路為佳；敗計為最小可行式。

### 第四步：路於開路之替

某具路 OPEN 時，查能圖（第一步）而路於至善可用之替。

**路之序：**

1. **低降之替**——用他具供似能。於任出注其降。
2. **高降之替**——用他具而能損顯。明示所缺。
3. **手補**——報使者不能為何及需用者提供之資或行。
4. **範縮**——無替無補，則除其依之子任（第五步）。

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

**得：** 具路開時，使者明路於替或降範。路之決與任一降皆書於任出，使用者知所影。

**敗則：** 若能圖不全（無替列），默降為範縮而報之。永勿默略——必書所略與由。

### 第五步：減範至可成

具開而替盡時，減任至以可用具仍可成者。非敗也——乃誠之範治。

**範縮之儀：**

1. 列餘子任
2. 每子任察其所需具
3. 若所需具皆 CLOSED 或有替：留之
4. 若所需具有 OPEN 而無替：標為 DEFERRED
5. 以縮之範續
6. 末報延之子任

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

勿攻延之子任。勿再試開路之具望其可行。斷路正為此存——信其態。

**得：** 任明分為可成與延。使者成諸可成而報延者附由及解阻之法。

**敗則：** 若範縮除盡子任（每具皆破），直至第六步——停而報。無具可用者不宜偽進。

### 第六步：察陳且標資質

某具返資或已陳（緩果、過時之攝、前取之容）時，明標之，勿視為新。

**陳之兆：**

- 具出與前呼同（或緩中）
- 資引之時比當任舊
- 具書言緩行
- 果與近察相違

**標之儀：**

```
When presenting potentially stale data:

"[STALE DATA — retrieved at {timestamp}, may not reflect current state]
 File contents as of last successful Read:
 ..."

"[CACHED RESULT — Grep returned identical results to previous call;
 filesystem may have changed since]"

"[UNVERIFIED — WebSearch result from {date}; current status unknown]"
```

勿默示陳資為新。用者或下游使者必知資質而後能明決。

**得：** 或陳之出皆明標。新資無標（標專於不確，非確）。

**敗則：** 若陳不可定（無時戳、無比基），注其不確：「[FRESHNESS UNKNOWN — no baseline for comparison]」。不確本身亦資也。

### 第七步：執敗之額

追諸具總敗。額盡則使者停報，勿續積誤。

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

**額盡之處：**

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

停而報，如電路之斷：免積損。續呼敗具者耗脈絡、擾用者以覆誤、或生矛盾之偏果。

**得：** 額盡則使者清止。報含已成、未成、具健、可行之後步。

**敗則：** 若使者不能生清報（如態追已失），輸所有之資。偏報勝於默續。

### 第八步：分理——調者與執者

驗調度之理（第二至第七步）與具行清分。

**調者（調度）為：**
- 追具健之態
- 決呼、略、或試之
- 某具開時路於替
- 執敗額
- 生狀態報

**調者不為：**
- 即再試敗呼
- 改呼參以繞誤
- 捕而掩具誤
- 假設具敗之由
- 行自需具之補理

調者若「炊」（呼具以繞他具之敗），則分斷。調者宜路於替或減範——勿試修破具。

**得：** 調決與具行清界。調層可述而不引具 API 或誤型。

**敗則：** 若調執相纏，重構——抽決理為呼前獨步。決步生四出之一：CALL、SKIP、PROBE、或 PAUSE。行步隨出而動。

### 第九步：察連鎖之敗

多具共基（網、檔系、權）時，一根因可同跳數路。察此相關之式，勿獨治每路。

**連鎖敗之兆：**

- 三具以上於同步或近窗內遷 OPEN
- 諸敗共簽名（如「connection refused」、「permission denied」）
- 前獨敗史之具忽同敗

**應之儀：**

1. 第二路開時，察敗類是否同於第一
2. 若相關：標為**系之敗**——停所有具呼，非只破者
3. 報疑之根因：「Multiple tools failing with [shared pattern] — likely [network/filesystem/permissions] issue」
4. 系敗時勿試半開之具——試亦將敗而耗額
5. 唯於用者確基礎已恢後再試

**退合之疊：** 連鎖敗觸時，半開試用指數退：第三步試、第六步試、第十二步試。限上距於二十步以免永閉。此免急試壓恢中之系。

**得：** 相關敗視為一系事，非 N 獨跳。敗額只計系事一次，非 N 次。

**敗則：** 若相關察難（敗簽異雖共因），降為獨路。系仍柔降——只耗額速耳。

### 第十步：呼前擇具之層

行斷路環（第三步）前，或驗具可得且有望成。此減可預敗之冗跳。

**呼前之察：**

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

呼前之察乃諮而非斷。過察之具仍可於行時敗。斷路仍為主之信機。

**得：** 可預之敗（具缺、服不可達）於耗額前捕。斷路只治真行時之敗。

**敗則：** 若呼前察不可得或加冗過重，全略此步。第三步之斷路環治一切敗——呼前擇乃優，非必。

## 驗

- [ ] 能圖涵諸具附替與補
- [ ] 斷路態表已初為諸具
- [ ] 態遷循 CLOSED -> OPEN -> HALF-OPEN -> CLOSED 環
- [ ] 敗閾明宣（非隱）
- [ ] 替路攻於範縮前
- [ ] 範縮書延之子任與由
- [ ] 陳資明標——永勿示為新
- [ ] 敗額執以停報於盡時
- [ ] 調者不行具呼或再試敗呼
- [ ] 狀態報含已成、未成、具健
- [ ] 無默敗——每略、延、降皆書
- [ ] 三具以上同開時察連鎖敗
- [ ] 系敗模停諸試至基礎確恢
- [ ] 呼前察（若用）不耗額於可預敗

## 陷

- **再試而不斷路**：屢呼破具耗額與脈絡。三連敗為式，非惡運。開路之。
- **於調者炊**：調層宜決「攻何」，非「如何修破具」。若調者為 Bash 敗而製繞令，已越界。
- **默範縮**：略子任而不書，果似全而實否。必報所略。
- **視陳為新**：緩或前取之果或不反當態。標不確，勿忽之。
- **過急開路**：一瞬敗不宜開路。用閾（默：三）濾噪留訊。
- **開後不試**：永開之路使使者永不知具已恢。半開之試為恢之要。
- **忽敗額**：無額，使者可積數十敗而表上仍「進」。額強誠之檢。
- **連鎖退之疊乘**：鏈中諸具各施指數退，合遲乘增。限鏈總退，非只每具。
- **陳之發現值**：呼前擇（第十步）緩具可得之評。緩於境變時未廢，使者或略已恢之具或攻不得之具。每系敗後再察之。

## 參

- `fail-early-pattern` — 補式：前者驗入於始，斷路治行中之敗
- `escalate-issues` — 額盡或範縮顯時升於專家或人
- `write-incident-runbook` — 書重現具敗之式為行冊以速診
- `assess-context` — 多具降時評當前之法可適乎；與範縮之決配
- `du-dum` — 二鍾之構析察於決；補式以減使者環中察之本
