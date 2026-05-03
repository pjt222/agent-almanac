---
name: solve-electromagnetic-induction
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Solve problems involving changing magnetic flux using Faraday's law, Lenz's
  law, motional EMF, mutual and self-inductance, and RL circuit transients.
  Use when computing induced EMF from time-varying B-fields or moving
  conductors, determining current direction via Lenz's law, analyzing
  inductance and energy storage in magnetic fields, or solving RL circuit
  differential equations for switching transients.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: electromagnetism
  complexity: intermediate
  language: natural
  tags: electromagnetism, induction, faraday, lenz, inductance, rl-circuits
---

# 解電磁感應之題

析電磁感應之象——識變磁通之源、算過所關面之通、施法拉第律以得感應電動勢、依楞次律定電流之向、解所生之路方程含 RL 暫態與磁場儲能。

## 用時

- 因時變磁場而算迴或圈中感應電動勢乃用
- 析靜場中導體之動致電動勢乃用
- 以楞次律定感應電流之向乃用
- 算耦圈間互感或單圈自感乃用
- 解 RL 路之暫態（充電、放電、態間之切）乃用
- 算磁場中或感器中儲能乃用

## 入

- **必要**：變通之源（時變磁場、動導、變圈面）
- **必要**：算通之路或圈之幾何
- **必要**：所關物理參（B 之大、速、阻、感、為感算之幾何）
- **可選**：連於感應迴之路件（阻、加感、源）
- **可選**：暫態析之初條（初電流、初儲能）
- **可選**：所關暫態解之時段

## 法

### 第一步：識變通之源

定生時變磁通之物理機制：

1. **變 B 場**：磁場本身隨時變（如 AC 電磁、近之磁、近圈電流之斜）。圈靜。
2. **變面**：圈面變（如脹縮之圈、靜場中轉之圈）。B 場可靜。
3. **動導（動致電動勢）**：直導過靜場而動。通變生於導所掃之面。
4. **合**：場與幾何同時變（如時變場中轉之圈）。分諸貢以清。

各機制識所關面 S 為迴 C 所界：

```markdown
## Flux Change Classification
- **Mechanism**: [changing B / changing area / motional / combined]
- **Surface S**: [description of the surface bounded by the loop]
- **Time dependence**: [which quantities vary: B(t), A(t), v(t), theta(t)]
- **Relevant parameters**: [B magnitude, loop dimensions, velocity, angular frequency]
```

得：明識通變之因、所積之面、何物理量持時依。

敗則：若變通之源歧（如非均場中變形之圈），分問題為諸貢之和：場變於定幾何之一；幾何變於即時場之一。此分常有效。

### 第二步：算過所關面之磁通

算磁通 Phi_B = B . dA 於面 S 之積：

1. **均場、平圈**：Phi_B = B * A * cos(theta)，theta 為 B 與面法 n_hat 之角。常書例也。

2. **非均場**：參數化面 S 而求積：
   - 擇與面合之坐標（如圓圈用極座標）
   - 各點上書 B(r)
   - 算點積 B . dA = B . n_hat dA
   - 於面積之

3. **耦圈（互感）**：圈二連於圈一：
   - 算 B_1（圈一之場）於圈二之位
   - 積 B_1 於圈二各匝之面
   - 乘 N_2（圈二匝數）為總通鏈：Lambda_21 = N_2 * Phi_21
   - 互感：M = Lambda_21 / I_1

4. **自感**：單圈載流 I：
   - 算圈內 B 自圈自身之流
   - 積 B 於一匝之截面，乘 N
   - 自感：L = N * Phi / I = Lambda / I
   - 已知果：螺管 L = mu_0 * n^2 * A * l；環 L = mu_0 * N^2 * A / (2 pi R)

5. **時依**：明書 Phi_B(t)，代入第一步所識時變量。

```markdown
## Flux Calculation
- **Flux expression**: Phi_B(t) = [formula]
- **Evaluation**: [analytic / numeric]
- **Flux linkage** (if multi-turn): Lambda = N * Phi_B = [formula]
- **Inductance** (if applicable): L = [value with units] or M = [value with units]
```

