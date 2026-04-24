---
name: evolve-agent
locale: wenyan
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

# 演既有員

改、擴、或造以 `create-agent` 所造員之進變體。此術司員生之維：按最佳實踐評缺、施針對改於人格定、升版、保持 registry 與互引同步。

## 用時

- 庫新技後員之技列過時
- 用戶回示缺能、目不明、例弱
- 工具需易（新 MCP 服、工具去、權減）
- 員目須銳——與他員重或過廣
- 原員外需進變體（如 `r-developer` 與 `r-developer-advanced`）
- 相關員或團新立，See Also 之互引陳

## 入

- **必要**：欲演員文之路（如 `agents/r-developer.md`）
- **必要**：演之因（回、新技、工具易、目重、團合、察限）
- **可選**：版升之大（patch、minor、major）
- **可選**：是否造進變體而非就地改（默：就地改）

## 法

### 第一步：評當員

讀員文並按 `guides/agent-best-practices.md` 之質清單評各節：

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

**得：** 按節組之具體缺、弱、或改機之列。

**敗則：** 若員文不存或無 frontmatter，此技不適——當用 `create-agent` 從頭造。

### 第二步：集演之求

識並類演之因：

| Trigger | Example | Typical Scope |
|---------|---------|---------------|
| User feedback | "Agent missed XSS in review" | Add skill or capability |
| New skills available | Library gained `analyze-api-security` | Update skills list |
| Tool change | New MCP server available | Add to tools/mcp_servers |
| Scope overlap | Two agents both claim "code review" | Sharpen purpose and limitations |
| Team integration | Agent added to a new team | Update See Also, verify capabilities |
| Model upgrade | Task requires deeper reasoning | Change model field |
| Privilege reduction | Agent has Bash but only reads files | Remove unnecessary tools |

編前記所需具體改。各改附目節：

```
- Frontmatter: add `new-skill-id` to skills list
- Capabilities: add "API Security Analysis" capability
- Available Skills: add `new-skill-id` with description
- Limitations: remove outdated limitation about missing skill
- See Also: add link to new team that includes this agent
```

**得：** 具體改之列，各映員文某節。

**敗則：** 若改不明，進前請用戶澄。模糊之演目生模糊之改。

### 第三步：擇演之範

用此決表定就地改或造變體：

| Criteria | Refinement (in-place) | Advanced Variant (new agent) |
|----------|----------------------|------------------------------|
| Agent ID | Unchanged | New ID: `<agent>-advanced` or `<agent>-<specialty>` |
| File path | Same `.md` file | New file in `agents/` |
| Version bump | Patch or minor | Starts at 1.0.0 |
| Model | May change | Often higher (e.g., sonnet → opus) |
| Registry | Update existing entry | New entry added |
| Original agent | Modified directly | Left intact, gains See Also cross-reference |

**就地改**：更技、修文、銳目、調工具時。員保其身。

**變體**：演後版將事顯異之眾、需異模、或加能使原過廣時擇。原留以簡用。

**得：** 明決——改或變——附理。

**敗則：** 不確時默改。後可析變體；合回更難。

### 第四步：施改於員文

#### 於改

直編員文：

- **Frontmatter**：依需更 `skills`、`tools`、`tags`、`model`、`priority`、`mcp_servers`
- **Purpose/Capabilities**：改以映新範或加能
- **Available Skills**：加新技附述，去廢
- **Usage Scenarios**：加或改場景以示新能
- **Limitations**：去不適之限，加新誠者
- **See Also**：更互引以映當前員/團/指之景

循此編則：
- 保諸有節——加容，勿去節
- Available Skills 節與 frontmatter `skills` 列同步
- 勿加默技（`meditate`、`heal`）於 frontmatter，除非為員方法之核
- 驗各技 ID 存：`grep "id: skill-name" skills/_registry.yml`

#### 於變體

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

**得：** 員文（改或新變體）過第一步之評清單。

**敗則：** 若編破文構，用 `git diff` 審改並以 `git checkout -- <file>` 回退部分編。

### 第四·五步：同譯變體

> **譯存時必需。** 此步適人與 AI 二者。勿略——陳 `source_commit` 致 `npm run validate:translations` 於諸 locale 生誤陳警。

察演員是否有譯並更譯以映新源態：

```bash
# Check for existing translations
ls i18n/*/agents/<agent-name>.md 2>/dev/null
```

#### 譯存之時

1. 取當源提交哈：

```bash
SOURCE_COMMIT=$(git rev-parse HEAD)
```

2. 於各譯文 frontmatter 更 `source_commit`：

```bash
for locale_file in i18n/*/agents/<agent-name>.md; do
  sed -i "s/^source_commit: .*/source_commit: $SOURCE_COMMIT/" "$locale_file"
done
```

3. 於提交訊中標所涉 locale 以供重譯：

