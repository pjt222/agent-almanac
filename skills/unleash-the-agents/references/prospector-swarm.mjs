// ---
// name: prospector-swarm
// description: unleash-the-agents as a Workflow script — cheap-model prospectors in waves over a territory-split corpus, session-model clustering, adversarial passes, and a stop rule that needs independent convergence
// phases: Pilot, Prospect, Cluster, Challenge, Edge, Late challenge, Synthesize
// ---
//
// prospector-swarm — Option C of the unleash-the-agents skill (Step 3): the whole roster as
// a Workflow script, with the prospectors on a cheap model and the judgement stages (cluster,
// adversary, synthesis) on the session model.
//
// RUN IT ONLY ON AN EXPLICIT WORKFLOW OPT-IN. A Workflow run is the user's to ask for: the
// keyword `ultracode`, or the user's own words asking for a workflow or a fan-out. The skill
// alone is not that opt-in. The one measured run (tests/results/2026-11-17-unleash-prospector-
// swarm/RESULT.md) used 84 agents and about 4 h, and the 9 session-model agents produced a
// quarter of all output tokens. Tell the user the scale before launching.
//
// Why a script and not Option A:
// - The stop rule, the citation filter, the wave sizes and the null model are fixed in code, so
//   a run can be re-read and resumed.
// - Raw hypotheses stay out of the lead's context. Only the cluster and synthesis passes read
//   them, and the lead reads the journal afterwards.
//
// Why it lives under the skill and not in workflows/: every prospector spawns as its own
// roster agent (`agentType: <agent id>`). The workflow contract checker accepts only a
// literal agentType from a fixed map (scripts/check-workflow-contract.js), and refuses a
// per-spawn persona type by design. The persona type is the point of an unleash, and it buys
// containment: a mystic or a kabalist carries Read/Grep/Glob and no shell.
//
// INVOKE (two launches; the second replays the pilot from cache):
//   Workflow({ scriptPath: '<this skill directory>/references/prospector-swarm.mjs', args: {
//     mode: 'pilot',                       // then 'full', with resumeFromRunId of the pilot run
//     question: 'one sentence: what the swarm must decide',
//     brief: '/abs/path/brief.md',         // the Step 1 brief; every agent reads it first
//     index: '/abs/path/index.tsv',        // optional: the citable ids, one per row
//     itemRoot: '/abs/path/corpus',        // optional: prefix that opens an id
//     territories: { 'T1-name': ['id', ...], 'T2-name': [...] },  // every citable id, split
//     expectItems: 129,                    // the union of territories must have exactly this size
//     roster: ['agent-id', ...],           // shuffled by the caller (scripts cannot randomise);
//                                          // excludes the adversary and the two pilot agents
//     pilot: [{ agent: 'janitor', territory: 'T1-name' }, { agent: 'mystic', territory: 'T2-name' }],
//     seeds: ['S1', 'S2'],                 // families the brief already names; [] if none
//     writeRoot: '/abs/scratch/dir',       // the ONE place an agent may create a scratch file
//   } })
// Optional args: prospectorModel ('haiku'), clusterModel (session model), adversary
// ('advocatus-diaboli'), edgeWaveSize (10), minNewAgents (2), maxEdgeWaves (6), framing (a lens
// sentence; `{agent}` is replaced by the agent id), extraSteps (array of instruction lines added
// to every prospector prompt, e.g. "read the registry at X before proposing a new tool").
//
// Waves:
// - Pilot: 2 agents.
// - Waves 1-2: the first 18 roster agents, 20 with the pilot.
// - Wave 3: the next 10, plus the adversary.
// - Edge waves: `edgeWaveSize` each. A remainder smaller than half a wave joins the last wave
//   instead of running alone.
//
// The stop rule: an edge wave runs only while the previous cluster pass produced a NEW family
// that at least `minNewAgents` agents filed. Measured: the first version continued on any new
// family citing one valid item, and a cluster pass always names one. It ran the whole roster,
// and its last four waves produced only one-agent families. That measurement is RESULT.md's
// "The stop rule".
//
// Families born after wave 3 never met the wave-3 adversary, so a late challenge pass covers
// them before the synthesis.
//
// After the run, in the lead's own session, not here:
// - read the return value from tasks/<id>.output or journal.jsonl; the notification truncates;
// - read each transcript's message.model, to confirm the prospectors ran the model you asked for;
// - check containment with the repo guard and before/after manifests of anything an agent could
//   reach. A prompt is not a sandbox: in the measured run 6 of the 45 Bash-using prospectors wrote
//   scratch copies despite a "write nothing" sentence;
// - re-derive every cited claim you will repeat. The swarm executes nothing, so each
//   testable_prediction it returns is unrun.

