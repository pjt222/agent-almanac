---
name: research-word-etymology
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Research word etymology by tracing proto-lang roots, ID cognates across lang
  families, document semantic drift w/ dated attestations, flag folk
  etymologies. Use → investigate word origins, compare cognate sets across
  related langs, chart historical meaning changes, debunk popular unsupported
  origin stories.
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

Trace word origin from modern form back through attested historical stages + reconstructed proto-lang roots, ID cognates in related langs, document semantic drift w/ dated evidence, flag folk etymologies.

## Use When

- Investigate origin + historical dev of specific word
- Compare cognate words across related langs → common ancestor
- Chart how meaning changed centuries w/ attestation dates
- Eval whether popular origin story genuine or folk
- Build structured etymology entry for docs/scholarly ref

## In

- **Required**: Target word (modern form)
- **Required**: Source lang (default English)
- **Optional**: Reconstruction depth (default earliest reconstructable; alt: stop at specific historical stage)
- **Optional**: Cognate langs (default major branches of same family)
- **Optional**: Output format (default structured entry; alt narrative prose)

## Do

### Step 1: ID Modern Form + First Attestation

Establish current usage + earliest documented appearance.

1. Record modern spelling, pronunciation (IPA if possible), primary meaning(s) in source lang.

2. Search earliest attested use in source lang. Consult etymological dicts (OED for English, TLFi for French, DWDS for German) + historical corpora via WebSearch:

```
Search: "[target word] etymology first attested" site:etymonline.com OR site:oed.com
```

3. Record attestation date, source text, meaning at first attestation. Note if modern meaning differs from original.

4. If word entered source lang via borrowing, ID immediate donor lang + approx borrowing date.

→ Dated first attestation w/ source text ID'd, meaning at first use recorded, immediate donor lang (if borrowed) established.

If err: no attestation date in online sources → note explicit + proceed w/ oldest available evidence. Mark "date uncertain" + continue Step 2.

### Step 2: Trace Etymological Chain

Work backward from modern form through documented historical stages → earliest reconstructable root.

1. Each historical stage record:
   - Form (spelling/transcription)
   - Lang + approx date range
   - Meaning at stage
   - Phonological changes from prev

2. Follow chain through attested langs first, then into reconstructed proto-langs. Use std notation: asterisk (*) for reconstructed, angle brackets for graphemes, slashes for phonemes.

3. For Indo-European, typical chain:
   - Modern form (e.g. Modern English, post-1500)
   - Middle period (e.g. Middle English, 1100-1500)
   - Old period (e.g. Old English, 450-1100)
   - Proto-lang (e.g. Proto-Germanic, reconstructed)
   - Deep proto-lang (e.g. PIE, reconstructed)

4. Borrowed words → trace through each donor before ultimate origin. Latin borrowing in English: Modern English < Old French < Latin < PIE.

