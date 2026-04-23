---
name: design-acoustic-levitation
locale: wenyan-lite
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

# Design Acoustic Levitation

設計並驗證聲懸浮系統：定平衡重力所需之聲輻射壓，擇換能器與反射器幾何以形成穩定駐波，計算壓力節之位置與捕獲強度，並驗捕獲之物於側向與軸向擾動下穩定。

## 適用時機

- 為化學或生物實驗設計無接觸樣品座
- 建教育或推廣用之聲懸浮演示器
- 評定物可否聲懸浮（大小、密度與頻率之限）
- 於單軸（換能器-反射器）與相控陣列配置間擇之
- 為既定換能器頻率與幾何計算節位置與捕獲力
- 以相控陣列擴展單軸懸浮器至多軸操控

## 輸入

- **必需**：物之性質（質量、密度、半徑或特徵尺寸，若知則壓縮率）
- **必需**：目標懸浮介質（空氣、水、惰性氣體）及其密度與聲速
- **可選**：可用之換能器頻率（預設 40 kHz，業餘與實驗室系統常見）
- **可選**：換能器功率或電壓額定
- **可選**：所欲之操控能力（僅靜態捕獲，或動態重定位）

## 步驟

### 步驟一：定物之性質與聲學對比

表徵物與介質，以立聲懸浮之基本可行性：

1. **物參數**：記質量 m、密度 rho_p、半徑 a（或非球形物之等效球半徑）、體積模量 K_p（壓縮率 kappa_p = 1/K_p）。金屬球等剛體，K_p 實為無窮。
2. **介質參數**：記宿主介質之密度 rho_0、聲速 c_0、體積模量 K_0 = rho_0 * c_0^2。
3. **聲學對比因子**：算 Gor'kov 對比因子，其決定物是遷至壓力節抑或波腹：
   - 單極係數：f_1 = 1 - (K_0 / K_p) = 1 - (rho_0 * c_0^2) / (rho_p * c_p^2)
   - 偶極係數：f_2 = 2 * (rho_p - rho_0) / (2 * rho_p + rho_0)
   - 空氣中多數固體，f_1 ~ 1 而 f_2 ~ 1，故物捕於壓力節（速度波腹）。
4. **大小之限**：驗物半徑 a 遠小於聲波長 lambda = c_0 / f。Gor'kov 理論需 a << lambda（通常 a < lambda/4）。若此條件不滿足，需射線聲學或完整數值模擬。

```markdown
## Object and Medium Parameters
- **Object**: [material, mass, density, radius, bulk modulus]
- **Medium**: [gas/liquid, rho_0, c_0, K_0]
- **Contrast factors**: f_1 = [value], f_2 = [value]
- **Wavelength**: lambda = [value] at f = [frequency]
- **Size ratio**: a / lambda = [value] (must be << 1)
- **Trapping location**: [pressure node / pressure antinode]
```

**預期：** 完整表徵物與介質，算出對比因子。物應確認遷向壓力節（空氣中固體之典型情況）。大小之限 a << lambda 已滿足。

**失敗時：** 若 a / lambda > 0.25，Gor'kov 點粒子理論崩潰。改用數值方法（有限元聲學模擬）或實驗校準。若 f_1 與 f_2 符號相反，物可能捕於中間位置而非純節或波腹——此需謹慎之 Gor'kov 勢映射。

### 步驟二：算所需之聲輻射壓

定平衡重力所需之聲場強度：

1. **聲輻射力**：一維駐波中壓力節之小球，時均軸向力為：
   - F_ax = -(4 * pi / 3) * a^3 * [f_1 * (1 / (2 * rho_0 * c_0^2)) * d(p^2)/dz - (3 * f_2 * rho_0 / 4) * d(v^2)/dz]
   - 平面駐波 p(z,t) = P_0 * cos(kz) * cos(omega*t) 中，節近處簡為：
   - F_ax = (pi * a^3 * P_0^2 * k) / (3 * rho_0 * c_0^2) * Phi * sin(2kz)
   - 其中 Phi = f_1 + (3/2) * f_2 為聲學對比因子，k = 2*pi/lambda。
2. **力之平衡**：設最大輻射力（sin(2kz) = 1 時，即於節外 lambda/8 處）等於重力：
   - F_ax_max = (pi * a^3 * P_0^2 * k) / (3 * rho_0 * c_0^2) * Phi = m * g = (4/3) * pi * a^3 * rho_p * g
   - 解所需之壓力振幅：
   - P_0 = sqrt(4 * rho_p * rho_0 * c_0^2 * g / (k * Phi))
3. **聲強**：轉壓力振幅為強度：I = P_0^2 / (2 * rho_0 * c_0)。與換能器額定輸出比之。
4. **聲壓級**：以 dB SPL 表：L = 20 * log10(P_0 / 20e-6)。空氣中典型聲懸浮需 150-165 dB SPL。

