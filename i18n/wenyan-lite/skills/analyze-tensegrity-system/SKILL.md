---
name: analyze-tensegrity-system
locale: wenyan-lite
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

# 析張拉整體系統

析張拉整體（tensional integrity）系統——孤立壓縮元件（撐桿）由連續張力網（索／腱）穩定之結構。判系統之力平衡、預應力平衡、結構穩定，並由分子細胞骨架至建築形體之跨尺度連貫。

## 適用時機

- 評結構是否呈真張拉整體（壓張分離）抑或為傳統框架
- 析張拉整體設計於建築、機器人或可展結構之結構穩定
- 將 Donald Ingber 之細胞張拉整體模型施於細胞骨架力學（微管、肌動蛋白、中間絲）
- 評既有張拉整體系統之載荷量與失效模
- 判生物結構（細胞、組織、肌骨系統）能否模為張拉整體
- 計張拉整體之預應力需求，以使系統雖機制多於傳統桁架仍達剛性

## 輸入

- **必要**：系統描述（物理結構、生物細胞、建築模型或機器人機制）
- **必要**：候選壓縮與張力元件之識別
- **選擇性**：材料性質（楊氏模數、截面、各元件之長）
- **選擇性**：外部載荷與邊界條件
- **選擇性**：關注尺度（分子、細胞、組織、建築）
- **選擇性**：已知拓撲族（稜柱、八面體、二十面體、X 模組）

## 步驟

### 步驟一：刻劃系統

藉辨每壓縮元件（撐桿）與張力元件（索）、其連結、邊界條件，立完整物理描述。

1. **壓縮清單**：列一切撐桿——抗壓之剛元件。記每撐桿之長、截面、材料、楊氏模數。生物系統中辨微管（中空圓柱，外徑約 25 nm，內徑 14 nm，E ~ 1.2 GPa，持續長 ~ 5 mm）
2. **張力清單**：列一切索——僅抗張、受壓即鬆之元件。記靜止長、截面積、抗拉剛度。生物系統中：肌動蛋白絲（螺旋，徑約 7 nm，E ~ 2.6 GPa，持續長 ~ 17 um）與中間絲（IF，徑約 10 nm，高可延，應變硬化）
3. **連結拓撲**：記何撐桿於何節點（接點）連何索。建關聯矩陣 C（行 = 元件，列 = 節點）以編拓撲
4. **邊界條件**：辨固定節點（接地接點）、自由節點、外載。記重力載之向與量
5. **尺度識別**：分為分子（nm）、細胞（um）、建築（m）或機器人（cm-m）

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

**預期：** 一切壓縮與張力元件之完整清單附材料性質、關聯矩陣、邊界條件，足以立平衡方程。

**失敗時：** 若元件性質未知（生物系統中常），用已發表值：微管（E ~ 1.2 GPa，持續長 ~ 5 mm）、肌動蛋白（E ~ 2.6 GPa，持續長 ~ 17 um）、中間絲（高度非線性，應變硬化，初始模數低 ~1 MPa 高應變升至 ~1 GPa）。若連結不清，化系統為捕本質力路徑之最簡拓撲。

### 步驟二：分類張拉整體類型

判系統屬何類張拉整體，且為生物或工程。

1. **類別判定**：
   - **Class 1**：撐桿不互觸——一切撐桿孤立，僅經張力網相連。Fuller/Snelson 結構多為 class 1
   - **Class 2**：撐桿可於共節點接觸。生物系統多為 class 2（微管共中心體附著點）
2. **拓撲識別**：計 b = 元件總（撐桿 + 索）、j = 節點。辨拓撲是否合於已知族：張拉整體稜柱（3 撐桿、6 索三角反稜柱）、擴張八面體（6 撐桿、24 索）、二十面體張拉整體（30 撐桿、90 索）、X 模組（基本 2D 單元）
3. **生物對工程**：生物張拉整體有特定特徵：壓縮元件離散且剛（微管）、張力網連續（肌動蛋白皮質 + IF）、預應力主動生成（肌動肌球蛋白收縮經 ATP 水解）、系統呈機械轉導（力轉信號）。記何特徵在
4. **維度**：分為 2D（平面）或 3D

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

**預期：** 清晰之分類（類、維、範疇）附生物系統之生物對應表。對工程系統，拓撲族已辨。

**失敗時：** 若系統不潔合 class 1 或 class 2，或為混合或傳統框架。真張拉整體需至少有些元件僅於張力下工（受壓即鬆之索）。若無僅張之元件，系統非張拉整體——重類為傳統桁架或框架並施標準結構分析。

### 步驟三：析力平衡與預應力平衡

於每節點計靜平衡，判預應力之態（無外載之內張／壓），驗一切索仍於張力下。

