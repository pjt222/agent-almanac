---
name: create-agent
locale: wenyan
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

# 建新行者

定 Claude Code 之子行者，有專之志、擇之器、配之技、全之文，循行者樣與籍制。

## 用時

- 為未覆之域增新專行者於籍
- 轉反復之流或提示模式為可重用行者
- 建域專之助，有擇技與限器
- 析過廣行者為專職單責
- 設團前擬新成員

## 入

- **必要**：行者之名（小寫中劃線，如 `data-engineer`）
- **必要**：行者主志之一行述
- **必要**：志明所解之題
- **可選**：模型（默 `sonnet`；替 `opus`、`haiku`）
- **可選**：優先（默 `normal`；替 `high`、`low`）
- **可選**：由 `skills/_registry.yml` 配之技集
- **可選**：所需 MCP 伺（如 `r-mcptools`、`hf-mcp-server`）

## 法

### 第一步：設行者之人格

擇清晰專之身：

- **名**：小寫中劃線，明職。始以名詞或域飾：`security-analyst`、`r-developer`、`tour-planner`。避泛名如 `helper` 或 `assistant`。
- **志**：一段述此行者所解之具體題。問：「此行者為何？何行者未覆？」
- **語調**：按域。技術者宜精引證多；創意者可探；合規者宜正式具審。

行前察與現 53 行者之重：

```bash
grep -i "description:" agents/_registry.yml | grep -i "<your-domain-keywords>"
```

**得：** 無現行者覆同利基。若部分重，宜擴現者非建新。

**敗則：** 若現行者重甚，或擴其技集，或窄新者範以補而非重。

### 第二步：擇器

擇行者所需之最小器集。最小權之則施：

| 器集 | 用時 | 例行者 |
|----------|-------------|----------------|
| `[Read, Grep, Glob]` | 唯讀析、審、查 | code-reviewer, security-analyst, auditor |
| `[Read, Grep, Glob, WebFetch]` | 析兼外查 | senior-researcher |
| `[Read, Write, Edit, Bash, Grep, Glob]` | 全開發——建改碼 | r-developer, web-developer, devops-engineer |
| `[Read, Write, Edit, Bash, Grep, Glob, WebFetch, WebSearch]` | 開發兼外研 | polymath, shapeshifter |

唯析碼者勿含 `Bash`。不需外查者勿含 `WebFetch` 或 `WebSearch`。

**得：** 器列唯含行者實用之器。

**敗則：** 察行者能力列——若能力不需器，刪之。

### 第三步：擇模型

按任務繁選：

- **`sonnet`**（默）：多行者。推理速度衡。用於開發、審、析、標準流。
- **`opus`**：繁推、多步劃、微判。用於高級行者、架構決、需深域專者。
- **`haiku`**：簡速應。用於直查、格、填樣者。

**得：** 模型合行者主用案之認知需。

**敗則：** 疑則用 `sonnet`。唯試示推理不足乃升 `opus`。

### 第四步：配技

覽技籍擇行者域相關者：

```bash
# List all skills in a domain
grep -A3 "domain-name:" skills/_registry.yml

# Search for skills by keyword
grep -i "keyword" skills/_registry.yml
```

為前言建技列：

```yaml
skills:
  - skill-id-one
  - skill-id-two
  - skill-id-three
```

**要：** 諸行者自動繼籍之 `default_skills`（`meditate`、`heal`）。**勿**列於前言，除其為行者法之核心（如 `mystic` 列 `meditate` 乃因冥想之引為其主志）。

**得：** 技列含 3-15 存於 `skills/_registry.yml` 之技 ID。

**敗則：** 驗每技 ID 存：`grep "id: skill-name" skills/_registry.yml`。刪不合者。

### 第五步：書行者文件

複樣填前言：

```bash
cp agents/_template.md agents/<agent-name>.md
```

填 YAML 前言：

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

**得：** YAML 前言無訛而解。諸必要域（`name`、`description`、`tools`、`model`、`version`、`author`）皆存。

**敗則：** 驗 YAML 語法。常病：版本字串缺引號、縮進誤、器列括弧未閉。

### 第六步：書志與能

替樣之虛位：

**Purpose**：一段述此行者所解之題及所供之值。具體——名域、流、果。

**Capabilities**：粗體領之點列。能多則依類分組：

```markdown
## Capabilities

- **Primary Capability**: What the agent does best
- **Secondary Capability**: Additional functionality
- **Tool Integration**: How it leverages its tools
```

**Available Skills**：列諸配技並簡述。用赤技 ID（斜線命令名）：

```markdown
## Available Skills

- `skill-id` - Brief description of what the skill does
```

**得：** 志具體（非「助開發」），能力具體可驗，技列合前言。

**敗則：** 若志感泛，答：「用者會請此行者作何具體事？」以答為志。

### 第七步：書用案與例

供 2-3 用案，示如何呼行者：