得：Phi_B(t) 之明式有正單位（韋伯 = T . m^2），若可，感值有亨利之單位。

敗則：若通積不可解析（如非均場過非平面），用數值積。複幾何之互感，考紐曼式：M = (mu_0 / 4 pi) * 雙輪廓積 (dl_1 . dl_2) / |r_1 - r_2|。

### 第三步：施法拉第律以得感應電動勢

由通之時導算感應電動勢：

1. **法拉第律**：EMF = -d(Lambda)/dt = -N * d(Phi_B)/dt。負號編楞次律（拒變）。

2. **微分**：取 Phi_B(t) 之全時導：
   - 若 B = B(t) 而 A、theta 為常：EMF = -N * A * cos(theta) * dB/dt
   - 若 theta = omega * t（靜 B 中轉圈）：EMF = N * B * A * omega * sin(omega * t)
   - 若面變（如滑軌）：EMF = -B * l * v（動致電動勢，l 為軌長，v 為速）
   - 一般：用萊布尼茨積之則於積號下微

3. **動致電動勢（別解）**：長 l 之導以速 v 動於場 B：
   - 導中載荷之洛倫茲力：F = q(v x B)
   - EMF = (v x B) . dl 沿導之積
   - 與法拉第律等而為動導之直觀

4. **符與大之察**：EMF 之大宜物理合理。常實驗：mV 至 V。電力生：V 至 kV。

```markdown
## Induced EMF
- **EMF expression**: EMF(t) = [formula]
- **Peak EMF** (if AC): EMF_0 = [value with units]
- **RMS EMF** (if AC): EMF_rms = EMF_0 / sqrt(2) = [value]
- **Derivation method**: [Faraday's law / motional EMF / Leibniz rule]
```

得：EMF(t) 之明式有正單位（伏）與物理合理之大。

敗則：若 EMF 單位誤，回通算——缺面之因或單位系不一（如 CGS 與 SI 混）為最常之因。若 EMF 符似誤，再察面法相對於迴方向之向（右手則）。

### 第四步：以楞次律定電流之向

立感應電流之向與其物理之果：

1. **楞次律之言**：感應電流流向所拒生之磁通之變。乃能量守恆之果。

2. **施之法**：
   - 定通過圈之通增或減
   - 通增：感應電流生 B 場拒之（拒外場過圈之向）
   - 通減：感應電流生 B 場助之（與外場過圈之向同）
   - 用右手則轉所須 B 向為電流之向

3. **力之果**：感應電流於外 B 場中受力：
   - 渦流制動：力拒相對之動（恆減速）
   - 磁懸浮：適幾何時斥力支重
   - 此力為楞次律於機械層之直現

4. **質性之驗**：感應之效恆拒變。導管中落磁，緩於自由落。發電機須機械功入以生電能。

```markdown
## Current Direction
- **Flux change**: [increasing / decreasing]
- **Induced B direction**: [opposing increase / supporting decrease]
- **Current direction**: [CW / CCW as viewed from specified direction]
- **Mechanical consequence**: [braking force / levitation / energy transfer]
```

得：明陳之電流向，合楞次律，並識物理之果（力、制動、能轉）。

敗則：若電流向似助通變而非拒之，面法之向或右手則之施反。再察迴向之規。助通變之電流違能量守恆。

### 第五步：解所生之路方程

立而解含感之路方程：

1. **RL 路成**：感應 EMF 於含 R 與 L 之路驅電流，基爾霍夫電壓律：
   - 充電（開閉於 DC 源 V_0）：V_0 = L dI/dt + R I
   - 放電（源除，迴閉）：0 = L dI/dt + R I
   - 一般（時變 EMF）：EMF(t) = L dI/dt + R I

