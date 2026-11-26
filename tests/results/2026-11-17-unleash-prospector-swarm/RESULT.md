## Run: 2026-11-17-unleash-prospector-swarm

**Observer**: Claude (Opus 5.5 main loop). It wrote the brief, the corpus index and the Workflow script that ran, and it
measured everything below from the run's return value and its subagent transcripts after the run. The figures are
counts, not estimates. The adversarial review of PR #1081 re-derived them independently. That review found one omission
(the advisor's tokens) and three overstatements (the null model, the stop rule's cost, the script-versus-template
differences), corrected below.

### Objective

The `unleash-the-agents` skill ran as a single Workflow script, with its prospectors on a cheap model. The question
the swarm answered was this: which scripts, written by hand during the review rounds of PRs #1067, #1070, #1073 and
#1076 and kept as evidence, should become shared tools in `tools/`? That answer was reported to the maintainer and is
not part of this record. This record keeps what the run taught about running an unleash this way. The findings below
changed `skills/unleash-the-agents/references/prospector-swarm.mjs`, the template derived from the script that ran.

### Environment

| Field | Value |
|-------|-------|
| Driver | Claude Code's Workflow tool, in two launches. The pilot launch ran 2 agents; the full launch replayed them from cache and ran the rest |
| Corpus | 129 scripts, deduplicated by sha256, split into 8 territories of 5 to 28 items each. Every prospector was given one home territory |
| Brief | Problem, the six families the lead had already found (seeds S1-S6), success criteria, the verification method, and the source of each claim |
| Prospectors | All 75 roster agents except the adversary, each spawned as its own agent type, on `claude-haiku-5-5` |
| Session-model stages | 7 cluster passes, 1 adversary (`advocatus-diaboli`), 1 synthesis, on `claude-opus-5-5` |
| A third model | The session's advisor tool reached the subagents, though no agent definition lists it. 60 agents (51 prospectors and all 9 session-model stages) called it 61 times, on `claude-fable-5-2`. 58 calls, from 57 agents, were answered; 3 were refused with `too_many_requests` |
| Models, as read | `message.model` per transcript: 75 Haiku, 9 Opus. The advisor appears only in `message.usage.iterations[]` (`type: advisor_message`). In all 58 messages that carry an advisor iteration, the outer `message.usage` counts only the agent's own iterations |

### Results

| Measure | Value |
|---|---|
| Agents | 84 across the two launches (2 pilot + 82 in the full launch), 84 returned, 0 errors |
| Waves | pilot 2 + waves 1-2 18, wave 3 10 + adversary, edge waves 4-8: 11, 11, 11, 11, 1 |
| Hypotheses | 193 (2.57 per prospector; minimum 1, maximum 3) |
| Cited item ids | 1,247, of which 0 were not items |
| Families at the end | 33 (6 seeded, 27 new) |
| Wall clock | 14,804 s (4.1 h) |

| Tokens | Calls | Output | Input, uncached | Cache write / cache read |
|---|---|---|---|---|
| Haiku prospectors | 75 agents | 2.87 M (65.8 %) | 1,282 | 13.86 M / 84.81 M |
| Opus stages | 9 agents | 0.95 M (21.7 %) | 526 | 2.96 M / 65.75 M |
| Advisor (Fable) | 61 calls from 60 agents; 58 answered | 0.55 M (12.6 %) | 10.52 M | 0 / 0 |

Credited to the agents that called it, the advisor's output puts the Opus stages at 25.3 % and the prospectors at
74.7 %. Summing `message.usage` alone misses the advisor entirely.

**The stop rule never fired.** The script ran another edge wave while the last cluster pass named any new family citing
one valid item. Every pass but the last named one, and the roster ran out. The table counts each new family's agents in
the pass that created it. Counting only agents that returned and cited one of the family's items gives the same numbers (the run's cluster output names agents, not hypotheses, so the template's stricter per-hypothesis check could not be applied to it):

