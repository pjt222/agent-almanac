---
name: evolve-agent
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Evolve an existing agent definition by refining its persona in-place or
  creating an advanced variant. Covers assessing the current agent against
  best practices, gathering evolution requirements, choosing scope
  (refinement vs. variant), applying changes to skills, tools, capabilities,
  and limitations, updating version metadata, and synchronizing the registry
  and cross-references. Use when an agent's skills list is outdated, user
  feedback reveals capability gaps, tool requirements have changed, an
  advanced variant is needed alongside the original, or the agent's scope
  needs sharpening after real-world use.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: meta, agent, evolution, maintenance, versioning
---

# 演舊 agent

改、擴、或造原以 `create-agent` 建之 agent 之進階變。此行屬 agent 生週之維：較最佳踐估缺、施針對改於 persona 定、升版、使登記與交引同步。

## 用

- 技庫加新技後 agent 之技列舊
- 用者反饋示能缺、旨不明、例弱
- 工具求變（新 MCP 服、工去、需減權）
- agent 範須銳——與他 agent 重或過廣
- 須於原之側有進階變（如 `r-developer` 與 `r-developer-advanced`）
- 加新 agent 或 team 而 See Also 舊

## 入

- **必**：欲演 agent 文之徑（如 `agents/r-developer.md`）
- **必**：演因（反饋、新技、工變、範重、team 入、見限）
- **可**：目標版升級（patch、minor、major）
- **可**：是否造進階變代原地改（默：原地）

## 行

### 一：估現 agent

讀舊 agent 文並據 `guides/agent-best-practices.md` 之質察表估各節：

| Section | What to Check | Common Issues |
|---------|--------------|---------------|
| Frontmatter | All required fields present (`name`, `description`, `tools`, `model`, `version`, `author`) | Missing `tags`, stale `version`, wrong `priority` |
| Purpose | Specific problem statement, not generic "helps with X" | Vague or overlapping with another agent |
| Capabilities | Concrete, verifiable capabilities with bold lead-ins | Generic ("handles development"), no grouping |
| Available Skills | Matches frontmatter `skills` list, all IDs exist in registry | Stale IDs, missing new skills, lists default skills unnecessarily |
| Usage Scenarios | 2-3 realistic scenarios with invocation patterns | Placeholder text, unrealistic examples |
| Examples | Shows user request and agent behavior | Missing or trivial examples |
| Limitations | 3-5 honest constraints | Too few, too vague, or missing entirely |
| See Also | Valid cross-references to agents, guides, teams | Stale links to renamed or removed files |

```bash
# Read the agent file
cat agents/<agent-name>.md

# Check frontmatter parses
head -20 agents/<agent-name>.md

# Verify skills in frontmatter exist in registry
grep "skills:" -A 20 agents/<agent-name>.md

# Check if agent is referenced by any team
grep -r "<agent-name>" teams/*.md
```

得：依節分之特缺、弱、機會之列。

敗：agent 文缺或無 frontmatter→此技不適；用 `create-agent` 自零造之。

### 二：集演求

識並分觸演之因：

| Trigger | Example | Typical Scope |
|---------|---------|---------------|
| User feedback | "Agent missed XSS in review" | Add skill or capability |
| New skills available | Library gained `analyze-api-security` | Update skills list |
| Tool change | New MCP server available | Add to tools/mcp_servers |
| Scope overlap | Two agents both claim "code review" | Sharpen purpose and limitations |
| Team integration | Agent added to a new team | Update See Also, verify capabilities |
| Model upgrade | Task requires deeper reasoning | Change model field |
| Privilege reduction | Agent has Bash but only reads files | Remove unnecessary tools |

編前錄須特改。各改映於特節：

```
- Frontmatter: add `new-skill-id` to skills list
- Capabilities: add "API Security Analysis" capability
- Available Skills: add `new-skill-id` with description
- Limitations: remove outdated limitation about missing skill
- See Also: add link to new team that includes this agent
```

得：具改之列，各映於 agent 文之特節。

敗：改不明→進前請用者明之。模糊演標產模糊改。

### 三：擇演範

用此決矩定原地改或造變：

