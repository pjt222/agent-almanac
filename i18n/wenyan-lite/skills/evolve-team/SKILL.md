---
name: evolve-team
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Evolve an existing team composition by refining its structure in-place or
  creating a specialized variant. Covers assessing the current team against
  template and coordination patterns, gathering evolution requirements,
  choosing scope (adjust members, change coordination pattern, split/merge
  teams), applying changes to the team file and CONFIG block, updating
  version metadata, and synchronizing the registry and cross-references.
  Use when a team's member roster is outdated, coordination pattern no
  longer fits, user feedback reveals workflow gaps, a specialized variant
  is needed alongside the original, or agents have been added or removed
  from the library affecting team composition.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: meta, team, evolution, coordination, maintenance
---

# 演化既有團隊

改、重構或建以 `create-team` 原著之團隊之專門變體。此程涵團隊生命週期之維護面：對模板與協調模式之差距評估、對組成與工作流施針對性改、升版、保持登記冊與交互引用之同步。

## 適用時機

- 代理已加、移或演後團隊成員名單陳舊
- 使用者回饋示工作流瓶頸、交接不明或缺視角
- 協調模式不再合團隊之實際工作流（如 hub-and-spoke 當改為並行）
- 需原之外之專門變體（如 `r-package-review` 與 `r-package-review-security-focused`）
- 團隊成員責任重疊，需更銳之界
- CONFIG 塊與散文述或成員清單不同步
- 團隊需分為二小團隊或二團隊需合

## 輸入

- **必要**：待演之既有團隊文件之路徑（如 `teams/r-package-review.md`）
- **必要**：演化觸發（回饋、新代理、協調不配、範圍重疊、效能問題、代理演化）
- **選擇性**：目標版本升之幅（patch、minor、major）
- **選擇性**：是否建專門變體而非就地改（預設：就地改）

## 步驟

### 步驟一：評當前團隊

讀既有團隊文件並對團隊模板（`teams/_template.md`）評各節：

| 節 | 所察 | 常見問題 |
|---------|--------------|---------------|
| Frontmatter | 所必欄（`name`、`description`、`lead`、`version`、`author`、`coordination`、`members[]`） | 缺 `tags`、陳 `version`、誤 `coordination` |
| Purpose | 明之多代理理由（至少二異專長） | 一代理可處 |
| Team Composition | 表配 frontmatter 成員，責任無重疊 | 陳表、重複焦域 |
| Coordination Pattern | 配實工作流，有 ASCII 圖 | 工作流之模式誤 |
| Task Decomposition | 分階段，每成員具體任務 | 模糊任務、缺階段 |
| CONFIG Block | 標間有效 YAML，配 frontmatter 與散文 | 不同步、缺 `blocked_by`、YAML 無效 |
| Usage Scenarios | 2-3 實際啟動提示 | 佔位符文 |
| Limitations | 3-5 誠實限 | 缺或過泛 |
| See Also | 指成員代理、相關團隊、指南之有效連 | 陳連 |

```bash
# Read the team file
cat teams/<team-name>.md

# Verify all member agents still exist
grep "id:" teams/<team-name>.md | while read line; do
  agent=$(echo "$line" | grep -oP '(?<=id: )[\w-]+')
  grep "id: $agent" agents/_registry.yml || echo "MISSING: $agent"
done

# Check if the team is referenced by any guide
grep -r "<team-name>" guides/*.md
```

**預期：** 按節組之具體差距、弱處或改善機會清單。

**失敗時：** 若團隊文件不存或無 frontmatter，此技不適——改用 `create-team` 自頭著之。

### 步驟二：採演化需求

識並分類演化之觸發：

| 觸發 | 例 | 典型範圍 |
|---------|---------|---------------|
| 使用者回饋 | 「審過久，代理工重複」 | 銳責任或改模式 |
| 新代理可得 | `api-security-analyst` 代理已建 | 加成員 |
| 代理已演 | `code-reviewer` 得新技能 | 更成員責任 |
| 代理已移 | `deprecated-agent` 已退 | 移成員，重派其任務 |
| 協調不配 | 序列團隊有獨立子任務 | 改為並行 |
| 範圍擴 | 團隊需覆部署，不僅審 | 加成員或建變體 |
| 團隊過大 | 6+ 成員致協調負荷 | 分為二團隊 |
| 團隊過小 | 單成員行多工 | 與另一團隊合或加成員 |

