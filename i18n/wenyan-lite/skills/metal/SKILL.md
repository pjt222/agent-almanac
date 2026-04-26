---
name: metal
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Extract the conceptual essence of a repository as skills, agents, and teams —
  the project's roles, procedures, and coordination patterns expressed as
  agentskills.io-standard definitions. Reads an arbitrary codebase and produces
  generalized definitions that capture WHAT the project does and WHO operates it,
  without replicating HOW it does it. Use when onboarding to a new codebase and
  wanting to understand its conceptual architecture, when bootstrapping an
  agentic system from an existing project, when studying a project's organizational
  DNA for cross-pollination, or when creating a skill/agent/team library inspired
  by a reference implementation.
license: MIT
allowed-tools: Read Grep Glob Bash
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: alchemy
  complexity: advanced
  language: natural
  tags: alchemy, extraction, essence, meta, skills, agents, teams, conceptual, metallurgy
---

# 金（Metal）

提取代碼庫之概念 DNA——其角色、程序與協調模式——為一般化之 agentskills.io 定義。如自礦中提貴金，本技能分項目之「所是」（其本質）與其「所行」（其實作），產可重用之技能、代理與團隊定義，捕捉項目之組織基因組而不複製其代碼庫。

## 適用時機

- 入新代碼庫，欲先繪其概念架構而後深入代碼
- 自既有項目啟動代理系統——將隱含之工作流變為明顯之技能、代理、團隊定義
- 研項目之組織 DNA 以助跨花授粉至他項目
- 受參考實作所啟而建技能、代理、團隊庫而不複製之
- 知項目結構揭其創者之心智模型與領域專長

## 輸入

- **必要**：代碼庫或項目根目錄之路徑
- **必要**：目的陳述——何以提本質？（入熟、啟動、研究或跨花授粉）
- **選擇性**：聚焦領域——項目中欲集中之特定範圍（預設：全部）
- **選擇性**：輸出深度——`survey`（僅勘探與化驗）、`extract`（完整程序）或 `report`（提取加書面報告）（預設：`extract`）
- **選擇性**：最大提取數——技能加代理加團隊之總上限（預設：十五）

## 礦石測試

所有提取之核心品質判準：

> **此概念可存於完全不同之實作中乎？**
>
> 若可——此乃**金**（本質）。提之。
> 若否——此乃**矸**（實作細節）。棄之。

例：氣象應用之概念「整合外部資料源」乃金——適於任何取第三方資料之項目。然「解析 OpenWeatherMap v3 JSON 回應」乃矸——專於一 API。

提取之技能宜述任務之**類**而非特定實例。提取之代理宜述**角色**而非個人。提取之團隊宜述**協調模式**而非組織圖。

## 步驟

### 步驟一：勘探——測礦體

無評觀代碼庫結構。採掘前先繪地形。

1. Glob 目錄樹以悉項目之形：
   - 源目錄及其組織模式（依特性、依層、依領域）
   - 配置檔：`package.json`、`DESCRIPTION`、`setup.py`、`Cargo.toml`、`go.mod`、`Makefile`
   - 文檔：`README.md`、`CLAUDE.md`、`CONTRIBUTING.md`、架構文件
   - CI/CD：`.github/workflows/`、`Dockerfile`、部署配置
   - 測試目錄及其結構
2. 讀項目自描述（README、套件清單）以悉其聲明之目的
3. 依類型或語言計檔以估範圍並辨主要技術
4. 識項目邊界——何處始終，所依為何，所提為何
5. 產**勘探報告**：

```
Project: [name]
Declared Purpose: [from README/manifest]
Languages: [primary, secondary]
Size: [file count, approx LOC]
Shape: [monorepo/library/app/framework/docs]
External Surface: [CLI/API/UI/library exports/none]
```

**預期：** 事實性測量——何物在此、有多大、項目自稱為何。尚無分類或評斷。報告讀如地質測量，非評論。

**失敗時：** 若代碼庫無 README 或清單，自目錄名、檔內容與測試描述推目的。若項目過大（一千以上源檔），縮範圍至最活躍之目錄（用 git log 頻率或 README 引用）。

