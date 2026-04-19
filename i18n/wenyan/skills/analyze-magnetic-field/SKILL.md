---
name: analyze-magnetic-field
locale: wenyan
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

以 Biot-Savart 律、安培律、磁偶極近算繪電流分布所生之磁場。描源之幾何、擇宜律（任幾何用 Biot-Savart、高對稱用安培）、算場積、察極限、納磁材之影、繪所得之線拓。

## 用時

- 算任載流導（環、螺、不規）之 B 場乃用
- 用柱、面、環對稱以直施安培律乃用
- 以磁偶極近估遠場乃用
- 疊多源之場乃用
- 析磁材：線性磁導、B-H 線、磁滯、飽和乃用

## 入

- **必要**：流分布之規（幾何、流幅與向）
- **必要**：場所需之區（觀點或體）
- **可選**：材屬（相磁導、B-H 線數、矯頑、剩磁）
- **可選**：所求準（精積、多極展開階、數值解）
- **可選**：視之求（二維切、三維線、幅等值圖）

## 法

### 第一步：描流分布與幾何

擇法前全規源：

1. **流徑**：述諸載流元之幾何。線流以參曲線 r'(t) 規。面流以面流密 K（A/m）規。體流以 J（A/m^2）規。
2. **坐標**：擇與主對稱齊之坐標。線與螺用柱（rho, phi, z）。偶極與遠環用球（r, theta, phi）。面片用卡氏。
3. **對稱析**：識平移、旋、反射對稱。源之對稱即場之對稱。書 B 由對稱何分非零、何分零。
4. **流連續**：驗分布合 div(J) = 0（穩態）或 div(J) = -d(rho)/dt（時變）。不一之流分布生非物理之場。

```markdown
## Source Characterization
- **Current type**: [line I / surface K / volume J]
- **Geometry**: [parametric description]
- **Coordinate system**: [and justification]
- **Symmetries**: [translational / rotational / reflection]
- **Nonzero B-components by symmetry**: [list]
- **Current continuity**: [verified / issue noted]
```

**得：** 流分布之全幾何述附坐標擇、對稱錄、流連續驗。

**敗則：** 若幾何繁不可閉式參述，離散為短直段（數值 Biot-Savart）。若流連續違，加位移流或返荷積項而進。

### 第二步：擇宜律

擇合題對稱與繁之法：

1. **安培律**（高對稱）：源有足對稱使 B 可出線積時用。適用：
   - 無限直線（柱對稱）→ 圓安培環
   - 無限螺（平移+旋）→ 矩形安培環
   - 環形（繞環軸旋）→ 圓安培環
   - 無限面流（二向平移）→ 矩形環

