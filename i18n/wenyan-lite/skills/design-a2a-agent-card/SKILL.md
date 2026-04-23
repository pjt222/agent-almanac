---
name: design-a2a-agent-card
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Design an A2A Agent Card (.well-known/agent.json) manifest describing agent
  capabilities, skills, authentication requirements, and supported content types.
  Use when building an agent that must be discoverable by other A2A-compliant
  agents, exposing capabilities for multi-agent orchestration, migrating an
  existing agent to the A2A protocol, defining the public contract for an agent
  before implementation, or integrating with agent registries that consume Agent
  Cards.
license: MIT
allowed-tools: Read Write Edit Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: a2a-protocol
  complexity: intermediate
  language: multi
  tags: a2a, agent-card, manifest, capabilities, interoperability
---

# Design A2A Agent Card

建合標之 A2A Agent Card，以告代理之身分、技能、認證需求與能力，供他代理發現。

## 適用時機

- 建代理，須為他 A2A 相容代理所發現
- 為多代理編排暴露代理能力
- 將既有代理遷至 A2A（Agent-to-Agent）協定
- 實作前為代理定公開契約
- 整合代理註冊表或消費 Agent Card 之目錄

## 輸入

- **必需**：代理之名與述
- **必需**：代理可行之技能清單（名、述、輸入/輸出 schema）
- **必需**：代理託管之基礎 URL
- **可選**：認證方法（`none`、`oauth2`、`oidc`、`api-key`）
- **可選**：超 `text/plain` 之受支援內容類型（如 `image/png`、`application/json`）
- **可選**：能力旗標（串流、推播通知、狀態轉移歷史）
- **可選**：提供者組織名與 URL

## 步驟

### 步驟一：定代理身分與述

1.1. 擇代理身分欄位：

```json
{
  "name": "data-analysis-agent",
  "description": "Performs statistical analysis, data visualization, and report generation on tabular datasets.",
  "url": "https://agent.example.com",
  "provider": {
    "organization": "Example Corp",
    "url": "https://example.com"
  },
  "version": "1.0.0"
}
```

1.2. 書清晰、可執行之述，答：
   - 此代理涵何等領域？
   - 可處理何等任務？
   - 其限何？

1.3. 設代理卡將供應於 `/.well-known/agent.json` 之標準 URL。

**預期：** 完整之身分區塊，含名、述、URL、提供者、版本。

**失敗時：** 若代理服多領域，慮其宜為一代理具多技能，抑或多代理具聚焦範圍。A2A 偏好聚焦代理具明界。

### 步驟二：列技能之輸入/輸出 schema

2.1. 定代理可行之每一技能：

```json
{
  "skills": [
    {
      "id": "analyze-dataset",
      "name": "Analyze Dataset",
      "description": "Run descriptive statistics, correlation analysis, or hypothesis tests on a CSV dataset.",
      "tags": ["statistics", "data-analysis", "csv"],
      "examples": [
        "Analyze the correlation between columns A and B in my dataset",
        "Run a t-test comparing group 1 and group 2"
      ],
      "inputModes": ["text/plain", "application/json"],
      "outputModes": ["text/plain", "application/json", "image/png"]
    },
    {
      "id": "generate-chart",
      "name": "Generate Chart",
      "description": "Create bar, line, scatter, or histogram charts from tabular data.",
      "tags": ["visualization", "charts"],
      "examples": [
        "Create a scatter plot of height vs weight",
        "Generate a histogram of the age column"
      ],
      "inputModes": ["text/plain", "application/json"],
      "outputModes": ["image/png", "image/svg+xml"]
    }
  ]
}
```

2.2. 為每技能提供：
   - **id**：唯一標識（kebab-case）
   - **name**：人類可讀之顯示名
   - **description**：一至二句述技能所行
   - **tags**：供發現之可搜尋關鍵字
   - **examples**：觸發此技能之自然語言任務例
   - **inputModes**：技能接受之 MIME 類型
   - **outputModes**：技能可生之 MIME 類型

2.3. 確保技能邊界明確且不重疊。每任務應精確對映至一技能。

**預期：** 技能陣列，每條目具 id、name、description、tags、examples、I/O 模式。

**失敗時：** 若技能重疊顯著，合之為單一較廣技能具更多例。若技能過廣，分之為聚焦之子技能。

### 步驟三：配認證

3.1. 依部署情境定認證方案：

**無認證（本地/可信網路）：**

```json
{
  "authentication": {
    "schemes": []
  }
}
```

**OAuth 2.0（生產建議）：**

```json
{
  "authentication": {
    "schemes": ["oauth2"],
    "credentials": {
      "oauth2": {
        "authorizationUrl": "https://auth.example.com/authorize",
        "tokenUrl": "https://auth.example.com/token",
        "scopes": {
          "agent:invoke": "Invoke agent skills",
          "agent:read": "Read task status"
        }
      }
    }
  }
}
```

**API Key（簡易共享密鑰）：**

```json
{
  "authentication": {
    "schemes": ["apiKey"],
    "credentials": {
      "apiKey": {
        "headerName": "X-API-Key"
      }
    }
  }
}
```

