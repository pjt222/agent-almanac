---
name: formulate-quantum-problem
locale: wenyan-lite
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

# 建量子問題

將物理系統譯為良定之量子力學問題：識相關自由度、構建 Hamiltonian 與狀態空間、指定邊界條件、擇合宜近似法、驗表述於已知極限。

## 適用時機

- 為解析或數值解設量子力學問題
- 建量子化學計算（分子軌道、電子結構）
- 將物理情境譯為 Dirac 或 Schrodinger 形式
- 於擾動論、變分法、DFT 或精確對角化間擇一
- 備理論模型以比光譜或散射之實驗資料

## 輸入

- **必要**：物理系統之描述（原子、分子、固體、場等）
- **必要**：所關注之可觀測量（能譜、躍遷率、基態性質）
- **選擇性**：實驗之約束或所配之資料（譜線、結合能）
- **選擇性**：所期之精度或計算預算
- **選擇性**：偏好之形式（波動力學、矩陣力學、二次量子化、路徑積分）

## 步驟

### 步驟一：識物理系統與相關自由度

書方程前盡述系統：

1. **粒子內容**：列所有粒子（電子、原子核、光子、聲子）及其量子數（自旋、電荷、質量）。
2. **對稱**：識空間對稱（球、柱、平移、晶體群）、內對稱（自旋轉、規範）與離散對稱（宇稱、時反）。
3. **能量尺度**：定相關能量尺度以擇何自由度為活動，何可凍結或絕熱處理。
4. **自由度簡化**：若原子核與電子之時間尺度分離，施 Born-Oppenheimer 近似。若多體可簡化，識集體座標。

```markdown
## 系統特徵
- **粒子**：[列及量子數]
- **活動自由度**：[座標、自旋、場]
- **凍結自由度**：[附凍結之理由]
- **對稱群**：[連續與離散]
- **能量尺度階序**：[如電子 >> 振動 >> 轉動]
```

**預期：** 粒子、量子數、對稱之完整清單，附活動與凍結自由度之合理擇。

**失敗時：** 若能量尺度階序不明，初留所有自由度並標示須尺度分析。過早截斷致物理質變錯。

### 步驟二：構建 Hamiltonian 與狀態空間

自步驟一所識自由度建數學框架：

1. **Hilbert 空間**：定狀態空間。有限維系統指定基（如自旋半 |上>、|下>）。無限維系統指定函數空間（如三維單粒子 L2(R^3)）。
2. **動能項**：為每粒子書動能算子。位置表象中 T = -hbar^2/(2m) nabla^2。
3. **位能項**：書所有交互作用位能（Coulomb、諧振、自旋軌道、外場）。明其函數形式與耦合常數。
4. **合成 Hamiltonian**：組 H = T + V，依交互類型分組。多粒子系統納交換與關聯項或註其何時以近似納入。
5. **算子代數**：驗 Hamiltonian 為 Hermitian。識運動常數（[H, O] = 0），可用以分塊對角化。

```markdown
## Hamiltonian 結構
- **Hilbert 空間**：[定義與基]
- **H = T + V 分解**：
  - T = [動能項]
  - V = [位能項，依類型分組]
- **運動常數**：[與 H 交換之算子]
- **對稱適配之基**：[若可分塊對角化]
```

**預期：** 完整 Hermitian 之 Hamiltonian，所有項明書，Hilbert 空間已定，運動常數已識。

**失敗時：** 若 Hamiltonian 非明 Hermitian，核漏共軛項或規範依賴之相位。若 Hilbert 空間不明（如相對論粒子），明指形式並標此問題。

### 步驟三：指定邊界與初始條件

約束問題以得唯一解：

1. **邊界條件**：束縛態問題要求可歸一化（psi -> 0 於無窮）。散射問題指定入射波邊界條件。週期系統施 Bloch 或 Born-von Karman 條件。
2. **域之限**：指定空間域。盒中粒子定壁。氫原子定徑向與角向域。格點模型定格點與其拓撲。
3. **初態**（時變問題）：定 t=0 之態為能量本徵基之展開或中心與寬已指定之波包。
4. **約束方程**：不可區分粒子施對稱化（玻色子）或反對稱化（費米子）。規範論施規範固定條件。

```markdown
## 邊界與初始條件
- **空間域**：[定義]
- **邊界類型**：[Dirichlet / Neumann / 週期 / 散射]
- **歸一化**：[條件]
- **粒子統計**：[玻色 / 費米 / 可區分]
- **初態**（若時變）：[指定]
```

**預期：** 邊界條件物理合理、與 Hamiltonian 之域數學一致，足以定唯一解（或良定之散射矩陣）。

