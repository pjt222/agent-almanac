---
name: update-skill-content
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Update the content of an existing SKILL.md to improve accuracy,
  completeness, and clarity. Covers version bumping, procedure
  refinement, pitfall expansion, and related skills synchronization. Use
  when a skill's procedures reference outdated tools or APIs, the Common
  Pitfalls section is thin, Related Skills has broken cross-references, or
  after receiving feedback that a skill's procedures are unclear or incomplete.
license: MIT
allowed-tools: Read Write Edit Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: review
  complexity: intermediate
  language: multi
  tags: review, skills, content, update, maintenance, quality
---

# 更新技能內容

精煉現有 SKILL.md 之程序步驟、以真實失敗模式擴充常見陷阱、同步相關技能段並提升版號。於技能通過格式驗證但有內容缺口、過時參考或不完整程序時用之。

## 適用時機

- 技能之程序步驟參照過時之工具、API 或版號
- 常見陷阱段薄弱（少於 3 條陷阱）或缺真實失敗模式
- 相關技能段有失效之交叉參考或缺相關連結
- 程序步驟缺具體代碼範例或指示模糊
- 庫中新增技能,既有技能應交叉引用之
- 收到回饋指技能之程序不清或不完整後

## 輸入

- **必要**：欲更新之 SKILL.md 文件路徑
- **選擇性**：聚焦之特定段落（如「procedure」、「pitfalls」、「related-skills」）
- **選擇性**：更新來源（變更日誌、issue 報告、用戶回饋）
- **選擇性**：是否提升版號（預設：是,小幅提升）

## 步驟

### 步驟一：讀當前技能並評估內容品質

通讀 SKILL.md 並評估各段落之完整性與準確性。

各段落評估準則：
- **適用時機**：觸發條件具體可行否？（預期 3-5 項）
- **輸入**：類型、預設與必要/選擇性是否清楚分開？
- **步驟**：每步是否有具體代碼、預期與失敗時？
- **驗證**：清單項目是否客觀可測？（預期 5+ 項）
- **常見陷阱**：陷阱是否具體含症狀與修復？（預期 3-6 條）
- **相關技能**：所引技能是否存在？顯而易見之相關技能是否缺漏？

**預期：** 哪些段落需改進之清晰圖像,並辨識具體缺口。

**失敗時：** 若無法讀技能（路徑錯誤）,驗證路徑。若 SKILL.md 之 YAML frontmatter 損壞,先以 `review-skill-format` 修復 frontmatter,再嘗試內容更新。

### 步驟二：檢查過時參考

掃描程序步驟中可能已變化之版本特定參考、工具名、URL 與 API 模式。

常見過時指標：
- 特定版號（如 `v1.24`、`R 4.3.0`、`Node 18`）
- 可能已遷移或失效之 URL
- 已變化之 CLI 旗標或命令語法
- 已重命名或棄用之套件名
- 已演化之配置文件格式

```bash
# Check for version-specific references
grep -nE '[vV][0-9]+\.[0-9]+' skills/<skill-name>/SKILL.md

# Check for URLs
grep -nE 'https?://' skills/<skill-name>/SKILL.md
```

**預期：** 含行號之潛在過時參考清單。每參考經驗證為當前或標記待更新。

**失敗時：** 若參考過多無法手動逐一檢查,排序：先程序代碼塊（最可能致運行時失敗）,次常見陷阱（可能參照舊變通）,再資訊性文本。

### 步驟三：更新程序步驟以求準確

對被辨識為需改進之每程序步驟：

1. 驗證代碼塊仍正確執行或反映當前最佳實踐
2. 加缺失之上下文句子,解釋此步*為何*需要
3. 確保具體命令使用真實路徑、真實旗標與真實輸出
4. 更新預期塊以匹配當前工具行為
5. 更新失敗時塊,含當前錯誤訊息與修復

更新代碼塊時保留原結構：
- 保持步驟編號一致
- 維持 `### Step N: Title` 格式
- 除非原順序有誤,勿重排步驟

**預期：** 所有程序步驟含當前可執行代碼。預期/失敗時塊反映實際當前行為。

**失敗時：** 若不確定代碼塊是否仍正確,加註：`<!-- TODO: Verify this command against current version -->`。勿移除可運行之代碼塊以未測試之替代品取代。

