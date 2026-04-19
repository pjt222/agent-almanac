---
name: analyze-magnetic-levitation
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Analyze magnetic levitation systems by applying Earnshaw's theorem to determine
  whether passive static levitation is possible, then identifying the appropriate
  circumvention mechanism (diamagnetic, superconducting, active feedback, or
  spin-stabilized). Use when evaluating maglev transport, magnetic bearings,
  superconducting levitation, diamagnetic suspension, or Levitron-type devices.
  Covers force balance calculations, stability analysis in all spatial and
  tilting modes, and Meissner effect versus flux pinning distinctions.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: levitation
  complexity: advanced
  language: natural
  tags: levitation, magnetic-levitation, earnshaw-theorem, superconducting, diamagnetic, maglev
---

# 析磁懸浮

藉施 Earnshaw 定理判被動靜態懸浮是否可能，後辨宜之繞過機制（抗磁、超導、主動回饋或自旋穩定），分析磁懸浮系統。

## 適用時機

- 評提案之磁懸浮設計於物理上可行否
- 判永磁排列何以不能懸浮並辨變通法
- 析超導懸浮系統（Meissner 效應、磁通釘紮、混合態俘獲）
- 設計或除錯主動電磁回饋懸浮（磁懸浮列車、磁軸承）
- 評給定材料與場強下抗磁懸浮之可行性
- 解自旋穩定磁懸浮（Levitron）動力學

## 輸入

- **必要**：被懸浮物之描述（質量、幾何、磁矩或磁化率）
- **必要**：場源之描述（永磁、電磁、超導線圈、排列幾何）
- **選擇性**：操作環境（溫度、真空、振動約束）
- **選擇性**：所需懸浮高度或間隙
- **選擇性**：穩定性需求（剛度、阻尼、主動系統之頻寬）

## 步驟

### 步驟一：刻劃系統

任何分析前先立物與場源之完整物理描述：

1. **物之性質**：記質量 m、幾何（球、盤、桿）、磁矩 mu（永磁物）、體磁化率 chi_v（順磁、抗磁或鐵磁材料）、電導率 sigma（與渦流效應相關）
2. **場源之性質**：述源之配置——永磁陣列（Halbach、偶極、四極）、電磁附線圈參數（匝數、電流、芯材）或超導線圈（臨界電流、臨界場）
3. **場幾何**：判磁場 B(r) 之空間剖面。辨沿懸浮軸之場梯度 dB/dz 與支配穩定之曲率 d^2B/dz^2
4. **環境約束**：注溫度範圍（超導體之低溫）、氣氛（真空減阻尼）、振動譜

```markdown
## System Characterization
- **Object**: [mass, geometry, mu or chi_v, sigma]
- **Field source**: [type, configuration, key parameters]
- **Field profile**: [B(r) functional form or measured map]
- **Gradient**: [dB/dz at intended levitation point]
- **Environment**: [temperature, pressure, vibration]
```

**預期：** 物與場源之完整規格，足以判力與穩定而無需更多假設。

**失敗時：** 若磁化率或磁矩未知，由材料資料表量或估之。無此量則力計算不能。對複合物，由體積加權平均計有效磁化率。

### 步驟二：施 Earnshaw 定理

判給定系統可行被動靜態懸浮否：

1. **陳 Earnshaw 定理**：於無電流與時變場之區域，無靜態之電荷或永磁排列可為順磁或鐵磁體產穩定平衡點。數學上，磁位能之拉普拉斯滿足 nabla^2 U >= 0（順磁／鐵磁），故 U 無局部最小值
2. **分類物之回應**：判被懸浮物為順磁（chi_v > 0）、抗磁（chi_v < 0）、鐵磁（chi_v >> 0，非線性）、超導（完美抗磁，chi_v = -1）或永磁（固定 mu）
3. **施定理**：
   - 對順磁、鐵磁或永磁物於永磁或固定電流之靜態場中：Earnshaw 禁穩定懸浮。至少一空間方向不穩定
   - 對抗磁物：Earnshaw 不禁懸浮。nabla^2 U <= 0 容局部能量最小。被動靜態懸浮可行
   - 對超導體：Meissner 效應供完美抗磁，磁通釘紮可供懸浮與側向穩定
4. **記裁決**：明陳系統為 Earnshaw 禁或 Earnshaw 容，且何材料性質決此分類

```markdown
## Earnshaw Analysis
- **Object magnetic classification**: [paramagnetic / diamagnetic / ferromagnetic / superconducting / permanent magnet]
- **Susceptibility**: chi_v = [value with units]
- **Earnshaw verdict**: [FORBIDDEN / PERMITTED]
- **Reasoning**: [which condition of the theorem applies or fails]
```

