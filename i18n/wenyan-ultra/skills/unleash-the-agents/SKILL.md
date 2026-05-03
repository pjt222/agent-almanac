---
name: unleash-the-agents
locale: wenyan-ultra
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

# 放諸客

並波諮諸客以生多假於開疾——客各以己域為鏡：kabalist 以數、武者以條件分支、靜者以坐覓構。多獨視之合，假之有徵也。

## 用

- 跨域而正路未明→用
- 單客或單域已滯→用
- 真多視貴於深專→用
- 須生假，非執行（執行用團）→用
- 高重決而漏不顯角致實損→用

## 入

- **必**：問綱——清述、5+ 例、解之標
- **必**：驗法——如何試假（程驗、專評、空模較）
- **可**：客集——納或排（默：諸註客）
- **可**：波量——每波客數（默 10）
- **可**：出式——應之式（默：假+理+信+可驗預）

## 行

### 一：備綱

書任客可解之綱（無論域）：

1. **問**：欲覓或決何（1-2 句）
2. **例**：5+ 具體入/出例（多佳——3 太少）
3. **已知約**：已知、已試
4. **成標**：何為正假之識
5. **出式**：欲應之確式

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

得：綱自足——客僅得此文亦能推。

敗：不能述 5 例或驗法→問未備諮多客。先縮範。

### 二：謀波

列諸客分為 ~10 一波。前 2 波次序不重；後波之波間注知改善果。

```bash
# List all agents from registry
grep '  - id: ' agents/_registry.yml | sed 's/.*- id: //' | shuf
```

派客於波。初謀 4 波——或不需盡（見早止於四）。

| 波 | 客 | 綱變 |
|----|-----|------|
| 1-2 | 20 客 | 標綱 |
| 3 | 10 客 + advocatus-diaboli | 綱+共識+敵挑 |
| 4+ | 各 10 客 | 綱+「X 已確。專邊與敗。」 |

得：派表盡客。advocatus-diaboli 入波 3（非後）以使敵察影響後波。

敗：客不足 20→減 2-3 波。10 客亦行，惟合徵弱。

### 三：放波

各波並放。用 `sonnet` 模以省（值在視多，非個深）。

#### 法甲：TeamCreate（推薦於全放）

用 Claude Code 之 `TeamCreate` 工建協團附任跡。TeamCreate 為延工——先 `ToolSearch("select:TeamCreate")` 取。

1. 建團：
   ```
   TeamCreate({ team_name: "unleash-wave-1", description: "Wave 1: open-ended hypothesis generation" })
   ```
2. 每客建任，用 `TaskCreate` 附綱與域框
3. 每客以 `Agent` 工生為團員，附 `team_name: "unleash-wave-1"` 與 `subagent_type`（如 `kabalist`、`geometrist`）
4. 派任於員以 `TaskUpdate` 附 `owner`
5. 察跡以 `TaskList`——員畢自標
6. 波間關現團 `SendMessage({ type: "shutdown_request" })`、建次團附更綱（步四）

此給內建協：共任跡、員可訊隨、頭管波轉。

#### 法乙：直生客（簡於小行）

每客生附綱與域框：

```
Use the [agent-name] agent to analyze this problem through your domain expertise.
[Paste the brief]
Think about this from your specific perspective as a [agent-description].
[For non-technical agents: add a domain-specific framing, e.g., "What patterns
does your tradition recognize in systems that exhibit this kind of threshold behavior?"]
Respond exactly in the requested format.
```

並放諸客於波，以 Agent 附 `run_in_background: true`。波畢乃放次波（以波間注知於步四）。

#### 擇法

| | TeamCreate | 直 Agent |
|---|---|---|
| 宜 | 三層全放（40+ 客）| 二層席（5-10 客）|
| 協 | 任跡、訊、屬 | 放即忘、手集 |
| 波接 | 任態續 | 須手跡 |
| 耗 | 高（每波建團）| 低（每客一召）|

得：每波 2-5 分內返 ~10 結構應。失應或誤式者錄而不阻流。

敗：>50% 波失→察綱清。常因：出式含混、或例不足以使外域客推。

### 四：注波間知（與評早止）

波 1-2 後，未放下波先取現信。

1. 掃畢波應覓重現主題
2. 辨最常假族（合信）
3. **察早止值**：頂族 20 客後超空模 3x→強信。謀波 3 為敵+精煉、考慮後止
4. 更次波綱：

```markdown
**Update from prior waves**: [N] agents independently proposed [hypothesis family].
Build on this — what explains the remaining cases where this hypothesis fails?
Do NOT simply restate this finding. Extend, challenge, or refine it.
```

