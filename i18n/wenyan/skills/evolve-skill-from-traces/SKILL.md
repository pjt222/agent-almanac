---
name: evolve-skill-from-traces
locale: wenyan
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

以三階流轉員執跡為驗 SKILL.md：軌集、並行多員補議、無衝合。此技接已觀員行與已記術，化成功之運為可復之技。

## 用時

- 執跡示現技未捕之復模
- 員行勝於已記術
- 以錄專家示自零造技
- 多員於同技議衝改

## 入

- **必要**：`traces` —— 員執日或會話錄（薦至少十成功運）
- **必要**：`target_skill` —— 欲演 SKILL.md 之路，或 `"new"` 自零提技
- **可選**：`analyst_count` —— 並行析員數（默 4）
- **可選**：`held_out_ratio` —— 留以驗不用於草之跡比（默 0.2）

## 法

### 第一步：集執跡

集示目行之員會話日、工具呼序、或對話錄。篩標成功之運。正為標跡式：(state, action, outcome) 三元之序附時戳。

1. 識跡源：會話日、工呼史、或對話出
2. 按成功準篩跡（出碼 0、任畢旗、用確）
3. 正各跡為結三元列：

```
trace_entry:
  state: <context before the action>
  action: <tool call, command, or decision made>
  outcome: <result, output, or state change>
  timestamp: <ISO 8601>
```

4. 分跡：留 `held_out_ratio`（默 20%）供第七步驗，餘供 2-6 步

```bash
# Example: count available traces and compute partition
total_traces=$(ls traces/*.json | wc -l)
held_out=$(echo "$total_traces * 0.2 / 1" | bc)
drafting=$((total_traces - held_out))
echo "Drafting: $drafting traces, Held-out: $held_out traces"
```

**得：** 正後跡集分為草（80%）與留（20%）。各條含 state、action、outcome、timestamp 域。

**敗則：** 若成功跡不足十，先集更多。小集生過擬之技，新入則敗。若跡缺時戳，賦序號代之。

### 第二步：聚軌

按結模聚正跡。識不變核（諸成功軌皆有之步）對變枝（諸運中異之步）。不變核為技術之骨。

1. 按行類對跡——各跡映為行籤序
2. 求諸跡之最長公共子序以識不變核
3. 餘行類為變枝，記何跡含之、於何條件
4. 記枝頻：多少成功跡含各變步

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

**得：** 不變核行（諸跡皆有）與變枝（有條件，於子集）之明分。各變枝附頻計與觸條件。

**敗則：** 若無不變核現（跡過雜），目行或實為多異技。按結類分跡為一致子，各處之。

### 第三步：草技骨

自不變核生初 SKILL.md：frontmatter、When to Use（自諸跡入條件導）、Inputs（諸運中異之參）、Procedure（各不變行一步）。

1. 自各跡首態取入條件填 When to Use
2. 識諸運中異之參（路、閾、選）填 Inputs
3. 各不變核行造一步，用諸跡最常措辭
4. 按已觀結加 Expected/On failure 占位

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

**得：** 語法有效之 SKILL.md 骨含 frontmatter、When to Use、Inputs、Procedure 各不變核行一步。Expected 映已觀結；On failure 為占位。

**敗則：** 若骨加變枝前已逾 500 行，不變核過細。合常共現之鄰行為單步。目標 5-10 步。

### 第四步：並行多員補議

生 N 析員（薦 4-6），各以異析鏡審全跡集對草骨。各員生結補：節、舊文、新文、理。

各員一鏡：

| Analyst | Lens | Focus |
|---------|------|-------|
| 1 | Correctness | Does the skeleton capture all success paths? Are any invariant steps missing? |
| 2 | Efficiency | Are there redundant steps? Can any steps be merged or parallelized? |
| 3 | Robustness | Which failure modes are unhandled? What should On failure blocks contain? |
| 4 | Edge Cases | Which variant branches should become conditional steps or pitfalls? |
| 5 (optional) | Clarity | Is each step unambiguous? Can an agent follow it mechanically? |
| 6 (optional) | Generalizability | Are there trace-specific artifacts that should be abstracted? |

各析員受：
- 第三步之草骨
- 全草跡集（非留）
- 所賦鏡與焦問

各員返結補之列：

```
patch:
  analyst: "robustness"
  section: "Procedure > Step 3"
  old_text: "**On failure:** <placeholder>"
  new_text: "**On failure:** If the API returns 503, wait 5 seconds and retry up to 3 times. If retries are exhausted, fall back to the cached response from the previous successful run."
  rationale: "Traces #4, #7, #12 show 503 errors resolved by retry. Trace #15 shows cache fallback when retries fail."
  supporting_traces: [4, 7, 12, 15]
```

