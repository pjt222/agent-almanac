---
name: prove-geometric-theorem
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  以歐幾里得公理法、坐標幾何、或向量法以嚴謹逐步之邏輯結構證幾何定理。
  含直證、反證、坐標證、向量證、特殊情與退化構之處。
  得幾何聲欲證、驗猜想、立引理、化幾何直覺為嚴證、
  或比異證法之效時用之。
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

嚴證幾何定理：擇宜證法、自假至結建有據之邏輯鏈、處諸特例、生完證文。

## 用時

- 得幾何聲求證之為真
- 驗關於幾何形或關係之猜想
- 立大幾何論證所需之引理
- 化幾何直覺為嚴證
- 比同定理之異證法之效

## 入

- **必要**：定理聲（欲證之幾何主張）
- **必要**：所給訊（假、定義、所附圖述）
- **可選**：證法之偏（直、反、坐標、向量、變換）
- **可選**：嚴度（非形、半形、附公理引之形）
- **可選**：可不證引之既知（如「可假畢氏定理」）
- **可選**：是否顯處諸退化與特殊情

## 法

### 第一步：精述定理

以標準數學形重書定理，附顯之 Given 與 Prove 條。

1. **取假**：列「Given」條中諸條件。明幾何型（點、線、段、射、圓、多邊）、入關係（在於、過）、度量條件（同、等、垂、平）、序假。

2. **述結**：於「Prove」條書必證者。辨：
   - 等/同：AB = CD、角 A = 角 B、三角 ABC 與 DEF 同
   - 入：點 P 於線 L 上、三線共
   - 不等：AB > CD、角 A < 90 度
   - 存：存點 P 使...
   - 唯：此點為唯一

3. **識隱假**：多幾何問題假歐幾里得幾何（平行公設）、非退化（點不重、線不共除非言）、正向。明之。

4. **繪或述構**：若有圖，謄其要徵。否，立之：

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

得：精無歧之聲，附 Given 與 Prove 條，諸隱假皆顯，幾何構之清述。

敗則：若定理聲模糊（如「中三角與原相似」），以顯定義與量詞重書。若聲似偽，先以特例試。偽定理不能證；尋並述反例。

### 第二步：擇證法

擇宜定理結構之證術。

**諸法及用時**：

1. **直（綜）證**：用歐幾里得命題與既立定理自假向前行
   - 宜：同/相似證、追角、入定理
   - 具：三角同準（SSS、SAS、ASA、AAS、HL）、平行性質（內錯角、同位角）、圓定理（圓周角、切線-半徑、點冪）

2. **反證**：假結之否並導矛盾
   - 宜：唯之證、不可能之果、直法不明之不等證
   - 構：「為矛盾故假 [否]。則... [邏輯鏈]... 然此違 [既知]。故原結成」

3. **坐標證**：將形置於坐標系而用代數
   - 宜：中點/距/斜關係、共線、平行、垂直
   - 設：擇坐標以減算（如一頂於原點、一邊於軸）

4. **向量證**：以向量運表幾何關係
   - 宜：質心/重心性質、平行（平行向量）、垂直（點積 = 0）、面積比
   - 記：對所擇原點之位置向量，或自由向量為平移不變性質

5. **變換證**：施幾何變換（反射、轉、平移、縮）將形之部映至他部
   - 宜：對稱性果、由等距之同、由縮之相似

評並記擇：

```
Theorem: Midline theorem (DE || AB and DE = AB/2).
Method evaluation:
  - Direct: requires parallel line theory and similar triangles. Moderate.
  - Coordinate: place B at origin, C on x-axis. Short computation. Good.
  - Vector: express D, E as midpoints, compute DE vector. Elegant.
Selected method: Coordinate proof (for explicit computation).
Alternative: Vector proof (for elegance).
```

得：所名證法附其宜此定理之因，及備選法之注。

敗則：若初擇法於第三步遇阻，易為備。坐標證可機械決度量問題，故為穩之退路。若擇反證而否未致用之中聲，試直法。

### 第三步：建有據步驟之證

建證為邏輯步序，各據公理、定義、或既立果。

**直/綜證**：

組為蘊涵鏈。各步必引其據：

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

