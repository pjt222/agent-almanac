---
name: analyze-prime-numbers
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Analyze prime numbers using primality tests, factorization algorithms,
  prime distribution analysis, and sieve methods. Covers trial division,
  Miller-Rabin, Sieve of Eratosthenes, and the Prime Number Theorem.
  Use when determining whether an integer is prime or composite, finding
  prime factorizations, counting or listing primes up to a bound, or
  investigating prime properties within a number-theoretic proof or
  computation.
license: MIT
allowed-tools: Read Bash
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: number-theory
  complexity: intermediate
  language: multi
  tags: number-theory, primes, primality, factorization, sieve
---

# 析素

擇行算：素測、分解、分析。算驗結而合素定理。

## 用

- 判某整為素或合→用
- 求整全素分→用
- 限內計或列素→用
- 驗某範素定理近→用
- 數論證或算察素性→用

## 入

- **必**：析之整或分析之限
- **必**：類——素測、分解、分析
- **可**：偏算（試除、Miller-Rabin、Eratosthenes 篩、Pollard rho）
- **可**：出形證或唯算判
- **可**：出式（因樹、素列、計、表）

## 行

### 一：定類

請分為三類擇算路。

1. **素測**：給整 n，判 n 為素否
2. **分解**：給合 n，求其全素分
3. **分析**：給限 N，析 N 內素（計、列、隙、密）

錄類與入值。

得：明分附入值錄。

敗：入含糊（如「析 60」）→請用者明素測、分解、分析。合默為分解，疑素默為素確。

### 二：施素測（若類=素測）

按 n 大配算測 n 為素否。

1. **平案**：n < 2 非素。n = 2 或 3 為素。n 偶且 > 2 為合。

2. **小 n（n < 10^6）**：用試除。
   - 試除諸素 p 至 floor(sqrt(n))
   - 優：試 2、後奇 3、5、7…或用 6k +/- 1 輪
   - 無除則 n 素

3. **大 n（n >= 10^6）**：用 Miller-Rabin 概測。
   - 書 n - 1 = 2^s * d，d 奇
   - 各證 a 於 {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37}：
     - 算 x = a^d mod n
     - x = 1 或 x = n - 1→此證過
     - 否方 x 至 s - 1 次。x 嘗等 n - 1→過
     - 無過→n 合（a 為證）
   - n < 3.317 * 10^24 之 {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37} 證為定

4. **錄判**：素或合，附證或證書。

**首二十五素：**

| Index | Prime | Index | Prime | Index | Prime |
|-------|-------|-------|-------|-------|-------|
| 1     | 2     | 10    | 29    | 19    | 67    |
| 2     | 3     | 11    | 31    | 20    | 71    |
| 3     | 5     | 12    | 37    | 21    | 73    |
| 4     | 7     | 13    | 41    | 22    | 79    |
| 5     | 11    | 14    | 43    | 23    | 83    |
| 6     | 13    | 15    | 47    | 24    | 89    |
| 7     | 17    | 16    | 53    | 25    | 97    |
| 8     | 19    | 17    | 59    |       |       |
| 9     | 23    | 18    | 61    |       |       |

得：定答（素或合）附用算與所見證或除。

敗：Miller-Rabin 報「概素」而需確→升至定測（如 AKS 或 ECPP）。試除算太慢→換 Miller-Rabin。

### 三：施分解（若類=分解）

全分 n 為其素冪分。

1. **以試除取小因**：
   - 除 2 盡，錄冪
   - 除奇素 3、5、7、11…至截（如 10^4 或小 n 之 sqrt(n)）
   - 各除後更 n 為剩餘因

2. **若餘 > 1 且 < 10^12**：續試除至 sqrt(餘)。

3. **若餘 > 1 且 >= 10^12**：施 Pollard rho。
   - 擇 f(x) = x^2 + c (mod n) 隨 c
   - 用 Floyd 環察：x = f(x)、y = f(f(y))
   - 各步算 d = gcd(|x - y|, n)
   - 1 < d < n→d 為非平因。遞於 d 與 n/d
   - d = n→以異 c 重試

4. **驗**：乘諸素因（附冪）確同原 n。各因素測。

5. **以標式呈**：n = p1^a1 * p2^a2 * ... * pk^ak，p1 < p2 < ... < pk。

**算複雜：**

