---
name: create-skill
locale: wenyan
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

# 建新技

書 SKILL.md 文件，使行者系統可消耗以執特定之法。

## 用時

- 將可反復之法定形為行者之循
- 為技庫增新能
- 將指南、運行本、清單轉為行者可消之式
- 跨項目或團隊而一流

## 入

- **必要**：技所當畢之任務
- **必要**：域之別——`skills/_registry.yml` 之 48 域之一：
  `r-packages`、`jigsawr`、`containerization`、`reporting`、`compliance`、`mcp-integration`、
  `web-dev`、`git`、`general`、`citations`、`data-serialization`、`review`、`bushcraft`、
  `esoteric`、`design`、`defensive`、`project-management`、`devops`、`observability`、`mlops`、
  `workflow-visualization`、`swarm`、`morphic`、`alchemy`、`tcg`、`intellectual-property`、
  `gardening`、`shiny`、`animal-training`、`mycology`、`prospecting`、`crafting`、
  `library-science`、`travel`、`relocation`、`a2a-protocol`、`geometry`、`number-theory`、
  `stochastic-processes`、`theoretical-science`、`diffusion`、`hildegard`、`maintenance`、
  `blender`、`visualization`、`3d-printing`、`lapidary`、`versioning`
- **必要**：繁度（basic、intermediate、advanced）
- **可選**：源（現指南、運本、行例）
- **可選**：欲交叉參之相關技

## 法

### 第一步：建目錄

每技於己之目錄：

```bash
mkdir -p skills/<skill-name>/
```

名慣：
- 小寫中劃線：`submit-to-cran`，非 `SubmitToCRAN`
- 始以動詞：`create-`、`setup-`、`write-`、`deploy-`、`configure-`
- 具體：`create-r-dockerfile`，非 `create-dockerfile`

**得：** 目錄 `skills/<skill-name>/` 存，名循小寫中劃線始以動詞。

**敗則：** 若名不始以動詞，更名目錄。察名衝：`ls skills/ | grep <keyword>` 確無現技名重。

### 第二步：書 YAML 前言

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

**必要域**：`name`、`description`

**可選域**：`license`、`allowed-tools`（實驗）、`metadata`、`compatibility`

**元資料慣**：
- `complexity`：basic（< 5 步，無邊況）、intermediate（5-10 步，有判）、advanced（10+ 步，甚域知）
- `language`：主語；跨語技用 `multi`
- `tags`：3-6 標便發現；含域名

**得：** YAML 前言無訛而解，`name` 合目錄名，`description` 一千二十四字內有清觸。

**敗則：** 驗 YAML，察 `---` 界相配、版字串正引（如 `"1.0"` 非 `1.0`）、述用正 `>` 多行折疊。

### 第三步：書題與介

```markdown
# Skill Title (Imperative Verb Form)

One paragraph: what this skill accomplishes and the value it provides.
```

題合 `name` 而為人讀式。「Submit to CRAN」非「submit-to-cran」。

**得：** 頂 `#` 標題以祈使式，續以簡段述技所畢。

**敗則：** 若題為名詞而非動詞式，重書。「Package Submission」成「Submit to CRAN」。

### 第四步：書「用時」

列 3-5 觸件——行者當激此技之具體景：

```markdown
## When to Use

- Starting a new R package from scratch
- Converting loose R scripts into a package
- Setting up a package skeleton for collaborative development
```

由行者視書。此為行者察以決激之件。

> **注**：最要觸件宜亦現於前言之 `description`，蓋其於發現階段在全體前讀。`## When to Use` 節供增細與脈。

**得：** 3-5 點述行者當激此技之具體可察件。

**敗則：** 若觸感泛（「需作事時」），由行者視重書：何可察之狀或用者之請當觸激？

### 第五步：書「入」

分必要與可選。明類與默：

```markdown
## Inputs

- **Required**: Package name (lowercase, no special characters except `.`)
- **Required**: One-line description of the package purpose
- **Optional**: License type (default: MIT)
- **Optional**: Whether to initialize renv (default: yes)
```

**得：** 入節清分必要與可選參，各有類示與默（若用）。

**敗則：** 若參類疑，括中加具體例：「Package name (lowercase, no special characters except `.`)」。

### 第六步：書「法」

此技之核。每步循此式：

```markdown
### Step N: Action Title

Context sentence explaining what this step accomplishes.

\```language
concrete_code("that the agent can execute")
\```

**Expected:** What success looks like. Be specific — file created, output matches pattern, command exits 0.

**On failure:** Recovery steps. Don't just say "fix it" — provide the most common failure cause and its resolution.
```

