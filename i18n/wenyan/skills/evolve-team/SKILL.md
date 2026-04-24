---
name: evolve-team
locale: wenyan
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

# 演既有團

改、重構、或造以 `create-team` 所造團之專變體。此術司團生之維：按模板與協調模評缺、施針對改於構與流、升版、保 registry 與互引同步。

## 用時

- 加去或演員後團員名單陳
- 用戶回示流瓶頸、不明交、缺觀
- 協調模不合團之實流（如 hub-and-spoke 宜並行）
- 原外需專變體（如 `r-package-review` 與 `r-package-review-security-focused`）
- 員職疊需銳界
- CONFIG 塊與述或員列失同
- 團須分為二小團，或二團須合

## 入

- **必要**：欲演團文之路（如 `teams/r-package-review.md`）
- **必要**：演之因（回、新員、協調不合、目重、性能、員演）
- **可選**：版升之大（patch、minor、major）
- **可選**：是否造專變體而非就地改（默：就地改）

## 法

### 第一步：評當團

讀團文並按團模板（`teams/_template.md`）評各節：

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

**得：** 按節組之具體缺、弱、或改機之列。

**敗則：** 若團文不存或無 frontmatter，此技不適——當用 `create-team` 從頭造。

### 第二步：集演之求

識並類演之因：

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

編前記具體改：

```
- Frontmatter: add new member `api-security-analyst` with role "API Security Reviewer"
- Team Composition: add row to composition table
- Task Decomposition: add API security review tasks to execution phase
- CONFIG block: add member and tasks entries
- See Also: add link to new agent file
```

**得：** 具體改之列，各映團文某節。

**敗則：** 若改不明，進前請用戶澄。模糊演目生模糊改。

### 第三步：擇演範

用此決表定就地改或造變體：

| Criteria | Refinement (in-place) | Specialized Variant (new team) |
|----------|----------------------|-------------------------------|
| Team ID | Unchanged | New ID: `<team>-<specialty>` |
| File path | Same `.md` file | New file in `teams/` |
| Version bump | Patch or minor | Starts at 1.0.0 |
| Coordination | May change | May differ from original |
| Registry | Update existing entry | New entry added |
| Original team | Modified directly | Left intact, gains See Also cross-reference |

**改**：調員、銳職、修 CONFIG、易協調模時擇。團保其身。

**變體**：演後事顯異用例、需異協調、或異眾時擇。原留供舊用例。

加範決：

| Situation | Action |
|-----------|--------|
| Team has 6+ members and is slow | Split into two focused teams |
| Two teams of 2 cover adjacent domains | Merge into one team of 3-4 |
| Team's coordination pattern is wrong | Refinement — change pattern in-place |
| Team needs entirely different lead | Refinement if lead exists; create agent first if not |

**得：** 明決——改、變、分、或合——附理。

**敗則：** 不確時默改。分合團衝爆大，宜與用戶確。

### 第四步：施改於團文

#### 於改

直編團文。諸引團構之節保一：

1. **Frontmatter `members[]`**：加、去、或更員條（各附 `id`、`role`、`responsibilities`）
2. **Team Composition 表**：必合 frontmatter 員
3. **Coordination Pattern**：模易時更述與 ASCII 圖
4. **Task Decomposition**：改階與員任以映新構
5. **CONFIG 塊**：更 `members` 與 `tasks` 以合（見五步）
6. **Usage Scenarios**：若團之觸易則改
7. **Limitations**：更以映新限或去解者
8. **See Also**：更員引，加指新相關團或指之引

循此編則：
- 保諸有節——加容，勿去節
- 加員時須於*所有*：frontmatter、構表、任分、CONFIG 塊
- 去員時須於*所有*彼處去並重分其任
- 驗各員員存：`grep "id: agent-name" agents/_registry.yml`
- 首於員列——首常為一員

#### 於變體

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

**得：** 團文（改或新變體）過第一步之評清單，諸節內一致。

**敗則：** 若編破內一（如 CONFIG 列一非 frontmatter 之員），較 frontmatter `members[]` 與 Team Composition 表、Task Decomposition、CONFIG 以尋失配。

### 第四·五步：同譯變體

> **譯存時必需。** 此步適人與 AI 二者。勿略——陳 `source_commit` 致 `npm run validate:translations` 於諸 locale 生誤陳警。

察演團是否有譯並更譯以映新源態：

```bash
# Check for existing translations
ls i18n/*/teams/<team-name>.md 2>/dev/null
```

#### 譯存之時

1. 取當源提交哈：

```bash
SOURCE_COMMIT=$(git rev-parse HEAD)
```

2. 於各譯文 frontmatter 更 `source_commit`：

```bash
for locale_file in i18n/*/teams/<team-name>.md; do
  sed -i "s/^source_commit: .*/source_commit: $SOURCE_COMMIT/" "$locale_file"
done
```

3. 於提交訊中標所涉 locale 以供重譯：

```
evolve(<team-name>): <description of changes>

Translations flagged for re-sync: de, zh-CN, ja, es
Changed sections: <list sections that changed>
```

4. 重生譯狀文：

```bash
npm run translation:status
```

#### 無譯之時

無須行。進第五步。

#### 於變體

新變體之譯延至變體穩（1-2 版）。變體改至少一次後方加譯。

**得：** 諸譯文 `source_commit` 更至當提交。`npm run translation:status` 出 0。

**敗則：** 若 `sed` 不配 frontmatter 域，手開譯文驗其 YAML frontmatter 含 `source_commit`。若缺，以 `npm run translate:scaffold -- teams <team-name> <locale>` 再造。

### 第五步：更 CONFIG 塊

