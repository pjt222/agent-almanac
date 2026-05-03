---
name: solve-trigonometric-problem
locale: wenyan-lite
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

# 解三角學問題

系統化解三角方程、三角形問題與恆等式驗證：分類問題、選擇合適策略、套用恆等式與定律、依定義域與值域限制驗證解。

## 適用時機

- 解三角方程求未知角或值
- 自部分資訊解三角形（SSS、SAS、ASA、AAS、SSA）
- 驗證或證明三角恆等式
- 將三角學套用於實際問題（測量、物理、工程）
- 化簡複雜三角表達式

## 輸入

- **必要**：問題敘述（方程、三角形資料、待驗恆等式或應用情境）
- **必要**：所求輸出形式（精確值、十進位近似、一般解、特定區間）
- **選擇性**：角度單位慣例（弧度或度；預設：弧度）
- **選擇性**：定義域限制（如 [0, 2*pi)、[0, 360)、所有實數）
- **選擇性**：數值答案所需精度（如四位小數）

## 步驟

### 步驟一：分類問題類型

判定問題屬何類別，因每類需不同策略。

1. **三角方程**：解含三角函式之方程中之未知角。
   - 子類型：對某一三角函式線性、對某一三角函式二次、多角、混合函式、含參。

2. **三角形求解**：給三角形之部分資訊，求所有剩餘邊與角。
   - 依所給資料之子類型：SSS、SAS、ASA、AAS、SSA（含混情況）。

3. **恆等式驗證**：證明三角方程於其定義域中所有值皆成立。
   - 子類型：代數操作、和化積、積化和、半角、倍角。

4. **應用問題**：自實際情境萃取三角模型。
   - 子類型：周期建模、仰角／俯角、方位／導航、簡諧運動。

記錄分類：

```
Problem: Solve 2*sin^2(x) - sin(x) - 1 = 0 for x in [0, 2*pi).
Classification: Trigonometric equation, quadratic in sin(x).
```

**預期：** 清晰之分類含已識別之子類型，直接決定步驟二之解題策略。

**失敗時：** 若問題不屬單一類別，可能為複合問題。將其拆為子問題、分類各部、依序解之。例如「給兩邊與夾角求三角形 ABC 之面積」結合三角形求解（SAS）與面積公式應用。

### 步驟二：選擇解題策略

依步驟一之分類擇法。

**對三角方程：**

| Equation Type | Strategy |
|---|---|
| Linear in sin(x) or cos(x) | Isolate the trig function, apply inverse |
| Quadratic in sin(x) or cos(x) | Substitute u = sin(x), solve quadratic, back-substitute |
| Multiple angle (sin(2x), cos(3x)) | Solve for the inner argument, then divide |
| Mixed functions (sin and cos) | Convert to single function using identities |
| Factorable | Factor and solve each factor = 0 |

**對三角形求解：**

| Given Data | Primary Tool |
|---|---|
| SSS | Law of cosines (find largest angle first) |
| SAS | Law of cosines (find opposite side), then law of sines |
| ASA | Angle sum = pi, then law of sines |
| AAS | Angle sum = pi, then law of sines |
| SSA | Law of sines (check ambiguous case: 0, 1, or 2 solutions) |

**對恆等式驗證：**

- 僅於一邊操作（通常為較複雜之邊）
- 將一切轉為 sin 與 cos
- 套基本恆等式：畢氏、倒數、商
- 依需套和差、倍角、半角公式
- 因式分解並化簡，直至兩邊相符

**對應用問題：**

- 繪圖並標註所有已知與未知量
- 識別三角關係（直角三角形、斜三角形、周期函式）
- 設方程並以上述合適方法解之

記錄所擇策略：

```
Strategy: Substitute u = sin(x), solve 2u^2 - u - 1 = 0,
back-substitute, and find x in [0, 2*pi).
```

**預期：** 與問題分類相符之具體、命名之策略，並識別關鍵公式或恆等式。

