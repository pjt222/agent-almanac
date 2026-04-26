---
name: prove-geometric-theorem
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Prove geometric theorems using Euclidean axiomatic methods, coordinate
  geometry, or vector methods with rigorous step-by-step logical structure.
  Covers direct proof, proof by contradiction, coordinate proofs, vector
  proofs, and handling of special cases and degenerate configurations.
  Use when given a geometric statement to prove, verifying a conjecture,
  establishing a lemma, converting geometric intuition into a rigorous proof,
  or comparing the effectiveness of different proof methods.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: geometry
  complexity: advanced
  language: multi
  tags: geometry, proof, theorem, euclidean, axiomatic, coordinate
---

# 證幾何定理

擇適切之證法，自前提至結論建嚴謹之邏輯鏈、處理一切特例，並產出完整之證明文件，以嚴證一幾何定理。

## 適用時機

- 給定一幾何陳述，求證其為真
- 驗證關於幾何圖形或關係之猜想
- 為較大幾何論證所需之引理
- 將幾何直觀轉為嚴謹之證明
- 對同一定理比較不同證法之效用

## 輸入

- **必要**：定理陳述（待證之幾何主張）
- **必要**：給定資訊（前提、定義與所提供之圖形描述）
- **選擇性**：偏好之證法（直接、反證、座標、向量、變換）
- **選擇性**：嚴謹度（非形式、半形式、附公理引用之形式）
- **選擇性**：可不證即引用之既有結果（如「可假設畢氏定理」）
- **選擇性**：是否須明示處理所有退化與特例

## 步驟

### 步驟一：精確陳述定理

以標準數學形式重寫，明示「給定」與「求證」兩節。

1. **抽取前提**。於「給定」節中列每一條件。明示幾何類型（點、線、線段、射線、圓、多邊形）、關聯關係（位於、通過）、度量條件（全等、相等、垂直、平行）與秩序假設。

2. **陳述結論**。於「求證」節中精確寫出待證者。區別：
   - 相等／全等：AB = CD、角 A = 角 B、三角形 ABC 全等於三角形 DEF
   - 關聯：點 P 位於線 L 上、三線共點
   - 不等：AB > CD、角 A < 90 度
   - 存在：存在點 P 使得……
   - 唯一：該點唯一

3. **辨明隱含假設**。多數幾何題假設歐式幾何（平行公設）、非退化（點不重合、線不共點除非言明）與正向定向。將之明示。

4. **繪或述配置**。若有圖，謄其關鍵特徵；無，則自構：

```
Given: Triangle ABC with D the midpoint of BC, E the midpoint of AC.
       Line segment DE.
Prove: DE is parallel to AB and DE = AB/2.

Configuration:
  A is at the apex; B and C form the base.
  D is the midpoint of BC; E is the midpoint of AC.
  DE connects the two midpoints.

Implicit assumptions: Euclidean plane, A is not on line BC (non-degenerate triangle).
```

**預期：** 一份精確、無歧之陳述，含「給定」與「求證」二節，所有隱含假設皆已浮現，配置描述清晰。

**失敗時：** 若定理陳述含糊（如「中點三角形與原三角形相似」），以明示之定義與量詞重寫。若陳述似為偽，先以具體例測試再進。偽定理無從證；當尋反例並陳述之。

### 步驟二：擇證法

擇最適合定理結構之證法。

**可用之法與適用時機**：

1. **直接（綜合）證明**：自前提向前推，用歐式命題與既證定理。
   - 適：全等／相似之證、追角、關聯定理。
   - 工具：三角形全等準則（SSS、SAS、ASA、AAS、HL）、平行性質（內錯角、同位角）、圓定理（圓周角、切徑、點之冪）。

2. **反證**：假設結論之否定，導出矛盾。
   - 適：唯一性、不可能性、直接路線不明之不等式。
   - 結構：「設反證，假定 [否定]。則…… [邏輯鏈]……，與 [既知事實] 矛盾。故原結論成立。」

3. **座標證明**：將圖置於座標系，以代數操作。
   - 適：中點／距離／斜率關係、共線、平行、垂直。
   - 設置：擇座標以最少計算（如將一頂點置於原點、一邊置於某軸）。

4. **向量證明**：以向量運算表幾何關係。
   - 適：質心／重心性質、平行（平行向量）、垂直（內積為 0）、面積比。
   - 標記：相對所擇原點之位置向量，或對平移不變者用自由向量。

5. **變換證明**：施一幾何變換（反射、旋轉、平移、放縮）將圖之一部映至另一部。
   - 適：對稱性、經等距之全等、經放縮之相似。

評估並記錄擇定：

