---
name: analyze-magnetic-levitation
locale: wenyan
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

定系可否穩懸、識所恃之機理（抗磁、超導、主反饋、旋穩）、算力衡與穩之條件、驗諸六自由度（含傾）穩於擾。

## 用時

- 評磁懸計劃物理可行乎乃用
- 定永磁列何以不懸、識補之道乃用
- 析超導懸系（Meissner 效、磁通釘、混態）乃用
- 設或調主電磁反饋懸（磁浮列車、磁軸承）乃用
- 察材與場強於抗磁懸之適乃用
- 解旋穩磁懸（Levitron）動力乃用

## 入

- **必要**：懸物之述（質、幾何、磁矩或磁化率）
- **必要**：場源之述（永磁、電磁、超導線圈、排列幾何）
- **可選**：操環境（溫、真空、振約）
- **可選**：期懸高或隙
- **可選**：穩之求（剛度、阻尼、主系之帶寬）

## 法

### 第一步：描系

析前立物與源之全物理述：

1. **物屬**：錄質 m、幾何（球、盤、棒）、磁矩 mu（永磁物）、體磁化率 chi_v（順、抗、鐵磁材）、電導 sigma（渦流效相關）。
2. **源屬**：述源配——永磁列（Halbach、偶極、四極）、電磁附線圈參（匝、流、芯材）、或超導線圈（臨界流、臨界場）。
3. **場幾何**：定磁場 B(r) 之空間式。識懸軸之場梯 dB/dz 與控穩之曲率 d^2B/dz^2。
4. **環境約**：記溫範（超導需冷）、氣（真空減阻尼）、振譜。

```markdown
## System Characterization
- **Object**: [mass, geometry, mu or chi_v, sigma]
- **Field source**: [type, configuration, key parameters]
- **Field profile**: [B(r) functional form or measured map]
- **Gradient**: [dB/dz at intended levitation point]
- **Environment**: [temperature, pressure, vibration]
```

**得：** 物與源之全規，足以定力與穩而不需更假。

**敗則：** 若磁化率或矩未知，自材數表量或估。無此則力算不可行。合成物以體權均算有效磁化率。

### 第二步：施 Earnshaw 定理

定所給系可否被動靜懸：

1. **述 Earnshaw 定理**：於無流無時變之區，無靜電荷或永磁之排可生順磁或鐵磁體之穩平衡。數：磁勢能之拉普拉斯 nabla^2 U >= 0（順/鐵磁），故 U 無局極小。
2. **分物之應**：定懸物為順磁（chi_v > 0）、抗磁（chi_v < 0）、鐵磁（chi_v >> 0，非線）、超導（完抗磁，chi_v = -1）、或永磁（固 mu）。
3. **施定理**：
   - 靜場內順、鐵、永磁物：Earnshaw 禁穩懸。至少一向不穩。
   - 抗磁物：Earnshaw *不*禁。nabla^2 U <= 0 許局能極小。被動靜懸可行。
   - 超導：Meissner 效供完抗磁，磁通釘供懸與側穩。
4. **書判**：明述系為 Earnshaw 禁或許，何材屬定此分。

```markdown
## Earnshaw Analysis
- **Object magnetic classification**: [paramagnetic / diamagnetic / ferromagnetic / superconducting / permanent magnet]
- **Susceptibility**: chi_v = [value with units]
- **Earnshaw verdict**: [FORBIDDEN / PERMITTED]
- **Reasoning**: [which condition of the theorem applies or fails]
```

**得：** 所擬懸為禁或許之決判附具體物理之由。

**敗則：** 若物混磁性（鐵磁核外抗磁殼），逐元析。總穩依淨能地貌，或需數值場算。

### 第三步：識補機理

若 Earnshaw 禁被動靜懸，識四標補機理何適：

1. **抗磁懸**：懸物本為抗磁（chi_v < 0）。例：石墨於 NdFeB 磁上、16 T 磁中水滴與蛙。需強梯；條件 (chi_v / mu_0) * B * (dB/dz) >= rho * g，rho 為密。

2. **超導懸**：物為 T_c 下之一或二類超導。
   - **Meissner 懸**：全磁通排生斥力。穩而載限，需超導留於 Meissner 態（B < B_c1）。
   - **磁通釘**（二類）：磁通渦於材缺釘。供豎懸力與側復力，可於磁上下懸。物於場源相對 3D 位置鎖。

3. **主電磁反饋**：感測物位，控調電磁流以守衡。例：EMS 磁浮（Transrapid）、主磁軸承。需電源、感測、控系，帶寬逾機械共振頻。

4. **旋穩懸**：旋永磁（Levitron）以陀螺穩 Earnshaw 所致之傾不穩。旋速須逾臨界 omega_c 使陀螺剛度勝磁扭。物亦須於窄質窗內。

```markdown
## Circumvention Mechanism
- **Mechanism**: [diamagnetic / superconducting (Meissner or flux pinning) / active feedback / spin-stabilized]
- **Physical basis**: [why this mechanism evades Earnshaw's theorem]
- **Key requirements**: [material property, field strength, temperature, spin rate, or control bandwidth]
- **Limitations**: [load capacity, power consumption, cryogenics, mass window]
```

**得：** 具體機理之識附物理之基明述，含機理運行之量求。

