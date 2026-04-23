---
name: create-skill
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Create a new SKILL.md file following the Agent Skills open standard
  (agentskills.io). Covers frontmatter schema, section structure,
  writing effective procedures with Expected/On failure pairs,
  validation checklists, cross-referencing, and registry integration.
  Use when codifying a repeatable procedure for agents, adding a new
  capability to the skills library, converting a guide or runbook into
  agent-consumable format, or standardizing a workflow across projects
  or teams.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.2"
  domain: general
  complexity: intermediate
  language: multi
  tags: meta, skill, agentskills, standard, authoring
---

# 造新技能

著一 SKILL.md 檔，令代理系統可消之以執一特定程序。

## 適用時機

- 將代理當循之可重複程序編碼
- 為技能庫加新能力
- 將指南、執行手冊、檢查清單轉為代理可消之格式
- 跨項目或團隊標準化工作流

## 輸入

- **必要**：技能當達之任務
- **必要**：領域分類——`skills/_registry.yml` 中 48 領域之一：
  `r-packages`、`jigsawr`、`containerization`、`reporting`、`compliance`、`mcp-integration`、
  `web-dev`、`git`、`general`、`citations`、`data-serialization`、`review`、`bushcraft`、
  `esoteric`、`design`、`defensive`、`project-management`、`devops`、`observability`、`mlops`、
  `workflow-visualization`、`swarm`、`morphic`、`alchemy`、`tcg`、`intellectual-property`、
  `gardening`、`shiny`、`animal-training`、`mycology`、`prospecting`、`crafting`、
  `library-science`、`travel`、`relocation`、`a2a-protocol`、`geometry`、`number-theory`、
  `stochastic-processes`、`theoretical-science`、`diffusion`、`hildegard`、`maintenance`、
  `blender`、`visualization`、`3d-printing`、`lapidary`、`versioning`
- **必要**：複雜度（basic、intermediate、advanced）
- **選擇性**：源材料（既存指南、執行手冊、工作範例）
- **選擇性**：待交叉引用之相關技能

## 步驟

### 步驟一：造目錄

各技能居其自之目錄：

```bash
mkdir -p skills/<skill-name>/
```

命名慣例：
- 用小寫連字符格：`submit-to-cran`，非 `SubmitToCRAN`
- 以動詞始：`create-`、`setup-`、`write-`、`deploy-`、`configure-`
- 具體：`create-r-dockerfile` 非 `create-dockerfile`

**預期：** 目錄 `skills/<skill-name>/` 存，名循小寫連字符格以動詞始。

**失敗時：** 若名不以動詞始，重命目錄。察命名衝突：`ls skills/ | grep <keyword>` 以確保無既存技能有重名。

### 步驟二：寫 YAML Frontmatter

```yaml
---
name: skill-name-here
description: >
  One to three sentences plus key activation triggers. Must be clear
  enough for an agent to decide whether to activate this skill from
  the description alone. Max 1024 characters. Start with a verb.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob  # optional, experimental
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: R | TypeScript | Python | Docker | Rust | multi
  tags: comma, separated, lowercase, tags
---
```

**必要欄**：`name`、`description`

**選擇性欄**：`license`、`allowed-tools`（實驗性）、`metadata`、`compatibility`

**元資料慣例**：
- `complexity`：basic（< 5 步、無邊界案）、intermediate（5-10 步、須判斷）、advanced（10+ 步、需顯著領域知識）
- `language`：主要語言；跨語言技能用 `multi`
- `tags`：3-6 個發現用標籤；含領域名

**預期：** YAML frontmatter 解析無誤，`name` 合目錄名，`description` 於 1024 字內且含明激活觸發。

**失敗時：** 驗 YAML：察 `---` 分隔符配對、版本字串之當之引號（如 `"1.0"` 非 `1.0`）、描述欄之 `>` 多行摺疊語法。

### 步驟三：寫標題與導言

```markdown
# Skill Title (Imperative Verb Form)

One paragraph: what this skill accomplishes and the value it provides.
```

標題當合 `name` 但為人讀式。「Submit to CRAN」非「submit-to-cran」。

**預期：** 祈使動詞形之頂層 `#` 標題，繼以述技能所達之簡段。