**預期：** 對所提懸浮為 Earnshaw 禁或 Earnshaw 容之決定性分類，附特定物理理由之記載。

**失敗時：** 若物有混合磁性（如鐵磁芯附抗磁殼），分別析各部。整體穩定取決於淨能景，恐需數值場計算。

### 步驟三：辨繞過機制

若 Earnshaw 定理禁被動靜態懸浮，辨四標準繞過機制中何者適用：

1. **抗磁懸浮**：被懸浮物本身為抗磁（chi_v < 0）。例：熱解石墨於 NdFeB 磁鐵上，水滴與蛙於 16 T Bitter 磁鐵中。需強場梯度；條件為 (chi_v / mu_0) * B * (dB/dz) >= rho * g，rho 為密度

2. **超導懸浮**：物為低於 T_c 之 type-I 或 type-II 超導體
   - **Meissner 懸浮**：完整磁通排出供斥力。穩定然載荷有限且需超導體保於 Meissner 態（B < B_c1）
   - **磁通釘紮**（type-II 超導體）：磁通渦旋於材料缺陷處釘紮。此供垂直懸浮力與側向回復力，使超導體可懸於磁鐵之下或之上。物相對於場源於 3D 位置中鎖定

3. **主動電磁回饋**：感測器量物之位置，控制器調電磁鐵電流以維平衡。例：EMS 磁懸浮列車（Transrapid）、主動磁軸承。需電源、感測器與頻寬超機械共振頻率之控制系統

4. **自旋穩定懸浮**：旋轉之永磁（Levitron）藉陀螺穩定 Earnshaw 定理本應使不穩之傾覆模。自旋須超臨界頻率 omega_c，以使陀螺剛度勝磁矩。物亦須於窄質量窗內

```markdown
## Circumvention Mechanism
- **Mechanism**: [diamagnetic / superconducting (Meissner or flux pinning) / active feedback / spin-stabilized]
- **Physical basis**: [why this mechanism evades Earnshaw's theorem]
- **Key requirements**: [material property, field strength, temperature, spin rate, or control bandwidth]
- **Limitations**: [load capacity, power consumption, cryogenics, mass window]
```

**預期：** 特定機制之識別，附其物理基礎之明釋，含機制運作之量化需求。

**失敗時：** 若系統不明顯合於四機制之任一，查混合法（如永磁主力配渦流阻尼以求穩，或抗磁穩定順磁系統）。亦考是否系統用電動懸浮（運動導體於磁場中），此為基於 Lenz 定律之獨立機制。

### 步驟四：計算懸浮條件

計力平衡與穩定懸浮之量化條件：

1. **垂直力平衡**：磁力須等於重力
   - 場梯度中之磁偶極：F_z = mu * (dB/dz) = m * g
   - 抗磁物：F_z = (chi_v * V / mu_0) * B * (dB/dz) = m * g
   - 超導體（鏡像法）：將超導體模為鏡並計磁鐵與其鏡像之斥力
   - 主動回饋：F_z = k_coil * I(t)，I(t) 為回饋控制之電流

2. **解懸浮高度**：力平衡方程 F_z(z) = m * g 定平衡高度 z_0。對解析場剖面，代數解。對量測或數值計算之場，圖解或數值解

3. **回復力梯度（剛度）**：計於 z_0 處 k_z = -dF_z/dz。穩定懸浮需 k_z > 0（力隨高增而減）。垂直振盪之自然頻率為 omega_z = sqrt(k_z / m)

4. **側向剛度**：計水平面內之回復力梯度 k_x = -dF_x/dx。對 Earnshaw 容系統（抗磁、超導），此應為正。對回饋系統，依感測器-致動器幾何而定

5. **載荷量**：藉尋平衡轉為邊際穩定（最大位移處 k_z -> 0）之場梯度，判可懸浮之最大質量

```markdown
## Levitation Conditions
- **Force balance equation**: [F_z(z) = m*g, explicit form]
- **Equilibrium height**: z_0 = [value]
- **Vertical stiffness**: k_z = [value, units N/m]
- **Vertical natural frequency**: omega_z = [value, units rad/s]
- **Lateral stiffness**: k_x = k_y = [value, units N/m]
- **Maximum load**: m_max = [value, units kg]
```

**預期：** 完整之力平衡，平衡位置已定，垂直與側向之剛度值已計，載荷量已估。

**失敗時：** 若力平衡無解（磁力過弱不能克服重力），系統不能懸浮所定之物。或增場梯度（更強磁鐵、更近間距）、減物質量，或改用更高磁化率之材料。若任一方向剛度為負，該方向之平衡不穩——返步驟三辨宜之穩定機制。

### 步驟五：驗六自由度之穩定

確懸浮對六剛體自由度（三平移、三旋轉）之擾動皆穩定：

