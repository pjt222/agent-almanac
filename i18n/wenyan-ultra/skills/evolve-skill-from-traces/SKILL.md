---
name: evolve-skill-from-traces
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Evolve SKILL.md files from agent execution traces using a three-stage pipeline:
  trajectory collection from observed runs, parallel multi-agent patch proposal
  for error and success analysis, and conflict-free consolidation of overlapping
  edits via prevalence-weighting. Based on the Trace2Skill methodology.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob Agent
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: advanced
  language: multi
  tags: meta, skill-evolution, traces, multi-agent, consolidation, trace2skill
---

# 自跡演技

三階管自原 agent 執跡轉為已驗之 SKILL.md：軌集、多 agent 並行補提、無衝合。此技橋所察 agent 行與已錄行之隙，成跡為可複技。

## 用

- 執跡現舊技未捕之復模
- 所察 agent 行勝已錄行
- 自零錄專者示以造技
- 多 agent 對同技提互悖改

## 入

- **必**：`traces` — agent 執日或會話錄（建至少 10 成運）
- **必**：`target_skill` — 欲演 SKILL.md 徑，或 `"new"` 以自零抽
- **可**：`analyst_count` — 並析 agent 數（默：4）
- **可**：`held_out_ratio` — 留驗之跡比，不用於起稿（默：0.2）

## 行

### 一：集執跡

集示標行之 agent 會話日、工呼序、或對話出。濾以標成功之運。歸為標跡式：(態、作、果) 三元含時戳之序。

1. 識跡源：會話日、工呼史、或對話出
2. 以成功準濾跡（退碼 0、任務畢旗、用者確）
3. 各跡歸為結構三元列：

```
trace_entry:
  state: <context before the action>
  action: <tool call, command, or decision made>
  outcome: <result, output, or state change>
  timestamp: <ISO 8601>
```

4. 分跡：留 `held_out_ratio`（默 20%）為七步驗，餘用於 2-6 步

```bash
# Example: count available traces and compute partition
total_traces=$(ls traces/*.json | wc -l)
held_out=$(echo "$total_traces * 0.2 / 1" | bc)
drafting=$((total_traces - held_out))
echo "Drafting: $drafting traces, Held-out: $held_out traces"
```

得：已歸跡集分為起稿（80%）與留（20%）。各跡條含 state、action、outcome、timestamp。

敗：成跡 <10→續集。跡少產過擬技，新入則敗。跡無時戳→賦序號代之。

### 二：聚軌

按果模群已歸跡。識不變核（諸成軌皆在之步）對變支（跡間異之步）。不變核為技行之骨。

1. 按作類齊跡——各跡映為作標序
2. 尋跨諸跡之最長共子序以識不變核
3. 餘作類為變支，注含之跡與條件
4. 錄支頻：各變步現於成跡之百分

```
invariant_core:
  - action: "read_input_file"
    frequency: 100%
  - action: "validate_schema"
    frequency: 100%
  - action: "transform_data"
    frequency: 100%

variant_branches:
  - action: "retry_on_timeout"
    frequency: 35%
    condition: "network latency > 2s"
  - action: "fallback_to_cache"
    frequency: 15%
    condition: "API returns 503"
```

得：不變核作（諸成跡皆在）與變支（條件的，在子集）明分。各變支有頻計與觸條件。

敗：無不變核現（跡過雜）→標行或實為多獨技。按果類分跡為貫子群並各處之。

### 三：起技骨

自不變核生初 SKILL.md：含 frontmatter、When to Use（自諸跡入條件推）、Inputs（運間變之參）、Procedure（每不變作一步）。

1. 自各跡首態取入條件以填 When to Use
2. 識運間變之參（文徑、門、選）以填 Inputs
3. 每不變核作造一行步，用諸跡中最常措辭
4. 基於所察果加 Expected/On failure 之占位

```bash
# Scaffold the skeleton if creating a new skill
mkdir -p skills/<skill-name>/
```

```markdown
# Skeleton structure
## When to Use
- <derived from common entry conditions>

## Inputs
- **Required**: <parameters present in all traces>
- **Optional**: <parameters present in some traces>

## Procedure
### Step N: <invariant action label>
<most common implementation from traces>

**Expected:** <most common success outcome>
**On failure:** <placeholder -- refined in Steps 4-6>
```

得：語法有效之 SKILL.md 骨：含 frontmatter、When to Use、Inputs、Procedure（每不變核作一步）。Expected 反所察果；On failure 為占位。

敗：骨於加變支前逾 500 行→不變核過細。併同發相作為單步。標 5-10 行步。

### 四：多 agent 並行補提

生 N 析 agent（建 4-6），各據異析鏡閱全跡於稿骨。各 agent 產結構補：節、舊文、新文、理。

賦各析一鏡：

| Analyst | Lens | Focus |
|---------|------|-------|
| 1 | Correctness | Does the skeleton capture all success paths? Are any invariant steps missing? |
| 2 | Efficiency | Are there redundant steps? Can any steps be merged or parallelized? |
| 3 | Robustness | Which failure modes are unhandled? What should On failure blocks contain? |
| 4 | Edge Cases | Which variant branches should become conditional steps or pitfalls? |
| 5 (optional) | Clarity | Is each step unambiguous? Can an agent follow it mechanically? |
| 6 (optional) | Generalizability | Are there trace-specific artifacts that should be abstracted? |

各析 agent 受：
- 三步稿骨
- 全起稿跡集（非留）
- 所賦鏡與焦問

各析返結構補列：

