---
name: mineral-identification
description: >
  使用硬度、条痕、光泽、解理、晶体形态和简单化学测试进行矿物和矿石的野外鉴定。
  涵盖系统排除法、莫氏硬度标尺应用，以及贵金属、宝石和工业矿物的常见矿石指标。
  适用于遇到未知岩石或矿物标本时、探矿评估场地是否显示有价值的矿物指标时、在
  野外区分含矿岩石与贫矿岩石时，或通过系统观察建立地质素养时。
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: prospecting
  complexity: intermediate
  language: natural
  tags: prospecting, minerals, geology, identification, hardness, streak, field-geology
  locale: zh-CN
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# 矿物鉴定

使用物理性质、系统排除法和简单的野外测试在野外鉴定矿物。

## 适用场景

- 发现未知岩石或矿物标本并想要鉴定
- 探矿时需要评估场地是否显示有价值矿物的指标
- 想要在野外区分含矿岩石与贫矿岩石
- 通过系统观察建立地质素养

## 输入

- **必需**：矿物标本或露头用于检查
- **可选**：条痕板（未上釉的瓷砖或浴室瓷砖背面）
- **可选**：钢钉或刀片（硬度约 5.5）
- **可选**：玻璃板（硬度约 5.5）
- **可选**：铜币（硬度约 3.5）
- **可选**：手持放大镜（10倍）
- **可选**：稀盐酸（10% HCl）用于碳酸盐测试

## 步骤

### 第 1 步：不触碰地观察

在拿取之前，在环境中观察标本。

```
Field Context:
+--------------------+------------------------------------------+
| Observation        | Record                                   |
+--------------------+------------------------------------------+
| Host rock          | What type of rock is it in/on?           |
|                    | (granite, basite, sandstone, schist...)   |
+--------------------+------------------------------------------+
| Geological setting | Vein, disseminated, massive, placer,     |
|                    | weathering surface, cave deposit          |
+--------------------+------------------------------------------+
| Associated         | What other minerals are nearby?           |
| minerals           | (quartz veins often host gold; iron       |
|                    | staining suggests oxidation zone)        |
+--------------------+------------------------------------------+
| Crystal form       | Visible crystals? Habit? Size?           |
| (if visible)       | (cubic, prismatic, tabular, massive)     |
+--------------------+------------------------------------------+
```

**预期结果：** 在拿取标本之前已记录野外环境。

**失败处理：** 如果地质环境不明确（散落标本、城市中发现），仅通过物理性质继续——环境本可帮助缩小候选范围但不是严格必需的。

### 第 2 步：测试物理性质

系统地应用诊断测试。

```
Diagnostic Property Tests:

LUSTER (how it reflects light):
- Metallic: reflects like metal (pyrite, galena, gold)
- Vitreous: glassy (quartz, feldspar)
- Pearly: like a pearl (muscovite, talc surfaces)
- Silky: like silk fibers (asbestos, satin spar gypsum)
- Earthy/dull: no reflection (kaolin, limonite)
- Adamantine: brilliant, diamond-like (diamond, zircon)

HARDNESS (Mohs scale — scratch test):
+------+-----------+----------------------------------+
| Mohs | Reference | Can Be Scratched By              |
+------+-----------+----------------------------------+
| 1    | Talc      | Fingernail                       |
| 2    | Gypsum    | Fingernail (barely)              |
| 3    | Calcite   | Copper coin                      |
| 4    | Fluorite  | Steel nail (easily)              |
| 5    | Apatite   | Steel nail (just)                |
| 6    | Feldspar  | Steel nail cannot scratch        |
| 7    | Quartz    | Scratches glass                  |
| 8    | Topaz     | Scratches quartz                 |
| 9    | Corundum  | Scratches topaz                  |
| 10   | Diamond   | Scratches everything             |
+------+-----------+----------------------------------+

Test: try to scratch the specimen with each reference tool,
starting from soft to hard. The hardness is between the tool
that fails and the tool that succeeds.

STREAK (powder colour on porcelain):
- Drag the specimen firmly across an unglazed porcelain tile
- Record the colour of the powder line
- Streak colour is often different from specimen colour
- Critical: hematite is grey-black but streaks RED
- Critical: pyrite is gold but streaks BLACK
- Minerals harder than the streak plate (~7) will not leave a streak

CLEAVAGE AND FRACTURE:
- Cleavage: breaks along flat planes (mica: 1 direction, feldspar: 2)
- Fracture: breaks irregularly (conchoidal = curved like glass, uneven, fibrous)
- Note number of cleavage directions and angles between them

SPECIFIC GRAVITY (heft test):
- Hold the specimen and assess: does it feel heavier or lighter
  than expected for its size?
- Heavy: possible metallic ore (galena, gold, magnetite)
- Light: possible pumice, sulfur, or organic material
```

