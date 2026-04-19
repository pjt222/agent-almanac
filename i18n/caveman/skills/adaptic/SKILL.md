---
name: adaptic
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
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

Compose 5-step synoptic cycle. Achieve panoramic synthesis across multiple domains. Where sequential analysis produces compromise ("a little of each"), synoptic cycle produces integration — unified understanding holds all domains together and finds emergent whole.

## When Use

- Problem genuinely spans 3+ domains and *interactions between domains* matter more than depth in any one
- Sequential analysis (polymath style) tried but synthesis feels like compromise rather than integration
- Existing approaches feel like "a little of each" rather than unified vision
- Before major architectural decisions affecting multiple stakeholders
- Domain experts disagree and resolution lies *between* their perspectives, not within any one

## When NOT to Use

- Single-domain problems — use domain agent directly
- Well-understood trade-offs where polymath-style sequential analysis suffices
- Self-care or wellness contexts — use tending team instead
- Speed matters more than depth — full cycle requires sustained attention

## Inputs

- **Required**: Problem or question requiring multi-domain synthesis
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

## Steps

### Step 1: Clear — Empty Workspace

Run `meditate` skill. Clear prior context, assumptions, single-domain bias.

1. Execute full meditate procedure: prepare, anchor, observe distractions, close
2. Pay special attention to domain bias — tendency to frame problem through whichever domain was most recently active
3. Clear any premature solutions arrived before full picture visible
4. If `depth: light` set, abbreviate to brief context-clearing pause rather than full meditation

**Got:** Workspace empty. No domain has priority. No solution pre-selected. Agent in neutral, receptive state ready to hold multiple perspectives together.

**If fail:** Particular domain keeps asserting itself as "real problem"? Name bias explicit: "I notice I am framing this as primarily a [domain] problem." Naming bias loosens its grip. Clearing fails entirely? Problem may genuinely be single-domain — reconsider whether synoptic cycle needed.

### Step 2: Open — Enter Panoramic Mode

Run `expand-awareness` skill. Shift from narrow focus to wide-field perception.

1. Inventory all domains relevant to problem — do not pre-filter or rank
2. For each domain, note its core concerns, constraints, values without evaluating
3. Soften focus: hold all domains in awareness together rather than cycling through one at time
4. Resist pull to "start solving" — this step purely about opening field of view
5. Domains provided explicitly in inputs? Use those as starting set but remain open to discovering additional relevant domains

**Got:** Panoramic field open. All relevant domains held in awareness together. Agent senses full landscape without zooming into any single domain. Feeling spacious rather than overwhelming.

**If fail:** Domain list feels incomplete? Ask: "What perspective is missing that would change picture?" Simultaneous awareness collapses into sequential scanning (domain A, then B, then C)? Slow down — goal is hold whole field, not tour its parts. More than 7 domains active? Group related domains into clusters to reduce cognitive load while keep breadth.

### Step 3: Perceive — Notice Cross-Domain Patterns

While maintain panoramic awareness, run `observe` and `awareness` to notice patterns, tensions, resonances *across* all visible domains.

1. Hold panoramic field open from Step 2 — do not narrow focus
2. Run `observe` to notice what actually present: what patterns repeat across domains? what tensions exist between domains? what resonances connect seemingly unrelated concerns?
3. Run `awareness` to notice what *not* being seen: which domains being subtly ignored? where blind spots? what assumptions operating below surface?
4. Record cross-domain observations without interpreting yet:
   - **Tensions**: where domains pull in opposite directions
   - **Resonances**: where domains reinforce or echo each other
   - **Gaps**: where no domain addresses concern that whole picture reveals
   - **Surprises**: where domain contributes something unexpected to picture
5. If `depth: deep` set, extend this step — cycle through observe and awareness multiple times, allow subtler patterns to surface

Critical discipline: perceive across all domains together, not each domain in turn. Sequential perception loses cross-domain patterns that are entire point of synoptic cycle.

**Got:** Rich set of cross-domain observations — tensions, resonances, gaps, surprises. These observations span boundaries between domains rather than living within any single one. Agent noticed something that would not be visible from any single domain's perspective.

**If fail:** Observations all within single domains ("in domain A, I notice X")? Panoramic field collapsed. Return to Step 2 and re-open. No cross-domain patterns emerge? Problem may not require synoptic treatment — may be genuinely decomposable into independent domain problems. Perceive step produces overwhelming number of observations? Prioritize tensions (where integration happens).

### Step 4: Integrate — Form Emergent Whole

