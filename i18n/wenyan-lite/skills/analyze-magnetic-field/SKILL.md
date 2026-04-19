---
name: analyze-magnetic-field
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Calculate and visualize magnetic fields produced by current distributions
  using the Biot-Savart law, Ampere's law, and magnetic dipole approximations.
  Use when computing B-fields from arbitrary current geometries, exploiting
  symmetry with Ampere's law, analyzing superposition of multiple sources,
  or characterizing magnetic materials through permeability, B-H curves,
  and hysteresis behavior.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: electromagnetism
  complexity: intermediate
  language: natural
  tags: electromagnetism, magnetic-fields, biot-savart, ampere, magnetic-materials
---

# 析磁場

藉刻劃源幾何、擇宜法（任意幾何用 Biot-Savart、高對稱配置用安培定律）、評場積分、查極限情況、納磁性材料效應、視覺化所成場線拓撲，計算給定電流分佈所生之磁場。

## 適用時機

- 自任意載流導體（線圈、螺旋、不規則路徑）計算 B 場
- 利用圓柱、平面或環形對稱直施安培定律
- 經磁偶極近似估遠場行為
- 多電流源之場疊加
- 析磁性材料：線性磁導率、B-H 曲線、磁滯、飽和

## 輸入

- **必要**：電流分佈規格（幾何、電流大小與方向）
- **必要**：所需場之關注區域（觀測點或體積）
- **選擇性**：材料性質（相對磁導率、B-H 曲線資料、矯頑場、剩磁）
- **選擇性**：所需精度等級（精確積分、多極展開階、數值解析度）
- **選擇性**：視覺化需求（2D 截面、3D 場線、幅值等高線圖）

## 步驟

### 步驟一：刻劃電流分佈與幾何

擇法前先全規源：

1. **電流路徑**：描述每載流元素之幾何。對線電流，將路徑作參數曲線 r'(t)。對面電流，述面電流密度 K (A/m)。對體電流，述 J (A/m^2)
2. **座標系**：擇與主對稱對齊之座標。線與螺管用圓柱 (rho, phi, z)。遠距偶極與環圈用球面 (r, theta, phi)。平面片用直角
3. **對稱分析**：辨平移、旋轉、反射對稱。源之對稱即場之對稱。記何 B 分量按對稱非零、何者消
4. **電流連續**：驗電流分佈滿足 div(J) = 0（穩態）或 div(J) = -d(rho)/dt（時變）。不一致之電流分佈生非物理之場

```markdown
## Source Characterization
- **Current type**: [line I / surface K / volume J]
- **Geometry**: [parametric description]
- **Coordinate system**: [and justification]
- **Symmetries**: [translational / rotational / reflection]
- **Nonzero B-components by symmetry**: [list]
- **Current continuity**: [verified / issue noted]
```

**預期：** 完整之電流分佈幾何描述，已擇座標系，已列對稱，已驗電流連續。

**失敗時：** 若幾何過繁難閉式參數描述，離散為短直段（數值 Biot-Savart）。若電流連續違，先加位移電流或回流電荷積累項再續。

### 步驟二：擇宜法

擇合於問題對稱與繁複之法：

1. **安培定律**（高對稱）：電流分佈具足對稱使 B 可自線積分提出時用。適用：
   - 無限直線（圓柱對稱）-> 圓形安培環
   - 無限螺管（平移 + 旋轉）-> 矩形安培環
   - 環形（繞環軸旋轉）-> 圓形安培環
   - 無限平面電流片（二向平移）-> 矩形環