**预期结果：** 标本的特征概要：光泽、硬度范围、条痕颜色、解理/断口类型和相对密度。

**失败处理：** 如果某个性质模棱两可（如光泽介于金属和玻璃之间——"亚金属"），记录两个选项。模棱两可降低可信度但不阻止鉴定。

### 第 3 步：应用特殊测试

针对特定矿物组的附加测试。

```
Special Field Tests:

MAGNETISM:
- Hold a magnet near the specimen
- Strong attraction: magnetite (or possibly pyrrhotite)
- Weak attraction: some iron-bearing minerals

ACID TEST (10% HCl):
- Drop acid on the specimen surface
- Vigorous fizzing: calcite (CaCO3)
- Fizzing on powder only: dolomite (scratch surface first, then apply acid)
- No fizzing: not a carbonate

TASTE (only for suspected halite):
- Salty taste: halite (NaCl)
- Do NOT taste unknown minerals generally — some are toxic

SMELL:
- Sulfur: rotten egg smell (sulfides when scratched)
- Clay: earthy "petrichor" smell when breathed on (clay minerals)

TENACITY:
- Brittle: shatters when struck (most silicates)
- Malleable: deforms without breaking (gold, copper, silver)
- Flexible: bends and stays (chlorite, some micas)
- Elastic: bends and springs back (muscovite mica)
```

**预期结果：** 进一步缩小鉴定范围的附加诊断数据。

**失败处理：** 如果特殊测试不可用（无磁铁、无酸），仅凭基本性质继续——它们对大多数常见矿物已经足够。

### 第 4 步：通过排除法鉴定

将性质概要与已知矿物交叉对照。

```
Common Mineral Identification Key (simplified):

METALLIC LUSTER:
- Black streak + hard (6+) + cubic crystals = PYRITE
- Black streak + soft (2.5) + heavy + cubic = GALENA
- Red-brown streak + hard (5-6) + heavy = HEMATITE
- Yellow streak + soft (1.5-2.5) + yellow = GOLD (if malleable)
  or CHALCOPYRITE (if brittle, harder, green-black streak)
- Black streak + magnetic = MAGNETITE

NON-METALLIC, LIGHT-COLORED:
- Vitreous + hard (7) + conchoidal fracture = QUARTZ
- Vitreous + hard (6) + 2 cleavage planes = FELDSPAR
- Vitreous + soft (3) + fizzes in acid = CALCITE
- Pearly + very soft (1) + greasy feel = TALC
- Vitreous + soft (2) + 1 perfect cleavage = GYPSUM

NON-METALLIC, DARK-COLORED:
- Vitreous + hard (5-6) + 2 cleavage at ~90 degrees = PYROXENE
- Vitreous + hard (5-6) + 2 cleavage at ~60/120 degrees = AMPHIBOLE
- Vitreous + soft (2.5-3) + 1 perfect cleavage + flexible = BIOTITE (mica)
```

**预期结果：** 矿物鉴定结果或 2-3 个候选的简短列表，以及区分它们所需的鉴别测试。

**失败处理：** 如果标本不匹配任何常见矿物，它可能是岩石（矿物集合体）而非单一矿物，或者可能需要实验室分析（薄片、XRD）。

## 验证清单

- [ ] 在拿取前已记录野外环境
- [ ] 在自然光下评估了光泽
- [ ] 至少用两种参考材料测试了硬度
- [ ] 已记录条痕颜色（如标本比条痕板软）
- [ ] 已注意解理或断口模式
- [ ] 通过系统排除法而非猜测得出鉴定结果
- [ ] 已明确考虑并区分相似矿物

## 常见问题

- **将黄铁矿与金混淆**："愚人金"（黄铁矿）更硬（6 vs 2.5）、脆性（金是可锻的），条痕为黑色（金的条痕为金色）。测试是决定性的——使用它们
- **忽视条痕**：标本颜色不可靠（赤铁矿可以是灰色、红色或黑色）。条痕颜色是一致的和诊断性的
- **用污染的工具刮擦**：生锈的钢钉会产生错误的条痕。使用前清洁测试工具
- **假设晶体形态**：许多矿物在野外很少展示完好的晶体。块状或粒状形式更常见——不要要求可见晶体来进行鉴定
- **将风化表面与真实颜色混淆**：在测试前打碎标本以露出新鲜表面。风化外壳可能完全掩盖下面的矿物

## 相关技能

- `gold-washing` — 冲积金回收使用矿物鉴定技能来解读溪流沉积物并评估含金砂砾
