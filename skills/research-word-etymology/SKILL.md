---
name: research-word-etymology
description: >
  Research the etymology of a word by tracing proto-language roots,
  identifying cognates across language families, documenting semantic
  drift with dated attestations, and flagging folk etymologies. Use
  when investigating word origins, comparing cognate sets across
  related languages, charting historical meaning changes, or debunking
  popular but unsupported origin stories.
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

Trace a word's origin from its modern form back through attested historical stages and reconstructed proto-language roots, identify cognates in related languages, document semantic drift with dated evidence, and flag any folk etymologies.

## When to Use

- Investigating the origin and historical development of a specific word
- Comparing cognate words across related languages to find a common ancestor
- Charting how a word's meaning has changed over centuries with attestation dates
- Evaluating whether a popular origin story is genuine or a folk etymology
- Building a structured etymology entry for documentation or scholarly reference

## Inputs

- **Required**: Target word (the modern form to research)
- **Required**: Source language of the target word (default: English)
- **Optional**: Depth of reconstruction (default: earliest reconstructable root; alternative: stop at a specific historical stage)
- **Optional**: Cognate languages to include (default: major branches of the same family)
- **Optional**: Output format (default: structured entry; alternative: narrative prose)

## Procedure

### Step 1: Identify the Modern Form and First Attestation

Establish the current usage and earliest documented appearance of the target word.

1. Record the modern spelling, pronunciation (IPA if possible), and primary meaning(s) in the source language.

2. Search for the earliest attested use of the word in the source language. Consult etymological dictionaries (OED for English, TLFi for French, DWDS for German) and historical corpora via WebSearch:

```
Search: "[target word] etymology first attested" site:etymonline.com OR site:oed.com
```

3. Record the attestation date, the source text, and the meaning at first attestation. Note whether the modern meaning differs from the original.

4. If the word entered the source language via borrowing, identify the immediate donor language and approximate date of borrowing.

**Expected:** A dated first attestation with the source text identified, the meaning at first use recorded, and the immediate donor language (if borrowed) established.

**On failure:** If no attestation date is found in online sources, note this explicitly and proceed with the oldest available evidence. Mark the attestation as "date uncertain" and continue to Step 2.

### Step 2: Trace the Etymological Chain

Work backward from the modern form through documented historical stages to the earliest reconstructable root.

1. For each historical stage, record:
   - The form (spelling/transcription)
   - The language and approximate date range
   - The meaning at that stage
   - The phonological changes from the previous stage

2. Follow this chain through attested languages first, then into reconstructed proto-languages. Use standard notation: asterisk (*) for reconstructed forms, angle brackets for graphemes, slashes for phonemes.

3. For Indo-European languages, a typical chain looks like:
   - Modern form (e.g., Modern English, post-1500)
   - Middle period form (e.g., Middle English, 1100-1500)
   - Old period form (e.g., Old English, 450-1100)
   - Proto-language form (e.g., Proto-Germanic, reconstructed)
   - Deep proto-language (e.g., PIE, reconstructed)

4. For borrowed words, trace through each donor language before reaching the ultimate origin. A Latin borrowing in English might go: Modern English < Old French < Latin < PIE.