2. **Biot-Savart 律**（通）：任幾何安培不可簡者用：
   - dB = (mu_0 / 4 pi) * (I dl' x r_hat) / r^2
   - 體流：B(r) = (mu_0 / 4 pi) * 積 (J(r') x r_hat) / r^2 dV'

3. **磁偶極近**（遠場）：觀點遠於源（r >> 源維 d）時用：
   - 算磁偶極矩：m = I * A * n_hat（面環面積 A）
   - B_dipole(r) = (mu_0 / 4 pi) * [3(m . r_hat) r_hat - m] / r^3
   - r/d > 5 時約 1% 準

4. **疊加**：多源則各算 B 且矢和。Maxwell 方程之線性保此精。

```markdown
## Method Selection
- **Primary method**: [Ampere / Biot-Savart / dipole]
- **Justification**: [symmetry argument or distance criterion]
- **Expected complexity**: [closed-form / single integral / numerical]
- **Fallback method**: [if primary fails or for cross-validation]
```

**得：** 有由之法擇，明所擇律何以合題對稱。

**敗則：** 若擇安培而對稱不足（B 不可出積），退 Biot-Savart。若幾何繁不可解析 Biot-Savart，數值離散。

### 第三步：立且算場積

以第二步擇之法行算：

1. **安培律路**：每安培環：
   - 參路，算 B . dl 線積
   - 算封流 I_enc，計穿環之諸流
   - 解：contour_integral(B . dl) = mu_0 * I_enc
   - 以第一步對稱自積取 B

2. **Biot-Savart 積**：每場點 r：
   - 參源：dl' = (dr'/dt) dt 或體之 J(r')
   - 算位移：r - r' 與其 |r - r'|
   - 算叉：dl' x (r - r') 或 J x (r - r')
   - 積源（線、面、體）
   - 解析評：以對稱減維（如環軸場只一積）
   - 數值評：離散為 N 段，算和，倍 N 察收

3. **偶極算**：
   - 算總磁矩：體流 m = (1/2) 積 (r' x J) dV'，或面環 m = I * A * n_hat
   - 每觀點施偶極場式
   - 估誤：下一多極（四極）校階 (d/r)^4

4. **疊加裝配**：每觀點和諸源貢。分分獨記以保抵消精。

```markdown
## Field Calculation
- **Integral setup**: [explicit expression]
- **Evaluation method**: [analytic / numeric with N segments]
- **Result**: B(r) = [expression with units]
- **Convergence check** (if numerical): [N vs. 2N comparison]
```

**得：** 觀點 B(r) 之明式附正單位（特斯拉或高斯）及數值之收察。

**敗則：** 若積發散，察缺正則（如無限薄線上場發散——用有限線徑）。若數值果隨 N 振，被積近奇，需自適應積或解析減奇部。

### 第四步：察極限

結果未信前對已知物理驗之：

1. **遠場偶極限**：大 r 時任局流分布之場當合磁偶極式。自結果算 r → 無限時之 B 比於 (mu_0 / 4 pi) * [3(m . r_hat) r_hat - m] / r^3。

2. **近場無限線限**：導之長直段附近（rho << L），場當趨 B = mu_0 I / (2 pi rho)。於幾何相關部察此。

3. **軸上特例**：環與螺軸上之場有簡閉式：
   - 半徑 R 之單環，軸上距 z：B_z = mu_0 I R^2 / [2 (R^2 + z^2)^(3/2)]
   - 長 L 螺，每長 n 匝：B_interior = mu_0 n I（L >> R）

4. **對稱之一致**：驗第一步對稱預零之分確於所算果為零。非零禁分示訛。

5. **量綱析**：驗 B 有特斯拉之單位。每項當攜 mu_0 * [流] / [長] 或等。

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

**得：** 諸極限皆合。場有正單位、對稱、漸近行。

**敗則：** 極限敗示積立或評之訛。最常：叉號誤、失 2 或 pi 之因、積限誤、源與場點參之坐標不合。

### 第五步：納磁材而視之

擴析以納材影而生場視：

1. **線磁材**：於材內以 mu = mu_r * mu_0 代 mu_0。於材界施界條：
   - 法分：B1_n = B2_n（連）
   - 切分：H1_t - H2_t = K_free（面自由流）
   - 無面自由流：H1_t = H2_t

2. **非線材（B-H 線）**：鐵磁核：
   - 用材 B-H 線於每點連 B 與 H
   - 設計之故，以分段線性近：線區（B = mu H）、拐區、飽區（B 近恆）
   - 操點循環則計磁滯：剩磁 B_r 與矯頑 H_c 定環

3. **退磁效**：有限幾何磁材（短棒、球），內場以退磁因 N_d 減：H_internal = H_applied - N_d * M。

4. **場視**：
   - 繪場線以流函或沿場向積 dB/ds
   - 繪幅等值（|B| 為色圖）
   - 二維切示流向（出頁為點、入頁為叉）
   - 驗場線成閉環（div B = 0）——開線示視或算之訛

5. **物理直觀察**：確場式質相合。場當強於源附近、繞流（右手則）、隨距衰。

```markdown
## Material Effects and Visualization
- **Material model**: [vacuum / linear mu_r / nonlinear B-H / hysteretic]
- **Boundary conditions applied**: [list interfaces]
- **Visualization**: [field lines / magnitude contour / both]
- **Div B = 0 check**: [field lines close / verified numerically]
```

**得：** 全場解含材影，視顯閉場線合 div B = 0 而質合物理直觀。

**敗則：** 若場線不閉，算有發散訛——再察積或數法。若材引非期場放大，驗 mu_r 只於材體施且界條於每界正強。

## 驗

- [ ] 流分布全規幾何、幅、向
- [ ] 流連續（穩態 div J = 0）已驗
- [ ] 坐標齊於主對稱
- [ ] 法擇（安培/Biot-Savart/偶極）由對稱析證
- [ ] 場積立以正叉與積限
- [ ] 數值果示收（N 對 2N 試）
- [ ] 遠場偶極限已驗
- [ ] 近場與軸上限合已知式
- [ ] 禁對稱分為零
- [ ] 通為特斯拉
- [ ] 材界條正施（若適）
- [ ] 場線成閉環（div B = 0）

## 陷

- **叉向誤**：Biot-Savart 之叉為 dl' x r_hat（源至場），非 r_hat x dl'。反則場向全倒。以右手則速察
- **混 B 與 H**：真空 B = mu_0 H，然磁材內 B = mu H。以 H 之安培律只用自由流；以 B 則含束（磁化）流。混約生 mu_r 因之訛
- **對稱不足而用安培**：安培律恆真然只於對稱使 B 可出積時有用。若 B 沿安培環變，律給空變函之一標方程——欠定
- **忽「無限」線之有限長**：實螺與線有端。無限線或無限螺式只於遠端（離端 >> 徑）有效。近端用全 Biot-Savart 或有限螺校
- **忽有限幾何之退磁**：磁化之球或短棒與長棒於同施場不同內場。退磁因可減有效內場 30-100% 依縱橫比
- **非物理場線**：若視示始終於空（非源非無限）之線，算或繪有訛。磁場線恆成閉環

## 參

- `solve-electromagnetic-induction` — 用所算 B 場析時變通量與感 EMF
- `formulate-maxwell-equations` — 擴至全 Maxwell 方程含位移流與波傳
- `design-electromagnetic-device` — 將磁場析施於電磁器、電機、變壓器之設
- `formulate-quantum-problem` — 磁互之量子處（Zeeman 效、自旋軌道耦）
