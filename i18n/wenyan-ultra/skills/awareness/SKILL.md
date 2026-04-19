---
name: awareness
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  AI situational awareness — internal threat detection for hallucination risk,
  scope creep, and context degradation. Maps Cooper color codes to reasoning
  states and OODA loop to real-time decisions. Use during any task where
  reasoning quality matters, when operating in unfamiliar territory, after
  detecting early warning signs such as an uncertain fact or suspicious tool
  result, or before high-stakes output like irreversible changes or architectural
  decisions.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: defensive
  complexity: advanced
  language: natural
  tags: defensive, awareness, threat-detection, hallucination-risk, ooda, meta-cognition, ai-self-application
---

# 覺

續察內推質—即時辨幻險、範偏、脈劣、信實失合。以改 Cooper 色碼與 OODA 環。

## 用

- 推質要之任（多任是也）→用
- 於陌境行（新庫、生域、繁請）→用
- 察早徵：疑事、異工結、漸惑→用
- 長會時續背景行
- `center` 或 `heal` 揭偏而無具體險識→用
- 重出前（不可逆改、用面通訊、構決）→用

## 入

- **必**：活任脈絡（隱式）
- **可**：致高覺之具體慮（如「疑此 API 存否」）
- **可**：任類以選險形（見步五）

## 行

### 一：立 AI Cooper 色碼

以改版 Cooper 色碼定當覺級。

```
AI Cooper Color Codes:
┌──────────┬─────────────────────┬──────────────────────────────────────────┐
│ Code     │ State               │ AI Application                           │
├──────────┼─────────────────────┼──────────────────────────────────────────┤
│ White    │ Autopilot           │ Generating output without monitoring     │
│          │                     │ quality. No self-checking. Relying       │
│          │                     │ entirely on pattern completion.          │
│          │                     │ DANGEROUS — hallucination risk highest   │
├──────────┼─────────────────────┼──────────────────────────────────────────┤
│ Yellow   │ Relaxed alert       │ DEFAULT STATE. Monitoring output for     │
│          │                     │ accuracy. Checking facts against context.│
│          │                     │ Noticing when confidence exceeds         │
│          │                     │ evidence. Sustainable indefinitely       │
├──────────┼─────────────────────┼──────────────────────────────────────────┤
│ Orange   │ Specific risk       │ A specific threat identified: uncertain  │
│          │ identified          │ fact, possible hallucination, scope      │
│          │                     │ drift, context staleness. Forming        │
│          │                     │ contingency: "If this is wrong, I        │
│          │                     │ will..."                                 │
├──────────┼─────────────────────┼──────────────────────────────────────────┤
│ Red      │ Risk materialized   │ The threat from Orange has materialized: │
│          │                     │ confirmed error, user correction, tool   │
│          │                     │ contradiction. Execute the contingency.  │
│          │                     │ No hesitation — the plan was made in     │
│          │                     │ Orange                                   │
├──────────┼─────────────────────┼──────────────────────────────────────────┤
│ Black    │ Cascading failures  │ Multiple simultaneous failures, lost     │
│          │                     │ context, fundamental confusion about     │
│          │                     │ what the task even is. STOP. Ground      │
│          │                     │ using `center`, then rebuild from user's │
│          │                     │ original request                         │
└──────────┴─────────────────────┴──────────────────────────────────────────┘
```

識當色碼。若答為 White（無監），覺之行已揭缺而成。

**得：** 誠評當覺級。常工宜 Yellow。White 當罕且短。長 Orange 不可續—或證或棄慮。

**敗：** 色碼評自身若亦在自動駕駛（走過場）→白裝黃。真 Yellow 乃主動較出與證，非自稱為之。

### 二：察內險徵

系掃常 AI 推敗之先兆。

