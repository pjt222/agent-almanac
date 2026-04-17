---
name: compose-sacred-music
description: >
  ヒルデガルト・フォン・ビンゲンの独特な旋法スタイルで聖歌を作曲または分析する。
  旋法選択、旋律輪郭（広音域の旋律）、テキスト・セッティング（シラビックと
  メリスマティック）、ネウマ記譜法、アンティフォナ・セクエンツィア・レスポンソリウム
  の典礼的文脈をカバーする。ヒルデガルト様式で新作を作曲する時、既存の聖歌の構造と
  旋法を分析する時、中世の旋法音楽を研究する時、ヒルデガルトの音楽の演奏や教育を
  準備する時、ラテン語の聖なるテキストに旋律を付ける時に使用する。
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: hildegard
  complexity: advanced
  language: natural
  tags: hildegard, sacred-music, chant, gregorian, modal, symphonia, antiphon, sequence
  locale: ja
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# 聖歌の作曲

ヒルデガルト・フォン・ビンゲンの独特なスタイルで聖歌を作曲または分析する。彼女の *Symphonia harmoniae caelestium revelationum*（天上の啓示の調和）と旋法作曲の原則に従う。

## 使用タイミング

- ヒルデガルト様式で新しい聖歌を作曲したい時
- 既存のヒルデガルト聖歌の構造、旋法、テキスト・セッティングを分析する必要がある時
- 中世の旋法音楽とネウマ記譜法を研究している時
- ヒルデガルトの楽曲の典礼的文脈を理解したい時
- ヒルデガルトの音楽の演奏や教育を準備している時
- ラテン語の聖なるテキストへの旋律付けについてのガイダンスが必要な時

## 入力

- **必須**: 目的（新作の作曲 または 既存作品の分析）
- **作曲に必須**: 聖なるテキスト（ラテン語が望ましい、研究用には英語も可）
- **作曲に必須**: 典礼的文脈（アンティフォナ、セクエンツィア、レスポンソリウム、賛歌）
- **分析に必須**: 分析するヒルデガルト作品のタイトル（例："O vis aeternitatis"）
- **任意**: 祝日または典礼暦の季節（旋法選択に影響）
- **任意**: 演奏者の経験レベル（簡単なシラビック vs 技巧的なメリスマティック）
- **任意**: 旋法の希望（作曲の場合）

## 手順

### ステップ1: 旋法の選択（作曲時）または同定（分析時）

旋律構造を支配する典礼旋法を選択または同定する。

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

**期待結果:** 旋法が同定（分析時）または選択（作曲時）され、終止音と特徴的な音域が確立される。

**失敗時:** 不確かな場合、第1旋法（ドリア正格、終止音D）をデフォルトとする。これはヒルデガルトの最も頻繁な選択であり、広い旋律的音域を提供する。

### ステップ2: 旋律輪郭と音域

ヒルデガルトのスタイルに特徴的な、広音域で飛翔する旋律輪郭を確立する。

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

**期待結果:** クライマックスポイントが特定され、広い音域が計画され（最低9度、できれば10度〜12度）、シラビック/メリスマティックの配分が決定された旋律輪郭のスケッチ。

**失敗時:** 旋律の音域が演奏者にとって広すぎると感じる場合、クライマックスを1音下げる（例：高いDからCへ）。アーチ形は維持するが音域を圧縮する。

### ステップ3: テキスト・セッティング — シラビックとメリスマティック

聖なるテキストを旋律にマッピングし、適切なシラビック、ネウマティック、メリスマティックの配分を行う。

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

**期待結果:** テキストがシラビック/ネウマティック/メリスマティックの選択とともに旋律に完全にマッピングされる。重要な神学用語がメリスマティック処理を受ける。装飾にもかかわらずテキストが理解可能。

**失敗時:** テキストが不明瞭になる場合（メリスマが多すぎる）、重要でない語をシラビックに簡略化する。1フレーズあたり最も重要な1〜2語のみにメリスマを保持する。

### ステップ4: ネウマ記譜法（任意 — 本格性を求める場合）

中世の四角音符ネウマを4線譜上に記譜する（歴史的正確性が求められる場合）。

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

**期待結果:**（任意）ユーザーが歴史的本格性を求める場合にネウマ記譜法のスケッチが提供される。演奏準備には近代的な五線譜も許容。

**失敗時:** ネウマ記譜法が複雑すぎる場合、明確なフレージングマークを付けた近代的な五線譜で提供する。ヒルデガルトの音楽は近代的な記譜法から演奏しても本質的な特徴を失わない。

### ステップ5: 典礼的文脈と演奏ノート

作品を典礼的使用の中に位置づけ、演奏のガイダンスを提供する。

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

**期待結果:** 典礼的使用が特定され（いつ・どこでその曲が歌われるか）、演奏ノートが提供され（テンポ、ダイナミクス、発音）、歴史的文脈が明確化される。

**失敗時:** 典礼的文脈が不明確な場合、演奏ノートのみに焦点を当てる。ヒルデガルトの音楽は厳格な典礼的遵守なしにコンサート設定でも演奏できる。

## バリデーション

- [ ] 旋法が同定または選択されている（1〜8、終止音付き）
- [ ] 旋律の音域が少なくとも9度に及ぶ（できれば10度〜12度）
- [ ] 重要な神学用語がメリスマティック処理を受けている
- [ ] クライマックスがテキスト中の最も重要な語に配置されている
- [ ] フレーズが低い音（終止音付近）で始まり終止音で終わる
- [ ] 装飾にもかかわらずテキストが理解可能（すべての語にメリスマを付けすぎていない）
- [ ] 典礼的文脈が記載されている（アンティフォナ/セクエンツィア/レスポンソリウム）
- [ ] 演奏ノートが提供されている（テンポ、ダイナミクス、発音）
- [ ] 分析の場合：ヒルデガルトの真作との比較が引用されている

## よくある落とし穴

1. **過剰なメリスマ**: すべての音節にメリスマを付けるとテキストが不明瞭になる。重要な語にのみ使用する
2. **旋法の無視**: ヒルデガルトは旋法の境界を尊重する。無関係な音高に逸脱しない
3. **近代的リズム**: 中世の聖歌は非拍節的。4/4拍子を押し付けない
4. **狭い音域**: ヒルデガルトの特徴は広い音域。9度未満はヒルデガルト的ではない
5. **早すぎるクライマックス**: 最高音を早く置きすぎると盛り上がる余地がなくなる。重要な語のために取っておく
6. **単調なセクション**: 旋律的な変化のない長いシラビックセクションは平板に聞こえる。シラビックとネウマティックを混ぜる
7. **テキストの意味の無視**: 旋律は神学的意味に奉仕しなければならない。無作為なメリスマの配置はヒルデガルト的ではない

## 関連スキル

- `practice-viriditas` -- ヒルデガルトの音楽はヴィリディタス（緑化する生命力）の表現
- `consult-natural-history` -- 多くの聖歌は *Physica* の植物、鉱物、元素を参照する
- `assess-holistic-health` -- ヒルデガルトの全体論的システムにおける癒しの手段としての音楽
- `meditate`（エソテリックドメイン）-- ヒルデガルトの音楽を歌うことは瞑想的実践となりうる
- `formulate-herbal-remedy` -- 一部の聖歌は薬効のあるハーブを参照する
