---
name: unleash-the-agents
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Launch all available agents in parallel waves for open-ended hypothesis
  generation on problems where the correct domain is unknown. Use when facing
  a cross-domain problem with no clear starting point, when single-agent
  approaches have stalled, or when diverse perspectives are more valuable
  than deep expertise. Produces a ranked hypothesis set with convergence
  analysis and adversarial refinement.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob Agent ToolSearch TeamCreate TaskCreate TaskUpdate TaskList SendMessage
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: swarm
  complexity: advanced
  language: multi
  tags: swarm, parallel, hypothesis-generation, multi-agent, brainstorming, convergence
---

# 縱諸臣

於正領未明之疾，並波而召諸臣以生開放之假設。各臣以其域之鏡而思——卡巴拉者以數值術尋形，武術者擬條件之分，靜觀者居數而識其結。獨立之見之合，乃假設有益之主信。

## 用時

- 跨域之疾，正法未明
- 單臣或單域已滯而無信
- 疾賴真正多元之見（非徒增算）
- 需生假設，非執行（執行用團）
- 重要之決，遺非顯之角者其代真重

## 入

- **必要**：問題之要——疾之清述、五以上之具例、何為解
- **必要**：驗之法——如何試假設正否（程驗、家評、或空模較）
- **可選**：臣之子集——納或排之臣（默：諸已錄之臣）
- **可選**：波之大小——每波之臣數（默：10）
- **可選**：出之式——應之結構模（默：假設+理+信+可試之測）

## 法

### 第一步：備其要

書一要而諸臣無論何域皆能解之。含：

1. **問題之述**：所求者何（一二句）
2. **例**：五以上具入/出之例或數點（多益佳——三於諸臣為少而難尋形）
3. **已知之限**：所已知者、所已試者
4. **成之準**：如何識正之假設
5. **出之模**：應之精式

```markdown
## Brief: [Problem Title]

**Problem**: [1-2 sentence statement]

**Examples**:
1. [Input] → [Output]  (explain what's known)
2. [Input] → [Output]
3. [Input] → [Output]
4. [Input] → [Output]
5. [Input] → [Output]

**Already tried**: [List failed approaches to avoid rediscovery]

**Success looks like**: [Testable criterion]

**Respond with**:
- Hypothesis: [Your proposed mechanism in one sentence]
- Reasoning: [Why your domain expertise suggests this]
- Confidence: [low/medium/high]
- Testable prediction: [If my hypothesis is correct, then X should be true]
```

得：要自足——臣得此文即有思之所需。

敗則：不能述五例或驗法者，疾未備為多臣之問。先縮其範。

### 第二步：謀其波

列諸可得之臣，分為約十之波。前二波之序無關；後波之間，波際知識之注益其果。

```bash
# List all agents from registry
grep '  - id: ' agents/_registry.yml | sed 's/.*- id: //' | shuf
```

授臣於波。初謀四波——或不需盡用（見第四步之早止）。

| 波 | 臣 | 要之變 |
|------|--------|---------------|
| 1-2 | 20 臣 | 標準之要 |
| 3 | 10 臣 + advocatus-diaboli | 要 + 新興共識 + 對辯之挑 |
| 4+ | 各 10 臣 | 要 + 「X 已驗。專注邊例與敗。」 |

得：波授之表，諸臣皆有所屬。納 `advocatus-diaboli` 於第三波（非後），俾對辯之過影後波。

敗則：可得之臣少於 20 者，減為二三波。十臣亦可，唯合之信稍弱。

### 第三步：發其波

每波並發為臣。用 `sonnet` 模以省（其值在見之多元，非各深）。

#### 法甲：TeamCreate（推為全縱）

用 Claude Code 之 `TeamCreate` 立有任之追之合作團。TeamCreate 為延遲之具——先以 `ToolSearch("select:TeamCreate")` 取之。

1. 立團：
   ```
   TeamCreate({ team_name: "unleash-wave-1", description: "Wave 1: open-ended hypothesis generation" })
   ```
2. 每臣以 `TaskCreate` 立一任，含要與域之框
3. 用 `Agent` 具發每臣為團友，`team_name: "unleash-wave-1"`，`subagent_type` 設為臣之類（如 `kabalist`、`geometrist`）
4. 以 `TaskUpdate` 之 `owner` 授任於團友
5. 以 `TaskList` 監進——團友自畢自記之
6. 波間，以 `SendMessage({ type: "shutdown_request" })` 閉當前團，立次團而更要（第四步）

此給內合作：共任列追何臣已應，團友可訊以續，領以任授管理波之轉。

#### 法乙：原 Agent 之發（簡，為小行）

每波之臣以要與域之框發之：

```
Use the [agent-name] agent to analyze this problem through your domain expertise.
[Paste the brief]
Think about this from your specific perspective as a [agent-description].
[For non-technical agents: add a domain-specific framing, e.g., "What patterns
does your tradition recognize in systems that exhibit this kind of threshold behavior?"]
Respond exactly in the requested format.
```

一波之諸臣以 Agent 具並發，`run_in_background: true`。俟波畢方發次波（俾第四步之波際知識注）。

#### 二法之擇

| | TeamCreate | 原 Agent |
|---|---|---|
| 宜於 | 第三層全縱（40+ 臣）| 第二層板（5-10 臣）|
| 合作 | 任列、訊、屬 | 發後不顧、手聚 |
| 波際交接 | 任狀承 | 須手追 |
| 開銷 | 高（每波設團）| 低（每臣一具呼）|

得：每波二至五分內返約十結構之應。臣不應或出格者記之而不阻管線。

敗則：一波過半敗者，察要之清。常因：出之模歧，或例不足以使外域之臣思之。

### 第四步：注波際知識（並評早止）

