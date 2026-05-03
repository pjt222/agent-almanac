---
name: solve-electromagnetic-induction
locale: wenyan-lite
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

# 解電磁感應

分析電磁感應現象：識別磁通量變化之源、計算過相關面之磁通量、套用法拉第定律得感應電動勢、以楞次定律判定感應電流方向，並解所得電路方程，含 RL 暫態與磁場儲能。

## 適用時機

- 計算迴路或線圈中因時變磁場致之感應電動勢
- 分析穿過靜磁場之導體之動生電動勢
- 以楞次定律判定感應電流方向
- 計算耦合線圈間之互感或單線圈之自感
- 解 RL 電路暫態（充能、放能、狀態間切換）
- 計算磁場或電感器中儲存之能量

## 輸入

- **必要**：磁通量變化之源（時變磁場、運動導體或變動迴路面積）
- **必要**：計算磁通量所經之電路或迴路幾何
- **必要**：相關物理參數（磁場大小、速度、電阻、電感或電感計算之幾何）
- **選擇性**：連於感應迴路之電路元件（電阻、附加電感、電源）
- **選擇性**：暫態分析之初始條件（初始電流、初始儲能）
- **選擇性**：暫態解所關注之時間區間

## 步驟

### 步驟一：識別磁通量變化之源

分類產生時變磁通量之物理機制：

1. **變動 B 場**：磁場本身隨時間變化（如交流電磁鐵、接近之磁鐵、鄰近線圈中之電流斜坡）。迴路靜止。
2. **變動面積**：迴路面積變化（如擴張或收縮之迴路、靜場中旋轉之線圈）。B 場可能靜止。
3. **運動導體（動生電動勢）**：直導體穿越靜 B 場運動。通量變化源於導體掃出之面積。
4. **複合**：場與幾何同時變化（如於時變場中旋轉之線圈）。為清晰分離各貢獻。

對每機制，識別由電路迴路 C 所界之相關面 S：

```markdown
## Flux Change Classification
- **Mechanism**: [changing B / changing area / motional / combined]
- **Surface S**: [description of the surface bounded by the loop]
- **Time dependence**: [which quantities vary: B(t), A(t), v(t), theta(t)]
- **Relevant parameters**: [B magnitude, loop dimensions, velocity, angular frequency]
```

**預期：** 清晰識別通量變化之因、所積分之面，以及哪些物理量含時間依賴。

**失敗時：** 若通量變化之源含混（如非均勻場中變形之迴路），將問題拆為貢獻之和：固定幾何下場變化之一，與瞬時場下幾何變化之一。此分解永遠有效。

### 步驟二：計算過相關面之磁通量

於面 S 上計算磁通量 Phi_B = integral of B . dA：

1. **均勻場、平面迴路**：Phi_B = B * A * cos(theta)，theta 為 B 與面法向 n_hat 之夾角。此為最常見教科書情況。

2. **非均勻場**：參數化面 S 並評估積分：
   - 選與面對齊之坐標（如圓形迴路用極坐標）
   - 表面上每點之 B(r)
   - 計算內積 B . dA = B . n_hat dA
   - 在面上積分

3. **耦合線圈（互感）**：對連於線圈 1 之線圈 2：
   - 計算線圈 2 處之 B_1（線圈 1 之場）
   - 將 B_1 在線圈 2 之每匝面積上積分
   - 乘以 N_2（線圈 2 之匝數）得總磁鏈：Lambda_21 = N_2 * Phi_21
   - 互感：M = Lambda_21 / I_1

4. **自感**：對載電流 I 之單線圈：
   - 計算線圈內由其自身電流產生之 B
   - 將 B 在一匝橫截面上積分並乘以 N
   - 自感：L = N * Phi / I = Lambda / I
   - 已知結果：螺線管 L = mu_0 * n^2 * A * l；環形 L = mu_0 * N^2 * A / (2 pi R)

5. **時間依賴**：將步驟一所識之時變量代入，明確表 Phi_B(t)。

```markdown
## Flux Calculation
- **Flux expression**: Phi_B(t) = [formula]
- **Evaluation**: [analytic / numeric]
- **Flux linkage** (if multi-turn): Lambda = N * Phi_B = [formula]
- **Inductance** (if applicable): L = [value with units] or M = [value with units]
```

**預期：** Phi_B(t) 之明確表達式，單位正確（韋伯 = T . m^2）；如適用，電感值單位為亨利。

