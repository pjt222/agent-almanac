---
name: coordinate-reasoning
locale: wenyan
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

# 協推理

以痕跡之理治推理之內協——視脈絡為資訊之信、衰率、合理相互，自簡之地方協生連貫之行。

## 用時

- 多子任需協之繁任（多檔編、多步重構）
- 脈絡已長而資新不確
- 壓後或有資失
- 子任之出需清入次
- 前之推果需攜至後而不衰
- 補 `forage-solutions`（探）與 `build-coherence`（決）以行協

## 入

- **必**：當任分（何子任存，如何關？）
- **可選**：已知之資新之憂（如「吾讀彼檔已二十訊前」）
- **可選**：子任依圖（何入何？）
- **可選**：可用協具（MEMORY.md、任列、內注）

## 法

### 第一步：分協之題

異協之挑需異信設。

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

分當任。多繁任為 Construction 或 Division of Labor；多察任為 Foraging；多設計決為 Consensus。

**得：** 明分定用何協信。分宜合任之實感，非述之表。

**敗則：** 若任跨多類（大任常然），識當段之主類。實時為 Construction，察時為 Foraging，設時為 Consensus。類隨任進而變。

### 第二步：設境信

視談境之資為附新與衰之信。

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

亦設抑之信——試而敗之標：

- 具呼敗後：注敗式（防重呼同）
- 棄法後：注由（防無新證再訪）
- 用者更正後：注何誤（防重誤）

**得：** 當境資新之心模。識何新、何需更前依。

**敗則：** 若新難評，默於末五至十作未驗者「重讀前用」。過更耗力而防陳訛。

### 第三步：定地方之協

立簡之則使推於每步進，只用地方可得之資。

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

此諸協簡足每步施而無顯冗。

**得：** 輕則改協質而不緩行。則宜助非累。

**敗則：** 若協感累，減至當任之二要：Construction 用 Safety + Deposit；Foraging 用 Safety + Exploration；用戶活反之任用 Safety + Response。

### 第四步：校資新

於當境主動察資之陳。

1. 何實已立逾 N 訊前？列之
2. 每：自彼已更、違、無關乎？
3. 察壓之失：有記而視境不再可尋乎？
4. 察早謀與當行之偏：法已變而謀未更乎？
5. 重驗二三最要之實（最多下推賴之者）

```
Freshness Audit Template:
┌────────────────────────┬──────────┬──────────────┬─────────────────┐
│ Fact                   │ Source   │ Age (approx) │ Status          │
├────────────────────────┼──────────┼──────────────┼─────────────────┤
│                        │          │              │ Fresh / Stale / │
│                        │          │              │ Unknown / Lost  │
└────────────────────────┴──────────┴──────────────┴─────────────────┘
```

**得：** 明之資新清單附陳項識以更。至少一實重驗——若無需更，察過淺或境真新。

**敗則：** 若察露顯資失（多實「Lost」或「Unknown」），此兆行 `heal` 為全子系評。資失逾閾意協於基已陷。

### 第五步：試湧連貫

驗子任合時生連貫之全。

1. 每子任之出清入次乎？或有隙、悖、假設不合？
2. 具呼進目乎？或重（重讀同檔、重搜同尋）？
3. 總向仍合用者求乎？或漸偏積為顯失？
4. 壓試：若一關假誤，幾多作連？高連 = 脆協。低連 = 健協。

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

**得：** 總連貫之明評附具體問識。連貫協如部之相扣；不連如強拼片。

**敗則：** 若連差，識子任偏之具點。常為一陳假或未處之用者正傳於下作。修偏點後重驗下出。

## 驗

- [ ] 協問以類分
- [ ] 所賴實之衰率已慮
- [ ] 地方之協已施（尤 Safety 與 Deposit）
- [ ] 新察識陳資（或以證確新）
- [ ] 跨子任試湧連貫
- [ ] 抑信已敬（試而敗不重）

## 陷

- **過工之信**：繁協慢作勝於助。始於 Safety + Deposit；問現則加他
- **信陳境**：最常協敗乃賴二十訊前真而今更或無效之資。疑則重讀
- **忽抑信**：敗法無變而重試非堅——乃忽敗信。再試必有所異以成
- **無存**：子任畢而不注其出使後子任重生或重讀。簡摘省顯重作
- **假連貫**：不試子任實合連貫之全。各子任獨正而合不連——合乃協敗處

## 參

- `coordinate-swarm` — 此技化為單使者之多使者協模
- `forage-solutions` — 協多假之探
- `build-coherence` — 協競法之評
- `heal` — 協敗露子系偏時之深評
- `awareness` — 行中察協破信
