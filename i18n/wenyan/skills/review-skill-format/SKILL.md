---
name: review-skill-format
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Review a SKILL.md file for compliance with the agentskills.io standard.
  Checks YAML frontmatter fields, required sections, line count limits,
  procedure step format, and registry synchronization. Use when a new skill
  needs format validation before merge, an existing skill has been modified and
  requires re-validation, performing a batch audit of all skills in a domain,
  or reviewing a contributor's skill submission in a pull request.
license: MIT
allowed-tools: Read Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.2"
  domain: review
  complexity: intermediate
  language: multi
  tags: review, skills, format, validation, agentskills, quality
---

# 審技格

對 agentskills.io 開標驗 SKILL.md。本技察 YAML 前文之全、需段之存、程步之式（Expected/On failure 段）、行限、與庫同。合前用之以審任新或改之技。

## 用時

- 新技已書且需格驗合前乃用
- 現技已改且需再驗乃用
- 行域全技之批審乃用
- 驗 `create-skill` 元技所立之技乃用
- 審捐者 PR 之技乃用

## 入

- **必要**：SKILL.md 之路（如 `skills/setup-vault/SKILL.md`）
- **可選**：嚴等（`lenient` 或 `strict`，默：`strict`）
- **可選**：是否察庫同（默：是）

## 法

### 第一步：驗文存而讀內

確 SKILL.md 存於期路且讀其全內。

```bash
# Verify file exists
test -f skills/<skill-name>/SKILL.md && echo "EXISTS" || echo "MISSING"

# Count lines
wc -l < skills/<skill-name>/SKILL.md
```

得：文存，內可讀。行數已示。

敗則：若文不存，察路之拼。以 `ls skills/<skill-name>/` 驗技所存。若所缺，技尚未立——先用 `create-skill`。

### 第二步：察 YAML 前文之欄

析 YAML 前文塊（`---` 間）而驗諸需與議欄存。

需欄：

- `name` — 合所之名（kebab-case）
- `description` — 1024 字內，動詞始
- `license` — 常 `MIT`
- `allowed-tools` — 逗或空分之具列

議屬欄：

- `metadata.author` — 著名
- `metadata.version` — 語意版串
- `metadata.domain` — `skills/_registry.yml` 所列之域
- `metadata.complexity` — 之一：`basic`、`intermediate`、`advanced`
- `metadata.language` — 主語或 `multi`
- `metadata.tags` — 逗分，3-6 標，含域名

```bash
# Check required frontmatter fields exist
head -30 skills/<skill-name>/SKILL.md | grep -q '^name:' && echo "name: OK" || echo "name: MISSING"
head -30 skills/<skill-name>/SKILL.md | grep -q '^description:' && echo "description: OK" || echo "description: MISSING"
head -30 skills/<skill-name>/SKILL.md | grep -q '^license:' && echo "license: OK" || echo "license: MISSING"
head -30 skills/<skill-name>/SKILL.md | grep -q '^allowed-tools:' && echo "allowed-tools: OK" || echo "allowed-tools: MISSING"
```

得：諸四需欄皆存。諸六屬欄皆存。`name` 合所名。`description` 於 1024 字內。

敗則：諸缺欄報為 BLOCKING。若 `name` 不合所名，報為 BLOCKING 附期值。若 `description` 逾 1024 字，報為 SUGGEST 附當長。

### 第三步：locale 特之驗（獨譯）

若前文含 `locale` 欄，文為譯之 SKILL.md。行此附察。若無 `locale` 欄，略此步。

1. **譯前文之欄** — 驗此五欄存：
   - `locale` — 目 locale 碼（如 `de`、`ja`、`zh-CN`、`es`）
   - `source_locale` — 源 locale（常 `en`）
   - `source_commit` — 譯所用英源之提交雜
   - `translator` — 譯之何人或何
   - `translation_date` — ISO 8601 之譯日

2. **散文語掃** — 取 3-5 體段（碼塊、前文、首之外）。驗散文書於目 locale，非英。略：碼塊、行內碼、具名、欄名、文路、目語中無標譯之英。

3. **碼塊同察** — 較譯文之諸碼塊與英源 `skills/<skill-name>/SKILL.md`。碼塊必同（碼永不譯）。標內異於英源之碼塊。

```bash
# Check translation frontmatter fields
for field in "locale:" "source_locale:" "source_commit:" "translator:" "translation_date:"; do
  grep -q "^${field}\|^  ${field}" i18n/<locale>/skills/<skill-name>/SKILL.md \
    && echo "$field OK" || echo "$field MISSING"
done
```

得：諸五譯欄存。體段於目 locale。碼塊精合英源。

敗則：缺譯欄報為 BLOCKING。若體段為英而 `locale` 非英，報為 BLOCKING——文有未譯散文。若碼塊異於英源，報為 BLOCKING——碼必不可譯或改。

### 第四步：察需段

驗諸六需段於技體（前文後）皆存。

需段：

