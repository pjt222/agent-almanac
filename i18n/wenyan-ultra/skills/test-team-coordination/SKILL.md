---
name: test-team-coordination
locale: wenyan-ultra
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

# 測隊協

行測場於目隊。察協模為、評納則、計則、生 `RESULT.md` 於 `tests/results/`。

## 用

- 驗隊協模生期為→用
- 改隊定或代後行構測→用
- 比協模、同場異隊→用
- 為隊組立基效標→用
- 加新代或變員後回歸測→用

## 入

- **必**：測場檔路（如 `tests/scenarios/teams/test-opaque-team-cartographers-audit.md`）
- **可**：行 ID 蓋（默：`YYYY-MM-DD-<target>-NNN` 自生）
- **可**：隊大蓋（默：自場前題）
- **可**：略範變（默：否——若定則注範變）

## 行

### 一：載驗測場

1.1 讀入指之測場檔。

1.2 析 YAML 前題取：
   - `target` — 待測之隊
   - `coordination-pattern` — 期模
   - `team-size` — 員生數
   - 納則表
   - 計則（若有）
   - 真值資（若有）

1.3 驗場檔諸需段：
   - 標
   - 前況
   - 任（含主任子段）
   - 期為
   - 納則
   - 察議

得：場檔載、析、含諸需段。

敗：檔失或不可析→止以誤訊識失檔或誤段。可選段（則、真值、變）缺→記缺而續。

### 二：驗前況

2.1 走場諸前況格。

2.2 檔存察用 Glob 驗。

2.3 登數察析 `_registry.yml` 比 `total_*` 於碟實檔數。

2.4 枝/git 態察行 `git status --porcelain` 與 `git branch --show-current`。

得：諸前況滿。

敗：前況敗→記為 BLOCKED 於果。決續（軟前況）或止（硬前況如失目隊檔）。文決。

### 三：載協模則

3.1 讀 `tests/_registry.yml` 覓 `coordination_patterns` 配場 `coordination-pattern` 之值。

3.2 取此模 `key_behaviors` 列。

3.3 此為察清——各於行中察、記察/不察。

得：模要為載、備察。

敗：協模未於登定→用場期為段為唯察源。記警。

### 四：行任

4.1 建果目：`tests/results/YYYY-MM-DD-<target>-NNN/`。

4.2 記 T0（任始時）。

4.3 自 `teams/<target>.md` 讀目隊定、取 CONFIG 塊、活隊：呼 `TeamCreate` 含隊名、生伴用各員之 `subagent_type`、自 CONFIG `tasks` 列建任。用場之隊大。傳場任段之主任提原文。

4.4 察隊執相。記時於：
   - T1：形察/任分畢
   - T2：角分顯

4.5 場定範變觸 而 skip-scope-change 為 false：
   - 待至相二（角分）顯
   - 記 T3（範變注時）
   - 經 SendMessage 送範變提於隊
   - 記 T4（範變吸——角調顯）

4.6 續察至隊交出。
   - 記 T5（整始）
   - 記 T6（末報交）

4.7 捕隊全出。

得：隊行任過協模相。諸轉時記。範變（若可）注吸。

敗：隊不生出→記敗點與誤訊。隊滯→記末察相與超時。以部果進評。

### 五：評模為

5.1 各步三要為定行中是否察：
   - **察**：隊出或協明證
   - **部**：某證而不全或歧
   - **不察**：無證

5.2 各場期為段任特為施同評。

5.3 記發於察日。

得：諸或多模特與任特為察。

敗：未察為發、非測程之敗。準記——示協模未全顯。

### 六：評納則

6.1 走場諸納則。

6.2 各則定：
   - **PASS**：明滿含可察證
   - **PARTIAL**：部滿（計閾以 0.5 重）
   - **FAIL**：有機而未滿
   - **BLOCKED**：不可評（前況敗、隊超時等）

6.3 場含真值資→驗報發於彼：
   - 各類算準率
   - 標誤正與誤負

6.4 場含計則→各維 1-5 計含簡證。

6.5 算總度：
   - 納：X/N 過（PARTIAL 計 0.5）
   - 閾：>= 場定閾→PASS
   - 則總：X/Y 點（若可）

得：諸納則有定。總度算。

敗：少於半則可評（BLOCKED 過多）→測行不確。文何故並薦修前況後重行。

### 七：生 RESULT.md

7.1 用場察議之記模建 `tests/results/YYYY-MM-DD-<target>-NNN/RESULT.md`。

7.2 填諸段：
   - 行元（察、時、長）
   - 相日含諸記時
   - 角生日（為適/隊測）
   - 納則果表
   - 則計表（若可）
   - 真值驗表（若可）
   - 要察（敘）
   - 教

7.3 隊原出含為附或別檔（`team-output.md`）於同果目。

7.4 加首總判：
   ```
   **Verdict**: PASS | FAIL | INCONCLUSIVE
   **Score**: X/N criteria (Y/Z rubric points)
   **Duration**: Xm
   ```

得：全 RESULT.md 含諸段填與明判。

敗：果檔不可書→出果至 stdout 為退。評資永不當失。

## 驗

- [ ] 測場檔載而諸需段在
- [ ] 前況驗（或文為 BLOCKED）
- [ ] 協模要為自登載
- [ ] 隊生而任交
- [ ] 範變注於正時（若可）
- [ ] 諸模特為評（察/部/不察）
- [ ] 諸納則有定（PASS/PARTIAL/FAIL/BLOCKED）
- [ ] 真值驗畢（若可）
- [ ] RESULT.md 生含諸段填
- [ ] 總判算記

## 忌

- **評出質非協**：此技測*隊何協*、非任出全否。協善而唯覓 7/9 斷參之隊仍顯模
- **範變注過早**：待至角分明顯乃注範變。過早→隊未分、無可適者
- **混員出於隊出**：不透隊當示合一出。見個員報→為不透之發、非測基患
- **真值精配**：真值數為近。評發於正範、非配精
- **忘記時**：時要為計相長與適速。事生時設、勿後

## 參

- `review-codebase` — 深碼覆補隊層測
- `review-skill-format` — 驗個技式（此技驗隊協）
- `create-team` — 建此技測之隊定
- `evolve-team` — 依測發演隊定
- `test-a2a-interop` — A2A 協合規類測模
- `assess-form` — 不透隊長內用之態變評
