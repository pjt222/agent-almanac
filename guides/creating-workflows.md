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

- A **team** is a declarative roster. The lead decides handoffs turn by turn at runtime via `TeamCreate` — coordination is model-driven and adaptive.
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

The `// --- … ---` comment block at the very top mirrors `meta` and is the **catalog source of truth** — the analogue of the YAML frontmatter on skills, agents, teams, and guides. It lets the repo's grep+count tooling read a workflow's metadata without a JavaScript parser. Keep the sidecar `name`/`description` in agreement with `meta`, and keep the sidecar `phases:` list a superset of every title passed to `phase()`.

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

## Vendor-API Caveat

The Workflow **run model** is generally available on paid Claude Code plans (~v2.1.154+). The **script-authoring surface** — the injected primitives and the `args` / `budget` globals — is an evolving vendor API. Everything in this guide reflects Claude Code **v2.1.x** behavior and is **subject to change**; it is documentation, never CI-enforced. Only Claude Code has the Workflow tool; other frameworks have no equivalent and skip workflows entirely.

## Troubleshooting

| Problem | Cause | Solution |
|---|---|---|
| `Illegal return statement` from `node --check` | Raw ESM check rejects the top-level `return` that the runtime accepts | Use the wrap-then-check recipe above |
| `meta must be a pure literal` | `meta` references a variable or call | Inline every value into the `export const meta` object literal |
| Workflow not found by name | `meta.name` ≠ filename stem, or not installed in `.claude/workflows/` | Make the triple (filename ↔ sidecar `name:` ↔ `meta.name`) identical and install the file |
| A mutating stage is rejected / misbehaves | Stage targets an advisory `agentType` but needs to write | Target an `implementing` agent type for any Write/Edit/Bash or `worktree` stage |
| `Date.now is not a function` | Used a forbidden non-deterministic call | Pass the value via `args`; vary by index/label instead |

## Related Resources

- [Understanding the System](understanding-the-system.md) -- where workflows sit among the Five Pillars and the canonical Teams-vs-Workflows boundary
- [Creating Agents and Teams](creating-agents-and-teams.md) -- the `agent:`/`subagent_type:` decoupling and the `intent` contract workflows reuse
- [Production Coordination Patterns](production-coordination-patterns.md) -- runtime-health layers that apply to both teams and workflows
- [`review-changes`](../workflows/review-changes.mjs) -- the seed workflow this guide references
- [`workflows/_template.mjs`](../workflows/_template.mjs) -- the copy-and-rename scaffold
- [Workflows README](../workflows/README.md) -- the directory overview and authoring convention
- [Create Workflow skill](../skills/create-workflow/SKILL.md) -- the step-by-step authoring meta-skill (`/create-workflow`)