**失敗時：** 若無單一策略適用，試結合方法。對混 sin 與 cos 之方程，試：(a) 畢氏代入、(b) 半角正切代入 t = tan(x/2)、或 (c) 輔助角法（a*sin(x) + b*cos(x) = R*sin(x + phi)）。若於恆等式卡住，試自兩邊向共同中間表達式收斂。

### 步驟三：系統化套用恆等式與定律

逐步執行所擇策略。

**可取之關鍵恆等式族：**

1. **畢氏**：sin^2(x) + cos^2(x) = 1、1 + tan^2(x) = sec^2(x)、1 + cot^2(x) = csc^2(x)

2. **倍角**：sin(2x) = 2*sin(x)*cos(x)、cos(2x) = cos^2(x) - sin^2(x) = 2*cos^2(x) - 1 = 1 - 2*sin^2(x)

3. **和差**：sin(A +/- B) = sin(A)*cos(B) +/- cos(A)*sin(B)、cos(A +/- B) = cos(A)*cos(B) -/+ sin(A)*sin(B)

4. **正弦定律**：a/sin(A) = b/sin(B) = c/sin(C) = 2R

5. **餘弦定律**：c^2 = a^2 + b^2 - 2*a*b*cos(C)

6. **半角**：sin(x/2) = +/-sqrt((1 - cos(x))/2)、cos(x/2) = +/-sqrt((1 + cos(x))/2)

明示每一代數步驟：

```
2*sin^2(x) - sin(x) - 1 = 0
Let u = sin(x):
  2u^2 - u - 1 = 0
  (2u + 1)(u - 1) = 0
  u = -1/2  or  u = 1
Back-substitute:
  sin(x) = -1/2  or  sin(x) = 1
```

對三角形求解，計算中間值並保留充足精度：

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

**預期：** 自原方程或資料至中間結果之完整代數步驟鏈，每恆等式套用皆已標註。

**失敗時：** 若某恆等式套用使表達式更繁而非更簡，重思策略。常見補救動作：(a) 對複雜恆等式證明試以歐拉公式轉指數形式、(b) 兩邊乘共軛、(c) 用代入降次。若數值計算產生意外值，以獨立計算路徑驗證。

### 步驟四：解並檢查定義域／值域限制

萃取所有解並依問題之定義域過濾。

1. **求參考角。** 對三角函式之每值，以反函式求參考角：

```
sin(x) = -1/2  =>  reference angle = pi/6
sin(x) = 1     =>  reference angle = pi/2
```

2. **列舉基本周期內所有解。** 用符號與象限規則：

```
sin(x) = -1/2:
  x is in Q3 or Q4 (sin negative)
  x = pi + pi/6 = 7*pi/6
  x = 2*pi - pi/6 = 11*pi/6

sin(x) = 1:
  x = pi/2
```

3. **套用定義域限制。** 僅留指定區間內之解：

```
Domain: [0, 2*pi)
Solutions: x = pi/2, 7*pi/6, 11*pi/6
```

4. **寫一般解**（如請求）：

```
General solution:
  x = pi/2 + 2*k*pi,  k in Z
  x = 7*pi/6 + 2*k*pi,  k in Z
  x = 11*pi/6 + 2*k*pi,  k in Z
```

5. **檢查值域限制。** 對反函式問題，驗輸出於主值範圍。對三角形問題，驗所有角為正且和為 pi（或 180 度），所有邊為正。

6. **處理含混情況（SSA）。** 用 SSA 資料行正弦定律時：
   - 若 sin(B) > 1：無解。
   - 若 sin(B) = 1：一解（直角）。
   - 若 sin(B) < 1 且所給角為銳角：兩可能解（檢兩者是否皆得有效三角形）。
   - 若所給角為鈍角或直角：至多一解。

**預期：** 完整、明示列舉之解集，尊重所有定義域與值域限制，含混情況如適用已處理。

