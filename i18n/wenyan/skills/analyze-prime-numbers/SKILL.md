---
name: analyze-prime-numbers
locale: wenyan
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

# 析素數

擇宜算法以應其事：素性試、整因子分解、素分布析。以計算驗其果，而連素數定理。

## 用時

- 定整為素或合乃用
- 尋整之全素因子分解乃用
- 計或列至界之素乃用
- 於特區驗素數定理之近乃用
- 於數論之證或算中察素之屬乃用

## 入

- **必要**：待析之整或分布析之界
- **必要**：事類——素性試、因子分解、或分布析之一
- **可選**：所擇算法（試除、Miller-Rabin、Eratosthenes 篩、Pollard rho）
- **可選**：生素性之正證抑或僅計算判
- **可選**：出之式（因樹、素列、計、表）

## 法

### 第一步：定事類

分請求為三類，擇宜算路。

1. **素性試**：予整 n，定 n 為素否。
2. **因子分解**：予合整 n，尋其全素因子分解。
3. **分布析**：予界 N，析至 N 之諸素（計、列、隙、密）。

錄事類與入值。

**得：** 清分類附入值已錄。

**敗則：** 若入曖昧（如「析 60」），求用者明其欲素試、因分、或分布。合數默因分，疑素默素性確。

### 第二步：施素性試（若事為素性）

以合 n 大之算法試 n 為素否。

1. **處特例**：n < 2 非素。n = 2 或 n = 3 為素。n 偶而 n > 2 為合。

2. **小 n（n < 10^6）**：用試除。
   - 試諸素 p ≤ floor(sqrt(n)) 之整除。
   - 優：試 2，後奇 3、5、7、… 或用 6k +/- 1 輪。
   - 無除者則 n 為素。

3. **大 n（n >= 10^6）**：用 Miller-Rabin 概率試。
   - 書 n - 1 = 2^s * d，d 奇。
   - 每證 a ∈ {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37}：
     - 算 x = a^d mod n。
     - 若 x = 1 或 x = n - 1，此證過。
     - 否則方 x 至多 s - 1 次。若 x 等 n - 1，過。
     - 若無過，n 為合（a 為證）。
   - n < 3.317 * 10^24，諸證 {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37} 給定果。

4. **錄判**：素或合，附證或憑。

**小素參（首 25）：**

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

**得：** 決判（素或合）附所用算法與諸證或除者。

**敗則：** 若 Miller-Rabin 報「概素」而需確，升至決試（如 AKS 或 ECPP）。試除若太緩，轉 Miller-Rabin。

### 第三步：施因子分解（若事為分解）

全分 n 為素冪之式。

1. **試除小因**：
   - 盡除 2 錄冪。
   - 除奇素 3、5、7、11、… 至截（如 10^4 或若 n 小 sqrt(n)）。
   - 每除後更 n 為餘。

2. **若餘 > 1 且 < 10^12**：試除續至 sqrt(餘)。

3. **若餘 > 1 且 >= 10^12**：施 Pollard rho。
   - 擇 f(x) = x^2 + c (mod n)，c 隨機。
   - 用 Floyd 環察：x = f(x)、y = f(f(y))。
   - 每步算 d = gcd(|x - y|, n)。
   - 若 1 < d < n，d 為非平因。遞於 d 與 n/d。
   - 若 d = n，換 c 再試。

4. **驗**：乘諸素因（含冪）確積等原 n。試每因之素性。

5. **呈果**於標式：n = p1^a1 * p2^a2 * … * pk^ak，p1 < p2 < … < pk。

**算法繁度注：**

| Algorithm       | Complexity                  | Best for              |
|-----------------|-----------------------------|-----------------------|
| Trial division  | O(sqrt(n))                  | n < 10^12             |
| Pollard's rho   | O(n^{1/4}) expected         | n up to ~10^18        |
| Quadratic sieve | L(n)^{1+o(1)}              | n up to ~10^50        |
| GNFS            | L(n)^{(64/9)^{1/3}+o(1)}  | n > 10^50             |

**得：** 全素因子分解於標式，驗以乘。

**敗則：** 若 Pollard rho 多迭無非平因（環察得而 gcd 平），試異 c（至少五次）。皆敗則餘或為素——以素試確。

### 第四步：施分布析（若事為分布）

析至給界 N 之素分布。

1. **以 Eratosthenes 篩生素**：
   - 建大 N + 1 之布爾列，初真。
   - 0、1 設假（非素）。
   - 每 p 自 2 至 floor(sqrt(N))：
     - 若 p 猶真，標 p^2、p^2 + p、p^2 + 2p、… 為假。
   - 集諸猶真之索。

2. **計素**：算 pi(N) = 至 N 之素計。

3. **比素數定理**：
   - PNT 近：pi(N) ~ N / ln(N)。
   - 對數積近：Li(N) = 自 2 至 N 之 1/ln(t) 積。
   - 算相對誤：|pi(N) - N/ln(N)| / pi(N)。

4. **析素隙**（可選）：
   - 算連素之隙。
   - 報最大隙、均隙、諸雙素（隙 = 2）。
   - N 附近均隙近 ln(N)。

5. **呈發現**於要表：

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

**得：** 素計附 PNT 比與可選隙析。

**敗則：** 若 N 過大不可內存篩（N > 10^9），用段篩按塊處。若僅需計（非列），Meissel-Lehmer 算法直算 pi(N)。

### 第五步：以計算驗果

用獨立計算法交驗諸果。

1. **素性**：若用試除，以速 Miller-Rabin 驗（或反之）。已知素對公素表或 OEIS 序列察。

2. **因分**：乘諸因確等原入。獨試每宣素因之素性。

3. **分布**：自篩出試 3-5 數之素性為點察。對標基（pi(10^k) k = 1, …, 9）之公 pi(N) 比。

**公 pi(N)：**

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

4. **書驗**附所用法與結果。

**得：** 諸果經獨立驗無異。

**敗則：** 若驗顯異，再行原算開額外察（如詳試除日誌）。最常訛：篩界偏一、模算整溢、誤偽素為素。

## 驗

- [ ] 事類正分（素性、因分、分布）
- [ ] 算法合入大
- [ ] 特例（n < 2、n = 2、n 偶）於通算法前處
- [ ] 素判決定（非「概素」無修飾）
- [ ] 因分乘回原數
- [ ] 每宣素因已試素性
- [ ] 篩界含 sqrt(N) 覆以標合
- [ ] PNT 比用正式（N/ln(N) 或 Li(N)）
- [ ] 果以獨立法或對公值驗
- [ ] 邊例（n = 0、1、2、負入）皆處

## 陷

- **忘 n = 1 非素**：按約，1 非素非合。諸算法默誤分
- **模冪之整溢**：Miller-Rabin 之 a^d mod n，拙冪則溢。用模冪（重方附步模）
- **篩之偏一**：篩必自 p^2 標合，非 2p。自 2p 耗時而正；自 p+1 則誤
- **Pollard rho 環 d = n**：若 gcd(|x - y|, n) = n，算法得平因。換多項常 c 再試，非僅異起點
- **Carmichael 數欺費馬試**：如 561 = 3 * 11 * 17 於諸互素基過費馬試。恆用 Miller-Rabin，非純費馬
- **混 pi(n) 與常 pi**：素計函 pi(n) 與圓常 3.14159… 共號。境當無歧

## 參

- `solve-modular-arithmetic` — 模算為 Miller-Rabin 與諸因分之基
- `explore-diophantine-equations` — 素因分為解諸丟番圖方程之前提
- `formulate-quantum-problem` — Shor 算法連素與量子算
