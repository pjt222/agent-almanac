---
name: create-agent
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Create a new agent definition file following the agent-almanac
  agent template and registry conventions. Covers persona design,
  tool selection, skill assignment, model choice, frontmatter schema,
  required sections, registry integration, and discovery symlink
  verification. Use when adding a new specialized agent to the library,
  defining a persona for a Claude Code subagent, or creating a
  domain-specific assistant with curated skills and tools.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: meta, agent, creation, persona, agentskills
---

# 造代

定 Claude Code 子代之身。含精目、選具、賦技、備檔。

## 用

- 為未涵域加專代
- 化復流或模為可重之代
- 以選技具造域專助
- 分過泛代為專責代
- 組多代團前設新員

## 入

- **必**：代名（小寫、kebab-case，如 `data-engineer`）
- **必**：一行述代主目
- **必**：解所治問之目述
- **可**：模選（默：`sonnet`；代：`opus`、`haiku`）
- **可**：優先（默：`normal`；代：`high`、`low`）
- **可**：`skills/_registry.yml` 中之技列
- **可**：代需 MCP 服（如 `r-mcptools`、`hf-mcp-server`）

## 行

### 一：設代身

擇明專之代身：

- **Name**：小寫 kebab-case、述角。起於名詞或域辭：`security-analyst`、`r-developer`、`tour-planner`。避泛名如 `helper`、`assistant`
- **Purpose**：一段述此代解之具問。問：「此代為何無存代可代？」
- **Communication style**：考域。技代宜精引重。創代可更探。合規代宜正式而審導

繼前察 53 代之重：

```bash
grep -i "description:" agents/_registry.yml | grep -i "<your-domain-keywords>"
```

**得：** 無存代涵同隙。若存代部重→擴之非新建。

**敗：** 重代存→擴彼技列或窄新代範為補非復。

### 二：選具

擇代需之最小具集。最少特權原則：

| 具集 | 用時 | 例代 |
|----------|-------------|----------------|
| `[Read, Grep, Glob]` | 讀析、評、審 | code-reviewer、security-analyst、auditor |
| `[Read, Grep, Glob, WebFetch]` | 析加外查 | senior-researcher |
| `[Read, Write, Edit, Bash, Grep, Glob]` | 全發——建/改碼 | r-developer、web-developer、devops-engineer |
| `[Read, Write, Edit, Bash, Grep, Glob, WebFetch, WebSearch]` | 發加外研 | polymath、shapeshifter |

僅析碼者勿含 `Bash`。勿含 `WebFetch` 或 `WebSearch` 除代實需外查。

**得：** 具列僅含代實用者。

**敗：** 評能——若能不需具→除具。

### 三：選模

按任複擇模：

- **`sonnet`**（默）：多代。推理與速衡。用於發、評、析、標流
- **`opus`**：複推、多步謀、細判。用於高級代、架決、深域專
- **`haiku`**：簡速應。用於直查、式、模填

**得：** 模合代主用例之認知需。

**敗：** 疑則用 `sonnet`。測揭推不足方升 `opus`。

### 四：賦技

覽技庫選代域相關技：

```bash
# List all skills in a domain
grep -A3 "domain-name:" skills/_registry.yml

# Search for skills by keyword
grep -i "keyword" skills/_registry.yml
```

為 frontmatter 築技列：

```yaml
skills:
  - skill-id-one
  - skill-id-two
  - skill-id-three
```

**要**：諸代自動繼庫級 `default_skills` 之默技（`meditate`、`heal`）。勿於代 frontmatter 列此二除非為代法核（如 `mystic` 代列 `meditate` 因冥助為其主）。

**得：** 技列含 3-15 存於 `skills/_registry.yml` 之技 ID。

**敗：** 驗技 ID 存：`grep "id: skill-name" skills/_registry.yml`。除不合者。

### 五：書代檔

複模填 frontmatter：

```bash
cp agents/_template.md agents/<agent-name>.md
```

填 YAML frontmatter：

```yaml
---
name: agent-name
description: One to two sentences describing primary capability and domain
tools: [Read, Write, Edit, Bash, Grep, Glob]
model: sonnet
version: "1.0.0"
author: Philipp Thoss
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [domain, specialty, relevant-keywords]
priority: normal
max_context_tokens: 200000
skills:
  - assigned-skill-one
  - assigned-skill-two
# Note: All agents inherit default skills (meditate, heal) from the registry.
# Only list them here if they are core to this agent's methodology.
# mcp_servers: []  # Uncomment and populate if MCP servers are needed
---
```

**得：** YAML frontmatter 無誤解析。諸必欄（`name`、`description`、`tools`、`model`、`version`、`author`）存。

**敗：** 驗 YAML 文法。常誤：版串缺引、縮進誤、具列括未閉。

### 六：書目與能

代模之位：

**Purpose**：一段述此代解之具問與值。具——名域、流、果。

**Capabilities**：粗體引項。代能多→按類組：

```markdown
## Capabilities

- **Primary Capability**: What the agent does best
- **Secondary Capability**: Additional functionality
- **Tool Integration**: How it leverages its tools
```

**Available Skills**：各賦技含短述。用裸技 ID（斜命名）：

```markdown
## Available Skills

- `skill-id` - Brief description of what the skill does
```

