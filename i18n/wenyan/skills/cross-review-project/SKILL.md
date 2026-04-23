---
name: cross-review-project
locale: wenyan
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

# 交叉審項

二 Claude Code 實例以 `cross-review-mcp` 仲介，結構交換物而相審。仲執量子單純群流（QSG）之尺律——審包至少五發以守擇態（Γ_h ≈ 1.67），防淺共識偽為合。

## 用時

- 二項共構關，可互學
- 欲獨立碼審逾單審者所見
- 交叉播：尋一項有他項缺之式
- 需結構有證之審，有 accept／reject／discuss 之判

## 入

- **必要**：二 Claude Code 實例可達之二項路
- **必要**：`cross-review-mcp` 仲在行，二實例配之為 MCP 服
- **可選**：焦域——特定目錄、式、關
- **可選**：行者 ID——各實例之標（默 項目錄名）

## 法

### 第一步：驗前提

確仲在行而二實例可達之。

1. 察仲已配為 MCP 服：
   ```bash
   claude mcp list | grep cross-review
   ```
2. 呼 `get_status` 驗仲應而無陳行者註冊
3. 讀協議資於 `cross-review://protocol` — 為述審維與 QSG 限之 markdown

**得：** 仲以空行者列應 `get_status`。協議資可讀為 markdown。

**敗則：** 若仲未配，加之：`claude mcp add cross-review-mcp -- npx cross-review-mcp`。若前會話之陳行者存，先各呼 `deregister` 再進。

### 第二步：註冊

以仲註此行者。

1. 呼 `register` 含：
   - `agentId`：短唯標（如項目錄名）
   - `project`：項名
   - `capabilities`：`["review", "suggest"]`
2. 以 `get_status` 驗註——汝行者當現於 `"registered"` 階
3. 待伴註：以伴之行者 ID 與階 `"registered"` 呼 `wait_for_phase`

**得：** 二行者以仲註。`get_status` 顯二行者於 `"registered"` 階。

**敗則：** 若 `register` 敗以「已註」，行者 ID 前會話取去。先呼 `deregister`，再註。

### 第三步：簡報階

讀己之碼庫而送結構簡報至伴。

1. 系統讀：
   - 入點（主文件、index、CLI 命）
   - 依圖（package.json、DESCRIPTION、go.mod）
   - 構式（目錄構、模界）
   - 既知問（TODO 註、開議、技債）
   - 試蓋（試目錄、CI 配）
2. 構 `Briefing` 物——結構之概便伴導汝庫
3. 呼 `send_task` 含：
   - `from`：汝行者 ID
   - `to`：伴行者 ID
   - `type`：`"briefing"`
   - `payload`：JSON 編簡報
4. 以階 `"briefing"` 呼 `signal_phase`

**得：** 簡報送而階示。仲執：進審前須送簡。

**敗則：** 若 `send_task` 拒簡，察 `from` 合汝註 ID。自送被拒。

### 第四步：審階

待伴簡後，審其碼而送發。

1. 以伴 ID 與階 `"briefing"` 呼 `wait_for_phase`
2. 呼 `poll_tasks` 取伴簡
3. 以所收任 ID 呼 `ack_tasks`——為必（窺後認之式）
4. 依伴簡，讀其源碼
5. 生六類之發：
   - `pattern_transfer` — 汝項之式伴可採
   - `missing_practice` — 伴缺之法（試、驗、誤處）
   - `inconsistency` — 伴庫內矛盾
   - `simplification` — 可減之無謂繁
   - `bug_risk` — 潛運敗或邊況
   - `documentation_gap` — 缺或誤之文
6. 每發含：
   - `id`：唯標（如 `"F-001"`）
   - `category`：前六類之一
   - `targetFile`：伴項之路
   - `description`：所發
   - `evidence`：何以此為合法之發（碼引、式）
   - `sourceAnalog`（宜）：汝項之等——此為真交叉播之唯一機制
