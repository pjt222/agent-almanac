---
name: formulate-quantum-problem
locale: wenyan-ultra
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

# 立量子問題

析自由度、建 Hamiltonian 與狀空、定邊界、擇近似、驗極限。

## 用

- 立量子力學題供析或數解
- 立量子化學算（分子軌、電子結構）
- 轉物理場景為 Schrodinger 或 Dirac 形
- 擇攝動、變分、DFT 或精確對角
- 備理論模比於譜或散射實驗

## 入

- **必**：系之描（原子、分子、固體、場）
- **必**：所觀（能譜、躍遷率、基態性）
- **可**：實驗約束或數據（譜線、結合能）
- **可**：精度與算量預算
- **可**：偏好之形（波、矩陣、二次量子化、路徑積分）

## 行

### 一：辨系與活自由度

寫式前全察：

1. **粒子**：列諸粒（電、核、光、聲子）及其量數（自旋、荷、質）
2. **對稱**：空間（球、柱、平移、晶群）、內（自旋旋、規）、離散（宇稱、時反）
3. **能階**：定相關能階，以擇活與凍或絕熱自由度
4. **減自由度**：核/電時標分→用 Born-Oppenheimer。多體簡化→辨集體坐標

```markdown
## System Characterization
- **Particles**: [list with quantum numbers]
- **Active degrees of freedom**: [coordinates, spins, fields]
- **Frozen degrees of freedom**: [and justification for freezing]
- **Symmetry group**: [continuous and discrete]
- **Energy scale hierarchy**: [e.g., electronic >> vibrational >> rotational]
```

得：全目錄（粒、量數、對稱），活凍自由度皆明由。

敗：能階不明→先全留，標須尺度析。早截致質性謬誤。

### 二：建 Hamiltonian 與狀空

由一所辨自由度建數學架構：

1. **Hilbert 空間**：定狀空。有限維者定基（如自旋 1/2 基 |up>、|down>）。無限維者定函空（如單粒三維 L2(R^3)）
2. **動能項**：各粒動能算子。位置表象 T = -hbar^2/(2m) nabla^2
3. **位能項**：諸交互（Coulomb、諧、自旋軌、外場），形與耦合常數皆明
4. **合成 Hamiltonian**：H = T + V，按類分組。多粒者含交換與關聯，或標明近似引入處
5. **算子代數**：驗 Hermitian。辨守恆量（[H, O] = 0）以塊對角化

```markdown
## Hamiltonian Structure
- **Hilbert space**: [definition and basis]
- **H = T + V decomposition**:
  - T = [kinetic terms]
  - V = [potential terms, grouped by type]
- **Constants of motion**: [operators commuting with H]
- **Symmetry-adapted basis**: [if block diagonalization is possible]
```

得：完整 Hermitian H，諸項顯寫，Hilbert 空明，守恆量已辨。

敗：非顯 Hermitian→查漏共軛或規範相。Hilbert 空模糊（如相對論粒）→明形並標問題。

### 三：定邊界與初始

約束使解唯一：

1. **邊界**：束縛態→規一化（psi → 0 於無窮）。散射→入波邊界。週期→Bloch 或 Born-von Karman
2. **域限**：定空域。盒中粒→壁。氫原子→徑角域。晶格模→格與拓撲
3. **初狀**（時變）：t=0 之狀，按能本徵展或波包中心與寬
4. **約束式**：全同粒→對稱（玻）或反對稱（費）。規範論→規範固定

```markdown
## Boundary and Initial Conditions
- **Spatial domain**: [definition]
- **Boundary type**: [Dirichlet / Neumann / periodic / scattering]
- **Normalization**: [condition]
- **Particle statistics**: [bosonic / fermionic / distinguishable]
- **Initial state** (if time-dependent): [specification]
```

得：邊界物理合理、與 H 域數學一致，足定唯一解（或明定散射矩陣）。

敗：過定或不足→查 H 於所選域之自伴性。非自伴 H 須處理缺陷指標。

### 四：擇近似法

依題構擇解策：

1. **察可精確解**：是否歸已知可精解模（諧振子、氫原子、Ising）。若然，主用精解，攝動為校正。

2. **攝動論**（弱耦）：
   - H = H0 + lambda V，H0 可精解
   - 驗 lambda V 小於 H0 之能距
   - 察簡併；有則用簡併攝動
   - 宜：交互弱、少體、需析解

3. **變分法**（基態）：
   - 擇含參試波函
   - 試函滿邊界與對稱
   - 宜：基態能為主、多體

4. **密度泛函**（多電子）：
   - 擇交換-關聯泛函（LDA、GGA、雜化）
   - 定基組（平面波、高斯、數值原子軌）
   - 宜：多電子、需基態密與能

5. **數值精法**（小系、基準）：
   - 精確對角：小 Hilbert 空
   - 量子 Monte Carlo：基態取樣
   - DMRG：一維或準一維
   - 宜：需高精度而系足小

```markdown
## Approximation Method Selection
- **Method chosen**: [name]
- **Justification**: [why this method fits the problem structure]
- **Expected accuracy**: [order of perturbation, variational bound quality, DFT functional accuracy]
- **Computational cost**: [scaling with system size]
- **Alternatives considered**: [and why they were rejected]
```

得：擇法有明由，預期精度與算量明，備選亦已錄。

敗：無單法確宜→兩法並立比解。法異揭題難並導進一步精化。

### 五：驗極限

解前驗陳立反映已知：

1. **古典極（hbar → 0）**：或大量數→驗 H 回正確古典力學
2. **無交互極**：耦合常數置零→解應為單粒態積
3. **對稱極**：形式應尊所辨對稱。H 於對稱群下變換正確
4. **量綱析**：H 之諸項皆能量單位。特徵長、能、時標物理合理
5. **已知精解**：特例（如 Z=1 氫原子、二次位諧振子）→驗形式復之

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

得：諸驗皆通。形式自洽，備解。

敗：驗敗乃 H 構建或邊界之誤。溯至該項或條件修之，再進解。

## 驗

- [ ] 諸粒與量數皆顯列
- [ ] Hilbert 空明，基明
- [ ] H Hermitian，諸項單位正確
- [ ] 守恆量已辨並用以簡化
- [ ] 邊界物理合理、數學充足
- [ ] 粒子統計（玻/費）正確施行
- [ ] 近似法擇有由，預期精度明
- [ ] 古典、無交互、對稱極皆察
- [ ] 特例已知精解可復
- [ ] 形式足供他研究者施行

## 忌

- **早凍自由度**：不察能階而凍→或失質性物理。每減必以能階論證
- **非 Hermitian H**：自旋軌或複位漏共軛項。必顯驗 H = H-dagger
- **散射用束縛邊界**：用規一化於散射題→棄連續譜。邊界合物理題
- **攝動忽簡併**：非簡併攝動施於簡併能階→校正發散。展開前必察簡併
- **倚單近似**：諸法失敗模互補。變分予上界但或漏激發。攝動於強耦發散。可互驗
- **量綱不一**：同式混自然單位（hbar = 1）與 SI。起始即擇一貫系並顯明

## 參

- `derive-theoretical-result`
- `survey-theoretical-literature`
