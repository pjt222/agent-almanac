---
name: create-team
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Create a new team composition file following the agent-almanac
  team template and registry conventions. Covers team purpose definition,
  member selection, coordination pattern choice, task decomposition
  design, machine-readable configuration block, registry integration,
  and README automation. Use when defining a multi-agent workflow,
  composing agents for a complex review process, or creating a
  coordinated group for recurring collaborative tasks.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: meta, team, creation, composition, coordination
---

# 造團

定調二代以上為含多角、專、階任之多代團。成團檔融於團庫可於 Claude Code 中以名活。

## 用

- 任需單代不能之多角（如碼評+安審+架評）
- 需含一致角賦與交流之復合作流
- 存代組反復用當正式化
- 複程自分為階或專由異代理
- 欲為 sprint、管、並工定調組

## 入

- **必**：團名（小寫 kebab-case、如 `data-pipeline-review`）
- **必**：團目（一段述何問需多代）
- **必**：首代（須存於 `agents/_registry.yml`）
- **可**：調模（默：hub-and-spoke）之一：`hub-and-spoke`、`sequential`、`parallel`、`timeboxed`、`adaptive`
- **可**：員數（默：3-4；宜：2-5）
- **可**：源材（存流、手冊、臨時團組）

## 行

### 一：定團目

明何問需多代同工。有效團目須答：

1. **何果**團交？（如全評報、部應、sprint 增量）
2. **何單代不能？** 識至少二異專或角
3. **何時當活此團？** 定觸件

書目為一段使人或代讀以決活否。

**得：** 明段述團值、至少二異專識。

**敗：** 不能識二異專→任或不需團。用含多技之單代。

### 二：擇首代

首代指揮團。自 `agents/_registry.yml` 擇代，須：

- 含關團主出之域專
- 可分請為子任予他員
- 可合多評果為一致交

```bash
# List all available agents
grep "^  - id:" agents/_registry.yml
```

首亦須現於團員（首恆為員）。

**得：** 擇一代為首、確存於代庫。

**敗：** 無存代合首→先以 `create-agent` 造（或手 `agents/_template.md`）。勿造含不存首之團。

### 三：擇員代

擇 2-5 員（含首）含明、不重責。各員定：

- **id**：自代庫之代名
- **role**：短角（如「Quality Reviewer」、「Security Auditor」、「Architecture Reviewer」）
- **responsibilities**：一句述此員何他員無為

```bash
# Verify each candidate agent exists
grep "id: agent-name-here" agents/_registry.yml
```

驗不重：無二員含同主責。責重→合角或銳界。

**得：** 擇 2-5 員、各含獨角明責、皆確於代庫。

**敗：** 需代不存→先造。二員責重→重書以明界或去一員。

### 四：擇調模

擇最合團流之模。五模與用：

| 模 | 用 | 例團 |
|---------|-------------|---------------|
| **hub-and-spoke** | 首分任、集果、合。評審流佳 | r-package-review、gxp-compliance-validation、ml-data-science-review |
| **sequential** | 各代築於前代出。管與階流佳 | fullstack-web-dev、tending |
| **parallel** | 諸代同於獨子任。子任無依佳 | devops-platform-engineering |
| **timeboxed** | 工組為定長迭。含備之持案工佳 | scrum-team |
| **adaptive** | 團按任自組。未知或高變任佳 | opaque-team |

**決導：**
- 首須見諸果方出：**hub-and-spoke**
- 代 B 需代 A 出方始：**sequential**
- 諸代獨工不見他出：**parallel**
- 工跨含計式之多迭：**timeboxed**
- 不能預知任構：**adaptive**

**得：** 擇一調模含明因。

**敗：** 疑→默 hub-and-spoke。最常、多評析流用之。

### 五：設任分

定典請如何分為員。結為階：

1. **設階**：首如何析請建任
2. **行階**：各員作何（按調模並、序、每 sprint）
3. **合階**：如何集果生終交

各員列典請之 3-5 具任。此任現於「Task Decomposition」文與 CONFIG 塊 `tasks` 列。

**得：** 含每員具任之階構分、合擇之調模。

**敗：** 任泛（如「評事」）→具（如「評碼風合 tidyverse、察試覆、評誤訊質」）。

### 六：書團檔

複模填諸節：

```bash
cp teams/_template.md teams/<team-name>.md
```

按序填：

1. **YAML frontmatter**：`name`、`description`、`lead`、`version`（「1.0.0」）、`author`、`created`、`updated`、`tags`、`coordination`、`members[]`（各含 id、role、responsibilities）
2. **標**：`# Team Name`（人讀、title case）
3. **引**：一段總結
4. **目**：此團為何、合何專
5. **團組**：含 Member、Agent、Role、Focus Areas 列之表
6. **調模**：文述加流 ASCII 圖
7. **任分**：含每員具任之階分
8. **設**：機可讀 CONFIG 塊（見步七）
9. **用景**：2-3 具景含例用提
10. **限**：3-5 知限
11. **See Also**：員代檔與相關技/團之聯

**得：** 全團檔含諸節填、無模留語。

**敗：** 較存團檔（如 `teams/r-package-review.md`）驗構。搜模留語如「your-team-name」、「another-agent」尋未填節。

### 七：書 CONFIG 塊

