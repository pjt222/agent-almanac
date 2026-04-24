---
name: evaluate-boolean-expression
locale: wenyan
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

# 評布爾式

化布爾式為最簡：解為範式、造真值表、施代數簡化律、行 K 圖最簡（至六變）、驗簡式與原式等價。

## 用時

- 映邏輯閘前簡布爾式
- 驗二布爾式邏輯等價
- 生最簡和積式（SOP）或積和式（POS）
- 授或復布爾代數恆等與化約
- 備 design-logic-circuit 之入

## 入

- **必要**：布爾式（任常記，如 `A AND (B OR NOT C)`、`A * (B + C')`、`A & (B | ~C)`）
- **必要**：目標式——最簡 SOP、最簡 POS、或二者
- **可選**：K 圖變序之偏
- **可選**：無關條件（未定之 minterm 或 maxterm）
- **可選**：欲對之第二式以驗等價

## 法

### 第一步：解析化範

轉入式為標準內表：

1. **分詞**：識變（單字母或短名）、運符（AND、OR、NOT、XOR、NAND、NOR）、組（括號）
2. **立運符記**：通用一式——`*` 為 AND，`+` 為 OR，`'` 為 NOT（補），`^` 為 XOR
3. **定變數**：列諸獨變。各分位（默 A = MSB, ... Z = LSB，或用所供序）
4. **展為範 SOP**：引 `X = X*(Y + Y')` 填缺變，展為諸 minterm 之和
5. **展為範 POS**：或以 `X = X + Y*Y'` 展為諸 maxterm 之積

```markdown
## Normalized Expression
- **Variables**: [A, B, C, ...]
- **Variable count**: [n]
- **Original expression**: [as given]
- **Canonical SOP (minterms)**: Sigma m(i, j, k, ...)
- **Canonical POS (maxterms)**: Pi M(i, j, k, ...)
- **Don't-care set**: d(i, j, ...) [if any]
```

**得：** 式轉為範 SOP 及/或 POS，諸 minterm/maxterm 明列，無關條件分置。

**敗則：** 若式有語誤或運符優先模糊，請澄。標優先為：NOT（最高）> AND > XOR > OR（最低）。若變逾 6，K 圖步須改 Quine-McCluskey 算法。

### 第二步：造真值表

造全真值表以立函於諸入組合之行：

1. **列行**：生 2^n 諸入組合，按二進計序（000、001、010……）
2. **算出**：各行代入原式算出（0 或 1）
3. **標無關**：若供無關條件，記彼行 `X` 而非 0 或 1
4. **與 minterm 對**：驗出 1 之行合第一步 minterm 列

```markdown
## Truth Table
| A | B | C | F |
|---|---|---|---|
| 0 | 0 | 0 | _ |
| 0 | 0 | 1 | _ |
| ... | ... | ... | ... |
```

**得：** 全真值表 2^n 行，出合範式，無關正標。

**敗則：** 若真值表與範式不合，復察第一步之展。常誤於展中誤用 De Morgan 律——各展步獨驗。

### 第三步：施代數簡化

以布爾代數恆等化約：

1. **恆等與空律**：`A + 0 = A`、`A * 1 = A`、`A + 1 = 1`、`A * 0 = 0`
2. **冪等律**：`A + A = A`、`A * A = A`
3. **補律**：`A + A' = 1`、`A * A' = 0`
4. **吸收律**：`A + A*B = A`、`A * (A + B) = A`
5. **De Morgan 定理**：`(A * B)' = A' + B'`、`(A + B)' = A' * B'`
6. **分配律**：`A * (B + C) = A*B + A*C`、`A + B*C = (A + B) * (A + C)`
7. **共識定理**：`A*B + A'*C + B*C = A*B + A'*C`（B*C 冗）
8. **XOR 簡化**：識 `A*B' + A'*B = A ^ B` 之模
9. **各步記**：每律後書式，引所用之律

```markdown
## Algebraic Simplification Trace
1. Original: [expression]
2. Apply [law name]: [result]
3. Apply [law name]: [result]
...
n. Final algebraic form: [simplified expression]
```

**得：** 逐步化約，各律明引，收斂於簡式。跡供等價可驗之證。

