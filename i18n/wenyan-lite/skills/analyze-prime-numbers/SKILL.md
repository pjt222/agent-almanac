---
name: analyze-prime-numbers
locale: wenyan-lite
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

# 析質數

藉為當下任務擇宜之演算法（質性測試、整數分解或質數分佈分析），析質數。以計算驗結果並將發現繫於質數定理。

## 適用時機

- 判給定整數為質或合
- 尋整數之完整質因式分解
- 計或列至給定界之質數
- 為特定範圍驗質數定理之近似
- 析數論證明或計算中質數之性質

## 輸入

- **必要**：欲析之整數，或分佈分析之上界
- **必要**：任務類型——質性測試、分解或分佈分析之一
- **選擇性**：偏好之演算法（試除、Miller-Rabin、Eratosthenes 篩、Pollard rho）
- **選擇性**：是否產質性之形式證明，抑或僅計算裁決
- **選擇性**：輸出格式（因子樹、質數列、計數、表）

## 步驟

### 步驟一：判任務類型

將請求歸為三類之一並擇宜之演算路徑。

1. **質性測試**：給單一整數 n，判 n 為質否
2. **分解**：給合數 n，尋其完整質因式分解
3. **分佈分析**：給界 N，析至 N 之質數（計、列、間距、密度）

記任務類型與輸入值。

**預期：** 清晰之分類，輸入值已記。

**失敗時：** 若輸入曖昧（如「析 60」），請使用者澄清欲質性測試、分解或分佈分析。對合數預設為分解，對疑似質數預設為質性確認。

### 步驟二：施質性測試（若任務 = 質性）

以合於 n 之大小之演算法測試 n 是否為質。

1. **處理瑣碎情況**：n < 2 非質。n = 2 或 n = 3 為質。若 n 偶且 n > 2，為合
2. **小 n（n < 10^6）**：用試除
   - 對至 floor(sqrt(n)) 之一切質數 p 試整除
   - 優化：先試 2，後試奇數 3、5、7…，或用 6k +/- 1 輪
   - 若無除數現，n 為質
3. **大 n（n >= 10^6）**：用 Miller-Rabin 機率測試
   - 寫 n - 1 = 2^s * d，d 奇
   - 對每見證 a 於 {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37}：
     - 計 x = a^d mod n
     - 若 x = 1 或 x = n - 1，此見證通過
     - 否則平方 x 至 s - 1 次。若 x 等於 n - 1 過，則通過
     - 若無通過，n 為合（a 為見證）
   - 對 n < 3.317 * 10^24，見證 {2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37} 給確定結果
4. **記裁決**：質或合，附見證或證書

**小質數參考（前 25）：**

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

**預期：** 確定之答（質或合），附所用演算法與所尋見證或除數。

**失敗時：** 若 Miller-Rabin 報「可能為質」而需確定，升至確定性測試（如 AKS 或 ECPP）。對試除，若計算過慢，改 Miller-Rabin。

### 步驟三：施分解（若任務 = 分解）

將 n 完整分解為其質冪分解。

1. **以試除提小因子**：
   - 盡能將 2 除出，記指數
   - 將奇質數 3、5、7、11… 除出至截止（如 10^4 或 sqrt(n)，若 n 小）
   - 每除後更新 n 為餘餘因子
2. **若餘因子 > 1 且 < 10^12**：續試除至 sqrt(餘因子)
3. **若餘因子 > 1 且 >= 10^12**：施 Pollard rho 演算法
   - 擇 f(x) = x^2 + c (mod n)，c 隨機
   - 用 Floyd 循環偵測：x = f(x)、y = f(f(y))
   - 每步計 d = gcd(|x - y|, n)
   - 若 1 < d < n，d 為非瑣因子。對 d 與 n/d 遞迴
   - 若 d = n，以不同 c 重試
4. **驗**：將一切所尋質因子（附指數）相乘，確積等原 n。對每因子試質性
5. **以標準形呈結果**：n = p1^a1 * p2^a2 * ... * pk^ak，p1 < p2 < ... < pk

**演算法繁複度註：**

| Algorithm       | Complexity                  | Best for              |
|-----------------|-----------------------------|-----------------------|
| Trial division  | O(sqrt(n))                  | n < 10^12             |
| Pollard's rho   | O(n^{1/4}) expected         | n up to ~10^18        |
| Quadratic sieve | L(n)^{1+o(1)}              | n up to ~10^50        |
| GNFS            | L(n)^{(64/9)^{1/3}+o(1)}  | n > 10^50             |

