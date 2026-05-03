---
name: solve-trigonometric-problem
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Solve trigonometric equations and triangle problems systematically using
  identities, law of sines/cosines, inverse functions, and unit circle
  analysis. Covers equation solving, triangle resolution, identity
  verification, and applied trigonometric modeling. Use when solving
  trigonometric equations for unknown angles, resolving triangles from
  partial information (SSS, SAS, ASA), verifying identities, or applying
  trigonometry to real-world problems in surveying, physics, or engineering.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: geometry
  complexity: intermediate
  language: multi
  tags: geometry, trigonometry, identities, triangle, sines, cosines
---

# 解三角之題

系統解三角方程、三角形之題、恆等式之驗——分問題之類、選法、施恆等與律、以域與值之限驗解。

## 用時

- 解未知角或值之三角方程乃用
- 由部分資解三角形（SSS、SAS、ASA、AAS、SSA）乃用
- 驗或證三角恆等式乃用
- 施三角於實之題（測、物、工）乃用
- 簡繁三角式乃用

## 入

- **必要**：題述（方程、三角形資、所驗恆等、應用之境）
- **必要**：所欲出之形（精值、小數近、通解、特區間）
- **可選**：角單位之規（弧度或度；默：弧度）
- **可選**：域之限（如 [0, 2*pi)、[0, 360)、全實）
- **可選**：數答所須之精（如四小數位）

## 法

### 第一步：分問題之類

定問題屬何類，各類異法。

1. **三角方程**：解方程中未知角，含三角函。
   - 子類：一三角函中之線、一中之二次、多角、混函、參數。

2. **三角形之解**：由部分三角形資，求餘諸邊與角。
   - 依資之子類：SSS、SAS、ASA、AAS、SSA（歧例）。

3. **恆等式之驗**：證三角方程於其域中諸值皆成。
   - 子類：代數操作、和化積、積化和、半角、倍角。

4. **應用題**：自實境提三角之模。
   - 子類：周期模、仰俯角、方位／航、諧動。

書其分：

```
Problem: Solve 2*sin^2(x) - sin(x) - 1 = 0 for x in [0, 2*pi).
Classification: Trigonometric equation, quadratic in sin(x).
```

得：明分而識子類，後續第二步之策直定。

敗則：若題不入一類，或為合題。分為子題、各分而續解。例「給二邊與夾角求三角形之面積」合三角形之解（SAS）與面積公式。

### 第二步：擇解之策

依第一步之分擇宜之法。

**為三角方程：**

| Equation Type | Strategy |
|---|---|
| Linear in sin(x) or cos(x) | Isolate the trig function, apply inverse |
| Quadratic in sin(x) or cos(x) | Substitute u = sin(x), solve quadratic, back-substitute |
| Multiple angle (sin(2x), cos(3x)) | Solve for the inner argument, then divide |
| Mixed functions (sin and cos) | Convert to single function using identities |
| Factorable | Factor and solve each factor = 0 |

**為三角形之解：**

| Given Data | Primary Tool |
|---|---|
| SSS | Law of cosines (find largest angle first) |
| SAS | Law of cosines (find opposite side), then law of sines |
| ASA | Angle sum = pi, then law of sines |
| AAS | Angle sum = pi, then law of sines |
| SSA | Law of sines (check ambiguous case: 0, 1, or 2 solutions) |

**為恆等式之驗：**

- 唯於一側作（常為繁側）
- 諸皆轉為 sin、cos
- 施基本恆等：勾股、倒數、商
- 適用和差、倍角、半角公式
- 析、簡，至兩側合

**為應用題：**

- 繪圖而標諸已知與未知
- 識三角關係（直角、斜角、周期函）
- 立方程而以上法解之

書所擇之策：

```
Strategy: Substitute u = sin(x), solve 2u^2 - u - 1 = 0,
back-substitute, and find x in [0, 2*pi).
```

得：與題類合之具體有名之策，含關之公式或恆等。

