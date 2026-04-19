---
name: construct-geometric-figure
locale: wenyan
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

# 建幾何形

以規矩作之附每作之證，自所與元生可建之幾何形。

## 用時

- 與特幾何元（點、段、角）而求建形
- 命建古典歐幾里得之作（分、垂、切）
- 驗形以規矩可建乎
- 為教或書生建之指
- 化幾何述為序原作

## 入

- **必**：目形之述（如「於 AB 邊之正三角」）
- **必**：所與元（起始之點、段、圓、角）
- **可選**：出式（敘、號步、偽碼、SVG 坐標）
- **可選**：證之詳（簡、常、嚴附定引）
- **可選**：若不可建是否含不可之析

## 法

### 第一步：識所與元與目形

析題以取：

1. **所與元** -- 列所供之諸點、段、角、圓、長。
2. **目形** -- 精述須建何。
3. **制** -- 注任加條（全等、平行、切、共線）。

以標式述題：

```
Given: Points A, B; segment AB; circle C1 centered at A with radius r.
Construct: Equilateral triangle ABC with AB as one side.
Constraints: C must lie on the same side of AB as point P (if specified).
```

驗諸引元善定且一。

**得：** 作題之清一之重述，每所與元已目錄而目形精述。

**敗則：** 若題含糊，列可解且求明。若所與元相悖（如邊為 1、1、5 之三角），述悖而止。

### 第二步：驗可建

定目形能以規矩而建乎。

1. **察代數制。** 長可建若唯若其於理之連平方域擴內。若作需立方或超越，不可。

2. **知不可之作：**
   - 三分通角
   - 倍立方（建 2 之立方根）
   - 化圓為方（建 sqrt(pi)）
   - 正 n 邊形 n 非 2 之冪與異 Fermat 素之積時

3. **知可建之作：**
   - 分任角任段
   - 建垂與平
   - 移所與長
   - n 於 {3, 4, 5, 6, 8, 10, 12, 15, 16, 17, 20, ...} 之正 n 邊
   - 以 +、-、*、/、sqrt 表達之任長

4. **書裁**附證。

```
Constructibility analysis:
- Target: equilateral triangle on segment AB
- Required operations: circle-circle intersection (two arcs of radius AB)
- Algebraic degree: 2 (quadratic extension)
- Verdict: CONSTRUCTIBLE
```

**得：** 可建與否之定裁，附簡證引相關代或古典之果。

**敗則：** 若可建不確，試化問於知之可建原。若形證不可建，書不可之證而議近可建之似或他法（如 neusis 作、摺紙）。

### 第三步：謀建序

分目形為原作之序。

1. **識所需原。** 每規矩作化為此諸原子：
   - 經二點畫線
   - 附中與半畫圓（中 + 周上點）
   - 標二線之交
   - 標線圓之交
   - 標二圓之交

2. **序諸作。** 每作必只引已存之點（所與或前建）。建依圖：

```
Step 1: Draw circle C1 centered at A through B.       [uses: A, B]
Step 2: Draw circle C2 centered at B through A.       [uses: A, B]
Step 3: Mark intersections of C1 and C2 as P, Q.      [uses: C1, C2]
Step 4: Draw line through P and Q.                     [uses: P, Q]
```

3. **最少步。** 尋合作或再用前建之機。

4. **注**每步之幾何用（如「此建 AB 之垂分」）。

**得：** 序原作之列，每步只依前立元而涵目形諸部。

**敗則：** 若分停，識當建點集中不可達之部。重察第二步確可建，或引助作（助圓、中點、反射）以橋。

### 第四步：行諸步附證

書每建步附歐式之證。

每原作書：

1. **作**：何畫或標。
2. **入**：用何存元。
3. **證**：何歐命、定、性保此作生所言果。
4. **出**：何新元生。

每步一式：

```
Step 3: Mark intersections of C1 and C2 as P and Q.
  - Operation: Circle-circle intersection
  - Inputs: C1 (center A, radius AB), C2 (center B, radius BA)
  - Justification: Two circles with equal radii whose centers are separated
    by less than the sum of their radii intersect in exactly two points,
    symmetric about the line of centers (Euclid I.1).
  - Output: Points P and Q, where AP = BP = AB (equilateral property).
```

續至目形全建。繁形則聚相關步為段（如「段一：建助垂分」、「段二：定內心」）。

**得：** 全證建序之步，依序行則生目形。每新點、線、圓皆清。

**敗則：** 若某步無證可供，此步或無效。獨驗幾何言。常誤含：假設二圓交而實不（察中距對半徑和/差），或假設點於線而無證。

### 第五步：驗建合述

確所建形滿諸原求。

1. **每制察**自第一步對建形：
   - 全等：以建驗等長等角
   - 平/垂：以建法確（如垂分保九十度）
   - 入：驗所需點於所需線圓

2. **計自由度。** 所建形宜有述所隱之參數。若多，述不全。若無而建敗，述過或悖。

3. **以特坐標試**（選而宜於繁作）：

```
Verification with coordinates:
Let A = (0, 0), B = (1, 0).
C1: x^2 + y^2 = 1
C2: (x-1)^2 + y^2 = 1
Intersection: x = 1/2, y = sqrt(3)/2
Triangle ABC: sides AB = BC = CA = 1. VERIFIED.
```

4. **書驗果**附每制之過/敗。

**得：** 諸原述之制皆驗，建確為正。坐標察（若行）合幾何言。

**敗則：** 若制敗，回追建以尋誤步。常因：交擇誤（線圓交之誤枝）、坐標驗之符誤、或缺助作。

## 驗

- [ ] 題以標 Given/Construct/Constraints 式重述
- [ ] 可建析存附清裁與證
- [ ] 每建步只用前立元
- [ ] 每步含作、入、證、出
- [ ] 證引相關幾何理（歐、定名、性）
- [ ] 目形全建（無缺部）
- [ ] 諸原制對已畢建驗
- [ ] 無步賴測、近、不可建之作
- [ ] 步數合形之繁

## 陷

- **假交存**：二圓唯於中距於 |r1 - r2| 與 r1 + r2 間相交。必於標交前驗此。忘察生紙上成幾何敗之作。

- **誤交枝**：圓圓與線圓之交生二點。建必述用何（如「於 AB 同側之交於 P」）。不明之擇生二有效而異之形。

- **混建與測**：規矩作不許測長角。不可「測段 AB 後標同長」。反之，以規轉半徑畫圓附新點經舊端。

- **略可建察**：試三分通角或建正七邊耗力。建序前必驗可建。

- **過繁之序**：多作有優雅短解。若建逾十五原步於標形，尋簡法。古典源（歐、Hartshorne）常供最少之作。

- **隱助元**：忘書助作（如「延 AB 至 D」）使序不可循。每用元必明建。

## 參

- `solve-trigonometric-problem` - 三角析常驅或驗建
- `prove-geometric-theorem` - 建常為幾何證之步
- `create-skill` - 包新建為可用技時循此
