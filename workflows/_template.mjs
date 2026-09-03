// ---
// name: _template
// description: Scaffold for a new agent-almanac workflow — copy, rename, replace
// phases: Scan, Verify
// ---
//
// ============================================================================
// AGENT-ALMANAC WORKFLOW TEMPLATE
// ----------------------------------------------------------------------------
// A workflow is a self-contained orchestration script run by Claude Code's
// Workflow tool. Its CONTROL FLOW (phases, fan-out, loops) is fixed in code and
// rereadable; the OUTPUTS of its agent() calls are LLM subagents and remain
// nondeterministic. Never describe a workflow as "deterministic" unqualified —
// the control flow is deterministic, the agent() results are not.
//
// To author a new workflow:
//   1. Copy this file to  workflows/<your-name>.mjs
//   2. Rename in THREE places that must stay identical — the sidecar `name:`
//      above, the meta.name literal below, and the filename stem. That triple
//      equality is the Workflow({ name }) / "/<your-name>" discovery contract.
//   3. Replace the meta block, phases, and body with your orchestration.
//   4. Syntax-check it (see "Validating" at the bottom of this file).
//
// SIDECAR FRONTMATTER (the `// --- … ---` block at the very top) is the catalog
// source of truth — the analogue of YAML frontmatter on the other four content
// types. It mirrors the runtime `export const meta` literal so the existing
// grep+count tooling can read the metadata without a JS parser. Keep the two in
// agreement: same name, same description, and the sidecar `phases:` list EQUAL
// to the meta.phases[] titles, which in turn equal the titles the body uses via
// phase() and the per-call `phase:` option (integrity check A7b holds all three
// to an exact set, both directions — #773).
//
// If any stage MUTATES artifacts (targets an implementing agentType such as
// `general-purpose`, or uses `isolation: 'worktree'`), add a sidecar line naming
// those phases:
//     // implementing-phases: Generate
// Each agent() call must carry its `agentType` as a plain string in a LITERAL options
// object. A shared base spread across spawns (`agent(p, { ...base })`) is reported, because
// a spread defeats the per-spawn classification A7b performs.
// A7b requires a spawn targeting an implementing type to sit in a listed phase,
// and requires a listed phase to contain at least one such spawn. A phase MAY
// mix a read-only scout with a writer; what it may not do is mutate without
// saying so. This template has no mutating stage, so the line is absent — absent
// means none, and a workflow that forgets it and spawns `general-purpose` fails
// loudly rather than quietly widening a read-only stage into a writing one.
// (A7b does not read this file: the template is scaffolding, not a workflow.)
//
// HARD CONSTRAINTS (the runtime enforces these — violating them breaks the run):
//   • Plain JavaScript only. NO TypeScript (no `: string[]`, interfaces, generics).
//   • Date.now(), Math.random(), and argless `new Date()` are UNAVAILABLE — they
//     would break workflow resume. Pass timestamps via `args`; vary randomness by
//     agent index/label instead.
//   • No filesystem or Node API. Standard JS built-ins (JSON, Math, Array) only.
//   • The body runs inside an async wrapper — use top-level `await` and a
//     top-level `return` directly (both are part of the Workflow dialect).
//
// INJECTED GLOBALS (no import needed): agent, parallel, pipeline, phase, log,
// workflow, args, budget. Documented in guides/creating-workflows.md.
// ============================================================================

export const meta = {
  // MUST equal the filename stem and the sidecar `name:` above.
  name: '_template',
  // One line, shown in the permission dialog when the workflow runs.
  description: 'Scaffold for a new agent-almanac workflow — copy, rename, replace',
  // One entry per phase the workflow uses — whether opened by a global phase()
  // call or assigned via a stage's `phase:` option. Titles must match those
  // strings exactly and all appear in the sidecar `phases:` list.
  phases: [
    { title: 'Scan', detail: 'fan out one reader per item' },
    { title: 'Verify', detail: 'independently confirm each finding' },
  ],
}

// `args` is whatever the caller passed as Workflow({ args }); undefined if none.
// Default it so the workflow is runnable with no input.
const items =
  Array.isArray(args?.items) && args.items.length ? args.items : ['example-a', 'example-b']

