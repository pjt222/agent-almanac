---
name: formulate-quantum-problem
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Formulate a quantum mechanics or quantum chemistry problem with proper
  mathematical framework including Hilbert space, operators, boundary conditions,
  and approximation method selection. Use when setting up a quantum mechanics
  problem for analytic or numerical solution, formulating a quantum chemistry
  calculation, translating a physical scenario into the Schrodinger or Dirac
  formalism, or choosing between perturbation theory, variational methods,
  DFT, and exact diagonalization.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: theoretical-science
  complexity: advanced
  language: natural
  tags: theoretical, quantum-mechanics, quantum-chemistry, hilbert-space, formulation
---

# 量子問題之立

譯物理系為善立量子力學問題：識自由度、構哈密頓與態空、定邊界條件、擇近似法、末以已知極限驗。

## 用時

- 為解析或數值解立量子力學問題
- 立量子化學算（分子軌道、電子結構）
- 譯物理情景入狄拉克或薛定諤形式
- 於微擾論、變分法、DFT、精確對角化間擇
- 備理論模型以比光譜或散射實驗

## 入

- **必要**：物理系之描述（原子、分子、固體、場等）
- **必要**：所觀量（能譜、躍遷率、基態性）
- **可選**：所匹實驗約束或數據（譜線、束縛能）
- **可選**：欲精度或算力預算
- **可選**：偏好形式（波動、矩陣、二次量子化、路徑積分）

## 法

### 第一步：識物理系與相關自由度

立方程前先全描之：

1. **粒子**：列所有粒子（電子、核、光子、聲子）及量子數（自旋、電荷、質量）。
2. **對稱**：識空間對稱（球、柱、平移、晶體群）、內對稱（自旋、規範）、離散對稱（宇稱、時反）。
3. **能級**：定相關能級以斷哪自由度活躍，哪可凍或絕熱處。
4. **自由度簡**：核與電子時標分者施玻恩-奧本海默近似。多體簡化可用者識集體座標。

```markdown
## System Characterization
- **Particles**: [list with quantum numbers]
- **Active degrees of freedom**: [coordinates, spins, fields]
- **Frozen degrees of freedom**: [and justification for freezing]
- **Symmetry group**: [continuous and discrete]
- **Energy scale hierarchy**: [e.g., electronic >> vibrational >> rotational]
```

**得：** 粒子、量子數、對稱之全清冊，活凍自由度之擇有能級理由。

**敗則：** 若能級不明，始保全自由度，標需作尺度分析。過早截斷致定性錯物理。

### 第二步：構哈密頓與態空

由第一步所識自由度建數學框架：

1. **希爾伯特空間**：定態空。有限維系定基（如自旋-1/2 基 |up>、|down>）。無限維定函數空（如單粒子三維 L2(R^3)）。
2. **動能項**：書每粒子之動能算符。位置表象 T = -hbar^2/(2m) nabla^2。
3. **勢能項**：書所有相互作用勢（庫侖、諧振、自旋軌道、外場）。函數形式與耦合常數須明。
4. **合成哈密頓**：成 H = T + V，以相互類分項。多粒子系納交換與關聯項或註於近似中入處。
5. **算符代數**：驗哈密頓為厄米。識運動常量（[H, O] = 0），可分塊對角化。

```markdown
## Hamiltonian Structure
- **Hilbert space**: [definition and basis]
- **H = T + V decomposition**:
  - T = [kinetic terms]
  - V = [potential terms, grouped by type]
- **Constants of motion**: [operators commuting with H]
- **Symmetry-adapted basis**: [if block diagonalization is possible]
```

**得：** 完整厄米哈密頓，諸項皆顯，態空已定，運動常量已識。

**敗則：** 若哈密頓非顯厄米，察漏共軛項或規範依相。若態空模糊（如相對論粒子），明定形式並標問題。

### 第三步：定邊界與初始條件

約束問題以得唯一解：

1. **邊界條件**：束縛態問題須可歸一（psi -> 0 於無窮）。散射問題定入射波邊界。週期系施布洛赫或玻恩-馮·卡門條件。
2. **域限**：定空間域。粒子於箱者定壁。氫原子者定徑與角域。晶格模型者定晶格與拓撲。
3. **初始態**（時依問題）：定 t=0 之態為能量本徵基展開或有心寬之波包。
4. **約束方程**：不可區分粒子施對稱化（玻色子）或反對稱化（費米子）。規範論施規範固定條件。

```markdown
## Boundary and Initial Conditions
- **Spatial domain**: [definition]
- **Boundary type**: [Dirichlet / Neumann / periodic / scattering]
- **Normalization**: [condition]
- **Particle statistics**: [bosonic / fermionic / distinguishable]
- **Initial state** (if time-dependent): [specification]
```

