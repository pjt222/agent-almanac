// ---
// name: batch-generate-waves
// description: Resumable scout → generate → audit waves over a large item pool; artifacts are disk-durable and validator-gated, so interrupted runs salvage and resume
// phases: Scout, Generate, Audit
// ---
//
// batch-generate-waves — generate a validated artifact for EVERY item in a
// large pool (hundreds–thousands), in waves that survive interruption.
//
// At that scale a run WILL be interrupted — credit exhaustion, API stalls,
// rate limits. This workflow generalizes the wave pattern that covered a
// ~750-item card-glyph pool across 8+ waves with zero lost work (#328). The
// wave loop, fan-out, and terminal-state classification are fixed control
// flow — that is what makes it a workflow, not a team.
//
// Durability model: the SCRIPT never touches the filesystem. The spawned
// agents do all disk work — the scout re-derives the todo list from disk
// (pool minus already-done), each generator writes every artifact to disk
// and validator-gates it BEFORE returning, and a read-only auditor confirms
// the outputs exist on disk and flags weak ones. So a generator that dies
// mid-batch loses only its unfinished items: the finished artifacts are
// already on disk. SALVAGE, don't restart — commit what survived, relaunch,
// and the idempotent scout skips it. Resume = relaunching this workflow (the
// scout excludes finished items) or the Workflow runtime's own resume.
//
// Terminal states in the return value:
//   pool-covered — a scout affirmed the pool minus done is empty, or the
//                  final wave finished with nothing remaining and no losses.
//   partial      — salvageable: everything in `written` is validator-gated
//                  on disk; commit it and relaunch to continue.
//   scout-failed — the scout died or under-enumerated before anything was
//                  written; relaunch is safe with no cleanup.
//
// Capability contract (#285): Scout and Audit are read-only analysis and
// target the advisory `Explore` type; Generate mutates artifacts and targets
// the implementing `general-purpose` type.
//
// The canonical per-item generator procedure is the generative-recipe-dsl
// skill (skills/generative-recipe-dsl/SKILL.md): agents emit small validated
// JSON recipes and one audited interpreter renders them all. Pass its recipe
// spec as `generatorPrompt` and its validator as `validatorCommand`.
//
// Invoke:  Workflow({ name: 'batch-generate-waves', args: {
//            poolSource: 'every card in data/engine_cards.json; done = R/cards/recipes/<id>.json exists',
//            generatorPrompt: '<per-item instructions, e.g. the recipe-DSL doc — see skills/generative-recipe-dsl>',
//            validatorCommand: 'Rscript R/cards/validate_recipes.R <ids>',
//            outputDir: 'R/cards/recipes',
//            batchKey: 'evolution family', priority: 'ladder-relevant cards first',
//            batchSize: 24, waveSize: 4, maxWaves: 3 } })
//          Workflow({ name: 'batch-generate-waves', args: { items: ['leftover_a', 'leftover_b'], ... } })
//                                                   // scout bypass for a stubborn tail
//          /batch-generate-waves                    // slash command
//
// Validating this file: see workflows/_template.mjs — top-level `return` is valid
// Workflow dialect but illegal raw ESM, so use the wrap-then-`node --check` recipe.

export const meta = {
  name: 'batch-generate-waves',
  description:
    'Resumable scout → generate → audit waves over a large item pool; artifacts are disk-durable and validator-gated, so interrupted runs salvage and resume',
  phases: [
    { title: 'Scout', detail: 'pool minus already-done on disk, batched by natural grouping, priority first' },
    { title: 'Generate', detail: 'one implementing agent per batch; every artifact on disk and validator-gated before return' },
    { title: 'Audit', detail: 'read-only per-batch disk confirmation; judge quality, flag missing and weak' },
  ],
}

// --- args: four required strings, the rest defaulted ------------------------
const poolSource = typeof args?.poolSource === 'string' && args.poolSource.trim() ? args.poolSource.trim() : null
const generatorPrompt =
  typeof args?.generatorPrompt === 'string' && args.generatorPrompt.trim() ? args.generatorPrompt.trim() : null
const validatorCommand =
  typeof args?.validatorCommand === 'string' && args.validatorCommand.trim() ? args.validatorCommand.trim() : null