編前先記所需之具體改：

```
- Frontmatter: add new member `api-security-analyst` with role "API Security Reviewer"
- Team Composition: add row to composition table
- Task Decomposition: add API security review tasks to execution phase
- CONFIG block: add member and tasks entries
- See Also: add link to new agent file
```

**預期：** 具體改之清單，各映至團隊文件之特定節。

**失敗時：** 若改不明，進前諮詢使用者以釐。演化目標泛則改善亦泛。

### 步驟三：擇演化範圍

以此決策矩陣定是就地改或建變體：

| 標準 | 就地改（in-place） | 專門變體（新團隊） |
|----------|----------------------|-------------------------------|
| 團隊 ID | 不變 | 新 ID：`<team>-<specialty>` |
| 檔路徑 | 同 `.md` 檔 | `teams/` 中新檔 |
| 版本升 | Patch 或 minor | 起於 1.0.0 |
| Coordination | 或變 | 或異於原 |
| Registry | 更既有項 | 加新項 |
| 原團隊 | 直接修 | 保全，加 See Also 交互引用 |

**改**：於調成員、銳責任、修 CONFIG 塊或改協調模式時擇之。團隊保其身分。

**變體**：當演後之版服於實質異之用例、需異協調模式或對異受眾時擇之。原團隊保於既有用例。

附加範圍決：

| 情 | 行動 |
|-----------|--------|
| 團隊有 6+ 成員而慢 | 分為二聚焦團隊 |
| 二 2 人團隊覆鄰接域 | 合為一 3-4 人團隊 |
| 團隊之協調模式誤 | 改——就地改模式 |
| 團隊需全異之 lead | 若 lead 存則改；否先建代理 |

**預期：** 明決——改、變體、分或合——含理由。

**失敗時：** 若不定，預設改。分或合團隊波及較廣，宜與使用者確認。

### 步驟四：施改於團隊文件

#### 就地改

直接編既有團隊文件。維護所有引團隊組成之節之一致：

1. **Frontmatter `members[]`**：加、移或更成員項（各帶 `id`、`role`、`responsibilities`）
2. **Team Composition 表**：須精確配 frontmatter 成員
3. **Coordination Pattern**：若模式變則更散文與 ASCII 圖
4. **Task Decomposition**：改階段與每成員任務以反新組成
5. **CONFIG 塊**：更 `members` 與 `tasks` 清單以配（見步驟五）
6. **Usage Scenarios**：若團隊啟動觸發變則改
7. **Limitations**：更以反新約束或移已解之約束
8. **See Also**：更代理連並加新相關團隊或指南之引

遵此編輯規：
- 保所有既有節——加內容，勿移節
- 加成員時，於 frontmatter、composition 表、任務分解、CONFIG 塊皆加
- 移成員時，自所有該處移之並重派其任務
- 驗各成員代理存：`grep "id: agent-name" agents/_registry.yml`
- 保 lead 於成員清單——lead 恒為成員

#### 變體

```bash
# Copy the original as a starting point
cp teams/<team-name>.md teams/<team-name>-<specialty>.md

# Edit the variant:
# - Change `name` to `<team-name>-<specialty>`
# - Update `description` to reflect the specialized scope
# - Adjust `coordination` pattern if needed
# - Reset `version` to "1.0.0"
# - Modify members, tasks, and CONFIG block for the specialized use case
# - Reference the original in See Also as a general-purpose alternative
```

**預期：** 團隊文件（改或新變體）過步驟一之評估清單，所有節內部一致。

**失敗時：** 若編破內部一致（如 CONFIG 塊列 frontmatter 無之成員），比 frontmatter `members[]` 與 Team Composition 表、Task Decomposition、CONFIG 塊以尋不配之處。

### 步驟 4.5：同步翻譯之變體

> **翻譯存時必行。** 此步適於依此程之人類作者與 AI 代理。勿略——陳 `source_commit` 值致 `npm run validate:translations` 於所有語言報假陳舊警。

察演化之團隊是否存譯文並更以反新源狀態：

```bash
# Check for existing translations
ls i18n/*/teams/<team-name>.md 2>/dev/null
```

