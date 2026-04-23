---
name: design-acoustic-levitation
locale: wenyan
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

# 設聲懸浮

設並驗聲懸浮系統：算平重所需之聲輻射壓、擇換能與反射之幾何以成穩駐波、計壓節位與捕強、察橫軸擾下所捕物之穩。

## 用時

- 為化或生實驗設無觸樣品持
- 為教或普建聲懸浮示
- 察某物可否聲浮（尺、密、頻之約）
- 於單軸（換能—反射）與相控陣配之擇
- 為給頻與幾何計節位與捕力
- 以相控陣擴單軸懸浮至多軸操

## 入

- **必要**：物性（質、密、徑或特長、若知則可壓縮）
- **必要**：懸浮介質（空氣、水、惰氣）之密與聲速
- **可選**：可用換能頻（默：40 kHz，業餘與實驗常用）
- **可選**：換能功率或電壓等
- **可選**：所求操能（唯靜捕，或動重位）

## 法

### 第一步：定物性與聲對比

刻物與介以立聲浮可行之基：

1. **物參**：錄質 m、密 rho_p、徑 a（非球物用等效球徑）、體模 K_p（可壓縮 kappa_p = 1/K_p）。剛物如金球，K_p 效無限。
2. **介參**：錄主介之密 rho_0、聲速 c_0、體模 K_0 = rho_0 * c_0^2。
3. **聲對比因子**：算 Gor'kov 對比因，定物趨節或腹：
   - 單極係：f_1 = 1 - (K_0 / K_p) = 1 - (rho_0 * c_0^2) / (rho_p * c_p^2)
   - 偶極係：f_2 = 2 * (rho_p - rho_0) / (2 * rho_p + rho_0)
   - 空氣中多固物 f_1 ~ 1 且 f_2 ~ 1，故物捕於壓節（速腹）。
4. **尺約**：驗物徑 a 遠小於聲波長 lambda = c_0 / f。Gor'kov 論需 a << lambda（典 a < lambda/4）。不滿則需光線聲學或全數值模擬。

```markdown
## Object and Medium Parameters
- **Object**: [material, mass, density, radius, bulk modulus]
- **Medium**: [gas/liquid, rho_0, c_0, K_0]
- **Contrast factors**: f_1 = [value], f_2 = [value]
- **Wavelength**: lambda = [value] at f = [frequency]
- **Size ratio**: a / lambda = [value] (must be << 1)
- **Trapping location**: [pressure node / pressure antinode]
```

**得：** 物與介之全刻，對比因已算。證物趨壓節（空氣中固物之典）。a << lambda 之約滿。

**敗則：** 若 a / lambda > 0.25，Gor'kov 點粒論破。用數值法（有限元聲學）或實測替。若 f_1 與 f_2 異號，物或捕於中位而非潔之節或腹——需細繪 Gor'kov 勢。

### 第二步：算所需聲輻射壓

定平重所需之聲場強：

1. **聲輻射力**：於一維駐波壓節之小球，時均軸力為：
   - F_ax = -(4 * pi / 3) * a^3 * [f_1 * (1 / (2 * rho_0 * c_0^2)) * d(p^2)/dz - (3 * f_2 * rho_0 / 4) * d(v^2)/dz]
   - 平面駐波 p(z,t) = P_0 * cos(kz) * cos(omega*t) 中於節近化為：
   - F_ax = (pi * a^3 * P_0^2 * k) / (3 * rho_0 * c_0^2) * Phi * sin(2kz)
   - 其中 Phi = f_1 + (3/2) * f_2 為聲對比因，k = 2*pi/lambda。
2. **力平衡**：設最大輻射力（sin(2kz) = 1 之處，距節 lambda/8）等重：
   - F_ax_max = (pi * a^3 * P_0^2 * k) / (3 * rho_0 * c_0^2) * Phi = m * g = (4/3) * pi * a^3 * rho_p * g
   - 解所需壓幅：
   - P_0 = sqrt(4 * rho_p * rho_0 * c_0^2 * g / (k * Phi))
3. **聲強**：壓幅轉強：I = P_0^2 / (2 * rho_0 * c_0)。與換能額出比。
4. **聲壓級**：表以 dB SPL：L = 20 * log10(P_0 / 20e-6)。空中典聲浮需 150-165 dB SPL。

