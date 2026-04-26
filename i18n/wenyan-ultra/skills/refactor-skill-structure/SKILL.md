---
name: refactor-skill-structure
locale: wenyan-ultra
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

# 重構技

過長或結構亂之 SKILL.md 重構：移例至 `references/EXAMPLES.md`、分複合步、序章以漸示。

## 用

- 技超 CI 五百行限
- 一步含多無關業
- 碼塊過十五行據主體可移
- 技積臨時段、破六段標構
- 容更後過行限
- 技審報結構患非容質患

## 入

- **必**：欲重構 SKILL.md 之路
- **可**：目標行數（默八成五百限、約四百）
- **可**：建 `references/EXAMPLES.md` 乎（默是、若有可移容）
- **可**：分多技乎（默否、先移）

## 行

### 一：量行、識膨源

讀技、按段建行算以識膨。

```bash
# Total line count
wc -l < skills/<skill-name>/SKILL.md

# Line count per section (approximate)
grep -n "^## \|^### " skills/<skill-name>/SKILL.md
```

膨類：
- **可移**：碼塊 >15 行、全配例、多異例
- **可分**：複合步（行二+無關業）
- **可裁**：餘述、過繁脈句
- **構**：臨段非六標

得：行算示何段過大、何膨類用之。最大段為主重構標。

敗：技未 500 行、無顯構患→此技或不需。先驗重構請有據再行。

### 二：碼塊移至 references/EXAMPLES.md

塊 >15 行→移至 `references/EXAMPLES.md`、留簡內聯片（3-10 行）於主 SKILL.md。

1. 建 references 錄：
   ```bash
   mkdir -p skills/<skill-name>/references/
   ```

2. 各可移塊：
   - 全塊複至 `references/EXAMPLES.md` 描述標下
   - 主 SKILL.md 之塊代以簡 3-5 行片
   - 加交引：`See [EXAMPLES.md](references/EXAMPLES.md#heading) for the complete configuration.`

3. `references/EXAMPLES.md` 構以明標：
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

得：諸 >15 行塊已移。主 SKILL.md 留簡內聯片以易讀。交引指所移容。`references/EXAMPLES.md` 構良、有描述標。

敗：移碼塊不足減行（仍 >500）→步三分步。技少碼塊（如自然語技）→專注步三四。

### 三：複合步分

識行多無關業之步、分之。

複合號：
- 步題含「and」（如「設庫並設快取」）
- 步有多 Expected/On failure 塊（或應有）
- 步 >30 行
- 步可略或子部可異序

各複合步：
1. 識內諸異業
2. 各業建新 `### Step N:`
3. 後諸步重編
4. 各新步有獨 Expected 與 On failure 塊
5. 加新步間過脈

得：各步行一事。無步 >30 行。步數或增、各步可獨驗。

敗：分步致過細（如總 20+）→宜聚相關微步於一步含編號子步。甜點 5-12 步。

### 四：自 SKILL.md 加交引至所移容

確主 SKILL.md 移後仍易讀可發。

各移：
1. 主 SKILL.md 內聯片於常情自足
2. 交引述更多容可得
3. 用相對路：`[EXAMPLES.md](references/EXAMPLES.md#section-anchor)`

交引模：
- 簡片後：`See [EXAMPLES.md](references/EXAMPLES.md#full-configuration) for the complete configuration with all options.`
- 多異例：`See [EXAMPLES.md](references/EXAMPLES.md#variants) for development, staging, and production variants.`
- 延排錯：`See [EXAMPLES.md](references/EXAMPLES.md#troubleshooting) for additional error scenarios.`

得：各移有應交引。讀者可循主 SKILL.md 應常情、入 references 求詳。

敗：交引致文流尷→聚多引於步末一註：`For extended examples including [X], [Y], and [Z], see [EXAMPLES.md](references/EXAMPLES.md).`

### 五：重構後驗行

諸變後重量 SKILL.md 行。

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

得：SKILL.md <500 行。理 <400 留後增地。`references/EXAMPLES.md` 無行限。

敗：移分後仍 >500→宜分為二技。一技覆過廣為範蔓號。用 `create-skill` 建第二技、二者皆更 Related Skills 交引。

### 六：驗諸段仍存

重構後、驗技仍有諸必段、首端完。

行 `review-skill-format` 單：
1. YAML 首端正析
2. 六必段皆存（When to Use、Inputs、Procedure、Validation、Common Pitfalls、Related Skills）
3. 各步有 Expected 與 On failure 塊
4. 無孤交引（諸鏈解）

```bash
# Quick section check
for section in "## When to Use" "## Inputs" "## Procedure" "## Common Pitfalls" "## Related Skills"; do
  grep -q "$section" skills/<skill-name>/SKILL.md && echo "$section: OK" || echo "$section: MISSING"
done
grep -qE "## Validation( Checklist)?" skills/<skill-name>/SKILL.md && echo "Validation: OK" || echo "Validation: MISSING"
```

得：諸段皆存。移時無容誤刪。SKILL.md 之交引解至 EXAMPLES.md 真標。

敗：段誤刪→自 git 史復：`git diff skills/<skill-name>/SKILL.md` 視變。交引斷→驗 EXAMPLES.md 標錨合 SKILL.md 鏈（GitHub 風 markdown 錨律：小寫、空為連、去標點）。

## 驗

- [ ] SKILL.md 行 ≤ 500
- [ ] 諸碼塊 ≤ 15 行
- [ ] 移容於 `references/EXAMPLES.md` 含描述標
- [ ] 各移於主 SKILL.md 有交引
- [ ] 無複合步餘（各步行一事）
- [ ] 重構後六必段皆存
- [ ] 各步有 **Expected:** 與 **On failure:** 塊
- [ ] YAML 首端完可析
- [ ] 交引鏈解至 EXAMPLES.md 真標
- [ ] `review-skill-format` 過於重構後之技

## 忌

- **過移**：諸碼皆移使主不可讀。常情留 3-10 行片內聯。唯 >15 行或多異變者乃移
- **錨鏈斷**：GitHub 風 markdown 錨於某渲染區大小寫敏。EXAMPLES.md 用小寫標、交引中正合。`grep -c "heading-text" references/EXAMPLES.md` 測
- **分時失 Expected/On failure**：分複合步時、各新步必有自之 Expected 與 On failure 塊。分後易遺
- **過細**：分應生 5-12 步。若 15+ →分過。聚微步回邏輯組
- **忘更 EXAMPLES.md 標**：EXAMPLES.md 改名段、SKILL.md 諸交引錨皆需更。grep 舊錨名以捕諸引

## 參

- `review-skill-format` — 重構後行格驗確技仍合
- `update-skill-content` — 容更常為構重構之觸、其推技過行限
- `create-skill` — 決如何組移容時參標構
- `evolve-skill` — 技需分為二技時、用演建衍
