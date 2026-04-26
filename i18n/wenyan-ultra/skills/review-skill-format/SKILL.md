---
name: review-skill-format
locale: wenyan-ultra
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

驗 SKILL.md 對 agentskills.io 開準。察 YAML 首端、必段、步格（Expected/On failure 塊）、行限、登錄同步。新或改技合前用之。

## 用

- 新技書、合前需格驗
- 現技改、需重驗
- 行域諸技批審
- 驗 `create-skill` 元技所建技
- 審 PR 中貢者技投

## 入

- **必**：SKILL.md 路（如 `skills/setup-vault/SKILL.md`）
- **可**：嚴級（`lenient` 或 `strict`、默 `strict`）
- **可**：察登錄同步乎（默是）

## 行

### 一：驗檔存讀容

確 SKILL.md 於期路存且讀全容。

```bash
# Verify file exists
test -f skills/<skill-name>/SKILL.md && echo "EXISTS" || echo "MISSING"

# Count lines
wc -l < skills/<skill-name>/SKILL.md
```

得：檔存且容可讀。行數示。

敗：檔不存→察路為筆誤。`ls skills/<skill-name>/` 驗錄存。錄缺→技未建——先用 `create-skill`。

### 二：察 YAML 首端

析 YAML 首端塊（`---` 間）、驗諸必與薦皆存。

必：
- `name` — 合錄名（kebab-case）
- `description` — <1024 字、首動詞
- `license` — 常 `MIT`
- `allowed-tools` — 逗或空分具列

薦屬：
- `metadata.author` — 作名
- `metadata.version` — 語版串
- `metadata.domain` — `skills/_registry.yml` 之域
- `metadata.complexity` — 一：`basic`、`intermediate`、`advanced`
- `metadata.language` — 主語或 `multi`
- `metadata.tags` — 逗分、3-6 標、含域名

```bash
# Check required frontmatter fields exist
head -30 skills/<skill-name>/SKILL.md | grep -q '^name:' && echo "name: OK" || echo "name: MISSING"
head -30 skills/<skill-name>/SKILL.md | grep -q '^description:' && echo "description: OK" || echo "description: MISSING"
head -30 skills/<skill-name>/SKILL.md | grep -q '^license:' && echo "license: OK" || echo "license: MISSING"
head -30 skills/<skill-name>/SKILL.md | grep -q '^allowed-tools:' && echo "allowed-tools: OK" || echo "allowed-tools: MISSING"
```

得：四必皆存。六屬皆存。`name` 合錄名。`description` <1024 字。

敗：缺各報 BLOCKING。`name` 不合錄名→報 BLOCKING 含期值。`description` >1024 字→報 SUGGEST 含當長。

### 三：locale 特驗（唯譯）

首端含 `locale` 域→檔為譯 SKILL.md。行此補察。無 `locale` 域→略此步。

1. **譯首端**——驗五域存：
   - `locale` — 標 locale（如 `de`、`ja`、`zh-CN`、`es`）
   - `source_locale` — 源 locale（常 `en`）
   - `source_commit` — 譯所用英源之提交雜
   - `translator` — 何或誰生譯
   - `translation_date` — ISO 8601 譯日

2. **散文語掃**——抽 3-5 體段（非碼塊、首端、標）。驗散文以標 locale 書、非英。略：碼塊、內聯碼、具名、域名、檔路、無標標 locale 譯之英術。

3. **碼塊同察**——較譯檔碼塊與英源於 `skills/<skill-name>/SKILL.md`。碼塊必同（碼永不譯）。標容異於英源之碼塊。

```bash
# Check translation frontmatter fields
for field in "locale:" "source_locale:" "source_commit:" "translator:" "translation_date:"; do
  grep -q "^${field}\|^  ${field}" i18n/<locale>/skills/<skill-name>/SKILL.md \
    && echo "$field OK" || echo "$field MISSING"
done
```

得：諸五譯域存。體段於標 locale。碼塊正合英源。

敗：缺譯域報 BLOCKING。體段於英而 `locale` 非英→報 BLOCKING——檔有未譯散文。碼塊異英源→報 BLOCKING——碼不可譯不可改。

### 四：察必段

驗六必段於技體（首端後）皆存。

必段：
1. `## When to Use`
2. `## Inputs`
3. `## Procedure`（含 `### Step N:` 子段）
4. `## Validation`（亦可作 `## Validation Checklist`）
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

