---
name: analyze-tensegrity-system
locale: wenyan
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

# 析張拉整體

析張拉整體（tensegrity）系——獨立壓桿於連續拉索網穩之結構。定系之力衡、預應力平衡、結構穩、自分子骨架至建築之跨尺度一致。

## 用時

- 評結構真為張拉整體（壓拉分離）乎或為常規框乃用
- 析建築、機器人、可展結構之張拉整體設之穩乃用
- 施 Donald Ingber 細胞張拉整體模於骨架力學（微管、肌動、中間纖維）乃用
- 估既有張拉整體系之載量與敗式乃用
- 定生物結構（細胞、組織、肌骨系）可模為張拉整體乎乃用
- 算張拉整體達剛之預應力求乃用

## 入

- **必要**：系之述（物理、生物細胞、建築模、機構）
- **必要**：候壓元與拉元之識
- **可選**：材屬（楊氏模、截面、每元之長）
- **可選**：外載與邊條
- **可選**：關注之尺度（分子、細胞、組織、建築）
- **可選**：已知拓族（稜鏡、八面體、二十面體、X 模）

## 法

### 第一步：描系

立全物理述以識諸壓元（桿）與拉元（索）、其連、與邊條。

1. **壓錄**：列諸桿——抵壓之剛元。錄每桿長、截面、材、楊氏模。生物系中，識微管（中空柱，外徑 ~25 nm、內徑 14 nm、E ~ 1.2 GPa、持續長 ~ 5 mm）。
2. **拉錄**：列諸索——只抵拉，壓則鬆。錄止長、截面積、拉剛。生物系：肌動絲（螺，徑 ~ 7 nm、E ~ 2.6 GPa、持續長 ~ 17 um）、中間纖維（IF，徑 ~ 10 nm、延展、應變增剛）。
3. **連拓**：書何桿於何節連何索。建入射矩 C（行 = 元、列 = 節）編拓。
4. **邊條**：識固節（接地）、自由節、外載。記重力向與幅。
5. **尺度識**：分子（nm）、細胞（um）、建築（m）、機器人（cm-m）。

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

**得：** 諸壓拉元之全錄附材屬、入射矩、邊條，足以立平衡方程。

**敗則：** 若元屬未知（生物系常），用公值：微管（E ~ 1.2 GPa、持續長 ~ 5 mm）、肌動（E ~ 2.6 GPa、持續長 ~ 17 um）、中間纖維（高非線，應變增剛，初模 ~1 MPa 升至高應變 ~1 GPa）。若連不明，減至捕本力路之最簡拓。

### 第二步：分張拉整體類

定系屬何類，生物乎架構乎。

1. **類定**：
   - **一類**：諸桿不相觸——皆獨立，僅經拉網相連。Fuller/Snelson 諸作多屬一類。
   - **二類**：桿可於共節觸。諸生物系屬二類（微管共中心體掛點）。
2. **拓識**：計 b = 總元（桿+索），j = 節。察拓合已知族：張拉稜鏡（三桿六索三角反稜）、擴八面體（六桿廿四索）、二十面體張拉（三十桿九十索）、X 模（2D 基單元）。
3. **生物乎架構乎**：生物張拉整體有特：壓元離散而剛（微管）、拉網連續（肌動皮質+IF）、預應力主動生（肌動球蛋白縮力經 ATP 水解）、系示機械傳導（力轉訊）。書何特存。
4. **維**：二維（平面）或三維。

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

**得：** 清分類（類、維、族）附生物系之映表全。架構系則拓族已識。

**敗則：** 若系不明合一類或二類，或為混或常框。真張拉整體要至少某元只拉（壓則鬆）。若無只拉元，非張拉整體——重分為常桁或框而施標結構析。

### 第三步：析力衡與預應力平衡

於每節算靜平衡、定預應力狀（無外載之內拉壓）、驗諸索仍拉。

