---
name: create-workflow
description: >
  Author a new agent-almanac workflow — a self-contained `.mjs` orchestration
  script run by Claude Code's Workflow tool. Covers choosing a workflow over a
  team, copying the template, the triple-name discovery contract, the pure-literal
  meta and sidecar frontmatter, building the body with the injected primitives,
  the advisory/implementing capability contract, the adversarial-verification
  fail-safes, validation, and manual installation. Use when you have a repeatable,
  parameterized procedure that coordinates several agents and want it captured as a
  reusable, auditable artifact whose control flow is fixed in code.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: meta, workflow, creation, orchestration
---

# Create a New Workflow

Author a workflow — the fifth content type — as a self-contained `workflows/<name>.mjs` script run by Claude Code's Workflow tool. A workflow fixes its phases, fan-out, and verification structure in JavaScript: its **control flow** is deterministic and rereadable, while the **outputs** of its `agent()` calls are LLM subagents and remain nondeterministic. This skill is the *procedure* for authoring one; [`guides/creating-workflows.md`](../../guides/creating-workflows.md) is the API *reference* it draws on.

> **Vendor-API caveat.** The Workflow run model is generally available on paid Claude Code plans (~v2.1.154+), but the script-authoring surface (the injected `agent()` / `parallel()` / `pipeline()` / `phase()` / `log()` / `workflow()` primitives and the `args` / `budget` globals) is an evolving vendor API — accurate as observed in Claude Code v2.1.x, subject to change, never CI-enforced.

## When to Use

- You have a repeatable, parameterized procedure that coordinates several agents and want it captured as a reusable artifact whose shape you already know.
- You need a review, research, or migration procedure to run the same way every time, with the fan-out and verification logic auditable in code rather than re-decided by a lead each run.
- You are adding a reviewed seed to the `workflows/` library, or authoring a personal workflow for `.claude/workflows/`.
- You are deciding between writing a [team](../create-team/SKILL.md) and a workflow — read Step 1 first.

## Inputs

- **Required**: Workflow name (lowercase kebab-case, e.g., `review-changes`). This becomes the filename stem, the sidecar `name:`, and `meta.name` — all three must be identical.
- **Required**: Purpose (one paragraph: what repeatable procedure this codifies and why its control flow should be fixed in code).
- **Required**: Phase plan (the named stages, e.g., Classify → Verify → Synthesize) and the fan-out shape (per-item `pipeline()` vs barrier `parallel()`).
- **Optional**: Parameters the workflow accepts via `args` (default them so it runs with no input).
- **Optional**: Source material (an existing ad-hoc multi-agent procedure to formalize).

## Procedure

### Step 1: Confirm a Workflow Is the Right Tool

A workflow is one of five content types. Choose deliberately:

- A **skill** is how *one* agent performs a procedure. A **team** is a declarative roster the lead coordinates at runtime (model-driven, adaptive). A **workflow** is a script whose phases and fan-out are fixed in code (deterministic control flow, auditable, parameterized).
- Pick a **workflow** only when the coordination shape is known in advance and you want it repeatable and rereadable. If the right next step depends on what the last step found, pick a **team** instead.

**Expected:** A one-line justification for why this is a workflow and not a team or a single skill.

**On failure:** If the coordination must adapt turn-by-turn, stop and use `create-team`. If only one agent acts, use `create-skill`.

### Step 2: Copy the Template

Start from the canonical scaffold — never a blank file:

```bash
cp workflows/_template.mjs workflows/<name>.mjs
```

For a personal (non-library) workflow, copy into `.claude/workflows/<name>.mjs` instead. The template carries the sidecar block, a pure-literal `meta`, a `phase()`, a `pipeline()` fan-out, an `agent({ schema })` call, and the hard constraints inline.

**Expected:** A new `.mjs` file that is a verbatim copy of the template.

**On failure:** If `workflows/_template.mjs` is missing, you are on a pre-Phase-1 checkout — fetch `main`.

### Step 3: Satisfy the Triple-Name Discovery Contract

Rename in the three places that **must stay identical** — the filename stem, the sidecar `// name:`, and the `meta.name` literal:

```bash
grep -n "name:" workflows/<name>.mjs   # sidecar + meta.name must equal the filename stem
```

That triple equality (`filename ↔ sidecar name ↔ meta.name`) is the `Workflow({ name })` and `/<name>` discovery contract.

**Expected:** All three read the same kebab-case name.

