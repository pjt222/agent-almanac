---
name: metal
locale: wenyan-ultra
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

# 金

提庫之概念 DNA——其角、程、合作模——成泛 agentskills.io 定。如取貴金於礦，分項目之**是**（質）與**為**（施），生可用之技、代理、團定，捕項目之組基因不複其碼。

## 用

- 入新庫前先繪概念架
- 由既項目啟代理系——將隱流轉為顯之技/代理/團定
- 研項目之組 DNA 以交相作他項目
- 仿參施作技/代理/團庫不襲之
- 解項目之構顯創者之心模與域識

## 入

- **必**：庫或項目根之徑
- **必**：旨陳——何為提質？（入、啟、研、交相）
- **可**：焦域——項目所注之區（默：全）
- **可**：出深——`survey`（探+析）、`extract`（全程）、`report`（提+書報）（默：`extract`）
- **可**：提上限——技+代理+團之總帽（默：15）

## 礦試

提之中質：

> **此概念可存於異施乎？**
>
> 若**是**——乃**金**（質）。提之。
> 若**否**——乃**渣**（施末）。棄之。

例：氣象應之概念「合外數源」乃金——施於諸取三方數之項目。「析 OpenWeatherMap v3 JSON 答」乃渣——專於一 API。

提之技述任之**類**，非具體例。提之代理述**角**非人。提之團述**合作模**非組圖。

## 行

### 一：探——測礦體

無評探庫構。先繪地後採。

1. Glob 樹以解項目之形：
   - 源目及其組模（按特、按層、按域）
   - 配檔：`package.json`、`DESCRIPTION`、`setup.py`、`Cargo.toml`、`go.mod`、`Makefile`
   - 文：`README.md`、`CLAUDE.md`、`CONTRIBUTING.md`、架構文
   - CI/CD：`.github/workflows/`、`Dockerfile`、署配
   - 測目及其構
2. 讀項目自述（README、包單）以解所稱旨
3. 按類/語計檔以衡範與識主技
4. 識項目之界——始終、依何、供何
5. 成**探報**：

```
Project: [name]
Declared Purpose: [from README/manifest]
Languages: [primary, secondary]
Size: [file count, approx LOC]
Shape: [monorepo/library/app/framework/docs]
External Surface: [CLI/API/UI/library exports/none]
```

得：實測——何在、多大、自稱為何。未分類評。報如地測非評。

敗：無 README 或單→由目名、檔容、測述推旨。項目過大（>1000 源檔）→縮至最活目（用 git log 頻或 README 引）。

### 二：析——分析成分

讀代表檔以解項目於概念之**為**。

1. 取 5-10 代表檔於不同區——非盡而多元：
   - 入點（主檔、路由、命令）
   - 核心邏（最引或最被引之模）
   - 測（顯欲行勝施）
   - 配（顯運憂與署境）
2. 各取區，識：
   - **域**：項目觸何題區？（如「認證」「數轉」「報」）
   - **動**：項目行何？（如「驗」「轉」「署」「告」）
   - **角**：碼服何人或系？（如「數工」「終用」「審」）
   - **流**：何序成流？（如「攝→驗→轉→存」）
3. 各見類為：
   - **本**：諸解此題之施皆有
   - **偶**：專於本施技之擇
4. 成**析報**：域、動、角、流之表含本/偶標

得：項目之概念圖如域辭典，非碼漫遊。不知技堆者讀之亦解項目之為。

敗：碼隱（重元編、生碼、混淆）→倚測與文非源碼。無測→讀提交以見意。

### 三：禪——釋施偏

停以清讀碼之認錨。

1. 識何架、語、模主吾心模——標之
2. 釋於**何為**：「用 React」變「有 UI 層」。「用 PostgreSQL」變「有持久結構存」。
3. 各析報之見施礦試：
   - 「合外數源」——可存任處乎？是→金
   - 「配 Axios 攔」——可存任處乎？否→渣
4. 礦試敗者→更高抽象重書
5. 多視角助→以諸鏡視項目：
   - **考古**：碼構顯創者之心模何？
   - **生物**：可複基因 vs 具表？
   - **樂理**：式（奏鳴、輪旋）vs 具音？
   - **製圖**：何抽象捕有用之拓？

得：析報今無架語。諸見過礦試。概念可移——可施於他語他架之項目。

敗：偏存（見常引具技）→反問：「若此項目重書於異堆，何概念存？」唯彼為金。

### 四：煉——分金渣

提之核步。各本概念分為技、代理、團。

1. 各純析報之本概念，定其類：

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

2. 各提元：
   - 賦**泛名**——非項目專。「UserAuthService」變 `identity-manager`（代理）。「deployToAWS()」變 `deploy-artifact`（技）。
   - 書**一句述**不知源亦合
   - 注**源概念**（為跡而非複）
   - 末施礦試