**早止建**：非每放需盡客。明域問（如庫析）合穩於 30-40 客。抽象開問（如未知數變）全集有值因正域真難測。每波後察合——頂族計與空模比平→後波回減。

此免重發（後波獨重得前果）、引後客向問之邊。

得：後波生更精、更針之假，補現共識之隙。

敗：2 波後無合→問或過開。考縮範或增例。

### 五：集與去重

諸波畢，集應於一文。按機分族去重：

1. 取諸假述
2. 按機聚（非按詞——「modular arithmetic mod 94」與「cyclic group over Z_94」同族）
3. 數每族獨發
4. 按合排：多客獨發者排前

得：排假族表附合計、貢客、代驗預。

敗：每假獨（無合）→信噪過低。或問須更例、或客須更緊出式。

### 六：以空模驗

試頂假於空模以確合有意，非訓共產之偽。

- **程驗**：假生可試式或算→於留例行
- **空模**：估 N 客偶合於同族之率（如 K 合理族，偶合率 ~N/K）
- **值**：合超空模 3x 為意

得：頂假族顯超偶合且/或過程驗。

敗：頂假敗驗→察次族。皆無過→問或須異法（深單專析、更數、改例）。

### 七：敵精煉

**宜時：波 3，非後合。** 納 advocatus-diaboli 於波 3（與波間知並）優於後波獨敵。早挑使波 4+ 對挑精煉，非堆於未挑共識。

若敵已於波 3，此步為末察。否（如諸波無之）→今生 advocatus-diaboli（或 senior-researcher）。為結構行，用 `TeamCreate` 立評團附二客並對共識：

```
Here is the consensus hypothesis from [N] independent agents:
[Hypothesis]
[Supporting evidence and convergence stats]

Your job: find the strongest counterarguments. Where does this fail?
What alternative explanations are equally consistent with the evidence?
What experiment would definitively falsify this hypothesis?
```

得：反論集、邊例、否驗。假過敵察→可整。佳敵察有時*部分護*共識——覓設優於替而未善。

敗：敵覓致命瑕→注挑於針隨波（三層+迭式——擇 5-10 客最宜應特挑）。

### 八：交予團

放覓問；團解之。化驗假族為可行議、組焦團解之。

1. 每驗假族建 GitHub 議（用 `create-github-issues`）
2. 議按合強與影排
3. 每議組小團以 `TeamCreate`：
   - `teams/` 中合域團定→用之
   - 無合→默 `opaque-team`（N shapeshifters 適派）——應未知問形不需自定組
   - 納至少一非技客（如 `advocatus-diaboli`、`contemplative`）——彼覺技客漏之施險
   - 用 REST 點於階間防急
4. 流：**放→分→團每議→解**

得：每假族對跡議附團派。放生診；團出修。

敗：團組不合問→重派。Shapeshifter 客可研設而無書工——團頭須施其碼建。

## 驗

- [ ] 諸客諮（或有理擇集）
- [ ] 應集於結構可析式
- [ ] 假去重按獨合排
- [ ] 頂假以空模或程驗證
- [ ] 敵察挑共識
- [ ] 末假含可驗預與已知限

## 忌

- **綱例少**：客需 5+ 例覓式。3 例→多客退表面配或鸚式（以異詞復述綱）
- **無驗路**：無試假法→不能辨信與噪。合必而不足
- **喻應**：域專客（mystic、shaman、kabalist）或應富喻難程析。納「以可試式或算述假」於出式
- **波重發**：無波間注知，波 3-7 獨重得波 1-2 已成。波間必更綱
- **過解合**：43% 合於機族似強，察基率。僅 3 合理族→偶合 ~33%
- **期單族霸**：抽象問（式辨、密）易生一霸假族。多維問（庫析、系設）生多有效族廣合——此期，非式敗
- **非技客泛框**：非技客貢之質依綱於其域語之框。「汝統於此閾系說何？」生構見；泛綱生無。為域外客投域框
- **以此執行**：此式生假，非實。驗假乃化議交團（步八）。流：放→分→團每議

## 參

- `forage-solutions` — 蟻集優以探解空（補：窄範深探）
- `build-coherence` — 蜂民主擇諸法（用後此技以擇頂假）
- `coordinate-reasoning` — 痕協以管客間訊流
- `coordinate-swarm` — 廣集協式於分系
- `expand-awareness` — 開覺前縮（補：用為個客備）
- `meditate` — 放前清境噪（建於步一前）
