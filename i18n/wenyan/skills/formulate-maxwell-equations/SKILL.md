---
name: formulate-maxwell-equations
locale: wenyan
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

# 麥克斯韋方程之立

以積分或微分形式陳相關麥克斯韋方程，以邊界與對稱簡系，解所得偏微分方程得場，算坡印廷向量、輻射壓、波阻抗等派生量，末以靜極與波極驗解。

## 用時

- 解有源與介質界面之區內 E、B 場邊值問題
- 自第一原理推電磁波方程
- 算能流（坡印廷向量）與動量密度
- 施邊界條件於異介質（介電、導、磁）界
- 析位移電流及其補全安培-麥克斯韋方程之用
- 連靜極（庫侖、畢奧-薩伐爾）於統一時變框架

## 入

- **必要**：物理配置（幾何、源電荷與電流、材料性）
- **必要**：所求量（E 場、B 場、波解、能通、邊界場值）
- **可選**：對稱訊（平、柱、球或無）
- **可選**：時依（靜、頻 omega 諧、一般時變）
- **可選**：界面或導體表面邊界條件

## 法

### 第一步：陳四方程，識相關子集

書全系並擇所需：

1. **E 之高斯律**：div(E) = rho / epsilon_0（微分）或閉面積分(E · dA) = Q_enc / epsilon_0（積分）。E 場散度關電荷密度。有對稱之電荷分佈求 E 用之。

2. **B 之高斯律**：div(B) = 0（微分）或閉面積分(B · dA) = 0（積分）。無磁單極。磁力線皆閉環。用於驗算 B 場之一致。

3. **法拉第律**：curl(E) = -dB/dt（微分）或環路積分(E · dl) = -d(Phi_B)/dt（積分）。變 B 生旋 E。感應與波推導用。

4. **安培-麥克斯韋律**：curl(B) = mu_0 J + mu_0 epsilon_0 dE/dt（微分）或環路積分(B · dl) = mu_0 I_enc + mu_0 epsilon_0 d(Phi_E)/dt（積分）。電流與變 E 生旋 B。位移電流項 mu_0 epsilon_0 dE/dt 乃波播與電流連續之要。

5. **形選**：局部場算、波方程、偏微分方程用微分形式；高對稱場直接可提取者用積分形式。

6. **識生效方程**：非每題四方程皆獨立。靜電（dB/dt = 0、J = 0）只需 E 之高斯律與 curl(E) = 0。靜磁只需 B 之高斯律與安培律（無位移電流）。

```markdown
## Maxwell Equations for This Problem
- **Form**: [differential / integral / both]
- **Active equations**: [list which of the four are non-trivial constraints]
- **Source terms**: rho = [charge density], J = [current density]
- **Time dependence**: [static / harmonic / general]
- **Displacement current**: [negligible / essential -- with justification]
```

**得：** 四方程已陳，相關子集有理由而識，位移電流或已納或已明證可略。

**敗則：** 若不知位移電流是否要緊，估 |epsilon_0 dE/dt| / |J| 比。若此比近一或大，位移電流必留。真空無自由電荷者，位移電流波播必要。

### 第二步：施邊界條件與對稱

以界面與幾何對稱簡系：

1. **界面邊界條件**：介質一、二之界，有面電荷 sigma_f 與面電流 K_f：
   - 法向 E：epsilon_1 E_1n - epsilon_2 E_2n = sigma_f
   - 切向 E：E_1t = E_2t（連續）
   - 法向 B：B_1n = B_2n（連續）
   - 切向 H：n_hat × (H_1 - H_2) = K_f（n_hat 由二指一）

2. **導體邊界條件**：理想導體面：
   - E_tangential = 0（體內 E = 0）
   - B_normal = 0（時變場體內 B = 0）
   - 面電荷：sigma = epsilon_0 E_normal
   - 面電流：K = (1/mu_0) n_hat × B

3. **對稱簡化**：以所識對稱減獨立變數：
   - 平對稱：場依一座標（如 z），偏微分降為常微分
   - 柱對稱：場依 (rho, z) 或只 rho
   - 球對稱：場只依 r
   - 平移不變：於不變向傅立葉變換

4. **規範擇**（用勢者）：擇純勢 phi 與矢勢 A 之規範：
   - 庫侖規範：div(A) = 0（分離靜電與輻射貢獻）
   - 洛倫茲規範：div(A) + mu_0 epsilon_0 d(phi)/dt = 0（顯洛倫茲協變，波方程解耦）

