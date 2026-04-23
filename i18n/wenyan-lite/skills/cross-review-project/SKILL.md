---
name: cross-review-project
locale: wenyan-lite
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

# 交叉審項目

二 Claude Code 實例藉 `cross-review-mcp` 仲介以結構化構件交換審他項目。仲介強行量子化單純形流言（QSG）縮放律——審查捆須含至少 5 發現以守選擇區（Γ_h ≈ 1.67），防淺共識過為同意。

## 適用時機

- 二項目共建築關切且可自互學
- 欲超單審者所見之獨立程式審查
- 目標為交叉授粉：於一項目中尋於另一項目中缺之模式
- 需結構化、證據背之審查，含接受/拒絕/討論裁決

## 輸入

- **必要**：二項目路，二 Claude Code 實例可達
- **必要**：`cross-review-mcp` 仲介運行，於二實例中配為 MCP 伺服器
- **選擇性**：焦點區——待優先之特定目錄、模式、關切
- **選擇性**：代理 ID——各實例之識別符（預設：項目目錄名）

## 步驟

### 步驟一：驗前置

確認仲介運行且二實例皆可達之。

1. 察仲介已配為 MCP 伺服器：
   ```bash
   claude mcp list | grep cross-review
   ```
2. 呼 `get_status` 驗仲介應答且無陳舊代理已註冊
3. 讀 `cross-review://protocol` 之協議資源——為述審查維度與 QSG 約束之 markdown 文件

**預期：** 仲介應 `get_status`，代理清單空。協議資源可讀為 markdown。

**失敗時：** 若仲介未配，加之：`claude mcp add cross-review-mcp -- npx cross-review-mcp`。若前會話有陳舊代理，進前對各 `deregister`。

### 步驟二：註冊

註冊此代理於仲介。

1. 呼 `register` 以：
   - `agentId`：短、唯一之識別符（如項目目錄名）
   - `project`：項目名
   - `capabilities`：`["review", "suggest"]`
2. 以 `get_status` 驗註冊——代理當現於階段 `"registered"`
3. 候對代理註冊：以對代理 ID 與階段 `"registered"` 呼 `wait_for_phase`

**預期：** 二代理皆於仲介註冊。`get_status` 顯 2 代理於階段 `"registered"`。

**失敗時：** 若 `register` 敗於「already registered」，代理 ID 為前會話所用。先呼 `deregister`，再重註冊。

### 步驟三：簡報階段

讀自己之程式庫並送結構化簡報予對方。

1. 系統化讀：
   - 入口（主檔、索引、CLI 命令）
   - 依賴圖（package.json、DESCRIPTION、go.mod）
   - 建築模式（目錄結構、模組邊界）
   - 已知問題（TODO 註解、開議題、技術債）
   - 測試覆蓋（測試目錄、CI 配置）
2. 組 `Briefing` 構件——結構化摘要，令對方可有效瀏程式庫
3. 呼 `send_task` 以：
   - `from`：自代理 ID
   - `to`：對代理 ID
   - `type`：`"briefing"`
   - `payload`：JSON 編之簡報
4. 呼 `signal_phase` 以階段 `"briefing"`

**預期：** 簡報已送，階段已信號。仲介強行須先送簡報方進至審查。

**失敗時：** 若 `send_task` 拒簡報，察 `from` 欄合自註冊之代理 ID。自送被拒。

### 步驟四：審查階段

候對之簡報，察其程式並送發現。

1. 以對 ID 與階段 `"briefing"` 呼 `wait_for_phase`
2. 呼 `poll_tasks` 以取對之簡報
3. 以所收之任務 ID 呼 `ack_tasks`——此為必要（peek-then-ack 模式）
4. 讀對之實源程式，以其簡報為引
5. 產跨 6 類之發現：
   - `pattern_transfer` —— 自項目中之模式，對可採者
   - `missing_practice` —— 對所缺之實踐（測試、驗證、誤處）
   - `inconsistency` —— 對程式庫內之內矛盾
   - `simplification` —— 可減之不必要複雜
   - `bug_risk` —— 潛在執行時敗或邊界案
   - `documentation_gap` —— 缺或誤導之文件
6. 各發現須含：
   - `id`：唯一識別符（如 `"F-001"`）
   - `category`：上 6 類之一
   - `targetFile`：對項目之路
   - `description`：所尋之何
   - `evidence`：此為有效發現之因（程式引、模式）
   - `sourceAnalog`（建議）：自項目中示此模式之等效——此為真交叉授粉之單一機制