敗則：若無單策可施，試合法。混 sin 與 cos 之方程：（甲）勾股代入、（乙）半角切代入 t = tan(x/2)、（丙）輔角法（a*sin(x) + b*cos(x) = R*sin(x + phi)）。若於恆等卡，試自兩側向共中式。

### 第三步：系而施恆等與律

逐步行所擇之策。

**諸恆等之家可取：**

1. **勾股**：sin^2(x) + cos^2(x) = 1、1 + tan^2(x) = sec^2(x)、1 + cot^2(x) = csc^2(x)

2. **倍角**：sin(2x) = 2*sin(x)*cos(x)、cos(2x) = cos^2(x) - sin^2(x) = 2*cos^2(x) - 1 = 1 - 2*sin^2(x)

3. **和差**：sin(A +/- B) = sin(A)*cos(B) +/- cos(A)*sin(B)、cos(A +/- B) = cos(A)*cos(B) -/+ sin(A)*sin(B)

4. **正弦律**：a/sin(A) = b/sin(B) = c/sin(C) = 2R

5. **餘弦律**：c^2 = a^2 + b^2 - 2*a*b*cos(C)

6. **半角**：sin(x/2) = +/-sqrt((1 - cos(x))/2)、cos(x/2) = +/-sqrt((1 + cos(x))/2)

明示各代數之步：

```
2*sin^2(x) - sin(x) - 1 = 0
Let u = sin(x):
  2u^2 - u - 1 = 0
  (2u + 1)(u - 1) = 0
  u = -1/2  or  u = 1
Back-substitute:
  sin(x) = -1/2  or  sin(x) = 1
```

三角形之解，算中值而持足精：

```
Given: a = 7, b = 10, C = 38 degrees (SAS)
Law of cosines: c^2 = 49 + 100 - 2(7)(10)*cos(38)
  c^2 = 149 - 140*cos(38) = 149 - 110.312 = 38.688
  c = 6.220
Law of sines: sin(A)/7 = sin(38)/6.220
  sin(A) = 7*sin(38)/6.220 = 0.6930
  A = 43.78 degrees
  B = 180 - 38 - 43.78 = 98.22 degrees
```

得：自始方程或資至中果之全代數鏈，諸恆等之施皆標之。

敗則：若恆等之施致更繁而非更簡，再考策。常之復救：（甲）試以歐拉公式轉為指數形以證繁恆等、（乙）兩側乘共軛、（丙）以代入減次。若數值算生異值，以獨算路驗之。

### 第四步：解而察域與值之限

取諸解，依題之域篩之。

1. **求參考角**。各三角函之值，以反函求參考角：

```
sin(x) = -1/2  =>  reference angle = pi/6
sin(x) = 1     =>  reference angle = pi/2
```

2. **列基本周期內諸解**。用符與象限之則：

```
sin(x) = -1/2:
  x is in Q3 or Q4 (sin negative)
  x = pi + pi/6 = 7*pi/6
  x = 2*pi - pi/6 = 11*pi/6

sin(x) = 1:
  x = pi/2
```

3. **施域之限**。唯留所定區間之解：

```
Domain: [0, 2*pi)
Solutions: x = pi/2, 7*pi/6, 11*pi/6
```

4. **書通解**（若請）：

```
General solution:
  x = pi/2 + 2*k*pi,  k in Z
  x = 7*pi/6 + 2*k*pi,  k in Z
  x = 11*pi/6 + 2*k*pi,  k in Z
```

5. **察值之限**。反函題，驗出於主值範圍。三角形題，驗諸角為正而和為 pi（或 180 度），諸邊為正。

6. **治歧例（SSA）**。SSA 資用正弦律：
   - sin(B) > 1：無解。
   - sin(B) = 1：一解（直角）。
   - sin(B) < 1 而給角為銳：二可解（察兩者皆為有效三角形否）。
   - 給角為鈍或直：至多一解。

得：完之明列解集，敬諸域與值之限，歧例已治（若適）。

