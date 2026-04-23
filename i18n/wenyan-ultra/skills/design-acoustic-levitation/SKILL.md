---
name: design-acoustic-levitation
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Design an acoustic levitation system that uses standing waves to trap and
  suspend small objects at pressure nodes. Covers ultrasonic transducer
  selection, standing wave formation between a transducer and reflector,
  node spacing and trapping position calculation, acoustic radiation pressure
  analysis, and phased array configurations for multi-axis manipulation.
  Use when designing contactless sample handling for chemistry, biology,
  materials science, or demonstration purposes.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: levitation
  complexity: intermediate
  language: natural
  tags: levitation, acoustic-levitation, standing-waves, ultrasonic, radiation-pressure
---

# 設計聲懸浮

設聲懸系統：以駐波困小物於壓力節。定輻射壓抗重力、選換能反射幾何、計節位+捕強、驗橫軸軸擾穩。

## 用

- 設無接觸樣品持器予化/生/材實驗
- 構教育聲懸演示
- 評給定物可否聲懸（大小、密度、頻率限）
- 擇單軸（換能-反射）或相控陣
- 計給定頻+幾何之節位+捕力
- 擴單軸→相控陣多軸操控

## 入

- **必**：物屬（質、密、半徑或特徵尺、壓縮率若知）
- **必**：目標懸媒（空氣、水、惰氣）含密+聲速
- **可**：可用換能頻（默 40 kHz，愛好者+實驗室常用）
- **可**：換能功率/電壓額
- **可**：期望操控（靜捕抑動態重定位）

## 法

### 一：定物屬+聲對比

表徵物+媒立聲懸可行性：

1. **物參**：記質 m、密 rho_p、半徑 a（非球物以等效球半徑）、體模 K_p（壓縮 kappa_p = 1/K_p）。剛體如金球 K_p 實為無窮。
2. **媒參**：記密 rho_0、聲速 c_0、體模 K_0 = rho_0 * c_0^2 於寄主媒。
3. **聲對比因子**：計 Gor'kov 對比因子定物遷向節或反節：
   - 單極係數：f_1 = 1 - (K_0 / K_p) = 1 - (rho_0 * c_0^2) / (rho_p * c_p^2)
   - 偶極係數：f_2 = 2 * (rho_p - rho_0) / (2 * rho_p + rho_0)
   - 大多固體於空氣，f_1 ~ 1 且 f_2 ~ 1，物困於壓力節（速度反節）。
4. **大小限**：驗物半 a 遠小於聲波長 lambda = c_0 / f。Gor'kov 理需 a << lambda（典型 a < lambda/4）。不滿則需射線聲學或全數值仿真。

```markdown
## Object and Medium Parameters
- **Object**: [material, mass, density, radius, bulk modulus]
- **Medium**: [gas/liquid, rho_0, c_0, K_0]
- **Contrast factors**: f_1 = [value], f_2 = [value]
- **Wavelength**: lambda = [value] at f = [frequency]
- **Size ratio**: a / lambda = [value] (must be << 1)
- **Trapping location**: [pressure node / pressure antinode]
```

**得：** 物+媒完表徵含對比因子計。確物遷向壓力節（空氣中固體典型）。大小限 a << lambda 滿。

**敗：** a / lambda > 0.25→Gor'kov 點粒子理崩。用數值法（有限元聲仿真）或實驗校準。f_1、f_2 反號→物或困於中位而非淨節或反節——需細 Gor'kov 勢圖。

### 二：計所需聲輻射壓

定抗重力所需聲場強：

1. **聲輻射力**：一維駐波於壓節附近小球之時均軸力：
   - F_ax = -(4 * pi / 3) * a^3 * [f_1 * (1 / (2 * rho_0 * c_0^2)) * d(p^2)/dz - (3 * f_2 * rho_0 / 4) * d(v^2)/dz]
   - 平面駐波 p(z,t) = P_0 * cos(kz) * cos(omega*t)，節附近簡為：
   - F_ax = (pi * a^3 * P_0^2 * k) / (3 * rho_0 * c_0^2) * Phi * sin(2kz)
   - 其 Phi = f_1 + (3/2) * f_2 為聲對比因子，k = 2*pi/lambda。