`<!-- CONFIG:START -->` 與 `<!-- CONFIG:END -->` 間 CONFIG 塊予具之機可讀 YAML。構如下：

    <!-- CONFIG:START -->
    ```yaml
    team:
      name: <team-name>
      lead: <lead-agent-id>
      coordination: <pattern>
      members:
        - agent: <agent-id>
          role: <role-title>
          subagent_type: <agent-id>  # Claude Code subagent type for spawning
        # ... repeat for each member
      tasks:
        - name: <task-name>
          assignee: <agent-id>
          description: <one-line description>
        # ... repeat for each task
        - name: synthesize-report  # final task if hub-and-spoke
          assignee: <lead-agent-id>
          description: <synthesis description>
          blocked_by: [<prior-task-names>]  # for dependency ordering
    ```
    <!-- CONFIG:END -->

`subagent_type` 欄映至 Claude Code 代型。為定於 `.claude/agents/` 之代、用代 id 為 subagent_type。用 `blocked_by` 表任依（如合為諸評任阻）。

**得：** CONFIG 塊為有效 YAML、諸代合 frontmatter 員列、任依為有效 DAG（無環）。

**敗：** 驗 YAML 文。驗諸任列之 `assignee` 合員列之 `agent`。察 `blocked_by` 僅引前定任名。

### 八：加於庫

編 `teams/_registry.yml` 加新團：

```yaml
- id: <team-name>
  path: <team-name>.md
  lead: <lead-agent-id>
  members: [<agent-id-1>, <agent-id-2>, ...]
  coordination: <pattern>
  description: <one-line description matching frontmatter>
```

更庫首 `total_teams` 計（現 8、加一團後為 9）。

```bash
# Verify the entry was added
grep "id: <team-name>" teams/_registry.yml
```

**得：** 新項現於庫、`total_teams` 計增一。

**敗：** 團名已存於庫→擇異名或更存項。驗 YAML 縮合存項。

### 九：行 README 自動

自更庫重生 README：

```bash
npm run update-readmes
```

此更 `teams/README.md` 與任引團數之含 `<!-- AUTO:START -->` / `<!-- AUTO:END -->` 標之他檔動節。

**得：** 令出零、`teams/README.md` 列新團。

**敗：** 行 `npm run check-readmes` 見何檔未同。本敗→驗 `package.json` 於庫根、`js-yaml` 裝（`npm install`）。

### 十：驗團活

試團可於 Claude Code 中活：

```
User: Use the <team-name> team to <typical task description>
```

Claude 讀 `teams/<team-name>.md`、取 CONFIG 塊、調活：
1. 以團名與述調 `TeamCreate`
2. 以 `Agent` 具按各員 CONFIG 塊之 `subagent_type` 生員
3. 以 CONFIG 塊之 `blocked_by` 依調 `TaskCreate`
4. 首代按調模調工

注：團**非**自發現於 `.claude/teams/`。求時 Claude 自 `teams/` 直讀定。

**得：** Claude 讀團檔、以 `TeamCreate` 建團、生正代、循調模。

**敗：** 驗團檔於 `teams/<team-name>.md`（非子目）。察諸員代存於 `agents/`。確 CONFIG 塊含各員 `subagent_type` 之有效 YAML。確團列於 `teams/_registry.yml`。

### 十一：架譯

> **諸團必**。此步施於人作者與循此程之 AI 代。勿略——缺譯積為陳備。

承新團後即為諸 4 locales 架譯檔：

```bash
for locale in de zh-CN ja es; do
  npm run translate:scaffold -- teams <team-name> "$locale"
done
```

續譯各檔之架詞（碼塊與 ID 留英）。終重生態檔：

```bash
npm run translation:status
```

**得：** `i18n/{de,zh-CN,ja,es}/teams/<team-name>.md` 建四檔、`source_commit` 皆合現 HEAD。`npm run validate:translations` 顯零陳警於新團。

**敗：** 架敗→驗團存於 `teams/_registry.yml`。態檔不更→顯行 `npm run translation:status`。

## 驗

- [ ] 團檔存於 `teams/<team-name>.md`
- [ ] YAML frontmatter 無誤解析
- [ ] 諸必欄存：`name`、`description`、`lead`、`version`、`author`、`coordination`、`members[]`
- [ ] 各員含 `id`、`role`、`responsibilities`
- [ ] 諸節存：Purpose、Team Composition、Coordination Pattern、Task Decomposition、Configuration、Usage Scenarios、Limitations、See Also
- [ ] CONFIG 塊存於 `<!-- CONFIG:START -->` 與 `<!-- CONFIG:END -->` 標間
- [ ] CONFIG 塊 YAML 有效可解
- [ ] 諸員代 id 存於 `agents/_registry.yml`
- [ ] 首代現於員列
- [ ] 無二員同主責
- [ ] 團列於 `teams/_registry.yml` 含正路、首、員、調
- [ ] 庫中 `total_teams` 計增
- [ ] `npm run update-readmes` 無誤畢

## 忌

- **員過多**：過 5 員之團難調。分任與合果之過負勝加角之益。分二團或減至要專
- **責重**：二員皆「評碼質」→見衝而首費時除重。各員須含明異焦
- **誤調模**：代需他出時用 hub-and-spoke（當 sequential）、代可獨工時用 sequential（當 parallel）。察步四決導
- **缺 CONFIG 塊**：CONFIG 塊非可文飾。為 Claude 調 `TeamCreate`、代生、任建之機可讀規。無之→團僅可以臨文解活、不靠
- **首代非員**：首須現為員含己角責。僅「調」無實工之首費位。予首具評或合責

## 參

- `create-skill` - 循同元模造 SKILL.md 檔
- `create-agent` - 造為團員之代定
- `commit-changes` - 承新團檔與庫更
