---
name: translate-content
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Translate agent-almanac content (skills, agents, teams, guides) into a target
  locale while preserving code blocks, IDs, and technical structure. Covers
  scaffolding, frontmatter setup, prose translation, code preservation, and
  freshness tracking. Use when localizing content for a new language, updating
  stale translations after source changes, or batch-translating a domain.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: i18n
  complexity: intermediate
  language: multi
  tags: i18n, translation, localization, multilingual, l10n
---

# 譯容

譯英之源容於目語，存技準與構之全。

## 用時

- 局技、代理、團、導於支之語乃用
- 源變後新陳之譯乃用
- 域或容類中多物批譯乃用
- 立新語之初譯乃用

## 入

- **必要**：容類——`skills`、`agents`、`teams`、或 `guides`
- **必要**：物 ID——容之名／識（如 `create-r-package`）
- **必要**：目語——IETF BCP 47 碼（如 `de`、`zh-CN`、`ja`、`es`）
- **可選**：批列——序譯多 ID

## 法

### 第一步：讀英源

1.1. 定源文之路：
   - Skills：`skills/<id>/SKILL.md`
   - Agents：`agents/<id>.md`
   - Teams：`teams/<id>.md`
   - Guides：`guides/<id>.md`

1.2. 讀全源文以解境、構、容。

1.3. 識當留英之節：
   - 諸碼塊（三反引號圍）
   - 內聯碼（反引號裹）
   - YAML frontmatter 之域名與技值（`name`、`tools`、`model`、`priority`、`skills` 列、`allowed-tools`、`tags`、`domain`、`language`）
   - 文路、URL、命例
   - 團中之 `<!-- CONFIG:START -->` ／ `<!-- CONFIG:END -->` 塊

得：源容之全解，譯之文與存之技內容於心明分。

敗則：若源文不尋，驗 ID 存於註冊。察容類或 ID 之拼誤。

### 第二步：架譯文

2.1. 行架本：
```bash
npm run translate:scaffold -- <content-type> <id> <locale>
```

2.2. 若文已存，讀之以察是否須更（陳）或已新。

2.3. 驗架文有譯之 frontmatter 域：
   - `locale`——合目語
   - `source_locale`——`en`
   - `source_commit`——當前 git 短雜
   - `translator`——歸屬之串
   - `translation_date`——今日之期

得：架文於 `i18n/<locale>/<content-type>/<id>/SKILL.md`（或他類之 `.md`），有正 frontmatter。

敗則：若架本敗，以 `mkdir -p` 手立目而拷源文。手加 frontmatter 域。

### 第三步：譯述

3.1. 譯 YAML frontmatter 之 `description` 域於目語。

3.2. 為技，述於頂層 frontmatter 內。為代理／團／導，亦於頂層 frontmatter。

3.3. 譯宜簡——配原之長與式。

得：述域含成語之譯，準傳原義。

敗則：若述歧，譯近字而非冒誤釋。

### 第四步：譯文節

4.1. 諸文容逐節譯：
   - 節題（如「## When to Use」→ 德之「## Wann verwenden」）
   - 段
   - 列項之文（非列項之碼／路）
   - 表格之文（非表格之碼／值）

4.2. 諸元如原存：
   - 碼塊（``` 圍與縮）
   - 內聯碼（反引號裹）
   - 文路與 URL
   - 交引中之技／代理／團 ID
   - YAML/JSON 配例
   - 命行例
   - `**Expected:**` 與 `**On failure:**` 標（譯標而存構）

4.3. 為技，譯標節名：
   - 「When to Use」→ 語之等
   - 「Inputs」→ 語之等
   - 「Procedure」→ 語之等
   - 「Validation」→ 語之等
   - 「Common Pitfalls」→ 語之等
   - 「Related Skills」→ 語之等

4.4. 為代理，譯：
   - Purpose、Capabilities、Available Skills（節名唯——技 ID 留英）、Usage Scenarios、Best Practices、Examples、Limitations、See Also

4.5. 為團，譯：
   - Purpose、Team Composition（文唯——ID 留英）、Coordination Pattern、Task Decomposition、Usage Scenarios、Limitations

4.6. 為導，譯：
   - 諸文節、調試文、表述
   - 留命例、碼塊、配片於英

得：諸文節皆成語譯。碼塊同英源。交引用英 ID。

敗則：若不確技術詞，留英並括譯。例：德之「Staging-Bereich (Staging Area)」。

### 第五步：驗構之全

5.1. 確譯文有與源同數之節。

5.2. 為技，驗諸必節皆現：
   - YAML frontmatter 含 `name`、`description`、`allowed-tools`、`metadata`
   - When to Use、Inputs、Procedure、Validation、Common Pitfalls、Related Skills

5.3. 驗碼塊與英源同（diff 圍塊）。

5.4. 察行計：技須 ≤ 500 行。

5.5. 驗 `name` 域與英源精合（為 ID，永不譯）。

得：構有效之譯文，過驗。

敗則：與英源逐節比。復諸缺節。

### 第 5.5 步：驗文已譯

5.5.1. 自譯文之體取三文段。擇諸節之段——非題、非碼塊、非 frontmatter。

5.5.2. 確各取段為目語，非英。

5.5.3. 若某取段仍英，譯不全。回第四步而譯餘英文，方續。

得：三取文段皆於目語，確體文已譯——非僅題與 frontmatter。

敗則：識何節仍含英文。譯之方續第六步。

### 第六步：書譯文

6.1. 以 Write 或 Edit 之器書全譯容於目路。

6.2. 驗文存於期之路：
   - Skills：`i18n/<locale>/skills/<id>/SKILL.md`
   - Agents：`i18n/<locale>/agents/<id>.md`
   - Teams：`i18n/<locale>/teams/<id>.md`
   - Guides：`i18n/<locale>/guides/<id>.md`

得：譯文書於盤，於正路。

敗則：察目存。若須，以 `mkdir -p` 立。

## 驗

- [ ] 譯文存於 `i18n/<locale>/<type>/<id>`
- [ ] `name` 域與英源精合
- [ ] `locale` 域合目語
- [ ] `source_commit` 域設為有效 git 短雜
- [ ] 諸碼塊與英源同
- [ ] 諸交引 ID（技、代理、團）為英
- [ ] 文於 500 行下（為技）
- [ ] `npm run validate:translations` 報此文無患
- [ ] 文於目語讀成

## 陷

- **譯碼塊**：碼、命、配當留英。唯譯圍之文。
- **譯 `name` 域**：`name` 為典 ID。永不譯。
- **譯標值**：`metadata.tags` 之標留英為跨語一致。
- **不一術**：技術詞於文與同語諸文中用同譯。
- **逐字譯成語**：譯義，非字。「Common Pitfalls」當為語之自然等，非逐字譯。
- **缺 `source_commit`**：無此域，新追斷。恆含之。
- **批量勝質**：唯架之出——題譯而體仍英——非有效譯。少完譯勝多部譯。
- **過 500 行**：譯或脹 10-20% 於英。若近限，緊文而非除容。

## 參

- [create-skill](../create-skill/SKILL.md) — 解所譯之 SKILL.md 構
- [review-skill-format](../review-skill-format/SKILL.md) — 驗譯之技構
- [evolve-skill](../evolve-skill/SKILL.md) — 自譯後變之技更
