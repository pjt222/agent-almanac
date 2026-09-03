# Workflows

Workflows are the **fifth content type** in agent-almanac — code-driven orchestration scripts run by Claude Code's Workflow tool. Where a **team** is a declarative roster whose lead coordinates handoffs at runtime, a **workflow** is a script whose *control flow* — phases, fan-out, loops, adversarial verification — is fixed in JavaScript. The control flow is deterministic and rereadable; the outputs of the script's `agent()` calls are LLM subagents and remain nondeterministic. See [Creating Workflows](../guides/creating-workflows.md) for the authoring guide and [Understanding the System](../guides/understanding-the-system.md) for where workflows sit among the Five Pillars.

## Contents

| File | What it is |
|---|---|
| [`_template.mjs`](_template.mjs) | Copy-and-rename scaffold: sidecar frontmatter, `export const meta`, `phase()`, a `pipeline()` fan-out, and an `agent({ schema })` call, with the hard constraints inline. |
| [`review-changes.mjs`](review-changes.mjs) | The flagship seed — a classify → adversarially-verify → synthesize code review over changed files. |
| [`batch-generate-waves.mjs`](batch-generate-waves.mjs) | Resumable scout → generate → audit waves over a large item pool; artifacts are disk-durable and validator-gated, so an interrupted run salvages and resumes. |
| [`verify-handoff.mjs`](verify-handoff.mjs) | Adversarially verifies a `CONTINUE_HERE.md` draft against a facts file and its sources — traceability, completeness, actionability — three lenses per draft in parallel. Read-only; findings are structured so the author applies them and re-runs. |

