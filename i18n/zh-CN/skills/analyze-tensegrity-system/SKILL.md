---
name: analyze-tensegrity-system
description: >
  通过识别压缩支柱与张力索缆、分类类型（class 1/2、生物/建筑）、计算预应力
  平衡、用 Maxwell 刚性准则验证稳定性，以及映射生物张拉整体（微管、肌动蛋白、
  中间丝）来分析张拉整体系统。当评估建筑、机器人、细胞生物学，或任何在连续
  张力中存在孤立压缩的系统中的张拉整体时使用。
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: tensegrity
  complexity: advanced
  language: natural
  tags: tensegrity, structural-integrity, prestress, biomechanics, cytoskeleton, force-balance
  locale: zh-CN
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# 分析张拉整体系统

分析张拉整体（tensional integrity）系统 —— 一种孤立压缩元素（支柱）由连续张力网络（索缆/腱）稳定的结构。确定系统的力平衡、预应力平衡、结构稳定性，以及从分子细胞骨架到建筑形态的跨尺度一致性。

## 适用场景

- 评估某结构是否表现出真正的张拉整体（压缩-张力分离）还是常规框架
- 分析建筑、机器人或可展开结构中张拉整体设计的结构稳定性
- 将 Donald Ingber 的细胞张拉整体模型应用于细胞骨架力学（微管、肌动蛋白、中间丝）
- 评估现有张拉整体系统的承载能力和失效模式
- 确定生物结构（细胞、组织、肌骨系统）是否可建模为张拉整体
- 计算张拉整体所需的预应力，以在比常规桁架具有更多机制的情况下实现刚性

## 输入

- **必需**：系统描述（物理结构、生物细胞、建筑模型或机器人机构）
- **必需**：候选压缩与张力元素的识别
- **可选**：材料性质（杨氏模量、横截面、每个元素的长度）
- **可选**：外部载荷与边界条件
- **可选**：感兴趣的尺度（分子、细胞、组织、建筑）
- **可选**：已知拓扑族（棱柱、八面体、二十面体、X-模块）

## 步骤

### 第 1 步：表征系统

通过识别每个压缩元素（支柱）和张力元素（索缆）、它们的连接性以及边界条件，建立完整的物理描述。

1. **压缩清单**：列出所有支柱 —— 抵抗压缩的刚性元素。记录每个支柱的长度、横截面、材料和杨氏模量。在生物系统中，识别微管（中空圆柱，外径约 25 nm，内径 14 nm，E 约 1.2 GPa，持续长度约 5 mm）。
2. **张力清单**：列出所有索缆 —— 仅抵抗张力、在压缩下变松的元素。记录原长、横截面积和拉伸刚度。在生物系统中：肌动蛋白丝（螺旋形，直径约 7 nm，E 约 2.6 GPa，持续长度约 17 um）和中间丝（IFs，直径约 10 nm，高度可拉伸，应变硬化）。
3. **连接拓扑**：记录哪些支柱在哪些节点（关节）连接到哪些索缆。构造编码拓扑的关联矩阵 C（行 = 成员，列 = 节点）。
4. **边界条件**：识别固定节点（接地关节）、自由节点和外部载荷。注明重力载荷方向与大小。
5. **尺度识别**：分类为分子（nm）、细胞（um）、建筑（m）或机器人（cm-m）。

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

**预期结果：** 包含材料性质的所有压缩与张力元素的完整清单、关联矩阵以及足以建立平衡方程的边界条件。

**失败处理：** 若元素性质未知（在生物系统中常见），使用已发表值：微管（E 约 1.2 GPa，持续长度约 5 mm）、肌动蛋白（E 约 2.6 GPa，持续长度约 17 um）、中间丝（高度非线性，应变硬化，初始模量约 1 MPa，高应变时升至约 1 GPa）。若连接性不清，将系统简化为捕捉本质力路径的最简单拓扑。

### 第 2 步：分类张拉整体类型

确定系统属于哪一类张拉整体，以及是生物的还是工程的。