3.2. 為部署環境擇最小可行之認證：
   - 本地開發：`none`
   - 內部服務：`apiKey`
   - 面向公開之代理：`oauth2` 或 `oidc`

3.3. 於 Agent Card 之 provider 區或外部文檔載令牌/金鑰供應過程。

**預期：** 認證區塊合部署安全需求。

**失敗時：** 若 OAuth 2.0 基礎架構不可用，始以 API key 認證並計劃遷移。勿以 `none` 認證部署公開代理。

### 步驟四：載明能力

4.1. 宣告代理支援何等協定功能：

```json
{
  "capabilities": {
    "streaming": true,
    "pushNotifications": false,
    "stateTransitionHistory": true
  }
}
```

4.2. 依實作就緒度設每能力旗標：

   - **streaming**：若代理透過 `tasks/sendSubscribe` 支援 SSE 串流則 `true`。為長任務啟用即時進度更新。
   - **pushNotifications**：若代理可於任務狀態變時發 webhook 回調則 `true`。需代理存並回調 webhook URL。
   - **stateTransitionHistory**：若代理維持任務狀態轉移之完整歷史（submitted、working、completed 等）則 `true`。有益於稽核軌跡。

4.3. 僅於實作全然支援時設能力為 `true`。廣告不支援之能力破壞互通。

**預期：** 能力物件具布林旗標合實際實作。

**失敗時：** 若不確能力將實作，設之為 `false`。能力可於未來版本加。移除能力為破壞性變。

### 步驟五：驗證並發布 Agent Card

5.1. 組裝完整 Agent Card：

```json
{
  "name": "data-analysis-agent",
  "description": "Performs statistical analysis and visualization on tabular datasets.",
  "url": "https://agent.example.com",
  "version": "1.0.0",
  "provider": {
    "organization": "Example Corp",
    "url": "https://example.com"
  },
  "authentication": {
    "schemes": ["oauth2"],
    "credentials": { ... }
  },
  "capabilities": {
    "streaming": true,
    "pushNotifications": false,
    "stateTransitionHistory": true
  },
  "skills": [ ... ],
  "defaultInputModes": ["text/plain"],
  "defaultOutputModes": ["text/plain"]
}
```

5.2. 驗 Agent Card：
   - 以 JSON 解析並驗無語法錯
   - 驗所有必需欄位存（name、description、url、skills）
   - 驗每技能有 id、name、description 及至少一輸入/輸出模式
   - 驗 URL 可達且於 `/.well-known/agent.json` 供應該卡

5.3. 發布 Agent Card：
   - 於 `https://<agent-url>/.well-known/agent.json` 供應
   - 設 `Content-Type: application/json`
   - 若需跨源發現則啟 CORS 標頭
   - 向任何相關代理目錄或註冊表註冊

5.4. 以取卡試發現：

```bash
curl -s https://agent.example.com/.well-known/agent.json | python3 -m json.tool
```

**預期：** 於 well-known URL 供應之有效 JSON Agent Card，任何 A2A 客戶端皆可解析。

**失敗時：** 若 JSON 驗證失敗，用 JSON 檢查器識語法錯。若 URL 不可達，查 DNS、SSL 憑證與 web 伺服器配置。若需 CORS，加 `Access-Control-Allow-Origin` 標頭。

## 驗證

- [ ] Agent Card 為有效 JSON 且無語法錯
- [ ] 所有必需欄位存：name、description、url、skills
- [ ] 每技能有 id、name、description、inputModes、outputModes
- [ ] 認證方案合部署安全需求
- [ ] 能力旗標準確反映實作狀態
- [ ] Agent Card 於 `/.well-known/agent.json` 以正確 Content-Type 供應
- [ ] A2A 客戶端可成功取並解析該卡
- [ ] 技能中之例真實且觸發正確之技能

## 常見陷阱

- **過諾能力**：未實作而設 `streaming: true` 或 `pushNotifications: true` 致用該等功能時客戶端失敗。宜保守。
- **技能述模糊**：如「做資料之事」之述阻準確技能匹配。應於輸入、輸出與領域具體。
- **缺 CORS 標頭**：瀏覽器基之 A2A 客戶端若無適當 CORS 配置則無法取 Agent Card。
- **技能重疊**：若兩技能可處理同任務，客戶端代理無法判擇何者。宜確保明界。
- **忘預設模式**：若省 `defaultInputModes` 與 `defaultOutputModes`，客戶端可能不知送何等內容類型。
- **版本停滯**：技能或能力變時更 Agent Card 版本。客戶端可能快取舊版。
- **實作前發布**：Agent Card 為契約。發布尚未實作之技能致運行時失敗。

## 相關技能

- `implement-a2a-server` - 實作 Agent Card 背後之伺服器
- `test-a2a-interop` - 驗證 Agent Card 合規與互通
- `build-custom-mcp-server` - MCP 伺服器作 A2A 之替/補
- `configure-mcp-server` - MCP 配置模式，適用於 A2A 設定
