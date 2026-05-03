---
name: solve-modular-arithmetic
locale: wenyan-lite
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

# 解模算術

解模算術問題：解析同餘系統、套用擴展歐幾里得演算法求逆、用中國剩餘定理解同時同餘、藉歐拉定理進行模指數運算。每解皆以代回驗證。

## 適用時機

- 解單一線性同餘 ax = b (mod m)
- 解同時同餘系統（中國剩餘定理）
- 計算模逆元 a^{-1} (mod m)
- 求大數模指數 a^k (mod m)
- 確定 Z/mZ 中元素之階
- 用於循環群、原根或離散對數情境

## 輸入

- **必要**：待解之同餘式或模方程
- **選擇性**：是否明示擴展歐幾里得演算步驟
- **選擇性**：是否套用歐拉定理或費馬小定理
- **選擇性**：是否求原根或元素階
- **選擇性**：輸出格式（逐步、緊湊或證明式）

## 步驟

### 步驟一：解析同餘系統或模方程

從問題敘述中萃取數學結構。

1. **識別類型**：
   - 單一線性同餘：ax = b (mod m)
   - 同餘系統：x = a1 (mod m1)、x = a2 (mod m2)、...
   - 模指數：a^k (mod m)
   - 模逆：求 a^{-1} (mod m)

2. **正規化**：將所有係數對其各自之模化簡。確保 a、b、m 為非負整數且 m > 0。

3. **以標準記法**記下解析後之問題。

**預期：** 清晰解析且正規化之模問題，所有值已化簡。

**失敗時：** 若記法有歧義（如「solve 3x + 5 = 2 mod 7」可指 3x + 5 = 2 (mod 7) 或 3x + (5 = 2 mod 7)），與用戶澄清。預設將 mod 解為作用於整個方程。

### 步驟二：解單一同餘（如適用）

以擴展歐幾里得演算法解 ax = b (mod m)。

1. **計算 g = gcd(a, m)** 用歐幾里得演算法：
   - 反覆做除法：m = q1*a + r1、a = q2*r1 + r2、... 直至餘為 0。
   - 最後非零之餘即 gcd(a, m)。

2. **檢查可解性**：ax = b (mod m) 有解當且僅當 g | b。
   - 若 g 不整除 b，則同餘無解。停止。

3. **化簡**：兩邊同除以 g 得 (a/g)x = (b/g) (mod m/g)。此時 gcd(a/g, m/g) = 1。

4. **求 a/g 對 m/g 之模逆** 用擴展歐幾里得演算法：
   - 自歐幾里得演算法步驟回代，將 gcd 表為線性組合：1 = (a/g)*s + (m/g)*t。
   - 係數 s（對 m/g 化簡）即逆。

5. **計算特解**：x0 = s * (b/g) mod (m/g)。

6. **寫一般解**：x = x0 + (m/g)*k，k = 0, 1, ..., g - 1，給出對 m 之全部 g 個不同餘解。

**擴展歐幾里得演算法範例（求 17^{-1} mod 43）：**
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

**預期：** 同餘之完整解集，或無解之證明。

**失敗時：** 若擴展歐幾里得回代產生錯結果，驗每除法步驟。最常見錯為回代時之符號錯。檢：a * inverse mod m 應等 1。

### 步驟三：以中國剩餘定理解系統（如適用）

解 x = a1 (mod m1)、x = a2 (mod m2)、...、x = ak (mod mk)。

1. **檢查兩兩互質**：對每對 (mi, mj)，驗 gcd(mi, mj) = 1。
   - 若所有對皆互質，CRT 直接適用。
   - 若某些對不互質，檢相容性：對每非互質對，驗 ai = aj (mod gcd(mi, mj))。若相容，以 lcm 化簡。若不相容，無解。

2. **計算 M = m1 * m2 * ... * mk**（所有模之積）。

3. **對每 i 計算 Mi = M / mi**（除 mi 外所有模之積）。

4. **對每 i 求 yi = Mi^{-1} (mod mi)** 用步驟二之擴展歐幾里得演算法。

5. **計算解**：x = sum(ai * Mi * yi for i = 1..k) mod M。

6. **陳述結果**：x = [value] (mod M)。此為對 M 之唯一解。

**常見歐拉函數對照：**

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

**預期：** 對 M 之唯一解，或不相容之證明。

**失敗時：** 若 CRT 計算所得結果未通過驗證，檢步驟四之模逆計算。常見錯為計算 Mi^{-1} mod M 而非 Mi^{-1} mod mi。每逆是對*個別*模而非積計算。