**失敗時：** 若標題為名詞短語而非動詞短語，重寫之。「Package Submission」為「Submit to CRAN」。

### 步驟四：寫「適用時機」

列 3-5 觸發條件——代理當激活此技能之具體情境：

```markdown
## When to Use

- Starting a new R package from scratch
- Converting loose R scripts into a package
- Setting up a package skeleton for collaborative development
```

自代理視角寫。此為代理察以決激活之條件。

> **注**：最要之觸發條件亦當現於 `description` frontmatter 欄，因其於發現階段全身載前已讀。`## When to Use` 段提供額外細節與脈絡。

**預期：** 3-5 項，述代理當激活此技能之具體、可觀條件。

**失敗時：** 若觸發覺泛（「事需行時」），自代理視角重寫：何可觀狀態或用戶請求將觸發激活？

### 步驟五：寫「輸入」

分必要與選擇性。宜具體述型與預設：

```markdown
## Inputs

- **Required**: Package name (lowercase, no special characters except `.`)
- **Required**: One-line description of the package purpose
- **Optional**: License type (default: MIT)
- **Optional**: Whether to initialize renv (default: yes)
```

**預期：** 輸入段明分必要與選擇性參數，各含型提示與適用之預設值。

**失敗時：** 若參數之型模糊，於括號內加具體例：「Package name (lowercase, no special characters except `.`)」。

### 步驟六：寫「步驟」

此為技能核。各步驟循此模式：

```markdown
### Step N: Action Title

Context sentence explaining what this step accomplishes.

\```language
concrete_code("that the agent can execute")
\```

**Expected:** What success looks like. Be specific — file created, output matches pattern, command exits 0.

**On failure:** Recovery steps. Don't just say "fix it" — provide the most common failure cause and its resolution.
```

**寫有效步驟**：
- 各步驟當獨立可驗
- 含實際程式，非偽程式
- 最常路置前，邊界案置「On failure」
- 5-10 步為佳。少於 5 或過泛；過 12 當分為多技能
- 引實工具、實命令，非抽象述

**為翻譯而寫**：
- 英文技能目標 ~400 行最大。德文擴 10-20%，某 CJK 翻譯擴更多——400 行英文源於翻譯後仍 500 內
- 避難譯之俗語與文化專屬範例
- 散文守簡直——短句譯得更佳

**預期：** 步驟段含 5-12 編號步驟，各含具體程式、`**Expected:**` 結果、`**On failure:**` 復原動作。

**失敗時：** 若某步驟缺程式，加實命令或配置。若 Expected/On failure 缺，今寫之——各可敗步驟皆需二者。

### 步驟七：寫「驗證」

程序完後代理行之檢查清單：

```markdown
## Validation

- [ ] Criterion 1 (testable, binary pass/fail)
- [ ] Criterion 2
- [ ] No errors or warnings in output
```

各項須客觀可驗。「程式清潔」差。「`devtools::check()` 返 0 誤」佳。

**預期：** markdown 檢查清單（`- [ ]`），3-8 二元通過/失敗標準，代理可以程式或察驗之。

**失敗時：** 以可量之標準替主觀標準。「文件完善」為「所有匯出函式皆有 `@param`、`@return`、`@examples` roxygen 標籤」。

### 步驟八：寫「常見陷阱」

3-6 陷阱，附因與避：

```markdown
## Common Pitfalls

- **Pitfall name**: What goes wrong and how to avoid it. Be specific about the symptom and the fix.
```

自實踐取。最佳陷阱為耗顯時且不顯者。

**預期：** 3-6 陷阱，各有粗體名、何出錯之述、如何避之。

**失敗時：** 若陷阱覺泛（「留意 X」），令具體：述症、因、修。自開發或測試時遭之實敗情境取。

### 步驟九：寫「相關技能」

交叉引用 2-5 常於此前、後、或旁用之技能：

```markdown
## Related Skills

- `prerequisite-skill` - must be done before this skill
- `follow-up-skill` - commonly done after this skill
- `alternative-skill` - alternative approach to the same goal
```

用技能之 `name` 欄（kebab-case），非標題。

**預期：** 2-5 相關技能列以 kebab-case ID 及關係之簡述（先決、後續、替代）。