1. **类别确定**：
   - **Class 1**：支柱彼此不接触 —— 所有支柱都是孤立的，仅通过张力网络连接。多数 Fuller/Snelson 结构是 class 1。
   - **Class 2**：支柱可在共享节点处接触。许多生物系统是 class 2（微管共享中心体附着点）。
2. **拓扑识别**：统计 b = 总成员数（支柱 + 索缆），j = 节点数。识别拓扑是否匹配已知族：张拉整体棱柱（3 支柱、6 索缆三角反棱柱）、扩展八面体（6 支柱、24 索缆）、二十面体张拉整体（30 支柱、90 索缆）或 X-模块（基本 2D 单元）。
3. **生物 vs 工程**：生物张拉整体具有特定特征：压缩元素离散且坚硬（微管），张力网络连续（肌动蛋白皮层 + IFs），预应力主动产生（通过 ATP 水解的肌动球蛋白收缩性），系统表现机械传导（力转信号转换）。记录存在哪些特征。
4. **维度**：分类为 2D（平面）或 3D。

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

**预期结果：** 清晰的分类（类、维度、类别），生物系统的生物映射表已完成。对于工程系统，已识别拓扑族。

**失败处理：** 若系统不能干净地适合 class 1 或 class 2，可能是混合或常规框架。真正的张拉整体要求至少某些元素仅在张力下工作（在压缩下变松的索缆）。若没有仅张力元素，系统不是张拉整体 —— 重新分类为常规桁架或框架并应用标准结构分析。

### 第 3 步：分析力平衡和预应力平衡

计算每个节点的静态平衡，确定预应力状态（无外部载荷下的内部张力/压缩），并验证所有索缆保持张力。

1. **构造平衡矩阵**：对于 d 维空间中的 b 个成员和 j 个节点，构建大小为 dj x b 的平衡矩阵 A。每列编码成员力贡献在其两端节点的方向余弦。平衡方程为 A * t = f_ext，其中 t 是成员力密度（力/长度）向量，f_ext 是外部载荷向量。
2. **求解自应力**：当 f_ext = 0 时，求 A 的零空间。null(A) 的每个基向量都是一种自应力状态 —— 满足平衡而无外部载荷的内力。独立自应力状态数为 s = b - rank(A)。
3. **验证索缆张力**：在任何有效的张拉整体自应力中，所有索缆必须具有正力密度（张力），所有支柱必须具有负力密度（压缩）。使索缆受压的自应力在物理上不可实现（索缆会变松）。
4. **计算预应力水平**：实际预应力是自应力基向量的线性组合，选择使所有索缆张力为正。记录最小索缆张力 t_min（任何索缆变松前的余量）。
5. **承载能力**：添加外部载荷并求解 A * t = f_ext。第一根索缆张力达到零时的载荷即临界载荷 F_crit。

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

**预期结果：** 计算出自应力状态，找到物理上可实现的预应力（所有索缆受拉、所有支柱受压），并估算承载能力。

**失败处理：** 若没有自应力状态能保持所有索缆受拉，拓扑不支持张拉整体预应力。要么 (a) 关联矩阵有误，(b) 系统需要额外索缆，或 (c) 它是机制而非张拉整体。对于大型系统，使用力密度法（Schek, 1974）或数值零空间计算，而非手算。

### 第 4 步：使用 Maxwell 准则检查稳定性

确定张拉整体是刚性的（对无穷小扰动稳定）还是机制（具有零能量变形模态）。

1. **应用扩展 Maxwell 规则**：对于 d 维空间中的销接框架，b 根杆、j 个节点、k 个运动学约束（支座）、s 个自应力状态和 m 个无穷小机制：

   **b - dj + k + s = m**

   这将杆、关节和约束与自应力和机制状态之间的平衡相联系。