**得：** 各員返 3-10 結補附節引、舊新文、理、援跡 ID。諸補集為一補集。

**敗則：** 若員返無補，其鏡或不適此技。可——非各鏡皆浮問。若員返模糊補無跡引，拒並求具體 supporting_traces 再生。

### 第五步：察並類衝

較四步諸補之重編。各重對類為三。

1. 按目節索補
2. 於同節之補，較 old_text 與 new_text
3. 各重類：

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

**得：** 衝報列諸補對、類、及於矛盾各方之援跡計。

**敗則：** 若類模糊（補同節加又改），分為二：一加、一改。類小補。

### 第六步：合補

以三層解策合諸補為單 SKILL.md。

1. **相容補**：直施——異節不衝
2. **互補補**：合二補之 new_text 為連貫塊，保二貢
3. **矛盾補**：以頻權解：
   - 計諸變各有幾跡援
   - 偏跡更多之補
   - 若等（或相差 10% 內），以 `argumentation` 技評何補更事技之目
   - 記被拒替為 Common Pitfall 或於相 On failure 塊之注

```
consolidation_log:
  applied_directly: 18
  combined: 4
  resolved_by_prevalence: 1
  resolved_by_argumentation: 1
  rejected_alternatives_documented: 2
```

合後驗 SKILL.md：
- 諸節存（When to Use、Inputs、Procedure、Validation、Common Pitfalls、Related Skills）
- 諸步皆 Expected 與 On failure
- 無重複或矛盾指
- 行數於 500 限內

**得：** 單合 SKILL.md 含諸員補。矛盾以記理解。各矛盾之被拒替現為陷或注。

**敗則：** 若合生內不一之文（如第三步假文存而第二步被效率補去），復原衝編，該節留原骨文。標不一供手審。

### 第七步：驗並登

心中以留跡（一步留 20%）運合技。驗 Expected/On failure 合未見跡中已觀結。

1. 於各留跡，逐步循技
2. 於各步，較技之 Expected 與跡之實
3. 記合與不合：

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

4. 若不合率逾 20%，返第四步，將不合跡入草集
5. 若技為新，循 `create-skill` 造目、登條、造 symlink
6. 若演既有技，循 `evolve-skill` 升版並同譯

```bash
# Final validation: line count
lines=$(wc -l < skills/<skill-name>/SKILL.md)
[ "$lines" -le 500 ] && echo "OK ($lines lines)" || echo "FAIL: $lines lines > 500"
```

**得：** 至少 80% 留跡合技首尾。技於 `skills/_registry.yml` 登附正元數。

**敗則：** 若驗敗（>20% 不合），技過擬草跡。加不合跡入草集重運自第二步。若二迭仍敗，行或過變為單技——按結類分為多技。

## 驗

- [ ] 草前至少集十成功跡
- [ ] 跡分為草（80%）與留（20%）
- [ ] 不變核與變枝明記
- [ ] 至少四析員以異鏡審骨
- [ ] 諸補衝已類（相容、互補、矛盾）
- [ ] 矛盾補以記理解
- [ ] 合 SKILL.md 有諸必節附 Expected/On failure
- [ ] 留驗合率至少 80%
- [ ] 行數於 500 限內
- [ ] 技已登（新）或已升版（舊），循標程

## 陷

- **跡過少**：少於十成功運則模提不可靠。不變核或含偶步，變枝亦無足頻數。先集更多再始
- **過擬跡藝**：工具特行（如某 API 客戶之重試模）或不通。第三步中抽工具行為工具無涉述。技當述*何*為，非述*何具*
- **略敗跡**：敗跡示技宜於 On failure 所警。第一步亦集敗運並標。四步用於健性員評未處之敗模
- **單鏡析**：唯 1-2 析員失要觀。效率員獨則剝健員將保之安檢。至少用四異鏡以均覆
- **合矛盾補而不解**：施二方致內不一之技（如某步「行 X」而另步「略 X」）。六步必類並明解
- **不對留驗**：無留驗，合技或完合草跡而於新運敗。必留 20% 跡並於之測末技

## 參

- `evolve-skill` —— 簡之人導演（互補：跡不得時用）
- `create-skill` —— 為新提尚未存之技；七步登中用
- `review-skill-format` —— 合後驗以確 agentskills.io 合規
- `argumentation` —— 六步中解頻等之矛盾補
- `verify-agent-output` —— 補議之證鏈；四步中驗員出
