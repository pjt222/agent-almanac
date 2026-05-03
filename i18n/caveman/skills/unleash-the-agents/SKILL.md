---
name: unleash-the-agents
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Launch all available agents in parallel waves for open-ended hypothesis
  generation on problems where correct domain unknown. Use when face
  cross-domain problem with no clear starting point, when single-agent
  approaches stalled, or when diverse perspectives more valuable
  than deep expertise. Produces ranked hypothesis set with convergence
  analysis, adversarial refinement.
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

Consult all available agents in parallel waves. Generate diverse hypotheses for open-ended problems. Each agent reasons through unique domain lens — kabalist finds patterns via gematria, martial-artist proposes conditional branching, contemplative notices structure by sitting with data. Convergence across independent perspectives = primary signal hypothesis has merit.

## When Use

- Face cross-domain problem where correct approach unknown
- Single-agent or single-domain approach stalled or produced no signal
- Problem benefits from genuinely diverse perspectives (not more compute)
- Need hypothesis generation, not execution (use teams for execution)
- High-stakes decisions where missing non-obvious angle carries real cost

## Inputs

- **Required**: Problem brief — clear description of problem, 5+ concrete examples, what counts as solution
- **Required**: Verification method — how to test whether hypothesis correct (programmatic test, expert review, null model comparison)
- **Optional**: Agent subset — specific agents to include or exclude (default: all registered agents)
- **Optional**: Wave size — number of agents per wave (default: 10)
- **Optional**: Output format — structured template for agent responses (default: hypothesis + reasoning + confidence + testable prediction)

## Steps

### Step 1: Prepare Brief

Write problem brief any agent can understand regardless of domain expertise. Include:

1. **Problem statement**: What trying to discover or decide (1-2 sentences)
2. **Examples**: At least 5 concrete input/output examples or data points (more = better — 3 too few for most agents to find patterns)
3. **Known constraints**: What already known, what already tried
4. **Success criteria**: How to recognize correct hypothesis
5. **Output template**: Exact format wanted in responses

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

**Got:** Brief self-contained — agent receiving only this text has all needed to reason about problem.

**If fail:** Cannot articulate 5 examples or verification method? Problem not ready for multi-agent consultation. Narrow scope first.

### Step 2: Plan Waves

List all available agents. Divide into waves of ~10. Ordering matters not for first 2 waves. For subsequent waves, inter-wave knowledge injection improves results.

```bash
# List all agents from registry
grep '  - id: ' agents/_registry.yml | sed 's/.*- id: //' | shuf
```

Assign agents to waves. Plan for 4 waves initial. May not need all (see early stopping in Step 4).

| Wave | Agents | Brief variant |
|------|--------|---------------|
| 1-2 | 20 agents | Standard brief |
| 3 | 10 agents + advocatus-diaboli | Brief + emerging consensus + adversarial challenge |
| 4+ | 10 agents each | Brief + "X is confirmed. Focus on edge cases and failures." |

**Got:** Wave assignment table with all agents allocated. Include `advocatus-diaboli` in Wave 3 (not later) so adversarial pass informs subsequent waves.

**If fail:** Fewer than 20 agents available? Reduce to 2-3 waves. Pattern still works with as few as 10 agents. Convergence signals weaker.

### Step 3: Launch Waves

Launch each wave as parallel agents. Use `sonnet` model for cost efficiency (value comes from perspective diversity, not individual depth).

#### Option A: TeamCreate (recommended for full unleash)

Use Claude Code's `TeamCreate` tool to set up coordinated team with task tracking. TeamCreate is deferred tool — fetch first via `ToolSearch("select:TeamCreate")`.

1. Create team:
   ```
   TeamCreate({ team_name: "unleash-wave-1", description: "Wave 1: open-ended hypothesis generation" })
   ```
2. Create task per agent using `TaskCreate` with brief and domain-specific framing
3. Spawn each agent as teammate using `Agent` tool with `team_name: "unleash-wave-1"` and `subagent_type` set to agent's type (e.g., `kabalist`, `geometrist`)
4. Assign tasks to teammates via `TaskUpdate` with `owner`
5. Monitor progress via `TaskList` — teammates mark tasks complete as they finish
6. Between waves, shut down current team via `SendMessage({ type: "shutdown_request" })` and create next team with updated brief (Step 4)

Built-in coordination: shared task list tracks which agents responded. Teammates can be messaged for follow-up. Lead manages wave transitions through task assignment.