3. 防常分類誤：
   - 非各函皆技——尋**程**非單動
   - 非各模皆代理——尋需評斷之**角**
   - 非各合作皆團——尋有專之**合作模**
   - 多項目得 3-8 技、2-4 代理、0-2 團。逾 20→提過細。

得：分類冊各含類（技/代理/團）、泛名、一句述。無項引具技、API、結構。

敗：分類含糊（技乎代理乎？）問：「此關**為**（技）抑**為人**（代理）？」技乃方；代理乃廚。仍不明→默為技——技後合易。

### 五：癒——驗提質

評提誠否——非過非欠。

1. **過提察**：讀各提定問：
   - 可由此復源項目之專邏乎？→過詳
   - 引具庫、API、數模、徑乎？→仍渣
   - 全施程乎或概念草？→宜草

2. **欠提察**：唯顯提定（無源項目）問：
   - 可解何**類**項目啟之乎？→宜是
   - 定捕項目本性乎？→宜是
   - 主能未現乎？→宜否

3. **泛察**：各定：
   - 名於異堆亦合乎？→宜是
   - 述無架乎？→宜是
   - 可助於異域之項目乎？→理想是

4. **衡察**：審提比：
   - 焦項目典：3-8 技、2-4 代理、0-2 團
   - 總少於 3→欠提
   - 總多於 15→過提或泛不足

得：信於正抽象層。各定為種可長於異土，非枝唯活原園。

敗：過提→升抽象——合具技為廣，合似代理為一角。欠提→返二取更多檔。泛敗→去技引重書述。

### 六：鑄——澆金成形

成 agentskills.io 標出文。

1. 各提**技**書骨定：

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

2. 各提**代理**書骨定：

```yaml
# Agent: [role-name]
name: [role-name]
description: [one-line purpose]
tools: [minimal tool set needed]
skills: [list of extracted skills this agent would carry]
# Derived from: [source role/module in original project]
```

3. 各提**團**書骨定：

```yaml
# Team: [group-name]
name: [group-name]
description: [one-line purpose]
lead: [lead agent from extracted agents]
members: [list of member agents]
coordination: [hub-and-spoke/sequential/parallel/adaptive]
# Derived from: [source workflow/process in original project]
```

4. 編諸提入**析報**——一文含技、代理、團節，加摘表

得：結構報含諸提定於 agentskills.io 式。各定為骨（概念非施），可作 `create-skill`、`create-agent`、`create-team` 之始。

敗：出逾 15→按中性排——留最專於本項目域之概念。常項目皆有之概念（如「manage-configuration」）若無異變則棄。

### 七：淬——末驗

驗全提且成摘。

1. 計提：N 技、N 代理、N 團
2. 評覆：跨項目主域乎？
3. 驗獨立：讀各定**無**源項目脈絡——可獨立乎？
4. 末施礦試於全集：

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

5. 成末摘：
   - 提總（技/代理/團）
   - 覆評（何項目域已現）
   - 信級（高/中/低）含理
   - 建下步：何提定先擴

得：驗析報含摘表、信評、可行下步。報自足——未見源項目者亦可讀解所提概念。

敗：逾兩成提敗末礦試→返四（煉）以更高抽象再提。覆少於識域六成→返二（析）取更多檔。

## 驗

- [ ] 探報含項目構、語、量、所稱旨
- [ ] 析識域、動、角、流含本/偶分類
- [ ] 禪檢清施偏——出無架語
- [ ] 諸提元過礦試（質非施末）
- [ ] 技以動名、代理以名名、團以群描述名
- [ ] 諸名泛——無項目專引
- [ ] 提數於典範（5-15 總非 1 非 30）
- [ ] 出定循 agentskills.io 式（前+節）
- [ ] 過提與欠提察皆過
- [ ] 末淬評含計、覆、信、下步
- [ ] 全析報無源亦可解

## 忌

- **鏡目構**：每源檔一技而非提橫切概念。金宜映項目之**概念**構非檔系。20 檔項目非 20 技
- **拜架**：提「configure-nextjs-api-routes」而非「define-api-endpoints」。剝架，留模。礦試捕之：「無 Next.js 可存乎？」若否，乃渣
- **角脹**：每模一代理。多項目有 2-5 真角需異專，非 20。尋**評斷**與**溝通**異，非僅功能異
- **略礦試**：最大敗模。各出必過：「此概念可存於異施乎？」引具庫、API、數模→渣非金
- **生施指**：提技宜**概念**草（3-5 高層步）非全施程。乃由 `create-skill` 養之種，非成品。50 步提乃複非質
- **泛名不足**：「UserAuthService」乃類名非概念。「identity-manager」乃角。「manage-user-identity」乃技。由具至共
- **忽合作模**：團最難提因合作常隱。尋碼審流、署管、系間數遞、批准鏈——彼顯團構

## 參

- `athanor`
- `chrysopoeia`
- `transmute`
- `create-skill`
- `create-agent`
- `create-team`
- `observe`
- `analyze-codebase-for-mcp`
- `review-codebase`
