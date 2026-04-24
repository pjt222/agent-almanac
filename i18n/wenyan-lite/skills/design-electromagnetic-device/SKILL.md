---
name: design-electromagnetic-device
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Design practical electromagnetic devices including electromagnets, DC and
  brushless motors, generators, and transformers by bridging theory to
  application. Use when sizing a solenoid or toroidal electromagnet for a
  target field or force, selecting motor topology and computing torque and
  efficiency, designing a transformer for a given voltage ratio and power
  rating, or analyzing losses from copper resistance, core hysteresis, and
  eddy currents.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: electromagnetism
  complexity: intermediate
  language: natural
  tags: electromagnetism, device-design, motors, generators, transformers, electromagnets
---

# 設計電磁器件

設計實用之電磁器件：先定性能之要求，再擇合宜之形制，據電磁之本原算其諸參數，析其損耗與效率，末以物理之限（熱限、飽和）驗其所成。

## 適用時機

- 為電磁鐵（螺線管或環形）定尺寸，以達目標磁場強度、拉力或吸持力
- 擇電機形制（有刷直流、無刷直流、步進、感應），算其轉矩、轉速、效率
- 為變壓器設計所求之電壓比、功率與頻率
- 析並減損耗：銅損（I^2 R）、鐵芯損（磁滯與渦流）、雜散磁通

## 輸入

- **必要**：器件類別（電磁鐵、電機、發電機或變壓器）
- **必要**：性能要求（磁場強度、拉力、轉矩、電壓比、功率、效率目標）
- **必要**：運行條件（供電電壓與電流、頻率、占空比、環境溫度）
- **選擇**：偏好之鐵芯材料（矽鋼、鐵氧體、粉末鐵、空芯）及其 B-H 數據
- **選擇**：尺寸與重量約束
- **選擇**：成本或製造約束

## 步驟

### 步驟一：定器件要求與運行條件

於擇形制前，須備齊設計目標：

1. **主性能指標**：單一最要之規格
   - 電磁鐵：指定點之 B 場（Tesla），或指定銜鐵之拉力（Newton）
   - 電機：額定轉矩（N.m）於額定轉速（RPM），或額定轉速之功率（Watt）
   - 發電機：於額定機械轉速之輸出電壓（V）、電流（A）、頻率（Hz）
   - 變壓器：原副邊電壓、功率（VA）、運行頻率

2. **次要規格**：效率目標（%）、最大溫升（K）、占空比（連續、間歇或脈衝）、物理包絡（最大直徑、長度、重量）。

3. **供電約束**：可用電壓與電流、頻率（DC 或指定 Hz 之 AC）、波形（正弦、PWM、梯形）。

4. **環境條件**：環境溫度範圍、冷卻方式（自然對流、強制風、液冷）、海拔（影響風冷）、振動與衝擊要求。

```markdown
## Design Requirements
- **Device type**: [electromagnet / motor / generator / transformer]
- **Primary specification**: [value with units]
- **Efficiency target**: [%]
- **Supply**: [voltage, current, frequency]
- **Thermal limit**: [max temperature rise in K]
- **Size constraint**: [dimensions or weight]
- **Duty cycle**: [continuous / intermittent (on-time/off-time) / pulsed]
```

**預期：** 要求齊備且量化，無模糊之規格。每項皆有數值與單位。

**失敗時：** 要求相互矛盾（例如：小體積內要求高轉矩兼高效率）時，須明示此權衡，請設計者排序。電磁器件遵循本原之標度律：力隨體積而增，損耗隨表面積而增，熱限束縛功率密度。

### 步驟二：擇形制

擇最合於要求之器件配置：

1. **電磁鐵形制**：
   - **螺線管（圓柱形）**：繞製易，內部場均勻 B = mu_0 n I（長螺線管）。最宜均勻場之用途。拉力用途設氣隙。
   - **環形**：無外部雜散場（磁通全封於內）。雜散場須壓抑時用之。部分繞線時不如螺線管均勻。
   - **C 形芯 / E 形芯**：小體積中得高力。氣隙聚力。繼電器與吸持磁鐵之常式。
   - **Helmholtz 對**：兩線圈隔一半徑。中央區產生極均勻之場。最宜校準與測量。

