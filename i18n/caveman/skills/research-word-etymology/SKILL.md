---
name: research-word-etymology
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Research etymology of a word by tracing proto-language roots,
  identifying cognates across language families, documenting semantic
  drift with dated attestations, flagging folk etymologies. Use when
  investigate word origins, compare cognate sets across related
  languages, chart historical meaning changes, or debunk popular but
  unsupported origin stories.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: linguistics
  complexity: intermediate
  language: natural-language
  tags: linguistics, etymology, historical-linguistics, proto-language, cognates
---

# Research Word Etymology

Trace word origin from modern form back through attested historical stages and reconstructed proto-language roots. Identify cognates in related languages. Document semantic drift with dated evidence. Flag any folk etymologies.

## When Use

- Investigate origin and historical development of specific word
- Compare cognate words across related languages to find common ancestor
- Chart how word meaning has changed over centuries with attestation dates
- Evaluate whether popular origin story is genuine or folk etymology
- Build structured etymology entry for documentation or scholarly reference

## Inputs

- **Required**: Target word (modern form to research)
- **Required**: Source language of target word (default: English)
- **Optional**: Depth of reconstruction (default: earliest reconstructable root; alternative: stop at specific historical stage)
- **Optional**: Cognate languages to include (default: major branches of same family)
- **Optional**: Output format (default: structured entry; alternative: narrative prose)

## Steps

### Step 1: Identify Modern Form and First Attestation

Establish current usage and earliest documented appearance of target word.

1. Record modern spelling, pronunciation (IPA if possible), primary meaning(s) in source language.

2. Search for earliest attested use of word in source language. Consult etymological dictionaries (OED for English, TLFi for French, DWDS for German) and historical corpora via WebSearch:

```
Search: "[target word] etymology first attested" site:etymonline.com OR site:oed.com
```

3. Record attestation date, source text, meaning at first attestation. Note whether modern meaning differs from original.

4. Word entered source language via borrowing? Identify immediate donor language and approximate date of borrowing.

**Got:** Dated first attestation with source text identified, meaning at first use recorded, immediate donor language (if borrowed) established.

**If fail:** No attestation date found in online sources? Note this explicit and proceed with oldest available evidence. Mark attestation as "date uncertain" and continue to Step 2.

### Step 2: Trace the Etymological Chain

Work backward from modern form through documented historical stages to earliest reconstructable root.

1. For each historical stage, record:
   - Form (spelling/transcription)
   - Language and approximate date range
   - Meaning at that stage
   - Phonological changes from previous stage

2. Follow this chain through attested languages first, then into reconstructed proto-languages. Use standard notation: asterisk (*) for reconstructed forms, angle brackets for graphemes, slashes for phonemes.

3. For Indo-European languages, typical chain looks like:
   - Modern form (e.g., Modern English, post-1500)
   - Middle period form (e.g., Middle English, 1100-1500)
   - Old period form (e.g., Old English, 450-1100)
   - Proto-language form (e.g., Proto-Germanic, reconstructed)
   - Deep proto-language (e.g., PIE, reconstructed)

4. For borrowed words, trace through each donor language before reaching ultimate origin. Latin borrowing in English might go: Modern English < Old French < Latin < PIE.

