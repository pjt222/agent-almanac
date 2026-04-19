---
name: coordinate-reasoning
locale: wenyan-ultra
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

# 調推理

以 stigmergic 理調推過——脈為境，信息有鮮、衰、互動規以生協同行。

## 用

- 複任含多子任須調（多檔編、多步重構）
- 脈長鮮不確
- 壓縮後或失信息
- 子任出須淨入下
- 早推果須帶前而不退
- 補 `forage-solutions`（探）與 `build-coherence`（決）以行調

## 入

- **必**：現任分（何子任在、如何關？）
- **可**：鮮憂（如「20 訊前讀此檔」）
- **可**：子任依圖（何入何？）
- **可**：可調具（MEMORY.md、任列、行內注）

## 行

### 一：分調問類

異調挑須異信號設。

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

分現任。多複任為 Construction 或 Division of Labor；多除錯任為 Foraging；多設決為 Consensus。

**得：** 明分定何信號。分當合任實感，非述。

**敗：** 任跨多類（大任常）→識現階主類。施時 Construction、除錯時 Foraging、設時 Consensus。類於任進可變。

### 二：設脈信號

視脈中信息為含鮮與衰性之信號。

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

亦設抑信號——已試敗法之標：

- 工呼敗後：注敗模（防重呼同）
- 法棄後：注因（防無新證重訪）
- 用糾後：注誤（防復錯）

**得：** 現脈鮮之心模。識何鮮何須先新後依。

**敗：** 鮮難評→默「依前重讀」於末 5-10 動未驗者。過新費力而防陳信息誤。

### 三：定局協

立簡規，每步推理依只局可得信息行。

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

諸協簡而可每步施而無重負。

**得：** 增調質而不減行之輕規集。規當助，非負。

**敗：** 協感負→減至現任類最要二：Construction→Safety + Deposit；Foraging→Safety + Exploration；含用回之任→Safety + Response。

### 四：校信息鮮

行現脈陳之主審。

1. 超 N 訊前之事列之
2. 各：已更、駁、無關否？
3. 察脈壓損：記而於現脈不可尋之信息乎？
4. 察早謀與現行之漂：法變而謀未更乎？
5. 重驗 2-3 最要事（最多下推賴者）

```
Freshness Audit Template:
┌────────────────────────┬──────────┬──────────────┬─────────────────┐
│ Fact                   │ Source   │ Age (approx) │ Status          │
├────────────────────────┼──────────┼──────────────┼─────────────────┤
│                        │          │              │ Fresh / Stale / │
│                        │          │              │ Unknown / Lost  │
└────────────────────────┴──────────┴──────────────┴─────────────────┘
```

**得：** 鮮之具庫，陳者識以新。至少一事重驗——無須新則審淺或脈實鮮。

**敗：** 審揭信息大損（多事「Lost」「Unknown」）→召 `heal` 全子系察。信息損逾閾→調於基已損。

### 五：測生協同

驗子任合為協之整。

1. 每子任出淨入下乎？或有缺、悖、假設不合？
2. 工呼築於目乎？或重（讀同檔、行同搜）？
3. 總向仍合用求乎？或漸漂積為大不合？
4. 壓測：一要假設誤→幾何工級聯？高→脆。低→穩。

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

**得：** 總協之具評含具問識。協調感如部拼合；不協感如強塞拼圖。

**敗：** 協差→識子任分叉之具點。常為單陳假設或未處用糾傳於下工。修分點，再驗下出。

## 驗

- [ ] 調問已按類分
- [ ] 所賴事之信息衰已慮
- [ ] 局協已施（尤 Safety 與 Deposit）
- [ ] 鮮審識陳（或以證確鮮）
- [ ] 生協同已跨子任測
- [ ] 抑信號尊（已試敗法未復）

## 忌

- **過設信號**：複調協減行勝助。起於 Safety + Deposit；問現方加他
- **信陳脈**：最常調敗為依 20 訊前真而今更或失者。疑則重讀
- **忽抑信號**：敗法而不變重試非堅——為忽敗信號。重試須有異方成
- **無沉積**：畢子任不注出→後子任重推或重讀。簡結省大重工
- **設協同**：未測子任合為協整。各子任獨正而合不協——調敗於整處

## 參

- `coordinate-swarm` — 多代調模，此技適於單代推
- `forage-solutions` — 調諸假設探
- `build-coherence` — 調爭法評
- `heal` — 調敗揭子系漂時之深察
- `awareness` — 行中監調敗信號