| Criteria | Refinement (in-place) | Advanced Variant (new agent) |
|----------|----------------------|------------------------------|
| Agent ID | Unchanged | New ID: `<agent>-advanced` or `<agent>-<specialty>` |
| File path | Same `.md` file | New file in `agents/` |
| Version bump | Patch or minor | Starts at 1.0.0 |
| Model | May change | Often higher (e.g., sonnet → opus) |
| Registry | Update existing entry | New entry added |
| Original agent | Modified directly | Left intact, gains See Also cross-reference |

**原地改**：更技、修文、銳範、調工時擇。agent 保同。

**變**：演版將服大異眾、需異型、或加使原過廣之能時擇。原存以供簡用。

得：明決——改或變——並有理。

敗：不確→默改。後可抽變；合難。

### 四：施改於 agent 文

#### 原地改

直編舊 agent 文：

- **Frontmatter**：按須更 `skills`、`tools`、`tags`、`model`、`priority`、`mcp_servers`
- **Purpose/Capabilities**：改以反新範或加能
- **Available Skills**：加新技含述、去棄者
- **Usage Scenarios**：加或改景以示新能
- **Limitations**：去不適之約、加新實者
- **See Also**：更交引反現 agent/team/guide 域

循此編則：
- 保諸節——加容，勿去節
- Available Skills 與 frontmatter `skills` 列同
- 默技（`meditate`、`heal`）非 agent 核法勿入 frontmatter
- 驗各技 ID 存：`grep "id: skill-name" skills/_registry.yml`

#### 變

```bash
# Copy the original as a starting point
cp agents/<agent-name>.md agents/<agent-name>-advanced.md

# Edit the variant:
# - Change `name` to `<agent-name>-advanced`
# - Update `description` to reflect the advanced scope
# - Raise `model` if needed (e.g., sonnet → opus)
# - Reset `version` to "1.0.0"
# - Expand skills, capabilities, and examples for the advanced use case
# - Reference the original in See Also as a simpler alternative
```

得：agent 文（改或新變）過一步估表。

敗：編破文構→用 `git diff` 閱改，以 `git checkout -- <file>` 復部分。

### 四半：同譯變

> **譯存時必**。此步適人作者與 AI agent 循此行。勿略——舊 `source_commit` 致 `npm run validate:translations` 於諸地報偽舊警。

察演之 agent 譯否存並更以反新源態：

```bash
# Check for existing translations
ls i18n/*/agents/<agent-name>.md 2>/dev/null
```

#### 若譯存

1. 取現源 commit 雜：

```bash
SOURCE_COMMIT=$(git rev-parse HEAD)
```

2. 於諸譯文 frontmatter 中更 `source_commit`：

```bash
for locale_file in i18n/*/agents/<agent-name>.md; do
  sed -i "s/^source_commit: .*/source_commit: $SOURCE_COMMIT/" "$locale_file"
done
```

3. 旗待重譯之地入 commit 信：

