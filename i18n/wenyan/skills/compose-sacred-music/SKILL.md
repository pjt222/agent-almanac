---
name: compose-sacred-music
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Compose or analyze sacred music in Hildegard von Bingen's distinctive modal
  style. Covers modal selection, melodic contour (wide-range melodies),
  text-setting (syllabic and melismatic), neumatic notation, and liturgical
  context for antiphons, sequences, and responsories. Use when composing a
  new piece in Hildegardian style, analyzing an existing chant for structure
  and mode, researching medieval modal music, preparing to perform or teach
  Hildegard's music, or setting Latin sacred texts.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: hildegard
  complexity: advanced
  language: natural
  tags: hildegard, sacred-music, chant, gregorian, modal, symphonia, antiphon, sequence
---

# 製聖樂

依賓根之希爾德嘉德獨特之風製或析聖樂，循其 *Symphonia harmoniae caelestium revelationum* 與調式作曲之理。

## 用時

- 欲製新聖樂於希爾德嘉德之風
- 需析現存希爾德嘉德之歌之構、調、詞設
- 研中世調式之樂與紐姆之記
- 欲解希爾德嘉德曲之禮境
- 備演或教希爾德嘉德之樂
- 需設拉丁聖詞之指

## 入

- **必**：旨（製新曲或析存曲）
- **製必**：聖詞（拉丁為上，英可為學）
- **製必**：禮境（對歌、繼歌、應歌、頌）
- **析必**：所析之希爾德嘉德之曲名（如「O vis aeternitatis」）
- **可選**：節或禮季（影調擇）
- **可選**：演者之階（簡音節或繁華彩）
- **可選**：調之好（若製）

## 法

### 第一步：擇調（製）或識調（析）

擇或識御旋律之禮調。

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

**得：** 調已識（析）或擇（製），終音與特範已立。

**敗則：** 不確則默擇第一調（多利安本調，終於 D）。乃希爾德嘉德最常之擇且供廣旋律之範。

### 第二步：旋律之輪廓與範

立希爾德嘉德風之廣範翱翔之輪廓。

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

**得：** 旋律輪廓已略，峰點已識，廣範已謀（至少九度，宜十至十二），音節與華彩之分已定。

**敗則：** 若範過廣於演者，降峰一步（如自高 D 至 C）。留弧之形而縮其範。

### 第三步：詞設——音節與華彩

以合宜之音節、紐姆、華彩之分映聖詞於旋律。

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

Example Analysis: "O vis aeternitatis" (Antiphon for Trinity)
O        → Syllabic (1 note) — opening invocation
vis      → Syllabic (1-2 notes) — short, clear
aeter-   → Neumatic (3-4 notes) — building
-ni-     → Neumatic (2-3 notes) — continuing
-ta-     → MELISMATIC (20+ notes) — CLIMAX on theological term
-tis     → Neumatic-syllabic resolution (3-4 notes) → final note D

Liturgical Form Conventions:
ANTIPHON (short, before/after psalm):
- Simple, moderate melisma, clear final cadence
- Example: "O vis aeternitatis" — 1 phrase, moderate range

SEQUENCE (long, paired stanzas):
- Each stanza pair shares same melody
- More elaborate melismas than antiphons
- Example: "O viridissima virga" — multi-stanza, extended form

RESPONSORY (call-and-response structure):
- Soloist sings verse (melismatic), choir responds (simpler)
- Most virtuosic of Hildegard's forms
- Example: "O ignis Spiritus" — highly melismatic solo sections
```

**得：** 詞全映於旋律，音節/紐姆/華彩之擇已標。關神學之詞受華彩之待。詞雖飾仍可聞。

**敗則：** 若詞不可聞（華彩過），簡非要之詞為音節。只留華彩於每句之一二最要之詞。

### 第四步：紐姆之記（選——為真）

用中世四線譜上方形紐姆記之（若求史之真）。

```
Medieval Neumatic Notation Basics:

STAFF: 4 lines (not modern 5-line)
- Line 3 (from bottom) = Final note (D, E, F, or G depending on mode)
- C-clef or F-clef indicates pitch reference

NEUME SHAPES (square notation):
- PUNCTUM: Single square note (1 syllable, 1 pitch)
- VIRGA: Single note with ascending tail (emphasis)
- PODATUS (PES): Two notes ascending (◡ shape)
- CLIVIS: Two notes descending (⌢ shape)
- SCANDICUS: Three notes ascending
- CLIMACUS: Three notes descending
- PORRECTUS: Down-up motion (⌣ shape)
- TORCULUS: Up-down motion (◡⌣ shape)