**得：** 目具（非「助發」）、能具驗、技列合 frontmatter。

**敗：** 目感泛→答：「用者當請此代作何具任？」以此為目。

### 七：書用例與例

予 2-3 用例顯如何召代：

```markdown
### Scenario 1: Primary Use Case
Brief description of the main scenario.

> "Use the agent-name agent to [specific task]."

### Scenario 2: Alternative Use Case
Description of another common use case.

> "Spawn the agent-name to [different task]."
```

加 1-2 具例顯用請與期代行：

```markdown
### Example 1: Basic Usage
**User**: [Specific request]
**Agent**: [Expected response pattern and actions taken]
```

**得：** 例實、顯實值、召式合 Claude Code 規。

**敗：** 心試例——代實可以賦具技成請乎？

### 八：書限與參

**Limitations**：3-5 誠限。代不能、不當、或果差之處：

```markdown
## Limitations

- Cannot execute code in language X (no runtime available)
- Not suitable for tasks requiring Y — use Z agent instead
- Requires MCP server ABC to be running for full functionality
```

**See Also**：引補代、相關導、相關團：

```markdown
## See Also

- [complementary-agent](complementary-agent.md) - handles the X side of this workflow
- [relevant-guide](../guides/guide-name.md) - background knowledge for this domain
- [relevant-team](../teams/team-name.md) - team that includes this agent
```

**得：** 限誠具。See Also 引存檔。

**敗：** 察引檔存：`ls agents/complementary-agent.md`。

### 九：加於庫

編 `agents/_registry.yml` 於字母位加新代：

```yaml
  - id: agent-name
    path: agents/agent-name.md
    description: Same one-line description from frontmatter
    tags: [domain, specialty]
    priority: normal
    tools: [Read, Write, Edit, Bash, Grep, Glob]
    skills:
      - skill-id-one
      - skill-id-two
```

增檔首 `total_agents` 計。

**得：** 庫項合代檔 frontmatter。`total_agents` 等實代項數。

**敗：** 以 `grep -c "^  - id:" agents/_registry.yml` 計項、驗合 `total_agents`。

### 十：驗發現

Claude Code 自 `.claude/agents/` 發現代。此庫中此目為 `agents/` 之軟連：

```bash
# Verify the symlink exists and resolves
ls -la .claude/agents/
readlink -f .claude/agents/<agent-name>.md
```

軟連全則無須外動——新代檔自動可發現。

行 README 自更：

```bash
npm run update-readmes
```

**得：** `.claude/agents/<agent-name>.md` 解至新代檔。`agents/README.md` 含新代。

**敗：** 軟連破→重建：`ln -sf ../agents .claude/agents`。`npm run update-readmes` 敗→察 `scripts/generate-readmes.js` 存且 `js-yaml` 裝。

### 十一：架譯

> **諸代必**。此步施於人作者與循此程之 AI 代。勿略——缺譯積為陳備。

承新代後即為諸 4 支 locales 架譯檔：

```bash
for locale in de zh-CN ja es; do
  npm run translate:scaffold -- agents <agent-name> "$locale"
done
```

續譯各檔之架詞（碼塊與 ID 留英）。終重生態檔：

```bash
npm run translation:status
```

**得：** `i18n/{de,zh-CN,ja,es}/agents/<agent-name>.md` 建四檔，`source_commit` 皆合現 HEAD。`npm run validate:translations` 顯零陳警於新代。

**敗：** 架敗→驗代存於 `agents/_registry.yml`。態檔不更→顯行 `npm run translation:status`——CI 不自觸。

## 驗

- [ ] 代檔存於 `agents/<agent-name>.md`
- [ ] YAML frontmatter 無誤解析
- [ ] 諸必欄存：`name`、`description`、`tools`、`model`、`version`、`author`
- [ ] `name` 合檔名（無 `.md`）
- [ ] 諸節存：Purpose、Capabilities、Available Skills、Usage Scenarios、Examples、Limitations、See Also
- [ ] Frontmatter 中技存於 `skills/_registry.yml`
- [ ] 默技（`meditate`、`heal`）非列除非為代法核
- [ ] 具列循最少特權
- [ ] 代於 `agents/_registry.yml` 含正路與合備
- [ ] 庫中 `total_agents` 計已更
- [ ] `.claude/agents/` 軟連解至新代檔
- [ ] 無顯著重於存代

## 忌

- **具過授**：僅讀析而含 `Bash`、`Write`、`WebFetch`→破最少特權致副效。始於最小集、能需方加
- **缺或誤技賦**：列庫無之技 ID 或全忘賦技。加前以 `grep "id: skill-name" skills/_registry.yml` 驗
- **無謂列默技**：加 `meditate` 或 `heal` 於代 frontmatter 而庫已繼。僅核方列（如 `mystic`、`alchemist`、`gardener`、`shaman`）
- **範重存代**：建代復 53 存代之能。先搜庫、考擴存代之技
- **目能泛**：書「助發」而非「架 R 包含全構、備、CI/CD 設」。具為代用與可發之源

## 參

- `create-skill` - 建 SKILL.md 而非代檔之並程
- `create-team` - 組多代為調團（計中）
- `commit-changes` - 承新代檔與庫更