2. **一階 ODE 之解**：
   - 充電：I(t) = (V_0 / R) * [1 - exp(-t / tau)]，tau = L / R 為時常
   - 放電：I(t) = I_0 * exp(-t / tau)
   - AC 驅 EMF = EMF_0 sin(omega t)：用相量法或特解＋齊解
   - 暫態之長：電流於 1 tau 後達末值之 ~63%、3 tau 後 ~95%、5 tau 後 ~99.3%

3. **能析**：
   - 感器中儲能：U_L = (1/2) L I^2
   - 磁場單位體積之儲能：真空中 u_B = B^2 / (2 mu_0)，磁材中 u_B = (1/2) B . H
   - 阻耗：P_R = I^2 R
   - 能守：能入率 = 儲能率 + 耗率

4. **互感耦**：兩耦圈互感 M：
   - V_1 = L_1 dI_1/dt + M dI_2/dt + R_1 I_1
   - V_2 = M dI_1/dt + L_2 dI_2/dt + R_2 I_2
   - 耦係：k = M / sqrt(L_1 L_2)，0 <= k <= 1
   - 同解耦 ODE（矩指或拉普拉斯變換）

5. **穩態與暫態之分**：AC 驅之路，分解為暫態（衰指）與穩態（驅頻之正弦）。報阻抗 Z_L = j omega L 與相角。

```markdown
## Circuit Solution
- **Circuit type**: [RL energizing / de-energizing / AC driven / coupled coils]
- **Time constant**: tau = L/R = [value with units]
- **Current solution**: I(t) = [expression]
- **Energy stored**: U_L = [value at specified time]
- **Energy dissipated**: [total or rate]
- **Steady-state impedance** (if AC): Z_L = [value]
```

得：完之時域電流解，正之指數時常、能平衡已驗、物理合理之大。

敗則：若電流無界增，ODE 立或符誤（感項當拒電流之變）。若時常異大或異小，再察第二步之感算與 R 之值。常實驗 RL 之時常為微秒至秒。

## 驗

- [ ] 變通之源明識（變 B、變面、動致、合）
- [ ] 通積立於正面與正向
- [ ] 通有正單位（韋伯 = T . m^2）
- [ ] 感值（自或互）有正單位（亨利）與合理之大
- [ ] EMF 有正單位（伏）與物理合理之大
- [ ] EMF 符合楞次律（拒通變）
- [ ] 電流向以楞次律定而以右手則驗
- [ ] RL 路 ODE 正立而符正
- [ ] 時常 tau = L/R 有正單位（秒）與合理之大
- [ ] 能平衡已驗：入能 = 儲能 + 耗能
- [ ] 極例已察（t -> 0 為初條，t -> infinity 為穩態）

## 陷

- **法拉第律之符誤**：EMF = -d(Lambda)/dt，非 +。負號要——編楞次律與能守。略之則電流助通變，違熱力。
- **通與通鏈之惑**：單匝迴 Phi_B 與 Lambda 同。N 匝圈 Lambda = N * Phi_B。感定為 L = Lambda / I，非 L = Phi_B / I。缺 N 之因致感值小 N 倍。
- **面法不一**：面法 n_hat 須以右手則合迴循之向。獨擇致通與 EMF 雙符誤。
- **忽 RL 路之反 EMF**：感器中電流變則感器生反 EMF 拒變。略此項於基爾霍夫電壓律則路方程為代數而非微分，全失暫態。
- **假即時電流變**：理感器之電流不可即變（須無窮電壓）。RL 暫態之初條須滿感器電流於切換事件之續。
- **忽塊導之渦流**：法拉第律施於導中任閉路，非僅離散線迴。塊導中時變場感分布渦流而生熱（耗）與拒場（屏）。變壓器芯中要，須以層減之。

## 參

- `analyze-magnetic-field` — 算電流分布之 B 場為通之源
- `formulate-maxwell-equations` — 推感應於全麥克斯韋框，含位移流
- `design-electromagnetic-device` — 施感應之則於馬達、發電機、變壓器
- `derive-theoretical-result` — 推感、EMF、暫態解之解析果於初本
