---
name: design-electromagnetic-device
locale: wenyan
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

# 電磁器之設

定性能之要、擇拓撲之式、由電磁根本推算參數、析損耗與效率、驗設計於物理之限（含熱極與飽和），以成電磁實器。

## 用時

- 定螺線管或環形電磁鐵之尺以合目標場強、拉力或持力
- 擇電機拓撲（有刷直流、無刷直流、步進、感應）並算其矩、速、效
- 為定電壓、電流、頻率而設發電機
- 為定變比、容量、頻率而設變壓器
- 析並減損耗：銅損 (I^2 R)、鐵心（磁滯與渦流）、雜散磁通

## 入

- **必要**：器類（電磁鐵、電機、發電機、變壓器）
- **必要**：性能之要（場強、力、矩、變比、功率、效率目標）
- **必要**：工作條件（電源電壓電流、頻率、占空比、環境溫度）
- **可選**：心材之屬（矽鋼、鐵氧體、粉末鐵、空心）及其 B-H 資料
- **可選**：尺寸重量之限
- **可選**：成本或製造之限

## 法

### 第一步：明器之要與工作條件

擇拓撲之前，先定全套設計目標。

1. **首要性能指標**：最重之單一規格：
   - 電磁鐵：定點之 B 場（Tesla），或定樞之拉力（Newton）
   - 電機：額定速（RPM）下之額定矩（N.m），或額定速下之功率（Watt）
   - 發電機：額定機速下之輸出電壓（V）、電流（A）、頻率（Hz）
   - 變壓器：原副邊電壓、容量（VA）、工作頻率

2. **次要規格**：效率目標（%）、高於環境之最大溫升（K）、占空比（連續、間歇、脈衝）、物理包絡（最大徑、長、重）

3. **電源之限**：可用電壓電流、頻率（直流或定 Hz 交流）、波形（正弦、PWM、梯形）

4. **環境條件**：環境溫範圍、散熱方式（自然對流、強制風冷、液冷）、海拔（影響風冷）、振動衝擊之要

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

**得：** 完整、量化之要求，無模糊規格。每要皆具數值與單位。

**敗則：** 若要求相衝（如極小體積中求高矩且高效），須明權衡並請設計者定先後。電磁器遵基本尺度律：力隨體積而升，損耗隨表面積而增，熱限制約功率密度。

### 第二步：擇拓撲

選最合要求之器形：

1. **電磁鐵之拓撲**：
   - **螺線管（柱形）**：易繞，內場均勻 B = mu_0 n I（長螺線管）。宜用於均勻場之處。帶氣隙以作拉力。
   - **環形**：無外雜散場（磁通盡閉）。宜於須抑雜散場時。局部繞線不如螺線管均勻。
   - **C 形／E 形鐵心**：小體積高力。氣隙集中力。繼電器與保持磁鐵之標準。
   - **亥姆霍茲對**：二線圈相距一徑。中央區場極均勻。宜於校準與測量。

2. **電機之拓撲**：
   - **有刷直流**：驅動簡（加直流電壓），低速矩佳。電刷限壽命與轉速。矩：T = k_T * I。
   - **無刷直流（BLDC）**：電子換向，較有刷速高壽長。梯形或正弦驅動。現代應用之主。
   - **步進**：精密開環定位（離散步，常 1.8 或 0.9 度）。連續矩低於 BLDC。宜於無反饋之定位。
   - **交流感應**：堅固、無永磁、構造簡。速由電源頻率與轉差決。工業動力之主。

3. **發電機之拓撲**：電機反行之。BLDC 電機變為 BLDC 發電機（反電動勢即輸出）。感應電機超同步速驅動時成感應發電機。小型（風力、水力）宜永磁發電機。

4. **變壓器之拓撲**：
   - **心式**：繞組於矩形心之單柱。電力變壓器之標準。
   - **殼式**：心包繞組。磁屏蔽更佳。用於高功率。
   - **環形**：無氣隙、雜散通低、結構緊湊。繞製成本高。用於音頻與敏感電子。
   - **平面／PCB**：繞組為 PCB 走線。低矮。用於高頻開關電源。

```markdown
## Topology Selection
- **Topology chosen**: [specific configuration]
- **Justification**: [why it matches the requirements]
- **Key advantages**: [for this application]
- **Key limitations**: [and mitigation strategy]
- **Alternatives considered**: [and why rejected]
```

**得：** 有理之拓撲擇，其理繫於第一步之要，並認其限。

**敗則：** 若無標準拓撲合盡諸要，可考混合設計（如 Halbach 陣列以少材得高場）或鬆次要之限。記其權衡。

