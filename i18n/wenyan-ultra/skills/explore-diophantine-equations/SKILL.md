---
name: explore-diophantine-equations
locale: wenyan-ultra
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

# 探 Diophantine 程

解 Diophantine 程——只求整解之多項式。按類分、試可解、求特與通解、生解族。含線程、Pell 程、Pythagorean 三、與通二次。

## 用

- 尋 ax + by = c 之諸整解
- 解 Pell x^2 - Dy^2 = 1（或 = -1）
- 生 Pythagorean 三或他參整族
- 經模約證程無整解
- 試通二次 Diophantine 之可解
- 尋諸解所自生之本解

## 入

- **必**：欲解之程（明式，如 3x + 5y = 17 或 x^2 - 7y^2 = 1）
- **可**：尋諸解、一特解、或證無解
- **可**：變域約（如僅正整）
- **可**：是否以參式示通解
- **可**：偏證技（構、降、模阻）

## 行

### 一：分程類

定 Diophantine 之構以擇解法。

1. **線**：ax + by = c，a, b, c 為予整，x, y 為未知
   - 解法：擴 Euclid 算

2. **Pell**：x^2 - Dy^2 = 1（或 = -1、= N），D 為正非方整
   - 解法：sqrt(D) 之續分展

3. **Pythagorean**：x^2 + y^2 = z^2
   - 解法：參族 x = m^2 - n^2、y = 2mn、z = m^2 + n^2

4. **通二次**：ax^2 + bxy + cy^2 + dx + ey + f = 0
   - 解法：完全方、減為 Pell 或簡式、或施模約

5. **高階或特**：Fermat 型（x^n + y^n = z^n, n > 2）、方和、或他
   - 解法：模阻、降、或已知不可能

錄分類與所擇法。

得：精分類並識解策。

敗：程不合標類→試代或轉以減為已知式。如 x^2 + y^2 + z^2 = n 可經 Legendre 三方論。無減可見→施模約（四步）試阻。

### 二：解線 Diophantine（若類=線）

解 ax + by = c 之整 x, y。

1. **算 g = gcd(a, b)** 以 Euclid 算

2. **試可解**：解存當且僅當 g | c
   - 若 g 不除 c→證無解：「gcd(a, b) = g 且 g 不除 c→ax + by = c 無整解」
   - 若無解→止

3. **簡**：除 g 得 (a/g)x + (b/g)y = c/g，其 gcd(a/g, b/g) = 1

4. **尋特解**用擴 Euclid：
   - 經反代得 1 = (a/g)*s + (b/g)*t
   - 乘 c/g：(c/g) = (a/g)*(s*c/g) + (b/g)*(t*c/g)
   - 特解：x0 = s * (c/g)、y0 = t * (c/g)

5. **書通解**：
   - x = x0 + (b/g)*k
   - y = y0 - (a/g)*k
   - 諸整 k

6. **施約**（若須正解）：
   - 解 x0 + (b/g)*k > 0 與 y0 - (a/g)*k > 0 求 k
   - 報有效 k 域或述無正解

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

得：以整 k 參之通解族，並驗特解。

敗：特解誤→步步察擴 Euclid 反代。最常誤為號。驗：a * x0 + b * y0 宜正等 c（非僅模某）。

### 三：解 Pell（若類=Pell）

解 x^2 - Dy^2 = 1，D 為正非方整。

1. **驗 D 非全方**：若 D = k^2→x^2 - k^2*y^2 = (x - ky)(x + ky) = 1 強 x - ky = x + ky = +/-1，致 y = 0、x = +/-1（瑣）。程唯非方 D 有趣

2. **算 sqrt(D) 之續分展**：
   - 初：a0 = floor(sqrt(D))、m0 = 0、d0 = 1
   - 迭：m_{i+1} = d_i * a_i - m_i、d_{i+1} = (D - m_{i+1}^2) / d_i、a_{i+1} = floor((a0 + m_{i+1}) / d_{i+1})
   - 續至 a_i 序重（展於 a0 後週期）
   - 錄週長 r

3. **自收斂取本解**：
   - 算續分之收斂 p_i / q_i
   - 收斂 p_{r-1} / q_{r-1}（首週末）予本解：
     - r 偶：(x1, y1) = (p_{r-1}, q_{r-1}) 解 x^2 - Dy^2 = 1
     - r 奇：(p_{r-1}, q_{r-1}) 解 x^2 - Dy^2 = -1（負 Pell）。則 (p_{2r-1}, q_{2r-1}) 解正程

4. **自本解 (x1, y1) 生更解**：
   - 遞：x_{n+1} + y_{n+1} * sqrt(D) = (x1 + y1 * sqrt(D))^{n+1}
   - 等：x_{n+1} = x1 * x_n + D * y1 * y_n、y_{n+1} = x1 * y_n + y1 * x_n

5. **示**本解與生諸解之遞

**小 D 之本解：**

