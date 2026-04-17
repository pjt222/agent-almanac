---
name: compose-sacred-music
description: >
  以希尔德加德·冯·宾根独特的调式风格创作或分析圣乐。涵盖调式选择、旋律轮廓
  （宽音域旋律）、歌词配曲（音节式和花腔式）、纽姆记谱法和礼仪背景，包括
  对唱、续唱和应答。适用于以希尔德加德风格创作新作品、分析现有圣咏的结构和
  调式、研究中世纪调式音乐、准备演出或教授希尔德加德的音乐，或为拉丁圣诗配曲。
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: hildegard
  complexity: advanced
  language: natural
  tags: hildegard, sacred-music, chant, gregorian, modal, symphonia, antiphon, sequence
  locale: zh-CN
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# 创作圣乐

以希尔德加德·冯·宾根的独特风格创作或分析圣乐，遵循她的《天启和谐交响曲》（*Symphonia harmoniae caelestium revelationum*）和调式作曲原则。

## 适用场景

- 以希尔德加德风格创作新的圣乐作品
- 分析现有希尔德加德圣咏的结构、调式和歌词配曲
- 研究中世纪调式音乐和纽姆记谱法
- 了解希尔德加德作品的礼仪背景
- 准备演出或教授希尔德加德的音乐
- 需要拉丁圣诗配曲的指导

## 输入

- **必需**：目的（创作新作品或分析现有作品）
- **创作必需**：圣诗文本（优先拉丁文，英文可用于学习）
- **创作必需**：礼仪背景（对唱、续唱、应答、赞美诗）
- **分析必需**：希尔德加德作品标题（如"O vis aeternitatis"）
- **可选**：节日或礼仪季节（影响调式选择）
- **可选**：预期演出者经验水平（简单音节式 vs 技巧性花腔式）
- **可选**：调式偏好（如创作）

## 步骤

### 第 1 步：调式选择（创作时）或识别（分析时）

选择或识别支配旋律结构的礼仪调式。

```
The Eight Church Modes (Medieval System):
┌──────┬─────────┬────────────┬──────────┬─────────────────────┐
│ Mode │ Name    │ Final Note │ Range    │ Character           │
├──────┼─────────┼────────────┼──────────┼─────────────────────┤
│ 1    │ Dorian  │ D          │ D-D      │ Serious, meditative │
│      │ (auth.) │            │ (octave) │ Hildegard's most    │
│      │         │            │          │ common              │
├──────┼─────────┼────────────┼──────────┼─────────────────────┤
│ 2    │ Dorian  │ D          │ A-A      │ Reflective, subdued │
│      │ (plag.) │            │ (below)  │                     │
├──────┼─────────┼────────────┼──────────┼─────────────────────┤
│ 3    │ Phrygian│ E          │ E-E      │ Mystical, intense   │
│      │ (auth.) │            │          │                     │
├──────┼─────────┼────────────┼──────────┼─────────────────────┤
│ 4    │ Phrygian│ E          │ B-B      │ Penitential, dark   │
│      │ (plag.) │            │          │                     │
├──────┼─────────┼────────────┼──────────┼─────────────────────┤
│ 5    │ Lydian  │ F          │ F-F      │ Joyful, bright      │
│      │ (auth.) │            │          │ (avoids B♮-F tritone│
│      │         │            │          │ with B♭)            │
├──────┼─────────┼────────────┼──────────┼─────────────────────┤
│ 6    │ Lydian  │ F          │ C-C      │ Gentle, pastoral    │
│      │ (plag.) │            │          │                     │
├──────┼─────────┼────────────┼──────────┼─────────────────────┤
│ 7    │ Mixolyd.│ G          │ G-G      │ Triumphant, regal   │
│      │ (auth.) │            │          │                     │
├──────┼─────────┼────────────┼──────────┼─────────────────────┤
│ 8    │ Mixolyd.│ G          │ D-D      │ Warm, contemplative │
│      │ (plag.) │            │          │                     │
└──────┴─────────┴────────────┴──────────┴─────────────────────┘

Hildegard's Modal Preferences:
- Mode 1 (Dorian authentic): Most common — used for Marian texts, visions,
  theological depth
- Mode 5 (Lydian authentic): Second most common — for joyful, celebratory texts
  (Trinity, angels, saints)
- Mode 3 (Phrygian): Rare but striking — for penitential or mystical intensity
- Plagal modes: Less common in Hildegard; she prefers wide, soaring melodies
  that require authentic (higher) range

Modal Selection by Liturgical Context:
- Marian feasts → Mode 1 (Dorian)
- Trinity, angels → Mode 5 (Lydian) or Mode 7 (Mixolydian)
- Penitential seasons (Lent) → Mode 4 (Phrygian plagal)
- General saints → Mode 1 or Mode 8
```

