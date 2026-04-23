---
name: derive-theoretical-result
locale: wenyan-lite
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

# Derive Theoretical Result

自既定公理、第一原理或已立之定理起，產生嚴謹、逐步之理論結果推導。每一代數或邏輯步皆明載其理，極限情況皆驗，終果以完整之符號詞彙呈。

## 適用時機

- 自第一原理推導公式、關係或定理（例如自作用原理推導歐拉-拉格朗日方程）
- 自公理以邏輯演繹證明數學命題
- 重推教科書結果以驗之或適應其於修改之情境
- 將既知結果推廣至更一般之設定（例如自平直時空推廣至彎曲時空）
- 為論文、學位論文或技術報告產生自足之推導

## 輸入

- **必需**：待推之目標結果（方程、不等式、定理命題或關係）
- **必需**：起點（公理、假設、先前立之結果或 Lagrangian/Hamiltonian）
- **可選**：偏好之證明技巧（直接、反證、歸納、變分、構造）
- **可選**：待遵之符號慣例（若需合特定教科書或合作者之慣例）
- **可選**：可引用而不再推導之已知中間結果

## 步驟

### 步驟一：載明起始假設與目標結果

於任何計算前顯式書寫推導之契約：

1. **公理與假設**：列推導所賴之每一假設。物理中此含對稱群、作用原理或量子力學之假設。數學中此含公理系統與任何前已證之引理。
2. **目標結果**：以精確數學符號載待推之結果。若為方程，寫兩邊。若為不等式，載方向與相等條件。
3. **範圍與限制**：載有效域（如「適於三維中非相對論、無自旋粒子」）。識推導不涵之內容。
4. **符號宣告**：定將現之每一符號。此避歧義並使推導自足。

```markdown
## Derivation Contract
- **Starting from**: [axioms, postulates, or established results]
- **Target**: [precise mathematical statement]
- **Domain of validity**: [restrictions and assumptions]
- **Notation**:
  - [symbol]: [meaning and units]
  - ...
```

**預期：** 對「由何推何」之完整、無歧義之陳述，所有符號前先定義。

**失敗時：** 若目標結果有歧義或起始假設不全，繼續前先明之。藏有假設之推導不可靠。

### 步驟二：識所需之數學機制

審所需之工具並驗其適用性：

1. **代數技巧**：識所需之操作（張量代數、對易子代數、矩陣運算、級數展開）。驗所涉結構滿足先決條件（如級數收斂條件、矩陣運算之可逆性）。
2. **微積分與分析**：識推導是否需常或偏微分、積分（及於何域）、泛函導數、圍道積分或分布理論。驗正則性條件（可微性、可積性、解析性）。
3. **對稱與群論**：識所需之表示理論工具（不可約表示、Clebsch-Gordan 係數、特徵標正交性、Wigner-Eckart 定理）。
4. **拓撲與幾何**（若適用）：識幾何結構（流形、纖維叢、聯絡）與拓撲約束（邊界項、繞數、指標定理）。
5. **已知恆等式與引理**：集待引用之具體恆等式（如 Jacobi 恆等式、Bianchi 恆等式、分部積分、Stokes 定理）。顯式載每一，使推導可按名引之。

```markdown
## Mathematical Toolkit
- **Algebra**: [techniques and prerequisites]
- **Analysis**: [calculus tools and regularity conditions]
- **Symmetry**: [group theory tools]
- **Identities to invoke**: [list with precise statements]
```

**預期：** 數學工具之檢核表，其適用性條件於當前問題已驗。

**失敗時：** 若所需之工具有未驗之先決條件（如一致收斂未知之級數逐項微分），標之為缺口。或證該先決條件，或載之為額外假設。

### 步驟三：執行推導並逐步載理

執行推導，每步標記並載理：

1. **每步一操作**：每編號之步僅行一代數或邏輯操作。勿併多操作入一步。
2. **理據標籤**：標每步以其理據。常見標籤：
   - `[by assumption]` —— 引已載之公理或假設
   - `[by definition]` —— 用先前宣告之定義
   - `[by {identity name}]` —— 應用具名恆等式（如「by Jacobi identity」）
   - `[by Step N]` —— 引此推導中之前一步
   - `[by {theorem name}]` —— 引外部定理（於步驟二載之）
3. **中間檢核點**：每 5-10 步後停而驗：
   - 兩邊之單位/維度一致
   - 已知對稱性得保
   - 該表式有正確之變換性質
