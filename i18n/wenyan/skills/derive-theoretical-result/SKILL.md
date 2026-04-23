---
name: derive-theoretical-result
locale: wenyan
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

# 推理論結果

由公設、第一原理或既立之定理逐步嚴推理論結果。諸代數與邏輯步皆明釋，極限情況皆驗，終附符表。

## 用時

- 由第一原理推公式、關係或定理（如由作用原理推歐拉-拉格朗日方程）
- 由公設以邏輯演繹證數學陳述
- 重推教科書之結果以驗或適之於變境
- 擴既知之結於更普之設（如由平時空至曲時空）
- 為論文、學位、技術報告作自含之推導

## 入

- **必要**：欲推之結（方程、不等、定理陳述或關係）
- **必要**：始點（公設、公理、前立結果或拉格朗日/哈密頓）
- **可選**：偏好之證法（直、反證、歸納、變分、構造）
- **可選**：符慣例（若合特定教科書或同者）
- **可選**：已知中間結果，可引而不必重推

## 法

### 第一步：陳始假設與目標結果

於算前明書推導之契：

1. **公設與公理**：列諸所依之假。於物理含對稱群、作用原理或量子力學之公設。於數學含公設系與前證引理。
2. **目標結果**：以精確數學符陳欲推之結。若為方程，書兩邊。若為不等，陳向與等之條件。
3. **範圍與限**：陳有效域（如「有效於非相對論、無自旋粒子於三維」）。識所不覆者。
4. **符宣**：定諸所現符。防歧義，使推導自含。

```markdown
## Derivation Contract
- **Starting from**: [axioms, postulates, or established results]
- **Target**: [precise mathematical statement]
- **Domain of validity**: [restrictions and assumptions]
- **Notation**:
  - [symbol]: [meaning and units]
  - ...
```

**得：** 全、無歧之陳，明由何推至何，諸符先定。

**敗則：** 若目標結果歧，或始假不全，先明之而後行。隱假之推導不可信。

### 第二步：識所需數學工具

察所需工具並驗其可用：

1. **代數技**：識所需操（張量代數、交換子代數、矩陣運算、級數展）。驗結構合先決（如級數之斂條件、矩陣操之可逆）。
2. **微積與分析**：識推導需常微或偏微、積分（於何域）、泛函導、輪廓積、分佈論。驗正則條件（可微、可積、解析）。
3. **對稱與群論**：識所需表示論之工具（不可約表、克萊布什-高登係、特標正交、維格納-埃卡特定理）。
4. **拓撲與幾何**（若適）：識幾何結構（流形、纖維叢、聯絡）與拓撲約（邊界項、卷繞數、指標定理）。
5. **既知恒等與引理**：集將援之特定恒等（如雅可比、比安基、分部積、斯托克斯）。各明陳使推導可按名引之。

```markdown
## Mathematical Toolkit
- **Algebra**: [techniques and prerequisites]
- **Analysis**: [calculus tools and regularity conditions]
- **Symmetry**: [group theory tools]
- **Identities to invoke**: [list with precise statements]
```

**得：** 工具之單，附該問題之可用條件皆驗。

**敗則：** 若所需工具之先決未驗（如級數未知勻斂而逐項微），標之為缺。或證先決，或陳之為增假。

### 第三步：行推導，逐步釋

行推導，諸步皆標而釋：

1. **每步一操**：每編號步行僅一代數或邏輯操。勿合多操為一。
2. **釋標**：各步附釋。常標：
   - `[by assumption]` —— 援已陳公設或假
   - `[by definition]` —— 用前宣定義
   - `[by {identity name}]` —— 施名恒等（如「by Jacobi identity」）
   - `[by Step N]` —— 引本推導之前步
   - `[by {theorem name}]` —— 援外部定理（已於第二步陳）
3. **中檢點**：每 5-10 步停而驗：
   - 兩邊單位/維一致
   - 已知對稱守
   - 表有正變換性
4. **分歧**：若推導分歧（如退化對非退化本徵值之案析），視各支為標子推，合之。

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

**得：** 由始至目標之線步，邏輯無缺。各步皆獨可驗。

**敗則：** 若一步不由前出，推導有缺。或插缺之中間步，或識所需增假。勿以「可證之」略步，除非所略為第二步已列之熟恒等。

### 第四步：察極限情況與特值

以已知之物理或數學驗所推之結：

1. **極限情況**：識至少三極限情況，於此結宜歸熟知者：
   - 更簡之前推公式（如相對論結之非相對論極限）
   - 平凡情況（如耦合常設零）
   - 極參數境（如高溫或低溫極限）

2. **特值**：代已知之特定參數值（如氫原子 n=1、三維結果 d=3）。

3. **對稱察**：驗結於對稱群正變換。若宜為標量，察之不變。若宜為矢量，察其變換律。

4. **與關結一致**：察所推與同理論中他知結一致（如 Ward 恒等、和律、互易關係）。

```markdown
## Limiting Case Verification
| Case | Condition | Expected Result | Derived Result | Match |
|------|-----------|----------------|----------------|-------|
| [name] | [parameter limit] | [known result] | [substitution] | [Yes/No] |
| ... | ... | ... | ... | ... |
```

**得：** 諸極限與特值皆生期結。推導內部一致。

**敗則：** 敗之極限示推導有誤。查敗由何步首生不過極限之表而溯。常因：錯號、缺 2 或 pi 之因、錯組合係、極限序有關之步。

### 第五步：呈全推導附符表

集終磨之推導：

1. **敘結構**：書短引段陳物理或數學動機、法、主結。
2. **推體**：第三步之步為可讀而整。相關步合為有說之塊（如「展作用至二階」、「施穩相條件」）。
3. **結果框**：於突塊明陳終結，與推導別。
4. **符表**：集推導中諸符，附義、單位（若物理）、首現。
5. **假總**：諸假集一處，辨基公設與技術假（如平滑、斂）。

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

**得：** 自含之文，讀者由始至終可循而不需外引，除明援之恒等與定理。

**敗則：** 若推導過長單文（超 ~50 步），分為引理。各引理獨推，引引理而集主結。

## 驗

- [ ] 諸始假於首算前明陳
- [ ] 各推步有標釋（無無據之躍）
- [ ] 各中檢點單位維一致
- [ ] 至少三極限皆察，生期結
- [ ] 特值合獨知之答
- [ ] 結於陳對稱群正變
- [ ] 符表定諸所用符
- [ ] 推導全：無以「可證之」緩步
- [ ] 有效域與終結明陳

## 陷

- **隱假**：假函數解析、級數斂、積分存而不陳。諸正則條件皆為假，宜宣。
- **號錯**：最常之機械誤。於代換時每步察號。以維析為旁驗（號錯常生維不一致之表）。
- **落邊項**：分部積或施斯托克斯時，邊項唯合特條乃消。陳其所以消（如「場於無窮衰速於 1/r」）。
- **極限序**：錯序取極限或生異結（如先熱力極限後零溫極限）。明陳序而釋。
- **循環推理**：以欲推之結為中步。此於熟公式「看似明」尤隱。每步皆由所陳始點出，非由熟答。
- **符撞**：同符用於異量（如 'E' 為能與電場）。符表可防之，唯先書於推前乃然。

## Related Skills

- `formulate-quantum-problem` -- 由量子力學框架推結前先構之
- `survey-theoretical-literature` -- 尋同或關結之前推以為比
