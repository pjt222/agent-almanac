# Workflows

Workflows are the **fifth content type** in agent-almanac — code-driven orchestration scripts run by Claude Code's Workflow tool. Where a **team** is a declarative roster whose lead coordinates handoffs at runtime, a **workflow** is a script whose *control flow* — phases, fan-out, loops, adversarial verification — is fixed in JavaScript. The control flow is deterministic and rereadable; the outputs of the script's `agent()` calls are LLM subagents and remain nondeterministic. See [Creating Workflows](../guides/creating-workflows.md) for the authoring guide and [Understanding the System](../guides/understanding-the-system.md) for where workflows sit among the Five Pillars.

## Contents

| File | What it is |
|---|---|
| [`_template.mjs`](_template.mjs) | Copy-and-rename scaffold: sidecar frontmatter, `export const meta`, `phase()`, a `pipeline()` fan-out, and an `agent({ schema })` call, with the hard constraints inline. |
| [`review-changes.mjs`](review-changes.mjs) | The flagship seed — a classify → adversarially-verify → synthesize code review over changed files. |
| [`batch-generate-waves.mjs`](batch-generate-waves.mjs) | Resumable scout → generate → audit waves over a large item pool; artifacts are disk-durable and validator-gated, so an interrupted run salvages and resumes. |

This directory ships **two** reviewed seeds (Phase 1). A larger seed library, a `workflows/_registry.yml`, CLI install, and registry-sync validation are deliberately deferred behind a promotion gate (see [#288](https://github.com/pjt222/agent-almanac/issues/288)) — the `create-workflow` meta-skill is the one Phase-2 piece already shipped.

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

A workflow spawns subagents via `agent(prompt, { agentType })`. A stage that **mutates artifacts** (Write/Edit/Bash, or `isolation: 'worktree'`) must target an **`implementing`** agent type; a read-only analysis stage targets an **`advisory`** type. This is the workflow analogue of #285's team-assignment rule, and the script expresses it natively by naming the spawn type per call. `review-changes` is entirely read-only, so every stage targets the advisory `Explore` type.