**失敗時：** 若通量積分無法解析評估（如非平凡面上之非均勻場），用數值積分。對複雜幾何之互感，考慮 Neumann 公式：M = (mu_0 / 4 pi) * double_contour_integral of (dl_1 . dl_2) / |r_1 - r_2|。

### 步驟三：套用法拉第定律求感應電動勢

從通量之時間導數計算感應電動勢：

1. **法拉第定律**：EMF = -d(Lambda)/dt = -N * d(Phi_B)/dt。負號編碼楞次定律（反對變化）。

2. **微分**：對 Phi_B(t) 取全時間導數：
   - 若 B = B(t) 而 A、theta 為常數：EMF = -N * A * cos(theta) * dB/dt
   - 若 theta = omega * t（靜 B 中旋轉之線圈）：EMF = N * B * A * omega * sin(omega * t)
   - 若面積變化（如滑動軌道）：EMF = -B * l * v（動生電動勢，l 為軌長，v 為速度）
   - 一般情況：用 Leibniz 積分律於積分號下微分

3. **動生電動勢（替代推導）**：對長 l 之導體以速度 v 於 B 場中運動：
   - 導體中電荷之 Lorentz 力：F = q(v x B)
   - EMF = integral of (v x B) . dl 沿導體
   - 此等效於法拉第定律，但對運動導體更直觀

4. **符號與大小檢查**：EMF 大小應物理合理。典型實驗室設置：mV 至 V 範圍。發電：V 至 kV 範圍。

```markdown
## Induced EMF
- **EMF expression**: EMF(t) = [formula]
- **Peak EMF** (if AC): EMF_0 = [value with units]
- **RMS EMF** (if AC): EMF_rms = EMF_0 / sqrt(2) = [value]
- **Derivation method**: [Faraday's law / motional EMF / Leibniz rule]
```

**預期：** EMF(t) 之明確表達式，單位正確（伏特），大小物理合理。

**失敗時：** 若 EMF 單位錯，回查通量計算——遺漏面積因子或單位系統不一致（如 CGS 與 SI 混用）為最可能原因。若 EMF 符號似錯，重審面法向相對於電路迴路方向之取向（右手定則）。

### 步驟四：以楞次定律判定電流方向

確立感應電流方向及其物理後果：

1. **楞次定律陳述**：感應電流之方向反對產生它之磁通量變化。此為能量守恆之結果。

2. **應用程序**：
   - 判定迴路中通量是增是減
   - 若通量增：感應電流產生反對該增加之 B 場（與外場過迴路之方向相反）
   - 若通量減：感應電流產生支持該減少之 B 場（與外場過迴路同向）
   - 用右手定則將所需 B 場方向轉為電流方向

3. **力之後果**：感應電流於外 B 場中受力：
   - 渦流制動：力反對相對運動（永遠減速）
   - 磁懸浮：幾何適當時排斥力支撐重量
   - 此等力為楞次定律於力學層之直接表現

4. **質性驗證**：感應效應應永遠抗拒變化。穿過導電管下落之磁鐵比自由下落慢。發電機需機械功輸入以產生電能。

```markdown
## Current Direction
- **Flux change**: [increasing / decreasing]
- **Induced B direction**: [opposing increase / supporting decrease]
- **Current direction**: [CW / CCW as viewed from specified direction]
- **Mechanical consequence**: [braking force / levitation / energy transfer]
```

**預期：** 與楞次定律一致之明確電流方向，並識別物理後果（力、制動、能量轉移）。

**失敗時：** 若電流方向似放大通量變化而非反對之，面法向取向或右手定則應用反向。重審迴路取向慣例。增強通量變化之電流將違反能量守恆。

### 步驟五：解所得電路方程

包含電感建立並解電路方程：

1. **RL 電路形成**：當感應電動勢驅動電流穿過具電阻 R 與電感 L 之電路，克希荷夫電壓定律給出：
   - 充能（開關閉於直流源 V_0）：V_0 = L dI/dt + R I
   - 放能（源移除，迴路閉合）：0 = L dI/dt + R I
   - 一般（時變電動勢）：EMF(t) = L dI/dt + R I

2. **一階 ODE 之解**：
   - 充能：I(t) = (V_0 / R) * [1 - exp(-t / tau)]，tau = L / R 為時間常數
   - 放能：I(t) = I_0 * exp(-t / tau)
   - 交流驅動 EMF = EMF_0 sin(omega t)：用相量法或特解＋齊次解
   - 暫態時長：1 tau 後電流達末值約 63%、3 tau 後約 95%、5 tau 後約 99.3%

