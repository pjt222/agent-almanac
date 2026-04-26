---
name: integrate-gestalt
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Form a coherent gestalt — the whole that is more than the sum of its parts —
  from the panoramic perception produced by expand-awareness. Maps tensions
  and resonances between domains, identifies the emergent figure from the
  ground of multiple perspectives, tests the candidate whole for premature
  closure, and articulates the insight in a single sentence no single domain
  could have produced. Use after expand-awareness has surfaced raw multi-domain
  perception and before express-insight communicates the result.
license: MIT
allowed-tools: Read Write Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: synoptic
  complexity: advanced
  language: natural
  tags: synoptic, gestalt, integration, emergence, synthesis
---

# Integrate Gestalt

Form whole from panoramic perception of `expand-awareness`. Not by averaging, not by compromise, not by picking best domain. By spotting emergent pattern no single view could make.

## When Use

- `expand-awareness` has surfaced raw perception from many domains; observations need to become one insight
- Many domain views present, no single one covers all evidence
- Problem analyzed from several angles; separate analyses need to become more than list
- Question "what does all this mean together?" has no obvious answer
- Synthesis keeps collapsing to "pick best domain" instead of making something new
- Before `express-insight`, which needs formed gestalt as input

## Inputs

- **Required**: Multi-domain observations from `expand-awareness` (or equivalent panoramic perception)
- **Optional**: Original question or problem that triggered multi-domain scan
- **Optional**: Known constraints gestalt must satisfy
- **Optional**: Prior failed integration tries (what collapsed into single-domain answers)

## Steps

### Step 1: Map Tensions

For each pair of domains from panoramic perception, characterize how they relate. Three relationships: tension (disagree), resonance (reinforce from different angles), orthogonality (address unrelated aspects).

Use tension-resonance map:

```
Tension-Resonance Map
+-------------------+-------------------+-------------------------------+
| Domain Pair       | Relationship      | Detail                        |
+-------------------+-------------------+-------------------------------+
| A vs B            | tension /         |                               |
|                   | resonance /       |                               |
|                   | orthogonal        |                               |
|   Evidence:       |                   | What specifically disagrees,  |
|                   |                   | reinforces, or is unrelated?  |
|   Implication:    |                   | What does this relationship   |
|                   |                   | suggest for the whole?        |
+-------------------+-------------------+-------------------------------+
| A vs C            | ...               | ...                           |
+-------------------+-------------------+-------------------------------+
| B vs C            | ...               | ...                           |
+-------------------+-------------------+-------------------------------+
```

Fill one row per domain pair. For N domains: N(N-1)/2 pairs. Over ten rows? Group related domains first, map between groups.

Prioritize tensions — carry most integrative info. Resonances confirm. Orthogonalities can sit aside. Tensions demand resolution. Gestalt lives in how they resolve.

**Got:** Completed map. Every domain pair has characterized relationship with specific evidence. At least one real tension found. No tensions? Domains maybe not different enough for emergence.

**If fail:** All pairs show resonance? Domains agree at surface only. Dig deeper: where do they agree for different reasons? Agreement-for-different-reasons is hidden tension. Nothing characterizable? Panoramic perception from `expand-awareness` too shallow — go back, deepen domain observations before integrating.

### Step 2: Find Figure

Gestalt psych: figure emerges from ground. Ground = tension-resonance map from Step 1. Figure = dominant pattern unifying most domains with fewest contradictions.

1. Scan map for clusters: which groups of domains resonate? Clusters suggest candidate figures
2. For each candidate, ask: "What single perspective makes sense of most observations?"
3. Figure not compromise (weaken each domain until agree). Not selection (pick strongest). New frame recontextualizing domain observations
4. Test: state candidate in one sentence. Feels like it belongs to one input domain? Then not yet gestalt — domain answer in disguise
5. Look at tensions: true figure often lives in space between disagreeing domains, not in either domain's position

Signs figure emerging:
- Multiple tensions resolve at once under same reframe
- Contradictory observations become complementary aspects of same phenomenon
- Figure explains why each domain saw what it saw, including why they disagreed

**Got:** One or two candidate figures as single sentences. Each recontextualizes domain observations rather than selecting among them. Candidate accounts for major tensions in map.

**If fail:** No figure emerges? Integration premature. Two paths: (a) return to `expand-awareness`, add missing domain — figure maybe cannot form because key perspective absent; (b) sit with tensions, do not force resolution — some gestalts need incubation. Note state, return later.

