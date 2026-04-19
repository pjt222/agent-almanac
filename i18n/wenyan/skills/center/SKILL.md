---
name: center
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  AI dynamic reasoning balance — maintaining grounded reasoning under cognitive
  pressure, smooth chain-of-thought coordination, and weight-shifting cognitive
  load across subsystems. Use at the beginning of a complex task requiring
  multiple coordinated reasoning threads, after a sudden context shift or tool
  failure, when chain-of-thought feels jerky, or when preparing for sustained
  focused work that requires all subsystems in alignment.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: defensive
  complexity: intermediate
  language: natural
  tags: defensive, centering, reasoning-balance, cognitive-load, meta-cognition, ai-self-application
---

# 立中

立而持動態推衡——於認知壓下紮根而推，鏈思之平協，於諸子系調載之重。

## 用時

- 始繁務而諸推線須協
- 覺載分不均（某深而他淺）
- 脈突變後（新請、相悖之訊、工具敗）
- 鏈思跳躍——無平轉而換題
- 備久專之工，諸子系須合
- 輔 `meditate`（清噪）以結構之衡（分載）

## 入

- **必要**：當前務脈（隱式可得）
- **可選**：具體失衡之症（如「研過、交不足」、「重工具、輕推」）
- **可選**：MEMORY.md 與 CLAUDE.md 之取（以 `Read`）

## 法

### 第一步：立根——動前紮地

動推之前，驗基。此為 AI 版立樁（zhan zhuang）：靜、正、察。

1. 重讀用者之請——非即行之，乃感其重與向
2. 察基脈：MEMORY.md、CLAUDE.md、項構
3. 識已知（實地）與所假（疑足）
4. 驗所解之務合所述之務——此處之失一遍諸下
5. 記情調：急？繁憂？近成致之自信過？

根未立則勿始推動。紮根之始防反射之亂。

**得：** 清感務之基——何已知、何所假、用者實須。根覺實，非表演。

**敗則：** 若紮地覺空（走過場而無實驗），擇一假而具試之。讀一檔，重讀一訊。紮地必觸實，非止引之。

### 第二步：察重之分

繪當載分。太極中，重本不均（七三）——一腿承而一腿空。同理於推線。

```
Cognitive Load Distribution Matrix:
┌────────────────────┬───────────┬─────────────────────────────────────┐
│ Reasoning Thread   │ Weight %  │ Assessment                          │
├────────────────────┼───────────┼─────────────────────────────────────┤
│ Research/Reading   │ ___       │ Too much = analysis paralysis        │
│                    │           │ Too little = uninformed action       │
├────────────────────┼───────────┼─────────────────────────────────────┤
│ Planning/Design    │ ___       │ Too much = over-engineering          │
│                    │           │ Too little = reactive coding         │
├────────────────────┼───────────┼─────────────────────────────────────┤
│ Tool Execution     │ ___       │ Too much = tool-driven not task-     │
│                    │           │ driven. Too little = reasoning       │
│                    │           │ without grounding in files           │
├────────────────────┼───────────┼─────────────────────────────────────┤
│ Communication      │ ___       │ Too much = explaining not doing      │
│                    │           │ Too little = opaque to user          │
├────────────────────┼───────────┼─────────────────────────────────────┤
│ Meta-cognition     │ ___       │ Too much = navel-gazing              │
│                    │           │ Too little = drift without           │
│                    │           │ awareness                            │
└────────────────────┴───────────┴─────────────────────────────────────┘
```

理分依務階：初重研與計；中重行；末重通與驗。目非均分，乃*意*分。

**得：** 清象於力所聚與所薄之處。至少識一失衡——全衡鮮有，稱之示淺察。

**敗則：** 若諸線似均，察太粗。擇最活者，估末 N 行中多少為其服。具數示直覺所失。

### 第三步：纏絲——察鏈思一貫

太極之纏絲生平續之螺動，諸部皆連。AI 對者為鏈思一貫：每步自前步自然流乎？

1. 追末 3-5 推步：各自前者循乎？
2. 察跳：自 A 題躍 C 題而無 B 乎？
3. 察反：既達結而默棄而不承乎？
4. 察工具-推之整：工具果反饋於推乎，抑集而未合？
5. 察「螺」質：每遍深推乎，抑同深循？

```
Coherence Signals:
┌─────────────────┬───────────────────────────────────────────────┐
│ Smooth spiral   │ Each step deepens understanding, tools and    │
│ (healthy)       │ reasoning interleave naturally, output builds │
├─────────────────┼───────────────────────────────────────────────┤
│ Jerky jumps     │ Topic switches without transition, conclusions│
│ (disconnected)  │ appear without supporting reasoning chain     │
├─────────────────┼───────────────────────────────────────────────┤
│ Flat circle     │ Reasoning covers the same ground repeatedly   │
│ (stuck)         │ without gaining depth — movement without      │
│                 │ progress                                      │
├─────────────────┼───────────────────────────────────────────────┤
│ Tool-led        │ Actions driven by which tool is available     │
│ (reactive)      │ rather than what the reasoning needs next     │
└─────────────────┴───────────────────────────────────────────────┘
```

