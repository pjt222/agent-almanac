---
name: apply-gematria
locale: caveman-ultra
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

Compute + analyze gematria — numerical values of Hebrew letters + words. Standard (Mispar Hechrachi), ordinal (Mispar Siduri), reduced (Mispar Katan). Isopsephy compares words equal value. Interpretive frameworks for contemplation.

## Use When

- Numerical value of Hebrew word/phrase
- Compare 2 words → shared gematria (isopsephy)
- Which method appropriate for given analysis?
- Study biblical verse or divine name → numerical correspondences
- Explore word meaning ↔ numerical value
- Connect numerical → Tree of Life

## In

- **Required**: Hebrew word, phrase, or divine name (Hebrew script or transliteration)
- **Optional**: 2nd word/phrase for compare (isopsephy)
- **Optional**: Method preferred (standard, ordinal, reduced, or all)
- **Optional**: Context/question guiding analysis

## Do

### Step 1: Transliterate + ID Hebrew Src

Establish exact Hebrew spelling.

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

1. English translit → Hebrew letter sequence
2. Verify spelling: Hebrew has multiple spellings (plene vs defective)
3. Note final-form letters (Kaf-sofit, Mem-sofit, Nun-sofit, Peh-sofit, Tzadi-sofit)
4. State src: biblical, divine name, modern Hebrew, technical Kabbalistic term?
5. Ambiguous → present both common spellings + compute each

**→** Hebrew letter sequence established w/ confidence. User knows which letters summed + verifiable.

**If err:** Translit ambiguous ("chai" could be Chet-Yod or Chet-Yod-Yod) → both options w/ values + user selects.

### Step 2: Standard Gematria (Mispar Hechrachi)

Sum letter values via standard table.

1. Write each letter + standard value
2. Sum left-to-right (Hebrew reads right-to-left but addition commutative)
3. State total
4. Note significant:
   - Sephira (1-10)
   - Path (11-32)
   - Well-known (26 = YHVH, 18 = chai, 72 = Shem ha-Mephorash, 137 = Kabbalah)
5. Total > 400 → summing multiple hundreds

**→** Clear numerical result w/ step-by-step computation. User verifies each letter vs table.

**If err:** Uncertain Hebrew spelling → compute all plausible + note range. Correct depends on src text.

### Step 3: Ordinal + Reduced (Optional)

Alternative values revealing different patterns.

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

1. Ordinal: sum each letter's position (1-22)
2. Reduced: reduce each standard → single digit, sum + reduce
3. Present all 3 side-by-side
4. Note which method reveals most interesting connections

**→** 3 values (standard, ordinal, reduced) side-by-side. Reduced often links single-digit sephirotic nums, useful Tree mapping.

**If err:** User wants 1 method only → provide + mention others exist. No overwhelm.

### Step 4: Search Isopsephy

Hebrew words/phrases sharing value.

1. Take standard gematria (Step 2)
2. Search well-known words, divine names, phrases same value
3. Present 2-5 connections, prioritize:
   - Biblical words + phrases
   - Divine names + sephirotic titles
   - Traditional Kabbalistic connections (classical srcs)
   - Surprising or illuminating
4. Per connection note src tradition (Zohar, Talmud, later Kabbalistic, Hermetic)
5. No significant connections → acknowledge

**→** Set of words sharing gematria + brief note why connection meaningful. User has contemplation material.

**If err:** No well-known for value → acknowledge. Offer relationship to nearby nums ("378 is 2 more than shalom [376] — what does that suggest?").

### Step 5: Interpret Connections

Computation → contemplation.

1. State: gematria reveals correspondences for contemplation, not proofs/predictions
2. Per isopsephy connection pose contemplative question:
   - "Word A + B share value N. How might meanings illuminate each other?"
   - "Reduced → sephira X. How does word's meaning relate to sephira's quality?"
3. Note Tree of Life connections:
   - Standard 1-10 → direct sephirotic correspondence
   - Reduced 1-9 → sephirotic resonance
   - Value = path (11-32) → resonance w/ path's Hebrew letter
4. User provided guiding question → address directly
5. Close w/ integrative statement connecting numerical → meaning

**→** Numerical analysis meaningful — not arithmetic but lens for word's place in Kabbalah symbolic network.

**If err:** Interp feels forced/speculative → say directly. Some computations more fruitful than others. Honest acknowledge thin > fabricated significance.

## Check

- [ ] Hebrew spelling established w/ confidence (or multiple presented)
- [ ] Standard gematria computed + each letter value shown
- [ ] ≥1 additional method (ordinal or reduced) applied
- [ ] Isopsephy searched + results w/ src notes
- [ ] Interpretation framed contemplative, not demonstrative
- [ ] Computation verifiable — user can check each letter vs table

## Traps

- **Spelling ambiguity**: Hebrew words w/ or w/o vowel letters (matres lectionis). Gematria changes significantly — always confirm.
- **Final-form confusion**: Mem-final = 40 or 600 depends on system. State explicitly.
- **Finding what expect**: Enough methods → connect any 2 words. Privileging confirming preexisting belief = confirmation bias.
- **Ignore tradition**: Classical Kabbalistic connections (YHVH = 26, echad = 13, ahavah = 13 → love + unity = God) documented authoritative srcs. Novel connections distinct from traditional.
- **Gematria as proof**: Numerical equality suggests correspondence to contemplate, not identity/causal.
- **Forget context**: Same word may have different significance biblical verse vs liturgical vs meditation. Ctx shapes interp.

## →

- `read-tree-of-life` — map gematria → sephirot + paths
- `study-hebrew-letters` — individual letter symbolism deepens gematria
- `observe` — sustained neutral attention to patterns; gematria = numerical pattern recognition
