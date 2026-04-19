---
name: compose-sacred-music
locale: wenyan-lite
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

# 作聖樂

於 Hildegard von Bingen 獨特之風中作或析聖樂，循其 *Symphonia harmoniae caelestium revelationum* 與調式作曲之原則。

## 適用時機

- 欲以 Hildegard 風作新聖樂
- 需析既有之 Hildegard 聖歌之結構、調式、文配
- 研中世紀調式樂與聖歌記譜
- 欲解 Hildegard 作品之禮儀脈絡
- 備演或教 Hildegard 之樂
- 需配拉丁聖文之指引

## 輸入

- **必要**：目的（作新曲或析既有）
- **作曲必要**：聖文（拉丁為佳，研究可英）
- **作曲必要**：禮儀脈絡（對唱、續抒、應答、讚歌）
- **析曲必要**：擬析之 Hildegard 曲名（如「O vis aeternitatis」）
- **選擇性**：節日或禮儀季（影響調式之擇）
- **選擇性**：演者經驗層級（簡純音節 vs. 華麗花腔）
- **選擇性**：調式偏好（若作曲）

## 步驟

### 步驟一：擇調式（作曲）或辨（析曲）

擇或辨主宰旋律結構之禮儀調式。

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

**預期：** 調式已辨（若析）或擇（若作），終結音與特徵音域已立。

**失敗時：** 若不確，預設 Mode 1（Dorian authentic、終於 D）。此為 Hildegard 最常擇之調，供廣之旋律音域。

### 步驟二：旋律輪廓與音域

立 Hildegard 風特有之寬域、翱翔旋律輪廓。

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

**預期：** 旋律輪廓已繪，高潮點已辨，寬域已規劃（至少九度，十度至十二度為佳），音節／花腔分布已定。

**失敗時：** 若旋律域對演者過寬，降高潮一音（如由高 D 降至 C）。保拱形而壓域。

### 步驟三：文配——音節與花腔

將聖文配旋律以適當之音節、紐姆、花腔分布。

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

**預期：** 文已全配旋律，音節／紐姆／花腔之擇已標。關鍵神學詞受花腔處理。文於裝飾中仍可解。

**失敗時：** 若文因花腔過多而不可解，將非必要詞簡為音節。花腔僅留於每句 1-2 最要之詞。

### 步驟四：紐姆記譜（選擇性——求真）

以中世紀方形紐姆於四線譜記譜（若求歷史真）。

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

**預期：**（選擇性）若用戶求歷史真，供紐姆記譜之草。演出備可用現代記譜。

**失敗時：** 若紐姆記譜過繁，供現代五線譜附明朗之分句記號。Hildegard 之樂可自現代譜演而不失要。

### 步驟五：禮儀脈絡與演出指引

將作或析置於禮儀用途中並供演出指引。

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

**預期：** 禮儀用途已辨（何時何處唱），演出之註已供（速度、強弱、發音），歷史脈絡已明。

**失敗時：** 若禮儀脈絡不明，專於演出之註。Hildegard 之樂可於音樂會演而不必嚴守禮儀。

## 驗證

- [ ] 調式已辨或擇（1-8，附終結音）
- [ ] 旋律域至少九度（十度至十二度為佳）
- [ ] 關鍵神學詞受花腔處理
- [ ] 高潮置於文中最要之詞
- [ ] 句始於低（近終結音）而終於終結音
- [ ] 文於裝飾中仍可解（非每詞皆花腔）
- [ ] 禮儀脈絡已記（對唱／續抒／應答）
- [ ] 演出之註已供（速度、強弱、發音）
- [ ] 若析曲：與 Hildegard 真作之比較已引

## 常見陷阱

1. **花腔過多**：每音節皆加花腔則遮文。留於要詞
2. **忽調式**：Hildegard 守調式邊界。勿漂至無關音高
3. **現代節拍**：中世紀聖歌非節拍性。勿強加 4/4 拍號
4. **音域過窄**：Hildegard 之標誌乃**寬**域。少於九度非 Hildegard 風
5. **高潮過早**：過早置最高音令後無可昇。留於關鍵詞
6. **單調段落**：長音節段落無旋律趣則平。音節與紐姆相間
7. **忽文義**：旋律須服神學義。隨意之花腔位置反 Hildegard

## 相關技能

- `practice-viriditas` — Hildegard 之樂乃 viriditas（綠生之力）之表
- `consult-natural-history` — 諸歌引 *Physica* 之草木、石、元素
- `assess-holistic-health` — 樂為 Hildegard 整體系統中之療癒模態
- `meditate`（esoteric 域） — 唱 Hildegard 之樂可為冥想之修
- `formulate-herbal-remedy` — 諸歌引有療效之草藥
