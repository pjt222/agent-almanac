---
name: analyze-codebase-for-mcp
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Analyze an arbitrary codebase to identify functions, APIs, and data sources
  suitable for exposure as MCP tools, producing a tool specification document.
  Use when planning an MCP server for an existing project, auditing a codebase
  before wrapping it as an AI-accessible tool surface, comparing what a codebase
  can do versus what is already exposed via MCP, or generating a tool spec to
  hand off to scaffold-mcp-server.
license: MIT
allowed-tools: Read Grep Glob Bash
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mcp-integration
  complexity: advanced
  language: multi
  tags: mcp, analysis, tool-design, codebase
---

# 析庫為 MCP

掃庫識函、REST 端、命令、數源——適為 MCP 工者，出工譜文。

## 用

- 為既有項謀 MCP 伺須知出何→用
- 包庫為 AI 可達面前審→用
- 比庫之能與已出 MCP 之能→用
- 生工譜交 `scaffold-mcp-server`→用
- 評三方庫值包否→用

## 入

- **必**：庫根路
- **必**：庫之言（如 TypeScript、Python、R、Go）
- **可**：既有 MCP 伺以比（缺析）
- **可**：域焦（如「數析」、「檔操」、「API 接」）
- **可**：薦工數上限（默 20）

## 行

### 一：掃庫構

1.1. 用 `Glob` 圖樹，注源處：
   - `src/**/*.{ts,js,py,R,go,rs}` 為源檔
   - `**/routes/**`、`**/api/**`、`**/controllers/**` 為端定
   - `**/cli/**`、`**/commands/**` 為命入點
   - `**/package.json`、`**/setup.py`、`**/DESCRIPTION` 為依元

1.2. 按角分檔：
   - **入點**：主檔、路理、命
   - **核邏**：商邏、算、轉
   - **數達**：庫詢、檔 I/O、API 客
   - **輔**：助、格、驗

1.3. 計總檔、行、出符以量項大。

得：分角之檔錄。

敗：庫太大（>10000 檔）→以域焦窄掃。無源→驗根與言參。

### 二：識出函與端

2.1. 用 `Grep` 尋出函與公 API：
   - TypeScript/JavaScript：`export (async )?function`、`export default`、`module.exports`
   - Python：無 `_` 前綴、`@app.route`、`@router`
   - R：列於 NAMESPACE 或 `#' @export` 之函
   - Go：大寫名（按例為出）

2.2. 各候函取：
   - **名**：函或端名
   - **簽**：參附型默
   - **返型**：函出何
   - **文**：docstring、JSDoc、roxygen、godoc
   - **位**：檔路與行

2.3. REST API 加取：
   - HTTP 法與路紋
   - 請體規
   - 應形
   - 認需

2.4. 候列按潛用排序（公、有文、強型先）。

得：20-100 候函/端附取元。

敗：候少→擴搜含內函可公者。文稀→於出標為險。

### 三：評 MCP 適性

3.1. 各候按 MCP 工準評：

   - **入契清**：參強型有文乎？可述於 JSON Schema 乎？
   - **出可預**：返構數（JSON 可序）乎？返形一致乎？
   - **副效**：改態（檔、庫、外服）乎？副效須明標
   - **冪等**：可重試乎？非冪等須明警
   - **執時**：合理時內完（< 30 秒）乎？長行需異模
   - **誤理**：拋構誤或默敗乎？

3.2. 各候 1-5 分：
   - **5**：純函、強型 I/O、有文、速、無副效
   - **4**：強型、有文、小副效（如記）
   - **3**：合 I/O 契但需包（如返原物）
   - **2**：大副效或契不清，需大適
   - **1**：不適非大重構

3.3. 濾候至 ≥3 者。標 2 分為「未來候」需重構。

得：分濾候列附各適性由。

敗：多候 <3→庫或須重構先。記缺、薦具體改（加型、出純函、包副效）。

### 四：設工譜

4.1. 各選候（≥3 分）擬譜：

```yaml
- name: tool_name
  description: >
    One-line description of what the tool does.
  source_function: module.function_name
  source_file: src/path/to/file.ts:42
  parameters:
    param_name:
      type: string | number | boolean | object | array
      description: What this parameter controls
      required: true | false
      default: value_if_optional
  returns:
    type: string | object | array
    description: What the tool returns
  side_effects:
    - description of any side effect
  estimated_latency: fast | medium | slow
  suitability_score: 5
```

4.2. 工分邏類（如「數詢」、「檔操」、「析」、「設」）。

4.3. 識工間依（如 `list_datasets` 應於 `query_dataset` 前呼）。

4.4. 定工需包否：
   - 簡複參物為平入
   - 譯原返為構文或 JSON
   - 加安守（如數庫函唯讀包）

得：完整 YAML 工譜含類、依、包註。

敗：譜含糊→回二取更多源詳。型不可推→標待手察。

### 五：生工譜文

5.1. 書末譜文含：
   - **要**：庫覽、言、大、析日
   - **薦工**：四步全譜按類分
   - **未來候**：2 分附重構薦
   - **排者**：1 分附排由
   - **依**：工依圖
   - **施註**：包需、認需、傳薦

5.2. 存為 `mcp-tool-spec.yml`（機讀），可加 `mcp-tool-spec.md`（人覽）。

5.3. 若予既有 MCP 伺，加缺析段：
   - 譜中未施之工
   - 已施而譜外（或舊）
   - 譜漂之工（施異於譜）

得：完整工譜可交 `scaffold-mcp-server`。

敗：文太大（>200 工）→分模附參。庫無適候→出「備度評」文附重構薦。

## 驗

- [ ] 標庫諸源檔皆掃
- [ ] 候函取名、簽、返型
- [ ] 各候有適分附書由
- [ ] 工譜含完整參規附型
- [ ] 各工副效明文
- [ ] 出文為有效 YAML（任 YAML 庫可析）
- [ ] 工名循 MCP 例（snake_case、述、獨）
- [ ] 類與依成連貫工面
- [ ] 予既有 MCP 伺則含缺析
- [ ] 未來候段列 2 分所需重構步

## 忌

- **出工過多**：AI 助於 10-30 焦工最善。重廣於深。抗出諸公函
- **忽副效**：「唯讀」函若寫記或快取仍有副效。以 `Grep` 細審檔寫、網呼、庫變
- **設型安**：動言（Python、R、JavaScript）函或無型註。由用紋與測推型，於譜標不確
- **缺認脈**：認網請所工於 MCP 無會脈或敗。察隱認依如會餅、JWT、環注證
- **過設包**：函需 50 行包乃 MCP 容→或非好候。重自然映工介之函
- **忽誤路**：MCP 工須返構誤。拋無型例之函需誤理包
- **混內外 API**：內輔函為他內呼乃劣 MCP 候。注設為外用或明界 API 之函
- **略缺析**：予既有 MCP 伺時恆比譜與今施。無缺析則重工或漏舊工

## 參

- `scaffold-mcp-server` — 用譜出生 MCP 伺
- `build-custom-mcp-server` — 手施伺參
- `configure-mcp-server` — 接所成伺於 Claude Code/Desktop
- `troubleshoot-mcp-connection` — 部後除接誤
- `review-software-architecture` — 工面構察
- `security-audit-codebase` — 出函外前安審