5. Each stage note relevant sound laws explaining phonological changes (e.g. Grimm's Law for PIE→Germanic consonant shifts, Great Vowel Shift for Middle→Modern English vowels).

→ Complete chain modern → earliest reconstructable root, each stage dated, form + meaning recorded, sound changes explained by named phonological rules.

If err: chain breaks at stage (no further ancestor) → mark terminus w/ "origin beyond this point unknown" + proceed Step 3 w/ what's available.

### Step 3: ID Cognates Across Families

Find words in related langs descending from same proto-form.

1. From deepest reconstructed root in Step 2, search reflexes in other branches.

2. Each cognate record:
   - Lang + modern form
   - Meaning (note semantic divergence from target)
   - Regular sound correspondences connecting to proto-form

3. Group cognates by branch. PIE typical branches: Germanic, Italic (Romance), Celtic, Hellenic, Balto-Slavic, Indo-Iranian, Armenian, Albanian, Tocharian, Anatolian.

4. Verify cognates → check sound correspondences regular (systematic across multi word sets), not just superficial. False cognates (look-alikes from unrelated roots) flagged + excluded.

5. Format cognate set as comparison table:

```
Root: PIE *[root] "[meaning]"
├── Germanic: English [form], German [form], Old Norse [form]
├── Italic: Latin [form] > French [form], Spanish [form], Italian [form]
├── Hellenic: Greek [form]
├── Balto-Slavic: Russian [form], Lithuanian [form]
└── Indo-Iranian: Sanskrit [form], Persian [form]
```

→ Cognate set w/ ≥3 branches (where root has reflexes), each verified by regular correspondences, false cognates explicitly excluded.

If err: root has few cognates (common for domain-specific or culturally bound vocab) → document what exists + note limited distribution. Word has no cognates outside immediate branch → state + explain (substrate borrowing or innovation).

### Step 4: Document Semantic Drift

Chart how meaning changed proto-root → modern form.

1. Each stage of chain (Step 2) record primary meaning. Multi senses coexist → note all.

2. Classify each meaning change by std categories:
   - **Narrowing** (specialization): meaning becomes more specific (e.g. "deer" once any animal)
   - **Broadening** (generalization): meaning becomes more general (e.g. "dog" once specific breed)
   - **Amelioration**: meaning more positive (e.g. "knight" servant → noble warrior)
   - **Pejoration**: meaning more negative (e.g. "villain" farmworker → evildoer)
   - **Metaphor**: shifts via analogy (e.g. "mouse" rodent → computer device)
   - **Metonymy**: shifts via association (e.g. "crown" headwear → monarchy)

3. Provide approx date of each shift where attestation supports.

4. Format drift as timeline:

```
Semantic drift: [word]
  [date/period]: "[meaning]" ([source])
  [date/period]: "[meaning]" — [drift type] ([source])
  [date/period]: "[meaning]" — [drift type] ([source])
  Present:       "[meaning]"
```

→ Dated semantic drift timeline w/ at least original + modern meanings, each shift classified, attestation sources cited.

If err: intermediate stages lack clear attestation → note gap explicit ("semantic shift X to Y between [date range] but mechanism not attested") + proceed.

### Step 5: Flag Folk Etymologies

ID + eval popular but incorrect origin stories.

1. Search common folk etymologies, backronyms, urban legends:

```
Search: "[target word] folk etymology" OR "[target word] myth origin" OR "[target word] false etymology"
```

2. Each folk found document:
   - Claimed origin story
   - Why linguistically unsupported (anachronistic, phonologically impossible, no attestation)
   - Likely reason became popular (satisfying narrative, apparent plausibility, memorable acronym)

3. No folk etymologies for word → state explicit, no omit section.

4. Use clear verdict markers:
   - **Confirmed**: Supported by linguistic evidence
   - **Probable**: Well-supported but not conclusively proven
   - **Speculative**: Possible but lacking sufficient evidence
   - **Folk etymology (unsupported)**: Popular but contradicted by evidence
   - **Backronym**: Acronym invented after the word already existed

→ Folk etymologies ID'd + debunked w/ linguistic evidence, or explicit statement none known.

If err: status of claimed etymology genuinely uncertain (legitimate scholarly debate) → present both sides w/ citations not force verdict. Mark "disputed" w/ competing hypotheses.

### Step 6: Format Structured Entry

Compile findings → standardized output.

1. Assemble entry w/ structure:

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

2. Review entry for internal consistency: chain matches cognate set? Drift timeline aligns w/ attestation dates?

3. Add confidence assessment for overall etymology, note weak links.

→ Complete internally consistent etymology w/ all sections, sources cited, confidence marked.

If err: section couldn't complete (no cognates, no folk known) → include section w/ explicit "not applicable" or "insufficient evidence" note, no omit.

## Check

- [ ] Modern form + first attestation recorded w/ date + source
- [ ] Chain traces ≥2 historical stages (or notes why fewer)
- [ ] Reconstructed forms use std notation (asterisk prefix)
- [ ] Cognate set has words from ≥2 branches (where available)
- [ ] Sound correspondences cited regular (not ad hoc resemblances)
- [ ] Semantic drift timeline dated w/ classified shift types
- [ ] Folk etymologies addressed (debunked or noted absent)
- [ ] Sources cited (dict names, corpus names, URLs)
- [ ] Confidence level explicit
- [ ] Entry internally consistent (chain, cognates, drift align)

## Traps

- **Surface resemblance for cognacy**: Look-alike words across langs not necessarily related (e.g. English "much" + Spanish "mucho" diff roots). Always verify regular correspondences not visual similarity.
- **Confuse borrowing w/ inheritance**: Word in 2 related langs may be borrowed not inherited from common ancestor. Check phonological form vs expected sound-law outcomes.
- **Treat reconstructed as attested**: PIE roots + other proto-forms = scholarly hypotheses not historical docs. Always mark asterisks + note reconstructed.
- **Accept folk etymologies uncritically**: Popular origins often more memorable than correct. Always check attestation + phonological plausibility.
- **Ignore semantic drift**: Modern meaning may be very diff from original. Tracing only form w/o meaning → misleading.
- **Stop too early**: Online sources give only 1-2 stages. Push back to deepest reconstruction for complete picture.

## →

- `manage-memory` — document etymology research findings for persistent ref across sessions
- `argumentation` — build + eval arguments about contested etymologies
