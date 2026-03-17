---
name: compose-sacred-music
description: >
  Sakrale Musik im unverwechselbaren modalen Stil Hildegard von Bingens
  komponieren oder analysieren. Umfasst Moduswahl, Melodiekonturen
  (weitraeumige Melodien), Textunterlegung (syllabisch und melismatisch),
  neumatische Notation und liturgischen Kontext fuer Antiphonen, Sequenzen
  und Responsorien. Verwenden beim Komponieren eines neuen Stuecks im
  hildegardischen Stil, beim Analysieren eines bestehenden Gesangs nach
  Struktur und Modus, beim Erforschen mittelalterlicher Modalmusik, beim
  Vorbereiten von Auffuehrung oder Lehre von Hildegards Musik oder beim
  Vertonen lateinischer sakraler Texte.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: hildegard
  complexity: advanced
  language: natural
  tags: hildegard, sacred-music, chant, gregorian, modal, symphonia, antiphon, sequence
  locale: de
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Sakrale Musik komponieren

Sakrale Musik im unverwechselbaren Stil Hildegard von Bingens komponieren oder analysieren, gemaess ihrer *Symphonia harmoniae caelestium revelationum* und modalen Kompositionsprinzipien.

## Wann verwenden

- Ein neues Stueck sakraler Musik im hildegardischen Stil komponieren
- Einen bestehenden Hildegard-Gesang nach Struktur, Modus und Textunterlegung analysieren
- Mittelalterliche Modalmusik und neumatische Notation erforschen
- Den liturgischen Kontext von Hildegards Kompositionen verstehen
- Auffuehrung oder Lehre von Hildegards Musik vorbereiten
- Anleitung zur Textunterlegung fuer lateinische sakrale Texte benoetigen

## Eingaben

- **Erforderlich**: Zweck (neues Stueck komponieren ODER bestehendes Stueck analysieren)
- **Erforderlich fuer Komposition**: Sakraler Text (Latein bevorzugt, Englisch fuer Studienzwecke akzeptabel)
- **Erforderlich fuer Komposition**: Liturgischer Kontext (Antiphon, Sequenz, Responsorium, Hymnus)
- **Erforderlich fuer Analyse**: Titel des zu analysierenden Hildegard-Stuecks (z.B. "O vis aeternitatis")
- **Optional**: Festtag oder liturgische Jahreszeit (beeinflusst die Moduswahl)
- **Optional**: Erfahrungsstufe der vorgesehenen Ausfuehrenden (einfach syllabisch vs. virtuos melismatisch)
- **Optional**: Moduspraeferenz (bei Komposition)

## Vorgehensweise

### Schritt 1: Moduswahl (bei Komposition) oder Modusbestimmung (bei Analyse)

Den liturgischen Modus waehlen oder bestimmen, der die melodische Struktur bestimmt.

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

**Erwartet:** Modus bestimmt (bei Analyse) oder gewaehlt (bei Komposition) mit festgelegtem Schlusston und charakteristischem Ambitus.

**Bei Fehler:** Bei Unsicherheit standardmaessig Modus 1 (Dorisch authentisch, Finalis auf D) waehlen. Dies ist Hildegards haeufigste Wahl und bietet einen weiten melodischen Ambitus.

### Schritt 2: Melodiekontur und Ambitus

Die unverwechselbare weitraeumige, aufsteigende Melodiekontur im Stil Hildegards festlegen.

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

**Erwartet:** Melodiekontur skizziert mit identifiziertem Hoehepunkt, weiter Ambitus geplant (mindestens None, vorzugsweise Dezime bis Duodezime), und syllabisch/melismatische Verteilung festgelegt.

**Bei Fehler:** Wenn der melodische Ambitus fuer die Ausfuehrenden zu weit erscheint, den Hoehepunkt um eine Stufe reduzieren (z.B. von hohem D auf C). Die Bogenform beibehalten, aber den Ambitus komprimieren.

### Schritt 3: Textunterlegung — Syllabisch und Melismatisch

Den sakralen Text mit angemessener syllabischer, neumatischer und melismatischer Verteilung auf die Melodie abbilden.

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

**Erwartet:** Text vollstaendig auf Melodie abgebildet mit markierten syllabischen/neumatischen/melismatischen Entscheidungen. Theologisch zentrale Begriffe erhalten melismatische Behandlung. Der Text bleibt trotz Verzierung verstaendlich.