### 步驟二：化驗——析其組成

讀代表性檔以悉項目於概念層所**為**。

1. 自項目不同區域抽樣五至十代表性檔——非詳盡，但多樣：
   - 入口（主檔、路由處理、CLI 命令）
   - 核心邏輯（最被引用或最被引照之模組）
   - 測試（其揭預期行為較實作更明）
   - 配置（揭運作關切與部署上下文）
2. 對各抽樣區域，識：
   - **領域**：項目觸何題材區？（如「驗證」、「資料轉換」、「報告」）
   - **動詞**：項目行何動作？（如「驗」、「轉」、「部署」、「通知」）
   - **角色**：代碼為何人或何系統而服務？（如「資料工程師」、「終端用戶」、「審查者」）
   - **流**：何序動作構成工作流？（如「攝入 → 驗 → 轉 → 存」）
3. 對各發現，分類為：
   - **本質**：解此問題之任何實作中皆會有
   - **偶然**：專於此實作之技術選擇
4. 產**化驗報告**：含領域、動詞、角色、流之表，含本質或偶然標記

**預期：** 項目之概念地圖，讀如領域詞彙表，非代碼導覽。不諳技術棧者亦可由此報告悉項目所為。

**失敗時：** 若代碼庫不透（重元編程、生成代碼或混淆），偏倚測試與文件勝於源碼。若無測試，讀提交訊息以悉其意。

### 步驟三：冥想——釋實作偏見

止以清因讀碼而生之認知錨定。

1. 注意何框架、語言或架構模式主導汝之心智模型——標之
2. 釋對「如何」之執：「此項目用 React」變為「此項目有用戶介面層」。「此用 PostgreSQL」變為「此有持久結構儲存」。
3. 對化驗報告之每發現，行礦石測試：
   - 「整合外部資料源」——可存於任何處乎？是 → 金
   - 「設 Axios 攔截器」——可存於任何處乎？否 → 矸
4. 將未過礦石測試之發現於更高抽象層重寫
5. 若多視角有助，可由此等鏡片觀項目：
   - **考古學家**：代碼結構揭其創者心智模型之何？
   - **生物學家**：可複製之基因組為何，特定表型為何？
   - **音樂理論家**：形式（奏鳴曲、迴旋曲）為何，特定音符為何？
   - **製圖師**：何抽象層次捕有用之拓撲？

**預期：** 化驗報告今無框架特定語。每發現過礦石測試。概念覺可攜——可施於任何語言或框架之項目。

**失敗時：** 若偏見持（發現一直引特定技術），試反問：「若此項目以全異之棧重寫，何概念可存？」唯彼乃金。

### 步驟四：熔——分金與渣

核心提取步驟。將每本質概念分類為技能、代理或團隊。

1. 對自純化之化驗報告中之每本質概念定其類型：

```
Classification Criteria:
+--------+----------------------------+----------------------------+----------------------------+
| Type   | What to Look For           | Naming Convention          | Test Question              |
+--------+----------------------------+----------------------------+----------------------------+
| SKILL  | Repeatable procedures,     | Verb-first kebab-case:     | "Could an agent follow     |
|        | workflows, transformations | validate-input,            | this as a step-by-step     |
|        | with clear inputs/outputs  | deploy-artifact            | procedure?"                |
+--------+----------------------------+----------------------------+----------------------------+
| AGENT  | Persistent roles, domain   | Noun/role kebab-case:      | "Does this require ongoing |
|        | expertise, judgment calls, | data-engineer,             | context, expertise, or a   |
|        | communication styles       | quality-reviewer           | specific communication     |
|        |                            |                            | style?"                    |
+--------+----------------------------+----------------------------+----------------------------+
| TEAM   | Multi-role coordination,   | Group descriptor:          | "Does this need more than  |
|        | handoffs, reviews,         | pipeline-ops,              | one distinct perspective   |
|        | parallel workstreams       | review-board               | to accomplish?"            |
+--------+----------------------------+----------------------------+----------------------------+
```