// REPO_SAFETY — prepend to the prompt of any agent that may run shell commands.
//
// Every agent inherits the repository as its working directory, and the
// advisory/implementing contract constrains the agent TYPE a stage declares, not
// what Bash does once the agent has it. In #493 a review subagent's fixture
// landed in the corpus and was committed: two parallel agents had written the
// same shared scratchpad filename, the second clobbered the first, and the
// victim's `cd` into a directory that was never created failed WITHOUT stopping
// the script — so every following relative path resolved against the repo.
//
// The prompt in that run already said "build fixtures under /tmp", and the agent
// complied with it. These lines are mechanical instead: they remove the shared
// path, make the failed `cd` fatal, and assert the target before anything
// destructive. Bracket the whole run with `npm run guard:snapshot`, then
// `npm run guard:verify` and `npm run guard:release` — the HEAD comparison is the
// only check that catches a stray COMMIT, since `git status` reads clean once a
// stray write has been committed. Release is part of the loop, not a tidy-up:
// verify keeps the snapshot and snapshot refuses to overwrite one.
// NOT exported. The documented syntax check wraps the file in an async IIFE and
// rewrites only `export const meta`, so any other top-level `export` becomes
// `SyntaxError: Unexpected token 'export'` inside the wrapper — the template
// would fail its own step 4 before an author had written a line.
const REPO_SAFETY = `SAFETY — you are running inside a live git repository.
Work only in a directory you created yourself; never a shared or fixed path,
because parallel agents pick the same obvious filename and clobber each other.
Start every shell block that touches files with exactly this:

    DIR="$(mktemp -d)" || exit 1
    cd "$DIR" || exit 1

- The \`|| exit 1\` on \`cd\` is load-bearing: a bare \`cd\` that fails does NOT stop
  the script, and every relative path after it resolves against the repository.
- Before any \`git add\`, \`git commit\`, or a tool run with a write flag, assert:
    [ "$(git rev-parse --show-toplevel)" = "$DIR" ] || exit 1
- Never run \`git commit\`, \`git update-index\`, or \`git checkout --\` against the
  repository itself, and never invoke a repo tool with a write flag there.`

// A JSON Schema turns agent() into structured output: the subagent is forced to
// call StructuredOutput and agent() returns the validated object (no parsing).
const FINDING_SCHEMA = {
  type: 'object',
  required: ['item', 'summary', 'confidence'],
  properties: {
    item: { type: 'string' },
    summary: { type: 'string' },
    confidence: { type: 'number' }, // 0..1
  },
}

const VERDICT_SCHEMA = {
  type: 'object',
  required: ['confirmed', 'reason'],
  properties: {
    confirmed: { type: 'boolean' },
    reason: { type: 'string' },
  },
}

// phase() opens a named progress group; later agent() calls fall under it.
// INSIDE pipeline()/parallel() stages, prefer the per-call `phase:` option
// (used below) to avoid races on the global phase() state.
phase('Scan')

// pipeline() is the DEFAULT multi-stage primitive: each item flows through every
// stage independently with NO barrier between stages (item A can be in Verify
// while item B is still in Scan). Wall-clock = slowest single chain, not the sum.
// Reach for parallel() only when a stage genuinely needs ALL prior results at once.
const results = await pipeline(
  items,

  // Stage 1 — Scan: one agent per item emits a schema-validated finding.
  // This is read-only analysis, so it targets an ADVISORY agent type. A stage
  // that MUTATES artifacts (Write/Edit/Bash, or isolation: 'worktree') must
  // target an `implementing` agent type — the workflow analogue of the #285
  // team-assignment rule (advisory vs implementing capability contract).
  //
  // Prepend REPO_SAFETY to any prompt whose agent may run shell commands: the
  // capability contract governs the agent type a stage DECLARES, not what a
  // Bash-capable agent does to the working tree (#493).
  (item) =>
    agent(`${REPO_SAFETY}\n\nExamine "${item}" and report one finding.`, {
      label: `scan:${item}`,
      phase: 'Scan',
      agentType: 'Explore', // advisory: Read/Grep/Glob/Bash, no Write/Edit — honors the contract above
      schema: FINDING_SCHEMA,
    }),

  // Stage 2 — Verify: adversarially confirm stage 1's finding. Default to
  // confirmed=false unless the verifier can independently reproduce the issue —
  // this is what kills the false-positive flood in naive multi-agent review.
  (finding, item) =>
    agent(
      // Every Bash-capable stage carries the preamble, not just the first —
      // a verifier that reproduces a finding is exactly the agent most likely
      // to build a fixture, which is how #493 happened.
      `${REPO_SAFETY}\n\nIndependently verify this finding about "${item}": ${finding?.summary}. ` +
        `Default to confirmed=false unless you can reproduce it.`,
      { label: `verify:${item}`, phase: 'Verify', agentType: 'Explore', schema: VERDICT_SCHEMA },
    ).then((verdict) => ({ ...finding, verdict })),
)

// pipeline() drops a thrown item to null, and agent() itself returns null if a
// subagent is skipped or dies — filter() first, and gate on `verdict?.confirmed`
// so an absent result never counts as a confirmation.
const confirmed = results.filter(Boolean).filter((r) => r.verdict?.confirmed)

log(`${confirmed.length}/${results.filter(Boolean).length} findings confirmed`)

// A workflow's return value is handed back to the caller of Workflow().
return { confirmed, total: results.filter(Boolean).length }

// ============================================================================
// Validating
// ----------------------------------------------------------------------------
// Workflow scripts use a top-level `return`, which is valid in the Workflow
// runtime (the body is wrapped in an async function) but ILLEGAL in a raw ES
// module — so plain `node --check workflows/<name>.mjs` reports "Illegal return
// statement" on a perfectly valid workflow. Validate the runtime dialect by
// wrapping the body the way the runtime does, then syntax-checking:
//
//   { echo '(async()=>{'; \
//     sed 's/^[[:space:]]*export const meta/const meta/' workflows/<name>.mjs; \
//     echo '})()'; } | node --check -
//
// The authoritative check is running it: Workflow({ name: '<name>' }). The
// authoring globals above are an evolving vendor surface (observed in Claude
// Code v2.1.x, subject to change) — never CI-enforced.
// ============================================================================