**得：** 邊界條件物理有據、與哈密頓域數學相容、足以定唯一解（或善散射矩陣）。

**敗則：** 若邊界條件過或欠定，察哈密頓於所擇域之自伴性。非自伴哈密頓須謹處缺陷指數。

### 第四步：擇近似法

依問題結構擇解策：

1. **察精確可解**：察問題是否降為已知精確可解模型（諧振、氫原子、伊辛模型等）。若然，以精確解為主果，微擾論作校正。

2. **微擾論**（弱耦合）：
   - 分 H = H0 + lambda V，H0 精確可解
   - 驗 lambda V 小於 H0 能級間距
   - 察簡併；必要時用簡併微擾論
   - 宜：相互作用弱、少體系、需解析結果

3. **變分法**（基態為重）：
   - 擇可調參數試波函數
   - 試函數須滿邊界條件與對稱
   - 宜：基態能為主目標之多體系

4. **密度泛函論**（多電子系）：
   - 擇交換關聯泛函（LDA、GGA、混合）
   - 定基集（平面波、高斯、數值原子軌道）
   - 宜：多電子系、需基態密度與能

5. **數值精確法**（小系、基準）：
   - 小希爾伯特空間之精確對角化
   - 基態採樣之量子蒙特卡洛
   - 一維或準一維之 DMRG
   - 宜：需高精度且系足小

```markdown
## Approximation Method Selection
- **Method chosen**: [name]
- **Justification**: [why this method fits the problem structure]
- **Expected accuracy**: [order of perturbation, variational bound quality, DFT functional accuracy]
- **Computational cost**: [scaling with system size]
- **Alternatives considered**: [and why they were rejected]
```

**得：** 近似法擇有理由，明預期精度與算力，記所慮替代。

**敗則：** 若無單一法明宜，以二法立並比較。法間不合示問題難度，導後續精煉。

### 第五步：以已知極限驗立

解之前驗立重現已知物理：

1. **經典極限**：取 hbar -> 0（或大量子數），驗哈密頓降為正確經典力學。
2. **非相互作用極限**：耦合常數置零，驗解為單粒子態之積。
3. **對稱極限**：驗立尊所識對稱。察哈密頓於對稱群下變換正確。
4. **量綱分析**：驗哈密頓每項有能量單位。察特徵長、能、時尺度物理合理。
5. **已知精確結果**：系於特殊情況有已知精確解（如 Z=1 氫原子、二次勢諧振）者，驗立重現之。

```markdown
## Validation Checks
| Check | Expected Result | Status |
|-------|----------------|--------|
| Classical limit (hbar -> 0) | [classical Hamiltonian] | [Pass/Fail] |
| Non-interacting limit | [product states] | [Pass/Fail] |
| Symmetry transformation | [correct representation] | [Pass/Fail] |
| Dimensional analysis | [all terms in energy units] | [Pass/Fail] |
| Known exact case | [reproduced result] | [Pass/Fail] |
```

**得：** 諸驗皆過。立自洽待解。

**敗則：** 驗敗示哈密頓構造或邊界條件誤。溯誤至具體項或條件改之，方繼解。

## 驗

- [ ] 粒子與量子數皆顯列
- [ ] 希爾伯特空間以清基定義
- [ ] 哈密頓為厄米，諸項單位正
- [ ] 運動常量已識並用簡化
- [ ] 邊界條件物理有據、數學充足
- [ ] 粒子統計（玻色/費米）強制正確
- [ ] 近似法擇有理由並陳預期精度
- [ ] 經典、非相互作用、對稱極限已察
- [ ] 特殊情況重現已知精確結果
- [ ] 立足使他研究者實現

## 陷

- **過早略自由度**：不察能級而凍自由度致缺定性要緊物理。每簡化必以能級論證
- **非厄米哈密頓**：忘自旋軌道耦合或複勢之共軛項。必顯驗 H = H-dagger
- **散射之邊界條件誤**：以束縛態邊界條件（可歸一）用於散射問題棄連續譜。配邊界條件於物理問題
- **微擾論忽簡併**：對簡併能級用非簡併微擾論致發散校正。展前必察簡併
- **過賴單一近似**：不同法有互補失效模式。變分法得上界但失激發態。微擾論強耦合發散。可則交叉驗
- **量綱不一**：同式中混自然單位（hbar = 1）與 SI。始採一致單位系並明陳

## 參

- `derive-theoretical-result` — 自立問題推解析結果
- `survey-theoretical-literature` — 尋類量子系之前人工作