2. 對每提取之元素：
   - 賦**一般化名**——非項目特有。「UserAuthService」變為 `identity-manager`（代理）。「deployToAWS()」變為 `deploy-artifact`（技能）。
   - 寫**一行描述**，於不知源項目下亦合理
   - 註其所源之**源概念**（為可追蹤而非為複製）
   - 再行一次礦石測試

3. 警常見分類錯誤：
   - 非每函數皆技能——尋**程序**而非個別操作
   - 非每模組皆代理——尋須**判斷**之角色
   - 非每協作皆團隊——尋有不同專長之**協調模式**
   - 多數項目產三至八技能、二至四代理、零至二團隊。若有二十以上，提取過細。

**預期：** 已分類之清單，每項有類型（技能、代理、團隊）、一般化名與一行描述。無項引源項目之特定技術、API 或資料結構。

**失敗時：** 若分類含糊（此為技能或代理？），問：「此關於**做某事**（技能）或**為做事之人**（代理）？」技能為食譜，代理為廚。仍不明則預設為技能——技能後易組合。

### 步驟五：癒——驗提取品質

評提取是否誠——既不過多亦不過少。

1. **過度提取檢查**：讀每提取定義並問：
   - 有人可由此重建原項目之專有邏輯乎？→ 細節過多
   - 是否引特定函式庫、API、資料庫綱要或檔路徑？→ 仍為矸
   - 此為完整實作程序或概念層之草圖？→ 宜為草圖

2. **不足提取檢查**：唯顯提取之定義（無源項目）並問：
   - 有人可悉啟此者為何**種**項目乎？→ 應為是
   - 定義是否捕項目本質？→ 應為是
   - 是否有重要項目能力未代表？→ 應為否

3. **一般化檢查**：對每定義：
   - 名於異棧亦合理乎？→ 應為是
   - 描述為框架不可知乎？→ 應為是
   - 此定義可益於完全異域之項目乎？→ 理想為是

4. **平衡檢查**：審提取比例：
   - 三至八技能、二至四代理、零至二團隊為聚焦項目之典型
   - 總提取少於三示提取不足
   - 總多於十五示過度提取或一般化不足

**預期：** 信提取於恰當之抽象層。每定義為可長於異土之種，非僅活於原園之插枝。

**失敗時：** 若過度提取，升抽象層——合特定技能為更廣者，併似代理為單一角色。若提取不足，回步驟二增抽樣。若一般化檢查失敗，剝技術引用並重寫描述。

### 步驟六：鑄——傾金入模

產 agentskills.io 標準格式之輸出文件。

1. 對每提取之**技能**，寫骨架定義：

```yaml
# Skill: [generalized-name]
name: [generalized-name]
description: [one-line, framework-agnostic]
domain: [closest domain from the 52 existing domains, or suggest a new one]
complexity: [basic/intermediate/advanced]
# Concept-level procedure (3-5 steps, NOT full implementation):
# Step 1: [high-level action]
# Step 2: [high-level action]
# Step 3: [high-level action]
# Derived from: [source concept in original project]
```

2. 對每提取之**代理**，寫骨架定義：

```yaml
# Agent: [role-name]
name: [role-name]
description: [one-line purpose]
tools: [minimal tool set needed]
skills: [list of extracted skills this agent would carry]
# Derived from: [source role/module in original project]
```

3. 對每提取之**團隊**，寫骨架定義：

```yaml
# Team: [group-name]
name: [group-name]
description: [one-line purpose]
lead: [lead agent from extracted agents]
members: [list of member agents]
coordination: [hub-and-spoke/sequential/parallel/adaptive]
# Derived from: [source workflow/process in original project]
```

4. 將所有提取彙為**化驗報告**——一文件含技能、代理與團隊段及總覽表

**預期：** 含所有提取定義之結構化報告，遵 agentskills.io 格式。每定義為骨架（概念層而非實作層），可作 `create-skill`、`create-agent` 或 `create-team` 之起點以充實之。

**失敗時：** 若輸出超十五項，依中心性排序——留最特於此項目領域之概念。多數項目皆有之通用概念（如「manage-configuration」）宜棄，除非有獨特轉折。

### 步驟七：回火——終驗

驗完整提取並產總覽。

