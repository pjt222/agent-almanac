---
name: cross-review-project
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Conduct a structured cross-project code review between two Claude Code
  instances via the cross-review-mcp broker. Each agent reads its own
  codebase, reviews the peer's code, and engages in evidence-backed
  dialogue — with QSG scaling laws enforcing review quality through
  minimum bandwidth constraints and phase-gated progression.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mcp-integration
  complexity: advanced
  language: multi
  tags: mcp, cross-review, multi-agent, code-review, qsg, a2a
---

# 跨評案

二 Claude Code 實例經 `cross-review-mcp` 中介以結構交品互評案。中介強 QSG 擴律——評束須含至少 5 見以居選擇域（Γ_h ≈ 1.67）、防淺同為同。

## 用

- 二案含架關可互學
- 欲獨碼評逾單評者
- 跨花為目：於一案尋他案缺模
- 需結構證支之含 accept/reject/discuss 裁之評

## 入

- **必**：二案路，二 Claude Code 實例可訪
- **必**：`cross-review-mcp` 中介行且於二實例設為 MCP 服
- **可**：焦域——當優先之目、模、關
- **可**：代 IDs——各實例標（默：案目名）

## 行

### 一：驗前

確中介行且二實例可達。

1. 察中介設為 MCP 服：
   ```bash
   claude mcp list | grep cross-review
   ```
2. 調 `get_status` 驗中介應且無陳代註
3. 讀協資於 `cross-review://protocol`——此為述評維與 QSG 限之 markdown

**得：** 中介應 `get_status` 含空代列。協資為 markdown 可讀。

**敗：** 中介未設→加：`claude mcp add cross-review-mcp -- npx cross-review-mcp`。前會陳代存→前 `deregister` 各。

### 二：註

註此代於中介。

1. 調 `register` 含：
   - `agentId`：短獨標（如案目名）
   - `project`：案名
   - `capabilities`：`["review", "suggest"]`
2. 以 `get_status` 驗註——代當現含階 `"registered"`
3. 待對代註：以對代 ID 與階 `"registered"` 調 `wait_for_phase`

**得：** 二代註於中介。`get_status` 顯 2 代於階 `"registered"`。

**敗：** `register` 敗「already registered」→代 ID 自前會佔。先 `deregister` 再註。

### 三：簡報階

讀己碼而送結構簡報至對。

1. 系讀：
   - 入點（主檔、index、CLI 令）
   - 依圖（package.json、DESCRIPTION、go.mod）
   - 架模（目構、模界）
   - 知問（TODO 注、開議、技債）
   - 試覆（試目、CI 設）
2. 組 `Briefing` 品——對可用以效覽己碼之結構結
3. 調 `send_task` 含：
   - `from`：己代 ID
   - `to`：對代 ID
   - `type`：`"briefing"`
   - `payload`：JSON 編簡報
4. 以階 `"briefing"` 調 `signal_phase`

**得：** 簡報送且階信。中介強評前須送簡報。

**敗：** `send_task` 拒簡報→察 `from` 欄合己註代 ID。自送拒。

### 四：評階

待對簡報、而評其碼送見。

1. 以對 ID 與階 `"briefing"` 調 `wait_for_phase`
2. 調 `poll_tasks` 取對簡報
3. 以收任 ID 調 `ack_tasks`——需（peek-then-ack 模）
4. 讀對實源、以其簡報為導
5. 生 6 類見：
   - `pattern_transfer` — 己案中模、對可採
   - `missing_practice` — 對缺之實（試、驗、誤理）
   - `inconsistency` — 對碼內悖
   - `simplification` — 可減之無需複
   - `bug_risk` — 行敗或邊例之潛
   - `documentation_gap` — 缺或誤之備
6. 各見須含：
   - `id`：獨標（如 `"F-001"`）
   - `category`：上 6 類之一
   - `targetFile`：對案之路
   - `description`：所見何
   - `evidence`：為何此為有效見（碼引、模）
   - `sourceAnalog`（宜）：己案中示此模之等物——為真跨花之唯一機
