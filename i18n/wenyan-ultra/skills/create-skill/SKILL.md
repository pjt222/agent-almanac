---
name: create-skill
locale: wenyan-ultra
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

# 造技

書代系可消以行具法之 SKILL.md。

## 用

- 化代當循之可重法
- 加新能於技庫
- 化導、手冊、清為代可消式
- 立案或團一致流

## 入

- **必**：技當成任
- **必**：域分——`skills/_registry.yml` 之 48 域之一
- **必**：複級（basic、intermediate、advanced）
- **可**：源材（存導、手冊、工例）
- **可**：所交引之相關技

## 行

### 一：建目

各技居己目：

```bash
mkdir -p skills/<skill-name>/
```

命規：
- 用小寫 kebab-case：`submit-to-cran`、非 `SubmitToCRAN`
- 起於動：`create-`、`setup-`、`write-`、`deploy-`、`configure-`
- 具：`create-r-dockerfile` 非 `create-dockerfile`

**得：** 目 `skills/<skill-name>/` 存、名循小寫 kebab-case 起於動。

**敗：** 名不起動→重命目。察命衝：`ls skills/ | grep <keyword>` 保無存技含重名。

### 二：書 YAML frontmatter

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

**必欄**：`name`、`description`

**可欄**：`license`、`allowed-tools`（試）、`metadata`、`compatibility`

**備規**：
- `complexity`：basic（< 5 步、無邊例）、intermediate（5-10 步、含判）、advanced（10+ 步、深域）
- `language`：主語；跨語技用 `multi`
- `tags`：3-6 標為發；含域名

**得：** YAML frontmatter 無誤解析、`name` 合目名、`description` 於 1024 字符內含明觸。

**敗：** 驗 YAML 合 `---` 界、版串正引（如 `"1.0"` 非 `1.0`）、述欄 `>` 多行折文正。

### 三：書標與引

```markdown
# Skill Title (Imperative Verb Form)

One paragraph: what this skill accomplishes and the value it provides.
```

標當合 `name` 而為人讀式。「Submit to CRAN」非「submit-to-cran」。

**得：** 頂 `#` 題為命令式後一段述技成何。

**敗：** 標為名短非動短→重書。「Package Submission」為「Submit to CRAN」。

### 四：書「用」

列 3-5 觸件——代當活之具景：

```markdown
## When to Use

- Starting a new R package from scratch
- Converting loose R scripts into a package
- Setting up a package skeleton for collaborative development
```

自代角書。此為代察定活之件。

> **注**：主觸件亦當現於 `description` frontmatter，彼於發現階全體前讀。`## When to Use` 予細與脈。

**得：** 3-5 點述代當活此技之具可觀件。

**敗：** 觸感泛（「須作何時」）→自代角書：何可觀態或用請觸活？

### 五：書「入」

分必與可。具於型與默：

```markdown
## Inputs

- **Required**: Package name (lowercase, no special characters except `.`)
- **Required**: One-line description of the package purpose
- **Optional**: License type (default: MIT)
- **Optional**: Whether to initialize renv (default: yes)
```

**得：** 入節明分必與可、各含型提與默值（若適）。

**敗：** 參型歧→括加具例：「Package name (lowercase, no special characters except `.`)」。

### 六：書「行」

此為技核。各步循此模：

```markdown
### Step N: Action Title

Context sentence explaining what this step accomplishes.

\```language
concrete_code("that the agent can execute")
\```

**Expected:** What success looks like. Be specific — file created, output matches pattern, command exits 0.

**On failure:** Recovery steps. Don't just say "fix it" — provide the most common failure cause and its resolution.
```

**效步書**：
- 各步獨可驗
- 含真碼、非偽
- 常路先、邊例於「On failure」
- 5-10 步為佳。少五或泛、過十二分為多技
- 引真具、真令、非抽述

**為譯書**：
- 英技目標~400 行最大。德脹 10-20%、某 CJK 譯脹更——400 行英源譯後仍於 500 內
- 避譯差之習與文化例
- 文簡直——短句譯佳

**得：** 行節含 5-12 編步、各含具碼、`**Expected:**` 果、`**On failure:**` 復。