1. `## When to Use`
2. `## Inputs`
3. `## Procedure`（附 `### Step N:` 子段）
4. `## Validation`（亦可為 `## Validation Checklist`）
5. `## Common Pitfalls`
6. `## Related Skills`

```bash
# Check each required section
for section in "## When to Use" "## Inputs" "## Procedure" "## Common Pitfalls" "## Related Skills"; do
  grep -q "$section" skills/<skill-name>/SKILL.md && echo "$section: OK" || echo "$section: MISSING"
done

# Validation section may use either heading
grep -qE "## Validation( Checklist)?" skills/<skill-name>/SKILL.md && echo "Validation: OK" || echo "Validation: MISSING"
```

得：諸六段皆存。Procedure 段含至少一 `### Step` 之子首。

敗則：諸缺段報為 BLOCKING。無諸六段之技不合 agentskills.io 之標。供 `create-skill` 元技之段樣。

### 第五步：察程步之式

驗各程步循需形：編號之步首、境、碼塊、**Expected:**/**On failure:** 段。

各 `### Step N:` 子段察：

1. 步有述首（非獨「Step N」）
2. 至少一碼塊或具指存
3. `**Expected:**` 段存
4. `**On failure:**` 段存

得：各程步有 **Expected:** 與 **On failure:** 段。步含具碼或指，非泛述。

敗則：諸缺 Expected/On failure 之步報為 BLOCKING。若步獨含泛指（「宜配系」），報為 SUGGEST 附注以加具命。

### 第六步：驗行數

察 SKILL.md 於 500 行限內。

```bash
lines=$(wc -l < skills/<skill-name>/SKILL.md)
[ "$lines" -le 500 ] && echo "OK ($lines lines)" || echo "OVER LIMIT ($lines lines > 500)"
```

得：行數 500 或以下。

敗則：若逾 500 行，報為 BLOCKING。議用 `refactor-skill-structure` 技以提 >15 行之碼塊至 `references/EXAMPLES.md`。常減 20-40% 由提廣例。

### 第七步：察庫同

驗技於 `skills/_registry.yml` 之正域下列附合屬。

察：

1. 技 `id` 存於正域段下
2. `path` 合 `<skill-name>/SKILL.md`
3. `complexity` 合前文
4. `description` 存（或縮）
5. 庫首之 `total_skills` 數合實技數

```bash
# Check if skill is in registry
grep -q "id: <skill-name>" skills/_registry.yml && echo "Registry: FOUND" || echo "Registry: NOT FOUND"

# Check path
grep -A1 "id: <skill-name>" skills/_registry.yml | grep -q "path: <skill-name>/SKILL.md" && echo "Path: OK" || echo "Path: MISMATCH"
```

得：技於庫之正域下列附合路與屬。總數確。

敗則：若庫無，報為 BLOCKING。供庫入樣：

```yaml
- id: skill-name
  path: skill-name/SKILL.md
  complexity: intermediate
  language: multi
  description: One-line description
```

## 驗

- [ ] SKILL.md 存於期路
- [ ] YAML 前文無誤可析
- [ ] 諸四需前文欄皆存（`name`、`description`、`license`、`allowed-tools`）
- [ ] 諸六屬欄皆存（`author`、`version`、`domain`、`complexity`、`language`、`tags`）
- [ ] `name` 欄合所名
- [ ] `description` 於 1024 字內
- [ ] 諸六需段皆存（When to Use、Inputs、Procedure、Validation、Common Pitfalls、Related Skills）
- [ ] 各程步有 **Expected:** 與 **On failure:** 段
- [ ] 行數 500 或以下
- [ ] 技於 `_registry.yml` 列附正域、路、屬
- [ ] 庫之 `total_skills` 數確
- [ ] （獨譯）諸五譯前文欄皆存（`locale`、`source_locale`、`source_commit`、`translator`、`translation_date`）
- [ ] （獨譯）體段於目 locale，非英
- [ ] （獨譯）碼塊精合英源

## 陷

- **獨以正則察前文**：YAML 析或微。`description: >` 之多行塊異於 `description: "inline"`。尋欄時察兩形
- **失 Validation 段之變**：某技用 `## Validation Checklist` 而非 `## Validation`。皆受；察任一首
- **忘庫總數**：加技於庫後，首之 `total_skills` 數亦須增。此為 PR 中常失
- **name 對 title 之惑**：`name` 欄必為 kebab-case 合所名。`# Title` 首為人讀，可異（如 name：`review-skill-format`、title：`# Review Skill Format`）
- **lenient 模略阻**：雖於 lenient 模，缺需段與前文欄仍宜標。lenient 獨鬆格與屬之議
- **譯技中之英散文**：含非英前文、非英首、英體段之文過諸構察。為譯技必驗體之語——前文之 `locale` 欄示散文必於目語，非英

## 參

- `create-skill` — 標式之規；用為效 SKILL.md 之權參
- `update-skill-content` — 格驗過後，用此以善內質
- `refactor-skill-structure` — 技敗行限察時，用此以提而重組
- `review-pull-request` — 審加或改技之 PR 時，合 PR 審與格驗