export const meta = {
  name: 'prospector-swarm',
  description: 'unleash-the-agents as a Workflow script: cheap-model prospectors in waves, session-model clustering, adversarial passes, and a convergence stop rule',
  phases: [
    { title: 'Pilot', detail: 'two prospectors; check the model, the citations and containment before the full run' },
    { title: 'Prospect', detail: 'waves 1-2, one home territory each' },
    { title: 'Cluster', detail: 'group hypotheses into families by mechanism (session model)' },
    { title: 'Challenge', detail: 'wave 3 plus the adversary' },
    { title: 'Edge', detail: 'later waves, only while a new family has independent convergence' },
    { title: 'Late challenge', detail: 'the adversary on families born after wave 3' },
    { title: 'Synthesize', detail: 'the final ranking (session model)' },
  ],
}

// --- Arguments: refuse before the first agent is spawned --------------------------------------
// A launch with an unfilled placeholder once spawned nothing and failed deep inside the body;
// these checks make every such launch fail here, naming the argument, at zero agents.

const A = args && typeof args === 'object' && !Array.isArray(args) ? args : {}
const refuse = (msg) => { throw new Error(`prospector-swarm: ${msg}`) }
const UNFILLED = /__FILL__|^<.*>$|^\s*$/
const absPath = (name, required = true) => {
  const v = A[name]
  if (v === undefined && !required) return undefined
  if (typeof v !== 'string' || UNFILLED.test(v) || !v.startsWith('/')) refuse(`args.${name} must be an absolute path; got ${JSON.stringify(v)}`)
  return v.replace(/\/+$/, '')
}
const intArg = (name, dflt, min) => {
  const v = A[name] === undefined ? dflt : A[name]
  if (!Number.isInteger(v) || v < min) refuse(`args.${name} must be an integer >= ${min}; got ${JSON.stringify(v)}`)
  return v
}

const MODE = A.mode
if (MODE !== 'pilot' && MODE !== 'full') refuse(`args.mode must be 'pilot' or 'full'; got ${JSON.stringify(MODE)}`)
if (typeof A.question !== 'string' || UNFILLED.test(A.question)) refuse('args.question must be one sentence naming what the swarm decides')
const QUESTION = A.question.trim()
const BRIEF = absPath('brief')
const INDEX_FILE = absPath('index', false)
const ITEM_ROOT = absPath('itemRoot', false)
const WRITE_ROOT = absPath('writeRoot')

const TERR = A.territories
if (!TERR || typeof TERR !== 'object' || Array.isArray(TERR)) refuse(`args.territories must map a territory name to an array of item ids; got ${Array.isArray(TERR) ? 'an array' : typeof TERR}`)
const TERR_KEYS = Object.keys(TERR)
if (TERR_KEYS.length < 2) refuse(`args.territories needs at least 2 territories; got ${TERR_KEYS.length}`)
for (const k of TERR_KEYS) {
  if (!Array.isArray(TERR[k]) || TERR[k].length === 0 || !TERR[k].every((x) => typeof x === 'string' && !UNFILLED.test(x)))
    refuse(`args.territories['${k}'] must be a non-empty array of item ids`)
}
const ITEMS = new Set(Object.values(TERR).flat())
const EXPECT = intArg('expectItems', undefined, 1)
if (ITEMS.size !== EXPECT) refuse(`the territories hold ${ITEMS.size} distinct items; args.expectItems says ${EXPECT}`)

const ADVERSARY = A.adversary === undefined ? 'advocatus-diaboli' : A.adversary
if (typeof ADVERSARY !== 'string' || UNFILLED.test(ADVERSARY)) refuse('args.adversary must be an agent id')
const PILOT = A.pilot
if (!Array.isArray(PILOT) || PILOT.length !== 2 || !PILOT.every((p) => p && typeof p.agent === 'string' && TERR_KEYS.includes(p.territory)))
  refuse('args.pilot must be two { agent, territory } entries naming existing territories')
