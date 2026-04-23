---
name: derive-theoretical-result
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Derive a theoretical result step-by-step from first principles or established
  theorems, with every step explicitly justified and special cases checked.
  Use when deriving a formula or theorem from first principles, proving a
  mathematical statement by logical deduction, re-deriving a textbook result
  for verification or adaptation, extending a known result to a more general
  setting, or producing a self-contained derivation for a paper or thesis.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: theoretical-science
  complexity: advanced
  language: natural
  tags: theoretical, derivation, proof, first-principles, mathematics, physics
---

# 推導理論結果

由公理或既立定理逐步嚴推理論結果，每步明證，特例驗。

## 用

- 由原理推公式/關係/定理（如由作用量原理推 Euler-Lagrange）
- 由公理以邏輯演繹證數學陳述
- 重推教材結果以驗或改
- 擴已知結果至更廣設（如平時空→曲時空）
- 為論文、論文、技術報告製自足推導

## 入

- **必**：待推目標（方程、不等式、定理陳述、關係）
- **必**：起點（公理、假設、已立結果、Lagrangian/Hamiltonian）
- **可**：偏好技（直、反證、歸納、變分、構造）
- **可**：記號約（匹特教材/合作者）
- **可**：可引中間結果（不必重推）

## 法

### 一：陳起假設+目標

計算前明書推導契約：

1. **公理+假設**：列諸賴假設。物理含對稱群、作用原理、量力假設。數學含公理系+已證引理。
2. **目標結果**：以精確數學記號書。方程書兩側。不等式書方向+等條件。
3. **範圍+限**：陳有效域（如「限非相對論無自旋三維粒子」）。識不含者。
4. **記號宣告**：定諸符號。防歧義，使推導自足。

```markdown
## Derivation Contract
- **Starting from**: [axioms, postulates, or established results]
- **Target**: [precise mathematical statement]
- **Domain of validity**: [restrictions and assumptions]
- **Notation**:
  - [symbol]: [meaning and units]
  - ...
```

**得：** 由何推何之完整無歧陳述，諸記號前置定。

**敗：** 目標模糊或起假設不全→進前澄清。含隱假設之推導不可靠。

### 二：識所需數學機構

察工具並驗其適用：

1. **代數技**：識所需操作（張量代數、交換子代數、矩陣、級數展開）。驗涉結構合先決（如級數收斂、矩陣可逆）。
2. **微積分+分析**：識需常微/偏微、積分（及域）、泛函微、圍道積分、分布論。驗正則條件（可微、可積、解析）。
3. **對稱+群論**：識表示論工具（不可約表示、Clebsch-Gordan 系數、特徵正交、Wigner-Eckart）。
4. **拓撲+幾何**（若適）：識幾何結構（流形、纖維叢、聯絡）+拓撲限（邊界項、繞數、指標定理）。
5. **已知恒等式+引理**：集將引之具體恒等式（如 Jacobi、Bianchi、分部積分、Stokes）。各明列，推導可名引。

```markdown
## Mathematical Toolkit
- **Algebra**: [techniques and prerequisites]
- **Analysis**: [calculus tools and regularity conditions]
- **Symmetry**: [group theory tools]
- **Identities to invoke**: [list with precise statements]
```

**得：** 工具清單含特問題之適用條件驗。

**敗：** 工具有未驗先決（如均勻收斂未明之級數逐項微）→標缺口。證先決或陳為附加假設。

### 三：執行推導含步步證

以各步標籤+證進行：

1. **一步一操作**：每編號步精一代數/邏輯操作。勿合多操作於一步。
2. **證標籤**：各步標證。常標：
   - `[by assumption]` -- 引陳公理/假設
   - `[by definition]` -- 用前宣定義
   - `[by {identity name}]` -- 用名恒等式（如「by Jacobi identity」）
   - `[by Step N]` -- 引此推導前步
   - `[by {theorem name}]` -- 引外定理（步二陳）
3. **中間檢點**：每 5-10 步頓驗：
   - 兩側單位/量綱一致
   - 已知對稱守
   - 表達式變換性質正
4. **分支點**：推導分支（如簡並 vs 非簡並本徵值）→各分支為標子推導，合結。

