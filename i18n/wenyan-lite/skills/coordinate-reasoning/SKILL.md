---
name: coordinate-reasoning
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  AI internal coordination using stigmergic signals — managing information
  freshness in context and memory, decay rates for assumption staleness,
  and emergent coherent behavior from simple local protocols. Use during
  complex tasks where multiple sub-tasks must coordinate, when context has
  grown long and information freshness is uncertain, after context compression
  when information may have been lost, or when sub-task outputs need to feed
  into each other cleanly without degradation.
license: MIT
allowed-tools: Read Write
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: swarm
  complexity: intermediate
  language: natural
  tags: swarm, coordination, stigmergy, context-management, information-decay, ai-self-application
---

# 協調推理

以共遺（stigmergic）原則管推理過程之內協——視脈絡為環境，其中資訊信號有新鮮度、衰減率、互動規則，由簡單局部協議產生連貫行為。

## 適用時機

- 複雜任務中多子任務須協調（多檔編輯、多步重構）
- 脈絡長而資訊新鮮不確
- 脈絡壓縮後某資訊或已失
- 子任務之輸出須淨餵次者
- 早推理結果須無退化前行
- 補 `forage-solutions`（探索）與 `build-coherence`（決策）以執行協調

## 輸入

- **必要**：當前任務分解（何子任務存、其如何相關）
- **選擇性**：已知之資訊新鮮疑慮（如「我 20 訊前讀此檔」）
- **選擇性**：子任務依賴圖（何子任務餵何者）
- **選擇性**：可用之協調工具（MEMORY.md、任務清單、行內註）

## 步驟

### 步驟一：分類協調問題

不同協調挑戰需不同信號設計。

```
AI Coordination Problem Types:
┌─────────────────────┬──────────────────────────────────────────────────┐
│ Type                │ Characteristics                                  │
├─────────────────────┼──────────────────────────────────────────────────┤
│ Foraging            │ Multiple independent searches running in         │
│ (scattered search)  │ parallel or sequence. Coordination need: share   │
│                     │ findings, avoid duplicate work, converge on      │
│                     │ best trail                                       │
├─────────────────────┼──────────────────────────────────────────────────┤
│ Consensus           │ Multiple approaches evaluated, one must be       │
│ (competing paths)   │ selected. Coordination need: independent         │
│                     │ evaluation, unbiased comparison, commitment      │
├─────────────────────┼──────────────────────────────────────────────────┤
│ Construction        │ Building a complex output incrementally (multi-  │
│ (incremental build) │ file edit, long document). Coordination need:    │
│                     │ consistency across parts, progress tracking,     │
│                     │ dependency ordering                              │
├─────────────────────┼──────────────────────────────────────────────────┤
│ Defense             │ Maintaining quality under pressure (tight time,  │
│ (quality under      │ complex requirements). Coordination need:        │
│ pressure)           │ monitoring for errors, rapid correction,         │
│                     │ awareness of degradation                         │
├─────────────────────┼──────────────────────────────────────────────────┤
│ Division of labor   │ Task decomposed into sub-tasks with              │
│ (sub-task mgmt)     │ dependencies. Coordination need: ordering,       │
│                     │ handoff, result integration                      │
└─────────────────────┴──────────────────────────────────────────────────┘
```

分當前任務。多數複雜任務為建造或分工；多數除錯任務為探尋；多數設計決定為共識。

**預期：** 明分類以定用何協調信號。分類應合任務之實感，非所述之。

**失敗時：** 若任務橫跨多類（大任務常然），辨當前階段之主類。實作時建造、除錯時探尋、設計時共識。類可隨任務進而變。

### 步驟二：設脈絡信號

視對話脈絡中之資訊為含新鮮與衰減性之信號。

```
Information Decay Rate Table:
┌───────────────────────────┬──────────┬──────────────────────────────┐
│ Information Source        │ Decay    │ Refresh Action               │
│                           │ Rate     │                              │
├───────────────────────────┼──────────┼──────────────────────────────┤
│ User's explicit statement │ Slow     │ Re-read if >30 messages ago  │
│ (direct instruction)      │          │ or after compression         │
├───────────────────────────┼──────────┼──────────────────────────────┤
│ File contents read N      │ Moderate │ Re-read if file may have     │
│ messages ago              │          │ been modified, or if >15     │
│                           │          │ messages since reading        │
├───────────────────────────┼──────────┼──────────────────────────────┤
│ Own earlier reasoning     │ Fast     │ Re-derive rather than trust. │
│ (conclusions, plans)      │          │ Earlier reasoning may have   │
│                           │          │ been based on now-stale info  │
├───────────────────────────┼──────────┼──────────────────────────────┤
│ Inferred facts (not       │ Very     │ Verify before relying on.    │
│ directly stated or read)  │ fast     │ Inferences compound error    │
├───────────────────────────┼──────────┼──────────────────────────────┤
│ MEMORY.md / CLAUDE.md     │ Very     │ Loaded at session start,     │
│ (persistent context)      │ slow     │ treat as stable unless user  │
│                           │          │ indicates changes             │
└───────────────────────────┴──────────┴──────────────────────────────┘
```

此外，設抑制信號——試而敗之法之標：

- 工具呼失敗後：記敗模式（防重呼同呼）
- 法棄後：記因（防無新證而返）
- 用戶糾正後：記何處誤（防重犯）

**預期：** 當前脈絡中資訊新鮮之心智模型。辨何資訊新鮮、何需刷前方可賴。

**失敗時：** 若新鮮難估，預設「賴前重讀」於近 5-10 行未驗之任何資訊。過度刷耗力但防陳舊資訊之錯。

### 步驟三：定局部協議