2. **Biot-Savart 定律**（一般）：安培定律不能化簡之任意幾何用：
   - dB = (mu_0 / 4 pi) * (I dl' x r_hat) / r^2
   - 對體電流：B(r) = (mu_0 / 4 pi) * integral of (J(r') x r_hat) / r^2 dV'

3. **磁偶極近似**（遠場）：觀測點離源遠時用（r >> 源尺寸 d）：
   - 計磁偶極矩：m = I * A * n_hat（面積 A 之平面圈）
   - B_dipole(r) = (mu_0 / 4 pi) * [3(m . r_hat) r_hat - m] / r^3
   - r/d > 5 時有效，約 1% 精度

4. **疊加**：多源時，獨立計各 B 並向量和。Maxwell 方程之線性保此精確。

```markdown
## Method Selection
- **Primary method**: [Ampere / Biot-Savart / dipole]
- **Justification**: [symmetry argument or distance criterion]
- **Expected complexity**: [closed-form / single integral / numerical]
- **Fallback method**: [if primary fails or for cross-validation]
```

**預期：** 法之選擇有理，明陳所擇定律何以合於問題之對稱層次。

**失敗時：** 若擇安培定律然對稱不足（B 不能自積分提取），退用 Biot-Savart。若源幾何過繁難解析 Biot-Savart，數值離散。

### 步驟三：設立並評場積分

以步驟二所擇法執計算：

1. **安培定律路徑**：對每安培環：
   - 將環路徑參數化並計 B . dl 之線積分
   - 計穿環之全電流 I_enc，數一切穿過環之電流
   - 解：contour_integral(B . dl) = mu_0 * I_enc
   - 用步驟一所立對稱由積分提出 B

2. **Biot-Savart 積分**：對每場點 r：
   - 將源參數化：dl' = (dr'/dt) dt，或於體上述 J(r')
   - 計位移向量：r - r' 與其大小 |r - r'|
   - 評叉積：dl' x (r - r') 或 J x (r - r')
   - 對源（線、面或體）積分
   - 解析評：用對稱降維（如圈之軸上場僅一積分）
   - 數值評：離散為 N 段，計和，倍 N 查收斂

3. **偶極計算**：
   - 計總磁矩：m = (1/2) integral of (r' x J) dV'（體電流），或 m = I * A * n_hat（平面圈）
   - 於每觀測點施偶極場公式
   - 估誤差：下一多極（四極）修正以 (d/r)^4 縮放

4. **疊加組裝**：於每觀測點和諸源貢獻。分別追各分量以保抵銷精度。

```markdown
## Field Calculation
- **Integral setup**: [explicit expression]
- **Evaluation method**: [analytic / numeric with N segments]
- **Result**: B(r) = [expression with units]
- **Convergence check** (if numerical): [N vs. 2N comparison]
```

**預期：** 觀測點 B(r) 之明確表達式，附正確單位（特斯拉或高斯）與數值結果之收斂查。

**失敗時：** 若積分發散，查缺正則化（如導線本身之場對無限細線發散——用有限線徑）。若數值結果隨 N 振盪，被積函式有近奇異須適應性求積或解析減去奇異部。

### 步驟四：查極限情況

信任結果前對已知物理驗：

1. **遠場偶極極限**：大 r 時，任局部電流分佈應產一場合於磁偶極公式。自結果計 r -> infinity 之 B 並比 (mu_0 / 4 pi) * [3(m . r_hat) r_hat - m] / r^3。

2. **近場無限線極限**：近導體之長直段（距 rho << 長 L），場應趨 B = mu_0 I / (2 pi rho)。對幾何之相關部分查此。

3. **軸上特殊情況**：對圈與螺管，軸上場有簡明閉式：
   - 半徑 R 之單圓圈於軸上距 z 處：B_z = mu_0 I R^2 / [2 (R^2 + z^2)^(3/2)]
   - 長 L、每長 n 匝之螺管：B_interior = mu_0 n I（L >> R 時）

4. **對稱一致**：驗按對稱（步驟一）應消之分量於計算結果中確為零。非零之禁分量表錯誤。

5. **量綱分析**：驗 B 為特斯拉單位。每項應帶 mu_0 * [電流] / [長] 或同等。

```markdown
## Limiting Case Verification
| Case | Condition | Expected | Computed | Match |
|------|-----------|----------|----------|-------|
| Far-field dipole | r >> d | mu_0 m / (4 pi r^3) scaling | [result] | [Yes/No] |
| Near-field wire | rho << L | mu_0 I / (2 pi rho) | [result] | [Yes/No] |
| On-axis formula | [geometry] | [known result] | [result] | [Yes/No] |
| Symmetry zeros | [component] | 0 | [result] | [Yes/No] |
| Units | -- | Tesla | [check] | [Yes/No] |
```

**預期：** 一切極限情況皆合。場具正確之單位、對稱與漸近行為。

**失敗時：** 失敗之極限表積分設立或評估有誤。最常見之因：叉積符號錯、缺 2 或 pi 之因子、積分極限有誤、源與場點參數化之座標系不符。

### 步驟五：納磁性材料並視覺化

延分析以含材料效應並產場視覺化：

1. **線性磁性材料**：於材料內以 mu = mu_r * mu_0 代 mu_0。施材料介面之邊界條件：
   - 法分量：B1_n = B2_n（連續）
   - 切分量：H1_t - H2_t = K_free（面自由電流）
   - 無自由面電流時：H1_t = H2_t

2. **非線性材料（B-H 曲線）**：對鐵磁芯：
   - 用材料之 B-H 曲線於每點關聯 B 與 H
   - 為設計目的，以分段線性近似：線性區（B = mu H）、膝區與飽和區（B 約常）
   - 若操作點循環則計磁滯：剩磁 B_r 與矯頑場 H_c 定環

3. **退磁效應**：對有限幾何之磁性材料（如短桿、球），內場由退磁因子 N_d 減：H_internal = H_applied - N_d * M。

4. **場視覺化**：
   - 以流函式或沿場方向積分 dB/ds 繪場線
   - 繪幅值等高線（|B| 為色圖）
   - 對 2D 截面，標電流方向（出頁為點，入頁為叉）
   - 驗場線形成閉環（div B = 0）——開場線表視覺化或計算錯誤

5. **物理直覺查**：確場型於質性上合理。場應於電流源近最強，應繞電流循環（右手定則），並隨距衰減。

```markdown
## Material Effects and Visualization
- **Material model**: [vacuum / linear mu_r / nonlinear B-H / hysteretic]
- **Boundary conditions applied**: [list interfaces]
- **Visualization**: [field lines / magnitude contour / both]
- **Div B = 0 check**: [field lines close / verified numerically]
```

**預期：** 完整之場解，含相關材料效應，附呈閉場線（合 div B = 0）與合物理直覺之質性行為之視覺化。

**失敗時：** 若場線不閉，計算有發散誤——重查積分或數值法。若材料引非預期之場放大，驗 mu_r 僅施於材料體積內，且邊界條件於每介面正確施行。

## 驗證

- [ ] 電流分佈以幾何、大小、方向全規定
- [ ] 電流連續（穩態下 div J = 0）已驗
- [ ] 座標系與主對稱對齊
- [ ] 法之選擇（安培／Biot-Savart／偶極）以對稱分析為理
- [ ] 場積分以正確之叉積與極限設立
- [ ] 數值結果呈收斂（N 對 2N 試）
- [ ] 遠場偶極極限已驗
- [ ] 近場與軸上極限合已知公式
- [ ] 禁對稱分量為零
- [ ] 全程單位為特斯拉
- [ ] 材料邊界條件正確施行（若適用）
- [ ] 場線形成閉環（div B = 0）

## 常見陷阱

- **叉積方向錯**：Biot-Savart 之叉積為 dl' x r_hat（源至場），非 r_hat x dl'。反之則整場方向反。以右手定則速查
- **混 B 與 H**：真空中 B = mu_0 H，然磁性材料內 B = mu H。安培定律以 H 表時僅用自由電流；以 B 表時含束縛（磁化）電流。混慣例致 mu_r 因子之誤
- **無足對稱即施安培定律**：安培定律恆真，然僅於對稱可使 B 自積分提取時方有用。若 B 沿安培環變，定律對空間變化之函式僅給單一純量方程——不足以定
- **忽「無限」線之有限長**：實螺管與線有端。無限線或無限螺管公式僅於遠端時有效（距端 >> 半徑）。近端用完整 Biot-Savart 積分或有限螺管修正
- **有限幾何中忽退磁**：磁化球或短桿於同施場下之內場與長桿不同。退磁因子可依長寬比減有效內場 30-100%
- **非物理之場線**：若視覺化呈於自由空間中始或終之場線（非於電流源或無限），計算或繪圖演算法有誤。磁場線恆形成閉環

## 相關技能

- `solve-electromagnetic-induction` — 用所計 B 場析時變磁通與感應 EMF
- `formulate-maxwell-equations` — 推廣至 Maxwell 方程之全套，含位移電流與波傳播
- `design-electromagnetic-device` — 將磁場分析施於電磁鐵、馬達、變壓器之設計
- `formulate-quantum-problem` — 磁交互之量子處理（Zeeman 效應、自旋軌道耦合）
