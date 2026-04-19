---
name: analyze-magnetic-levitation
locale: wenyan-ultra
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

# 析磁浮

施 Earnshaw 定理判被動靜浮可否，後識繞機（抗磁、超導、主動饋、自旋穩）。

## 用

- 評擬磁浮設物理可行→用
- 定永磁陣何不浮、識變→用
- 析超導浮（Meissner、磁通釘、混態捕）→用
- 設或除主動電磁饋浮（maglev 列車、磁軸承）→用
- 評抗磁浮可行於某材與場強→用
- 解自旋穩磁浮（Levitron）動→用

## 入

- **必**：浮體述（質、幾、磁矩或磁化率）
- **必**：場源述（永磁、電磁、超導圈、陣幾）
- **可**：操境（溫、真空、振限）
- **可**：欲浮高或隙
- **可**：穩需（剛、阻、主動帶寬）

## 行

### 一：定系

析前立全物述：

1. **體性**：質 m、幾（球、盤、桿）、磁矩 mu（永磁體）、體磁化率 chi_v（順、抗、鐵磁材）、電導 sigma（渦流相關）
2. **場源性**：源設——永磁陣（Halbach、偶、四極）、電磁附圈參（圈、流、核材）、超導圈（臨界流、臨界場）
3. **場幾**：定空 B(r) 之分。識浮軸 dB/dz 與穩之 d^2B/dz^2
4. **境限**：溫範（超導低溫）、氣（真空減阻）、振譜

```markdown
## System Characterization
- **Object**: [mass, geometry, mu or chi_v, sigma]
- **Field source**: [type, configuration, key parameters]
- **Field profile**: [B(r) functional form or measured map]
- **Gradient**: [dB/dz at intended levitation point]
- **Environment**: [temperature, pressure, vibration]
```

得：體與場源之全規足以無加設定力與穩。

敗：磁化率或矩未知→量或自材數表估。無此量則力算不能。複合體→以體權均算效磁化率。

### 二：施 Earnshaw 定理

判被動靜浮可否：

1. **述定理**：無流與時變場域中，無靜荷或永磁陣可為順或鐵磁體生穩平衡點。數：磁勢能 Laplacian 滿 nabla^2 U >= 0（順/鐵磁），故 U 無局最低。
2. **分體應**：浮體為順（chi_v > 0）、抗（chi_v < 0）、鐵（chi_v >> 0、非線）、超導（完抗磁，chi_v = -1）、永磁（固 mu）。
3. **施定理**：
   - 順、鐵、永磁體於永磁或固流靜場：Earnshaw 禁穩浮。至少一空向不穩
   - 抗磁體：Earnshaw 不禁。nabla^2 U <= 0 容局能最低。被動靜浮許
   - 超導：Meissner 效供完抗磁，磁通釘可供浮與側穩
4. **錄判**：明述禁或許，何材性致分。

```markdown
## Earnshaw Analysis
- **Object magnetic classification**: [paramagnetic / diamagnetic / ferromagnetic / superconducting / permanent magnet]
- **Susceptibility**: chi_v = [value with units]
- **Earnshaw verdict**: [FORBIDDEN / PERMITTED]
- **Reasoning**: [which condition of the theorem applies or fails]
```

得：定分擬浮為 Earnshaw 禁或許，附具體物由文。

敗：體混磁性（如鐵核抗殼）→各部獨析。全穩賴淨能景，或須數場算。

### 三：識繞機

Earnshaw 禁時識四標繞機之一：

1. **抗磁浮**：浮體本抗（chi_v < 0）。例：石墨於 NdFeB 上、水滴與蛙於 16 T Bitter 磁。需強場梯；條為 (chi_v / mu_0) * B * (dB/dz) >= rho * g，rho 為密。

2. **超導浮**：體為一型或二型超導於 T_c 下。
   - **Meissner 浮**：完磁通排供斥力。穩但載限，需超導留 Meissner 態（B < B_c1）
   - **磁通釘**（二型）：磁通漩渦於材缺處釘。供垂浮力與側復力，超導可懸於磁下或上。體 3D 位定於場源
3. **主動電磁饋**：感量體位、控調電磁流以維平衡。例：EMS maglev（Transrapid）、主動磁軸承。需電源、感、控帶寬越機共振。

4. **自旋穩浮**：旋永磁（Levitron）以陀螺穩 Earnshaw 否則致不穩之傾模。旋須越臨頻 omega_c 以陀螺剛克磁矩。體須留窄質窗。

```markdown
## Circumvention Mechanism
- **Mechanism**: [diamagnetic / superconducting (Meissner or flux pinning) / active feedback / spin-stabilized]
- **Physical basis**: [why this mechanism evades Earnshaw's theorem]
- **Key requirements**: [material property, field strength, temperature, spin rate, or control bandwidth]
- **Limitations**: [load capacity, power consumption, cryogenics, mass window]
```

得：明識機附物基明釋、含機行之量需。