**On failure:** A `Workflow not found by name` error at runtime means the triple is out of sync — re-check all three.

### Step 4: Write the Pure-Literal `meta` and Sidecar

`export const meta` must be a **pure literal** — no variables, function calls, spreads, or template interpolation. Required fields: `name` and `description`. `phases` (one entry per phase the workflow uses, whether opened by a global `phase()` call or a stage's per-call `phase:` option) is optional but recommended. Mirror `name`, `description`, and the `phases` titles in the top-of-file sidecar comment block — the sidecar is the **catalog source of truth** (the analogue of YAML frontmatter on the other content types), readable by grep without a JS parser.

**Expected:** `meta` is a literal object; the sidecar agrees with it; `phases` ⊇ every title passed to `phase()` or a stage `phase:`.

**On failure:** A `meta must be a pure literal` error means a value references a variable or call — inline it.

### Step 5: Build the Body

The body runs inside an async wrapper — use top-level `await` and a top-level `return` directly. Compose with the injected globals (no imports):

- `pipeline(items, ...stages)` — the **default**: each item flows through every stage with no barrier between stages (wall-clock = slowest single chain).
- `parallel(thunks)` — a **barrier**: use only when a stage needs every prior result at once (dedup, an early-exit count, a synthesis step).
- `agent(prompt, { schema, label, phase, agentType })` — spawn one subagent; with `{ schema }` it returns a validated object.
- `phase(title)`, `log(message)`, and the `args` / `budget` globals. Default `args` so the workflow runs with no input.

Pass a JSON Schema as `{ schema }` to force structured output (no free-text parsing). See `guides/creating-workflows.md` for the full primitive reference.

**Expected:** A body that defaults its inputs, fans out with the right primitive, and returns a value.

**On failure:** If you reach for `parallel()` only to flatten or map between stages, that barrier is not justified — do the transform inside a `pipeline()` stage.

### Step 6: Honor the Capability Contract (#285)

`agent({ agentType })` names the spawn type per call — the workflow's native expression of the persona-vs-spawn decoupling. The `intent` rule applies:

- A stage that **mutates artifacts** (uses Write/Edit/Bash to change files, or runs under `isolation: 'worktree'`) must target an **implementing** agent type.
- A **read-only analysis** stage targets an **advisory** type (e.g., `Explore`).

Set `agentType` explicitly on every stage so the contract is visible, not implied.

**Expected:** Every `agent()` call names an `agentType` whose capability matches what the stage does.

**On failure:** A mutating stage targeting an advisory type cannot write — switch it to an implementing type such as `general-purpose`.

### Step 7: Apply the Adversarial-Verification Fail-Safes

If your workflow verifies candidate findings (the classify → refute → synthesize spine), bake in the three lessons the `review-changes` seed encodes:

1. **Gate on affirmative confirmations, not refutations.** `agent()` returns `null` when a subagent is skipped or dies, so `filter(Boolean)` before counting and require a *majority of confirmations* to survive (`confirmedVotes >= Math.floor(n / 2) + 1`). Surviving when "few enough refuted" inverts the fail-safe — a dead refuter would let an unverified finding through.
2. **Give verifiers the evidence the proposer had.** If the classifier read a diff, tell the refuters to read it too — otherwise change-specific findings get default-refuted and unfairly killed.
3. **Default to refuted/unconfirmed** unless a verifier can independently reproduce the finding.

**Expected:** Survival gates on a confirmation quorum, verifiers share the proposer's evidence, and `null` results are filtered.

**On failure:** If real findings vanish, check that verifiers aren't starved of context (lesson 2); if junk survives, check the gate counts confirmations, not refutations (lesson 1).

### Step 8: Validate the Script

Workflow scripts use a top-level `return`, which the runtime accepts (it wraps the body in an async function) but raw ESM rejects — so plain `node --check` reports `Illegal return statement` on a valid workflow. Use the wrap-then-check recipe:

```bash
{ echo '(async()=>{'; \
  sed 's/^[[:space:]]*export const meta/const meta/' workflows/<name>.mjs; \
  echo '})()'; } | node --check -
```

The authoritative check is running it: `Workflow({ name: '<name>' })`.

**Expected:** The wrap-check passes with no syntax error.

**On failure:** Do **not** "fix" a top-level `return` to pass raw `node --check` — that would cripple the script. Use the wrap-check; debug any other syntax error normally.

### Step 9: Install and Run

The Workflow tool resolves `Workflow({ name })` from `.claude/workflows/<name>.mjs`. In Phase 1, install by hand:

```bash
cp workflows/<name>.mjs .claude/workflows/<name>.mjs   # curated installs prefix: almanac-<name>.mjs
```

Then invoke `Workflow({ name: '<name>' })` or the `/<name>` slash command. `.claude/workflows/` is user-writable and the save-flow writes there, so a *curated* install must namespace (`almanac-<name>.mjs`) to avoid shadowing a user's own workflow.

**Expected:** The workflow runs end-to-end and returns its value.

**On failure:** If `/<name>` is not found, confirm the file is in `.claude/workflows/` and the triple-name contract holds (Step 3).

### Step 10: Register (Library Contributions)

> **Phase-2-pending.** A `workflows/_registry.yml`, CI validation of the sidecar, and a CLI install adapter are deferred behind the #288 promotion gate (~8–10 workflows + a real install request). Until they land, a library workflow needs **no** registry entry — the sidecar frontmatter is its catalog metadata and discovery is by filename. When the registry exists, this step becomes "add an entry derived from the sidecar."
>
> **Workflows are excluded from i18n.** Unlike skills/agents/teams/guides, a workflow is executable code, not prose — do **not** scaffold translations for it.

If contributing a reviewed seed to agent-almanac, place it in `workflows/`, cross-reference it from `guides/creating-workflows.md`, and carry the vendor-API caveat in any prose you add.

**Expected:** A library workflow lives in `workflows/` with an accurate sidecar; no registry or translation steps are attempted in Phase 1.

**On failure:** If a tool expects `workflows/_registry.yml`, you are ahead of the promotion gate — stop and confirm Phase 2 has shipped.

## Validation

- [ ] File exists at `workflows/<name>.mjs` (or `.claude/workflows/<name>.mjs` for personal use).
- [ ] Filename stem, sidecar `name:`, and `meta.name` are identical (triple-name contract).
- [ ] `export const meta` is a pure literal; sidecar mirrors `name`/`description`/`phases`.
- [ ] Sidecar `phases:` ⊇ every title passed to `phase()` or a stage `phase:` option.
- [ ] Body defaults its `args`, uses an appropriate fan-out primitive, and returns a value.
- [ ] Every `agent()` call sets an `agentType` whose capability matches the stage (advisory vs implementing).
- [ ] Verification stages gate on a confirmation quorum and `filter(Boolean)` null results.
- [ ] No forbidden calls: `Date.now()`, `Math.random()`, argless `new Date()`; no TypeScript syntax; no filesystem/Node APIs.
- [ ] The wrap-then-`node --check` recipe passes.
- [ ] No `workflows/_registry.yml` entry or translation scaffold was created (both are Phase 2 / i18n-excluded).

## Common Pitfalls

- **Writing a workflow when a team fits.** If the next step depends on what the last step found, the coordination is adaptive — use a team. Workflows are for procedures whose shape is fixed in advance.
- **Counting refutations instead of confirmations.** Gating survival on "few enough refuted" lets a `null`/dead refuter pass an unverified finding through. Gate on a majority of affirmative confirmations.
- **Starving verifiers of context.** Refuters that see less than the proposer (e.g., the file but not the diff) default-refute legitimate change-specific findings and kill them.
- **Computing `meta`.** `export const meta` must be a literal — no spreads, calls, or interpolation. A computed `meta` fails at load.
- **"Fixing" the top-level `return`.** It is valid Workflow dialect; rewriting it to satisfy raw `node --check` breaks the script. Use the wrap-check.
- **Forbidden non-determinism.** `Date.now()` / `Math.random()` / argless `new Date()` break workflow resume. Pass timestamps via `args`; vary randomness by agent index or label.
- **Building Phase-2 machinery early.** Do not add a `workflows/_registry.yml` or scaffold translations for a workflow — registries/CLI/validation are gated, and workflows are i18n-excluded.

## Related Skills

- `create-skill` — author a SKILL.md (the *how* for one agent); the meta-pattern sibling.
- `create-agent` — define an agent persona; workflows spawn agents by `agentType`.
- `create-team` — compose a declarative, model-driven roster (the adaptive counterpart to a workflow).
- `commit-changes` — commit the new workflow file.
- `review-codebase` / `review-pull-request` — the single-reviewer skills the `review-changes` workflow coordinates many of.
