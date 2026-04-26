---
name: refactor-skill-structure
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Refactor an over-long or poorly structured SKILL.md by extracting
  examples to references/EXAMPLES.md, splitting compound procedures,
  and reorganizing sections for progressive disclosure. Use when a skill
  exceeds the 500-line CI limit, when code blocks dominate the skill body,
  when a procedure step contains multiple unrelated operations, or after a
  content update pushed the skill over the line limit.
license: MIT
allowed-tools: Read Write Edit Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: review
  complexity: advanced
  language: multi
  tags: review, skills, refactoring, structure, progressive-disclosure
---

# 重構技能結構

重構已逾 500 行限或結構有疾之 SKILL.md。本技能將延伸之代碼例抽出至 `references/EXAMPLES.md`，將複合程序拆分為聚焦之子程序，加交互引用以漸進揭示，並驗證重組後技能仍完整有效。

## 適用時機

- 技能逾 CI 所執之 500 行限
- 一程序步驟含多個不相關操作，宜分為各步
- 逾 15 行之代碼塊主導 SKILL.md 而可抽出
- 技能累積臨時段落，破壞標準六段結構
- 內容更新後技能逾行限
- 技能評審標出超越內容品質之結構問題

## 輸入

- **必要**：擬重構之 SKILL.md 文件路徑
- **選擇性**：目標行數（預設：瞄準 500 行限之 80%，即約 400 行）
- **選擇性**：是否建立 `references/EXAMPLES.md`（預設：有可抽內容則是）
- **選擇性**：是否拆為多技能（預設：否，宜先抽出）

## 步驟

### 步驟一：度量當前行數並識別膨脹之源

讀取技能並按段建立行預算，以識別膨脹所在。

```bash
# Total line count
wc -l < skills/<skill-name>/SKILL.md

# Line count per section (approximate)
grep -n "^## \|^### " skills/<skill-name>/SKILL.md
```

膨脹之源分類：
- **可抽**：逾 15 行之代碼塊、完整配置例、多變體例
- **可拆**：作 2 種以上不相關操作之複合程序步
- **可削**：冗解、過長之上下文句
- **結構性**：不合標準六段結構之臨時段

**預期：** 行預算顯示哪些段過大及何種膨脹類別適用。最大段乃首要重構標的。

**失敗時：** 若技能未逾 500 行且無顯結構問題，本技能恐不需。先驗重構之請求是否合理。

### 步驟二：抽代碼塊至 references/EXAMPLES.md

將逾 15 行之代碼塊移至 `references/EXAMPLES.md`，於主 SKILL.md 留簡短行內片段（3-10 行）。

1. 建 references 目錄：
   ```bash
   mkdir -p skills/<skill-name>/references/
   ```

2. 對每可抽之代碼塊：
   - 將完整代碼塊複製至 `references/EXAMPLES.md`，置於描述性標題之下
   - 於 SKILL.md 中以 3-5 行簡短片段取代之
   - 加交互引用：`See [EXAMPLES.md](references/EXAMPLES.md#heading) for the complete configuration.`

3. 以清晰標題組織 `references/EXAMPLES.md`：
   ```markdown
   # Examples

   ## Example 1: Full Configuration

   Complete configuration file for [context]:

   \```yaml
   # ... full config here ...
   \```

   ## Example 2: Multi-Variant Setup

   ### Variant A: Development
   \```yaml
   # ... dev config ...
   \```

   ### Variant B: Production
   \```yaml
   # ... prod config ...
   \```
   ```

**預期：** 所有逾 15 行之代碼塊已抽出。主 SKILL.md 留簡短行內片段以資易讀。交互引用連至所抽之內容。`references/EXAMPLES.md` 組織良好，標題具描述性。

**失敗時：** 若抽代碼塊不足以充分減行（仍逾 500），續至步驟三作程序拆分。若技能代碼塊極少（如自然語言類技能），則改聚焦於步驟三、四。

### 步驟三：拆複合程序為聚焦之步驟

識別作多種不相關操作之程序步並拆之。

複合步之徵兆：
- 步題含「與」字（如「配置資料庫並設置快取」）
- 步有多個 Expected/On failure 塊（或應有）
- 步逾 30 行
- 步可被略過或其子部分可以不同順序進行

對每複合步：
1. 識其中之分離操作
2. 為每操作建一新 `### Step N:`
3. 為後續步驟重新編號
4. 確保每新步有自己之 Expected 與 On failure 塊
5. 於新步間加過渡上下文

**預期：** 每程序步只作一事。無步逾 30 行。步數可增但每步可獨立驗證。

**失敗時：** 若拆步過細（如總計逾 20 步），考慮將相關微步歸於單一步下之編號子步。佳之區間為 5-12 程序步。

### 步驟四：自 SKILL.md 加交互引用至所抽內容

確保抽出後主 SKILL.md 仍易讀且可發現。

對每抽出：
1. SKILL.md 中之行內片段對常見情形應自足
2. 交互引用應說明附加內容為何
3. 使用相對路徑：`[EXAMPLES.md](references/EXAMPLES.md#section-anchor)`