7. 捆至少 **5 發現**（QSG 約束：m ≥ 5 守 Γ_h ≈ 1.67 於選擇區）
8. 以型 `"review_bundle"` 與 JSON 編之發現陣列呼 `send_task`
9. 以階段 `"review"` 呼 `signal_phase`

**預期：** 審查捆為仲介所受。少於 5 發現將被拒。

**失敗時：** 若捆因發現不足而被拒，深審之。此約束存以防淺審主導。若真不能尋 5 問題，重考慮交叉審是否為此項目對之合宜工具。

### 步驟五：對話階段

收對項目之發現並以證據背之裁決應。

1. 以對 ID 與階段 `"review"` 呼 `wait_for_phase`
2. 呼 `poll_tasks` 以取關於自項目之發現
3. 以所收之任務 ID 呼 `ack_tasks`
4. 各發現，產 `FindingResponse`：
   - `findingId`：合發現之 ID
   - `verdict`：`"accept"`（有效，將行之）、`"reject"`（無效，含反證）、或 `"discuss"`（需釐清）
   - `evidence`：接或拒之因——須非空
   - `counterEvidence`（選擇性）：矛盾發現之具體程式引
5. 以型 `"response"` 呼 `send_task` 送所有應
6. 以階段 `"dialogue"` 呼 `signal_phase`

注：`"discuss"` 裁決非為協議所門。視之為手動後續之旗，非自動子交換。

**預期：** 所有發現皆以裁決應之。空應為仲介所拒。

**失敗時：** 若不能對某發現成見，預設 `"discuss"`，含證述所需之更多脈絡。

### 步驟六：合成階段

產合成構件，摘接受之發現與計畫行動。

1. 以對 ID 與階段 `"dialogue"` 呼 `wait_for_phase`
2. 輪詢任何餘任務並確認之
3. 編 `Synthesis` 構件：
   - 接受之發現含計畫行動（將改何、因何）
   - 拒之發現含因（保理由供後審）
4. 以型 `"synthesis"` 與 JSON 編之合成呼 `send_task`
5. 以階段 `"synthesis"` 呼 `signal_phase`
6. 選擇性為接受之發現造 GitHub 議題
7. 以階段 `"complete"` 呼 `signal_phase`
8. 呼 `deregister` 以清之

**預期：** 二代理皆達 `"complete"`。仲介要求至少 2 註冊代理方進至完成。

**失敗時：** 若對已去註冊，仍可本地完。自所收之發現編合成。

## 驗證

- [ ] 二代理皆註冊且達 `"complete"` 階段
- [ ] 簡報於審查始前已換（階段強行）
- [ ] 審查捆各含至少 5 發現
- [ ] 所有發現皆受裁決（接受/拒絕/討論）含證據
- [ ] 每 `poll_tasks` 後皆呼 `ack_tasks`
- [ ] 合成已產，接受之發現映至行動
- [ ] 完後代理已去註冊

## 常見陷阱

- **少於 5 發現**：仲介拒 m < 5 之捆。此非隨意——N=2 代理與 6 類下，m < 5 置 Γ_h 於或低於共識與雜訊不可辨之臨界。深審之；若 5 發現真不能尋，項目或不受交叉審之益
- **忘 `ack_tasks`**：仲介用 peek-then-ack 交付。任務留佇列直至確認。忘 ack 致下次輪詢時重處
- **忘 `from` 參數**：`send_task` 需明 `from` 欄合自代理 ID。自送被拒
- **同模型之認知相關**：二 Claude 實例共訓練偏見。時序確保審查時不讀他之輸出，然其先驗相關。真認知獨立，用跨實例異模型族
- **跳 `sourceAnalog`**：`sourceAnalog` 欄為選擇性，然為真交叉授粉之單一機制——其示**自之**所建議模式之實作。源類比存時恒填之
- **視 `discuss` 為阻**：協議中無門 `complete` 於未決討論。視 `discuss` 裁決為會話後手動後續之旗
- **不審遙測**：仲介記所有事件至 JSONL。會話後審日誌以驗 QSG 假設——經驗估 α（`α ≈ 1 - reject_rate`），察類接受率

## 相關技能

- `scaffold-mcp-server` —— 建或擴仲介本身
- `implement-a2a-server` —— 仲介所援之 A2A 協議模式
- `review-codebase` —— 單代理審（此技能擴之為跨代理結構化交換）
- `build-consensus` —— 群體共識模式（QSG 為理論基礎）
- `configure-mcp-server` —— 於 Claude Code 中配仲介為 MCP 伺服器
- `unleash-the-agents` —— 可用以分析仲介本身（經戰測：40 代理、10 假設族）
