---
name: formulate-maxwell-equations
locale: wenyan-lite
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

# 建 Maxwell 方程組

以整合或微分形式析電磁之現象：陳相關 Maxwell 方程、施邊界條件與對稱以簡化系統、解所致之偏微分方程以得場、算 Poynting 向量、輻射壓與波阻抗等衍生量、驗解於已知之靜態與波之極限。

## 適用時機

- 於有源與材料介面之域解 E 場、B 場之邊界問題
- 自基本原理導出電磁波方程
- 計算能流（Poynting 向量）與電磁場之動量密度
- 於異質介面（介電質、導體、磁性材料）施邊界條件
- 析位移電流及其完成 Ampere-Maxwell 方程之作用
- 連靜態極限（Coulomb 定律、Biot-Savart）於統一之時變框架

## 輸入

- **必要**：物理配置（幾何、源電荷與電流、材料性質）
- **必要**：欲求之量（E 場、B 場、波解、能通量或邊界場值）
- **選擇性**：對稱資訊（平面、柱面、球面或無特殊對稱）
- **選擇性**：時間相依（靜態、頻 omega 諧振或一般時變）
- **選擇性**：材料介面或導體面之邊界條件

## 步驟

### 步驟一：陳四方程並識相關子集

書全集，擇哪些方程約束本題：

1. **E 之 Gauss 定律**：div(E) = rho / epsilon_0（微分）或 closed_surface_integral(E . dA) = Q_enc / epsilon_0（整合）。關 E 場散度於電荷密度。用於具對稱之電荷分佈求 E。

2. **B 之 Gauss 定律**：div(B) = 0（微分）或 closed_surface_integral(B . dA) = 0（整合）。無磁單極。磁場線皆閉環。用為 B 場之一致性檢驗。

3. **Faraday 定律**：curl(E) = -dB/dt（微分）或 contour_integral(E . dl) = -d(Phi_B)/dt（整合）。變 B 場生旋 E 場。用於感應問題與波之導出。

4. **Ampere-Maxwell 定律**：curl(B) = mu_0 J + mu_0 epsilon_0 dE/dt（微分）或 contour_integral(B . dl) = mu_0 I_enc + mu_0 epsilon_0 d(Phi_E)/dt（整合）。電流與變 E 場生旋 B 場。位移電流項 mu_0 epsilon_0 dE/dt 對波傳播與電流連續性為要。

5. **擇形**：局部場算、波方程與偏微分方程取微分形。高對稱問題可自整合直出場者，取整合形。

6. **識主動方程**：非所有四方程於每題皆為獨立約束。靜電（dB/dt = 0、J = 0）僅 E 之 Gauss 定律與 curl(E) = 0 要。磁靜電則 B 之 Gauss 定律與 Ampere 定律（無位移電流）足矣。

```markdown
## 本題之 Maxwell 方程
- **形**：[微分 / 整合 / 兼]
- **主動方程**：[列四者中哪些為非平凡約束]
- **源項**：rho = [電荷密度]、J = [電流密度]
- **時依**：[靜態 / 諧振 / 一般]
- **位移電流**：[可忽 / 要——附理由]
```

**預期：** 四方程陳出，相關子集附理由識出，位移電流或納入或明言其可忽。

**失敗時：** 若不明位移電流重否，估 |epsilon_0 dE/dt| / |J| 之比。若此比近一或大於一，則位移電流必留。真空無自由電荷時，位移電流於波傳播永為要。

### 步驟二：施邊界條件與對稱

用材料介面與幾何對稱簡化系統：

1. **材料介面之邊界條件**：介質一與二之介面，有面電荷 sigma_f 與面電流 K_f：
   - 法向 E：epsilon_1 E_1n - epsilon_2 E_2n = sigma_f
   - 切向 E：E_1t = E_2t（連續）
   - 法向 B：B_1n = B_2n（連續）
   - 切向 H：n_hat x (H_1 - H_2) = K_f（n_hat 自二指一）