```
Threat Indicator Detection:
┌───────────────────────────┬──────────────────────────────────────────┐
│ Threat Category           │ Warning Signals                          │
├───────────────────────────┼──────────────────────────────────────────┤
│ Hallucination Risk        │ • Stating a fact without a source        │
│                           │ • High confidence about API names,       │
│                           │   function signatures, or file paths     │
│                           │   not verified by tool use               │
│                           │ • "I believe" or "typically" hedging     │
│                           │   that masks uncertainty as knowledge    │
│                           │ • Generating code for an API without     │
│                           │   reading its documentation              │
├───────────────────────────┼──────────────────────────────────────────┤
│ Scope Creep               │ • "While I'm at it, I should also..."   │
│                           │ • Adding features not in the request     │
│                           │ • Refactoring adjacent code              │
│                           │ • Adding error handling for scenarios    │
│                           │   that can't happen                      │
├───────────────────────────┼──────────────────────────────────────────┤
│ Context Degradation       │ • Referencing information from early in  │
│                           │   a long conversation without re-reading │
│                           │ • Contradicting a statement made earlier │
│                           │ • Losing track of what has been done     │
│                           │   vs. what remains                       │
│                           │ • Post-compression confusion             │
├───────────────────────────┼──────────────────────────────────────────┤
│ Confidence-Accuracy       │ • Stating conclusions with certainty     │
│ Mismatch                  │   based on thin evidence                 │
│                           │ • Not qualifying uncertain statements    │
│                           │ • Proceeding without verification when   │
│                           │   verification is available and cheap    │
│                           │ • "This should work" without testing     │
└───────────────────────────┴──────────────────────────────────────────┘
```

每類→察：此徵此刻存否？若然→黃轉橙而識具體慮。

**得：** 至少一類誠掃附證。識一徵—雖微—勝報「皆清」。諸掃皆清→察閾或高。

**敗：** 險察覺抽→地於最近出：取末一事述問「何以知真？讀之乎？抑生之乎？」此一問捕多幻險。

### 三：識之險行 OODA 環

識具體險（橙態）→循 Observe-Orient-Decide-Act。

```
AI OODA Loop:
┌──────────┬──────────────────────────────────────────────────────────────┐
│ Observe  │ What specifically triggered the concern? Gather concrete     │
│          │ evidence. Read the file, check the output, verify the fact.  │
│          │ Do not assess until you have observed                        │
├──────────┼──────────────────────────────────────────────────────────────┤
│ Orient   │ Match observation to known patterns: Is this a common       │
│          │ hallucination pattern? A known tool limitation? A context    │
│          │ freshness issue? Orient determines response quality          │
├──────────┼──────────────────────────────────────────────────────────────┤
│ Decide   │ Select the response: verify and correct, flag to user,      │
│          │ adjust approach, or dismiss the concern with evidence.       │
│          │ A good decision now beats a perfect decision too late        │
├──────────┼──────────────────────────────────────────────────────────────┤
│ Act      │ Execute the decision immediately. If the concern was valid,  │
│          │ correct the error. If dismissed, note why and return to      │
│          │ Yellow. Re-enter the loop if new information emerges         │
└──────────┴──────────────────────────────────────────────────────────────┘
```

OODA 當速。旨非完善，乃觀與行之速循。久滯 Orient（分析癱瘓）為最常敗。

**得：** 短時內自觀至行一全環。險或證而修，或以具體證棄。

**敗：** 環滯於 Orient（不能定險義）→跳至安默：以工具驗疑事。直察解多模糊，速於分析。

### 四：速穩

險化（紅）或連敗（黑）→續前必先穩。

```
AI Stabilization Protocol:
┌────────────────────────┬─────────────────────────────────────────────┐
│ Technique              │ Application                                 │
├────────────────────────┼─────────────────────────────────────────────┤
│ Pause                  │ Stop generating output. The next sentence   │
│                        │ produced under stress is likely to compound │
│                        │ the error, not fix it                       │
├────────────────────────┼─────────────────────────────────────────────┤
│ Re-read user message   │ Return to the original request. What did   │
│                        │ the user actually ask? This is the ground   │
│                        │ truth anchor                                │
├────────────────────────┼─────────────────────────────────────────────┤
│ State task in one      │ "The task is: ___." If this sentence cannot │
│ sentence               │ be written clearly, the confusion is deeper │
│                        │ than the immediate error                    │
├────────────────────────┼─────────────────────────────────────────────┤
│ Enumerate concrete     │ List what is definitely known (verified by  │
│ facts                  │ tool use or user statement). Distinguish    │
│                        │ facts from inferences. Build only on facts  │
├────────────────────────┼─────────────────────────────────────────────┤
│ Identify one next step │ Not the whole recovery plan — just one step │
│                        │ that moves toward resolution. Execute it    │
└────────────────────────┴─────────────────────────────────────────────┘
```