2. **力平衡**：最大輻射力（sin(2kz) = 1，距節 lambda/8）等重力：
   - F_ax_max = (pi * a^3 * P_0^2 * k) / (3 * rho_0 * c_0^2) * Phi = m * g = (4/3) * pi * a^3 * rho_p * g
   - 解所需壓幅：
   - P_0 = sqrt(4 * rho_p * rho_0 * c_0^2 * g / (k * Phi))
3. **聲強**：壓幅→強：I = P_0^2 / (2 * rho_0 * c_0)。與換能額出比。
4. **聲壓級**：以 dB SPL 表：L = 20 * log10(P_0 / 20e-6)。空氣聲懸典需 150-165 dB SPL。

```markdown
## Acoustic Requirements
- **Required pressure amplitude**: P_0 = [value] Pa
- **Required intensity**: I = [value] W/m^2
- **Sound pressure level**: L = [value] dB SPL
- **Safety note**: [hearing protection required if > 120 dB at audible frequencies]
```

**得：** 達懸之最小聲壓幅定量，表以 Pa、W/m^2、dB SPL。所需強可於指定或商用換能器實現。

**敗：** 所需壓幅超可用換能器→減物質或密、用輕材、或換高密媒（如 SF6 重氣增輻射力）。或用多換能器聚焦陣集聲能於捕點。

### 三：設換能-反射幾何

配物硬件以生穩定駐波：

1. **擇換能**：擇頻 f 超聲換能（常：28、40、或 60-80 kHz 壓電換能器）。高頻→小波長+緊捕，但減最大物尺。驗換能可於操作距離生所需 P_0。
2. **反射設計**：置平或凹反射於換能對。反射面當聲硬（高聲阻抗失配）。金或玻璃板於空氣可。凹反射聚聲場增軸壓幅。
3. **腔長**：設換能-反射距 L 為半波長整倍：L = n * lambda/2，n 正整。此於換能+反射間生 n 壓節，間 lambda/2。
4. **節位**：壓節位於距反射面 z_j = (2j - 1) * lambda/4，j = 1, 2, ..., n。腔中近節通常最穩捕點。
5. **共振調**：以微米台調距同監懸力或麥克風聲壓。最優距生最強駐波。

```markdown
## Geometry Design
- **Transducer**: [model, frequency, rated power or SPL]
- **Reflector**: [material, shape (flat/concave), dimensions]
- **Cavity length**: L = [n] x lambda/2 = [value] mm
- **Number of nodes**: [n]
- **Node positions from reflector**: z_1 = [value], z_2 = [value], ...
- **Selected trapping node**: z_[j] = [value]
```

**得：** 完整硬件規範含換能、反射、腔長定。節位計+捕節擇。

**敗：** 無穩駐波（L 不精匹 n * lambda/2 常見）→以 0.1 mm 增調腔長。溫變移 c_0 故移 lambda，需重調。換能束於腔長發散過→加喇叭或波導準直，或減 L。

### 四：計捕勢+恢復力

量化聲捕強+空間範：

1. **Gor'kov 勢**：小球於駐波場之 Gor'kov 勢：
   - U(r) = (4/3) * pi * a^3 * [(f_1 / (2 * rho_0 * c_0^2)) * <p^2> - (3 * f_2 * rho_0 / 4) * <v^2>]
   - <p^2>、<v^2> 為時均壓+速場平方。
   - 物困於 U(r) + m*g*z 之最小（含重力）。
2. **軸恢復力**：捕節附近 F_z 展至一階：
   - F_z ~ -k_z * delta_z，其 k_z = (2 * pi * a^3 * P_0^2 * k^2) / (3 * rho_0 * c_0^2) * Phi
   - 軸自然頻 omega_z = sqrt(k_z / m)。
3. **橫恢復力**：有限寬束橫輻射力由橫強梯度生。高斯束輪廓腰 w：
   - k_r ~ k_z * (a / w)^2（近似，橫勁較軸弱）
   - 橫捕較軸弱；為穩定限因。
4. **捕深**：物逃前最大位移由勢井深定。軸向井深 Delta_U = F_ax_max * lambda / (2 * pi)。若相關表為熱能 k_B * T 倍（微米粒子常相關，毫米物於空氣可略）。

```markdown
## Trapping Analysis
- **Axial stiffness**: k_z = [value] N/m
- **Axial natural frequency**: omega_z / (2*pi) = [value] Hz
- **Lateral stiffness**: k_r = [value] N/m
- **Lateral natural frequency**: omega_r / (2*pi) = [value] Hz
- **Axial well depth**: Delta_U = [value] J = [value] x k_B*T
- **Stiffness ratio**: k_z / k_r = [value] (lateral is weaker)
```