```markdown
## Boundary Conditions and Symmetry
- **Interfaces**: [list with media properties on each side]
- **Boundary conditions applied**: [normal E, tangential E, normal B, tangential H]
- **Symmetry**: [planar / cylindrical / spherical / none]
- **Reduced coordinates**: [independent variables after symmetry reduction]
- **Gauge** (if using potentials): [Coulomb / Lorenz / other]
```

**得：** 每界面皆陳邊界條件，對稱已用以減維，問題待解偏微分方程。

**敗則：** 若邊界條件過定（界面方程多於未知），察場分量數與條件數是否合。若欠定，漏一條件——常為切向 H 條件或無窮遠輻射條件。

### 第三步：解所得偏微分方程

解麥克斯韋方程或其派生形式求場：

1. **波方程推導**：於無源、線性、均勻介質：
   - 取法拉第律之旋：curl(curl(E)) = -d/dt(curl(B))
   - 代入安培-麥克斯韋：curl(curl(E)) = -mu epsilon d^2E/dt^2
   - 用矢量恆等：curl(curl(E)) = grad(div(E)) - nabla^2(E)
   - 無自由電荷 div(E) = 0：nabla^2(E) = mu epsilon d^2E/dt^2
   - 波速：v = 1/sqrt(mu epsilon)；真空 c = 1/sqrt(mu_0 epsilon_0)
   - B 亦同

2. **平面波解**：沿 z 向傳：
   - E(z, t) = E_0 exp[i(kz - omega t)]，k = omega/v = omega · sqrt(mu epsilon)
   - B = (1/v) k_hat × E（垂直於 E 與傳播向）
   - |B| = |E|/v
   - 偏振：依 E_0 分量為線、圓、橢圓

3. **拉普拉斯與泊松方程**（靜）：
   - 無時依：nabla^2(phi) = -rho/epsilon_0（泊松）或 nabla^2(phi) = 0（拉普拉斯）
   - 於合適座標系分離變數
   - 配邊界條件定展開係數

4. **導波與腔**：波導與共振腔：
   - 分 TE（橫電）、TM（橫磁）模
   - 施導壁邊界條件
   - 解特徵值問題得允許傳播常數或共振頻率
   - 截止頻率：omega_c = v · pi · sqrt((m/a)^2 + (n/b)^2)，矩形導 a × b

5. **導體趨膚深度**：時變場入電導率 sigma_c 之導體：
   - delta = sqrt(2 / (omega mu sigma_c))
   - 場依 exp(-z/delta) 衰減
   - 銅中 60 Hz：delta 約 8.5 mm；1 GHz：delta 約 2 微米

```markdown
## Field Solution
- **Equation solved**: [wave equation / Laplace / Poisson / eigenvalue]
- **Solution method**: [separation of variables / Fourier transform / Green's function / numerical]
- **Result**: E(r, t) = [expression], B(r, t) = [expression]
- **Dispersion relation**: omega(k) = [if wave solution]
- **Characteristic scales**: [wavelength, skin depth, decay length]
```

**得：** 顯式場表達滿足麥克斯韋方程與所有邊界條件，若為波解有色散關係或特徵值譜。

**敗則：** 若偏微分方程於所擇座標系不可分離，換系或用數值法（有限差、有限元）。若代回有一方程不滿足，推導有代數誤——察旋與散運算。

### 第四步：算派生量

自場解抽物理有意義之量：

1. **坡印廷向量**：S = (1/mu_0) E × B（瞬時能通，W/m^2）：
   - 平面波：S = (1/mu_0) |E|^2 / v 沿傳播向
   - 時均：<S> = (1/2) Re(E × H*) 諧場
   - 強度：I = |<S>|（單位面積功率）

2. **電磁能密度**：
   - 真空：u = (1/2)(epsilon_0 |E|^2 + |B|^2/mu_0)
   - 線性介質：u = (1/2)(E · D + B · H)
   - 能守恆：du/dt + div(S) = -J · E（坡印廷定理）

3. **輻射壓**：平面波入面：
   - 全吸收：P_rad = I/c = <S>/c
   - 全反射：P_rad = 2I/c = 2<S>/c
   - 此乃場之動量通密度

4. **波阻抗**：
   - 介質中：eta = sqrt(mu/epsilon) = mu · v
   - 真空：eta_0 = sqrt(mu_0/epsilon_0) 約 377 歐
   - 關 E 與 H 幅：|E| = eta |H|
   - 正入射反射係數：r = (eta_2 - eta_1)/(eta_2 + eta_1)

5. **功率耗與品質因子**：
   - 歐姆耗單位體積：p_loss = sigma |E|^2 / 2（導體中）
   - 腔之品質因子：Q = omega · (儲能) / (每週期耗能)
   - 關共振帶寬：Delta_omega = omega / Q

