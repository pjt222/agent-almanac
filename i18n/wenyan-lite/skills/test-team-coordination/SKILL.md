---
name: test-team-coordination
locale: wenyan-lite
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

# 測試團隊協調

對目標團隊執行 `tests/scenarios/teams/` 之測試情境。觀察協調模式行為、評估接受準則、評分準則表，並於 `tests/results/` 產出 `RESULT.md`。

## 適用時機

- 驗證團隊協調模式產生預期行為
- 修改團隊定義或代理後執結構化測試
- 以同情境跑不同團隊以比較協調模式
- 為團隊組成建立基線效能指標
- 加新代理或變團隊成員後做回歸測試

## 輸入

- **必要**：測試情境檔之路徑（如 `tests/scenarios/teams/test-opaque-team-cartographers-audit.md`）
- **選擇性**：執行 ID 覆寫（預設：`YYYY-MM-DD-<target>-NNN` 自動產生）
- **選擇性**：團隊大小覆寫（預設：自情境前置設定）
- **選擇性**：跳過範圍變化（預設：false——若已定義則注入範圍變化）

## 步驟

### 步驟一：載入並驗證測試情境

1.1. 讀輸入指定之測試情境檔。

1.2. 解析 YAML 前置設定並萃：
   - `target` — 待測之團隊
   - `coordination-pattern` — 預期模式
   - `team-size` — 待生成之成員數
   - 接受準則表
   - 評分準則表（如有）
   - 真實值資料（如有）

1.3. 驗情境檔含所有必要節：
   - Objective
   - Pre-conditions
   - Task（含 Primary Task 子節）
   - Expected Behaviors
   - Acceptance Criteria
   - Observation Protocol

**預期：** 情境檔載入、解析且含所有必要節。

**失敗時：** 若檔缺或不可解析，以辨缺檔或畸形節之錯訊息中止。若選擇性節（Rubric、Ground Truth、Variants）缺，註其缺並續。

### 步驟二：驗證先決條件

2.1. 走過情境之每先決條件勾選。

2.2. 對檔存在檢查，用 Glob 驗。

2.3. 對註冊表計數檢查，解析相關 `_registry.yml` 並比對 `total_*` 與磁碟上實際檔數。

2.4. 對分支／git 狀態檢查，跑 `git status --porcelain` 與 `git branch --show-current`。

**預期：** 所有先決條件已滿足。

**失敗時：** 若任一先決條件失敗，於結果中記為 BLOCKED。決定是否續（軟先決）或中止（硬先決如缺目標團隊檔）。記錄該決定。

### 步驟三：載入協調模式準則

3.1. 讀 `tests/_registry.yml` 並定位匹配情境之 `coordination-pattern` 值之 `coordination_patterns` 條目。

3.2. 萃此模式之 `key_behaviors` 列表。

3.3. 此等行為成觀察清單——執行期間每項皆須觀察並記為已觀察／未觀察。

**預期：** 模式關鍵行為已載且備觀察。

**失敗時：** 若協調模式未於註冊表中定義，用情境之 Expected Behaviors 節為唯一觀察源。記警告。

### 步驟四：執行任務

4.1. 建結果目錄：`tests/results/YYYY-MM-DD-<target>-NNN/`。

4.2. 記 T0（任務開始時戳）。

4.3. 自 `teams/<target>.md` 讀目標團隊定義，萃 CONFIG 區塊，並啟動團隊：以團隊名叫 `TeamCreate`、用每成員之 `subagent_type` 生成隊友、自 CONFIG `tasks` 列表建任務。用情境之 team-size。逐字傳情境 Task 節之 Primary Task 提示。

4.4. 觀察團隊執行階段。記時戳：
   - T1：型態評估／任務分解完成
   - T2：角色分配可見

4.5. 若情境定義 Scope Change Trigger 且 skip-scope-change 為 false：
   - 待 Phase 2（角色分配）可見
   - 記 T3（範圍變化注入時戳）
   - 透過 SendMessage 傳範圍變化提示予團隊
   - 記 T4（範圍變化已吸收——角色調整可見）

4.6. 續觀察直至團隊遞輸出。
   - 記 T5（整合始）
   - 記 T6（最終報告遞）

4.7. 捕團隊之完整輸出。

**預期：** 團隊經其協調模式階段執任務。所有轉換皆記時戳。範圍變化（如適用）已注入並吸收。

**失敗時：** 若團隊未產輸出，記失敗點及任何錯訊息。若團隊停滯，註最後觀察階段與逾時。以部分結果進評估。

