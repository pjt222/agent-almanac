---
name: compose-sacred-music
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

# Compose Sacred Music

Compose or analyze sacred music in Hildegard von Bingen's distinctive style, following her *Symphonia harmoniae caelestium revelationum* and modal composition principles.

## When to Use

- You want to compose a new piece of sacred music in Hildegardian style
- You need to analyze an existing Hildegard chant for structure, mode, and text-setting
- You are researching medieval modal music and neumatic notation
- You want to understand the liturgical context of Hildegard's compositions
- You are preparing to perform or teach Hildegard's music
- You need guidance on text-setting for Latin sacred texts

## Inputs

- **Required**: Purpose (compose new piece OR analyze existing piece)
- **Required for composition**: Sacred text (Latin preferred, English acceptable for study)
- **Required for composition**: Liturgical context (antiphon, sequence, responsory, hymn)
- **Required for analysis**: Title of Hildegard piece to analyze (e.g., "O vis aeternitatis")
- **Optional**: Feast day or liturgical season (influences modal choice)
- **Optional**: Intended performer experience level (simple syllabic vs. virtuosic melismatic)
- **Optional**: Mode preference (if composing)

## Procedure

### Step 1: Modal Selection (if composing) or Identification (if analyzing)

Choose or identify the liturgical mode that governs the melodic structure.

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

**Expected:** Mode identified (if analyzing) or selected (if composing) with final note and characteristic range established.

**On failure:** If uncertain, default to Mode 1 (Dorian authentic, final on D). This is Hildegard's most frequent choice and offers wide melodic range.

### Step 2: Melodic Contour and Range

Establish the distinctive wide-range, soaring melodic contour characteristic of Hildegard's style.

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

**Expected:** Melodic contour sketched with identified climax point, wide range planned (minimum 9th, preferably 10th-12th), and syllabic/melismatic distribution determined.

**On failure:** If melodic range feels too wide for performers, reduce climax by one step (e.g., from high D to C). Maintain the arch shape but compress the range.

### Step 3: Text-Setting — Syllabic and Melismatic

Map the sacred text to melody with appropriate syllabic, neumatic, and melismatic distribution.

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

**Expected:** Text fully mapped to melody with syllabic/neumatic/melismatic choices marked. Key theological terms receive melismatic treatment. Text remains intelligible despite ornamentation.

**On failure:** If text becomes unintelligible (too much melisma), simplify non-essential words to syllabic. Retain melisma ONLY on 1-2 most important words per phrase.

### Step 4: Neumatic Notation (Optional — for authenticity)

Notate using medieval square-note neumes on a 4-line staff (if desired for historical accuracy).

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

**Expected:** (Optional) Neumatic notation sketch provided if user requests historical authenticity. Modern staff notation acceptable for performance preparation.

**On failure:** If neumatic notation is too complex, provide modern staff notation with clear phrasing marks. Hildegard's music can be performed from modern notation without loss of essential character.

### Step 5: Liturgical Context and Performance Notes

Situate the composition or analysis within liturgical use and provide performance guidance.

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

**Expected:** Liturgical use identified (when/where the piece is sung), performance notes provided (tempo, dynamics, pronunciation), and historical context clarified.

**On failure:** If liturgical context is unclear, focus on performance notes only. Hildegard's music can be performed in concert settings without strict liturgical adherence.

## Validation Checklist

- [ ] Mode identified or selected (1-8, with final note)
- [ ] Melodic range spans at least a 9th (preferably 10th-12th)
- [ ] Key theological terms receive melismatic treatment
- [ ] Climax placed on most important word in text
- [ ] Phrase begins low (near final) and ends on final note
- [ ] Text intelligible despite ornamentation (not over-melismatic on every word)
- [ ] Liturgical context noted (antiphon/sequence/responsory)
- [ ] Performance notes provided (tempo, dynamics, pronunciation)
- [ ] If analyzing: Comparison to Hildegard's authentic works cited

## Common Pitfalls

1. **Over-melisma**: Adding melismas to every syllable obscures text. Reserve for key words
2. **Ignoring Mode**: Hildegard respects modal boundaries. Don't drift to unrelated pitches
3. **Modern Rhythm**: Medieval chant is non-metrical. Avoid imposing 4/4 time signatures
4. **Narrow Range**: Hildegard's signature is WIDE range. Less than a 9th is not Hildegardian
5. **Premature Climax**: Placing highest note too early leaves nowhere to build. Save for key word
6. **Monotone Sections**: Long syllabic sections without melodic interest sound flat. Mix syllabic with neumatic
7. **Ignoring Text Meaning**: Melody must serve theological meaning. Random melisma placement is anti-Hildegardian

## Related Skills

- `practice-viriditas` — Hildegard's music is an expression of viriditas (greening life force)
- `consult-natural-history` — Many chants reference plants, stones, elements from *Physica*
- `assess-holistic-health` — Music as healing modality in Hildegard's holistic system
- `meditate` (esoteric domain) — Singing Hildegard's music can be meditative practice
- `formulate-herbal-remedy` — Some chants reference herbs with healing properties