一二波後，發次波之前，取其新興之信。

1. 掃已畢諸波之應，求重現之題
2. 識最常之假設族（合之信）
3. **察早止之閾**：頂族二十臣後已逾空模期之三倍者，信強矣。謀第三波為對辯+精煉之波，並考其後止之
4. 為次波更其要：

```markdown
**Update from prior waves**: [N] agents independently proposed [hypothesis family].
Build on this — what explains the remaining cases where this hypothesis fails?
Do NOT simply restate this finding. Extend, challenge, or refine it.
```

**早止之囑**：非每縱皆需諸臣。已定之疾域（如碼庫之析）合常於 30-40 臣穩。抽象或開放之疾（如未知數學之變），全名冊益，蓋正域實不可預也。每波後察合——頂族之數與空模比已平者，續波之益遞減。

此免重發（後波獨立再得早波所得），導後臣於疾之邊。

得：後波生更精細、有針之假設，補新興共識之缺。

敗則：二波後無合者，疾或過寬。考縮其範或多備例。

### 第五步：聚而去重

諸波畢後，聚諸應於一文。以族聚假設而去重：

1. 取諸假設之述
2. 以機制聚（非以辭——「mod 94 之模算」與「Z_94 之循環群」乃同族）
3. 計每族之獨立發現之數
4. 依合排之：更多臣獨立發現之族居高

得：以合計排之假設族列，含貢臣與代之可試之測。

敗則：每假設皆獨（無合）者，信噪比過低。或疾需多例，或臣需更緊之出之式。

### 第六步：對空模而驗

試頂假設於空模以確合有意，非共訓之偽。

- **程驗**：假設出可試之式或法者，於留出之例行之
- **空模**：估 N 臣偶合於同假設族之概（如有 K 合理族，隨機合概約 N/K）
- **閾**：合逾空模期之三倍者，信為有意

得：頂假設族顯逾偶然之合，並/或過程驗。

敗則：頂假設驗敗者，察次族。皆敗者，疾或需異法（更深單家析、多數、或重設例）。

### 第七步：對辯之精煉

**宜於第三波，非合成之後。** 第三波納 `advocatus-diaboli`（與波際知識注並）較獨立後對辯之過更效。早挑使第四+波對挑而精，非堆於未挑之共識上。

第三波已含對辯者，此步為終察。否（如諸波無之）發 `advocatus-diaboli`（或 `senior-researcher`）今。為結構之過，用 `TeamCreate` 立評團，二臣並對共識：

```
Here is the consensus hypothesis from [N] independent agents:
[Hypothesis]
[Supporting evidence and convergence stats]

Your job: find the strongest counterarguments. Where does this fail?
What alternative explanations are equally consistent with the evidence?
What experiment would definitively falsify this hypothesis?
```

得：諸反論、邊例、與證偽之實。假設過對辯之察者，可入合矣。良對辯之過或*部分護*共識——識其設較他更佳雖不完。

敗則：對辯臣得致命之缺者，反饋以入針之續波（第三層+迭模——擇五至十臣最宜對特挑者）。

### 第八步：交於團

縱發疾；團解之。化已驗之假設族為可行之事，立焦團解之。

1. 每已驗假設族立 GitHub 事（用 `create-github-issues` 之術）
2. 依合強與影排之
3. 每事以 `TeamCreate` 立小團：
   - `teams/` 中已定之團合疾域者用之
   - 無合者，默用 `opaque-team`（N 個 shapeshifter，適性授角）——其能應未知形而不需訂製
   - 至少一非技術之臣（如 `advocatus-diaboli`、`contemplative`）——其捕技術臣所漏之施險
   - 階段間用 REST 點以免急促
4. 管線為：**縱 → 分類 → 每事一團 → 解**

得：每假設族對一追之事，有團授之。縱生診斷；團生修。

敗則：團組與疾不合者，重授。Shapeshifter 之臣可研可設而無寫之具——團領須施其碼之囑。

## 驗

- [ ] 諸可得之臣已問（或有理之子集已擇）
- [ ] 應以結構可解之式聚
- [ ] 假設已去重，依獨立合排
- [ ] 頂假設已對空模或程試驗
- [ ] 對辯之過挑共識
- [ ] 終假設含可試之測與已知之限

## 陷

- **要中例少**：臣需五以上之例方尋形。三例則諸臣多以表面對形或模回（以異辭重述要）
- **無驗之路**：無試假設之法者，不能辨信於噪。合僅必要而非足
- **隱喻之應**：域家之臣（mystic、shaman、kabalist）或以富隱喻之理應之，難以程解。出之模納「以可試之式或法述假設」
- **波間之重發**：無波際知識注者，三至七波獨立重發一二波所得。常於波間更要
- **過解合**：43% 合於機制族似深，然察基率。若僅三合理機制族，隨機合約 33%
- **期單族獨大**：抽象之疾（形識、密術）多生一獨大假設族。多維之疾（碼庫析、系設）生諸有效族之廣合——此為期且健，非模之敗
- **非技術臣之泛框**：非技術臣之貢之質依要如何以其域之語框疾。「於此閾你之傳云何系？」生結構之識；泛要無生。投於外域臣之域之框
- **用此為執行**：此模生假設，非施。已驗之假設既得，化為事而交團（第八步）。管線為縱 → 分類 → 每事一團

## 參

- `forage-solutions` — 蟻群最佳化以探解空（互補：較窄範、較深探）
- `build-coherence` — 蜂民主以擇諸競法（用此術後以擇頂假設）
- `coordinate-reasoning` — 痕跡合作以管臣間信流
- `coordinate-swarm` — 廣群合作之模於分散系
- `expand-awareness` — 縮前先放（互補：用為個臣之備）
- `meditate` — 發前清脈絡之噪（推於第一步前）
