---
name: translate-content
locale: wenyan-ultra
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

譯英源容於目地、留技正與構完。

## 用

- 地化技、代、隊、導於支語→用
- 更陳譯後源變→用
- 域或容類中多項批譯→用
- 為新地建初譯→用

## 入

- **必**：容類——`skills`、`agents`、`teams`、`guides`
- **必**：項 ID——容名/識（如 `create-r-package`）
- **必**：目地——IETF BCP 47 碼（如 `de`、`zh-CN`、`ja`、`es`）
- **可**：批列——多 ID 序譯

## 行

### 一：讀英源

1.1 定源檔路：
   - Skills：`skills/<id>/SKILL.md`
   - Agents：`agents/<id>.md`
   - Teams：`teams/<id>.md`
   - Guides：`guides/<id>.md`

1.2 讀全源檔以解境、構、容。

1.3 識當留英之段：
   - 諸碼塊（三反引圍）
   - 內碼（反引裹）
   - YAML 前題域名與技值（`name`、`tools`、`model`、`priority`、`skills` 列項、`allowed-tools`、`tags`、`domain`、`language`）
   - 檔路、URL、命例
   - 隊中 `<!-- CONFIG:START -->` / `<!-- CONFIG:END -->` 塊

得：源容全解、明心分可譯文於留技。

敗：源檔不在→驗 ID 於登在。察容類或 ID 拼。

### 二：架譯檔

2.1 行架腳本：
```bash
npm run translate:scaffold -- <content-type> <id> <locale>
```

2.2 檔已在→讀以察是否需更（陳）或已新。

2.3 驗架檔有譯前題域：
   - `locale`——配目地
   - `source_locale`——`en`
   - `source_commit`——當 git 短雜
   - `translator`——歸字串
   - `translation_date`——今日

得：架檔於 `i18n/<locale>/<content-type>/<id>/SKILL.md`（或 `.md` 為他類）含正前題。

敗：架腳本敗→以 `mkdir -p` 手建目而複源檔。手加前題域。

### 三：譯描

3.1 譯 YAML 前題之 `description` 域於目地。

3.2 技：描於頂前題。代/隊/導：亦於頂前題。

3.3 譯保簡——配原長式。

得：描含意譯準傳原義。

敗：描歧→留近字譯而非冒誤釋險。

### 四：譯文段

4.1 段段譯諸文容：
   - 段頭（如「## When to Use」→「## Wann verwenden」於德）
   - 段文
   - 列項文（非列項碼/路）
   - 表格文（非表格碼/值）

4.2 留此元如原：
   - 碼塊（``` 圍與縮）
   - 內碼（`反引裹`）
   - 檔路與 URL
   - 跨參中之技/代/隊 ID
   - YAML/JSON 配例
   - 命行例
   - `**Expected:**` 與 `**On failure:**` 標（譯標、留構）

4.3 技：譯標段名：
   - 「When to Use」→ 地等
   - 「Inputs」→ 地等
   - 「Procedure」→ 地等
   - 「Validation」→ 地等
   - 「Common Pitfalls」→ 地等
   - 「Related Skills」→ 地等

4.4 代：譯：
   - Purpose、Capabilities、Available Skills（唯段名——技 ID 留英）、Usage Scenarios、Best Practices、Examples、Limitations、See Also

4.5 隊：譯：
   - Purpose、Team Composition（唯文——ID 留英）、Coordination Pattern、Task Decomposition、Usage Scenarios、Limitations

4.6 導：譯：
   - 諸文段、調文、表述
   - 命例、碼塊、配片留英

得：諸文段意譯。碼塊同英源。跨參用英 ID。

敗：技詞不確→留英含括譯。例：德「Staging-Bereich (Staging Area)」。

### 五：驗構完

5.1 確譯檔同源段數。

5.2 技：驗諸需段在：
   - YAML 前題含 `name`、`description`、`allowed-tools`、`metadata`
   - When to Use、Inputs、Procedure、Validation、Common Pitfalls、Related Skills

5.3 驗碼塊同英源（差圍塊）。

5.4 察行數：技必 ≤ 500 行。

5.5 驗 `name` 域精配英源（為 ID、永不譯）。

得：構效之譯檔過驗。

敗：段段比於英源。復諸缺段。

### 5.5：驗文已譯

5.5.1 自譯檔體取 3 文段。擇異段——非頭、非碼、非前題。

5.5.2 確各取段書於目語、非英。

5.5.3 取段仍英→譯不全。歸步四譯餘英文乃進。

得：3 取文段皆於目語、確體文已譯——非唯頭與前題。

敗：識何段仍含英文。譯之乃續入步六。

### 六：書譯檔

6.1 用 Write 或 Edit 工書全譯容於目路。

6.2 驗檔於期路：
   - Skills：`i18n/<locale>/skills/<id>/SKILL.md`
   - Agents：`i18n/<locale>/agents/<id>.md`
   - Teams：`i18n/<locale>/teams/<id>.md`
   - Guides：`i18n/<locale>/guides/<id>.md`

得：譯檔書於碟正路。

敗：察目在。需則 `mkdir -p` 建。

## 驗

- [ ] 譯檔於 `i18n/<locale>/<type>/<id>` 在
- [ ] `name` 域精配英源
- [ ] `locale` 域配目地
- [ ] `source_commit` 域為效 git 短雜
- [ ] 諸碼塊同英源
- [ ] 諸跨參 ID（技、代、隊）為英
- [ ] 檔 < 500 行（為技）
- [ ] `npm run validate:translations` 此檔報無患
- [ ] 文於目語意讀

## 忌

- **譯碼塊**：碼、命、配當留英。唯譯圍文
- **譯 `name` 域**：`name` 為典 ID。永不譯
- **譯標值**：`metadata.tags` 中標留英為跨地一
- **詞不一**：技詞於檔內與同地他檔皆用同譯
- **字譯成語**：譯義非字。「Common Pitfalls」當為地自然等、非字字譯
- **缺 `source_commit`**：無此域、新追斷。常含
- **批量過質**：唯架出——頭譯而體留英——非效譯。少全譯勝多部
- **過 500 行**：譯或脹 ~10-20% 於英。近限→緊文勿除容

## 參

- [create-skill](../create-skill/SKILL.md) — 解所譯之 SKILL.md 構
- [review-skill-format](../review-skill-format/SKILL.md) — 驗譯技構
- [evolve-skill](../evolve-skill/SKILL.md) — 更譯後變之技