**失敗時：** 若指定定義域內無解，驗方程設定是否正確。若解過多，檢是否引入了外加解（如兩邊平方）。永遠將每候選解代回原方程。

### 步驟五：以數值驗證解

以代入原方程或獨立計算確認每解。

1. **將每解代入**原方程並驗等：

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

2. **對三角形問題**，以獨立定律驗證：

```
Verify triangle: a=7, b=10, c=6.220, A=43.78, B=98.22, C=38
Check law of sines: a/sin(A) = 7/sin(43.78) = 7/0.6913 = 10.126
                    b/sin(B) = 10/sin(98.22) = 10/0.9897 = 10.104
                    c/sin(C) = 6.220/sin(38) = 6.220/0.6157 = 10.102
Ratios approximately equal (within rounding). VERIFIED.
Check angle sum: 43.78 + 98.22 + 38 = 180. VERIFIED.
```

3. **對恆等式證明**，以特定數值驗證：

```
Verify identity: sin(2x) = 2*sin(x)*cos(x)
Let x = pi/3:
  LHS: sin(2*pi/3) = sin(120) = sqrt(3)/2
  RHS: 2*sin(pi/3)*cos(pi/3) = 2*(sqrt(3)/2)*(1/2) = sqrt(3)/2
  LHS = RHS. VERIFIED.
```

4. **以所請格式記錄最終答案**：

```
Solution: x in {pi/2, 7*pi/6, 11*pi/6} for x in [0, 2*pi).
```

**預期：** 每解皆通過代入驗證。三角形解滿足正弦與餘弦兩定律。恆等式證明以至少一數值測試確認。

**失敗時：** 若某解未通過驗證，為外加解。自解集中除之，並重審其引入之步驟。外加解之常見來源：兩邊平方（引入符號歧義）、乘可能為零之表達式，或對參考角擇錯象限。

## 驗證

- [ ] 問題已分類為具體類型與子類型
- [ ] 解題策略明示命名且與問題類型相符
- [ ] 每恆等式或定律套用皆標註其名
- [ ] 所有代數步驟皆已展示（邏輯無跳躍）
- [ ] 已明示套用定義域與值域限制
- [ ] SSA 三角形問題已處理含混情況
- [ ] 每解皆以代入原方程驗證
- [ ] 三角形解以獨立定律交叉檢核
- [ ] 最終答案以所請格式陳述（精確、十進位、一般、特定區間）
- [ ] 角度單位全程一致（無弧度與度混用）

## 常見陷阱

- **以三角函式相除而失解**：兩邊同除 sin(x) 將捨棄所有 sin(x) = 0 之解。永遠改為因式分解：寫 sin(x) * f(x) = 0 並分別解每因式。

- **平方致外加解**：兩邊平方 sin(x) = cos(x) 得 sin^2(x) = cos^2(x)，解數加倍。永遠以原（未平方）方程驗候選。

- **忽略含混情況（SSA）**：以兩邊與一非夾角解三角形時，正弦定律可產 0、1 或 2 個有效三角形。漏檢第二解則漏有效答。

- **混用角度單位**：計算機或語言處於弧度模式時用 sin(30) 給出 sin(30 弧度)，非 sin(30 度)。一開始即陳述單位慣例並全程貫徹。

- **參考角象限錯**：sin(x) = -1/2 給出 x 於 Q3 與 Q4，非 Q1 與 Q2。永遠先檢三角函式之符號相對於象限再置角。

- **遺忘周期性**：實線上之三角方程有無窮多解。若問題求一般解，含「+ 2*k*pi」（正切則「+ k*pi」）項。若求 [0, 2*pi) 之解，列舉該區間內所有解。

## 相關技能

- `construct-geometric-figure` — 構造常需三角分析以定角與長
- `prove-geometric-theorem` — 三角恆等式常於幾何證明中作為引理
- `create-skill` — 將新三角方法包為可重用技能時依之