### 第三步：算設計參數

由電磁之理推物理尺寸與電參數：

1. **電磁鐵設計參數**：
   - 匝數：長 l_core 之螺線管 N = B * l_core / (mu_0 * mu_r * I)，或由磁路 N * I = Phi * R_total（R_total 為總磁阻）
   - 線徑：依所需電流密度 J 擇（連續 3-6 A/mm^2，間歇可達 15 A/mm^2）。線截面：A_wire = I / J。
   - 心截面：A_core = Phi / B_max，B_max 須低於飽和（矽鋼常 1.5-1.8 T，鐵氧體 0.3-0.5 T）
   - 氣隙力：F = B^2 * A_gap / (2 * mu_0)（Maxwell 應力張量結果）
   - 繞組電阻：R = rho_Cu * N * l_mean_turn / A_wire

2. **電機設計參數**：
   - 矩常數：簡化 BLDC 中 k_T = (2 * B * l * r * N) / (相數)
   - 反電動勢常數：k_E = k_T（SI 單位中數值相同）
   - 額定電流：I_rated = T_rated / k_T
   - 空載速：omega_no_load = V_supply / k_E
   - 繞組電阻由線徑與平均匝長得之

3. **變壓器設計參數**：
   - 匝比：N_1 / N_2 = V_1 / V_2
   - 心截面：A_core = V_1 / (4.44 * f * N_1 * B_max)（正弦激勵）
   - 原邊匝數：N_1 = V_1 / (4.44 * f * B_max * A_core)
   - 窗口面積：A_window = (N_1 * A_wire1 + N_2 * A_wire2) / k_fill（填充係數 k_fill 常 0.3-0.5）
   - 心體積：V_core = A_core * l_mean_path

4. **磁路分析**：含心與氣隙之器：
   - 心磁阻：R_core = l_core / (mu_0 * mu_r * A_core)
   - 氣隙磁阻：R_gap = l_gap / (mu_0 * A_gap)（小隙時遠大於 R_core）
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

**得：** 諸物理尺寸與電參數之數值，皆由電磁方程推得，每步驗單位。

**敗則：** 若所需匝數不容於繞線空間，則增心尺寸（窗口更大）、用細線（電流密度更高但發熱更甚），或降性能目標。若心逾 B_max，則增心截面或加匝（以更大氣隙配更大 NI 積得同性能，減磁通）。

### 第四步：析損耗與效率

量每一損耗機制並算總效率：

1. **銅損 (I^2 R)**：
   - P_Cu = I^2 * R_winding（直流電阻損耗）
   - 高頻時慮集膚效應：線徑 > 2 * delta（集膚深度）時 R_AC / R_DC 增
   - 多層繞組之鄰近效應更增交流電阻
   - 對策：10 kHz 以上用 Litz 線（多股細絕緣線絞合）

2. **鐵心損耗（磁滯 + 渦流）**：
   - 每體積每周期磁滯損：W_h = B-H 環面積
   - 磁滯功率：P_h = k_h * f * B_max^n * V_core（Steinmetz 方程，n 常 1.6-2.0，k_h 由材料資料得之）
   - 渦流功率：P_e = k_e * f^2 * B_max^2 * t^2 * V_core（t 為疊片厚）
   - 合（廣義 Steinmetz）：P_core = k * f^alpha * B_max^beta * V_core（係數由廠商資料表得之）
   - 對策：疊片心（50/60 Hz 常 0.25-0.5 mm，更高頻更薄），>100 kHz 用鐵氧體心

3. **導體與結構之渦流損**：
   - 雜散通感應於機架、屏蔽、附近導體中之電流
   - 於大型變壓器與電機尤顯
   - 對策：非磁性結構材、磁屏蔽

4. **機械損耗**（電機與發電機）：
   - 軸承摩擦：P_friction = T_friction * omega
   - 風阻（轉子之空氣阻力）：P_windage 約正比於 omega^3
   - 電刷摩擦（有刷直流電機）：另含磨損相關項

5. **效率之算**：
   - 電磁鐵：效率非主指標；察功耗 P = I^2 R 於定場或力之下
   - 電機：eta = P_mechanical / P_electrical = (T * omega) / (V * I)
   - 發電機：eta = P_electrical / P_mechanical
   - 變壓器：eta = P_out / P_in = P_out / (P_out + P_Cu + P_core)
   - 常見效率：小型電機 60-85%，大型電機 90-97%，變壓器 95-99%

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

**得：** 完整損耗分解，每機制皆量化，總效率已算，溫升已估以驗熱可行。