#### Option B: Raw Agent spawning (simpler, for smaller runs)

For each agent in wave, spawn with brief and domain-specific framing:

```
Use the [agent-name] agent to analyze this problem through your domain expertise.
[Paste the brief]
Think about this from your specific perspective as a [agent-description].
[For non-technical agents: add a domain-specific framing, e.g., "What patterns
does your tradition recognize in systems that exhibit this kind of threshold behavior?"]
Respond exactly in the requested format.
```

Launch all agents in wave simultaneous via Agent tool with `run_in_background: true`. Wait for wave to complete before launching next wave (enable inter-wave knowledge injection in Step 4).

#### Choosing between options

| | TeamCreate | Raw Agent |
|---|---|---|
| Best for | Tier 3 full unleash (40+ agents) | Tier 2 panel (5-10 agents) |
| Coordination | Task list, messaging, ownership | Fire-and-forget, manual collection |
| Inter-wave handoff | Task status carries over | Must track manually |
| Overhead | Higher (team setup per wave) | Lower (single tool call per agent) |

**Got:** Each wave returns ~10 structured responses within 2-5 minutes. Agents that fail to respond or return off-format output noted but don't block pipeline.

**If fail:** More than 50% of wave fails? Check brief clarity. Common cause: output template ambiguous, or examples insufficient for non-domain agents to reason about.

### Step 4: Inject Inter-Wave Knowledge (and Evaluate Early Stopping)

After waves 1-2, extract emerging signal before launching next wave.

1. Scan responses from completed waves for recurring themes
2. Identify most common hypothesis family (convergence signal)
3. **Check early stopping threshold**: top family already exceeds 3x null model expectation after 20 agents? Strong signal. Plan Wave 3 as adversarial + refinement wave. Consider stopping after it
4. Update brief for next wave:

```markdown
**Update from prior waves**: [N] agents independently proposed [hypothesis family].
Build on this — what explains the remaining cases where this hypothesis fails?
Do NOT simply restate this finding. Extend, challenge, or refine it.
```

**Early stopping guidance**: Not every unleash needs all agents. For well-defined problem domains (codebase analysis), convergence often stabilizes at 30-40 agents. For abstract or open-ended problems (unknown mathematical transformations), full roster adds value because correct domain genuinely unpredictable. Check convergence after each wave — if top family's count and null-model ratio plateaued, additional waves yield diminishing returns.

Prevents rediscovery (where later waves independently re-derive what earlier waves already found). Directs later agents toward edges of problem.

**Got:** Later waves produce more nuanced, targeted hypotheses addressing gaps in emerging consensus.

**If fail:** No convergence after 2 waves? Problem may be too unconstrained. Consider narrowing scope or providing more examples.

### Step 5: Collect and Deduplicate

After all waves complete, gather all responses into single document. Deduplicate by grouping hypotheses into families:

1. Extract all hypothesis statements
2. Cluster by mechanism (not wording — "modular arithmetic mod 94" and "cyclic group over Z_94" same family)
3. Count independent discoveries per family
4. Rank by convergence — families discovered by more agents independently rank higher

**Got:** Ranked list of hypothesis families with convergence counts, contributing agents, representative testable predictions.

**If fail:** Every hypothesis unique (no convergence)? Signal-to-noise ratio too low. Either problem needs more examples, or agents need tighter output format.

### Step 6: Verify Against Null Model

Test top hypothesis against null model. Ensure convergence meaningful, not artifact of shared training data.

- **Programmatic verification**: Hypothesis produces testable formula or algorithm? Run against held-out examples
- **Null model**: Estimate probability that N agents converge on same hypothesis family by chance (e.g., K reasonable hypothesis families → random convergence probability ~N/K)
- **Threshold**: Signal meaningful if convergence exceeds 3x null model expectation

**Got:** Top hypothesis family significantly exceeds chance-level convergence and/or passes programmatic verification.

**If fail:** Top hypothesis fails verification? Check second-ranked family. No family passes? Problem may need different approach (deeper single-expert analysis, more data, reformulated examples).

### Step 7: Adversarial Refinement

**Preferred timing: Wave 3, not post-synthesis.** Including `advocatus-diaboli` in Wave 3 (alongside inter-wave knowledge injection) more effective than standalone adversarial pass after all waves complete. Early challenge lets Waves 4+ refine against critique rather than piling onto unchallenged consensus.