```markdown
## Acoustic Requirements
- **Required pressure amplitude**: P_0 = [value] Pa
- **Required intensity**: I = [value] W/m^2
- **Sound pressure level**: L = [value] dB SPL
- **Safety note**: [hearing protection required if > 120 dB at audible frequencies]
```

**得：** 聲浮所需最低壓幅之量定，表以 Pa、W/m^2、dB SPL。所求強宜以特或市售換能達。

**敗則：** 若所需壓幅超可用換能所生，減物質密、用輕材，或換高密介（如 SF6 以增輻射力）。或以聚焦陣多換能聚聲能於捕點。

### 第三步：設換能—反射幾何

配硬以生穩駐波：

1. **擇換能**：擇頻 f 之超聲換能（常：28 kHz、40 kHz、60-80 kHz 壓電）。頻高波長小捕緊，然減物尺上限。驗換能於工距生所需 P_0。
2. **反射設**：於換能對置平或凹反射。反射面宜聲硬（與介聲阻大失匹）。空中金或玻璃板可。凹反射聚場增軸壓幅。
3. **腔長**：設換能—反射距 L 為半波之整倍：L = n * lambda/2，n 為正整。此於換能與反射間成 n 壓節，間隔 lambda/2。
4. **節位**：壓節位於距反射面 z_j = (2j - 1) * lambda/4，j = 1, 2, ..., n。近腔中之節常最穩。
5. **共振調**：以測微臺微調 L，同以麥克風或懸力察聲壓。最佳距生最強駐波。

```markdown
## Geometry Design
- **Transducer**: [model, frequency, rated power or SPL]
- **Reflector**: [material, shape (flat/concave), dimensions]
- **Cavity length**: L = [n] x lambda/2 = [value] mm
- **Number of nodes**: [n]
- **Node positions from reflector**: z_1 = [value], z_2 = [value], ...
- **Selected trapping node**: z_[j] = [value]
```

**得：** 全硬規，換能、反射、腔長皆定。節位已算，捕節已擇。

**敗則：** 若無穩駐波（L 非精 n * lambda/2 常見），以 0.1 mm 步調腔長。溫變移 c_0 與 lambda，需重調。若換能束散過甚於腔長，加喇叭或波導以準直，或減 L。

### 第四步：算捕勢與復位力

量聲阱之強與空間延：

1. **Gor'kov 勢**：駐波場中小球之 Gor'kov 勢：
   - U(r) = (4/3) * pi * a^3 * [(f_1 / (2 * rho_0 * c_0^2)) * <p^2> - (3 * f_2 * rho_0 / 4) * <v^2>]
   - <p^2> 與 <v^2> 為時均壓與速平方場。
   - 物捕於 U(r) + m*g*z 之極小（含重）。
2. **軸復位力**：於捕節近展 F_z 至一階：
   - F_z ~ -k_z * delta_z，k_z = (2 * pi * a^3 * P_0^2 * k^2) / (3 * rho_0 * c_0^2) * Phi
   - 軸本頻 omega_z = sqrt(k_z / m)。
3. **橫復位力**：有限寬束中橫輻射力由橫向強梯度生。對腰 w 之高斯束：
   - k_r ~ k_z * (a / w)^2（近，橫剛弱於軸）
   - 橫捕弱於軸；此為穩之限因。
4. **捕深**：物脫阱之最大位移由勢井深定。軸向井深 Delta_U = F_ax_max * lambda / (2 * pi)。若適可表為熱能 k_B * T 之倍（微米粒恒相關，毫米物於空中可忽）。

```markdown
## Trapping Analysis
- **Axial stiffness**: k_z = [value] N/m
- **Axial natural frequency**: omega_z / (2*pi) = [value] Hz
- **Lateral stiffness**: k_r = [value] N/m
- **Lateral natural frequency**: omega_r / (2*pi) = [value] Hz
- **Axial well depth**: Delta_U = [value] J = [value] x k_B*T
- **Stiffness ratio**: k_z / k_r = [value] (lateral is weaker)
```

**得：** 軸橫方向皆有定量剛值，本頻已算，捕勢井深已定。證橫剛為正（雖弱於軸）。