**预期结果：** 调式已识别（分析时）或已选择（创作时），终止音和特征音域已确定。

**失败处理：** 如果不确定，默认选择第 1 调式（多利安正格调式，终止音 D）。这是希尔德加德最常用的选择，提供宽广的旋律范围。

### 第 2 步：旋律轮廓和音域

建立希尔德加德风格特有的宽音域、翱翔式旋律轮廓。

```
Hildegard's Melodic Signature:
- WIDE RANGE: Regularly spans a 10th or more (often over an octave)
  - Contrast with typical Gregorian chant: 6th-octave range
  - Hildegard frequently leaps from low final note to high climax notes
- DRAMATIC LEAPS: Leaps of 5th, 6th, octave common — not stepwise motion
- CLIMACTIC ASCENTS: Melismas often ascend to the highest note on key theological terms
- ARCH CONTOURS: Opening ascent → sustained peak → descending resolution

Example from "O vis aeternitatis" (Mode 1, Dorian):
Text: "O vis ae-ter-ni-ta-tis"
     ↓   ↓    ↓    ↓  ↓  ↓
Contour: D - A - (D-E-F-G-A-C-D) [melisma on "aeternitatis"]
         Low start → Leap up 5th → Climactic melisma ascending to high D

Composing Melodic Contour:
1. Identify key theological/mystical words in text (e.g., "aeternitatis", "viriditas", "sanctus")
2. Reserve highest melodic climax for THE most important word
3. Begin low (near final note) to establish grounding
4. Build to climax in middle of phrase or on penultimate word
5. Resolve down to final note at phrase end

Hildegard's Melismatic Technique:
- Syllabic (1 note per syllable): Opening phrases, conjunctions, articles
- Neumatic (2-4 notes per syllable): Mid-phrase, build momentum
- Melismatic (5+ notes per syllable): Climactic words, theological depth
  - Example: "aeternitatis" may carry 15-30 notes across the word
```

**预期结果：** 旋律轮廓草图已完成，高潮点已确定，宽音域已规划（最少九度，最好十度到十二度），音节式/花腔式分配已确定。

**失败处理：** 如果旋律音域对演出者来说太宽，将高潮降低一个音级（例如从高 D 降到 C）。保持拱形形状但压缩音域。

### 第 3 步：歌词配曲——音节式和花腔式

将圣诗文本映射到旋律，采用适当的音节式、纽姆式和花腔式分配。

```
Hildegard's Text-Setting Principles:

SYLLABIC (1 note = 1 syllable):
- Use for: Opening words, conjunctions ("et", "in", "de"), articles
- Purpose: Establish text clarity, set rhythm
- Example: "O vis" (2 notes only, clear entry)

NEUMATIC (2-4 notes per syllable):
- Use for: Mid-phrase words, transitional words, building phrases
- Purpose: Add lyrical flow without overwhelming text
- Example: "de" (3-note neume), "ca" (2-note neume)

MELISMATIC (5-30+ notes per syllable):
- Use for: Theologically significant words, climactic moments, final syllables
- Purpose: Create mystical/ecstatic expression, allow voice to soar
- Example: "aeternitatis" (20-note melisma), "viriditas" (18-note melisma)
- Hildegard's melismas often follow scalar patterns (ascending/descending scales)
  with inserted leaps for intensity

Text-Setting Decision Tree:
1. Is this word theologically central? → MELISMATIC
2. Is this word structural (conjunction, article)? → SYLLABIC
3. Is this word transitional or building tension? → NEUMATIC
4. Where does the phrase need to breathe? → Insert syllabic section for clarity
```

**预期结果：** 文本完全映射到旋律，音节式/纽姆式/花腔式的选择已标注。关键神学术语获得花腔处理。文本在装饰尽管丰富的情况下仍可理解。

**失败处理：** 如果文本变得难以理解（花腔过多），将非核心词简化为音节式。仅在每个乐句中最重要的 1-2 个词上保留花腔。

### 第 4 步：纽姆记谱法（可选——追求真实性）

使用四线谱上的中世纪方形音符纽姆记谱（如需要历史准确性）。

