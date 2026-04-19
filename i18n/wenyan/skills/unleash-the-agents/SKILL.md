---
name: unleash-the-agents
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
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

Consult all available agents in parallel waves to generate diverse hypotheses for open-ended problems. Each agent reasons through its unique domain lens — a kabalist finds patterns via gematria, a martial-artist proposes conditional branching, a contemplative notices structure by sitting with the data. Convergence across independent perspectives is the primary signal that a hypothesis has merit.

## When to Use

- Facing a cross-domain problem where the correct approach is unknown
- A single-agent or single-domain approach has stalled or produced no signal
- The problem benefits from genuinely diverse perspectives (not just more compute)
- You need hypothesis generation, not execution (use teams for execution)
- High-stakes decisions where missing a non-obvious angle carries real cost

## Inputs

- **Required**: Problem brief — a clear description of the problem, 5+ concrete examples, and what counts as a solution
- **Required**: Verification method — how to test whether a hypothesis is correct (programmatic test, expert review, or null model comparison)
- **Optional**: Agent subset — specific agents to include or exclude (default: all registered agents)
- **Optional**: Wave size — number of agents per wave (default: 10)
- **Optional**: Output format — structured template for agent responses (default: hypothesis + reasoning + confidence + testable prediction)

## Procedure

### Step 1: Prepare the Brief

Write a problem brief that any agent can understand regardless of domain expertise. Include:

1. **Problem statement**: What you are trying to discover or decide (1-2 sentences)
2. **Examples**: At least 5 concrete input/output examples or data points (more is better — 3 is too few for most agents to find patterns)
3. **Known constraints**: What you already know, what has already been tried
4. **Success criteria**: How to recognize a correct hypothesis
5. **Output template**: The exact format you want responses in

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

**Expected:** A brief that is self-contained — an agent receiving only this text has everything needed to reason about the problem.

**On failure:** If you cannot articulate 5 examples or a verification method, the problem is not ready for multi-agent consultation. Narrow the scope first.

### Step 2: Plan the Waves

List all available agents and divide them into waves of ~10. Ordering does not matter for the first 2 waves; for subsequent waves, inter-wave knowledge injection improves results.

```bash
# List all agents from registry
grep '  - id: ' agents/_registry.yml | sed 's/.*- id: //' | shuf
```

Assign agents to waves. Plan for 4 waves initially — you may not need all of them (see early stopping in Step 4).

| Wave | Agents | Brief variant |
|------|--------|---------------|
| 1-2 | 20 agents | Standard brief |
| 3 | 10 agents + advocatus-diaboli | Brief + emerging consensus + adversarial challenge |
| 4+ | 10 agents each | Brief + "X is confirmed. Focus on edge cases and failures." |

**Expected:** A wave assignment table with all agents allocated. Include `advocatus-diaboli` in Wave 3 (not later) so the adversarial pass informs subsequent waves.

**On failure:** If fewer than 20 agents are available, reduce to 2-3 waves. The pattern still works with as few as 10 agents, though convergence signals are weaker.

### Step 3: Launch Waves

Launch each wave as parallel agents. Use `sonnet` model for cost efficiency (the value comes from perspective diversity, not individual depth).

#### Option A: TeamCreate (recommended for full unleash)

Use Claude Code's `TeamCreate` tool to set up a coordinated team with task tracking. TeamCreate is a deferred tool — fetch it first via `ToolSearch("select:TeamCreate")`.

1. Create the team:
   ```
   TeamCreate({ team_name: "unleash-wave-1", description: "Wave 1: open-ended hypothesis generation" })
   ```
2. Create a task per agent using `TaskCreate` with the brief and domain-specific framing
3. Spawn each agent as a teammate using the `Agent` tool with `team_name: "unleash-wave-1"` and `subagent_type` set to the agent's type (e.g., `kabalist`, `geometrist`)
4. Assign tasks to teammates via `TaskUpdate` with `owner`
5. Monitor progress via `TaskList` — teammates mark tasks completed as they finish
6. Between waves, shut down the current team via `SendMessage({ type: "shutdown_request" })` and create the next team with the updated brief (Step 4)

This gives you built-in coordination: a shared task list tracks which agents have responded, teammates can be messaged for follow-up, and the lead manages wave transitions through task assignment.

#### Option B: Raw Agent spawning (simpler, for smaller runs)

For each agent in the wave, spawn it with the brief and a domain-specific framing:

