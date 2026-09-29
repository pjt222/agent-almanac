// ---
// name: review-changes
// description: Classify → adversarially verify → synthesize a code review over changed files
// phases: Classify, Verify, Synthesize
// ---
//
// review-changes — the flagship seed workflow.
//
// It captures a review spine that a *team* cannot express structurally: a
// staged, per-item fan-out where every candidate finding must survive an
// independent adversarial verification before it reaches the report. The
// classify→refute→synthesize logic lives in this script's control flow, not in
// a lead agent's turn-by-turn judgment — that is what makes it a workflow.
//
// It pairs with the review-codebase / review-pull-request *skills*: a skill says
// how one reviewer works; this workflow coordinates many with deterministic control flow.
//
// Capability contract (#285): every stage here is read-only analysis, so each
// agent() targets an ADVISORY agent type (Explore — Read/Grep/Glob/Bash, no
// Write/Edit). If a future stage were to write a patch, it would have to target
// an `implementing` agent type instead. The script names the spawn type per
// call — the cleanest expression of the agent-persona vs subagent_type decoupling.
// Advisory is not the same as unable to write: Explore carries Bash, so every
// prompt below starts with REPO_SAFETY and WRITE_LOCATION (#861).
//
// Invoke:  Workflow({ name: 'review-changes' })            // diff vs HEAD
//          Workflow({ name: 'review-changes', args: { files: ['a.js','b.R'] } })
//          /review-changes                                  // slash command
//
// Validating this file: see workflows/_template.mjs — top-level `return` is valid
// Workflow dialect but illegal raw ESM, so use the wrap-then-`node --check` recipe.

export const meta = {
  name: 'review-changes',
  description: 'Classify → adversarially verify → synthesize a code review over changed files',
  phases: [
    { title: 'Classify', detail: 'one advisory agent per changed file emits candidate findings' },
    { title: 'Verify', detail: 'parallel adversarial refuters per finding; default refuted' },
    { title: 'Synthesize', detail: 'consolidate only surviving findings into a severity report' },
  ],
}

// REPO_SAFETY and WRITE_LOCATION: byte-identical copies of the two constants in
// workflows/_template.mjs, which carries their rationale (#493, #859). Every Bash-capable
// spawn below starts its prompt with them (#861). Do not edit them here: edit the template and
// re-copy. scripts/test/workflow-template.test.js fails on a copy that differs, and A7b
// (scripts/check-workflow-contract.js) fails a Bash-capable spawn that does not carry them.
const REPO_SAFETY = `SAFETY — you are running inside a live git repository.
Work only in a directory you created yourself; never a shared or fixed path,
because parallel agents pick the same obvious filename and clobber each other.
Start every shell block that touches files with exactly this:

    DIR="$(mktemp -d)" || exit 1
    cd "\${DIR:?}" || exit 1

- The \`|| exit 1\` on \`cd\` is load-bearing: a bare \`cd\` that fails does NOT stop
  the script, and every relative path after it resolves against the repository.
  The brace matters for the same reason it does below — \`cd ""\` returns 0 without
  moving, so an unset \`DIR\` leaves you wherever you started and the \`|| exit 1\`
  never fires. Every \`$DIR\` in this preamble is braced; do not copy one of these
  lines on its own and drop it.
- Name an ABSOLUTE path under \`$DIR\` in every destructive command, braced so an
  unset variable refuses instead of expanding: \`rm -rf "\${DIR:?}/fixtures"\`,
  never \`rm -rf fixtures\` and never a bare \`"$DIR/fixtures"\`. The \`cd\` above
  is one control; a relative \`rm\` makes it the only one, so the single failure it
  guards against becomes repository damage instead of a wasted command. An
  absolute path trades the dependency on the working directory for a dependency on
  \`$DIR\` being set, and that one bites: \`cd ""\` succeeds without moving, so an
  unset \`DIR\` leaves you standing in the repository AND expands
  \`"$DIR/fixtures"\` to \`/fixtures\`. The \`:?\` refuses both cases, unset and
  empty alike, on bash 5.2 and zsh 5.9. It aborts the enclosing shell at top
  level; inside \`( )\` or \`$( )\` it aborts only that subshell, so keep
  destructive commands at top level. It checks non-emptiness, not absoluteness —
  a relative \`TMPDIR\` makes \`mktemp -d\` return a relative path, which is no
  worse than the unbraced form but is not protected by it either.
- Before any \`git add\`, \`git commit\`, or a tool run with a write flag, assert —
  braced for the same reason as the rule above, since OUTSIDE any repository
  \`git rev-parse\` prints nothing and an unset \`DIR\` makes this compare "" to ""
  and PASS:
    [ "$(git rev-parse --show-toplevel)" = "\${DIR:?}" ] || exit 1
- Never run \`git commit\`, \`git update-index\`, or \`git checkout --\` against the
  repository itself, and never invoke a repo tool with a write flag there.`

const WRITE_LOCATION = `WRITE LOCATION — write every file you produce, by any tool, under your own
\`$DIR\`: the absolute path the preamble's \`mktemp -d\` created (\`echo "\${DIR:?}"\`
prints it for a tool that is not the shell). Write nothing under the repository root.`

// Adversarial verifiers per candidate finding. A finding SURVIVES only when a
// majority of refuters independently CONFIRM it (refuted === false). Default-refuted
// votes — and null/dead refuters — do NOT count as confirmation, so a finding dies on
// absent or minority evidence. That burden-of-proof gate is the false-positive filter.
const REFUTERS = 3
const CONFIRM_QUORUM = Math.floor(REFUTERS / 2) + 1 // strict majority for any REFUTERS; >= this many confirms to survive