```markdown
## Acoustic Requirements
- **Required pressure amplitude**: P_0 = [value] Pa
- **Required intensity**: I = [value] W/m^2
- **Sound pressure level**: L = [value] dB SPL
- **Safety note**: [hearing protection required if > 120 dB at audible frequencies]
```

**預期：** 最小聲壓振幅之定量決定，以 Pa、W/m^2、dB SPL 表之，以達懸浮。所需強度宜可由所定或市售換能器達成。

**失敗時：** 若所需壓力振幅超可用換能器所能產生者，減物質量或密度，用較輕之材，或換至密度較高之介質（如於 SF6 等稠氣中懸浮以增輻射力）。或用多換能器於聚焦陣列中以集聲能於捕獲點。

### 步驟三：設計換能器-反射器幾何

配物理硬體以生穩定駐波：

1. **換能器擇選**：擇頻率 f 之超聲波換能器（常見：28 kHz、40 kHz 或 60-80 kHz 之壓電換能器）。頻率高則波長小、捕獲緊，然最大物之大小減。驗換能器於操作距離上可生所需之 P_0。
2. **反射器設計**：置平面或凹面反射器於換能器對面。反射器表面應聲學硬（與介質之聲阻抗不匹大）。空氣中金屬或玻璃板皆佳。凹面反射器集聲場，增軸上壓力振幅。
3. **腔長**：設換能器-反射器距 L 為半波長之整數倍：L = n * lambda/2，n 為正整數。此於換能器與反射器間造 n 個壓力節，每隔 lambda/2。
4. **節位置**：壓力節位於 z_j = (2j - 1) * lambda/4 處（自反射器表面量），j = 1, 2, ..., n。近腔中心之節通常為最穩定之捕獲點。
5. **共振調諧**：以千分尺台調換能器-反射器距以細調 L，同時以麥克風監懸浮力或聲壓。最優距生最強駐波。

```markdown
## Geometry Design
- **Transducer**: [model, frequency, rated power or SPL]
- **Reflector**: [material, shape (flat/concave), dimensions]
- **Cavity length**: L = [n] x lambda/2 = [value] mm
- **Number of nodes**: [n]
- **Node positions from reflector**: z_1 = [value], z_2 = [value], ...
- **Selected trapping node**: z_[j] = [value]
```

**預期：** 完整硬體規格，定換能器、反射器、腔長。算出節位置，擇捕獲節。

**失敗時：** 若無穩駐波形成（常因 L 非精確為 n * lambda/2），以 0.1 mm 之增量調腔長。溫變移 c_0 進而移 lambda，須重調。若換能器波束於腔長內過發散，加號筒或波導以準直波束，或減 L。

### 步驟四：算捕獲勢與恢復力

量化聲阱之強度與空間範圍：

1. **Gor'kov 勢**：駐波場中小球之 Gor'kov 勢為：
   - U(r) = (4/3) * pi * a^3 * [(f_1 / (2 * rho_0 * c_0^2)) * <p^2> - (3 * f_2 * rho_0 / 4) * <v^2>]
   - 其中 <p^2> 與 <v^2> 為時均壓力與速度場平方。
   - 物捕於 U(r) + m*g*z（含重力）之最小處。
2. **軸向恢復力**：捕獲節近處，將 F_z 一階展開：
   - F_z ~ -k_z * delta_z，其中 k_z = (2 * pi * a^3 * P_0^2 * k^2) / (3 * rho_0 * c_0^2) * Phi
   - 軸向自然頻率為 omega_z = sqrt(k_z / m)。
3. **側向恢復力**：有限寬之波束中，側向輻射力來自橫向強度梯度。腰 w 之 Gaussian 波束輪廓：
   - k_r ~ k_z * (a / w)^2（近似，側向剛度較軸向為弱）
   - 側向捕獲較軸向為弱；此為穩定性之限制因素。
4. **捕獲深度**：物逃阱前之最大位移由勢井深決定。軸向井深為 Delta_U = F_ax_max * lambda / (2 * pi)。若相關則以熱能 k_B * T 之倍數表（空氣中微米尺度粒子恆相關，毫米尺度物可忽）。

```markdown
## Trapping Analysis
- **Axial stiffness**: k_z = [value] N/m
- **Axial natural frequency**: omega_z / (2*pi) = [value] Hz
- **Lateral stiffness**: k_r = [value] N/m
- **Lateral natural frequency**: omega_r / (2*pi) = [value] Hz
- **Axial well depth**: Delta_U = [value] J = [value] x k_B*T
- **Stiffness ratio**: k_z / k_r = [value] (lateral is weaker)
```

**預期：** 軸向與側向兩向之定量剛度值，算出自然頻率，定捕獲勢井深。確認側向剛度為正（然較軸向弱）。