const ROSTER = A.roster
if (!Array.isArray(ROSTER) || ROSTER.length < 8 || !ROSTER.every((x) => typeof x === 'string' && !UNFILLED.test(x)))
  refuse(`args.roster must list at least 8 agent ids; got ${Array.isArray(ROSTER) ? ROSTER.length : typeof ROSTER}`)
if (new Set(ROSTER).size !== ROSTER.length) refuse('args.roster lists an agent twice')
for (const x of [ADVERSARY, ...PILOT.map((p) => p.agent)]) if (ROSTER.includes(x)) refuse(`args.roster must not include ${x}: the pilot agents and the adversary run in their own stages`)

const SEEDS = A.seeds === undefined ? [] : A.seeds
if (!Array.isArray(SEEDS) || !SEEDS.every((s) => typeof s === 'string' && /^[A-Za-z][\w-]*$/.test(s) && s !== 'NEW'))
  refuse('args.seeds must be an array of short family ids (not NEW)')
const PROSPECTOR_MODEL = A.prospectorModel === undefined ? 'haiku' : A.prospectorModel
const CLUSTER_MODEL = A.clusterModel // undefined: the session model
const EDGE_SIZE = intArg('edgeWaveSize', 10, 1)
const MIN_NEW = intArg('minNewAgents', 2, 1)
const MAX_EDGE = intArg('maxEdgeWaves', 6, 0)
const EXTRA = A.extraSteps === undefined ? [] : A.extraSteps
if (!Array.isArray(EXTRA) || !EXTRA.every((s) => typeof s === 'string')) refuse('args.extraSteps must be an array of strings')
const FRAMING = typeof A.framing === 'string' && A.framing.trim() ? A.framing
  : 'Lens: you are the {agent} agent. Your discipline has its own sense of when a recurring thing is one pattern and when it is several, and of what would show a pattern to be false. Use that lens to SEE, then answer in concrete terms: item ids, a mechanism, a testable prediction.'

// --- Prompts --------------------------------------------------------------------------------

// Not "write nothing": agents that needed a temporary file broke that sentence. A sanctioned
// place keeps their writes where the lead can find and delete them.
const CONTAINMENT = [
  'CONTAINMENT (binding; read before anything else).',
  '- Read only. Do not edit or delete any file, do not execute any script from the corpus, and do not run git, gh, npm, npx, node or python.',
  `- If you need a scratch file, create your own directory first, in the same shell call, and write only under it: DIR="$(mktemp -d "${WRITE_ROOT}/prospect.XXXXXX")" || exit 1, then name every path as "\${DIR:?}/<file>". Never write anywhere else, /tmp included.`,
  '- Your answer goes only through the structured output.',
].join('\n')

const itemPath = (id) => (ITEM_ROOT ? `${ITEM_ROOT}/${id}` : id)
const example = [...ITEMS][0]
const seedLine = SEEDS.length ? `Label each hypothesis with the seed id it extends (${SEEDS.join(', ')}) or NEW.` : 'Label each hypothesis NEW.'

function prospectPrompt(a, t, injection) {
  return [
    `You are consulted as the ${a} agent in a prospecting swarm. The question: ${QUESTION}`,
    CONTAINMENT,
    `Step 1. Read the brief: ${BRIEF}`,
    INDEX_FILE ? `Step 2. Read the index of citable items: ${INDEX_FILE}` : '',
    `Step 3. Your home territory is ${t}. Open each of its items:\n` + TERR[t].map((id) => `- ${itemPath(id)}`).join('\n'),
    'You may open any other item. A find outside your home territory counts for more.',
    ...EXTRA,
    FRAMING.split('{agent}').join(a),
    injection || '',
    `Return 1 to 3 hypotheses. Cite instances ONLY as item ids exactly as listed (for example ${example}). ${seedLine} In files_read, list the item ids you opened.`,
  ].filter(Boolean).join('\n\n')
}