3. **能量分析**：
   - 電感器儲能：U_L = (1/2) L I^2
   - 磁場單位體積儲能：真空中 u_B = B^2 / (2 mu_0)，磁性材料中 u_B = (1/2) B . H
   - 電阻消耗功率：P_R = I^2 R
   - 能量守恆：能量輸入率 = 儲能率 + 消耗率

4. **互感耦合**：對二具互感 M 之耦合線圈：
   - V_1 = L_1 dI_1/dt + M dI_2/dt + R_1 I_1
   - V_2 = M dI_1/dt + L_2 dI_2/dt + R_2 I_2
   - 耦合係數：k = M / sqrt(L_1 L_2)，0 <= k <= 1
   - 同時解耦合 ODE（矩陣指數或拉普拉斯轉換）

5. **穩態與暫態分離**：對交流驅動電路，將解分為暫態（衰減指數）與穩態（驅動頻率正弦）。報告阻抗 Z_L = j omega L 與相角。

```markdown
## Circuit Solution
- **Circuit type**: [RL energizing / de-energizing / AC driven / coupled coils]
- **Time constant**: tau = L/R = [value with units]
- **Current solution**: I(t) = [expression]
- **Energy stored**: U_L = [value at specified time]
- **Energy dissipated**: [total or rate]
- **Steady-state impedance** (if AC): Z_L = [value]
```

**預期：** 電流之完整時域解，指數時間常數正確，能量平衡已驗證，大小物理合理。

**失敗時：** 若電流無界增長，可能 ODE 設置中符號錯（電感項應反對電流變化）。若時間常數不合理大或小，重核步驟二之電感計算與電阻值。典型實驗室 RL 電路之時間常數為微秒至秒。

## 驗證

- [ ] 通量變化之源已清晰識別（變 B、變面積、動生、複合）
- [ ] 磁通量積分於正確面上設置且取向妥當
- [ ] 通量單位正確（韋伯 = T . m^2）
- [ ] 電感值（自或互）單位正確（亨利）且大小合理
- [ ] EMF 單位正確（伏特）且大小物理合理
- [ ] EMF 符號與楞次定律一致（反對通量變化）
- [ ] 電流方向由楞次定律判定並以右手定則驗證
- [ ] RL 電路 ODE 設置正確且符號妥當
- [ ] 時間常數 tau = L/R 單位正確（秒）且大小合理
- [ ] 能量平衡已驗證：輸入能 = 儲能 + 消耗能
- [ ] 已檢查極限情況（t -> 0 之初始條件、t -> infinity 之穩態）

## 常見陷阱

- **法拉第定律符號錯**：EMF = -d(Lambda)/dt，非 +d(Lambda)/dt。負號為必要——其編碼楞次定律與能量守恆。省略則產生放大通量變化之電流，違反熱力學。
- **混淆通量與磁鏈**：對單匝迴路，Phi_B 與 Lambda 相同。對 N 匝線圈，Lambda = N * Phi_B。電感定義為 L = Lambda / I，非 L = Phi_B / I。漏掉 N 之因子產生 N 倍過小之電感值。
- **面法向不一致**：面法向 n_hat 須以右手定則與迴路循環方向相關。獨立選之導致通量與 EMF 雙方之符號錯。
- **RL 電路忽略反電動勢**：電感器中電流變化時，電感器產生反電動勢以反對該變化。自克希荷夫電壓定律省略此項使電路方程成代數而非微分，完全錯失暫態。
- **假設電流可瞬時變化**：理想電感器中之電流不能瞬時變化（將需無限電壓）。RL 暫態之初始條件須滿足電感電流於切換事件兩側之連續性。
- **忽略大塊導體中之渦流**：法拉第定律適用於導體中任何閉合路徑，非僅離散導線迴路。大塊導體中之時變場誘發分布渦流，產生熱（耗損）與反向場（屏蔽）。此於變壓器鐵心中至關，須以疊片化最小化之。

## 相關技能

- `analyze-magnetic-field` — 從電流分布計算 B 場，作為通量源
- `formulate-maxwell-equations` — 將感應推廣至完整 Maxwell 框架，含位移電流
- `design-electromagnetic-device` — 將感應原理套用於馬達、發電機與變壓器
- `derive-theoretical-result` — 從第一原理推導電感、EMF 或暫態解之解析結果