**敗：** 步缺碼→加真令或設。Expected/On failure 缺→即書——可敗步皆需二。

### 七：書「驗」

法畢後代行之清：

```markdown
## Validation

- [ ] Criterion 1 (testable, binary pass/fail)
- [ ] Criterion 2
- [ ] No errors or warnings in output
```

各項須客可驗。「碼潔」差。「`devtools::check()` 返零誤」佳。

**得：** markdown 清（`- [ ]`）含 3-8 二分通敗準、代可程或察驗。

**敗：** 代主觀準為量可。「備善」為「諸出函含 `@param`、`@return`、`@examples` roxygen 標」。

### 八：書「忌」

3-6 陷含因與避：

```markdown
## Common Pitfalls

- **Pitfall name**: What goes wrong and how to avoid it. Be specific about the symptom and the fix.
```

取自實歷。佳陷為費大時且不明者。

**得：** 3-6 陷、各含粗名、何誤述、如何避。

**敗：** 陷感泛（「於 X 慎」）→具：名症、因、修。取自發試中實敗。

### 九：書「參」

交引 2-5 常於此前、後、或同用之技：

```markdown
## Related Skills

- `prerequisite-skill` - must be done before this skill
- `follow-up-skill` - commonly done after this skill
- `alternative-skill` - alternative approach to the same goal
```

用技 `name` 欄（kebab-case）、非標。

**得：** 2-5 相關技以 kebab-case ID 列、各含關係短述（前、後、代）。

**敗：** 驗各引技存：`ls skills/<skill-name>/SKILL.md`。除改名或去之引。

### 十：加於庫

編 `skills/_registry.yml` 於合域下加新技：

```yaml
- id: skill-name-here
  path: skill-name-here/SKILL.md
  complexity: intermediate
  language: multi
  description: One-line description matching the frontmatter
```

更庫首 `total_skills` 計。

**得：** 新項現於 `skills/_registry.yml` 合域下、`total_skills` 計合碟上技目實數。

**敗：** 以 `find skills -name SKILL.md | wc -l` 計技、較 `total_skills`。驗 `id` 欄全合目名。

### 十一：加引（可）

技基於立法、研論、軟包、標準→於 `references/` 加引子檔：

```bash
mkdir -p skills/<skill-name>/references/
```

建二檔：

- **`references/CITATIONS.bib`** — 機可讀 BibTeX（真源）
- **`references/CITATIONS.md`** — 人讀式引為 GitHub 覽

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

引為可——源追要時加（學法、刊標、規架）。

**譯中理 `references/`**：`references/EXAMPLES.md` 中文述當譯。`references/CITATIONS.bib` 留英（BibTeX 語中性）。譯可連英 `references/` 目若其僅碼。

**得：** 二檔存且 `.bib` 解為有效 BibTeX。

**敗：** 以 `bibtool -d references/CITATIONS.bib` 或線驗器驗 BibTeX 文。

### 十二：驗技

承前行地驗：

```bash
# Check line count (must be ≤500)
lines=$(wc -l < skills/<skill-name>/SKILL.md)
[ "$lines" -le 500 ] && echo "OK ($lines lines)" || echo "FAIL: $lines lines > 500"

# Check required frontmatter fields
head -20 skills/<skill-name>/SKILL.md | grep -q '^name:' && echo "name: OK"
head -20 skills/<skill-name>/SKILL.md | grep -q '^description:' && echo "description: OK"
```

**得：** 行數 ≤500、諸必欄存。

**敗：** 過 500 行→施漸揭——取大碼塊（>15 行）至 `references/EXAMPLES.md`：

```bash
mkdir -p skills/<skill-name>/references/
```

移擴碼例、全設檔、多變例至 `references/EXAMPLES.md`。於 SKILL.md 加交引：`See [EXAMPLES.md](references/EXAMPLES.md) for complete configuration examples.` 保短內（3-10 行）於主 SKILL.md。`.github/workflows/validate-skills.yml` 於諸 PR 強此限。

### 十三：建斜命令軟連