1. **構平衡矩陣**：對 d 維中 b 元件 j 節點，建平衡矩陣 A（大小 dj x b）。各列編元件於其二端節點之力貢獻之方向餘弦。平衡方程為 A * t = f_ext，t 為元件力密度（力／長）之向量，f_ext 為外載向量
2. **解自應力**：以 f_ext = 0，尋 A 之零空間。null(A) 之每基向量為自應力之態——無外載之內力滿足平衡。獨立自應力態之數為 s = b - rank(A)
3. **驗索之張力**：於任何有效之張拉整體自應力中，一切索須有正力密度（張力），一切撐桿須有負力密度（壓縮）。將索置於壓縮之自應力於物理上不可實現（索將鬆）
4. **計預應力等級**：實預應力為自應力基向量之線性組合，使一切索張力為正。記最小索張力 t_min（任索鬆前之裕度）
5. **載荷量**：加外載並解 A * t = f_ext。首索張力達零之載為臨界載 F_crit

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

**預期：** 自應力態已計，物理可實現之預應力（一切索於張力、一切撐桿於壓縮）已尋得，載荷量已估。

**失敗時：** 若無自應力態保一切索於張力，拓撲不支張拉整體預應力。或 (a) 關聯矩陣有誤、(b) 系統需更多索、或 (c) 為機制而非張拉整體。對大型系統，用力密度法（Schek, 1974）或數值零空間計算而非手計。

### 步驟四：以 Maxwell 準則查穩定

判張拉整體為剛性（對微擾穩定）抑或機制（有零能變形模）。

1. **施擴展 Maxwell 規則**：對 d 維中銷接框架，b 桿、j 節點、k 運動約束（支承）、s 自應力態、m 微小機制：

   **b - dj + k + s = m**

   此關桿、接點、約束於自應力與機制態之平衡。

2. **自平衡矩陣計算**：rank(A) = b - s。機制數為 m = dj - k - rank(A)。若 m = 0，結構為一階剛性。若 m > 0，須查預應力穩定
3. **預應力穩定試**：對每機制模 q，計二階能 E_2 = q^T * G * q，G 為幾何剛度矩陣（應力矩陣）。若 E_2 > 0 對一切機制模，張拉整體為預應力穩定（Connelly 與 Whiteley, 1996）。此即張拉整體達剛之道——非藉桿數，而藉預應力對機制之穩定
4. **分類剛性**：
   - **運動學上靜定**：m = 0、s = 0（張拉整體中罕）
   - **靜不定且剛**：m = 0、s > 0
   - **預應力穩定**：m > 0，然一切機制由預應力穩定
   - **機制**：m > 0、未穩定（結構可變形）

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

**預期：** Maxwell 計數已行，機制已判，且對 m > 0，預應力穩定已評。結構分為剛、預應力穩定或機制。

**失敗時：** 若結構為機制（m > 0 且非預應力穩定），選項：(a) 加索以增 b 而減 m、(b) 增預應力、(c) 改拓撲。生物系統中，主動之肌動肌球蛋白收縮持續調預應力以維穩——細胞為自調之張拉整體。

### 步驟五：對應生物張拉整體（跨尺度分析）

若系統有生物詮釋，將分析對應 Ingber 之細胞張拉整體模型並查跨尺度連貫。純工程系統可省此步。

1. **分子尺度（nm）**：辨蛋白絲為張拉整體元件。微管（α/β-微管蛋白異二聚體、GTP 依賴聚合、附災變／救援之動態不穩）。肌動蛋白（G-肌動蛋白 → F-肌動蛋白聚合、跑步機）。中間絲（依型：vimentin、keratin、desmin、核薄板）
2. **細胞尺度（um）**：對應全細胞張拉整體。肌動蛋白皮質 = 連續張力殼。自中心體輻射之微管 = 抵皮質之壓縮撐桿。IF = 連核至焦點黏附之次張力路徑。肌動肌球蛋白收縮（肌球蛋白 II 馬達蛋白）= 主動預應力生成器
3. **組織尺度（mm-cm）**：細胞構高階張拉整體。每細胞為承壓元件，由連續 ECM 張力網（膠原蛋白、彈性蛋白）連結。細胞間接（cadherin）與細胞-ECM 接（integrin）為節點
4. **跨尺度連貫**：驗一尺度之擾動傳至他尺度。ECM 之外力經 integrin 傳至細胞骨架至核——此機械轉導路徑為跨尺度張拉整體之徵

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

**預期：** 各相關尺度之生物張拉整體已對應，壓縮、張力、預應力源、節點已辨。跨尺度力傳遞已記。

**失敗時：** 若跨尺度對應斷（尺度間無清晰張力連續），記其缺。非一切生物結構於一切尺度皆為張拉整體。脊柱於肌骨層級為張拉整體（骨=撐桿、肌／筋=索）然個別椎骨內部為傳統壓縮結構。

### 步驟六：綜合分析並評結構整體性

