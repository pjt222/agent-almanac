---
name: forage-solutions
locale: wenyan-lite
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

以蟻群優化原則探解空間——部獨立假設為 scout、以證強化可期之法、偵減益、知何時棄策而他處探。

## 適用時機

- 面對有多可行法而無明勝者之問題
- 所試之首法不行而替代不明時
- 無明根因之除錯——多假設需並投
- 於未知位處於代碼庫搜行為之源
- 前解試過早收於次優法
- 於決前須探解空間時輔 `build-coherence`

## 輸入

- **必要**：問題述或目標（採何為之？）
- **必要**：當前知態（已知何？）
- **選擇性**：所試之前法與其結
- **選擇性**：探之約（時預算、工具可得）
- **選擇性**：急度（影響探-用平衡）

## 步驟

### 步驟一：映解景

部 scout 前，刻解空間之形。

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

分當前問題。分布類定 scout 部之數與自探轉用之速。

**預期：** 明解景之刻，導 scout 策。分類宜覺真於問題，非強。

**失敗時：** 若景全不知，其本身即分類——視為可能分散並部廣 scout。首輪 scout 將揭景之性。

### 步驟二：部 scout 假設

生獨立假設為 scout。每 scout 於異向探解空間。

1. 於問題或其解生 3-5 獨立假設
2. 為每假設定一廉測——單檔讀、一 grep、一具體檢
3. 依可得證（非直覺）評初期望
4. 獨立部 scout：勿令假設 A 之評影響假設 B 之測

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

關鍵原則：scout 評，不用。目標為每假設之速信，非於首覺期者之深察。

**預期：** 3-5 獨立假設，含廉測。無假設已深探——此乃廣度優先。

**失敗時：** 若不能生 3 假設，問題或甚受限（集中類——佳，積極 scout）或解過淺（於假設前讀更多語境）。若假設非獨立（皆同意之變），探過窄——強行至少一與他相違之假設。

### 步驟三：跡強化——循證

Scout 結返後，強化可期之跡而令弱者衰。

1. 審 scout 結：何假設尋得支證？
2. **尋強證** → 強化跡：此處投更多察力
3. **未尋證** → 令跡衰：無新信號勿續察
4. **尋相違證** → 標為抑信號：主動避此路
5. 監過早收斂：若所有力流至首強化之跡，強行一 scout 入未探境

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

**預期：** 基於證（非偏好）之跡之明優先。最強跡得最多注意，然至少一替代保活。

**失敗時：** 若所有 scout 空回，假設誤——非法誤。重框問題：「吾所作之假設何可能為誤？」自他角生新假設。若所有 scout 強信回，問題或為分散（多有效答）——切至 `build-coherence` 以擇法。

### 步驟四：邊際值定理——知何時離

監當前法之產。當每單位力所得之新信息降於所有法之平均時，即切之時。

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

要：計切之代價。至新假設意載新語境，有代價。勿為邊際利切——於當前跡顯然耗盡時切。

**預期：** 基於產評之續或切之有意決，非習或挫。切基於證，非衝動。

**失敗時：** 若切過頻（於假設間振盪），切代價被低估。於當前跡再投 N 動後重評。若切永不發（雖產降仍困於一跡），設硬上限：N 不產動後，不論沉沒代價皆切。

### 步驟五：依結果調策

依採覓結，擇合適之次相。

1. **多 scout 空，一跡弱** → 問題或誤框。退而重框：當問何？
2. **一強跡，他空** → 集中問題。以全注用強跡
3. **多競跡** → 分散問題。施 `build-coherence` 於其間擇
4. **明勝者現** → 自探轉用。減 scout 預算至 10-20%（保一 scout 活於替代），委主力於勝法
5. **所有跡耗盡** → 解或不於當前搜空間。擴：異工、異假、問用戶

**預期：** 自採覓結邏輯而下之關次相之策略決。決宜覺似結，非猜。

**失敗時：** 若無策覺對，採覓已揭真不定——此乃有效結。傳不定予用戶：「吾探 N 法而尋 X。最可期為 Y 因 Z。吾當追之，或爾有附加語境？」

## 驗證

- [ ] Scout 始前解景已刻
- [ ] 至少 3 獨立假設已生並測
- [ ] Scout 測廉（每一動）且獨立
- [ ] 跡強化基於證，非偏好
- [ ] 邊際值於深察前已評
- [ ] 策依結調而非循固定計

## 常見陷阱

- **過早用**：深入首示任何期之假設而不 scout 替代。此最常之敗——首善念常非最佳
- **永恆 scout**：恒生假設而永不委於一。設預算：N scout 後，不論皆委於最佳跡
- **非獨立假設**：「或於檔 A」與「或於檔 B，其由 A 所 import」非獨立——其共假設。強行真之法多樣
- **忽抑信號**：證違假設時，捨之。以已投之力續投於遭違之跡乃採覓中沉沒代價之謬
- **Scout 無記**：若 scout 結不記，後 scout 將重先工。於移下前略記每 scout 所尋

## 相關技能

- `forage-resources` — 此技適之多代理採覓模型，至單代理解搜
- `build-coherence` — 採覓揭多有效法需評時所用
- `coordinate-reasoning` — 管 scout 假設與用相間之信息流
- `awareness` — 監採覓中之過早收斂與隧道視野
