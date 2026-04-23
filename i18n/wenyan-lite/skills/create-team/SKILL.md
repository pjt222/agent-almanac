---
name: create-team
locale: wenyan-lite
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

# 造新團隊

定一多代理團隊組成，以協調二或多代理達需多視角、專業、或階段之任務。所生之團隊檔整合於團隊註冊，可於 Claude Code 中按名激活。

## 適用時機

- 任務需單代理不能提之多視角（如程式審查加安全審計加架構審查）
- 需反覆之協作工作流，含一致之角色分配與交接模式
- 既代理組合已屢用，當正式化
- 複雜程序自然分為階段或專業，由異代理處之
- 欲定衝刺、管線、或並行工作之協調群

## 輸入

- **必要**：團隊名（小寫連字符格，如 `data-pipeline-review`）
- **必要**：團隊目的（一段述需多代理之問題）
- **必要**：領導代理（須存於 `agents/_registry.yml`）
- **選擇性**：協調模式（預設：hub-and-spoke）。其一：`hub-and-spoke`、`sequential`、`parallel`、`timeboxed`、`adaptive`
- **選擇性**：成員數（預設 3-4；建議區間 2-5）
- **選擇性**：源材料（待正式化之既工作流、執行手冊、臨時團隊組成）

## 步驟

### 步驟一：定團隊目的

述多代理合作所解之問題。有效之團隊目的須答：

1. 此團隊交付**何成果**？（如綜合審查報告、已部署應用、衝刺增量）
2. **單代理何不能為之？** 辨至少二異之專業或視角
3. **何時當激活此團隊？** 定觸發條件

寫目的為一段，令人或代理可讀以決激活此團隊。

**預期：** 明段述團隊之價值提案，辨至少二異專業。

**失敗時：** 若不能辨二異專業，此任務或不需團隊。改用一代理含多技能。

### 步驟二：擇領導代理

領導代理編排團隊。自 `agents/_registry.yml` 擇一代理，其：

- 有合團隊主要輸出之領域專業
- 能分來請為他成員之子任務
- 能合多審者之果為連貫之交付物

```bash
# List all available agents
grep "^  - id:" agents/_registry.yml
```

領導亦須現於團隊組成之成員中（領導恒為成員）。

**預期：** 擇一代理為領導，確認存於代理註冊。

**失敗時：** 若無既代理合領導角色，先以 `create-skill` 技能造之（或手用 `agents/_template.md`）。勿造領導不存為代理定義之團隊。

### 步驟三：擇成員代理

擇 2-5 成員（含領導），責任明而不重。各成員定：

- **id**：自代理註冊之代理名
- **role**：簡題（如「品質審者」、「安全審計者」、「架構審者」）
- **responsibilities**：一句述此成員行他成員不行之事

```bash
# Verify each candidate agent exists
grep "id: agent-name-here" agents/_registry.yml
```

驗不重：無二成員當有同一主要責任。若責任重，併角色或明界。

**預期：** 擇 2-5 成員，各有唯一角色與明責任，皆確認於代理註冊。

**失敗時：** 若所需代理不存，先造之。若二成員間責任重，重寫以明界或除一。

### 步驟四：擇協調模式

擇最合團隊工作流之模式。五模式及其用例：

| 模式 | 適用時機 | 範例團隊 |
|---------|-------------|---------------|
| **hub-and-spoke** | 領導分任務、收果、合成。最合審查與審計工作流 | r-package-review、gxp-compliance-validation、ml-data-science-review |
| **sequential** | 各代理建於前代理之輸出。最合管線與分段工作流 | fullstack-web-dev、tending |
| **parallel** | 所有代理同時行獨立之子任務。最合子任務無依賴者 | devops-platform-engineering |
| **timeboxed** | 工作組為固定長迭代。最合含積壓之持續項目工作 | scrum-team |
| **adaptive** | 團隊依任務自組織。最合未知或高變之任務 | opaque-team |

**決定引導：**
- 若領導須見所有果方產輸出：**hub-and-spoke**
- 若代理 B 需代理 A 之輸出方始：**sequential**
- 若所有代理可不見他輸出而行：**parallel**
- 若工作跨多迭代含計畫儀式：**timeboxed**
- 若不能預測任務結構：**adaptive**

