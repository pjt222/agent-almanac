---
name: review-skill-format
locale: wenyan-lite
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

# 評技能格式

對 SKILL.md 文件依 agentskills.io 開放標準作驗證。本技能檢 YAML frontmatter 完整性、必需段之存在、程序步格式（Expected／On failure 塊）、行數限與登記簿同步。任何新或已修之技能合併前用之。

## 適用時機

- 新技能已撰且需於合併前作格式驗證
- 既有技能已修需重驗
- 對某領域所有技能作批次稽核
- 驗 `create-skill` 元技能所建之技能
- 評貢獻者於拉取請求中所交之技能

## 輸入

- **必要**：SKILL.md 文件之路徑（如 `skills/setup-vault/SKILL.md`）
- **選擇性**：嚴格度（`lenient` 或 `strict`，預設 `strict`）
- **選擇性**：是否檢登記簿同步（預設是）

## 步驟

### 步驟一：驗文件存且讀內容

確 SKILL.md 文件存於預期路徑並讀其完整內容。

```bash
# Verify file exists
test -f skills/<skill-name>/SKILL.md && echo "EXISTS" || echo "MISSING"

# Count lines
wc -l < skills/<skill-name>/SKILL.md
```

**預期：** 文件存在且內容可讀。行數已顯。

**失敗時：** 若文件不存，檢路徑之錯字。以 `ls skills/<skill-name>/` 驗技能目錄存在。若目錄缺，技能尚未建——先用 `create-skill`。

### 步驟二：檢 YAML frontmatter 欄位

解析 YAML frontmatter 塊（`---` 分隔符之間）並驗所有必需與建議欄位皆存。

必需欄位：
- `name` — 與目錄名相符（kebab-case）
- `description` — 1024 字元下，以動詞起
- `license` — 通常 `MIT`
- `allowed-tools` — 逗號或空格分隔之工具清單

建議元資料欄位：
- `metadata.author` — 作者名
- `metadata.version` — 語意化版本字串
- `metadata.domain` — `skills/_registry.yml` 所列領域之一
- `metadata.complexity` — `basic`、`intermediate`、`advanced` 之一
- `metadata.language` — 主要語言或 `multi`
- `metadata.tags` — 逗號分隔，3-6 標籤，含領域名

```bash
# Check required frontmatter fields exist
head -30 skills/<skill-name>/SKILL.md | grep -q '^name:' && echo "name: OK" || echo "name: MISSING"
head -30 skills/<skill-name>/SKILL.md | grep -q '^description:' && echo "description: OK" || echo "description: MISSING"
head -30 skills/<skill-name>/SKILL.md | grep -q '^license:' && echo "license: OK" || echo "license: MISSING"
head -30 skills/<skill-name>/SKILL.md | grep -q '^allowed-tools:' && echo "allowed-tools: OK" || echo "allowed-tools: MISSING"
```

**預期：** 四必需欄位皆存。六元資料欄位皆存。`name` 與目錄名相符。`description` 於 1024 字元下。

**失敗時：** 將每缺欄位報為 BLOCKING。若 `name` 與目錄名不符，報為 BLOCKING 附預期值。若 `description` 逾 1024 字元，報為 SUGGEST 附當前長度。

### 步驟三：locale 特定驗證（僅譯本）

若 frontmatter 含 `locale` 欄位，文件為譯之 SKILL.md。作此額外檢。若無 `locale`，略此步。

1. **譯之 frontmatter 欄位** —— 驗五欄位皆存：
   - `locale` — 目標 locale 碼（如 `de`、`ja`、`zh-CN`、`es`）
   - `source_locale` — 原 locale（通常 `en`）
   - `source_commit` — 譯所用之英源 commit hash
   - `translator` — 譯者
   - `translation_date` — 譯之 ISO 8601 日期

2. **散文語言掃描** —— 採樣 3-5 段本文（代碼塊、frontmatter、標題之外）。驗散文以目標 locale 撰，非英。略：代碼塊、行內代碼、工具名、欄位名、文件路徑、目標語無標準翻譯之英術語。

3. **代碼塊一致性檢** —— 與 `skills/<skill-name>/SKILL.md` 之英源比對譯本之代碼塊。代碼塊須相同（代碼永不譯）。標其內容與英源異之代碼塊。

```bash
# Check translation frontmatter fields
for field in "locale:" "source_locale:" "source_commit:" "translator:" "translation_date:"; do
  grep -q "^${field}\|^  ${field}" i18n/<locale>/skills/<skill-name>/SKILL.md \
    && echo "$field OK" || echo "$field MISSING"
done
```

**預期：** 五譯欄位皆存。本文段於目標 locale。代碼塊與英源精合。

**失敗時：** 缺譯欄位報為 BLOCKING。若雖 `locale` 為非英但本文段為英，報為 BLOCKING ——文件含未譯之散文。若代碼塊異於英源，報為 BLOCKING ——代碼不可譯或修。

### 步驟四：檢必需段

驗六必需段於技能本體（frontmatter 之後）皆存。

必需段：
1. `## When to Use`
2. `## Inputs`
3. `## Procedure`（含 `### Step N:` 子段）
4. `## Validation`（亦可現為 `## Validation Checklist`）
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

