---
name: design-a2a-agent-card
locale: wenyan-ultra
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

# 設計 A2A 代理卡

建合標 A2A 代理卡，宣告代理身份、技能、認證、能力，為他代理所發現。

## 用

- 構代理須為他 A2A 代理所發現
- 露代理能力於多代理編排
- 遷現代理至 A2A 協議
- 實作前定代理公契約
- 接代理註冊處或目錄

## 入

- **必**：代理名+述
- **必**：技能列（名、述、入/出 schema）
- **必**：代理托管基 URL
- **可**：認證法（`none`、`oauth2`、`oidc`、`api-key`）
- **可**：超 `text/plain` 之內容型（如 `image/png`、`application/json`）
- **可**：能力標（流、推通知、狀態轉換歷史）
- **可**：供應方組織名+URL

## 法

### 一：定代理身份+述

1.1. 擇身份字段：

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

1.2. 書清晰可行之述答：
   - 覆何域？
   - 可理何任務？
   - 有何限？

1.3. 設代理卡服務之規範 URL 於 `/.well-known/agent.json`。

**得：** 完整身份塊含名、述、URL、供應方、版本。

**敗：** 代理覆多域→思當為一含多技能代理抑多聚焦代理。A2A 偏聚焦代理含清界。

### 二：列技能含入/出 schema

2.1. 定每技能：

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

2.2. 每技能供：
   - **id**：獨識（kebab-case）
   - **name**：人可讀名
   - **description**：一二句述
   - **tags**：發現關鍵字
   - **examples**：觸此技能之自然語例
   - **inputModes**：接 MIME 型
   - **outputModes**：生 MIME 型

2.3. 確技能界清不重疊。每任務當精映一技能。

**得：** 技能數組，每項有 id、name、description、tags、examples、I/O 模式。

**敗：** 技能重疊甚→合為一較廣技能含多例。技能過廣→拆為聚焦子技能。

### 三：配認證

3.1. 按部署上下文定認證：

**無認證**（本地/信任網）：

```json
{
  "authentication": {
    "schemes": []
  }
}
```

**OAuth 2.0**（生產宜）：

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

**API Key**（簡共享密）：

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

3.2. 擇最小可行認證匹部署環境：
   - 本地開發：`none`
   - 內部服務：`apiKey`
   - 公面代理：`oauth2` 或 `oidc`

3.3. 錄令牌/鑰配給流於代理卡供應方段或外文檔。

**得：** 認證塊匹部署安全要求。

**敗：** 無 OAuth 2.0 設施→起於 API 鑰認證+計遷。勿部公代理以 `none` 認證。

### 四：指明能力

4.1. 宣告代理支何協議功能：

```json
{
  "capabilities": {
    "streaming": true,
    "pushNotifications": false,
    "stateTransitionHistory": true
  }
}
```

4.2. 按實作就緒設每能力標：

   - **streaming**：`true` 若代理支經 `tasks/sendSubscribe` 之 SSE 流。啟長任務實時進度。
   - **pushNotifications**：`true` 若代理可於任務狀態變時送 webhook 回調。需代理存+調 webhook URL。
   - **stateTransitionHistory**：`true` 若代理維任務狀態轉換全史（submitted、working、completed 等）。利審計跡。

4.3. 僅當實作全支時設為 `true`。宣未支能力破互操作性。

**得：** 能力對象含匹實實作之布爾標。

**敗：** 未定能力將實作否→設為 `false`。能力可於後版加。除能力為破壞變。

### 五：驗+發代理卡

5.1. 組完整代理卡：

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

5.2. 驗代理卡：
   - 解 JSON 驗無語法錯
   - 驗諸必字段存（name、description、url、skills）
   - 驗每技能有 id、name、description，至少一入/出模式
   - 驗 URL 可達並於 `/.well-known/agent.json` 服卡

5.3. 發代理卡：
   - 於 `https://<agent-url>/.well-known/agent.json` 服
   - 設 `Content-Type: application/json`
   - 跨源發現→啟 CORS 頭
   - 於相關代理目錄/註冊處註冊

5.4. 以拉卡測發現：

```bash
curl -s https://agent.example.com/.well-known/agent.json | python3 -m json.tool
```

**得：** 有效 JSON 代理卡於 well-known URL 服，可為任 A2A 客戶解析。

**敗：** JSON 驗失→用 JSON linter 察語法錯。URL 不可達→查 DNS、SSL 證、服務器配。需 CORS→加 `Access-Control-Allow-Origin` 頭。

## 驗

- [ ] 代理卡為有效 JSON 無語法錯
- [ ] 諸必字段存：name、description、url、skills
- [ ] 每技能有 id、name、description、inputModes、outputModes
- [ ] 認證方案匹部署安全要求
- [ ] 能力標準確反映實作狀態
- [ ] 代理卡於 `/.well-known/agent.json` 含正 Content-Type 服
- [ ] A2A 客戶可成拉+解卡
- [ ] 技能之例現實且觸正技能

## 忌

- **過諾能力**：設 `streaming: true` 或 `pushNotifications: true` 而無實作→用此功能時客戶失敗。宜保守。
- **技能述模糊**：「做數據事」防精確匹。宜具體陳入、出、域。
- **缺 CORS 頭**：無正 CORS 配瀏覽器 A2A 客戶不可拉卡。
- **技能重疊**：兩技能可理同任務→客戶代理不能定調何。確清界。
- **忘默認模式**：省 `defaultInputModes` 與 `defaultOutputModes`→客戶或不知送何內容型。
- **版本停滯**：技能/能力變時更卡版本。客戶或緩舊版。
- **實作前發**：代理卡為契約。發未實作技能→運行時失。

## 參

- `implement-a2a-server`
- `test-a2a-interop`
- `build-custom-mcp-server`
- `configure-mcp-server`