1. **平移穩定**：驗 k_z > 0、k_x > 0、k_y > 0。對軸對稱系統，按對稱 k_x = k_y。為平衡之小位移 delta_x、delta_y、delta_z 計回復力

2. **傾覆穩定**：為小角偏 theta_x、theta_y 繞水平軸計回復力矩。對磁偶極，力矩依場曲率與物之轉動慣量。傾覆不穩為被動永磁懸浮之主要失敗模（亦 Levitron 自旋穩定所對之模）

3. **自旋穩定**（若適用）：對自旋穩定系統，驗自旋率超臨界頻率 omega > omega_c。臨界頻率由磁矩與角動量之比決。低於 omega_c，進動致傾覆不穩

4. **動態穩定**：對主動回饋系統，驗控制環於一切共振頻率有足相位裕度（> 30 度）與增益裕度（> 6 dB）。查感測器噪聲不致激不穩

5. **熱與外擾**：評溫度起伏（超導體近 T_c 處關鍵）、氣流（對輕物之抗磁懸浮顯著）、機械振動（經場源安裝傳遞）之效

```markdown
## Stability Analysis
| Degree of Freedom | Stiffness / Restoring | Stable? | Notes |
|-------------------|----------------------|---------|-------|
| Vertical (z)      | k_z = [value]        | [Yes/No] | [primary levitation axis] |
| Lateral (x)       | k_x = [value]        | [Yes/No] | |
| Lateral (y)       | k_y = [value]        | [Yes/No] | |
| Tilt (theta_x)    | tau_x = [value]      | [Yes/No] | [most common failure mode] |
| Tilt (theta_y)    | tau_y = [value]      | [Yes/No] | |
| Spin (theta_z)    | [N/A or value]       | [Yes/No] | [only relevant for spin-stabilized] |
```

**預期：** 六自由度皆本質穩定（正回復力／力矩）或由所辨之機制穩定（回饋、陀螺、磁通釘紮）。系統確為懸浮可行。

**失敗時：** 若任一自由度不穩且無辨之穩定機制，懸浮設計於所定規格下不可行。最常見之修為對不穩方向加主動回饋環、加抗磁材料以被動穩定側向模、增自旋率以陀螺穩定。返步驟三以納額外機制。

## 驗證

- [ ] 物之性質（質量、磁化率或磁矩、幾何）已全規定
- [ ] 場源與空間剖面已刻劃，梯度已計
- [ ] Earnshaw 定理已正確施於物之磁分類
- [ ] 繞過機制已辨，附其物理基礎之釋
- [ ] 力平衡已解，平衡位置已定
- [ ] 剛度已為三平移方向計
- [ ] 傾覆穩定已為二水平傾覆軸析
- [ ] 對自旋穩定系統，臨界自旋率已計並驗
- [ ] 對主動系統，控制頻寬與穩定裕度已查
- [ ] 載荷量極限已估

## 常見陷阱

- **假設永磁可彼此靜態懸浮**：Earnshaw 定理對順磁與鐵磁物禁此，然此為最常見之誤解。沿一軸之吸或斥恆於垂直軸生不穩。試力平衡計算前恆施定理
- **混 Meissner 懸浮與磁通釘紮**：Meissner 效應（type-I）產純斥且僅於超導體於磁鐵之下時行。磁通釘紮（type-II）將超導體於相對於場之固定位置鎖定，容許任向懸掛。物理與設計含義根本相異
- **忽傾覆模**：許多分析僅查平移穩定即宣系統穩定。傾覆不穩為被動磁懸浮之主要失敗模，需獨立分析。系統可於一切方向有正平移剛度而仍傾覆不穩
- **低估抗磁懸浮場需求**：抗磁磁化率甚小（多數材料 chi_v ~ -10^-5，熱解石墨 -4.5 x 10^-4）。即懸浮毫克級物亦需強場梯度，非石墨材料典型 B * dB/dz > 1000 T^2/m
- **忽渦流效應**：時變場或運動導體生渦流，產力與發熱。主動回饋系統中，被懸浮物中之渦流生相位滯後，可使控制環不穩
- **將超導體於一切條件下視為完美抗磁**：混合態（B_c1 < B < B_c2）之 type-II 超導體有部分磁通穿透。懸浮力依磁化歷史（磁滯），非僅瞬時場

## 相關技能

- `evaluate-levitation-mechanism` — 比對分析以為應用擇最佳懸浮法
- `analyze-magnetic-field` — 為此技能輸入所需之磁場剖面之詳計
- `formulate-maxwell-equations` — 推導支配懸浮系統之電磁場方程
- `design-acoustic-levitation` — 比對之非磁懸浮替代法
- `formulate-quantum-problem` — 超導懸浮之量子力學處理（BCS 理論、Ginzburg-Landau）
