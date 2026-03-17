---
name: integrate-gestalt
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

Form a coherent whole from the panoramic perception produced by `expand-awareness` — not by averaging, compromising, or selecting the best domain's answer, but by identifying the emergent pattern that could not have arisen from any single perspective alone.

## When to Use

- `expand-awareness` has surfaced raw perception from multiple domains and the observations need to become a unified insight
- Multiple domain perspectives are available but no single one accounts for all the evidence
- A problem has been analyzed from several angles and the separate analyses need to become more than a list
- The question "what does this all mean, taken together?" has no obvious answer
- When synthesis keeps collapsing into "pick the best domain" rather than forming something new
- Before `express-insight`, which requires a formed gestalt as its input

## Inputs

- **Required**: Multi-domain observations from `expand-awareness` (or equivalent panoramic perception)
- **Optional**: The original question or problem that prompted the multi-domain scan
- **Optional**: Known constraints that the gestalt must satisfy
- **Optional**: Prior failed integration attempts (what collapsed into single-domain answers)

## Procedure

### Step 1: Map Tensions

For each pair of domains identified in the panoramic perception, characterize how they relate. The three possible relationships are tension (they disagree), resonance (they reinforce from different angles), and orthogonality (they address unrelated aspects).

Use the tension-resonance map:

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

Fill one row for every domain pair. For N domains there are N(N-1)/2 pairs. If this exceeds ten rows, group related domains first and map between groups.

Prioritize tensions — they carry the most integrative information. Resonances confirm; orthogonalities can be set aside; but tensions demand resolution, and the gestalt is found in how they resolve.

**Expected:** A completed tension-resonance map where every domain pair has a characterized relationship with specific evidence. At least one genuine tension is identified — if there are no tensions, the domains may not be different enough to produce emergence.

**On failure:** If all pairs show resonance, the domains are agreeing at a surface level. Dig deeper: where do they agree for different reasons? Agreement-for-different-reasons is a hidden tension. If no relationships can be characterized, the panoramic perception from `expand-awareness` may be too shallow — return and deepen the domain-specific observations before attempting integration.

### Step 2: Find the Figure

In Gestalt psychology, the figure emerges from the ground. The ground is the tension-resonance map from Step 1. The figure is the dominant pattern that unifies the most domains with the fewest contradictions.

1. Scan the map for clusters: which groups of domains resonate with each other? These clusters suggest candidate figures
2. For each candidate figure, ask: "What single perspective makes sense of the most observations?"
3. The figure is not a compromise (weakening each domain until they agree) nor a selection (choosing the strongest domain). It is a new frame that recontextualizes the domain observations
4. Test: state the candidate figure in one sentence. Does it feel like it belongs to one of the input domains? If yes, it is not yet a gestalt — it is a domain answer wearing a disguise
5. Look specifically at the tensions: the true figure often lives in the space between the disagreeing domains, not in either domain's position

Signs the figure is emerging:
- Multiple tensions resolve simultaneously under the same reframe
- Domain observations that seemed contradictory become complementary aspects of the same phenomenon
- The figure explains why each domain saw what it saw, including why they disagreed

**Expected:** One or two candidate figures articulated as single sentences. Each candidate recontextualizes the domain observations rather than selecting among them. The candidate accounts for at least the major tensions in the map.

**On failure:** If no figure emerges, the integration may be premature. Two recovery paths: (a) return to `expand-awareness` and add a domain that was missing — sometimes the figure cannot form because a key perspective is absent; (b) sit with the tensions without forcing resolution — some gestalts need incubation rather than effort. Note the current state and return later.

### Step 3: Test the Whole

The candidate gestalt from Step 2 must survive three tests before it is accepted.

**Test A — Tension accounting**: Walk through every tension from Step 1. Does the gestalt resolve it, reframe it, or explicitly acknowledge it as an irreducible trade-off? Unaddressed tensions indicate a premature gestalt.

**Test B — Single-domain origin**: Could this insight have come from within a single domain? If a domain specialist would nod and say "yes, we already knew that," the gestalt has collapsed back into a domain answer. A true gestalt surprises every domain — each recognizes its contribution but not the whole.