7. 捆至少 **五發**（QSG 限：m ≥ 5 守 Γ_h ≈ 1.67 於擇態）
8. 以 `"review_bundle"` 與 JSON 編之發陣呼 `send_task`
9. 以階 `"review"` 呼 `signal_phase`

**得：** 審包仲受。少於五發之包被拒。

**敗則：** 若包以發不足被拒，深審。此限存以防淺審獨霸。若實不能尋五問，疑此項對是否宜交叉審。

### 第五步：對話階

收己項之發而以證判應。

1. 以伴 ID 與階 `"review"` 呼 `wait_for_phase`
2. 呼 `poll_tasks` 取汝項之發
3. 以所收任 ID 呼 `ack_tasks`
4. 每發生 `FindingResponse`：
   - `findingId`：合發之 ID
   - `verdict`：`"accept"`（合法，將行）、`"reject"`（非法，有反證）、`"discuss"`（需清）
   - `evidence`：何以受或拒——不可空
   - `counterEvidence`（選）：反發之具體碼引
5. 以 `"response"` 送諸應於 `send_task`
6. 以階 `"dialogue"` 呼 `signal_phase`

注：`"discuss"` 判不為協議所閘——視為人隨之旗，非自動子換。

**得：** 諸發皆應有判。空應仲拒。

**敗則：** 若不能於發成見，默 `"discuss"` 含述所需補脈之證。

### 第六步：聚階

生聚物概受發與劃行。

1. 以伴 ID 與階 `"dialogue"` 呼 `wait_for_phase`
2. 取餘任而認之
3. 編 `Synthesis` 物：
   - 受發含劃行（汝將變何與何以）
   - 拒發含由（存推理以便後察）
4. 以 `"synthesis"` 與 JSON 編聚呼 `send_task`
5. 以階 `"synthesis"` 呼 `signal_phase`
6. 選為受發建 GitHub 議題
7. 以階 `"complete"` 呼 `signal_phase`
8. 呼 `deregister` 清

**得：** 二行者達 `"complete"`。仲需至少二註行者以進至完。

**敗則：** 若伴已註銷，汝仍可本地完。由所收發編汝聚。

## 驗

- [ ] 二行者註而達 `"complete"` 階
- [ ] 簡報於審前換（階執）
- [ ] 審包皆含至少五發
- [ ] 諸發得判（accept/reject/discuss）含證
- [ ] 每 `poll_tasks` 後皆呼 `ack_tasks`
- [ ] 聚生，受發映行
- [ ] 畢後行者註銷

## 陷

- **少於五發**：仲拒 m < 5 之包。非任意——N=2 行者六類，m < 5 置 Γ_h 於或下臨界界，共識與噪不可別。深審；若實無五發，項或不適交叉審。
- **忘 `ack_tasks`**：仲用窺後認交。任留隊直至認。忘認致次輪重處。
- **忘 `from` 參**：`send_task` 需明 `from` 合汝行者 ID。自送被拒。
- **同模認知相關**：二 Claude 實例共訓偏。時序確其於審時不相讀，然先驗相關。為真認知獨立，跨實例用異模族。
- **略 `sourceAnalog`**：`sourceAnalog` 選，而為真交叉播之唯一機制——示汝之推式實現。若源等存，皆填之。
- **視 `discuss` 為阻**：協議中無閘 `complete` 於待議解。視 `discuss` 判為會後人隨之旗。
- **不察遙測**：仲誌諸事於 JSONL。會後察誌以驗 QSG 設——實估 α（`α ≈ 1 - reject_rate`）察每類受率。

## 參

- `scaffold-mcp-server` — 建或擴仲本身
- `implement-a2a-server` — 仲汲之 A2A 協議式
- `review-codebase` — 單行者審（此技擴至跨行者結構換）
- `build-consensus` — 群共識式（QSG 為其理論基）
- `configure-mcp-server` — 於 Claude Code 配仲為 MCP 服
- `unleash-the-agents` — 可用以析仲本身（實戰：40 行者、10 假設族）