**得：** 軸+橫定量勁值，自然頻計，捕勢井深定。橫勁確正（雖較軸弱）。

**敗：** 橫勁負或可略→物側漂出束。解：用更寬換能（更大束腰）、加橫換能、轉相控陣、或用凹反射生匯聚波前以強橫約束。

### 五：驗擾動穩定

確設計系統可靠捕持物：

1. **重力偏移**：平衡位置較壓節下移 delta_z = m * g / k_z。驗 delta_z << lambda/4（至勢最大距）。若 delta_z 近 lambda/4，物落出捕。
2. **氣流敏感**：估環氣流阻。球 F_drag = 6 * pi * eta * a * v_air（Stokes 阻）。與橫恢復力比：最大可容氣速 v_max = k_r * a / (6 * pi * eta * a) = k_r / (6 * pi * eta)。
3. **聲流**：駐波驅穩循環流（Rayleigh 流）速 v_stream ~ P_0^2 / (4 * rho_0 * c_0^3 * eta) * lambda。此流施阻於懸物。驗流阻小於橫恢復力。
4. **熱效**：聲吸收熱媒，變 c_0 移節位。高強（> 160 dB SPL）估溫升+操作時節漂。
5. **相控陣擴**（若需操控）：動態重定位以相控陣代單換能-反射對。調相對相可連續移壓節位，載困物。相解析定位精：delta_z ~ lambda / (2 * pi * N_phase_bits)。

```markdown
## Stability Verification
| Perturbation | Magnitude | Restoring Force | Margin | Stable? |
|-------------|-----------|----------------|--------|---------|
| Gravity offset | delta_z = [val] | k_z * delta_z | delta_z / (lambda/4) = [val] | [Yes/No] |
| Air currents | v_air = [val] m/s | F_lat = [val] N | F_lat / F_drag = [val] | [Yes/No] |
| Acoustic streaming | v_stream = [val] | F_lat = [val] N | F_lat / F_stream_drag = [val] | [Yes/No] |
| Thermal drift | Delta_T = [val] K | Re-tune interval | [time] | [Acceptable/No] |
```

**得：** 諸擾源量化且示於捕餘量內。重力偏移為 lambda/4 之小分。氣流+流效不壓橫捕。

**敗：** 重偏過大（重物、弱場）→增 P_0 或用高頻（每波長更強梯度）。氣流問題→封懸器於擋風屏。聲流不穩→減驅幅+用最小流渦之反射幾何（如淺凹反射）。

## 驗

- [ ] 物尺滿 a << lambda（Gor'kov 理適用）
- [ ] 聲對比因子計+捕位（節/反節）識
- [ ] 所需壓幅 P_0 計+可於指定硬件達
- [ ] 換能-反射腔長設為 n * lambda/2 含節位計
- [ ] 軸+橫勁皆正
- [ ] 重偏 delta_z 為 lambda/4 之小分
- [ ] 氣流+聲流擾於捕餘量內
- [ ] 高 SPL 安全考量已錄
- [ ] 若用相控陣，相控解+定位精指明

## 忌

- **違小粒子設**：Gor'kov 公式設 a << lambda。物近 lambda/4 尺→點粒子近似崩，實力與 Gor'kov 預可差（幅+方向）。大物用全波仿真。
- **忽橫約束**：多入門處理聚軸（垂）捕力而略弱得多之橫恢復力。實際橫不穩為主失敗模式，尤近上尺限物。
- **忘聲流**：高強駐波常驅穩流。此流於懸物施阻與輻射力爭。流非小效——於高 SPL 可為主不穩影響。
- **溫敏**：空氣聲速約 0.6 m/s 每攝氏度。10 度溫擺波長移約 2%，典型腔內節位移毫米。長時實驗需主動長補償或溫控。
- **混壓節與速節**：壓節為速反節反之亦然。正對比因子固體困於壓節（壓振最小速振最大）。反則困錯位。
- **忽高幅非線性**：約 155-160 dB SPL 上，非線性聲效（諧波生、激波形）顯現減有效捕力較線性理預減。

## 參

- `evaluate-levitation-mechanism`
- `analyze-magnetic-levitation`
- `derive-theoretical-result`