**預期：** 擇一協調模式，含擇之明理由。

**失敗時：** 疑則預設 hub-and-spoke。其為最常模式，合多數審查與分析工作流。

### 步驟五：設任務分解

定一典型請求如何分予團員。結構為階段：

1. **立階段**：領導如何分析請求並造任務
2. **執階段**：各成員行何（並行、有序、或逐衝刺，依協調模式）
3. **合成階段**：如何收果並產終交付物

各成員列 3-5 其於典型請求上行之具體任務。此任務現於「Task Decomposition」散文段與 CONFIG 塊之 `tasks` 清單。

**預期：** 合擇之協調模式之階段化分解，各成員含具體任務。

**失敗時：** 若任務過泛（如「審事」），令具體（如「按 tidyverse 風格指南審程式風格、察測試覆蓋、評誤訊品質」）。

### 步驟六：寫團隊檔

複範本並填各段：

```bash
cp teams/_template.md teams/<team-name>.md
```

按序填下列段：

1. **YAML frontmatter**：`name`、`description`、`lead`、`version`（"1.0.0"）、`author`、`created`、`updated`、`tags`、`coordination`、`members[]`（各含 id、role、responsibilities）
2. **標題**：`# Team Name`（人讀式、title case）
3. **導言**：一段摘要
4. **目的**：此團隊存之因、其合之專業
5. **團隊組成**：含成員、代理、角色、焦點欄之表
6. **協調模式**：散文描述加流之 ASCII 圖
7. **任務分解**：階段化分解，各成員含具體任務
8. **配置**：機器可讀 CONFIG 塊（見步驟七）
9. **使用情境**：2-3 具體情境含範例用戶提示
10. **限制**：3-5 已知約束
11. **另見**：成員代理檔與相關技能/團隊之連結

**預期：** 全團隊檔，所有段皆填，無範本之佔位文殘留。

**失敗時：** 與既存團隊檔（如 `teams/r-package-review.md`）比以驗結構。搜範本佔位字串如「your-team-name」或「another-agent」以尋未填段。

### 步驟七：寫 CONFIG 塊

`<!-- CONFIG:START -->` 與 `<!-- CONFIG:END -->` 標間之 CONFIG 塊提機器可讀 YAML 供工具用。結構如下：

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

`subagent_type` 欄映至 Claude Code 代理型。`.claude/agents/` 中定之代理以代理 id 為 subagent_type。用 `blocked_by` 表任務依賴（如合成為所有審查任務所阻）。

**預期：** CONFIG 塊為有效 YAML，所有代理合 frontmatter 成員清單者，任務依賴形成有效 DAG（無環）。

**失敗時：** 驗 YAML 語法。驗任務清單中各 `assignee` 合成員清單中之 `agent`。察 `blocked_by` 僅引清單中先定之任務名。

### 步驟八：加於註冊

編 `teams/_registry.yml` 以加新團隊：

```yaml
- id: <team-name>
  path: <team-name>.md
  lead: <lead-agent-id>
  members: [<agent-id-1>, <agent-id-2>, ...]
  coordination: <pattern>
  description: <one-line description matching frontmatter>
```

更註冊首之 `total_teams` 計數（當前 8；加一團隊後為 9）。

```bash
# Verify the entry was added
grep "id: <team-name>" teams/_registry.yml
```

**預期：** 新項現於註冊，`total_teams` 計加一。

**失敗時：** 若團隊名已存於註冊，擇他名或更既項。驗 YAML 縮排合既項。

### 步驟九：行 README 自動化

自更新之註冊重生 README 檔：

```bash
npm run update-readmes
```

此更 `teams/README.md` 及任何含 `<!-- AUTO:START -->` / `<!-- AUTO:END -->` 標引團隊資料之他檔之動態段。

**預期：** 命令退出 0，`teams/README.md` 今列新團隊。

**失敗時：** 行 `npm run check-readmes` 以察何檔不同步。若腳本敗，驗 `package.json` 存於倉根且 `js-yaml` 已裝（`npm install`）。