### 步驟五：評估模式行為

5.1. 對步驟三之每關鍵行為，定其於執行期間是否被觀察：
   - **Observed**：團隊輸出或協調中之清晰證據
   - **Partial**：某證據但不完整或含混
   - **Not observed**：無證據

5.2. 對情境之 Expected Behaviors 節之每任務專屬行為，套同評估。

5.3. 將發現記入觀察日誌。

**預期：** 所有或多數模式專屬與任務專屬行為被觀察。

**失敗時：** 未觀察之行為為發現，非測試程序之失敗。準確記之——其示協調模式未完全顯現。

### 步驟六：評估接受準則

6.1. 走過情境之每接受準則。

6.2. 對每準則，賦定：
   - **PASS**：準則明確達成且具可觀察證據
   - **PARTIAL**：準則部分達成（以 0.5 權重計入閾值）
   - **FAIL**：雖有機會準則未達
   - **BLOCKED**：無法評估（先決失敗、團隊逾時等）

6.3. 若情境含 Ground Truth 資料，對之驗報告之發現：
   - 計算每類別之準確率
   - 標出偽陽與偽陰

6.4. 若情境含評分準則表，每維度 1-5 評分附簡述。

6.5. 計算摘要指標：
   - Acceptance：X/N 準則通過（PARTIAL 計 0.5）
   - Threshold：若 >= 情境定義之閾值則 PASS
   - Rubric total：X/Y 點（如適用）

**預期：** 所有接受準則皆有定。摘要指標已計算。

**失敗時：** 若可評估之準則少於半（過多 BLOCKED），測試執行不確。記其因並建議修先決後重執。

### 步驟七：產生 RESULT.md

7.1. 用情境 Observation Protocol 之記錄模板，建 `tests/results/YYYY-MM-DD-<target>-NNN/RESULT.md`。

7.2. 填所有節：
   - 執行後設資料（觀察者、時戳、時長）
   - 含所有所記時戳之階段日誌
   - 角色湧現日誌（對適應／團隊測試）
   - 接受準則結果表
   - 評分準則表（如適用）
   - 真實值驗證表（如適用）
   - 關鍵觀察（敘事）
   - 學習教訓

7.3. 將團隊原始輸出含為附錄或於同結果目錄之分離檔（`team-output.md`）。

7.4. 於頂加摘要結論：
   ```
   **Verdict**: PASS | FAIL | INCONCLUSIVE
   **Score**: X/N criteria (Y/Z rubric points)
   **Duration**: Xm
   ```

**預期：** 完整 RESULT.md 含所有節已填且結論清晰。

**失敗時：** 若結果檔無法寫，將結果輸出至 stdout 為退路。評估資料絕不應失。

## 驗證

- [ ] 測試情境檔已載且所有必要節在
- [ ] 先決條件已驗（或記為 BLOCKED）
- [ ] 協調模式關鍵行為已自註冊表載
- [ ] 團隊已生成且任務已遞
- [ ] 範圍變化於正確時機注入（如適用）
- [ ] 所有模式專屬行為已評估（已觀察／部分／未觀察）
- [ ] 所有接受準則皆有定（PASS/PARTIAL/FAIL/BLOCKED）
- [ ] 真實值驗證已完成（如適用）
- [ ] RESULT.md 已產且所有節已填
- [ ] 摘要結論已計算且記錄

## 常見陷阱

- **評估輸出品質而非協調**：此技能測*團隊如何協調*，非任務輸出是否完美。協調良好但僅找 7/9 損壞參考之團隊仍展現該模式。
- **過早注入範圍變化**：待角色分配清晰可見再注入範圍變化。過早則團隊尚未分化，故無物可調。
- **將團隊成員輸出與團隊輸出混**：不透明團隊應呈統一輸出。若見個別成員報告，此乃關於不透明性之發現，非測試基礎建設問題。
- **真實值精確匹配**：真實值計數為近似。評估發現是否在合理範圍內，非是否精確匹配。
- **遺忘記時戳**：時戳對量階段時長與適應速度至關。事件發生時即設之，非追溯設。

## 相關技能

- `review-codebase` — 深層代碼庫審查，補團隊層測試
- `review-skill-format` — 驗個別技能格式（此技能驗團隊協調）
- `create-team` — 建此技能所測之團隊定義
- `evolve-team` — 依測試發現演化團隊定義
- `test-a2a-interop` — A2A 協定符合性之相似測試模式
- `assess-form` — 不透明團隊領導內部所用之形態評估