| Cluster pass | New families (agents at birth) |
|---|---|
| waves 1-2 | 13, of which N1 (9), N2 (4), N4 (2), N5 (2), N12 (2); the other 8 had 1 |
| wave 3 | N14 (3), N15 (1), N16 (1) |
| wave 4 | N17 (3), N18 (2), N19 (1), N20 (1) |
| wave 5 | N21 (1), N22 (1), N23 (1) |
| wave 6 | N24 (1) |
| wave 7 | N25 (1), N26 (1), N27 (1) |
| wave 8 | none |

Under the template's rule (a new family filed by at least 2 agents), wave 5 is the last. The cut has two sides.

- **It would save** waves 6 to 8: 23 prospectors, 3 cluster passes and the advisor calls they made.
- **It would lose** what those waves added, which the rule cannot see.
  - The families born there were all one-agent: N24, N25, N26, N27. The synthesis folded N24 into ranks 3 and 5, N25 into
    ranks 1 and 3, and N27 into rank 7. N26 itself became rank 10.
  - The existing families grew. Between the wave-5 and the final pass, S1 went from 17 to 21 agents, S4 from 21 to 28, S5
    from 8 to 12 and S6 from 7 to 10. By agent count, S4 and S1 kept first and second place, while S5 (8 → 12) passed N1
    (10 → 11).
- **The default of 2 is fitted to this one run**, and has not been tested on another.

**Containment by prompt leaked; containment by type and by the bracket held.**
- Every prompt said "Do not create, edit or delete any file anywhere" and limited a shell to read commands. 45 of the 75
  prospectors used a shell, and 6 of them wrote read-once scratch files: to `/tmp`, to `mktemp` paths, and to the lead's
  session scratch directory. One more write was refused by Claude Code's built-in safety check before it ran.
- The 9 session-model agents wrote nothing.
- The repository guard (`guard:verify` in both checkouts) and before-and-after listings of everything an agent could
  reach (the evidence archive, the memory directory, three agent home directories, the skills directory, a third
  worktree) were all unchanged.
- The persona types carried part of the containment. 29 of the 75 prospectors are defined without a shell (`tools:` in
  `agents/<id>.md`); 9 of those 29 can still Write or Edit, so 20 can do neither. None of the 75 used a tool its
  definition lacks.

**The adversary saw only what existed when it was briefed.** It ran beside wave 3 and was shown the families of the
waves 1-2 cluster pass (S1-S6, N1-N13). Of the 13 families in the final ranking, 5 were born later and had no
adversarial verdict.

**Convergence was primed where the brief and the territories pointed, and the null model's form decides a borderline
case.**
- After waves 1-2: N = 20, m = 2.90, K = 19.
  - If an agent's hypotheses may share a family, the expected count per family is N·(1−(1−1/K)^m) = 2.90, and 3x is 8.71.
  - If they always land in distinct families, it is N·m/K = 3.05, and 3x is 9.16. The cluster pass lists 19 of the 20
    agents in at least as many families as they filed hypotheses: a proxy, because it maps agents, not hypotheses, to
    families.
  - S1 (11) and S4 (11) clear both bars. N1 (9) clears only the first.
- At the end: N = 75, m = 2.57, K = 33 (post hoc). The bars are 17.13 and 17.55. S1 (21) and S4 (28) clear both.
- S1 to S6 were named in the brief, and the territories were built around them and around N1's files. The less primed
  count is the agents who cited the family's items from outside their own home territory: S4 20, S1 14, N1 7 at the end.

### What changed in the template

- **Stop rule:** a new family counts toward another wave only when `minNewAgents` agents (default 2) filed it.
  - The cluster pass assigns hypotheses (`members: [{ agent, hypothesis }]`). An agent counts only if its assigned
    hypothesis exists and cites one of the family's items. A review measured that the weaker "any of its hypotheses
    cites an item" check would have passed a median 38 % of the returned agents for each new family of this run.
  - New ids are counted in code against the previous pass.
  - A remainder smaller than half a wave joins the wave before it. The measured run ended on a 1-agent wave 8.
