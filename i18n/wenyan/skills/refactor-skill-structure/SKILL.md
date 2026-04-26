---
name: refactor-skill-structure
locale: wenyan
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

# 重構技構

重構過長或構不善之 SKILL.md：提例至 `references/EXAMPLES.md`、分複合之程、重組諸段以漸開示。本技提長碼例至 `references/EXAMPLES.md`，分複合之程為專注之子程，加交引以行漸開示，重構後驗其全且效。

## 用時

- 技逾 CI 之 500 行限乃用
- 一程步含數無關之操作宜分為步乃用
- 逾 15 行之碼塊主於 SKILL.md 而可提乃用
- 技累積臨時段，破六段標構乃用
- 內更後使技逾行限乃用
- 技審標出構患逾內質乃用

## 入

- **必要**：欲重構之 SKILL.md 之路
- **可選**：目行數（默：取 500 行限之八成，約 400 行）
- **可選**：是否立 `references/EXAMPLES.md`（默：然，若有可提之內）
- **可選**：是否分為數技（默：否，先提為宜）

## 法

### 第一步：量當前行數而識膨之源

讀技而立段段之行算以識膨之所。

```bash
# Total line count
wc -l < skills/<skill-name>/SKILL.md

# Line count per section (approximate)
grep -n "^## \|^### " skills/<skill-name>/SKILL.md
```

分膨之源：

- **可提**：碼塊 >15 行、全配置例、多異例
- **可分**：複合步行 2+ 無關操作
- **可削**：冗釋、過繁之境句
- **構**：非屬六段標構之臨時段

得：行算示何段過大、何膨類屬之。最大段乃首要重構之的。

敗則：若技未及 500 行且無顯構患，此技或不需。先驗重構之請有理。

### 第二步：提碼塊至 references/EXAMPLES.md

移逾 15 行之碼塊至 `references/EXAMPLES.md`，主 SKILL.md 留簡內片（3-10 行）。

1. 立參之所：
   ```bash
   mkdir -p skills/<skill-name>/references/
   ```

2. 各可提之碼塊：
   - 全碼塊複至 `references/EXAMPLES.md` 於描述之首
   - 主 SKILL.md 之碼塊代以簡 3-5 行片
   - 加交引：`See [EXAMPLES.md](references/EXAMPLES.md#heading) for the complete configuration.`

3. 構 `references/EXAMPLES.md` 以明首：
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

得：所有 >15 行之碼塊已提。主 SKILL.md 留簡內片以宜讀。交引繫於提之內。`references/EXAMPLES.md` 良組以描述之首。

敗則：若提碼塊不足以減行（仍逾 500），進第三步分程。若技少碼塊（如自然語之技），專注於三、四步。

### 第三步：分複合程為專步

識行多無關操作之程步而分之。

複合步之兆：

- 步首含「與」（如「設庫與立緩」）
- 步有多 Expected/On failure 段（或宜有）
- 步逾 30 行
- 步可略或子部可異序行

各複合步：

1. 識步內之異操作
2. 各操作立新 `### Step N:`
3. 後步重編號
4. 確各新步有己之 Expected 與 On failure 段
5. 加新步間之過境

得：每程步行一事。無步逾 30 行。步數或增而每步可獨驗。

敗則：若分步致過細（如 20+ 總步），考歸相關微步於單步下以子步編號。佳處乃 5-12 程步。

### 第四步：自 SKILL.md 加交引至所提內

確主 SKILL.md 提後仍可讀可察。

各提：

1. SKILL.md 之內片宜常境自足
2. 交引宜釋附加之內為何
3. 用相對之路：`[EXAMPLES.md](references/EXAMPLES.md#section-anchor)`

交引之形：

- 簡碼片後：`See [EXAMPLES.md](references/EXAMPLES.md#full-configuration) for the complete configuration with all options.`
- 多異例：`See [EXAMPLES.md](references/EXAMPLES.md#variants) for development, staging, and production variants.`
- 廣排錯：`See [EXAMPLES.md](references/EXAMPLES.md#troubleshooting) for additional error scenarios.`

得：每提皆有對應交引。讀者可循主 SKILL.md 處常境而探參以詳。

敗則：若交引令文流不順，合多引為程步末之單注：`For extended examples including [X], [Y], and [Z], see [EXAMPLES.md](references/EXAMPLES.md).`

### 第五步：重構後驗行數

更後再量 SKILL.md 之行數。

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

得：SKILL.md 未及 500 行。理應未及 400 行以留來日之長。`references/EXAMPLES.md` 無行限。

敗則：若提分後仍逾 500 行，考分技為二。技涉過廣乃範漂之兆。用 `create-skill` 立第二技而於二者之相關技交引相更。

### 第六步：驗諸段仍存

重構後，驗技仍有諸需段且前文未損。

行 `review-skill-format` 之單：

1. YAML 前文可正析
2. 六需段皆存（用時、入、法、驗、陷、參）
3. 各程步有 Expected 與 On failure 段
4. 無孤交引（諸鏈皆解）

```bash
# Quick section check
for section in "## When to Use" "## Inputs" "## Procedure" "## Common Pitfalls" "## Related Skills"; do
  grep -q "$section" skills/<skill-name>/SKILL.md && echo "$section: OK" || echo "$section: MISSING"
done
grep -qE "## Validation( Checklist)?" skills/<skill-name>/SKILL.md && echo "Validation: OK" || echo "Validation: MISSING"
```

得：諸段皆存。提時無內誤刪。SKILL.md 之交引解至 EXAMPLES.md 之實首。

敗則：若段誤除，自 git 史復之：`git diff skills/<skill-name>/SKILL.md` 以見所變。若交引斷，驗 EXAMPLES.md 之首錨合 SKILL.md 之鏈（GitHub 之 markdown 錨則：小字、空作短橫、剝標點）。

## 驗

- [ ] SKILL.md 行數 500 或以下
- [ ] SKILL.md 之碼塊皆 15 行或以下
- [ ] 所提之內於 `references/EXAMPLES.md` 附描述之首
- [ ] 每提於主 SKILL.md 有交引
- [ ] 無複合程步留（每步行一事）
- [ ] 重構後六需段皆存
- [ ] 各程步有 **Expected:** 與 **On failure:** 段
- [ ] YAML 前文未損可析
- [ ] 交引鏈解至 EXAMPLES.md 之實首
- [ ] `review-skill-format` 之驗於重構後過

## 陷

- **過提**：移全碼至參致主 SKILL.md 不可讀。常境留 3-10 行內片。獨提 >15 行或多異之塊
- **斷錨鏈**：GitHub 之 markdown 錨於某些渲染為大小敏。EXAMPLES.md 用小字之首，交引精合之。試以 `grep -c "heading-text" references/EXAMPLES.md`
- **分時失 Expected/On failure**：分複合步時，確各新步得己之 Expected 與 On failure 段。分後易留一步無此段
- **立過微步**：分宜得 5-12 程步。若得 15+，分過烈。歸相關微步為邏輯之群
- **忘更 references/EXAMPLES.md 之首**：若改 EXAMPLES.md 之段名，SKILL.md 之諸交引錨皆須更。grep 舊錨名以捕諸引

## 參

- `review-skill-format` — 重構後行格驗以確技仍合
- `update-skill-content` — 內更常為構重構之引，使技逾行限
- `create-skill` — 決如何組所提之內時參其標構
- `evolve-skill` — 若技須分為二，用化以立其衍