### 步驟十：驗團隊激活

測此團隊可於 Claude Code 激活：

```
User: Use the <team-name> team to <typical task description>
```

Claude 讀 `teams/<team-name>.md`、萃取 CONFIG 塊、編排激活：
1. 以團隊名與描述呼 `TeamCreate`
2. 以 `Agent` 工具按各成員 CONFIG 塊中之 `subagent_type` 生團員
3. 以 `TaskCreate` 按 CONFIG 塊中之 `blocked_by` 依賴造任務
4. 領導代理循協調模式協調工作

注：團隊自 `.claude/teams/` **不**自動發現。Claude 於請時直讀 `teams/` 之定義。

**預期：** Claude 讀團隊檔、以 `TeamCreate` 造團隊、生正確代理、循協調模式。

**失敗時：** 驗團隊檔於 `teams/<team-name>.md`（非於子目錄）。察所有成員代理存於 `agents/`。確認 CONFIG 塊有有效 YAML，各成員含 `subagent_type`。確認團隊列於 `teams/_registry.yml`。

### 步驟十一：腳手架翻譯

> **所有團隊皆需**。此步適用於人類作者與遵此程序之 AI 代理。勿跳——缺之翻譯積為陳舊積壓。

新團隊提交後即為所有 4 支援語系腳手架翻譯檔：

```bash
for locale in de zh-CN ja es; do
  npm run translate:scaffold -- teams <team-name> "$locale"
done
```

繼之譯各檔之腳手架散文（程式塊與 ID 保英文）。最終再生狀態檔：

```bash
npm run translation:status
```

**預期：** 4 檔生於 `i18n/{de,zh-CN,ja,es}/teams/<team-name>.md`，其 `source_commit` 皆合當前 HEAD。`npm run validate:translations` 顯新團隊之陳舊警告為零。

**失敗時：** 若腳手架敗，驗團隊存於 `teams/_registry.yml`。若狀態檔未更，明行 `npm run translation:status`。

## 驗證

- [ ] 團隊檔存於 `teams/<team-name>.md`
- [ ] YAML frontmatter 解析無誤
- [ ] 所有必要 frontmatter 欄俱全：`name`、`description`、`lead`、`version`、`author`、`coordination`、`members[]`
- [ ] frontmatter 中各成員有 `id`、`role`、`responsibilities`
- [ ] 所有段俱全：Purpose、Team Composition、Coordination Pattern、Task Decomposition、Configuration、Usage Scenarios、Limitations、See Also
- [ ] CONFIG 塊存於 `<!-- CONFIG:START -->` 與 `<!-- CONFIG:END -->` 標間
- [ ] CONFIG 塊 YAML 有效可解
- [ ] 所有成員代理 id 存於 `agents/_registry.yml`
- [ ] 領導代理現於成員清單
- [ ] 無二成員共同一主要責任
- [ ] 團隊列於 `teams/_registry.yml`，路、領導、成員、協調皆正
- [ ] `total_teams` 計加
- [ ] `npm run update-readmes` 完而無誤

## 常見陷阱

- **成員過多**：超 5 成員之團隊難協調。分任務與合成果之負超加視角之益。分為二團隊或減至必要專業
- **責任重**：若二成員皆「審程式品質」，其發現將衝，領導耗時去重。各成員須有明顯異之焦點
- **協調模式誤**：代理需他輸出時用 hub-and-spoke（當 sequential），代理可獨行時用 sequential（當 parallel）。察步驟四之決定引導
- **缺 CONFIG 塊**：CONFIG 塊非選擇性散文裝飾。其為 Claude 用以編排 `TeamCreate`、代理生、任務造之機器可讀規格。缺之，團隊唯以臨時散文解讀激活，較不可靠
- **領導不於成員清單**：領導亦須現為成員，含自之角色與責任。僅「協調」而不行實工之領導浪一位。令領導有具體審查或合成責任

## 相關技能

- `create-skill` - 循同元模式造 SKILL.md 檔
- `create-agent` - 造作團員之代理定義
- `commit-changes` - 提交新團隊檔與註冊更新
