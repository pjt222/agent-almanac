---
name: analyze-codebase-for-mcp
locale: wenyan-lite
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

# 為 MCP 析碼庫

掃描碼庫以發現適合作為 MCP 工具暴露之函式、REST 端點、CLI 命令與資料存取模式，並產出結構化工具規格文件。

## 適用時機

- 為既有專案規劃 MCP 伺服器，須知何者可暴露
- 將碼庫包為 AI 可達之工具面前作審計
- 比對碼庫所能與已透過 MCP 暴露者
- 產出工具規格文件以交付 `scaffold-mcp-server`
- 評估第三方函式庫是否值包為 MCP 工具

## 輸入

- **必要**：碼庫根目錄之路徑
- **必要**：碼庫之目標語言（如 TypeScript、Python、R、Go）
- **選擇性**：既有 MCP 伺服器碼以資比對（差距分析）
- **選擇性**：領域焦點（如「資料分析」、「檔案操作」、「API 整合」）
- **選擇性**：建議工具之最大數（預設：20）

## 步驟

### 步驟一：掃碼庫結構

1.1. 用 `Glob` 圖目錄樹，重於源目錄：
   - `src/**/*.{ts,js,py,R,go,rs}` 為源檔
   - `**/routes/**`、`**/api/**`、`**/controllers/**` 為端點定義
   - `**/cli/**`、`**/commands/**` 為 CLI 入口
   - `**/package.json`、`**/setup.py`、`**/DESCRIPTION` 為依賴元資料

1.2. 依角色將檔案分類：
   - **入口**：主檔、路由處理器、CLI 命令
   - **核心邏輯**：業務邏輯函式、演算法、資料轉換
   - **資料存取**：資料庫查詢、檔案 I/O、API 客戶端
   - **工具**：輔助、格式化、驗證

1.3. 計總檔數、行數與輸出符號以估專案規模。

**預期：** 含角色註記之分類檔案清單。

**失敗時：** 若碼庫過大（>10,000 檔），以領域焦點輸入縮掃至特定目錄或模組。若無源檔現，驗證根路徑與語言參數。

### 步驟二：辨已暴露之函式與端點

2.1. 用 `Grep` 尋輸出函式與公共 API：
   - TypeScript/JavaScript：`export (async )?function`、`export default`、`module.exports`
   - Python：未以 `_` 為首之函式、`@app.route`、`@router`
   - R：列於 NAMESPACE 或 `#' @export` roxygen 標籤之函式
   - Go：首字大寫之函式名（按慣例輸出）

2.2. 每候選函式，提取：
   - **名**：函式或端點名
   - **簽名**：參數連同型別與預設
   - **回傳型別**：函式所產
   - **文件**：docstring、JSDoc、roxygen、godoc
   - **位置**：檔案路徑與行號

2.3. 對 REST API 另提取：
   - HTTP 方法與路由模式
   - 請求體 schema
   - 回應形
   - 認證需求

2.4. 建候選清單，依潛效用排序（公共、有文件、型別良好之函式為先）。

**預期：** 20-100 候選函式／端點之清單，附提取之元資料。

**失敗時：** 若候選甚少，擴搜以含可化公之內函式。若文件稀薄，於輸出中標為風險。

### 步驟三：評 MCP 適性

3.1. 對每候選，依 MCP 工具準則評：

   - **輸入契約之清晰**：參數型別與文件良好否？可以 JSON Schema 描述否？
   - **輸出可預測**：函式回結構化資料（可 JSON 序列化）否？回傳形一致否？
   - **副作用**：函式改狀態（檔案、資料庫、外部服務）否？副作用須明標
   - **冪等性**：操作可安全重試否？非冪等工具須明示警告
   - **執行時**：可於合理逾時內完成（< 30 秒）否？長執行操作需非同步模式
   - **錯誤處理**：擲結構化錯誤或默默失？

3.2. 每候選按 1-5 評分：
   - **5**：純函式、型別化 I/O、有文件、快、無副作用
   - **4**：型別良好、有文件、輕微副作用（如記錄）
   - **3**：合理 I/O 契約然需包裝（如回原始物件）
   - **2**：顯著副作用或不清契約，需大幅適配
   - **1**：未經大改不適

3.3. 過濾候選至評 3 以上者。將評 2 標為「將來候選」，需重構。

**預期：** 已評分過濾之候選清單，每項附適性理由。

