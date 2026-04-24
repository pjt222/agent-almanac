---
name: evolve-agent
locale: wenyan-lite
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

# 演化既有代理

改、擴或建以 `create-agent` 原著之代理之進階變體。此程涵代理生命週期之維護面：對最佳實踐之差距評估、對人格定義施針對性改、升版、保持登記冊與交互引用之同步。

## 適用時機

- 庫新增技能後代理之技能清單陳舊
- 使用者回饋示能力缺失、目的不明或範例弱
- 工具需求變（新 MCP server、工具移除、權限需減）
- 代理之範圍需銳——與他代理重疊或過寬
- 需原有之外之進階變體（如 `r-developer` 與 `r-developer-advanced`）
- 加入相關代理或團隊而 See Also 之交互引用陳舊

## 輸入

- **必要**：待演之既有代理文件之路徑（如 `agents/r-developer.md`）
- **必要**：演化觸發（回饋、新技能、工具變、範圍重疊、團隊整合、所發現之限）
- **選擇性**：目標版本升之幅（patch、minor、major）
- **選擇性**：是否建進階變體而非就地改（預設：就地改）

## 步驟

### 步驟一：評當前代理

讀既有代理文件，並對 `guides/agent-best-practices.md` 之品質清單評各節：

| 節 | 所察 | 常見問題 |
|---------|--------------|---------------|
| Frontmatter | 所必欄俱在（`name`、`description`、`tools`、`model`、`version`、`author`） | 缺 `tags`、陳 `version`、誤 `priority` |
| Purpose | 具體問題陳述，非泛「helps with X」 | 模糊或與他代理重疊 |
| Capabilities | 具體可驗之能，帶粗體引導 | 泛稱（「handles development」）、無分組 |
| Available Skills | 配 frontmatter `skills` 清單，所有 ID 於登記冊存 | 陳 ID、缺新技能、無謂列預設技能 |
| Usage Scenarios | 2-3 實際情境，帶呼叫模式 | 佔位符文、不實際之例 |
| Examples | 示使用者請求與代理行為 | 缺或瑣碎之例 |
| Limitations | 3-5 誠實之限制 | 過少、過泛或整缺 |
| See Also | 對代理、指南、團隊之有效交互引用 | 指向已改名或移之文件 |

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

**預期：** 按節組之具體差距、弱處或改善機會清單。

**失敗時：** 若代理文件不存或無 frontmatter，則此技不適——改用 `create-agent` 自頭著之。

### 步驟二：採演化需求

識並分類演化之觸發：

| 觸發 | 例 | 典型範圍 |
|---------|---------|---------------|
| 使用者回饋 | 「代理漏 review 中之 XSS」 | 加技能或能 |
| 新技能可得 | 庫得 `analyze-api-security` | 更新技能清單 |
| 工具變 | 新 MCP server 可得 | 加 tools/mcp_servers |
| 範圍重疊 | 二代理皆宣稱「code review」 | 銳目的與限 |
| 團隊整合 | 代理加入新團隊 | 更 See Also，驗能 |
| 模型升級 | 任務需深度推理 | 改 model 欄 |
| 權限降 | 代理有 Bash 而僅讀檔 | 移不必要之工具 |

編前先記所需之具體改。列各改及其目標節：

```
- Frontmatter: add `new-skill-id` to skills list
- Capabilities: add "API Security Analysis" capability
- Available Skills: add `new-skill-id` with description
- Limitations: remove outdated limitation about missing skill
- See Also: add link to new team that includes this agent
```

**預期：** 具體改之清單，各映至代理文件之特定節。

**失敗時：** 若改不明，進前諮詢使用者以釐。演化目標泛則改善亦泛。

### 步驟三：擇演化範圍

以此決策矩陣定是就地改或建變體：

| 標準 | 就地改（in-place） | 進階變體（新代理） |
|----------|----------------------|------------------------------|
| 代理 ID | 不變 | 新 ID：`<agent>-advanced` 或 `<agent>-<specialty>` |
| 檔路徑 | 同 `.md` 檔 | `agents/` 中新檔 |
| 版本升 | Patch 或 minor | 起於 1.0.0 |
| Model | 或變 | 常高（如 sonnet → opus）|
| Registry | 更既有項 | 加新項 |
| 原代理 | 直接修 | 保全，加 See Also 交互引用 |

