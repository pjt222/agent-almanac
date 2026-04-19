---
name: analyze-magnetic-field
locale: wenyan-ultra
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

由電分算磁場：定源、選律（Biot-Savart 任幾、Ampere 對稱）、積分、驗極限、含材效、繪場線。

## 用

- 由任電導算 B 場（線環、螺、不規路）→用
- 用筒、平、環對稱直施 Ampere→用
- 由磁偶估遠場→用
- 多源場疊→用
- 析磁材：線磁導、B-H 曲、滯、飽→用

## 入

- **必**：電分規（幾、流值與向）
- **必**：求場之域（觀點或體）
- **可**：材性（相磁導、B-H 數、矯場、餘磁）
- **可**：精階（精積、多極展階、數辨）
- **可**：視需（2D 切、3D 場線、值等高）

## 行

### 一：定電分與幾

擇法前全規源：

1. **電路**：每電元之幾。線流：路為參曲 r'(t)。面流：面流密 K (A/m)。體流：J (A/m^2)。
2. **座系**：合主對稱。筒（rho、phi、z）為線、螺。球（r、theta、phi）為偶與遠處之環。卡為平片。
3. **對稱析**：識平移、旋、反對稱。源之對稱乃場之對稱。文明 B 諸分由對稱非零或消。
4. **流續**：驗 div(J) = 0（穩態）或 div(J) = -d(rho)/dt（時變）。不一致電分致非物場。

```markdown
## Source Characterization
- **Current type**: [line I / surface K / volume J]
- **Geometry**: [parametric description]
- **Coordinate system**: [and justification]
- **Symmetries**: [translational / rotational / reflection]
- **Nonzero B-components by symmetry**: [list]
- **Current continuity**: [verified / issue noted]
```

得：完整幾述，座定、對稱錄、流續驗。

敗：幾太繁不能閉式參→離為短直段（數 Biot-Savart）。流不續→加位移流或返荷積項再進。

### 二：選律

合題對稱與繁：

1. **Ampere 律**（高對稱）：源之對稱足以由線積出 B。適：
   - 無窮直線（筒對稱）→ 圓 Amperian 環
   - 無窮螺管（平移+旋）→ 矩 Amperian 環
   - 環（旋於環軸）→ 圓 Amperian 環
   - 無窮平流片（兩向平移）→ 矩環

