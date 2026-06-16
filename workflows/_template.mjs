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
// agreement: same name, same description, and the sidecar `phases:` list ⊇ every
// title passed to phase().
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
  (item) =>
    agent(`Examine "${item}" and report one finding.`, {
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
      `Independently verify this finding about "${item}": ${finding?.summary}. ` +
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