```
Theorem: Midline theorem (DE || AB and DE = AB/2).
Method evaluation:
  - Direct: requires parallel line theory and similar triangles. Moderate.
  - Coordinate: place B at origin, C on x-axis. Short computation. Good.
  - Vector: express D, E as midpoints, compute DE vector. Elegant.
Selected method: Coordinate proof (for explicit computation).
Alternative: Vector proof (for elegance).
```

**預期：** 一具名之證法，附其適合本定理之理由，並可選地記替代路線。

**失敗時：** 若初擇之法於步驟三遇阻，改用替代。座標證能機械式地解決度量問題，可作可靠後援。若擇反證但其否定未導向有用之中介，改試直接。

### 步驟三：以正當之步驟構造證明

將證明建為邏輯步驟之序列，每步皆以公理、定義或既證結果為據。

**直接／綜合證明**：

組為蘊含鏈。每步須引用其依據：

```
Proof:
1. Let M be the midpoint of AB.                    [Given]
2. Then AM = MB = AB/2.                            [Definition of midpoint]
3. In triangle ABC, since CM is a median,
   CM connects vertex C to midpoint M of AB.       [Definition of median]
4. Triangles ACM and BCM share side CM.            [Common side]
5. AM = MB.                                         [Step 2]
6. AC may or may not equal BC.                      [No assumption of isosceles]
...
```

**座標證明**：

設座標、計算、詮釋：

```
Proof (coordinate):
1. Place B at the origin (0, 0) and C at (2c, 0).  [Choice of coordinates]
2. Let A = (2a, 2b) for some a, b with b != 0.     [Non-degeneracy; factor of 2
                                                      simplifies midpoint computation]
3. D = midpoint of BC = ((0 + 2c)/2, 0) = (c, 0).  [Midpoint formula]
4. E = midpoint of AC = ((2a + 2c)/2, (2b + 0)/2)
     = (a + c, b).                                   [Midpoint formula]
5. Vector DE = E - D = (a + c - c, b - 0) = (a, b). [Vector subtraction]
6. Vector AB = B - A = (0 - 2a, 0 - 2b) = (-2a, -2b).
   So vector BA = (2a, 2b) = 2 * (a, b) = 2 * DE.  [Vector subtraction]
7. Since BA = 2 * DE, vectors DE and BA are parallel
   (scalar multiple) and |DE| = |BA|/2.             [Parallel vectors; magnitude]
8. Therefore DE || AB and DE = AB/2.                 [QED]
```

**向量證明**：

以相對所擇原點之位置向量：

```
Proof (vector):
Let position vectors of A, B, C be a, b, c respectively.
1. D = (b + c)/2.                                   [Midpoint of BC]
2. E = (a + c)/2.                                   [Midpoint of AC]
3. DE = E - D = (a + c)/2 - (b + c)/2 = (a - b)/2. [Vector subtraction]
4. AB = B - A = b - a.                               [Vector subtraction]
5. DE = -(1/2)(b - a) = (1/2)(a - b).
   So DE = -(1/2) * AB, meaning DE = (1/2) AB
   in magnitude with opposite direction
   (equivalently, DE || AB).                         [Scalar multiple => parallel]
6. |DE| = (1/2)|AB|, i.e., DE = AB/2.               [Magnitude of scalar multiple]
QED.
```

**證明結構要求**：

- 每步編號。
- 每步後以方括號引用依據。
- 以「故」或「因此」標出邏輯結論。
- 勿留缺口：若某步須中介結果，或證之或引之。

**預期：** 一份完整證明，每步皆順承前步與所引結果，無無據主張。

**失敗時：** 若某步無從引據，可能為偽。以具體例測之。若數值上成立而無從引據，可能須一中介引理。陳述之、單獨證之、再續主證。若整路阻塞，回步驟二改擇他法。

### 步驟四：處理特例與邊界條件

辨明並處理通用論證可能失效之配置。

1. **退化情況**。檢驗證明於下列情況是否仍成立：
   - 三角形退化為線（頂點共線）
   - 圓退化為點（半徑零）或線（半徑無窮）
   - 兩點重合
   - 角為 0 或 π（平角）
   - 多邊形變為非凸或自交

2. **邊界情況**。檢極值：
   - 角依賴定理中之直角
   - 三角形定理中之等腰或等邊特化
   - 圓定理中切線對割線之配置

3. **座標證明**：驗座標指派未失普遍性：
   - 將某點置於原點是否排除某些有效配置？
   - 假設一邊置於某軸是否強加特殊定向？
   - 是否有隱含之符號假設（b > 0）排除有效情況？

4. **記錄每一特例**及其處置：

```
Special cases:
- If A lies on BC (degenerate triangle): D = E = midpoint of BC,
  and DE has length 0 while AB/2 > 0 in general. But the theorem
  assumes a non-degenerate triangle (b != 0 in our coordinates), so
  this case is excluded by hypothesis.
- If triangle is isosceles with AB = AC: the proof applies without
  modification (no special property of isosceles triangles was excluded).
- Coordinate generality: A = (2a, 2b) with b != 0 covers all non-degenerate
  triangles up to rotation and reflection, which preserves parallelism and
  length ratios. No generality lost.
```

