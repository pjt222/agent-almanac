---
name: forage-solutions
locale: wenyan
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

以蟻群最佳則探解域——遣獨立假為偵、以證強有望徑、察漸返、知何時棄策而他探。

## 用時

- 面多合理法而無明勝之問
- 初法不行而替不明
- 無明根因之調——多假需並查
- 搜碼庫尋某行之源而位未知
- 前解試先斂於次佳法
- 補 `build-coherence` 以於決前探解域

## 入

- **必要**：問述或目（採為何？）
- **必要**：當知態（已知何？）
- **可選**：前試之法及其果
- **可選**：探之限（時預、具可得）
- **可選**：急級（影探利衡）

## 法

### 第一步：映解景

遣偵前，特解域之形。

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

類當問。分類定遣幾偵、速自探至利之換。

**得：** 明特之解景告偵策。類宜合問，非強。

**敗則：** 若景全未知，此本身即為類——視為或分式而遣廣偵。首偵輪示景特。

### 第二步：遣偵假

生獨立假為偵。各偵於解域異向探。

1. 生 3-5 獨立問或解之假
2. 各假定一廉試——一文讀、一 grep、一具體察
3. 依可證評初望（非直覺）
4. 獨遣偵：勿令假 A 之評影假 B 之試

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

要則：偵評，不利。目為各假速信，非首見有望者深究。

**得：** 3-5 獨立假附廉試之定。無假已深探——此乃廣先過。

**敗則：** 若少於三假可生，問或甚拘（聚式——佳，力偵）或解過淺（多讀脈絡再假）。若諸假不獨（皆一念變），探過窄——強生至少一與他相悖之假。

### 第三步：痕強——循證

偵果返後，強有望徑而令弱者衰。

1. 審偵果：何假得援證？
2. **強援證** → 強痕：於此投更多查力
3. **無證** → 令痕衰：無新信勿再查
4. **反證** → 標抑信：避此徑
5. 監先收斂：若諸力流首強痕，強一偵入未探域

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

**得：** 基證（非偏）之明痕排。最強痕得最多注，至少一替留活。

**敗則：** 若諸偵皆空，假誤——非法誤。重架：「我假何可誤？」自異角生新假。若諸偵皆強信，問或分式（多有效答）——轉 `build-coherence` 擇法。

### 第四步：邊際值定理——知何時離

監當法產。每工之新信落於諸法平均下時，宜換。

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

要：計換費。易至新假意載新脈，有費。勿為邊際利換——當痕明竭方換。

**得：** 基產評（非慣或挫）之續或換決。換基證，非衝。

**敗則：** 若換過頻（假間振），換費被低估。於當痕委 N 工再評。若永不換（雖產降猶困一痕），設硬頂：N 無產工後換，不計沉沒費。

### 第五步：適策於果

依採果擇宜次期。

1. **諸偵空，一痕弱** → 問或誤架。退一步重架：當問何？
2. **一強痕，他空** → 聚式。全注利強痕
3. **多競痕** → 分式。施 `build-coherence` 擇之
4. **明勝現** → 自探轉利。減偵預至 10-20%（留一偵活供替），主力委勝法
5. **諸痕皆竭** → 解或不於當搜域。擴：異具、異假、問用戶

**得：** 自採果邏輯生之次期策決。決宜感為結，非猜。

**敗則：** 若無策感宜，採示真不定——此有效結。通不定於用戶：「我探 N 法得 X。最有望者為 Y，因 Z。追之乎？或汝有更多脈絡？」

## 驗

- [ ] 偵前已特解景
- [ ] 至少三獨立假已生並試
- [ ] 偵試廉（各一工）且獨
- [ ] 痕強基證非偏
- [ ] 深查前已評邊際值
- [ ] 策適果而非循固計

## 陷

- **先利**：略偵替而深入首見有望之假。此最常敗——首善念常非最善
- **永偵**：無窮生假而永不委。設預：N 偵後委最佳痕，不論
- **非獨假**：「或於文 A」與「或於文 B（自 A 引）」非獨——共假。強法真多
- **略抑信**：證反假時釋之。因已投而續投被反之痕，乃採之沉沒費謬
- **偵不記**：若偵果不記，後偵重早工。各偵簡記所得再進

## 參

- `forage-resources` — 此技所適之多員採食模於單員解搜
- `build-coherence` — 採示多有效法須評時用
- `coordinate-reasoning` — 管偵假與利期間之信流
- `awareness` — 採中監先斂與隧視