### 步驟四：套用歐拉定理或費馬小定理（如適用）

評估模指數或用歐拉定理化簡表達式。

1. **歐拉定理**：若 gcd(a, m) = 1，則 a^{phi(m)} = 1 (mod m)。
   - 用歐拉函數公式計 phi(m)：若 m = p1^e1 * p2^e2 * ... * pk^ek，則 phi(m) = m * product((1 - 1/pi) for each prime pi dividing m)。

2. **費馬小定理**（特例）：若 p 為質數且 gcd(a, p) = 1，則 a^{p-1} = 1 (mod p)。

3. **化簡指數**：欲計 a^k (mod m)：
   - 計 r = k mod phi(m)。
   - 則 a^k = a^r (mod m)。

4. **以反覆平方（二進位指數）計 a^r (mod m)**：
   - 將 r 寫為二進位：r = b_n * 2^n + ... + b_1 * 2 + b_0。
   - 自 result = 1 起。
   - 對自最高位至最低位之每位：result = result^2 mod m；若位為 1，則 result = result * a mod m。

5. **處理 gcd(a, m) > 1 之情況**：歐拉定理不直接適用。將 m 分解並用 CRT 結合質數冪模之結果，用提升指數法或直接計算。

**預期：** a^k (mod m) 之值，經指數化簡與反覆平方計算所得。

**失敗時：** 若 gcd(a, m) > 1 且結果似錯，勿套歐拉定理。改直接計算或將 m 分解為互質部分（其中至少一些部分與 a 互質），對每部分解之，再以 CRT 重組。

### 步驟五：以代回驗證解

將每解代入原方程驗證。

1. **對單一同餘**：計 a * x mod m 並驗其等 b。

2. **對 CRT 系統**：對每同餘 x = ai (mod mi)，驗 x mod mi = ai。

3. **對模指數**：如可能，以第二種計算方法驗證（如對小值直接計算，或獨立之反覆平方實作）。

4. **明示驗證之記錄**：
```
Solution: x = 23
Check 1: 23 mod 3 = 2 = a1. Correct.
Check 2: 23 mod 5 = 3 = a2. Correct.
Check 3: 23 mod 7 = 2 = a3. Correct.
All congruences satisfied.
```

**預期：** 所有原方程已以明示計算驗證。

**失敗時：** 若驗證失敗，回追過程以尋計算錯。常見來源：擴展歐幾里得演算法之算術錯、回代之符號錯，或最終 CRT 步驟漏對 M 化簡。

## 驗證

- [ ] 問題類型已正確識別（單一同餘、系統、指數、逆）
- [ ] 所有係數已對其各自模化簡
- [ ] 對 ax = b (mod m)：解前已檢 gcd(a, m) | b
- [ ] 擴展歐幾里得回代已驗：a * inverse mod m = 1
- [ ] 對 CRT：套用前已驗兩兩互質
- [ ] 對模不互質之 CRT：已檢相容性
- [ ] 僅當 gcd(a, m) = 1 時套歐拉定理
- [ ] 歐拉函數 phi(m) 自質因數分解計算，非猜
- [ ] 反覆平方於每步皆模化簡（無溢位）
- [ ] 每解皆以代回原方程驗證

## 常見陷阱

- **未檢互質而套 CRT**：標準 CRT 公式需兩兩互質之模。對非互質模套之給出錯答而非錯誤。永遠先檢 gcd(mi, mj) = 1。

- **計算錯逆**：Mi^{-1} 須對 mi（*個別*模）而非對 M（積）計算。為單一最常見之 CRT 實作錯。

- **gcd(a, m) > 1 時套歐拉定理**：a^{phi(m)} = 1 (mod m) 需 gcd(a, m) = 1。若此不成立，定理不適用且結果為錯。

- **擴展歐幾里得回代之符號錯**：每步皆細追符號。最終逆可能為負；永遠對 m 化簡得正代表。

- **模指數之溢位**：即使用反覆平方，中間積亦可能溢位。永遠於每次乘後對 m 化簡，非僅於末端。

- **遺忘多解**：ax = b (mod m) 中 g = gcd(a, m) > 1 且 g | b 時，對 m 恰有 g 個不同餘解，非僅一。

## 相關技能

- `analyze-prime-numbers` — 質因數分解為計 phi(m) 與驗互質所需
- `explore-diophantine-equations` — 線性 Diophantine 方程 ax + by = c 等價於線性同餘 ax = c (mod b)
- `prove-geometric-theorem` — 模算術現於可構造性證明（如哪些正 n 邊形可構造）