### Step 3: Test Whole

Candidate gestalt from Step 2 must survive three tests before accepted.

**Test A — Tension accounting**: Walk every tension from Step 1. Does gestalt resolve it, reframe it, or explicitly accept as irreducible trade-off? Unaddressed tensions = premature gestalt.

**Test B — Single-domain origin**: Could this insight come from within single domain? If domain specialist nods and says "yes, already knew that," gestalt collapsed to domain answer. True gestalt surprises every domain — each recognizes own contribution but not whole.

**Test C — Coherence under rotation**: Mentally approach gestalt from each domain in turn. Hold shape? Or look different depending on view? Robust gestalt = same insight from any angle. Fragile one changes meaning under rotation.

Scoring:
- All three pass: go Step 4
- Test A fails: gestalt incomplete — back to Step 2 with unresolved tensions as extra constraints
- Test B fails: gestalt not emergent — back to Step 2, explicitly exclude single-domain framings
- Test C fails: gestalt not coherent — maybe two separate insights pretending to be one. Split, test each half independent

**Got:** Candidate passes all three tests, or failure mode identified and guides return to Step 2.

**If fail:** Candidate fails repeatedly after many iterations? Maybe domains do not form natural gestalt for this problem. Not every multi-domain observation makes emergence — sometimes honest answer is structured list of domain perspectives with tensions mapped. Deliver tension-resonance map as output instead of forcing false unity.

### Step 4: Name Insight

Articulate gestalt in single sentence that domain specialist would not write from within own domain alone. This sentence is deliverable.

1. Write sentence. Should be:
   - Specific enough to be actionable or falsifiable
   - General enough to encompass all contributing domains
   - Surprising to at least two input domains
   - Free of jargon from any single domain (or jargon deliberately recontextualized)
2. Test sentence against three criteria from Step 3 one final time
3. Optional: add one-paragraph expansion tracing how gestalt emerged from domain contributions — this is provenance, not insight itself
4. Record which domains contributed, which tensions were key, what figure-ground relationship was — metadata supports future integration tries

Named insight + provenance = input to `express-insight` for communication.

**Got:** Single sentence capturing gestalt + brief provenance paragraph. Sentence passes "no single domain" test. Reading it, practitioner of any contributing domain recognizes field's contribution but could not have arrived at statement alone.

**If fail:** Sentence keeps collapsing to domain language? Try negation test: state what gestalt is NOT. "This not security recommendation, not performance optimization, not architectural pattern — it is [the gestalt]." Negations clear domain frames, open space for emergent formulation.

## Checks

- [ ] Tension-resonance map completed for all domain pairs with specific evidence
- [ ] At least one real tension (not just difference of emphasis) identified
- [ ] Candidate gestalt articulated as reframe, not compromise or selection
- [ ] Test A passed: all major tensions resolved, reframed, or acknowledged
- [ ] Test B passed: no single domain could produce this insight alone
- [ ] Test C passed: gestalt holds shape under each domain's view
- [ ] Final insight in single sentence with provenance

## Pitfalls

- **Averaging**: Weakening each domain's position until surface agreement. Makes mush, not gestalt. Integration feels bland = averaging
- **King-making**: Pick strongest domain's answer, dress in multi-domain language. Test B catches — one specialist nods unsurprised = king-making
- **Premature closure**: Accepting first candidate without testing against tensions. First figure often most obvious, not most integrative
- **Forced unity**: Insisting gestalt must exist when domains truly orthogonal. Orthogonal domains make structured lists, not gestalts — valid outcome
- **Jargon blending**: Mixing technical terms from multiple domains into sentence that sounds integrative but means nothing. Every term in final sentence should be meaningful independent

## See Also

- `expand-awareness` — makes raw panoramic perception this skill integrates; always before integrate-gestalt
- `express-insight` — communicates formed gestalt to audience; always after integrate-gestalt
- `build-coherence` — selects among competing options via structured evaluation; integrate-gestalt makes new whole instead of choosing
- `brahma-bhaga` — creates from void; integrate-gestalt creates from abundance (many filled views)
- `meditate` — clears prior context for clean perception; useful before expand-awareness, which precedes this skill
- `coordinate-reasoning` — manages info flow in multi-path evaluation; complements when gestalt coordinates many reasoning threads