```
patch:
  analyst: "robustness"
  section: "Procedure > Step 3"
  old_text: "**On failure:** <placeholder>"
  new_text: "**On failure:** If the API returns 503, wait 5 seconds and retry up to 3 times. If retries are exhausted, fall back to the cached response from the previous successful run."
  rationale: "Traces #4, #7, #12 show 503 errors resolved by retry. Trace #15 shows cache fallback when retries fail."
  supporting_traces: [4, 7, 12, 15]
```

得：各析返 3-10 結構補，含節引、舊/新文、理、撐跡 ID。諸補入一補集。

敗：析無補→其鏡或不適此技。可——非每鏡皆現議。析返模糊補無跡引→拒並以求具 supporting_traces 重提。

### 五：察並分衝

較四步諸補之重編。各重補對分為三類之一。

1. 以標節索補
2. 對指同節之補，較 old_text 與 new_text
3. 各重分：

| Conflict Type | Definition | Resolution |
|---------------|-----------|------------|
| Compatible | Different sections, no overlap | Merge directly |
| Complementary | Same section, additive (both add content, no contradiction) | Combine text |
| Contradictory | Same section, mutually exclusive (one adds X, other removes X or adds Y instead) | Needs resolution in Step 6 |

```
conflict_report:
  total_patches: 24
  compatible: 18
  complementary: 4
  contradictory: 2
  contradictions:
    - section: "Procedure > Step 5"
      patch_a: {analyst: "efficiency", action: "remove step"}
      patch_b: {analyst: "robustness", action: "add retry logic"}
      supporting_traces_a: [2, 8, 11]
      supporting_traces_b: [4, 7, 12, 15]
```

得：衝報列諸補對、其分、於悖則各方撐跡計。

敗：分歧（同節中一補既加又改文）→分為二：一加、一改。重分小補。

### 六：合補

合諸補為一 SKILL.md，用三層解法。

1. **Compatible 補**：直施——觸異節無衝
2. **Complementary 補**：合兩補 new_text 為一貫塊，保兩貢
3. **Contradictory 補**：以盛行權解：
   - 計各變所撐跡
   - 偏合多跡之補
   - 若等（或差 10% 內），用 `argumentation` 技估何補更合技之述旨
   - 被拒替錄為 Common Pitfall 或相 On failure 注

```
consolidation_log:
  applied_directly: 18
  combined: 4
  resolved_by_prevalence: 1
  resolved_by_argumentation: 1
  rejected_alternatives_documented: 2
```

合後驗果 SKILL.md：
- 諸節在（When to Use、Inputs、Procedure、Validation、Common Pitfalls、Related Skills）
- 各行步有 Expected 與 On failure
- 無重或悖指
- 行計於 500 內

得：合補後之單 SKILL.md，含諸析之補。悖以錄理解。各悖之被拒替為忌或注。

敗：合產內不一致文（如三步設文存而二步被效補去）→復衝編並保該節原骨。旗不一以人閱。

### 七：驗並登

默行合技於留跡（一步留 20%）。驗 Expected/On failure 匹技未見跡之實果。

1. 各留跡步步循技行
2. 各步較技之 Expected 與跡之實果
3. 錄匹與不匹：

```
validation_results:
  held_out_traces: 5
  full_match: 4
  partial_match: 1
  no_match: 0
  mismatches:
    - trace_id: 23
      step: 4
      expected: "API returns 200"
      actual: "API returns 429 (rate limited)"
      action: "Add rate-limit handling to On failure block"
```

4. 不匹率逾 20%→返四步，不匹跡入起稿集
5. 若技新→循 `create-skill` 造目錄、登條、符鏈
6. 若演舊→循 `evolve-skill` 升版與譯同步

```bash
# Final validation: line count
lines=$(wc -l < skills/<skill-name>/SKILL.md)
[ "$lines" -le 500 ] && echo "OK ($lines lines)" || echo "FAIL: $lines lines > 500"
```

得：至少 80% 留跡端至端匹技行。技已以正元於 `skills/_registry.yml` 登。

敗：驗敗（不匹 >20%）→技過擬起稿跡。不匹跡入起稿集並自二步重行。兩迭後仍敗→行或過變為單技，考按果類分為多技。

## 驗

- [ ] 起稿前集至少 10 成跡
- [ ] 跡分為起稿（80%）與留（20%）
- [ ] 不變核與變支明錄
- [ ] 至少 4 析 agent 自異鏡閱骨
- [ ] 諸補衝已分（compatible、complementary、contradictory）
- [ ] 悖補以錄理解
- [ ] 合 SKILL.md 含諸必節並有 Expected/On failure 對
- [ ] 留驗達至少 80% 匹率
- [ ] 行計於 500 內
- [ ] 技已登（新）或升版（舊）循標行

## 忌

- **跡太少**：成運 <10→模抽不可靠。不變核或含偶步，變支頻無據。始前續集
- **過擬跡遺物**：工特行（如某 API 客之重試模）或不通。三步中將工特作抽為工通述。技述**何**為，非**何工**用
- **忽敗跡**：敗跡示技宜於 On failure 警何。一步中亦集敗運並標之。於四步供韌析估未處敗模時用
- **單鏡析**：僅 1-2 析漏重角。僅效析將剝韌析所保之安察。用至少 4 異鏡為平覆
- **無解而合悖補**：施悖兩側產內不一技（如一步「為 X」他步「略 X」）。六步中必明分並解悖
- **不於留跡驗**：無留驗則合技或全合起稿跡而於新運敗。必留 20% 並試末技

## 參

- `evolve-skill` — 簡之人導演（補：跡無時用）
- `create-skill` — 抽之新技尚未存；七步登用
- `review-skill-format` — 合後驗以確合 agentskills.io
- `argumentation` — 六步中盛行等時解悖補
- `verify-agent-output` — 補提之證鏈；驗四步析出