5. At each stage, note relevant sound laws that explain the phonological changes (e.g., Grimm's Law for PIE-to-Germanic consonant shifts, the Great Vowel Shift for Middle-to-Modern English vowel changes).

**Expected:** A complete chain from modern form to earliest reconstructable root, with each stage dated, the form and meaning recorded, and sound changes explained by named phonological rules where applicable.

**On failure:** If the chain breaks at a particular stage (no further ancestor can be identified), mark that stage as the terminus with "origin beyond this point unknown" and proceed to Step 3 with what is available.

### Step 3: Identify Cognates Across Language Families

Find words in related languages that descend from the same proto-form.

1. From the deepest reconstructed root identified in Step 2, search for reflexes (descendant forms) in other branches of the language family.

2. For each cognate, record:
   - The language and modern form
   - The meaning (noting any semantic divergence from the target word)
   - The regular sound correspondences that connect it to the proto-form

3. Group cognates by branch. For PIE, typical branches include: Germanic, Italic (Romance), Celtic, Hellenic, Balto-Slavic, Indo-Iranian, Armenian, Albanian, Tocharian, Anatolian.

4. Verify cognates by checking that the sound correspondences are regular (systematic across multiple word sets), not just superficial resemblance. False cognates (look-alikes from unrelated roots) should be explicitly flagged and excluded.

5. Format the cognate set as a comparison table:

```
Root: PIE *[root] "[meaning]"
├── Germanic: English [form], German [form], Old Norse [form]
├── Italic: Latin [form] > French [form], Spanish [form], Italian [form]
├── Hellenic: Greek [form]
├── Balto-Slavic: Russian [form], Lithuanian [form]
└── Indo-Iranian: Sanskrit [form], Persian [form]
```

**Expected:** A cognate set with at least 3 branches represented (where the root has surviving reflexes), each cognate verified by regular sound correspondences, and any false cognates explicitly excluded with explanation.

**On failure:** If the root has few surviving cognates (common for domain-specific or culturally bound vocabulary), document what exists and note the limited distribution. If the word has no cognates outside its immediate branch, state this and explain why (e.g., the word may be a substrate borrowing or an innovation within that branch).

### Step 4: Document Semantic Drift

Chart how the word's meaning has changed from the proto-root to the modern form.

1. At each stage of the etymological chain (from Step 2), record the primary meaning. Where multiple senses coexist, note them all.

2. Classify each meaning change according to standard categories:
   - **Narrowing** (specialization): meaning becomes more specific (e.g., "deer" once meant any animal)
   - **Broadening** (generalization): meaning becomes more general (e.g., "dog" once meant a specific breed)
   - **Amelioration**: meaning becomes more positive (e.g., "knight" from servant to noble warrior)
   - **Pejoration**: meaning becomes more negative (e.g., "villain" from farmworker to evildoer)
   - **Metaphor**: meaning shifts via analogy (e.g., "mouse" from rodent to computer device)
   - **Metonymy**: meaning shifts via association (e.g., "crown" from headwear to monarchy)

3. Provide the approximate date of each semantic shift where attestation evidence supports it.

4. Format the drift as a timeline:

```
Semantic drift: [word]
  [date/period]: "[meaning]" ([source])
  [date/period]: "[meaning]" — [drift type] ([source])
  [date/period]: "[meaning]" — [drift type] ([source])
  Present:       "[meaning]"
```

**Expected:** A dated semantic drift timeline with at least the original and modern meanings, each shift classified by type, and attestation sources cited.

**On failure:** If intermediate stages lack clear attestation evidence, note the gap explicitly (e.g., "semantic shift from X to Y occurred between [date range] but the mechanism is not attested") and proceed with available evidence.

### Step 5: Flag Folk Etymologies

Identify and evaluate any popular but incorrect origin stories associated with the word.

1. Search for common folk etymologies, backronyms, or urban legends about the word:

```
Search: "[target word] folk etymology" OR "[target word] myth origin" OR "[target word] false etymology"
```

2. For each folk etymology found, document:
   - The claimed origin story
   - Why it is linguistically unsupported (e.g., anachronistic, phonologically impossible, no attestation evidence)
   - The likely reason the folk etymology became popular (satisfying narrative, apparent plausibility, memorable acronym)

3. If no folk etymologies exist for this word, state that explicitly rather than omitting the section.

4. Use clear verdict markers:
   - **Confirmed**: Supported by linguistic evidence
   - **Probable**: Well-supported but not conclusively proven
   - **Speculative**: Possible but lacking sufficient evidence
   - **Folk etymology (unsupported)**: Popular but contradicted by evidence
   - **Backronym**: Acronym invented after the word already existed

**Expected:** Any folk etymologies identified and debunked with linguistic evidence, or an explicit statement that no folk etymologies are known for this word.

**On failure:** If the status of a claimed etymology is genuinely uncertain (legitimate scholarly debate), present both sides with citations rather than forcing a verdict. Mark as "disputed" with the competing hypotheses.

### Step 6: Format the Structured Etymology Entry

Compile all findings into a standardized output format.

1. Assemble the entry with the following structure:

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

2. Review the entry for internal consistency: does the etymological chain match the cognate set? Does the semantic drift timeline align with the attestation dates?

3. Add a confidence assessment for the overall etymology, noting any weak links in the chain.

**Expected:** A complete, internally consistent etymology entry with all sections filled, sources cited, and confidence levels marked.

**On failure:** If any section could not be completed (e.g., no cognates found, no folk etymologies known), include the section with an explicit "not applicable" or "insufficient evidence" note rather than omitting it.

## Validation

- [ ] Modern form and first attestation are recorded with a date and source
- [ ] Etymological chain traces at least two historical stages (or notes why fewer exist)
- [ ] Reconstructed forms use standard notation (asterisk prefix)
- [ ] Cognate set includes words from at least two language branches (where available)
- [ ] Sound correspondences cited are regular (not ad hoc resemblances)
- [ ] Semantic drift timeline has dated entries with classified shift types
- [ ] Folk etymologies are addressed (either debunked or noted as absent)
- [ ] Sources are cited (dictionary names, corpus names, or URLs)
- [ ] Confidence level is explicitly stated
- [ ] Entry is internally consistent (chain, cognates, and drift align)

## Common Pitfalls

- **Surface resemblance mistaken for cognacy**: Words that look similar across languages are not necessarily related (e.g., English "much" and Spanish "mucho" are from different roots). Always verify with regular sound correspondences, not visual similarity.
- **Confusing borrowing with inheritance**: A word present in two related languages may have been borrowed from one to the other rather than inherited from a common ancestor. Check the phonological form against expected sound-law outcomes to distinguish the two.
- **Treating reconstructed forms as attested**: PIE roots and other proto-forms are scholarly hypotheses, not historical documents. Always mark them with asterisks and note that they are reconstructed.
- **Accepting folk etymologies uncritically**: Popular origin stories are often more memorable than correct etymologies. Always check for attestation evidence and phonological plausibility before accepting a claimed origin.
- **Ignoring semantic drift**: A word's modern meaning may be very different from its original meaning. Tracing only the form without tracking the meaning can produce misleading results.
- **Stopping too early**: Many online sources give only one or two stages of a word's history. Push back to the deepest available reconstruction for a complete picture.

## Related Skills

- `manage-memory` — Document etymology research findings for persistent reference across sessions
- `argumentation` — Build and evaluate arguments about contested etymologies