**失敗時：** 驗各引之技能存：`ls skills/<skill-name>/SKILL.md`。除已重命或移除之引。

### 步驟十：加於註冊

編 `skills/_registry.yml`，於當之領域下加新技能：

```yaml
- id: skill-name-here
  path: skill-name-here/SKILL.md
  complexity: intermediate
  language: multi
  description: One-line description matching the frontmatter
```

更註冊首之 `total_skills` 計數。

**預期：** 新項現於 `skills/_registry.yml` 之正確領域下，`total_skills` 計合磁上實際技能目錄數。

**失敗時：** 以 `find skills -name SKILL.md | wc -l` 計磁上技能並較註冊中之 `total_skills`。驗 `id` 欄完全合目錄名。

### 步驟十一：加引用（選擇性）

若技能基於既立方法、研究論文、軟體套件、或標準，於 `references/` 目錄加引用子檔：

```bash
mkdir -p skills/<skill-name>/references/
```

造二檔：

- **`references/CITATIONS.bib`** —— 機器可讀 BibTeX（真源）
- **`references/CITATIONS.md`** —— 人讀之渲染引用，供 GitHub 瀏覽

```bibtex
% references/CITATIONS.bib
@article{author2024title,
  author  = {Author, First and Other, Second},
  title   = {Paper Title},
  journal = {Journal Name},
  year    = {2024},
  doi     = {10.xxxx/xxxxx}
}
```

```markdown
<!-- references/CITATIONS.md -->
# Citations

References underpinning the **skill-name** skill.

1. Author, F., & Other, S. (2024). *Paper Title*. Journal Name. https://doi.org/10.xxxx/xxxxx
```

引用為選擇性——於溯源重要時加之（學術法、既刊標準、監管框架）。

**翻譯中處 `references/`**：`references/EXAMPLES.md` 之散文當譯。`references/CITATIONS.bib` 保英文（BibTeX 語言中立）。若其內容唯程式，翻譯可符號連結至英文 `references/` 目錄。

**預期：** 二檔皆存且 `.bib` 解為有效 BibTeX。

**失敗時：** 以 `bibtool -d references/CITATIONS.bib` 或線上驗證器驗 BibTeX 語法。

### 步驟十二：驗技能

提交前行本地驗證檢查：

```bash
# Check line count (must be ≤500)
lines=$(wc -l < skills/<skill-name>/SKILL.md)
[ "$lines" -le 500 ] && echo "OK ($lines lines)" || echo "FAIL: $lines lines > 500"

# Check required frontmatter fields
head -20 skills/<skill-name>/SKILL.md | grep -q '^name:' && echo "name: OK"
head -20 skills/<skill-name>/SKILL.md | grep -q '^description:' && echo "description: OK"
```

**預期：** 行數 ≤500，所有必要欄皆在。

**失敗時：** 若過 500 行，施漸進揭示——將大程式塊（>15 行）萃至 `references/EXAMPLES.md`：

```bash
mkdir -p skills/<skill-name>/references/
```

移擴程式範例、全配置檔、多變體範例至 `references/EXAMPLES.md`。於 SKILL.md 加交叉引用：`See [EXAMPLES.md](references/EXAMPLES.md) for complete configuration examples.` 於主 SKILL.md 守簡行內片段（3-10 行）。`.github/workflows/validate-skills.yml` 之 CI 工作流於所有 PR 上強此限。

### 步驟十三：造斜線命令符號連結

造符號連結令 Claude Code 發現此技能為 `/slash-command`：

```bash
# Project-level (available in this project)
ln -s ../../skills/<skill-name> .claude/skills/<skill-name>

# Global (available in all projects)
ln -s /mnt/d/dev/p/agent-almanac/skills/<skill-name> ~/.claude/skills/<skill-name>
```

**預期：** `ls -la .claude/skills/<skill-name>/SKILL.md` 解至技能檔。

**失敗時：** 驗相對路正確。自 `.claude/skills/`，路 `../../skills/<skill-name>` 當達技能目錄。以 `readlink -f` 除錯符號連結解析。Claude Code 期望 `.claude/skills/<name>/SKILL.md` 之平結構。

### 步驟十四：腳手架翻譯

> **所有技能皆需**。此步適用於人類作者與遵此程序之 AI 代理。勿跳——缺之翻譯積為陳舊積壓。

