---
name: translate-content
locale: wenyan-lite
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

# 翻譯內容

將英文源內容譯為目標地區設定，保留技術準確性與結構完整性。

## 適用時機

- 將技能、代理、團隊或指南本地化至支援之語言
- 更新源變後已過時之翻譯
- 批次翻譯某域或內容類型之多項
- 為新地區設定建初始翻譯

## 輸入

- **必要**：內容類型——`skills`、`agents`、`teams` 或 `guides`
- **必要**：項 ID——內容之名／識別符（如 `create-r-package`）
- **必要**：目標地區設定——IETF BCP 47 碼（如 `de`、`zh-CN`、`ja`、`es`）
- **選擇性**：批次清單——順序譯之多 ID

## 步驟

### 步驟一：讀英文源

1.1. 定源檔路徑：
   - Skills：`skills/<id>/SKILL.md`
   - Agents：`agents/<id>.md`
   - Teams：`teams/<id>.md`
   - Guides：`guides/<id>.md`

1.2. 讀整源檔以理解脈絡、結構與內容。

1.3. 識別須留英文之節：
   - 所有代碼塊（以三反引號圍）
   - 行內代碼（反引號包）
   - YAML 前置設定欄位名與技術值（`name`、`tools`、`model`、`priority`、`skills` 列表條目、`allowed-tools`、`tags`、`domain`、`language`）
   - 檔路徑、URL、命令範例
   - 團隊中之 `<!-- CONFIG:START -->` / `<!-- CONFIG:END -->` 區塊

**預期：** 對源內容之全面理解，含可譯散文與保留之技術內容之清晰心理區分。

**失敗時：** 若源檔未找到，驗 ID 於註冊表中存在。檢內容類型或 ID 之拼字錯。

### 步驟二：搭建翻譯檔

2.1. 跑搭建腳本：
```bash
npm run translate:scaffold -- <content-type> <id> <locale>
```

2.2. 若檔已存在，讀之以檢其需更新（過時）或已時新。

2.3. 驗搭建檔含翻譯前置設定欄位：
   - `locale`——匹配目標地區設定
   - `source_locale`——`en`
   - `source_commit`——當前 git 短雜湊
   - `translator`——歸屬字串
   - `translation_date`——今之日期

**預期：** `i18n/<locale>/<content-type>/<id>/SKILL.md`（其他類型則 `.md`）之搭建檔，含正確前置設定。

**失敗時：** 若搭建腳本失敗，以 `mkdir -p` 手動建目錄並複製源檔。手動加前置設定欄位。

### 步驟三：譯描述

3.1. 將 YAML 前置設定中之 `description` 欄位譯為目標地區設定。

3.2. 對技能，描述於頂層前置設定中。對代理／團隊／指南，亦於頂層前置設定中。

3.3. 譯保持簡潔——配源之長度與風格。

**預期：** 描述欄位含準確傳達原意之地道翻譯。

**失敗時：** 若描述含混，保持較字面之翻譯而非冒誤解之險。

### 步驟四：譯散文節

4.1. 逐節譯所有散文內容：
   - 節標題（如「## When to Use」→ 德文「## Wann verwenden」）
   - 段落文本
   - 列表項文本（但非列表項代碼／路徑）
   - 表格儲存格文本（但非表格儲存格代碼／值）

