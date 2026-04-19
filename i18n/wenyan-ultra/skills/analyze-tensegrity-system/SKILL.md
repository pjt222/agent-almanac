---
name: analyze-tensegrity-system
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Analyze a tensegrity system by identifying compression struts and tension
  cables, classifying type (class 1/2, biological/architectural), computing
  prestress equilibrium, verifying stability via Maxwell's rigidity criterion,
  and mapping biological tensegrity (microtubules, actin, intermediate
  filaments). Use when evaluating tensegrity in architecture, robotics,
  cell biology, or any system with isolated compression in continuous tension.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: tensegrity
  complexity: advanced
  language: natural
  tags: tensegrity, structural-integrity, prestress, biomechanics, cytoskeleton, force-balance
---

# 析張拉

析張拉系——孤壓元（柱）以續張網（索）穩。定力衡、預應衡、構穩、跨尺一致由分子骨架至建。

## 用

- 評構真張拉（壓張分）或常框→用
- 析建、機、伸構之張拉設穩→用
- 施 Ingber 細胞張拉模於骨架機（微管、肌動、中纖）→用
- 評既張拉之載與敗模→用
- 判生構（細胞、組、肌骨）可張拉模否→用
- 算張拉得剛之預應需（雖較常桁多機）→用

## 入

- **必**：系述（物構、生細胞、建模、機機）
- **必**：候壓張元識
- **可**：材性（楊氏模、截、各元長）
- **可**：外載與界條
- **可**：尺（分、細胞、組、建）
- **可**：知拓族（柱、八面、二十面、X 模）

## 行

### 一：定系

定每壓元（柱）與張元（索）、其連、界條以立全物述。

1. **壓錄**：列諸柱——抗壓剛元。錄各柱長、截、材、楊氏模。生系：識微管（中空筒，~25 nm 外徑，14 nm 內徑，E ~ 1.2 GPa，持久長 ~ 5 mm）。
2. **張錄**：列諸索——唯抗張、壓下鬆。錄靜長、截面、張剛。生系：肌動（螺，~7 nm 徑，E ~ 2.6 GPa，持久長 ~ 17 um），中纖（IF，~10 nm 徑，極伸、應變硬）。
3. **連拓**：文何柱接何索於何節。建關聯矩 C（行=元、列=節）。
4. **界條**：識固節、自節、外載。錄重向與量。
5. **尺定**：分（nm）、細胞（um）、建（m）、機（cm-m）。

```markdown
## System Characterization
| ID | Type  | Length   | Cross-section | Material       | Stiffness     |
|----|-------|----------|---------------|----------------|---------------|
| S1 | strut | [value]  | [value]       | [material]     | E = [value]   |
| C1 | cable | [value]  | [value]       | [material]     | EA = [value]  |
- **Nodes**: [count], [fixed vs. free]
- **Scale**: [molecular / cellular / architectural / robotic]
- **Boundary conditions**: [description]
```

得：諸壓張元之全錄附材性、關聯矩、足以設衡方之界條。

敗：元性未知（生系常）→用出版值：微管（E ~ 1.2 GPa，持久長 ~ 5 mm）、肌動（E ~ 2.6 GPa，持久長 ~ 17 um）、中纖（高非線、應變硬，初模 ~1 MPa 升至高應變 ~1 GPa）。連不清→簡至最簡拓捕本力路。

### 二：分張拉類

定系屬何張拉類及生或工。

1. **類定**：
   - **類 1**：柱不相觸——諸柱孤，唯經張網接。多 Fuller/Snelson 構為類 1
   - **類 2**：柱可於共節觸。多生系為類 2（微管共中體附點）
2. **拓識**：計 b = 總元（柱+索）、j = 節。識拓配知族否：張拉柱（3 柱、6 索三角反柱）、擴八面（6 柱、24 索）、二十面張拉（30 柱、90 索）、X 模（基 2D 單元）
3. **生對工**：生張拉特：壓元離散剛（微管），張網續（肌動皮+IF），預應主動生（肌動肌球以 ATP 水解收），系示機械轉導（力轉信）。文何特存。
4. **維**：分為 2D（平）或 3D。

```markdown
## Tensegrity Classification
- **Class**: [1 (isolated struts) / 2 (strut-strut contact)]
- **Dimension**: [2D / 3D]
- **Topology**: [prism / octahedron / icosahedron / X-module / irregular]
- **Category**: [biological / architectural / robotic / artistic]
- **b** (members): [value], **j** (nodes): [value]

### Biological Tensegrity Mapping (if applicable)
| Cell Component          | Tensegrity Role       | Key Properties                              |
|-------------------------|-----------------------|---------------------------------------------|
| Microtubules            | Compression struts    | 25 nm OD, E~1.2 GPa, dynamic instability    |
| Actin filaments         | Tension cables        | 7 nm, cortical network, actomyosin contract. |
| Intermediate filaments  | Deep tension/prestress| 10 nm, strain-stiffening, nucleus-to-membrane|
| Extracellular matrix    | External anchor       | Collagen/fibronectin, integrin attachment     |
| Focal adhesions         | Ground nodes          | Mechanosensitive, connect cytoskeleton to ECM |
| Nucleus                 | Internal compression  | Lamina network forms sub-tensegrity           |
```