2. **電機形制**：
   - **有刷直流**：驅動簡單（加直流電壓），低速轉矩佳。電刷限壽命與轉速。轉矩：T = k_T * I。
   - **無刷直流（BLDC）**：電子換相，轉速與壽命皆勝有刷。梯形或正弦驅動。今世之主流。
   - **步進**：精確開環定位（離散步，常 1.8 或 0.9 度）。連續轉矩不如 BLDC。無反饋之定位最宜。
   - **交流感應**：堅固、無永磁、構造簡。轉速由供電頻率與滑差決定。工業動力應用之主流。

3. **發電機形制**：電機反向運行即是。BLDC 電機反向為 BLDC 發電機（反電動勢為輸出）。感應電機超同步轉速驅動即為感應發電機。小尺度（風、水）多用永磁發電機。

4. **變壓器形制**：
   - **芯式**：繞組繞於矩形芯之一柱。功率變壓器之常式。
   - **殼式**：芯包繞組。磁屏蔽較佳。用於大功率。
   - **環形**：無氣隙、雜散通量低、結構緊湊。繞製成本較高。用於音頻與敏感電子。
   - **平面 / PCB**：繞組即 PCB 走線。扁平。用於高頻開關電源。

```markdown
## Topology Selection
- **Topology chosen**: [specific configuration]
- **Justification**: [why it matches the requirements]
- **Key advantages**: [for this application]
- **Key limitations**: [and mitigation strategy]
- **Alternatives considered**: [and why rejected]
```

**預期：** 形制之擇有據，明繫步驟一之要求，並承認其限制。

**失敗時：** 無現成形制能滿所有要求時，可考慮混合設計（如 Halbach 陣列以少料得高場）或寬次要約束。記錄其權衡。

### 步驟三：算設計參數

據電磁本原算其物理尺寸與電氣參數：

1. **電磁鐵設計參數**：
   - 匝數：N = B * l_core / (mu_0 * mu_r * I)（長 l_core 之螺線管），或由磁路算之：N * I = Phi * R_total（R_total 為總磁阻）
   - 線徑：依所需電流密度 J 擇之（連續工作常 3-6 A/mm^2，間歇可至 15 A/mm^2）。線截面積：A_wire = I / J。
   - 芯截面：A_core = Phi / B_max，B_max 須低於飽和（矽鋼常 1.5-1.8 T，鐵氧體 0.3-0.5 T）
   - 氣隙力：F = B^2 * A_gap / (2 * mu_0)（Maxwell 應力張量之結果）
   - 繞組電阻：R = rho_Cu * N * l_mean_turn / A_wire

2. **電機設計參數**：
   - 轉矩常數：k_T = (2 * B * l * r * N) / (相數)（簡化 BLDC）
   - 反電動勢常數：k_E = k_T（SI 單位，數值相等）
   - 額定電流：I_rated = T_rated / k_T
   - 空載轉速：omega_no_load = V_supply / k_E
   - 繞組電阻由線徑與平均匝長算出

3. **變壓器設計參數**：
   - 匝比：N_1 / N_2 = V_1 / V_2
   - 芯截面：A_core = V_1 / (4.44 * f * N_1 * B_max)（正弦激勵）
   - 原邊匝數：N_1 = V_1 / (4.44 * f * B_max * A_core)
   - 窗口面積：A_window = (N_1 * A_wire1 + N_2 * A_wire2) / k_fill（填充係數 k_fill 常 0.3-0.5）
   - 芯體積：V_core = A_core * l_mean_path

4. **磁路分析**：對有芯有氣隙之器件：
   - 芯磁阻：R_core = l_core / (mu_0 * mu_r * A_core)
   - 氣隙磁阻：R_gap = l_gap / (mu_0 * A_gap)（注意：小氣隙之磁阻遠大於 R_core）
   - 總磁阻：R_total = R_core + R_gap（串聯）或 1/R_total = sum(1/R_i)（並聯）
   - 磁通：Phi = N * I / R_total

```markdown
## Design Parameters
- **Turns**: N = [value] (primary), N_2 = [value] (if applicable)
- **Wire gauge**: AWG [number] (diameter [mm], area [mm^2])
- **Core dimensions**: A_core = [mm^2], l_core = [mm], l_gap = [mm]
- **Core material**: [type], B_max = [T], mu_r = [value]
- **Winding resistance**: R = [Ohms]
- **Operating current**: I = [A], current density J = [A/mm^2]
- **Key performance**: [B-field / torque / voltage ratio = calculated value]
```

**預期：** 所有物理尺寸與電氣參數之數值，皆由電磁公式推出，各步單位俱驗。