#### 若譯文存

1. 取當前源 commit hash：

```bash
SOURCE_COMMIT=$(git rev-parse HEAD)
```

2. 更各譯文 frontmatter 中之 `source_commit`：

```bash
for locale_file in i18n/*/teams/<team-name>.md; do
  sed -i "s/^source_commit: .*/source_commit: $SOURCE_COMMIT/" "$locale_file"
done
```

3. 於 commit 訊息中納受影響語言以旗標檔供重譯：

```
evolve(<team-name>): <description of changes>

Translations flagged for re-sync: de, zh-CN, ja, es
Changed sections: <list sections that changed>
```

4. 再生譯狀態檔：

```bash
npm run translation:status
```

#### 若無譯文

無需行動。進步驟五。

#### 於變體

遞譯新變體至變體穩（1-2 版）。於變體至少一改後再加譯。

**預期：** 所有譯文之 `source_commit` 已更至當前 commit。`npm run translation:status` 以 0 出。

**失敗時：** 若 `sed` 未能配 frontmatter 欄，手開譯文並驗其於 YAML frontmatter 有 `source_commit`。若欄缺，以 `npm run translate:scaffold -- teams <team-name> <locale>` 重建鷹架。

### 步驟五：更 CONFIG 塊

`<!-- CONFIG:START -->` 與 `<!-- CONFIG:END -->` 間之 CONFIG 塊須與散文節同步。任成員或任務變後：

1. 驗 CONFIG `members` 中每 `agent` 配 frontmatter 中之成員
2. 驗 CONFIG `tasks` 中每 `assignee` 配成員代理 id
3. 若任務序變則更 `blocked_by` 依賴
4. 確合成/終任務引所有先決任務

```yaml
team:
  name: <team-name>
  lead: <lead-agent>
  coordination: <pattern>
  members:
    - agent: <agent-id>
      role: <role-title>
      subagent_type: <agent-id>
  tasks:
    - name: <task-name>
      assignee: <agent-id>
      description: <one-line>
    - name: synthesize-results
      assignee: <lead-agent>
      description: Collect and synthesize all member outputs
      blocked_by: [<prior-task-names>]
```

**預期：** CONFIG YAML 有效，所有代理與任務與文件餘部一致，`blocked_by` 成有效 DAG。

**失敗時：** 另解 CONFIG 塊 YAML 以尋語法錯。對 `members` 清單交叉檢每 `assignee`。

### 步驟六：更版與元數據

升 frontmatter 之 `version` 欄，循語義化版：

| 改類 | 版升 | 例 |
|-------------|-------------|---------|
| 措詞修、See Also 更新 | Patch：1.0.0 → 1.0.1 | 修陳之代理連 |
| 加新成員、改任務 | Minor：1.0.0 → 1.1.0 | 加 security-analyst 成員 |
| 協調模式變、團隊重構 | Major：1.0.0 → 2.0.0 | 自 hub-and-spoke 改為並行 |

亦更：
- `updated` 日期至今
- `tags` 若團隊之域覆變
- `description` 若團隊目的實質異
- `coordination` 若模式變

**預期：** Frontmatter `version` 與 `updated` 反改之幅與日。新變體起於 `"1.0.0"`。

**失敗時：** 若忘升版，次演化無法辨當前態與前態。恒於 commit 前升之。

### 步驟七：更登記冊與交互引用

#### 就地改

更 `teams/_registry.yml` 中既有項以配改後 frontmatter：

```bash
# Find the team's registry entry
grep -A 10 "id: <team-name>" teams/_registry.yml
```

更 `description`、`lead`、`members`、`coordination` 欄以配團隊文件。無需變計。

#### 變體

加新團隊至 `teams/_registry.yml`：

```yaml
- id: <team-name>-<specialty>
  path: <team-name>-<specialty>.md
  lead: <lead-agent>
  members: [agent-1, agent-2, agent-3]
  coordination: <pattern>
  description: One-line description of the specialized variant
```

然後：
1. 增登記冊頂之 `total_teams`
2. 於原團隊之 See Also 加指向變體之交互引用
3. 於變體之 See Also 加指向原團隊之交互引用

執 README 自動化：

```bash
npm run update-readmes
```

