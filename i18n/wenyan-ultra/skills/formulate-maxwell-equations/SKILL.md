---
name: formulate-maxwell-equations
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Work with the full set of Maxwell's equations in integral and differential
  form to analyze electromagnetic fields, waves, and energy transport. Use
  when applying Gauss's law, Faraday's law, or the Ampere-Maxwell law to
  boundary value problems, deriving the electromagnetic wave equation,
  computing Poynting vector and radiation pressure, solving for fields at
  material interfaces, or connecting electrostatics and magnetostatics to
  the unified electromagnetic framework.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: electromagnetism
  complexity: advanced
  language: natural
  tags: electromagnetism, maxwell-equations, electromagnetic-waves, poynting-vector, boundary-conditions
---

# 馬氏四方程

列馬氏四方程（積或微形）、應邊界與對稱、解 PDE、算 Poynting 及波阻、驗極限。

## 用

- 邊值問題求 E、B 於有源、有界面之域
- 由本原推電磁波方程
- 算能流（Poynting）、動量密度
- 應介面邊界條件（介質、導體、磁料）
- 析位移流於 Ampere-Maxwell 之作用
- 連靜極（Coulomb、Biot-Savart）於統一時變架構

## 入

- **必**：物理配置（幾何、電荷流源、料性）
- **必**：所求量（E、B、波解、能流、界面值）
- **可**：對稱（平面、柱、球、無）
- **可**：時變（靜、頻 omega、一般）
- **可**：界面或導體表邊界條件

## 行

### 一：列四方程、擇相關

全寫，擇所約束者：

1. **Gauss E 律**：div(E) = rho / epsilon_0（微）或 closed_surface_integral(E . dA) = Q_enc / epsilon_0（積）。E 散連電荷密度。有對稱之電荷分佈取 E 用。

2. **Gauss B 律**：div(B) = 0（微）或 closed_surface_integral(B . dA) = 0（積）。無磁單極。B 線皆閉環。驗 B 用。

3. **Faraday 律**：curl(E) = -dB/dt（微）或 contour_integral(E . dl) = -d(Phi_B)/dt（積）。B 變生 E 旋。感應與推波用。

4. **Ampere-Maxwell 律**：curl(B) = mu_0 J + mu_0 epsilon_0 dE/dt（微）或 contour_integral(B . dl) = mu_0 I_enc + mu_0 epsilon_0 d(Phi_E)/dt（積）。流與 E 變生 B 旋。位移流 mu_0 epsilon_0 dE/dt 為波傳與流連續所必需。

5. **擇形**：局部、波、PDE 取微形。高對稱取積形。

6. **辨活方程**：非皆獨立。靜電（dB/dt = 0, J = 0）只 Gauss E 與 curl(E) = 0 有效。靜磁則 Gauss B 與 Ampere（無位移流）足。

```markdown
## Maxwell Equations for This Problem
- **Form**: [differential / integral / both]
- **Active equations**: [list which of the four are non-trivial constraints]
- **Source terms**: rho = [charge density], J = [current density]
- **Time dependence**: [static / harmonic / general]
- **Displacement current**: [negligible / essential -- with justification]
```

得：四方程已列，相關子集已辨並明由，位移流或留或明證可略。

敗：位移流取捨未明→估 |epsilon_0 dE/dt| / |J| 之比。近 1 或過→必留。真空無電荷則恆須。

### 二：應邊界與對稱

用界面與幾何對稱減系：

1. **介面邊界條件**：介質 1/2 之介，面電荷 sigma_f、面流 K_f：
   - 法 E：epsilon_1 E_1n - epsilon_2 E_2n = sigma_f
   - 切 E：E_1t = E_2t（連續）
   - 法 B：B_1n = B_2n（連續）
   - 切 H：n_hat x (H_1 - H_2) = K_f（n_hat 由 2 指 1）

2. **導體邊界**：完美導體面：
   - E_tangential = 0（內 E = 0）
   - B_normal = 0（時變內 B = 0）
   - 面電荷：sigma = epsilon_0 E_normal
   - 面流：K = (1/mu_0) n_hat x B

3. **對稱減**：用所辨對稱減獨立變數：
   - 平面：場僅依一坐標（如 z），PDE→ODE
   - 柱：場依 (rho, z) 或僅 rho
   - 球：場僅依 r
   - 平移不變：沿不變向 Fourier 變換

4. **規範擇**（用勢時）：選 phi 與 A 之規範：
   - Coulomb：div(A) = 0（分靜電與輻射）
   - Lorenz：div(A) + mu_0 epsilon_0 d(phi)/dt = 0（顯 Lorentz 協變，解耦波方程）

