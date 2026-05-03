---
name: solve-modular-arithmetic
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Solve modular arithmetic problems including congruences, systems
  via the Chinese Remainder Theorem, modular inverses, and
  Euler's theorem applications. Covers both manual and computational
  approaches. Use when solving linear congruences, computing modular
  inverses, evaluating large modular exponentiations, working with
  simultaneous congruences (CRT), or operating in cyclic groups and
  discrete logarithm contexts.
license: MIT
allowed-tools: Read Bash
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: number-theory
  complexity: intermediate
  language: multi
  tags: number-theory, modular-arithmetic, congruences, crt, euler
---

# 解模算之題

解模算之問——析同餘系、行擴展歐幾里得算以求逆、用中國剩餘定理解同餘之系、施歐拉定理於模冪。每解皆以代入而驗。

## 用時

- 解單線性同餘 ax = b (mod m) 乃用
- 解同餘之系（中國剩餘定理）乃用
- 算模逆 a^{-1} (mod m) 乃用
- 求大模冪 a^k (mod m) 乃用
- 定 Z/mZ 中元之階乃用
- 處循群、本原根、離散對數之境乃用

## 入

- **必要**：所欲解之同餘或模方程
- **可選**：是否明示擴歐之步
- **可選**：是否施歐拉或費馬小定理
- **可選**：是否求本原根或元之階
- **可選**：出之格（逐步、緊湊、證式）

## 法

### 第一步：析同餘之系或模方程

自題述提數學之構。

1. **識其類**：
   - 單線性同餘：ax = b (mod m)
   - 同餘之系：x = a1 (mod m1)、x = a2 (mod m2)、...
   - 模冪：a^k (mod m)
   - 模逆：求 a^{-1} (mod m)

2. **正規化**：諸係皆模其應之模而減。確 a、b、m 為非負整，m > 0。

3. **記**已析之題以標式書之。

得：明析而正規化之模題，諸值皆減。

敗則：若記不明（如「solve 3x + 5 = 2 mod 7」可解為 3x + 5 = 2 (mod 7) 或 3x + (5 = 2 mod 7)），請用者明之。默為 mod 施於全方程。

### 第二步：解單同餘（若適）

以擴歐解 ax = b (mod m)。

1. **算 g = gcd(a, m)** 用歐幾里得算：
   - 反復除：m = q1*a + r1、a = q2*r1 + r2、... 至餘 = 0。
   - 末非零之餘為 gcd(a, m)。

2. **察可解**：ax = b (mod m) 有解當且唯當 g | b。
   - 若 g 不分 b，無解。止。

3. **減**：俱除以 g 得 (a/g)x = (b/g) (mod m/g)。今 gcd(a/g, m/g) = 1。

4. **求 a/g 對 m/g 之模逆** 用擴歐：
   - 反代於歐之諸步，書 gcd 為線性合：1 = (a/g)*s + (m/g)*t。
   - 係 s（減 mod m/g）為逆。

5. **算特解**：x0 = s * (b/g) mod (m/g)。

6. **書通解**：x = x0 + (m/g)*k 為 k = 0, 1, ..., g - 1，凡 g 不同餘解皆現於 mod m。

**擴歐之例（求 17^{-1} mod 43）：**
```
43 = 2*17 + 9
17 = 1*9  + 8
 9 = 1*8  + 1
 8 = 8*1  + 0

Back-substitute:
1 = 9 - 1*8
  = 9 - 1*(17 - 1*9) = 2*9 - 17
  = 2*(43 - 2*17) - 17 = 2*43 - 5*17

So 17*(-5) = 1 (mod 43), i.e., 17^{-1} = -5 = 38 (mod 43).
```

得：同餘之全解集，或無解之證。

敗則：若擴歐反代生誤，驗各除步。最常之誤為反代中之符誤。察：a * inverse mod m 當為 1。

### 第三步：以中國剩餘定理解系（若適）

解 x = a1 (mod m1)、x = a2 (mod m2)、...、x = ak (mod mk)。

1. **察兩兩互素**：每對 (mi, mj)，驗 gcd(mi, mj) = 1。
   - 諸對皆互素，CRT 直施。
   - 若某對非互素，察容性：每非互素對驗 ai = aj (mod gcd(mi, mj))。容則以 lcm 減。否則無解。

2. **算 M = m1 * m2 * ... * mk**（諸模之積）。

3. **各 i 算 Mi = M / mi**（除 mi 之諸模之積）。

4. **各 i 求 yi = Mi^{-1} (mod mi)** 以第二步之擴歐。

5. **算解**：x = sum(ai * Mi * yi for i = 1..k) mod M。

6. **陳果**：x = [value] (mod M)。此為 mod M 之唯一解。

**常 totient 之參：**