2. **導體邊界條件**：完美導體面：
   - E_切向 = 0（導體內 E = 0）
   - B_法向 = 0（時變場導體內 B = 0）
   - 面電荷：sigma = epsilon_0 E_法向
   - 面電流：K = (1/mu_0) n_hat x B

3. **對稱簡化**：用識出之對稱減獨立變量：
   - 平面對稱：場僅依一座標（如 z），偏微分方程簡為常微分方程
   - 柱面對稱：場依 (rho, z) 或僅 rho
   - 球面對稱：場僅依 r
   - 平移不變：於不變方向作 Fourier 轉換

4. **規範之擇**（若用位能）：擇純量位 phi 與向量位 A 之規範：
   - Coulomb 規範：div(A) = 0（分離靜電與輻射貢獻）
   - Lorenz 規範：div(A) + mu_0 epsilon_0 d(phi)/dt = 0（明顯 Lorentz 協變，解耦波方程）

```markdown
## 邊界條件與對稱
- **介面**：[列每側之介質性質]
- **所施邊界條件**：[法向 E、切向 E、法向 B、切向 H]
- **對稱**：[平面 / 柱面 / 球面 / 無]
- **簡化之座標**：[對稱簡化後之獨立變量]
- **規範**（若用位能）：[Coulomb / Lorenz / 他]
```

**預期：** 邊界條件於每介面盡陳，對稱已用以降維，題已可解偏微分方程。

**失敗時：** 邊界條件過定（一介面方程多於未知）時，核場分量數是否合於條件數。若欠定，則漏一邊界條件——常為切向 H 或無窮遠之輻射條件。

### 步驟三：解偏微分方程

為場量解 Maxwell 方程或其衍生形：

1. **波方程之導出**：無源、線性、均勻介質中：
   - 取 Faraday 定律之 curl：curl(curl(E)) = -d/dt(curl(B))
   - 代 Ampere-Maxwell：curl(curl(E)) = -mu epsilon d^2E/dt^2
   - 用向量恆等式：curl(curl(E)) = grad(div(E)) - nabla^2(E)
   - 配 div(E) = 0（無自由電荷）：nabla^2(E) = mu epsilon d^2E/dt^2
   - 波速：v = 1/sqrt(mu epsilon)；真空中 c = 1/sqrt(mu_0 epsilon_0)
   - B 同方程

2. **平面波解**：沿 z 方向傳播之波：
   - E(z, t) = E_0 exp[i(kz - omega t)]，k = omega/v = omega * sqrt(mu epsilon)
   - B = (1/v) k_hat x E（垂直於 E 及傳播方向）
   - |B| = |E|/v
   - 偏振：依 E_0 分量，線性、圓形或橢圓形

3. **Laplace 與 Poisson 方程**（靜態）：
   - 無時依：nabla^2(phi) = -rho/epsilon_0（Poisson）或 nabla^2(phi) = 0（Laplace）
   - 於合適座標系以變量分離法解之
   - 配邊界條件定展開係數

4. **導波與空腔**：波導與共振腔：
   - 分解為 TE（橫電）與 TM（橫磁）模
   - 施導體壁邊界條件
   - 解特徵值問題得允許之傳播常數或共振頻率
   - 截止頻率：omega_c = v * pi * sqrt((m/a)^2 + (n/b)^2)，矩形導 a x b

5. **導體內之趨膚深度**：時變場入電導率 sigma_c 之導體：
   - delta = sqrt(2 / (omega mu sigma_c))
   - 場依 exp(-z/delta) 於導體中衰減
   - 六十赫茲於銅：delta 約八點五毫米；一千兆赫：delta 約二微米