2. **Biot-Savart 律**（通用）：Ampere 不能簡時用：
   - dB = (mu_0 / 4 pi) * (I dl' x r_hat) / r^2
   - 體流：B(r) = (mu_0 / 4 pi) * integral of (J(r') x r_hat) / r^2 dV'

3. **磁偶近**（遠場）：觀於遠（r >> 源 d）：
   - 算磁偶矩：m = I * A * n_hat（平環 A）
   - B_dipole(r) = (mu_0 / 4 pi) * [3(m . r_hat) r_hat - m] / r^3
   - r/d > 5 約 1% 精

4. **疊**：多源各算 B 而向加。Maxwell 線性保此精。

```markdown
## Method Selection
- **Primary method**: [Ampere / Biot-Savart / dipole]
- **Justification**: [symmetry argument or distance criterion]
- **Expected complexity**: [closed-form / single integral / numerical]
- **Fallback method**: [if primary fails or for cross-validation]
```

得：擇法附明由：所擇律何以合對稱階。

敗：選 Ampere 而對稱不足（B 不可由積出）→退至 Biot-Savart。源太繁不能析 Biot-Savart→數離。

### 三：設積分而算

按二步法行算：

1. **Ampere 律路**：各 Amperian 環：
   - 參環路而算 B . dl 線積
   - 計圍流 I_enc 數穿環諸流
   - 解：contour_integral(B . dl) = mu_0 * I_enc
   - 由對稱（一步立）出 B

2. **Biot-Savart 積**：各場點 r：
   - 參源：dl' = (dr'/dt) dt 或表 J(r') 於體
   - 算位移向：r - r' 與其值 |r - r'|
   - 算叉積：dl' x (r - r') 或 J x (r - r')
   - 積於源（線、面、體）
   - 析評：用對稱降維（如環軸場僅一積）
   - 數評：離為 N 段、算和、倍 N 驗收

3. **偶算**：
   - 算總磁矩：m = (1/2) integral of (r' x J) dV' 為體流，或 m = I * A * n_hat 為平環
   - 各觀點施偶場式
   - 估誤：次多極（四極）正按 (d/r)^4 縮

4. **疊裝**：各觀點和諸源貢。各分獨追以保消精。

```markdown
## Field Calculation
- **Integral setup**: [explicit expression]
- **Evaluation method**: [analytic / numeric with N segments]
- **Result**: B(r) = [expression with units]
- **Convergence check** (if numerical): [N vs. 2N comparison]
```

得：B(r) 於觀點之明式，附正單位（Tesla 或 Gauss）與數結之收驗。

敗：積發散→察缺正規（如線本場無窮細線發散——用有限線徑）。數果隨 N 振→積近奇，需適配積或析減奇部。

### 四：驗極限

信前比知物理：

1. **遠場偶極限**：大 r，任局電分應出配磁偶式之場。算 r → 無窮極限與 (mu_0 / 4 pi) * [3(m . r_hat) r_hat - m] / r^3 比。

2. **近場無窮線極限**：近長直導段（距 rho << 長 L），場應近 B = mu_0 I / (2 pi rho)。察相關幾段。

3. **軸特例**：環、螺軸場有簡閉式：
   - 半徑 R 之圓環於軸距 z：B_z = mu_0 I R^2 / [2 (R^2 + z^2)^(3/2)]
   - 長 L 螺管，每長 n 圈：B_interior = mu_0 n I（L >> R）

4. **對稱一致**：驗一步預測消之分（步一）果中真零。非零禁分示誤。

5. **量綱析**：驗 B 為 Tesla。各項應載 mu_0 * [流] / [長] 或等。

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

得：諸極限皆配。場有正單位、對稱、漸態。

敗：極限敗示積設或評誤。常因：叉積錯號、缺 2 或 pi 因、積限誤、源與場參座系不配。

### 五：含磁材而視

擴含材效而出視：

1. **線磁材**：材內以 mu = mu_r * mu_0 代 mu_0。材界施條：
   - 法分：B1_n = B2_n（連）
   - 切分：H1_t - H2_t = K_free（面自流）
   - 無自面流：H1_t = H2_t

2. **非線材（B-H 曲）**：鐵磁核：
   - 用材 B-H 曲關各點 B 與 H
   - 為設近以分線段：線域（B = mu H）、膝域、飽域（B 近常）
   - 操點循環時計滯：餘磁化 B_r 與矯場 H_c 定環

3. **退磁效**：有限幾磁材（短桿、球）內場以退磁因 N_d 減：H_internal = H_applied - N_d * M。

4. **場視**：
   - 以流函或沿場向積 dB/ds 繪場線
   - 繪值等高（|B| 為色圖）
   - 2D 切示流向（出頁點、入頁叉）
   - 驗場線成閉環（div B = 0）——開線示視或算誤

5. **物覺察**：確場圖質合理。場應強於源近、繞流（右手律）、隨距減。

```markdown
## Material Effects and Visualization
- **Material model**: [vacuum / linear mu_r / nonlinear B-H / hysteretic]
- **Boundary conditions applied**: [list interfaces]
- **Visualization**: [field lines / magnitude contour / both]
- **Div B = 0 check**: [field lines close / verified numerically]
```

得：含相關材效之全場解，附視示閉場線合 div B = 0 與物覺一致行。

敗：場線不閉→算有散誤，重察積或數法。材致意外場放→驗 mu_r 唯施材體內且界條於各界正行。

## 驗

- [ ] 電分全規幾、值、向
- [ ] 流續（穩態 div J = 0）驗
- [ ] 座系合主對稱
- [ ] 法選（Ampere / Biot-Savart / 偶）以對稱析證
- [ ] 場積設正叉積與限
- [ ] 數果示收（N 對 2N 測）
- [ ] 遠場偶極限驗
- [ ] 近場與軸極限配知式
- [ ] 禁對稱分為零
- [ ] 全程單位 Tesla
- [ ] 材界條正施（若可）
- [ ] 場線成閉環（div B = 0）

## 忌

- **叉積向誤**：Biot-Savart 叉積為 dl' x r_hat（源至場），非 r_hat x dl'。反之翻全場向。用右手律速察
- **混 B 與 H**：真空 B = mu_0 H，材內 B = mu H。Ampere 律以 H 唯用自流；以 B 含束（磁化）流。混例致 mu_r 因誤
- **施 Ampere 律無足對稱**：Ampere 恆真但唯對稱可由積出 B 時有用。B 沿 Amperian 環變→律出單純量方為空變函——不定
- **忽「無窮」線之有限長**：真螺、線有端。無窮線或螺式唯遠端有效（端距 >> 徑）。近端用全 Biot-Savart 積或有限螺正
- **忽有限幾退磁**：磁化球或短桿之內場異於同施場下長桿。退磁因可減效內場 30-100% 按比
- **非物場線**：視示場線始或終於空（非源或無窮）→算或繪有誤。磁場線恆閉環

## 參

- `solve-electromagnetic-induction` —— 用算 B 場析時變通與感 EMF
- `formulate-maxwell-equations` —— 推全 Maxwell 方含位移流與波傳
- `design-electromagnetic-device` —— 施磁場析於電磁、馬達、變壓設
- `formulate-quantum-problem` —— 磁交之量處（Zeeman 效、自旋軌耦）