**有效書步**：
- 每步宜獨立可驗
- 含實碼，非偽碼
- 最常徑先，邊況於「On failure」
- 5-10 步為宜。少於五或泛；逾十二宜分為多技。
- 引實工具與實命，非抽象述

**書以便譯**：
- 英文技至多約 400 行。德擴 10-20%，部分 CJK 擴更甚——英 400 行譯後守 500 下。
- 避譯不佳之典故與文化專例。
- 散文簡直——短句譯較佳。

**得：** 法節含 5-12 號步，各有具體碼、`**Expected:**` 果、`**On failure:**` 復。

**敗則：** 若步缺碼，加實命或配。若 Expected／On failure 缺，即書之——可敗之步皆需二者。

### 第七步：書「驗」

法畢後行者運之清單：

```markdown
## Validation

- [ ] Criterion 1 (testable, binary pass/fail)
- [ ] Criterion 2
- [ ] No errors or warnings in output
```

每項須客觀可驗。「Code is clean」劣。「`devtools::check()` returns 0 errors」佳。

**得：** markdown 勾表（`- [ ]`）有 3-8 二元過敗之準，行者可程或察而驗。

**敗則：** 以可度者代主觀者。「Well-documented」成「All exported functions have `@param`, `@return`, and `@examples` roxygen tags」。

### 第八步：書「陷」

3-6 陷含因與避：

```markdown
## Common Pitfalls

- **Pitfall name**: What goes wrong and how to avoid it. Be specific about the symptom and the fix.
```

汲實踐。最佳陷為費時顯之非顯者。

**得：** 3-6 陷，各有粗名、述所敗、與如何避。

**敗則：** 若陷泛（「慎 X」），具體之：名症、因、修。汲開發或試時實敗景。

### 第九步：書「參」

交叉參常於此前、後、同用之 2-5 技：

```markdown
## Related Skills

- `prerequisite-skill` - must be done before this skill
- `follow-up-skill` - commonly done after this skill
- `alternative-skill` - alternative approach to the same goal
```

用技 `name` 域（中劃線），非題。

**得：** 2-5 相關技，列以中劃線 ID 與簡述（前提、後續、替）。

**敗則：** 驗各所引技存：`ls skills/<skill-name>/SKILL.md`。刪更名或已去之引。

### 第十步：入籍

編 `skills/_registry.yml` 於宜域下加新技：

```yaml
- id: skill-name-here
  path: skill-name-here/SKILL.md
  complexity: intermediate
  language: multi
  description: One-line description matching the frontmatter
```

更頂之 `total_skills` 計。

**得：** 新項現於 `skills/_registry.yml` 宜域下，`total_skills` 合盤之實技目數。

**敗則：** 以 `find skills -name SKILL.md | wc -l` 計盤技與籍 `total_skills` 較。驗 `id` 精合目錄名。

### 第十一步：加引用（可選）

若技基於既法、論文、軟件包、標準，加引用子文件於 `references/`：

```bash
mkdir -p skills/<skill-name>/references/
```

建二文件：

- **`references/CITATIONS.bib`** — 機讀 BibTeX（真源）
- **`references/CITATIONS.md`** — 人讀渲之參，便 GitHub 覽

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

引用為可選——溯源要時加之（學術法、發標、規框）。

**譯中處 `references/`**：`references/EXAMPLES.md` 之散述宜譯。`references/CITATIONS.bib` 留英（BibTeX 為中立語）。若唯碼，譯可鏈至英 `references/`。

**得：** 二文件存，`.bib` 解為合法 BibTeX。

**敗則：** 以 `bibtool -d references/CITATIONS.bib` 或線上驗器驗 BibTeX 語法。

### 第十二步：驗技

提交前運本地驗：

```bash
# Check line count (must be ≤500)
lines=$(wc -l < skills/<skill-name>/SKILL.md)
[ "$lines" -le 500 ] && echo "OK ($lines lines)" || echo "FAIL: $lines lines > 500"

# Check required frontmatter fields
head -20 skills/<skill-name>/SKILL.md | grep -q '^name:' && echo "name: OK"
head -20 skills/<skill-name>/SKILL.md | grep -q '^description:' && echo "description: OK"
```

**得：** 行數 ≤500，諸必要域存。

**敗則：** 若逾 500 行，施漸次披露——抽大碼塊（>15 行）至 `references/EXAMPLES.md`：

```bash
mkdir -p skills/<skill-name>/references/
```

移擴碼例、全配文件、多變例至 `references/EXAMPLES.md`。SKILL.md 加參：`See [EXAMPLES.md](references/EXAMPLES.md) for complete configuration examples.` 主 SKILL.md 留簡片（3-10 行）。`.github/workflows/validate-skills.yml` 之 CI 於諸 PR 執此限。