const outputDir = typeof args?.outputDir === 'string' && args.outputDir.trim() ? args.outputDir.trim() : null

const positiveInteger = (value, fallback) => (Number.isInteger(value) && value > 0 ? value : fallback)
const batchKey = typeof args?.batchKey === 'string' && args.batchKey.trim() ? args.batchKey.trim() : 'natural family or category'
const priority = typeof args?.priority === 'string' ? args.priority.trim() : ''
const batchSize = positiveInteger(args?.batchSize, 20) // items per batch (one generator agent each)
const waveSize = positiveInteger(args?.waveSize, 4) // batches per wave
const maxWaves = positiveInteger(args?.maxWaves, 3) // bounded loop; relaunch to continue past it

const missingArgs = [
  !poolSource && 'poolSource',
  !generatorPrompt && 'generatorPrompt',
  !validatorCommand && 'validatorCommand',
  !outputDir && 'outputDir',
].filter(Boolean)
if (missingArgs.length) {
  log(`missing required args: ${missingArgs.join(', ')} — nothing written, relaunch with full args`)
  return {
    state: 'scout-failed',
    waves: 0,
    written: [],
    failed: [],
    missing: [],
    weak: [],
    remaining: null,
    waveSummaries: [],
    note:
      `Missing required args: ${missingArgs.join(', ')}. Nothing was written — relaunching with full args is safe. ` +
      `See the header comment for the contract; the canonical per-item generator is skills/generative-recipe-dsl.`,
  }
}

// Scout bypass: an explicit args.items list (strings or {id,...} objects) is
// chunked directly. Use it when the scout under-enumerates a pool's tail —
// pre-compute the leftover ids and pass them here.
const explicitItems = Array.isArray(args?.items)
  ? args.items
      .map((item) => (typeof item === 'string' ? { id: item } : item))
      .filter((item) => item && typeof item.id === 'string' && item.id)
  : null
let explicitQueue = null
if (explicitItems && explicitItems.length) {
  explicitQueue = []
  for (let offset = 0; offset < explicitItems.length; offset += batchSize) {
    explicitQueue.push(explicitItems.slice(offset, offset + batchSize))
  }
  log(`explicit items: ${explicitItems.length} item(s) → ${explicitQueue.length} batch(es); scout bypassed`)
}

const SCOUT_SCHEMA = {
  type: 'object',
  required: ['batches', 'remaining', 'poolCovered'],
  properties: {
    batches: {
      type: 'array',
      items: {
        type: 'array',
        items: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            group: { type: 'string' },
          },
        },
      },
    },
    remaining: { type: 'integer' }, // items left AFTER this wave's batches
    poolCovered: { type: 'boolean' }, // true ONLY when pool minus done was verified empty
  },
}

const BATCH_REPORT_SCHEMA = {
  type: 'object',
  required: ['written', 'failed'],
  properties: {
    written: { type: 'array', items: { type: 'string' } }, // ids on disk AND validator-passing
    failed: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'reason'],
        properties: { id: { type: 'string' }, reason: { type: 'string' } },
      },
    },
  },
}

const AUDIT_SCHEMA = {
  type: 'object',
  required: ['onDisk', 'missing', 'weak'],
  properties: {
    onDisk: { type: 'array', items: { type: 'string' } }, // confirmed present AND validator-passing
    missing: { type: 'array', items: { type: 'string' } }, // expected but absent or failing
    weak: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'why'],
        properties: { id: { type: 'string' }, why: { type: 'string' } },
      },
    },
  },
}

// --- the wave loop -----------------------------------------------------------
const written = []
const failed = []
const missing = []
const weak = []
const waveSummaries = []
let wavesDone = 0
let remaining = null
let state = null // resolved to 'pool-covered' | 'partial' | 'scout-failed'

