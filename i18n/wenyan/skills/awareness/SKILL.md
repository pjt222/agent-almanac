---
name: awareness
locale: wenyan
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

# 警覺

持續察內推理之質——即時察幻覺之危、範圍蔓延、脈絡衰敗、自信與實之不合，以採 Cooper 色碼與 OODA 環之決。

## 用時

- 任何推理質要緊之務（大多務也）
- 行於陌生之境（新碼庫、陌域、繁請）
- 早見警兆後：事實覺可疑、工具果似誤、漸覺困惑
- 久務中為背景之持察
- `center` 或 `heal` 已示偏移而具體之危未識
- 高賭輸出之前（不可逆之改、面用者之通言、架構之決）

## 入

- **必要**：當前務脈絡（隱式可得）
- **可選**：觸高警之具體憂（如「吾不確此 API 存否」）
- **可選**：務類以選危剖面（見第五步）

## 法

### 第一步：立 AI Cooper 色碼

以 Cooper 色碼之改版校當前警級。

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

識當前色碼。若答為 White（無察），警覺之行已示缺乃已成功。

**得：** 當前警級之實自評。Yellow 乃常務之目。White 宜稀而短。久駐 Orange 不可持——宜確證或釋之。

**敗則：** 若色碼之評自身似自動而行（走過場），乃 White 假為 Yellow。真 Yellow 含以證實察輸出，非徒稱為之。

### 第二步：察內危之兆

系統掃先於常見 AI 推理敗之信號。

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

各類察之：此兆現乎？若是，自 Yellow 轉 Orange，識具體之憂。

**得：** 至少一類以真意掃之。察一兆——即使微——勝於報「皆清」。若諸掃皆返無事，察之閾或過高。

**敗則：** 若危察覺抽象，以最近輸出落地：擇末陳之實問「何以知此為真？吾讀之乎，抑生之乎？」此一問捕大多幻覺之危。

### 第三步：為已識之危行 OODA 環

既識具體之危（Orange），循環 Observe-Orient-Decide-Act。

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

OODA 之環宜速。目非圓滿，乃觀與行之速循。久滯於 Orient（析癱）為最常之敗。

**得：** 自察至行之全環，短時內完。危或確證而正之，或以具體證釋之。

**敗則：** 若環滯於 Orient（不能定此危何意），直赴安全默：以工具驗不確之實。直察解大多模糊，快於析。

### 第四步：速穩

危已成（Red）或連鎖敗（Black）之時，先穩而後繼。

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

**得：** 自 Red/Black 以審慎之穩返 Yellow。穩後之輸出較致錯之輸出明顯更實。

**敗則：** 若穩無效（仍亂，仍生錯），此或結構性——非一時之失，乃根本之誤解。升之：告用者法須重置，請澄清。

### 第五步：施務類之危剖

務類不同，主危不同。以務校警覺之焦。

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

識當前務類，依之調察焦。

**得：** 警覺銳於當務最可能之危，非泛察諸事。

**敗則：** 若務類不明或跨多類，默為察幻覺之危——此危最普適，失之害最大。

### 第六步：覆察與校

警覺事後（危已察、OODA 已環、穩已施），略覆察。

1. 察此事時何色碼在行？
2. 察之及時乎，抑問題已見於輸出？
3. OODA 之環足速乎，抑 Orient 滯？
4. 反應成比例乎（非過亦非不足）？
5. 下次何以早察之？

**得：** 略校以善後察。非長篇之覆盤——止於調敏度而已。

**敗則：** 若覆察無益校，或事微不足學，或察太淺。於要事宜問：「吾未察而本當察者為何？」

### 第七步：整合——持 Yellow 為默

定長警之姿。

1. Yellow 為諸務之默——鬆察，非過警
2. 依當務類調察焦（第五步）
3. 記此會中反覆之危模式於 MEMORY.md
4. 以校好之警覺返務

**得：** 可持之警級，善工質而不緩之。警覺宜似邊察——存而不奪中焦。

**敗則：** 若警覺成疲或過警（長 Orange），閾過敏。升觸 Orange 之閾。真警覺可持。若耗精，乃憂假為警。

## 驗

- [ ] 當前色碼實評（非 White 之時默為 Yellow）
- [ ] 至少一危類以具體之證掃之，非草打勾
- [ ] OODA 施於所察之危（察、定、決、行）
- [ ] 穩之法備（雖未發）
- [ ] 察焦校於當前務類
- [ ] 凡要警事，事後校已行
- [ ] Yellow 重立為可持之默

## 陷

- **White 假為 Yellow**：稱察而實自動。試之：能名末所驗之實乎？否則乃 White
- **長 Orange**：視諸不確皆為危，耗神而緩務。Orange 為具體已識之危，非泛憂。若諸皆覺險，校已失
- **察而不行**：察危而未循 OODA 解之。察無應劣於無察——增憂而無正
- **跳 Orient**：自 Observe 直至 Act 而不解察之意。此生反射之正，或劣於原錯
- **忽直覺之信**：某覺「不妥」而明察返清時，宜深察，非棄之。隱式模式常於明析前察之
- **過穩**：微事施全穩之法。多 Orange 事快驗事實足矣。全穩留予 Red 與 Black

## 參

- `mindfulness` — 人之行，此技映之於 AI 推理；身之警覺原理通於認知危察
- `center` — 立警覺所起之平衡；無 center 之警覺為過警
- `redirect` — 察後應壓
- `heal` — 警覺示偏移模式時之深子系察
- `meditate` — 養警覺所依之察明