**失敗時：** 所需匝數不入繞線空間時，或增芯尺寸（大窗口面積）、或用細線（高電流密度，然熱更大）、或降性能目標。若芯運行高於 B_max，或增芯截面、或增匝數（以加大 NI 積配合大氣隙，減同性能之磁通）。

### 步驟四：析損耗與效率

量化每一損耗機制，算總效率：

1. **銅損（I^2 R）**：
   - P_Cu = I^2 * R_winding（直流電阻損耗）
   - 高頻時須計趨膚效應：線徑大於 2 * delta（趨膚深度）時 R_AC / R_DC 增
   - 多層繞組之鄰近效應進一步增 AC 電阻
   - 減損：頻率高於約 10 kHz 時用 Litz 線（多股細絕緣絞合）

2. **鐵芯損（磁滯 + 渦流）**：
   - 每周期每單位體積之磁滯損：W_h = B-H 回線面積
   - 磁滯功率：P_h = k_h * f * B_max^n * V_core（Steinmetz 方程，n 常 1.6-2.0，k_h 由材料數據）
   - 渦流功率：P_e = k_e * f^2 * B_max^2 * t^2 * V_core（t = 疊片厚度）
   - 合（廣義 Steinmetz）：P_core = k * f^alpha * B_max^beta * V_core（係數取自製造商數據表）
   - 減損：疊片芯（50/60 Hz 常 0.25-0.5 mm，高頻更薄）、>100 kHz 用鐵氧體芯

3. **導體與結構之渦流損**：
   - 雜散磁通於框架、屏蔽、鄰近導體中感應電流
   - 大型變壓器與電機中尤顯
   - 減損：非磁性結構材料、磁屏蔽

4. **機械損**（電機與發電機）：
   - 軸承摩擦：P_friction = T_friction * omega
   - 風阻（轉子之空氣阻力）：P_windage 約與 omega^3 成正比
   - 電刷摩擦（有刷直流電機）：另有磨損相關項

5. **效率算法**：
   - 電磁鐵：效率非主指標；關注給定場/力下之功耗 P = I^2 R
   - 電機：eta = P_mechanical / P_electrical = (T * omega) / (V * I)
   - 發電機：eta = P_electrical / P_mechanical
   - 變壓器：eta = P_out / P_in = P_out / (P_out + P_Cu + P_core)
   - 常見效率：小型電機 60-85%、大型電機 90-97%、變壓器 95-99%

```markdown
## Loss Analysis
| Loss Mechanism | Formula | Value (W) | Fraction of Total |
|---------------|---------|-----------|-------------------|
| Copper (I^2R) | [expression] | [W] | [%] |
| Core hysteresis | [expression] | [W] | [%] |
| Core eddy current | [expression] | [W] | [%] |
| Mechanical (if applicable) | [expression] | [W] | [%] |
| **Total losses** | | [W] | 100% |

- **Efficiency**: eta = [%]
- **Temperature rise estimate**: Delta_T = P_total / (h * A_surface) = [K]
```

**預期：** 損耗分解俱全，每機制皆量化，總效率已算，溫升已估以驗熱可行。

**失敗時：** 效率低於目標時，辨主導之損耗機制而治之：小器件以銅損為主（增線徑或減匝）、高頻以鐵芯損為主（換低損材料或降 B_max）、高速以機械損為主（改進軸承）。溫升超熱限時，增冷卻（強制風、散熱器）或降功率密度。

### 步驟五：驗其合要求與物理限

驗設計已滿所有規格，且物理可成：

1. **性能驗證**：
   - 由最終設計參數重算主性能指標（B、力、轉矩、電壓）
   - 驗其達或超過步驟一之要求
   - 算餘裕：(achieved - required) / required 之百分比

2. **飽和驗證**：
   - 驗芯中之 B_max 低於所選材料之飽和磁通密度
   - 查磁路每段（芯柱、軛、氣隙邊緣擴散）
   - 氣隙區常磁通密度最低；芯之截面最小處磁通密度最高

3. **熱驗證**：
   - 估表面溫度：T_surface = T_ambient + P_total / (h * A_surface)
   - 自然對流：h 約 5-10 W/(m^2.K)
   - 強制風冷：h 約 25-100 W/(m^2.K)
   - 線絕緣等級限：A 級（105 C）、B 級（130 C）、F 級（155 C）、H 級（180 C）
   - 芯 Curie 溫度：矽鋼約 770 C（少為限）、鐵氧體 200-300 C（或為限）