**改（就地）**：於更新技能、修文檔、銳範圍或調工具時擇之。代理保其身分。

**變體**：當演後之版服於大異之受眾、需異 model 或添令原代理過寬之能時擇之。原代理保於較簡之用例。

**預期：** 明決——就地改或變體——含理由。

**失敗時：** 若不定，預設就地改。後可抽變體；合回則難。

### 步驟四：施改於代理文件

#### 就地改

直接編既有代理文件：

- **Frontmatter**：依需更 `skills`、`tools`、`tags`、`model`、`priority`、`mcp_servers`
- **Purpose/Capabilities**：改以反新範圍或添之功能
- **Available Skills**：加新技能及其說明，移棄用者
- **Usage Scenarios**：加或改情境以示新能
- **Limitations**：移不再適之限，加新誠實之限
- **See Also**：更交互引用以反當前代理/團隊/指南之景

遵此編輯規：
- 保所有既有節——加內容，勿移節
- 令 Available Skills 節與 frontmatter `skills` 清單同步
- 勿加預設技能（`meditate`、`heal`）於 frontmatter，除非為代理方法論之核
- 驗各技能 ID 存：`grep "id: skill-name" skills/_registry.yml`

#### 變體

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

**預期：** 代理文件（改或新變體）過步驟一之評估清單。

**失敗時：** 若編輯破文檔結構，以 `git diff` 審改並以 `git checkout -- <file>` 回部分編輯。

### 步驟 4.5：同步翻譯之變體

> **翻譯存時必行。** 此步適於依此程之人類作者與 AI 代理。勿略——陳 `source_commit` 值致 `npm run validate:translations` 於所有語言報假陳舊警。

察演化之代理是否存譯文並更以反新源狀態：

```bash
# Check for existing translations
ls i18n/*/agents/<agent-name>.md 2>/dev/null
```

#### 若譯文存

1. 取當前源 commit hash：

```bash
SOURCE_COMMIT=$(git rev-parse HEAD)
```

2. 更各譯文 frontmatter 中之 `source_commit`：

```bash
for locale_file in i18n/*/agents/<agent-name>.md; do
  sed -i "s/^source_commit: .*/source_commit: $SOURCE_COMMIT/" "$locale_file"
done
```

3. 於 commit 訊息中納受影響語言以旗標檔供重譯：