```markdown
### Scenario 1: Primary Use Case
Brief description of the main scenario.

> "Use the agent-name agent to [specific task]."

### Scenario 2: Alternative Use Case
Description of another common use case.

> "Spawn the agent-name to [different task]."
```

增 1-2 具體例，示用者請求與期行：

```markdown
### Example 1: Basic Usage
**User**: [Specific request]
**Agent**: [Expected response pattern and actions taken]
```

**得：** 案實，例示實值，呼式合 Claude Code 慣。

**敗則：** 心試諸例——行者能以其器技實現乎？

### 第八步：書限與參

**Limitations**：3-5 誠實之限。行者不能為、不宜用、或果劣之處：

```markdown
## Limitations

- Cannot execute code in language X (no runtime available)
- Not suitable for tasks requiring Y — use Z agent instead
- Requires MCP server ABC to be running for full functionality
```

**See Also**：交叉引補行者、相關指南、相關團：

```markdown
## See Also

- [complementary-agent](complementary-agent.md) - handles the X side of this workflow
- [relevant-guide](../guides/guide-name.md) - background knowledge for this domain
- [relevant-team](../teams/team-name.md) - team that includes this agent
```

**得：** 限誠實具體。參引現文件。

**敗則：** 察引文件存：`ls agents/complementary-agent.md`。

### 第九步：入籍

編 `agents/_registry.yml` 按字母位增新行者：

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

增頂之 `total_agents` 計。

**得：** 籍項合行者文件前言。`total_agents` 等實項數。

**敗則：** 以 `grep -c "^  - id:" agents/_registry.yml` 計之，驗合 `total_agents`。

### 第十步：驗發現

Claude Code 由 `.claude/agents/` 發現行者。此庫該目錄為 `agents/` 之符號鏈：

```bash
# Verify the symlink exists and resolves
ls -la .claude/agents/
readlink -f .claude/agents/<agent-name>.md
```

若 `.claude/agents/` 鏈完，無他須為——新行者自動可發現。

運 README 自動更以更行者 README：

```bash
npm run update-readmes
```

**得：** `.claude/agents/<agent-name>.md` 解至新行者文件。`agents/README.md` 含新行者。

**敗則：** 若鏈斷，重建：`ln -sf ../agents .claude/agents`。若 `npm run update-readmes` 敗，察 `scripts/generate-readmes.js` 存且 `js-yaml` 已裝。

### 第十一步：搭翻譯之架

> **諸行者必需。** 此步施於人作者與循此法之 AI 行者。勿略——缺翻譯積為陳積。

提交新行者後即時為四支持語搭翻譯文件：

```bash
for locale in de zh-CN ja es; do
  npm run translate:scaffold -- agents <agent-name> "$locale"
done
```

而後譯各文件之散文（代碼塊與 ID 留英）。終重生狀態文件：

```bash
npm run translation:status
```

**得：** 四文件建於 `i18n/{de,zh-CN,ja,es}/agents/<agent-name>.md`，`source_commit` 皆合當前 HEAD。`npm run validate:translations` 顯新行者無陳警。

**敗則：** 若搭架敗，驗行者存於 `agents/_registry.yml`。若狀態文件不更，明運 `npm run translation:status`——CI 不自動觸之。

## 驗

- [ ] 行者文件存於 `agents/<agent-name>.md`
- [ ] YAML 前言無訛而解
- [ ] 諸必要域皆存：`name`、`description`、`tools`、`model`、`version`、`author`
- [ ] `name` 合文件名（無 `.md`）
- [ ] 諸節皆存：Purpose、Capabilities、Available Skills、Usage Scenarios、Examples、Limitations、See Also
- [ ] 前言之技存於 `skills/_registry.yml`
- [ ] 默技（`meditate`、`heal`）未列，除非行者法之核心
- [ ] 器列循最小權之則
- [ ] 行者列於 `agents/_registry.yml`，路與元資料相合
- [ ] 籍之 `total_agents` 計已更
- [ ] `.claude/agents/` 符號鏈解至新行者文件
- [ ] 與現行者無顯重

## 陷

- **器過配**：僅需讀析者卻含 `Bash`、`Write`、`WebFetch`。違最小權，或致意外副作用。始於最小集，唯能需時增器。
- **缺或誤技配**：列不存於籍之技 ID，或忘配技。增前皆以 `grep "id: skill-name" skills/_registry.yml` 驗各 ID。
- **無謂列默技**：於前言加 `meditate` 或 `heal` 而其已由籍繼。唯為行者法之核心（如 `mystic`、`alchemist`、`gardener`、`shaman`）乃列。
- **與現者範圍重**：建新行者而其能已覆於 53 現行者之一。先搜籍，考擴現者之技而非重。
- **志能泛**：書「助開發」而非「建 R 包，含全構、文、CI/CD 設」。具體乃行者有用可發現之由。

## 參

- `create-skill` — 建 SKILL.md 文件之平行法，非行者文件
- `create-team` — 組多行者為協團（劃中）
- `commit-changes` — 提交新行者文件與籍更