```markdown
## Derived Quantities
- **Poynting vector**: S = [expression], <S> = [time-averaged]
- **Energy density**: u = [expression]
- **Radiation pressure**: P_rad = [value]
- **Wave impedance**: eta = [value]
- **Reflection/transmission**: r = [value], t = [value]
- **Q-factor** (if resonant): Q = [value]
```

**得：** 派生量皆算單位正，以坡印廷定理驗能守恆，幅度物理合理。

**敗則：** 若坡印廷定理不平（du/dt + div(S) 不等 -J · E），E 與 B 解不一致。驗兩場同時滿足四方程。常誤：由不同近似算 E 與 B，彼此不一致。

### 第五步：驗已知極限

察全解於極限情況正確：

1. **靜極（omega -> 0）**：解應降為靜電或靜磁結果：
   - E 場應滿足庫侖律或拉普拉斯/泊松方程
   - B 場應滿足畢奧-薩伐爾律或安培律（無位移電流）
   - 位移電流消：mu_0 epsilon_0 dE/dt -> 0

2. **平面波極**：無源無界介質，解應降為 v = 1/sqrt(mu epsilon) 之平面波與正確偏振。

3. **理想導體極（sigma -> inf）**：
   - 趨膚深度 delta -> 0（場不入）
   - 表面切向 E -> 0
   - 反射係數 r -> -1（相位倒全反射）

4. **真空極（epsilon_r = 1、mu_r = 1）**：材料相關量應降為真空值。波速應等 c。阻抗應等 eta_0 約 377 歐。

5. **能守恆驗**：坡印廷定理於閉體積積。全場能變率加過表面流出功率應等體內電流所給負功率。任不平示誤。

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

**得：** 所有極限皆得正確已知結果。能守恆至數值精度內滿足。

**敗則：** 極限失乃誤之確證。靜極失示源項或邊界條件問題。平面波極失示波方程推導誤。能守恆失示 E 與 B 解不一致。溯誤至具體步驟改正後方納解。

## 驗

- [ ] 四方程皆陳，相關子集已識
- [ ] 位移電流已納或明證可略
- [ ] 每界面皆施邊界條件
- [ ] 對稱已用減維
- [ ] 波方程（或拉普拉斯/泊松）推導正確
- [ ] 場解代回滿足四方程
- [ ] 坡印廷向量與能密度算單位正（W/m^2、J/m^3）
- [ ] 坡印廷定理（能守恆）已驗
- [ ] 波阻抗與反射/透射係數物理合理
- [ ] 靜極重現庫侖與畢奧-薩伐爾律
- [ ] 平面波極得 v = 1/sqrt(mu epsilon) 與正交 E、B、k
- [ ] 解足以使他研究者重現

## 陷

- **略位移電流**：原安培律（curl B = mu_0 J）取散得 div(J) = 0，與時變 rho 之電荷守恆矛盾。位移電流項 mu_0 epsilon_0 dE/dt 補之，波播必要。非驗 dE/dt 相對 J/epsilon_0 可略，勿棄
- **E、B 解不一致**：獨立解 E 與 B（如由高斯律得 E、由安培律得 B）而不驗法拉第律與 B 之高斯律，或生不相容場。必驗四方程
- **邊界條件法向誤**：n_hat × (H_1 - H_2) = K_f 之 n_hat 必由介質二指一。反向則面電流條件反號
- **材料中 D、E、B、H 混**：真空 D = epsilon_0 E、B = mu_0 H。線性介質 D = epsilon E、B = mu H。材料中麥克斯韋方程自由源項用 D 與 H，力律用 E 與 B。混構成方程致 epsilon_r 或 mu_r 因子誤
- **相速與群速**：v = omega/k 乃相速。能與訊以群速 v_g = d(omega)/dk 傳。色散介質二者異，以相速論能傳致誤
- **忘輻射條件**：無界散射與輻射問題，解須滿足索末菲輻射條件（無窮遠外行波）。無此條件解不唯一，或含非物理入波

## 參

- `analyze-magnetic-field` — 算靜 B 場，為麥克斯韋方程之靜磁極
- `solve-electromagnetic-induction` — 施法拉第律於具體感應幾何與 RL 電路
- `formulate-quantum-problem` — 量子化電磁場於量子光學與 QED
- `derive-theoretical-result` — 嚴推波方程、格林函數、色散關係
- `analyze-diffusion-dynamics` — 擴散方程於導體介質源自麥克斯韋方程（趨膚效應）
