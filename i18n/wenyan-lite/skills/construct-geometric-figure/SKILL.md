---
name: construct-geometric-figure
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Perform a ruler-and-compass construction with step-by-step justification
  for each operation, producing a constructible geometric figure from given
  elements. Covers classical Euclidean constructions including perpendicular
  bisectors, angle bisectors, parallel lines, regular polygons, and
  tangent lines. Use when given geometric elements (points, segments, angles)
  and asked to produce a Euclidean construction, verify constructibility,
  or generate ordered construction steps for educational or documentation
  purposes.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: geometry
  complexity: intermediate
  language: multi
  tags: geometry, construction, ruler-compass, euclidean, straightedge
---

# 構幾何圖

為指定幾何圖作尺規之構，每步記其歐氏依據，並驗其果合原要求。

## 適用時機

- 予特定幾何元素（點、段、角）而求構圖
- 命行古典歐氏構（平分線、垂線、切線）
- 驗圖可否以尺規獨成
- 為教學或文件生構步
- 將幾何規轉為有序之原始作業

## 輸入

- **必要**：目標圖之描述（如「以 AB 為邊之等邊三角形」）
- **必要**：予之元素（所給之點、段、圓、角）
- **選擇性**：輸出格式（敘、編號步、偽碼、SVG 座標）
- **選擇性**：依據詳度（簡、標、引定理之嚴）
- **選擇性**：若不可構是否含不可能之分析

## 步驟

### 步驟一：辨予之元素與目標圖

解問題陳以抽：

1. **予之元素** -- 列每點、段、角、圓、長。
2. **目標圖** -- 精述當構何。
3. **約束** -- 記任何附加條件（全等、平行、切、共線）。

以標準形表問題：

```
Given: Points A, B; segment AB; circle C1 centered at A with radius r.
Construct: Equilateral triangle ABC with AB as one side.
Constraints: C must lie on the same side of AB as point P (if specified).
```

驗所引元素皆良定且一致。

**預期：** 構造問題之清晰無歧重述，附每予之元素已目及目標圖之精描。

**失敗時：** 若問題陳含歧，列可能解並求澄清。若予之元素矛盾（如邊長 1、1、5 之三角形），述矛盾並止。

### 步驟二：驗可構性

定目標圖可否以尺規獨構。

1. **查代數約束**。長可構若且唯若其於有理數之連續平方根所得之體擴展中。若構需立方根或超越作業，則不可能。

2. **已知不可能之構**：
   - 三等分一般角
   - 倍立方（構 2 之立方根）
   - 化圓為方（構 sqrt(pi)）
   - n 非 2 之冪與相異費馬素數之積時構正 n 邊形

3. **已知可構之作業**：
   - 平分任一角或段
   - 構垂線與平行線
   - 傳一予之長
   - 正 n 邊形，n ∈ {3, 4, 5, 6, 8, 10, 12, 15, 16, 17, 20, ...}
   - 可以 +、-、*、/、sqrt 於予之長表達之任何長

4. **記判決**附依據。

```
Constructibility analysis:
- Target: equilateral triangle on segment AB
- Required operations: circle-circle intersection (two arcs of radius AB)
- Algebraic degree: 2 (quadratic extension)
- Verdict: CONSTRUCTIBLE
```

**預期：** 關於可構性之定然 yes/no 判決，附引相關代數或古典結果之簡短依據。

**失敗時：** 若可構性不確，試將問題約為已知可構之原始作業。若圖可證不可構，記不可能性之證並建議最近之可構近似或替法（如 neusis 構造、摺紙）。

### 步驟三：規劃構造序

將目標圖分解為原始構造作業之序。

1. **辨所需原始作業**。每一尺規構造約為此原子作業：
   - 過二點畫一線
   - 予中心與半徑（中心＋圓周上一點）畫圓
   - 標二線之交
   - 標一線與一圓之交
   - 標二圓之交

2. **序作業**。每作業只能引已存之點（予之或先構之）。建依賴圖：

```
Step 1: Draw circle C1 centered at A through B.       [uses: A, B]
Step 2: Draw circle C2 centered at B through A.       [uses: A, B]
Step 3: Mark intersections of C1 and C2 as P, Q.      [uses: C1, C2]
Step 4: Draw line through P and Q.                     [uses: P, Q]
```