```markdown
## Boundary Conditions and Symmetry
- **Interfaces**: [list with media properties on each side]
- **Boundary conditions applied**: [normal E, tangential E, normal B, tangential H]
- **Symmetry**: [planar / cylindrical / spherical / none]
- **Reduced coordinates**: [independent variables after symmetry reduction]
- **Gauge** (if using potentials): [Coulomb / Lorenz / other]
```

得：諸界面邊界皆列，對稱已用以減維，問題備解 PDE。

敗：邊界過定（方程多於未知）→查場分量與條件數是否合。不足→漏條件，常為切 H 或無窮遠輻射條件。

### 三：解 PDE

解馬氏方程或其衍形求場量：

1. **推波方程**：無源線性均勻介：
   - 取 Faraday 旋：curl(curl(E)) = -d/dt(curl(B))
   - 代 Ampere-Maxwell：curl(curl(E)) = -mu epsilon d^2E/dt^2
   - 用向量恆等：curl(curl(E)) = grad(div(E)) - nabla^2(E)
   - div(E) = 0（無自由電荷）：nabla^2(E) = mu epsilon d^2E/dt^2
   - 波速：v = 1/sqrt(mu epsilon)；真空 c = 1/sqrt(mu_0 epsilon_0)
   - B 同式

2. **平面波解**：沿 z 向：
   - E(z, t) = E_0 exp[i(kz - omega t)]，k = omega/v = omega * sqrt(mu epsilon)
   - B = (1/v) k_hat x E（垂直於 E 與傳向）
   - |B| = |E|/v
   - 偏振：依 E_0 分量為線、圓、橢

3. **Laplace 與 Poisson**（靜）：
   - 無時變：nabla^2(phi) = -rho/epsilon_0（Poisson）或 nabla^2(phi) = 0（Laplace）
   - 於合適坐標系分離變量
   - 匹邊界以定係數

4. **導波與諧腔**：
   - 分 TE（橫電）與 TM（橫磁）模
   - 應導壁邊界
   - 解本徵問題求傳播常數或諧頻
   - 截止頻：omega_c = v * pi * sqrt((m/a)^2 + (n/b)^2)（矩形 a x b 導）

5. **導體趨膚深**：時變場入導體（導率 sigma_c）：
   - delta = sqrt(2 / (omega mu sigma_c))
   - 場於導體內 exp(-z/delta) 衰
   - 銅 60 Hz：delta 約 8.5 mm；1 GHz：delta 約 2 微米

```markdown
## Field Solution
- **Equation solved**: [wave equation / Laplace / Poisson / eigenvalue]
- **Solution method**: [separation of variables / Fourier transform / Green's function / numerical]
- **Result**: E(r, t) = [expression], B(r, t) = [expression]
- **Dispersion relation**: omega(k) = [if wave solution]
- **Characteristic scales**: [wavelength, skin depth, decay length]
```

得：場表式顯，滿足馬氏與諸邊界，色散或本徵譜並具。

敗：選坐標系不可分→易系或取數值（有限差、有限元）。回代不符某方程→代數誤→重驗旋散運算。

### 四：算衍量

由場解取物理意量：

1. **Poynting 向量**：S = (1/mu_0) E x B（瞬能流，W/m^2）：
   - 平面波：S = (1/mu_0) |E|^2 / v 於傳向
   - 時均：<S> = (1/2) Re(E x H*)（諧）
   - 強度：I = |<S>|

2. **電磁能密**：
   - u = (1/2)(epsilon_0 |E|^2 + |B|^2/mu_0)（真空）
   - u = (1/2)(E . D + B . H)（線性介）
   - 能守：du/dt + div(S) = -J . E（Poynting 定理）

3. **輻射壓**：平面波射面：
   - 全吸：P_rad = I/c = <S>/c
   - 全反：P_rad = 2I/c = 2<S>/c
   - 乃電磁場動量流密

4. **波阻**：
   - 介中：eta = sqrt(mu/epsilon) = mu * v
   - 真空：eta_0 = sqrt(mu_0/epsilon_0) 約 377 Ohms
   - E/H 幅：|E| = eta |H|
   - 法入反射係：r = (eta_2 - eta_1)/(eta_2 + eta_1)

5. **耗散與品質因子**：
   - 導體歐姆損：p_loss = sigma |E|^2 / 2
   - 腔 Q：Q = omega * 儲能 / 每週期耗能
   - 聯諧帶寬：Delta_omega = omega / Q