| D  | (x1, y1) | D  | (x1, y1)   | D  | (x1, y1)   |
|----|----------|----|-------------|----|-----------  |
| 2  | (3, 2)   | 7  | (8, 3)      | 13 | (649, 180)  |
| 3  | (2, 1)   | 8  | (3, 1)      | 14 | (15, 4)     |
| 5  | (9, 4)   | 10 | (19, 6)     | 15 | (4, 1)      |
| 6  | (5, 2)   | 11 | (10, 3)     | 17 | (33, 8)     |

得：代入驗之本解 (x1, y1)，及生諸正解之遞。

敗：續分算不收週→察迭式。週長 r 可大（如 D = 61 有 r = 11 且本解 (1766319049, 226153980)）。大 D 宜用算具非手算。

### 四：施模約驗存/不存（若類=通二次或高階）

經示模阻證程無整解。

1. **擇模 m**（常 m = 2、3、4、5、7、8、16）

2. **列諸餘**：算諸變可能餘之左端模 m

3. **察諸合否予右端模 m**
   - 若無合→程無解（模阻）

4. **常阻**：
   - **方模 4**：n^2 = 0 或 1 (mod 4)。故 x^2 + y^2 = c 若 c = 3 (mod 4) 無解
   - **方模 8**：n^2 = 0、1、4 (mod 8)。故 x^2 + y^2 + z^2 = c 若 c = 7 (mod 8) 無解
   - **立方模 9**：n^3 = 0、1、8 (mod 9)。故 x^3 + y^3 + z^3 = c 於某 c mod 9 或阻

5. **無阻**：模法不能證無。解或存或不存；試構法或降

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

得：或經模阻證無解，或述於試模未得阻。

敗：模法無結→試無窮降：設解存、推嚴小解、復至與正矛盾。此技典於證 x^4 + y^4 = z^2 無非瑣解。

### 五：自本解生解族

以本解與整參示諸解。

1. **線**：族為 x = x0 + (b/g)*k、y = y0 - (a/g)*k（二步）

2. **Pell**：用三步遞生前數解：
   ```
   (x1, y1), (x2, y2), (x3, y3), ...
   ```
   列至少 3-5 解為察

3. **Pythagorean 三**：自參 m > n > 0、gcd(m, n) = 1、m - n 奇 生本三：
   - a = m^2 - n^2、b = 2mn、c = m^2 + n^2
   - 諸本三皆如此生（容 a 與 b 互易）

4. **通族**：可則以參式示。若程定 genus 0 曲線→有理參存。若 genus >= 1→解或有限（Faltings 論於 genus >= 2）

5. **代入原程驗**族中至少 3 員

**例（Pell, D = 2）：**
```
Fundamental: (x1, y1) = (3, 2). Check: 9 - 2*4 = 1. Correct.
(x2, y2) = (3*3 + 2*2*2, 3*2 + 2*3) = (17, 12). Check: 289 - 2*144 = 1.
(x3, y3) = (3*17 + 2*2*12, 3*12 + 2*17) = (99, 70). Check: 9801 - 2*4900 = 1.
```

得：諸解之參或遞述，至少 3 解已驗。

敗：生解驗敗→本解或遞式誤。Pell→自續分重推本解。線→重察擴 Euclid 算。

## 驗

- [ ] 程按類正分（線、Pell、Pythagorean、通二次、高階）
- [ ] 線：解前察 gcd(a, b) | c
- [ ] 擴 Euclid 反代已驗：a*x0 + b*y0 = c 正等
- [ ] 通解含諸解（以整 k 或遞參）
- [ ] Pell：施續分前驗 D 非方
- [ ] Pell：直算確本解滿 x1^2 - D*y1^2 = 1
- [ ] 模阻證列諸餘合，非僅部分
- [ ] 族中至少 3 員代入驗
- [ ] 約（正整、界域）於尋通解後施
- [ ] 無解之言以 gcd 或模阻證

## 忌

- **設凡 gcd | c 之程有正解**：通解 x = x0 + (b/g)*k 含負值。縱程於諸整可解，正解或不存
- **混 x^2 - Dy^2 = 1 於 x^2 - Dy^2 = -1**：負 Pell 唯續分週奇時有解。施正程式於負程目予誤果
- **忘 Pell 瑣解**：(x, y) = (1, 0) 恒滿 x^2 - Dy^2 = 1，然於生非瑣解無用。本解為 y > 0 之**最小**解
- **模阻不全**：僅察 mod 2 或 mod 4 或漏高模之阻。前數模無阻→試 mod 8、9、16、或二次型之判別
- **續分週差一**：收斂索須慎追。本解自 p_{r-1}/q_{r-1}（r 為週長）出，非 p_r/q_r
- **無基之無窮降**：用降證無存時須示降止於矛盾（如 x = 0 矛 x > 0）。無基案→論不全
- **誤施 Fermat 末論**：x^n + y^n = z^n 於 n > 2 無非瑣整解（Wiles, 1995）；然不適於異係程如 2x^3 + 3y^3 = z^3

## 參

- `analyze-prime-numbers` — 因子與 gcd 算為 Diophantine 解之前提
- `solve-modular-arithmetic` — 線同餘 ax = c (mod b) 等於線 Diophantine
- `derive-theoretical-result` — 證 Diophantine 不可能之形推技