**預期：** 規範形之完整質因式分解，由乘法驗。

**失敗時：** 若 Pollard rho 多迭仍無因子（已偵循環而無非瑣 gcd），試不同之 c 值（至少 5 試）。若皆失，餘因子或為質——以質性測試確認。

### 步驟四：施分佈分析（若任務 = 分佈）

析至給定界 N 之質數分佈。

1. **以 Eratosthenes 篩生質數**：
   - 建大小 N + 1 之布林陣列，初為 true
   - 將索引 0 與 1 設 false（非質）
   - 對 p 自 2 至 floor(sqrt(N))：
     - 若 p 仍標 true，將一切倍數 p^2、p^2 + p、p^2 + 2p… 標 false
   - 收一切仍標 true 之索引
2. **計質數**：算 pi(N) = 至 N 之質數計數
3. **與質數定理比**：
   - PNT 近似：pi(N) ~ N / ln(N)
   - 對數積分近似：Li(N) = integral from 2 to N of 1/ln(t) dt
   - 計相對誤差：|pi(N) - N/ln(N)| / pi(N)
4. **析質數間距**（選擇性）：
   - 計連續質數間之間距
   - 報最大間距、平均間距、任孿生質數（間距 = 2）
   - N 附近平均間距約為 ln(N)
5. **以摘要表呈發現**：

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

**預期：** 質數計數附 PNT 比對與選擇性間距分析。

**失敗時：** 若 N 過大不能於記憶體中篩（N > 10^9），用以區塊處理範圍之分段篩。若僅需計（非列），用 Meissel-Lehmer 演算法直接得 pi(N)。

### 步驟五：計算驗結果

以獨立之計算法交叉查一切結果。

1. **對質性**：若用試除，以快速 Miller-Rabin 過驗（或反之）。對已知質數，對已發表質數表或 OEIS 序列查
2. **對分解**：將一切因子相乘並確等於原輸入。獨立試各所稱質因子之質性
3. **對分佈**：自篩輸出抽 3-5 個別數試質性。將 pi(N) 對標準基準（k = 1, …, 9 之 pi(10^k)）之已發表值比

**已發表之 pi(N) 值：**

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

4. **記驗證**附所用法與結果。

**預期：** 一切結果獨立驗，無歧異。

**失敗時：** 若驗揭歧異，重行原計算並啟額外查（如冗詳之試除記錄）。最常見之誤為篩界差一、模算術中整數溢位、將偽質誤為真質。

## 驗證

- [ ] 任務類型已正確分類（質性、分解或分佈）
- [ ] 演算法合於輸入規模
- [ ] 瑣碎情況（n < 2、n = 2、偶 n）於通用演算法前處理
- [ ] 質性裁決確定（非未限制之「可能為質」）
- [ ] 分解相乘回原數
- [ ] 每所稱質因子已試質性
- [ ] 篩界含 sqrt(N) 之合數標記覆蓋
- [ ] PNT 比對用正確公式（N/ln(N) 或 Li(N)）
- [ ] 結果由獨立法或對已發表值驗
- [ ] 邊界情況（n = 0、1、2、負輸入）已處理

## 常見陷阱

- **遺 n = 1 非質**：按慣例，1 既非質亦非合。許多演算法默默誤類之

- **模冪中之整數溢位**：為 Miller-Rabin 計 a^d mod n 時，樸素冪算溢位。用模冪算（每步取模之重複平方）

- **篩之差一誤**：篩須自 p^2 而非自 2p 標合數。自 2p 起費時然正確；自 p+1 起則誤

- **Pollard rho 之 d = n 循環**：若 gcd(|x - y|, n) = n，演算法尋得瑣因子。以不同多項式常 c 重試，非僅以不同起點

- **Carmichael 數騙 Fermat 測試**：561 = 3 * 11 * 17 等數對一切互質基通 Fermat 質性測試。恆用 Miller-Rabin 而非純 Fermat

- **混 pi(n) 與常數 pi**：質數計數函式 pi(n) 與圓常數 3.14159… 共用記號。情境須無歧

## 相關技能

- `solve-modular-arithmetic` — 模算術為 Miller-Rabin 與許多分解法之基
- `explore-diophantine-equations` — 質因式分解為解許多 Diophantine 方程之先決
- `formulate-quantum-problem` — Shor 整數分解演算法將質數繫於量子計算
