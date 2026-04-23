---
name: create-agent
locale: wenyan-lite
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

# 造新代理

以 agent-almanac 之代理範本與註冊慣例，定一 Claude Code 子代理人格：目的專一、工具精選、技能已配、文件俱全。

## 適用時機

- 為尚未涵之領域加一專業代理於庫
- 將反覆之工作流或提示模式轉為可重用之代理人格
- 造領域專屬之助手，技能精選、工具有限
- 分過廣之代理為職責單一之代理
- 於組多代理團隊前設計一新團員

## 輸入

- **必要**：代理之名（小寫連字符格，如 `data-engineer`）
- **必要**：一句描述，述代理之主要目的
- **必要**：目的聲明，述代理所解之問題
- **選擇性**：模型之擇（預設 `sonnet`；其他：`opus`、`haiku`）
- **選擇性**：優先級（預設 `normal`；其他：`high`、`low`）
- **選擇性**：`skills/_registry.yml` 中所配之技能清單
- **選擇性**：代理所需之 MCP 伺服器（如 `r-mcptools`、`hf-mcp-server`）

## 步驟

### 步驟一：設計代理人格

擇明而專之身份：

- **名**：小寫連字符格，述其職。以名詞或領域修飾詞始：`security-analyst`、`r-developer`、`tour-planner`。避泛名如 `helper` 或 `assistant`
- **目的**：一段述此代理所解之具體問題。問：「此代理所為，現存代理皆不能乎？」
- **通訊風格**：考領域。技術代理當精準而多引證；創意代理可更探索；合規代理當正式且審計向

進前察與現存 53 代理之重疊：

```bash
grep -i "description:" agents/_registry.yml | grep -i "<your-domain-keywords>"
```

**預期：** 無現存代理涵同一利基。若部分重疊，考慮擴之非新造。

**失敗時：** 若重疊顯著之代理存，或擴其技能清單，或縮新代理之範圍以補而非複。

### 步驟二：擇工具

擇代理所需之最小工具集，循最小權限原則：

| 工具集 | 適用時機 | 範例代理 |
|----------|-------------|----------------|
| `[Read, Grep, Glob]` | 唯讀分析、審查、審計 | code-reviewer、security-analyst、auditor |
| `[Read, Grep, Glob, WebFetch]` | 分析加外部查閱 | senior-researcher |
| `[Read, Write, Edit, Bash, Grep, Glob]` | 全開發——造/改程式 | r-developer、web-developer、devops-engineer |
| `[Read, Write, Edit, Bash, Grep, Glob, WebFetch, WebSearch]` | 開發加外部研究 | polymath、shapeshifter |

唯分析程式之代理不包 `Bash`。非確需外部查資源之代理不包 `WebFetch` 或 `WebSearch`。

**預期：** 工具清單僅含代理於主要工作流中確用之工具。

**失敗時：** 察代理能力清單——若某能力不需工具，除之。

### 步驟三：擇模型

依任務複雜度擇模型：

- **`sonnet`**（預設）：多數代理。推理與速之衡。用於開發、審查、分析、標準工作流
- **`opus`**：複雜推理、多步規劃、微判斷。用於資深級代理、架構決定、或需深領域專業之任務
- **`haiku`**：簡速應對。用於行直查、格式化、範本填寫之代理

**預期：** 模型合代理主要用例之認知需。

**失敗時：** 疑則用 `sonnet`。測顯推理品質不足時乃升至 `opus`。

### 步驟四：配技能

瀏覽技能註冊，擇合代理領域之技能：

```bash
# List all skills in a domain
grep -A3 "domain-name:" skills/_registry.yml

# Search for skills by keyword
grep -i "keyword" skills/_registry.yml
```

為 frontmatter 建技能清單：

```yaml
skills:
  - skill-id-one
  - skill-id-two
  - skill-id-three
```

**重要**：所有代理自註冊之 `default_skills` 欄繼承預設技能（`meditate`、`heal`）。**勿**於代理 frontmatter 列此二者，除非為代理方法論之核心（如 `mystic` 代理列 `meditate`，因禪修引導為其主要目的）。

**預期：** 技能清單含 3-15 個存於 `skills/_registry.yml` 之技能 ID。

**失敗時：** 驗各技能 ID 存否：`grep "id: skill-name" skills/_registry.yml`。不合者除之。

### 步驟五：寫代理檔

複製範本並填 frontmatter：

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

**預期：** YAML frontmatter 解析無誤。所有必要欄（`name`、`description`、`tools`、`model`、`version`、`author`）俱全。

**失敗時：** 驗 YAML 語法。常見問題：版本字串缺引號、縮排誤、工具清單括號未閉。

### 步驟六：寫目的與能力

取代範本之佔位段：

**目的**：一段述此代理所解之具體問題及其所提供之價值。宜具體——名其領域、其工作流、其成果。

**能力**：帶粗體導引之項目清單。若能力多，按類分組：

```markdown
## Capabilities

- **Primary Capability**: What the agent does best
- **Secondary Capability**: Additional functionality
- **Tool Integration**: How it leverages its tools
```

**可用技能**：列各已配技能並簡述之。用裸技能 ID（斜線指令名）：

```markdown
## Available Skills

- `skill-id` - Brief description of what the skill does
```

**預期：** 目的具體（非「助於開發」），能力具體可驗，技能清單合 frontmatter。

**失敗時：** 若目的覺泛，答：「用戶會求此代理行何具體任務？」以其答為目的。

### 步驟七：寫使用情境與範例

提供 2-3 使用情境，示如何召喚代理：