Notation Example for "O vis aeternitatis":
(Simplified — actual notation would be on 4-line staff with square neumes)

O     vis   ae-ter-ni-ta-----------------tis
│     │     │  │   │  └── Extended melisma ──┘
Punctum Podatus Scandicus → Climacus chain → Virga (final D)

Modern Alternative:
- Use modern 5-line staff with stemless noteheads
- Group notes with slurs to indicate neumes
- Mark text syllables clearly under each neume group
```

**得：**（選）紐姆記之略若用者求史真。現代五線之記可受以備演。

**敗則：** 若紐姆過繁，供現代之記附清之句標。希爾德嘉德之樂可由現代記演而無失本質。

### 第五步：禮境與演注

置作或析於禮用且供演之指。

```
Liturgical Context by Form:

ANTIPHON:
- Use: Before and after psalms in Divine Office (Lauds, Vespers, etc.)
- Timing: Sung once before psalm, repeated after psalm
- Performers: Choir or solo cantor
- Hildegard examples: "O vis aeternitatis", "O quam mirabilis"

SEQUENCE:
- Use: After the Alleluia before the Gospel (Mass)
- Timing: Feast days, major liturgical celebrations
- Structure: Paired stanzas (1a-1b, 2a-2b, etc.) — same melody for each pair
- Hildegard examples: "O viridissima virga" (for Virgin Mary)

RESPONSORY:
- Use: After readings in Matins (early morning Office)
- Structure: Solo verse → Choir response → Doxology
- Performers: Trained cantor for verses (melismatic), full choir for response
- Hildegard examples: "O ignis Spiritus Paracliti"

HYMN (rare in Hildegard):
- Use: Specific hours of Divine Office
- Structure: Strophic (same melody for each stanza)
- Hildegard composed few hymns; focused on antiphons, sequences, responsories

Performance Guidance:
TEMPO:
- Slow to moderate — allow melismas to unfold without rushing
- Hildegard's music is contemplative, not rhythmically driven
- Approximately ♩= 60-72 for modern performance

DYNAMICS:
- Subtle swells on climactic melismas
- No strong accents — smooth, flowing line
- Natural decay at phrase ends (not clipped)

ORNAMENTATION:
- Historical practice: Small ornaments (liquescence) on certain neumes
- Modern practice: Minimal ornamentation; let the written melisma suffice
- Breath marks: Marked by scribe or singer at natural phrase breaks

PRONUNCIATION:
- Ecclesiastical Latin (Italian-style: "ae" = "ay", "ti" = "tee")
- OR restored classical Latin (for historically informed performance)
- Vowels pure and sustained; consonants clear but not harsh

ENSEMBLE:
- Women's voices (Hildegard's nuns sang these)
- Unaccompanied (a cappella) OR drone (sustained low note on final)
- Modern performances sometimes add harp or medieval fiddle (not historical
  for Hildegard's convent, but aesthetically compatible)
```

**得：** 禮用已識（何時何處唱），演之注已供（速、強弱、發音），史境已明。

**敗則：** 若禮境不明，專於演之注。希爾德嘉德之樂可於音樂會中演而無嚴守禮。

## 驗

- [ ] 調已識或擇（一至八，附終音）
- [ ] 旋律範至少九度（宜十至十二）
- [ ] 關神學之詞受華彩
- [ ] 峰置於詞中最要
- [ ] 句始低（近終）而終於終音
- [ ] 詞雖飾仍可聞（非每字皆華彩）
- [ ] 禮境已注（對歌/繼歌/應歌）
- [ ] 演之注已供（速、強弱、發音）
- [ ] 若析：引希爾德嘉德真作以比

## 陷

1. **華彩過**：每音節加華彩掩詞。留於要字
2. **忽調**：希爾德嘉德敬調界。勿遊於無關之音
3. **現代之律**：中世歌乃非律。勿加 4/4 之拍
4. **範窄**：希爾德嘉德之簽為廣範。少於九度非其風
5. **峰早**：最高音置太早，後無所升。留於要字
6. **單調之段**：長音節無旋律之興則平。雜以紐姆
7. **忽詞義**：旋律必事神學之義。隨意置華彩非希爾德嘉德之風

## 參

- `practice-viriditas` — 希爾德嘉德之樂乃 viriditas（綠生之力）之表
- `consult-natural-history` — 諸歌引 *Physica* 之草、石、元
- `assess-holistic-health` — 樂為希爾德嘉德整健系之癒式
- `meditate`（esoteric 域） — 唱希爾德嘉德之樂可為冥之修
- `formulate-herbal-remedy` — 諸歌引有癒之草