2. **从平衡矩阵计算**：rank(A) = b - s。机制数为 m = dj - k - rank(A)。若 m = 0，结构为一阶刚性。若 m > 0，必须检查预应力稳定性。
3. **预应力稳定性测试**：对每个机制模态 q，计算二阶能量 E_2 = q^T * G * q，其中 G 是几何刚度矩阵（应力矩阵）。若所有机制模态都有 E_2 > 0，则张拉整体预应力稳定（Connelly 与 Whiteley, 1996）。这就是张拉整体如何实现刚性 —— 不是通过杆数，而是通过机制的预应力稳定化。
4. **分类刚性**：
   - **运动学定常**：m = 0，s = 0（张拉整体罕见）
   - **静力不定且刚性**：m = 0，s > 0
   - **预应力稳定**：m > 0，但所有机制由预应力稳定
   - **机制**：m > 0，未稳定（结构可变形）

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

**预期结果：** 已执行 Maxwell 计数，确定了机制；对 m > 0，已评估预应力稳定性。结构被分类为刚性、预应力稳定或机制。

**失败处理：** 若结构是机制（m > 0 且非预应力稳定），选项：(a) 添加索缆以增加 b 并减少 m，(b) 增加预应力，(c) 修改拓扑。在生物系统中，主动的肌动球蛋白收缩性持续调整预应力以维持稳定性 —— 细胞是自调谐张拉整体。

### 第 5 步：映射生物张拉整体（跨尺度分析）

若系统具有生物学解读，将分析映射到 Ingber 的细胞张拉整体模型并检查跨尺度一致性。对于纯工程系统跳过此步骤。

1. **分子尺度（nm）**：将蛋白丝识别为张拉整体元素。微管（α/β-微管蛋白异二聚体，GTP 依赖聚合，具有灾变/挽救的动态不稳定性）。肌动蛋白（G-actin → F-actin 聚合，跑步机式）。中间丝（类型依赖：vimentin、keratin、desmin、核纤层蛋白）。
2. **细胞尺度（um）**：映射全细胞张拉整体。肌动蛋白皮层 = 连续张力壳。从中心体辐射的微管 = 抵着皮层的压缩支柱。IFs = 连接核到焦点黏附的次级张力路径。肌动球蛋白收缩性（肌球蛋白 II 马达蛋白）= 主动预应力发生器。
3. **组织尺度（mm-cm）**：细胞形成更高阶张拉整体。每个细胞作为承压元素，由连续的 ECM 张力网络（胶原、弹性蛋白）连接。细胞-细胞连接（钙黏蛋白）和细胞-ECM 连接（整合素）作为节点。
4. **跨尺度一致性**：验证一个尺度的扰动会传播到其他尺度。ECM 处的外力通过整合素传递到细胞骨架到核 —— 这条机械传导路径是跨尺度张拉整体的标志。

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

**预期结果：** 在每个相关尺度映射生物张拉整体，识别压缩、张力、预应力来源和节点。记录跨尺度力传递。

**失败处理：** 若跨尺度映射断裂（尺度间无清晰张力连续性），记录此空隙。并非所有生物结构都在所有尺度上是张拉整体。脊柱在肌骨水平是张拉整体（骨=支柱、肌肉/筋膜=索缆），但单个椎骨内部是常规压缩结构。

### 第 6 步：综合分析并评估结构完整性

将所有先前的分析合并为系统张拉完整性的最终评估。

1. **力平衡总结**：陈述是否实现预应力平衡、刚性分类和承载能力余量。
2. **脆弱性分析**：识别关键成员 —— 失效会导致最大完整性损失的索缆（相对强度的最高力密度），以及屈曲会导致坍塌的支柱（对照欧拉屈曲检查：P_cr = pi^2 * EI / L^2）。
3. **冗余评估**：在 s 降为 0 之前可移除多少索缆？在系统变成未稳定机制之前可移除多少？
4. **设计建议**（工程系统）：索缆预紧力水平、支柱尺寸、改进余量的拓扑修改。
5. **生物学含义**（生物系统）：与病理生理学相关 —— 微管稳定性降低（秋水仙碱/紫杉醇）、IF 网络破坏（核纤层蛋白病）、预应力改变（收缩性增加的癌细胞力学）。
6. **完整性评级**：
   - **ROBUST**：s >= 2，所有索缆远高于松弛阈值，关键成员失效不会导致坍塌
   - **MARGINAL**：s = 1 或预期载荷下最小索缆张力接近零
   - **FRAGILE**：s = 0，或关键成员失效导致系统坍塌

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