敗：系不明合四機之一→察混法（如永磁主力配渦流阻為穩，或抗磁穩順磁系）。亦考電動浮（動導於磁場），別機本 Lenz 律。

### 四：算浮條

算力衡與穩浮量條：

1. **垂力衡**：磁力等重。
   - 磁偶於場梯：F_z = mu * (dB/dz) = m * g
   - 抗磁體：F_z = (chi_v * V / mu_0) * B * (dB/dz) = m * g
   - 超導（像法）：模超導為鏡而算磁與像之斥
   - 主動饋：F_z = k_coil * I(t)，I(t) 為饋控流

2. **解浮高**：力衡 F_z(z) = m * g 定衡高 z_0。析場：代解。量或數場：圖或數解。

3. **復力梯（剛）**：算 k_z = -dF_z/dz 於 z_0。穩浮 k_z > 0（升高力減）。垂振自然頻 omega_z = sqrt(k_z / m)。

4. **側剛**：算水平面復力梯 k_x = -dF_x/dx。Earnshaw 許系（抗磁、超導）應正。饋系賴感作幾。

5. **載限**：求平衡邊穩之場梯（最大移時 k_z → 0）以定可浮最大質。

```markdown
## Levitation Conditions
- **Force balance equation**: [F_z(z) = m*g, explicit form]
- **Equilibrium height**: z_0 = [value]
- **Vertical stiffness**: k_z = [value, units N/m]
- **Vertical natural frequency**: omega_z = [value, units rad/s]
- **Lateral stiffness**: k_x = k_y = [value, units N/m]
- **Maximum load**: m_max = [value, units kg]
```

得：完力衡附衡位定、垂側剛算、載量估。

敗：力衡無解（磁力弱不克重）→系不可浮所定體。或增場梯（強磁、近距）、減體質、或換高磁化率材。任向剛負→該向不穩——回三識穩機。

### 五：驗六自由度穩

確浮對六剛體自由度（三平移、三旋）擾穩：

1. **平移穩**：驗 k_z > 0、k_x > 0、k_y > 0。軸對稱系 k_x = k_y。算小移 delta_x、delta_y、delta_z 之復力。

2. **傾穩**：算水平軸小角偏 theta_x、theta_y 之復矩。磁偶矩賴場曲與體慣矩。傾不穩乃永磁被動浮主敗模（Levitron 自旋穩之所對）。

3. **自旋穩**（若可）：自旋穩系驗旋率越臨頻 omega > omega_c。臨頻由磁矩比角動定。omega_c 下歲差致傾不穩。

4. **動穩**：主動饋系驗控環諸共振有足相裕（>30 度）與增裕（>6 dB）。察感噪不激不穩。

5. **熱與外擾**：評溫變（超導近 T_c 關鍵）、氣流（抗磁浮輕物大）、機振（由場源座傳）。

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

得：六自由度皆內穩（正復力/矩）或經識機穩（饋、陀螺、磁通釘）。系驗為浮可行。

敗：任自由度不穩而無識穩機→所定設不可行。常修：為不穩向加主動饋環、加抗磁材為側模被動穩、增旋率為陀螺穩。回三入加機。

## 驗

- [ ] 體性（質、磁化率或磁矩、幾）全規
- [ ] 場源與空分定附梯算
- [ ] Earnshaw 定理正施於體磁分
- [ ] 繞機識附物基釋
- [ ] 力衡解附衡位定
- [ ] 三平移向皆算剛
- [ ] 兩水平傾軸皆析穩
- [ ] 自旋穩系算驗臨旋率
- [ ] 主動系察控帶寬與穩裕
- [ ] 載量限估

## 忌

- **設永磁可相靜浮**：Earnshaw 禁順鐵磁體之此，乃最常誤。沿一軸吸或斥恆致垂軸不穩。力衡算前恆施定理
- **混 Meissner 浮與磁通釘**：Meissner（一型）出純斥唯超導於磁下行。磁通釘（二型）固超導於場相對位，許任向懸。物與設意本異
- **忽傾模**：諸析唯察平移穩而稱系穩。傾不穩乃被動磁浮主敗模需獨析。系可諸向平移剛正而傾不穩
- **低估抗磁浮場需**：抗磁化率甚小（多材 chi_v ~ -10^-5、石墨 -4.5 x 10^-4）。即毫克物需強梯，多材常 B * dB/dz > 1000 T^2/m
- **忽渦流效**：時變場或動導生渦流出力與熱。主動饋系浮體渦流致相滯可不穩控環
- **諸境視超導為完抗磁**：二型超導混態（B_c1 < B < B_c2）有部磁通透。浮力賴磁化史（滯）非僅瞬場

## 參

- `evaluate-levitation-mechanism` —— 比析擇某用之最佳浮法
- `analyze-magnetic-field` —— 此技入需之磁場詳算
- `formulate-maxwell-equations` —— 推治浮系電磁場方
- `design-acoustic-levitation` —— 比之非磁浮法
- `formulate-quantum-problem` —— 超導浮量處（BCS 論、Ginzburg-Landau）
