---
name: evaluate-boolean-expression
locale: wenyan-lite
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

# 評布爾表達式

以真值表、代數律（De Morgan、分配、吸收、冪等、共識）及 Karnaugh 圖（至六變元）將布爾表達式化為最簡。解析入規範記法、構真值表、施代數簡化律、行 K-map 最小化（至六變元）、驗簡化表達式與原邏輯等價。

## 適用時機

- 將布爾表達式映至邏輯閘前簡之
- 驗二布爾表達式邏輯等價
- 生最小積項之和（SOP）或和項之積（POS）
- 教或復習布爾代數之恒等與化約技
- 備 design-logic-circuit 技之輸入

## 輸入

- **必要**：以任何常用記法之布爾表達式（如 `A AND (B OR NOT C)`、`A * (B + C')`、`A & (B | ~C)`）
- **必要**：目標形——最小 SOP、最小 POS，或兼之
- **選擇性**：Karnaugh 圖之變元排序偏好
- **選擇性**：不關心條件（未指之 minterm 或 maxterm）
- **選擇性**：待檢等價之第二表達式

## 步驟

### 步驟一：解析並規範化為規範形

將輸入表達式轉為標準內部表示：

1. **Tokenize**：識變元（單字或短名）、算子（AND、OR、NOT、XOR、NAND、NOR）與分組（括號）。
2. **建算子記法**：全程採一致記法——`*` 為 AND、`+` 為 OR、`'` 為 NOT（補）、`^` 為 XOR。
3. **定變元數**：列所有獨立變元。各予一比特位（預設 A = MSB、... Z = LSB，或用所予排序）。
4. **展為規範 SOP**：藉恒等式 `X = X*(Y + Y')` 引缺變元，展表達式為所有 minterm 之和。
5. **展為規範 POS**：或藉 `X = X + Y*Y'` 展為所有 maxterm 之積。

```markdown
## Normalized Expression
- **Variables**: [A, B, C, ...]
- **Variable count**: [n]
- **Original expression**: [as given]
- **Canonical SOP (minterms)**: Sigma m(i, j, k, ...)
- **Canonical POS (maxterms)**: Pi M(i, j, k, ...)
- **Don't-care set**: d(i, j, ...) [if any]
```

**預期：** 表達式轉為規範 SOP 與/或 POS，所有 minterm/maxterm 明列，不關心條件分離。

**失敗時：** 若表達式含語法錯或算子優先含糊，請求釐清。標準優先為：NOT（最高）> AND > XOR > OR（最低）。若變元數逾 6，記 K-map 步須改用 Quine-McCluskey 法。

### 步驟二：構真值表

建完整真值表以定函數於所有輸入組合之行為：

1. **列行**：以二進制計序生所有 2^n 輸入組合（000、001、010、...）。
2. **算輸出**：對各行，代入值於原表達式並算輸出（0 或 1）。
3. **標不關心**：若予不關心條件，其行以 `X` 標而非 0 或 1。
4. **與 minterm 對檢**：驗產輸出 1 之行合步驟一之 minterm 列。

```markdown
## Truth Table
| A | B | C | F |
|---|---|---|---|
| 0 | 0 | 0 | _ |
| 0 | 0 | 1 | _ |
| ... | ... | ... | ... |
```

**預期：** 完整真值表含 2^n 行，輸出配規範形，不關心已正標。

**失敗時：** 若真值表與規範形異，再檢步驟一之展開。常誤為於規範展開誤用 De Morgan 律——逐展開步獨立驗之。

### 步驟三：施代數簡化

以布爾代數恒等化簡表達式：

1. **恒等與零律**：`A + 0 = A`、`A * 1 = A`、`A + 1 = 1`、`A * 0 = 0`。
2. **冪等律**：`A + A = A`、`A * A = A`。
3. **補律**：`A + A' = 1`、`A * A' = 0`。
4. **吸收律**：`A + A*B = A`、`A * (A + B) = A`。
5. **De Morgan 定理**：`(A * B)' = A' + B'`、`(A + B)' = A' * B'`。
6. **分配律**：`A * (B + C) = A*B + A*C`、`A + B*C = (A + B) * (A + C)`。
7. **共識定理**：`A*B + A'*C + B*C = A*B + A'*C`（B*C 項冗）。
8. **XOR 簡化**：識如 `A*B' + A'*B = A ^ B` 之模式。
9. **記各步**：每施律後書出表達式，引所用律。

```markdown
## Algebraic Simplification Trace
1. Original: [expression]
2. Apply [law name]: [result]
3. Apply [law name]: [result]
...
n. Final algebraic form: [simplified expression]
```