const HYP_SCHEMA = {
  type: 'object',
  properties: {
    hypotheses: { type: 'array', minItems: 1, maxItems: 3, items: { type: 'object', properties: {
      seed: { type: 'string', enum: [...SEEDS, 'NEW'] },
      family: { type: 'string', description: 'a short name for the pattern' },
      mechanism: { type: 'string', description: 'one sentence: what recurs, and why' },
      instances: { type: 'array', items: { type: 'string' }, description: 'item ids, verbatim' },
      proposal: { type: 'string', description: 'what should be done about it, in what shape; or empty' },
      confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
      testable_prediction: { type: 'string', description: 'if this is right, then X is true of the corpus' },
      domain_reasoning: { type: 'string', description: 'two sentences at most' },
    }, required: ['seed', 'family', 'mechanism', 'instances', 'proposal', 'confidence', 'testable_prediction', 'domain_reasoning'] } },
    files_read: { type: 'array', items: { type: 'string' } },
  },
  required: ['hypotheses', 'files_read'],
}

// --- Citation filter: a cited id that is not an item is dropped in code, never trusted --------

const norm = (p) => {
  let s = String(p).trim().replace(/^`+|`+$/g, '')
  if (ITEM_ROOT && s.startsWith(`${ITEM_ROOT}/`)) s = s.slice(ITEM_ROOT.length + 1)
  return s
}
let cited = 0, dropped = 0

function clean(a, t, wave, r) {
  if (!r) return null
  const home = new Set(TERR[t])
  const hypotheses = (r.hypotheses || []).map((h) => {
    const all = (h.instances || []).map(norm)
    cited += all.length
    const valid = [...new Set(all.filter((id) => ITEMS.has(id)))]
    dropped += all.filter((id) => !ITEMS.has(id)).length
    return { ...h, instances: valid, outside_home: valid.filter((id) => !home.has(id)).length }
  })
  return { agent: a, territory: t, wave, hypotheses, files_read_valid: (r.files_read || []).map(norm).filter((id) => ITEMS.has(id)).length }
}

const terrCount = Object.fromEntries(TERR_KEYS.map((k) => [k, 0]))
async function prospect(a, t, wave, injection, ph) {
  terrCount[t]++
  const r = await agent(prospectPrompt(a, t, injection), { label: `${ph.toLowerCase().replace(/ /g, '-')}:${a}`, phase: ph, schema: HYP_SCHEMA, model: PROSPECTOR_MODEL, agentType: a })
  return clean(a, t, wave, r)
}

// --- Pilot ----------------------------------------------------------------------------------

phase('Pilot')
const pilot = await parallel(PILOT.map((p) => () => prospect(p.agent, p.territory, '1-2', '', 'Pilot')))
const pilotOk = pilot.every((p) => p && p.hypotheses.some((h) => h.instances.length > 0))
log(`pilot: ${pilot.map((p, i) => (p ? `${p.agent} ${p.hypotheses.length} hyp, ${p.hypotheses.reduce((s, h) => s + h.instances.length, 0)} valid ids, ${p.files_read_valid} items read` : `${PILOT[i].agent} returned nothing`)).join('; ')}; dropped ${dropped} of ${cited} cited ids`)
if (!pilotOk) log('pilot FAILED: a pilot agent returned nothing or cited no valid item; fix the brief or the territories before a full run')
if (MODE === 'pilot' || !pilotOk) return { mode: MODE, pilotOk, pilot, cited, dropped }

const results = [...pilot]
let tIdx = 0
const nextTerr = () => TERR_KEYS[tIdx++ % TERR_KEYS.length]

phase('Prospect')
const w12 = ROSTER.slice(0, 18).map((a) => ({ a, t: nextTerr() }))
results.push(...(await parallel(w12.map((x) => () => prospect(x.a, x.t, '1-2', '', 'Prospect')))))
log(`waves 1-2: ${results.filter(Boolean).length}/${results.length} returned; dropped ${dropped} of ${cited} cited ids`)

// --- Clustering -----------------------------------------------------------------------------

const CLUSTER_SCHEMA = {
  type: 'object',
  properties: {
    families: { type: 'array', items: { type: 'object', properties: {
      id: { type: 'string', description: 'a seed id for a seeded family; N1, N2 ... for new ones; an id keeps its meaning across rounds' },
      name: { type: 'string' },
      mechanism: { type: 'string' },
      agents: { type: 'array', items: { type: 'string' }, description: 'every agent who filed a hypothesis of this family' },
      instances: { type: 'array', items: { type: 'string' } },
      proposals: { type: 'string', description: 'a tally of what the agents proposed to do' },
      disagreements: { type: 'string' },
    }, required: ['id', 'name', 'mechanism', 'agents', 'instances', 'proposals', 'disagreements'] } },
    noise: { type: 'string', description: 'hypotheses that fit no family, or only restate the brief' },
  },
  required: ['families', 'noise'],
}