Adversarial pass already part of Wave 3? This step becomes final check. Not? (e.g., ran all waves without it) — spawn `advocatus-diaboli` (or `senior-researcher`) now. For structured pass, use `TeamCreate` to stand up review team with both agents working in parallel against consensus:

```
Here is the consensus hypothesis from [N] independent agents:
[Hypothesis]
[Supporting evidence and convergence stats]

Your job: find the strongest counterarguments. Where does this fail?
What alternative explanations are equally consistent with the evidence?
What experiment would definitively falsify this hypothesis?
```

**Got:** Set of counterarguments, edge cases, falsification experiment. Hypothesis survives adversarial scrutiny? Ready for integration. Good adversarial pass sometimes *partially defends* consensus — finds design better than alternatives even if imperfect.

**If fail:** Adversarial agent finds fatal flaw? Feed critique back into targeted follow-up wave (Tier 3+ iterative mode — select 5-10 agents best positioned to address specific critique).

### Step 8: Hand Off to Teams

Unleash finds problems. Teams solve them. Convert verified hypothesis families into actionable issues. Assemble focused teams to resolve each.

1. Create GitHub issue per verified hypothesis family (use `create-github-issues` skill)
2. Prioritize issues by convergence strength and impact
3. For each issue, assemble small team via `TeamCreate`:
   - Predefined team definition in `teams/` matches problem domain? Use it
   - No fitting team? Default to `opaque-team` (N shapeshifters with adaptive role assignment) — handles unknown problem shapes without requiring custom composition
   - Include at least one non-technical agent (e.g., `advocatus-diaboli`, `contemplative`) — they catch implementation risks technical agents miss
   - Use REST checkpoints between phases to prevent rushing
4. Pipeline: **unleash → triage → team-per-issue → resolve**

**Got:** Each hypothesis family maps to tracked issue with team assigned. Unleash produced diagnosis. Teams produce fix.

**If fail:** Team composition doesn't match problem? Reassign. Shapeshifter agents can research and design but lack write tools — team lead must apply their code suggestions.

## Checks

- [ ] All available agents consulted (or deliberate subset chosen with justification)
- [ ] Responses collected in structured, parseable format
- [ ] Hypotheses deduplicated, ranked by independent convergence
- [ ] Top hypothesis verified against null model or programmatic test
- [ ] Adversarial pass challenged consensus
- [ ] Final hypothesis includes testable predictions, known limitations

## Pitfalls

- **Too few examples in brief**: Agents need 5+ examples to find patterns. With 3 examples, most agents resort to surface-level pattern matching or template echo (repeat brief back in different words).
- **No verification path**: Without way to test hypotheses, can't distinguish signal from noise. Convergence alone necessary but not sufficient.
- **Metaphorical responses**: Domain-specialist agents (mystic, shaman, kabalist) may respond with rich metaphorical reasoning hard to parse programmatic. Include "Express your hypothesis as a testable formula or algorithm" in output template.
- **Rediscovery across waves**: Without inter-wave knowledge injection, waves 3-7 independently rediscover what waves 1-2 already found. Always update brief between waves.
- **Over-interpret convergence**: 43% convergence on mechanism family sounds impressive — but check base rate. Only 3 plausible mechanism families? Random convergence ~33%.
- **Expect single-family dominance**: Abstract problems (pattern recognition, cryptography) tend to produce one dominant hypothesis family. Multi-dimensional problems (codebase analysis, system design) produce broader convergence across multiple valid families — expected and healthy, not failure of pattern.
- **Generic framing for non-technical agents**: Quality of non-technical agent's contribution depends on how brief frames problem in their domain language. "What does your tradition say about systems at this threshold?" produces structural insight. Generic brief produces nothing. Invest in domain-specific framing for agents outside problem's natural domain.
- **Use this for execution**: Pattern generates hypotheses, not implementations. Once verified hypotheses, convert to issues, hand off to teams (Step 8). Pipeline: unleash → triage → team-per-issue.

## See Also

- `forage-solutions` — ant colony optimization for exploring solution spaces (complementary: narrower scope, deeper exploration)
- `build-coherence` — bee democracy for selecting among competing approaches (use after this skill to choose between top hypotheses)
- `coordinate-reasoning` — stigmergic coordination for managing information flow between agents
- `coordinate-swarm` — broader swarm coordination patterns for distributed systems
- `expand-awareness` — open perception before narrowing (complementary: use as individual agent preparation)
- `meditate` — clear context noise before launching (recommended before Step 1)