**Test C — Coherence under rotation**: Mentally approach the gestalt from each domain's perspective in turn. Does it hold its shape, or does it look different depending on which domain you view it from? A robust gestalt is the same insight viewed from any angle; a fragile one changes meaning under rotation.

Scoring:
- All three tests pass: proceed to Step 4
- Test A fails: the gestalt is incomplete — return to Step 2 with the unresolved tensions as additional constraints
- Test B fails: the gestalt is not emergent — return to Step 2 and explicitly exclude single-domain framings
- Test C fails: the gestalt is not coherent — it may be two separate insights masquerading as one. Split and test each half independently

**Expected:** The candidate gestalt passes all three tests, or the failure mode is clearly identified and guides a return to Step 2.

**On failure:** If the candidate fails repeatedly after multiple iterations, consider that the domains may not form a natural gestalt for this problem. Not every multi-domain observation produces emergence — sometimes the honest answer is a structured list of domain perspectives with their tensions mapped. Deliver the tension-resonance map as the output rather than forcing a false unity.

### Step 4: Name the Insight

Articulate the gestalt in a single sentence that a domain specialist would not have written from within their domain alone. This sentence is the deliverable.

1. Write the sentence. It should be:
   - Specific enough to be actionable or falsifiable
   - General enough to encompass all contributing domains
   - Surprising to at least two of the input domains
   - Free of jargon from any single domain (or using jargon deliberately recontextualized)
2. Test the sentence against the three criteria from Step 3 one final time
3. Optionally, add a one-paragraph expansion that traces how the gestalt emerged from the domain contributions — this is the provenance, not the insight itself
4. Record which domains contributed, which tensions were key, and what the figure-ground relationship was — this metadata supports future integration attempts

The named insight, together with its provenance, becomes the input to `express-insight` for communication.

**Expected:** A single sentence capturing the gestalt, accompanied by a brief provenance paragraph. The sentence passes the "no single domain" test. Reading it, a practitioner of any contributing domain recognizes their field's contribution but could not have arrived at the statement alone.

**On failure:** If the sentence keeps collapsing into domain language, try the negation test: state what the gestalt is NOT. "This is not a security recommendation, and not a performance optimization, and not an architectural pattern — it is [the gestalt]." The negations clear the domain frames and create space for the emergent formulation.

## Validation

- [ ] A tension-resonance map was completed for all domain pairs with specific evidence
- [ ] At least one genuine tension (not just difference of emphasis) was identified
- [ ] The candidate gestalt was articulated as a reframe, not a compromise or selection
- [ ] Test A passed: all major tensions are resolved, reframed, or acknowledged
- [ ] Test B passed: no single domain could have produced this insight alone
- [ ] Test C passed: the gestalt holds its shape when viewed from each domain's perspective
- [ ] The final insight is expressed in a single sentence with provenance

## Common Pitfalls

- **Averaging**: Weakening each domain's position until they superficially agree. This produces mush, not gestalt. If the integration feels bland, it is averaging
- **King-making**: Selecting the strongest domain's answer and dressing it in multi-domain language. Test B catches this — if one domain specialist would nod unsurprised, it is king-making
- **Premature closure**: Accepting the first candidate figure without testing it against tensions. The first figure that emerges is often the most obvious, not the most integrative
- **Forced unity**: Insisting that a gestalt must exist when the domains are genuinely orthogonal. Orthogonal domains produce structured lists, not gestalts — and that is a valid outcome
- **Jargon blending**: Combining technical terms from multiple domains into a sentence that sounds integrative but means nothing. Every term in the final sentence should be independently meaningful

## Related Skills

- `expand-awareness` — produces the raw panoramic perception that this skill integrates; always precedes integrate-gestalt
- `express-insight` — communicates the formed gestalt to its audience; always follows integrate-gestalt
- `build-coherence` — selects between competing options using structured evaluation; integrate-gestalt forms a new whole rather than choosing among existing options
- `brahma-bhaga` — creates from void; integrate-gestalt creates from abundance (multiple filled perspectives)
- `meditate` — clears prior context to enable clean perception; useful before expand-awareness, which precedes this skill
- `coordinate-reasoning` — manages information flow in multi-path evaluation; complementary when the gestalt involves coordinating multiple reasoning threads
