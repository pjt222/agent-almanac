---
name: create-team
locale: wenyan
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

# 建新團

定多行者團組，協二或多行者以畢需多視、專、階之任。其團文件入團籍，可於 Claude Code 以名激。

## 用時

- 任需多視單行者不能供者（如碼審＋安審＋構審）
- 需重複協流含一致角與交接式
- 現行者組反復用，宜正式化
- 繁程自然分為異行者處之階或專
- 欲定為衝基、管基、並行工之協組

## 入

- **必要**：團名（小寫中劃線，如 `data-pipeline-review`）
- **必要**：團志（一段述何題需多行者）
- **必要**：領者（須存於 `agents/_registry.yml`）
- **可選**：協式（默 hub-and-spoke）。其一：`hub-and-spoke`、`sequential`、`parallel`、`timeboxed`、`adaptive`
- **可選**：成員數（默 3-4；宜 2-5）
- **可選**：源（現流、運本、臨時團組欲正式化者）

## 法

### 第一步：定團志

明何題需多行者同作。合法之團志當答：

1. **何果** 此團交？（如全審報、已布應用、衝進展）
2. **單行者何以不能？** 識至少二殊專或視。
3. **何時激此團？** 定觸件。

志書為一段，人或行者可讀以決激否。

**得：** 清一段述團之值，至少識二殊專。

**敗則：** 若不能識二殊專，任或不需團。宜用多技之單行者。

### 第二步：擇領者

領者調團。由 `agents/_registry.yml` 擇：

- 有與團主出相關之域專
- 能將入請分為他員之子任
- 能聚多審者之果為連貫之交

```bash
# List all available agents
grep "^  - id:" agents/_registry.yml
```

領亦當現於團組之成員（領皆為成員）。

**得：** 一行者為領，確存於行者籍。

**敗則：** 若無現行者合領，先以 `create-skill` 技（或手 `agents/_template.md`）建之。勿建領不存為行者定之團。

### 第三步：擇成員行者

擇 2-5 成員（含領），職清無重。每員定：

- **id**：行者籍之名
- **role**：短題（如「Quality Reviewer」、「Security Auditor」、「Architecture Reviewer」）
- **responsibilities**：一句述此員所為而他員不為者

```bash
# Verify each candidate agent exists
grep "id: agent-name-here" agents/_registry.yml
```

驗無重：無二員有同主責。若重，或合角或銳界。

**得：** 2-5 成員，各有獨角與清責，皆確於行者籍。

**敗則：** 若缺行者，先建之。若二員責重，重書以清界或去一員。

### 第四步：擇協式

擇最合團流之式。五式與其用案：

| 式 | 用時 | 例團 |
|---------|-------------|---------------|
| **hub-and-spoke** | 領分任、聚果、聚之。最宜審、查流。 | r-package-review、gxp-compliance-validation、ml-data-science-review |
| **sequential** | 每行者建於前者之出。最宜管與階流。 | fullstack-web-dev、tending |
| **parallel** | 諸行者同時作獨立子任。最宜子任無依者。 | devops-platform-engineering |
| **timeboxed** | 工組為定長迭代。最宜有積之持續項工。 | scrum-team |
| **adaptive** | 團依任自組。最宜未知或甚變之任。 | opaque-team |

**決引：**
- 若領須見諸果乃出：**hub-and-spoke**
- 若 B 需 A 之出乃起：**sequential**
- 若諸行者可不見彼此出而作：**parallel**
- 若工跨多迭代含劃儀：**timeboxed**
- 若不能預知任構：**adaptive**

**得：** 一協式擇，擇之由清。

**敗則：** 若疑，默 hub-and-spoke。此為最常式，適多審析流。

### 第五步：設任分

定入請如何跨員分。結構為階：

1. **設階**：領如何析請而建任
2. **執階**：每員作何（並行、有序、衝——依協式）
3. **聚階**：如何聚果生終交

為每員列 3-5 於常請所為具體任。此任現於「Task Decomposition」散節與 CONFIG 塊之 `tasks` 列。

**得：** 分階之分，每員有具體任，合所擇協式。

**敗則：** 若任過泛（如「reviews things」），具體之（如「reviews code style against tidyverse style guide, checks test coverage, evaluates error message quality」）。

### 第六步：書團文件

複樣填諸節：

```bash
cp teams/_template.md teams/<team-name>.md
```

按序填諸節：

1. **YAML 前言**：`name`、`description`、`lead`、`version`（"1.0.0"）、`author`、`created`、`updated`、`tags`、`coordination`、`members[]`（各有 id、role、responsibilities）
2. **題**：`# Team Name`（人讀、題式）
3. **介**：一段概
4. **志**：何以存此團、合何專
5. **Team Composition**：含 Member、Agent、Role、Focus Areas 列之表
6. **Coordination Pattern**：散述與流之 ASCII 圖
7. **Task Decomposition**：分階之分，每員具體任
8. **Configuration**：機讀 CONFIG 塊（參第七步）
9. **Usage Scenarios**：2-3 具體景含例用者請
10. **Limitations**：3-5 既知限
11. **See Also**：連成員行者文件與相關技／團

**得：** 全團文件，諸節皆填，樣之占位盡去。

**敗則：** 與現團文件（如 `teams/r-package-review.md`）較驗構。搜樣占位字（如「your-team-name」、「another-agent」）尋未填。