// Only what clustering needs. The cluster prompt carries every hypothesis so far, so it grows
// with each wave; the reasoning text stays in the journal.
const compact = () => results.filter(Boolean).map((r) => ({ agent: r.agent, territory: r.territory, wave: r.wave, hypotheses: r.hypotheses.map((h) => ({ seed: h.seed, family: h.family, mechanism: h.mechanism, instances: h.instances, proposal: h.proposal })) }))

async function cluster(prev, waveLabel) {
  const opts = { label: `cluster:${waveLabel}`, phase: 'Cluster', schema: CLUSTER_SCHEMA }
  if (CLUSTER_MODEL) opts.model = CLUSTER_MODEL
  const r = await agent([
    'You group the hypotheses of a prospecting swarm into families by MECHANISM, not by wording.',
    CONTAINMENT,
    `The question: ${QUESTION}. The brief: ${BRIEF}.${INDEX_FILE ? ` The index: ${INDEX_FILE}.` : ''} Open any item you need to judge whether two hypotheses share a mechanism.`,
    'Rules:',
    `- ${SEEDS.length ? `Seeded families keep the ids ${SEEDS.join(', ')}.` : 'There are no seeded families.'} New families get N1, N2 and so on. An id from a previous round keeps its meaning; never reuse a retired id for a different mechanism.`,
    '- A family is NEW only when it is none of the seeds. Agents labelled their hypotheses themselves; correct a wrong label.',
    '- Put a hypothesis that only restates the brief in noise, credited to no family.',
    prev ? `Families from the previous round (keep their ids): ${JSON.stringify(prev.families.map((f) => ({ id: f.id, name: f.name, mechanism: f.mechanism })))}` : '',
    `All hypotheses so far (instances are already filtered to real item ids): ${JSON.stringify(compact())}`,
  ].filter(Boolean).join('\n\n'), opts)
  if (!r) return prev
  for (const f of r.families) f.instances = [...new Set((f.instances || []).map(norm).filter((id) => ITEMS.has(id)))]
  return r
}

// New families are counted in code against the previous round's ids, not taken from the
// clusterer's own list. A family "counts" toward another wave only when MIN_NEW agents filed it.
function newFamilies(prev, c) {
  const seen = new Set((prev?.families || []).map((f) => f.id))
  const fresh = (c?.families || []).filter((f) => !seen.has(f.id) && !SEEDS.includes(f.id) && f.instances.length > 0)
  return { strong: fresh.filter((f) => new Set(f.agents).size >= MIN_NEW).map((f) => f.id), weak: fresh.filter((f) => new Set(f.agents).size < MIN_NEW).map((f) => f.id) }
}
const summary = (c) => (c?.families || []).map((f) => `- ${f.id} ${f.name}: ${new Set(f.agents).size} agents, ${f.instances.length} items; proposals: ${f.proposals}; disagreements: ${f.disagreements}`).join('\n')

const clusters = []
let c = await cluster(null, '1-2')
clusters.push(c)
let fresh = newFamilies(null, c)
log(`cluster 1-2: ${c?.families?.length ?? 0} families; new with >= ${MIN_NEW} agents: ${fresh.strong.join(', ') || 'none'}; new with fewer: ${fresh.weak.join(', ') || 'none'}`)

// --- Wave 3 and the adversary -----------------------------------------------------------------

