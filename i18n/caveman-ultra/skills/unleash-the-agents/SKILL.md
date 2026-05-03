---
name: unleash-the-agents
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Launch all available agents in parallel waves for open-ended hypothesis
  generation on problems where the correct domain is unknown. Use when facing
  a cross-domain problem with no clear starting point, when single-agent
  approaches have stalled, or when diverse perspectives are more valuable
  than deep expertise. Produces a ranked hypothesis set with convergence
  analysis and adversarial refinement.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob Agent ToolSearch TeamCreate TaskCreate TaskUpdate TaskList SendMessage
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: swarm
  complexity: advanced
  language: multi
  tags: swarm, parallel, hypothesis-generation, multi-agent, brainstorming, convergence
---

# Unleash the Agents

Consult all agents in parallel waves → diverse hypotheses for open-ended problems. Each agent reasons through unique domain lens — kabalist via gematria, martial-artist via conditional branching, contemplative by sitting w/ data. Convergence across independent perspectives = primary signal of merit.

## Use When

- Cross-domain problem → correct approach unknown
- Single-agent|single-domain stalled or no signal
- Problem benefits from genuinely diverse perspectives (not more compute)
- Need hypothesis generation, not exec (use teams for exec)
- High-stakes → missing non-obvious angle costs

## In

- **Required**: Problem brief — clear description, 5+ concrete examples, what counts as solution
- **Required**: Verify method — how to test hypothesis (programmatic, expert review, null model)
- **Optional**: Agent subset — include|exclude (default: all registered)
- **Optional**: Wave size — agents per wave (default: 10)
- **Optional**: Out format — structured template (default: hypothesis + reasoning + confidence + testable prediction)

## Do

### Step 1: Brief

Write brief any agent can understand regardless of domain. Include:

1. **Problem**: Discover|decide (1-2 sent)
2. **Examples**: 5+ concrete in/out|data points (more better — 3 too few)
3. **Constraints**: Known + tried
4. **Success**: Recognize correct hypothesis
5. **Out template**: Exact format

```markdown
## Brief: [Problem Title]

**Problem**: [1-2 sentence statement]

**Examples**:
1. [Input] → [Output]  (explain what's known)
2. [Input] → [Output]
3. [Input] → [Output]
4. [Input] → [Output]
5. [Input] → [Output]

**Already tried**: [List failed approaches to avoid rediscovery]

**Success looks like**: [Testable criterion]

**Respond with**:
- Hypothesis: [Your proposed mechanism in one sentence]
- Reasoning: [Why your domain expertise suggests this]
- Confidence: [low/medium/high]
- Testable prediction: [If my hypothesis is correct, then X should be true]
```

**Got:** Self-contained brief — agent receiving only this has all to reason.

**If err:** Can't articulate 5 examples|verify method → problem not ready for multi-agent. Narrow scope first.

### Step 2: Plan Waves

List all agents, divide into waves of ~10. Order doesn't matter waves 1-2; subsequent waves → inter-wave knowledge injection improves results.

```bash
# List all agents from registry
grep '  - id: ' agents/_registry.yml | sed 's/.*- id: //' | shuf
```

Assign agents to waves. Plan 4 waves initially → may not need all (early stop Step 4).

| Wave | Agents | Brief variant |
|------|--------|---------------|
| 1-2 | 20 agents | Standard brief |
| 3 | 10 agents + advocatus-diaboli | Brief + emerging consensus + adversarial challenge |
| 4+ | 10 agents each | Brief + "X is confirmed. Focus on edge cases and failures." |

**Got:** Wave assignment table all agents allocated. `advocatus-diaboli` in Wave 3 (not later) → adversarial informs subsequent waves.

**If err:** < 20 agents → reduce 2-3 waves. Pattern works w/ as few as 10, weaker convergence signals.

### Step 3: Launch Waves

Launch each wave parallel. `sonnet` model → cost efficiency (value from perspective diversity, not depth).

#### Option A: TeamCreate (recommended for full unleash)

`TeamCreate` for coordinated team w/ task tracking. Deferred tool → fetch via `ToolSearch("select:TeamCreate")`.

