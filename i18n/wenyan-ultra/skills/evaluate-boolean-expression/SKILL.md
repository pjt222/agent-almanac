---
name: evaluate-boolean-expression
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Evaluate and simplify Boolean expressions using truth tables, algebraic laws
  (De Morgan, distributive, absorption, idempotent, consensus), and Karnaugh maps
  for up to six variables. Use when you need to reduce a Boolean expression to its
  minimal sum-of-products or product-of-sums form, verify logical equivalence
  between two expressions, or prepare a minimized function for gate-level
  implementation.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: digital-logic
  complexity: basic
  language: multi
  tags: digital-logic, boolean-algebra, truth-tables, karnaugh-maps, simplification
---

# 估布爾式

減布爾式至最簡：解析入正規、造真值表、施代數律、行 Karnaugh 圖簡（至 6 變），驗簡式邏等於原。

## 用

- 映布爾式於邏閘前之簡
- 驗兩布爾式邏等
- 生最簡 SOP 或 POS
- 教或閱布爾代數恒等與減技
- 備入予 design-logic-circuit 技

## 入

- **必**：常記之布爾式（如 `A AND (B OR NOT C)`、`A * (B + C')`、`A & (B | ~C)`）
- **必**：標式——最簡 SOP、最簡 POS、或兩者
- **可**：K 圖之變序偏
- **可**：無關條件（未定 minterm 或 maxterm）
- **可**：較等之次式

## 行

### 一：解析歸正規

轉入式為標內表：

1. **分詞**：識變（單字或短名）、算符（AND、OR、NOT、XOR、NAND、NOR）、括
2. **定記**：全用一致——`*` 為 AND、`+` 為 OR、`'` 為 NOT、`^` 為 XOR
3. **計變數**：列諸獨變。各賦位（默 A = MSB... Z = LSB，或用予序）
4. **展正規 SOP**：引 `X = X*(Y + Y')` 以補缺變，展為諸 minterm 之和
5. **展正規 POS**：或以 `X = X + Y*Y'` 展為諸 maxterm 之積

```markdown
## Normalized Expression
- **Variables**: [A, B, C, ...]
- **Variable count**: [n]
- **Original expression**: [as given]
- **Canonical SOP (minterms)**: Sigma m(i, j, k, ...)
- **Canonical POS (maxterms)**: Pi M(i, j, k, ...)
- **Don't-care set**: d(i, j, ...) [if any]
```

得：式轉正規 SOP/POS，諸 minterm/maxterm 明列，無關條件分。

敗：式有語法誤或算符先級歧→請明。標先級：NOT（最高）> AND > XOR > OR。變 >6→K 圖步須改用 Quine-McCluskey。

### 二：造真值表

建全真值表以定函於諸入合之行：

1. **列行**：生諸 2^n 入合，按二進計序（000、001、010...）
2. **計出**：各行代值入原式並算出（0 或 1）
3. **標無關**：若予無關條件→彼行標 `X` 代 0 或 1
4. **交察與 minterm**：驗出 1 之行匹一步 minterm 列

```markdown
## Truth Table
| A | B | C | F |
|---|---|---|---|
| 0 | 0 | 0 | _ |
| 0 | 0 | 1 | _ |
| ... | ... | ... | ... |
```

得：全真值表 2^n 行，出匹正規式，無關正標。

敗：真值表與正規式不符→重察一步之展。常誤為展中誤施 De Morgan 律——各展獨驗。

### 三：施代數簡

以布爾代數恒等減之：

1. **恒等與零律**：`A + 0 = A`、`A * 1 = A`、`A + 1 = 1`、`A * 0 = 0`
2. **冪等律**：`A + A = A`、`A * A = A`
3. **補律**：`A + A' = 1`、`A * A' = 0`
4. **吸收律**：`A + A*B = A`、`A * (A + B) = A`
5. **De Morgan 律**：`(A * B)' = A' + B'`、`(A + B)' = A' * B'`
6. **分配律**：`A * (B + C) = A*B + A*C`、`A + B*C = (A + B) * (A + C)`
7. **共識律**：`A*B + A'*C + B*C = A*B + A'*C`（B*C 項冗）
8. **XOR 簡**：識 `A*B' + A'*B = A ^ B` 之模
9. **錄每步**：每律後書式，注所用律