1. **建平衡矩**：b 元 j 節於 d 維，建 A（大小 dj x b）。每列編元於二端節力貢之向余弦。平衡方程 A * t = f_ext，t 為元力密度向量（力/長），f_ext 為外載。
2. **解自應力**：f_ext = 0 則尋 null(A)。null(A) 之每基向量乃一自應力態——無外載而滿平衡之內力。獨立自應力態數 s = b - rank(A)。
3. **驗索拉**：任有效張拉整體自應力中，諸索力密度必正（拉），諸桿必負（壓）。致索壓之自應力不可實現（索則鬆）。
4. **算預應力**：實預應力乃自應力基向量之線組合，擇使諸索拉皆正。記最小索拉 t_min（索鬆前之裕）。
5. **載量**：加外載解 A * t = f_ext。首索拉達零之載為臨界載 F_crit。

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

**得：** 自應力態算，物理可行之預應力（諸索拉、諸桿壓）尋得，載量估。

**敗則：** 若無自應力態使諸索皆拉，拓不支張拉預應力。或入射矩有訛、系需增索、或為機構非張拉整體。大系用力密度法（Schek, 1974）或數 null 空算代手算。

### 第四步：以 Maxwell 準驗穩

定張拉整體剛（對無窮小擾穩）或為機構（有零能變模）。

1. **施 Maxwell 擴則**：d 維銷節框有 b 桿、j 節、k 運動約（支撐）、s 自應力態、m 無窮小機構：

   **b - dj + k + s = m**

   此連桿、節、約於自應力與機構態間之衡。

2. **自平衡矩算**：rank(A) = b - s。機構數 m = dj - k - rank(A)。若 m = 0，一階剛。若 m > 0，須驗預應力穩。
3. **預應力穩試**：每機構模 q，算二階能 E_2 = q^T * G * q，G 為幾何剛矩（應力矩）。若 E_2 > 0 於諸機構模，張拉整體預應力穩（Connelly and Whiteley, 1996）。此張拉整體達剛之由——非桿計，乃預應力穩機構也。
4. **分剛類**：
   - **運動定**：m = 0，s = 0（張拉罕見）
   - **靜不定而剛**：m = 0，s > 0
   - **預應力穩**：m > 0 而諸機構皆經預應力穩
   - **機構**：m > 0 而未穩（結構可變）

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

**得：** Maxwell 計行，機構定。m > 0 則評預應力穩。結構分為剛、預應力穩、或機構。

**敗則：** 若結構為機構（m > 0 未預應力穩），選：（甲）加索增 b 減 m、（乙）增預應力、（丙）改拓。生物系中，主動肌動球蛋白縮力恆調預應力以守穩——細胞乃自調張拉整體也。

### 第五步：映生物張拉整體（跨尺度析）

若系有生物釋，映析於 Ingber 細胞張拉整體模而察跨尺度一致。純架構系跳此。

1. **分子尺（nm）**：識蛋白絲為張拉元。微管（α/β 微管蛋白異二聚、GTP 依賴聚、動態不穩附災變/救援）。肌動（G 肌動 → F 肌動聚、踏跑）。中間纖維（類依：波形、角蛋白、結蛋白、核纖層）。
2. **細胞尺（um）**：映全細胞張拉整體。肌動皮質 = 連續拉殼。中心體射出之微管 = 壓桿抵皮質。IF = 次拉路連核於焦黏斑。肌動球蛋白縮力（肌球蛋白 II 馬達蛋白）= 主動預應力生器。
3. **組織尺（mm-cm）**：細胞成高階張拉整體。每細胞為壓元，經連續 ECM 拉網（膠原、彈性蛋白）連。細胞間連（鈣黏蛋白）與細胞-ECM 連（整合素）為節。
4. **跨尺度一致**：驗一尺之擾傳於他尺。ECM 之外力經整合素傳骨架至核——此機械傳導路乃跨尺度張拉整體之記也。

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

**得：** 生物張拉整體於諸尺映，壓、拉、預應力源、節皆識。跨尺度力傳書。

