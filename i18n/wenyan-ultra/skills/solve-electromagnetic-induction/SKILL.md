---
name: solve-electromagnetic-induction
locale: wenyan-ultra
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

# 解電磁感

析變磁通——識變源、計通、施 Faraday 律得感 EMF、以 Lenz 律定向、解路方含 RL 暫態與磁場能。

## 用

- 計時變磁場致圈感 EMF→用
- 析動導於靜 B 之動 EMF→用
- 用 Lenz 律定感流向→用
- 計耦圈互感或單圈自感→用
- 解 RL 暫態（充、放、換）→用
- 計磁場或感器存能→用

## 入

- **必**：變通源（時變 B、動導、變圈面）
- **必**：路或圈幾何
- **必**：物參（B 大、速、阻、感、感計幾何）
- **可**：感圈接路件（阻、餘感、源）
- **可**：暫析初況（初流、初存能）
- **可**：暫解所關時段

## 行

### 一：識變通源

類使時變磁通之物機：

1. **變 B**：磁場本變於時（如 AC 電磁、近磁、近圈電流升）。圈靜
2. **變面**：圈面變（如脹縮圈、靜場中轉圈）。B 或靜
3. **動導（動 EMF）**：直導動於靜 B。通變起於導掃面
4. **合**：場與形俱變（如變場中轉圈）。分貢以明

各機識所關面 S（路 C 圍）：

```markdown
## Flux Change Classification
- **Mechanism**: [changing B / changing area / motional / combined]
- **Surface S**: [description of the surface bounded by the loop]
- **Time dependence**: [which quantities vary: B(t), A(t), v(t), theta(t)]
- **Relevant parameters**: [B magnitude, loop dimensions, velocity, angular frequency]
```

得：明識通變因、何面積、何量帶時依。

敗：變通源歧（如非勻場中變形圈）→分問為和：定形之場變、瞬場之形變。此分恆有效。

### 二：計面之磁通

計磁通 Phi_B = ∫ B . dA 於 S：

1. **勻場、平圈**：Phi_B = B * A * cos(theta)，theta 為 B 與面法 n_hat 之角。最常書例

2. **非勻場**：參面 S 而評積：
   - 擇配面之坐（如圓圈用極）
   - 表面各點 B(r)
   - 計點 B . dA = B . n_hat dA
   - 積於面

3. **耦圈（互感）**：圈 2 接圈 1：
   - 計 B_1（圈 1 場）於圈 2 位
   - 積 B_1 於圈 2 各匝面
   - 乘 N_2（圈 2 匝數）為總通鏈：Lambda_21 = N_2 * Phi_21
   - 互感：M = Lambda_21 / I_1

4. **自感**：單圈帶流 I：
   - 計圈內自流之 B
   - 積一匝橫面之 B、乘 N
   - 自感：L = N * Phi / I = Lambda / I
   - 已知：螺管 L = mu_0 * n^2 * A * l；環 L = mu_0 * N^2 * A / (2 pi R)

5. **時依**：以步一所識時變代之、明表 Phi_B(t)

```markdown
## Flux Calculation
- **Flux expression**: Phi_B(t) = [formula]
- **Evaluation**: [analytic / numeric]
- **Flux linkage** (if multi-turn): Lambda = N * Phi_B = [formula]
- **Inductance** (if applicable): L = [value with units] or M = [value with units]
```

得：Phi_B(t) 明式含正單（Weber = T . m^2）、若可、感值含 Henry。

敗：通積不能析評（如非勻場於繁面）→用數積。複幾何互感→慮 Neumann 式：M = (mu_0 / 4 pi) * 雙積 (dl_1 . dl_2) / |r_1 - r_2|。

### 三：施 Faraday 律得感 EMF

由通時導計感 EMF：

1. **Faraday 律**：EMF = -d(Lambda)/dt = -N * d(Phi_B)/dt。負號編 Lenz 律（拒變）

2. **微分**：取 Phi_B(t) 全時導：
   - B = B(t)、A、theta 常：EMF = -N * A * cos(theta) * dB/dt
   - theta = omega * t（靜 B 中轉圈）：EMF = N * B * A * omega * sin(omega * t)
   - 面變（如滑軌）：EMF = -B * l * v（動 EMF、l 為軌長、v 為速）
   - 通例：用 Leibniz 積規於積號內微

3. **動 EMF（別出）**：長 l 導以速 v 動於 B：
   - 導中荷 Lorentz 力：F = q(v x B)
   - EMF = ∫ (v x B) . dl 沿導
   - 等於 Faraday 律、然或於動導更直觀

4. **號與大察**：EMF 大物理當合理。常實驗：mV 至 V。發電：V 至 kV

```markdown
## Induced EMF
- **EMF expression**: EMF(t) = [formula]
- **Peak EMF** (if AC): EMF_0 = [value with units]
- **RMS EMF** (if AC): EMF_rms = EMF_0 / sqrt(2) = [value]
- **Derivation method**: [Faraday's law / motional EMF / Leibniz rule]
```

得：EMF(t) 明式含正單（伏）與物理合大。

敗：EMF 單誤→追通計——失面因或單系不恆（如混 CGS、SI）為最常因。號似誤→重察面法於路向（右手）。