```markdown
## Derivation

**Step 1.** [Starting expression]
*Justification*: [by assumption / definition]

**Step 2.** [Result of operation on Step 1]
*Justification*: [specific reason]

...

**Checkpoint (after Step N).** Verify:
- Dimensions: [check]
- Symmetry: [check]

...

**Step M.** [Final expression = Target result]
*Justification*: [final operation]  QED
```

**得：** 由起點至目標線性序，邏輯無缺。各步可獨立驗。

**敗：** 某步不承前→推導有缺。補缺中間步或識所需附加假設。勿以「可證」跳過，除非省者為步二所列之熟知恒等式。

### 四：驗極限情+特值

驗推出結果合已知物理/數學：

1. **極限情**：識至少三極限情，結果當減至已知：
   - 較簡已推公式（如相對論→非相對論極限）
   - 平凡情（如置耦合常數為零）
   - 極端參數域（如高溫/低溫極限）

2. **特值**：代特定參數值，答獨立已知（如 n=1 氫原子，d=3 三維結果）。

3. **對稱檢**：驗結果於對稱群下正變換。標量→守不變。矢量→查變換律。

4. **與相關結果一致**：查推出結果與同理論內他已知結果一致（如 Ward 恒等式、求和規則、互易關係）。

```markdown
## Limiting Case Verification
| Case | Condition | Expected Result | Derived Result | Match |
|------|-----------|----------------|----------------|-------|
| [name] | [parameter limit] | [known result] | [substitution] | [Yes/No] |
| ... | ... | ... | ... | ... |
```

**得：** 諸極限情+特值生期望結果。推導內部一致。

**敗：** 極限情失示推導有錯。回溯察何步首生失極限之表達。常因：符號錯、缺 2 或 π 因子、組合係數錯、極限序關鍵之步。

### 五：呈完整推導含記號辭彙

組終成文推導：

1. **敘事結構**：書簡引段陳物理/數學動機、方法、主結果。
2. **推導本體**：呈步三之步，清整可讀。分類入邏輯塊以描述性標題（如「展開作用量至二階」、「施穩相條件」）。
3. **結果框**：終結果於醒目塊明陳，與推導分。
4. **記號辭彙**：編每符號之義、單位（若物理）、首現。
5. **假設彙總**：一處列諸假設，分基本假設與技術假設（如光滑、收斂）。

```markdown
## Final Result

> **Theorem/Result**: [precise statement with equation number]

## Notation Glossary
| Symbol | Meaning | Units | First appears |
|--------|---------|-------|---------------|
| [sym] | [meaning] | [units or dimensionless] | [Step N] |
| ... | ... | ... | ... |

## Assumptions
1. [Fundamental postulate 1]
2. [Technical assumption 1]
3. ...
```

**得：** 自足文件，讀者由始至終可循，除明引恒等式/定理外不需外參。

**敗：** 推導過長（> ~50 步）→分引理。各引理分推，後以引引理組主結果。

## 驗

- [ ] 諸起假設首計算步前明陳
- [ ] 每推導步有標證（無無證跳）
- [ ] 每中間檢點單位+量綱一致
- [ ] 至少三極限情驗並生期望結果
- [ ] 特值匹獨立已知答
- [ ] 結果於陳對稱群下正變換
- [ ] 記號辭彙定諸用符
- [ ] 推導完整：無「可證」延步
- [ ] 有效域與終結果明陳

## 忌

- **隱假設**：假設函數解析、級數收、積分存而不陳。每正則條件為假設須宣。
- **符號錯**：最常機械錯。每步經代入跟蹤符號驗。與量綱分析交叉（符號錯常生量綱不一致）。
- **漏邊界項**：分部積分或用 Stokes 時，邊界項僅特定條件下零。陳何零（如「因場於無窮遠較 1/r 更快衰」）。
- **極限序**：錯序生異結果（如熱力學極限先於零溫極限）。明陳序並證。
- **循環論證**：用待推結果為中間步。於結果為「顯然」熟知式時尤隱。每步須承陳起點，非因熟答。
- **記號衝突**：同符號用於異量（如「E」代能量+電場）。記號辭彙防此，然須推導前書非後。

## 參

- `formulate-quantum-problem`
- `survey-theoretical-literature`