5. At each stage, note relevant sound laws that explain phonological changes (e.g., Grimm's Law for PIE-to-Germanic consonant shifts, Great Vowel Shift for Middle-to-Modern English vowel changes).

**Got:** Complete chain from modern form to earliest reconstructable root, with each stage dated, form and meaning recorded, sound changes explained by named phonological rules where applicable.

**If fail:** Chain breaks at particular stage (no further ancestor can be identified)? Mark that stage as terminus with "origin beyond this point unknown" and proceed to Step 3 with what is available.

### Step 3: Identify Cognates Across Language Families

Find words in related languages that descend from same proto-form.

1. From deepest reconstructed root identified in Step 2, search for reflexes (descendant forms) in other branches of language family.

2. For each cognate, record:
   - Language and modern form
   - Meaning (noting any semantic divergence from target word)
   - Regular sound correspondences that connect it to proto-form

3. Group cognates by branch. For PIE, typical branches: Germanic, Italic (Romance), Celtic, Hellenic, Balto-Slavic, Indo-Iranian, Armenian, Albanian, Tocharian, Anatolian.

4. Verify cognates by checking sound correspondences are regular (systematic across multiple word sets), not just superficial resemblance. False cognates (look-alikes from unrelated roots) should be explicit flagged and excluded.

5. Format cognate set as comparison table:

```
Root: PIE *[root] "[meaning]"
├── Germanic: English [form], German [form], Old Norse [form]
├── Italic: Latin [form] > French [form], Spanish [form], Italian [form]
├── Hellenic: Greek [form]
├── Balto-Slavic: Russian [form], Lithuanian [form]
└── Indo-Iranian: Sanskrit [form], Persian [form]
```

**Got:** Cognate set with at least 3 branches represented (where root has surviving reflexes), each cognate verified by regular sound correspondences, any false cognates explicit excluded with explanation.

**If fail:** Root has few surviving cognates (common for domain-specific or culturally bound vocabulary)? Document what exists and note limited distribution. Word has no cognates outside immediate branch? State this and explain why (e.g., word may be substrate borrowing or innovation within that branch).

### Step 4: Document Semantic Drift

Chart how word meaning has changed from proto-root to modern form.

1. At each stage of etymological chain (from Step 2), record primary meaning. Where multiple senses coexist, note them all.

2. Classify each meaning change according to standard categories:
   - **Narrowing** (specialization): meaning becomes more specific (e.g., "deer" once meant any animal)
   - **Broadening** (generalization): meaning becomes more general (e.g., "dog" once meant a specific breed)
   - **Amelioration**: meaning becomes more positive (e.g., "knight" from servant to noble warrior)
   - **Pejoration**: meaning becomes more negative (e.g., "villain" from farmworker to evildoer)
   - **Metaphor**: meaning shifts via analogy (e.g., "mouse" from rodent to computer device)
   - **Metonymy**: meaning shifts via association (e.g., "crown" from headwear to monarchy)

3. Provide approximate date of each semantic shift where attestation evidence supports it.

4. Format drift as timeline:

```
Semantic drift: [word]
  [date/period]: "[meaning]" ([source])
  [date/period]: "[meaning]" — [drift type] ([source])
  [date/period]: "[meaning]" — [drift type] ([source])
  Present:       "[meaning]"
```

**Got:** Dated semantic drift timeline with at least original and modern meanings, each shift classified by type, attestation sources cited.

**If fail:** Intermediate stages lack clear attestation evidence? Note the gap explicit (e.g., "semantic shift from X to Y occurred between [date range] but the mechanism is not attested") and proceed with available evidence.

### Step 5: Flag Folk Etymologies

Identify and evaluate any popular but incorrect origin stories associated with word.

1. Search for common folk etymologies, backronyms, or urban legends about word:

```
Search: "[target word] folk etymology" OR "[target word] myth origin" OR "[target word] false etymology"
```

2. For each folk etymology found, document:
   - Claimed origin story
   - Why linguistically unsupported (e.g., anachronistic, phonologically impossible, no attestation evidence)
   - Likely reason folk etymology became popular (satisfying narrative, apparent plausibility, memorable acronym)

3. No folk etymologies exist for this word? State that explicit rather than omit the section.

4. Use clear verdict markers:
   - **Confirmed**: Supported by linguistic evidence
   - **Probable**: Well-supported but not conclusively proven
   - **Speculative**: Possible but lacking sufficient evidence
   - **Folk etymology (unsupported)**: Popular but contradicted by evidence
   - **Backronym**: Acronym invented after word already existed

**Got:** Any folk etymologies identified and debunked with linguistic evidence, or explicit statement that no folk etymologies known for this word.

**If fail:** Status of claimed etymology genuinely uncertain (legitimate scholarly debate)? Present both sides with citations rather than force a verdict. Mark as "disputed" with competing hypotheses.

### Step 6: Format the Structured Etymology Entry

Compile all findings into standardized output format.

1. Assemble entry with following structure:

```markdown
## Etymology: [word]

**Modern form**: [word] ([language], [part of speech])
**Pronunciation**: /[IPA]/
**First attested**: [date], [source text/author]

### Etymological Chain
[Modern form] ([language], [date])
  < [intermediate form] ([language], [date]) "[meaning]"
  < [older form] ([language], [date]) "[meaning]"
  < *[proto-form] ([proto-language]) "[reconstructed meaning]"

### Cognates
[Cognate table from Step 3]

### Semantic Drift
[Timeline from Step 4]

### Folk Etymologies
[Findings from Step 5, or "None known"]

### Sources
[Etymological dictionaries and corpora consulted]

### Confidence
[Overall confidence level: certain / probable / speculative / contested]
[Notes on any gaps or uncertainties in the analysis]
```

2. Review entry for internal consistency: does etymological chain match cognate set? Does semantic drift timeline align with attestation dates?

3. Add confidence assessment for overall etymology, noting any weak links in chain.

**Got:** Complete, internally consistent etymology entry with all sections filled, sources cited, confidence levels marked.

**If fail:** Any section could not be completed (e.g., no cognates found, no folk etymologies known)? Include section with explicit "not applicable" or "insufficient evidence" note rather than omit it.

## Checks

- [ ] Modern form and first attestation recorded with date and source
- [ ] Etymological chain traces at least two historical stages (or notes why fewer exist)
- [ ] Reconstructed forms use standard notation (asterisk prefix)
- [ ] Cognate set includes words from at least two language branches (where available)
- [ ] Sound correspondences cited are regular (not ad hoc resemblances)
- [ ] Semantic drift timeline has dated entries with classified shift types
- [ ] Folk etymologies addressed (either debunked or noted as absent)
- [ ] Sources cited (dictionary names, corpus names, or URLs)
- [ ] Confidence level explicit stated
- [ ] Entry internally consistent (chain, cognates, drift align)

## Pitfalls

- **Surface resemblance mistaken for cognacy**: Words that look similar across languages are not necessarily related (e.g., English "much" and Spanish "mucho" are from different roots). Always verify with regular sound correspondences, not visual similarity.
- **Confuse borrowing with inheritance**: Word present in two related languages may have been borrowed from one to the other rather than inherited from common ancestor. Check phonological form against expected sound-law outcomes to distinguish the two.
- **Treat reconstructed forms as attested**: PIE roots and other proto-forms are scholarly hypotheses, not historical documents. Always mark with asterisks and note they are reconstructed.
- **Accept folk etymologies uncritically**: Popular origin stories often more memorable than correct etymologies. Always check for attestation evidence and phonological plausibility before accept claimed origin.
- **Ignore semantic drift**: Word modern meaning may be very different from its original meaning. Trace only form without track meaning can produce misleading results.
- **Stop too early**: Many online sources give only one or two stages of word history. Push back to deepest available reconstruction for complete picture.

## See Also

- `manage-memory` — Document etymology research findings for persistent reference across sessions
- `argumentation` — Build and evaluate arguments about contested etymologies
