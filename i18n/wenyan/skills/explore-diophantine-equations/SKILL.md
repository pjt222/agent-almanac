---
name: explore-diophantine-equations
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Solve Diophantine equations (integer-only solutions) including linear,
  quadratic, and Pell equations. Covers the extended Euclidean algorithm,
  descent methods, and existence proofs. Use when finding all integer
  solutions to ax + by = c, solving Pell's equation, generating Pythagorean
  triples, proving no integer solutions exist via modular constraints, or
  finding the fundamental solution from which all others are generated.
license: MIT
allowed-tools: Read Bash
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: number-theory
  complexity: advanced
  language: multi
  tags: number-theory, diophantine, integer-solutions, pell-equation, euclidean
---

# 探丟番圖方程

解丟番圖方程——唯求整解之多項方程。類其式、試其可解、求個與全解、生解族。涉線方、Pell 方、畢達三、全二次式。

## 用時

- 求線方 ax + by = c 之諸整解
- 解 Pell 方 x^2 - Dy^2 = 1（或 = -1）
- 生畢達三或他參整族
- 證某方無整解（以模限）
- 試一般二次丟番圖之可解
- 求生諸他解之本解

## 入

- **必要**：欲解之丟番圖方程（明式，如 3x + 5y = 17 或 x^2 - 7y^2 = 1）
- **可選**：求諸解、一個解、或證無
- **可選**：變域限（如唯正整）
- **可選**：是否以參示全解
- **可選**：偏證法（構、降、模阻）

## 法

### 第一步：類方之形

定丟番圖方之構以擇解法。

1. **線**：ax + by = c，a、b、c 為整，x、y 為未知
   - 解法：擴歐幾里得算法

2. **Pell 方**：x^2 - Dy^2 = 1（或 = -1，或 = N），D 正非平方整
   - 解法：sqrt(D) 連分展

3. **畢達**：x^2 + y^2 = z^2
   - 解法：參族 x = m^2 - n^2、y = 2mn、z = m^2 + n^2

4. **全二次**：ax^2 + bxy + cy^2 + dx + ey + f = 0
   - 解法：完全平方、約為 Pell 或簡式、或施模限

5. **高階或特**：費馬型（x^n + y^n = z^n, n > 2）、平方和、或他
   - 解法：模阻、降、或已知不可能之結

記分類與所擇法。

**得：** 精分類附解策已識。

**敗則：** 若方不合標型，試代或轉為已知式。如 x^2 + y^2 + z^2 = n 可由 Legendre 三平方定近之。若無顯約，施模限（四步）以試阻。

### 第二步：解線丟番圖（若類為線）

解 ax + by = c 之整 x、y。

1. **算 g = gcd(a, b)** 以歐幾里得

2. **試可解**：解存若且僅若 g | c
   - 若 g 不分 c，證無解：「gcd(a, b) = g 而 g 不分 c，故 ax + by = c 無整解」
   - 無解則止

3. **簡**：同除 g 得 (a/g)x + (b/g)y = c/g，此時 gcd(a/g, b/g) = 1

4. **求個解**以擴歐幾里得：
   - 經回代示 1 = (a/g)*s + (b/g)*t
   - 乘 c/g：(c/g) = (a/g)*(s*c/g) + (b/g)*(t*c/g)
   - 個解：x0 = s * (c/g)，y0 = t * (c/g)

5. **書全解**：
   - x = x0 + (b/g)*k
   - y = y0 - (a/g)*k
   - k 為諸整

6. **施限**（若求正解）：
   - 解 x0 + (b/g)*k > 0 與 y0 - (a/g)*k > 0 於 k
   - 報有效 k 之域或述無正解

**例（15x + 21y = 39）：**
```
gcd(15, 21) = 3. Does 3 | 39? Yes.
Simplify: 5x + 7y = 13.
Extended Euclidean: 1 = 3*5 - 2*7.
Multiply by 13: 13 = 39*5 - 26*7.
Particular: x0 = 39, y0 = -26.
General: x = 39 + 7k, y = -26 - 5k, k in Z.
Check (k=0): 5*39 + 7*(-26) = 195 - 182 = 13. Correct.
```

