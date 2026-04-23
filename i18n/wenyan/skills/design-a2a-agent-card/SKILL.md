---
name: design-a2a-agent-card
locale: wenyan
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

# 設 A2A Agent Card

建合標之 A2A Agent Card，告代理之身、技、認證、能，供他代理發現。

## 用時

- 建代理宜由他 A2A 合規代理發現
- 為多代理編排曝能
- 將既有代理遷至 A2A（Agent-to-Agent）協議
- 於實裝前定代理之公契
- 與消費 Agent Card 之代理冊合

## 入

- **必要**：代理名與述
- **必要**：代理所行之技單（名、述、入出之 schema）
- **必要**：代理宿之基 URL
- **可選**：認證法（`none`、`oauth2`、`oidc`、`api-key`）
- **可選**：`text/plain` 外之內容型（如 `image/png`、`application/json`）
- **可選**：能旗（流、推通知、狀態變史）
- **可選**：供應組織名與 URL

## 法

### 第一步：定代理身與述

1.1. 擇代理身字段：

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

1.2. 書明可行之述，答：
   - 此代理覆何域？
   - 可理何任？
   - 其限為何？

1.3. 設規範 URL，Agent Card 於 `/.well-known/agent.json` 服。

**得：** 全身塊，含名、述、URL、供應、版。

**敗則：** 若代理服多域，思宜為一代理多技，或多代理聚範。A2A 偏範清之聚焦代理。

### 第二步：列技之入出 schema

2.1. 定代理可行諸技：

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

2.2. 每技宜供：
   - **id**：唯一識（kebab-case）
   - **name**：人可讀之顯名
   - **description**：一二句述技之所為
   - **tags**：供發現之關鍵詞
   - **examples**：觸此技之自然語任例
   - **inputModes**：技受之 MIME 型
   - **outputModes**：技可生之 MIME 型

2.3. 確技界清無疊。各任宜映唯一技。

**得：** 技陣，每項有 id、name、description、tags、examples 及 I/O 型。

**敗則：** 若技顯疊，合為一更廣技附多例。若技過廣，分為聚焦子技。

### 第三步：配認證

3.1. 依部署境定認證方案：

**無認證（本地/信網）：**

```json
{
  "authentication": {
    "schemes": []
  }
}
```

**OAuth 2.0（產宜）：**

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

**API Key（簡共秘）：**

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

3.2. 擇合部署境最低可行認證：
   - 本地開發：`none`
   - 內服：`apiKey`
   - 公向代理：`oauth2` 或 `oidc`

3.3. 將令牌/鑰發程記於 Agent Card 之 provider 段或外文檔。

**得：** 認證塊合部署安要。

**敗則：** 若無 OAuth 2.0 設施，由 API key 認證始，謀遷。勿以 `none` 認證部公代理。

### 第四步：陳能

4.1. 宣代理所支之協議特：

```json
{
  "capabilities": {
    "streaming": true,
    "pushNotifications": false,
    "stateTransitionHistory": true
  }
}
```

4.2. 依實裝備度設各能旗：

   - **streaming**：若代理支經 `tasks/sendSubscribe` 之 SSE 流，則 `true`。啟實時進度更供久任。
   - **pushNotifications**：若代理可於任變時送 webhook 回調，則 `true`。代理宜存並呼 webhook URL。
   - **stateTransitionHistory**：若代理維任全狀變史（submitted、working、completed 等），則 `true`。審計有用。

4.3. 實裝全支乃設 `true`。告未支之能破互操。

**得：** 能塊含布爾旗合實實裝。

**敗則：** 若不定某能將實裝，設 `false`。能可後版加。移能為破壞之變。

### 第五步：驗並發布 Agent Card

5.1. 集全 Agent Card：

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
   - 以 JSON 解並驗無法錯
   - 驗諸必字段存（name、description、url、skills）
   - 驗各技有 id、name、description 及至少一入/出型
   - 驗 URL 可達且於 `/.well-known/agent.json` 服卡

5.3. 發布 Agent Card：
   - 於 `https://<agent-url>/.well-known/agent.json` 服
   - 設 `Content-Type: application/json`
   - 若需跨源發現，啟 CORS 頭
   - 於相關代理目錄或冊注冊

5.4. 以取卡測發現：

```bash
curl -s https://agent.example.com/.well-known/agent.json | python3 -m json.tool
```

**得：** 有效 JSON Agent Card 於 well-known URL 服，諸 A2A 客可解。

**敗則：** 若 JSON 驗敗，以 linter 尋法錯。若 URL 不達，察 DNS、SSL 證書、web 伺配。若需 CORS，加 `Access-Control-Allow-Origin` 頭。

## 驗

- [ ] Agent Card 為有效 JSON 無法錯
- [ ] 諸必字段皆存：name、description、url、skills
- [ ] 各技有 id、name、description、inputModes、outputModes
- [ ] 認證方案合部署安要
- [ ] 能旗準反實裝態
- [ ] Agent Card 於 `/.well-known/agent.json` 以正 Content-Type 服
- [ ] A2A 客成取並解卡
- [ ] 技之 examples 實際且觸正確之技

## 陷

- **過諾能**：無實裝而設 `streaming: true` 或 `pushNotifications: true` 致客用時敗。宜保守。
- **技述含糊**：「行數據事」之述阻準技匹。對入、出、域宜具體。
- **缺 CORS 頭**：瀏覽器 A2A 客無正 CORS 配不能取 Agent Card。
- **技疊**：若二技可理同任，客代理不能定呼何者。確界清。
- **忘默模**：若 `defaultInputModes` 與 `defaultOutputModes` 略，客或不知送何內容型。
- **版停**：技或能變時宜更 Agent Card 版。客或緩舊版。
- **實前發布**：Agent Card 為契。發布未實之技致運時敗。

## Related Skills

- `implement-a2a-server` - 實 Agent Card 後之服
- `test-a2a-interop` - 驗 Agent Card 合規與互操
- `build-custom-mcp-server` - MCP 伺為 A2A 之替/補
- `configure-mcp-server` - MCP 配模式可施 A2A 設
