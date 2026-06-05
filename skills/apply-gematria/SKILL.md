---
name: apply-gematria
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

Compute and analyze gematria — the system of assigning numerical values to Hebrew letters and words. Covers standard (Mispar Hechrachi), ordinal (Mispar Siduri), and reduced (Mispar Katan) methods, isopsephy comparisons between words of equal value, and interpretive frameworks for contemplation.

## When to Use

- You want to compute the numerical value of a Hebrew word or phrase
- You are comparing two words to determine if they share a gematria value (isopsephy)
- You need to understand which gematria method is appropriate for a given analysis
- You are studying a biblical verse or divine name and want to uncover numerical correspondences
- You are exploring the relationship between a word's meaning and its numerical value
- You want to connect a numerical result to its position on the Tree of Life

## Inputs

- **Required**: A Hebrew word, phrase, or divine name to analyze (in Hebrew script or transliteration)
- **Optional**: A second word/phrase for comparison (isopsephy)
- **Optional**: Preferred gematria method (standard, ordinal, reduced, or all three)
- **Optional**: Context or question guiding the analysis (e.g., "Why do these two words share a value?")

## Procedure

### Step 1: Transliterate and Identify the Hebrew Source

Establish the exact Hebrew spelling of the word or phrase.

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

1. If the input is in English transliteration, convert to Hebrew letter sequence
2. Verify the spelling: Hebrew has multiple possible spellings for some words (plene vs. defective)
3. Note if the word contains final-form letters (Kaf-sofit, Mem-sofit, Nun-sofit, Peh-sofit, Tzadi-sofit)
4. State the source: is this a biblical word, a divine name, a modern Hebrew word, or a technical Kabbalistic term?
5. If ambiguous, present both common spellings and compute gematria for each

**Expected:** The Hebrew letter sequence is established with confidence. The user knows exactly which letters are being summed and can verify the spelling.

**On failure:** If the transliteration is ambiguous (e.g., "chai" could be Chet-Yod or Chet-Yod-Yod in some contexts), present both options with their gematria values and let the user select.

### Step 2: Apply Standard Gematria (Mispar Hechrachi)

Sum the letter values using the standard Hebrew number table.

1. Write out each letter with its standard value
2. Sum the values left to right (Hebrew reads right to left, but addition is commutative)
3. State the total clearly
4. Note if the total matches a significant number:
   - A sephira number (1-10)
   - A path number (11-32)
   - A well-known gematria value (26 = YHVH, 18 = chai, 72 = Shem ha-Mephorash, 137 = Kabbalah)
5. If the total exceeds 400, note that it requires summing multiple hundreds

**Expected:** A clear numerical result with the computation shown step by step. The user can verify each letter's value against the table.

**On failure:** If the user provides a word with uncertain Hebrew spelling, compute values for all plausible spellings and note the range. The "correct" spelling depends on the source text.

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

1. Compute ordinal gematria: sum each letter's position (1-22) in the alphabet
2. Compute reduced gematria: reduce each standard value to single digit, then sum and reduce again
3. Present all three values together for comparison
4. Note which method reveals the most interesting connections for this particular word

**Expected:** Three numerical values (standard, ordinal, reduced) presented side by side. The reduced value often links to single-digit sephirotic numbers, making it useful for Tree of Life mapping.

**On failure:** If the user only wants one method, provide that method and mention the others exist for future exploration. Do not overwhelm with calculations if a single method was requested.

### Step 4: Search for Isopsephy Connections

Identify other Hebrew words or phrases that share the same numerical value.

1. Take the standard gematria value from Step 2
2. Search for well-known words, divine names, or phrases with the same value
3. Present 2-5 connections, prioritizing:
   - Biblical words and phrases
   - Divine names and sephirotic titles
   - Traditional Kabbalistic connections documented in classical sources
   - Surprising or illuminating connections
4. For each connection, note the source tradition (Zohar, Talmud, later Kabbalistic commentary, Hermetic tradition)
5. Note if no significant connections are found — not every number has rich isopsephy

**Expected:** A set of words sharing the same gematria value, each with a brief note on why the connection might be meaningful. The user has material for contemplation.

**On failure:** If no well-known connections exist for the computed value, acknowledge this. Offer to compute the value's relationship to nearby significant numbers (e.g., "your value is 378, which is 2 more than shalom [376] — what does that suggest?").

### Step 5: Interpret Connections and Correspondences

Move from computation to contemplation — what do the numerical relationships suggest?

1. State clearly: gematria reveals correspondences for contemplation, not proofs or predictions
2. For each isopsephy connection found, pose a contemplative question:
   - "Word A and Word B share the value N. How might their meanings illuminate each other?"
   - "The reduced value points to sephira X. How does this word's meaning relate to that sephira's quality?"
3. Note connections to the Tree of Life:
   - Standard value 1-10 → direct sephirotic correspondence
   - Reduced value 1-9 → sephirotic resonance
   - Value = a path number (11-32) → resonance with that path's Hebrew letter
4. If the user provided a guiding question (from Inputs), address it directly using the gematria results
5. Close with one integrative statement connecting the numerical analysis to the word's meaning

**Expected:** The numerical analysis has become meaningful — not just arithmetic but a lens for understanding the word's place in the symbolic network of Kabbalah.

**On failure:** If interpretation feels forced or speculative, say so directly. Some gematria computations are more fruitful than others. Honest acknowledgment of thin connections is better than fabricating significance.

## Validation

- [ ] The Hebrew spelling was established with confidence (or multiple spellings presented)
- [ ] Standard gematria was computed with each letter's value shown
- [ ] At least one additional method (ordinal or reduced) was applied
- [ ] Isopsephy connections were searched and results presented with source notes
- [ ] Interpretation was framed as contemplative, not demonstrative
- [ ] The computation is verifiable — the user can check each letter against the value table

## Common Pitfalls

- **Spelling ambiguity**: Hebrew words can be spelled with or without vowel letters (matres lectionis). The gematria changes significantly — always confirm the spelling
- **Final-form confusion**: Whether Mem-final = 40 or 600 depends on which gematria system is used. State the system explicitly
- **Finding what you expect**: Gematria with enough methods will eventually connect any two words. Privileging connections that confirm a preexisting belief is confirmation bias, not analysis
- **Ignoring tradition**: Classical Kabbalistic gematria connections (e.g., YHVH = 26, echad [one] = 13, ahavah [love] = 13, so love + unity = God) are documented in authoritative sources. Novel connections should be distinguished from traditional ones
- **Treating gematria as proof**: Numerical equality between words suggests a correspondence to contemplate, not an identity or causal relationship
- **Forgetting context**: The same word may have different gematria significance in a biblical verse vs. a liturgical text vs. a Kabbalistic meditation. Context shapes interpretation

## Related Skills

- `read-tree-of-life` — Map gematria values to sephirot and paths for structural context
- `study-hebrew-letters` — Understanding individual letter symbolism deepens gematria interpretation
- `observe` — Sustained neutral attention to patterns; gematria is a form of numerical pattern recognition