**敗則：** 若跨尺度映斷（尺間無清拉連），書其隙。非諸生物結構於諸尺皆為張拉整體。脊乃肌骨層張拉整體（骨=桿、肌筋=索）而諸椎內為常壓結構。

### 第六步：合析而評結構完整

合諸前析為系之張拉完整之終評。

1. **力衡要**：述預應力平衡達乎、剛類、載量裕。
2. **弱析**：識關鍵元——敗致完整最失之索（力密對強最高）、屈致崩之桿（對 Euler 屈：P_cr = pi^2 * EI / L^2）。
3. **冗評**：幾索可除而 s 不降至零？幾而系成未穩機構？
4. **設薦**（架構系）：索預張水平、桿尺、改拓以增裕。
5. **生物涵**（生物系）：連病理——微管穩減（秋水仙鹼/紫杉醇）、IF 網亂（層板病）、預應力變（癌細胞縮力增）。
6. **整評**：
   - **穩健**：s >= 2、諸索遠於鬆閾、關鍵元敗不致崩
   - **邊緣**：s = 1 或期載下最小索拉近零
   - **脆**：s = 0 或關鍵元敗致系崩

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

**得：** 全結構完整評含剛類、弱識、冗析、整評（ROBUST/MARGINAL/FRAGILE）附可行薦。

**敗則：** 若析不全（平衡矩過大、生物參未知），述評為條件：「MARGINAL 待數驗」或「分類須實量預應力」。部分評附明隙勝於無評。

## 驗

- [ ] 諸壓拉元皆錄附屬
- [ ] 連拓書（入射矩或等）
- [ ] 張拉類（一或二）依桿觸定
- [ ] 平衡矩建而秩算
- [ ] 至少一自應力態諸索皆拉尋得
- [ ] Maxwell 擴則施：b - dj + k + s = m
- [ ] 無窮小機構（若有）驗預應力穩
- [ ] 剛類分派
- [ ] 生物系則跨尺度映表全
- [ ] 結構完整評為 ROBUST、MARGINAL、或 FRAGILE 附由

## 陷

- **混張拉整體於常桁**：張拉整體要某元只拉（壓則鬆）。若諸元皆可受拉壓，乃常框而非張拉整體。索之單向致非線性，而預應力為穩之需
- **穩析忽預應力**：未應力之張拉整體恆為機構——止長之索無剛。僅 Maxwell 計常示張拉之 m > 0 似不穩。預應力穩察（第四步）要：預應力乃張拉整體剛之由
- **視生物張拉為靜**：細胞張拉整體由 ATP 依 myosin II 馬達生縮力主動守。預應力為動，非固。靜析捕結構理而失主調。恆注預應力為被動（索預張）或主動（馬達生）
- **施 Maxwell 則而忽索鬆**：Maxwell 則假諸元皆活。外載致索鬆則減有效 b，變穩計。每載案察何索仍緊
- **混 Snelson 雕與 Ingber 模**：Snelson 藝張拉用剛金桿與鋼索。Ingber 細胞張拉有黏彈元、主動調、壓元動態不穩（微管災變）。結構理同，材行本異
- **忽桿屈**：張拉析視桿為剛。細桿可屈（Euler：P_cr = pi^2 * EI / L^2）。壓力近屈載則剛桿假敗，實載量低於預

## 參

- `assess-form` — 結構錄與變備；assess-form 通評系之形，此技施張拉之具框
- `adapt-architecture` — 架構蛻變；張拉析識完整依拉連乎，告變中何元可安改
- `repair-damage` — 再生復；張拉中索敗與桿敗後果異，第六步之關鍵元析告修之先
- `center` — 動推理衡；張拉穩於衡拉（非剛壓）之理為居中之結構喻
- `integrate-gestalt` — gestalt 整合中拉鳴映鏡壓拉二元；皆以對力之作用達一致
- `analyze-magnetic-levitation` — 同嚴式（描、分、驗穩）之姐析；懸達無觸力衡，張拉達觸之力衡於拉連
- `construct-geometric-figure` — 張拉節位之幾何構；幾何圖供初拓，張拉析驗其穩