This directory ships **three** reviewed seeds (Phase 1). A larger seed library, a `workflows/_registry.yml`, CLI install, and registry-sync validation are deliberately deferred behind a promotion gate (see [#288](https://github.com/pjt222/agent-almanac/issues/288)) — the `create-workflow` meta-skill is the one Phase-2 piece already shipped.

## Authoring convention

A workflow is a bare `workflows/<name>.mjs` file (mirroring `agents/`, not the directory-per-item `skills/` layout). It carries a **sidecar frontmatter** comment block at the very top:

```js
// ---
// name: review-changes
// description: Classify → adversarially verify → synthesize a code review over changed files
// phases: Classify, Verify, Synthesize
// ---
export const meta = {
  name: 'review-changes',
  description: 'Classify → adversarially verify → synthesize a code review over changed files',
  phases: [ /* … */ ],
}
```

The runtime `export const meta` literal is required by the Workflow tool; the **sidecar comment is the catalog source of truth**, the analogue of YAML frontmatter on the other four content types, so the existing grep+count tooling can read the metadata without a JavaScript parser. Keep the two in agreement, and keep `meta.name` equal to the filename stem — that triple equality (filename ↔ sidecar `name:` ↔ `meta.name`) is the `Workflow({ name })` / `/<name>` discovery contract.

## Invoking

Once a workflow is installed into `.claude/workflows/<name>.mjs`, invoke it either way:

```js
// As a tool call (optionally parameterized via args)
Workflow({ name: 'review-changes' })
Workflow({ name: 'review-changes', args: { files: ['src/auth.js', 'R/score.R'] } })
```

```text
/review-changes        # as a slash command
```

`review-changes` with no `args` derives its file list from the working-tree diff (`git diff --name-only HEAD`); pass `args.files` to scope it explicitly.

`verify-handoff` takes its inputs only through `args` — it has no default draft to read:

```js
Workflow({ name: 'verify-handoff', args: { drafts: [{
  key: 'companion',
  draft: '/abs/path/CONTINUE_HERE.draft.md',
  facts: '/abs/path/handoff-facts.md',        // each fact names the command that produced it
  sources: ['/abs/path/previous-edition.md'], // completeness is measured against these
  context: 'what the file is, who consumes it, which round this is',
}], round: 1 } })
```

Apply the findings, then re-run with `round: 2`, adding the round-1 findings file to `sources` so the
re-run can see what was applied instead of re-deriving from scratch. The round number varies the prompts
and labels, so a *resumed* run (`resumeFromRunId`) cannot return round-1 results from cache; a fresh
`Workflow()` call runs live regardless. Say in `context` which repositories the agents must not read —
the restriction is an instruction, not a capability — so claims about files there that the facts file does
not cover are reported as untraceable-by-construction rather than as false. A draft with no `sources` runs
traceability and actionability only; the completeness lens is skipped and logged, never reported clean.

## Validating a workflow script

Workflow scripts use a top-level `return`, which is valid in the Workflow runtime (the body is wrapped in an async function) but **illegal in a raw ES module** — so plain `node --check workflows/<name>.mjs` reports `Illegal return statement` on a perfectly valid workflow. Validate the runtime dialect by wrapping the body the way the runtime does, then syntax-checking:

```bash
{ echo '(async()=>{'; \
  sed 's/^[[:space:]]*export const meta/const meta/' workflows/<name>.mjs; \
  echo '})()'; } | node --check -
```

The authoritative check is running it: `Workflow({ name: '<name>' })`.

## Vendor-API caveat

The Workflow **run model** is generally available on paid Claude Code plans (~v2.1.154+). The **script-authoring surface** — the injected globals `agent()` / `parallel()` / `pipeline()` / `phase()` / `log()` / `workflow()` and the `args` / `budget` objects — is an evolving vendor API. The conventions here reflect Claude Code **v2.1.x** behavior and are **subject to change**; they are documentation, never CI-enforced. Only Claude Code has the Workflow tool — other frameworks have no equivalent and skip workflows entirely.

## Capability contract (relates to [#285](https://github.com/pjt222/agent-almanac/issues/285))

A workflow spawns subagents via `agent(prompt, { agentType })`. A stage that **mutates artifacts** (Write/Edit/Bash, or `isolation: 'worktree'`) must target an **`implementing`** agent type; a read-only analysis stage targets an **`advisory`** type. This is the workflow analogue of #285's team-assignment rule, and the script expresses it natively by naming the spawn type per call. `review-changes` is entirely read-only, so every stage targets the advisory `Explore` type; `batch-generate-waves` shows the other side — its `Generate` stage mutates artifacts and targets the implementing `general-purpose` type, while `Scout` and `Audit` stay advisory (`Explore`).

The contract is **checked**, not only described (#773). Which phases may mutate is declared in the sidecar:

```
// phases: Scout, Generate, Audit
// implementing-phases: Generate
```

Integrity check A7b (`scripts/check-workflow-contract.js`) parses every `agent()` options object and holds it to that line, strictly in one direction and leniently in the other. **Strict:** a spawn targeting an implementing type must sit in a listed phase, and `isolation: 'worktree'` counts as mutation. **Lenient:** a listed phase needs *at least one* implementing spawn, not all of them — a phase that pairs a read-only scout with a writer is an ordinary shape, and the declaration is per phase while the behaviour is per spawn. A listed phase with no implementing spawn at all is reported, since the declaration then buys nothing. Absent means none, so a new workflow that forgets the field and spawns `general-purpose` fails loudly. Types are classified from the sources the repository already keeps — the four built-in types these workflows use, by a fixed map (`Explore`, `Plan` advisory; `general-purpose`, `claude` implementing; Claude Code offers more, and one outside the map fails closed), and every almanac agent by the `intent:` line in its frontmatter. An unknown type is a failure, not a skip. A7b therefore proves declaration-consistency, not capability truth: it trusts each agent's `intent:` line, and A6a is the check that keeps that line honest against the agent's tools. `_template.mjs` is scaffolding and is not read, so its own sidecar is documentation rather than a checked artifact. The same check holds phase titles to an exact set three ways: sidecar `phases:` == `meta.phases[].title` == the titles the body uses through `phase()` and the `phase:` option. Before it existed, retargeting a read-only stage to `general-purpose` and misspelling a `phase()` title both passed every gate.