**預期：** 六段皆存。Procedure 段含至少一 `### Step` 子標題。

**失敗時：** 將每缺段報為 BLOCKING。無六段之技能不合 agentskills.io 標準。提供 `create-skill` 元技能之段模板。

### 步驟五：檢程序步格式

驗每程序步循必需模式：編號之步題、上下文、代碼塊、**Expected:**／**On failure:** 塊。

對每 `### Step N:` 子段，檢：
1. 步有描述性標題（非僅「Step N」）
2. 至少一代碼塊或具體指令存
3. `**Expected:**` 塊存
4. `**On failure:**` 塊存

**預期：** 每程序步皆有 **Expected:** 與 **On failure:** 塊。步含具體代碼或指令，非模糊描述。

**失敗時：** 將每缺 Expected／On failure 之步報為 BLOCKING。若步含模糊指令（「適當配置系統」），報為 SUGGEST 附加具體命令之注。

### 步驟六：驗行數

檢 SKILL.md 於 500 行限內。

```bash
lines=$(wc -l < skills/<skill-name>/SKILL.md)
[ "$lines" -le 500 ] && echo "OK ($lines lines)" || echo "OVER LIMIT ($lines lines > 500)"
```

**預期：** 行數 500 或更少。

**失敗時：** 若逾 500 行，報為 BLOCKING。建議用 `refactor-skill-structure` 技能將逾 15 行之代碼塊抽至 `references/EXAMPLES.md`。典型減幅：藉抽延伸例 20-40%。

### 步驟七：檢登記簿同步

驗技能列於 `skills/_registry.yml` 之正確領域下且元資料相符。

檢：
1. 技能 `id` 存於正確領域段下
2. `path` 合 `<skill-name>/SKILL.md`
3. `complexity` 合 frontmatter
4. `description` 存（可縮寫）
5. 登記簿頂之 `total_skills` 數合實際技能數

```bash
# Check if skill is in registry
grep -q "id: <skill-name>" skills/_registry.yml && echo "Registry: FOUND" || echo "Registry: NOT FOUND"

# Check path
grep -A1 "id: <skill-name>" skills/_registry.yml | grep -q "path: <skill-name>/SKILL.md" && echo "Path: OK" || echo "Path: MISMATCH"
```

**預期：** 技能列於登記簿正確領域下，附符合之路徑與元資料。總計準確。

**失敗時：** 若登記簿中未見，報為 BLOCKING。提供登記簿條目模板：
```yaml
- id: skill-name
  path: skill-name/SKILL.md
  complexity: intermediate
  language: multi
  description: One-line description
```

## 驗證

- [ ] SKILL.md 文件存於預期路徑
- [ ] YAML frontmatter 解析無誤
- [ ] 四必需 frontmatter 欄位皆存（`name`、`description`、`license`、`allowed-tools`）
- [ ] 六元資料欄位皆存（`author`、`version`、`domain`、`complexity`、`language`、`tags`）
- [ ] `name` 欄位合目錄名
- [ ] `description` 於 1024 字元下
- [ ] 六必需段皆存（When to Use、Inputs、Procedure、Validation、Common Pitfalls、Related Skills）
- [ ] 每程序步有 **Expected:** 與 **On failure:** 塊
- [ ] 行數 500 或更少
- [ ] 技能列於 `_registry.yml`，附正確領域、路徑與元資料
- [ ] 登記簿之 `total_skills` 數準確
- [ ] （僅譯本）五譯 frontmatter 欄位皆存（`locale`、`source_locale`、`source_commit`、`translator`、`translation_date`）
- [ ] （僅譯本）本文段於目標 locale，非英
- [ ] （僅譯本）代碼塊與英源相同

## 常見陷阱

- **僅以正則檢 frontmatter**：YAML 解析微妙。`description: >` 多行塊異於 `description: "inline"`。尋欄位時兩模式皆檢
- **漏 Validation 段變體**：某技能用 `## Validation Checklist` 而非 `## Validation`。皆可受；檢任一標題
- **忘登記簿總計**：將技能加入登記簿後，頂之 `total_skills` 數亦須遞增。此為 PR 之常漏
- **name 與 title 之混**：`name` 欄位須為 kebab-case 合目錄名。`# Title` 標題為人類可讀且可異（如 name：`review-skill-format`，title：`# Review Skill Format`）
- **lenient 模式略 blocker**：即便於 lenient 模式，缺必需段與 frontmatter 欄位仍宜標。lenient 模式僅鬆風格與元資料建議
- **譯技能含英散文**：含非英 frontmatter、非英標題、英本文段之文件通過所有結構檢。譯技能務驗本文語——frontmatter 中之 `locale` 欄位即標散文須於目標語而非英

## 相關技能

- `create-skill` — 標準格式規範；用為對何為有效 SKILL.md 之權威參考
- `update-skill-content` — 格式驗證通過後，用此改善內容品質
- `refactor-skill-structure` — 技能未過行數檢時，用此抽出並重組
- `review-pull-request` — 評加或修技能之 PR 時，併 PR 評與格式驗證
