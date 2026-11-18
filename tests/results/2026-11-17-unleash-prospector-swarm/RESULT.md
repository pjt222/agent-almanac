## Run: 2026-11-17-unleash-prospector-swarm

**Observer**: Claude (Opus 5.5 main loop). It wrote the brief, the corpus index and the Workflow script that ran, and it
measured everything below from the run's return value and its subagent transcripts after the run. The figures are
counts, not estimates.

### Objective

The `unleash-the-agents` skill ran as a single Workflow script, with its prospectors on a cheap model. The question
the swarm answered was this: which scripts, written by hand during the review rounds of PRs #1067, #1070, #1073 and
#1076 and kept as evidence, should become shared tools in `tools/`? That answer was reported to the maintainer and is
not part of this record. This record keeps what the run taught about running an unleash this way. Each finding below
changed `skills/unleash-the-agents/references/prospector-swarm.mjs`, the template derived from the script that ran.

### Environment

| Field | Value |
|-------|-------|
| Driver | Claude Code's Workflow tool. Its script has the template's shape, minus the changes listed under "What changed" |
| Corpus | 129 scripts, deduplicated by sha256, split into 8 territories of 5 to 28 items each. Every prospector was given one home territory |
| Brief | Problem, the six families the lead had already found (seeds S1-S6), success criteria, the verification method, and the source of each claim |
| Prospectors | All 75 roster agents except the adversary, each spawned as its own agent type, on `claude-haiku-5-5` |
| Session-model stages | 7 cluster passes, 1 adversary (`advocatus-diaboli`), 1 synthesis, on `claude-opus-5-5` |
| Models, as run | Read from each subagent transcript's `message.model`: 75 Haiku, 9 Opus |

### Results

| Measure | Value |
|---|---|
| Agents | 84 spawned, 84 returned, 0 errors |
| Waves | pilot 2 + waves 1-2 18, wave 3 10 + adversary, edge waves 4-8: 11, 11, 11, 11, 1 |
| Hypotheses | 193 (2.57 per prospector; minimum 1, maximum 3) |
| Cited item ids | 1,247, of which 0 were not items |
| Families at the end | 33 (6 seeded, 27 new) |
| Wall clock | 14,804 s (4.1 h) |
| Output tokens | Haiku 2.87 M over 75 agents; Opus 0.95 M over 9 agents, a quarter of the total |
| Cache-write / cache-read tokens | Haiku 13.86 M / 84.81 M; Opus 2.96 M / 65.75 M |

**The stop rule never fired.** The script ran another edge wave while the last cluster pass named any new family citing
one valid item. Every pass named one, so the roster ran out. The table counts each new family's agents in the pass that
created it:

| Cluster pass | New families (agents at birth) |
|---|---|
| waves 1-2 | 13, of which N1 (9), N2 (4), N4 (2), N5 (2), N12 (2); the other 8 had 1 |
| wave 3 | N14 (3), N15 (1), N16 (1) |
| wave 4 | N17 (3), N18 (2), N19 (1), N20 (1) |
| wave 5 | N21 (1), N22 (1), N23 (1) |
| wave 6 | N24 (1) |
| wave 7 | N25 (1), N26 (1), N27 (1) |
| wave 8 | none |

Under the template's rule (a new family filed by at least 2 agents), wave 5 is the last. Waves 6 to 8 (23 prospectors and 3
cluster passes) add only one-agent families. Of their families, one (N26) was ranked, at rank 10 of 13, with 1 agent.

**Containment by prompt leaked; containment by type and by the bracket held.**
- Every prompt carried "do not create, edit or delete any file anywhere". 45 of the 75 prospectors used a shell, and 6 of
  them wrote read-once scratch files: to `/tmp`, to `mktemp` paths, and to the lead's session scratch directory. One more
  write was refused by Claude Code's built-in safety check before it ran.
- The 9 session-model agents wrote nothing.
- The repository guard (`guard:verify` in both checkouts) and before-and-after listings of everything an agent could
  reach (the evidence archive, the memory directory, three agent home directories, the skills directory, a third
  worktree) were all unchanged.
- The persona types carried part of the containment. 29 of the 75 prospectors are defined without a shell
  (`tools:` in `agents/<id>.md`), and none of the 75 used a tool its definition lacks.

**The adversary saw only what existed when it was briefed.** It ran beside wave 3 and was shown the families of the
waves 1-2 cluster pass (S1-S6, N1-N13). Of the 13 families in the final ranking, 5 were born later and had no adversarial
verdict.

**Convergence was primed where the brief and the territories pointed.**
- With N = 20, m = 2.90 and K = 19 after waves 1-2, the expected number of agents per family was 2.9. S1 (11), S4 (11)
  and N1 (9) cleared 3x that (8.7).
- S1 to S6 were named in the brief, and the territories were built around them and around N1's files. The less primed
  count is the agents who cited the family's items from outside their own home territory: S4 20, S1 14, N1 7 at the end.

### What changed in the template

- **Stop rule:** a new family counts toward another wave only when `minNewAgents` agents filed it (default 2). New ids are
  counted in code against the previous pass, not taken from the clusterer's own list. A remainder smaller than half a
  wave joins the last wave (the measured run ended on a 1-agent wave 8).
- **Late challenge:** the adversary runs a second time on every family the wave-3 adversary was not shown.
- **One write location:** prospectors get a scratch root (`mktemp -d` under it), not "write nothing".
- **Argument refusals before the first spawn:** the first launch of the measured run passed an unfilled placeholder for
  the territories. It spawned nothing, and failed at the first prompt it built:
  `undefined is not an object (evaluating 'TERR[t].map')`.
- **Leaner cluster prompts:** each cluster pass is handed the hypotheses without their reasoning text, because the
  prompt grows with every wave.
- **Computed in code:** the outside-home counts and the null model, N·(1−(1−1/K)^m), so the synthesis is given
  numbers rather than asked for them.

### Not measured

- **The template itself has not been run against a live Workflow runtime.** Its control flow is pinned by
  `scripts/test/unleash-prospector-swarm.test.js` against a stubbed runtime.
- **Whether the changes improve a ranking.** One run is not a comparison.
- **Sonnet prospectors.** Option A's default, `sonnet`, was not run beside `haiku`.