**敗則：** 若橫剛負或微小，物橫漂出束。解含：用寬換能（大束腰）、加橫換能、轉相控陣、或用凹反射成匯聚波前以強橫限。

### 第五步：驗擾下之穩

證所設系統可靠捕持物：

1. **重偏**：平衡位於壓節下偏 delta_z = m * g / k_z。驗 delta_z << lambda/4（勢峰距）。若 delta_z 近 lambda/4，物落阱。
2. **氣流感**：估環境氣流拖力。球用 F_drag = 6 * pi * eta * a * v_air（Stokes 拖）。與橫復位力比：最大可容氣速 v_max = k_r * a / (6 * pi * eta * a) = k_r / (6 * pi * eta)。
3. **聲流**：駐波驅穩循流（Rayleigh 流）速 v_stream ~ P_0^2 / (4 * rho_0 * c_0^3 * eta) * lambda。流於懸物施拖。驗流拖小於橫復位力。
4. **熱效**：聲吸熱介，變 c_0 而移節位。高強運（> 160 dB SPL）估溫升與工時節漂。
5. **相控陣擴**（若需操）：動重位以相控陣換能替單對。調相位則節位連動，攜所捕物。相位分辨定位精：delta_z ~ lambda / (2 * pi * N_phase_bits)。

```markdown
## Stability Verification
| Perturbation | Magnitude | Restoring Force | Margin | Stable? |
|-------------|-----------|----------------|--------|---------|
| Gravity offset | delta_z = [val] | k_z * delta_z | delta_z / (lambda/4) = [val] | [Yes/No] |
| Air currents | v_air = [val] m/s | F_lat = [val] N | F_lat / F_drag = [val] | [Yes/No] |
| Acoustic streaming | v_stream = [val] | F_lat = [val] N | F_lat / F_stream_drag = [val] | [Yes/No] |
| Thermal drift | Delta_T = [val] K | Re-tune interval | [time] | [Acceptable/No] |
```

**得：** 諸擾源已量且證於捕邊內。重偏為 lambda/4 之小部。氣流與流效不壓橫阱。

**敗則：** 若重偏過大（物重、場弱），增 P_0 或用高頻（每波長更強梯度）。若氣流擾，以氣罩圍懸浮器。若聲流擾物，減驅幅，用反射形減流渦（如淺凹反射）。

## 驗

- [ ] 物尺滿 a << lambda（Gor'kov 論可施）
- [ ] 聲對比因已算且捕位（節/腹）已識
- [ ] 所需壓幅 P_0 已算且可以特硬達
- [ ] 換能—反射腔長設為 n * lambda/2，節位已算
- [ ] 軸橫剛皆為正
- [ ] 重偏 delta_z 為 lambda/4 之小部
- [ ] 氣流與聲流擾皆於捕邊內
- [ ] 高 SPL 運之安考已錄
- [ ] 若用相控陣，相控分辨與定位精已定

## 陷

- **違小粒假**：Gor'kov 輻射力式假 a << lambda。物近 lambda/4 則點粒近破，實力（幅與向）或與 Gor'kov 預大異。大物用全波模擬。
- **忽橫限**：入門多聚軸（垂）捕而忽弱之橫復位力。實際橫不穩為首敗式，尤物近尺上限時。
- **忘聲流**：高強駐波恒驅穩流。此於懸物施拖與輻射力爭。流非小效——高 SPL 下或為主失穩影響。
- **溫敏**：空中聲速每攝氏度約變 0.6 m/s。十度溫擺，波長移約 2%，於典腔節位移毫米。久運實驗需主動長補或溫控。
- **混壓節與速節**：壓節為速腹，反之亦然。正對比因之固物捕於壓節（壓振最小、速振最大）。反之則捕於誤位。
- **忽高幅非線**：約 155-160 dB SPL 以上，非線聲效（諧波生、激波成）顯著，減實捕力較線性預減。

## Related Skills

- `evaluate-levitation-mechanism` -- 聲懸浮與磁、靜電、氣動諸替之比
- `analyze-magnetic-levitation` -- 供比之磁懸浮析
- `derive-theoretical-result` -- 由第一原理推聲輻射壓
