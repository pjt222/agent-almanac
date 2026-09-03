---
title: "Creating Workflows"
description: "Authoring code-driven orchestration workflows — the meta contract, the agent/parallel/pipeline/phase primitives, and the capability rule"
category: workflow
agents: [code-reviewer, security-analyst]
teams: []
skills: [review-codebase, review-pull-request]
---

# Creating Workflows

A workflow is the fifth content type: a self-contained `.mjs` orchestration script run by Claude Code's Workflow tool. This guide explains how to author one — the `meta` contract, the injected orchestration primitives, the `args` and `budget` globals, how to invoke and install a workflow, and the capability rule that governs which agent types a stage may spawn.

A workflow's **control flow** — its phases, fan-out, loops, and verification structure — is fixed in JavaScript and is deterministic and rereadable. The **outputs** of its `agent()` calls are LLM subagents and remain nondeterministic. Hold that distinction throughout: never call a workflow "deterministic" without qualifying that it is the control flow, not the results, that is fixed.

## When to Use This Guide

- You have a repeatable, parameterized procedure that coordinates several agents and want to capture it as a reusable artifact.
- You are deciding between writing a [team](creating-agents-and-teams.md) and writing a workflow.
- You need a review or research procedure to run the same way every time, with the fan-out and verification logic auditable in code.
- You are adding a seed to `workflows/` and need the authoring conventions.

## Prerequisites

- Claude Code on a paid plan with the Workflow tool available (~v2.1.154+); confirm with `/workflows`.
- Familiarity with the four other content types — see [Understanding the System](understanding-the-system.md).
- Comfort reading plain JavaScript (no TypeScript, no Node APIs — see the constraints below).

## Teams vs Workflows

Both coordinate multiple agents; they differ in *where the coordination logic lives*.

- A **team** is a declarative roster. The lead coordinates members turn by turn at runtime by spawning them as subagents via the Agent tool and exchanging SendMessage over the session's single implicit team — coordination is model-driven and adaptive.
- A **workflow** is a script. The phases and fan-out are fixed by `agent()` / `pipeline()` / `phase()` calls — coordination is code-driven, with deterministic control flow.

Choose a **team** for adaptive, judgment-based collaboration where the right next step depends on what the last step found. Choose a **workflow** for a repeatable, auditable, parameterized procedure whose shape you already know. The two are complementary: the [production coordination patterns](production-coordination-patterns.md) (barrier synchronization, silence budgets, health checks) are runtime-health layers that apply to *both*.

## Workflow Overview

A workflow file is a bare `workflows/<name>.mjs`. It has two parts: a metadata header and an async body.

```js
// ---
// name: review-changes
// description: Classify → adversarially verify → synthesize a code review over changed files
// phases: Classify, Verify, Synthesize
// ---
export const meta = {
  name: 'review-changes',
  description: 'Classify → adversarially verify → synthesize a code review over changed files',
  phases: [
    { title: 'Classify', detail: 'one agent per changed file' },
    { title: 'Verify', detail: 'adversarial refuters per finding' },
    { title: 'Synthesize', detail: 'consolidate survivors' },
  ],
}

// body — runs inside an async wrapper; use top-level await and return directly
phase('Classify')
const files = args?.files ?? ['example.js']
const findings = await pipeline(files, classify, verify)
return { findings }
```

### The `meta` contract