for (let waveIndex = 1; waveIndex <= maxWaves; waveIndex++) {
  // Budget guard: never start a wave the budget cannot finish. Deferred waves
  // are logged, not silently dropped — the artifacts on disk make relaunch cheap.
  if (wavesDone > 0 && budget && budget.total) {
    const spentPerWave = budget.spent() / wavesDone
    if (budget.remaining() < spentPerWave) {
      log(
        `budget: ${Math.round(budget.remaining())} of ${budget.total} tokens left < ~${Math.round(spentPerWave)} ` +
          `per wave — deferring wave ${waveIndex}+ (~${remaining ?? '?'} item(s)); relaunch resumes from disk`,
      )
      break
    }
  }

  // Scout — one read-only agent re-derives the todo list from disk. This
  // idempotent exclusion of finished items is the whole resume mechanism.
  let scout
  if (explicitQueue) {
    const slice = explicitQueue.splice(0, waveSize)
    scout = {
      batches: slice,
      remaining: explicitQueue.reduce((count, batch) => count + batch.length, 0),
      poolCovered: slice.length === 0 && failed.length === 0 && missing.length === 0,
    }
  } else {
    scout = await agent(
      `Build the wave-${waveIndex} todo list for a generation pool. Read-only — write nothing.\n` +
        `Pool source: ${poolSource}\n` +
        `An item is DONE when its artifact already exists under ${outputDir} — never re-list a finished item ` +
        `(this exclusion is what makes the workflow resumable).\n` +
        `1. Enumerate the full pool, then exclude the items already done on disk.\n` +
        `2. Group the remainder by ${batchKey}; keep groups whole, ~${batchSize} items per batch.\n` +
        `3. Order batches: ${priority ? `${priority}, then the rest` : 'highest-value groups first'}.\n` +
        `4. Return AT MOST ${waveSize} batches (fewer only if the remaining pool does not fill them). ` +
        `Each item: id (required), plus name/group when known. Also return remaining = the item count left ` +
        `AFTER these batches, and poolCovered = true ONLY if you verified that pool minus done is empty.`,
      { label: `scout:wave${waveIndex}`, phase: 'Scout', agentType: 'Explore', schema: SCOUT_SCHEMA },
    )
  }

  const batches = (scout && Array.isArray(scout.batches) ? scout.batches : []).filter(
    (batch) => Array.isArray(batch) && batch.length,
  )

  if (!batches.length) {
    if (scout && scout.poolCovered) {
      state = 'pool-covered'
      remaining = 0
    } else if (explicitQueue) {
      state = 'partial' // explicit list exhausted but some items failed or went missing
    } else {
      // A dead or under-enumerating scout writes nothing, so nothing needs
      // cleanup. Only a first-wave failure is 'scout-failed'; after a
      // successful wave the run is 'partial' — its artifacts are on disk.
      log(`scout returned no batches without affirming coverage (wave ${waveIndex}) — treat as scout failure`)
      state = wavesDone === 0 ? 'scout-failed' : 'partial'
    }
    break
  }

  let deferredItems = 0 // items in over-returned batches deferred this wave — still pending work
  if (batches.length > waveSize) {
    const deferred = batches.splice(waveSize)
    deferredItems = deferred.flat().length
    log(
      `scout over-returned: deferring ${deferred.length} batch(es) (${deferredItems} item(s)) — ` +
        `not dropped, the next scout re-lists them`,
    )
  }

  // Generate → Audit, pipelined per batch (batch A is audited while batch B
  // still generates). The auditor runs even when the generator died — its
  // finished artifacts are on disk and MUST be counted (salvage, not restart).
  const waveResults = await pipeline(
    batches,

    (batch, _originalBatch, batchIndex) =>
      agent(
        `You are one batch generator in a resumable wave. Produce a validated artifact for EACH item below.\n\n` +
          `Per-item procedure (the caller's generator template — canonical pattern: the generative-recipe-dsl skill):\n` +
          `${generatorPrompt}\n\n` +
          `Your batch (groups kept whole — keep shared traits consistent within a ${batchKey} group):\n` +
          `${JSON.stringify(batch)}\n\n` +
          `Durability contract, non-negotiable:\n` +
          `1. Write each item's artifact under ${outputDir} as soon as that item is finished — never hold ` +
          `artifacts in memory until the end. If this run dies mid-batch, finished artifacts must already ` +
          `be on disk (they will be salvaged, not regenerated).\n` +
          `2. After writing ALL artifacts, run the validator: ${validatorCommand} — fix every failure until ` +
          `all pass. An item counts as written ONLY when its artifact passes.\n` +
          `3. Return written = ids written AND passing; failed = ids you could not produce, each with a ` +
          `reason naming what is missing (do NOT extend the spec or invent workarounds).`,
        {
          label: `generate:w${waveIndex}b${batchIndex}`,
          phase: 'Generate',
          agentType: 'general-purpose', // implementing: this stage writes artifacts
          schema: BATCH_REPORT_SCHEMA,
        },
      ),

    (report, batch, batchIndex) =>
      agent(
        `Read-only audit of one generation batch — trust the DISK, not the report.\n` +
          `Expected item ids: ${JSON.stringify(batch.map((item) => item.id))}\n` +
          `Generator report (null means the generator died mid-batch; artifacts it finished before dying ` +
          `are still on disk and MUST be counted): ${JSON.stringify(report)}\n\n` +
          `1. Confirm each expected item's artifact exists under ${outputDir}.\n` +
          `2. Re-check the present ones with the validator: ${validatorCommand} (run it; modify nothing).\n` +
          `3. Judge quality against neighboring artifacts in ${outputDir}; flag weak ones (valid but below ` +
          `the corpus bar) with a one-line why. Do NOT fix anything — weak items go on the fix-list.\n` +
          `Return onDisk = ids confirmed present AND passing; missing = ids expected but absent or failing ` +
          `(skip ids the report already lists as failed); weak = the quality flags.`,
        { label: `audit:w${waveIndex}b${batchIndex}`, phase: 'Audit', agentType: 'Explore', schema: AUDIT_SCHEMA },
      ).then((audit) => ({ batch, report, audit })),
  )

  // Accumulate. Audit's disk confirmation outranks the generator's claim; a
  // dead auditor falls back to the validator-gated report, loudly.
  let waveWritten = 0
  let waveProblems = 0
  for (const result of waveResults.filter(Boolean)) {
    const confirmedIds = result.audit ? result.audit.onDisk ?? [] : result.report?.written ?? []
    if (!result.audit && result.report) {
      log(`audit died for a batch in wave ${waveIndex} — counting its validator-gated report unaudited`)
    }
    written.push(...confirmedIds)
    waveWritten += confirmedIds.length
    const missingIds = result.audit?.missing ?? []
    missing.push(...missingIds)
    weak.push(...(result.audit?.weak ?? []))
    const failedItems = result.report?.failed ?? []
    failed.push(...failedItems)
    waveProblems += missingIds.length + failedItems.length
  }
  const deadBatches = waveResults.length - waveResults.filter(Boolean).length
  if (deadBatches) {
    log(
      `${deadBatches} batch(es) died unaudited in wave ${waveIndex} — their finished artifacts are on ` +
        `disk; the next scout re-lists only the unfinished items`,
    )
  }

  wavesDone += 1
  // scout.remaining counts the pool left after ALL batches the scout returned,
  // so batches deferred above are invisible to it — add them back, or a wave
  // whose over-returned batches exhaust the pool reads as remaining 0 and the
  // coverage guard below silently drops the deferred, never-generated items.
  const scoutRemaining = Number.isInteger(scout.remaining) ? scout.remaining : null
  remaining = scoutRemaining === null && deferredItems === 0 ? null : (scoutRemaining ?? 0) + deferredItems
  waveSummaries.push({ wave: waveIndex, written: waveWritten, problems: waveProblems, remaining })
  log(`wave ${waveIndex}: ${waveWritten} written, ${waveProblems} failed/missing, ~${remaining ?? '?'} remaining`)

  // Affirmative coverage: nothing left, nothing deferred, nothing lost, nothing unaudited.
  if (remaining === 0 && deferredItems === 0 && waveProblems === 0 && deadBatches === 0) {
    state = 'pool-covered'
    break
  }
}

if (!state) state = 'partial' // maxWaves exhausted or budget deferral

const NOTES = {
  'pool-covered': 'Every pool item has a validator-gated artifact on disk. Commit the output.',
  partial:
    'Salvageable, not failed: everything in `written` is validator-gated on disk — commit it, then ' +
    'relaunch; the idempotent scout skips finished items and continues from the remainder.',
  'scout-failed':
    'The scout wrote nothing, so relaunching is safe with no cleanup. If it keeps under-enumerating a ' +
    'small tail, pre-compute the leftover ids and pass them as args.items to bypass it.',
}

return {
  state,
  waves: wavesDone,
  written,
  failed,
  missing,
  weak,
  remaining,
  waveSummaries,
  note: NOTES[state],
}