```
evolve(<agent-name>): <description of changes>

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

敗：`sed` 匹 frontmatter 欄敗→手開譯文驗其 YAML frontmatter 含 `source_commit`。若欄缺→重 scaffold 以 `npm run translate:scaffold -- agents <agent-name> <locale>`。

### 五：更版與元

依語義版升 frontmatter 之 `version`：

| Change Type | Version Bump | Example |
|-------------|-------------|---------|
| Typo fix, wording clarification | Patch: 1.0.0 → 1.0.1 | Fixed unclear limitation |
| New skills added, capability expanded | Minor: 1.0.0 → 1.1.0 | Added 3 new skills from library |
| Restructured purpose, changed model | Major: 1.0.0 → 2.0.0 | Narrowed scope, upgraded to opus |

亦更：
- `updated` 為今日
- `tags` 若域覆變
- `description` 若旨大異
- `priority` 若相重變

得：frontmatter `version` 與 `updated` 反改之度與日。新變自 `"1.0.0"` 起。

敗：忘升版→下演無法別現態於舊。commit 前必升。

### 六：更登記與交引

#### 原地改

更 `agents/_registry.yml` 中舊條以匹改 frontmatter：

```bash
# Find the agent's registry entry
grep -A 10 "id: <agent-name>" agents/_registry.yml
```

更 `description`、`tags`、`tools`、`skills` 以匹 agent 文。計無變。

若 agent 之能或名變→更他文交引：

```bash
# Check if any team references this agent
grep -r "<agent-name>" teams/*.md

# Check if any guide references this agent
grep -r "<agent-name>" guides/*.md
```

#### 變

於 `agents/_registry.yml` 依字母位加新 agent：

```yaml
  - id: <agent-name>-advanced
    path: agents/<agent-name>-advanced.md
    description: One-line description of the advanced variant
    tags: [domain, specialty, advanced]
    priority: normal
    tools: [Read, Write, Edit, Bash, Grep, Glob]
    skills:
      - skill-id-one
      - skill-id-two
```

後：
1. 增登首之 `total_agents`
2. 於原 agent 之 See Also 加指變之交引
3. 於變之 See Also 加指原之交引
4. `.claude/agents/` 指 `agents/` 之符鏈使變自可察

得：登條與 agent frontmatter 匹。變：`total_agents` 等實 agent 數。

敗：以 `grep -c "^  - id:" agents/_registry.yml` 計條並驗匹 `total_agents`。

### 七：驗演 agent

行全驗表：

- [ ] agent 文於期徑存
- [ ] YAML frontmatter 解而無誤
- [ ] `version` 已升（改）或設 "1.0.0"（變）
- [ ] `updated` 反今
- [ ] 諸必節在：Purpose、Capabilities、Available Skills、Usage Scenarios、Examples、Limitations、See Also
- [ ] frontmatter 技與 Available Skills 節匹
- [ ] 諸技 ID 存於 `skills/_registry.yml`
- [ ] 默技（`meditate`、`heal`）非核法則不列
- [ ] 工列循最少權原則
- [ ] 登條存且與 frontmatter 匹
- [ ] 變：`total_agents` 計匹碟上實數
- [ ] 交引雙向（原 ↔ 變）
- [ ] `git diff` 示無偶去原容

```bash
# Verify frontmatter
head -20 agents/<agent-name>.md

# Check skills exist
for skill in skill-a skill-b; do
  grep "id: $skill" skills/_registry.yml
done

# Count agents on disk vs registry
ls agents/*.md | grep -v template | wc -l
grep total_agents agents/_registry.yml

# Review all changes
git diff
```

得：諸表項過。演 agent 可 commit。

敗：各敗項獨處。演後最常議：Available Skills 中技 ID 舊、忘之 `updated` 日。

## 驗

- [ ] agent 文存且有效 YAML frontmatter
- [ ] `version` 欄反改
- [ ] `updated` 日現
- [ ] 諸節在並內一致
- [ ] frontmatter `skills` 陣與 Available Skills 節匹
- [ ] 諸技 ID 存於 `skills/_registry.yml`
- [ ] 默技不冗列
- [ ] 登條匹 agent 文
- [ ] 變：`agents/_registry.yml` 中新條徑正
- [ ] 變：`total_agents` 計已更
- [ ] 交引有效（See Also 無斷鏈）
- [ ] 含譯之改：諸地文 `source_commit` 已更
- [ ] `git diff` 證無偶去容

## 忌

- **忘升版**：無升則無法追何變何時。commit 前必更 frontmatter 之 `version` 與 `updated`
- **演後譯舊**：庫中 1,288+ 譯文，每 agent 演觸至多 4 地舊。必以 `ls i18n/*/agents/<agent-name>.md` 察譯並各更 `source_commit`，或於 commit 信中旗重譯
- **技列漂**：frontmatter `skills` 陣與 `## Available Skills` 節須同。更一不更他致人與工具亂
- **冗列默技**：加 `meditate` 或 `heal` 於 frontmatter 而登已繼。唯核法時列（如 `mystic`、`alchemist`）
- **演時過備工**：「備用」而加 `Bash` 或 `WebFetch`。每加工須以特新能證
- **變後 See Also 舊**：造變時原與變須互引。單向留圖不全
- **登條不更**：改 agent 之技、工、述後，`agents/_registry.yml` 條須更匹。舊登致察與工具敗

## 參

- `create-agent` — 造新 agent 之基；evolve-agent 設此先循
- `evolve-skill` — 演 SKILL.md 之並行行
- `commit-changes` — 以述信 commit 演 agent
