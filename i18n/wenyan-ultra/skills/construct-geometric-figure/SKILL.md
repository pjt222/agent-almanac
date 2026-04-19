---
name: construct-geometric-figure
locale: wenyan-ultra
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

# 作幾何圖

以尺規作法加步釋之每作，從所予元生可構之幾何圖，驗其合原規。

## 用

- 予幾何元（點、段、角）而求作圖
- 行古典歐氏作（平分、垂、切）
- 驗圖可否以尺規作
- 生作導以教或文
- 化幾何規為有序原作序

## 入

- **必**：目圖述（如「以 AB 為邊之等邊三角」）
- **必**：所予元（起始之點、段、圓、角）
- **可**：輸格（敘、編步、偽碼、SVG 座標）
- **可**：釋詳（略、常、嚴含定理引）
- **可**：若不可構→含不可構析否

## 行

### 一：識所予元與目圖

析題取：

1. **所予元**——列諸點、段、角、圓、長。
2. **目圖**——明言所當作。
3. **約束**——注加條件（同、平、切、共線）。

以標式言題：

```
Given: Points A, B; segment AB; circle C1 centered at A with radius r.
Construct: Equilateral triangle ABC with AB as one side.
Constraints: C must lie on the same side of AB as point P (if specified).
```

驗諸所引元良定且一致。

**得：** 題淨重述，每所予元記，目圖明述。

**敗：** 題歧→列可能解且求明。所予元相悖（如三邊 1, 1, 5）→陳悖而止。

### 二：驗可構

定目圖可否只以尺規作。

1. **察代約。** 長可構若僅若在有理之連平方根擴體中。須立方根或超越→不可。

2. **已知不可構：**
   - 三分一般角
   - 倍立方（作 2 之立方根）
   - 化圓為方（作 sqrt(pi)）
   - n 非 2 冪與異 Fermat 質之積之正 n 邊形

3. **已知可構操作：**
   - 平分角或段
   - 作垂與平
   - 移長
   - n ∈ {3, 4, 5, 6, 8, 10, 12, 15, 16, 17, 20, ...} 之正 n 邊形
   - 以 +、-、*、/、sqrt 可表之長

4. **記裁決**加釋。

```
Constructibility analysis:
- Target: equilateral triangle on segment AB
- Required operations: circle-circle intersection (two arcs of radius AB)
- Algebraic degree: 2 (quadratic extension)
- Verdict: CONSTRUCTIBLE
```

**得：** 可構與否之明裁，附簡釋引相關代或古典果。

**敗：** 可構不確→試化題為已知可構原。已證不可→記不可證且建近似可構或他法（如 neusis、摺紙）。

### 三：謀作序

分目圖為原作操作序。

1. **識所需原。** 諸尺規作化為此原子操作：
   - 經兩點作線
   - 作圓（中+圓周點）
   - 標兩線之交
   - 標線圓之交
   - 標兩圓之交

2. **序之。** 每操作只引已在之點（予或先作）。建依賴圖：

```
Step 1: Draw circle C1 centered at A through B.       [uses: A, B]
Step 2: Draw circle C2 centered at B through A.       [uses: A, B]
Step 3: Mark intersections of C1 and C2 as P, Q.      [uses: C1, C2]
Step 4: Draw line through P and Q.                     [uses: P, Q]
```

3. **減步。** 尋合併或重用先作元之機。

4. **每步注**其幾何旨（如「此作 AB 之垂平分線」）。

**得：** 原操作有序列，每步依賴先立元，覆目圖諸部。

**敗：** 分解止→識目圖何部自現作點不可達。返步二確可構，或引輔作（助圓、中點、反射）橋溝。

### 四：行作步附釋

寫每作步全附歐氏釋。

每原操作記：

1. **操作**：所作所標。
2. **入**：所用現元。
3. **釋**：何歐氏命題、定理、性質保其果。
4. **出**：所建新元。

格一致：

```
Step 3: Mark intersections of C1 and C2 as P and Q.
  - Operation: Circle-circle intersection
  - Inputs: C1 (center A, radius AB), C2 (center B, radius BA)
  - Justification: Two circles with equal radii whose centers are separated
    by less than the sum of their radii intersect in exactly two points,
    symmetric about the line of centers (Euclid I.1).
  - Output: Points P and Q, where AP = BP = AB (equilateral property).
```

續至目圖全作。複圖→聚相關步為階（如「階一：作輔垂平分線」、「階二：定內心」）。

**得：** 依序行則生目圖之全有釋作步序。每新點、線、圓皆記。

**敗：** 步釋不能→步或無效。獨驗幾何宣。常誤：設兩圓交而實不（察中距與半徑和/差）、或設點在線而無證。

### 五：驗作合規

確所作圖合諸原求。

1. **察原約** 於所作圖：
   - 同：驗等長或等角
   - 平/垂：確以作法（如垂平分線保 90°）
   - 入：驗所需點在所需線或圓

2. **數自由度。** 所作圖當有規所隱之數參。多→規欠定。零而敗→規過定或悖。

3. **以具座標測**（選，複作宜）：

```
Verification with coordinates:
Let A = (0, 0), B = (1, 0).
C1: x^2 + y^2 = 1
C2: (x-1)^2 + y^2 = 1
Intersection: x = 1/2, y = sqrt(3)/2
Triangle ABC: sides AB = BC = CA = 1. VERIFIED.
```

4. **記驗果**明過/敗於每約。

**得：** 原規諸約皆驗，作確。座標測（若行）合幾何論。

**敗：** 約敗→溯作尋誤步。常因：交擇誤（圓線交分支誤）、座標驗號誤、或缺輔作。

## 驗

- [ ] 題以標 Given/Construct/Constraints 式重述
- [ ] 可構析存含明裁與釋
- [ ] 每作步只用先立元
- [ ] 每步含操作、入、釋、出
- [ ] 釋引相幾何原（Euclid、定理名、性質）
- [ ] 目圖全作（無缺部）
- [ ] 原諸約對完作皆驗
- [ ] 無步依量、近似、不可構操作
- [ ] 步數合圖複

## 忌

- **設交存**：兩圓交僅中距在 |r1 - r2| 與 r1 + r2 間。標交前必驗。忘察→紙上行而幾何敗。

- **交分支誤**：圓圓、線圓交皆二點。作須指用何（如「AB 同側於點 P 之交」）。交擇歧→生二有效而異圖。

- **混作與量**：尺規作不容量長或角。勿「量 AB 再標同長」。用圓規移徑：以新點為中，經舊端作圓。

- **略可構察**：試三分一般角或作正七邊形費力。先驗可構。

- **序過繁**：多作有簡解。標圖作逾 15 步→尋簡法。古典源（Euclid、Hartshorne）常供最簡作。

- **隱輔元**：忘記助作（如「延 AB 至 D」）→序不可循。每所用元皆須明作。

## 參

- `solve-trigonometric-problem` - 三角析常啟或驗作
- `prove-geometric-theorem` - 作常為幾何證步
- `create-skill` - 封新作為可重用技時依