4.2. 完全保留以下元素：
   - 代碼塊（``` 圍與縮排）
   - 行內代碼（`反引號包`）
   - 檔路徑與 URL
   - 交叉引用中之技能／代理／團隊 ID
   - YAML/JSON 配置範例
   - 命令列範例
   - `**Expected:**` 與 `**On failure:**` 標記（譯標籤，留結構）

4.3. 對技能，譯標準化節名：
   - 「When to Use」→ 地區等價
   - 「Inputs」→ 地區等價
   - 「Procedure」→ 地區等價
   - 「Validation」→ 地區等價
   - 「Common Pitfalls」→ 地區等價
   - 「Related Skills」→ 地區等價

4.4. 對代理，譯：
   - Purpose、Capabilities、Available Skills（僅節名——技能 ID 留英）、Usage Scenarios、Best Practices、Examples、Limitations、See Also

4.5. 對團隊，譯：
   - Purpose、Team Composition（僅散文——ID 留英）、Coordination Pattern、Task Decomposition、Usage Scenarios、Limitations

4.6. 對指南，譯：
   - 所有散文節、除錯文本、表格描述
   - 保留命令範例、代碼塊與配置片段於英文

**預期：** 所有散文節地道翻譯。代碼塊與英文源相同。交叉引用用英文 ID。

**失敗時：** 若對技術術語不確定，保留英文術語並附括號翻譯。例：德文「Staging-Bereich (Staging Area)」。

### 步驟五：驗結構完整性

5.1. 確翻譯檔含與源同數之節。

5.2. 對技能，驗所有必要節在：
   - 含 `name`、`description`、`allowed-tools`、`metadata` 之 YAML 前置設定
   - When to Use、Inputs、Procedure、Validation、Common Pitfalls、Related Skills

5.3. 驗代碼塊與英文源相同（diff 圍塊）。

5.4. 檢行數：技能須 ≤ 500 行。

5.5. 驗 `name` 欄位與英文源完全相同（其為 ID，永不譯）。

**預期：** 結構有效之翻譯檔且通過驗證。

**失敗時：** 與英文源逐節比。復任何缺節。

### 步驟 5.5：驗散文已譯

5.5.1. 自翻譯檔之主體取樣 3 散文段落。擇來自不同節之段——非標題、非代碼塊、非前置設定。

5.5.2. 確每取樣段以目標語言寫，非英文。

5.5.3. 若任何取樣段仍為英文，翻譯不完整。回步驟四並譯餘英文散文後再進。

**預期：** 所有 3 取樣散文段皆於目標語言，確主體文本已譯——非僅標題與前置設定。

**失敗時：** 識別仍含英文散文之節。於續至步驟六前譯之。

### 步驟六：寫翻譯檔

6.1. 用 Write 或 Edit 工具將完整翻譯內容寫至目標路徑。

6.2. 驗檔存於預期路徑：
   - Skills：`i18n/<locale>/skills/<id>/SKILL.md`
   - Agents：`i18n/<locale>/agents/<id>.md`
   - Teams：`i18n/<locale>/teams/<id>.md`
   - Guides：`i18n/<locale>/guides/<id>.md`

**預期：** 翻譯檔以正確路徑寫至磁碟。

**失敗時：** 檢目錄存在。如需以 `mkdir -p` 建之。

## 驗證

- [ ] 翻譯檔存於 `i18n/<locale>/<type>/<id>`
- [ ] `name` 欄位與英文源完全相同
- [ ] `locale` 欄位匹配目標地區設定
- [ ] `source_commit` 欄位設為有效 git 短雜湊
- [ ] 所有代碼塊與英文源相同
- [ ] 所有交叉引用 ID（技能、代理、團隊）為英文
- [ ] 檔少於 500 行（對技能）
- [ ] `npm run validate:translations` 對此檔報告無問題
- [ ] 散文於目標語言中地道讀

## 常見陷阱

- **譯代碼塊**：代碼、命令與配置須留英文。僅譯周圍散文。
- **譯 `name` 欄位**：`name` 欄位為標準 ID。永不譯。
- **譯標籤值**：`metadata.tags` 中之標籤留英文以求跨地區設定一致。
- **不一致術語**：對技術術語於檔內與同地區設定之檔間用相同翻譯。
- **慣用語之字面翻譯**：譯意，非詞。「Common Pitfalls」應成地區之自然等價，非逐字翻譯。
- **缺 `source_commit`**：無此欄位則新鮮度追蹤破。永遠含之。
- **批次吞吐勝於品質**：僅搭建之輸出——標題譯而主體仍英文——非有效翻譯。寡而完整之翻譯勝於多而部分。
- **超過 500 行**：翻譯可能較英文擴 10-20%。若近極限，緊散文而非移內容。

## 相關技能

- [create-skill](../create-skill/SKILL.md) — 理解所譯之 SKILL.md 結構
- [review-skill-format](../review-skill-format/SKILL.md) — 驗翻譯之技能結構
- [evolve-skill](../evolve-skill/SKILL.md) — 更新自翻譯後已變之技能
