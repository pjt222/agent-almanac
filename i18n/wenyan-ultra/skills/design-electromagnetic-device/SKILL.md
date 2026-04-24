---
name: design-electromagnetic-device
locale: wenyan-ultra
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

# 設電磁器

立效需→擇式→算參→析耗→驗度熱飽之限。

## 用

- 量電磁鐵（筒或環）為場、吸力、持力
- 擇馬達式（DC 刷、BLDC、步進、感應）算矩、速、效
- 設發電機為定壓、流、頻
- 設變壓器為定比、功、頻
- 析並減耗：銅（I^2 R）、芯（磁滯、渦流）、漏通

## 入

- **必**：器類（磁鐵、馬達、發電、變壓）
- **必**：效需（場強、力、矩、壓比、功、效標）
- **必**：運條（壓、流、頻、占比、環溫）
- **可**：芯材偏好（矽鋼、鐵氧、粉鐵、空芯）+ B-H 數
- **可**：體積、重之限
- **可**：價、造之限

## 行

### 一：立需與運條

擇式前盡定設計標：

1. **首效量**：一最要之需：
   - 磁鐵：定點之 B（Tesla）或吸力（Newton）
   - 馬達：額矩（N.m）、額速（RPM）或功（W）
   - 發電：額速下之壓（V）、流（A）、頻（Hz）
   - 變壓：原次壓、功（VA）、運頻

2. **次需**：效標（%）、環之上溫升（K）、占比（連續、斷續、脈衝）、體（徑、長、重）。

3. **源限**：可得之壓、流、頻（DC 或 AC 定 Hz）、波形（正弦、PWM、梯形）。

4. **境條**：環溫域、冷法（自對流、強風、液）、海拔（影風冷）、震擊求。

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

得：諸需皆有量值與單位，無含糊。

敗：需相衝（如小體大矩高效）→明指權衡請設計者排序。電磁器遵基本縮放律：力隨體、耗隨面、熱限囿功密。

### 二：擇式

選合需之器構：

1. **磁鐵諸式**：
   - **筒（柱）**：簡捲，內均場 B = mu_0 n I（長筒）。宜均場用。氣隙則為吸用。
   - **環**：無外漏場（通盡含）。宜需減漏場。部捲則不如筒均。
   - **C 芯／E 芯**：小體高力。隙聚力。繼電及持磁之標。
   - **Helmholtz 對**：二圈隔一徑。中心域極均場。宜校驗及測。

2. **馬達諸式**：
   - **DC 刷**：驅簡（加 DC 壓），低速矩佳。刷限壽、速。矩：T = k_T * I。
   - **BLDC**：電子換相，壽速勝刷。梯形或正弦驅。今之主。
   - **步進**：精確開迴定位（離散步，常 1.8 或 0.9 度）。連矩遜 BLDC。宜無反饋之位。
   - **AC 感應**：堅，無永磁，構簡。速依源頻與滑。工業之主。

3. **發電諸式**：馬達逆用。BLDC 馬達→BLDC 發電（反電動勢為出）。感應馬達超同步速→感應發電。小規模（風、水）偏永磁發電。

4. **變壓器諸式**：
   - **芯式**：捲在矩芯一肢。電力變壓之標。
   - **殼式**：芯圍捲。磁蔽勝。高功用。
   - **環式**：無隙、低漏、緊湊。捲價高。音及靈敏電用。
   - **Planar／PCB**：捲為 PCB 跡。低輪廓。高頻開關電源用。

```markdown
## Topology Selection
- **Topology chosen**: [specific configuration]
- **Justification**: [why it matches the requirements]
- **Key advantages**: [for this application]
- **Key limitations**: [and mitigation strategy]
- **Alternatives considered**: [and why rejected]
```

得：繫步一之需而證之擇，含承認限。

敗：無標式合諸需→考混式（如 Halbach 列，少材高場）或鬆次限。書權衡。

### 三：算設計參

由電磁原理算體尺及電參：

1. **磁鐵參**：
   - 匝：N = B * l_core / (mu_0 * mu_r * I)（筒長 l_core），或由磁路：N * I = Phi * R_total
   - 線規：選合流密 J（連續 3-6 A/mm^2，斷續至 15 A/mm^2）。線截 A_wire = I / J。
   - 芯截：A_core = Phi / B_max，B_max 在飽和下（矽鋼 1.5-1.8 T，鐵氧 0.3-0.5 T）
   - 隙吸力：F = B^2 * A_gap / (2 * mu_0)（Maxwell 應力張量）
   - 捲阻：R = rho_Cu * N * l_mean_turn / A_wire

2. **馬達參**：
   - 矩常：k_T = (2 * B * l * r * N) / （相數）（簡化 BLDC）
   - 反電動勢常：k_E = k_T（SI 中同值）
   - 額流：I_rated = T_rated / k_T
   - 空載速：omega_no_load = V_supply / k_E
   - 捲阻由線規及均匝長

3. **變壓器參**：
   - 匝比：N_1 / N_2 = V_1 / V_2
   - 芯截：A_core = V_1 / (4.44 * f * N_1 * B_max)（正弦激）
   - 原匝：N_1 = V_1 / (4.44 * f * B_max * A_core)
   - 窗面：A_window = (N_1 * A_wire1 + N_2 * A_wire2) / k_fill（k_fill 常 0.3-0.5）
   - 芯體：V_core = A_core * l_mean_path

4. **磁路析**：含芯與隙之器：
   - 芯磁阻：R_core = l_core / (mu_0 * mu_r * A_core)
   - 隙磁阻：R_gap = l_gap / (mu_0 * A_gap)（小隙遠大於 R_core）
   - 總磁阻：R_total = R_core + R_gap（串）或 1/R_total = sum(1/R_i)（並）
   - 通：Phi = N * I / R_total

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

