---
name: apply-gematria
description: >
  使用标准、序数和简化方法计算和分析格玛特里亚（希伯来字母数值）。涵盖词到数字的
  转换、等值比较和诠释框架。适用于计算希伯来词或短语的数值、比较两个词是否共享
  格玛特里亚值、研究圣经经文或神名的数值对应关系，或将数值结果与生命之树的位置
  联系起来时。
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, kabbalah, gematria, hebrew, numerology, isopsephy
  locale: zh-CN
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# 应用格玛特里亚

计算和分析格玛特里亚——为希伯来字母和词语赋予数值的系统。涵盖标准法（Mispar Hechrachi）、序数法（Mispar Siduri）和简化法（Mispar Katan），等值词比较（isopsephy），以及用于冥想的诠释框架。

## 适用场景

- 想要计算希伯来词或短语的数值
- 比较两个词以确定它们是否共享格玛特里亚值（等值）
- 需要理解哪种格玛特里亚方法适合特定分析
- 研究圣经经文或神名，想要发现数值对应关系
- 探索词义与其数值之间的关系
- 想要将数值结果与其在生命之树上的位置联系起来

## 输入

- **必需**：要分析的希伯来词、短语或神名（希伯来文字或音译）
- **可选**：用于比较的第二个词/短语（等值比较）
- **可选**：偏好的格玛特里亚方法（标准、序数、简化或三者全部）
- **可选**：指导分析的背景或问题（例如"为什么这两个词共享一个值？"）

## 步骤

### 第 1 步：音译并识别希伯来源文

确立词或短语的确切希伯来拼写。

```
HEBREW LETTER VALUES — Standard Gematria (Mispar Hechrachi):

Units:
  Aleph (A)  = 1     Bet (B)    = 2     Gimel (G)  = 3
  Dalet (D)  = 4     Heh (H)    = 5     Vav (V)    = 6
  Zayin (Z)  = 7     Chet (Ch)  = 8     Tet (T)    = 9

Tens:
  Yod (Y)    = 10    Kaf (K)    = 20    Lamed (L)  = 30
  Mem (M)    = 40    Nun (N)    = 50    Samekh (S) = 60
  Ayin (Ay)  = 70    Peh (P)    = 80    Tzadi (Tz) = 90

Hundreds:
  Qoph (Q)   = 100   Resh (R)   = 200   Shin (Sh)  = 300
  Tav (Th)   = 400

Final Forms (Sofit — used when letter appears at end of word):
  Kaf-final  = 500   Mem-final  = 600   Nun-final  = 700
  Peh-final  = 800   Tzadi-final = 900

Note: Whether final forms carry different values depends on the
gematria system. Standard (Mispar Hechrachi) typically uses the
same values for regular and final forms. The 500-900 values above
follow the extended system (Mispar Gadol).
```

1. 如果输入是英文音译，转换为希伯来字母序列
2. 验证拼写：希伯来语中某些词有多种可能的拼写（完全拼写 vs. 缺省拼写）
3. 注意词是否包含词尾形式字母（Kaf-sofit、Mem-sofit、Nun-sofit、Peh-sofit、Tzadi-sofit）
4. 说明来源：这是圣经词汇、神名、现代希伯来语词汇还是卡巴拉术语？
5. 如有歧义，呈现两种常见拼写并为每种计算格玛特里亚

**预期结果：** 希伯来字母序列已有信心地确立。用户确切知道哪些字母正在被求和，并可以验证拼写。

**失败处理：** 如果音译有歧义（例如"chai"在某些语境中可能是 Chet-Yod 或 Chet-Yod-Yod），呈现两个选项及其格玛特里亚值，让用户选择。

### 第 2 步：应用标准格玛特里亚（Mispar Hechrachi）

使用标准希伯来数字表求和字母值。

1. 写出每个字母及其标准值
2. 从左到右求和（希伯来语从右到左读，但加法是交换的）
3. 清楚地说明总数
4. 注意总数是否匹配一个重要数字：
   - 一个质点数（1-10）
   - 一个路径数（11-32）
   - 一个知名的格玛特里亚值（26 = YHVH，18 = chai，72 = Shem ha-Mephorash，137 = Kabbalah）
5. 如果总数超过 400，注意需要累加多个百位数

**预期结果：** 一个清楚的数值结果，逐步展示计算过程。用户可以根据表格验证每个字母的值。

**失败处理：** 如果用户提供了拼写不确定的词，为所有合理拼写计算值并注明范围。"正确"拼写取决于源文本。

### 第 3 步：应用序数法和简化法（可选）

计算揭示不同模式的替代格玛特里亚值。