```markdown
## 場之解
- **所解方程**：[波方程 / Laplace / Poisson / 特徵值]
- **解法**：[變量分離 / Fourier 轉換 / Green 函數 / 數值]
- **結果**：E(r, t) = [表達式]、B(r, t) = [表達式]
- **色散關係**：omega(k) = [若波解]
- **特徵尺度**：[波長、趨膚深度、衰減長度]
```

**預期：** 場之明確表達式滿足 Maxwell 方程與邊界條件，適用時附色散關係或特徵值譜。

**失敗時：** 若所擇座標系中偏微分方程不可分離，試他系或訴諸數值法（有限差分、有限元）。若回代後解不滿足某 Maxwell 方程，則導出有代數誤——重核 curl 與散度運算。

### 步驟四：算衍生量

從場之解提取物理意義之量：

1. **Poynting 向量**：S = (1/mu_0) E x B（瞬時能通量，W/m^2）：
   - 平面波：S = (1/mu_0) |E|^2 / v，沿傳播方向
   - 時均 Poynting 向量：諧振場 <S> = (1/2) Re(E x H*)
   - 強度：I = |<S>|（每單位面積之功率）

2. **電磁能密度**：
   - u = (1/2)(epsilon_0 |E|^2 + |B|^2/mu_0)，真空
   - u = (1/2)(E . D + B . H)，線性介質
   - 能量守恆：du/dt + div(S) = -J . E（Poynting 定理）

3. **輻射壓**：平面波入射於面：
   - 完美吸收：P_rad = I/c = <S>/c
   - 完美反射：P_rad = 2I/c = 2<S>/c
   - 此為電磁場之動量通量密度

4. **波阻抗**：
   - 介質中：eta = sqrt(mu/epsilon) = mu * v
   - 真空中：eta_0 = sqrt(mu_0/epsilon_0) 約 377 歐姆
   - 關 E 與 H 之幅：|E| = eta |H|
   - 垂直入射之反射係數：r = (eta_2 - eta_1)/(eta_2 + eta_1)

5. **功率耗散與品質因數**：
   - 每單位體積之歐姆損耗：p_loss = sigma |E|^2 / 2（導體中）
   - 空腔之品質因數：Q = omega * (儲能) / (每週期耗散功率)
   - 關共振之頻寬：Delta_omega = omega / Q

```markdown
## 衍生量
- **Poynting 向量**：S = [表達式]、<S> = [時均]
- **能密度**：u = [表達式]
- **輻射壓**：P_rad = [值]
- **波阻抗**：eta = [值]
- **反射/透射**：r = [值]、t = [值]
- **Q 因數**（若共振）：Q = [值]
```

**預期：** 衍生量以正確單位算出，Poynting 定理驗能量守恆，量值合理。

**失敗時：** 若 Poynting 定理不平衡（du/dt + div(S) 不等 -J . E），則 E 與 B 之解不一致。重驗兩場同時滿足四 Maxwell 方程。常見之誤為以不互相一致之近似算 E 與 B。

### 步驟五：驗於已知極限

核全解於極限下正確簡化：

1. **靜態極限（omega -> 0）**：解應簡為靜電或磁靜之結果：
   - E 場應滿足 Coulomb 定律或 Laplace/Poisson 方程
   - B 場應滿足 Biot-Savart 定律或 Ampere 定律（無位移電流）
   - 位移電流消：mu_0 epsilon_0 dE/dt -> 0

2. **平面波極限**：無源、無界介質中，解應簡為平面波，v = 1/sqrt(mu epsilon)，偏振正確。

3. **完美導體極限（sigma -> 無窮）**：
   - 趨膚深度 delta -> 0（場不透入）
   - 切向 E -> 0 於面
   - 反射係數 r -> -1（完美反射，相位反轉）

4. **真空極限（epsilon_r = 1、mu_r = 1）**：材料相關之量應簡為真空值。波速應等 c。阻抗應等 eta_0 約 377 歐姆。

5. **能量守恆之檢**：Poynting 定理於閉體積上積分。總場能變率加通過面流出之功率，應等體內電流所輸功率之負值。不平衡即示誤。

