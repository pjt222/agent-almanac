---
name: solve-trigonometric-problem
locale: wenyan-ultra
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

# 解三角問

系解三角方、三角形問、恆等驗——分問類、擇策、施恆等與律、驗解於域與範。

## 用

- 解三角方求未知角或值→用
- 由部分資解三角形（SSS、SAS、ASA、AAS、SSA）→用
- 驗或證三角恆等→用
- 施三角於實問（測、物、工）→用
- 簡繁三角式→用

## 入

- **必**：問述（方、三角形資、待驗恆等、施場）
- **必**：所求出式（精值、十進近、通解、定段）
- **可**：角單慣（弧或度；默弧）
- **可**：域限（如 [0, 2*pi)、[0, 360)、諸實）
- **可**：數答精（如四位）

## 行

### 一：分問類

定問入何類、各類異策。

1. **三角方**：解含三角函未知角
   - 子類：一函線、一函二次、多角、混函、參

2. **三角形解**：由部分資、求餘邊角
   - 子類按所予：SSS、SAS、ASA、AAS、SSA（歧例）

3. **恆等驗**：證三角方於域諸值皆立
   - 子類：代易、和-積、積-和、半角、倍角

4. **施問**：自實場取三角模
   - 子類：周期、仰俯角、方向/航、諧動

文分類：

```
Problem: Solve 2*sin^2(x) - sin(x) - 1 = 0 for x in [0, 2*pi).
Classification: Trigonometric equation, quadratic in sin(x).
```

得：明分含子類、直定步二之策。

敗：問不入單類→或為合問。分為子問、各分、序解。如「予兩邊與夾角求三角形面積」合 SAS 解與面積式。

### 二：擇策

依步一分擇宜法。

**三角方：**

| Equation Type | Strategy |
|---|---|
| Linear in sin(x) or cos(x) | Isolate the trig function, apply inverse |
| Quadratic in sin(x) or cos(x) | Substitute u = sin(x), solve quadratic, back-substitute |
| Multiple angle (sin(2x), cos(3x)) | Solve for the inner argument, then divide |
| Mixed functions (sin and cos) | Convert to single function using identities |
| Factorable | Factor and solve each factor = 0 |

**三角形解：**

| Given Data | Primary Tool |
|---|---|
| SSS | Law of cosines (find largest angle first) |
| SAS | Law of cosines (find opposite side), then law of sines |
| ASA | Angle sum = pi, then law of sines |
| AAS | Angle sum = pi, then law of sines |
| SSA | Law of sines (check ambiguous case: 0, 1, or 2 solutions) |

**恆等驗：**

- 唯於一邊行（常為繁邊）
- 諸轉至 sin、cos
- 施基恆等：Pythag、倒、商
- 必則施和差、倍角、半角
- 析簡至兩邊配

**施問：**

- 繪圖標諸知未知
- 識三角關（直角形、斜形、周期函）
- 立方而以上法解

文擇策：

```
Strategy: Substitute u = sin(x), solve 2u^2 - u - 1 = 0,
back-substitute, and find x in [0, 2*pi).
```

得：具名策配問類、要式或恆等已識。

敗：無單策→試合法。混 sin cos→試（甲）Pythag 代、（乙）半角 tan 代 t = tan(x/2)、（丙）輔角 a*sin(x) + b*cos(x) = R*sin(x + phi)。恆等卡→自兩邊向中合。

### 三：系施恆等與律

逐步行所擇策。

**主恆等族：**

1. **Pythag**：sin^2(x) + cos^2(x) = 1、1 + tan^2(x) = sec^2(x)、1 + cot^2(x) = csc^2(x)

2. **倍角**：sin(2x) = 2*sin(x)*cos(x)、cos(2x) = cos^2(x) - sin^2(x) = 2*cos^2(x) - 1 = 1 - 2*sin^2(x)

3. **和差**：sin(A +/- B) = sin(A)*cos(B) +/- cos(A)*sin(B)、cos(A +/- B) = cos(A)*cos(B) -/+ sin(A)*sin(B)

4. **正弦律**：a/sin(A) = b/sin(B) = c/sin(C) = 2R

5. **餘弦律**：c^2 = a^2 + b^2 - 2*a*b*cos(C)

6. **半角**：sin(x/2) = +/-sqrt((1 - cos(x))/2)、cos(x/2) = +/-sqrt((1 + cos(x))/2)

明示各代步：

```
2*sin^2(x) - sin(x) - 1 = 0
Let u = sin(x):
  2u^2 - u - 1 = 0
  (2u + 1)(u - 1) = 0
  u = -1/2  or  u = 1
Back-substitute:
  sin(x) = -1/2  or  sin(x) = 1
```

三角形解計中值留足精：

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