```
evolve(<agent-name>): <description of changes>

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

**敗則：** 若 `sed` 不配 frontmatter 域，手開譯文驗其 YAML frontmatter 含 `source_commit`。若缺，以 `npm run translate:scaffold -- agents <agent-name> <locale>` 再造。

### 第五步：更版與元數

於 frontmatter 升 `version`，循語義版：

| Change Type | Version Bump | Example |
|-------------|-------------|---------|
| Typo fix, wording clarification | Patch: 1.0.0 → 1.0.1 | Fixed unclear limitation |
| New skills added, capability expanded | Minor: 1.0.0 → 1.1.0 | Added 3 new skills from library |
| Restructured purpose, changed model | Major: 1.0.0 → 2.0.0 | Narrowed scope, upgraded to opus |

亦更：
- `updated` 為今日
- `tags` 若域覆易
- `description` 若目實異
- `priority` 若員對他之重易

**得：** Frontmatter `version` 與 `updated` 映改之大與日。新變體始於 `"1.0.0"`。

**敗則：** 若忘升版，下演無法辨當態與前。提交前必升。

### 第六步：更 registry 與互引

#### 於改

更 `agents/_registry.yml` 中既條以合改後 frontmatter：

```bash
# Find the agent's registry entry
grep -A 10 "id: <agent-name>" agents/_registry.yml
```

更 `description`、`tags`、`tools`、`skills` 以合員文。無須改計。

若員能或名易，更他文之互引：

```bash
# Check if any team references this agent
grep -r "<agent-name>" teams/*.md

# Check if any guide references this agent
grep -r "<agent-name>" guides/*.md
```

#### 於變體

按字母位於 `agents/_registry.yml` 加新員：

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

然後：
1. 增 registry 頂之 `total_agents`
2. 於原員 See Also 加指變體之引
3. 於變體 See Also 加指原之引
4. `.claude/agents/` → `agents/` 之 symlink 令變體自動可發現

**得：** Registry 條合員文 frontmatter。變體時 `total_agents` 等實條數。

**敗則：** 以 `grep -c "^  - id:" agents/_registry.yml` 計條數驗與 `total_agents` 合。

### 第七步：驗演員

行全驗清單：

- [ ] 員文存於預路
- [ ] YAML frontmatter 解無誤
- [ ] `version` 已升（改）或設「1.0.0」（變）
- [ ] `updated` 為今日
- [ ] 諸必節存：Purpose、Capabilities、Available Skills、Usage Scenarios、Examples、Limitations、See Also
- [ ] Frontmatter 之技合 Available Skills 節
- [ ] 諸技 ID 存於 `skills/_registry.yml`
- [ ] 默技（`meditate`、`heal`）不列除非方法之核
- [ ] 工具列循最小權則
- [ ] Registry 條存且合 frontmatter
- [ ] 變體時：`total_agents` 合盤實數
- [ ] 互引雙向（原 ↔ 變）
- [ ] `git diff` 示原容無誤刪

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

**得：** 清單皆過。演員可提交。

**敗則：** 各敗項各處。最常演後問題為 Available Skills 之陳技 ID 與忘更 `updated`。

## 驗

- [ ] 員文存且 YAML frontmatter 有效
- [ ] `version` 域映所改
- [ ] `updated` 日為當
- [ ] 諸節存而內一
- [ ] Frontmatter `skills` 合 Available Skills 節
- [ ] 諸技 ID 存於 `skills/_registry.yml`
- [ ] 默技不必要列
- [ ] Registry 條合員文
- [ ] 變體時：`agents/_registry.yml` 附新條附正路
- [ ] 變體時：`total_agents` 已更
- [ ] 互引有效（See Also 無破）
- [ ] 有譯之改：諸 locale 文 `source_commit` 已更
- [ ] `git diff` 確無誤刪

## 陷

- **忘升版**：無升則不能追何變何時。提交前必更 frontmatter `version` 與 `updated`
- **演後陳譯**：庫中 1,288+ 譯文，每員演引至 4 locale 文陳。必以 `ls i18n/*/agents/<agent-name>.md` 察並更各 `source_commit`，或於提交訊標供重譯
- **技列漂**：Frontmatter `skills` 與 `## Available Skills` 節必同步。一更而不更另致人機皆惑
- **不必列默技**：於 frontmatter 加 `meditate` 或 `heal`，彼已自 registry 承。唯為方法之核時列（如 `mystic`、`alchemist`）
- **演時工具過給**：演時加 `Bash` 或 `WebFetch`「以備」。每工具加須具體新能證
- **變體後 See Also 陳**：造變體時，原與變須互引。單向引令圖不全
- **Registry 條未更**：員技、工、述改後必更 `agents/_registry.yml`。陳條致發現與工具敗

## 參

- `create-agent` — 造新員之基；evolve-agent 假此先循
- `evolve-skill` — 並行演 SKILL.md 文之術
- `commit-changes` — 以述訊提交演員