```markdown
## 極限情形驗證
| 極限 | 條件 | 預期 | 所得 | 合 |
|-------|-----------|----------|----------|-------|
| 靜態 | omega -> 0 | Coulomb / Biot-Savart | [結果] | [是/否] |
| 平面波 | 無界介質 | v = c/n、eta = eta_0/n | [結果] | [是/否] |
| 完美導體 | sigma -> 無窮 | delta -> 0、r -> -1 | [結果] | [是/否] |
| 真空 | epsilon_r = mu_r = 1 | c、eta_0 | [結果] | [是/否] |
| 能量守恆 | Poynting 定理 | 平衡 | [檢] | [是/否] |
```

**預期：** 所有極限產生正確已知結果。能量守恆於數值精度內成立。

**失敗時：** 極限失敗乃誤之明證。靜態極限失敗示源項或邊界條件有問題。平面波極限失敗示波方程導出有誤。能量守恆失敗示 E 與 B 解不一致。追失敗至特定步驟改正之，乃納解。

## 驗證

- [ ] 四 Maxwell 方程皆陳，相關子集已識
- [ ] 位移電流已納或明言可忽之理由
- [ ] 邊界條件施於每材料介面
- [ ] 對稱已用以降偏微分方程之維度
- [ ] 波方程（或 Laplace/Poisson 方程）已正確導出
- [ ] 場之解回代後滿足四 Maxwell 方程
- [ ] Poynting 向量與能密度以正確單位算出（W/m^2 與 J/m^3）
- [ ] Poynting 定理（能量守恆）已驗
- [ ] 波阻抗與反射/透射係數值合理
- [ ] 靜態極限重現 Coulomb 定律與 Biot-Savart 定律
- [ ] 平面波極限得 v = 1/sqrt(mu epsilon) 且 E、B、k 正交
- [ ] 解足以令他研究者重現

## 常見陷阱

- **漏位移電流**：原 Ampere 定律（curl B = mu_0 J）取散度得 div(J) = 0，與 rho 隨時變之電荷守恆矛盾。位移電流項 mu_0 epsilon_0 dE/dt 修此，對波傳播為要。未驗 dE/dt 相較 J/epsilon_0 可忽，勿棄之。
- **E 與 B 解不一致**：獨立解 E 與 B（如 E 自 Gauss 定律、B 自 Ampere 定律）而未驗 Faraday 定律與 B 之 Gauss 定律，可生相互不一致之場。必驗四方程。
- **邊界條件法向錯**：約定 n_hat x (H_1 - H_2) = K_f 要求 n_hat 自介質二指介質一。反向則面電流條件之符號翻轉。
- **物質中混淆 D、E、B、H**：真空中 D = epsilon_0 E、B = mu_0 H。線性介質中 D = epsilon E、B = mu H。物質中 Maxwell 方程用 D 與 H 為自由源項，用 E 與 B 為力律。混本構關係致 epsilon_r 或 mu_r 因子誤。
- **相速與群速**：波速 v = omega/k 為相速。能與資訊以群速 v_g = d(omega)/dk 傳播。色散介質中兩者不同，用相速算能量傳輸致誤。
- **忘輻射條件**：無界域之散射與輻射問題，解須滿足 Sommerfeld 輻射條件（無窮遠處出射波）。無此條件解不唯一，可含非物理之入射波。

## 相關技能

- `analyze-magnetic-field` —— 算靜態 B 場，為 Maxwell 方程之磁靜極限
- `solve-electromagnetic-induction` —— 施 Faraday 定律於特定感應幾何與 RL 電路
- `formulate-quantum-problem` —— 量子化電磁場於量子光學與 QED
- `derive-theoretical-result` —— 嚴格導出波方程、Green 函數與色散關係
- `analyze-diffusion-dynamics` —— 擴散方程於導電介質中從 Maxwell 方程而生（趨膚效應）