```
Medieval Neumatic Notation Basics:

STAFF: 4 lines (not modern 5-line)
- Line 3 (from bottom) = Final note (D, E, F, or G depending on mode)
- C-clef or F-clef indicates pitch reference

NEUME SHAPES (square notation):
- PUNCTUM: Single square note (1 syllable, 1 pitch)
- VIRGA: Single note with ascending tail (emphasis)
- PODATUS (PES): Two notes ascending
- CLIVIS: Two notes descending
- SCANDICUS: Three notes ascending
- CLIMACUS: Three notes descending
- PORRECTUS: Down-up motion
- TORCULUS: Up-down motion

Modern Alternative:
- Use modern 5-line staff with stemless noteheads
- Group notes with slurs to indicate neumes
- Mark text syllables clearly under each neume group
```

**预期结果：**（可选）如果用户要求历史真实性，提供纽姆记谱草图。现代五线谱记谱对演出准备同样可接受。

**失败处理：** 如果纽姆记谱过于复杂，提供带有清晰乐句标记的现代五线谱记谱。希尔德加德的音乐可以从现代记谱演出而不失其本质特征。

### 第 5 步：礼仪背景和演出注释

将作品或分析置于礼仪用途中，并提供演出指导。

```
Liturgical Context by Form:

ANTIPHON:
- Use: Before and after psalms in Divine Office (Lauds, Vespers, etc.)
- Timing: Sung once before psalm, repeated after psalm
- Performers: Choir or solo cantor

SEQUENCE:
- Use: After the Alleluia before the Gospel (Mass)
- Timing: Feast days, major liturgical celebrations
- Structure: Paired stanzas (1a-1b, 2a-2b, etc.) — same melody for each pair

RESPONSORY:
- Use: After readings in Matins (early morning Office)
- Structure: Solo verse → Choir response → Doxology
- Performers: Trained cantor for verses (melismatic), full choir for response

Performance Guidance:
TEMPO:
- Slow to moderate — allow melismas to unfold without rushing
- Approximately ♩= 60-72 for modern performance

DYNAMICS:
- Subtle swells on climactic melismas
- No strong accents — smooth, flowing line

PRONUNCIATION:
- Ecclesiastical Latin (Italian-style: "ae" = "ay", "ti" = "tee")
- OR restored classical Latin (for historically informed performance)

ENSEMBLE:
- Women's voices (Hildegard's nuns sang these)
- Unaccompanied (a cappella) OR drone (sustained low note on final)
```

**预期结果：** 礼仪用途已确定（何时/何处演唱该作品），演出注释已提供（速度、力度、发音），历史背景已阐明。

**失败处理：** 如果礼仪背景不明确，仅关注演出注释。希尔德加德的音乐可以在音乐会场景中演出，不需要严格遵守礼仪规范。

## 验证清单

- [ ] 调式已识别或已选择（1-8，带终止音）
- [ ] 旋律音域至少跨越九度（最好十度到十二度）
- [ ] 关键神学术语获得花腔处理
- [ ] 高潮点放置在文本中最重要的词上
- [ ] 乐句从低处（接近终止音）开始并在终止音上结束
- [ ] 文本在装饰丰富的情况下仍可理解（不是每个词都过度花腔化）
- [ ] 礼仪背景已标注（对唱/续唱/应答）
- [ ] 演出注释已提供（速度、力度、发音）
- [ ] 如分析：引用了与希尔德加德真实作品的比较

## 常见问题

1. **花腔过多**：在每个音节上添加花腔会模糊文本。留给关键词使用
2. **忽视调式**：希尔德加德遵守调式边界。不要漂移到无关的音高
3. **现代节奏**：中世纪圣咏是非节拍的。避免强加 4/4 拍号
4. **音域狭窄**：希尔德加德的标志是宽音域。少于九度不是希尔德加德风格
5. **高潮过早**：将最高音放得太早，后面就没有构建空间。留给关键词
6. **单调段落**：没有旋律趣味的长音节式段落听起来平淡。将音节式与纽姆式混合使用
7. **忽视文本含义**：旋律必须服务于神学含义。随意放置花腔是反希尔德加德式的

## 相关技能

- `practice-viriditas` — 希尔德加德的音乐是活力（viriditas，生命绿力）的表达
- `consult-natural-history` — 许多圣咏引用了《自然学》（*Physica*）中的植物、矿石和元素
- `assess-holistic-health` — 音乐作为希尔德加德整体系统中的治疗方式
- `meditate`（esoteric 领域） — 演唱希尔德加德的音乐可作为冥想练习
- `formulate-herbal-remedy` — 一些圣咏引用了具有治疗特性的草药