**得：** 以整 k 參之全解族，附個解之驗。

**敗則：** 若個解誤，逐步復察擴歐幾里得回代。最常誤為號誤。驗：a * x0 + b * y0 必確等 c（非僅模某數）。

### 第三步：解 Pell 方（若類為 Pell）

解 x^2 - Dy^2 = 1，D 為正非平方整。

1. **驗 D 非全平方**：若 D = k^2，則 x^2 - k^2*y^2 = (x - ky)(x + ky) = 1，迫 x - ky = x + ky = +/-1，得 y = 0, x = +/-1（平凡）。非平方 D 方趣

2. **算 sqrt(D) 之連分展**：
   - 初：a0 = floor(sqrt(D))，m0 = 0，d0 = 1
   - 迭：m_{i+1} = d_i * a_i - m_i，d_{i+1} = (D - m_{i+1}^2) / d_i，a_{i+1} = floor((a0 + m_{i+1}) / d_{i+1})
   - 續至 a_i 序重（展在 a0 後週期）
   - 記週期長 r

3. **自收斂式取本解**：
   - 算連分之收斂 p_i / q_i
   - 第一週期末之收斂 p_{r-1} / q_{r-1} 給本解：
     - r 偶：(x1, y1) = (p_{r-1}, q_{r-1}) 解 x^2 - Dy^2 = 1
     - r 奇：(p_{r-1}, q_{r-1}) 解 x^2 - Dy^2 = -1（負 Pell 方）。則 (p_{2r-1}, q_{2r-1}) 解正方

4. **自本解 (x1, y1) 生更多解**：
   - 遞推：x_{n+1} + y_{n+1} * sqrt(D) = (x1 + y1 * sqrt(D))^{n+1}
   - 等：x_{n+1} = x1 * x_n + D * y1 * y_n，y_{n+1} = x1 * y_n + y1 * x_n

5. **呈**本解與生諸解之遞推

**小 D 之本解：**

| D  | (x1, y1) | D  | (x1, y1)   | D  | (x1, y1)   |
|----|----------|----|-------------|----|-----------  |
| 2  | (3, 2)   | 7  | (8, 3)      | 13 | (649, 180)  |
| 3  | (2, 1)   | 8  | (3, 1)      | 14 | (15, 4)     |
| 5  | (9, 4)   | 10 | (19, 6)     | 15 | (4, 1)      |
| 6  | (5, 2)   | 11 | (10, 3)     | 17 | (33, 8)     |

**得：** 本解 (x1, y1) 代入驗，附生諸正解之遞推。

**敗則：** 若連分算不收斂於週期，察迭式。週期長 r 可大（如 D = 61 有 r = 11，本解 (1766319049, 226153980)）。大 D 用算具而非手算。

### 第四步：施模限於存/不存（若全二次或高階）

以示模阻證方無整解。

1. **擇模 m**（通常 m = 2、3、4、5、7、8、或 16）

2. **列諸餘**：算左式於諸變餘之模 m

3. **察某組合是否給所求右式之模 m**
   - 若無組合合，方無解（模阻）

4. **常阻**：
   - **平方模 4**：n^2 = 0 或 1 (mod 4)。故 x^2 + y^2 = c 於 c = 3 (mod 4) 時無解
   - **平方模 8**：n^2 = 0、1、或 4 (mod 8)。故 x^2 + y^2 + z^2 = c 於 c = 7 (mod 8) 時無解
   - **立方模 9**：n^3 = 0、1、或 8 (mod 9)。故 x^3 + y^3 + z^3 = c 於某 c mod 9 或被阻

5. **若無阻現**，模法不能證無。解或存或不，試構法或降

**二次餘參：**

