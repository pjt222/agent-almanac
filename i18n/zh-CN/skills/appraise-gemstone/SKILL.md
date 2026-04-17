---
name: appraise-gemstone
description: >
  使用四C标准（颜色、净度、切工、克拉重量）、产地评估、处理检测和市场因素分析来
  评估宝石价值。仅为教育咨询指导——非认证鉴定。适用于了解决定宝石价值的因素、
  在专业鉴定前预筛宝石、评估卖家要价是否合理、学习宝石分级方法论，或了解处理
  状态如何影响价值时。
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: lapidary
  complexity: advanced
  language: natural
  tags: lapidary, appraisal, valuation, gemstones, grading
  locale: zh-CN
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# 评估宝石

使用四C标准（颜色、净度、切工、克拉重量）、处理检测、产地评估和市场因素分析来评估宝石价值。本程序仅为教育咨询指导，不构成认证宝石学鉴定。

> **免责声明**：本程序提供关于宝石估值方法论的教育指导。这不是认证鉴定。对于保险、遗产、销售或法律用途，请始终获取来自认证宝石学家（GIA 宝石学研究生、FGA 或同等资质）的正式鉴定。宝石价值可能因需要实际专业评估的因素而有巨大差异。

## 适用场景

- 想要了解决定宝石价值的因素
- 在支付专业鉴定费用之前预筛宝石
- 需要评估卖家的要价是否在合理范围内
- 出于教育目的学习宝石分级方法论
- 想要了解处理状态如何影响价值

## 输入

- **必需**：已鉴定的宝石（品种已确认——见 `identify-gemstone`）
- **必需**：接触宝石（裸石优先；镶嵌宝石会限制评估）
- **可选**：克拉秤（精度至 0.01 ct）
- **可选**：10 倍放大镜或宝石学显微镜
- **可选**：日光等效光源（5500-6500K）
- **可选**：颜色分级标准石或参考图像（GIA 系统）
- **可选**：折射仪和切尔西滤光片（用于处理检测）

## 步骤

### 第 1 步：颜色分级

使用三个组成部分评估宝石颜色：色调、饱和度和明度。

```
Colour Assessment Framework:

HUE: The dominant spectral colour
+------------------+------------------------------------------+
| Primary Hue      | Examples                                 |
+------------------+------------------------------------------+
| Red              | Ruby, red spinel, pyrope garnet          |
| Orange           | Spessartine garnet, fire opal            |
| Yellow           | Yellow sapphire, citrine, chrysoberyl    |
| Green            | Emerald, tsavorite, peridot, tourmaline  |
| Blue             | Sapphire, aquamarine, tanzanite          |
| Violet/Purple    | Amethyst, purple sapphire                |
| Pink             | Pink sapphire, morganite, kunzite        |
+------------------+------------------------------------------+
Secondary modifiers: yellowish-green, purplish-red, orangy-pink, etc.

SATURATION: Intensity of the colour
+------------------+------------------------------------------+
| Level            | Description                              |
+------------------+------------------------------------------+
| Vivid            | Pure, intense colour (most valuable)     |
| Strong           | Rich colour, slight modifier             |
| Moderate         | Noticeable colour, some grey/brown       |
| Weak             | Faint colour, significant grey/brown     |
| Greyish/Brownish | Colour masked by grey or brown modifiers |
+------------------+------------------------------------------+

TONE: Lightness or darkness
+------------------+------------------------------------------+
| Level            | Description                              |
+------------------+------------------------------------------+
| Very light       | Pastel, may lack presence                |
| Light            | Attractive in some species (aquamarine)  |
| Medium-light     | Often ideal for many species             |
| Medium           | Classic "fine" tone for most coloured    |
|                  | gemstones                                |
| Medium-dark      | Rich, but watch for over-darkening       |
| Dark             | Colour may appear black face-up          |
| Very dark        | Loses transparency, appears opaque       |
+------------------+------------------------------------------+

IDEAL COLOUR RANGES (highest value):
- Ruby: medium-dark, vivid red ("pigeon blood")
- Sapphire: medium, vivid blue (not too dark, not violetish)
- Emerald: medium, vivid green (not yellowish, not bluish)
- Tanzanite: medium-dark, vivid violetish-blue
- Aquamarine: medium, strong blue (not greenish)
```

