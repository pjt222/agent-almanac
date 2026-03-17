---
name: adaptic
description: >
  Master skill composing the 5-step synoptic cycle for panoramic synthesis
  across multiple domains. Orchestrates meditate, expand-awareness, observe,
  awareness, integrate-gestalt, and express-insight into a coherent process
  that produces unified understanding rather than sequential compromise. Use
  when a problem genuinely spans 3+ domains and the interactions between
  domains matter more than depth in any one, when sequential analysis feels
  like compromise rather than integration, or before major architectural
  decisions affecting multiple stakeholders.
license: MIT
allowed-tools: Read Write Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: synoptic
  complexity: advanced
  language: natural
  tags: synoptic, adaptic, panoramic, synthesis, gestalt, meta-skill
---

# Adaptic

Compose the 5-step synoptic cycle to achieve panoramic synthesis across multiple domains. Where sequential analysis produces compromise ("a little of each"), the synoptic cycle produces integration — a unified understanding that holds all domains simultaneously and finds the emergent whole.

## When to Use

- A problem genuinely spans 3+ domains and the *interactions between domains* matter more than depth in any one
- Sequential analysis (polymath style) has been tried but the synthesis feels like compromise rather than integration
- Existing approaches feel like "a little of each" rather than a unified vision
- Before major architectural decisions affecting multiple stakeholders
- When domain experts disagree and the resolution lies *between* their perspectives, not within any one

## When NOT to Use

- Single-domain problems — use the domain agent directly
- Well-understood trade-offs where polymath-style sequential analysis suffices
- Self-care or wellness contexts — use the tending team instead
- When speed matters more than depth — the full cycle requires sustained attention

## Inputs

- **Required**: The problem or question requiring multi-domain synthesis
- **Optional**: Explicit list of domains to hold (default: auto-detect from problem context)
- **Optional**: Depth setting — `light`, `standard`, or `deep` (default: `standard`)
- **Optional**: Expression form — `narrative`, `diagram`, `table`, or `recommendation` (default: `auto`)

## Configuration

```yaml
settings:
  depth: standard          # light (skip meditate), standard, deep (extended perceive)
  domains: auto            # auto-detect or explicit list
  expression_form: auto    # narrative, diagram, table, recommendation
```

## Procedure

### Step 1: Clear — Empty the Workspace

Run the `meditate` skill to clear prior context, assumptions, and single-domain bias.

1. Execute the full meditate procedure: prepare, anchor, observe distractions, close
2. Pay special attention to domain bias — the tendency to frame the problem through whichever domain was most recently active
3. Clear any premature solutions that arrived before the full picture was visible
4. If `depth: light` is set, abbreviate to a brief context-clearing pause rather than the full meditation

**Expected:** The workspace is empty. No domain has priority. No solution has been pre-selected. The agent is in a neutral, receptive state ready to hold multiple perspectives simultaneously.

**On failure:** If a particular domain keeps asserting itself as "the real problem," name that bias explicitly: "I notice I am framing this as primarily a [domain] problem." Naming the bias loosens its grip. If clearing fails entirely, the problem may genuinely be single-domain — reconsider whether the synoptic cycle is needed.

### Step 2: Open — Enter Panoramic Mode

Run the `expand-awareness` skill to shift from narrow focus to wide-field perception.

1. Inventory all domains relevant to the problem — do not pre-filter or rank them
2. For each domain, note its core concerns, constraints, and values without evaluating
3. Soften the focus: hold all domains in awareness simultaneously rather than cycling through them one at a time
4. Resist the pull to "start solving" — this step is purely about opening the field of view
5. If domains were provided explicitly in the inputs, use those as the starting set but remain open to discovering additional relevant domains

**Expected:** A panoramic field is open. All relevant domains are held in awareness simultaneously. The agent can sense the full landscape without zooming into any single domain. The feeling is spacious rather than overwhelming.

**On failure:** If the domain list feels incomplete, ask: "What perspective is missing that would change the picture?" If simultaneous awareness collapses into sequential scanning (domain A, then B, then C), slow down — the goal is to hold the whole field, not to tour its parts. If more than 7 domains are active, group related domains into clusters to reduce cognitive load while maintaining breadth.

### Step 3: Perceive — Notice Cross-Domain Patterns

While maintaining panoramic awareness, run `observe` and `awareness` to notice patterns, tensions, and resonances *across* all visible domains.

1. Hold the panoramic field open from Step 2 — do not narrow focus
2. Run `observe` to notice what is actually present: what patterns repeat across domains? what tensions exist between domains? what resonances connect seemingly unrelated concerns?
3. Run `awareness` to notice what is *not* being seen: which domains are being subtly ignored? where are blind spots? what assumptions are operating below the surface?
4. Record cross-domain observations without interpreting them yet:
   - **Tensions**: where domains pull in opposite directions
   - **Resonances**: where domains reinforce or echo each other
   - **Gaps**: where no domain addresses a concern that the whole picture reveals
   - **Surprises**: where a domain contributes something unexpected to the picture
5. If `depth: deep` is set, extend this step — cycle through observe and awareness multiple times, allowing subtler patterns to surface

The critical discipline: perceive across all domains simultaneously, not each domain in turn. Sequential perception loses the cross-domain patterns that are the entire point of the synoptic cycle.