**Bei Fehler:** Wenn der Text unverstaendlich wird (zu viel Melismatik), nicht-wesentliche Woerter auf syllabisch vereinfachen. Melismatik NUR bei 1-2 der wichtigsten Woerter pro Phrase beibehalten.

### Schritt 4: Neumatische Notation (Optional — fuer Authentizitaet)

Mit mittelalterlichen Quadratneumen auf einem 4-Linien-System notieren (wenn historische Genauigkeit gewuenscht).

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

**Erwartet:** (Optional) Neumatische Notationsskizze bereitgestellt, wenn historische Authentizitaet gewuenscht. Moderne Notation ist fuer die Auffuehrungsvorbereitung akzeptabel.

**Bei Fehler:** Wenn die neumatische Notation zu komplex ist, moderne Notation mit klaren Phrasierungszeichen bereitstellen. Hildegards Musik kann von moderner Notation aufgefuehrt werden, ohne den wesentlichen Charakter zu verlieren.

### Schritt 5: Liturgischer Kontext und Auffuehrungshinweise

Die Komposition oder Analyse im liturgischen Gebrauch verorten und Auffuehrungsanleitung geben.

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

**Erwartet:** Liturgischer Gebrauch identifiziert (wann/wo das Stueck gesungen wird), Auffuehrungshinweise bereitgestellt (Tempo, Dynamik, Aussprache) und historischer Kontext geklaert.

**Bei Fehler:** Wenn der liturgische Kontext unklar ist, nur auf Auffuehrungshinweise konzentrieren. Hildegards Musik kann in Konzertumgebungen ohne strenge liturgische Einhaltung aufgefuehrt werden.

## Validierung

- [ ] Modus bestimmt oder gewaehlt (1-8, mit Schlusston)
- [ ] Melodischer Ambitus umfasst mindestens eine None (vorzugsweise Dezime bis Duodezime)
- [ ] Theologisch zentrale Begriffe erhalten melismatische Behandlung
- [ ] Hoehepunkt auf dem wichtigsten Wort im Text platziert
- [ ] Phrase beginnt tief (nahe der Finalis) und endet auf dem Schlusston
- [ ] Text trotz Verzierung verstaendlich (nicht jede Silbe uebermaessig melismatisch)
- [ ] Liturgischer Kontext vermerkt (Antiphon/Sequenz/Responsorium)
- [ ] Auffuehrungshinweise bereitgestellt (Tempo, Dynamik, Aussprache)
- [ ] Bei Analyse: Vergleich mit authentischen Werken Hildegards zitiert

## Haeufige Stolperfallen

1. **Uebermaessige Melismatik**: Melismen auf jeder Silbe verdecken den Text. Fuer Schluesselwoerter reservieren
2. **Modus ignorieren**: Hildegard respektiert modale Grenzen. Nicht zu unverwandten Tonhoehen abdriften
3. **Moderner Rhythmus**: Mittelalterlicher Gesang ist nicht-metrisch. Keine 4/4-Taktarten aufzwingen
4. **Enger Ambitus**: Hildegards Markenzeichen ist ein WEITER Ambitus. Weniger als eine None ist nicht hildegardisch
5. **Verfruehter Hoehepunkt**: Den hoechsten Ton zu frueh zu setzen laesst keinen Raum zum Aufbauen. Fuer das Schluesselwort aufsparen
6. **Monotone Abschnitte**: Lange syllabische Abschnitte ohne melodisches Interesse klingen flach. Syllabisch mit neumatisch mischen
7. **Textbedeutung ignorieren**: Die Melodie muss der theologischen Bedeutung dienen. Zufaellige Melismenplatzierung ist anti-hildegardisch

## Verwandte Skills

- `practice-viriditas` — Hildegards Musik ist Ausdruck der Viriditas (gruenende Lebenskraft)
- `consult-natural-history` — Viele Gesaenge referenzieren Pflanzen, Steine, Elemente aus der *Physica*
- `assess-holistic-health` — Musik als Heilmodalitaet in Hildegards ganzheitlichem System
- `meditate` (Domaene: esoteric) — Das Singen von Hildegards Musik kann meditative Praxis sein
- `formulate-herbal-remedy` — Einige Gesaenge referenzieren Kraeuter mit Heileigenschaften