```markdown
### Scenario 1: Primary Use Case
Brief description of the main scenario.

> "Use the agent-name agent to [specific task]."

### Scenario 2: Alternative Use Case
Description of another common use case.

> "Spawn the agent-name to [different task]."
```

加 1-2 具體範例，示用戶請求與所期代理行為：

```markdown
### Example 1: Basic Usage
**User**: [Specific request]
**Agent**: [Expected response pattern and actions taken]
```

**預期：** 情境寫實，範例示真價值，召喚模式合 Claude Code 慣例。

**失敗時：** 心中測範例——代理真能以其所配工具與技能滿此請求乎？

### 步驟八：寫限制與另見

**限制**：3-5 誠實之約束。代理所不能為、所不宜用、或所可能出拙果之處：

```markdown
## Limitations

- Cannot execute code in language X (no runtime available)
- Not suitable for tasks requiring Y — use Z agent instead
- Requires MCP server ABC to be running for full functionality
```

**另見**：交叉引用互補代理、相關指南、相關團隊：

```markdown
## See Also

- [complementary-agent](complementary-agent.md) - handles the X side of this workflow
- [relevant-guide](../guides/guide-name.md) - background knowledge for this domain
- [relevant-team](../teams/team-name.md) - team that includes this agent
```

**預期：** 限制誠實具體。另見所指之檔皆存。

**失敗時：** 察所指檔存否：`ls agents/complementary-agent.md`。

### 步驟九：加於註冊

編 `agents/_registry.yml`，按字母序插新代理項：

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

增檔首之 `total_agents` 計數。

**預期：** 註冊項合代理檔 frontmatter。`total_agents` 等於實際代理數。

**失敗時：** 以 `grep -c "^  - id:" agents/_registry.yml` 計項並驗合 `total_agents`。

### 步驟十：驗發現

Claude Code 自 `.claude/agents/` 目錄發現代理。於此倉，該目錄為指向 `agents/` 之符號連結：

```bash
# Verify the symlink exists and resolves
ls -la .claude/agents/
readlink -f .claude/agents/<agent-name>.md
```

若 `.claude/agents/` 符號連結完好，無需他動——新代理檔自動可發現。

行 README 自動化以更新代理 README：

```bash
npm run update-readmes
```

**預期：** `.claude/agents/<agent-name>.md` 解析至新代理檔。`agents/README.md` 含新代理。

**失敗時：** 若符號連結斷，重建之：`ln -sf ../agents .claude/agents`。若 `npm run update-readmes` 敗，察 `scripts/generate-readmes.js` 存否且 `js-yaml` 已裝。

### 步驟十一：腳手架翻譯

> **所有代理皆需行**。此步適用於人類作者與遵此程序之 AI 代理。勿跳——缺之翻譯積為陳舊積壓。

新代理提交後即為所有 4 支援語系腳手架翻譯檔：

```bash
for locale in de zh-CN ja es; do
  npm run translate:scaffold -- agents <agent-name> "$locale"
done
```

繼之翻譯各檔中腳手架之散文（代碼塊與 ID 保英文）。最終再生狀態檔：

```bash
npm run translation:status
```

**預期：** 4 檔生於 `i18n/{de,zh-CN,ja,es}/agents/<agent-name>.md`，其 `source_commit` 皆合當前 HEAD。`npm run validate:translations` 顯新代理之陳舊警告為零。

**失敗時：** 若腳手架敗，驗代理存於 `agents/_registry.yml`。若狀態檔未更，明行 `npm run translation:status`——CI 不自動觸之。

## 驗證

- [ ] 代理檔存於 `agents/<agent-name>.md`
- [ ] YAML frontmatter 解析無誤
- [ ] 所有必要欄俱全：`name`、`description`、`tools`、`model`、`version`、`author`
- [ ] `name` 欄合檔名（不含 `.md`）
- [ ] 所有段落俱全：Purpose、Capabilities、Available Skills、Usage Scenarios、Examples、Limitations、See Also
- [ ] frontmatter 中之技能皆存於 `skills/_registry.yml`
- [ ] 預設技能（`meditate`、`heal`）**未**列出，除非為代理方法論之核心
- [ ] 工具清單循最小權限原則
- [ ] 代理已列於 `agents/_registry.yml`，路徑正確且元資料相符
- [ ] `total_agents` 計數已更
- [ ] `.claude/agents/` 符號連結解析至新代理檔
- [ ] 與現存代理無顯著重疊

## 常見陷阱

- **工具過度供給**：代理僅需讀與分析卻含 `Bash`、`Write` 或 `WebFetch`。違最小權限，致意外副作用。始於最小集，能力需方加之
- **技能配置錯或缺**：列註冊中不存之技能 ID，或全忘配技能。加前必驗各技能 ID：`grep "id: skill-name" skills/_registry.yml`
- **不必要地列預設技能**：於代理 frontmatter 加 `meditate` 或 `heal`，其實已自註冊繼承。唯為方法論之核心乃列之（如 `mystic`、`alchemist`、`gardener`、`shaman`）
- **與現存代理範圍重疊**：造複 53 現存代理之功能者。先搜註冊，考慮擴既代理之技能
- **目的與能力泛**：寫「助於開發」而非「以全結構、文件、CI/CD 配置腳手架 R 套件」。具體方令代理有用而可發現

## 相關技能

- `create-skill` - 造 SKILL.md 檔（非代理檔）之平行程序
- `create-team` - 組多代理為協調團隊（規劃中）
- `commit-changes` - 提交新代理檔與註冊更新