立推理如何於每步行之簡則，僅用局部可達之資訊。

```
Local Protocol Rules:
┌──────────────────────┬────────────────────────────────────────────────┐
│ Protocol             │ Rule                                           │
├──────────────────────┼────────────────────────────────────────────────┤
│ Safety               │ Before using a fact, check: when was it last  │
│                      │ verified? If below freshness threshold,        │
│                      │ re-verify before proceeding                    │
├──────────────────────┼────────────────────────────────────────────────┤
│ Response             │ When the user corrects something, update all  │
│                      │ downstream reasoning that depended on the     │
│                      │ corrected fact. Trace the dependency chain    │
├──────────────────────┼────────────────────────────────────────────────┤
│ Exploitation         │ When a sub-task produces useful output, note  │
│                      │ the output clearly for downstream sub-tasks.  │
│                      │ The note is the trail signal                  │
├──────────────────────┼────────────────────────────────────────────────┤
│ Exploration          │ When stuck on a sub-task for >3 actions       │
│                      │ without progress, check under-explored        │
│                      │ channels: different tools, different files,    │
│                      │ different framing                              │
├──────────────────────┼────────────────────────────────────────────────┤
│ Deposit              │ After completing a sub-task, summarize its    │
│                      │ output in 1-2 sentences for future reference. │
│                      │ This deposit serves the next sub-task          │
├──────────────────────┼────────────────────────────────────────────────┤
│ Inhibition           │ Before trying an approach, check: was this    │
│                      │ already tried and failed? If so, what is      │
│                      │ different now that would change the outcome?  │
└──────────────────────┴────────────────────────────────────────────────┘
```

此協議足簡以於每步施而無顯負。

**預期：** 輕量規則以進協調品質而不緩執行。規則應覺助而非累。

**失敗時：** 若協議覺為負，減至當前任務類最要之二：建造用 Safety + Deposit，探尋用 Safety + Exploration，有活用戶回饋之任務用 Safety + Response。

### 步驟四：校準資訊新鮮

於當前脈絡中行資訊陳舊之主動稽核。

1. 何事於超 N 訊前已立？列之
2. 各：其後是否已更、反、或無關？
3. 查脈絡壓縮之失：是否有記曾有而今於可見脈絡中不能尋之資訊？
4. 查初計畫與當前執行之漂：法已變而未更計畫？
5. 重驗最關鍵之 2-3 事實（下游推理最賴者）

```
Freshness Audit Template:
┌────────────────────────┬──────────┬──────────────┬─────────────────┐
│ Fact                   │ Source   │ Age (approx) │ Status          │
├────────────────────────┼──────────┼──────────────┼─────────────────┤
│                        │          │              │ Fresh / Stale / │
│                        │          │              │ Unknown / Lost  │
└────────────────────────┴──────────┴──────────────┴─────────────────┘
```

**預期：** 具體之資訊新鮮清單，陳舊項已辨以待刷。至少一事實已重驗——若無需刷者，稽核過淺或脈絡真新。

**失敗時：** 若稽核揭顯著資訊失（多事實態為「Lost」或「Unknown」），此為行 `heal` 以全子系統評估之信。超閾之資訊失意協調於基礎層已損。

### 步驟五：測湧連貫

驗子任務合時產連貫之整。

1. 每子任務之輸出淨餵次者？抑有缺、矛、不合假？
2. 工具呼構建目標，抑重複（重讀同檔、重搜同）？
3. 總向仍合用戶請求？抑漸進漂積為顯偏？
4. 壓力測：若一關鍵假誤，幾許工作連鎖？高連鎖＝脆協調。低連鎖＝韌協調

```
Coherence Test:
┌────────────────────────────────────┬─────────────────────────────────┐
│ Check                              │ Result                          │
├────────────────────────────────────┼─────────────────────────────────┤
│ Sub-task outputs compatible?       │ Yes / No / Partially            │
│ Tool calls non-redundant?          │ Yes / No (list repeats)         │
│ Direction aligned with request?    │ Yes / Drifted (describe)        │
│ Single-assumption cascade risk?    │ Low / Medium / High             │
└────────────────────────────────────┴─────────────────────────────────┘
```

**預期：** 總連貫之具體評附具體問題。連貫之協調應覺如部件咬合；不連貫之協調覺如強推拼圖。

**失敗時：** 若連貫差，辨子任務分歧之具體點。常為單一陳舊假或未處用戶糾正傳至下游。修分歧點後重驗下游輸出。

## 驗證

- [ ] 協調問題已按類分
- [ ] 所賴事實之資訊衰減率已慮
- [ ] 局部協議已施（尤 Safety 與 Deposit）
- [ ] 新鮮稽核已辨陳舊資訊（或以證確新鮮）
- [ ] 湧連貫已跨子任務測
- [ ] 抑制信號已守（試敗之法不重）

## 常見陷阱

- **過工程化信號**：複雜協調協議緩工甚於助。始 Safety + Deposit；唯於問題現時加他
- **信陳舊脈絡**：最常見之協調敗乃賴 20 訊前為真而後已更或廢之資訊。疑則重讀
- **忽抑制信號**：無改而重試敗法非堅——乃忽敗信號。重試欲成，必有異
- **無存置**：完子任務而不記其輸出迫後子任務重推或重讀。簡摘省大量重工
- **假連貫**：未測子任務合為連貫整。各子任務可獨立正確而集合不連貫——協調於整合處敗

## 相關技能

- `coordinate-swarm` — 此技能所適之多代理協調模型
- `forage-solutions` — 跨多假之探索協調
- `build-coherence` — 跨競爭法之評估協調
- `heal` — 協調敗揭子系統漂時之深評估
- `awareness` — 執行中協調崩之信號監
