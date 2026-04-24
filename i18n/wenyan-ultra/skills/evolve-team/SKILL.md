---
name: evolve-team
locale: wenyan-ultra
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

# 演舊 team

改、重構、或造原以 `create-team` 建之 team 之專變。此行屬 team 生週之維：據模與協模估缺、施針對改於組與流、升版、使登記與交引同步。

## 用

- agent 加、去、演後 team 之員名舊
- 用者反饋示流瓶、交遞不明、或缺角
- 協模不合實流（如 hub-and-spoke 宜為 parallel）
- 須於原之側有專變（如 `r-package-review` 與 `r-package-review-security-focused`）
- 員責重須銳界
- CONFIG 塊與述或員列不同
- team 須分為二小或二須合

## 入

- **必**：欲演 team 文徑（如 `teams/r-package-review.md`）
- **必**：演因（反饋、新 agent、協錯、範重、性議、agent 演）
- **可**：目標版升級（patch、minor、major）
- **可**：是否造專變代原地改（默：原地）

## 行

### 一：估現 team

讀舊 team 文並據 team 模（`teams/_template.md`）估各節：

| Section | What to Check | Common Issues |
|---------|--------------|---------------|
| Frontmatter | All required fields (`name`, `description`, `lead`, `version`, `author`, `coordination`, `members[]`) | Missing `tags`, stale `version`, wrong `coordination` |
| Purpose | Clear multi-agent justification (at least two distinct specialties) | Could be handled by a single agent |
| Team Composition | Table matches frontmatter members, no overlapping responsibilities | Stale table, duplicated focus areas |
| Coordination Pattern | Matches actual workflow, ASCII diagram present | Wrong pattern for the workflow |
| Task Decomposition | Phased breakdown with concrete tasks per member | Vague tasks, missing phases |
| CONFIG Block | Valid YAML between markers, matches frontmatter and prose | Out of sync, missing `blocked_by`, invalid YAML |
| Usage Scenarios | 2-3 realistic activation prompts | Placeholder text |
| Limitations | 3-5 honest constraints | Missing or too generic |
| See Also | Valid links to member agents, related teams, guides | Stale links |

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

得：依節分之特缺、弱、機會之列。

敗：team 文缺或無 frontmatter→此技不適；用 `create-team` 自零造之。

### 二：集演求

識並分觸演之因：

| Trigger | Example | Typical Scope |
|---------|---------|---------------|
| User feedback | "Reviews take too long, agents duplicate effort" | Sharpen responsibilities or change pattern |
| New agent available | `api-security-analyst` agent was created | Add member |
| Agent evolved | `code-reviewer` gained new skills | Update member responsibilities |
| Agent removed | `deprecated-agent` was retired | Remove member, reassign tasks |
| Coordination mismatch | Sequential team has independent subtasks | Change to parallel |
| Scope expansion | Team needs to cover deployment, not just review | Add member or create variant |
| Team too large | 6+ members causing coordination overhead | Split into two teams |
| Team too small | Single member does most of the work | Merge with another team or add members |

編前錄須特改：

```
- Frontmatter: add new member `api-security-analyst` with role "API Security Reviewer"
- Team Composition: add row to composition table
- Task Decomposition: add API security review tasks to execution phase
- CONFIG block: add member and tasks entries
- See Also: add link to new agent file
```

得：具改之列，各映於 team 文之特節。

敗：改不明→進前請用者明之。模糊演標產模糊改。

### 三：擇演範

用此決矩定原地改或造變：

| Criteria | Refinement (in-place) | Specialized Variant (new team) |
|----------|----------------------|-------------------------------|
| Team ID | Unchanged | New ID: `<team>-<specialty>` |
| File path | Same `.md` file | New file in `teams/` |
| Version bump | Patch or minor | Starts at 1.0.0 |
| Coordination | May change | May differ from original |
| Registry | Update existing entry | New entry added |
| Original team | Modified directly | Left intact, gains See Also cross-reference |

**原地改**：調員、銳責、修 CONFIG、改協模時擇。team 保同。

**變**：演版服大異用、需異協模、標異眾時擇。原存以現用。

更範決：