1. 在日光等效光照下从正面观察宝石
2. 识别主色调和任何次级修饰色
3. 评估饱和度——鲜艳和浓郁的颜色获得最高溢价
4. 评估明度——中等通常最理想；过深或过浅都会降低价值
5. 如有参考图像或标准石可用，进行比较
6. 注意正面可见的任何颜色分区（会降低价值）

**预期结果：** 一个三组分颜色等级（例如"中等鲜艳蓝色，带轻微紫色修饰"），将宝石定位在其品种的颜色质量光谱上。

**失败处理：** 如果光照条件不理想（偏黄的室内光），注明这一限制。在不正确的光照下进行颜色分级会产生不可靠的结果。如果怀疑有变色效应（亚历山大变石、某些蓝宝石、某些石榴石），需在日光和白炽灯光下分别评估。

### 第 2 步：净度分级

在 10 倍放大下评估宝石的内部特征。

```
Coloured Gemstone Clarity Scale (GIA-based):

+-------------------+------------------------------------------+
| Grade             | Description                              |
+-------------------+------------------------------------------+
| VVS               | Very Very Slightly Included: minute      |
| (eye-clean)       | inclusions, difficult to see at 10x      |
+-------------------+------------------------------------------+
| VS                | Very Slightly Included: minor            |
| (eye-clean)       | inclusions, noticeable at 10x            |
+-------------------+------------------------------------------+
| SI1               | Slightly Included: noticeable at 10x,    |
| (usually eye-     | may be visible to the eye                |
| clean)            |                                          |
+-------------------+------------------------------------------+
| SI2               | Slightly Included: easily seen at 10x,   |
| (eye-visible)     | visible to the unaided eye               |
+-------------------+------------------------------------------+
| I1                | Included: obvious inclusions that may    |
|                   | affect transparency or durability        |
+-------------------+------------------------------------------+
| I2-I3             | Heavily Included: prominent inclusions   |
|                   | that affect beauty and/or durability     |
+-------------------+------------------------------------------+

SPECIES-SPECIFIC EXPECTATIONS:
Different species have different "normal" clarity levels:
- Type I (usually eye-clean): aquamarine, topaz, chrysoberyl
  → Inclusions are penalized more heavily
- Type II (usually included): ruby, sapphire, tourmaline
  → Eye-clean examples command significant premiums
- Type III (almost always included): emerald, red tourmaline
  → Eye-clean examples are extremely rare and valuable
```

1. 首先从正面检查宝石——肉眼能否看到任何内含物？
2. 在 10 倍放大下检查，通过台面聚焦
3. 记录内含物类型（晶体、羽裂、指纹状、丝状、针状）、大小、位置和数量
4. 评估内含物是否影响透明度、光彩或耐久性
5. 根据内含物的可见度和影响程度分配净度等级
6. 考虑品种预期——SI1 级祖母绿是优秀的；SI1 级海蓝宝石则是一般的

**预期结果：** 一个净度等级，附有主要内含物的描述、位置及其对美观和耐久性的影响。等级已根据品种特定预期进行校准。

**失败处理：** 如果放大倍数不够（没有放大镜），仅进行肉眼洁净/非肉眼洁净的评估。注明此限制。如果宝石已镶嵌且亭部内含物被遮挡，注明哪些区域无法评估。

### 第 3 步：切工质量评估

根据比例、对称性和光学性能评估切工质量。

```
Cut Quality Factors:

PROPORTIONS:
+------------------+------------------------------------------+
| Factor           | Ideal                                    |
+------------------+------------------------------------------+
| Table size       | 55-65% of girdle diameter (round)        |
| Crown height     | 12-17% of girdle diameter                |
| Pavilion depth   | 40-45% of girdle diameter                |
| Girdle thickness | Medium (not too thin, not too thick)     |
| Total depth      | 58-65% of girdle diameter                |
+------------------+------------------------------------------+

LIGHT PERFORMANCE:
+------------------+------------------------------------------+
| Factor           | Description                              |
+------------------+------------------------------------------+
| Brilliance       | White light return — pavillion angles     |
|                  | determine total internal reflection      |
+------------------+------------------------------------------+
| Windowing        | "See-through" area (pavilion too shallow)|
|                  | Any visible window reduces value         |
+------------------+------------------------------------------+
| Extinction       | Dark areas that do not return light      |
|                  | (pavilion too steep, or inherent to deep |
|                  | colour stones at steep viewing angles)   |
+------------------+------------------------------------------+
| Scintillation    | Flashes of light as stone moves          |
|                  | (pattern and intensity)                  |
+------------------+------------------------------------------+

SYMMETRY AND FINISH:
- Facet alignment and meet precision
- Outline symmetry (roundness, oval evenness)
- Surface polish quality (scratches, orange peel)
- Girdle consistency (even thickness)
```