得：明分（類、維、種）附生表完於生系。工系：拓族識。

敗：系不明合類 1 或 2→或混或常框。真張拉須至少有元唯張行（壓下鬆之索）。無唯張元→非張拉，重分為常桁或框施標構析。

### 三：析力衡與預應衡

各節算靜衡、定預應態（無外載之內張壓）、驗諸索仍張。

1. **建衡矩**：b 元 j 節 d 維，建衡矩 A（大 dj x b）。各列編元於兩端節之力貢方向餘弦。衡方 A * t = f_ext，t 為元力密向，f_ext 為外載向。
2. **解自應**：f_ext = 0，求 A 之零空。null(A) 之各基向為一自應態——內力滿衡而無外載。獨自應態數 s = b - rank(A)。
3. **驗索張**：任有效張拉自應，諸索須正力密（張）、諸柱須負（壓）。索壓之自應非物可實（索鬆）。
4. **算預應位**：實預應乃自應基向之線合擇至諸索張正。錄最小索張 t_min（任索鬆前裕）。
5. **載量**：加外載解 A * t = f_ext。首索張至零之載為臨載 F_crit。

```markdown
## Prestress Equilibrium
- **Equilibrium matrix A**: [dj] x [b] = [size]
- **Rank of A**: [value]
- **Self-stress states (s)**: s = b - rank(A) = [value]
- **Self-stress feasibility**: [all cables in tension? Yes/No]
- **Minimum cable tension**: t_min = [value]
- **Critical external load**: F_crit = [value]

| Member | Type  | Force Density | Force   | Status      |
|--------|-------|---------------|---------|-------------|
| S1     | strut | [negative]    | [value] | compression |
| C1     | cable | [positive]    | [value] | tension     |
```

得：自應態算、物可實預應（諸索張、諸柱壓）得、載量估。

敗：無自應態保諸索張→拓不支張拉預應。或（a）關聯矩誤、（b）系需加索、（c）為機非張拉。大系用力密法（Schek, 1974）或數零空算非手算。

### 四：以 Maxwell 準察穩

定張拉剛（對微擾穩）或機（有零能變模）。

1. **施擴 Maxwell 律**：d 維針節框，b 桿、j 節、k 運限（支）、s 自應態、m 微機：

   **b - dj + k + s = m**

   此關桿節限於自應與機態之衡。

2. **由衡矩算**：rank(A) = b - s。機數 m = dj - k - rank(A)。m = 0→構一階剛。m > 0→須察預應穩。
3. **預應穩測**：各機模 q，算二階能 E_2 = q^T * G * q，G 為幾剛矩（應力矩）。若諸機模 E_2 > 0，張拉為預應穩（Connelly 與 Whiteley，1996）。此即張拉得剛——非由桿數，乃由預應穩機。
4. **分剛**：
   - **運定**：m = 0、s = 0（張拉罕）
   - **靜不定且剛**：m = 0、s > 0
   - **預應穩**：m > 0，諸機由預應穩
   - **機**：m > 0、不穩（構可變）

```markdown
## Stability Analysis (Maxwell's Criterion)
- **Bars (b)**: [value]
- **Joints (j)**: [value]
- **Dimension (d)**: [2 or 3]
- **Kinematic constraints (k)**: [value]
- **Rank of A**: [value]
- **Self-stress states (s)**: [value]
- **Mechanisms (m)**: [value]
- **Maxwell check**: b - dj + k + s = m --> [values]
- **Prestress stability**: [stable / unstable / N/A]
- **Rigidity class**: [determinate / indeterminate / prestress-stable / mechanism]
```

得：Maxwell 計行、機定，m > 0 評預應穩。構分為剛、預應穩、或機。

敗：構為機（m > 0 且非預應穩）→選：（a）增索以增 b 減 m，（b）增預應，（c）改拓。生系主動肌動肌球收續調預應以維穩——細胞為自調張拉。

### 五：圖生張拉（跨尺析）

若系生釋，圖至 Ingber 細胞張拉模而察跨尺一致。純工系跳此。

1. **分尺（nm）**：識蛋纖為張拉元。微管（α/β-tubulin 二體、GTP 賴聚、動不穩附災變/復）。肌動（G-actin → F-actin 聚、踏輪）。中纖（型賴：vimentin、keratin、desmin、核 lamin）。
2. **細胞尺（um）**：圖全胞張拉。肌動皮=續張殼。微管自中體輻=壓柱抗皮。IF=次張路接核於焦點黏。肌動肌球收（肌球 II 馬達蛋）=主動預應源。
3. **組尺（mm-cm）**：細胞成更高張拉。各細胞為承壓元，由續 ECM 張網接（膠原、彈白）。胞胞接（cadherin）、胞 ECM 接（integrin）為節。
4. **跨尺一致**：驗一尺擾傳於他。ECM 外力經 integrin 傳骨架傳核——此機械轉導路為跨尺張拉之徵。