`<!-- CONFIG:START -->` 與 `<!-- CONFIG:END -->` 間之 CONFIG 塊須與述諸節同。任何員或任改後：

1. 驗 CONFIG `members` 中每 `agent` 合 frontmatter 之員
2. 驗 CONFIG `tasks` 中每 `assignee` 合某員員 id
3. 若任序改，更 `blocked_by` 依
4. 確合成/末任引諸先任

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

**得：** CONFIG YAML 有效，諸員與任與文餘同，`blocked_by` 成有效 DAG。

**敗則：** 獨解 CONFIG YAML 尋語誤。交察每 `assignee` 於 `members` 列。

### 第六步：更版與元數

於 frontmatter 升 `version`，循語義版：

| Change Type | Version Bump | Example |
|-------------|-------------|---------|
| Wording fix, See Also update | Patch: 1.0.0 → 1.0.1 | Fixed stale agent link |
| New member added, tasks revised | Minor: 1.0.0 → 1.1.0 | Added security-analyst member |
| Coordination pattern changed, team restructured | Major: 1.0.0 → 2.0.0 | Changed from hub-and-spoke to parallel |

亦更：
- `updated` 日為當
- `tags` 若團之域覆易
- `description` 若團目實異
- `coordination` 若模易

**得：** Frontmatter `version` 與 `updated` 映改之大與日。新變體始於 `"1.0.0"`。

**敗則：** 若忘升版，下演無法辨當態與前。提交前必升。

### 第七步：更 Registry 與互引

#### 於改

更 `teams/_registry.yml` 中既條以合改後 frontmatter：

```bash
# Find the team's registry entry
grep -A 10 "id: <team-name>" teams/_registry.yml
```

更 `description`、`lead`、`members`、`coordination` 以合團文。無計改。

#### 於變體

於 `teams/_registry.yml` 加新團：

```yaml
- id: <team-name>-<specialty>
  path: <team-name>-<specialty>.md
  lead: <lead-agent>
  members: [agent-1, agent-2, agent-3]
  coordination: <pattern>
  description: One-line description of the specialized variant
```

然後：
1. 增 registry 頂之 `total_teams`
2. 於原團 See Also 加指變體之引
3. 於變體 See Also 加指原之引

運 README 自動：

```bash
npm run update-readmes
```

**得：** Registry 條合團文 frontmatter。`npm run update-readmes` 出 0。變體時 `total_teams` 等實條數。

**敗則：** 若 registry 計誤，以 `grep -c "^  - id:" teams/_registry.yml` 計條並正。若 README 自動敗，驗 `package.json` 存而 `js-yaml` 已裝。

### 第八步：驗演團

行全驗清單：

- [ ] 團文存於預路
- [ ] YAML frontmatter 解無誤
- [ ] `version` 已升（改）或設「1.0.0」（變）
- [ ] `updated` 日為當
- [ ] 諸必節存：Purpose、Team Composition、Coordination Pattern、Task Decomposition、Configuration、Usage Scenarios、Limitations、See Also
- [ ] Frontmatter `members[]` 合 Team Composition 表
- [ ] CONFIG 塊員合 frontmatter 員
- [ ] CONFIG 塊任之 assignee 與 `blocked_by` 有效
- [ ] 諸員員 ID 存於 `agents/_registry.yml`
- [ ] 首於員列
- [ ] 無二員共主職
- [ ] Registry 條存合 frontmatter
- [ ] 變體時：`total_teams` 合盤實數
- [ ] 互引雙向（原 ↔ 變）
- [ ] `git diff` 示原容無誤刪

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

**得：** 清單皆過。演團可提交。

**敗則：** 各敗項各處。最常演後問為 CONFIG 塊漂（員或任不合述）與忘 `updated`。

## 驗

- [ ] 團文存且 YAML frontmatter 有效
- [ ] `version` 映所改
- [ ] `updated` 為當
- [ ] 諸節存而內一
- [ ] Frontmatter `members[]`、Team Composition 表、CONFIG 塊同步
- [ ] 諸員員 ID 存於 `agents/_registry.yml`
- [ ] 首於員列
- [ ] CONFIG 塊 YAML 有效可解
- [ ] Registry 條合團文
- [ ] 變體時：`teams/_registry.yml` 新條附正路
- [ ] 變體時：`total_teams` 已更
- [ ] 互引有效（See Also 無破）
- [ ] 有譯之改：諸 locale 文 `source_commit` 已更
- [ ] `git diff` 確無誤刪

## 陷

- **CONFIG 塊漂**：CONFIG 塊、frontmatter、述諸節於員與任必一。更一而不更餘乃團演最常誤。每改後交察三者
- **忘升版**：無升則不能追何變何時。提交前必更 frontmatter `version` 與 `updated`
- **演後陳譯**：每團演引至 4 locale 文陳。必以 `ls i18n/*/teams/<team-name>.md` 察並更各 `source_commit`，或於提交訊標供重譯
- **孤員引**：去員時其於 Task Decomposition 與 CONFIG 之任須重分或去。留孤 assignee 致活敗
- **演後誤協調**：加可並員於順序團，或造員相賴出之 hub-and-spoke。任構易後復察 `create-team` 第四步之模決
- **加員後團過大**：逾五員之團難協。若演使逾五，宜分為二焦團
- **變體後 See Also 陳**：造變體時原與變須互引。單向引令圖不全

## 參

- `create-team` — 造新團之基；evolve-team 假此先循
- `evolve-skill` — 並行演 SKILL.md 文之術
- `evolve-agent` — 並行演員定之術
- `commit-changes` — 以述訊提交演團
