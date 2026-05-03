---
name: solve-modular-arithmetic
locale: wenyan-ultra
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

# 解模算

解同餘——析同餘系、用擴 Euclid 求逆、用中國餘剩定理（CRT）解同時、用 Euler 定理為模冪。各解必代驗。

## 用

- 解單線同餘 ax = b (mod m)→用
- 解同時同餘系（CRT）→用
- 計模逆 a^{-1} (mod m)→用
- 評大模冪 a^k (mod m)→用
- 定 Z/mZ 中元之序→用
- 循群、原根、離散對境→用

## 入

- **必**：待解之同餘或模方
- **可**：是否明示擴 Euclid 步
- **可**：是否施 Euler 或 Fermat 小定理
- **可**：是否覓原根或元序
- **可**：出格（逐步、緊、證式）

## 行

### 一：析同餘系或模方

由問取數構：

1. **識類**：
   - 單線同餘：ax = b (mod m)
   - 同餘系：x = a1 (mod m1), x = a2 (mod m2), ...
   - 模冪：a^k (mod m)
   - 模逆：求 a^{-1} (mod m)

2. **規**：諸係模其模而簡。確 a、b、m 為非負整、m > 0

3. **記** 析問於標號

得：明析、規之模問、諸值已簡。

敗：號歧（如「解 3x + 5 = 2 mod 7」或為 3x + 5 = 2 (mod 7) 或 3x + (5 = 2 mod 7)）→詢用。默以模施全方。

### 二：解單同餘（如可）

以擴 Euclid 解 ax = b (mod m)。

1. **計 g = gcd(a, m)** 用 Euclid 算：
   - 復除：m = q1*a + r1、a = q2*r1 + r2、...至餘 = 0
   - 末非零餘為 gcd(a, m)

2. **察可解**：ax = b (mod m) 有解當且唯當 g | b
   - g 不除 b→無解。止

3. **減**：兩除以 g 得 (a/g)x = (b/g) (mod m/g)。今 gcd(a/g, m/g) = 1

4. **求 a/g 模 m/g 之逆** 用擴 Euclid：
   - 自 Euclid 步反代以表 gcd 為線組合：1 = (a/g)*s + (m/g)*t
   - 係 s（簡 mod m/g）為逆

5. **計特解**：x0 = s * (b/g) mod (m/g)

6. **書通解**：x = x0 + (m/g)*k 為 k = 0, 1, ..., g - 1 給諸 g 模 m 不同餘解

**擴 Euclid 例（求 17^{-1} mod 43）：**
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

得：同餘之全解集、或無解之證。

敗：擴 Euclid 反代生誤果→驗各除步。最常為反代中號誤。察：a * 逆 mod m 當為 1。

### 三：以 CRT 解系（如可）

解 x = a1 (mod m1), x = a2 (mod m2), ..., x = ak (mod mk)。

1. **驗對對互質**：各對 (mi, mj) 驗 gcd(mi, mj) = 1
   - 諸對皆互質→CRT 直施
   - 某對非互質→察容：各非互質對驗 ai = aj (mod gcd(mi, mj))。容→以 lcm 減。不容→無解

2. **計 M = m1 * m2 * ... * mk**（諸模之積）

3. **各 i 計 Mi = M / mi**（除 mi 外諸模之積）

4. **各 i 求 yi = Mi^{-1} (mod mi)** 用步二之擴 Euclid

5. **計解**：x = sum(ai * Mi * yi for i = 1..k) mod M

6. **陳果**：x = [值] (mod M)。為模 M 之獨解

**常 totient 參：**

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

得：模 M 之獨解、或不容之證。

敗：CRT 計生敗驗果→察步四模逆計。常誤為計 Mi^{-1} mod M 而非 Mi^{-1} mod mi。各逆於*個*模、非積。

### 四：施 Euler 或 Fermat 小定理（如可）

以 Euler 定理評模冪或簡。

1. **Euler 定理**：若 gcd(a, m) = 1、則 a^{phi(m)} = 1 (mod m)
   - 計 phi(m) 以 totient 式：m = p1^e1 * p2^e2 * ... * pk^ek、phi(m) = m * 諸 (1 - 1/pi) 之積、pi 為除 m 之素

2. **Fermat 小定理**（特例）：p 素、gcd(a, p) = 1→a^{p-1} = 1 (mod p)

3. **減冪**：計 a^k (mod m)：
   - 計 r = k mod phi(m)
   - 則 a^k = a^r (mod m)

4. **計 a^r (mod m)** 用復方（二進冪）：
   - 書 r 為二進：r = b_n * 2^n + ... + b_1 * 2 + b_0
   - 始 result = 1
   - 各位自最重至最輕：result = result^2 mod m；位為 1→result = result * a mod m

5. **gcd(a, m) > 1 之例**：Euler 不直施。析 m 而以 CRT 合素冪模之果、用提冪或直計

得：a^k (mod m) 之值、以冪減與復方計。

敗：gcd(a, m) > 1 而果似誤→勿施 Euler。直計或析 m 為互質部、至少某部與 a 互質、各部解、以 CRT 合。

### 五：以代驗解

各解代回原方。

1. **單同餘**：計 a * x mod m 驗為 b

2. **CRT 系**：各 x = ai (mod mi) 驗 x mod mi = ai

3. **模冪**：可則用次法驗（如小值直計、或獨復方）

4. **明文驗**：
```
Solution: x = 23
Check 1: 23 mod 3 = 2 = a1. Correct.
Check 2: 23 mod 5 = 3 = a2. Correct.
Check 3: 23 mod 7 = 2 = a3. Correct.
All congruences satisfied.
```

得：諸原方明驗示計。

敗：驗敗→自過追計誤。常源：擴 Euclid 算誤、反代號誤、忘 CRT 末步簡 mod M。

## 驗

- [ ] 問類正識（單同餘、系、冪、逆）
- [ ] 諸係皆模其模而簡
- [ ] ax = b (mod m)：解前察 gcd(a, m) | b
- [ ] 擴 Euclid 反代驗：a * 逆 mod m = 1
- [ ] CRT：施前驗對對互質
- [ ] CRT 含非互質模：察容
- [ ] Euler 唯施於 gcd(a, m) = 1
- [ ] phi(m) 自素析計、非猜
- [ ] 復方各步皆模簡（無溢）
- [ ] 各解代原方驗

## 忌

- **施 CRT 不察互質**：標 CRT 式需對對互質。施於非互質生誤、非錯。先察 gcd(mi, mj) = 1
- **計誤逆**：Mi^{-1} 必計模 mi（*個*模）、非模 M（積）。最常 CRT 行誤
- **gcd(a, m) > 1 施 Euler**：a^{phi(m)} = 1 (mod m) 需 gcd(a, m) = 1。否則不施、果誤
- **擴 Euclid 反代號誤**：步中慎追號。末逆或為負；恆模 m 簡為正代
- **模冪溢**：縱用復方、中積或溢。各乘後皆模簡、非唯末
- **忘多解**：ax = b (mod m)、g = gcd(a, m) > 1、g | b→恰 g 個模 m 不同餘解、非一

## 參

- `analyze-prime-numbers` — 素析需於計 phi(m) 與驗互質
- `explore-diophantine-equations` — 線 Diophantine ax + by = c 等於線同餘 ax = c (mod b)
- `prove-geometric-theorem` — 模算現於可作證（如何正 n 邊可作）