得：自原方或資至中果之全代鏈、各恆等施有名。

敗：施恆等致更繁→重慮策。常救：（甲）為繁恆等證試以 Euler 式轉指、（乙）兩邊乘共軛、（丙）以代減度。數計生異值→用獨計路驗。

### 四：解與察域範

取諸解、濾於問域。

1. **覓參角**：各三角函值用反函定參角：

```
sin(x) = -1/2  =>  reference angle = pi/6
sin(x) = 1     =>  reference angle = pi/2
```

2. **列基期諸解**：用號與象限則：

```
sin(x) = -1/2:
  x is in Q3 or Q4 (sin negative)
  x = pi + pi/6 = 7*pi/6
  x = 2*pi - pi/6 = 11*pi/6

sin(x) = 1:
  x = pi/2
```

3. **施域限**：留唯定段內者：

```
Domain: [0, 2*pi)
Solutions: x = pi/2, 7*pi/6, 11*pi/6
```

4. **書通解**（如請）：

```
General solution:
  x = pi/2 + 2*k*pi,  k in Z
  x = 7*pi/6 + 2*k*pi,  k in Z
  x = 11*pi/6 + 2*k*pi,  k in Z
```

5. **察範限**：反函問驗出於主值範。三角形問驗諸角正、和為 pi（180）、諸邊正

6. **理歧例（SSA）**：以正弦律於 SSA：
   - sin(B) > 1：無解
   - sin(B) = 1：一解（直）
   - sin(B) < 1 而所予角銳：兩可解（察兩否生效形）
   - 所予角鈍或直：至多一解

得：全明列解集合域與範諸限、若可理歧例。

敗：定段無解→驗方立否。解過多→察是否引異解（如兩邊方）。各候解代原方驗。

### 五：數驗解

以代或獨計確各解。

1. **各解代**入原方驗等：

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

2. **三角形問**用獨律驗：

```
Verify triangle: a=7, b=10, c=6.220, A=43.78, B=98.22, C=38
Check law of sines: a/sin(A) = 7/sin(43.78) = 7/0.6913 = 10.126
                    b/sin(B) = 10/sin(98.22) = 10/0.9897 = 10.104
                    c/sin(C) = 6.220/sin(38) = 6.220/0.6157 = 10.102
Ratios approximately equal (within rounding). VERIFIED.
Check angle sum: 43.78 + 98.22 + 38 = 180. VERIFIED.
```

3. **恆等證**用具值驗：

```
Verify identity: sin(2x) = 2*sin(x)*cos(x)
Let x = pi/3:
  LHS: sin(2*pi/3) = sin(120) = sqrt(3)/2
  RHS: 2*sin(pi/3)*cos(pi/3) = 2*(sqrt(3)/2)*(1/2) = sqrt(3)/2
  LHS = RHS. VERIFIED.
```

4. **末答**以所請式記：

```
Solution: x in {pi/2, 7*pi/6, 11*pi/6} for x in [0, 2*pi).
```

得：各解過代驗。三角形解滿正餘弦律。恆等證至少一數測確。

敗：解敗驗→異解。除之、覆察引步。常異解源：兩邊方（引號歧）、乘可零式、參角象限誤。

## 驗

- [ ] 問入具類與子類
- [ ] 解策具名配問類
- [ ] 各恆等或律施有名
- [ ] 諸代步明示（無邏跳）
- [ ] 域與範限明施
- [ ] SSA 三角形問理歧例
- [ ] 各解代原方驗
- [ ] 三角形解以獨律交驗
- [ ] 末答以所請式陳（精、十進、通、段）
- [ ] 角單貫一（不混弧度）

## 忌

- **除三角函失解**：兩除以 sin(x) 棄諸 sin(x) = 0 之解。常析非除：書 sin(x) * f(x) = 0 各析分解
- **方致異解**：sin(x) = cos(x) 兩方得 sin^2(x) = cos^2(x)、解倍。各候驗於原（未方）方
- **忽歧例（SSA）**：兩邊一非夾角解三角形、正弦律生 0、1、2 效形。不察次解失效答
- **混角單**：算或語於弧模時用 sin(30) 得 sin(30 弧)、非 sin(30 度)。始陳單慣、貫之
- **參角誤象限**：sin(x) = -1/2 在 Q3、Q4、非 Q1、Q2。前置角察函號於象限
- **忘周期**：實線三角方解無窮。問求通解→含「+ 2*k*pi」（tan 為「+ k*pi」）。求 [0, 2*pi) 解→列段內諸解

## 參

- `construct-geometric-figure` - 作常需三角析定角與長
- `prove-geometric-theorem` - 三角恆等常為幾何證之輔
- `create-skill` - 包新三角法為可重用技時用