**預期：** 登記冊項配團隊文件之 frontmatter。`npm run update-readmes` 以 0 出。於變體，`total_teams` 等於實際團隊項數。

**失敗時：** 若登記計誤，以 `grep -c "^  - id:" teams/_registry.yml` 計項並修計。若 README 自動化敗，驗 `package.json` 存且 `js-yaml` 已裝。

### 步驟八：驗已演團隊

行全驗證清單：

- [ ] 團隊文件於預期路徑存
- [ ] YAML frontmatter 無誤解析
- [ ] `version` 已升（改）或設為 "1.0.0"（變體）
- [ ] `updated` 日期為今
- [ ] 所必節俱在：Purpose、Team Composition、Coordination Pattern、Task Decomposition、Configuration、Usage Scenarios、Limitations、See Also
- [ ] Frontmatter `members[]` 配 Team Composition 表
- [ ] CONFIG 塊成員配 frontmatter 成員
- [ ] CONFIG 塊任務有有效 assignee 與 `blocked_by` 引用
- [ ] 所有成員代理 ID 於 `agents/_registry.yml` 存
- [ ] Lead 代理見於成員清單
- [ ] 無二成員共主責任
- [ ] 登記冊項存並配 frontmatter
- [ ] 於變體：`total_teams` 計配磁碟實際數
- [ ] 交互引用雙向（原 ↔ 變體）
- [ ] `git diff` 示原內容無誤刪

```bash
# Verify frontmatter
head -25 teams/<team-name>.md

# Verify all member agents exist
for agent in agent-a agent-b agent-c; do
  grep "id: $agent" agents/_registry.yml
done

# Count teams on disk vs registry
ls teams/*.md | grep -v template | wc -l
grep total_teams teams/_registry.yml

# Review all changes
git diff
```

**預期：** 所有清單項過。已演團隊已備以 commit。

**失敗時：** 逐一處理每敗項。演後最常之問題為 CONFIG 塊漂移（成員或任務與散文不配）及忘之 `updated` 日。

## 驗證

- [ ] 團隊文件存並有有效 YAML frontmatter
- [ ] `version` 欄反所作之改
- [ ] `updated` 日為今
- [ ] 所有節俱在且內部一致
- [ ] Frontmatter `members[]`、Team Composition 表、CONFIG 塊同步
- [ ] 所有成員代理 ID 於 `agents/_registry.yml` 存
- [ ] Lead 代理於成員清單中
- [ ] CONFIG 塊 YAML 有效可解
- [ ] 登記冊項配團隊文件
- [ ] 於變體：`teams/_registry.yml` 中有新項含正確路徑
- [ ] 於變體：`total_teams` 計已更
- [ ] 交互引用有效（See Also 無破連）
- [ ] 於帶譯之改：所有語言檔之 `source_commit` 已更
- [ ] `git diff` 確無誤移內容

## 常見陷阱

- **CONFIG 塊漂移**：CONFIG 塊、frontmatter、散文節皆須於成員與任務上同意。更一而不更他為最常之團隊演化錯。每改後，三者交叉檢。
- **忘升版**：無版升則無法追何時何變。恒於 commit 前更 frontmatter 之 `version` 與 `updated`。
- **演後之陳譯**：每次團隊演化觸發至 4 語言檔之陳舊。恒以 `ls i18n/*/teams/<team-name>.md` 察既存譯文並更各之 `source_commit`，或於 commit 訊息中旗標以待重譯。
- **孤兒成員引用**：移成員時，其於 Task Decomposition 與 CONFIG 塊之任務須重派或移。留孤兒 assignee 致啟動敗。
- **演後之協調模式誤**：加可並行之成員於序列團隊，或建代理需彼此輸出之 hub-and-spoke 團隊。任結構變後重評 `create-team` 步驟四之模式決。
- **加成員後團隊過大**：逾 5 成員之團隊難協調。若演化推團隊逾 5，改考慮分為二聚焦團隊。
- **建變體後陳之 See Also**：建變體時，原與變體須互引。單向引用使圖不全。

## 相關技能

- `create-team` — 著新團隊之基；evolve-team 假其原依之
- `evolve-skill` — 演 SKILL.md 檔之平行程
- `evolve-agent` — 演代理定義之平行程
- `commit-changes` — 以描述訊息 commit 已演團隊