- **Cluster failure:** a pass that dies or returns no families is retried once, and then stops the run as
  'cluster-failed'. In the script that ran, a dead pass returned the previous result, and the stop rule read that as
  convergence.
- **Late challenge:** the adversary runs a second time on every family the wave-3 adversary did not answer.
- **Write locations:** prospectors get a scratch root (`mktemp -d` under it, the absolute path printed and reused), and a
  per-agent directory if they can Write without a shell. The run's prompt said "write nothing".
- **Argument refusals before the first spawn:** the first launch of the measured run passed an unfilled placeholder for
  the territories. It spawned nothing, and failed at the first prompt it built:
  `undefined is not an object (evaluating 'TERR[t].map')`.
- **Leaner cluster prompts, a fuller synthesis:** each cluster pass gets the hypotheses without `domain_reasoning`.
  The predictions, confidence and proposals now reach both the cluster pass and the synthesis; in the script that ran,
  the synthesis never saw the prospectors' predictions. The synthesis now carries the whole hypothesis set besides the
  final families, which on this run's data roughly doubles its prompt. Removing `domain_reasoning` saves less than that
  costs.
- **Computed in code:** the verified-agent and outside-home counts, and the null model in both forms (the signal is 3x the
  higher), so the synthesis is given numbers rather than asked for them.

Also different from the script that ran, so the template is not that script with only the changes above:
- the brief-specific parts became arguments: the seed ids, the territories, the paths, the registry step (now
  `extraSteps`), and a lens sentence in place of a hard-coded list of technical agents;
- edge waves default to 10, not 11;
- `maxEdgeWaves` (default 6) is new;
- the cluster prompt no longer carries the territory counts and file lists; the code computes outside-home counts
  instead;
- the cluster schema dropped its `seed`, `agents_outside_home`, `typed_around` and `first_wave` fields.

### Not measured

- **The template itself has not run against a live Workflow runtime.** Its control flow is pinned by
  `scripts/test/unleash-prospector-swarm.test.js` against a stubbed runtime, with a mutant table in PR #1081.
- **Whether the changes improve a ranking.** One run is not a comparison.
- **Sonnet prospectors.** Option A's default, `sonnet`, was not run beside `haiku`.
- **Whether the advisor helped the prospectors.** It was available to them by accident of the session, not by design.

### Addendum 2026-11-26: Haiku's long-context price tier

The token table under Results counts tokens and does not say which price tier the Haiku prospectors' requests fell into.
Anthropic's price list as of November 2026 prices a Claude Haiku 5.5 request at higher rates when its prompt is over
100,000 tokens, counting cache reads and cache writes. Claude Sonnet 5.5 has no such tier. The run's 84 subagent
transcripts were re-read for this in the review rounds of #1122:

- The Haiku prospectors' 641 iterations (entries of `message.usage.iterations`) came in 589 responses. The 52 responses
  with two iterations are exactly the prospectors' 52 advisor calls, 49 answered and 3 refused.
- 578 of the 641 iterations had prompts over 100,000 tokens. They carry 2,818,673 of the 2,866,303 output tokens (98 %)
  and 83,655,721 of the 84,805,311 cache-read tokens (99 %).
- Prompt sizes: p10 100,573, median 156,326, p90 199,981, maximum 231,748 tokens.
- No response has iterations on both sides of the threshold.

At that price list the prospectors' own tokens cost about $18, not the about $4 that pricing every request below the
threshold gives; #1122 carries the arithmetic. Two independently written parsers produced these counts, and each
reproduces that token table. The transcripts are local and are deleted after the 60-day retention period, around
mid-January 2027, so this addendum is the durable record of the split.

Nothing above this addendum changed.
