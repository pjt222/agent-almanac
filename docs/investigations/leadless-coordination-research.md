# Investigation: Leadless/Stigmergic Coordination (#263) and the Advisory-Agent Contract (#282)

**Date**: 2026-06-11
**Investigator**: Claude Fable 5 (deep-research workflow, 102 web-research agents + 3 internal repo audits + 3 adversarial steelman agents)
**Scope**: Which implementation path for RFC #263 is best (Option A / Option B / both / park), evaluated against repo conventions, the interacting issue #282, and the current state of the agentskills.io standard
**Status**: Complete — verdicts filed as #283, #284, #285 and comments on #263/#282

> **Re-checked 2026-09-14 — read the Addendum before quoting anything below.** The findings stand
> exactly as recorded; what has changed is the repository they describe. One claim needs
> downgrading (§5's substrate), one recommendation has since shipped (§6), and the `file:line`
> anchors throughout are 2026-06-11 anchors, several of which have drifted. The body is
> intentionally left untouched as the record of what was found on the day; affected passages carry
> an inline pointer to the Addendum section that revises them.

---

## Executive Summary

**Verdict: park #263 now; the conditional merge target is "A-prime" — `coordination: stigmergic` as the 9th coordination value on a new named swarm-domain team — not Option A as written and not Option B.** The decisive finding is internal: the library already ships the stigmergic methodology (`skills/coordinate-swarm`) and the stigmergy identity (`agents/swarm-strategist`), so Option B's foglet + 3 skills would duplicate existing content, while Option A's `lead: null` on opaque-team contradicts opaque-team's own opacity-through-the-lead design. The falsification protocol the RFC mandates is runnable today with zero catalogue changes (#283). For #282, the recommended fix is to evolve shapeshifter into an honest guide+implementer via the `evolve-agent` procedure (persona rewrite + toolset), with the `agent:`/`subagent_type:` decoupling (dyad precedent) as the lighter alternative, and a library-wide `intent: advisory | implementing` contract (#285) to make the defect class structurally impossible.

Per maintainer direction during this research: **maintenance costs are not a blocker** — the almanac is intended to grow. All verdicts below rest on semantic grounds (duplication, identity, validation gates), not cost.

---

## 1. Method

Five parallel investigation streams, followed by an adversarial wave attacking the candidate recommendation:

1. **Deep-research workflow** (web): agentskills.io spec scope, recent spec RFCs, framework prior art, academic prior art on stigmergic LLM coordination. 98 claims extracted, 25 adversarially verified (3-vote refutation panels), 7 killed.
2. **Schema audit** (repo): team frontmatter as practiced, coordination-value inventory, tooling consumers of `lead`/`coordination`.
3. **Cost audit** (repo): full footprint of Option B's 5 artifacts vs Option A, grounded in the synoptic-mind precedent.
4. **Interplay audit** (repo): advisory-vs-implementing landscape across all 72 agents.
5. **Runtime check** (harness): whether TeamCreate/Workflow structurally require or replace a lead.

Adversarial wave: a steelman of Option B, a steelman of the alternative #282 resolution, and an independent fact-check of every mechanical claim. Two first-pass conclusions were overturned by this wave (see §6) — the process worked.

## 2. agentskills.io: compliance is a non-issue today

Verified live 2026-06-11 (3-0 adversarial vote):

- The specification standardizes **only the SKILL.md format** — six frontmatter fields (`name`, `description` required; `license`, `compatibility`, `metadata`, `allowed-tools` optional) plus optional `scripts/`, `references/`, `assets/`. No agent, team, composition, or coordination concepts exist anywhere in the spec.
- The major active upstream RFC (discussion #210, skills.json packaging, March 2026, open) **explicitly excludes** even skill-composition semantics ("Flat bundles… No composition verbs, no orchestration"). Composition-adjacent proposals #129 (sub-agent interop) and #178 (AgentFile) are closed unadopted; #28 (skill stacks) and #95 (composition semantics) remain open discussions.
- Consequence: `teams/`, `agents/`, and any `coordination:` value are repo-local conventions the standard does not govern. The only compliance surface either #263 option would have created is Option B's three new SKILL.md files.
- **Caveat (re-verify before any implementation PR)**: this is a negative claim that can rot — composition is an active upstream topic.

## 3. The decisive internal finding: stigmergy already has a home

Missed by the RFC, by its internal red-team, and by the first-pass audits; surfaced only in the adversarial wave:

- `skills/coordinate-swarm/SKILL.md` specifies, at methodology level, every mechanism the RFC's three skills propose: priority-ordered local rules (line 107), claim-before-work with signal decay/TTL (line 78), quorum sensing with anti-oscillation hysteresis (lines 135–140), explicitly "without a central controller" (line 25) and "without a leader" (line 140).
- `agents/swarm-strategist.md` owns the stigmergy identity (description, line 3); its Scenario 1 (lines 62–70) is literally a leadless claim/release/quorum protocol.
- The swarm domain carries 9 skills (`skills/_registry.yml`).

Under a prior-art lens this is an X-reference: a single existing artifact anticipates the proposed combination. Option B would re-describe `coordinate-swarm` in foglet vocabulary and mint a second agent claiming an identity an existing agent holds.

The synoptic-mind precedent, cited completely, confirms the rule: ship new artifacts when a genuinely new capability has no home (adaptic did not exist before synoptic-mind); reuse the home when it exists. Stigmergy has a home.

## 4. Why bare Option A also fails, and what A-prime is

`teams/opaque-team.md:22` defines the pattern through the lead: "presents a unified capability surface… a single interface (the lead)"; the opacity principle (line 85) is opacity *behind the lead*. `lead: null` contradicts the team's first sentence.

**A-prime** (tracked in #284): `coordination: stigmergic` as the 9th value of the existing axis (8 values confirmed in use: hub-and-spoke ×6, sequential ×3, adaptive ×2, wave-parallel ×2, parallel, timeboxed, reciprocal, synoptic), carried by a new named swarm-domain team that reuses `coordinate-swarm`/`build-consensus`, keeps the RFC's `substrate_schema` + `coordinator_shim` fields, and states the RFC's hard preconditions. Discoverability is preserved (named teams surface in the registry and auto-generated README), identity is honest, and no skill is duplicated. → *tally re-counted, Addendum §4*

Mechanical pre-work for any leadless team (independently fact-checked): → *defects still live, two anchors drifted, Addendum §2*
- `scripts/generate-readmes.js:211` renders a literal `null` for the lead (no guard)
- `viz/build-data.js:263` writes `lead` into the graph JSON with no default (while `coordination` defaults at :265)
- `scripts/validate-integrity.sh:33` — `lead: null` passes the `^lead:` grep silently; nullability must be made explicit

## 5. Park is correct, and parking is not death

- The RFC's own gates: no motivating use case ("design exploration unless and until a real task surfaces") and a mandatory pre-merge falsification protocol. Neither gate is passed.
- **The empirical question is open in both directions.** Adversarial verification refuted the headline evidence on both sides: the blackboard paper's +13–57% improvement claim (pro-stigmergy) and SwarmBench's LLMs-fail-at-leaderless claim (anti) both died 1–2. What survives is architectural: every verified "stigmergic" LLM system retains a structural element (blackboard's central poster; CodeCRDT's seeding outliner; AutoGen's deterministic round-robin router) — vindicating the RFC's coordinator-shim hybrid. CodeCRDT (arXiv 2510.18893) shows the substrate guarantees are load-bearing: observable updates, deterministic convergence, monotonic progress; the label alone does nothing.
- **The protocol runs today with zero catalogue changes** (#283): TeamCreate teammates already self-claim tasks from a shared list (the substrate); the Workflow tool is deterministic code orchestrating stochastic agents (the shim). MAST (arXiv 2503.13657) provides the failure-mode register; SwarmBench's released harness is available for instrumentation. → *substrate half downgraded to unmeasured, Addendum §1*
- Framework prior art agrees with the flag-not-kind shape: CrewAI models coordination as a `process` attribute on one Crew class (its manager-less "consensual" process was rejected unmerged, PR #1926); AutoGen ships round-robin/selector/swarm as presets of one team concept.

## 6. #282: resolution, and what the adversarial wave overturned

First-pass recommendation ("expand shapeshifter's tools, 1-file fix") was **overturned** by the steelman with evidence the first audit missed, then **partially restored** by maintainer direction:

- The library already has the spawn-decoupling mechanism: `agent:` (persona label) vs `subagent_type:` (what spawns), live precedent `teams/dyad.md:128-130` (`agent: any` / `subagent_type: general-purpose`). The successful 2026-06-10 live session did exactly this by hand.
- `guides/agent-best-practices.md` makes tool expansion the *least-preferred* pattern (Pattern 3, "use sparingly", :284-288) vs Pattern 1 (expert brief → general implementer, :261-271).
- A bare frontmatter change is self-contradicting: shapeshifter's body (Tool Requirements :156-159, "Advisory Only" :217, "No Runtime Management" :219) would all conflict with expanded tools. A correct expansion is a persona rewrite. → *the rewrite happened, Addendum §3*
- **Maintainer direction (2026-06-11): a persona rewrite is feasible** — the `evolve-agent` skill exists precisely for assessing an agent, applying changes to skills/tools/capabilities/limitations, bumping version metadata, and syncing the registry.

**Recommended resolution** (tracked in #282 comment): evolve shapeshifter into an honest guide+implementer via `evolve-agent` — tools `[Read, Write, Edit, Bash, Grep, Glob, WebFetch]`, persona sections rewritten to instruct when to guide vs when to implement, version bump, registry sync. Both teams then work as designed with their CONFIG blocks unchanged. Alternative (lighter): keep shapeshifter advisory and swap member `subagent_type` to `general-purpose`/specialists in the two CONFIG blocks. Library-level fix: #285 (`intent: advisory | implementing` contract + CI rule), which also covers the latent case found in this research (`senior-software-developer` as "Platform Architect" in devops-platform-engineering without Write/Edit).

Corrections recorded for honesty: model-tier recount is 64 sonnet / 10 opus / 0 haiku (interim statement said 62); the foglet-lacks-Bash point is an unresolved design tension (local rule says foglets "run oracle"; the red-team concession moves deterministic execution to the shim; the toolset was never reconciled), not a flat contradiction; the 148-file cost figure is real but mostly pipeline-generated and, per maintainer direction, not an argument.

## 7. Cross-cutting insights worth keeping

1. **Verify-before-doing scales to design**: the strongest argument in this entire investigation (`coordinate-swarm` duplication) came from applying the repo's own "check if it already exists" mantra to an RFC, not to code.
2. **Adversarial verification earns its cost**: two first-pass conclusions were overturned (the #282 tool-expansion lean; the cost-based case against Option B), and refutation panels killed the headline empirical claims on *both* sides of the stigmergy question.
3. **The runtime is ahead of the catalogue**: shared-task-list self-claiming plus deterministic Workflow orchestration means coordination experiments do not require catalogue artifacts. Design RFCs can be falsified before they are materialized. → *the self-claiming half is unmeasured, Addendum §1*
4. **Negative compliance claims rot**: "the spec doesn't cover X" must be re-verified at implementation time, not quoted from research time.

## Links

- Issues: #263 (RFC, parked), #282 (shapeshifter contract), #283 (falsification run), #284 (A-prime), #285 (intent contract)
- Key repo evidence: `skills/coordinate-swarm/SKILL.md:25,78,107,135-142` · `agents/swarm-strategist.md:3,62-70` · `teams/opaque-team.md:22,85` · `teams/dyad.md:128-130` · `guides/agent-best-practices.md:256-288` · `scripts/generate-readmes.js:211` · `viz/build-data.js:263-265` · `scripts/validate-integrity.sh:33`
- Key external sources: agentskills.io/specification · agentskills/agentskills#210 · arXiv 2510.18893 (CodeCRDT) · arXiv 2510.10047 (SwarmSys) · arXiv 2503.13657 (MAST) · arXiv 2505.04364 (SwarmBench) · github.com/AdviceNXT/sbp · CrewAI PR #1926

---

## Addendum, 2026-09-14 — what has changed underneath this record

Re-checked at `65b3b2e15`. The body above is unedited apart from the inline pointers that lead
here. Every section below says what was claimed, what is true now, and how it was checked.

### §1 — The substrate claim is **unmeasured**, not superseded

§5 asserts the protocol "runs today with zero catalogue changes" because "TeamCreate teammates
already self-claim tasks from a shared list". That was accurate when written: the repository's own
`CLAUDE.md` then instructed sessions to call `TeamCreate` and explicitly *not* to fall back to the
Agent tool.

It is tempting to mark this superseded, because team activation was reconciled to the single
implicit team on 2026-07-16 (#337) and `TeamCreate` is now gated out of ordinary interactive
sessions (`tests/results/2026-07-17-team-infra-binary-probe/RESULT.md`). **That would overclaim.**
Only `TeamCreate` is gated. The `Task*` tools are not:

> the `Task*` tools themselves also work in interactive sessions — only the team scoping does not
>
> — `skills/unleash-the-agents/SKILL.md:122`

and the probe capture lists `TaskCreate`, `TaskGet`, `TaskList`, `TaskOutput`, `TaskStop` and
`TaskUpdate` as present. So the shared task list appears to still be there. What has never been
tested is the part the RFC actually depends on: whether a subagent under the single implicit team
can **self-claim** an unowned task, as opposed to being pushed one. The repository documents only
assignment — `TaskUpdate` with an `owner` (`skills/unleash-the-agents/SKILL.md:127`).

**Status: unmeasured, in both directions.** The shim half (the Workflow tool) is unaffected and has
only grown since. The experiment that settles it is cheap and gates #283's treatment arm: spawn a
`general-purpose` subagent, have it `ToolSearch("select:TaskList,TaskUpdate")`, and try to claim an
unowned task. Until someone runs it, neither "runs today" nor "no longer runs" is supported.

### §2 — The three tooling citations: defects live, two anchors drifted

All three defects §4 lists are still present. Two of the three line numbers are not. Cited here by
the expression, which survives an edit:

| §4 says | Still true? | Where it is now |
|---|---|---|
| `generate-readmes.js:211` renders a literal `null` for the lead | yes | the `${team.lead}` cell of the teams-table row, which has no guard where `${team.coordination \|\| 'hub-and-spoke'}` beside it has a default — `:258` |
| `viz/build-data.js:263` writes `lead` with no default (`coordination` defaults at `:265`) | yes | unmoved |
| `validate-integrity.sh:33` — `lead: null` passes the `^lead:` grep silently | yes | check A2's `for field in name description lead members coordination` loop and its `grep -q "^${field}:"` — `:180`–`:181` |

This is the second time these anchors have been corrected: #284's own 2026-07-19 comment moved the
first to `:255`, which is stale again. They are now filed as #827 and cited there by expression.

### §3 — §6's recommendation shipped, four days later

§6 recommends evolving `shapeshifter` into an honest guide+implementer with tools
`[Read, Write, Edit, Bash, Grep, Glob, WebFetch]`, plus the library-level `intent` contract (#285).
**Both landed, and this record never said so.** `agents/shapeshifter.md` is now `version: "2.0.0"`,
`updated: 2026-06-15`, carrying `intent: implementing` and exactly that toolset. #285 is enforced by
`scripts/validate-integrity.sh` check A6, and `guides/agent-best-practices.md` records that the
advisory-only convention "was retired (#285)".

That is why §6's three body anchors no longer resolve — the persona was rewritten. Precisely: two
are gone ("Advisory Only" and "No Runtime Management" appear nowhere in the file), and the third
**moved and inverted** — `## Tool Requirements` is at `:174` and now lists Write, Edit and Bash as
*required for execution*, the opposite of what §6 quotes it for. Read §6 as history, not as an open
recommendation.

### §4 — The coordination-value tally, re-counted

§4 records "8 values confirmed in use: hub-and-spoke ×6, sequential ×3, adaptive ×2, wave-parallel
×2, parallel, timeboxed, reciprocal, synoptic" — correct on 2026-06-11 over 17 teams. Today, over
22 teams: hub-and-spoke ×7, sequential ×6, wave-parallel ×3, adaptive ×2, and one each of
timeboxed, synoptic, reciprocal and parallel. **Still exactly 8 distinct values, with the same
eight names**, so the "9th value" argument the tally supports is unaffected. Counted from
`teams/_registry.yml` and cross-checked against the `coordination:` frontmatter of the team files
themselves; the two agree exactly.

### §5 — Scope of this re-check

Every `file:line` in this document is a 2026-06-11 anchor. The ones above were re-derived. Three
others were spot-checked and have drifted by one or two lines — `teams/opaque-team.md:85` (the
opacity sentence is at `:86`; the section heading is still at `:85`), and in
`guides/agent-best-practices.md` Pattern 1 is at `:263` and Pattern 3 at `:286`, against the `:261`
and `:284` cited. The remaining anchors were **not** re-checked and should be treated as 2026-06-11
positions. This is the rot §7's own lesson 4 predicts — *"negative compliance claims rot … must be
re-verified at implementation time, not quoted from research time"* — applied to the document that
states it.