### 四：以 Lenz 律定流向

定感流向與物理果：

1. **Lenz 律**：感流以拒生之磁通變之向。能守之果

2. **施法**：
   - 定圈中通增或減
   - 通增：感流生 B 拒增（拒外場於圈中之向）
   - 通減：感流生 B 助減通（同外場向）
   - 用右手轉所需 B 向為流向

3. **力果**：感流於外 B 受力：
   - 渦電制：力拒相對動（恆減速）
   - 磁懸：斥力於宜形支重
   - 此皆 Lenz 律於機層之直顯

4. **質驗**：感效當恆拒變。落磁穿導管慢於自由落。發電需機輸入以生電能

```markdown
## Current Direction
- **Flux change**: [increasing / decreasing]
- **Induced B direction**: [opposing increase / supporting decrease]
- **Current direction**: [CW / CCW as viewed from specified direction]
- **Mechanical consequence**: [braking force / levitation / energy transfer]
```

得：明陳流向合 Lenz、識物果（力、制、能傳）。

敗：流向似助通變非拒→面法或右手之施反。覆察圈向法。助通變之流違能守。

### 五：解所致路方

立解含感之路方：

1. **RL 路成**：感 EMF 驅流於含 R、L 路、Kirchhoff 壓律：
   - 充（閘閉於 DC 源 V_0）：V_0 = L dI/dt + R I
   - 放（除源、閉路）：0 = L dI/dt + R I
   - 通（時變 EMF）：EMF(t) = L dI/dt + R I

2. **一階 ODE 解**：
   - 充：I(t) = (V_0 / R) * [1 - exp(-t / tau)]，tau = L / R 為時常
   - 放：I(t) = I_0 * exp(-t / tau)
   - AC 驅 EMF = EMF_0 sin(omega t)：用相量法或特+齊解
   - 暫長：1 tau 達 ~63%、3 tau ~95%、5 tau ~99.3%

3. **能析**：
   - 感存能：U_L = (1/2) L I^2
   - 磁場單體積能：u_B = B^2 / (2 mu_0) 於空、或 u_B = (1/2) B . H 於磁材
   - 阻散功：P_R = I^2 R
   - 能守：能輸率 = 能存率 + 散率

4. **互感耦**：兩耦圈含 M：
   - V_1 = L_1 dI_1/dt + M dI_2/dt + R_1 I_1
   - V_2 = M dI_1/dt + L_2 dI_2/dt + R_2 I_2
   - 耦係：k = M / sqrt(L_1 L_2)、0 <= k <= 1
   - 同解耦 ODE（陣指或 Laplace 變）

5. **穩與暫分**：AC 驅路、解分為暫（衰指）與穩（驅頻正弦）。報阻 Z_L = j omega L 與相

```markdown
## Circuit Solution
- **Circuit type**: [RL energizing / de-energizing / AC driven / coupled coils]
- **Time constant**: tau = L/R = [value with units]
- **Current solution**: I(t) = [expression]
- **Energy stored**: U_L = [value at specified time]
- **Energy dissipated**: [total or rate]
- **Steady-state impedance** (if AC): Z_L = [value]
```

得：流時域全解含正指時常、能衡驗、物理合大。

敗：流無界長→ODE 立號誤（感項當拒流變）。時常異大或小→覆察步二感計與阻值。常實驗 RL 時常自微秒至秒。

## 驗

- [ ] 明識變通源（變 B、變面、動、合）
- [ ] 通積立於正面、向正
- [ ] 通單正（Weber = T . m^2）
- [ ] 感值（自互）單正（Henry）大合理
- [ ] EMF 單正（伏）大合物理
- [ ] EMF 號合 Lenz（拒通變）
- [ ] 流向以 Lenz 定、以右手驗
- [ ] RL 路 ODE 立正、號合
- [ ] tau = L/R 單正（秒）大合理
- [ ] 能衡驗：輸 = 存 + 散
- [ ] 極例察（t -> 0 為初、t -> 無窮為穩）

## 忌

- **Faraday 律號誤**：EMF = -d(Lambda)/dt、非 +。負號要——編 Lenz 律與能守。略則生助通變之流、違熱力
- **混通與通鏈**：單匝 Phi_B 與 Lambda 同。N 匝 Lambda = N * Phi_B。感定為 L = Lambda / I、非 L = Phi_B / I。失 N 因致感小 N 倍
- **面法不恆**：面法 n_hat 必以右手關路循向。獨擇致通與 EMF 號誤
- **忽 RL 反 EMF**：感中流變、感生反 EMF 拒變。略此項自 Kirchhoff 壓使路方為代非微、全失暫
- **設流即變**：理感中流不能即變（需無窮壓）。RL 暫初況必滿換時感流續
- **忽塊導渦流**：Faraday 律施於導中諸閉路、非唯離散線圈。塊導中時變場感分布渦流致熱（損）與拒場（蔽）。要於變壓核、必以片化減

## 參

- `analyze-magnetic-field` — 自流分計 B 場為通源
- `formulate-maxwell-equations` — 推感至全 Maxwell 框含位移流
- `design-electromagnetic-device` — 施感則於電機、發電、變壓
- `derive-theoretical-result` — 自原理導感、EMF、暫解之析果