**失敗時：** 若多數候選低於 3，碼庫於 MCP 暴露前恐需重構。記差距並建議特定改進（加型別、提取純函式、包副作用）。

### 步驟四：設計工具規格

4.1. 對每選定候選（評 >= 3），擬工具規格：

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

4.2. 將工具按邏輯類別分組（如「資料查詢」、「檔案操作」、「分析」、「配置」）。

4.3. 辨工具間之依賴（如「list_datasets」應於「query_dataset」前呼叫）。

4.4. 判定何工具需包裝以：
   - 將複雜參數物件化為扁平輸入
   - 將原始回值化為結構化文字或 JSON
   - 加安全護欄（如資料庫函式之唯讀包裝）

**預期：** 含類別、依賴與包裝註記之完整 YAML 工具規格。

**失敗時：** 若工具規格曖昧，回步驟二自源碼提更詳。若參數型別無法推斷，標供人工複查。

### 步驟五：生工具規格文件

5.1. 撰最終規格文件，含以下節：
   - **摘要**：碼庫概覽、語言、規模、分析日期
   - **建議工具**：步驟四之完整規格，按類別分組
   - **將來候選**：評 2 項目附重構建議
   - **排除項目**：評 1 項目附排除理由
   - **依賴**：工具依賴圖
   - **實作註記**：包裝需求、認證需求、傳輸建議

5.2. 存為 `mcp-tool-spec.yml`（機讀）並可選 `mcp-tool-spec.md`（人讀摘要）。

5.3. 若提供既有 MCP 伺服器，加差距分析節：
   - 規格中有但尚未實作之工具
   - 已實作但不在規格中之工具（恐已陳舊）
   - 規格漂移之工具（實作偏離規格）

**預期：** 完整工具規格文件，可供 `scaffold-mcp-server` 消用。

**失敗時：** 若文件超合理規模（>200 工具），拆為模組並交叉引用。若碼庫無合適候選，改產「就緒評估」文件附重構建議。

## 驗證

- [ ] 目標碼庫一切源檔皆已掃
- [ ] 候選函式皆有提取之名、簽名、回傳型別
- [ ] 各候選皆有適性評分附書面理由
- [ ] 工具規格含完整參數 schema 與型別
- [ ] 每工具之副作用皆明文記
- [ ] 輸出文件為有效 YAML（任一 YAML 函式庫可解析）
- [ ] 工具名遵 MCP 慣例（snake_case、描述性、唯一）
- [ ] 類別與依賴形成連貫之工具面
- [ ] 提供既有 MCP 伺服器時，差距分析在內
- [ ] 將來候選節列評 2 項目所需之重構步驟

## 常見陷阱

- **暴露過多工具**：AI 助手以 10-30 焦點工具最佳。寧廣能而勿深。抗暴露每一公共函式之誘
- **忽視副作用**：「僅讀」之函式若亦寫日誌或快取，仍有副作用。以 `Grep` 詳審檔案寫、網路呼叫、資料庫變動
- **假設型別安全**：動態語言（Python、R、JavaScript）之函式或無型別註記。自用例與測試推型別，然於規格中標不確定
- **遺認證情境**：於認證 web 請求中可工之函式，經 MCP 無 session 情境呼叫時或失。查隱含認證依賴如 session cookie、JWT token、環境注入之憑證
- **過工程包裝**：若函式需 50 行包裝方相容 MCP，恐非佳候選。寧函式自然映入工具介面
- **疏錯誤路徑**：MCP 工具須回結構化錯誤。擲未型別異常之函式需錯誤處理包裝
- **混內外 API**：受其他內部碼呼叫之內部輔助函式為差 MCP 候選。重於為外部消用設計之函式或清晰邊界 API
- **跳差距分析**：若提供既有 MCP 伺服器，恆比對規格與當前實作。無差距分析則風險於重複勞或漏陳舊工具

## 相關技能

- `scaffold-mcp-server` — 用輸出規格生成可工之 MCP 伺服器
- `build-custom-mcp-server` — 手動伺服器實作參考
- `configure-mcp-server` — 將所成之伺服器接至 Claude Code/Desktop
- `troubleshoot-mcp-connection` — 部署伺服器後除錯連線
- `review-software-architecture` — 工具面設計之架構複查
- `security-audit-codebase` — 對外暴露函式前之安全審計
