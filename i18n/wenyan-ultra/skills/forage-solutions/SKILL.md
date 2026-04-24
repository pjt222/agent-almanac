---
name: forage-solutions
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  AI solution exploration using ant colony optimization — deploying scout
  hypotheses, reinforcing promising approaches, detecting diminishing returns,
  and knowing when to abandon a strategy. Use when facing a problem with
  multiple plausible approaches and no clear winner, when the first approach
  is not working but alternatives are unclear, when debugging with no obvious
  root cause requiring parallel hypothesis investigation, or when previous
  attempts have converged prematurely on a suboptimal approach.
license: MIT
allowed-tools: Read Glob Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: swarm
  complexity: intermediate
  language: natural
  tags: swarm, foraging, solution-search, exploration-exploitation, meta-cognition, ai-self-application
---

# 採解

以蟻群優原則探解空——布獨立假為偵、以證強良徑、察遞減益、知何時棄策他探。

## 用

- 題有多可法而無明勝
- 首法不行而替不明
- 調無明根因——多假須並查
- 於碼中尋行源而位未知
- 前解嘗早收於次優
- 補 `build-coherence` 於決前須探解空時

## 入

- **必**：題述或目（採何？）
- **必**：現知態（已知何？）
- **可**：前所試法與其果
- **可**：探約（時預、工可用）
- **可**：急度（影探用衡）

## 行

### 一：映解境

布偵前表解空形。

```
Solution Distribution Types:
┌────────────────────┬──────────────────────────────────────────────────┐
│ Type               │ Characteristics and Strategy                     │
├────────────────────┼──────────────────────────────────────────────────┤
│ Concentrated       │ One correct answer exists (bug fix, syntax       │
│ (one right fix)    │ error). Deploy many scouts quickly to locate     │
│                    │ it. Exploit immediately when found               │
├────────────────────┼──────────────────────────────────────────────────┤
│ Distributed        │ Multiple valid approaches (architecture choice,  │
│ (many valid paths) │ implementation strategy). Scouts assess quality  │
│                    │ of each. Use `build-coherence` to choose         │
├────────────────────┼──────────────────────────────────────────────────┤
│ Ephemeral          │ Solutions depend on timing or sequence (race     │
│ (time-sensitive)   │ conditions, order-dependent bugs). Fast scouting │
│                    │ with immediate exploitation. Cannot revisit       │
├────────────────────┼──────────────────────────────────────────────────┤
│ Nested             │ Solving the surface problem reveals a deeper one │
│ (layers of cause)  │ (config issue masking an architecture problem).  │
│                    │ Scout at each layer before committing to depth   │
└────────────────────┴──────────────────────────────────────────────────┘
```

分現題。分類定布幾偵、何速切自探至用。

得：明表解境以導偵策。分類宜覺正，非強。

敗：境全不知——此本為分類——視為或散並布廣偵。首輪偵將示境性。

### 二：布偵假

生獨立假為偵。各偵於解空異向探。

1. 生 3-5 獨立題或解之假
2. 各假定一廉試——單文讀、一 grep、一特察
3. 依證（非直覺）計初許
4. 獨布偵：勿令假 A 之估影假 B 之試

```
Scout Deployment Template:
┌───────┬──────────────────────┬──────────────────────┬──────────┐
│ Scout │ Hypothesis           │ Test (one action)    │ Promise  │
├───────┼──────────────────────┼──────────────────────┼──────────┤
│ 1     │                      │                      │ High/Med/│
│ 2     │                      │                      │ Low      │
│ 3     │                      │                      │          │
│ 4     │                      │                      │          │
│ 5     │                      │                      │          │
└───────┴──────────────────────┴──────────────────────┴──────────┘
```

要則：偵估，非用。目為各假速信，非首似許者之深查。

得：3-5 獨立假有廉試定。無假已深探——此為廣先過。

敗：生 <3 假→題或甚約（聚類——好，盛偵）或解過淺（假前先讀境）。假不獨（皆同念之變）→探過窄——強加至少一悖於他者之假。

### 三：跡強——循證

偵果返後強良跡，任弱者衰。

