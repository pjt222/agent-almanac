---
name: analyze-magnetic-field
description: >
  使用毕奥-萨伐尔定律、安培定律和磁偶极子近似来计算和可视化电流分布产生的磁场。
  适用于计算任意电流几何结构的 B 场、利用安培定律的对称性、分析多源叠加，
  或通过磁导率、B-H 曲线和磁滞行为来表征磁性材料时。
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: electromagnetism
  complexity: intermediate
  language: natural
  tags: electromagnetism, magnetic-fields, biot-savart, ampere, magnetic-materials
  locale: zh-CN
  source_locale: en
  source_commit: f3953462
  translator: claude
  translation_date: "2026-03-17"
---

# 分析磁场

通过表征源几何结构、选择适当的定律（毕奥-萨伐尔定律用于任意几何，安培定律用于高对称性配置）、计算场积分、检查极限情况、在相关时纳入磁性材料效应以及可视化场线拓扑来计算给定电流分布产生的磁场。

## 适用场景

- 计算任意载流导体（线圈、螺旋线、不规则路径）的 B 场
- 利用柱面、平面或环面对称性直接应用安培定律
- 通过磁偶极子近似估算远场行为
- 叠加多个电流源的场
- 分析磁性材料：线性磁导率、B-H 曲线、磁滞、饱和

## 输入

- **必需**：电流分布规格（几何结构、电流大小和方向）
- **必需**：需要场的感兴趣区域（观测点或体积）
- **可选**：材料属性（相对磁导率、B-H 曲线数据、矫顽力、剩磁）
- **可选**：期望的精度水平（精确积分、多极展开阶数、数值分辨率）
- **可选**：可视化需求（2D 截面、3D 场线、幅值等值线图）

## 步骤

### 第 1 步：表征电流分布和几何结构

在选择方法之前完全指定源：

1. **电流路径**：描述每个载流元件的几何结构。对于线电流，将路径指定为参数曲线 r'(t)。对于面电流，指定表面电流密度 K (A/m)。对于体电流，指定 J (A/m^2)。
2. **坐标系**：选择与主要对称性对齐的坐标。柱坐标 (rho, phi, z) 用于导线和螺线管。球坐标 (r, theta, phi) 用于远距离的偶极子和线圈。笛卡尔坐标用于平面片。
3. **对称性分析**：识别平移、旋转和反射对称性。源的对称性就是场的对称性。记录哪些 B 分量由对称性确定非零，哪些消失。
4. **电流连续性**：验证电流分布满足 div(J) = 0（稳态）或 div(J) = -d(rho)/dt（时变）。不一致的电流分布产生非物理场。

```markdown
## Source Characterization
- **Current type**: [line I / surface K / volume J]
- **Geometry**: [parametric description]
- **Coordinate system**: [and justification]
- **Symmetries**: [translational / rotational / reflection]
- **Nonzero B-components by symmetry**: [list]
- **Current continuity**: [verified / issue noted]
```

**预期结果：** 电流分布的完整几何描述，包括已选择的坐标系、已编目的对称性以及已验证的电流连续性。

**失败处理：** 如果几何结构过于复杂无法进行闭式参数描述，将其离散化为短直段（数值毕奥-萨伐尔）。如果电流连续性被违反，在继续之前添加位移电流或考虑电荷积累项。

### 第 2 步：选择适当的定律

选择与问题的对称性和复杂度匹配的方法：

1. **安培定律**（高对称性）：当电流分布具有足够的对称性使得 B 可以从线积分中提取时使用。适用情况：
   - 无限长直导线（柱面对称）-> 圆形安培环路
   - 无限长螺线管（平移 + 旋转对称）-> 矩形安培环路
   - 环形线圈（绕环轴旋转对称）-> 圆形安培环路
   - 无限大平面电流片（两个方向上的平移对称）-> 矩形环路

