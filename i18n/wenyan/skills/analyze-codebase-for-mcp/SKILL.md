---
name: analyze-codebase-for-mcp
locale: wenyan
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

# 析碼庫為 MCP

掃碼庫以察函、REST 端點、CLI 命、數訪之式而宜 MCP 工具露出者，生結構化之工具規文。

## 用時

- 為既存之項謀 MCP 服而需知所露者乃用
- 將碼庫裹為 AI 可達之面前審之乃用
- 比碼庫所能與已露於 MCP 者乃用
- 生工具規文交付 `scaffold-mcp-server` 乃用
- 察三方庫值裹為 MCP 工具乎乃用

## 入

- **必要**：碼庫根目之徑
- **必要**：碼庫之語（如 TypeScript、Python、R、Go）
- **可選**：既有 MCP 服之碼以比（隙析）
- **可選**：域之焦（如「數析」、「檔操」、「API 整合」）
- **可選**：所薦工具最多之數（默：20）

## 法

### 第一步：掃碼庫之構

1.1. 以 `Glob` 繪目樹，注源目：
   - `src/**/*.{ts,js,py,R,go,rs}` 為源
   - `**/routes/**`、`**/api/**`、`**/controllers/**` 為端點定
   - `**/cli/**`、`**/commands/**` 為 CLI 入
   - `**/package.json`、`**/setup.py`、`**/DESCRIPTION` 為依元

1.2. 按角分類：
   - **入點**：主檔、路由處、CLI 命
   - **核邏**：業之函、算法、數之轉
   - **數訪**：庫查、檔 I/O、API 客
   - **雜助**：助者、格者、驗者

1.3. 計總檔、碼行、導符以估項之大。

**得：** 按角注之檔錄。

**敗則：** 若碼庫過大（逾萬檔），以域焦縮掃特目或模。若無源檔，驗根徑與語參。

### 第二步：識已露之函與端點

2.1. 以 `Grep` 尋導之函與公之 API：
   - TypeScript/JavaScript：`export (async )?function`、`export default`、`module.exports`
   - Python：未以 `_` 前之函、`@app.route`、`@router`
   - R：NAMESPACE 所列或 `#' @export` roxygen 注之函
   - Go：大寫始之函名（按約導）

2.2. 每候函，取：
   - **名**：函或端點之名
   - **簽**：參及其型與默
   - **返型**：函所生者
   - **文**：docstring、JSDoc、roxygen、godoc
   - **位**：檔徑與行號

2.3. 為 REST API，加取：
   - HTTP 法與路之式
   - 請求體之模
   - 應之形
   - 認證之求

2.4. 建候列，以潛益而序（公之、有文、型明之函先）。

**得：** 二十至百候函/端點，有取之元。

**敗則：** 若候少，擴搜以納可轉公之內函。若文稀，標為出之險。

### 第三步：評 MCP 之宜

3.1. 每候，按 MCP 工具準：

   - **入約之明**：參型明而有文乎？可以 JSON Schema 述乎？
   - **出之可預**：函返結構化之數（JSON 可序化）乎？返形恆乎？
   - **副作**：函改狀（檔、庫、外服）乎？副作必明標。
   - **冪等**：操安再試乎？非冪等需明警。
   - **執行之時**：可於理限內（< 30 秒）成乎？久行之操需異步式。
   - **誤處**：擲結構化之誤抑或默敗？

3.2. 各候以 1-5 評：
   - **5**：純函、型明、有文、速、無副作
   - **4**：型明、有文、微副作（如日誌）
   - **3**：I/O 約尚可而需裹（如返原物）
   - **2**：重副作或約不明，需重適
   - **1**：不宜除非大改

3.3. 濾候至 3 以上。2 者標為「未來候」需改。

**得：** 評且濾之候列，各有宜之由。

**敗則：** 若多候低於 3，碼庫或需改然後露為 MCP。書其隙薦改之具（加型、取純函、裹副作）。

### 第四步：設工具規

4.1. 每選候（評 >= 3），擬工具規：

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

4.2. 聚工具為邏類（如「數查」、「檔操」、「析」、「設」）。

4.3. 識工具間之依（如「list_datasets」宜先於「query_dataset」）。

4.4. 定工具需裹否以：
   - 簡繁參為平入
   - 轉原返為結構化文或 JSON
   - 加安守（如庫函只讀之裹）

**得：** 全 YAML 工具規，含類、依、裹之注。

**敗則：** 若規曖昧，返第二步取更詳。若參型不可推，標為人審。

### 第五步：生工具規文

5.1. 書終規文，含：
   - **要**：碼庫概、語、大、析之日
   - **薦工具**：第四步全規，按類聚
   - **未來候**：2 者與改薦
   - **排除者**：1 者與排之由
   - **依**：工具依圖
   - **實注**：裹之求、認之求、傳之薦

5.2. 存為 `mcp-tool-spec.yml`（機讀）及可選 `mcp-tool-spec.md`（人讀要）。

5.3. 若給既存 MCP 服，含隙析段：
   - 規中之工具未實現者
   - 已實現而不在規者（或陳）
   - 規實偏移者（實違規）

**得：** 全工具規文，備予 `scaffold-mcp-server` 用。

**敗則：** 若文過大（逾 200 工具），析為模附交參。若碼庫無宜候，代以「備度評」文與改薦。

## 驗

- [ ] 目庫諸源皆已掃
- [ ] 候函取名、簽、返型
- [ ] 每候有評與書之由
- [ ] 工具規含全參模與型
- [ ] 每工具副作明書
- [ ] 出之文為有效 YAML（任 YAML 庫可析）
- [ ] 工具名循 MCP 約（snake_case、述、獨）
- [ ] 類與依成貫之工具面
- [ ] 給既存 MCP 服則含隙析
- [ ] 未來候段列 2 者所需改之步

## 陷

- **露過多工具**：AI 助最宜十至三十聚工具。重能之廣勝於深。勿露諸公函
- **忽副作**：「只讀」之函亦或書日誌或緩。以 `Grep` 察檔寫、網呼、庫改
- **假型安**：動語（Python、R、JavaScript）或無型注。由用式與試推型，標疑於規
- **失認上下文**：於認證網請求中行之函經 MCP 呼或無會話而敗。察隱認之依如會話 cookie、JWT 令、環注憑
- **過築裹**：函需五十行之裹方合 MCP 則或非佳候。重自然映工具界之函
- **忽誤路**：MCP 工具須返結構化誤。擲未型異之函需誤處之裹
- **混內外 API**：他內碼所呼之內助函為劣 MCP 候。重設於外用之函或清界 API
- **跳隙析**：若給既存 MCP 服，恆比規與當前實現。無隙析則冒複功或失陳工具

## 參

- `scaffold-mcp-server` — 用出之規生工作之 MCP 服
- `build-custom-mcp-server` — 手實現之參
- `configure-mcp-server` — 連所生之服至 Claude Code/Desktop
- `troubleshoot-mcp-connection` — 部後調連
- `review-software-architecture` — 工具面設之審
- `security-audit-codebase` — 外露函之前安審
