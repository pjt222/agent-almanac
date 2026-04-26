---
name: prove-geometric-theorem
locale: wenyan-ultra
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

# 證幾理

嚴證幾理：擇法、自設至論立邏鏈、處諸特況、產完證檔。

## 用

- 給幾述命證為真→用
- 驗幾形或關之猜→用
- 立大幾論中所需之引理→用
- 化幾直觀為嚴證→用
- 比同理之異證效→用

## 入

- **必**：理述（欲證之幾命）
- **必**：給資（設、定、給圖述）
- **可**：偏證法（直、反、座、向、變）
- **可**：嚴級（非式、半式、引公理之式）
- **可**：可不證引之知果（如「可假畢氏定理」）
- **可**：是否明處諸退與特況

## 行

### 一：精述理

重書理為標數式含明「給」與「證」句。

1. **出設**：列「給」中諸件。明幾型（點、線、段、射、圓、形）、附關（在上、過）、度件（合、等、垂、平）、序設。

2. **述論**：「證」中明書欲證者。分：
   - 等/合：AB = CD、角 A = 角 B、三角 ABC 合三角 DEF
   - 附：點 P 在線 L、三線共點
   - 不等：AB > CD、角 A < 90°
   - 存：存點 P 使...
   - 唯：此點唯一

3. **識隱設**：多幾題假歐幾何（平公設）、非退（點不重、線不共除非述）、正向。明之。

4. **畫或述構**：給圖則描其要。否則建：

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

得：精明述含給/證、諸隱設浮現、構之明述。

敗：理述模（如「中三角似原」）→重書含明定與量。命似假→具例試前行。假理不可證；尋並述反例。

### 二：擇證法

擇合理構之證術。

**諸法與用時**：

1. **直（合）證**：自設前推、用歐命與已立理。
   - 宜：合/似證、角追、附理
   - 具：三角合則 (SSS, SAS, ASA, AAS, HL)、平之性（內錯角、同位角）、圓理（內接角、切徑、點力）

2. **反證**：假論之反、導矛盾。
   - 宜：唯證、不可性果、不等證直法不明者
   - 構：「假反、為矛盾。則...[邏鏈]...然此矛於[知實]。故原論立。」

3. **座證**：置形於座系用代數。
   - 宜：中點/距/斜率關、共線、平、垂
   - 設：擇座以減算（如一頂於原、一邊沿軸）

4. **向證**：以向算表幾關。
   - 宜：心/重心性、平（平向）、垂（點積=0）、面比
   - 注：對擇原之位向、或為譯不變之自向

5. **變證**：施幾變（反、轉、譯、放）映形之分於他分。
   - 宜：對稱果、合由等距、似由放

評記擇：

```
Theorem: Midline theorem (DE || AB and DE = AB/2).
Method evaluation:
  - Direct: requires parallel line theory and similar triangles. Moderate.
  - Coordinate: place B at origin, C on x-axis. Short computation. Good.
  - Vector: express D, E as midpoints, compute DE vector. Elegant.
Selected method: Coordinate proof (for explicit computation).
Alternative: Vector proof (for elegance).
```

得：名證法含合此理由、可注他徑。

敗：首擇法步三後遇阻→換他。座證可機械決度題、為穩備。反擇而反不導用中述→試直。

### 三：建證含主步

建證為邏步序、各以公理、定或前立果為主。

**直/合證**：

組為含蘊鏈。各步必引主：

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

**座證**：

設座、算、釋：

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

**向證**：

用對擇原之位向：

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

**證構需**：

- 步皆編
- 各步括內引主
- 用「故」「是以」標邏結
- 避缺：步需中果則證或引

得：完證含每步邏自前步與引果、無不主聲。

敗：步不可主→恐假。試具例。數合而不見主→恐需中引理。述之、別證、續主證。全徑阻→返步二擇他法。

### 四：處特況與邊件

識處通論恐敗之構。

1. **退況**：察證於下列時否仍立：
   - 三角退為線（共線頂）
   - 圓退為點（半徑零）或線（半徑無窮）
   - 二點重
   - 角為 0 或 π（直角）
   - 形為非凸或自交

2. **邊況**：察極值：
   - 角依理之直角
   - 三角理之等腰或正之特化
   - 圓理之切對割構

3. **座證**、驗座配無失通：
   - 點於原排有效構乎？
   - 設邊沿軸迫特向乎？
   - 隱號設（b > 0）排有效況乎？

4. **各特況含解記**：

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

得：諸退或邊況識、各或證示不變施、或況由設排、或別論供。

敗：特況破證→理恐需加設（如「為非退三角」）。改步一理述含必件、或為特況供別證。

### 五：書全證含 QED

匯前諸步為末證檔。

1. **首**：理為給/證式
2. **證體**：步三之完主步鏈
3. **特況**：步四析或內入（簡）或於主證後為注
4. **止**：明標：
   - 「QED」
   - Halmos 碑（實或空方）
   - 「此完證」
5. **察證**邏全：
   - 諸步自前步或引果乎？
   - 諸設皆用乎？（設未用→理恐於弱件下立、或有缺）
   - 末步明達論乎？

格末證：

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

6. **可：述逆**或注通化

得：自含證檔、讀者（或驗主）可自設至論而無外引、明 QED 結。

敗：末察見缺→返步三填。證正而過長（>30 步）→以引理重構：抽可重中果為名引理別證、後於主證引之。

## 驗

- [ ] 理述為精給/證式含諸隱設明
- [ ] 證法名而有由
- [ ] 各證步編而引主
- [ ] 鏈中無不主聲或邏缺
- [ ] 諸設皆用至少一次（或注潛可除）
- [ ] 論明於末邏步述
- [ ] 退與邊況識而處
- [ ] 座證示座擇無失通
- [ ] 證以 QED 或等止標
- [ ] 證對至少一具數例試

## 忌

- **假所欲證（循推）**：最隱誤。如證二三角合、用其合之果為步。必各步溯至設或前立果、勿至論

- **無主圖設**：圖恐示二線交、點於三角內、角為銳。此視覺須證、勿假。圖示而非證

- **座置失通**：A 於原、B 於正 x 軸、C 於上半平排頂為順序之構。距/平證可不要、然向依果（號面、叉積向）要。必驗

- **忽退況**：圓內三角證恐於三角退為徑加圓上點時敗。必察點重、線平、形退時何為

- **引強於需之果**：用餘弦律證可由基角追之果、掩證之邏、引未必設（如餘弦函有定）。用最簡足具

- **逆陷**：「四邊為平行四邊則對角互平分」真、然其逆為別理需別證。求前向時勿證逆

- **況析不全**：證分況（如角 A 銳、直、鈍）→諸況皆處。證銳而稱「他況同」無驗可掩異

## 參

- `construct-geometric-figure` - 建與證互補：建示存、證立性
- `solve-trigonometric-problem` - 三角算常為幾證內子任
- `create-skill` - 包新證術為可重技時循
