---
name: adaptic
locale: caveman-ultra
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

5-step synoptic cycle → panoramic synthesis across domains. Sequential = compromise ("little of each"). Synoptic = integration → unified understanding holds all domains at once → emergent whole.

## Use When

- Problem spans 3+ domains, *interactions* > depth in any one
- Polymath sequential tried → synthesis feels like compromise
- Existing approaches = "little of each" not unified vision
- Before major architectural decisions, multi-stakeholder
- Domain experts disagree → resolution lives *between*

## Use NOT When

- Single-domain → use domain agent direct
- Well-understood trade-offs → polymath sequential enough
- Self-care/wellness → tending team
- Speed > depth → full cycle needs sustained attention

## In

- **Required**: Problem requiring multi-domain synthesis
- **Optional**: Explicit domain list (default: auto-detect)
- **Optional**: Depth — `light`, `standard`, `deep` (default: `standard`)
- **Optional**: Expression form — `narrative`, `diagram`, `table`, `recommendation` (default: `auto`)

## Config

```yaml
settings:
  depth: standard          # light (skip meditate), standard, deep (extended perceive)
  domains: auto            # auto-detect or explicit list
  expression_form: auto    # narrative, diagram, table, recommendation
```

## Do

### Step 1: Clear — Empty Workspace

Run `meditate` → clear prior ctx, assumptions, single-domain bias.

1. Full meditate proc: prepare, anchor, observe distractions, close
2. Domain bias = tendency to frame via recently-active domain
3. Clear premature solutions arrived pre-full-picture
4. `depth: light` → brief ctx-clearing pause

**→** Workspace empty. No domain priority. No solution pre-selected. Neutral receptive → hold multiple perspectives.

**If err:** Domain keeps asserting → name bias: "I frame this as primarily [domain]." Naming loosens. Clearing fails → genuinely single-domain → reconsider.

### Step 2: Open — Panoramic Mode

Run `expand-awareness` → narrow → wide-field perception.

1. Inventory all domains → no pre-filter/rank
2. Per domain: core concerns, constraints, values — no eval
3. Soften focus: hold all simultaneously vs cycling
4. Resist "start solving" → opening field only
5. Domains in inputs → starting set, open to more

**→** Panoramic field open. All domains simultaneous. Full landscape sensed. Spacious not overwhelming.

**If err:** List incomplete → "What missing would change picture?" Simultaneous → sequential scan → slow down. >7 domains → cluster related.

### Step 3: Perceive — Cross-Domain Patterns

While maintaining panoramic, run `observe` + `awareness` → notice patterns, tensions, resonances *across* domains.

1. Hold Step 2 field open → no narrow
2. `observe` → what present: patterns across domains? tensions? resonances?
3. `awareness` → what *not* seen: ignored domains? blind spots? surface assumptions?
4. Record cross-domain no interpret:
   - **Tensions**: domains pull opposite
   - **Resonances**: domains reinforce/echo
   - **Gaps**: no domain addresses, whole reveals
   - **Surprises**: domain unexpected contribution
5. `depth: deep` → cycle multiple times → subtler patterns

Critical: perceive across all simultaneously, not each in turn. Sequential loses cross-domain patterns = entire point.

**→** Rich cross-domain obs — tensions, resonances, gaps, surprises. Span boundaries not live within. Noticed something invisible from any single domain.

**If err:** All within single ("in domain A, I notice X") → field collapsed → Step 2. No cross-domain → problem not synoptic → genuinely decomposable. Overwhelming → prioritize tensions (integration happens there).

### Step 4: Integrate — Emergent Whole

Run `integrate-gestalt` → synthesize cross-domain obs → unified understanding.

1. Map Step 3 tensions → don't resolve prematurely → hold as creative constraints
2. Find figure: unified understanding when all held together? Not compromise/avg → new pattern includes+transcends individual
3. Test whole: honors each domain's core concerns? Resolves tensions or papers over?
4. Name insight one clear statement → unstatable simply = incomplete
5. Verify emergent: reachable sequentially? Yes → synoptic added no value → sequential suffices

**→** Single integrated understanding holding all simultaneously. Feels like discovery not construction — emerged from whole. Each domain honored, tensions resolved not compromised.

**If err:** "Little of each" not unified → gestalt not formed → Step 3, find avoided tensions — integration happens *through* tension. No gestalt → decompose: 2-3 strongest-tension domains first, then expand.

### Step 5: Express — Communicate

Run `express-insight` → communicate synthesis.

1. Assess audience: what domains familiar? framing makes accessible?
2. Expression form (or input):
   - **Narrative**: audience needs parts→whole journey
   - **Diagram**: structural relationships
   - **Table**: systematic comparison
   - **Recommendation**: actionable decision
3. Express w/ transparency: which domains contributed, where tensions resolved, emergent insight beyond any single
4. Invite challenge: which aspects strongest, which most speculative

**→** Clear expression accessible to audience. Shows work → audience sees domain contributions → whole. Form matches audience needs.

**If err:** Feels like list not integrated → insight lost → Step 4 one-statement summary, build outward from center. Wrong framing → "Who needs this and what decision does it inform?"

## Check

- [ ] Step 1 (Clear) ran → ctx + domain bias released
- [ ] Step 2 (Open) produced panoramic 3+ domains
- [ ] Step 3 (Perceive) cross-domain patterns (not within-domain)
- [ ] Step 4 (Integrate) single emergent transcends individual
- [ ] Step 5 (Express) form appropriate to audience
- [ ] Output unreachable by sequential single-domain
- [ ] Each domain's core concerns honored
- [ ] Tensions resolved through integration, not compromise

## Traps

- **Sequential masquerading as simultaneous**: Cycling domains + stapling results ≠ synoptic. Test: cross-domain *interactions* produced new, or just concatenation?
- **Premature integration**: Jump synthesis pre-panoramic field open. Steps 2+3 build foundation → rushing = shallow.
- **Compromise instead of emergence**: Avg ("50% security, 50% usability") = compromise. True integration finds frame where both *fully* met, or honestly names irreducible trade-off.
- **Overuse single-domain**: Not every problem panoramic. Single domain → synoptic adds overhead no value. "Use NOT When" exists.
- **Losing insight in expression**: Step 4 gestalt → Step 5 fragments back to domain list. Keep integrated insight center; domain details supporting evidence.
- **Domain inflation**: Artificially expand count → justify synoptic. 3 genuinely relevant > 7 where 4 peripheral.

## →

- `meditate` — Step 1; clears ctx + neutral state
- `expand-awareness` — Step 2; narrow → panoramic
- `observe` — Step 3; what present across field
- `awareness` — Step 3; what not seen, blind spots
- `integrate-gestalt` — Step 4; emergent whole from cross-domain
- `express-insight` — Step 5; communicate integrated understanding