`export const meta` must be a **pure literal** — no variables, function calls, spreads, or template interpolation. Required fields are `name` and `description`; `phases` (one entry per phase the workflow uses — whether opened by a global `phase()` call or assigned via a stage's `phase:` option) is optional but recommended. The `name` **must equal the filename stem** — that is the `Workflow({ name })` and `/<name>` discovery contract.

### Sidecar frontmatter

The `// --- … ---` comment block at the very top mirrors `meta` and is the **catalog source of truth** — the analogue of the YAML frontmatter on skills, agents, teams, and guides. It lets the repo's grep+count tooling read a workflow's metadata without a JavaScript parser. Keep the sidecar `name`/`description` in agreement with `meta`, and keep the sidecar `phases:` list **equal** to the `meta.phases[]` titles and to the titles the body uses through `phase()` and the per-call `phase:` option — integrity check A7b holds all three to an exact set in both directions (#773). If any stage mutates artifacts (an implementing `agentType` such as `general-purpose`, or `isolation: 'worktree'`), declare those phases on a sidecar line of the form `// implementing-phases: Generate`; A7b requires a spawn targeting an implementing type to sit in a listed phase, and requires each listed phase to contain at least one such spawn; a phase may mix a scout with a writer, and absent means none. Each `agent()` call must name its `agentType` as a plain string in a literal options object — a shared base spread across spawns (`agent(p, { ...base })`) is reported, since a spread defeats the per-spawn classification A7b performs. Before that check existed, retargeting a read-only stage to `general-purpose` and misspelling a `phase()` title both passed every gate.

### Orchestration primitives

These globals are injected — do not import them:

| Primitive | Use |
|---|---|
| `agent(prompt, opts)` | Spawn one subagent. With `{ schema }` it returns a validated object; without, its final text — or `null` if the subagent is skipped or dies, so `filter(Boolean)` before aggregating. `opts`: `label`, `phase`, `schema`, `agentType`, `model`, `effort`, `isolation`. |
| `pipeline(items, ...stages)` | The default. Each item flows through every stage independently — no barrier between stages. |
| `parallel(thunks)` | A barrier: run thunks concurrently and await all. Use only when a stage needs every prior result at once. |
| `phase(title)` | Open a named progress group. Inside `pipeline`/`parallel` stages, prefer the per-call `phase:` option to avoid races on the global state. |
| `log(message)` | Emit a progress line to the user. |
| `workflow(name, args)` | Run another workflow inline as a sub-step (one level deep). |

Two ambient globals carry input and budget:

- `args` — whatever the caller passed as `Workflow({ args })`; `undefined` if none. Default it so the workflow runs with no input.
- `budget` — the turn's token target: `budget.total` (or `null`), `budget.spent()`, `budget.remaining()`. Use it to scale fan-out depth or to bound a loop.

`pipeline()` is the default multi-stage primitive because it has no barrier between stages — item A can reach the last stage while item B is still in the first, so wall-clock is the slowest single chain rather than the sum of per-stage maxima. Reach for `parallel()` only when a stage genuinely needs all prior-stage results together (deduplication, an early-exit count, or a synthesis step).

### Structured output and adversarial verification

Passing a JSON Schema as `{ schema }` forces the subagent to return a validated object, so you never parse free text. The canonical quality pattern is a `pipeline()` whose verify stage is a nested `parallel()` of adversarial refuters that default to "refuted" unless they can independently reproduce a finding — this is what filters the false positives that plague naive multi-agent review. The [`review-changes`](../workflows/review-changes.mjs) seed is built on exactly this classify → refute → synthesize spine.

One subtlety the seed bakes in: `agent()` returns `null` when a subagent is skipped or dies, so gate survival on a **majority of affirmative confirmations** (`refuted === false`) — `Math.floor(n / 2) + 1` of them — never on the mere *absence* of a refutation. Counting refutations and surviving when "few enough refuted" inverts the fail-safe: a dead or null refuter would then let an unverified finding survive on absent evidence. Give each refuter the same evidence the classifier had (point it at the diff, not just the file) so it can fairly confirm change-specific findings.

## Capability Contract (relates to #285)

A workflow spawns subagents with `agent(prompt, { agentType })`, where `agentType` names the subagent type — the workflow's direct expression of the `agent:` (persona) vs `subagent_type:` (spawn) decoupling that [Creating Agents and Teams](creating-agents-and-teams.md) documents for teams. The script names the exact spawn type per call.

The same `intent` rule from #285 applies: an agent type is **`implementing`** when its tools include `Write` or `Edit`, otherwise **`advisory`**. A stage that **mutates artifacts** — uses `Write`/`Edit`/`Bash` to change files, or runs under `isolation: 'worktree'` — must target an `implementing` agent type. A read-only analysis stage targets an `advisory` type. `review-changes` is entirely read-only, so every stage targets the advisory `Explore` type; a stage that wrote a patch would target an implementing type such as `general-purpose`.

## Invoking and Installing

A workflow installed at `.claude/workflows/<name>.mjs` is invocable two ways:

```js
Workflow({ name: 'review-changes' })                              // as a tool call
Workflow({ name: 'review-changes', args: { files: ['a.js'] } })  // parameterized
```

```text
/review-changes        # as a slash command
```

`.claude/workflows/` is user-writable and the Workflow save-flow writes there, so a curated install must namespace its files (for example `almanac-<name>.mjs`) to avoid shadowing a user's own workflow. The CLI install adapter for this is deferred (Phase 2) — for now, copy a reviewed `.mjs` into `.claude/workflows/` by hand.

## Validating a Workflow Script

Workflow scripts use a top-level `return`, which the runtime accepts (it wraps the body in an async function) but which is **illegal in a raw ES module** — so plain `node --check workflows/<name>.mjs` reports `Illegal return statement` on a valid workflow. Validate the runtime dialect by wrapping the body as the runtime does, then syntax-checking:

```bash
{ echo '(async()=>{'; \
  sed 's/^[[:space:]]*export const meta/const meta/' workflows/<name>.mjs; \
  echo '})()'; } | node --check -
```

The authoritative check is running it: `Workflow({ name: '<name>' })`.

## Hard Constraints

The runtime enforces these — violating them breaks the run:

- **Plain JavaScript only.** No TypeScript syntax (`: string[]`, interfaces, generics).
- **No `Date.now()`, `Math.random()`, or argless `new Date()`** — they would break workflow resume. Pass timestamps via `args`; vary randomness by agent index or label.
- **No filesystem or Node API.** Standard JS built-ins (`JSON`, `Math`, `Array`) only; agents do the file and shell work.
- The body runs in an async context — use top-level `await` and a top-level `return` directly.

## Fanning Out Against a Live Repository

The `intent` contract above governs the agent type a stage **declares**. It says
nothing about what a `Bash`-capable agent actually does to the working tree, and
every agent inherits the repository as its default working directory. A fleet you
think of as "read-only reviewers" can still write to it.

This is not hypothetical. During an adversarial review of the i18n normalizer, two
parallel agents each wrote `$SCRATCH/fixture.sh` — the same path in the shared
scratchpad, sixteen seconds apart. The second clobbered the first, so the first
agent's `bash fixture.sh /tmp/nf-skipwt` ran a script that ignored its argument
and never created the directory. Its `cd "$1"` then failed, execution continued
regardless, and `mkdir`, `cat >`, `git add -A` and `git commit` all landed on the
real repository.

### Bracket the run

`repo-guard` is the mechanical half. Run it either side of any fan-out with Bash
access:

```bash
npm run guard:snapshot   # before
# ... the fan-out ...
npm run guard:verify     # after
```

It compares HEAD, the current branch, the worktree status, **the content of every
changed or untracked file**, and the index flags, exiting 1 with the difference
printed if any moved. It fails closed: a missing, unreadable, or foreign snapshot
exits 2 rather than reporting success, because a guard that answers "unchanged"
when it could not look is worse than none.

Two of those comparisons are subtler than they look, and both were added after
the first version shipped without them:

- **Content, not just status lines.** Overwriting a file that was *already*
  modified leaves ` M CLAUDE.md` byte-identical before and after. Since this repo
  is usually mid-edit, a line-only comparison misses the common case.
- **HEAD.** The only check that catches an agent that **committed** — `git status`
  reads clean once a stray write is committed, so every dirty-tree check passes.
  Index flags matter for the same reason: `git update-index --skip-worktree`
  makes git report a modified file as clean from that point on.

Scope limit, stated so you do not over-trust it: **ignored paths are not
covered.** Walking them would mean hashing `node_modules`. In this repo that
means a stray write to `CONTINUE_HERE.md` would not be seen.

`snapshot` refuses to overwrite an existing snapshot, and `verify` keeps it
until `npm run guard:release`. Both exist because a single global slot otherwise lets a
nested run rebaseline the outer run's damage into a green.

### Sharing the worktree with a peer session

A second interactive Claude Code session can be running in this same worktree.
That is not hypothetical: it happened, and a peer's `git add -A` swept another
session's untracked file into a commit on the wrong branch. Two facts about the
guard follow from it, and neither is obvious from the commands.

**The snapshot records no owner.** It carries `formatVersion`, the captured
state, `takenAt`, and `toplevel` — nothing that identifies which session armed
it. `verify` fails closed on a snapshot from a *different repository* or a
*different format version*, and those are the only two senses in which a
snapshot is "foreign" to it. A peer in the same repo clears both checks, so
`guard:release` from the wrong session drops the incumbent's baseline the moment
the tree happens to compare clean. Never release a slot you did not arm.

**The guard is a detector, and it must be armed before the thing it detects.**
It cannot see a peer who was already working when you arrived, because there is
no baseline from before their edits. So arriving in an occupied worktree is not
a case the guard covers — it is a case for agreeing on scope.

**And a verify against a slot you did not arm answers a question you did not
ask.** Clean means the tree has not moved since that snapshot was taken — an
incumbent whose fan-out has not written yet compares clean — never that the run
has finished. Verify reports tree movement, not run liveness. Its failure output
is worse to borrow: on a moved HEAD it prints `git reset --mixed <baseline>`,
recovery advice written for whoever armed the snapshot, and following it from
another session drops that session's commit. Use verify to look; do not act on
what it tells you to do.

The working rule, which is a matching condition rather than a lock:

- **Declare path scope before your first edit**, not before your first commit —
  by then the collision has already happened. Divide by **paths, not tasks**:
  the tree is the shared resource, and two agents on unrelated tasks still
  collide in one file.
- **Stage explicit paths.** `git add -A`, `git add --all` and `git add .` cannot
  distinguish your work from a neighbour's untracked file.
- **Review the whole branch, not the tip**: `git diff origin/<base> --name-only`.
  A `git show` on your last commit cannot show you what an earlier one swept in.
- **Leave the neighbour's edges alone.** Additive files, and no rewriting of
  what is already placed.

A generated artifact is the backstop that actually caught the incident: `check-dreams`
went red because an extra dream file made the committed atlas stale. Treat unexplained
staleness in a generated file as evidence the corpus moved, and investigate before
regenerating — regenerating first would have turned the job green and buried it.

### Contain the agents

`workflows/_template.mjs` defines a `REPO_SAFETY` preamble — a plain `const`, not
an export, since the documented wrap-then-check recipe rewrites only
`export const meta` and any other top-level export breaks it. Prepend it to the
prompt of **every** agent that may run shell commands, verifiers included — a
verifier reproducing a finding is the agent most likely to build a fixture.
Copying the template gets you this by default.

| Control | Catches |
|---|---|
| `isolation: 'worktree'` on any stage that might mutate | Everything below, structurally |
| Per-agent scratch dirs (`mktemp -d`, never a shared fixed path) | Filename collisions between parallel agents |
| `cd <dir> \|\| exit 1` in generated scripts | A failed `cd` silently redirecting relative paths at the repo |
| `git rev-parse --show-toplevel` assertion before `git add -A` / `git commit` / any write flag | A destructive step aimed at the wrong tree |

A prompt sentence is documentation, not a control — which is why the preamble is
paired with the guard rather than trusted on its own. The prompt in that run named
the directory, the tool, and the file to copy, and specificity did not help,
because the failure was mechanical rather than a matter of the agent's compliance.

> **Generated artifacts are integrity checks.** What surfaced that stray commit was
> not any deliberate check but `npm run check-readmes` going stale: the README
> translation table counts `i18n/<locale>/skills/*/SKILL.md` by existence, so one
> extra fixture directory moved a locale's coverage by one. Unexplained staleness
> in a file generated *from* the corpus is evidence the corpus moved. Investigate
> it before regenerating and committing.

## Vendor-API Caveat

The Workflow **run model** is generally available on paid Claude Code plans (~v2.1.154+). The **script-authoring surface** — the injected primitives and the `args` / `budget` globals — is an evolving vendor API. Everything in this guide reflects Claude Code **v2.1.x** behavior and is **subject to change**; it is documentation, never CI-enforced. Only Claude Code has the Workflow tool; other frameworks have no equivalent and skip workflows entirely.

## Troubleshooting

| Problem | Cause | Solution |
|---|---|---|
| `Illegal return statement` from `node --check` | Raw ESM check rejects the top-level `return` that the runtime accepts | Use the wrap-then-check recipe above |
| `meta must be a pure literal` | `meta` references a variable or call | Inline every value into the `export const meta` object literal |
| Workflow not found by name | `meta.name` ≠ filename stem, or not installed in `.claude/workflows/` | Make the triple (filename ↔ sidecar `name:` ↔ `meta.name`) identical and install the file |
| A mutating stage is rejected / misbehaves | Stage targets an advisory `agentType` but needs to write | Target an `implementing` agent type for any Write/Edit/Bash or `worktree` stage |
| A "read-only" run left the repo changed | Agents inherit the repo as their cwd; the declared `intent` does not constrain Bash | Apply the containments in [Fanning Out Against a Live Repository](#fanning-out-against-a-live-repository) and bracket the run with `npm run guard:snapshot` / `guard:verify` |
| `guard:verify` says "no snapshot" | The snapshot was released, or never taken | Re-snapshot and re-run. Never read exit 2 as a pass — it means the comparison did not happen |
| `guard:snapshot` says one already exists | Another guarded run is open, or an earlier one was never released | Do **not** run `guard:release` — the snapshot records no owner, so releasing drops whosever baseline it is (see [Sharing the worktree with a peer session](#sharing-the-worktree-with-a-peer-session)). Wait for that run to release its own, or `npm run guard:snapshot -- --force` only if you know it is dead: re-arming rebaselines its damage |
| `Date.now is not a function` | Used a forbidden non-deterministic call | Pass the value via `args`; vary by index/label instead |

## Related Resources

- [Understanding the System](understanding-the-system.md) -- where workflows sit among the Five Pillars and the canonical Teams-vs-Workflows boundary
- [Creating Agents and Teams](creating-agents-and-teams.md) -- the `agent:`/`subagent_type:` decoupling and the `intent` contract workflows reuse
- [Production Coordination Patterns](production-coordination-patterns.md) -- runtime-health layers that apply to both teams and workflows
- [`review-changes`](../workflows/review-changes.mjs) -- the seed workflow this guide references
- [`workflows/_template.mjs`](../workflows/_template.mjs) -- the copy-and-rename scaffold
- [Workflows README](../workflows/README.md) -- the directory overview and authoring convention
- [Create Workflow skill](../skills/create-workflow/SKILL.md) -- the step-by-step authoring meta-skill (`/create-workflow`)