| Mod | Squares (residues)         |
|-----|---------------------------|
| 3   | {0, 1}                    |
| 4   | {0, 1}                    |
| 5   | {0, 1, 4}                |
| 7   | {0, 1, 2, 4}             |
| 8   | {0, 1, 4}                |
| 11  | {0, 1, 3, 4, 5, 9}       |
| 13  | {0, 1, 3, 4, 9, 10, 12}  |
| 16  | {0, 1, 4, 9}             |

**得：** 或由模阻證無，或述所試模無阻。

**敗則：** 若模法不決，試無窮降：假解存，導嚴小之解，重至與正之矛盾。此法古典用於證 x^4 + y^4 = z^2 無非平凡解。

### 第五步：自本解生解族

以本解與整參示諸解。

1. **線方**：族為 x = x0 + (b/g)*k，y = y0 - (a/g)*k（自二步）

2. **Pell 方**：用三步遞推生首數解：
   ```
   (x1, y1), (x2, y2), (x3, y3), ...
   ```
   列至少 3-5 解以察

3. **畢達三**：自參 m > n > 0、gcd(m, n) = 1、m - n 奇生原三：
   - a = m^2 - n^2、b = 2mn、c = m^2 + n^2
   - 諸原三此生（交 a、b 止）

4. **全族**：若可，以參示解。若方定 genus 0 曲，有有理參化。若 genus >= 1，或僅有有限解（Faltings 定理於 genus >= 2）

5. **驗**至少三族員代入原方

**例（Pell，D = 2）：**
```
Fundamental: (x1, y1) = (3, 2). Check: 9 - 2*4 = 1. Correct.
(x2, y2) = (3*3 + 2*2*2, 3*2 + 2*3) = (17, 12). Check: 289 - 2*144 = 1.
(x3, y3) = (3*17 + 2*2*12, 3*12 + 2*17) = (99, 70). Check: 9801 - 2*4900 = 1.
```

**得：** 諸解之參或遞描，至少三解已驗。

**敗則：** 若生解驗敗，本解或遞式誤。Pell 時自連分重導本解。線方時復察擴歐幾里得算。

## 驗

- [ ] 方已正類（線、Pell、畢達、全二次、高階）
- [ ] 線方時：解前察 gcd(a, b) | c
- [ ] 擴歐幾里得回代已驗：a*x0 + b*y0 = c 確等
- [ ] 全解含諸解（以整 k 或遞參）
- [ ] Pell 時：用連分法前驗 D 非平方
- [ ] Pell 時：本解直算確 x1^2 - D*y1^2 = 1
- [ ] 模阻證列諸餘組合，非唯某
- [ ] 任解族至少三員代入驗
- [ ] 限（正整、界域）於求全解後施
- [ ] 無解之稱以 gcd 條件或模阻證

## 陷

- **設 gcd | c 則有正解**：全解 x = x0 + (b/g)*k 含負值。可解於諸整而無正解

- **混 x^2 - Dy^2 = 1 於 = -1**：負 Pell 方唯連分週期長奇時有解。施正方式於負方目給誤

- **忘 Pell 之平凡**：(x, y) = (1, 0) 恆合 x^2 - Dy^2 = 1 而不益於生非平凡解。本解乃 y > 0 之*最小*解

- **模阻不全**：唯察 mod 2 或 mod 4 或失高模可見之阻。若首幾模無阻，試 mod 8、9、16、或二次式之判別式

- **連分週期差一**：收斂指數須謹追。本解來自 p_{r-1}/q_{r-1}（r 為週期長），非 p_r/q_r

- **無窮降無基例**：用降證無時須示降終於矛盾（如 x = 0 矛於 x > 0）。無此基例，證不全

- **費馬末定理誤施**：x^n + y^n = z^n 於 n > 2 無非平凡整解（Wiles, 1995），然此不及異係方如 2x^3 + 3y^3 = z^3

## 參

- `analyze-prime-numbers` —— 分解與 gcd 算乃丟番圖解之先
- `solve-modular-arithmetic` —— 線同餘 ax = c (mod b) 等於線丟番圖
- `derive-theoretical-result` —— 形導之法以證丟番圖不可能之結