**敗則：** 效率低於目標時，識主損耗而治之：小器銅損為主（增線徑或減匝），高頻鐵損為主（換低損心材或降 B_max），高速機械損為主（改軸承）。溫升逾熱限則增散熱（強風、散熱器）或降功率密度。

### 第五步：驗對要求與物理之限

察設計是否合盡諸規，且物理可實：

1. **性能核驗**：
   - 由終設計參數重算首要指標（B、力、矩、電壓）
   - 驗其合或超第一步之要
   - 算餘裕：(achieved - required) / required 為百分比

2. **飽和察**：
   - 驗心中 B_max 低於所擇材料之飽和磁通密度
   - 察磁路各段（心柱、軛、氣隙邊緣）
   - 氣隙區常磁通密度最低；心中截面最小處最高

3. **熱察**：
   - 估表面溫：T_surface = T_ambient + P_total / (h * A_surface)
   - 自然對流：h 約 5-10 W/(m^2.K)
   - 強制風冷：h 約 25-100 W/(m^2.K)
   - 絕緣等級極限：A 級（105 C）、B 級（130 C）、F 級（155 C）、H 級（180 C）
   - 心之居禮溫：矽鋼約 770 C（罕為限），鐵氧體 200-300 C（或為限）

4. **尺寸察**：
   - 驗設計合於所定包絡
   - 察繞組依所設填充係數可容於窗口
   - 高壓設計驗間隙與爬電距

5. **設計餘裕與靈敏度**：
   - 算每關鍵參數 ±10% 變動（電流、匝數、氣隙、心磁導率）對首要指標之影響
   - 識最敏感者——其定製造公差
   - 帶氣隙設計中，隙長幾恆為最敏感

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

**得：** 諸要皆合且有記錄之餘裕，熱可行已證，最敏感之設計參數已識。

**敗則：** 某要未合則迭代：調拓撲（第二步）、設計參數（第三步）或損耗對策（第四步）。若熱不可行，考：降占空比、增尺寸（更大散熱面）、換更高溫等級絕緣，或增主動冷卻。每迭代須記。

## 驗

- [ ] 諸要以數值與單位量化
- [ ] 拓撲擇有據，替代方案已記
- [ ] 磁路分析已畢（磁阻、磁通、NI 積）
- [ ] 線徑擇於可接電流密度（連續 3-6 A/mm^2，間歇更高）
- [ ] 心運行低於飽和磁通密度且有餘
- [ ] 諸損耗機制皆量化（銅、磁滯、渦流、機械）
- [ ] 效率合目標規格
- [ ] 溫升在絕緣等級限內
- [ ] 設計合於物理包絡
- [ ] 靈敏度分析識出最嚴公差之參數
- [ ] 設計已足詳以造樣機

## 陷

- **略磁路磁阻**：實器中氣隙磁阻常為主（即 1 mm 隙已勝 100 mm 矽鋼心之磁阻）。無磁路模型而設，器性遠遜於預期，因隙未計。
- **運於飽和之上**：B-H 曲線拐點之後，增量磁導率驟降。倍增電流不倍增磁通。飽和之上器似「不動」。恆察心中最窄截面之 B_max。
- **銅小於熱限**：電流密度限實為熱限。10 A/mm^2 空氣中線分鐘內過熱。連續運行須守 5-6 A/mm^2 之下，除非有主動冷卻。
- **略氣隙邊緣通**：磁通於氣隙處散開，增有效隙面積。隙與心尺相當時，邊緣效應可增有效面積 20-50%。略之則低估磁通（且高估所需 NI 積）。
- **高頻用直流電阻**：10 kHz 時銅中集膚深度約 0.66 mm。徑逾 1.3 mm 之標準漆包線其交流電阻顯高於直流。高頻設計用 Litz 線或並聯細股。
- **混淆電機 k_T 與 k_E 單位**：矩常數 k_T (N.m/A) 與反電動勢常數 k_E (V.s/rad) 於 SI 單位中數值相等。然 k_E 以 V/kRPM 示（常見於資料表）則須換算：k_T [N.m/A] = k_E [V/kRPM] * 60 / (2 * pi * 1000)。

## 參

- `analyze-magnetic-field` — 由所設計電流分佈算 B 場以作詳場分析
- `solve-electromagnetic-induction` — 析電機、發電機、變壓器之感應之理
- `formulate-maxwell-equations` — 高頻器、波導、天線之全電磁分析
- `simulate-cpu-architecture` — 驅現代電機控制器與電力電子之數字控制系統
- `analyze-tensegrity-system` — 張拉—壓縮網之結構分析；其預應力平衡法與電磁力平衡相通