敗則：若所定域中無解，驗方程立之是否正。若解過多，察是否引外解（如兩側平方）。每候解皆代入原方程驗。

### 第五步：以數驗解

每解皆以代入或獨算驗之。

1. **代入各解**於原方程而驗等：

```
Check x = 7*pi/6:
  sin(7*pi/6) = -1/2
  2*(-1/2)^2 - (-1/2) - 1 = 2*(1/4) + 1/2 - 1 = 1/2 + 1/2 - 1 = 0. VERIFIED.

Check x = 11*pi/6:
  sin(11*pi/6) = -1/2
  2*(1/4) + 1/2 - 1 = 0. VERIFIED.

Check x = pi/2:
  sin(pi/2) = 1
  2*(1) - 1 - 1 = 0. VERIFIED.
```

2. **三角形題**，以獨律驗：

```
Verify triangle: a=7, b=10, c=6.220, A=43.78, B=98.22, C=38
Check law of sines: a/sin(A) = 7/sin(43.78) = 7/0.6913 = 10.126
                    b/sin(B) = 10/sin(98.22) = 10/0.9897 = 10.104
                    c/sin(C) = 6.220/sin(38) = 6.220/0.6157 = 10.102
Ratios approximately equal (within rounding). VERIFIED.
Check angle sum: 43.78 + 98.22 + 38 = 180. VERIFIED.
```

3. **恆等之證**，以特數值驗：

```
Verify identity: sin(2x) = 2*sin(x)*cos(x)
Let x = pi/3:
  LHS: sin(2*pi/3) = sin(120) = sqrt(3)/2
  RHS: 2*sin(pi/3)*cos(pi/3) = 2*(sqrt(3)/2)*(1/2) = sqrt(3)/2
  LHS = RHS. VERIFIED.
```

4. **書終答**於所請之格：

```
Solution: x in {pi/2, 7*pi/6, 11*pi/6} for x in [0, 2*pi).
```

得：諸解皆過代入之驗。三角形之解滿正弦律與餘弦律。恆等之證至少有一數驗。

敗則：若一解驗敗，乃外解。除之而再察其引之步。常源：兩側平方（引符歧）、乘可為零之式、擇參考角之誤象限。

## 驗

- [ ] 題分為具體之類與子類
- [ ] 解之策明名而合題類
- [ ] 各恆等或律之施皆標其名
- [ ] 諸代數之步皆示（無跳邏）
- [ ] 域與值之限明施
- [ ] SSA 三角形題之歧例已治
- [ ] 每解皆代入原方程驗
- [ ] 三角形之解以獨律交驗
- [ ] 終答以所請之格陳（精、小數、通、特區間）
- [ ] 角單位全文一致（無弧度與度混）

## 陷

- **除三角函而失解**：兩側除 sin(x) 棄諸 sin(x) = 0 之解。恆析而不除：書 sin(x) * f(x) = 0 而各因解之。

- **平方致外解**：sin(x) = cos(x) 兩側平方得 sin^2(x) = cos^2(x)，倍解。恆驗候解於原（未平方）方程。

- **忽歧例（SSA）**：兩邊與非夾角之三角形，正弦律可生 0、1 或 2 有效之三角形。不察第二解則失有效之答。

- **混角單位**：計算機或語為弧度模時用 sin(30) 得 sin(30 弧度)，非 sin(30 度)。始陳單位之規而通文遵之。

- **參考角誤象限**：sin(x) = -1/2 致 x 於 Q3 與 Q4，非 Q1 與 Q2。恆察三角函之符對象限。

- **忘周期**：實線上之三角方程有無窮解。若題求通解，含「+ 2*k*pi」（切為「+ k*pi」）之項。若求 [0, 2*pi) 之解，列彼區間之諸解。

## 參

- `construct-geometric-figure` — 構造常須三角析以定角與長
- `prove-geometric-theorem` — 三角恆等常為幾何證中之引理
- `create-skill` — 包新三角之法為可用技時遵之