4. **分支點**：若推導分支（如對簡併與非簡併特徵值之分情況分析），將每分支視為標記之子推導並合其結果。

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

**預期：** 自起點至目標結果之線性步序，邏輯無缺。每步皆可獨立驗。

**失敗時：** 若某步不繼前一，推導有缺口。或插缺失之中間步，或識所需之額外假設。勿以「可證之」跳步，除非所省之結果為步驟二所列之眾所周知恆等式。

### 步驟四：檢極限情況與特殊值

對所推之果驗之於已知物理或數學：

1. **極限情況**：至少識三極限情況，其中結果應化約為已知者：
   - 更簡、先前推之公式（如相對論結果之非相對論極限）
   - 平凡情況（如設耦合常數為零）
   - 極端參數區域（如高溫或低溫極限）

2. **特殊值**：代入答案可獨立得知之參數之特定值（如氫原子之 n=1、三維結果之 d=3）。

3. **對稱性檢**：驗結果於對稱群下正確變換。若結果應為標量，查其不變。若應為向量，查其變換律。

4. **與相關結果之一致性**：查所推結果與同理論中他已知結果之一致（如 Ward 恆等式、求和規則、互易關係）。

```markdown
## Limiting Case Verification
| Case | Condition | Expected Result | Derived Result | Match |
|------|-----------|----------------|----------------|-------|
| [name] | [parameter limit] | [known result] | [substitution] | [Yes/No] |
| ... | ... | ... | ... | ... |
```

**預期：** 所有極限情況與特殊值生預期結果。推導內部一致。

**失敗時：** 極限情況之敗示推導有誤。逐步追溯，查何步先生失該極限之表式。常因：符號錯、缺 2 或 π 之因子、組合係數錯、或極限順序要緊之步。

### 步驟五：以符號詞彙呈完整推導

組裝終之、精修之推導：

1. **敘事結構**：寫簡介之段，載物理或數學動機、方法與主要結果。
2. **推導主體**：呈步驟三之步，為可讀性潔之。將相關步組為邏輯塊，具描述之標題（如「將作用展開至二階」、「應用穩相條件」）。
3. **結果框**：於醒目塊中載終果，與推導明離。
4. **符號詞彙**：編推導中用之每一符號，具其意、單位（若為物理）、首現位置。
5. **假設總覽**：於一處列所有假設，區基本假設與技術假設（如光滑性、收斂性）。

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

**預期：** 自足之文件，讀者自始至終可循之而不須參外，除顯式引之恆等式與定理。

**失敗時：** 若推導長於單一文件（逾 ~50 步），分為引理。分別推導每引理，後以引引理組主結果。

## 驗證

- [ ] 所有起始假設於第一計算步前顯式載之
- [ ] 每一推導步皆有標記之理據（無無理之跳躍）
- [ ] 單位與維度於每一中間檢核點皆一致
- [ ] 至少三極限情況得檢且生預期結果
- [ ] 特殊值合獨立已知之答案
- [ ] 結果於所述對稱群下正確變換
- [ ] 符號詞彙定推導中用之每一符號
- [ ] 推導完整：無以「可證之」延之步驟
- [ ] 有效域於終果處顯式載之

## 常見陷阱

- **隱藏假設**：設函數解析、級數收斂、積分存而不載之。每一正則性條件皆為假設，須宣之。
- **符號錯**：最常見之機械錯。於每步以代入驗符號。以維度分析交叉檢（符號錯常生維度不一之表式）。
- **漏邊界項**：分部積分或應用 Stokes 定理時，邊界項僅於特定條件下消。載其消之理（如「因場於無窮遠衰於 1/r 之上」）。
- **極限順序**：以錯誤順序取極限可生不同結果（如於零溫極限前取熱力學極限）。顯式載順序並理之。
- **循環推理**：以待推之結果為中間步。此於結果為「顯而易見」之眾所周知公式時尤微妙。每步皆須繼所載之起點，而非繼對答案之熟悉。
- **符號衝突**：同符表不同量（如 'E' 表能量與電場）。符號詞彙防之，然僅於推導前而非後書寫時。

## 相關技能

- `formulate-quantum-problem` —— 自其推導結果前形構量子力學框架
- `survey-theoretical-literature` —— 尋同或相關結果之前推導以資比較
