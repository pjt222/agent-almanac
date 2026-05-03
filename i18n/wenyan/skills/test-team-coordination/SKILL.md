---
name: test-team-coordination
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Execute a test scenario against a team, observing coordination pattern
  behaviors, evaluating acceptance criteria, and generating a structured
  RESULT.md. Use when validating that a team's coordination pattern produces
  the expected behaviors during a realistic task, comparing coordination
  patterns on equivalent workloads, or establishing baseline performance
  for a team composition.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: review
  complexity: advanced
  language: natural
  tags: review, testing, teams, coordination, validation
---

# 試團之協

行 `tests/scenarios/teams/` 中之試境於目團。觀協模之行，評受準，計分，於 `tests/results/` 生 `RESULT.md`。

## 用時

- 驗團之協模生期之行乃用
- 改團定或代理後行構之試乃用
- 同境異團行以比協模乃用
- 立團合之基線性能乃用
- 加新代理或變團員後回試乃用

## 入

- **必要**：試境之文之路（如 `tests/scenarios/teams/test-opaque-team-cartographers-audit.md`）
- **可選**：行 ID 蓋（默：`YYYY-MM-DD-<target>-NNN` 自生）
- **可選**：團之大蓋（默：自境之 frontmatter）
- **可選**：略範變（默：否——若定則注範變）

## 法

### 第一步：載而驗試境

1.1. 讀入所定之試境文。

1.2. 析 YAML frontmatter，提：
   - `target` — 所試之團
   - `coordination-pattern` — 期之模
   - `team-size` — 所生員之數
   - 受準之表
   - 計分之鑑（若有）
   - 真之資（若有）

1.3. 驗境文有諸必之節：
   - Objective
   - Pre-conditions
   - Task（含 Primary Task 子節）
   - Expected Behaviors
   - Acceptance Criteria
   - Observation Protocol

得：境文載、析、含諸必節。

敗則：若文缺或不可析，止而陳缺文或壞節之誤辭。若可選之節（鑑、真資、變）缺，注其缺而續。

### 第二步：驗前條

2.1. 過境之各前條核。

2.2. 為文存之察，用 Glob 驗之。

2.3. 為註冊計之察，析相關 `_registry.yml` 而比 `total_*` 與盤上實計。

2.4. 為枝／git 態之察，行 `git status --porcelain` 與 `git branch --show-current`。

得：諸前條皆滿。

敗則：若前條敗，記為 BLOCKED 於果。決續（軟前條）或止（硬前條，如缺目團之文）。書其決。

### 第三步：載協模之準

3.1. 讀 `tests/_registry.yml` 而尋與境之 `coordination-pattern` 值合之 `coordination_patterns` 條。

3.2. 提此模之 `key_behaviors` 列。

3.3. 此諸行為觀之核——各於行中察而記為觀／不觀。

得：模之要行已載，備為觀。

敗則：若協模未定於註冊，用境之 Expected Behaviors 為唯一觀源。記警。

### 第四步：行任務

4.1. 立果目：`tests/results/YYYY-MM-DD-<target>-NNN/`。

4.2. 記 T0（任務始之時）。

4.3. 自 `teams/<target>.md` 讀目團之定，提 CONFIG 塊，啟團：呼 `TeamCreate` 與團名，以各員之 `subagent_type` 生員，自 CONFIG 之 `tasks` 列立任務。用境之 team-size。傳境 Task 節之 Primary Task 提詞如字。

4.4. 觀團行之諸階。記時於：
   - T1：形察／任務分解成
   - T2：角賦可見

4.5. 若境定範變之觸而 skip-scope-change 為否：
   - 候至第二階（角賦）可見
   - 記 T3（範變注之時）
   - 經 SendMessage 發範變提於團
   - 記 T4（範變吸——角調可見）

4.6. 續觀至團獻其出。
   - 記 T5（合始）
   - 記 T6（終報獻）

4.7. 捕團之全出。

得：團行任務過協模諸階。諸轉之時記。範變（若適）注而吸。

敗則：若團不出，記敗點與諸誤辭。若團停，注末觀之階與超時。以部分果至評。

### 第五步：評模行

5.1. 為第三步之各要行，定行中是否觀之：
   - **觀**：明證於團之出或協
   - **部**：有證而不全或歧
   - **不觀**：無證

5.2. 為境 Expected Behaviors 之各任務特行，施同評。

5.3. 記發現於觀日。

得：諸模特與任務特之行皆或多觀。

敗則：未觀之行為發現，非試法之敗。記其準——示協模未全現。

### 第六步：評受準

6.1. 過境之各受準。

6.2. 為各準，賦定：
   - **PASS**：準明達，有可觀之證
   - **PARTIAL**：準部達（計入閾於 0.5 權）
   - **FAIL**：有機而不達
   - **BLOCKED**：不可評（前條敗、團超時等）

6.3. 若境含真資，驗報之發現於之：
   - 算各類之準率
   - 標誤陽與誤陰

6.4. 若境含計鑑，每維計 1-5 並簡證。

6.5. 算總計：
   - 受：X/N 準過（PARTIAL 計為 0.5）
   - 閾：若 >= 境定閾則 PASS
   - 鑑總：X/Y 點（若適）

得：諸受準有定。總計已算。

敗則：若評之準少於半（過多 BLOCKED），試行不決。書其因而薦修前條後再行。

### 第七步：生 RESULT.md

7.1. 用境 Observation Protocol 之記錄模板，立 `tests/results/YYYY-MM-DD-<target>-NNN/RESULT.md`。

7.2. 填諸節：
   - 行之資（觀者、時、長）
   - 階之日，含諸記時
   - 角現之日（為適／團試）
   - 受準之果表
   - 鑑分表（若適）
   - 真資驗表（若適）
   - 要觀（敘）
   - 所學

7.3. 含團之生出為附錄或於同果目之分文（`team-output.md`）。

7.4. 於頂加總判：
   ```
   **Verdict**: PASS | FAIL | INCONCLUSIVE
   **Score**: X/N criteria (Y/Z rubric points)
   **Duration**: Xm
   ```

得：完之 RESULT.md，諸節皆填，明判已陳。

敗則：若果文不可書，出果於 stdout 為退。評之資不當失。

## 驗

- [ ] 試境文已載，諸必節已現
- [ ] 前條已驗（或書為 BLOCKED）
- [ ] 協模之要行已自註冊載
- [ ] 團已生而任務已獻
- [ ] 範變於正時注（若適）
- [ ] 諸模特行已評（觀／部／不觀）
- [ ] 諸受準有定（PASS/PARTIAL/FAIL/BLOCKED）
- [ ] 真資驗已成（若適）
- [ ] RESULT.md 已生，諸節皆填
- [ ] 總判已算而記

## 陷

- **評出之質而非協**：此技試*團如何協*，非任務之出是否完。協善而唯尋 7/9 斷引之團仍示模。
- **範變注太早**：候至角賦明可見而後注範變。太早則團未分，無可適。
- **混員出於團出**：不透之團當獻一致之出。若見個員報，乃透之發現，非試基之患。
- **真資精匹**：真之計近。評發現是否近，非是否精合。
- **忘記時**：時為量階長與適速所要。事生時設之，非追加。

## 參

- `review-codebase` — 深碼審補團層之試
- `review-skill-format` — 驗個技之格（此技驗團之協）
- `create-team` — 立此技所試之團定
- `evolve-team` — 依試發現化團定
- `test-a2a-interop` — 為 A2A 協合規之相試模
- `assess-form` — 不透之團之領內用之形察
