---
name: evolve-skill-from-traces
locale: wenyan-lite
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

# 自執行軌跡演化技能

透過三階段管線將原始代理執行軌跡轉為已驗之 SKILL.md：軌跡採集、並行多代理之 patch 提議、無衝突之合併。此技架接所觀察之代理行為與所文檔之程，化成功執行為可復現之技能。

## 適用時機

- 執行軌跡示現有技能未捕之再現模式
- 所觀察之代理行為優於所文檔之程
- 藉記專家示範自頭建技能
- 多代理對同技能提相衝之改善

## 輸入

- **必要**：`traces` — 代理執行日誌或會話抄本之集（建議至少 10 次成功運行）
- **必要**：`target_skill` — 待演既有 SKILL.md 之路徑，或 `"new"` 以自頭抽技能
- **選擇性**：`analyst_count` — 並行分析者代理之數（預設：4）
- **選擇性**：`held_out_ratio` — 保留供驗證、不用於起草之軌跡比（預設：0.2）

## 步驟

### 步驟一：採執行軌跡

集代理會話日誌、工具呼叫序列或演示目標行為之對話抄本。濾標為成功之運行。歸一為標準軌跡格式：帶時戳之 (state、action、outcome) 三元組之序列。

1. 識軌跡源：會話日誌、工具呼叫歷史或對話導出
2. 以成功標準濾軌跡（退出碼 0、任務完成旗、使用者確認）
3. 歸一各軌跡為結構化三元組清單：

```
trace_entry:
  state: <context before the action>
  action: <tool call, command, or decision made>
  outcome: <result, output, or state change>
  timestamp: <ISO 8601>
```

4. 分軌跡：保 `held_out_ratio`（預設 20%）以供步驟七之驗證，餘供步驟二至六

```bash
# Example: count available traces and compute partition
total_traces=$(ls traces/*.json | wc -l)
held_out=$(echo "$total_traces * 0.2 / 1" | bc)
drafting=$((total_traces - held_out))
echo "Drafting: $drafting traces, Held-out: $held_out traces"
```

**預期：** 歸一之軌跡集分為起草（80%）與保留（20%）子集。每軌跡項含 state、action、outcome、timestamp 欄。

**失敗時：** 若可得之成功軌跡少於 10，採更多前勿進。小軌跡集生過擬之技能，於新輸入上敗。若軌跡缺時戳，改以序數賦之。

### 步驟二：群軌跡

以結果模式群歸一之軌跡。識不變之核（所有成功軌跡皆有之步）與變之分支（跨運行異之步）。不變之核成技能程之骨架。

1. 以動作類型對軌跡——將各軌跡映為動作標之序列
2. 尋所有軌跡之最長共同子序列以識不變之核
3. 餘動作分為變之分支，記何軌跡含之及於何條件下
4. 記分支頻：各變之步見於幾何百分之成功軌跡

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

**預期：** 不變核動作（所有成功軌跡皆有）與變之分支（條件性，見於子集）之明分。每變之分支有頻計與觸發條件。

**失敗時：** 若無不變之核現（軌跡過異），則目標行為或實為多獨立技能。以結果類型分軌跡為連貫子組並分別處之。

### 步驟三：起草技能骨架

自不變核生初 SKILL.md，含 frontmatter、When to Use（由跨軌跡入口條件導之）、Inputs（跨運行變之參數）、以一不變動作一步之 Procedure 節。

1. 自各軌跡首態抽入口條件以填 When to Use
2. 識跨運行變之參數（檔路徑、閾值、選項）以填 Inputs
3. 為每一不變核動作建一程步，用軌跡中最常之措詞
4. 依所觀察結果加占位 Expected/On failure 區

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

**預期：** 語法有效之 SKILL.md 骨架，含 frontmatter、When to Use、Inputs 及含一不變核動作一步之 Procedure 節。Expected 區反所觀察結果；On failure 區為占位。

**失敗時：** 若骨架於加變之分支前逾 500 行，不變之核過細。將常共現之相鄰動作合為單步。目標 5-10 程步。

### 步驟四：並行多代理 patch 提議

啟 N 分析者代理（建議 4-6），各以異之分析視角對草稿骨架審全軌跡集。各代理出結構化 patch：節、舊文、新文、理由。

予各分析者一視角：

| 分析者 | 視角 | 焦點 |
|---------|------|-------|
| 1 | Correctness（正確） | 骨架是否捕所有成功路？是否缺不變步？ |
| 2 | Efficiency（效率） | 是否有冗步？步是否可合或並行？ |
| 3 | Robustness（韌性） | 何敗模式未處？On failure 區當含何？ |
| 4 | Edge Cases（邊緣情） | 何變之分支當成條件步或陷阱？ |
| 5（選擇性） | Clarity（清） | 各步是否明？代理可機械循之？ |
| 6（選擇性） | Generalizability（通化） | 是否有應抽之軌跡特定產物？ |

各分析者代理收：
- 步驟三之草稿骨架
- 完整起草軌跡集（非保留）
- 所指之視角與焦點問題

各分析者返結構化 patch 清單：

```
patch:
  analyst: "robustness"
  section: "Procedure > Step 3"
  old_text: "**On failure:** <placeholder>"
  new_text: "**On failure:** If the API returns 503, wait 5 seconds and retry up to 3 times. If retries are exhausted, fall back to the cached response from the previous successful run."
  rationale: "Traces #4, #7, #12 show 503 errors resolved by retry. Trace #15 shows cache fallback when retries fail."
  supporting_traces: [4, 7, 12, 15]
```

**預期：** 各分析者返 3-10 結構化 patch 含節引、舊/新文、理由及支援軌跡 ID。所有 patch 集於一 patch 集。