1. 計提取數：N 技能、N 代理、N 團隊
2. 評涵蓋：是否跨項目主要領域？
3. 驗獨立性：讀每定義而**無**源項目上下文——其能獨立乎？
4. 對全集再行一次礦石測試：

```
Temper Assessment:
+-----+---------------------------+----------+------------------------------------+
| #   | Name                      | Type     | Ore Test Result                    |
+-----+---------------------------+----------+------------------------------------+
| 1   | [name]                    | skill    | PASS / FAIL (reason)               |
| 2   | [name]                    | agent    | PASS / FAIL (reason)               |
| ... | ...                       | ...      | ...                                |
+-----+---------------------------+----------+------------------------------------+
```

5. 產最終總覽：
   - 總提取（技能 / 代理 / 團隊）
   - 涵蓋評估（哪些項目領域已代表）
   - 信心等級（高 / 中 / 低）含理由
   - 建議下一步：哪些提取定義已可先充實

**預期：** 經驗證之化驗報告含總覽表、信心評估與可行下一步。報告自足——未見源項目者讀之亦可悉提取之概念。

**失敗時：** 若超百分之二十之項未過終礦石測試，回步驟四（熔）並於更高抽象層重提。若涵蓋低於辨識領域之百分之六十，回步驟二（化驗）並增抽樣。

## 驗證清單

- [ ] 勘探報告涵項目結構、語言、規模與聲明目的
- [ ] 化驗辨領域、動詞、角色、流並含本質或偶然分類
- [ ] 冥想檢查點清實作偏見——輸出無框架特定語
- [ ] 每提取元素過礦石測試（本質非實作細節）
- [ ] 技能以動詞名，代理以名詞名，團隊以群體描述名
- [ ] 所有名一般化——無項目特定引用
- [ ] 提取數於典型範圍（總五至十五，非一亦非三十）
- [ ] 輸出定義遵 agentskills.io 格式（前置元資料加各段）
- [ ] 過度提取與不足提取檢查皆過
- [ ] 終回火評估含計數、涵蓋、信心與下一步
- [ ] 完整化驗報告於無源項目存取下亦可解

## 常見陷阱

- **鏡映目錄結構**：每源檔產一技能而非提橫切概念。金宜映項目之**概念**結構，非其檔系統。二十檔之項目未必有二十技能。
- **崇拜框架**：提「configure-nextjs-api-routes」而非「define-api-endpoints」。剝框架，留模式。礦石測試可捕之：「無 Next.js 此可存乎？」若否，則為矸。
- **角色膨脹**：每模組造一代理。多數項目有二至五真正須不同專長之角色，非二十。尋**判斷**與**溝通風格**之異，非僅功能之異。
- **略礦石測試**：最大失敗模式。每輸出須過：「此概念可存於完全異實作乎？」若引特定函式庫、API 或資料綱要，則為渣，非金。
- **產實作指南**：提取之技能應為**概念層**之草圖（三至五高層步驟），非完整實作程序。其為待 `create-skill` 充實之種子，非成品。五十步之提取為複製，非本質。
- **名未夠一般化**：「UserAuthService」為類名，非概念。「identity-manager」為角色。「manage-user-identity」為技能。自特定一般化至普遍。
- **忽協調模式**：團隊最難提，因協調常隱。尋代碼審查工作流、部署管線、系統間之資料交接與審批鏈——此等揭團隊結構。

## 相關技能

- `athanor` — 當金顯項目須變化而非僅本質提取時
- `chrysopoeia` — 代碼層之價值提取；金於代碼之上之概念層運作
- `transmute` — 將提取之概念於領域或範式間轉換
- `create-skill` — 將提取之技能草圖充實為完整 SKILL.md 實作
- `create-agent` — 將提取之代理草圖充實為完整代理定義
- `create-team` — 將提取之團隊草圖充實為完整團隊組成
- `observe` — 勘探階段揭未熟之領域時行更深觀察
- `analyze-codebase-for-mcp` — 互補：金提概念，analyze-codebase-for-mcp 提工具表面
- `review-codebase` — 互補：金提本質，review-codebase 評品質