建軟連使 Claude Code 以 `/slash-command` 發現技：

```bash
# Project-level (available in this project)
ln -s ../../skills/<skill-name> .claude/skills/<skill-name>

# Global (available in all projects)
ln -s /mnt/d/dev/p/agent-almanac/skills/<skill-name> ~/.claude/skills/<skill-name>
```

**得：** `ls -la .claude/skills/<skill-name>/SKILL.md` 解至技檔。

**敗：** 驗相路正。自 `.claude/skills/` 路 `../../skills/<skill-name>` 當達技目。以 `readlink -f` 除軟連解。Claude Code 期平構於 `.claude/skills/<name>/SKILL.md`。

### 十四：架譯

> **諸技必**。此步施於人作者與循此程之 AI 代。勿略——缺譯積為陳備。

承新技後即為諸 4 locales 架譯檔：

```bash
for locale in de zh-CN ja es; do
  npm run translate:scaffold -- skills <skill-name> "$locale"
done
```

續譯各檔之架詞（碼塊與 ID 留英）。終重生態檔：

```bash
npm run translation:status
```

**得：** `i18n/{de,zh-CN,ja,es}/skills/<skill-name>/SKILL.md` 建四檔、`source_commit` 皆合現 HEAD。`npm run validate:translations` 顯零陳警於新技。

**敗：** 架敗→架前驗技存於 `skills/_registry.yml`——本讀庫。`translation:status` 顯新檔陳→察 `source_commit` 合英源末改之承雜。

## 驗

- [ ] SKILL.md 存於 `skills/<skill-name>/SKILL.md`
- [ ] YAML frontmatter 無誤解析
- [ ] `name` 欄合目名
- [ ] `description` 於 1024 字符內
- [ ] 諸必節存：When to Use、Inputs、Procedure、Validation、Common Pitfalls、Related Skills
- [ ] 各步含具碼與 Expected/On failure 對
- [ ] Related Skills 引有效技名
- [ ] 技列於 `_registry.yml` 含正路
- [ ] 庫中 `total_skills` 計已更
- [ ] SKILL.md ≤500 行（過則取至 `references/EXAMPLES.md`）
- [ ] 估譯脹可接（英源 ≤~400 行使譯仍 <500）
- [ ] 基於刊法之技含 `references/CITATIONS.bib` + `CITATIONS.md`
- [ ] 軟連於 `.claude/skills/<skill-name>` 指技目
- [ ] 全軟連於 `~/.claude/skills/<skill-name>`（若全可）

## 忌

- **法泛**：「設系合」無用於代。予準令、檔路、設值
- **缺 On failure**：諸可敗步需復導。代不能即興——須予回退
- **範過廣**：涵「設全發境」之技當為 3-5 專技。一技 = 一法
- **不可試驗**：「碼質善」不可驗。「Linter 通零警」可
- **陳交引**：改名或去技時於諸 Related Skills 節 grep 舊名
- **述過長**：述為代讀以定活者。保於 1024 字符內、前置要
- **單語於 500 行限**：英技於 490 行譯德（~10-20% 脹）或 CJK 逾 500。英源目~400 行、餘以漸揭（`references/EXAMPLES.md`）
- **避 NTFS 掛路（WSL）`git mv`**：`/mnt/` 路之目 `git mv` 或建破權（`d?????????`）。用 `mkdir -p` + 複檔 + `git rm` 舊路

## 例

良構技循此質清：
1. 代自述可決用與否
2. 法可機循而無歧
3. 各步含可驗果
4. 敗模含具復路
5. 技可與相關技組

此庫之寸考：
- 基技：~80-120 行
- 中技：~120-180 行
- 進技：~180-250 行
- 含擴例技：SKILL.md ≤500 行 + `references/EXAMPLES.md`

## 參

- `evolve-skill` - 演精以此法造之技
- `create-agent` - 造代定之並法
- `create-team` - 造團組之並法
- `write-claude-md` - CLAUDE.md 可引案專流之技
- `configure-git-repository` - 技當版控
- `commit-changes` - 承新技與其軟連
- `security-audit-codebase` - 評技為誤含之密或證