**預期：** 每一退化或邊界情況皆已辨明；對之或證明仍適用，或證明該情況被前提排除，或另論。

**失敗時：** 若某特例破壞證明，定理可能需添前提（如「對非退化三角形」）。回步驟一修陳述，或為該特例另證。

### 步驟五：以 QED 收筆寫完整證明

整合前諸步驟為終本證明文件。

1. **標頭**：以「給定／求證」形式陳述定理。

2. **證明本體**：呈現自步驟三之完整正當步驟鏈。

3. **特例**：將步驟四之分析或併入（若簡），或於主證後附作備註。

4. **收筆**：以明確標誌結束：
   - 「QED」（quod erat demonstrandum）
   - Halmos 墓碑符（實心或空心方塊）
   - 「證畢。」

5. **複審證明**之邏輯完整性：
   - 每步是否順承前步或所引結果？
   - 所有前提是否皆被用？（若某前提未用，定理可能於更弱條件下亦成立，或有缺口。）
   - 結論是否於最末步明示達成？

格式化終本：

```
THEOREM (Midline Theorem):
Given: Triangle ABC; D is the midpoint of BC; E is the midpoint of AC.
Prove: DE || AB and DE = AB/2.

PROOF:
Place B = (0, 0), C = (2c, 0), A = (2a, 2b) with b != 0
(ensuring non-degeneracy).

(1) D = midpoint(B, C) = (c, 0).                 [Midpoint formula]
(2) E = midpoint(A, C) = (a + c, b).             [Midpoint formula]
(3) Vector DE = (a, b).                           [Subtraction: (2) - (1)]
(4) Vector BA = (2a, 2b) = 2 * DE.               [Subtraction: A - B]
(5) Since BA = 2 * DE, the vectors are parallel,
    so DE || AB.                                  [Parallel criterion]
(6) |DE| = sqrt(a^2 + b^2);
    |AB| = sqrt(4a^2 + 4b^2) = 2*sqrt(a^2 + b^2)
         = 2|DE|.
    Therefore DE = AB/2.                          [Magnitude computation]

QED.
```

6. **可選**：陳述逆定理或述其推廣。

**預期：** 一份自含之證明文件，讀者（或驗證代理）可自前提循至結論而不需外部參照，以明示之 QED 結尾。

**失敗時：** 若終審發現缺口，回步驟三補之。若證明正確但過長（>30 步），考慮以引理重組：將可重用之中介結果抽為具名引理，單獨證之，再於主證引用。

## 驗證

- [ ] 定理以精確之「給定／求證」形式陳述，所有隱含假設皆明示
- [ ] 證法已具名並附理由
- [ ] 每步皆編號並引依據
- [ ] 鏈中無無據主張或邏輯缺口
- [ ] 所有前提至少各被用一次（或註可移除）
- [ ] 結論於末步明示
- [ ] 退化與邊界情況皆已辨明並處理
- [ ] 座標證明已示其座標選擇未失普遍性
- [ ] 證明以 QED 或同等收筆結束
- [ ] 證明已對至少一具體數值例測試

## 常見陷阱

- **假設待證者（循環論證）**：最陰險之錯。例如，證兩三角形全等時，將該全等之推論用為一步。永將每步追溯至前提或既證結果，勿至結論。

- **無據之圖形假設**：圖可暗示二線相交、某點位於三角形內、某角為銳。此等視覺印象須證，不可假設。圖示明而不立證。

- **座標放置失普遍性**：將三角形以 A 置原點、B 置正 x 軸、C 置上半平面，將排除頂點順時針排序之配置。對距離／平行之證或無妨，但對與定向相依者（帶號面積、外積方向）可有妨。永驗。

- **忽略退化**：關於圓內接三角形之證可能於三角形退化為直徑加圓上一點時失效。永檢點重合、線變平行、圖退化時之情況。

- **引用過強之結果**：用餘弦定理證可由基本追角即得之結果，將模糊證明邏輯，並可能引入不必要假設（如餘弦函數為良定）。用最簡足之器。

- **逆定理之陷**：「四邊形為平行四邊形則對角線互相平分」為真，惟其逆為另一定理，須另證。當主求正向時勿證逆向，反之亦然。

- **分情不全**：證分情（如角 A 為銳、直、鈍）須述全。證銳例而稱「他例同理」而未驗，恐隱真實之異。

## 相關技能

- `construct-geometric-figure` —— 構造與證明互補：構造示存在，證立性質
- `solve-trigonometric-problem` —— 三角計算常於幾何證明中為子任務
- `create-skill` —— 將新證法封裝為可重用之技能時依之