**Expected:** A rich set of cross-domain observations — tensions, resonances, gaps, and surprises. These observations span the boundaries between domains rather than living within any single one. The agent has noticed something that would not be visible from any single domain's perspective.

**On failure:** If observations are all within single domains ("in domain A, I notice X"), the panoramic field has collapsed. Return to Step 2 and re-open. If no cross-domain patterns emerge, the problem may not require synoptic treatment — it may be genuinely decomposable into independent domain problems. If the perceive step produces an overwhelming number of observations, prioritize tensions (they are where integration happens).

### Step 4: Integrate — Form the Emergent Whole

Run the `integrate-gestalt` skill to synthesize cross-domain observations into a unified understanding.

1. Map the tensions identified in Step 3 — do not resolve them prematurely; hold them as creative constraints
2. Find the figure: what unified understanding emerges when all observations are held together? This is not a compromise or average — it is a new pattern that includes but transcends the individual domain perspectives
3. Test the whole: does the integrated understanding honor each domain's core concerns? Does it resolve tensions or merely paper over them?
4. Name the insight in one clear statement — if it cannot be stated simply, the integration is not yet complete
5. Verify that the insight is genuinely emergent: could it have been reached by analyzing domains sequentially? If yes, the synoptic cycle added no value and sequential analysis would have sufficed

**Expected:** A single integrated understanding that holds all domains simultaneously. The insight feels like discovery rather than construction — it emerged from the whole rather than being assembled from parts. Each domain's core concerns are honored, and the tensions between domains are resolved rather than compromised.

**On failure:** If integration produces "a little of each domain" rather than a unified whole, the gestalt has not formed. Return to Step 3 and look for the tensions that are being avoided — integration happens *through* tension, not around it. If no gestalt forms after extended effort, decompose: find the 2-3 domains with the strongest tensions and integrate those first, then expand.

### Step 5: Express — Communicate the Integrated Understanding

Run the `express-insight` skill to communicate the synthesis to the intended audience.

1. Assess the audience: what domains are they familiar with? what framing will make the integrated insight accessible?
2. Choose the expression form (or use the one specified in inputs):
   - **Narrative**: for audiences that need to understand the journey from parts to whole
   - **Diagram**: for audiences that need to see structural relationships
   - **Table**: for audiences that need to compare domain perspectives systematically
   - **Recommendation**: for audiences that need an actionable decision
3. Express the integrated understanding with transparency: show which domains contributed, where tensions were resolved, and what the emergent insight adds beyond any single perspective
4. Invite challenge: explicitly note which aspects of the integration are strongest and which are most speculative

**Expected:** A clear, well-formed expression of the integrated understanding that is accessible to the intended audience. The expression shows its work — the audience can see how domain perspectives contributed to the whole. The form matches the audience's needs.

**On failure:** If the expression feels like a list of domain perspectives rather than an integrated whole, the insight from Step 4 has been lost in translation. Return to the one-statement summary from Step 4 and build the expression outward from that center. If the audience framing is wrong, ask: "Who needs this and what decision does it inform?"

## Validation

- [ ] Step 1 (Clear) was executed — prior context and domain bias were explicitly released
- [ ] Step 2 (Open) produced a panoramic field holding 3+ domains simultaneously
- [ ] Step 3 (Perceive) identified cross-domain patterns (not just within-domain observations)
- [ ] Step 4 (Integrate) produced a single emergent insight that transcends any individual domain
- [ ] Step 5 (Express) communicated the insight in a form appropriate to the audience
- [ ] The final output could not have been produced by sequential single-domain analysis
- [ ] Each domain's core concerns are honored in the integrated understanding
- [ ] Tensions between domains were resolved through integration, not compromise

## Common Pitfalls

- **Sequential masquerading as simultaneous**: Cycling through domains one at a time and then stapling the results together is not synoptic perception. The test: did the cross-domain *interactions* produce something new, or is the output just a concatenation of domain analyses?
- **Premature integration**: Jumping to a synthesis before the panoramic field has fully opened. Steps 2 and 3 build the perceptual foundation that makes genuine integration possible — rushing them produces shallow synthesis.
- **Compromise instead of emergence**: Averaging domain perspectives ("50% security, 50% usability") is compromise, not integration. True integration finds a frame where both concerns are *fully* met, or it honestly names the irreducible trade-off.
- **Overuse on single-domain problems**: Not every problem needs panoramic synthesis. If the problem lives cleanly in one domain, synoptic treatment adds overhead without value. The "When NOT to Use" criteria exist for a reason.
- **Losing the insight in expression**: Step 4 produces a clear gestalt, but Step 5 fragments it back into a domain-by-domain list. Keep the integrated insight as the center of expression; domain details are supporting evidence, not the main structure.
- **Domain inflation**: Artificially expanding the domain count to justify synoptic treatment. Three genuinely relevant domains produce better synthesis than seven domains where four are peripheral.

## Related Skills

- `meditate` — Step 1 of the cycle; clears context and establishes neutral starting state
- `expand-awareness` — Step 2 of the cycle; shifts from narrow focus to panoramic perception
- `observe` — used in Step 3; notices what is present across the field
- `awareness` — used in Step 3; notices what is not being seen, reveals blind spots
- `integrate-gestalt` — Step 4 of the cycle; forms the emergent whole from cross-domain patterns
- `express-insight` — Step 5 of the cycle; communicates the integrated understanding