4. **尺寸驗證**：
   - 驗設計入於所定包絡
   - 查繞線入於窗口面積，合假定之填充係數
   - 驗高壓設計之電氣間隙與爬電距離

5. **設計餘裕與敏感度**：
   - 算每一關鍵參數（電流、匝數、氣隙、芯磁導率）+/-10% 變動時主指標之變化
   - 辨最敏感參數——此決定製造公差
   - 有氣隙之設計，氣隙長度幾乎恆為最敏感之參數

```markdown
## Design Validation
| Requirement | Target | Achieved | Margin |
|------------|--------|----------|--------|
| [Primary metric] | [value] | [value] | [%] |
| Efficiency | [%] | [%] | [%] |
| Temperature rise | < [K] | [K] | [K margin] |
| Envelope | [dimensions] | [dimensions] | [fits / exceeds] |

## Sensitivity Analysis
| Parameter | Nominal | +10% Effect on Primary Metric | Most Sensitive? |
|-----------|---------|-------------------------------|----------------|
| Current | [A] | [+/- %] | [Yes/No] |
| Turns | [N] | [+/- %] | [Yes/No] |
| Air gap | [mm] | [+/- %] | [Yes/No] |
| mu_r | [value] | [+/- %] | [Yes/No] |
```

**預期：** 諸要求皆達，餘裕有錄，熱可行已驗，最敏感參數已辨。

**失敗時：** 某要求未達時，迭代調形制（步驟二）、設計參數（步驟三）或減損策略（步驟四）。熱上不可行時，考慮：降占空比、增尺寸（多表面積以冷）、換高溫絕緣等級、或加主動冷卻。每次迭代皆錄。

## 驗證

- [ ] 所有要求皆以數值與單位量化
- [ ] 形制之擇有據，備案有錄
- [ ] 磁路分析完備（磁阻、磁通、NI 積）
- [ ] 線徑擇取合宜電流密度（連續 3-6 A/mm^2，間歇更高）
- [ ] 芯運行低於飽和磁通密度，有餘裕
- [ ] 所有損耗機制皆量化（銅、磁滯、渦流、機械）
- [ ] 效率達規格目標
- [ ] 溫升在絕緣等級限內
- [ ] 設計入物理包絡
- [ ] 敏感度分析辨最嚴公差之參數
- [ ] 設計已備，足以造樣機

## 常見陷阱

- **忽磁路磁阻**：氣隙磁阻於多數實器件中為主（即 1 mm 氣隙之磁阻亦大於 100 mm 矽鋼芯）。無磁路模型之設計所成遠低於預期，因未計氣隙之故。
- **芯於飽和之上運行**：B-H 曲線拐點之上，增量磁導率驟降。電流倍增不致磁通倍增。器件於飽和之上似「停工」。常驗最窄芯截面處之 B_max。
- **銅線截面不足以承熱限**：電流密度限即熱限之別名。10 A/mm^2 之線於自由空氣中數分鐘即過熱。連續工作之設計須低於 5-6 A/mm^2，除非有主動冷卻。
- **忽氣隙邊緣擴散**：磁通於氣隙處向外擴，有效氣隙面積增。氣隙與芯尺寸相當時，邊緣擴散可增有效面積 20-50%。忽之則低估磁通（並高估所需之 NI 積）。
- **高頻用直流電阻**：10 kHz 時銅中趨膚深度約 0.66 mm。線徑大於 1.3 mm 之標準磁線其 AC 電阻遠大於 DC 電阻。高頻設計用 Litz 線或並聯細線。
- **混淆電機常數 k_T 與 k_E 之單位**：轉矩常數 k_T（N.m/A）與反電動勢常數 k_E（V.s/rad）於 SI 單位中數值相等。然 k_E 若以 V/kRPM 表（數據表常用），須換算：k_T [N.m/A] = k_E [V/kRPM] * 60 / (2 * pi * 1000)。

## 相關技能

- `analyze-magnetic-field` -- 由所設電流分佈算 B 場以作詳細場分析
- `solve-electromagnetic-induction` -- 析電機、發電機、變壓器所據之感應原理
- `formulate-maxwell-equations` -- 高頻器件、波導、天線之全電磁分析
- `simulate-cpu-architecture` -- 今世電機控制器與電力電子之數位控制系統
- `analyze-tensegrity-system` -- 張拉-壓縮網絡之結構分析；其預應力平衡法與電磁力平衡相通
