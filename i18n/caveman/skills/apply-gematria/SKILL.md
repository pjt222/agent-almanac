---
name: apply-gematria
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Compute and analyze gematria (Hebrew numerical values) using standard,
  ordinal, and reduced methods. Covers word-to-number conversion,
  isopsephy comparisons, and interpretive frameworks. Use when computing
  the numerical value of a Hebrew word or phrase, comparing two words for
  shared gematria values, studying a biblical verse or divine name for
  numerical correspondences, or connecting a numerical result to its
  position on the Tree of Life.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: intermediate
  language: natural
  tags: esoteric, kabbalah, gematria, hebrew, numerology, isopsephy
---

# Apply Gematria

Compute and analyze gematria — system of assigning numerical values to Hebrew letters and words. Covers standard (Mispar Hechrachi), ordinal (Mispar Siduri), reduced (Mispar Katan) methods, isopsephy comparisons between words of equal value, interpretive frameworks for contemplation.

## When Use

- Want to compute numerical value of Hebrew word or phrase
- Comparing two words to determine if they share gematria value (isopsephy)
- Need to understand which gematria method appropriate for given analysis
- Studying biblical verse or divine name and want to uncover numerical correspondences
- Exploring relationship between word's meaning and its numerical value
- Want to connect numerical result to its position on Tree of Life

## Inputs

- **Required**: Hebrew word, phrase, or divine name to analyze (in Hebrew script or transliteration)
- **Optional**: Second word/phrase for comparison (isopsephy)
- **Optional**: Preferred gematria method (standard, ordinal, reduced, or all three)
- **Optional**: Context or question guiding analysis (e.g., "Why do these two words share a value?")

## Steps

### Step 1: Transliterate and Identify Hebrew Source

Establish exact Hebrew spelling of word or phrase.

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

1. Input in English transliteration? Convert to Hebrew letter sequence
2. Verify spelling: Hebrew has multiple possible spellings for some words (plene vs. defective)
3. Note if word contains final-form letters (Kaf-sofit, Mem-sofit, Nun-sofit, Peh-sofit, Tzadi-sofit)
4. State source: biblical word, divine name, modern Hebrew word, or technical Kabbalistic term?
5. If ambiguous, present both common spellings and compute gematria for each

**Got:** Hebrew letter sequence established with confidence. User knows exactly which letters being summed and can verify spelling.

**If fail:** Transliteration ambiguous (e.g., "chai" could be Chet-Yod or Chet-Yod-Yod in some contexts)? Present both options with their gematria values and let user select.

### Step 2: Apply Standard Gematria (Mispar Hechrachi)

Sum letter values using standard Hebrew number table.

1. Write out each letter with its standard value
2. Sum values left to right (Hebrew reads right to left, but addition is commutative)
3. State total clearly
4. Note if total matches significant number:
   - Sephira number (1-10)
   - Path number (11-32)
   - Well-known gematria value (26 = YHVH, 18 = chai, 72 = Shem ha-Mephorash, 137 = Kabbalah)
5. Total exceeds 400? Note that requires summing multiple hundreds

**Got:** Clear numerical result with computation shown step by step. User can verify each letter's value against table.

**If fail:** User provides word with uncertain Hebrew spelling? Compute values for all plausible spellings and note range. "Correct" spelling depends on source text.

### Step 3: Apply Ordinal and Reduced Methods (Optional)

Compute alternative gematria values that reveal different patterns.

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

1. Compute ordinal gematria: sum each letter's position (1-22) in alphabet
2. Compute reduced gematria: reduce each standard value to single digit, then sum and reduce again
3. Present all three values together for comparison
4. Note which method reveals most interesting connections for this particular word

**Got:** Three numerical values (standard, ordinal, reduced) presented side by side. Reduced value often links to single-digit sephirotic numbers, making it useful for Tree of Life mapping.

**If fail:** User only wants one method? Provide that method and mention others exist for future exploration. Do not overwhelm with calculations if single method requested.

### Step 4: Search for Isopsephy Connections

Identify other Hebrew words or phrases that share same numerical value.

1. Take standard gematria value from Step 2
2. Search for well-known words, divine names, or phrases with same value
3. Present 2-5 connections, prioritizing:
   - Biblical words and phrases
   - Divine names and sephirotic titles
   - Traditional Kabbalistic connections documented in classical sources
   - Surprising or illuminating connections
4. For each connection, note source tradition (Zohar, Talmud, later Kabbalistic commentary, Hermetic tradition)
5. Note if no significant connections found — not every number has rich isopsephy

**Got:** Set of words sharing same gematria value, each with brief note on why connection might be meaningful. User has material for contemplation.

**If fail:** No well-known connections exist for computed value? Acknowledge this. Offer to compute value's relationship to nearby significant numbers (e.g., "your value is 378, which is 2 more than shalom [376] — what does that suggest?").

### Step 5: Interpret Connections and Correspondences

Move from computation to contemplation — what do numerical relationships suggest?

1. State clear: gematria reveals correspondences for contemplation, not proofs or predictions
2. For each isopsephy connection found, pose contemplative question:
   - "Word A and Word B share value N. How might their meanings illuminate each other?"
   - "Reduced value points to sephira X. How does this word's meaning relate to that sephira's quality?"
3. Note connections to Tree of Life:
   - Standard value 1-10 → direct sephirotic correspondence
   - Reduced value 1-9 → sephirotic resonance
   - Value = path number (11-32) → resonance with that path's Hebrew letter
4. User provided guiding question (from Inputs)? Address direct using gematria results
5. Close with one integrative statement connecting numerical analysis to word's meaning

**Got:** Numerical analysis has become meaningful — not just arithmetic but lens for understanding word's place in symbolic network of Kabbalah.

**If fail:** Interpretation feels forced or speculative? Say so directly. Some gematria computations more fruitful than others. Honest acknowledgment of thin connections better than fabricating significance.

## Checks

- [ ] Hebrew spelling established with confidence (or multiple spellings presented)
- [ ] Standard gematria computed with each letter's value shown
- [ ] At least one additional method (ordinal or reduced) applied
- [ ] Isopsephy connections searched and results presented with source notes
- [ ] Interpretation framed as contemplative, not demonstrative
- [ ] Computation verifiable — user can check each letter against value table

## Pitfalls

- **Spelling ambiguity**: Hebrew words can be spelled with or without vowel letters (matres lectionis). Gematria changes significantly — always confirm spelling
- **Final-form confusion**: Whether Mem-final = 40 or 600 depends on which gematria system used. State system explicitly
- **Finding what you expect**: Gematria with enough methods will eventually connect any two words. Privileging connections that confirm preexisting belief is confirmation bias, not analysis
- **Ignoring tradition**: Classical Kabbalistic gematria connections (e.g., YHVH = 26, echad [one] = 13, ahavah [love] = 13, so love + unity = God) documented in authoritative sources. Novel connections should be distinguished from traditional ones
- **Treating gematria as proof**: Numerical equality between words suggests correspondence to contemplate, not identity or causal relationship
- **Forgetting context**: Same word may have different gematria significance in biblical verse vs. liturgical text vs. Kabbalistic meditation. Context shapes interpretation

## See Also

- `read-tree-of-life` — Map gematria values to sephirot and paths for structural context
- `study-hebrew-letters` — Understanding individual letter symbolism deepens gematria interpretation
- `observe` — Sustained neutral attention to patterns; gematria is form of numerical pattern recognition