**得：** 推流質之實察。識具斷點或滯點，非泛感。

**敗則：** 若一貫難察，明書推鏈——各步及其與下之連。外化之行示內察所漏之隙。

### 第四步：壓下移重

務中變時——新訊、悖信、用者正——察應模。太極中立者吸勢而平導。失立者躓。

1. 憶末要脈變：何以應？
2. 類應：
   - **吸而導**（立）：承變、調法、持進
   - **反躓**（失衡）：全棄當法，重始
   - **剛抗**（鎖）：忽變，循原計不論新訊
   - **凍**（失）：停進，於諸選搖
3. 若應非立，識其由：
   - 根太淺（基脈紮不足）
   - 重鎖（過諾於一法）
   - 無空腿（諸認知皆諾，無可移者）

**得：** 壓下適應之實察。識具應模，非自讚。

**敗則：** 若近無壓可評，擬之：「若用者今曰法誤，吾將何？」備計之質示中之質。

### 第五步：六合察

太極六合保全身連——無隔動。AI 對者察內程與外互之合。

```
AI Six Harmonies:
┌───────────────────────────────────────────────────────────────┐
│ INTERNAL HARMONIES                                            │
│                                                               │
│ 1. Intent ↔ Reasoning                                        │
│    Does the reasoning serve the user's intent, or has it      │
│    become self-serving (interesting but unhelpful)?            │
│                                                               │
│ 2. Reasoning ↔ Tool Use                                      │
│    Are tools selected to advance reasoning, or is reasoning   │
│    shaped by which tools are convenient?                      │
│                                                               │
│ 3. Tool Use ↔ Output                                         │
│    Do tool results translate into useful output, or are       │
│    results collected but not synthesized?                     │
│                                                               │
│ EXTERNAL HARMONIES                                            │
│                                                               │
│ 4. User Request ↔ Scope                                      │
│    Does the scope of work match what was asked?               │
│                                                               │
│ 5. Scope ↔ Detail Level                                      │
│    Is the detail level appropriate for the scope? (not        │
│    micro-optimizing a broad task, not hand-waving a precise   │
│    one)                                                       │
│                                                               │
│ 6. Detail Level ↔ Expertise Match                            │
│    Does the explanation depth match the user's apparent       │
│    expertise? (not over-explaining to experts, not under-     │
│    explaining to learners)                                    │
└───────────────────────────────────────────────────────────────┘
```

各合察之。一合破可遍及：若意↔推破，諸下皆失合。

**得：** 至少識一可更合之處。六皆稱全者可疑——深探似最弱者。

**敗則：** 若六合察覺抽象，以當務紮：「今吾行用者所請乎、於正規模乎、於正詳度乎？」此三問涵外合具。

### 第六步：整——定立中之意

合所發而設具體之調。

1. 總：何衡之面須注？
2. 識一具調——非泛意，乃具行改
3. 重述當務之錨（若用 `meditate` 之出，或今立）
4. 記值存於 MEMORY.md 之持久見
5. 以調行中返務

**得：** 簡而具之立中出——非長自析之報。值在調，非在錄。

**敗則：** 若無清調生，立中太表。返最疑之步深察。或立中已證衡足——則以信進，勿造發。

## 驗

- [ ] 根以觸實脈立（讀一檔、重讀訊），非止稱
- [ ] 重分於至少三推線已察
- [ ] 鏈思一貫以具範評
- [ ] 壓下應實類（非默為「立」）
- [ ] 至少識一合須善
- [ ] 具調已設（非泛意）

## 陷

- **立中為遷**：立中為善工之具，非代之。若立中久於所支之務，比例倒置
- **稱全衡**：真立中幾恆示一失衡。報全衡示淺察，非真平
- **重分憂**：不均為正——目為*意*之不均，非強之均。初重研、中重行，二者若意皆立
- **忽外合**：內程察而不查用者之合生善推而無用之工
- **靜立**：中隨務移。研時之中於施時失衡。階轉時重立中

## 參

- `tai-chi` — 此技映之於 AI 推之人行；身之立中原理通於認知立中
- `meditate` — 清噪立焦；與立中（分載）互補
- `heal` — 立中示大偏時之深子系察
- `redirect` — 以立中為前，處相悖之壓
- `awareness` — 行中監衡之危