| Algorithm       | Complexity                  | Best for              |
|-----------------|-----------------------------|-----------------------|
| Trial division  | O(sqrt(n))                  | n < 10^12             |
| Pollard's rho   | O(n^{1/4}) expected         | n up to ~10^18        |
| Quadratic sieve | L(n)^{1+o(1)}              | n up to ~10^50        |
| GNFS            | L(n)^{(64/9)^{1/3}+o(1)}  | n > 10^50             |

得：標式之全素分，乘驗。

敗：Pollard rho 多迭不得因（環察無非平 gcd）→試異 c（至少 5 次）。皆敗→餘或為素，以素測確。

### 四：施分析（若類=分析）

析 N 內素分。

1. **以 Eratosthenes 篩生素**：
   - 建大 N + 1 之布陣，初為真
   - 設 0 與 1 為偽（非素）
   - 各 p 自 2 至 floor(sqrt(N))：
     - p 仍真→標諸倍 p^2、p^2 + p、p^2 + 2p…為偽
   - 收諸仍真之指

2. **計素**：算 pi(N) = N 內素數。

3. **比於素定理**：
   - PNT 近：pi(N) ~ N / ln(N)
   - 對數積近：Li(N) = integral from 2 to N of 1/ln(t) dt
   - 算相對誤：|pi(N) - N/ln(N)| / pi(N)

4. **析素隙**（可）：
   - 算連素隙
   - 報最大隙、均隙、雙生素（隙=2）
   - N 近均隙約 ln(N)

5. **以表呈**：

```
Bound N:       1,000,000
pi(N):         78,498
N/ln(N):       72,382
Li(N):         78,628
Relative error (N/ln(N)):  7.79%
Relative error (Li(N)):    0.17%
Max prime gap:  148 (between 492113 and 492227)
Twin primes:    8,169 pairs
```

得：素計附 PNT 比與可選隙析。

敗：N 太大不能內存篩（N > 10^9）→用段篩按段處範。唯需計（非列）→用 Meissel-Lehmer 直算 pi(N)。

### 五：算驗

以獨法交核諸結。

1. **素測**：試除用→以快 Miller-Rabin 驗（或反之）。知素查表或 OEIS 序。

2. **分解**：乘諸因確同原入。獨測諸宣素因素性。

3. **分析**：抽 3-5 篩出之數獨素測。比 pi(N) 於標基出版值（pi(10^k) k = 1, ..., 9）。

**pi(N) 出版值：**

| N       | pi(N)        |
|---------|-------------|
| 10      | 4           |
| 100     | 25          |
| 1,000   | 168         |
| 10,000  | 1,229       |
| 100,000 | 9,592       |
| 10^6    | 78,498      |
| 10^7    | 664,579     |
| 10^8    | 5,761,455   |
| 10^9    | 50,847,534  |

4. **錄驗**附用法與果。

得：諸結獨驗無異。

敗：驗示異→重行原算開額察（如試除詳記）。常誤：篩限差一、模算整溢、誤偽素為素。

## 驗

- [ ] 類正分（素、解、布）
- [ ] 算合入大
- [ ] 平案（n < 2、n = 2、偶 n）通算前處
- [ ] 素判定（非「概素」無修飾）
- [ ] 分解乘回原
- [ ] 諸宣素因皆素測
- [ ] 篩限含 sqrt(N) 覆以標合
- [ ] PNT 比用正式（N/ln(N) 或 Li(N)）
- [ ] 結以獨法或於出版值驗
- [ ] 邊例（n = 0、1、2、負入）皆理

## 忌

- **忘 n = 1 非素**：例 1 既非素亦非合。諸算默誤分

- **模冪整溢**：Miller-Rabin 算 a^d mod n 樸冪致溢。用模冪（重方各步取模）

- **篩差一誤**：篩標合自 p^2 始非 2p。自 2p 浪時但正；自 p+1 誤

- **Pollard rho 環 d = n**：gcd(|x - y|, n) = n→算得平因。試異多項常 c，非異始點

- **Carmichael 數欺 Fermat 測**：561 = 3 * 11 * 17 等過諸互素基之 Fermat 素測。恆用 Miller-Rabin 非平 Fermat

- **混 pi(n) 與常 pi**：素計函 pi(n) 與圓常 3.14159… 共記。脈須無歧

## 參

- `solve-modular-arithmetic` —— 模算為 Miller-Rabin 與諸分解法之基
- `explore-diophantine-equations` —— 素分為解多 Diophantine 方之前置
- `formulate-quantum-problem` —— Shor 整分算接素於量算