```markdown
## Derived Quantities
- **Poynting vector**: S = [expression], <S> = [time-averaged]
- **Energy density**: u = [expression]
- **Radiation pressure**: P_rad = [value]
- **Wave impedance**: eta = [value]
- **Reflection/transmission**: r = [value], t = [value]
- **Q-factor** (if resonant): Q = [value]
```

得：諸量算畢，單位確，經 Poynting 定理驗能守，量級合理。

敗：Poynting 定理不均（du/dt + div(S) ≠ -J . E）→E、B 解互不一致。重驗二場同時滿四方程。常為 E、B 取不相容之近似。

### 五：驗極限

察全解於極限是否正確回落：

1. **靜極（omega → 0）**：應回靜電或靜磁：
   - E 應滿 Coulomb 或 Laplace/Poisson
   - B 應滿 Biot-Savart 或 Ampere（無位移流）
   - 位移流滅：mu_0 epsilon_0 dE/dt → 0

2. **平面波極**：無界無源介，應為平面波，v = 1/sqrt(mu epsilon)，偏振正確。

3. **完美導體極（sigma → ∞）**：
   - 趨膚 delta → 0
   - 切 E → 0 於表
   - 反射係 r → -1（完全反射並相位反轉）

4. **真空極（epsilon_r = 1, mu_r = 1）**：料依量應回真空值。波速應為 c。阻應為 eta_0 約 377 Ohms。

5. **能守驗**：Poynting 定理積於閉域。全場能率變加面外流功率應等於域內電流負功率。失衡乃誤。

```markdown
## Limiting Case Verification
| Limit | Condition | Expected | Obtained | Match |
|-------|-----------|----------|----------|-------|
| Static | omega -> 0 | Coulomb / Biot-Savart | [result] | [Yes/No] |
| Plane wave | unbounded medium | v = c/n, eta = eta_0/n | [result] | [Yes/No] |
| Perfect conductor | sigma -> inf | delta -> 0, r -> -1 | [result] | [Yes/No] |
| Vacuum | epsilon_r = mu_r = 1 | c, eta_0 | [result] | [Yes/No] |
| Energy conservation | Poynting's theorem | balanced | [check] | [Yes/No] |
```

得：諸極限皆返已知正確結果。能守達數值精度。

敗：極限敗乃誤之確證。靜極敗→源或邊界之問題。平面波極敗→波方程推導之誤。能守敗→E、B 解不一致。溯回指定步修正，方可接受解。

## 驗

- [ ] 四方程皆列，相關子集已辨
- [ ] 位移流或留或明證可略
- [ ] 諸介面皆應邊界條件
- [ ] 對稱已用以減 PDE 維
- [ ] 波方程（或 Laplace/Poisson）正確推導
- [ ] 場解回代滿四方程
- [ ] Poynting 向量與能密算畢，單位確（W/m^2 與 J/m^3）
- [ ] Poynting 定理（能守）已驗
- [ ] 波阻與反射/透射係合理
- [ ] 靜極回 Coulomb 與 Biot-Savart
- [ ] 平面波極得 v = 1/sqrt(mu epsilon)，E、B、k 正交
- [ ] 解足供他研究者復

## 忌

- **略位移流**：原 Ampere（curl B = mu_0 J）取散得 div(J) = 0，與時變 rho 矛盾。位移流 mu_0 epsilon_0 dE/dt 補之，為波傳所必需。非驗 dE/dt 比 J/epsilon_0 可略，不可去。
- **E、B 解不一致**：獨立解 E（Gauss E）與 B（Ampere）而不驗 Faraday 與 Gauss B→場互不一致。必驗全四方程。
- **邊界法向誤**：n_hat x (H_1 - H_2) = K_f 之 n_hat 必由介 2 指介 1。反則面流條件變號。
- **介中 D、E、B、H 混**：真空 D = epsilon_0 E、B = mu_0 H。線性介 D = epsilon E、B = mu H。馬氏介形用 D、H 表自由源，用 E、B 表力律。混構成關係致 epsilon_r 或 mu_r 倍誤。
- **相速與群速**：v = omega/k 乃相速。能與信息以群速 v_g = d(omega)/dk 傳。色散介中二者異，用相速算能傳乃誤。
- **略輻射條件**：散射與輻射於無界域，解必滿 Sommerfeld 輻射條件（無窮遠外行波）。否則解非唯一，或含非物理入射波。

## 參

- `analyze-magnetic-field`
- `solve-electromagnetic-induction`
- `formulate-quantum-problem`
- `derive-theoretical-result`
- `analyze-diffusion-dynamics`