const ADV_SCHEMA = {
  type: 'object',
  properties: {
    challenges: { type: 'array', items: { type: 'object', properties: {
      family_id: { type: 'string' },
      verdict: { type: 'string', enum: ['holds', 'weakened', 'refuted'] },
      strongest_counterargument: { type: 'string' },
      alternative_explanation: { type: 'string' },
      falsification_experiment: { type: 'string', description: 'a read-only check the lead can run' },
      better_home: { type: 'string', description: 'what should absorb it instead, or none' },
    }, required: ['family_id', 'verdict', 'strongest_counterargument', 'alternative_explanation', 'falsification_experiment', 'better_home'] } },
    missed_family: { type: 'string', description: 'a pattern the swarm missed, with item ids, or empty' },
  },
  required: ['challenges', 'missed_family'],
}
const adversaryPrompt = (families, which) => [
  `You are the adversarial pass over a prospecting swarm. The question: ${QUESTION}`,
  CONTAINMENT,
  `Read the brief (${BRIEF})${INDEX_FILE ? `, the index (${INDEX_FILE})` : ''} and every item you need.`,
  `${which}:\n${JSON.stringify(families)}`,
  'For each family: steelman it, then find the strongest counterargument.',
  '- Is it real recurrence, or one purpose met differently each time?',
  '- Is it the brief speaking back: a family the brief named, found by agents whose territory was built around it?',
  '- Should something that already exists absorb it?',
  'Give each a read-only falsification experiment.',
].join('\n\n')

phase('Challenge')
// The wave-3 adversary is shown the families of cluster 1-2; anything born later is unchallenged.
const challengedIds = new Set((c?.families || []).map((f) => f.id))
const inject3 = `Update from waves 1-2 (${results.filter(Boolean).length} agents). Families so far:\n${summary(c)}\n\nDo NOT restate these. Extend them: name items they missed, dispute a proposal with a reason, or find a NEW family. Every claim cites item ids.`
const w3 = ROSTER.slice(18, 28).map((a) => ({ a, t: nextTerr() }))
const [w3res, adv3] = await Promise.all([
  parallel(w3.map((x) => () => prospect(x.a, x.t, '3', inject3, 'Challenge'))),
  agent(adversaryPrompt(c?.families || [], `The families the first ${results.filter(Boolean).length} agents converged on`), { label: `challenge:${ADVERSARY}`, phase: 'Challenge', schema: ADV_SCHEMA, agentType: ADVERSARY }),
])
results.push(...w3res)
log(`wave 3: ${w3res.filter(Boolean).length}/${w3.length} returned; adversary ${adv3 ? 'returned' : 'returned nothing'}; dropped ${dropped} of ${cited} cited ids`)
let prev = c
c = await cluster(c, '3')
clusters.push(c)
fresh = newFamilies(prev, c)
log(`cluster 3: ${c?.families?.length ?? 0} families; new with >= ${MIN_NEW} agents: ${fresh.strong.join(', ') || 'none'}; new with fewer: ${fresh.weak.join(', ') || 'none'}`)

// --- Edge waves ---------------------------------------------------------------------------------

let start = 28, edgeWaves = 0, stopReason = 'roster-exhausted'
while (start < ROSTER.length) {
  if (fresh.strong.length === 0) { stopReason = 'no-new-family-with-independent-convergence'; break }
  if (edgeWaves >= MAX_EDGE) { stopReason = 'max-edge-waves'; break }
  phase('Edge')
  const waveLabel = String(4 + edgeWaves)
  // A remainder smaller than half a wave joins this one rather than running alone.
  const size = ROSTER.length - (start + EDGE_SIZE) < Math.ceil(EDGE_SIZE / 2) ? ROSTER.length - start : EDGE_SIZE
  const inject = `Update from earlier waves (${results.filter(Boolean).length} agents). Established families:\n${summary(c)}\n\nThese are established. Work the edges: items that break a family, a family that is really two, a proposal that would fail in use, and NEW families. Every claim cites item ids.`
  const w = ROSTER.slice(start, start + size).map((a) => ({ a, t: nextTerr() }))
  start += size; edgeWaves++
  results.push(...(await parallel(w.map((x) => () => prospect(x.a, x.t, waveLabel, inject, 'Edge')))))
  prev = c
  c = await cluster(c, waveLabel)
  clusters.push(c)
  fresh = newFamilies(prev, c)
  log(`wave ${waveLabel} (${w.length} agents): ${c?.families?.length ?? 0} families; new with >= ${MIN_NEW} agents: ${fresh.strong.join(', ') || 'none'}; new with fewer: ${fresh.weak.join(', ') || 'none'}`)
}
const notConsulted = ROSTER.slice(start)
log(`stopped: ${stopReason}; ${notConsulted.length} roster agents not consulted${notConsulted.length ? ` (${notConsulted.join(', ')})` : ''}`)

// --- Late challenge: families the wave-3 adversary never saw ------------------------------------