### 第七步：書 CONFIG 塊

`<!-- CONFIG:START -->` 與 `<!-- CONFIG:END -->` 間之 CONFIG 塊供機讀 YAML 以便工具。構如下：

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

`subagent_type` 映 Claude Code 行者類。`.claude/agents/` 之行者，用其 id 為 subagent_type。用 `blocked_by` 表任依（如聚被諸審任阻）。

**得：** CONFIG 塊為合法 YAML，諸行者合前言成員列，任依成合法 DAG（無環）。

**敗則：** 驗 YAML 語法。驗任列每 `assignee` 合成員列之 `agent`。察 `blocked_by` 唯引前定之任名。

### 第八步：入籍

編 `teams/_registry.yml` 加新團：

```yaml
- id: <team-name>
  path: <team-name>.md
  lead: <lead-agent-id>
  members: [<agent-id-1>, <agent-id-2>, ...]
  coordination: <pattern>
  description: <one-line description matching frontmatter>
```

更籍頂之 `total_teams` 計（當前 8；加一後成 9）。

```bash
# Verify the entry was added
grep "id: <team-name>" teams/_registry.yml
```

**得：** 新項現於籍，`total_teams` 增一。

**敗則：** 若團名已存，擇他名或更現項。驗 YAML 縮進合現項。

### 第九步：運 README 自動

由更籍重生 README：

```bash
npm run update-readmes
```

此更 `teams/README.md` 及有 `<!-- AUTO:START -->` / `<!-- AUTO:END -->` 標引團數之他文件之動節。

**得：** 命退 0，`teams/README.md` 現列新團。

**敗則：** 運 `npm run check-readmes` 見何不同步。若本敗，驗 `package.json` 於庫根且 `js-yaml` 已裝（`npm install`）。

### 第十步：驗團激

試團可於 Claude Code 激：

```
User: Use the <team-name> team to <typical task description>
```

Claude 讀 `teams/<team-name>.md`，抽 CONFIG 塊，調激：
1. 以團名與述呼 `TeamCreate`
2. 以 `Agent` 工，用每員 CONFIG 之 `subagent_type` 生員
3. 以 `TaskCreate` 建任含 CONFIG 之 `blocked_by` 依
4. 領行者依協式協工

注：團**非**由 `.claude/teams/` 自動發現。Claude 被問時直由 `teams/` 讀定。

**得：** Claude 讀團文件，以 `TeamCreate` 建團，生正行者，循協式。

**敗則：** 驗團文件於 `teams/<team-name>.md`（非子目錄）。察諸成員行者存於 `agents/`。確 CONFIG 塊有合法 YAML 含每員 `subagent_type`。確團列於 `teams/_registry.yml`。

### 第十一步：搭翻譯之架

> **諸團必需。** 此步施於人作者與循此法之 AI 行者。勿略——缺譯積為陳積。

提交新團後即為四支持語搭譯文件：

```bash
for locale in de zh-CN ja es; do
  npm run translate:scaffold -- teams <team-name> "$locale"
done
```

而譯各文件之散文（代碼塊與 ID 留英）。終重生狀態文件：

```bash
npm run translation:status
```

**得：** 四文件建於 `i18n/{de,zh-CN,ja,es}/teams/<team-name>.md`，`source_commit` 皆合當前 HEAD。`npm run validate:translations` 顯新團無陳警。

**敗則：** 若搭敗，驗團存於 `teams/_registry.yml`。若狀態文件不更，明運 `npm run translation:status`。

## 驗

- [ ] 團文件存於 `teams/<team-name>.md`
- [ ] YAML 前言無訛而解
- [ ] 諸必要前言域存：`name`、`description`、`lead`、`version`、`author`、`coordination`、`members[]`
- [ ] 前言每員有 `id`、`role`、`responsibilities`
- [ ] 諸節存：Purpose、Team Composition、Coordination Pattern、Task Decomposition、Configuration、Usage Scenarios、Limitations、See Also
- [ ] CONFIG 塊存於 `<!-- CONFIG:START -->` 與 `<!-- CONFIG:END -->` 標間
- [ ] CONFIG 塊 YAML 合法可解
- [ ] 諸成員行者 id 存於 `agents/_registry.yml`
- [ ] 領於成員列
- [ ] 無二員共主責
- [ ] 團列於 `teams/_registry.yml` 有正路、領、員、協
- [ ] 籍之 `total_teams` 計已增
- [ ] `npm run update-readmes` 無訛而畢

## 陷

- **員過多**：逾五員之團難協。分任聚果之耗過於增視之益。宜分二團或減至要專。
- **責重**：若二員皆「review code quality」，其發衝而領費時去重。每員須有清異之焦。
- **協式誤**：行者需他者之出當用序而用 hub-and-spoke，或行者可獨立當用並而用序。察第四步決引。
- **缺 CONFIG**：CONFIG 塊非可選散飾。其為 Claude 調 `TeamCreate`、生行者、建任之機讀規。無之則唯臨時散解可激，可靠性減。
- **領不於員列**：領須亦為員，有其角與責。唯「協」不實作之領費位。予領具體審或聚責。

## 參

- `create-skill` — 建 SKILL.md 文件之同元式
- `create-agent` — 建為團員之行者定
- `commit-changes` — 提交新團文件與籍更