得：諸體尺及電參有量值，由電磁式推，每步查單位。

敗：所需匝不容於捲空→增芯（大窗）、細線（高密增熱）、減效標。芯超 B_max→增芯截或加匝。

### 四：析耗與效

量諸耗機並算總效：

1. **銅耗（I^2 R）**：
   - P_Cu = I^2 * R_winding（DC 阻耗）
   - 高頻宜計趨膚：R_AC / R_DC 增（線徑 > 2 * delta）
   - 多層捲之臨近效進增 AC 阻
   - 減：用 Litz 線（細絕線絞）於 > ~10 kHz

2. **芯耗（磁滯+渦流）**：
   - 單位體每週磁滯耗：W_h = B-H 環面
   - 磁滯功：P_h = k_h * f * B_max^n * V_core（Steinmetz，n 常 1.6-2.0）
   - 渦流功：P_e = k_e * f^2 * B_max^2 * t^2 * V_core（t = 疊片厚）
   - 合（廣義 Steinmetz）：P_core = k * f^alpha * B_max^beta * V_core
   - 減：疊芯（50/60 Hz 常 0.25-0.5 mm，高頻更薄）、> 100 kHz 鐵氧芯

3. **體構渦流耗**：
   - 漏通感生框、蔽、臨導之流
   - 尤大變壓、機之患
   - 減：非磁之體材、磁蔽

4. **機械耗**（馬達、發電）：
   - 軸承摩：P_friction = T_friction * omega
   - 風耗（轉子空阻）：P_windage 近 omega^3
   - 刷摩（DC 刷）：磨損依項

5. **算效**：
   - 磁鐵：效非主量；注功耗 P = I^2 R 於定場／力
   - 馬達：eta = P_mechanical / P_electrical = (T * omega) / (V * I)
   - 發電：eta = P_electrical / P_mechanical
   - 變壓：eta = P_out / P_in = P_out / (P_out + P_Cu + P_core)
   - 常效：小馬達 60-85%，大馬達 90-97%，變壓器 95-99%

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

得：諸耗機皆量，總效已算，溫升估以驗熱可行。

敗：效低標→識主耗：銅主於小器（增線或減匝），芯主於高頻（換低耗芯材或減 B_max），機主於高速（改軸承）。溫升超限→增冷（風、散熱）或減功密。

### 五：對需及實限驗

驗計合諸需且體可成：

1. **效驗**：
   - 由末設計參重算首量（B、力、矩、壓）
   - 驗符或超步一之需
   - 算裕：(達-求)/求 為百分比

2. **飽和查**：
   - 驗芯之 B_max 在所擇材之飽通密下
   - 查磁路各段（芯肢、軛、隙外展）
   - 隙常最低通密；最小截之芯段最高

3. **熱查**：
   - 估面溫：T_surface = T_ambient + P_total / (h * A_surface)
   - 自對流：h 近 5-10 W/(m^2.K)
   - 強風：h 近 25-100 W/(m^2.K)
   - 線絕緣級限：A（105 C）、B（130 C）、F（155 C）、H（180 C）
   - 芯 Curie 溫：矽鋼 ~770 C（罕為限）、鐵氧 ~200-300 C（可為限）

4. **尺查**：
   - 驗計合於所定體
   - 查捲合於窗面及假填因
   - 查高壓之隙、爬電距

5. **裕及敏**：
   - 算各關鍵參（流、匝、隙、芯磁導）+/-10% 對首量之變
   - 識最敏之參→主造公差
   - 含隙之設計，隙長幾皆最敏

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

得：諸需有書裕而符，熱可行已證，最敏參已識。

敗：需不符→調式（二）、參（三）、減耗策（四）迭代。熱不可行→減占比、增體（多面冷）、升絕緣級、加主動冷。書每迭。

## 驗

- [ ] 諸需有量值與單位
- [ ] 擇式有證且記諸可替
- [ ] 磁路析全（磁阻、通、NI 積）
- [ ] 線規為合流密（連續 3-6 A/mm^2，斷續更高）
- [ ] 芯在飽通密下有裕
- [ ] 諸耗機皆量（銅、磁滯、渦流、機械）
- [ ] 效符標
- [ ] 溫升在絕緣級限內
- [ ] 計合於體
- [ ] 敏析識最緊公差之參
- [ ] 計全足以造樣

## 忌

- **略磁路磁阻**：實用器隙磁阻常主（1 mm 隙磁阻勝 100 mm 矽鋼芯）→無磁路模計之器遠遜望
- **超芯飽運行**：B-H 膝上增量磁導劇降→倍流不倍通→器「似停」→常查最窄芯截之 B_max
- **銅線過細致熱**：流密限乃熱限偽裝→10 A/mm^2 空中之線數分鐘過熱→連續運行宜在 5-6 A/mm^2 下，除非主動冷
- **略隙外展通**：通外展增效隙面→隙可比芯尺時外展可增 20-50%→略外展則低估通（高估 NI 積）
- **高頻用 DC 阻**：10 kHz 銅趨膚深約 0.66 mm→ > 1.3 mm 徑之磁線 AC 阻遠勝 DC 阻→高頻用 Litz 或並聯細絞
- **馬達常 k_T 與 k_E 之單位惑**：SI 中 k_T (N.m/A) 與 k_E (V.s/rad) 同值。k_E 若為 V/kRPM（數據表常）→換算：k_T [N.m/A] = k_E [V/kRPM] * 60 / (2 * pi * 1000)

## 參

- `analyze-magnetic-field`
- `solve-electromagnetic-induction`
- `formulate-maxwell-equations`
- `simulate-cpu-architecture`
- `analyze-tensegrity-system`