```
ORDINAL GEMATRIA (Mispar Siduri):
Each letter receives its ordinal position (1-22):
  Aleph=1, Bet=2, Gimel=3, Dalet=4, Heh=5, Vav=6,
  Zayin=7, Chet=8, Tet=9, Yod=10, Kaf=11, Lamed=12,
  Mem=13, Nun=14, Samekh=15, Ayin=16, Peh=17, Tzadi=18,
  Qoph=19, Resh=20, Shin=21, Tav=22

REDUCED GEMATRIA (Mispar Katan):
Reduce each letter's standard value to a single digit:
  Aleph=1, Bet=2, ... Tet=9, Yod=1, Kaf=2, ... Tzadi=9,
  Qoph=1, Resh=2, Shin=3, Tav=4

  Then sum the digits. If the sum exceeds 9, reduce again.
  Example: Shin(3) + Lamed(3) + Vav(6) + Mem(4) = 16 → 1+6 = 7

ATBASH:
A substitution cipher: first letter ↔ last letter.
  Aleph ↔ Tav, Bet ↔ Shin, Gimel ↔ Resh, etc.
  Used in biblical and Kabbalistic cryptography (Jeremiah's
  "Sheshach" = Babel via Atbash).
```

1. 计算序数格玛特里亚：将每个字母在字母表中的位置（1-22）求和
2. 计算简化格玛特里亚：将每个标准值缩减为个位数，然后求和并再次缩减
3. 将三个值并排呈现以供比较
4. 注意哪种方法对这个特定词揭示了最有趣的联系

**预期结果：** 三个数值（标准、序数、简化）并排呈现。简化值通常与单位数的质点数相关联，使其在生命之树映射中很有用。

**失败处理：** 如果用户只想要一种方法，提供该方法并提及其他方法存在以供未来探索。如果只请求了单一方法，不要用过多计算淹没用户。

### 第 4 步：搜索等值联系

识别具有相同数值的其他希伯来词或短语。

1. 取第 2 步的标准格玛特里亚值
2. 搜索具有相同值的知名词汇、神名或短语
3. 呈现 2-5 个联系，优先考虑：
   - 圣经词汇和短语
   - 神名和质点称号
   - 经典来源中记录的传统卡巴拉联系
   - 令人惊讶或富有启发性的联系
4. 对于每个联系，注明来源传统（佐哈尔、塔木德、后期卡巴拉评注、赫尔墨斯传统）
5. 如果没有找到重要联系，请注明——不是每个数字都有丰富的等值关系

**预期结果：** 一组共享相同格玛特里亚值的词，每个都附有关于该联系可能有意义的原因的简短说明。用户有冥想的素材。

**失败处理：** 如果计算值不存在已知联系，承认这一点。可以提供计算该值与附近重要数字关系的服务（例如"你的值是 378，比 shalom [376] 多 2——这暗示了什么？"）。

### 第 5 步：诠释联系和对应关系

从计算转向冥想——数值关系暗示了什么？

1. 清楚说明：格玛特里亚揭示的是供冥想的对应关系，不是证明或预测
2. 对于找到的每个等值联系，提出一个冥想问题：
   - "词 A 和词 B 共享值 N。它们的含义如何相互阐明？"
   - "简化值指向质点 X。这个词的含义如何与该质点的品质相关？"
3. 注明与生命之树的联系：
   - 标准值 1-10 -> 直接的质点对应
   - 简化值 1-9 -> 质点共鸣
   - 值 = 路径数（11-32）-> 与该路径的希伯来字母的共鸣
4. 如果用户提供了指导问题（来自输入），使用格玛特里亚结果直接回答
5. 以一个整合性陈述收尾，将数值分析与词义联系起来

**预期结果：** 数值分析已变得有意义——不仅是算术，而是理解词在卡巴拉象征网络中位置的透镜。

**失败处理：** 如果诠释感觉勉强或猜测性的，直接说明。有些格玛特里亚计算比其他的更富成果。诚实承认薄弱的联系好于制造意义。

## 验证清单

- [ ] 希伯来拼写已有信心地确立（或呈现了多种拼写）
- [ ] 标准格玛特里亚已计算，展示了每个字母的值
- [ ] 至少应用了一种额外方法（序数或简化）
- [ ] 搜索了等值联系并附带来源说明呈现结果
- [ ] 诠释以冥想方式框架，而非论证方式
- [ ] 计算是可验证的——用户可以根据值表检查每个字母

## 常见问题

- **拼写歧义**：希伯来词可以带或不带元音字母（matres lectionis）拼写。格玛特里亚变化显著——始终确认拼写
- **词尾形式混淆**：Mem-final = 40 还是 600 取决于使用的格玛特里亚系统。明确说明系统
- **找到你期望的**：使用足够多的方法，格玛特里亚最终会将任何两个词联系起来。偏好确认先入之见的联系是确认偏误，不是分析
- **忽视传统**：经典的卡巴拉格玛特里亚联系（例如 YHVH = 26，echad [一] = 13，ahavah [爱] = 13，因此爱 + 统一 = 神）在权威来源中有记录。新的联系应与传统联系区分开
- **将格玛特里亚视为证明**：词之间的数值相等暗示了需要冥想的对应关系，而非同一性或因果关系
- **忘记语境**：同一个词在圣经经文、礼拜文本和卡巴拉冥想中可能有不同的格玛特里亚意义。语境塑造诠释

## 相关技能

- `read-tree-of-life` — 将格玛特里亚值映射到质点和路径以获得结构性背景
- `study-hebrew-letters` — 理解个别字母的象征意义能深化格玛特里亚诠释
- `observe` — 对模式的持续中性关注；格玛特里亚是一种数值模式识别的形式