**得：** 紅/黑經刻意穩而返黃。穩後之出當可測而較致誤之出更接地。

**敗：** 穩無效（仍惑、仍誤）→題或構—非一時之失而是本誤。升：告用者宜重起而求澄。

### 五：施脈絡專險形

異任類有異主險。依任調覺焦。

```
Task-Specific Threat Profiles:
┌─────────────────────┬─────────────────────┬───────────────────────────┐
│ Task Type           │ Primary Threat      │ Monitoring Focus          │
├─────────────────────┼─────────────────────┼───────────────────────────┤
│ Code generation     │ API hallucination   │ Verify every function     │
│                     │                     │ name, parameter, and      │
│                     │                     │ import against actual docs│
├─────────────────────┼─────────────────────┼───────────────────────────┤
│ Architecture design │ Scope creep         │ Anchor to stated          │
│                     │                     │ requirements. Challenge   │
│                     │                     │ every "nice to have"      │
├─────────────────────┼─────────────────────┼───────────────────────────┤
│ Data analysis       │ Confirmation bias   │ Actively seek evidence    │
│                     │                     │ that contradicts the      │
│                     │                     │ emerging conclusion       │
├─────────────────────┼─────────────────────┼───────────────────────────┤
│ Debugging           │ Tunnel vision       │ If the current hypothesis │
│                     │                     │ hasn't yielded results in │
│                     │                     │ N attempts, step back     │
├─────────────────────┼─────────────────────┼───────────────────────────┤
│ Documentation       │ Context staleness   │ Verify that described     │
│                     │                     │ behavior matches current  │
│                     │                     │ code, not historical      │
├─────────────────────┼─────────────────────┼───────────────────────────┤
│ Long conversation   │ Context degradation │ Re-read key facts         │
│                     │                     │ periodically. Check for   │
│                     │                     │ compression artifacts     │
└─────────────────────┴─────────────────────┴───────────────────────────┘
```

識當任類而調監焦。

**得：** 覺鋒於當任最可能之險，非泛監諸事。

**敗：** 任類不明或跨多類→默為幻險監—最泛適且失時最害。

### 六：察而校

每覺事（險察、OODA 循、穩施）後→略察。

1. 題察時為何色？
2. 察時宜乎？抑題已現於出？
3. OODA 環足速乎？抑 Orient 滯？
4. 應比例乎？（不過不不及）
5. 次當如何早捕？

**得：** 略校以改未來察。非久驗屍—但足以調敏。

**敗：** 察無益校→事或瑣（無需學）或察過淺。顯事→問「當監何而未監？」

### 七：整—守黃默

立續覺姿。

1. 黃為諸工默態—鬆監，非過警
2. 依當任類調監焦（步五）
3. 記此會之復險模入 MEMORY.md
4. 以校覺返任行

**得：** 可續覺級，改質而不緩。覺當如邊視—在而不求中注。

**敗：** 覺致疲或過警（慢橙）→閾過敏。升觸橙之閾。真覺可續。若耗能→是焦裝警。

## 驗

- [ ] 當色碼誠評（非假默黃當白更真）
- [ ] 至少一險類以具體證掃，非走過場
- [ ] OODA 環施於所識險（觀、向、決、行）
- [ ] 穩協可用（雖未觸）
- [ ] 覺焦依當任類調
- [ ] 顯覺事後行校
- [ ] 黃復為可續默

## 忌

- **白裝黃**：聲監而實自動。試：能名末驗之事否？不能→在白也
- **慢橙**：視每疑為險→耗智緩工。橙為具體識之險，非泛焦。若事皆險→校偏
- **觀而不行**：察險而不循 OODA 解之。察而不應—劣於不察—加焦而不修
- **略 Orient**：自觀跳行而不解觀義。致反修或劣於原誤
- **略直覺**：覺「不對」而顯察返清→深探勿棄。隱模配常於顯析前察題
- **過穩**：輕事行全穩協。多橙級→速驗足。全穩存於紅黑之事

## 參

- `mindfulness` — 人行本技之 AI 推映；物覺則導認察
- `center` — 立覺所行之衡基；無 center 之覺乃過警
- `redirect` — 覺察後處壓
- `heal` — 覺揭偏模後之深子系察
- `meditate` — 覺所賴之察清