得：六段皆存。Procedure 含至少一 `### Step` 子標。

敗：缺各報 BLOCKING。無六段技不合 agentskills.io 準。供 `create-skill` 元技之段模。

### 五：察步格

驗各步循必模：編題、脈、碼塊、與 **Expected:**/**On failure:** 塊。

各 `### Step N:` 子段察：
1. 步有述題（非僅「Step N」）
2. 至少一碼塊或具命存
3. `**Expected:**` 塊存
4. `**On failure:**` 塊存

得：各步皆有 **Expected:** 與 **On failure:** 塊。步含具碼或命、非糊述。

敗：缺 Expected/On failure 各報 BLOCKING。步唯含糊命（「設系應」）→報 SUGGEST 含加具命之注。

### 六：驗行數

察 SKILL.md 於 500 行限內。

```bash
lines=$(wc -l < skills/<skill-name>/SKILL.md)
[ "$lines" -le 500 ] && echo "OK ($lines lines)" || echo "OVER LIMIT ($lines lines > 500)"
```

得：行 ≤ 500。

敗：>500→報 BLOCKING。薦用 `refactor-skill-structure` 技移碼塊 >15 行至 `references/EXAMPLES.md`。常減 20-40% 經移延例。

### 七：察登錄同步

驗技列於 `skills/_registry.yml` 之正域含合屬。

察：
1. 技 `id` 於正域段存
2. `path` 合 `<skill-name>/SKILL.md`
3. `complexity` 合首端
4. `description` 存（可縮）
5. 登錄頂 `total_skills` 數合實技數

```bash
# Check if skill is in registry
grep -q "id: <skill-name>" skills/_registry.yml && echo "Registry: FOUND" || echo "Registry: NOT FOUND"

# Check path
grep -A1 "id: <skill-name>" skills/_registry.yml | grep -q "path: <skill-name>/SKILL.md" && echo "Path: OK" || echo "Path: MISMATCH"
```

得：技列於登錄正域含合路與屬。總計準。

敗：登錄無→報 BLOCKING。供登錄條模：
```yaml
- id: skill-name
  path: skill-name/SKILL.md
  complexity: intermediate
  language: multi
  description: One-line description
```

## 驗

- [ ] SKILL.md 於期路存
- [ ] YAML 首端析無錯
- [ ] 四必首端域皆存（`name`、`description`、`license`、`allowed-tools`）
- [ ] 六屬皆存（`author`、`version`、`domain`、`complexity`、`language`、`tags`）
- [ ] `name` 合錄名
- [ ] `description` <1024 字
- [ ] 六必段皆存（When to Use、Inputs、Procedure、Validation、Common Pitfalls、Related Skills）
- [ ] 各步有 **Expected:** 與 **On failure:** 塊
- [ ] 行 ≤ 500
- [ ] 技列於 `_registry.yml` 含正域、路、屬
- [ ] 登錄 `total_skills` 數準
- [ ] （唯譯）五譯首端域皆存（`locale`、`source_locale`、`source_commit`、`translator`、`translation_date`）
- [ ] （唯譯）體段於標 locale、非英
- [ ] （唯譯）碼塊與英源同

## 忌

- **唯正則察首端**：YAML 析微。`description: >` 多行塊異於 `description: "inline"`。尋域時察二模
- **失 Validation 段變**：某技用 `## Validation Checklist` 代 `## Validation`。皆受；察任標
- **忘登錄總計**：技入登錄後、頂 `total_skills` 必並增。PR 中常失
- **名對題混**：`name` 必 kebab-case 合錄名。`# Title` 標為人讀可異（如 name：`review-skill-format`、題：`# Review Skill Format`）
- **lenient 模略阻**：雖 lenient 模、缺必段與首端域仍應標。lenient 模唯減格與屬薦
- **譯技含英散文**：檔含非英首端、非英標、英體段過諸構察。常驗譯技體文語——首端 `locale` 號散文必於標 locale、非英

## 參

- `create-skill` — 標格規；用為有效 SKILL.md 之權參
- `update-skill-content` — 格驗過後、用此改容質
- `refactor-skill-structure` — 技敗行察→用此移組
- `review-pull-request` — 審加或改技之 PR、合 PR 審與格驗