1. Create team:
   ```
   TeamCreate({ team_name: "unleash-wave-1", description: "Wave 1: open-ended hypothesis generation" })
   ```
2. `TaskCreate` per agent → brief + domain-specific framing
3. Spawn each agent as teammate via `Agent` w/ `team_name: "unleash-wave-1"` + `subagent_type` (e.g., `kabalist`, `geometrist`)
4. Assign tasks via `TaskUpdate` w/ `owner`
5. Monitor via `TaskList` → teammates mark completed
6. Between waves → shut down via `SendMessage({ type: "shutdown_request" })` + create next w/ updated brief (Step 4)

Built-in coord: shared task list tracks responses, teammates messaged for follow-up, lead manages wave transitions.

#### Option B: Raw Agent spawning (simpler, smaller runs)

Per agent in wave, spawn w/ brief + domain framing:

```
Use the [agent-name] agent to analyze this problem through your domain expertise.
[Paste the brief]
Think about this from your specific perspective as a [agent-description].
[For non-technical agents: add a domain-specific framing, e.g., "What patterns
does your tradition recognize in systems that exhibit this kind of threshold behavior?"]
Respond exactly in the requested format.
```

Launch all in wave simultaneous via Agent w/ `run_in_background: true`. Wait for wave complete before next (inter-wave knowledge injection Step 4).

#### Choosing options

| | TeamCreate | Raw Agent |
|---|---|---|
| Best for | Tier 3 full unleash (40+ agents) | Tier 2 panel (5-10 agents) |
| Coordination | Task list, messaging, ownership | Fire-and-forget, manual collection |
| Inter-wave handoff | Task status carries over | Must track manually |
| Overhead | Higher (team setup per wave) | Lower (single tool call per agent) |

**Got:** Each wave returns ~10 structured responses in 2-5 min. Failed|off-format noted but no block.

**If err:** > 50% wave fails → check brief clarity. Common: out template ambiguous|examples insufficient for non-domain agents.

### Step 4: Inject Inter-Wave Knowledge (+ Eval Early Stop)

After waves 1-2, extract emerging signal before next.

1. Scan responses → recurring themes
2. ID most common hypothesis family (convergence signal)
3. **Early stop check**: top family > 3x null model expectation after 20 agents → strong signal. Plan Wave 3 as adversarial + refinement, consider stop after.
4. Update brief for next wave:

```markdown
**Update from prior waves**: [N] agents independently proposed [hypothesis family].
Build on this — what explains the remaining cases where this hypothesis fails?
Do NOT simply restate this finding. Extend, challenge, or refine it.
```

**Early stop guidance**: Not every unleash needs all agents. Well-defined domains (codebase analysis) → convergence stabilizes 30-40 agents. Abstract|open-ended (unknown math transformations) → full roster adds value because correct domain genuinely unpredictable. Check convergence after each wave → top family count + null-model ratio plateaued → diminishing returns.

Prevents rediscovery (later waves re-deriving earlier finds) + directs later agents to edges.

**Got:** Later waves → more nuanced, targeted hypotheses addressing gaps in emerging consensus.

**If err:** No convergence after 2 waves → too unconstrained. Narrow scope or more examples.

### Step 5: Collect + Dedupe

After waves complete, gather responses → single doc. Dedupe by grouping into families:

1. Extract all hypothesis statements
2. Cluster by mechanism (not wording — "modular arithmetic mod 94" + "cyclic group over Z_94" same family)
3. Count independent discoveries per family
4. Rank by convergence: families w/ more independent discoveries higher

**Got:** Ranked list of families w/ convergence counts, contributing agents, representative testable predictions.

**If err:** Every hypothesis unique (no convergence) → S/N too low. Need more examples or tighter out format.

### Step 6: Verify vs Null Model

Test top hypothesis vs null model → ensure convergence meaningful, not training data artifact.

- **Programmatic verify**: Hypothesis produces testable formula|algo → run vs held-out examples
- **Null model**: Estimate prob N agents converge by chance (K reasonable families → random ~N/K)
- **Threshold**: Signal meaningful if convergence > 3x null model

**Got:** Top family significantly exceeds chance-level convergence and/or passes programmatic verify.