**预期结果：** 完整的结构完整性评估，附刚性分类、脆弱性识别、冗余分析和完整性评级（ROBUST/MARGINAL/FRAGILE），并附可执行建议。

**失败处理：** 若分析不完整（平衡矩阵过大、生物参数未知），将评估表述为有条件的："MARGINAL 待数值验证"或"分类需要预应力水平的实验测量"。带显式空隙的部分评估比无评估更有价值。

## 验证清单

- [ ] 所有压缩元素（支柱）和张力元素（索缆）已盘点并附性质
- [ ] 连接拓扑已记录（关联矩阵或等价物）
- [ ] 张拉整体类（1 或 2）已基于支柱接触确定
- [ ] 平衡矩阵已构造，秩已计算
- [ ] 至少找到一个所有索缆受拉的自应力状态
- [ ] 已应用 Maxwell 扩展规则：b - dj + k + s = m
- [ ] 检查无穷小机制（如有）的预应力稳定性
- [ ] 已分配刚性分类
- [ ] 对于生物系统，跨尺度映射表已完成
- [ ] 结构完整性评级为 ROBUST、MARGINAL 或 FRAGILE，附依据

## 常见问题

- **混淆张拉整体与常规桁架**：张拉整体要求某些元素仅在张力下工作（压缩下变松）。若所有元素均可承受张力和压缩，它是常规框架而非张拉整体。索缆的单向性创造非线性，需要预应力来稳定。
- **稳定性分析中忽略预应力**：未受应力的张拉整体始终是机制 —— 处于原长的索缆不提供刚度。Maxwell 计数本身常对张拉整体得出 m > 0，暗示不稳定。预应力稳定性检查（第 4 步）至关重要：预应力使张拉整体刚性。
- **将生物张拉整体视为静态**：细胞张拉整体由 ATP 依赖的肌球蛋白 II 马达在肌动蛋白上产生收缩性来主动维持。预应力是动态的，不固定。静态分析捕捉结构原理但忽略主动调控。始终注明预应力是被动（索缆预紧）还是主动（马达产生）。
- **应用 Maxwell 规则时不考虑索缆松弛**：Maxwell 规则假设所有成员都活跃。导致索缆松弛的外部载荷会减少有效 b，改变稳定性计算。跟踪每种载荷情况下哪些索缆保持紧绷。
- **混淆 Snelson 雕塑与 Ingber 细胞模型**：Snelson 的艺术张拉整体使用刚性金属支柱和钢索。Ingber 的细胞张拉整体具有粘弹性元素、主动调控和压缩元素的动态不稳定性（微管灾变）。结构原理相同；材料行为根本不同。
- **忽视支柱屈曲**：张拉整体分析将支柱视为刚性。细长支柱可能屈曲（欧拉：P_cr = pi^2 * EI / L^2）。若压缩力接近屈曲载荷，刚性支柱假设失效，实际承载能力低于预测。

## 相关技能

- `assess-form` —— 结构清单与转换准备；assess-form 一般性地评估系统形态，而本技能应用压缩-张力分解的特定张拉整体框架
- `adapt-architecture` —— 建筑变形；张拉整体分析识别完整性是否依赖张力连续性，告知哪些元素在转换期间可安全修改
- `repair-damage` —— 再生恢复；在张拉整体中，索缆失效和支柱失效有不同后果，第 6 步的关键成员分析直接告知修复优先级
- `center` —— 动态推理平衡；张拉整体的稳定性原则（通过平衡张力而非刚性压缩）是 centering 背后的结构隐喻
- `integrate-gestalt` —— 格式塔整合中的张力-共鸣映射镜像压缩-张力对偶；两者都通过对立力的富有成效的相互作用找到一致性
- `analyze-magnetic-levitation` —— 共享相同严谨模式（表征、分类、验证稳定性）的姊妹分析技能；悬浮实现无接触力平衡，张拉整体通过张力连续性实现接触式力平衡
- `construct-geometric-figure` —— 张拉整体节点位置的几何构造；几何图形提供初始拓扑，张拉整体分析随后验证其稳定性