### 第十三步：建斜命符號鏈

建符號鏈以令 Claude Code 發現技為 `/slash-command`：

```bash
# Project-level (available in this project)
ln -s ../../skills/<skill-name> .claude/skills/<skill-name>

# Global (available in all projects)
ln -s /mnt/d/dev/p/agent-almanac/skills/<skill-name> ~/.claude/skills/<skill-name>
```

**得：** `ls -la .claude/skills/<skill-name>/SKILL.md` 解至技文件。

**敗則：** 驗相對路正。由 `.claude/skills/`，`../../skills/<skill-name>` 當達技目錄。以 `readlink -f` 調鏈解。Claude Code 期平構於 `.claude/skills/<name>/SKILL.md`。

### 第十四步：搭翻譯之架

> **諸技必需。** 此步施於人作者與循此法之 AI 行者。勿略——缺譯積為陳積。

提交新技後即為四支持語搭譯文件：

```bash
for locale in de zh-CN ja es; do
  npm run translate:scaffold -- skills <skill-name> "$locale"
done
```

而譯各文件之散文（代碼塊與 ID 留英）。終重生狀態文件：

```bash
npm run translation:status
```

**得：** 四文件建於 `i18n/{de,zh-CN,ja,es}/skills/<skill-name>/SKILL.md`，`source_commit` 皆合當前 HEAD。`npm run validate:translations` 顯新技無陳警。

**敗則：** 若搭架敗，於搭前驗技存於 `skills/_registry.yml`——本讀籍。若 `translation:status` 顯新文件陳，察 `source_commit` 合英源最後改之提交雜湊。

## 驗

- [ ] SKILL.md 存於 `skills/<skill-name>/SKILL.md`
- [ ] YAML 前言無訛而解
- [ ] `name` 合目錄名
- [ ] `description` 一千二十四字內
- [ ] 諸必要節存：When to Use、Inputs、Procedure、Validation、Common Pitfalls、Related Skills
- [ ] 每法步有具體碼與 Expected／On failure 對
- [ ] Related Skills 引合法技名
- [ ] 技列於 `_registry.yml` 有正路
- [ ] 籍之 `total_skills` 已更
- [ ] SKILL.md ≤500 行（過則抽至 `references/EXAMPLES.md`）
- [ ] 估譯擴可容（英源 ≤~400 行則譯守 500 下）
- [ ] 若技基於發之法，加引至 `references/CITATIONS.bib` + `CITATIONS.md`
- [ ] `.claude/skills/<skill-name>` 存符號鏈指技目錄
- [ ] `~/.claude/skills/<skill-name>` 存全域符號鏈（若全可用）

## 陷

- **法泛**：「Configure the system appropriately」於行者無用。供精命、路、配值。
- **缺 On failure**：可敗之步皆需復導。行者不能即興——宜明書退路。
- **範過廣**：欲覆「Set up entire development environment」之技當為 3-5 專技。一技 = 一法。
- **不可試之驗**：「Code quality is good」不可驗。「Linter passes with 0 warnings」可。
- **陳交叉參**：更名或去技時，於諸 Related Skills 節 grep 舊名。
- **述過長**：述為行者決激所讀。守一千二十四字以內，要信前置。
- **單語達 500 行限**：英技 490 行譯德（~10-20% 擴）或 CJK 則逾 500。英源目標 ~400 行，餘用漸次披露（`references/EXAMPLES.md`）。
- **NTFS 掛路避 `git mv`（WSL）**：於 `/mnt/` 路，目錄之 `git mv` 或生壞權（`d?????????`）。宜 `mkdir -p` + 複文件 + `git rm` 舊路。參[境指南](../../guides/setting-up-your-environment.md)之疑難節。

## 例

結構良好之技循此質單：
1. 行者可由述獨決用否
2. 法可機械循而無歧
3. 每步有可驗之果
4. 敗模有具體復路
5. 技可與相關技組

此庫之尺參：
- 基本技：~80-120 行（如 `write-vignette`、`configure-git-repository`）
- 中等技：~120-180 行（如 `write-testthat-tests`、`manage-renv-dependencies`）
- 進階技：~180-250 行（如 `submit-to-cran`、`setup-gxp-r-project`）
- 含擴例之技：SKILL.md ≤500 行 + `references/EXAMPLES.md` 為大配

## 參

- `evolve-skill` — 演化與精此法建之技
- `create-agent` — 建行者定之平行法
- `create-team` — 建團組之平行法
- `write-claude-md` — CLAUDE.md 可參項專流之技
- `configure-git-repository` — 技宜納版控
- `commit-changes` — 提交新技及其符號鏈
- `security-audit-codebase` — 察技是否含入之密或證