const late = (c?.families || []).filter((f) => !challengedIds.has(f.id) && f.instances.length > 0)
let advLate = null
if (late.length) {
  phase('Late challenge')
  advLate = await agent(adversaryPrompt(late, 'Families that first appeared after wave 3, which no adversary has seen'), { label: `late-challenge:${ADVERSARY}`, phase: 'Late challenge', schema: ADV_SCHEMA, agentType: ADVERSARY })
}

// --- Measured in code: convergence, outside-home finders, and the null model -------------------

const done = results.filter(Boolean)
const byAgent = new Map(done.map((r) => [r.agent, r]))
const familyStats = (c?.families || []).map((f) => {
  const agents = [...new Set(f.agents)]
  const own = new Set(f.instances)
  const outsideHome = agents.filter((a) => {
    const r = byAgent.get(a)
    if (!r) return false
    const home = new Set(TERR[r.territory])
    return r.hypotheses.some((h) => h.instances.some((id) => own.has(id) && !home.has(id)))
  }).length
  return { id: f.id, agents: agents.length, outsideHome, items: f.instances.length }
})
// Expected agents per family if N agents filing m hypotheses each picked uniformly among K
// families: N * (1 - (1 - 1/K)^m). K is post hoc (the cluster passes chose it), and seeded
// families were named in the brief, so treat a ratio as a screen, not a test.
const N = done.length
const m = N ? done.reduce((s, r) => s + r.hypotheses.length, 0) / N : 0
const K = (c?.families || []).length
const expected = K ? N * (1 - Math.pow(1 - 1 / K, m)) : 0
const nullModel = { N, m: Number(m.toFixed(2)), K, expectedAgentsPerFamily: Number(expected.toFixed(2)), signalAt3x: Number((3 * expected).toFixed(2)) }

// --- Synthesis ------------------------------------------------------------------------------

phase('Synthesize')
const SYN_SCHEMA = {
  type: 'object',
  properties: {
    ranking: { type: 'array', items: { type: 'object', properties: {
      rank: { type: 'number' },
      family_id: { type: 'string' },
      name: { type: 'string' },
      recommendation: { type: 'string' },
      instances: { type: 'array', items: { type: 'string' } },
      convergence: { type: 'string', description: 'agents, of whom outside home, against the null model' },
      adversarial_verdict: { type: 'string', description: 'the verdict, or "not challenged"' },
      testable_prediction: { type: 'string' },
      why_this_rank: { type: 'string' },
    }, required: ['rank', 'family_id', 'name', 'recommendation', 'instances', 'convergence', 'adversarial_verdict', 'testable_prediction', 'why_this_rank'] } },
    dropped_families: { type: 'array', items: { type: 'object', properties: { family_id: { type: 'string' }, reason: { type: 'string' } }, required: ['family_id', 'reason'] } },
    notes: { type: 'string', description: 'method, open conflicts for the user, and what you carried unverified' },
  },
  required: ['ranking', 'dropped_families', 'notes'],
}
const final = await agent([
  `Synthesize the final ranking from a prospecting swarm and its adversarial passes. The question: ${QUESTION}`,
  CONTAINMENT,
  `Brief: ${BRIEF}.${INDEX_FILE ? ` Index: ${INDEX_FILE}.` : ''}`,
  'Rank by evidence: distinct items, agents who found the family OUTSIDE their home territory, convergence against the null model below, and whether the adversarial verdict holds. Drop a refuted family unless the evidence answers the refutation. Say which claims you re-read and which you carried. Every instance must be an item id.',
  `Final families: ${JSON.stringify(c?.families || [])}`,
  `Measured in code: ${JSON.stringify({ familyStats, nullModel, terrCount, stopReason })}`,
  `Wave-3 adversary: ${JSON.stringify(adv3)}`,
  `Late adversary: ${JSON.stringify(advLate)}`,
].join('\n\n'), { label: 'synthesize', phase: 'Synthesize', schema: SYN_SCHEMA })
if (final) for (const r of final.ranking) r.instances = [...new Set((r.instances || []).map(norm).filter((id) => ITEMS.has(id)))]

return { mode: MODE, stopReason, consulted: done.length, attempted: results.length, edgeWaves, notConsulted, cited, dropped, terrCount, nullModel, familyStats, final, adversarial: { wave3: adv3, late: advLate }, clusters, results }