**失敗時：** 若分析者無 patch 返，其視角或不適於此技能。此可接——非每視角皆顯問題。若分析者返含糊 patch 而無軌跡引，拒之並以須具體 supporting_traces 之要求再問。

### 步驟五：偵並分類衝突

比步驟四之所有 patch 之重疊編輯。將每對重疊 patch 分為三類之一。

1. 以目標節索 patch
2. 對同節 patch，比 old_text 與 new_text
3. 分類每重疊：

| 衝突類 | 定義 | 解決 |
|---------------|-----------|------------|
| Compatible（相容） | 異節，無疊 | 直合 |
| Complementary（互補） | 同節，疊加（皆加內容，無矛盾） | 合文 |
| Contradictory（相矛） | 同節，互斥（一加 X，一移 X 或改加 Y） | 於步驟六解決 |

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

**預期：** 衝突報告列所有 patch 對、其分類，且於矛盾者列各方之支援軌跡計。

**失敗時：** 若分類含糊（patch 於同節既加且改文），分為二 patch：一加，一改。再分類較小之 patch。

### 步驟六：合 patch

以三層解決策將所有 patch 合為單一 SKILL.md。

1. **相容 patch**：直施——其觸異節而不可衝
2. **互補 patch**：合二 patch 之 new_text 為單連貫塊，保二貢獻
3. **相矛 patch**：以頻次加權解決：
   - 計各變有幾多軌跡支
   - 偏向配較多軌跡之 patch
   - 若平（或互差 10% 內），用 `argumentation` 技評何 patch 更服於技能所述之目的
   - 將遭拒之替代文檔為 Common Pitfall 或相關 On failure 區之註

```
consolidation_log:
  applied_directly: 18
  combined: 4
  resolved_by_prevalence: 1
  resolved_by_argumentation: 1
  rejected_alternatives_documented: 2
```

合後，驗所成 SKILL.md：
- 所有節俱在（When to Use、Inputs、Procedure、Validation、Common Pitfalls、Related Skills）
- 每程步有 Expected 與 On failure
- 無重複或矛盾之指令留存
- 行計於 500 行之限內

**預期：** 納所有分析者 patch 之單一合之 SKILL.md。矛盾以文檔之理由解決。每矛盾之遭拒替代顯為陷阱或註。

**失敗時：** 若合生內部不一致之文檔（如 Step 3 假檔存而 Step 2 遭效率 patch 移），回衝突之編輯並於該節保原骨架文。旗標不一致以人工審。

### 步驟七：驗與登記

心對保留軌跡（步驟一所保之 20%）行合之技能。驗 Expected/On failure 區配技能未見之軌跡中所觀察結果。

1. 對每保留軌跡，逐步行技能程
2. 於每步，比技能之 Expected 結果與軌跡之實際結果
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

4. 若不合率逾 20%，回步驟四並將不合軌跡加入起草集
5. 若技能為新，循 `create-skill` 建目錄、登記項、symlink
6. 若演既有技能，循 `evolve-skill` 升版與譯同步

```bash
# Final validation: line count
lines=$(wc -l < skills/<skill-name>/SKILL.md)
[ "$lines" -le 500 ] && echo "OK ($lines lines)" || echo "FAIL: $lines lines > 500"
```

**預期：** 至少 80% 之保留軌跡端至端合技能程。技能已於 `skills/_registry.yml` 以正確元數據登記。

**失敗時：** 若驗敗（>20% 不合），技能已過擬起草軌跡。將不合軌跡加入起草集並自步驟二再行。若二迭代後仍敗，行為或過變以至不能為單一技能——考慮以結果類型分為多技能。

## 驗證

- [ ] 起草前至少採 10 成功軌跡
- [ ] 軌跡分為起草（80%）與保留（20%）子集
- [ ] 不變核與變之分支已明文檔
- [ ] 至少 4 分析者代理自異視角審骨架
- [ ] 所有 patch 衝突已分類（相容、互補、相矛）
- [ ] 相矛 patch 以文檔之理由解決
- [ ] 合之 SKILL.md 含所有必節及 Expected/On failure 對
- [ ] 保留驗達至少 80% 合率
- [ ] 行計於 500 行之限內
- [ ] 技能已循標準程登記（新）或升版（既有）

## 常見陷阱

- **軌跡過少**：成功運行少於 10 時，模式抽不可靠。不變核或含偶然之步，且變之分支將缺頻數據。先採更多軌跡。
- **過擬於軌跡產物**：工具特定行為（如特定 API 客戶端之重試模式）或不通化。於步驟三抽工具特定動作為工具無關之述。技能當述*何*為而非*何工具*。
- **忽敗之軌跡**：敗之軌跡揭技能於 On failure 區當警何。於步驟一亦採敗之運行並標之。於步驟四當韌性分析者評未處敗模式時用之。
- **單視角分析**：僅 1-2 分析者漏重視角。效率分析者獨行將剝韌性分析者所保之安全檢。用至少 4 異視角以求平衡覆。
- **未解而合相矛 patch**：施矛盾之二方生內部不一致技能（如一步「行 X」，一步「略 X」）。恒於步驟六明分類並解決矛盾。
- **未對保留軌跡驗**：無保留驗，合之技能或完美擬起草軌跡而於新運行敗。恒保 20% 軌跡並對之測終技能。

## 相關技能

- `evolve-skill` — 較簡之人導演化（互補：軌跡不可得時用）
- `create-skill` — 為新抽尚不存之技能；於步驟七登記所用
- `review-skill-format` — 合之後之驗證以確 agentskills.io 合規
- `argumentation` — 於步驟六當頻次平時解相矛 patch 所用
- `verify-agent-output` — patch 提議之證據軌跡；於步驟四驗分析者輸出