**失敗時：** 若側向剛度為負或微小，物將側漂出波束。解法含用較寬之換能器（較大之波束腰）、加側向換能器、換至相控陣列配置、或用凹面反射器以造聚焦波前提供更強之側向約束。

### 步驟五：驗擾動之穩定性

確認所設系統可靠捕獲並持物：

1. **重力偏移**：平衡位置於壓力節下偏 delta_z = m * g / k_z。驗 delta_z << lambda/4（至勢極大之距）。若 delta_z 接 lambda/4，物自阱落。
2. **氣流敏感性**：估環境氣流之拖曳力。對球，F_drag = 6 * pi * eta * a * v_air（Stokes 拖曳）。與側向恢復力比之：最大可容風速為 v_max = k_r * a / (6 * pi * eta * a) = k_r / (6 * pi * eta)。
3. **聲流**：駐波驅穩循環流（Rayleigh streaming），速度 v_stream ~ P_0^2 / (4 * rho_0 * c_0^3 * eta) * lambda。此等流對懸浮物施拖曳。驗聲流拖曳小於側向恢復力。
4. **熱效應**：聲吸收熱介質，變 c_0 而移節位置。高強度操作（> 160 dB SPL）宜估溫升及操作期間之節漂。
5. **相控陣列擴展**（若需操控）：動態物重定位時，以換能器相控陣列替單換能器-反射器對。調相對相可連續移壓力節位置，攜捕獲物同行。相解析度決位置精度：delta_z ~ lambda / (2 * pi * N_phase_bits)。

```markdown
## Stability Verification
| Perturbation | Magnitude | Restoring Force | Margin | Stable? |
|-------------|-----------|----------------|--------|---------|
| Gravity offset | delta_z = [val] | k_z * delta_z | delta_z / (lambda/4) = [val] | [Yes/No] |
| Air currents | v_air = [val] m/s | F_lat = [val] N | F_lat / F_drag = [val] | [Yes/No] |
| Acoustic streaming | v_stream = [val] | F_lat = [val] N | F_lat / F_stream_drag = [val] | [Yes/No] |
| Thermal drift | Delta_T = [val] K | Re-tune interval | [time] | [Acceptable/No] |
```

**預期：** 所有擾動源已量化，並示於捕獲餘量內。重力偏移為 lambda/4 之小分數。氣流與聲流效應不壓倒側向阱。

**失敗時：** 若重力偏移過大（物重、場弱），增 P_0 或用更高頻率（每波長更強之梯度）。若氣流為患，將懸浮器封於擋風罩。若聲流擾物，減驅動振幅並用最小化流渦之反射器幾何（如淺凹反射器）。

## 驗證

- [ ] 物之大小滿足 a << lambda（Gor'kov 理論適用）
- [ ] 算出聲學對比因子，識別捕獲位置（節/波腹）
- [ ] 所需壓力振幅 P_0 算出，可由所定硬體達成
- [ ] 換能器-反射器腔長設為 n * lambda/2，算出節位置
- [ ] 軸向與側向剛度皆為正
- [ ] 重力偏移 delta_z 為 lambda/4 之小分數
- [ ] 氣流與聲流擾動於捕獲餘量內
- [ ] 高 SPL 操作之安全考量已載之
- [ ] 若用相控陣列，載相控解析度與位置精度

## 常見陷阱

- **違小粒子假設**：Gor'kov 輻射力公式設 a << lambda。物大小近 lambda/4 時，點粒子近似崩潰，實際力可能顯著異於 Gor'kov 預測（大小與方向皆然）。對大物宜用全波模擬。
- **忽側向約束**：多數入門處理聚焦軸向（垂直）捕獲力，忽較弱之側向恢復力。實務中，側向不穩為首要失敗模式，尤於近大小上限之物。
- **忘聲流**：高強度駐波恆驅穩流。此等流對懸浮物施拖曳，與輻射力相爭。聲流非小效應——高 SPL 時可為主宰之不穩影響。
- **溫度敏感**：空氣中聲速隨攝氏溫度每度變約 0.6 m/s。10 度溫擺下，波長移約 2%，於典型腔中移節位置數毫米。長時實驗需主動長度補償或溫控。
- **混壓力節與速度節**：壓力節為速度波腹，反之亦然。正對比因子之固體物捕於壓力節（壓力振盪最小、速度振盪最大處）。反之致捕於錯位。
- **忽高振幅之非線性效應**：約 155-160 dB SPL 以上，非線性聲效應（諧波生、激波形成）顯著而減有效捕獲力較線性理論預測為小。

## 相關技能

- `evaluate-levitation-mechanism` —— 比聲懸浮與磁、靜電、氣動替代
- `analyze-magnetic-levitation` —— 供比較之互補磁懸浮分析
- `derive-theoretical-result` —— 自第一原理推聲輻射壓