交互引用模式：
- 簡短代碼片段之後：`See [EXAMPLES.md](references/EXAMPLES.md#full-configuration) for the complete configuration with all options.`
- 多變體例：`See [EXAMPLES.md](references/EXAMPLES.md#variants) for development, staging, and production variants.`
- 延伸排錯：`See [EXAMPLES.md](references/EXAMPLES.md#troubleshooting) for additional error scenarios.`

**預期：** 每抽出皆有對應之交互引用。讀者可循主 SKILL.md 處理常見情形，而鑽入 references 看細節。

**失敗時：** 若交互引用使行文不順，將多引用合併為程序步末之單一注：`For extended examples including [X], [Y], and [Z], see [EXAMPLES.md](references/EXAMPLES.md).`

### 步驟五：重構後驗行數

對 SKILL.md 重新度量行數。

```bash
# Check main SKILL.md
lines=$(wc -l < skills/<skill-name>/SKILL.md)
[ "$lines" -le 500 ] && echo "SKILL.md: OK ($lines lines)" || echo "SKILL.md: STILL OVER ($lines lines)"

# Check references file if created
if [ -f skills/<skill-name>/references/EXAMPLES.md ]; then
  ref_lines=$(wc -l < skills/<skill-name>/references/EXAMPLES.md)
  echo "EXAMPLES.md: $ref_lines lines"
fi

# Total content
echo "Total content: $((lines + ${ref_lines:-0})) lines"
```

**預期：** SKILL.md 已逾 500 行下。理想於 400 行下，留將來增長空間。`references/EXAMPLES.md` 無行限。

**失敗時：** 若抽出與拆分後仍逾 500 行，考慮是否應將該技能分解為兩個獨立技能。涵蓋過廣乃範圍蠕之徵。用 `create-skill` 寫第二技能並更新二者之相關技能交互引用。

### 步驟六：驗所有段落仍存

重構之後，驗該技能仍具所有必需段且 frontmatter 完整。

跑 `review-skill-format` 清單：
1. YAML frontmatter 解析正確
2. 六必需段皆存（When to Use、Inputs、Procedure、Validation、Common Pitfalls、Related Skills）
3. 每程序步皆有 Expected 與 On failure 塊
4. 無孤立交互引用（所有連結可達）

```bash
# Quick section check
for section in "## When to Use" "## Inputs" "## Procedure" "## Common Pitfalls" "## Related Skills"; do
  grep -q "$section" skills/<skill-name>/SKILL.md && echo "$section: OK" || echo "$section: MISSING"
done
grep -qE "## Validation( Checklist)?" skills/<skill-name>/SKILL.md && echo "Validation: OK" || echo "Validation: MISSING"
```

**預期：** 所有段皆存。抽出時無內容意外被刪。SKILL.md 中之交互引用解析至 EXAMPLES.md 中之實際標題。

**失敗時：** 若有段意外被移除，自 git 歷史復之：`git diff skills/<skill-name>/SKILL.md` 以見何變。若交互引用斷，驗 EXAMPLES.md 之標題錨點與 SKILL.md 之連結相符（GitHub 風格 markdown 錨點規則：小寫、空格化連字符、剝點符）。

## 驗證

- [ ] SKILL.md 行數 500 或更少
- [ ] SKILL.md 中所有代碼塊 15 行或更少
- [ ] 抽出之內容於 `references/EXAMPLES.md` 中，附描述性標題
- [ ] 每抽出皆於主 SKILL.md 有交互引用
- [ ] 無複合程序步留存（每步只作一事）
- [ ] 重構後六必需段皆存
- [ ] 每程序步皆有 **Expected:** 與 **On failure:** 塊
- [ ] YAML frontmatter 完整可解析
- [ ] 交互引用連結解析至 EXAMPLES.md 中之實際標題
- [ ] `review-skill-format` 之驗證於重構後技能上通過

## 常見陷阱

- **抽得太狠**：將所有代碼移至 references 使主 SKILL.md 不易讀。常見情形宜留 3-10 行片段於行內。僅抽逾 15 行或多變體之塊
- **錨連結斷**：GitHub 風格 markdown 錨點於某些渲染器中區分大小寫。EXAMPLES.md 用小寫標題並於交互引用中精確對應。以 `grep -c "heading-text" references/EXAMPLES.md` 測之
- **拆分時失 Expected/On failure**：拆複合步時，確保每新步有自己之 Expected 與 On failure 塊。拆後易留某步無此二塊
- **創過多細步**：拆分宜得 5-12 程序步。若得 15 步以上則拆得過狠。將相關微步合回邏輯組
- **遺忘更新 references/EXAMPLES.md 標題**：若改 EXAMPLES.md 中之段名，SKILL.md 中所有交互引用錨皆須更新。grep 舊錨名以捉所有引用

## 相關技能

- `review-skill-format` — 重構之後跑格式驗證，確認技能仍合規
- `update-skill-content` — 內容更新每每為結構重構之觸發，當其推技能逾行限時
- `create-skill` — 決定如何組織抽出內容時，參照標準結構
- `evolve-skill` — 須將一技能拆為二時，用 evolve 建衍生