```
Use the [agent-name] agent to analyze this problem through your domain expertise.
[Paste the brief]
Think about this from your specific perspective as a [agent-description].
[For non-technical agents: add a domain-specific framing, e.g., "What patterns
does your tradition recognize in systems that exhibit this kind of threshold behavior?"]
Respond exactly in the requested format.
```

Launch all agents in a wave simultaneously using the Agent tool with `run_in_background: true`. Wait for the wave to complete before launching the next wave (to enable inter-wave knowledge injection in Step 4).

#### Choosing between options

| | TeamCreate | Raw Agent |
|---|---|---|
| Best for | Tier 3 full unleash (40+ agents) | Tier 2 panel (5-10 agents) |
| Coordination | Task list, messaging, ownership | Fire-and-forget, manual collection |
| Inter-wave handoff | Task status carries over | Must track manually |
| Overhead | Higher (team setup per wave) | Lower (single tool call per agent) |

**Expected:** Each wave returns ~10 structured responses within 2-5 minutes. Agents that fail to respond or return off-format output are noted but do not block the pipeline.

**On failure:** If more than 50% of a wave fails, check the brief clarity. Common cause: the output template is ambiguous, or the examples are insufficient for non-domain agents to reason about.

### Step 4: Inject Inter-Wave Knowledge (and Evaluate Early Stopping)

After waves 1-2, extract the emerging signal before launching the next wave.

1. Scan responses from completed waves for recurring themes
2. Identify the most common hypothesis family (the convergence signal)
3. **Check the early stopping threshold**: if the top family already exceeds 3x the null model expectation after 20 agents, you have strong signal. Plan Wave 3 as an adversarial + refinement wave and consider stopping after it
4. Update the brief for the next wave:

```markdown
**Update from prior waves**: [N] agents independently proposed [hypothesis family].
Build on this — what explains the remaining cases where this hypothesis fails?
Do NOT simply restate this finding. Extend, challenge, or refine it.
```

**Early stopping guidance**: Not every unleash needs all agents. For well-defined problem domains (e.g., codebase analysis), convergence often stabilizes at 30-40 agents. For abstract or open-ended problems (e.g., unknown mathematical transformations), the full roster adds value because the correct domain is genuinely unpredictable. Check convergence after each wave — if the top family's count and null-model ratio have plateaued, additional waves yield diminishing returns.

This prevents rediscovery (where later waves independently re-derive what earlier waves already found) and directs later agents toward the edges of the problem.

**Expected:** Later waves produce more nuanced, targeted hypotheses that address gaps in the emerging consensus.

**On failure:** If no convergence appears after 2 waves, the problem may be too unconstrained. Consider narrowing the scope or providing more examples.

### Step 5: Collect and Deduplicate

After all waves complete, gather all responses into a single document. Deduplicate by grouping hypotheses into families:

1. Extract all hypothesis statements
2. Cluster by mechanism (not by wording — "modular arithmetic mod 94" and "cyclic group over Z_94" are the same family)
3. Count independent discoveries per family
4. Rank by convergence: families discovered by more agents independently rank higher

**Expected:** A ranked list of hypothesis families with convergence counts, contributing agents, and representative testable predictions.

**On failure:** If every hypothesis is unique (no convergence), the signal-to-noise ratio is too low. Either the problem needs more examples, or the agents need a tighter output format.

### Step 6: Verify Against Null Model

Test the top hypothesis against a null model to ensure the convergence is meaningful, not an artifact of shared training data.

- **Programmatic verification**: If the hypothesis produces a testable formula or algorithm, run it against held-out examples
- **Null model**: Estimate the probability that N agents would converge on the same hypothesis family by chance (e.g., if there are K reasonable hypothesis families, random convergence probability is ~N/K)
- **Threshold**: Signal is meaningful if convergence exceeds 3x the null model expectation

**Expected:** The top hypothesis family significantly exceeds chance-level convergence and/or passes programmatic verification.

**On failure:** If the top hypothesis fails verification, check the second-ranked family. If no family passes, the problem may require a different approach (deeper single-expert analysis, more data, or reformulated examples).

### Step 7: Adversarial Refinement

**Preferred timing: Wave 3, not post-synthesis.** Including `advocatus-diaboli` in Wave 3 (alongside the inter-wave knowledge injection) is more effective than a standalone adversarial pass after all waves complete. Early challenge lets Waves 4+ refine against the critique rather than piling onto an unchallenged consensus.

If the adversarial pass was already part of Wave 3, this step becomes a final check. If not (e.g., you ran all waves without it), spawn `advocatus-diaboli` (or `senior-researcher`) now. For a structured pass, use `TeamCreate` to stand up a review team with both agents working in parallel against the consensus:

```
Here is the consensus hypothesis from [N] independent agents:
[Hypothesis]
[Supporting evidence and convergence stats]

Your job: find the strongest counterarguments. Where does this fail?
What alternative explanations are equally consistent with the evidence?
What experiment would definitively falsify this hypothesis?
```

**Expected:** A set of counterarguments, edge cases, and a falsification experiment. If the hypothesis survives adversarial scrutiny, it is ready for integration. A good adversarial pass sometimes *partially defends* the consensus — finding that the design is better than alternatives even if imperfect.

**On failure:** If the adversarial agent finds a fatal flaw, feed the critique back into a targeted follow-up wave (Tier 3+ iterative mode — select 5-10 agents best positioned to address the specific critique).

### Step 8: Hand Off to Teams

Unleash finds problems; teams solve them. Convert verified hypothesis families into actionable issues, then assemble focused teams to resolve each.

1. Create a GitHub issue per verified hypothesis family (use the `create-github-issues` skill)
2. Prioritize issues by convergence strength and impact
3. For each issue, assemble a small team via `TeamCreate`:
   - If a predefined team definition in `teams/` matches the problem domain, use it
   - If no fitting team exists, default to `opaque-team` (N shapeshifters with adaptive role assignment) — it handles unknown problem shapes without requiring a custom composition
   - Include at least one non-technical agent (e.g., `advocatus-diaboli`, `contemplative`) — they catch implementation risks that technical agents miss
   - Use REST checkpoints between phases to prevent rushing
4. The pipeline is: **unleash → triage → team-per-issue → resolve**

**Expected:** Each hypothesis family maps to a tracked issue with a team assigned. The unleash produced the diagnosis; the teams produce the fix.

**On failure:** If the team composition doesn't match the problem, reassign. Shapeshifter agents can research and design but lack write tools — the team lead must apply their code suggestions.

## Validation

- [ ] All available agents were consulted (or a deliberate subset was chosen with justification)
- [ ] Responses were collected in a structured, parseable format
- [ ] Hypotheses were deduplicated and ranked by independent convergence
- [ ] The top hypothesis was verified against a null model or programmatic test
- [ ] An adversarial pass challenged the consensus
- [ ] The final hypothesis includes testable predictions and known limitations

## Common Pitfalls

- **Too few examples in the brief**: Agents need 5+ examples to find patterns. With 3 examples, most agents resort to surface-level pattern matching or template echo (repeating the brief back in different words).
- **No verification path**: Without a way to test hypotheses, you cannot distinguish signal from noise. Convergence alone is necessary but not sufficient.
- **Metaphorical responses**: Domain-specialist agents (mystic, shaman, kabalist) may respond with rich metaphorical reasoning that is hard to parse programmatically. Include "Express your hypothesis as a testable formula or algorithm" in the output template.
- **Rediscovery across waves**: Without inter-wave knowledge injection, waves 3-7 independently rediscover what waves 1-2 already found. Always update the brief between waves.
- **Over-interpreting convergence**: 43% convergence on a mechanism family sounds impressive, but check the base rate. If there are only 3 plausible mechanism families, random convergence would be ~33%.
- **Expecting single-family dominance**: Abstract problems (pattern recognition, cryptography) tend to produce one dominant hypothesis family. Multi-dimensional problems (codebase analysis, system design) produce broader convergence across multiple valid families — this is expected and healthy, not a failure of the pattern.
- **Generic framing for non-technical agents**: The quality of a non-technical agent's contribution depends on how the brief frames the problem in their domain language. "What does your tradition say about systems at this threshold?" produces structural insight; a generic brief produces nothing. Invest in domain-specific framing for agents outside the problem's natural domain.
- **Using this for execution**: This pattern generates hypotheses, not implementations. Once you have verified hypotheses, convert them to issues and hand off to teams (Step 8). The pipeline is unleash → triage → team-per-issue.

## Related Skills

- `forage-solutions` — ant colony optimization for exploring solution spaces (complementary: narrower scope, deeper exploration)
- `build-coherence` — bee democracy for selecting among competing approaches (use after this skill to choose between top hypotheses)
- `coordinate-reasoning` — stigmergic coordination for managing information flow between agents
- `coordinate-swarm` — broader swarm coordination patterns for distributed systems
- `expand-awareness` — open perception before narrowing (complementary: use as individual agent preparation)
- `meditate` — clear context noise before launching (recommended before Step 1)