**敗則：** 若系不明屬四機理，察混法（如永磁主力加渦流阻尼穩、或順磁系之抗磁穩）。亦察電動力懸（磁場中動導體），此乃本於楞次律之獨機理。

### 第四步：算懸條件

算力衡與穩懸之量條件：

1. **豎力衡**：磁力當等重。
   - 場梯中之磁偶極：F_z = mu * (dB/dz) = m * g。
   - 抗磁物：F_z = (chi_v * V / mu_0) * B * (dB/dz) = m * g。
   - 超導（鏡像法）：模超導為鏡，算磁與鏡像之斥。
   - 主反饋：F_z = k_coil * I(t)，I(t) 為反饋控之流。

2. **解懸高**：力衡方程 F_z(z) = m * g 定平衡高 z_0。解析場則代數解。量測或數算之場則圖或數解。

3. **復力梯（剛度）**：於 z_0 算 k_z = -dF_z/dz。穩懸 k_z > 0（力隨高增而減）。豎振自然頻 omega_z = sqrt(k_z / m)。

4. **側剛度**：算水平之復力梯 k_x = -dF_x/dx。Earnshaw 許之系（抗磁、超導）此當正。反饋系則依感測—致動之幾何。

5. **載限**：定最大可懸之質，尋平衡於臨界穩（k_z → 0 於最大移）之梯。

```markdown
## Levitation Conditions
- **Force balance equation**: [F_z(z) = m*g, explicit form]
- **Equilibrium height**: z_0 = [value]
- **Vertical stiffness**: k_z = [value, units N/m]
- **Vertical natural frequency**: omega_z = [value, units rad/s]
- **Lateral stiffness**: k_x = k_y = [value, units N/m]
- **Maximum load**: m_max = [value, units kg]
```

**得：** 力衡全，平衡位定，豎側剛度算，載限估。

**敗則：** 若力衡無解（磁力不足勝重），系不能懸指定物。增場梯（強磁、近距）、減物質、或換更高磁化率之材。若某向剛度負，該向不穩——返第三步識穩機理。

### 第五步：驗諸自由度之穩

確懸於六剛體自由度（三平、三旋）皆穩：

1. **平穩**：驗 k_z > 0、k_x > 0、k_y > 0。軸對稱系 k_x = k_y。算小位移 delta_x、delta_y、delta_z 之復力。

2. **傾穩**：算水平軸小角偏 theta_x、theta_y 之復扭。磁偶極之扭依場曲率與物之慣量。傾不穩為被動永磁懸之主敗式（亦為 Levitron 旋穩所解者）。

3. **旋穩**（若適）：旋穩系驗旋速逾臨界 omega > omega_c。臨界頻定於磁扭與角動量之比。低於 omega_c 則進動致傾不穩。

4. **動穩**：主反饋系驗控環於諸共振頻有足相裕（> 30 度）、益裕（> 6 dB）。察感測噪不激不穩。

5. **熱與外擾**：評溫變（超導近 T_c 要）、氣流（輕抗磁懸要）、機振（源掛傳之振）之影。

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

**得：** 六自由度皆本穩（正復力/扭）或經所識機理穩（反饋、陀螺、磁通釘）。系可行於懸。

**敗則：** 若某自由度不穩而無穩機理識，懸設不可行如規。最常補：加主反饋於不穩向、加抗磁材以被動穩側模、增旋速以陀螺穩。返第三步納增機理。

## 驗

- [ ] 物屬（質、磁化率或矩、幾何）全規
- [ ] 場源與空間式描附梯已算
- [ ] Earnshaw 定理正施於物之磁類
- [ ] 補機理識附物理之基
- [ ] 力衡解附平衡位定
- [ ] 三平向皆算剛度
- [ ] 二水平傾軸皆析
- [ ] 旋穩系算且驗臨界旋速
- [ ] 主系察控帶寬與穩裕
- [ ] 載限估

## 陷

- **假永磁可靜懸於彼**：Earnshaw 禁此於順鐵磁，然為最常誤解。沿一軸之吸或斥恆生垂軸不穩。力衡算前必施定理
- **混 Meissner 懸與磁通釘**：Meissner 效（一類）生純斥而只懸磁下。磁通釘（二類）鎖超導於場相對固位，可倒懸。物理與設計意涵本異
- **忽傾模**：諸析只察平穩而稱系穩。傾不穩為被動磁懸之主敗式，需獨析。系可三平向剛度皆正而傾不穩
- **低估抗磁懸之場求**：抗磁磁化率極小（多材 chi_v ~ -10^-5，石墨 -4.5 x 10^-4）。懸毫克物需強梯，非石墨典 B * dB/dz > 1000 T^2/m
- **忽渦流效**：時變場或動導體生渦流，供力與熱。主反饋系中，懸物之渦流生相滯可致控環不穩
- **諸境皆以超導為完抗磁**：二類超導於混態（B_c1 < B < B_c2）有部分磁通穿。懸力依磁化史（磁滯），非瞬場

## 參

- `evaluate-levitation-mechanism` — 擇應用最宜之懸法之比析
- `analyze-magnetic-field` — 此技所需之磁場式詳算
- `formulate-maxwell-equations` — 導控懸系之電磁場方程
- `design-acoustic-levitation` — 比之非磁懸法
- `formulate-quantum-problem` — 超導懸之量子處（BCS、Ginzburg-Landau）