**If err:** Top fails verify → check 2nd-ranked. None passes → different approach (deeper single-expert, more data, reformulated examples).

### Step 7: Adversarial Refinement

**Preferred timing: Wave 3, not post-synthesis.** `advocatus-diaboli` in Wave 3 (alongside inter-wave injection) > standalone after all waves. Early challenge → Waves 4+ refine vs critique not pile on unchallenged consensus.

If adversarial part of Wave 3, this = final check. If not (ran all waves w/o it) → spawn `advocatus-diaboli` (or `senior-researcher`) now. Structured pass → `TeamCreate` for review team w/ both parallel vs consensus:

```
Here is the consensus hypothesis from [N] independent agents:
[Hypothesis]
[Supporting evidence and convergence stats]

Your job: find the strongest counterarguments. Where does this fail?
What alternative explanations are equally consistent with the evidence?
What experiment would definitively falsify this hypothesis?
```

**Got:** Counterarguments, edge cases, falsification experiment. Survives adversarial → ready for integration. Good adversarial sometimes *partially defends* consensus → design better than alts even if imperfect.

**If err:** Adversarial finds fatal flaw → feed critique → targeted follow-up wave (Tier 3+ iterative — 5-10 agents best for critique).

### Step 8: Hand Off → Teams

Unleash finds problems; teams solve. Convert verified families → actionable issues, assemble focused teams.

1. GitHub issue per verified family (use `create-github-issues`)
2. Prioritize by convergence strength + impact
3. Per issue, assemble small team via `TeamCreate`:
   - Predefined team in `teams/` matches → use it
   - No fit → default `opaque-team` (N shapeshifters, adaptive role) → handles unknown shapes w/o custom comp
   - Include 1+ non-tech agent (`advocatus-diaboli`, `contemplative`) → catches implementation risks tech misses
   - REST checkpoints between phases → prevent rushing
4. Pipeline: **unleash → triage → team-per-issue → resolve**

**Got:** Each family maps → tracked issue w/ team. Unleash diagnosed; teams fix.

**If err:** Team comp doesn't match → reassign. Shapeshifters can research+design but lack write tools → lead applies code suggestions.

## Check

- [ ] All available agents consulted (or deliberate subset w/ justification)
- [ ] Responses collected in structured, parseable format
- [ ] Hypotheses deduped + ranked by independent convergence
- [ ] Top verified vs null model or programmatic test
- [ ] Adversarial pass challenged consensus
- [ ] Final hypothesis includes testable predictions + known limits

## Traps

- **Too few examples**: Agents need 5+. W/ 3 → surface pattern matching|template echo (brief back in different words).
- **No verify path**: W/o test, can't distinguish signal from noise. Convergence necessary but not sufficient.
- **Metaphorical responses**: Domain specialists (mystic, shaman, kabalist) → rich metaphor hard to parse programmatically. Include "Express as testable formula or algorithm" in template.
- **Rediscovery across waves**: W/o inter-wave injection → waves 3-7 rediscover what 1-2 found. Update brief between.
- **Over-interpret convergence**: 43% on family sounds impressive → check base rate. 3 plausible families → random ~33%.
- **Single-family dominance expectation**: Abstract problems (pattern recog, crypto) → one dominant family. Multi-dim (codebase, sys design) → broader convergence across multiple valid → expected, healthy, not failure.
- **Generic framing for non-tech**: Quality depends on framing in domain language. "What does your tradition say about systems at threshold?" → structural insight; generic → nothing. Invest in domain-specific framing.
- **Use for exec**: Pattern generates hypotheses, not implementations. Verified → convert to issues + teams (Step 8). Pipeline: unleash → triage → team-per-issue.

## →

- `forage-solutions` — ant colony opt for solution spaces (complementary: narrower, deeper)
- `build-coherence` — bee democracy → select among competing approaches (after this skill to choose between top hypotheses)
- `coordinate-reasoning` — stigmergic coord for managing info flow
- `coordinate-swarm` — broader swarm coord for distributed systems
- `expand-awareness` — open perception before narrow (complementary: individual agent prep)
- `meditate` — clear ctx noise before launch (recommended before Step 1)