新技能提交後即為所有 4 支援語系腳手架翻譯檔：

```bash
for locale in de zh-CN ja es; do
  npm run translate:scaffold -- skills <skill-name> "$locale"
done
```

繼之譯各檔之腳手架散文（程式塊與 ID 保英文）。最終再生狀態檔：

```bash
npm run translation:status
```

**預期：** 4 檔生於 `i18n/{de,zh-CN,ja,es}/skills/<skill-name>/SKILL.md`，其 `source_commit` 皆合當前 HEAD。`npm run validate:translations` 顯新技能之陳舊警告為零。

**失敗時：** 若腳手架敗，腳手架前驗技能存於 `skills/_registry.yml`——腳本讀註冊。若 `translation:status` 顯新檔為陳舊，察 `source_commit` 合英文源末改之提交雜湊。

## 驗證

- [ ] SKILL.md 存於 `skills/<skill-name>/SKILL.md`
- [ ] YAML frontmatter 解析無誤
- [ ] `name` 欄合目錄名
- [ ] `description` 於 1024 字內
- [ ] 所有必要段俱全：When to Use、Inputs、Procedure、Validation、Common Pitfalls、Related Skills
- [ ] 各步驟皆含具體程式與 Expected/On failure 對
- [ ] Related Skills 引有效技能名
- [ ] 技能列於 `_registry.yml`，路正確
- [ ] `total_skills` 計數已更
- [ ] SKILL.md ≤500 行（過則萃至 `references/EXAMPLES.md`）
- [ ] 估之翻譯擴展可接受（英文源 ≤~400 行令翻譯守 <500）
- [ ] 若技能基於既刊法，引用加於 `references/CITATIONS.bib` + `CITATIONS.md`
- [ ] 符號連結存於 `.claude/skills/<skill-name>`，指向技能目錄
- [ ] 全域符號連結存於 `~/.claude/skills/<skill-name>`（若全域可用）

## 常見陷阱

- **程序泛**：「合宜配置系統」於代理無用。提供確切命令、檔路、配置值
- **缺 On failure**：各可敗步驟需復原引導。代理不能即興——需明之回退
- **範圍過廣**：欲涵「立全開發環境」之技能當為 3-5 專之技能。一技能 = 一程序
- **不可測之驗證**：「程式品質好」不可驗。「Linter 過，0 警告」可
- **陳舊交叉引用**：重命或移除技能時，於所有 Related Skills 段 grep 舊名
- **描述過長**：描述欄為代理決激活之讀物。守 1024 字內，關鍵資訊置前
- **單語言 500 行限**：490 行之英文技能譯至德文（~10-20% 擴）或 CJK 語言時將過 500。目標英文源 ~400 行，餘用漸進揭示（`references/EXAMPLES.md`）
- **NTFS 掛載路（WSL）避 `git mv`**：於 `/mnt/` 路，目錄之 `git mv` 可生壞權限（`d?????????`）。改用 `mkdir -p` + 複檔 + `git rm` 舊路。見[環境指南](../../guides/setting-up-your-environment.md)之疑難排解段

## 範例

結構良好之技能循此品質清單：
1. 代理可自描述獨決是否用之
2. 程序可機械循而無歧義
3. 各步驟有可驗結果
4. 敗模有具體復原路
5. 技能可與相關技能組合

自此庫之大小參考：
- 基本技能：~80-120 行（如 `write-vignette`、`configure-git-repository`）
- 中級技能：~120-180 行（如 `write-testthat-tests`、`manage-renv-dependencies`）
- 進階技能：~180-250 行（如 `submit-to-cran`、`setup-gxp-r-project`）
- 含擴範例之技能：SKILL.md ≤500 行 + `references/EXAMPLES.md` 以納大配置

## 相關技能

- `evolve-skill` - 演化並精修此程序造之技能
- `create-agent` - 造代理定義之平行程序
- `create-team` - 造團隊組成之平行程序
- `write-claude-md` - CLAUDE.md 可引技能以供項目專屬工作流
- `configure-git-repository` - 技能當版本控制
- `commit-changes` - 提交新技能及其符號連結
- `security-audit-codebase` - 察技能以防意外納入之機密
