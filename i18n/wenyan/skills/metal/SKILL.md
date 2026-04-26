---
name: metal
locale: wenyan
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

提庫之概念精——其角、法、協模——作泛之 agentskills.io 定。如自礦提精金，此技別項之「為何」（精）與「行何」（施）而生可復用之技、人、團定，捕項之組基因而不複其碼。

## 用時

- 入新庫，欲入碼前先繪其概念構
- 自舊項啟代理系——隱流變顯之技/人/團定
- 察項組基因以雜交至他項
- 取舊項為靈而不抄之，造技/人/團庫
- 由項構察其作者心模與域識

## 入

- **必**：庫或項根之徑
- **必**：的述——何故提精？（入門、啟、研、雜交）
- **可選**：注域——項中所注之區（默：全）
- **可選**：出深——`survey`（探勘察評）、`extract`（全法）、`report`（提加文報）（默：`extract`）
- **可選**：提之最多——技+人+團之頂（默：15）

## 礦試

提之中質判：

> **此概念可存於完全不同之施乎？**
>
> 若是——乃 **金**（精）。提之。
> 若否——乃 **石**（施詳）。棄之。

例：氣象應用之「集外數源」乃金——施於任引第三方數之項。然「解 OpenWeatherMap v3 JSON 應」乃石——專於一 API。

提技當述任之 **類**，非具例。提人當述 **角**，非人。提團當述 **協模**，非組圖。

## 法

### 第一步：探勘——測礦體

無判測庫構。掘前繪地。

1. 滑目樹以解項形：
   - 源目及其組模（依特、依層、依域）
   - 配檔：`package.json`、`DESCRIPTION`、`setup.py`、`Cargo.toml`、`go.mod`、`Makefile`
   - 文檔：`README.md`、`CLAUDE.md`、`CONTRIBUTING.md`、構文
   - CI/CD：`.github/workflows/`、`Dockerfile`、署配
   - 試目及其構
2. 讀項自述（README、包單）以解其宣的
3. 依類/語算檔以衡範識主技
4. 識項界——何始何終，何依何供
5. 生 **探勘報**：

```
Project: [name]
Declared Purpose: [from README/manifest]
Languages: [primary, secondary]
Size: [file count, approx LOC]
Shape: [monorepo/library/app/framework/docs]
External Surface: [CLI/API/UI/library exports/none]
```

**得：** 事實察——何在此、幾大、項稱何。尚無分判。報如地質察，非評。

**敗則：** 若庫無 README 或單，由目名、檔內容、試述推的。若項太大（逾千源檔），縮範至最活之目（用 git log 頻或 README 引）。

### 第二步：察評——析其組

讀代表檔以解項概念層所行。

1. 自項各區取 5-10 代表檔——非詳，乃多：
   - 入點（主檔、路由、CLI 命）
   - 核心邏輯（最被引或引最多之模）
   - 試（其示意行較施清）
   - 配（示運慮與署脈絡）
2. 每樣識：
   - **域**：項及何題區？（如「身證」、「數變」、「報」）
   - **動**：項行何動？（如「驗」、「變」、「署」、「告」）
   - **角**：碼服何人或系？（如「數工」、「終用」、「審者」）
   - **流**：何動序成工作流？（如「入→驗→變→存」）
3. 每發現分為：
   - **本**：解此題之任施皆有之
   - **偶**：專於此施所選技
4. 生 **察評報**：域、動、角、流之表附本/偶籤

**得：** 項概念地圖如域辭，非碼遊。不熟此技堆者由此報當解項所行。

**敗則：** 若庫不透（重元編、生碼、混淆），倚試與文檔而非源碼。若無試，讀提交信為意。

### 第三步：冥——釋施偏

停以清讀碼之認知錨。

1. 察何框、語、構模主吾心模——標之
2. 釋於「如何」之執：「項用 React」變「項有用者界面層」。「用 PostgreSQL」變「有持結構儲」。
3. 對察評報每發現施礦試：
   - 「集外數源」——可存任處乎？是 → 金
   - 「設 Axios 攔截器」——可存任處乎？否 → 石
4. 重寫不過礦試之發現於更高抽象
5. 若多視助，由此鏡視項：
   - **考古**：碼構示作者何心模？
   - **生物**：何為可複基因，何為具表型？
   - **樂理**：何為形（奏鳴、迴旋），何為具音？
   - **製圖**：何抽象層捕有用拓撲？

**得：** 察評報今脫框語。每發現過礦試。概念可移——可施於任語任框之項。

**敗則：** 若偏持（發現持引具技），試反：「若項全用別堆重寫，何概念存？」唯彼為金。

### 第四步：冶——別金與渣

提之核心。每本概念分為技、人、團。

1. 對純察評報之每本概念定其類：

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

2. 每提元：
   - 賦 **泛名**——非項專。「UserAuthService」變 `identity-manager`（人）。「deployToAWS()」變 `deploy-artifact`（技）
   - 寫一行述，不知源項仍合
   - 記其源概念（為跡，非複）
   - 末一施礦試
3. 防分類常誤：
   - 非每函皆技——尋 **法**，非單操
   - 非每模皆人——尋 **角** 需判
   - 非每協皆團——尋 **協模** 含異專
   - 多項生 3-8 技、2-4 人、0-2 團。若逾 20，提太細