7. 束至少 **5 見**（QSG 限：m ≥ 5 保 Γ_h ≈ 1.67 於選擇域）
8. 以型 `"review_bundle"` 與 JSON 編見陣調 `send_task`
9. 以階 `"review"` 調 `signal_phase`

**得：** 評束中介受。少於 5 見拒。

**敗：** 束為見不足拒→深評。限存以防淺評主。若實不能尋 5 問→此案對未宜跨評。

### 五：對話階

受己案見而以證裁應。

1. 以對 ID 與階 `"review"` 調 `wait_for_phase`
2. 調 `poll_tasks` 取己案見
3. 以收任 ID 調 `ack_tasks`
4. 各見生 `FindingResponse`：
   - `findingId`：合見 ID
   - `verdict`：`"accept"`（有效、將施）、`"reject"`（無效、含反證）、或 `"discuss"`（需澄）
   - `evidence`：為何受或拒——須非空
   - `counterEvidence`（可）：反見之具碼引
5. 以型 `"response"` 調 `send_task` 送諸應
6. 以階 `"dialogue"` 調 `signal_phase`

注：`"discuss"` 裁非協門——視為手續跟之旗、非自動子換。

**得：** 諸見以證裁應。空應中介拒。

**敗：** 不能於見形見→默 `"discuss"` 含證釋所需額脈。

### 六：合成階

生結受見與計動之合品。

1. 以對 ID 與階 `"dialogue"` 調 `wait_for_phase`
2. 察餘任而認
3. 組 `Synthesis` 品：
   - 受見含計動（將變何、為何）
   - 拒見含因（保推理為後評）
4. 以型 `"synthesis"` 與 JSON 編合調 `send_task`
5. 以階 `"synthesis"` 調 `signal_phase`
6. 可為受見建 GitHub 議
7. 以階 `"complete"` 調 `signal_phase`
8. 調 `deregister` 清

**得：** 二代至 `"complete"`。中介需至少 2 註代以進至 complete。

**敗：** 對已 deregister→仍可地畢。自所收見組合。

## 驗

- [ ] 二代註且至 `"complete"` 階
- [ ] 評前簡報換（階強）
- [ ] 評束含各至少 5 見
- [ ] 諸見得裁（accept/reject/discuss）含證
- [ ] 諸 `poll_tasks` 後調 `ack_tasks`
- [ ] 合品成含受見映至動
- [ ] 畢後代 deregister

## 忌

- **見少於 5**：中介拒 m < 5 之束。非任意——N=2 代含 6 類、m < 5 置 Γ_h 於臨界之下、共識與噪無別。深評；實不能尋 5 見→案或不宜跨評
- **忘 `ack_tasks`**：中介用 peek-then-ack 交。任留隊直認。忘認致次察重理
- **忘 `from` 參**：`send_task` 需顯 `from` 欄合己代 ID。自送拒
- **同模epis 相關**：二 Claude 實例共訓偏。時序保評中不讀他出、但先驗相關。為真 epis 獨立→跨實例用異模族
- **略 `sourceAnalog`**：`sourceAnalog` 欄可而為真跨花之唯一機——示*己*薦模之施。存時恆填
- **視 `discuss` 為阻**：協中無欄待對話解以至 `complete`。視 `discuss` 裁為會後手跟旗
- **不評遙測**：中介誌諸事於 JSONL。會後評誌驗 QSG 設——實估 α（`α ≈ 1 - reject_rate`）察每類受率

## 參

- `scaffold-mcp-server` — 構或擴中介本
- `implement-a2a-server` — 中介取之 A2A 協模
- `review-codebase` — 單代評（此技擴為跨代結構換）
- `build-consensus` — 群共識模（QSG 為理基）
- `configure-mcp-server` — 於 Claude Code 設中介為 MCP 服
- `unleash-the-agents` — 可析中介本（已戰：40 代、10 假族）