合一切前分析為系統張拉整體之終評。

1. **力平衡摘要**：陳預應力平衡是否達、剛性分類、載荷量裕度
2. **脆弱性分析**：辨關鍵元件——失敗致整體損失最大之索（相對於強度之力密度最高），與屈曲將致塌之撐桿（對 Euler 屈曲查：P_cr = pi^2 * EI / L^2）
3. **冗餘評估**：可移幾索使 s 降至 0？再幾使系統成不穩之機制？
4. **設計建議**（工程系統）：索預張力等級、撐桿尺寸、改進裕度之拓撲修改
5. **生物含意**（生物系統）：繫於病理生理——微管穩定降（colchicine/taxol）、IF 網絡擾（laminopathy）、預應力變（癌細胞力學附增收縮）
6. **整體性評分**：
   - **ROBUST（堅固）**：s >= 2、一切索遠高於鬆閾、關鍵元件失敗不致塌
   - **MARGINAL（邊緣）**：s = 1 或預期載下最小索張力近零
   - **FRAGILE（脆弱）**：s = 0、或關鍵元件失敗致系統塌

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

**預期：** 完整結構整體性評估，附剛性分類、脆弱性識別、冗餘分析、整體性評分（ROBUST/MARGINAL/FRAGILE）與可行建議。

**失敗時：** 若分析不全（平衡矩陣過大、生物參數未知），陳評為條件式：「MARGINAL，待數值驗證」或「分類需實驗量預應力等級」。附明確缺之部分評估，較無評估更有價值。

## 驗證

- [ ] 一切壓縮元件（撐桿）與張力元件（索）已附性質清單
- [ ] 連結拓撲已記（關聯矩陣或同等）
- [ ] 張拉整體類別（1 或 2）已依撐桿接觸判
- [ ] 平衡矩陣已構，秩已計
- [ ] 至少一自應力態已尋得，且一切索於張力
- [ ] 已施擴展 Maxwell 規則：b - dj + k + s = m
- [ ] 微小機制（若有）已查預應力穩定
- [ ] 剛性分類已賦
- [ ] 對生物系統，跨尺度對應表已備
- [ ] 結構整體性附理由評為 ROBUST、MARGINAL 或 FRAGILE

## 常見陷阱

- **混張拉整體與傳統桁架**：張拉整體需有些元件僅於張力下工（受壓即鬆）。若一切元件可承張壓，則為傳統框架，非張拉整體。索之單向性生需預應力以求穩定之非線性
- **穩定分析中忽預應力**：未受應力之張拉整體恆為機制——靜止長之索無剛度。Maxwell 計數獨對張拉整體常產 m > 0，似不穩。預應力穩定查（步驟四）為要：預應力使張拉整體成剛
- **將生物張拉整體視為靜態**：細胞張拉整體由 ATP 依賴之肌球蛋白 II 馬達於肌動蛋白上生收縮以主動維。預應力動態，非固定。靜態分析捕結構原則然失主動調節。恆注預應力為被動（索預張力）或主動（馬達生成）
- **施 Maxwell 規則而未計索之鬆**：Maxwell 規則假設一切元件活躍。外載致索鬆減有效 b，改穩定計算。追各載案下何索仍緊
- **混 Snelson 之雕塑與 Ingber 之細胞模型**：Snelson 之藝術張拉整體用剛之金屬撐桿與鋼索。Ingber 之細胞張拉整體含黏彈性元件、主動調節、壓縮元件之動態不穩（微管災變）。結構原則同；材料行為根本相異
- **疏撐桿屈曲**：張拉整體分析將撐桿視為剛。細撐桿可屈（Euler：P_cr = pi^2 * EI / L^2）。若壓力近屈曲載，剛撐桿假設失效，實載荷量低於預測

## 相關技能

- `assess-form` — 結構清單與轉化就緒；assess-form 通用評系統之形，此技能施特定張拉整體框架之壓張分解
- `adapt-architecture` — 建築蛻變；張拉整體分析辨整體性是否依張力連續，告知何元件於轉化中可安全修改
- `repair-damage` — 再生復原；張拉整體中索失敗與撐桿失敗有不同後果，關鍵元件分析（步驟六）直接告知修復優先
- `center` — 動態推理平衡；張拉整體之經平衡張力（非剛壓）求穩之原則，為定中之結構喻
- `integrate-gestalt` — 格式塔整合中之張力-共鳴對應映於壓張對偶；二者皆藉對立力之富生互動覓連貫
- `analyze-magnetic-levitation` — 共相同嚴謹模式之姊妹分析技能（刻劃、分類、驗穩）；懸浮達無接觸之力平衡，張拉整體經張力連續達接觸基之力平衡
- `construct-geometric-figure` — 張拉整體節點位置之幾何構造；幾何形體供初始拓撲，張拉整體分析後驗其穩定