Run `integrate-gestalt` skill. Synthesize cross-domain observations into unified understanding.

1. Map tensions identified in Step 3 — do not resolve prematurely; hold as creative constraints
2. Find figure: what unified understanding emerges when all observations held together? Not compromise or average — new pattern includes but transcends individual domain perspectives
3. Test whole: does integrated understanding honor each domain's core concerns? Does it resolve tensions or merely paper over them?
4. Name insight in one clear statement — if cannot be stated simply, integration not yet complete
5. Verify insight genuinely emergent: could have been reached by analyzing domains sequentially? If yes, synoptic cycle added no value and sequential analysis would have sufficed

**Got:** Single integrated understanding holds all domains together. Insight feels like discovery rather than construction — emerged from whole rather than assembled from parts. Each domain's core concerns honored. Tensions between domains resolved rather than compromised.

**If fail:** Integration produces "a little of each domain" rather than unified whole? Gestalt has not formed. Return to Step 3 and look for tensions being avoided — integration happens *through* tension, not around it. No gestalt forms after extended effort? Decompose: find 2-3 domains with strongest tensions, integrate those first, then expand.

### Step 5: Express — Communicate Integrated Understanding

Run `express-insight` skill. Communicate synthesis to intended audience.

1. Assess audience: what domains familiar with? what framing makes integrated insight accessible?
2. Choose expression form (or use one specified in inputs):
   - **Narrative**: for audiences need to understand journey from parts to whole
   - **Diagram**: for audiences need to see structural relationships
   - **Table**: for audiences need to compare domain perspectives systematically
   - **Recommendation**: for audiences need actionable decision
3. Express integrated understanding with transparency: show which domains contributed, where tensions resolved, what emergent insight adds beyond any single perspective
4. Invite challenge: explicit note which aspects of integration strongest and which most speculative

**Got:** Clear, well-formed expression of integrated understanding accessible to intended audience. Expression shows its work — audience sees how domain perspectives contributed to whole. Form matches audience's needs.

**If fail:** Expression feels like list of domain perspectives rather than integrated whole? Insight from Step 4 lost in translation. Return to one-statement summary from Step 4 and build expression outward from that center. Audience framing wrong? Ask: "Who needs this and what decision does it inform?"

## Checks

- [ ] Step 1 (Clear) executed — prior context and domain bias explicitly released
- [ ] Step 2 (Open) produced panoramic field holding 3+ domains together
- [ ] Step 3 (Perceive) identified cross-domain patterns (not just within-domain observations)
- [ ] Step 4 (Integrate) produced single emergent insight transcends any individual domain
- [ ] Step 5 (Express) communicated insight in form appropriate to audience
- [ ] Final output could not have been produced by sequential single-domain analysis
- [ ] Each domain's core concerns honored in integrated understanding
- [ ] Tensions between domains resolved through integration, not compromise

## Pitfalls

- **Sequential masquerading as simultaneous**: Cycling through domains one at time then stapling results together not synoptic perception. Test: did cross-domain *interactions* produce something new, or output just concatenation of domain analyses?
- **Premature integration**: Jumping to synthesis before panoramic field fully opened. Steps 2 and 3 build perceptual foundation that makes genuine integration possible — rushing them produces shallow synthesis.
- **Compromise instead of emergence**: Averaging domain perspectives ("50% security, 50% usability") is compromise, not integration. True integration finds frame where both concerns *fully* met, or honestly names irreducible trade-off.
- **Overuse on single-domain problems**: Not every problem needs panoramic synthesis. Problem lives cleanly in one domain? Synoptic treatment adds overhead without value. "When NOT to Use" criteria exist for reason.
- **Losing insight in expression**: Step 4 produces clear gestalt but Step 5 fragments back into domain-by-domain list. Keep integrated insight as center of expression; domain details are supporting evidence, not main structure.
- **Domain inflation**: Artificially expanding domain count to justify synoptic treatment. Three genuinely relevant domains produce better synthesis than seven domains where four are peripheral.

## See Also

- `meditate` — Step 1 of cycle; clears context and establishes neutral starting state
- `expand-awareness` — Step 2 of cycle; shifts from narrow focus to panoramic perception
- `observe` — used in Step 3; notices what present across field
- `awareness` — used in Step 3; notices what not being seen, reveals blind spots
- `integrate-gestalt` — Step 4 of cycle; forms emergent whole from cross-domain patterns
- `express-insight` — Step 5 of cycle; communicates integrated understanding