### 步驟四：擴充常見陷阱

審查常見陷阱段,若有缺口則擴充。

陷阱之品質準則：
- 每陷阱有**粗體名稱**後接具體描述
- 描述含*症狀*（出何錯）與*修復*（如何避免或恢復）
- 陷阱取自真實失敗模式,非假設性顧慮
- 3-6 條陷阱為目標範圍

新陷阱之來源：
- 失敗時塊複雜之程序步驟（此等多為陷阱）
- 警告同工具或模式之相關技能
- 程序使用者所報之常見問題

**預期：** 3-6 條陷阱,各有具體症狀與修復。無「小心」或「徹底測試」之類通用陷阱。

**失敗時：** 若僅能辨識 1-2 條陷阱,對基礎複雜度技能可接受。對中級與進階技能,少於 3 條陷阱暗示作者未充分探索失敗模式——標記之以待未來擴充。

### 步驟五：同步相關技能段

驗證相關技能段中所有交叉參考有效,並補加缺失連結。

1. 對每被引技能,驗證其存在：
   ```bash
   # Check if referenced skill exists
   test -d skills/referenced-skill-name && echo "EXISTS" || echo "NOT FOUND"
   ```
2. 搜尋引用此技能之技能（彼等應交叉連結）：
   ```bash
   # Find skills that reference this skill
   grep -rl "skill-name" skills/*/SKILL.md
   ```
3. 依領域與標籤檢查顯而易見之相關技能
4. 用此格式：`- \`skill-id\` — 關係之一行描述`

**預期：** 所引技能皆存於磁碟。雙向交叉參考已就位。無孤立連結。

**失敗時：** 若被引技能不存在,移除參考或以註解標為計畫中之未來技能。若多技能引此技能但未列於相關技能,加最相關之 2-3 條。

### 步驟六：於 frontmatter 提升版號

依語意化版控更新 `metadata.version` 欄位：
- **修補提升**（1.0 至 1.1）：錯字修復、小釐清、URL 更新
- **次版提升**（1.0 至 2.0）：新程序步驟、重大內容新增、結構變化
- **註**：技能用簡化二段版控（major.minor）

亦更新 frontmatter 中之任何日期欄位（如有）。

**預期：** 版號適當提升。變更幅度與更新範圍相稱。

**失敗時：** 若當前版號無法解析,設為 `"1.1"` 並加註說明版本歷史缺口。

## 驗證

- [ ] 所有程序步驟含當前可執行代碼或具體指示
- [ ] 無過時版本參考、URL 或棄用工具名遺留
- [ ] 每程序步驟皆有 **Expected:** 與 **On failure:** 塊
- [ ] 常見陷阱段有 3-6 條具體陷阱,含症狀與修復
- [ ] 所有相關技能交叉參考指向存在之技能
- [ ] 緊密相關之技能有雙向交叉參考就位
- [ ] frontmatter 中版號已適當提升
- [ ] 更新後行數仍在 500 以下
- [ ] 變更後 SKILL.md 仍通過 `review-skill-format` 驗證

## 常見陷阱

- **未測試即更新代碼**：未驗證即變更程序步驟中之命令,比留舊命令更糟。不確定時加驗證註解,而非未測試之替換
- **過度擴充陷阱**：加 10+ 條陷阱稀釋此段。保留 3-6 條最具影響者；邊緣情況移至 `references/` 文件（若需）
- **更新中破壞交叉參考**：重命名技能或變其領域時,於整個技能庫中 grep 對舊名之引用。用 `grep -rl "old-name" skills/` 找所有出現
- **忘提升版號**：每次內容更新,不論多小,皆應提升版號。此使消費者得偵測技能何時變化
- **範圍蔓延至重構**：內容更新改進技能*所言*。若發現自己於重構段落或抽取至 `references/`,改用 `refactor-skill-structure` 技能

## 相關技能

- `review-skill-format` — 內容更新前先跑格式驗證,確保基礎結構穩固
- `refactor-skill-structure` — 內容更新將技能推過 500 行時,重構結構以騰空間
- `evolve-skill` — 對超越內容更新之較深變化（如建立進階變體）
- `create-skill` — 加新段落或程序步驟時參照規範格式
- `repair-broken-references` — 用以對整個技能庫之大規模交叉參考修復