**敗則：** 若無法再簡而非最簡，進第四步（K 圖）。代數法不保全局最小——賴律施之序。

### 第四步：以 K 圖最簡

用 K 圖以求可證之最簡 SOP 或 POS（至六變）：

1. **畫 K 圖**：軸以 Gray 碼排
   - 2 變：2x2 格
   - 3 變：2x4 格
   - 4 變：4x4 格
   - 5 變：二 4x4 格（疊）
   - 6 變：四 4x4 格（疊）
2. **填格**：於相應格置 1（minterm）、0（maxterm）、X（無關）
3. **聚鄰 1**：造 1、2、4、8、16、32 鄰格之矩形組（唯 2 之冪）。組可繞邊。含無關於組若能大之
4. **取主質涵**：各組得一積項。組中常變留，變者去
5. **擇要主質涵**：識唯一主涵覆之 minterm——彼涵為要
6. **覆餘 minterm**：用最少主涵覆未覆者（若需 Petrick 法）
7. **書最簡式**：合所擇主涵為最簡 SOP。最簡 POS 則聚 0

```markdown
## K-map Result
- **Prime implicants**: [list with covered minterms]
- **Essential prime implicants**: [list]
- **Minimal SOP**: [expression]
- **Minimal POS**: [expression, if requested]
- **Literal count**: [number of literals in minimal form]
```

**得：** 最簡 SOP（及/或 POS）字數至少，諸主質涵與要主涵皆記。

**敗則：** 若聚模糊（多最簡覆），列諸等價最簡式。若變逾 6，轉 Quine-McCluskey 表法或 Espresso 啟發，並記法之變。

### 第五步：驗簡式合原

確簡與原邏輯等價：

1. **真值表較**：算簡式於諸 2^n 入組合，較第二步真值表。諸非無關行必合
2. **代數證**（可選）：以第三步律自簡導原（或反之）
3. **要例察**：驗全零入、全一入、及涉巧步之入
4. **記結**：明是否等價，記末最簡式

```markdown
## Equivalence Verification
- **Method**: [truth table comparison / algebraic proof / both]
- **Mismatched rows**: [none, or list row numbers]
- **Verdict**: [Equivalent / Not equivalent]
- **Final minimal expression**: [the verified result]
```

**得：** 簡式於諸非無關入合原。末最簡式明列。

**敗則：** 若有行不合，循第三、四步追誤。常因：K 圖聚不正（非矩或非 2 冪）、忘繞邊鄰、誤聚 0 格。

## 驗

- [ ] 原式諸變皆錄
- [ ] 範 SOP/POS 列正 minterm/maxterm
- [ ] 真值表恰 2^n 行出正
- [ ] 無關條件處正（含於組而不求於覆）
- [ ] 代數諸步各引具體律而可獨驗
- [ ] K 圖二軸皆用 Gray 碼
- [ ] K 圖諸組皆矩且大為 2 冪
- [ ] 要主質涵正識
- [ ] 簡式於諸非無關入合原
- [ ] 末式字數最少

## 陷

- **K 圖鄰誤**：忘 K 圖最左與最右列（及上下行）相鄰。繞邊於求最大組要
- **非 2 冪組**：聚 3 或 5 格。每 K 圖組必含 1、2、4、8、16、32 格。不規之組不對應有效積項
- **略無關**：視無關為 0 而不用其擴組。無關於能簡式時納組，然不可必於覆
- **運符優先誤**：視 AND 與 OR 優先同。標布爾優先為 NOT > AND > OR。誤讀 `A + B * C` 為 `(A + B) * C` 而非 `A + (B * C)`，函全易
- **止於代數簡**：代數法或得局部最小，非全局。必以 K 圖（或 >6 變之 Quine-McCluskey）對以確最簡
- **混 minterm 與 maxterm**：minterm 乃 AND 項（積項），見於 SOP；maxterm 乃 OR 項（和項），見於 POS。三變之 m3 為 A'BC；M3 為 A+B'+C'

## 參

- `design-logic-circuit` — 映最簡式為閘級電路
- `argumentation` — 結構邏輯推理，共形邏基