```markdown
## Cross-Scale Biological Tensegrity
| Scale      | Compression        | Tension              | Prestress Source      | Nodes              |
|------------|--------------------|----------------------|-----------------------|--------------------|
| Molecular  | Tubulin dimers     | Actin/IF subunits    | ATP/GTP hydrolysis    | Protein complexes  |
| Cellular   | Microtubules       | Actin cortex + IFs   | Actomyosin            | Focal adhesions    |
| Tissue     | Cells (turgor)     | ECM (collagen)       | Cell contractility    | Cell-ECM junctions |
| Organ      | Bones              | Muscles + fascia     | Muscle tone           | Joints             |

### Mechanotransduction Pathway
ECM --> integrin --> focal adhesion --> actin cortex --> IF --> nuclear lamina --> chromatin
```

得：各相關尺生張拉圖附壓、張、預應源、節識。跨尺力傳文。

敗：跨尺圖斷（無尺間明張續）→文缺。非諸生構諸尺皆張拉。脊於肌骨階為張拉（骨=柱、肌膜=索）而個椎內為常壓構。

### 六：合析評構整

合前析為系張拉整之末評。

1. **力衡要**：述預應衡達否、剛分、載量裕。
2. **脆析**：識關元——敗致最大整失之索（力密相對強最高）、屈致崩之柱（察 Euler 屈：P_cr = pi^2 * EI / L^2）。
3. **冗評**：可去幾索而 s 降至 0？幾而系為不穩機？
4. **設薦**（工系）：索預張位、柱大、改拓以增裕。
5. **生意**（生系）：關於病——微管穩減（colchicine/taxol）、IF 網斷（laminopathy）、預應變（癌胞機械以增收）。
6. **整評**：
   - **強**：s >= 2，諸索遠於鬆閾，關元敗不致崩
   - **邊**：s = 1 或預期載下最小索張近零
   - **脆**：s = 0，或關元敗致系崩

```markdown
## Structural Integrity Assessment
- **Prestress equilibrium**: [achieved / not achieved]
- **Rigidity**: [determinate / indeterminate / prestress-stable / mechanism]
- **Load capacity margin**: [value or qualitative]
- **Critical member**: [ID] -- failure causes [consequence]
- **Redundancy**: [cables removable before mechanism]
- **Integrity rating**: [ROBUST / MARGINAL / FRAGILE]

### Recommendations
1. [specific recommendation]
2. [specific recommendation]
3. [specific recommendation]
```

得：完構整評附剛分、脆識、冗析、整評（強/邊/脆）附可行薦。

敗：析不全（衡矩太大、生參未知）→評為條件：「邊待數驗」或「分待實量預應位」。明缺之部分評勝無評。

## 驗

- [ ] 諸壓元（柱）與張元（索）皆錄附性
- [ ] 連拓文（關聯矩或等）
- [ ] 張拉類（1 或 2）由柱觸定
- [ ] 衡矩建附 rank 算
- [ ] 至少一自應態諸索皆張
- [ ] Maxwell 擴律施：b - dj + k + s = m
- [ ] 微機（若有）皆察預應穩
- [ ] 剛分賦
- [ ] 生系跨尺圖完
- [ ] 構整評為強、邊、脆附由

## 忌

- **混張拉於常桁**：張拉須有唯張元（壓下鬆）。諸元皆可承張壓→常框非張拉。索單向致需預應穩之非線
- **穩析忽預應**：未應張拉恆為機——靜長索無剛。Maxwell 計常出 m > 0 示張拉不穩。預應穩察（步四）為要：預應乃張拉剛之由
- **視生張拉為靜**：細胞張拉由 ATP 賴肌球 II 馬達於肌動生收主動維。預應動非固。靜析捕構律但失主調。恆錄預應為被動（索預張）或主動（馬達生）
- **施 Maxwell 律忽索鬆**：Maxwell 律設諸元活。外載致索鬆減效 b，變穩算。各載例追何索仍緊
- **混 Snelson 雕於 Ingber 胞模**：Snelson 藝張拉用剛金柱與鋼索。Ingber 細胞張拉特黏彈元、主動調、壓元動不穩（微管災變）。構律同；材行本異
- **忽柱屈**：張拉析視柱為剛。細柱可屈（Euler：P_cr = pi^2 * EI / L^2）。壓力近屈載→剛柱設失，實載低於預

## 參

- `assess-form` —— 構錄與變備；assess-form 通評形，此技施張拉壓張分之具體框
- `adapt-architecture` —— 構變；張拉析識整賴張續否、告變中何元可安改
- `repair-damage` —— 復原；張拉中索敗與柱敗異果，關元析（步六）直告修序
- `center` —— 動推衡；張拉之穩經衡張（非剛壓）律乃中之構喻
- `integrate-gestalt` —— 形合中張和圖鏡壓張對；皆由對力產合而得一致
- `analyze-magnetic-levitation` —— 共析嚴紋之姊技（定、分、驗穩）；浮達無觸力衡，張拉達觸基力衡經張續
- `construct-geometric-figure` —— 張拉節位之幾構；幾形供初拓而後張拉析驗穩