1. 从正面观察宝石并轻轻摇动——观察光彩、窗口效应和暗区
2. 检查比例：台面大小、冠部高度、亭部深度
3. 评估对称性：轮廓形状、刻面对齐、交汇精度
4. 评估表面抛光：划痕、抛光线、10 倍下的橘皮效应
5. 检查腰棱：厚度均匀，不宜过薄（崩裂风险）或过厚（死重）
6. 从优秀到差评定切工等级

**预期结果：** 一份涵盖比例、光学性能、对称性和表面质量的切工质量评估。切工等级显著影响价值——一颗切工精良的中等品质宝石可能胜过一颗切工粗糙的高颜色高净度宝石。

**失败处理：** 如果宝石已镶嵌且比例无法完全测量，评估可见部分（正面光学性能、对称性、抛光），并注明比例无法验证。镶嵌宝石始终存在评估限制。

### 第 4 步：克拉重量和尺寸

记录宝石的重量和尺寸。

1. 在克拉秤上称重（1 克拉 = 0.2 克）
2. 记录精确到两位小数的重量（例如 2.37 ct）
3. 测量尺寸：长 x 宽 x 深，单位为毫米
4. 对于镶嵌宝石，使用品种特定公式从尺寸估算重量：
   - 圆形：直径^2 x 深度 x 比重系数
   - 椭圆形：长 x 宽 x 深 x 比重系数 x 0.0020
5. 注意每克拉价值在商业上重要的重量阈值处会增加：
   - 0.50 ct、1.00 ct、2.00 ct、3.00 ct、5.00 ct、10.00 ct
   - 一颗 1.02 ct 的宝石比同等品质的 0.98 ct 宝石价格更高

**预期结果：** 精确的克拉重量（到 0.01 ct）和毫米尺寸。对于镶嵌宝石，需注明误差范围的重量估算。

**失败处理：** 如果没有克拉秤，测量尺寸并使用标准公式估算重量。注明重量为估算值。对于贵重宝石，始终在校准过的秤上验证重量。

### 第 5 步：处理检测

评估宝石是否经过处理以增强外观。

```
Common Gemstone Treatments:
+-------------------+------------------------------------------+
| Treatment         | Detection Indicators                     |
+-------------------+------------------------------------------+
| Heat treatment    | Dissolved silk (rutile needles melted),  |
| (ruby, sapphire)  | stress fractures around inclusions,     |
|                   | altered colour zoning                    |
|                   | NOTE: Heat treatment is standard and     |
|                   | widely accepted for corundum             |
+-------------------+------------------------------------------+
| Fracture filling  | Flash effect under fibre-optic light     |
| (emerald, ruby)   | (blue/orange flash in fractures),       |
|                   | bubbles in filler material               |
|                   | Reduces value significantly              |
+-------------------+------------------------------------------+
| Surface coating   | Colour concentrated at surface,          |
| (topaz "mystic")  | scratches reveal different colour       |
|                   | underneath, uneven colour               |
+-------------------+------------------------------------------+
| Diffusion         | Colour concentrated at surface or along  |
| (sapphire)        | fractures. Immerse in methylene iodide  |
|                   | — colour pattern visible                 |
+-------------------+------------------------------------------+
| Irradiation       | Unstable colours may fade in sunlight    |
| (topaz, diamond)  | Some irradiation is undetectable without |
|                   | lab testing                              |
+-------------------+------------------------------------------+
| Glass filling     | Gas bubbles in glass, flash effect,      |
| (ruby)            | different lustre in filled areas         |
|                   | Severely reduces value and durability    |
+-------------------+------------------------------------------+

TREATMENT IMPACT ON VALUE:
- Untreated (with certification): highest premium
- Standard accepted treatment (heat): moderate reduction
- Enhancement treatment (filling, coating): significant reduction
- Requires disclosure at point of sale in all jurisdictions
```

1. 检查内含物是否有热处理迹象（溶解的丝状物、应力晕）
2. 使用光纤灯检查裂隙充填（闪光效应）
3. 通过检查边缘和划痕来检查表面涂层
4. 对于高价值宝石，注明实验室认证对处理状态至关重要
5. 记录处理评估：未处理、加热、充填、涂层、扩散处理或未知