```
evolve(<agent-name>): <description of changes>

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

**失敗時：** 若 `sed` 未能配 frontmatter 欄，手開譯文並驗其於 YAML frontmatter 有 `source_commit`。若欄缺，以 `npm run translate:scaffold -- agents <agent-name> <locale>` 重建鷹架。

### 步驟五：更版與元數據

升 frontmatter 之 `version` 欄，循語義化版：

| 改類 | 版升 | 例 |
|-------------|-------------|---------|
| 錯字修、措詞釐清 | Patch：1.0.0 → 1.0.1 | 修不明之限 |
| 加新技能、擴能 | Minor：1.0.0 → 1.1.0 | 自庫加 3 新技能 |
| 重構目的、改模型 | Major：1.0.0 → 2.0.0 | 窄範圍、升至 opus |

亦更：
- `updated` 日期至今
- `tags` 若代理之域覆變
- `description` 若目的實質異
- `priority` 若代理相對他者之重要性變

**預期：** Frontmatter `version` 與 `updated` 反改之幅與日。新變體起於 `"1.0.0"`。

**失敗時：** 若忘升版，次演化無法辨當前態與前態。恒於 commit 前升之。

### 步驟六：更登記冊與交互引用

#### 就地改

更 `agents/_registry.yml` 中既有項以配改後 frontmatter：

```bash
# Find the agent's registry entry
grep -A 10 "id: <agent-name>" agents/_registry.yml
```

更 `description`、`tags`、`tools`、`skills` 欄以配代理文件。無需變計。

更他文件中之交互引用若代理之能或名變：

```bash
# Check if any team references this agent
grep -r "<agent-name>" teams/*.md

# Check if any guide references this agent
grep -r "<agent-name>" guides/*.md
```

#### 變體

加新代理至 `agents/_registry.yml` 之字母位：

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
1. 增登記冊頂之 `total_agents`
2. 於原代理之 See Also 加指向變體之交互引用
3. 於變體之 See Also 加指向原代理之交互引用
4. `.claude/agents/` 至 `agents/` 之 symlink 令變體自動可發現

**預期：** 登記冊項配代理文件之 frontmatter。於變體，`total_agents` 等於實際代理項數。

**失敗時：** 以 `grep -c "^  - id:" agents/_registry.yml` 計項並驗其配 `total_agents`。

### 步驟七：驗已演代理

行全驗證清單：

- [ ] 代理文件於預期路徑存
- [ ] YAML frontmatter 無誤解析
- [ ] `version` 已升（改）或設為 "1.0.0"（變體）
- [ ] `updated` 日期為今
- [ ] 所必節俱在：Purpose、Capabilities、Available Skills、Usage Scenarios、Examples、Limitations、See Also
- [ ] Frontmatter 之技能配 Available Skills 節
- [ ] 所有技能 ID 於 `skills/_registry.yml` 存
- [ ] 預設技能（`meditate`、`heal`）若非方法論之核則不列
- [ ] 工具清單循最小權限之則
- [ ] 登記冊項存並配 frontmatter
- [ ] 於變體：`total_agents` 計配磁碟實際數
- [ ] 交互引用雙向（原 ↔ 變體）
- [ ] `git diff` 示原內容無誤刪

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

**預期：** 所有清單項過。已演代理已備以 commit。

**失敗時：** 逐一處理每敗項。演後最常之問題為 Available Skills 節中陳之技能 ID 及忘之 `updated` 日。

## 驗證

- [ ] 代理文件存並有有效 YAML frontmatter
- [ ] `version` 欄反所作之改
- [ ] `updated` 日為今
- [ ] 所有節俱在且內部一致
- [ ] Frontmatter `skills` 陣列配 Available Skills 節
- [ ] 所有技能 ID 於 `skills/_registry.yml` 存
- [ ] 預設技能無需列時不列
- [ ] 登記冊項配代理文件
- [ ] 於變體：`agents/_registry.yml` 中有新項含正確路徑
- [ ] 於變體：`total_agents` 計已更
- [ ] 交互引用有效（See Also 無破連）
- [ ] 於帶譯之改：所有語言檔之 `source_commit` 已更
- [ ] `git diff` 確無誤移內容

## 常見陷阱

- **忘升版**：無版升則無法追何時何變。恒於 commit 前更 frontmatter 之 `version` 與 `updated`。
- **演後之陳譯**：庫中 1,288+ 譯文，每次代理演化觸發至 4 語言檔之陳舊。恒以 `ls i18n/*/agents/<agent-name>.md` 察既存譯文並更各之 `source_commit`，或於 commit 訊息中旗標之以待重譯。
- **技能清單漂移**：Frontmatter `skills` 陣列與 `## Available Skills` 節須同步。更一而不更他為人與工具皆造困。
- **無謂列預設技能**：加 `meditate` 或 `heal` 於 frontmatter，然其已自登記冊繼承。僅於為代理方法論之核時列之（如 `mystic`、`alchemist`）。
- **演中之工具過供**：於演中「以防萬一」加 `Bash` 或 `WebFetch`。每工具之加皆宜以具體新能證之。
- **建變體後陳之 See Also**：建變體時，原代理與變體須互引。單向引用使圖不全。
- **登記冊項未更**：改代理之技能、工具或說明後，`agents/_registry.yml` 項須更配。陳項致發現與工具之敗。

## 相關技能

- `create-agent` — 著新代理之基；evolve-agent 假其原依之
- `evolve-skill` — 演 SKILL.md 檔之平行程
- `commit-changes` — 以描述訊息 commit 已演代理