**得：** 分類錄，每項有類（技/人/團）、泛名、一行述。無項引源項之具技、API、數構。

**敗則：** 若分類含混（技乎人乎？），問：「此關 **行某事**（技）乎，**為某人行事**（人）乎？」技為方，人為廚。仍不明，默為技——技後易合。

### 第五步：癒——驗提之質

評提誠否——非過、非不及。

1. **過提察**：讀每提定問：
   - 由此可重建源項之專邏輯乎？→ 詳太多
   - 此引具庫、API、庫式、檔徑乎？→ 仍石
   - 為全施法乎概念草乎？→ 當為草

2. **不及提察**：唯顯提定（無源項）問：
   - 由此可解何 **類** 項所靈？→ 當是
   - 諸定捕項本性乎？→ 當是
   - 主項能未表乎？→ 當否

3. **泛察**：每定：
   - 名於別技堆仍合乎？→ 當是
   - 述脫框乎？→ 當是
   - 此定可有用於完全別域之項乎？→ 理當是

4. **衡察**：審提比：
   - 3-8 技、2-4 人、0-2 團典於一聚項
   - 總提少於三疑提不及
   - 總多於十五疑過提或泛不足

**得：** 信提居宜抽象層。每定為種子可生於別土，非枝唯活原園。

**敗則：** 若過提，升抽象——合具體技為廣，並似人為一角。若提不足，返第二步取更多檔。若泛察敗，剝技引而重述。

### 第六步：鑄——金入形

生 agentskills.io 標出文。

1. 每提 **技**，寫骨定：

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

2. 每提 **人**，寫骨定：

```yaml
# Agent: [role-name]
name: [role-name]
description: [one-line purpose]
tools: [minimal tool set needed]
skills: [list of extracted skills this agent would carry]
# Derived from: [source role/module in original project]
```

3. 每提 **團**，寫骨定：

```yaml
# Team: [group-name]
name: [group-name]
description: [one-line purpose]
lead: [lead agent from extracted agents]
members: [list of member agents]
coordination: [hub-and-spoke/sequential/parallel/adaptive]
# Derived from: [source workflow/process in original project]
```

4. 編諸提為 **察評報**——一文含技、人、團章及要表

**得：** 結構報含諸提定於 agentskills.io 式。每定為骨（概念層，非施層）可為 `create-skill`、`create-agent`、`create-team` 之始而豐之。

**敗則：** 若出逾 15 項，依中性序——留最獨於此項域之概念。多項皆有之泛念（如「manage-configuration」）宜棄，除有奇轉。

### 第七步：淬——末驗

驗全提而生要。

1. 算提：N 技、N 人、N 團
2. 評蓋：包項主域乎？
3. 驗獨：讀每定 **無** 源項脈絡——獨立乎？
4. 對全集末施礦試：

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

5. 生末要：
   - 提總（技/人/團）
   - 蓋評（何項域已表）
   - 信度（高/中/低）附理
   - 建下步：何提宜先豐

**得：** 已驗察評報附要表、信評、可行下步。報自含——未見源項者讀亦解提概念。

**敗則：** 若逾兩成項末施礦試敗，返第四步（冶）以更高抽象重提。若蓋低於六成所識域，返第二步（察評）取更多檔。

## 驗

- [ ] 探勘報含項構、語、範、宣的
- [ ] 察評識域、動、角、流附本/偶分類
- [ ] 冥節點清施偏——出無框專語
- [ ] 每提元過礦試（精，非施詳）
- [ ] 技以動名，人以名名，團以群述
- [ ] 諸名皆泛——無項專引
- [ ] 提數於典範（5-15 總，非一非三十）
- [ ] 出定循 agentskills.io 式（前事+章）
- [ ] 過提與不及提察皆過
- [ ] 末淬評含數、蓋、信、下步
- [ ] 全察評報無源項可解

## 陷

- **鏡目構**：每源檔生一技而非提橫切念。金當映項 **概念** 構，非檔系。二十檔項非有二十技
- **拜框**：提「configure-nextjs-api-routes」而非「define-api-endpoints」。剝框留模。礦試捕之：「無 Next.js 此可存乎？」否則石
- **角脹**：每模生人。多項有 2-5 真角需異專，非二十。尋 **判** 與 **溝模** 異，非僅功異
- **略礦試**：最大失模。每出當過：「此概念可存於完全別施乎？」若引具庫、API、數式則渣非金
- **生施指**：提技當為 **概念** 草（3-5 高層步），非全施法。為種待 `create-skill` 豐，非成品。五十步提乃複，非精
- **泛名不足**：「UserAuthService」乃類名，非念。「identity-manager」乃角。「manage-user-identity」乃技。由具至泛
- **忽協模**：團最難提因協常隱。尋碼審流、署管、系間數遞、批鏈——此示團構

## 參

- `athanor` — 金示項需變而非僅提精時
- `chrysopoeia` — 碼層提值；金作於碼上之概念層
- `transmute` — 提念於域或範間轉
- `create-skill` — 豐提技草為全 SKILL.md 施
- `create-agent` — 豐提人草為全人定
- `create-team` — 豐提團草為全團組
- `observe` — 探勘示陌生域時之深察
- `analyze-codebase-for-mcp` — 補：金提念，analyze-codebase-for-mcp 提工具面
- `review-codebase` — 補：金提精，review-codebase 評質