**預期：** 每施律皆引之逐步化約，收於更簡之式。軌跡為等價之可驗證明。

**失敗時：** 若表達式不再簡但似非最小，進步驟四（K-map）。代數法不保必得全局最小——其依律施之序。

### 步驟四：以 Karnaugh 圖最小化

用 K-map 求可證之最小 SOP 或 POS 形（至 6 變元）：

1. **繪 K-map**：於軸以 Gray 碼序排圖。
   - 2 變元：2x2 格
   - 3 變元：2x4 格
   - 4 變元：4x4 格
   - 5 變元：二 4x4 格（疊）
   - 6 變元：四 4x4 格（疊）
2. **填格**：置 1（minterm）、0（maxterm）、X（不關心）於相應格。
3. **群相鄰之 1**：組 1、2、4、8、16 或 32 相鄰格之矩形群（唯 2 之冪）。群可繞邊。若擴群則納不關心。
4. **取質含項**：每群出一積項。群中常變元見於項；變者消。
5. **擇必質含項**：識僅一質含項所覆之 minterm——其質含項為必。
6. **覆餘 minterm**：以最少之額外質含項覆任未覆之 minterm（若需則 Petrick 法）。
7. **書最小式**：合所擇質含項為最小 SOP。最小 POS 則群 0。

```markdown
## K-map Result
- **Prime implicants**: [list with covered minterms]
- **Essential prime implicants**: [list]
- **Minimal SOP**: [expression]
- **Minimal POS**: [expression, if requested]
- **Literal count**: [number of literals in minimal form]
```

**預期：** 具最少文字之最小 SOP（與/或 POS），諸質含項與必質含項皆文檔。

**失敗時：** 若群含糊（多最小覆存），列所有等價最小形。若變元數逾 6，改用 Quine-McCluskey 表法或 Espresso 啟發式並記改法。

### 步驟五：驗簡化式配原式

確簡化與原表達式之邏輯等價：

1. **真值表比**：對所有 2^n 輸入組合算簡化式並與步驟二之真值表比。每非不關心之行必合。
2. **代數證**（選擇性）：自簡化形推原式（或反）用步驟三之律。
3. **抽查關鍵情**：驗全零輸入、全一輸入及涉及詭簡化步之任何輸入。
4. **記結果**：明等價是否成並記最終最小形。

```markdown
## Equivalence Verification
- **Method**: [truth table comparison / algebraic proof / both]
- **Mismatched rows**: [none, or list row numbers]
- **Verdict**: [Equivalent / Not equivalent]
- **Final minimal expression**: [the verified result]
```

**預期：** 簡化式於所有非不關心輸入合原式。最終最小形明述。

**失敗時：** 若有行不配，追錯回步驟三四。常因：K-map 群錯（非矩形或非 2 之冪）、忘繞邊相鄰、或誤群 0 格。

## 驗證

- [ ] 原表達式中所有變元皆計
- [ ] 規範 SOP/POS 列正確之 minterm/maxterm
- [ ] 真值表確有 2^n 行且輸出正
- [ ] 不關心條件已正處（納群中但不作覆之需）
- [ ] 代數各步引具體律且獨立可驗
- [ ] K-map 於二軸用 Gray 碼序
- [ ] K-map 中所有群皆矩形且大小為 2 之冪
- [ ] 必質含項已正識
- [ ] 簡化式於所有非不關心輸入配原式
- [ ] 終形文字數最少

## 常見陷阱

- **K-map 相鄰錯**：忘最左右列（與上下行）於 K-map 中相鄰。此繞邊於尋最大群至要。
- **非 2 之冪之群**：群 3 或 5 格。每 K-map 群必確含 1、2、4、8、16 或 32 格。不規則群不對應有效積項。
- **忽不關心**：視不關心條件為 0 而不用以擴群。若擴群可減式，不關心宜納，但不可於覆需之中。
- **算子優先誤**：設 AND 與 OR 同優先。標準布爾優先為 NOT > AND > OR。誤讀 `A + B * C` 為 `(A + B) * C` 而非 `A + (B * C)` 改整函數。
- **止於代數簡化**：代數法或得局部最小而非全局最小。恒以 K-map（或 >6 變元用 Quine-McCluskey）交叉檢以確最小。
- **混淆 minterm 與 maxterm**：minterm 乃 SOP 中出現之 AND 項（積項）；maxterm 乃 POS 中出現之 OR 項（和項）。3 變元之 minterm m3 為 A'BC；maxterm M3 為 A+B'+C'。

## 相關技能

- `design-logic-circuit` — 將最小式映至閘級電路
- `argumentation` — 共形式邏輯基礎之結構化邏輯推理