3. **減步數**。覓合作業或復用先構元素之機。

4. **註每步**以其幾何目的（如「此構 AB 之中垂線」）。

**預期：** 有序之原始作業列，每步只依先立之元素，涵目標圖所有部。

**失敗時：** 若分解停滯，辨圖之何部不能自當前已構點達。回步驟二確可構性，或引輔助構（助圓、中點、反射）以跨差。

### 步驟四：行構造步含依據

全書每構造步，供歐氏依據。

每原始作業記：

1. **作業**：何為畫或標。
2. **輸入**：用何既存元素。
3. **依據**：何歐氏命題、定理、或性質保作業生所稱之果。
4. **輸出**：生何新元素。

每步一致格式：

```
Step 3: Mark intersections of C1 and C2 as P and Q.
  - Operation: Circle-circle intersection
  - Inputs: C1 (center A, radius AB), C2 (center B, radius BA)
  - Justification: Two circles with equal radii whose centers are separated
    by less than the sum of their radii intersect in exactly two points,
    symmetric about the line of centers (Euclid I.1).
  - Output: Points P and Q, where AP = BP = AB (equilateral property).
```

續至目標圖全構。複雜圖將相關步群為階段（如「階段一：構輔助中垂線」、「階段二：定內心」）。

**預期：** 完整之依據構造步序，依序行時產生目標圖。每新點、線、圓皆有記。

**失敗時：** 若某步之依據不能供，或其無效。獨立驗幾何主張。常誤含：假二圓相交而實未相交（查中心距 vs 半徑之和/差）、假一點於一線上而無證。

### 步驟五：驗構造合規

確所構圖滿所有原要求。

1. **查每一約束**自步驟一對所構圖：
   - 全等：以構造驗等長或等角。
   - 平行/垂直：以構造法確（如中垂線保 90 度）。
   - 入射：驗所需點於所需線或圓上。

2. **計自由度**。所構圖應有規所含之自由參數數。若有餘之自由度，規則未確。若無而構敗，規則過確或矛盾。

3. **以具體座標測**（選而於複雜構造推薦）：

```
Verification with coordinates:
Let A = (0, 0), B = (1, 0).
C1: x^2 + y^2 = 1
C2: (x-1)^2 + y^2 = 1
Intersection: x = 1/2, y = sqrt(3)/2
Triangle ABC: sides AB = BC = CA = 1. VERIFIED.
```

4. **記驗證果**，每約束清 pass/fail。

**預期：** 原規之每約束皆驗，構造確正。座標查（若行）合幾何論據。

**失敗時：** 若約束敗，追溯構造覓誤步。常因：錯擇交（圓-線交之錯枝）、座標驗證之正負號誤、或缺輔助構造。

## 驗證

- [ ] 問題陳以標 Given/Construct/Constraints 形重述
- [ ] 可構性分析在含明判決與依據
- [ ] 每構造步僅用先立之元素
- [ ] 每步含作業、輸入、依據、輸出
- [ ] 依據引相關幾何原則（Euclid、定理名、或性質）
- [ ] 目標圖已全構（無缺件）
- [ ] 所有原約束已對完成之構造驗
- [ ] 無步依量測、近似、或不可構作業
- [ ] 步數合圖之複雜

## 常見陷阱

- **假交存**：二圓僅於中心距於 |r1 - r2| 與 r1 + r2 間相交。標交前總驗此條件。忘此查致紙上運而幾何上敗之構造。

- **錯交枝**：圓-圓與線-圓交生二點。構造須指用何（如「與點 P 同側於 AB 之交」）。歧之交擇生二有效而不同之圖。

- **混構造與量測**：尺規構造不允量長或角。不能「量段 AB 後標同長」。改用圓規以過新點過舊端點之圓傳半徑。

- **略可構性查**：試三等分一般角或構正七邊形耗力。構造序始前總驗可構性。

- **過繁之序**：多構造有雅短解。若標準圖之構超 15 原始步，覓簡法。經典源（Euclid、Hartshorne）常供最少之構。

- **隱輔助元素**：未記助構（如「延 AB 至點 D」）令序不可循。所用每元須明構。

## 相關技能

- `solve-trigonometric-problem` - 三角分析常激發或驗構造
- `prove-geometric-theorem` - 構造常於幾何證中作為步現
- `create-skill` - 包新構造為可復用技能時循