1. 閱偵果：何假有撐證？
2. **強證**→強跡：此投更多查力
3. **無證**→任跡衰：無新信勿續查
4. **悖證**→標抑信：主避此徑
5. 監早收：若諸力皆入首強跡→強一偵入未探域

```
Trail Reinforcement Decision:
┌───────────────────────────┬──────────────────────────────────────┐
│ Scout Result              │ Action                               │
├───────────────────────────┼──────────────────────────────────────┤
│ Strong supporting evidence│ REINFORCE — deepen investigation     │
│ Weak supporting evidence  │ HOLD — one more cheap test before    │
│                           │ committing                           │
│ No evidence               │ DECAY — deprioritize, scout elsewhere│
│ Contradicting evidence    │ INHIBIT — mark as dead end           │
│ Ambiguous result          │ REFINE — hypothesis was too vague,   │
│                           │ sharpen and re-scout                 │
└───────────────────────────┴──────────────────────────────────────┘
```

得：依證（非偏）之跡明排。最強跡得最注，然至少一替存活。

敗：諸偵空返→假誤，非法誤。重框問：「何設或誤？」自異角生新假。諸偵強返→題或散（多有效答）——換 `build-coherence` 擇法。

### 四：邊際值論——知何時離

監現法之產。每力所得新信降於諸法平→切時至。

```
Marginal Value Assessment:
┌────────────────────────┬──────────────────────────────────────────┐
│ Signal                 │ Action                                   │
├────────────────────────┼──────────────────────────────────────────┤
│ New information per    │ CONTINUE — this trail is productive      │
│ action is high         │                                          │
├────────────────────────┼──────────────────────────────────────────┤
│ New information per    │ PREPARE TO SWITCH — squeeze remaining    │
│ action is declining    │ value, begin scouting alternatives       │
├────────────────────────┼──────────────────────────────────────────┤
│ Last 2-3 actions       │ SWITCH — the trail is depleted. The cost │
│ yielded nothing new    │ of staying exceeds the cost of switching │
├────────────────────────┼──────────────────────────────────────────┤
│ Information contradicts│ SWITCH IMMEDIATELY — not just depleted   │
│ earlier findings       │ but misleading. Cut losses               │
└────────────────────────┴──────────────────────────────────────────┘
```

要：計切費。換新假意載新境，有費。勿為微得切——跡明竭時切。

得：依產估（非習或怒）之續或切之故決。切以證為基，非衝動。

敗：切過頻（假間震）→切費估過低。現跡 N 動後再估前委。切永不發（縱產降仍困一跡）→設硬頂：N 無產動後切，不計沉費。

### 五：依果適策

依採果擇適次階。

1. **諸偵空，一跡弱**→題或誤框。退而重框：何問應問？
2. **一強跡，他空**→聚題。全注用強跡
3. **多競跡**→散題。施 `build-coherence` 擇
4. **明勝現**→自探轉用。減偵預至 10-20%（留一偵於替），主力委勝法
5. **諸跡竭**→解或不於現尋空。擴：異工、異設、問用者

得：自採果邏行之次階策決。決宜覺結，非猜。

敗：無策覺對→採已示真不確——此亦有效果。告用者：「我探 N 法得 X。最許為 Y 因 Z。追之或有他境？」

## 驗

- [ ] 偵前解境已表
- [ ] 至少 3 獨立假已生並試
- [ ] 偵試廉（各一動）且獨
- [ ] 跡強依證非偏
- [ ] 深查前估邊際值
- [ ] 策依果適，非循固計

## 忌

- **早用**：深入首有許假而未偵替。此最常敗——首良念常非最佳念
- **永偵**：無盡生假而不委。設預：N 偵後委最佳跡不論
- **非獨假**：「或於文 A」與「或於文 B（被 A 引）」非獨——共設。強法之真多樣
- **忽抑信**：證悖假→棄之。因已費而續投悖跡乃採之沉費謬
- **偵無錄**：偵果無錄→後偵復前工。各偵記所得後進次

## 參

- `forage-resources` — 此技適單 agent 解尋之多 agent 採模
- `build-coherence` — 採現多有效法須估時用
- `coordinate-reasoning` — 管偵假與用階間之信流
- `awareness` — 採時監早收與隧視