| n    | phi(n) | n    | phi(n) | n    | phi(n) |
|------|--------|------|--------|------|--------|
| 2    | 1      | 10   | 4      | 20   | 8      |
| 3    | 2      | 11   | 10     | 24   | 8      |
| 4    | 2      | 12   | 4      | 25   | 20     |
| 5    | 4      | 13   | 12     | 30   | 8      |
| 6    | 2      | 14   | 6      | 36   | 12     |
| 7    | 6      | 15   | 8      | 48   | 16     |
| 8    | 4      | 16   | 8      | 60   | 16     |
| 9    | 6      | 18   | 6      | 100  | 40     |

得：mod M 之唯一解，或不容之證。

敗則：若 CRT 算生果驗敗，察第四步之模逆算。常之誤為算 Mi^{-1} mod M 而非 Mi^{-1} mod mi。各逆以*個*模算，非以積算。

### 第四步：施歐拉或費馬小定理（若適）

以歐拉定理求模冪或簡式。

1. **歐拉定理**：若 gcd(a, m) = 1，則 a^{phi(m)} = 1 (mod m)。
   - 算 phi(m) 以 totient 公式：若 m = p1^e1 * p2^e2 * ... * pk^ek，則 phi(m) = m * product((1 - 1/pi) for each prime pi dividing m)。

2. **費馬小定理**（特例）：若 p 為素而 gcd(a, p) = 1，則 a^{p-1} = 1 (mod p)。

3. **減指**：算 a^k (mod m)：
   - 算 r = k mod phi(m)。
   - 則 a^k = a^r (mod m)。

4. **算 a^r (mod m)** 用反復平方（二進冪）：
   - 書 r 為二進：r = b_n * 2^n + ... + b_1 * 2 + b_0。
   - 始 result = 1。
   - 自高位至低位：result = result^2 mod m；若位為 1，result = result * a mod m。

5. **gcd(a, m) > 1 之治**：歐拉定理不直施。分 m 而以 CRT 合素冪模之果，用提升指或直算。

得：a^k (mod m) 之值，由減指與反復平方算之。

敗則：若 gcd(a, m) > 1 而果似誤，勿施歐拉定理。代之以直算或分 m 為互素部，至少某部與 a 互素，於各部解，以 CRT 重合。

### 第五步：以代入驗解

每解皆代入原方程而察。

1. **單同餘**：算 a * x mod m 而驗其等 b。

2. **CRT 系**：每同餘 x = ai (mod mi)，驗 x mod mi = ai。

3. **模冪**：若可，以二法驗（如小值之直算或獨之反復平方實）。

4. **明書驗**：
```
Solution: x = 23
Check 1: 23 mod 3 = 2 = a1. Correct.
Check 2: 23 mod 5 = 3 = a2. Correct.
Check 3: 23 mod 7 = 2 = a3. Correct.
All congruences satisfied.
```

得：諸原方程皆驗，明示其算。

敗則：若驗敗，回追法以尋算誤。常源：擴歐之算誤、反代之符誤、忘終 CRT 步中減 mod M。

## 驗

- [ ] 題類正識（單同餘、系、冪、逆）
- [ ] 諸係皆以其應模減
- [ ] ax = b (mod m) 之解前已察 gcd(a, m) | b
- [ ] 擴歐反代已驗：a * inverse mod m = 1
- [ ] CRT 之施前已驗兩兩互素
- [ ] CRT 非互素模時容已察
- [ ] 歐拉定理唯於 gcd(a, m) = 1 時施
- [ ] totient phi(m) 以素分解算，非猜
- [ ] 反復平方每步皆模減（無溢）
- [ ] 每解皆代入原方程而驗

## 陷

- **施 CRT 而不察互素**：標 CRT 公式須兩兩互素之模。施於非互素得誤果，非錯。先察 gcd(mi, mj) = 1。

- **算誤之逆**：Mi^{-1} 須以 mi（*個*模）算，非以 M（積）算。CRT 實之最常誤。

- **gcd(a, m) > 1 而施歐拉定理**：a^{phi(m)} = 1 (mod m) 須 gcd(a, m) = 1。否則定理不施而果誤。

- **擴歐反代之符誤**：諸步皆慎追符。終逆或負；恆減 mod m 以得正代表。

- **模冪之溢**：縱反復平方，中積可溢。每乘後皆減 mod m，非僅末。

- **忘多解**：ax = b (mod m) 而 g = gcd(a, m) > 1 且 g | b 有恰 g 不同餘解於 mod m，非唯一。

## 參

- `analyze-prime-numbers` — 素分解須以算 phi(m) 與驗互素
- `explore-diophantine-equations` — 線性 Diophantine 方程 ax + by = c 等於線性同餘 ax = c (mod b)
- `prove-geometric-theorem` — 模算現於可構造之證（如何規 n 邊形可構）