const FILES_SCHEMA = {
  type: 'object',
  required: ['files'],
  properties: { files: { type: 'array', items: { type: 'string' } } },
}

const CANDIDATES_SCHEMA = {
  type: 'object',
  required: ['file', 'findings'],
  properties: {
    file: { type: 'string' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        required: ['title', 'severity', 'mechanism', 'evidence'],
        properties: {
          title: { type: 'string' },
          severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low', 'info'] },
          mechanism: { type: 'string' }, // how the bug triggers
          evidence: { type: 'string' }, // file:line or quoted code
        },
      },
    },
  },
}

const VERDICT_SCHEMA = {
  type: 'object',
  required: ['refuted', 'reason'],
  properties: {
    refuted: { type: 'boolean' }, // true = could NOT confirm the finding (default)
    reason: { type: 'string' },
  },
}

const REPORT_SCHEMA = {
  type: 'object',
  required: ['report'],
  properties: {
    report: { type: 'string' }, // markdown, grouped by severity
    bySeverity: { type: 'object' },
  },
}

phase('Classify')

// 1. Resolve the changed-file list. args.files wins; otherwise one read-only
//    agent derives it from the working tree (the script itself has no shell).
let files = Array.isArray(args?.files) && args.files.length ? args.files : null
if (!files) {
  const disc = await agent(
    `${REPO_SAFETY}\n\n${WRITE_LOCATION}\n\n` +
    'Run `git diff --name-only HEAD` (fall back to `git diff --name-only` if HEAD is unborn) ' +
      'and return the changed, non-deleted file paths. Read-only — do not modify anything.',
    { label: 'discover-files', phase: 'Classify', agentType: 'Explore', schema: FILES_SCHEMA },
  )
  files = (disc?.files ?? []).filter(Boolean)
}

if (!files.length) {
  log('No changed files to review.')
  return { findings: [], reviewed: 0, report: 'No changed files to review.' }
}
log(`Reviewing ${files.length} changed file(s)`)

// 2-3. Pipeline, NO barrier between stages: file A can be in Verify while file B
//      is still in Classify. Synthesis (below) is the one genuine barrier.
const perFile = await pipeline(
  files,

  // Classify — one advisory agent per file proposes candidate findings.
  (file) =>
    agent(
      `${REPO_SAFETY}\n\n${WRITE_LOCATION}\n\n` +
      `Review the changed file "${file}". Read it and its diff (\`git diff -- ${file}\`). ` +
        `Report concrete candidate findings (bugs, security issues, correctness risks). ` +
        `Return file="${file}"; for each finding give a title, a severity ` +
        `(critical|high|medium|low|info), the triggering mechanism, and file:line evidence. ` +
        `Do not modify anything.`,
      { label: `classify:${file}`, phase: 'Classify', agentType: 'Explore', schema: CANDIDATES_SCHEMA },
    ),

  // Verify — each candidate faces a parallel() fan-out of adversarial refuters
  // that DEFAULT to refuted=true unless they can independently reproduce it.
  (cand, file) =>
    parallel(
      (cand?.findings ?? []).map((f) => () =>
        parallel(
          Array.from({ length: REFUTERS }, (_unused, i) => () =>
            agent(
              `${REPO_SAFETY}\n\n${WRITE_LOCATION}\n\n` +
              `Adversarially verify this finding in "${file}" (refuter ${i + 1}/${REFUTERS}): ` +
                `${f.title} — ${f.mechanism}. Evidence cited: ${f.evidence}. ` +
                `Read the file yourself and, if needed, run \`git diff -- ${file}\` to see what changed. ` +
                `Set refuted=true UNLESS you can independently ` +
                `reproduce or confirm the issue; when in doubt, refuted=true. ` +
                `Always include a brief reason for the verdict.`,
              { label: `refute:${file}#${i}`, phase: 'Verify', agentType: 'Explore', schema: VERDICT_SCHEMA },
            ),
          ),
        ).then((votes) => {
          // Gate on affirmative confirmations, not refutations: a null/dead refuter
          // must not let a finding survive on absent evidence (default-refuted intent).
          const confirmedVotes = votes.filter((v) => v && v.refuted === false).length
          const refutedVotes = votes.filter(Boolean).filter((v) => v.refuted).length
          return { ...f, file, survived: confirmedVotes >= CONFIRM_QUORUM, confirmedVotes, refutedVotes }
        }),
      ),
    ),
)

// One barrier: synthesis needs ALL survivors together.
const surviving = perFile
  .filter(Boolean)
  .flat()
  .filter(Boolean)
  .filter((x) => x.survived)

log(`${surviving.length} finding(s) survived adversarial verification`)

if (!surviving.length) {
  return { findings: [], reviewed: files.length, report: 'No findings survived adversarial verification.' }
}

phase('Synthesize')
const synth = await agent(
  `${REPO_SAFETY}\n\n${WRITE_LOCATION}\n\n` +
  `Consolidate these verified review findings into a single markdown report grouped by ` +
    `severity (critical → info). Keep each entry's file:line evidence and mechanism. ` +
    `Findings JSON:\n${JSON.stringify(surviving, null, 2)}`,
  { label: 'synthesize', phase: 'Synthesize', agentType: 'Explore', schema: REPORT_SCHEMA },
)

return {
  findings: surviving,
  reviewed: files.length,
  report: synth?.report ?? '',
  bySeverity: synth?.bySeverity ?? {},
}