**坐標證**：

設坐標、算、釋：

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

**向量證**：

用對所擇原點之位置向量：

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

**證之結構所需**：

- 諸步皆編號
- 各步後括號內引據
- 用「故」或「因此」標邏輯結
- 避缺：若步需中果，證之或引之

得：完證，每步邏輯隨前步與引果，無無據之聲。

敗則：若步不能據，或為偽。以特例試。若數值合而不能尋據，或需中引理。述引理、別證之、後續主證。若全法卡，返第二步擇異法。

### 第四步：處特例與邊條

識並處通論或敗之構。

1. **退化情**：察證於下情是否成：
   - 三角退為線（共線頂）
   - 圓退為點（半徑零）或線（半徑無窮）
   - 二點重
   - 角為 0 或 π（直角）
   - 多邊變非凸或自交

2. **邊界情**：察極值：
   - 角依定理之直角
   - 三角定理之等腰或等邊特殊
   - 圓定理之切對割構

3. **坐標證**者，驗坐標分配未失通性：
   - 點置於原點是否排有效構？
   - 假邊於軸是否強特定向？
   - 有無隱號假（b > 0）排有效情？

4. **記諸特例**附其解：

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

得：諸退化或邊界情皆識，各或證適用不變、或證為假所排、或附別論。

敗則：若特例破證，定理或需加假（如「為非退化三角」）。修第一步定理聲含必條，或為特例供別證。

### 第五步：書完證附 QED

組終證文，合前諸步之諸元。

1. **首**：以 Given/Prove 形述定理
2. **證體**：呈第三步所建之完整有據步鏈
3. **特例**：含第四步之析，或內聯（若簡）或為主證後之注
4. **終**：以明標結：
   - 「QED」（quod erat demonstrandum）
   - Halmos 墓碑符（實或空方）
   - 「此完證」
5. **察證**之邏輯完整：
   - 諸步皆隨前步或引果乎？
   - 諸假皆用乎？（若假未用，定理或於弱條成，或有缺。）
   - 結是否於末步顯及？

格之終證：

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

6. **可選：述逆**或注通用化

得：自含證文，讀者（或驗之劑）可自假至結而無外引，終以顯 QED。

敗則：若終察時尋缺，返第三步補。若證正而過長（>30 步），考以引理重構：取可重用之中果為命名引理別證之，後於主證引之。

## 驗

- [ ] 定理以精 Given/Prove 形述，附諸隱假皆顯
- [ ] 證法已名並有據
- [ ] 諸證步皆編號並引其據
- [ ] 鏈中無無據之聲或邏輯缺
- [ ] 諸假皆至少用一（或注為可去）
- [ ] 結於末邏輯步顯述
- [ ] 退化與邊界情已識並處
- [ ] 坐標證示坐標擇未失通性
- [ ] 證以 QED 或等終標結
- [ ] 證已對至少一具體數例試

## 陷

- **假所欲證（環推）**：最隱之誤。例：證二三角同時，用該同之果為步。常溯各步至假或既立果，勿至結。

- **無據之圖假**：圖或示二線交、點於三角內、角銳。此視印須證、不假。圖喻；不為證。

- **坐標置之失通**：將三角 A 置原點、B 於正 x 軸、C 於上半面，排頂順時序之構。距/平行證或不關，然方向依果（號面積、叉積方向）或關。常驗。

- **忽退化情**：圓內接三角之證或於三角退為直徑加圓上一點時敗。常察點重、線平、形退時何為。

- **引強於需之果**：用餘弦定理證可由基本追角隨之果，蔽證之邏並或引不必假（如餘弦函數良定）。用最簡足之具。

- **漏逆陷阱**：「四邊為平行四邊則對角線互平分」真，然其逆為別定理需別證。請正向時勿證逆，反之亦然。

- **不全情析**：證分為情者（如角 A 銳、直、鈍），諸情皆當處。證銳情而聲「他情類同」而不驗或藏實差。

## 參

- `construct-geometric-figure` — 構與證互補：構示存，證立性
- `solve-trigonometric-problem` — 三角算常為幾何證之子任
- `create-skill` — 包新證術為可重用技能時循之