**失敗時：** 邊界條件過或欠定，核 Hamiltonian 於所擇域上之自伴性。非自伴 Hamiltonian 須審慎處理虧指數。

### 步驟四：擇近似法

擇合問題結構之解法：

1. **評估精確可解性**：核問題是否簡為已知精確可解模型（諧振子、氫原子、Ising 模型等）。若然，取精確解為主結果，擾動論為修正。

2. **擾動論**（弱耦合）：
   - 分 H = H0 + lambda V，H0 精確可解
   - 驗 lambda V 小於 H0 之能級間距
   - 核簡併；必要時用簡併擾動論
   - 宜於：交互作用弱、少體系統、需解析結果

3. **變分法**（基態為主）：
   - 擇帶可調參數之試波函數
   - 確試函數滿足邊界條件與對稱
   - 宜於：基態能量為主目標、多體系統

4. **密度泛函理論**（多電子系統）：
   - 擇交換關聯泛函（LDA、GGA、混合）
   - 定基組（平面波、Gaussian、數值原子軌道）
   - 宜於：多電子系統、需基態密度與能量

5. **數值精確法**（小系統、基準）：
   - 精確對角化於小 Hilbert 空間
   - 量子 Monte Carlo 為基態取樣
   - DMRG 為一維或準一維系統
   - 宜於：需高精度且系統夠小

```markdown
## 近似法擇
- **所擇之法**：[名]
- **理由**：[何以此法合問題結構]
- **預期精度**：[擾動階、變分界之品質、DFT 泛函之精度]
- **計算代價**：[與系統大小之比例]
- **所考他法**：[及拒之理由]
```

**預期：** 合理擇定之近似法，明陳預期精度與計算代價，記其他考慮之法。

**失敗時：** 若無單一法明顯合宜，為兩法建表述並較結果。法間不合揭問題之難，引導進一步精煉。

### 步驟五：驗表述於已知極限

解前驗表述重現已知物理：

1. **古典極限**：取 hbar -> 0（或大量子數），驗 Hamiltonian 簡為正確古典力學。
2. **非交互極限**：置耦合常數為零，驗解為單粒子態之積。
3. **對稱極限**：驗表述尊所有所識對稱。核 Hamiltonian 於對稱群下正確變換。
4. **量綱分析**：驗 Hamiltonian 每項具能量單位。核特徵長度、能量、時間尺度物理合理。
5. **已知精確結果**：若系統於特例中有已知精確解（如 Z=1 氫原子、二次位能諧振子），驗表述重現之。

```markdown
## 驗證檢查
| 檢 | 預期結果 | 狀態 |
|-------|----------------|--------|
| 古典極限 (hbar -> 0) | [古典 Hamiltonian] | [通過/失敗] |
| 非交互極限 | [積態] | [通過/失敗] |
| 對稱變換 | [正確表示] | [通過/失敗] |
| 量綱分析 | [各項為能量單位] | [通過/失敗] |
| 已知精確情形 | [重現結果] | [通過/失敗] |
```

**預期：** 所有驗證檢查通過。表述自洽可解。

**失敗時：** 驗證失敗示 Hamiltonian 構建或邊界條件有誤。追失敗至特定項或條件，解前改正。

## 驗證

- [ ] 所有粒子與量子數明列
- [ ] Hilbert 空間以明確基定
- [ ] Hamiltonian 為 Hermitian 且各項單位正確
- [ ] 運動常數已識並用於簡化
- [ ] 邊界條件物理合理且數學充分
- [ ] 粒子統計（玻色/費米）正確施行
- [ ] 近似法擇有理由，預期精度已陳
- [ ] 古典、非交互、對稱極限已核
- [ ] 特例重現已知精確結果
- [ ] 表述足以令他研究者實施

## 常見陷阱

- **過早漏自由度**：未核能量尺度階序而凍結自由度，可漏質變要緊之物理。每簡化必以能量尺度之論證為據。
- **非 Hermitian Hamiltonian**：漏自旋軌道耦合或複位能之共軛項。必明驗 H = H-dagger。
- **散射用錯邊界條件**：散射問題用束縛態邊界條件（歸一化）盡棄連續譜。邊界條件配物理問題。
- **擾動論忽視簡併**：對簡併能級施非簡併擾動論致發散修正。展開前必核簡併。
- **過度依單一近似**：不同法有互補之失敗模式。變分法得上界但可漏激發態。擾動論於強耦合發散。可能時交互驗證。
- **量綱不一致**：同一表達式混用自然單位（hbar = 1）與 SI 單位。始採一致單位系並明陳之。

## 相關技能

- `derive-theoretical-result` —— 自所建問題導出解析結果
- `survey-theoretical-literature` —— 尋類似量子系統之前人工作