| Situation | Action |
|-----------|--------|
| Team has 6+ members and is slow | Split into two focused teams |
| Two teams of 2 cover adjacent domains | Merge into one team of 3-4 |
| Team's coordination pattern is wrong | Refinement — change pattern in-place |
| Team needs entirely different lead | Refinement if lead exists; create agent first if not |

得：明決——改、變、分、合——並有理。

敗：不確→默改。分合之影響大，宜與用者確。

### 四：施改於 team 文

#### 原地改

直編舊 team 文。諸引員組之節保一致：

1. **Frontmatter `members[]`**：加、去、或更員條（各含 `id`、`role`、`responsibilities`）
2. **Team Composition 表**：須正匹 frontmatter 員
3. **Coordination Pattern**：若模變，更述與 ASCII 圖
4. **Task Decomposition**：改段與各員任務以反新組
5. **CONFIG 塊**：更 `members` 與 `tasks` 以匹（見五步）
6. **Usage Scenarios**：若觸發變則改
7. **Limitations**：更反新約或去已解者
8. **See Also**：更 agent 鏈並加指新關 team 或 guide 之引

循此編則：
- 保諸節——加容，勿去節
- 加員時→於**諸處**皆加：frontmatter、組表、task decomposition、CONFIG
- 去員時→於諸處皆去並再賦其任
- 驗各員存：`grep "id: agent-name" agents/_registry.yml`
- lead 保於員列中——lead 永為員

#### 變

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

得：team 文（改或新變）過一步估表，諸節內一致。

敗：編破內一致（如 CONFIG 列 frontmatter 未有之員）→較 frontmatter `members[]` 於 Team Composition、Task Decomposition、CONFIG 以尋錯。

### 四半：同譯變

> **譯存時必**。此步適人作者與 AI agent 循此行。勿略——舊 `source_commit` 致 `npm run validate:translations` 報偽舊警。

察演 team 譯否存並更以反新源態：

```bash
# Check for existing translations
ls i18n/*/teams/<team-name>.md 2>/dev/null
```

#### 若譯存

1. 取現源 commit 雜：

```bash
SOURCE_COMMIT=$(git rev-parse HEAD)
```

2. 於諸譯文 frontmatter 中更 `source_commit`：

```bash
for locale_file in i18n/*/teams/<team-name>.md; do
  sed -i "s/^source_commit: .*/source_commit: $SOURCE_COMMIT/" "$locale_file"
done
```

3. 旗待重譯之地入 commit 信：

```
evolve(<team-name>): <description of changes>

Translations flagged for re-sync: de, zh-CN, ja, es
Changed sections: <list sections that changed>
```

4. 重生譯態文：

```bash
npm run translation:status
```

#### 若無譯

無須行。進五步。

#### 變

新變之譯宜於變穩（1-2 版）後行。變至少改一次後加譯。

得：諸譯文 `source_commit` 更至現 commit。`npm run translation:status` 退 0。

敗：`sed` 匹欄敗→手開譯文驗 YAML frontmatter 含 `source_commit`。若欄缺→以 `npm run translate:scaffold -- teams <team-name> <locale>` 重 scaffold。

### 五：更 CONFIG 塊

`<!-- CONFIG:START -->` 與 `<!-- CONFIG:END -->` 間之 CONFIG 塊須與述節同。任員或任務變後：

1. 驗 CONFIG `members` 中諸 `agent` 匹 frontmatter 員
2. 驗 CONFIG `tasks` 中諸 `assignee` 匹員 agent id
3. 若任序變→更 `blocked_by` 依
4. 確綜合/末任引諸前任

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

得：CONFIG YAML 有效，諸 agent 與任務與文餘同，`blocked_by` 成有效 DAG。

敗：獨解 CONFIG 塊 YAML 尋語法誤。交察每 `assignee` 於 `members` 列。

### 六：更版與元

依語義版升 frontmatter `version`：

| Change Type | Version Bump | Example |
|-------------|-------------|---------|
| Wording fix, See Also update | Patch: 1.0.0 → 1.0.1 | Fixed stale agent link |
| New member added, tasks revised | Minor: 1.0.0 → 1.1.0 | Added security-analyst member |
| Coordination pattern changed, team restructured | Major: 1.0.0 → 2.0.0 | Changed from hub-and-spoke to parallel |

亦更：
- `updated` 為今日
- `tags` 若域覆變
- `description` 若旨大異
- `coordination` 若模變