**预期结果：** 一份附有支持性观察的处理评估。对于价值超过 $500 的宝石，建议获取实验室认证（GIA、GRS、SSEF、Gubelin）以进行权威的处理状态确定。

**失败处理：** 许多处理（特别是轻度热处理和某些辐照）在没有实验室仪器（FTIR 光谱、UV-Vis、拉曼光谱）的情况下无法检测。如果处理状态不确定，记录"未知——建议实验室检测"，而不是猜测。

### 第 6 步：市场因素分析

考虑四C之外影响市场价值的外部因素。

```
Market Factors:
+-------------------+------------------------------------------+
| Factor            | Impact                                   |
+-------------------+------------------------------------------+
| Origin            | Kashmir sapphire, Burmese ruby, and      |
|                   | Colombian emerald command significant     |
|                   | premiums (2-10x) over identical quality  |
|                   | from other sources                       |
+-------------------+------------------------------------------+
| Rarity            | Paraiba tourmaline, alexandrite,          |
|                   | padparadscha sapphire — scarcity drives  |
|                   | premium pricing                          |
+-------------------+------------------------------------------+
| Certification     | GIA, GRS, SSEF, Gubelin reports add      |
|                   | confidence and liquidity to high-value   |
|                   | stones                                   |
+-------------------+------------------------------------------+
| Fashion/trends    | Tanzanite, morganite, and coloured       |
|                   | diamonds have experienced trend-driven   |
|                   | price increases                          |
+-------------------+------------------------------------------+
| Setting/mounting  | A well-made setting from a recognised    |
|                   | maker can add value. Generic mounts do   |
|                   | not                                      |
+-------------------+------------------------------------------+
| Provenance        | Royal, historical, or celebrity provenance|
|                   | adds auction premium                     |
+-------------------+------------------------------------------+
```

1. 如果已知或可认证，研究宝石的可能产地
2. 考虑该品种当前的市场地位（上升趋势、稳定、下降）
3. 评估实验室认证是否会增加价值（对于 >1 ct 和 >$500 的宝石通常是肯定的）
4. 注明任何来源或历史意义
5. 将完整评估汇编成一个价值范围（不是单一价格点）

**预期结果：** 一个将四C、处理状态、产地和市场因素纳入考量的情境化价值范围。以范围表示并附有声明的假设条件。

**失败处理：** 宝石定价需要持续更新的市场专业知识。如果市场数据不可用，提供质量评估（四C + 处理）而不提供价格估算，并建议咨询经销商或认证鉴定师。

## 验证清单

- [ ] 鉴定开始前已积极确认宝石品种
- [ ] 在日光等效光照下评估了颜色的色调、饱和度和明度
- [ ] 在 10 倍放大下进行了净度分级并编制了内含物清单
- [ ] 评估了切工质量的比例、光学性能、对称性和表面质量
- [ ] 测量了克拉重量（或进行了附有声明误差范围的估算）
- [ ] 评估了处理状态并附有支持性观察
- [ ] 考虑了市场因素（产地、稀有性、认证价值）
- [ ] 价值以范围表示，而非单一数字
- [ ] 包含免责声明：这是教育指导，非认证鉴定

## 常见问题

- **遗漏免责声明**：本程序仅提供教育指导。用于保险、销售或法律目的的正式鉴定需要认证宝石学家。始终清楚说明这一点
- **在不正确的光照下进行颜色分级**：荧光灯、白炽灯和 LED 灯都会改变颜色感知。使用日光等效光源（5500-6500K）或自然的朝北日光
- **忽视品种特定的净度预期**：SI1 级祖母绿是一颗好石头；SI1 级海蓝宝石则低于平均水平。净度必须相对于该品种的正常水平来分级
- **过度重视克拉重量**：一颗大而切工差、含内含物的宝石每克拉价值低于一颗更小但切工精良、洁净的宝石。四C相互作用——重量本身不决定价值
- **在没有证据的情况下假定未处理**：市场上大多数红宝石和蓝宝石都经过热处理。除非实验室认证确认，否则应假定已处理

## 相关技能

- `identify-gemstone` — 正确的品种鉴定是评估的前提；错误鉴定将使整个评估无效
- `grade-tcg-card` — 观察优先、防偏见的方法论与宝石鉴定中避免"愿望分级"所需的纪律性相呼应