```markdown
## Algebraic Simplification Trace
1. Original: [expression]
2. Apply [law name]: [result]
3. Apply [law name]: [result]
...
n. Final algebraic form: [simplified expression]
```

得：逐步減，各律有注，漸向簡式。踪為等之可驗證明。

敗：式不再簡而似非最簡→進四步（K 圖）。代數法不保全局最小——依律施序。

### 四：以 Karnaugh 圖最小

用 K 圖尋可證之最簡 SOP 或 POS（至 6 變）：

1. **繪 K 圖**：軸以 Gray 碼排
   - 2 變：2x2 格
   - 3 變：2x4 格
   - 4 變：4x4 格
   - 5 變：雙 4x4（疊）
   - 6 變：四 4x4（疊）
2. **填格**：置 1（minterm）、0（maxterm）、X（無關）於相格
3. **群鄰 1**：成 1、2、4、8、16、32 之矩形群（僅 2 冪）。群可繞邊。含無關若擴群
4. **取素蘊**：各群產一積項。群中常變入項；變者消
5. **選本素蘊**：識僅一素蘊所覆之 minterm——彼素蘊為本
6. **覆餘 minterm**：用最少增素蘊覆未覆之 minterm（須則 Petrick 法）
7. **書最簡式**：合選素蘊為最簡 SOP。最簡 POS 則群 0 代之

```markdown
## K-map Result
- **Prime implicants**: [list with covered minterms]
- **Essential prime implicants**: [list]
- **Minimal SOP**: [expression]
- **Minimal POS**: [expression, if requested]
- **Literal count**: [number of literals in minimal form]
```

得：最簡 SOP（且/或 POS），字最少，諸素蘊與本素蘊已錄。

敗：群歧（多最簡覆存）→列諸等最簡式。變 >6→換 Quine-McCluskey 表法或 Espresso 啟發並記法變。

### 五：驗簡式匹原

確簡式與原式邏等：

1. **真值表較**：計簡式於諸 2^n 入並較二步真值表。諸非無關行須匹
2. **代數證**（可）：以三步律從簡式推原（或反）
3. **察要況**：驗全零入、全一入、及任關於巧簡步之入
4. **錄果**：述等否並記末最簡式

```markdown
## Equivalence Verification
- **Method**: [truth table comparison / algebraic proof / both]
- **Mismatched rows**: [none, or list row numbers]
- **Verdict**: [Equivalent / Not equivalent]
- **Final minimal expression**: [the verified result]
```

得：簡式於諸非無關入匹原。末最簡式明述。

敗：任行不匹→回 3-4 步查誤。常因：K 圖群誤（非矩或非 2 冪）、忘繞鄰、誤群 0 格。

## 驗

- [ ] 原式諸變皆計
- [ ] 正規 SOP/POS 列正 minterm/maxterm
- [ ] 真值表正 2^n 行出正
- [ ] 無關條件正處（入群而不必覆）
- [ ] 代數步各注特律並可獨驗
- [ ] K 圖兩軸用 Gray 序
- [ ] K 圖諸群皆矩且為 2 冪
- [ ] 本素蘊正識
- [ ] 簡式於諸非無關入匹原
- [ ] 末式字最少

## 忌

- **K 圖鄰誤**：忘最左右列（與上下行）於 K 圖中鄰。繞鄰於尋最大群必需
- **非 2 冪群**：3 或 5 格相群。諸 K 圖群須恰 1、2、4、8、16、32 格。不規群不對應有效積項
- **忽無關**：視無關為 0 而非用之擴群。無關於能減式時入群，然覆不必之
- **算符先級誤**：設 AND 與 OR 先級同。標布爾先級：NOT > AND > OR。誤讀 `A + B * C` 為 `(A + B) * C` 而非 `A + (B * C)` 全改函
- **止於代數簡**：代數法或尋局最小非全最小。必以 K 圖（>6 變用 Quine-McCluskey）交察確最
- **混 minterm 與 maxterm**：minterm 為 SOP 中之 AND 項（積項）；maxterm 為 POS 中之 OR 項（和項）。3 變之 minterm m3 為 A'BC；maxterm M3 為 A+B'+C'

## 參

- `design-logic-circuit` — 映最簡式於閘級電路
- `argumentation` — 結構邏推，共形邏基