得：frontmatter `version` 與 `updated` 反改之度與日。新變自 `"1.0.0"` 起。

敗：忘升版→下演無法別現態於舊。commit 前必升。

### 七：更登記與交引

#### 原地改

更 `teams/_registry.yml` 舊條以匹改 frontmatter：

```bash
# Find the team's registry entry
grep -A 10 "id: <team-name>" teams/_registry.yml
```

更 `description`、`lead`、`members`、`coordination` 以匹 team 文。計無變。

#### 變

於 `teams/_registry.yml` 加新 team：

```yaml
- id: <team-name>-<specialty>
  path: <team-name>-<specialty>.md
  lead: <lead-agent>
  members: [agent-1, agent-2, agent-3]
  coordination: <pattern>
  description: One-line description of the specialized variant
```

後：
1. 增登首 `total_teams`
2. 於原 team See Also 加指變之交引
3. 於變 See Also 加指原之交引

行 README 自動：

```bash
npm run update-readmes
```

得：登條匹 team 文 frontmatter。`npm run update-readmes` 退 0。變：`total_teams` 等實 team 數。

敗：登計誤→以 `grep -c "^  - id:" teams/_registry.yml` 計並正。README 自動敗→驗 `package.json` 存且 `js-yaml` 已裝。

### 八：驗演 team

行全驗表：

- [ ] team 文於期徑存
- [ ] YAML frontmatter 解而無誤
- [ ] `version` 已升（改）或設 "1.0.0"（變）
- [ ] `updated` 反今
- [ ] 諸必節在：Purpose、Team Composition、Coordination Pattern、Task Decomposition、Configuration、Usage Scenarios、Limitations、See Also
- [ ] frontmatter `members[]` 匹 Team Composition 表
- [ ] CONFIG 塊員匹 frontmatter 員
- [ ] CONFIG 塊任有效 assignee 與 `blocked_by`
- [ ] 諸員 agent ID 存於 `agents/_registry.yml`
- [ ] lead 於員列
- [ ] 無二員共主責
- [ ] 登條存且匹 frontmatter
- [ ] 變：`total_teams` 計匹實計
- [ ] 交引雙向（原 ↔ 變）
- [ ] `git diff` 示無偶去原容

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

得：諸表項過。演 team 可 commit。

敗：各敗項獨處。演後最常議：CONFIG 塊漂（員或任與述不匹）與忘之 `updated` 日。

## 驗

- [ ] team 文存且有效 YAML frontmatter
- [ ] `version` 反改
- [ ] `updated` 日現
- [ ] 諸節在並內一致
- [ ] frontmatter `members[]`、Team Composition 表、CONFIG 塊同
- [ ] 諸員 agent ID 存於 `agents/_registry.yml`
- [ ] lead 於員列
- [ ] CONFIG 塊 YAML 有效可解
- [ ] 登條匹 team 文
- [ ] 變：`teams/_registry.yml` 中新條徑正
- [ ] 變：`total_teams` 計已更
- [ ] 交引有效（See Also 無斷鏈）
- [ ] 含譯之改：諸地文 `source_commit` 已更
- [ ] `git diff` 證無偶去容

## 忌

- **CONFIG 塊漂**：CONFIG 塊、frontmatter、述節三者須於員與任上同。更一不更他為最常之 team 演誤。每改後三處交察
- **忘升版**：無升則無法追何變何時。commit 前必更 frontmatter `version` 與 `updated`
- **演後譯舊**：每 team 演觸至多 4 地舊。以 `ls i18n/*/teams/<team-name>.md` 察並各更 `source_commit`，或於 commit 信中旗重譯
- **孤員引**：去員時其 Task Decomposition 與 CONFIG 中任須再賦或去。留孤 assignee 致激活敗
- **演後協錯**：加並行能員於序 team，或使 hub-and-spoke team 中 agent 需互出。任結構變後據 `create-team` 四步重估協決
- **加員後過大**：員過 5 則難協。若演過 5→考分為二焦 team
- **變後 See Also 舊**：造變時原與變須互引。單向留圖不全

## 參

- `create-team` — 造新 team 之基；evolve-team 設先循
- `evolve-skill` — 演 SKILL.md 之並行行
- `evolve-agent` — 演 agent 定之並行行
- `commit-changes` — 以述信 commit 演 team