2. **毕奥-萨伐尔定律**（一般情况）：用于安培定律无法简化的任意几何结构：
   - dB = (mu_0 / 4 pi) * (I dl' x r_hat) / r^2
   - 对于体电流：B(r) = (mu_0 / 4 pi) * integral of (J(r') x r_hat) / r^2 dV'

3. **磁偶极子近似**（远场）：当观测点远离源时使用（r >> 源尺寸 d）：
   - 计算磁偶极矩：m = I * A * n_hat（对于面积为 A 的平面环路）
   - B_dipole(r) = (mu_0 / 4 pi) * [3(m . r_hat) r_hat - m] / r^3
   - 当 r/d > 5 时有效，精度约 1%

4. **叠加原理**：对于多个源，分别独立计算每个源的 B 并进行矢量求和。麦克斯韦方程的线性性保证这是精确的。

```markdown
## Method Selection
- **Primary method**: [Ampere / Biot-Savart / dipole]
- **Justification**: [symmetry argument or distance criterion]
- **Expected complexity**: [closed-form / single integral / numerical]
- **Fallback method**: [if primary fails or for cross-validation]
```

**预期结果：** 有理据的方法选择，清楚说明为什么所选定律适合问题的对称性水平。

**失败处理：** 如果选择了安培定律但对称性不足（B 无法从积分中提取），退而使用毕奥-萨伐尔。如果源几何结构太复杂无法进行解析毕奥-萨伐尔，则进行数值离散化。

### 第 3 步：建立和计算场积分

使用第 2 步选择的方法执行计算：

1. **安培定律路径**：对于每个安培环路：
   - 参数化环路路径并计算 B . dl 的线积分
   - 通过计数穿过环路的所有电流来计算包围电流 I_enc
   - 求解：contour_integral(B . dl) = mu_0 * I_enc
   - 利用第 1 步建立的对称性从积分中提取 B

2. **毕奥-萨伐尔积分**：对于每个场点 r：
   - 参数化源：dl' = (dr'/dt) dt 或在体积上表达 J(r')
   - 计算位移矢量：r - r' 及其模 |r - r'|
   - 计算叉积：dl' x (r - r') 或 J x (r - r')
   - 在源上积分（线、面或体）
   - 对于解析计算：利用对称性降低维度（例如环路的轴上场只涉及一个积分）
   - 对于数值计算：离散化为 N 段，计算求和，并通过加倍 N 检查收敛性

3. **偶极子计算**：
   - 计算总磁矩：m = (1/2) integral of (r' x J) dV'（对于体电流），或 m = I * A * n_hat（对于平面环路）
   - 在每个观测点应用偶极场公式
   - 估计误差：下一个多极（四极）修正按 (d/r)^4 缩放

4. **叠加组合**：在每个观测点对所有源的贡献求和。分别跟踪各分量以保持抵消精度。

```markdown
## Field Calculation
- **Integral setup**: [explicit expression]
- **Evaluation method**: [analytic / numeric with N segments]
- **Result**: B(r) = [expression with units]
- **Convergence check** (if numerical): [N vs. 2N comparison]
```

**预期结果：** 观测点处 B(r) 的显式表达式，具有正确的单位（特斯拉或高斯），数值结果有收敛性检查。

**失败处理：** 如果积分发散，检查是否缺少正则化（例如，无限细导线上的场本身发散——使用有限导线半径）。如果数值结果随 N 振荡，被积函数有近奇异性，需要自适应求积或解析减去奇异部分。

### 第 4 步：检查极限情况

在信任结果之前，根据已知物理进行验证：

1. **远场偶极极限**：在大 r 处，任何局域电流分布应产生与磁偶极公式匹配的场。计算你的结果在 r -> 无穷极限下的 B 并与 (mu_0 / 4 pi) * [3(m . r_hat) r_hat - m] / r^3 比较。

2. **近场无限长导线极限**：在导体的长直段附近（距离 rho << 长度 L），场应趋近 B = mu_0 I / (2 pi rho)。对你的几何结构的相关部分检查这一点。

3. **轴上特殊情况**：对于线圈和螺线管，轴上场有简单的闭式解：
   - 半径为 R 的单圆环路在轴上距离 z 处：B_z = mu_0 I R^2 / [2 (R^2 + z^2)^(3/2)]
   - 长度为 L、每长度 n 匝的螺线管：B_interior = mu_0 n I（对于 L >> R）

4. **对称性一致性**：验证第 1 步中预测由对称性消失的分量在计算结果中确实为零。非零的禁止分量表示存在错误。

5. **量纲分析**：验证 B 的单位是特斯拉。每一项应携带 mu_0 * [电流] / [长度] 或等价量。

```markdown
## Limiting Case Verification
| Case | Condition | Expected | Computed | Match |
|------|-----------|----------|----------|-------|
| Far-field dipole | r >> d | mu_0 m / (4 pi r^3) scaling | [result] | [Yes/No] |
| Near-field wire | rho << L | mu_0 I / (2 pi rho) | [result] | [Yes/No] |
| On-axis formula | [geometry] | [known result] | [result] | [Yes/No] |
| Symmetry zeros | [component] | 0 | [result] | [Yes/No] |
| Units | -- | Tesla | [check] | [Yes/No] |
```

**预期结果：** 所有极限情况匹配。场具有正确的单位、对称性和渐近行为。

**失败处理：** 极限情况不匹配表明积分建立或计算中存在错误。最常见的原因是：叉积符号错误、缺少 2 或 pi 的因子、积分限不正确，或源与场点参数化之间的坐标系不匹配。

### 第 5 步：纳入磁性材料并可视化

扩展分析以包含材料效应并生成场可视化：

1. **线性磁性材料**：在材料内部用 mu = mu_r * mu_0 替换 mu_0。在材料界面应用边界条件：
   - 法向分量：B1_n = B2_n（连续）
   - 切向分量：H1_t - H2_t = K_free（表面自由电流）
   - 无自由表面电流时：H1_t = H2_t

2. **非线性材料（B-H 曲线）**：对于铁磁芯：
   - 使用材料的 B-H 曲线在每个点关联 B 和 H
   - 对于设计目的，用分段线性近似：线性区域（B = mu H）、拐点区域和饱和区域（B 近似恒定）
   - 如果工作点循环，考虑磁滞：剩磁 B_r 和矫顽力 H_c 定义了回线

3. **退磁效应**：对于有限几何的磁性材料（如短棒、球），内部场被退磁因子 N_d 降低：H_internal = H_applied - N_d * M。

4. **场可视化**：
   - 使用流函数或沿场方向积分 dB/ds 绘制场线
   - 绘制幅值等值线（|B| 作为颜色图）
   - 对于 2D 截面，指示电流方向（点表示出纸面，叉表示入纸面）
   - 验证场线形成闭合环路（div B = 0）——开放场线表示可视化或计算错误

5. **物理直觉检查**：确认场模式在定性上合理。场应在电流源附近最强，应围绕电流环绕（右手定则），并应随距离衰减。

```markdown
## Material Effects and Visualization
- **Material model**: [vacuum / linear mu_r / nonlinear B-H / hysteretic]
- **Boundary conditions applied**: [list interfaces]
- **Visualization**: [field lines / magnitude contour / both]
- **Div B = 0 check**: [field lines close / verified numerically]
```

**预期结果：** 包含相关材料效应的完整场解，可视化显示与 div B = 0 一致的闭合场线，定性行为符合物理直觉。

**失败处理：** 如果场线不闭合，计算存在散度错误——重新检查积分或数值方法。如果材料引入意外的场放大，验证 mu_r 仅应用于材料体积内部，且边界条件在每个界面上正确执行。

## 验证清单

- [ ] 电流分布完整指定，包括几何结构、大小和方向
- [ ] 验证了电流连续性（稳态时 div J = 0）
- [ ] 坐标系与主要对称性对齐
- [ ] 方法选择（安培/毕奥-萨伐尔/偶极子）由对称性分析合理化
- [ ] 场积分以正确的叉积和积分限建立
- [ ] 数值结果显示收敛（N vs. 2N 测试）
- [ ] 验证了远场偶极极限
- [ ] 近场和轴上极限匹配已知公式
- [ ] 由对称性禁止的分量为零
- [ ] 全程单位为特斯拉
- [ ] 材料边界条件正确应用（如适用）
- [ ] 场线形成闭合环路（div B = 0）

## 常见问题

- **叉积方向错误**：毕奥-萨伐尔叉积是 dl' x r_hat（源到场），不是 r_hat x dl'。搞反方向会翻转整个场方向。使用右手定则进行快速检查
- **混淆 B 和 H**：在真空中 B = mu_0 H，但在磁性材料内部 B = mu H。以 H 表示的安培定律仅使用自由电流；以 B 表示的则包含束缚（磁化）电流。混用约定产生 mu_r 倍数的误差
- **在对称性不足时应用安培定律**：安培定律始终成立但仅在对称性允许从积分中提取 B 时有用。如果 B 沿安培环路变化，定律给出一个标量方程对应一个空间变化的函数——欠定
- **忽略"无限长"导线的有限长度**：实际螺线管和导线有端部。无限长导线或无限长螺线管公式仅在远离端部时有效（距端部距离 >> 半径）。在端部附近，使用完整的毕奥-萨伐尔积分或有限螺线管修正
- **忽略有限几何中的退磁**：磁化球或短棒在相同外加场中的内部场与长棒不同。退磁因子可以根据长宽比将有效内部场降低 30-100%
- **非物理场线**：如果可视化显示场线在自由空间中开始或结束（不是在电流源或无穷远处），计算或绘图算法有错误。磁力线始终形成闭合环路

## 相关技能

- `solve-electromagnetic-induction` -- 使用计算出的 B 场分析时变磁通和感应电动势
- `formulate-maxwell-equations` -- 推广到包含位移电流和波传播的完整麦克斯韦方程组
- `design-electromagnetic-device` -- 将磁场分析应用于电磁铁、电机和变压器的设计
- `formulate-quantum-problem` -- 磁相互作用的量子处理（塞曼效应、自旋-轨道耦合）
